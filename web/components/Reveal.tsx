"use client";

import { motion } from "framer-motion";

// A4 — Reveal as a small FAMILY of intents, not one recipe applied everywhere.
// The distance + duration vary by ROLE (so it reads authored, not templated);
// the easing stays one shared vocabulary (so it still feels like one hand).
//   heading — larger rise, a touch longer
//   body    — gentle rise
//   stat     — opacity-only, resolves in place (no travel)
//   rule     — decorative wipe in from the left
//   default — the original recipe (kept for back-compat)
// An explicit `y`/`x` still overrides the preset.
// SSOT: web/HOMEPAGE_FRAGRANCE_PLAN.md (A4).

const EASE = [0.22, 1, 0.36, 1] as const;

type Variant = "default" | "heading" | "body" | "stat" | "rule";

const PRESETS: Record<Variant, { y: number; x: number; duration: number }> = {
  default: { y: 40, x: 0, duration: 0.7 },
  heading: { y: 60, x: 0, duration: 0.85 },
  body: { y: 24, x: 0, duration: 0.7 },
  stat: { y: 0, x: 0, duration: 0.6 },
  rule: { y: 0, x: -24, duration: 0.7 },
};

export default function Reveal({
  children,
  delay = 0,
  y,
  x,
  variant = "default",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  variant?: Variant;
  style?: React.CSSProperties;
}) {
  const preset = PRESETS[variant];
  const fromY = y ?? preset.y;
  const fromX = x ?? preset.x;
  return (
    <motion.div
      initial={{ opacity: 0, y: fromY, x: fromX }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: preset.duration, delay, ease: EASE }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
