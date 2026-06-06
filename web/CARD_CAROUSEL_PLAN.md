# "Styles We Master" — Dark Fanned Card-Deck Carousel (Plan / Single Source of Truth)

> Replace the static cream grid with an interactive **fanned card deck** (cards arced
> like a hand), where only the **center card is in focus** and the rest **recede into
> shadow**. ← / → buttons (+ swipe + keyboard) rotate the deck to change the focus.

---

## Concept
- Cards laid in a shallow **arc/fan**, each rotated outward — like cards held in a hand.
- **Center card = hero:** scaled up, full opacity, gold border, crisp, forward.
- **Side cards = shadow:** rotated out, scaled down, dimmed (opacity + darken + slight blur), receding into the dark.
- **Controls:** ← / → buttons, **drag/swipe**, **keyboard arrows**. Optional gentle auto-advance (pause on interaction).
- **Background: dark/deep** — so the focus + shadow reads strongly. (Process stays the cream section for color rhythm.)

## Content
- The 8 styles become cards: Fine Line · Blackwork · Traditional · Realism · Custom · Cover-Up · Piercing · Laser Removal.
- Each card: a **frame image** (placeholder → real tattoo of that style later) + the **style name** (gold) + optional one-line desc on the focused card only.
- **~5 cards visible** in the arc (center + 2 each side); the rest cycle in. Index wraps around (circular).

## Layout per slot (offset from center) — starting values, all tunable
| offset | rotate | x | y (arc dip) | scale | opacity | blur | z-index | extra |
|--------|--------|------|------|-------|---------|------|---------|-------|
| 0 (center) | 0° | 0 | 0 | 1.0 | 1.0 | 0 | 50 | gold border, sharp |
| ±1 | ±8° | ±190px | +28px | 0.86 | 0.55 | 1px | 40 | dark overlay |
| ±2 | ±16° | ±340px | +78px | 0.72 | 0.3 | 2px | 30 | darker overlay |
| ≥3 | — | — | — | — | 0 (hidden) | — | 10 | not rendered/behind |

- Card base: `aspect-ratio 3/4`, rounded, frame-image cover + bottom dark gradient + gold name label.
- Center card may show its description; side cards show name only.

## Interaction
- **State:** `activeIndex` (0..7). `next()` / `prev()` change it (wrap modulo 8).
- **Offset:** each card's slot = shortest *circular* signed distance from `activeIndex` → drives the transform table above.
- **Transitions:** Framer Motion animates rotate/x/y/scale/opacity on index change (spring or easeInOut, ~0.5s).
- **Drag/swipe:** Framer Motion `drag="x"` on the deck; on drag end, if past a threshold (or velocity) → next/prev, else snap back.
- **Keyboard:** ArrowLeft/ArrowRight when the carousel is focused (tabindex + key handler).
- **Auto-advance (optional):** ~5s interval, paused on hover/drag/focus.

## Buttons
- ← / → circular icon buttons (gold outline, hover fill), positioned bottom-center or flanking the deck.
- Accessible labels ("Previous style" / "Next style").

## Responsive
- **Desktop (`/`):** full fan (5 visible, the table above).
- **Mobile (`/mobile`):** tighter fan or a **swipe-first** single-card-forward layout (offsets pulled in, fewer visible, larger center). Drag is primary; buttons secondary. Keep transforms light for perf.

## Accessibility
- Real buttons with aria-labels; `role="group"` + `aria-roledescription="carousel"`.
- Keyboard support; focus ring on the active card.
- Respect `prefers-reduced-motion` → cross-fade instead of big transforms.

## Tech
- New client component `StylesCarousel.tsx` (replaces `Styles.tsx` in the page; keep `Styles.tsx` file as a fallback).
- Tokens from `lib/theme.ts` (dark bg, gold). Section bg: `#0a0b0d`/`#07080a`.
- Uses existing `frame()` helper for placeholder images.

## Integration
- Swap `<Styles />` → `<StylesCarousel />` in both `app/page.tsx` and `app/mobile/page.tsx`.
- Keep `Process` (cream) so the dark→cream→dark rhythm survives.

## Implementation steps
1. Build `StylesCarousel.tsx`: data array, `activeIndex` state, slot math, transform table, Framer Motion transitions.
2. Add ← / → buttons + keyboard + drag/swipe.
3. Style cards (frame image + gold name + center description).
4. Wire into both pages; keep `Styles.tsx` as fallback.
5. Reduced-motion + mobile-tighter variant.
6. Build + verify desktop and `/mobile`.

## Tunables (config constants at top of the component)
- `VISIBLE` (each side) · per-slot `rotate/x/y/scale/opacity/blur` · transition spring · `AUTO_ADVANCE_MS` (0 = off).

## Open decisions (confirm if any differ)
- [ ] Dark bg for this section (recommended) — yes?
- [ ] Auto-advance on (gentle) or fully manual?
- [ ] Show desc on focused card only (recommended) or on none?

## Changelog
- **v1.0 (2026-06-05)** — Initial plan: dark fanned card-deck carousel for "Styles We Master" — arc layout + per-slot transform table, center-focus/side-shadow, ←/→ + swipe + keyboard, responsive (desktop fan / mobile swipe-first), a11y + reduced-motion, integration into both endpoints.
