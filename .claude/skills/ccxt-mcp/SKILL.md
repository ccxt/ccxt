---
name: ccxt-mcp
description: Official CCXT MCP (Model Context Protocol) server — connect an AI agent to 100+ cryptocurrency exchanges and prediction markets for market data, balances, and opt-in trading. Covers installing the server in Claude Desktop/Code, Cursor, VS Code and other MCP hosts; configuring named accounts and API keys (kept local, never seen by the model); the capability tiers and safety rails; sandbox/testnet trading; and how to drive the tools. Use when the user wants an agent to fetch prices/order books/candles, check balances/orders/positions, place or cancel orders, or explore prediction markets across exchanges.
---

# CCXT MCP Server

`ccxt-mcp` is the official CCXT Model Context Protocol server. It runs **locally over stdio** and lets an AI agent (Claude Desktop/Code, Cursor, VS Code, Windsurf, …) use the unified CCXT API across 100+ crypto exchanges and prediction markets.

- npm: `ccxt-mcp` · runs via `npx -y ccxt-mcp` · source: https://github.com/ccxt/ccxt/tree/master/mcp
- Full docs: https://docs.ccxt.com/#/mcp

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
      "confirm": "live"         // always | live (default) | never
    },
    "polymarket-main": { "exchange": "polymarket", "walletAddress": "0x…", "privateKey": "0x…" }
  }
}
```

Any credential the exchange needs works (`apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, …), plus `sandbox`/`demo`, `defaultType`, `options`, and `prediction: true` for exchanges that exist in both crypto and prediction namespaces (e.g. hyperliquid). `chmod 600` the file. Env vars also work: `<EXCHANGEID>_<CREDENTIAL>` (e.g. `BINANCE_APIKEY`, `OKX_PASSWORD`) fill missing fields, and `CCXT_MCP_EXCHANGE`/`CCXT_MCP_APIKEY`/`CCXT_MCP_SECRET`/`CCXT_MCP_SANDBOX`/`CCXT_MCP_TRADING` define a single account named `default`.

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
- **Private (read tier)**: `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`.
- **Trading (trading tier)**: `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method`.
- **Funds (funds tier)**: `withdraw`, `transfer`, `get_deposit_address`.

Conventions to follow:
- Symbols are unified CCXT symbols: `BTC/USDT` (spot), `BTC/USDT:USDT` (linear swap), `BTC/USD:BTC` (inverse). Resolve them with `search_markets` — don't guess. Derivatives-only methods (funding rate, positions) need the `:SETTLE` form.
- Every exchange-touching tool takes a `params` passthrough for exchange-specific options; discover supported keys with `describe_method`.
- `since` accepts a millisecond timestamp or an ISO8601 string; results carry both `timestamp` (ms) and `datetime` (ISO8601).
- List results are capped to fit context; check `meta` (`count`/`returned`/`available`/`hasMore`/`truncated`) and page rather than assuming completeness.
- **Prediction markets**: use `search_events` to find an event and its outcome handles, then pass an outcome handle (priced 0–1) as the symbol to the ordinary tools.

## Trading safely

1. Start on `sandbox: true` with testnet keys.
2. Order tools return a **preview + confirmation** first — show the preview (symbol, side, amount, estimated USD value) to the user, then repeat the identical call with the `confirm` token (or approve the native prompt) to execute.
3. For live accounts, set a `maxOrderValue` cap and, on the exchange, use API keys with **withdrawal disabled** and an **IP allowlist**.

## Troubleshooting

- **"Trading is not enabled for account …"** — enable the tier in the config file; it can't be enabled from the conversation.
- **AUTH_FAILED on a sandbox account** — you need testnet keys from the exchange's testnet portal, not live keys.
- **A private tool doesn't exist** — its tier isn't enabled; run `get_safety_status` to see what's active.
- **Slow first call** — the initial `loadMarkets()` takes a few seconds, then is cached 24h.
- Inspect interactively: `npx @modelcontextprotocol/inspector npx -y ccxt-mcp`.
