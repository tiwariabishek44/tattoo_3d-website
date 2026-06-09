"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SERIF, SANS } from "@/lib/theme";

// Pinterest-pattern gallery: clean full-bleed dense masonry, hover-darken overlay
// (no red Save button), click → lightbox. Theme-aware (light = neutral white,
// dark = on-brand black) so both can be compared with the SAME layout.

// ── Entry gate (Services → Gallery transition) ────────────
// Slows the landing into the gallery when arriving with scroll momentum
// from the Services section above — same escape-velocity mechanism used
// at the other section joints, one direction only (downward entry).
const GATE_VEL_LOW  = 1.5;   // px/ms — below: gentle scroll, no gate needed
const GATE_VEL_HIGH = 8.0;   // px/ms — above: deliberate fast scroll → governed glide (see below)
const HOLD_MS       = 1300;  // ms — entry hold (shorter: gallery is long, just ease the landing)
const VEL_DECAY_MS  = 200;   // ms — treat velocity as 0 if no recent wheel event
const IO_THRESHOLD  = 0.05;  // fire as soon as the gallery top edge appears
const GOVERN_MAX_DELTA = 32; // px per wheel tick — extreme-velocity clamp: keeps the
                             // page moving (never frozen) but slow enough that the
                             // section is actually rendered/seen, not blown past in a blink
// ─────────────────────────────────────────────────────────

