import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Swallow from "@/components/home/Swallow";
import GumTimeline from "@/components/home/GumTimeline";
import FollowCta from "@/components/home/FollowCta";

export const metadata: Metadata = {
  title: "How it works | DissolvaGum",
  description: "Chew it, then it is designed to be swallowed, so it never ends up on the sidewalk. A concept in development.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Swallow />
        <GumTimeline />
        <FollowCta />
      </main>
      <Footer />
    </>
  );
}
