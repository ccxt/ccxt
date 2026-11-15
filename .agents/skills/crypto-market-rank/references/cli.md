# crypto-market-rank — CLI Reference

Complete reference for every command in `scripts/cli.mjs`.

**Invocation pattern:** `node <skill-dir>/scripts/cli.mjs <command> '<json_params>'`
**Exit codes:** `0` success · `1` usage/upstream error · `3` network failure

**Supported chains:** BSC (`56`), Base (`8453`), Solana (`CT_501`). Per-command restrictions noted below.

---

## `social-hype` — Social buzz leaderboard

```bash
node <skill-dir>/scripts/cli.mjs social-hype '{"chainId":"56","targetLanguage":"en","timeRange":1}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | Chain identifier |
| `targetLanguage` | string | **yes** | Translation target, e.g. `"en"`, `"zh"` |
| `timeRange` | number | **yes** | Time range, `1` = 24h |
| `sentiment` | string | no | Filter: `All` / `Positive` / `Negative` / `Neutral` |
| `socialLanguage` | string | no | Content language, `"ALL"` for all |

### Return fields (under `.data.leaderBoardList[]`)

| Field Path | Type | Description |
|---|---|---|
| `metaInfo.symbol` / `metaInfo.logo` | string | Token symbol and icon path (prefix `https://bin.bnbstatic.com`) |
| `metaInfo.chainId` / `metaInfo.contractAddress` | string | Chain + contract |
| `metaInfo.tokenAge` | number | Creation timestamp (ms) |
| `marketInfo.marketCap` / `marketInfo.priceChange` | number | Market cap (USD), 24h % change |
| `socialHypeInfo.socialHype` | number | Total social hype index |
| `socialHypeInfo.sentiment` | string | `Positive` / `Negative` / `Neutral` |
| `socialHypeInfo.socialSummaryBrief` / `...Detail` | string | Social summary (short / detailed) |
| `socialHypeInfo.socialSummaryBriefTranslated` / `...DetailTranslated` | string | Translated summaries |

**Nested shape:** each entry is `{metaInfo, marketInfo, socialHypeInfo}` — fields grouped by the three objects above.

---

## `token-rank` — Unified token rank (POST)

> ⚠️ `rankType` determines the list: `10`=Trending · `11`=TopSearch · `20`=Alpha · `40`=Stock.

```bash
node <skill-dir>/scripts/cli.mjs token-rank '{"rankType":10,"chainId":"56","page":1,"size":20}'
```

### Parameters (all optional; body is a JSON object)

**Core:**

| Field | Type | Default | Description |
|---|---|---|---|
| `rankType` | integer | `10` | `10`=Trending, `11`=TopSearch, `20`=Alpha, `40`=Stock |
| `chainId` | string | — | `"1"`, `"56"`, `"8453"`, `"CT_501"` |
| `period` | integer | `50` | `10`=1m, `20`=5m, `30`=1h, `40`=4h, `50`=24h |
| `sortBy` | integer | `0` | See Sort Options below |
| `orderAsc` | boolean | `false` | Ascending if `true` |
| `page` / `size` | integer | `1` / `200` | Pagination (size max 200) |

**Min/Max filters (decimal unless noted):** `percentChange` · `marketCap` · `volume` · `liquidity` · `holders` (long) · `holdersTop10Percent` · `kycHolders` (long, Alpha only) · `count` (long) · `uniqueTrader` (long) · `launchTime` (long, ms).

**Advanced filters:** `keywords` / `excludes` (string[]) · `socials` (int[]: `0`=at_least_one, `1`=X, `2`=Telegram, `3`=Website) · `alphaTagFilter` (string[]) · `auditFilter` (int[]: `0`=not_renounced, `1`=freezable, `2`=mintable) · `tagFilter` (int[]: `0`=hide_alpha, `23`=dex_paid, `29`=alpha_points, …).

