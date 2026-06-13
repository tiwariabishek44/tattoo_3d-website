# InkSpire — Creative Postmortem & Build Roadmap

> Audit date: 2026-06-12 · Auditor: Soren pass (full visitor + code-level review)
> Scope: desktop homepage (`/`) only. Mobile (`/mobile`) out of scope.
>
> **Standing constraints (per Abishek):**
> 1. Gallery + artist images stay as the current dummy assets for now — real
>    photography swaps in later. All asset-dependent work is **marked `[ASSET-SWAP LATER]`**
>    and the UI is built now against the dummies.
> 2. Booking stays on the current placeholder href for now — the real booking
>    link/form is wired later. Marked **`[LINK-SWAP LATER]`**.
> 3. Studio shoot is deferred. UI work proceeds now with existing assets.

---

## 0. The one-sentence verdict

The scroll *engine* is genuinely good (single Lenis clock, eased scrub,
all-intra video seeking) — but it is pointed at two object-fetish videos, one
repeated layout, default-grade typography, and a dead-end conversion path.
The "1%" feeling is **story, type, composition, and conversion** — not motion
plumbing.

---

## 1. Diagnosis

### 1.1 Macro — strategic failures (ranked by cost to the visitor journey)

#### M1 — Visitor held hostage before frame one — **CRITICAL**
- `web/components/EntryCurtain.tsx` blocks the whole site until ~15MB downloads
  (`hero_scrub.webm` 9.8MB + `buddha_scrub.webm` 5.2MB) — plus `public/logo.webp`
  is **3.8MB** for a header logo.
- On hotel WiFi / tourist 4G that's 30–90s staring at a progress bar. Skip
  appears only after 4s. Loader copy ("SHAPING THE SOUL…", "ELEVATING MIND…")
  reads camp against a premium brand.
- **Why it costs us:** most tourists bounce before first paint. This single
  decision outweighs every other finding combined.

#### M2 — Conversion path is a `mailto:` link — **CRITICAL**
- Every "BOOK A SESSION" resolves to `BOOKING_HREF` (mailto) in `web/lib/theme.ts`.
- A tourist mid-trip doesn't open a desktop mail client — they WhatsApp,
  IG-DM, or fill a 30-second form. `[LINK-SWAP LATER]` for the real link, but
  the **UI for a real booking path can be built now** against a placeholder.
- Nothing above the footer answers the tourist's real questions: *where are
  you, can I get in this week, what does it cost, is it sterile, English?*

#### M3 — Zero authentic content — **CRITICAL** `[ASSET-SWAP LATER]`
- Gallery builds **34 tiles from 6 stock images** (`GalleryPinterest.tsx`),
  one of which 404s. All four artists share one `DUMMY_PORTFOLIO` array.
  Testimonial artworks recycle the same 6 images. Hero subject is a generic CG
  tattoo machine; ServiceSlider is a re-skinned LunDev "ANIMAL" template demo.
- **Why it costs us:** the owners scrolled their own site and never saw their
  studio, their work, or their people. No choreography survives that.
- Per constraint: keep dummies for now — but **build the editorial UI now** so
  the real shoot drops straight in (data arrays only, no rework).

#### M4 — Two centerpieces, no story arc — **HIGH**
- First **12,720px (59% of the page)**: hero scrub (4,800px) → brand (1,680px)
  → Buddha scrub (6,240px). Spectacle → spectacle → spectacle, all about
  *objects* (a machine, a zipper) — not skin, artists, or Kathmandu.
- Two scrub videos cannibalize each other. Award rule: **one centerpiece per
  site.** The machine pendulum (R→L→R on scroll, `HeroVideo.tsx` `triEased`)
  is narratively empty — a screensaver the visitor operates.
- Then the page falls off a cliff into a white Pinterest grid. No five-act
  arc: no context beat, no proof crescendo, unearned resolution.

#### M5 — Dead scroll — **HIGH**
- ~21,500px total (~20 viewports) carrying ~8 viewports of content.
- Concrete dead zones: hero slogan 2 exits p=0.70, slogan 3 enters p=0.76
  (~290px of nothing); Buddha frames end at `SCRUB_END=0.93`, beats done by
  0.72 → last ~1,700px of the section is a held frame.
- **Why it costs us:** visitors read dead scroll as "broken" or "over" — this
  IS the "static site that happens to move" perception.

#### M6 — One layout, five times — **HIGH**
- Hero, BrandStatement, Buddha, ServiceSlider, BookingCTA are all the same
  composition: full-bleed dark bg + scrim + one text column.
- No grid, no asymmetry, no overlap, no type/image interaction, no editorial
  moment. Composition is what eyes register as design; there is exactly one.

### 1.2 Tactical — ranked

