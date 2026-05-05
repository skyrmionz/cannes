"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { CarDriveBy } from "./car-drive-by";
import { Podium } from "./podium";
import { PersonaOnPodium } from "./persona-on-podium";

interface CinematicSceneProps {
  teamId: string;
  personaId: string;
  mp3Url: string | null;
  onAudioBlocked: () => void;
}

export function CinematicScene({
  teamId,
  personaId,
  mp3Url,
  onAudioBlocked,
}: CinematicSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 8.5], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <SpotlightOnFirst />

      <Environment preset="city" />

      <Suspense fallback={null}>
        <CarDriveBy teamId={teamId} />
      </Suspense>

      <Podium />
      <PersonaOnPodium personaId={personaId} />

      {/* Floor catches shadows (small, near-transparent, never fully covers DotBg) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 6]} />
        <shadowMaterial opacity={0.25} />
      </mesh>

      <CameraShake />

      <AudioController mp3Url={mp3Url} onAudioBlocked={onAudioBlocked} />
    </Canvas>
  );
}

function SpotlightOnFirst() {
  const lightRef = useRef<THREE.SpotLight>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!lightRef.current) return;
    const intensity = t < 6 ? 0 : Math.min((t - 6) * 40, 50);
    lightRef.current.intensity = intensity;
  });
  return (
    <spotLight
      ref={lightRef}
      position={[0, 9, 3]}
      angle={0.35}
      penumbra={0.6}
      intensity={0}
      castShadow
      target-position={[0, 2, 0]}
      color="#ffffff"
    />
  );
}

function CameraShake() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cam = state.camera;
    // Brake-induced jitter (t 2 → 3)
    if (t >= 2 && t < 3) {
      const k = Math.max(0, 1 - (t - 2));
      cam.position.y = 1.5 + Math.sin(t * 80) * 0.02 * k;
    } else {
      cam.position.y = 1.5;
    }
  });
  return null;
}

interface AudioControllerProps {
  mp3Url: string | null;
  onAudioBlocked: () => void;
}

function AudioController({ mp3Url, onAudioBlocked }: AudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!mp3Url) return;
    const audio = new Audio(mp3Url);
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [mp3Url]);

  useFrame(async (state) => {
    const t = state.clock.getElapsedTime();
    if (t < 7.5 || startedRef.current || !audioRef.current) return;
    startedRef.current = true;
    try {
      await audioRef.current.play();
    } catch {
      onAudioBlocked();
    }
  });

  return null;
}
