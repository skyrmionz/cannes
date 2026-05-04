"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  clamp01,
  easeInCubic,
  easeOutCubic,
  lerp,
} from "./timeline";

interface CarDriveByProps {
  teamId: string;
}

const CAR_Y = 0.4;
const ENTER_X = -10;
const CENTER_X = 0;
const EXIT_X = 10;

export function CarDriveBy({ teamId }: CarDriveByProps) {
  const textureUrl = `/f1/teams/cars/${teamId}.png`;
  const texture = useTexture(textureUrl);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  // Aspect ratio — derive plane size from texture so the PNG isn't squashed.
  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect = (img?.width ?? 2) / (img?.height ?? 1);
  const height = 2;
  const width = aspect * height;

  const groupRef = useRef<THREE.Group>(null);
  const carRef = useRef<THREE.Mesh>(null);
  const streakRef = useRef<THREE.Mesh>(null);
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
      rotZ = -0.04 * Math.sin(k * Math.PI);
    }

    // Micro-shake during rev
    let yOffset = 0;
    if (t >= 3 && t < 4) {
      yOffset = Math.sin(t * 50) * 0.015;
    }

    // Scale-x stretch at peak exit velocity (motion-blur cheat)
    let scaleX = 1;
    if (t >= 4 && t < 6) {
      const k = clamp01((t - 4) / 2);
      const speed = 3 * k * k; // derivative of easeInCubic roughly
      scaleX = 1 + Math.min(speed * 0.04, 0.08);
    }

    groupRef.current.position.set(x, CAR_Y + yOffset, 0);
    groupRef.current.rotation.z = rotZ;
    groupRef.current.scale.x = scaleX;

    // Streak behind car — opacity proportional to speed in exit phase
    if (streakRef.current) {
      const mat = streakRef.current.material as THREE.MeshBasicMaterial;
      if (t < 4) mat.opacity = 0;
      else if (t < 6) {
        const k = clamp01((t - 4) / 2);
        mat.opacity = Math.min(k * 0.9, 0.6);
      } else mat.opacity = 0;
    }

    // Smoke puff on brake (t 2.2 → 3.0)
    if (smokeRef.current) {
      const mat = smokeRef.current.material as THREE.MeshBasicMaterial;
      if (t < 2.2 || t > 3.0) mat.opacity = 0;
      else {
        const k = clamp01((t - 2.2) / 0.8);
        mat.opacity = (1 - k) * 0.6;
        smokeRef.current.scale.setScalar(1 + k * 1.5);
      }
    }

    // Exhaust heat shimmer during rev
    if (heatRef.current) {
      const mat = heatRef.current.material as THREE.MeshBasicMaterial;
      if (t < 3 || t > 4) mat.opacity = 0;
      else {
        mat.opacity = 0.3 + Math.abs(Math.sin(t * 18)) * 0.25;
      }
    }
  });

  return (
    <group ref={groupRef} position={[ENTER_X, CAR_Y, 0]}>
      {/* Speed-line streak behind the car */}
      <mesh ref={streakRef} position={[-width * 0.4, 0, -0.1]}>
        <planeGeometry args={[width * 1.6, height * 0.5]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Car itself */}
      <mesh ref={carRef}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Rear-wheel smoke puff (brake) */}
      <mesh ref={smokeRef} position={[-width * 0.35, -0.3, 0.05]}>
        <circleGeometry args={[0.25, 16]} />
        <meshBasicMaterial
          color="#cccccc"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Exhaust heat shimmer (rev) */}
      <mesh ref={heatRef} position={[-width * 0.42, -0.2, -0.05]}>
        <circleGeometry args={[0.18, 16]} />
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
