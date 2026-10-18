"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { introPhase } from "@/lib/ready";

let instance: Lenis | null = null;
/** The running Lenis instance, if any (the loading screen pauses it). */
export const getLenis = () => instance;

/* Smooth, eased scrolling so the scroll-driven scenes glide instead of stepping.
   Skipped entirely for people who ask for reduced motion. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: true });
    instance = lenis;
    if (introPhase() === "loading") lenis.stop();
    return () => {
      lenis.destroy();
      instance = null;
    };
  }, []);
  return null;
}
