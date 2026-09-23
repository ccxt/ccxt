import {
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C } from "../theme";
import { useRise } from "./Text";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// A screen recording in a panel.
//
// No browser chrome by default: product captures are usually crops of one panel
// rather than a whole window, and a fake window frame around a cropped panel
// misrepresents what you are showing. Screen recordings also rarely match 16:9,
// so pass the clip's own aspect and let the layout work around it instead of
// cropping the panel apart.
export const ClipPanel: React.FC<{
  src: string;
  aspect: number;
  height: number;
  delay?: number;
  // Seconds to skip at the head, to land on the part worth showing.
  startFrom?: number;
}> = ({ src, aspect, height, delay = 0, startFrom }) => {
  const { s } = useRise(delay, 22);
  return (
    <div
      style={{
        width: height * aspect,
        height,
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: C.panel,
        boxShadow: "0 50px 120px rgba(0, 0, 0, 0.72)",
        opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(s, [0, 1], [42, 0])}px) scale(${interpolate(
          s,
          [0, 1],
          [0.95, 1],
        )})`,
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={startFrom ? Math.round(startFrom * 30) : undefined}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
};

// Cuts between captured app states.
//
// Every shot stays mounted so the browser has decoded it before it is needed —
// swapping a src mid-scene flashes. `fade={0}` is a hard cut and is handled
// separately because interpolate() rejects a zero-width input range.
export const ShotSequence: React.FC<{
  shots: { src: string; at: number }[];
  fade?: number;
}> = ({ shots, fade = 4 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {shots.map((shot, i) => {
        const next = shots[i + 1];
        const inOp =
          i === 0
            ? 1
            : fade <= 0
              ? frame >= shot.at
                ? 1
                : 0
              : interpolate(frame, [shot.at, shot.at + fade], [0, 1], CLAMP);
        const outOp = !next
          ? 1
          : fade <= 0
            ? frame >= next.at
              ? 0
              : 1
            : interpolate(frame, [next.at, next.at + fade], [1, 0], CLAMP);
        return (
          <Img
            key={shot.src}
            src={staticFile(shot.src)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: Math.min(inOp, outOp),
            }}
          />
        );
      })}
    </>
  );
};

// Plays a burst of consecutive screenshots as a loop.
//
// Grab them a second or so apart from a live screen and the result is real
// movement — order books updating, counters ticking — without a video file.
// Screenshots taken in one batch are simultaneous and will look frozen; put a
// wait between each capture.
export const Flipbook: React.FC<{
  frames: string[];
  holdFrames?: number;
  delay?: number;
  imgStyle?: React.CSSProperties;
}> = ({ frames, holdFrames = 6, delay = 0, imgStyle }) => {
  const frame = useCurrentFrame();
  const idx =
    Math.max(0, Math.floor((frame - delay) / holdFrames)) % frames.length;
  return (
    <>
      {frames.map((src, i) => (
        <Img
          key={src}
          src={staticFile(src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: i === idx ? 1 : 0,
            ...imgStyle,
          }}
        />
      ))}
    </>
  );
};

// Pointer that travels between keyframes given in the capture's own pixel
// coordinates, so you can read a target's position straight off a screenshot.
//
// Screenshots usually contain the real OS pointer as well — remove it with
// scripts/remove-cursor.mjs or the frame shows two.
export const Cursor: React.FC<{
  keys: { at: number; x: number; y: number; click?: boolean }[];
  // Size of the capture the coordinates were read from.
  shot: { width: number; height: number };
  scale?: number;
  color?: string;
}> = ({ keys, shot, scale = 1.15, color = C.accent }) => {
  const frame = useCurrentFrame();
  const ease = {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  } as const;
  const times = keys.map((k) => k.at);
  const x = interpolate(frame, times, keys.map((k) => k.x), ease);
  const y = interpolate(frame, times, keys.map((k) => k.y), ease);
  const appear = interpolate(frame, [keys[0].at - 6, keys[0].at], [0, 1], CLAMP);

  return (
    <>
      {keys
        .filter((k) => k.click)
        .map((k) => {
          const p = interpolate(frame, [k.at, k.at + 16], [0.2, 1.3], {
            ...CLAMP,
            easing: Easing.out(Easing.cubic),
          });
          const o = interpolate(
            frame,
            [k.at, k.at + 4, k.at + 16],
            [0, 0.75, 0],
            CLAMP,
          );
          if (o <= 0.001) return null;
          return (
            <div
              key={k.at}
              style={{
                position: "absolute",
                left: `${(k.x / shot.width) * 100}%`,
                top: `${(k.y / shot.height) * 100}%`,
                width: 90,
                height: 90,
                marginLeft: -45,
                marginTop: -45,
                borderRadius: "50%",
                border: `2.5px solid ${color}`,
                opacity: o,
                transform: `scale(${p})`,
              }}
            />
          );
        })}
      <div
        style={{
          position: "absolute",
          left: `${(x / shot.width) * 100}%`,
          top: `${(y / shot.height) * 100}%`,
          opacity: appear,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.65))",
        }}
      >
        <svg width={26} height={34} viewBox="0 0 26 34">
          <path
            d="M2 1 L2 25 L8.2 19.2 L12.2 28.6 L16.6 26.8 L12.6 17.6 L21 17.2 Z"
            fill="#fff"
            stroke="#0a0a0c"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};
