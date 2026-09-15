import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, clamp, mono, sans } from "../theme";
import type { Visual } from "./types";

const panel: React.CSSProperties = {
  background: "rgba(12, 15, 21, 0.95)",
  border: `1px solid ${C.border}`,
  borderRadius: 20,
  boxShadow: "0 30px 90px rgba(0, 0, 0, 0.5)",
};

const WindowDots: React.FC = () => (
  <div
    style={{
      display: "flex",
      gap: 10,
      padding: "18px 24px",
      borderBottom: `1px solid ${C.border}`,
    }}
  >
    {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
      <span
        key={color}
        style={{ width: 14, height: 14, borderRadius: 7, background: color }}
      />
    ))}
  </div>
);

const CommandVisual: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => {
  const frame = useCurrentFrame();
  const shown = text.slice(0, Math.max(0, Math.floor((frame - 8) * 2)));
  const typing = shown.length < text.length;
  return (
    <div style={panel}>
      <WindowDots />
      <div
        style={{
          padding: "30px 34px",
          fontFamily: mono,
          fontSize: 28,
          lineHeight: "46px",
          whiteSpace: "nowrap",
          fontVariantLigatures: "none",
          color: C.text,
        }}
      >
        <span style={{ color }}>$ </span>
        {shown}
        <span
          style={{
            display: "inline-block",
            width: "0.6em",
            height: "1.1em",
            marginLeft: 3,
            verticalAlign: "-0.2em",
            background: C.text,
            opacity: typing || Math.floor(frame / 10) % 2 === 0 ? 0.85 : 0,
          }}
        />
      </div>
    </div>
  );
};

// "3.3×" counts up from 1.0× (a speed-up never starts at zero); "−61%" and plain numbers count from 0
const countUp = (value: string, progress: number) => {
  const match = value.match(/^([−-]?)([\d.]+)(.*)$/);
  if (match === null) {
    return value;
  }
  const [, sign, digits, suffix] = match;
  const target = parseFloat(digits);
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  const start = suffix.trim() === "×" ? 1 : 0;
  return (
    sign + (start + (target - start) * progress).toFixed(decimals) + suffix
  );
};

const MetricsVisual: React.FC<{
  items: { value: string; label: string }[];
  color: string;
}> = ({ items, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {items.map((item, i) => {
        const at = 6 + i * 6;
        const progress = interpolate(frame, [at, at + 20], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={item.label}
            style={{
              ...panel,
              padding: "26px 40px",
              display: "flex",
              alignItems: "center",
              gap: 34,
              opacity: interpolate(frame, [at, at + 4], [0, 1], clamp),
              transform: `translateY(${(1 - progress) * 20}px)`,
            }}
          >
            <span
              style={{
                minWidth: 290,
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 124,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
                color,
              }}
            >
              {countUp(item.value, progress)}
            </span>
            <span
              style={{
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 36,
                lineHeight: 1.2,
                color: C.text,
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ChipsVisual: React.FC<{ items: string[]; color: string }> = ({
  items,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {items.map((name, i) => {
        const at = 6 + i * 2;
        const pop = spring({
          frame: frame - at,
          fps,
          config: { damping: 12, stiffness: 220 },
        });
        return (
          <div
            key={name}
            style={{
              ...panel,
              borderRadius: 16,
              padding: "18px 26px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: frame >= at ? 1 : 0,
              transform: `scale(${pop})`,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 38,
              color: C.text,
            }}
          >
            <svg width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="17" fill={color} />
              <path
                d="M10 17.5l4.8 4.8L24.5 12"
                stroke="#06070a"
                strokeWidth="3.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {name}
          </div>
        );
      })}
    </div>
  );
};

// Minimal highlighting: comments dimmed, capitalised type names cyan, primitive types in the card color.
const highlightLine = (line: string, color: string) => {
  if (line.trim().startsWith("//")) {
    return <span style={{ color: C.dim }}>{line}</span>;
  }
  return line
    .split(/(\b[A-Z][A-Za-z]*\b|\b(?:string|double|object|bool|int)\b)/)
    .map((part, i) => (
      <span
        key={i}
        style={{
          color: i % 2 === 0 ? C.text : /^[A-Z]/.test(part) ? C.cyan : color,
        }}
      >
        {part}
      </span>
    ));
};

const CodeVisual: React.FC<{ lines: string[]; color: string }> = ({
  lines,
  color,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={panel}>
      <WindowDots />
      <div
        style={{
          padding: "26px 34px",
          fontFamily: mono,
          fontSize: 26,
          lineHeight: "48px",
          whiteSpace: "pre",
          fontVariantLigatures: "none",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              opacity: interpolate(
                frame,
                [6 + i * 4, 10 + i * 4],
                [0, 1],
                clamp,
              ),
            }}
          >
            {highlightLine(line, color)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const VisualPanel: React.FC<{ visual: Visual; color: string }> = ({
  visual,
  color,
}) => {
  switch (visual.type) {
    case "command":
      return <CommandVisual text={visual.text} color={color} />;
    case "metrics":
      return <MetricsVisual items={visual.items} color={color} />;
    case "chips":
      return <ChipsVisual items={visual.items} color={color} />;
    case "code":
      return <CodeVisual lines={visual.lines} color={color} />;
  }
};
