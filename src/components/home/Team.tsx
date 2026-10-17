"use client";

import RevealLines from "@/components/RevealLines";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 0.84, 0.24, 1] as const;

// The photos are small round crops, so they stay small: the names carry the section.
const TEAM = [
  { name: "Taksh Nahata", role: "CEO", image: "/taksh.png" },
  { name: "Tarakesvaran Aravindaan", role: "Product Manager", image: "/tarakes.png" },
  { name: "Chanakya Mudhuganti", role: "Chief Financial Officer", image: "/chanu.png" },
  { name: "Shivam Sharma", role: "Chief Marketing Officer", image: "/shivam.png" },
];

export default function Team() {
  const reduce = useReducedMotion();
  return (
    <section className="bg-background px-[clamp(16px,2.8vw,44px)] pb-[20svh] pt-[8svh]">
      <div className="mx-auto max-w-[1200px]">
        <RevealLines
          lines={["Made by four students", "who got tired of", "stepping on gum."]}
          className="mb-14 text-[clamp(36px,4.8vw,72px)] leading-[1] tracking-[-0.04em]"
        />
        <motion.ul
          className="border-b border-foreground/15"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {TEAM.map((m) => (
            <motion.li
              key={m.name}
              className="group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-1 border-t border-foreground/15 py-6 md:grid-cols-[auto_1fr_auto] md:gap-x-8"
              variants={{
                hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
              }}
            >
              <span className="relative block h-14 w-14 overflow-hidden rounded-full bg-secondary md:h-16 md:w-16">
                <Image src={m.image} alt="" fill sizes="64px" className="scale-[1.3] object-cover" />
              </span>
              <span className="text-[clamp(24px,3.4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em] transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,.84,.24,1)] group-hover:translate-x-2">
                {m.name}
              </span>
              <span className="col-start-2 text-ink-2 md:col-start-3 md:text-right">{m.role}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
