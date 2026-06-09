"use client";

// "Design 2" — the spider story. One continuous forward scrub stitching
// beat 1 (unzip) → beat 3 (awakening), with slogan beats + cinematic overlay.
// Self-contained (SpiderEngine) so the machine hero ("/") is untouched.

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import SpiderText from "@/components/SpiderText";
import HeroFx from "@/components/HeroFx";
import { SpiderEngine, SpiderConfig } from "@/lib/spiderEngine";

// Reveal-ending only: unzip → chest + spider revealed → "Ink that's alive."
// The Beat 3 (spider crawls off) was cut — a living tattoo that LEAVES contradicts
// the message. The scrub finishes early (SCRUB_END) and HOLDS on the reveal so the
// slogan + CTA land over the settled spider — the "held breath."
const SEGMENTS = [
  // frames 186–240 are near-identical (held reveal) → cap at 185; the rest stay
  // on disk, just unused. The SCRUB_END tail then holds on the reveal.
  { base: "/frames-beat1", start: 77, count: 109 }, // frames 77 → 185 (cut dead preamble)
];
const VH_TOTAL = 1020; // tuned for industry-standard scroll speed (device at 0.0)
const SCRUB_END = 0.82; // frames complete here; the tail holds on the reveal
const PAD = 6;
const SMOOTHING = 0.14;
const WINDOW = 30;
const RELEASE_BUFFER = 14;
const READY_AHEAD = 12;
const UNLOCK_SCROLL_DELTA = 0.06; // progress user must scroll after first frame before sequence starts
const MOBILE_FIT = 1.04;
const ENSURE_STEP = 4;
// reveal-zoom: open tight on the zipper pull, ease back to full frame by REVEAL_END,
// then hold. The ONLY camera motion (breathing removed).
const REVEAL_ZOOM = 1.55; // desktop opening magnification
const REVEAL_ZOOM_MOBILE = 1.3; // gentler on small screens (sharper on lighter frames)
const FOCAL_START = { x: 0.5, y: 0.2 }; // the zipper pull (top-centre)
// Stepped pull-back: e = how far out we've pulled (0 = full close-up, 1 = full frame).
// Flat segments = HOLD (zip keeps descending while the camera waits); rising = ease-out.
const REVEAL_STOPS = [
  { at: 0.0, e: 0.0 }, // tight on the zipper pull
  { at: 0.08, e: 0.0 }, // brief intimate beat
  { at: 0.2, e: 0.5 }, // pull back → chest + stupa crest in frame
  { at: 0.4, e: 0.5 }, // HOLD — read the crest, zip descending
  { at: 0.54, e: 0.8 }, // continue pulling back
  { at: 0.68, e: 0.8 }, // hold
  { at: 0.82, e: 1.0 }, // full frame → Buddha revealed
];

// neighbour colors (must match the sections this sits between when embedded)
const INK = "#070605"; // COLORS.ink — section above (BrandStatement)
const CHARCOAL = "#100E0B"; // COLORS.charcoal — section below (StatsBand)

// left-side darkener — DISABLED: it existed to kill the warm-lit left wall in the
// old spider footage. The Buddha source is natively dark on both sides, so it's now
// redundant (it would over-crush the left). Restore the gradient below if ever needed.
const LEFT_DARKEN = "transparent";
// was: "linear-gradient(to right, rgba(7,6,5,1) 0%, rgba(7,6,5,0.97) 18%, rgba(7,6,5,0.62) 32%, rgba(7,6,5,0) 46%)"

export default function SpiderSequence({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpiderEngine | null>(null);

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);

  // Scroll gate: sequence doesn't start until frame 77 fills screen AND
  // user has deliberately scrolled UNLOCK_SCROLL_DELTA progress units past it
  const seqUnlockedRef   = useRef(false);
  const readyRef         = useRef(false);  // mirrors ready state without render lag
  const readyProgressRef = useRef(-1);     // progress snapshotted when ready first fired

  // Mirror ready into a ref so the scroll handler always sees the live value
  useEffect(() => {
    if (ready) readyRef.current = true;
  }, [ready]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Snapshot progress at the first scroll event after ready fires
    if (readyRef.current && readyProgressRef.current < 0) {
      readyProgressRef.current = p;
    }

    // Unlock once user has scrolled UNLOCK_SCROLL_DELTA past the ready snapshot
    if (!seqUnlockedRef.current) {
      if (readyProgressRef.current >= 0 && p - readyProgressRef.current >= UNLOCK_SCROLL_DELTA) {
        seqUnlockedRef.current = true;
      } else {
        return;
      }
    }

    // remap so the scrub finishes by SCRUB_END, then holds on the reveal
    engineRef.current?.setProgress(Math.min(p / SCRUB_END, 1));
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.style.filter = "contrast(1.06) saturate(1.04)";

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const cfg: SpiderConfig = {
      segments: SEGMENTS,
      pad: PAD,
      smoothing: SMOOTHING,
      window: WINDOW,
      releaseBuffer: RELEASE_BUFFER,
      readyAhead: READY_AHEAD,
      mobileFit: MOBILE_FIT,
      ensureStep: ENSURE_STEP,
      reduced,
      revealZoom: REVEAL_ZOOM,
      revealZoomMobile: REVEAL_ZOOM_MOBILE,
      revealStops: REVEAL_STOPS,
      focalStart: FOCAL_START,
    };

    const engine = new SpiderEngine(canvas, ctx, cfg, {
      onReady: () => setReady(true),
      onProgress: (n) => setLoaded(n),
    });
    engineRef.current = engine;

    const apply = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const isMobile = window.innerWidth <= 820;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      engine.setViewport(
        Math.round(window.innerWidth * dpr),
        Math.round(window.innerHeight * dpr),
        dpr,
        isMobile // small screens → contain (whole chest visible)
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
      data-cursor="scrub"
      ref={containerRef}
      style={{
        height: `${VH_TOTAL}vh`,
        position: "relative",
        // embedded: gradient matches BOTH neighbours (ink top → charcoal bottom),
        // so edges/loading never step against the sections above/below.
        background: embedded
          ? `linear-gradient(to bottom, ${INK} 0%, ${CHARCOAL} 100%)`
          : INK,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: INK,
        }}
      >
        <canvas ref={canvasRef} />
        <HeroFx />

        {/* darken the warm-lit LEFT wall so it matches the dark right side */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: LEFT_DARKEN,
          }}
        />


        {/* feather bands — only when embedded — melt the photo edges into the
            neighbour colors so there's no hard seam line at top/bottom. */}
        {embedded && (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4vh",
                background: `linear-gradient(to bottom, ${INK} 0%, rgba(7,6,5,0) 100%)`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "10vh",
                background: `linear-gradient(to top, ${CHARCOAL} 0%, rgba(16,14,11,0) 100%)`,
                pointerEvents: "none",
              }}
            />
          </>
        )}

        <SpiderText progress={scrollYProgress} embedded={embedded} />
        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: INK, // match neighbours (was #000 → a subtle step)
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
