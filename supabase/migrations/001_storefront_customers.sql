-- Storefront customer accounts: password + address fields
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS address       TEXT;

-- Mark whether an order was placed as a guest checkout
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Helpful index for storefront login
CREATE INDEX IF NOT EXISTS idx_customers_tenant_email ON customers (tenant_id, email);
