# ccxt-mcp — official CCXT MCP server

Connect AI agents (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, and any MCP host) to 100+ cryptocurrency exchanges and prediction markets through the unified [ccxt](https://github.com/ccxt/ccxt) API: market data, account balances, order management, and — when you explicitly enable it — trading.

```
claude mcp add ccxt -- npx -y ccxt-mcp
```

For public market data without installing anything, there is also a **hosted server** at `https://docs.ccxt.com/mcp`: see [Hosted server](#hosted-server-no-install). Everything else in this README is about the local server.

## Security model (read this first)

Your API keys stay on your machine, and **the AI model never sees them**:

- The server runs **locally over stdio**; keys never transit any third-party service. (The hosted server accepts no keys at all.)
- Credentials are **never tool parameters**: no tool schema accepts a key, so neither the model nor a prompt-injected page can supply, request, or change them. Tools reference accounts by **name** ("binance-main"). A credential-looking key pasted into free-form `params` (`apiKey`, `secret`, `password`, …) is refused before anything is sent to the exchange.
- Keys leave the process only inside signed HTTPS requests to the exchange itself — the same as any trading bot.
- Every tool result, error, and log line passes a **redaction filter** holding your loaded secret values (some exchanges echo signed URLs in error bodies — that path is closed). Raw request URLs/headers/bodies are never emitted. `verbose` is force-disabled.
- **Capability tiers are opt-in and file-owned.** Out of the box the server does public market data only. Configuring an account enables private reads. `trading`, `funds` (withdraw/transfer), and `implicitWrites` (raw endpoints) must each be enabled per account **in the config file** — there is no tool that edits config, so a conversation can never grant itself permissions. Unregistered tiers do not even appear in the tool list.
- Writes are **previewed and confirmed** (native confirmation form where the host supports elicitation, otherwise an explicit preview + confirm-token round-trip), validated against market limits and your notional caps, and journaled to an append-only audit log.

Recommended exchange-side backstops (they hold even if your machine is compromised): create API keys with **withdrawal permission disabled** and an **IP allowlist**.

One honest caveat: any local agent with filesystem access could read the config file with its own tools — that is governed by your MCP host's permission model, not by this server. Prefer your host's secret storage where available (see below), keep the file `chmod 600`, and consider a deny rule for the path in your host's settings.

## Install

### Hosted server (no install)

> **Status: not deployed yet.** Until `https://docs.ccxt.com/mcp` answers, use the local server below (`npx -y ccxt-mcp`). This note is removed at launch.

`https://docs.ccxt.com/mcp` is a public, read-only, stateless MCP endpoint (Streamable HTTP) run by CCXT. No install, no sign-in, no API keys. Status: phase 1, public market data only; signing in with your own exchange accounts is planned for later.

- **Claude (web, desktop):** [add it as a custom connector](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=CCXT&connectorUrl=https%3A%2F%2Fdocs.ccxt.com%2Fmcp) (prefilled link; you confirm), or Customize > Connectors > Add > Add custom connector, then choose **No sign-in**. A connector added there also works in the Claude mobile apps.
- **Claude Code:** `claude mcp add --transport http ccxt https://docs.ccxt.com/mcp` (use another name if your local server is already called `ccxt`), or the plugin: `/plugin marketplace add ccxt/ccxt` then `/plugin install ccxt@ccxt`.
- **ChatGPT (web):** [chatgpt.com/plugins](https://chatgpt.com/plugins) > plus button > **Add custom MCP server** > URL `https://docs.ccxt.com/mcp`, **No authentication** > **Create as a plugin**, then install it.
- **ChatGPT desktop app / Codex:** Settings > MCP servers > Add server > **Streamable HTTP** > the URL; or in `~/.codex/config.toml`: `[mcp_servers.ccxt]` with `url = "https://docs.ccxt.com/mcp"`.
- **Cursor / VS Code / Gemini CLI:** `{ "mcpServers": { "ccxt": { "url": "https://docs.ccxt.com/mcp" } } }` in `~/.cursor/mcp.json`; `{ "servers": { "ccxt": { "type": "http", "url": "https://docs.ccxt.com/mcp" } } }` in `.vscode/mcp.json`; `gemini mcp add --transport http ccxt https://docs.ccxt.com/mcp`.

It serves `list_exchanges`, `describe_exchange`, `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades` and the `show_chart` / `show_orderbook` / `show_tickers` views, on a curated set of major exchanges. `get_balance`, `get_orders`, `get_positions` and `get_my_trades` return `ACCOUNT_REQUIRED` with a pointer to the local server. No trading, no WebSocket streams, no prediction markets, no free-form `params`. Requests are rate-limited per client and answered from a short cache: 1 s for order books, 2 s for tickers and trades, up to 60 s for candles. It records anonymous usage analytics without IP addresses ([what is recorded](https://github.com/ccxt/ccxt/blob/master/mcp/hosted/src/telemetry/README.md)). Full steps: [docs.ccxt.com/docs/mcp](https://docs.ccxt.com/docs/mcp#hosted-server-no-install). Source and deployment: [`mcp/hosted`](https://github.com/ccxt/ccxt/tree/master/mcp/hosted).

### Local server

Requires Node.js ≥ 20 (since the move to MCP TypeScript SDK v2; earlier releases ran on Node 18). The npm package is `ccxt-mcp`; the server binary is `npx -y ccxt-mcp`. It speaks both the 2025 MCP handshake that today's hosts use and the 2026-07-28 revision, on the same stdio pipe.

#### Claude Code

```bash
claude mcp add ccxt -- npx -y ccxt-mcp
```

Or per-project via `.mcp.json` (safe to commit — no secrets):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

#### Claude Desktop

Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

#### Cursor

`~/.cursor/mcp.json` (or `.cursor/mcp.json` per project):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

#### VS Code

`.vscode/mcp.json` — VS Code's `inputs` mechanism stores values in **encrypted secret storage**, the best option for keys among the JSON-config hosts:

```json
{
  "inputs": [
    { "id": "binance-key", "type": "promptString", "password": true, "description": "Binance API key" },
    { "id": "binance-secret", "type": "promptString", "password": true, "description": "Binance API secret" }
  ],
  "servers": {
    "ccxt": {
      "command": "npx", "args": ["-y", "ccxt-mcp"],
      "env": { "BINANCE_APIKEY": "${input:binance-key}", "BINANCE_SECRET": "${input:binance-secret}" }
    }
  }
}
```

#### Windsurf

`~/.codeium/windsurf/mcp_config.json` — same `mcpServers` shape as Claude Desktop; `${env:VAR}` interpolation is supported.

## Configuration

With no configuration the server serves **public market data on all exchanges** — that alone is a useful install.

To add accounts, create the config file (path shown by the `get_safety_status` tool):

- macOS: `~/Library/Application Support/ccxt-mcp/config.json`
- Linux: `~/.config/ccxt-mcp/config.json`
- Windows: `%APPDATA%\ccxt-mcp\config.json`
- Or point `CCXT_MCP_CONFIG` at any path (a legacy per-exchange `keys.local.json` shape also loads).

```jsonc
{
  "accounts": {
    "binance-testnet": {
      "exchange": "binance",
      "apiKey": "…",
      "secret": "…",
      "sandbox": true,          // testnet — recommended first stop
      "trading": true           // true enables SANDBOX/DEMO trading only
    },
    "binance-main": {
      "exchange": "binance",
      "apiKey": "…",
      "secret": "…",
      "trading": "live",        // live trading requires the explicit string "live"…
      "maxOrderValue": 250,     // …and a per-order USD cap you author (null = opt out)
      "maxDailyValue": 1000,    // optional rolling-24h cap
      "allowedSymbols": ["BTC/USDT", "ETH/*"],  // optional strict allowlist
      "confirm": "live"         // always | live (default) | never
    },
    "polymarket-main": {
      "exchange": "polymarket",
      "walletAddress": "0x…",
      "privateKey": "0x…"
    }
  }
}
```

Account fields: any credential from the exchange's `requiredCredentials` (`apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, …), `sandbox`/`demo`, `defaultType`, `options` (ccxt constructor options), `prediction: true` (for exchanges that exist in both the crypto and prediction namespaces, e.g. hyperliquid), and the safety switches below. `chmod 600` the file; the server warns otherwise (or refuses with `"settings": {"strictPermissions": true}`).

Environment variables work too: `<EXCHANGEID>_<CREDENTIAL>` (e.g. `BINANCE_APIKEY`, `OKX_PASSWORD`) fill missing credentials, and the `CCXT_MCP_EXCHANGE`/`CCXT_MCP_APIKEY`/`CCXT_MCP_SECRET`/`CCXT_MCP_SANDBOX`/`CCXT_MCP_TRADING` set defines a single account named `default`.

**Claude Desktop (`.mcpb` bundle):** the install form configures one exchange. To use **several** exchanges (or enable live trading/withdrawals), set the **Config file** field to a `config.json` with an `accounts` map like the one above — or just create it at the default path and leave the form fields blank.

### Capability tiers

| Tier | Enables | Switch | Default |
|---|---|---|---|
| market | tickers, order books, OHLCV, trades, markets, prediction events, read-only raw GET endpoints | — | **on** |
| read | balances, orders, own trades, positions | an account with credentials exists | on when configured |
| trading | create/edit/cancel orders, leverage, margin, position ops | per-account `"trading": true` (sandbox/demo) or `"live"` | **off** |
| funds | withdraw, internal transfer, deposit addresses | per-account `"funds": true` or `"live"` | **off** |
| implicitWrites | raw POST/PUT/DELETE endpoints (anything exchange-specific, incl. key mgmt) | per-account `"implicitWrites": true` | **off** |

`"trading": true` deliberately works **only** on sandbox/demo accounts; live trading requires typing `"trading": "live"` *and* deciding a `maxOrderValue` (a number, or explicitly `null` to opt out). The same pattern applies to `funds` with `maxTransferValue`. Activating a tier is your responsibility — the server's job is honest gates, confirmation, and the audit journal (`<cache-dir>/ccxt-mcp/journal/`).

## Tools

**market** — `list_exchanges`, `describe_exchange`, `describe_method` (search/signatures/per-exchange params + docs links), `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events` (prediction markets), `call_read_method` (any unified `fetch*`/`load*` — structurally read-only), `call_implicit_get` (raw GET endpoints), `get_safety_status`, `fetch_route` (best execution route for converting an asset at a given size across ~50 exchanges, via the [CCXT order router](https://docs.ccxt.com/router/) — a quote, no keys needed).

**views (MCP Apps)** — `show_chart` (candlestick + volume; `timeframe` default `1h`, `limit` default 200 / max 500), `show_orderbook` (cumulative depth chart + ladder; `limit` default 50 / max 100 levels per side), `show_tickers` (sortable 24h price board; up to 50 symbols). Public data, read-only, no account — see [Interactive views](#interactive-views-mcp-apps).

**live (WebSocket)** — `watch_subscribe` opens a background ccxt.pro stream; `watch_read` returns fresh data. **State** streams are snapshots of "what is X right now" — `watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`: the server merges live updates into the **full current set**, so `watch_read` always returns every subscribed symbol in `latest` (a multi-symbol stream never shows just the one that last ticked). **Event** streams are logs — `watchTrades` and the private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations` (private need an account): `watch_read` returns new items oldest-first in `events` with a cursor. Pass `waitForChange: true` to `watch_read` to **block until the next update** (or timeout) instead of polling — the efficient way to wait for a fill or position change. `watch_unsubscribe` stops it; `watch_list` shows active streams. The long-lived server holds the socket so the agent always has fresh data; idle streams auto-stop after 10 minutes.

**read** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`.

`search_markets` returns full market rows (~450 characters each, max 100 per call) by default. Pass `fields` to get compact rows — `["symbol"]` lists every okx USDT-settled swap (528) in one ~15k-character call instead of six calls and ~240k characters — and the max limit rises with how compact the rows are (up to 1000). `meta` always carries `returned`/`available`/`offset`/`hasMore`, plus `nextOffset` when there is more, `limitClamped` when the requested limit was reduced, and `marketTypes` (the types the exchange actually has) when nothing matched.

**trading** — `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method` (allowlisted long tail: margin/position/batch-cancel ops), `execute_route` (executes a `fetch_route` result with ccxt's `OrderRouter` across your accounts — every order still bound by that account's caps, symbol lists and confirmation).

**funds** — `withdraw`, `transfer`, `get_deposit_address`. **implicitWrites** — `call_implicit_write`.

Every list result is capped and paginated to fit host context limits (with in-band truncation notices); the raw `info` payload is stripped by default. Prediction exchanges use the same tools with outcome handles (from `search_events`) in the symbol position.

## Interactive views (MCP Apps)

`show_chart`, `show_orderbook` and `show_tickers` implement [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) (extension `io.modelcontextprotocol/ui`, spec 2026-01-26): each tool's `_meta.ui.resourceUri` points at a `ui://ccxt/<view>.<hash>.html` resource (`mimeType` `text/html;profile=mcp-app`) that hosts with MCP Apps support render in a sandboxed iframe. The hash is taken from the view's content, so a changed view gets a new URI and a host never pairs new results with a cached old view.

- The model gets a compact summary as text. `structuredContent` (declared by each tool's `outputSchema`) carries the same summary plus, only when a view will render it, the dataset the view draws. A host without MCP Apps may hand `structuredContent` to the model in place of the summary, so it never receives the dataset. The `get_*` tools remain the raw-data tools.
- `meta.ui` says what happened: `"displayed"` (the host declared MCP Apps support, dataset attached), `"unsupported"` (it did not), `"off"` (views disabled). The `CCXT_MCP_UI` environment variable overrides the detection: `auto` (default), `always` (attach the dataset even when the host does not declare support), `off` (never). A remote (stateless HTTP) deployment can also see `"attached"` or `"unknown"` when a 2025-era client's capabilities cannot be known; a stdio connection always knows them.
- On contract markets order-book amounts are in contracts: `show_orderbook` reports `meta.amountUnit` / `meta.contractSize` plus base- and quote-currency depth totals. `show_tickers` and `get_tickers` name symbols that returned no ticker in `meta.missing`.
- Views are self-contained single files: no network access, no external assets, no tracking. They can ask the host to re-run the same tool (Refresh, timeframe switch) with the original arguments; nothing ties that call to a server-side session.
- **Live updates (server side).** A view on screen polls `live_update`, an app-only tool (hidden from the model where the host supports it, `_meta.ui.visibility: ["app"]`) answered by a shared market-data hub: one ccxt.pro stream per market on its own public instance (not the `watch_*` streams), closed a minute after its last poll, with REST serving whatever no stream can. `CCXT_MCP_LIVE_STREAMS=off` serves every poll from REST. The `core` profile leaves `live_update` out (its definition does not fit the size budget); `core,live_update` adds it.
- **Live updates (in the view).** Where the host lets a view call tools (MCP Apps `serverTools`, or ChatGPT's `window.openai.callTool`), the view polls about 3 s after it renders and then at the server's `nextPollMs`: 2 s from a stream ("Live"), 5 s or more from REST or cache ("Delayed"), with backoff on errors. It pauses while hidden or off screen and after 10 minutes without input, holds an update while you have text selected in it (so a price can be copied), and stops on teardown. A chart of a past window (`since`, ending more than two candles ago) and any render with `params` stay static, since live data would replace them with something else; a prediction-market render polls the prediction class (`prediction: true`). After a permanent error, Refresh re-arms live updates. Without tool calls, or without `live_update` in the tool list, the view stays static with its Refresh button.

Terminal hosts (Claude Code CLI, Codex CLI) have no surface to draw a view and show the text summary. Whether a host renders views for a local stdio server varies.

### Tool profile

Every listed tool is sent to the model as a definition, and some hosts cap the total (the ChatGPT desktop app was observed dropping the alphabetically last tools, the `show_*` views among them). `CCXT_MCP_TOOLS` (or `"settings": { "tools": … }`; the environment variable wins) chooses what is listed:

| Value | Lists |
|---|---|
| `all` (default) | every tool |
| `core` | 17 essential tools: the three views, `list_exchanges`, `describe_exchange`, `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_safety_status`, `call_read_method`, `list_accounts`, `get_balance`, `get_orders`, `get_positions`, `create_order`, `cancel_order` |
| `core,describe_method` or `get_tickers,show_chart` | an explicit list (`core` composes with names; `get_safety_status` is always listed; add `live_update` for live views) |

A hidden tool is not registered at all for that session; `get_safety_status` reports the active profile, the tools it hides, and any name in the list that is not a tool. The profile only chooses what is listed: the capability tiers still decide what an account may do.

## Troubleshooting

- **"Trading is not enabled for account …"** — edit the config file (see tiers above); this is not something the conversation can change.
- **AUTH_FAILED on a sandbox account** — testnet keys come from the exchange's testnet portal, not your live account (and vice versa).
- **HTTP 451 / geo-blocks** — some exchanges block cloud/VPN/US IPs; set a proxy via account `options` if needed.
- **Slow first call on a big exchange** — the initial `loadMarkets()` can take seconds; it is cached on disk for 24h afterwards.
- `npx @modelcontextprotocol/inspector npx -y ccxt-mcp` opens an interactive tool console.

## Development (inside the ccxt monorepo)

```bash
npm run mcp.ts          # run the server from live TypeScript sources (tsx)
cd mcp && npm test      # unit + schema + integration tests
cd mcp && npm run build # tsc + copy the views to js/ui + regenerate js/data/method-docs.json
cd mcp && npm run ui:preview  # write a fake-host page that renders every view with canned data
```

See `DESIGN.md` for the architecture, the prior-art analysis this server is built on, and the decision log.

The hosted (public HTTP) server lives in `hosted/`. It is an npm workspace of this package, so one `npm ci` here installs both, and it reuses these tool registrations. It is not part of the published `ccxt-mcp` package. See `hosted/README.md`.
