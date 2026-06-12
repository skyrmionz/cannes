"use client";

import { useEffect, useRef } from "react";

interface Props {
  audioElement?: HTMLAudioElement | null;
  analyserNode?: AnalyserNode | null;
  reverbWet?: number;
}

export function AudioReactiveStreaks({ audioElement, analyserNode, reverbWet = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  const reverbWetRef = useRef(reverbWet);
  useEffect(() => { reverbWetRef.current = reverbWet; }, [reverbWet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle    = 0;
    let demoT    = 0;
    let playing  = false;

    // ── Sizes (relative to canvas half-width) ──────────────────────────────
    // All radii are computed fresh each frame so the record scales with canvas size.

    const freqData = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;
    const N_BARS   = 128;

    function getDemoFreq(i: number): number {
      const t    = demoT;
      const bass   = i < 8  ? 0.7 + 0.3  * Math.sin(t * 1.8 + i * 0.3) : 0;
      const mid    = i >= 8  && i < 40 ? 0.4 + 0.25 * Math.sin(t * 2.3 + i * 0.15) : 0;
      const treble = i >= 40 ? 0.15 + 0.1 * Math.sin(t * 3.1 + i * 0.08) : 0;
      const beat   = Math.max(0, Math.sin(t * 2.0)) * (i < 12 ? 0.4 : 0.1);
      return Math.min(1, (bass + mid + treble + beat) * (0.85 + 0.15 * Math.sin(t * 0.7 + i)));
    }

    function getFreqBars(): Float32Array {
      const bars = new Float32Array(N_BARS);
      if (analyserNode && freqData) {
        analyserNode.getByteFrequencyData(freqData);
        for (let i = 0; i < N_BARS; i++) {
          const idx = Math.floor(i * freqData.length / N_BARS);
          bars[i] = freqData[idx] / 255;
        }
      } else {
        for (let i = 0; i < N_BARS; i++) bars[i] = getDemoFreq(i);
      }
      return bars;
    }

    // ── Drawing ────────────────────────────────────────────────────────────

    function drawBackground(W: number, H: number) {
      ctx!.clearRect(0, 0, W, H);
      // Subtle dark glow behind the record only — fades to transparent at canvas edge
      const bg = ctx!.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.52);
      bg.addColorStop(0,   "rgba(8,18,52,0.85)");
      bg.addColorStop(0.6, "rgba(5,11,32,0.55)");
      bg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, W, H);
    }

    function drawVinylRecord(CX: number, CY: number, R: number, spin: number) {
      const TIRE_R     = R;
      const SIDEWALL_R = R * 0.895;
      const VINYL_R    = R * 0.820;
      const LABEL_R    = R * 0.298;

      ctx!.save();
      ctx!.translate(CX, CY);
      ctx!.rotate(spin);

      // ── Outer tire ────────────────────────────────────────────────────
      const tireGrad = ctx!.createRadialGradient(0, 0, SIDEWALL_R, 0, 0, TIRE_R);
      tireGrad.addColorStop(0,   "#1a1a1a");
      tireGrad.addColorStop(0.5, "#0d0d0d");
      tireGrad.addColorStop(1,   "#2a2a2a");
      ctx!.beginPath();
      ctx!.arc(0, 0, TIRE_R, 0, Math.PI * 2);
      ctx!.fillStyle = tireGrad;
      ctx!.fill();

      // Tread cuts
      const N_TREADS = 60;
      const cutW = (TIRE_R - SIDEWALL_R) * 0.82;
      for (let i = 0; i < N_TREADS; i++) {
        const a = (i / N_TREADS) * Math.PI * 2;
        ctx!.save();
        ctx!.rotate(a);
        ctx!.beginPath();
        ctx!.moveTo(SIDEWALL_R + 2, -2.5);
        ctx!.lineTo(SIDEWALL_R + cutW, -2.5);
        ctx!.lineTo(SIDEWALL_R + cutW,  2.5);
        ctx!.lineTo(SIDEWALL_R + 2,  2.5);
        ctx!.closePath();
        ctx!.fillStyle = "rgba(0,0,0,0.7)";
        ctx!.fill();
        ctx!.restore();
      }

      // ── Vinyl surface ─────────────────────────────────────────────────
      const vinylGrad = ctx!.createRadialGradient(0, 0, 0, 0, 0, SIDEWALL_R);
      vinylGrad.addColorStop(0,   "#1c1c1c");
      vinylGrad.addColorStop(0.3, "#111");
      vinylGrad.addColorStop(0.7, "#0a0a0a");
      vinylGrad.addColorStop(1,   "#151515");
      ctx!.beginPath();
      ctx!.arc(0, 0, SIDEWALL_R, 0, Math.PI * 2);
      ctx!.fillStyle = vinylGrad;
      ctx!.fill();

      // Grooves
      for (let r = LABEL_R + 10; r < VINYL_R; r += 4.5) {
        const alpha = 0.07 + 0.05 * Math.sin(r * 0.4);
        ctx!.beginPath();
        ctx!.arc(0, 0, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      // Sheen
      const sheen = ctx!.createLinearGradient(-VINYL_R, -VINYL_R, VINYL_R * 0.4, VINYL_R * 0.4);
      sheen.addColorStop(0,   "rgba(255,255,255,0.07)");
      sheen.addColorStop(0.5, "rgba(255,255,255,0.00)");
      sheen.addColorStop(1,   "rgba(255,255,255,0.04)");
      ctx!.beginPath();
      ctx!.arc(0, 0, VINYL_R, 0, Math.PI * 2);
      ctx!.fillStyle = sheen;
      ctx!.fill();

      ctx!.restore();

      // ── Center label (drawn unrotated so text stays upright) ──────────
      ctx!.save();
      ctx!.translate(CX, CY);

      const labelGrad = ctx!.createRadialGradient(0, -8, 0, 0, 0, LABEL_R);
      labelGrad.addColorStop(0,   "#2255ff");
      labelGrad.addColorStop(0.5, "#1133cc");
      labelGrad.addColorStop(1,   "#091580");
      ctx!.beginPath();
      ctx!.arc(0, 0, LABEL_R, 0, Math.PI * 2);
      ctx!.fillStyle = labelGrad;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(0, 0, LABEL_R, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(100,180,255,0.6)";
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // Hub
      const hubGrad = ctx!.createRadialGradient(-LABEL_R*0.1, -LABEL_R*0.1, 0, 0, 0, LABEL_R * 0.27);
      hubGrad.addColorStop(0,   "#e0e0e0");
      hubGrad.addColorStop(0.5, "#999");
      hubGrad.addColorStop(1,   "#555");
      ctx!.beginPath();
      ctx!.arc(0, 0, LABEL_R * 0.27, 0, Math.PI * 2);
      ctx!.fillStyle = hubGrad;
      ctx!.fill();

      // Label text
      const fs = LABEL_R * 0.27;
      ctx!.fillStyle = "rgba(150,210,255,0.85)";
      ctx!.font = `bold ${fs * 0.55}px sans-serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText("Salesforce ✦ Beach", 0, -LABEL_R * 0.44);

      ctx!.fillStyle = "#ffffff";
      ctx!.font = `bold ${fs}px sans-serif`;
      ctx!.fillText("Track", 0, -LABEL_R * 0.15);
      ctx!.fillText("Star",  0,  LABEL_R * 0.18);

      ctx!.restore();
    }

    function drawNeonRings(CX: number, CY: number, R: number, bars: Float32Array) {
      let energy = 0;
      for (let i = 0; i < bars.length; i++) energy += bars[i];
      energy /= bars.length;
      const wet    = reverbWetRef.current;
      const pulse  = (0.6 + energy * 0.8) * (1 + wet * 0.3);

      ctx!.save();
      ctx!.translate(CX, CY);

      ctx!.beginPath();
      ctx!.arc(0, 0, R + R * 0.037, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(0,220,255,${Math.min(1, 0.7 * pulse)})`;
      ctx!.lineWidth   = 3;
      ctx!.shadowColor = "#00ddff";
      ctx!.shadowBlur  = 24 * pulse;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(0, 0, R + R * 0.022, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(220,60,255,${Math.min(1, 0.6 * pulse)})`;
      ctx!.lineWidth   = 2;
      ctx!.shadowColor = "#dd3dff";
      ctx!.shadowBlur  = 18 * pulse;
      ctx!.stroke();

      ctx!.restore();
      ctx!.shadowBlur  = 0;
      ctx!.shadowColor = "transparent";
    }

    function drawFreqBars(CX: number, CY: number, R: number, bars: Float32Array) {
      const BAR_INNER = R * 1.07;
      const BAR_MAX   = R * 0.41;
      const wet       = reverbWetRef.current;

      ctx!.save();
      ctx!.translate(CX, CY);

      for (let i = 0; i < N_BARS; i++) {
        const theta = (i / N_BARS) * Math.PI * 2 - Math.PI / 2;
        const v     = Math.min(1, bars[i] * (1 + wet * 0.45));
        const barH  = v * BAR_MAX;

        const x1 = Math.cos(theta) * BAR_INNER;
        const y1 = Math.sin(theta) * BAR_INNER;
        const x2 = Math.cos(theta) * (BAR_INNER + barH);
        const y2 = Math.sin(theta) * (BAR_INNER + barH);

        const normAngle = ((theta + Math.PI / 2) / (Math.PI * 2) + 1) % 1;
        let r: number, g: number, b: number;
        if (normAngle < 0.5) {
          const t = normAngle * 2;
          r = Math.round(t * 220); g = Math.round(220 - t * 160); b = 255;
        } else {
          const t = (normAngle - 0.5) * 2;
          r = Math.round(220 - t * 220); g = Math.round(60 + t * 160); b = 255;
        }

        const baseAlpha = 0.5 + v * 0.5;
        const grad = ctx!.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${r},${g},${b},${baseAlpha * 0.4})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${baseAlpha})`);

        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.strokeStyle  = grad;
        ctx!.lineWidth    = (Math.PI * 2 * BAR_INNER / N_BARS) * 0.62;
        ctx!.lineCap      = "round";
        ctx!.shadowColor  = `rgba(${r},${g},${b},0.8)`;
        ctx!.shadowBlur   = 8 + v * 10;
        ctx!.stroke();
      }

      ctx!.restore();
      ctx!.shadowBlur  = 0;
      ctx!.shadowColor = "transparent";
    }

    function drawTonearm(CX: number, CY: number, R: number, spin: number) {
      ctx!.save();
      ctx!.translate(CX, CY);

      const pivotX = R * 0.78;
      const pivotY = -R * 0.90;
      const sway      = Math.sin(spin * 0.5) * 0.04;
      const armAngle  = 0.38 + sway;
      const armLength = R * 0.85;
      const tipX = pivotX + Math.cos(Math.PI / 2 + armAngle) * armLength;
      const tipY = pivotY + Math.sin(Math.PI / 2 + armAngle) * armLength;

      // Shadow
      ctx!.beginPath();
      ctx!.moveTo(pivotX + 2, pivotY + 2);
      ctx!.lineTo(tipX + 2, tipY + 2);
      ctx!.strokeStyle = "rgba(0,0,0,0.5)";
      ctx!.lineWidth   = 5;
      ctx!.lineCap     = "round";
      ctx!.stroke();

      // Arm
      const armGrad = ctx!.createLinearGradient(pivotX, pivotY, tipX, tipY);
      armGrad.addColorStop(0,   "#d0d0d0");
      armGrad.addColorStop(0.3, "#888");
      armGrad.addColorStop(0.7, "#aaa");
      armGrad.addColorStop(1,   "#ccc");
      ctx!.beginPath();
      ctx!.moveTo(pivotX, pivotY);
      ctx!.lineTo(tipX, tipY);
      ctx!.strokeStyle = armGrad;
      ctx!.lineWidth   = 4;
      ctx!.lineCap     = "round";
      ctx!.stroke();

      // Cartridge
      ctx!.save();
      ctx!.translate(tipX, tipY);
      ctx!.rotate(Math.PI / 2 + armAngle + 0.15);
      ctx!.fillStyle  = "#2ae8ff";
      ctx!.shadowColor = "#00ffee";
      ctx!.shadowBlur  = 10;
      ctx!.beginPath();
      ctx!.rect(-4, -10, 8, 14);
      ctx!.fill();
      ctx!.fillStyle = "#ffffff";
      ctx!.shadowBlur = 0;
      ctx!.beginPath();
      ctx!.moveTo(0, 4);
      ctx!.lineTo(-2.5, -4);
      ctx!.lineTo(2.5, -4);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();

      // Pivot ball
      const pivGrad = ctx!.createRadialGradient(pivotX - 3, pivotY - 3, 1, pivotX, pivotY, 12);
      pivGrad.addColorStop(0, "#f0f0f0");
      pivGrad.addColorStop(1, "#666");
      ctx!.beginPath();
      ctx!.arc(pivotX, pivotY, 10, 0, Math.PI * 2);
      ctx!.fillStyle   = pivGrad;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(pivotX, pivotY, 10, 0, Math.PI * 2);
      ctx!.strokeStyle = "#aaa";
      ctx!.lineWidth   = 1.5;
      ctx!.stroke();

      ctx!.restore();
    }

    // ── Resize ──────────────────────────────────────────────────────────────
    function resize() {
      const size = canvas!.offsetWidth;
      canvas!.width  = size * devicePixelRatio;
      canvas!.height = size * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // ── Animation loop ──────────────────────────────────────────────────────
    function frame() {
      const size = canvas!.offsetWidth;
      const W    = size;
      const H    = size;
      const CX   = W / 2;
      const CY   = H / 2;
      // Record radius = 40% of canvas width, leaving room for bars + neon
      const R    = W * 0.375;

      drawBackground(W, H);

      const bars = getFreqBars();
      let avgEnergy = 0;
      for (let i = 0; i < bars.length; i++) avgEnergy += bars[i];
      avgEnergy /= bars.length;

      const spinSpeed = 0.004 + avgEnergy * 0.008;
      if (playing || !analyserNode) angle += spinSpeed;

      drawFreqBars(CX, CY, R, bars);
      drawNeonRings(CX, CY, R, bars);
      drawVinylRecord(CX, CY, R, angle);
      drawTonearm(CX, CY, R, angle);

      demoT += 0.025;

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    // ── Audio events ────────────────────────────────────────────────────────
    const onPlay  = () => { playing = true; };
    const onPause = () => { playing = false; };
    const onEnded = () => { playing = false; };

    if (audioElement) {
      audioElement.addEventListener("play",  onPlay);
      audioElement.addEventListener("pause", onPause);
      audioElement.addEventListener("ended", onEnded);
      if (!audioElement.paused) playing = true;
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (audioElement) {
        audioElement.removeEventListener("play",  onPlay);
        audioElement.removeEventListener("pause", onPause);
        audioElement.removeEventListener("ended", onEnded);
      }
    };
  }, [audioElement, analyserNode]);

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
