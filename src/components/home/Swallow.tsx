"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* The solution, pinned: a line-art profile (in the style of the pack's mountain line art).
   0-0.06    the stage grows in;  0.02-0.16 the profile draws itself
   0-0.40    the jaw chews the wad
   0.40-0.74 the gulp: the head nods, the wad travels down the throat leaving a glowing trail,
             and the throat bulges where the wad is
   0.74-1    the wad fades low in the body with a soft glow */

type Pt = [number, number];

// Catmull-Rom through the points, as cubic Bezier commands.
function smoothPath(pts: Pt[]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

// Back of the neck, over the head, down the face to under the chin. Points from index 16 on move with the jaw.
const HEAD: Pt[] = [
  [190, 860], [196, 660], [186, 545], [150, 452], [140, 330], [176, 214], [262, 150], [362, 140], [432, 186],
  [456, 256], [452, 300], [472, 332], [502, 366], [470, 381], [468, 399], [480, 410], [462, 420], [476, 433],
  [467, 454], [448, 480], [410, 497], [362, 502],
];
const JAW_WEIGHT = (i: number) => (i < 16 ? 0 : [1, 1, 1, 0.9, 0.6, 0.3][i - 16]);
const EAR = "M238,300 C212,300 206,362 234,374";
const EYE = "M404,266 q13,7 26,0";
// The way the gum goes: from the mouth, back and down the throat, out the bottom.
const THROAT = smoothPath([[452, 414], [426, 430], [396, 456], [354, 505], [328, 560], [320, 650], [320, 760], [320, 860]]);
const NECK_FRONT: Pt[] = [[362, 502], [353, 560], [350, 650], [352, 760], [356, 860]];

const STEPS = [
  { title: "Chew it.", body: "Our goal is the chew and texture you expect from the gum you already know.", until: 0.4 },
  { title: "Designed to be swallowed.", body: "When you finish chewing, it is designed to be safe to swallow.", until: 0.76 },
  { title: "Designed to be digestible.", body: "Spent gum is designed to be digestible, so it never ends up on the sidewalk.", until: 1.01 },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => t * t * (3 - 2 * t);
const travel = (p: number) => ease(clamp01((p - 0.4) / 0.34));

export default function Swallow() {
  const outer = useRef<HTMLElement>(null);
  const throat = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0);
  const [jaw, setJaw] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: outer, offset: ["start start", "end end"] });

  useMotionValueEvent(p, "change", (v) => {
    setProg(v);
    setActive(Math.max(0, STEPS.findIndex((s) => v < s.until)));
  });

  // chewing: the jaw opens and closes while we are in the chew step and on screen
  const chewing = !reduce && prog > 0.04 && prog < 0.4;
  useEffect(() => {
    if (!chewing) { setJaw(0); return; }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const s = Math.sin(((now - t0) / 1000) * 8.5) * 0.5 + 0.5;
      setJaw(Math.pow(s, 1.6) * 9);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [chewing]);

  const draw = useTransform(p, [0.02, 0.16], [0, 1]);
  const trail = useTransform(p, travel);
  const trailOpacity = useTransform(p, [0.4, 0.45, 0.8, 0.9], [0, 1, 1, 0]);
  const glow = useTransform(p, [0.72, 0.8, 1], [0, 0.85, 0.35]);
  const scale = useTransform(p, [0, 0.06], [0.9, 1]);
  const radius = useTransform(p, [0, 0.06], [36, 0]);

  // where the wad is
  const u = reduce ? 0 : travel(prog);
  let wad = { x: 452, y: 414 + jaw * 0.45 };
  if (u > 0 && throat.current) {
    const pt = throat.current.getPointAtLength(u * throat.current.getTotalLength());
    wad = { x: pt.x, y: pt.y };
  }
  const fade = clamp01((prog - 0.76) / 0.14);
  const squeeze = u > 0.15 && u < 0.98 ? 0.18 : 0; // narrower while it is in the throat
  const nod = reduce ? 0 : Math.sin(clamp01(u / 0.4) * Math.PI) * -3; // degrees, a small gulp nod

  const head = smoothPath(HEAD.map(([x, y], i) => [x - jaw * 0.3 * JAW_WEIGHT(i), y + jaw * JAW_WEIGHT(i)] as Pt));
  const neck = smoothPath(
    NECK_FRONT.map(([x, y], i) => {
      const bulge = u > 0.12 && fade < 1 ? 17 * Math.exp(-Math.pow((y - wad.y) / 30, 2)) : 0;
      return [x + bulge - (i === 0 ? jaw * 0.1 : 0), y + (i === 0 ? jaw * 0.3 : 0)] as Pt;
    })
  );

  const line = { fill: "none", stroke: "url(#lineFade)", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <section ref={outer} id="how" className="relative bg-[#0e1a17]" style={{ height: reduce ? "auto" : "400svh" }} aria-label="How DissolvaGum is designed to work">
      <motion.div
        className={`${reduce ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden bg-[#0e1a17] text-[#e8f3ec] will-change-transform`}
        style={reduce ? undefined : { scale, borderRadius: radius }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(40% 60% at 66% 46%, rgba(143,196,166,0.14) 0%, rgba(143,196,166,0) 100%)" }}
          aria-hidden
        />
        <svg
          viewBox="80 110 520 790"
          className="absolute right-[2vw] top-[4svh] h-[60svh] w-auto md:right-[8vw] md:top-[5svh] md:h-[94svh]"
          role="img"
          aria-label="Line drawing of a person in profile. A piece of gum is chewed, then swallowed down the throat. An illustration of the design goal."
        >
          <defs>
            <linearGradient id="lineFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fc4a6" />
              <stop offset="72%" stopColor="#8fc4a6" />
              <stop offset="100%" stopColor="#8fc4a6" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="wadFill" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#f6fbf7" />
              <stop offset="55%" stopColor="#cfe6d8" />
              <stop offset="100%" stopColor="#8fbea3" />
            </radialGradient>
            <radialGradient id="bellyGlow">
              <stop offset="0%" stopColor="#8fc4a6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#8fc4a6" stopOpacity="0" />
            </radialGradient>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <g transform={`rotate(${nod} 300 520)`}>
            <motion.path d={head} {...line} style={reduce ? undefined : { pathLength: draw }} />
            <motion.path d={EAR} {...line} style={reduce ? undefined : { pathLength: draw }} />
            <motion.path d={EYE} {...line} style={reduce ? undefined : { pathLength: draw }} />
            <path d={neck} {...line} />

            {/* the route, faint, and the glowing trail the wad leaves on it */}
            <path ref={throat} d={THROAT} fill="none" stroke="#8fc4a6" strokeOpacity={0.12} strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" />
            {!reduce && (
              <motion.g style={{ opacity: trailOpacity }}>
                <motion.path d={THROAT} fill="none" stroke="#8fc4a6" strokeWidth={8} strokeLinecap="round" filter="url(#soft)" style={{ pathLength: trail }} />
                <motion.path d={THROAT} fill="none" stroke="#d9f3e3" strokeWidth={2} strokeLinecap="round" style={{ pathLength: trail }} />
              </motion.g>
            )}
            <motion.circle cx={320} cy={850} r={80} fill="url(#bellyGlow)" style={reduce ? undefined : { opacity: glow }} />

            {/* the wad: glossy, lumpy, chewed */}
            <g transform={`translate(${wad.x} ${wad.y}) scale(${1.35 * (1 - 0.3 * u - 0.3 * fade)})`} opacity={1 - fade}>
              <g transform={`scale(${1 - squeeze + jaw * 0.012} ${1 + squeeze * 0.6 - jaw * 0.015})`}>
                <path d="M-17,-3 C-18,-12 -8,-17 1,-15 C10,-16 18,-10 17,-1 C19,8 10,15 0,14 C-9,16 -18,9 -17,-3 Z" fill="url(#wadFill)" />
                <path d="M-7,2 C-2,5 4,4 8,0" fill="none" stroke="#7fae94" strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
                <ellipse cx={-6} cy={-7} rx={5} ry={2.6} fill="#ffffff" opacity={0.85} transform="rotate(-20 -6 -7)" />
              </g>
            </g>
          </g>
        </svg>

        <div className="absolute inset-x-0 bottom-[7svh] px-[clamp(16px,2.8vw,44px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <p className="mb-8 text-sm font-bold text-[#8fa79a]">The solution</p>
          <div className="flex gap-6">
            {!reduce && (
              <div className="relative hidden w-px bg-white/15 md:block" aria-hidden>
                <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-mint" style={{ scaleY: p }} />
              </div>
            )}
            <ol className="flex max-w-[520px] flex-col gap-10">
              {STEPS.map((s, i) => {
                const on = reduce || i === active;
                return (
                  <motion.li
                    key={s.title}
                    className={on ? "block" : "hidden md:block"}
                    animate={{ opacity: on ? 1 : 0.25, x: on ? 0 : -10, filter: on ? "blur(0px)" : "blur(1.5px)" }}
                    transition={{ duration: 0.7, ease: [0.16, 0.84, 0.24, 1] }}
                  >
                    <h3 className="mb-2 text-[clamp(30px,3.6vw,52px)] leading-[1.02] tracking-[-0.035em]">{s.title}</h3>
                    <p className="text-lg leading-[1.5] text-[#b4c9bb]">{s.body}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
        <p className="absolute bottom-6 right-[clamp(16px,2.8vw,44px)] text-sm italic text-[#8fa79a]">Illustration of the design goal.</p>
      </motion.div>
    </section>
  );
}
