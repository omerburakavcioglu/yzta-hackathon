from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date as DateType
from app.db import get_db
from app.auth_context import UserContext, get_user_context

router = APIRouter()


def require_admin(ctx: UserContext = Depends(get_user_context)) -> UserContext:
    if ctx.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return ctx


@router.get("/summary")
def admin_summary(ctx: UserContext = Depends(require_admin)):
    db = get_db()

    tenants = db.table("tenants").select("id").execute().data
    tenant_ids = [t["id"] for t in tenants]

    total_orders = db.table("orders").select("id", count="exact").execute().count or 0
    total_customers = db.table("customers").select("id", count="exact").execute().count or 0
    total_chat = db.table("chat_messages").select("id", count="exact").execute().count or 0

    critical_products = 0
    for tid in tenant_ids:
        products = db.table("products").select("stock_quantity,critical_threshold").eq("tenant_id", tid).execute().data
        critical_products += sum(1 for p in products if p["stock_quantity"] <= p["critical_threshold"])

    delayed_shipments = (
        db.table("shipments")
        .select("id", count="exact")
        .eq("delay_risk", True)
        .execute()
        .count or 0
    )

    return {
        "total_companies": len(tenant_ids),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_chat_messages": total_chat,
        "total_critical_products": critical_products,
        "total_delayed_shipments": delayed_shipments,
    }


@router.get("/tenants")
def admin_tenants(ctx: UserContext = Depends(require_admin)):
    db = get_db()
    tenants = db.table("tenants").select("*").execute().data

    result = []
    for tenant in tenants:
        tid = tenant["id"]

        order_count = db.table("orders").select("id", count="exact").eq("tenant_id", tid).execute().count or 0
        customer_count = db.table("customers").select("id", count="exact").eq("tenant_id", tid).execute().count or 0
        chat_count = db.table("chat_messages").select("id", count="exact").eq("tenant_id", tid).execute().count or 0

        products = db.table("products").select("stock_quantity,critical_threshold").eq("tenant_id", tid).execute().data
        critical_stock = sum(1 for p in products if p["stock_quantity"] <= p["critical_threshold"])

        orders = db.table("orders").select("id").eq("tenant_id", tid).execute().data
        order_ids = [o["id"] for o in orders]
        delayed_shipments = 0
        if order_ids:
            delayed_shipments = (
                db.table("shipments")
                .select("id", count="exact")
                .in_("order_id", order_ids)
                .eq("delay_risk", True)
                .execute()
                .count or 0
            )

        result.append({
            "tenant_id": tid,
            "company_name": tenant["name"],
            "sector": tenant["sector"],
            "order_count": order_count,
            "customer_count": customer_count,
            "critical_stock_count": critical_stock,
            "delayed_shipment_count": delayed_shipments,
            "chatbot_message_count": chat_count,
        })

    return result


@router.get("/tenants/{tenant_id}")
def admin_tenant_detail(tenant_id: str, ctx: UserContext = Depends(require_admin)):
    db = get_db()
    tenant = db.table("tenants").select("*").eq("id", tenant_id).single().execute().data
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    orders = db.table("orders").select("*").eq("tenant_id", tenant_id).order("order_date", desc=True).limit(10).execute().data
    products = db.table("products").select("*").eq("tenant_id", tenant_id).execute().data
    customers = db.table("customers").select("*").eq("tenant_id", tenant_id).execute().data

    critical_products = [p for p in products if p["stock_quantity"] <= p["critical_threshold"]]

    return {
        "tenant": tenant,
        "recent_orders": orders,
        "products": products,
        "critical_products": critical_products,
        "customers": customers,
    }


@router.get("/activity-logs")
def admin_activity_logs(ctx: UserContext = Depends(require_admin)):
    db = get_db()
    logs = (
        db.table("activity_logs")
        .select("*, tenants(name)")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
        .data
    )
    return logs


