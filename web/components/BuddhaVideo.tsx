"use client";

// Phase 1b (scroll-smoothness-postmortem.md): the Buddha unzip, same treatment as
// the hero — an all-intra <video> scrubbed by scroll, off the main thread. The
// cinematic reveal (open tight 1.55× on the zipper pull, hold, ease back to full
// frame) was the SpiderEngine's canvas camera; it is reproduced EXACTLY here as a
// GPU transform (scale + transform-origin) driven by the same scroll progress, so
// the story beat is byte-for-byte the same — only the renderer changed.

import { useEffect, useRef } from "react";
import {
  motion,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";

const SRC_WEBM = "/buddha_scrub.webm"; // VP9 all-intra (frames 77→185)
const SRC_MP4  = "/buddha_scrub.mp4";  // H.264 all-intra (Safari fallback)

// --- Reveal contract (from the old SpiderEngine; edge holds trimmed in Phase 5
// to remove dead-scroll at the section seams — see scroll-smoothness-postmortem.md).
const SCRUB_START = 0.06; // brief opening beat, then frames begin (was 0.15)
const SCRUB_END   = 0.93; // frames complete; short reveal hold to the seam (was 0.82)
const REVEAL_ZOOM        = 1.55;
const REVEAL_ZOOM_MOBILE = 1.3;
const FOCAL_START = { x: 0.5, y: 0.2 }; // the zipper-pull point we open on
const REVEAL_STOPS = [
  { at: 0.0,  e: 0.0 },
  { at: 0.15, e: 0.0 },
  { at: 0.25, e: 0.5 },
  { at: 0.45, e: 0.5 },
  { at: 0.58, e: 0.8 },
  { at: 0.70, e: 0.8 },
  { at: 0.82, e: 1.0 },
];

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// pull-out fraction e over the stepped reveal keyframes (eased between, flats = holds)
function pullFraction(norm: number, stops: { at: number; e: number }[]) {
  if (!stops.length) return norm >= 1 ? 1 : norm;
  if (norm <= stops[0].at) return stops[0].e;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (norm >= a.at && norm <= b.at) {
      const t = (norm - a.at) / (b.at - a.at);
      return a.e + (b.e - a.e) * easeInOutCubic(t);
    }
  }
  return stops[stops.length - 1].e;
}

const toNorm = (p: number) =>
  Math.max(0, Math.min(1, (p - SCRUB_START) / (SCRUB_END - SCRUB_START)));

export default function BuddhaVideo({
  progress,
  mobile,
}: {
  progress: MotionValue<number>;
  mobile: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rz = mobile ? REVEAL_ZOOM_MOBILE : REVEAL_ZOOM;

  // Camera: zoom = lerp(rz → 1.0) over e; focal eases from the zipper pull to centre.
  const scale = useTransform(progress, (p) => {
    const e = pullFraction(toNorm(p), REVEAL_STOPS);
    return rz + (1 - rz) * e;
  });
  const originX = useTransform(progress, (p) => {
    const e = pullFraction(toNorm(p), REVEAL_STOPS);
    return (FOCAL_START.x + (0.5 - FOCAL_START.x) * e) * 100;
  });
  const originY = useTransform(progress, (p) => {
    const e = pullFraction(toNorm(p), REVEAL_STOPS);
    return (FOCAL_START.y + (0.5 - FOCAL_START.y) * e) * 100;
  });
  const transformOrigin = useMotionTemplate`${originX}% ${originY}%`;

  // Scroll → currentTime, mapped through the same scrub window. Seeks only on
  // change (no idle rAF); all-intra encode keeps each seek frame-accurate. The
  // video streams progressively (Phase 0.1 — no preloader gate).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    const seekTo = (p: number) => {
      const d = v.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const t = toNorm(p) * d;
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
    <motion.video
      ref={videoRef}
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
        scale,
        transformOrigin,
        filter: "contrast(1.06) saturate(1.04)", // matches old canvas grade
        pointerEvents: "none",
      }}
    >
      <source src={SRC_WEBM} type="video/webm" />
      <source src={SRC_MP4} type="video/mp4" />
    </motion.video>
  );
}
