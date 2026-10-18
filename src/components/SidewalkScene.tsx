"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { concreteTexture, fbm, gritTexture, makeRenderer, runWhileVisible, studioEnvironment, warmUp } from "@/lib/gum3d";
import { markReady } from "@/lib/ready";
import { TIMELINE } from "@/lib/sidewalkTimeline";

/* A chewed wad of gum is spat onto a sidewalk, lands, and gets stepped on. Then time passes.
   Conventional gum darkens into black gunk and stays; the camera pulls back to a sidewalk full of it.
   `progressRef` (0 to 1) scrubs the whole thing; the timeline is in lib/sidewalkTimeline. */


const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const GUM_SCALE = 0.18; // scene units are about 11 cm (the shoe sole is 2.5 long)
const span = ([a, b]: readonly [number, number], p: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Lumpy chewed wad, and the same vertices squashed flat (a splat), sharing one index. */
function wadGeometry() {
  const base = new THREE.IcosahedronGeometry(1, 22);
  base.deleteAttribute("uv");
  base.deleteAttribute("normal");
  const geo = mergeVertices(base);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const n = pos.count;
  const wad = new Float32Array(n * 3), splat = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const d = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    // wad: a soft, rounded lump with a few gentle folds (chewed gum is smooth, not knobbly)
    const fold = Math.pow(Math.abs(Math.sin(d.x * 3.1 + d.y * 4.3 + fbm(d.x, d.y, d.z, 2) * 2)), 6);
    const r = 0.3 * (1 + 0.15 * fbm(d.x * 1.4, d.y * 1.4, d.z * 1.4, 3) + 0.02 * fbm(d.x * 4, d.y * 4, d.z * 4, 2) - 0.035 * fold);
    wad[i * 3] = d.x * r * 1.12;
    wad[i * 3 + 1] = d.y * r * 0.86 + 0.27;
    wad[i * 3 + 2] = d.z * r;
    // splat: thin irregular disc, slightly domed, flat underneath
    const a = Math.atan2(d.z, d.x);
    const h = Math.sqrt(Math.max(0, 1 - d.y * d.y));
    const R = 0.92 * (1 + 0.24 * fbm(Math.cos(a) * 1.3, Math.sin(a) * 1.3, 3.1) + 0.09 * fbm(Math.cos(a) * 5, Math.sin(a) * 5, 7.7));
    const rr = R * Math.pow(h, 0.5);
    splat[i * 3] = Math.cos(a) * rr;
    splat[i * 3 + 2] = Math.sin(a) * rr;
    splat[i * 3 + 1] = d.y >= 0
      ? 0.012 + 0.06 * Math.pow(1 - h, 0.7) * (1 + 0.4 * fbm(d.x * 4, d.z * 4, 2)) + 0.01 * fbm(d.x * 14, d.z * 14, 4)
      : 0.002;
    uv[i * 2] = d.x * 0.8 + 0.5;
    uv[i * 2 + 1] = d.z * 0.8 + 0.5;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(wad, 3));
  geo.computeVertexNormals();
  const flat = geo.clone();
  flat.setAttribute("position", new THREE.BufferAttribute(splat, 3));
  flat.computeVertexNormals();
  geo.setAttribute("splatPos", new THREE.BufferAttribute(splat, 3));
  geo.setAttribute("splatNormal", flat.attributes.normal.clone());
  geo.setAttribute("gritUv", new THREE.BufferAttribute(uv, 2));
  return { geo, flat };
}