#### T1 — Scrubbed reading text — **HIGH**
- `HeroText.tsx` + `SpiderText.tsx` tie word-by-word reveals (y + per-word
  `filter: blur()`) directly to scroll progress.
- Reading speed becomes scroll speed: scroll normally and headlines assemble /
  disintegrate mid-sentence. Per-word blur during scroll is also paint-heavy.
- **Rule:** scrub spatial storytelling; **trigger** text. When a beat's window
  opens, play a 300–500ms masked rise once, then let it sit.

#### T2 — Typography is default-grade — **HIGH**
- Cormorant Garamond 300–500 at 8rem is the stock "elegant serif" — no voice,
  goes wispy at display size.
- No scale discipline: the section *label* "Our Service Offering" is set at
  the same `clamp(3.2rem, 7vw, 8rem)` as the hero promise. When everything
  shouts, nothing lands.
- Copy voice wobbles: "Permanence is a craft." (great) vs "Our Service
  Offering" (corporate) vs "ELEVATING MIND…" (camp).

#### T3 — Predictable palette, broken light transition — **MED-HIGH**
- Ink `#070605` + gold `#CBA45A` is the most worn "premium dark" combo in the
  genre — fine as base, can't carry the identity alone.
- The page's only light moment slams from black cinema into `#fafafa`
  Pinterest-white with zero transitional beat — the most jarring cut on the
  site, landing on its most generic section.
- `COLORS.cream #F1EADD` exists in tokens and is unused.

#### T4 — Interaction timing off-spec — **MED**
- ServiceSlider `BAR = 2.6s` for a *click* response — operated UI should
  answer in 200–400ms. Morph belongs at ~0.8s max.
- "Jinn eruption" spring (stiffness 59, damping 8.2) is bouncy toy easing on a
  luxury brand.
- Good tokens exist (`motionTokens.ts`: EASE_ARRIVAL / EASE_MECHANICAL) —
  they're just not enforced everywhere.

#### T5 — Header weight — **MED**
- 128px-tall, 3.8MB circular logo dominates top-left; nav hides on
  scroll-down leaving only the floating gold pill. Premium chrome whispers.

#### T6 — Robustness / perf flags — **MED**
- 404s: `/crousls_images/Tattoo-Piercing-Ideas-13-1.jpg` (live gallery tile),
  `/favicon.ico`.
- Framer Motion warning: `useScroll` container/target needs non-static
  position (offset miscalculation risk).
- Compositing load: two full-viewport `<video>` layers + 21.5k-px page; in a
  software-raster context the audit browser painted everything below ~8,000px
  black while the DOM was healthy. **Verify once on an old integrated-GPU
  laptop before launch.**
- `prefers-reduced-motion`: handled in Lenis/EntryCurtain/ServiceSlider (good),
  but the scrub sections have no designed calm variant — risk of frozen frame
  + unrevealed text. Verify.

#### T7 — Proof reads fake — **MED** `[ASSET-SWAP LATER]`
- Seven testimonials from seven nations with stock-pattern names + recycled
  artwork images + "500+" CountUp. The pattern is right; with placeholder
  evidence it reads invented, which is worse than absent. Cut to 3 strong ones
  when real quotes arrive; UI can be slimmed now.

---

## 2. Direction call — Pole C: Editorial / type-driven

Committed: **editorial type-driven motion** (Locomotive lineage). Not
bold-maximalist (A), not shader-quiet (B). Everything downstream flows from
this.

1. **The conversion engine is proof, and proof is editorial.** A tattoo
   decision is trust-driven: real healed work, real artists, real studio,
   presented like a printed monograph. Pole C forces the content fix.
2. **Matches actual capability.** No WebGL pipeline; weeks already spent on
   video-scrub infra. Pole C's spectacle is type + grid + masked reveals —
   award-grade achievable on the existing Framer Motion + Lenis stack.
3. **Differentiates.** Every premium tattoo site is dark + gold + full-bleed
   video. Editorial confidence — huge type, asymmetric grids, photography as
   plates — reads instantly more expensive in this category.
4. **The Buddha unzip survives as the single centerpiece.** It's the one
   original asset and a real idea (the art is *beneath the skin*). The hero
   machine scrub is cut/demoted — hardware worship at 9.8MB.

---

## 3. The 60% definition

"60%" = the studio owner scrolls it and goes quiet, then asks "who shot
this?" — and a tourist goes landing → booking request in under 90 seconds.

| Axis | Now | Target | What closes the gap |
|---|---|---|---|
| Typography | 2.5 | 8 | Display serif with a voice, enforced scale, rewritten labels |
| Color & light | 4 | 7 | Keep ink+gold, add cream "daylight" act, kill the white slam |
| Motion & smoothness | 5 | 7.5 | Grammar fixes (trigger text, 300ms UI), trim dead scroll |
| Narrative / story | 2 | 7.5 | Five-act re-cut, one centerpiece, subject = skin & people |
| Conversion clarity | 1 | 8.5 | Instant load, booking UI now (`[LINK-SWAP LATER]`), tourist answers |
| Content authenticity | 0.5 | 7 | `[ASSET-SWAP LATER]` — UI built now, real shoot drops in |

