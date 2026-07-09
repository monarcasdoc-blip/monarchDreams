<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sueños de una Monarca — project summary

Promotional/informational website for the documentary *Sueños de una Monarca* (Dreams of a Monarch), about Claudia Galeno-Sánchez's monarch butterfly conservation work in Pilsen, Chicago. Built with Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4, `next-intl` (English/Spanish), and Supabase.

**Repo**: `monarcasdoc-blip/monarchDreams` on GitHub, `main` branch. Local git pushes authenticate as GitHub user `kinoquizzes`, who is a collaborator on the repo (not the owner) — that's expected, not a misconfiguration.

**Hosting**: Vercel (Hobby/free tier), auto-deploys on every push to `main`. As of 2026-07-08, the Vercel project lives under the `monarcasdoc-blip` Vercel account (not `kinoquizzes`'s) and is connected to `monarcasdoc-blip/monarchDreams` directly — a prior misconfiguration had it connected to an unrelated `kinoquizzes/monarchdreams` repo, which silently ate every deploy trigger. If auto-deploys ever stop firing again, check Project Settings → Git on the `monarcasdoc-blip` account first.

## Pages (all under `app/[locale]/`, EN default / ES at `/es`)

- **Home** (`page.tsx`) — full-bleed background video hero, `hero-home-v2.mp4` (single file, loops), then hero text, synopsis, milkweed impact stat, screenings teaser. `HeroVideo` is a plain `<video autoPlay muted loop playsInline>` — no JS-driven multi-clip cycling. That JS approach (stacked `<video>` elements, crossfade, double-buffering, `transitionend`-gated swaps) went through several rounds of real bugs (mid-fade src swaps, Chrome firing genuine `ended` events on paused video-only/no-audio-track elements) that kept surfacing as "wrong clip flashes." The fix was to stop trying to sequence clips in the browser at all: `hero-home-v2.mp4` is `hero-1-claudia.mp4` + `hero-1-swarm.mp4` + `hero-3.mp4` + `hero-4.mp4` concatenated into one file. First attempt used `ffmpeg -f concat -c copy` (stream copy, no re-encode) — container-level timestamps and frame types looked clean at every splice under `ffprobe`, and single-frame extraction at each cut looked clean too, but a flash was still visible during actual continuous playback. Stream-copy concat doesn't guarantee the decoder's B/P-frame reference buffers reset cleanly across a splice, and that kind of corruption doesn't show up in a timestamp/frame-type probe or in freshly-seeked single-frame extraction (both start clean from a keyframe) — only in real uninterrupted playback. Rebuilt with `ffmpeg -filter_complex concat=n=4:v=1:a=0 -c:v libx264` instead, which fully re-decodes and re-encodes all four source clips into one genuinely continuous stream (fresh keyframe at every former splice point, no leftover reference-frame ambiguity). **Don't reintroduce JS-based multi-clip crossfading for this hero, and don't go back to stream-copy concat** — if the clip order or content ever needs to change, re-run the concat FILTER (re-encode) against the source clips in `public/videos/`. Also note: after the re-encode fix, the file was renamed `hero-home.mp4` → `hero-home-v2.mp4` purely to bust caching — updating a `/public` asset's *content* while keeping the same filename risks Vercel's CDN and/or the browser continuing to serve the old cached bytes at that URL indefinitely, even after a fresh deploy. **Any time a `/public` video or image is meaningfully re-exported/replaced (not just a small edit), give it a new filename** rather than overwriting the old one in place, or the fix may never actually reach visitors.
- **About** (`about/`) — synopsis (with "Women for Green Spaces" hyperlinked to `womenforgreenspaces.org` via `t.rich` + a `<womenLink>` tag in the messages files — same pattern to reuse for any future inline links in translated copy), "Story Behind the Story" section (background is `/videos/hero-2.mp4`, Dylan's animated illustration — this is an intentional exception to the "stills only on interior pages" rule below), "Meet the Team" crew grid. No gallery section (removed per request).
- **Screenings** (`screenings/`) — no hero image; plain centered title matching the Milkweed Map/Host a Screening pattern. Upcoming/past screening lists.
- **Host a Screening** (`host-a-screening/`) — form, emails via Resend.
- **Take Action** (`take-action/`) — hero banner uses still photo `stills[6]` (still-7.jpg, the mural photo), cropped via `objectPosition="center 5%"` to keep the raised arm/mural visible. Action cards including a link to Milkweed Map.
- **Milkweed Map** (`milkweed-map/` + `milkweed-map/submit/`) — see below.
- **Contact** (`contact/`) — form (name/email/message), emails via Resend. No more mailto link.

**Design rule established with the user**: only the Home page and the About "Story Behind the Story" section use video backgrounds (`HeroVideo` component). Screenings and Take Action use still-photo backgrounds (`HeroImage` component) with per-page `objectPosition` tuning — don't re-add video heroes to those without being asked.

## Content & i18n

- `data/content.ts` — non-translatable structured data: film info, screenings list, crew (slug/name/headshot/optional `headshotPosition` for per-photo crop tuning), stills paths, impact stat, donate info.
- `messages/en.json` / `messages/es.json` — all UI copy and translatable prose (crew bios/roles keyed by slug, page copy, form labels), loaded via `next-intl`.
- `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts` — next-intl config. Locale-aware `Link`/`redirect`/etc. come from `@/i18n/navigation`, not `next/navigation`.
- `proxy.ts` (not `middleware.ts` — Next 16 renamed the convention) wraps next-intl's routing middleware.

## Milkweed Map feature

User-submitted photos of planted milkweed, shown as pins on a Leaflet map (`components/MilkweedMap.tsx`, CartoDB Positron tiles, custom monarch-pod marker icon at `public/images/milkweed-marker.svg`).

Flow: submitter fills out `/milkweed-map/submit` (`PlantMilkweedForm.tsx`) → photo uploads client-side straight to Supabase Storage bucket `milkweed-photos` → form POSTs to `/api/plant-milkweed` → route geocodes the address via Nominatim (`lib/geocode.ts`), **jitters coordinates ~0.5mi for privacy**, inserts a row with `status: 'pending'`. Nothing shows publicly until a project admin flips `status` to `approved` directly in the Supabase Table Editor — there is no in-app admin UI by design (MVP decision, revisit only if asked). The map page reads from the `public_milkweed_pins` view, which only exposes approved rows and never the private `email`/`address` columns.

Schema + RLS policies + storage bucket setup SQL: `supabase/schema.sql` (already run against the live Supabase project). Supabase client: `lib/supabase/client.ts`, exports `null` if env vars are missing so callers must handle the not-configured case explicitly.

The submission form also collects an optional `plant_name` ("Name your plant :)"), stored on `milkweed_submissions` and surfaced in the map popup above the submitter's display name. **Action needed**: since `schema.sql` was already run once against the live project, the new `plant_name` column and the updated `public_milkweed_pins` view definition still need to be applied — run `alter table milkweed_submissions add column if not exists plant_name text;` and re-run the `create or replace view public_milkweed_pins ...` statement (both in `supabase/schema.sql`) in the Supabase SQL editor.

**Known cleanup needed**: two test rows (`test@example.com`, `deploycheck@example.com`) are sitting in the `milkweed_submissions` table from development testing — delete them via the Supabase dashboard before real moderation begins.

## Email (Resend)

`app/api/host-a-screening/route.ts`, `app/api/contact/route.ts`, and the Plant Milkweed flow (Supabase, not email) all follow the same pattern: validate → return a graceful "not configured" error if `RESEND_API_KEY` is unset. **Resend is fully configured as of 2026-07-08.** Site domain is `dreamsofamonarch.com` (verified in Resend's dashboard); sender is `noreply@dreamsofamonarch.com` (`RESEND_FROM_EMAIL`); both forms deliver to `juliantrejo1@gmail.com`. Both forms were tested end-to-end (submitted locally, confirmed `200` responses from Resend, success UI shown).

## Environment variables

See `.env.example`. All four vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) are set in both `.env.local` (gitignored) and Vercel's project settings. The Supabase publishable key is meant to be public/client-exposed — safe to share.

## Assets

- `public/images/stills/` — 7 production stills from the film.
- `public/images/crew/` — headshots; `placeholder.svg` is a stand-in for crew members whose photo is still pending: Divyesh Sangani, Claudia Galeno-Sánchez, and Thomas McDonnell.
- `public/images/laurels/` — festival selection laurels for the Screenings page.
- `public/videos/` — `hero-home-v2.mp4` is the only one actually referenced by the Home page (see above). `hero-1.mp4` (original unsplit), `hero-1-claudia.mp4`/`hero-1-swarm.mp4` (split from it at ~9.65s), `hero-3.mp4`, `hero-4.mp4` are kept as source clips (used to build `hero-home-v2.mp4`) but aren't referenced by any page directly anymore. `hero-2.mp4` is still used directly by the About page's "Story Behind the Story" section. All trimmed from the production team's full-resolution ProRes "stringout" reel (not in this repo — it's ~1.9GB, lives in the director's Google Drive/Downloads).

## Known open items / content gaps

- Divyesh Sangani's, Claudia's, and Thomas McDonnell's crew bios + headshots.
- "Story Behind the Story" text on About page is placeholder copy — the real story text is pending from the filmmaker.
- Dev server default port is `60468`, configured in `.claude/launch.json` with `autoPort: true` as fallback (port 3000 is often occupied by other projects' sessions on this machine).
