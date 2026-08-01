// OpenRouter helpers for the AI assistant. The server holds the key; the client
// never sees it. The free-model list is fetched from OpenRouter (not hardcoded)
// and cached for the process lifetime.

import type { LanguageId } from "../languages";

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

export type FreeModel = { id: string; label: string };

// OpenRouter's own free-model router — picks whichever free model is up.
const AUTO_FREE_MODEL: FreeModel = { id: "openrouter/free", label: "Auto (free router)" };

// Individual free slugs rotate off the free tier without notice, so the real
// list is fetched from OpenRouter at startup (see getFreeModels). This is only
// the last-ditch list used when that fetch fails.
export const FALLBACK_FREE_MODELS: FreeModel[] = [
  AUTO_FREE_MODEL,
  { id: "openai/gpt-oss-20b:free", label: "OpenAI: gpt-oss-20b" },
  { id: "google/gemma-4-31b-it:free", label: "Google: Gemma 4 31B" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "NVIDIA: Nemotron 3 Super" },
];

type OpenRouterModel = {
  id?: unknown;
  name?: unknown;
  supported_parameters?: unknown;
  architecture?: { output_modalities?: unknown } | null;
};

type FreeEntry = OpenRouterModel & { id: string };

// Any of these means the model takes chat-completion knobs (filters out
// embedding/moderation-style entries that can't answer a prompt).
const CHAT_PARAMS = ["temperature", "max_tokens", "tools", "stop"];

// Free-tier slugs that advertise chat params but aren't general assistants
// (guardrail classifiers, embedders).
const NON_ASSISTANT = /safety|guard|moderation|embed|rerank/i;

function labelFor(model: FreeEntry): string {
  const name = typeof model.name === "string" ? model.name.replace(/\s*\(free\)\s*$/i, "").trim() : "";
  return name || model.id.replace(/:free$/, "");
}

function isChatCapable(model: FreeEntry): boolean {
  if (NON_ASSISTANT.test(model.id)) return false;
  const params = Array.isArray(model.supported_parameters) ? model.supported_parameters : [];
  const outputs = Array.isArray(model.architecture?.output_modalities)
    ? model.architecture.output_modalities
    : [];
  const textOut = outputs.length === 0 || outputs.includes("text");
  return textOut && params.some((p) => CHAT_PARAMS.includes(p as string));
}

// Exported for testing: turns a /api/v1/models payload into the picker list.
export function parseFreeModels(payload: unknown): FreeModel[] {
  const data = (payload as { data?: unknown } | null)?.data;
  const entries = (Array.isArray(data) ? data : []) as OpenRouterModel[];
  const free = entries.filter((m): m is FreeEntry => typeof m.id === "string" && m.id.endsWith(":free"));
  const chat = free.filter(isChatCapable);
  const usable = chat.length > 0 ? chat : free;
  if (usable.length === 0) return [];
  return [AUTO_FREE_MODEL, ...usable.map((m) => ({ id: m.id, label: labelFor(m) }))];
}

// Cached for the process lifetime: the list is warmed once at boot
// (instrumentation.ts) and read from memory on every request after that.
let cachedFreeModels: FreeModel[] | null = null;
let loadPromise: Promise<FreeModel[]> | null = null;

async function fetchFreeModels(): Promise<FreeModel[]> {
  // Bounded: this sits in front of every AI request, and the deployment's
  // egress proxy can black-hole rather than refuse.
  const res = await fetch(OPENROUTER_MODELS_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`OpenRouter models request failed: ${res.status}`);
  const models = parseFreeModels(await res.json());
  if (models.length === 0) throw new Error("OpenRouter returned no free models");
  return models;
}

// Server-side only (needs network). A success is cached permanently; a failure
// is not, so the next call retries instead of pinning the fallback forever.
export async function getFreeModels(): Promise<FreeModel[]> {
  if (cachedFreeModels) return cachedFreeModels;
  if (!loadPromise) {
    loadPromise = fetchFreeModels()
      .then((models) => {
        cachedFreeModels = models;
        return models;
      })
      .catch((e) => {
        console.error("[ai] free-model list unavailable, using fallback:", e instanceof Error ? e.message : e);
        return FALLBACK_FREE_MODELS;
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export function getDefaultModelId(models: FreeModel[]): string {
  return models[0]?.id ?? FALLBACK_FREE_MODELS[0].id;
}

export function isFreeModelId(id: string, models: FreeModel[]): boolean {
  return models.some((m) => m.id === id);
}

const LANGUAGE_NAMES: Record<LanguageId, string> = {
  ts: "TypeScript (run natively by Node, ESM, `import ccxt from 'ccxt'`, top-level await, types from ccxt)",
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
- Prediction markets (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid) live under the ccxt.prediction namespace and need ccxt >= 4.5.66. Construct with new ccxt.prediction.polymarket(). Search events with fetchEvents({ query: 'Bitcoin', limit: 5 }) — it must be scoped by at least one selector (query, queries, tags, eventId, or slug). Each event has .markets[], each market has .outcomes[] (and a .resolved flag), each outcome has an .outcome handle and a .label (e.g. 'Yes'/'No', though categorical markets use other labels); pass the .outcome handle to fetchTicker/fetchOrderBook/fetchOHLCV. An outcome's price is the market-implied probability. Resolved/closed markets have no order book, so skip markets where .resolved is true and wrap fetchTicker in a try/catch when scanning search results. In Python and PHP these exchanges are async-only: in Python use "import ccxt.prediction" with asyncio and await; there is no synchronous prediction API.
- Keep answers concise. When you give code, put it in a single fenced code block so it can be inserted into the editor.

The user's current editor contents:
\`\`\`
${code.slice(0, 4000)}
\`\`\``;
}
