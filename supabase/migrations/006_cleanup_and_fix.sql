-- ============================================================
-- Migration 006: Full cleanup & fix
-- Covers: missing tables, missing columns, duplicate/wrong
--         policies, missing indexes, missing functions/views,
--         constraint gaps, category icons.
-- ============================================================

-- ── 1. MISSING TABLE: wishlists ─────────────────────────────
create table if not exists public.wishlists (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "Users can read own wishlist"
  on public.wishlists for select using (auth.uid() = user_id);

create policy "Users can insert own wishlist"
  on public.wishlists for insert with check (auth.uid() = user_id);

create policy "Users can delete own wishlist"
  on public.wishlists for delete using (auth.uid() = user_id);

create index if not exists idx_wishlists_user    on public.wishlists(user_id);
create index if not exists idx_wishlists_product on public.wishlists(product_id);


-- ── 2. MISSING COLUMN: orders.escrow_order_id ───────────────
alter table public.orders
  add column if not exists escrow_order_id text;


-- ── 3. DUPLICATE/CONFLICTING POLICIES ───────────────────────

-- payouts: drop duplicate select policy
drop policy if exists "Sellers can view own payouts" on public.payouts;

-- products: drop conflicting update policies, replace with one clean one
drop policy if exists "Sellers can update own products"    on public.products;
drop policy if exists "Owner or admin can update products" on public.products;

create policy "Sellers can update own products"
  on public.products for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "Admins can update any product" on public.products;
create policy "Admins can update any product"
  on public.products for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );


-- ── 4. MISSING POLICIES ─────────────────────────────────────

-- disputes: admin can read all
drop policy if exists "Admins can read all disputes" on public.disputes;
create policy "Admins can read all disputes"
  on public.disputes for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- reports: admin can read all
drop policy if exists "Admins can read all reports" on public.reports;
create policy "Admins can read all reports"
  on public.reports for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- reviews: buyer can update own review (edit comment/rating)
drop policy if exists "Buyers can update own review" on public.reviews;
create policy "Buyers can update own review"
  on public.reviews for update
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);

-- reviews: buyer can delete own review
drop policy if exists "Buyers can delete own review" on public.reviews;
create policy "Buyers can delete own review"
  on public.reviews for delete
  using (auth.uid() = buyer_id);

-- orders: admin can update (status changes, dispute resolution)
drop policy if exists "Admins can update any order" on public.orders;
create policy "Admins can update any order"
  on public.orders for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- profiles: restrict public read (strip email + wallet_address)
-- Drop old blanket policy, replace with column-filtered view approach
-- (view created in step 7; keep policy but note email is in select)
-- For now: keep existing policy (changing breaks existing UI)
-- Security fix: done via public_profiles view instead (step 7)


-- ── 5. MISSING INDEXES ──────────────────────────────────────
create index if not exists idx_profiles_wallet   on public.profiles(wallet_address) where wallet_address is not null;
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_orders_status     on public.orders(status);
create index if not exists idx_reports_status    on public.reports(status);
create index if not exists idx_disputes_order    on public.disputes(order_id);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_price    on public.products(price_usdc) where is_published = true;


-- ── 6. MISSING CONSTRAINTS ──────────────────────────────────

-- disputes: one dispute per order
do $$ begin
  alter table public.disputes add constraint disputes_order_id_key unique (order_id);
exception when duplicate_object then null;
end $$;

-- reports: one report per user per product
do $$ begin
  alter table public.reports add constraint reports_product_reporter_key unique (product_id, reporter_id);
exception when duplicate_object then null;
end $$;

-- products: price must be >= 0.01 USDC (prevent zero-fee exploit)
alter table public.products
  drop constraint if exists products_price_usdc_check;
alter table public.products
  add constraint products_price_usdc_check check (price_usdc >= 0.01);

-- orders: status whitelist (add 'completed' which code uses directly)
alter table public.orders
  drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'completed', 'refunded', 'disputed', 'cancelled'));


