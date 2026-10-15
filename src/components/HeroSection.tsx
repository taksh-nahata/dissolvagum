"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import CtaLink from "@/components/CtaLink";
import Pavement from "@/components/Pavement";

// three.js only loads in the browser, after the page has rendered.
const GumScene = dynamic(() => import("@/components/GumScene"), { ssr: false });

const EASE = [0.16, 0.84, 0.24, 1] as const;

/* Pinned sidewalk. Scroll timeline (0 to 1):
   0-0.55 headline holds, then lifts away; 0.36-0.9 the gum on the pavement dissolves;
   0.62-0.9 the closing line lands; the stick spins throughout and leaves at the end. */
const HeroSection = () => {
  const outer = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const [cleaned, setCleaned] = useState(false);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = reduce ? 0 : v;
    setCleaned(v > 0.55);
  });

  const copyY = useTransform(scrollYProgress, [0.3, 0.6], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0.35, 0.58], [1, 0]);
  const lineOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const lineScale = useTransform(scrollYProgress, [0.62, 0.9], [0.92, 1]);
  const stickOpacity = useTransform(scrollYProgress, [0.5, 0.7], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const lines = ["Chew some gum.", "Skip the mess."];

  return (
    <section
      id="story"
      ref={outer}
      className="relative"
      style={{ height: reduce ? "100svh" : "260svh" }}
      aria-label="DissolvaGum introduction"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#c9c6bf] text-[#12261d]">
        <Pavement progressRef={progress} still={reduce} />
        {/* a pool of light behind the words, so the headline stays easy to read */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 22% 50%, rgba(240,237,229,0.8) 0%, rgba(240,237,229,0) 100%)" }}
          aria-hidden
        />
        <motion.div className="absolute inset-0" style={reduce ? undefined : { opacity: stickOpacity }}>
          <GumScene
            progressRef={progress}
            still={reduce}
            label="A 3D stick of gum floating above a sidewalk covered in old gum."
          />
        </motion.div>

        {/* Headline and intro */}
        {/* positioned by the outer div; the inner one carries the scroll motion, so their transforms don't clash */}
        <div className="absolute bottom-[12svh] left-0 right-0 max-w-[680px] px-[clamp(16px,2.8vw,44px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
        <motion.div
          className="flex flex-col items-start gap-6"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <motion.p
            className="text-sm font-bold text-[#3f5a4c]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            A concept from Folsom, California
          </motion.p>
          <h1 className="text-[clamp(44px,6vw,92px)] leading-[0.96] tracking-[-0.04em]">
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.14 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="max-w-[42ch] text-lg leading-[1.5] text-[#2c4337] md:text-xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          >
            Four high school students are designing a gum that is safe to swallow when you finish chewing, so it never
            ends up on the sidewalk.
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center gap-x-6 gap-y-1"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
          >
            <CtaLink href="/support-interest">Follow the project</CtaLink>
            <CtaLink href="#how" variant="text">See how it works</CtaLink>
          </motion.div>
        </motion.div>
        </div>

        {/* Closing line, once the sidewalk is clean */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center"
            style={{ opacity: lineOpacity, scale: lineScale }}
            aria-hidden={!cleaned}
          >
            <p className="max-w-[16ch] text-balance text-[clamp(40px,6.4vw,104px)] font-bold leading-[0.95] tracking-[-0.045em]">
              Designed to leave nothing behind.
            </p>
          </motion.div>
        )}

        {!reduce && (
          <motion.div
            className="absolute bottom-6 left-[clamp(16px,2.8vw,44px)] flex items-center gap-3"
            style={{ opacity: cueOpacity }}
            aria-hidden
          >
            <span className="relative h-8 w-px overflow-hidden bg-[#12261d]/25">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-[#12261d]"
                animate={{ y: [-12, 32] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <span className="text-sm font-bold">Scroll</span>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
