"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { SceneConfig, Geometry } from "@/lib/scenes";

// Pause rendering when the canvas is scrolled off-screen.
function VisibilityControl() {
  const gl = useThree((s) => s.gl);
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const el = gl.domElement;
    const io = new IntersectionObserver(([e]) => setFrameloop(e.isIntersecting ? "always" : "never"), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, [gl, setFrameloop]);
  return null;
}

function geom(kind: Geometry): THREE.BufferGeometry {
  switch (kind) {
    case "crystal":
      return new THREE.OctahedronGeometry(1.5, 0);
    case "torus":
      return new THREE.TorusKnotGeometry(1.1, 0.34, 220, 32);
    case "monolith":
      return new THREE.BoxGeometry(1.1, 2.6, 1.1, 4, 8, 4);
    case "wave":
      return new THREE.IcosahedronGeometry(1.7, 12);
    case "orb":
    default:
      return new THREE.IcosahedronGeometry(1.6, 14);
  }
}

function CentralForm({ config, progressRef, autoplay }: { config: SceneConfig; progressRef: RefObject<number>; autoplay: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => geom(config.geometry), [config.geometry]);
  const speed = config.motion === "kinetic" ? 1.8 : config.motion === "orbit" ? 0.9 : 0.4;

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const p = autoplay ? Math.sin(t * 0.14) * 0.22 + 0.28 : progressRef.current ?? 0;
    mesh.current.rotation.y += delta * speed * 0.25;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.15 + p * 0.6;
    const s = 0.82 + p * 0.18 + Math.sin(t * 1.2) * 0.012;
    mesh.current.scale.setScalar(s);
  });

  return (
    <Float speed={speed} rotationIntensity={config.motion === "calm" ? 0.2 : 0.6} floatIntensity={config.motion === "kinetic" ? 0.9 : 0.5}>
      <mesh ref={mesh} geometry={geometry} castShadow>
        <MeshDistortMaterial
          color={config.palette.a}
          emissive={config.palette.b}
          emissiveIntensity={0.06}
          roughness={config.rough}
          metalness={config.metal}
          distort={config.distort}
          speed={speed}
          flatShading={config.geometry === "crystal" || config.geometry === "monolith"}
        />
      </mesh>
    </Float>
  );
}

function Shards({ config }: { config: SceneConfig }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = Math.round(14 + config.density * 26);
  const data = useMemo(() => {
    const arr: { r: number; a: number; y: number; s: number; o: number }[] = [];
    for (let i = 0; i < count; i++) arr.push({ r: 3 + (i % 5) * 0.8, a: (i / count) * Math.PI * 2, y: Math.sin(i * 1.7) * 3, s: 0.06 + (i % 4) * 0.05, o: Math.sin(i) * 0.8 });
    return arr;
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const speed = config.motion === "kinetic" ? 0.4 : 0.15;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((d, i) => {
      const a = d.a + t * speed + d.o;
      dummy.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + i) * 0.3, Math.sin(a) * d.r);
      dummy.rotation.set(t * 0.5 + i, t * 0.3, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={config.palette.a} emissive={config.palette.a} emissiveIntensity={0.4} metalness={0.6} roughness={0.2} />
    </instancedMesh>
  );
}

function Rig({ progressRef, autoplay, interactive, composeLeft }: { progressRef: RefObject<number>; autoplay: boolean; interactive: boolean; composeLeft: boolean }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const lookX = composeLeft ? -2.6 : 0;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = autoplay ? Math.sin(t * 0.14) * 0.22 + 0.28 : progressRef.current ?? 0;
    const mx = interactive ? state.pointer.x : 0;
    const my = interactive ? state.pointer.y : 0;
    mouse.current.x += (mx - mouse.current.x) * 0.05;
    mouse.current.y += (my - mouse.current.y) * 0.05;
    const targetZ = 9.6 - p * 2.6;
    const angle = p * Math.PI * 0.45 + mouse.current.x * 0.35;
    camera.position.x = Math.sin(angle) * targetZ * 0.4;
    camera.position.z = Math.cos(angle) * targetZ;
    camera.position.y = 0.4 + p * 1.0 + mouse.current.y * 0.5;
    camera.lookAt(lookX, p * 0.4, 0);
  });
  return null;
}

export default function Scene({
  config,
  progressRef,
  autoplay = false,
  interactive = true,
  composeLeft = false,
  className,
}: {
  config: SceneConfig;
  progressRef?: RefObject<number>;
  autoplay?: boolean;
  interactive?: boolean;
  composeLeft?: boolean;
  className?: string;
}) {
  const fallbackRef = useRef(0);
  const pr = progressRef ?? fallbackRef;

  return (
    <Canvas className={className} dpr={[1, 1.25]} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} camera={{ position: [0, 0.4, 9.6], fov: 42 }}>
      <color attach="background" args={[config.palette.bg]} />
      <fog attach="fog" args={[config.palette.bg, 11, 28]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={0.8} color={config.palette.b} />
      <pointLight position={[-6, -2, -4]} intensity={1.1} color={config.palette.b} />
      <pointLight position={[4, -3, 5]} intensity={0.7} color={config.palette.a} />

      <CentralForm config={config} progressRef={pr} autoplay={autoplay} />
      <Shards config={config} />
      <Sparkles count={Math.round(30 + config.density * 70)} scale={[14, 10, 14]} size={2} speed={config.motion === "kinetic" ? 0.6 : 0.25} opacity={0.5} color={config.palette.a} />

      <Environment resolution={128}>
        <Lightformer intensity={2} form="rect" position={[0, 4, -6]} scale={[10, 4, 1]} color={config.palette.a} />
        <Lightformer intensity={1.4} form="circle" position={[-5, 1, 2]} scale={[4, 4, 1]} color={config.palette.b} />
        <Lightformer intensity={1} form="rect" position={[5, -2, 3]} scale={[6, 3, 1]} color={config.palette.c} />
      </Environment>

      <Rig progressRef={pr} autoplay={autoplay} interactive={interactive} composeLeft={composeLeft} />
      <VisibilityControl />

      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.9} luminanceSmoothing={0.4} mipmapBlur />
        <Vignette eskil={false} offset={0.3} darkness={0.75} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
