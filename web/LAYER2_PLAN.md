# Layer 2 Plan — Off-Main-Thread Frame Rendering (Web Worker + OffscreenCanvas)

> Goal: move BOTH decode and canvas rendering off the main thread so mobile scroll
> stays buttery. The main thread only posts the scroll position; a worker (the web
> equivalent of a Flutter isolate) owns the frame window, decode, smoothing, and draw.
>
> **Status:** Layer 1 done (main-thread `createImageBitmap` + window + DPR cap + idle rAF).
> Layer 2 = the worker upgrade, with Layer 1 as the automatic fallback.

---

## Why
Layer 1 moved **decode** off-thread. The **smoothing rAF loop + `drawImage`** still run on the main thread, competing with the scroll compositor on low-end phones. Layer 2 moves the **draw** off-thread too → main thread does almost nothing during scroll → genuine 60fps. This is the Flutter "decode on a proxy isolate" pattern, in the browser.

## Architecture
```
MAIN THREAD (ScrollSequence.tsx)                WORKER (frames.worker.ts)
─────────────────────────────────              ─────────────────────────────────
• capability check                              • receives OffscreenCanvas + config
• canvas.transferControlToOffscreen() ───────►  • owns frame window:
• useScroll → postMessage({progress})  ───────►     - loadFrame: fetch → createImageBitmap
• resize → postMessage({w,h,dpr})      ───────►     - ensureWindow + close() far frames
• receives {ready} / {progress}        ◄───────  • runs its OWN smoothing loop + draw
• renders HeroText overlay (DOM)                • posts {ready}, {progress}
```
The HeroText slogan layer stays on the main thread (DOM/Framer Motion — cheap). Only the canvas pixels move to the worker.

## Message protocol
**main → worker**
- `{ type: "init", canvas, base, frameCount, pad, dpr, mobile, cfg }` — `canvas` is the transferred OffscreenCanvas (in the transfer list).
- `{ type: "scroll", progress }` — 0..1; worker computes the ping-pong frame.
- `{ type: "resize", width, height, dpr, mobile }`.

**worker → main**
- `{ type: "ready" }` — first `READY_AHEAD` frames decoded → hide the loading overlay.
- `{ type: "progress", loaded }` — for the loading %.

Worker owns the frame mapping (LEGS ping-pong), the window (WINDOW/RELEASE_BUFFER), smoothing (SMOOTHING), and cover/contain + MOBILE_FIT — i.e. all the constants move into the worker.

## Capability detection + fallback (critical)
```
const canWorker =
  typeof Worker !== "undefined" &&
  typeof OffscreenCanvas !== "undefined" &&
  "transferControlToOffscreen" in HTMLCanvasElement.prototype;
```
- **`transferControlToOffscreen()` is one-way** — once transferred, the main thread can't draw to that canvas. So decide BEFORE transferring; never transfer if we might need the fallback.
- `canWorker === false` → use the **Layer 1 main-thread path** (current code, untouched).
- **iOS Safari:** OffscreenCanvas + transfer landed in **16.4 (Mar 2023)**. Older iOS → Layer 1 fallback.

## Key risks & decisions
1. **rAF inside a worker is not universal.** Chrome workers have `requestAnimationFrame`; Safari worker support is unreliable.
   → **Decision:** in the worker, use `requestAnimationFrame` if present, else a `setTimeout(~16ms)` smoothing loop. Draw immediately on each `scroll` message regardless, so even without a loop it tracks scroll; the loop only does the lerp smoothing.
2. **Worker bundling in Next:** use `new Worker(new URL("./frames.worker.ts", import.meta.url))` — webpack 5 / Next 14 bundles it. Verify in `next build`.
3. **One-way transfer** (above) — gate strictly behind the capability check.
4. **Worker scope:** all devices when supported (desktop benefits too, single code path) — OR mobile-only to de-risk desktop. → **Decision:** enable when supported on all devices; desktop already works, so any regression is caught immediately. Keep L1 as fallback.
5. **Memory:** windowing + `close()` move into the worker unchanged — same bounded footprint.

## Shared logic
Extract the renderer core (framePath, loadFrame, ensureWindow, draw math, smoothing) into a plain module that both the worker and the L1 main-thread path import — so there's one implementation, two hosts. Avoids drift.

## Implementation steps
1. **Extract** the window/decode/draw/smoothing core into `lib/frameEngine.ts` (no DOM assumptions; takes a canvas-like + ctx).
2. **Write** `frames.worker.ts` — init (receive offscreen + cfg), run the core, handle scroll/resize messages, post ready/progress.
3. **Refactor** `ScrollSequence.tsx`: capability check → if `canWorker`, transfer canvas + spawn worker + post scroll/resize; else run the L1 path (existing).
4. **Wire** ready/progress messages → loading overlay.
5. **Verify** `next build`, then test desktop + **real mid-tier Android** + **iOS 16.4+** and an **old iOS** (fallback path).

## Verification
- No frame stick/snap on a fast fling (real Android).
- Performance profiler: main thread near-idle during scroll; no long decode/draw tasks on it.
- Fallback path still works on a browser without OffscreenCanvas (force-disable to test).

## Open decisions (confirm before building)
- [ ] Worker on **all devices** when supported (recommended) vs **mobile-only**?
- [ ] Loading %: keep the worker `progress` messages, or just a simple spinner until `ready`?
- [ ] Acceptable to require **iOS 16.4+** for the worker path (older iOS gets the smooth-enough Layer 1)?

## Changelog
- **v1.0 (2026-06-05)** — Initial Layer 2 plan: Worker + OffscreenCanvas architecture, message protocol, capability-gated fallback to Layer 1, rAF-in-worker risk + setTimeout fallback, shared frameEngine core, phased steps.
