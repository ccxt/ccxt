import { C } from "../theme";
import { sec } from "../timeline";
import type { HighlightKind, Release } from "./types";

// 120 BPM, every scene is a whole number of 2s bars — scripts/make-release-music.mjs uses the same grid.
export const INTRO = sec(2);
export const CARD = sec(2);
export const ALL_CHANGES = sec(4);
export const STATS = sec(2);
export const CTA = sec(5);

// Releases smaller than this skip the full change list (a one-PR hotfix has nothing "else" to show).
// Keep in sync with scripts/render-release.mjs.
export const MIN_CHANGES_FOR_OVERVIEW = 10;

export const releaseTimeline = (release: Release) => {
  const cards = release.highlights.length;
  const showAll = release.changes.length >= MIN_CHANGES_FOR_OVERVIEW;
  const all = INTRO + cards * CARD;
  const stats = all + (showAll ? ALL_CHANGES : 0);
  const cta = stats + STATS;
  return {
    cardsFrom: INTRO,
    showAll,
    all,
    stats,
    cta,
    total: cta + CTA,
    music: `music/release-${cards}-${showAll ? ALL_CHANGES / CARD : 0}.wav`,
  };
};

export const compositionId = (tag: string) =>
  `Release-${tag.replace(/^v/, "").split(".").join("-")}`;

export const KIND: Record<HighlightKind, { label: string; color: string }> = {
  feat: { label: "New", color: C.accent },
  perf: { label: "Faster", color: "#ffb547" },
  fix: { label: "Fixed", color: C.cyan },
  core: { label: "Under the hood", color: "#b18cff" },
};
