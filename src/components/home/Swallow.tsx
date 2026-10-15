"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* The solution, pinned: a line-art profile (in the style of the pack's mountain line art).
   Scroll draws the profile, the wad is chewed in the mouth, then swallowed: it travels down
   the throat with a visible bulge, and fades out below. */

type Pt = [number, number];

// Catmull-Rom through the points, as cubic Bezier commands.
function smoothPath(pts: Pt[]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Back of the neck, over the head, down the face to under the chin.
const HEAD = smoothPath([
  [190, 860], [196, 660], [186, 545], [150, 452], [140, 330], [176, 214], [262, 150], [362, 140], [432, 186],
  [456, 256], [452, 300], [472, 332], [502, 366], [470, 381], [468, 399], [480, 410], [462, 420], [476, 433],
  [467, 454], [448, 480], [410, 497], [362, 502],
]);
const EAR = "M238,300 C212,300 206,362 234,374";
const EYE = "M404,266 q13,7 26,0";
// The way the gum goes: from the mouth, back and down the throat, out the bottom.
const THROAT = smoothPath([[452, 414], [426, 430], [396, 456], [354, 505], [328, 560], [320, 650], [320, 760], [320, 900]]);
const NECK_FRONT: Pt[] = [[362, 502], [353, 560], [350, 650], [352, 760], [356, 860]];

const STEPS = [
  { title: "Chew it.", body: "Our goal is the chew and texture you expect from the gum you already know.", until: 0.38 },
  { title: "Designed to be swallowed.", body: "When you finish chewing, it is designed to be safe to swallow instead of spat out.", until: 0.72 },
  { title: "Designed to be digestible.", body: "Spent gum is designed to be digestible, so it never ends up on the sidewalk.", until: 1.01 },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => t * t * (3 - 2 * t);

export default function Swallow() {
  const outer = useRef<HTMLElement>(null);
  const throat = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [wad, setWad] = useState({ x: 452, y: 414, o: 1, s: 1, chew: true });
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const draw = useTransform(scrollYProgress, [0, 0.14], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.max(0, STEPS.findIndex((s) => p < s.until)));
    const path = throat.current;
    if (!path) return;
    const u = ease(clamp01((p - 0.4) / 0.36)); // travel along the throat
    const pt = path.getPointAtLength(u * path.getTotalLength());
    const gone = clamp01((p - 0.78) / 0.14); // fades out low in the body
    setWad({ x: pt.x, y: pt.y, o: 1 - gone, s: 1 - 0.35 * u - 0.3 * gone, chew: p < 0.38 });
  });

  // The front of the neck bulges where the wad is.
  const neck = smoothPath(
    NECK_FRONT.map(([x, y]) => [x + (wad.y > 470 && wad.o > 0.05 ? 13 * Math.exp(-Math.pow((y - wad.y) / 34, 2)) : 0), y] as Pt)
  );

  const line = { fill: "none", stroke: "#8fc4a6", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <section ref={outer} id="how" className="relative" style={{ height: reduce ? "auto" : "380svh" }} aria-label="How DissolvaGum is designed to work">
      <div className={`${reduce ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden bg-[#0e1a17] text-[#e8f3ec]`}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(40% 60% at 66% 46%, rgba(143,196,166,0.14) 0%, rgba(143,196,166,0) 100%)" }}
          aria-hidden
        />
        <svg
          viewBox="80 110 520 790"
          className="absolute right-[2vw] top-[4svh] h-[62svh] w-auto md:right-[8vw] md:top-[6svh] md:h-[94svh]"
          role="img"
          aria-label="Line drawing of a person in profile. A piece of gum is chewed in the mouth, then swallowed down the throat. An illustration of the design goal."
        >
          <defs>
            <radialGradient id="wadFill" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#f6fbf7" />
              <stop offset="55%" stopColor="#cfe6d8" />
              <stop offset="100%" stopColor="#8fbea3" />
            </radialGradient>
          </defs>
          <motion.path d={HEAD} {...line} style={reduce ? undefined : { pathLength: draw }} />
          <motion.path d={EAR} {...line} style={reduce ? undefined : { pathLength: draw }} />
          <motion.path d={EYE} {...line} style={reduce ? undefined : { pathLength: draw }} />
          <path d={neck} {...line} />
          <path ref={throat} d={THROAT} fill="none" stroke="#8fc4a6" strokeOpacity={0.18} strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" />

          {/* the wad: glossy, lumpy, chewed */}
          <g transform={`translate(${wad.x} ${wad.y}) scale(${wad.s * 1.35})`} opacity={wad.o}>
            <g className={wad.chew && !reduce ? "dg-chew" : undefined}>
              <path
                d="M-17,-3 C-18,-12 -8,-17 1,-15 C10,-16 18,-10 17,-1 C19,8 10,15 0,14 C-9,16 -18,9 -17,-3 Z"
                fill="url(#wadFill)"
              />
              <path d="M-7,2 C-2,5 4,4 8,0" fill="none" stroke="#7fae94" strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
              <ellipse cx={-6} cy={-7} rx={5} ry={2.6} fill="#ffffff" opacity={0.85} transform="rotate(-20 -6 -7)" />
            </g>
          </g>
        </svg>

        <div className="absolute inset-x-0 bottom-[7svh] px-[clamp(16px,2.8vw,44px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <p className="mb-8 text-sm font-bold text-[#8fa79a]">The solution</p>
          <ol className="flex max-w-[520px] flex-col gap-10">
            {STEPS.map((s, i) => {
              const on = reduce || i === active;
              return (
                <motion.li
                  key={s.title}
                  className={on ? "block" : "hidden md:block"}
                  animate={{ opacity: on ? 1 : 0.28, x: on ? 0 : -8 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="mb-2 text-[clamp(30px,3.6vw,52px)] leading-[1.02] tracking-[-0.035em]">{s.title}</h3>
                  <p className="text-lg leading-[1.5] text-[#b4c9bb]">{s.body}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
        <p className="absolute bottom-6 right-[clamp(16px,2.8vw,44px)] text-sm italic text-[#8fa79a]">Illustration of the design goal.</p>
      </div>
    </section>
  );
}
