import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ExchangeLogo } from "../components/ExchangeLogo";
import { ORDER, SNAPSHOT } from "../data/exchanges";
import { C, clamp, mono, sans } from "../../theme";

const INSTALL_COMMAND = "claude mcp add ccxt -- npx -y ccxt-mcp";
const PROMPT = "what's the BTC/USDT spread across Binance, Bybit and Kraken?";
const PROMPT_SPEED = 0.53; // chars per frame
const TRADE_PROMPT = "buy $20 of BTC on Binance at that ask";

// Local frames — this scene starts at 6s, a beat is 15 frames.
const T = {
  typeInstall: 9,
  installOutput: 57,
  secondPrompt: 66,
  typeClaude: 80,
  session: 120, // 10s
  typePrompt: 132,
  submit: 252,
  toolCalls: 300, // 16s, on the music drop
  callStagger: 18,
  callDuration: 20,
  table: 362,
  rowStagger: 12,
  answer: 420,
  answerLine2: 450,
  highlight: 482,
  tradePrompt: 522, // 23.4s
  typeTrade: 528,
  tradeSubmit: 576,
  orderCall: 582,
  filled: 600, // 26s, on the music hit
  tradeAnswer: 618,
};

const usd = (n: number) =>
  "$" +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const bps = (amount: number, price: number) => (amount / price) * 10000;

const ROWS = SNAPSHOT.map((row) => ({
  ...row,
  spread: row.ask - row.bid,
  mid: (row.bid + row.ask) / 2,
}));
const bestAsk = ROWS.reduce((a, b) => (b.ask < a.ask ? b : a));
const bestBid = ROWS.reduce((a, b) => (b.bid > a.bid ? b : a));
const gap = bestBid.bid - bestAsk.ask;
const orderValue = ORDER.amount * ORDER.price;

type Segment = { text: string; color?: string; weight?: number };

const ANSWER_LINE_1: Segment[] = [
  { text: "Each book is about one tick wide: " },
  ...ROWS.flatMap((row, i) => [
    { text: `${row.name} ` },
    { text: usd(row.spread), color: C.green },
    { text: i < ROWS.length - 1 ? ", " : "." },
  ]),
];

const ANSWER_LINE_2: Segment[] = [
  { text: "Across venues: " },
  { text: `${bestAsk.name} ask ${usd(bestAsk.ask)}`, color: C.accent },
  { text: " vs " },
  { text: `${bestBid.name} bid ${usd(bestBid.bid)}`, color: C.accent },
  { text: " → " },
  {
    text: `${usd(gap)} gap (${bps(gap, bestAsk.ask).toFixed(1)} bps)`,
    weight: 700,
  },
];

const TRADE_ANSWER_LINE_1: Segment[] = [
  { text: "Done. Bought " },
  { text: `${ORDER.amount} BTC`, weight: 700 },
  { text: " on Binance at " },
  { text: usd(ORDER.price), color: C.accent },
  { text: ` (≈ ${usd(orderValue)}).` },
];

const TRADE_ANSWER_LINE_2: Segment[] = [
  {
    text: "It filled instantly and is recorded in your local audit journal.",
    color: C.dim,
  },
];

const typed = (
  text: string,
  frame: number,
  start: number,
  charsPerFrame: number,
) => text.slice(0, Math.max(0, Math.floor((frame - start) * charsPerFrame)));

const appear = (frame: number, at: number): React.CSSProperties => ({
  opacity: interpolate(frame, [at, at + 4], [0, 1], clamp),
  transform: `translateY(${interpolate(frame, [at, at + 6], [10, 0], clamp)}px)`,
});

const Cursor: React.FC<{ frame: number; typing: boolean }> = ({
  frame,
  typing,
}) => (
  <span
    style={{
      display: "inline-block",
      width: "0.62em",
      height: "1.15em",
      marginLeft: 3,
      verticalAlign: "-0.22em",
      background: C.text,
      opacity: typing || Math.floor(frame / 12) % 2 === 0 ? 0.85 : 0,
    }}
  />
);

