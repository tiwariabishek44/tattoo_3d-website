# Velocity-Cap Scroll Model — Implementation Plan
**"Jesko Jet" model: animation speed is fixed; scroll is permission, not driver.**

---

## 1. Problem Diagnosis

### Exact location of the bug

Both engines share the same `tick()` loop:

```
// frameEngine.ts : 181  |  spiderEngine.ts : 245
this.current += (this.target - this.current) * this.cfg.smoothing;
```

This is a **position lerp** — the engine moves toward `this.target` by a fixed
fraction (14%) of the remaining gap each tick.

### Why fast scroll breaks it

`setProgress()` maps raw scroll progress → frame index and writes `this.target`
immediately. No speed limit exists on how far `target` can jump.

```
setProgress(p)  →  target = 220   (was 20 one tick ago — fast scroll)
tick():  current += (220 - 20) * 0.14  =  28 frames IN ONE TICK
```

At 60 fps, 28 frames/tick = **1680 frames/sec**. The eye registers 24–30 fps as
smooth film. Anything above ~4 frames/tick (~240 fps) is invisible motion. The
animation teleports — the user sees a jump cut, not a scrub.

The `SMOOTHING` lerp does NOT protect against this. When `target` is far away,
the FIRST step is the largest. Lerp is a convergence tool, not a speed limiter.

---

## 2. The Jesko Jet Mental Model

> **Scroll tells the engine WHERE to go. The engine decides HOW FAST.**

The engine has a hard speed limit — `MAX_FRAMES_PER_TICK`. Regardless of how
far `target` jumps, `current` can only advance that many frames per RAF tick.

- Fast scroll → target races ahead → engine plays at full speed until it catches up
- Slow scroll → target stays close → engine plays at proportional (slower) speed
- Stop scrolling mid-sequence → engine holds exactly where it is
- The page pin zone is consumed naturally as the engine catches up

**Result:** the animation always plays like a film reel — consistent, readable,
frame-by-frame. The user's wrist speed becomes irrelevant once it passes a
threshold.

---

## 3. Chosen Solution: Hybrid Velocity-Cap + Lerp

Pure velocity cap (constant step) feels mechanical — no ease-out when the
animation is nearly caught up. Pure lerp (current model) has no speed ceiling.

The hybrid gives the best of both:

```
lerpDelta  = (target - current) * smoothing     // what lerp would do
cappedStep = sign(lerpDelta) * min(|lerpDelta|, MAX_FRAMES_PER_TICK)
current   += cappedStep
```

**Behaviour table:**

| Scenario | lerpDelta | cappedStep | Feel |
|---|---|---|---|
| Fast scroll (target far) | large (e.g. 28) | capped at MAX (e.g. 3) | Constant cinema speed |
| Normal scroll | medium (e.g. 2–4) | usually uncapped | Smooth, proportional |
| Slow scroll / near target | small (< MAX) | = lerpDelta | Ease-out deceleration |
| Stopped (settled) | ≈ 0 | ≈ 0 | Holds frame exactly |

---

## 4. New Constant: `MAX_FRAMES_PER_TICK`

This is the single tuning knob for playback feel.

**Formula:**
```
minimum animation duration (seconds) = FRAME_COUNT / MAX_FRAMES_PER_TICK / 60
```

| MAX_FRAMES_PER_TICK | Machine (240 frames) | Buddha (185 frames) |
|---|---|---|
| 2 | 2.0 s minimum | 1.5 s minimum |
| 3 | 1.33 s minimum | 1.0 s minimum |
| 4 | 1.0 s minimum | 0.77 s minimum |

**Starting recommendation:** `3` for both sequences.
- Enough to feel punchy on fast scroll
- Slow enough that every frame is readable
- Matches what Jesko/Apple feel like in practice

This becomes a named constant in each component (not buried in the engine config),
so it is easy to tune independently per sequence.

---

## 5. Secondary Fix: `ensureWindow` Must Track `current`, Not `target`

### Current behaviour (bug)

```
// setProgress() — fires on every scroll event
setProgress(p) {
  this.target = ...
  ensureWindow(Math.round(this.target))   ← windowed around TARGET
}
```

With velocity cap, `target` can race 100+ frames ahead of `current`. Calling
`ensureWindow(target)` means:

1. The decode window centres on a frame we won't display for 1–2 seconds
2. The release buffer **unloads frames that `current` still needs right now**
3. Result: blank canvas flashes as currently-playing frames get evicted

### Fix

Add a second `ensureWindow` call inside `tick()`, centred on the **current
playback position**:

```
tick():
  ... advance current by cappedStep ...
  const c = Math.round(this.current)
  if (Math.abs(c - this.lastEnsured) >= this.cfg.ensureStep) {
    this.ensureWindow(c)          ← windowed around what is DISPLAYED
    this.lastEnsured = c
  }
  this.draw()
```

The `setProgress()` call can also ensureWindow(target) to pre-load ahead — but
the `tick()` call is the critical one that prevents eviction of active frames.

