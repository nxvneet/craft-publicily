"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PROJECTS, makeCardCanvas, CARD_W, CARD_H, type Project } from "@/lib/gallery";

/* ── tunables (the bits to nudge in DevTools) ───────────────────────── */
const RADIUS = 8; // sphere radius — distance of cards from the camera at center
const FOV = 40; // narrow → gentle curve, little fisheye (phantom-like). Wide = tunnel.
const COLS = 20; // columns wrapped 360° around the equator (small angular step → soft curve)
const ROWS = 7; // latitude rows
const CARD_AR = CARD_W / CARD_H; // card aspect; the cell is derived to match it exactly
const GAP = 0.8; // 0–1, fraction of the grid cell a card fills → the rest is gutter

const DRAG_SPEED = 0.0034; // radians per pixel dragged (pointer fallback)
const WHEEL_SPEED = 0.0019; // radians per pixel of swipe / wheel
const EASE = 0.09; // Lenis-style follow toward the target each frame
const FRICTION = 0.94; // momentum decay after a pointer-drag release
const MAX_TILT = 0.7; // clamp vertical look (radians) so you can't pass the poles

/* sign flips — change a +1 to -1 here if an axis feels reversed */
const SIGN_X = 1; // vertical
const SIGN_Y = 1; // horizontal

/* shared, mutable drag state — read by cards to suppress click-after-drag */
const drag = { moved: false };

interface Cell {
  project: Project;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

/** Derive the grid so cells exactly match the card aspect (no stretch, even gutters). */
function buildGrid() {
  const colStep = (Math.PI * 2) / COLS;
  const colChord = 2 * RADIUS * Math.sin(colStep / 2);
  const rowChord = colChord / CARD_AR; // match cell AR to card AR
  const rowStep = 2 * Math.asin(rowChord / (2 * RADIUS));
  const w = GAP * colChord;
  const h = GAP * rowChord;

  const cells: Cell[] = [];
  const tmp = new THREE.Object3D();
  const latStart = -(rowStep * (ROWS - 1)) / 2;

  for (let r = 0; r < ROWS; r++) {
    const phi = latStart + r * rowStep;
    for (let c = 0; c < COLS; c++) {
      const theta = c * colStep; // aligned grid — columns share one angle
      const x = RADIUS * Math.cos(phi) * Math.sin(theta);
      const y = RADIUS * Math.sin(phi);
      const z = RADIUS * Math.cos(phi) * Math.cos(theta);
      tmp.position.set(x, y, z);
      tmp.lookAt(0, 0, 0); // face the camera at the sphere's center
      cells.push({
        project: PROJECTS[(r * COLS + c) % PROJECTS.length],
        position: new THREE.Vector3(x, y, z),
        quaternion: tmp.quaternion.clone(),
      });
    }
  }
  return { cells, w, h };
}

function Card({
  cell,
  geometry,
  texture,
  onOpen,
}: {
  cell: Cell;
  geometry: THREE.PlaneGeometry;
  texture: THREE.Texture;
  onOpen: (p: Project) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);
  const scale = useRef(1);

  useFrame(() => {
    if (!mesh.current) return;
    const target = hovered.current ? 1.06 : 1;
    scale.current += (target - scale.current) * 0.15;
    mesh.current.scale.setScalar(scale.current);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={cell.position}
      quaternion={cell.quaternion}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        document.body.dataset.hover = "1";
      }}
      onPointerOut={() => {
        hovered.current = false;
        delete document.body.dataset.hover;
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (drag.moved) return; // it was a drag/swipe, not a tap
        onOpen(cell.project);
      }}
    >
      <meshBasicMaterial map={texture} transparent alphaTest={0.04} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Rig({ onOpen }: { onOpen: (p: Project) => void }) {
  const group = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);

  const { cells, w, h } = useMemo(buildGrid, []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);

  // one texture per project, shared across every cell that reuses it
  const textures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>();
    for (const p of PROJECTS) {
      let tex: THREE.CanvasTexture;
      const canvas = makeCardCanvas(p, () => {
        if (tex) tex.needsUpdate = true; // photo loaded → re-upload
      });
      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      map.set(p.slug, tex);
    }
    return map;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      textures.forEach((t) => t.dispose());
    };
  }, [geometry, textures]);

  const rot = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const down = useRef({ x: 0, y: 0 });
  const trackpad = useRef(false);

  useEffect(() => {
    const el = gl.domElement;

    /* ── swipe / wheel: the primary, no-click navigation ── */
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.deltaMode === 1) {
        dx *= 16;
        dy *= 16;
      } else if (e.deltaMode === 2) {
        dx *= window.innerHeight;
        dy *= window.innerHeight;
      }
      // sticky device detection: horizontal component or fine vertical = trackpad
      if (e.deltaX !== 0 || (e.deltaMode === 0 && Math.abs(e.deltaY) < 50)) {
        trackpad.current = true;
      }
      vel.current = { x: 0, y: 0 }; // wheel carries its own inertia
      if (trackpad.current) {
        target.current.y += SIGN_Y * dx * WHEEL_SPEED;
        target.current.x += SIGN_X * dy * WHEEL_SPEED;
      } else {
        target.current.y += SIGN_Y * dy * WHEEL_SPEED; // mouse wheel → horizontal spin
      }
    };

    /* ── pointer drag: secondary fine control (also covers touch) ── */
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      drag.moved = false;
      last.current = { x: e.clientX, y: e.clientY };
      down.current = { x: e.clientX, y: e.clientY };
      vel.current = { x: 0, y: 0 };
      el.setPointerCapture?.(e.pointerId);
      document.body.dataset.grab = "1";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      target.current.y += SIGN_Y * dx * DRAG_SPEED;
      target.current.x += SIGN_X * dy * DRAG_SPEED;
      vel.current = { x: SIGN_X * dy * DRAG_SPEED, y: SIGN_Y * dx * DRAG_SPEED };
      if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6) {
        drag.moved = true;
      }
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      el.releasePointerCapture?.(e.pointerId);
      delete document.body.dataset.grab;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!group.current) return;
    if (!dragging.current && (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4)) {
      target.current.x += vel.current.x;
      target.current.y += vel.current.y;
      vel.current.x *= FRICTION;
      vel.current.y *= FRICTION;
    }
    target.current.x = THREE.MathUtils.clamp(target.current.x, -MAX_TILT, MAX_TILT);
    rot.current.x += (target.current.x - rot.current.x) * EASE;
    rot.current.y += (target.current.y - rot.current.y) * EASE;
    group.current.rotation.x = rot.current.x;
    group.current.rotation.y = rot.current.y;
  });

  return (
    <group ref={group}>
      {cells.map((cell, i) => (
        <Card key={i} cell={cell} geometry={geometry} texture={textures.get(cell.project.slug)!} onOpen={onOpen} />
      ))}
    </group>
  );
}

export default function GalleryScene({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 0.01], fov: FOV, near: 0.01, far: 100 }}
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={1} />
      <Rig onOpen={onOpen} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
