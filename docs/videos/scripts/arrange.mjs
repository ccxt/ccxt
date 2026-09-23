// Arranging a soundtrack per scene instead of as one loop.
//
// A single groove running under the whole video drifts away from the edit: the
// level barely moves, nothing lands on a cut, and the result feels like a track
// playing behind a video rather than a score for it. The fix is a section table
// that mirrors the scene table exactly — each scene gets its own kick pattern,
// percussion, and level — so the mix changes ON the cut.
//
//   import {sections, sectionAt} from './arrange.mjs';
//
//   const S = sections(BPM, [
//     {name: 'tease',  beats: 8,  kick: 'none', perc: 'none', gain: 0.6},
//     {name: 'reveal', beats: 7,  kick: 'none', perc: 'none', gain: 1.05},
//     {name: 'body',   beats: 9,  kick: 'four', perc: 'full', gain: 1.0},
//   ]);
//
// `S.cuts` are the section boundaries in seconds — the same numbers the scene
// table produces, which is the point. Keep the two in sync or the music and the
// picture drift apart the moment anything is retimed.

// Beat offsets within a bar for each kick pattern. 'four' is four-on-the-floor,
// 'syncopated' deliberately avoids it, and 'none' leaves the section open.
export const KICKS = {
  none: [],
  half: [0, 2],
  four: [0, 1, 2, 3],
  syncopated: [0, 1.5, 2.5, 3.75],
};

export function sections(bpm, table) {
  const beat = 60 / bpm;
  let t = 0;
  const list = table.map((s) => {
    const start = t;
    t += s.beats * beat;
    return { kick: "four", perc: "full", gain: 1, ...s, start, end: t };
  });
  return {
    beat,
    list,
    duration: t,
    cuts: list.slice(1).map((s) => Number(s.start.toFixed(3))),
    at: (time) => list.find((s) => time >= s.start && time < s.end) ?? list[list.length - 1],
  };
}

// Lays down kick, clap and hats for every section in one pass.
// Voices come from createSynth(); anything else (pads, bass, arps, risers) is
// still placed by hand, because those are where a score earns its character.
export function groove(S, { kick, clap, hat }) {
  const { beat } = S;
  for (let b = 0; b * beat < S.duration; b++) {
    const t = b * beat;
    const s = S.at(t);
    const inBar = b % 4;

    const pattern = KICKS[s.kick] ?? KICKS.four;
    if (pattern.includes(inBar)) kick(t, s.gain);

    if ((s.perc === "clap" || s.perc === "full") && (inBar === 1 || inBar === 3)) {
      clap(t, 0.9 * s.gain);
    }
    if (s.perc === "full" || s.perc === "hats") {
      hat(t + beat / 2, 0.32 * s.gain, 0.04);
      if (s.perc === "full") hat(t, 0.2 * s.gain, 0.03);
    }
  }
}

// Marks a reveal: nothing leads into it, everything lands on it.
//
// A reveal only works if the bar before it is nearly empty. If you run your
// normal riser and swell into it, it arrives already loud and there is nothing
// left to reveal. Call this INSTEAD of the usual per-cut treatment.
export function reveal(t, { boom, crash, roll, riser }, { lead = 1, gain = 1 } = {}) {
  roll(t - lead, t, 0.5 * gain);
  riser(t - lead, t, 0.34 * gain);
  boom(t, 0.62 * gain);
  crash(t, 0.5 * gain);
}
