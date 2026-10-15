"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { TIMELINE } from "@/lib/sidewalkTimeline";

const SidewalkScene = dynamic(() => import("@/components/SidewalkScene"), { ssr: false });

const EASE = [0.16, 0.84, 0.24, 1] as const;

type Copy = {
  eyebrow: string;
  captions: [string, string, string, string]; // fall, step, time, pull back
  counter: string[]; // labels shown across the time-lapse
  note?: string;
  label: string;
};

const COPY: Record<"problem" | "ours", Copy> = {
  problem: {
    eyebrow: "The problem",
    captions: [
      "Someone spits out their gum.",
      "Someone steps on it.",
      "Dirt sticks to it. It turns black.",
      "And it stays.",
    ],
    counter: ["Day 1", "1 week", "1 month", "6 months", "1 year", "5 years"],
    label: "A wad of chewed gum falls onto a sidewalk, is stepped on, and turns into a black stain over five years. The camera pulls back to show many more.",
  },
  ours: {
    eyebrow: "Spat out anyway?",
    captions: [
      "Say someone still spits ours out.",
      "And someone steps on it.",
      "It is designed to break down within about 5 days.",
      "Nothing left on the sidewalk.",
    ],
    counter: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    note: "5 days is a design target, not a result. Illustration.",
    label: "A wad of DissolvaGum falls onto a sidewalk, is stepped on, and breaks down until nothing is left by day 5. An illustration of the design goal.",
  },
};

export default function SidewalkStory({ variant }: { variant: "problem" | "ours" }) {
  const copy = COPY[variant];
  const outer = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState(0);
  const [tick, setTick] = useState(-1);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    progress.current = p;
    setPhase(p < TIMELINE.impact[1] ? 0 : p < TIMELINE.time[0] ? 1 : p < TIMELINE.pullBack[0] ? 2 : 3);
    const t = (p - TIMELINE.time[0]) / (TIMELINE.time[1] - TIMELINE.time[0]);
    setTick(t < 0 ? -1 : Math.min(copy.counter.length - 1, Math.floor(t * copy.counter.length)));
  });

  const counterLabel = tick >= 0 ? copy.counter[tick] : null;

  return (
    <section
      ref={outer}
      className="relative"
      style={{ height: reduce ? "auto" : "440svh" }}
      aria-label={copy.eyebrow}
    >
      <div className={`${reduce ? "relative h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden bg-[#a7a39b] text-[#12261d]`}>
        <SidewalkScene progressRef={progress} variant={variant} still={reduce} label={copy.label} />
        {/* soft light behind the captions so they read over the concrete */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(226,223,215,0.82) 0%, rgba(226,223,215,0.35) 34%, rgba(226,223,215,0) 55%)" }}
          aria-hidden
        />

        <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top,0px)+88px)] flex items-start justify-between gap-6 px-[clamp(16px,2.8vw,44px)]">
          <p className="text-sm font-bold text-[#3f5a4c]">{copy.eyebrow}</p>
          <div className="text-right" aria-live="polite">
            <p className="text-sm font-bold text-[#3f5a4c]">{counterLabel || reduce ? "Time on the sidewalk" : " "}</p>
            <AnimatePresence mode="popLayout" initial={false}>
              {(counterLabel || reduce) && (
                <motion.p
                  key={reduce ? "static" : counterLabel}
                  className="text-[clamp(44px,7vw,112px)] font-bold leading-none tracking-[-0.045em] tabular-nums"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {reduce ? copy.counter[copy.counter.length - 1] : counterLabel}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-[10svh] left-0 max-w-[620px] px-[clamp(16px,2.8vw,44px)]">
          {reduce ? (
            <ol className="flex flex-col gap-2 text-2xl font-bold leading-tight">
              {copy.captions.map((c) => <li key={c}>{c}</li>)}
            </ol>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={phase}
                className="text-balance text-[clamp(30px,4.2vw,60px)] font-bold leading-[1.02] tracking-[-0.035em]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                {copy.captions[phase]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
        {copy.note && (
          <p className="absolute bottom-6 right-[clamp(16px,2.8vw,44px)] text-sm italic text-[#2c4337]">{copy.note}</p>
        )}
      </div>
    </section>
  );
}
