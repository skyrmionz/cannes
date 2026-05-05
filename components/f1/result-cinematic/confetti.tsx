"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 400;
const FLOOR_Y = -2;
const EMISSION_START = 7.0;
// Palette of golds so the fall shimmers instead of looking flat.
const COLORS = ["#FFD700", "#FFC400", "#FFE57F", "#E6B800", "#FFB300"];

interface ConfettiPiece {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  color: THREE.Color;
  respawnAt: number; // seconds — when the piece should next spawn
  alive: boolean;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawnInitial(p: ConfettiPiece, t: number) {
  p.pos.set(rand(-8, 8), rand(8, 14), rand(-2, 2));
  p.vel.set(rand(-0.5, 0.5), rand(-1.5, -2.8), rand(-0.2, 0.2));
  p.rot.set(
    rand(0, Math.PI * 2),
    rand(0, Math.PI * 2),
    rand(0, Math.PI * 2)
  );
  p.rotVel.set(rand(-5, 5), rand(-5, 5), rand(-5, 5));
  p.alive = true;
  p.respawnAt = t + rand(4, 8);
}

export function Confetti() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      pos: new THREE.Vector3(0, 200, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      rotVel: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(COLORS[i % COLORS.length]),
      // Stagger initial spawn across the first ~3s so the first burst rolls in
      respawnAt: EMISSION_START + Math.random() * 3,
      alive: false,
    }));
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const zeroScale = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const mesh = meshRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Not yet time to spawn → render at zero scale
      if (!p.alive) {
        if (t >= p.respawnAt) {
          spawnInitial(p, t);
        } else {
          tempQuat.setFromEuler(p.rot);
          tempMatrix.compose(p.pos, tempQuat, zeroScale);
          mesh.setMatrixAt(i, tempMatrix);
          mesh.setColorAt(i, p.color);
          continue;
        }
      }

      // Physics
      p.vel.y -= 3.0 * dt;
      p.vel.x *= 0.99;
      p.vel.z *= 0.99;
      p.pos.addScaledVector(p.vel, dt);
      p.rot.x += p.rotVel.x * dt;
      p.rot.y += p.rotVel.y * dt;
      p.rot.z += p.rotVel.z * dt;

      // Recycle pieces once they hit the floor — keeps the shower going forever
      if (p.pos.y <= FLOOR_Y) {
        p.alive = false;
        p.respawnAt = t + rand(0.1, 1.2); // quick recycle
      }

      tempQuat.setFromEuler(p.rot);
      tempMatrix.compose(p.pos, tempQuat, tempScale);
      mesh.setMatrixAt(i, tempMatrix);
      mesh.setColorAt(i, p.color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <planeGeometry args={[0.12, 0.22]} />
      <meshStandardMaterial
        side={THREE.DoubleSide}
        toneMapped={false}
        metalness={0.85}
        roughness={0.25}
        emissive="#FFB300"
        emissiveIntensity={0.15}
      />
    </instancedMesh>
  );
}