---

## 6. Files to Change

### 6a. `web/lib/frameEngine.ts`

**Change 1 — New config field** (`EngineConfig` type, line 6):
```
maxFramesPerTick: number;   // velocity cap (Jesko model)
```

**Change 2 — `tick()` method** (line 177–190):
Replace the lerp line with the hybrid cap+lerp. Keep `reduced` path unchanged
(reduced-motion users still snap instantly).

**Change 3 — `tick()` → add ensureWindow call**
After advancing `current`, call `ensureWindow(Math.round(this.current))` with
the existing `lastEnsured` guard.

**Change 4 — `settled()` method** (line 173):
The threshold can tighten slightly (`< 0.5`) since velocity cap keeps `current`
closer to `target` at all times — avoids a one-frame drift at rest.

---

### 6b. `web/lib/spiderEngine.ts`

**Identical changes** to 6a:
- New `maxFramesPerTick` field in `SpiderConfig` type (line 14)
- Replace lerp in `tick()` (line 241–254) with hybrid cap+lerp
- Add `ensureWindow` call in `tick()` (same guard pattern)
- Tighten `settled()` threshold

No changes to `draw()`, `revealStops`, zoom logic, or segment stitching.

---

### 6c. `web/components/ScrollSequence.tsx`

**Add constant** (near line 14):
```
const MAX_FRAMES_PER_TICK = 3;
```

**Pass to engine config** (inside the `EngineConfig` object, ~line 50):
```
maxFramesPerTick: MAX_FRAMES_PER_TICK,
```

`SMOOTHING` stays at `0.14` — it now controls the ease-out deceleration near
the target, not the peak speed. The two are fully decoupled.

---

### 6d. `web/components/SpiderSequence.tsx`

**Same as 6c**:
```
const MAX_FRAMES_PER_TICK = 3;   // tune independently if needed
```
Pass to `SpiderConfig`.

---

## 7. What Does NOT Change

- Frame loading, decode, window management (except the ensureWindow fix in tick)
- `setProgress()` call site in the components (no changes to the scroll hook)
- `VH_PER_LEG` / `VH_TOTAL` scroll lengths (already tuned to 0.0 device speed)
- `SMOOTHING` constant (repurposed as ease-out rate, same value is fine)
- Reveal-zoom logic in SpiderEngine
- HeroText / SpiderText overlays
- Mobile path — `ScrollSequenceMobile` is a separate component, untouched

---

## 8. Tuning Guide (after implementation)

Test on a standard trackpad at 0.0 device speed. Three gestures to validate:

| Gesture | Expected result | Adjust if wrong |
|---|---|---|
| Flick (very fast) | Animation plays at full speed, catches up, page releases | `MAX_FRAMES_PER_TICK` too low → increase |
| Normal scrub | Each frame visible, smooth pace | `SMOOTHING` too high → reduce; or MAX too high → reduce |
| Slow deliberate drag | Animation slows proportionally, no skip | Working correctly |
| Stop mid-sequence | Frame holds exactly, no drift | `settled()` threshold too loose → tighten |

**On Mac (inertia scroll):**
Mac adds momentum after finger lifts — scroll continues decelerating. Because
`target` keeps advancing during momentum, the animation keeps playing smoothly
through the inertia tail. This is the correct behaviour — the velocity cap
absorbs the tail gracefully. No special Mac handling needed.

---

## 9. Implementation Order

```
Step 1 — frameEngine.ts      Add maxFramesPerTick field + tick() rewrite + ensureWindow fix
Step 2 — spiderEngine.ts     Same (copy the pattern)
Step 3 — ScrollSequence.tsx  Add MAX_FRAMES_PER_TICK constant + pass to config
Step 4 — SpiderSequence.tsx  Same
Step 5 — Visual verify        Run dev server, test both sequences (fast / normal / slow flick)
Step 6 — Tune if needed       Adjust MAX_FRAMES_PER_TICK per sequence based on feel
Step 7 — Push                 dev/v2 + main
```

---

## 10. Rollback

If the velocity cap introduces unexpected issues, the full revert is ONE line
per engine file — swap the hybrid step back to the original lerp:

```
// revert to:
this.current += (this.target - this.current) * this.cfg.smoothing;
```

And remove `maxFramesPerTick` from the config type + both component config
objects. Everything else (constants, scroll lengths, SMOOTHING value) is
unchanged and does not need reverting.

---

## Summary

| | Before | After |
|---|---|---|
| Fast scroll | Frame teleport (28+ frames/tick) | Capped at 3 frames/tick — cinema speed |
| Slow scroll | Proportional (lerp) | Same proportional (lerp, uncapped) |
| Near target | Ease-out (lerp) | Same ease-out (lerp, uncapped) |
| Frame eviction on fast scroll | Can evict active frames | Fixed — ensureWindow tracks current |
| Mac inertia | Tail can cause jumps | Absorbed naturally by cap |
| New dependency | — | None |
| Risk | — | Low — one-line rollback |
