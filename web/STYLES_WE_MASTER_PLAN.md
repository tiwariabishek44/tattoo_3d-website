# Styles We Master — Soul Upgrade Plan (SSOT)

> Single source of truth for redesigning the **"Styles we master"** section so it adds
> *soul* to the homepage. Persona: **Kael Mercer** (creative CTO) per [CLAUDE.md](../CLAUDE.md).
> Read this first before touching the section. No code lives here — this is the *why* + *what*.
> Current component: [web/components/StylesCarousel.tsx](components/StylesCarousel.tsx).

---

## 0. One line
Turn the clicked card-carousel into a **scroll-driven, cinematic "service reveal"** — the
studio's *menu of services* told as an arc, in the site's own scroll-as-camera language,
so it stops feeling like a widget and starts feeling inevitable.

---

## 1. Purpose & emotional job

**What this section IS:** the studio's **service menu** — *"here is what Abishek Tattoo Ink
offers you"* (Fine Line, Blackwork, Traditional, Realism, Custom, Cover-Up, Piercing, Laser
Removal). It introduces capability *before* the gallery proves it.

**Distinct from the gallery** (no redundancy):
| Section | Job | Question it answers |
|---|---|---|
| **Styles we master** (this) | The **menu** — services offered | *"What can they do for me?"* |
| **Gallery** (below) | The **portfolio** — real artwork | *"How good is the work?"* |

> Dev note: the gallery currently *reuses* this section's photo data as placeholders. The
> gallery's real content (artwork collection) will diverge later — see
> [web/GALLERY_PINTEREST_PLAN.md](GALLERY_PINTEREST_PLAN.md). Plan this section as if that
> divergence already happened.

**Order (already correct, keep it):** `… StatsBand → Styles we master → Gallery → …`
Services introduce, then the portfolio delivers the proof.

**What the viewer should FEEL here:** they arrive *elevated* (machine hero + Buddha reveal +
trust from stats). The right beat now is **desire + confidence** — *"these are masters; I want
them to mark me."* Today they instead feel *handed a remote control.* Closing that gap is the
entire job of this upgrade.

---

## 2. Why the current version lacks soul (diagnosis)

Six gaps. The first is the root; the rest are symptoms.

1. **It breaks the site's one sacred contract — *scroll is the narrator.*** The hero, the
   Buddha unzip, and the gallery all respond to scroll — the viewer's thumb conducts the film.
   The carousel makes **scroll go dead**: to engage you must stop scrolling and switch to an
   *older* interaction (click arrows / drag sideways / wait for a timer). That context-switch
   is what snaps the dream. **Root cause.**
2. **It's a loop, not an arc.** Cards rotate 1→8→1 forever — no beginning, climax, or payoff.
   The subconscious clocks it: *nothing is building, I can leave and miss nothing.* Soul needs
   a destination.
3. **The card-fan announces its mechanism.** The rotated/blurred deck shouts *"I am a
   carousel."* Soulful sections *hide* their mechanism (you think "alive," not "frame-scrubber").
4. **The 5.2s auto-timer is anxiety, not breath.** It imposes *its* clock on a site whose whole
   promise is *"you control the reveal."* Borrowed pacing feels cheap.
5. **The work is held at arm's length.** Small cards on a dark stage, rotated *away*, receding
   into blur — a vitrine, not an embrace. Premium = presence = the work fills your world.
6. **Copy labels instead of moves.** "Blackwork — bold, graphic black, high impact" is brochure
   text. Labeling a craft never makes anyone *feel* it.

> Tell: the section doesn't even use the site's soul tech (scroll-scrubbed canvas) — it's a
> framer-motion widget. The two sections that sing both ride scroll. This one doesn't.

---

## 3. The direction — "The Service Reveal"  ★ recommended

Re-forge the section in the site's native language: a **pinned, scroll-driven editorial
sequence** where each service is a full-frame beat that the viewer *scrolls through* — no
buttons, no auto-timer, no card-fan.

