-- 0007_row_level_security.sql
-- Row-level security, written against app.current_user_id() so the same
-- policies work on Supabase (auth.uid()) and on any PostgreSQL where the
-- server sets `app.current_user_id` per transaction.
--
-- Roles that own the tables (or have BYPASSRLS, e.g. Supabase service_role)
-- skip these policies; use them only from trusted server code.
--
-- Not exposed to end users on purpose:
--   * creating weddings / changing tier → server, after payment is verified
--   * reading a published site → server, so private sections and the guest
--     list are only returned to guests entitled to them

begin;

-- Helpers run as their owner so policies can check weddings without granting
-- end users read access to the weddings table.
create or replace function app.owns_wedding(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = target and w.owner_id = app.current_user_id()
  )
$$;

create or replace function app.is_published_wedding(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = target and w.status = 'published'
  )
$$;

grant execute on all functions in schema app to public;

alter table public.accounts            enable row level security;
alter table public.weddings            enable row level security;
alter table public.guest_groups        enable row level security;
alter table public.guests              enable row level security;
alter table public.guest_group_members enable row level security;
alter table public.rsvps               enable row level security;
alter table public.guestbook_entries   enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;

-- accounts: read and edit your own profile.
drop policy if exists accounts_select_own on public.accounts;
create policy accounts_select_own on public.accounts
  for select using (id = (select app.current_user_id()));

drop policy if exists accounts_update_own on public.accounts;
create policy accounts_update_own on public.accounts
  for update using (id = (select app.current_user_id()))
  with check (id = (select app.current_user_id()));

-- weddings: owners read and edit (tier/owner guarded by trigger in 0003).
drop policy if exists weddings_select_own on public.weddings;
create policy weddings_select_own on public.weddings
  for select using (owner_id = (select app.current_user_id()));

drop policy if exists weddings_update_own on public.weddings;
create policy weddings_update_own on public.weddings
  for update using (owner_id = (select app.current_user_id()))
  with check (owner_id = (select app.current_user_id()));

-- guest list: full control for the wedding owner.
drop policy if exists guest_groups_owner_all on public.guest_groups;
create policy guest_groups_owner_all on public.guest_groups
  for all using (app.owns_wedding(wedding_id))
  with check (app.owns_wedding(wedding_id));

drop policy if exists guests_owner_all on public.guests;
create policy guests_owner_all on public.guests
  for all using (app.owns_wedding(wedding_id))
  with check (app.owns_wedding(wedding_id));

drop policy if exists guest_group_members_owner_all on public.guest_group_members;
create policy guest_group_members_owner_all on public.guest_group_members
  for all using (app.owns_wedding(wedding_id))
  with check (app.owns_wedding(wedding_id));

-- rsvps: anyone may respond to a published site; only the owner reads/manages.
drop policy if exists rsvps_insert_published on public.rsvps;
create policy rsvps_insert_published on public.rsvps
  for insert with check (app.is_published_wedding(wedding_id));

drop policy if exists rsvps_owner_select on public.rsvps;
create policy rsvps_owner_select on public.rsvps
  for select using (app.owns_wedding(wedding_id));

drop policy if exists rsvps_owner_update on public.rsvps;
create policy rsvps_owner_update on public.rsvps
  for update using (app.owns_wedding(wedding_id))
  with check (app.owns_wedding(wedding_id));

drop policy if exists rsvps_owner_delete on public.rsvps;
create policy rsvps_owner_delete on public.rsvps
  for delete using (app.owns_wedding(wedding_id));

-- guestbook: public on published sites; the owner can also see and moderate.
drop policy if exists guestbook_select on public.guestbook_entries;
create policy guestbook_select on public.guestbook_entries
  for select using (app.is_published_wedding(wedding_id) or app.owns_wedding(wedding_id));

drop policy if exists guestbook_insert_published on public.guestbook_entries;
create policy guestbook_insert_published on public.guestbook_entries
  for insert with check (app.is_published_wedding(wedding_id));

drop policy if exists guestbook_owner_delete on public.guestbook_entries;
create policy guestbook_owner_delete on public.guestbook_entries
  for delete using (app.owns_wedding(wedding_id));

-- orders: buyers see their own; writes happen server-side only.
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (account_id = (select app.current_user_id()));

drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.account_id = (select app.current_user_id())
    )
  );

commit;
