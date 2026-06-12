"use client";

// Concept 5 — "Artist Showcase" sandbox, take 2 (per review: cut the
// morph/fade choreography — direct cuts read calmer and let the grid carry
// the section). Now:
//   - Background is a CONSTANT atmospheric backdrop (Brand Story's studio
//     image, reused as a stand-in — see ARTISTS_SOUL_PLAN.md "swap later"
//     discipline) — you're standing in the studio, looking at a wall of its
//     people, not watching a slideshow of their work.
//   - The grid is a wall of LARGE artist cards (no fade-in, no morph) —
//     click one and their name/craft/voice swap into focus instantly. The
//     active card carries a quiet gold outline — that's the only "motion."
//   - Hero copy stays voice-led: their own first-person line, carried over
//     from the homepage Artists cards, not generic service blurb.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SERIF, SANS, COLORS, GUTTER } from "@/lib/theme";
import { useScrollLock } from "@/lib/useScrollLock";

const STUDIO_IMG = "/studio_interior_2.jpg";

const HEADING = "Meet the artists."; // constant headline — DNA match for "Our Service Offering"

type Artist = {
  img: string;
  name: string;
  craft: string;
  quote: string;
  bio: string;
  stats: { value: string; label: string }[];
  portfolio: string[];
};

// dummy portfolio set — same pools used elsewhere on site; swap to each
// artist's real work later (per "use dummy for now" discipline).
const DUMMY_PORTFOLIO = [
  "/crousal_images2/realism_tattoo1.jpeg",
  "/crousal_images2/covere-up-tattoo-13.png",
  "/crousal_images2/black_work_tattoo1.jpeg",
  "/crousal_images2/traditional_tattoo1.jpeg",
  "/crousal_images2/pircing.jpeg",
  "/crousls_images/realism_tattoo1.jpg",
  "/crousls_images/covere-up-tattoo-13.jpg",
  "/crousls_images/black_work_tattoo1.jpg",
  "/crousls_images/traditional_tattoo1.jpg",
  "/crousls_images/laser_removal.jpg",
  "/crousal_images2/realism_tattoo1.jpeg",
  "/crousal_images2/black_work_tattoo1.jpeg",
];

