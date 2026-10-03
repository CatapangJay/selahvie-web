-- db/adapters/supabase/0001_auth.sql
-- Supabase-only glue. Run after every file in db/migrations/.
-- Moving off Supabase: skip this folder and have your server set
-- `app.current_user_id` per transaction instead (see 0001_foundation.sql).

begin;

-- Policies resolve the end user through Supabase Auth's JWT.
create or replace function app.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

-- Each account is a Supabase Auth user.
alter table public.accounts alter column id drop default;
alter table public.accounts drop constraint if exists accounts_id_auth_users_fkey;
alter table public.accounts
  add constraint accounts_id_auth_users_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- Mirror sign-ups and email changes from auth.users into public.accounts.
create or replace function app.sync_account_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null then
    return new;
  end if;
  insert into public.accounts (id, email, name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.sync_account_from_auth_user();

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function app.sync_account_from_auth_user();

-- Backfill users who signed up before this script ran.
insert into public.accounts (id, email, name)
select u.id, lower(u.email), coalesce(u.raw_user_meta_data ->> 'name', '')
from auth.users u
where u.email is not null
on conflict (id) do nothing;

commit;
