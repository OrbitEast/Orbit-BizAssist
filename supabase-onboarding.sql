-- Orbit Biz — secure first-business onboarding
-- Applied to Supabase as migration: add_secure_business_onboarding

create or replace function public.create_business_for_current_user(
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_gstin text default null,
  p_address jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_business uuid;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  if nullif(btrim(p_name), '') is null then
    raise exception 'Business name is required';
  end if;

  if exists (select 1 from public.business_members where user_id = v_user) then
    raise exception 'This account already has a business workspace';
  end if;

  insert into public.businesses (name, email, phone, gstin, address)
  values (btrim(p_name), nullif(btrim(p_email), ''), nullif(btrim(p_phone), ''), nullif(upper(btrim(p_gstin)), ''), coalesce(p_address, '{}'::jsonb))
  returning id into v_business;

  insert into public.business_members (business_id, user_id, role)
  values (v_business, v_user, 'owner');

  return v_business;
end;
$$;

revoke all on function public.create_business_for_current_user(text, text, text, text, jsonb) from public;
grant execute on function public.create_business_for_current_user(text, text, text, text, jsonb) to authenticated;
