from datetime import date as DateType
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_db
from app.auth_context import UserContext, get_user_context
from app.services import ai_service, forecast_service

router = APIRouter()


def require_company(ctx: UserContext = Depends(get_user_context)) -> UserContext:
    if ctx.role != "company":
        raise HTTPException(status_code=403, detail="Company access required")
    return ctx


@router.get("/dashboard")
def company_dashboard(ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    from datetime import date
    today = date.today().isoformat()

    orders = db.table("orders").select("*").eq("tenant_id", tid).execute().data

    today_orders = [o for o in orders if o["order_date"] == today]
    pending = [o for o in orders if o["status"] == "preparing"]
    packed = [o for o in orders if o["status"] == "packed"]
    shipped = [o for o in orders if o["status"] == "shipped"]
    delayed = [o for o in orders if o["status"] == "delayed"]

    products = db.table("products").select("*").eq("tenant_id", tid).execute().data
    critical_products = [p for p in products if p["stock_quantity"] <= p["critical_threshold"]]

    order_ids = [o["id"] for o in orders]
    delayed_shipments = []
    if order_ids:
        delayed_shipments = (
            db.table("shipments")
            .select("*, orders(public_order_no, customer_id, status)")
            .in_("order_id", order_ids)
            .eq("delay_risk", True)
            .execute()
            .data
        )

    recent_orders = sorted(orders, key=lambda x: x["order_date"], reverse=True)[:8]

    # Enrich recent orders with customer name
    customers = {
        c["id"]: c for c in db.table("customers").select("id,full_name,email").eq("tenant_id", tid).execute().data
    }
    for o in recent_orders:
        o["customer_name"] = customers.get(o["customer_id"], {}).get("full_name", "Unknown")

    sales_data = forecast_service.get_top_selling_products(tid)

    return {
        "today_order_count": len(today_orders),
        "pending_order_count": len(pending),
        "packed_order_count": len(packed),
        "shipped_order_count": len(shipped),
        "delayed_order_count": len(delayed),
        "critical_stock_count": len(critical_products),
        "delayed_shipment_count": len(delayed_shipments),
        "top_selling_products": sales_data[:3],
        "recent_orders": recent_orders,
        "critical_products": critical_products,
    }


@router.get("/monthly-reports")
def company_monthly_reports(ctx: UserContext = Depends(require_company)):
    # Simulated monthly reports
    return [
        {"id": "rep_1", "month": "Nisan 2026", "url": "#", "date": "2026-04-30"},
        {"id": "rep_2", "month": "Mart 2026", "url": "#", "date": "2026-03-31"},
        {"id": "rep_3", "month": "Şubat 2026", "url": "#", "date": "2026-02-28"},
    ]


@router.get("/monthly-reports/{report_id}")
def company_monthly_report_detail(report_id: str, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    
    # Map report IDs to months
    month_map = {
        "rep_1": ("2026-04", "Nisan 2026"),
        "rep_2": ("2026-03", "Mart 2026"),
        "rep_3": ("2026-02", "Şubat 2026"),
    }
    
    if report_id not in month_map:
        raise HTTPException(status_code=404, detail="Report not found")
    
    month_prefix, month_name = month_map[report_id]
    
    # Fetch orders for this month
    all_orders = db.table("orders").select("*").eq("tenant_id", tid).execute().data
    month_orders = [o for o in all_orders if o["order_date"].startswith(month_prefix)]
    
    # Calculate statistics
    total_orders = len(month_orders)
    total_revenue = sum(o.get("total_amount", 0) for o in month_orders)
    
    status_counts = {}
    daily_sales = {}
    for order in month_orders:
        status = order.get("status", "unknown")
        status_counts[status] = status_counts.get(status, 0) + 1
        
        date_key = order.get("order_date", "")
        daily_sales[date_key] = daily_sales.get(date_key, 0) + float(order.get("total_amount", 0))
    
    # Get customers for order details
    customers = {
        c["id"]: c for c in db.table("customers").select("id,full_name").eq("tenant_id", tid).execute().data
    }
    
    for order in month_orders:
        order["customer_name"] = customers.get(order["customer_id"], {}).get("full_name", "Unknown")
    
    # Get top products
    top_products = forecast_service.get_top_selling_products(tid)[:5]
    
    # Get critical inventory
    products = db.table("products").select("*").eq("tenant_id", tid).execute().data
    critical_products = [p for p in products if p["stock_quantity"] <= p["critical_threshold"]]
    
    # Sort daily sales by date
    daily_sales_list = [{"date": d, "revenue": daily_sales[d]} for d in sorted(daily_sales.keys())]
    
    return {
        "report_id": report_id,
        "month": month_name,
        "month_prefix": month_prefix,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "status_distribution": status_counts,
        "daily_sales": daily_sales_list,
        "orders_list": month_orders[:50],  # Limit to 50 for display
        "top_products": top_products,
        "critical_inventory": critical_products,
        "generated_at": str(DateType.today()),
    }


@router.get("/operation-summary")
async def company_operation_summary(ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    from datetime import date
    today = date.today().isoformat()

    orders = db.table("orders").select("*").eq("tenant_id", tid).execute().data
    products = db.table("products").select("*").eq("tenant_id", tid).execute().data
    critical_products = [p for p in products if p["stock_quantity"] <= p["critical_threshold"]]

    order_ids = [o["id"] for o in orders]
    delayed_shipments = []
    if order_ids:
        delayed_shipments = (
            db.table("shipments")
            .select("*")
            .in_("order_id", order_ids)
            .eq("delay_risk", True)
            .execute()
            .data
        )

    forecast = forecast_service.compute_forecast(tid)

    context = {
        "today_orders": [o for o in orders if o["order_date"] == today],
        "preparing_orders": [o for o in orders if o["status"] == "preparing"],
        "critical_products": critical_products,
        "delayed_shipments": delayed_shipments,
        "forecast": forecast,
    }

    summary = await ai_service.generate_operation_summary(context)

    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": None,
        "action_type": "operation_summary",
        "description": f"Daily operation summary generated.",
    }).execute()

    return {"summary": summary}


@router.get("/orders")
def company_orders(ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id

    orders = (
        db.table("orders")
        .select("*")
        .eq("tenant_id", tid)
        .order("order_date", desc=True)
        .execute()
        .data
    )

    customers = {
        c["id"]: c for c in db.table("customers").select("id,full_name,email").eq("tenant_id", tid).execute().data
    }
    for o in orders:
        o["customer_name"] = customers.get(o["customer_id"], {}).get("full_name", "Unknown")

    return orders


@router.get("/inventory")
def company_inventory(ctx: UserContext = Depends(require_company)):
    db = get_db()
    return db.table("products").select("*").eq("tenant_id", ctx.tenant_id).execute().data


@router.get("/inventory/critical")
def company_critical_inventory(ctx: UserContext = Depends(require_company)):
    db = get_db()
    products = db.table("products").select("*").eq("tenant_id", ctx.tenant_id).execute().data
    return [p for p in products if p["stock_quantity"] <= p["critical_threshold"]]


class CompanyProductCreate(BaseModel):
    name: str
    category: str
    stock_quantity: int = 0
    critical_threshold: int = 10
    unit_price: float


class CompanyProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None
    critical_threshold: Optional[int] = None
    unit_price: Optional[float] = None


@router.post("/inventory")
def create_company_product(body: CompanyProductCreate, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    row = {
        "tenant_id": tid,
        "name": body.name,
        "category": body.category,
        "stock_quantity": body.stock_quantity,
        "critical_threshold": body.critical_threshold,
        "unit_price": body.unit_price,
    }
    result = db.table("products").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create product")
    product = result.data[0]
    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": ctx.user_id,
        "action_type": "product_created",
        "description": f"Product {product['name']} created.",
    }).execute()
    return product


@router.put("/inventory/{product_id}")
def update_company_product(product_id: str, body: CompanyProductUpdate, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    existing = db.table("products").select("id,name").eq("id", product_id).eq("tenant_id", tid).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if not updates:
        return existing[0]
    result = db.table("products").update(updates).eq("id", product_id).execute()
    product = result.data[0] if result.data else {}
    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": ctx.user_id,
        "action_type": "product_updated",
        "description": f"Product {existing[0]['name']} updated.",
    }).execute()
    return product


