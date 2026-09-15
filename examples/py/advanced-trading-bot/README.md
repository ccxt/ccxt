# Advanced Trading Bot Example

## Overview

This example demonstrates a complete, end-to-end algorithmic trading workflow using the `ccxt` library in Python. It covers the entire lifecycle of a trade, from configuration and market data fetching to risk analysis, user confirmation, order placement, and active monitoring until the order is filled or canceled.

The key purpose of this bot is to serve as an educational tool for beginners learning algorithmic trading. It illustrates best practices in bot development, emphasizing safety, transparency, and robust architecture over complex trading strategies. By studying this code, developers can understand the essential components required for any live trading system.

What makes this example production-ready is its strong focus on risk management and safety features. It includes a mandatory dry-run mode, portfolio-based position sizing, bid-ask spread checks, and minimum volume requirements. Furthermore, it implements comprehensive error handling with automatic retries and graceful shutdown mechanisms to ensure the bot behaves predictably even in volatile markets or during network disruptions. This code is explicitly designed for Python developers who are learning trading bot development and want a safe, structured starting point.

## Features

- ✅ Complete order lifecycle management (place → monitor → cancel)
- ✅ Dry-run mode for safe testing without real money
- ✅ Risk management with position size limits
- ✅ Market condition checks (spread, volume)
- ✅ Comprehensive error handling with automatic retry
- ✅ Advanced logging system with file rotation
- ✅ Real-time order monitoring
- ✅ Graceful shutdown on interruption
- ✅ User confirmation for live trading
- ✅ Position sizing based on portfolio percentage
- ✅ Configurable safety parameters
- ✅ Command-line argument support

## Prerequisites

- Python 3.8 or higher
- `ccxt` library (version 4.0.0+)
- Exchange API credentials (with trading permissions)
- Basic understanding of trading concepts

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/ccxt/ccxt.git
cd ccxt/examples/py/advanced-trading-bot/
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Your Bot
```bash
# Copy the example config
cp config.json.example config.json

# Edit with your settings
nano config.json  # or use any text editor
```

## Configuration

### Required Fields
```json
{
  "exchange": "binance",           // Exchange name (binance, coinbase, kraken, etc.)
  "api_key": "YOUR_API_KEY",       // Your exchange API key
  "secret": "YOUR_SECRET",         // Your exchange API secret
  "symbol": "BTC/USDT",            // Trading pair
  "trade_amount_usd": 50,          // Amount to trade in USD
  "order_type": "limit",           // Order type: limit or market
  "price_offset_percent": 0.1,    // Price offset for limit orders (%)
  "max_wait_seconds": 60,         // Max time to wait for order fill
  "dry_run": true                  // IMPORTANT: Keep true for testing!
}
```

### Safety Parameters
```json
{
  "max_position_percent": 5.0,     // Max % of portfolio per trade
  "max_spread_percent": 0.5,       // Max acceptable bid-ask spread
  "min_24h_volume_usd": 1000000   // Minimum 24h trading volume
}
```

### Configuration Tips
- **CRITICAL:** Always test with `"dry_run": true` first
- Start with small `trade_amount_usd` values ($10-50)
- Use well-known exchanges with good API documentation
- Choose liquid trading pairs (BTC/USDT, ETH/USDT)
- Set conservative position limits (2-5% max)

## Usage

### First Run (Safe Testing)
```bash
# Run in dry-run mode (no real trades)
python trading_bot.py

# Or explicitly force dry-run
python trading_bot.py --dry-run
```

**You should see:**
- Configuration summary
- Market data fetching
- Risk metrics calculation
- Order placement (SIMULATED)
- Order monitoring (SIMULATED)
- "DRY RUN" clearly indicated

### Live Trading (Use with EXTREME Caution)
```bash
# Edit config.json and set: "dry_run": false

# Run the bot
python trading_bot.py
```

**Warning prompts will appear:**
- ⚠️ Three warning lines about real money
- Trade confirmation summary
- Must type "CONFIRM" to proceed
- Market condition checks
- Risk limit verification

### Command-Line Options
```bash
# Use custom config file
python trading_bot.py --config my_config.json

# Force dry-run mode (overrides config)
python trading_bot.py --dry-run

# Set log level
python trading_bot.py --log-level DEBUG
```

## How It Works

### Workflow Overview
1. **Initialize**: Load config, connect to exchange, set up logging
2. **Fetch Data**: Get current market prices and order book
3. **Check Balance**: Verify sufficient funds available
4. **Risk Analysis**: Calculate position size and check limits
5. **Market Check**: Verify spread and volume are acceptable
6. **Confirm Trade**: Display summary and get user confirmation
7. **Place Order**: Submit limit order to exchange
8. **Monitor**: Check order status every 5 seconds
9. **Handle Result**: Log success or cancel if timeout
10. **Cleanup**: Graceful shutdown on completion or interruption

### Order Lifecycle Example

Calculate limit price: $50,000 (0.1% below bid)
Calculate amount: 0.001 BTC ($50)
Check portfolio limit: 0.001 BTC = 2% of portfolio ✅
Check market: Spread 0.05%, Volume $2B ✅
User confirms trade
Place order: Buy 0.001 BTC @ $50,000
Monitor every 5s for 60s max
Order filled after 15s ✅
Log success and exit

## Safety Features

### Built-in Protections
- **Dry-Run Default**: Safe mode enabled by default
- **Position Limits**: Prevents over-exposure (default 5% max)
- **Spread Check**: Avoids trading in illiquid markets
- **Volume Check**: Ensures market is active enough
- **User Confirmation**: Required for all live trades
- **Error Recovery**: Automatic retry with exponential backoff
- **Graceful Shutdown**: Ctrl+C handled cleanly
- **Rate Limiting**: Prevents API ban

