-- 0002_accounts.sql
-- One row per signed-in customer. `id` matches the identity provider's user id
-- (Supabase: auth.users.id, linked in db/adapters/supabase/0001_auth.sql).
-- Credentials never live here; the auth provider owns them.

begin;

create table if not exists public.accounts (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null,
  name        text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint accounts_email_lowercase check (email = lower(email)),
  constraint accounts_email_format    check (email like '%_@_%')
);

create unique index if not exists accounts_email_key on public.accounts (email);

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function app.set_updated_at();

commit;
