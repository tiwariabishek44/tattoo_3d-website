"use client";

// A2 — Page-entry sequence. One breath before the world begins: ink-black hold
// with the mark settling in, then a quiet cross-dissolve (no bounce) onto a
// *ready* hero. It holds on black until the hero canvas has painted its first
// frames (`hero:ready`), so the user never sees the warm-up — they see the
// logo, then the studio. Reduced-motion users skip it entirely.
//
// SSOT: web/HOMEPAGE_FRAGRANCE_PLAN.md (A2 / A2b).

import { useEffect, useState } from "react";

const INK = "#070605";
const MIN_HOLD_MS = 900;   // floor so the logo is actually seen before we dissolve
const DISSOLVE_MS = 650;   // curtain fade-out duration (keep in sync with style)
const MAX_WAIT_MS = 2600;  // fallback: dissolve even if `hero:ready` never fires

export default function EntryCurtain() {
  const [mounted, setMounted] = useState(true);
  const [logoIn, setLogoIn] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) {
      setMounted(false);
      return;
    }

    const mountTs = performance.now();
    document.body.style.overflow = "hidden"; // freeze the page under the curtain

    // logo fades/scales in just after mount
    const logoTimer = setTimeout(() => setLogoIn(true), 60);

    let dissolved = false;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;
    const startDissolve = () => {
      if (dissolved) return;
      dissolved = true;
      setDissolving(true);
      finishTimer = setTimeout(() => {
        document.body.style.overflow = "";
        setMounted(false);
      }, DISSOLVE_MS);
    };

    // dissolve once the hero is ready — but never before MIN_HOLD_MS (logo seen)
    const onReady = () => {
      const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - mountTs));
      setTimeout(startDissolve, wait);
    };

    const w = window as typeof window & { __heroReady?: boolean };
    if (w.__heroReady) onReady();
    else window.addEventListener("hero:ready", onReady, { once: true });

    const fallback = setTimeout(startDissolve, MAX_WAIT_MS);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fallback);
      if (finishTimer) clearTimeout(finishTimer);
      window.removeEventListener("hero:ready", onReady);
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: dissolving ? 0 : 1,
        transition: `opacity ${DISSOLVE_MS}ms ease`,
        pointerEvents: dissolving ? "none" : "auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.webp"
        alt=""
        style={{
          width: "clamp(120px, 16vw, 200px)",
          height: "auto",
          borderRadius: "50%",
          opacity: logoIn ? 1 : 0,
          // settle in (0.96 → 1), then open slightly on dissolve (→ 1.06). No bounce.
          transform: `scale(${dissolving ? 1.06 : logoIn ? 1 : 0.96})`,
          transition: "opacity 0.5s ease, transform 0.7s ease",
          filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.6))",
        }}
      />
    </div>
  );
}
