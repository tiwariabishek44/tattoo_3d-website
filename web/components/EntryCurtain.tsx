"use client";

// A2 — Page-entry sequence. One breath before the world begins: ink-black hold
// with the mark settling in, then a quiet cross-dissolve (no bounce) onto a
// *ready* hero. It holds on black until the hero canvas has painted its first
// frames (`hero:ready`), so the user never sees the warm-up — they see the
// logo, then the studio. Reduced-motion users skip it entirely.
//
// SSOT: web/HOMEPAGE_FRAGRANCE_PLAN.md (A2 / A2b).

import { useEffect, useState, useRef } from "react";

const INK = "#070605";
const MIN_HOLD_MS = 1200;  // slightly longer floor so logo & loading sequence are clearly visible
const DISSOLVE_MS = 650;   // curtain fade-out duration (keep in sync with style)
const MAX_WAIT_MS = 25000; // fallback: dissolve even if downloads take too long

const ESTIMATED_SIZES: Record<string, number> = {
  "/hero_scrub.webm": 9827590,
  "/hero_scrub.mp4": 7102502,
  "/buddha_scrub.webm": 5232120,
  "/buddha_scrub.mp4": 3451210,
};

function canPlayWebm(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const video = document.createElement("video");
    return video.canPlayType('video/webm; codecs="vp9"') !== "";
  } catch (e) {
    return false;
  }
}

export default function EntryCurtain() {
  const [mounted, setMounted] = useState(true);
  const [logoIn, setLogoIn] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const getStatusText = (pct: number) => {
    if (pct < 30) return "PREPARING CANVAS...";
    if (pct < 70) return "CALIBRATING MACHINE...";
    if (pct < 95) return "SHAPING THE SOUL...";
    return "ELEVATING MIND...";
  };

  const startDissolve = (finishTimerRef?: { current: ReturnType<typeof setTimeout> | null }) => {
    setDissolving(true);
    const timer = setTimeout(() => {
      document.body.style.overflow = "";
      setMounted(false);
    }, DISSOLVE_MS);
    if (finishTimerRef) {
      finishTimerRef.current = timer;
    }
  };

  const handleSkipClick = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDissolving(true);
    document.body.style.overflow = "";
    setMounted(false);
  };

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

    // skip button fades in after 4 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 4000);

    let dissolved = false;
    const finishTimerRef = { current: null as ReturnType<typeof setTimeout> | null };

    const startDissolveSequence = () => {
      if (dissolved) return;
      dissolved = true;
      const elapsed = performance.now() - mountTs;
      const wait = Math.max(0, MIN_HOLD_MS - elapsed);
      setTimeout(() => startDissolve(finishTimerRef), wait);
    };

    // Preloading logic
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    const supportsWebm = canPlayWebm();
    const heroSrc = supportsWebm ? "/hero_scrub.webm" : "/hero_scrub.mp4";
    const buddhaSrc = supportsWebm ? "/buddha_scrub.webm" : "/buddha_scrub.mp4";

    const heroEst = ESTIMATED_SIZES[heroSrc] || 8000000;
    const buddhaEst = ESTIMATED_SIZES[buddhaSrc] || 4000000;

    let heroBytesRead = 0;
    let buddhaBytesRead = 0;
    let heroTotal = heroEst;
    let buddhaTotal = buddhaEst;

    const updateCombinedProgress = () => {
      const loaded = heroBytesRead + buddhaBytesRead;
      const total = heroTotal + buddhaTotal;
      const pct = total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : 0;
      setProgress(pct);
    };

    const fetchAsset = async (url: string, estimatedSize: number, isHero: boolean) => {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Status ${response.status}`);

        const contentLengthHeader = response.headers.get("Content-Length");
        const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : estimatedSize;

        if (isHero) heroTotal = totalBytes;
        else buddhaTotal = totalBytes;

        const reader = response.body?.getReader();
        if (!reader) {
          const blob = await response.blob();
          const objUrl = URL.createObjectURL(blob);
          if (isHero) {
            (window as any).__heroVideoUrl = objUrl;
            heroBytesRead = totalBytes;
          } else {
            (window as any).__buddhaVideoUrl = objUrl;
            buddhaBytesRead = totalBytes;
          }
          updateCombinedProgress();
          return;
        }

        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            if (isHero) {
              heroBytesRead += value.length;
            } else {
              buddhaBytesRead += value.length;
            }
            updateCombinedProgress();
          }
        }

        const finalBlob = new Blob(chunks as BlobPart[], { type: response.headers.get("Content-Type") || undefined });
        const objUrl = URL.createObjectURL(finalBlob);
        if (isHero) {
          (window as any).__heroVideoUrl = objUrl;
        } else {
          (window as any).__buddhaVideoUrl = objUrl;
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn(`Fallback preloading: ${url}`, err);
          if (isHero) heroBytesRead = heroTotal;
          else buddhaBytesRead = buddhaTotal;
          updateCombinedProgress();
        }
      }
    };

    // Load both video assets in parallel
    Promise.all([
      fetchAsset(heroSrc, heroEst, true),
      fetchAsset(buddhaSrc, buddhaEst, false),
    ]).then(() => {
      setProgress(100);
      startDissolveSequence();
    }).catch((err) => {
      console.warn("Asset preloading failed, dissolving curtain.", err);
      setProgress(100);
      startDissolveSequence();
    });

    const fallback = setTimeout(() => {
      setProgress(100);
      startDissolveSequence();
    }, MAX_WAIT_MS);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(skipTimer);
      clearTimeout(fallback);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      controller.abort();
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: dissolving ? 0 : 1,
        transition: `opacity ${DISSOLVE_MS}ms ease`,
        pointerEvents: dissolving ? "none" : "auto",
        gap: "24px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
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

        {/* Preloader UI */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            opacity: logoIn ? 1 : 0,
            transition: "opacity 0.5s ease 0.2s",
            width: "100%",
          }}
        >
          {/* Percentage */}
          <span
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "1.1rem",
              fontWeight: 300,
              color: "#f2efe9",
              letterSpacing: "0.05em",
            }}
          >
            {progress}%
          </span>

          {/* Progress Bar Track */}
          <div
            style={{
              width: "clamp(180px, 20vw, 300px)",
              height: "2px",
              background: "rgba(242, 239, 233, 0.1)",
              borderRadius: "1px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Progress Bar Fill */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress}%`,
                background: "#cba45a",
                boxShadow: "0 0 8px rgba(203, 164, 90, 0.8)",
                transition: "width 0.1s ease-out",
              }}
            />
          </div>

          {/* Dynamic Status Message */}
          <span
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "rgba(242, 239, 233, 0.5)",
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            {getStatusText(progress)}
          </span>
        </div>
      </div>

      {/* Skip Intro */}
      {showSkip && (
        <button
          onClick={handleSkipClick}
          style={{
            position: "absolute",
            bottom: "40px",
            background: "none",
            border: "none",
            color: "rgba(242, 239, 233, 0.4)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: "8px 16px",
            transition: "color 0.25s ease, opacity 0.5s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#cba45a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(242, 239, 233, 0.4)")}
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}
