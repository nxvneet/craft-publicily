"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
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

// Clean, intentional geometric solids — no melting. Voxel = a precise 3D object.
function geom(kind: Geometry): THREE.BufferGeometry {
  switch (kind) {
    case "crystal":
      return new THREE.OctahedronGeometry(1.6, 0); // cut diamond
    case "torus":
      return new THREE.TorusKnotGeometry(1.0, 0.32, 240, 32);
    case "monolith":
      return new THREE.BoxGeometry(1.55, 1.55, 1.55); // the voxel — a cube
    case "wave":
      return new THREE.DodecahedronGeometry(1.5, 0); // faceted gem
    case "orb":
    default:
      return new THREE.IcosahedronGeometry(1.55, 1); // faceted geo-sphere
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
    // elegant steady spin on a tilted axis — clean, intentional
    mesh.current.rotation.y += delta * speed * 0.22;
    mesh.current.rotation.x = 0.45 + Math.sin(t * 0.25) * 0.08 + p * 0.5;
    const s = 0.92 + p * 0.12;
    mesh.current.scale.setScalar(s);
  });

  return (
    <Float speed={speed * 0.7} rotationIntensity={0.15} floatIntensity={config.motion === "kinetic" ? 0.7 : 0.4}>
      <mesh ref={mesh} geometry={geometry}>
        <meshStandardMaterial
          color={config.palette.a}
          roughness={0.08 + config.rough * 0.14}
          metalness={0.86 + config.metal * 0.14}
          envMapIntensity={2}
          flatShading
        />
      </mesh>
    </Float>
  );
}

// A single thin metallic orbit ring — quiet scale reference, not clutter.
function OrbitRing({ config }: { config: SceneConfig }) {
  const ref = useRef<THREE.Group>(null);
  const speed = config.motion === "kinetic" ? 0.18 : config.motion === "orbit" ? 0.1 : 0.05;
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <group ref={ref} rotation={[1.35, 0.2, 0]}>
      <mesh>
        <torusGeometry args={[3.1, 0.01, 12, 220]} />
        <meshStandardMaterial color={config.palette.a} metalness={1} roughness={0.18} envMapIntensity={2} />
      </mesh>
      <mesh rotation={[0, 0, 0.5]}>
        <torusGeometry args={[3.7, 0.006, 10, 220]} />
        <meshStandardMaterial color={config.palette.a} metalness={1} roughness={0.25} envMapIntensity={1.6} />
      </mesh>
    </group>
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
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color={config.palette.b} />

      <CentralForm config={config} progressRef={pr} autoplay={autoplay} />
      <OrbitRing config={config} />
      <Sparkles count={Math.round(14 + config.density * 22)} scale={[16, 11, 16]} size={1.4} speed={config.motion === "kinetic" ? 0.4 : 0.18} opacity={0.35} color={config.palette.a} />

      {/* crisp specular streaks for a clean liquid-chrome read */}
      <Environment resolution={128}>
        <Lightformer intensity={4} form="rect" position={[0, 5, -5]} scale={[9, 0.5, 1]} color="#ffffff" />
        <Lightformer intensity={3} form="rect" position={[-5, 0, 3]} scale={[0.5, 7, 1]} color="#ffffff" />
        <Lightformer intensity={1.6} form="circle" position={[5, 3, 2]} scale={[3, 3, 1]} color={config.palette.a} />
        <Lightformer intensity={1.3} form="rect" position={[3, -4, 3]} scale={[6, 2, 1]} color={config.palette.b} />
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
