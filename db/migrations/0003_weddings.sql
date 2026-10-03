-- 0003_weddings.sql
-- A purchased wedding website (types/wedding.ts → WeddingConfig).
-- Scalar fields are columns; nested, editor-owned content is JSONB.

begin;

create table if not exists public.weddings (
  id                     uuid        primary key default gen_random_uuid(),
  owner_id               uuid        not null references public.accounts (id) on delete cascade,
  template_id            text        not null,
  slug                   text        not null,
  status                 text        not null default 'draft',
  tier                   text        not null default 'base',

  -- Couple
  partner1_name          text        not null default '',
  partner2_name          text        not null default '',
  wedding_date           date,
  venue_name             text        not null default '',
  venue_address          text        not null default '',
  venue_city             text        not null default '',

  -- Theme
  primary_color          text,
  accent_color           text,
  theme_preset_id        text,
  font_preset_id         text,

  -- Media
  hero_image_url         text,
  gallery_image_urls     text[]      not null default '{}',
  couple_story           text        not null default '',

  -- RSVP settings
  rsvp_deadline          date,
  meal_options           text[]      not null default '{}',
  allow_plus_one         boolean     not null default false,
  custom_questions       text[]      not null default '{}',

  -- Music: built-in track id, 'custom', or 'none'
  music_track_id         text        not null default 'none',
  music_custom_url       text,

  -- Optional sections: { registryLinks, travel, faq, weddingParty, schedule }
  sections               jsonb       not null default '{}',
  -- Per-section show/hide, keyed by AudienceSectionKey. Absent key = shown.
  section_visibility     jsonb       not null default '{}',

  -- Personalized tier
  section_audiences      jsonb       not null default '{}',
  private_sections       jsonb       not null default '[]',
  invite_greeting        jsonb,
  invite_lookup_enabled  boolean     not null default true,

  published_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint weddings_slug_key           unique (slug),
  constraint weddings_slug_format        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint weddings_status_check       check (status in ('draft', 'published')),
  constraint weddings_tier_check         check (tier in ('base', 'personalized')),
  constraint weddings_primary_color_hex  check (primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint weddings_accent_color_hex   check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint weddings_sections_object    check (jsonb_typeof(sections) = 'object'),
  constraint weddings_visibility_object  check (jsonb_typeof(section_visibility) = 'object'),
  constraint weddings_audiences_object   check (jsonb_typeof(section_audiences) = 'object'),
  constraint weddings_private_array      check (jsonb_typeof(private_sections) = 'array'),
  constraint weddings_greeting_object    check (invite_greeting is null or jsonb_typeof(invite_greeting) = 'object')
);

create index if not exists weddings_owner_id_idx on public.weddings (owner_id);

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at
  before update on public.weddings
  for each row execute function app.set_updated_at();

-- Ownership and tier are entitlements: only trusted server code (no end-user
-- identity on the connection) may change them. Owners edit everything else.
create or replace function app.guard_wedding_entitlements()
returns trigger
language plpgsql
as $$
begin
  if app.current_user_id() is not null
     and (new.tier is distinct from old.tier or new.owner_id is distinct from old.owner_id) then
    raise exception 'tier and owner_id can only be changed by the server'
      using errcode = '42501';
  end if;
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists weddings_guard_entitlements on public.weddings;
create trigger weddings_guard_entitlements
  before update on public.weddings
  for each row execute function app.guard_wedding_entitlements();

commit;
