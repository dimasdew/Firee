-- Allow authenticated users to insert their own orders
create policy "Buyers can insert own orders"
  on public.orders for insert with check (auth.uid() = buyer_id);

-- RPC function to increment product sales count after purchase
create or replace function public.increment_product_sales(p_id uuid, amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set total_sales = total_sales + 1,
      total_revenue_usdc = total_revenue_usdc + amount
  where id = p_id;
end;
$$;
