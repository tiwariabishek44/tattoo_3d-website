"use client";

// Phase 1 (scroll-smoothness-postmortem.md): the hero machine, off the main
// thread, SCROLL-SCRUBBED both ways. Replaces the 240-frame main-thread canvas
// (MachineLoopEngine) with an all-intra <video> (every frame a keyframe) that the
// GPU decodes — scroll position maps straight to currentTime, so scrolling down
// winds the machine forward and scrolling up reverses it. No autoplay, no loop
// seam, and the heavy per-frame work stays off the main thread (off Lenis's back).

import { useEffect, useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

const SRC_WEBM = "/hero_scrub.webm"; // VP9 all-intra (primary)
const SRC_MP4  = "/hero_scrub.mp4";  // H.264 all-intra (Safari fallback)
const POSTER   = "/hero_poster.webp"; // seals the first-paint flash

export default function HeroVideo({ progress }: { progress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Subtle projection push-in the old canvas baked in (1.0 -> 1.20), now a
  // compositor-only transform that rides the same scroll progress.
  const scale = useTransform(progress, [0, 1], [1, 1.2]);

  // Scroll → currentTime. Driven by the same eased progress MotionValue (one
  // clock); seeks fire only on scroll change, never on an idle rAF. The all-intra
  // encode makes each seek independent (~frame-accurate), so this scrubs smoothly
  // both directions without queueing long-GOP decodes.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause(); // we own the playhead now

    const seekTo = (p: number) => {
      const d = v.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const t = Math.max(0, Math.min(d, p * d));
      // Skip sub-frame nudges (~1/30s) to avoid thrashing the decoder.
      if (Math.abs(t - v.currentTime) > 1 / 30) v.currentTime = t;
    };

    // Land the correct frame as soon as metadata (duration) is known.
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
    <motion.video
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
        scale,                       // GPU-composited zoom (framer MotionValue)
        filter: "contrast(1.06) saturate(1.04)", // matches old canvas grade
        pointerEvents: "none",
      }}
    >
      <source src={SRC_WEBM} type="video/webm" />
      <source src={SRC_MP4} type="video/mp4" />
    </motion.video>
  );
}
