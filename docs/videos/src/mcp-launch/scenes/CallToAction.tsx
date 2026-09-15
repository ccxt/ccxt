import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CcxtMark } from "../../components/CcxtMark";
import { C, clamp, gradientText, mono, sans } from "../../theme";

// ccxt-mcp is a local stdio server, so it plugs into any MCP client that runs local servers.
// Syntax per each CLI's docs: `codex mcp add NAME -- CMD...`, `gemini mcp add NAME CMD ARGS...`.
// (ChatGPT itself only connects to remote HTTPS servers, so it is deliberately not listed.)
const INSTALLS = [
  {
    client: "Claude Code",
    color: C.claude,
    command: "claude mcp add ccxt -- npx -y ccxt-mcp",
  },
  {
    client: "OpenAI Codex",
    color: "#f2f2f2",
    command: "codex mcp add ccxt -- npx -y ccxt-mcp",
  },
  {
    client: "Gemini CLI",
    color: "#4796e3",
    command: "gemini mcp add ccxt npx -y ccxt-mcp",
  },
  { client: "any MCP client", color: C.accent, command: "npx -y ccxt-mcp" },
];

const HOSTS =
  "Claude Desktop · Cursor · VS Code · Windsurf · or your own agent, on any LLM";

// Everything is in place ~1s after the cut, then held static for 4.5s so viewers can pause and copy.
export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (at: number): React.CSSProperties => {
    const p = spring({
      frame: frame - at,
      fps,
      config: { damping: 16, stiffness: 190 },
    });
    return {
      opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
      transform: `translateY(${(1 - p) * 30}px)`,
    };
  };
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 110,
      }}
    >
      <div
        style={{ ...pop(0), display: "flex", alignItems: "center", gap: 22 }}
      >
        <CcxtMark size={66} />
        <span
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 68,
            letterSpacing: "-0.05em",
            color: C.text,
          }}
        >
          ccxt<span style={gradientText}>-mcp</span>
        </span>
      </div>
      <div
        style={{
          ...pop(3),
          marginTop: 16,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 80,
          letterSpacing: "-0.035em",
          color: C.text,
        }}
      >
        All of CCXT. Inside your AI agent.
      </div>
      <div
        style={{
          ...pop(7),
          marginTop: 36,
          padding: "16px 44px 22px",
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
          Works with any MCP agent
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            columnGap: 40,
            rowGap: 4,
            alignItems: "center",
          }}
        >
          {INSTALLS.map(({ client, color, command }, i) => (
            <div key={client} style={{ display: "contents" }}>
              <div
                style={{
                  ...pop(10 + i * 3),
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontFamily: sans,
                  fontSize: 30,
                  fontWeight: 600,
                  color: C.dim,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: color,
                  }}
                />
                {client}
              </div>
              <div
                style={{
                  ...pop(10 + i * 3),
                  fontFamily: mono,
                  fontSize: 36,
                  lineHeight: "52px",
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
          ...pop(22),
          marginTop: 30,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 56,
          color: C.text,
        }}
      >
        github.com/ccxt/ccxt
      </div>
      <div
        style={{
          ...pop(25),
          marginTop: 12,
          fontFamily: sans,
          fontSize: 28,
          color: C.dim,
        }}
      >
        {HOSTS}
      </div>
    </AbsoluteFill>
  );
};
