-- 0013_sms_invitations.sql
-- Text invitations (Premium): guests get a mobile number, and every text sent
-- through UniSMS is logged so the dashboard can show who was texted and each
-- website is held to its allowance (app/api/sms/invitations).
--
-- Credits are reserved before anything is sent (app.reserve_sms), under a lock
-- on the website, so concurrent sends can't overspend and a text can't go out
-- without its row. Rows left 'pending' (a send that crashed) stay counted.

begin;

-- ─── Guest mobile number (types/wedding.ts → GuestListEntry.phone) ──────────

alter table public.guests
  add column if not exists phone text;

alter table public.guests drop constraint if exists guests_phone_length;
alter table public.guests
  add constraint guests_phone_length check (phone is null or length(phone) <= 40);

-- ─── Send log ────────────────────────────────────────────────────────────────

create table if not exists public.sms_messages (
  id           uuid        primary key default gen_random_uuid(),
  wedding_id   uuid        not null references public.weddings (id) on delete cascade,
  -- The guest-list entry the text was for; null for a number typed in by hand.
  -- No foreign key on purpose: deleting a guest must never make a reservation fail.
  guest_id     uuid,
  recipient    text        not null,
  guest_name   text        not null,
  -- Personal invite link, or the website's open link.
  link_kind    text        not null,
  content      text        not null,
  -- 160 characters per credit (UniSMS bills 1–5 credits per text).
  credits      integer     not null,
  -- UniSMS bulk id; null until the batch is accepted, or when skipped.
  bulk_id      text,
  -- pending = reserved, being sent; queued = accepted by UniSMS; skipped = not sent (refunded).
  status       text        not null default 'pending',
  -- Why UniSMS skipped it (e.g. a network the sender ID can't reach).
  error        text,
  created_at   timestamptz not null default now(),

  constraint sms_messages_link_kind_check check (link_kind in ('personal', 'site')),
  constraint sms_messages_status_check check (status in ('pending', 'queued', 'skipped')),
  constraint sms_messages_credits_check check (credits between 1 and 5),
  constraint sms_messages_content_length check (length(content) between 10 and 670)
);

create index if not exists sms_messages_wedding_idx on public.sms_messages (wedding_id, created_at desc);
create index if not exists sms_messages_recipient_idx on public.sms_messages (wedding_id, recipient);

-- Owners read their own log; only the server (service role) writes it.
alter table public.sms_messages enable row level security;

drop policy if exists sms_messages_owner_select on public.sms_messages;
create policy sms_messages_owner_select on public.sms_messages
  for select using (app.owns_wedding(wedding_id));

-- ─── Reserve credits before sending ──────────────────────────────────────────

-- Inserts `p_rows` as 'pending' if the website has the credits for all of them.
-- Rows to a number that already has `p_per_number` texts are left out and
-- returned with reserved = false. Raises 'sms_allowance' when the rest don't fit.
create or replace function public.reserve_sms(
  p_wedding_id uuid,
  p_allowance  integer,
  p_per_number integer,
  p_rows       jsonb
)
returns table (row_index integer, message_id uuid, reserved boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  used   integer;
  needed integer;
  item   record;
begin
  -- One send per website at a time.
  perform 1 from public.weddings w where w.id = p_wedding_id for update;

  select coalesce(sum(m.credits), 0) into used
  from public.sms_messages m
  where m.wedding_id = p_wedding_id and m.status in ('pending', 'queued');

  -- Credits for the rows that pass the per-number cap.
  select coalesce(sum((t.value->>'credits')::integer), 0) into needed
  from jsonb_array_elements(p_rows) t
  where (select count(*) from public.sms_messages m
         where m.wedding_id = p_wedding_id
           and m.recipient = t.value->>'recipient'
           and m.status in ('pending', 'queued')) < p_per_number;

  if used + needed > p_allowance then
    raise exception 'sms_allowance' using detail = format('used %s, needed %s, allowance %s', used, needed, p_allowance);
  end if;

  for item in
    select (t.ord - 1)::integer as i, t.value as v
    from jsonb_array_elements(p_rows) with ordinality as t(value, ord)
    order by t.ord
  loop
    row_index := item.i;
    -- Counted row by row, so duplicates within this send also respect the cap.
    if (select count(*) from public.sms_messages m
        where m.wedding_id = p_wedding_id
          and m.recipient = item.v->>'recipient'
          and m.status in ('pending', 'queued')) >= p_per_number then
      message_id := null;
      reserved := false;
    else
      insert into public.sms_messages (wedding_id, guest_id, recipient, guest_name, link_kind, content, credits)
      values (
        p_wedding_id,
        nullif(item.v->>'guest_id', '')::uuid,
        item.v->>'recipient',
        item.v->>'guest_name',
        item.v->>'link_kind',
        item.v->>'content',
        (item.v->>'credits')::integer
      )
      returning public.sms_messages.id into message_id;
      reserved := true;
    end if;
    return next;
  end loop;
end;
$$;

-- Service role only: the route checks ownership and the Premium plan first.
revoke all on function public.reserve_sms(uuid, integer, integer, jsonb) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