/** Morphs wad -> splat (uSplat) and adds grime (uAge) to a physical material. */
function gumMaterial(color: string, grit: THREE.Texture) {
  const uniforms = {
    uSplat: { value: 0 },
    uAge: { value: 0 },
    uGrit: { value: grit },
  };
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.42,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    sheen: 0.3,
    sheenColor: new THREE.Color("#ffffff"),
    envMapIntensity: 0.9,
  });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 splatPos;\nattribute vec3 splatNormal;\nattribute vec2 gritUv;\nuniform float uSplat;\nvarying vec2 vGritUv;"
      )
      .replace("#include <beginnormal_vertex>", "vec3 objectNormal = normalize(mix(normal, splatNormal, uSplat));")
      .replace("#include <begin_vertex>", "vec3 transformed = mix(position, splatPos, uSplat);\nvGritUv = gritUv;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D uGrit; uniform float uAge; varying vec2 vGritUv;
float dgH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float dgN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(dgH(i), dgH(i+vec2(1,0)), f.x), mix(dgH(i+vec2(0,1)), dgH(i+vec2(1,1)), f.x), f.y); }`
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
diffuseColor.rgb *= mix(vec3(1.0), texture2D(uGrit, vGritUv * 1.6).rgb, uAge);`
      );
  };
  return { mat, uniforms };
}

