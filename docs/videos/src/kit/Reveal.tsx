import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, mono } from "../theme";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// A product reveal: kicker, then flash, scale punch and shockwave on one frame.
//
// It only lands if the beat before it is nearly silent and nothing leads into
// it — drop the riser and the swell that mark your other cuts, or the reveal
// arrives already loud and there is nothing to reveal it against.
//
// Keep `flash` low. A white screen-blend over a dark frame washes the whole
// composition out; 0.4 reads as a camera flash, 0.85 reads as a broken render.
export const Reveal: React.FC<{
  at: number;
  kicker: string;
  sub?: string;
  children: React.ReactNode;
}> = ({ at, kicker, sub, children }) => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [at - 1, at, at + 7], [0, 0.4, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.quad),
  });
  const punch = interpolate(frame, [at, at + 6, at + 20], [1.08, 1.015, 1], CLAMP);
  const ring = interpolate(frame, [at, at + 30], [0.2, 2.8], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const ringOpacity = interpolate(frame, [at, at + 6, at + 30], [0, 0.4, 0], CLAMP);
  const kickerOpacity = interpolate(
    frame,
    [at - 24, at - 14, at - 2, at],
    [0, 1, 1, 0],
    CLAMP,
  );
  const body = interpolate(frame, [at, at + 6], [0, 1], CLAMP);
  const subOpacity = interpolate(frame, [at + 14, at + 28], [0, 1], CLAMP);

  return (
    <>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 620,
            height: 620,
            borderRadius: "50%",
            border: `2px solid ${C.accent}`,
            opacity: ringOpacity,
            transform: `scale(${ring})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: kickerOpacity,
            fontFamily: mono,
            fontSize: 30,
            letterSpacing: 12,
            color: C.dim,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26,
          opacity: body,
          transform: `scale(${punch})`,
        }}
      >
        {children}
        {sub ? (
          <div
            style={{
              opacity: subOpacity,
              fontFamily: mono,
              fontSize: 27,
              letterSpacing: 5,
              color: C.dim,
              textTransform: "uppercase",
            }}
          >
            {sub}
          </div>
        ) : null}
      </AbsoluteFill>

      <AbsoluteFill
        style={{ background: "#eaf6ef", opacity: flash, mixBlendMode: "screen" }}
      />
    </>
  );
};
