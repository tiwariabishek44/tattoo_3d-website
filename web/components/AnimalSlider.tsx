"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SANS = "var(--font-inter), system-ui, sans-serif";
const ACCENT_COLOR = "#E8593A"; // LunDev orange-red

// Pace knobs — same engine pattern as ServiceSlider
const BAR = 2.6;
const MORPH = BAR * 0.7;
const TEXT_DELAY = BAR * 0.55;
const TEXT_DUR = BAR - TEXT_DELAY;
const LINE_DUR = 0.5;
const TEXT_LINES = 5;
const STAGGER = Math.max(0.06, (TEXT_DUR - LINE_DUR) / (TEXT_LINES - 1));
const EASE = [0.4, 0, 0.2, 1] as const;

const txtContainer = {
  hidden: {},
  show: { transition: { delayChildren: TEXT_DELAY, staggerChildren: STAGGER } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};
const txtLine = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: LINE_DUR, ease: "easeOut" } },
};

type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  accent: string;
  desc: string;
  label: string;
  sub: string;
};

const SLIDES: Slide[] = [
  {
    img: "/animal_images/except_the_jungle_scanerio_remove_202606062035.jpeg",
    eyebrow: "W I L D L I F E",
    title: "JUNGLE",
    accent: "PREDATOR",
    desc: "Deep inside the canopy where light barely touches the floor, apex hunters move with a patience that turns the forest into a theatre of pure instinct.",
    label: "JAGUAR",
    sub: "Amazon Basin",
  },
  {
    img: "/animal_images/except_the_jungle_scanerio_remove_202606062037.jpeg",
    eyebrow: "N A T U R E",
    title: "SILENT",
    accent: "HUNTER",
    desc: "Camouflage perfected over millennia — a coat designed not to hide, but to become the dappled shadow of the undergrowth itself.",
    label: "PANTHER",
    sub: "Congo Rainforest",
  },
  {
    img: "/animal_images/except_the_jungle_scanerio_remove_202606062041.jpeg",
    eyebrow: "W I L D L I F E",
    title: "RAW",
    accent: "INSTINCT",
    desc: "Every movement calculated, every breath measured. In the depths of the jungle the line between stillness and strike is a single heartbeat.",
    label: "LEOPARD",
    sub: "Borneo Highlands",
  },
];

const N = SLIDES.length;
const THUMBS = 2; // 3 slides total — show 2 at a time

function useCompact() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const f = () => setC(window.innerWidth <= 820);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

