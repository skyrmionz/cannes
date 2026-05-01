"use client";

import { useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function getPositionAngle(count: number) {
  return (2 * Math.PI) / count;
}

interface KnobOption {
  id: string;
  label: string;
  country: string;
}

interface RotaryKnobProps {
  options: KnobOption[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

function KnobMesh({
  selectedIndex,
  rotationRef,
  positionCount,
}: {
  selectedIndex: number;
  rotationRef: React.RefObject<number>;
  positionCount: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringEmissiveRef = useRef(0.3);
  const prevIndex = useRef(selectedIndex);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationRef.current ?? 0;
    }

    if (prevIndex.current !== selectedIndex) {
      ringEmissiveRef.current = 0.8;
      prevIndex.current = selectedIndex;
    }
    if (ringEmissiveRef.current > 0.3) {
      ringEmissiveRef.current -= 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <directionalLight position={[-3, 3, -2]} intensity={0.6} color="#ff4444" />
      <spotLight
        position={[0, 6, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={2}
      />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#ffffff" />
      <Environment preset="night" />

      <group ref={groupRef}>
        {/* Knob body — brushed metal */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.7, 0.55, 64]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.92}
            roughness={0.12}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Top cap — slightly brighter to catch reflections */}
        <mesh position={[0, 0.275, 0]}>
          <cylinderGeometry args={[1.49, 1.49, 0.02, 64]} />
          <meshStandardMaterial
            color="#333"
            metalness={0.95}
            roughness={0.08}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Inner concentric ring on top */}
        <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.015, 16, 64]} />
          <meshStandardMaterial
            color="#444"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Mid ring on top */}
        <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#444"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Red accent ring on top edge */}
        <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.03, 16, 64]} />
          <meshStandardMaterial
            color="#E10600"
            metalness={0.9}
            roughness={0.15}
            emissive="#E10600"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Bottom edge ring for definition */}
        <mesh position={[0, -0.275, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.65, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#444"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Pointer indicator at 12 o'clock */}
        <mesh position={[0, 0.3, 1.2]}>
          <boxGeometry args={[0.06, 0.02, 0.25]} />
          <meshStandardMaterial
            color="#E10600"
            emissive="#E10600"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Knurled grip ridges — more visible, alternating bright/dark */}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const isBright = i % 2 === 0;
          return (
            <mesh
              key={`grip-${i}`}
              position={[Math.sin(a) * 1.62, 0, Math.cos(a) * 1.62]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.05, 0.4, 0.025]} />
              <meshStandardMaterial
                color={isBright ? "#3a3a3a" : "#1a1a1a"}
                metalness={0.9}
                roughness={isBright ? 0.15 : 0.4}
              />
            </mesh>
          );
        })}

        {/* 5 detent marks — larger and more visible */}
        {Array.from({ length: positionCount }).map((_, i) => {
          const a = (i / positionCount) * Math.PI * 2;
          const isActive = i === selectedIndex;
          return (
            <mesh
              key={`detent-${i}`}
              position={[Math.sin(a) * 1.64, 0.22, Math.cos(a) * 1.64]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.14, 0.1, 0.04]} />
              <meshStandardMaterial
                color={isActive ? "#E10600" : "#555"}
                emissive={isActive ? "#E10600" : "#111"}
                emissiveIntensity={isActive ? 0.6 : 0.05}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export function RotaryKnob({
  options,
  selectedIndex,
  onIndexChange,
}: RotaryKnobProps) {
  const positionCount = options.length;
  const positionAngle = getPositionAngle(positionCount);

  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(selectedIndex * positionAngle);
  const targetRotation = useRef(selectedIndex * positionAngle);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);

  useEffect(() => {
    targetRotation.current = selectedIndex * positionAngle;
  }, [selectedIndex, positionAngle]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      dragStartX.current = e.clientX;
      dragStartRotation.current = rotationRef.current;
      velocity.current = 0;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    rotationRef.current = dragStartRotation.current + deltaX * 0.008;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const snappedSteps = Math.round(rotationRef.current / positionAngle);
    const normalizedIndex =
      ((snappedSteps % positionCount) + positionCount) % positionCount;
    targetRotation.current = snappedSteps * positionAngle;
    onIndexChange(normalizedIndex);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, [onIndexChange]);

  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="cursor-grab active:cursor-grabbing"
        style={{ height: 200, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Canvas
          camera={{ position: [0, 2.8, 3.5], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <SpringAnimator
            rotationRef={rotationRef}
            targetRotation={targetRotation}
            velocity={velocity}
            isDragging={isDragging}
          />
          <KnobMesh selectedIndex={selectedIndex} rotationRef={rotationRef} positionCount={positionCount} />
        </Canvas>
      </div>

      {/* Position labels in semicircular arc */}
      <div className="relative mx-auto mt-2 flex items-start justify-between px-2">
        {options.map((option, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={option.id}
              className={cn(
                "flex-1 text-center transition-all duration-200",
                isSelected
                  ? "scale-110 text-white"
                  : "text-neutral-500"
              )}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider md:text-xs">
                {option.label}
              </div>
              <div className="text-[9px] md:text-[10px]">{option.country}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpringAnimator({
  rotationRef,
  targetRotation,
  velocity,
  isDragging,
}: {
  rotationRef: React.RefObject<number>;
  targetRotation: React.RefObject<number>;
  velocity: React.RefObject<number>;
  isDragging: React.RefObject<boolean>;
}) {
  useFrame((_, delta) => {
    if (isDragging.current) {
      velocity.current = 0;
      return;
    }

    const clampedDelta = Math.min(delta, 0.05);
    const displacement =
      (rotationRef.current ?? 0) - (targetRotation.current ?? 0);
    const springForce = -300 * displacement;
    const dampingForce = -26 * (velocity.current ?? 0);
    velocity.current =
      (velocity.current ?? 0) + (springForce + dampingForce) * clampedDelta;
    rotationRef.current =
      (rotationRef.current ?? 0) + (velocity.current ?? 0) * clampedDelta;

    if (
      Math.abs(displacement) < 0.001 &&
      Math.abs(velocity.current ?? 0) < 0.001
    ) {
      rotationRef.current = targetRotation.current ?? 0;
      velocity.current = 0;
    }
  });

  return null;
}
