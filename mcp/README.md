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

**market** — `list_exchanges`, `describe_exchange`, `describe_method` (search/signatures/per-exchange params + docs links), `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `search_events` (prediction markets), `call_read_method` (any unified `fetch*`/`load*` — structurally read-only), `call_implicit_get` (raw GET endpoints), `get_safety_status`.

**read** — `list_accounts`, `get_balance`, `get_orders`, `get_my_trades`, `get_positions`.

**trading** — `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method` (allowlisted long tail: margin/position/batch-cancel ops).

**funds** — `withdraw`, `transfer`, `get_deposit_address`. **implicitWrites** — `call_implicit_write`.

Every list result is capped and paginated to fit host context limits (with in-band truncation notices); the raw `info` payload is stripped by default. Prediction exchanges use the same tools with outcome handles (from `search_events`) in the symbol position.

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
cd mcp && npm run build # tsc + regenerate js/data/method-docs.json
```

See `DESIGN.md` for the architecture, the prior-art analysis this server is built on, and the decision log.
