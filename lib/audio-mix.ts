/**
 * Pure-Node WAV mixer — no native deps, no ffmpeg.
 *
 * Reads a 16-bit PCM WAV stem and a 16-bit PCM WAV commentary clip,
 * mixes the commentary in at a given offset (seconds), and returns
 * the blended WAV as a Buffer.
 *
 * If either buffer is malformed the stem is returned untouched.
 */

interface WavInfo {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  dataOffset: number;  // byte offset of first PCM sample in the buffer
  dataLength: number;  // byte length of PCM data
}

function parseWav(buf: Buffer): WavInfo | null {
  try {
    if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
    if (buf.toString("ascii", 8, 12) !== "WAVE") return null;

    let offset = 12;
    let dataOffset = -1;
    let dataLength = 0;
    let numChannels = 2;
    let sampleRate = 44100;
    let bitsPerSample = 16;

    while (offset + 8 <= buf.length) {
      const chunkId = buf.toString("ascii", offset, offset + 4);
      const chunkSize = buf.readUInt32LE(offset + 4);

      if (chunkId === "fmt ") {
        numChannels  = buf.readUInt16LE(offset + 10);
        sampleRate   = buf.readUInt32LE(offset + 12);
        bitsPerSample = buf.readUInt16LE(offset + 22);
      } else if (chunkId === "data") {
        dataOffset = offset + 8;
        dataLength = chunkSize;
        break;
      }
      offset += 8 + chunkSize;
      if (chunkSize % 2 !== 0) offset++; // RIFF padding
    }

    if (dataOffset < 0) return null;
    return { sampleRate, numChannels, bitsPerSample, dataOffset, dataLength };
  } catch {
    return null;
  }
}

function writeWavHeader(
  buf: Buffer,
  dataLength: number,
  numChannels: number,
  sampleRate: number,
  bitsPerSample: number,
): void {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + dataLength, 4);
  buf.write("WAVE", 8, "ascii");
  buf.write("fmt ", 12, "ascii");
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);           // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(dataLength, 40);
}

/**
 * Mix commentaryWav into stemWav starting at offsetSeconds.
 * commentary is attenuated to commentaryGain (0–1, default 0.85).
 * stem is attenuated to stemGain (0–1, default 0.90) only under commentary.
 * Returns a new WAV Buffer.
 */
export function mixCommentaryIntoStem(
  stemWav: Buffer,
  commentaryWav: Buffer,
  offsetSeconds: number,
  commentaryGain = 0.85,
  stemDuckGain = 0.75,
): Buffer {
  const stem = parseWav(stemWav);
  const comm = parseWav(commentaryWav);

  if (!stem || !comm || stem.bitsPerSample !== 16 || comm.bitsPerSample !== 16) {
    return stemWav; // graceful fallback: return stem untouched
  }

  const { sampleRate, numChannels } = stem;
  const bytesPerSample = 2; // 16-bit
  const frameSize = numChannels * bytesPerSample;

  const stemFrames  = Math.floor(stem.dataLength / frameSize);
  const commFrames  = Math.floor(comm.dataLength / frameSize);
  const offsetFrames = Math.round(offsetSeconds * sampleRate);

  // Output length = stem length (commentary that runs past the end is clipped)
  const outData = Buffer.allocUnsafe(stem.dataLength);
  // Copy stem PCM verbatim first
  stemWav.copy(outData, 0, stem.dataOffset, stem.dataOffset + stem.dataLength);

  // Resample commentary to stem sampleRate if needed (simple nearest-neighbour)
  const commRatio = comm.sampleRate / sampleRate;

  for (let f = 0; f < commFrames; f++) {
    const outFrame = offsetFrames + f;
    if (outFrame >= stemFrames) break;

    // Source frame in commentary (handles basic rate mismatch)
    const srcFrame = Math.round(f * commRatio);
    if (srcFrame >= Math.floor(comm.dataLength / (comm.numChannels * bytesPerSample))) break;

    for (let ch = 0; ch < numChannels; ch++) {
      const outBytePos = outFrame * frameSize + ch * bytesPerSample;

      // Read stem sample
      const stemSample = outData.readInt16LE(outBytePos);

      // Read commentary sample (mono → duplicate channel if needed)
      const commCh = Math.min(ch, comm.numChannels - 1);
      const commBytePos = comm.dataOffset + srcFrame * comm.numChannels * bytesPerSample + commCh * bytesPerSample;
      const commSample = commentaryWav.readInt16LE(commBytePos);

      // Duck stem under commentary, add commentary
      const mixed = Math.round(stemSample * stemDuckGain + commSample * commentaryGain);
      // Clamp to int16
      const clamped = Math.max(-32768, Math.min(32767, mixed));
      outData.writeInt16LE(clamped, outBytePos);
    }
  }

  const header = Buffer.allocUnsafe(44);
  writeWavHeader(header, outData.length, numChannels, sampleRate, 16);
  return Buffer.concat([header, outData]);
}
