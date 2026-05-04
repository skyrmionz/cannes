"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { CHARACTERS, PALETTE } from "../pixel-character";
import { clamp01, easeOutBack } from "./timeline";

interface PersonaOnPodiumProps {
  personaId: string;
}

const PIXEL_SIZE = 12; // 2x the 6px used in the SVG
const SPRITE_WIDTH = 1.2;
const SPRITE_HEIGHT = 2.4;
const FIRST_BOX_TOP = 2.0; // matches FIRST_HEIGHT in podium.tsx

function buildSpriteTexture(personaId: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const grid = CHARACTERS[personaId];
  if (!grid) return null;

  const rows = grid.length;
  const cols = grid[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = cols * PIXEL_SIZE;
  canvas.height = rows * PIXEL_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < rows; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]];
      if (!color || color === "transparent") continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function PersonaOnPodium({ personaId }: PersonaOnPodiumProps) {
  const texture = useMemo(() => buildSpriteTexture(personaId), [personaId]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;
    if (t < 7) {
      groupRef.current.visible = false;
      groupRef.current.scale.setScalar(0);
      return;
    }
    groupRef.current.visible = true;
    // Pop-up scale with easeOutBack overshoot (0 → 1.1 → 1.0)
    const k = clamp01((t - 7) / 0.5);
    const s = easeOutBack(k);
    groupRef.current.scale.setScalar(s);
  });

  if (!texture) return null;

  return (
    <group ref={groupRef} position={[0, FIRST_BOX_TOP + SPRITE_HEIGHT / 2, 0]}>
      <Billboard follow lockX lockZ>
        <mesh>
          <planeGeometry args={[SPRITE_WIDTH, SPRITE_HEIGHT]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.4}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
