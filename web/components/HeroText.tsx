"use client";

import {
  MotionValue,
  motion,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

// ── Type / color tokens ─────────────────────────────────
const SERIF = "var(--font-cormorant), Georgia, serif";
const SANS = "var(--font-inter), system-ui, sans-serif";
const OFF_WHITE = "#F2F3F5";
const GOLD = "#CBA45A"; // brand gold (matches the machine's brass)
const COLUMN = "min(680px, 48vw)";
// ────────────────────────────────────────────────────────

type Beat = {
  eyebrow: string;
  headline: string;
  support: string;
  side: "left" | "right";
  window: [number, number, number, number]; // [fadeInStart, fullIn, fullOut, fadeOutEnd]
  startVisible?: boolean;
  persist?: boolean;
};

// 3 beats over a R→L→R motion (LEGS = 2). Machine: R at p=0, L at p=0.5, R at p=1.
const BEATS: Beat[] = [
  {
    eyebrow: "TEYUNG TATTOO INK",
    headline: "Permanence is a craft.",
    support:
      "A tattoo outlives the moment it's made. We treat every one exactly that way — considered, deliberate, built to last a lifetime.",
    side: "left",
    window: [0, 0.05, 0.14, 0.24],
    startVisible: true,
  },
  {
    eyebrow: "PRECISION",
    headline: "Every line, deliberate.",
    support:
      "From the first stencil to the final pass, nothing is rushed — clean lines, steady hands, an obsession with the millimetre.",
    side: "right",
    window: [0.26, 0.44, 0.57, 0.66],
  },
  {
    eyebrow: "THE CRAFT",
    headline: "Made by hand. Worn for life.",
    support:
      "Our artists don't print — they compose. Each piece is designed for you, your story, and the way it lives on your skin.",
    side: "left",
    window: [0.79, 0.9, 1, 1],
    persist: true,
  },
];

function gradientFor(side: "left" | "right") {
  const dir = side === "left" ? "to right" : "to left";
  return `linear-gradient(${dir}, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0) 64%)`;
}

function BeatBlock({
  progress,
  beat,
}: {
  progress: MotionValue<number>;
  beat: Beat;
}) {
  const [w0, w1, w2, w3] = beat.window;

  const opIn = beat.startVisible ? [0, w2, w3] : [w0, w1, w2, w3];
  const opOut = beat.startVisible
    ? [1, 1, 0]
    : [0, 1, 1, beat.persist ? 1 : 0];
  const opacity = useTransform(progress, opIn, opOut);

  const riseFrom = beat.startVisible ? 0 : 28;
  const blurFrom = beat.startVisible ? 0 : 6;
  const y = useTransform(progress, [w0, w1], [riseFrom, 0]);
  const blurPx = useTransform(progress, [w0, w1], [blurFrom, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: beat.side === "left" ? "flex-start" : "flex-end",
        padding: "0 clamp(28px, 6vw, 110px)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradientFor(beat.side),
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{ y, filter, position: "relative", width: COLUMN, flexShrink: 0 }}
      >
        <div
          style={{
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.26em",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: GOLD,
            marginBottom: "1.3rem",
          }}
        >
          {beat.eyebrow}
        </div>

        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(3.2rem, 7vw, 8rem)",
            lineHeight: 1.02,
            color: GOLD,
            margin: 0,
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
          }}
        >
          {beat.headline}
        </h2>

        <p
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.78)",
            marginTop: "1.6rem",
            textShadow: "0 1px 16px rgba(0,0,0,0.5)",
          }}
        >
          {beat.support}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function HeroText({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const hintOpacity = useTransform(progress, [0, 0.02, 0.05], [1, 1, 0]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {BEATS.map((beat, i) => (
        <BeatBlock key={i} progress={progress} beat={beat} />
      ))}

      {/* scroll hint — fades after the first scroll */}
      <motion.div
        style={{
          opacity: hintOpacity,
          position: "absolute",
          bottom: "clamp(20px, 4vh, 48px)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          fontFamily: SANS,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          fontSize: "0.7rem",
          color: GOLD,
        }}
      >
        <span>Scroll</span>
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>⌄</span>
      </motion.div>
    </div>
  );
}
