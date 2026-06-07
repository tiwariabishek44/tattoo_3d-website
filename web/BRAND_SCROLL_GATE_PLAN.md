# Brand Story Scroll Gate — Implementation Plan
**Escape-velocity gate: holds normal/fast scrollers in the brand story, lets deliberate speed-runners through.**

---

## 1. One-Sentence Problem

When a user exits the machine hero sequence with scroll momentum, that momentum carries them straight through the BrandStatement section — they never read it.

---

## 2. The Mental Model

```
SCROLL VELOCITY AT BRAND STORY ENTRY
          │
          ▼
  ┌───────────────────────────────────────────────────┐
  │  < threshold A        │  A → B         │  > B      │
  │  (gentle)             │  (normal-fast) │  (extreme) │
  │                       │                │            │
  │  Passive 180vh        │  GATE FIRES    │  GATE      │
  │  hold does its job.   │  Hold 1.5s,    │  SKIPPED.  │
  │  No intervention.     │  then release. │  Pass thru │
  └───────────────────────────────────────────────────┘
```

Three zones. Gate only fires in the middle zone — catches the accidental blow-through, respects the deliberate skip.

---

## 3. Velocity Thresholds

Measured in **px/ms** from the `wheel` event (`|deltaY| / dt`).

| Zone | Range | Action |
|---|---|---|
| Gentle | `vel < 1.5 px/ms` | No gate. 180vh passive hold handles it. |
| Lock zone | `1.5 ≤ vel < 8 px/ms` | Gate fires. Hold for `HOLD_MS` then release. |
| Extreme | `vel ≥ 8 px/ms` | Gate skipped. Pass through immediately. |

**Why 8 px/ms as the extreme ceiling:**
On a trackpad at device speed 0.0, a deliberate aggressive speed-run rarely exceeds 7–8 px/ms. Normal fast scroll peaks at 3–4 px/ms. The 8 px/ms ceiling gives experienced users a clear intentional escape gesture.

**Why 1.5 px/ms as the gentle floor:**
Below 1.5 px/ms the user is already moving slowly enough that the 180vh passive hold captures them. Firing the gate on slow scroll would feel intrusive.

All three thresholds are named constants — easy to tune after testing.

---

## 4. The Hold Mechanism — How It Works

### The core tool: `e.preventDefault()` on `wheel` (non-passive)

The browser's blessed API for custom scroll hold zones. When called on a `wheel` event, the page does not scroll for that event. This is how Apple, immersive scroll sites, and carousels create mandatory pause zones.

**Requires:** listener registered with `{ passive: false }`. Next.js / React default to passive, so this must be an explicit imperative listener on `document`.

### The gate sequence:

```
1. IntersectionObserver detects brand story entering viewport (threshold: 0.15)
2. Read current scroll velocity from a shared velocity tracker
3. If vel < THRESHOLD_A → do nothing
4. If vel ≥ THRESHOLD_B → do nothing (escape velocity, pass through)
5. If THRESHOLD_A ≤ vel < THRESHOLD_B:
   a. Register non-passive { passive: false } wheel listener on document
   b. listener calls e.preventDefault() on every wheel event
   c. Start HOLD_MS timer
   d. When timer expires → remove the wheel listener → page scrolls normally again
   e. If section exits viewport before timer expires → remove listener early (cleanup)
```

### Hold duration

```
HOLD_MS = 1500   // 1.5 seconds
```

Long enough to read the headline. Short enough to never feel like a broken page. Tunable constant.

---

## 5. Velocity Tracker — Shared State

The gate needs to know scroll velocity at the moment of IntersectionObserver fire. IntersectionObserver does not expose velocity — it only fires on threshold crossing. So velocity must be tracked independently via a `wheel` listener that runs at all times (passive, no preventDefault).

**Implementation:** A lightweight module-level tracker in `BrandStatement.tsx` (or a shared hook `useScrollVelocity`):

```
wheel event → record |deltaY| / dt → store as rollingVelocity
IntersectionObserver fires → read rollingVelocity → decide gate
```

The rolling velocity should decay: if no wheel event has fired in the last 200ms, treat velocity as 0 (user stopped scrolling before reaching the section — no gate needed).

---

## 6. Files Changed

### 6a. `web/components/BrandStatement.tsx`
**Convert to client component** (`"use client"`) — currently a pure server component, needs to be client for IntersectionObserver and wheel listeners.

**Add:**
- `useEffect` for the passive velocity tracker (always-on wheel listener)
- `useEffect` for IntersectionObserver watching the outer wrapper div
- Gate logic: check velocity on entry, fire/skip accordingly
- Gate cleanup on unmount (remove all listeners)

**No changes to JSX** — the outer 180vh wrapper and sticky inner section stay exactly as-is.

