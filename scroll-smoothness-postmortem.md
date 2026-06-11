# Scroll Smoothness — Postmortem & Remediation Plan

**Date:** 2026-06-11
**Owner:** Kael (creative-tech) / Abishek (impl)
**Status:** Plan only — implement later, phase by phase.

---

## 0. The one-sentence headline

> It is **not Lenis**. Lenis is the best-behaved component in the stack. The site
> stutters and feels different on every browser/device because the page runs
> **four-to-five independent scroll clocks on a congested main thread** — violating
> the "one clock" doctrine that [`web/lib/scrollPhysics.ts`](web/lib/scrollPhysics.ts)
> itself preaches but the rest of the app never adopted.

Two distinct symptoms, two distinct root causes. Do not conflate them.

| Symptom (what Abishek feels) | Root cause |
|---|---|
| **A. "Scroll isn't smooth" (jank)** | Main-thread starvation — heavy canvas draw + 10+ rAF loops can't finish in 16 ms |
| **B. "Different in Brave/Chrome/Firefox, different on other devices"** | (1) different main-thread budgets per engine, (2) browser wheel-input normalization differences amplified by our own device classifier, (3) multi-clock sampling-phase mismatch |

---

## 1. Evidence (what the code actually does)

### 1.1 Lenis is innocent — verified at source
`node_modules/lenis@1.3.23/dist/lenis.mjs:86`:
```js
this.value = damp(this.value, this.to, this.lerp * 60, deltaTime); // 1 - Math.exp(-λ·dt)
```
This is frame-rate-**independent** damping (Rory Driscoll method). Refresh rate
(60/120/144 Hz) does **not** change Lenis's feel. Lenis is correct. Keep it.

### 1.2 There are 4–5 scroll clocks, not one
Doctrine in `scrollPhysics.ts` header: "the page's single clock… reading
`lenis.targetScroll` is BANNED… forks the page into two clocks." Reality on `/`:

- **Lenis rAF** — page smoothing ([`SmoothScroll.tsx`](web/components/SmoothScroll.tsx))
- **`framer-motion useScroll`** — used **independently in 8 components**:
  `ScrollSequence`, `SpiderSequence`, `BrandStatement`, `ParallaxSection`,
  `ServiceReveal`, `GalleryPinterest`, `Testimonials`, `ScrollSequenceMobile`.
  Each samples **native `scrollY` on its own schedule** and does not know Lenis exists.
- **`ScrollPhysics` rAF** — `SpiderSequence` only ([`SpiderSequence.tsx:132`](web/components/SpiderSequence.tsx))
- **`MachineLoopEngine` rAF** — hero autoplay ([`ScrollSequence.tsx`](web/components/ScrollSequence.tsx))
- **Loose per-component rAFs** — `CustomCursor`, `CountUp`, `StatsBand`,
  `SpiderText`, `Header` each spin their own.

Net: **10+ concurrent `requestAnimationFrame` loops**, all on the main thread.

### 1.3 The hero canvas draws on the main thread
[`machineLoopEngine.ts`](web/lib/machineLoopEngine.ts): `new Image()` → decode via
`createImageBitmap` (good) → but `this.ctx.drawImage(...)` on a **main-thread 2D
context** every rAF tick, 240 frames. Decode is offloaded; **draw + loop are not.**

### 1.4 framer-motion never synced to Lenis
The 8 `useScroll` instances read native `scrollY`. Lenis eases the *real* scroll on
its rAF; framer samples that eased value a frame late on a *different* rAF. Result:
hero text, parallax zoom, and gallery reveals each track scroll on a **different
sampling phase** than the Lenis-smoothed page → sub-pixel judder that changes with
refresh rate and browser.

### 1.5 The device classifier introduces its own cross-browser variance
[`SmoothScroll.tsx`](web/components/SmoothScroll.tsx) classifies trackpad vs mouse
from `deltaMode`/delta magnitude and swaps Lenis lerp between `0.08` and `0.28`.
But `deltaMode` and `deltaY` magnitudes **differ between Blink (Chrome/Brave) and
Gecko (Firefox)** — so the classifier can pick a *different feel* per browser for
the same physical mouse. Additionally, its `currentLerp += (target - current) * 0.1`
ramp is **not** dt-normalized (unlike Lenis core), so it converges faster on high-Hz
displays — self-inflicted refresh-rate dependence sitting right next to a library
that got it right.

