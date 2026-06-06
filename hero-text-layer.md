# Hero Text & Depth Layer — Plan (Single Source of Truth)

> The slogan / brand-story layer on top of the scroll-scrub machine hero for
> **Teyung Tattoo Ink**. Vibe: **premium**. Built in the Next/TS app ([web/](web/)).
>
> **Parent project:** [tattoo-studio-hero.md](tattoo-studio-hero.md) ·
> **Web delivery:** [frame-sequence-stack.md](frame-sequence-stack.md)

---

## Current state (what's already built)
- Next/TS app, Framer Motion scroll-scrub of 240 WebP frames (`web/components/ScrollSequence.tsx`).
- Machine oscillates **R→L→R→L** via ping-pong (`LEGS = 3`), one clip reversed each leg.
- Pacing `VH_PER_LEG = 330`, smoothing `0.12`, full-bleed cover, DPR-aware, preloader.
- Global **5% black wash** for mood (`OVERLAY_OPACITY = 0.05`).
- Frame pipeline: [tools/frames-engine.js](tools/frames-engine.js) (video → PNG → WebP).

## The four non-negotiables (what the finished hero must deliver)
1. **Depth** — never flat. Achieved by: localized gradient behind text + parallax drift + the global wash.
2. **Object motion** — the machine glide (done).
3. **Brand-value story** — the slogans + supporting copy below.
4. **Fade in / fade out** — each beat opacity 0→1→0, with a gentle rise + focus-in.

---

## Copy — 4 beats (hierarchy, not single lines)
Each beat = **eyebrow → headline → 2–3 supporting lines**. Text sits **opposite the machine**.

| Beat | Scroll ≈ | Machine | Text side |
|---|---|---|---|
| 1 | 0–14% | right | **left** |
| 2 | 28–44% | left | **right** |
| 3 | 60–76% | right | **left** |
| 4 | 88–100% | left | **right** |

**Beat 1**
- Eyebrow: `TEYUNG TATTOO INK`
- Headline: **Permanence is a craft.**
- Support: A tattoo outlives the moment it's made. We treat every one exactly that way — considered, deliberate, built to last a lifetime.

**Beat 2**
- Eyebrow: `PRECISION`
- Headline: **Every line, deliberate.**
- Support: From the first stencil to the final pass, nothing is rushed — clean lines, steady hands, an obsession with the millimetre.

**Beat 3**
- Eyebrow: `THE CRAFT`
- Headline: **Made by hand. Worn for life.**
- Support: Our artists don't print — they compose. Each piece is designed for you, your story, and the way it lives on your skin.

**Beat 4 (CTA)**
- Eyebrow: `TEYUNG TATTOO INK`
- Headline: **Begin your mark.**
- Support: Book a consultation and let's design something unmistakably yours.
- Button: `Book a session`

---

## Typography
- **Headlines (slogans):** light/refined serif — **Cormorant Garamond**, large `clamp(2.5rem, 5vw, 5rem)`, line-height ~1.1.
- **Eyebrows + CTA:** **Inter**, uppercase, small (`0.75rem`), letter-spacing `0.2em`.
- **Supporting copy:** Inter, `clamp(1rem, 1.4vw, 1.15rem)`, line-height ~1.6, `max-width: 38ch` (tight measure = editorial).
- Loaded via **`next/font`** (self-hosted, no layout shift).
- Hierarchy = 3 clear sizes/weights/colors → eye flows eyebrow → headline → story.

## Color (cool, one warm spark)
- **Headlines:** soft off-white `#F2F3F5` (not harsh pure white).
- **Eyebrows:** muted cool steel-blue `#8FB2C4` (echoes the rim light).
- **Supporting copy:** `rgba(255,255,255,0.7)` (muted — supports, doesn't shout).
- **CTA:** **brass** `#C9A24B` — the *only* warm accent, tying to the machine's brass glint. Everything cold except the invitation.

## Depth strategy (first-class requirement)
1. **Localized gradient** behind each text block — e.g. linear-gradient from `rgba(0,0,0,0.55)` at the text-side edge → transparent toward centre. Darkens *only* the text side; the machine stays bright. (Legibility + depth, without dimming the hero.)
2. **Parallax** — text drifts on `y` at a different rate than the machine through its window → the speed difference *is* depth.
3. **Global 5% wash** — already in place for overall mood.
4. **Focus-in** — a whisper of `blur(6px → 0)` on fade-in for a premium rack-focus feel.

## Motion / fade
- Per beat: `opacity` via `useTransform(scrollYProgress, [start, inPeak, outPeak, end], [0,1,1,0])`.
- `y`: rise from +24px → 0 across fade-in (parallax + entrance).
- Eyebrow staggered slightly before the headline.
- easeInOut feel via the mapping curve.

## Layout
- Text block positioned in the left or right third (opposite the machine), vertically centred.
- Order: eyebrow (top) → headline → supporting → CTA (beat 4).
- Generous padding; never crowds the machine.

## Extras (polish)
- **Scroll hint** — bottom-centre `SCROLL` + chevron at load; fades out once `scrollYProgress > ~0.02`.
- **Fixed wordmark** — small `TEYUNG` top-left, persistent branding.
- **Responsive** — `clamp()` sizing; on mobile, text centres/stacks, gradient becomes bottom-up, measure narrows.
- **Accessibility** — real HTML text (not canvas), contrast guaranteed by the gradient.
- **Restraint guardrail** — the machine is the hero; text supports, never competes.

## Implementation notes
- Lift `useScroll(scrollYProgress)` so **both** the canvas scrub and the text beats read the *same* progress (shared parent over the 990vh track).
- New component e.g. `TextBeats` (or `HeroText`) layered above the canvas inside the sticky viewport.
- Beat windows + gradient strength + parallax distance = config constants at top (tunable like the scrub knobs).

## Open / tunable
- [ ] Beat scroll windows (sync the fades to the exact machine arrival points).
- [ ] Gradient strength per beat.
- [ ] Parallax distance + blur amount.
- [ ] Final real copy from the studio (placeholder-premium for now).

## Changelog
- **v1.0 (2026-06-05)** — Initial plan. Studio = Teyung Tattoo Ink, premium vibe. 4-beat hierarchy copy (eyebrow/headline/support/CTA), Cormorant + Inter typography, cool palette + brass CTA, depth via localized gradient + parallax + wash, per-beat fade-in/out, scroll hint + wordmark + responsive.
