# AI Skills for Claude Code, OpenCode, Codex and Gemini

CCXT provides skills for Claude Code, OpenCode, Codex, Gemini and other AI coding assistants — one per supported language, plus skills for the CCXT CLI and the CCXT MCP server. These skills help developers quickly learn and use CCXT in their projects with comprehensive guides, code examples, and an API reference.

> Looking to let an AI agent **call exchanges directly** (fetch market data, check balances, place orders) rather than help you write code? See the [MCP Server](MCP.md) — the official CCXT Model Context Protocol server for Claude Desktop, Claude Code, Cursor, VS Code, and other MCP hosts.

## What are CCXT Skills?

Skills are interactive documentation modules that AI coding assistants (like Claude Code, OpenCode, Codex and Gemini) can load to provide context-aware help when working with CCXT. When you ask questions about CCXT, the AI assistant uses these skills to give accurate, detailed answers with working code examples.

### What's Included

Each **language** skill includes:

- **Broad API reference** - the most-used unified methods documented with descriptions, grouped by market data, trading, account, derivatives and WebSocket
- **Installation guides** - Package manager commands for each language
- **Code examples** - Working, runnable examples throughout, in that skill's own language
- **REST & WebSocket APIs** - Both standard and real-time APIs covered
- **Best practices** - Error handling, rate limiting, authentication patterns
- **Common pitfalls** - Language-specific mistakes to avoid
- **Troubleshooting guides** - Solutions to common issues and error messages

The `ccxt-cli` and `ccxt-mcp` skills are scoped to their tool instead: installation and configuration, the commands or tools available, authentication, safety rails and troubleshooting.

## Available Skills

Seven language-specific skills are available:

| Skill | Language | Coverage |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, browser, REST & WebSocket |
| **ccxt-python** | Python | Sync, async, asyncio, REST & WebSocket |
| **ccxt-php** | PHP | Sync, async (ReactPHP), REST & WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST & WebSocket |
| **ccxt-go** | Go | REST & WebSocket |
| **ccxt-java** | Java | Java 21+, typed subclasses, sync & async, REST & WebSocket |
| **ccxt-rust** | Rust | Async (tokio), typed wrappers, REST & WebSocket |

Each skill is tailored to the specific language with appropriate idioms, naming conventions, and best practices.

Two further skills cover CCXT tooling rather than a language:

| Skill | Covers |
|-------|--------|
| **ccxt-cli** | The `ccxt-cli` npm package — calling any unified method from the terminal, argument and `--param` rules, API keys, sandbox/demo modes, live WebSocket tickers and orderbooks, OHLCV charts, `--raw` output for scripting |
| **ccxt-mcp** | Installing and configuring the [CCXT MCP server](MCP.md) — MCP hosts, named accounts and local API keys, capability tiers and safety rails, sandbox trading, and how to drive the tools |

`ccxt-mcp` is *documentation about* the MCP server, not the server itself. Install the **skill** to get help setting the server up; install the **server** ([MCP.md](MCP.md)) to let an agent actually call exchanges. `ccxt-mcp` has no individual installer flag or menu entry — it is installed by `--all` (the default when the script is piped from curl) or by copying it manually.

## Installation

### Prerequisites

You need an AI coding assistant that loads skills — [Claude Code](https://claude.ai/download), [OpenCode](https://opencode.ai/), Codex or Gemini — installed on your system.

### Quick Install (Recommended)

Install all skills with a single command using the [skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add ccxt/ccxt
```

This works with Claude Code, Cursor, Copilot, Windsurf, Codex, and 30+ other AI coding assistants.

### Alternative: Shell Script

```sh
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh
# or
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --all
# or
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --typescript
```

This downloads and installs the CCXT usage skills to your system.

### From Repository

If you have the CCXT repository cloned, you can use these options:

#### Option 1: Interactive Installation (Recommended)

```sh
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
  6) ccxt-java       - Java (Java 21+, REST & WebSocket)
  7) ccxt-rust       - Rust (async/tokio, REST & WebSocket)
  8) ccxt-cli        - Command-line interface (terminal, no code)
  9) All skills      - Install all of the above
 10) Exit            - Cancel installation

