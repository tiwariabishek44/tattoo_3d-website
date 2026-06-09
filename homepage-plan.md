# Abishek Tattoo Ink — Full Homepage Plan (45% → 100%)

> Plan to complete the landing page beyond the hero. Single source of truth for the
> full-page build. Vibe: **premium, brand-true (gold + black + serif), Kathmandu heritage + modern.**
>
> **Companions:** [hero-text-layer.md](hero-text-layer.md) (hero text) · the app lives in [web/](web/).

---

## The problem we're solving
Today = ~45%: **scroll-scrub hero + slogans + a parallax teaser + footer.** It's all one mood (dark/gold/text) with one effect. A finished page needs:
- **Color rhythm** — alternate dark and **cream/light** sections so it breathes (not 8 dark screens).
- **Element variety** — images, stats, icons, cards, accordions, quotes, a map — not just headlines.
- **Reveal motion everywhere** — every section fades/rises in on scroll (consistent polish).
- **Completeness** — the real sections a studio site needs (styles, gallery, artists, process, proof, visit, booking).

---

## Design system (lock these first)

### Color palette (add diversity!)
| Token | Value | Use |
|---|---|---|
| Ink Black | `#07080A` | primary dark sections, hero |
| Charcoal | `#121316` | alternate dark band |
| **Cream** | `#F2EDE3` | **light sections (the contrast — dark text on cream)** |
| Gold | `#CBA45A` | brand accent everywhere |
| Off-white | `#F2F3F5` | text on dark |
| Ink (text on cream) | `#16130D` | headings/body on cream |

**Rhythm:** Hero(dark) → Statement(dark) → Stats(charcoal) → Styles(**cream**) → Gallery(dark) → Artists(dark) → Process(**cream**) → Why(charcoal) → Testimonials(dark) → Visit(dark) → Booking(image) → Footer(dark). The cream breaks the monotony.

### Type scale
- Display/headlines: **Cormorant** serif, gold or ink, `clamp(2.6rem → 8rem)`.
- Eyebrows/labels/nav: **Inter** uppercase, `0.8rem`, `0.24em` tracking, gold.
- Body: Inter, `1.05–1.25rem`, line-height 1.65, muted.

### Motion principles
- **Scroll reveal** on every section: fade + rise (`opacity 0→1`, `y 40→0`), `whileInView`, stagger children ~0.08s.
- **Parallax** where it adds depth (gallery, hero, booking image).
- **Count-up** for stats. **Hover** lifts on cards. easeInOut throughout. Restraint — nothing bouncy.
- Build a reusable `<Reveal>` wrapper so every section animates consistently.

---

## Section architecture (the full page)

| # | Section | BG | Layout | Key elements | Motion |
|---|---|---|---|---|---|
| 1 | **Hero** *(done)* | dark | scrub canvas + text | machine R→L→R, 3 gold beats | fade beats |
| 2 | **Brand Statement** | dark | centered big statement | 1 powerful line (Kathmandu heritage + modern) + short para | word/line reveal |
| 3 | **Stats Band** | charcoal | 3–4 column row | years, artists, designs, clients — **count-up** | counters on view |
| 4 | **Styles We Master** | **cream** | responsive grid | Fine line, Blackwork, Traditional, Realism, Cover-up, Piercing, Laser removal, Custom | staggered cards |
| 5 | **The Gallery** | dark | parallax + grid | upgrade parallax cards → **real images** + a masonry grid below | parallax + fade |
| 6 | **Meet the Artists** | dark | artist cards | photo, name, specialty, socials (3–4 artists) | staggered reveal |
| 7 | **How It Works** | **cream** | 4 numbered steps | Consult → Design → Ink → Aftercare, icon + text | step stagger |
| 8 | **Why Abishek** | charcoal | icon grid (2×2/4) | Hygiene & safety, Custom art, Nepali heritage, Experience | icon reveal |
| 9 | **Testimonials** | dark | quote carousel/grid | 3–5 client quotes + names | fade/slide |
| 10 | **Visit Us** | dark | split (info + map) | Kathmandu address, hours, phone, map embed/placeholder | reveal |
| 11 | **Booking CTA** | **full-bleed image** | centered overlay | big "Begin your mark" + gold Book button | parallax bg + reveal |
| 12 | **Footer** *(done)* | dark | columns | logo, nav, contact, copyright | rises up |

---

## Content (brand-true, from the real studio)
- Positioning: *Authentic tattoo studio in Kathmandu — traditional Nepali motifs meet modern innovation.*
- Services (real): tattoos (fine line, blackwork, traditional, realism, custom), **piercing**, **laser removal**, **aftercare**.
- Copy tone: premium, considered, heritage + craft. (Replace placeholder copy with the studio's real voice as it arrives.)

## Asset needs
- **Gallery images** (tattoo work) — 6–9.
- **Artist photos** — 3–4.
- **Booking-CTA background** image (studio/ink/skin).
- **Icons** for Why/Process (line icons — can be inline SVG, no dependency).
- *(User said: any images are fine for now — we'll use tasteful placeholders/generated stand-ins, swap real ones later.)*

## Implementation phases
- **Phase A — System & scaffold:** color tokens, `<Reveal>` motion wrapper, section shells in order, cream-section styling. *(foundation)*
- **Phase B — Core content:** Brand Statement, Stats (count-up), Styles grid, Gallery upgrade (real images + grid).
- **Phase C — People & process:** Artists, How It Works, Why Abishek.
- **Phase D — Proof & convert:** Testimonials, Visit (map), Booking CTA.
- **Phase E — Polish:** mobile responsiveness pass, hover micro-interactions, real copy/images, performance check.

## Open decisions
- [ ] Confirm the **section list + order** above.
- [ ] **Cream sections** in — yes? (strongly recommend for color diversity)
- [ ] Real **images/copy** now, or tasteful placeholders first then swap?
- [ ] Map: real embed (Google Maps) or styled placeholder for now?

## Changelog
- **v1.0 (2026-06-05)** — Initial full-homepage plan. Design system (with cream for color diversity), 12-section architecture, reveal-motion principle, phased implementation, asset list.
