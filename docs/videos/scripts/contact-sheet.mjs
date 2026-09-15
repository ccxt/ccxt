// Frame grid for reviewing a render without watching it: samples evenly spaced frames (or the
// timestamps passed with --at) into one 2-column PNG next to the video.
//
//   node scripts/contact-sheet.mjs out/ccxt-v4.5.74.mp4             -> out/ccxt-v4.5.74-sheet.png (8 frames)
//   node scripts/contact-sheet.mjs out/ccxt-v4.5.74.mp4 12
//   node scripts/contact-sheet.mjs out/ccxt-v4.5.74.mp4 --at 3,10.5,20.8
import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const [video, ...rest] = process.argv.slice(2);
if (video === undefined || !video.endsWith('.mp4')) {
	console.error('usage: node scripts/contact-sheet.mjs <video.mp4> [frames] [--at t1,t2,...]');
	process.exit(1);
}

const duration = Number(
	execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], {encoding: 'utf8'}),
);
const atIndex = rest.indexOf('--at');
const count = Number(rest[0] ?? 8);
if (atIndex === -1 && (!Number.isInteger(count) || count < 1 || count > 40)) {
	console.error('frame count must be an integer between 1 and 40');
	process.exit(1);
}
const times =
	atIndex !== -1
		? rest[atIndex + 1].split(',').map(Number)
		: Array.from({length: count}, (_, i) => ((i + 0.5) * duration) / count);
const invalid = times.filter((t) => !(t >= 0 && t < duration));
if (invalid.length > 0) {
	console.error(`timestamps outside 0-${duration.toFixed(2)}s: ${invalid.join(', ')}`);
	process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'ccxt-sheet-'));
try {
	times.forEach((t, i) => {
		const frame = join(dir, `f${String(i).padStart(2, '0')}.png`);
		execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', video, '-frames:v', '1', frame]);
	});
	const sheet = video.slice(0, -'.mp4'.length) + '-sheet.png';
	const rows = Math.ceil(times.length / 2);
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(dir, 'f%02d.png'), '-vf', `scale=800:450,tile=2x${rows}`, '-frames:v', '1', sheet]);
	console.log(`wrote ${sheet} (${times.map((t) => t.toFixed(1) + 's').join(', ')})`);
} finally {
	rmSync(dir, {recursive: true, force: true});
}
