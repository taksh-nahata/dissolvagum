"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

const GumScene = dynamic(() => import("@/components/GumScene"), { ssr: false });

// A real sequence, so the steps are numbered. Ranges match the stage timeline in GumScene.
const STEPS = [
  { n: 1, title: "Chew it.", body: "Our goal is the chew and texture you expect from the gum you already know.", until: 0.33 },
  { n: 2, title: "Designed to be swallowed.", body: "When you finish chewing, it is designed to be safe to swallow instead of spat out.", until: 0.6 },
  { n: 3, title: "Nothing left behind.", body: "Spent gum is designed to be digestible and biodegradable, so there is nothing left on the sidewalk.", until: 1.01 },
];

export default function HowItWorks() {
  const outer = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    setActive(Math.max(0, STEPS.findIndex((s) => v < s.until)));
  });

  return (
    <section
      id="how"
      ref={outer}
      className="relative scroll-mt-0"
      style={{ height: reduce ? "auto" : "340svh" }}
      aria-label="How DissolvaGum is designed to work"
    >
      <div className={`${reduce ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden bg-[#0e1a17] text-[#e8f3ec]`}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 55% at 68% 50%, rgba(143,196,166,0.16) 0%, rgba(143,196,166,0) 100%)" }}
          aria-hidden
        />
        <GumScene
          progressRef={progress}
          still={reduce}
          variant="stage"
          label="A 3D stick of gum that chews, drops away as if swallowed, then dissolves into particles. An illustration of the design goal."
        />

        <div className="absolute inset-x-0 bottom-[8svh] px-[clamp(16px,2.8vw,44px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <p className="mb-8 text-sm font-bold text-[#8fa79a]">How it is designed to work</p>
          <div className="flex gap-6">
            {/* progress rail */}
            {!reduce && (
              <div className="relative hidden w-px bg-white/15 md:block" aria-hidden>
                <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-mint" style={{ scaleY: scrollYProgress }} />
              </div>
            )}
            <ol className="flex max-w-[520px] flex-col gap-10">
              {STEPS.map((s, i) => {
                const on = reduce || i === active;
                return (
                  <motion.li
                    key={s.n}
                    className={reduce || on ? "block" : "hidden md:block"}
                    animate={{ opacity: on ? 1 : 0.28, x: on || reduce ? 0 : -8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="mb-2 block text-sm font-bold text-mint">Step {s.n}</span>
                    <h3 className="mb-2 text-[clamp(30px,3.6vw,52px)] leading-[1.02] tracking-[-0.035em]">{s.title}</h3>
                    <p className="text-lg leading-[1.5] text-[#b4c9bb]">{s.body}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
        <p className="absolute bottom-6 right-[clamp(16px,2.8vw,44px)] text-sm italic text-[#8fa79a]">
          Illustration of the design goal.
        </p>
      </div>
    </section>
  );
}
