// Decision 4 (scroll-coherence-fix-plan.md) — shared easing + stagger
// vocabulary. Two curves, one rule for which belongs where:
//
//   EASE_ARRIVAL    — content ENTERING the viewport (Reveal, BookingCTA's
//                      Ken Burns, scroll-linked text/stat reveals).
//   EASE_MECHANICAL — UI the user is OPERATING (buttons, hovers, progress
//                      bars, morphs, nav transitions).

export const EASE_ARRIVAL = [0.22, 1, 0.36, 1] as const;
export const EASE_MECHANICAL = [0.4, 0, 0.2, 1] as const;

// Index-staggered entrance timing — GalleryPinterest's recipe (the
// coherence audit's "best example"). delay = min(idx * UNIT, CAP).
export const STAGGER_UNIT = 0.025;
export const STAGGER_CAP = 0.35;
export function staggerDelay(idx: number): number {
  return Math.min(idx * STAGGER_UNIT, STAGGER_CAP);
}

// Parallax depth contract (Decision 2) — rate multipliers for the 3-plane
// model (background / midground / foreground). Pass to useParallax().
export const PARALLAX_BG = 0.5;
export const PARALLAX_MID = 1;
export const PARALLAX_FG = 1.5;

// Documented exception: ArtistShowcaseSlider's "Jinn eruption" modal open.
// A one-off physical flourish for a single interaction — intentionally
// outside the shared vocabulary, not a recipe to reuse elsewhere.
export const JINN_ERUPTION_SPRING = { type: "spring", stiffness: 59, damping: 8.2 } as const;
