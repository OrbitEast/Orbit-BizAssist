-- Orbit BizAssist V2 — core relational foundation
-- Apply only after V2 application services are ready.
-- Existing orbit_bizassist_state is intentionally left untouched until migration is complete.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  legal_name text,
  currency text not null default 'INR',
  tax_id text,
  address jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','manager','staff','viewer')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  opening_balance numeric(14,2) not null default 0,
  credit_limit numeric(14,2) not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  opening_balance numeric(14,2) not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  sku text,
  barcode text,
  name text not null,
  unit text not null default 'pcs',
  sale_price numeric(14,2) not null default 0,
  purchase_price numeric(14,2) not null default 0,
  tax_rate numeric(6,2) not null default 0,
  reorder_level numeric(14,3) not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, sku)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  number text not null,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','sent','partially_paid','paid','overdue','cancelled','refunded')),
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  balance_due numeric(14,2) not null default 0,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, number)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null default 1,
  unit_price numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  tax_rate numeric(6,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  position integer not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  reference text,
  amount numeric(14,2) not null check (amount >= 0),
  method text not null default 'cash',
  direction text not null default 'in' check (direction in ('in','out')),
  status text not null default 'completed' check (status in ('pending','completed','cancelled','refunded')),
  paid_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null default 'General',
  description text,
  amount numeric(14,2) not null check (amount >= 0),
  payment_method text not null default 'cash',
  expense_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null check (type in ('opening','sale','purchase','return_in','return_out','adjustment','damage','transfer_in','transfer_out')),
  quantity numeric(14,3) not null,
  reference_type text,
  reference_id uuid,
  note text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (type in ('sale','purchase','payment_in','payment_out','refund','expense','stock_adjustment')),
  reference_type text,
  reference_id uuid,
  amount numeric(14,2) not null default 0,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_business_members_user on public.business_members(user_id);
create index if not exists idx_customers_business on public.customers(business_id);
create index if not exists idx_vendors_business on public.vendors(business_id);
create index if not exists idx_products_business on public.products(business_id);
create index if not exists idx_invoices_business_date on public.invoices(business_id, issue_date desc);
create index if not exists idx_payments_business_date on public.payments(business_id, paid_at desc);
create index if not exists idx_expenses_business_date on public.expenses(business_id, expense_date desc);
create index if not exists idx_inventory_business_product on public.inventory_movements(business_id, product_id, occurred_at desc);
create index if not exists idx_transactions_business_date on public.transactions(business_id, occurred_at desc);
create index if not exists idx_audit_business_date on public.audit_events(business_id, created_at desc);

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.customers enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.transactions enable row level security;
alter table public.audit_events enable row level security;

-- Business and membership policies.
create policy businesses_member_read on public.businesses
for select to authenticated using (owner_id = auth.uid() or public.is_business_member(id));

create policy businesses_owner_insert on public.businesses
for insert to authenticated with check (owner_id = auth.uid());

create policy businesses_owner_update on public.businesses
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy business_members_read on public.business_members
for select to authenticated using (user_id = auth.uid() or public.is_business_member(business_id));

create policy business_members_owner_write on public.business_members
for all to authenticated using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);

-- Business-scoped policies for core tables.
create policy customers_member_all on public.customers
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy vendors_member_all on public.vendors
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy products_member_all on public.products
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy invoices_member_all on public.invoices
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy payments_member_all on public.payments
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy expenses_member_all on public.expenses
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy inventory_member_all on public.inventory_movements
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy transactions_member_all on public.transactions
for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

create policy audit_events_member_read on public.audit_events
for select to authenticated using (public.is_business_member(business_id));

create policy invoice_items_member_all on public.invoice_items
for all to authenticated using (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id and public.is_business_member(i.business_id)
  )
) with check (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id and public.is_business_member(i.business_id)
  )
);
