"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, Lightformer, ContactShadows, AdaptiveDpr } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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

function Form() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.35, 6), []);
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.06;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.06;
    mesh.current.rotation.y += delta * 0.12;
    mesh.current.rotation.x = mouse.current.y * 0.3 + Math.sin(t * 0.2) * 0.06;
    mesh.current.position.x = mouse.current.x * 0.5;
    mesh.current.position.y = -mouse.current.y * 0.3 + Math.sin(t * 0.4) * 0.05;
  });

  return (
    <Float speed={1} rotationIntensity={0.25} floatIntensity={0.5}>
      <mesh ref={mesh} geometry={geo}>
        <meshStandardMaterial color="#0b0b10" roughness={0.32} metalness={0.55} envMapIntensity={0.8} />
      </mesh>
    </Float>
  );
}

export default function EditorialGraphic({ className }: { className?: string }) {
  return (
    <Canvas className={className} dpr={[1, 1.25]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} camera={{ position: [0, 0, 6], fov: 38 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#e8e2d4" />
      <Form />
      <ContactShadows position={[0, -1.9, 0]} opacity={0.18} scale={9} blur={2.6} far={4} color="#3a3530" />
      <Environment resolution={128}>
        <Lightformer intensity={1.6} form="rect" position={[0, 4, -5]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1} form="circle" position={[-4, 1, 3]} scale={[4, 4, 1]} color="#fff7e8" />
      </Environment>
      <VisibilityControl />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
