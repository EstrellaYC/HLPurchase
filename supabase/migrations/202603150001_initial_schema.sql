-- HL Purchase: initial schema
-- Restaurant Inventory & Procurement System

create extension if not exists "pgcrypto";

-- Roles
create type public.app_role as enum ('owner', 'manager', 'staff');

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  role public.app_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null,
  name_en text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_sort_idx on public.categories (sort_order, name_zh);

-- Suppliers
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  wechat text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index suppliers_name_idx on public.suppliers (name);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name_zh text not null,
  name_en text not null,
  sku text,
  unit text not null default 'kg',
  image_url text,
  min_stock numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_name_zh_idx on public.products (name_zh);
create unique index products_sku_unique on public.products (sku) where sku is not null;

-- Product <-> Supplier pricing
create table public.product_suppliers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  unit_price numeric(12, 2) not null default 0,
  package_size numeric(12, 2) not null default 1,
  is_preferred boolean not null default false,
  lead_days integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, supplier_id)
);

create index product_suppliers_product_idx on public.product_suppliers (product_id);
create index product_suppliers_supplier_idx on public.product_suppliers (supplier_id);

-- Inventory current stock
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products (id) on delete cascade,
  quantity numeric(12, 2) not null default 0,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create index inventory_quantity_idx on public.inventory (quantity);

-- Inventory change logs
create type public.inventory_change_type as enum (
  'count',
  'receive',
  'adjust',
  'waste'
);

create table public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change_type public.inventory_change_type not null,
  quantity_before numeric(12, 2) not null,
  quantity_after numeric(12, 2) not null,
  delta numeric(12, 2) not null,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_logs_product_idx on public.inventory_logs (product_id, created_at desc);

-- Procurement need (采购需求)
create type public.procurement_need_status as enum (
  'open',
  'converted',
  'cancelled'
);

create table public.procurement_needs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status public.procurement_need_status not null default 'open',
  needed_date date,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.procurement_need_items (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.procurement_needs (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity numeric(12, 2) not null check (quantity > 0),
  note text,
  created_at timestamptz not null default now()
);

create index procurement_need_items_need_idx on public.procurement_need_items (need_id);

-- Today's purchase orders (今日采购)
create type public.purchase_order_status as enum (
  'draft',
  'confirmed',
  'ordered',
  'received',
  'cancelled'
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  status public.purchase_order_status not null default 'draft',
  order_date date not null default current_date,
  note text,
  source_need_id uuid references public.procurement_needs (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchase_orders_date_idx on public.purchase_orders (order_date desc);
create index purchase_orders_supplier_idx on public.purchase_orders (supplier_id);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.purchase_orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity numeric(12, 2) not null check (quantity > 0),
  unit_price numeric(12, 2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create index purchase_order_items_order_idx on public.purchase_order_items (order_id);

-- Invoices
create type public.invoice_status as enum (
  'pending',
  'verified',
  'disputed'
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  purchase_order_id uuid references public.purchase_orders (id) on delete set null,
  invoice_number text,
  invoice_date date not null default current_date,
  total_amount numeric(12, 2) not null default 0,
  status public.invoice_status not null default 'pending',
  image_url text,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_supplier_idx on public.invoices (supplier_id);
create index invoices_date_idx on public.invoices (invoice_date desc);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger suppliers_set_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_suppliers_set_updated_at
before update on public.product_suppliers
for each row execute function public.set_updated_at();

create trigger procurement_needs_set_updated_at
before update on public.procurement_needs
for each row execute function public.set_updated_at();

create trigger purchase_orders_set_updated_at
before update on public.purchase_orders
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'staff')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Auto-create inventory row when product is created
create or replace function public.handle_new_product_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.inventory (product_id, quantity)
  values (new.id, 0);
  return new;
end;
$$;

create trigger on_product_created_inventory
after insert on public.products
for each row execute function public.handle_new_product_inventory();
