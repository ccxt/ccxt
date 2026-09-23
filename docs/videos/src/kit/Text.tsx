import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, mono, sans } from "../theme";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Rise-and-settle. Used by nearly every element so timing feels consistent
// across scenes that were written weeks apart.
export const useRise = (delay: number, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
  return {
    s,
    opacity: interpolate(s, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }),
    y: interpolate(s, [0, 1], [34, 0]),
  };
};

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
}> = ({ children, delay = 0, color = C.accent }) => {
  const { opacity, y } = useRise(delay);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: mono,
        fontSize: 22,
        letterSpacing: 6,
        textTransform: "uppercase",
        color,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span style={{ width: 34, height: 2, background: color, display: "block" }} />
      {children}
    </div>
  );
};

// Headline that reveals word by word. A whole block fading in gives the eye
// nowhere to start; staggered words read at roughly the speed they are spoken.
export const Headline: React.FC<{
  words: { text: string; color?: string }[];
  delay?: number;
  size?: number;
  stagger?: number;
  align?: React.CSSProperties["justifyContent"];
  maxWidth?: number;
}> = ({
  words,
  delay = 0,
  size = 84,
  stagger = 3,
  align = "center",
  maxWidth = 1500,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align,
        gap: `${size * 0.14}px ${size * 0.26}px`,
        maxWidth,
        fontFamily: sans,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: -size * 0.03,
        lineHeight: 1.02,
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 20, mass: 0.6 },
        });
        return (
          <span
            key={`${w.text}-${i}`}
            style={{
              display: "inline-block",
              color: w.color ?? C.text,
              opacity: interpolate(s, [0, 0.5], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${interpolate(s, [0, 1], [56, 0])}px)`,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

export const Chip: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
}> = ({ children, delay = 0, color = C.dim }) => {
  const { opacity, y } = useRise(delay, 22);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: mono,
        fontSize: 21,
        letterSpacing: 2,
        color,
        border: `1px solid ${C.border}`,
        background: "rgba(14, 17, 24, 0.85)",
        borderRadius: 999,
        padding: "10px 22px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Bullets: React.FC<{
  items: readonly string[];
  delay?: number;
  size?: number;
  direction?: "column" | "row";
}> = ({ items, delay = 0, size = 25, direction = "column" }) => (
  <div
    style={{
      display: "flex",
      flexDirection: direction,
      gap: direction === "row" ? 34 : 10,
      alignItems: direction === "row" ? "center" : "flex-start",
    }}
  >
    {items.map((item, i) => (
      <BulletRow key={item} text={item} delay={delay + i * 5} size={size} />
    ))}
  </div>
);

const BulletRow: React.FC<{ text: string; delay: number; size: number }> = ({
  text,
  delay,
  size,
}) => {
  const { opacity, y } = useRise(delay, 22);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: mono,
        fontSize: size,
        letterSpacing: 2,
        color: C.dim,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ width: 6, height: 6, background: C.accent, display: "block" }} />
      {text}
    </div>
  );
};

// Sequential lines on an empty frame — the setup before a reveal, with nothing
// else on screen competing for attention.
export const Lines: React.FC<{
  items: { text: string; at: number; color?: string }[];
  size?: number;
}> = ({ items, size = 78 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {items.map((line, i) => {
        const next = items[i + 1];
        // The last line never fades, but interpolate rejects an infinite range,
        // so hold it with a far-future finite bound instead.
        const out = next ? next.at : line.at + 10000;
        const opacity = interpolate(
          frame,
          [line.at, line.at + 9, out - 6, out],
          [0, 1, 1, next ? 0 : 1],
          CLAMP,
        );
        const y = interpolate(frame, [line.at, line.at + 14], [22, 0], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={line.text}
            style={{
              position: "absolute",
              opacity,
              transform: `translateY(${y}px)`,
              fontFamily: sans,
              fontSize: size,
              fontWeight: 700,
              letterSpacing: -2,
              color: line.color ?? C.text,
              textAlign: "center",
              maxWidth: 1500,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};
