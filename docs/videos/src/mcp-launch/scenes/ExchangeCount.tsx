import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CRYPTO_EXCHANGES, PREDICTION_MARKETS } from "../data/exchanges";
import { C, clamp, gradientText, mono, sans } from "../../theme";

// Local frames — this scene starts at 30s.
const COUNT_START = 4;
const COUNT_END = 70;
const PREDICTION_AT = 90; // 33s
const CAPABILITIES_AT = 126;
const GRID_COLUMNS = 13;
const CAPABILITIES = [
  "market data",
  "order books",
  "balances",
  "positions",
  "create & cancel orders",
  "WebSocket streams",
];

const countAt = (frame: number) =>
  Math.round(
    interpolate(frame, [COUNT_START, COUNT_END], [0, CRYPTO_EXCHANGES.length], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }),
  );

export const ExchangeCount: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // each tile lights up, in scattered order, on the frame the counter passes it
  const litFrames = useMemo(() => {
    const order = CRYPTO_EXCHANGES.map((_, i) => i).sort(
      (a, b) => random(`tile-${a}`) - random(`tile-${b}`),
    );
    const rank: number[] = [];
    order.forEach((tile, r) => {
      rank[tile] = r;
    });
    return rank.map((r) => {
      for (let f = COUNT_START; f <= COUNT_END; f++) {
        if (countAt(f) > r) {
          return f;
        }
      }
      return COUNT_END;
    });
  }, []);

  const count = countAt(frame);
  const pulse = Math.exp(-(frame % 15) / 4);
  const punch = interpolate(
    frame,
    [COUNT_END, COUNT_END + 4, COUNT_END + 14],
    [1, 1.09, 1],
    clamp,
  );
  const gridOpacity = interpolate(
    frame,
    [PREDICTION_AT - 10, PREDICTION_AT + 10],
    [1, 0.55],
    clamp,
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          padding: 34,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
          gridAutoRows: "1fr",
          gap: 12,
          opacity: gridOpacity,
        }}
      >
        {CRYPTO_EXCHANGES.map((name, i) => {
          const lit = frame >= litFrames[i];
          const flash = lit
            ? interpolate(
                frame,
                [litFrames[i], litFrames[i] + 12],
                [1, 0],
                clamp,
              )
            : 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                borderRadius: 12,
                textAlign: "center",
                fontFamily: sans,
                fontSize: 18,
                fontWeight: 500,
                lineHeight: 1.15,
                color: lit
                  ? "rgba(238, 240, 245, 0.62)"
                  : "rgba(238, 240, 245, 0.12)",
                border: `1px solid ${lit ? "rgba(0, 240, 168, 0.35)" : "rgba(255, 255, 255, 0.06)"}`,
                background: `rgba(0, 240, 168, ${0.04 + 0.4 * flash})`,
              }}
            >
              {name}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 62% at 50% 50%, rgba(6, 7, 10, 0.96) 45%, rgba(6, 7, 10, 0.6) 78%, transparent 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 110,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 300,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            fontVariantNumeric: "tabular-nums",
            color: C.text,
            transform: `scale(${punch})`,
            textShadow: `0 0 ${40 + 60 * pulse}px rgba(0, 240, 168, ${0.35 + 0.25 * pulse})`,
          }}
        >
          {count}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 60,
            color: C.text,
            opacity: interpolate(frame, [8, 14], [0, 1], clamp),
          }}
        >
          exchanges<span style={{ color: C.dim }}>, one API</span>
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: interpolate(
              frame,
              [PREDICTION_AT, PREDICTION_AT + 5],
              [0, 1],
              clamp,
            ),
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 40,
              ...gradientText,
            }}
          >
            + prediction markets
          </span>
          {PREDICTION_MARKETS.map((name, i) => {
            const p = spring({
              frame: frame - PREDICTION_AT - 6 - i * 4,
              fps,
              config: { damping: 11, stiffness: 200 },
            });
            return (
              <span
                key={name}
                style={{
                  transform: `scale(${p})`,
                  padding: "10px 24px",
                  borderRadius: 999,
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 32,
                  color: C.text,
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 34,
            display: "flex",
            gap: 14,
            fontFamily: mono,
            fontSize: 26,
            color: C.dim,
          }}
        >
          {CAPABILITIES.map((capability, i) => (
            <span
              key={capability}
              style={{
                opacity: interpolate(
                  frame,
                  [CAPABILITIES_AT + i * 3, CAPABILITIES_AT + i * 3 + 6],
                  [0, 1],
                  clamp,
                ),
              }}
            >
              {i > 0 ? "· " : ""}
              {capability}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