### 6b. Nothing else changes
- `frameEngine.ts` — untouched
- `ScrollSequence.tsx` — untouched
- `page.tsx` — untouched
- `spiderEngine.ts` — untouched

---

## 7. Constants (all in BrandStatement.tsx, top of file)

```ts
const GATE_VEL_LOW  = 1.5;   // px/ms — below this: no gate (gentle scroll)
const GATE_VEL_HIGH = 8.0;   // px/ms — above this: no gate (escape velocity)
const HOLD_MS       = 1500;  // ms — how long the gate holds before releasing
const VEL_DECAY_MS  = 200;   // ms — if no wheel event in this window, vel = 0
const IO_THRESHOLD  = 0.15;  // IntersectionObserver entry threshold (15% in view)
```

---

## 8. Edge Cases

| Case | Handling |
|---|---|
| User scrolls back up through brand story | IntersectionObserver entry fires on scroll-up too. Velocity check still applies — if they're scrolling up fast, gate does not fire (they've already seen it). Add a `direction` check: only gate on downward scroll (`deltaY > 0`). |
| Gate fires, user scrolls UP during hold | Remove gate listener immediately. Upward scroll = user chose to go back, never block that. |
| Gate fires, user reaches extreme velocity DURING hold | Release gate early — user is signaling they want through. |
| Reduced motion preference | Skip gate entirely. `prefers-reduced-motion` users should never have scroll behaviour modified. |
| Mobile | BrandStatement on mobile is a different layout consideration. Gate should be disabled on `window.innerWidth < 820` since mobile scroll physics are very different. |
| Tab switch / page hide | `visibilitychange` → remove gate listener (cleanup). |
| Second pass (user scrolled past, came back) | Gate fires again. This is intentional — second pass deserves the same pause. If it becomes annoying, a `hasGatedOnce` ref can suppress it. |

---

## 9. What This Does NOT Do

- Does NOT drag/rubber-band scroll
- Does NOT snap scroll position
- Does NOT modify `scroll-behavior` CSS
- Does NOT touch the 180vh wrapper height (that stays)
- Does NOT interfere with the machine hero sequence above or the SpiderSequence below
- Does NOT fire on mobile (different physics, different plan)

---

## 10. Implementation Order

```
Step 1 — Convert BrandStatement.tsx to "use client"
  Add directive. Confirm no SSR-only APIs needed (backgroundImage is fine).

Step 2 — Add velocity tracker
  Passive wheel listener. Rolling velocity with decay (200ms window).
  No side effects yet — just tracking.

Step 3 — Add IntersectionObserver
  Watch the outer wrapper div ref.
  On entry (downward) → read velocity → decide gate.

Step 4 — Implement gate
  Non-passive wheel listener on document.
  e.preventDefault() for HOLD_MS.
  Timer-based release + early-release conditions.

Step 5 — Cleanup
  Remove all listeners on unmount.
  visibilitychange cleanup.
  Upward scroll early release.

Step 6 — tsc --noEmit
  Zero errors.

Step 7 — Visual verify
  Test three gestures: gentle / normal-fast / extreme speed-run.
  Confirm gate fires correctly for each.

Step 8 — Tune
  Adjust GATE_VEL_LOW, GATE_VEL_HIGH, HOLD_MS per feel.
  One constant at a time.
```

---

## 11. Tuning Guide

After implementation, test these four gestures and adjust:

| Gesture | Expected | Adjust if wrong |
|---|---|---|
| Deliberate slow scroll | No gate. Smooth, natural. | `GATE_VEL_LOW` too high → lower it |
| Normal scroll pace | Gate fires. Holds ~1.5s. Reads naturally. | `HOLD_MS` too short → increase |
| Fast-but-normal scroll | Gate fires. Short hold, then continues. | `GATE_VEL_HIGH` too low → raise it |
| Aggressive speed-run | No gate. Passes through instantly. | `GATE_VEL_HIGH` too high → lower it |

---

## 12. Rollback

If the gate causes any issues:
1. Remove the two `useEffect` blocks (velocity tracker + IntersectionObserver)
2. Revert `"use client"` directive (back to server component)
3. The 180vh passive hold stays — it works fine without the gate

One-step rollback, no other files affected.

---

## 13. Summary

| | Before | After |
|---|---|---|
| Gentle scroll | 180vh hold works | Same — no change |
| Normal/fast scroll | Blows through brand story | Gate holds 1.5s then releases |
| Extreme speed-run | Blows through | Still passes through (escape velocity) |
| Implementation risk | — | Low — one file, clean rollback |
| New dependencies | — | None (IntersectionObserver + wheel events, both native) |
| Files changed | 0 | 1 (BrandStatement.tsx only) |
