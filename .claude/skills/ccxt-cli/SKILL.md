---
name: ccxt-cli
description: CCXT command-line interface (ccxt-cli) for interacting with 100+ cryptocurrency exchanges directly from the terminal — no code required. Covers installing the CLI, calling any unified CCXT method (fetchTicker, fetchOHLCV, createOrder, fetchBalance), passing arguments and exchange-specific params, authenticating with API keys, sandbox/testnet mode, streaming live tickers and orderbooks over WebSocket, plotting OHLCV charts, and scripting with raw JSON output. Use when the user wants to query an exchange, test API credentials, place or inspect orders, or debug exchange requests from the command line or in shell scripts.
---

# CCXT CLI

The CCXT CLI (`ccxt-cli` on npm) exposes the entire unified CCXT API as a terminal command. Anything you can call in code — `fetchTicker`, `fetchOHLCV`, `createOrder`, `fetchBalance`, `withdraw`, exchange-specific implicit methods — you can call as:

```bash
ccxt <exchangeId> <methodName> [args...] [options]
```

It supports 100+ exchanges, REST and WebSocket, public and private endpoints, live terminal dashboards, and interactive OHLCV charts.

## Installation

```bash
npm install -g ccxt-cli     # installs the `ccxt` command
ccxt --help
```

One-off use without installing (note `-p ccxt-cli` — the package name differs from the binary name):

```bash
npx -y -p ccxt-cli ccxt kraken fetchTicker BTC/USD
```

From a clone of the CCXT repository (contributor mode — uses the local source tree instead of the published package):

```bash
npm run cli.ts -- kraken fetchTicker BTC/USD    # runs cli/ts/cli.ts against local ts/
```

## Quick start

```bash
# Public data — no API keys needed
ccxt kraken fetchTicker BTC/USD
ccxt kraken fetchOrderBook ETH/BTC
ccxt bybit fetchOHLCV BTC/USDT 15m
ccxt okx fetchTrades BTC/USDT

# Private data — needs API keys (see Authentication)
ccxt kraken fetchBalance
ccxt binance fetchOpenOrders BTC/USDT

# Place an order (start with --sandbox and small amounts!)
ccxt binance createOrder BTC/USDT limit buy 0.001 60000 --sandbox
```

Every run prints the CCXT version, the resolved call (e.g. `kraken.fetchTicker ("BTC/USD")`), the result, and timing. Use `--raw` to suppress everything except the JSON result.

## Discovering methods and arguments

```bash
ccxt --help                 # all options, commands, and the config path for your OS
ccxt methods kraken         # every method the exchange supports (its `has` capabilities)
ccxt explain createOrder    # required/optional arguments for any unified method
ccxt history                # your previously executed commands
```

`ccxt explain <method>` output shows the argument order you must follow:

```
Method: createOrder
Usage:
  binance createOrder <symbol> <type> <side> <amount> [price] [params]
Arguments:
  - symbol       (required) — Market symbol e.g., BTC/USDT
  - type         (required) — e.g., limit or market
  - side         (required) — order side e.g., buy or sell
  - amount       (required)
  - price        (optional) — Price per unit of asset e.g., 26000.50
  - params       (optional) — Extra parameters for the exchange
```

## Argument rules (important)

Arguments are positional and must follow the method's signature order. The CLI auto-converts each argument:

| You type | The method receives |
|---|---|
| `BTC/USDT` | string `'BTC/USDT'` |
| `0.001`, `100` | number |
| `undefined` | `undefined` (placeholder to skip an optional arg — the call echo displays it as `null`, which is expected) |
| `true` / `false` / `null` | boolean / null |
| `"2025-05-01T01:23:45Z"` | milliseconds timestamp (ISO8601 datetimes auto-convert; date-only strings like `2025-05-01` do NOT — include the time part) |
| `'{"recvWindow":5000}'` | object (JSON must be shell-quoted) |
| `'["BTC/USDT","ETH/USDT"]'` | array (shell-quoted) |

