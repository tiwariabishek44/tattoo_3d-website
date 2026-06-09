"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SERIF, SANS, COLORS, eyebrow } from "@/lib/theme";

// Pinterest-style masonry gallery: varied natural aspect ratios (no cropping),
// category filter chips, click-to-enlarge lightbox. Reusable via the `theme` prop
// ("dark" = on-brand, "light" = Pinterest-like) so both can be compared live.

const G = "/crousls_images";
const BASE = [
  { src: `${G}/realism_tattoo1.jpg`, cat: "Realism" },
  { src: `${G}/black_work_tattoo1.jpg`, cat: "Blackwork" },
  { src: `${G}/traditional_tattoo1.jpg`, cat: "Traditional" },
  { src: `${G}/covere-up-tattoo-13.jpg`, cat: "Cover-Up" },
  { src: `${G}/Tattoo-Piercing-Ideas-13-1.jpg`, cat: "Piercing" },
  { src: `${G}/laser_removal.jpg`, cat: "Laser Removal" },
];
// placeholder set — repeat the 6 we have to fill the wall (swap for real images later)
const ITEMS = [0, 1, 2].flatMap((r) =>
  BASE.map((it, i) => ({ ...it, id: `${r}-${i}` }))
);
const CATEGORIES = ["All", ...Array.from(new Set(BASE.map((b) => b.cat)))];

function useColumns() {
  const [c, setC] = useState(4);
  useEffect(() => {
    const f = () => {
      const w = window.innerWidth;
      setC(w <= 560 ? 2 : w <= 900 ? 3 : 4);
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

export default function Gallery({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [active, setActive] = useState("All");
  const [box, setBox] = useState<number | null>(null);
  const cols = useColumns();

  const filtered =
    active === "All" ? ITEMS : ITEMS.filter((i) => i.cat === active);

  const t =
    theme === "dark"
      ? {
          bg: COLORS.ink,
          heading: COLORS.offWhite,
          sub: COLORS.muted,
          accent: COLORS.gold,
          chipText: "rgba(242,239,233,0.78)",
          chipBorder: "rgba(242,239,233,0.18)",
          tileBorder: "1px solid rgba(255,255,255,0.06)",
          capText: "rgba(255,255,255,0.9)",
        }
      : {
          bg: COLORS.cream,
          heading: COLORS.inkText,
          sub: COLORS.mutedDark,
          accent: COLORS.gold,
          chipText: "rgba(27,22,15,0.72)",
          chipBorder: "rgba(27,22,15,0.18)",
          tileBorder: "1px solid rgba(0,0,0,0.06)",
          capText: "#fff",
        };

  // lightbox keyboard nav
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
        padding: "clamp(80px, 14vh, 180px) clamp(16px, 4vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* heading */}
        <div style={{ ...eyebrow(t.accent), marginBottom: "1.2rem" }}>
          The Gallery
        </div>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(2.6rem, 5.6vw, 5.6rem)",
            lineHeight: 1.04,
            color: t.heading,
            margin: 0,
          }}
        >
          Our Artwork.
        </h2>
        <p
          style={{
            fontFamily: SANS,
            fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
            lineHeight: 1.6,
            color: t.sub,
            margin: "1.2rem 0 0",
            maxWidth: "52ch",
          }}
        >
          Real pieces, real skin — straight from the Abishek chair.
        </p>

        {/* filter row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            margin: "clamp(28px, 4vh, 52px) 0 clamp(28px, 4vh, 48px)",
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
                  fontSize: "0.82rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.55rem 1.1rem",
                  borderRadius: 999,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: on ? `1px solid ${t.accent}` : `1px solid ${t.chipBorder}`,
                  background: on ? t.accent : "transparent",
                  color: on ? COLORS.ink : t.chipText,
                  fontWeight: on ? 600 : 500,
                  transition: "all 0.25s ease",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* masonry wall */}
        <div
          key={active}
          style={{ columnCount: cols, columnGap: "16px" }}
        >
          {filtered.map((it, idx) => (
            <motion.div
              key={`${active}-${it.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(idx * 0.03, 0.4) }}
              onClick={() => setBox(idx)}
              style={{
                breakInside: "avoid",
                marginBottom: 16,
                borderRadius: 8,
                overflow: "hidden",
                border: t.tileBorder,
                cursor: "pointer",
                position: "relative",
              }}
              whileHover={{ scale: 0.99 }}
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
                  transition: "transform 0.5s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              {/* caption */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "1.6rem 1rem 0.9rem",
                  background:
                    "linear-gradient(to top, rgba(7,6,5,0.82), rgba(7,6,5,0))",
                  fontFamily: SANS,
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: t.capText,
                  pointerEvents: "none",
                }}
              >
                {it.cat}
              </div>
            </motion.div>
          ))}
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
              style={{ ...arrowBtn, top: 24, right: 24, left: "auto", position: "fixed" }}
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
