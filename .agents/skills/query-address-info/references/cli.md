# query-address-info — CLI Reference

Complete reference for every command in `scripts/cli.mjs`.

**Invocation pattern:** `node <skill-dir>/scripts/cli.mjs <command> '<json_params>'`
**Exit codes:** `0` success · `1` usage/upstream error · `3` network failure

---

## `positions` — Wallet active-position list

```bash
node <skill-dir>/scripts/cli.mjs positions '{"address":"0x...","chainId":"56","offset":0}'
```

### Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | **yes** | Wallet address (EVM `0x...` or Solana base58) |
| `chainId` | string | **yes** | `"56"` (BSC) · `"8453"` (Base) · `"CT_501"` (Solana) |
| `offset` | number | **yes** | Pagination offset (start from `0`) |

### Return fields (under `.data.list[]`)

| Field | Type | Description |
|---|---|---|
| `chainId` | string | Chain identifier |
| `address` | string | Queried wallet address (lowercased) |
| `contractAddress` | string | Token contract address |
| `binanceTokenId` | string | Binance-internal stable token ID |
| `name`, `symbol` | string | Token display names |
| `icon` | string | Logo path — prefix with `https://bin.bnbstatic.com` |
| `decimals` | number | Token decimals |
| `price` | string | Current USD price (decimal string) |
| `percentChange24h` | string | 24h price change (%, signed decimal string) |
| `baseCoinPrice` | string | USD price of the chain native coin |
| `remainQty` | string | Holding quantity (human-readable, already divided by decimals) |
| `circulatingSupply` | string | Circulating supply |
| `riskLevel`, `riskLevelInt` | string \| null, number | Risk badge (`"LOW"` = 1, etc.); may be `null` |
| `lowLiquidity` | number | `1` = low-liquidity warning |

### Response envelope (under `.data`)

| Field | Type | Description |
|---|---|---|
| `offset` | number | Echo of request offset |
| `list` | array \| `null` | Position list; `null` when wallet has no tracked holdings |
| `addressStatus` | any | Reserved (currently always `null`) |

---

## Errors

Exit codes: `0` ok · `1` upstream/usage (stderr: reason; stdout: body with business `code`) · `3` network.
Business `code`: `000000` ok · `100004` rate-limited · `100002` bad param · `000400` unsupported chain / bad address.
