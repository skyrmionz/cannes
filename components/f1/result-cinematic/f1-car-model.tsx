"use client";

import { forwardRef } from "react";
import * as THREE from "three";
import { TeamLivery } from "./team-colors";

interface F1CarModelProps {
  livery: TeamLivery;
}

// Stylized F1 silhouette built from primitives. Faces +X (so it drives "forward"
// when we increase position.x). Overall length ~4, width ~1.6, height ~0.9.
export const F1CarModel = forwardRef<THREE.Group, F1CarModelProps>(
  function F1CarModel({ livery }, ref) {
    const body = liveryToMat(livery.primary);
    const secondary = liveryToMat(livery.secondary);
    const accent = liveryToMat(livery.accent);
    const tire = liveryToMat("#0E0E0E", 0.9, 0.1);
    const carbon = liveryToMat("#111111", 0.2, 0.3);

    return (
      <group ref={ref}>
        {/* Main monocoque tub — long low body */}
        <mesh position={[0, 0.28, 0]} material={body}>
          <boxGeometry args={[3.0, 0.28, 0.7]} />
        </mesh>

        {/* Nose cone — tapered to the front */}
        <mesh
          position={[1.75, 0.18, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={body}
        >
          <cylinderGeometry args={[0.05, 0.22, 0.9, 16]} />
        </mesh>

        {/* Front wing — low, wide */}
        <mesh position={[2.25, 0.08, 0]} material={secondary}>
          <boxGeometry args={[0.4, 0.04, 1.6]} />
        </mesh>
        {/* Front wing endplates */}
        <mesh position={[2.25, 0.16, 0.78]} material={accent}>
          <boxGeometry args={[0.3, 0.22, 0.03]} />
        </mesh>
        <mesh position={[2.25, 0.16, -0.78]} material={accent}>
          <boxGeometry args={[0.3, 0.22, 0.03]} />
        </mesh>

        {/* Cockpit / raised section behind nose */}
        <mesh position={[0.4, 0.5, 0]} material={body}>
          <boxGeometry args={[1.4, 0.3, 0.55]} />
        </mesh>

        {/* Halo — simplified as a thin arch */}
        <mesh position={[0.4, 0.78, 0]} material={carbon}>
          <torusGeometry args={[0.3, 0.025, 12, 20, Math.PI]} />
        </mesh>

        {/* Driver helmet — small dome inside cockpit */}
        <mesh position={[0.3, 0.78, 0]} material={accent}>
          <sphereGeometry args={[0.16, 16, 12]} />
        </mesh>

        {/* Sidepods — bulges on either side of cockpit */}
        <mesh position={[0.2, 0.35, 0.55]} material={body}>
          <boxGeometry args={[1.4, 0.35, 0.3]} />
        </mesh>
        <mesh position={[0.2, 0.35, -0.55]} material={body}>
          <boxGeometry args={[1.4, 0.35, 0.3]} />
        </mesh>
        {/* Sidepod accent stripes */}
        <mesh position={[0.2, 0.35, 0.71]} material={secondary}>
          <boxGeometry args={[1.2, 0.05, 0.02]} />
        </mesh>
        <mesh position={[0.2, 0.35, -0.71]} material={secondary}>
          <boxGeometry args={[1.2, 0.05, 0.02]} />
        </mesh>

        {/* Engine cover / airbox */}
        <mesh position={[-0.6, 0.6, 0]} material={body}>
          <boxGeometry args={[1.0, 0.45, 0.45]} />
        </mesh>
        {/* Airbox intake */}
        <mesh position={[-0.15, 0.78, 0]} material={carbon}>
          <boxGeometry args={[0.15, 0.12, 0.28]} />
        </mesh>

        {/* Rear wing — tall and wide */}
        <mesh position={[-1.55, 0.72, 0]} material={body}>
          <boxGeometry args={[0.08, 0.55, 1.15]} />
        </mesh>
        {/* Rear wing top plane */}
        <mesh position={[-1.6, 0.98, 0]} material={secondary}>
          <boxGeometry args={[0.35, 0.05, 1.15]} />
        </mesh>
        {/* Rear wing endplates */}
        <mesh position={[-1.55, 0.76, 0.58]} material={accent}>
          <boxGeometry args={[0.25, 0.5, 0.03]} />
        </mesh>
        <mesh position={[-1.55, 0.76, -0.58]} material={accent}>
          <boxGeometry args={[0.25, 0.5, 0.03]} />
        </mesh>

        {/* Diffuser under rear */}
        <mesh position={[-1.55, 0.16, 0]} material={carbon}>
          <boxGeometry args={[0.35, 0.12, 0.95]} />
        </mesh>

        {/* Wheels — four cylinders, lying on their sides */}
        <Wheel position={[1.1, 0.28, 0.78]} material={tire} accent={accent} />
        <Wheel position={[1.1, 0.28, -0.78]} material={tire} accent={accent} />
        <Wheel position={[-1.1, 0.28, 0.78]} material={tire} accent={accent} />
        <Wheel position={[-1.1, 0.28, -0.78]} material={tire} accent={accent} />
      </group>
    );
  }
);

interface WheelProps {
  position: [number, number, number];
  material: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
}

function Wheel({ position, material, accent }: WheelProps) {
  const isRightSide = position[2] > 0;
  const rimZ = isRightSide ? 0.12 : -0.12;
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 20]} />
      </mesh>
      {/* Rim disc */}
      <mesh position={[0, 0, rimZ]} rotation={[Math.PI / 2, 0, 0]} material={accent}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
      </mesh>
    </group>
  );
}

function liveryToMat(
  color: string,
  metalness = 0.35,
  roughness = 0.4
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
  });
}
