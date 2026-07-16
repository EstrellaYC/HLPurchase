-- RLS policies for HL Purchase

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.product_suppliers enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.procurement_needs enable row level security;
alter table public.procurement_need_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_manager_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('owner', 'manager') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'owner' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Profiles
create policy profiles_select_authenticated
on public.profiles for select
to authenticated
using (true);

create policy profiles_update_self_or_owner
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_owner())
with check (id = auth.uid() or public.is_owner());

create policy profiles_insert_owner
on public.profiles for insert
to authenticated
with check (public.is_owner());

-- Categories
create policy categories_select_authenticated
on public.categories for select to authenticated using (true);

create policy categories_write_manager
on public.categories for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

-- Suppliers
create policy suppliers_select_authenticated
on public.suppliers for select to authenticated using (true);

create policy suppliers_write_manager
on public.suppliers for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

-- Products
create policy products_select_authenticated
on public.products for select to authenticated using (true);

create policy products_write_manager
on public.products for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

-- Product suppliers
create policy product_suppliers_select_authenticated
on public.product_suppliers for select to authenticated using (true);

create policy product_suppliers_write_manager
on public.product_suppliers for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

-- Inventory
create policy inventory_select_authenticated
on public.inventory for select to authenticated using (true);

create policy inventory_update_authenticated
on public.inventory for update to authenticated
using (true)
with check (true);

create policy inventory_insert_manager
on public.inventory for insert to authenticated
with check (public.is_manager_or_above());

-- Inventory logs
create policy inventory_logs_select_authenticated
on public.inventory_logs for select to authenticated using (true);

create policy inventory_logs_insert_authenticated
on public.inventory_logs for insert to authenticated
with check (created_by = auth.uid());

-- Procurement needs
create policy procurement_needs_select_authenticated
on public.procurement_needs for select to authenticated using (true);

create policy procurement_needs_insert_authenticated
on public.procurement_needs for insert to authenticated
with check (created_by = auth.uid());

create policy procurement_needs_update_authenticated
on public.procurement_needs for update to authenticated
using (true)
with check (true);

create policy procurement_need_items_select_authenticated
on public.procurement_need_items for select to authenticated using (true);

create policy procurement_need_items_write_authenticated
on public.procurement_need_items for all to authenticated
using (true)
with check (true);

-- Purchase orders
create policy purchase_orders_select_authenticated
on public.purchase_orders for select to authenticated using (true);

create policy purchase_orders_write_manager
on public.purchase_orders for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

create policy purchase_order_items_select_authenticated
on public.purchase_order_items for select to authenticated using (true);

create policy purchase_order_items_write_manager
on public.purchase_order_items for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

-- Invoices
create policy invoices_select_authenticated
on public.invoices for select to authenticated using (true);

create policy invoices_write_manager
on public.invoices for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

create policy invoice_items_select_authenticated
on public.invoice_items for select to authenticated using (true);

create policy invoice_items_write_manager
on public.invoice_items for all to authenticated
using (public.is_manager_or_above())
with check (public.is_manager_or_above());

-- Storage bucket for product / invoice images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy images_public_read
on storage.objects for select
using (bucket_id = 'images');

create policy images_authenticated_upload
on storage.objects for insert
to authenticated
with check (bucket_id = 'images');

create policy images_authenticated_update
on storage.objects for update
to authenticated
using (bucket_id = 'images');

create policy images_manager_delete
on storage.objects for delete
to authenticated
using (bucket_id = 'images' and public.is_manager_or_above());
