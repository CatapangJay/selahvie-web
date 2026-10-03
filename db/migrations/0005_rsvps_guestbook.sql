-- 0005_rsvps_guestbook.sql
-- Guest responses and public well-wishes (types/wedding.ts → RSVPEntry,
-- GuestbookEntry).

begin;

create table if not exists public.rsvps (
  id                      uuid        primary key default gen_random_uuid(),
  wedding_id              uuid        not null references public.weddings (id) on delete cascade,
  -- Guest-list entry this response was linked to (invite link or name match).
  guest_id                uuid,
  guest_name              text        not null,
  email                   text,
  attending               boolean     not null,
  meal_choice             text,
  plus_one                boolean     not null default false,
  plus_one_name           text,
  additional_guests       integer     not null default 0,
  additional_guest_names  text[]      not null default '{}',
  message                 text,
  submitted_at            timestamptz not null default now(),
  -- Deleting a guest keeps the response but unlinks it (PostgreSQL 15+ column list).
  constraint rsvps_guest_fkey foreign key (wedding_id, guest_id)
    references public.guests (wedding_id, id) on delete set null (guest_id),
  constraint rsvps_guest_name_not_blank check (length(trim(guest_name)) > 0),
  constraint rsvps_guest_name_length check (length(guest_name) <= 200),
  constraint rsvps_message_length check (message is null or length(message) <= 2000),
  constraint rsvps_additional_guests_check check (additional_guests between 0 and 50)
);

create index if not exists rsvps_wedding_id_idx on public.rsvps (wedding_id, submitted_at desc);
create index if not exists rsvps_guest_id_idx on public.rsvps (guest_id) where guest_id is not null;

create table if not exists public.guestbook_entries (
  id          uuid        primary key default gen_random_uuid(),
  wedding_id  uuid        not null references public.weddings (id) on delete cascade,
  name        text        not null,
  message     text        not null,
  created_at  timestamptz not null default now(),
  constraint guestbook_name_not_blank check (length(trim(name)) > 0),
  constraint guestbook_name_length check (length(name) <= 200),
  constraint guestbook_message_not_blank check (length(trim(message)) > 0),
  constraint guestbook_message_length check (length(message) <= 2000)
);

create index if not exists guestbook_entries_wedding_id_idx
  on public.guestbook_entries (wedding_id, created_at desc);

commit;
