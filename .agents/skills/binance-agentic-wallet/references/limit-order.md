# Limit Order

Place, list, and cancel limit orders. A limit order executes automatically once the token hits the specified trigger price.

## Security Pre-Check

Before executing `limit-order buy` or `limit-order sell`, complete the swap security pre-check in [security.md §1](security.md#1-swap-security-pre-check). This includes auditing non-trusted target tokens and presenting the security summary to the user.

## Fees

Limit orders are subject to Binance Web3 Wallet trading fees (charged when the order executes). For the current fee schedule, see: https://www.binance.com/en/support/faq/detail/87cbb1ca0df34a348eaecb73c26167d7

## `limit-order buy`

Place a limit buy order — purchase a token using USDT, USDC, or BNB when it drops to the target price.

### Syntax

```bash
baw limit-order buy --triggerPrice <triggerPrice> --fromTokenQty <fromTokenQty> --fromToken <fromToken> --toToken <toToken> --binanceChainId <binanceChainId> [--slippage <slippage>] [--mev <mev>] [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--triggerPrice`   | Yes      | —       | USD price that activates the order (e.g. `100`)                                       |
| `--fromTokenQty`   | Yes      | —       | Amount to spend, in human-readable units                                              |
| `--fromToken`      | Yes      | —       | Source token contract address — only USDT, USDC, and Native Token are supported       |
| `--toToken`        | Yes      | —       | Contract address of the token to buy                                                  |
| `--binanceChainId` | Yes      | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |
| `--slippage`       | No       | `auto`  | Slippage tolerance: "auto" or 0–100 (e.g., "2.5" = 2.5%)                              |
| `--mev`            | No       | `true`  | MEV protection: "true" or "false"                                                     |
| `--gasLevel`       | No       | `HIGH`  | Gas level: "LOW", "MEDIUM", or "HIGH"                                                 |

### Example

```bash
# Spend 100 USDT to buy a token when its price drops to $10
baw limit-order buy --triggerPrice 10 --fromTokenQty 100 --fromToken 0x55d398326f99059fF775485246999027B3197955 --toToken 0xcaca...1231 --binanceChainId 56 --json

# Spend 0.4 BNB to buy a token when its price drops to $5
baw limit-order buy --triggerPrice 5 --fromTokenQty 0.4 --fromToken 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --toToken 0xcaca...1231 --binanceChainId 56 --json
```

### Response

```json
{ "success": true, "data": { "strategyId": "9876543210" } }
```

---

## `limit-order sell`

Place a limit sell order — sell a token for USDT, USDC, or BNB when it reaches the target price.

### Syntax

```bash
baw limit-order sell --triggerPrice <triggerPrice> --fromTokenQty <fromTokenQty> --fromToken <fromToken> --toToken <toToken> --binanceChainId <binanceChainId> [--slippage <slippage>] [--mev <mev>] [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--triggerPrice`   | Yes      | —       | USD price that activates the order (e.g. `200`)                                       |
| `--fromTokenQty`   | Yes      | —       | Amount of tokens to sell, in human-readable units                                     |
| `--fromToken`      | Yes      | —       | Contract address of the token to sell                                                 |
| `--toToken`        | Yes      | —       | Destination token contract address — only USDT, USDC, and Native Token are supported  |
| `--binanceChainId` | Yes      | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |
| `--slippage`       | No       | `auto`  | Slippage tolerance: "auto" or 0–100 (e.g., "2.5" = 2.5%)                              |
| `--mev`            | No       | `true`  | MEV protection: "true" or "false"                                                     |
| `--gasLevel`       | No       | `HIGH`  | Gas level: "LOW", "MEDIUM", or "HIGH"                                                 |

### Example

```bash
# Sell 10.1 tokens for USDT when the price reaches $100
baw limit-order sell --triggerPrice 100 --fromTokenQty 10.1 --fromToken 0xcaca...1231 --toToken 0x55d398326f99059fF775485246999027B3197955 --binanceChainId 56 --json

# Sell 10.1 tokens for BNB when the price reaches $100
baw limit-order sell --triggerPrice 100 --fromTokenQty 10.1 --fromToken 0xcaca...1231 --toToken 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --binanceChainId 56 --json
```

### Response

```json
{ "success": true, "data": { "strategyId": "9876543210" } }
```

---

## `limit-order list`

List limit orders, optionally filtered by status, token, or time range.

### Syntax

```bash
baw limit-order list [--strategyId <strategyId>] [--status <status>] [--fromToken <fromToken>] [--toToken <toToken>] [--startTime <startTime>] [--endTime <endTime>] [--page <page>] [--pageSize <pageSize>] [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--strategyId`     | No       | —       | Look up a specific limit order by strategy ID (ignores other filters)                 |
| `--status`         | No       | —       | `WORKING`, `TRIGGERED`, `PENDING`, `FINISHED`, `FAILED`, `EXPIRED`, `CANCELED`        |
| `--fromToken`      | No       | —       | Filter by source token address                                                        |
| `--toToken`        | No       | —       | Filter by target token address                                                        |
| `--startTime`      | No       | —       | Start time (ms timestamp)                                                             |
| `--endTime`        | No       | —       | End time (ms timestamp)                                                               |
| `--page`           | No       | `1`     | Page number                                                                           |
| `--pageSize`       | No       | `20`    | Items per page, max 100                                                               |
| `--binanceChainId` | No       | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |

### Example

```bash
# List all limit orders
baw limit-order list --json

# Look up a specific limit order
baw limit-order list --strategyId 9876543210 --json

# List active (working) limit orders
baw limit-order list --status WORKING --json
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "orderType": "limit",
        "strategyId": 9876543210,
        "chain": "56",
        "side": "SELL",
        "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "fromTokenName": "BNB",
        "fromTokenQty": "1.0",
        "toToken": "0x55d398326f99059fF775485246999027B3197955",
        "toTokenName": "USDT",
        "triggerPrice": "600",
        "status": "WORKING",
        "slippage": "0.1",
        "txHash": null,
        "bookTime": "2026-04-01T19:14:52+08:00",
        "updatedTime": "2026-04-01T19:14:52+08:00"
      }
    ]
  }
}
```

### Limit Order Status

| Status      | Description                                       |
|-------------|---------------------------------------------------|
| `WORKING`   | Waiting for the trigger price to be reached       |
| `TRIGGERED` | Price condition met; order is being executed      |
| `PENDING`   | Being processed on-chain                          |
| `FINISHED`  | Executed successfully on-chain                    |
| `FAILED`    | On-chain execution failed                         |
| `EXPIRED`   | Order expired before the price was reached        |
| `CANCELED`  | Canceled by the user                              |

---

## `limit-order cancel`

Cancel a limit order by its strategy ID. Orders that have already been executed cannot be canceled.

### Syntax

```bash
baw limit-order cancel --strategyId <strategyId> --json
```

### Parameters

| Parameter      | Required | Default | Description                    |
|----------------|----------|---------|--------------------------------|
| `--strategyId` | Yes      | —       | Strategy ID of the limit order |

### Example

```bash
baw limit-order cancel --strategyId 9876543210 --json
```

### Response

```json
{ "success": true, "data": { "strategyId": "9876543210", "status": "CANCELED" } }
```
