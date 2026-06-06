"use client";

// "The Service Reveal" — the Styles-we-master section, re-forged in the site's
// native language: a pinned, scroll-driven cinematic sequence. No buttons, no
// auto-timer, no card-fan. Scroll is the narrator. SSOT: web/STYLES_WE_MASTER_PLAN.md
// Future elevation (scroll-scrubbed micro-sequences): web/SERVICE_MICRO_SEQUENCE_PLAN.md
//
// Composition = "cinematic" full-bleed (chosen over split/plate). Craft:
//  • Scroll is SMOOTHED with an inertial spring → buttery, never steppy.
//  • Real parallax = three layers (image / index / text) drift at DIFFERENT rates.
//  • Each beat is enter → long STILL HOLD (study the work) → exit, all eased.
//  • Type is monumental. The art is never darkened to caption it (light bottom grad only).
//  NOTE: full-bleed needs purpose-built 16:9 stills (composed, hi-res, cohesive) —
//  the current photos are placeholders; see the parent SSOT's asset brief.
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  cubicBezier,
  MotionValue,
} from "framer-motion";
import { SERIF, SANS, COLORS, eyebrow, frame, GUTTER } from "@/lib/theme";

const C = "/crousls_images";

// Order: Realism leads (the showstopper that hooks), Blackwork closes (the
// bold final word). Copy = evoke, don't spec. Images = placeholders for now
// (swap purpose-built 16:9 hero stills later — see asset brief).
const SERVICES = [
  { name: "Realism", line: "Skin that remembers a photograph.", img: `${C}/realism_tattoo1.jpg` },
  { name: "Fine Line", line: "A whisper that lasts a lifetime.", img: frame(18) },
  { name: "Traditional", line: "Old soul, bold lines, no apology.", img: `${C}/traditional_tattoo1.jpg` },
  { name: "Custom", line: "Your story, drawn for the first time.", img: frame(150) },
  { name: "Cover-Up", line: "The past, redrawn in your favour.", img: `${C}/covere-up-tattoo-13.jpg` },
  { name: "Piercing", line: "Steel, placed with intention.", img: `${C}/Tattoo-Piercing-Ideas-13-1.jpg` },
  { name: "Laser Removal", line: "A clean page, patiently restored.", img: `${C}/laser_removal.jpg` },
  { name: "Blackwork", line: "Pure black, total conviction.", img: `${C}/black_work_tattoo1.jpg` },
];
const N = SERVICES.length;

// ── Tuning knobs (feel, not math — judge by SLOW scrub) ───────────────────
const BEAT_VH = 150;                         // scroll distance per beat (slower = bigger)
const SPRING = { stiffness: 48, damping: 24, restDelta: 0.0004 }; // inertial smoothing
const PAR_IMG = 16;   // px — background layer drifts least (far)
const PAR_NUM = 34;   // px — index watermark, mid
const PAR_TXT = 60;   // px — text drifts most (near) → depth
const EASE = cubicBezier(0.4, 0, 0.2, 1);

function useCompact() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const f = () => setC(window.innerWidth <= 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

// All beat motion, derived from the SMOOTHED progress. Fractions are within the
// beat's own band → long centre hold, eased fades, multi-rate parallax.
function useBeatMotion(p: MotionValue<number>, i: number, reduce: boolean) {
  const w = 1 / N;
  const a = i * w;
  const at = (f: number) => a + f * w; // point within this beat's band
  const first = i === 0;
  const last = i === N - 1;

  const imgOpacity = useTransform(
    p,
    first ? [at(0), at(0.82), at(1)] : last ? [at(0), at(0.18), at(1)] : [at(0), at(0.18), at(0.82), at(1)],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0],
    { ease: EASE }
  );
  const textOpacity = useTransform(
    p,
    [at(0.26), at(0.44), at(0.70), at(0.86)],
    [0, 1, 1, 0],
    { ease: EASE }
  );
  const imgY = useTransform(p, [at(-0.3), at(1.3)], reduce ? [0, 0] : [PAR_IMG, -PAR_IMG]);
  const numY = useTransform(p, [at(-0.3), at(1.3)], reduce ? [0, 0] : [PAR_NUM, -PAR_NUM]);
  const txtY = useTransform(p, [at(-0.3), at(1.3)], reduce ? [0, 0] : [PAR_TXT, -PAR_TXT]);
  const scale = useTransform(p, [at(0), at(1)], reduce ? [1, 1] : [1.07, 1.0]);

  return { imgOpacity, textOpacity, imgY, numY, txtY, scale };
}