**Sort Options (`sortBy`):** `0`=Default · `1`=Web default · `2`=Search count · `10`=Launch time · `20`=Liquidity · `30`=Holders · `40`=Market cap · `50`=Price change · `60`=Tx count · `70`=Volume · `80`=KYC holders · `90`=Price · `100`=Unique traders.

### Return fields (under `.data.tokens[]`)

| Field | Type | Description |
|---|---|---|
| `chainId` / `contractAddress` / `symbol` / `icon` | string | Identity + logo (prefix `https://bin.bnbstatic.com`) |
| `price` / `marketCap` / `liquidity` / `holders` | string | All USD string-encoded decimals |
| `percentChange{1m,5m,1h,4h,24h}` | string | Price change per window (%) |
| `volume{window}` / `volume{window}{Buy,Sell}` | string | Volume + direction breakdown |
| `count{window}` / `count{window}{Buy,Sell}` | string | Transaction counts |
| `uniqueTrader{window}` | string | Unique traders per window |
| `alphaInfo` | object | Alpha metadata (`tagList`, `description`) |
| `auditInfo` | object | Audit info (`riskLevel`, `riskNum`, `cautionNum`) |
| `launchTime` / `decimals` | string / int | Launch timestamp (ms), token decimals |
| `kycHolders` / `holdersTop10Percent` | string | KYC holder count, top-10 % |

`.data.total` / `.data.page` / `.data.size` provide pagination context.

---

## `smart-money-inflow` — Smart money net inflow rank (POST)

> ⚠️ **BSC (`56`) and Solana (`CT_501`) only.**
> ⚠️ `tagType` defaults to `2` (the CLI injects it automatically if omitted — always the correct value).

```bash
node <skill-dir>/scripts/cli.mjs smart-money-inflow '{"chainId":"56","period":"24h"}'
```

### Parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | `"56"` (BSC), `"CT_501"` (Solana) |
| `period` | string | no | `"5m"` / `"1h"` / `"4h"` / `"24h"` |
| `tagType` | integer | auto | Injected as `2` if omitted — upstream only accepts `2` |

### Return fields (under `.data[]`)

| Field | Type | Description |
|---|---|---|
| `tokenName` / `tokenIconUrl` | string | Name + icon path (prefix `https://bin.bnbstatic.com`) |
| `ca` | string | Contract address |
| `price` / `marketCap` / `volume` / `liquidity` | string | USD, string-encoded |
| `priceChangeRate` | string | Price change in period (%) |
| `holders` / `kycHolders` / `holdersTop10Percent` | string | Holder stats |
| `count` / `countBuy` / `countSell` | string | Tx counts in period |
| `inflow` | number | **Smart money net inflow (USD)** — primary ranking metric |
| `traders` | integer | Number of smart-money addresses trading this token |
| `launchTime` | number | Launch timestamp (ms) |
| `tokenDecimals` | integer | Token decimals |
| `tokenRiskLevel` | integer | `-1`=unknown, `1`=low, `2`=medium, `3`=high |
| `link` | array | `[{label, link}]` social links |
| `tokenTag` | object | Tags by category |

---

## `meme-rank` — Top meme tokens from Pulse launchpad

> ⚠️ **BSC (`56`) only.** Returns top 100 meme tokens launched via Pulse, scored and ranked by a breakout-potential algorithm.

