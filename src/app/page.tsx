import Header from "@/components/Header";
import IntroLoader from "@/components/IntroLoader";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Manifesto from "@/components/home/Manifesto";
import SidewalkStory from "@/components/home/SidewalkStory";
import Swallow from "@/components/home/Swallow";
import Team from "@/components/home/Team";
import FollowCta from "@/components/home/FollowCta";

export default function HomePage() {
  return (
    <>
      {/* first, so the hero knows to wait for it */}
      <IntroLoader />
      <Header />
      <main className="flex flex-col">
        <HeroSection />
        <Manifesto />
        <SidewalkStory />
        <Swallow />
        <Team />
        <FollowCta />
      </main>
      <Footer />
    </>
  );
}
