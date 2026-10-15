/* Scroll ranges (0 to 1) for the sidewalk scenes. Kept apart from the three.js code
   so the page can read them without loading the 3D bundle. */
export const TIMELINE = {
  fall: [0, 0.13],
  impact: [0.13, 0.2],
  step: [0.22, 0.36],
  time: [0.38, 0.78],
  pullBack: [0.8, 1],
} as const;
