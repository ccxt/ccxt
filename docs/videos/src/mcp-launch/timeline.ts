import type { Cue } from "../components/Captions";
import { sec } from "../timeline";

export { FPS, sec } from "../timeline";

// Every hit point lands on the 120 BPM soundtrack (scripts/music-mcp-launch.mjs):
// logo slam 4s, tool calls drop 16s, order fills 26s, exchange count 30s, call to action 36s.
export const SCENES = {
  intro: { from: 0, duration: sec(6) },
  terminal: { from: sec(6), duration: sec(24) },
  count: { from: sec(30), duration: sec(6) },
  cta: { from: sec(36), duration: sec(5.5) },
};

export const TOTAL_FRAMES = sec(41.5);

export const CAPTIONS: Cue[] = [
  {
    from: 6,
    to: 10,
    text: "One command. Claude Code shown here, any MCP agent works.",
  },
  { from: 10, to: 14.4, text: "Then just ask your agent, in plain English" },
  { from: 14.4, to: 16, text: "No API keys needed for market data" },
  {
    from: 16,
    to: 20,
    text: "It pulls live prices from Binance, Bybit and Kraken via ccxt",
  },
  {
    from: 20,
    to: 23.4,
    text: "…and answers with real spreads, within and across exchanges",
  },
  { from: 23.4, to: 26, text: "It doesn't just read the market. It trades." },
  {
    from: 26,
    to: 30,
    text: "Your API keys stay on your machine. The model never sees them.",
  },
  { from: 30, to: 33, text: "Over 100 exchanges behind one unified API" },
  {
    from: 33,
    to: 36,
    text: "Plus prediction markets like Polymarket and Kalshi",
  },
  {
    from: 36,
    to: 41.5,
    text: "Free, open source, works with any MCP agent. Pause to copy.",
  },
];
