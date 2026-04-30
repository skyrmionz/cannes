"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const iridVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const iridFragmentShader = `
  uniform float uTime;
  uniform float uThicknessBase;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  vec3 thinFilmInterference(float cosTheta, float thickness) {
    float delta = thickness * cosTheta;

    vec3 color;
    color.r = 0.5 + 0.5 * cos(6.2832 * (delta / 650.0 + 0.0));
    color.g = 0.5 + 0.5 * cos(6.2832 * (delta / 530.0 + 0.0));
    color.b = 0.5 + 0.5 * cos(6.2832 * (delta / 460.0 + 0.0));

    return color;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    float NdotV = abs(dot(normal, viewDir));

    // Fresnel — stronger iridescence at glancing angles
    float fresnel = pow(1.0 - NdotV, 2.5);

    // Thin-film thickness varies across surface and time
    float thickness = uThicknessBase
      + sin(vUv.x * 8.0 + uTime * 0.3) * 80.0
      + cos(vUv.y * 6.0 + uTime * 0.25) * 60.0
      + sin((vUv.x + vUv.y) * 5.0 + uTime * 0.2) * 50.0;

    vec3 iridescentColor = thinFilmInterference(NdotV, thickness);

    // Specular highlight
    vec3 lightDir1 = normalize(vec3(0.4, 0.5, 0.6));
    vec3 lightDir2 = normalize(vec3(-0.5, 0.2, 0.3));
    vec3 halfDir1 = normalize(viewDir + lightDir1);
    vec3 halfDir2 = normalize(viewDir + lightDir2);
    float spec1 = pow(max(dot(normal, halfDir1), 0.0), 120.0);
    float spec2 = pow(max(dot(normal, halfDir2), 0.0), 80.0);
    vec3 specular = vec3(1.0) * (spec1 * 0.7 + spec2 * 0.4);

    // Soft diffuse from normals for gentle shadows in folds
    float diffuse = 0.5 + 0.5 * dot(normal, normalize(vec3(0.3, 0.5, 0.8)));

    // White base with iridescent color mixed in via fresnel + normal variation
    float iriStrength = fresnel * 0.65 + (1.0 - NdotV * NdotV) * 0.35;
    vec3 base = vec3(0.97, 0.97, 0.98) * diffuse;
    vec3 color = mix(base, iridescentColor, iriStrength * 0.55);
    color += specular;

    // Keep it bright overall
    color = mix(color, vec3(1.0), 0.15);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createLiquidGlassGeometry(
  width: number,
  height: number,
  segs: number,
  seed: number
) {
  const geo = new THREE.PlaneGeometry(width, height, segs, segs);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const broad =
      Math.sin(x * 0.9 + seed) * 0.3 +
      Math.cos(y * 0.75 + seed * 1.4) * 0.25;

    const folds =
      Math.sin(x * 2.2 + seed * 0.8) * 0.2 +
      Math.cos(y * 2.5 + seed * 1.3) * 0.18 +
      Math.sin((x + y) * 1.8 + seed * 0.6) * 0.15 +
      Math.cos((x - y) * 2.0 + seed * 1.1) * 0.12;

    const ripple =
      Math.sin(x * 3.5 + y * 2.8 + seed) * 0.08 +
      Math.cos(x * 2.8 - y * 3.2 + seed * 1.2) * 0.06 +
      Math.sin(x * 4.5 + seed * 2.0) * Math.cos(y * 4.0 + seed) * 0.04;

    pos.setZ(i, broad + folds + ripple);
  }

  geo.computeVertexNormals();
  return geo;
}

function GlassSheet({
  position,
  rotation,
  size,
  seed,
  speed,
  thicknessBase,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  seed: number;
  speed: number;
  thicknessBase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const geometry = useMemo(
    () => createLiquidGlassGeometry(size[0], size[1], 96, seed),
    [size, seed]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uThicknessBase: { value: thicknessBase },
    }),
    [thicknessBase]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.3) * 0.02;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * 0.25) * 0.025;
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.15) * 0.015;

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    if (!basePositions.current) {
      basePositions.current = new Float32Array(pos.array);
    }
    const base = basePositions.current;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const wave =
        Math.sin(bx * 0.9 + t * 0.45) * 0.045 +
        Math.cos(by * 1.1 + t * 0.38) * 0.04 +
        Math.sin((bx + by) * 0.7 + t * 0.32) * 0.035 +
        Math.sin((bx - by) * 2.4 + t * 0.55) * 0.018;
      pos.setZ(i, bz + wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={iridVertexShader}
        fragmentShader={iridFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <GlassSheet
        position={[0, 0, -1.2]}
        rotation={[0.02, 0.02, -0.08]}
        size={[13, 8]}
        seed={1}
        speed={0.12}
        thicknessBase={400}
      />
      <GlassSheet
        position={[-1.8, 0.4, -0.15]}
        rotation={[-0.12, 0.18, -0.24]}
        size={[8.5, 5.5]}
        seed={4.2}
        speed={0.16}
        thicknessBase={550}
      />
      <GlassSheet
        position={[1.7, -0.35, 0.25]}
        rotation={[0.14, -0.16, 0.18]}
        size={[8, 5]}
        seed={8.5}
        speed={0.18}
        thicknessBase={700}
      />
    </>
  );
}

function GlassCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

interface GlassBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function GlassBackground({
  children,
  className,
  containerClassName,
}: GlassBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        containerClassName
      )}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, rgba(255,255,255,0.95), transparent 32%),
            radial-gradient(circle at 78% 30%, rgba(191,219,254,0.55), transparent 38%),
            radial-gradient(circle at 48% 75%, rgba(252,231,243,0.65), transparent 42%),
            linear-gradient(135deg, #f8f7ff 0%, #eef6ff 45%, #fff7fb 100%)
          `,
        }}
      />
      <div className="pointer-events-none fixed inset-0">
        <GlassCanvas />
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
