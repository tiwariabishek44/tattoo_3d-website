// Shared design tokens for the Teyung Tattook Ink site.
export const SERIF = "var(--font-fraunces), Georgia, serif";
export const SANS = "var(--font-inter), system-ui, sans-serif";

// ── Type scale (Phase 2.2, roadmap T2) ─────────────────────────────────────
// Five steps, enforced everywhere. display is reserved for the hero promise
// and the CTA apex ONLY — when everything shouts, nothing lands. Tracking
// tightens as size grows; line-height closes in on the display end.
export const TYPE = {
  display: {
    fontSize: "clamp(4.5rem, 9vw, 11rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
  },
  h2: {
    fontSize: "clamp(2.6rem, 5vw, 5rem)",
    lineHeight: 1.04,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontSize: "clamp(1.6rem, 2.6vw, 2.4rem)",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
  },
  lead: {
    fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)",
    lineHeight: 1.5,
    letterSpacing: "0em",
  },
  body: {
    fontSize: "clamp(1.06rem, 1.2vw, 1.15rem)",
    lineHeight: 1.7,
    letterSpacing: "0em",
  },
} as const;

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

// Convert a "#rrggbb" COLORS token to "rgba(r, g, b, alpha)" — lets
// components apply a brand color at any opacity without re-hardcoding the
// rgb triplet inline (I-29). One source of truth: change COLORS, every
// withAlpha() call follows.
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

// ── Booking & contact registry (Phase 0.3, roadmap M2) ────────────────────
// Single source of truth for every conversion target on the site.
// [LINK-SWAP LATER]: when the studio's real channels arrive, swap the values
// below (and the form action in app/book/page.tsx) — every CTA follows.
export const BOOKING_HREF = "/book"; // all "Book a session" CTAs land here
export const BOOKING_EMAIL = "hello@inkspire.tattoo"; // placeholder
export const WHATSAPP_HREF = "https://wa.me/9779800000000"; // placeholder number
export const INSTAGRAM_HREF = "https://instagram.com/inkspire.tattoo"; // placeholder handle

// Trust strip — answers the tourist's real questions before they're asked.
export const TRUST_POINTS = [
  "Thamel, Kathmandu",
  "English spoken",
  "Single-use needles",
  "Walk-ins & bookings",
];
