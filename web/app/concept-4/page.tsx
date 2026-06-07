import Header from "@/components/Header";
import AnimalSlider from "@/components/AnimalSlider";
import BookButton from "@/components/BookButton";

// Concept 4 — LunDev reference-exact text overlay pattern:
// eyebrow → massive white bold title → same-size orange accent → paragraph → rect buttons.
// Same morph/grow animation engine as ServiceSlider; animal imagery.
export default function Concept4() {
  return (
    <main style={{ background: "#050505" }}>
      <Header />
      <AnimalSlider />
      <BookButton />
    </main>
  );
}
