// Shared building blocks for announcement videos. See docs/videos/GOTCHAS.md for
// the failures these encode, and .claude/skills/announcement-video/SKILL.md for
// how to assemble them.
export { CROSS, Scene } from "./Scene";
export { TEMPOS, framesPerBeat, timeline } from "./beats";
export type { Beat, Timeline } from "./beats";
export { Bullets, Chip, Eyebrow, Headline, Lines, useRise } from "./Text";
export { CodeBlock, codeWidth } from "./Code";
export { ClipPanel, Cursor, Flipbook, ShotSequence } from "./Media";
export { Reveal } from "./Reveal";
export { CompareRows, Counter, FanGraph } from "./Charts";
export type { CompareRow } from "./Charts";
