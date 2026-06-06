// Dedicated renderer for the "Design 2" spider story.
// Like FrameEngine, but FORWARD-PLAY (no ping-pong) across MULTIPLE segments
// (beat 1 → beat 3) stitched into one continuous scrub. Kept separate from
// FrameEngine so the machine hero ("/") is never at risk.

export type Segment = {
  base: string;
  count: number; // number of frames to use
  start?: number; // first frame number to use (1-based), default 1
}; // e.g. { base: "/frames-beat1", start: 70, count: 116 }

export type SpiderConfig = {
  segments: Segment[];
  pad: number;
  smoothing: number;
  window: number; // frames decoded each side of current
  releaseBuffer: number;
  readyAhead: number;
  mobileFit: number;
  ensureStep: number;
  reduced: boolean;
  revealZoom: number; // opening close-up magnification (desktop), e.g. 2.2
  revealZoomMobile: number; // gentler close-up on small screens, e.g. 1.5
  // stepped pull-back: keyframes of norm → pull-fraction e (0 = full close-up, 1 = full
  // frame). Eased (easeInOut) between keyframes; equal consecutive e = a HOLD.
  revealStops: { at: number; e: number }[];
  focalStart: { x: number; y: number }; // the point we open on (zipper pull), normalized 0..1
};

type Frame = ImageBitmap | HTMLImageElement;

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

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Piecewise pull-back fraction over the stepped reveal keyframes (eased between,
// flat segments = holds).
function pullFraction(norm: number, stops: { at: number; e: number }[]) {
  if (!stops.length) return norm >= 1 ? 1 : norm;
  if (norm <= stops[0].at) return stops[0].e;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (norm <= b.at) {
      if (b.at <= a.at) return b.e;
      const t = (norm - a.at) / (b.at - a.at);
      return a.e + (b.e - a.e) * easeInOutCubic(t);
    }
  }
  return stops[stops.length - 1].e;
}

export class SpiderEngine {
  private frames: (Frame | null)[];
  private inflight: boolean[];
  private offsets: number[]; // cumulative start index per segment
  private total: number;
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
    private canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    private cfg: SpiderConfig,
    private cb: { onReady: () => void; onProgress: (n: number) => void }
  ) {
    this.ctx = ctx;
    this.offsets = [];
    let acc = 0;
    for (const s of cfg.segments) {
      this.offsets.push(acc);
      acc += s.count;
    }
    this.total = acc;
    this.frames = new Array(this.total).fill(null);
    this.inflight = new Array(this.total).fill(false);
    this.ensureWindow(0);
  }

  // Resolve a global index → "/frames-beatX/frame_000123.webp"
  private path(i: number) {
    let seg = 0;
    while (seg < this.cfg.segments.length - 1 && i >= this.offsets[seg + 1]) seg++;
    const s = this.cfg.segments[seg];
    const local = i - this.offsets[seg] + (s.start ?? 1); // frame number within the segment
    return `${s.base}/frame_${String(local).padStart(this.cfg.pad, "0")}.webp`;
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
      if (Math.abs(i - this.center) <= this.cfg.window + this.cfg.releaseBuffer) {
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
    const { window: W, releaseBuffer: B } = this.cfg;
    const N = this.total;
    const lo = Math.max(0, center - W);
    const hi = Math.min(N - 1, center + W);
    for (let i = lo; i <= hi; i++) this.loadFrame(i);
    const kLo = Math.max(0, center - W - B);
    const kHi = Math.min(N - 1, center + W + B);
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

  // p: 0 → 1 across the whole story, forward (no ping-pong).
  setProgress(p: number) {
    const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
    this.target = clamped * (this.total - 1);
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
    const baseScale = this.mobile
      ? Math.min(cw / iw, ch / ih) * this.cfg.mobileFit
      : Math.max(cw / iw, ch / ih);

    // Reveal-zoom: open tight on the zipper pull, ease back to full frame by
    // revealEnd, then hold at 1.0. The ONLY camera motion (no breathing).
    // Driven by the SMOOTHED current frame → rides the existing rAF, buttery.
    const norm = this.total > 1 ? this.current / (this.total - 1) : 0;
    const rz = this.mobile ? this.cfg.revealZoomMobile : this.cfg.revealZoom;
    // Stepped reveal: pull-out fraction e walks through revealStops (eased segments
    // + flat holds), so the camera pulls back in stages while the zip keeps
    // descending during the holds.
    const e = pullFraction(norm, this.cfg.revealStops);
    const zoom = rz + (1 - rz) * e; // lerp(revealZoom → 1.0)
    const fx = this.cfg.focalStart.x + (0.5 - this.cfg.focalStart.x) * e;
    const fy = this.cfg.focalStart.y + (0.5 - this.cfg.focalStart.y) * e;

    const scale = baseScale * zoom;
    const sW = iw * scale;
    const sH = ih * scale;
    // Position the focal point at screen centre, then clamp-to-cover PER AXIS:
    // where the frame overflows, honour the focal (no edge revealed); where it
    // underflows (contain letterbox), centre that axis.
    const dx =
      sW >= cw ? Math.max(cw - sW, Math.min(0, 0.5 * cw - fx * sW)) : (cw - sW) / 2;
    const dy =
      sH >= ch ? Math.max(ch - sH, Math.min(0, 0.5 * ch - fy * sH)) : (ch - sH) / 2;
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, dx, dy, sW, sH);
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
