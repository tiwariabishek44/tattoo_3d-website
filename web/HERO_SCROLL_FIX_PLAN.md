# Hero Scroll Sequence Fix — Implementation Plan
**Input-layer velocity cap. Engine stays single-responsibility. Jesko Jet architecture.**

---

## 1. One-Sentence Root Cause

`scrollYProgress` (raw human input, can jump anywhere instantly) feeds directly
into `setProgress()` — the engine sees a 168-frame gap in one event, and its
entire windowing system was designed assuming target ≈ current.

---

## 2. The Architecture We're Moving To

```
BEFORE (broken):
  raw scrollYProgress  ──────────────────────────────→  setProgress()  →  engine
  (can jump 0.1→0.8 in one event)                       (target = 192)

AFTER (Jesko model):
  raw scrollYProgress  →  displayProgress (RAF proxy)  →  setProgress()  →  engine
  (can jump anywhere)      (advances max DISPLAY_STEP       (target always
                            per tick — the speed ceiling)    ≈ current)
```

The engine's core invariant — **target is always close to current** — is restored.
`ensureWindow`, the release buffer, the settle logic: all of it works correctly again
because the engine never sees a large jump.

---

## 3. The Two Layers and What Each One Owns

| Layer | File | Owns | Does NOT own |
|---|---|---|---|
| **Input proxy** | `ScrollSequence.tsx` | Rate-limiting scroll speed | Frame drawing, memory |
| **Engine** | `frameEngine.ts` | Frame draw, memory, lerp decel | How fast user scrolled |

This is the separation Jesko, Apple, and Lenis all enforce. The engine has no
opinion on scroll speed. The proxy has no opinion on frames.

---

## 4. The displayProgress Proxy — How It Works

Two values live in `ScrollSequence.tsx`:

- `rawProgress` — updated instantly by `useMotionValueEvent`. Can jump anywhere.
- `displayProgress` — what the engine actually sees. Advances toward `rawProgress`
  at a hard maximum of `DISPLAY_STEP` per RAF tick.

A lightweight RAF loop runs while `rawProgress ≠ displayProgress`:

```
each RAF tick:
  delta = rawProgress - displayProgress
  if |delta| < tiny threshold → stop RAF, hold frame
  step  = sign(delta) × min(|delta|, DISPLAY_STEP)
  displayProgress += step
  engine.setProgress(displayProgress)
  schedule next tick
```

When `scrollYProgress` changes, the loop is kicked if not already running.
When the user stops scrolling, the loop runs until `displayProgress` catches
up to `rawProgress`, then goes idle.

**This replaces the single line** at `ScrollSequence.tsx:38-39`:
```
// currently:
engineRef.current?.setProgress(p)

// becomes:
rawProgressRef.current = p
kickDisplayLoop()
```

Everything else in `ScrollSequence.tsx` — the canvas, the HeroText overlay,
the pin zone, the resize handler — is completely untouched.

---

## 5. Key Constant: DISPLAY_STEP

This is the only new tuning knob. It belongs in `ScrollSequence.tsx` alongside
the other sequence constants.

### How to calculate it

The relationship between `displayProgress` (0→1) and frame index:

```
dtarget / d(displayProgress) = (FRAME_COUNT - 1) × LEGS = 239 × 2 = 478
```

So 1 unit of displayProgress = 478 frames of animation movement.

For the animation to advance at most N frames per tick:
```
DISPLAY_STEP = N / 478
```

### Reference table

| DISPLAY_STEP | Frames/tick | Min playthrough (240 frames) | Feel |
|---|---|---|---|
| 3 / 478 ≈ 0.0063 | 3 | ~1.3 s | Cinema — every frame readable |
| 4 / 478 ≈ 0.0084 | 4 | ~1.0 s | Punchy, still smooth |
| 2 / 478 ≈ 0.0042 | 2 | ~2.0 s | Deliberate, Apple-slow |

