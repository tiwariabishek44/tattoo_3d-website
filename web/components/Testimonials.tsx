"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, AnimatePresence, LayoutGroup, useAnimation, useScroll,
} from "framer-motion";
import { SERIF, SANS, COLORS, eyebrow, GUTTER } from "@/lib/theme";
import { useParallax } from "@/lib/useParallax";
import { PARALLAX_MID } from "@/lib/motionTokens";
import { useScrollLock } from "@/lib/useScrollLock";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Review = {
  id: string;
  name: string;
  initials: string;
  nation: string;
  artist: string;
  artistPhoto: string;
  style: string;
  quote: string;
  artworks: string[];
};

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Aarav Sharma",
    initials: "AS",
    nation: "India",
    artist: "Tenzin",
    artistPhoto: "/artist_image/artist1.jpg",
    style: "Custom blackwork sleeve",
    quote: "They didn't just give me a tattoo — they designed something that finally felt like mine.",
    artworks: ["/crousls_images/black_work_tattoo1.jpg", "/crousal_images2/black_work_tattoo1.jpeg", "/crousls_images/traditional_tattoo1.jpg"],
  },
  {
    id: "r2",
    name: "Elin Lindgren",
    initials: "EL",
    nation: "Sweden",
    artist: "Maya",
    artistPhoto: "/artist_image/artist2.jpg",
    style: "Realism portrait",
    quote: "Every session felt considered, unhurried. The result still stops people on the street.",
    artworks: ["/crousls_images/realism_tattoo1.jpg", "/crousal_images2/realism_tattoo1.jpeg", "/crousls_images/covere-up-tattoo-13.jpg"],
  },
  {
    id: "r3",
    name: "Kenji Watanabe",
    initials: "KW",
    nation: "Japan",
    artist: "Rohan",
    artistPhoto: "/artist_image/artist3.jpg",
    style: "Traditional Japanese",
    quote: "I've been tattooed in three countries. Nothing compares to the patience here.",
    artworks: ["/crousls_images/traditional_tattoo1.jpg", "/crousal_images2/traditional_tattoo1.jpeg", "/crousls_images/black_work_tattoo1.jpg"],
  },
  {
    id: "r4",
    name: "Priya Nair",
    initials: "PN",
    nation: "India",
    artist: "Sita",
    artistPhoto: "/artist_image/artist4.jpg",
    style: "Cover-up restoration",
    quote: "They turned something I regretted into something I'm proud to show.",
    artworks: ["/crousls_images/covere-up-tattoo-13.jpg", "/crousal_images2/covere-up-tattoo-13.png", "/crousls_images/realism_tattoo1.jpg"],
  },
  {
    id: "r5",
    name: "Noah Williams",
    initials: "NW",
    nation: "United Kingdom",
    artist: "Tenzin",
    artistPhoto: "/artist_image/artist1.jpg",
    style: "Fine-line piercing",
    quote: "Walked in nervous, walked out with a piece I think about daily.",
    artworks: ["/crousal_images2/pircing.jpeg", "/crousls_images/black_work_tattoo1.jpg", "/crousal_images2/black_work_tattoo1.jpeg"],
  },
  {
    id: "r6",
    name: "Sara Haddad",
    initials: "SH",
    nation: "Lebanon",
    artist: "Maya",
    artistPhoto: "/artist_image/artist2.jpg",
    style: "Custom linework",
    quote: "They listened more than they talked, and it shows in every line.",
    artworks: ["/crousls_images/black_work_tattoo1.jpg", "/crousls_images/realism_tattoo1.jpg", "/crousal_images2/realism_tattoo1.jpeg"],
  },
  {
    id: "r7",
    name: "Tomás Rivera",
    initials: "TR",
    nation: "Mexico",
    artist: "Rohan",
    artistPhoto: "/artist_image/artist3.jpg",
    style: "Realism, three sessions",
    quote: "Three pieces over two years — this is the only studio I trust with permanent things.",
    artworks: ["/crousls_images/realism_tattoo1.jpg", "/crousls_images/traditional_tattoo1.jpg", "/crousal_images2/realism_tattoo1.jpeg"],
  },
  {
    id: "r8",
    name: "Grace Okafor",
    initials: "GO",
    nation: "Nigeria",
    artist: "Sita",
    artistPhoto: "/artist_image/artist4.jpg",
    style: "Custom script",
    quote: "Every word was placed with intention. It reads exactly the way I wanted it to feel.",
    artworks: ["/crousls_images/black_work_tattoo1.jpg", "/crousal_images2/covere-up-tattoo-13.png", "/crousls_images/laser_removal.jpg"],
  },
];

