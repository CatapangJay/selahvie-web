-- 0010_seating.sql
-- Reception seating chart (types/wedding.ts → SeatingPlan), owner only.
-- { tables: [{ id, name, shape, seats, x, y }], assignments: { guestId: tableId }, sides: { guestId: side } }
-- The public site API strips it (lib/db/site.ts → redactForViewer).

begin;

alter table public.weddings
  add column if not exists seating_plan jsonb not null default '{}';

alter table public.weddings
  drop constraint if exists weddings_seating_plan_object;
alter table public.weddings
  add constraint weddings_seating_plan_object check (jsonb_typeof(seating_plan) = 'object');

commit;

notify pgrst, 'reload schema';
