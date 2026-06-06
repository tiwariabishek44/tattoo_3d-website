"use client";

// Featured-image slider — replica of the LunDev "DESIGN SLIDER / ANIMAL"
// reference, the services slider. CALM, click-driven info block (no scroll-scrub
// — the page already has two sequences). Reference colours for now (orange
// accent); re-skin to the gold theme + tattoo content later.
// SSOT: web/STYLES_WE_MASTER_PLAN.md
//
// TRANSITION: the clicked thumbnail GROWS into the hero (shared-element morph via
// framer `layoutId`) — radius melts 18→0, image expands from where you clicked,
// and the remaining thumbnails slide to their new spots. No flat crossfade.
//
// Assets: 3 jungle/animal stills in ROTATION across 6 slides. No auto-advance.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "@/lib/theme";

const IMG = "/crousal_images2";

const ACCENT = COLORS.gold; // system gold theme accent (was reference orange)
// One pace knob: BAR = the full progress-bar timeline. The image finishes fitting
// the screen at 70% (bar's last 30% begins); the slogan fades in over that last 30%.
const BAR = 2.6; // seconds — total transition timeline (raise = calmer)
const MORPH = BAR * 0.7; // image grow completes as the bar hits its last 30%
const TEXT_DELAY = BAR * 0.55; // slogan begins when ~45% of the bar remains
const TEXT_DUR = BAR - TEXT_DELAY; // line-by-line fade fills the rest (to bar = 0)
const LINE_DUR = 0.5; // each line's own fade
const TEXT_LINES = 5; // eyebrow, title, accent, paragraph, buttons
const STAGGER = Math.max(0.06, (TEXT_DUR - LINE_DUR) / (TEXT_LINES - 1));
const EASE = [0.4, 0, 0.2, 1] as const;

// Slogan fades in LINE BY LINE across the bar's last ~45%; old slogan fades out
// first (no blink).
const txtContainer = {
  hidden: {},
  show: { transition: { delayChildren: TEXT_DELAY, staggerChildren: STAGGER } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};
const txtLine = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: LINE_DUR, ease: "easeOut" } },
};

type Slide = { img: string; accent: string; desc: string; place: string; sub: string };

const EYEBROW = "Styles we master"; // section eyebrow
const TITLE = "The art of"; // constant white headline; the service is the accent line

// Service slides — natural copy. Heading reads "The art of" + the service (gold
// accent), with a real one-line description as the subheading.
const SLIDES: Slide[] = [
  { img: `${IMG}/realism_tattoo1.jpeg`, accent: "Realism", desc: "Skin that remembers a photograph — depth, light and detail, rendered entirely by hand.", place: "Realism", sub: "Photographic detail" },
  { img: `${IMG}/traditional_tattoo1.jpeg`, accent: "Traditional", desc: "Bold lines and timeless motifs, drawn to age with grace and stay sharp for life.", place: "Traditional", sub: "Bold & timeless" },
  { img: `${IMG}/black_work_tattoo1.jpeg`, accent: "Blackwork", desc: "Pure black, high contrast, total conviction — graphic work that commands the skin.", place: "Blackwork", sub: "Pure black" },
  { img: `${IMG}/covere-up-tattoo-13.png`, accent: "Cover-Up", desc: "The past, redrawn — a fresh piece that reclaims the canvas and the story behind it.", place: "Cover-Up", sub: "Reclaim the canvas" },
  { img: `${IMG}/pircing.jpeg`, accent: "Piercing", desc: "Studio-grade piercing with quality jewellery, placed with care and a steady hand.", place: "Piercing", sub: "Studio-grade" },
];
const N = SLIDES.length;
const THUMBS = 4;

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

