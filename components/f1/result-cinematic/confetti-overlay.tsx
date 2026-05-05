"use client";

import { Canvas } from "@react-three/fiber";
import { Confetti } from "./confetti";

/**
 * Full-viewport confetti layer. Rendered as its own transparent Canvas at
 * fixed inset-0 so the shower spans the entire screen, not just the cinematic
 * hero region. An orthographic camera keeps the spawn/fall coordinates simple
 * and screen-aligned.
 */
export function ConfettiOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <Confetti />
      </Canvas>
    </div>
  );
}
