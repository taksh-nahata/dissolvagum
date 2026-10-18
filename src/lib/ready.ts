"use client";

import { useSyncExternalStore } from "react";

/* First-load coordination for the home page. The heavy work (fonts, building and compiling the
   3D scenes, painting the street) all happens behind the loading screen; the intro animations
   only start once it lifts, so nothing stutters while it plays. */

export const READY_KEYS = ["fonts", "pavement", "hero3d", "street3d"] as const;
export type ReadyKey = (typeof READY_KEYS)[number];

const done = new Set<ReadyKey>();
const subs = new Set<() => void>();
let phase: "idle" | "loading" | "started" = "idle";
const emit = () => subs.forEach((f) => f());

export const markReady = (k: ReadyKey) => {
  if (done.has(k)) return;
  done.add(k);
  performance.mark(`dg:${k}`);
  emit();
};
export const readyCount = () => done.size;
export const subscribe = (f: () => void) => (subs.add(f), () => void subs.delete(f));

export const introPhase = () => phase;
/** Called while the loading screen renders, before the hero, so the hero waits from its first render. */
export const setLoading = () => {
  if (phase === "idle") phase = "loading";
};
export const startIntro = () => {
  phase = "started";
  performance.mark("dg:intro");
  emit();
};

/** True once the loading screen has lifted (or when there is none, e.g. on a later visit). */
export function useIntroStarted() {
  return useSyncExternalStore(subscribe, () => phase !== "loading", () => false);
}

/** Waits for the page font in both weights, so canvas artwork and line breaks never swap mid-animation. */
export function loadFonts() {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load('400 40px "Glacial Indifference"'),
    document.fonts.load('700 40px "Glacial Indifference"'),
  ]).then(() => undefined, () => undefined);
}