```bash
node <skill-dir>/scripts/cli.mjs meme-rank '{"chainId":"56"}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | Must be `"56"` (BSC) |

### Return fields (under `.data.tokens[]`)

| Field | Type | Description |
|---|---|---|
| `rank` / `score` | integer / string | Rank position and algorithm score (higher = stronger breakout signal) |
| `chainId` / `contractAddress` / `symbol` | string | Identity |
| `metaInfo.icon` / `metaInfo.name` / `metaInfo.decimals` | — | Logo path, full name, decimals |
| `metaInfo.aiNarrativeFlag` | int | `1` = AI narrative summary available |
| `price` / `percentChange` / `percentChange7d` | string | Current price, current %, 7-day % |
| `marketCap` / `liquidity` / `volume` | string | USD |
| `volumeBnTotal` / `volumeBn7d` | string | Binance-user volume (total / 7d) |
| `holders` / `kycHolders` / `bnUniqueHolders` / `holdersTop10Percent` | string | Holder stats |
| `count` / `countBnTotal` / `countBn7d` | integer | Transaction counts |
| `uniqueTraderBn` / `uniqueTraderBn7d` | integer | Binance unique traders |
| `impression` | integer | View count |
| `createTime` / `migrateTime` | number | Creation + migration timestamps (ms) |
| `alphaStatus` | integer | Alpha listing status |
| `previewLink` | object | `{website[], x[], telegram[]}` |
| `tokenTag` | object | Tags by category |

---

## `address-pnl-rank` — Top trader PnL leaderboard

> ⚠️ **Chain support:** `"56"` (BSC), `"CT_501"` (Solana).
> ⚠️ **`period` accepted values:** `"7d"` / `"30d"` / `"90d"`.
> ⚠️ `pageSize` max = `25`.

```bash
node <skill-dir>/scripts/cli.mjs address-pnl-rank '{"chainId":"CT_501","period":"30d","tag":"ALL","pageNo":1,"pageSize":25}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | `"56"` or `"CT_501"` |
| `period` | string | **yes** | `"7d"` / `"30d"` / `"90d"` |
| `tag` | string | **yes** | `"ALL"` or `"KOL"` |
| `sortBy` | integer | no | Sort field |
| `orderBy` | integer | no | Order direction |
| `pageNo` | integer | no | Min 1 |
| `pageSize` | integer | no | Max 25 |

**Min/Max filters:** `PNL` (decimal) · `winRate` (decimal, e.g. `1` = 1%) · `tx` (long) · `volume` (decimal).

### Return fields (under `.data.data[]`)

| Field | Type | Description |
|---|---|---|
| `address` / `addressLogo` / `addressLabel` | string | Wallet, avatar, display name |
| `balance` | string | On-chain native coin balance (chain-native gas token) |
| `tags` / `genericAddressTagList` | array | Tag info (e.g. KOL; detailed version has `tagName`, `logoUrl`, `extraInfo`) |
| `realizedPnl` / `realizedPnlPercent` | string | Period PnL in USD and % |
| `dailyPNL` | array | `[{realizedPnl, dt}]` per-day breakdown |
| `winRate` | string | Win rate for the period |
| `totalVolume` / `buyVolume` / `sellVolume` / `avgBuyVolume` | string | Volume breakdown (USD) |
| `totalTxCnt` / `buyTxCnt` / `sellTxCnt` | integer | Transaction counts |
| `totalTradedTokens` | integer | Number of distinct tokens traded |
| `topEarningTokens` | array | `[{tokenAddress, tokenSymbol, tokenUrl, realizedPnl, profitRate}]` |
| `tokenDistribution` | object | `{gt500Cnt, between0And500Cnt, between0AndNegative50Cnt, ltNegative50Cnt}` |
| `lastActivity` | number | Last activity timestamp (ms) |

Pagination: `.data.current` / `.data.size` / `.data.pages`. `dailyPNL[]` entries are `{realizedPnl, dt}`. `topEarningTokens[]` entries are `{tokenAddress, tokenSymbol, tokenUrl, realizedPnl, profitRate}`.

---

## Errors

Exit codes: `0` ok · `1` upstream/usage (stderr: reason; stdout: body with business `code`) · `3` network.
Business `code`: `000000` ok · `100004` rate-limited · `100002` bad param · `000400` token not found / unsupported chain.

---

## Notes

- Icon URL prefix: `https://bin.bnbstatic.com` + `icon`/`logo`/`tokenIconUrl`.
- Most price / volume / market-cap fields are string-encoded decimals — parse before arithmetic.