**Rule 1 — pad skipped optionals with `undefined`.** To pass `limit` without `since`:

```bash
ccxt binance fetchOHLCV BTC/USDT 1h undefined 10    # since=undefined, limit=10
```

**Rule 2 — `--param key=value` appends to the trailing `params` object.** Repeat it for multiple keys. Values are coerced the same way (`true`, `false`, `null`, numbers, strings):

```bash
ccxt binance createOrder BTC/USDT market buy 0.01 undefined --param test=true --param clientOrderId=myOrder
```

**Rule 3 — when using `--param`, explicitly fill ALL earlier optional positionals with `undefined`.** If you leave gaps, the CLI mis-assigns arguments (a known quirk — the params object can end up in the wrong position). Correct:

```bash
ccxt bybit fetchOHLCV BTC/USDT 15m undefined undefined --param until=1722161166530   # ✅
ccxt bybit fetchOHLCV BTC/USDT --param until=1722161166530                           # ❌ args get scrambled
```

## Authentication

Private methods (`fetchBalance`, `createOrder`, `fetchMyTrades`, ...) need credentials. Three sources:

### 1. Environment variables

Pattern: `<EXCHANGEID>_<CREDENTIAL>` upper-cased. The credential names come from each exchange's `requiredCredentials` (`apiKey`, `secret`, `password`, `uid`, `walletAddress`, `privateKey`, ...):

```bash
export BINANCE_APIKEY=your_api_key
export BINANCE_SECRET=your_secret
ccxt binance fetchBalance

# okx also needs a passphrase:
export OKX_APIKEY=... OKX_SECRET=... OKX_PASSWORD=...
```

Pass `--no-keys` to ignore detected credentials and force unauthenticated calls.

### 2. Config file (persistent)

The CLI keeps a config at `$CACHE/ccxt-cli/config.json`, keyed by exchange id. `ccxt --help` prints the exact path for your OS:

- macOS: `~/Library/Caches/ccxt-cli/config.json`
- Linux: `~/.cache/ccxt-cli/config.json` (or `$XDG_CACHE_HOME/ccxt-cli/`)
- Windows: `%LOCALAPPDATA%\ccxt-cli\cache\config.json`

```json
{
  "binance": {
    "apiKey": "your apiKey here",
    "secret": "your secret here",
    "options": { "defaultType": "swap" }
  },
  "okx": { "apiKey": "...", "secret": "...", "password": "..." }
}
```

Any key in the exchange object is set as a property on the exchange instance — so `options` lets you set persistent per-exchange behavior. To store the config somewhere else: `ccxt config ./some/path/config.json`.

### 3. `keys.json` / `keys.local.json` in the current directory

If the working directory contains `keys.json` and/or `keys.local.json` (same shape as the config file), they are loaded too and override the config file. This is how the CLI picks up credentials inside the CCXT repo.

Precedence: config.json < `keys.json` < `keys.local.json`; environment variables fill only credentials still missing.

## Market type, sandbox, and demo flags

```bash
ccxt binance fetchBalance --swap       # options.defaultType = 'swap' (perps)
ccxt binance fetchBalance --spot       # ... 'spot'
ccxt binance fetchBalance --future     # ... 'future'
ccxt binance fetchBalance --option     # ... 'option'

ccxt okx fetchTrades BTC/USDT --sandbox   # testnet URLs (same as --testnet)
ccxt bybit fetchBalance --demo            # demo-trading mode (live host, simulated funds)
```

`--sandbox` requires the exchange to declare test URLs; otherwise it fails (with `TypeError: Invalid URL` or `NotSupported`). Exchanges with demo-trading portals (binance, bybit, okx, gate, ...) use `--demo` with API keys generated in the demo portal.

## Output control and scripting

```bash
ccxt kraken fetchTicker BTC/USD --raw            # pristine JSON only — pipe to jq
ccxt kraken fetchTrades BTC/USD --no-table       # plain object dump instead of a table
ccxt kraken fetchTrades BTC/USD --iso8601        # timestamps as ISO8601 in tables
ccxt kraken fetchTicker BTC/USD --clipboard      # copy JSON result to clipboard
```

