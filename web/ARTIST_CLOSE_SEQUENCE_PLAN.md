# Artist Story Sheet — Close Sequence ("Taking Leave") Plan

> Mirror the open's staged relay — face, then story, then work — with a staged
> close that moves through the same elements in reverse, but for a different
> reason. Not a rewind. A goodbye: finish looking at the work, finish hearing
> the story, and let the portrait and the room dissolve together as the very
> last beat — the personal connection is the last thing you see, the world
> fading out *around* it rather than racing it home.

---

## Why reverse-order, but not a literal rewind
A frame-for-frame rewind reads as mechanical — a video scrubbed backward,
slightly uncanny. What we want instead is the same *cast*, retreating in the
same *relationships*, for a *human* reason: you don't watch someone's face
shrink away while you're still standing in the room they were just in — the
room goes with them. That reframe is what keeps this from feeling like
"undo" and makes it feel like leave-taking.

## Baseline — what exists today
- **Open** is a true relay (`revealStage` 0 → 1 → 2): the portrait lands
  (shared `layoutId` morph) → triggers the info compartment's reveal → its
  completion triggers the gallery's reveal. Each beat fires only on the
  *actual completion* of the one before it — never a guessed delay.
- **Close** is currently a single coordinated retreat: the whole sheet
  (`motion.div key={storyIdx}`, wrapped in a nested `AnimatePresence`) fades
  + scales down as one unit; the backdrop fades out ~0.22s later; the wall's
  bystander cards return to focus in parallel; the portrait reverse-morphs
  home automatically via its shared `layoutId`.

## The close arc — three beats
| Beat | What departs | How it moves | What hands off to the next beat |
|---|---|---|---|
| 1 — The work | Gallery compartment | fades + slides back toward the edge it arrived from (mirror of its entrance) | its own departure animation completing |
| 2 — The story | Info compartment | fades + settles back down (mirror of its entrance) | its own departure animation completing |
| 3 — The farewell | Portrait **and** backdrop, together | the shared-layout journey home begins *as* the blur/weight layer dissolves around it — one breath, not two | sequence complete → overlay actually unmounts |

Beats 1 and 2 are pure mirrors of their entrances (same motion vocabulary,
played toward "hidden" instead of "revealed"). Beat 3 is deliberately
*not* split into "portrait leaves, then backdrop fades" — see "Scoped out"
below for why, and why that's the right call rather than a shortcut.

## Mechanics — "depart while still mounted, then unmount"
This reuses the exact pattern that makes the open relay reliable: drive
*visible* state through controlled `animate` props while the element is
still on screen, and let completion callbacks — not timers — advance the
sequence. Concretely:

- New state: `closing` (boolean) and `closeStage` (0 → 1 → 2 → 3).
- Clicking ✕ sets `closing = true` — **not** `storyIdx = null` yet. Nothing
  unmounts; everything stays exactly where it is, free to depart on its own
  schedule rather than being yanked out from under itself.
- `closeStage 0`: gallery's `animate` target flips to its hidden/offscreen
  values. Its `onAnimationComplete` advances to `closeStage 1`.
- `closeStage 1`: info's `animate` target flips to hidden. Its
  `onAnimationComplete` advances to `closeStage 2`.
- `closeStage 2`: **now** `setStoryIdx(null)` actually fires — this is the
  single moment the portrait's shared-layout journey *and* the backdrop's
  exit both begin, together, in the same breath.
- Once that final `AnimatePresence` exit resolves, the overlay is gone and
  all close-state (`closing`, `closeStage`, `revealStage`, `portraitArrived`)
  resets, ready for the next open.

This is structurally the *mirror* of the open relay — same shape, same
"correct by construction" guarantee (nothing can fire out of order, because
each beat only exists once the one before it has actually finished) — just
walked toward "gone" instead of "here."

## Scoped OUT (parked, not forgotten): the fully decoupled portrait
A version where the portrait travels home in *total isolation* — fully
clear of the backdrop, before the backdrop so much as begins to fade —
would require untangling the portrait's mount/unmount lifecycle from the
overlay's. Right now they're one and the same switch (`storyIdx !== null`).
Teaching the page "the portrait can be mid-journey while the backdrop is
still fully present" is real architecture work — a new relationship between
two systems that currently share one — not a tuning pass. It's also not
obviously *better*: the combined farewell (beat 3 above) already protects
the emotional core (the portrait is the last thing you watch settle) while
keeping the engineering honest. If it's ever wanted, it deserves its own
scoped pass — not a bolt-on here.

## Risk notes — what to scrub hardest
- **Rapid re-open/close**: clicking ✕ then immediately reopening before
  `closeStage` finishes — state resets must be airtight (`storyIdx` change
  is still the single source of truth for the relay's reset `useEffect`;
  `closing`/`closeStage` need the same discipline).
- **Compact vs. full layout**: the gallery and info compartments render in
  different DOM arrangements between the two — their "hidden" target values
  (the offsets they animate toward) need to make visual sense in both.
- **Interrupting mid-open**: closing while `revealStage` is still 0 or 1
  (gallery/info haven't even arrived yet) — they should simply have nothing
  to retreat *from*, and the close relay should still complete cleanly
  rather than stall waiting for an arrival that never finished.
- **The combined beat-3 timing**: portrait-journey duration and backdrop-fade
  duration need to feel like *one* breath, not two overlapping but
  independent ones — likely the most scrub-sensitive tuning in this plan.

## Tech
- **File**: `web/components/ArtistShowcaseSlider.tsx` only.
- **New state**: `closing` (boolean), `closeStage` (number, 0–3).
- **Touches**: gallery `motion.div` (controlled `animate` + completion →
  stage advance), info `motion.div` (same), the ✕ handler and any other
  close triggers (Esc key, backdrop click — all must route through `closing`
  rather than calling `setStoryIdx(null)` directly), and the existing
  `useEffect` that resets relay state on `storyIdx` change (extend it to
  also reset `closing`/`closeStage`).
- **Reuses**: the exact `revealStage` relay pattern already proven on open —
  same shape, same guarantees, opposite direction.

## Implementation steps
1. Add `closing` / `closeStage` state; audit every path that currently calls
   `setStoryIdx(null)` directly (✕ button, Esc key, backdrop click) and
   redirect them through a single `requestClose()` that sets `closing = true`.
2. Convert the gallery compartment's exit to a controlled `animate` (mirror
   of its entrance values) gated on `closeStage`, with `onAnimationComplete`
   advancing the stage.
3. Same for the info compartment.
4. On `closeStage` reaching its final value, fire the actual `setStoryIdx(null)`
   — this is what releases the portrait + backdrop together.
5. Extend the existing reset `useEffect` to clear `closing`/`closeStage`
   alongside `revealStage`/`portraitArrived`.
6. Tune beat durations — start from the entrance values played in reverse,
   adjust by feel.
7. `tsc --noEmit`, dev-server smoke test, then live scrub: open → close,
   repeatedly, both layouts, a few viewport widths, including the
   "interrupt mid-open" edge case from the risk notes.

## Verification
Same discipline as every phase before this one: clean compile, clean dev
render, then judged scrubbed — never on playback.
