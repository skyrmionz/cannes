/**
 * Server-side video renderer.
 *
 * Draws the vinyl record visualizer (matching the phone QR landing page / screen 11)
 * using node-canvas, pipes raw RGBA video + audio into FFmpeg,
 * and returns a 9:16 portrait MP4 suitable for Camera Roll.
 */

import { spawn } from "child_process";
import os from "os";
import path from "path";
import fs from "fs";
import { createCanvas, type CanvasRenderingContext2D as NodeCanvasCtx } from "canvas";

const W = 540;
const H = 960;
const FPS = 30;
const DURATION_S = 30;
const TOTAL_FRAMES = FPS * DURATION_S;

const N_BARS = 128;

// ── Demo frequency data (mirrors audio-reactive-streaks.tsx) ─────────────────

function getDemoFreq(i: number, t: number): number {
  const bass   = i < 8  ? 0.7 + 0.3  * Math.sin(t * 1.8 + i * 0.3) : 0;
  const mid    = i >= 8  && i < 40 ? 0.4 + 0.25 * Math.sin(t * 2.3 + i * 0.15) : 0;
  const treble = i >= 40 ? 0.15 + 0.1 * Math.sin(t * 3.1 + i * 0.08) : 0;
  const beat   = Math.max(0, Math.sin(t * 2.0)) * (i < 12 ? 0.4 : 0.1);
  return Math.min(1, (bass + mid + treble + beat) * (0.85 + 0.15 * Math.sin(t * 0.7 + i)));
}

function getFreqBars(demoT: number): Float32Array {
  const bars = new Float32Array(N_BARS);
  for (let i = 0; i < N_BARS; i++) bars[i] = getDemoFreq(i, demoT);
  return bars;
}

// ── Drawing helpers (mirror of audio-reactive-streaks.tsx) ───────────────────

