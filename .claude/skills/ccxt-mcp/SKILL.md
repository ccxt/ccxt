---
name: ccxt-mcp
description: Official CCXT MCP (Model Context Protocol) server — connect an AI agent to 100+ cryptocurrency exchanges and prediction markets for market data, balances, and opt-in trading, and render interactive candlestick charts, order-book depth, price boards and account views (balance, orders, positions). Covers installing the server in Claude Desktop/Code, Cursor, VS Code and other MCP hosts; adding named accounts through a local setup form or a config file (API keys kept local, never seen by the model); the capability tiers and safety rails; sandbox/testnet trading; and how to drive the tools. Use when the user wants an agent to fetch prices/order books/candles, check balances/orders/positions, place or cancel orders, or explore prediction markets across exchanges.
---

# CCXT MCP Server

`ccxt-mcp` is the official CCXT Model Context Protocol server. It runs **locally over stdio** and lets an AI agent (Claude Desktop/Code, Cursor, VS Code, Windsurf, …) use the unified CCXT API across 100+ crypto exchanges and prediction markets.

- npm: `ccxt-mcp` · runs via `npx -y ccxt-mcp` · source: https://github.com/ccxt/ccxt/tree/master/mcp
- Full docs: https://docs.ccxt.com/docs/mcp

Key property: **your API keys stay on your machine and the model never sees them.** Tools reference accounts by a name you choose; credentials are never tool parameters and never appear in results.

## Install

Requires Node.js ≥ 18. Pick the host:

- **Claude Code**: `claude mcp add ccxt -- npx -y ccxt-mcp`
- **Plugin (server + this skill + a guided first-run skill, `ccxt-get-started`, in one step)** — one plugin serves three hosts and pins the server (`npx -y ccxt-mcp@<plugin version>`), so updating the plugin updates the server:
  - **Claude Code**: `/plugin marketplace add ccxt/ccxt` then `/plugin install ccxt-mcp@ccxt` — or, lighter, from a shell: `claude plugin marketplace add ccxt/ccxt --sparse .claude-plugin mcp/plugin` + `claude plugin install ccxt-mcp@ccxt` (`--sparse` checks out only the marketplace and plugin directories, about 5 MB instead of about 600 MB for the whole repository). The install can prompt for optional exchange / API key settings (stored by Claude Code, sensitive values in secure storage); the config file below works regardless, but the plugin sets `CCXT_MCP_CONFIG` itself from its "Config file" option (`/plugin configure ccxt-mcp@ccxt`), so a shell-exported `CCXT_MCP_CONFIG` has no effect there. Tools are then named `mcp__plugin_ccxt-mcp_ccxt__<tool>`.
  - **OpenAI Codex / ChatGPT desktop app**: `codex plugin marketplace add ccxt/ccxt` then `codex plugin add ccxt-mcp@ccxt` (Codex CLI); in the ChatGPT desktop app, add the marketplace and install "CCXT" from the Plugins directory (a plugin with a local stdio MCP server is "desktop-only").
  - **xAI Grok**: Grok reads Claude Code marketplaces and plugins with zero configuration — with the `ccxt/ccxt` marketplace already added in Claude Code, install `ccxt-mcp` from `/plugins` → Marketplace tab (its docs do not describe adding a source there; untested), or run `grok --plugin-dir <path to mcp/plugin>`.
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

**Never ask for, accept or repeat an API key, secret, passphrase or private key in the chat.** No tool takes one. If the user pastes one anyway, do not use it: tell them to delete that key on the exchange, create a new one, and enter it through the form below.

### The easiest way: `setup_account` (no file editing)

Call `setup_account` (optional `exchange`, `account` name and `sandbox` to prefill; `sandbox` defaults to testnet). It opens a form in the user's default browser, served by the MCP server on `127.0.0.1` through a single-use link that expires after 10 minutes. The user picks the exchange, types the credentials, chooses testnet (the default), demo trading or live — only the environments that exchange has are offered — and whether orders may be placed. The form checks the keys against the exchange, saves the account to the local config file (created with owner-only permissions) and applies it immediately — no restart.

