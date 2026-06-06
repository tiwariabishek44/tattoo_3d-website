# "The Awakening" — Spider Reveal Sequence (Single Source of Truth)

> A grounded, scroll-driven story: a man in a **zipped-up hoodie** → the hoodie **unzips
> downward and falls open**, revealing his bare chest with a **spider tattoo** → then the
> spider **lifts off the skin, crawls left, and vanishes.** The "your ink is alive" moment
> for Teyung Tattoo Ink.
>
> **Operating rule:** before generating any prompt, read [prompt-architecture.md](prompt-architecture.md)
> + [findings-log.md](findings-log.md). Build as chunked beats (Science §11). Scrub-test every seam.

---

## Concept & metaphor
Reveal the living art **beneath the hoodie**. A real person unzipping to show their ink is
honest and human — relatable, not gimmicky — then the spider crawling off the skin is the
screenshot-worthy payoff. *Your ink isn't decoration; it's alive, part of you, and it can move.*

## Locked direction
- **Zip = a literal hoodie**, unzipping **top → bottom** (the natural way), falling open to reveal the chest. *(Chosen over the surreal skin-zip: more grounded, more genuine, much lower morph risk on Veo — clothing + skin are organic and forgiving.)*
- **Revealed area: the male upper chest** (the locked anchor image — spider over the chest, **facing left**).
- **Feeling at second 3:** intimate, mysterious, a dark edge (the spider).
- **Palette:** warm organic skin + deep shadow; intimate, low-key, cinematic. (Distinct from the cold-metal hero — this one is warm and alive.)
- **Structure:** chunked beats with locked-frame handoffs. Paid Veo for keepers, free Flow to iterate.

## The anchor (locked)
A photoreal **male chest with the spider tattoo** (left-facing), 16:9 — generated and locked.
Every beat is built from this exact image so the spider never drifts.
*(Open: keep the solid-black abdomen, or regenerate with the reference's white marking.)*

---

## 🔄 PIVOT (2026-06-06) — Buddha figure, not a spider
The reveal motif is changing from a **spider** to a **seated Buddha figure** (a Nepali-heritage
tattoo) — embodying the Kathmandu studio, directly answering the homepage line *"traditional
Nepali motifs meet modern ink."* *(Briefly considered the Swayambhu "Buddha eyes"; chose the full
figure for its presence/gravity.)* The **mechanic is unchanged** (hoodie unzip → chest reveal);
only the tattoo art changes. The "alive" beat is reframed to a **reverent glow of awakening** —
*light, not motion* (Buddha = the Awakened One; light = enlightenment). Cultural reverence is
non-negotiable: dignified, **upright, head up, over-the-heart** placement; serene meditating figure.
Craft note: keep the design **bold/clean over hyper-fine** so detail survives compression + the scrub.
Next: user supplies a clean front-on seated-Buddha reference → new anchor prompt → rebuild Beat 1.
*(Spider content below is superseded; kept as a record of the proven unzip mechanic.)*

## 🔑 Narrative decision (2026-06-06) — the web sequence ENDS at the reveal
The promise is **"Ink that's alive."** A living tattoo that **crawls off and leaves**
*contradicts* that — and contradicts the whole point of a tattoo (permanence). So the
**web build (`/design-2`) ends at the reveal**, on the slogan, held over the settled spider.
The contradiction is specifically **departure**; an *in-place* sign of life (a breath / a
single leg-flex that **stays**) would *support* the message — a possible **phase-2** asset.
**Beat 3 (below) is cut from the web sequence and its rendered assets were deleted.** Kept here
as a record / a seed for a future *darker* concept ("your ink has a mind of its own").

## The Beats

### Beat 1 — The Unzip  *(difficulty: low–moderate)*
- **First frame:** the **same man, framing, and light as the anchor**, but wearing a **zipped-up hoodie** that covers the chest. The pull sits at the **top**, near the collar. Intimate, low-key, warm.
- **Last frame:** = the **anchor** — the hoodie is **open**, pulled apart down the centre, revealing the bare chest with the spider tattoo crisp and centred.
- **Motion:** the zipper pull glides **downward**; the hoodie falls open, revealing the chest + spider. Locked camera, the man holds still. One continuous, unbroken take.
- **Variable:** the hoodie state (zipped → open) — one primary action.
- **Build:** first frame = the anchor + a zipped hoodie added over it (same man/light/framing); last frame = the anchor itself. Single variable changes → clean, scrub-safe reveal.
- **Craft note:** clothing unzip is a natural motion Veo handles well; keep the camera on the **opening + the pull**, not individual zipper teeth.

