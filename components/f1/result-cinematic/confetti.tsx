"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 500;
// Palette of golds so the fall shimmers instead of looking flat.
const COLORS = ["#FFD700", "#FFC400", "#FFE57F", "#E6B800", "#FFB300"];

interface ConfettiPiece {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  color: THREE.Color;
  respawnAt: number;
  alive: boolean;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function Confetti() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();

  const particles = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      pos: new THREE.Vector3(0, 200, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      rotVel: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(COLORS[i % COLORS.length]),
      // Staggered initial spawn across the first ~3s so the shower rolls in.
      respawnAt: Math.random() * 3,
      alive: false,
    }));
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const zeroScale = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  function spawn(p: ConfettiPiece, t: number) {
    // Spawn along the top of the viewport (and a bit above), spanning its full
    // width so the shower covers the entire screen.
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    p.pos.set(
      rand(-halfW - 1, halfW + 1),
      halfH + rand(0.5, 3),
      rand(-2, 2)
    );
    p.vel.set(rand(-0.6, 0.6), rand(-1.8, -3.2), rand(-0.3, 0.3));
    p.rot.set(
      rand(0, Math.PI * 2),
      rand(0, Math.PI * 2),
      rand(0, Math.PI * 2)
    );
    p.rotVel.set(rand(-5, 5), rand(-5, 5), rand(-5, 5));
    p.alive = true;
    p.respawnAt = t + rand(4, 8);
  }

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const mesh = meshRef.current;
    const floorY = -viewport.height / 2 - 2;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (!p.alive) {
        if (t >= p.respawnAt) {
          spawn(p, t);
        } else {
          tempQuat.setFromEuler(p.rot);
          tempMatrix.compose(p.pos, tempQuat, zeroScale);
          mesh.setMatrixAt(i, tempMatrix);
          mesh.setColorAt(i, p.color);
          continue;
        }
      }

      p.vel.y -= 3.0 * dt;
      p.vel.x *= 0.99;
      p.vel.z *= 0.99;
      p.pos.addScaledVector(p.vel, dt);
      p.rot.x += p.rotVel.x * dt;
      p.rot.y += p.rotVel.y * dt;
      p.rot.z += p.rotVel.z * dt;

      // Recycle the moment the piece leaves the bottom of the viewport.
      if (p.pos.y <= floorY) {
        p.alive = false;
        p.respawnAt = t + rand(0.1, 1.2);
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
      <planeGeometry args={[0.14, 0.26]} />
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
