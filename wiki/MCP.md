# CCXT MCP Server

CCXT ships an official **MCP (Model Context Protocol) server** so AI agents — Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, and any other MCP host — can access market data, account balances, and (when you explicitly enable it) trading across 100+ cryptocurrency exchanges and prediction markets through the unified CCXT API.

It runs **locally over stdio**: your API keys stay on your machine and are never visible to the AI model, which references accounts by name only. Nothing is hosted, and no keys transit any third‑party service.

- npm package: [`ccxt-mcp`](https://www.npmjs.com/package/ccxt-mcp)
- Source: [github.com/ccxt/ccxt/tree/master/mcp](https://github.com/ccxt/ccxt/tree/master/mcp)

```bash
claude mcp add ccxt -- npx -y ccxt-mcp
```

## Security model (read this first)

Your API keys stay on your machine, and the model never sees them:

- The server runs **locally over stdio**. A local server is the only way to hold user keys without a hosted service becoming a custodian.
- Credentials are **never tool parameters**. No tool schema accepts a key, so neither the model nor a prompt‑injected page can supply, request, or change them. Tools reference accounts by a **name** you choose (e.g. `binance-main`). You enter keys in a [local setup form](#guided-setup-no-file-editing) or a config file — never in the chat.
- Keys leave the process only inside signed HTTPS requests to the exchange itself — exactly like any trading bot.
- Every tool result, error, and log line passes a **redaction filter** holding your loaded secret values, so a secret can never appear in the conversation.
- **Capability tiers are opt‑in and owned by you.** Out of the box the server serves public market data only. Adding an account enables private reads. Trading must be enabled per account — in the local setup form (testnet by default; live trading needs a per‑order cap and an explicit confirmation there) or in the config file. Withdrawals/transfers and raw write endpoints can be enabled **only in the config file**. No tool takes a credential or a tier as an argument: `setup_account` merely opens the form in your browser, and what gets saved is what you type there, so a conversation can never grant itself permissions. The tools are *listed* by default (so the model can discover them and, when one isn't configured, return a clear "add an account" error the assistant relays to you), but **execution is always gated at the account** — calling a write tool without a configured, tier‑enabled account just errors. Set `"settings": { "hideDisabledTools": true }` to hide unconfigured tiers from the tool list entirely (a leaner, deliberately read‑only deployment).
- Order‑placing tools are **previewed and confirmed**, validated against market limits and your notional caps, and journaled to an append‑only audit log.

Recommended exchange‑side backstops (they hold even if your machine is compromised): create API keys with **withdrawal permission disabled** and an **IP allowlist**.

## Install

Requires Node.js ≥ 18. The server runs with `npx -y ccxt-mcp` — no global install needed. Add it to your MCP host with one of the snippets below.

### One-click install

These links open the app (it must already be installed) on its own install prompt — nothing is installed until you confirm there. The rows marked **server** add the MCP server only, as `npx -y ccxt-mcp` — always the latest published server, and without the plugin's two skills (the guided "get started" flow and the usage guide); the rows marked **plugin** install the server pinned to the plugin's version together with those skills. The link formats follow each vendor's documentation; a link that does nothing means the app is not installed or the page you are reading strips app links (GitHub does) — use the commands further down instead. Add accounts afterwards (see [Configuration](#configuration)).

| Host | Install | Installs |
|---|---|---|
| Claude Desktop | [Download ccxt-mcp.mcpb](https://github.com/ccxt/ccxt/releases/download/ccxt-mcp-latest/ccxt-mcp.mcpb), then open it and click **Install** | server |
| Claude Code (VS Code extension) | [Install the CCXT plugin](vscode://anthropic.claude-code/install-plugin?plugin=ccxt-mcp&marketplace=ccxt/ccxt) | plugin: server + skills |
| Cursor | [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=ccxt&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNjeHQtbWNwIl19) | server |
| VS Code | [Install in VS Code](https://vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522ccxt%2522%252C%2522type%2522%253A%2522stdio%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522ccxt-mcp%2522%255D%257D) · [Insiders](https://vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522ccxt%2522%252C%2522type%2522%253A%2522stdio%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522ccxt-mcp%2522%255D%257D) | server |
| Kiro | [Add to Kiro](https://kiro.dev/launch/mcp/add?name=ccxt&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22ccxt-mcp%22%5D%2C%22disabled%22%3Afalse%2C%22autoApprove%22%3A%5B%5D%7D) | server |
| Goose | [Add to Goose](goose://extension?cmd=npx&arg=-y&arg=ccxt-mcp&timeout=300&id=ccxt&name=CCXT&description=Crypto%20exchange%20market%20data%20and%20trading%20via%20CCXT) | server |
| ChatGPT desktop app / Codex | run `codex plugin marketplace add ccxt/ccxt` once, then [open the CCXT plugin install](codex://plugins/install/ccxt-mcp?marketplace=ccxt) | plugin: server + skills |
| Claude Code (terminal) | no install link — use the commands under [Plugins](#plugins-one-step-install) | plugin: server + skills |

The ChatGPT desktop app / Codex link only works for a marketplace the app already knows, and OpenAI documents no link that adds one — hence the one command first. The Claude Code extension link adds the marketplace by cloning the whole repository; the shell form with `--sparse` below is lighter.

### Plugins (one-step install)

A plugin installs the MCP server **and** two skills together — `ccxt-mcp` (how to use the tools) and `ccxt-get-started` (a guided first run: connect an exchange account, then the first chart, balance and order) — so the agent gets the tools and the knowledge of how to use them. After installing, say **"Get started"**. One plugin directory ([`mcp/plugin`](https://github.com/ccxt/ccxt/tree/master/mcp/plugin)) serves Claude Code, OpenAI Codex / the ChatGPT desktop app, and xAI Grok. The plugin pins the server — it runs `npx -y ccxt-mcp@<plugin version>` — so updating the plugin updates the server.

**Claude Code**

```
/plugin marketplace add ccxt/ccxt
/plugin install ccxt-mcp@ccxt
```

Or from a shell:

```bash
claude plugin marketplace add ccxt/ccxt --sparse .claude-plugin mcp/plugin
claude plugin install ccxt-mcp@ccxt
```

`--sparse` checks out only the marketplace and plugin directories (about 5 MB) instead of the whole CCXT repository (about 600 MB), so prefer the shell form: the `/plugin marketplace add` usage text shows only a path or URL, and whether it accepts `--sparse` is not documented.

On install Claude Code can prompt for optional settings — an exchange with its API key and secret, sandbox mode, a config file path. Leave them all blank for public market data. The values are stored by Claude Code (sensitive ones in secure storage), not in the plugin. The config file described under [Configuration](#configuration) works regardless of the prompt, and is the only place to configure several exchanges, live trading or withdrawals. To use a config file at a non‑default path, set the plugin's **Config file** option (`/plugin configure ccxt-mcp@ccxt`, or `--config config_file=<path>` on `claude plugin install`): the plugin sets `CCXT_MCP_CONFIG` itself from that option, so a `CCXT_MCP_CONFIG` exported in your shell has no effect here. Tools appear as `mcp__plugin_ccxt-mcp_ccxt__<tool>`.

**OpenAI Codex / ChatGPT desktop app**

```bash
codex plugin marketplace add ccxt/ccxt
codex plugin add ccxt-mcp@ccxt
```

The first command registers the marketplace (`.agents/plugins/marketplace.json` in the repository), the second installs the plugin (verified with Codex CLI 0.171.0; `codex mcp list` then shows the `ccxt` server). In the ChatGPT desktop app, add the marketplace the same way and install **CCXT** from the Plugins directory instead (per OpenAI's docs; untested here). OpenAI calls a plugin with a local stdio MCP server — like this one — ["desktop‑only"](https://developers.openai.com/plugins/deploy/desktop-only).

**xAI Grok**

Grok documents that it reads Claude Code marketplaces, plugins, skills and MCPs with zero configuration, so it uses the same marketplace and plugin as Claude Code. If the `ccxt/ccxt` marketplace is already added in Claude Code, install `ccxt-mcp` from `/plugins` → **Marketplace** tab, which Grok documents as installing plugins from configured sources (Grok's own sources come from `[[marketplace.sources]]` in `~/.grok/config.toml` and `~/.grok/plugins/known_marketplaces.json`; its docs publish no command or entry format for adding one, and this route is untested), or load the plugin directory from a checkout:

```bash
grok --plugin-dir /path/to/ccxt/mcp/plugin
```

**Server version.** The plugin runs the server version in `mcp/package.json`. The `show_*` view tools and `setup_account` ship in `ccxt-mcp` releases after 0.1.3, so a plugin that still pins 0.1.3 installs a server without them — the `get_*` tools return the same data as rows, and accounts are added through the config file.

### Claude Code

```bash
claude mcp add ccxt -- npx -y ccxt-mcp
```

Or per‑project via a committed `.mcp.json` (safe to commit — it contains no secrets):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### Claude Desktop

**Easiest — one‑click bundle:** download [`ccxt-mcp.mcpb`](https://github.com/ccxt/ccxt/releases/download/ccxt-mcp-latest/ccxt-mcp.mcpb) and open it (Settings → Extensions → drag it in, or double‑click). The installer shows a form where you can enter up to **three exchanges'** keys (and point at a config file for more); keys are stored in your OS keychain, never seen by the model.

```bash
curl -L -o ccxt-mcp.mcpb https://github.com/ccxt/ccxt/releases/download/ccxt-mcp-latest/ccxt-mcp.mcpb
```

**Or via JSON** — add to `claude_desktop_config.json` (Settings → Developer → Edit Config), then restart:

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### Cursor

`~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### VS Code

`.vscode/mcp.json` — VS Code's `inputs` mechanism stores values in **encrypted secret storage**, the best option for keys among the JSON‑config hosts:

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

With no configuration the server serves **public market data on every exchange** — that alone is a useful install (prices, order books, candles, market search, prediction‑market events).

### Guided setup (no file editing)

Ask the assistant to **"get started"** or to "connect my exchange account". It calls the `setup_account` tool, which opens a form in your default web browser. The page is served by the MCP server itself, on your own computer (`127.0.0.1`). Its link works for the first browser that opens it — after that the form answers only that browser — and the form expires after 10 minutes or once an account is saved.

1. Create an API key on the exchange (the page lists what to enable: reading yes, trading only if you want it, **withdrawals never**).
2. In the form, pick the exchange, type the key and secret (plus the passphrase or wallet fields that exchange needs), and choose where the key works: **Testnet** (the default), **Demo trading** or **Live** — only the environments the exchange has are offered.
3. Decide whether orders may be placed. This is **off** by default. On a live account, switching it on requires a maximum order size in USD and an explicit confirmation tick, and every order on that account is then previewed before it is sent.
4. Save. The form checks the keys against the exchange first, writes the account to the config file below (created readable by you only) and applies it immediately — no restart. Go back to the chat and say you are done. Saving under the name of an existing account asks first, and replacing an account stops any live (WebSocket) streams that were running on its old keys.

The model never sees the keys or the link: the tool result only says that a form was opened. Asking for the form again while one is open does not replace it — the assistant is told it is already open, and what you typed stays; a fresh form is opened only when you say the old one is lost. Never paste a key into the chat — if you do, delete that key on the exchange and create a new one. Withdrawals/transfers and raw write endpoints cannot be enabled from the form; those tiers stay config‑file‑only. If no browser can be opened from where the server runs (a headless or remote machine), the tool says so and names the config file to edit instead. With `"settings": { "hideDisabledTools": true }`, the tools of a tier the new account enables are added to the tool list when it is saved; if your app does not pick them up, restart it once.

**What the form protects against, and what it does not.** A web page open in your browser cannot read, submit or close the form (it is bound to the browser that opened it, accepts requests only from its own page, and ignores everything else). Another user account on the same computer cannot find it: the link is never part of a command line, and the browser is started on a private file that only you can read. The model cannot learn the link or a key from any tool result, log or error. It is **not** a defence against software running as *you* — including an AI agent with unrestricted shell or file access on your machine — because such a program can already read and edit the config file directly. Limit that with your MCP host's permission settings, and keep withdrawals disabled on the key.

### Config file

To add accounts by hand — several at once, wallet‑based venues, daily caps and symbol allowlists, or the funds / implicitWrites tiers — create the config file (its path is reported by the `get_safety_status` tool):

- macOS: `~/Library/Application Support/ccxt-mcp/config.json`
- Linux: `~/.config/ccxt-mcp/config.json`
- Windows: `%APPDATA%\ccxt-mcp\config.json`
- Or point the `CCXT_MCP_CONFIG` environment variable at any path (a legacy per‑exchange `keys.local.json` shape also loads).

```jsonc
{
  "accounts": {
    "binance-testnet": {
      "exchange": "binance",
      "apiKey": "…",
      "secret": "…",
      "sandbox": true,          // testnet — recommended first stop
      "trading": true           // "true" enables SANDBOX/DEMO trading only
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
    "okx-main": {
      "exchange": "okx",
      "apiKey": "…",
      "secret": "…",
      "password": "…"          // OKX / KuCoin / Bitget also require the API passphrase
    },
    "polymarket-main": {
      "exchange": "polymarket",
      "walletAddress": "0x…",   // wallet-based venues (DEXes, prediction markets) use a key pair
      "privateKey": "0x…"
    }
  }
}
```

Account fields accept any credential from the exchange's `requiredCredentials` (`apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, …), plus `sandbox`/`demo`, `defaultType`, `options` (CCXT constructor options), `prediction: true` (for exchanges that exist in both the crypto and prediction namespaces, e.g. hyperliquid), and the safety switches below. `chmod 600` the file; the server warns otherwise (or refuses with `"settings": { "strictPermissions": true }`).

### Which credentials does each exchange need?

Each account names its own `exchange` and carries **that exchange's** credentials, so a multi‑exchange setup is just several entries side by side — each with the fields that venue requires:

| Exchange | Credential fields to set |
|---|---|
| Most CEXs — Binance, Bybit, Kraken, Gate, MEXC… | `apiKey`, `secret` |
| OKX, KuCoin, Bitget | `apiKey`, `secret`, `password` (the API **passphrase** you chose when creating the key) |
| Wallet‑based — Hyperliquid, Polymarket, Limitless, other DEX / prediction venues | `walletAddress`, `privateKey` |

The config field names are exactly the credential names — set only the fields a venue needs and omit the rest. **Not sure what a given exchange takes?** Ask the agent to run **`describe_exchange`** for it: the `requiredCredentials` field lists precisely which of `apiKey` / `secret` / `password` / `uid` / `walletAddress` / `privateKey` / `token` / `twofa` to provide. (Credentials only ever live in this file — whether you edit it or the setup form writes it — and no tool accepts or returns them.)

Environment variables work too: `<EXCHANGEID>_<CREDENTIAL>` (e.g. `BINANCE_APIKEY`, `OKX_PASSWORD`) fill missing credentials on a configured account, and the `CCXT_MCP_EXCHANGE` / `CCXT_MCP_APIKEY` / `CCXT_MCP_SECRET` / `CCXT_MCP_SANDBOX` / `CCXT_MCP_TRADING` set defines a single account named `default` (add `_2`, `_3` — `CCXT_MCP_EXCHANGE_2` … — for more). The `accounts` map holds as many exchanges as you want.

**Zero‑config env keys (ccxt `--loadKeys` parity).** Set `"settings": { "loadEnvKeys": true }` (or `CCXT_MCP_LOAD_ENV_KEYS=true`) and the server auto‑registers an account for every exchange whose keys are already in the environment as `<EXCHANGEID>_APIKEY`/`_SECRET` (or `_WALLETADDRESS`/`_PRIVATEKEY`) — e.g. `BINANCE_APIKEY`+`BINANCE_SECRET` → a `binance` account, no config file needed. These accounts are **read‑only** unless you also set the global `CCXT_MCP_SANDBOX`/`CCXT_MCP_TRADING` toggles (which enable sandbox trading only — live trading is never auto‑armed from ambient env vars). It's **off by default**, so keys sitting in your shell for other tools are never silently activated.

**Claude Desktop (`.mcpb` bundle):** the install form takes **up to three exchanges** inline (each with its key/secret, plus an optional passphrase for OKX/KuCoin/Bitget) and global **Sandbox**, **Demo trading** and "allow orders" toggles. Pick **Sandbox** for testnet keys or **Demo trading** for demo‑portal keys (e.g. Binance `demo.binance.com`) — one or the other, not both. For a fourth exchange, a wallet‑based venue (`walletAddress`/`privateKey`), or live trading/withdrawals, set the **Config file** field to a `config.json` with an `accounts` map (as above), or create it at the default path and leave the form blank — the file merges with the inline exchanges.

### Capability tiers

| Tier | Enables | Switch | Default |
|---|---|---|---|
| market | tickers, order books, OHLCV, trades, market search, prediction events, read‑only raw GET endpoints | — | **on** |
| read | balances, orders, own trades, positions, account views | an account with credentials exists (setup form or config file) | on when configured |
| trading | create/edit/cancel orders, leverage, margin, position ops | the form's "allow placing orders" switch, or per‑account `"trading": true` (sandbox/demo) or `"live"` | **off** |
| funds | withdraw, internal transfer, deposit addresses | config file only: per‑account `"funds": true` or `"live"` | **off** |
| implicitWrites | raw POST/PUT/DELETE endpoints (anything exchange‑specific, incl. key management) | config file only: per‑account `"implicitWrites": true` | **off** |

`"trading": true` deliberately works **only** on sandbox/demo accounts; live trading requires typing `"trading": "live"` *and* deciding a `maxOrderValue` (a number, or explicitly `null` to opt out). The setup form enforces the same rule for live trading (it requires a number for the cap and a confirmation tick, and saves `"confirm": "always"`). The same pattern applies to `funds` with `maxTransferValue`. Activating a tier is your responsibility — the server's job is honest gates, confirmation, and the audit journal (`<cache-dir>/ccxt-mcp/journal/`).

## Tools

The model discovers these from the server; you don't call them directly.

- **market** — `list_exchanges`, `describe_exchange`, `describe_method` (search method signatures, per‑exchange params and doc links), `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events` (prediction markets), `call_read_method` (any unified `fetch*`/`load*` — structurally read‑only), `call_implicit_get` (raw GET endpoints), `get_safety_status`, `setup_account` (opens the local account‑setup form in your browser — see [Guided setup](#guided-setup-no-file-editing); always listed, takes no credentials), `fetch_route` (best execution route for converting an asset at a given size across ~50 exchanges, via the [CCXT order router](https://docs.ccxt.com/router/) — a quote, no keys needed).
- **views (MCP Apps)** — `show_chart` (candlestick + volume chart), `show_orderbook` (cumulative depth chart + bid/ask ladder), `show_tickers` (sortable 24h price board). Market tier: public data, read‑only, no account. Read tier (an account is needed): `show_balance` (holdings table with an estimated value), `show_orders` (order list by status), `show_positions` (open derivatives positions); `show_chart` also takes an optional `account` and then draws that account's open orders on the chart. See [Interactive views](#interactive-views-mcp-apps) below.
- **live (WebSocket)** — `watch_subscribe` opens a background ccxt.pro stream; `watch_read` returns fresh data. **State** streams are snapshots of "what is X right now" — `watchTicker(s)`, `watchOrderBook(ForSymbols)`, `watchOHLCV`, `watchBalance`, `watchPositions`, `watchBidsAsks`, `watchMarkPrice(s)`: the server merges live updates into the **full current set**, so `watch_read` always returns every subscribed symbol in `latest`, never just the one that last ticked. **Event** streams are logs of discrete events — `watchTrades` and the private `watchOrders`/`watchMyTrades`/`watch(My)Liquidations` (private ones need an account): `watch_read` returns new items oldest‑first in `events` with a cursor. Set `waitForChange: true` on `watch_read` to **block until the next update** (or timeout) instead of polling — the efficient way to wait for a fill or a position change. `watch_unsubscribe` stops it; `watch_list` shows active streams. The long‑lived server holds the socket so the agent always has fresh data; idle streams auto‑stop after 10 minutes.
- **read** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`, and the account views `show_balance`, `show_orders`, `show_positions`.
- **`search_markets` paging** — full market rows by default (max 100 per call); pass `fields` (e.g. `["symbol"]`) for compact rows and a max of up to 1000, so listing every USDT‑settled swap on okx takes one call. `meta` always has `returned`/`available`/`offset`/`hasMore`, plus `nextOffset` when there is more, `limitClamped` when the limit was reduced, and `marketTypes` when nothing matched (e.g. `type: "perpetual"` points at `"swap"`).
- **trading** — `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method`, `execute_route` (executes a `fetch_route` result across your accounts; each order is still bound by the account's caps and confirmation).
- **funds** — `withdraw`, `transfer`, `get_deposit_address`. **implicitWrites** — `call_implicit_write`.

Every list result is capped and paginated to fit host context limits (with in‑band truncation notices), and the raw `info` payload is stripped by default. Symbols are unified CCXT symbols (`BTC/USDT` spot, `BTC/USDT:USDT` swap); resolve them with `search_markets`. Prediction exchanges use the same tools with outcome handles (from `search_events`) in the symbol position, priced 0–1.

## Interactive views (MCP Apps)

Six tools render a view instead of returning rows. Three are market tier — public data only, no account. Three are read tier — they show your own account and need a configured one. All six are read‑only: none places, changes or cancels anything. They ship in `ccxt-mcp` releases after 0.1.3; on an older server they are absent from the tool list, and the `get_*` tools return the same data as rows.

| Tool | Renders | Arguments |
|---|---|---|
| `show_chart` | candlestick + volume chart; with `account`, that account's open orders for the symbol as price lines | `exchange`, `symbol`, `timeframe` (default `1h`), `since`, `limit` (default 200, max 500), `marketType`, `prediction`, `account` (optional, must be on the same exchange), `params` |
| `show_orderbook` | cumulative depth chart + bid/ask ladder | `exchange`, `symbol`, `limit` (levels per side, default 50, max 100), `marketType`, `prediction`, `params` |
| `show_tickers` | sortable 24h price board | `exchange`, `symbols` (up to 50), `marketType`, `prediction`, `params` |
| `show_balance` | holdings table: free / in orders / total per currency, with an estimated (best‑effort, possibly partial) value | `account`, `nonzeroOnly` (default true), `marketType`, `params` |
| `show_orders` | order list | `account`, `symbol` (required by many exchanges), `status` (`open` default, `closed`, `canceled`, `all`), `since`, `limit` (default 50, max 200) |
| `show_positions` | open derivatives positions: size, entry and mark price, PnL (totalled per settle currency), leverage, liquidation price | `account`, `symbols`, `marketType`, `params` |

They implement [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) (the `io.modelcontextprotocol/ui` extension, spec 2026‑01‑26). Each tool's `_meta.ui.resourceUri` points at a `ui://ccxt/<view>.html` resource (`mimeType` `text/html;profile=mcp-app`) that a host with MCP Apps support fetches and renders in a sandboxed iframe.

- **The model gets a summary, the view gets the data.** The tool's text result is a compact summary (for a chart: range, open/close, change %, high/low, volume; for a balance: the estimated total and the ten largest holdings; for orders: counts by side and status plus up to ten orders; for positions: the count, unrealized PnL totalled per settle currency, and the main fields); the full dataset goes to the view as `structuredContent`.
- **Account views show your data to you.** `show_balance`, `show_orders` and `show_positions` run the same private reads as `get_balance`, `get_orders` and `get_positions`; their view payload passes the same redaction as every text result and never contains raw exchange payloads. The valuation in `show_balance` is best effort and may be partial: holdings are priced in one cash currency chosen for the account (USDT, USD, USDC or another currency the exchange quotes in) from a single ticker request. The result names the quote currency it used and how many holdings it could not price; those are left out of the total — never counted as zero — and the total is then marked as partial. It is an estimate, not an account statement.
- **Position PnL is totalled per settle currency.** Unrealized PnL is denominated in each market's settle currency (USDT, USDC, BTC, …), so `show_positions` gives one total per currency and never adds across them: a single figure always comes with its currency, an account with positions settling in several currencies gets one figure each, and a currency in which some position reports no PnL gets no total.
- **Orders on the chart are optional and never block it.** `show_chart` with `account` adds one read of that account's open orders for the symbol; if that read fails, the chart is still shown and a notice says the orders are not drawn.
- **A testnet or demo account is charted against its own market.** Testnet prices are not live prices, so order lines from a sandbox or demo account drawn on live candles would be misleading. With such an account, `show_chart` takes the candles from that account's environment and says so; if that environment cannot serve them, it falls back to live candles and flags the mismatch in a notice (and in `meta.candlesEnvironment`, next to the account's `meta.environment`). Without `account`, or with a live account, the chart is live market data.
- **The view payload is sent only to hosts that advertise MCP Apps.** Under the base protocol `structuredContent` is equivalent to the text content, so a host without the extension may hand it to the model in place of the summary. The server therefore attaches it only when the host advertised the extension at initialization; every other host receives the compact text summary alone, and the tools stay usable as plain tools. The `get_*` tools remain the tools for raw data.
- **`meta.ui` says what happened**: `"displayed"` (the view payload is attached), `"unsupported"` (the host did not advertise MCP Apps, text summary only) or `"off"` (views disabled with `CCXT_MCP_UI=off`).
- **`CCXT_MCP_UI`** (environment variable) overrides the detection: `auto` (the default, also used for any unrecognised value) as above; `always` sends the view to every host, for a host that renders MCP Apps views without advertising the capability; `off` never sends a view — the `show_*` tools stay listed and answer with the text summary.
- **Order‑book amounts on contract markets are in contracts**, as CCXT reports them. When a market's `contractSize` is not 1, `show_orderbook` reports `meta.amountUnit: "contracts"` with `meta.contractSize` (and `meta.inverse` for coin‑margined contracts), the summary adds `bidDepthBase` / `askDepthBase` / `bidDepthQuote` / `askDepthQuote` next to the contract‑count `bidDepth` / `askDepth`, and the view payload carries `amountUnit` and `contractSize` so the view converts. Otherwise `amountUnit` is the base currency code.
- **Symbols without a ticker are named.** `show_tickers` and `get_tickers` list requested symbols that returned no ticker in `meta.missing` (some exchanges serve one market type per call — request spot and swap symbols separately).
- **Views are self‑contained single files**: no network access, no external assets, no tracking. A view can ask the host to re‑run the same tool (refresh, timeframe switch); it has no other way to fetch data.

**Host support.** The MCP Apps docs list Claude (claude.ai), Claude Desktop, VS Code GitHub Copilot, Goose, Postman and MCPJam among the supporting clients, and OpenAI documents ChatGPT as implementing the MCP Apps standard. Terminal hosts (Claude Code CLI, Codex CLI, Grok CLI) have no surface to draw a view on and show the text summary. Whether a host renders views for a *local stdio* server like this one varies and is not uniformly documented, so treat the views as available "in hosts that support MCP Apps" rather than in any particular host.

## Prediction markets

The prediction‑market exchanges (Polymarket, Kalshi, Limitless, Myriad, and Hyperliquid) are first‑class. Ask the model to find an event with `search_events`, then read or trade its outcomes with the ordinary market and trading tools — the outcome handle goes in the symbol position, and prices are probabilities between 0 and 1.

## Troubleshooting

- **"Trading is not enabled for account …"** — you enable it, not the conversation: ask the assistant to reopen the setup form (`setup_account`) and replace the account with order placement switched on, or edit the config file (see tiers above).
- **The setup form did not open, or says the link is no longer valid** — the form belongs to the first browser that opened it, saves one account and lasts 10 minutes; a copied link does not work in another browser. Ask the assistant to open it again (tell it if you closed the page, so it opens a fresh one). On a headless or remote machine there is no browser to open: use the config file.
- **AUTH_FAILED / "Invalid API-key" on a sandbox account** — testnet keys come from the exchange's testnet portal, not your live account (and vice versa). Note **sandbox ≠ demo**: some exchanges (e.g. Binance) run a separate *demo‑trading* environment on a different host — those keys need `"demo": true` (or `CCXT_MCP_DEMO=true`, or the **Demo trading** toggle in the `.mcpb` form), not `sandbox`. Binance's futures testnet is deprecated; use demo trading instead.
- **"testnet/sandbox mode is not supported for futures" (Binance)** — a Binance **Testnet** account is spot only: positions and futures orders are refused there. For futures practice, create Demo Trading keys and add an account with **Demo trading** chosen in the form (`"demo": true` in the config file).
- **HTTP 451 / geo‑blocks** — some exchanges block cloud/VPN/US IPs; set a proxy via account `options` if needed.
- **Slow first call on a big exchange** — the initial `loadMarkets()` can take a few seconds; it is cached on disk for 24h afterwards.
- Run `npx @modelcontextprotocol/inspector npx -y ccxt-mcp` to open an interactive tool console.

## See also

- [CLI](CLI.md) — the command‑line interface, for the same unified API from a terminal or shell script.
- [Manual](Manual.md) — the full unified API reference.
- [Model Context Protocol](https://modelcontextprotocol.io/) — the open standard this server implements.
