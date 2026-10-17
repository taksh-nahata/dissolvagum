"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Smooth, eased scrolling so the scroll-driven scenes glide instead of stepping.
   Skipped entirely for people who ask for reduced motion. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
