-- 0008_open_invite_matching.sql
-- Personalized tier: recognise a guest from the name typed in the RSVP form on
-- the open (generic) invitation, so guests the couple gave extra seats
-- (party_size > 1) get them without their personal link. Mirrors
-- lib/invitations.ts (normalizeName, matchGuestByName, plusOneAllowance).
--
--   * public.match_open_invite(wedding, name)  → match | needs-code | none
--   * public.match_open_invite_code(wedding, code) → match | none
--   * rsvps insert trigger: caps extra guests at what the guest is allowed and
--     marks the linked guest attending/declined.
--
-- The lookups only ever return a guest id and that guest's allowance: never
-- the invite code (which unlocks private content) or anyone else on the list.
-- Rate-limit calls at the API layer; a database function can't see the caller.

begin;

alter table public.weddings
  add column if not exists open_invite_matching boolean not null default true;

-- "  José  María-Santos " → "jose maria santos"
create or replace function app.normalize_name(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        lower(regexp_replace(normalize(coalesce(input, ''), nfd), '[\u0300-\u036f]', '', 'g')),
        '[^a-z0-9\s]', ' ', 'g'),
      '\s+', ' ', 'g'))
$$;

-- Plain PostgreSQL has no levenshtein() without the fuzzystrmatch extension.
-- Names are capped at 200 characters, so the O(n·m) loop stays small.
create or replace function app.levenshtein(a text, b text)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  la   integer := length(a);
  lb   integer := length(b);
  prev integer[];
  curr integer[];
  i    integer;
  j    integer;
begin
  if a = b then return 0; end if;
  if la = 0 then return lb; end if;
  if lb = 0 then return la; end if;
  prev := array(select generate_series(0, lb));
  for i in 1..la loop
    curr := array[i];
    for j in 1..lb loop
      curr := curr || least(
        prev[j + 1] + 1,
        curr[j] + 1,
        prev[j] + case when substr(a, i, 1) = substr(b, j, 1) then 0 else 1 end
      );
    end loop;
    prev := curr;
  end loop;
  return prev[lb + 1];
end;
$$;

-- Similarity of two normalized names, 0..1. Exact for scores of 0.8 and up
-- (the match threshold); names too different in length skip the edit distance
-- and return an upper bound below the threshold.
create or replace function app.name_score(q text, c text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  qt  text[] := string_to_array(q, ' ');
  ct  text[] := string_to_array(c, ' ');
  len integer := greatest(length(q), length(c));
begin
  if q = c then return 1; end if;
  if len = 0 then return 0; end if;
  -- "maria santos" finds "Maria Clara Santos".
  if cardinality(qt) >= 2 and qt <@ ct then return 0.92; end if;
  if abs(length(q) - length(c)) > 0.2 * len then
    return 1 - abs(length(q) - length(c))::numeric / len;
  end if;
  return 1 - app.levenshtein(q, c)::numeric / len;
end;
$$;

-- Extra guests a guest may name (matches MAX_ADDITIONAL_GUESTS = 19).
create or replace function app.guest_allowance(party_size integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select greatest(0, least(19, coalesce(party_size, 1) - 1))
$$;

-- Only published Personalized sites with matching left on answer lookups.
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
      and w.tier = 'personalized'
      and w.open_invite_matching
  )
$$;

create or replace function public.match_open_invite(p_wedding_id uuid, p_name text)
returns table (status text, guest_id uuid, allowance integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  q      text := app.normalize_name(left(p_name, 200));
  ids    uuid[];
  scores numeric[];
  sizes  integer[];
begin
  if length(q) < 3 or not app.open_invite_matching_on(p_wedding_id) then
    return query select 'none'::text, null::uuid, null::integer;
    return;
  end if;

  select array_agg(s.id order by s.score desc),
         array_agg(s.score order by s.score desc),
         array_agg(s.party_size order by s.score desc)
    into ids, scores, sizes
  from (
    select g.id, g.party_size, app.name_score(q, app.normalize_name(g.name)) as score
    from public.guests g
    where g.wedding_id = p_wedding_id
  ) s
  where s.score >= 0.8;

  if ids is null then
    return query select 'none'::text, null::uuid, null::integer;
  elsif cardinality(ids) > 1 and scores[1] - scores[2] < 0.08 then
    -- Two plausible guests: never guess, ask for the code.
    return query select 'needs-code'::text, null::uuid, null::integer;
  else
    return query select 'match'::text, ids[1], app.guest_allowance(sizes[1]);
  end if;
end;
$$;

create or replace function public.match_open_invite_code(p_wedding_id uuid, p_code text)
returns table (status text, guest_id uuid, allowance integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  code text := regexp_replace(upper(left(coalesce(p_code, ''), 40)), '[^A-Z0-9]', '', 'g');
begin
  if code <> '' and app.open_invite_matching_on(p_wedding_id) then
    return query
      select 'match'::text, g.id, app.guest_allowance(g.party_size)
      from public.guests g
      where g.wedding_id = p_wedding_id and g.invite_code = code;
    if found then return; end if;
  end if;
  return query select 'none'::text, null::uuid, null::integer;
end;
$$;

grant execute on function public.match_open_invite(uuid, text) to public;
grant execute on function public.match_open_invite_code(uuid, text) to public;

-- RSVPs arrive from anonymous visitors, so the allowance is enforced here,
-- not trusted from the browser. Identified guests on Personalized sites get
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
    when w_tier = 'personalized' and g_party_size is not null then app.guest_allowance(g_party_size)
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

drop trigger if exists rsvps_apply_allowance on public.rsvps;
create trigger rsvps_apply_allowance
  before insert on public.rsvps
  for each row execute function app.apply_rsvp_allowance();

-- A linked response updates the guest list (guests aren't writable by visitors).
create or replace function app.sync_guest_status_from_rsvp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.guests g
     set status = case when new.attending then 'attending' else 'declined' end
   where g.wedding_id = new.wedding_id and g.id = new.guest_id;
  return null;
end;
$$;

drop trigger if exists rsvps_sync_guest_status on public.rsvps;
create trigger rsvps_sync_guest_status
  after insert on public.rsvps
  for each row
  when (new.guest_id is not null)
  execute function app.sync_guest_status_from_rsvp();

commit;
