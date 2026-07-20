# meme-rush — CLI Reference

Complete reference for every command in `scripts/cli.mjs`.

**Invocation pattern:** `node <skill-dir>/scripts/cli.mjs <command> '<json_params>'`
**Exit codes:** `0` success · `1` usage/upstream error · `3` network failure

**Supported chains:** BSC (`56`), Solana (`CT_501`).

---

## `meme-rush` — Launchpad lifecycle tracking 

> ⚠️ `rankType` selects the lifecycle stage: `10`=New (freshly created, on bonding curve) · `20`=Finalizing (bonding curve nearly complete, about to migrate) · `30`=Migrated (just migrated to DEX).

```bash
node <skill-dir>/scripts/cli.mjs meme-rush '{"chainId":"CT_501","rankType":10,"limit":20}'
```

### Parameters (body is a JSON object; only `chainId` + `rankType` are required)

**Core:**

| Field | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | `"56"` (BSC) or `"CT_501"` (Solana) |
| `rankType` | integer | **yes** | `10`=New · `20`=Finalizing · `30`=Migrated |
| `limit` | integer | no | Max results (default 40, max 200) |
| `keywords` / `excludes` | string[] | no | Include / exclude symbol patterns (max 5 each) |

**Token filters (Min/Max pairs):** `progress` (string, 0–100) · `tokenAge` (long) · `holders` (long) · `liquidity` (string) · `volume` (string) · `marketCap` (string) · `count` / `countBuy` / `countSell` (long).

**Holder distribution filters (Min/Max, string %):** `holdersTop10Percent` · `holdersDevPercent` · `holdersSniperPercent` · `holdersInsiderPercent` · `bundlerHoldingPercent` · `newWalletHoldingPercent` · `bnHoldingPercent` · `bnHolders` (long) · `kolHolders` (long) · `proHolders` (long).

**Dev & launch filters:** `devMigrateCountMin/Max` (long) · `devPosition` (`2`=dev sold all) · `devBurnedToken` (`1`=yes) · `excludeDevWashTrading` (`1`=yes) · `excludeInsiderWashTrading` (`1`=yes).

**Other filters:** `protocol` (int[]; see Protocol Reference below) · `exclusive` (`1`=Binance exclusive) · `paidOnDexScreener` · `pumpfunLiving` · `cmcBoost` · `globalFeeMin/Max` (Solana only) · `pairAnchorAddress` (string[]) · `tokenSocials.atLeastOne` (`1`=yes) · `tokenSocials.socials` (string[]: `website` / `twitter` / `telegram`).

### Protocol Reference

Complete list of `protocol` codes (used in `protocol[]` filter and returned on each token).

| Code | Platform | Chain |   | Code | Platform | Chain |
|---|---|---|---|---|---|---|
| 1001 | Pump.fun | Solana |  | 1010 | Moonshot | Solana |
| 1002 | Moonit | Solana |  | 1011 | Jup Studio | Solana |
| 1003 | Pump AMM | Solana |  | 1012 | Bags | Solana |
| 1004 | Launch Lab | Solana |  | 1013 | Believer | Solana |
| 1005 | Raydium V4 | Solana |  | 1014 | Meteora DAMM V2 | Solana |
| 1006 | Raydium CPMM | Solana |  | 1015 | Meteora Pools | Solana |
| 1007 | Raydium CLMM | Solana |  | 1016 | Orca | Solana |
| 1008 | BONK | Solana |  | 2001 | Four.meme | BSC |
| 1009 | Dynamic BC | Solana |  | 2002 | Flap | BSC |

### Return fields (under `.data[]`)

**Core:**

| Field | Type | Description |
|---|---|---|
| `chainId` / `contractAddress` / `symbol` / `name` / `decimals` | — | Identity |
| `icon` | string | Logo path (prefix `https://bin.bnbstatic.com`) |
| `price` / `priceChange` | string | Current price (USD), 24h change (%) |
| `marketCap` / `liquidity` / `volume` | string | USD, string-encoded |
| `holders` | long | Holder count |
| `progress` | string | Bonding curve progress — pre-formatted, append `%` directly |
| `protocol` | integer | Launchpad protocol code |
| `exclusive` | integer | `1` = Binance exclusive token |

**Trade counts:** `count` / `countBuy` / `countSell` (long, 24h).

**Holder distribution (all string %, append `%` directly):** `holdersTop10Percent` · `holdersDevPercent` · `holdersSniperPercent` · `holdersInsiderPercent` · `bnHoldingPercent` · `kolHoldingPercent` · `proHoldingPercent` · `newWalletHoldingPercent` · `bundlerHoldingPercent`.

