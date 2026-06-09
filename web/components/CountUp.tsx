"use client";

// A5 — count-up numbers. The ARRIVAL of a number is the story, so proof metrics
// roll from 0 to target when they enter view (easeOutCubic, ~1.8s) instead of
// just appearing finished. Parses the numeric core out of strings like "★ 4.9"
// or "500+", preserving prefix/suffix and decimal places. Non-numeric values
// (e.g. "Top Rated") render as-is. Reduced-motion snaps to final. Fires once.
// Reusable: proof row, artist stats, any future "by the numbers" band.
// SSOT: web/HOMEPAGE_FRAGRANCE_PLAN.md (A5).

import { useEffect, useRef, useState } from "react";

type Parsed = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
};

function parse(raw: string): Parsed | null {
  const m = raw.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const numStr = m[2].replace(/,/g, "");
  return {
    prefix: m[1] ?? "",
    suffix: m[3] ?? "",
    target: parseFloat(numStr),
    decimals: numStr.includes(".") ? numStr.split(".")[1].length : 0,
    grouped: m[2].includes(","),
  };
}

function format(n: number, p: Parsed): string {
  const fixed = n.toFixed(p.decimals);
  const withGroups = p.grouped
    ? Number(fixed).toLocaleString("en-US", {
        minimumFractionDigits: p.decimals,
        maximumFractionDigits: p.decimals,
      })
    : fixed;
  return `${p.prefix}${withGroups}${p.suffix}`;
}

export default function CountUp({
  value,
  duration = 1.8,
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parse(value);
  const [display, setDisplay] = useState<string>(
    parsed ? format(0, parsed) : value
  );

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) {
      setDisplay(format(parsed.target, parsed));
      return;
    }

    let raf = 0;
    let start = 0;
    let done = false;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done) return;
        done = true;
        io.disconnect();
        const tick = (t: number) => {
          if (!start) start = t;
          const p = Math.min(1, (t - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setDisplay(format(parsed.target * eased, parsed));
          if (p < 1) raf = requestAnimationFrame(tick);
          else setDisplay(format(parsed.target, parsed));
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{parsed ? display : value}</span>;
}
