-- Milkweed Map schema for Sueños de una Monarca
--
-- Paste the whole file into the Supabase SQL editor (Project > SQL Editor >
-- New query) and run it. It is safe to re-run: every statement is idempotent,
-- so this stays the single source of truth as the schema grows.
--
-- Keep it that way. The editor runs a script in ONE transaction, so a single
-- "already exists" error rolls the whole thing back and silently applies
-- nothing — which is exactly what happens if you add a bare `create policy`.

create extension if not exists "pgcrypto";

create table if not exists milkweed_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name text,
  email text not null,
  address text not null,
  plant_name text,
  lat double precision,
  lng double precision,
  photo_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text
);

-- Already ran schema.sql before and just need the new column? Run this alone:
-- alter table milkweed_submissions add column if not exists plant_name text;

alter table milkweed_submissions enable row level security;

-- The public can create a submission, but only ever as "pending" —
-- they can never insert a row that's already approved.
--
-- Dropped first so the whole file stays re-runnable. Postgres has no
-- `create policy if not exists`, and the Supabase SQL editor runs a script as a
-- single transaction — so without this, re-running to pick up a later change
-- aborts on "policy already exists" and NOTHING in the file gets applied.
drop policy if exists "Public can submit milkweed" on milkweed_submissions;
create policy "Public can submit milkweed" on milkweed_submissions
  for insert
  to anon
  with check (status = 'pending');

-- No public select policy on the base table: email and address (private)
-- are only ever visible to project admins via the Supabase dashboard.

-- ---------------------------------------------------------------------------
-- Official pins: milkweed planted by Claudia herself or with Women for Green
-- Spaces. These are a separate table from public submissions on purpose.
--
-- SECURITY: this table has RLS enabled and NO policies at all, which means the
-- anon (publishable) key can neither read nor write it. Only the service-role
-- key — used exclusively by the server-side admin route, never in the browser —
-- can insert. That is what makes the admin password meaningful: if official
-- pins were instead a flag on milkweed_submissions, anyone could POST a row
-- flagged "official" straight to Supabase's REST API with the publishable key
-- (which is public by design) and it would render with Claudia's icon as soon
-- as it was approved. A separate write-locked table makes that impossible
-- rather than merely discouraged.
--
-- Unlike submissions, these coordinates are NOT jittered: they mark public
-- community plantings (gardens, schools, parks), not anyone's home address.
create table if not exists milkweed_official_pins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site_name text not null,
  description text,
  address text,
  lat double precision not null,
  lng double precision not null,
  photo_url text,
  -- How many milkweed went in the ground here. Optional: Claudia doesn't
  -- always have an exact number.
  milkweed_count integer check (milkweed_count is null or milkweed_count > 0),
  -- Set when the planting happened as part of an event (a community planting
  -- day, a school workshop). Both optional and independent of each other: a
  -- named event with no firm date is common. event_name being non-null is what
  -- "there was an event attached" means — there's no separate boolean.
  event_name text,
  event_date date,
  published boolean not null default true
);

-- Already created milkweed_official_pins before these three columns existed?
-- Run this alone:
-- alter table milkweed_official_pins
--   add column if not exists milkweed_count integer check (milkweed_count is null or milkweed_count > 0),
--   add column if not exists event_name text,
--   add column if not exists event_date date;

alter table milkweed_official_pins enable row level security;

-- Public-safe view: approved submissions + published official pins, only
-- non-private columns. This is what the map page reads from.
--
-- The view is owned by postgres and runs with the owner's rights, so it can
-- read both base tables without either needing an anon select policy — this is
-- how the submissions half already worked.
--
-- NOTE: new columns are appended at the end so `create or replace` accepts it.
-- Postgres refuses to rename or reorder existing view columns in a replace; if
-- you ever need to, `drop view public_milkweed_pins;` first.
create or replace view public_milkweed_pins as
  select
    id, display_name, lat, lng, photo_url, created_at, plant_name,
    null::text as description,
    'community'::text as pin_type,
    null::integer as milkweed_count,
    null::text as event_name,
    null::date as event_date
  from milkweed_submissions
  where status = 'approved'
  union all
  select
    id, site_name, lat, lng, photo_url, created_at,
    null::text,
    description,
    'official'::text,
    milkweed_count,
    event_name,
    event_date
  from milkweed_official_pins
  where published;

grant select on public_milkweed_pins to anon;

-- Storage bucket setup (do this in Dashboard > Storage, or run below):
-- 1. Create a bucket named "milkweed-photos", set to public.
-- 2. Add a storage policy allowing anon INSERT (uploads) but not public
--    listing of arbitrary files — the app only ever reads back the
--    exact URL it just uploaded, and later only the URL stored against
--    an approved row is shown on the map.
--
-- insert into storage.buckets (id, name, public) values ('milkweed-photos', 'milkweed-photos', true)
-- on conflict (id) do nothing;
--
-- create policy "Public can upload milkweed photos" on storage.objects
--   for insert
--   to anon
--   with check (bucket_id = 'milkweed-photos');
--
-- create policy "Public can view milkweed photos" on storage.objects
--   for select
--   to anon
--   using (bucket_id = 'milkweed-photos');

-- To moderate: open Table Editor > milkweed_submissions, review pending rows
-- (photo_url opens the photo, address/email are visible only here), and
-- change `status` to 'approved' or 'rejected'.

-- Official pins are added from the admin page at /admin/milkweed (password in
-- MILKWEED_ADMIN_PASSWORD), which geocodes the address for you. To unpublish
-- one without deleting it, set `published` to false in the Table Editor.
