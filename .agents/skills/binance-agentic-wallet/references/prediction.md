# Prediction Markets

Browse prediction markets, query the user's positions and orders, and trade outcome tokens.

A prediction **market** asks a yes/no (or multi-outcome) question that will resolve at some point in the future. Each outcome is represented by an ERC-1155 **outcome token**. Buying an outcome token is betting on that outcome; if the market resolves in your favor, the token can be redeemed for payout.

Commands are grouped into three categories: **market/category queries**, **position/order queries**, and **trade commands** (`quote`, `place-order`, `cancel`, `redeem`).

---

## `prediction category list`

List available prediction market categories (e.g. crypto, sports, politics).

### Syntax

```bash
baw prediction category list --json
```

### Example

```bash
baw prediction category list --json
```

---

## `prediction market list`

List prediction markets, optionally filtered by category and sorted.

### Syntax

```bash
baw prediction market list [--l1Category <category>] [--l2Category <category>] [--sortBy <sort>] [--orderBy <order>] [--offset <offset>] [--limit <limit>] --json
```

### Parameters

| Parameter      | Required | Default | Description                                                                    |
|----------------|----------|---------|--------------------------------------------------------------------------------|
| `--l1Category` | No       | —       | L1 category filter (e.g. `crypto`, `sports`). From `prediction category list`. |
| `--l2Category` | No       | —       | L2 subcategory filter                                                          |
| `--sortBy`     | No       | —       | `RECOMMENDED`, `VOLUME`, `PARTICIPANTS`, `CREATED_TIME`, `END_DATE`            |
| `--orderBy`    | No       | `DESC`  | `ASC` or `DESC`                                                                |
| `--offset`     | No       | `0`     | Pagination offset                                                              |
| `--limit`      | No       | `20`    | Page size, max 100                                                             |

### Example

```bash
baw prediction market list --json
baw prediction market list --l1Category crypto --limit 5 --json
baw prediction market list --sortBy VOLUME --orderBy DESC --json
```

---

## `prediction market detail`

Get the full detail of a single prediction market by its topic ID.

### Syntax

```bash
baw prediction market detail --marketTopicId <id> --json
```

### Parameters

| Parameter         | Required | Default | Description     |
|-------------------|----------|---------|-----------------|
| `--marketTopicId` | Yes      | —       | Market topic ID |

### Example

```bash
baw prediction market detail --marketTopicId 123456 --json
```

---

## `prediction market search`

Search prediction markets by keyword.

### Syntax

```bash
baw prediction market search --query <query> [--limit <limit>] --json
```

### Parameters

| Parameter | Required | Default | Description                   |
|-----------|----------|---------|-------------------------------|
| `--query` | Yes      | —       | Search keyword, max 200 chars |
| `--limit` | No       | `10`    | Max results, max 50           |

### Example

```bash
baw prediction market search --query "Bitcoin" --json
baw prediction market search --query "FIFA World Cup" --limit 5 --json
```

---

## `prediction market order-book`

Get the order book for a specific outcome token.

### Syntax

```bash
baw prediction market order-book --marketId <id> --tokenId <tokenId> --json
```

### Parameters

| Parameter    | Required | Default | Description      |
|--------------|----------|---------|------------------|
| `--marketId` | Yes      | —       | Market ID        |
| `--tokenId`  | Yes      | —       | Outcome token ID |

### Example

```bash
baw prediction market order-book --marketId 789 --tokenId 123456789 --json
```

---

## `prediction market last-trade-price`

Get the last trade price for a market.

This is a **historical fill price**, not a live market quote — it can be stale if there have been no recent trades, and it does not reflect the current best bid/ask.

### Syntax

```bash
baw prediction market last-trade-price --marketId <id> --json
```

### Parameters

| Parameter    | Required | Default | Description |
|--------------|----------|---------|-------------|
| `--marketId` | Yes      | —       | Market ID   |

### Example

```bash
baw prediction market last-trade-price --marketId 789 --json
```

---

## `prediction position list`

List the user's active and past prediction positions with PnL summary.

### Syntax

```bash
baw prediction position list [--tab <tab>] [--offset <offset>] [--limit <limit>] --json
```

### Parameters

| Parameter  | Required | Default   | Description                                 |
|------------|----------|-----------|---------------------------------------------|
| `--tab`    | No       | `ONGOING` | Filter: `ONGOING`, `ENDED`, `PENDING_CLAIM` |
| `--offset` | No       | `0`       | Pagination offset                           |
| `--limit`  | No       | `20`      | Page size, max 100                          |

