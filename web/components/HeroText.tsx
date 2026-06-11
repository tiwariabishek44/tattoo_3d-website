"use client";

import { MotionValue, motion, useTransform } from "framer-motion";

// ── Type / color tokens ─────────────────────────────────
const SERIF = "var(--font-cormorant), Georgia, serif";
const SANS = "var(--font-inter), system-ui, sans-serif";
const GOLD = "#CBA45A"; // brand gold (matches the machine's brass)
const COLUMN = "min(680px, 48vw)";
// ────────────────────────────────────────────────────────

// Hero Text Plan — two-slogan handoff over the hero's 200vh scroll-through
// (hero-text-plan.md). progress is 0-1 across that full range.
type Slogan = {
  eyebrow: string;
  headline: string;
  support: string;
  side: "left" | "right";
  // [inStart, inEnd, outStart, outEnd] in local 0-1 progress.
  window: [number, number, number, number];
  startVisible?: boolean;
};

const SLOGANS: Slogan[] = [
  {
    eyebrow: "Abishek TATTOO INK",
    headline: "Permanence is a craft.",
    support:
      "A tattoo outlives the moment it's made. We treat every one exactly that way — considered, deliberate, built to last a lifetime.",
    side: "left",
    window: [0, 0, 0.30, 0.48],
    startVisible: true,
  },
  {
    eyebrow: "PRECISION",
    headline: "Every line, deliberate.",
    support:
      "From the first stencil to the final pass, nothing is rushed — clean lines, steady hands, an obsession with the millimetre.",
    side: "right",
    window: [0.52, 0.64, 0.70, 0.80],
  },
];

const HINT_OUT: [number, number, number] = [0, 0.04, 0.08];

function gradientFor(side: "left" | "right") {
  const dir = side === "left" ? "to right" : "to left";
  return `linear-gradient(${dir}, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0) 64%)`;
}

