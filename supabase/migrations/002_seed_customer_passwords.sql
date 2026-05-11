-- Set demo passwords for seeded Ege customers.
-- Password for both accounts: sifre123
-- Algorithm: sha256(salt + password), format: "salt$digest"

UPDATE customers
SET
  password_hash = 'ege_demo_salt_ayse$1c9cc87003b903391a4d75b01e73fce2982a3dd268a7f449646732d79ea2e38b',
  address       = 'Atatürk Cad. No:12, Ayvalık, Balıkesir'
WHERE id = 'dddddddd-0000-0000-0000-000000000001';  -- Ayşe Demir

UPDATE customers
SET
  password_hash = 'ege_demo_salt_mehmet$03d183e4efc1c68443456b7ce66bad529a112f064edf5bda4f6a5948f73ce9b0',
  address       = 'İnönü Sok. No:7, Edremit, Balıkesir'
WHERE id = 'dddddddd-0000-0000-0000-000000000002';  -- Mehmet Kaya
