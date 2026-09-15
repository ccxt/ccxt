import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CcxtMark } from "../components/CcxtMark";
import { C, clamp, gradientText, mono, sans } from "../theme";
import type { Release } from "./types";

// Go modules in a repo subdirectory are tagged "go/vX.Y.Z"; `go get …/go/v4@vX.Y.Z` resolves that tag.
const installRows = (version: string) => [
  { lang: "JavaScript", command: `npm install ccxt@${version}` },
  { lang: "Python", command: `pip install ccxt==${version}` },
  { lang: "PHP", command: `composer require ccxt/ccxt:${version}` },
  { lang: "C#", command: `dotnet add package ccxt --version ${version}` },
  { lang: "Go", command: `go get github.com/ccxt/ccxt/go/v4@v${version}` },
];

// Everything is in place ~0.6s after the cut, then held so viewers can pause and copy.
export const ReleaseCta: React.FC<{ release: Release }> = ({ release }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const version = release.tag.replace(/^v/, "");
  const pop = (at: number): React.CSSProperties => {
    const p = spring({
      frame: frame - at,
      fps,
      config: { damping: 16, stiffness: 200 },
    });
    return {
      opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
      transform: `translateY(${(1 - p) * 30}px)`,
    };
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{ ...pop(0), display: "flex", alignItems: "center", gap: 26 }}
      >
        <CcxtMark size={84} />
        <span
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 100,
            letterSpacing: "-0.04em",
            color: C.text,
          }}
        >
          ccxt <span style={gradientText}>{release.tag}</span>
          <span style={{ color: C.dim }}> is out</span>
        </span>
      </div>
      <div
        style={{
          ...pop(4),
          marginTop: 44,
          padding: "18px 48px 24px",
          borderRadius: 18,
          background: "rgba(12, 15, 21, 0.95)",
          border: `2px solid ${C.accent}`,
          boxShadow: "0 0 60px rgba(0, 240, 168, 0.18)",
        }}
      >
        <div
          style={{
            marginBottom: 8,
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.accent,
          }}
        >
          Update now
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            columnGap: 44,
            alignItems: "center",
          }}
        >
          {installRows(version).map(({ lang, command }, i) => (
            <div key={lang} style={{ display: "contents" }}>
              <div
                style={{
                  ...pop(6 + i * 2),
                  fontFamily: sans,
                  fontSize: 30,
                  fontWeight: 600,
                  color: C.dim,
                }}
              >
                {lang}
              </div>
              <div
                style={{
                  ...pop(6 + i * 2),
                  fontFamily: mono,
                  fontSize: 36,
                  lineHeight: "54px",
                  // "==" and "--" must render as typed so the commands can be copied from a paused frame
                  fontVariantLigatures: "none",
                  color: C.text,
                }}
              >
                {command}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          ...pop(16),
          marginTop: 40,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 42,
          color: C.text,
        }}
      >
        Full notes: {release.url.replace(/^https:\/\//, "")}
      </div>
    </AbsoluteFill>
  );
};
