import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CcxtMark } from "../../components/CcxtMark";
import { C, clamp, gradientText, mono, sans } from "../../theme";
import { CRYPTO_EXCHANGES } from "../data/exchanges";
import { sec } from "../timeline";

// Headline lines land on the soundtrack's thumps at 0s / 1s / 2s, the snare roll
// builds 3s–4s, and the logo slams in on the 4s downbeat.
const LINE_2 = sec(1);
const LINE_3 = sec(2);
const BUILD = sec(3);
const IMPACT = sec(4);

const Line: React.FC<{
  at: number;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 14, stiffness: 170, mass: 0.6 },
  });
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 700,
        lineHeight: 1.04,
        letterSpacing: "-0.04em",
        opacity: interpolate(frame, [at, at + 4], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 70}px) scale(${0.88 + 0.12 * p})`,
        filter: `blur(${interpolate(frame, [at, at + 8], [14, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < IMPACT) {
    const hit = [0, LINE_2, LINE_3].reduce(
      (acc, at) => acc + (frame >= at ? Math.exp(-(frame - at) / 7) : 0),
      0,
    );
    const push = interpolate(frame, [BUILD, IMPACT], [1, 1.4], {
      ...clamp,
      easing: Easing.in(Easing.cubic),
    });
    const shake =
      frame >= BUILD
        ? Math.sin(frame * 2.3) *
          interpolate(frame, [BUILD, IMPACT], [0, 9], clamp)
        : 0;
    const hundred = Math.round(
      interpolate(frame, [LINE_2, LINE_2 + 14], [0, 100], {
        ...clamp,
        easing: Easing.out(Easing.quad),
      }),
    );
    const tick = Math.floor(frame / 2);
    const ticker = [0, 1, 2, 3]
      .map((k) => CRYPTO_EXCHANGES[(tick + k * 7) % CRYPTO_EXCHANGES.length])
      .join("  ·  ");
    return (
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(0, 240, 168, ${0.2 * hit}), transparent 55%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${push}) translateX(${shake}px)`,
            opacity: interpolate(frame, [IMPACT - 5, IMPACT], [1, 0], clamp),
          }}
        >
          <Line at={0} style={{ fontSize: 112, color: C.text }}>
            Give your AI agent
          </Line>
          <Line
            at={LINE_2}
            style={{
              fontSize: 140,
              fontVariantNumeric: "tabular-nums",
              ...gradientText,
            }}
          >
            {hundred}+ crypto exchanges
          </Line>
          <div
            style={{
              fontFamily: mono,
              fontSize: 30,
              lineHeight: "56px",
              color: C.dim,
              whiteSpace: "pre",
              opacity: interpolate(
                frame,
                [LINE_2 + 4, LINE_2 + 10],
                [0, 0.85],
                clamp,
              ),
            }}
          >
            {ticker}
          </div>
          <Line at={LINE_3} style={{ fontSize: 96, color: C.text }}>
            and prediction markets.
          </Line>
        </div>
      </AbsoluteFill>
    );
  }

  const f = frame - IMPACT;
  const logo = spring({
    frame: f,
    fps,
    config: { damping: 10, stiffness: 150, mass: 0.8 },
  });
  const split = interpolate(f, [0, 10], [16, 0], clamp);
  const ring = interpolate(f, [0, 22], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const rise = (at: number): React.CSSProperties => ({
    opacity: interpolate(f, [at, at + 6], [0, 1], clamp),
    transform: `translateY(${interpolate(f, [at, at + 10], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)`,
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 40,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          border: `4px solid ${C.accent}`,
          transform: `scale(${0.3 + ring * 3.4})`,
          opacity: 1 - ring,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          transform: `scale(${0.5 + 0.5 * logo})`,
        }}
      >
        <CcxtMark
          size={180}
          style={{ transform: `rotate(${(1 - logo) * -120}deg)` }}
        />
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 170,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: C.text,
            textShadow:
              split > 0.5
                ? `${split}px 0 rgba(255, 40, 120, 0.75), ${-split}px 0 rgba(0, 200, 255, 0.75)`
                : "none",
          }}
        >
          ccxt<span style={{ ...gradientText, textShadow: "none" }}>-mcp</span>
        </div>
      </div>
      <div
        style={{
          ...rise(8),
          marginTop: 40,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 68,
          color: C.text,
          letterSpacing: "-0.02em",
        }}
      >
        All of CCXT. Inside your AI agent.
      </div>
      <div
        style={{
          ...rise(16),
          marginTop: 24,
          fontFamily: mono,
          fontSize: 26,
          color: C.dim,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        The official CCXT MCP server
      </div>
    </AbsoluteFill>
  );
};
