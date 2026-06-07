"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, GUTTER } from "@/lib/theme";

// Curated "personal work" stand-ins — mixed per artist so no two profiles
// look identical. Swap for each artist's own photographed portfolio once
// shot (see ARTISTS_SOUL_PLAN.md §7 — the single biggest asset gap on the build).
const P1 = "/crousls_images/realism_tattoo1.jpg";
const P2 = "/crousls_images/black_work_tattoo1.jpg";
const P3 = "/crousls_images/traditional_tattoo1.jpg";
const P4 = "/crousls_images/covere-up-tattoo-13.jpg";
const P5 = "/crousal_images2/pircing.jpeg";
const P6 = "/crousls_images/laser_removal.jpg";

// One quiet accent per artist — variations on the brand gold, not a new
// palette. The shift in warmth is the only thing that says "different person"
// before a single word is read.
const TINTS = [
  { stroke: "#CBA45A", glow: "rgba(203,164,90,0.15)", border: "rgba(203,164,90,0.24)" },   // Tenzin — gold (precise, classic)
  { stroke: "#C2876B", glow: "rgba(194,135,107,0.15)", border: "rgba(194,135,107,0.24)" }, // Maya — warm terracotta (transformation)
  { stroke: "#A89C8E", glow: "rgba(168,156,142,0.15)", border: "rgba(168,156,142,0.24)" }, // Rohan — graphite-bronze (bold, grounded)
  { stroke: "#C39450", glow: "rgba(195,148,80,0.15)", border: "rgba(195,148,80,0.24)" },   // Sita — deep amber (heritage)
];

const ARTISTS = [
  {
    name: "Tenzin",
    craft: "Fine line & custom",
    tagline: "Fine lines, told slowly — like a sentence worth finishing properly.",
    bio: "Fine line forces you to slow down — there's no shading to hide behind, just a steady hand and a lot of listening. Most of what I do now is custom: someone brings me an idea half-formed, and we sit with it until it feels inevitable rather than decided. That part — watching an idea become obviously theirs — is the reason I haven't put the machine down in ten years.",
    portfolio: [P1, P3, P5, P2],
  },
  {
    name: "Maya",
    craft: "Realism & cover-up",
    tagline: "I turn scars into stories — that trade is the whole reason I do this.",
    bio: "Cover-up work taught me to read skin like a second language. Every old piece carries a history, and the job isn't to erase it — it's to give it somewhere honest to go. Realism is where I sharpen the technical side, but cover-ups are where I feel most useful: someone walks in carrying something they want to forget, and walks out wearing something they're proud to show.",
    portfolio: [P4, P1, P6, P3],
  },
  {
    name: "Rohan",
    craft: "Blackwork & traditional",
    tagline: "Bold and permanent — I want it to still mean something in twenty years.",
    bio: "Blackwork is unforgiving. There's no gradient to soften a wrong call — just weight, balance, and nerve. I trained in traditional work first, and that discipline still runs under everything I make: respect the placement, respect the way a body actually moves, and never put something on someone that won't age the way they will. If it still means something in twenty years, I've done the job right.",
    portfolio: [P2, P5, P1, P4],
  },
  {
    name: "Sita",
    craft: "Heritage & ornamental",
    tagline: "Heritage isn't a style to me — it's the hand I learned to draw with.",
    bio: "I grew up around the ornamental patterns you still see across Kathmandu — temple carvings, woven textiles, the kind of detail you only notice once you stop moving. Bringing that language into ink, onto skin that lives and moves and ages, feels like the most honest translation of where I'm from that I know how to make. A little of home rides on every piece I finish.",
    portfolio: [P3, P6, P2, P1],
  },
];

function useNarrow(breakpoint: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return narrow;
}