**Starting recommendation: `3 / 478`**. Matches what Jesko-grade sites feel like
at standard trackpad speed. Tune after testing.

---

## 6. The SMOOTHING Problem — Why It Must Change

This is the most important detail the plan must address.

### The hidden double-smoothing trap

With input-layer velocity cap, `displayProgress` advances at most `DISPLAY_STEP`
per tick. The engine's target therefore advances at most 3 frames per tick.

The engine's lerp then runs:

```
current += (target - current) × SMOOTHING
```

At steady state (target advancing at 3 frames/tick), the lerp must also advance
current by 3 frames/tick to keep up:

```
steady-state lag L:   L × SMOOTHING = 3   →   L = 3 / SMOOTHING
```

With the original `SMOOTHING = 0.14`:
```
L = 3 / 0.14 = 21.4 frames = 357ms lag at 60fps
```

**The animation would float ~350ms behind the displayProgress proxy.** The cap
would be working correctly but the output would look like jelly.

### The fix

Raise `SMOOTHING` in `ScrollSequence.tsx` (not in the engine — the engine
constant is set by each component). The rate-limiting is now fully handled by
`DISPLAY_STEP`; `SMOOTHING` only needs to provide ease-out deceleration at stop.

| SMOOTHING | Steady-state lag at 3fps cap | Deceleration |
|---|---|---|
| 0.14 (original) | 357ms | Very smooth / floaty |
| 0.50 | 100ms | Good decel |
| 0.80 | 63ms | Snappy, natural |
| 1.00 | 0ms (instant snap) | No decel |

**Starting recommendation: `0.80`**. Provides a ~1-frame lag at full speed
(imperceptible) and a clean ease-out when the user stops scrolling.

Together: `DISPLAY_STEP = 3/478` + `SMOOTHING = 0.80` = cinematic velocity
control with a natural stop.

---

## 7. Engine Cleanup — What Changes in frameEngine.ts

The engine currently has `maxFramesPerTick` from our previous (wrong) attempt.
Now that the velocity cap lives at the input layer, this is redundant and confuses
the engine's single-responsibility contract.

### Changes to frameEngine.ts

**Remove:**
- `maxFramesPerTick: number` from `EngineConfig` type
- The hybrid cap+lerp formula in `tick()` — revert to pure lerp

**Keep (these are correct defensive improvements):**
- Dual-zone `ensureWindow` release loop (protects both `center` AND `this.current`)
- Dual-zone `settle` callback in `loadFrame` (same protection)
- `settled()` threshold at `0.001` (already correct)
- No `ensureWindow` call inside `tick()` (already removed)

### Why keep the dual-zone fixes?

Even with input-layer velocity cap, there are edge cases where `center` and
`current` can diverge (page load, rapid tab switching, reduced-motion fast-snap).
The dual-zone protection costs nothing and prevents blank canvas in those cases.
It stays.

---

## 8. Cleanup in Other Files (Minimal)

Because `maxFramesPerTick` is being removed from `EngineConfig`, the two
components that pass it must also remove it:

- `ScrollSequenceMobile.tsx` — remove `MAX_FRAMES_PER_TICK` constant and config field
- `SpiderSequence.tsx` — **SpiderConfig is a separate type in spiderEngine.ts**.
  `maxFramesPerTick` was added to `SpiderConfig` as well. Remove it from
  `SpiderConfig`, `spiderEngine.ts` tick(), and `SpiderSequence.tsx`.
  The spider sequence does NOT get the input-layer proxy yet — that is a
  separate future task.

---

## 9. Implementation Order

