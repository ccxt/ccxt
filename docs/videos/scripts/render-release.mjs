// Renders one release video: regenerates its soundtrack for the number of highlight cards and
// whether the full change list is shown, renders the composition, then writes a frame grid for review.
//
//   node scripts/render-release.mjs v4.5.76   ->   out/ccxt-v4.5.76.mp4 + out/ccxt-v4.5.76-sheet.png
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// keep in sync with src/release/timeline.ts (MIN_CHANGES_FOR_OVERVIEW, ALL_CHANGES / CARD)
const MIN_CHANGES_FOR_OVERVIEW = 10;
const CHANGE_LIST_BARS = 2;

const tag = process.argv[2];
if (!/^v\d+\.\d+\.\d+$/.test(tag ?? '')) {
	console.error('usage: node scripts/render-release.mjs vX.Y.Z');
	process.exit(1);
}

const data = JSON.parse(readFileSync(new URL(`../src/releases/${tag}.json`, import.meta.url), 'utf8'));
if (data.highlights.length === 0) {
	console.error(`src/releases/${tag}.json has no highlights yet`);
	process.exit(1);
}
if (!Array.isArray(data.changes)) {
	console.error(`src/releases/${tag}.json has no change list — re-run: npm run release:data -- ${tag}`);
	process.exit(1);
}

const listBars = data.changes.length >= MIN_CHANGES_FOR_OVERVIEW ? CHANGE_LIST_BARS : 0;
const video = `out/ccxt-${tag}.mp4`;
const run = (command, args) => execFileSync(command, args, {stdio: 'inherit', cwd: new URL('..', import.meta.url)});
run('node', ['scripts/music-release.mjs', String(data.highlights.length), String(listBars)]);
run('npx', ['remotion', 'render', `Release-${tag.slice(1).split('.').join('-')}`, video, '--crf', '18']);
run('node', ['scripts/contact-sheet.mjs', video]);
