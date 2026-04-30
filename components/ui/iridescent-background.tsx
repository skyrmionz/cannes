"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function IridescentPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.08;
      meshRef.current.rotation.y = Math.cos(t * 0.12) * 0.06;
    }

    if (materialRef.current) {
      materialRef.current.iridescenceThicknessRange = [
        100 + Math.sin(t * 0.3) * 50,
        400 + Math.cos(t * 0.2) * 100,
      ];
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[8, 6, 64, 64]} />
      <meshPhysicalMaterial
        ref={materialRef}
        transmission={1}
        thickness={1.2}
        roughness={0.08}
        metalness={0}
        ior={1.45}
        iridescence={1}
        iridescenceIOR={1.8}
        iridescenceThicknessRange={[100, 400]}
        envMapIntensity={1.5}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -4]} intensity={0.6} color="#e0d0ff" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#ffd0e0" />
      <IridescentPlane />
      <Environment preset="studio" />
    </>
  );
}

interface IridescentBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function IridescentBackground({
  children,
  className,
  containerClassName,
}: IridescentBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-white",
        containerClassName
      )}
    >
      <div className="pointer-events-none fixed inset-0">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