function Copy({
  i,
  s,
  compact,
  numY,
}: {
  i: number;
  s: (typeof SERVICES)[number];
  compact: boolean;
  numY: MotionValue<number>;
}) {
  return (
    <div style={{ position: "relative" }}>
      <motion.div
        aria-hidden
        style={{
          y: numY,
          position: "absolute",
          top: compact ? "-3.4rem" : "-6.5rem",
          left: "-0.5rem",
          fontFamily: SERIF,
          fontWeight: 500,
          fontSize: compact ? "7rem" : "clamp(11rem, 20vw, 24rem)",
          lineHeight: 1,
          color: "rgba(203,164,90,0.11)",
          letterSpacing: "-0.03em",
          userSelect: "none",
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </motion.div>
      <div
        style={{
          ...eyebrow(),
          fontSize: "0.85rem",
          letterSpacing: "0.3em",
          opacity: 0.72,
          marginBottom: "1.4rem",
          position: "relative",
        }}
      >
        Service {String(i + 1).padStart(2, "0")}
      </div>
      <h3
        style={{
          fontFamily: SERIF,
          fontWeight: 500,
          fontSize: compact ? "clamp(3.2rem, 13vw, 5rem)" : "clamp(4rem, 8.5vw, 9.5rem)",
          lineHeight: 0.98,
          letterSpacing: "-0.01em",
          color: COLORS.offWhite,
          margin: 0,
          position: "relative",
        }}
      >
        {s.name}
      </h3>
      <p
        style={{
          fontFamily: SERIF,
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: compact ? "clamp(1.3rem, 5vw, 1.7rem)" : "clamp(1.5rem, 2.6vw, 2.6rem)",
          lineHeight: 1.35,
          color: COLORS.muted,
          margin: "1.6rem 0 0",
          maxWidth: 620,
          position: "relative",
        }}
      >
        {s.line}
      </p>
    </div>
  );
}

function Beat({
  s,
  i,
  progress,
  reduce,
  compact,
}: {
  s: (typeof SERVICES)[number];
  i: number;
  progress: MotionValue<number>;
  reduce: boolean;
  compact: boolean;
}) {
  const m = useBeatMotion(progress, i, reduce);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <motion.div
        style={{
          position: "absolute",
          inset: "-6% 0",
          opacity: m.imgOpacity,
          y: m.imgY,
          scale: m.scale,
          backgroundImage: `linear-gradient(to top, rgba(7,6,5,0.86) 0%, rgba(7,6,5,0.36) 24%, rgba(7,6,5,0) 48%), url(${s.img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          left: GUTTER,
          right: GUTTER,
          bottom: "clamp(9vh, 13vh, 17vh)",
          opacity: m.textOpacity,
          y: m.txtY,
        }}
      >
        <div style={{ maxWidth: compact ? "100%" : "62%" }}>
          <Copy i={i} s={s} compact={compact} numY={m.numY} />
        </div>
      </motion.div>
    </div>
  );
}

export default function ServiceReveal() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const compact = useCompact();
  const reduceRef = useRef(false);
  useEffect(() => {
    reduceRef.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  // The buttery layer — inertial smoothing drives ALL visuals.
  const smooth = useSpring(scrollYProgress, SPRING);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N))));
  });

  const scrollToBeat = (idx: number) => {
    const el = outerRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + total * ((idx + 0.5) / N), behavior: "smooth" });
  };

  return (
    <section
      ref={outerRef}
      aria-label="Styles we master"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          scrollToBeat(Math.min(N - 1, active + 1));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          scrollToBeat(Math.max(0, active - 1));
        }
      }}
      style={{
        position: "relative",
        height: `${N * BEAT_VH}vh`,
        background: COLORS.ink,
        outline: "none",
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {SERVICES.map((s, i) => (
          <Beat
            key={s.name}
            s={s}
            i={i}
            progress={smooth}
            reduce={reduceRef.current}
            compact={compact}
          />
        ))}

        {/* persistent section label (top-left, for orientation) */}
        <div
          style={{
            position: "absolute",
            top: "clamp(28px, 6vh, 64px)",
            left: GUTTER,
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          <div style={{ ...eyebrow(), marginBottom: "0.7rem" }}>What we do</div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
              color: COLORS.offWhite,
              opacity: 0.85,
            }}
          >
            Styles we master.
          </div>
        </div>

        {/* progress rail (desktop) / counter (compact) */}
        {compact ? (
          <div
            style={{
              position: "absolute",
              bottom: "clamp(24px, 5vh, 48px)",
              right: GUTTER,
              zIndex: 5,
              fontFamily: SANS,
              letterSpacing: "0.2em",
              fontSize: "0.8rem",
              color: COLORS.gold,
            }}
          >
            {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              right: GUTTER,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              alignItems: "flex-end",
            }}
          >
            {SERVICES.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.name}
                  onClick={() => scrollToBeat(i)}
                  aria-label={`Go to ${s.name}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: SANS,
                    letterSpacing: "0.18em",
                    fontSize: "0.74rem",
                    color: on ? COLORS.gold : "rgba(242,239,233,0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: 0,
                    transition: "color 0.4s ease",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                  <span
                    style={{
                      display: "inline-block",
                      height: 1,
                      width: on ? 34 : 16,
                      background: on ? COLORS.gold : "rgba(242,239,233,0.4)",
                      transition: "all 0.4s ease",
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
