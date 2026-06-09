# Homepage Fragrance Plan — "Sun ma sugandha"

> **Sun ma sugandha** — *perfume from gold.* The gold is already real: the
> machine-sequence hero, the Buddha unzip, the service-slider morph, the artist
> relay. This document is not about replacing any of it. It's about the
> **fragrance** — the 100s of macro-level moments that turn a *very good* page
> into one a stranger can't stop thinking about. The goal: a visitor scrolls
> top to bottom and never once has to think *"wait — where am I?"* Every seam is
> one breath, not two. Every section earns its own quiet "Ahh."
>
> **This file is the single source of truth (SSOT) for the polish pass.** Read it
> before any fragrance work; update it as beats ship. Same discipline as
> [ARTIST_CLOSE_SEQUENCE_PLAN.md](ARTIST_CLOSE_SEQUENCE_PLAN.md): judged
> *scrubbed*, never on playback.

---

## The governing philosophy (read first, every time)

Four laws this whole plan serves. When a decision is unclear, return here.

1. **The fragrance lives in the seams, not the sections.** A user never
   consciously registers a transition done *right*. They only feel one done
   *wrong* — the half-second where the world resets and the reptile brain says
   "where am I?". Our job is to walk every boundary (last 10% of section N →
   first 10% of section N+1) and make it one breath.
2. **One world, one cinematographer.** Six sections must feel shot by the same
   hand: one color-temperature logic, one camera personality (arrive → settle →
   hold), one interaction grammar taught once and never broken.
3. **Correct by construction, not by timer.** The artist relay's guarantee —
   state advances only on *actual completion* of the beat before it — is a
   philosophy, not a component trick. Nothing in the experience should ever feel
   *approximate*. Wherever we still trust "roughly this long," tighten it.
4. **Restraint is premium.** Every addition below must remove a doubt, not add a
   decoration. If a move doesn't carry meaning, it gets cut.

---

## The three tiers (where we stand today)

Honest triage of the current page. The work is to drag Tier 3 up to Tier 1 and
add fragrance across all of it.

| Tier | Sections | State |
|---|---|---|
| **1 — World-class** | Machine-sequence hero (`ScrollSequence`), Buddha unzip (`SpiderSequence`), Service slider morph (`ServiceSlider`), Artist detail relay (`ArtistShowcaseSlider`) | Genuinely reference-grade. Touch only at the seams. |
| **2 — Strong, directionally right** | Brand Statement (`BrandStatement`), Gallery (`GalleryPinterest`), Artist wall (grid state) | Premium, but missing micro-interaction fragrance. |
| **3 — Still placeholder** | Testimonials, BookingCTA, Footer, the nav inside Header | The showroom-to-print-shop drop. Biggest perceived-quality cliff on the page. |

> **The cliff:** the single largest quality drop on the entire page is the
> moment a user leaves the artist relay (staged choreography) and hits the three
> static Testimonials cards. Closing that cliff is worth more than any one new
> animation.

---

## PART A — Systemic work (cuts across every section)

These five matter *more* than any individual section, because they touch the
whole page at once. Do these and the entire page lifts.

### A1 — Fix the navigation & hide the sandboxes *(trust floor — do first)*
**Problem:** 7 of 10 nav links point to `#` (click → nothing). Three internal
prototype routes (`Design 2`, `Concept 4`, `Concept 5`, plus the "Studio Tour"
→ `/concept-3`) are publicly exposed in the nav. A first-time visitor clicking
"Artists" and going nowhere — or landing in a raw prototype — breaks trust
faster than any animation can rebuild it.
**Why it's #1:** No amount of scroll choreography survives a navigation that
goes nowhere. This is the one thing that makes a user ask *"is this site real?"*
**The work:**
- Decide the real nav set. Likely: Home, About, Artists, Gallery, After Care,
  Contact — each pointing to a real section anchor (smooth-scroll) or a real
  (even if minimal) page.
- Wire the on-page ones to smooth-scroll anchors (Artists → artist section,
  Gallery → gallery section, etc.).
- Remove `Design 2 / Concept 3 / 4 / 5` from the public nav. Keep the routes
  alive for our own dev use — just not in the user-facing menu.
- Anything with no real destination yet: either build a minimal honest target
  or remove the link until it exists. **No dead `#` links ship.**

