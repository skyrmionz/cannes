"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function createCrumpledGeometry(
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
      Math.sin(x * 2.5 + seed) * 0.4 +
      Math.sin(y * 3.0 + seed * 1.3) * 0.35 +
      Math.sin((x * 1.8 + y * 2.2) + seed * 0.7) * 0.3 +
      Math.cos(x * 4.0 - y * 2.5 + seed * 2) * 0.2 +
      Math.sin(x * 5.5 + y * 4.0 + seed * 3) * 0.12 +
      Math.cos((x - y) * 3.5 + seed * 1.8) * 0.15;
    pos.setZ(i, displacement);
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

  const geometry = useMemo(
    () => createCrumpledGeometry(size[0], size[1], 48, seed),
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
        thicknessBase + Math.sin(t * 0.4) * 60,
        thicknessBase + 300 + Math.cos(t * 0.25) * 80,
      ];
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshPhysicalMaterial
        ref={matRef}
        roughness={0.05}
        metalness={0.7}
        iridescence={1}
        iridescenceIOR={2.2}
        iridescenceThicknessRange={[thicknessBase, thicknessBase + 300]}
        clearcoat={1}
        clearcoatRoughness={0.02}
        envMapIntensity={5}
        side={THREE.DoubleSide}
        color="#f4f2ff"
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 5]} intensity={4} color="#f0ecff" />
      <directionalLight position={[-5, 3, -3]} intensity={3} color="#e8e4ff" />
      <directionalLight position={[0, -4, 4]} intensity={2.5} color="#f0f0ff" />
      <pointLight position={[-2, 3, 4]} intensity={3} color="#e0d8ff" />
      <pointLight position={[3, -2, 3]} intensity={2.5} color="#ece4ff" />
      <pointLight position={[0, 0, 6]} intensity={2} color="#f0eeff" />

      {/* Large back sheet fills the frame */}
      <MirrorSheet
        position={[0, 0, -1.5]}
        rotation={[0.05, 0.03, 0]}
        size={[12, 10]}
        seed={1}
        speed={0.15}
        thicknessBase={80}
      />
      {/* Mid layer, angled */}
      <MirrorSheet
        position={[-1, 0.5, -0.3]}
        rotation={[-0.2, 0.25, -0.3]}
        size={[8, 7]}
        seed={4.2}
        speed={0.2}
        thicknessBase={160}
      />
      {/* Front layer, more crumpled */}
      <MirrorSheet
        position={[0.8, -0.3, 0.5]}
        rotation={[0.25, -0.18, 0.2]}
        size={[7, 6]}
        seed={8.5}
        speed={0.25}
        thicknessBase={240}
      />

      <Environment preset="apartment" />
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
        "relative min-h-screen w-full overflow-hidden bg-[#f2f0fa]",
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
