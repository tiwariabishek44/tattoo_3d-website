# Design 2 — "The Awakening" Spider Scroll Page (Plan / Single Source of Truth)

> A second design, reached from a **"Design 2"** nav link → a dedicated page (`/design-2`)
> where the **Beat 1 (unzip)** and **Beat 3 (awakening)** spider frames play as a
> **scroll-scrub story**, with slogans (fade in/out + depth) and a cinematic background overlay.
>
> Reuses our existing scrub engine — mostly wiring, not new architecture.

---

## Overview
- **Route:** new page at `/design-2`.
- **Nav:** add a **"Design 2"** link in the header (→ `/design-2`).
- **Content:** the spider story scrubbed by scroll — **Beat 1 (unzip)** then **Beat 3 (awakening)** — with brand slogans, fade-in/out, depth, and the vignette/grain/wash overlay.
- **Assets (ready):** `public/frames-beat1/` (240) + `public/frames-beat3/` (240) webp. *(Mobile downscaled sets = TODO.)*

## 1. Routing & nav
- Add `app/design-2/page.tsx`.
- Header `NAV`: add `"Design 2"` with a real `href="/design-2"` (the other links stay `#` for now). Optionally a "Design 1 / Home" link back to `/`.
- The page = `Header` + `SpiderSequence` (the scrub + text + overlay) + `Footer` + `BookButton`.

## 2. The two-beat scroll-scrub (technical approach)
The beats play **forward** (no ping-pong): Beat 1 frames 1→240, then Beat 3 frames 1→240 = **480 frames** over one scroll track.

**Recommended:** generalize `FrameEngine` to accept an optional **`segments`** array (backward-compatible — single `base/frameCount` still works):
```
segments = [
  { base: "/frames-beat1", count: 240 },
  { base: "/frames-beat3", count: 240 },
]
```
- Scroll progress 0→1 maps to a **global index 0→479**; the engine resolves which segment + local frame, and windows/decodes per segment (same createImageBitmap + close() logic, worker + main-thread for free).
- **Risk:** this touches the engine the machine hero uses → **regression-test the machine hero (`/`) after the refactor.** If we want zero risk to `/`, the fallback is a **dedicated `SpiderSequence` component** that reuses the same windowing logic but is separate.
- **Fit:** desktop `cover`, mobile `contain` (these frames are 16:9, like the machine).
- **Pacing:** `VH_PER_BEAT` (~400–450vh each) → ~800–900vh total. `SMOOTHING` as before.

## 3. Text / slogan layer (fade in/out + depth)
A `SpiderText` layer (modeled on `HeroText`) — beats fade in/out, rise + focus-in, parallax drift, mapped to scroll windows across the 480-frame scrub:

| Beat | Scroll ≈ | Eyebrow | Headline |
|---|---|---|---|
| A (start / hoodie) | 0–10% | Abishek TATTOO INK | **Beneath every layer.** |
| B (reveal / spider) | ~30% | THE ART | **Ink that's alive.** |
| C (awakening / crawl) | ~65% | — | **Art that refuses to stay still.** |
| D (aftermath / CTA) | ~90–100% | Abishek TATTOO INK | **Wear something that moves you.** + Book |

- Gold accent, off-white headlines, the cool→warm palette tokens from `theme.ts`.
- Localized gradient behind text for legibility (the frames are busy); parallax for depth.
- *(Copy is placeholder-premium — refine later.)*

## 4. Background overlay / depth
- Reuse **`HeroFx`** (radial vignette + film grain) over the canvas → cinematic depth + masks any AI softness.
- Plus the subtle global black **wash** + a slight canvas **contrast/saturation** bump (as on the hero).

## 5. Mobile (`/design-2` on phones)
- Worker + OffscreenCanvas rendering (our isolate path) for smooth scrub.
- **Generate downscaled mobile frame sets** (`frames-beat1-mobile`, `frames-beat3-mobile` at ~720w) — same engine, `widths:[720]` — so mobile memory/decode stays light. *(TODO before mobile ship.)*
- Mobile text → single-column (the responsive work we flagged in MOBILE-003 applies here too).

## 6. Config knobs (top of the component)
- `VH_PER_BEAT` · `SMOOTHING` · `MOBILE_FIT` · text beat `window`s · overlay strengths.

## 7. Build order
1. **Generalize `FrameEngine`** for `segments` (or build dedicated `SpiderSequence`) → regression-test `/`.
2. **`/design-2` route** + `SpiderSequence` scrubbing beat1→beat3 + `HeroFx` overlay.
3. **`SpiderText`** slogan beats (fade/depth).
4. **Nav link** "Design 2" → `/design-2`.
5. **Mobile** — downscaled frame sets + worker + single-column text.
6. Verify desktop + `/design-2` mobile.

