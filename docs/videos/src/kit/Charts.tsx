import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, mono, sans } from "../theme";
import { useRise } from "./Text";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// One root fanning out to N leaves, with the chosen ones lit.
//
// Drawing the same picture several times with a different subset lit is the
// clearest way to show that a set of options is really one parameter.
export const FanGraph: React.FC<{
  leaves: string[];
  lit: number[];
  delay?: number;
  width?: number;
  height?: number;
}> = ({ leaves, lit, delay = 0, width = 380, height = 170 }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const rootX = width / 2;
  const rootY = 26;
  const leafY = 116;
  // Inset enough that the outermost label still fits inside the svg, or the
  // first and last names clip.
  const step = (width - 88) / Math.max(1, leaves.length - 1);
  const leafX = (i: number) => 44 + i * step;

  return (
    <svg width={width} height={height}>
      {leaves.map((leaf, i) => {
        const on = lit.includes(i);
        const draw = interpolate(f, [14 + i * 4, 30 + i * 4], [0, 1], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        });
        const x = leafX(i);
        const midY = (rootY + leafY) / 2;
        return (
          <g key={leaf}>
            <path
              d={`M ${rootX} ${rootY} C ${rootX} ${midY}, ${x} ${midY}, ${x} ${leafY}`}
              stroke={on ? C.accent : "#242c36"}
              strokeWidth={on ? 2.4 : 1.6}
              fill="none"
              strokeDasharray={200}
              strokeDashoffset={(1 - draw) * 200}
              opacity={on ? 0.45 + 0.55 * draw : 0.9}
            />
            <circle
              cx={x}
              cy={leafY}
              r={on ? 9 : 7}
              fill={on ? C.accent : "transparent"}
              stroke={on ? C.accent : "#39424f"}
              strokeWidth={1.8}
              opacity={draw}
            />
            <text
              x={x}
              y={leafY + 30}
              textAnchor="middle"
              fontFamily={mono}
              fontSize={16}
              fill={on ? C.dim : "#5a6274"}
              opacity={draw}
            >
              {leaf}
            </text>
          </g>
        );
      })}
      <circle cx={rootX} cy={rootY} r={9} fill="none" stroke={C.text} strokeWidth={2} />
    </svg>
  );
};

export type CompareRow = {
  label: string;
  // Value before the adjustment, and after it.
  from: number;
  to: number;
  badge?: string;
};

// Rows that re-rank themselves once a correction is applied — the shape of
// every "the obvious answer is the wrong one" story.
//
// Rows swapping places pass straight through each other on the way, which reads
// as a glitch, so they arc apart horizontally and the one moving down is drawn
// behind.
export const CompareRows: React.FC<{
  rows: CompareRow[];
  delay?: number;
  width?: number;
  format?: (n: number) => string;
  // Frames for: badge in, value morph, re-rank.
  timing?: [number, number, number];
}> = ({
  rows,
  delay = 0,
  width = 1240,
  format = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  timing = [30, 34, 58],
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const [badgeAt, morphAt, swapAt] = timing;
  const rowH = 128;
  const gap = 20;

  const badge = interpolate(f, [badgeAt, badgeAt + 14], [0, 1], CLAMP);
  const morph = interpolate(f, [morphAt, morphAt + 18], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const swap = interpolate(f, [swapAt, swapAt + 20], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });

  const fromOrder = [...rows].sort((a, b) => a.from - b.from).map((r) => r.label);
  const toOrder = [...rows].sort((a, b) => a.to - b.to).map((r) => r.label);

  return (
    <div style={{ position: "relative", width, height: rows.length * (rowH + gap) - gap }}>
      {rows.map((row) => {
        const fromRow = fromOrder.indexOf(row.label);
        const toRow = toOrder.indexOf(row.label);
        const pos = fromRow + (toRow - fromRow) * swap;
        const arc = Math.sin(swap * Math.PI);
        const side = toRow > fromRow ? 1 : -1;
        const value = row.from + (row.to - row.from) * morph;
        const winner = toOrder[0] === row.label;
        const lit = winner ? swap : 0;

        return (
          <div
            key={row.label}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: rowH,
              transform: `translate(${arc * 52 * side}px, ${pos * (rowH + gap)}px) scale(${
                1 - arc * 0.035
              })`,
              zIndex: side > 0 ? 1 : 2,
              borderRadius: 16,
              border: `1px solid ${winner ? `rgba(61, 220, 132, ${0.25 + 0.55 * lit})` : C.border}`,
              background: winner
                ? `rgba(61, 220, 132, ${0.03 + 0.07 * lit})`
                : "rgba(14, 17, 24, 0.92)",
              display: "flex",
              alignItems: "center",
              padding: "0 34px",
              gap: 24,
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 44,
                fontWeight: 700,
                color: C.text,
                width: 230,
                letterSpacing: -1,
              }}
            >
              {row.label}
            </div>
            {row.badge ? (
              <div
                style={{
                  opacity: badge,
                  fontFamily: mono,
                  fontSize: 23,
                  color: "#ff6b6b",
                  border: "1px solid rgba(255, 107, 107, 0.27)",
                  borderRadius: 999,
                  padding: "7px 17px",
                }}
              >
                {row.badge}
              </div>
            ) : null}
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontFamily: sans,
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: -2,
                fontVariantNumeric: "tabular-nums",
                color: winner ? C.green : C.text,
              }}
            >
              {format(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// A counter that animates to its final value. Pass the real figure; the ramp is
// presentation, the number is not.
export const Counter: React.FC<{
  to: number;
  from?: number;
  delay?: number;
  frames?: number;
  digits?: number;
  suffix?: string;
  size?: number;
}> = ({ to, from = 0, delay = 0, frames = 30, digits = 2, suffix, size = 180 }) => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [delay, delay + frames], [from, to], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const { opacity } = useRise(delay, 20);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 18, opacity }}>
      <span
        style={{
          fontFamily: sans,
          fontSize: size,
          fontWeight: 800,
          letterSpacing: -size * 0.045,
          lineHeight: 1,
          color: C.accent,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value.toFixed(digits)}
      </span>
      {suffix ? (
        <span style={{ fontFamily: mono, fontSize: size * 0.26, color: C.dim, letterSpacing: 2 }}>
          {suffix}
        </span>
      ) : null}
    </div>
  );
};
