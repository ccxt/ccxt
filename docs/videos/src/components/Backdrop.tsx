import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

// One continuous background under every scene, so the grid keeps moving across cuts.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const gridMask = "linear-gradient(to top, black 5%, transparent 85%)";
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0, 240, 168, 0.13), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-50%",
          width: "200%",
          height: "75%",
          bottom: "-22%",
          transform: "perspective(700px) rotateX(64deg)",
          backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
          backgroundSize: "96px 96px",
          backgroundPosition: `0px ${frame * 3}px`,
          maskImage: gridMask,
          WebkitMaskImage: gridMask,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
