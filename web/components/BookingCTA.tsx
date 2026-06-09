"use client";

// B8 — the conversion apex. The whole page builds emotional investment toward
// this one action, so it can't be a placeholder. Now: a real ink-on-skin
// backdrop (swap for the studio's own hero shot later) under a deep scrim, a
// slow cinematic push-in as it enters view, the "Begin your mark." headline
// rising with weight, and the button wired to the real booking action.
// SSOT: web/HOMEPAGE_FRAGRANCE_PLAN.md (B8).

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { SERIF, SANS, COLORS, eyebrow, GUTTER, BOOKING_HREF } from "@/lib/theme";

const BG = "/crousal_images2/realism_tattoo1.jpeg"; // ink on skin — "your mark"
const EASE = [0.22, 1, 0.36, 1] as const;

export default function BookingCTA() {
  return (
    <section
      style={{
        position: "relative",
        padding: `clamp(120px, 24vh, 300px) ${GUTTER}`,
        textAlign: "center",
        overflow: "hidden",
        background: COLORS.ink,
      }}
    >
      {/* background — slow push-in (Ken Burns) as the apex enters view. Oversized
          so the scale never reveals an edge. */}
      <motion.div
        aria-hidden
        initial={{ scale: 1.14 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.8, ease: EASE }}
        style={{
          position: "absolute",
          inset: "-4%",
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* deep scrim — keeps the type commanding over the ink texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(7,6,5,0.8), rgba(7,6,5,0.92)), radial-gradient(ellipse 70% 60% at 50% 50%, rgba(7,6,5,0) 0%, rgba(7,6,5,0.55) 100%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <Reveal variant="rule">
          <div style={{ ...eyebrow(), marginBottom: "1.6rem" }}>
            Abishek Tattoo Ink
          </div>
        </Reveal>
        <Reveal delay={0.08} variant="heading">
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(3rem, 8vw, 8.5rem)",
              lineHeight: 1,
              color: COLORS.gold,
              margin: 0,
              textShadow: "0 2px 40px rgba(0,0,0,0.5)",
            }}
          >
            Begin your mark.
          </h2>
        </Reveal>
        <Reveal delay={0.16} variant="body">
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
              lineHeight: 1.7,
              color: COLORS.muted,
              margin: "2rem auto 0",
              maxWidth: "46ch",
            }}
          >
            Book a consultation and let&apos;s design something unmistakably yours.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <motion.a
            href={BOOKING_HREF}
            whileHover={{ scale: 1.04, boxShadow: "0 16px 50px rgba(203,164,90,0.4)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "tween", duration: 0.25, ease: EASE }}
            style={{
              display: "inline-block",
              marginTop: "2.6rem",
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: COLORS.ink,
              background: COLORS.gold,
              padding: "1.1rem 2.6rem",
              borderRadius: 2,
              textDecoration: "none",
            }}
          >
            Book a session
          </motion.a>
        </Reveal>
      </div>
    </section>
  );
}
