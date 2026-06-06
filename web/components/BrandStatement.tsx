import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, frame } from "@/lib/theme";

export default function BrandStatement() {
  return (
    <section
      style={{
        background: COLORS.ink,
        padding: "clamp(100px, 16vh, 200px) clamp(24px, 5vw, 96px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(40px, 5vw, 90px)",
          alignItems: "center",
        }}
      >
        <div>
          <Reveal>
            <div style={{ ...eyebrow(), marginBottom: "1.4rem" }}>
              Kathmandu · Authentic Tattoo Studio
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.4rem, 4.8vw, 4.8rem)",
                lineHeight: 1.08,
                color: COLORS.offWhite,
                margin: 0,
              }}
            >
              Where traditional Nepali motifs meet modern ink.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
                lineHeight: 1.7,
                color: COLORS.muted,
                marginTop: "1.8rem",
                maxWidth: "52ch",
              }}
            >
              Teyung Tattoo Ink is built on a simple belief — that a tattoo is a
              decision worth honouring. We blend Kathmandu&apos;s living heritage
              with contemporary technique to create work that&apos;s unmistakably
              yours, and made to last a lifetime.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          {/* TODO: swap frame placeholder for a real studio/work photo */}
          <div
            style={{
              aspectRatio: "4 / 5",
              borderRadius: 4,
              border: "1px solid rgba(203,164,90,0.25)",
              backgroundImage: `url(${frame(60)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}
