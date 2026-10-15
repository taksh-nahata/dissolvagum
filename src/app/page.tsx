import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Manifesto from "@/components/home/Manifesto";
import GumTimeline from "@/components/home/GumTimeline";
import HowItWorks from "@/components/home/HowItWorks";
import Nowhere from "@/components/home/Nowhere";
import Team from "@/components/home/Team";
import FollowCta from "@/components/home/FollowCta";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <HeroSection />
        <Manifesto />
        <GumTimeline />
        <HowItWorks />
        <Nowhere />
        <Team />
        <FollowCta />
      </main>
      <Footer />
    </>
  );
}
