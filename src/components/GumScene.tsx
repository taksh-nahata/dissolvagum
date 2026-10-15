"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { fbm, grainTexture, makeRenderer, runWhileVisible, studioEnvironment } from "@/lib/gum3d";

/* Hero object: one stick of spearmint gum, half pulled out of its foil and paper sleeve.
   It drops in on load, floats, and turns as you scroll (`progressRef`, 0 to 1). */

function sleeveTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1f5133";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#8fc4a6";
  g.font = '400 118px "Glacial Indifference", system-ui, sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("DISSOLVAGUM", 512, 230);
  g.font = '700 54px "Glacial Indifference", system-ui, sans-serif';
  g.fillText("Spearmint", 512, 360);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
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
      return; // the sidewalk still reads fine without the 3D layer
    }

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0, 9);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 6);
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

    const group = new THREE.Group();
    scene.add(group);
    const grain = grainTexture();

    // The stick: powdered, slightly soft-edged.
    const W = 2.9, H = 0.78;
    const stickGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, 0.07), {
      depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: 8,
    });
    stickGeo.center();
    grain.repeat.set(1.4, 1.4);
    const stickMat = new THREE.MeshPhysicalMaterial({
      color: "#dfece2",
      roughness: 0.78,
      sheen: 0.9,
      sheenColor: new THREE.Color("#ffffff"),
      sheenRoughness: 0.55,
      bumpMap: grain,
      bumpScale: 1.2,
      envMapIntensity: 0.55,
    });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.x = 0.55; // pulled halfway out of the wrapper
    group.add(stick);

    // Foil around the left half: crinkled, with a flared open end.
    const fw = 1.75, fh = 0.86, fd = 0.2;
    const foilGeo = new THREE.BoxGeometry(fw, fh, fd, 90, 40, 8);
    const pa = foilGeo.attributes.position as THREE.BufferAttribute;
    const na = foilGeo.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      const open = Math.max(0, (x - fw * 0.25) / (fw * 0.25)); // 0 inside, up to 1 at the open end
      const crinkle = fbm(x * 6, y * 6, z * 6) * 0.018 + Math.abs(fbm(x * 18, y * 14, z * 9, 2)) * 0.012;
      const flare = open * open * (0.05 + 0.04 * fbm(y * 9, z * 9, 1, 2));
      pa.setXYZ(i, x + na.getX(i) * crinkle, y + na.getY(i) * (crinkle + flare), z + na.getZ(i) * (crinkle + flare));
    }
    foilGeo.computeVertexNormals();
    const foil = new THREE.Mesh(
      foilGeo,
      new THREE.MeshPhysicalMaterial({ color: "#d4d8db", metalness: 1, roughness: 0.3, envMapIntensity: 1.2 })
    );
    foil.position.x = -W / 2 + fw / 2 + 0.55 - 0.85;
    group.add(foil);

    // Printed paper sleeve over the foil.
    const sleeveMat = new THREE.MeshPhysicalMaterial({ map: sleeveTexture(), roughness: 0.7, envMapIntensity: 0.3 });
    const sleeveSide = new THREE.MeshPhysicalMaterial({ color: "#1f5133", roughness: 0.7, envMapIntensity: 0.3 });
    const sleeve = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.9, 0.235),
      [sleeveSide, sleeveSide, sleeveSide, sleeveSide, sleeveMat, sleeveMat]
    );
    sleeve.position.x = foil.position.x - 0.22;
    group.add(sleeve);

    // Fonts load after the first paint: redraw the sleeve once they are ready.
    document.fonts?.ready.then(() => {
      sleeveMat.map?.dispose();
      sleeveMat.map = sleeveTexture();
      sleeveMat.needsUpdate = true;
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
      const enter = still ? 1 : 1 - Math.pow(1 - Math.min(1, time / 1.4), 3);
      const sc = wide ? 0.78 : Math.min(0.62, Math.max(0.32, asp * 0.85));
      group.position.set(wide ? 1.75 : 0, (wide ? 0.1 : 1.6) + Math.sin(time * 1.1) * 0.06 + (1 - enter) * 3.2, 0);
      group.scale.setScalar(sc * (0.7 + 0.3 * enter));
      cx += (px - cx) * 0.05;
      cy += (py - cy) * 0.05;
      group.rotation.set(
        -0.45 + cy * 0.4 + Math.sin(time * 0.6) * 0.05,
        -0.5 + p * Math.PI * 1.1 + cx * 0.8 + (1 - enter) * 1.5,
        0.32 + Math.sin(time * 0.5) * 0.04
      );
      renderer.render(scene, camera);
    };

    resize();
    const ro = new ResizeObserver(() => { resize(); if (still) draw(1.5); });
    ro.observe(host);
    const stop = still ? (draw(1.5), () => {}) : runWhileVisible(host, draw);

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      grain.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef, still]);

  return <div ref={hostRef} className="absolute inset-0" role="img" aria-label={label} />;
}
