"use client";

// A2 — Page-entry sequence. One breath before the world begins: ink-black hold
// with the mark settling in, then a quiet cross-dissolve (no bounce) onto the
// hero. The curtain is a fixed-length BRAND BEAT — it never waits on the
// network. Videos stream in the background via their native <source> elements
// (HeroVideo/BuddhaVideo already fall back to progressive streaming with a
// poster sealing first paint), so the visitor sees the logo, then the studio —
// in ~1.8s flat on any connection. Reduced-motion users skip it entirely.
//
// SSOT: inkspire-postmortem-build-roadmap.md (Phase 0.1 — kill the blocking
// preloader). Supersedes the download-gated curtain from HOMEPAGE_FRAGRANCE_PLAN A2b.

import { useEffect, useState } from "react";

const INK = "#070605";
const HOLD_MS = 1100; // brand beat: logo in, one breath
const DISSOLVE_MS = 650; // curtain fade-out duration (keep in sync with style)

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

    document.body.style.overflow = "hidden"; // freeze the page under the curtain

    // logo fades/scales in just after mount
    const logoTimer = setTimeout(() => setLogoIn(true), 60);

    // fixed-length beat: hold, dissolve, unmount. No network gating.
    const dissolveTimer = setTimeout(() => setDissolving(true), HOLD_MS);
    const unmountTimer = setTimeout(() => {
      document.body.style.overflow = "";
      setMounted(false);
    }, HOLD_MS + DISSOLVE_MS);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(dissolveTimer);
      clearTimeout(unmountTimer);
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
          transform: `scale(${dissolving ? 1.06 : logoIn ? 1 : 0.96})`,
          transition: "opacity 0.5s ease, transform 0.7s ease",
          filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.6))",
        }}
      />
    </div>
  );
}
