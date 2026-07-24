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
- Credentials are **never tool parameters**. No tool schema accepts a key, so neither the model nor a prompt‑injected page can supply, request, or change them. Tools reference accounts by a **name** you choose (e.g. `binance-main`).
- Keys leave the process only inside signed HTTPS requests to the exchange itself — exactly like any trading bot.
- Every tool result, error, and log line passes a **redaction filter** holding your loaded secret values, so a secret can never appear in the conversation.
- **Capability tiers are opt‑in and file‑owned.** Out of the box the server serves public market data only. Configuring an account enables private reads. Trading, withdrawals/transfers, and raw endpoints must each be enabled per account **in the config file** — there is no tool that edits config, so a conversation can never grant itself permissions. Disabled tiers do not even appear in the tool list.
- Order‑placing tools are **previewed and confirmed**, validated against market limits and your notional caps, and journaled to an append‑only audit log.

Recommended exchange‑side backstops (they hold even if your machine is compromised): create API keys with **withdrawal permission disabled** and an **IP allowlist**.

## Install

Requires Node.js ≥ 18. The server runs with `npx -y ccxt-mcp` — no global install needed. Add it to your MCP host with one of the snippets below.

### Claude Code

```bash
claude mcp add ccxt -- npx -y ccxt-mcp
```

Or per‑project via a committed `.mcp.json` (safe to commit — it contains no secrets):

```json
{ "mcpServers": { "ccxt": { "command": "npx", "args": ["-y", "ccxt-mcp"] } } }
```

### Claude Desktop

Add to `claude_desktop_config.json` (Settings → Developer → Edit Config), then restart:

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

To add accounts, create the config file (its path is reported by the `get_safety_status` tool):

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
    "polymarket-main": {
      "exchange": "polymarket",
      "walletAddress": "0x…",
      "privateKey": "0x…"
    }
  }
}
```

Account fields accept any credential from the exchange's `requiredCredentials` (`apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, …), plus `sandbox`/`demo`, `defaultType`, `options` (CCXT constructor options), `prediction: true` (for exchanges that exist in both the crypto and prediction namespaces, e.g. hyperliquid), and the safety switches below. `chmod 600` the file; the server warns otherwise (or refuses with `"settings": { "strictPermissions": true }`).

Environment variables work too: `<EXCHANGEID>_<CREDENTIAL>` (e.g. `BINANCE_APIKEY`, `OKX_PASSWORD`) fill missing credentials, and the `CCXT_MCP_EXCHANGE` / `CCXT_MCP_APIKEY` / `CCXT_MCP_SECRET` / `CCXT_MCP_SANDBOX` / `CCXT_MCP_TRADING` set defines a single account named `default`. The `accounts` map holds as many exchanges as you want.

**Claude Desktop (`.mcpb` bundle):** the install form configures one exchange. To use several — or to enable live trading/withdrawals — set the **Config file** field to a `config.json` with an `accounts` map (as above), or create it at the default path and leave the form blank.

### Capability tiers

| Tier | Enables | Switch | Default |
|---|---|---|---|
| market | tickers, order books, OHLCV, trades, market search, prediction events, read‑only raw GET endpoints | — | **on** |
| read | balances, orders, own trades, positions | an account with credentials exists | on when configured |
| trading | create/edit/cancel orders, leverage, margin, position ops | per‑account `"trading": true` (sandbox/demo) or `"live"` | **off** |
| funds | withdraw, internal transfer, deposit addresses | per‑account `"funds": true` or `"live"` | **off** |
| implicitWrites | raw POST/PUT/DELETE endpoints (anything exchange‑specific, incl. key management) | per‑account `"implicitWrites": true` | **off** |

`"trading": true` deliberately works **only** on sandbox/demo accounts; live trading requires typing `"trading": "live"` *and* deciding a `maxOrderValue` (a number, or explicitly `null` to opt out). The same pattern applies to `funds` with `maxTransferValue`. Activating a tier is your responsibility — the server's job is honest gates, confirmation, and the audit journal (`<cache-dir>/ccxt-mcp/journal/`).

## Tools

The model discovers these from the server; you don't call them directly.

- **market** — `list_exchanges`, `describe_exchange`, `describe_method` (search method signatures, per‑exchange params and doc links), `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events` (prediction markets), `call_read_method` (any unified `fetch*`/`load*` — structurally read‑only), `call_implicit_get` (raw GET endpoints), `get_safety_status`.
- **read** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`.
- **trading** — `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method`.
- **funds** — `withdraw`, `transfer`, `get_deposit_address`. **implicitWrites** — `call_implicit_write`.

Every list result is capped and paginated to fit host context limits (with in‑band truncation notices), and the raw `info` payload is stripped by default. Symbols are unified CCXT symbols (`BTC/USDT` spot, `BTC/USDT:USDT` swap); resolve them with `search_markets`. Prediction exchanges use the same tools with outcome handles (from `search_events`) in the symbol position, priced 0–1.

## Prediction markets

The prediction‑market exchanges (Polymarket, Kalshi, Limitless, Myriad, and Hyperliquid) are first‑class. Ask the model to find an event with `search_events`, then read or trade its outcomes with the ordinary market and trading tools — the outcome handle goes in the symbol position, and prices are probabilities between 0 and 1.

## Troubleshooting

- **"Trading is not enabled for account …"** — edit the config file (see tiers above). This is not something the conversation can change.
- **AUTH_FAILED on a sandbox account** — testnet keys come from the exchange's testnet portal, not your live account (and vice versa).
- **HTTP 451 / geo‑blocks** — some exchanges block cloud/VPN/US IPs; set a proxy via account `options` if needed.
- **Slow first call on a big exchange** — the initial `loadMarkets()` can take a few seconds; it is cached on disk for 24h afterwards.
- Run `npx @modelcontextprotocol/inspector npx -y ccxt-mcp` to open an interactive tool console.

## See also

- [CLI](CLI.md) — the command‑line interface, for the same unified API from a terminal or shell script.
- [Manual](Manual.md) — the full unified API reference.
- [Model Context Protocol](https://modelcontextprotocol.io/) — the open standard this server implements.
