-- Orbit BizAssist: run once in Supabase SQL Editor.
-- Enable Google provider in Authentication → Providers.
-- The browser stores business state only in this table; no local storage is used.

create table if not exists public.orbit_bizassist_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.orbit_bizassist_state enable row level security;

drop policy if exists "Orbit BizAssist owner can read state" on public.orbit_bizassist_state;
create policy "Orbit BizAssist owner can read state" on public.orbit_bizassist_state
for select to authenticated using (auth.uid()=user_id);
drop policy if exists "Orbit BizAssist owner can insert state" on public.orbit_bizassist_state;
create policy "Orbit BizAssist owner can insert state" on public.orbit_bizassist_state
for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "Orbit BizAssist owner can update state" on public.orbit_bizassist_state;
create policy "Orbit BizAssist owner can update state" on public.orbit_bizassist_state
for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
