# Chat Summarization — Session Handoff

> Read this first in a new session to resume cheaply. It captures *what's built, the current
> state, and what's pending* — without re-reading the whole transcript.
> Persona: act as **Kael Mercer** (creative CTO) per [CLAUDE.md](CLAUDE.md) + the creative-lead skill.

---

## 0. Project in one line
3D immersive, scroll-driven web assets (Apple-AirPods style) for **Abishek Tattoo Ink** (Kathmandu studio):
generate cinematic video → ffmpeg frames → WebP → scroll-scrub on `<canvas>`. Site lives in [web/](web/) (Next.js 14 / TS).

## 1. ✅ LIVE on Vercel
- **Production:** https://tattoo-3d-website.vercel.app — serving the real Next app (verified via curl: `/` → 200 HTML, `/design-2` → 200, `/_next` + frames served).
- **GitHub:** https://github.com/tiwariabishek44/tattoo_3d-website (branch `main`).
- **Deploy lessons (all fixed):**
  1. **500 MIDDLEWARE_INVOCATION_FAILED** → the edge `middleware.ts` (mobile UA redirect) crashed on Vercel. Fixed by moving the redirect **client-side** → [web/components/MobileRedirect.tsx](web/components/MobileRedirect.tsx).
  2. **404 NOT_FOUND (only `public/` served)** → Framework Preset stuck on "Other" (static-only deploy). Fixed permanently with [web/vercel.json](web/vercel.json) → `{ "framework": "nextjs" }`. **Root Directory in Vercel = `web`.**
- **Mobile routing PAUSED:** `MobileRedirect` is gated behind `ENABLED = false` → every device gets desktop view. Flip `ENABLED = true` to restore `/mobile`.
- **⚠️ Uncommitted work:** the **gallery + design-alignment work below is NOT yet committed/pushed.** Commit+push to deploy it. (`.next` corruption risk: verify with `cd web && npx tsc --noEmit`, NOT `next build`, while dev server runs.)

## 2. The Buddha unzip sequence ("Design 2") — DONE
A hoodie **unzips** to reveal a living **Buddha** chest tattoo. Replaced an earlier *spider* concept (cut: a living tattoo that *leaves* contradicts "ink that's alive"; Buddha = Kathmandu heritage, on-brand).
- **Asset pipeline:** anchor image (Buddha on dark-both-sides chest, premium hoodie, embroidered **Swayambhu-stupa crest** over the heart) → zipped first frame → unzip video → `buddha_chest_video.mp4` (in `web/public/`) → 240 frames → `web/public/frames-beat1/` (WebP). Body held **statue-still**; only the zip moves. Lighting dark + even both sides.
- **Engine:** [web/lib/spiderEngine.ts](web/lib/spiderEngine.ts) — dedicated forward-play, segment-aware renderer (windowed decode, clamp-to-cover, **reveal-zoom**). FrameEngine (machine hero) untouched.
- **Component:** [web/components/SpiderSequence.tsx](web/components/SpiderSequence.tsx) (`embedded` prop) + [web/components/SpiderText.tsx](web/components/SpiderText.tsx) (slogans, bottom-centered, ends on **"Ink that's alive."**).
- **Where it shows:** embedded on `/` (between BrandStatement & StatsBand, seam-safe gradient + feather bands) AND standalone `/design-2` (minimal showcase, nav link "Design 2").
- **Current scrub config** (top of SpiderSequence): `SEGMENTS` = frames **1→185** (186–240 are redundant held-reveal, capped); `VH_TOTAL = 1400`; `SCRUB_END = 0.82` (held-breath tail).

## 3. The reveal-zoom (web-layer "camera") — DONE
Plan: [web/REVEAL_ZOOM_PLAN.md](web/REVEAL_ZOOM_PLAN.md). It's a **scroll-driven canvas transform** (never baked into video), driven by the engine's smoothed value → buttery. NO breathing (removed).
- Arc: **tight on the zipper pull → hold → stepped pull-back (40% → hold → 80% → hold → 100%) → full-frame Buddha reveal → static hold.**
- Knobs (top of SpiderSequence): `REVEAL_ZOOM 2.2` (desktop) / `REVEAL_ZOOM_MOBILE 1.5`; `FOCAL_START {x:0.5, y:0.2}` (the pull); `REVEAL_STOPS` = keyframes `{at, e}` (e = pull-fraction 0→1, easeInOutCubic between, flat = hold) — includes a **crest-hold** (~e0.5, norm 0.20–0.40) so the viewer reads the stupa crest.
- Engine supports a `start?` per segment (trialed starting at frame 70 → reverted to frame 1; option left in, defaults to 1).

