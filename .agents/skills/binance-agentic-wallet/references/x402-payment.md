# x402 Payment

Pay for an x402 HTTP resource by previewing payment options, then signing one.

## `x402-payment preview`

Preview payment options from a Merchant's `PaymentRequired` response.

### Syntax

```bash
baw x402-payment preview --paymentRequirements <base64-or-raw-json> --json
```

### Parameters

| Parameter               | Required | Description                                                                                        |
|-------------------------|----------|----------------------------------------------------------------------------------------------------|
| `--paymentRequirements` | Yes      | The `PaymentRequired` payload — either the base64 `PAYMENT-REQUIRED` header value or its raw JSON. |

### Example

```bash
baw x402-payment preview --paymentRequirements '{
  "x402Version": 2,
  "resource": {"url": "https://merchant/api"},
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "amount": "10000000",
      "payTo": "0x1111111111111111111111111111111111111111",
      "extra": {"name": "USD Coin", "version": "2"}
    },
    {
      "scheme": "exact",
      "network": "eip155:56",
      "asset": "0x55d398326f99059fF775485246999027B3197955",
      "amount": "10000000000000000000",
      "payTo": "0x1111111111111111111111111111111111111111",
      "extra": {"name": "Tether USD", "version": "1"}
    },
    {
      "scheme": "exact",
      "network": "eip155:42161",
      "asset": "0xcaca...1231",
      "amount": "10000000",
      "payTo": "0x1111111111111111111111111111111111111111",
      "extra": {"name": "USD Coin", "version": "2"}
    }
  ]
}' --json
```

### Response

```json
{
  "success": true,
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "options": [
      {
        "index": 1,
        "status": "READY_TO_SIGN",
        "reasons": [],
        "scheme": "exact",
        "assetTransferMethod": "eip3009",
        "binanceChainId": "8453",
        "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "tokenSymbol": "USDC",
        "amount": "10",
        "amountUsd": "10.00",
        "payTo": "0x1111111111111111111111111111111111111111",
        "userWalletAddress": "0x2222222222222222222222222222222222222222",
        "currentBalance": "100",
        "currentBalanceUsd": "100.00",
        "needApproveFirst": false,
        "originalAccept": {
          "scheme": "exact",
          "network": "eip155:8453",
          "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          "amount": "10000000",
          "payTo": "0x1111111111111111111111111111111111111111",
          "extra": {
            "name": "USD Coin",
            "version": "2"
          }
        }
      },
      {
        "index": 2,
        "status": "ACTION_REQUIRED",
        "reasons": [
          "INSUFFICIENT_BALANCE"
        ],
        "scheme": "exact",
        "assetTransferMethod": "eip3009",
        "binanceChainId": "56",
        "tokenAddress": "0x55d398326f99059fF775485246999027B3197955",
        "tokenSymbol": "USDT",
        "amount": "10",
        "amountUsd": "10.01",
        "payTo": "0x1111111111111111111111111111111111111111",
        "userWalletAddress": "0x2222222222222222222222222222222222222222",
        "currentBalance": "1.5",
        "currentBalanceUsd": "1.50",
        "needApproveFirst": false,
        "originalAccept": {
          "scheme": "exact",
          "network": "eip155:56",
          "asset": "0x55d398326f99059fF775485246999027B3197955",
          "amount": "10000000000000000000",
          "payTo": "0x1111111111111111111111111111111111111111",
          "extra": {
            "name": "Tether USD",
            "version": "1"
          }
        }
      },
      {
        "index": 3,
        "status": "NOT_SIGNABLE",
        "reasons": [
          "UNSUPPORTED_NETWORK"
        ],
        "scheme": "exact",
        "originalAccept": {
          "scheme": "exact",
          "network": "eip155:42161",
          "asset": "0xcaca...1231"
        }
      }
    ]
  }
}
```

| Field                           | Description                                                                                                                                                               |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `paymentId`                     | UUID identifying this payment.                                                                                                                                            |
| `options[].index`               | 1-based selector (first option is `1`, not `0`) to pass to `sign --selectedIndex`.                                                                                        |
| `options[].status`              | The option's status, which drives the next step. See table below.                                                                                                         |
| `options[].reasons`             | Reasons the option isn't ready to sign. See table below.                                                                                                                  |
| `options[].scheme`              | x402 scheme, such as `exact`.                                                                                                                                             |
| `options[].assetTransferMethod` | Asset transfer method, such as `eip3009`, `permit2`, `spl-transfer`, etc.                                                                                                 |
| `options[].binanceChainId`      | Binance chain ID: `56` (BSC), `CT_501` (Solana).                                                                                                                          |
| `options[].tokenAddress`        | Token contract address.                                                                                                                                                   |
| `options[].tokenSymbol`         | Token symbol, e.g. `USDT`.                                                                                                                                                |
| `options[].amount`              | Amount of tokens to pay, in human-readable units.                                                                                                                         |
| `options[].amountUsd`           | Equivalent USD value at the current token price.                                                                                                                          |
| `options[].payTo`               | Recipient (Merchant) address.                                                                                                                                             |
| `options[].userWalletAddress`   | User's own wallet address on this chain.                                                                                                                                  |
| `options[].currentBalance`      | User's current balance of `tokenAddress`, in human-readable units.                                                                                                        |
| `options[].currentBalanceUsd`   | Equivalent USD value of `currentBalance` at the current token price.                                                                                                      |
| `options[].needApproveFirst`    | Whether a Permit2 approve tx is required before this payment. If true, `sign` will dispatch the approve tx alongside the signature — on BSC the approve gas is sponsored. |
| `options[].originalAccept`      | The Merchant's original accept entry.                                                                                                                                     |

