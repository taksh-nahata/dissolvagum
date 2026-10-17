"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { fbm, makeRenderer, runWhileVisible, studioEnvironment } from "@/lib/gum3d";

/* Hero object: the DissolvaGum pack, drawn from the real packaging (green over navy-green,
   diagonal split, wordmark, "CHEW SOME GUM / SKIP THE MESS", ring, mountain line art, 15 STICKS).
   On load the pack rises in, the flip-top lid swings open and one stick slides up out of the row,
   half out of its paper and foil so the pale, powdered gum shows. Scroll (`progressRef`, 0 to 1)
   turns the pack and lifts the stick further. */

const PACK = { w: 1.5, h: 2.1, d: 0.5, lid: 0.55 };
const LID_FRAC = PACK.lid / PACK.h;
const GREEN = "#235a3b";
const NAVY = "#17262c";
const MINT = "#9fd0b3";
const LINE = "#7fb69a";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function texture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** The front of the pack, as one tall artwork (lid on top, body below). */
function drawFront() {
  const W = 1000, H = 1400;
  const [c, g] = canvas(W, H);
  g.fillStyle = GREEN;
  g.fillRect(0, 0, W, H);
  // the navy-green lower half, cut on a diagonal
  g.fillStyle = NAVY;
  g.beginPath(); g.moveTo(0, H * 0.72); g.lineTo(W, H * 0.55); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  // a little carton grain
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`;
    g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  // ornament line on the lid
  g.strokeStyle = NAVY; g.lineWidth = 4;
  g.beginPath(); g.moveTo(W * 0.22, H * 0.06); g.lineTo(W * 0.78, H * 0.06); g.stroke();
  [0.32, 0.5, 0.68].forEach((x) => { g.beginPath(); g.arc(W * x, H * 0.06, 10, 0, Math.PI * 2); g.stroke(); });
  // wordmark
  g.fillStyle = MINT;
  g.font = '400 124px "Glacial Indifference", system-ui, sans-serif';
  (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "6px";
  g.fillText("DISSOLVAGUM", W / 2, H * 0.165);
  (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
  // small mountain mark
  g.strokeStyle = NAVY; g.lineWidth = 8; g.lineJoin = "round";
  g.beginPath(); g.moveTo(W * 0.36, H * 0.335); g.lineTo(W * 0.46, H * 0.29); g.lineTo(W * 0.52, H * 0.315); g.lineTo(W * 0.57, H * 0.3); g.lineTo(W * 0.66, H * 0.335); g.stroke();
  // tagline
  g.fillStyle = MINT;
  g.font = '700 92px "Glacial Indifference", system-ui, sans-serif';
  g.fillText("CHEW SOME GUM", W / 2, H * 0.405);
  g.fillText("SKIP THE MESS", W / 2, H * 0.475);
  g.strokeStyle = NAVY; g.lineWidth = 5;
  g.beginPath(); g.moveTo(W * 0.24, H * 0.53); g.lineTo(W * 0.43, H * 0.53); g.moveTo(W * 0.57, H * 0.53); g.lineTo(W * 0.76, H * 0.53); g.stroke();
  g.beginPath(); g.ellipse(W / 2, H * 0.53, 22, 12, -0.5, 0, Math.PI * 2); g.stroke();
  g.font = '400 74px "Glacial Indifference", system-ui, sans-serif';
  g.fillText("Spearmint", W / 2, H * 0.585);
  // the ring
  g.lineWidth = 46;
  g.strokeStyle = NAVY;
  g.beginPath(); g.arc(W * 0.24, H * 0.77, W * 0.13, Math.PI * 0.9, Math.PI * 1.95); g.stroke();
  g.strokeStyle = LINE;
  g.beginPath(); g.arc(W * 0.24, H * 0.77, W * 0.13, Math.PI * 1.95, Math.PI * 2.9); g.stroke();
  // mountain line art
  g.strokeStyle = LINE; g.lineWidth = 7;
  g.beginPath();
  [[0.36, 0.98], [0.46, 0.87], [0.52, 0.885], [0.6, 0.73], [0.67, 0.71], [0.75, 0.81], [0.81, 0.79], [0.94, 0.96]].forEach(([x, y], i) =>
    i ? g.lineTo(W * x, H * y) : g.moveTo(W * x, H * y)
  );
  g.stroke();
  g.beginPath(); g.moveTo(W * 0.63, H * 0.75); g.lineTo(W * 0.6, H * 0.84); g.lineTo(W * 0.64, H * 0.9); g.stroke();
  g.beginPath(); g.moveTo(W * 0.72, H * 0.78); g.lineTo(W * 0.74, H * 0.86); g.stroke();
  g.fillStyle = MINT;
  g.textAlign = "left";
  g.font = '700 58px "Glacial Indifference", system-ui, sans-serif';
  g.fillText("15 STICKS", W * 0.07, H * 0.95);
  return c;
}

/** Split one tall artwork into the lid part and the body part. */
function split(src: HTMLCanvasElement) {
  const cut = Math.round(src.height * LID_FRAC);
  const [lid, lg] = canvas(src.width, cut);
  lg.drawImage(src, 0, 0, src.width, cut, 0, 0, src.width, cut);
  const [body, bg] = canvas(src.width, src.height - cut);
  bg.drawImage(src, 0, cut, src.width, src.height - cut, 0, 0, src.width, src.height - cut);
  return { lid: texture(lid), body: texture(body) };
}

function drawSide() {
  const W = 300, H = 1400;
  const [c, g] = canvas(W, H);
  g.fillStyle = GREEN;
  g.fillRect(0, 0, W, H);
  g.fillStyle = NAVY;
  g.beginPath(); g.moveTo(0, H * 0.55); g.lineTo(W, H * 0.6); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  return c;
}

/** Inside of the lid: printed, like real packs. */
function innerLidTexture() {
  const [c, g] = canvas(600, 220);
  g.fillStyle = "#e6eee5";
  g.fillRect(0, 0, 600, 220);
  g.fillStyle = GREEN;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = '400 66px "Glacial Indifference", system-ui, sans-serif';
  g.fillText("DISSOLVAGUM", 300, 92);
  g.font = '700 26px "Glacial Indifference", system-ui, sans-serif';
  g.fillText("DESIGNED TO BE SWALLOWED", 300, 158);
  return texture(c);
}

/** Stick wrapper: pale paper with a green band near the top. */
function wrapperTexture() {
  const [c, g] = canvas(128, 640);
  g.fillStyle = "#edf3ec";
  g.fillRect(0, 0, 128, 640);
  g.fillStyle = GREEN;
  g.fillRect(0, 70, 128, 80);
  g.fillStyle = MINT;
  g.fillRect(0, 158, 128, 6);
  return texture(c);
}

/** Powder and faint scoring on the gum itself, used as a bump map. */
function gumBump() {
  const [c, g] = canvas(128, 640);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 128, 640);
  for (let i = 0; i < 9000; i++) {
    const v = 100 + Math.random() * 70;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 128, Math.random() * 640, 1.5, 1.5);
  }
  g.strokeStyle = "rgba(60,60,60,0.5)";
  g.lineWidth = 2;
  for (let y = 40; y < 640; y += 60) { g.beginPath(); g.moveTo(10, y); g.lineTo(118, y + 18); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  return t;
}

function crinkle(geo: THREE.BufferGeometry, amount: number, freq: number) {
  const pa = geo.attributes.position as THREE.BufferAttribute;
  const na = geo.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
    const k = fbm(x * freq, y * freq, z * freq, 3) * amount;
    pa.setXYZ(i, x + na.getX(i) * k, y + na.getY(i) * k, z + na.getZ(i) * k);
  }
  geo.computeVertexNormals();
  return geo;
}

export default function GumScene({
  progressRef,
  still = false,
  label,
}: {
  progressRef: MutableRefObject<number>;
  still?: boolean;
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = makeRenderer(host);
    } catch {
      return; // the street still reads fine without the 3D layer
    }

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0, 9);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 6);
    const rim = new THREE.DirectionalLight(0xbfe3cf, 1.6);
    rim.position.set(-5, 3, -5);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.25));

    const disposables: { dispose: () => void }[] = [];
    const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

    // --- materials ---
    const front = split(drawFront());
    keep(front.lid); keep(front.body);
    const side = split(drawSide());
    keep(side.lid); keep(side.body);
    const card = (map?: THREE.Texture, color?: string) =>
      keep(new THREE.MeshPhysicalMaterial({ map, color: map ? undefined : color, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, envMapIntensity: 0.6 }));
    const inner = keep(new THREE.MeshStandardMaterial({ map: keep(innerLidTexture()), roughness: 0.85 }));
    const dark = keep(new THREE.MeshStandardMaterial({ color: "#0c1411", roughness: 1 }));
    const greenCard = card(undefined, GREEN);
    const navyCard = card(undefined, NAVY);

    const pack = new THREE.Group();

    // body: [right, left, top (open: dark interior), bottom, front, back]
    const bodyH = PACK.h - PACK.lid;
    const body = new THREE.Mesh(
      keep(new RoundedBoxGeometry(PACK.w, bodyH, PACK.d, 3, 0.02)),
      [card(side.body), card(side.body), dark, navyCard, card(front.body), navyCard]
    );
    body.position.y = -PACK.h / 2 + bodyH / 2;
    pack.add(body);
    const bodyTop = -PACK.h / 2 + bodyH;

    // lid, hinged at the back of the body's top edge
    const hinge = new THREE.Group();
    hinge.position.set(0, bodyTop, -PACK.d / 2);
    const lid = new THREE.Mesh(
      keep(new RoundedBoxGeometry(PACK.w, PACK.lid, PACK.d, 3, 0.02)),
      [card(side.lid), card(side.lid), greenCard, inner, card(front.lid), greenCard]
    );
    lid.position.set(0, PACK.lid / 2, PACK.d / 2);
    hinge.add(lid);
    pack.add(hinge);

    // a row of wrapped sticks inside, tops showing, each capped with folded foil
    const wrapTex = keep(wrapperTexture());
    const paper = keep(new THREE.MeshPhysicalMaterial({ map: wrapTex, roughness: 0.75, envMapIntensity: 0.4 }));
    const foil = keep(new THREE.MeshPhysicalMaterial({ color: "#cfd4d7", metalness: 1, roughness: 0.38, envMapIntensity: 0.9 }));
    const SW = 0.25, SL = 1.35, ST = 0.05;
    const stickGeo = keep(new RoundedBoxGeometry(SW, SL, ST, 2, 0.012));
    const capGeo = keep(crinkle(new THREE.BoxGeometry(SW + 0.008, 0.08, ST + 0.008, 10, 4, 2), 0.0025, 18));
    const rowTop = [0.14, 0.2, 0, 0.17, 0.11];
    rowTop.forEach((up, i) => {
      if (i === 2) return; // the middle one is the stick being pulled out
      const g = new THREE.Group();
      g.position.set(-0.5 + i * SW, bodyTop - SL / 2 + up, 0.06);
      g.add(new THREE.Mesh(stickGeo, paper));
      const cap = new THREE.Mesh(capGeo, foil);
      cap.position.y = SL / 2 - 0.03;
      g.add(cap);
      pack.add(g);
    });

    // the stick being pulled out: bare gum on top, still in its paper and torn foil below
    const pulled = new THREE.Group();
    const gumBumpTex = keep(gumBump());
    const gum = new THREE.Mesh(
      keep(new RoundedBoxGeometry(0.225, 1.3, 0.032, 3, 0.01)),
      keep(new THREE.MeshPhysicalMaterial({
        color: "#bcd6c0",
        roughness: 0.82,
        sheen: 0.6,
        sheenColor: new THREE.Color("#f4fbf4"),
        sheenRoughness: 0.7,
        bumpMap: gumBumpTex,
        bumpScale: 2,
        envMapIntensity: 0.3,
      }))
    );
    pulled.add(gum);
    const sleeve = new THREE.Mesh(keep(new RoundedBoxGeometry(SW, 0.62, ST, 2, 0.012)), paper);
    sleeve.position.y = -1.3 / 2 + 0.31 - 0.02;
    pulled.add(sleeve);
    const torn = new THREE.Mesh(keep(crinkle(new THREE.BoxGeometry(SW + 0.01, 0.12, ST + 0.012, 16, 8, 2), 0.006, 14)), foil);
    torn.position.y = sleeve.position.y + 0.31 + 0.05;
    pulled.add(torn);
    const pulledBaseY = bodyTop - SL / 2 + 0.05;
    pulled.position.set(0, pulledBaseY, 0.06);
    pack.add(pulled);

    scene.add(pack);

    // the artwork uses the page font: redraw once it has loaded
    document.fonts?.ready.then(() => {
      const f = split(drawFront());
      (body.material as THREE.MeshPhysicalMaterial[])[4].map = f.body;
      (lid.material as THREE.MeshPhysicalMaterial[])[4].map = f.lid;
      (body.material as THREE.MeshPhysicalMaterial[])[4].needsUpdate = true;
      (lid.material as THREE.MeshPhysicalMaterial[])[4].needsUpdate = true;
      front.body.dispose(); front.lid.dispose();
      inner.map?.dispose();
      inner.map = keep(innerLidTexture());
      inner.needsUpdate = true;
      keep(f.body); keep(f.lid);
    });

    let px = 0, py = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    let wide = true, asp = 1.6;
    const resize = () => {
      const cw = host.clientWidth || 300, ch = host.clientHeight || 300;
      renderer.setSize(cw, ch, false);
      camera.aspect = asp = cw / ch;
      wide = asp >= 1;
      camera.updateProjectionMatrix();
    };

    const draw = (time: number) => {
      const p = still ? 0 : progressRef.current;
      const T = still ? 10 : time;
      const rise = easeOut(clamp01(T / 1.3));
      const open = easeOutBack(clamp01((T - 0.9) / 0.9));
      const lift = easeOut(clamp01((T - 1.6) / 1.2));

      const sc = wide ? 0.92 : Math.min(0.7, Math.max(0.5, asp * 1.15));
      pack.scale.setScalar(sc);
      pack.position.set(wide ? 1.9 : 0, (wide ? -0.35 : 1.5) - (1 - rise) * 4 + Math.sin(T * 0.9) * 0.04, 0);
      cx += (px - cx) * 0.05;
      cy += (py - cy) * 0.05;
      pack.rotation.set(
        0.1 + cy * 0.25 + p * 0.15,
        -0.55 + (1 - rise) * 1.4 + p * 1.0 + cx * 0.5,
        -0.06 + Math.sin(T * 0.6) * 0.02
      );
      hinge.rotation.x = -1.95 * open;
      pulled.position.y = pulledBaseY + lift * 0.95 + p * 0.45;
      pulled.rotation.set(-p * 0.25, 0, lift * 0.07);
      renderer.render(scene, camera);
    };

    resize();
    const ro = new ResizeObserver(() => { resize(); if (still) draw(0); });
    ro.observe(host);
    const stop = still ? (draw(0), () => {}) : runWhileVisible(host, draw);

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      disposables.forEach((d) => d.dispose());
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef, still]);

  return <div ref={hostRef} className="absolute inset-0" role="img" aria-label={label} />;
}
