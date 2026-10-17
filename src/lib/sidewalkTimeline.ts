/* Scroll ranges (0 to 1) for the sidewalk scene. Kept apart from the three.js code
   so the page can read them without loading the 3D bundle. 0-0.06 is the stage growing in. */
export const TIMELINE = {
  fall: [0.06, 0.18],
  impact: [0.18, 0.24],
  step: [0.26, 0.4],
  time: [0.42, 0.8],
  pullBack: [0.82, 1],
} as const;