---

## 2. Why Jesko / antigravity feel smooth everywhere

They do the opposite of the above:

1. **One scroll authority, fanned out** — a single virtual-scroll value that
   *everything* reads. Not N independent `useScroll` instances re-sampling native scroll.
2. **The heavy visual is off the main thread / on the compositor** — `<video>` scrub,
   or WebGL/OffscreenCanvas in a worker, or GPU-composited CSS transforms. Main thread
   stays free, so scroll never starves. **This is the single biggest difference.**
3. **One tuned, frame-rate-independent feel** — they do not detect the device and swap
   feel; they pick one damping and make it dt-correct so 60 Hz and 144 Hz converge.

---

## 3. Remediation plan (phased, by leverage)

Implement top-down. Each phase is independently shippable and independently testable.

### Phase 1 — Get the hero frame-draw off the main thread  ⭐ highest leverage  ✅ DONE
**Killed Symptom A. Approach: scroll-scrubbed all-intra `<video>` (evolved from Path 1a
autoplay → bidirectional scrub at Abishek's direction — scrub removes the loop-seam
problem entirely, no boomerang needed).**

**Implemented & verified (2026-06-11):**
- **Assets** (`web/public/`, encoded all-intra `-g 1` from the 240 WebP frames via a
  no-sudo `ffmpeg-static` binary; every frame independently seekable):
  - `hero_scrub.webm` — VP9 all-intra, 9.8 MB (primary)
  - `hero_scrub.mp4` — H.264 all-intra, 7.1 MB (Safari fallback)
  - Smaller than the 12 MB / 240-request WebP sequence; one fetch; hardware-decoded.
- [`HeroVideo.tsx`](web/components/HeroVideo.tsx) — scroll position → `currentTime`
  via the shared progress MotionValue (one clock). Seeks fire only on scroll change,
  no idle rAF. `pause()`d — we own the playhead. Scroll down winds forward, scroll up
  reverses. Zoom 1.0→1.20 is a compositor `scale` transform.
- [`ScrollSequence.tsx`](web/components/ScrollSequence.tsx) — canvas + `MachineLoopEngine`
  removed; single `useScroll` feeds both HeroText and HeroVideo.
- **Verification:** all-intra seek latency avg 23.9 ms (random jumps) = scrub-ready,
  not chunky long-GOP. In-page bidirectional sweep confirmed exact proportional mapping
  (scroll 0→0s, 1vh→1.26s, reverse tracks back). Typecheck clean. Hero renders correctly.
- Removed the unused autoplay copy `hero_machine.mp4`.

**Follow-ups (non-blocking):** source is 720p — re-encode at 1080p when a higher-res
asset exists; `MachineLoopEngine` + the 240 `/frames` WebPs are now dead for the hero
(keep only if `/hero-v2*` sandboxes still use them, else prune later).

### Phase 1b — Buddha unzip, same treatment  ✅ DONE (2026-06-11)
- **Assets** (`web/public/`, all-intra from `frames-beat1` frames 77→185, the actual
  scrub range): `buddha_scrub.webm` (VP9, 5.1 MB) + `buddha_scrub.mp4` (H.264, 3.4 MB).
- [`BuddhaVideo.tsx`](web/components/BuddhaVideo.tsx) — scroll→`currentTime` through the
  same scrub window (0.15→0.82). The cinematic reveal (open 1.55× on the zipper pull at
  focal (0.5,0.2), stepped pull-back to 1.0× centered) is reproduced EXACTLY — the
  `pullFraction` + `REVEAL_STOPS` + focal-lerp math copied verbatim from `SpiderEngine`,
  now a GPU `scale`+`transform-origin` transform instead of a canvas camera.
- [`SpiderSequence.tsx`](web/components/SpiderSequence.tsx) — `SpiderEngine`/`ScrollPhysics`
  canvas stack retired; one `useScroll` drives both `SpiderText` and `BuddhaVideo`.
- **Verified:** page `<canvas>` count now **0** (both sequences off main thread). Reveal
  curve matches the old engine numerically (zoom 1.55→1.0, focal 20%→50%) and the
  story/text/stats-fold-in render correctly. Typecheck clean.
