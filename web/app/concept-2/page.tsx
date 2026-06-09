"use client";

// CONCEPT 2 — the Gallery's own masonry wall, retold for words instead of
// images: a dense dark-glass column grid (same columnCount/breakInside
// mechanic as GalleryPinterest), staggered reveal on scroll — but each tile
// puts the REVIEW in focus (the hero), with the customer's name + portrait
// as the byline beneath it. Same wall, different cargo.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { SERIF, SANS, COLORS, eyebrow, GUTTER } from "@/lib/theme";

type Review = {
  id: string;
  name: string;
  initials: string;
  nation: string;
  artist: string;
  style: string;
  quote: string;
};

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Aarav Sharma",
    initials: "AS",
    nation: "India",
    artist: "Tenzin",
    style: "Custom blackwork sleeve",
    quote: "They didn't just give me a tattoo — they designed something that finally felt like mine.",
  },
  {
    id: "r2",
    name: "Elin Lindgren",
    initials: "EL",
    nation: "Sweden",
    artist: "Maya",
    style: "Realism portrait",
    quote: "Every session felt considered, unhurried. The result still stops people on the street — Maya has an eye for light I haven't seen anywhere else. I keep finding new detail in it months later.",
  },
  {
    id: "r3",
    name: "Kenji Watanabe",
    initials: "KW",
    nation: "Japan",
    artist: "Rohan",
    style: "Traditional Japanese",
    quote: "I've been tattooed in three countries. Nothing compares to the patience here.",
  },
  {
    id: "r4",
    name: "Priya Nair",
    initials: "PN",
    nation: "India",
    artist: "Sita",
    style: "Cover-up restoration",
    quote: "They turned something I regretted into something I'm proud to show. Sita didn't just cover it — she rebuilt it into a piece that finally feels like me.",
  },
  {
    id: "r5",
    name: "Noah Williams",
    initials: "NW",
    nation: "United Kingdom",
    artist: "Tenzin",
    style: "Fine-line piercing",
    quote: "Walked in nervous, walked out with a piece I think about daily. Worth every hour in the chair.",
  },
  {
    id: "r6",
    name: "Sara Haddad",
    initials: "SH",
    nation: "Lebanon",
    artist: "Maya",
    style: "Custom linework",
    quote: "The consultation alone told me I was in the right hands — they listened more than they talked, and it shows in every line.",
  },
  {
    id: "r7",
    name: "Tomás Rivera",
    initials: "TR",
    nation: "Mexico",
    artist: "Rohan",
    style: "Realism, three sessions",
    quote: "Three pieces over two years, and each one is better than the last. This is the only studio I trust with permanent things.",
  },
];

function useColumns() {
  const [c, setC] = useState(3);
  useEffect(() => {
    const f = () => {
      const w = window.innerWidth;
      setC(w <= 640 ? 1 : w <= 1080 ? 2 : 3);
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return c;
}

export default function Concept2() {
  const cols = useColumns();

  return (
    <main>
      <Header />
      <section
        style={{
          background: "#fafafa",
          padding: `clamp(120px, 20vh, 220px) ${GUTTER} clamp(90px, 14vh, 160px)`,
        }}
      >
        <div style={{ maxWidth: "min(1280px, 94vw)", margin: "0 auto" }}>
          <div style={{ ...eyebrow(), marginBottom: "0.9rem" }}>In their words</div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: COLORS.inkText,
              margin: 0,
            }}
          >
            Their words.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(1.05rem, 1.4vw, 1.3rem)",
              lineHeight: 1.6,
              color: COLORS.mutedDark,
              margin: "1.1rem 0 0",
              maxWidth: "54ch",
            }}
          >
            Real people, real marks — straight from the Abishek chair.
          </p>

          <div style={{ marginTop: "clamp(36px, 6vh, 56px)", columnCount: cols, columnGap: "24px" }}>
            {REVIEWS.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ y: -6, boxShadow: "0 28px 64px rgba(27,22,15,0.13)" }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
                style={{
                  breakInside: "avoid",
                  marginBottom: 24,
                  borderRadius: 20,
                  padding: "clamp(1.8rem, 2.6vw, 2.4rem)",
                  background: "#ffffff",
                  boxShadow: "0 16px 48px rgba(27,22,15,0.09)",
                }}
              >
                {/* the review — in focus, the hero of the tile */}
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: "clamp(1.05rem, 1.5vw, 1.28rem)",
                    lineHeight: 1.6,
                    color: COLORS.inkText,
                    margin: 0,
                  }}
                >
                  &ldquo;{r.quote}&rdquo;
                </p>

                {/* byline — name + portrait, below the review */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: "clamp(20px, 2.6vh, 28px)",
                    paddingTop: "clamp(16px, 2vh, 20px)",
                    borderTop: "1px solid rgba(27,22,15,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: "0.86rem",
                      color: COLORS.gold,
                      background: COLORS.charcoal,
                      border: "1px solid rgba(203,164,90,0.4)",
                    }}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <div style={{ fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.74rem", fontWeight: 600, color: COLORS.gold }}>
                      {r.name}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: "0.7rem", letterSpacing: "0.04em", color: COLORS.mutedDark, marginTop: 2 }}>
                      {r.nation} · {r.style}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
