# Scroll-Driven Frame Sequence Animation — Recommended Stack

> The "Apple AirPods page" technique: a cinematic, offline-rendered animation
> scrubbed by scroll position. At runtime it's just 2D images drawn to a
> `<canvas>` really fast — **not** real-time 3D in the browser.

---

## How it works (the core idea)

1. A 3D artist renders the animation (Blender / Cinema4D / etc.) → exports
   **~150–1500 individual frames** as images.
2. Those frames are preloaded in the browser.
3. As the user scrolls, scroll position maps to a **frame index**, and that
   single frame is drawn onto a `<canvas>`.

So: **scroll = a scrubber for a "video" made of images.**

```js
// the core idea, simplified
const frameCount = 300;
const img = new Image();

function currentFrame(i) {
  return `/frames/airpods_${String(i).padStart(4, "0")}.jpg`;
}

window.addEventListener("scroll", () => {
  const scrollFraction =
    window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );
  img.src = currentFrame(frameIndex);
  img.onload = () => context.drawImage(img, 0, 0);
});
```

---

## Recommended Stack

| Concern              | Recommendation                                              | Why                                                                 |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| **Scroll animation** | [GSAP](https://gsap.com/) + **ScrollTrigger**               | Gold standard for scroll-driven animation. Pin + scrub, buttery smooth. |
| **Rendering**        | `<canvas>` + `drawImage()`                                  | Cheaper than swapping `<img>` src on every frame.                    |
| **Image format**     | **WebP / AVIF** (not JPG)                                   | Cuts payload 30–60% at the same visual quality.                     |
| **Loading**          | Lazy / progressive preloading + loading indicator          | The #1 thing that makes or breaks the experience.                   |
| **Responsiveness**   | Resize frames per breakpoint                                | Don't make mobile pull desktop-sized images.                        |

---

## Why GSAP + ScrollTrigger (instead of a raw scroll listener)

- **Pin a section** so it stays fixed while the animation scrubs.
- **Scrub the frame index** across the scroll range with one declarative config.
- Built-in **smoothing/easing** — raw `scroll` events feel choppy by comparison.
- Handles resize, refresh, and edge cases you'd otherwise hand-roll.

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const frameCount = 300;
const images = [];
const state = { frame: 0 };

// preload
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

gsap.to(state, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: ".sequence-section",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,   // smoothing
    pin: true,
  },
  onUpdate: render,
});

function render() {
  const img = images[state.frame];
  if (img?.complete) context.drawImage(img, 0, 0);
}
```

---

## The hard part nobody warns you about

It's **not the code — it's the asset weight and the loading strategy.**

A 300-frame sequence at 1920px can easily be **80–150 MB**. Most of your effort
goes into:

- **Image format / compression** — WebP/AVIF, quality tuning.
- **Smart preloading** — load enough to *start*, then stream the rest.
- **Frame count vs. smoothness** tradeoff:
  - ~60 frames → choppy
  - ~150 frames → decent
  - ~300 frames → buttery

---

## Frame sequence vs. real-time WebGL 3D

| Concern         | **Frame sequence (Apple's way)**          | **Real-time WebGL 3D**                |
| --------------- | ----------------------------------------- | ------------------------------------- |
| Tech            | Canvas + image sequence + GSAP ScrollTrigger | Three.js / React Three Fiber + GLTF   |
| Visual quality  | Cinematic (offline-rendered, ray-traced)  | Limited to real-time shading          |
| Interactivity   | None — it's "on rails"                     | Full — rotate, click, change materials |
| Payload         | **Heavy** (50–200 MB+ of images)          | Lighter (one model + textures)        |
| Effort          | Easy code, hard art pipeline              | Harder code, lighter art              |

**Choose frame sequence** if you want the Apple cinematic look (you can't match
offline render quality in real-time).

**Choose real-time 3D** if the user needs to interact with the product
(spin it, configure it).

---

## Suggested project setup

```
video_creation/
├── public/
│   └── frames/
│       ├── frame_0000.webp
│       ├── frame_0001.webp
│       └── ...
├── src/
│   ├── sequence.js      # canvas + GSAP scrub logic
│   └── preloader.js     # progressive loading + indicator
└── index.html
```

**Install:**

```bash
npm install gsap
```

---

## Checklist before you ship

- [ ] Frames exported as WebP/AVIF, compressed
- [ ] Responsive frame sets per breakpoint
- [ ] Progressive preloader with a visible loading indicator
- [ ] First frame drawn before the section is reachable (no blank canvas)
- [ ] `scrub` smoothing tuned (start ~0.5)
- [ ] Canvas sized with `devicePixelRatio` for crispness on retina
- [ ] Tested on a throttled/slow connection
