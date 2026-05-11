from fastapi import Header, HTTPException
from typing import Optional


class UserContext:
    def __init__(self, user_id: str, role: str, tenant_id: Optional[str], customer_id: Optional[str]):
        self.user_id = user_id
        self.role = role
        self.tenant_id = tenant_id
        self.customer_id = customer_id


def get_user_context(
    x_user_id: str = Header(...),
    x_role: str = Header(...),
    x_tenant_id: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
) -> UserContext:
    if x_role not in ("admin", "company", "customer"):
        raise HTTPException(status_code=400, detail="Invalid role")
    if x_role in ("company", "customer") and not x_tenant_id:
        raise HTTPException(status_code=400, detail="tenant_id required for this role")
    if x_role == "customer" and not x_customer_id:
        raise HTTPException(status_code=400, detail="customer_id required for customer role")
    return UserContext(
        user_id=x_user_id,
        role=x_role,
        tenant_id=x_tenant_id,
        customer_id=x_customer_id,
    )
