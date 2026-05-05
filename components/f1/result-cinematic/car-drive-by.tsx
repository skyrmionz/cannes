"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { F1CarModel } from "./f1-car-model";
import { liveryFor } from "./team-colors";
import { clamp01, easeInCubic, easeOutCubic, lerp } from "./timeline";

interface CarDriveByProps {
  teamId: string;
}

const CAR_Y = 0.0;
const ENTER_X = -12;
const CENTER_X = 0;
const EXIT_X = 12;

export function CarDriveBy({ teamId }: CarDriveByProps) {
  const livery = liveryFor(teamId);

  const groupRef = useRef<THREE.Group>(null);
  const carRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Mesh>(null);
  const heatRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current || !carRef.current) return;

    // X position per phase
    let x = ENTER_X;
    if (t < 2) {
      x = lerp(ENTER_X, CENTER_X, easeOutCubic(clamp01(t / 2)));
    } else if (t < 4) {
      x = CENTER_X;
    } else if (t < 6) {
      x = lerp(CENTER_X, EXIT_X, easeInCubic(clamp01((t - 4) / 2)));
    } else {
      groupRef.current.visible = false;
      return;
    }

    // Forward pitch during brake
    let rotZ = 0;
    if (t >= 2 && t < 3) {
      const k = clamp01((t - 2) / 1);
      rotZ = -0.05 * Math.sin(k * Math.PI);
    }

    // Micro-shake during rev
    let yOffset = 0;
    if (t >= 3 && t < 4) {
      yOffset = Math.sin(t * 50) * 0.02;
    }

    groupRef.current.position.set(x, CAR_Y + yOffset, 0);
    groupRef.current.rotation.z = rotZ;

    // Smoke puff on brake (t 2.2 → 3.0)
    if (smokeRef.current) {
      const mat = smokeRef.current.material as THREE.MeshBasicMaterial;
      if (t < 2.2 || t > 3.0) mat.opacity = 0;
      else {
        const k = clamp01((t - 2.2) / 0.8);
        mat.opacity = (1 - k) * 0.7;
        smokeRef.current.scale.setScalar(1 + k * 2);
      }
    }

    // Exhaust heat shimmer during rev
    if (heatRef.current) {
      const mat = heatRef.current.material as THREE.MeshBasicMaterial;
      if (t < 3 || t > 4) mat.opacity = 0;
      else {
        mat.opacity = 0.4 + Math.abs(Math.sin(t * 18)) * 0.3;
      }
    }
  });

  return (
    <group ref={groupRef} position={[ENTER_X, CAR_Y, 0]}>
      <F1CarModel ref={carRef} livery={livery} />

      {/* Rear-wheel smoke puff (brake) */}
      <mesh ref={smokeRef} position={[-1.1, 0.3, 0]}>
        <sphereGeometry args={[0.35, 12, 8]} />
        <meshBasicMaterial
          color="#d8d8d8"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Exhaust heat shimmer (rev) */}
      <mesh ref={heatRef} position={[-1.8, 0.5, 0]}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshBasicMaterial
          color="#ff6b35"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
