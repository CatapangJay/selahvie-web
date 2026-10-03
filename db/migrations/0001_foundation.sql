-- 0001_foundation.sql
-- Plain PostgreSQL (15+). No vendor extensions or vendor schemas.
--
-- Layout
--   db/migrations/          Portable schema. Runs on any PostgreSQL 15+.
--   db/adapters/supabase/   Supabase-only glue (auth.users link, auth.uid()).
--
-- Apply in filename order, then the adapter for your platform:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001_foundation.sql
--   ...
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/adapters/supabase/0001_auth.sql
-- (Or paste each file into the Supabase SQL editor, in the same order.)
--
-- Every script is idempotent, so re-running one is safe.

begin;

-- Private schema for helpers; never exposed through an HTTP API.
create schema if not exists app;
grant usage on schema app to public;

-- Identity of the end user making the current request.
-- Portable default: the app server sets it per transaction:
--   select set_config('app.current_user_id', '<uuid>', true);
-- Platform adapters (e.g. Supabase) replace this function body.
create or replace function app.current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

-- Keeps updated_at current on every UPDATE.
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

commit;
