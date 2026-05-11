from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_db
from app.auth_context import UserContext, get_user_context
from app.services import ai_service

router = APIRouter()


def require_customer(ctx: UserContext = Depends(get_user_context)) -> UserContext:
    if ctx.role != "customer":
        raise HTTPException(status_code=403, detail="Customer access required")
    return ctx


@router.get("/orders")
def customer_orders(ctx: UserContext = Depends(require_customer)):
    db = get_db()
    cid = ctx.customer_id
    tid = ctx.tenant_id

    orders = (
        db.table("orders")
        .select("*")
        .eq("tenant_id", tid)
        .eq("customer_id", cid)
        .order("order_date", desc=True)
        .execute()
        .data
    )

    order_ids = [o["id"] for o in orders]
    shipments = {}
    if order_ids:
        for s in (
            db.table("shipments")
            .select("*")
            .in_("order_id", order_ids)
            .execute()
            .data
        ):
            shipments[s["order_id"]] = s

    for o in orders:
        o["shipment"] = shipments.get(o["id"])

    return orders


@router.get("/orders/{order_id}")
def customer_order_detail(order_id: str, ctx: UserContext = Depends(require_customer)):
    db = get_db()
    cid = ctx.customer_id
    tid = ctx.tenant_id

    order = (
        db.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("tenant_id", tid)
        .eq("customer_id", cid)
        .execute()
        .data
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order[0]

    items = (
        db.table("order_items")
        .select("*, products(name, category)")
        .eq("order_id", order_id)
        .execute()
        .data
    )

    shipment = (
        db.table("shipments")
        .select("*")
        .eq("order_id", order_id)
        .execute()
        .data
    )

    order["items"] = items
    order["shipment"] = shipment[0] if shipment else None

    return order


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def customer_chat(body: ChatRequest, ctx: UserContext = Depends(require_customer)):
    db = get_db()
    cid = ctx.customer_id
    tid = ctx.tenant_id

    orders = (
        db.table("orders")
        .select("*")
        .eq("tenant_id", tid)
        .eq("customer_id", cid)
        .execute()
        .data
    )

    order_ids = [o["id"] for o in orders]
    shipments = []
    items_by_order: dict = {}
    if order_ids:
        shipments = (
            db.table("shipments")
            .select("*")
            .in_("order_id", order_ids)
            .execute()
            .data
        )
        all_items = (
            db.table("order_items")
            .select("*, products(name)")
            .in_("order_id", order_ids)
            .execute()
            .data
        )
        for item in all_items:
            items_by_order.setdefault(item["order_id"], []).append(item)

    # Enrich orders with shipment and items for context
    enriched_orders = []
    shipment_map = {s["order_id"]: s for s in shipments}
    for o in orders:
        enriched_orders.append({
            **o,
            "shipment": shipment_map.get(o["id"]),
            "items": items_by_order.get(o["id"], []),
        })

    # Product availability for current tenant (for stock questions)
    products = db.table("products").select("name,stock_quantity,critical_threshold").eq("tenant_id", tid).execute().data

    context = {"orders": enriched_orders, "products": products}
    answer = await ai_service.customer_chat(body.message, context)

    db.table("chat_messages").insert({
        "tenant_id": tid,
        "user_id": ctx.user_id,
        "role": "user",
        "channel": "customer",
        "message": body.message,
    }).execute()
    db.table("chat_messages").insert({
        "tenant_id": tid,
        "user_id": ctx.user_id,
        "role": "assistant",
        "channel": "customer",
        "message": answer,
    }).execute()

    db.table("activity_logs").insert({
        "tenant_id": tid,
        "actor_id": ctx.user_id,
        "action_type": "chatbot_message",
        "description": f"Customer asked the chatbot.",
    }).execute()

    return {"answer": answer}