**The picture:** the section pins (sticky). Scroll progress 0→1 advances through the services
one at a time. Each service is a **full-bleed editorial beat**:

- a large **macro photo** of that craft (ink under the needle, the texture of that style) that
  fills the frame and gently **breathes / parallax-scales** as you move through its beat,
- a **giant ghosted index number** (`01`–`08`) anchoring the "menu / ledger" feeling,
- the **service name** in the elegant serif,
- **one evocative line** (not a spec sheet — see §7), and quiet microcopy (e.g. *"by
  consultation"*).
- a thin **progress rail** (`01 — 08`) on the side showing position in the offering → gives the
  sense of an *index with a beginning and an end* (the arc).

It **opens** on service 01, **builds** through the menu, and **resolves** on a final beat —
*"These are the ways we'll work with you."* — that hands off softly into the gallery.

### Why this has soul (gaps → fixes)
| Gap (from §2) | Fix in this direction |
|---|---|
| 1. Breaks scroll contract | Driven entirely by scroll — rejoins the river. Scroll = narrator again. |
| 2. Loop, not arc | `01 → 08 → resolution → handoff` is a true arc with a destination. |
| 3. Mechanism announces itself | No card-fan; transitions are cinematic dissolves, the UI disappears. |
| 4. Imposed timer | No auto-advance — pace is the viewer's scroll. Breath, not anxiety. |
| 5. Arm's-length vitrine | Full-bleed macro fills the frame; the work comes *to* the viewer. |
| 6. Copy labels | Evocative one-liners + craft macro shots make you *feel* the style. |

---

## 4. Experience spec

- **Interaction:** scroll only. No prev/next buttons, no drag, no auto-timer. (Optional: arrow
  keys / a clickable progress rail as *accessibility* affordances, never the primary path.)
- **The arc / beats:** one beat per service (8 today). Each beat = enter → hold (readable) →
  exit. The last service flows into a short **resolution beat** that bridges to the gallery.
- **Progress rail:** vertical `01—08` index, current beat emphasized (gold), the rest quiet.
  Reinforces "a finite menu," which is what creates the sense of completion.
- **Handoff:** the section's exit should feel like a *breath into* the gallery, not a hard cut —
  e.g. the final beat eases toward the gallery's lighter tone / a feather seam (mirror the
  seam-safe gradient technique used around the Buddha sequence).

---

## 5. Layout & composition

- **Full-bleed, edge to edge**, using the shared `GUTTER` rail from [web/lib/theme.ts](lib/theme.ts)
  for the text column so it aligns with the rest of the site.
- **Editorial split** (desktop): macro image dominant (≈60–70% of frame) + a text column with
  the index number, service name, and line. The giant index number can overlap the image as a
  ghosted layer for depth (foreground type over midground photo over atmospheric background —
  the depth-stack discipline).
- **Section heading** ("Styles we master." + "What we do" eyebrow) holds, but should feel like a
  *title card* that the sequence emerges from — present at the start, receding as beats begin.
- **Mobile:** stack — full-bleed image with the type overlaid bottom-left; index number smaller
  but still present. Keep one idea on screen at a time.

---

## 6. Motion spec

- **Pin length:** section is `position: sticky` inside a tall scroll spacer. Total scroll height
  ≈ `beats × per-beat-VH`. Start target ~`120–160vh` per beat band; tune by scrub-feel, not math.
- **Scroll → beat mapping:** normalized scroll progress (0→1) maps to a continuous beat index;
  cross-fade adjacent beats so there's never a hard pop. Drive a *smoothed* scroll value
  (lerp / spring-damped) for buttery transitions — same philosophy as the reveal-zoom engine.
- **Within a beat:** subtle **parallax scale** on the image (e.g. 1.04 → 1.0 → 1.04) + a small
  vertical drift so it *breathes*. Type fades/rises in on enter, holds, fades on exit.
