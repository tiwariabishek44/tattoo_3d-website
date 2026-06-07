"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type LogEntry = {
  t: number;    // ms since page load
  dy: number;   // raw wheel deltaY
  vel: number;  // px/ms
  raw: number;  // rawProgress (0→1)
  disp: number; // displayProgress (0→1)
  debt: number; // raw - disp (proxy backlog)
  frame: number;
  fps: number;
};

type Metrics = {
  dy: number;
  vel: number;
  raw: number;
  disp: number;
  debt: number;
  frame: number;
  fps: number;
  entries: number;
};

const MAX_LOG = 12_000;

export default function DebugOverlay() {
  const [metrics, setMetrics] = useState<Metrics>({
    dy: 0, vel: 0, raw: 0, disp: 0, debt: 0, frame: 0, fps: 0, entries: 0,
  });

  const logRef      = useRef<LogEntry[]>([]);
  const dyRef       = useRef(0);
  const velRef      = useRef(0);
  const lastWheelTs = useRef(0);
  const lastRafTs   = useRef(0);
  const fpsRef      = useRef(0);
  const rafIdRef    = useRef(0);

  const downloadLog = useCallback(() => {
    if (!logRef.current.length) return;
    const blob = new Blob([JSON.stringify(logRef.current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `scroll-debug-${Math.floor(performance.now())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const dt  = now - lastWheelTs.current;
      velRef.current = dt > 0 && dt < 300 ? Math.abs(e.deltaY) / dt : 0;
      dyRef.current  = e.deltaY;
      lastWheelTs.current = now;
    };

    const tick = (now: DOMHighResTimeStamp) => {
      const dt   = now - lastRafTs.current;
      fpsRef.current = lastRafTs.current > 0 && dt > 0 ? 1000 / dt : 0;
      lastRafTs.current = now;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sd   = (window as any).__scrollDebug as
        { rawProgress: number; displayProgress: number; frame: number } | undefined;
      const raw  = sd?.rawProgress  ?? 0;
      const disp = sd?.displayProgress ?? 0;
      const frame = sd?.frame ?? 0;
      const debt = raw - disp;
      const fps  = fpsRef.current;

      if (logRef.current.length < MAX_LOG) {
        logRef.current.push({
          t:     Math.round(now),
          dy:    dyRef.current,
          vel:   +velRef.current.toFixed(3),
          raw:   +raw.toFixed(5),
          disp:  +disp.toFixed(5),
          debt:  +debt.toFixed(5),
          frame,
          fps:   +fps.toFixed(1),
        });
      }

      setMetrics({ dy: dyRef.current, vel: velRef.current, raw, disp, debt, frame,
        fps, entries: logRef.current.length });

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    window.addEventListener("wheel", onWheel, { passive: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "L") downloadLog();
      if (e.shiftKey && e.key === "C") { logRef.current = []; }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [downloadLog]);

  const { dy, vel, raw, disp, debt, frame, fps, entries } = metrics;
  const debtHigh  = Math.abs(debt) > 0.012;
  const fpsLow    = fps > 0 && fps < 55;
  const velHigh   = vel > 2.5;

  return (
    <div
      style={{
        position:       "fixed",
        bottom:         20,
        left:           20,
        zIndex:         9999,
        background:     "rgba(4,3,2,0.90)",
        border:         "1px solid rgba(203,164,90,0.25)",
        borderRadius:   10,
        padding:        "12px 16px",
        fontFamily:     "'JetBrains Mono', 'Fira Mono', monospace",
        fontSize:       11,
        color:          "#888",
        lineHeight:     1.85,
        minWidth:       230,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        userSelect:     "none",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ color: "#CBA45A", fontWeight: 700, letterSpacing: "0.1em", fontSize: 10 }}>
          SCROLL DEBUG
        </span>
        <span style={{
          marginLeft: "auto",
          background: entries >= MAX_LOG ? "#ff4444" : "#2a5c2a",
          color: entries >= MAX_LOG ? "#fff" : "#6fdb6f",
          fontSize: 9,
          padding: "1px 6px",
          borderRadius: 4,
          letterSpacing: "0.06em",
        }}>
          {entries >= MAX_LOG ? "FULL" : "REC"}
        </span>
      </div>

      {/* input metrics */}
      <Row label="deltaY"  value={`${dy >= 0 ? "+" : ""}${dy.toFixed(0)} px`} />
      <Row label="velocity" value={`${vel.toFixed(2)} px/ms`} hot={velHigh} />
      <Row label="fps"     value={fps.toFixed(1)}             hot={fpsLow} />

      <Divider />

      {/* proxy metrics */}
      <Row label="raw"     value={raw.toFixed(4)} />
      <Row label="display" value={disp.toFixed(4)} />
      <Row label="debt"    value={debt.toFixed(4)} hot={debtHigh} />
      <Row label="frame"   value={`${frame} / 239`} />

      <Divider />

      {/* log controls */}
      <div style={{ fontSize: 10, color: "#444", lineHeight: 1.6 }}>
        <span style={{ color: "#666" }}>{entries.toLocaleString()}</span> entries
        <br />
        <span style={{ color: "#CBA45A" }}>Shift+L</span> download ·{" "}
        <span style={{ color: "#CBA45A" }}>Shift+C</span> clear
      </div>
    </div>
  );
}

function Row({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
      <span style={{ color: "#444" }}>{label}</span>
      <span style={{ color: hot ? "#ff6b6b" : "#ddd", fontWeight: hot ? 700 : 400 }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "6px 0" }} />;
}
