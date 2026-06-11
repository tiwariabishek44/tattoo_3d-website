# Reviews Section — Full-Screen Plane + Inter-Section Parallax

**Single source of truth for this feature.** Read before touching the reviews work.
**Date:** 2026-06-11 · **Owner:** Kael (creative-tech) / Abishek
**Status:** Plan approved → ready to build. No code until this is signed off.

---

## 0. One-line intent
Turn the reviews strip into a **full-viewport "trust moment"** that the page
**slides over as a pinned background plane** — the section above (Artist Showcase)
scrolls *off* to reveal it, the section below (Booking) scrolls *over* it — giving
real foreground/background depth at both seams, without breaking the buttery,
uniform scroll we won in [scroll-smoothness-postmortem.md](scroll-smoothness-postmortem.md).

---

## 1. Current state (facts — what exists today)
File: [`web/components/Testimonials.tsx`](web/components/Testimonials.tsx)
- **Layout:** `<section>` with `background:#fafafa`, `padding: clamp(80px,12vh,140px)`.
  Normal flow — **not** full-height, **not** pinned.
- **Heading:** eyebrow "In their words" + `h2` "Where Review Matters"
  (SANS 800, `clamp(3.6rem,9.5vw,9rem)`, color `COLORS.ink`).
- **Internal parallax already present (E-19):** `labelY` (heading) and `sheetY`
  (the marquee container) counter-move on the mid plane via
  [`useParallax`](web/lib/useParallax.ts) at `PARALLAX_MID`, range 195, driven by
  `useScroll(sectionRef, ["start end","end start"])`.
- **Marquee:** a dark-glass "sheet" (`rgba(7,6,5,0.66)` + blur) holding 3 rows
  (`ROW_A/B/C`) auto-scrolling at 48/56/64s, opposite directions; cards are the
  white cards we just polished (bigger serif quotes, gold accents, light hover veil).
- **Neighbors:** above = `ArtistShowcaseSlider`; below = `BookingCTA` → `Footer`.
- **Shared infra:** `useParallax`, `motionTokens.ts` (`PARALLAX_BG/MID/FG`),
  `scrollBudget.ts` (per-section scroll-track registry), one Lenis clock.

---

## 2. The vision (what we're building)
A **three-plane composition** the user scrolls *through*:
1. **Background plane** — the reviews (heading + proof + marquee), pinned, drifting
   slowly. This is the "stage."
2. **Foreground-in (above)** — the Artist Showcase exits upward and *uncovers* the
   reviews plane (occlusion → reveal).
3. **Foreground-out (below)** — the Booking section rises and *covers* the reviews
   plane (reveal → occlusion).

Net feel: the reviews sit **behind glass**; the page glides over them. Premium,
layered, deliberate — the social-proof beat earns a full screen and a sense of depth.

---

