"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

// ShaderMaterial colors are written raw, so keep three from converting them.
THREE.ColorManagement.enabled = false;

/* Full-bleed hero scene: one gum stick above the sidewalk.
   `progressRef` (0 to 1) scrubs the story: the stick chews, then dissolves into particles.
   This is an illustration of the design goal, not a result. */

const VERT = `
uniform float uTime; uniform float uChew;
varying vec3 vP; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 p = position;
  p.y += sin(p.x*1.6 + uTime*4.0) * 0.07 * uChew;
  p.z += cos(p.x*1.3 + uTime*3.0) * 0.05 * uChew;
  vP = position; vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
uniform float uDis; uniform vec3 uBase; uniform vec3 uInner; uniform vec3 uEdge; uniform vec3 uLight;
varying vec3 vP; varying vec3 vN; varying vec3 vV;
float h(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i), h(i+vec3(1.0,0.0,0.0)), f.x), mix(h(i+vec3(0.0,1.0,0.0)), h(i+vec3(1.0,1.0,0.0)), f.x), f.y),
             mix(mix(h(i+vec3(0.0,0.0,1.0)), h(i+vec3(1.0,0.0,1.0)), f.x), mix(h(i+vec3(0.0,1.0,1.0)), h(i+vec3(1.0,1.0,1.0)), f.x), f.y), f.z); }
void main(){
  float nn = n(vP*2.2)*0.65 + n(vP*5.0)*0.35;
  float t = nn*0.7 + (vP.x/3.6 + 0.5)*0.3;
  float thr = uDis*1.08 - 0.04;
  if (t < thr) discard;
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  float dd = dot(N, normalize(uLight))*0.5 + 0.5;
  float rim = pow(1.0 - max(dot(N, normalize(vV)), 0.0), 2.5);
  vec3 col = gl_FrontFacing ? mix(vec3(0.03, 0.12, 0.07), uBase, smoothstep(0.15, 0.95, dd)) : uInner;
  vec3 Rv = reflect(-normalize(uLight), N);
  float sp = pow(max(dot(Rv, normalize(vV)), 0.0), 26.0);
  col = col + uEdge*rim*0.3 + uEdge*sp*0.5;
  float e = 1.0 - smoothstep(thr, thr + 0.07, t);
  col = mix(col, uEdge, e);
  gl_FragColor = vec4(col, 1.0);
}`;

