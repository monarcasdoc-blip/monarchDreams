-- Milkweed Map schema for Sueños de una Monarca
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

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
create policy "Public can submit milkweed" on milkweed_submissions
  for insert
  to anon
  with check (status = 'pending');

-- No public select policy on the base table: email and address (private)
-- are only ever visible to project admins via the Supabase dashboard.

-- Public-safe view: only approved rows, only non-private columns.
-- This is what the map page reads from.
create or replace view public_milkweed_pins as
  select id, display_name, lat, lng, photo_url, created_at, plant_name
  from milkweed_submissions
  where status = 'approved';

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
