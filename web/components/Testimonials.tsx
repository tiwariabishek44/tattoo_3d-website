import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, GUTTER } from "@/lib/theme";

const QUOTES = [
  {
    quote:
      "They didn't just give me a tattoo — they designed something that finally felt like mine. The line work is flawless.",
    name: "Aarav S.",
    meta: "Custom sleeve",
  },
  {
    quote:
      "Spotless studio, calm energy, and an artist who genuinely cared. Healed perfectly and still looks razor-sharp.",
    name: "Priya M.",
    meta: "Fine line",
  },
  {
    quote:
      "Brought a rough idea rooted in Nepali art and they elevated it beyond what I imagined. True craftspeople.",
    name: "Bibek T.",
    meta: "Heritage piece",
  },
];

export default function Testimonials() {
  return (
    <section
      style={{
        background: COLORS.ink,
        padding: `clamp(90px, 16vh, 200px) ${GUTTER}`,
      }}
    >
      <div>
        <Reveal>
          <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>
            In their words
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(2.4rem, 5vw, 5rem)",
              lineHeight: 1.06,
              color: COLORS.offWhite,
              margin: "0 0 clamp(40px, 6vh, 80px)",
            }}
          >
            Stories worth wearing.
          </h2>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(24px, 2.6vw, 48px)",
          }}
        >
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={(i % 3) * 0.08}>
              <div
                style={{
                  border: "1px solid rgba(203,164,90,0.22)",
                  borderRadius: 4,
                  padding: "clamp(28px, 3vw, 44px)",
                  height: "100%",
                }}
              >
                <div style={{ color: COLORS.gold, fontFamily: SERIF, fontSize: "3rem", lineHeight: 0.8, marginBottom: "1rem" }}>
                  &ldquo;
                </div>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)",
                    lineHeight: 1.5,
                    color: COLORS.offWhite,
                    margin: "0 0 1.8rem",
                  }}
                >
                  {q.quote}
                </p>
                <div
                  style={{
                    fontFamily: SANS,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontSize: "0.74rem",
                    color: COLORS.gold,
                  }}
                >
                  {q.name} · <span style={{ color: COLORS.muted }}>{q.meta}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
