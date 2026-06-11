// scrollPhysics.ts — Render Engine V2 core (One-Clock repair).
// rAF-loop polling of the EASED scroll position — the page's single clock
// (Law 1, scroll-engine-fix-plan.md §1). Lenis owns smoothing; this class owns
// progress→frame mapping and the decode-tier signal. Tiers gate WORK (decode
// strategy in the engines), never OUTPUT — the displayed frame always advances
// with scroll (Law 2).
//
// `lenis.targetScroll` is BANNED as a position source (it is a destination,
// not a position — reading it forks the page into two clocks). Telemetry-only.

export type PerformanceTier = "normal" | "lowPower" | "midPower" | "ultraLowPower";

export type PhysicsFrame = {
  frame: number;       // fractional frame index
  progress: number;    // raw 0-1 section progress
  velPxS: number;      // scroll velocity in px/s (eased-clock velocity)
  tier: PerformanceTier;
};

export type PhysicsConfig = {
  frameCount: number;
  legs: number;         // ping-pong legs: 1 = forward only, 2 = R→L→R
  pingPong: boolean;
  scrubStart?: number;  // start sequence playback at this progress (e.g. 0.15)
  scrubEnd?: number;    // cap progress at this (SpiderSequence: 0.82)
};

// Velocity thresholds in viewport-heights/s — the only unit that survives
// 768p → 4K. Desktop-calibrated (fix-plan §3 Phase 2): a gentle wheel scroll
// measures ~0.8–2.5 vh/s, so escalation starts where degradation is actually
// needed, not where scrolling begins. Hysteresis: escalate immediately,
// return to normal below recoveryVhS.
const TIER_VH_S = {
  lowPower:       3,
  midPower:       6,
  ultraLowPower: 10,
  recoveryVhS:    1,
};

// ── ScrollPhysics ─────────────────────────────────────────────────────────────

export class ScrollPhysics {
  private rafId         = 0;
  private prevScrollY   = 0;
  private prevTs        = 0;
  private smoothedVelMs = 0;   // px/ms, low-pass filtered
  private currentFrame  = 0;
  private tier: PerformanceTier = "normal";
  private dead          = false;
  private containerTop  = 0;   // absolute page-top of container, cached on mount/resize
  private trackLength   = 0;   // scrollable px range, cached on mount/resize
  private viewportH     = 1;   // cached window.innerHeight for vh-relative tiers
  private ro: ResizeObserver | null = null;

  // Telemetry exposed for the dev overlay
  readonly telemetry = {
    velPxS:  0,
    tier:    "normal" as PerformanceTier,
    frame:   0,
    progress: 0,
  };

  constructor(
    private container: HTMLElement,
    private cfg: PhysicsConfig,
    private onFrame: (f: PhysicsFrame) => void,
  ) {}

  // The one clock: Lenis's eased position (≙ window.scrollY, with subpixel
  // precision while animating). Falls back cleanly if Lenis is ever removed.
  private getScroll(): number {
    const lenis = (window as typeof window & { lenis?: { scroll: number } }).lenis;
    return lenis ? lenis.scroll : window.scrollY;
  }

