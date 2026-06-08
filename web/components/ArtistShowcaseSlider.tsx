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
import { motion, AnimatePresence } from "framer-motion";
import { SERIF, SANS, COLORS } from "@/lib/theme";

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

// Voice + card images carried straight over from the homepage Artists section
// (ARTISTS_SOUL_PLAN.md) — same people, same words, different stage.
const ARTISTS: Artist[] = [
  {
    img: "/crousal_images2/realism_tattoo1.jpeg",
    name: "Tenzin",
    craft: "Fine line & custom",
    quote: "Fine lines, told slowly — like a sentence worth finishing properly.",
    bio: "Trained across Kathmandu and Bangkok before settling into the Teyung chair, Tenzin works at a deliberately unhurried pace — a single-needle hand built for clients who want one piece told exactly right, not three told quickly.",
    stats: [
      { value: "9+ Yrs", label: "Experience" },
      { value: "650+", label: "Happy clients" },
      { value: "1,200+", label: "Sessions inked" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
  {
    img: "/crousal_images2/covere-up-tattoo-13.png",
    name: "Maya",
    craft: "Realism & cover-up",
    quote: "I turn scars into stories — that trade is the whole reason I do this.",
    bio: "Maya reads old ink the way a restorer reads a damaged painting — what to keep, what to let go, what the skin can still hold. Her cover-ups lean on patient color-matching and shading dense enough to bury the past for good.",
    stats: [
      { value: "7+ Yrs", label: "Experience" },
      { value: "520+", label: "Happy clients" },
      { value: "300+", label: "Cover-ups done" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
  {
    img: "/crousal_images2/black_work_tattoo1.jpeg",
    name: "Rohan",
    craft: "Blackwork & traditional",
    quote: "Bold and permanent — I want it to still mean something in twenty years.",
    bio: "Two generations of traditional artists shaped Rohan's hand before Teyung did — saturated black, confident outlines, and a respect for how a piece ages on skin, not just how it photographs on the day it's finished.",
    stats: [
      { value: "11+ Yrs", label: "Experience" },
      { value: "800+", label: "Happy clients" },
      { value: "200+", label: "Large-scale pieces" },
    ],
    portfolio: DUMMY_PORTFOLIO,
  },
  {
    img: "/crousal_images2/traditional_tattoo1.jpeg",
    name: "Sita",
    craft: "Heritage & ornamental",
    quote: "Heritage isn't a style to me — it's the hand I learned to draw with.",
    bio: "Every pattern Sita inks gets traced back to where it came from before it ever touches skin — ornamental work that carries real lineage, drawn freehand from research, not lifted off a reference board.",
    stats: [
      { value: "6+ Yrs", label: "Experience" },
      { value: "410+", label: "Happy clients" },
      { value: "350+", label: "Custom designs" },
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
  const compact = useCompact();
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
      if (e.key === "Escape") setStoryIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyIdx]);

  // lock page scroll while the story overlay is open — same as the gallery lightbox
  useEffect(() => {
    if (storyIdx === null) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [storyIdx]);

  // big cards — the wall IS the showcase now, not a sidebar strip
  const tileW = compact ? "clamp(132px, 36vw, 168px)" : "clamp(218px, 17vw, 274px)";
  const tileH = compact ? "clamp(168px, 46vw, 212px)" : "clamp(266px, 21vw, 338px)";

  return (
    <section
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
            "linear-gradient(to right, rgba(7,6,5,0.88) 0%, rgba(7,6,5,0.6) 36%, rgba(7,6,5,0.12) 70%, rgba(7,6,5,0) 100%), linear-gradient(to top, rgba(7,6,5,0.55) 0%, rgba(7,6,5,0) 38%)",
        }}
      />

      {/* content — left rail. Swaps directly on click, no fade choreography. */}
      <div
        style={{
          position: "relative",
          zIndex: 6,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(28px, 6vw, 110px)",
        }}
      >
        <div key={active} style={{ maxWidth: compact ? "100%" : "min(680px, 56%)" }}>
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
              margin: "1.6rem 0 2.2rem",
              maxWidth: "42ch",
              textShadow: "0 1px 20px rgba(0,0,0,0.45)",
            }}
          >
            &ldquo;{a.quote}&rdquo;
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button style={btnSolid} onClick={() => setStoryIdx(active)}>VIEW STORY</button>
            <button style={btnOutline}>BOOK A SESSION</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: "clamp(2rem, 5vh, 3.5rem)" }}>
          <button aria-label="Previous artist" onClick={() => go(-1)} style={arrow}>‹</button>
          <button aria-label="Next artist" onClick={() => go(1)} style={arrow}>›</button>
        </div>
      </div>

      {/* ── the wall — large artist cards, upper-right, direct-cut selection.
          The active card carries a quiet gold outline; that's the only motion. */}
      <div
        style={{
          position: "absolute",
          zIndex: 7,
          top: compact ? 92 : "clamp(108px, 14vh, 164px)",
          right: compact ? 16 : "clamp(80px, 11vw, 168px)",
          display: "grid",
          gridTemplateColumns: `repeat(2, ${tileW})`,
          gridAutoRows: tileH,
          gap: compact ? 12 : 20,
        }}
      >
        {ARTISTS.map((t, idx) => {
          const isActive = idx === active;
          const isHover = hoverIdx === idx;
          return (
            <motion.button
              key={idx}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActive(idx)}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
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
                border: "3px solid rgba(255,255,255,0.7)",
                backgroundImage: `url(${t.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: isActive
                  ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.3)"
                  : "0 20px 50px rgba(0,0,0,0.45)",
              }}
            >
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
                  setStoryIdx(idx);
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
                    fontSize: compact ? "0.92rem" : "1.18rem",
                    lineHeight: 1.2,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.62)",
                    fontSize: compact ? "0.64rem" : "0.74rem",
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {isActive ? "Now showing" : t.craft}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* story overlay — same glassmorphism lightbox mechanics as the gallery
          (blur backdrop, dark weight layer, ✕ / Esc / backdrop-click close,
          scroll lock). No center image for now — just their voice, large. */}
      <AnimatePresence>
        {storyIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStoryIdx(null)}
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
              background: "rgba(0,0,0,0.08)",
              backdropFilter: "blur(7px)",
              WebkitBackdropFilter: "blur(7px)",
            }}
          >
            {/* black weight layer — sits over the blur, under all content */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.40)",
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
              <button aria-label="Close" onClick={() => setStoryIdx(null)} style={circleBtn}>
                ✕
              </button>
            </div>

            {/* the spread — three compartments staged on the dark glass:
                (image) + (info) stacked on the left, (gallery) taking the
                larger share on the right. Each is its own warm-white panel
                with curved edges, separated by a clear gutter. */}
            {storyIdx !== null && (
              <motion.div
                key={storyIdx}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: "relative",
                  zIndex: 305,
                  width: "100%",
                  maxWidth: 1540,
                  height: compact ? "auto" : "min(980px, 94vh)",
                  maxHeight: "94vh",
                  display: "flex",
                  flexDirection: compact ? "column" : "row",
                  gap: compact ? 16 : 22,
                  overflowY: compact ? "auto" : "visible",
                }}
              >
                {/* left stack — portrait compartment + info compartment.
                    Natural height — only the gallery is asked to fill the frame. */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: compact ? 16 : 22,
                    width: compact ? "100%" : "40%",
                    flexShrink: 0,
                    alignSelf: compact ? "stretch" : "flex-start",
                    marginRight: compact ? 0 : "clamp(10px, 1.6vw, 28px)",
                    marginBottom: compact ? 0 : "clamp(8px, 1.4vw, 22px)",
                  }}
                >
                  {/* compartment 1 — portrait — fills the column's full width */}
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ARTISTS[storyIdx].img}
                      alt={ARTISTS[storyIdx].name}
                      style={{
                        display: "block",
                        width: compact ? 220 : 300,
                        height: compact ? 220 : 300,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: `6px solid ${COLORS.cream}`,
                        boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                      }}
                    />
                  </div>

                  {/* compartment 2 — info — fills the column's full width */}
                  <div
                    style={{
                      width: "100%",
                      background: COLORS.cream,
                      borderRadius: 16,
                      padding: compact ? "2rem 1.4rem" : "2.7rem 1.8rem",
                      boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                    }}
                  >
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
                        fontSize: "clamp(1rem, 1.5vw, 1.18rem)",
                        lineHeight: 1.55,
                        color: COLORS.inkText,
                        opacity: 0.82,
                        margin: 0,
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
                        fontSize: "1.06rem",
                        lineHeight: 1.72,
                        color: COLORS.inkText,
                        opacity: 0.84,
                        margin: 0,
                      }}
                    >
                      {ARTISTS[storyIdx].bio}
                    </p>

                    {/* stat row — experience / clients / craft record */}
                    <div
                      style={{
                        display: "flex",
                        gap: compact ? "1.1rem" : "1.6rem",
                        marginTop: "1.4rem",
                        paddingTop: "1.2rem",
                        borderTop: "1px solid rgba(27,22,15,0.1)",
                      }}
                    >
                      {ARTISTS[storyIdx].stats.map((s) => (
                        <div key={s.label} style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: SERIF,
                              fontWeight: 600,
                              fontSize: "clamp(1.18rem, 1.9vw, 1.5rem)",
                              lineHeight: 1.1,
                              color: COLORS.gold,
                              marginBottom: "0.3rem",
                            }}
                          >
                            {s.value}
                          </div>
                          <div
                            style={{
                              fontFamily: SANS,
                              fontWeight: 600,
                              fontSize: "0.76rem",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: COLORS.inkText,
                              opacity: 0.62,
                            }}
                          >
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* compartment 3 — gallery: same wall-of-work DNA as the
                    main gallery section, tuned to 3-up for the modal.
                    Fills the full frame height; scrolls internally —
                    scrollbar hidden so the rounded right edge stays clean. */}
                <div
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
                    Real pieces, real skin — straight from the Teyung chair.
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
                </div>
                <style jsx>{`
                  .story-gallery-scroll::-webkit-scrollbar { display: none; }
                  .story-gallery-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                `}</style>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const btnSolid: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "0.82rem",
  color: "#111",
  background: "#fff",
  border: "none",
  padding: "16px 30px",
  borderRadius: 4,
  cursor: "pointer",
};

const btnOutline: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontWeight: 700,
  letterSpacing: "0.12em",
  fontSize: "0.82rem",
  color: "#fff",
  background: "transparent",
  border: "1.5px solid rgba(255,255,255,0.55)",
  padding: "16px 30px",
  borderRadius: 4,
  cursor: "pointer",
};

const arrow: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.45)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: "1.5rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

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
