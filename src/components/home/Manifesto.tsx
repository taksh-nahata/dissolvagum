"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

// [text, highlighted]: words light up one by one as the paragraph scrolls past.
const SEGMENTS: [string, boolean][] = [
  ["On the first day of high school, we kept stepping on gum. Most gum is made from a synthetic, plastic-like polymer that", false],
  ["does not break down.", true],
  ["So four students in Folsom set out to design one that", false],
  ["does.", true],
];

const WORDS = SEGMENTS.flatMap(([text, hi]) => text.split(" ").map((w) => ({ w, hi })));

function Word({ children, hi, progress, range }: { children: string; hi: boolean; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={hi ? "text-mint" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  return (
    <section className="bg-[#0e1a17] px-[clamp(16px,2.8vw,44px)] py-[22svh] text-[#e8f3ec]">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-8 text-sm font-bold text-[#8fa79a]">Why we started</p>
        <p ref={ref} className="text-[clamp(30px,4.6vw,68px)] font-bold leading-[1.08] tracking-[-0.03em]">
          {reduce
            ? SEGMENTS.map(([t, hi]) => (
                <span key={t} className={hi ? "text-mint" : undefined}>{t} </span>
              ))
            : WORDS.map(({ w, hi }, i) => (
                <Word key={i} hi={hi} progress={scrollYProgress} range={[i / WORDS.length, (i + 1) / WORDS.length]}>
                  {w}
                </Word>
              ))}
        </p>
      </div>
    </section>
  );
}
