import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, frame, GUTTER } from "@/lib/theme";

const ARTISTS = [
  { name: "Tenzin", specialty: "Fine line · Custom", img: frame(10) },
  { name: "Maya", specialty: "Realism · Cover-up", img: frame(75) },
  { name: "Rohan", specialty: "Blackwork · Traditional", img: frame(140) },
  { name: "Sita", specialty: "Heritage · Ornamental", img: frame(205) },
];

export default function Artists() {
  return (
    <section
      style={{
        background: COLORS.ink,
        padding: `clamp(90px, 16vh, 200px) ${GUTTER}`,
      }}
    >
      <div>
        <Reveal>
          <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>The hands</div>
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
            Meet the artists.
          </h2>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(20px, 2.4vw, 40px)",
          }}
        >
          {ARTISTS.map((a, i) => (
            <Reveal key={a.name} delay={(i % 4) * 0.08}>
              <div>
                {/* TODO: replace frame placeholder with real artist photo */}
                <div
                  style={{
                    aspectRatio: "3 / 4",
                    borderRadius: 4,
                    backgroundImage: `linear-gradient(to top, rgba(7,8,10,0.6), rgba(7,8,10,0.1)), url(${a.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid rgba(203,164,90,0.22)",
                    marginBottom: "1.2rem",
                  }}
                />
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(1.5rem, 2vw, 2rem)",
                    color: COLORS.offWhite,
                    margin: "0 0 0.3rem",
                  }}
                >
                  {a.name}
                </h3>
                <div
                  style={{
                    fontFamily: SANS,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontSize: "0.74rem",
                    color: COLORS.gold,
                  }}
                >
                  {a.specialty}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
