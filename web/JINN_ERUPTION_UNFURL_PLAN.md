# The Jinn Eruption — Ink-Unfurl Upgrade
**Companion SSOT to [JINN_TRANSITION_PLAN.md](JINN_TRANSITION_PLAN.md)**
**Supersedes:** §4 (scale-FLIP emerge/inhale) of the original plan.
**Leaves intact:** Beat 1 (Rub), Beat 3 (compartment relay), Beat 5 (Acceptance pulse),
and the beloved portrait `layoutId` morph. Those are NOT touched.

> "A rectangle that grows is a zoom. A shape that *becomes* another shape is an
> emergence. The glass must pour out of the card like smoke from a lamp's mouth —
> not scale up like a window." — the diagnosis that drove this upgrade.

---

## 0. Why this replaces the scale-FLIP

The shipped v1 used a shared-layout `layoutId` morph: a card-sized dark rectangle
that **scales** to full-screen. The honest problem: a pure scale has **no silhouette
change**, so the eye reads "same object, closer" — a zoom, not an emergence. The
dark glass also shares the backdrop's color, so its expanding edge is nearly
invisible: half the motion is literally unseeable.

This upgrade fixes the root cause (silhouette transformation) and makes the travel
legible (gold edge, darkness, origin puff). Four layers, built and judged **in order**,
each earning its place before the next is added:

1. **Ink-unfurl** (hero) — an iris of dark glass that *pours open* from the card
   center via an animated `clip-path`, silhouette going small-organic → full frame.
2. **Gold leading edge** — a hairline gold ring riding the expanding front, dissolving at full.
3. **Travel darkness** — the glass is denser while small, settling to neutral at full.
4. **Lamp-mouth puff** — a brief gold/white bloom at the card the instant it erupts.

Restraint rule (load-bearing): **do not stack all four at full intensity.** Build #1,
judge it alone at 0.1× scrub. Then add #2, judge. Then #3, then #4. Any layer that
doesn't earn its keep gets cut. Premium removes; it doesn't pile on.

---

## 1. Architectural Shift — from one morphing box to a clipped portal + free content

### v1 structure (being replaced)
```
AnimatePresence
  backdrop motion.div  (fixed, blur + flex-center + click-to-close)
    lamp glass         (layoutId morph, SCALES card→full)   ← REMOVE the scale-morph
    content (portrait + compartments)                       ← keep
```

### New structure
```
fixed container  (transparent, flex-center, click-to-close, scroll-lock — NOT clipped)
  ┌─ PORTAL LAYER  (absolute inset 0, CLIPPED by the iris circle) ───────────┐
  │   • blur (backdrop-filter)                                               │
  │   • dark glass fill (+ travel-darkness overlay)                          │
  │   • smoke-edge SVG filter (optional, §6)                                 │
  └──────────────────────────────────────────────────────────────────────────┘
  • gold ring        (absolute, sized to 2·R, centered on card — rides the front)
  • lamp-mouth puff  (absolute at card center — brief bloom)
  • CONTENT          (portrait + compartments + close) — UNCLIPPED, on top, free
```

**The key separation:** the portal (blur + glass) is clipped by the expanding iris;
the **content is NOT clipped**. This is non-negotiable — the portrait `layoutId`
morph flies *through space* from the card to the portrait slot. If it were inside the
clip, it would be cut off mid-flight while the iris is still small. Content lives
above the portal, unclipped, exactly as it does today.

**Consequence:** the lamp glass loses its `layoutId` (no more shared-layout scale).
The card's `jinn-lamp-${idx}` anchor is **removed**. The iris origin now comes from a
**synchronous rect capture** at click (re-introduces §3 of the original plan, which
v1 had skipped).

---

## 2. The Iris Geometry Engine

### Capture (synchronous, at click — §3 of original plan, now required)
A `cardRefs: useRef<(HTMLDivElement|null)[]>([])` holds each card's DOM node.
In `openStory(idx)`, **before any state setter**:
```
const r = cardRefs.current[idx].getBoundingClientRect();
captured = {
  cx: r.left + r.width / 2,      // card center, viewport px
  cy: r.top  + r.height / 2,
  seed: Math.min(r.width, r.height) * 0.18,  // start radius — a small "mouth", not a point
};
```
Store in a ref (`irisRef`), not state — read once, no re-render. (Original plan §3.)

