"""
Public storefront API for Ege Olive Oil (and future tenants).

Unlike admin/company/customer routers, these endpoints do NOT use header-based
demo auth. Instead, the storefront passes `customer_id` directly in query/body
for logged-in actions, and uses no auth for guest checkout or public browsing.

Password hashing: hashlib sha256 with per-user salt. Hackathon-grade, not for
production. Format stored in customers.password_hash:  "<salt_hex>$<sha256_hex>"
"""
from __future__ import annotations

import hashlib
import re
import secrets
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.db import get_db
from app.services import ai_service

router = APIRouter()

# Hardcoded tenant for the Ege storefront. Future stores get their own routers
# or a dynamic /storefront/{slug} layer.
EGE_TENANT_ID = "11111111-0000-0000-0000-000000000001"
EGE_TENANT_NAME = "Ege Zeytinyağı"


# ─────────────────────────────────────────────
# Password helpers
# ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored or "$" not in stored:
        return False
    salt, digest = stored.split("$", 1)
    return hashlib.sha256((salt + password).encode()).hexdigest() == digest


def public_customer(c: dict) -> dict:
    return {
        "id": c["id"],
        "full_name": c["full_name"],
        "email": c["email"],
        "phone": c.get("phone"),
        "address": c.get("address"),
    }


def generate_order_no(db) -> str:
    # Find highest ORD-### for Ege, increment.
    rows = (
        db.table("orders")
        .select("public_order_no")
        .eq("tenant_id", EGE_TENANT_ID)
        .execute()
        .data
    )
    max_n = 100
    for r in rows:
        m = re.match(r"ORD-(\d+)", r.get("public_order_no") or "")
        if m:
            max_n = max(max_n, int(m.group(1)))
    return f"ORD-{max_n + 1}"


# ─────────────────────────────────────────────
# Products (public)
# ─────────────────────────────────────────────
@router.get("/products")
def list_products():
    db = get_db()
    products = (
        db.table("products")
        .select("*")
        .eq("tenant_id", EGE_TENANT_ID)
        .order("name")
        .execute()
        .data
    )
    return products


