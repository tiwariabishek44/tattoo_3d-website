import Header from "@/components/Header";
import MobileRedirect from "@/components/MobileRedirect";
import ScrollSequence from "@/components/ScrollSequence";
import SpiderSequence from "@/components/SpiderSequence";
import BrandStatement from "@/components/BrandStatement";
import ServiceSlider from "@/components/ServiceSlider";
import GalleryPinterest from "@/components/GalleryPinterest";
import Artists from "@/components/Artists";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";
import BookButton from "@/components/BookButton";

export default function Home() {
  return (
    <main>
      <MobileRedirect />
      <Header />
      <ScrollSequence />
      <BrandStatement />
      {/* Buddha unzip — the stats now fold into the end of this sequence
          (standalone StatsBand removed). */}
      <SpiderSequence embedded />
      {/* Styles we master — featured-image slider (services). Reference animal
          assets + colours for now; re-skin to tattoo + gold later. */}
      <ServiceSlider />
      {/* Gallery — light/Pinterest skin (dark version retired). */}
      <GalleryPinterest theme="light" />
      <Artists />
      <Process />
      <Testimonials />
      <BookingCTA />
      <Footer />
      <BookButton />
    </main>
  );
}
