# Market Order

Swap tokens on-chain at the current market price, get quotes, and check market-order status.

## Security Pre-Check

Before executing `market-order swap`, complete the swap security pre-check in [security.md §1](security.md#1-swap-security-pre-check). This includes auditing non-trusted target tokens and presenting the security summary to the user.

## Fees

Market orders are subject to Binance Web3 Wallet trading fees. For the current fee schedule, see: https://www.binance.com/en/support/faq/detail/87cbb1ca0df34a348eaecb73c26167d7

## `market-order swap`

Swap one token for another at the current market price.

### Syntax

```bash
baw market-order swap --fromTokenQty <fromTokenQty> --fromToken <fromToken> --toToken <toToken> --binanceChainId <binanceChainId> [--slippage <slippage>] [--mev <mev>] [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--fromTokenQty`   | Yes      | —       | Amount to swap, in human-readable units                                               |
| `--fromToken`      | Yes      | —       | Source token contract address                                                         |
| `--toToken`        | Yes      | —       | Destination token contract address                                                    |
| `--binanceChainId` | Yes      | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |
| `--slippage`       | No       | `auto`  | Slippage tolerance: "auto" or 0–100 (e.g., "2.5" = 2.5%)                              |
| `--mev`            | No       | `true`  | MEV protection: "true" or "false"                                                     |
| `--gasLevel`       | No       | `HIGH`  | Gas level: "LOW", "MEDIUM", or "HIGH"                                                 |

### Example

```bash
# Swap 0.1 BNB to USDT (defaults: slippage auto, mev on, gas level HIGH)
baw market-order swap --fromTokenQty 0.1 --fromToken 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --toToken 0x55d398326f99059fF775485246999027B3197955 --binanceChainId 56 --json

# Swap 100 USDT to BNB with custom settings
baw market-order swap --fromTokenQty 100 --fromToken 0x55d398326f99059fF775485246999027B3197955 --toToken 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --binanceChainId 56 --slippage 5 --mev false --gasLevel MEDIUM --json
```

### Response

```json
{ "success": true, "data": { "orderId": "1234567890" } }
```

### Important: an orderId does not mean the swap is complete

A successful response with an `orderId` means the swap has been **submitted** — it does **not** mean it has been executed or confirmed on-chain. The order can still fail due to price movement exceeding slippage tolerance, insufficient liquidity, or network issues.

After receiving an `orderId`, always tell the user:
1. The swap has been submitted and is **pending** execution.
2. They can check its status with `market-order list`.
3. They should verify the result before considering the swap complete.

---

## `market-order quote`

Get a swap quote without executing the trade. Use this to show the user the expected output before they commit.

### Syntax

```bash
baw market-order quote --fromTokenQty <fromTokenQty> --fromToken <fromToken> --toToken <toToken> --binanceChainId <binanceChainId> [--slippage <slippage>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--fromTokenQty`   | Yes      | —       | Amount to swap, in human-readable units                                               |
| `--fromToken`      | Yes      | —       | Source token contract address                                                         |
| `--toToken`        | Yes      | —       | Destination token contract address                                                    |
| `--binanceChainId` | Yes      | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |
| `--slippage`       | No       | `auto`  | Slippage tolerance: "auto" or 0–100 (e.g., "2.5" = 2.5%)                              |

### Example

```bash
# Get a quote for swapping 0.1 BNB to USDT
baw market-order quote --fromTokenQty 0.1 --fromToken 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --toToken 0x55d398326f99059fF775485246999027B3197955 --binanceChainId 56 --json
```

### Response

```json
{
  "success": true,
  "data": {
    "fromCoinSymbol": "BNB",
    "fromCoinAmount": "0.1",
    "toCoinSymbol": "USDT",
    "toCoinAmount": "87.686076196559241381",
    "slippage": 0.005
  }
}
```

---

## `market-order list`

List market orders, optionally filtered by status, token, or time range.

### Syntax

```bash
baw market-order list [--orderId <orderId>] [--status <status>] [--fromToken <fromToken>] [--toToken <toToken>] [--startTime <startTime>] [--endTime <endTime>] [--page <page>] [--pageSize <pageSize>] [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--orderId`        | No       | —       | Look up a specific market order by ID (ignores other filters)                         |
| `--status`         | No       | —       | `PENDING`, `FINISHED`, or `FAILED`                                                    |
| `--fromToken`      | No       | —       | Filter by source token address                                                        |
| `--toToken`        | No       | —       | Filter by target token address                                                        |
| `--startTime`      | No       | —       | Start time (ms timestamp)                                                             |
| `--endTime`        | No       | —       | End time (ms timestamp)                                                               |
| `--page`           | No       | `1`     | Page number                                                                           |
| `--pageSize`       | No       | `20`    | Items per page, max 100                                                               |
| `--binanceChainId` | No       | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |

### Example

```bash
# List all market orders
baw market-order list --json

# Look up a specific market order
baw market-order list --orderId 1234567890 --json

# List pending market orders
baw market-order list --status PENDING --json
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
        "orderType": "market",
        "orderId": "1234567890",
        "chain": "56",
        "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "fromTokenName": "BNB",
        "fromTokenQty": "1.0",
        "toToken": "0x55d398326f99059fF775485246999027B3197955",
        "toTokenName": "USDT",
        "status": "FINISHED",
        "slippage": "0.5000",
        "txHash": "0xabcdef...",
        "bookTime": "2026-04-01T23:46:54+08:00",
        "updatedTime": "2026-04-01T23:46:56+08:00"
      }
    ]
  }
}
```

### Market Order Status

| Status     | Description              |
|------------|--------------------------|
| `PENDING`  | Being processed on-chain |
| `FINISHED` | Executed successfully    |
| `FAILED`   | Execution failed         |