## 8. Decisions (LOCKED)
- [x] **One continuous scrub** (480 frames, no hold). ✅
- [x] **Dedicated `SpiderEngine`/`SpiderSequence`** — zero risk to `/`. ✅
- [x] Slogans — placeholder-premium copy in (table §3); refine later.
- [x] **Minimal showcase chrome** — spider story + persistent Book button + subtle back link.

## 8b. Narrative decision — Beat 3 (crawl) CUT 🔑
The story's promise is **"Ink that's alive."** A living tattoo that **crawls off and leaves**
*contradicts* that promise — and contradicts the whole reason for a tattoo (permanence).
So the web sequence **ends at the reveal**, on the slogan, held. The contradiction is
specifically *departure* — an in-place "sign of life" (a breath / leg-flex that **stays**)
would *support* the message and is a possible **phase-2** asset.
**Beat 3 assets DELETED** (`frames-beat3`, `beat_last.mp4`, `tools/output/beat_last`).
*(If we ever want "your ink has a mind of its own" — a darker/Halloween concept — regenerate fresh.)*

## 9. Build status (v1 shipped — desktop)
**Done:**
- `lib/spiderEngine.ts` — forward-play, segment-aware renderer + breathing zoom. FrameEngine untouched.
- `components/SpiderSequence.tsx` — **Beat 1 only (240 frames)**, 480vh, `SCRUB_END=0.82` so the scrub finishes early and **holds on the reveal** (held breath). Breathing zoom (`ZOOM_AMP 0.07`, `ZOOM_CYCLES 2`).
- `components/SpiderText.tsx` — **2 bottom-centered beats**: "Beneath every layer." → **"Ink that's alive."** (+ "Alive in the skin — and yours for life." + Book CTA, persists over the held reveal).
- `app/design-2/page.tsx` — minimal showcase (back link + story + BookButton).
- `Header.tsx` — `NAV` now label+href; **"Design 2" → `/design-2`** added.
- `npx tsc --noEmit` clean.

**TODO (mobile):** downscaled `frames-beat1-mobile` (~720w) + worker/OffscreenCanvas path. Current mobile = main-thread `contain` fallback (works, heavier).

## 10. Embedded on the homepage (seam-safe)
`SpiderSequence` now takes an **`embedded`** prop. On `/` it's dropped **between `BrandStatement` and `StatsBand`** (`<SpiderSequence embedded />`). `/design-2` stays standalone (`<SpiderSequence />`), unchanged.
**Seam strategy** (insertion sits in a dark run — ink `#070605` above, charcoal `#100E0B` below):
- Outer bg = `ink → charcoal` gradient (matches both neighbours exactly).
- **Feather bands** (10vh) top/bottom melt the photo edges into the flat neighbour colors → no hard line.
- Loader bg fixed `#000 → #070605` (was a subtle step).
- When embedded: **scroll hint hidden**, **inline Book CTA dropped** (the page has the floating BookButton).
- Note: two scrub canvases on `/` (hero + spider) — both windowed-decode, memory bounded.

## Changelog
- **v1.4 (2026-06-06)** — **Spider → Buddha.** Generated `buddha_chest_video.mp4` (hoodie unzip → Buddha chest reveal, premium hoodie, embroidered stupa crest, both sides dark). Extracted → replaced `frames-beat1` (240). Old spider video `beat_fist.mp4` deleted (reference images kept). `LEFT_DARKEN` overlay **disabled** (source now natively dark on both sides). Homepage + `/design-2` both scrub the Buddha unzip. Nav "Design 2" unchanged. NEXT: proper plan for the web reveal-zoom (close-up pull → ease to full → hold). *(Component/file names still say "spider/beat1" — cosmetic debt, fine for now.)*
- **v1.3 (2026-06-06)** — `SpiderSequence` gains `embedded` prop; dropped into the homepage between BrandStatement and StatsBand with a seam-safe join (gradient bg matching both neighbours + 10vh feather bands + loader bg fix + hidden hint/CTA). `/design-2` unchanged.
- **v1.2 (2026-06-06)** — **Narrative cut:** Beat 3 (spider crawls off) removed — a living tattoo that *leaves* contradicts "Ink that's alive." Web now ends at the reveal (Beat 1 only, 240 frames) with a held-breath tail (`SCRUB_END`) + 2 slogans (ends on "Ink that's alive." + CTA). Added breathing zoom (parallax feel) + slowed scrub ~15%. **Beat 3 assets deleted.**
- **v1.1 (2026-06-06)** — Decisions locked (continuous / dedicated engine / minimal chrome). Desktop v1 built & type-checked: SpiderEngine + SpiderSequence + SpiderText + `/design-2` route + nav link.
- **v1.0 (2026-06-06)** — Initial plan: "Design 2" nav link → `/design-2` page scrubbing the spider Beat 1 + Beat 3 frames, with slogan beats (fade/depth), HeroFx overlay, and a segment-aware scrub engine. Assets (beat1/beat3 webp) ready; mobile sets TODO.
