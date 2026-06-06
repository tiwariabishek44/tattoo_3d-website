import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, frame } from "@/lib/theme";

const STYLES = [
  { name: "Fine Line", desc: "Delicate, precise linework with quiet elegance." },
  { name: "Blackwork", desc: "Bold, graphic black — high contrast, high impact." },
  { name: "Traditional", desc: "Timeless motifs, confident lines, lasting colour." },
  { name: "Realism", desc: "Photographic depth and detail, rendered by hand." },
  { name: "Custom", desc: "Original pieces designed around your story." },
  { name: "Piercing & Laser", desc: "Studio-grade piercing and professional removal." },
];

export default function Styles() {
  return (
    <section
      style={{
        background: COLORS.cream,
        color: COLORS.inkText,
        padding: "clamp(90px, 16vh, 200px) clamp(24px, 5vw, 96px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(48px, 6vw, 110px)",
          alignItems: "start",
        }}
      >
        {/* left — image */}
        <Reveal>
          {/* TODO: swap frame placeholder for real tattoo work */}
          <div
            style={{
              aspectRatio: "3 / 4",
              borderRadius: 4,
              backgroundImage: `url(${frame(120)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(22,19,13,0.18)",
              position: "sticky",
              top: "12vh",
            }}
          />
        </Reveal>

        {/* right — editorial list */}
        <div>
          <Reveal>
            <div style={{ ...eyebrow(COLORS.gold), marginBottom: "1.2rem" }}>
              What we do
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.4rem, 4.6vw, 4.6rem)",
                lineHeight: 1.05,
                margin: "0 0 clamp(32px, 4vh, 56px)",
              }}
            >
              Styles we master.
            </h2>
          </Reveal>

          {STYLES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05}>
              <div
                style={{
                  display: "flex",
                  gap: "1.4rem",
                  alignItems: "baseline",
                  padding: "1.5rem 0",
                  borderTop: "1px solid rgba(22,19,13,0.18)",
                }}
              >
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: COLORS.gold,
                    flexShrink: 0,
                    paddingTop: "0.5rem",
                  }}
                >
                  0{i + 1}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 500,
                      fontSize: "clamp(1.7rem, 2.4vw, 2.4rem)",
                      margin: "0 0 0.3rem",
                    }}
                  >
                    {s.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: "0.98rem",
                      lineHeight: 1.6,
                      color: COLORS.mutedDark,
                      margin: 0,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
