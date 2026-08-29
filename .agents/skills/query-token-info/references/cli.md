# query-token-info — CLI Reference

Complete reference for every command in `scripts/cli.mjs`.

**Invocation pattern:** `node <skill-dir>/scripts/cli.mjs <command> '<json_params>'`
**Exit codes:** `0` success · `1` usage/upstream error · `3` network failure

---

## `search` — Search tokens by keyword

```bash
node <skill-dir>/scripts/cli.mjs search '{"keyword":"<keyword>","chainIds":"56"}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `keyword` | string | **yes** | Name / symbol / contract address |
| `chainIds` | string | no | Comma-separated chainIds (e.g. `"56"`, `"1,56,8453,CT_501"`); default: all |
| `orderBy` | string | no | Sort key, e.g. `volume24h` |

### Return fields (under `.data[]`)

| Field | Type | Description |
|---|---|---|
| `chainId` | string | Chain identifier (e.g. `"56"` = BSC) |
| `contractAddress` | string | Token contract address |
| `tokenId` | string | Binance-internal token ID (stable across address changes) |
| `name`, `symbol` | string | Token display names |
| `icon` | string | Logo path — prefix with `https://bin.bnbstatic.com` |
| `price`, `percentChange24h` | string | Latest USD price and 24h change (%) |
| `volume24h`, `marketCap`, `liquidity` | string | All USD; string-encoded decimals |
| `tagsInfo` | object | Risk / recognition tags, categorized (e.g. `"Sensitive Events": [...]`, `"Community Recognition Level": [...]`) |

---

## `meta` — Static token metadata

```bash
node <skill-dir>/scripts/cli.mjs meta '{"chainId":"56","contractAddress":"0x..."}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | Chain identifier |
| `contractAddress` | string | **yes** | Token contract address (case-insensitive) |

### Return fields (under `.data`)

| Field | Type | Description |
|---|---|---|
| `tokenId` | string | Binance-internal stable ID |
| `name`, `symbol`, `decimals` | — | Display name, ticker, precision |
| `chainName`, `chainIconUrl` | string | Chain display info |
| `links` | array of `{label, link}` | Website / whitepaper / social links |
| `aiNarrativeFlag` | number | `1` = AI has narrative summary available |
| `nativeAddressFlag` | boolean | `true` = native chain coin (not an ERC-20) |

`links[]` entries are `{label, link}` — labels include `"website"`, `"whitepaper"`, social platforms.

---

## `dynamic` — Real-time market data

```bash
node <skill-dir>/scripts/cli.mjs dynamic '{"chainId":"56","contractAddress":"0x..."}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | Chain identifier |
| `contractAddress` | string | **yes** | Token contract address |

### Return fields (under `.data`)

Price + volume/buy/sell breakdowns across multiple windows (5m, 1h, 4h, 24h), separated by on-chain vs Binance-routed:

| Field pattern | Meaning |
|---|---|
| `price`, `nativeTokenPrice` | Current USD price and chain-native price |
| `volume{5m,1h,4h,24h}` | Total trading volume in window (USD) |
| `volume{window}{Buy,Sell}` | Direction breakdown |
| `volume{window}Binance` | Binance-routed subset |
| `volume{window}Net{Buy,Binance}` | Net flow = Buy − Sell |
| `holders` | Holder count (if available) |
| `liquidity` | Current liquidity in USD |

---

## `kline` — Candlestick OHLCV

```bash
node <skill-dir>/scripts/cli.mjs kline '{"chainId":"56","contractAddress":"0x...","interval":"1h","limit":24}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | Chain identifier — `1` (Ethereum) / `56` (BSC) / `8453` (Base) / `CT_501` (Solana) |
| `contractAddress` | string | **yes** | Token contract address |
| `interval` | string | **yes** | Candle size: `1s` / `1min` / `3min` / `5min` / `15min` / `30min` / `1h` / `2h` / `4h` / `6h` / `8h` / `12h` / `1d` / `3d` / `1w` / `1m` |
| `limit` | number | no | Optional. Max 500 per request. Has higher priority than `from` when both provided. |
| `from` | number | no | Optional. Start timestamp in **milliseconds**. |
| `to` | number | no | Optional. End timestamp in **milliseconds**. |
| `pm` | string | no | Optional. Price mode — `p` (price, default) or `m` (marketcap). |

### Return shape (under `.data[]`)

Each row is a 2D array (7 numbers):

| Index | Field |
|---|---|
| `[0]` | open price (USD) |
| `[1]` | high price |
| `[2]` | low price |
| `[3]` | close price |
| `[4]` | volume |
| `[5]` | timestamp (ms since epoch, start of candle) |
| `[6]` | trade count |

Envelope is `{ data, status: {error_code, error_message} }` — no `code` field (unlike other commands).

---

## Errors

Exit codes: `0` ok · `1` upstream/usage (stderr: reason; stdout: body with business `code`) · `3` network.
Business `code`: `000000` ok · `100004` rate-limited · `100002` bad param · `000400` token not found / unsupported chain.
