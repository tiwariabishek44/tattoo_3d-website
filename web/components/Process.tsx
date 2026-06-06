import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, GUTTER } from "@/lib/theme";

const STEPS = [
  { n: "1", title: "Consult", desc: "We listen to your idea, placement and story — no rush, no pressure." },
  { n: "2", title: "Design", desc: "A custom piece is drawn for you and refined until it's right." },
  { n: "3", title: "Ink", desc: "In a sterile, calm studio, your tattoo is brought to life by hand." },
  { n: "4", title: "Aftercare", desc: "We guide you through healing so it stays crisp for life." },
];

export default function Process() {
  return (
    <section
      style={{
        background: COLORS.cream,
        color: COLORS.inkText,
        padding: `clamp(90px, 16vh, 200px) ${GUTTER}`,
      }}
    >
      <div style={{ textAlign: "left" }}>
        <Reveal>
          <div style={{ ...eyebrow(COLORS.gold), marginBottom: "1.2rem" }}>
            How it works
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(2.4rem, 5vw, 5rem)",
              lineHeight: 1.05,
              margin: "0 0 clamp(64px, 9vh, 120px)",
            }}
          >
            From idea to ink.
          </h2>
        </Reveal>

        {/* horizontal timeline */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(28px, 3vw, 48px)",
            borderTop: "1px solid rgba(22,19,13,0.25)",
            marginTop: 36,
          }}
        >
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} style={{ flex: "1 1 200px" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "1px solid rgba(203,164,90,0.7)",
                    background: COLORS.cream,
                    color: COLORS.gold,
                    fontFamily: SERIF,
                    fontSize: "1.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "-36px auto 1.8rem",
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)",
                    margin: "0 0 0.6rem",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: "0.98rem",
                    lineHeight: 1.6,
                    color: COLORS.mutedDark,
                    margin: "0 auto",
                    maxWidth: "26ch",
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
