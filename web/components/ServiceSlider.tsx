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
import { SERIF, SANS, COLORS, GUTTER, BOOKING_HREF } from "@/lib/theme";

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

// ── Escape-velocity gate constants ────────────────────────
const GATE_VEL_LOW  = 1.5;   // px/ms — below: passive hold is enough
const GATE_VEL_HIGH = 8.0;   // px/ms — above: deliberate fast scroll → governed glide (see below)
const HOLD_MS_DOWN  = 1500;  // ms — downward entry hold (arriving from Buddha)
const HOLD_MS_UP    = 1800;  // ms — upward entry hold (arriving from gallery)
const VEL_DECAY_MS  = 200;   // ms — treat velocity as 0 if no recent wheel event
const GOVERN_MAX_DELTA = 32; // px per wheel tick — extreme-velocity clamp: keeps the
                             // page moving (never frozen) but slow enough that the
                             // section is actually rendered/seen, not blown past in a blink
// ─────────────────────────────────────────────────────────

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

const HEADING = "Our Service Offering"; // bold main heading (top)
const TITLE = "The art of"; // per-service heading lead-in; the service is the accent line

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

  // ── Gate refs ─────────────────────────────────────────
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const velRef         = useRef(0);
  const lastWheelTsRef = useRef(0);
  const directionRef   = useRef<"down" | "up">("down");

  const downActiveRef   = useRef(false);
  const downTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downListenerRef = useRef<((e: WheelEvent) => void) | null>(null);

  const upActiveRef     = useRef(false);
  const upTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upListenerRef   = useRef<((e: WheelEvent) => void) | null>(null);
  // ─────────────────────────────────────────────────────

  useEffect(() => {
    const releaseDown = () => {
      if (!downActiveRef.current) return;
      downActiveRef.current = false;
      if (downTimerRef.current) { clearTimeout(downTimerRef.current); downTimerRef.current = null; }
      if (downListenerRef.current) {
        document.removeEventListener("wheel", downListenerRef.current);
        downListenerRef.current = null;
      }
    };

    const releaseUp = () => {
      if (!upActiveRef.current) return;
      upActiveRef.current = false;
      if (upTimerRef.current) { clearTimeout(upTimerRef.current); upTimerRef.current = null; }
      if (upListenerRef.current) {
        document.removeEventListener("wheel", upListenerRef.current);
        upListenerRef.current = null;
      }
    };

    const fireDownGate = () => {
      if (downActiveRef.current) return;
      downActiveRef.current = true;
      let lastTs = performance.now();

      const listener = (e: WheelEvent) => {
        if (e.deltaY <= 0) { releaseDown(); return; }
        const now = performance.now();
        const dt = now - lastTs; lastTs = now;
        const vel = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
        e.preventDefault();
        if (vel >= GATE_VEL_HIGH) {
          // governed glide — a hard fling shouldn't blow the section past in
          // a blink. Keep the page moving (don't freeze it), just clamp the
          // per-tick distance so every frame of the section is actually seen.
          window.scrollBy({ top: Math.min(e.deltaY, GOVERN_MAX_DELTA), left: 0 });
        }
        // else: pure hold — within the lock zone, freeze in place
      };

      downListenerRef.current = listener;
      document.addEventListener("wheel", listener, { passive: false });
      downTimerRef.current = setTimeout(releaseDown, HOLD_MS_DOWN);
    };

    const fireUpGate = () => {
      if (upActiveRef.current) return;
      upActiveRef.current = true;
      let lastTs = performance.now();

      const listener = (e: WheelEvent) => {
        if (e.deltaY > 0) { releaseUp(); return; }
        const now = performance.now();
        const dt = now - lastTs; lastTs = now;
        const vel = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
        e.preventDefault();
        if (vel >= GATE_VEL_HIGH) {
          window.scrollBy({ top: Math.max(e.deltaY, -GOVERN_MAX_DELTA), left: 0 });
        }
      };

      upListenerRef.current = listener;
      document.addEventListener("wheel", listener, { passive: false });
      upTimerRef.current = setTimeout(releaseUp, HOLD_MS_UP);
    };

    // Explicit boundary-crossing detection — fires on all FOUR transitions
    // (enter-from-Buddha, exit-into-Gallery, enter-from-Gallery, exit-into-Buddha),
    // driven directly by wheel events so fast scrolls can't skip a crossing
    // (IntersectionObserver threshold callbacks can be batched/skipped at speed).
    let prevTop: number | null = null;
    let prevBottom: number | null = null;

    const maybeGate = (dirNeeded: "down" | "up", fire: () => void) => {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const isMobile = window.innerWidth < 820;
      if (reduced || isMobile) return;
      if (directionRef.current !== dirNeeded) return;
      if (velRef.current < GATE_VEL_LOW) return; // gentle scroll — no gate needed
      // NOTE: extreme velocity (>= GATE_VEL_HIGH) ALSO fires the gate now —
      // the listener switches to governed-glide mode for it, instead of
      // letting a hard fling blow the section past in a blink.
      fire();
    };

    const trackVel = (e: WheelEvent) => {
      const now = performance.now();
      const dt  = now - lastWheelTsRef.current;
      velRef.current = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
      lastWheelTsRef.current = now;
      directionRef.current = e.deltaY > 0 ? "down" : "up";

      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      if (prevTop !== null && prevBottom !== null) {
        if (prevTop >= vh && rect.top < vh)   maybeGate("down", fireDownGate); // entering from above (from Buddha)
        if (prevTop < vh && rect.top >= vh)   maybeGate("up", fireUpGate);     // exiting upward (into Buddha)
        if (prevBottom >= 0 && rect.bottom < 0) maybeGate("down", fireDownGate); // exiting downward (into Gallery)
        if (prevBottom < 0 && rect.bottom >= 0) maybeGate("up", fireUpGate);   // entering from below (from Gallery)
      }
      prevTop = rect.top;
      prevBottom = rect.bottom;
    };
    window.addEventListener("wheel", trackVel, { passive: true });

    const onVisibilityChange = () => {
      if (document.hidden) { releaseDown(); releaseUp(); }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("wheel", trackVel);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      releaseDown();
      releaseUp();
    };
  }, []);

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

  const thumbCount = compact ? 2 : THUMBS;
  const window_ = Array.from({ length: thumbCount }, (_, k) => (active + 1 + k) % N);

  return (
    // 250vh wrapper — passive scroll hold budget + escape-velocity gate anchor
    <div id="styles" data-cursor="scrub" ref={wrapperRef} style={{ height: "250vh", position: "relative" }}>
      <section
        aria-label="Design slider"
        data-transparent-header
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          minHeight: 600,
          overflow: "hidden",
          background: "#0b0b0c",
        }}
      >
        {/* top feather — dissolves the Buddha sequence bottom into this section */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "11%",
            background: "linear-gradient(to bottom, rgba(16,14,11,1) 0%, rgba(16,14,11,0) 100%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* B4 — resting track: a quiet gold rail, always present, so a first-time
            visitor sees the pacing affordance before they've clicked anything.
            The depleting fill (below) rides on top once a transition starts. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "rgba(203,164,90,0.18)",
            zIndex: 7,
            pointerEvents: "none",
          }}
        />

        {/* top progress bar — depletes over the morph; empty = image has settled.
            Not auto-advance — purely a transition-progress indicator. */}
        {started && (
          <motion.div
            key={`bar-${active}`}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: BAR, ease: "linear" }}
            style={{
              position: "absolute",
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
            padding: `0 ${GUTTER}`,
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
                style={{ maxWidth: compact ? "100%" : "min(760px, 64%)" }}
              >
                {/* main heading — hero typography DNA (matches machine scroll sequence) */}
                <motion.div
                  variants={txtLine}
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(3.2rem, 7vw, 8rem)",
                    lineHeight: 1.02,
                    color: COLORS.gold,
                    marginBottom: "1.4rem",
                    textShadow: "0 2px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  {HEADING}
                </motion.div>
                <motion.h1
                  variants={txtLine}
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(1.4rem, 2.6vw, 2.3rem)",
                    lineHeight: 1.1,
                    color: COLORS.offWhite,
                    margin: 0,
                    textShadow: "0 1px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  {TITLE}
                </motion.h1>
                <motion.div
                  variants={txtLine}
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: "clamp(1.4rem, 2.6vw, 2.3rem)",
                    lineHeight: 1.1,
                    color: ACCENT,
                    margin: 0,
                    textShadow: "0 1px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  {s.accent}
                </motion.div>
                <motion.p
                  variants={txtLine}
                  style={{
                    fontFamily: SANS,
                    fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
                    lineHeight: 1.7,
                    color: COLORS.muted,
                    margin: "1.5rem 0 2.2rem",
                    maxWidth: "52ch",
                  }}
                >
                  {s.desc}
                </motion.p>
                <motion.div variants={txtLine} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {/* B4 — real intent, wired. Primary books this style; secondary
                      sends you to the work. (Was placeholder SEE MORE / SUBSCRIBE.) */}
                  <motion.a
                    href={BOOKING_HREF}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    style={btnSolid}
                  >
                    BOOK THIS STYLE
                  </motion.a>
                  <motion.a
                    href="/#gallery"
                    whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.9)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    style={btnOutline}
                  >
                    VIEW GALLERY
                  </motion.a>
                </motion.div>
              </motion.div>
            </AnimatePresence>

          {/* arrows — SVG chevrons with a hover micro-animation (ring brightens,
              chevron nudges in its travel direction). */}
          <div style={{ display: "flex", gap: 14, marginTop: "clamp(2rem, 5vh, 3.5rem)" }}>
            <ArrowBtn dir={-1} onClick={() => go(-1)} />
            <ArrowBtn dir={1} onClick={() => go(1)} />
          </div>
        </div>

        {/* thumbnail strip — bottom-right, clipped so last thumb is half-visible.
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
    </div>
  );
}

const btnSolid: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
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
  display: "inline-block",
  textDecoration: "none",
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
  borderWidth: 1,
  borderStyle: "solid",
  color: "#fff",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

// SVG chevron button with a hover micro-animation (ring brightens, chevron
// nudges in its direction). Replaces the old typographic ‹ › glyphs.
function ArrowBtn({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <motion.button
      aria-label={dir === -1 ? "Previous" : "Next"}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.94 }}
      variants={{
        rest: {
          borderColor: "rgba(255,255,255,0.45)",
          backgroundColor: "rgba(255,255,255,0.04)",
        },
        hover: {
          borderColor: "rgba(255,255,255,0.9)",
          backgroundColor: "rgba(255,255,255,0.12)",
        },
      }}
      transition={{ duration: 0.22, ease: EASE }}
      style={arrow}
    >
      <motion.span
        variants={{ hover: { x: dir * 3 } }}
        transition={{ duration: 0.22, ease: EASE }}
        style={{ display: "inline-flex" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {dir === -1 ? (
            <polyline points="15 18 9 12 15 6" />
          ) : (
            <polyline points="9 18 15 12 9 6" />
          )}
        </svg>
      </motion.span>
    </motion.button>
  );
}
