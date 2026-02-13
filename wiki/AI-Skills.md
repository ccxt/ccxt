# AI Skills for Claude Code and OpenCode

CCXT provides language-specific skills for Claude Code and OpenCode AI assistants. These skills help developers quickly learn and use CCXT in their projects with comprehensive guides, code examples, and a complete API reference.

## What are CCXT Skills?

Skills are interactive documentation modules that AI coding assistants (like Claude Code and OpenCode) can load to provide context-aware help when working with CCXT. When you ask questions about CCXT, the AI assistant uses these skills to give accurate, detailed answers with working code examples.

### What's Included

Each skill includes:

- **Complete API reference** - All 200+ CCXT methods documented with descriptions
- **Installation guides** - Package manager commands for each language
- **Code examples** - Working code examples embedded in documentation across all supported languages
- **REST & WebSocket APIs** - Both standard and real-time APIs covered
- **Best practices** - Error handling, rate limiting, authentication patterns
- **Common pitfalls** - Language-specific mistakes to avoid
- **Troubleshooting guides** - Solutions to common issues and error messages

## Available Skills

Five language-specific skills are available:

| Skill | Language | Coverage |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, browser, REST & WebSocket |
| **ccxt-python** | Python | Sync, async, asyncio, REST & WebSocket |
| **ccxt-php** | PHP | Sync, async (ReactPHP), REST & WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST & WebSocket |
| **ccxt-go** | Go | REST & WebSocket |

Each skill is tailored to the specific language with appropriate idioms, naming conventions, and best practices.

## Installation

### Prerequisites

