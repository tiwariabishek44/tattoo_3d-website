import Header from "@/components/Header";
import ArtistShowcaseSlider from "@/components/ArtistShowcaseSlider";
import BookButton from "@/components/BookButton";

// Concept 5 — "Artist Showcase" sandbox. Same cinematic morph-slider engine
// and gold design DNA as the homepage Service slider, with one experiment:
// the thumbnail strip moves from a bottom-right row to a contact-sheet GRID
// staged in the upper-right, larger tiles — and the hero copy is the
// artist's own first-person line, not generic service blurb. If this reads
// as more "soulful" than the bottom-strip pattern, we port it to the
// homepage Artists section. SSOT: web/ARTISTS_SOUL_PLAN.md.
export default function Concept5() {
  return (
    <main style={{ background: "#0b0a08" }}>
      <Header />
      <ArtistShowcaseSlider />
      <BookButton />
    </main>
  );
}