- **Now-dead for prod:** `SpiderEngine`, `frameEngine`, `ScrollPhysics`, `frames-beat1/`,
  `frames/` (12+9.7 MB). Prune once `/hero-v2*` + `/design-2` sandboxes are confirmed gone.

### Phase 2 — SUPERSEDED. The remaining problem is RHYTHM, not jank.
The postmortem listed 3 causes for Symptom B; the **dominant** one was main-thread canvas
congestion (Phases 1+1b), now removed. With the main thread freed, the framer-`useScroll`
phase-mismatch is negligible — the hero proves it (framer `useScroll` + video = "god level").
So we do NOT rewire 8 components to Lenis. The real residual issue is different — see Phase 5.

### Phase 5 — Uniform scroll rhythm (the macro miscorrection)  ⭐ in progress
**Symptom (Abishek):** scroll feels uniform between two normal sections, but NON-uniform
("gear change" + a flash/wipe) when passing *into or out of* a pinned sequence section —
worst at **BrandStatement** (sandwiched between hero + Buddha) and **ServiceSlider** (after
Buddha).

**Deep re-postmortem — root cause: there is no single felt scroll-rate.** Each section's
height was hand-tuned in isolation (`scrollBudget.ts` literally notes "B-6 retune is a
human-pass item"). The result is **five different rhythms** stacked back to back, with
**dead-scroll zones clustered exactly at the seams**:

| Section | Height (desktop px) | Rhythm | Dead-scroll |
|---|---|---|---|
| Hero (scrub) | 4800 | live scrub ~17 px/frame | minimal — *feels great* |
| BrandStatement | 2000 | reveal over **arrival only** (`["start end","start start"]`) | ~1000 px **dead pinned tail** |
| Buddha (scrub) | 8160 | live scrub ~50 px/frame (**3× heavier than hero**) | ~1224 px open hold + ~1469 px reveal-tail hold |
| ServiceSlider | 2000 | **no `useScroll`** — click-driven, pinned | ~entire 2000 px is dead scroll |
| Gallery→Footer | content | normal 1:1 flow | none — *feels fine* |

Two concrete mechanisms:
1. **Dead-scroll at the boundaries.** You scroll hundreds–thousands of px while the visual
   is *held* (Buddha edge holds; Brand's pinned tail; Service's static pin). Entering/leaving
   a sequence therefore has a stretch of "scroll but nothing moves" → reads as heavy / catches.
2. **Felt-rate mismatch.** Hero scrubs at ~17 px/frame; Buddha at ~50; Brand reveals over ~1
   screen then nothing; Service is click-only; content is 1:1. No two neighbours share a rate.

**The fix is calibration, not new engines** — remove dead-scroll at the seams and pull the
rhythms toward one another, WITHOUT touching the hero (loved) or the story beats.

**Tuning applied (2026-06-11):**
- **Buddha** ([`BuddhaVideo.tsx`](web/components/BuddhaVideo.tsx) + `SPIDER_VH`): trim edge
  holds `SCRUB_START 0.15→0.06`, `SCRUB_END 0.82→0.93`, and `SPIDER_VH 1020→780`. Net: the
  *active* scrub px/frame stays ~constant (loved feel preserved) but ~2000 px of dead pre/post
  roll is removed and the section drops from 8160→6240 px (less "endless heavy" outlier).
  REVEAL_STOPS are in norm-space so the reveal curve auto-rescales — story untouched.
- **BrandStatement** ([`BrandStatement.tsx`](web/components/BrandStatement.tsx) + `BRAND_VH`):
  offset `["start end","start start"]→["start start","end end"]` so the 5-beat reveal plays
  *live across the whole pinned hold* (kills the dead pinned tail), `BRAND_VH 250→210` to keep
  reveal pace sensible.
- **ServiceSlider** (`SERVICE_VH 250→200`): shorten the dead click-driven pin zone after Buddha.

**Feel-calls to confirm with Abishek:** the height numbers (`SPIDER_VH 780`, `BRAND_VH 210`,
`SERVICE_VH 200`) change perceived pace — dial any of them if a section feels too fast/slow.

**Original options (for reference):**

> **DECISION REQUIRED (Abishek's call):** two viable paths.
>
> - **Path 1a — `<video>` scrub (pragmatic).** Replace the 240-frame canvas loop with
>   an encoded `<video>` driven by scroll → `currentTime` (or autoplay for the hero
>   loop). ~90% of the smoothness for a fraction of the work; the browser decodes on
>   its own threads and composites on the GPU. **Recommended** unless per-frame WebGL
>   grading/shaders are required.
> - **Path 1b — OffscreenCanvas + Worker (full engine).** The path already specced in
>   [`render-engine-plan.md`](render-engine-plan.md). Keeps the shader layer
>   (grade/vignette/sub-frame interp) and full preload control. More work; correct if
>   the brand asset needs per-frame GPU treatment.

**Files:** `machineLoopEngine.ts`, `ScrollSequence.tsx`, (1b also: `frames.worker.ts`,
`public/workers/`).
**Acceptance:** hero scrubs/plays at 60 fps with main-thread idle > 8 ms/frame in
Performance panel, on a mid-tier device, in Firefox.

### Phase 2 — Make Lenis the single clock
**Kills the Symptom B phase-mismatch (§1.4).**

- Drive `framer-motion` from Lenis instead of native scroll: feed a shared MotionValue
  from a **single** `lenis.on("scroll")` subscription, and have the 8 components read
  *that* instead of calling `useScroll` independently. (Equivalently: a tiny
  `useLenisProgress(target, offset)` hook that all sections consume.)
- `scrollPhysics` already reads `lenis.scroll` — leave it; it is the reference pattern.
- **Goal:** every scroll-reactive element samples the *same* eased value on the *same*
  tick. One clock, fanned out.

**Files:** new `web/lib/useLenisScroll.ts`; edits to the 8 `useScroll` call-sites.
**Acceptance:** hero text / parallax / gallery reveals move in lockstep with the page
under slow scrub — no element lagging a frame behind another.

### Phase 3 — Stop swapping the feel per device (or normalize it)
**Removes the remaining self-inflicted cross-browser variance (§1.5).**

- Preferred: pick **one** tuned lerp for all pointer devices and delete the 0.08↔0.28
  swap. Trackpads already carry native momentum; a single well-chosen value is more
  consistent than a fragile classifier.
- If keeping the classifier: (a) `deltaMode`-first is already in place — keep it;
  (b) **dt-normalize** the `currentLerp` ramp (`1 - Math.exp(-λ·dt)` instead of `* 0.1`).

**Files:** `SmoothScroll.tsx`.
**Acceptance:** identical perceived feel in Chrome, Brave, Firefox with the same mouse;
identical settle time on 60 Hz and 144 Hz.

### Phase 4 — Collapse the loose rAF loops
**Reduces baseline main-thread load.**

- One shared ticker (or Lenis's own rAF) fans out to `CountUp`, `StatsBand`,
  `SpiderText`, `Header`, `CustomCursor`. Stop N independent `requestAnimationFrame`
  loops competing for the same 16 ms.

**Files:** new `web/lib/useTicker.ts`; the 5 component call-sites.
**Acceptance:** ≤ 2 persistent rAF loops at rest (Lenis + the shared ticker);
DevTools shows no redundant scroll/animation callbacks stacking per frame.

---

## 4. Verification protocol (run after each phase)

1. **Scrub test** — drag slowly; smoothness is judged scrubbed, never on autoplay.
2. **Cross-browser** — Chrome, Brave, Firefox on the same laptop; feel must match.
3. **Cross-device** — the laptop + one weaker device; no frame drops on either.
4. **Performance panel** — main thread must have headroom (idle > 8 ms/frame) during
   an active hero scroll; if it's pegged, Phase 1 isn't done.
5. **Refresh-rate** — if a 120/144 Hz display is available, settle time must match 60 Hz.

---

## 5. Out of scope / parked

- **Touch (mobile) feel** — third input regime; phones route to `ScrollSequenceMobile`.
  Address after desktop is coherent.
- **`prefers-reduced-motion`** currently drops Lenis entirely → canvas scrubs on raw
  native scroll for those users. Defensible, but make it a conscious call later.
- **Brand/asset convergence** — separate track (placeholder `animal_images` etc.).

---

## 6. The honest framing

The V2 single-clock engine in `scrollPhysics.ts` is correct and the doctrine is
written down. Then the app grew eight `framer-motion useScroll` calls and a
main-thread canvas around it. **The engine isn't wrong — the app stopped obeying it.**
This plan is about making the whole page obey the clock the engine already defines.
