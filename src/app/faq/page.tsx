import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealLines from "@/components/RevealLines";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ | DissolvaGum",
  description: "Answers to common questions about DissolvaGum, a gum concept designed to be safe to swallow.",
  alternates: { canonical: "https://dissolvagum.com/faq" },
};

// Only what the home page does not already answer.
const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Can I buy it?",
    a: "No. DissolvaGum is a concept in early development, and nothing is for sale.",
  },
  {
    q: "When will it be available?",
    a: "There is no date yet. We will share news with people who sign up to follow the project.",
  },
  {
    q: "What does “designed to be safe to swallow” mean?",
    a: "Spent gum is meant to be digestible and biodegradable, so it never needs to be spat out. These are design goals we are working toward, not proven results.",
  },
  {
    q: "Is this a real company?",
    a: "It is a student startup founded by four high school students in Folsom, California, still at the concept stage.",
  },
  {
    q: "How can I help?",
    a: (
      <>
        Head to{" "}
        <Link href="/get-involved" className="font-bold text-foreground underline underline-offset-4 hover:text-primary">
          Get involved
        </Link>{" "}
        to support the project, partner as a business, or ask us anything.
      </>
    ),
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[880px] px-[clamp(16px,2.8vw,44px)] pb-[14svh] pt-[10svh]">
        <RevealLines
          as="h1"
          on="mount"
          lines={["Questions."]}
          className="mb-12 text-[clamp(48px,8vw,112px)] leading-[0.95] tracking-[-0.045em]"
        />
        <Accordion type="single" collapsible className="border-b border-foreground/15">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border-t border-foreground/15">
              <AccordionTrigger className="py-6 text-left text-[clamp(20px,2.4vw,28px)] font-bold tracking-[-0.02em] hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-lg leading-[1.6] text-ink-2">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </>
  );
}
