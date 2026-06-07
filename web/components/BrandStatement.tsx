import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow } from "@/lib/theme";

// Second div (right after the machine hero) — THE BRAND STORY, staged as ONE
// cinematic frame: full-bleed studio photo, dark-left → clear-right scrim,
// text overlaid directly on the image. This mirrors HeroText's beat-block
// grammar exactly (same scrim direction, same side-padding formula —
// clamp(28px, 6vw, 110px)) so the two sections read as one continuous voice,
// not hero-then-separate-content-card.
//   Setup (eyebrow)    → who we are
//   Tension (headline) → the heritage/modern duality
//   Reveal             → the room ITSELF, alive behind the words
//   Resolution (proof) → quiet, typographic trust marks woven into the column
const STUDIO_IMG = "/studio_image.jpeg";

const PROOF = [
  { mark: "★ 4.9", label: "Google Reviews" },
  { mark: "Top Rated", label: "TripAdvisor" },
  { mark: "500+", label: "Pieces inked since 2015" },
];

const COLUMN = "min(640px, 50vw)";

export default function BrandStatement() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "clamp(640px, 92vh, 980px)",
        overflow: "hidden",
        backgroundImage: `url(${STUDIO_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* scrim — dark left (text lives here) → clear right (the room shows
          through), identical grammar to the hero's left-side beats */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(7,6,5,0.88) 0%, rgba(7,6,5,0.6) 36%, rgba(7,6,5,0.12) 70%, rgba(7,6,5,0) 100%), linear-gradient(to top, rgba(7,6,5,0.5) 0%, rgba(7,6,5,0) 38%)",
        }}
      />

      {/* text column — left side, overlaid on the room. Same inset rhythm
          as HeroText's beats → one shared alignment rail across both sections */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 clamp(28px, 6vw, 110px)",
        }}
      >
        <div style={{ width: COLUMN, flexShrink: 0 }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem" }}>
              <span style={{ width: 34, height: 1, background: COLORS.gold }} />
              <span style={eyebrow()}>Teyung&apos;s Tattoo Ink</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.4rem, 4.6vw, 4.6rem)",
                lineHeight: 1.08,
                color: COLORS.offWhite,
                margin: 0,
                textShadow: "0 2px 26px rgba(0,0,0,0.6)",
              }}
            >
              Where <span style={{ color: COLORS.gold }}>traditional Nepali motifs</span>{" "}
              meet <span style={{ color: COLORS.gold }}>modern ink.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
                lineHeight: 1.7,
                color: "rgba(242,239,233,0.8)",
                marginTop: "1.6rem",
                maxWidth: "50ch",
                textShadow: "0 1px 16px rgba(0,0,0,0.5)",
              }}
            >
              Teyung Tattoo Ink is built on a simple belief — that a tattoo is
              a decision worth honouring. Step inside and you&apos;ll feel it:
              Kathmandu&apos;s living heritage sitting easily beside raw,
              contemporary expression — exactly how we work, and exactly how
              it lives on your skin.
            </p>
          </Reveal>

          {/* resolution — quiet proof, woven into the same world, same column */}
          <Reveal delay={0.24}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "clamp(16px, 2vw, 28px)",
                marginTop: "clamp(28px, 4vh, 46px)",
              }}
            >
              {PROOF.flatMap((p, i) => [
                ...(i > 0
                  ? [
                      <span
                        key={`div-${i}`}
                        aria-hidden
                        style={{ width: 1, height: 22, background: "rgba(203,164,90,0.32)" }}
                      />,
                    ]
                  : []),
                <div key={p.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      color: COLORS.gold,
                      textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                    }}
                  >
                    {p.mark}
                  </span>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: "0.86rem",
                      letterSpacing: "0.03em",
                      color: "rgba(242,239,233,0.72)",
                      textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                    }}
                  >
                    {p.label}
                  </span>
                </div>,
              ])}
            </div>
          </Reveal>

          {/* location — small detail line, ties the room to its place */}
          <Reveal delay={0.3}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: "0.84rem",
                letterSpacing: "0.04em",
                color: "rgba(242,239,233,0.55)",
                marginTop: "1.15rem",
                textShadow: "0 1px 14px rgba(0,0,0,0.5)",
              }}
            >
              Thamel, Kathmandu — open by appointment
            </div>
          </Reveal>

          {/* CTA — invites the viewer INTO the room they're already looking at.
              Ghost-gold (frosted fill + gold outline) so it complements, rather
              than competes with, the persistent solid-gold "Book a session" pill. */}
          <Reveal delay={0.36}>
            <a
              href="/concept-3"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: SANS,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: COLORS.gold,
                background: "rgba(203,164,90,0.1)",
                border: `1px solid rgba(203,164,90,0.55)`,
                padding: "1rem 1.8rem",
                borderRadius: 999,
                textDecoration: "none",
                marginTop: "2rem",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              Get studio tour
              <span aria-hidden style={{ fontSize: "0.9rem" }}>↗</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
