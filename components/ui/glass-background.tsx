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

  // Stronger thin-film interference — the chromatic fringing the reference
  // image shows along the curved ridges (lilac → cyan → magenta → amber).
  vec3 thinFilmInterference(float cosTheta, float thickness) {
    float delta = thickness * cosTheta;

    vec3 color;
    color.r = 0.5 + 0.5 * cos(6.2832 * (delta / 620.0 + 0.05));
    color.g = 0.5 + 0.5 * cos(6.2832 * (delta / 540.0 + 0.40));
    color.b = 0.5 + 0.5 * cos(6.2832 * (delta / 450.0 + 0.00));

    // Push toward the lilac / electric-blue / magenta palette of the reference,
    // with a touch of amber where the cycle rolls warm.
    color.r *= 1.05;  // keeps pinks alive
    color.g *= 0.55;  // suppress greens
    color.b *= 1.35;  // boost blues / violets

    // Less whitening so chromatic streaks stay vivid instead of pastel.
    color = mix(color, vec3(1.0), 0.18);

    return clamp(color, 0.0, 1.2);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    float NdotV = abs(dot(normal, viewDir));

    // Sharper fresnel curve so chromatic edges pop where curvature is high.
    float fresnel = pow(1.0 - NdotV, 2.0);

    // Thin-film thickness varies across surface and time. Higher-frequency
    // contributions create the dense rainbow banding seen in the reference.
    float thickness = uThicknessBase
      + sin(vUv.x * 14.0 + uTime * 0.35) * 110.0
      + cos(vUv.y * 11.0 + uTime * 0.28) * 95.0
      + sin((vUv.x + vUv.y) * 9.0 + uTime * 0.22) * 70.0
      + cos((vUv.x * 3.5 - vUv.y * 4.0) * 4.0 + uTime * 0.18) * 55.0;

    vec3 iridescentColor = thinFilmInterference(NdotV, thickness);

    // Multi-light specular for the bright silvery peaks and secondary glints.
    vec3 lightDir1 = normalize(vec3(0.35, 0.55, 0.75));
    vec3 lightDir2 = normalize(vec3(-0.6, 0.25, 0.4));
    vec3 lightDir3 = normalize(vec3(0.1, -0.4, 0.6));
    vec3 halfDir1 = normalize(viewDir + lightDir1);
    vec3 halfDir2 = normalize(viewDir + lightDir2);
    vec3 halfDir3 = normalize(viewDir + lightDir3);
    float spec1 = pow(max(dot(normal, halfDir1), 0.0), 220.0);
    float spec2 = pow(max(dot(normal, halfDir2), 0.0), 140.0);
    float spec3 = pow(max(dot(normal, halfDir3), 0.0), 90.0);
    vec3 specular = vec3(1.0) * (spec1 * 1.0 + spec2 * 0.55 + spec3 * 0.28);

    // Cool tinted diffuse so recesses read as soft indigo / lilac instead of
    // flat white — matches the deep blues in the reference.
    float diffuseN = 0.5 + 0.5 * dot(normal, normalize(vec3(0.25, 0.55, 0.8)));
    vec3 coolBase = mix(vec3(0.78, 0.80, 0.96), vec3(1.0, 0.99, 1.0), diffuseN);

    // Iridescence is broadly visible (not only at glancing angles) so the
    // surface reads chromatic everywhere, with peaks at the ridges.
    float iriStrength = fresnel * 0.7 + (1.0 - NdotV * NdotV) * 0.55;
    vec3 color = mix(coolBase, iridescentColor, clamp(iriStrength * 0.85, 0.0, 1.0));
    color += specular;

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

    // Bigger swooping shapes — more like crumpled liquid than gentle dunes.
    const broad =
      Math.sin(x * 0.85 + seed) * 0.45 +
      Math.cos(y * 0.7 + seed * 1.4) * 0.4;

    // Tighter, sharper folds for the crinkled-foil feel of the reference.
    const folds =
      Math.sin(x * 2.6 + seed * 0.8) * 0.32 +
      Math.cos(y * 3.0 + seed * 1.3) * 0.28 +
      Math.sin((x + y) * 2.2 + seed * 0.6) * 0.24 +
      Math.cos((x - y) * 2.4 + seed * 1.1) * 0.2;

    // Higher-frequency ridges + cross-product micro-detail for chromatic
    // dispersion to land on.
    const ripple =
      Math.sin(x * 4.5 + y * 3.6 + seed) * 0.14 +
      Math.cos(x * 3.5 - y * 4.0 + seed * 1.2) * 0.11 +
      Math.sin(x * 6.0 + seed * 2.0) * Math.cos(y * 5.5 + seed) * 0.09 +
      Math.sin((x * 2.0 + y * 3.0) * 1.7 + seed * 0.9) *
        Math.cos((x - y) * 3.3 + seed) * 0.07;

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
      // Layered slow waves so the surface drifts like flowing liquid; the
      // higher-frequency term gives the chromatic ridges life.
      const wave =
        Math.sin(bx * 0.9 + t * 0.5) * 0.085 +
        Math.cos(by * 1.1 + t * 0.42) * 0.075 +
        Math.sin((bx + by) * 0.7 + t * 0.36) * 0.065 +
        Math.sin((bx - by) * 2.4 + t * 0.62) * 0.038 +
        Math.cos((bx * 1.6 - by * 0.8) * 1.4 + t * 0.28) * 0.045;
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
        position={[0, 0, -1.5]}
        rotation={[0.02, 0.02, -0.05]}
        size={[18, 12]}
        seed={1}
        speed={0.12}
        thicknessBase={400}
      />
      <GlassSheet
        position={[-1, 0.3, -0.4]}
        rotation={[-0.1, 0.15, -0.18]}
        size={[14, 10]}
        seed={4.2}
        speed={0.16}
        thicknessBase={550}
      />
      <GlassSheet
        position={[1.2, -0.2, 0.2]}
        rotation={[0.12, -0.12, 0.14]}
        size={[14, 10]}
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
      <div className="pointer-events-none fixed inset-0 bg-[#dfe1f2]" />
      <div className="pointer-events-none fixed inset-0">
        <GlassCanvas />
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
