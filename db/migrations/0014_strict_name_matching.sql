-- 0014_strict_name_matching.sql
-- Name lookups match exactly once names are tidied, never by edit distance.
-- Before this, a 20% difference was allowed, so "Ana Cru" matched "Ana Cruz".
-- Mirrors normalizeName / nameScore in lib/invitations.ts.
--
-- Tidying: accents and ñ fold to plain letters ("Muñoz" = "Munoz"), apostrophes
-- drop ("O'Brien" = "OBrien"), other punctuation becomes a space, and
-- generational suffixes (Jr, Sr, II, III, IV) are ignored.
--
-- Scores (used unchanged by match_open_invite, 0008, and match_guest_by_name,
-- 0009, with their 0.8 threshold and 0.08 ambiguity margin):
--   1    the same name; spacing in compound surnames doesn't count
--        ("Juan Dela Cruz" = "Juan Delacruz")
--   0.9  first and last name with middle names left out
--        ("Maria Santos" finds "Maria Clara Santos")
--   0    anything else: a partial word, a typo, a first name alone
-- An exact match beats a middle-names-left-out one; two equally good matches
-- still ask for the invite code.

begin;

-- "  José  Muñoz-O'Brien Jr. " → "jose munoz obrien jr"
create or replace function app.normalize_name(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          replace(replace(replace(replace(
            translate(
              lower(regexp_replace(normalize(coalesce(input, ''), nfd), '[\u0300-\u036f]', '', 'g')),
              'øđðłı', 'oddli'),
            'æ', 'ae'), 'œ', 'oe'), 'ß', 'ss'), 'þ', 'th'),
          '[''’`´]', '', 'g'),
        '[^a-z0-9\s]', ' ', 'g'),
      '\s+', ' ', 'g'))
$$;

-- A normalized name's words, without generational suffixes.
create or replace function app.name_tokens(n text)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(t order by i), '{}')
  from unnest(string_to_array(n, ' ')) with ordinality as u(t, i)
  where t <> '' and t not in ('jr', 'sr', 'ii', 'iii', 'iv')
$$;

create or replace function app.name_score(q text, c text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  qt   text[] := app.name_tokens(q);
  ct   text[] := app.name_tokens(c);
  rest text;
begin
  if cardinality(qt) = 0 or cardinality(ct) = 0 then return 0; end if;
  if array_to_string(qt, '') = array_to_string(ct, '') then return 1; end if;
  if cardinality(qt) < 2 or cardinality(ct) < 2 or qt[1] <> ct[1] then return 0; end if;
  -- What follows the first name must be the candidate's last name(s), in whole words.
  rest := array_to_string(qt[2:], '');
  for k in 2..cardinality(ct) loop
    if array_to_string(ct[k:], '') = rest then return 0.9; end if;
  end loop;
  return 0;
end;
$$;

-- The edit-distance helper from 0008 is no longer used by name_score.
drop function if exists app.levenshtein(text, text);

commit;

notify pgrst, 'reload schema';