@router.delete("/inventory/{product_id}")
def delete_company_product(product_id: str, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    existing = db.table("products").select("id,name").eq("id", product_id).eq("tenant_id", tid).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    name = existing[0]["name"]
    # Block delete if product is referenced by order items.
    refs = db.table("order_items").select("id").eq("product_id", product_id).limit(1).execute().data
    if refs:
        raise HTTPException(status_code=409, detail="Product is referenced by existing orders")
    db.table("products").delete().eq("id", product_id).execute()
    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": ctx.user_id,
        "action_type": "product_deleted",
        "description": f"Product {name} deleted.",
    }).execute()


@router.get("/shipments/delayed")
def company_delayed_shipments(ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    orders = db.table("orders").select("id,public_order_no,customer_id,status").eq("tenant_id", tid).execute().data
    order_ids = [o["id"] for o in orders]
    if not order_ids:
        return []

    shipments = (
        db.table("shipments")
        .select("*")
        .in_("order_id", order_ids)
        .eq("delay_risk", True)
        .execute()
        .data
    )

    order_map = {o["id"]: o for o in orders}
    customers = {
        c["id"]: c for c in db.table("customers").select("id,full_name").eq("tenant_id", tid).execute().data
    }
    for s in shipments:
        order = order_map.get(s["order_id"], {})
        s["public_order_no"] = order.get("public_order_no")
        s["customer_name"] = customers.get(order.get("customer_id", ""), {}).get("full_name", "Unknown")

    return shipments


@router.get("/forecast")
def company_forecast(ctx: UserContext = Depends(require_company)):
    return forecast_service.compute_forecast(ctx.tenant_id)


@router.get("/customers")
def company_customers(ctx: UserContext = Depends(require_company)):
    db = get_db()
    return db.table("customers").select("id,full_name,email").eq("tenant_id", ctx.tenant_id).execute().data


class CompanyOrderCreate(BaseModel):
    customer_id: str
    public_order_no: str
    status: str
    total_amount: float
    order_date: DateType


class CompanyOrderUpdate(BaseModel):
    customer_id: Optional[str] = None
    public_order_no: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    order_date: Optional[DateType] = None


@router.post("/orders")
def create_company_order(body: CompanyOrderCreate, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    row = {
        "tenant_id": tid,
        "customer_id": body.customer_id,
        "public_order_no": body.public_order_no,
        "status": body.status,
        "total_amount": body.total_amount,
        "order_date": body.order_date.isoformat(),
    }
    result = db.table("orders").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create order")
    order = result.data[0]
    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": ctx.user_id,
        "action_type": "order_created",
        "description": f"Order {order['public_order_no']} created.",
    }).execute()
    return order


