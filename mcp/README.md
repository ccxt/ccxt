# ccxt-mcp — official CCXT MCP server

Connect AI agents (Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, and any MCP host) to 100+ cryptocurrency exchanges and prediction markets through the unified [ccxt](https://github.com/ccxt/ccxt) API: market data, account balances, order management, and — when you explicitly enable it — trading.

```
claude mcp add ccxt -- npx -y ccxt-mcp
```

## Security model (read this first)

Your API keys stay on your machine, and **the AI model never sees them**:

- The server runs **locally over stdio**. Nothing is hosted; keys never transit any third-party service.
- Credentials are **never tool parameters**: no tool schema accepts a key, so neither the model nor a prompt-injected page can supply, request, or change them. Tools reference accounts by **name** ("binance-main").
- Keys leave the process only inside signed HTTPS requests to the exchange itself — the same as any trading bot.
- Every tool result, error, and log line passes a **redaction filter** holding your loaded secret values (some exchanges echo signed URLs in error bodies — that path is closed). Raw request URLs/headers/bodies are never emitted. `verbose` is force-disabled.
- **Capability tiers are opt-in and owned by you.** Out of the box the server does public market data only. Adding an account enables private reads. `trading` must be enabled per account — in the local setup form (testnet by default; live needs a per-order cap and an explicit confirmation there) or in the config file; `funds` (withdraw/transfer) and `implicitWrites` (raw endpoints) **only in the config file**. No tool takes a credential or a tier as an argument — `setup_account` merely opens the form in your browser — so a conversation can never grant itself permissions. Every tier's tools are listed by default and execution is gated at the account; `"settings": {"hideDisabledTools": true}` hides the tiers that are not enabled.
- Writes are **previewed and confirmed** (native confirmation form where the host supports elicitation, otherwise an explicit preview + confirm-token round-trip), validated against market limits and your notional caps, and journaled to an append-only audit log.

Recommended exchange-side backstops (they hold even if your machine is compromised): create API keys with **withdrawal permission disabled** and an **IP allowlist**.

One honest caveat: any local agent with filesystem or shell access, running as you, could read or edit the config file with its own tools — that is governed by your MCP host's permission model, not by this server (and the setup form below is no defence against it either). Prefer your host's secret storage where available (see below), keep the file `chmod 600`, and consider a deny rule for the path in your host's settings.

## Install

Requires Node.js ≥ 18. The npm package is `ccxt-mcp`; the server binary is `npx -y ccxt-mcp`.

One-click install links for Claude Desktop, the Claude Code VS Code extension, Cursor, VS Code, Kiro, Goose and Codex are kept in one place, the [one-click install table](https://docs.ccxt.com/docs/mcp#one-click-install) of the docs ([source on GitHub](https://github.com/ccxt/ccxt/blob/master/wiki/MCP.md#one-click-install), where app links are not clickable). The links that add the bare MCP server install the latest `ccxt-mcp` without the plugin's skills.

### Plugins (one-step install)

A plugin installs the server **and** two skills together: `ccxt-mcp` (usage) and `ccxt-get-started` (guided first run — say "Get started"). One plugin directory ([`plugin/`](plugin/README.md)) serves all three hosts below; it pins the server (`npx -y ccxt-mcp@<plugin version>`), so updating the plugin updates the server.

**Claude Code**

```
/plugin marketplace add ccxt/ccxt
/plugin install ccxt-mcp@ccxt
```

Lighter, from a shell: `claude plugin marketplace add ccxt/ccxt --sparse .claude-plugin mcp/plugin` + `claude plugin install ccxt-mcp@ccxt` — `--sparse` checks out only the marketplace and plugin directories (about 5 MB) instead of the whole CCXT repository (about 600 MB). On install Claude Code can prompt for optional exchange / API key settings (stored by Claude Code, sensitive values in secure storage); the config file below works regardless. The plugin sets `CCXT_MCP_CONFIG` itself from its **Config file** option, so choose a non-default file there (`/plugin configure ccxt-mcp@ccxt`), not with a shell-exported `CCXT_MCP_CONFIG`. Tools appear as `mcp__plugin_ccxt-mcp_ccxt__<tool>`.

**OpenAI Codex / ChatGPT desktop app** — `codex plugin marketplace add ccxt/ccxt` registers the marketplace (`.agents/plugins/marketplace.json`), then `codex plugin add ccxt-mcp@ccxt` installs the plugin (verified with Codex CLI 0.171.0). In the ChatGPT desktop app, install **CCXT** from the Plugins directory after adding the marketplace (per OpenAI's docs; untested here). OpenAI calls a plugin with a local stdio MCP server ["desktop-only"](https://developers.openai.com/plugins/deploy/desktop-only).

**xAI Grok** — Grok documents that it reads Claude Code marketplaces, plugins, skills and MCPs with zero configuration, so the same marketplace is used: with `ccxt/ccxt` already added in Claude Code, install `ccxt-mcp` from `/plugins` → Marketplace tab (Grok's own sources come from `[[marketplace.sources]]` in `~/.grok/config.toml`; adding one is not documented, and this route is untested), or run `grok --plugin-dir <path to mcp/plugin>`.

The plugin runs the server version in `package.json`. The `show_*` view tools and `setup_account` ship in `ccxt-mcp` releases after 0.1.3; a plugin that still pins 0.1.3 installs a server without them (the `get_*` tools return the same data as rows, and accounts go in the config file).

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

**Guided setup (no file editing).** Ask the assistant to "get started" / "connect my exchange account". The `setup_account` tool opens a form in your default browser, served by this server on `127.0.0.1`. The form is bound to the first browser that loads it, saves one account and expires after 10 minutes; calling the tool again while a form is open reuses that form instead of replacing it (`restart: true` discards it). You type the API key there — never in the chat; the model sees neither the key nor the link. The form offers testnet (default), demo or live, checks the keys against the exchange, writes the account to the config file below (mode 0600) and applies it without a restart; replacing an existing account stops that account's private streams. "Allow placing orders" is off by default; on a live account it requires a per-order USD cap and an explicit confirmation, and saves `"confirm": "always"`. The `funds` and `implicitWrites` tiers are not in the form. Without a reachable desktop browser the tool returns `SETUP_FORM_UNAVAILABLE` and names the config file. `setup_account` is not annotated read-only: it opens a browser window. What the form protects against is a web page in your browser, another OS user (the link is never on a command line: the browser is launched on a private 0600 redirect file) and the model reading tool output — not a process running as you, which can edit the config file anyway; the threat model is in `DESIGN.md`.

To add accounts by hand, create the config file (path shown by the `get_safety_status` tool):

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

**market** — `list_exchanges`, `describe_exchange`, `describe_method` (search/signatures/per-exchange params + docs links), `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events` (prediction markets), `call_read_method` (any unified `fetch*`/`load*` — structurally read-only), `call_implicit_get` (raw GET endpoints), `get_safety_status`, `setup_account` (opens the local account-setup form; optional `exchange` / `account` / `sandbox` prefill, no credentials), `fetch_route` (best execution route for converting an asset at a given size across ~50 exchanges, via the [CCXT order router](https://docs.ccxt.com/router/) — a quote, no keys needed).

**views (MCP Apps)** — `show_chart` (candlestick + volume; `timeframe` default `1h`, `limit` default 200 / max 500), `show_orderbook` (cumulative depth chart + ladder; `limit` default 50 / max 100 levels per side), `show_tickers` (sortable 24h price board; up to 50 symbols). Market tier: public data, read-only, no account. Read tier: `show_balance` (holdings with a best-effort valuation), `show_orders` (`status` `open` default / `closed` / `canceled` / `all`; `limit` default 50 / max 200), `show_positions` (open derivatives positions), and `show_chart`'s optional `account`, which overlays that account's open orders for the symbol — see [Interactive views](#interactive-views-mcp-apps).

**live (WebSocket)** — `watch_subscribe` opens a background ccxt.pro stream; `watch_read` returns fresh data. **State** streams are snapshots of "what is X right now" — `watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`: the server merges live updates into the **full current set**, so `watch_read` always returns every subscribed symbol in `latest` (a multi-symbol stream never shows just the one that last ticked). **Event** streams are logs — `watchTrades` and the private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations` (private need an account): `watch_read` returns new items oldest-first in `events` with a cursor. Pass `waitForChange: true` to `watch_read` to **block until the next update** (or timeout) instead of polling — the efficient way to wait for a fill or position change. `watch_unsubscribe` stops it; `watch_list` shows active streams. The long-lived server holds the socket so the agent always has fresh data; idle streams auto-stop after 10 minutes.

**read** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`, and the account views `show_balance`, `show_orders`, `show_positions`.

`search_markets` returns full market rows (~450 characters each, max 100 per call) by default. Pass `fields` to get compact rows — `["symbol"]` lists every okx USDT-settled swap (528) in one ~15k-character call instead of six calls and ~240k characters — and the max limit rises with how compact the rows are (up to 1000). `meta` always carries `returned`/`available`/`offset`/`hasMore`, plus `nextOffset` when there is more, `limitClamped` when the requested limit was reduced, and `marketTypes` (the types the exchange actually has) when nothing matched.

**trading** — `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method` (allowlisted long tail: margin/position/batch-cancel ops), `execute_route` (executes a `fetch_route` result with ccxt's `OrderRouter` across your accounts — every order still bound by that account's caps, symbol lists and confirmation).

**funds** — `withdraw`, `transfer`, `get_deposit_address`. **implicitWrites** — `call_implicit_write`.

Every list result is capped and paginated to fit host context limits (with in-band truncation notices); the raw `info` payload is stripped by default. Prediction exchanges use the same tools with outcome handles (from `search_events`) in the symbol position.

## Interactive views (MCP Apps)

`show_chart`, `show_orderbook`, `show_tickers` and the account views `show_balance`, `show_orders`, `show_positions` implement [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) (extension `io.modelcontextprotocol/ui`, spec 2026-01-26): each tool's `_meta.ui.resourceUri` points at a `ui://ccxt/<view>.html` resource (`mimeType` `text/html;profile=mcp-app`) that hosts with MCP Apps support render in a sandboxed iframe.

- The model gets a compact summary as text; the view gets the full dataset as `structuredContent` — attached only for hosts that advertise the MCP Apps extension, because a host without it may hand `structuredContent` to the model in place of the summary. Every other host receives the text summary alone; the `get_*` tools remain the raw-data tools.
- The account views are read tier and read-only: they run the same private reads as `get_balance` / `get_orders` / `get_positions`, and their payload passes the same redaction and carries no raw exchange payload. `show_balance` values holdings on a best-effort basis in one cash currency chosen per account, from a single `fetchTickers` call: the result reports the quote used (`quote`) and, when holdings could not be priced, how many (`meta.unpricedCurrencies`, with `meta.totalValuePartial`) — they are left out of the total, never counted as zero. `show_positions` totals unrealized PnL per settle currency (`unrealizedPnl` with `unrealizedPnlCurrency`, or `unrealizedPnlByCurrency` when positions settle in several) and never adds across currencies. A failed open-orders read never fails `show_chart`; a notice says the orders are not drawn. With a sandbox or demo `account`, `show_chart` reads the candles from that account's environment, or falls back to live candles and flags the mismatch (`meta.candlesEnvironment` vs `meta.environment`, plus a notice).
- `meta.ui` is `"displayed"` (view payload attached), `"unsupported"` (host did not advertise MCP Apps) or `"off"`. The `CCXT_MCP_UI` environment variable overrides the detection: `auto` (default), `always` (send views even when the host does not advertise support), `off` (never).
- On contract markets order-book amounts are in contracts: `show_orderbook` reports `meta.amountUnit` / `meta.contractSize` (also in the view payload) plus base- and quote-currency depth totals. `show_tickers` and `get_tickers` name symbols that returned no ticker in `meta.missing`.
- The `show_*` tools ship in `ccxt-mcp` releases after 0.1.3; on an older server they are absent from the tool list.
- Views are self-contained single files: no network access, no external assets, no tracking. They can ask the host to re-run the same tool (refresh, timeframe switch).

The MCP Apps docs list Claude (claude.ai), Claude Desktop, VS Code GitHub Copilot, Goose, Postman and MCPJam among supporting clients, and OpenAI documents ChatGPT as implementing the MCP Apps standard. Terminal hosts (Claude Code CLI, Codex CLI, Grok CLI) have no surface to draw a view and show the text summary. Whether a host renders views for a *local stdio* server varies and is not uniformly documented — the views work "in hosts that support MCP Apps", no more specific promise is made.

## Troubleshooting

- **"Trading is not enabled for account …"** — reopen the setup form (`setup_account`) and replace the account with order placement on, or edit the config file (see tiers above); this is not something the conversation can change.
- **AUTH_FAILED on a sandbox account** — testnet keys come from the exchange's testnet portal, not your live account (and vice versa).
- **"testnet/sandbox mode is not supported for futures" (Binance)** — a Binance testnet account is spot only; for futures practice use demo-trading keys with `"demo": true` (**Demo trading** in the form).
- **HTTP 451 / geo-blocks** — some exchanges block cloud/VPN/US IPs; set a proxy via account `options` if needed.
- **Slow first call on a big exchange** — the initial `loadMarkets()` can take seconds; it is cached on disk for 24h afterwards.
- `npx @modelcontextprotocol/inspector npx -y ccxt-mcp` opens an interactive tool console.

## Development (inside the ccxt monorepo)

```bash
npm run mcp.ts          # run the server from live TypeScript sources (tsx)
cd mcp && npm test      # unit + schema + integration tests
cd mcp && npm run build # tsc + copy the UI views + regenerate js/data/method-docs.json
cd mcp && npm run ui:preview  # write a fake-host preview page for developing the views
cd mcp && npm run sync-plugin # copy .claude/skills/ccxt-mcp into plugin/skills (CI fails on drift; ccxt-get-started lives only in the plugin)
```

See `DESIGN.md` for the architecture, the prior-art analysis this server is built on, and the decision log.
