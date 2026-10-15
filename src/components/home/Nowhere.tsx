"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* "Stuck to a sidewalk" gets struck through as you scroll, then "nowhere at all" rises in. */
export default function Nowhere() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });
  const strike = useTransform(scrollYProgress, [0.05, 0.4], [0, 1]);
  const fadeOld = useTransform(scrollYProgress, [0.3, 0.5], [1, 0.35]);
  const newOpacity = useTransform(scrollYProgress, [0.45, 0.75], [0, 1]);
  const newY = useTransform(scrollYProgress, [0.45, 0.8], [60, 0]);

  return (
    <section className="bg-background px-[clamp(16px,2.8vw,44px)] py-[20svh]">
      <div ref={ref} className="mx-auto flex max-w-[1200px] flex-col gap-4">
        <p className="text-xl text-ink-2 md:text-2xl">Most gum ends up</p>
        <motion.p
          className="relative w-fit text-[clamp(48px,8.4vw,136px)] font-bold leading-[0.95] tracking-[-0.05em]"
          style={reduce ? { opacity: 0.35 } : { opacity: fadeOld }}
        >
          stuck to a sidewalk.
          <motion.span
            className="absolute left-[-2%] right-[-2%] top-[52%] h-[0.08em] origin-left rounded-full bg-foreground"
            style={reduce ? undefined : { scaleX: strike }}
            aria-hidden
          />
        </motion.p>
        <motion.div className="mt-12 flex flex-col gap-4" style={reduce ? undefined : { opacity: newOpacity, y: newY }}>
          <p className="text-xl text-ink-2 md:text-2xl">Ours is designed to end up</p>
          <p className="text-[clamp(48px,8.4vw,136px)] font-bold leading-[0.95] tracking-[-0.05em] text-primary">
            nowhere at all.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
