// Footer — rises up after the hero finishes (placed after ScrollSequence in flow).
// NOTE: background image / texture to be added later (see the TODO marker).

const SANS = "var(--font-inter), system-ui, sans-serif";
const SERIF = "var(--font-cormorant), Georgia, serif";
const OFF_WHITE = "#F2F3F5";
const GOLD = "#CBA45A";

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  textTransform: "uppercase",
  letterSpacing: "0.24em",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: GOLD,
  marginBottom: "1.4rem",
};

const linkStyle: React.CSSProperties = {
  fontFamily: SANS,
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
  fontSize: "1.02rem",
  lineHeight: 2.1,
  display: "block",
};

function Column({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {items.map((i) => (
        <a key={i} href="#" style={linkStyle}>
          {i}
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        background: "#070605", // near-black. TODO: swap for bg image / texture later
        color: OFF_WHITE,
        fontFamily: SANS,
        padding:
          "clamp(72px, 12vh, 168px) clamp(24px, 4vw, 80px) clamp(28px, 4vh, 48px)",
      }}
    >
      {/* top row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "clamp(40px, 6vw, 96px)",
          paddingBottom: "clamp(48px, 7vh, 88px)",
          borderBottom: "1px solid rgba(203,164,90,0.25)",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="Teyung Tattoo Ink"
            style={{
              height: 72,
              width: "auto",
              marginBottom: 30,
              borderRadius: "50%",
            }}
          />
          <p
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2rem, 3vw, 3.2rem)",
              lineHeight: 1.16,
              color: GOLD,
              margin: 0,
            }}
          >
            Permanence is a craft.
          </p>
        </div>

        <Column label="Studio" items={["Home", "About Us", "Artists", "After Care"]} />
        <Column label="Visit" items={["Find the studio", "Opening hours", "Book a consult"]} />
        <Column
          label="Connect"
          items={["Instagram", "hello@teyung.ink", "+977 98XX XXXXXX"]}
        />
      </div>

      {/* bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginTop: "clamp(24px, 4vh, 40px)",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        <span>© 2026 Teyung Tattoo Ink. All rights reserved.</span>
        <span>Privacy Policy</span>
        <span>Made with care</span>
      </div>
    </footer>
  );
}
