# Wallet View Commands

## `wallet status`

Check the current authentication and wallet state.

### Syntax

```bash
baw wallet status --json
```

### Parameters

No command-specific parameters.

### Example

```bash
baw wallet status --json
```

### Response

```json
{
  "success": true,
  "data": {
    "status": "CONNECTED"
  }
}
```

| Status        | Meaning                        |
|---------------|--------------------------------|
| `UNCONNECTED` | Not signed in                  |
| `CREATING`    | Signed in; wallet being set up |
| `CONNECTED`   | Signed in; wallet ready to use |

---

## `wallet chains`

List the blockchain networks the wallet currently supports.

### Syntax

```bash
baw wallet chains --json
```

### Parameters

No command-specific parameters.

### Example

```bash
baw wallet chains --json
```

### Response

```json
{
  "success": true,
  "data": [
    { "binanceChainId": "56", "name": "BNB Smart Chain", "simpleName": "BSC" }
  ]
}
```

---

## `wallet address`

Retrieve the wallet addresses.

### Syntax

```bash
baw wallet address --json
```

### Parameters

No command-specific parameters.

### Example

```bash
baw wallet address --json
```

### Response

```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "binanceChainId": "CT_501",
        "chainName": "Solana",
        "address": "E...S"
      },
      {
        "binanceChainId": "1",
        "chainName": "Ethereum",
        "address": "0x1234...5678"
      },
      {
        "binanceChainId": "56",
        "chainName": "BSC",
        "address": "0x1234...5678"
      },
      {
        "binanceChainId": "8453",
        "chainName": "Base",
        "address": "0x1234...5678"
      }
    ]
  }
}
```

---

## `wallet balance`

Query token balances. Only tokens with a value of at least $0.01 USD are returned; tokens worth less than $0.01 are hidden by CLI.

### Syntax

```bash
baw wallet balance [--symbol <symbol>] [--tokenAddress <tokenAddress>] [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter          | Required | Default | Description                                                                           |
|--------------------|----------|---------|---------------------------------------------------------------------------------------|
| `--symbol`         | No       | —       | Filter by token symbol (e.g., `BNB`, `USDT`, `USDC`)                                  |
| `--tokenAddress`   | No       | —       | Filter by token contract address                                                      |
| `--binanceChainId` | No       | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |

### Example

```bash
# Query all balances
baw wallet balance --json

# Query USDT balance only
baw wallet balance --symbol USDT --json
```

### Response

```json
{
  "success": true,
  "data": [
    { "symbol": "USDT", "address": "0x55d398326f99059fF775485246999027B3197955", "binanceChainId": "56", "balance": "1000.50", "price": "1.0", "value": "1000.50" }
  ]
}
```

---

## `wallet tx-history`

Retrieve transaction history with optional filtering and pagination.

### Syntax

```bash
baw wallet tx-history [--type <type>] [--size <size>] [--nextCursor <nextCursor>] [--tx <tx>] [--startTime <startTime>] [--endTime <endTime>] [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter          | Required | Default      | Description                                                                           |
|--------------------|----------|--------------|---------------------------------------------------------------------------------------|
| `--type`           | No       | `all`        | `all`, `pending`, `confirmed`                                                         |
| `--size`           | No       | `20`         | Results per page (max 100)                                                            |
| `--nextCursor`     | No       | —            | Pagination cursor from a previous response                                            |
| `--tx`             | No       | —            | Look up a single transaction by hash                                                  |
| `--startTime`      | No       | 3 months ago | Start time (ms timestamp)                                                             |
| `--endTime`        | No       | —            | End time (ms timestamp)                                                               |
| `--binanceChainId` | No       | —            | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |

### Example

```bash
# Query recent transactions
baw wallet tx-history --json

# Query pending transactions
baw wallet tx-history --type pending --json

# Look up a specific transaction
baw wallet tx-history --tx 0xabc123... --json
```

### Response

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "txType": "swap",
        "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "txTime": "2026-04-01T09:05:30+08:00",
        "binanceChainId": "56",
        "status": "confirmed",
        "txHashList": [
          {
            "binanceChainId": "56",
            "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "status": "confirmed",
            "networkFee": {
              "binanceChainId": "56",
              "feeTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              "feeTokenSymbol": "BNB",
              "feeValue": "0",
              "feeTokenDecimals": 18
            },
            "instructions": {
              "send": [
                {
                  "binanceChainId": "56",
                  "amount": "1000000000000000000",
                  "addressInfo": { "address": "0x1234...5678" },
                  "tokenInfo": {
                    "binanceChainId": "56",
                    "contractAddress": "0xcaca...1231",
                    "symbol": "Token1",
                    "tokenId": null,
                    "decimals": 18
                  }
                }
              ],
              "receive": [
                {
                  "binanceChainId": "56",
                  "amount": "1000000000000000000",
                  "addressInfo": { "address": "0x1234...5678" },
                  "tokenInfo": {
                    "binanceChainId": "56",
                    "contractAddress": "0xcaca...1232",
                    "symbol": "Token2",
                    "tokenId": null,
                    "decimals": 18
                  }
                }
              ]
            }
          }
        ]
      }
    ],
    "hasMore": true,
    "nextCursor": "__CONFIRMED__:1234567890"
  }
}
```

---

## `wallet tx-lock`

Check whether the wallet is currently locked from sending new transactions.

### Syntax

```bash
baw wallet tx-lock --binanceChainId <binanceChainId> --json
```

### Parameters

| Parameter          | Required | Default      | Description                                                                           |
|--------------------|----------|--------------|---------------------------------------------------------------------------------------|
| `--binanceChainId` | Yes      | —            | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains` |

### Example

```bash
baw wallet tx-lock --binanceChainId 56 --json
```

### Response

```json
{
  "success": true,
  "data": {
    "status": "UNLOCKED"
  }
}
```

| Status     | Meaning                                                                                                                                                   |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `UNLOCKED` | The wallet is free to send new transactions.                                                                                                              |
| `LOCKED`   | A transaction is pending on-chain, or a double-confirm request is waiting in the Binance App. The user must resolve it before starting a new transaction. |

The wallet becomes locked in two situations:
1. **Transaction pending on-chain** — a previously submitted transaction has not yet been confirmed on the blockchain. Nothing to do but wait; re-check with `wallet tx-lock` after a short while.
2. **Double-confirm pending** — the transaction triggered a risk-control check (either the token is flagged as risky, or a DEX swap has excessive price deviation). Tell the user to open the Binance App to approve or reject it (5-minute timeout).