export default function AnimalSlider() {
  const [active, setActive] = useState(0);
  const [prevImg, setPrevImg] = useState(SLIDES[0].img);
  const [morphing, setMorphing] = useState(false);
  const [started, setStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compact = useCompact();

  const change = (idx: number) => {
    if (idx === active) return;
    setPrevImg(SLIDES[active].img);
    setActive(idx);
    setMorphing(true);
    setStarted(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMorphing(false), MORPH * 1000 + 40);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const go = (dir: number) => change((active + dir + N) % N);
  const s = SLIDES[active];

  const thumbCount = compact ? 1 : THUMBS;
  const window_ = Array.from({ length: thumbCount }, (_, k) => (active + 1 + k) % N);

  return (
    <section
      aria-label="Animal slider"
      data-transparent-header
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
        background: "#050505",
      }}
    >
      {/* progress bar */}
      {started && (
        <motion.div
          key={`bar-${active}`}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: BAR, ease: "linear" }}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 3,
            background: ACCENT_COLOR,
            transformOrigin: "left",
            zIndex: 8,
          }}
        />
      )}

      {/* settled background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `url(${morphing ? prevImg : s.img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* growing overlay during morph */}
      {morphing && (
        <motion.div
          key={active}
          layoutId={`aslide-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: MORPH, ease: EASE, opacity: { duration: MORPH * 0.55, ease: "easeOut" } }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            borderRadius: 0,
            overflow: "hidden",
            backgroundImage: `url(${s.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* dark scrim — left side only */}
      <motion.div
        initial={false}
        animate={{ opacity: morphing ? 0 : 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0) 65%), linear-gradient(to top, rgba(0,0,0,0.22), rgba(0,0,0,0) 35%)",
        }}
      />

      {/* text + controls */}
      <div
        style={{
          position: "relative",
          zIndex: 6,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: `0 clamp(32px, 5vw, 90px)`,
        }}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={active}
            variants={txtContainer}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ maxWidth: compact ? "100%" : "min(680px, 55%)" }}
          >
            {/* eyebrow — tracked white caps, exactly like reference */}
            <motion.div
              variants={txtLine}
              style={{
                fontFamily: SANS,
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
                marginBottom: "1.1rem",
              }}
            >
              {s.eyebrow}
            </motion.div>

            {/* main title — bold white, massive */}
            <motion.div
              variants={txtLine}
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: "clamp(3.4rem, 8vw, 7.5rem)",
                lineHeight: 0.95,
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              {s.title}
            </motion.div>

            {/* accent line — same size, orange-red */}
            <motion.div
              variants={txtLine}
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: "clamp(3.4rem, 8vw, 7.5rem)",
                lineHeight: 0.95,
                color: ACCENT_COLOR,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                marginBottom: "clamp(1.4rem, 2.5vh, 2.2rem)",
              }}
            >
              {s.accent}
            </motion.div>

            {/* body paragraph */}
            <motion.p
              variants={txtLine}
              style={{
                fontFamily: SANS,
                fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.68)",
                margin: "0 0 2rem",
                maxWidth: "54ch",
              }}
            >
              {s.desc}
            </motion.p>

            {/* buttons — rectangular, exactly like reference */}
            <motion.div variants={txtLine} style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button style={btnSolid}>SEE MORE</button>
              <button style={btnOutline}>SUBSCRIBE</button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* nav arrows — bottom of text column, same left-side rail */}
        <div style={{ display: "flex", gap: 12, marginTop: "clamp(2rem, 5vh, 3.5rem)" }}>
          <button aria-label="Previous" onClick={() => go(-1)} style={arrowBtn}>‹</button>
          <button aria-label="Next" onClick={() => go(1)} style={arrowBtn}>›</button>
        </div>
      </div>

      {/* thumbnail strip — bottom-right */}
      <div
        style={{
          position: "absolute",
          zIndex: 7,
          right: compact ? 16 : "clamp(32px, 4vw, 64px)",
          bottom: compact ? 20 : "clamp(28px, 5vh, 56px)",
          display: "flex",
          gap: compact ? 10 : 16,
        }}
      >
        {window_.map((idx) => {
          const t = SLIDES[idx];
          return (
            <motion.button
              key={idx}
              layoutId={`aslide-${idx}`}
              transition={{ duration: MORPH, ease: EASE }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ y: -8 }}
              onClick={() => change(idx)}
              aria-label={`Show ${t.label}`}
              style={{
                position: "relative",
                width: compact ? 120 : "clamp(150px, 12vw, 190px)",
                height: compact ? 150 : "clamp(190px, 16vw, 230px)",
                borderRadius: 18,
                overflow: "hidden",
                border: "none",
                cursor: "pointer",
                padding: 0,
                backgroundImage: `url(${t.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 55%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                  textAlign: "left",
                  fontFamily: SANS,
                }}
              >
                <div style={{ color: "#fff", fontWeight: 700, fontSize: compact ? "0.72rem" : "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.2 }}>
                  {t.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: compact ? "0.68rem" : "0.76rem", marginTop: 3 }}>
                  {t.sub}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

const btnSolid: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "0.8rem",
  color: "#0a0a0a",
  background: "#ffffff",
  border: "none",
  padding: "15px 28px",
  borderRadius: 4,
  cursor: "pointer",
  textTransform: "uppercase",
};

const btnOutline: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "0.8rem",
  color: "#ffffff",
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.5)",
  padding: "15px 28px",
  borderRadius: 4,
  cursor: "pointer",
  textTransform: "uppercase",
};

const arrowBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: "1.4rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: SANS,
};
