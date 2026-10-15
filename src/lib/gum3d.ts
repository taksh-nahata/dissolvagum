import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* Shared helpers for the 3D gum scenes: smooth noise, procedural textures, lighting. */

// --- value noise (deterministic, smooth) ---
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fade = (t: number) => t * t * (3 - 2 * t);

export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf
  ) * 2 - 1; // -1..1
}

export function fbm(x: number, y: number, z: number, octaves = 4) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * noise3(x * f, y * f, z * f);
    f *= 2.03;
    a *= 0.5;
  }
  return v;
}

// --- procedural canvas textures ---
function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

/** Fine grain for powdered gum and bump detail: light grey with soft specks. */
export function grainTexture(size = 512) {
  const [c, g] = canvas(size);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size * 0.35; i++) {
    const v = 90 + Math.random() * 80;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Dirt for aged gum: white base (no change) with dark grit, used as a multiply. */
export function gritTexture(size = 512) {
  const [c, g] = canvas(size);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 10 + Math.random() * 60;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(40,34,28,0.45)");
    grad.addColorStop(1, "rgba(40,34,28,0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < size * size * 0.08; i++) {
    const dark = Math.random();
    g.fillStyle = dark > 0.3 ? `rgba(20,18,16,${0.4 + Math.random() * 0.6})` : `rgba(120,100,80,${0.5 + Math.random() * 0.5})`;
    const s = Math.random() > 0.92 ? 2.6 : 1.2;
    g.fillRect(Math.random() * size, Math.random() * size, s, s);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Sidewalk concrete: warm grey, blotches and grit (tiles without visible seams). */
export function concreteTexture(size = 1024) {
  const [c, g] = canvas(size);
  g.fillStyle = "#c4c1ba";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 40 + Math.random() * 200;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() > 0.5;
    grad.addColorStop(0, light ? "rgba(255,255,250,0.10)" : "rgba(70,66,60,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < size * size * 0.06; i++) {
    const dark = Math.random() > 0.45;
    g.fillStyle = dark ? `rgba(60,56,50,${0.08 + Math.random() * 0.2})` : `rgba(255,255,250,${0.1 + Math.random() * 0.25})`;
    const s = Math.random() > 0.9 ? 2.2 : 1.2;
    g.fillRect(Math.random() * size, Math.random() * size, s, s);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Soft studio reflections so glossy and metallic surfaces read as real. */
export function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
}

export function makeRenderer(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  host.appendChild(renderer.domElement);
  return renderer;
}

/** Runs `draw(seconds)` every frame while `host` is on screen. Returns a stop function. */
export function runWhileVisible(host: HTMLElement, draw: (t: number) => void) {
  let raf = 0, on = true;
  const t0 = performance.now();
  const loop = (now: number) => {
    if (on) draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver((en) => { on = en[0].isIntersecting; });
  io.observe(host);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); io.disconnect(); };
}
