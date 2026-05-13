-- Refresh Ege Zeytincilik catalog to the 6-product line shown in the storefront.
-- Idempotent: UPDATEs by ID, INSERT ... ON CONFLICT for the new product.

UPDATE products SET
  name = 'Natürel Sızma Zeytinyağı 1L',
  category = 'Olive Oil',
  unit_price = 350.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000001';

UPDATE products SET
  name = 'Organik Zeytinyağı 2L',
  category = 'Olive Oil',
  stock_quantity = 0,
  unit_price = 680.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000002';

UPDATE products SET
  name = 'Soğuk Sıkım Erken Hasat 500ml',
  category = 'Olive Oil',
  unit_price = 250.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000003';

UPDATE products SET
  name = 'Zeytin Ezmesi Sade 200g',
  category = 'Spreads',
  unit_price = 85.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000004';

UPDATE products SET
  name = 'Siyah Sele Zeytin 1kg',
  category = 'Olives',
  unit_price = 195.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000005';

INSERT INTO products (id, tenant_id, name, category, stock_quantity, critical_threshold, unit_price)
VALUES (
  'eeeeeeee-1111-0000-0000-000000000006',
  '11111111-0000-0000-0000-000000000001',
  'Çizik Yeşil Zeytin 1kg',
  'Olives',
  18,
  10,
  180.00
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  unit_price = EXCLUDED.unit_price;
