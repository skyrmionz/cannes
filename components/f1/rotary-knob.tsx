"use client";

import { useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const POSITION_COUNT = 5;
const POSITION_ANGLE = (2 * Math.PI) / POSITION_COUNT;

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
}: {
  selectedIndex: number;
  rotationRef: React.RefObject<number>;
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
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#ff3333" />
      <spotLight
        position={[0, 6, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.5}
      />

      <group ref={groupRef}>
        {/* Knob body */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.7, 0.55, 64]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>

        {/* Top surface detail ring */}
        <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#333"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Red accent ring on top edge */}
        <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#E10600"
            metalness={0.9}
            roughness={0.2}
            emissive="#E10600"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Pointer indicator at 12 o'clock */}
        <mesh position={[0, 0.29, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.07, 0.2, 3]} />
          <meshStandardMaterial
            color="#E10600"
            emissive="#E10600"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Grip ridges on the side */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <mesh
              key={`grip-${i}`}
              position={[Math.sin(a) * 1.62, 0, Math.cos(a) * 1.62]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.04, 0.35, 0.02]} />
              <meshStandardMaterial
                color="#222"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
          );
        })}

        {/* 5 detent marks */}
        {Array.from({ length: POSITION_COUNT }).map((_, i) => {
          const a = (i / POSITION_COUNT) * Math.PI * 2;
          const isActive = i === selectedIndex;
          return (
            <mesh
              key={`detent-${i}`}
              position={[Math.sin(a) * 1.63, 0.2, Math.cos(a) * 1.63]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.1, 0.08, 0.03]} />
              <meshStandardMaterial
                color={isActive ? "#E10600" : "#444"}
                emissive={isActive ? "#E10600" : "#000000"}
                emissiveIntensity={isActive ? 0.5 : 0}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(selectedIndex * POSITION_ANGLE);
  const targetRotation = useRef(selectedIndex * POSITION_ANGLE);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);

  useEffect(() => {
    targetRotation.current = selectedIndex * POSITION_ANGLE;
  }, [selectedIndex]);

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

    const snappedSteps = Math.round(rotationRef.current / POSITION_ANGLE);
    const normalizedIndex =
      ((snappedSteps % POSITION_COUNT) + POSITION_COUNT) % POSITION_COUNT;
    targetRotation.current = snappedSteps * POSITION_ANGLE;
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
          <KnobMesh selectedIndex={selectedIndex} rotationRef={rotationRef} />
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
