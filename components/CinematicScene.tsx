"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Sparkles, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

// Depth is precomputed ONCE into a small blurred texture (dark = near). The
// vertex shader samples it a single time → cheap, smooth real geometric relief.
const vert = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uTime;
  uniform float uAmp;
  varying vec2 vUv;
  varying float vDepth;
  void main(){
    vUv = uv;
    float depth = texture2D(uDepth, uv).r;     // pre-blurred, dark=near
    vDepth = depth;
    vec3 p = position;
    p.z += depth * uAmp + sin(uTime * 0.3 + uv.x * 4.0) * 0.012;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uProgress;
  varying vec2 vUv;
  varying float vDepth;
  void main(){
    vec2 uv = vUv + uMouse * vDepth * 0.022;     // depth parallax
    uv += vec2(0.0, uProgress * 0.04);
    vec3 c = texture2D(uTex, uv).rgb;
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, 1.14);                    // saturation
    c = (c - 0.5) * 1.07 + 0.5;                   // contrast
    float d = distance(vUv, vec2(0.5));
    c *= smoothstep(1.05, 0.3, d) * 0.42 + 0.58;  // vignette
    float g = fract(sin(dot(vUv * (uTime + 1.0), vec2(12.9898, 78.233))) * 43758.5453);
    c += (g - 0.5) * 0.026;                       // grain
    gl_FragColor = vec4(max(c, 0.0), 1.0);
  }
`;

function buildDepthTexture(img: HTMLImageElement): THREE.DataTexture {
  const W = 200;
  const H = Math.max(1, Math.round(W * (img.height / img.width)) || 112);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const px = ctx.getImageData(0, 0, W, H).data;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
  // separable box blur for smooth relief
  const R = 4;
  const tmp = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -R; k <= R; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += lum[y * W + xx]; n++; } }
      tmp[y * W + x] = s / n;
    }
  const out = new Uint8Array(W * H * 4);
  for (let x = 0; x < W; x++)
    for (let y = 0; y < H; y++) {
      let s = 0, n = 0;
      for (let k = -R; k <= R; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += tmp[yy * W + x]; n++; } }
      const depth = Math.round((1 - s / n) * 255); // dark = near = high
      const idx = (y * W + x) * 4;
      out[idx] = out[idx + 1] = out[idx + 2] = depth;
      out[idx + 3] = 255;
    }
  const t = new THREE.DataTexture(out, W, H, THREE.RGBAFormat);
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

function Living({ image, progressRef, interactive, amp, reduced }: { image: string; progressRef: RefObject<number>; interactive: boolean; amp: number; reduced: boolean }) {
  const tex = useTexture(image);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  const depth = useMemo(() => buildDepthTexture(tex.image as HTMLImageElement), [tex]);
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uDepth: { value: depth },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uProgress: { value: 0 },
      uAmp: { value: reduced ? amp * 0.4 : amp },
    }),
    [tex, depth, amp, reduced]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uProgress.value = progressRef.current ?? 0;

    const drift = reduced ? 0 : 1;
    const mx = interactive ? state.pointer.x : 0;
    const my = interactive ? state.pointer.y : 0;
    // snappy but smooth follow (was sluggish at 0.04)
    mouse.current.x += (mx - mouse.current.x) * 0.11;
    mouse.current.y += (my - mouse.current.y) * 0.11;
    uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);

    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = mouse.current.x * 0.1 + Math.sin(t * 0.15) * 0.025 * drift;
      mesh.current.rotation.x = -mouse.current.y * 0.08 + Math.cos(t * 0.12) * 0.018 * drift;
      const s = 1.2 + Math.sin(t * 0.08) * 0.012 * drift;
      mesh.current.scale.set(viewport.width * s, viewport.height * s, 1);
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, 96, 54]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
    </mesh>
  );
}

// Pause rendering when the canvas scrolls off-screen (big perf win).
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

export default function CinematicScene({
  image,
  progressRef,
  interactive = true,
  amp = 0.7,
  dust = true,
  className,
}: {
  image: string;
  progressRef?: RefObject<number>;
  interactive?: boolean;
  amp?: number;
  dust?: boolean;
  className?: string;
}) {
  const fallback = useRef(0);
  const pr = progressRef ?? fallback;
  const [dpr, setDpr] = useState(1.2);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(id);
  }, []);
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  return (
    <Canvas
      className={className}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 0.9s ease" }}
      dpr={dpr}
      flat
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 40 }}
    >
      <color attach="background" args={["#05050a"]} />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.35)} />
      <Suspense fallback={null}>
        <Living image={image} progressRef={pr} interactive={interactive} amp={amp} reduced={reduced} />
      </Suspense>
      {dust && !reduced && <Sparkles count={36} scale={[14, 9, 5]} position={[0, 0, 2.2]} size={3} speed={0.18} opacity={0.32} color="#ffffff" />}
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.72} luminanceSmoothing={0.5} mipmapBlur />
      </EffectComposer>
      <VisibilityControl />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
