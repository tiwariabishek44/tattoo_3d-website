import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";
import { SERIF, SANS, COLORS, eyebrow, GUTTER } from "@/lib/theme";

export const metadata: Metadata = {
  title: "After Care — Abishek Tattoo Ink",
  description:
    "How to care for a fresh tattoo so it heals clean and stays sharp — the Abishek aftercare guide.",
};

// Real aftercare guidance — standard, honest, studio-voiced. Swap to the studio's
// exact protocol later if it differs; structure stays.
const STAGES: { when: string; title: string; body: string }[] = [
  {
    when: "First 24 hours",
    title: "Leave it wrapped, then wash once.",
    body: "Keep the covering on for the time your artist told you — usually a few hours, longer for a second-skin film. When you take it off, wash the piece once with lukewarm water and a fragrance-free soap, using only clean hands. Pat dry with a clean paper towel and let it breathe.",
  },
  {
    when: "Days 2 – 14",
    title: "Wash gently, moisturise thinly.",
    body: "Wash twice a day and apply a thin layer of the aftercare balm we recommend — thin is the rule; a tattoo needs to breathe, not drown. It will flake and feel tight as it heals. That is normal. Let it.",
  },
  {
    when: "Weeks 3 – 4",
    title: "Let the skin close on its own.",
    body: "The surface settles and any last flaking finishes. Keep moisturising if the skin feels dry. The colour may look cloudy for a week or two as the top layer renews — it clears on its own. Don't rush it.",
  },
  {
    when: "For life",
    title: "Sun is the one thing that ages ink.",
    body: "Once fully healed, a tattoo asks for almost nothing — except shade. Sunscreen over it whenever it's exposed is the single habit that keeps line and colour sharp for decades. Protect it and it stays the day you got it.",
  },
];

const AVOID = [
  "Picking or scratching scabs and flaking skin",
  "Soaking it — pools, baths, the sea — until fully healed",
  "Direct sun and tanning beds on fresh ink",
  "Tight clothing that rubs over the piece",
  "Thick layers of ointment that smother the skin",
];

const labelRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: "1.5rem",
};

export default function AfterCarePage() {
  return (
    <main style={{ background: COLORS.ink, minHeight: "100vh" }}>
      <Header />

      {/* hero band — clears the fixed header */}
      <section
        style={{
          padding: `clamp(140px, 22vh, 260px) ${GUTTER} clamp(40px, 7vh, 90px)`,
          maxWidth: 1100,
        }}
      >
        <Reveal>
          <div style={labelRow}>
            <span style={{ width: 34, height: 1, background: COLORS.gold }} />
            <span style={eyebrow()}>After Care</span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(2.6rem, 6vw, 5.6rem)",
              lineHeight: 1.04,
              color: COLORS.offWhite,
              margin: 0,
            }}
          >
            Healing is part of the <span style={{ color: COLORS.gold }}>craft.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
              lineHeight: 1.7,
              color: COLORS.muted,
              marginTop: "1.8rem",
              maxWidth: "58ch",
            }}
          >
            A tattoo is finished by you, in the two weeks after you leave the
            chair. Treat it gently and it heals exactly as it was drawn. Here is
            everything you need — and nothing you don&apos;t.
          </p>
        </Reveal>
      </section>

      {/* the timeline */}
      <section style={{ padding: `0 ${GUTTER} clamp(60px, 10vh, 140px)` }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(28px, 3vw, 56px)",
            maxWidth: 1200,
          }}
        >
          {STAGES.map((s, i) => (
            <Reveal key={s.when} delay={(i % 2) * 0.08}>
              <div
                style={{
                  borderTop: `1px solid rgba(203,164,90,0.3)`,
                  paddingTop: "1.6rem",
                  height: "100%",
                }}
              >
                <div style={{ ...eyebrow(), marginBottom: "0.9rem" }}>{s.when}</div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
                    lineHeight: 1.15,
                    color: COLORS.offWhite,
                    margin: "0 0 1rem",
                  }}
                >
                  {s.title}
                </h2>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* what to avoid */}
      <section
        style={{
          background: COLORS.charcoal,
          padding: `clamp(60px, 12vh, 140px) ${GUTTER}`,
        }}
      >
        <Reveal>
          <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>While it heals</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              lineHeight: 1.08,
              color: COLORS.offWhite,
              margin: "0 0 clamp(32px, 5vh, 56px)",
              maxWidth: "24ch",
            }}
          >
            A few things to keep away from it.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gap: "1rem", maxWidth: 720 }}>
          {AVOID.map((a, i) => (
            <Reveal key={a} delay={(i % 3) * 0.06}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  fontFamily: SANS,
                  fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
                  lineHeight: 1.5,
                  color: COLORS.offWhite,
                }}
              >
                <span style={{ color: COLORS.gold, fontFamily: SERIF, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{a}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* closing — when to reach us */}
      <section
        style={{
          padding: `clamp(80px, 16vh, 180px) ${GUTTER}`,
          textAlign: "center",
        }}
      >
        <Reveal>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(2rem, 4.6vw, 4rem)",
              lineHeight: 1.06,
              color: COLORS.gold,
              margin: "0 auto",
              maxWidth: "20ch",
            }}
          >
            Unsure about anything? Just ask.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
              lineHeight: 1.7,
              color: COLORS.muted,
              margin: "1.6rem auto 0",
              maxWidth: "46ch",
            }}
          >
            If something looks or feels off while it heals, message us — we would
            always rather hear from you early than late.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "2.4rem",
            }}
          >
            <a
              href="mailto:hello@Abishek.ink"
              style={{
                fontFamily: SANS,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: COLORS.ink,
                background: COLORS.gold,
                padding: "1rem 2.2rem",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              Message the studio
            </a>
            <a
              href="/#contact"
              style={{
                fontFamily: SANS,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: COLORS.gold,
                background: "rgba(203,164,90,0.08)",
                border: `1px solid rgba(203,164,90,0.5)`,
                padding: "1rem 2.2rem",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              Find us
            </a>
          </div>
        </Reveal>
      </section>

      <Footer />
      <BookButton />
    </main>
  );
}
