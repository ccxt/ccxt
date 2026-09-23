import { interpolate, useCurrentFrame } from "remotion";
import { C, mono } from "../theme";
import { useRise } from "./Text";

// Enough of a tokeniser for the handful of snippets a launch video shows, and
// deliberately not a real grammar. Order matters: comments and strings are
// taken first so a keyword inside either is not re-coloured.
const KEYWORDS = [
  "const", "let", "var", "await", "async", "function", "return", "new", "if",
  "import", "from", "export", "def", "class", "for", "in", "not", "true",
  "false", "True", "False", "None", "null", "echo", "var_dump", "print",
];

type Kind = "plain" | "kw" | "str" | "num" | "comment" | "fn" | "prop";

const COLOR: Record<Kind, string> = {
  plain: "#c9d1d9",
  kw: "#ff7b72",
  str: "#7ee787",
  num: "#79c0ff",
  comment: "#6e7681",
  fn: "#d2a8ff",
  prop: "#79c0ff",
};

const tokenise = (line: string): { text: string; kind: Kind }[] => {
  const out: { text: string; kind: Kind }[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (!buf) return;
    const kind: Kind = KEYWORDS.includes(buf)
      ? "kw"
      : /^[0-9_.]+$/.test(buf)
        ? "num"
        : "plain";
    out.push({ text: buf, kind });
    buf = "";
  };

  while (i < line.length) {
    const rest = line.slice(i);
    if (/^(\/\/|#)/.test(rest)) {
      flush();
      out.push({ text: rest, kind: "comment" });
      break;
    }
    const str = rest.match(/^(['"])(?:\\.|(?!\1).)*\1/);
    if (str) {
      flush();
      out.push({ text: str[0], kind: "str" });
      i += str[0].length;
      continue;
    }
    const call = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()/);
    if (call) {
      flush();
      out.push({ text: call[1], kind: "fn" });
      i += call[1].length;
      continue;
    }
    const prop = rest.match(/^[.>-]{1,2}([A-Za-z_][A-Za-z0-9_]*)/);
    if (prop) {
      flush();
      out.push({ text: prop[0].slice(0, prop[0].length - prop[1].length), kind: "plain" });
      out.push({ text: prop[1], kind: "prop" });
      i += prop[0].length;
      continue;
    }
    if (/[A-Za-z0-9_$.]/.test(line[i])) {
      buf += line[i];
    } else {
      flush();
      out.push({ text: line[i], kind: "plain" });
    }
    i++;
  }
  flush();
  return out;
};

// Rough width of a monospace line, for checking a snippet fits before you
// render 1,500 frames and find the last argument clipped off the panel.
export const codeWidth = (line: string, size: number) => line.length * size * 0.6 + 52;

// Editor panel. Lines reveal one at a time so the eye follows the call order
// rather than being handed a finished block.
//
// fontVariantLigatures is off because JetBrains Mono renders `==` and `=>` as
// single glyphs, and a command nobody can retype by hand is not copyable.
export const CodeBlock: React.FC<{
  lines: string[];
  tabs?: string[];
  activeTab?: number;
  title?: string;
  delay?: number;
  perLine?: number;
  size?: number;
  width?: number;
}> = ({
  lines,
  tabs,
  activeTab = 0,
  title,
  delay = 0,
  perLine = 4,
  size = 28,
  width = 1180,
}) => {
  const frame = useCurrentFrame();
  const { s } = useRise(delay, 22);
  const widest = Math.max(...lines.map((l) => codeWidth(l, size)));
  if (widest > width && typeof console !== "undefined") {
    // Surfaces in the Studio console rather than silently clipping.
    console.warn(
      `video/kit CodeBlock: widest line needs ~${Math.ceil(widest)}px but width is ${width}`,
    );
  }

  return (
    <div
      style={{
        width,
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: "#0c1016",
        boxShadow: "0 50px 120px rgba(0, 0, 0, 0.7)",
        opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
      }}
    >
      {tabs || title ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 46,
            background: "#090c11",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {tabs ? (
            tabs.map((name, i) => (
              <div
                key={name}
                style={{
                  fontFamily: mono,
                  fontSize: 18,
                  letterSpacing: 1,
                  padding: "7px 15px",
                  borderRadius: 7,
                  color: i === activeTab ? C.text : C.dim,
                  background: i === activeTab ? "#151a22" : "transparent",
                }}
              >
                {name}
              </div>
            ))
          ) : (
            <div style={{ fontFamily: mono, fontSize: 18, color: C.dim, letterSpacing: 2 }}>
              {title}
            </div>
          )}
        </div>
      ) : null}
      <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((line, i) => {
          const at = delay + 10 + i * perLine;
          const o = interpolate(frame, [at, at + 7], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const dx = interpolate(frame, [at, at + 9], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={`${line}-${i}`}
              style={{
                opacity: o,
                transform: `translateX(${dx}px)`,
                fontFamily: mono,
                fontVariantLigatures: "none",
                fontSize: size,
                lineHeight: 1.55,
                whiteSpace: "pre",
                minHeight: size * 0.8,
              }}
            >
              {tokenise(line).map((tok, j) => (
                <span key={j} style={{ color: COLOR[tok.kind] }}>
                  {tok.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