### Beat 2 — The Reveal  *(difficulty: low — a held breath)*
- **First frame:** = Beat 1's last frame (hoodie open, chest + spider revealed).
- **Last frame:** the full chest + spider, settled, centred — a breath of stillness (subtle skin "breathing" or a slow push-in).
- **Motion:** near-none — the pause that lets the viewer absorb the tattoo before it moves.

### Beat 3 — The Awakening  *(difficulty: HIGH — the make-or-break & the star)*
- **First frame:** = Beat 2's last frame (spider tattoo flat on the chest).
- **Last frame:** the spider **gone** — crawled off the **left edge** (or dissolved into shadow), leaving bare chest (or a faint after-mark).
- **Motion:** the spider's legs lift → it **peels/detaches** from the skin (dimensional, casts a shadow) → **crawls left** → reaches the edge → **vanishes**.
- **Variable:** the 2D→3D transformation + the leftward crawl.
- **⚠️ Risk:** a flat tattoo becoming a 3D crawling creature is the most morph-prone thing we've attempted — legs/anatomy can melt mid-crawl. (Bonus: the anchor's 3D sunburst shading already makes the spider look ready to lift, so it's a smaller leap.)
- **De-risk:** keep the awakening **suggestive** (lift legs → shadow → peel → crawl); **lock the spider design**; **sub-chunk** into 3a (detach) + 3b (crawl & exit); **scrub-test ruthlessly**; if Veo morphs the spider, escalate to **Seedance / Higgsfield**.

---

## Production method
- **Chunked continuity (Science §11):** last clean frame of each beat = first frame of the next → seams lock by construction.
- **Locked references (Ingredients):** the **chest-with-spider anchor** + the **spider design**, so identity holds across the reveal *and* the awakening.
- **Tooling:** Paid Veo for keeper renders; free Flow to experiment. Frames-to-video per beat.
- **Pipeline:** beats → ffmpeg frames → WebP → scroll-scrub (worker renderer on mobile).
- **Discipline:** single variable per beat; positive phrasing; "one continuous, unbroken take"; scrub-test every seam (Beat 3 especially).

## Asset / reference needs
- [x] **Anchor:** photoreal male chest with the spider tattoo, left-facing, 16:9 (generated — confirm final + lock).
- [ ] **Beat 1 first frame:** the anchor + a zipped hoodie (same man/light/framing).
- [ ] Consistent **spider design** carried through Beat 3.

## Where it lives
A dedicated **scroll-scrub story section** on the Teyung page ("the art lives" feature) — or a standalone showcase. *(Decide before web integration; the asset is built the same either way.)*

## Open decisions
- [ ] Anchor abdomen: keep solid black, or regenerate with the reference's white marking?
- [ ] Beat 3 as one beat or sub-chunked (3a/3b)? (recommend sub-chunked)
- [ ] Spider exits off-screen vs dissolves into shadow?
- [ ] Tattoo leaves a faint after-mark, or bare chest?

## Build order
1. **Lock the anchor** (chest + spider). ← current step
2. Beat 1 first frame (zipped hoodie over the anchor) + last frame (anchor, hoodie open) → unzip-downward → scrub-test.
3. Beat 2 (reveal/hold).
4. Beat 3a (detach) → 3b (crawl & vanish) → scrub-test hard.
5. Stitch beats → frames → web section.

## Changelog
- **v1.1 (2026-06-06)** — Reveal changed from a **surreal skin-unzip on the back** to a **literal hoodie unzipping downward on the male chest** (more grounded, genuine, lower morph risk). Anchor = chest-with-spider (left-facing) generated; Beat 1 now hoodie-closed → hoodie-open.
- **v1.0 (2026-06-05)** — Initial single source of truth (3-beat surreal spider-reveal).
