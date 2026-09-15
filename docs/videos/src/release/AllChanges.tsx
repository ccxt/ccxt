import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, clamp, gradientText, mono, sans } from "../theme";
import { ALL_CHANGES } from "./timeline";
import type { ChangeKind, Release } from "./types";

const CHANGE_KIND: Record<
  ChangeKind,
  { label: string; badge: string; color: string }
> = {
  feat: { label: "Features", badge: "FEAT", color: C.accent },
  fix: { label: "Fixes", badge: "FIX", color: C.cyan },
  perf: { label: "Performance", badge: "PERF", color: "#ffb547" },
  test: { label: "Tests", badge: "TEST", color: "#f472b6" },
  docs: { label: "Docs", badge: "DOCS", color: C.string },
  chore: { label: "Maintenance", badge: "CHORE", color: "#b18cff" },
};
const KIND_ORDER: ChangeKind[] = [
  "feat",
  "fix",
  "perf",
  "test",
  "docs",
  "chore",
];

const ROW = 46;
const PANEL_WIDTH = 1040;
const PANEL_HEIGHT = 690;
const PAD = 50; // keeps the first and last rows clear of the fade masks
const SCROLL_FROM = 8;
const SCROLL_TO = ALL_CHANGES - 26;

const countByKind = (kinds: ChangeKind[]) => {
  const counts = { feat: 0, fix: 0, perf: 0, test: 0, docs: 0, chore: 0 };
  for (const kind of kinds) {
    counts[kind]++;
  }
  return counts;
};

// Every pull request scrolls past once, fast (pause to read), while the type breakdown on the
// right counts each row the moment it enters the panel, so the totals land as the list ends.
export const AllChanges: React.FC<{ release: Release }> = ({ release }) => {
  const frame = useCurrentFrame();
  const { changes } = release;
  const featured = new Set(release.highlights.flatMap((h) => h.prs));
  const travel = Math.max(0, changes.length * ROW + 2 * PAD - PANEL_HEIGHT);
  // starts with the panel half-full, so the scene never opens on an empty box
  const scroll = interpolate(
    frame,
    [SCROLL_FROM, SCROLL_TO],
    [-PANEL_HEIGHT / 2, travel],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  const entered = Math.min(
    changes.length,
    Math.max(0, Math.ceil((PANEL_HEIGHT - 2 * PAD + scroll) / ROW)),
  );
  const totals = countByKind(changes.map((c) => c.kind));
  const counts = countByKind(changes.slice(0, entered).map((c) => c.kind));
  const max = Math.max(...KIND_ORDER.map((kind) => totals[kind]));
  const exit = interpolate(
    frame,
    [ALL_CHANGES - 6, ALL_CHANGES],
    [0, 1],
    clamp,
  );
  const enter = interpolate(frame, [0, 8], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const fade = `linear-gradient(to bottom, transparent 0, black ${PAD}px, black calc(100% - ${PAD}px), transparent 100%)`;
  return (
    <AbsoluteFill
      style={{
        padding: "150px 130px 0",
        opacity: (1 - exit) * enter,
        transform: `translateY(${(1 - enter) * 30}px)`,
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 64,
          letterSpacing: "-0.03em",
          color: C.text,
        }}
      >
        All <span style={gradientText}>{changes.length}</span> pull requests
        <span style={{ color: C.dim }}> in {release.tag}</span>
      </div>
      <div style={{ display: "flex", gap: 90, marginTop: 30 }}>
        <div
          style={{
            position: "relative",
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            overflow: "hidden",
            borderRadius: 20,
            background: "rgba(12, 15, 21, 0.9)",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              maskImage: fade,
              WebkitMaskImage: fade,
            }}
          >
            {changes.map((change, i) => {
              const top = PAD + i * ROW - scroll;
              if (top < -ROW || top > PANEL_HEIGHT) {
                return null;
              }
              const kind = CHANGE_KIND[change.kind];
              const isFeatured = featured.has(change.pr);
              return (
                <div
                  key={change.pr}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top,
                    height: ROW,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "0 26px",
                    borderLeft: `4px solid ${isFeatured ? C.accent : "transparent"}`,
                    background: isFeatured
                      ? "rgba(0, 240, 168, 0.07)"
                      : undefined,
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 96px",
                      fontFamily: mono,
                      fontSize: 21,
                      color: C.dim,
                    }}
                  >
                    #{change.pr}
                  </span>
                  <span
                    style={{
                      flex: "0 0 78px",
                      textAlign: "center",
                      borderRadius: 6,
                      fontFamily: mono,
                      fontSize: 17,
                      fontWeight: 700,
                      lineHeight: "28px",
                      color: kind.color,
                      background: `${kind.color}22`,
                    }}
                  >
                    {kind.badge}
                  </span>
                  <span
                    style={{
                      flex: "0 0 170px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: mono,
                      fontSize: 21,
                      color: C.text,
                    }}
                  >
                    {change.scope ?? ""}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: sans,
                      fontSize: 25,
                      color: isFeatured ? C.text : "rgba(238, 240, 245, 0.72)",
                    }}
                  >
                    {change.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 24,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.dim,
            }}
          >
            By type
          </div>
          {KIND_ORDER.filter((kind) => totals[kind] > 0).map((kind) => (
            <div key={kind}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 34,
                    color: C.text,
                  }}
                >
                  {CHANGE_KIND[kind].label}
                </span>
                <span
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: 56,
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                    color: CHANGE_KIND[kind].color,
                  }}
                >
                  {counts[kind]}
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 5,
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <div
                  style={{
                    width: `${(counts[kind] / max) * 100}%`,
                    height: "100%",
                    borderRadius: 5,
                    background: CHANGE_KIND[kind].color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