---

## 4. Build roadmap

Ordered by impact-per-effort. Phases 0 + 2 + 3 are fully buildable **now**
with current assets. Asset/link swaps are isolated to data arrays + one token.

### Phase 0 — Stop the bleeding *(weekend sprint, ~1 day of code)*

| # | Change | Files | Effort |
|---|---|---|---|
| 0.1 | **Kill the blocking preloader.** Curtain = 1.0–1.2s brand beat (logo in, dissolve), never waits on downloads. Hero shows poster immediately; videos stream in background and attach when ready (the `__heroVideoUrl` handoff already exists — stop gating the curtain on it). Delete "SHAPING THE SOUL…" status copy. | `web/components/EntryCurtain.tsx`, `HeroVideo.tsx`, `BuddhaVideo.tsx` | **S** (3–4h) |
| 0.2 | **Compress `logo.webp`** 3.8MB → ~30KB @ 256px. | `web/public/logo.webp` | **S** (min) |
| 0.3 | **Booking path UI.** Build `/book` page or modal: name, dates in Kathmandu, style, placement/size, reference upload + prominent WhatsApp / Instagram buttons. Wire to placeholder targets. `[LINK-SWAP LATER]` = change `BOOKING_HREF` + form action in ONE place. Add trust strip near first CTA: "Thamel, Kathmandu · English spoken · Single-use needles · Walk-ins & bookings." | `web/lib/theme.ts`, `web/components/BookButton.tsx`, `BookingCTA.tsx`, new `web/app/book/page.tsx` | **M** (1d) |
| 0.4 | Fix 404 gallery image + favicon. | `public/` | **S** (min) |

