import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow } from "@/lib/theme";

const ITEMS = [
  {
    n: "01",
    title: "Hygiene & Safety",
    desc: "Single-use needles, sterile workflow, medical-grade standards — every session.",
    path: "M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z",
  },
  {
    n: "02",
    title: "Custom Art",
    desc: "No flash off the wall. Every piece is designed around you and your story.",
    path: "M3 21l3-1 11-11-2-2L4 18l-1 3zM14 6l2 2M16 4l4 4",
  },
  {
    n: "03",
    title: "Nepali Heritage",
    desc: "Traditional Kathmandu motifs reinterpreted with a modern, refined hand.",
    path: "M3 20l6-12 4 7 3-5 5 10z",
  },
  {
    n: "04",
    title: "Experienced Artists",
    desc: "A resident team with years of craft across every major style.",
    path: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3z",
  },
];

export default function WhyInkSpire() {
  return (
    <section
      style={{
        background: COLORS.charcoal,
        padding: "clamp(90px, 16vh, 200px) clamp(24px, 5vw, 96px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>Why InkSpire</div>
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
              maxWidth: "16ch",
            }}
          >
            Craft you can trust.
          </h2>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "clamp(20px, 2.4vw, 36px)",
          }}
        >
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 0.08}>
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  background: "#181a1f",
                  border: "1px solid rgba(203,164,90,0.18)",
                  borderRadius: 4,
                  padding: "clamp(28px, 2.6vw, 40px)",
                  overflow: "hidden",
                }}
              >
                {/* faint number accent */}
                <span
                  style={{
                    position: "absolute",
                    top: "0.6rem",
                    right: "1.2rem",
                    fontFamily: SERIF,
                    fontSize: "3.4rem",
                    color: "rgba(203,164,90,0.1)",
                    lineHeight: 1,
                  }}
                >
                  {item.n}
                </span>

                <svg viewBox="0 0 24 24" width={40} height={40}>
                  <path
                    d={item.path}
                    stroke={COLORS.gold}
                    strokeWidth={1.3}
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(1.5rem, 2vw, 2rem)",
                    color: COLORS.offWhite,
                    margin: "1.4rem 0 0.6rem",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: "0.98rem",
                    lineHeight: 1.6,
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
