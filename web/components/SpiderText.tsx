"use client";

import { useEffect, useState } from "react";
import {
  MotionValue,
  motion,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
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
    eyebrow: "Abishek TATTOO INK",
    headline: "Beneath every layer.",
    window: [0, 0, 0.05, 0.15],
    startVisible: true,
  },
  {
    eyebrow: "THE ART",
    headline: "Ink that's alive.",
    support: "Alive in the skin — and yours for life.",
    window: [0.55, 0.7, 1, 1],
    persist: true,
    cta: true,
  },
];

const SCRIM =
  "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0) 64%)";

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

  const riseFrom = beat.startVisible ? 0 : 30;
  const blurFrom = beat.startVisible ? 0 : 7;
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
          y,
          filter,
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

        <h2
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
          {beat.headline}
        </h2>

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

// Stats — folded into the END of the Buddha sequence (replaces the standalone
// StatsBand). Fade in over the held reveal, beneath the "Ink that's alive." slogan.
const STATS = [
  { value: 12, suffix: "+", label: "Years of craft" },
  { value: 8, suffix: "", label: "Resident artists" },
  { value: 5000, suffix: "+", label: "Pieces inked" },
  { value: 30, suffix: "+", label: "Awards & features" },
];

function Stat({
  value,
  suffix,
  label,
  go,
}: {
  value: number;
  suffix: string;
  label: string;
  go: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    let raf = 0;
    let start = 0;
    const dur = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [go, value]);
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 500,
          fontSize: "clamp(2rem, 3.4vw, 3.2rem)",
          lineHeight: 1,
          color: GOLD,
          textShadow: "0 2px 20px rgba(0,0,0,0.7)",
        }}
      >
        {n.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: SANS,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.72)",
          marginTop: "0.6rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function StatsReveal({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.82, 0.94], [0, 1]);
  const y = useTransform(progress, [0.82, 0.94], [24, 0]);
  const [go, setGo] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    if (p > 0.84) setGo(true);
  });
  return (
    <motion.div
      style={{
        opacity,
        y,
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "clamp(26px, 6vh, 60px)",
        display: "flex",
        justifyContent: "center",
        gap: "clamp(26px, 5vw, 80px)",
        flexWrap: "wrap",
        padding: "0 clamp(16px, 4vw, 48px)",
        pointerEvents: "none",
      }}
    >
      {STATS.map((s) => (
        <Stat key={s.label} {...s} go={go} />
      ))}
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

      {/* stats — folded into the held reveal (homepage/embedded only) */}
      {embedded && <StatsReveal progress={progress} />}

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
