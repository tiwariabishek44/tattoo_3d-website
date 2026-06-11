"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CountUp from "./CountUp";
import { SERIF, SANS, COLORS, eyebrow, withAlpha, GUTTER } from "@/lib/theme";
import { BRAND_VH, getDesktopSectionHeight } from "@/lib/scrollBudget";
import { EASE_MECHANICAL } from "@/lib/motionTokens";

const STUDIO_IMG = "/studio_image.jpeg";

const PROOF = [
  { mark: "★ 4.9", label: "Google Reviews" },
  { mark: "Top Rated", label: "TripAdvisor" },
  { mark: "500+", label: "Pieces inked since 2015" },
];

const COLUMN = "min(640px, 50vw)";

export default function BrandStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 820);
    const handleResize = () => setIsDesktop(window.innerWidth > 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Phase 5: full-range offset so the 5-beat reveal plays LIVE across the whole
  // pinned hold (no dead pinned tail), matching the hero's offset semantics.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Sequential progress transitions matching the scroll-linked timing of the Hero
  const ebOpacity = useTransform(scrollYProgress, [0.0, 0.20], [0, 1]);
  const ebX = useTransform(scrollYProgress, [0.0, 0.20], [-24, 0]);

  const hlOpacity = useTransform(scrollYProgress, [0.20, 0.45], [0, 1]);
  const hlY = useTransform(scrollYProgress, [0.20, 0.45], [40, 0]);

  const bodyOpacity = useTransform(scrollYProgress, [0.45, 0.70], [0, 1]);
  const bodyY = useTransform(scrollYProgress, [0.45, 0.70], [24, 0]);

  const statOpacity = useTransform(scrollYProgress, [0.70, 0.85], [0, 1]);
  const statY = useTransform(scrollYProgress, [0.70, 0.85], [24, 0]);

  const ctaOpacity = useTransform(scrollYProgress, [0.85, 1.0], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.85, 1.0], [24, 0]);

  return (
    // 250vh wrapper — 150vh of passive scroll budget holds the section
    // in view as the user arrives from the hero or leaves toward Buddha.
    // No lenis.stop() / lenis.start() — the scroll budget IS the gate.
    <div
      ref={containerRef}
      id="about"
      style={{
        height: isDesktop ? `${getDesktopSectionHeight(BRAND_VH)}px` : `${BRAND_VH}vh`,
        position: "relative"
      }}
    >
      <section
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          backgroundImage: `url(${STUDIO_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* scrim — dark left → clear right, utilizing pixel-capping to prevent stretching on ultrawides */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              `linear-gradient(to right, ${withAlpha(COLORS.ink, 0.88)} 0px, ${withAlpha(COLORS.ink, 0.88)} 300px, ${withAlpha(COLORS.ink, 0.6)} 600px, ${withAlpha(COLORS.ink, 0)} 1100px), linear-gradient(to top, ${withAlpha(COLORS.ink, 0.5)} 0%, ${withAlpha(COLORS.ink, 0)} 38%)`,
          }}
        />

        {/* bottom feather — bleeds INK upward so the joint with SpiderSequence dissolves */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "11%",
            background: `linear-gradient(to top, ${withAlpha(COLORS.ink, 1)} 0%, ${withAlpha(COLORS.ink, 0)} 100%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, padding: `0 ${GUTTER}` }}>
          <div style={{ width: COLUMN, flexShrink: 0 }}>
            <motion.div
              style={{
                opacity: ebOpacity,
                x: ebX,
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ width: 34, height: 1, background: COLORS.gold }} />
              <span style={eyebrow()}>Abishek&apos;s Tattoo Ink</span>
            </motion.div>

            <motion.div style={{ opacity: hlOpacity, y: hlY }}>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 500,
                  fontSize: "clamp(2.4rem, 4.6vw, 4.6rem)",
                  lineHeight: 1.08,
                  color: COLORS.offWhite,
                  margin: 0,
                  textShadow: "0 2px 26px rgba(0,0,0,0.6)",
                }}
              >
                Where <span style={{ color: COLORS.gold }}>traditional Nepali motifs</span>{" "}
                meet <span style={{ color: COLORS.gold }}>modern ink.</span>
              </h2>
            </motion.div>

            <motion.div style={{ opacity: bodyOpacity, y: bodyY }}>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
                  lineHeight: 1.7,
                  color: withAlpha(COLORS.offWhite, 0.8),
                  marginTop: "1.6rem",
                  maxWidth: "50ch",
                  textShadow: "0 1px 16px rgba(0,0,0,0.5)",
                }}
              >
                Abishek Tattoo Ink is built on a simple belief — that a tattoo is
                a decision worth honouring. Step inside and you&apos;ll feel it:
                Kathmandu&apos;s living heritage sitting easily beside raw,
                contemporary expression — exactly how we work, and exactly how
                it lives on your skin.
              </p>
            </motion.div>

            <motion.div
              style={{
                opacity: statOpacity,
                y: statY,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "clamp(16px, 2vw, 28px)",
                marginTop: "clamp(28px, 4vh, 46px)",
              }}
            >
              {PROOF.flatMap((p, i) => [
                ...(i > 0
                  ? [
                      <span
                        key={`div-${i}`}
                        aria-hidden
                        style={{ width: 1, height: 22, background: withAlpha(COLORS.gold, 0.32) }}
                      />,
                    ]
                  : []),
                <div key={p.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      color: COLORS.gold,
                      textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                    }}
                  >
                    <CountUp value={p.mark} />
                  </span>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: "0.86rem",
                      letterSpacing: "0.03em",
                      color: withAlpha(COLORS.offWhite, 0.72),
                      textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                    }}
                  >
                    {p.label}
                  </span>
                </div>,
              ])}
            </motion.div>

            <motion.div style={{ opacity: ctaOpacity, y: ctaY }}>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: "0.84rem",
                  letterSpacing: "0.04em",
                  color: withAlpha(COLORS.offWhite, 0.55),
                  marginTop: "1.15rem",
                  textShadow: "0 1px 14px rgba(0,0,0,0.5)",
                }}
              >
                Thamel, Kathmandu — open by appointment
              </div>

              <motion.a
                href="/#contact"
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  rest: {
                    backgroundColor: withAlpha(COLORS.gold, 0.1),
                    borderColor: withAlpha(COLORS.gold, 0.55),
                  },
                  hover: {
                    backgroundColor: withAlpha(COLORS.gold, 0.22),
                    borderColor: withAlpha(COLORS.gold, 0.9),
                  },
                  tap: { scale: 0.98 },
                }}
                transition={{ duration: 0.25, ease: EASE_MECHANICAL }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: SANS,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: COLORS.gold,
                  borderWidth: 1,
                  borderStyle: "solid",
                  padding: "1rem 1.8rem",
                  borderRadius: 999,
                  textDecoration: "none",
                  marginTop: "2rem",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                Get studio tour
                <motion.span
                  aria-hidden
                  variants={{ hover: { x: 4 } }}
                  style={{ fontSize: "0.9rem" }}
                >
                  ↗
                </motion.span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
