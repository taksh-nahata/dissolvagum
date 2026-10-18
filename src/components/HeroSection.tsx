"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import CtaLink from "@/components/CtaLink";
import Pavement from "@/components/Pavement";
import RevealLines, { EASE } from "@/components/RevealLines";
import { useIntroStarted } from "@/lib/ready";

// three.js only loads in the browser, after the page has rendered.
const GumScene = dynamic(() => import("@/components/GumScene"), { ssr: false });

/* Pinned street. Scroll timeline (0 to 1):
   0.12-0.38  the intro lifts away and blurs out
   0.30-0.57  "Every one of those spots is old gum."
   0.36-0.90  the gum on the street dissolves (in Pavement)
   0.60-0.90  "Ours is designed to leave nothing behind."
   0.86-1     the whole stage shrinks into a rounded card as the next section arrives */
const HeroSection = () => {
  const outer = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const go = useIntroStarted(); // the intro waits for the loading screen to lift

  const { scrollYProgress: p } = useScroll({ target: outer, offset: ["start start", "end end"] });
  useMotionValueEvent(p, "change", (v) => {
    progress.current = reduce ? 0 : v;
  });

  const introY = useTransform(p, [0.12, 0.38], [0, -120]);
  const introBlur = useTransform(p, [0.12, 0.34], [0, 14]);
  const introOpacity = useTransform(p, [0.14, 0.36], [1, 0]);
  const introFilter = useMotionTemplate`blur(${introBlur}px)`;

  const aOpacity = useTransform(p, [0.3, 0.36, 0.52, 0.57], [0, 1, 1, 0]);
  const aBlur = useTransform(p, [0.3, 0.36, 0.52, 0.57], [12, 0, 0, 12]);
  const aY = useTransform(p, [0.3, 0.57], [30, -30]);
  const bOpacity = useTransform(p, [0.6, 0.66], [0, 1]);
  const bBlur = useTransform(p, [0.6, 0.66], [12, 0]);
  const bY = useTransform(p, [0.6, 0.9], [40, 0]);
  const aFilter = useMotionTemplate`blur(${aBlur}px)`;
  const bFilter = useMotionTemplate`blur(${bBlur}px)`;

  const stageScale = useTransform(p, [0.86, 1], [1, 0.9]);
  const stageRadius = useTransform(p, [0.86, 1], [0, 36]);
  const stageDim = useTransform(p, [0.86, 1], [0, 0.55]);
  const cueOpacity = useTransform(p, [0, 0.06], [1, 0]);

  const line = "text-[clamp(40px,5.6vw,88px)] font-bold leading-[0.95] tracking-[-0.04em]";

  return (
    <section
      id="story"
      ref={outer}
      className="relative bg-[#0e1a17]"
      style={{ height: reduce ? "100svh" : "460svh" }}
      aria-label="DissolvaGum introduction"
    >
      <motion.div
        className="sticky top-0 h-[100svh] origin-top overflow-hidden bg-[#2a2a29] text-white will-change-transform"
        style={reduce ? undefined : { scale: stageScale, borderRadius: stageRadius }}
      >
        <Pavement progressRef={progress} still={reduce} />
        {/* a shadow behind the words, so the headline stays easy to read */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 75% at 20% 55%, rgba(18,18,17,0.78) 0%, rgba(18,18,17,0) 100%)" }}
          aria-hidden
        />
        <GumScene progressRef={progress} still={reduce} label="A 3D stick of gum floating above a street covered in old gum." />

        {/* Intro: positioned by the outer div; the inner one carries the scroll motion, so transforms don't clash */}
        <div className="absolute bottom-[10svh] left-0 right-0 max-w-[760px] px-[clamp(16px,2.8vw,44px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <motion.div
            className="flex flex-col items-start gap-7"
            style={reduce ? undefined : { y: introY, opacity: introOpacity, filter: introFilter }}
          >
            <motion.p
              className="text-sm font-bold text-[#b4c9bb]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={go ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            >
              A concept from Folsom, California
            </motion.p>
            <RevealLines
              as="h1"
              on="mount"
              play={go}
              delay={0.35}
              lines={["Stop", "chewing", "plastic."]}
              className="text-[clamp(56px,9.5vw,148px)] uppercase leading-[0.86] tracking-[-0.045em]"
              lineClassName={(i) => (i === 2 ? "text-mint" : "")}
            />
            <motion.p
              className="max-w-[40ch] text-lg leading-[1.5] text-[#c9d6ce] md:text-xl"
              initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={go ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
              transition={{ duration: 1, ease: EASE, delay: 0.9 }}
            >
              <strong className="text-white">Chew some gum. Skip the mess.</strong> Four high school students are designing
              a gum that is safe to swallow, so it never ends up on the sidewalk.
            </motion.p>
            <motion.div
              className="flex flex-wrap items-center gap-x-6 gap-y-1"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={go ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1, ease: EASE, delay: 1.05 }}
            >
              <CtaLink href="/get-involved" variant="light">Follow the project</CtaLink>
              <CtaLink href="#how" variant="text-light">See how it works</CtaLink>
            </motion.div>
          </motion.div>
        </div>

        {/* Two short lines while the street clears */}
        {!reduce && (
          <div className="pointer-events-none absolute bottom-[12svh] left-0 right-0 grid max-w-[720px] px-[clamp(16px,2.8vw,44px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2" aria-hidden>
            <motion.p className={`col-start-1 row-start-1 ${line}`} style={{ opacity: aOpacity, y: aY, filter: aFilter }}>
              Every one of those spots is old gum.
            </motion.p>
            <motion.p className={`col-start-1 row-start-1 ${line}`} style={{ opacity: bOpacity, y: bY, filter: bFilter }}>
              Ours is designed to leave <span className="text-mint">nothing</span> behind.
            </motion.p>
          </div>
        )}

        {!reduce && (
          <motion.div
            className="absolute bottom-6 left-[clamp(16px,2.8vw,44px)] flex items-center gap-3"
            style={{ opacity: cueOpacity }}
            aria-hidden
          >
            <span className="relative h-8 w-px overflow-hidden bg-white/25">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-white"
                animate={{ y: [-12, 32] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <span className="text-sm font-bold">Scroll</span>
          </motion.div>
        )}
        {/* dims as the stage shrinks away */}
        {!reduce && <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: stageDim }} aria-hidden />}
      </motion.div>
    </section>
  );
};

export default HeroSection;