// A signature mark, not a portrait — the kind of small personal symbol a
// tattoo artist might actually stamp on their own flash sheet. Four distinct
// hand-drawable marks (one per craft) stand in honestly for photography we
// don't have yet, instead of pretending to be faces (ARTISTS_SOUL_PLAN.md §2, gap #1).
function SignatureMark({ variant, color, size = 40 }: { variant: number; color: string; size?: number }) {
  const common = { stroke: color, strokeWidth: 1.4, strokeLinecap: "round" as const, fill: "none" };
  switch (variant) {
    case 0: // Tenzin — fine line: a single unbroken contour
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
          <path d="M6 33C6 33 13 13 22 23C31 33 39 15 42 15" {...common} />
        </svg>
      );
    case 1: // Maya — realism/cover-up: two overlapping circles, transformation
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
          <circle cx="19" cy="24" r="12.5" {...common} />
          <circle cx="30" cy="24" r="12.5" stroke={color} strokeWidth={1.4} fill="none" strokeOpacity={0.5} />
        </svg>
      );
    case 2: // Rohan — blackwork/traditional: bold diamond, struck centre
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
          <path d="M24 7L41 24L24 41L7 24Z" stroke={color} strokeWidth={1.6} fill="none" />
          <circle cx="24" cy="24" r="2.2" fill={color} />
        </svg>
      );
    case 3: // Sita — heritage/ornamental: a small radial bloom
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse
              key={deg}
              cx="24"
              cy="24"
              rx="4.5"
              ry="12.5"
              stroke={color}
              strokeWidth={1.1}
              fill="none"
              transform={`rotate(${deg} 24 24)`}
            />
          ))}
        </svg>
      );
    default:
      return null;
  }
}

