# The Jinn Transition — Zero-Compromise Implementation Plan
**Single Source of Truth · ArtistShowcaseSlider overlay open/close**

> **UPDATE (2026-06-08):** §4's scale-FLIP emerge/inhale is **superseded** by the
> ink-unfurl in [JINN_ERUPTION_UNFURL_PLAN.md](JINN_ERUPTION_UNFURL_PLAN.md). A pure
> scale read as a zoom, not an emergence. Beats 1/3/5 and the portrait `layoutId`
> morph below remain authoritative; read the companion for the new emergence engine.

> "The card is the lamp. The overlay is the Jinn. Every pixel of this transition
> must make the viewer forget they are looking at a website."

---

## 0. North Star

The goal is a **spatial contract**: the viewer must feel that the overlay *lives inside*
the artist card — that clicking a card is rubbing a lamp, and closing the overlay is
the Jinn returning home. The illusion has two hard requirements:

1. The sheet must emerge from the **exact pixel position and size** of the originating card.
2. On close, after all compartments have departed, the empty sheet must collapse back to
   that **same exact pixel position and size** — not approximately, not close. Exactly.

If either of these two requirements has even a 1px error, the illusion breaks.
There is no acceptable margin. This is the standard.

---

## 1. The Four-Beat Arc (Complete Story)

### Beat 1 — The Rub (card activation, ~80ms)
The user clicks a card. Before anything opens:
- The clicked card emits a brief **gold shimmer** — a radial glow that pulses outward
  from the click point and fades (box-shadow bloom, opacity 0 → 0.7 → 0, ~80ms).
- Simultaneously a micro **scale pulse**: card `transform: scale(1 → 1.018 → 1)`, ~80ms.
- This is the invocation. It registers intent before the world responds.
- At the **exact moment of click**, before any state changes or DOM mutations,
  the card's `getBoundingClientRect()` is captured and stored in a ref.
  This is the most critical synchronous operation in the entire system.

### Beat 2 — The Jinn Emerges (sheet open, spring physics, ~580ms)
After the rub (~80ms delay):
- The overlay sheet mounts at the card's captured rect (card position + card size),
  achieved via FLIP inversion (see §4).
- From that rect, the sheet **springs** to full-screen — underdamped spring physics
  with a slight overshoot (sheet briefly expands ~1.5% beyond full-screen, then
  settles). Not a linear scale, not a standard ease. A spring surge.
- Simultaneously, the backdrop blur and dark weight layer fade in.
- The portrait's `layoutId` shared-layout animation runs *inside* the emerging sheet,
  traveling from the card's thumbnail position to its final overlay position.
  Framer Motion's layout propagation handles parent-transform compensation automatically.
- Compartments do NOT begin arriving until the sheet has fully settled (spring settled,
  `onAnimationComplete` fires). No overlap between emergence and compartment relay.

### Beat 3 — The Jinn at Work (existing relay, unchanged)
- **Open relay** (existing, untouched): gallery → info → portrait (revealStage 0→1→2).
- **Close relay** (existing, untouched): gallery departs → info departs → portrait departs
  (closeStage 0→1→2).
- When `closeStage === 2` the sheet is empty. The Jinn has finished its work.
  **This is the handoff point.** Instead of `setStoryIdx(null)` firing immediately,
  we now enter Beat 4.

### Beat 4 — The Return (inhale, ease-in, ~400ms + acceptance pulse ~200ms)
After `closeStage === 2`:
- A new `jinnPhase` state transitions from `'settled'` → `'inhaling'`.
- The sheet animates from full-screen **back to the captured card rect**, with
  **ease-in acceleration** (cubic-bezier `[0.6, 0.0, 1.0, 1.0]`). Not ease-out.
  The Jinn is pulled inward — it starts slow, accelerates, snaps home.
- The backdrop blur/dark layer fades out simultaneously (synced to the inhale duration).
- When the inhale `onAnimationComplete` fires:
  - `setStoryIdx(null)` clears the overlay from the DOM.
  - The originating card fires its **acceptance pulse**:
    `scale(1 → 0.97 → 1.01 → 1)`, duration ~200ms, with a brief gold shadow bloom.
    This is the lamp sealing. The Jinn is home.

---

## 2. State Machine Extension

