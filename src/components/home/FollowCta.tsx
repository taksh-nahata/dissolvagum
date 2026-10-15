"use client";

import { motion, useReducedMotion } from "framer-motion";
import CtaLink from "@/components/CtaLink";

const EASE = [0.16, 0.84, 0.24, 1] as const;

export default function FollowCta() {
  const reduce = useReducedMotion();
  const words = ["Follow", "along."];
  return (
    <section className="bg-[#0e1a17] px-[clamp(16px,2.8vw,44px)] py-[20svh] text-[#e8f3ec]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-10">
        {/* the trigger sits on the heading: the clipped words themselves never count as "in view" */}
        <motion.h2
          className="text-[clamp(64px,13vw,220px)] font-bold leading-[0.88] tracking-[-0.06em]"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: 0.12 }}
        >
          {words.map((w, i) => (
            <span key={w} className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className={`block ${i === 1 ? "text-mint" : ""}`}
                variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1.1, ease: EASE } } }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <motion.div
          className="flex max-w-[52ch] flex-col gap-8"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        >
          <p className="text-xl leading-[1.5] text-[#b4c9bb]">
            DissolvaGum is an early-stage concept, and nothing is for sale. If you want to see where it goes, or help it
            get there, let us know.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink href="/support-interest" variant="light">I want to support it</CtaLink>
            <CtaLink href="/business-interest" variant="light-outline">I represent a business</CtaLink>
            <CtaLink href="/contact" variant="text-light">Contact the team</CtaLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
