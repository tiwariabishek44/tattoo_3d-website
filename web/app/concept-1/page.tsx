import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Header from "@/components/Header";

// CONCEPT 1 — Antigravity footer replica on the LIGHT theme (white bg, dark
// text, blue debris) — only the giant wordmark is gold. Same structure/labels
// as the reference. Wordmark uses Poppins (closest public geometric stand-in
// for the Google display face).
const display = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Concept 1 — Abishek footer (gold wordmark)",
};

const SIDE = "clamp(24px, 4.7vw, 90px)";

const COL1 = ["Download", "Product", "Docs", "Changelog", "Press", "Releases"];
const COL2 = ["Blog", "Pricing", "Use Cases"];
const BOTTOM = ["About Google", "Google Products", "Privacy", "Terms"];

// Deterministic blue debris (seeded PRNG → identical on server + client).
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const rnd = mulberry32(20260608);
const DOTS = Array.from({ length: 150 }, () => {
  const clustered = rnd() < 0.72;
  let left: number;
  let top: number;
  if (clustered) {
    const along = Math.pow(rnd(), 0.7); // skew toward the right
    left = clamp(along * 108 - 4 + (rnd() - 0.5) * 26, -2, 102);
    top = clamp(82 - along * 64 + (rnd() - 0.5) * 50, -2, 102);
  } else {
    left = rnd() * 100;
    top = rnd() * 100;
  }
  const depth = rnd(); // 0 far → 1 near
  const len = 2 + depth * depth * 13;
  const op = clamp(0.22 + depth * 0.72, 0, 0.96);
  const rot = rnd() * 180;
  const color = depth > 0.66 ? "#8aa0ff" : depth > 0.33 ? "#5b7cfa" : "#43539e";
  const glow = depth > 0.6;
  return { left, top, len, op, rot, color, glow };
});

const linkStyle: React.CSSProperties = {
  display: "block",
  color: "#111316",
  textDecoration: "none",
  fontSize: "1.05rem",
  fontWeight: 500,
  lineHeight: 2.05,
};


export default function Concept1() {
  return (
    <main
      className={display.className}
      style={{ background: "#ffffff", minHeight: "100vh", color: "#0a0a0a" }}
    >
      <Header />

      <div style={{ padding: `0 ${SIDE}` }}>
        {/* dark hero panel — blue debris field on black, rounded */}
        <div
          style={{
            position: "relative",
            marginTop: "clamp(78px, 9vh, 110px)",
            height: "clamp(200px, 26vh, 300px)",
            borderRadius: 28,
            background: "#0a0a0c",
            overflow: "hidden",
          }}
        >
          {DOTS.map((d, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: `${d.top}%`,
                left: `${d.left}%`,
                width: d.len,
                height: Math.max(2, d.len * 0.34),
                borderRadius: 1.5,
                background: d.color,
                opacity: d.op,
                transform: `rotate(${d.rot}deg)`,
                boxShadow: d.glow ? `0 0 ${d.len * 1.4}px rgba(123,151,255,0.45)` : "none",
              }}
            />
          ))}
        </div>

        {/* heading + link columns */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
            marginTop: "clamp(36px, 5vh, 64px)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
              fontWeight: 600,
              color: "#0a0a0a",
              margin: 0,
            }}
          >
            Experience liftoff
          </h2>

          <div style={{ display: "flex", gap: "clamp(56px, 8vw, 150px)" }}>
            <nav>
              {COL1.map((l) => (
                <a key={l} href="#" style={linkStyle}>
                  {l}
                </a>
              ))}
            </nav>
            <nav>
              {COL2.map((l) => (
                <a key={l} href="#" style={linkStyle}>
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* giant wordmark — "Abishek Tattoo" fills the full width (like the
            reference single word); "Ink" sits below, centered, SAME font size.
            SVG so the top line spans edge-to-edge and the whole thing scales
            responsively. */}
        <div style={{ margin: "clamp(40px, 6vh, 84px) 0 clamp(56px, 9vh, 120px)" }}>
          <svg
            viewBox="0 0 1000 330"
            width="100%"
            height="auto"
            role="img"
            aria-label="Abishek Tattoo Ink"
            style={{ display: "block" }}
          >
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E9D199" />
                <stop offset="45%" stopColor="#CBA45A" />
                <stop offset="100%" stopColor="#A07C36" />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="120"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="inherit"
              fontWeight={600}
              fontSize="150"
              fill="url(#goldGrad)"
            >
              Abishek Tattoo
            </text>
            <text
              x="500"
              y="300"
              textAnchor="middle"
              fontFamily="inherit"
              fontWeight={600}
              fontSize="150"
              fill="url(#goldGrad)"
            >
              Ink
            </text>
          </svg>
        </div>

        {/* bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            padding: "0 0 clamp(28px, 4vh, 44px)",
          }}
        >
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#1a1a1a",
            }}
          >
            Google
          </span>

          <div
            style={{
              display: "flex",
              gap: "clamp(20px, 2.4vw, 36px)",
              flexWrap: "wrap",
            }}
          >
            {BOTTOM.map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  color: "#5f6368",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
