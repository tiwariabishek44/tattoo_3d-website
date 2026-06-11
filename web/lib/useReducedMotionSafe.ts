"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Law 7 — `useReducedMotion()` resolves synchronously from `matchMedia` on the
// client but is always `false` during SSR, so a reduced-motion client's FIRST
// render mismatches its server markup. Stay `false` (matching SSR) until after
// mount, then adopt the real value — one extra render, zero hydration warnings.
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && (reduced ?? false);
}