// Voice carried straight over from the homepage Artists section
// (ARTISTS_SOUL_PLAN.md) — same people, same words, different stage.
// Real portraits now live in /public/artist_image/ — no more tattoo-work
// stand-ins for the people themselves.
const ARTISTS: Artist[] = [
  {
    img: "/artist_image/artist1.jpg",
    name: "Tenzin",
    craft: "Fine line & custom",
    quote: "Fine lines, told slowly — like a sentence worth finishing properly.",
    bio: "Trained across Kathmandu and Bangkok before settling into the InkSpire chair, Tenzin works at a deliberately unhurried pace — a single-needle hand built for clients who want one piece told exactly right, not three told quickly.",
    stats: [
      { value: "Single-Needle Custom", label: "Specialty" },
      { value: "Kathmandu & Bangkok", label: "Training" },
      { value: "Max 1 Client / Day", label: "Pacing" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
  {
    img: "/artist_image/artist4.jpg",
    name: "Maya",
    craft: "Realism & cover-up",
    quote: "I turn scars into stories — that trade is the whole reason I do this.",
    bio: "Maya reads old ink the way a restorer reads a damaged painting — what to keep, what to let go, what the skin can still hold. Her cover-ups lean on patient color-matching and shading dense enough to bury the past for good.",
    stats: [
      { value: "Scar Restoration", label: "Specialty" },
      { value: "Multi-Layer Realism", label: "Technique" },
      { value: "Custom Tint-Matching", label: "Palette" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
  {
    img: "/artist_image/artist2.jpg",
    name: "Rohan",
    craft: "Blackwork & traditional",
    quote: "Bold and permanent — I want it to still mean something in twenty years.",
    bio: "Two generations of traditional artists shaped Rohan's hand before InkSpire did — saturated black, confident outlines, and a respect for how a piece ages on skin, not just how it photographs on the day it's finished.",
    stats: [
      { value: "High-Saturated Blackwork", label: "Specialty" },
      { value: "Second-Gen Traditional", label: "Lineage" },
      { value: "Body-Contour Mapping", label: "Method" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
  {
    img: "/artist_image/artist3.jpg",
    name: "Sita",
    craft: "Heritage & ornamental",
    quote: "Heritage isn't a style to me — it's the hand I learned to draw with.",
    bio: "Every pattern Sita inks gets traced back to where it came from before it ever touches skin — ornamental work that carries real lineage, drawn freehand from research, not lifted off a reference board.",
    stats: [
      { value: "Ornamental Lineage", label: "Specialty" },
      { value: "Freehand Custom Draft", label: "Process" },
      { value: "Nepali Stone Carvings", label: "Inspiration" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
];
const N = ARTISTS.length;

function useCompact() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const f = () => setC(window.innerWidth <= 820);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

function useMedium() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const f = () => setM(window.innerWidth > 820 && window.innerWidth <= 1240);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return m;
}

// dynamic column count for the story-overlay gallery — same responsive
// instinct as the main gallery's useColumns(), tuned to this compartment's
// share of the modal width (it sits in ~70% of a ~94vw frame).
function useGalleryCols() {
  const [c, setC] = useState(3);
  useEffect(() => {
    const f = () => setC(window.innerWidth <= 1300 ? 2 : 3);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

export default function ArtistShowcaseSlider() {
  const [active, setActive] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [storyIdx, setStoryIdx] = useState<number | null>(null);
  // ── Jinn transition (JINN_TRANSITION_PLAN.md) ──────────────────────────
  // The black-glass backdrop is the "lamp": it erupts from the clicked card
  // (a card-sized sheet that scales up to fill the screen) and collapses back
  // into it on close. Two card-side micro-beats frame it: the Rub on open, the
  // Acceptance pulse on return. The portrait layoutId morph is left intact —
  // both it and the backdrop collapse into the same card together.
  const [rubIdx, setRubIdx] = useState<number | null>(null);       // Beat 1 — card pulsing pre-open
  const [acceptingIdx, setAcceptingIdx] = useState<number | null>(null); // Beat 5 — card sealing post-return
  const lastStoryIdxRef = useRef<number | null>(null);             // survives the storyIdx→null clear, so the pulse knows its card
  // Open with the Rub: the card registers the touch (~90ms) before the sheet
  // erupts. The sheet's geometry is handled by Framer's shared-layout morph
  // off the card's lamp anchor — no manual getBoundingClientRect needed.
  const openStory = (idx: number) => {
    if (storyIdx !== null || rubIdx !== null) return;
    setAcceptingIdx(null); // guard rapid re-open mid-pulse
    setRubIdx(idx);
    window.setTimeout(() => {
      setRubIdx(null);
      lastStoryIdxRef.current = idx;
      setStoryIdx(idx);
    }, 90);
  };
  // gold arrival top-note — flips true the instant the morphing portrait's
  // shared-layout journey lands, fires the bloom, then resets so it can
  // replay fresh on the next open.
  const [portraitArrived, setPortraitArrived] = useState(false);
  // the relay — open AND close — rides as ONE continuous overlapping breath,
  // never a queue of fully-finished steps waiting their turn. OPEN: face,
  // story and work all begin the instant the sheet starts erupting, each on
  // its own calibrated head-start (see the compartments below). CLOSE is the
  // exact mirror, walked backward — the work steps back first (closing, no
  // delay), the story follows it overlapping (closing, +0.25s), and once the
  // story has actually finished retreating, the sheet takes the portrait home
  // with it as the room dissolves around them, together, in one farewell
  // breath. That final handoff is the one moment that still waits on a real
  // completion (the story's `onAnimationComplete`, below) — never a guessed
  // delay — because it's the moment the whole overlay unmounts; everything
  // before it is calibrated overlap, exactly like the open.
  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    if (storyIdx === null || closing) return;
    setClosing(true);
  };
  useEffect(() => {
    setPortraitArrived(false);
    setClosing(false);
  }, [storyIdx]);
  const compact = useCompact();
  const medium = useMedium();
  const galleryCols = useGalleryCols();
  const a = ARTISTS[active];
  const go = (dir: number) => setActive((active + dir + N) % N);

  // "Scroll" hint pill — only shown when the gallery compartment actually
  // overflows. Re-checked whenever the story opens or the column count shifts.
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  const [galleryScrollable, setGalleryScrollable] = useState(false);
  useEffect(() => {
    const el = galleryScrollRef.current;
    const grid = galleryGridRef.current;
    if (!el || !grid) { setGalleryScrollable(false); return; }
    const check = () => setGalleryScrollable(el.scrollHeight > el.clientHeight + 4);
    check();
    // the grid's height grows as lazy images load — that's what actually
    // creates the overflow, so watch IT, not the (height-locked) scroller.
    const ro = new ResizeObserver(check);
    ro.observe(grid);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [storyIdx, galleryCols, compact]);

  // close on Esc — same mechanics as the gallery lightbox
  useEffect(() => {
    if (storyIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyIdx, closing]);

  // lock page scroll while the story overlay is open (D-16)
  useScrollLock(storyIdx !== null);

  // big cards — the wall IS the showcase now, not a sidebar strip
  const tileW = compact ? "clamp(132px, 36vw, 168px)" : (medium ? "clamp(160px, 14vw, 200px)" : "clamp(218px, 17vw, 274px)");
  const tileH = compact ? "clamp(168px, 46vw, 212px)" : (medium ? "clamp(200px, 18vw, 250px)" : "clamp(266px, 21vw, 338px)");

  return (
    <LayoutGroup>
    <section
      id="artists"
      aria-label="Artist showcase slider"
      data-transparent-header
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 640,
        overflow: "hidden",
        background: COLORS.charcoal,
      }}
    >
      {/* constant backdrop — Brand Story's studio image, stand-in for now */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `url(${STUDIO_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* scrim — same grammar as Brand Story (dark left → clear right, since
          this borrows its backdrop): legible copy on the left, the wall of
          artists breathes on the right. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(7,6,5,0.74) 0%, rgba(7,6,5,0.4) 42%, rgba(7,6,5,0.06) 76%, rgba(7,6,5,0) 100%), linear-gradient(to top, rgba(7,6,5,0.4) 0%, rgba(7,6,5,0) 42%)",
        }}
      />

        {/* content — left rail. Swaps directly on click, no fade choreography. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "100%",
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: `0 ${GUTTER}`,
            pointerEvents: "auto",
          }}
        >
        <div key={active} style={{ maxWidth: compact ? "100%" : (medium ? "min(480px, 44%)" : "min(680px, 56%)") }}>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(3.2rem, 7vw, 8rem)",
              lineHeight: 1.02,
              color: COLORS.offWhite,
              marginBottom: "1.4rem",
              textShadow: "0 2px 30px rgba(0,0,0,0.6)",
            }}
          >
            {HEADING}
          </div>

          {/* the artist's name — the subject, off-white & large */}
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
              lineHeight: 1.1,
              color: COLORS.offWhite,
              margin: 0,
              textShadow: "0 1px 16px rgba(0,0,0,0.4)",
            }}
          >
            {a.name}
          </h1>

          {/* craft — quiet, tracked, gold */}
          <div
            style={{
              fontFamily: SANS,
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.78)",
              marginTop: "0.6rem",
            }}
          >
            {a.craft}
          </div>

          {/* their own words — voiced, not a service blurb */}
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 1.9vw, 1.65rem)",
              lineHeight: 1.5,
              color: COLORS.offWhite,
              margin: "1.6rem 0 0",
              maxWidth: "42ch",
              textShadow: "0 1px 20px rgba(0,0,0,0.45)",
            }}
          >
            &ldquo;{a.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* ── the wall — large artist cards, upper-right, direct-cut selection.
          The active card carries a quiet gold outline; that's the only motion. */}
      <div
        style={{
          position: "absolute",
          zIndex: 7,
          top: compact ? 92 : (medium ? "clamp(100px, 12vh, 140px)" : "clamp(108px, 14vh, 164px)"),
          bottom: compact ? 16 : (medium ? 20 : GUTTER),
          right: compact ? 16 : GUTTER,
          display: "grid",
          gridTemplateColumns: `repeat(2, ${tileW})`,
          gridTemplateRows: "1fr 1fr",
          gap: compact ? 12 : (medium ? 14 : 20),
          pointerEvents: "auto",
        }}
      >
        {ARTISTS.map((t, idx) => {
          const isActive = idx === active;
          const isHover = hoverIdx === idx;
          // a story is open AND this isn't the card whose portrait just left —
          // the wall quietly settles, the way a room quiets when someone steps
          // forward. Reverses the instant the story closes.
          const isBystander = storyIdx !== null && idx !== storyIdx;
          const baseShadow = isActive
            ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.3)"
            : "0 20px 50px rgba(0,0,0,0.45)";
          // Beat 1 (Rub) and Beat 5 (Acceptance) ride on the card's own scale
          // channel — temporally exclusive with the bystander settle, so a
          // simple priority cascade is safe. Gold rides the box-shadow.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let cardAnimate: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let cardTransition: any;
          if (rubIdx === idx) {
            // the invocation — a quick swell + gold flush before the lamp opens
            cardAnimate = {
              scale: [1, 1.02, 1],
              opacity: 1,
              boxShadow: [baseShadow, `${baseShadow}, 0 0 20px rgba(203,164,90,0.7)`, baseShadow],
            };
            cardTransition = { duration: 0.09, ease: "easeInOut" };
          } else if (acceptingIdx === idx) {
            // the seal — receive the Jinn back: dip, overshoot, settle + gold bloom
            cardAnimate = {
              scale: [1, 0.97, 1.01, 1],
              opacity: 1,
              boxShadow: [baseShadow, `${baseShadow}, 0 0 22px rgba(203,164,90,0.55)`, baseShadow, baseShadow],
            };
            cardTransition = { duration: 0.22, times: [0, 0.36, 0.64, 1], ease: "easeInOut" };
          } else {
            cardAnimate = { scale: isBystander ? 0.97 : 1, opacity: isBystander ? 0.8 : 1 };
            cardTransition = {
              default: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            };
          }
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              animate={cardAnimate}
              transition={cardTransition}
              onClick={() => setActive(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(idx); }
              }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              role="button"
              tabIndex={0}
              aria-label={`Show ${t.name}`}
              aria-current={isActive}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: 18,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                border: isActive ? `3px solid ${COLORS.gold}` : "2px solid rgba(255,255,255,0.25)",
                boxShadow: isActive
                  ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.3)"
                  : "0 20px 50px rgba(0,0,0,0.45)",
              }}
            >
              {/* lamp anchor — the "from" box for the backdrop eruption.
                  Invisible (no fill); Framer measures it and morphs the
                  black-glass backdrop out of this exact rect on open, back
                  into it on close. Only mounted while the story is closed, so
                  it and the backdrop never share the layoutId simultaneously
                  (the standard shared-element handoff). */}
              {storyIdx === null && (
                <motion.div
                  layoutId={`jinn-lamp-${idx}`}
                  style={{ position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none", zIndex: 0 }}
                />
              )}

              {/* shared-element morph anchor — same layoutId as the story
                  overlay's portrait below; Framer Motion travels this exact
                  image between the two positions/shapes on open AND close. */}
              <motion.img
                layoutId={`artist-photo-${idx}`}
                src={t.img}
                alt={t.name}
                // Both directions now carry the SAME premium weight: CLOSE
                // is brought up by the same compounded ×1.82 (1.3 × 1.4)
                // that's been layered onto OPEN since they last matched —
                // 0.405 → 0.74 — so the journey home still runs the same
                // ~10% brisker than the journey out (0.74/0.82 ≈ 0.90),
                // just at the new, unhurried tempo. Both anchors must agree
                // on whichever direction is live, or the shared morph
                // judders. (See the overlay's portrait img below.)
                transition={{ duration: closing ? 0.74 : 0.82, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 18,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isActive
                    ? "linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.05) 60%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 58%)",
                }}
              />
              {/* hover label — same red-pill language as the gallery's hover Save
                  button, centered in the card. Opens the story overlay on click. */}
              <button
                aria-label={`View ${t.name}'s story`}
                onClick={(e) => {
                  e.stopPropagation();
                  openStory(idx);
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isHover ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.94)",
                  opacity: isHover ? 1 : 0,
                  transition: "opacity 0.22s ease, transform 0.22s ease",
                  background: "#E60023",
                  color: "#fff",
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: compact ? "0.92rem" : "1.08rem",
                  padding: compact ? "0.65rem 1.3rem" : "0.8rem 1.7rem",
                  borderRadius: 16,
                  border: "none",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  pointerEvents: isHover ? "auto" : "none",
                }}
              >
                View Story
              </button>
              <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: compact ? "0.92rem" : (medium ? "1.02rem" : "1.18rem"),
                    lineHeight: 1.2,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.62)",
                    fontSize: compact ? "0.64rem" : (medium ? "0.68rem" : "0.74rem"),
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {isActive ? "Now showing" : t.craft}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* story overlay — same glassmorphism lightbox mechanics as the gallery
          (blur backdrop, dark weight layer, ✕ / Esc / backdrop-click close,
          scroll lock). No center image for now — just their voice, large. */}
      <AnimatePresence
        onExitComplete={() => {
          // Beat 5 — the sheet has finished collapsing home. Seal it: fire the
          // acceptance pulse on the card it came from, then clear.
          const idx = lastStoryIdxRef.current;
          if (idx === null) return;
          setAcceptingIdx(idx);
          window.setTimeout(() => {
            setAcceptingIdx((cur) => (cur === idx ? null : cur));
          }, 240);
          lastStoryIdxRef.current = null;
        }}
      >
        {storyIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // blur/scrim fade synced to the collapse: no early finish, same
            // ease-in, so the room dims out exactly as the sheet lands home.
            // Brought up to the same premium weight as the open — ×1.82
            // (the compounded slowdown OPEN has carried since they last
            // matched): 0.48 → 0.87.
            exit={{ opacity: 0, transition: { duration: 0.87, ease: [0.6, 0, 1, 1] } }}
            // entrance — another 40% on top of the prior slowdowns, so the
            // room's dimming keeps matching the eruption's deliberate pace.
            transition={{ duration: 0.74, ease: "easeOut" }}
            onClick={() => requestClose()}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 30,
              paddingBottom: 30,
              paddingRight: "clamp(12px, 1.5vw, 24px)",
              paddingLeft: compact ? "clamp(12px, 1.5vw, 24px)" : "clamp(48px, 6vw, 110px)",
              overflow: "hidden",
              background: "rgba(0,0,0,0.14)",
              backdropFilter: "blur(7px)",
              WebkitBackdropFilter: "blur(7px)",
            }}
          >
            {/* THE LAMP SHEET — the black-glass mass that erupts from the card
                and collapses back into it. Shares its layoutId with the clicked
                card's lamp anchor: on open Framer springs it out of that rect
                (overshoot); on close it gets pulled home with an ease-in
                acceleration. It's out of flow (absolute inset 0), so morphing
                it never disturbs the compartment layout above.

                CLOSE — its actual collapse (the layoutId FLIP + corner
                return) can only fire at the real unmount, same as before —
                that's the one moment DOM ownership of the shared element
                actually changes hands, and chasing it earlier would mean
                truncating info/portrait's fades mid-flight (the exact bug we
                just fixed for the portrait, one level up). So instead of
                moving that trigger, the glass gets its own early "first
                breath of departure" — a soft dim that starts ~15% sooner
                than the FLIP does (0.72s in, vs. the ~0.85s the unmount
                lands at), telling the room it's already begun to leave
                before it visibly moves. Then the actual fold-home — both the
                layout journey and the corner return — runs ~10% slower than
                before (0.87 → 0.96s): less a snap-shut, more an unhurried
                settle, with the room exhaling around it the whole way. */}
            <motion.div
              layoutId={storyIdx !== null ? `jinn-lamp-${storyIdx}` : undefined}
              initial={{ borderRadius: 18 }}
              animate={{ borderRadius: 0, opacity: closing ? 0.78 : 1 }}
              exit={{ borderRadius: 18 }}
              transition={{
                // OPEN — three slowdown passes deep now (ζ ≈ 0.536 held
                // constant throughout: 59/8.2 carries the exact same
                // overshoot character as 115/11.5, 195/15 and the original
                // 280/18, just unfolding at its own unhurried pace).
                //
                // CLOSE — now ~10% slower again (0.87 → 0.96), an even more
                // unhurried fold-home with the same accelerating "pulled-in"
                // character — the Jinn isn't snapping back, it's settling.
                layout: closing
                  ? { duration: 0.96, ease: [0.6, 0, 1, 1] }            // collapse — eased further into its premium pace
                  : { type: "spring", stiffness: 59, damping: 8.2 },    // erupt — spring with overshoot
                borderRadius: closing
                  ? { duration: 0.96, ease: [0.6, 0, 1, 1] }
                  : { duration: 1.09, ease: [0.22, 1, 0.36, 1] },
                // the early "first breath" — a soft dim, ~15% ahead of the
                // FLIP's ~0.85s unmount trigger, so the glass is visibly
                // already letting go before it structurally can move.
                opacity: closing
                  ? { delay: 0.72, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0 },
              }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.62)", // deeper black — more depth through the erupt/collapse
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* ✕ close — top-left, same circleBtn mechanics as the gallery */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 310,
                display: "flex",
                padding: "14px clamp(16px, 3vw, 36px)",
              }}
            >
              <button aria-label="Close" onClick={() => requestClose()} style={circleBtn}>
                ✕
              </button>
            </div>

            {/* the spread — three compartments staged on the dark glass:
                (image) + (info) stacked on the left, (gallery) taking the
                larger share on the right. Each is its own warm-white panel
                with curved edges, separated by a clear gutter. */}
            {/* nested AnimatePresence — without it, the sheet would vanish
                instantly the moment storyIdx clears (its conditional sits
                inside an already-exiting backdrop, so React would remove it
                before its own exit gets a turn). This lets it retreat on
                its own terms — and by the time storyIdx actually clears
                (see the close relay below), the gallery and info
                compartments have already taken their leave: what's left to
                exit here is the sheet around the portrait, going home with
                it and the room, together, as one farewell breath. */}
            <AnimatePresence>
            {storyIdx !== null && (
              <motion.div
                key={storyIdx}
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
                // No competing transform here on the way out. `scale` would
                // create its own projection node and fight the portrait's
                // layoutId FLIP for the same transform budget — Framer
                // resolves that fight by abandoning the morph and crossfading
                // in place, which is exactly the "it erases itself, leaves the
                // portrait behind" bug. So: opacity only (cascades visually
                // without touching layout/transform math), and held until
                // AFTER the portrait + sheet have made the trip home — by
                // then this shell is already empty, so its fade is invisible.
                exit={{ opacity: 0, transition: { delay: 0.8, duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                style={{
                  position: "relative",
                  zIndex: 305,
                  width: "100%",
                  maxWidth: 1309,
                  height: compact ? "auto" : "min(833px, 94vh)",
                  maxHeight: "94vh",
                  display: "flex",
                  flexDirection: compact ? "column" : "row",
                  gap: compact ? 16 : 22,
                  overflowY: compact ? "auto" : "visible",
                }}
              >
                {/* THE STORY — portrait + info, merged into one considered
                    dossier rather than two floating pieces: a single warm
                    -white card with the medallion riding at its head and
                    the record settling below it. The portrait still makes
                    its own layoutId journey — eruption, gathering shadow,
                    one-time gold-ring flourish, all untouched — it simply
                    lands inside the card now instead of beside it. And the
                    card itself now owns "arrival" and "departure" as ONE
                    motion — there's exactly one thing to animate where two
                    used to need keeping in step (the same kind of
                    simplification that closed the portrait/sheet desync one
                    level up, just one beat earlier in the chain). */}
                <motion.div
                  key={`story-${storyIdx}`}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: closing ? 0 : 1, y: closing ? 22 : 0 }}
                  transition={
                    closing
                      ? { delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                      : { delay: 0.48, duration: 0.84, ease: [0.22, 1, 0.36, 1] }
                  }
                  onAnimationComplete={() => {
                    // the story has finished its retreat — release the
                    // overlay now: the sheet's journey home and the room's
                    // dissolve begin together, the final beat.
                    if (closing) setStoryIdx(null);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: compact ? "flex-start" : "center",
                    gap: compact ? 16 : 22,
                    width: compact ? "100%" : "40%",
                    height: compact ? "auto" : "100%",
                    flexShrink: 0,
                    alignSelf: compact ? "stretch" : "flex-start",
                    marginRight: compact ? 0 : "clamp(10px, 1.6vw, 28px)",
                    marginBottom: compact ? 0 : "clamp(8px, 1.4vw, 22px)",
                    background: COLORS.cream,
                    borderRadius: 28,
                    padding: compact ? "2.4rem 1.4rem 2rem" : "3rem 1.8rem 2.5rem",
                    boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* the medallion — portrait, centered at the card's head.
                      Same layoutId journey as ever (square card-thumb →
                      circle, the eruption's centerpiece, shadow gathering,
                      gold ring on arrival) — and on the way out it no
                      longer needs its own fade at all: it's riding inside
                      the card now, so the card's single opacity breath
                      carries it home for free. One less thing to keep in
                      sync, by construction rather than by calibration. */}
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: compact ? 187 : 255, height: compact ? 187 : 255 }}>
                      <motion.img
                        layoutId={`artist-photo-${storyIdx}`}
                        src={ARTISTS[storyIdx].img}
                        alt={ARTISTS[storyIdx].name}
                        initial={{ boxShadow: "0 0px 0px rgba(0,0,0,0)" }}
                        animate={{
                          boxShadow: [
                            "0 0px 0px rgba(0,0,0,0)",
                            "0 60px 130px rgba(0,0,0,0.55)",
                            "0 24px 70px rgba(0,0,0,0.5)",
                          ],
                        }}
                        transition={{
                          // must mirror the card-side anchor exactly — both directions,
                          // both anchors, same premium pace now (0.74 closing / 0.82 open)
                          layout: { duration: closing ? 0.74 : 0.82, ease: [0.22, 1, 0.36, 1] },
                          // the gathering shadow is an arrival-only flourish — slowed in step (×1.4 again)
                          boxShadow: { duration: 0.91, times: [0, 0.55, 1], ease: [0.22, 1, 0.36, 1] },
                        }}
                        onLayoutAnimationComplete={() => setPortraitArrived(true)}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: `6px solid ${COLORS.cream}`,
                        }}
                      />
                      {/* the gold top note — fires once on arrival, never repeats */}
                      {portraitArrived && (
                        <motion.div
                          key={`gold-ring-${storyIdx}`}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: [0, 0.85, 0], scale: [0.92, 1.04, 1.1] }}
                          transition={{ duration: 0.9, times: [0, 0.4, 1], ease: "easeOut" }}
                          style={{
                            position: "absolute",
                            inset: -8,
                            borderRadius: "50%",
                            border: `1.5px solid ${COLORS.gold}`,
                            boxShadow: "0 0 26px 2px rgba(203,164,90,0.32)",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* the record — craft, name, voice, bio, stats. Same
                      content as ever; it just rides with the card as one
                      piece now rather than carrying its own arrival. */}
                  <div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: COLORS.gold,
                        marginBottom: "0.7rem",
                      }}
                    >
                      {ARTISTS[storyIdx].craft}
                    </div>
                    <h2
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 500,
                        fontSize: "clamp(1.7rem, 3vw, 2.3rem)",
                        lineHeight: 1.08,
                        color: COLORS.inkText,
                        margin: "0 0 0.9rem",
                      }}
                    >
                      {ARTISTS[storyIdx].name}
                    </h2>
                    <p
                      style={{
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontWeight: 500,
                        fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
                        lineHeight: 1.5,
                        color: COLORS.inkText,
                        borderLeft: `2.5px solid ${COLORS.gold}`,
                        paddingLeft: "1.1rem",
                        margin: "1.25rem 0",
                      }}
                    >
                      &ldquo;{ARTISTS[storyIdx].quote}&rdquo;
                    </p>

                    {/* hairline divider — separates voice from record */}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(27,22,15,0.14)",
                        margin: "1.25rem 0 1.1rem",
                      }}
                    />

                    {/* bio — the fuller "info" the user asked for */}
                    <p
                      style={{
                        fontFamily: SANS,
                        fontWeight: 400,
                        fontSize: "0.98rem",
                        lineHeight: 1.65,
                        color: COLORS.inkText,
                        opacity: 0.8,
                        margin: 0,
                      }}
                    >
                      {ARTISTS[storyIdx].bio}
                    </p>

                    {/* spec list — curated, custom metadata */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginTop: "1.5rem",
                        paddingTop: "1.2rem",
                        borderTop: "1px solid rgba(27,22,15,0.1)",
                      }}
                    >
                      {ARTISTS[storyIdx].stats.map((s) => (
                        <div
                          key={s.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: 16,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: SANS,
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: COLORS.gold,
                            }}
                          >
                            {s.label}
                          </span>
                          <span
                            style={{
                              fontFamily: SERIF,
                              fontWeight: 500,
                              fontSize: "1.06rem",
                              color: COLORS.inkText,
                              textAlign: "right",
                            }}
                          >
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* compartment 3 — gallery: same wall-of-work DNA as the
                    main gallery section, tuned to 3-up for the modal.
                    Fills the full frame height; scrolls internally —
                    scrollbar hidden so the rounded right edge stays clean.
                    Last to surface in the open overlap (delay 0.73 — woven
                    through the tail of the eruption, not queued after it).
                    CLOSE is its exact mirror in role: "the work" is the
                    FIRST to retreat now, no head-start at all (delay 0) —
                    the instant the relay turns toward "leave," this is what
                    moves first, with the story overlapping its departure
                    a beat later. Same continuous-breath choreography as the
                    open, walked backward — nothing waits for a full stop
                    before the next beat begins. */}
                <motion.div
                  key={`gallery-${storyIdx}`}
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: closing ? 0 : 1, x: closing ? 36 : 0 }}
                  transition={
                    closing
                      ? { delay: 0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                      : { delay: 0.73, duration: 0.73, ease: [0.22, 1, 0.36, 1] }
                  }
                  style={{
                    position: "relative",
                    width: compact ? "100%" : "60%",
                    flex: 1,
                    minWidth: 0,
                    height: compact ? "auto" : "100%",
                  }}
                >
                <div
                  ref={galleryScrollRef}
                  className="story-gallery-scroll"
                  data-lenis-prevent
                  style={{
                    width: "100%",
                    height: "100%",
                    background: COLORS.cream,
                    borderRadius: 22,
                    padding: compact ? "14px 8px 14px 14px" : "20px 10px 20px 20px",
                    boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                    overflowY: "auto",
                  }}
                >
                  {/* heading block — same DNA as the gallery section
                      (eyebrow → serif headline → sub-line), scaled to the
                      compartment. Placeholder copy for now — swap later. */}
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: "0.78rem",
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: COLORS.gold,
                      marginBottom: "0.7rem",
                    }}
                  >
                    The Gallery
                  </div>
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 700,
                      fontSize: "clamp(1.9rem, 3.4vw, 3rem)",
                      lineHeight: 1.04,
                      letterSpacing: "-0.01em",
                      color: COLORS.inkText,
                      margin: 0,
                    }}
                  >
                    Our Artwork.
                  </h3>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: "clamp(0.92rem, 1.2vw, 1.05rem)",
                      lineHeight: 1.6,
                      color: COLORS.inkText,
                      opacity: 0.7,
                      margin: "0.7rem 0 1.4rem",
                      maxWidth: "54ch",
                    }}
                  >
                    Real pieces, real skin — straight from the InkSpire chair.
                  </p>
                  {/* same masonry DNA as the gallery section: CSS columns,
                      break-inside avoid, natural image heights — column
                      count is dynamic per viewport (fewer, larger cards
                      than before — ~50% bigger), spanning the full
                      compartment width so nothing is left empty */}
                  <div ref={galleryGridRef} style={{ width: "100%", columnCount: galleryCols, columnGap: compact ? 14 : 22 }}>
                    {ARTISTS[storyIdx].portfolio.map((src, i) => (
                      <div
                        key={i}
                        style={{
                          breakInside: "avoid",
                          marginBottom: compact ? 14 : 22,
                          borderRadius: 18,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${ARTISTS[storyIdx].name} — work ${i + 1}`}
                          loading="lazy"
                          style={{ width: "100%", height: "auto", display: "block" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* "Scroll" hint — red pill, pinned to the compartment's
                    bottom edge (outside the scrolling div so it never
                    drifts with the content), shown only while the gallery
                    actually overflows. */}
                <AnimatePresence>
                  {galleryScrollable && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: compact ? 16 : 24,
                        transform: "translateX(-50%)",
                        zIndex: 4,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#E60023",
                        color: "#fff",
                        fontFamily: SANS,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        fontSize: compact ? "0.92rem" : "1.02rem",
                        padding: compact ? "0.8rem 1.6rem" : "0.95rem 1.95rem",
                        borderRadius: 999,
                        boxShadow: "0 14px 36px rgba(0,0,0,0.4)",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Scroll
                      <motion.svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </motion.div>
                  )}
                </AnimatePresence>
                </motion.div>
                <style jsx>{`
                  .story-gallery-scroll::-webkit-scrollbar { display: none; }
                  .story-gallery-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                `}</style>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
    </LayoutGroup>
  );
}



const circleBtn: React.CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: 18,
  border: "none",
  background: "rgba(210,210,210,0.92)",
  color: "#111",
  fontSize: "1.35rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: SANS,
  fontWeight: 700,
  boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
};
