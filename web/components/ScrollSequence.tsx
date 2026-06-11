"use client";

// DESKTOP hero (route: "/"). The machine now plays as a GPU-composited <video>
// (HeroVideo) instead of a main-thread 240-frame canvas — see Phase 1 of
// scroll-smoothness-postmortem.md. The hero is a 200vh scroll-through with the
// video pinned (sticky); HeroText's local progress (0-1 over that range) drives
// the two-slogan handoff, and the video gets a subtle parallax zoom. A single
// useScroll instance feeds both consumers (one clock for the hero).

import { useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import HeroText from "@/components/HeroText";
import HeroFx from "@/components/HeroFx";
import HeroVideo from "@/components/HeroVideo";
import { HERO_VH, getDesktopSectionHeight } from "@/lib/scrollBudget";

const OVERLAY_OPACITY = 0.05;

export default function ScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 820);
    const handleResize = () => setIsDesktop(window.innerWidth > 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 0 -> 1 over the full pinned phase (one viewport-height of scroll). Drives
  // both HeroText's exit and the HeroVideo parallax zoom — one MotionValue.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      id="top"
      ref={containerRef}
      style={{
        height: isDesktop ? `${getDesktopSectionHeight(HERO_VH)}px` : `${HERO_VH}vh`,
        position: "relative",
      }}
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
        <HeroVideo progress={scrollYProgress} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0, 0, 0, ${OVERLAY_OPACITY})`,
            pointerEvents: "none",
          }}
        />
        {/* Corner vignette — masks sparkle artifact baked into source frames */}
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
      </div>
    </div>
  );
}
