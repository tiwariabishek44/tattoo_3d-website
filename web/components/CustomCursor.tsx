"use client";

// A3 — the invisible hand. A dot + trailing ring that replace the default
// arrow: gold + enlarged over anything interactive, a wider "scrub" ring over
// scroll-driven sections (so the user KNOWS to drag/scroll there). Self-disables
// on touch / coarse pointers; snaps instead of trailing under reduced-motion.
// SSOT: web/HOMEPAGE_FRAGRANCE_PLAN.md (A3).

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, [role="button"], input, label, [data-cursor="link"]';

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia?.("(pointer: fine)").matches ?? false;
    if (!fine) return; // touch / stylus-coarse → leave the native cursor alone

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const LERP = reduced ? 1 : 0.2; // snap vs. trail

    document.documentElement.classList.add("has-custom-cursor");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let raf = 0;

    const loop = () => {
      rx += (tx - rx) * LERP;
      ry += (ty - ry) * LERP;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const setState = (s: string) => {
      ring.dataset.state = s;
      dot.dataset.state = s;
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      ring.style.opacity = "1";
      dot.style.opacity = "1";
      const t = e.target as Element | null;

      const isOverLight = t?.closest("#gallery") ||
                          t?.closest("#testimonials") ||
                          t?.closest(".story-gallery-scroll") ||
                          t?.closest('[style*="background: rgb(241, 234, 221)"]') ||
                          t?.closest('[style*="background: #F1EADD"]') ||
                          t?.closest('[style*="background: rgb(255, 255, 255)"]') ||
                          t?.closest('[style*="background: #ffffff"]');

      if (isOverLight) {
        ring.classList.add("light-bg");
        dot.classList.add("light-bg");
      } else {
        ring.classList.remove("light-bg");
        dot.classList.remove("light-bg");
      }

      if (t?.closest(INTERACTIVE)) setState("link");
      else if (t?.closest('[data-cursor="scrub"]')) setState("scrub");
      else setState("default");
    };
    const onDown = () => { ring.dataset.pressed = "1"; };
    const onUp = () => { ring.dataset.pressed = "0"; };
    const onLeave = () => { ring.style.opacity = "0"; dot.style.opacity = "0"; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
