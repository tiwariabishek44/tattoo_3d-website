import Header from "@/components/Header";
import ScrollSequenceMobile from "@/components/ScrollSequenceMobile";
import BrandStatement from "@/components/BrandStatement";
import StatsBand from "@/components/StatsBand";
import StylesCarousel from "@/components/StylesCarousel";
import ParallaxSection from "@/components/ParallaxSection";
import Artists from "@/components/Artists";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";
import BookButton from "@/components/BookButton";

// Mobile endpoint — worker/OffscreenCanvas hero. Mobile devices are routed here
// by middleware.ts. Sections are shared for now; tailor mobile UI here over time.
export default function MobileHome() {
  return (
    <main>
      <Header />
      <ScrollSequenceMobile />
      <BrandStatement />
      <StatsBand />
      <StylesCarousel ambient />
      <ParallaxSection />
      <Artists />
      <Testimonials />
      <BookingCTA />
      <Footer />
      <BookButton />
    </main>
  );
}