## 3. Chosen architecture (decided)
> **Primary: "pinned background plane."** The reviews `<section>` gets a tall scroll
> track; its inner content is `position: sticky` (pinned to the viewport for the
> track's duration). The neighbor sections overlap it via transform offsets.
> This is the more cinematic option and the one we build.
>
> **Documented fallback: "gently-drifting plane."** If the pin reintroduces a
> seam dead-zone or gear-change (see §6) we can't tune out, drop the pin and keep
> only a subtle whole-section parallax drift. Lower risk, less drama. Switch is a
> few lines; keep it in our pocket.

### Scroll mechanics
- Add `REVIEWS_VH` to [`scrollBudget.ts`](web/lib/scrollBudget.ts) (proposed
  **~180–220 vh** track) so the pin has a defined length and the rhythm is
  centralized with the other sections (same discipline as `HERO_VH` etc.).
- The pinned inner div is `position: sticky; top: 0; height: 100vh`.
- **One clock:** all motion derives from a single `useScroll` over the section
  (the eased Lenis position) — no new scroll listeners, no second rAF.
- **Inter-section overlap:** the section above and below translate on the Y axis
  (`translate3d`) as a function of this section's progress, so they *pass over*
  the pinned plane. Background (reviews) drifts at `PARALLAX_BG` (slowest);
  neighbors ride near foreground speed → the depth delta.

### Plane composition (earn the full height)
Stacked, centered, inside the pinned 100vh:
1. Eyebrow — "In their words"
2. Headline — "Where Review Matters" (keep)
3. **Proof stat row** *(NEW)* — e.g. `4.9★ · 500+ pieces · 8 countries` (real
   numbers from Abishek — see §9). This is what makes the screen feel *full*, not
   stretched.
4. Marquee — the 3 polished rows.

---

## 4. Depth & motion spec
- **Rates** (from `motionTokens.ts`): reviews plane = `PARALLAX_BG`; neighbor
  overlap ≈ foreground. Keep the **delta subtle** — background ~20–35% slower than
  foreground. Gentle = depth; heavy = carnival + jitter.
- **Transforms only** — `translate3d` / framer `y` MotionValues. Never animate
  layout, top/left, or anything that triggers reflow. GPU compositor only.
- **Keep the existing label/sheet counter-parallax** (it's good) — it becomes the
  *intra*-plane depth; the new neighbor overlap is the *inter*-plane depth.
- **Occlusion:** neighbors must visually cover the plane at the seams (solid/again
  opaque backgrounds, correct `z-index` / paint order) so it reads as layering, not
  transparency bleed.

---

## 5. Reduced motion & accessibility
- `prefers-reduced-motion` → all parallax ranges collapse to 0 (the section already
  does this via `reduced ? 0 : 195`); the pin may also relax to normal flow so the
  content is fully reachable without motion.
- Marquee already halts under reduced motion (`H-27`). Keep.
- Pin must not trap scroll or hide content from keyboard/AT users.

---

## 6. Scroll-rhythm safety — THE hard constraint
This is the one section where our hard-won smoothness is genuinely at risk
(pinning + multi-rate motion is exactly what caused the seam "gear-change" we fixed).
Non-negotiable rules:
1. **GPU transforms only**, single Lenis clock. No new rAF, no per-frame layout reads.
2. **Subtle rates** — resist the urge to crank the parallax.
3. **Guard the seams** — measure the felt scroll-rate entering (from Artist Showcase)
   and exiting (into Booking). The pin must not create a dead-zone (scroll where
   nothing moves) or a rate discontinuity. Budget `REVIEWS_VH` so the active motion
   spans the whole track (no held tails), mirroring the Phase-5 calibration.
4. **No double-smoothing** — read eased scroll once; don't re-ease.

---

## 7. Build phases (incremental, each independently verifiable)
- **P1 — Budget + pin.** Add `REVIEWS_VH`; make the section a tall track with a
  sticky 100vh inner. No parallax yet. Verify: section pins and releases cleanly,
  seams still smooth, no dead-zone. *(Gate: rhythm unchanged.)*
- **P2 — Plane composition.** Add the proof-stat row; re-balance vertical rhythm so
  the 100vh feels full. Verify: reads full, not stretched, at desktop + laptop heights.
- **P3 — Intra-plane drift.** Keep/retune the label/sheet counter-parallax for the
  pinned context. Verify: subtle, smooth.
- **P4 — Inter-section overlap.** Neighbors translate over the pinned plane (the
  reveal/cover). Verify: depth reads; occlusion correct; **seam rhythm measured**.
- **P5 — Polish + guards.** Reduced-motion path, cross-browser (Safari video-free
  here, but check the transforms), perf (main-thread headroom during the pin).

Each phase ships behind a working build; we do not advance a phase until its gate passes.

## 8. Acceptance criteria
- **Scrub test:** drag slowly through the section top→bottom — depth reads, nothing
  jitters, no frame where scroll moves but nothing else does.
- **Seam rhythm:** entering from Artist Showcase and exiting into Booking feels
  *continuous* — no gear-change (the Phase-5 standard).
- **Perf:** main thread has headroom during the pinned scroll (transforms on GPU).
- **Reduced motion:** parallax off, content fully reachable.
- **Cross-browser:** Chrome/Brave/Firefox identical; (Safari sanity check).

## 9. Decisions & open calls
**Decided:** pinned-plane primary (drifting fallback); GPU-only; single clock;
keep the polished white cards + light hover veil; reduced-motion collapses parallax.

**Open — need Abishek (creative/content):**
- **Proof-stat numbers** — the real figures for the stat row (rating, pieces,
  countries/years). Without these P2 uses placeholders.
- **Plane mood** — keep the dark-glass marquee sheet on the light `#fafafa` stage
  (current), or commit the whole plane to dark? (Affects how the neighbors' seams
  blend.) Kael leans: keep the dark glass sheet — the contrast is the depth.
- **Boldness** — pinned (cinematic, build carefully) is the plan; confirm we're not
  defaulting to the lighter drifting variant.

## 10. Files touched
- `web/components/Testimonials.tsx` (section → pinned plane + proof row + overlap)
- `web/lib/scrollBudget.ts` (`REVIEWS_VH`)
- possibly `web/components/ArtistShowcaseSlider.tsx` / `web/components/BookingCTA.tsx`
  (neighbor overlap transforms — minimal, only the seam-facing edge)
- reuse `web/lib/useParallax.ts`, `web/lib/motionTokens.ts` (no new infra)

## 11. Out of scope / risks
- **Out:** mobile reviews layout (parked with the rest of mobile), new review copy,
  the booking flow itself.
- **Risk:** the pin is the single biggest threat to the smoothness we shipped — if
  P4's seam measurement regresses the rhythm and won't tune, we fall back to §3's
  drifting variant rather than ship jank. Restraint over spectacle.
