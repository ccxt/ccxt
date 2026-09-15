import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CcxtMark } from "../components/CcxtMark";
import { C, clamp, mono } from "../theme";
import { FPS } from "../timeline";
import { AllChanges } from "./AllChanges";
import { HighlightCard } from "./HighlightCard";
import { ReleaseCta } from "./ReleaseCta";
import { ReleaseIntro } from "./ReleaseIntro";
import { ReleaseStats } from "./ReleaseStats";
import {
  ALL_CHANGES,
  CARD,
  CTA,
  INTRO,
  KIND,
  releaseTimeline,
  STATS,
} from "./timeline";
import type { Release } from "./types";

type Segment = { from: number; duration: number; color: string };

const SEGMENT_WIDTH = 72; // px per card; longer scenes get proportionally wider segments

// Version badge and a progress bar with one segment per scene between the intro and the install screen.
const Chrome: React.FC<{ release: Release; segments: Segment[] }> = ({
  release,
  segments,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "44px 60px",
        opacity: interpolate(frame, [0, 6], [0, 1], clamp),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <CcxtMark size={42} />
        <span style={{ fontFamily: mono, fontSize: 28, color: C.text }}>
          ccxt <span style={{ color: C.dim }}>{release.tag}</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, paddingTop: 17 }}>
        {segments.map((segment, i) => (
          <div
            key={i}
            style={{
              width: (SEGMENT_WIDTH * segment.duration) / CARD,
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.12)",
            }}
          >
            <div
              style={{
                width: `${interpolate(frame, [segment.from, segment.from + segment.duration], [0, 100], clamp)}%`,
                height: "100%",
                background: segment.color,
              }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ hits: { at: number; strength: number }[] }> = ({
  hits,
}) => {
  const frame = useCurrentFrame();
  const opacity = Math.max(
    ...hits.map(({ at, strength }) =>
      frame >= at ? interpolate(frame, [at, at + 8], [strength, 0], clamp) : 0,
    ),
  );
  return <AbsoluteFill style={{ background: "#ffffff", opacity }} />;
};

export const ReleaseVideo: React.FC<{ release: Release }> = ({ release }) => {
  const t = releaseTimeline(release);
  // segment positions are relative to the Chrome sequence, which starts with the first card
  const segments: Segment[] = [
    ...release.highlights.map((highlight, i) => ({
      from: i * CARD,
      duration: CARD,
      color: KIND[highlight.kind].color,
    })),
    ...(t.showAll
      ? [{ from: t.all - t.cardsFrom, duration: ALL_CHANGES, color: C.text }]
      : []),
    { from: t.stats - t.cardsFrom, duration: STATS, color: C.text },
  ];
  const hits = [
    { at: t.cardsFrom, strength: 0.5 },
    ...release.highlights
      .slice(1)
      .map((_, i) => ({ at: t.cardsFrom + (i + 1) * CARD, strength: 0.08 })),
    ...(t.showAll ? [{ at: t.all, strength: 0.15 }] : []),
    { at: t.stats, strength: 0.25 },
    { at: t.cta, strength: 0.45 },
  ];
  return (
    <AbsoluteFill>
      <Audio src={staticFile(t.music)} />
      <Backdrop />
      <Sequence durationInFrames={INTRO} premountFor={FPS}>
        <ReleaseIntro release={release} />
      </Sequence>
      {release.highlights.map((highlight, i) => (
        <Sequence
          key={i}
          from={t.cardsFrom + i * CARD}
          durationInFrames={CARD}
          premountFor={FPS}
        >
          <HighlightCard highlight={highlight} />
        </Sequence>
      ))}
      {t.showAll ? (
        <Sequence from={t.all} durationInFrames={ALL_CHANGES} premountFor={FPS}>
          <AllChanges release={release} />
        </Sequence>
      ) : null}
      <Sequence from={t.stats} durationInFrames={STATS} premountFor={FPS}>
        <ReleaseStats release={release} />
      </Sequence>
      <Sequence from={t.cardsFrom} durationInFrames={t.cta - t.cardsFrom}>
        <Chrome release={release} segments={segments} />
      </Sequence>
      <Sequence from={t.cta} durationInFrames={CTA} premountFor={FPS}>
        <ReleaseCta release={release} />
      </Sequence>
      <Flash hits={hits} />
    </AbsoluteFill>
  );
};
