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

User-submitted photos of planted milkweed, shown as pins on a Leaflet map (`components/MilkweedMap.tsx`, CartoDB Positron tiles).

**Two kinds of pin**, distinguished by the `pin_type` column on the `public_milkweed_pins` view and rendered with different markers:
- `community` — public submissions. Marker is the **monarch butterfly** from the site's tab logo (`public/images/milkweed-butterfly.svg`, same artwork as `app/icon.svg`). Coordinates jittered, so the icon is centre-anchored (not pointing at an exact spot); photo required, moderated.
- `official` — milkweed planted by Claudia / Women for Green Spaces. Marker is the **green milkweed pod** (`public/images/milkweed-marker.svg`) — green because the org is "Women for *Green* Spaces". **Not** jittered, so the pod is bottom-tip-anchored at the exact spot; photo optional, added via the admin page. Also carries `milkweed_count` and an optional event (`event_name` + `event_date`); a non-null `event_name` *is* the "there was an event attached" flag, so there's no separate boolean. A date without a name is rejected (it would render as a dangling "· May 3"); a name without a date is fine. All are null for community pins, which don't collect them. A legend under the map explains the two markers (`MilkweedMap.legendCommunity` / `legendOfficial`). (Marker mapping changed 2026-07-20 — was previously a green pod for community and an orange pod for official; the orange `milkweed-marker-official.svg` was deleted.)

Official pins live in their own table, `milkweed_official_pins`, rather than as a flag on `milkweed_submissions` — **this is a security boundary, not an organizational preference**. The anon insert policy on `milkweed_submissions` only checks `status = 'pending'`, so if "official" were a column there, anyone could POST a row flagged official straight to Supabase's REST API using the publishable key (public by design) and it would render with Claudia's marker the moment it was approved. `milkweed_official_pins` instead has RLS on with *no policies at all*, so the anon key cannot touch it; only the service-role key can write, and that key is server-only (`lib/supabase/admin.ts`, `SUPABASE_SERVICE_ROLE_KEY`, no `NEXT_PUBLIC_` prefix). Don't "simplify" this into one table.

