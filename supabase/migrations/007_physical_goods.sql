-- ── Migration 007: Pivot to physical goods marketplace ──────────────
-- Adds shipping fields to orders and widens the status lifecycle to
-- match FireeEscrowV2: paid -> shipped -> delivered (or refunded/disputed).

-- 1. Shipping fields on orders
alter table public.orders
  add column if not exists shipping_name text,
  add column if not exists shipping_address text,
  add column if not exists shipping_city text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text,
  add column if not exists shipping_phone text,
  add column if not exists tracking_number text,
  add column if not exists shipping_carrier text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- 2. Widen status lifecycle for physical goods
alter table public.orders
  drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'shipped', 'delivered', 'completed', 'refunded', 'disputed'));

-- 3. Products: physical attributes
alter table public.products
  add column if not exists weight_grams integer,
  add column if not exists ships_from_country text,
  add column if not exists shipping_fee_usdc numeric(12,6) default 0;

-- 4. Index for seller shipping queue (orders waiting to be shipped)
create index if not exists idx_orders_seller_status
  on public.orders(seller_id, status);
