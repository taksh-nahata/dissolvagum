"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { TIMELINE } from "@/lib/sidewalkTimeline";
import { EASE } from "@/components/RevealLines";

const SidewalkScene = dynamic(() => import("@/components/SidewalkScene"), { ssr: false });

const COUNTER = ["Day 1", "1 week", "1 month", "6 months", "1 year", "5 years"];

// Each caption owns a slice of the scroll and fades through blur at its edges.
const CAPTIONS: { text: string; range: [number, number] }[] = [
  { text: "Someone spits out their gum.", range: [TIMELINE.fall[0], TIMELINE.impact[1]] },
  { text: "Someone steps on it.", range: [TIMELINE.impact[1], TIMELINE.time[0]] },
  { text: "Dirt sticks to it. It turns black.", range: [TIMELINE.time[0], TIMELINE.pullBack[0]] },
  { text: "And it stays.", range: [TIMELINE.pullBack[0], 1.02] },
];

function Caption({ text, range, p }: { text: string; range: [number, number]; p: MotionValue<number> }) {
  const [a, b] = range;
  const f = 0.025;
  const opacity = useTransform(p, [a - f, a + f, b - f, b + f], [0, 1, 1, 0]);
  const blur = useTransform(p, [a - f, a + f, b - f, b + f], [10, 0, 0, 10]);
  const y = useTransform(p, [a - f, b + f], [24, -24]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.p
      className="col-start-1 row-start-1 text-balance text-[clamp(32px,4.4vw,64px)] font-bold leading-[1] tracking-[-0.035em]"
      style={{ opacity, y, filter }}
    >
      {text}
    </motion.p>
  );
}

export default function SidewalkStory() {
  const outer = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const [tick, setTick] = useState(-1);
  const { scrollYProgress: p } = useScroll({ target: outer, offset: ["start start", "end end"] });

  const [t0, t1] = TIMELINE.time;
  useMotionValueEvent(p, "change", (v) => {
    progress.current = v;
    const t = (v - t0) / (t1 - t0);
    setTick(t < 0 ? -1 : Math.min(COUNTER.length - 1, Math.floor(t * COUNTER.length)));
  });

  // the stage grows in from a rounded card, mirroring the hero's exit
  const scale = useTransform(p, [0, 0.06], [0.9, 1]);
  const radius = useTransform(p, [0, 0.06], [36, 0]);
  const timeBar = useTransform(p, [t0, t1], [0, 1]);
  const counterOpacity = useTransform(p, [t0 - 0.03, t0], [0, 1]);

  const label = tick >= 0 ? COUNTER[tick] : COUNTER[0];

  return (
    <section
      ref={outer}
      className="relative bg-[#0e1a17]"
      style={{ height: reduce ? "auto" : "480svh" }}
      aria-label="The problem"
    >
      <motion.div
        className={`${reduce ? "relative h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden bg-[#a7a39b] text-[#12261d] will-change-transform`}
        style={reduce ? undefined : { scale, borderRadius: radius }}
      >
        <SidewalkScene
          progressRef={progress}
          still={reduce}
          label="A wad of chewed gum falls onto a sidewalk, is stepped on, and turns into a black stain over five years. The camera pulls back to show many more."
        />
        {/* soft light behind the captions, and a vignette for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(226,223,215,0.8) 0%, rgba(226,223,215,0.3) 34%, rgba(226,223,215,0) 55%), radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)",
          }}
          aria-hidden
        />

        <div className="absolute inset-x-0 top-[88px] flex items-start justify-between gap-6 px-[clamp(16px,2.8vw,44px)]">
          <p className="text-sm font-bold text-[#3f5a4c]">The problem</p>
          <motion.div className="w-[min(44vw,320px)] text-right" style={reduce ? undefined : { opacity: counterOpacity }} aria-live="polite">
            <p className="mb-1 text-sm font-bold text-[#3f5a4c]">Time on the sidewalk</p>
            {/* slot: the new value rolls up from below, the old one rolls out the top */}
            <div className="relative h-[clamp(44px,6.6vw,104px)] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.p
                  key={reduce ? "static" : label}
                  className="absolute inset-0 text-[clamp(44px,6.6vw,104px)] font-bold leading-none tracking-[-0.045em] tabular-nums"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  {reduce ? COUNTER[COUNTER.length - 1] : label}
                </motion.p>
              </AnimatePresence>
            </div>
            {!reduce && (
              <div className="relative mt-3 h-[3px] w-full rounded-full bg-[#12261d]/15">
                <motion.div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[#12261d]" style={{ scaleX: timeBar }} />
              </div>
            )}
          </motion.div>
        </div>

        <div className="absolute bottom-[10svh] left-0 grid max-w-[640px] px-[clamp(16px,2.8vw,44px)]">
          {reduce ? (
            <ol className="flex flex-col gap-2 text-2xl font-bold leading-tight">
              {CAPTIONS.map((c) => <li key={c.text}>{c.text}</li>)}
            </ol>
          ) : (
            CAPTIONS.map((c) => <Caption key={c.text} text={c.text} range={c.range} p={p} />)
          )}
        </div>
      </motion.div>
    </section>
  );
}
