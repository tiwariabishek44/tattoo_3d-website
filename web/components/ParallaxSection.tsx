"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { SERIF, SANS, COLORS, frame } from "@/lib/theme";

// Placeholder gallery — frame images stand in for real tattoo work for now.
const CARDS = [
  { label: "Fine Line", img: frame(30), speed: 150, offset: 0 },
  { label: "Neo-Traditional", img: frame(120), speed: 90, offset: 70 },
  { label: "Blackwork", img: frame(210), speed: 180, offset: 24 },
];

function Card({
  progress,
  label,
  img,
  speed,
  offset,
}: {
  progress: MotionValue<number>;
  label: string;
  img: string;
  speed: number;
  offset: number;
}) {
  const y = useTransform(progress, [0, 1], [speed, -speed]);
  return (
    <motion.div
      style={{
        y,
        marginTop: offset,
        width: "clamp(240px, 24vw, 360px)",
        aspectRatio: "3 / 4",
        border: "1px solid rgba(203,164,90,0.4)",
        borderRadius: 4,
        backgroundImage: `linear-gradient(to top, rgba(7,8,10,0.85) 0%, rgba(7,8,10,0.1) 55%), url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "flex-end",
        padding: "22px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: "0.74rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.gold,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

export default function ParallaxSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const headY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        background: COLORS.ink,
        overflow: "hidden",
        minHeight: "125vh",
        padding: "clamp(90px, 16vh, 220px) clamp(24px, 4vw, 80px)",
      }}
    >
      <motion.div
        style={{
          y: bgY,
          position: "absolute",
          top: "24%",
          left: "50%",
          x: "-50%",
          fontFamily: SERIF,
          fontWeight: 500,
          fontSize: "clamp(8rem, 26vw, 26rem)",
          color: "rgba(203,164,90,0.06)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        Gallery
      </motion.div>

      <motion.div
        style={{
          y: headY,
          position: "relative",
          textAlign: "center",
          marginBottom: "clamp(48px, 9vh, 110px)",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: COLORS.gold,
            marginBottom: "1.2rem",
          }}
        >
          Selected Work
        </div>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(2.6rem, 5.5vw, 6rem)",
            lineHeight: 1.05,
            color: COLORS.offWhite,
            margin: 0,
          }}
        >
          Ink that tells your story.
        </h2>
      </motion.div>

      <div
        style={{
          position: "relative",
          display: "flex",
          gap: "clamp(20px, 3vw, 56px)",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {CARDS.map((c) => (
          <Card key={c.label} progress={scrollYProgress} {...c} />
        ))}
      </div>
    </section>
  );
}