export default function ServiceSlider() {
  const [active, setActive] = useState(0);
  const [prevImg, setPrevImg] = useState(SLIDES[0].img);
  const [morphing, setMorphing] = useState(false);
  const [started, setStarted] = useState(false); // gate the top progress bar
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compact = useCompact();

  const change = (idx: number) => {
    if (idx === active) return;
    setPrevImg(SLIDES[active].img); // keep old image visible beneath the grow
    setActive(idx);
    setMorphing(true); // raise the growing hero above the text during the move
    setStarted(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMorphing(false), MORPH * 1000 + 40);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const go = (dir: number) => change((active + dir + N) % N);
  const s = SLIDES[active];

  // Thumbnail window = the next slides after the active one (rotation).
  const thumbCount = compact ? 2 : THUMBS;
  const window_ = Array.from({ length: thumbCount }, (_, k) => (active + 1 + k) % N);

  return (
    <section
      aria-label="Design slider"
      data-transparent-header
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
        background: "#0b0b0c",
      }}
    >
      {/* top progress bar — depletes over the morph; empty = image has settled.
          Not auto-advance — purely a transition-progress indicator. */}
      {started && (
        <motion.div
          key={`bar-${active}`}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: BAR, ease: "linear" }}
          style={{
            position: "absolute", // pins to the slider's own top (works mid-page too)
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: ACCENT,
            transformOrigin: "left",
            zIndex: 8,
          }}
        />
      )}

      {/* settled background — ALWAYS STILL, no layoutId (so it can never shrink
          back to a thumbnail). Shows the PREVIOUS image during a morph (the grow
          covers it), then the current image once settled. */}
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

      {/* transient grow overlay — exists ONLY during the morph. Grows from the
          clicked thumbnail (shared layoutId) + fades in over the still background.
          On unmount the active slide isn't in the strip, so nothing shrinks. */}
      {morphing && (
        <motion.div
          key={active}
          layoutId={`slide-${active}`}
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

      {/* legibility scrim — dark left → clear right (text lives on the left).
          Fades IN slowly as the frame settles (it used to snap on = "splash"):
          hidden during the bright grow, eases back in once the image lands. */}
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
            "linear-gradient(to right, rgba(6,7,8,0.86) 0%, rgba(6,7,8,0.55) 38%, rgba(6,7,8,0.05) 72%), linear-gradient(to top, rgba(6,7,8,0.55), rgba(6,7,8,0) 40%)",
        }}
      />

      {/* content */}
      <div
        style={{
          position: "relative",
          zIndex: 6,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: compact ? "0 28px" : "0 clamp(48px, 7vw, 120px)",
        }}
      >
          {/* slogan/text — fades in LINE BY LINE through the bar's last ~45%
              (after the image is fitting the screen). Old slogan fades out
              first → no blink. */}
          <AnimatePresence mode="sync">
            <motion.div
              key={active}
              variants={txtContainer}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ maxWidth: compact ? "100%" : "52%" }}
            >
              <motion.div
                variants={txtLine}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: "1rem",
                  paddingLeft: 4,
                }}
              >
                {EYEBROW}
              </motion.div>
              <motion.h1
                variants={txtLine}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.6rem, 6.2vw, 5.6rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.01em",
                  color: "#fff",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {TITLE}
              </motion.h1>
              <motion.div
                variants={txtLine}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.6rem, 6.2vw, 5.6rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.01em",
                  color: ACCENT,
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {s.accent}
              </motion.div>
              <motion.p
                variants={txtLine}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "clamp(0.92rem, 1.1vw, 1.05rem)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.72)",
                  margin: "1.6rem 0 2.2rem",
                  maxWidth: 560,
                }}
              >
                {s.desc}
              </motion.p>
              <motion.div variants={txtLine} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button style={btnSolid}>SEE MORE</button>
                <button style={btnOutline}>SUBSCRIBE</button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

        {/* arrows */}
        <div style={{ display: "flex", gap: 14, marginTop: "clamp(2rem, 5vh, 3.5rem)" }}>
          <button aria-label="Previous" onClick={() => go(-1)} style={arrow}>
            ‹
          </button>
          <button aria-label="Next" onClick={() => go(1)} style={arrow}>
            ›
          </button>
        </div>
      </div>

      {/* thumbnail strip — bottom-right; each shares a layoutId so it can grow.
          zIndex 7 keeps the strip ABOVE the growing hero (which fades in behind it). */}
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
              layoutId={`slide-${idx}`}
              transition={{ duration: MORPH, ease: EASE }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ y: -8 }}
              onClick={() => change(idx)}
              aria-label={`Show ${t.place}`}
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
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                  textAlign: "left",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: compact ? "0.72rem" : "0.82rem",
                    letterSpacing: "0.04em",
                    lineHeight: 1.2,
                  }}
                >
                  {t.place}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: compact ? "0.68rem" : "0.78rem",
                    marginTop: 2,
                  }}
                >
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
  fontFamily: "var(--font-inter), sans-serif",
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "0.82rem",
  color: "#111",
  background: "#fff",
  border: "none",
  padding: "16px 30px",
  borderRadius: 4,
  cursor: "pointer",
};

const btnOutline: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "0.82rem",
  color: "#fff",
  background: "transparent",
  border: "1.5px solid rgba(255,255,255,0.55)",
  padding: "16px 30px",
  borderRadius: 4,
  cursor: "pointer",
};

const arrow: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.45)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: "1.5rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-inter), sans-serif",
};
