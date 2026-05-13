-- Update Ege Olive Oil products to realistic Turkish 2026 retail prices and names.
-- Run this once against the live Supabase DB. Safe to re-run (idempotent — sets
-- absolute values, no side effects on order_items which keep their historical unit_price).

UPDATE products SET
  name = 'Erken Hasat Sızma Zeytinyağı 1L',
  unit_price = 449.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000001';

UPDATE products SET
  name = 'Sızma Zeytinyağı 5L Teneke',
  unit_price = 1849.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000002';

UPDATE products SET
  name = 'Soğuk Sıkım Naturel Sızma Zeytinyağı 500ml',
  unit_price = 269.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000003';

UPDATE products SET
  name = 'Marmara Tipi Siyah Zeytin Ezmesi 340g',
  category = 'Spreads',
  unit_price = 119.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000004';

UPDATE products SET
  name = 'Gemlik Salamura Siyah Zeytin 1kg',
  category = 'Olives',
  unit_price = 189.00
WHERE id = 'eeeeeeee-1111-0000-0000-000000000005';
