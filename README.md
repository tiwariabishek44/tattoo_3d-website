# tattoo_3d-website

3D immersive, **scroll-driven** web assets (Apple-AirPods style) for **Abishek Tattoo Ink**, a Kathmandu tattoo studio.

The pipeline: generate a cinematic video → extract frames (ffmpeg → WebP) → **scroll-scrub** them on a `<canvas>` for buttery, film-like reveals on the web.

## Highlights
- **The Instrument** — a floating tattoo-machine hero (R→L→R glide) with gold slogan beats. *(route `/`)*
- **The Awakening / Design 2** — a hoodie **unzips** to reveal a living **Buddha** chest tattoo, with a web-layer **reveal-zoom** camera (close-up → stepped pull-back → full-frame reveal). *(route `/design-2`, also embedded on the homepage)*
- **Frame-scrub engines** — windowed off-thread decode (`createImageBitmap`), memory release, cover/contain fit, smoothing, idle rAF. Main-thread on desktop, Web Worker + OffscreenCanvas on mobile.

## Structure
```
web/                 Next.js 14 (App Router) + TypeScript front-end
  app/               routes ( / , /design-2 , /mobile )
  components/        ScrollSequence, SpiderSequence, Header, carousels, …
  lib/               frameEngine.ts, spiderEngine.ts (the scrub renderers), theme
  public/            frame sequences (WebP) + images
tools/               frames-engine.js — ffmpeg → PNG masters → WebP pipeline
*.md                 the knowledge system (prompt architecture, findings, plans)
```

## Develop
```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

## Frame pipeline
```bash
cd tools
npm install
node frames-engine.js ../web/public/<video>.mp4   # → tools/output/<name>/{masters,webp}
```
Lossless PNG **masters** are the archival truth (kept out of git); the optimized **WebP** in `web/public/` drive the scroll-scrub.

## Notes
- Veo/Flow does **not** guarantee consistency — every asset is judged by slow frame-by-frame **scrub**, never playback.
- The `*.md` docs capture the empirical prompt-craft (`findings-log.md`, `prompt-architecture.md`) and build plans.
