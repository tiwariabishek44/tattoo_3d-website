# Tattoo Studio Hero — "The Instrument"

> **Single source of truth** for the tattoo-studio landing-page hero sequence.
> A floating tattoo machine that arcs across the screen as the user scrolls, revealing
> itself station by station. Our first real product built from the 50-video training.
>
> **Companions:** prompt contracts → [prompt-architecture.md](prompt-architecture.md) ·
> chunked-continuity method → [veo-flow-architecture-science.md](veo-flow-architecture-science.md) §11 ·
> empirical DO/DON'T → [findings-log.md](findings-log.md)

---

## Project meta
- **Client/context:** tattoo studio landing page (scroll-driven hero).
- **Big idea:** *The Instrument* — the studio's machine as a premium hero object moving through space.
- **Tone:** **Precision craftspeople** — cold, exact, premium-tech. (Not warm/soulful.)
- **Strategic value:** this is a **reusable pattern** — "hero object floating, arcing, revealing itself, text choreographed around it." Crack it once → reuse for any object/client/sequence.

## 🔑 Production rules (read before generating)
1. **NO text in the sequence.** All labels/copy are **HTML overlays added at website-development time** — never baked into the video or frames.
2. **Leave clean negative space** on the side opposite the machine, in every station, for the overlaid text. Machine ~⅓ of frame; opposite ⅓ kept empty.
3. **Lock the studio's REAL machine** as the reference (Flow Ingredients) so it's the *same* instrument at every station — this is the "genuine" anchor.
4. **The machine touches nothing** — floats at the artist's working grip angle, with a faint weightless **breathing** drift throughout.
5. **Build as chunked, seam-locked beats** (Science §11): last frame of each arc = first frame of the next.
6. **Scrub-test every beat** — no morph on the machine across the arcs.

## Art direction (precision-craft)
- Dark premium void · one **cool steel-blue** accent · deep blacks.
- Crisp **rim light** for separation (V03) + a controlled **key** for sharp metal speculars (V01/V04).
- Cool **volumetric haze**, faint particles for atmospheric depth (no ground contact).
- Deliberate, *exact* pacing; clean settles at each station; subtle rotation + arc between (not a flat slide).
- **16:9** desktop hero.

---

## Motion spine
**R → L → R → L** — starts RIGHT, ends LEFT. 4 stations, 3 connective arcs.
Arc: **Authority → Precision → Engineering → Invitation.**

---

## The 4 Stations

### ⬛ Station 1 — RIGHT · *The Authority* (text overlay: left)
Machine in the right third, **full view**, tilted at the artist's grip angle. Cool rim traces its silhouette; a controlled key reveals the engineered metal. Hovering, alive, breathing.
**Feeling:** a serious instrument — authority, craft.
**Label intent (dev overlay):** *"Precision is permanent."* (placeholder)

*→ Arc 1: travels right→left, **rotating** to bring a new facet forward, light raking across (V02).*

### ⬛ Station 2 — LEFT · *The Precision* (text overlay: right)
Camera **pushes to macro** on the needle cluster — extreme close, shallow depth of field, tip in razor focus, everything else bokeh. Tight cool specular on the point.
**Feeling:** exactness, obsession, mastery.
**Label intent (dev overlay):** *"Every line, deliberate."* (placeholder)

*→ Arc 2: pull back, travel left→right, machine rotating to present its engineered body.*

### ⬛ Station 3 — RIGHT · *The Engineering* (text overlay: left)
Clean 3/4 hero of the machine's **build** — a subtle, contained hint of its mechanism / coil tension. Not an explosion (restraint) — just enough to read *engineered.*
**Feeling:** precision-built, trustworthy.
**Label intent (dev overlay):** *"Built like an instrument, for the artist's hand."* (placeholder)

*→ Arc 3: final travel right→left, rotation easing to rest, light calming.*

### ⬛ Station 4 — LEFT · *The Invitation* (text overlay: right) — **END POSITION**
Machine **settles** in the left third, back to the calm artist's-angle pose, breath slowing, rim light resolving to a clean premium edge. Poised, ready.
**Feeling:** an invitation.
**Label intent (dev overlay):** *"Begin your piece."* + booking button. (placeholder)

---

## Pipeline mapping
- **One locked machine** (Ingredients) → same instrument every station.
- **3 connective arcs = 3 seam-locked frames-to-video beats** (Science §11).
- **Sphere drills applied:** rim (V03) separates · key (V01/V04) sculpts the metal · rake (V02) carries transitions · macro/bokeh (Station 2) = depth practice.
- **Delivery:** ffmpeg frames → WebP/AVIF → scroll-scrubbed canvas, sticky container ([frame-sequence-stack.md](frame-sequence-stack.md)). Text = HTML overlay layered above the canvas.

## Open decisions / next steps
- [ ] Confirm the **machine reference image** (studio's real machine) → lock as Ingredient.
- [ ] Final **copy** for each station (studio's real voice) — added at dev time.
- [ ] Storyboard **Station 1** frames (first/last) and its breathing loop.
- [ ] Decide total scroll length / pacing per station.

## Changelog
- **v1.0 (2026-06-04)** — Initial single source of truth. Tone (precision-craft), motion spine (R→L→R→L), 4 stations (Authority/Precision/Engineering/Invitation), production rules (text is dev-time HTML overlay; leave negative space; lock real machine), pipeline mapping.
