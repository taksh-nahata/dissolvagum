import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Swallow from "@/components/home/Swallow";
import SidewalkStory from "@/components/home/SidewalkStory";
import GumTimeline from "@/components/home/GumTimeline";
import FollowCta from "@/components/home/FollowCta";

export const metadata: Metadata = {
  title: "How it works | DissolvaGum",
  description: "Chew it, then it is designed to be swallowed, and to break down within about 5 days if it is spat out. A concept in development.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Swallow />
        <SidewalkStory variant="ours" />
        <GumTimeline />
        <FollowCta />
      </main>
      <Footer />
    </>
  );
}
