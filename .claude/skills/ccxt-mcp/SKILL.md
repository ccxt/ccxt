---
name: ccxt-mcp
description: Official CCXT MCP (Model Context Protocol) server — connect an AI agent to 100+ cryptocurrency exchanges and prediction markets for market data, balances, and opt-in trading. Covers installing the server in Claude Desktop/Code, Cursor, VS Code and other MCP hosts; configuring named accounts and API keys (kept local, never seen by the model); the capability tiers and safety rails; sandbox/testnet trading; and how to drive the tools. Use when the user wants an agent to fetch prices/order books/candles, check balances/orders/positions, place or cancel orders, or explore prediction markets across exchanges.
---

# CCXT MCP Server

`ccxt-mcp` is the official CCXT Model Context Protocol server. It runs **locally over stdio** and lets an AI agent (Claude Desktop/Code, Cursor, VS Code, Windsurf, …) use the unified CCXT API across 100+ crypto exchanges and prediction markets.

- npm: `ccxt-mcp` · runs via `npx -y ccxt-mcp` · source: https://github.com/ccxt/ccxt/tree/master/mcp
- Full docs: https://docs.ccxt.com/docs/mcp

Key property: **your API keys stay on your machine and the model never sees them.** Tools reference accounts by a name you choose; credentials are never tool parameters and never appear in results.

## Install

Requires Node.js ≥ 18. Pick the host:

- **Claude Code**: `claude mcp add ccxt -- npx -y ccxt-mcp`
- **Claude Desktop** / **Cursor** / **Windsurf** — add to the host's MCP config:
  ```json
  { "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
  ```
- **VS Code** (`.vscode/mcp.json`) — use `inputs` for encrypted key storage:
  ```json
  {
    "inputs": [
      { "id": "binance-key", "type": "promptString", "password": true },
      { "id": "binance-secret", "type": "promptString", "password": true }
    ],
    "servers": { "ccxt": {
      "command": "npx", "args": ["-y", "ccxt-mcp"],
      "env": { "BINANCE_APIKEY": "${input:binance-key}", "BINANCE_SECRET": "${input:binance-secret}" }
    } }
  }
  ```
- **Non-technical / Claude Desktop**: a signed `.mcpb` desktop-extension bundle installs by drag-and-drop and stores keys in the OS keychain.

With no configuration the server already serves **public market data on every exchange** — a useful install on its own.

## Configure accounts

To use private data or trading, create the config file (its path is shown by the `get_safety_status` tool):

- macOS: `~/Library/Application Support/ccxt-mcp/config.json`
- Linux: `~/.config/ccxt-mcp/config.json`
- Windows: `%APPDATA%\ccxt-mcp\config.json`
- Or set `CCXT_MCP_CONFIG` to any path.

```jsonc
{
  "accounts": {
    "binance-testnet": {
      "exchange": "binance",
      "apiKey": "…", "secret": "…",
      "sandbox": true,          // testnet — trades fake money; recommended first stop
      "trading": true           // "true" enables trading on SANDBOX/DEMO accounts only
    },
    "binance-main": {
      "exchange": "binance",
      "apiKey": "…", "secret": "…",
      "trading": "live",        // live trading requires the explicit string "live"…
      "maxOrderValue": 250,     // …and a per-order USD cap you author (null = opt out)
      "maxDailyValue": 1000,    // optional rolling-24h cap
      "allowedSymbols": ["BTC/USDT", "ETH/*"],  // optional strict allowlist
      "confirm": "live"         // always (every order) | live (default: only LIVE accounts; sandbox/demo execute WITHOUT a confirm step) | never
    },
    "polymarket-main": { "exchange": "polymarket", "walletAddress": "0x…", "privateKey": "0x…" }
  }
}
```

