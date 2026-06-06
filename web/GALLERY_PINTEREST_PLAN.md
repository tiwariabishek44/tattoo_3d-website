# Gallery — Pinterest-exact (LIGHT version) Plan

> Make the **light** gallery a faithful Pinterest clone. The **dark** gallery is frozen — do NOT touch it.

## Scope / isolation
- The dark gallery (`Gallery theme="dark"`) stays exactly as-is.
- The light version becomes its **own component** → **`GalleryPinterest.tsx`** — so all the back-and-forth happens here and can never affect the dark one.
- `app/page.tsx`: keep `<Gallery theme="dark" />`, replace `<Gallery theme="light" />` with `<GalleryPinterest />`.

## Visual spec (match Pinterest)
1. **Background** — clean neutral **white** (`#fff` / `#fafafa`). No warm cream, **no gold** anywhere.
2. **Full-bleed** — remove the centered `maxWidth` + big side padding. Only a small ~16px gutter left/right → wall fills the screen edge-to-edge.
3. **Density** — **5 columns** desktop (→ 4 → 3 → 2 responsive), **tight ~12px** gutters.
4. **Tiles** — softer **rounded corners (~16px)**, **no border**, **no permanent caption** (clean image).
5. **Filter chips** — **neutral**: active = solid **dark** pill / white text; inactive = **light-grey** pill / dark text. No gold.
6. **Heading / sub** — neutral **dark** text (drop the gold eyebrow). Keep "Our Artwork." + slogan, sitting above the wall with the same small side gutter.

## Hover overlay (the key new behaviour)
On hover over a tile — mirror Pinterest's overlay, **without** the red Save button or its chrome:
- A **translucent dark overlay** fades in over the image (≈ `rgba(0,0,0,0.4)`), smooth ~0.25s.
- **No red button.** Instead, the same *structure*, neutral:
  - **top-right:** a small neutral round **expand** affordance (⤢) → signals click-to-open.
  - **bottom-left:** the **category** label fades in.
- The whole tile is clickable → opens the **lightbox** (kept as-is).
- Default state = clean image (no overlay), exactly like Pinterest.

## Keep
- **Lightbox** (click → full-size overlay, ← / → / Esc) — unchanged.
- **Filtering** (chips reflow the wall with the fade) — unchanged.
- **Lazy-load** images.

## Build steps
1. Create `GalleryPinterest.tsx` (fork of Gallery, restyled per above).
2. Swap the light instance in `page.tsx` (`<Gallery theme="light" />` → `<GalleryPinterest />`).
3. `tsc` clean; review on screen; iterate on this file only.

## Open decisions
- [ ] Hover overlay contents — **default:** darken + top-right ⤢ expand + bottom-left category. (Alt: darken only / darken + centered icon.)
- [ ] Column count — **default 5** desktop (Pinterest-dense). 4 = larger tiles.
- [ ] Keep the "Our Artwork." heading + filter row, or go pure-wall (no heading)? **Default: keep** heading + filter (neutral).

## Changelog
- **v1.1 (2026-06-06)** — **Built.** `GalleryPinterest.tsx` created (neutral white, full-bleed, 5-col dense, hover-darken overlay + ⤢ expand, no red button, lightbox kept). Swapped into `page.tsx` for the light instance; dark `Gallery` untouched. `tsc` clean.
- **v1.0 (2026-06-06)** — Initial plan: fork the light gallery into a Pinterest-exact `GalleryPinterest` (neutral white, full-bleed, dense, hover-darken overlay sans red button, lightbox kept). Dark gallery untouched.
