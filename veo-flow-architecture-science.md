# Veo / Flow Architecture & Science — Single Source of Truth

> **Purpose:** The canonical technical reference for our 3D immersive asset creation —
> how Veo & Flow are built, trained, and best prompted. Use this for design decisions,
> prompt engineering, and team discussion.
>
> **Honesty convention:** Every architectural claim is tagged:
> - `[Documented]` — stated in Google's official report or a peer-reviewed paper.
> - `[Inferred]` — a well-reasoned inference from the field; plausible but NOT confirmed by Google.
>
> Don't make a production decision on an `[Inferred]` claim without scrub-testing it first.

---

## 0. TL;DR for the team

- Veo 3 is a **latent diffusion transformer** that denoises **video + audio jointly** in a compressed latent space. `[Documented]`
- It was trained on video annotated with **multi-level Gemini captions**, and it **fills in every detail you leave unspecified** — so prompt specificity is *control over the sampler*, not just style. `[Documented]`
- It has a **bias toward cinematic cuts and drama** and is **prone to small hallucinations** — so "perfect consistency" is NOT guaranteed. **Always scrub-test.** `[Documented]`
- Best prompt = a **directorial screenplay**: Camera → Subject → Setting → Style → Audio, 75–150 words, positive phrasing.
- For consistency, **image conditioning (Flow Ingredients) beats text description.** `[Documented]` capability; exact internal mechanism `[Inferred]`.

---

## 1. The Architectural Shift: U-Nets → Latent Diffusion Transformers (DiT)

Earlier generative models used convolutional **U-Nets**, which struggled with global context and long-range temporal consistency. Google's modern creative suite moved to **Latent Diffusion Transformers (DiT)**. `[Documented]` (DiT: Peebles & Xie 2023; LDM: Rombach et al. 2022)

**Core components:**
1. **Variational Autoencoder (VAE)** — compresses high-res input into a dense **latent space**, stripping spatial/temporal redundancy while keeping structure and semantics. `[Documented]`
2. **Transformer backbone** — latents are flattened into **patches/tokens**; denoising happens in this tokenized latent space via **multi-head self-attention**, capturing global dependencies. `[Documented]`
3. **Cross-attention conditioning** — text/image/audio embeddings are injected into transformer layers via cross-attention, aligning output to intent. `[Documented]`

> **Note:** Google's own **Lumiere** (2024) used a Space-Time *U-Net*, not a transformer. Its lasting contribution was **single-pass space-time** generation (vs. keyframe-then-interpolate), a concept Veo carries forward. `[Documented]`

---

## 2. Google Imagen (Image Generation)

