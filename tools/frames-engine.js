#!/usr/bin/env node
/**
 * frames-engine.js
 * ----------------
 * Video → lossless PNG masters → optimized WebP (optional AVIF).
 *
 * Stage 1 (ffmpeg): extract EVERY frame to lossless PNG at native resolution.
 *                   No quality loss is ADDED (PNG is lossless). This replaces
 *                   ezgif, which recompresses and degrades.
 * Stage 2 (sharp):  convert PNG masters → web-delivery WebP (and/or AVIF),
 *                   optionally at responsive widths.
 *
 * WebP is the default web format: it DECODES faster than AVIF, which keeps
 * scroll-scrubbing smooth (decode speed matters more than file size in a scrubber).
 *
 * Requirements:
 *   - ffmpeg installed and on PATH   (https://ffmpeg.org)
 *   - npm install sharp
 *
 * Usage:
 *   node frames-engine.js                 # uses CONFIG.input below
 *   node frames-engine.js path/to/clip.mp4
 *   node frames-engine.js path/to/folder  # batch every video in a folder
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Prefer a bundled static ffmpeg (no system install needed); fall back to system ffmpeg.
let FFMPEG_BIN = "ffmpeg";
try {
  const s = require("ffmpeg-static");
  if (s) FFMPEG_BIN = s;
} catch (_) {}

// ─────────────────────────── CONFIG ───────────────────────────
const CONFIG = {
  input: "./input",        // default video file OR folder (overridden by CLI arg)
  outRoot: "./output",     // results go here, one subfolder per clip

  fps: null,               // null = keep EVERY native frame (24fps clip → all frames).
                           // set a number (e.g. 24) only to resample.

  pad: 6,                  // zero-padding for frame numbers (frame_000001.png)

  webp: { enabled: true,  quality: 85, effort: 6 },   // primary web format (scrub-friendly)
  avif: { enabled: false, quality: 50, effort: 4 },   // smaller but slower decode → off by default

  widths: [],              // [] = keep original resolution.
                           // e.g. [1920, 1280, 750] to emit responsive sets (frame_000001@1280.webp)

  videoExts: [".mp4", ".mov", ".webm", ".mkv", ".m4v"],
};
// ───────────────────────────────────────────────────────────────

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG_BIN, args, { stdio: ["ignore", "ignore", "inherit"] });
    p.on("error", (err) =>
      reject(
        err.code === "ENOENT"
          ? new Error("ffmpeg not found. Run `npm install` in tools/ (installs ffmpeg-static).")
          : err
      )
    );
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))
    );
  });
}

// Stage 1 — extract every frame to lossless PNG at native resolution.
async function extractFrames(videoPath, framesDir) {
  ensureDir(framesDir);
  const outPattern = path.join(framesDir, `frame_%0${CONFIG.pad}d.png`);
  const args = ["-y", "-hide_banner", "-loglevel", "error", "-i", videoPath];
  if (CONFIG.fps) args.push("-vf", `fps=${CONFIG.fps}`); // omit → all native frames
  args.push(outPattern);
  await runFfmpeg(args);
}

// Stage 2 — PNG masters → WebP / AVIF, optionally at responsive widths.
async function optimizeFrames(framesDir, baseOutDir) {
  const pngs = fs
    .readdirSync(framesDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();

  const sizes = CONFIG.widths.length ? CONFIG.widths : [null]; // null = original size

  for (const file of pngs) {
    const src = path.join(framesDir, file);
    const base = path.basename(file, ".png");

    for (const width of sizes) {
      const suffix = width ? `@${width}` : "";
      let pipeline = sharp(src);
      if (width) pipeline = pipeline.resize({ width });

      if (CONFIG.webp.enabled) {
        const dir = ensureDir(path.join(baseOutDir, "webp"));
        await pipeline
          .clone()
          .webp({ quality: CONFIG.webp.quality, effort: CONFIG.webp.effort })
          .toFile(path.join(dir, `${base}${suffix}.webp`));
      }
      if (CONFIG.avif.enabled) {
        const dir = ensureDir(path.join(baseOutDir, "avif"));
        await pipeline
          .clone()
          .avif({ quality: CONFIG.avif.quality, effort: CONFIG.avif.effort })
          .toFile(path.join(dir, `${base}${suffix}.avif`));
      }
    }
  }
  return pngs.length;
}

function collectVideos(input) {
  const stat = fs.statSync(input);
  if (stat.isDirectory()) {
    return fs
      .readdirSync(input)
      .filter((f) => CONFIG.videoExts.includes(path.extname(f).toLowerCase()))
      .map((f) => path.join(input, f));
  }
  return [input];
}

async function main() {
  const input = process.argv[2] || CONFIG.input;
  if (!fs.existsSync(input)) {
    throw new Error(`Input not found: ${input}`);
  }

  const videos = collectVideos(input);
  if (videos.length === 0) {
    throw new Error(`No videos found in: ${input}`);
  }

  console.log(`Found ${videos.length} clip(s). Output → ${CONFIG.outRoot}\n`);

  for (const video of videos) {
    const name = path.basename(video, path.extname(video));
    const baseOut = path.join(CONFIG.outRoot, name);
    const mastersDir = path.join(baseOut, "masters");

    console.log(`▶ ${name}`);
    console.log("  • extracting lossless PNG frames…");
    await extractFrames(video, mastersDir);

    const count = fs
      .readdirSync(mastersDir)
      .filter((f) => f.toLowerCase().endsWith(".png")).length;
    console.log(`    ✓ ${count} PNG masters`);

    const fmts = [CONFIG.webp.enabled && "webp", CONFIG.avif.enabled && "avif"]
      .filter(Boolean)
      .join(" + ");
    console.log(`  • optimizing → ${fmts}${CONFIG.widths.length ? ` @ ${CONFIG.widths.join("/")}` : ""}…`);
    await optimizeFrames(mastersDir, baseOut);
    console.log(`    ✓ done → ${baseOut}\n`);
  }

  console.log("All clips processed.");
}

main().catch((err) => {
  console.error("\n✗ " + err.message);
  process.exit(1);
});
