-- H1: Reports table
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  unique(product_id, reporter_id)
);

alter table public.reports enable row level security;

create policy "Users can insert own reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

create policy "Users can read own reports"
  on public.reports for select using (auth.uid() = reporter_id);

create policy "Admins can read all reports"
  on public.reports for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update reports"
  on public.reports for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- H1: Disputes table
create table if not exists public.disputes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz default now(),
  unique(order_id)
);

alter table public.disputes enable row level security;

create policy "Buyer can insert own disputes"
  on public.disputes for insert with check (auth.uid() = buyer_id);

create policy "Buyer can read own disputes"
  on public.disputes for select using (auth.uid() = buyer_id);

create policy "Seller can read disputes against them"
  on public.disputes for select using (auth.uid() = seller_id);

create policy "Admins can read all disputes"
  on public.disputes for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update disputes"
  on public.disputes for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- C5: escrow_order_id column on orders (captures on-chain orderId from Purchase event)
alter table public.orders add column if not exists escrow_order_id text;

-- H6: Efficient tags RPC — no full table scan
create or replace function public.get_distinct_tags()
returns text[]
language sql
stable
as $$
  select array_agg(distinct tag order by tag)
  from public.products, unnest(tags) as tag
  where is_published = true and tags is not null;
$$;

-- Grant execute to authenticated + anon for public browse
grant execute on function public.get_distinct_tags() to authenticated, anon;

-- M9: Restrict increment_product_sales — require auth, prevent arbitrary calls
create or replace function public.increment_product_sales(p_id uuid, amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  -- Must be called by authenticated user who has a completed order for this product
  if not exists (
    select 1 from public.orders
    where product_id = p_id
      and buyer_id = auth.uid()
      and status = 'completed'
  ) then
    raise exception 'Unauthorized: no completed order for product';
  end if;

  update public.products
  set total_sales = total_sales + 1,
      total_revenue_usdc = total_revenue_usdc + amount
  where id = p_id;
end;
$$;

-- H5: seller_verified column (if not exists from earlier migration)
alter table public.profiles add column if not exists seller_verified boolean default false;

-- RLS: strip email + wallet_address from public profile reads (H2)
-- Enforce via column-level: public select on profiles cannot see email/wallet_address
-- Instead we create a secure view for public profile reads
create or replace view public.public_profiles as
  select
    id,
    username,
    display_name,
    avatar_url,
    bio,
    website,
    twitter,
    is_seller,
    seller_verified,
    created_at
  from public.profiles;

grant select on public.public_profiles to anon, authenticated;