# ─── Order Management ────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    tenant_id: str
    customer_id: str
    public_order_no: str
    status: str
    total_amount: float
    order_date: DateType


class OrderUpdate(BaseModel):
    customer_id: Optional[str] = None
    public_order_no: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    order_date: Optional[DateType] = None


@router.get("/orders/meta")
def admin_orders_meta(ctx: UserContext = Depends(require_admin)):
    """Returns tenants and all customers — used to populate form dropdowns."""
    db = get_db()
    tenants = db.table("tenants").select("id, name, sector").execute().data
    customers = db.table("customers").select("id, tenant_id, full_name, email").execute().data
    return {"tenants": tenants, "customers": customers}


@router.get("/orders")
def admin_list_orders(
    tenant_id: Optional[str] = None,
    status: Optional[str] = None,
    ctx: UserContext = Depends(require_admin),
):
    db = get_db()
    query = db.table("orders").select(
        "*, tenants(name), customers(full_name, email)"
    ).order("order_date", desc=True)

    if tenant_id:
        query = query.eq("tenant_id", tenant_id)
    if status:
        query = query.eq("status", status)

    orders = query.execute().data

    # Flatten nested relations for convenience
    for o in orders:
        o["company_name"] = (o.pop("tenants") or {}).get("name", "—")
        o["customer_name"] = (o.pop("customers") or {}).get("full_name", "—")

    return orders


@router.post("/orders", status_code=201)
def admin_create_order(body: OrderCreate, ctx: UserContext = Depends(require_admin)):
    db = get_db()

    # Validate tenant exists
    tenant = db.table("tenants").select("id").eq("id", body.tenant_id).execute().data
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Validate customer belongs to tenant
    customer = (
        db.table("customers")
        .select("id")
        .eq("id", body.customer_id)
        .eq("tenant_id", body.tenant_id)
        .execute()
        .data
    )
    if not customer:
        raise HTTPException(status_code=400, detail="Customer does not belong to this company")

    order = db.table("orders").insert({
        "tenant_id": body.tenant_id,
        "customer_id": body.customer_id,
        "public_order_no": body.public_order_no,
        "status": body.status,
        "total_amount": body.total_amount,
        "order_date": body.order_date.isoformat(),
    }).execute().data[0]

    db.table("activity_logs").insert({
        "tenant_id": body.tenant_id,
        "actor_id": ctx.user_id,
        "action_type": "order_created",
        "description": f"Admin created order {body.public_order_no}.",
    }).execute()

    return order


@router.put("/orders/{order_id}")
def admin_update_order(order_id: str, body: OrderUpdate, ctx: UserContext = Depends(require_admin)):
    db = get_db()

    existing = db.table("orders").select("*").eq("id", order_id).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")

    updates = body.model_dump(exclude_none=True)
    if "order_date" in updates:
        updates["order_date"] = updates["order_date"].isoformat()

    updated = db.table("orders").update(updates).eq("id", order_id).execute().data[0]

    db.table("activity_logs").insert({
        "tenant_id": existing[0]["tenant_id"],
        "actor_id": ctx.user_id,
        "action_type": "order_updated",
        "description": f"Admin updated order {existing[0]['public_order_no']}.",
    }).execute()

    return updated


@router.delete("/orders/{order_id}", status_code=204)
def admin_delete_order(order_id: str, ctx: UserContext = Depends(require_admin)):
    db = get_db()

    existing = db.table("orders").select("*").eq("id", order_id).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")

    order = existing[0]

    # Cascade: delete shipments and order_items first
    db.table("shipments").delete().eq("order_id", order_id).execute()
    db.table("order_items").delete().eq("order_id", order_id).execute()
    db.table("orders").delete().eq("id", order_id).execute()

    db.table("activity_logs").insert({
        "tenant_id": order["tenant_id"],
        "actor_id": ctx.user_id,
        "action_type": "order_deleted",
        "description": f"Admin deleted order {order['public_order_no']}.",
    }).execute()
