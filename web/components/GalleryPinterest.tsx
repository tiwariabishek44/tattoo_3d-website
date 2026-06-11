"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { SERIF, SANS, COLORS, withAlpha, GUTTER } from "@/lib/theme";
import { useParallax } from "@/lib/useParallax";
import { PARALLAX_BG, staggerDelay } from "@/lib/motionTokens";
import { useScrollLock } from "@/lib/useScrollLock";
import { GALLERY_MIN_VH } from "@/lib/scrollBudget";

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

export default function GalleryPinterest({
  theme = "light",
}: {
  theme?: "light" | "dark";
}) {
  const t = THEMES[theme];
  const [active, setActive] = useState("All");
  const [box, setBox] = useState<number | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const filtered =
    active === "All" ? ITEMS : ITEMS.filter((i) => i.cat === active);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // E-20 — background depth plane: a faint oversized watermark drifting at
  // the bg rate (Decision 2), giving the gallery a second plane against the
  // flat masonry foreground.
  const bgY = useParallax(scrollYProgress, PARALLAX_BG, 120);
  const watermarkColor =
    theme === "dark" ? withAlpha(COLORS.gold, 0.06) : withAlpha(t.heading, 0.04);

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

  // Lock page scroll while lightbox is open — Pinterest behaviour (D-16)
  useScrollLock(box !== null);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 0,
        overflow: "hidden",
        background: t.bg,
        padding: `clamp(48px, 7vh, 96px) ${GUTTER}`,
        scrollMarginTop: "90px",
      }}
    >
      <style>{`
        .pinterest-gallery-masonry {
          column-gap: 24px;
          column-count: 2;
        }
        @media (min-width: 520px) {
          .pinterest-gallery-masonry { column-count: 3; }
        }
        @media (min-width: 820px) {
          .pinterest-gallery-masonry { column-count: 4; }
        }
        @media (min-width: 1200px) {
          .pinterest-gallery-masonry { column-count: 5; }
        }
        @media (min-width: 1800px) {
          .pinterest-gallery-masonry { column-count: 6; }
        }
      `}</style>
      {/* bg depth plane — faint oversized watermark, drifts at PARALLAX_BG
          while the masonry (normal flow) scrolls at 1x (E-20). */}
      <motion.div
        aria-hidden
        style={{
          y: bgY,
          position: "absolute",
          zIndex: -1,
          top: "6%",
          left: "50%",
          x: "-50%",
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: "clamp(8rem, 24vw, 24rem)",
          color: watermarkColor,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        Artwork
      </motion.div>

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
          minHeight: `${GALLERY_MIN_VH}vh`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div key={active} className="pinterest-gallery-masonry">
          {filtered.map((it, idx) => {
          const isHover = hover === it.id;
          return (
            <motion.div
              key={`${active}-${it.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: staggerDelay(idx) }}
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
                  maxWidth: "min(85vw, 800px)",
                  maxHeight: "80vh",
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