### A2 — A page-entry sequence *(the page currently has no "open")*
**Problem:** The page just *appears*. The machine sequence begins *in medias
res* — no opening breath. On Apple / Harmony OS the first ~800ms is authored as
carefully as any scroll beat: it's the brand saying *"we're in control, you're
in good hands."*
**The work:** A 600–800ms entry. Ink-black hold (`#070605`) → logo settles in →
dissolves into the first ready frame of the machine sequence as the hero canvas
becomes paint-ready. One breath before the world begins.
**Why it's high-leverage:** Nearly free to build, and it changes the
psychological register of *every single visit* from the first frame.
**Tie-in to A2b below:** this also covers the canvas first-paint seam.

### A2b — Seal the hero first-paint seam
**Problem:** Between "browser painted `#070605`" and "canvas drew frame 0" there
can be a visible flash on slower connections.
**The work:** a matching static first-frame image sitting *under* the canvas, so
there is never a bare-background gap. The entry sequence (A2) dissolves onto
*this*, then the canvas takes over invisibly.

### A3 — A custom cursor *(the invisible hand)*
**Problem:** The cursor is the user's hand inside our world — and it's the
browser default arrow. On a page at this craft level, that's plastic cutlery in
a five-star room.
**The work:** a small custom dot/ring cursor —
- default: a quiet ring/dot;
- over a CTA or link: shifts to **gold**, scales slightly;
- over a scroll-scrubbed section (hero, Buddha, service): shifts to a "drag /
  scrub" affordance so the user *knows* the section is interactive.
**Why it matters:** It's the first thing a senior creative director notices, and
the thing users *feel* but can't name: *"this isn't a template."* Must respect
touch devices (no custom cursor) and `prefers-reduced-motion`.

### A4 — Break the monotone Reveal *(choreography vs. template)*
**Problem:** [Reveal.tsx](components/Reveal.tsx) is a single recipe
(`opacity 0→1, y:40, dur 0.7, ease [0.22,1,0.36,1], once`) applied to *every*
text element on the page. Same offset, same duration, same direction, every
time → it reads *templated*, not *choreographed*.
**The work:** evolve `Reveal` into a small family of intents, used
deliberately:
- **heading** — larger rise (`y:60`), slightly longer;
- **body** — gentle rise (`y:24`);
- **stat / number** — opacity-only (`y:0`), no travel — it *resolves* in place;
- **decorative / rule** — slides/scales from a side or wipes its width.
Vary by *role*, not at random. The variation is what makes it feel authored.
**Discipline:** keep one shared easing vocabulary so it still feels like one
hand. Variation in *distance and role*, unity in *easing and rhythm*.

### A5 — Count-up the proof numbers
**Problem:** `★ 4.9`, `500+`, etc. in [BrandStatement](components/BrandStatement.tsx)
are static text — already finished the instant they appear. The *arrival* of a
number is the story; right now we just *state* it.
**The work:** when the proof row enters view, numbers count up from 0 to target
(~1.8s, exponential ease-out). `4.9` eases to 4.9, `500+` rolls to 500 then the
`+` lands. Fires once. Respects reduced-motion (snaps to final).
**Reuse:** the same count-up utility serves the artist stats and any future
"by the numbers" band — build it once, as a shared hook.

---

## PART B — Section-by-section fragrance

Ordered top → bottom as the user meets them. Each carries its own "Ahh" target.

### B1 — Header (beyond the A1 nav fix)
- **Nav-link hover** is a flat color swap today. Add a gold underline that
  *wipes* in from left, or a subtle letter-spacing breath. One consistent hover
  signature, reused on every link site-wide.
- **Active-section indicator:** as the user scrolls, the nav item for the
  current section quietly marks itself (gold dot / underline). This is a
  Harmony-OS-grade "you are here" affordance — the page narrating the user's
  own position.

### B2 — Machine-sequence hero (`ScrollSequence`) — Tier 1, seams only
- Verify the A2/A2b entry + first-paint seam land here cleanly.
- Confirm the header state at frame 0 feels *ready*, not mid-load.
- Otherwise: **do not touch the choreography.** It's reference-grade.

### B3 — Brand Statement (`BrandStatement`)
- The escape-velocity gate is sophisticated — leave the gate logic alone.
- **CTA has no hover state** → feels inert. Gold border brightens, background
  shifts, arrow `↗` nudges. Something must confirm *"I heard you."*
- The "Get studio tour" CTA points at `/concept-3` (a prototype). Make it a
  real destination or re-scope the link (ties to A1).
