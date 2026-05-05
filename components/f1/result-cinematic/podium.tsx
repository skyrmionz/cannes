"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { clamp01 } from "./timeline";

const RADIUS = 0.8;
const FIRST_HEIGHT = 1.6;
const SECOND_HEIGHT = 1.2;
const THIRD_HEIGHT = 0.8;
const GAP = 0.3;

export function Podium() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;
    const opacity = t < 6 ? 0 : clamp01((t - 6) / 1);
    groupRef.current.visible = opacity > 0.01;
    groupRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).material) {
        const m = (obj as THREE.Mesh).material as THREE.Material & {
          opacity: number;
          transparent: boolean;
        };
        m.transparent = true;
        m.opacity = opacity;
      }
    });
  });

  const centerSpacing = RADIUS * 2 + GAP;

  return (
    <group ref={groupRef} visible={false}>
      {/* 1st — center, tallest, brightest glow */}
      <PodiumCylinder
        position={[0, FIRST_HEIGHT / 2, 0]}
        height={FIRST_HEIGHT}
        glow="#27E1E4" // cyan Tron glow
        rimColor="#27E1E4"
        label="1"
        labelColor="#27E1E4"
      />
      {/* 2nd — left */}
      <PodiumCylinder
        position={[-centerSpacing, SECOND_HEIGHT / 2, 0]}
        height={SECOND_HEIGHT}
        glow="#6F4AFF"
        rimColor="#6F4AFF"
        label="2"
        labelColor="#6F4AFF"
      />
      {/* 3rd — right */}
      <PodiumCylinder
        position={[centerSpacing, THIRD_HEIGHT / 2, 0]}
        height={THIRD_HEIGHT}
        glow="#E10600"
        rimColor="#E10600"
        label="3"
        labelColor="#E10600"
      />
    </group>
  );
}

interface PodiumCylinderProps {
  position: [number, number, number];
  height: number;
  glow: string;
  rimColor: string;
  label: string;
  labelColor: string;
}

function PodiumCylinder({
  position,
  height,
  glow,
  rimColor,
  label,
  labelColor,
}: PodiumCylinderProps) {
  return (
    <group position={position}>
      {/* Main dark glassy cylinder body */}
      <mesh>
        <cylinderGeometry args={[RADIUS, RADIUS, height, 48, 1, false]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.8}
          roughness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Inner vertical glow lines — thin emissive bars around the rim */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * (RADIUS + 0.005),
              0,
              Math.sin(a) * (RADIUS + 0.005),
            ]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[0.03, height * 0.85, 0.01]} />
            <meshStandardMaterial
              color={glow}
              emissive={glow}
              emissiveIntensity={1.8}
              toneMapped={false}
              transparent
            />
          </mesh>
        );
      })}

      {/* Top ring (bright glow) */}
      <mesh position={[0, height / 2 + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS, 0.035, 12, 48]} />
        <meshStandardMaterial
          color={rimColor}
          emissive={rimColor}
          emissiveIntensity={2.2}
          toneMapped={false}
          transparent
        />
      </mesh>

      {/* Bottom ring */}
      <mesh
        position={[0, -height / 2 + 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[RADIUS, 0.035, 12, 48]} />
        <meshStandardMaterial
          color={rimColor}
          emissive={rimColor}
          emissiveIntensity={2.2}
          toneMapped={false}
          transparent
        />
      </mesh>

      {/* Top face — slightly glowing disc */}
      <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS - 0.02, 48]} />
        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Place number — large, glowing, front-facing text */}
      <Text
        position={[0, 0, RADIUS + 0.02]}
        fontSize={height * 0.55}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={1}
        outlineWidth={0.015}
        outlineColor={labelColor}
        outlineOpacity={0.6}
      >
        {label}
      </Text>
    </group>
  );
}