const PVERT = `
attribute float aA; attribute float aS; uniform float uPR; varying float vA;
void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aS * uPR * (260.0 / -mv.z); gl_Position = projectionMatrix * mv; }`;
const PFRAG = `
uniform vec3 uC; varying float vA;
void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
  gl_FragColor = vec4(uC, vA * smoothstep(0.5, 0.15, d)); }`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function GumScene({
  progressRef,
  still = false,
  variant = "hero",
  label,
}: {
  progressRef: MutableRefObject<number>;
  still?: boolean;
  /** hero: forest-green stick that chews and spins on the sidewalk.
      stage: spearmint stick on dark that chews, drops (swallow), then dissolves. */
  variant?: "hero" | "stage";
  label: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // the gradient hero still reads fine without the 3D layer
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 0, 9);

    // The stick: a rounded slab, like one of the sticks in a pack.
    const w = 3.4, hgt = 1.15, r = 0.3;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -hgt / 2);
    shape.lineTo(w / 2 - r, -hgt / 2);
    shape.quadraticCurveTo(w / 2, -hgt / 2, w / 2, -hgt / 2 + r);
    shape.lineTo(w / 2, hgt / 2 - r);
    shape.quadraticCurveTo(w / 2, hgt / 2, w / 2 - r, hgt / 2);
    shape.lineTo(-w / 2 + r, hgt / 2);
    shape.quadraticCurveTo(-w / 2, hgt / 2, -w / 2, hgt / 2 - r);
    shape.lineTo(-w / 2, -hgt / 2 + r);
    shape.quadraticCurveTo(-w / 2, -hgt / 2, -w / 2 + r, -hgt / 2);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.09, bevelSegments: 6, curveSegments: 14,
    });
    geo.center();

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uChew: { value: 0 }, uDis: { value: 0 },
        uBase: { value: new THREE.Color(variant === "hero" ? "#2f7a4f" : "#8fc4a6") },
        uInner: { value: new THREE.Color("#0e1a17") },
        uEdge: { value: new THREE.Color("#d9f3e3") },
        uLight: { value: new THREE.Vector3(0.5, 0.8, 0.7) },
      },
    });
    const stick = new THREE.Group();
    stick.add(new THREE.Mesh(geo, mat));
    scene.add(stick);

    // Particles released as the stick dissolves.
    const N = 220;
    const pos = new Float32Array(N * 3), alpha = new Float32Array(N), size = new Float32Array(N);
    const seed = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * w * 0.95, y: (Math.random() - 0.5) * hgt * 0.8, z: (Math.random() - 0.5) * 0.3,
      t0: Math.random() * 0.85, vx: (Math.random() - 0.3) * 1.2, vy: 0.5 + Math.random() * 1.6, vz: (Math.random() - 0.5) * 1.2,
      s: 0.05 + Math.random() * 0.11,
    }));
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pgeo.setAttribute("aA", new THREE.BufferAttribute(alpha, 1));
    pgeo.setAttribute("aS", new THREE.BufferAttribute(size, 1));
    const pmat = new THREE.ShaderMaterial({
      vertexShader: PVERT, fragmentShader: PFRAG, transparent: true, depthWrite: false,
      uniforms: { uC: { value: new THREE.Color(variant === "hero" ? "#2f7a4f" : "#bfe3cf") }, uPR: { value: renderer.getPixelRatio() } },
    });
    const points = new THREE.Points(pgeo, pmat);
    points.frustumCulled = false;
    stick.add(points);

    let px = 0, py = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    let wide = true;
    let asp = 1.6;
    const resize = () => {
      const cw = host.clientWidth || 300, ch = host.clientHeight || 300;
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      asp = cw / ch;
      wide = asp >= 1;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const draw = (time: number) => {
      const p = still ? (variant === "hero" ? 0 : 0.2) : progressRef.current;
      const hero = variant === "hero";
      // stage: chew 0-0.33, swallow (drop and shrink) 0.33-0.6, dissolve 0.6-0.92
      const dis = hero ? 0 : smooth(0.6, 0.92, p);
      const sw = hero ? 0 : smooth(0.33, 0.6, p);
      const chewing = hero ? 1 : 1 - smooth(0.28, 0.36, p);
      const beat = Math.sin(time * 6.0);
      // entrance: the stick drops in when the scene first loads
      const enter = still ? 1 : 1 - Math.pow(1 - clamp01(time / 1.3), 3);

      // Wide screens: stick on the right, text on the left. Narrow: stick on top, text below.
      const tx = wide ? (hero ? 1.9 : 1.7) : 0;
      const ty = (wide ? (hero ? 0.1 : 0.2) : hero ? 1.55 : 1.3) - sw * 1.4 + (1 - enter) * 3;
      const sc = (wide ? 0.88 : Math.min(0.72, Math.max(0.3, asp * 0.95))) * (1 - 0.45 * sw) * (0.6 + 0.4 * enter);
      stick.position.set(tx, ty, 0);
      cx += (px - cx) * 0.05;
      cy += (py - cy) * 0.05;
      stick.scale.set(
        sc * (1 + 0.05 * beat * chewing + 0.16 * dis),
        sc * (1 - 0.07 * beat * chewing - 0.12 * dis),
        sc
      );
      stick.rotation.set(
        -0.35 + cy * 0.5 + p * 0.6 + sw * 1.1,
        time * 0.28 + p * Math.PI * (hero ? 1.2 : 1.6) + cx * 1.0 + (1 - enter) * 2,
        -0.2 + Math.sin(time * 0.7) * 0.05
      );
      mat.uniforms.uTime.value = time;
      mat.uniforms.uChew.value = 0.5 + 0.5 * Math.sin(time * 2.0) * chewing + dis;
      mat.uniforms.uDis.value = dis;

      for (let k = 0; k < N; k++) {
        const s = seed[k], age = dis - s.t0;
        if (age > 0 && dis < 0.999) {
          const a = age * 3.2;
          pos[k * 3] = s.x + s.vx * a; pos[k * 3 + 1] = s.y + s.vy * a; pos[k * 3 + 2] = s.z + s.vz * a;
          alpha[k] = Math.sin(clamp01(age / 0.55) * Math.PI) * 0.9;
          size[k] = s.s * (1 - clamp01(age / 0.7) * 0.6);
        } else {
          alpha[k] = 0; size[k] = 0; pos[k * 3] = 0; pos[k * 3 + 1] = 0; pos[k * 3 + 2] = 0;
        }
      }
      pgeo.attributes.position.needsUpdate = true;
      pgeo.attributes.aA.needsUpdate = true;
      pgeo.attributes.aS.needsUpdate = true;

      frame++;
      renderer.render(scene, camera);
    };

    resize();
    const ro = new ResizeObserver(() => { resize(); if (still) draw(1.2); });
    ro.observe(host);

    let raf = 0;
    let running = true;
    let io: IntersectionObserver | undefined;
    if (still) {
      draw(1.2);
    } else {
      const t0 = performance.now();
      const loop = (now: number) => {
        if (running) draw((now - t0) / 1000);
        raf = requestAnimationFrame(loop);
      };
      io = new IntersectionObserver((en) => { running = en[0].isIntersecting; });
      io.observe(host);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose(); mat.dispose(); pgeo.dispose(); pmat.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef, still, variant]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0"
      role="img"
      aria-label={label}
    />
  );
}
