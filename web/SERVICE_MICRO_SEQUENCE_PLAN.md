# Service Micro-Sequences — Future Elevation (SSOT)

> Single source of truth for the **future** evolution of the "Styles we master" section:
> turning each service's static 16:9 still into a **2–3s scroll-scrubbed micro-sequence**.
> Persona: **Kael Mercer** (creative CTO) per [CLAUDE.md](../CLAUDE.md).
> Parent SSOT (the section itself): [web/STYLES_WE_MASTER_PLAN.md](STYLES_WE_MASTER_PLAN.md).
>
> **Status: PARKED / FUTURE.** Do NOT build this yet. Prerequisite = the 8 strong static
> 16:9 stills must land and ship first. This doc captures the vision so we don't lose it.

---

## 0. One line
Each service stops being a still photo and becomes a **short, scroll-scrubbed cinematic
move** — a slow push on the tattoo, or the line being inked — so the section finally uses
our full video → frames → canvas pipeline and delivers the hero-grade "ahh".

---

## 1. Why (the case)

- **Stills give clarity; motion gives life.** The chosen Concept 3 (cinematic full-bleed)
  already feels premium with purpose-built 16:9 stills. The deepest "ahh" — the one the
  machine hero and Buddha reveal have — comes from **the viewer's own scroll conducting a
  cinematic move.** Right now this section is the only soul-section that *doesn't* scrub.
- **It's literally our craft.** We generate the hero frames this way already. Extending it to
  the services is the natural, on-brand elevation — not a new trick.
- **The stills become the seed.** The purpose-built 16:9 still for each service doubles as the
  **anchor / first frame** of its micro-sequence → continuity for free (relight the same image
  for first & last frame, per our hard-won rule).

---

## 2. The concept

For each service: a short generated clip → ffmpeg frames → WebP → **scroll-scrubbed on canvas**,
dropped into the *same* Concept-3 composition (text + light bottom gradient + parallax). The only
change is the image layer: a static `background-image` becomes a **per-beat frame-scrubbed canvas**,
driven by the beat's *local* scroll progress (which `ServiceReveal` already computes).

**Move vocabulary — one deliberate move per service** (camera doctrine: a narrator, not a turntable):
- slow **dolly push-in** on the piece,
- **macro rack-focus** pulling detail into clarity,
- the **line being inked** / needle laying ink,
- **ink bloom** settling into skin,
- a single slow **light sweep** across the work.

Keep each move *small and slow* so it survives a manual scrub with zero morph.

---

## 3. Generation & continuity discipline (when we build)

Before writing ANY prompt: read [prompt-architecture.md](../prompt-architecture.md) +
[findings-log.md](../findings-log.md). Apply the load-bearing rules:
- **Relight the SAME still for first & last frame** — never generate boundary frames independently.
- **Change only ONE variable** across the clip (e.g. camera distance OR focus, not both).
- **One continuous, unbroken take; locked or single-move camera**; positive phrasing only.
- **Scrub-test every clip** frame-by-frame before it enters the pipeline.
- Cohesion: all 8 share one lighting language, color temperature, and framing — they must feel
  like one studio's hand.

---

## 4. Web integration

- Reuse the existing scroll-scrub engines as reference: [web/lib/spiderEngine.ts](lib/spiderEngine.ts)
  (forward-play, windowed decode, clamp-to-cover) / the machine `FrameEngine`.
- In [web/components/ServiceReveal.tsx](components/ServiceReveal.tsx): the cinematic image layer
  becomes a `<canvas>` per beat; map the beat's local progress → frame index → `drawImage`.
- Keep everything else (smoothed spring, 3-layer parallax, monumental type, enter→HOLD→exit) —
  the still simply animates during the HOLD instead of sitting frozen.

---

## 5. Performance (the real risk)

8 services × ~48–72 frames × WebP is a lot of bytes. This is the make-or-break constraint.
- **Lazy-load per beat** — only decode the active + adjacent sequences; release the rest.
- **Downscale for mobile** (720w sets + worker), consistent with the deferred mobile plan.
- Budget frame counts tightly; a 2–3s move at low fps scrubs fine (we control the index, not time).
- If it can't stay at 60fps on scroll, it doesn't ship — a janky scrub is worse than a great still.

---

## 6. Phasing (earn each step)

- **Phase A — NOW (separate work):** 8 purpose-built static 16:9 stills, cohesive, shipped. ← prerequisite
- **Phase B — Prototype ONE:** turn the lead service (**Realism**) into a micro-sequence; scrub-test
  in isolation. Judge: does it beat the still? If not, stop.
- **Phase C — Roll out:** if Phase B earns it, generate the other 7 in the same language.
- **Phase D — Mobile:** downscaled frame sets + worker; or graceful fallback to the still on mobile.

---

## 7. Open questions (for when we start)

- [ ] First prototype service — **Realism** (the lead) assumed; confirm.
- [ ] Move vocabulary per service — one move each; which move suits which style?
- [ ] Frame budget per sequence (fps × seconds) that scrubs clean within perf budget.
- [ ] Mobile: scrubbed (downscaled) vs. fall back to the static still?

---

## 8. Status & changelog

- **2026-06-06 — Created (PARKED).** Vision captured after Concept 3 chosen as the section's
  composition. Concepts 1 & 2 retired. Next actual work = **Phase A asset generation** (the 8
  static 16:9 stills) under the parent plan; this micro-sequence elevation waits behind it.