@router.put("/orders/{order_id}")
def update_company_order(order_id: str, body: CompanyOrderUpdate, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    existing = db.table("orders").select("id").eq("id", order_id).eq("tenant_id", tid).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if "order_date" in updates:
        updates["order_date"] = updates["order_date"].isoformat()
    result = db.table("orders").update(updates).eq("id", order_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/orders/{order_id}")
def delete_company_order(order_id: str, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id
    existing = db.table("orders").select("id,public_order_no").eq("id", order_id).eq("tenant_id", tid).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    order_no = existing[0]["public_order_no"]
    db.table("shipments").delete().eq("order_id", order_id).execute()
    db.table("order_items").delete().eq("order_id", order_id).execute()
    db.table("orders").delete().eq("id", order_id).execute()
    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": ctx.user_id,
        "action_type": "order_deleted",
        "description": f"Order {order_no} deleted.",
    }).execute()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def company_chat(body: ChatRequest, ctx: UserContext = Depends(require_company)):
    db = get_db()
    tid = ctx.tenant_id

    # Gather context
    orders = db.table("orders").select("*").eq("tenant_id", tid).execute().data
    products = db.table("products").select("*").eq("tenant_id", tid).execute().data
    order_ids = [o["id"] for o in orders]
    delayed_shipments = []
    if order_ids:
        delayed_shipments = (
            db.table("shipments")
            .select("*")
            .in_("order_id", order_ids)
            .eq("delay_risk", True)
            .execute()
            .data
        )
    forecast = forecast_service.compute_forecast(tid)

    context = {
        "orders": orders,
        "products": products,
        "delayed_shipments": delayed_shipments,
        "forecast": forecast,
    }

    answer = await ai_service.company_chat(body.message, context)

    db.table("chat_messages").insert({
        "tenant_id": tid,
        "user_id": ctx.user_id,
        "role": "user",
        "channel": "company",
        "message": body.message,
    }).execute()
    db.table("chat_messages").insert({
        "tenant_id": tid,
        "user_id": ctx.user_id,
        "role": "assistant",
        "channel": "company",
        "message": answer,
    }).execute()

    return {"answer": answer}