- **Tokenized latents** — images sliced into visual tokens; the transformer models relationships across the whole canvas at once, improving composition and spatial reasoning. `[Inferred]` for current Imagen specifics (Google hasn't fully detailed Imagen 3+).
- **Deep text understanding** — modern pipelines use strong **LLM text encoders** (original Imagen used T5-XXL), giving strong grasp of "X inside Y next to Z" relationships and clean in-image text rendering. `[Documented]` for original Imagen (Saharia et al. 2022); `[Inferred]` for latest version.

---

## 3. Google Veo (Video Generation)

Veo generates cinematic **1080p** video with **synchronous audio**. `[Documented]` (Veo 3 Tech Report)

### Confirmed architecture (from the Veo 3 Tech Report)
- **Latent diffusion**, with diffusion applied **jointly to temporal audio latents AND spatio-temporal video latents**. `[Documented]`
- Video and audio are encoded by **respective autoencoders** into compressed latents; a **transformer denoising network** is trained to remove noise, then applied iteratively to Gaussian noise at sampling. `[Documented]`
- Text is embedded by a **UL2 text encoder**; an optional **image input** has its own encoder. Both form the conditioning ("Embedded Prompt"). `[Documented]` (shown in the report's system diagram)
- Operates on a 3D latent block ≈ **(Channels × Time × Height × Width)**. `[Documented]`

### Reasonable inferences (NOT confirmed by Google)
- **3D Causal VAE** — that the video encoder compresses blocks of frames together (isolating motion from static background) using a *causal* design. Standard in the field (Sora, etc.), but the report only says "respective autoencoders." `[Inferred]`
- **Single-pass space-time generation** eliminating flicker/morphing — the report does **NOT** claim this. ⚠️ See the warning below. `[Inferred / overstated]`
- **Multi-stream attention** for text + image + audio — consistent with joint AV diffusion, but the specific "multi-stream" framing is interpretation. `[Inferred]`

### ⚠️ CRITICAL CORRECTION — do not over-trust "locked consistency"
A common claim is that Veo's single-pass generation guarantees *"objects do not randomly alter shape, textures remain locked."* **This is overstated.** The official report explicitly states Veo 3 is **"prone to small hallucinations"** and has a **"bias for generating cinematic footage, with frequent camera cuts and dramatic camera angles."**

**Implications for us:**
- Joint space-time denoising **reduces** morphing vs. old cascades — it does **not** eliminate it.
- The **camera-cut bias actively fights scroll-scrubbing.** Always prompt **"single continuous take, no cuts."**
- **Scrub-test every asset.** This discipline exists precisely because consistency is not guaranteed.

---

## 4. Google Flow (The Execution Platform)

Flow is the **orchestration/runtime platform on top of Imagen and Veo**, not a separate model. `[Documented]` (product positioning)

- **Image-to-Video anchoring** — an image (e.g. from Imagen, or an uploaded reference) can seed a video, preserving subject/design. `[Documented]` capability.
  - The stronger claim of a *literally shared latent space* with "no translation layer, preserved perfectly" is `[Inferred]` — more likely standard I2V conditioning (the image is encoded by Veo's encoder). Treat "perfectly" with skepticism.
- **Ingredients** — supply reference **images** so an object stays the *same* object across shots. **Our #1 weapon against morphing.** `[Documented]` feature.
- **Frames-to-Video** — give start (and optionally end) frames; Veo interpolates between them → near-deterministic camera moves. `[Documented]` feature.
- **Scenebuilder / Extend** — stitch and lengthen beats while holding continuity. `[Documented]` feature.
- **Inpainting / outpainting / cinemagraph masking** — regenerate or freeze regions. Real features; the "exposes raw transformer token pathways" framing is `[Inferred]`.

---

## 5. How It's Trained to Handle the Real World

From the Veo 3 Tech Report: `[Documented]`
- Trained on a **large dataset of images, videos, and annotations**.
- Annotated with **text captions at different levels of detail, using multiple Gemini models** (synthetic recaptioning — cf. DALL-E 3 / Betker et al. 2023).
- Filters for unsafe captions and PII; **semantic deduplication** across sources to reduce overfitting.
- **Desideratum: maximize adherence to the user's prompt.**
- Key property: *"...accurately depicting the specific details mentioned in the user prompt while **filling in all of the underspecified aspects** of the scene..."*

**Why this matters for prompting:** every variable you don't specify is **sampled** by the model. Underspecification = variance = morphing. **Specificity is control.**

---

## 6. Performance Metrics — The Honest Picture

- **The official Veo 3 report publishes SAFETY evaluations** (content safety, fairness across 140 professions, CBRNE, red-teaming) — **not** quantitative quality benchmarks. `[Documented]`
- **Field-standard quality metrics** (use these to reason about quality):
  - **FVD (Fréchet Video Distance)** — real-vs-generated distribution distance. (Unterthiner et al.)
  - **VBench** — 16 dimensions incl. *subject consistency*, *motion smoothness*, *temporal flickering* — **these are our scrub test, quantified.** (Huang et al., CVPR 2024)
  - **Human-preference Elo** — third-party arenas (Artificial Analysis Video Arena, LMArena) — where Veo's real-world ranking actually lives.

---

## 7. The Optimal Prompt Architecture — "Directorial Screenplay"

> **Operational note:** This section is the *theory*. For the day-to-day fill-in templates —
> including the two reference-conditioned modes (reference image → image, and start+end
> frame → video) — use the dedicated **[prompt-architecture.md](prompt-architecture.md)** playbook.

Grounded in the science: write like a **Gemini caption** (dense, descriptive, cinematographic), because that's the training distribution. The UL2 encoder parses grammar and relationships, so **full sentences beat keyword soup.**

### The 5-Part Framework
```
[Camera] → [Subject Core] → [Setting & Ambiance] → [Style & Texture] → [Audio & Directives]
```
1. **Camera** — perspective, angle, lens, movement first. *"A slow, low-angle tracking dolly shot..."*
2. **Subject Core** — active progressive verbs; be specific about materials/textures so the transformer can track them. *"...a brushed-titanium earbud rotating deliberately..."*
3. **Setting & Ambiance** — location, light sources, how shadows fall. *"...in a dark seamless studio void, single key from upper-left, soft volumetric haze..."*
4. **Style & Texture** — concrete medium DNA, not buzzwords. *"...cinematic realism, shot on 35mm, shallow depth of field, anamorphic flare..."*
5. **Audio & Directives (Veo)** — native audio; colon for dialogue. *"...Audio: low ambient hum, subtle mechanical click. (no subtitles)"*

### Engineering Rules
- **Length: 75–150 words.** Too short → model fills detail randomly; too long → risks **truncation at the text-encoder token limit** + attention dilution. (Mechanism note: it's truncation/dilution, not gradual "decay.")
- **Positive phrasing only.** Don't say "no cars" — the token *cars* activates attention and may render them. Say *"empty, clear asphalt street."* ⭐
- **Image-to-Video: do NOT re-describe style/subject.** The reference image already carries those latents. Use text **only** for camera movement, action trajectory, and audio. ⭐
- **One primary action per clip.** Joint AV denoising coheres around a single trajectory; two actions split attention and morph.
- **Suppress the cut bias for scrubbing:** always include *"single continuous shot, no cuts, locked deliberate motion."*
- **Camera-first ordering is ideal for our scroll work** — in a scrubbed asset, the camera move *is* the story.

---

## 8. The Academic Lineage — Papers to Read

| Concept | Paper | Authors / Venue |
|---|---|---|
| Diffusion foundations | Denoising Diffusion Probabilistic Models (DDPM) | Ho et al., NeurIPS 2020 |
| Latent-space diffusion | High-Resolution Image Synthesis with Latent Diffusion Models | Rombach et al., CVPR 2022 |
| Transformer-on-latents backbone | Scalable Diffusion Models with Transformers (DiT) | Peebles & Xie, ICCV 2023 |
| Adding the time axis | Video Diffusion Models | Ho et al., 2022 |
| Google cascaded video gen | Imagen Video | Ho et al., 2022 |
| Spacetime-patch framing (clearest public explanation) | Video Generation Models as World Simulators (Sora report) | OpenAI, 2024 |
| Transformer latent *video* diffusion (closest Veo ancestor) | Photorealistic Video Generation with Diffusion Models (W.A.L.T) | Gupta et al., 2023 |
| Google space-time U-Net | Lumiere | Bar-Tal et al., 2024 |
| Why dense captions make prompts work | Improving Image Generation with Better Captions (DALL-E 3) | Betker et al., 2023 |
| The text encoder Veo uses | UL2: Unifying Language Learning Paradigms | Tay et al., 2023 |
| Image model + strong text encoder | Photorealistic Text-to-Image Diffusion Models (Imagen) | Saharia et al., 2022 |
| Eval metric | VBench: Comprehensive Benchmark Suite for Video Generative Models | Huang et al., CVPR 2024 |

**Read only three:** DiT (the backbone), Latent Diffusion (the compression), Sora report (clearest plain-language explanation of spacetime patches).

---

## 9. Primary Sources

- [Veo 3 Technical Report — Google DeepMind (PDF)](https://storage.googleapis.com/deepmind-media/veo/Veo-3-Tech-Report.pdf)
- [Deconstructing Veo 3 — Google Cloud Community / Medium](https://medium.com/google-cloud/deconstructing-veo-3-a-technical-analysis-of-googles-unified-audio-visual-generation-model-6be023888489)
- [Veo 3.1: A Deep Dive for AI Engineers — Skywork](https://skywork.ai/skypage/en/veo-deep-dive-ai-engineers/1979008195877969920)
- [Scalable Diffusion Models with Transformers (DiT) — Peebles & Xie, ICCV 2023](https://openaccess.thecvf.com/content/ICCV2023/papers/Peebles_Scalable_Diffusion_Models_with_Transformers_ICCV_2023_paper.pdf)
- [Video Generation Models as World Simulators (Sora report) — OpenAI](https://openai.com/index/video-generation-models-as-world-simulators/)
- [Diffusion Models for Video Generation — Lilian Weng (survey)](https://lilianweng.github.io/posts/2024-04-12-diffusion-video/)

---

## 11. Chunked Continuity Strategy (Our Method for Complex / Morphing-Prone Sequences)

**Principle:** We don't "generate a video." We **engineer continuity across deterministic segments.** Hallucination and morphing are *cumulative* — drift compounds over time — so shorter generations drift less and resist the camera-cut bias. Chunking trades **internal drift** for a **seam problem**, and the seam problem is solvable by construction.

### Why it works
- **Shorter clip = tighter consistency window = less morphing.** A ~2s beat has a fraction of the drift opportunity of an 8s take.
- **Less room for the cut bias** — the model can't insert a dramatic cut inside a short, tightly-scoped beat.

### The seam problem (where chunking moves the difficulty)
Splitting one move into N chunks risks a **pop/jump at each boundary** (object angle, lighting, or position mismatch). On scrub, a seam pop is *worse* than slow morph because it's instant. **Chunking only wins if the seams are engineered.**

### The key technique — last-frame-becomes-first-frame
1. Generate **Beat 1**.
2. Extract its **last clean frame** (never a motion-blurred one).
3. Feed that exact frame as the **start frame** of **Beat 2** (Flow **Frames-to-Video** / **Extend**).
4. Beat 2 grows out of Beat 1's final pixels → boundary locked, no pop.
5. Repeat for every beat.

Reinforce with:
- **Ingredients (same object reference) across ALL beats** → identity stays locked through camera moves.
- **Identical style / light / color text** in every beat prompt → no exposure or palette drift.
- **A planned continuous camera path** → each beat is one segment of a single arc; end position of one = start of the next.

### Ideal for exploded views / assembly (our hardest, most morph-prone case)
> Beat 1: shell intact → begins separating.
> Beat 2 (init = last frame of B1): panels float to mid-position.
> Beat 3 (init = last frame of B2): panels reach full explosion.

Each stage is short, deterministic, and handed off frame-perfect.

### The pipeline
```
1. Storyboard the full move into beats (~2–3s each)
2. Lock ONE object reference image (Ingredient)
3. Generate Beat 1
4. Extract last clean frame  ──►  init frame for Beat 2
5. Repeat for all beats
6. ffmpeg-extract every beat to frames
7. Concatenate folders IN ORDER, renumber sequentially
8. SCRUB-TEST the seams specifically (drag slowly across each boundary)
```

### Cautions
1. **Pick a clean handoff frame** — the seam inherits its quality; never hand off on motion blur.
2. **Drop the duplicate boundary frame** when concatenating (last frame of B1 = first frame of B2) or you get a 1-frame stutter on scrub.
3. **Keep extraction fps identical** across beats, or scrubbing speed changes at the seam.
4. **Chunk as much as the drift demands, and no more** — more beats = more cost + more seams. Simple moves stay single-take; reserve chunking for long or morphing-prone sequences.

---

## 12. Changelog
- **v1.2 (2026-06-04)** — Section 7 now cross-links to the new operational [prompt-architecture.md](prompt-architecture.md) playbook (three input contracts). Theory stays here; fill-in templates live there.
- **v1.1 (2026-06-04)** — Added Section 11: Chunked Continuity Strategy (last-frame handoff technique, pipeline, cautions) as our official method for complex/morphing-prone sequences.
- **v1.0 (2026-06-04)** — Initial single-source-of-truth. Merges colleague's architecture doc with the Veo 3 Tech Report (primary source) + academic lineage. Every architectural claim tagged `[Documented]` / `[Inferred]`. Key correction: Veo does NOT guarantee morph-free consistency — scrub-test always.