- The tool result only says the form was opened. **You never see the link or what the user types**; tell them a page opened in their browser, wait until they say it is saved, then call `list_accounts`.
- "Allow placing orders" is **off** by default. On a testnet/demo account it enables sandbox trading; on a **live** account the form requires a per-order USD cap and an explicit confirmation tick, and the saved account previews every order (`confirm: "always"`).
- Withdrawals/transfers (`funds`) and raw write endpoints (`implicitWrites`) are **not** in the form — config file only.
- `SETUP_FORM_UNAVAILABLE` means no browser can be opened from the server's machine (a headless or remote host): relay the `hint`, which names the config file to edit instead.
- If `setup_account` is not in the tool list, the server is older than the release that added it (the plugin pins its server version): use the config file.

### The config file

For several accounts at once, wallet-based venues, caps beyond the per-order one, or the funds / implicitWrites tiers, edit the config file (its path is shown by the `get_safety_status` tool):

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
| read | balances, orders, own trades, positions | add an account (`setup_account` form or config file) |
| trading | create/edit/cancel orders, leverage, margin | the form's "allow placing orders" switch, or per-account `"trading": true` (sandbox) or `"live"` in the file |
| funds | withdraw, transfer, deposit addresses | config file only: per-account `"funds": true` or `"live"` |
| implicitWrites | raw POST/PUT/DELETE endpoints | config file only: per-account `"implicitWrites": true` |

Tiers are enabled **only by the user** — in the local setup form (an account, and trading on it) or in the config file — never from the conversation: no tool takes a tier or a credential as an argument, and `setup_account` only opens the form. By default every tier's tools are listed and execution is gated at the account; with `"settings": { "hideDisabledTools": true }` disabled tiers are hidden, and tools of a tier enabled through the form appear after a server restart. `"trading": true` works on **sandbox/demo accounts only**; live trading requires `"trading": "live"` plus a `maxOrderValue` decision (the form always asks for a number). Order-placing tools preview and require confirmation, validate against market limits and your caps, and journal every mutating call.

## Sandbox / testnet

Set `"sandbox": true` on an account to trade fake money on the exchange testnet — `create_order` then goes to the testnet host (e.g. `testnet.binance.vision`), never production. Use **testnet keys** from the exchange's testnet portal (live keys won't authenticate against testnet). This is the recommended way to try trading.

## Using the tools (what the agent calls)

