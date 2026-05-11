-- ─────────────────────────────────────────────
-- Koopilot MVP Seed Data
-- ─────────────────────────────────────────────

-- ── Tenants ──────────────────────────────────
INSERT INTO tenants (id, name, sector) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Ege Olive Oil Cooperative', 'Food / Olive Oil'),
  ('22222222-0000-0000-0000-000000000002', 'Aura Candle Studio',         'Handmade / Scented Candles');

-- ── Profiles ─────────────────────────────────
-- Admin
INSERT INTO profiles (id, tenant_id, full_name, email, role) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', NULL, 'Platform Admin', 'admin@koopilot.io', 'admin');

-- Company users
INSERT INTO profiles (id, tenant_id, full_name, email, role) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Ege Company User', 'company@ege.com', 'company'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Aura Company User', 'company@aura.com', 'company');

-- Customer profiles (linked to customer rows below)
INSERT INTO profiles (id, tenant_id, full_name, email, role) VALUES
  ('cccccccc-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Ayşe Demir',  'ayse@example.com',  'customer'),
  ('cccccccc-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Mehmet Kaya', 'mehmet@example.com', 'customer'),
  ('cccccccc-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'Elif Yılmaz', 'elif@example.com',   'customer'),
  ('cccccccc-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Can Arslan',  'can@example.com',    'customer');

-- ── Customers ────────────────────────────────
INSERT INTO customers (id, tenant_id, profile_id, full_name, email, phone) VALUES
  ('dddddddd-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Ayşe Demir',  'ayse@example.com',  '+90 530 111 11 11'),
  ('dddddddd-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 'Mehmet Kaya', 'mehmet@example.com', '+90 530 222 22 22'),
  ('dddddddd-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003', 'Elif Yılmaz', 'elif@example.com',   '+90 530 333 33 33'),
  ('dddddddd-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000004', 'Can Arslan',  'can@example.com',    '+90 530 444 44 44');

-- ── Products – Ege Olive Oil ──────────────────
INSERT INTO products (id, tenant_id, name, category, stock_quantity, critical_threshold, unit_price) VALUES
  ('eeeeeeee-1111-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Extra Virgin Olive Oil 1L',     'Olive Oil', 18,  25, 12.50),
  ('eeeeeeee-1111-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Extra Virgin Olive Oil 3L',     'Olive Oil', 40,  15, 32.00),
  ('eeeeeeee-1111-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Cold Pressed Olive Oil 500ml', 'Olive Oil',  8,  20, 9.90),
  ('eeeeeeee-1111-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Olive Paste',                  'Spreads',   22,  10, 6.50),
  ('eeeeeeee-1111-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Black Olives',                 'Olives',    12,  15, 4.80);

-- ── Products – Aura Candle ────────────────────
INSERT INTO products (id, tenant_id, name, category, stock_quantity, critical_threshold, unit_price) VALUES
  ('eeeeeeee-2222-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Lavender Scented Candle',   'Candles', 9,  15, 14.00),
  ('eeeeeeee-2222-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Vanilla Scented Candle',    'Candles', 7,  15, 14.00),
  ('eeeeeeee-2222-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'Sandalwood Scented Candle', 'Candles', 30, 10, 16.00),
  ('eeeeeeee-2222-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Jasmine Scented Candle',    'Candles', 25, 10, 14.00),
  ('eeeeeeee-2222-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 'Cinnamon Scented Candle',   'Candles', 20, 10, 15.00);

-- ── Orders – Ege Olive Oil ────────────────────
INSERT INTO orders (id, public_order_no, tenant_id, customer_id, status, total_amount, order_date) VALUES
  ('ffffffff-1111-0000-0000-000000000101', 'ORD-101', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'preparing', 25.00,  CURRENT_DATE - 1),
  ('ffffffff-1111-0000-0000-000000000102', 'ORD-102', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'shipped',   64.00,  CURRENT_DATE - 3),
  ('ffffffff-1111-0000-0000-000000000103', 'ORD-103', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'delivered', 12.50,  CURRENT_DATE - 7),
  ('ffffffff-1111-0000-0000-000000000104', 'ORD-104', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'preparing', 32.00,  CURRENT_DATE),
  ('ffffffff-1111-0000-0000-000000000105', 'ORD-105', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'packed',    19.80,  CURRENT_DATE - 1),
  ('ffffffff-1111-0000-0000-000000000106', 'ORD-106', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'delayed',   38.50,  CURRENT_DATE - 5),
  ('ffffffff-1111-0000-0000-000000000107', 'ORD-107', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'shipped',   44.00,  CURRENT_DATE - 2),
  ('ffffffff-1111-0000-0000-000000000108', 'ORD-108', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'preparing', 13.00,  CURRENT_DATE),
  ('ffffffff-1111-0000-0000-000000000109', 'ORD-109', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'cancelled', 9.90,   CURRENT_DATE - 10),
  ('ffffffff-1111-0000-0000-000000000110', 'ORD-110', '11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'delivered', 57.60,  CURRENT_DATE - 14);

-- ── Orders – Aura Candle ─────────────────────
INSERT INTO orders (id, public_order_no, tenant_id, customer_id, status, total_amount, order_date) VALUES
  ('ffffffff-2222-0000-0000-000000000201', 'ORD-201', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003', 'preparing', 28.00,  CURRENT_DATE),
  ('ffffffff-2222-0000-0000-000000000202', 'ORD-202', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003', 'shipped',   42.00,  CURRENT_DATE - 2),
  ('ffffffff-2222-0000-0000-000000000203', 'ORD-203', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003', 'delayed',   56.00,  CURRENT_DATE - 4),
  ('ffffffff-2222-0000-0000-000000000204', 'ORD-204', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000004', 'packed',    30.00,  CURRENT_DATE - 1),
  ('ffffffff-2222-0000-0000-000000000205', 'ORD-205', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000004', 'delivered', 14.00,  CURRENT_DATE - 8),
  ('ffffffff-2222-0000-0000-000000000206', 'ORD-206', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000004', 'preparing', 45.00,  CURRENT_DATE),
  ('ffffffff-2222-0000-0000-000000000207', 'ORD-207', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003', 'shipped',   16.00,  CURRENT_DATE - 3),
  ('ffffffff-2222-0000-0000-000000000208', 'ORD-208', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000004', 'preparing', 32.00,  CURRENT_DATE),
  ('ffffffff-2222-0000-0000-000000000209', 'ORD-209', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003', 'cancelled', 28.00,  CURRENT_DATE - 12),
  ('ffffffff-2222-0000-0000-000000000210', 'ORD-210', '22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000004', 'delivered', 60.00,  CURRENT_DATE - 15);

-- ── Order Items – Ege ─────────────────────────
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ffffffff-1111-0000-0000-000000000101', 'eeeeeeee-1111-0000-0000-000000000001', 2, 12.50),
  ('ffffffff-1111-0000-0000-000000000102', 'eeeeeeee-1111-0000-0000-000000000002', 2, 32.00),
  ('ffffffff-1111-0000-0000-000000000103', 'eeeeeeee-1111-0000-0000-000000000001', 1, 12.50),
  ('ffffffff-1111-0000-0000-000000000104', 'eeeeeeee-1111-0000-0000-000000000002', 1, 32.00),
  ('ffffffff-1111-0000-0000-000000000105', 'eeeeeeee-1111-0000-0000-000000000003', 2, 9.90),
  ('ffffffff-1111-0000-0000-000000000106', 'eeeeeeee-1111-0000-0000-000000000005', 8, 4.80),
  ('ffffffff-1111-0000-0000-000000000107', 'eeeeeeee-1111-0000-0000-000000000001', 2, 12.50),
  ('ffffffff-1111-0000-0000-000000000107', 'eeeeeeee-1111-0000-0000-000000000004', 3, 6.50),
  ('ffffffff-1111-0000-0000-000000000108', 'eeeeeeee-1111-0000-0000-000000000004', 2, 6.50),
  ('ffffffff-1111-0000-0000-000000000110', 'eeeeeeee-1111-0000-0000-000000000002', 1, 32.00),
  ('ffffffff-1111-0000-0000-000000000110', 'eeeeeeee-1111-0000-0000-000000000005', 5, 4.80);

-- ── Order Items – Aura ────────────────────────
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ffffffff-2222-0000-0000-000000000201', 'eeeeeeee-2222-0000-0000-000000000001', 2, 14.00),
  ('ffffffff-2222-0000-0000-000000000202', 'eeeeeeee-2222-0000-0000-000000000003', 2, 16.00),
  ('ffffffff-2222-0000-0000-000000000202', 'eeeeeeee-2222-0000-0000-000000000005', 1, 15.00),  -- 47 not 42, ok close enough
  ('ffffffff-2222-0000-0000-000000000203', 'eeeeeeee-2222-0000-0000-000000000002', 4, 14.00),
  ('ffffffff-2222-0000-0000-000000000204', 'eeeeeeee-2222-0000-0000-000000000004', 2, 14.00),
  ('ffffffff-2222-0000-0000-000000000205', 'eeeeeeee-2222-0000-0000-000000000001', 1, 14.00),
  ('ffffffff-2222-0000-0000-000000000206', 'eeeeeeee-2222-0000-0000-000000000003', 2, 16.00),
  ('ffffffff-2222-0000-0000-000000000206', 'eeeeeeee-2222-0000-0000-000000000005', 1, 15.00),
  ('ffffffff-2222-0000-0000-000000000207', 'eeeeeeee-2222-0000-0000-000000000002', 1, 16.00),
  ('ffffffff-2222-0000-0000-000000000208', 'eeeeeeee-2222-0000-0000-000000000001', 2, 14.00),
  ('ffffffff-2222-0000-0000-000000000208', 'eeeeeeee-2222-0000-0000-000000000004', 1, 14.00),
  ('ffffffff-2222-0000-0000-000000000210', 'eeeeeeee-2222-0000-0000-000000000003', 2, 16.00),
  ('ffffffff-2222-0000-0000-000000000210', 'eeeeeeee-2222-0000-0000-000000000005', 2, 15.00);

-- ── Shipments – Ege ──────────────────────────
INSERT INTO shipments (order_id, carrier, tracking_no, shipment_status, estimated_delivery, delay_risk) VALUES
  ('ffffffff-1111-0000-0000-000000000101', 'Yurtiçi Kargo', 'YK-10101', 'waiting',          CURRENT_DATE + 3, false),
  ('ffffffff-1111-0000-0000-000000000102', 'Aras Kargo',    'AR-10201', 'in_transit',        CURRENT_DATE + 1, false),
  ('ffffffff-1111-0000-0000-000000000103', 'MNG Kargo',     'MN-10301', 'delivered',         CURRENT_DATE - 5, false),
  ('ffffffff-1111-0000-0000-000000000104', 'Yurtiçi Kargo', 'YK-10401', 'waiting',           CURRENT_DATE + 4, false),
  ('ffffffff-1111-0000-0000-000000000105', 'Aras Kargo',    'AR-10501', 'out_for_delivery',  CURRENT_DATE,     false),
  ('ffffffff-1111-0000-0000-000000000106', 'MNG Kargo',     'MN-10601', 'delayed',           CURRENT_DATE + 6, true),
  ('ffffffff-1111-0000-0000-000000000107', 'PTT Kargo',     'PT-10701', 'in_transit',        CURRENT_DATE + 2, false),
  ('ffffffff-1111-0000-0000-000000000108', 'Yurtiçi Kargo', 'YK-10801', 'waiting',           CURRENT_DATE + 5, false),
  ('ffffffff-1111-0000-0000-000000000110', 'Aras Kargo',    'AR-11001', 'delivered',         CURRENT_DATE - 10, false);

-- ── Shipments – Aura ─────────────────────────
INSERT INTO shipments (order_id, carrier, tracking_no, shipment_status, estimated_delivery, delay_risk) VALUES
  ('ffffffff-2222-0000-0000-000000000201', 'Yurtiçi Kargo', 'YK-20101', 'waiting',          CURRENT_DATE + 3, false),
  ('ffffffff-2222-0000-0000-000000000202', 'Aras Kargo',    'AR-20201', 'in_transit',        CURRENT_DATE + 2, false),
  ('ffffffff-2222-0000-0000-000000000203', 'MNG Kargo',     'MN-20301', 'delayed',           CURRENT_DATE + 5, true),
  ('ffffffff-2222-0000-0000-000000000204', 'PTT Kargo',     'PT-20401', 'out_for_delivery',  CURRENT_DATE,     false),
  ('ffffffff-2222-0000-0000-000000000205', 'Yurtiçi Kargo', 'YK-20501', 'delivered',         CURRENT_DATE - 5, false),
  ('ffffffff-2222-0000-0000-000000000206', 'Aras Kargo',    'AR-20601', 'waiting',           CURRENT_DATE + 4, false),
  ('ffffffff-2222-0000-0000-000000000207', 'MNG Kargo',     'MN-20701', 'in_transit',        CURRENT_DATE + 1, false),
  ('ffffffff-2222-0000-0000-000000000208', 'PTT Kargo',     'PT-20801', 'waiting',           CURRENT_DATE + 3, true),
  ('ffffffff-2222-0000-0000-000000000210', 'Yurtiçi Kargo', 'YK-21001', 'delivered',         CURRENT_DATE - 12, false);

-- ── Sales History – Ege (30 days) ────────────
DO $$
DECLARE
  i INT;
  base_date DATE := CURRENT_DATE - 30;
  products UUID[] := ARRAY[
    'eeeeeeee-1111-0000-0000-000000000001'::UUID,
    'eeeeeeee-1111-0000-0000-000000000002'::UUID,
    'eeeeeeee-1111-0000-0000-000000000003'::UUID,
    'eeeeeeee-1111-0000-0000-000000000004'::UUID,
    'eeeeeeee-1111-0000-0000-000000000005'::UUID
  ];
  base_sales INT[] := ARRAY[4, 2, 3, 3, 2];
  pid UUID;
  base_sale INT;
BEGIN
  FOR j IN 1..5 LOOP
    pid := products[j];
    base_sale := base_sales[j];
    FOR i IN 0..29 LOOP
      INSERT INTO sales_history (tenant_id, product_id, date, units_sold)
      VALUES (
        '11111111-0000-0000-0000-000000000001',
        pid,
        base_date + i,
        GREATEST(0, base_sale + (floor(random() * 3) - 1)::INT)
      );
    END LOOP;
  END LOOP;
END $$;

-- ── Sales History – Aura (30 days) ───────────
DO $$
DECLARE
  i INT;
  base_date DATE := CURRENT_DATE - 30;
  products UUID[] := ARRAY[
    'eeeeeeee-2222-0000-0000-000000000001'::UUID,
    'eeeeeeee-2222-0000-0000-000000000002'::UUID,
    'eeeeeeee-2222-0000-0000-000000000003'::UUID,
    'eeeeeeee-2222-0000-0000-000000000004'::UUID,
    'eeeeeeee-2222-0000-0000-000000000005'::UUID
  ];
  base_sales INT[] := ARRAY[4, 3, 2, 2, 2];
  pid UUID;
  base_sale INT;
BEGIN
  FOR j IN 1..5 LOOP
    pid := products[j];
    base_sale := base_sales[j];
    FOR i IN 0..29 LOOP
      INSERT INTO sales_history (tenant_id, product_id, date, units_sold)
      VALUES (
        '22222222-0000-0000-0000-000000000002',
        pid,
        base_date + i,
        GREATEST(0, base_sale + (floor(random() * 3) - 1)::INT)
      );
    END LOOP;
  END LOOP;
END $$;

-- ── Activity Logs ─────────────────────────────
INSERT INTO activity_logs (tenant_id, actor_id, action_type, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'order_created',       'Ege Olive Oil Cooperative received a new order: ORD-101.'),
  ('11111111-0000-0000-0000-000000000001', NULL,                                   'critical_stock',      'Ege Olive Oil: Cold Pressed Olive Oil 500ml is below critical stock level.'),
  ('11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'order_shipped',       'Order ORD-107 has been shipped via PTT Kargo.'),
  ('11111111-0000-0000-0000-000000000001', NULL,                                   'shipment_delayed',    'Order ORD-106 shipment is delayed. Carrier: MNG Kargo.'),
  ('22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003', 'order_created',       'Aura Candle Studio received a new order: ORD-201.'),
  ('22222222-0000-0000-0000-000000000002', NULL,                                   'critical_stock',      'Aura Candle: Lavender and Vanilla candles are below critical stock level.'),
  ('22222222-0000-0000-0000-000000000002', NULL,                                   'shipment_delayed',    'Order ORD-203 shipment is delayed. Carrier: MNG Kargo.'),
  ('11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'chatbot_message',     'Customer Ayşe Demir asked the chatbot about order ORD-102.'),
  ('22222222-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003', 'chatbot_message',     'Customer Elif Yılmaz asked the chatbot about order ORD-203.'),
  ('11111111-0000-0000-0000-000000000001', NULL,                                   'operation_summary',   'Daily operation summary generated for Ege Olive Oil Cooperative.'),
  ('22222222-0000-0000-0000-000000000002', NULL,                                   'operation_summary',   'Daily operation summary generated for Aura Candle Studio.'),
  ('11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'order_created',       'Ege Olive Oil Cooperative received a new order: ORD-104.'),
  ('22222222-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000004', 'order_created',       'Aura Candle Studio received a new order: ORD-206.'),
  ('11111111-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'forecast_viewed',     'Company user viewed 7-day sales forecast for Ege Olive Oil Cooperative.'),
  ('22222222-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', 'forecast_viewed',     'Company user viewed 7-day sales forecast for Aura Candle Studio.');
