-- OrbitBiz — production relational schema
-- Run this migration in Supabase SQL Editor before enabling live business data.
-- Multi-tenant by business_id; every business-owned table is protected by RLS.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  email text,
  phone text,
  gstin text,
  pan text,
  address jsonb not null default '{}'::jsonb,
  currency text not null default 'INR',
  fiscal_year_start smallint not null default 4 check (fiscal_year_start between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','manager','staff','accountant','viewer')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  gstin text,
  tax_id text,
  billing_address jsonb not null default '{}'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb,
  opening_balance numeric(14,2) not null default 0,
  credit_limit numeric(14,2),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  gstin text,
  billing_address jsonb not null default '{}'::jsonb,
  opening_balance numeric(14,2) not null default 0,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  sku text,
  name text not null,
  item_type text not null default 'product' check (item_type in ('product','service')),
  category text,
  unit text not null default 'pcs',
  selling_price numeric(14,2) not null default 0,
  purchase_price numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  opening_stock numeric(14,3) not null default 0,
  reorder_level numeric(14,3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft','sent','partial','paid','overdue','cancelled')),
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'INR',
  subtotal numeric(14,2) not null default 0,
  discount_total numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  notes text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_number text,
  payment_date date not null default current_date,
  amount numeric(14,2) not null check (amount > 0),
  method text not null default 'bank_transfer',
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  expense_date date not null default current_date,
  category text not null,
  description text,
  amount numeric(14,2) not null check (amount >= 0),
  tax_amount numeric(14,2) not null default 0,
  payment_method text,
  reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  quantity numeric(14,3) not null,
  movement_type text not null check (movement_type in ('opening','purchase','sale','adjustment','return_in','return_out','transfer_in','transfer_out')),
  reference_type text,
  reference_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  account_type text not null default 'bank' check (account_type in ('cash','bank','card','wallet','other')),
  opening_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  code text,
  name text not null,
  account_type text not null check (account_type in ('asset','liability','equity','income','expense')),
  parent_id uuid references public.accounts(id) on delete set null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  entry_date date not null default current_date,
  reference_type text,
  reference_id uuid,
  narration text,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  debit numeric(14,2) not null default 0 check (debit >= 0),
  credit numeric(14,2) not null default 0 check (credit >= 0),
  description text,
  check (not (debit > 0 and credit > 0))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
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
create index if not exists idx_items_business on public.items(business_id);
create index if not exists idx_invoices_business_date on public.invoices(business_id, issue_date desc);
create index if not exists idx_payments_business_date on public.payments(business_id, payment_date desc);
create index if not exists idx_expenses_business_date on public.expenses(business_id, expense_date desc);
create index if not exists idx_stock_movements_item on public.stock_movements(item_id, created_at desc);
create index if not exists idx_audit_logs_business on public.audit_logs(business_id, created_at desc);

create or replace function public.is_business_member(target_business uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business and user_id = auth.uid()
  );
$$;

create or replace function public.is_business_admin(target_business uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business
      and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.customers enable row level security;
alter table public.vendors enable row level security;
alter table public.items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.stock_movements enable row level security;
alter table public.payment_accounts enable row level security;
alter table public.accounts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;
alter table public.audit_logs enable row level security;

-- Policies are intentionally recreated so this migration is safe to rerun.
do $$
declare t text; begin
  foreach t in array array['businesses','business_members','customers','vendors','items','invoices','invoice_items','payments','expenses','stock_movements','payment_accounts','accounts','journal_entries','journal_lines','audit_logs'] loop
    execute format('drop policy if exists orbit_member_select on public.%I', t);
    execute format('drop policy if exists orbit_member_insert on public.%I', t);
    execute format('drop policy if exists orbit_member_update on public.%I', t);
    execute format('drop policy if exists orbit_member_delete on public.%I', t);
  end loop;
end $$;

create policy orbit_member_select on public.businesses for select using (public.is_business_member(id));
create policy orbit_member_update on public.businesses for update using (public.is_business_admin(id));

create policy orbit_member_select on public.business_members for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.business_members for insert with check (public.is_business_admin(business_id));
create policy orbit_member_update on public.business_members for update using (public.is_business_admin(business_id));
create policy orbit_member_delete on public.business_members for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.customers for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.customers for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.customers for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.customers for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.vendors for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.vendors for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.vendors for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.vendors for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.items for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.items for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.items for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.items for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.invoices for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.invoices for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.invoices for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.invoices for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.invoice_items for select using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_business_member(i.business_id)));
create policy orbit_member_insert on public.invoice_items for insert with check (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_business_member(i.business_id)));
create policy orbit_member_update on public.invoice_items for update using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_business_member(i.business_id)));
create policy orbit_member_delete on public.invoice_items for delete using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_business_admin(i.business_id)));

create policy orbit_member_select on public.payments for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.payments for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.payments for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.payments for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.expenses for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.expenses for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.expenses for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.expenses for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.stock_movements for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.stock_movements for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.stock_movements for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.stock_movements for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.payment_accounts for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.payment_accounts for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.payment_accounts for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.payment_accounts for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.accounts for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.accounts for insert with check (public.is_business_admin(business_id));
create policy orbit_member_update on public.accounts for update using (public.is_business_admin(business_id));
create policy orbit_member_delete on public.accounts for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.journal_entries for select using (public.is_business_member(business_id));
create policy orbit_member_insert on public.journal_entries for insert with check (public.is_business_member(business_id));
create policy orbit_member_update on public.journal_entries for update using (public.is_business_member(business_id));
create policy orbit_member_delete on public.journal_entries for delete using (public.is_business_admin(business_id));

create policy orbit_member_select on public.journal_lines for select using (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and public.is_business_member(j.business_id)));
create policy orbit_member_insert on public.journal_lines for insert with check (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and public.is_business_member(j.business_id)));
create policy orbit_member_update on public.journal_lines for update using (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and public.is_business_member(j.business_id)));
create policy orbit_member_delete on public.journal_lines for delete using (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and public.is_business_admin(j.business_id)));

create policy orbit_member_select on public.audit_logs for select using (public.is_business_admin(business_id));
create policy orbit_member_insert on public.audit_logs for insert with check (public.is_business_member(business_id));

-- Keep updated_at consistent for mutable master records.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$ declare t text; begin
  foreach t in array array['businesses','customers','vendors','items','invoices'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
