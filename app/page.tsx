import { Intro } from "@/components/Intro";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ScrollStage } from "@/components/ScrollStage";
import { Marquee } from "@/components/Marquee";
import { Features } from "@/components/Features";
import { Pipeline } from "@/components/Pipeline";
import { Templates } from "@/components/Templates";
import { Testimonials } from "@/components/Testimonials";
import { Compare } from "@/components/Compare";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { GuideWidget } from "@/components/GuideWidget";

export default function Home() {
  return (
    <main className="relative">
      <Intro />
      <Nav />
      <Hero />
      <Marquee />
      <ScrollStage />
      <Features />
      <Pipeline />
      <Templates />
      <Testimonials />
      <Compare />
      <Pricing />
      <Footer />
      <GuideWidget />
    </main>
  );
}
