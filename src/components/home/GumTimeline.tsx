"use client";

import RevealLines from "@/components/RevealLines";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 0.84, 0.24, 1] as const;

const ROWS = [
  { name: "Conventional gum base", note: "Does not break down", width: 100, bar: "linear-gradient(90deg, #6b6862 0%, #6b6862 75%, rgba(107,104,98,0) 100%)" },
  { name: "Chicle-based gum", note: "Months to years", width: 62, bar: "linear-gradient(90deg, #a59f97 0%, #a59f97 70%, rgba(165,159,151,0) 100%)" },
];

export default function GumTimeline() {
  const reduce = useReducedMotion();
  return (
    <section className="bg-background px-[clamp(16px,2.8vw,44px)] py-[18svh]">
      <div className="mx-auto max-w-[1200px]">
        <RevealLines
          lines={["How long gum", "sticks around."]}
          className="mb-4 text-[clamp(38px,5.4vw,80px)] leading-[0.98] tracking-[-0.04em]"
        />
        <p className="mb-16 max-w-[48ch] text-lg text-ink-2">
          After it is spat out, most gum stays where it lands. Ours is designed to be swallowed instead.
        </p>
        <div className="flex flex-col gap-10">
          {ROWS.map((row, i) => (
            <div key={row.name}>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <span className={`text-xl font-bold md:text-2xl`}>{row.name}</span>
                <span className={`text-right text-sm md:text-base text-ink-2`}>{row.note}</span>
              </div>
              <div className="h-10 w-full overflow-hidden rounded-full bg-foreground/[0.06] md:h-12">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: row.bar }}
                  initial={reduce ? false : { width: "0%" }}
                  whileInView={{ width: `${row.width}%` }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 2.2, ease: EASE, delay: 0.15 * i }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm italic text-muted-foreground">
          Not to scale. The DissolvaGum figure is a design target, not a result.
        </p>
      </div>
    </section>
  );
}
