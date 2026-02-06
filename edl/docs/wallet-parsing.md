# Wallet Operation Parsing Documentation

This document describes the parsing patterns for wallet operations (deposits, withdrawals, transfers) and how exchange-specific response formats are mapped to the standardized CCXT TransactionDefinition format.

## Overview

Wallet operations involve converting exchange-specific JSON responses into the unified CCXT Transaction structure defined in `edl/compiler/src/types/edl.ts`. The primary operations are:

- **Deposits**: Incoming cryptocurrency or fiat transfers
- **Withdrawals**: Outgoing cryptocurrency or fiat transfers
- **Transfers**: Internal transfers between accounts (spot, margin, futures, etc.)

## CCXT Transaction Format

The standardized output format is defined by the `TransactionDefinition` interface:

```typescript
export interface TransactionDefinition {
    id: string;                          // Exchange-specific transaction ID
    txid?: string | null;                // Blockchain transaction hash
    type: TransactionType;               // 'deposit' | 'withdrawal' | 'transfer'
    currency: string;                    // Unified currency code (BTC, ETH, etc.)
    amount: number;                      // Transaction amount
    status: TransactionStatus;           // 'pending' | 'ok' | 'failed' | 'canceled'
    address?: string | null;             // Blockchain address
    addressFrom?: string | null;         // Source address (for transfers)
    addressTo?: string | null;           // Destination address (for transfers)
    tag?: string | null;                 // Memo/tag (XRP, XLM, etc.)
    tagFrom?: string | null;             // Source tag
    tagTo?: string | null;               // Destination tag
    network?: string | null;             // Network identifier (ETH, BSC, TRX, etc.)
    fee?: {                              // Transaction fee
        cost: number;
        currency: string;
    };
    timestamp?: number | null;           // Unix timestamp in milliseconds
    datetime?: string | null;            // ISO8601 datetime string
    updated?: number | null;             // Last update timestamp
    comment?: string | null;             // Optional comment
    internal?: boolean;                  // Internal transfer flag
    info?: any;                          // Original exchange response
}
```

## Binance Deposit Format

### Input Format

```json
{
    "amount": "0.01844487",
    "coin": "BCH",
    "network": "BCH",
    "status": 1,
    "address": "1NYxAJhW2281HK1KtJeaENBqHeygA88FzR",
    "addressTag": "",
    "txId": "bafc5902504d6504a00b7d0306a41154cbf1d1b767ab70f3bc226327362588af",
    "insertTime": 1610784980000,
    "transferType": 0,
    "confirmTimes": "2/2"
}
```

### Field Mappings

| Binance Field | CCXT Field | Transform | Notes |
|--------------|------------|-----------|-------|
| `coin` | `currency` | `safeCurrencyCode()` | Convert exchange code to unified |
| `amount` | `amount` | `safeNumber()` | Parse as number |
| `status` | `status` | `parseTransactionStatusByType()` | See status mapping below |
| `address` | `address`, `addressTo` | String | Both fields set to same value |
| `addressTag` | `tag`, `tagTo` | String | Empty string becomes undefined |
| `txId` | `txid` | String | Strip "Internal transfer " prefix if present |
| `insertTime` | `timestamp` | `safeInteger()` | Already in milliseconds |
| `network` | `network` | String | Direct mapping |
| `transferType` | `internal` | Boolean | `0` = false, `1` = true |
| - | `id` | null | Deposits have no ID field |
| - | `type` | 'deposit' | Literal value |

### Binance Fiat Deposit Format

Fiat deposits have a different structure:

```json
{
    "orderNo": "25ced37075c1470ba8939d0df2316e23",
    "fiatCurrency": "EUR",
    "transactionType": 0,
    "indicatedAmount": "15.00",
    "amount": "15.00",
    "totalFee": "0.00",
    "method": "card",
    "status": "Failed",
    "createTime": "1627501026000",
    "updateTime": "1627501027000"
}
```

| Binance Field | CCXT Field | Transform | Notes |
|--------------|------------|-----------|-------|
| `orderNo` | `id` | String | Order number as ID |
| `fiatCurrency` | `currency` | `safeCurrencyCode()` | Fiat currency code |
| `amount` | `amount` | `safeNumber()` | Transaction amount |
| `totalFee` | `fee.cost` | `safeNumber()` | Fee amount |
| `status` | `status` | String parsing | Text status (Success/Failed) |
| `createTime` | `timestamp` | `safeInteger()` | Creation time |
| `updateTime` | `updated` | `safeInteger()` | Update time |
| `transactionType` | `type` | Conditional | `0` = deposit, `1` = withdrawal |