`options[].status` values:

| Value             | Meaning                                              |
|-------------------|------------------------------------------------------|
| `READY_TO_SIGN`   | Can be signed directly. No user action required.     |
| `ACTION_REQUIRED` | Can only be signed after the user takes some action. |
| `NOT_SIGNABLE`    | Cannot be signed. Retrying won't help.               |

`options[].reasons` values:

| Value                         | Implied status  | Meaning                                                                                                |
|-------------------------------|-----------------|--------------------------------------------------------------------------------------------------------|
| `INSUFFICIENT_BALANCE`        | ACTION_REQUIRED | The user's balance of `tokenAddress` on this chain is below `amount`.                                  |
| `INVALID_ACCEPT_STRUCTURE`    | NOT_SIGNABLE    | The Merchant's original accept structure is invalid.                                                   |
| `UNSUPPORTED_NETWORK`         | NOT_SIGNABLE    | The accept's `network` is outside our supported set.                                                   |
| `UNSUPPORTED_SCHEME`          | NOT_SIGNABLE    | The accept's `scheme` is outside our supported set.                                                    |
| `UNSUPPORTED_METHOD`          | NOT_SIGNABLE    | The accept's `assetTransferMethod` is outside our supported set: `eip3009`, `permit2`, `spl-transfer`. |
| `NO_WALLET_ON_CHAIN`          | NOT_SIGNABLE    | The user's agentic wallet has no address on this chain.                                                |
| `BLOCKED_BY_SECURITY_CHECK`   | NOT_SIGNABLE    | Security check flagged the payment as risky.                                                           |
| `BLOCKED_DAILY_LIMIT_REACHED` | NOT_SIGNABLE    | The user's daily x402 spending limit has been reached.                                                 |

### Acting on preview result

- The returned options are pre-sorted; options earlier in the list are recommended over later ones.
- Only options with `status = READY_TO_SIGN` can be signed directly. `ACTION_REQUIRED` options can be signed after the user takes a remediation action; `NOT_SIGNABLE` options cannot be signed.

---

## `x402-payment sign`

Sign a payment option from `preview` and return the replay x402 header.

### Syntax

```bash
baw x402-payment sign --paymentId <payment-id> --selectedIndex <index> --json
```

### Parameters

| Parameter         | Required | Description                                                                    |
|-------------------|----------|--------------------------------------------------------------------------------|
| `--paymentId`     | Yes      | The `paymentId` returned by `preview`.                                         |
| `--selectedIndex` | Yes      | The selected option `index` returned by `preview`. Must not be `NOT_SIGNABLE`. |

### Example

```bash
baw x402-payment sign --paymentId 550e8400-e29b-41d4-a716-446655440000 --selectedIndex 1 --json
```

### Response

```json
{
  "success": true,
  "data": {
    "paymentHeaderName": "PAYMENT-SIGNATURE",
    "paymentHeaderValue": "eyJ4NDAyVmVyc2lvbiI6Mi...",
    "approveTxHash": null,
    "binanceChainId": null,
    "signatureExpiresAt": 1747900800
  }
}
```

| Field                | Description                                                                                                         |
|----------------------|---------------------------------------------------------------------------------------------------------------------|
| `paymentHeaderName`  | HTTP header name to use when replaying. For x402 v2 this is always `PAYMENT-SIGNATURE`.                             |
| `paymentHeaderValue` | HTTP header value to use when replaying. Set this as the `paymentHeaderName` header on the request to the Merchant. |
| `approveTxHash`      | Non-null only when this sign also dispatched a Permit2 approve tx. See _Replaying the Request_.                     |
| `binanceChainId`     | Binance chain ID where `approveTxHash` was dispatched. Null when no approve was dispatched.                         |
| `signatureExpiresAt` | Unix epoch seconds (UTC) after which the signature is no longer valid. See _Replaying the Request_.                |

---

### Replaying the Request

- Replay the original HTTP request with the `paymentHeaderName: paymentHeaderValue` header from `sign` attached.
- Construct the replay request using the schema from the x402 payment requirements' `extensions` field if available.
- If `approveTxHash` is non-null (Permit2), wait for it to confirm (e.g. `baw wallet tx-history --tx <hash>`) before replaying.
- A signature can only be used once and is valid until `signatureExpiresAt`. If exceeded, restart from `preview`.
- The `PAYMENT-RESPONSE` response header (base64 JSON) carries settlement metadata, including the `txHash`.
- Infer the response body's schema before parsing it; don't parse blindly.

---

## Guardrails

1. **Confirm before signing.** Always confirm with the user before calling `sign`; only proceed once they've consented.
2. **Confirm before signing another payment option.** Always confirm with the user before switching to a different payment option, network, or token; only proceed once they've consented.
3. **Confirm before changing to a new resource.** Always confirm with the user before paying for a different resource or service; never silently substitute — if the current one fails, report the error and let the user decide.
4. **Confirm before retrying more than once.** If replaying the request fails due to a network or unknown error, retry at most once automatically. Before any further retries, confirm with the user.

---

## Limitations

- Only x402 v2 is supported.
- Only BSC, Base, and Solana are supported. Ethereum is not supported.
