"use client";

// MOBILE hero (route: "/mobile"). Off-main-thread rendering via Web Worker +
// OffscreenCanvas (the "isolate"). Falls back to the main-thread engine if a
// device lacks OffscreenCanvas. Uses the downscaled /frames-mobile set + contain fit.

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import HeroText from "@/components/HeroText";
import HeroFx from "@/components/HeroFx";
import { FrameEngine, EngineConfig } from "@/lib/frameEngine";

const FRAME_COUNT = 240;
const PAD = 6;
const SMOOTHING = 0.12;
const LEGS = 2;
const VH_PER_LEG = 400;
const OVERLAY_OPACITY = 0.05;
const WINDOW = 30;
const RELEASE_BUFFER = 14;
const READY_AHEAD = 12;
const MOBILE_FIT = 1.15;
const ENSURE_STEP = 4;

function vp() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  return {
    dpr,
    cssW: window.innerWidth,
    cssH: window.innerHeight,
    w: Math.round(window.innerWidth * dpr),
    h: Math.round(window.innerHeight * dpr),
  };
}

export default function ScrollSequenceMobile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const engineRef = useRef<FrameEngine | null>(null);
  const modeRef = useRef<"worker" | "main">("main");

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (modeRef.current === "worker") {
      workerRef.current?.postMessage({ type: "scroll", progress: p });
    } else {
      engineRef.current?.setProgress(p);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const v = vp();
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const cfg: EngineConfig = {
      frameCount: FRAME_COUNT,
      pad: PAD,
      base: "/frames-mobile",
      legs: LEGS,
      smoothing: SMOOTHING,
      window: WINDOW,
      releaseBuffer: RELEASE_BUFFER,
      readyAhead: READY_AHEAD,
      mobileFit: MOBILE_FIT,
      ensureStep: ENSURE_STEP,
      reduced,
    };

    canvas.style.width = v.cssW + "px";
    canvas.style.height = v.cssH + "px";
    canvas.style.filter = "contrast(1.05) saturate(1.04)"; // slight cinematic grade

    const canWorker =
      typeof Worker !== "undefined" &&
      typeof OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in HTMLCanvasElement.prototype;

    const startMain = () => {
      modeRef.current = "main";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const engine = new FrameEngine(canvas, ctx, cfg, {
        onReady: () => setReady(true),
        onProgress: (n) => setLoaded(n),
      });
      engineRef.current = engine;
      engine.setViewport(v.w, v.h, v.dpr, true); // mobile → contain
      engine.setProgress(0);
    };

    if (canWorker) {
      try {
        modeRef.current = "worker";
        const worker = new Worker(
          new URL("./frames.worker.ts", import.meta.url)
        );
        workerRef.current = worker;
        worker.onmessage = (e: MessageEvent) => {
          const m = e.data;
          if (m.type === "ready") setReady(true);
          else if (m.type === "progress") setLoaded(m.loaded);
        };
        const offscreen = canvas.transferControlToOffscreen();
        worker.postMessage(
          {
            type: "init",
            canvas: offscreen,
            cfg,
            dpr: v.dpr,
            mobile: true,
            width: v.w,
            height: v.h,
          },
          [offscreen]
        );
      } catch {
        workerRef.current?.terminate();
        workerRef.current = null;
        startMain();
      }
    } else {
      startMain();
    }

    const onResize = () => {
      const n = vp();
      const c = canvasRef.current;
      if (!c) return;
      c.style.width = n.cssW + "px";
      c.style.height = n.cssH + "px";
      if (modeRef.current === "worker") {
        workerRef.current?.postMessage({
          type: "resize",
          width: n.w,
          height: n.h,
          dpr: n.dpr,
          mobile: true,
        });
      } else {
        engineRef.current?.setViewport(n.w, n.h, n.dpr, true);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      workerRef.current?.terminate();
      workerRef.current = null;
      engineRef.current?.destroy();
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