/** A simple sneaker sole: rounded toe and heel, narrow waist, ribbed tread. */
function soleGeometry() {
  const s = new THREE.Shape();
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = 1.25 * Math.cos(t);
    const w = 0.37 + 0.1 * smooth(clamp01((x + 0.2) / 0.8)) - 0.07 * Math.exp(-Math.pow((x + 0.15) / 0.35, 2));
    const y = w * Math.sin(t);
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function treadTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#2a2a2a";
  for (let y = 0; y < 256; y += 16) g.fillRect(0, y, 256, 7);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

export default function SidewalkScene({
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
      markReady("street3d");
      return;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    scene.background = new THREE.Color("#a7a39b");
    scene.fog = new THREE.Fog("#a7a39b", 4, 11);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 60);

    const sun = new THREE.DirectionalLight(0xfff3e4, 3.2);
    sun.position.set(2.2, 5, 1.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -2.5;
    sun.shadow.camera.right = sun.shadow.camera.top = 2.5;
    sun.shadow.radius = 8;
    sun.shadow.bias = -0.0006;
    scene.add(sun, new THREE.HemisphereLight(0xe9e6df, 0x5d5a54, 0.45));

    // ground
    const concrete = concreteTexture();
    concrete.repeat.set(14, 14);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ map: concrete, color: "#d9d5cd", roughness: 0.94, bumpMap: concrete, bumpScale: 2.6, envMapIntensity: 0.25 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // the gum
    const grit = gritTexture();
    const { geo, flat } = wadGeometry();
    const fresh = new THREE.Color("#f0dade");
    const aged = new THREE.Color("#1c1917");
    const { mat, uniforms } = gumMaterial(`#${fresh.getHexString()}`, grit);
    const gum = new THREE.Mesh(geo, mat);
    gum.scale.setScalar(GUM_SCALE); // real size: a wad about 1.2 cm across, a splat about 3-4 cm
    gum.castShadow = true;
    gum.receiveShadow = true;
    scene.add(gum);

    // the shoe
    const tread = treadTexture();
    const shoe = new THREE.Mesh(
      soleGeometry(),
      // never drawn, only its shadow: at real scale a shoe would fill the frame
      new THREE.MeshStandardMaterial({ color: "#2b2b2e", roughness: 0.82, bumpMap: tread, bumpScale: 3, colorWrite: false, depthWrite: false })
    );
    shoe.castShadow = true;
    shoe.rotation.y = 0.35;
    scene.add(shoe);

    // other old gum on the sidewalk, revealed when the camera pulls back (problem only)
    const SPOTS = 90;
    const spotMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 });
    const spots = new THREE.InstancedMesh(flat, spotMat, Math.max(1, SPOTS));
    spots.receiveShadow = true;
    spots.count = SPOTS;
    const tone = new THREE.Color();
    for (let i = 0; i < SPOTS; i++) spots.setColorAt(i, tone.set("#1d1a18").lerp(new THREE.Color("#6b6560"), Math.random() * 0.7));
    const spotData = Array.from({ length: SPOTS }, () => {
      let x = 0, z = 0;
      do { x = (Math.random() - 0.5) * 11; z = (Math.random() - 0.5) * 9; } while (Math.hypot(x, z) < 0.45);
      return { x, z, s: GUM_SCALE * (0.6 + Math.random() * 0.7), r: Math.random() * Math.PI * 2, t: Math.random() };
    });
    scene.add(spots);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sv = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    let asp = 1.6;
    const resize = () => {
      const cw = host.clientWidth || 300, ch = host.clientHeight || 300;
      renderer.setSize(cw, ch, false);
      camera.aspect = asp = cw / ch;
      camera.updateProjectionMatrix();
    };

    const near = new THREE.Vector3(), far = new THREE.Vector3(), look = new THREE.Vector3();
    const draw = (time: number) => {
      const p = still ? 0.7 : progressRef.current;
      const fall = span(TIMELINE.fall, p);
      const impact = span(TIMELINE.impact, p);
      const step = span(TIMELINE.step, p);
      const age = span(TIMELINE.time, p);
      const back = smooth(span(TIMELINE.pullBack, p));

      // falling: gravity ease-in, tumbling; lands at p = 0.13
      const g = fall * fall;
      gum.position.set(0.05 * (1 - g), 0.5 * (1 - g), -0.03 * (1 - g));
      gum.rotation.set((1 - g) * 4.2, (1 - g) * 2.5, (1 - g) * 1.3);
      // impact squash with a little wobble, then the step presses it flat
      const wobble = impact > 0 && impact < 1 ? Math.sin(impact * Math.PI * 3) * (1 - impact) * 0.18 : 0;
      const landed = fall >= 1 ? 0.5 + wobble : 0;
      const pressed = smooth(clamp01((step - 0.25) / 0.3));
      uniforms.uSplat.value = Math.min(1, landed + (1 - landed) * pressed);

      // shoe: comes down over the gum, presses, lifts away
      const down = step < 0.5 ? smooth(clamp01(step / 0.5)) : 1 - smooth(clamp01((step - 0.62) / 0.38));
      shoe.position.set(0.25, 0.012 + (1 - down) * 3.4, 0.05);
      shoe.visible = step > 0 && step < 1;
      const shake = step > 0.45 && step < 0.6 ? Math.sin(time * 70) * 0.006 : 0;

      // time passing
      mat.color.copy(fresh).lerp(aged, smooth(age));
      uniforms.uAge.value = smooth(clamp01(age * 1.3));
      mat.roughness = 0.42 + 0.53 * age;
      mat.clearcoat = 0.35 * (1 - age);
      mat.sheen = 0.3 * (1 - age);

      for (let i = 0; i < SPOTS; i++) {
        const s = spotData[i];
        const k = smooth(clamp01((back - s.t * 0.6) / 0.25));
        q.setFromAxisAngle(up, s.r);
        m4.compose(v.set(s.x, 0.001, s.z), q, sv.setScalar(s.s * k + 1e-4));
        spots.setMatrixAt(i, m4);
      }
      if (SPOTS) spots.instanceMatrix.needsUpdate = true;

      // camera: close on the gum, pulls back and up at the end
      const narrow = asp < 1 ? 1.5 : 1;
      near.set(0.32 * narrow, 0.5 * narrow, 0.82 * narrow);
      far.set(1.2, 4.2 * narrow, 4.6 * narrow);
      camera.position.lerpVectors(near, far, back);
      camera.position.y += gum.position.y * 0.35 * (1 - back) + shake;
      look.set(0, 0.02 + gum.position.y * 0.7 * (1 - back), 0);
      camera.lookAt(look);
      renderer.render(scene, camera);
    };

    resize();
    // build the shadow map and compile shaders behind the loading screen
    draw(0);
    warmUp(renderer, scene, camera).finally(() => markReady("street3d"));
    const ro = new ResizeObserver(() => { resize(); if (still) draw(0); });
    ro.observe(host);
    const stop = still ? (draw(0), () => {}) : runWhileVisible(host, draw);

    return () => {
      stop();
      ro.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      [concrete, grit, tread].forEach((t) => t.dispose());
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef, still]);

  return <div ref={hostRef} className="absolute inset-0" role="img" aria-label={label} />;
}
