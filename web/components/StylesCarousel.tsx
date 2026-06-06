"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { SERIF, SANS, COLORS, eyebrow, frame } from "@/lib/theme";

// Real tattoo photos where available; the two without a photo (Fine Line, Custom)
// fall back to a machine frame for now.
const C = "/crousls_images";
const STYLES = [
  { name: "Fine Line", desc: "Delicate, precise linework with quiet elegance.", img: frame(18) },
  { name: "Blackwork", desc: "Bold, graphic black — high contrast, high impact.", img: `${C}/black_work_tattoo1.jpg` },
  { name: "Traditional", desc: "Timeless motifs, confident lines, lasting colour.", img: `${C}/traditional_tattoo1.jpg` },
  { name: "Realism", desc: "Photographic depth and detail, rendered by hand.", img: `${C}/realism_tattoo1.jpg` },
  { name: "Custom", desc: "Original pieces designed around your story.", img: frame(150) },
  { name: "Cover-Up", desc: "Thoughtful redesigns that reclaim the canvas.", img: `${C}/covere-up-tattoo-13.jpg` },
  { name: "Piercing", desc: "Studio-grade piercing and quality jewellery.", img: `${C}/Tattoo-Piercing-Ideas-13-1.jpg` },
  { name: "Laser Removal", desc: "Careful, professional removal and fading.", img: `${C}/laser_removal.jpg` },
];
const N = STYLES.length;
const AUTO_MS = 5200; // gentle auto-advance; pauses on interaction. 0 = off.

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

export default function StylesCarousel({
  bg = COLORS.ink,
  light = false,
  label,
  ambient = false,
}: {
  bg?: string;
  light?: boolean;
  label?: string;
  ambient?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const compact = useCompact();
  const reducedRef = useRef(false);
  useEffect(() => {
    reducedRef.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  const go = (dir: number) => setActive((a) => (a + dir + N) % N);
  const next = () => go(1);
  const prev = () => go(-1);

  useEffect(() => {
    if (paused || AUTO_MS <= 0) return;
    const id = setInterval(() => setActive((a) => (a + 1) % N), AUTO_MS);
    return () => clearInterval(id);
  }, [paused]);

  const CARD_W = compact ? 288 : 432; // +20% larger focused card
  const CARD_H = compact ? 384 : 576;
  const baseX = compact ? 178 : 300; // wider fan span / coverage
  const stepY = compact ? 24 : 36;
  const rotStep = compact ? 6 : 9;
  const deckH = CARD_H + (compact ? 100 : 150);

  const slot = (i: number) => {
    let off = i - active;
    if (off > N / 2) off -= N;
    if (off < -N / 2) off += N;
    const abs = Math.abs(off);
    const sign = Math.sign(off);
    const visible = abs <= 2;
    const x = abs === 0 ? 0 : sign * (abs === 1 ? baseX : baseX * 1.78);
    const y = abs === 0 ? 0 : abs === 1 ? stepY : stepY * 2.7;
    const rotate = off * rotStep;
    const scale = abs === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
    // side cards stay clearly visible (content readable) but out of focus
    const opacity = !visible ? 0 : abs === 0 ? 1 : abs === 1 ? 0.82 : 0.55;
    const brightness = light ? 1 : abs === 0 ? 1 : abs === 1 ? 0.85 : 0.68;
    const blur = abs === 0 ? 0 : abs === 1 ? 1.4 : 2.6;
    return {
      x,
      y,
      rotate,
      scale,
      opacity,
      filter: `blur(${blur}px) brightness(${brightness})`,
      zIndex: 50 - abs * 10,
      visible,
    };
  };

  return (
    <section
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Styles we master"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          next();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
        }
      }}
      style={{
        position: "relative",
        background: bg,
        padding: "clamp(90px, 16vh, 200px) clamp(16px, 4vw, 80px)",
        overflow: "hidden",
        outline: "none",
      }}
    >
      {ambient && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <AnimatePresence>
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${STYLES[active].img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(48px) brightness(0.4) saturate(1.1)",
                transform: "scale(1.18)",
              }}
            />
          </AnimatePresence>
          {/* darken for legibility */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(7,6,5,0.55)" }}
          />
        </div>
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {label && (
          <div
            style={{
              fontFamily: SANS,
              fontSize: "0.7rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: light ? COLORS.inkText : COLORS.gold,
              opacity: 0.55,
              marginBottom: "1.6rem",
            }}
          >
            {label}
          </div>
        )}
        {/* heading (left) + carousel controls (right) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "24px",
            flexWrap: "wrap",
            textAlign: "left",
            marginBottom: "clamp(8px, 1.5vh, 24px)",
          }}
        >
          <div>
            <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>What we do</div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.7rem, 5.8vw, 6rem)",
                lineHeight: 1.04,
                color: light ? COLORS.inkText : COLORS.offWhite,
                margin: 0,
              }}
            >
              Styles we master.
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button aria-label="Previous style" onClick={prev} style={btn}>
              ‹
            </button>
            <div
              style={{
                fontFamily: SANS,
                letterSpacing: "0.2em",
                fontSize: "0.78rem",
                color: COLORS.gold,
                minWidth: 64,
                textAlign: "center",
              }}
            >
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(N).padStart(2, "0")}
            </div>
            <button aria-label="Next style" onClick={next} style={btn}>
              ›
            </button>
          </div>
        </div>

        {/* deck */}
        <div style={{ position: "relative", height: deckH }}>
          {/* swipe layer */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragStart={() => setPaused(true)}
            onDragEnd={(_e: unknown, info: PanInfo) => {
              if (info.offset.x < -60 || info.velocity.x < -300) next();
              else if (info.offset.x > 60 || info.velocity.x > 300) prev();
            }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 60,
              cursor: "grab",
            }}
          />

          {STYLES.map((s, i) => {
            const sl = slot(i);
            const isCenter = i === active;
            return (
              <motion.div
                key={s.name}
                animate={{
                  x: sl.x,
                  y: sl.y,
                  rotate: sl.rotate,
                  scale: sl.scale,
                  opacity: sl.opacity,
                  filter: sl.filter,
                }}
                transition={
                  reducedRef.current
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 120, damping: 20 }
                }
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: CARD_W,
                  height: CARD_H,
                  marginLeft: -CARD_W / 2,
                  marginTop: -CARD_H / 2,
                  zIndex: sl.zIndex,
                  pointerEvents: "none",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: isCenter
                    ? `1px solid ${COLORS.gold}`
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isCenter
                    ? "0 34px 90px rgba(0,0,0,0.65)"
                    : "0 16px 44px rgba(0,0,0,0.5)",
                  backgroundImage: `linear-gradient(to top, rgba(7,8,10,0.92) 0%, rgba(7,8,10,0.15) 55%), url(${s.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: compact ? "18px" : "26px",
                }}
              >
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: compact ? "1.4rem" : "1.9rem",
                    color: COLORS.gold,
                    margin: 0,
                  }}
                >
                  {s.name}
                </h3>
                {isCenter && (
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: "0.92rem",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.82)",
                      margin: "0.5rem 0 0",
                    }}
                  >
                    {s.desc}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

const btn: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: `1px solid ${COLORS.gold}`,
  background: "transparent",
  color: COLORS.gold,
  fontSize: "1.5rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: SANS,
};
