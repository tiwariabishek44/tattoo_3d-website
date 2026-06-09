"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { SERIF, SANS, COLORS, eyebrow } from "@/lib/theme";

const STUDIO_IMG = "/studio_image.jpeg";

// ── Escape-velocity gate constants ───────────────────────
const GATE_VEL_LOW  = 1.5;   // px/ms — below: passive hold is enough
const GATE_VEL_HIGH = 8.0;   // px/ms — above: deliberate fast scroll → governed glide (see below)
const HOLD_MS_DOWN  = 1500;  // ms — downward entry hold (arriving from hero)
const HOLD_MS_UP    = 1800;  // ms — upward entry hold (arriving from Buddha — more reflective)
const VEL_DECAY_MS  = 200;   // ms — treat velocity as 0 if no recent wheel event
const GOVERN_MAX_DELTA = 32; // px per wheel tick — extreme-velocity clamp: keeps the
                             // page moving (never frozen) but slow enough that the
                             // section is actually rendered/seen, not blown past in a blink
// ─────────────────────────────────────────────────────────

const PROOF = [
  { mark: "★ 4.9", label: "Google Reviews" },
  { mark: "Top Rated", label: "TripAdvisor" },
  { mark: "500+", label: "Pieces inked since 2015" },
];

const COLUMN = "min(640px, 50vw)";