const Dot: React.FC<{ color: string; opacity?: number; size?: number }> = ({
  color,
  opacity = 1,
  size = 16,
}) => (
  <span
    style={{
      display: "inline-block",
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      background: color,
      opacity,
    }}
  />
);

const Streamed: React.FC<{
  segments: Segment[];
  frame: number;
  at: number;
}> = ({ segments, frame, at }) => {
  let budget = Math.max(0, Math.floor((frame - at) * 3));
  return (
    <>
      {segments.map((segment, i) => {
        const shown = segment.text.slice(0, budget);
        budget -= shown.length;
        return (
          <span
            key={i}
            style={{ color: segment.color, fontWeight: segment.weight }}
          >
            {shown}
          </span>
        );
      })}
    </>
  );
};

// Grows a new block from zero height, so the bottom-anchored terminal scrolls smoothly
// instead of jumping when content passes the bottom of the window.
const Reveal: React.FC<{
  frame: number;
  at: number;
  height: number;
  children: React.ReactNode;
}> = ({ frame, at, height, children }) => (
  <div
    style={{
      flexShrink: 0,
      overflow: frame >= at + 8 ? "visible" : "hidden",
      maxHeight:
        frame >= at + 8
          ? "none"
          : interpolate(frame, [at, at + 8], [0, height], {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            }),
      opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
    }}
  >
    <div style={{ paddingTop: 20 }}>{children}</div>
  </div>
);

const PromptBox: React.FC<{
  frame: number;
  text: string;
  start: number;
  speed: number;
}> = ({ frame, text, start, speed }) => (
  <div
    style={{
      width: 1180,
      padding: "12px 22px",
      border: `2px solid ${C.border}`,
      borderRadius: 12,
    }}
  >
    <span style={{ color: C.dim }}>&gt; </span>
    {typed(text, frame, start, speed)}
    <Cursor
      frame={frame}
      typing={frame >= start && frame < start + Math.ceil(text.length / speed)}
    />
  </div>
);

const SubmittedPrompt: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      width: "fit-content",
      padding: "0 14px",
      borderRadius: 8,
      background: "rgba(255, 255, 255, 0.06)",
      color: C.dim,
    }}
  >
    &gt; {text}
  </div>
);

const ShellPrompt: React.FC = () => (
  <>
    <span style={{ color: C.green }}>➜</span>{" "}
    <span style={{ color: C.cyan, fontWeight: 700 }}>~/projects</span>{" "}
  </>
);

const ShellPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const installTyped = T.typeInstall + INSTALL_COMMAND.length;
  return (
    <div>
      <div>
        <ShellPrompt />
        {typed(INSTALL_COMMAND, frame, T.typeInstall, 1)}
        {frame < installTyped + 4 ? (
          <Cursor
            frame={frame}
            typing={frame >= T.typeInstall && frame < installTyped}
          />
        ) : null}
      </div>
      <div style={{ ...appear(frame, T.installOutput), color: C.dim }}>
        Added stdio MCP server <span style={{ color: C.text }}>ccxt</span> with
        command: npx -y ccxt-mcp to local config
      </div>
      <div style={appear(frame, T.secondPrompt)}>
        <ShellPrompt />
        {typed("claude", frame, T.typeClaude, 1)}
        <Cursor
          frame={frame}
          typing={frame >= T.typeClaude && frame < T.typeClaude + 6}
        />
      </div>
    </div>
  );
};

