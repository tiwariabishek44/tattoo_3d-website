"use client";

// "Design 2" — the spider/Buddha story. The frame sequence is now a scroll-scrubbed
// all-intra <video> (BuddhaVideo), off the main thread — same upgrade as the hero
// (scroll-smoothness-postmortem.md Phase 1b). The SpiderEngine/ScrollPhysics canvas
// stack is retired here; the cinematic reveal it used to draw is reproduced exactly
// inside BuddhaVideo as a GPU transform. useScroll drives both SpiderText and the
// video — one progress source for the section.

import { useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import SpiderText from "@/components/SpiderText";
import HeroFx from "@/components/HeroFx";
import BuddhaVideo from "@/components/BuddhaVideo";
import { SPIDER_VH, getDesktopSectionHeight } from "@/lib/scrollBudget";

const INK      = "#070605";
const CHARCOAL = "#100E0B";
const LEFT_DARKEN = "transparent";

export default function SpiderSequence({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 820);
    const handleResize = () => setIsDesktop(window.innerWidth > 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // One progress source for the section — drives SpiderText AND BuddhaVideo
  // (scrub + reveal). 0→1 over the full pinned scroll-through.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      data-cursor="scrub"
      ref={containerRef}
      style={{
        height: isDesktop ? `${getDesktopSectionHeight(SPIDER_VH)}px` : `${SPIDER_VH}vh`,
        position: "relative",
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
        <BuddhaVideo progress={scrollYProgress} mobile={!isDesktop} />
        <HeroFx />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: LEFT_DARKEN,
          }}
        />

        {/* Feather bands — only when embedded — melt photo edges into neighbours */}
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
      </div>
    </div>
  );
}
