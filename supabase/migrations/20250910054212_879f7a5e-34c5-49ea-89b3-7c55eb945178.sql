-- Function to get user_id by email from auth.users
create or replace function public.get_user_id_by_email(_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from auth.users
  where email = _email
$$;