const G = "/crousls_images";
const POOL = [
  `${G}/realism_tattoo1.jpg`,
  `${G}/black_work_tattoo1.jpg`,
  `${G}/traditional_tattoo1.jpg`,
  `${G}/covere-up-tattoo-13.jpg`,
  `${G}/Tattoo-Piercing-Ideas-13-1.jpg`,
  `${G}/laser_removal.jpg`,
];
// Each category gets a MIX of the available images, with deliberately DIFFERENT
// counts — to stress-test the no-shrink min-height fix. (Swap for real images later.)
const CATS = [
  { cat: "Realism", count: 9 },
  { cat: "Blackwork", count: 6 },
  { cat: "Traditional", count: 7 },
  { cat: "Cover-Up", count: 4 },
  { cat: "Piercing", count: 5 },
  { cat: "Laser Removal", count: 3 },
];
const ITEMS = CATS.flatMap(({ cat, count }, ci) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${cat}-${i}`,
    cat,
    src: POOL[(ci * 2 + i) % POOL.length], // mix images across categories
  }))
);
const CATEGORIES = ["All", ...CATS.map((c) => c.cat)];

const THEMES = {
  light: {
    bg: "#fafafa",
    eyebrow: "#9a9a9a",
    heading: "#161616",
    sub: "#6b6b6b",
    chipOnBg: "#1a1a1a",
    chipOnText: "#fff",
    chipOffBg: "#ececec",
    chipOffText: "#333",
    tileBg: "#eee",
    // Pinterest-style gradient scrim: dark top (for ⤢), clear middle (image
    // breathes), gentle bottom (for the category label). Not a flat wash.
    overlay:
      "linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.34) 100%)",
  },
  dark: {
    bg: "#0b0a08",
    eyebrow: "#8a857c",
    heading: "#F2EFE9",
    sub: "rgba(242,239,233,0.6)",
    chipOnBg: "#F2EFE9",
    chipOnText: "#111",
    chipOffBg: "rgba(255,255,255,0.08)",
    chipOffText: "rgba(242,239,233,0.82)",
    tileBg: "#1a1714",
    overlay: "rgba(0,0,0,0.42)", // flat (unchanged for now)
  },
};

function useColumns() {
  const [c, setC] = useState(5);
  useEffect(() => {
    const f = () => {
      const w = window.innerWidth;
      setC(w <= 520 ? 2 : w <= 820 ? 3 : w <= 1200 ? 4 : 5);
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

export default function GalleryPinterest({
  theme = "light",
}: {
  theme?: "light" | "dark";
}) {
  const t = THEMES[theme];
  const [active, setActive] = useState("All");
  const [box, setBox] = useState<number | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const cols = useColumns();

  const filtered =
    active === "All" ? ITEMS : ITEMS.filter((i) => i.cat === active);

  // ── Entry gate refs ───────────────────────────────────
  const sectionRef     = useRef<HTMLElement>(null);
  const velRef         = useRef(0);
  const lastWheelTsRef = useRef(0);
  const gateActiveRef  = useRef(false);
  const gateTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gateListenerRef = useRef<((e: WheelEvent) => void) | null>(null);
  // ─────────────────────────────────────────────────────

  useEffect(() => {
    const releaseGate = () => {
      if (!gateActiveRef.current) return;
      gateActiveRef.current = false;
      if (gateTimerRef.current) { clearTimeout(gateTimerRef.current); gateTimerRef.current = null; }
      if (gateListenerRef.current) {
        document.removeEventListener("wheel", gateListenerRef.current);
        gateListenerRef.current = null;
      }
    };

    const fireGate = () => {
      if (gateActiveRef.current) return;
      gateActiveRef.current = true;
      let lastTs = performance.now();

      const listener = (e: WheelEvent) => {
        if (e.deltaY <= 0) { releaseGate(); return; } // upward scroll — release immediately
        const now = performance.now();
        const dt = now - lastTs; lastTs = now;
        const vel = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
        e.preventDefault();
        if (vel >= GATE_VEL_HIGH) {
          // governed glide — a hard fling shouldn't blow the landing past in
          // a blink. Keep the page moving (don't freeze it), just clamp the
          // per-tick distance so the entry is actually seen.
          window.scrollBy({ top: Math.min(e.deltaY, GOVERN_MAX_DELTA), left: 0 });
        }
        // else: pure hold — within the lock zone, freeze in place
      };

      gateListenerRef.current = listener;
      document.addEventListener("wheel", listener, { passive: false });
      gateTimerRef.current = setTimeout(releaseGate, HOLD_MS);
    };

    const trackVel = (e: WheelEvent) => {
      const now = performance.now();
      const dt  = now - lastWheelTsRef.current;
      velRef.current = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
      lastWheelTsRef.current = now;
    };
    window.addEventListener("wheel", trackVel, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const timeSinceWheel = performance.now() - lastWheelTsRef.current;
          const vel = timeSinceWheel < VEL_DECAY_MS ? velRef.current : 0;
          const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
          const isMobile = window.innerWidth < 820;
          if (reduced || isMobile) continue;
          if (vel < GATE_VEL_LOW) continue; // gentle scroll — no gate needed
          // NOTE: extreme velocity (>= GATE_VEL_HIGH) ALSO fires the gate now —
          // the listener above switches to governed-glide mode for it, instead
          // of letting a hard fling blow the landing past in a blink.
          fireGate();
        }
      },
      { threshold: IO_THRESHOLD }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    const onVisibilityChange = () => {
      if (document.hidden) releaseGate();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("wheel", trackVel);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      releaseGate();
    };
  }, []);

  useEffect(() => {
    if (box === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBox(null);
      else if (e.key === "ArrowRight") setBox((b) => (b! + 1) % filtered.length);
      else if (e.key === "ArrowLeft")
        setBox((b) => (b! - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [box, filtered.length]);

  // Lock page scroll while lightbox is open — Pinterest behaviour
  useEffect(() => {
    if (box === null) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [box]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{
        background: t.bg,
        padding: "clamp(48px, 7vh, 96px) clamp(12px, 1.5vw, 20px)",
        scrollMarginTop: "90px",
      }}
    >
      {/* heading — bigger + bold */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: "0.8rem",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: t.eyebrow,
          marginBottom: "1rem",
        }}
      >
        The Gallery
      </div>
      <h2
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: "clamp(3.2rem, 7vw, 7rem)",
          lineHeight: 1.02,
          letterSpacing: "-0.01em",
          color: t.heading,
          margin: 0,
        }}
      >
        Our Artwork.
      </h2>
      <p
        style={{
          fontFamily: SANS,
          fontSize: "clamp(1.2rem, 1.7vw, 1.55rem)",
          lineHeight: 1.6,
          color: t.sub,
          margin: "1.3rem 0 0",
          maxWidth: "54ch",
        }}
      >
        Real pieces, real skin — straight from the Abishek chair.
      </p>

      {/* filter row — neutral chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          margin: "clamp(24px, 4vh, 44px) 0 clamp(20px, 3vh, 32px)",
        }}
      >
        {CATEGORIES.map((cat) => {
          const on = cat === active;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                fontFamily: SANS,
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                fontWeight: on ? 600 : 500,
                padding: "0.72rem 1.35rem",
                borderRadius: 999,
                cursor: "pointer",
                whiteSpace: "nowrap",
                border: "1px solid transparent",
                background: on ? t.chipOnBg : t.chipOffBg,
                color: on ? t.chipOnText : t.chipOffText,
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* min-height floor → the wall never collapses when a category has few
          items, so nothing downstream jumps. Few items sit centred in the space. */}
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div key={active} style={{ columnCount: cols, columnGap: "24px" }}>
          {filtered.map((it, idx) => {
          const isHover = hover === it.id;
          return (
            <motion.div
              key={`${active}-${it.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.025, 0.35) }}
              onMouseEnter={() => setHover(it.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setBox(idx)}
              style={{
                breakInside: "avoid",
                marginBottom: 24,
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                background: t.tileBg,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.cat}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transform: isHover ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.5s ease",
                }}
              />
              {/* hover overlay — Pinterest-pin style (per reference): red Save,
                  light Visit-site pill, dark round expand. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: t.overlay,
                  opacity: isHover ? 1 : 0,
                  transition: "opacity 0.25s ease",
                  pointerEvents: "none",
                }}
              >
                {/* Save — Pinterest red */}
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "#E60023",
                    color: "#fff",
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    padding: "0.6rem 1.15rem",
                    borderRadius: 999,
                  }}
                >
                  Save
                </span>
                {/* Visit-site style pill — light */}
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    bottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.95)",
                    color: "#111",
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    padding: "0.5rem 0.9rem",
                    borderRadius: 999,
                  }}
                >
                  <span aria-hidden>↗</span> {it.cat}
                </span>
                {/* expand — dark round (the reference's bottom-right button) */}
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(18,18,18,0.62)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  ⤢
                </span>
              </div>
            </motion.div>
          );
          })}
        </div>
      </div>

      {/* lightbox — Pinterest exact:
          dark glassmorphism backdrop, top bar (✕ | Share Save),
          ‹ card › nav row, ··· on card top-right, sparkle lens bottom-right,
          large red Save pill below card. */}
      <AnimatePresence>
        {box !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBox(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: "72px clamp(12px, 4vw, 60px) clamp(24px, 4vh, 48px)",
              overflow: "hidden",
              background: "rgba(0,0,0,0.12)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* black weight layer — sits over the blur, under all content */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.68)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* top bar: ✕ left | Share Save right */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 210,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px clamp(16px, 3vw, 36px)",
              }}
            >
              <button aria-label="Close" onClick={() => setBox(null)} style={circleBtn}>
                ✕
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={shareBtn}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
                <button style={saveBtn}>Save</button>
              </div>
            </div>

            {/* image card — overflow visible so child buttons can overlap the edge */}
            <motion.div
              key={filtered[box].id}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ position: "relative", overflow: "visible", zIndex: 205 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filtered[box].src}
                alt={filtered[box].cat}
                style={{
                  display: "block",
                  maxWidth: "min(80vw, 520px)",
                  maxHeight: "72vh",
                  objectFit: "contain",
                  borderRadius: 24,
                  boxShadow: "0 32px 100px rgba(0,0,0,0.85)",
                }}
              />

              {/* ··· more options — top-right of card */}
              <button
                aria-label="More options"
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(22,22,22,0.78)",
                  backdropFilter: "blur(8px)",
                  color: "#fff",
                  fontSize: "0.55rem",
                  letterSpacing: "0.18em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 2,
                }}
              >
                ●●●
              </button>

              {/* sparkle / visual-search lens — bottom-right, overlapping edge */}
              <button
                aria-label="Visual search"
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "#fff",
                  color: "#333",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 14px rgba(0,0,0,0.3)",
                }}
              >
                ✦
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const circleBtn: React.CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: 18,
  border: "none",
  background: "rgba(210,210,210,0.92)",
  color: "#111",
  fontSize: "1.35rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: SANS,
  fontWeight: 700,
  boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
};

const saveBtn: React.CSSProperties = {
  background: "#E60023",
  color: "#fff",
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: "1.1rem",
  padding: "0.9rem 1.9rem",
  borderRadius: 16,
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.01em",
};

const shareBtn: React.CSSProperties = {
  background: "rgba(210,210,210,0.92)",
  color: "#111",
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: "1.1rem",
  padding: "0.9rem 1.9rem",
  borderRadius: 16,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
};

