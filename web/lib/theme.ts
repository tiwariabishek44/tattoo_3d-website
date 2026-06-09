// Shared design tokens for the Abishek Tattoo Ink site.
export const SERIF = "var(--font-cormorant), Georgia, serif";
export const SANS = "var(--font-inter), system-ui, sans-serif";

export const COLORS = {
  ink: "#070605", // near-black, barely-there warmth (primary dark)
  charcoal: "#100E0B", // very dark charcoal band
  cream: "#F1EADD", // soft warm ivory (never pure white)
  gold: "#CBA45A", // brand accent
  offWhite: "#F2EFE9", // warm off-white text on dark
  inkText: "#1B160F", // text on cream
  muted: "rgba(244,241,236,0.72)",
  mutedDark: "rgba(27,22,15,0.7)",
};

export const eyebrow = (color: string = COLORS.gold): React.CSSProperties => ({
  fontFamily: SANS,
  textTransform: "uppercase",
  letterSpacing: "0.26em",
  fontSize: "0.8rem",
  fontWeight: 600,
  color,
});

// ── Alignment DNA (adopted from the gallery section) ──────────────────────
// One consistent left/right rail (near full-bleed) applied across every segment
// so the whole site shares the same margins. (Typography stays each section's
// own — only the alignment/gutter is unified.)
export const GUTTER = "clamp(16px, 1.8vw, 28px)"; // shared side gutter / left rail

// Pick a hero frame as a placeholder image (swap for real photos later).
export const frame = (n: number) =>
  `/frames/frame_${String(n).padStart(6, "0")}.webp`;

// Single source of truth for the "book" action. Honest interim per
// HOMEPAGE_FRAGRANCE_PLAN.md Q3 (mailto / contact) — swap for a real booking
// flow/URL later in ONE place and every CTA on the site follows.
export const BOOKING_HREF = "mailto:hello@Abishek.ink?subject=Booking%20enquiry%20%E2%80%94%20Abishek%20Tattoo%20Ink";
