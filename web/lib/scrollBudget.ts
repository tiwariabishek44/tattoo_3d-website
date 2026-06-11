// Decision 3 (scroll-coherence-fix-plan.md) — single registry of section
// scroll budgets. Sections with a fixed scroll-track length import their vh
// constant from here instead of redeclaring it locally, so this file is
// always the source of truth for "how long is each beat."
//
// Sections without a declared budget (pure content height) are listed for
// visibility only — there's no constant to import.

export const HERO_VH = 600;   // ScrollSequence — scroll-scrubbed video + two-slogan handoff
// Phase 5 (scroll-smoothness-postmortem.md) — rhythm calibration: heights pulled
// toward one felt-rate and dead-scroll trimmed at the seams (was 250 / 1020 / 250).
export const BRAND_VH = 210;  // BrandStatement — reveal now live across the pinned hold (full-range offset)
export const SPIDER_VH = 780; // SpiderSequence — trimmed edge holds; active scrub px/frame ~preserved
export const SERVICE_VH = 200; // ServiceSlider — shorter dead click-driven pin zone

// Documentation-only — these sections size from content/floors, not a fixed
// scroll-track, so there's no single constant to centralize.
export const GALLERY_MIN_VH = 70;   // GalleryPinterest — masonry min-height floor
export const ARTIST_MIN_VH = 100;   // ArtistShowcaseSlider — height: 100vh, minHeight: 640px floor

export interface SectionBudget {
  name: string;
  vh: number | null; // null = no declared budget (pure content height)
  sticky: boolean;
  mechanism: string;
  depthLayers: number;
  notes?: string;
}

export const SCROLL_BUDGET: SectionBudget[] = [
  {
    name: "Hero (ScrollSequence)",
    vh: HERO_VH,
    sticky: true,
    mechanism: "autoplay canvas (MachineLoopEngine) + local scrollYProgress drives HeroText/canvas zoom",
    depthLayers: 1,
    notes: "Phase 3b depth pass deferred — pending hero asset regen (project-hero-v2-engine)",
  },
  {
    name: "BrandStatement",
    vh: BRAND_VH,
    sticky: true,
    mechanism: "sticky + local scrollYProgress sequential reveal (passive scroll budget IS the gate)",
    depthLayers: 1,
  },
  {
    name: "SpiderSequence (embedded)",
    vh: SPIDER_VH,
    sticky: true,
    mechanism: "One-Clock ScrollPhysics scrub (Law 1-3) — useScroll kept only for SpiderText",
    depthLayers: 1,
    notes: "SCRUB_END=0.82 — tail hold is intentional (REVEAL_STOPS); B-6 retune is a human-pass item",
  },
  {
    name: "ServiceSlider",
    vh: SERVICE_VH,
    sticky: true,
    mechanism: "sticky + click-driven slider (passive scroll budget, no wheel-jacking)",
    depthLayers: 1,
  },
  {
    name: "GalleryPinterest",
    vh: GALLERY_MIN_VH,
    sticky: false,
    mechanism: "min-height floor, normal flow + bg parallax watermark (useParallax)",
    depthLayers: 2,
  },
  {
    name: "ArtistShowcaseSlider",
    vh: ARTIST_MIN_VH,
    sticky: false,
    mechanism: "height: 100vh / minHeight: 640px floor, normal flow",
    depthLayers: 1,
    notes: "E-20 depth pass deferred — complex modal ('Jinn eruption') system, needs human visual pass",
  },
  { name: "Testimonials", vh: null, sticky: false, mechanism: "raw useTransform parallax (useParallax)", depthLayers: 2 },
  { name: "BookingCTA", vh: null, sticky: false, mechanism: "whileInView (Reveal)", depthLayers: 1 },
  { name: "Footer", vh: null, sticky: false, mechanism: "static", depthLayers: 1 },
];

// Sizing reference: 1vh = 8px on a reference desktop screen of 800px height.
// Capping height at absolute pixel values to prevent infinite stretching on tall monitors.
export function getDesktopSectionHeight(vh: number): number {
  return vh * 8;
}

// Cumulative px offset where the Spider/Buddha section begins — replaces
// TelemetryOverlay's hardcoded `scrollY >= 5000` heuristic (I-30). Derived
// from the manifest so it can never drift from the actual section heights.
export function spiderStartPx(viewportH: number): number {
  if (typeof window !== "undefined" && window.innerWidth > 820) {
    return getDesktopSectionHeight(HERO_VH + BRAND_VH);
  }
  return ((HERO_VH + BRAND_VH) / 100) * viewportH;
}