### Existing states (DO NOT CHANGE their logic)
```
storyIdx: number | null       — which artist is open
revealStage: 0 | 1 | 2       — compartment open relay
closing: boolean              — close initiated
closeStage: 0 | 1 | 2        — compartment close relay
```

### New states to add
```
jinnPhase:
  'idle'        — no overlay, card at rest
  'activating'  — rub animation playing on card (80ms), rect captured, waiting to emerge
  'emerging'    — sheet springing from card rect to full-screen
  'settled'     — sheet at full-screen, compartment relay running
  'inhaling'    — sheet collapsing back to card rect
  'sealed'      — inhale complete, acceptance pulse firing on card

cardRect: DOMRect | null      — captured at click, stable for entire open/close lifecycle
activeCardIdx: number | null  — which card index triggered the open (for acceptance pulse)
```

### State transition diagram
```
idle
  → [click card] capture rect, start rub →
activating (80ms)
  → [rub complete] mount overlay at rect →
emerging (spring ~580ms)
  → [spring settled] start compartment relay →
settled (relay runs)
  → [requestClose + closeStage reaches 2] →
inhaling (ease-in ~400ms)
  → [inhale complete] unmount overlay, fire card pulse →
sealed (pulse ~200ms)
  → [pulse complete] →
idle
```

### Modified `requestClose` flow
Current: `closeStage === 2` → `setStoryIdx(null)` immediately.
New: `closeStage === 2` → `setJinnPhase('inhaling')`.
`setStoryIdx(null)` only fires inside the inhale's `onAnimationComplete`.

---

## 3. Card Rect Capture — The Most Critical Operation

**Rule**: The rect is captured **synchronously, on the click event**, before any
state setter is called, before any re-render, before any DOM mutation.

```
onClick handler (on the artist card):
  1. const rect = cardRef.current.getBoundingClientRect()  ← synchronous, first
  2. setCardRect(rect)        ← store in ref (not state — avoids re-render)
  3. setActiveCardIdx(idx)    ← for the acceptance pulse later
  4. setJinnPhase('activating')
  5. setTimeout(() => setJinnPhase('emerging'), 80)  ← after rub completes
```

**Why a ref, not state**: State triggers a re-render. If the re-render shifts the
card's position before we compute the FLIP origin, the FLIP will be wrong.
The rect ref is written once and read once — no re-render involved.

**Card refs array**: A `useRef<(HTMLDivElement | null)[]>([])` holding a ref for
each artist card. Assigned via `ref={(el) => { cardRefs.current[idx] = el }}` on
each card's root div.

---

## 4. FLIP Geometry Engine

FLIP (First → Last → Invert → Play) is the coordinate system for both the emerge
and the inhale.

### Coordinate space
`getBoundingClientRect()` returns **viewport coordinates** — the same space as
`position: fixed`. No scroll offset correction needed. The captured rect is
directly usable for the FLIP calculation.

### Computing the inversion transform (card → full-screen)
```
Given:
  cardRect = { left, top, width, height }  (captured at click)
  viewport = { width: window.innerWidth, height: window.innerHeight }

Sheet "full-screen" state = no transform (covers viewport entirely)

To position sheet AT the card rect:
  scaleX   = cardRect.width  / viewport.width
  scaleY   = cardRect.height / viewport.height
  originX  = cardRect.left + cardRect.width  / 2   (card center, viewport coords)
  originY  = cardRect.top  + cardRect.height / 2
  sheetCX  = viewport.width  / 2
  sheetCY  = viewport.height / 2
  translateX = originX - sheetCX
  translateY = originY - sheetCY

Initial transform (mounted state):
  transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`

Final transform (settled state):
  transform: `translate(0px, 0px) scale(1, 1)`

