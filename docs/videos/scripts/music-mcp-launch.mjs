// Soundtrack for the ccxt-mcp launch video. Hit points line up with the scene cuts in
// src/mcp-launch/timeline.ts — copy this file as the starting point for a new announcement.
//
//   node scripts/music-mcp-launch.mjs   ->   public/music/mcp-launch.wav
import {createSynth, lerp} from './synth.mjs';

const BEAT = 0.5; // 120 BPM

// hit points (seconds) — keep in sync with src/mcp-launch/timeline.ts
const LOGO = 4; // logo slam
const DROP = 16; // tool calls fire
const FILLED = 26; // the order fills
const COUNT = 30; // exchange counter
const CTA = 36; // call to action
const DURATION = 41.5;
const IMPACTS = [LOGO, DROP, COUNT, CTA];
const GROOVES = [
	[LOGO, DROP - 1],
	[DROP, COUNT - 0.5],
	[COUNT, CTA - 0.5],
];
const grooveOn = (t) => GROOVES.some(([a, b]) => t >= a && t < b);

const {kick, boom, clap, hat, crash, riser, roll, pad, bass, arp, save} = createSynth(DURATION, BEAT);

// intro: a thump under each headline line, then a roll and riser into the logo slam
[0, 1, 2].forEach((t) => {
	kick(t, 0.55);
	hat(t, 0.25, 0.08);
});
roll(3, LOGO);
riser(2.2, LOGO, 0.4);

// groove: four on the floor, claps on 2 and 4 once the prompt is on screen, offbeat hats
for (let t = LOGO; t < CTA; t += BEAT) {
	const beatIndex = Math.round(t / BEAT);
	if (grooveOn(t) && IMPACTS.indexOf(t) === -1) {
		kick(t, 1);
	}
	if (grooveOn(t) && t >= 10 && beatIndex % 2 === 1) {
		clap(t, 0.6);
	}
	const off = t + BEAT / 2;
	if (grooveOn(off)) {
		hat(off, 0.22, off >= DROP ? 0.12 : 0.035, 0.2);
	}
	if (grooveOn(t) && t >= 10) {
		hat(t + BEAT / 4, 0.07, 0.02, -0.4);
		hat(t + (3 * BEAT) / 4, 0.07, 0.02, -0.4);
	}
}

kick(LOGO, 1.2);
boom(LOGO, 0.9);
crash(LOGO, 0.55);

riser(DROP - 2, DROP, 0.35);
kick(DROP, 1);
boom(DROP, 0.5);
crash(DROP, 0.5);

// the order fills: a lighter hit inside the groove, then the arpeggio lifts an octave
boom(FILLED, 0.45);
crash(FILLED, 0.4);

riser(COUNT - 1.5, COUNT, 0.35);
kick(COUNT, 1);
boom(COUNT, 0.6);
crash(COUNT, 0.45);

// outro: impact, then a half-time pulse under the held call to action
riser(CTA - 1.5, CTA, 0.35);
kick(CTA, 1.1);
boom(CTA, 0.8);
crash(CTA, 0.5);
[CTA + 2, CTA + 4].forEach((t) => kick(t, 0.5));

const duck = (t) => (grooveOn(t) ? 1 - 0.8 * Math.exp(-(t % BEAT) / 0.09) : 1);

pad({
	gain: (t) => (t < LOGO ? lerp(0, 0.5, t / LOGO) : t < DROP ? 0.3 : t < CTA ? 0.24 : lerp(0.5, 0, (t - (DURATION - 2)) / 2)),
	cutoff: (t) => (t < LOGO ? 250 * Math.pow(12, t / LOGO) : t < CTA ? 1800 : 2600),
	duck,
});

bass({
	start: LOGO,
	sustainFrom: CTA,
	gain: (t) => (t < CTA ? (grooveOn(t) ? 0.34 : 0.12) : lerp(0.3, 0, (t - CTA) / (DURATION - CTA))),
	duck,
});

arp({
	start: 10,
	lift: (t, k) => (t >= FILLED && t < CTA && k % 16 >= 8 ? 12 : 0),
	gain: (t) => (t < DROP ? lerp(0.03, 0.12, (t - 10) / (DROP - 10)) : t < CTA ? 0.17 : lerp(0.12, 0, (t - CTA - 1) / 4)),
});

save(new URL('../public/music/mcp-launch.wav', import.meta.url));
