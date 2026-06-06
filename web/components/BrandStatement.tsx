import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, GUTTER } from "@/lib/theme";

// Second div (right after the machine hero) — a FIXED, calm brand anchor between
// the two scroll sequences. No slider / no scrub: a studio-interior photo with a
// label + the brand slogan. (Gentle Reveal fade-up only — that's an entrance,
// not a sequence.) Placeholder photo for now; swap a real studio interior later.
const STUDIO_IMG = "/crousls_images/traditional_tattoo1.jpg";

export default function BrandStatement() {
  return (
    <section
      style={{
        background: COLORS.ink,
        padding: `clamp(100px, 16vh, 200px) ${GUTTER}`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(40px, 6vw, 100px)",
          alignItems: "center",
        }}
      >
        {/* text */}
        <div>
          <Reveal>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: "1.6rem",
              }}
            >
              <span style={{ width: 34, height: 1, background: COLORS.gold }} />
              <span
                style={{
                  fontFamily: SANS,
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: COLORS.gold,
                }}
              >
                Teyung&apos;s Tattoo Ink
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.6rem, 5.2vw, 5.2rem)",
                lineHeight: 1.06,
                color: COLORS.offWhite,
                margin: 0,
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

        {/* studio interior image + fixed label */}
        <Reveal delay={0.1}>
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 5",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(203,164,90,0.30)",
              backgroundImage: `url(${STUDIO_IMG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 50px 110px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "clamp(20px, 3vw, 34px)",
                background:
                  "linear-gradient(to top, rgba(7,6,5,0.92) 0%, rgba(7,6,5,0.4) 55%, rgba(7,6,5,0) 100%)",
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: COLORS.gold,
                  marginBottom: "0.5rem",
                }}
              >
                Our Studio
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 500,
                  fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
                  color: COLORS.offWhite,
                }}
              >
                Thamel, Kathmandu — by appointment.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