### Status Mapping (Binance Crypto)

| Binance Status Code | CCXT Status | Description |
|-------------------|-------------|-------------|
| `0` | `pending` | Pending confirmation |
| `1` | `ok` | Success/Completed |
| `6` | `ok` | Credited but cannot withdraw |
| `3` | `failed` | Failed transaction |
| `1` (withdrawal) | `canceled` | Canceled withdrawal |

## Binance Withdrawal Format

### Input Format

```json
{
    "id": "69e53ad305124b96b43668ceab158a18",
    "amount": "28.75",
    "transactionFee": "0.25",
    "coin": "XRP",
    "status": 6,
    "address": "r3T75fuLjX51mmfb5Sk1kMNuhBgBPJsjza",
    "addressTag": "101286922",
    "txId": "19A5B24ED0B697E4F0E9CD09FCB007170A605BC93C9280B9E6379C5E6EF0F65A",
    "applyTime": "2021-04-15 12:09:16",
    "network": "XRP",
    "transferType": 0
}
```

### Field Mappings

| Binance Field | CCXT Field | Transform | Notes |
|--------------|------------|-----------|-------|
| `id` | `id` | String | Withdrawal ID |
| `coin` | `currency` | `safeCurrencyCode()` | Currency code |
| `amount` | `amount` | `safeNumber()` | Withdrawal amount |
| `transactionFee` | `fee.cost` | `safeNumber()` | Transaction fee |
| `status` | `status` | `parseTransactionStatusByType()` | Status code |
| `address` | `address`, `addressTo` | String | Destination address |
| `addressTag` | `tag`, `tagTo` | String | Destination tag/memo |
| `txId` | `txid` | String | Transaction hash |
| `applyTime` | `timestamp` | `parse8601()` | Parse datetime string |
| `network` | `network` | String | Network identifier |

## Binance Transfer Format

Internal transfers between Binance accounts (spot, margin, futures):

### Input Format

```json
{
    "timestamp": 1614640878000,
    "asset": "USDT",
    "amount": "25",
    "type": "MAIN_UMFUTURE",
    "status": "CONFIRMED",
    "tranId": 43000126248
}
```

### Field Mappings

| Binance Field | CCXT Field | Transform | Notes |
|--------------|------------|-----------|-------|
| `tranId` | `id` | String | Convert to string |
| `asset` | `currency` | `safeCurrencyCode()` | Asset code |
| `amount` | `amount` | `safeNumber()` | Transfer amount |
| `timestamp` | `timestamp` | `safeInteger()` | Already in milliseconds |
| `status` | `status` | Mapping | CONFIRMED -> ok |
| `type` | `fromAccount`, `toAccount` | Parse transfer type | See transfer type mapping |

### Transfer Type Mapping

| Binance Type | From Account | To Account |
|-------------|-------------|------------|
| `MAIN_UMFUTURE` | spot | future |
| `UMFUTURE_MAIN` | future | spot |
| `MAIN_MARGIN` | spot | margin |
| `MARGIN_MAIN` | margin | spot |
| `MAIN_FUNDING` | spot | funding |

## Kraken Deposit Format

### Input Format

```json
{
    "method": "Ether (Hex)",
    "aclass": "currency",
    "asset": "XETH",
    "refid": "Q2CANKL-LBFVEE-U4Y2WQ",
    "txid": "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23a8d0e0d",
    "info": "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
    "amount": "7.9999257900",
    "fee": "0.0000000000",
    "time": 1529223212,
    "status": "Success"
}
```

### Field Mappings

| Kraken Field | CCXT Field | Transform | Notes |
|-------------|------------|-----------|-------|
| `refid` | `id` | String | Reference ID |
| `asset` | `currency` | `safeCurrencyCode()` | Kraken asset code (XETH -> ETH) |
| `amount` | `amount` | `safeNumber()` | Deposit amount |
| `fee` | `fee.cost` | `safeNumber()` | Always 0 for deposits |
| `status` | `status` | `parseTransactionStatus()` | Text status |
| `info` | `address`, `addressTo` | String | Deposit address |
| `txid` | `txid` | String | Transaction hash |
| `time` | `timestamp` | `safeTimestamp()` | Unix seconds to milliseconds |
| `method` | `network` | String | Deposit method/network |
| - | `type` | 'deposit' | Injected literal |

