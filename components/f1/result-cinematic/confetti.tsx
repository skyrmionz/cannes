"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 300;
const FLOOR_Y = -2;
const EMISSION_START = 7.5;
const COLORS = ["#E10600", "#FFD700", "#FFFFFF", "#4A90D9", "#FF6B35"];

interface ConfettiPiece {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  color: THREE.Color;
  frozen: boolean;
  spawnedAt: number; // seconds
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function Confetti() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      pos: new THREE.Vector3(0, 100, 0), // parked far above until spawned
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      rotVel: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(COLORS[i % COLORS.length]),
      frozen: false,
      spawnedAt: EMISSION_START + i * 0.012, // staggered burst over ~3.6s
    }));
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const mesh = meshRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Not yet spawned → keep parked (scale 0)
      if (t < p.spawnedAt) {
        tempScale.set(0, 0, 0);
        tempQuat.setFromEuler(p.rot);
        tempMatrix.compose(p.pos, tempQuat, tempScale);
        mesh.setMatrixAt(i, tempMatrix);
        continue;
      }

      // Just spawned this frame — initialize burst position/velocity
      if (p.pos.y > 50) {
        p.pos.set(rand(-5, 5), rand(5, 7), rand(-1, 1));
        p.vel.set(rand(-1.2, 1.2), rand(-1.5, -3), rand(-0.6, 0.6));
        p.rot.set(rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2));
        p.rotVel.set(rand(-6, 6), rand(-6, 6), rand(-6, 6));
      }

      if (!p.frozen) {
        p.vel.y -= 2.0 * dt;
        p.vel.x *= 0.99;
        p.vel.z *= 0.99;
        p.pos.addScaledVector(p.vel, dt);
        p.rot.x += p.rotVel.x * dt;
        p.rot.y += p.rotVel.y * dt;
        p.rot.z += p.rotVel.z * dt;
        if (p.pos.y <= FLOOR_Y) {
          p.pos.y = FLOOR_Y;
          p.vel.set(0, 0, 0);
          p.rotVel.set(0, 0, 0);
          p.frozen = true;
        }
      }

      tempQuat.setFromEuler(p.rot);
      tempScale.set(1, 1, 1);
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
      <planeGeometry args={[0.1, 0.2]} />
      <meshBasicMaterial
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
        opacity={1}
      />
    </instancedMesh>
  );
}