  // Call after mount. Immediately starts the tick.
  start() {
    this.cacheLayout();
    // Re-cache on ACTUAL layout change, not guessed timers.
    // To avoid layout thrashing, we do NOT observe the document body;
    // observing the container itself is sufficient for section layout changes.
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.cacheLayout());
      this.ro.observe(this.container);
    }
    this.prevScrollY = this.getScroll();
    this.prevTs      = performance.now();
    this.rafId       = requestAnimationFrame(this.tick);
  }

  // Cache the container's absolute page position and scroll range.
  // Call on mount (via start()) and whenever the viewport resizes.
  // Keeps DOM layout reads out of the hot rAF path.
  cacheLayout() {
    const scrollY = window.scrollY;
    const rect = this.container.getBoundingClientRect();
    this.containerTop = rect.top + scrollY;
    this.trackLength  = this.container.offsetHeight - window.innerHeight;
    this.viewportH    = Math.max(1, window.innerHeight);
  }

  // Call on unmount / cleanup.
  stop() {
    this.dead = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    const lenis = (window as any).lenis;
    if (lenis && this.subscribedToLenis) {
      lenis.off("scroll", this.handleLenisScroll);
    }
    this.ro?.disconnect();
    this.ro = null;
  }

  // ── Section progress ────────────────────────────────────────────────────────
  // Pure arithmetic using the cached containerTop + trackLength (set by cacheLayout).

  private getProgress(): number {
    if (this.trackLength <= 0) return 0;
    const scrollY = this.getScroll();
    return Math.max(0, Math.min(1, (scrollY - this.containerTop) / this.trackLength));
  }

  // ── Progress → frame index ──────────────────────────────────────────────────

  private progressToFrame(progress: number): number {
    const { frameCount, legs, pingPong, scrubStart, scrubEnd } = this.cfg;
    const start = scrubStart ?? 0;
    if (progress <= start) return 0;

    const end = scrubEnd ?? 1;
    const range = end - start;
    if (range <= 0) return 0;

    const p = Math.min((progress - start) / range, 1);

    if (!pingPong || legs <= 1) {
      return p * (frameCount - 1);
    }
    // Ping-pong (triangle wave): legs=2 → 0→1→0 over full progress range.
    const phase = p * legs;
    const tri   = 1 - Math.abs((phase % 2) - 1);
    return tri * (frameCount - 1);
  }

  // ── Performance tier with hysteresis ───────────────────────────────────────
  // The tier ONLY informs decode strategy downstream (engine.setTier) — it
  // never holds the frame or freezes progress (Law 2).

  private updateTier(velPxS: number) {
    const vhS = Math.abs(velPxS) / this.viewportH;
    if (vhS < TIER_VH_S.recoveryVhS)         { this.tier = "normal"; return; }
    if (vhS > TIER_VH_S.ultraLowPower)       this.tier = "ultraLowPower";
    else if (vhS > TIER_VH_S.midPower)       this.tier = "midPower";
    else if (vhS > TIER_VH_S.lowPower)       this.tier = "lowPower";
    else                                     this.tier = "normal";
  }

  // ── The Lenis event handlers and rAF Tick ────────────────────────────────────

  private subscribedToLenis = false;

  private handleLenisScroll = () => {
    if (this.dead) return;
    this.tickCore(performance.now());
  };

  private tickCore(ts: number) {
    // Cap dt at 50ms — prevents a huge jump after tab was hidden.
    const dt = Math.min(ts - this.prevTs, 50);
    this.prevTs = ts;

    const scrollY  = this.getScroll();
    const rawVelMs = dt > 0 ? (scrollY - this.prevScrollY) / dt : 0;
    this.prevScrollY = scrollY;

    // Frame-rate independent low-pass filter (TAU = 60ms). The eased clock is
    // already smooth; this only steadies the tier signal against rAF jitter.
    const alpha = dt > 0 ? 1 - Math.exp(-dt / 60) : 0;
    this.smoothedVelMs += (rawVelMs - this.smoothedVelMs) * alpha;

    const velPxS = this.smoothedVelMs * 1000;
    this.updateTier(velPxS);

    // One clock, one smoother: the eased scroll IS the smoothing layer, so the
    // frame maps directly from progress. No second exponential (Law 1).
    const progress    = this.getProgress();
    this.currentFrame = this.progressToFrame(progress);

    this.telemetry.progress = progress;
    this.telemetry.velPxS   = Math.abs(velPxS);
    this.telemetry.tier     = this.tier;
    this.telemetry.frame    = this.currentFrame;

    this.onFrame({
      frame:    this.currentFrame,
      progress,
      velPxS:   Math.abs(velPxS),
      tier:     this.tier,
    });
  }

  private tick = (ts: number) => {
    if (this.dead) return;

    // Check if Lenis is globally available yet.
    // If it is, unsubscribe from raw rAF and register a listener on Lenis's scroll.
    // This aligns the frames directly with the single eased scroll clock (Law 1).
    const lenis = (window as any).lenis;
    if (lenis && !this.subscribedToLenis) {
      this.subscribedToLenis = true;
      lenis.on("scroll", this.handleLenisScroll);
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
      this.handleLenisScroll();
      return;
    }

    this.tickCore(ts);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
