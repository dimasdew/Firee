-- =============================================
-- Firee Digital Goods Marketplace — Initial Schema
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Users ──
-- Extends Supabase auth.users with marketplace-specific data
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  email text,
  avatar_url text,
  bio text,
  wallet_address text,
  is_seller boolean default false,
  seller_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Anyone can read profiles
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

-- Users can update own profile
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Users can insert own profile
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ── Product Categories ──
create table public.categories (
  id serial primary key,
  name text unique not null,
  slug text unique not null,
  icon text, -- emoji or icon name
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Categories are publicly readable"
  on public.categories for select using (true);

-- Seed default categories
insert into public.categories (name, slug, icon) values
  ('UI Kit', 'ui-kit', '🎨'),
  ('Template', 'template', '📄'),
  ('Component', 'component', '🧩'),
  ('Icon Pack', 'icon-pack', '✨'),
  ('Design System', 'design-system', '🎯'),
  ('Dashboard', 'dashboard', '📊'),
  ('Landing Page', 'landing-page', '🚀'),
  ('Other', 'other', '📦');

-- ── Products ──
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null,
  short_description text,
  price_usdc numeric(12, 4) not null check (price_usdc >= 0),
  category_id integer references public.categories(id),
  thumbnail_url text,
  preview_images text[] default '{}',
  file_url text, -- private: only revealed after purchase
  file_name text,
  file_size_bytes bigint,
  tags text[] default '{}',
  is_published boolean default false,
  is_featured boolean default false,
  total_sales integer default 0,
  total_revenue_usdc numeric(12, 4) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(seller_id, slug)
);

alter table public.products enable row level security;

-- Anyone can read published products
create policy "Published products are publicly readable"
  on public.products for select using (is_published = true);

-- Sellers can read all own products (including unpublished)
create policy "Sellers can read own products"
  on public.products for select using (auth.uid() = seller_id);

-- Sellers can insert own products
create policy "Sellers can insert own products"
  on public.products for insert with check (auth.uid() = seller_id);

-- Sellers can update own products
create policy "Sellers can update own products"
  on public.products for update using (auth.uid() = seller_id);

-- Sellers can delete own products
create policy "Sellers can delete own products"
  on public.products for delete using (auth.uid() = seller_id);

-- ── Orders ──
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  product_id uuid not null references public.products(id),
  price_usdc numeric(12, 4) not null,
  platform_fee_usdc numeric(12, 4) not null default 0,
  seller_revenue_usdc numeric(12, 4) not null default 0,
  tx_hash text, -- on-chain transaction hash
  status text not null default 'pending' check (status in ('pending', 'paid', 'completed', 'refunded', 'disputed')),
  download_url text, -- revealed after payment confirmed
  downloaded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Buyers can read own orders
create policy "Buyers can read own orders"
  on public.orders for select using (auth.uid() = buyer_id);

-- Sellers can read orders for their products
create policy "Sellers can read orders for own products"
  on public.orders for select using (auth.uid() = seller_id);

-- ── Reviews ──
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid unique not null references public.orders(id),
  buyer_id uuid not null references public.profiles(id),
  product_id uuid not null references public.products(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are publicly readable"
  on public.reviews for select using (true);

create policy "Buyers can insert review for own orders"
  on public.reviews for insert with check (auth.uid() = buyer_id);

-- ── Seller Payouts ──
create table public.payouts (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id),
  amount_usdc numeric(12, 4) not null,
  wallet_address text not null,
  tx_hash text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now()
);

alter table public.payouts enable row level security;

create policy "Sellers can read own payouts"
  on public.payouts for select using (auth.uid() = seller_id);

-- ── Indexes ──
create index idx_products_seller on public.products(seller_id);
create index idx_products_category on public.products(category_id);
create index idx_products_published on public.products(is_published) where is_published = true;
create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_orders_product on public.orders(product_id);
create index idx_reviews_product on public.reviews(product_id);

-- ── Functions ──

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_products_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

create trigger set_orders_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(split_part(new.email, '@', 1), 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