transform-origin: center center (on the sheet element)
```

### The emerge (initial → final, spring)
Framer Motion `useSpring` or a custom `requestAnimationFrame` integrator.

Spring parameters (underdamped — gives the overshoot "surge" quality):
```
stiffness : 280
damping   : 18
mass      : 1
restDelta : 0.001
restSpeed : 0.001
```

At these values: sheet reaches full-screen in ~520ms, briefly overshoots by ~1.5%
(`scale(1.015)`), settles by ~580ms. The overshoot is the Jinn's energy — too much
damping removes it, too little makes it bounce excessively.

Framer Motion implementation path: apply the initial transform as `initial` prop,
animate to `{ x:0, y:0, scaleX:1, scaleY:1 }` using a spring transition.
The `x/y/scaleX/scaleY` decomposition avoids Framer's matrix interpolation artifacts.

### The inhale (final → initial, ease-in)
```
duration  : 400ms
easing    : cubic-bezier(0.6, 0.0, 1.0, 1.0)  ← ease-in-cubic, accelerates inward
```

NOT a spring. The Jinn is pulled, not bounced. Ease-in means it starts almost still
then accelerates to the card. The viewer reads this as gravity, not mechanics.

Framer Motion: `animate={{ x: translateX, y: translateY, scaleX, scaleY }}` with
`transition: { duration: 0.4, ease: [0.6, 0.0, 1.0, 1.0] }`.

---

## 5. Portrait `layoutId` Coexistence Strategy

**The conflict**: the portrait uses `layoutId={`artist-photo-${storyIdx}`}` to travel
between the card thumbnail and the overlay portrait. If the outer sheet is also
animated via FLIP (translating + scaling), the portrait receives a double-transform:
the sheet's parent transform AND its own layoutId travel.

**Resolution**: Framer Motion's layout propagation. When a parent element has an
active layout animation, Framer automatically corrects child elements' layout
animations to compensate for the parent's transform. This requires:
- The sheet element uses Framer's `layout` prop (not just custom transforms).
- The portrait stays inside the sheet during both open and close.

**Practical implementation**: Use `layoutId` on the sheet itself for the open/close
geometry transition (shared layout between "card-sized placeholder" and "full-screen
sheet"). The portrait's `layoutId` runs inside and Framer handles compensation.

If layout propagation produces visual artifacts in testing, fallback: remove the
portrait's `layoutId` transition and instead let the portrait simply fade in/out
(it arrives inside the FLIP-animated sheet naturally). The FLIP emergence already
"carries" the portrait from the card position — the effect is preserved without
the shared layout animation.

**Decision point**: test with `layoutId` coexistence first. If clean, ship it.
If artifacts appear, drop the portrait `layoutId`, keep FLIP only.

---

## 6. The Rub — Card Activation Micro-animation

Fires on click, duration ~80ms, before sheet mounts.

```
Elements animated on the card:
  1. Gold shimmer ring
     — a pseudo-element or an absolutely-positioned div on the card
     — keyframes: opacity 0 → 0.65 → 0, box-shadow: 0 → 0 0 18px rgba(203,164,90,0.7) → 0
     — duration: 80ms
     — not driven by Framer — a CSS @keyframes animation fired by adding a class

  2. Card scale pulse
     — scale: 1 → 1.018 → 1
     — duration: 80ms
     — ease: ease-in-out
     — Framer motion.div animate prop on the card wrapper
```

The rub must complete **before** the sheet mounts. The `jinnPhase` transition from
`'activating'` → `'emerging'` is gated by a `setTimeout(80)` in the click handler.

---

## 7. The Acceptance Pulse — Card Reaction on Return

Fires on the originating card after the inhale `onAnimationComplete`.

```
Scale keyframes: 1 → 0.97 → 1.01 → 1
Duration: 200ms total
  phase 1 (0→80ms):  scale 1 → 0.97   ease-in
  phase 2 (80→140ms): scale 0.97 → 1.01 ease-out
  phase 3 (140→200ms): scale 1.01 → 1  ease-in-out

Gold shadow bloom (simultaneous):
  box-shadow: none → 0 0 22px rgba(203,164,90,0.55) → none
  duration: 200ms
