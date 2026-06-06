# Findings Log — Empirical DO / DON'T from Real Generations

> **What this is:** the distilled lessons pulled OUT of actual video generations — the
> DO / DON'T rules we discovered by doing, not theorizing. This is the proving ground.
>
> **The knowledge pipeline:**
> ```
> Per-video LOG (raw, in 50-video-curriculum.md)
>        ↓  notice a pattern
> FINDINGS-LOG (this file — DO/DON'T, marked by confidence)
>        ↓  proven 2–3× → graduate it
> PROMPT-ARCHITECTURE.md (canonical rule)
> ```
> **Rule:** when a finding is confirmed across **2–3 videos**, promote it to
> [prompt-architecture.md](prompt-architecture.md) and note it here as `[PROMOTED]`.

> **Confidence tags:** `[Confirmed Nx]` = seen N times · `[Hypothesis]` = once, watch it · `[PROMOTED]` = now a canonical rule.

---

## ✅ DO

- **Relight the SAME image for the first & last frame** (don't generate them independently). Pixel-locks position + size → smooth bloom, no pop. `[Confirmed 2x — V01 (intensity), V02 (direction)]` → reflected in CLAUDE.md hard-won rules.
- **Change only ONE variable between start and end frame** (here: light only). The model has nothing to morph. `[Confirmed 2x — V01, V02]`
- **Use light-bloom (dark → light) for static light studies.** Gives life + teaches the terminator without needing camera or rotation. `[Confirmed 1x — V01]`
- **Matte material + dark seamless void = reliable premium look** in low-key. `[Confirmed 1x — V01]`
- **Phrase the absence of motion positively** — "locked static camera, holds its exact position, surface stays constant." `[Confirmed 2x — V01, V02]`
- **A rotating metal glide between two locked frames generates with NO morph on Veo** — rotation IS viable in v1 (coils/frame/brass held through a full turn). `[Confirmed 1x — tattoo R→L]`
- **Paid Gemini = full-quality Veo → production-grade consistency. Free Flow = downgraded/faster Veo → more drama + morph risk.** Workflow: **iterate cheap on free Flow, render final keepers on paid Gemini.** Don't buy Seedance/Higgsfield until paid Veo genuinely can't do something. `[Confirmed 1x — tattoo R→L, paid vs free]`
- **Clothing reveal (hoodie unzip) between two locked frames is low-risk and clean on Veo** — organic fabric + skin morph far less than chrome; the unzip-downward reveal held with no morph. `[Confirmed 2x — Spider Beat 1, Buddha Beat 1]`
- **The "calm, constant lighting identical to start/end frames" instruction WORKS** — it suppressed Veo's mid-motion light-burst bias (the fix for that DON'T is proven). `[Confirmed 2x — Spider Beat 1, Buddha Beat 1]`
- **Subject stillness holds clean** — "the body stays motionless, steady as a statue; only the [zip/fabric] moves" kept the torso locked through the unzip. Extends "locked static camera" to the **subject** = one true variable. `[Confirmed 1x — Buddha Beat 1]`
- **A high-detail tattoo (cracked-stone Buddha) revealed via unzip held without shimmer** — the flagged detail-shimmer risk did NOT materialise when body + camera are locked and the reveal is slow. `[Confirmed 1x — Buddha Beat 1]`
- **A small embroidered chest crest recedes gracefully into shadow** as the hoodie panel opens — no need to author it onto the end frame; it exits cleanly on its own. `[Confirmed 1x — Buddha Beat 1]`
- **Audio prompt is discarded by our frame pipeline** (ffmpeg pulls visual frames only) — keep it minimal/none. BUT keep **`(no subtitles)`**: subtitles are *visual* (burned into frames), so the control tag still earns its place. `[Workflow note]`

## 🚫 DON'T

- **Don't generate the two boundary frames independently** when they should match — size/position drift causes a scrub pop. (Relight one into the other instead.) `[Confirmed 1x — V01]`
- **Don't pack multiple changes into one beat** (e.g., light + rotation + camera). Each added variable is a new chance to morph. `[Confirmed 1x — V01]`
- **Don't trust playback** — a clip can look fine playing and still pop on slow scrub. `[Hypothesis]`
- **Veo injects a dramatic mid-motion background light burst** (its documented cinematic bias) even when both endpoints are calm — explicitly demand "calm, constant lighting, identical to the start/end frames, unchanging throughout." `[Confirmed 1x — tattoo R→L]`
- **Veo overshoots rotation mid-transition** (the object tilts flat) when the two endpoint frames differ in orientation — constrain to a gentle turn / near-vertical posture, OR bring the endpoint angles closer together. `[Confirmed 1x — tattoo R→L]`

## 🔬 Open Questions / To Test

- How wide can the brightness range between frames go before the bloom starts to morph? (V01's range was narrow — push it in a later video.)
- ✅ **RESOLVED (V02):** the relight-trick **HOLDS for light-direction change**, not just intensity — the silhouette stayed locked through a full 90° rake. This is now `[Confirmed 2x]`.
- **DEFERRED (high-key study, later):** Does form + separation survive a **high-key (light background)** lift, or does the sphere wash into the bright background? (Pivoted away from high-key for now; revisit when we do the light-theme study.)
- At what clip length does drift start appearing for a locked static study?

---

## Per-Video Findings

### Video 01 — Premium Sphere: Emergence ✅
- **Result:** smooth dark→light bloom, no morph, no seam crack. Met expectation.
- **Key win:** relighting the same bright frame *down* for the first frame pixel-locked the sphere → clean transition.
- **What worked:** single-variable change (light only); matte + void premium; positive phrasing.
- **Watch next:** brightness range was subtle — terminator lesson was gentle. Push brighter reveal in a future clip to see the full tonal travel.
- **Scrub test:** PASS.

### Video 02 — Sphere: The Sculpting Light ✅
- **Result:** smooth light-rake from upper-left to 90° side, no morph, silhouette held. Good sequence.
- **Key win:** **the relight-trick survives a direction change** — answered Open Question #2. Side light at 90° put a clean vertical terminator down center (physically correct).
- **What worked:** reused V01's bright frame as V02's first frame (chained beats, zero drift); single variable (light direction only).
- **Lesson landed:** side light reads dramatically more sculptural/3D than upper-left — light *position* changes everything.
- **Scrub test:** PASS.

---

## Changelog
- **v1.3 (2026-06-06)** — Logged **Buddha Beat 1** (hoodie unzip → Buddha chest reveal). Clothing-unzip + calm-constant-lighting now **`[Confirmed 2x]`** → ready to PROMOTE to prompt-architecture. New: subject-stillness holds, high-detail tattoo reveal held without shimmer, a small chest crest recedes into shadow on its own, and the audio-discarded / keep-`(no subtitles)` workflow note.
- **v1.2 (2026-06-05)** — Logged tattoo R→L glide test: rotating metal glide works on Veo with NO morph (rotation viable in v1). New DON'Ts: Veo injects dramatic mid-motion light bursts (cinematic bias) and overshoots rotation when endpoints differ in angle — both need explicit suppression.
- **v1.1 (2026-06-04)** — Logged Video 02. Relight-trick + one-variable findings promoted to `[Confirmed 2x]`. Resolved Open Question #2 (direction-change relight holds). Added V03 high-key separation question.
- **v1.0 (2026-06-04)** — Created after Video 01 cracked. Seeded DO/DON'T, open questions, and V01 findings. Established the LOG → FINDINGS → PROMPT-ARCHITECTURE promotion pipeline.