### Radii
```
R0 = captured.seed                                   // ~18% of card short side
R1 = hypotenuse from (cx,cy) to the farthest viewport corner, × 1.04 (coverage margin)
     = max over the 4 corners of  √((cornerX−cx)² + (cornerY−cy)²)  × 1.04
```
R1 guarantees full coverage regardless of where the card sits (corner cards included —
no special-casing, §9 of original plan).

### The clip-path
```
clip-path: circle(${R}px at ${cx}px ${cy}px)
```
Driven by a single `useMotionValue` `rMV`, composed via `useMotionTemplate`.
`cx`/`cy` are fixed (captured); only `R` animates.

### Open (the pour) — R0 → R1
```
duration : ~620ms
ease     : cubic-bezier(0.16, 1, 0.30, 1)   // ease-out-expo — fast bloom, long settle
```
Fast off the mark (the surge of smoke escaping), then a long graceful settle into
full-frame. This is the Jinn's energy. Imperatively: `animate(rMV, R1, {duration, ease})`.

### Close (the inhale) — R1 → R0
```
duration : ~420ms
ease     : cubic-bezier(0.6, 0.0, 1.0, 1.0)  // ease-in — pulled home, accelerating
```
Starts almost still, accelerates inward, collapses the iris to the card's mouth.
(Carried over from original plan §4 — the inhale curve was always right; only the
*shape* it drives has changed from scale to clip.)

### Progress signal
`p = (R − R0) / (R1 − R0)`  ∈ [0,1] — a `useTransform(rMV, [R0,R1], [0,1])`.
Layers #2/#3/#4 read `p` so they stay perfectly synced to the iris with zero guessed delays.

---

## 3. State Machine (delta over the original)

### New
```
irisPhase: 'closed' | 'opening' | 'open' | 'closing'
irisRef:   { cx, cy, R0, R1 } | null     (ref, captured at click)
rMV:       MotionValue<number>           (current iris radius)
cardRefs:  (HTMLDivElement|null)[]        (per-card DOM nodes, for capture)
```

### Mount conditions (the critical coordination)
- **Portal layer** mounts while `irisPhase !== 'closed'` — i.e. it OUTLIVES `storyIdx`,
  staying mounted through the closing contraction even after `storyIdx` is nulled.
- **Content / portrait** mounts while `storyIdx !== null` (+ its existing nested
  `AnimatePresence` for the morph-home).

### Open flow
```
openStory(idx)
  → capture rect into irisRef, compute R0/R1
  → Beat 1 Rub on card[idx] (~90ms)            [unchanged]
  → setStoryIdx(idx)  + irisPhase 'opening'
  → rMV = R0 ; animate(rMV → R1, pour curve)
  → portrait layoutId morph fires (storyIdx set)  [unchanged, runs ON TOP, unclipped]
  → onComplete: irisPhase 'open'
  → compartment relay runs (portrait-landing driven)  [unchanged]
```

### Close flow — iris and portrait collapse into the card TOGETHER
```
requestClose() → closing, relay departs (gallery→info)  [unchanged]
  → closeStage reaches 2
  → irisPhase 'closing'
      • animate(rMV → R0, inhale curve)         ← iris contracts to card mouth
      • setStoryIdx(null)                        ← portrait morphs HOME simultaneously
        (portal layer stays mounted: irisPhase==='closing' ≠ 'closed')
  → rMV reaches R0 (onComplete):
      • irisPhase 'closed'  (portal unmounts)
      • Beat 5 Acceptance pulse on card[lastStoryIdx]   [unchanged]
```
The portrait flying home into the card AND the dark glass collapsing into the same
card, in one breath — the Jinn returning to the lamp. This convergence is the
emotional payoff and it is preserved exactly.