function drawBackground(ctx: NodeCanvasCtx) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,    "#022AC0");
  grad.addColorStop(0.35, "#022AC0");
  grad.addColorStop(0.68, "#066AFE");
  grad.addColorStop(1,    "#00B3FF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawRecordBackground(ctx: NodeCanvasCtx, CX: number, CY: number) {
  const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, W * 0.55);
  bg.addColorStop(0,   "#0c1840");
  bg.addColorStop(0.5, "#08112e");
  bg.addColorStop(1,   "rgba(3,8,18,0)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(CX, CY, W * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawVinylRecord(ctx: NodeCanvasCtx, CX: number, CY: number, R: number, spin: number) {
  const TIRE_R     = R;
  const SIDEWALL_R = R * 0.895;
  const VINYL_R    = R * 0.820;
  const LABEL_R    = R * 0.298;

  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(spin);

  const tireGrad = ctx.createRadialGradient(0, 0, SIDEWALL_R, 0, 0, TIRE_R);
  tireGrad.addColorStop(0,   "#1a1a1a");
  tireGrad.addColorStop(0.5, "#0d0d0d");
  tireGrad.addColorStop(1,   "#2a2a2a");
  ctx.beginPath();
  ctx.arc(0, 0, TIRE_R, 0, Math.PI * 2);
  ctx.fillStyle = tireGrad;
  ctx.fill();

  const N_TREADS = 60;
  const cutW = (TIRE_R - SIDEWALL_R) * 0.82;
  for (let i = 0; i < N_TREADS; i++) {
    const a = (i / N_TREADS) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(SIDEWALL_R + 2, -2.5);
    ctx.lineTo(SIDEWALL_R + cutW, -2.5);
    ctx.lineTo(SIDEWALL_R + cutW,  2.5);
    ctx.lineTo(SIDEWALL_R + 2,  2.5);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fill();
    ctx.restore();
  }

  const vinylGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, SIDEWALL_R);
  vinylGrad.addColorStop(0,   "#1c1c1c");
  vinylGrad.addColorStop(0.3, "#111");
  vinylGrad.addColorStop(0.7, "#0a0a0a");
  vinylGrad.addColorStop(1,   "#151515");
  ctx.beginPath();
  ctx.arc(0, 0, SIDEWALL_R, 0, Math.PI * 2);
  ctx.fillStyle = vinylGrad;
  ctx.fill();

  for (let r = LABEL_R + 10; r < VINYL_R; r += 4.5) {
    const alpha = 0.07 + 0.05 * Math.sin(r * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  const sheen = ctx.createLinearGradient(-VINYL_R, -VINYL_R, VINYL_R * 0.4, VINYL_R * 0.4);
  sheen.addColorStop(0,   "rgba(255,255,255,0.07)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.00)");
  sheen.addColorStop(1,   "rgba(255,255,255,0.04)");
  ctx.beginPath();
  ctx.arc(0, 0, VINYL_R, 0, Math.PI * 2);
  ctx.fillStyle = sheen;
  ctx.fill();

  ctx.restore();

  // Center label — unrotated so text stays upright
  ctx.save();
  ctx.translate(CX, CY);

  const labelGrad = ctx.createRadialGradient(0, -8, 0, 0, 0, LABEL_R);
  labelGrad.addColorStop(0,   "#2255ff");
  labelGrad.addColorStop(0.5, "#1133cc");
  labelGrad.addColorStop(1,   "#091580");
  ctx.beginPath();
  ctx.arc(0, 0, LABEL_R, 0, Math.PI * 2);
  ctx.fillStyle = labelGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, LABEL_R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(100,180,255,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const hubGrad = ctx.createRadialGradient(-LABEL_R * 0.1, -LABEL_R * 0.1, 0, 0, 0, LABEL_R * 0.27);
  hubGrad.addColorStop(0,   "#e0e0e0");
  hubGrad.addColorStop(0.5, "#999");
  hubGrad.addColorStop(1,   "#555");
  ctx.beginPath();
  ctx.arc(0, 0, LABEL_R * 0.27, 0, Math.PI * 2);
  ctx.fillStyle = hubGrad;
  ctx.fill();

  const labelFs = LABEL_R * 0.27;
  ctx.fillStyle = "rgba(150,210,255,0.85)";
  ctx.font = `bold ${labelFs * 0.55}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Salesforce ✦ Beach", 0, -LABEL_R * 0.44);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${labelFs}px sans-serif`;
  ctx.fillText("Track", 0, -LABEL_R * 0.15);
  ctx.fillText("Star",  0,  LABEL_R * 0.18);

  ctx.restore();
}

function drawNeonRings(ctx: NodeCanvasCtx, CX: number, CY: number, R: number, bars: Float32Array) {
  let energy = 0;
  for (let i = 0; i < bars.length; i++) energy += bars[i];
  energy /= bars.length;
  const pulse = 0.6 + energy * 0.8;

  ctx.save();
  ctx.translate(CX, CY);

  ctx.beginPath();
  ctx.arc(0, 0, R + R * 0.037, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,220,255,${Math.min(1, 0.7 * pulse)})`;
  ctx.lineWidth   = 3;
  ctx.shadowColor = "#00ddff";
  ctx.shadowBlur  = 24 * pulse;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, R + R * 0.022, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(220,60,255,${Math.min(1, 0.6 * pulse)})`;
  ctx.lineWidth   = 2;
  ctx.shadowColor = "#dd3dff";
  ctx.shadowBlur  = 18 * pulse;
  ctx.stroke();

  ctx.restore();
  ctx.shadowBlur  = 0;
  ctx.shadowColor = "rgba(0,0,0,0)";
}

function drawFreqBars(ctx: NodeCanvasCtx, CX: number, CY: number, R: number, bars: Float32Array) {
  const BAR_INNER = R * 1.07;
  const BAR_MAX   = R * 0.41;

  ctx.save();
  ctx.translate(CX, CY);

  for (let i = 0; i < N_BARS; i++) {
    const theta = (i / N_BARS) * Math.PI * 2 - Math.PI / 2;
    const v     = Math.min(1, bars[i]);
    const barH  = v * BAR_MAX;

    const x1 = Math.cos(theta) * BAR_INNER;
    const y1 = Math.sin(theta) * BAR_INNER;
    const x2 = Math.cos(theta) * (BAR_INNER + barH);
    const y2 = Math.sin(theta) * (BAR_INNER + barH);

    const normAngle = ((theta + Math.PI / 2) / (Math.PI * 2) + 1) % 1;
    let r: number, g: number, b: number;
    if (normAngle < 0.5) {
      const tv = normAngle * 2;
      r = Math.round(tv * 220); g = Math.round(220 - tv * 160); b = 255;
    } else {
      const tv = (normAngle - 0.5) * 2;
      r = Math.round(220 - tv * 220); g = Math.round(60 + tv * 160); b = 255;
    }

    const baseAlpha = 0.5 + v * 0.5;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, `rgba(${r},${g},${b},${baseAlpha * 0.4})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${baseAlpha})`);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle  = grad;
    ctx.lineWidth    = (Math.PI * 2 * BAR_INNER / N_BARS) * 0.62;
    ctx.lineCap      = "round";
    ctx.shadowColor  = `rgba(${r},${g},${b},0.8)`;
    ctx.shadowBlur   = 8 + v * 10;
    ctx.stroke();
  }

  ctx.restore();
  ctx.shadowBlur  = 0;
  ctx.shadowColor = "rgba(0,0,0,0)";
}

function drawTonearm(ctx: NodeCanvasCtx, CX: number, CY: number, R: number, spin: number) {
  ctx.save();
  ctx.translate(CX, CY);

  const pivotX = R * 0.78;
  const pivotY = -R * 0.90;
  const sway     = Math.sin(spin * 0.5) * 0.04;
  const armAngle = 0.38 + sway;
  const armLen   = R * 0.85;
  const tipX = pivotX + Math.cos(Math.PI / 2 + armAngle) * armLen;
  const tipY = pivotY + Math.sin(Math.PI / 2 + armAngle) * armLen;

  ctx.beginPath();
  ctx.moveTo(pivotX + 2, pivotY + 2);
  ctx.lineTo(tipX + 2,   tipY + 2);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth   = 5;
  ctx.lineCap     = "round";
  ctx.stroke();

  const armGrad = ctx.createLinearGradient(pivotX, pivotY, tipX, tipY);
  armGrad.addColorStop(0,   "#d0d0d0");
  armGrad.addColorStop(0.3, "#888");
  armGrad.addColorStop(0.7, "#aaa");
  armGrad.addColorStop(1,   "#ccc");
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX,   tipY);
  ctx.strokeStyle = armGrad;
  ctx.lineWidth   = 4;
  ctx.lineCap     = "round";
  ctx.stroke();

  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(Math.PI / 2 + armAngle + 0.15);
  ctx.fillStyle   = "#2ae8ff";
  ctx.shadowColor = "#00ffee";
  ctx.shadowBlur  = 10;
  ctx.beginPath();
  ctx.rect(-4, -10, 8, 14);
  ctx.fill();
  ctx.fillStyle  = "#ffffff";
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(0,    4);
  ctx.lineTo(-2.5, -4);
  ctx.lineTo(2.5,  -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const pivGrad = ctx.createRadialGradient(pivotX - 3, pivotY - 3, 1, pivotX, pivotY, 12);
  pivGrad.addColorStop(0, "#f0f0f0");
  pivGrad.addColorStop(1, "#666");
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 10, 0, Math.PI * 2);
  ctx.fillStyle   = pivGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 10, 0, Math.PI * 2);
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawFrame(ctx: NodeCanvasCtx, t: number, angle: number, driverName: string) {
  // Record centered in upper ~60% of frame, text fills lower portion
  const CX = W / 2;
  const CY = H * 0.40;
  // R chosen so record + bars (R * 1.48) fits within W with a small margin
  const R  = W * 0.315;

  const demoT = t * 0.6;
  const bars  = getFreqBars(demoT);

  drawBackground(ctx);
  drawRecordBackground(ctx, CX, CY);
  drawFreqBars(ctx, CX, CY, R, bars);
  drawNeonRings(ctx, CX, CY, R, bars);
  drawVinylRecord(ctx, CX, CY, R, angle);
  drawTonearm(ctx, CX, CY, R, angle);

  // Text overlay matching screen 11
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur  = 16;
  ctx.textAlign   = "center";

  ctx.fillStyle    = "rgba(255,255,255,0.9)";
  ctx.font         = "bold 52px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("Your F1® Anthem", W / 2, H * 0.83);

  if (driverName) {
    ctx.font      = "28px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(`Made for ${driverName}`, W / 2, H * 0.89);
  }

  ctx.shadowBlur = 0;
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function renderVideoToMp4(
  audioBuffer: Buffer,
  audioMime: string,
  driverName: string,
): Promise<Buffer> {
  const tmpDir   = os.tmpdir();
  const audioExt = audioMime.includes("wav") ? "wav" : "mp3";
  const audioPath = path.join(tmpDir, `anthem-audio-${Date.now()}.${audioExt}`);
  const outPath   = path.join(tmpDir, `anthem-out-${Date.now()}.mp4`);
  fs.writeFileSync(audioPath, audioBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      const ff = spawn("ffmpeg", [
        "-y",
        "-f", "rawvideo",
        "-pix_fmt", "rgba",
        "-s", `${W}x${H}`,
        "-r", String(FPS),
        "-i", "pipe:0",
        "-i", audioPath,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", String(DURATION_S),
        "-movflags", "+faststart",
        outPath,
      ]);

      ff.stderr.on("data", () => {});
      ff.on("error", (err) => reject(new Error(`FFmpeg spawn failed: ${err.message}`)));
      ff.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });

      const canvas = createCanvas(W, H);
      const ctx    = canvas.getContext("2d") as NodeCanvasCtx;

      (async () => {
        try {
          let angle = 0;
          for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
            const t      = frame / FPS;
            const demoT  = t * 0.6;
            const bars   = getFreqBars(demoT);
            let avgEnergy = 0;
            for (let i = 0; i < bars.length; i++) avgEnergy += bars[i];
            avgEnergy /= bars.length;
            angle += 0.004 + avgEnergy * 0.008;

            ctx.clearRect(0, 0, W, H);
            drawFrame(ctx, t, angle, driverName);

            const rgba     = canvas.toBuffer("raw");
            const canWrite = ff.stdin.write(rgba);
            if (!canWrite) {
              await new Promise<void>((r) => ff.stdin.once("drain", r));
            }
          }
          ff.stdin.end();
        } catch (err) {
          ff.stdin.destroy();
          reject(err);
        }
      })();
    });

    return fs.readFileSync(outPath);
  } finally {
    try { fs.unlinkSync(audioPath); } catch { /* ignore */ }
    try { fs.unlinkSync(outPath);   } catch { /* ignore */ }
  }
}