### Red Flags to Watch
- Spread > 0.5% → Low liquidity, avoid trading
- Volume < $1M → Inactive market, risky
- Position > 5% → Over-concentrated, reduce size
- Multiple errors → Exchange issues, stop trading

## Example Output

### Dry-Run Mode
```text
════════════════════════════════════
TRADING BOT CONFIGURATION
════════════════════════════════════
Exchange:      binance
Symbol:        BTC/USDT
Trade Amount:  $50.00
Order Type:    limit
Price Offset:  0.1%
Max Wait:      60 seconds
Mode:          🟢 DRY RUN (SAFE)
════════════════════════════════════
[INFO] Fetching market data for BTC/USDT...
[INFO] Current bid: $49,950.00, ask: $50,050.00
[INFO] Calculated limit price: $49,900.00 (0.1% below bid)
[INFO] Checking portfolio balance...
[INFO] USDT balance: $1,000.00 (free: $950.00)
[INFO] Risk Analysis:
[INFO] Portfolio value: $1,000.00
[INFO] Proposed trade: $50.00 (5.0% of portfolio)
[INFO] Max allowed: $50.00 (5.0%)
[INFO] ✅ Risk limits: PASS
[INFO] Market Conditions:
[INFO] Spread: 0.20% ✅
[INFO] 24h Volume: $2.5B ✅
═══════════════════════════════════════
TRADE CONFIRMATION
═══════════════════════════════════════
Symbol:      BTC/USDT
Side:        BUY
Amount:      0.001 BTC
Price:       $49,900.00
Total Cost:  $49.90
Mode:        🟢 DRY RUN (SAFE)
═══════════════════════════════════════
[INFO] 🟢 DRY RUN - Simulating order placement...
[INFO] Order placed: ID dry_run_12345
[INFO] Monitoring order status...
[INFO] ✅ Order filled successfully!
```

### Live Trading Mode
```text
⚠️  WARNING: DRY RUN MODE IS DISABLED
⚠️  WARNING: THIS BOT WILL PLACE REAL ORDERS
⚠️  WARNING: YOU COULD LOSE REAL MONEY
[... same checks as above ...]
═══════════════════════════════════════
TRADE CONFIRMATION
═══════════════════════════════════════
Symbol:      BTC/USDT
Side:        BUY
Amount:      0.001 BTC
Price:       $49,900.00
Total Cost:  $49.90
Mode:        🔴 LIVE TRADING (REAL MONEY)
═══════════════════════════════════════
⚠️  LIVE TRADING MODE - REAL MONEY AT RISK
⚠️  This trade will execute on the exchange
⚠️  Make sure you understand the risks
Type 'CONFIRM' to proceed: _
```

## Common Issues

### "Invalid API key"
**Solution:** 
- Check API key and secret in `config.json`
- Ensure no extra spaces or quotes
- Verify API key has trading permissions enabled
- Some exchanges require IP whitelisting

### "Insufficient funds"
**Solution:**
- Reduce `trade_amount_usd` in config
- Check you have enough free balance (not in open orders)
- Account for trading fees (usually 0.1-0.2%)

### "Order not filled"
**Solution:**
- Increase `max_wait_seconds` (try 120-300)
- Reduce `price_offset_percent` (get closer to market price)
- Use market orders instead of limit (set `order_type: "market"`)
- Check if market is moving too fast

### "Rate limit exceeded"
**Solution:**
- Wait 60 seconds and try again
- Reduce frequency of manual runs
- Rate limiting is enabled by default (should prevent this)

### "Network timeout"
**Solution:**
- Check your internet connection
- Exchange might be down (check their status page)
- Try again in a few minutes
- Bot will auto-retry 3 times with backoff

## Learning Points

This example demonstrates key concepts for algorithmic trading:

### 1. **Order Management**
- Placing limit vs market orders
- Monitoring order status
- Handling partial fills
- Canceling unfilled orders

### 2. **Risk Management**
- Position sizing (% of portfolio)
- Maximum loss limits
- Exposure diversification
- Portfolio allocation

### 3. **Market Analysis**
- Bid-ask spread interpretation
- Volume as liquidity indicator
- Price action monitoring
- Market depth analysis

### 4. **Error Handling**
- Network failures and retries
- Exchange errors (insufficient funds, invalid orders)
- Rate limiting management
- Graceful degradation

### 5. **Production Practices**
- Logging for debugging
- Configuration management
- Input validation
- User confirmations

## Disclaimer

⚠️ **IMPORTANT - READ CAREFULLY**

### Trading Risks
- **This is educational code for learning purposes**
- **Trading cryptocurrencies carries significant financial risk**
- **You can lose all money you invest**
- **Past performance does not guarantee future results**
- **No trading strategy is guaranteed to be profitable**

### No Warranty
- This code is provided "as is" without warranty of any kind
- The authors are not responsible for any financial losses
- Use at your own risk
- Not financial advice

### Recommendations
- ✅ Always test thoroughly in dry-run mode
- ✅ Start with very small amounts (< $10)
- ✅ Only trade with money you can afford to lose
- ✅ Understand the code before running it
- ✅ Monitor your trades actively
- ✅ Never leave bots running unattended initially
- ✅ Have a stop-loss strategy

### Legal
- Ensure trading is legal in your jurisdiction
- Check exchange terms of service for bot trading
- Some regions have restrictions on crypto trading
- Comply with all applicable laws and regulations

## Contributing

Contributions are welcome! Please:
- Follow ccxt code style guidelines
- Add tests for new features
- Update documentation
- Submit pull requests with clear descriptions

## License

MIT License - see ccxt repository for details

---

**Remember: Trading involves risk. This bot is a learning tool, not a money-making guarantee.**
