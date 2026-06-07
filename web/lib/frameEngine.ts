// Host-agnostic frame-sequence renderer.
// Runs identically on the main thread (HTMLCanvas) and inside a Web Worker
// (OffscreenCanvas). Owns: windowed off-thread decode (createImageBitmap),
// memory release (close), cover/contain draw, smoothing, idle loop.

export type EngineConfig = {
  frameCount: number;
  pad: number;
  base: string; // "/frames" or "/frames-mobile"
  legs: number; // ping-pong: R→L→R = 2
  smoothing: number;
  window: number; // frames decoded each side of current
  releaseBuffer: number;
  readyAhead: number;
  mobileFit: number;
  ensureStep: number;
  reduced: boolean; // prefers-reduced-motion
};

type Frame = ImageBitmap | HTMLImageElement;
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type AnyCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// rAF if available (main thread + most worker contexts), else a timer.
const RAF: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame !== "undefined"
    ? requestAnimationFrame.bind(globalThis)
    : (cb) => setTimeout(() => cb(0), 16) as unknown as number;
const CAF: (id: number) => void =
  typeof cancelAnimationFrame !== "undefined"
    ? cancelAnimationFrame.bind(globalThis)
    : (id) => clearTimeout(id);

const fw = (f: Frame) => (f instanceof ImageBitmap ? f.width : f.naturalWidth);
const fh = (f: Frame) => (f instanceof ImageBitmap ? f.height : f.naturalHeight);
const fReady = (f: Frame | null) =>
  !!f && (f instanceof ImageBitmap || (f.complete && f.naturalWidth > 0));
const fRelease = (f: Frame) => {
  if (f instanceof ImageBitmap) f.close();
  else f.src = "";
};

export class FrameEngine {
  private frames: (Frame | null)[];
  private inflight: boolean[];
  private ctx: CanvasRenderingContext2D;
  private target = 0;
  private current = 0;
  private center = 0;
  private lastEnsured = -999;
  private loaded = 0;
  private rafId = 0;
  private mobile = false;
  private dead = false;

  constructor(
    private canvas: AnyCanvas,
    ctx: AnyCtx,
    private cfg: EngineConfig,
    private cb: { onReady: () => void; onProgress: (n: number) => void }
  ) {
    this.ctx = ctx as CanvasRenderingContext2D;
    this.frames = new Array(cfg.frameCount).fill(null);
    this.inflight = new Array(cfg.frameCount).fill(false);
    this.ensureWindow(0);
  }

  private path(i: number) {
    return `${this.cfg.base}/frame_${String(i + 1).padStart(this.cfg.pad, "0")}.webp`;
  }

  private loadFrame(i: number) {
    if (this.frames[i] || this.inflight[i]) return;
    this.inflight[i] = true;

    const settle = (f: Frame | null) => {
      this.inflight[i] = false;
      if (!f || this.dead) {
        if (f) fRelease(f);
        return;
      }
      // Keep the frame if it's near the target window OR near what is currently
      // being displayed. During velocity cap the two can be far apart — without
      // this check, arriving frames for the active zone get discarded.
      const cur = Math.round(this.current);
      const zone = this.cfg.window + this.cfg.releaseBuffer;
      if (Math.abs(i - this.center) <= zone || Math.abs(i - cur) <= zone) {
        this.frames[i] = f;
        this.loaded++;
        this.cb.onProgress(this.loaded);
        if (this.loaded >= this.cfg.readyAhead) this.cb.onReady();
        this.kick();
      } else {
        fRelease(f);
      }
    };

    if (typeof createImageBitmap !== "undefined") {
      fetch(this.path(i))
        .then((r) => r.blob())
        .then((b) => createImageBitmap(b))
        .then(settle)
        .catch(() => {
          this.inflight[i] = false;
        });
    } else {
      const img = new Image();
      img.onload = () => settle(img);
      img.onerror = () => {
        this.inflight[i] = false;
      };
      img.src = this.path(i);
    }
  }

  private ensureWindow(center: number) {
    this.center = center;
    const { window: W, releaseBuffer: B, frameCount: N } = this.cfg;
    const lo = Math.max(0, center - W);
    const hi = Math.min(N - 1, center + W);
    for (let i = lo; i <= hi; i++) this.loadFrame(i);
    // Release zone covers both the target center (look-ahead) AND the current
    // playback position. During velocity cap these diverge; protecting both
    // prevents the buffer from evicting frames that are actively being played.
    const cur = Math.round(this.current);
    const kLo = Math.min(Math.max(0, center - W - B), Math.max(0, cur - W - B));
    const kHi = Math.max(Math.min(N - 1, center + W + B), Math.min(N - 1, cur + W + B));
    for (let i = 0; i < N; i++) {
      if ((i < kLo || i > kHi) && this.frames[i]) {
        fRelease(this.frames[i]!);
        this.frames[i] = null;
      }
    }
  }

  setViewport(width: number, height: number, _dpr: number, mobile: boolean) {
    this.mobile = mobile;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingQuality = mobile ? "low" : "high";
    this.draw();
  }

  setProgress(p: number) {
    const phase = p * this.cfg.legs;
    const tri = 1 - Math.abs((phase % 2) - 1);
    this.target = tri * (this.cfg.frameCount - 1);
    const c = Math.round(this.target);
    if (Math.abs(c - this.lastEnsured) >= this.cfg.ensureStep) {
      this.ensureWindow(c);
      this.lastEnsured = c;
    }
    this.kick();
  }

  private pick(index: number): Frame | null {
    const idx = Math.round(index);
    if (fReady(this.frames[idx])) return this.frames[idx];
    for (let d = 1; d <= this.cfg.window; d++) {
      if (fReady(this.frames[idx - d])) return this.frames[idx - d];
      if (fReady(this.frames[idx + d])) return this.frames[idx + d];
    }
    return null;
  }

  private draw() {
    const img = this.pick(this.current);
    if (!img) return;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const iw = fw(img);
    const ih = fh(img);
    const scale = this.mobile
      ? Math.min(cw / iw, ch / ih) * this.cfg.mobileFit
      : Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  private settled() {
    return Math.abs(this.target - this.current) < 0.001;
  }

  private tick = () => {
    if (this.cfg.reduced) {
      this.current = this.target;
    } else {
      this.current += (this.target - this.current) * this.cfg.smoothing;
      if (this.settled()) this.current = this.target;
    }
    this.draw();
    if (this.settled()) {
      this.rafId = 0;
      return;
    }
    this.rafId = RAF(this.tick);
  };

  getFrame(): number {
    return Math.round(this.current);
  }

  private kick() {
    if (!this.rafId && !this.dead) this.rafId = RAF(this.tick);
  }

  destroy() {
    this.dead = true;
    if (this.rafId) CAF(this.rafId);
    this.frames.forEach((f, i) => {
      if (f) fRelease(f);
      this.frames[i] = null;
    });
  }
}
