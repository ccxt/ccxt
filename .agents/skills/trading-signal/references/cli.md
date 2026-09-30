# trading-signal — CLI Reference

Complete reference for every command in `scripts/cli.mjs`.

**Invocation pattern:** `node <skill-dir>/scripts/cli.mjs <command> '<json_params>'`
**Exit codes:** `0` success · `1` usage/upstream error · `3` network failure

---

## `smart-money` — On-chain Smart Money trading signals

> ⚠️ Only `"56"` (BSC) and `"CT_501"` (Solana) are supported. `pageSize` max is `100`. Signals with `status: "timeout"` are stale — prefer `"valid"` / `"active"` signals.

```bash
node <skill-dir>/scripts/cli.mjs smart-money '{"chainId":"CT_501","page":1,"pageSize":20}'
```

### Parameters

| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `chainId` | string | **yes** | — | `"56"` (BSC) · `"CT_501"` (Solana) |
| `page` | number | no | `1` | Page number (1-indexed) |
| `pageSize` | number | no | — | Items per page, max `100` |
| `smartSignalType` | string | no | — | Filter by signal type (e.g. `"SMART_MONEY"`); omit for all |

### Return fields (under `.data[]`)

**Token identity**

| Field | Type | Description |
|---|---|---|
| `signalId` | number | Unique signal ID |
| `ticker` | string | Token symbol |
| `chainId` | string | Chain identifier |
| `contractAddress` | string | Token contract address |
| `logoUrl` | string | Logo path — prefix with `https://bin.bnbstatic.com` |
| `chainLogoUrl` | string | Full URL of the chain icon |
| `tokenDecimals` | number | Token decimals |

**Tags & flags**

| Field | Type | Description |
|---|---|---|
| `isAlpha` | boolean | Marked as Alpha token |
| `launchPlatform` | string | Launch platform (e.g. `"Pumpfun"`, `"Moonshot"`) |
| `tokenTag` | object | Categorized tags. Known categories: `"Social Events"`, `"Launch Platform"`, `"Sensitive Events"`, `"Wash Trading Behavior"` |

**Signal data**

| Field | Type | Description |
|---|---|---|
| `smartSignalType` | string | e.g. `"SMART_MONEY"` |
| `direction` | string | `"buy"` or `"sell"` |
| `smartMoneyCount` | number | Smart money addresses triggering the signal (higher = stronger) |
| `signalCount` | number | Historical signal count for this token |
| `signalTriggerTime` | number | Signal trigger timestamp (ms) |
| `timeFrame` | number | Observation window (ms) |

**Price & performance**

| Field | Type | Description |
|---|---|---|
| `alertPrice`, `alertMarketCap` | string | Price / market cap at trigger (USD) |
| `currentPrice`, `currentMarketCap` | string | Latest price / market cap (USD) |
| `highestPrice`, `highestPriceTime` | string, number | Peak after signal + timestamp (ms) |
| `totalTokenValue` | string | Aggregate trade value at signal (USD) |
| `maxGain` | string | Max % gain since trigger — **decimal fraction** (e.g. `"0.25"` = 25%); multiply by 100 when displaying as a percentage |
| `exitRate` | number | % of smart money already exited (high = stale) |
| `status` | string | Signal status. Values: `active` (monitoring), `valid` (fresh/open), `timeout` (expired), `completed` (closed). |

**Sample `tokenTag` shape** (categorized; each category holds `[{tagName}]`):

```json
"tokenTag": {
  "Social Events": [{"tagName": "DEX Paid"}],
  "Launch Platform": [{"tagName": "Pumpfun"}],
  "Sensitive Events": [{"tagName": "Smart Money Add Holdings"}],
  "Wash Trading Behavior": [{"tagName": "Insider Wash Trading"}]
}
```

**Signal quality:** `smartMoneyCount ≥ 5` = stronger conviction · `exitRate ≥ 70` = already exiting, treat with caution · `status:"timeout"` = no longer actionable.

---

## Errors

Exit codes: `0` ok · `1` upstream/usage (stderr: reason; stdout: body with business `code`) · `3` network.
Business `code`: `000000` ok · `100004` rate-limited · `100002` bad param (check `chainId`/`pageSize`) · `000400` unsupported chain.
