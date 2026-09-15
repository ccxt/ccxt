import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, clamp, gradientText, mono, sans } from "../theme";
import { STATS } from "./timeline";
import type { Release } from "./types";

const MAX_HANDLES = 4;

export const ReleaseStats: React.FC<{ release: Release }> = ({ release }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { stats } = release;
  const plural = (n: number, one: string, many: string) =>
    n === 1 ? one : many;
  // a release that touches no exchange (docs, build) drops that counter instead of showing 0
  const items = [
    {
      value: stats.prs,
      label: plural(stats.prs, "pull request", "pull requests"),
    },
    {
      value: stats.exchanges,
      label: plural(stats.exchanges, "exchange improved", "exchanges improved"),
    },
    {
      value: stats.contributors,
      label: plural(stats.contributors, "contributor", "contributors"),
    },
  ].filter((item) => item.value > 0);
  const handles = stats.newContributors.slice(0, MAX_HANDLES);
  const more = stats.newContributors.length - handles.length;
  const exit = interpolate(frame, [STATS - 6, STATS], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 40,
        opacity: 1 - exit,
      }}
    >
      <div style={{ display: "flex", gap: 130 }}>
        {items.map((item, i) => {
          const at = i * 3;
          const progress = interpolate(frame, [at, at + 22], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          const pop = spring({
            frame: frame - at,
            fps,
            config: { damping: 14, stiffness: 200 },
          });
          return (
            <div
              key={item.label}
              style={{
                textAlign: "center",
                opacity: interpolate(frame, [at, at + 4], [0, 1], clamp),
                transform: `scale(${0.7 + 0.3 * pop})`,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 200,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  fontVariantNumeric: "tabular-nums",
                  ...gradientText,
                }}
              >
                {Math.round(item.value * progress)}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 40,
                  color: C.text,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      {handles.length > 0 ? (
        <div
          style={{
            marginTop: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: interpolate(frame, [18, 24], [0, 1], clamp),
          }}
        >
          <span
            style={{
              marginRight: 8,
              fontFamily: sans,
              fontSize: 34,
              color: C.dim,
            }}
          >
            Welcome, new contributors
          </span>
          {handles.map((handle) => (
            <span
              key={handle}
              style={{
                padding: "6px 20px",
                borderRadius: 999,
                background: C.panel,
                border: `1px solid ${C.border}`,
                fontFamily: mono,
                fontSize: 30,
                color: C.text,
              }}
            >
              @{handle}
            </span>
          ))}
          {more > 0 ? (
            <span style={{ fontFamily: mono, fontSize: 30, color: C.dim }}>
              +{more}
            </span>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
