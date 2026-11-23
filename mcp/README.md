# ccxt-mcp — official CCXT MCP server

Connect AI agents (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, and any MCP host) to 100+ cryptocurrency exchanges and prediction markets through the unified [ccxt](https://github.com/ccxt/ccxt) API: market data, account balances, order management, and — when you explicitly enable it — trading.

```
claude mcp add ccxt -- npx -y ccxt-mcp
```

## Security model (read this first)

Your API keys stay on your machine, and **the AI model never sees them**:

- The server runs **locally over stdio**. Keys never transit any third-party service. (The optional [hosted HTTP server](#hosted-http-server-public-market-data-only) is a separate entry point that cannot hold accounts at all.)
- Credentials are **never tool parameters**: no tool schema accepts a key, so neither the model nor a prompt-injected page can supply, request, or change them. Tools reference accounts by **name** ("binance-main").
- Keys leave the process only inside signed HTTPS requests to the exchange itself — the same as any trading bot.
- Every tool result, error, and log line passes a **redaction filter** holding your loaded secret values (some exchanges echo signed URLs in error bodies — that path is closed). Raw request URLs/headers/bodies are never emitted. `verbose` is force-disabled.
- **Capability tiers are opt-in and file-owned.** Out of the box the server does public market data only. Configuring an account enables private reads. `trading`, `funds` (withdraw/transfer), and `implicitWrites` (raw endpoints) must each be enabled per account **in the config file** — there is no tool that edits config, so a conversation can never grant itself permissions. Unregistered tiers do not even appear in the tool list.
- Writes are **previewed and confirmed** (native confirmation form where the host supports elicitation, otherwise an explicit preview + confirm-token round-trip), validated against market limits and your notional caps, and journaled to an append-only audit log.

Recommended exchange-side backstops (they hold even if your machine is compromised): create API keys with **withdrawal permission disabled** and an **IP allowlist**.

One honest caveat: any local agent with filesystem access could read the config file with its own tools — that is governed by your MCP host's permission model, not by this server. Prefer your host's secret storage where available (see below), keep the file `chmod 600`, and consider a deny rule for the path in your host's settings.

## Install

Requires Node.js ≥ 18. The npm package is `ccxt-mcp`; the server binary is `npx -y ccxt-mcp`.

### Claude Code

```bash
claude mcp add ccxt -- npx -y ccxt-mcp
```

Or per-project via `.mcp.json` (safe to commit — no secrets):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### Claude Desktop

Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### Cursor

`~/.cursor/mcp.json` (or `.cursor/mcp.json` per project):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### VS Code

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

### Windsurf

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

**live (WebSocket)** — `watch_subscribe` opens a background ccxt.pro stream; `watch_read` returns fresh data. **State** streams are snapshots of "what is X right now" — `watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`: the server merges live updates into the **full current set**, so `watch_read` always returns every subscribed symbol in `latest` (a multi-symbol stream never shows just the one that last ticked). **Event** streams are logs — `watchTrades` and the private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations` (private need an account): `watch_read` returns new items oldest-first in `events` with a cursor. Pass `waitForChange: true` to `watch_read` to **block until the next update** (or timeout) instead of polling — the efficient way to wait for a fill or position change. `watch_unsubscribe` stops it; `watch_list` shows active streams. The long-lived server holds the socket so the agent always has fresh data; idle streams auto-stop after 10 minutes.

**read** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`.

**trading** — `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method` (allowlisted long tail: margin/position/batch-cancel ops), `execute_route` (executes a `fetch_route` result with ccxt's `OrderRouter` across your accounts — every order still bound by that account's caps, symbol lists and confirmation).

**funds** — `withdraw`, `transfer`, `get_deposit_address`. **implicitWrites** — `call_implicit_write`.

Every list result is capped and paginated to fit host context limits (with in-band truncation notices); the raw `info` payload is stripped by default. Prediction exchanges use the same tools with outcome handles (from `search_events`) in the symbol position.

## Interactive market data

MCP Apps hosts such as ChatGPT can render a horizontally scrollable candlestick chart with volume beneath from `get_ohlcv` (latest 100 candles by default) and searchable tables from `get_trades`, `get_tickers`, `get_orderbook`, `search_markets`, and `list_exchanges`. The MCP server serves the widget directly through `resources/read`. Hosts use the URI advertised in `_meta.ui.resourceUri` or ChatGPT’s compatibility alias, `_meta["openai/outputTemplate"]`. Other clients can continue reading the JSON envelope in tool results.

Clients with tool calls only can inspect either widget by calling `read_market_widget` with its URI. For the candle chart, use `{"uri":"ui://ccxt/candles-v2.html"}`. The reader returns the resource’s HTML and MIME type. Interactive rendering still depends on the host’s MCP Apps support.

## Hosted HTTP server (public market data only)

A second entry point serves the **public REST tools** over Streamable HTTP, for deployments where users should not have to run anything locally. It is deliberately limited:

| | Local (stdio) — `ccxt-mcp` | Hosted (HTTP) — `ccxt-mcp-http` |
|---|---|---|
| Transport | stdio, launched by the MCP host | Streamable HTTP at `/mcp`, stateless |
| Accounts / API keys | from your local config file | **none — cannot be configured** |
| Tools | every tier you enable | `list_exchanges`, `describe_exchange`, `describe_method`, `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events`, `call_read_method`, `call_implicit_get`, `fetch_route`, `read_market_widget` |
| Live WebSocket streams (`watch_*`) | yes | no |
| `get_safety_status` | yes | no (nothing to report; would expose server paths) |

The hosted entry never reads a config file or credential environment variables: its configuration is built in code with an empty account map, so there is no setting that turns private access on. Anything that needs an account stays on the local server.

```bash
cd mcp && npm run build && npm run start:http   # compiled
cd mcp && npm run dev:http                      # from TypeScript sources (tsx)
npx -y -p ccxt-mcp ccxt-mcp-http                # from the published package
```

| Env var | Default | Meaning |
|---|---|---|
| `CCXT_MCP_HTTP_PORT` (or `PORT`) | `3000` | listen port |
| `CCXT_MCP_HTTP_HOST` | `127.0.0.1` | bind address — set `0.0.0.0` to accept outside connections |
| `CCXT_MCP_HTTP_PATH` | `/mcp` | MCP endpoint path |
| `CCXT_MCP_HTTP_ALLOWED_HOSTS` | loopback names when bound to loopback, otherwise unset | comma-separated `Host` header allowlist (e.g. `mcp.example.com`); other hosts get `403` |

| `CCXT_MCP_HTTP_ACCESS_LOG` | `true` | set `false` to turn the access log off |
| `CCXT_MCP_HTTP_TRUST_PROXY` | `false` | set `true` to log the caller IP from `X-Forwarded-For` — only behind a reverse proxy you control, since the header is otherwise caller-supplied |

**Access log.** The hosted server writes to stderr one `http` line per request (HTTP method, path, status, duration, caller IP, plus the JSON-RPC method as `rpc` and — for a `tools/call` — the tool name; `/health` is skipped) and one `call` line per tool call (tool, exchange, ok / error code, duration), tied together by `requestId`. Every time a widget HTML file is served — through `resources/read` or the `read_market_widget` tool — an `html` line records the `ui://` resource, the **path of the file on disk**, its size and the caller; the request's own `http` line carries the same path in `served`. (The local stdio server writes the same `html` line to stderr.) Both lines carry the targeted symbol(s) in `symbols` (from the `symbol` / `symbols` arguments, or the first positional argument of `call_read_method`; at most 20). No other tool argument and no result is ever logged.

```
[ccxt-mcp] [info] call {"event":"call","requestId":"…","ip":"127.0.0.1","tool":"get_tickers","exchange":"kraken","ok":true,"code":null,"ms":412,"symbols":["BTC/USDT"]}
[ccxt-mcp] [info] http {"event":"http","requestId":"…","ip":"127.0.0.1","ms":415,"method":"POST","path":"/mcp","status":200,"rpc":"tools/call","tool":"get_tickers","symbols":["BTC/USDT"]}
```

`GET /health` returns `{"status":"ok"}`. Replies are plain JSON and no session is needed, so one `curl` is a complete request:

```bash
curl -s http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_tickers","arguments":{"exchange":"kraken","symbols":["BTC/USDT"]}}}'
```

Connect an MCP host by URL, e.g. `claude mcp add --transport http ccxt https://your-host/mcp`.

Not included, and yours to add in front (reverse proxy / gateway) before exposing it publicly: **TLS, authentication and per-caller rate limiting**. All callers share the server's IP budget on each exchange, and exchanges that geo-block datacenter IPs will fail from wherever you host it.

## Troubleshooting

- **"Trading is not enabled for account …"** — edit the config file (see tiers above); this is not something the conversation can change.
- **AUTH_FAILED on a sandbox account** — testnet keys come from the exchange's testnet portal, not your live account (and vice versa).
- **HTTP 451 / geo-blocks** — some exchanges block cloud/VPN/US IPs; set a proxy via account `options` if needed.
- **Slow first call on a big exchange** — the initial `loadMarkets()` can take seconds; it is cached on disk for 24h afterwards.
- `npx @modelcontextprotocol/inspector npx -y ccxt-mcp` opens an interactive tool console.

## Development (inside the ccxt monorepo)

```bash
npm run mcp.ts          # run the server from live TypeScript sources (tsx)
npm run mcp.http.ts     # run the hosted public HTTP server from TypeScript sources
cd mcp && npm test      # unit + schema + integration tests
cd mcp && npm run build # tsc + regenerate js/data/method-docs.json
```

See `DESIGN.md` for the architecture, the prior-art analysis this server is built on, and the decision log.
