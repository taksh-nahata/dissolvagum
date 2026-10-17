import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GetInvolved from "@/components/GetInvolved";

export const metadata: Metadata = {
  title: "Get involved | DissolvaGum",
  description: "Support the DissolvaGum concept, partner as a business, or ask the team a question.",
  alternates: { canonical: "https://dissolvagum.com/get-involved" },
};

export default function GetInvolvedPage() {
  return (
    <>
      <Header />
      <main>
        <GetInvolved />
      </main>
      <Footer />
    </>
  );
}
