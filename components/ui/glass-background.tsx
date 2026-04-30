"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function createDisplacedGeometry(
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
    const displacement =
      Math.sin(x * 1.2 + seed) * 0.3 +
      Math.sin(y * 0.8 + seed * 1.5) * 0.25 +
      Math.sin((x + y) * 0.6 + seed * 0.7) * 0.2 +
      Math.cos(x * 2.1 - y * 1.3 + seed * 2) * 0.15;
    pos.setZ(i, displacement);
  }
  geo.computeVertexNormals();
  return geo;
}

function GlassSheet({
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

  const geometry = useMemo(
    () => createDisplacedGeometry(size[0], size[1], 24, seed),
    [size, seed]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.4) * 0.03;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * 0.3) * 0.04;
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.2) * 0.02;

    if (matRef.current) {
      matRef.current.iridescenceThicknessRange = [
        thicknessBase + Math.sin(t * 0.5) * 80,
        thicknessBase + 250 + Math.cos(t * 0.3) * 100,
      ];
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshPhysicalMaterial
        ref={matRef}
        transparent
        opacity={0.35}
        roughness={0.05}
        metalness={0.1}
        iridescence={1}
        iridescenceIOR={1.8}
        iridescenceThicknessRange={[thicknessBase, thicknessBase + 250]}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={1.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-3, 2, 3]} intensity={0.8} color="#ffd0e8" />
      <pointLight position={[2, -2, 2]} intensity={0.5} color="#d0e0ff" />

      <GlassSheet
        position={[-0.8, 0.3, 0]}
        rotation={[-0.24, 0.31, -0.35]}
        size={[5, 4]}
        seed={1}
        speed={0.3}
        thicknessBase={100}
      />
      <GlassSheet
        position={[0.6, -0.2, -0.5]}
        rotation={[0.31, -0.21, 0.28]}
        size={[4.5, 4.5]}
        seed={3.7}
        speed={0.22}
        thicknessBase={180}
      />
      <GlassSheet
        position={[0, -0.5, -1]}
        rotation={[-0.14, 0.42, -0.14]}
        size={[6, 3]}
        seed={7.2}
        speed={0.18}
        thicknessBase={250}
      />

      <Environment preset="studio" />
    </>
  );
}

function GlassCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
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
        "relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#faf8ff] via-[#f2f0ff] to-[#fff5fa]",
        containerClassName
      )}
    >
      <div className="pointer-events-none fixed inset-0">
        <GlassCanvas />
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