- **Reduced motion:** honor `prefers-reduced-motion` — drop parallax/scale, keep a simple
  cross-fade; never strand the user.
- **Mobile:** lighter parallax; ensure the pin doesn't fight mobile scroll inertia. (Mobile
  routing is globally paused per the deploy notes — desktop view ships everywhere for now — but
  build it responsive so it's ready.)
- **Scrub discipline:** judge every transition by **slow manual scroll**, never autoplay. Every
  beat must survive a slow scrub with no jank or pop.

---

## 7. Content model

**Services (8 today — confirm the final list):**
Fine Line · Blackwork · Traditional · Realism · Custom · Cover-Up · Piercing · Laser Removal.

**Copy direction — *evoke, don't spec.*** Each service gets a short, sensory line that makes you
*feel* the craft and trust the hand. Examples (drafts, to refine):
- *Realism* → "Skin that remembers a photograph." (not "photographic depth, rendered by hand")
- *Blackwork* → "Pure black, total conviction."
- *Fine Line* → "A whisper that lasts a lifetime."

**Image direction — *macro craft, not catalog thumbnails.*** Ideal assets are **close-up macro
shots**: ink meeting skin, the needle's line being pulled, the texture unique to each style.
This is what makes the work *present*. Fallbacks: the existing `public/crousls_images/` photos
+ machine frames (current placeholders) until macro shots exist.

> **Asset gap:** we likely need new macro photography (or generated macro stills via the Veo →
> frames pipeline) per service. Flag as a content task; don't block the build — ship with current
> placeholders, swap later (same pattern as the gallery).

---

## 8. Color & type

- **On-brand dark**, consistent with the section's neighbors (`COLORS.ink` ground, `COLORS.gold`
  accent, `COLORS.offWhite` text). The **white-theme experiment is dropped** (the light twin was
  removed; this section stays dark).
- **Typography:** keep the **elegant weight-500 serif** (`SERIF`) for names/headings — do NOT
  reintroduce the bold-700 unification we already reverted for losing the premium feel. Index
  numbers can be large, thin, ghosted. Eyebrow/microcopy in `SANS`.

---

## 9. Technical approach (high level — no code yet)

- **Sticky pin + scroll progress** model (CSS sticky + a scroll spacer), with a **smoothed
  scroll value** driving beat index, opacity cross-fades, and parallax transforms.
- Two viable engines: (a) lightweight framer-motion `useScroll` + `useTransform` (no canvas
  needed since beats are images + type), or (b) lean on the existing scroll-value plumbing used
  by the Buddha reveal-zoom for consistency. **Lean (a)** unless we want video-frame beats later.
- **No buttons / no auto-timer** in the primary path.
- **Performance:** preload/decode the per-beat images; responsive sizes per breakpoint;
  WebP/AVIF. Keep it light so the pin scrolls at 60fps.
- **Verify** with `cd web && npx tsc --noEmit` (NOT `next build` while dev runs).

---

## 10. Alternatives considered & rejected

- **Keep the card-fan, just polish it** — rejected: doesn't fix the root (still a clicked widget
  that breaks the scroll contract).
- **Cut the section entirely, let the gallery cover it** — rejected by the user: services and
  artwork are *distinct jobs*; the menu must introduce before the portfolio proves.
- **White-theme twin for dark/light compare** — built then removed at user's request; this
  section stays dark.
- **Horizontal scroll-hijack** (vertical scroll drives a sideways pan) — parked: on-brand-ish but
  a known gimmick and disorienting on some devices; the pinned-beat reveal is cleaner.

---

## 11. Open decisions / asset needs

- [ ] **Final service list & order** — is it the 8 above? Which leads (01) and which closes (08)?
- [ ] **Copy tone** — sign off on the "evoke, don't spec" direction + draft the 8 lines.
- [ ] **Images** — commission/generate **macro craft shots** per service? Or ship with current
  placeholders and swap later?
