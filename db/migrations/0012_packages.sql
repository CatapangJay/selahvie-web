-- 0012_packages.sql
-- Three packages replace Base / Personalized (lib/tiers.ts → TIER_MODULES):
--   essential  details, countdown, schedule, RSVP, guest list
--   classic    + entourage, gallery, music, FAQ
--   premium    + guestbook, QR codes, invitation download, personalization, seating
-- Existing sites keep what they had: base → classic, personalized → premium.
-- (Base included the guestbook; on Classic it is hidden, its entries are kept.)
--
-- Also: RSVP phone number and dietary restrictions (types/wedding.ts → RSVPEntry).

begin;

-- ─── Tier values ─────────────────────────────────────────────────────────────

-- The entitlement trigger only blocks end-user connections; this runs as the owner.
alter table public.weddings drop constraint if exists weddings_tier_check;
update public.weddings set tier = 'classic' where tier = 'base';
update public.weddings set tier = 'premium' where tier = 'personalized';
alter table public.weddings alter column tier set default 'essential';
alter table public.weddings
  add constraint weddings_tier_check check (tier in ('essential', 'classic', 'premium'));

-- Order history keeps what was sold, renamed to the package it became.
alter table public.order_items drop constraint if exists order_items_tier_check;
update public.order_items set tier = 'classic' where tier = 'base';
update public.order_items set tier = 'premium' where tier = 'personalized';
alter table public.order_items
  add constraint order_items_tier_check check (tier in ('essential', 'classic', 'premium'));

-- ─── Functions that checked for 'personalized' (from 0008) ───────────────────

-- Only published Premium sites with matching left on answer lookups.
create or replace function app.open_invite_matching_on(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = target
      and w.status = 'published'
      and w.tier = 'premium'
      and w.open_invite_matching
  )
$$;

-- RSVPs arrive from anonymous visitors, so the allowance is enforced here,
-- not trusted from the browser. Identified guests on Premium sites get
-- party_size - 1; everyone else gets the site-wide plus-one (1 or 0).
create or replace function app.apply_rsvp_allowance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  w_tier       text;
  w_plus_one   boolean;
  g_party_size integer;
  allowed      integer;
  names        text[];
begin
  select w.tier, w.allow_plus_one into w_tier, w_plus_one
  from public.weddings w where w.id = new.wedding_id;

  if new.guest_id is not null then
    select g.party_size into g_party_size
    from public.guests g where g.wedding_id = new.wedding_id and g.id = new.guest_id;
  end if;

  allowed := case
    when w_tier = 'premium' and g_party_size is not null then app.guest_allowance(g_party_size)
    when w_plus_one then 1
    else 0
  end;

  select coalesce(array_agg(t.n order by t.ord), '{}')
    into names
  from (
    select btrim(u.n) as n, u.ord
    from unnest(coalesce(new.additional_guest_names, '{}')) with ordinality as u(n, ord)
    where btrim(u.n) <> ''
    order by u.ord
    limit allowed
  ) t;

  if not new.attending then
    new.additional_guests := 0;
    names := '{}';
  else
    new.additional_guests := least(
      greatest(coalesce(new.additional_guests, 0), cardinality(names), case when new.plus_one then 1 else 0 end),
      allowed
    );
    names := names[1:new.additional_guests];
    -- Older clients send the single plus-one only as plus_one_name.
    if cardinality(names) = 0 and new.additional_guests > 0 and nullif(btrim(new.plus_one_name), '') is not null then
      names := array[btrim(new.plus_one_name)];
    end if;
  end if;

  new.additional_guest_names := coalesce(names, '{}');
  new.plus_one := new.additional_guests > 0;
  new.plus_one_name := case
    when new.plus_one then coalesce(new.additional_guest_names[1], nullif(btrim(new.plus_one_name), ''))
  end;
  return new;
end;
$$;

-- ─── Guestbook is a Premium module ───────────────────────────────────────────

create or replace function app.has_guestbook(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = target and w.tier = 'premium'
  )
$$;

drop policy if exists guestbook_insert_published on public.guestbook_entries;
create policy guestbook_insert_published on public.guestbook_entries
  for insert with check (app.is_published_wedding(wedding_id) and app.has_guestbook(wedding_id));

-- ─── RSVP: phone and dietary restrictions ────────────────────────────────────

alter table public.rsvps
  add column if not exists phone text,
  add column if not exists dietary_restrictions text;

alter table public.rsvps drop constraint if exists rsvps_phone_length;
alter table public.rsvps
  add constraint rsvps_phone_length check (phone is null or length(phone) <= 40);
alter table public.rsvps drop constraint if exists rsvps_dietary_length;
alter table public.rsvps
  add constraint rsvps_dietary_length check (dietary_restrictions is null or length(dietary_restrictions) <= 500);

commit;

notify pgrst, 'reload schema';
