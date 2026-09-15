import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, clamp, mono, sans } from "../theme";
import { CARD, KIND } from "./timeline";
import type { Highlight } from "./types";
import { VisualPanel } from "./Visual";

const prLabel = (prs: number[]) =>
  prs
    .slice(0, 2)
    .map((n) => `#${n}`)
    .join("  ") + (prs.length > 2 ? `  +${prs.length - 2}` : "");

export const HighlightCard: React.FC<{ highlight: Highlight }> = ({
  highlight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kind = KIND[highlight.kind];
  const enter = (at: number): React.CSSProperties => {
    const p = spring({
      frame: frame - at,
      fps,
      config: { damping: 18, stiffness: 180 },
    });
    return {
      opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
      transform: `translateX(${(1 - p) * 70}px)`,
    };
  };
  const exit = interpolate(frame, [CARD - 6, CARD], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 90,
        padding: "60px 130px 0",
        opacity: 1 - exit,
        transform: `translateX(${-50 * exit}px)`,
      }}
    >
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <div
          style={{
            ...enter(0),
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              padding: "6px 20px",
              borderRadius: 999,
              background: kind.color,
              color: C.bg,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {kind.label}
          </span>
          <span style={{ fontFamily: mono, fontSize: 26, color: C.dim }}>
            {prLabel(highlight.prs)}
          </span>
        </div>
        <div
          style={{
            ...enter(2),
            marginTop: 28,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: C.text,
          }}
        >
          {highlight.title}
        </div>
        <div
          style={{
            ...enter(4),
            marginTop: 26,
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.3,
            color: C.dim,
          }}
        >
          {highlight.detail}
        </div>
      </div>
      <div style={{ ...enter(6), flex: "0 0 760px" }}>
        <VisualPanel visual={highlight.visual} color={kind.color} />
      </div>
    </AbsoluteFill>
  );
};
