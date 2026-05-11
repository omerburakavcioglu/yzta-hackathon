from fastapi import APIRouter
from app.db import get_db

router = APIRouter(tags=["demo"])

DEMO_USERS = [
    {
        "label": "Continue as Admin",
        "role": "admin",
        "user_id": "aaaaaaaa-0000-0000-0000-000000000001",
        "tenant_id": None,
        "customer_id": None,
    },
    {
        "label": "Continue as Ege Olive Oil Company",
        "role": "company",
        "user_id": "bbbbbbbb-0000-0000-0000-000000000001",
        "tenant_id": "11111111-0000-0000-0000-000000000001",
        "customer_id": None,
    },
    {
        "label": "Continue as Aura Candle Company",
        "role": "company",
        "user_id": "bbbbbbbb-0000-0000-0000-000000000002",
        "tenant_id": "22222222-0000-0000-0000-000000000002",
        "customer_id": None,
    },
    {
        "label": "Continue as Ayşe (Ege Customer)",
        "role": "customer",
        "user_id": "cccccccc-0000-0000-0000-000000000001",
        "tenant_id": "11111111-0000-0000-0000-000000000001",
        "customer_id": "dddddddd-0000-0000-0000-000000000001",
    },
    {
        "label": "Continue as Elif (Aura Customer)",
        "role": "customer",
        "user_id": "cccccccc-0000-0000-0000-000000000003",
        "tenant_id": "22222222-0000-0000-0000-000000000002",
        "customer_id": "dddddddd-0000-0000-0000-000000000003",
    },
]


@router.get("/demo-users")
def get_demo_users():
    return DEMO_USERS
