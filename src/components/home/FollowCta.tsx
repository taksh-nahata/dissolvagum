"use client";

import RevealLines from "@/components/RevealLines";

import { motion, useReducedMotion } from "framer-motion";
import CtaLink from "@/components/CtaLink";

const EASE = [0.16, 0.84, 0.24, 1] as const;

export default function FollowCta() {
  const reduce = useReducedMotion();
  const words = ["Follow", "along."];
  return (
    <section className="bg-[#0e1a17] px-[clamp(16px,2.8vw,44px)] py-[20svh] text-[#e8f3ec]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-10">
        <RevealLines
          lines={["Follow", "along."]}
          className="text-[clamp(64px,13vw,220px)] font-bold leading-[0.88] tracking-[-0.06em]"
          lineClassName={(i) => (i === 1 ? "text-mint" : "")}
        />
        <motion.div
          className="flex max-w-[52ch] flex-col gap-8"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        >
          <p className="text-xl leading-[1.5] text-[#b4c9bb]">
            If you want to see where this goes, or help it get there, let us know.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink href="/get-involved" variant="light">Get involved</CtaLink>
            <a
              href="https://forms.gle/XshZmHL6ix4sesuE9"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 text-[15px] font-bold text-[#e8f3ec] underline decoration-2 underline-offset-[6px] transition-colors hover:text-mint"
            >
              Take our 40-second survey
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
