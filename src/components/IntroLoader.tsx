"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { EASE } from "@/components/RevealLines";
import { getLenis } from "@/components/SmoothScroll";
import { introPhase, loadFonts, markReady, READY_KEYS, readyCount, setLoading, startIntro, subscribe } from "@/lib/ready";

const MIN_MS = 900; // long enough to read as intentional, not a flash
const MAX_MS = 7000; // never hold anyone hostage on a slow device

/* Covers the home page on first load while the fonts load and the 3D scenes build and compile.
   Then the panel lifts like a curtain and the hero intro plays on top of a page that is ready. */
export default function IntroLoader() {
  const [show] = useState(() => introPhase() !== "started");
  if (show) setLoading();
  const [open, setOpen] = useState(show);
  const reduce = useReducedMotion() ?? false;

  const fill = useSpring(0, { stiffness: 60, damping: 18 });
  const pct = useTransform(fill, (v) => `${Math.round(v * 100)}`);

  useEffect(() => {
    if (!show) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    window.scrollTo(0, 0);

    const t0 = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      fill.set(1);
      const wait = Math.max(0, MIN_MS - (performance.now() - t0));
      setTimeout(() => {
        html.style.overflow = "";
        getLenis()?.start();
        startIntro();
        setOpen(false);
      }, wait + 250);
    };
    const update = () => {
      fill.set(readyCount() / READY_KEYS.length);
      if (readyCount() >= READY_KEYS.length) finish();
    };
    const unsub = subscribe(update);
    loadFonts().then(() => markReady("fonts"));
    update();
    const cap = setTimeout(finish, MAX_MS);
    return () => {
      unsub();
      clearTimeout(cap);
      html.style.overflow = "";
      getLenis()?.start();
    };
  }, [show, fill]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-[#0e1a17] text-[#e8f3ec]"
          initial={false}
          exit={reduce ? { opacity: 0, transition: { duration: 0.4 } } : { y: "-100%", transition: { duration: 1.05, ease: [0.76, 0, 0.24, 1] } }}
          aria-live="polite"
          aria-label="Loading"
          role="status"
        >
          <motion.div
            className="flex flex-col items-center gap-6"
            exit={reduce ? undefined : { opacity: 0, y: -40, filter: "blur(8px)", transition: { duration: 0.5, ease: EASE } }}
          >
            <p className="overflow-hidden text-[clamp(22px,3vw,34px)] uppercase tracking-[0.18em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                DissolvaGum
              </motion.span>
            </p>
            <div className="h-px w-[min(220px,50vw)] overflow-hidden bg-white/15">
              <motion.div className="h-full origin-left bg-mint" style={{ scaleX: fill }} />
            </div>
            <p className="text-xs font-bold tabular-nums text-[#8fa79a]">
              <motion.span>{pct}</motion.span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
