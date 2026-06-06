# Reveal-Zoom Plan — web-layer "camera" for the Buddha unzip (SSOT)

> A scroll-driven **virtual camera** for the hoodie-unzip scrub: start **tight on the zipper
> pull**, **dolly back** to the full frame as the zip opens, then **hold** full-frame on the
> revealed Buddha. The camera move lives entirely in the **web layer** (canvas transform on flat
> frames) — never baked into the video. **No breathing / ambient zoom** — the reveal-zoom is the
> only motion.

Applies to `SpiderSequence` (used on `/` embedded **and** `/design-2`). Frames = `frames-beat1` (240, Buddha unzip).

---

## 1. The feel (what the viewer experiences)
1. **Scroll 0** — camera is **zoomed in on the zipper pull** (top-centre, near the collar). Intimate, withholding.
2. **Scrolling** — the zip glides down **and** the camera **eases back**, keeping the pull/reveal in view.
3. **~20% of the unzip** — camera has settled to the **full frame**.
4. **20% → 100%** — full-frame, the hoodie finishes opening, the **Buddha is revealed**.
5. **Tail (held breath)** — full-frame **static** hold on the revealed Buddha (existing `SCRUB_END`). No motion.

## 2. Principles
- **Web layer only.** We transform flat frames on the canvas; Veo never moved. Zero morph risk, fully reversible, fully tunable.
- **Driven by SMOOTHED scroll.** The engine already smooths the frame index; we drive the zoom off that same smoothed value (`norm`) → buttery, no raw-scroll jitter.
- **Clamp-to-cover.** The drawn frame must always fill the canvas — never reveal an empty/black edge. Focal point is honoured *within* that constraint (lots of freedom when zoomed in; forced to centre as zoom → 1).
- **One motion only.** Remove the ambient breathing zoom (`ZOOM_AMP`/`ZOOM_CYCLES`). The reveal-zoom is the sole camera motion; after it settles, the frame is static.

