-- 0004_guests.sql
-- Guest list, guest groups, and group membership (types/wedding.ts →
-- GuestListEntry, GuestGroup). Composite foreign keys keep every row inside
-- the same wedding as its parent.

begin;

create table if not exists public.guest_groups (
  id           uuid        primary key default gen_random_uuid(),
  wedding_id   uuid        not null references public.weddings (id) on delete cascade,
  name         text        not null,
  invite_code  text        not null,
  created_at   timestamptz not null default now(),
  constraint guest_groups_invite_code_key unique (invite_code),
  constraint guest_groups_wedding_id_id_key unique (wedding_id, id),
  constraint guest_groups_name_not_blank check (length(trim(name)) > 0)
);

create table if not exists public.guests (
  id           uuid        primary key default gen_random_uuid(),
  wedding_id   uuid        not null references public.weddings (id) on delete cascade,
  name         text        not null,
  email        text,
  party_size   integer     not null default 1,
  status       text        not null default 'invited',
  note         text,
  invite_code  text        not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint guests_invite_code_key unique (invite_code),
  constraint guests_wedding_id_id_key unique (wedding_id, id),
  constraint guests_name_not_blank check (length(trim(name)) > 0),
  constraint guests_party_size_check check (party_size between 1 and 50),
  constraint guests_status_check check (status in ('invited', 'attending', 'declined', 'pending'))
);

create index if not exists guests_wedding_id_idx on public.guests (wedding_id);

drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at
  before update on public.guests
  for each row execute function app.set_updated_at();

create table if not exists public.guest_group_members (
  wedding_id  uuid not null,
  group_id    uuid not null,
  guest_id    uuid not null,
  primary key (group_id, guest_id),
  foreign key (wedding_id, group_id) references public.guest_groups (wedding_id, id) on delete cascade,
  foreign key (wedding_id, guest_id) references public.guests (wedding_id, id) on delete cascade
);

create index if not exists guest_group_members_guest_id_idx on public.guest_group_members (guest_id);

commit;
