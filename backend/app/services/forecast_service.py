from app.db import get_db
from datetime import date, timedelta


def get_top_selling_products(tenant_id: str, days: int = 7) -> list[dict]:
    db = get_db()
    cutoff = (date.today() - timedelta(days=days)).isoformat()

    history = (
        db.table("sales_history")
        .select("product_id, units_sold")
        .eq("tenant_id", tenant_id)
        .gte("date", cutoff)
        .execute()
        .data
    )

    totals: dict[str, int] = {}
    for row in history:
        totals[row["product_id"]] = totals.get(row["product_id"], 0) + row["units_sold"]

    products = db.table("products").select("id,name,category").eq("tenant_id", tenant_id).execute().data
    product_map = {p["id"]: p for p in products}

    result = sorted(
        [{"product": product_map[pid], "total_sold": total} for pid, total in totals.items() if pid in product_map],
        key=lambda x: x["total_sold"],
        reverse=True,
    )
    return result


def compute_forecast(tenant_id: str) -> list[dict]:
    db = get_db()
    products = db.table("products").select("*").eq("tenant_id", tenant_id).execute().data

    cutoff = (date.today() - timedelta(days=7)).isoformat()
    history = (
        db.table("sales_history")
        .select("product_id, units_sold, date")
        .eq("tenant_id", tenant_id)
        .gte("date", cutoff)
        .execute()
        .data
    )

    sales_by_product: dict[str, list[int]] = {}
    for row in history:
        sales_by_product.setdefault(row["product_id"], []).append(row["units_sold"])

    result = []
    for p in products:
        pid = p["id"]
        sales = sales_by_product.get(pid, [])
        if sales:
            avg_daily = sum(sales) / len(sales)
        else:
            avg_daily = 0.0

        forecast_7 = round(avg_daily * 7, 1)
        stock = p["stock_quantity"]

        if avg_daily > 0:
            days_until_stockout = round(stock / avg_daily, 1)
            stock_risk = days_until_stockout <= 7
        else:
            days_until_stockout = None
            stock_risk = False

        recommended_restock = max(0, round(forecast_7 * 2 - stock))

        result.append({
            "product_id": pid,
            "product_name": p["name"],
            "current_stock": stock,
            "average_daily_sales": round(avg_daily, 2),
            "forecast_7_days": forecast_7,
            "days_until_stockout": days_until_stockout,
            "stock_risk": stock_risk,
            "recommended_restock": recommended_restock,
        })

    result.sort(key=lambda x: x["days_until_stockout"] if x["days_until_stockout"] is not None else 9999)
    return result
