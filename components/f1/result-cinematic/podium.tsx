"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { clamp01 } from "./timeline";

const BOX_WIDTH = 1.8;
const BOX_DEPTH = 1.6;
const FIRST_HEIGHT = 2.0;
const SECOND_HEIGHT = 1.5;
const THIRD_HEIGHT = 1.0;
const GAP = 0.1;

export function Podium() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;
    const opacity = t < 6 ? 0 : clamp01((t - 6) / 1);
    groupRef.current.visible = opacity > 0.01;
    groupRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).material) {
        const m = (obj as THREE.Mesh).material as THREE.Material &
          { opacity: number; transparent: boolean };
        m.transparent = true;
        m.opacity = opacity;
      }
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* 1st place — center, tallest */}
      <PodiumBox
        position={[0, FIRST_HEIGHT / 2, 0]}
        size={[BOX_WIDTH, FIRST_HEIGHT, BOX_DEPTH]}
        accent="#E10600"
        label="1"
      />
      {/* 2nd place — left */}
      <PodiumBox
        position={[-(BOX_WIDTH + GAP), SECOND_HEIGHT / 2, 0]}
        size={[BOX_WIDTH, SECOND_HEIGHT, BOX_DEPTH]}
        accent="#b0b0b0"
        label="2"
      />
      {/* 3rd place — right */}
      <PodiumBox
        position={[BOX_WIDTH + GAP, THIRD_HEIGHT / 2, 0]}
        size={[BOX_WIDTH, THIRD_HEIGHT, BOX_DEPTH]}
        accent="#8b5a2b"
        label="3"
      />
    </group>
  );
}

interface PodiumBoxProps {
  position: [number, number, number];
  size: [number, number, number];
  accent: string;
  label: string;
}

function PodiumBox({ position, size, accent, label }: PodiumBoxProps) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      <RoundedBox args={size} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.5}
          transparent
        />
      </RoundedBox>
      {/* Accent trim — thin colored strip along the top edge, front face */}
      <mesh position={[0, h / 2 - 0.06, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.96, 0.06]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.4}
          transparent
        />
      </mesh>
      {/* Place number on front face */}
      <Text
        position={[0, 0, d / 2 + 0.01]}
        fontSize={h * 0.45}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={1}
      >
        {label}
      </Text>
    </group>
  );
}
