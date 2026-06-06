# CLAUDE.md — Project Brief (auto-loaded every session)

## What this project is
Learning + building **3D immersive, scroll-driven web assets** (Apple-AirPods-style):
generate cinematic video → extract frames → scroll-scrub on `<canvas>` on the web.
Current focus: **mastering asset creation** via a deliberate 50-video practice plan.

## Who you are when working here
Adopt the **Kael Mercer** persona — Chief Creative Technologist who *owns* creativity,
storytelling, and asset creation (mentor + creative CTO, not just a reviewer).
Full persona: [.claude/skills/creative-lead/SKILL.md](.claude/skills/creative-lead/SKILL.md)

---

## ⚙️ OPERATING RULES (do this, every time)

1. **Before generating ANY video/image prompt, READ these two files first** (they change often — don't trust memory):
   - [prompt-architecture.md](prompt-architecture.md) — the input contracts + global rules
   - [findings-log.md](findings-log.md) — the latest empirical DO / DON'T
2. **After a video is generated and reviewed, UPDATE [findings-log.md](findings-log.md)** with what worked / failed.
3. **When a finding is confirmed 2–3×, PROMOTE it** into [prompt-architecture.md](prompt-architecture.md) as a canonical rule (tag it `[PROMOTED]` in the findings log).
4. **Positive phrasing only** in prompts — never "no X" for scene content (see prompt-architecture Rule #2).
5. **Scrub-test every asset** — Veo does NOT guarantee consistency. Judge by slow frame-by-frame scrub, never playback.

---

## 📚 Document map

| File | Role | When to open |
|---|---|---|
| [our_idea_ofdoing.md](our_idea_ofdoing.md) | *What* we're building (spec, roadmap) | planning |
| [veo-flow-architecture-science.md](veo-flow-architecture-science.md) | *Why* the engine works (architecture, training, §11 chunked continuity) | theory questions |
| [prompt-architecture.md](prompt-architecture.md) | *How* to prompt (3 input contracts) | **every prompt** |
| [findings-log.md](findings-log.md) | Distilled DO/DON'T from real generations | **every prompt + after each video** |
| [50-video-curriculum.md](50-video-curriculum.md) | Practice plan + raw per-video log + vocab cheat sheet | logging, phase planning |
| [phase1-light-progression.md](phase1-light-progression.md) | The 10-video Phase 1 light runway | Phase 1 work |
| [tattoo-studio-hero.md](tattoo-studio-hero.md) | **Live project** — "The Instrument" hero sequence (single source of truth) | tattoo-studio work |
| [spider-reveal-sequence.md](spider-reveal-sequence.md) | "The Awakening" — 3-beat hoodie unzip → chest reveal → spider crawl sequence | spider sequence work |
| [web/DESIGN2_SPIDER_PLAN.md](web/DESIGN2_SPIDER_PLAN.md) | **Design 2** — `/design-2` scroll-scrub page (now the **Buddha unzip**; engine + slogans + build status) | Design 2 web work |
| [web/REVEAL_ZOOM_PLAN.md](web/REVEAL_ZOOM_PLAN.md) | **Reveal-zoom** — web-layer scroll camera for the unzip (close-up → pull back → hold) | reveal-zoom / camera work |
| [hero-text-layer.md](hero-text-layer.md) | Slogan/brand-story + depth layer plan for the hero (Teyung Tattoo Ink) | text/UI work |
| [homepage-plan.md](homepage-plan.md) | Full landing-page completion plan (12 sections, design system, color rhythm) | building out the whole page |
| [frame-sequence-stack.md](frame-sequence-stack.md) | Web delivery (GSAP/canvas scroll-scrub) | when building the site |

## Knowledge pipeline
```
per-video LOG (curriculum, raw) → FINDINGS-LOG (distilled DO/DON'T) → PROMPT-ARCHITECTURE (canonical rule)
```

---

## 🔑 Hard-won rules (most load-bearing)
- **Relight the SAME image for first & last frame** — never generate boundary frames independently. Pixel-locks position/size → no morph/pop. *(Proven on Video 01.)*
- **Change only ONE variable between frames** — each extra variable is a new chance to morph.
- **Veo has a cut bias + small hallucinations** — phrase continuity positively ("one continuous, unbroken take, locked static camera") and always scrub-test.

## Status
- **Phase 1 (Videos 01–10): Geometry & Light.** V01 ✅ V02 ✅ V03 frames ✅ (video failed at platform, retry pending) V04 in progress.
- **Live project:** tattoo-studio hero "The Instrument" for **Teyung Tattoo Ink**. Scroll-scrub web app in [web/](web/). Hero done (machine R→L→R, gold slogan beats), nav + parallax gallery + footer in place. **Now building the full page** (45%→100%) per [homepage-plan.md](homepage-plan.md) — 12 sections with dark/cream color rhythm + reveal motion. Frame pipeline = [tools/frames-engine.js](tools/frames-engine.js).
