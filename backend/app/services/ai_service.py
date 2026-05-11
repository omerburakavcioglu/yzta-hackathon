import json
import os
from pathlib import Path
from app.config import settings

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def _load_prompt(name: str) -> str:
    return (PROMPTS_DIR / name).read_text()


def _build_openai_client():
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def _call_llm(system_prompt: str, user_message: str) -> str:
    if settings.llm_provider == "openai" and settings.openai_api_key:
        client = _build_openai_client()
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=500,
            temperature=0.3,
        )
        return resp.choices[0].message.content.strip()

    # Fallback: rule-based summary when no LLM key is configured
    return _fallback_response(user_message)


def _fallback_response(message: str) -> str:
    return (
        "AI service is not configured. Please set OPENAI_API_KEY in your .env file. "
        "Your message was: " + message[:200]
    )


async def generate_operation_summary(context: dict) -> str:
    system_prompt = _load_prompt("company_assistant.txt")

    today_count = len(context.get("today_orders", []))
    preparing_count = len(context.get("preparing_orders", []))
    critical_count = len(context.get("critical_products", []))
    delayed_count = len(context.get("delayed_shipments", []))

    critical_names = [p["name"] for p in context.get("critical_products", [])]
    forecast = context.get("forecast", [])
    at_risk = [f for f in forecast if f.get("stock_risk")]

    user_message = f"""Generate a daily operations summary based on this data:

- Orders placed today: {today_count}
- Orders in "preparing" status: {preparing_count}
- Critical stock products ({critical_count}): {', '.join(critical_names) if critical_names else 'None'}
- Delayed shipments: {delayed_count}
- Products at stock risk (will run out in 7 days): {json.dumps(at_risk, ensure_ascii=False)}

Provide a concise summary with 2-4 recommended actions."""

    return await _call_llm(system_prompt, user_message)


async def company_chat(message: str, context: dict) -> str:
    system_prompt = _load_prompt("company_assistant.txt")

    orders_summary = []
    for o in context.get("orders", [])[:20]:
        orders_summary.append(f"Order {o['public_order_no']}: status={o['status']}, amount={o['total_amount']}, date={o['order_date']}")

    products_summary = []
    for p in context.get("products", []):
        products_summary.append(f"{p['name']}: stock={p['stock_quantity']}, threshold={p['critical_threshold']}, price={p['unit_price']}")

    delayed_summary = []
    for s in context.get("delayed_shipments", []):
        delayed_summary.append(f"Shipment {s['tracking_no']} for order_id={s['order_id']}: carrier={s['carrier']}, status={s['shipment_status']}, est_delivery={s['estimated_delivery']}")

    forecast_summary = [
        f"{f['product_name']}: avg_daily={f['average_daily_sales']}, days_until_stockout={f['days_until_stockout']}, stock_risk={f['stock_risk']}"
        for f in context.get("forecast", [])
    ]

    context_text = f"""COMPANY DATA:
Orders (latest 20):
{chr(10).join(orders_summary) or 'No orders.'}

Products & Inventory:
{chr(10).join(products_summary) or 'No products.'}

Delayed Shipments:
{chr(10).join(delayed_summary) or 'None.'}

7-Day Forecast:
{chr(10).join(forecast_summary) or 'No forecast data.'}

User question: {message}"""

    return await _call_llm(system_prompt, context_text)


async def customer_chat(message: str, context: dict) -> str:
    system_prompt = _load_prompt("customer_assistant.txt")

    orders_text = []
    for o in context.get("orders", []):
        shipment = o.get("shipment")
        items = o.get("items", [])
        item_names = ", ".join(
            f"{i['quantity']}x {i.get('products', {}).get('name', 'item')}" for i in items
        )
        ship_text = ""
        if shipment:
            ship_text = (
                f"  Shipment: carrier={shipment['carrier']}, tracking={shipment['tracking_no']}, "
                f"status={shipment['shipment_status']}, est_delivery={shipment['estimated_delivery']}, "
                f"delay_risk={shipment['delay_risk']}"
            )
        orders_text.append(
            f"Order {o['public_order_no']}: status={o['status']}, date={o['order_date']}, amount={o['total_amount']}\n"
            f"  Items: {item_names or 'N/A'}\n{ship_text}"
        )

    products_text = [
        f"{p['name']}: {'in stock' if p['stock_quantity'] > p['critical_threshold'] else 'low stock'} ({p['stock_quantity']} units)"
        for p in context.get("products", [])
    ]

    context_text = f"""CUSTOMER ORDERS:
{chr(10).join(orders_text) or 'No orders found for this customer.'}

PRODUCT AVAILABILITY:
{chr(10).join(products_text) or 'No product data.'}

Customer question: {message}"""

    return await _call_llm(system_prompt, context_text)
