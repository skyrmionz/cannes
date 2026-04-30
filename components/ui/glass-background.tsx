"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function createLiquidGlassGeometry(
  width: number,
  height: number,
  segs: number,
  seed: number
) {
  const geo = new THREE.PlaneGeometry(width, height, segs, segs);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const broad =
      Math.sin(x * 0.9 + seed) * 0.3 +
      Math.cos(y * 0.75 + seed * 1.4) * 0.25;

    const folds =
      Math.sin(x * 2.2 + seed * 0.8) * 0.2 +
      Math.cos(y * 2.5 + seed * 1.3) * 0.18 +
      Math.sin((x + y) * 1.8 + seed * 0.6) * 0.15 +
      Math.cos((x - y) * 2.0 + seed * 1.1) * 0.12;

    const ripple =
      Math.sin(x * 3.5 + y * 2.8 + seed) * 0.08 +
      Math.cos(x * 2.8 - y * 3.2 + seed * 1.2) * 0.06 +
      Math.sin(x * 4.5 + seed * 2.0) * Math.cos(y * 4.0 + seed) * 0.04;

    pos.setZ(i, broad + folds + ripple);
  }

  geo.computeVertexNormals();
  return geo;
}

function MirrorSheet({
  position,
  rotation,
  size,
  seed,
  speed,
  thicknessBase,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  seed: number;
  speed: number;
  thicknessBase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const geometry = useMemo(
    () => createLiquidGlassGeometry(size[0], size[1], 96, seed),
    [size, seed]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.3) * 0.02;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * 0.25) * 0.025;
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.15) * 0.015;

    if (matRef.current) {
      matRef.current.iridescenceThicknessRange = [
        thicknessBase + Math.sin(t * 0.4) * 50,
        thicknessBase + 280 + Math.cos(t * 0.25) * 60,
      ];
    }

    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    if (!basePositions.current) {
      basePositions.current = new Float32Array(pos.array);
    }
    const base = basePositions.current;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const wave =
        Math.sin(bx * 0.9 + t * 0.45) * 0.045 +
        Math.cos(by * 1.1 + t * 0.38) * 0.04 +
        Math.sin((bx + by) * 0.7 + t * 0.32) * 0.035 +
        Math.sin((bx - by) * 2.4 + t * 0.55) * 0.018;
      pos.setZ(i, bz + wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshPhysicalMaterial
        ref={matRef}
        roughness={0.04}
        metalness={0.85}
        iridescence={1}
        iridescenceIOR={2.3}
        iridescenceThicknessRange={[thicknessBase, thicknessBase + 280]}
        clearcoat={1}
        clearcoatRoughness={0.02}
        envMapIntensity={5}
        side={THREE.DoubleSide}
        color="#ddd4f8"
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.8} color="#e8e0ff" />
      <directionalLight position={[4, 5, 6]} intensity={2.5} color="#e0d8ff" />
      <directionalLight position={[-5, 2, 3]} intensity={2} color="#c0d8ff" />
      <directionalLight position={[0, -3, 5]} intensity={1.5} color="#f0d0f0" />
      <pointLight position={[-3, 3, 4]} intensity={2.5} color="#a8c8ff" />
      <pointLight position={[3, -2, 3]} intensity={2} color="#e0a0e8" />
      <pointLight position={[0, 2, 5]} intensity={1.8} color="#b8d8ff" />
      <pointLight position={[-2, -2, 4]} intensity={1.5} color="#d0b0f0" />

      <MirrorSheet
        position={[0, 0, -1.2]}
        rotation={[0.02, 0.02, -0.08]}
        size={[13, 8]}
        seed={1}
        speed={0.12}
        thicknessBase={120}
      />
      <MirrorSheet
        position={[-1.8, 0.4, -0.15]}
        rotation={[-0.12, 0.18, -0.24]}
        size={[8.5, 5.5]}
        seed={4.2}
        speed={0.16}
        thicknessBase={180}
      />
      <MirrorSheet
        position={[1.7, -0.35, 0.25]}
        rotation={[0.14, -0.16, 0.18]}
        size={[8, 5]}
        seed={8.5}
        speed={0.18}
        thicknessBase={230}
      />

      {/* Smooth gradient env sphere for clean reflections — no HDRI artifacts */}
      <Environment background={false}>
        <mesh scale={100}>
          <sphereGeometry args={[1, 64, 64]} />
          <shaderMaterial
            side={THREE.BackSide}
            uniforms={{
              colorTop: { value: new THREE.Color("#c8c0ff") },
              colorMid: { value: new THREE.Color("#e8e0ff") },
              colorBot: { value: new THREE.Color("#f0d8f0") },
            }}
            vertexShader={`
              varying vec3 vWorldPosition;
              void main() {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
              }
            `}
            fragmentShader={`
              uniform vec3 colorTop;
              uniform vec3 colorMid;
              uniform vec3 colorBot;
              varying vec3 vWorldPosition;
              void main() {
                float y = normalize(vWorldPosition).y;
                vec3 col = y > 0.0
                  ? mix(colorMid, colorTop, y)
                  : mix(colorMid, colorBot, -y);
                gl_FragColor = vec4(col, 1.0);
              }
            `}
          />
        </mesh>
      </Environment>
    </>
  );
}

function GlassCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

interface GlassBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function GlassBackground({
  children,
  className,
  containerClassName,
}: GlassBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        containerClassName
      )}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, rgba(255,255,255,0.95), transparent 32%),
            radial-gradient(circle at 78% 30%, rgba(191,219,254,0.55), transparent 38%),
            radial-gradient(circle at 48% 75%, rgba(252,231,243,0.65), transparent 42%),
            linear-gradient(135deg, #f8f7ff 0%, #eef6ff 45%, #fff7fb 100%)
          `,
        }}
      />
      <div className="pointer-events-none fixed inset-0">
        <GlassCanvas />
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
