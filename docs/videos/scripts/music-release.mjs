// Soundtrack for the release videos. The grid matches src/release/timeline.ts: a 2s intro,
// one 2s bar per highlight card, optional bars for the full change list, a 2s stats bar, then the
// held install screen. scripts/render-release.mjs calls this with the right arguments.
//
//   node scripts/music-release.mjs <cards> <changeListBars>   ->   public/music/release-<cards>-<bars>.wav
import {createSynth, lerp} from './synth.mjs';

const cards = Number(process.argv[2]);
const listBars = Number(process.argv[3] ?? 0);
if (!Number.isInteger(cards) || cards < 1 || cards > 8 || !Number.isInteger(listBars) || listBars < 0 || listBars > 4) {
	console.error('usage: node scripts/music-release.mjs <highlight cards, 1-8> <change list bars, 0-4>');
	process.exit(1);
}

const BEAT = 0.5; // 120 BPM
const INTRO = 2;
const CARD = 2;
const LIST = INTRO + cards * CARD;
const STATS = LIST + listBars * 2;
const CTA = STATS + 2;
const DURATION = CTA + 5;
const GROOVES = [
	[INTRO, STATS - 0.5],
	[STATS, CTA - 0.5],
];
const grooveOn = (t) => GROOVES.some(([a, b]) => t >= a && t < b);
const inList = (t) => listBars > 0 && t >= LIST && t < STATS - 0.5;

const {kick, boom, clap, hat, crash, riser, roll, pad, bass, arp, save} = createSynth(DURATION, BEAT);

// intro: logo hit, then a roll and riser into the first card
kick(0, 0.8);
boom(0, 0.5);
crash(0, 0.3);
[0.5, 1].forEach((t) => hat(t, 0.2, 0.06));
roll(1, INTRO, 0.4);
riser(0.4, INTRO, 0.35);

// groove under the cards, the change list and the stats
for (let t = INTRO; t < CTA; t += BEAT) {
	const beatIndex = Math.round(t / BEAT);
	if (grooveOn(t) && t !== INTRO && t !== STATS) {
		kick(t, 1);
	}
	if (grooveOn(t) && beatIndex % 2 === 1) {
		clap(t, 0.55);
	}
	const off = t + BEAT / 2;
	if (grooveOn(off)) {
		hat(off, 0.22, 0.1, 0.2);
	}
	if (grooveOn(t)) {
		hat(t + BEAT / 4, 0.07, 0.02, -0.4);
		hat(t + (3 * BEAT) / 4, 0.07, 0.02, -0.4);
	}
	// the list scroll gets running 32nd-note hats on top, so the speed-up is heard as well as seen
	if (inList(t)) {
		for (let k = 1; k < 8; k += 2) {
			hat(t + (k * BEAT) / 8, 0.05, 0.012, 0.5);
		}
	}
}

// the first card lands hard, every later card gets a lighter cymbal on its bar
kick(INTRO, 1.15);
boom(INTRO, 0.7);
crash(INTRO, 0.5);
for (let i = 1; i < cards; i++) {
	crash(INTRO + i * CARD, 0.22);
}

if (listBars > 0) {
	crash(LIST, 0.35);
	boom(LIST, 0.35);
}

riser(STATS - 1.5, STATS, 0.3);
kick(STATS, 1);
boom(STATS, 0.6);
crash(STATS, 0.45);

// install screen: impact, then a half-time pulse while it holds
riser(CTA - 1.5, CTA, 0.3);
kick(CTA, 1.1);
boom(CTA, 0.8);
crash(CTA, 0.5);
[CTA + 2, CTA + 4].forEach((t) => kick(t, 0.45));

const duck = (t) => (grooveOn(t) ? 1 - 0.8 * Math.exp(-(t % BEAT) / 0.09) : 1);

pad({
	gain: (t) => (t < INTRO ? lerp(0, 0.45, t / INTRO) : t < CTA ? 0.24 : lerp(0.45, 0, (t - (DURATION - 2)) / 2)),
	// the filter opens across the change list and snaps back on the stats hit
	cutoff: (t) => (t < INTRO ? 300 * Math.pow(8, t / INTRO) : inList(t) ? 1200 * Math.pow(3, (t - LIST) / (STATS - LIST)) : t < CTA ? 1800 : 2600),
	duck,
});

bass({
	start: INTRO,
	sustainFrom: CTA,
	gain: (t) => (t < CTA ? (grooveOn(t) ? 0.34 : 0.12) : lerp(0.3, 0, (t - CTA) / (DURATION - CTA))),
	duck,
});

arp({
	start: INTRO,
	lift: (t, k) => (t >= STATS && t < CTA && k % 16 >= 8 ? 12 : 0),
	gain: (t) => (t < CTA ? 0.15 : lerp(0.12, 0, (t - CTA - 1) / 3)),
});

save(new URL(`../public/music/release-${cards}-${listBars}.wav`, import.meta.url));