const ROW_A = REVIEWS.filter((_, i) => i % 3 === 0);
const ROW_B = REVIEWS.filter((_, i) => i % 3 === 1);
const ROW_C = REVIEWS.filter((_, i) => i % 3 === 2);

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

// ── Detail modal ──────────────────────────────────────────────────────────────
function DetailModal({ review, lampId, onClose }: {
  review: Review;
  lampId: string;
  onClose: () => void;
}) {
  const compact = useCompact();
  const [closing, setClosing] = useState(false);
  const requestClose = () => { if (!closing) setClosing(true); };

  useEffect(() => { setClosing(false); }, [review.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  // D-16 — modal is only ever mounted while open, so the lock is unconditional.
  useScrollLock(true);

  const firstName = review.name.split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.87, ease: [0.6, 0, 1, 1] } }}
      transition={{ duration: 0.74, ease: "easeOut" }}
      onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 30,
        paddingBottom: 30,
        paddingRight: "clamp(12px, 1.5vw, 24px)",
        paddingLeft: compact ? "clamp(12px, 1.5vw, 24px)" : "clamp(48px, 6vw, 110px)",
        overflow: "hidden",
        background: "rgba(0,0,0,0.14)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
      }}
    >
      {/* THE LAMP SHEET — erupts from the clicked card (spring overshoot),
          collapses back into it on close (ease-in pull). Shares layoutId with
          the card's lamp anchor — standard Framer shared-element handoff. */}
      <motion.div
        layoutId={lampId}
        initial={{ borderRadius: 20 }}
        animate={{ borderRadius: 0, opacity: closing ? 0.78 : 1 }}
        exit={{ borderRadius: 20 }}
        transition={{
          layout: closing
            ? { duration: 0.96, ease: [0.6, 0, 1, 1] }
            : { type: "spring", stiffness: 59, damping: 8.2 },
          borderRadius: closing
            ? { duration: 0.96, ease: [0.6, 0, 1, 1] }
            : { duration: 1.09, ease: [0.22, 1, 0.36, 1] },
          opacity: closing
            ? { delay: 0.72, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0 },
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.62)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ✕ close — top-left, exact circleBtn */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 310,
          display: "flex",
          padding: "14px clamp(16px, 3vw, 36px)",
        }}
      >
        <button aria-label="Close" onClick={requestClose} style={closeBtn}>✕</button>
      </div>

      {/* outer shell — no competing transform */}
      <div
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="no-scrollbar"
        style={{
          position: "relative",
          zIndex: 305,
          width: "100%",
          maxWidth: 1309,
          height: compact ? "auto" : "min(833px, 94vh)",
          maxHeight: "94vh",
          display: "flex",
          flexDirection: compact ? "column" : "row",
          gap: compact ? 16 : 22,
          overflowY: compact ? "auto" : "visible",
        }}
      >
        {/* LEFT — arrives second, departs second. onAnimationComplete → onClose */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: closing ? 0 : 1, y: closing ? 22 : 0 }}
          transition={
            closing
              ? { delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              : { delay: 0.48, duration: 0.84, ease: [0.22, 1, 0.36, 1] }
          }
          onAnimationComplete={() => { if (closing) onClose(); }}
          className="no-scrollbar"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: compact ? "flex-start" : "center",
            gap: compact ? 16 : 22,
            width: compact ? "100%" : "40%",
            flexShrink: 0,
            background: COLORS.cream,
            borderRadius: 28,
            padding: compact ? "2.4rem 1.4rem 2rem" : "3rem 1.8rem 2.5rem",
            boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
            overflowY: compact ? "visible" : "auto",
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: compact ? 187 : 255,
                height: compact ? 187 : 255,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: compact ? "2.6rem" : "3.5rem",
                color: COLORS.gold,
                background: COLORS.charcoal,
                border: `6px solid ${COLORS.cream}`,
                boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                flexShrink: 0,
              }}
            >
              {review.initials}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: SANS, fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: COLORS.gold, marginBottom: "0.7rem" }}>
              {review.style}
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.08, color: COLORS.inkText, margin: "0 0 0.9rem" }}>
              {review.name}
            </h2>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(1rem, 1.5vw, 1.18rem)", lineHeight: 1.55, color: COLORS.inkText, opacity: 0.82, margin: 0 }}>
              &ldquo;{review.quote}&rdquo;
            </p>
            <div style={{ height: 1, background: "rgba(27,22,15,0.14)", margin: "1.25rem 0 1.1rem" }} />
            <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: "1.06rem", lineHeight: 1.72, color: COLORS.inkText, opacity: 0.84, margin: 0 }}>
              Tattooed by <strong>{review.artist}</strong> at InkSpire Tattoo, Kathmandu —
              a {review.style.toLowerCase()} designed specifically for {firstName}, permanent and personal.
            </p>
            <div style={{ display: "flex", gap: compact ? "1.1rem" : "1.6rem", marginTop: "1.4rem", paddingTop: "1.2rem", borderTop: "1px solid rgba(27,22,15,0.1)" }}>
              {[
                { value: review.nation, label: "From" },
                { value: review.artist, label: "Artist" },
                { value: "★★★★★", label: "Rating" },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(1rem, 1.9vw, 1.3rem)", lineHeight: 1.1, color: COLORS.gold, marginBottom: "0.3rem" }}>{s.value}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: "0.76rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: COLORS.inkText, opacity: 0.62 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT — first to leave, last to arrive */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: closing ? 0 : 1, x: closing ? 36 : 0 }}
          transition={
            closing
              ? { delay: 0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              : { delay: 0.73, duration: 0.73, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ position: "relative", width: compact ? "100%" : "60%", flex: 1, minWidth: 0, height: compact ? "auto" : "100%" }}
        >
          <div
            className="no-scrollbar"
            style={{
              width: "100%",
              height: "100%",
              background: COLORS.cream,
              borderRadius: 22,
              padding: compact ? "14px 8px 14px 14px" : "20px 10px 20px 20px",
              boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
              overflowY: "auto",
            }}
          >
            <div style={{ fontFamily: SANS, fontSize: "0.78rem", letterSpacing: "0.24em", textTransform: "uppercase" as const, color: COLORS.gold, marginBottom: "0.7rem" }}>The Artwork</div>
            <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(1.9rem, 3.4vw, 3rem)", lineHeight: 1.04, letterSpacing: "-0.01em", color: COLORS.inkText, margin: 0 }}>
              {review.artist}&rsquo;s Work.
            </h3>
            <p style={{ fontFamily: SANS, fontSize: "clamp(0.92rem, 1.2vw, 1.05rem)", lineHeight: 1.6, color: COLORS.inkText, opacity: 0.7, margin: "0.7rem 0 1.4rem", maxWidth: "54ch" }}>
              The piece {firstName} took home.
            </p>
            <div style={{ columnCount: compact ? 1 : 2, columnGap: compact ? 14 : 22 }}>
              {review.artworks.map((src, i) => (
                <div key={i} style={{ breakInside: "avoid", marginBottom: compact ? 14 : 22, borderRadius: 18, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${review.style} artwork ${i + 1}`} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ r, lampId, selectedLampId, onOpen, compact }: {
  r: Review;
  lampId: string;
  selectedLampId: string | null;
  onOpen: (r: Review, lampId: string) => void;
  compact: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ptrRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      style={{
        flexShrink: 0,
        width: compact ? "clamp(240px, 68vw, 300px)" : "clamp(280px, 30vw, 380px)",
        borderRadius: 20,
        padding: compact ? "1.2rem 1.4rem" : "clamp(1.6rem, 2.2vw, 2.2rem)",
        background: "#ffffff",
        boxShadow: "0 16px 48px rgba(27,22,15,0.14)",
        position: "relative",
        cursor: "pointer",
        userSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => { ptrRef.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        if (!ptrRef.current) return;
        const dx = e.clientX - ptrRef.current.x;
        const dy = e.clientY - ptrRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < 6) onOpen(r, lampId);
        ptrRef.current = null;
      }}
    >
      {/* lamp anchor — invisible geometry peg. Unmounted only while THIS card's
          modal is open so Framer can transfer the glass to/from it cleanly. */}
      {selectedLampId !== lampId && (
        <motion.div
          layoutId={lampId}
          style={{ position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none", zIndex: 0 }}
        />
      )}

      <p
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "clamp(1.16rem, 1.55vw, 1.4rem)",
          lineHeight: 1.5,
          letterSpacing: "0.004em",
          color: COLORS.inkText,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        &ldquo;{r.quote}&rdquo;
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: "clamp(18px, 2.4vh, 24px)",
          paddingTop: "clamp(14px, 1.8vh, 18px)",
          borderTop: "1px solid rgba(27,22,15,0.08)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 38, height: 38, flexShrink: 0, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SERIF, fontStyle: "italic", fontSize: "0.82rem",
            color: COLORS.gold, background: COLORS.charcoal,
            border: "1px solid rgba(203,164,90,0.4)",
          }}
        >
          {r.initials}
        </div>
        <div>
          <div style={{ fontFamily: SANS, textTransform: "uppercase" as const, letterSpacing: "0.1em", fontSize: "0.72rem", fontWeight: 600, color: COLORS.gold }}>{r.name}</div>
          <div style={{ fontFamily: SANS, fontSize: "0.68rem", letterSpacing: "0.04em", color: COLORS.mutedDark, marginTop: 2 }}>{r.nation} · {r.style}</div>
        </div>
      </div>

      {/* hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{
              position: "absolute", inset: 0, borderRadius: 20, zIndex: 2,
              background: "rgba(7,6,5,0.37)", // ~50% of the original 0.74 — a light veil, not a blackout
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.charcoal, background: COLORS.gold, borderRadius: 100, padding: "10px 24px", boxShadow: "0 8px 24px rgba(27,22,15,0.22)" }}>
              See details
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Marquee row ───────────────────────────────────────────────────────────────
function MarqueeRow({ items, rowKey, reverse, duration, selectedLampId, paused, reduced, onOpen, compact }: {
  items: Review[];
  rowKey: string;
  reverse: boolean;
  duration: number;
  selectedLampId: string | null;
  paused: boolean;
  reduced: boolean;
  onOpen: (r: Review, lampId: string) => void;
  compact: boolean;
}) {
  const loop = [...items, ...items];
  const controls = useAnimation();

  // H-27 — reduced motion: never start the infinite marquee loop.
  useEffect(() => {
    if (paused || reduced) {
      controls.stop();
    } else {
      controls.start({
        x: reverse ? ["0%", "-50%"] : ["-50%", "0%"],
        transition: { duration, repeat: Infinity, ease: "linear" },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reduced]);

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <motion.div
        animate={controls}
        initial={{ x: reverse ? "0%" : "-50%" }}
        style={{ display: "flex", gap: 20, width: "max-content" }}
      >
        {loop.map((r, i) => (
          <Card
            key={`${r.id}-${rowKey}-${i}`}
            r={r}
            lampId={`${r.id}-${rowKey}-${i}`}
            selectedLampId={selectedLampId}
            onOpen={onOpen}
            compact={compact}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function Testimonials() {
  const [selected, setSelected] = useState<{ review: Review; lampId: string } | null>(null);
  const compact = useCompact();
  const reduced = useReducedMotionSafe();

  // Original layout — heading + stats and the review sheet live in ONE section,
  // with a subtle counter-drift parallax (label rises, sheet sinks) on the mid plane.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const labelY = useParallax(scrollYProgress, -PARALLAX_MID, reduced ? 0 : 80);
  const sheetY = useParallax(scrollYProgress, PARALLAX_MID, reduced ? 0 : 80);

  const paused = selected !== null;
  const selectedLampId = selected?.lampId ?? null;
  const handleOpen = (review: Review, lampId: string) => setSelected({ review, lampId });

  return (
    <LayoutGroup id="testimonials">
      <div id="testimonials">
        <AnimatePresence>
          {selected && (
            <DetailModal
              key="detail-modal"
              review={selected.review}
              lampId={selected.lampId}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>

        {/* Reviews — heading + stats and the sheet share ONE section, with a
            subtle counter-drift parallax between them (label rises, sheet sinks). */}
        <section
          ref={sectionRef}
          style={{
            background: "#fafafa",
            padding: `clamp(80px, 12vh, 140px) clamp(8px, 0.9vw, 14px)`,
          }}
        >
          {/* heading + stats — label plane (drifts up) */}
          <motion.div
            style={{
              y: labelY,
              maxWidth: "min(1600px, 100vw)",
              // generous breathing room above and below the label + stats block
              margin: "clamp(36px, 6vh, 80px) auto clamp(72px, 10vh, 124px)",
              textAlign: "center",
            }}
          >
            <div style={{ ...eyebrow(COLORS.gold), marginBottom: "1rem" }}>In their words</div>
            <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(3rem, 7vw, 7rem)", lineHeight: 1.04, letterSpacing: "-0.03em", color: COLORS.ink, margin: 0 }}>
              Where Review Matters
            </h2>
            {/* proof-stat row */}
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(28px, 5vw, 72px)", marginTop: "clamp(22px, 3vh, 38px)", flexWrap: "wrap" }}>
              {[
                { v: "4.9★", l: "Average rating" },
                { v: "500+", l: "Pieces inked" },
                { v: "8", l: "Countries traveled" },
              ].map((s) => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(1.6rem, 2.6vw, 2.6rem)", lineHeight: 1, color: COLORS.gold }}>{s.v}</div>
                  <div style={{ fontFamily: SANS, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.mutedDark, marginTop: "0.5rem" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* review sheet — sheet plane (drifts down) */}
          <motion.div
            style={{
              y: sheetY,
              width: "100%",
              maxWidth: "min(1600px, 100vw)",
              margin: "0 auto",
              background: "rgba(7,6,5,0.66)",
              backdropFilter: "blur(22px) saturate(140%)",
              WebkitBackdropFilter: "blur(22px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 100px rgba(0,0,0,0.25)",
              borderRadius: "clamp(24px, 3vw, 40px)",
              padding: `clamp(40px, 6vh, 72px) 0`,
              overflow: "hidden",
            }}
          >
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "clamp(16px, 2vh, 24px)" }}>
              <MarqueeRow items={ROW_A} rowKey="a" reverse={false} duration={48} selectedLampId={selectedLampId} paused={paused} reduced={reduced} onOpen={handleOpen} compact={compact} />
              <MarqueeRow items={ROW_B} rowKey="b" reverse={true}  duration={56} selectedLampId={selectedLampId} paused={paused} reduced={reduced} onOpen={handleOpen} compact={compact} />
              <MarqueeRow items={ROW_C} rowKey="c" reverse={false} duration={64} selectedLampId={selectedLampId} paused={paused} reduced={reduced} onOpen={handleOpen} compact={compact} />
            </div>
          </motion.div>
        </section>
      </div>
    </LayoutGroup>
  );
}

// ── Close button — exact circleBtn from ArtistShowcaseSlider ──────────────────
const closeBtn: React.CSSProperties = {
  width: 62, height: 62, borderRadius: 18, border: "none",
  background: "rgba(210,210,210,0.92)", color: "#111",
  fontSize: "1.35rem", lineHeight: "1", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
  boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
};
