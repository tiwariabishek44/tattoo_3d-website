"use client";

import {
  MotionValue,
  motion,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { BOOKING_HREF } from "@/lib/theme";

// Slogan layer for the spider story. Beats are bottom-centered film titles
// (the chest/spider sits dead-center, so side text would collide). Each beat
// fades in + rises + focuses, then fades out, mapped to a scroll window.

const SERIF = "var(--font-cormorant), Georgia, serif";
const SANS = "var(--font-inter), system-ui, sans-serif";
const GOLD = "#CBA45A";

type Beat = {
  eyebrow?: string;
  headline: string;
  support?: string;
  window: [number, number, number, number]; // [fadeInStart, fullIn, fullOut, fadeOutEnd]
  startVisible?: boolean;
  persist?: boolean;
  cta?: boolean;
};

// 2 beats over the unzip → reveal scrub. Ends on "Ink that's alive." + CTA,
// held over the settled spider (the Beat 3 crawl was cut — a living tattoo that
// LEAVES contradicts the message).
const BEATS: Beat[] = [
  {
    eyebrow: "InkSpire Tattoo",
    headline: "Beneath every layer.",
    window: [0, 0, 0.05, 0.15],
    startVisible: true,
  },
  {
    // NEW — gives the pull-back (the reveal's hero moment) a voice. Copy is a
    // creative placeholder, easy to swap.
    eyebrow: "THE CRAFT",
    headline: "Worn for a lifetime.",
    window: [0.2, 0.32, 0.44, 0.54],
  },
  {
    eyebrow: "THE ART",
    headline: "Ink that's alive.",
    support: "Alive in the skin — and yours for life.",
    window: [0.58, 0.72, 1, 1],
    persist: true,
    cta: true,
  },
];

const SCRIM =
  "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0) 64%)";

// Kinetic headline — each WORD rises + sharpens in a staggered cascade as the
// beat enters, so the line "assembles" with the scroll instead of just fading in.
// (Block-level opacity still handles presence/fade-out; words only add the rise.)
function KineticWord({
  progress, text, w0, w1, idx, count, startVisible,
}: {
  progress: MotionValue<number>;
  text: string;
  w0: number;
  w1: number;
  idx: number;
  count: number;
  startVisible: boolean;
}) {
  const per = Math.max(0.0001, w1 - w0) / Math.max(1, count);
  const start = w0 + idx * per * 0.6;   // overlapping stagger
  const end = start + per * 1.25;
  const y = useTransform(progress, startVisible ? [0, 1] : [start, end], startVisible ? [0, 0] : [20, 0]);
  const blurPx = useTransform(progress, startVisible ? [0, 1] : [start, end], startVisible ? [0, 0] : [6, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  return (
    <motion.span
      aria-hidden
      style={{ display: "inline-block", y, filter, marginRight: "0.26em", willChange: "transform, filter" }}
    >
      {text}
    </motion.span>
  );
}

function KineticHeadline({
  progress, text, w0, w1, startVisible,
}: {
  progress: MotionValue<number>;
  text: string;
  w0: number;
  w1: number;
  startVisible: boolean;
}) {
  const words = text.split(" ");
  return (
    <h2
      aria-label={text}
      style={{
        fontFamily: SERIF,
        fontWeight: 500,
        fontSize: "clamp(2.6rem, 6vw, 6.4rem)",
        lineHeight: 1.04,
        color: GOLD,
        margin: 0,
        textShadow: "0 2px 34px rgba(0,0,0,0.7)",
      }}
    >
      {words.map((word, i) => (
        <KineticWord
          key={i}
          progress={progress}
          text={word}
          w0={w0}
          w1={w1}
          idx={i}
          count={words.length}
          startVisible={startVisible}
        />
      ))}
    </h2>
  );
}

function BeatBlock({
  progress,
  beat,
  embedded,
}: {
  progress: MotionValue<number>;
  beat: Beat;
  embedded: boolean;
}) {
  const [w0, w1, w2, w3] = beat.window;

  const opIn = beat.startVisible ? [0, w2, w3] : [w0, w1, w2, w3];
  const opOut = beat.startVisible
    ? [1, 1, 0]
    : [0, 1, 1, beat.persist ? 1 : 0];
  const opacity = useTransform(progress, opIn, opOut);

  // Subtle "settle" — the block eases in from a touch larger as it arrives, so
  // the line reads like it's pulling into place with the reveal's camera.
  const scale = useTransform(progress, [w0, w1], beat.startVisible ? [1, 1] : [1.035, 1]);

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "clamp(64px, 14vh, 160px)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: SCRIM,
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{
          scale,
          position: "relative",
          width: "min(900px, 90vw)",
          textAlign: "center",
        }}
      >
        {beat.eyebrow && (
          <div
            style={{
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: GOLD,
              marginBottom: "1.2rem",
            }}
          >
            {beat.eyebrow}
          </div>
        )}

        <KineticHeadline
          progress={progress}
          text={beat.headline}
          w0={w0}
          w1={w1}
          startVisible={!!beat.startVisible}
        />

        {beat.support && (
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
              marginTop: "1.4rem",
              textShadow: "0 1px 16px rgba(0,0,0,0.6)",
            }}
          >
            {beat.support}
          </p>
        )}

        {beat.cta && !embedded && (
          <a
            href={BOOKING_HREF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: "2.2rem",
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#070605",
              background: GOLD,
              padding: "1rem 1.9rem",
              borderRadius: 999,
              textDecoration: "none",
              pointerEvents: "auto",
            }}
          >
            Book a session
            <span aria-hidden style={{ fontSize: "0.9rem" }}>↗</span>
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SpiderText({
  progress,
  embedded = false,
}: {
  progress: MotionValue<number>;
  embedded?: boolean;
}) {
  const hintOpacity = useTransform(progress, [0, 0.02, 0.05], [1, 1, 0]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {BEATS.map((beat, i) => (
        <BeatBlock key={i} progress={progress} beat={beat} embedded={embedded} />
      ))}

      {/* scroll hint — only on the standalone page (odd mid-homepage) */}
      {!embedded && (
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
      )}
    </div>
  );
}
