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
  songUrl: string | null;
  commentaryUrl: string | null;
  onAudioBlocked: () => void;
}

export function CinematicScene({
  teamId,
  personaId,
  songUrl,
  commentaryUrl,
  onAudioBlocked,
}: CinematicSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.4, 9], fov: 45 }}
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

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 6]} />
        <shadowMaterial opacity={0.25} />
      </mesh>

      <CameraShake />

      <AudioController
        songUrl={songUrl}
        commentaryUrl={commentaryUrl}
        onAudioBlocked={onAudioBlocked}
      />
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
    if (t >= 2 && t < 3) {
      const k = Math.max(0, 1 - (t - 2));
      cam.position.y = 2.4 + Math.sin(t * 80) * 0.02 * k;
    } else {
      cam.position.y = 2.4;
    }
    cam.lookAt(0, 1.4, 0);
  });
  return null;
}

interface AudioControllerProps {
  songUrl: string | null;
  commentaryUrl: string | null;
  onAudioBlocked: () => void;
}

function AudioController({ songUrl, commentaryUrl, onAudioBlocked }: AudioControllerProps) {
  const songRef = useRef<HTMLAudioElement | null>(null);
  const commentaryRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const commentaryFiredRef = useRef(false);
  // Stable ref so the useFrame closure never captures a stale callback
  const onBlockedRef = useRef(onAudioBlocked);
  useEffect(() => { onBlockedRef.current = onAudioBlocked; }, [onAudioBlocked]);

  useEffect(() => {
    if (!songUrl) return;
    const audio = new Audio(songUrl);
    audio.preload = "auto";
    audio.loop = true;
    songRef.current = audio;
    return () => { audio.pause(); songRef.current = null; };
  }, [songUrl]);

  useEffect(() => {
    if (!commentaryUrl) return;
    const audio = new Audio(commentaryUrl);
    audio.preload = "auto";
    commentaryRef.current = audio;
    return () => { audio.pause(); commentaryRef.current = null; };
  }, [commentaryUrl]);

  // useFrame callbacks must be synchronous — call .play() and chain .catch() without await
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Start song 1s after the scene mounts (gives Canvas time to initialise)
    if (t >= 1 && !startedRef.current && songRef.current) {
      startedRef.current = true;
      songRef.current.play().catch(() => onBlockedRef.current());
    }

    // Fire commentary ~7s after song starts
    if (t >= 8 && !commentaryFiredRef.current && commentaryRef.current) {
      commentaryFiredRef.current = true;
      commentaryRef.current.play().catch(() => {/* commentary is optional */});
    }
  });

  return null;
}
