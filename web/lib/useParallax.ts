"use client";

import { MotionValue, useTransform } from "framer-motion";

// Decision 2 (scroll-coherence-fix-plan.md) — one hook for every scroll-driven
// depth layer on the site, so "background moves slower, foreground moves
// faster" is a single shared idea instead of N hand-rolled useTransform calls.
//
// `progress` is a 0->1 MotionValue (typically scrollYProgress over a
// section). `rate` is the plane's speed relative to normal scroll —
// PARALLAX_BG / PARALLAX_MID / PARALLAX_FG from motionTokens.ts (or a
// negative rate for an element that should counter-move against another
// plane at the same depth). `range` is the px travel at rate = 1.
export function useParallax(
  progress: MotionValue<number>,
  rate: number,
  range = 100
): MotionValue<number> {
  const travel = range * rate;
  return useTransform(progress, [0, 1], [travel, -travel]);
}
