import Header from "@/components/Header";
import ScrollSequence from "@/components/ScrollSequence";
import SpiderSequence from "@/components/SpiderSequence";
import BrandStatement from "@/components/BrandStatement";
import StatsBand from "@/components/StatsBand";
import StylesCarousel from "@/components/StylesCarousel";
import ParallaxSection from "@/components/ParallaxSection";
import Artists from "@/components/Artists";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";
import BookButton from "@/components/BookButton";

export default function Home() {
  return (
    <main>
      <Header />
      <ScrollSequence />
      <BrandStatement />
      <SpiderSequence embedded />
      <StatsBand />
      <StylesCarousel ambient />
      <ParallaxSection />
      <Artists />
      <Process />
      <Testimonials />
      <BookingCTA />
      <Footer />
      <BookButton />
    </main>
  );
}