- [ ] **Resolution beat** — exact handoff copy + how hard/soft the seam into the gallery.
- [ ] **Progress rail** — keep the `01—08` index, or go even more minimal?

---

## 12. Build phases

1. **Phase 0 — sign-off:** confirm direction (§3), service list, copy tone, asset plan.
2. **Phase 1 — structure:** sticky pin + scroll-progress → beat index, with current placeholder
   images and draft copy. Get the *arc* feeling right on slow scrub.
3. **Phase 2 — motion polish:** smoothed value, cross-fades, parallax breath, progress rail,
   reduced-motion + mobile fallbacks.
4. **Phase 3 — content pass:** real macro images + final copy; tune type scale & seams.
5. **Phase 4 — handoff seam:** resolution beat → gallery bridge; full-page rhythm check.
6. **Phase 5 — ship:** `tsc --noEmit`, scrub-test, commit + push (auto-deploys).

---

## 13. Status & changelog

- **2026-06-06 — Plan created.** Diagnosis agreed (carousel lacks soul: breaks scroll contract +
  loop + widget feel). Direction chosen: **"The Service Reveal"** (pinned scroll sequence).
  White-theme twin removed. Section stays *above* the gallery (services → portfolio).
- **2026-06-06 — Phase 0 signed off.** 8 services; **Realism leads (01)**, **Blackwork closes
  (08)**; copy tone = "evoke, don't spec" (Kael's call); images = placeholders now, macro swap later.
- **2026-06-06 — Phase 1 + 2 built.** New component
  [web/components/ServiceReveal.tsx](components/ServiceReveal.tsx) → swapped into
  [web/app/page.tsx](app/page.tsx) (replaces `StylesCarousel`). Pinned sticky stage, scroll-driven
  beat crossfades, parallax-breath, reduced-motion + compact fallbacks, vertical progress rail
  (desktop) / counter (mobile), keyboard + clickable-rail affordances. Copy lines drafted for all
  8. `BEAT_VH = 85` (tunable). `tsc --noEmit` clean. **Not yet committed/pushed.**
  - Old [web/components/StylesCarousel.tsx](components/StylesCarousel.tsx) now **unused** (kept for
    reference; safe to delete on confirm).
  - **Pending:** scrub-test in dev (slow scroll), copy/pacing tune, Phase 3 (real macro images),
    Phase 4 (resolution beat + gallery seam), then ship.
- **2026-06-06 — Review #1 + concept-page approach.** Feedback: pace too fast, full-bleed image +
  dark gradient *buries the artwork* (can't see craft/detail), text fade too fast. Concept is
  exceptional — enhance on the same foundation. Realization: **on a tattoo studio's services
  page the work IS the hero — never darken the art to caption it.**
  - Pacing fixes (all variants): `BEAT_VH` 85 → **135**; reshaped each beat to **enter → HOLD
    (image still, ~54% of beat) → exit**; text **slowed + staggered** (image settles first, words
    arrive a beat later) with `cubicBezier(0.4,0,0.2,1)` easing.
  - `ServiceReveal` now takes a **`variant`** prop and **three compositions** are live as pages,
    linked in the top nav, to A/B in the browser before inheriting the winner home:
    - **/concept-1 — `split`**: clean image one side, text the other (art never darkened).
    - **/concept-2 — `plate`**: whole piece framed like a hung print (object `contain`), label below.
    - **/concept-3 — `cinematic`**: enhanced full-bleed, light *bottom-only* gradient, art visible.
  - Homepage still renders `cinematic` until a winner is chosen, then we inherit it & drop the rest.
  - `tsc --noEmit` clean. **Not committed/pushed.**
- **2026-06-06 — Review #2 → motion engine rebuilt (craft pass).** Feedback: parallax not smooth,
  fonts too small, fades/pace still too fast, no "ahh". Root causes found & fixed:
  - **Raw scroll → inertial smoothing.** All visuals now driven by `useSpring(scrollYProgress,
    {stiffness:48, damping:24})` — the buttery layer. (This was THE miss: raw `scrollYProgress` is
    steppy, which read as both "janky parallax" and "too fast".)
  - **Real parallax (3 layers).** Image / index-number / text drift at **different rates**
    (`PAR_IMG 16 · PAR_NUM 34 · PAR_TXT 60` px) → genuine depth, not a flat zoom. Framed variants
    parallax the image *content inside a static frame* (proper depth) via `<FramedImage>`.
  - **Monumental type.** Service name → `clamp(4rem, 8.5vw, 9.5rem)`; line + ghost number scaled up.
  - **Longer eased holds.** `BEAT_VH` 135 → **150**; per-beat enter(0–18%) → HOLD(18–82%) →
    exit, text staggered inside the hold (26–86%), all `cubicBezier(0.4,0,0.2,1)`.
  - All knobs centralised at top of [ServiceReveal.tsx](components/ServiceReveal.tsx) (`BEAT_VH`,
    `SPRING`, `PAR_*`). `tsc` clean. Still 3 concepts; awaiting scrub review.
- **2026-06-06 — Concept 3 chosen · 1 & 2 retired.** User picked **Concept 3 (cinematic
  full-bleed)**. Diagnosis: full-bleed exposes the placeholder photos (wrong aspect / soft /
  cropped) — the "ahh" needs **purpose-built 16:9 hero stills** (composed for the frame, hi-res,
  cohesive, with safe negative space for text), like the machine hero frames.
  - `ServiceReveal` simplified to **cinematic-only** (removed `variant` prop, split/plate branches,
    `FramedImage`, `RevealVariant`). `/concept-1` & `/concept-2` pages deleted; nav links removed.
    `/concept-3` kept as the standalone testbed. Homepage already renders it.
  - **Future elevation** (scroll-scrubbed micro-sequences) captured & PARKED in
    [web/SERVICE_MICRO_SEQUENCE_PLAN.md](SERVICE_MICRO_SEQUENCE_PLAN.md).
  - `tsc` clean. **Not committed/pushed.**
  - **NEXT: Phase 3 asset generation** — the 8 cohesive 16:9 hero stills (this is the upcoming work).
- **2026-06-06 — Direction pivot: scroll-scrub dropped for the services section.** Insight (user):
  the homepage already has **two** scroll-scrub sequences (machine hero + Buddha) — a third is
  scroll fatigue and weakens the real crescendos. After the two sequences the page should **breathe
  as calm info** (like the gallery). So "Styles we master" becomes a **calm, click-driven section**,
  not a scroll spike — and it should look different from the gallery's masonry grid.
  - Chosen pattern: a **featured-image slider** (LunDev "DESIGN SLIDER / ANIMAL" reference) — one big
    clear image + thumbnail strip + arrows. Gives the "see it clearly" win with no scroll-hijack.
  - **Built [web/components/ServiceSlider.tsx](components/ServiceSlider.tsx)** on **/concept-3**
    (replaced the cinematic `ServiceReveal` there): reference colours (orange accent), our own
    `Header` floating over it, 3 jungle stills from `public/crousal_images2/` in **rotation across 6
    slides**, **no auto-advance** (manual arrows + clickable thumbnails), crossfade + slow Ken-Burns
    bg, AnimatePresence text. `tsc` clean. **Not committed/pushed.**
  - **Pending:** review the prototype; then re-skin to **tattoo content + gold theme**, wire SEE
    MORE/SUBSCRIBE, and (if it wins) swap it into the homepage, retiring the pinned `ServiceReveal`.
    The 16:9 hero-still asset work now feeds THIS slider. Micro-sequence elevation still parked.
- **2026-06-06 — Slider transition polished + inherited into the homepage.** Iterated the
  click/arrow transition to match the reference exactly:
  - **Grow-from-thumbnail** morph (framer `layoutId`) fixed to fire on **every** click (`key`
    remount); thumbnail strip kept **above** the growing image (it blooms in *behind* the thumbs);
    growing image **fades in** over the previous one.
  - One pace knob **`BAR` (2.6s)**: image fits the screen by **70%** (bar's last 30%); the
    **orange top progress bar** depletes linearly over the whole `BAR`.
  - **Slogan fades in LINE BY LINE** starting at **~45% remaining** (55% elapsed), staggered so the
    last line lands as the bar hits 0; old slogan **fades out first** (killed the "blink").
  - Progress bar switched `fixed → absolute` so it pins to the slider's own top (works mid-page).
  - **Inherited into the homepage**: [web/app/page.tsx](app/page.tsx) now renders `<ServiceSlider />`
    in the "Styles we master" slot (between StatsBand & Gallery), same animal assets + reference
    colours for now. The pinned **`ServiceReveal` is now UNUSED** (kept for reference; safe to delete).
  - `tsc` clean. **Not committed/pushed.**
  - **NEXT:** re-skin slider → tattoo content + gold theme; replace animal stills with the 8 service
    images; wire the two buttons; real slogan copy.
- **2026-06-06 — Slider repurposed: STUDIO TOUR (Kael's call).** Decided the slider's one job is the
  **studio tour** — the missing *trust/experience* beat (clean, professional, welcoming space) —
  distinct from styles and the gallery. (Reasoning: a tattoo is scary + permanent; people need to
  see the space before booking; the labeled featured-slider is tailor-made for touring named areas;
  real photos, no asset generation.) The styles/"traditional Nepali motifs meet modern ink" story
  is deferred to a *different-looking* section later (don't run the slider pattern twice = pattern
  fatigue).
  - Component **renamed `ServiceSlider.tsx` → [StudioTour.tsx](components/StudioTour.tsx)**; same
    transition DNA, new content: areas = **Reception · Private Studios · Sterile Station · The Art
    Wall · Consultation Lounge · Aftercare Bar** (6, rotation). Headline = constant **"STEP INSIDE"**
    + the **area** as the orange accent line; per-area description; eyebrow **"Abishek'S TATTOO INK"**;
    CTAs **BOOK APPOINTMENT / EXPLORE OUR WORK**.
  - Assets = placeholder tattoo photos from `public/crousls_images/` (cross of service + gallery) —
    swap for real **studio interior** photos later. Reference orange still; gold re-skin later.
  - Homepage + /concept-3 both render `<StudioTour />`. `tsc` clean. **Not committed/pushed.**
- **2026-06-06 — Course-correct: studio idea moved to the BrandStatement (2nd div); service slider
  reverted.** Misread earlier — the studio content belonged in the **second div** (the
  `BrandStatement`, "Where traditional Nepali motifs meet modern ink"), NOT the service section.
  - **Reverted** the service slider: `StudioTour.tsx` → back to
    [ServiceSlider.tsx](components/ServiceSlider.tsx) with the original LunDev animal content;
    re-pointed homepage + /concept-3. Service section is **unchanged** again (still the placeholder
    animal slider, re-skin later).
  - **Rebuilt [BrandStatement.tsx](components/BrandStatement.tsx)** as a FIXED studio anchor (no
    slider/scrub — gentle `Reveal` fade only): gold-dash eyebrow "Abishek's Tattoo Ink", two-tone
    gold/white serif slogan (kept "…motifs meet modern ink"), brand paragraph, and a gold-bordered
    **studio-interior photo with a fixed label card** ("Our Studio / Thamel, Kathmandu"). **No stats,
    no CTAs** (per request). Placeholder photo for now; swap a real interior shot later.
  - `tsc` clean. **Not committed/pushed.**
