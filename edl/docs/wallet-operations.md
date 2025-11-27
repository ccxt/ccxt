# EDL Wallet Operations Schema

## Overview

This document describes the wallet operations schema implementation in the Exchange Definition Language (EDL). The wallet operations schema provides a structured way to define deposit, withdrawal, and transfer functionality for cryptocurrency exchanges.

## Schema Components

### 1. Wallet Operations Definition (`definitions.walletOperations`)

The wallet operations definition includes the following endpoints:

- **fetchBalance**: Fetch account balance across currencies
- **fetchDeposits**: Retrieve deposit transaction history
- **fetchWithdrawals**: Retrieve withdrawal transaction history
- **fetchTransfers**: Retrieve internal transfer history
- **withdraw**: Execute withdrawal to external address
- **fetchDepositAddress**: Get deposit address for a specific currency
- **fetchDepositAddresses**: Get deposit addresses for multiple currencies
- **transfer**: Execute internal transfer between accounts

Each operation definition includes:
- `endpoint`: The API endpoint path
- `params`: Parameter definitions using `$ref: #/definitions/paramDef`

### 2. Network Definition (`definitions.networkDefinition`)

Defines cryptocurrency network properties:

```typescript
interface NetworkDefinition {
  id: string;              // Network identifier
  network: string;         // Network code (ETH, TRX, BSC, etc.)
  name?: string;          // Human-readable name
  active?: boolean;       // Whether network is active
  fee?: number;           // Withdrawal fee
  precision?: number;     // Decimal precision
  limits?: {
    withdraw?: { min, max };
    deposit?: { min, max };
  };
  addressRegex?: string;  // Address validation regex
  tagRequired?: boolean;  // Whether memo/tag required
  memoRegex?: string;     // Memo/tag validation regex
}
```

### 3. Transaction Definition (`definitions.transactionDefinition`)

Represents a deposit, withdrawal, or transfer transaction:

```typescript
interface TransactionDefinition {
  id: string;
  txid?: string | null;           // Blockchain transaction hash
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: string;
  amount: number;
  status: 'pending' | 'ok' | 'failed' | 'canceled';
  
  // Address information
  address?: string | null;
  addressFrom?: string | null;
  addressTo?: string | null;
  
  // Memo/tag information
  tag?: string | null;
  tagFrom?: string | null;
  tagTo?: string | null;
  
  // Network and fees
  network?: string | null;
  fee?: {
    cost: number;
    currency: string;
  };
  
  // Timestamps
  timestamp?: number | null;
  datetime?: string | null;
  updated?: number | null;
  
  // Additional info
  comment?: string | null;
  internal?: boolean;
  info?: any;                     // Raw exchange response
}
```

## Usage in EDL Files

### Basic Wallet Configuration

```yaml
wallet:
  fetchBalance:
    endpoint: account/balance
    params:
      currency:
        type: string
        required: false

  fetchDeposits:
    endpoint: account/deposits
    params:
      currency:
        type: string
        required: false
      limit:
        type: int
        default: 100
      startTime:
        type: timestamp_ms
        required: false
      endTime:
        type: timestamp_ms
        required: false

  withdraw:
    endpoint: wallet/withdraw
    params:
      currency:
        type: string
        required: true
      address:
        type: string
        required: true
      amount:
        type: float
        required: true
      network:
        type: string
        required: false
      tag:
        type: string
        required: false
```

### Parser Configuration

Define parsers for wallet responses:

```yaml
parsers:
  deposit:
    source: account/deposits
    path: null
    iterator: array
    mapping:
      id:
        path: depositId
        transform: parse_string
      txid:
        path: txHash
      type:
        literal: deposit
      currency:
        path: coin
        transform: parse_currency_code
      amount:
        path: amount
        transform: parse_number
      status:
        path: status
        map:
          "0": pending
          "1": ok
          "2": failed
        default: pending
      address:
        path: address
      tag:
        path: addressTag
      network:
        path: network
      timestamp:
        path: insertTime
        transform: parse_timestamp_ms
      info:
        from_context: rawData
```

## TypeScript Types

The following TypeScript types are exported from `edl/compiler/src/types/edl.ts`:

- `WalletOperations`: Main wallet operations interface
- `WalletEndpointDefinition`: Individual operation definition
- `NetworkDefinition`: Network configuration
- `TransactionType`: Type union for transaction types
- `TransactionStatus`: Status union for transaction states
- `TransactionDefinition`: Complete transaction structure

## Examples

See `/Users/reuben/gauntlet/ccxt/edl/exchanges/examples/wallet-operations.edl.yaml` for a complete working example.

## Related Capabilities

When defining wallet operations, update the `has` section:

```yaml
has:
  fetchBalance: true
  fetchDeposits: true
  fetchWithdrawals: true
  fetchTransfers: true
  withdraw: true
  fetchDepositAddress: true
  fetchDepositAddresses: false
  transfer: true
```

## Files Modified

1. `/Users/reuben/gauntlet/ccxt/edl/schemas/edl.schema.json`
   - Added `definitions.walletOperations`
   - Added `definitions.networkDefinition`
   - Added `definitions.transactionDefinition`
   - Added `properties.wallet` referencing walletOperations

2. `/Users/reuben/gauntlet/ccxt/edl/compiler/src/types/edl.ts`
   - Added `WalletOperations` interface
   - Added `WalletEndpointDefinition` interface
   - Added `NetworkDefinition` interface
   - Added `TransactionType` and `TransactionStatus` types
   - Added `TransactionDefinition` interface
   - Updated `EDLDocument` interface with `wallet` property
   - Updated `CapabilityMethod` type with wallet methods

3. `/Users/reuben/gauntlet/ccxt/edl/exchanges/examples/wallet-operations.edl.yaml`
   - Created comprehensive example showing all wallet operations
