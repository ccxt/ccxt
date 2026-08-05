// AI assistant wiring. The playground server never talks to an inference
// provider directly and holds no provider credential: it POSTs a JSON
// {stream, messages} chat-completion request to the endpoint in
// PLAYGROUND_AI_URL and streams the reply straight back. That endpoint is
// operated alongside the deployment and owns everything about inference — which
// backend serves it, credentials, quotas — so none of it appears here, in the
// client bundle, or in a response header.

import type { LanguageId } from "../languages";

// Chat-completions endpoint the assistant posts to. Deployment-provided; unset
// disables the assistant (the API route answers 503).
export const AI_ENDPOINT = process.env.PLAYGROUND_AI_URL?.trim() ?? "";

const LANGUAGE_NAMES: Record<LanguageId, string> = {
  ts: "TypeScript (run natively by Node, ESM, `import ccxt from 'ccxt'`, top-level await, types from ccxt)",
  python: "Python (synchronous ccxt, `import ccxt`, snake_case methods like fetch_ticker)",
  php: "PHP (synchronous ccxt, classes under the \\ccxt namespace, snake_case methods)",
  go: "Go (`github.com/ccxt/ccxt/go/v4/<exchange>`, `exchange := binance.New()`, PascalCase methods returning (result, error))",
  csharp: "C# (.NET, `using ccxt;`, `new Binance()`, async PascalCase methods like await exchange.FetchTicker(...))",
  java: "Java (`io.github.ccxt.exchanges.Binance`, `new Binance()`, camelCase methods returning CompletableFuture — call .join())",
};

// The playground has one tab per language and the user switches freely, so an
// answer covers all of them. These are the fence tags the model is told to use.
export const FENCE_TAGS: Record<LanguageId, string> = {
  ts: "typescript",
  python: "python",
  php: "php",
  go: "go",
  csharp: "csharp",
  java: "java",
};

// Reverse lookup for the client: models tag fences with whatever alias they
// like, so accept the common ones. Unknown tags (bash, json, output) stay null.
const FENCE_ALIASES: Record<string, LanguageId> = {
  ts: "ts",
  mts: "ts",
  typescript: "ts",
  js: "ts",
  javascript: "ts",
  node: "ts",
  py: "python",
  python: "python",
  python3: "python",
  php: "php",
  go: "go",
  golang: "go",
  cs: "csharp",
  "c#": "csharp",
  csharp: "csharp",
  dotnet: "csharp",
  java: "java",
};

export function languageFromFence(tag: string): LanguageId | null {
  // Tolerates fence metadata some models add, e.g. ```python title=main.py
  const word = tag.trim().toLowerCase().split(/[\s,]+/)[0] ?? "";
  return FENCE_ALIASES[word] ?? null;
}

const ALL_LANGUAGES = Object.keys(FENCE_TAGS) as LanguageId[];

export function buildSystemPrompt(language: LanguageId, code: string): string {
  // Active tab first: the model writes it while the context is freshest, and it
  // is the block the user sees inserted straight away.
  const ordered = [language, ...ALL_LANGUAGES.filter((id) => id !== language)];
  const roster = ordered.map((id) => `  - \`\`\`${FENCE_TAGS[id]} → ${LANGUAGE_NAMES[id]}`).join("\n");

  return `You are a coding assistant embedded in the CCXT Playground, an online IDE for the CCXT cryptocurrency trading library.

The user's active tab is ${LANGUAGE_NAMES[language]}, so lead with it and write any explanation for it.

Rules:
- Only use CCXT PUBLIC endpoints (fetchTicker, fetchOrderBook, fetchOHLCV, fetchTrades, loadMarkets, fetchCurrencies, etc.). The playground has no API keys, so never write code that needs authentication, places orders, or calls private/trading/withdraw methods.
- Every code answer ships the SAME program in ALL ${ordered.length} playground languages, one fenced block each, in this order and with exactly these fence tags:
${roster}
- Never omit, merge, repeat or reorder a language, and never put two languages in one block. Each block is a complete, runnable program on its own, matching that language's idioms above (method casing, imports, sync vs async).
- Prefer well-known exchanges (binance, kraken, coinbase, okx, bybit, bitfinex). Use unified symbols like 'BTC/USDT'.
- Prediction markets (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid) live under the ccxt.prediction namespace and need ccxt >= 4.5.66. Construct with new ccxt.prediction.polymarket(). Search events with fetchEvents({ query: 'Bitcoin', limit: 5 }) — it must be scoped by at least one selector (query, queries, tags, eventId, or slug). Each event has .markets[], each market has .outcomes[] (and a .resolved flag), each outcome has an .outcome handle and a .label (e.g. 'Yes'/'No', though categorical markets use other labels); pass the .outcome handle to fetchTicker/fetchOrderBook/fetchOHLCV. An outcome's price is the market-implied probability. Resolved/closed markets have no order book, so skip markets where .resolved is true and wrap fetchTicker in a try/catch when scanning search results. In Python and PHP these exchanges are async-only: in Python use "import ccxt.prediction" with asyncio and await; there is no synchronous prediction API.
- Keep answers concise: a sentence or two of prose before the blocks, not a paragraph per language. Nothing but code inside the fences — no prose, no output samples.

The user's current editor contents (${LANGUAGE_NAMES[language].split(" (")[0]}):
\`\`\`
${code.slice(0, 4000)}
\`\`\``;
}
