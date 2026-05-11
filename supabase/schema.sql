-- Koopilot MVP Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- tenants
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    sector      TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- profiles  (admin / company / customer logins)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id),
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('admin','company','customer')),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- customers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    profile_id  UUID REFERENCES profiles(id),
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- products
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    name                TEXT NOT NULL,
    category            TEXT NOT NULL,
    stock_quantity      INT NOT NULL DEFAULT 0,
    critical_threshold  INT NOT NULL DEFAULT 10,
    unit_price          NUMERIC(10,2) NOT NULL,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- orders
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_order_no TEXT NOT NULL,
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    status          TEXT NOT NULL CHECK (status IN ('preparing','packed','shipped','delivered','delayed','cancelled')),
    total_amount    NUMERIC(10,2) NOT NULL,
    order_date      DATE NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- order_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id),
    product_id  UUID NOT NULL REFERENCES products(id),
    quantity    INT NOT NULL,
    unit_price  NUMERIC(10,2) NOT NULL
);

-- ─────────────────────────────────────────────
-- shipments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id),
    carrier             TEXT NOT NULL,
    tracking_no         TEXT NOT NULL,
    shipment_status     TEXT NOT NULL CHECK (shipment_status IN ('waiting','in_transit','out_for_delivery','delivered','delayed')),
    estimated_delivery  DATE,
    delay_risk          BOOLEAN DEFAULT FALSE,
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- sales_history
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    product_id  UUID NOT NULL REFERENCES products(id),
    date        DATE NOT NULL,
    units_sold  INT NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- chat_messages
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    user_id     UUID NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
    channel     TEXT NOT NULL CHECK (channel IN ('customer','company')),
    message     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- activity_logs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    actor_id    UUID,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);