const LogoPop: React.FC<{ id: string; frame: number; at: number }> = ({
  id,
  frame,
  at,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 9, stiffness: 170, mass: 0.7 },
  });
  const check = spring({
    frame: frame - at - T.callDuration,
    fps,
    config: { damping: 12, stiffness: 220 },
  });
  return (
    <div
      style={{
        position: "relative",
        opacity: frame >= at ? 1 : 0,
        transform: `translateY(${(1 - p) * 90}px) scale(${p}) rotate(${(1 - p) * -14}deg)`,
      }}
    >
      <ExchangeLogo id={id} size={132} />
      <div
        style={{
          position: "absolute",
          right: -12,
          top: -12,
          width: 42,
          height: 42,
          borderRadius: 21,
          background: C.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 4px #0a0c11",
          transform: `scale(${check})`,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#06140c"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

const TABLE_COLUMNS = "1.4fr 1fr 1fr 1.1fr";

const PriceCell: React.FC<{ value: string; highlight: number }> = ({
  value,
  highlight,
}) => (
  <span
    style={{
      justifySelf: "end",
      padding: "0 12px",
      borderRadius: 8,
      fontVariantNumeric: "tabular-nums",
      color: highlight > 0.5 ? C.accent : C.text,
      background: `rgba(0, 240, 168, ${0.14 * highlight})`,
      boxShadow: `0 0 0 2px rgba(0, 240, 168, ${highlight})`,
    }}
  >
    {value}
  </span>
);

const ResultsTable: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = interpolate(
    frame,
    [T.highlight, T.highlight + 8],
    [0, 1],
    clamp,
  );
  return (
    <div
      style={{
        ...appear(frame, T.table),
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: TABLE_COLUMNS,
          padding: "8px 30px",
          borderBottom: `1px solid ${C.border}`,
          fontFamily: sans,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.dim,
        }}
      >
        <span>BTC/USDT</span>
        <span style={{ textAlign: "right" }}>Bid</span>
        <span style={{ textAlign: "right" }}>Ask</span>
        <span style={{ textAlign: "right" }}>Spread</span>
      </div>
      {ROWS.map((row, i) => {
        const at = T.table + 6 + i * T.rowStagger;
        const roll = interpolate(frame, [at, at + 14], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const settled = frame >= at + 14;
        return (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: TABLE_COLUMNS,
              alignItems: "center",
              padding: "10px 30px",
              borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
              opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
              transform: `translateX(${(1 - roll) * -30}px)`,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 600,
              }}
            >
              <ExchangeLogo id={row.id} size={44} />
              {row.name}
            </span>
            <PriceCell
              value={usd(row.bid - (1 - roll) * 180)}
              highlight={row.id === bestBid.id ? glow : 0}
            />
            <PriceCell
              value={usd(row.ask - (1 - roll) * 180)}
              highlight={row.id === bestAsk.id ? glow : 0}
            />
            <span
              style={{ textAlign: "right", color: settled ? C.green : C.dim }}
            >
              {settled ? usd(row.spread) : "…"}
              <span style={{ color: C.dim, fontSize: 21 }}>
                {settled ? `  ${bps(row.spread, row.mid).toFixed(3)} bps` : ""}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

const AgentAnswer: React.FC<{
  frame: number;
  lines: [Segment[], Segment[]];
  at: number;
  line2At: number;
}> = ({ frame, lines, at, line2At }) => (
  <div style={{ display: "flex", gap: 16, fontSize: 27 }}>
    <span style={{ paddingTop: 15 }}>
      <Dot color={C.text} size={14} />
    </span>
    <div>
      <div style={{ minHeight: 44 }}>
        <Streamed segments={lines[0]} frame={frame} at={at} />
      </div>
      <div style={{ minHeight: 44 }}>
        <Streamed segments={lines[1]} frame={frame} at={line2At} />
      </div>
    </div>
  </div>
);

const ToolPhase: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontSize: 26,
        }}
      >
        {ROWS.map((row, i) => {
          const at = T.toolCalls + i * T.callStagger;
          const done = frame >= at + T.callDuration;
          return (
            <div
              key={row.id}
              style={{
                ...appear(frame, at),
                display: "flex",
                alignItems: "center",
                gap: 14,
                whiteSpace: "pre",
              }}
            >
              <Dot
                color={done ? C.green : C.text}
                opacity={done || Math.floor(frame / 3) % 2 === 0 ? 1 : 0.25}
                size={14}
              />
              <span>
                <span style={{ fontWeight: 700 }}>ccxt</span>
                <span style={{ color: C.dim }}> · </span>
                <span style={{ color: C.cyan }}>get_tickers</span>
                <span style={{ color: C.dim }}>(exchange: </span>
                <span style={{ color: C.string }}>"{row.id}"</span>
                <span style={{ color: C.dim }}>, symbols: </span>
                <span style={{ color: C.string }}>["BTC/USDT"]</span>
                <span style={{ color: C.dim }}>)</span>
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        {ROWS.map((row, i) => (
          <LogoPop
            key={row.id}
            id={row.id}
            frame={frame}
            at={T.toolCalls + i * T.callStagger}
          />
        ))}
      </div>
    </div>
    {frame >= T.table ? <ResultsTable frame={frame} /> : null}
    {frame >= T.answer ? (
      <div style={appear(frame, T.answer)}>
        <AgentAnswer
          frame={frame}
          lines={[ANSWER_LINE_1, ANSWER_LINE_2]}
          at={T.answer}
          line2At={T.answerLine2}
        />
      </div>
    ) : null}
  </>
);

const Arg: React.FC<{ name: string; value: string; last?: boolean }> = ({
  name,
  value,
  last,
}) => (
  <>
    <span style={{ color: C.dim }}>{name}: </span>
    <span style={{ color: C.string }}>{value}</span>
    <span style={{ color: C.dim }}>{last ? ")" : ", "}</span>
  </>
);

const OrderCall: React.FC<{ frame: number }> = ({ frame }) => {
  const done = frame >= T.filled;
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        fontSize: 26,
        lineHeight: "40px",
        whiteSpace: "pre",
      }}
    >
      <span style={{ paddingTop: 13 }}>
        <Dot
          color={done ? C.green : C.text}
          opacity={done || Math.floor(frame / 3) % 2 === 0 ? 1 : 0.25}
          size={14}
        />
      </span>
      <div>
        <div>
          <span style={{ fontWeight: 700 }}>ccxt</span>
          <span style={{ color: C.dim }}> · </span>
          <span style={{ color: C.claude, fontWeight: 700 }}>create_order</span>
          <span style={{ color: C.dim }}>(</span>
          <Arg name="account" value={`"${ORDER.account}"`} />
          <Arg name="symbol" value={`"${ORDER.symbol}"`} />
        </div>
        <div style={{ paddingLeft: "20ch" }}>
          <Arg name="side" value={`"${ORDER.side}"`} />
          <Arg name="type" value={`"${ORDER.type}"`} />
          <Arg name="amount" value={String(ORDER.amount)} />
          <Arg name="price" value={String(ORDER.price)} last />
        </div>
      </div>
    </div>
  );
};

const OrderResult: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - T.filled,
    fps,
    config: { damping: 11, stiffness: 220 },
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        paddingLeft: 28,
      }}
    >
      <span style={{ color: C.dim }}>└</span>
      <span
        style={{
          display: "inline-block",
          color: C.green,
          fontWeight: 700,
          transform: `scale(${0.6 + 0.4 * pop})`,
        }}
      >
        ✓ order {ORDER.id}
      </span>
      <span style={{ color: C.dim }}>·</span>
      <span
        style={{
          padding: "0 12px",
          borderRadius: 8,
          background: "rgba(61, 220, 132, 0.14)",
          color: C.green,
        }}
      >
        closed
      </span>
      <span style={{ color: C.dim }}>·</span>
      <span>
        filled {ORDER.amount} BTC @ {usd(ORDER.price)}
      </span>
    </div>
  );
};

const TradePhase: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", flexDirection: "column", marginTop: -20 }}>
    <Reveal frame={frame} at={T.tradePrompt} height={96}>
      {frame >= T.tradeSubmit ? (
        <SubmittedPrompt text={TRADE_PROMPT} />
      ) : (
        <PromptBox
          frame={frame}
          text={TRADE_PROMPT}
          start={T.typeTrade}
          speed={1}
        />
      )}
    </Reveal>
    {frame >= T.orderCall ? (
      <Reveal frame={frame} at={T.orderCall} height={100}>
        <OrderCall frame={frame} />
      </Reveal>
    ) : null}
    {frame >= T.filled ? (
      <Reveal frame={frame} at={T.filled} height={64}>
        <OrderResult frame={frame} />
      </Reveal>
    ) : null}
    {frame >= T.tradeAnswer ? (
      <Reveal frame={frame} at={T.tradeAnswer} height={108}>
        <AgentAnswer
          frame={frame}
          lines={[TRADE_ANSWER_LINE_1, TRADE_ANSWER_LINE_2]}
          at={T.tradeAnswer}
          line2At={T.tradeAnswer + 26}
        />
      </Reveal>
    ) : null}
  </div>
);

const SessionPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const submitted = frame >= T.submit;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          ...appear(frame, T.session),
          display: "flex",
          alignItems: "center",
          gap: 14,
          alignSelf: "flex-start",
          padding: "8px 22px",
          border: `2px solid ${C.claude}`,
          borderRadius: 12,
        }}
      >
        <span style={{ color: C.claude, fontWeight: 700 }}>claude</span>
        <span style={{ color: C.dim }}>· MCP</span>
        <Dot color={C.green} size={14} />
        <span>ccxt</span>
        <span style={{ color: C.dim }}>connected</span>
      </div>
      {submitted ? (
        <div style={appear(frame, T.submit)}>
          <SubmittedPrompt text={PROMPT} />
        </div>
      ) : (
        <div style={appear(frame, T.session + 4)}>
          <PromptBox
            frame={frame}
            text={PROMPT}
            start={T.typePrompt}
            speed={PROMPT_SPEED}
          />
        </div>
      )}
      {submitted && frame < T.toolCalls ? (
        <div
          style={{
            ...appear(frame, T.submit + 4),
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: C.claude,
          }}
        >
          <Dot
            color={C.claude}
            opacity={0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame / 3))}
            size={14}
          />
          Thinking{".".repeat(1 + (Math.floor(frame / 8) % 3))}
        </div>
      ) : null}
      {frame >= T.toolCalls ? <ToolPhase frame={frame} /> : null}
      {frame >= T.tradePrompt ? <TradePhase frame={frame} /> : null}
    </div>
  );
};