export default function BrandStatement() {
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const velRef         = useRef(0);
  const lastWheelTsRef = useRef(0);
  const directionRef   = useRef<"down" | "up">("down");

  // Down gate refs
  const downActiveRef   = useRef(false);
  const downTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downListenerRef = useRef<((e: WheelEvent) => void) | null>(null);

  // Up gate refs
  const upActiveRef     = useRef(false);
  const upTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upListenerRef   = useRef<((e: WheelEvent) => void) | null>(null);

  useEffect(() => {
    // ── Release helpers ───────────────────────────────────
    const releaseDown = () => {
      if (!downActiveRef.current) return;
      downActiveRef.current = false;
      if (downTimerRef.current) { clearTimeout(downTimerRef.current); downTimerRef.current = null; }
      if (downListenerRef.current) {
        document.removeEventListener("wheel", downListenerRef.current);
        downListenerRef.current = null;
      }
    };

    const releaseUp = () => {
      if (!upActiveRef.current) return;
      upActiveRef.current = false;
      if (upTimerRef.current) { clearTimeout(upTimerRef.current); upTimerRef.current = null; }
      if (upListenerRef.current) {
        document.removeEventListener("wheel", upListenerRef.current);
        upListenerRef.current = null;
      }
    };

    // ── Downward gate (arriving from hero) ────────────────
    const fireDownGate = () => {
      if (downActiveRef.current) return;
      downActiveRef.current = true;
      let lastTs = performance.now();

      const listener = (e: WheelEvent) => {
        if (e.deltaY <= 0) { releaseDown(); return; } // upward scroll — release
        const now = performance.now();
        const dt = now - lastTs; lastTs = now;
        const vel = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
        e.preventDefault();
        if (vel >= GATE_VEL_HIGH) {
          // governed glide — a hard fling shouldn't blow the section past in
          // a blink. Keep the page moving (don't freeze it), just clamp the
          // per-tick distance so every frame of the section is actually seen.
          window.scrollBy({ top: Math.min(e.deltaY, GOVERN_MAX_DELTA), left: 0 });
        }
        // else: pure hold — within the lock zone, freeze in place
      };

      downListenerRef.current = listener;
      document.addEventListener("wheel", listener, { passive: false });
      downTimerRef.current = setTimeout(releaseDown, HOLD_MS_DOWN);
    };

    // ── Upward gate (arriving from Buddha) ───────────────
    const fireUpGate = () => {
      if (upActiveRef.current) return;
      upActiveRef.current = true;
      let lastTs = performance.now();

      const listener = (e: WheelEvent) => {
        if (e.deltaY > 0) { releaseUp(); return; } // downward scroll — release
        const now = performance.now();
        const dt = now - lastTs; lastTs = now;
        const vel = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
        e.preventDefault();
        if (vel >= GATE_VEL_HIGH) {
          window.scrollBy({ top: Math.max(e.deltaY, -GOVERN_MAX_DELTA), left: 0 });
        }
      };

      upListenerRef.current = listener;
      document.addEventListener("wheel", listener, { passive: false });
      upTimerRef.current = setTimeout(releaseUp, HOLD_MS_UP);
    };

    // ── Explicit boundary-crossing detection — bidirectional ──
    // Fires on all FOUR transitions (enter-from-hero, exit-into-Buddha,
    // enter-from-Buddha, exit-into-hero), driven directly by wheel events so
    // fast scrolls can't skip a crossing the way IntersectionObserver could
    // (its threshold callbacks can be batched/coalesced at speed — and it only
    // ever reliably reports a section newly BECOMING visible, never leaving).
    let prevTop: number | null = null;
    let prevBottom: number | null = null;

    const maybeGate = (dirNeeded: "down" | "up", fire: () => void) => {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const isMobile = window.innerWidth < 820;
      if (reduced || isMobile) return;
      if (directionRef.current !== dirNeeded) return;
      if (velRef.current < GATE_VEL_LOW) return; // gentle scroll — no gate needed
      // NOTE: extreme velocity (>= GATE_VEL_HIGH) ALSO fires the gate — the
      // listener switches to governed-glide mode for it (see fireDownGate/fireUpGate).
      fire();
    };

    const trackVel = (e: WheelEvent) => {
      const now = performance.now();
      const dt  = now - lastWheelTsRef.current;
      velRef.current = dt > 0 && dt < VEL_DECAY_MS * 2 ? Math.abs(e.deltaY) / dt : 0;
      lastWheelTsRef.current = now;
      directionRef.current = e.deltaY > 0 ? "down" : "up";

      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      if (prevTop !== null && prevBottom !== null) {
        if (prevTop >= vh && rect.top < vh)     maybeGate("down", fireDownGate); // entering from above (from hero)
        if (prevTop < vh && rect.top >= vh)     maybeGate("up", fireUpGate);     // exiting upward (into hero)
        if (prevBottom >= 0 && rect.bottom < 0) maybeGate("down", fireDownGate); // exiting downward (into Buddha)
        if (prevBottom < 0 && rect.bottom >= 0) maybeGate("up", fireUpGate);     // entering from below (from Buddha)
      }
      prevTop = rect.top;
      prevBottom = rect.bottom;
    };
    window.addEventListener("wheel", trackVel, { passive: true });

    // ── Tab-hide cleanup ──────────────────────────────────
    const onVisibilityChange = () => {
      if (document.hidden) { releaseDown(); releaseUp(); }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("wheel", trackVel);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      releaseDown();
      releaseUp();
    };
  }, []);

  return (
    // 250vh wrapper — 150vh of passive scroll budget in both directions
    <div id="about" ref={wrapperRef} style={{ height: "250vh", position: "relative" }}>
      <section
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          backgroundImage: `url(${STUDIO_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* scrim — dark left → clear right, mirrors HeroText grammar */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(7,6,5,0.88) 0%, rgba(7,6,5,0.6) 36%, rgba(7,6,5,0.12) 70%, rgba(7,6,5,0) 100%), linear-gradient(to top, rgba(7,6,5,0.5) 0%, rgba(7,6,5,0) 38%)",
          }}
        />

        {/* bottom feather — bleeds INK upward so the joint with SpiderSequence dissolves */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "11%",
            background: "linear-gradient(to top, rgba(7,6,5,1) 0%, rgba(7,6,5,0) 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, padding: "0 clamp(28px, 6vw, 110px)" }}>
          <div style={{ width: COLUMN, flexShrink: 0 }}>
            <Reveal variant="rule">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem" }}>
                <span style={{ width: 34, height: 1, background: COLORS.gold }} />
                <span style={eyebrow()}>Abishek&apos;s Tattoo Ink</span>
              </div>
            </Reveal>

            <Reveal delay={0.08} variant="heading">
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 500,
                  fontSize: "clamp(2.4rem, 4.6vw, 4.6rem)",
                  lineHeight: 1.08,
                  color: COLORS.offWhite,
                  margin: 0,
                  textShadow: "0 2px 26px rgba(0,0,0,0.6)",
                }}
              >
                Where <span style={{ color: COLORS.gold }}>traditional Nepali motifs</span>{" "}
                meet <span style={{ color: COLORS.gold }}>modern ink.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.16} variant="body">
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
                  lineHeight: 1.7,
                  color: "rgba(242,239,233,0.8)",
                  marginTop: "1.6rem",
                  maxWidth: "50ch",
                  textShadow: "0 1px 16px rgba(0,0,0,0.5)",
                }}
              >
                Abishek Tattoo Ink is built on a simple belief — that a tattoo is
                a decision worth honouring. Step inside and you&apos;ll feel it:
                Kathmandu&apos;s living heritage sitting easily beside raw,
                contemporary expression — exactly how we work, and exactly how
                it lives on your skin.
              </p>
            </Reveal>

            <Reveal delay={0.24} variant="stat">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "clamp(16px, 2vw, 28px)",
                  marginTop: "clamp(28px, 4vh, 46px)",
                }}
              >
                {PROOF.flatMap((p, i) => [
                  ...(i > 0
                    ? [
                        <span
                          key={`div-${i}`}
                          aria-hidden
                          style={{ width: 1, height: 22, background: "rgba(203,164,90,0.32)" }}
                        />,
                      ]
                    : []),
                  <div key={p.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 600,
                        fontSize: "1.2rem",
                        color: COLORS.gold,
                        textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                      }}
                    >
                      <CountUp value={p.mark} />
                    </span>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: "0.86rem",
                        letterSpacing: "0.03em",
                        color: "rgba(242,239,233,0.72)",
                        textShadow: "0 1px 14px rgba(0,0,0,0.55)",
                      }}
                    >
                      {p.label}
                    </span>
                  </div>,
                ])}
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: "0.84rem",
                  letterSpacing: "0.04em",
                  color: "rgba(242,239,233,0.55)",
                  marginTop: "1.15rem",
                  textShadow: "0 1px 14px rgba(0,0,0,0.5)",
                }}
              >
                Thamel, Kathmandu — open by appointment
              </div>
            </Reveal>

            <Reveal delay={0.36}>
              {/* B3 — CTA now answers the pointer: border + fill brighten and the
                  arrow nudges on hover (variant propagates parent → arrow). */}
              <motion.a
                href="/#contact"
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  rest: {
                    backgroundColor: "rgba(203,164,90,0.1)",
                    borderColor: "rgba(203,164,90,0.55)",
                  },
                  hover: {
                    backgroundColor: "rgba(203,164,90,0.22)",
                    borderColor: "rgba(203,164,90,0.9)",
                  },
                  tap: { scale: 0.98 },
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: SANS,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: COLORS.gold,
                  borderWidth: 1,
                  borderStyle: "solid",
                  padding: "1rem 1.8rem",
                  borderRadius: 999,
                  textDecoration: "none",
                  marginTop: "2rem",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                Get studio tour
                <motion.span
                  aria-hidden
                  variants={{ hover: { x: 4 } }}
                  style={{ fontSize: "0.9rem" }}
                >
                  ↗
                </motion.span>
              </motion.a>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
