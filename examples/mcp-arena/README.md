# CCXT MCP arena

Give several LLMs $100, one hour, and the [CCXT MCP server](https://docs.ccxt.com/docs/mcp). Same prompt, same tools, same market, all at the same time. Then read what they did.

This is the harness behind the blog post [*We gave nine AI models $100 and an hour to trade. Most of them lost.*](https://docs.ccxt.com/blog/we-gave-ai-models-100-dollars).

## What each agent gets

- **`ccxt`**: the real `ccxt-mcp` server with no accounts configured, so it only exposes market data: tickers, order books, candles, trades, funding rates, prediction-market events and WebSocket streams on 100+ exchanges.
- **`account`**: `paper-broker.mjs`, a small MCP server that holds a paper trading account.
  - Market orders walk the venue's live order book through CCXT and pay that market's taker fee.
  - Limit orders rest until the live price touches them and pay maker fees. Trigger (stop / take-profit) orders are also supported.
  - Perpetuals pay real funding and are liquidated at 0.5% maintenance margin.
  - Cash starts as 100 USDT on OKX. It can be moved between okx, bitget, gate, kucoin and hyperliquid for 1 USD, and arrives 5 minutes later.
  - Every call, fill and per-minute equity point is written to disk.

The prompt is in `arena.mjs` (`SYSTEM` and `TASK`). If an agent ends its turn early, the harness tells it how many minutes are left and that it can reply `DONE`. When the hour ends, it asks each agent what it did and why.

Non-Anthropic models run through OpenRouter with the plain tool loop in `arena.mjs`. Claude models run through `claude -p`, with the default system prompt replaced, built-in tools disabled and only the two MCP servers attached.

## Run it

```bash
npm install
```

```bash
OPENROUTER_API_KEY=... node arena.mjs --run round1 --minutes 60 --costCap 5
```

```bash
node analyze.mjs runs/round1
```

Pass `--only gpt,gemini` to run a subset. Edit `AGENTS` in `arena.mjs` to change models. Run output (transcripts, events, equity curves) goes to `runs/<run>/<agent>/`.

## Caveats

- This is paper trading. There's no queue position, no partial fills on resting orders and no latency, and a stop fills at the book after the trigger, not at the trigger price.
- Binance and Bybit are missing because they block the US cloud region the arena ran in (HTTP 451/403). Run it somewhere else and add them to `VENUES` in `paper-broker.mjs`.
- One hour on $100 says very little about skill. Read the results as behaviour, not as a leaderboard.
