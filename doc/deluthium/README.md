# Deluthium DEX Integration Guide

Deluthium (DarkPool) is a decentralized exchange providing RFQ-based (Request for Quote) trading services across multiple EVM chains.

## Exchange Characteristics

- **Type**: DEX (Decentralized Exchange)
- **Protocol**: RFQ-based swap system
- **Chains Supported**: BSC (56), Base (8453), Ethereum (1)
- **Authentication**: JWT Token required for ALL API calls
- **API Base URL**: `https://rfq-api.deluthium.ai`

## Quick Start

### 1. Obtain JWT Token

Contact the Deluthium team at [https://deluthium.ai](https://deluthium.ai) to apply for API access.

### 2. Basic Configuration

```python
import ccxt

exchange = ccxt.deluthium({
    'apiKey': 'YOUR_JWT_TOKEN',  # Required for ALL API calls
})

# Load markets
markets = exchange.load_markets()
```

### 3. Configuration with Wallet Address

```python
import ccxt

exchange = ccxt.deluthium({
    'apiKey': 'YOUR_JWT_TOKEN',
    'options': {
        'defaultChainId': 56,      # BSC (default)
        'defaultSlippage': 0.5,    # 0.5%
    }
})
```

## Supported Features

| Feature | Supported | Notes |
|---------|-----------|-------|
| `fetchMarkets()` | ✅ | Get all trading pairs |
| `fetchCurrencies()` | ✅ | Get supported tokens |
| `fetchTicker()` | ✅ | Get pair price/volume data |
| `fetchOHLCV()` | ✅ | K-line/candlestick data |
| `fetchQuote()` | ✅ | Get indicative quote |
| `createOrder()` | ✅ | Get firm quote with calldata |

## Usage Examples

### Fetching Market Data

```python
# Get all trading pairs
markets = exchange.fetch_markets()

# Get ticker for a specific pair
ticker = exchange.fetch_ticker('WBNB/USDT')
print(f"Price: {ticker['last']}")
print(f"24h Volume: {ticker['baseVolume']}")

# Get OHLCV data
ohlcv = exchange.fetch_ohlcv('WBNB/USDT', '1h', limit=100)
```

### Getting a Quote

```python
# Get an indicative quote (for display purposes)
quote = exchange.fetch_quote('WBNB/USDT', 1.0, 'buy', {'chainId': 56})
print(f"Expected output: {quote['amount_out']}")
print(f"Fee: {quote['fee_amount']}")
```

### Creating an Order (Firm Quote)

```python
# Get a firm quote with calldata for on-chain execution
order = exchange.create_order(
    'WBNB/USDT',      # symbol
    'market',          # type (only market supported)
    'buy',             # side
    1.0,               # amount in quote currency
    None,              # price (not used for RFQ)
    {
        'chainId': 56,
        'slippage': 0.5,
        'walletAddress': '0xYourWalletAddress',
    }
)

# IMPORTANT: CCXT returns calldata but does NOT broadcast the transaction
# You must submit it yourself using web3.py or ethers.js
calldata = order['info']['calldata']
router_address = order['info']['router_address']
print(f"Router: {router_address}")
print(f"Calldata: {calldata}")
```

### Broadcasting the Transaction

```python
# Example using web3.py (you need to implement this yourself)
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://bsc-dataseed.binance.org/'))

# Build and send the transaction
tx = {
    'to': router_address,
    'data': calldata,
    'gas': 300000,
    'gasPrice': w3.eth.gas_price,
    'nonce': w3.eth.get_transaction_count(your_wallet_address),
    'chainId': 56,
}

signed = w3.eth.account.sign_transaction(tx, your_private_key)
tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
```

## Cross-Chain Swaps

The API supports cross-chain swaps where source and destination chains differ:

```python
order = exchange.create_order('WBNB/USDT', 'market', 'buy', 1.0, None, {
    'chainId': 56,        # Source: BSC
    'dstChainId': 8453,   # Destination: Base
    'slippage': 1.0,      # Higher slippage for cross-chain
    'walletAddress': '0xYourWalletAddress',
})
```

## Chain IDs

| Chain | Chain ID | Native Token | Wrapped Token |
|-------|----------|--------------|---------------|
| BSC | 56 | BNB | WBNB |
| Base | 8453 | ETH | WETH |
| Ethereum | 1 | ETH | WETH |

## Error Handling

The exchange uses dual error format handling:

**String codes (Trading Service):**
- `INVALID_INPUT`, `INVALID_TOKEN`, `INVALID_AMOUNT`, `INVALID_PAIR`
- `QUOTE_EXPIRED`, `INSUFFICIENT_LIQUIDITY`, `MM_NOT_AVAILABLE`
- `SLIPPAGE_EXCEEDED`, `INTERNAL_ERROR`, `TIMEOUT_ERROR`

**Numeric codes (Market Data Service):**
- `10000` - Success
- `10095` - Invalid parameters
- `20003` - Internal service error
- `20004` - Not found (pair not found)

## AI Agent Integration

```python
import os
import ccxt

# Environment-based configuration
exchange = ccxt.deluthium({
    'apiKey': os.environ.get('DELUTHIUM_JWT'),
    'options': {
        'defaultChainId': 56,
        'defaultSlippage': 0.5,
    }
})

# Standard CCXT patterns work
markets = exchange.fetch_markets()
ticker = exchange.fetch_ticker('WBNB/USDT')

# Get quote before order
quote = exchange.fetch_quote('WBNB/USDT', 1.0, 'buy')

# Create order (returns calldata for agent to broadcast)
order = exchange.create_order(
    'WBNB/USDT', 'market', 'buy', 1.0, None,
    {'walletAddress': os.environ.get('WALLET_ADDRESS')}
)

# Agent must handle transaction broadcast separately
```

## Important Notes

1. **JWT Required**: All endpoints require JWT authentication. There are no public endpoints.

2. **Calldata-Only Orders**: `createOrder()` returns calldata that must be broadcast separately. CCXT does not execute blockchain transactions.

3. **Wei Units**: All amount fields in raw API responses are in wei (integer strings).

4. **Symbol Format**: CCXT uses `BASE/QUOTE` format (e.g., `WBNB/USDT`), while the API uses hyphenated format (`WBNB-USDT`).

5. **pairId Caching**: After calling `fetchMarkets()`, pairIds are cached for efficient `fetchTicker()` and `fetchOHLCV()` calls.

## Documentation

- [DarkPool API Integration Guide](./DarkPool-API-Integration-Guide.md) - Taker API documentation
- [DarkPool System Integration Guide](./DarkPool-System-Integration-Guide.md) - Maker/MM API documentation

## Support

For API access and support, contact the Deluthium team at [https://deluthium.ai](https://deluthium.ai).
