"use client";

// DESKTOP hero (route: "/"). Main-thread rendering only — the original way.
// No worker / OffscreenCanvas here. Mobile uses ScrollSequenceMobile at /mobile.

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import HeroText from "@/components/HeroText";
import HeroFx from "@/components/HeroFx";
import { FrameEngine, EngineConfig } from "@/lib/frameEngine";

const FRAME_COUNT = 240;
const PAD = 6;
const SMOOTHING = 0.14;
const LEGS = 2; // R→L→R
const VH_PER_LEG = 260;
const OVERLAY_OPACITY = 0.05;
const WINDOW = 30;
const RELEASE_BUFFER = 14;
const READY_AHEAD = 12;
const MOBILE_FIT = 1.15;
const ENSURE_STEP = 4;

export default function ScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FrameEngine | null>(null);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    engineRef.current?.setProgress(p);
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
