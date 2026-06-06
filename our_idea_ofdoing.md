# Our Idea of Doing — 3D Immersive Asset Creation

> **Project goal:** Master 3D immersive asset creation for scroll-driven, Apple-style
> interactive websites using a video-to-frame workflow.

## Workflow Pipeline

1. **Generation** — Create 3D immersive motion videos focusing on depth, lighting, and camera movement.
2. **Extraction** — Convert videos into sequential image frames (JPG/WebP) via FFmpeg (preferred) or EZGIF.
3. **Implementation** — Map scroll progress to a frame **index** using `useScroll` + `useTransform`, then draw that frame to a `<canvas>` via a `useMotionValueEvent('change')` listener calling `drawImage()`.
   - ⚠️ Note: `useTransform` alone animates DOM styles, not canvas frames — the change-listener step is required.

## Generation Tools

- **Primary:** Google Flow / Veo — fast iteration; strong for color, lighting, and camera-driven scenes.
- **Fallbacks:**
  - **Seedance 2.0** — strongest temporal consistency; use when an object must stay identical frame-to-frame (assembly, exploded views).
  - **Higgsfield** — camera-control presets (orbit, dolly, crane) map directly onto the C/S-curve camera pillar.
- **Blender note:** *Not* a forced graduation. Only fall back to it if scrub-testing reveals morphing that no AI model fixes. With correct prompts, AI video has handled exploded sequences in practice.

## Technical Constraints

- **Frame count:** 100–150 frames per 5-second sequence (balances smoothness vs. web performance).
- **Formats:** WebP or highly optimized JPG to minimize load and prevent scroll lag.
- **CSS:** `position: sticky` on wrapper containers to lock the product in the viewport during the scroll animation.
- **Aspect ratio:** Decide the web target ratio **before** generating (16:9 desktop hero, 9:16 mobile, or 1:1). AI tools output fixed ratios — choosing late means regenerating.
- **Scrub validation:** Never judge a clip by playback alone. Scrub it slowly frame-by-frame — morphing invisible at 24fps surfaces under manual scroll. This is the real pass/fail test.

## Creative Pillars

- **Camera movement:** Prioritize sweeping arcs (C/S curves) around the subject over static spinning to maximize the illusion of 3D depth.
- **Motion pacing:** Slow, deliberate, smooth movement so the animation stays fluid when scrubbed at the user's scroll speed.
- **Lighting & contrast:** Studio setups, rim lights, soft dramatic shadows — establish physical presence and premium texture.
- **Composition:** Continuous flow without abrupt cuts — smooth transitions, floating elements, modular product assemblies.

## Learning Practice

- **Per-video log:** For every video record the prompt, the tool, what worked, and what failed. This log is where the creative eye compounds — without it, 50 videos is just 50 clips.
- **Goal:** Build a transferable vocabulary (camera moves, depth, atmosphere, mood), not just a folder of renders.

## The 50-Video Roadmap

| Phase | Focus | Objectives |
|-------|-------|------------|
| **01–10** | Basic Geometry & Physics | Animate simple shapes (spheres, cubes) bouncing/sliding. Master studio lighting, reflections, realistic gravity on basic surfaces. |
| **11–25** | Camera & Perspective | Dynamic camera sweeps, viewpoints flying through objects, orbital paths — practice environmental parallax. |
| **26–40** | Color & Textures | Premium materials (brushed titanium, liquid chrome, matte) and shifting light colors mid-motion. |
| **41–50** | Concept Landing Pages | Complex multi-part concepts — abstract product assembly, exploded views — tailored for immersive web. |
