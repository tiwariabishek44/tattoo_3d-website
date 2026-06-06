import Header from "@/components/Header";
import ServiceSlider from "@/components/ServiceSlider";

// Concept 3 — featured-image slider testbed (LunDev "DESIGN SLIDER" DNA). Our own
// Header floats over it; reference colours for now, re-skin to tattoo + gold later.
export default function Concept3() {
  return (
    <main style={{ background: "#0b0b0c" }}>
      <Header />
      <ServiceSlider />
    </main>
  );
}