Flow: submitter fills out `/milkweed-map/submit` (`PlantMilkweedForm.tsx`) → photo uploads client-side straight to Supabase Storage bucket `milkweed-photos` → form POSTs to `/api/plant-milkweed` → route geocodes the address via Nominatim (`lib/geocode.ts`), **jitters coordinates ~0.5mi for privacy**, inserts a row with `status: 'pending'`, then emails the team (`notificationEmail`, best-effort — a mail failure never fails the already-saved submission) with a link to the admin page. Nothing shows publicly until a project admin approves it (see Admin page below — as of 2026-07-20 there's an in-app approve/reject UI; flipping `status` directly in the Supabase Table Editor still works too). The map page reads from the `public_milkweed_pins` view, which only exposes approved rows and never the private `email`/`address` columns.

Schema + RLS policies + storage bucket setup SQL: `supabase/schema.sql` (already run against the live Supabase project). Supabase client: `lib/supabase/client.ts`, exports `null` if env vars are missing so callers must handle the not-configured case explicitly.

### Admin page (`/admin/milkweed`)

Does two jobs: (1) **moderate community submissions** — a "Community submissions" section at the top lists pending rows (photo, name, plant name, email, address) with Approve / Reject buttons that POST to `/api/admin/submissions` (auth-checked independently, like `official-pins`; approve → `status='approved'`, reject → `'rejected'`, both guarded by `.eq('status','pending')` so a double-click is a no-op). Rendered by `components/PendingSubmissions.tsx`; the page server-fetches pending rows via `supabaseAdmin`. (2) **add official pins** — type a site name + address and the server geocodes it (same Nominatim path as public submissions, minus the jitter), with an optional photo. Supersedes the earlier "no in-app admin UI" MVP call; moderating submissions in the Supabase Table Editor still works as a fallback.

- Lives at `app/admin/` **outside** `app/[locale]` with its own root layout (`app/admin/layout.tsx`). This works because there's no top-level `app/layout.tsx` — Next allows multiple root layouts in that case. It's `noindex`. `proxy.ts` excludes `admin` from the next-intl matcher, or `/admin` would be redirected to `/en/admin`. A bare `/admin` redirects to `/admin/milkweed` (`app/admin/page.tsx`).
- **Bilingual (EN/ES) but deliberately NOT wired into next-intl** — the admin is excluded from locale routing, so instead of `/en`/`/es` URLs it uses a plain `admin_lang` cookie set by an EN/ES toggle in the layout header (`components/AdminLangToggle.tsx`). Strings live in a self-contained dictionary (`app/admin/dictionary.ts`, no server imports so client forms can import its *types*); the server reads the cookie (`app/admin/lang.ts` → `getAdminLang`) and passes the matching strings down to the client forms (`AdminLoginForm`, `OfficialPinForm`) as a `t` prop. Don't add Admin keys to `messages/en.json`/`es.json` — keep admin copy in its own dictionary. Backend API error strings (`/api/admin/*`) are still English-only; only the UI is translated.
- Auth (`lib/admin-auth.ts`) is a single shared password (`MILKWEED_ADMIN_PASSWORD`) + an HMAC-signed, httpOnly session cookie (`ADMIN_SESSION_SECRET`, 7-day expiry). There is no session store, so a token can't be revoked early except by rotating the secret (which logs everyone out) — fine for one admin, revisit if this ever needs real accounts.
- Both the page and `POST /api/admin/official-pins` check the cookie independently; the API check must stay, since gating only the page would leave the endpoint open.
- `event_date` is a Postgres `date` with no zone. `MilkweedMap.formatEventDate` parses it as `${date}T00:00:00` (local midnight) rather than passing the bare string to `new Date()`, which would read it as UTC midnight and render the *previous* day everywhere west of Greenwich — Chicago included. Verified: a bare parse shows an event entered as May 3 as "May 2".

The submission form also collects an optional `plant_name` ("Name your plant :)"), stored on `milkweed_submissions` and surfaced in the map popup above the submitter's display name.

`supabase/schema.sql` is the single source of truth and is **safe to re-run in full** — every statement is idempotent (`if not exists` / `or replace`, and `drop policy if exists` before each `create policy`). Keep it that way when adding to it: the Supabase SQL editor runs a script in one transaction, so one bare `create policy` throws "already exists" and silently rolls back the *entire* file, applying nothing. As of 2026-07-16 the live project is fully up to date with this file.

Both tables are empty as of 2026-07-16 — the old development test rows (`test@example.com`, `deploycheck@example.com`) have been deleted, so anything in there now is real.

## Email (Resend)

`app/api/host-a-screening/route.ts`, `app/api/contact/route.ts`, and the Plant Milkweed flow (Supabase, not email) all follow the same pattern: validate → return a graceful "not configured" error if `RESEND_API_KEY` is unset. **Resend is fully configured as of 2026-07-08.** Site domain is `dreamsofamonarch.com` (verified in Resend's dashboard); sender is `noreply@dreamsofamonarch.com` (`RESEND_FROM_EMAIL`).

Two distinct addresses in `data/content.ts`, deliberately not the same (2026-07-20): **`notificationEmail`** (`juliantrejo1@gmail.com`) is where all automated form notifications are sent — contact, host-a-screening, and milkweed submissions. **`hostAScreeningEmail`** (`jtrejofilms@outlook.com`) is the *public* contact shown as a `mailto:` in the footer only. They were split because **Outlook was silently junking Resend's automated mail** — a test to the Outlook address never arrived, while the same send to a Gmail landed fine (Resend reported success either way; the difference is inbox delivery, not sending). So notifications go to Gmail for reliability, but we don't expose a personal Gmail publicly. If deliverability to Outlook matters later, that's a DNS fix (SPF/DKIM are set via Resend; add/verify a **DMARC** record for the domain), not a code change.

## Environment variables

See `.env.example`. The original four (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) are set in both `.env.local` (gitignored) and Vercel's project settings. The Supabase publishable key is meant to be public/client-exposed — safe to share.

Three more were added for the milkweed admin page (2026-07-16): `SUPABASE_SERVICE_ROLE_KEY`, `MILKWEED_ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`. Unlike the publishable key these are **secrets** — none carry a `NEXT_PUBLIC_` prefix, and the service-role key bypasses RLS entirely, so it must never reach the browser.

## Assets

- `public/images/stills/` — 7 production stills from the film.
- `public/images/crew/` — headshots; `placeholder.svg` is a stand-in for crew members whose photo is still pending (none currently).
- `public/images/laurels/` — festival selection laurels for the Screenings page.
- `public/videos/` — `hero-home-v3.mp4` is the only one actually referenced by the Home page (see above). `hero-1.mp4` (original unsplit), `hero-1-claudia.mp4` (starts ~9.65s into `hero-1.mp4`), `hero-1-swarm.mp4` (ends at 9.5s — don't extend this past ~9.5s, see the Home page notes above), `hero-3.mp4`, `hero-4.mp4` are kept as source clips (used to build `hero-home-v3.mp4`) but aren't referenced by any page directly anymore. `hero-2.mp4` is used directly by the Screenings page hero band (moved there from About's "Story Behind the Story" section, see above). All trimmed from the production team's full-resolution ProRes "stringout" reel (not in this repo — it's ~1.9GB, lives in the director's Google Drive/Downloads).

## Known open items / content gaps

- Dev server default port is `60468`, configured in `.claude/launch.json` with `autoPort: true` as fallback (port 3000 is often occupied by other projects' sessions on this machine).
