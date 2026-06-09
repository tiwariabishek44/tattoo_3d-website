import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow } from "@/lib/theme";

const INFO = [
  { label: "Studio", lines: ["Thamel, Kathmandu", "Nepal 44600"] },
  { label: "Hours", lines: ["Mon – Sat · 11am – 8pm", "Sunday · by appointment"] },
  { label: "Contact", lines: ["+977 98XX XXXXXX", "hello@Abishek.ink"] },
];

export default function Visit() {
  return (
    <section
      style={{
        background: COLORS.ink,
        padding: "clamp(90px, 16vh, 200px) clamp(24px, 5vw, 96px)",
        borderTop: "1px solid rgba(203,164,90,0.14)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(40px, 5vw, 80px)",
          alignItems: "center",
        }}
      >
        <div>
          <Reveal>
            <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>Visit the studio</div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.4rem, 5vw, 5rem)",
                lineHeight: 1.06,
                color: COLORS.offWhite,
                margin: "0 0 2.4rem",
              }}
            >
              Find us in Kathmandu.
            </h2>
          </Reveal>

          {INFO.map((b, i) => (
            <Reveal key={b.label} delay={0.1 + i * 0.06}>
              <div style={{ marginBottom: "1.8rem" }}>
                <div
                  style={{
                    fontFamily: SANS,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: "0.72rem",
                    color: COLORS.gold,
                    marginBottom: "0.5rem",
                  }}
                >
                  {b.label}
                </div>
                {b.lines.map((l) => (
                  <div
                    key={l}
                    style={{
                      fontFamily: SANS,
                      fontSize: "1.05rem",
                      color: COLORS.muted,
                      lineHeight: 1.7,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        {/* TODO: replace with a real map embed (Google Maps) */}
        <Reveal delay={0.12}>
          <div
            style={{
              aspectRatio: "4 / 3",
              borderRadius: 4,
              border: "1px solid rgba(203,164,90,0.25)",
              background:
                "radial-gradient(circle at 50% 40%, #15171b 0%, #0a0b0d 70%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.78rem",
              color: COLORS.gold,
            }}
          >
            Map · Thamel, Kathmandu
          </div>
        </Reveal>
      </div>
    </section>
  );
}