- **Discovery**: `list_exchanges`, `describe_exchange`, `describe_method` (search method names / signatures / per-exchange params + doc links), `get_safety_status` (which accounts/tiers are active), `setup_account` (opens the local account-setup form — see "Configure accounts").
- **Market data**: `search_markets` (resolve a symbol — there is no list-all-markets tool), `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`. Long-tail reads (funding rates, open interest, ledger, …) via `call_read_method`; raw exchange GET endpoints via `call_implicit_get`.
- **Views (MCP Apps)**: `show_chart` (candlestick + volume chart), `show_orderbook` (cumulative depth chart + bid/ask ladder), `show_tickers` (sortable 24h price board) — public data, read-only, no account. With an account (read tier): `show_balance` (holdings table with an estimated value), `show_orders` (order list), `show_positions` (open derivatives positions), and `show_chart` with `account` draws that account's open orders on the chart. See "Showing charts and views" below.
- **Live data (WebSocket)**: `watch_subscribe` opens a background stream and returns a `subscriptionId` and a `streamKind`. **State** streams are snapshots — `watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`: `watch_read` returns the **full current set** in `latest` (the server merges live updates, so a multi-symbol stream always shows every subscribed symbol, not just the one that last changed) — just read it whenever you need the current value (the live order book, all your positions, the recent candle window). **Event** streams are logs — `watchTrades` and the private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations` (private need an account): `watch_read` returns new items oldest-first in `events` plus a `nextCursor` — thread it back as `cursor` on each poll so you don't re-receive old items. Pass `waitForChange: true` (optional `timeoutMs`) to **block until the next update** instead of polling — ideal for waiting on an order fill or position change; the response's `timedOut` says whether anything arrived. `watch_unsubscribe` when done; `watch_list` shows active streams. Prefer one-shot `get_*` tools for a single snapshot; use `watch_*` for live/continuous data.
- **Private (read tier)**: `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions` (rows for analysis), plus the account views `show_balance`, `show_orders`, `show_positions`.
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

## Showing charts and views (`show_chart`, `show_orderbook`, `show_tickers`, `show_balance`, `show_orders`, `show_positions`)

When the user asks to **see, show, plot, chart or visualize** something — a market or their own account — call a `show_*` tool instead of fetching rows and describing them:

| User wants | Call | Arguments |
|---|---|---|
| a price chart / candles | `show_chart` | `exchange`, `symbol`, `timeframe` (default `1h`), `since`, `limit` (default 200, max 500), `marketType`, `prediction`, `account` (optional: overlay that account's open orders for the symbol), `params` |
| the order book, depth or liquidity | `show_orderbook` | `exchange`, `symbol`, `limit` (levels per side, default 50, max 100), `marketType`, `prediction`, `params` |
| current prices for several markets | `show_tickers` | `exchange`, `symbols` (1–50), `marketType`, `prediction`, `params` |
| their balance, holdings or portfolio | `show_balance` | `account`, `nonzeroOnly` (default true), `marketType` (wallet type, e.g. `spot`, `swap`, `funding`), `params` |
| their orders | `show_orders` | `account`, `symbol` (many exchanges require it), `status` (`open` default, `closed`, `canceled`, `all`), `since`, `limit` (default 50, max 200) |
| their open positions (derivatives) | `show_positions` | `account`, `symbols`, `marketType` (e.g. `swap`, `future`), `params` |

- The three account views are **read tier**: they need a configured `account` (see `list_accounts`; none yet → `setup_account`) and never place, change or cancel anything. `show_balance` values holdings on a best-effort basis in one quote currency (USDT, USD or USDC, from a single ticker call): `totalValue` is an estimate, and a `notice` says when some or all currencies could not be priced. The summary you receive holds the total and the ten largest holdings (`show_orders`: counts by side and status plus up to ten orders; `show_positions`: count, total unrealized PnL when every position reports it, and the main fields of up to 20 positions); `meta.omitted` counts the rest — use `get_balance` / `get_orders` / `get_positions` for every row or field.
- `show_chart` with `account` adds a read-tier fetch of that account's open orders for the symbol and draws them as price lines; the account must be on the same `exchange` as the chart. `meta.openOrders` says how many were drawn; if the order fetch fails the chart is still shown and a `notice` says the orders are not drawn. Without `account` the chart is public data as before.

- If the `show_*` tools are not in the tool list (they ship in `ccxt-mcp` releases after 0.1.3, and the plugin pins its server version), use `get_ohlcv` / `get_orderbook` / `get_tickers` / `get_balance` / `get_orders` / `get_positions` and summarise in text.
- These are MCP Apps tools: in a host that supports MCP Apps the view is rendered for the user in a sandboxed iframe. The view gets the full dataset; **the tool result you receive is a compact summary** (chart: range, open/close, change %, high/low, volume; book: best bid/ask, spread, depth totals; board: last, 24h %, quote volume per symbol).
- Check `meta.ui`. `"displayed"`: the user is looking at the view — comment on the summary, do **not** paste candles, levels or a table of the same data. `"unsupported"`: the host did not advertise MCP Apps support (terminal hosts such as the Claude Code, Codex and Grok CLIs have no surface to draw a view), so describe the summary in text instead and don't claim a chart was shown. `"off"`: the operator disabled views (`CCXT_MCP_UI=off`) — same handling. The server sends the view only to hosts that advertise MCP Apps; the user can set the `CCXT_MCP_UI` environment variable to `always` (send views even when the host does not advertise support) or `off` (never); the default is `auto`.
- Order-book amounts on contract markets are in **contracts**, not base currency: when `show_orderbook` reports `meta.amountUnit: "contracts"`, convert with `meta.contractSize` or quote the summary's `bidDepthBase` / `askDepthBase` / `bidDepthQuote` / `askDepthQuote` totals.
- `show_tickers` and `get_tickers` list requested symbols that returned no ticker in `meta.missing` — say so rather than omitting them silently; spot and swap symbols may need separate calls.
- Need the raw rows for analysis? Use `get_ohlcv`, `get_orderbook`, `get_tickers`, `get_balance`, `get_orders` or `get_positions` — the `show_*` tools never return the full set.
- Resolve symbols with `search_markets` first, and take valid `timeframe` values from `describe_exchange`, exactly as for the data tools.
- The views are self-contained (no network access, no external assets, no tracking); the user can refresh or switch timeframe from inside the view, which re-runs the same tool through the host.

## Best price / execution route (`fetch_route`, `execute_route`)

For "where should I buy 1 BTC?" or "what's the best way to turn 5,000 USDT into ETH?", call `fetch_route` — don't compare `get_orderbook` / `get_tickers` across venues by hand. The [CCXT order router](https://docs.ccxt.com/router/) walks live L2 books on ~50 venues, accounts for fees and depth, can split across venues (`strategy: "split_optimal"` / `"split_capped"` + `maxVenues`) and bridge through USDT/USDC/BTC/ETH. Top-of-book is only right for tiny sizes; at any real size depth decides the answer.

- Pass `from`, `to` (asset codes, not symbols) and **exactly one** of `amountIn` (exact spend) or `amountOut` (exact receive). Narrow with `exchanges` (e.g. only venues you have accounts on), `bridges`, `certified`.
- **Read `fillRatio` before `effectiveRate`.** A better rate on a partial fill is not a better route; `fillRatio < 1` means the size isn't fully fillable at current depth (or set `requireFullFill`). `impactBps` / `referenceRate` show price impact versus top of book.
- An unroutable pair returns `ok: true` with `unroutableReason` — it's an answer, not a failure. A `RATE_LIMITED` error carries `retryAfterSeconds` (the router allows 5 req/s per IP).
- Use `get_orderbook` / `get_tickers` when you need one venue's book or price itself, not a conversion decision.
- `fetch_route` is a quote, not an order. To act on it, pass its `routeId` to `execute_route` (trading tier). Each venue the route uses needs a trading-enabled account (matched automatically when there is one per exchange; otherwise pass `accounts`). Execution choices are yours: `strategy`, `slippageBps`, `allowMarketOrders`, `maxPlanAgeMs`, `dryRun`. Every order still goes through the account's caps, symbol lists and confirmation, and a route executes once. If it halts mid-route, the result's `unwind` is a suggestion only — nothing is reversed automatically.

## Trading safely

1. Start on a testnet account (`setup_account` defaults to it; `sandbox: true` in the file) with testnet keys.
2. Order tools return a **preview + confirmation** first **when the account's `confirm` policy fires** (`always`, or `live` on a live account) — show the preview (symbol, side, amount, estimated USD value) to the user, then repeat the identical call with the `confirm` token (or approve the native prompt) to execute. Under the default `live` policy, **sandbox/demo orders execute immediately without a preview**, and `maxOrderValue: null` means no cap — so on a demo account an order can execute in one call with no gate.
3. For live accounts, set a `maxOrderValue` cap and, on the exchange, use API keys with **withdrawal disabled** and an **IP allowlist**.

## Troubleshooting

- **"Trading is not enabled for account …"** — the user enables it: reopen the form with `setup_account` (replace the account with "allow placing orders" on) or edit the config file. It can't be enabled from the conversation.
- **No account yet / "configure an account"** — call `setup_account`; never ask for keys in chat.
- **AUTH_FAILED on a sandbox account** — you need testnet keys from the exchange's testnet portal, not live keys.
- **A private tool doesn't exist** — its tier isn't enabled; run `get_safety_status` to see what's active.
- **Slow first call** — the initial `loadMarkets()` takes a few seconds, then is cached 24h.
- Inspect interactively: `npx @modelcontextprotocol/inspector npx -y ccxt-mcp`.
