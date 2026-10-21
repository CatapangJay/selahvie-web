-- 0011_guest_side.sql
-- Whose side a guest is on (types/wedding.ts → GuestListEntry.side).
-- null = not set. Replaces the owner-only seating_plan.sides map, which the app
-- still reads as a fallback for guests without a side.

begin;

alter table public.guests
  add column if not exists side text;

alter table public.guests
  drop constraint if exists guests_side_check;
alter table public.guests
  add constraint guests_side_check check (side is null or side in ('partner1', 'partner2'));

commit;

notify pgrst, 'reload schema';