**Dev & migration:** `devAddress` · `devSellPercent` · `devMigrateCount` · `devPosition` (`2`=dev sold all) · `migrateStatus` (`0`/`1`) · `migrateTime` · `createTime`.

**Tags & flags:** `tagDevWashTrading` · `tagInsiderWashTrading` · `tagDevBurnedToken` · `tagPumpfunLiving` · `tagCmcBoost` · `paidOnDexScreener` · `launchTaxEnable` · `taxRate` · `globalFee` (Solana only).

**Socials:** `socials.website` / `socials.twitter` / `socials.telegram`.

**AI narrative:** `narrativeText.en` / `narrativeText.cn`.

---

## `topic-rush` — AI-powered hot-topic discovery (GET)

> ⚠️ `rankType`: `10`=Latest (newest hot topics) · `20`=Rising (topics with ATH net-inflow between $1k and $20k).
> ⚠️ **`sort` default convention:** when the user does not specify a preference, use `sort=10` (create time). `sort=20` = net inflow.

```bash
node <skill-dir>/scripts/cli.mjs topic-rush '{"chainId":"CT_501","rankType":10,"sort":10,"asc":false}'
```

### Parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `chainId` | string | **yes** | `"56"` or `"CT_501"` |
| `rankType` | integer | **yes** | `10`=Latest · `20`=Rising |
| `sort` | integer | **yes** | `10`=create time (default) · `20`=net inflow |
| `asc` | boolean | no | `true`=ascending, `false`=descending |
| `keywords` | string | no | Case-insensitive contains match |
| `topicType` | string | no | Comma-separated topic-type filter |
| `tokenSizeMin/Max` | integer | no | Associated-token count range |
| `netInflowMin/Max` | string | no | Topic net-inflow range (USD) |

### Return fields (under `.data[]`)

**Topic-level:**

| Field | Type | Description |
|---|---|---|
| `topicId` | string | Unique topic ID |
| `chainId` | string | Chain ID |
| `name.topicNameEn` / `name.topicNameCn` | string | Multi-language topic name |
| `type` | string | Topic category (e.g. `Culture`) |
| `close` | integer | `0`=active, `1`=closed |
| `topicLink` | string | Related tweet / post URL |
| `createTime` | long | Topic creation timestamp (ms) |
| `progress` | string | Topic progress — pre-formatted %, append `%` directly |
| `aiSummary.aiSummaryEn` / `aiSummary.aiSummaryCn` | string | AI-generated narrative |
| `topicNetInflow` / `topicNetInflow1h` / `topicNetInflowAth` | string | Net inflow: total / 1h / ATH (USD) |
| `tokenSize` | integer | Number of associated tokens |
| `deepAnalysisFlag` | integer | `1`=deep analysis available |
| `topicTags` | string[] | Topic tags (e.g. `Crypto Native`, `Celebrity`) |

**Associated tokens** (`tokenList[]` within each topic):

| Field | Type | Description |
|---|---|---|
| `chainId` / `contractAddress` / `symbol` / `decimals` | — | Identity |
| `icon` | string | Logo path (prefix `https://bin.bnbstatic.com`) |
| `createTime` | long | Token creation timestamp (ms) |
| `marketCap` / `liquidity` | string | USD |
| `priceChange24h` | string | 24h % (pre-formatted) |
| `netInflow` / `netInflow1h` | string | Net inflow since topic creation / last 1h (USD) |
| `volumeBuy` / `volumeSell` / `volume1hBuy` / `volume1hSell` | string | Volume breakdown (USD) |
| `uniqueTrader{5m,1h,4h,24h}` | long | Unique traders by window |
| `count{5m,1h,4h,24h}` | long | Trade count by window |
| `holders` / `kolHolders` / `smartMoneyHolders` | long | Holder stats |
| `protocol` | integer | Launchpad protocol code (`0` / null = DEX token) |
| `internal` | integer | `1`=on bonding curve |
| `migrateStatus` | integer | `1`=migrated |

**Nested shape:** each topic has `name: {topicNameEn, topicNameCn}` (and `aiSummary` similarly) plus `tokenList[]` with full per-token stats inline.

---

## Errors

Exit codes: `0` ok · `1` upstream/usage (stderr: reason; stdout: body with business `code`) · `3` network.
Business `code`: `000000` ok · `100004` rate-limited · `100002` bad param · `000400` token not found / unsupported chain.

---

## Notes

- Percentage fields (`progress`, holder %, `devSellPercent`, `taxRate`, `priceChange24h`) are pre-formatted — append `%` directly, do **not** multiply by 100.
- `taxRate` visibility: `protocol=2001` (Four.meme) only on Migrated (`rankType=30`); `protocol=2002` (Flap) on all lists.
