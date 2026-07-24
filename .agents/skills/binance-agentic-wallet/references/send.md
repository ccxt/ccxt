# Send Tokens

Transfer tokens to a recipient address.

## `wallet send`

### Syntax

```bash
baw wallet send [--amount <amount>] [--max] --recipient <recipient> --binanceChainId <binanceChainId> --tokenAddress <tokenAddress> [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter          | Required    | Default | Description                                                                                                                                         |
|--------------------|-------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `--amount`         | No          | —       | Amount in human-readable units (e.g., `1.5`). Can be omitted when `--max` is set |
| `--max`            | No          | `false` | Send the maximum available balance. Native tokens use `balance - gasFeeBuffer` as amount; non-native tokens use `balance` as amount |
| `--recipient`      | Yes         | —       | Recipient wallet address (must be in the [address book](#address-book)), ENS is not supported                                                       |
| `--binanceChainId` | Yes         | —       | Binance chain ID: `56` (BSC), `CT_501` (Solana). For a full list, see `wallet chains`                                                               |
| `--tokenAddress`   | Yes         | —       | Token contract address                                                                                                                              |
| `--gasLevel`       | No          | `HIGH`  | Gas level: "LOW", "MEDIUM", or "HIGH"                                                                                                               |

### Example

```bash
# Send 0.02 BNB (native token) to an address
baw wallet send --amount 0.02 --recipient 0x1234...5678 --binanceChainId 56 --tokenAddress 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --json

# Send 10 USDT to an address
baw wallet send --amount 10 --recipient 0x1234...5678 --binanceChainId 56 --tokenAddress 0x55d398326f99059fF775485246999027B3197955 --json

# Send ALL available BNB (native token). --amount is omitted
baw wallet send --max --recipient 0x1234...5678 --binanceChainId 56 --tokenAddress 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE --json
```

### Response

```json
{
  "success": true,
  "data": { "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" }
}
```

### Important: a tx hash does not mean on-chain confirmation

A successful response with a `txHash` means the transaction has been **broadcast** to the network — it does **not** mean it has been confirmed or finalized on-chain. Transactions can still fail after broadcast.

After receiving a `txHash`, always tell the user:
1. The transaction has been submitted and is **pending** confirmation.
2. They can track its status with `wallet tx-history`.
3. They should wait for on-chain confirmation before considering the transfer complete.

### Address Book

The `--recipient` address **must** be in the address book. To add an address, open Binance App → Wallet → Settings → Address Book.