Enter your choice (1-10):
```

#### Option 2: Install All Skills

```sh
./install-skills.sh --all
```

#### Option 3: Install Specific Languages

```sh
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

Available flags: `--typescript`, `--python`, `--php`, `--csharp`, `--go`, `--java`, `--rust`, `--cli`, plus `--all` for everything and `--remote` to pull from GitHub even inside a clone.

### Installation Locations

Skills are installed to:
- `~/.claude/skills/` (for Claude Code)
- `~/.opencode/skills/` (for OpenCode)
- `~/skills/` (for Codex)
- `~/.gemini/skills/` (for Gemini)

The installation script writes to all four locations unconditionally, creating any directory that does not exist yet.

## Usage with AI Assistants

### Invoking Skills

Once installed, you can invoke skills directly in Claude Code, OpenCode, Codex or Gemini:

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
/ccxt-java
/ccxt-rust
/ccxt-cli
/ccxt-mcp
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

The lists below reflect the TypeScript, Python, PHP, C# and Go skills, which document the fullest unified surface. `ccxt-rust` and especially `ccxt-java` cover a subset — see that skill's own *Complete Method Reference* section for exactly what it documents.

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
- `fetchL3OrderBook` - Level 3 order book (unaggregated, order-by-order)
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
- `fetchAccounts` - Get all accounts associated with the profile
- `fetchLedger` - Get ledger history
- `fetchDeposits` - Get deposit history
- `fetchWithdrawals` - Get withdrawal history
- `fetchDepositsWithdrawals` - Get combined deposit and withdrawal history
- `fetchTransactions` - *deprecated*, use `fetchDepositsWithdrawals`
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
- `borrowCrossMargin` / `borrowIsolatedMargin` - Borrow margin (cross or isolated)
- `repayCrossMargin` / `repayIsolatedMargin` - Repay borrowed margin (cross or isolated)

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

Many high-frequency `fetch*` methods have a streaming `watch*` counterpart. Most other `fetch*` methods are REST-only. Separately, some exchanges expose request/response calls over the WebSocket connection using a `Ws` suffix (`fetchBalanceWs`, `fetchOrderWs`, `createOrderWs`):

- `watchTicker` - Live ticker updates
- `watchTickers` - Live multiple ticker updates
- `watchOrderBook` - Live order book updates
- `watchTrades` - Live trade stream
- `watchOHLCV` - Live candlestick updates
- `watchBalance` - Live balance updates (auth required)
- `watchOrders` - Live order updates (auth required)
- `watchMyTrades` - Live trade updates (auth required)
- `watchPositions` - Live position updates (auth required)
- `watchBidsAsks` - Live best bid/ask updates
- `watchLiquidations` / `watchMyLiquidations` - Live liquidation stream
- `watchStatus` - Live exchange status updates

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

Most skills cover both the built-in rate limiter and manual delays:

```
# The built-in rate limiter is ON by default - leave it on
exchange.enableRateLimit = true   # set to false only if you throttle requests yourself
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
```sh
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
ls ~/skills/ccxt-*
ls ~/.gemini/skills/ccxt-*
```

2. Restart your AI assistant (Claude Code, OpenCode, Codex or Gemini)

3. Re-run installation:
```sh
# from a CCXT clone
./install-skills.sh --all

# or, without a clone
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | sh -s -- --all
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

```sh
# Copy every ccxt-* skill into each assistant's skills directory
for dir in ~/.claude/skills ~/.opencode/skills ~/skills ~/.gemini/skills; do
    mkdir -p "$dir"
    cp -r .claude/skills/ccxt-* "$dir/"
done
```

## Learn More

- **Skills documentation**: `.claude/skills/README.md` in the CCXT repository
- **CCXT Manual**: [Manual.md](Manual.md)
- **CCXT Pro**: [ccxt.pro.manual.md](ccxt.pro.manual.md)

## Feedback

If you have suggestions for improving the skills or find issues:

1. Open an issue on [GitHub](https://github.com/ccxt/ccxt/issues)
2. Include "Skills:" in the title
3. Specify which language skill and what could be improved

The skills are actively maintained and updated alongside CCXT releases.
