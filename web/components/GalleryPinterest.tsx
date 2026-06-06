"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SERIF, SANS } from "@/lib/theme";

// Pinterest-pattern gallery: clean full-bleed dense masonry, hover-darken overlay
// (no red Save button), click → lightbox. Theme-aware (light = neutral white,
// dark = on-brand black) so both can be compared with the SAME layout.

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

  return (
    <section
      style={{
        background: t.bg,
        padding: "clamp(48px, 7vh, 96px) clamp(12px, 1.5vw, 20px)",
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
        Real pieces, real skin — straight from the Teyung chair.
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
              {/* hover overlay — dark wash + expand (no red Save button) */}
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
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.92)",
                    color: "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  ⤢
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    bottom: 12,
                    color: "#fff",
                    fontFamily: SANS,
                    fontSize: "0.76rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {it.cat}
                </span>
              </div>
            </motion.div>
          );
          })}
        </div>
      </div>

      {/* lightbox */}
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
              background: "rgba(5,4,3,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4vh 4vw",
            }}
          >
            <button
              aria-label="Close"
              onClick={() => setBox(null)}
              style={{ ...arrowBtn, top: 24, right: 24, left: "auto" }}
            >
              ✕
            </button>
            <button
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                setBox((b) => (b! - 1 + filtered.length) % filtered.length);
              }}
              style={{ ...arrowBtn, left: 24 }}
            >
              ‹
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={filtered[box].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={filtered[box].src}
              alt={filtered[box].cat}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 8,
                boxShadow: "0 30px 100px rgba(0,0,0,0.7)",
              }}
            />
            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setBox((b) => (b! + 1) % filtered.length);
              }}
              style={{ ...arrowBtn, right: 24 }}
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const arrowBtn: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 210,
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.4)",
  color: "#fff",
  fontSize: "1.4rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: SANS,
};