Any credential the exchange needs works (`apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, …), plus `sandbox`/`demo`, `defaultType`, `options`, and `prediction: true` for exchanges that exist in both crypto and prediction namespaces (e.g. hyperliquid). `chmod 600` the file. Env vars also work: `<EXCHANGEID>_<CREDENTIAL>` (e.g. `BINANCE_APIKEY`, `OKX_PASSWORD`) fill missing fields, and `CCXT_MCP_EXCHANGE`/`CCXT_MCP_APIKEY`/`CCXT_MCP_SECRET`/`CCXT_MCP_SANDBOX`/`CCXT_MCP_TRADING` define a single account named `default`. The `accounts` map holds as many exchanges/accounts as you want — one entry each.

On **Claude Desktop** the `.mcpb` install form has fields for a single exchange plus a **Config file** picker — point that at a `config.json` (as above) to configure multiple exchanges, or create the file at the default path and leave the form blank.

## Capability tiers (opt-in, off by default)

| Tier | What it enables | How to turn it on |
|---|---|---|
| market | tickers, order books, OHLCV, trades, market search, prediction events, raw GET endpoints | on by default, no keys |
| read | balances, orders, own trades, positions | configure an account |
| trading | create/edit/cancel orders, leverage, margin | per-account `"trading": true` (sandbox) or `"live"` |
| funds | withdraw, transfer, deposit addresses | per-account `"funds": true` or `"live"` |
| implicitWrites | raw POST/PUT/DELETE endpoints | per-account `"implicitWrites": true` |

Tiers can **only** be enabled by the user editing the config file — never from the conversation, and there is no tool that edits config. Disabled tiers do not appear in the tool list. `"trading": true` works on **sandbox/demo accounts only**; live trading requires typing `"trading": "live"` plus a `maxOrderValue`. Order-placing tools preview and require confirmation, validate against market limits and your caps, and journal every mutating call.

## Sandbox / testnet

Set `"sandbox": true` on an account to trade fake money on the exchange testnet — `create_order` then goes to the testnet host (e.g. `testnet.binance.vision`), never production. Use **testnet keys** from the exchange's testnet portal (live keys won't authenticate against testnet). This is the recommended way to try trading.

## Using the tools (what the agent calls)

- **Discovery**: `list_exchanges`, `describe_exchange`, `describe_method` (search method names / signatures / per-exchange params + doc links), `get_safety_status` (which accounts/tiers are active).
- **Market data**: `search_markets` (resolve a symbol — there is no list-all-markets tool), `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`. Long-tail reads (funding rates, open interest, ledger, …) via `call_read_method`; raw exchange GET endpoints via `call_implicit_get`.
- **Live data (WebSocket)**: `watch_subscribe` opens a background stream and returns a `subscriptionId` and a `streamKind`. **State** streams are snapshots — `watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`: `watch_read` returns the **full current set** in `latest` (the server merges live updates, so a multi-symbol stream always shows every subscribed symbol, not just the one that last changed) — just read it whenever you need the current value (the live order book, all your positions, the recent candle window). **Event** streams are logs — `watchTrades` and the private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations` (private need an account): `watch_read` returns new items oldest-first in `events` plus a `nextCursor` — thread it back as `cursor` on each poll so you don't re-receive old items. Pass `waitForChange: true` (optional `timeoutMs`) to **block until the next update** instead of polling — ideal for waiting on an order fill or position change; the response's `timedOut` says whether anything arrived. `watch_unsubscribe` when done; `watch_list` shows active streams. Prefer one-shot `get_*` tools for a single snapshot; use `watch_*` for live/continuous data.
- **Private (read tier)**: `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`.
- **Best route across exchanges**: `fetch_route` (no account needed) — see below.
- **Trading (trading tier)**: `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method`, `execute_route`.
- **Funds (funds tier)**: `withdraw`, `transfer`, `get_deposit_address`.

Conventions to follow:
- Symbols are unified CCXT symbols: `BTC/USDT` (spot), `BTC/USDT:USDT` (linear swap), `BTC/USD:BTC` (inverse). Resolve them with `search_markets` — don't guess. Derivatives-only methods (funding rate, positions) need the `:SETTLE` form.
- To list many symbols, call `search_markets` with `fields: ["symbol"]` (or e.g. `["symbol", "contractSize", "limits"]`) and a `limit` up to 1000 — full rows are ~450 chars each and capped at 100. Page with `meta.nextOffset` while `meta.hasMore` is true; `meta.limitClamped` says when your limit was reduced. Perpetuals are `type: "swap"`; an empty result lists the exchange's real types in `meta.marketTypes`.
- Every exchange-touching tool takes a `params` passthrough for exchange-specific options; discover supported keys with `describe_method`.
- `since` accepts a millisecond timestamp or an ISO8601 string; results carry both `timestamp` (ms) and `datetime` (ISO8601).
- List results are capped to fit context; check `meta` (`count`/`returned`/`available`/`hasMore`/`truncated`) and page rather than assuming completeness.
- **Prediction markets**: use `search_events` to find an event and its outcome handles, then pass an outcome handle (priced 0–1) as the symbol to the ordinary tools.

## Best price / execution route (`fetch_route`, `execute_route`)

For "where should I buy 1 BTC?" or "what's the best way to turn 5,000 USDT into ETH?", call `fetch_route` — don't compare `get_orderbook` / `get_tickers` across venues by hand. The [CCXT order router](https://docs.ccxt.com/router/) walks live L2 books on ~50 venues, accounts for fees and depth, can split across venues (`strategy: "split_optimal"` / `"split_capped"` + `maxVenues`) and bridge through USDT/USDC/BTC/ETH. Top-of-book is only right for tiny sizes; at any real size depth decides the answer.

- Pass `from`, `to` (asset codes, not symbols) and **exactly one** of `amountIn` (exact spend) or `amountOut` (exact receive). Narrow with `exchanges` (e.g. only venues you have accounts on), `bridges`, `certified`.
- **Read `fillRatio` before `effectiveRate`.** A better rate on a partial fill is not a better route; `fillRatio < 1` means the size isn't fully fillable at current depth (or set `requireFullFill`). `impactBps` / `referenceRate` show price impact versus top of book.
- An unroutable pair returns `ok: true` with `unroutableReason` — it's an answer, not a failure. A `RATE_LIMITED` error carries `retryAfterSeconds` (the router allows 5 req/s per IP).
- Use `get_orderbook` / `get_tickers` when you need one venue's book or price itself, not a conversion decision.
- `fetch_route` is a quote, not an order. To act on it, pass its `routeId` to `execute_route` (trading tier). Each venue the route uses needs a trading-enabled account (matched automatically when there is one per exchange; otherwise pass `accounts`). Execution choices are yours: `strategy`, `slippageBps`, `allowMarketOrders`, `maxPlanAgeMs`, `dryRun`. Every order still goes through the account's caps, symbol lists and confirmation, and a route executes once. If it halts mid-route, the result's `unwind` is a suggestion only — nothing is reversed automatically.

## Trading safely

1. Start on `sandbox: true` with testnet keys.
2. Order tools return a **preview + confirmation** first **when the account's `confirm` policy fires** (`always`, or `live` on a live account) — show the preview (symbol, side, amount, estimated USD value) to the user, then repeat the identical call with the `confirm` token (or approve the native prompt) to execute. Under the default `live` policy, **sandbox/demo orders execute immediately without a preview**, and `maxOrderValue: null` means no cap — so on a demo account an order can execute in one call with no gate.
3. For live accounts, set a `maxOrderValue` cap and, on the exchange, use API keys with **withdrawal disabled** and an **IP allowlist**.

## Troubleshooting

- **"Trading is not enabled for account …"** — enable the tier in the config file; it can't be enabled from the conversation.
- **AUTH_FAILED on a sandbox account** — you need testnet keys from the exchange's testnet portal, not live keys.
- **A private tool doesn't exist** — its tier isn't enabled; run `get_safety_status` to see what's active.
- **Slow first call** — the initial `loadMarkets()` takes a few seconds, then is cached 24h.
- Inspect interactively: `npx @modelcontextprotocol/inspector npx -y ccxt-mcp`.
