// Reads a rendered soundtrack back and prints its shape, because you cannot
// hear the render and "it sounds fine" is not something you can assert.
//
//   node scripts/check-music.mjs public/music/foo.wav 0,3.7,7,11.2 tease,reveal,body,outro
//
// Per-section RMS and spectral centroid tell you what a listener would notice:
// whether the arc actually moves, which section is loudest, and whether the
// quiet passage before a reveal is genuinely quiet. A flat column of numbers is
// a flat-sounding track.
import { readFileSync } from "node:fs";

const [file, cutsArg, namesArg] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/check-music.mjs <wav> [cuts,csv] [names,csv]");
  process.exit(1);
}

const buf = readFileSync(file);
// Minimal 16-bit PCM WAV reader — enough for what synth.mjs writes.
const channels = buf.readUInt16LE(22);
const rate = buf.readUInt32LE(24);
let pos = 12;
let data = null;
while (pos < buf.length - 8) {
  const id = buf.toString("ascii", pos, pos + 4);
  const size = buf.readUInt32LE(pos + 4);
  if (id === "data") {
    data = buf.subarray(pos + 8, pos + 8 + size);
    break;
  }
  pos += 8 + size + (size % 2);
}
if (!data) throw new Error(`no data chunk in ${file}`);

const frames = data.length / 2 / channels;
const mono = new Float32Array(frames);
for (let i = 0; i < frames; i++) {
  let sum = 0;
  for (let c = 0; c < channels; c++) sum += data.readInt16LE((i * channels + c) * 2) / 32768;
  mono[i] = sum / channels;
}
const duration = frames / rate;

const cuts = cutsArg ? cutsArg.split(",").map(Number) : [0];
const bounds = [...new Set([0, ...cuts, duration])].sort((a, b) => a - b);
const names = namesArg ? namesArg.split(",") : [];

const centroid = (slice) => {
  // Coarse spectral centroid via zero-crossing rate — no FFT needed to tell a
  // bright section from a dark one, which is all this has to do.
  let crossings = 0;
  for (let i = 1; i < slice.length; i++) {
    if ((slice[i - 1] < 0) !== (slice[i] < 0)) crossings++;
  }
  return (crossings * rate) / (2 * slice.length);
};

console.log(`${file}  ${duration.toFixed(2)}s  ${rate}Hz  ${channels}ch\n`);
const rows = [];
for (let i = 0; i < bounds.length - 1; i++) {
  const slice = mono.subarray(Math.floor(bounds[i] * rate), Math.floor(bounds[i + 1] * rate));
  if (!slice.length) continue;
  let sq = 0;
  for (const v of slice) sq += v * v;
  const db = 20 * Math.log10(Math.max(Math.sqrt(sq / slice.length), 1e-6));
  rows.push({ name: names[i] ?? `${bounds[i].toFixed(1)}s`, db, hz: centroid(slice) });
}

const peak = mono.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
for (const r of rows) {
  const bar = "#".repeat(Math.max(0, Math.round((r.db + 30) / 0.8)));
  console.log(`${r.name.padEnd(14)}${r.db.toFixed(1).padStart(6)} dB  ${String(Math.round(r.hz)).padStart(5)} Hz  ${bar}`);
}

const levels = rows.map((r) => r.db);
const spread = Math.max(...levels) - Math.min(...levels);
const step =
  levels.slice(1).reduce((a, v, i) => a + Math.abs(v - levels[i]), 0) /
  Math.max(1, levels.length - 1);
console.log(`\npeak ${peak.toFixed(3)}   range ${spread.toFixed(1)} dB   avg change per section ${step.toFixed(1)} dB`);
console.log(`loudest ${rows[levels.indexOf(Math.max(...levels))].name}   quietest ${rows[levels.indexOf(Math.min(...levels))].name}`);
if (spread < 6) console.log("\nrange under 6 dB — the arc is probably too flat to hear");
if (peak > 0.99) console.log("\npeak at full scale — likely clipping");