**Note:** the iris contraction's `onComplete` now drives the acceptance pulse
(replacing v1's `AnimatePresence onExitComplete`, since the glass no longer exits via
AnimatePresence — it's imperatively animated).

---

## 4. Layer #2 — Gold Leading Edge

A hairline gold ring that rides the expanding clip front, then dissolves.

```
Element: absolute div, centered on (cx, cy)
  width = height = 2·R   (driven by rMV → useMotionTemplate / useTransform)
  transform: translate(-50%, -50%)
  borderRadius: 50%
  border: 1.5px solid var(gold #CBA45A)
  background: transparent
  opacity: rideFade(p)
```
`rideFade(p)`: bright through the travel, gone by the time it lands.
```
opacity = p < 0.12 ? (p / 0.12) * 0.9      // quick fade-in as it leaves the mouth
        : p < 0.82 ? 0.9                    // rides the front
        : (1 - (p - 0.82) / 0.18) * 0.9     // dissolves into full-frame
```
- Border stays **1.5px crisp** (we size via width/height, never `transform: scale`, so
  the stroke never fattens). This is why it reads as brand light, not a UI border.
- Sits **above** the portal glass, **below** the content. `pointer-events: none`.
- On close: same ring, reversed via `p` — a faint gold seam as the iris seals.

**Why gold, not neutral (the original idea-2 critique):** a neutral border reads
"expanding panel." Gold ties to the brand accent, is legible against the dark glass,
and speaks the same one-gold-gesture language as the portrait's arrival ring.

---

## 5. Layer #3 — Travel Darkness

The glass is denser while the iris is small, settling to its neutral weight at full.

```
Glass fill base:        rgba(0,0,0,0.40)   (final / neutral — matches today)
Extra darkness overlay: a sibling inside the portal, same clip,
                        opacity = (1 − p) · 0.20
```
- At `p≈0` (just erupted): +0.20 → effective ~0.55 dark. Dense, concentrated energy.
- At `p=1` (full frame): +0.00 → 0.40. Settles to exactly today's look.
- Drive opacity off `p` (a `useTransform(p, [0,1], [0.20, 0])`). No separate timeline.

On close it naturally re-darkens as `p` falls — the energy re-concentrating as the
Jinn is pulled back in. Free, on-metaphor.

---

## 6. Layer — Smoke Edge (optional, between hero and polish)

Turns the clean circular clip edge into a wavy, smoky boundary. Sits *with* the hero
but gated behind a perf check.

```
SVG filter (defs, once):
  <filter id="jinnSmoke">
    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="18"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
Apply to the portal glass: filter: url(#jinnSmoke)
```
- **Static** turbulence first (cheap-ish): the iris edge becomes organically wavy =
  smoke, not a clean portal. ~30% of the effort for ~80% of the "smoke" read.
- **Animated** `baseFrequency` (living, roiling smoke) is the premium tier — defer; it
  adds per-frame filter cost. Only if perf headroom exists after profiling.
- **Risk:** SVG filter + `clip-path` + `backdrop-filter` stacked on one full-screen
  layer is the heaviest combination in this whole feature. **Profile before committing.**
  If it janks, ship the hero without the smoke filter — the clean iris still reads well.

---

## 7. Layer #4 — Lamp-Mouth Puff

A brief gold/white bloom at the card the instant the iris erupts — smoke escaping the
mouth. Gives the *origin* a tell, not just the destination.

```
Element: absolute div at (cx, cy), translate(-50%,-50%)
  size: ~1.1 × card width
  background: radial-gradient(circle,
                rgba(255,240,200,0.55) 0%,
                rgba(203,164,90,0.35) 38%,
                transparent 70%)
  filter: blur(6px)
  animate: opacity [0, 0.85, 0], scale [0.6, 1.15, 1.4]
  timing: ~240ms, easeOut, fired at iris-open start only
  pointer-events: none ; z above glass, below/around content
```
Fires once on open. On close, an optional fainter re-bloom as the iris seals (judge
whether it adds or clutters — likely cut on close; the acceptance pulse already seals).

---

## 8. Performance — the real risk is clip-path repaint

`clip-path: circle()` radius animation is **generally NOT compositor-accelerated** — it
repaints each frame. On a full-screen layer that also carries `backdrop-filter: blur`
(and optionally the smoke SVG filter), this is the single biggest perf exposure in the
feature.

### Two build tiers — decide by profiling
- **Tier A (visual-best):** clip-path iris on the blur+glass layer (the blur *unfurls*
  through the portal — most impressive). Build this first; profile on mid Android + a
  375px viewport.
- **Tier B (perf-safe fallback):** if Tier A drops below 30fps — split it: a **solid
  dark-glass circle that SCALES via `transform`** (compositor-cheap) provides the iris
  silhouette, while the blur is a **separate full-screen layer that simply cross-fades**
  (doesn't unfurl). Loses "blur pours through the portal," keeps the dark-glass iris
  (which is the main tell) at 60fps.

### Budget (carried from original §10)
| Op | Target |
|---|---|
| Click → rub | < 4ms (sync capture + setState) |
| Iris pour | 60fps desktop; ≥30fps mid mobile |
| Iris inhale | 60fps desktop; ≥30fps mid mobile |
| `getBoundingClientRect` | once per open, in the click handler — never in the rAF loop |

`will-change: clip-path` (Tier A) or `transform` (Tier B) set when `irisPhase` enters
'opening', removed at 'closed'.

---

## 9. Edge Cases (delta over original §9)

- **Corner cards:** R1 is computed to the farthest corner — full coverage guaranteed,
  no special case.
- **Scroll while open:** captured `cx/cy` are click-time viewport coords. The card may
  scroll away underneath, but the iris closes to the click-time mouth — intentional and
  correct (matches the portrait morph-home, which also targets click-time position).
- **Resize while open:** recompute `R1` from current `window` size on close (the corner
  distance changes); `cx/cy` recomputed from `cardRefs[idx].getBoundingClientRect()` if
  the card reflowed. Debounce 100ms (original §9).
- **Rapid close before pour completes:** the inhale `animate(rMV → R0)` starts from
  `rMV.get()` (its current mid-pour value) — Framer motion values preserve in-flight
  state, so no snap. (Original §9.)
- **Rapid re-open during acceptance pulse:** clear `acceptingIdx` on new `openStory`
  (already implemented in v1).

---

## 10. Quality Verification (delta — judge at 0.1× scrub)

Hero (#1) — judged ALONE before any other layer is added:
- [ ] The iris **pours** from the exact card center (within 1px of card center). Verify origin.
- [ ] Silhouette is read as *emergence*, not zoom — a first-time viewer doesn't say "it zoomed."
- [ ] Pour curve: fast bloom off the mouth, long graceful settle. No linear feel.
- [ ] Inhale: starts nearly still, accelerates, collapses to the card mouth (within 1px of center).
- [ ] Portrait morph still flies cleanly OVER the portal, never clipped mid-flight.
- [ ] 60fps desktop (Tier A) — or Tier B engaged with documented reason.

Then add #2, re-judge:
- [ ] Gold edge legible against the dark glass; stroke stays hairline (no fattening); dissolves by full-frame.

Then #3:
- [ ] Travel darkness perceptible but not muddy; settles to *exactly* today's 0.40 at full.

Then #4:
- [ ] Puff reads as "escaping the mouth," fires once, gone fast — adds wonder, not clutter.

Smoke filter (#6) if attempted:
- [ ] Edge reads as smoke, not noise-mush; profiled and within budget, else cut.

---

## 11. Implementation Phases

| Phase | Work | Gate before next |
|---|---|---|
| U0 | Remove lamp `layoutId` + card anchor. Add `cardRefs`, capture in `openStory`, `irisRef`, `rMV`, `irisPhase`. Re-wire close to drive acceptance pulse off iris-inhale `onComplete`. | Open/close still works (iris as a plain instant show/hide). |
| U1 | **Hero:** clip-path portal layer, pour + inhale curves, portal mount outlives `storyIdx`. Portrait morph unclipped on top. | Judged alone at 0.1×. Pixel-accurate origin. 60fps desktop. |
| U2 | Perf profile on mid Android + 375px. Decide Tier A vs Tier B. | Documented fps + decision. |
| U3 | Gold leading edge (#2). | Re-judged. |
| U4 | Travel darkness (#3). | Re-judged. |
| U5 | Lamp-mouth puff (#4). | Re-judged. |
| U6 | Smoke edge filter (#6) — only if perf headroom. | Profiled; cut if it janks. |
| U7 | Edge cases (resize, rapid close), `will-change` lifecycle, final QA sign-off. | All §10 boxes checked. |

---

## 12. Files to Touch

| File | Change |
|---|---|
| `components/ArtistShowcaseSlider.tsx` | Iris engine, portal layer, gold edge, darkness, puff; remove lamp `layoutId`/anchor |
| `app/globals.css` or inline SVG | `<filter id="jinnSmoke">` defs (only if U6 is built) |

No new files. No other components touched. Rub (Beat 1), relay (Beat 3), acceptance
pulse (Beat 5), and the portrait `layoutId` morph remain as shipped.

---

## 13. What "Done" Looks Like (unchanged bar)

A first-time viewer, unprompted: *"how did it come out of the card like that?"* —
not *"nice animation."* The iris must read as the Jinn pouring from the lamp and being
inhaled back. Spatial wonder, not visual polish. Build to it.

---

*Plan authored: 2026-06-08 · Companion to JINN_TRANSITION_PLAN.md · ArtistShowcaseSlider*