`PENDING_CLAIM` surfaces winning positions that have not yet been redeemed — use [`prediction trade redeem`](#prediction-trade-redeem) to claim them.

### Example

```bash
baw prediction position list --json
baw prediction position list --tab PENDING_CLAIM --json
```

---

## `prediction position token`

Look up a single position by its ERC-1155 outcome token ID.

### Syntax

```bash
baw prediction position token --tokenId <tokenId> --json
```

### Parameters

| Parameter   | Required | Default | Description               |
|-------------|----------|---------|---------------------------|
| `--tokenId` | Yes      | —       | ERC-1155 outcome token ID |

### Example

```bash
baw prediction position token --tokenId 123456789 --json
```

---

## `prediction position settled-history`

List the user's settled (finalized) prediction positions, with optional win/lose filtering.

### Syntax

```bash
baw prediction position settled-history [--l1Category <category>] [--filter <filter>] [--offset <offset>] [--limit <limit>] --json
```

### Parameters

| Parameter      | Required | Default | Description                                  |
|----------------|----------|---------|----------------------------------------------|
| `--l1Category` | No       | —       | L1 category filter (e.g. `crypto`, `sports`) |
| `--filter`     | No       | `all`   | `all`, `win`, `lose`                         |
| `--offset`     | No       | `0`     | Pagination offset                            |
| `--limit`      | No       | `20`    | Page size, max 100                           |

### Example

```bash
baw prediction position settled-history --json
baw prediction position settled-history --filter win --json
baw prediction position settled-history --filter lose --json
```

---

## `prediction position pnl`

Query detailed PnL records for the user's prediction positions.

### Syntax

```bash
baw prediction position pnl [--tokenId <tokenId>] [--l1Category <category>] [--offset <offset>] [--limit <limit>] --json
```

### Parameters

| Parameter      | Required | Default | Description                                      |
|----------------|----------|---------|--------------------------------------------------|
| `--tokenId`    | No       | —       | Filter by a specific token ID                    |
| `--l1Category` | No       | —       | L1 category filter: `crypto`, `sports`, `all`    |
| `--offset`     | No       | `0`     | Pagination offset                                |
| `--limit`      | No       | `20`    | Page size, max 100                               |

### Example

```bash
baw prediction position pnl --json
baw prediction position pnl --l1Category crypto --json
baw prediction position pnl --tokenId abc123 --json
```

---

## `prediction position portfolio`

Get a portfolio-level summary of the user's active prediction positions, including unrealized PnL.

### Syntax

```bash
baw prediction position portfolio --json
```

### Example

```bash
baw prediction position portfolio --json
```

---

## `prediction order history`

List the user's historical prediction orders across all statuses.

### Syntax

```bash
baw prediction order history [--status <status>] [--l1Category <category>] [--orderType <type>] [--offset <offset>] [--limit <limit>] --json
```

### Parameters

| Parameter      | Required | Default | Description                                                                            |
|----------------|----------|---------|----------------------------------------------------------------------------------------|
| `--status`     | No       | —       | `PENDING`, `SUBMITTED`, `FILLED`, `PARTIALLY_FILLED`, `CANCELLED`, `FAILED`, `EXPIRED` |
| `--l1Category` | No       | —       | L1 category filter                                                                     |
| `--orderType`  | No       | —       | `MARKET` or `LIMIT`                                                                    |
| `--offset`     | No       | `0`     | Pagination offset                                                                      |
| `--limit`      | No       | `20`    | Page size, max 100                                                                     |

### Example

```bash
baw prediction order history --json
baw prediction order history --status FILLED --limit 10 --json
baw prediction order history --orderType LIMIT --json
```

### Order Status

| Status             | Description                                   |
|--------------------|-----------------------------------------------|
| `PENDING`          | Order created but not yet submitted to vendor |
| `SUBMITTED`        | Order submitted to vendor, awaiting execution |
| `FILLED`           | Order fully filled                            |
| `PARTIALLY_FILLED` | Order partially filled                        |
| `CANCELLED`        | Order cancelled by user or system             |
| `FAILED`           | Order failed to execute                       |
| `EXPIRED`          | Expired due to market ends                    |

---

## Trading Flow

Prediction trading is a **two-step** flow:

1. **Quote** — call [`prediction trade quote`](#prediction-trade-quote) to get a `quoteId` and the expected cost / payout.
2. **Confirm with the user** — show them the quote (price, amount, expected payout) and require an explicit "yes" before proceeding. Remind them to DYOR.
3. **Place** — call [`prediction trade place-order`](#prediction-trade-place-order) with the `quoteId` from step 1.

Quotes expire; if placement fails because the quote is stale, fetch a new quote and try again.

---

## `prediction trade quote`

Get a trade quote for an outcome token. Returns a `quoteId` that must be passed to `place-order` within the quote's validity window.

### Syntax

```bash
baw prediction trade quote --binanceChainId <binanceChainId> --tokenId <tokenId> --marketTopicId <marketTopicId> --side <side> --amount <amount> --orderType <type> [--slippageBps <bps>] [--priceLimit <price>] --json
```

### Parameters

| Parameter          | Required       | Default        | Description                                                                                           |
|--------------------|----------------|----------------|-------------------------------------------------------------------------------------------------------|
| `--binanceChainId` | Yes            | —              | Binance chain ID                                                                                      |
| `--tokenId`        | Yes            | —              | ERC-1155 outcome token ID                                                                             |
| `--side`           | Yes            | —              | `BUY` or `SELL`                                                                                       |
| `--amount`         | Yes            | —              | Trade amount, human-readable. Unit depends on `--side`: USDT for `BUY`, shares for `SELL`.            |
| `--marketTopicId`  | Yes            | —              | Market topic ID. If `--slippageBps` is omitted, the market's default slippage is fetched via this ID. |
| `--orderType`      | Yes            | —              | `MARKET` or `LIMIT`                                                                                   |
| `--slippageBps`    | No             | market default | Slippage in basis points (e.g. `1200` = 12%)                                                          |
| `--priceLimit`     | For LIMIT only | —              | Limit price in USDT — required when `--orderType LIMIT`                                               |

### Example

```bash
# Market BUY quote
baw prediction trade quote --binanceChainId 56 --tokenId abc123 --marketTopicId 123 --side BUY --amount 1 --orderType MARKET --json
{
  "success": true,
  "data": {
    "quoteId": "1234567890",
    "tokenId": "abc123",
    "side": "BUY",
    "amountIn": "1",
    "amountOut": "1.021983640081799586",
    "averagePrice": 0.978,
    "lastPrice": 0.978,
    "priceImpact": 0,
    "feeAmount": "0.000460018149807002",
    "minReceive": "0.919831382438179829",
    "expireAt": "2026-05-21T17:30:29+08:00",
    "chainId": "56",
    "orderType": "MARKET",
    "slippageBps": 1000,
    "marketTitle": "No change"
  }
}
```

Note on units — `amountIn`, `amountOut`, `feeAmount`, and `minReceive` swap units with `--side`:

| Field        | `BUY`                         | `SELL`                      |
|--------------|-------------------------------|-----------------------------|
| `amountIn`   | USDT spent                    | shares sold                 |
| `amountOut`  | shares received               | USDT received               |
| `feeAmount`  | shares (provider service fee) | USDT (provider service fee) |
| `minReceive` | shares (worst-case fill)      | USDT (worst-case proceeds)  |

---

## `prediction trade place-order`

Place an order using a `quoteId` obtained from `prediction trade quote`. This is a **state-changing** command — always confirm with the user first.

### Syntax

```bash
baw prediction trade place-order --quoteId <quoteId> --slippageBps <bps> [--orderType <type>] [--priceLimit <price>] --json
```

### Parameters

| Parameter       | Required       | Default  | Description                                                      |
|-----------------|----------------|----------|------------------------------------------------------------------|
| `--quoteId`     | Yes            | —        | Quote ID returned from `prediction trade quote`                  |
| `--slippageBps` | Yes            | —        | Slippage in basis points (from quote response slippageBps field) |
| `--orderType`   | No             | `MARKET` | `MARKET` or `LIMIT`                                              |
| `--priceLimit`  | For LIMIT only | —        | Limit price in USDT — required for LIMIT orders                  |

### Example

```bash
baw prediction trade place-order --quoteId quote_abc123 --slippageBps 1000 --json

baw prediction trade place-order --quoteId quote_abc123 --slippageBps 1000 --orderType LIMIT --priceLimit 0.6 --json
```

### Important: placing an order does not mean it is filled

A successful response means the order has been **submitted**. For `MARKET` orders, fills usually happen quickly; `LIMIT` orders rest on the book until the trigger price is reached. After placement, tell the user:

1. The order has been submitted.
2. They can check its status with [`prediction order history`](#prediction-order-history).
3. They should verify execution before assuming the trade is complete.

---

## `prediction trade cancel`

Cancel one or more open prediction orders.

### Syntax

```bash
baw prediction trade cancel --orderIds <ids> --json
```

### Parameters

| Parameter    | Required | Default | Description                       |
|--------------|----------|---------|-----------------------------------|
| `--orderIds` | Yes      | —       | Comma-separated list of order IDs |

### Example

```bash
baw prediction trade cancel --orderIds order_123,order_456 --json
```

---

## `prediction trade redeem`

Redeem (claim) the payout from winning prediction positions once their markets have resolved. Use [`prediction position list`](#prediction-position-list) with `--tab PENDING_CLAIM` to find token IDs that are redeemable.

### Syntax

```bash
baw prediction trade redeem --tokenIds <ids> [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter          | Required | Default | Description                               |
|--------------------|----------|---------|-------------------------------------------|
| `--tokenIds`       | Yes      | —       | Comma-separated list of winning token IDs |
| `--binanceChainId` | No       | —       | Binance chain ID filter                   |

### Example

```bash
baw prediction trade redeem --tokenIds token_123,token_456 --json

baw prediction trade redeem --tokenIds token_123 --binanceChainId 56 --json
```