```

Mechanism: after `setStoryIdx(null)`, `jinnPhase` enters `'sealed'`. The card at
`activeCardIdx` receives the pulse via a `useState<boolean>` flag — `acceptingCard`
set true on inhale complete, reset to false after 200ms. The card renders a
`motion.div` wrapper that reads this flag and animates accordingly.

---

## 8. Backdrop Synchronisation

The backdrop (blur + dark weight layer) must sync with the Jinn arc:

| Phase        | Backdrop                                     |
|---|---|
| Emerging     | Fade in, duration matches emerge spring (~580ms) |
| Settled      | Fully opaque, static                         |
| Inhaling     | Fade out, duration matches inhale (400ms), same ease-in curve |

**Do not** let the backdrop linger after the inhale completes — it should reach
opacity 0 exactly when the sheet reaches card rect size. Any misalignment reads
as a two-step close instead of one unified motion.

---

## 9. Viewport Edge Cases

### Card near viewport boundary
Cards near the top, right, or bottom edge will produce a cardRect where part of
the emerged sheet wants to render outside the viewport. The FLIP calculation handles
this naturally (the sheet is always full-screen at the `animate` state). No
special casing needed.

### Scroll position
`getBoundingClientRect()` already accounts for scroll — it returns viewport
coordinates, not document coordinates. Capture at click time is correct regardless
of scroll position. **Critical**: if the user scrolls while the overlay is open,
the card's visible position will change, but the captured rect (stored in ref) is
fixed at click time. The return animation targets the click-time position — this
is correct and intentional.

### Viewport resize while overlay open
If the viewport resizes during the overlay, `window.innerWidth/Height` changes but
the captured `cardRect` is now stale relative to the new viewport. The FLIP
calculation will be wrong.

**Resolution**: add a `resize` listener while the overlay is open that recomputes
the card's current rect and updates `cardRect`. The card may have shifted due to
reflow. Debounce at 100ms.

### Rapid open → immediate close
If the user closes before the emerge spring settles, the inhale must start from
the sheet's **current animated position**, not from the `settled` full-screen
position. Framer Motion's `useMotionValue` preserves the current value mid-animation.
The close transition must read `motionValue.get()` and animate from there.

### Multiple-card rapid switching
If the user opens card A, closes, then immediately opens card B before the
acceptance pulse on card A completes — `acceptingCard` flag must be cleared
immediately on the new open. Guard: on `jinnPhase` entering `'activating'`, clear
all existing `acceptingCard` flags.

---

## 10. Performance Budget

| Operation | Budget |
|---|---|
| Click → rub start | < 4ms (synchronous rect capture + state set) |
| Rub → emerge mount | exactly 80ms (setTimeout) |
| Emerge spring | 60fps throughout on MacBook Air M1 |
| Compartment relay | 60fps (unchanged from current) |
| Inhale | 60fps throughout |
| Total open-to-settled | < 700ms perceived |
| Total close-to-sealed | < 650ms perceived |

### GPU layer promotion
The sheet element must have `will-change: transform` set **before** the spring
starts. Set it when `jinnPhase` enters `'activating'` (before mount). Remove it
when `jinnPhase` reaches `'sealed'` (after acceptance pulse). Keeping `will-change`
permanently causes unnecessary memory use.

### Avoiding layout thrash
`getBoundingClientRect()` forces a layout flush. It is called **once** per open,
synchronously in the click handler, then never again until the next click.
No layout reads inside the animation loop.

---

## 11. Quality Verification Protocol

Before shipping, every item on this list must pass. No exceptions.

### Pixel accuracy tests
- [ ] Place a 1px dot at the card's center. On emerge frame 1, the sheet's
      center must hit that dot within 1px. Verify with browser devtools.
- [ ] On the inhale's final frame, the sheet's bounding rect must match
      `cardRect` within 1px on all four edges (left, top, width, height).
- [ ] Repeat for every artist card (all N cards, not just card[0]).

### Motion quality tests (all at 0.1x speed in devtools)
- [ ] Emerge: visible overshoot (~1.5%). If overshoot is invisible, spring is overdamped.
- [ ] Emerge: no stutter on frames 1–3 (first frames are the most expensive — FLIP
      starts from a heavily-scaled-down state which can cause paint cost).
- [ ] Inhale: starts almost imperceptibly slow, clearly accelerates toward card.
      If it starts fast, easing is wrong.
- [ ] Inhale: sheet center traces a straight line to card center (no arc, no drift).
- [ ] Acceptance pulse: clearly visible at normal speed. If you have to look for it,
      it's too subtle — increase scale delta or shadow intensity.
- [ ] Backdrop: reaches opacity 0 at exactly the same moment the sheet reaches
      card rect size. Scrub the inhale to verify sync.

### Edge case tests
- [ ] Open card near left edge, close — return lands correctly.
- [ ] Open card near right edge, close — return lands correctly.
- [ ] Open card near bottom of grid (possibly scrolled), close — return lands correctly.
- [ ] Open, resize viewport, close — return lands on current card position.
- [ ] Open, rapidly close before emerge settles — inhale starts from current position.
- [ ] Open card A, close, immediately open card B (during A's acceptance pulse) — no visual conflict.
- [ ] Esc key close — triggers full Jinn return, not a snap cut.
- [ ] Backdrop click close — same as above.

### Device tests
- [ ] MacBook (Retina): 60fps throughout, verified via Performance tab.
- [ ] Mid-range Android (emulated): minimum 30fps. If below, reduce spring overshoot
      and increase damping to reduce the number of animated frames.
- [ ] 375px viewport (mobile): FLIP values recalculate correctly for small screen.

---

## 12. Implementation Phases — Ordered by Dependency

### Phase 0 — Scaffold (no visible change)
- Add `jinnPhase` state and transitions to `ArtistShowcaseSlider`.
- Add `cardRect` ref, `activeCardIdx` state.
- Add `cardRefs` array ref, wire to each card's DOM element.
- Modify `requestClose` to set `jinnPhase('inhaling')` instead of immediately
  clearing `storyIdx`. Gate `setStoryIdx(null)` on inhale complete.
- Verify: existing open/close behaviour still works (Jinn phases just pass through).

### Phase 1 — Rect Capture + FLIP origin verification
- On card click, capture rect synchronously.
- Log the FLIP transform values (scaleX, scaleY, translateX, translateY) to console.
- Visually confirm: overlay mounts at the correct card position (even if it just
  pops there instantly with no animation yet). This is the pixel-accuracy foundation.
- Do not proceed to Phase 2 until Phase 1 is pixel-perfect.

### Phase 2 — The Emerge (spring)
- Wire the FLIP initial state to the overlay sheet's `initial` prop.
- Animate from FLIP initial → `{ x:0, y:0, scaleX:1, scaleY:1 }` with spring.
- Tune spring parameters until overshoot and settle time feel right.
- Verify: portrait `layoutId` animation still works correctly inside the FLIP parent.
  If artifacts appear, see §5 fallback strategy.
- Sync backdrop fade-in with emerge duration.

### Phase 3 — The Inhale (ease-in return)
- On `closeStage === 2`, instead of clearing `storyIdx`, animate sheet back to
  captured card rect with `cubic-bezier(0.6, 0.0, 1.0, 1.0)`, 400ms.
- On `onAnimationComplete`: clear `storyIdx`, trigger acceptance pulse.
- Sync backdrop fade-out with inhale.

### Phase 4 — The Rub (card activation beat)
- Add gold shimmer element to each card (absolutely positioned, pointer-events none).
- Wire shimmer + scale pulse to `jinnPhase === 'activating'`.
- Verify: rub plays completely before sheet mounts.

### Phase 5 — The Acceptance Pulse (card sealing beat)
- Add `acceptingCard` flag to card render.
- Wire pulse animation (scale keyframes + shadow bloom) to flag.
- Verify: pulse fires on the correct card (the one that was opened).

### Phase 6 — Edge Cases + Polish
- Resize handler for `cardRect` update.
- Mid-spring close handling (rapid open/close).
- `will-change` lifecycle management.
- All Quality Verification Protocol items checked and signed off.

### Phase 7 — Performance Hardening
- Profile on target devices.
- Reduce spring parameters if mobile performance is below 30fps.
- Ensure no `getBoundingClientRect()` calls inside rAF loop.
- Remove any `will-change` that isn't earning its memory cost.

---

## 13. Files to Touch

| File | What changes |
|---|---|
| `components/ArtistShowcaseSlider.tsx` | All Jinn state, FLIP engine, rub, pulse |
| `app/globals.css` | Shimmer `@keyframes` (card rub animation) |

No new files required. No other components touched.

---

## 14. What "Done" Looks Like

A viewer who has never heard of this feature watches the artist section and says,
unprompted, one of the following:

- *"How does it know where it came from?"*
- *"It feels like it lives inside the card."*
- *"That's the smoothest thing I've seen on a website."*

If the response is "oh that's a nice animation," we are not done.
The target is spatial wonder, not visual polish.

That is the bar. Build to it.

---

*Plan authored: 2026-06-08 · SSOT for Jinn Transition feature · ArtistShowcaseSlider*