## 4. The Gallery section — DONE (Pinterest-style)
Replaced the old "Ink that tells your story" (`ParallaxSection`, now unused).
- **Component:** [web/components/GalleryPinterest.tsx](web/components/GalleryPinterest.tsx) — theme-aware (`light`/`dark`), but **only the LIGHT one is used** on the page now (dark instance removed).
- **Design:** full-bleed, neutral white, **5-col dense masonry** (natural aspect ratios), neutral chips, **hover gradient scrim** (top-dark → clear middle → gentle bottom, NO red Save button) + **⤢ expand** + category label, **click → lightbox** (←/→/Esc).
- **Data:** placeholder = the 6 `public/crousls_images/` photos, **mixed across categories with varied counts** (Realism 9, Traditional 7, Blackwork 6, Piercing 5, Cover-Up 4, Laser Removal 3). Swap for real images later (`CATS`/`POOL` at top).
- **UX fix:** masonry has a **`min-height: 70vh` floor** + items vertically centered → no section collapse / downstream jump when filtering.
- **Tuned values:** card `borderRadius: 20`, `columnGap: 24px`, `marginBottom: 24px`; bigger bold heading; bigger slogan + chips.
- Old plan doc: [web/GALLERY_PINTEREST_PLAN.md](web/GALLERY_PINTEREST_PLAN.md).

## 5. Site-wide design alignment — DONE (typography reverted)
- Added one **alignment token** `GUTTER` in [web/lib/theme.ts](web/lib/theme.ts) and applied it across **all sections** (BrandStatement, StatsBand, StylesCarousel, Artists, Process, Testimonials, BookingCTA) → shared left/right **rail / full-bleed**, removed centered `maxWidth: 1200`, left-aligned the previously-centered ones.
- **IMPORTANT:** we tried unifying *typography* too (bold serif 700 `headline()` everywhere) but the user felt it **lost the premium feel** → **reverted all typography to the original elegant weight-500 serif** (incl. SpiderText + HeroText captions). Only the **alignment** is unified now. `headline()`/`slogan()` helpers were removed; only `GUTTER` remains in theme.ts. **Gallery typography is its own (untouched).**

## 6. Page order (`web/app/page.tsx`)
`MobileRedirect → Header → ScrollSequence (machine hero) → BrandStatement → SpiderSequence(embedded, Buddha) → StatsBand → StylesCarousel → GalleryPinterest(light) → Artists → Process → Testimonials → BookingCTA → Footer → BookButton`

## 7. Key knowledge docs (operating discipline)
Before any prompt: read [prompt-architecture.md](prompt-architecture.md) + [findings-log.md](findings-log.md). After a reviewed video: update findings-log.
- Proven findings: clothing-unzip between locked frames is low-risk `[Confirmed 2x]`; "calm constant lighting identical to endpoints" suppresses Veo's light-burst `[2x]`; subject stillness holds; high-detail tattoo reveal held without shimmer; small chest crest recedes into shadow on its own; **audio prompt is discarded by our frame pipeline (keep minimal/none) but keep `(no subtitles)` — it's visual.**
- SSOTs: [spider-reveal-sequence.md](spider-reveal-sequence.md), [web/DESIGN2_SPIDER_PLAN.md](web/DESIGN2_SPIDER_PLAN.md), [tattoo-studio-hero.md](tattoo-studio-hero.md).

## 8. Verify / dev
- `cd web && npm install && npm run dev` → localhost:3000.
- **Always verify with `cd web && npx tsc --noEmit`** (NOT `next build` while dev runs — it corrupted `.next` once). Run tsc from inside `web/`.
- Frames: `cd tools && node frames-engine.js ../web/public/<video>.mp4` → `tools/output/<name>/{masters,webp}` (masters are gitignored).

## 9. Pending / next
- [ ] **Commit + push** the gallery + design-alignment work (not yet done) → auto-deploys.
- [ ] Real gallery images (swap the 6 placeholders) + their categories.
- [ ] Cleanup unused files: `web/components/Gallery.tsx` (old branded), `web/components/ParallaxSection.tsx` — both unused; offered to delete, user hasn't confirmed.
- [ ] Mobile path for `/design-2` (downscaled 720w frame sets + worker) — deferred. Mobile routing paused globally.
- [ ] **The user has a "deep thing" to share** — a new direction/idea — that's the next conversation.

## 10. User working style
Rapid iterate-and-review; shares Pinterest/reference screenshots; sharp on premium feel & narrative consistency; wants thoughts-before-code on big moves, then "start implementation"; values the docs/SSOT system; tight token budget (hence this summary).
