"use client";

/**
 * Exports a 30-second (3×10s loop) visualizer + song MP4 using WebCodecs.
 *
 * Flow:
 *   1. Fetch and decode the WAV into an AudioBuffer
 *   2. Offline-analyse frequency data at 30fps for 30s
 *   3. Encode each canvas frame via VideoEncoder
 *   4. Encode audio PCM via AudioEncoder
 *   5. Mux everything via mp4-muxer → Blob
 *   6. POST blob to /api/share/{code}/video for storage
 *
 * Requires Chrome 94+ (WebCodecs). Falls back gracefully on unsupported browsers.
 */

import { useCallback, useRef, useState } from "react";
import type { VisualizerHandle } from "@/components/f1/song-visualizer";

export type ExportStatus = "idle" | "encoding" | "uploading" | "done" | "error" | "unsupported";

interface UseVideoExportOptions {
  songUrl: string | null;
  shareCode: string | null;
  visualizerRef: React.RefObject<VisualizerHandle | null>;
  teamId: string;
  driverName: string;
}

const FPS = 30;
const DURATION_S = 30;   // 3 × 10s loops
const LOOP_S = 10;
const WIDTH = 540;
const HEIGHT = 540;
const VIDEO_BITRATE = 4_000_000;
const AUDIO_BITRATE = 128_000;
const SAMPLE_RATE = 44_100;

function supportsWebCodecs(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as unknown as { VideoEncoder?: unknown }).VideoEncoder === "function" &&
    typeof (window as unknown as { AudioEncoder?: unknown }).AudioEncoder === "function"
  );
}

