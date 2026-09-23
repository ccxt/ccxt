import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Frames each scene stays mounted past its hold, so its tail overlaps the next
// scene's head.
export const CROSS = 12;

// Crossfade wrapper for one scene.
//
// The fading element must stay transparent. Every scene paints its own opaque
// background as its first child, and wrapping that in a *second* opaque fill
// means the incoming scene's background covers the outgoing one completely —
// every crossfade becomes a dip to black, which looks like a rendering fault
// rather than a transition. Only the inner AbsoluteFill carries opacity.
export const Scene: React.FC<{
  hold: number;
  children: React.ReactNode;
  // Slow push-in. A scene that is perfectly still for four seconds reads as a
  // frozen render; 1–2% over the hold is enough to avoid that.
  drift?: number;
}> = ({ hold, children, drift = 0.015 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 7, hold, hold + CROSS],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = 1 + (frame / (hold + CROSS)) * drift;
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};
