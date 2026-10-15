import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/home/HowItWorks";
import GumTimeline from "@/components/home/GumTimeline";
import FollowCta from "@/components/home/FollowCta";

export const metadata: Metadata = {
  title: "How it works | DissolvaGum",
  description: "Chew it, swallow it, nothing left behind: how DissolvaGum is designed to work. A concept in development.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <HowItWorks />
        <GumTimeline />
        <FollowCta />
      </main>
      <Footer />
    </>
  );
}
