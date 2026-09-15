// Shared synth voices for the video soundtracks (music-mcp-launch.mjs, music-release.mjs).
// Everything is generated from code with a seeded noise source: no samples, no third-party
// audio, identical output on every run. 120 BPM-friendly, A minor (Am–F–C–G), one chord per bar.
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

export const SR = 44100;

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const lerp = (a, b, x) => a + (b - a) * Math.max(0, Math.min(1, x));
const lpCoef = (fc) => 1 - Math.exp((-2 * Math.PI * Math.min(fc, SR * 0.45)) / SR);

const CHORDS = [
	{bass: 33, pad: [57, 60, 64], arp: [69, 72, 76, 81]}, // Am
	{bass: 29, pad: [53, 57, 60], arp: [65, 69, 72, 77]}, // F
	{bass: 36, pad: [55, 60, 64], arp: [72, 76, 79, 84]}, // C
	{bass: 31, pad: [55, 59, 62], arp: [67, 71, 74, 79]}, // G
];

export function createSynth(duration, beat) {
	const N = Math.ceil(duration * SR);
	const L = new Float32Array(N);
	const R = new Float32Array(N);

	let seed = 0x9e3779b9;
	const rand = () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const noise = () => rand() * 2 - 1;
	const chordAt = (t) => CHORDS[Math.floor(t / (4 * beat)) % 4];

	const write = (i, l, r) => {
		if (i >= 0 && i < N) {
			L[i] += l;
			R[i] += r;
		}
	};

	// ------------------------------------------------------------ one-shots

	function kick(t0, gain = 1) {
		const s = Math.round(t0 * SR);
		let phase = 0;
		for (let i = 0; i < 0.45 * SR; i++) {
			const t = i / SR;
			phase += (2 * Math.PI * (44 + 120 * Math.exp(-t / 0.03))) / SR;
			const click = i < 250 ? noise() * (1 - i / 250) * 0.25 : 0;
			const v = (Math.tanh(2 * Math.sin(phase)) * Math.exp(-t / 0.17) * 0.9 + click) * gain;
			write(s + i, v, v);
		}
	}

	function boom(t0, gain = 1) {
		const s = Math.round(t0 * SR);
		let phase = 0;
		for (let i = 0; i < 1.6 * SR; i++) {
			const t = i / SR;
			phase += (2 * Math.PI * (38 + 40 * Math.exp(-t / 0.08))) / SR;
			const v = Math.sin(phase) * Math.exp(-t / 0.55) * gain;
			write(s + i, v, v);
		}
	}

	function clap(t0, gain = 1) {
		const s = Math.round(t0 * SR);
		let lpL = 0;
		let lpR = 0;
		let phase = 0;
		for (let i = 0; i < 0.3 * SR; i++) {
			const t = i / SR;
			const bursts = t < 0.03 ? Math.exp(-((t % 0.01) / 0.003)) : Math.exp(-(t - 0.03) / 0.11);
			const nL = noise();
			const nR = noise();
			lpL += lpCoef(1200) * (nL - lpL);
			lpR += lpCoef(1200) * (nR - lpR);
			phase += (2 * Math.PI * 185) / SR;
			const tone = Math.sin(phase) * Math.exp(-t / 0.04) * 0.3;
			write(s + i, ((nL - lpL) * bursts * 0.55 + tone) * gain, ((nR - lpR) * bursts * 0.55 + tone) * gain);
		}
	}

	function hat(t0, gain = 1, decay = 0.035, pan = 0) {
		const s = Math.round(t0 * SR);
		let lp = 0;
		for (let i = 0; i < decay * 8 * SR; i++) {
			const n = noise();
			lp += lpCoef(7000) * (n - lp);
			const v = (n - lp) * Math.exp(-i / SR / decay) * gain;
			write(s + i, v * (1 - pan), v * (1 + pan));
		}
	}

	function crash(t0, gain = 1) {
		const s = Math.round(t0 * SR);
		let lpL = 0;
		let lpR = 0;
		for (let i = 0; i < 2.2 * SR; i++) {
			const env = Math.exp(-i / SR / 0.7) * gain;
			const nL = noise();
			const nR = noise();
			lpL += lpCoef(3500) * (nL - lpL);
			lpR += lpCoef(3500) * (nR - lpR);
			write(s + i, (nL - lpL) * env * 0.5, (nR - lpR) * env * 0.5);
		}
	}

	function riser(t0, t1, gain = 1) {
		const s = Math.round(t0 * SR);
		const len = Math.round((t1 - t0) * SR);
		let lpL = 0;
		let lpR = 0;
		let phase = 0;
		for (let i = 0; i < len; i++) {
			const x = i / len;
			const fc = 300 * Math.pow(30, x);
			lpL += lpCoef(fc) * (noise() - lpL);
			lpR += lpCoef(fc) * (noise() - lpR);
			phase += (2 * Math.PI * (180 + 900 * x * x)) / SR;
			const tone = Math.sin(phase) * 0.15;
			const env = x * x * gain;
			write(s + i, (lpL * 1.6 + tone) * env, (lpR * 1.6 + tone) * env);
		}
	}

	// snare roll that doubles its speed halfway to `end`
	function roll(start, end, peak = 0.45) {
		const len = end - start;
		for (let t = start; t < end - 1e-9; ) {
			const x = (t - start) / len;
			clap(t, lerp(0.08, peak, x));
			t += x < 0.5 ? len / 8 : len / 16;
		}
	}

	// ------------------------------------------------------------ continuous voices

	// detuned saw pad through a two-pole low-pass; gain(t) and cutoff(t) shape the arrangement
	function pad({gain, cutoff, duck}) {
		const phases = new Float64Array(6);
		let a1L = 0, a2L = 0, a1R = 0, a2R = 0;
		for (let i = 0; i < N; i++) {
			const t = i / SR;
			const g = gain(t);
			const fc = cutoff(t);
			const notes = chordAt(t).pad;
			let sL = 0;
			let sR = 0;
			for (let v = 0; v < 6; v++) {
				const detune = v % 2 === 0 ? 0.993 : 1.007;
				phases[v] = (phases[v] + (mtof(notes[Math.floor(v / 2)]) * detune) / SR) % 1;
				const saw = phases[v] * 2 - 1;
				if (v % 2 === 0) sL += saw;
				else sR += saw;
			}
			const c = lpCoef(fc);
			a1L += c * (sL - a1L);
			a2L += c * (a1L - a2L);
			a1R += c * (sR - a1R);
			a2R += c * (a1R - a2R);
			const d = 0.55 + 0.45 * duck(t);
			L[i] += a2L * g * 0.22 * d;
			R[i] += a2R * g * 0.22 * d;
		}
	}

	// pumping eighth-note bass from `start`, a sustained root from `sustainFrom`
	function bass({start, sustainFrom, gain, duck}) {
		let phase = 0;
		let sub = 0;
		let lp = 0;
		for (let i = 0; i < N; i++) {
			const t = i / SR;
			if (t < start) continue;
			const f = mtof(chordAt(t).bass + 12);
			phase = (phase + f / SR) % 1;
			sub = (sub + f / 2 / SR) % 1;
			const osc = (phase * 2 - 1) * 0.6 + Math.sin(sub * 2 * Math.PI) * 0.8;
			const env = t < sustainFrom ? Math.exp(-(t % (beat / 2)) / 0.13) : 0.6;
			const g = gain(t);
			lp += lpCoef(180 + 1100 * env) * (osc - lp);
			const v = lp * g * env * duck(t);
			L[i] += v;
			R[i] += v;
		}
	}

	// sixteenth-note arpeggio with a ping-pong delay; lift(t, step) transposes in semitones
	function arp({start, gain, lift}) {
		const dry = new Float32Array(N);
		let phase = 0;
		let lp = 0;
		const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
		for (let i = 0; i < N; i++) {
			const t = i / SR;
			if (t < start) continue;
			const k = Math.floor(t / (beat / 4));
			const f = mtof(chordAt(t).arp[pattern[k % 8]] + lift(t, k));
			phase = (phase + f / SR) % 1;
			const env = Math.exp(-(t % (beat / 4)) / 0.07);
			const osc = (phase < 0.5 ? 0.6 : -0.6) + (phase * 2 - 1) * 0.4;
			lp += lpCoef(900 + 3800 * env) * (osc - lp);
			dry[i] = lp * env * gain(t);
		}
		const D = Math.round(0.375 * SR);
		const a = new Float32Array(N);
		const b = new Float32Array(N);
		for (let i = 0; i < N; i++) {
			a[i] = dry[i] + (i >= D ? 0.5 * b[i - D] : 0);
			b[i] = i >= D ? a[i - D] : 0;
			L[i] += dry[i] + 0.35 * (a[i] - dry[i]);
			R[i] += dry[i] + 0.35 * b[i];
		}
	}

	// ------------------------------------------------------------ master

	function save(url, fadeOut = 0.7) {
		let peak = 0;
		for (let i = 0; i < N; i++) {
			const t = i / SR;
			const fade = Math.min(1, i / 220) * (t > duration - fadeOut ? lerp(1, 0, (t - (duration - fadeOut)) / fadeOut) : 1);
			L[i] = Math.tanh(L[i] * 1.1) * fade;
			R[i] = Math.tanh(R[i] * 1.1) * fade;
			peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
		}
		const norm = 0.89 / peak;
		const buf = Buffer.alloc(44 + N * 4);
		buf.write('RIFF', 0);
		buf.writeUInt32LE(36 + N * 4, 4);
		buf.write('WAVEfmt ', 8);
		buf.writeUInt32LE(16, 16);
		buf.writeUInt16LE(1, 20);
		buf.writeUInt16LE(2, 22);
		buf.writeUInt32LE(SR, 24);
		buf.writeUInt32LE(SR * 4, 28);
		buf.writeUInt16LE(4, 32);
		buf.writeUInt16LE(16, 34);
		buf.write('data', 36);
		buf.writeUInt32LE(N * 4, 40);
		for (let i = 0; i < N; i++) {
			buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
			buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
		}
		const path = fileURLToPath(url);
		mkdirSync(dirname(path), {recursive: true});
		writeFileSync(path, buf);
		console.log(`wrote ${path} (${duration}s, peak ${peak.toFixed(2)} -> normalized)`);
	}

	return {kick, boom, clap, hat, crash, riser, roll, pad, bass, arp, save};
}