function SloganBlock({
  progress,
  slogan,
}: {
  progress: MotionValue<number>;
  slogan: Slogan;
}) {
  const [w0, w1, w2, w3] = slogan.window;

  // Calculate distinct proportional windows for each line (eyebrow -> headline -> support):
  const inDur = w1 - w0;
  const outDur = w3 - w2;

  // Fade-in windows:
  const ebInStart = w0;
  const ebInEnd = w0 + (inDur > 0 ? inDur * 0.33 : 0);

  const hlInStart = w0 + (inDur > 0 ? inDur * 0.33 : 0);
  const hlInEnd = w0 + (inDur > 0 ? inDur * 0.66 : 0);

  const spInStart = w0 + (inDur > 0 ? inDur * 0.66 : 0);
  const spInEnd = w1;

  // Fade-out windows (Eyebrow exits first, then Headline, then Support last):
  const ebOutStart = w2;
  const ebOutEnd = w2 + (outDur > 0 ? outDur * 0.33 : 0);

  const hlOutStart = w2 + (outDur > 0 ? outDur * 0.33 : 0);
  const hlOutEnd = w2 + (outDur > 0 ? outDur * 0.66 : 0);

  const spOutStart = w2 + (outDur > 0 ? outDur * 0.66 : 0);
  const spOutEnd = w3;

  // Global Scrim Background Opacity Animation
  const bgOpIn = slogan.startVisible ? [w2, w3] : [w0, w1, w2, w3];
  const bgOpOut = slogan.startVisible ? [1, 0] : [0, 1, 1, 0];
  const bgOpacity = useTransform(progress, bgOpIn, bgOpOut);

  // 1. Eyebrow animations
  const ebOpIn = slogan.startVisible ? [ebOutStart, ebOutEnd] : [ebInStart, ebInEnd, ebOutStart, ebOutEnd];
  const ebOpOut = slogan.startVisible ? [1, 0] : [0, 1, 1, 0];
  const ebOpacity = useTransform(progress, ebOpIn, ebOpOut);
  const ebYIn = slogan.startVisible ? [ebOutStart, ebOutEnd] : [ebInStart, ebInEnd, ebOutStart, ebOutEnd];
  const ebYOut = slogan.startVisible ? [0, -30] : [30, 0, 0, -30];
  const ebY = useTransform(progress, ebYIn, ebYOut);
  const ebColor = useTransform(
    progress,
    ebOpIn,
    slogan.startVisible 
      ? ["rgba(203, 164, 90, 1)", "rgba(203, 164, 90, 0)"]
      : ["rgba(203, 164, 90, 0)", "rgba(203, 164, 90, 1)", "rgba(203, 164, 90, 1)", "rgba(203, 164, 90, 0)"]
  );

  // 2. Headline animations
  const hlOpIn = slogan.startVisible ? [hlOutStart, hlOutEnd] : [hlInStart, hlInEnd, hlOutStart, hlOutEnd];
  const hlOpOut = slogan.startVisible ? [1, 0] : [0, 1, 1, 0];
  const hlOpacity = useTransform(progress, hlOpIn, hlOpOut);
  const hlYIn = slogan.startVisible ? [hlOutStart, hlOutEnd] : [hlInStart, hlInEnd, hlOutStart, hlOutEnd];
  const hlYOut = slogan.startVisible ? [0, -30] : [30, 0, 0, -30];
  const hlY = useTransform(progress, hlYIn, hlYOut);
  const hlColor = useTransform(
    progress,
    hlOpIn,
    slogan.startVisible
      ? ["rgba(203, 164, 90, 1)", "rgba(203, 164, 90, 0)"]
      : ["rgba(203, 164, 90, 0)", "rgba(203, 164, 90, 1)", "rgba(203, 164, 90, 1)", "rgba(203, 164, 90, 0)"]
  );

  // 3. Support animations
  const spOpIn = slogan.startVisible ? [spOutStart, spOutEnd] : [spInStart, spInEnd, spOutStart, spOutEnd];
  const spOpOut = slogan.startVisible ? [1, 0] : [0, 1, 1, 0];
  const spOpacity = useTransform(progress, spOpIn, spOpOut);
  const spYIn = slogan.startVisible ? [spOutStart, spOutEnd] : [spInStart, spInEnd, spOutStart, spOutEnd];
  const spYOut = slogan.startVisible ? [0, -30] : [30, 0, 0, -30];
  const spY = useTransform(progress, spYIn, spYOut);
  const spColor = useTransform(
    progress,
    spOpIn,
    slogan.startVisible
      ? ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0)"]
      : ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0)"]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: slogan.side === "left" ? "flex-start" : "flex-end",
        padding: "0 clamp(28px, 6vw, 110px)",
        pointerEvents: "none",
      }}
    >
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: gradientFor(slogan.side),
          opacity: bgOpacity,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", width: COLUMN, flexShrink: 0 }}>
        <motion.div
          style={{
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.26em",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: ebColor,
            opacity: ebOpacity,
            y: ebY,
            marginBottom: "1.3rem",
          }}
        >
          {slogan.eyebrow}
        </motion.div>

        <motion.h2
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(3.2rem, 7vw, 8rem)",
            lineHeight: 1.02,
            color: hlColor,
            opacity: hlOpacity,
            y: hlY,
            margin: 0,
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
          }}
        >
          {slogan.headline}
        </motion.h2>

        <motion.p
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
            lineHeight: 1.65,
            color: spColor,
            opacity: spOpacity,
            y: spY,
            marginTop: "1.6rem",
            textShadow: "0 1px 16px rgba(0,0,0,0.5)",
          }}
        >
          {slogan.support}
        </motion.p>
      </div>
    </div>
  );
}

export default function HeroText({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const hintOpacity = useTransform(progress, HINT_OUT, [1, 1, 0]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SLOGANS.map((slogan, i) => (
        <SloganBlock key={i} progress={progress} slogan={slogan} />
      ))}

      {/* scroll hint — fades within the first ~8% of the hero scroll-through */}
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
