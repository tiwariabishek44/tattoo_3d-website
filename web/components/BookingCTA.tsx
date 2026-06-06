import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, frame, GUTTER } from "@/lib/theme";

export default function BookingCTA() {
  return (
    <section
      style={{
        position: "relative",
        // TODO: swap frame placeholder for a full-bleed studio/ink/skin image
        backgroundImage: `linear-gradient(rgba(7,6,5,0.76), rgba(7,6,5,0.93)), url(${frame(170)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: `clamp(120px, 24vh, 300px) ${GUTTER}`,
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <Reveal>
        <div style={{ ...eyebrow(), marginBottom: "1.6rem" }}>
          Teyung Tattoo Ink
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(3rem, 8vw, 8.5rem)",
            lineHeight: 1,
            color: COLORS.gold,
            margin: 0,
          }}
        >
          Begin your mark.
        </h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p
          style={{
            fontFamily: SANS,
            fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
            lineHeight: 1.7,
            color: COLORS.muted,
            margin: "2rem auto 0",
            maxWidth: "46ch",
          }}
        >
          Book a consultation and let&apos;s design something unmistakably yours.
        </p>
      </Reveal>
      <Reveal delay={0.24}>
        <a
          href="#book"
          style={{
            display: "inline-block",
            marginTop: "2.6rem",
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: COLORS.ink,
            background: COLORS.gold,
            padding: "1.1rem 2.6rem",
            borderRadius: 2,
            textDecoration: "none",
          }}
        >
          Book a session
        </a>
      </Reveal>
    </section>
  );
}