```
Step 1 — frameEngine.ts
  Remove maxFramesPerTick from EngineConfig type.
  Revert tick() to pure lerp.
  Dual-zone ensureWindow + settle callback stays.

Step 2 — spiderEngine.ts
  Remove maxFramesPerTick from SpiderConfig type.
  Revert tick() to pure lerp.
  Dual-zone ensureWindow + settle callback stays.

Step 3 — ScrollSequence.tsx
  Remove MAX_FRAMES_PER_TICK constant and config field.
  Raise SMOOTHING: 0.14 → 0.80.
  Add rawProgressRef and displayProgressRef.
  Add displayProgress RAF loop + kick() function.
  Replace the useMotionValueEvent body: feed rawProgressRef, call kick().
  Add RAF cleanup in useEffect return.

Step 4 — ScrollSequenceMobile.tsx
  Remove MAX_FRAMES_PER_TICK constant and config field.
  (No displayProgress proxy for mobile yet — separate task.)

Step 5 — SpiderSequence.tsx
  Remove MAX_FRAMES_PER_TICK constant and config field.
  (No displayProgress proxy for spider yet — separate task.)

Step 6 — tsc --noEmit
  Zero type errors before touching dev server.

Step 7 — Visual verify
  Run dev server.
  Test machine sequence: slow drag / normal scroll / hard flick / stop mid-sequence.
  Confirm no blank canvas, no jump cuts, no float lag.

Step 8 — Tune if needed
  Adjust DISPLAY_STEP and SMOOTHING per feel.
  One constant at a time. Retest after each change.

Step 9 — Push
  dev/v2 + main.
```

---

## 10. Tuning Guide (after implementation)

Run all four gestures on a device at speed 0.0 (industry standard):

| Gesture | Expected | Adjust if wrong |
|---|---|---|
| Slow deliberate drag | Animation advances proportionally, no lag | SMOOTHING too low → increase |
| Normal scroll | Each frame visible, smooth pace | DISPLAY_STEP too high → decrease |
| Hard flick | Animation plays at full speed, page holds pin zone, then releases | DISPLAY_STEP too low → increase |
| Stop mid-sequence | Frame holds exactly, clean stop | SMOOTHING too low → increase |

**On Mac (inertia scroll):**
After lifting finger, macOS continues firing scroll events with decaying velocity.
`rawProgress` keeps advancing slowly → `displayProgress` keeps advancing slowly →
animation plays through the inertia tail smoothly. This is correct behaviour. No
special Mac handling needed.

---

## 11. What Does NOT Change

- Canvas element, pin zone height (`LEGS × VH_PER_LEG`), HeroText overlay
- `useScroll` hook and its `target` / `offset` config
- `setViewport`, `setProgress`, `destroy` signatures on the engine
- All frame loading, decoding, windowing logic
- `VH_PER_LEG` scroll length (already tuned for device speed 0.0)
- `SpiderSequence` behaviour (no proxy added — it gets its own plan later)
- `ScrollSequenceMobile` behaviour (no proxy — separate task)

---

## 12. Rollback

If the displayProgress proxy introduces unexpected behaviour:

1. In `ScrollSequence.tsx`: revert `useMotionValueEvent` body back to
   `engineRef.current?.setProgress(p)` and remove the proxy refs + RAF loop.
2. Revert `SMOOTHING` from `0.80` back to `0.14`.

That's the complete rollback. The engine changes (dual-zone keeps, maxFramesPerTick
removed) are safe to leave in either way.

---

## 13. Summary

| | Current (broken) | After fix |
|---|---|---|
| Velocity control | Engine tick() — wrong layer | displayProgress RAF proxy — correct layer |
| Engine sees | Raw scrollYProgress (can jump anywhere) | Smooth displayProgress (max DISPLAY_STEP/tick) |
| target ≈ current invariant | Violated on fast scroll | Always true |
| ensureWindow correctness | Depends on dual-zone fix | Guaranteed by invariant |
| Fast flick | Jump cut | Cinema-speed playback |
| Slow scroll | Unchanged | Unchanged |
| Engine responsibility | Frame draw + velocity control (mixed) | Frame draw only (clean) |
| New dependencies | None | None |
| Files changed | 5 | 5 (same files, cleaner changes) |