- Apply A5 count-up to the proof row here.

### B4 — Service slider (`ServiceSlider`) — Tier 1, but placeholder copy
- **Placeholder buttons "SEE MORE" / "SUBSCRIBE"** — wrong for a tattoo studio
  and they go nowhere. The most visible dead placeholders on the page. Replace
  with real intent: e.g. *"View this style"* / *"Book this artist"*, wired to
  real targets.
- **Progress bar only appears after first interaction** → a first-time visitor
  never sees the pacing affordance. Show a resting state, or auto-introduce it
  once on entry.
- Arrow buttons are typographic `‹ ›`. Promote to proper SVG icons with a hover
  micro-animation, matching the cursor language (A3).

### B5 — Gallery (`GalleryPinterest`) — Tier 2
- Audit hover states on tiles: each should have one consistent, quiet response
  (scale + shadow lift + caption reveal) — not a flat image.
- Confirm the lightbox open/close uses the *same* shared-element grammar as the
  artist relay (one interaction language, taught once — law #2).
- Check the seam into the artist section below: does the gallery *hand off*, or
  just stop?

### B6 — Artist showcase (`ArtistShowcaseSlider`) — Tier 1
- The detail relay (open + the planned close in
  [ARTIST_CLOSE_SEQUENCE_PLAN.md](ARTIST_CLOSE_SEQUENCE_PLAN.md)) is the
  reference for the whole page. **Finish the close sequence per that plan first**
  if not already shipped.
- Wall (grid) state: confirm card hover matches the site-wide hover signature.

### B7 — Testimonials — **the cliff. Highest-priority section work.**
**Problem:** After the artist relay's choreography, three static cards with no
hover, no faces, no rating visual, an HTML-entity `"` — it reads like a
different, lesser site.
**Decision required — pick ONE, do not leave it in between:**
- **Path A — Elevate:** horizontal scroll-driven cards, subtle parallax, author
  photos/avatars, a visual rating that *connects back* to the ★ 4.9 metric from
  BrandStatement (closing a loop across the page = one world).
- **Path B — Collapse:** reduce to a single full-width pull-quote — one
  sentence, maximum weight, gold serif on ink — so it *breathes* between two
  strong sections instead of competing and disappointing.
> The current in-between state is the only place on the page where the design
> philosophy isn't yet *decided*. Deciding is the work. **(See open question Q1.)**

### B8 — BookingCTA — the conversion moment, currently placeholder
**Problem:** A `TODO` lives in the component — background is a placeholder frame
from the scroll sequence, not a real studio/ink image. Button → `#book` (dead).
This is where the whole page's emotional investment is meant to *land*, and it
points nowhere.
**The work:**
- Real full-bleed studio / ink / skin image behind the scrim.
- `Begin your mark.` copy is genuinely strong — **keep it.** Build everything
  around it to match its ambition.
- Wire the button to a real booking destination/flow (even a minimal honest one).
- Give it the count-of-the-page's-best entrance — this is the emotional apex.

### B9 — Footer — the landing, not the termination
**Problem:** Every link → `#`. Instagram is plain text, no icon. "Made with
care" is generic.
**The work:**
- Real links (ties to A1).
- Treat the footer as a *resolved, earned ending* (Harmony-OS "landing"), not a
  dead grid. The `Permanence is a craft.` tagline is the right closing note —
  let it breathe, let it be the last quiet beat.
- Social icons, real contact, an honest copyright line.

---

## PART E — Antigravity-inspired additions (REVERTED 2026-06-08)

> **Status: built, then reverted at the user's call — didn't like the direction.**
> E1 (monument footer) and E2 (Styles mega-menu) were fully removed from
> Footer.tsx, Header.tsx, and globals.css. The rest of the page (A1–B9) is
> untouched. Kept the notes below for the record / in case the idea returns.

Sparked by the Google Antigravity footer + nav. We borrow the *concepts*, never
the skin (their white footer / geometric sans → we stay ink + Cormorant + gold).

### E1 — Monument footer wordmark
**Concept:** the brand name as a monument — the last, largest thing you see; the
purest form of "the footer is a landing, not a termination" (perfects B9).
**Decided:** **ghost** treatment (off-white, very low opacity — felt more than
read), reading **"Abishek Tattoo Ink"**, in Cormorant, on ink, full-bleed below
the existing wired columns + "Permanence is a craft." Stays in our dark world —
no light flip. Restraint over a solid-gold slab (gold keeps its preciousness).

### E2 — "Styles" mega-menu (one dropdown, as a system pattern)
**Concept:** Antigravity's hover mega-menu nav. **Discipline:** exactly ONE
dropdown (not their three) and it must open onto REAL destinations — we just made
the nav honest in A1, we don't undo that.
**Decided:** a single **"Styles ▾"** hover panel listing the 5 real craft
categories (Realism, Traditional, Blackwork, Cover-Up, Piercing) with their
one-line descriptors, each → the styles section (`/#styles`). Frosted dark, gold
hairlines, Cormorant headings; reuses the existing hover signature + custom-cursor
grammar. The trigger itself still links to `/#styles` (works on touch/keyboard
where hover doesn't). Build the panel as a reusable pattern.
_Future: deep-link each category to its exact service slide (needs the slider to
read a hash) — parked._

---

## PART C — Priority order (max "Ahh" delta first)

The sequence that buys the most perceived quality per unit of work:

1. **A1 — Nav + hide sandboxes.** Trust floor. Nothing else matters until a
   click goes somewhere. *(Do first, full stop.)*
2. **A2 / A2b — Page-entry sequence + first-paint seam.** Nearly free; changes
   the register of every visit from frame one.
3. **B7 — Decide & resolve Testimonials.** Closes the biggest quality cliff.
4. **B8 — Real BookingCTA.** The conversion apex can't be a placeholder.
5. **A3 — Custom cursor.** The "this isn't a template" signal.
6. **A5 — Count-up numbers** + **B3 CTA hover.** Cheap, high-felt fragrance.
7. **B4 — Service slider real copy/buttons.** Kill the last loud placeholders.
8. **A4 — Reveal variation** + **B1 nav hover / active indicator.** The polish
   layer across everything.
9. **B5 / B6 / B9 — Gallery, artist wall, footer fragrance.** Final coat.

> **Rule of the pass:** ship one item, scrub it live (open→close, both layouts,
> a few viewport widths, slow *and* fling scroll), update this file, then take
> the next. Never batch-and-pray.

---

## PART D — Open questions (DECIDED 2026-06-08)

- **Q1 (B7): RESOLVED → Collapse (Path B).** Testimonials becomes a single
  full-width pull-quote, gold serif on ink.
- **Q2 (A1): RESOLVED → Anchors + keep After Care.** Nav = Home, About, Styles,
  Gallery, Artists, After Care, Contact. On-page items smooth-scroll to section
  anchors; After Care is its own page (`/after-care`). Sandbox routes pulled
  from the public menu.
- **Q3 (B8): RESOLVED → mailto / contact anchor.** Booking buttons point to
  `mailto:hello@Abishek.ink` (or the contact section) as the honest interim;
  swap for a real flow later.
- **Q4 (A2): RESOLVED → quiet cross-dissolve, no bounce.**

---

## Verification discipline (every item, no exceptions)

Same standard as every phase before this:
1. `tsc --noEmit` clean.
2. Clean dev render.
3. **Judged scrubbed, never on playback** — slow scroll *and* hard fling, both
   directions, across the section's seams.
4. Reduced-motion + touch/mobile paths verified for anything motion- or
   cursor-related (A3, A4, A5 especially).
5. Update this SSOT: mark the item shipped, note what worked / what got tuned.

---

## Status log
*(append as items ship — date, item, what landed, what got tuned)*

- **2026-06-08 — plan authored.**
- **2026-06-08 — A1 (Nav + sandboxes) SHIPPED.** Real 7-item nav (Home/About/
  Styles/Gallery/Artists/After Care/Contact). Anchor IDs added to section roots
  (`#top` hero, `#about` BrandStatement, `#styles` ServiceSlider, `#gallery`
  Gallery, `#artists` ArtistShowcase, `#contact` Footer). `scroll-behavior:
  smooth` added to `html` with a reduced-motion guard; `scroll-margin-top:90px`
  on the in-flow targets (gallery, footer) so the fixed header doesn't cover
  them. Sandbox routes (design-2 / concept-3/4/5) removed from the menu; the
  in-body "Get studio tour" CTA re-scoped off `/concept-3` → `/#contact`. Built
  a real `/after-care` page (genuine aftercare guide, theme tokens + Reveal,
  reuses Header/Footer/BookButton). Verified: `tsc` clean; `/` and `/after-care`
  both HTTP 200; all 6 anchors present in homepage HTML; no `design-2`/sandbox
  links in nav. **Note:** wheel-gate sections untouched — smooth-scroll only
  affects programmatic/hash scroll, not the wheel scrubbing.
  _Still live-scrub pending: click each nav item in a browser, confirm the
  landing offset feels right on the full-bleed sticky sections (about/styles/
  artists land at exact top — intended)._
- **2026-06-08 — A2 / A2b (entry + first-paint seam) SHIPPED.** New
  `EntryCurtain` component (homepage only): ink-black hold, the round mark
  settles in (0.96→1, no bounce), then a quiet cross-dissolve (the mark opens
  to 1.06 as the curtain fades). **Correct-by-construction:** it holds on black
  until the hero fires `hero:ready` (flag + event, so a late-mounting curtain
  can't miss it), with a `MIN_HOLD` floor (logo is always seen) and a
  `MAX_WAIT` fallback (dissolves even if ready never fires). Freezes
  `body.overflow` under the curtain; reduced-motion skips it entirely.
  **A2b:** replaced the dark "LOADING %" panel in `ScrollSequence` with a
  first-frame poster (`frame_000001.webp`) that fades out the instant the
  canvas paints — the live canvas underneath is already on the same frame, so
  the hand-off is invisible (needed because `canvas{background:#070605}` means
  an *underlay* would be hidden — the poster must sit *over* the canvas). Kept a
  quiet gold load-line as the only progress feedback. Verified: `tsc` clean;
  `/` HTTP 200; curtain + poster present in SSR HTML (no pre-hydration flash).
  _Live-scrub pending: watch the black→logo→hero dissolve on a fresh load + a
  throttled-network load (curtain should mask the whole warm-up)._
- **2026-06-08 — B7 (Testimonials collapse) SHIPPED.** Replaced the three-card
  grid with a single centered pull-quote — gold serif italic on ink, `20ch`
  max, balanced wrap, flanked by hairline gold rules + attribution. A breath
  between the artist relay and the booking apex, not a competing section.
- **2026-06-08 — A3 (custom cursor) SHIPPED.** New `CustomCursor` mounted in
  the root layout (site-wide). Trailing gold-aware ring + exact-tracking dot:
  default off-white ring; **gold + enlarged** over anything interactive
  (`a, button, [role=button], input, label, [data-cursor=link]`); a wider gold
  **"scrub" ring** over scroll-driven sections (marked `data-cursor="scrub"` on
  the hero, Buddha, and service wrappers). Press shrinks the ring. Self-disables
  on coarse pointers (`pointer: fine` gate → native cursor on touch); snaps
  instead of trailing under reduced-motion. Native arrow hidden only while the
  JS cursor is active (`.has-custom-cursor` class). Verified: `tsc` clean; cursor
  nodes + 3 scrub markers present in DOM.
- **2026-06-08 — A5 + B3 SHIPPED.** New reusable `CountUp` (parses prefix/
  number/suffix + decimals out of strings like "★ 4.9" / "500+", rolls 0→target
  on view via easeOutCubic ~1.8s, IO-gated once, reduced-motion snaps,
  non-numeric like "Top Rated" renders as-is) wired into the BrandStatement
  proof row — reusable for artist stats next. B3: the "Get studio tour" CTA is
  now a `motion.a` — border + fill brighten and the ↗ nudges on hover (parent
  variant propagates to the arrow), tap press. Verified: `tsc` clean; `/` 200.
- **2026-06-08 — B4 (service slider) SHIPPED.** Placeholder buttons replaced:
  `BOOK THIS STYLE` → `BOOKING_HREF`, `VIEW GALLERY` → `/#gallery` (both
  `motion.a` with hover scale + tap). Progress bar now has an always-present
  resting **track** (a quiet gold rail) so first-time visitors see the pacing
  affordance before any click; the depleting fill rides on top once a
  transition starts. Typographic `‹ ›` promoted to a reusable `ArrowBtn` (SVG
  chevron, ring brightens + chevron nudges in its travel direction on hover).
  Verified: `tsc` clean; real CTA present, `SEE MORE`/`SUBSCRIBE` gone.
- **2026-06-08 — A4 + B1 SHIPPED.** A4: `Reveal` is now a role family
  (`heading` y60/longer, `body` y24, `stat` opacity-only, `rule` wipes from
  left, `default` unchanged) — one shared easing, varied distance/role; an
  explicit `y`/`x` still overrides. Applied across BrandStatement, Testimonials,
  BookingCTA (so text choreographs by role, not one recipe). B1: nav-link gets a
  gold underline that wipes in from the left on hover; an IntersectionObserver
  in Header marks the section crossing the viewport-middle as active (underline
  stays + brightens its label), homepage-aware via `usePathname` (After Care
  marks active on its own route). Verified: `tsc` clean; `/` & `/after-care` 200.
- **2026-06-08 — B9 (footer) SHIPPED.** Every link wired real: Studio (Home/
  About/Artists/After Care anchors), Visit (Find us/Styles/Book-a-consult →
  `BOOKING_HREF`), Connect (Instagram w/ inline SVG icon → real IG URL, email
  `mailto:`, phone `tel:`). Gold-on-hover via `.footer-link`. Bottom row now
  carries the studio location. Zero `#` dead links remain anywhere on the page.
- **2026-06-08 — FULL PRODUCTION BUILD GREEN.** `next build` exit 0 — compiled
  successfully, lint + type validity passed, all 10 routes prerendered
  (incl. `/after-care`). Homepage 159 kB first-load. Every Part-C priority item
  (A1, A2/A2b, B7, B8, A3, A5, B3, B4, A4, B1, B9) shipped; B5/B6 reviewed as
  already meeting the bar. **Remaining = live visual scrub** (browser): entry
  dissolve, nav-anchor landings, cursor states across scrub zones, count-up on
  the proof row, the collapsed quote, booking apex push-in.
- **2026-06-08 — E1 (monument footer) SHIPPED.** Ghost "Abishek Tattoo Ink"
  monument in Cormorant on ink (`rgba(242,239,233,0.07)`, ~12vw, nowrap, centered,
  overflow-clipped for a full-bleed feel) below the wired columns + tagline —
  the brand as the last, largest beat. Borrowed Antigravity's *concept*, kept our
  dark/serif/gold skin.
- **2026-06-08 — E2 (Styles mega-menu) SHIPPED.** "Styles ▾" in the nav now
  opens a reusable CSS-only hover/focus panel (frosted ink, gold hairline,
  Cormorant titles + Inter descriptors) listing the 5 real craft categories,
  each → `/#styles`. Caret rotates on open; hover-bridge keeps it open across
  the gap; trigger still links to `/#styles` for touch/keyboard. Active-section
  indicator + custom cursor work through it. Built as a system pattern (any nav
  item with `children` renders the panel). _Future: deep-link each to its slide._
- **2026-06-08 — BUILD GREEN (post E1/E2).** `next build` exit 0, all 10 routes
  prerendered. `tsc` clean.
- **2026-06-08 — E1 + E2 REVERTED.** User didn't like the Antigravity-inspired
  direction. Removed the monument wordmark (Footer.tsx), the Styles mega-menu
  (Header.tsx nav + render branch + `NavItem`/`NavChild` types), and all
  `.nav-group`/`.nav-panel` CSS (globals.css). Verified: `tsc` clean; `/` 200;
  `nav-panel` count 0; "Styles" back to a plain nav link; A1–B9 intact (footer
  links still wired). Net effect: page is exactly as it was after B9.
- **2026-06-08 — B5 / B6 reviewed: already meet the bar.** Gallery tiles
  already animate (image `scale(1.06)` + overlay/caption reveal on hover) and
  the lightbox already uses framer shared-element grammar; the artist wall cards
  already carry `whileHover y:-6` + a quiet gold active outline. No change
  needed — the gold's already there; left untouched to avoid risk.
- **2026-06-08 — B8 (BookingCTA) SHIPPED.** Converted to a client component.
  Real ink-on-skin backdrop (`realism_tattoo1.jpeg`, swap for the studio's hero
  shot later) under a deep dual scrim, with a slow 1.8s cinematic push-in
  (scale 1.14→1) as it enters view. `Begin your mark.` kept, now rising with a
  heavier `y:64`. Button + the persistent `BookButton` + the SpiderText CTA all
  wired to a single `BOOKING_HREF` in `theme.ts` (`mailto:` interim, Q3) — one
  place to swap later. Apex button gains a hover (scale + gold glow) and tap
  press. Verified: `tsc` clean; `/` & `/after-care` HTTP 200; mailto + real bg
  present; zero `#book` links remain site-wide.