### Phase 1 — Studio shoot — **DEFERRED** `[ASSET-SWAP LATER]`
Shoot list parked for when the studio schedules it (kept here so it isn't lost):
- 20–30 finished pieces (healed + fresh, varied styles), neutral bg, consistent light
- 4 artist portraits (in-chair, working, not corporate)
- 6–8 studio environment shots (dragon mural, pool table, chair)
- one 10–15s macro video: needle on skin, slow, shallow focus → becomes the new hero loop
- 3 real client quotes with permission + photo of the actual piece

When assets arrive, swaps are data-only: `GalleryPinterest.tsx` POOL/CATS,
`ServiceSlider.tsx` SLIDES, `ArtistShowcaseSlider.tsx` ARTISTS/portfolios,
`Testimonials.tsx` REVIEWS, hero loop file. **No UI rework if Phases 3–4 are
built first.**

### Phase 2 — Typography & color system *(1–2 days)*

| # | Change | Files | Effort |
|---|---|---|---|
| 2.1 | Swap Cormorant → display serif with personality at 8rem+ (**Fraunces** w/ optical sizing is the free-tier pick — ink-trap character suits the brand). Keep Inter. | `web/app/layout.tsx` | **S** |
| 2.2 | Lock a 5-step scale in tokens: display `clamp(4.5rem, 9vw, 11rem)` (hero + CTA **only**) · h2 `clamp(2.6rem, 5vw, 5rem)` · section label = SMALL (demote, don't decorate) · lead 1.5rem · body 1.06–1.15rem. Tracking −0.02em → −0.04em as size grows. Sweep every component onto the scale. | `web/lib/theme.ts` + all section components | **M** |
| 2.3 | Rewrite labels in brand voice: "Our Service Offering" → "What we ink." Kill corporate phrasing site-wide. | section components | **S** |
| 2.4 | Color acts: keep ink + gold; promote unused `COLORS.cream` to a full "daylight" act (gallery + artists), feathered transition instead of the `#fafafa` slam. Optional one subtle film-grain overlay site-wide. | `theme.ts`, `GalleryPinterest.tsx`, `ArtistShowcaseSlider.tsx` | **S–M** |

### Phase 3 — The narrative re-cut *(the big one — 3–4 days)*

**Write the act-by-act scroll script in words and sign off on it BEFORE
touching `page.tsx`.** That discipline is what was missing from v1–v5: every
version polished the engine without re-cutting the film.

Target structure (~10 viewports total, down from ~21.5):

| Act | Budget | Content |
|---|---|---|
| 1 · Hook | **100vh** (not 600) | Type-led hero. Ambient loop (current machine video demoted to ≤2MB muted loop for now; macro ink video later `[ASSET-SWAP LATER]`). "Permanence is a craft." does a masked rise **on load**, not on scroll. One scroll hint. |
| 2 · Context | ~200vh | BrandStatement reworked editorial — asymmetric two-column, image one side, Nepali-heritage story in confident type. Trigger reveals, not scrub-gated opacity. |
| 3 · Centerpiece | ~400vh pinned | **Buddha unzip — the ONLY scrub on the site.** Trim track to frames-end (kill the `SCRUB_END` dead tail), retime beats so something changes every ≤80vh, beat text = threshold-triggered reveals. |
| 4 · Proof | natural flow, cream act | Editorial gallery → artists → 3 testimonials (Phase 4). |
| 5 · Resolution | 100vh | BookingCTA — right shape already, just needs to be earned. |

| # | Change | Files | Effort |
|---|---|---|---|
| 3.1 | Section order + budgets: `HERO_VH 600→100`, `SPIDER_VH` trimmed, `BRAND_VH` restructure | `web/lib/scrollBudget.ts`, `web/app/page.tsx` | **M** |
| 3.2 | New type-led hero (replaces machine scrub-on-scroll) | `web/components/ScrollSequence.tsx` → new hero component | **M** |
| 3.3 | Scrub→trigger conversion for all beat text (masked rise 300–500ms, `EASE_ARRIVAL`, fire once when window opens) | `HeroText.tsx`, `SpiderText.tsx` | **M** |
| 3.4 | BrandStatement editorial relayout | `BrandStatement.tsx` | **M** |

### Phase 4 — Proof sections to editorial grade *(2–3 days — UI now, dummies in place)* `[ASSET-SWAP LATER]`

| # | Change | Files | Effort |
|---|---|---|---|
| 4.1 | Gallery: Pinterest masonry → curated plates. 8–12 pieces large, asymmetric grid with deliberate size variation, caption block per piece (style · artist · hours · healed/fresh), masked-reveal entrances reusing `staggerDelay`, keep lightbox. "View all" can retain masonry for depth. Built against current dummy pool. | `GalleryPinterest.tsx` | **M–L** |
| 4.2 | Artists: keep current dummy portraits; voice-led quotes (copy is already good); each card deep-links to booking with artist preselected. | `ArtistShowcaseSlider.tsx` | **M** |
| 4.3 | ServiceSlider: cut `BAR` 2.6s → 0.8s morph + 0.3s text — or fold services into gallery captions and delete the section (page is over-sectioned). Decide at Phase 3 storyboard time. | `ServiceSlider.tsx` | **S–M** |
| 4.4 | Testimonials: slim UI to 3 featured slots (real quotes later). | `Testimonials.tsx` | **S** |

### Phase 5 — Polish gates *(1–2 days, before showing anyone external)*

- Easing/stagger sweep: everything onto `EASE_ARRIVAL` / `EASE_MECHANICAL`;
  retire the Jinn spring or tame it.
- Header slimming: logo ≤72px, lighter chrome.
- Hero load choreography: staged ~900ms entrance.
- `prefers-reduced-motion`: designed calm variant for both pinned sections
  (static keyframe + fully readable text).
- Contrast/scrim audit over photography (scrims, not text-shadow hope).
- 60fps profile on an integrated-GPU machine — also closes the
  black-compositing flag (T6).
- Fix Framer `useScroll` non-static-position warning.

---

## 5. If you only have a weekend

**Phase 0 + start of Phase 2 (font/scale swap).**
Kill the loader, build the booking UI (placeholder link), make the type speak.
That's "static site that moves a little" → "fast, confident, bookable" —
roughly 1% → 30% in two days, and it's all groundwork the later phases sit on.

The single highest-leverage *visible* move after that is the narrative re-cut
(Phase 3). The studio shoot stays the biggest unlock overall — schedule it
when ready; the UI will be waiting for the assets.

---

## 6. Jury self-check (weakest axis, named)

Weakest axis of this plan: **Creativity** — Pole C with one video centerpiece
is safe; there's no "interaction nobody's seen this year" yet. Accepted
deliberately: for this brand, authenticity + conversion outrank novelty, and
the unzip carries enough signature. If one flourish is added later, make it
typographic: **headline glyphs that fill with ink texture as they reveal** —
on-brand, cheap (one SVG mask), memorable.

---

## Appendix — quick-swap registry (the two deferred factors)

| Deferred item | Single swap point | Status |
|---|---|---|
| Real booking link/form action | `BOOKING_HREF` in `web/lib/theme.ts` + form action in `web/app/book/page.tsx` | `[LINK-SWAP LATER]` |
| Real gallery/artist/testimonial/hero assets | Data arrays: `GalleryPinterest.tsx` POOL/CATS · `ServiceSlider.tsx` SLIDES · `ArtistShowcaseSlider.tsx` ARTISTS · `Testimonials.tsx` REVIEWS · hero loop file in `public/` | `[ASSET-SWAP LATER]` |
