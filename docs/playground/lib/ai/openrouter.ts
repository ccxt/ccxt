// OpenRouter helpers for the AI assistant. The server holds the key; the client
// never sees it.

import type { LanguageId } from "../languages";

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free models on OpenRouter (the ":free" suffix is the free tier). Order =
// preference; the picker defaults to the first.
// Free models rotate in and out of upstream rate-limits constantly; the API
// route falls back through this list (starting from the user's pick) until one
// responds, so the order is also the fallback priority.
export const FREE_MODELS = [
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B" },
  { id: "z-ai/glm-4.5-air:free", label: "GLM 4.5 Air" },
  { id: "moonshotai/kimi-k2.6:free", label: "Kimi K2.6" },
  { id: "qwen/qwen3-coder:free", label: "Qwen3 Coder" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B" },
];

export const DEFAULT_MODEL = FREE_MODELS[0].id;

export function isFreeModel(id: string): boolean {
  return FREE_MODELS.some((m) => m.id === id);
}

const LANGUAGE_NAMES: Record<LanguageId, string> = {
  js: "JavaScript (Node.js, ESM, ccxt imported as `import ccxt from 'ccxt'`, top-level await available)",
  ts: "TypeScript (Node.js native type-stripping, ESM, `import ccxt from 'ccxt'`, top-level await, types from ccxt)",
  python: "Python (synchronous ccxt, `import ccxt`, snake_case methods like fetch_ticker)",
  php: "PHP (synchronous ccxt, classes under the \\ccxt namespace, snake_case methods)",
  go: "Go (`github.com/ccxt/ccxt/go/v4/<exchange>`, `exchange := binance.New()`, PascalCase methods returning (result, error))",
  csharp: "C# (.NET, `using ccxt;`, `new Binance()`, async PascalCase methods like await exchange.FetchTicker(...))",
  java: "Java (`io.github.ccxt.exchanges.Binance`, `new Binance()`, camelCase methods returning CompletableFuture — call .join())",
};

export function buildSystemPrompt(language: LanguageId, code: string): string {
  return `You are a coding assistant embedded in the CCXT Playground, an online IDE for the CCXT cryptocurrency trading library.

The user is writing ${LANGUAGE_NAMES[language]}.

Rules:
- Only use CCXT PUBLIC endpoints (fetchTicker, fetchOrderBook, fetchOHLCV, fetchTrades, loadMarkets, fetchCurrencies, etc.). The playground has no API keys, so never write code that needs authentication, places orders, or calls private/trading/withdraw methods.
- Write complete, runnable snippets for the user's current language. Match the idioms above (method casing, imports, sync vs async).
- Prefer well-known exchanges (binance, kraken, coinbase, okx, bybit, bitfinex). Use unified symbols like 'BTC/USDT'.
- Keep answers concise. When you give code, put it in a single fenced code block so it can be inserted into the editor.

The user's current editor contents:
\`\`\`
${code.slice(0, 4000)}
\`\`\``;
}