@router.get("/products/{product_id}")
def get_product(product_id: str):
    db = get_db()
    rows = (
        db.table("products")
        .select("*")
        .eq("id", product_id)
        .eq("tenant_id", EGE_TENANT_ID)
        .execute()
        .data
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Product not found")
    return rows[0]


# ─────────────────────────────────────────────
# Auth: signup / login / me
# ─────────────────────────────────────────────
class SignupBody(BaseModel):
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None


class LoginBody(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(body: SignupBody):
    db = get_db()
    existing = (
        db.table("customers")
        .select("id")
        .eq("tenant_id", EGE_TENANT_ID)
        .eq("email", body.email)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı.")

    row = {
        "tenant_id": EGE_TENANT_ID,
        "full_name": body.full_name,
        "email": body.email,
        "phone": body.phone,
        "address": body.address,
        "password_hash": hash_password(body.password),
    }
    result = db.table("customers").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Kayıt oluşturulamadı.")
    customer = result.data[0]

    db.table("activity_logs").insert({
        "tenant_id": EGE_TENANT_ID,
        "actor_id": customer["id"],
        "action_type": "customer_signup",
        "description": f"New storefront customer signed up: {customer['email']}",
    }).execute()

    return public_customer(customer)


@router.post("/login")
def login(body: LoginBody):
    db = get_db()
    rows = (
        db.table("customers")
        .select("*")
        .eq("tenant_id", EGE_TENANT_ID)
        .eq("email", body.email)
        .execute()
        .data
    )
    if not rows or not verify_password(body.password, rows[0].get("password_hash")):
        raise HTTPException(status_code=401, detail="E-posta veya parola hatalı.")
    return public_customer(rows[0])


@router.get("/me")
def me(customer_id: str = Query(...)):
    db = get_db()
    rows = (
        db.table("customers")
        .select("*")
        .eq("id", customer_id)
        .eq("tenant_id", EGE_TENANT_ID)
        .execute()
        .data
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Customer not found")
    return public_customer(rows[0])


# ─────────────────────────────────────────────
# Orders
# ─────────────────────────────────────────────
class OrderItemIn(BaseModel):
    product_id: str
    quantity: int


class GuestInfo(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class CreateOrderBody(BaseModel):
    items: List[OrderItemIn]
    customer_id: Optional[str] = None
    guest: Optional[GuestInfo] = None


@router.post("/orders")
def create_order(body: CreateOrderBody):
    if not body.items:
        raise HTTPException(status_code=400, detail="Sepet boş.")

    db = get_db()

    # Resolve customer (existing or guest)
    is_guest = False
    if body.customer_id:
        cust_rows = (
            db.table("customers")
            .select("*")
            .eq("id", body.customer_id)
            .eq("tenant_id", EGE_TENANT_ID)
            .execute()
            .data
        )
        if not cust_rows:
            raise HTTPException(status_code=404, detail="Hesap bulunamadı.")
        customer = cust_rows[0]
    elif body.guest:
        is_guest = True
        guest_row = {
            "tenant_id": EGE_TENANT_ID,
            "full_name": body.guest.full_name,
            "email": body.guest.email,
            "phone": body.guest.phone,
            "address": body.guest.address,
        }
        result = db.table("customers").insert(guest_row).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Misafir kaydı oluşturulamadı.")
        customer = result.data[0]
    else:
        raise HTTPException(status_code=400, detail="customer_id veya guest bilgisi gerekli.")

    # Fetch products to compute total + validate stock
    product_ids = [i.product_id for i in body.items]
    products = (
        db.table("products")
        .select("*")
        .in_("id", product_ids)
        .eq("tenant_id", EGE_TENANT_ID)
        .execute()
        .data
    )
    product_map = {p["id"]: p for p in products}
    for item in body.items:
        if item.product_id not in product_map:
            raise HTTPException(status_code=400, detail=f"Ürün bulunamadı: {item.product_id}")
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Geçersiz adet.")
        if product_map[item.product_id]["stock_quantity"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"{product_map[item.product_id]['name']} için yeterli stok yok.")

    total = sum(float(product_map[i.product_id]["unit_price"]) * i.quantity for i in body.items)
    order_no = generate_order_no(db)

    order_row = {
        "tenant_id": EGE_TENANT_ID,
        "customer_id": customer["id"],
        "public_order_no": order_no,
        "status": "preparing",
        "total_amount": round(total, 2),
        "order_date": date.today().isoformat(),
        "is_guest": is_guest,
    }
    order_result = db.table("orders").insert(order_row).execute()
    if not order_result.data:
        raise HTTPException(status_code=500, detail="Sipariş oluşturulamadı.")
    order = order_result.data[0]

    # Items + decrement stock
    item_rows = []
    for i in body.items:
        p = product_map[i.product_id]
        item_rows.append({
            "order_id": order["id"],
            "product_id": i.product_id,
            "quantity": i.quantity,
            "unit_price": p["unit_price"],
        })
        db.table("products").update(
            {"stock_quantity": p["stock_quantity"] - i.quantity}
        ).eq("id", i.product_id).execute()
    db.table("order_items").insert(item_rows).execute()

    # Mock shipment in 'waiting' state
    db.table("shipments").insert({
        "order_id": order["id"],
        "carrier": "Aras Kargo",
        "tracking_no": f"TRK{secrets.randbelow(900000) + 100000}",
        "shipment_status": "waiting",
        "estimated_delivery": None,
        "delay_risk": False,
    }).execute()

    db.table("activity_logs").insert({
        "tenant_id": EGE_TENANT_ID,
        "actor_id": customer["id"],
        "action_type": "order_created",
        "description": f"Storefront order {order_no} placed by {customer['email']}.",
    }).execute()

    return {
        "order": order,
        "customer": public_customer(customer),
        "items": item_rows,
    }


@router.get("/orders")
def list_customer_orders(customer_id: str = Query(...)):
    db = get_db()
    orders = (
        db.table("orders")
        .select("*")
        .eq("tenant_id", EGE_TENANT_ID)
        .eq("customer_id", customer_id)
        .order("order_date", desc=True)
        .execute()
        .data
    )
    order_ids = [o["id"] for o in orders]
    shipments_map: dict = {}
    if order_ids:
        for s in db.table("shipments").select("*").in_("order_id", order_ids).execute().data:
            shipments_map[s["order_id"]] = s
    for o in orders:
        o["shipment"] = shipments_map.get(o["id"])
    return orders


@router.get("/orders/{order_id}")
def get_order_detail(order_id: str, customer_id: Optional[str] = None):
    db = get_db()
    q = db.table("orders").select("*").eq("id", order_id).eq("tenant_id", EGE_TENANT_ID)
    if customer_id:
        q = q.eq("customer_id", customer_id)
    rows = q.execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    order = rows[0]

    items = (
        db.table("order_items")
        .select("*, products(name, category)")
        .eq("order_id", order_id)
        .execute()
        .data
    )
    shipments = (
        db.table("shipments").select("*").eq("order_id", order_id).execute().data
    )
    order["items"] = items
    order["shipment"] = shipments[0] if shipments else None
    return order


# Lookup by public order number (e.g. for guest tracking via chatbot)
@router.get("/track/{order_no}")
def track_order(order_no: str):
    db = get_db()
    rows = (
        db.table("orders")
        .select("*")
        .eq("public_order_no", order_no)
        .eq("tenant_id", EGE_TENANT_ID)
        .execute()
        .data
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    return get_order_detail(rows[0]["id"])


# ─────────────────────────────────────────────
# AI Chatbot
# ─────────────────────────────────────────────
class StorefrontChatBody(BaseModel):
    message: str
    customer_id: Optional[str] = None


@router.post("/chat")
async def storefront_chat(body: StorefrontChatBody):
    db = get_db()
    msg = body.message

    # Always include product list with stock
    products = (
        db.table("products")
        .select("name,category,stock_quantity,critical_threshold,unit_price")
        .eq("tenant_id", EGE_TENANT_ID)
        .execute()
        .data
    )

    enriched_orders: list[dict] = []
    customer_info: dict | None = None

    # If logged in, pull their orders
    if body.customer_id:
        cust_rows = (
            db.table("customers")
            .select("*")
            .eq("id", body.customer_id)
            .eq("tenant_id", EGE_TENANT_ID)
            .execute()
            .data
        )
        if cust_rows:
            customer_info = cust_rows[0]
            orders = (
                db.table("orders")
                .select("*")
                .eq("tenant_id", EGE_TENANT_ID)
                .eq("customer_id", body.customer_id)
                .order("order_date", desc=True)
                .limit(10)
                .execute()
                .data
            )
            order_ids = [o["id"] for o in orders]
            shipments_map: dict = {}
            items_by_order: dict = {}
            if order_ids:
                for s in db.table("shipments").select("*").in_("order_id", order_ids).execute().data:
                    shipments_map[s["order_id"]] = s
                for it in db.table("order_items").select("*, products(name)").in_("order_id", order_ids).execute().data:
                    items_by_order.setdefault(it["order_id"], []).append(it)
            for o in orders:
                enriched_orders.append({
                    **o,
                    "shipment": shipments_map.get(o["id"]),
                    "items": items_by_order.get(o["id"], []),
                })

    # Look for order numbers mentioned in the message (ORD-XXX)
    mentioned_orders = re.findall(r"ORD-\d+", msg, re.IGNORECASE)
    for ono in {x.upper() for x in mentioned_orders}:
        rows = (
            db.table("orders")
            .select("*")
            .eq("public_order_no", ono)
            .eq("tenant_id", EGE_TENANT_ID)
            .execute()
            .data
        )
        if not rows:
            continue
        o = rows[0]
        # Skip if already included
        if any(eo["id"] == o["id"] for eo in enriched_orders):
            continue
        items = (
            db.table("order_items").select("*, products(name)").eq("order_id", o["id"]).execute().data
        )
        ship = db.table("shipments").select("*").eq("order_id", o["id"]).execute().data
        enriched_orders.append({**o, "items": items, "shipment": ship[0] if ship else None})

    context = {
        "orders": enriched_orders,
        "products": products,
        "customer": customer_info,
    }
    answer = await ai_service.customer_chat(msg, context)

    actor_id = body.customer_id or customer_info.get("id") if customer_info else None
    if actor_id:
        db.table("chat_messages").insert({
            "tenant_id": EGE_TENANT_ID,
            "user_id": actor_id,
            "role": "user",
            "channel": "customer",
            "message": msg,
        }).execute()
        db.table("chat_messages").insert({
            "tenant_id": EGE_TENANT_ID,
            "user_id": actor_id,
            "role": "assistant",
            "channel": "customer",
            "message": answer,
        }).execute()

    return {"answer": answer}