## 3. Motion spec (the math)
Let `norm` = smoothed progress 0→1 (the engine's `current/(total-1)`; reaches 1 by `SCRUB_END`, then holds).

**Zoom** (monotonic pull-back, then constant):
```
zoom(norm) = norm >= REVEAL_END
           ? 1.0
           : lerp(REVEAL_ZOOM, 1.0, easeOutCubic(norm / REVEAL_END))
```
- `REVEAL_ZOOM` = start magnification (e.g. **2.2×**).
- `REVEAL_END` = the `norm` where zoom reaches full frame (e.g. **0.20** = "20% of the unzip").
- `easeOutCubic` → decelerates into the full frame (premium settle).

**Focal point** (what stays centred), eases alongside the zoom:
```
focal(norm) = lerp(FOCAL_START, FOCAL_CENTER, easeOutCubic(min(norm/REVEAL_END, 1)))
```
- `FOCAL_START` = the zipper pull ≈ **(0.5, 0.20)** (top-centre, normalized image coords).
- `FOCAL_CENTER` = **(0.5, 0.5)**.

**Draw (generalized, clamp-to-cover):**
```
scale   = baseScale(cover/contain) * zoom
sW, sH  = iw*scale, ih*scale
drawX   = 0.5*cw - focal.x*sW      // put focal point at screen centre…
drawY   = 0.5*ch - focal.y*sH
drawX   = clamp(drawX, cw - sW, 0) // …but never reveal an edge (cover guarantee)
drawY   = clamp(drawY, ch - sH, 0)
```
At `zoom = 1` this reduces to the current centred cover draw. ✔ backward compatible.

## 4. Config knobs (top of `SpiderSequence.tsx`)
| Knob | Default | Effect |
|---|---|---|
| `REVEAL_ZOOM` | `2.2` | how tight the opening close-up is |
| `REVEAL_END` | `0.20` | where the pull-back finishes (fraction of the unzip) |
| `FOCAL_START` | `{x:0.5, y:0.20}` | the point we open on (the zipper pull) |
| `REVEAL_EASE` | easeOutCubic | settle character |
| `SCRUB_END` | `0.82` (existing) | the static held-breath tail |
| ~~`ZOOM_AMP` / `ZOOM_CYCLES`~~ | **removed** | breathing — gone |

## 5. Resolution / sharpness
- Masters are **2752px wide**. At `2.2×` we show ~45% → ~1240px source on a ~1920px screen → slightly soft in the dark look. Acceptable; if too soft, lower `REVEAL_ZOOM` (e.g. 1.8) or re-extract at full res (already full res).
- **Mobile tension:** the close-up wants high-res, but mobile wants small (720w) frames for memory. Options (open decision): (a) gentler `REVEAL_ZOOM` on mobile (~1.5), (b) full-res for the first N frames only, or (c) defer the close-up on mobile (start near full-frame). Lean: **gentler zoom on mobile.**

## 6. Build steps
1. **Remove** breathing zoom (`ZOOM_AMP`/`ZOOM_CYCLES`) from `SpiderConfig`, `SpiderEngine.draw`, and `SpiderSequence`.
2. **Add** `revealZoom`, `revealEnd`, `focalStart` to `SpiderConfig`; compute `zoom(norm)` + `focal(norm)` + clamp-to-cover in `draw()`.
3. **Wire** the knobs from `SpiderSequence`.
4. **Tune** on desktop against the feel (§1), scrub slowly.
5. **Mobile** treatment (gentler zoom) + verify.
6. *(Optional cleanup)* rename `Spider*`/`frames-beat1` → `Buddha*` in one sweep.

## 7. Open decisions (pick before/while building)
- [ ] `REVEAL_ZOOM` start tightness — **2.2×** default (1.8 = safer/sharper, 2.6 = more dramatic/softer).
- [ ] `REVEAL_END` — **0.20** (matches "20% of the unzip"); 0.15 = snappier, 0.30 = more lingering.
- [ ] `FOCAL_START.y` — **0.20**; nudge to where the pull actually sits on the new frames.
- [ ] Mobile: gentler zoom (lean) vs defer close-up.
- [ ] Confirm the tail stays **fully static** (no life at all) — per your call, yes.

## 8. Risks / watch
- **Edge reveal** — guarded by clamp-to-cover; verify at the deepest zoom there's no black bar.
- **Softness at peak zoom** — see §5; tune `REVEAL_ZOOM` if needed.
- **Focal mismatch** — if the zipper pull isn't exactly at (0.5,0.20) on the new frames, nudge `FOCAL_START`.
- **Smoothness** — driven by the engine's smoothed `norm`, so it inherits the buttery lerp; if the pull-back feels mechanical, raise the ease or lower `SMOOTHING`.

## Changelog
- **v1.4 (2026-06-06)** — **Crest-hold.** Reworked `REVEAL_STOPS` so the first pull-back lands at a chest-and-crest framing (e 0.5) and **holds** (0.20→0.40) — the viewer reads the stupa crest before the staircase continues to the Buddha reveal. (Lengthening the e=0 zipper hold wouldn't show the crest — it's below the tight close-up window.)
- **v1.3 (2026-06-06)** — **Stepped pull-back.** Replaced single ease (`revealHold`/`revealEnd`) with `revealStops` keyframes (norm→pull-fraction, easeInOutCubic between, flat = hold) → camera pulls back 40% → hold → 80% → hold → 100%, zip descending through the holds. Pace 1080 → 1400. Knob = `REVEAL_STOPS` in `SpiderSequence.tsx`.
- **v1.2 (2026-06-06)** — Added `REVEAL_HOLD` (0.1): the close-up holds fixed while the zip descends, *then* eases out (revealEnd 0.2 → 0.3). Pace −20% (`VH_TOTAL` 900 → 1080).
- **v1.1 (2026-06-06)** — **Built (desktop + mobile-gentler).** `SpiderEngine.draw` now does reveal-zoom + focal pan + per-axis clamp-to-cover; breathing removed from `SpiderConfig`/engine/`SpiderSequence`. Knobs live at the top of `SpiderSequence.tsx` (`REVEAL_ZOOM 2.2`, `REVEAL_ZOOM_MOBILE 1.5`, `REVEAL_END 0.2`, `FOCAL_START {0.5,0.2}`). `tsc` clean. Pending: live tuning on screen.
- **v1.0 (2026-06-06)** — Initial plan: scroll-driven web-layer reveal-zoom (close-up pull → easeOut to full by ~20% → static hold), clamp-to-cover, focal-point pan, breathing removed. Knobs + math + mobile/sharpness notes + build steps.
