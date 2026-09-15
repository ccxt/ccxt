import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CcxtMark } from "../components/CcxtMark";
import { C, clamp, gradientText, mono, sans } from "../theme";
import { INTRO } from "./timeline";
import type { Release } from "./types";

const VERSION_SIZE = 230;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// Splits "4.5.75" -> "4.5.76" into the shared head "4.5." and the rolling parts "75" / "76".
const versionParts = (previous: string, tag: string) => {
  const from = previous.replace(/^v/, "").split(".");
  const to = tag.replace(/^v/, "").split(".");
  let shared = 0;
  while (shared < to.length - 1 && from[shared] === to[shared]) {
    shared++;
  }
  return {
    head: to.slice(0, shared).map((part) => `${part}.`).join(""),
    from: from.slice(shared).join("."),
    to: to.slice(shared).join("."),
  };
};

export const ReleaseIntro: React.FC<{ release: Release }> = ({ release }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { head, from, to } = versionParts(release.previous, release.tag);
  const logo = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const roll = spring({
    frame: frame - 16,
    fps,
    config: { damping: 13, stiffness: 140 },
  });
  const exit = interpolate(frame, [INTRO - 8, INTRO], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const rise = (at: number): React.CSSProperties => ({
    opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
    transform: `translateY(${interpolate(frame, [at, at + 10], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)`,
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - exit,
        transform: `scale(${1 + 0.08 * exit})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <CcxtMark
          size={96}
          style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -90}deg)` }}
        />
        <span
          style={{
            ...rise(3),
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 110,
            letterSpacing: "-0.05em",
            color: C.text,
          }}
        >
          ccxt
        </span>
      </div>
      <div
        style={{
          ...rise(6),
          display: "flex",
          marginTop: 12,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: VERSION_SIZE,
          lineHeight: `${VERSION_SIZE}px`,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ color: C.text }}>v{head}</span>
        {/* odometer: the previous version rolls up and out, the new one rolls in */}
        <span
          style={{
            display: "inline-block",
            height: VERSION_SIZE,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              transform: `translateY(${-roll * VERSION_SIZE}px)`,
            }}
          >
            <span style={{ color: C.dim }}>{from}</span>
            <span style={gradientText}>{to}</span>
          </span>
        </span>
      </div>
      <div
        style={{
          ...rise(12),
          marginTop: 24,
          fontFamily: mono,
          fontSize: 30,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.dim,
        }}
      >
        New release · {formatDate(release.date)}
      </div>
    </AbsoluteFill>
  );
};