export const AgentTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 14,
  });
  const inTrade = frame >= T.orderCall;
  // Quotes: start zoomed in on the typing so it reads on a phone, pull back on the 16s drop.
  // Trade: zoom in on the order call and its result (anchored bottom-left, where the terminal
  // scrolls to). Both zooms are exactly 1 at T.orderCall, so switching the origin there is seamless.
  const quotesZoom = interpolate(
    frame,
    [T.toolCalls - 8, T.toolCalls + 10],
    [1.32, 1],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const tradeZoom = interpolate(
    frame,
    [T.orderCall, T.orderCall + 20],
    [1, 1.14],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const punch =
    frame >= T.filled ? 1 + 0.015 * Math.exp(-(frame - T.filled) / 5) : 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 56 }}>
      <div
        style={{
          width: 1640,
          height: 860,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: enter,
          transform: `scale(${(0.94 + 0.06 * enter) * (inTrade ? tradeZoom * punch : quotesZoom)})`,
          transformOrigin: inTrade ? "0% 100%" : "0% 0%",
          background: "rgba(10, 12, 17, 0.95)",
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          boxShadow: "0 40px 120px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 52,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            borderBottom: `1px solid ${C.border}`,
            background: "rgba(255, 255, 255, 0.025)",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
              <span
                key={color}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: color,
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: sans,
              fontSize: 20,
              color: C.dim,
            }}
          >
            {frame < T.session ? "zsh — ~/projects" : "claude — ~/projects"}
          </div>
        </div>
        {/* bottom-anchored like a real terminal: once content overflows, the oldest lines scroll off the top */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            overflow: "hidden",
            padding: "30px 44px",
            fontFamily: mono,
            fontSize: 28,
            lineHeight: "44px",
            color: C.text,
          }}
        >
          <div
            style={{
              minHeight: "100%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {frame < T.session ? (
              <ShellPhase frame={frame} />
            ) : (
              <SessionPhase frame={frame} />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