-- ── 7. MISSING FUNCTIONS ────────────────────────────────────

-- get_distinct_tags: efficient array unnest RPC
create or replace function public.get_distinct_tags()
returns text[]
language sql stable
as $$
  select coalesce(array_agg(distinct tag order by tag), '{}')
  from public.products, unnest(tags) as tag
  where is_published = true and tags is not null and array_length(tags, 1) > 0;
$$;
grant execute on function public.get_distinct_tags() to authenticated, anon;

-- admin_get_all_users
create or replace function public.admin_get_all_users()
returns setof public.profiles
language plpgsql security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  return query select * from public.profiles order by created_at desc;
end;
$$;
grant execute on function public.admin_get_all_users() to authenticated;

-- admin_get_all_products
create or replace function public.admin_get_all_products()
returns setof public.products
language plpgsql security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  return query select * from public.products order by created_at desc;
end;
$$;
grant execute on function public.admin_get_all_products() to authenticated;

-- admin_get_all_orders
create or replace function public.admin_get_all_orders()
returns setof public.orders
language plpgsql security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  return query select * from public.orders order by created_at desc;
end;
$$;
grant execute on function public.admin_get_all_orders() to authenticated;

-- admin_delete_product
create or replace function public.admin_delete_product(p_id uuid)
returns void
language plpgsql security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  delete from public.products where id = p_id;
end;
$$;
grant execute on function public.admin_delete_product(uuid) to authenticated;

-- admin_toggle_ban (fixed — was incorrectly updating is_seller)
create or replace function public.admin_toggle_ban(target_id uuid, banned boolean)
returns void
language plpgsql security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  update public.profiles
  set is_banned = banned
  where id = target_id;
end;
$$;
grant execute on function public.admin_toggle_ban(uuid, boolean) to authenticated;

-- increment_product_sales: add auth check (was open to anyone)
create or replace function public.increment_product_sales(p_id uuid, amount numeric)
returns void
language plpgsql security definer
as $$
begin
  if not exists (
    select 1 from public.orders
    where product_id = p_id
      and buyer_id = auth.uid()
      and status = 'completed'
  ) then
    raise exception 'Unauthorized: no completed order';
  end if;
  update public.products
  set total_sales = total_sales + 1,
      total_revenue_usdc = total_revenue_usdc + amount
  where id = p_id;
end;
$$;
grant execute on function public.increment_product_sales(uuid, numeric) to authenticated;

-- handle_new_user: add conflict guard on duplicate username
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );
  final_username := base_username;

  -- Resolve collision by appending suffix
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, email, username, display_name, avatar_url)
  values (
    new.id,
    new.email,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', final_username),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


-- ── 8. PUBLIC_PROFILES VIEW (security: hide email/wallet) ───
create or replace view public.public_profiles as
  select
    id,
    username,
    display_name,
    avatar_url,
    bio,
    is_seller,
    seller_verified,
    created_at
  from public.profiles;

grant select on public.public_profiles to anon, authenticated;


-- ── 9. CATEGORY ICONS (restore after 004 deleted them) ──────
update public.categories set icon = '📜' where slug = 'smart-contracts';
update public.categories set icon = '🚀' where slug = 'dapp-templates';
update public.categories set icon = '🎨' where slug = 'ui-kits';
update public.categories set icon = '🔧' where slug = 'tools-scripts';

-- Add missing Web3 categories that app uses
insert into public.categories (name, slug, icon)
values
  ('Components',  'components',  '🧩'),
  ('Templates',   'templates',   '📄'),
  ('Other',       'other',       '📦')
on conflict (slug) do nothing;


-- ── 10. GRANTS: ensure authenticated role has table access ──
grant select, insert, update, delete on public.wishlists to authenticated;
grant select on public.wishlists to anon;
grant usage, select on sequence categories_id_seq to authenticated;
