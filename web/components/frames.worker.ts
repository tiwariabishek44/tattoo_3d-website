// Web Worker: renders the frame scrub off the main thread via OffscreenCanvas.
// Receives the transferred canvas + config, then scroll/resize messages.
import { FrameEngine, EngineConfig } from "../lib/frameEngine";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (m: unknown) => void;
};

let engine: FrameEngine | null = null;

ctx.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === "init") {
    const canvas: OffscreenCanvas = m.canvas;
    const c2d = canvas.getContext("2d");
    if (!c2d) return;
    engine = new FrameEngine(canvas, c2d, m.cfg as EngineConfig, {
      onReady: () => ctx.postMessage({ type: "ready" }),
      onProgress: (n) => ctx.postMessage({ type: "progress", loaded: n }),
    });
    engine.setViewport(m.width, m.height, m.dpr, m.mobile);
    engine.setProgress(0);
  } else if (m.type === "scroll") {
    engine?.setProgress(m.progress);
  } else if (m.type === "resize") {
    engine?.setViewport(m.width, m.height, m.dpr, m.mobile);
  }
};
