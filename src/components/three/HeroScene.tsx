"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The Lynix mark in depth: the logo's four blocks (Build, Automate, Create and the link between
 * them) as lit, bevelled slabs. The flat blocks "extrude" backwards from the plane the page
 * labels sit on, then hold still except for slow drift and a small pointer-driven tilt.
 * The scene's front plane matches the HTML layout, so the real links stay aligned on top.
 */

// Mark geometry (163 × 156 units, scaled to ~1.6). Percentages match HeroMark's layout.
const W = 1.63;
const H = 1.56;
const SLABS = [
  // `out`: where each slab drifts to as the hero scrolls away (x, y, z in scene units).
  { id: "build", l: 0, t: 0, w: 36.2, h: 100, depth: 0.3, tone: "ivory", phase: 0, out: [-0.42, 0.08, 0.3] },
  { id: "automate", l: 67.5, t: 5.1, w: 31.3, h: 30.8, depth: 0.22, tone: "lime", phase: 1.7, out: [0.38, 0.42, 0.75] },
  { id: "link", l: 39.9, t: 37.2, w: 22.1, h: 25.6, depth: 0.16, tone: "ivory", phase: 3.1, out: [0.02, -0.04, 1.25] },
  { id: "create", l: 63.8, t: 69.2, w: 36.2, h: 30.8, depth: 0.26, tone: "ivory", phase: 4.4, out: [0.34, -0.46, 0.45] },
] as const;

export type SlabId = (typeof SLABS)[number]["id"];

/** A rounded-edge box whose front face sits on z = 0 and extends backwards. */
function slabGeometry(w: number, h: number, d: number) {
  const b = 0.014; // bevel
  const iw = w - b * 2;
  const ih = h - b * 2;
  const shape = new THREE.Shape();
  shape.moveTo(-iw / 2, -ih / 2);
  shape.lineTo(iw / 2, -ih / 2);
  shape.lineTo(iw / 2, ih / 2);
  shape.lineTo(-iw / 2, ih / 2);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - b * 2,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
    curveSegments: 1,
  });
  // Extrusion runs 0 → depth along +z (with bevel from -b); shift so the front face is at z = 0 and the body goes back.
  geo.translate(0, 0, -(d - b));
  geo.computeVertexNormals();
  return geo;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.4;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene]);
  return null;
}

const center = (s: (typeof SLABS)[number]) => [((s.l + s.w / 2) / 100) * W - W / 2, -(((s.t + s.h / 2) / 100) * H - H / 2)] as const;

function Slabs({
  colors,
  hovered,
  scroll,
  onReady,
}: {
  colors: { ivory: string; lime: string };
  hovered: SlabId | null;
  scroll: { current: number };
  onReady: () => void;
}) {
  const spread = useRef(0);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<Record<string, THREE.Mesh | null>>({});
  const pointer = useRef({ x: 0, y: 0 });
  const intro = useRef(0);
  const told = useRef(false);
  const { size } = useThree();

  const geos = useMemo(() => SLABS.map((s) => slabGeometry((s.w / 100) * W, (s.h / 100) * H, s.depth)), []);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const mats = useMemo(() => {
    const ivory = new THREE.MeshPhysicalMaterial({
      color: colors.ivory,
      roughness: 0.42,
      clearcoat: 0.55,
      clearcoatRoughness: 0.28,
      iridescence: 0.5,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 380],
    });
    const lime = new THREE.MeshPhysicalMaterial({
      color: colors.lime,
      roughness: 0.4,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      emissive: new THREE.Color(colors.lime),
      emissiveIntensity: 0.1,
    });
    return { ivory, lime };
  }, [colors.ivory, colors.lime]);
  useEffect(() => () => {
    mats.ivory.dispose();
    mats.lime.dispose();
  }, [mats]);

  // Pointer tilt: mouse / pen only. Touch devices just get the slow idle drift.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.current.x = THREE.MathUtils.clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(dt, 0.05);

    intro.current = Math.min(1, intro.current + d / 1.25);
    const e = 1 - Math.pow(1 - intro.current, 3);

    // Scroll: as the hero leaves the viewport the mark comes apart into its four pieces.
    spread.current = THREE.MathUtils.damp(spread.current, scroll.current, 6, d);
    const p = spread.current;
    const ep = p * p * (3 - 2 * p); // smoothstep

    const small = size.width < 360 ? 0.6 : 1;
    // Idle drift settles after ~8s so nothing keeps moving on its own; pointer tilt still responds.
    const idle = t < 8 ? 1 : Math.max(0, 1 - (t - 8) / 3);
    const ty = -0.2 + ep * 0.75 + pointer.current.x * 0.22 * small + Math.sin(t * 0.35) * 0.06 * idle;
    const tx = 0.1 + ep * 0.22 + pointer.current.y * 0.12 * small + Math.sin(t * 0.27 + 1) * 0.03 * idle;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 3.2, d);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3.2, d);

    SLABS.forEach((s) => {
      const m = meshes.current[s.id];
      if (!m) return;
      // Extrude from nearly flat to full depth, keeping the front face fixed.
      m.scale.z = 0.12 + 0.88 * e;
      const lift = hovered === s.id && ep < 0.05 ? 0.1 : 0;
      const bob = Math.sin(t * 0.6 + s.phase) * 0.012 * idle;
      const [cx, cy] = center(s);
      m.position.x = cx + s.out[0] * ep;
      m.position.y = cy + s.out[1] * ep;
      m.position.z = THREE.MathUtils.damp(m.position.z, lift + bob + s.out[2] * ep, 5, d);
      m.rotation.z = s.out[0] * ep * 0.35;
    });

    if (!told.current) {
      told.current = true;
      onReady();
    }
  });

  return (
    <group ref={group}>
      {SLABS.map((s, i) => {
        const [cx, cy] = center(s);
        return (
          <mesh
            key={s.id}
            ref={(m) => {
              meshes.current[s.id] = m;
            }}
            geometry={geos[i]}
            material={s.tone === "lime" ? mats.lime : mats.ivory}
            position={[cx, cy, 0]}
          />
        );
      })}
    </group>
  );
}

export default function HeroScene({
  colors,
  hovered,
  scroll,
  active,
  coarse,
  onReady,
  onFail,
}: {
  colors: { ivory: string; lime: string };
  hovered: SlabId | null;
  scroll: { current: number };
  active: boolean;
  coarse: boolean;
  onReady: () => void;
  onFail: () => void;
}) {
  // Camera distance such that the visible height at z = 0 equals the (expanded) mark height.
  const fov = 20;
  const visibleH = H * 1.7; // canvas is the mark plus 35% on every side (room for the scroll spread)
  const z = visibleH / (2 * Math.tan((fov * Math.PI) / 360));

  return (
    <Canvas
      flat
      frameloop={active ? "always" : "never"}
      dpr={coarse ? [1, 1.5] : [1, 1.75]}
      camera={{ fov, position: [0, 0, z], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
      aria-hidden
      style={{ pointerEvents: "none" }}
    >
      <Environment />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-3, 3.2, 3.5]} intensity={1.35} />
      <pointLight position={[2.4, -1.6, 1.6]} intensity={3} distance={7} decay={2} color={colors.lime} />
      <Slabs colors={colors} hovered={hovered} scroll={scroll} onReady={onReady} />
    </Canvas>
  );
}
