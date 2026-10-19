-- 0009_rsvp_guest_linking.sql
-- Links an RSVP to the guest list by the name typed in the form when the
-- browser didn't identify the guest (no invite link, and open-invite matching
-- is off or the site is Base). Linking only updates the guest's status; the
-- extra-guest allowance was already applied by rsvps_apply_allowance (0008),
-- which runs first because triggers fire in name order.

begin;

-- Best guest for a typed name, or null when nobody fits or two guests are
-- equally plausible. Mirrors matchGuestByName in lib/invitations.ts.
create or replace function app.match_guest_by_name(p_wedding_id uuid, p_name text)
returns uuid
language plpgsql
stable
set search_path = ''
as $$
declare
  q      text := app.normalize_name(left(p_name, 200));
  ids    uuid[];
  scores numeric[];
begin
  if length(q) < 3 then
    return null;
  end if;

  select array_agg(s.id order by s.score desc),
         array_agg(s.score order by s.score desc)
    into ids, scores
  from (
    select g.id, app.name_score(q, app.normalize_name(g.name)) as score
    from public.guests g
    where g.wedding_id = p_wedding_id
  ) s
  where s.score >= 0.8;

  if ids is null or (cardinality(ids) > 1 and scores[1] - scores[2] < 0.08) then
    return null;
  end if;
  return ids[1];
end;
$$;

create or replace function app.link_rsvp_guest()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.guest_id is null and not app.open_invite_matching_on(new.wedding_id) then
    new.guest_id := app.match_guest_by_name(new.wedding_id, new.guest_name);
  end if;
  return new;
end;
$$;

drop trigger if exists rsvps_link_guest on public.rsvps;
create trigger rsvps_link_guest
  before insert on public.rsvps
  for each row execute function app.link_rsvp_guest();

commit;
