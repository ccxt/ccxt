import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, clamp, sans } from "../theme";
import { FPS, sec } from "../timeline";

// Times in seconds. Burn captions into every talking-point scene: Twitter and Telegram autoplay muted.
export type Cue = { from: number; to: number; text: string };

// Place at the composition root (not inside a Sequence) so cue times are absolute.
export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= sec(c.from) && frame < sec(c.to));
  if (!cue) {
    return null;
  }
  const start = sec(cue.from);
  const enter = interpolate(frame, [start, start + FPS / 6], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 54,
      }}
    >
      <div
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * 12}px)`,
          maxWidth: 1600,
          padding: "14px 32px",
          borderRadius: 14,
          background: "rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: C.text,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.25,
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
