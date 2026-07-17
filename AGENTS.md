<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sueños de una Monarca — project summary

Promotional/informational website for the documentary *Sueños de una Monarca* (Dreams of a Monarch), about Claudia Galeno-Sánchez's monarch butterfly conservation work in Pilsen, Chicago. Built with Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4, `next-intl` (English/Spanish), and Supabase.

**Repo**: `monarcasdoc-blip/monarchDreams` on GitHub, `main` branch. Local git pushes authenticate as GitHub user `kinoquizzes`, who is a collaborator on the repo (not the owner) — that's expected, not a misconfiguration.

**Hosting**: Vercel (Hobby/free tier), auto-deploys on every push to `main`. As of 2026-07-08, the Vercel project lives under the `monarcasdoc-blip` Vercel account (not `kinoquizzes`'s) and is connected to `monarcasdoc-blip/monarchDreams` directly — a prior misconfiguration had it connected to an unrelated `kinoquizzes/monarchdreams` repo, which silently ate every deploy trigger. If auto-deploys ever stop firing again, check Project Settings → Git on the `monarcasdoc-blip` account first.

## Pages (all under `app/[locale]/`, EN default / ES at `/es`)

- **Home** (`page.tsx`) — full-bleed background video hero, `hero-home-v3.mp4` (single file, loops), then hero text, synopsis, milkweed impact stat, screenings teaser. `HeroVideo` is a plain `<video autoPlay muted loop playsInline>` — no JS-driven multi-clip cycling.

  The hero video is passed `objectPosition="center top"`. The video is 16:9 (1280x720) but the hero box is wider (~2.2), so `object-cover` scales to fill width and crops ~137 source rows vertically — centered, that cut the top of every clip. Top-anchoring was requested (2026-07-16) to keep Claudia's raised hand and the upper butterfly decals visible in the orange-house clip; it also stops clipping her head in the opening clip and reveals the walkers' torsos in the closing field clip, so it's a win for all four clips, not a compromise. Note `objectPosition` applies to the whole `<video>` — there is no per-clip framing without re-encoding and rebuilding the concatenated file.

  This went through several rounds of chasing a reported "flash of Claudia" between clips before finding the actual cause, worth recording so it isn't repeated:
  1. Originally the Home hero cycled 3-4 separate `<video>` clips via JS (stacked elements, crossfade, double-buffering, `transitionend`-gated swaps). Each attempt fixed a real bug (mid-fade src swaps, Chrome firing genuine `ended` events on paused video-only/no-audio-track elements) but the flash persisted — because the JS layer was never actually the cause.
  2. Concatenated the clips into one file to remove the JS entirely. First pass used `ffmpeg -f concat -c copy` (stream copy) — clean per `ffprobe` frame/timestamp inspection and single-frame extraction at every splice, but the flash was still reported. (Re-encoding the whole thing with the concat *filter* instead of the demuxer was tried next and is generally the more correct way to concatenate clips with certainty, but turned out not to be the actual fix either.)
  3. The real cause: `hero-1-swarm.mp4` (one of the source clips) itself contained a few stray frames of Claudia at its own tail end — a leftover from originally cutting it with `-to 9.65` when the actual scene transition happens between 9.5s–9.6s, so the "swarm" clip secretly ran a beat too long into the next scene. This was invisible to timestamp/frame-type probing and to single-frame spot-checks at assumed splice points, because nobody had scanned the *entire* source clip's own footage for an embedded anomaly — only checked where the splices were expected to be. A full contact-sheet scan (`ffmpeg -vf fps=...,tile=...`) of each source clip end-to-end is what actually revealed it.
  4. Fixed by re-cutting that source clip to end at 9.5s (verified clean), then rebuilding `hero-home-v3.mp4` via `ffmpeg -filter_complex concat=n=4:v=1:a=0 -c:v libx264` (re-encode, not stream copy) from the corrected clips.

  **Lesson**: when a visual defect survives multiple fixes to the delivery mechanism (JS logic, concat method), stop trusting spot-checks at assumed problem locations and do a full contact-sheet scan of every source asset involved — the bug can be baked into a clip nobody re-examined. Also: renaming the output file at each iteration (`hero-home.mp4` → `-v2` → `-v3`) was necessary to bust Vercel/browser caching of a `/public` asset — overwriting a static file's content under the same filename doesn't reliably invalidate caches, so **give a new filename to any meaningfully re-exported `/public` video or image**, or a fix may never actually reach visitors.
- **About** (`about/`) — synopsis (with "Women for Green Spaces" hyperlinked to `womenforgreenspaces.org` via `t.rich` + a `<womenLink>` tag in the messages files — same pattern to reuse for any future inline links in translated copy), "Story Behind the Story" section, "Meet the Team" crew grid. No gallery section (removed per request). The story section originally used `/videos/hero-2.mp4` as a full-height moving background behind all the paragraph text — moved off video (2026-07-16) because the motion clashed with that much reading; it's now a short static hero band with just the heading, and the story paragraphs read below it on a plain background. The band image is `stills[3]` (still-4.png — monarchs in flight through pine forest with sun flare), cropped via `objectPosition="center 35%"`; it was chosen (2026-07-16) over the previous still-1.png because the band is a very wide ~4:1 strip that crops hard, and still-1 cut Claudia's face mid-forehead — still-4 is dark with an open center, so the overlaid title stays legible, and it echoes the Michoacán passage in the story copy. `hero-2.mp4` moved to the Screenings hero (see below).
- **Screenings** (`screenings/`) — hero banner uses `/videos/hero-2.mp4` (Dylan's animated illustration) behind the page title, matching the short fixed-height hero band pattern (`h-64 sm:h-80`) used elsewhere. Upcoming/past screening lists below.
- **Host a Screening** (`host-a-screening/`) — form, emails via Resend.
- **Take Action** (`take-action/`) — hero banner uses still photo `stills[6]` (still-7.jpg, the mural photo), cropped via `objectPosition="center 5%"` to keep the raised arm/mural visible. Action cards including a link to Milkweed Map.
- **Milkweed Map** (`milkweed-map/` + `milkweed-map/submit/`) — see below.
- **Contact** (`contact/`) — form (name/email/message), emails via Resend. No more mailto link.

**Design rule established with the user**: only the Home page and the Screenings hero band use video backgrounds (`HeroVideo` component) — Screenings inherited this from About's old story section. About, Take Action, and any other interior hero band use still-photo backgrounds (`HeroImage` component) with per-page `objectPosition` tuning — don't re-add video heroes elsewhere without being asked.

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
- `public/images/crew/` — headshots; `placeholder.svg` is a stand-in for crew members whose photo is still pending (none currently).
- `public/images/laurels/` — festival selection laurels for the Screenings page.
- `public/videos/` — `hero-home-v3.mp4` is the only one actually referenced by the Home page (see above). `hero-1.mp4` (original unsplit), `hero-1-claudia.mp4` (starts ~9.65s into `hero-1.mp4`), `hero-1-swarm.mp4` (ends at 9.5s — don't extend this past ~9.5s, see the Home page notes above), `hero-3.mp4`, `hero-4.mp4` are kept as source clips (used to build `hero-home-v3.mp4`) but aren't referenced by any page directly anymore. `hero-2.mp4` is used directly by the Screenings page hero band (moved there from About's "Story Behind the Story" section, see above). All trimmed from the production team's full-resolution ProRes "stringout" reel (not in this repo — it's ~1.9GB, lives in the director's Google Drive/Downloads).

## Known open items / content gaps

- Dev server default port is `60468`, configured in `.claude/launch.json` with `autoPort: true` as fallback (port 3000 is often occupied by other projects' sessions on this machine).
