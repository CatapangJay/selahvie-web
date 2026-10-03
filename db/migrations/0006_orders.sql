-- 0006_orders.sql
-- Checkout records. Amounts are integer cents (PHP by default, see lib/tiers.ts).
-- Orders outlive accounts so financial history is never lost.

begin;

create table if not exists public.orders (
  id                  uuid        primary key default gen_random_uuid(),
  account_id          uuid        references public.accounts (id) on delete set null,
  email               text        not null,
  buyer_name          text        not null default '',
  payment_method      text        not null,
  status              text        not null default 'pending',
  currency            text        not null default 'PHP',
  total_cents         integer     not null,
  -- Payment provider's charge/session id, for reconciliation.
  provider_reference  text,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  constraint orders_email_lowercase check (email = lower(email)),
  constraint orders_payment_method_check check (payment_method in ('gcash', 'maya', 'card')),
  constraint orders_status_check check (status in ('pending', 'paid', 'failed', 'refunded')),
  constraint orders_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint orders_total_check check (total_cents >= 0)
);

create index if not exists orders_account_id_idx on public.orders (account_id);
create index if not exists orders_email_idx on public.orders (email);
create unique index if not exists orders_provider_reference_key
  on public.orders (provider_reference) where provider_reference is not null;

-- "template": a new website at a tier. "upgrade": Personalized add-on for an owned website.
create table if not exists public.order_items (
  id                uuid    primary key default gen_random_uuid(),
  order_id          uuid    not null references public.orders (id) on delete cascade,
  kind              text    not null,
  template_id       text    not null,
  tier              text    not null,
  wedding_id        uuid    references public.weddings (id) on delete set null,
  unit_price_cents  integer not null,
  constraint order_items_kind_check check (kind in ('template', 'upgrade')),
  constraint order_items_tier_check check (tier in ('base', 'personalized')),
  constraint order_items_price_check check (unit_price_cents >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_wedding_id_idx on public.order_items (wedding_id) where wedding_id is not null;

commit;