export default function Artists() {
  const [open, setOpen] = useState<number | null>(null);
  const narrow = useNarrow(860);

  // Esc + body-scroll lock while a story is open — same vocabulary as the
  // Gallery lightbox, so visitors never have to learn a second pattern.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <section
      style={{
        background: COLORS.ink,
        padding: `clamp(90px, 16vh, 200px) ${GUTTER}`,
        position: "relative",
      }}
    >
      <div>
        <Reveal>
          <div style={{ ...eyebrow(), marginBottom: "1.2rem" }}>The hands</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(2.4rem, 5vw, 5rem)",
              lineHeight: 1.06,
              color: COLORS.offWhite,
              margin: "0 0 1.1rem",
            }}
          >
            Meet the artists.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
              lineHeight: 1.7,
              color: COLORS.muted,
              margin: "0 0 clamp(40px, 6vh, 80px)",
              maxWidth: "56ch",
            }}
          >
            Every piece starts with a person. Here&apos;s what the four of them
            would tell you, before you ever sit in the chair.
          </p>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "clamp(20px, 2.4vw, 32px)",
          }}
        >
          {ARTISTS.map((a, i) => {
            const tint = TINTS[i];
            return (
              <Reveal key={a.name} delay={(i % 4) * 0.08}>
                <motion.button
                  onClick={() => setOpen(i)}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  aria-label={`Read ${a.name}'s words and view their story`}
                  style={{
                    all: "unset",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                    minHeight: "clamp(320px, 36vw, 372px)",
                    cursor: "pointer",
                    padding: "clamp(28px, 3vw, 38px)",
                    borderRadius: 6,
                    background: `radial-gradient(circle at 20% 14%, ${tint.glow}, transparent 60%), ${COLORS.charcoal}`,
                    border: `1px solid ${tint.border}`,
                  }}
                >
                  <SignatureMark variant={i} color={tint.stroke} size={38} />

                  {/* the artist's own words — the visual centre of the card */}
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontWeight: 500,
                      fontSize: "clamp(1.28rem, 1.7vw, 1.56rem)",
                      lineHeight: 1.45,
                      color: COLORS.offWhite,
                      margin: "clamp(20px, 3vh, 34px) 0",
                    }}
                  >
                    &ldquo;{a.tagline}&rdquo;
                  </p>

                  <div>
                    <span
                      aria-hidden
                      style={{ display: "block", width: 28, height: 1, background: tint.stroke, marginBottom: "0.95rem" }}
                    />
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "1.18rem", color: COLORS.offWhite }}>
                          {a.name}
                        </div>
                        <div
                          style={{
                            fontFamily: SANS,
                            fontSize: "0.74rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: COLORS.muted,
                            marginTop: "0.3rem",
                          }}
                        >
                          {a.craft}
                        </div>
                      </div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          fontFamily: SANS,
                          textTransform: "uppercase",
                          letterSpacing: "0.16em",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: tint.stroke,
                          whiteSpace: "nowrap",
                        }}
                      >
                        View story <span aria-hidden>→</span>
                      </span>
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* "View Story" modal — interaction mechanics adapted from
          GalleryPinterest's lightbox (glassmorphism backdrop, ✕ / Esc /
          backdrop-click to close, AnimatePresence open/close), re-skinned for
          a "meeting someone" register rather than "browse more work"
          (ARTISTS_SOUL_PLAN.md §4 + §8). Visual language carries the surface
          card's voice-led identity straight through — same signature mark,
          same pull-quote treatment, same accent — so the depth layer feels
          like a continuation, not a different product. */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: narrow ? 0 : "clamp(20px, 4vw, 56px)",
              background: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <div
              aria-hidden
              style={{ position: "absolute", inset: 0, background: "rgba(7,6,5,0.74)", zIndex: 0 }}
            />

            <motion.div
              key={ARTISTS[open].name}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative",
                zIndex: 1,
                width: narrow ? "100%" : "min(960px, 100%)",
                maxHeight: narrow ? "100dvh" : "86vh",
                height: narrow ? "100dvh" : "auto",
                overflowY: "auto",
                background: COLORS.charcoal,
                border: narrow ? "none" : `1px solid ${TINTS[open].border}`,
                borderRadius: narrow ? 0 : 28,
                display: "grid",
                gridTemplateColumns: narrow ? "1fr" : "minmax(0, 0.96fr) minmax(0, 1.16fr)",
              }}
            >
              <button
                aria-label="Close"
                onClick={() => setOpen(null)}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  zIndex: 2,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `1px solid ${TINTS[open].border}`,
                  background: "rgba(7,6,5,0.6)",
                  color: TINTS[open].stroke,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(6px)",
                }}
              >
                ✕
              </button>

              {/* identity — signature mark, their words (large), name + craft */}
              <div
                style={{
                  position: "relative",
                  padding: "clamp(44px, 5vw, 64px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: `radial-gradient(circle at 16% 12%, ${TINTS[open].glow}, transparent 58%)`,
                  borderRight: narrow ? "none" : `1px solid ${TINTS[open].border}`,
                  borderBottom: narrow ? `1px solid ${TINTS[open].border}` : "none",
                }}
              >
                <SignatureMark variant={open} color={TINTS[open].stroke} size={50} />
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: "clamp(1.5rem, 2.4vw, 2.05rem)",
                    lineHeight: 1.42,
                    color: COLORS.offWhite,
                    margin: "1.6rem 0 0",
                    maxWidth: "26ch",
                  }}
                >
                  &ldquo;{ARTISTS[open].tagline}&rdquo;
                </p>
                <span
                  aria-hidden
                  style={{ display: "block", width: 32, height: 1, background: TINTS[open].stroke, margin: "1.7rem 0 1.1rem" }}
                />
                <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "1.4rem", color: COLORS.offWhite }}>
                  {ARTISTS[open].name}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: "0.76rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: COLORS.muted,
                    marginTop: "0.35rem",
                  }}
                >
                  {ARTISTS[open].craft}
                </div>
              </div>

              {/* narrative + curated personal portfolio */}
              <div style={{ padding: "clamp(44px, 5vw, 64px)" }}>
                <div style={eyebrow()}>Their story</div>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: "clamp(0.98rem, 1.1vw, 1.06rem)",
                    lineHeight: 1.85,
                    color: COLORS.muted,
                    margin: "1rem 0 0",
                    maxWidth: "62ch",
                  }}
                >
                  {ARTISTS[open].bio}
                </p>

                <div style={{ ...eyebrow(), marginTop: "2.6rem" }}>Their work</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 14,
                    marginTop: "1.1rem",
                  }}
                >
                  {ARTISTS[open].portfolio.map((src, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={j}
                      src={src}
                      alt={`${ARTISTS[open].name} — piece ${j + 1}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        borderRadius: 12,
                        border: `1px solid ${TINTS[open].border}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
