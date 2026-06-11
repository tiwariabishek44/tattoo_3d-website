// Footer — the site closes in the dark: an ink panel with the giant brand wordmark
// glowing in gold. Chosen over the light/oxblood concept so the whole experience
// stays in one premium mood from hero to footer.

import { BOOKING_HREF } from "@/lib/theme";

const SANS = "var(--font-inter), system-ui, sans-serif";
const SERIF = "var(--font-cormorant), Georgia, serif";
const SIDE = "clamp(24px, 4.7vw, 90px)";
const IG_URL = "https://instagram.com/Abishek.ink";

const INK     = "#0B0907";
const GOLD    = "#CBA45A";
const GLOW    = "drop-shadow(0 0 22px rgba(203,164,90,0.34))";
const LINK    = "rgba(242,239,233,0.70)";
const MUTED   = "rgba(242,239,233,0.40)";
const DIVIDER = "rgba(203,164,90,0.28)";

const COL1: { label: string; href: string }[] = [
  { label: "Home",       href: "/#top" },
  { label: "About",      href: "/#about" },
  { label: "Styles",     href: "/#styles" },
  { label: "Gallery",    href: "/#gallery" },
  { label: "Artists",    href: "/#artists" },
  { label: "After Care", href: "/after-care" },
];
const COL2: { label: string; href: string }[] = [
  { label: "Instagram",        href: IG_URL },
  { label: "hello@Abishek.ink", href: "mailto:hello@Abishek.ink" },
  { label: "Book a session",   href: BOOKING_HREF },
  { label: "Find the studio",  href: "/#contact" },
];
const BOTTOM = ["After Care", "Instagram", "Contact"];

const linkStyle: React.CSSProperties = {
  display: "block",
  color: LINK,
  textDecoration: "none",
  fontSize: "1rem",
  fontWeight: 500,
  lineHeight: 2.1,
  fontFamily: SANS,
};

export default function Footer() {
  return (
    <footer
      id="contact"
      style={{
        background: INK,
        color: LINK,
        padding: `clamp(72px, 12vh, 120px) ${SIDE} clamp(28px, 4vh, 52px)`,
        scrollMarginTop: "90px",
      }}
    >
      {/* ── Tagline + link columns ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(1.5rem, 2.2vw, 2.2rem)",
            fontWeight: 400,
            color: GOLD,
            margin: 0,
            maxWidth: "14ch",
            lineHeight: 1.25,
          }}
        >
          Permanence is a craft.
        </h2>

        <div style={{ display: "flex", gap: "clamp(48px, 7vw, 130px)" }}>
          <nav aria-label="Studio">
            {COL1.map((l) => (
              <a key={l.label} href={l.href} style={linkStyle}>
                {l.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Connect">
            {COL2.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={linkStyle}
                {...(l.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Giant gold wordmark (glowing) ── */}
      <div style={{ margin: "clamp(40px, 6vh, 84px) 0 clamp(48px, 8vh, 100px)" }}>
        <svg
          viewBox="0 0 1000 330"
          role="img"
          aria-label="Abishek Tattoo Ink"
          // Responsive sizing via CSS (height:auto is valid in CSS — the old
          // height="auto" *attribute* was the console error). viewBox holds ratio.
          style={{ display: "block", width: "100%", height: "auto", filter: GLOW }}
        >
          <text
            x="0"
            y="120"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fontFamily={SANS}
            fontWeight={600}
            fontSize="150"
            fill={GOLD}
          >
            Abishek Tattoo
          </text>
          <text
            x="500"
            y="300"
            textAnchor="middle"
            fontFamily={SANS}
            fontWeight={600}
            fontSize="150"
            fill={GOLD}
          >
            Ink
          </text>
        </svg>
      </div>

      {/* ── Bottom strip ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          paddingTop: "clamp(20px, 3vh, 32px)",
          borderTop: `1px solid ${DIVIDER}`,
          fontSize: "0.78rem",
          fontFamily: SANS,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: MUTED,
        }}
      >
        <span>© 2026 Abishek Tattoo Ink · Thamel, Kathmandu</span>
        <div style={{ display: "flex", gap: "clamp(18px, 2.2vw, 32px)", flexWrap: "wrap" }}>
          {BOTTOM.map((l) => (
            <a
              key={l}
              href={
                l === "After Care" ? "/after-care"
                : l === "Instagram" ? IG_URL
                : "mailto:hello@Abishek.ink"
              }
              style={{
                color: MUTED,
                textDecoration: "none",
                fontFamily: SANS,
                fontSize: "0.78rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
              {...(l === "Instagram"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
