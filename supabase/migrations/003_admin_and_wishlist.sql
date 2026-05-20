-- Add admin role to profiles
alter table public.profiles add column if not exists is_admin boolean default false;

-- Wishlist table for syncing across devices
create table public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
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

create index idx_wishlists_user on public.wishlists(user_id);

-- Admin RPC: get all users (admin only)
create or replace function public.admin_get_all_users()
returns setof public.profiles
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  return query select * from public.profiles order by created_at desc;
end;
$$;

-- Admin RPC: ban/unban user
create or replace function public.admin_toggle_ban(target_id uuid, banned boolean)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  -- We use a 'is_banned' column; add it if not exists
  update public.profiles set is_seller = (case when banned then false else is_seller end) where id = target_id;
end;
$$;

-- Add is_banned column
alter table public.profiles add column if not exists is_banned boolean default false;

-- Admin RPC: get all products (including unpublished)
create or replace function public.admin_get_all_products()
returns setof public.products
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  return query select * from public.products order by created_at desc;
end;
$$;

-- Admin RPC: get all orders
create or replace function public.admin_get_all_orders()
returns setof public.orders
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  return query select * from public.orders order by created_at desc;
end;
$$;

-- Admin RPC: delete product (any)
create or replace function public.admin_delete_product(p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;
  delete from public.products where id = p_id;
end;
$$;
