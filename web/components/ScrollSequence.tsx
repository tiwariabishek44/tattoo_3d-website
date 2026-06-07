"use client";

// DESKTOP hero (route: "/"). Main-thread rendering only — the original way.
// No worker / OffscreenCanvas here. Mobile uses ScrollSequenceMobile at /mobile.

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import HeroText from "@/components/HeroText";
import HeroFx from "@/components/HeroFx";
import { FrameEngine, EngineConfig } from "@/lib/frameEngine";

const FRAME_COUNT = 240;
const PAD = 6;
const SMOOTHING = 0.40;
const LEGS = 2; // R→L→R
const VH_PER_LEG = 350;
const OVERLAY_OPACITY = 0.05;
const WINDOW = 30;
const RELEASE_BUFFER = 14;
const READY_AHEAD = 12;
const MOBILE_FIT = 1.15;
const ENSURE_STEP = 4;
// Input-layer velocity cap: max 3 frames per RAF tick, expressed in progress units
const DISPLAY_STEP = 3 / ((FRAME_COUNT - 1) * LEGS); // 3/478 ≈ 0.00628

export default function ScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FrameEngine | null>(null);

  // displayProgress proxy — rate-limits raw scroll before feeding the engine
  const rawProgressRef = useRef(0);
  const displayProgressRef = useRef(0);
  const displayRafRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const kickDisplay = useCallback(() => {
    if (displayRafRef.current) return;
    const advance = () => {
      const raw = rawProgressRef.current;
      const disp = displayProgressRef.current;
      const delta = raw - disp;
      if (Math.abs(delta) < DISPLAY_STEP * 0.25) {
        displayProgressRef.current = raw;
        engineRef.current?.setProgress(raw);
        displayRafRef.current = 0;
        return;
      }
      const step = Math.sign(delta) * Math.min(Math.abs(delta), DISPLAY_STEP);
      displayProgressRef.current += step;
      engineRef.current?.setProgress(displayProgressRef.current);
      // expose state for debug overlay
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__scrollDebug = {
        rawProgress: rawProgressRef.current,
        displayProgress: displayProgressRef.current,
        frame: engineRef.current?.getFrame() ?? 0,
      };
      displayRafRef.current = requestAnimationFrame(advance);
    };
    displayRafRef.current = requestAnimationFrame(advance);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    rawProgressRef.current = p;
    kickDisplay();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.style.filter = "contrast(1.06) saturate(1.04)"; // slight cinematic grade

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const cfg: EngineConfig = {
      frameCount: FRAME_COUNT,
      pad: PAD,
      base: "/frames",
      legs: LEGS,
      smoothing: SMOOTHING,
      window: WINDOW,
      releaseBuffer: RELEASE_BUFFER,
      readyAhead: READY_AHEAD,
      mobileFit: MOBILE_FIT,
      ensureStep: ENSURE_STEP,
      reduced,
    };

    const engine = new FrameEngine(canvas, ctx, cfg, {
      onReady: () => setReady(true),
      onProgress: (n) => setLoaded(n),
    });
    engineRef.current = engine;

    const apply = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      engine.setViewport(
        Math.round(window.innerWidth * dpr),
        Math.round(window.innerHeight * dpr),
        dpr,
        false // desktop → cover
      );
    };
    apply();
    engine.setProgress(0);
    window.addEventListener("resize", apply);

    return () => {
      window.removeEventListener("resize", apply);
      engine.destroy();
      engineRef.current = null;
      if (displayRafRef.current) {
        cancelAnimationFrame(displayRafRef.current);
        displayRafRef.current = 0;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: `${LEGS * VH_PER_LEG}vh`, position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <canvas ref={canvasRef} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0, 0, 0, ${OVERLAY_OPACITY})`,
            pointerEvents: "none",
          }}
        />
        {/* Corner vignette — masks the small sparkle artifact baked into the source frames */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 12% 16% at 94% 85%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <HeroFx />
        <HeroText progress={scrollYProgress} />
        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
              color: "#666",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              letterSpacing: "0.1em",
            }}
          >
            LOADING {Math.min(100, Math.round((loaded / READY_AHEAD) * 100))}%
          </div>
        )}
      </div>
    </div>
  );
}
