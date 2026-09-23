// The beat grid every announcement is cut on.
//
// A cut that lands between beats reads as a mistake even to people who are not
// listening for it, so scene durations are chosen in beats rather than seconds
// and the soundtrack is generated from the same table. That only works if one
// beat is a whole number of frames: at 30 fps, 120 BPM is 15 frames, 112.5 is
// 16, 100 is 18, 128.571 is 14. A tempo that does not divide evenly drifts a
// frame at a time and there is no way to fix it later.

import { FPS } from "../timeline";

export const framesPerBeat = (bpm: number) => (FPS * 60) / bpm;

// Tempos that give a whole number of frames per beat at 30 fps.
export const TEMPOS = {
  60: 30,
  90: 20,
  100: 18,
  112.5: 16,
  120: 15,
  128.571: 14,
  150: 12,
} as const;

export type Beat<T> = {
  name: string;
  // Visible duration in frames. Always a multiple of framesPerBeat(bpm).
  hold: number;
  scene: T;
};

export type Timeline<T> = {
  beats: Beat<T>[];
  // Frame each scene starts on, derived — never hand-written, or retiming one
  // beat silently desynchronises everything after it.
  starts: number[];
  // Cut times in seconds, for the soundtrack's section table.
  cuts: number[];
  total: number;
};

// Builds the timeline and refuses a table that cannot sit on the grid.
// `cross` is the overlap each scene gets past its hold (see Scene).
export const timeline = <T,>(
  beats: Beat<T>[],
  bpm: number,
  cross = 12,
): Timeline<T> => {
  const fpb = framesPerBeat(bpm);
  if (!Number.isInteger(fpb)) {
    throw new Error(
      `video/kit: ${bpm} BPM is ${fpb} frames per beat at ${FPS} fps — pick a tempo from TEMPOS`,
    );
  }
  const offGrid = beats.filter((b, i) => i < beats.length - 1 && b.hold % fpb);
  if (offGrid.length) {
    throw new Error(
      `video/kit: holds must be multiples of ${fpb} frames at ${bpm} BPM — ` +
        offGrid.map((b) => `${b.name}=${b.hold}`).join(", "),
    );
  }

  const starts: number[] = [];
  let cursor = 0;
  for (const b of beats) {
    starts.push(cursor);
    cursor += b.hold;
  }
  return {
    beats,
    starts,
    cuts: starts.slice(1).map((f) => Number((f / FPS).toFixed(3))),
    total: cursor + cross,
  };
};
