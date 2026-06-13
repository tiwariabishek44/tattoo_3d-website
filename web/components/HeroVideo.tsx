"use client";

// Phase 1 (scroll-smoothness-postmortem.md): the hero machine, off the main
// thread, on an all-intra <video> the GPU decodes. Scroll maps to an EASED
// TRIANGLE, so scrolling down winds the machine R→L→R (pendulum bounce) and
// scrolling up reverses it. Pure scrub: static when idle, no autoplay, no loop
// seam, and the heavy per-frame work stays on the GPU (never on Lenis's back).

import { useEffect, useRef } from "react";
import { type MotionValue } from "framer-motion";

const SRC_WEBM = "/hero_scrub.webm"; // VP9 all-intra (primary)
const SRC_MP4  = "/hero_scrub.mp4";  // H.264 all-intra (Safari fallback)
const POSTER   = "/hero_poster.webp"; // seals the first-paint flash while the video streams

const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// scroll progress 0..1 → 0..1..0 with eased (pendulum) legs. The machine settles
// at the L extreme (p=0.5) and at both R extremes (p=0,1) instead of snapping.
const triEased = (p: number) => {
  const c = Math.max(0, Math.min(1, p));
  return c <= 0.5 ? easeInOutQuad(c / 0.5) : easeInOutQuad((1 - c) / 0.5);
};

export default function HeroVideo({ progress }: { progress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scroll → currentTime via the eased triangle (one clock). Seeks only on change
  // (no idle rAF); all-intra encode keeps each seek frame-accurate. The video
  // streams progressively (Phase 0.1 — no preloader gate); the poster covers
  // until enough is buffered to seek.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause(); // we own the playhead

    const seekTo = (p: number) => {
      const d = v.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const t = triEased(p) * d;
      if (Math.abs(t - v.currentTime) > 1 / 30) v.currentTime = t;
    };
    const onMeta = () => seekTo(progress.get());
    if (Number.isFinite(v.duration) && v.duration > 0) onMeta();
    else v.addEventListener("loadedmetadata", onMeta, { once: true });

    const unsub = progress.on("change", seekTo);
    return () => {
      unsub();
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [progress]);

  return (
    <video
      ref={videoRef}
      poster={POSTER}
      muted
      playsInline
      preload="auto"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "contrast(1.06) saturate(1.04)",
        pointerEvents: "none",
      }}
    >
      <source src={SRC_WEBM} type="video/webm" />
      <source src={SRC_MP4} type="video/mp4" />
    </video>
  );
}