### Status Mapping (Kraken)

| Kraken Status | CCXT Status | Notes |
|--------------|-------------|-------|
| `Success` | `ok` | Completed |
| `Pending` | `pending` | Awaiting confirmation |
| `Failure` | `failed` | Failed transaction |

### Special Status Properties

Kraken may include a `status-prop` field for additional status information:

| status-prop | Effect | Description |
|------------|--------|-------------|
| `on-hold` | Force to `pending` | Deposit held for review |
| `cancel-pending` | Force to `pending` | Cancellation requested |
| `onhold` | Force to `pending` | Withdrawal on hold |

## Kraken Withdrawal Format

### Input Format

```json
{
    "method": "Ether",
    "aclass": "currency",
    "asset": "XETH",
    "refid": "A2BF34S-O7LBNQ-UE4Y4O",
    "txid": "0x288b83c6b0904d8400ef44e1c9e2187b5c8f7ea3d838222d53f701a15b5c274d",
    "info": "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
    "amount": "9.9950000000",
    "fee": "0.0050000000",
    "time": 1530481750,
    "status": "Success",
    "key": "Huobi wallet",
    "network": "Ethereum"
}
```

Field mappings are identical to deposits, with the following differences:

- `type` is injected as 'withdrawal' instead of 'deposit'
- `fee` field contains actual withdrawal fee (not zero)
- `key` field may contain wallet label (currently unused)

## Edge Cases and Special Handling

### 1. Internal Transfers (Binance)

When Binance `txId` contains "Internal transfer ", extract the numeric ID:

```typescript
if (txid !== undefined && txid.indexOf('Internal transfer ') >= 0) {
    txid = txid.slice(18);  // Extract numeric portion
}
```

### 2. Empty Address Tags

Empty strings for address tags should be converted to undefined:

```typescript
if (tag !== undefined && tag.length < 1) {
    tag = undefined;
}
```

### 3. XRP/Stellar Tag Handling (Kraken)

Kraken combines address and tag in the `info` field using colon separator:

```json
"info": "r3T75fuLjX51mmfb5Sk1kMNuhBgBPJsjza:101286922"
```

This needs to be parsed to extract both address and tag components. The current implementation stores the combined value in the `address` field.

### 4. Timestamp Formats

Different timestamp formats across operations:

- **Binance deposits**: `insertTime` in milliseconds
- **Binance withdrawals**: `applyTime` as datetime string ("2021-04-15 12:09:16")
- **Kraken**: `time` in Unix seconds (requires conversion to milliseconds)
- **Binance fiat**: `createTime` as string milliseconds

### 5. Fiat vs Crypto Transactions

Fiat transactions use different field names:

- Currency: `fiatCurrency` instead of `coin`/`asset`
- Fee: `totalFee` instead of `transactionFee`
- ID: `orderNo` instead of `id`
- Status: Text string instead of numeric code

### 6. Status Determination

Status parsing depends on transaction type and may use multiple fields:

```typescript
// Kraken status-prop overrides main status
if (isOnHoldDeposit || isCancellationRequest || isOnHoldWithdrawal) {
    status = 'pending';
}
```

### 7. Network Parsing

Network identifiers may need normalization:

- Binance: Direct network codes (BSC, TRX, ETH)
- Kraken: Method descriptions ("Ether (Hex)", "XRP (Ripple)")

### 8. Fee Handling

Fee structures vary:

- **Deposits (Kraken)**: Always zero, may be undefined
- **Withdrawals**: Explicit fee field
- **Transfers**: Usually no fee
- **Fiat**: Separate `totalFee` field

### 9. Missing Transaction IDs

Some operations may not have blockchain txids:

- Pending withdrawals (empty string or absent)
- Internal transfers
- Fiat deposits/withdrawals

Empty txid strings should be converted to null/undefined.

## Implementation References

- Binance implementation: `/Users/reuben/gauntlet/ccxt/ts/src/binance.ts` (lines 8509-8640)
- Kraken implementation: `/Users/reuben/gauntlet/ccxt/ts/src/kraken.ts` (lines 2879-2988)
- Type definitions: `/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/edl.ts` (lines 392-419)
- Test fixtures: `/Users/reuben/gauntlet/ccxt/edl/compiler/test-fixtures/wallet/`