Array results render as a table by default; `--no-table` disables that.

Scripting example:

```bash
last=$(ccxt kraken fetchTicker BTC/USD --raw | jq -r '.last')
```

Scripting facts:

- The CLI exits with code `1` on errors — check `$?`.
- Errors print to **stdout**, not stderr, even with `--raw` — on failure your pipe receives colored non-JSON text. Guard with `jq -e` or check the exit code before parsing.
- WebSocket/`--poll` modes stream continuously — for scripts stick to one-shot `fetch*` calls.
- Each `npx` invocation pays startup overhead; for repeated calls install globally (`npm i -g ccxt-cli`) or use `--i` interactive mode.

## Real-time data (WebSocket)

Any `watch*` method streams continuously until Ctrl+C:

```bash
ccxt binance watchTicker BTC/USDT
ccxt binance watchOrderBook BTC/USDT
ccxt binance watchTrades BTC/USDT
ccxt binance watchOrders BTC/USDT      # private
```

Built-in live terminal dashboards (WebSocket, one or more exchanges, comma-separated, no spaces):

```bash
ccxt ticker binance,bybit,okx BTC/USDT      # side-by-side live tickers
ccxt orderbook binance,bybit BTC/USDT       # live depth rendering
```

Poll a REST method in a rate-limited loop:

```bash
ccxt kraken fetchTicker BTC/USD --poll
```

## OHLCV charts

```bash
ccxt ohlcv binance BTC/USDT 1h
```

Fetches candles via REST, generates a self-contained interactive HTML chart (candlesticks + volume), and opens it in the browser. Charts are saved under `$CACHE/ccxt-cli/charts/`.

## Interactive mode

```bash
ccxt kraken fetchTicker BTC/USD --i
```

Keeps the session open and prompts for the next command (`[command]:`), reusing the process — faster for exploring an exchange (markets stay loaded).

## Market cache

`loadMarkets()` results are cached for 24h under `$CACHE/ccxt-cli/markets/`, which makes repeat invocations much faster.

```bash
ccxt binance fetchTicker BTC/USDT --refresh-markets    # force re-download markets
```

If a symbol is reported as not found but exists on the exchange, refresh the market cache first.

> Note: `--no-load-markets` (skip market loading) is currently non-functional in released ccxt-cli versions — it is accepted but ignored, and markets load anyway.

## Debugging

```bash
ccxt kraken fetchTicker BTC/USD --verbose    # full HTTP request/response dump
```

`--verbose` is the first thing to reach for on signing, parsing, or rate-limit issues.

> ⚠️ **Do NOT rely on `--no-send` as a dry run.** In current ccxt-cli releases the flag is accepted but silently ignored — **the request IS sent to the exchange**. Use `--sandbox` or an exchange-side test param (below) to validate orders safely. There is also no keyless dry-run: private calls fail at signing (`AuthenticationError: requires "apiKey"`) before any request is built.

For CCXT contributors running from the repo: `--request` / `--response` print static-test fixture templates for `ts/src/test/static/`, and `--static` prints both (add `--name "description"` to auto-save).

## Trading safely

```bash
# 1. Test on sandbox/testnet first
ccxt binance createOrder BTC/USDT limit buy 0.001 60000 --sandbox

# 2. Or use the exchange's order-test param where supported
ccxt binance createOrder BTC/USDT market buy 0.01 undefined --param test=true

# 3. Then go live with a small amount, and know how to exit:
ccxt binance createOrder BTC/USDT limit buy 0.001 60000
ccxt binance fetchOpenOrders BTC/USDT
ccxt binance cancelOrder 123456789 BTC/USDT     # order id first, then symbol
```

- Always test with small amounts, on sandbox first.
- `createOrder` argument order is `symbol type side amount [price] [params]` — for market orders pass `undefined` for price if you need to add `--param` values after it.
- Never share or commit API keys; prefer environment variables or the config file with restricted permissions.