You need either [Claude Code](https://claude.ai/download) or [OpenCode](https://opencode.dev/) installed on your system.

### Quick Install (No Repository Clone Required)

Install all skills with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

This will automatically download and install all five CCXT skills to your system.

### From Repository

If you have the CCXT repository cloned, you can use these options:

#### Option 1: Interactive Installation (Recommended)

```bash
./install-skills.sh
```

This will present an interactive menu where you can choose which skills to install:

```
Select which skills to install:

  1) ccxt-typescript - TypeScript/JavaScript (Node.js & browser, REST & WebSocket)
  2) ccxt-python     - Python (sync & async, REST & WebSocket)
  3) ccxt-php        - PHP (sync & async, REST & WebSocket)
  4) ccxt-csharp     - C#/.NET (REST & WebSocket)
  5) ccxt-go         - Go (REST & WebSocket)
  6) All skills      - Install all of the above
  7) Exit            - Cancel installation

Enter your choice (1-7):
```

#### Option 2: Install All Skills

```bash
./install-skills.sh --all
```

#### Option 3: Install Specific Languages

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### Installation Locations

Skills are installed to:
- `~/.claude/skills/` (for Claude Code)
- `~/.opencode/skills/` (for OpenCode)

The installation script automatically detects both and installs to the appropriate locations.

## Usage with AI Assistants

### Invoking Skills

Once installed, you can invoke skills directly in Claude Code or OpenCode:

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

The AI assistant will load the skill and be ready to answer questions about CCXT in that language.

### Asking Questions

You don't need to explicitly invoke skills - just ask natural questions:

**Basic usage:**
- "How do I install CCXT in Python?"
- "Show me how to fetch a ticker in TypeScript"
- "How do I connect to Binance using API keys in Go?"

**Specific features:**
- "How do I create a stop-loss order in JavaScript?"
- "Show me how to watch live orderbook updates in Python"
- "What's the difference between fetchTicker and watchTicker?"
- "How do I handle RateLimitExceeded errors in PHP?"

**Advanced topics:**
- "How do I set leverage for futures trading in C#?"
- "Show me how to fetch funding rate history in TypeScript"
- "How do I create a trailing stop order in Python?"
- "What's the best way to handle WebSocket reconnections in Go?"

The AI assistant will automatically reference the appropriate skill to provide accurate answers with working code examples.

## What's Covered

### Market Data Methods

**Tickers & Prices:**
- `fetchTicker` - Get ticker for one symbol
- `fetchTickers` - Get multiple tickers at once
- `fetchBidsAsks` - Get best bid/ask prices
- `fetchMarkPrices` - Get mark prices for derivatives
- `fetchLastPrices` - Get last traded prices

**Order Books:**
- `fetchOrderBook` - Get full order book
- `fetchL2OrderBook` - Level 2 order book
- `fetchL3OrderBook` - Level 3 order book (full depth)
- WebSocket: `watchOrderBook` - Live order book updates

**Trades & History:**
- `fetchTrades` - Get public trade history
- `fetchMyTrades` - Get your trade history (authenticated)
- `fetchOHLCV` - Get candlestick/OHLCV data
- WebSocket: `watchTrades`, `watchOHLCV` - Live updates

### Trading Methods

**Order Types (20+ supported):**
- Market orders: `createMarketOrder`, `createMarketBuyOrder`, `createMarketSellOrder`
- Limit orders: `createLimitOrder`, `createLimitBuyOrder`, `createLimitSellOrder`
- Stop orders: `createStopLossOrder`, `createStopMarketOrder`, `createStopLimitOrder`
- Take profit: `createTakeProfitOrder`
- Trailing stops: `createTrailingAmountOrder`, `createTrailingPercentOrder`
- Advanced: `createPostOnlyOrder`, `createReduceOnlyOrder`, `createTriggerOrder`
- OCO orders: `createOrderWithTakeProfitAndStopLoss`

**Order Management:**
- `fetchOrder` - Get single order
- `fetchOrders` - Get all orders
- `fetchOpenOrders` - Get open orders
- `fetchClosedOrders` - Get closed orders
- `cancelOrder` - Cancel single order
- `cancelAllOrders` - Cancel all orders
- `editOrder` - Modify existing order
- WebSocket: `watchOrders` - Live order updates

### Account & Balance

- `fetchBalance` - Get account balance
- `fetchAccounts` - Get sub-accounts
- `fetchLedger` - Get ledger history
- `fetchDeposits` - Get deposit history
- `fetchWithdrawals` - Get withdrawal history
- `fetchTransactions` - Get transaction history
- WebSocket: `watchBalance` - Live balance updates

### Derivatives & Futures

**Positions:**
- `fetchPosition` - Get single position
- `fetchPositions` - Get all positions
- `closePosition` - Close a position
- `setPositionMode` - Set hedge/one-way mode
- WebSocket: `watchPositions` - Live position updates

**Margin & Leverage:**
- `fetchLeverage` - Get current leverage
- `setLeverage` - Set leverage
- `setMarginMode` - Set cross/isolated margin
- `borrowMargin` - Borrow margin
- `repayMargin` - Repay borrowed margin

**Funding & Settlement:**
- `fetchFundingRate` - Get current funding rate
- `fetchFundingRateHistory` - Get funding rate history
- `fetchFundingHistory` - Get your funding payments
- `fetchSettlementHistory` - Get settlement history

**Open Interest & Liquidations:**
- `fetchOpenInterest` - Get open interest
- `fetchOpenInterestHistory` - Get OI history
- `fetchLiquidations` - Get public liquidations
- `fetchMyLiquidations` - Get your liquidations

**Options:**
- `fetchOption` - Get option information
- `fetchOptionChain` - Get option chain
- `fetchGreeks` - Get option greeks
- `fetchVolatilityHistory` - Get volatility history

### Deposits & Withdrawals

- `fetchDepositAddress` - Get deposit address
- `createDepositAddress` - Create new deposit address
- `withdraw` - Withdraw funds
- `fetchDeposit` - Get deposit info
- `fetchWithdrawal` - Get withdrawal info

### Fees & Limits

- `fetchTradingFee` - Get trading fee for symbol
- `fetchTradingFees` - Get trading fees
- `fetchTradingLimits` - Get trading limits
- `fetchDepositWithdrawFee` - Get deposit/withdrawal fees

### WebSocket Real-time Streaming

All `fetch*` methods have WebSocket equivalents with `watch*` prefix:

- `watchTicker` - Live ticker updates
- `watchTickers` - Live multiple ticker updates
- `watchOrderBook` - Live order book updates
- `watchTrades` - Live trade stream
- `watchOHLCV` - Live candlestick updates
- `watchBalance` - Live balance updates (auth required)
- `watchOrders` - Live order updates (auth required)
- `watchMyTrades` - Live trade updates (auth required)
- `watchPositions` - Live position updates (auth required)

## Best Practices Covered

### Error Handling

Each skill teaches proper exception handling:

- **NetworkError** - Recoverable errors (retry with backoff)
- **ExchangeError** - Non-recoverable errors (don't retry)
- **RateLimitExceeded** - Rate limit hit (wait and retry)
- **AuthenticationError** - Invalid API credentials
- **InsufficientFunds** - Not enough balance
- **InvalidOrder** - Invalid order parameters

### Rate Limiting

Skills cover both built-in and manual rate limiting:

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### Authentication

Secure API key handling:

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### Method Availability

Checking if an exchange supports a method:

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## Troubleshooting

### Skills Not Showing Up

1. Verify installation location:
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. Restart Claude Code / OpenCode

3. Re-run installation:
```bash
./install-skills.sh --all
```

### Getting "Skill Not Found" Error

Make sure you're using the correct skill name:
- `/ccxt-typescript` (not `/ccxt-ts` or `/typescript`)
- `/ccxt-python` (not `/ccxt-py` or `/python`)
- etc.

### AI Assistant Not Using Skills

The AI assistant automatically uses skills when you ask CCXT-related questions. You don't need to explicitly invoke them unless you want to.

## Manual Installation

If the installation script doesn't work, you can install manually:

```bash
# Create directories
mkdir -p ~/.claude/skills/
mkdir -p ~/.opencode/skills/

# Copy skills
cp -r .claude/skills/ccxt-typescript ~/.claude/skills/
cp -r .claude/skills/ccxt-python ~/.claude/skills/
cp -r .claude/skills/ccxt-php ~/.claude/skills/
cp -r .claude/skills/ccxt-csharp ~/.claude/skills/
cp -r .claude/skills/ccxt-go ~/.claude/skills/

# For OpenCode
cp -r .claude/skills/ccxt-* ~/.opencode/skills/
```

## Learn More

- **Skills documentation**: `.claude/skills/README.md` in the CCXT repository
- **Generation strategy**: `.claude/skills/GENERATION_STRATEGY.md`
- **CCXT Manual**: [Manual.md](Manual.md)
- **CCXT Pro**: [ccxt.pro.manual.md](ccxt.pro.manual.md)

## Feedback

If you have suggestions for improving the skills or find issues:

1. Open an issue on [GitHub](https://github.com/ccxt/ccxt/issues)
2. Include "Skills:" in the title
3. Specify which language skill and what could be improved

The skills are actively maintained and updated alongside CCXT releases.
