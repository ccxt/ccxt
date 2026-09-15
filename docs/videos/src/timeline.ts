// Shared frame helpers for every composition: 1920×1080 at 30 fps. At the 120 BPM the
// soundtracks use, one beat is 15 frames and one bar (2s) is 60 frames — cut scenes on bars.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const sec = (seconds: number) => Math.round(seconds * FPS);