## Common errors

| Symptom | Cause / fix |
|---|---|
| `AuthenticationError` | Missing/wrong credentials — check env var names (`ccxt --help` shows config path), or exchange needs an extra credential (e.g. okx `password`) |
| `ExchangeNotAvailable ... 451` | Exchange geo-blocks your IP (common with binance). Use another exchange or a proxy |
| `RateLimitExceeded ... 403 Forbidden` with a CloudFront country message | Also a geo-block (common with bybit), not real rate-limiting — same fix as above |
| `no such property` after method name | Method doesn't exist on that exchange — check `ccxt methods <exchange>` |
| `BadSymbol` | Wrong market symbol format — unified symbols are like `BTC/USDT` (spot) or `BTC/USDT:USDT` (perpetual swap) |
| `InvalidOrder` | Amount/price below exchange minimums, or wrong `type`/`side` |
| Args land in wrong positions | You skipped optional positionals — pad with `undefined` (see Argument rules) |
| `TypeError: Invalid URL` (or `NotSupported`) with `--sandbox` | Exchange has no testnet URLs — try `--demo` or a different exchange |
| Stale/missing symbols | Market cache out of date — `--refresh-markets` |

Errors print in red with the CCXT exception class name (`ExchangeError` subclasses) — the same hierarchy as the CCXT library, so `RateLimitExceeded`, `InsufficientFunds`, `OrderNotFound`, etc. mean exactly what they do in code.

## Quirks and pitfalls

- **Positional `undefined` padding is mandatory** when skipping optionals and especially before `--param` (see Argument rules Rule 3).
- **Perpetual swaps** use the `BASE/QUOTE:SETTLE` symbol format (`BTC/USDT:USDT`) or `--swap` with the plain symbol, depending on the exchange.
- **Date-only strings don't auto-convert** — `"2025-05-01"` stays a string; use `"2025-05-01T00:00:00Z"`.
- **JSON arguments need shell quotes**: `'{"recvWindow":5000}'`.
- **`watch*` and `--poll` never exit** on their own — Ctrl+C stops them.
- **First call per exchange is slow** (downloads markets); subsequent calls hit the 24h cache.
- **A failed `loadMarkets()` aborts the call** — even public methods die if market loading fails (e.g. geo-block), and the CLI still echoes the resolved call after printing the loadMarkets error, which can be misleading.
- **Broken flags in current releases:** `--no-send` and `--no-load-markets` are accepted but silently ignored — don't rely on either (see Debugging).
- **Command history is saved** (including any inline arguments) to `$CACHE/ccxt-cli/history/commands.json` — keep secrets in env vars or config, never as CLI arguments.

## Reference: options summary

| Option | Effect |
|---|---|
| `--verbose` | print raw HTTP request/response |
| `--sandbox` / `--testnet` | use exchange testnet |
| `--demo` | enable demo-trading mode |
| `--no-keys` | ignore any detected credentials |
| `--param k=v` | add key to the `params` object (repeatable) |
| `--raw` | JSON-only output for piping |
| `--no-table` | disable table rendering (tables are the default for arrays) |
| `--iso8601` | human-readable timestamps in tables |
| `--clipboard` | copy result JSON to clipboard |
| `--spot` / `--swap` / `--future` / `--option` | set `defaultType` |
| `--poll` | repeat the call continuously |
| `--i` | interactive session |
| `--refresh-markets` | force market cache refresh |
| `--cache-markets` | force market caching |
| `--signIn` | call `signIn()` first (exchanges that need it) |

## Learn more

- CCXT documentation: https://docs.ccxt.com
- CLI source and README: https://github.com/ccxt/ccxt/tree/master/cli
- Unified symbols/markets: https://docs.ccxt.com/#/?id=markets
- For writing programs instead of shell commands, see the language skills: `/ccxt-typescript`, `/ccxt-python`, `/ccxt-php`, `/ccxt-csharp`, `/ccxt-go`, `/ccxt-java`
