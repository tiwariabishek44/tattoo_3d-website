# Prompt Architecture — Operational Playbook

> **Open this every time you generate.** This is the *operational* doc (how to write the
> prompt for a given input mode). For *why* it works at the engine level, see
> [veo-flow-architecture-science.md](veo-flow-architecture-science.md) (Section 7 = theory, Section 11 = chunked continuity).

The key idea that governs everything below:

> **Whatever you provide as a reference (image or frames) already carries the appearance latents.
> So your TEXT's job changes depending on what you provide.** Don't describe what the reference
> already locks — spend your tokens on what the reference *can't* express.

---

## Global Rules (apply to ALL three contracts)

1. **Write like a caption, not a search query** — full cinematic sentences > keyword soup (the UL2 text encoder parses grammar).
2. **Positive phrasing only** — say "empty asphalt street," never "no cars." Naming a thing activates its attention.
   - *Strongest for renderable objects* — a negated object often still renders (the token activates it).
   - *Negated actions/edits* ("no cuts," "no camera move") are lower-risk but **still convert to positive** — it's never worse.
   - Conversions: "no camera move" → *"locked static camera"* · "no rotation" → *"holds its exact position"* · "no material change" → *"surface stays constant"* · "no cuts" → *"one continuous, unbroken take."*
   - **Exception — control tags:** directive flags like `(no subtitles)` are NOT scene-content negatives; they're Veo control tokens and are correct to keep.
3. **One primary action per clip** — two actions split attention and cause morphing.
4. **75–150 words** — too short → random fills; too long → token-limit truncation + attention dilution.
5. **Suppress the cut bias (video)** — always state it **positively**: *"one continuous, unbroken take, locked static camera, deliberate motion."* (Veo has a documented cut bias — phrase the fix positively, never as "no cuts.")
6. **Scrub-test the output** — the model does NOT guarantee consistency. Drag it slowly, frame by frame.

---

## Contract 1 — Text-only → Video

**When:** generating a fresh clip from nothing but words.
**Your text does everything.** Use the full 5-part Directorial Screenplay.

### Template
```
[Camera: angle, lens, movement]
[Subject: active progressive verbs + specific material/texture]
[Setting & Ambiance: location, light sources, how shadows fall]
[Style & Texture: concrete medium DNA — film stock, DOF, lens]
[Audio: ambient bed + one accent sound. (no subtitles)]
[one continuous, unbroken take] · [aspect ratio] · [duration]
```

### Worked example
> *Macro lens, slow S-curve orbit pushing in. A brushed-titanium wireless earbud rotates deliberately, its metal grain catching the light. In a dark seamless studio void, a single motivated key from upper-left with a crisp rim light tracing the edges, soft volumetric haze. Cinematic realism, shot on 35mm, shallow depth of field, cool steel-blue with a warm amber accent. Audio: low ambient hum, a subtle mechanical click. (no subtitles). One continuous, unbroken take. 16:9, 8s.*

---

## Contract 2 — Reference Image → Image

**When:** you give a reference image and want a new still (new angle, new light, variation) that keeps the subject identical.
**The reference OWNS the look.** Do **NOT** re-describe the subject's appearance — you'll fight the latents and cause drift.

### What the text is FOR (and not for)
| ✅ Text SHOULD specify | ❌ Text should NOT specify |
|---|---|
| What to **keep** (identity, materials) as an anchor | Re-describing the subject's color/shape/design |
| What to **change** (angle, pose, crop, framing) | Anything the reference already shows clearly |
| **Lighting / composition** adjustments | Redundant style words that conflict with the ref |
| **Style** shift, if any | |

### Template
```
[Keep: subject identity + materials from the reference, unchanged]
[Change: new camera angle / framing / crop]
[Lighting: the new light setup]
[Composition: placement, negative space]
[Style: only if shifting from the reference]
```

### Worked example
> *Keep the exact earbud identity and brushed-titanium material from the reference, unchanged. Re-frame to a low three-quarter hero angle, tighter crop. Light it with a single key from upper-left and a strong rim light separating it from the background. Centered with generous negative space above. Premium product-shot realism, shallow depth of field.*

---

## Contract 3 — Start + End Frame → Video (Frames-to-Video)

**When:** you have a **start frame** and an **end frame** and want Veo to generate the motion between them. This is the **engine of our Chunked Continuity Strategy** (Science doc §11) — the seam-locking handoff.
**The two frames are LOCKED boundary states.** Do **NOT** describe appearance — describe **only the transition.**

### What the text is FOR (and not for)
| ✅ Text SHOULD specify | ❌ Text should NOT specify |
|---|---|
| The **camera move** from start → end | The subject's look (locked by the frames) |
| The **in-between action / transformation** | Lighting/color (carried by the frames) |
| **Pacing** (slow, ease-in-out, weightless) | Anything that contradicts either frame |
| **Audio** | |
| "one continuous, unbroken take" | |

### Template
```
[Camera move that carries start state → end state]
[The in-between action / how the transformation unfolds]
[Pacing: slow, smooth ease-in-out]
[one continuous, unbroken take]
[Audio: ambient + accent synced to the motion. (no subtitles)]
```

### Worked example (one beat of an exploded-view sequence)
> *Continue the camera's slow S-curve orbit from the start frame to the end frame. The earbud's three outer panels detach and float outward to their mid-separation positions, drifting weightlessly apart. Slow motion, smooth ease-in-out. One continuous, unbroken take. Audio: low ambient hum, a soft mechanical click as each panel releases. (no subtitles).*

### Continuity reminders (from Science doc §11)
- Use the **last clean frame** of the previous beat as this beat's **start frame** → seam locked by construction.
- Keep the **same Ingredient/reference** and **identical light/color wording** across all beats.
- On export: **drop the duplicate boundary frame** and keep **identical fps** across beats.

---

## Quick Decision Table

| You have… | Use Contract | Your text describes… |
|---|---|---|
| Only an idea | 1 (Text → Video) | Everything (full screenplay) |
| A reference image, want a still | 2 (Ref → Image) | What to keep + what to change |
| Start & end frames, want motion | 3 (Frames → Video) | Only the transition + camera + pacing |

---

## Changelog
- **v1.1 (2026-06-04)** — Removed all negative phrasing that violated Rule #2 (the "no cuts" self-contradiction). Converted every "single continuous shot, no cuts" → "one continuous, unbroken take" across rules, templates, and examples. Expanded Rule #2 with the object-negative vs. action-negative nuance and a control-tag exception for `(no subtitles)`. (Bug found in peer review.)
- **v1.0 (2026-06-04)** — Initial operational playbook. Three input contracts (text→video, reference→image, start+end frame→video) with templates, worked examples, and the do/don't tables. Cross-linked to architecture Science doc §7 and §11.
