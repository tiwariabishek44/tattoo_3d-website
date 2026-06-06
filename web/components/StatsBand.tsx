"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SERIF, SANS, COLORS } from "@/lib/theme";

const STATS = [
  { value: 12, suffix: "+", label: "Years of craft" },
  { value: 8, suffix: "", label: "Resident artists" },
  { value: 5000, suffix: "+", label: "Pieces inked" },
  { value: 30, suffix: "+", label: "Awards & features" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let startTs = 0;
    const dur = 1400;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsBand() {
  return (
    <section
      style={{
        background: COLORS.charcoal,
        padding: "clamp(64px, 10vh, 130px) clamp(24px, 5vw, 96px)",
        borderTop: "1px solid rgba(203,164,90,0.14)",
        borderBottom: "1px solid rgba(203,164,90,0.14)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "clamp(32px, 4vw, 64px)",
          textAlign: "center",
        }}
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.8rem, 5vw, 4.6rem)",
                lineHeight: 1,
                color: COLORS.gold,
              }}
            >
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div
              style={{
                fontFamily: SANS,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.78rem",
                color: COLORS.muted,
                marginTop: "1rem",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
