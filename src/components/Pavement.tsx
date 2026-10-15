"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

/* A dark street covered in old gum. As `progressRef` (0 to 1) rises, the gum
   dissolves away from right to left, leaving clean asphalt. */

// gum trodden into asphalt dries pale grey; a few keep a hint of their flavor color
const GUM = ["#8d8a84", "#9a968f", "#7c7974", "#a6a19a", "#9c868b", "#8c988d"];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type Spot = { x: number; y: number; r: number; color: string; t: number; pts: [number, number][] };

export default function Pavement({
  progressRef,
  still = false,
}: {
  progressRef: MutableRefObject<number>;
  still?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let concrete: HTMLCanvasElement | null = null;
    let spots: Spot[] = [];
    let last = -1;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Asphalt: near-black, with pale stone aggregate and faint tar patches.
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      g.fillStyle = "#2a2a29";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 80 + Math.random() * 240;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        const light = Math.random() > 0.55;
        grad.addColorStop(0, light ? "rgba(255,255,245,0.05)" : "rgba(0,0,0,0.16)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      const stones = Math.floor((w * h) / 9);
      for (let i = 0; i < stones; i++) {
        const v = Math.random();
        g.fillStyle = v > 0.55
          ? `rgba(${170 + Math.random() * 60},${165 + Math.random() * 55},${150 + Math.random() * 50},${0.06 + Math.random() * 0.22})`
          : `rgba(0,0,0,${0.15 + Math.random() * 0.35})`;
        const s = Math.random() > 0.93 ? 2.2 : Math.random() > 0.6 ? 1.3 : 0.8;
        g.fillRect(Math.random() * w, Math.random() * h, s, s);
      }
      concrete = c;

      // Gum: flat, irregular blobs, a bit denser on the right and in trails.
      const n = Math.floor((w * h) / 2600);
      spots = [];
      for (let i = 0; i < n; i++) {
        let x = Math.random() * w, y = Math.random() * h;
        if (spots.length && Math.random() < 0.22) {
          const p = spots[Math.floor(Math.random() * spots.length)];
          x = p.x + (Math.random() - 0.5) * 90; y = p.y + (Math.random() - 0.5) * 60;
        }
        if (x < w * 0.55 && Math.random() < 0.6) continue; // keep the headline readable
        const r = 3 + Math.pow(Math.random(), 2) * 11;
        const k = 7 + Math.floor(Math.random() * 3);
        const pts: [number, number][] = Array.from({ length: k }, (_, j) => {
          const a = (j / k) * Math.PI * 2, rr = r * (0.7 + Math.random() * 0.5);
          return [Math.cos(a) * rr, Math.sin(a) * rr * 0.85];
        });
        const sweep = ((w - x) / w) * 0.8 + (y / h) * 0.2;
        spots.push({ x, y, r, pts, color: GUM[Math.floor(Math.random() * GUM.length)], t: sweep * 0.7 + Math.random() * 0.3 });
      }
      last = -1;
    };

    const draw = () => {
      const p = still ? 0 : progressRef.current;
      if (p === last || !concrete) return;
      last = p;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(concrete, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const q = smooth(0.36, 0.9, p) * 1.05;
      for (const s of spots) {
        const c = clamp01((q - s.t * 0.85) / 0.14);
        if (c >= 1) continue;
        const a = 1 - c, k = 1 - 0.35 * c;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(k, k);
        // stain around the gum
        ctx.globalAlpha = 0.35 * a;
        ctx.fillStyle = "#121211";
        ctx.beginPath(); ctx.ellipse(0, 0, s.r * 1.9, s.r * 1.6, 0, 0, Math.PI * 2); ctx.fill();
        // the gum itself
        ctx.globalAlpha = 0.92 * a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        s.pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.closePath(); ctx.fill();
        // trodden-flat highlight
        ctx.globalAlpha = 0.22 * a;
        ctx.fillStyle = "#e9e6df";
        ctx.beginPath(); ctx.ellipse(-s.r * 0.25, -s.r * 0.3, s.r * 0.35, s.r * 0.2, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // dissolve ripple
        if (c > 0) {
          ctx.globalAlpha = (1 - c) * 0.9;
          ctx.strokeStyle = "#8fc4a6";
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 + c * 2.2), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    };

    build();
    draw();
    const ro = new ResizeObserver(() => { build(); draw(); });
    ro.observe(canvas);
    let raf = 0;
    if (!still) {
      const loop = () => { draw(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [progressRef, still]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
