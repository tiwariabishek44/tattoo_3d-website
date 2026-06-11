"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // check user preference for reduced motion
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) return;

    let targetLerp = 0.13;
    let currentLerp = 0.13;

    // Lenis is the page's ONE smoothing layer (scroll-engine-fix-plan.md §2):
    // frames, text, sticky sections all read its eased output. lerp mode (not
    // duration) — exponential damping feels physical and settles in < 1s,
    // where the old duration:1.2 easeOutExpo glided for ~2.5s after input
    // stopped, leaving the canvas visibly dead while the page still moved.
    // This lerp value is THE feel knob for the whole page.
    const lenis = new Lenis({
      lerp: targetLerp,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis; // Expose globally for other components (like scroll gates)

    // Detect wheel events dynamically to classify active input device type (passive).
    // Primary signal is the platform's own deltaMode; the delta/timing heuristics
    // are only the tiebreaker for pixel-mode devices (trackpad vs free-spin mouse).
    const wheelHistory: { deltaY: number; time: number; mode: number }[] = [];
    const handleWheelDetection = (e: WheelEvent) => {
      const now = performance.now();
      const deltaY = e.deltaY;
      if (deltaY === 0) return;

      wheelHistory.push({ deltaY, time: now, mode: e.deltaMode });
      if (wheelHistory.length > 6) {
        wheelHistory.shift();
      }

      if (wheelHistory.length >= 3) {
        // 0. PLATFORM TRUTH (primary). deltaMode === 1 (DOM_DELTA_LINE) is the
        // browser telling us this is a classic notched mouse wheel — no heuristic
        // beats this. Only pixel-mode (deltaMode === 0) input is ambiguous.
        const allLineMode = wheelHistory.every((h) => h.mode === 1);

        // ONE canonical pace — the mouse's buttery, deliberate glide — imposed on
        // every device. The classifier no longer gives the trackpad a "native"
        // snappy feel (that read as too FAST); instead it pulls the trackpad toward
        // the mouse: a heavy lerp PLUS a dampened wheelMultiplier so a momentum
        // flick travels a deliberate distance, not a fling through the story.
        if (allLineMode) {
          targetLerp = 0.08;                       // classic mouse wheel — the gold feel
          lenis.options.wheelMultiplier = 1.0;
        } else {
          // Pixel-mode stream — disambiguate trackpad from a free-spin/precision
          // mouse (which also reports pixel deltas) via the delta/timing signature.

          // 1. Fractional deltas are a standard signature for trackpads / magic mouse
          const hasFractional = wheelHistory.some((h) => h.deltaY % 1 !== 0);

          // 2. Continuous extremely small scroll deltas (pixel offsets)
          const allVerySmall = wheelHistory.every((h) => Math.abs(h.deltaY) < 15);

          // 3. High-frequency updates (time interval < 14ms)
          let totalInterval = 0;
          for (let i = 1; i < wheelHistory.length; i++) {
            totalInterval += (wheelHistory[i].time - wheelHistory[i - 1].time);
          }
          const avgInterval = totalInterval / (wheelHistory.length - 1);
          const isHighFrequency = avgInterval < 14;

          const isTrackpad = hasFractional || (allVerySmall && isHighFrequency);

          if (isTrackpad) {
            targetLerp = 0.12;                     // glide like the mouse (was 0.28 = too fast/light)
            lenis.options.wheelMultiplier = 0.65;  // dampen momentum over-travel → deliberate pace
          } else {
            targetLerp = 0.08;                     // free-spin/precision mouse — treat as a wheel
            lenis.options.wheelMultiplier = 1.0;
          }
        }
      }
    };

    window.addEventListener("wheel", handleWheelDetection, { passive: true });

    let rafId: number;
    const raf = (time: number) => {
      // Dynamic easing transition: smoothly shift the current lerp value to target
      currentLerp += (targetLerp - currentLerp) * 0.1;
      (lenis as any).options.lerp = currentLerp;

      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Smooth scroll navigation anchors
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      // Check if it's a hash link pointing to this page or just hash
      if (href && (href.startsWith("#") || href.includes("/#"))) {
        const hash = href.split("#")[1];
        if (hash) {
          const el = document.getElementById(hash);
          if (el) {
            e.preventDefault();
            lenis.scrollTo(el, { offset: 0, duration: 1.2 });
          }
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("wheel", handleWheelDetection);
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}