export function useVideoExport({
  songUrl,
  shareCode,
  visualizerRef,
  teamId,
}: UseVideoExportOptions) {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0); // 0–100
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const abortRef = useRef(false);

  const startExport = useCallback(async () => {
    if (!songUrl || !shareCode) return;
    if (!supportsWebCodecs()) { setStatus("unsupported"); return; }

    abortRef.current = false;
    setStatus("encoding");
    setProgress(0);

    try {
      // 1. Fetch + decode audio
      const audioRes = await fetch(songUrl);
      const audioArrayBuffer = await audioRes.arrayBuffer();
      const audioCtx = new OfflineAudioContext(2, SAMPLE_RATE * DURATION_S, SAMPLE_RATE);
      const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer.slice(0));

      // 2. Offline frequency analysis at FPS
      const analyserCtx = new OfflineAudioContext(1, SAMPLE_RATE * DURATION_S, SAMPLE_RATE);
      const sourceNode = analyserCtx.createBufferSource();

      // Loop the audio 3 times
      const loopBuffer = analyserCtx.createBuffer(1, SAMPLE_RATE * DURATION_S, SAMPLE_RATE);
      const srcData = audioBuffer.getChannelData(0);
      const loopData = loopBuffer.getChannelData(0);
      const srcLen = Math.min(srcData.length, SAMPLE_RATE * LOOP_S);
      for (let rep = 0; rep < 3; rep++) {
        const offset = rep * SAMPLE_RATE * LOOP_S;
        for (let i = 0; i < srcLen && offset + i < loopData.length; i++) {
          loopData[offset + i] = srcData[i];
        }
      }
      sourceNode.buffer = loopBuffer;
      sourceNode.connect(analyserCtx.destination);
      sourceNode.start(0);
      await analyserCtx.startRendering();

      // Build freq snapshots by simulating analyser at each frame time
      const totalFrames = FPS * DURATION_S;
      const freqSnapshots: Uint8Array[] = [];
      const fftSize = 256;
      const binCount = fftSize / 2;

      for (let f = 0; f < totalFrames; f++) {
        const t = f / FPS;
        const tLoop = t % LOOP_S;
        const snap = new Uint8Array(binCount);
        // Sample audio amplitude around this timestamp as a proxy for freq
        const sampleStart = Math.floor(tLoop * SAMPLE_RATE);
        for (let bin = 0; bin < binCount; bin++) {
          const freq = (bin / binCount) * (SAMPLE_RATE / 2);
          const windowSize = Math.max(1, Math.round(SAMPLE_RATE / freq / 2)) || 64;
          let sum = 0;
          for (let s = sampleStart; s < sampleStart + windowSize && s < srcLen; s++) {
            sum += Math.abs(srcData[s]);
          }
          const avg = sum / windowSize;
          snap[bin] = Math.min(255, Math.round(avg * 512));
        }
        freqSnapshots.push(snap);
      }

      // 3. Set up mp4-muxer + VideoEncoder
      const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: { codec: "avc", width: WIDTH, height: HEIGHT },
        audio: { codec: "aac", sampleRate: SAMPLE_RATE, numberOfChannels: 1 },
        fastStart: "in-memory",
      });

      const encodedChunks: { chunk: EncodedVideoChunk; meta?: EncodedVideoChunkMetadata }[] = [];
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => encodedChunks.push({ chunk, meta }),
        error: (e) => { throw e; },
      });
      videoEncoder.configure({
        codec: "avc1.4d0028",
        width: WIDTH,
        height: HEIGHT,
        bitrate: VIDEO_BITRATE,
        framerate: FPS,
      });

      // 4. Render and encode each video frame
      const offscreen = new OffscreenCanvas(WIDTH, HEIGHT);
      const viz = visualizerRef.current;

      for (let f = 0; f < totalFrames; f++) {
        if (abortRef.current) throw new Error("aborted");
        const t = f / FPS;
        const freqData = freqSnapshots[f];

        // Ask the visualizer to draw into the on-screen canvas, then copy
        if (viz) {
          viz.drawFrame(t % LOOP_S, freqData);
          const srcCanvas = viz.canvas;
          if (srcCanvas) {
            const offCtx = offscreen.getContext("2d")!;
            offCtx.drawImage(srcCanvas, 0, 0, WIDTH, HEIGHT);
          }
        }

        const bitmap = await createImageBitmap(offscreen);
        const videoFrame = new VideoFrame(bitmap, {
          timestamp: Math.round((f / FPS) * 1_000_000),
          duration: Math.round(1_000_000 / FPS),
        });
        videoEncoder.encode(videoFrame, { keyFrame: f % (FPS * 2) === 0 });
        videoFrame.close();
        bitmap.close();

        setProgress(Math.round((f / totalFrames) * 75));
        // Yield to keep UI responsive
        if (f % 30 === 0) await new Promise((r) => setTimeout(r, 0));
      }

      await videoEncoder.flush();

      // Flush encoded video chunks to muxer
      for (const { chunk, meta } of encodedChunks) {
        muxer.addVideoChunk(chunk, meta);
      }

      // 5. Encode audio (mono, 30s loop)
      const audioChunks: EncodedAudioChunk[] = [];
      const audioEncoder = new AudioEncoder({
        output: (chunk) => audioChunks.push(chunk),
        error: (e) => { throw e; },
      });
      audioEncoder.configure({
        codec: "mp4a.40.2",
        sampleRate: SAMPLE_RATE,
        numberOfChannels: 1,
        bitrate: AUDIO_BITRATE,
      });

      const chunkSize = 1024;
      const monoData = loopBuffer.getChannelData(0);
      for (let i = 0; i < monoData.length; i += chunkSize) {
        const slice = monoData.slice(i, i + chunkSize);
        const f32 = new Float32Array(slice);
        const audioData = new AudioData({
          format: "f32",
          sampleRate: SAMPLE_RATE,
          numberOfFrames: f32.length,
          numberOfChannels: 1,
          timestamp: Math.round((i / SAMPLE_RATE) * 1_000_000),
          data: f32,
        });
        audioEncoder.encode(audioData);
        audioData.close();
      }
      await audioEncoder.flush();
      for (const chunk of audioChunks) {
        muxer.addAudioChunk(chunk);
      }

      muxer.finalize();
      const { buffer } = target;
      const mp4Blob = new Blob([buffer], { type: "video/mp4" });

      setProgress(80);

      // 6. Upload to server
      setStatus("uploading");
      const form = new FormData();
      form.append("video", mp4Blob, "anthem.mp4");
      const uploadRes = await fetch(`/api/share/${shareCode}/video`, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const localUrl = URL.createObjectURL(mp4Blob);
      setVideoUrl(localUrl);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      if ((err as Error).message === "aborted") {
        setStatus("idle");
      } else {
        console.error("Video export failed:", err);
        setStatus("error");
      }
    }
  }, [songUrl, shareCode, visualizerRef]);

  const cancel = useCallback(() => { abortRef.current = true; }, []);

  return { status, progress, videoUrl, startExport, cancel };
}
