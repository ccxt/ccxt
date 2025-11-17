# AsterDEX Comprehensive Test Scripts

This directory contains comprehensive test scripts for testing AsterDEX wallet functionality in both JavaScript and Python.

## Test Scripts

1. **`test-asterdex-comprehensive.js`** - JavaScript/Node.js comprehensive test suite
2. **`test_asterdex_comprehensive.py`** - Python comprehensive test suite

Both scripts test the same functionality and provide identical testing capabilities.

## Features

### Public API Tests (No Authentication Required)
- ✅ `fetchTime()` - Get server timestamp
- ✅ `fetchStatus()` - Get exchange status
- ✅ `fetchMarkets()` - List available markets
- ✅ `fetchTicker(symbol)` - Get 24hr ticker stats
- ✅ `fetchTickers()` - Get all tickers
- ✅ `fetchOrderBook(symbol)` - Get order book
- ✅ `fetchTrades(symbol)` - Get recent trades
- ✅ `fetchOHLCV(symbol, timeframe)` - Get candlestick data
- ✅ `fetchFundingRate(symbol)` - Get funding rate (futures)
- ✅ `fetchFundingRates()` - Get all funding rates
- ✅ `fetchFundingRateHistory()` - Get funding rate history

### Private API Tests (Require Authentication)
- 🔐 `fetchBalance()` - Get account balances
- 🔐 `fetchAccounts()` - Get account information
- 🔐 `fetchOpenOrders(symbol)` - Get open orders
- 🔐 `fetchOrders(symbol)` - Get order history
- 🔐 `fetchMyTrades(symbol)` - Get trade history
- 🔐 `fetchPositions()` - Get open positions (futures)
- 🔐 `fetchPosition(symbol)` - Get specific position
- 🔐 `fetchPositionMode()` - Get position mode
- 🔐 `fetchLeverage(symbol)` - Get leverage setting
- 🔐 `fetchLeverageTiers()` - Get leverage tiers

### Order Management Tests (⚠️ Uses Real Funds!)
- ⚠️  `createOrder()` - Place an order
- ⚠️  `fetchOrder()` - Get order details
- ⚠️  `cancelOrder()` - Cancel an order
- ⚠️  `cancelAllOrders()` - Cancel all orders

## Setup Instructions

### JavaScript/Node.js Setup

```bash
# 1. Install Node.js dependencies
cd /path/to/ccxt
npm install

# 2. Configure credentials
nano test-asterdex-comprehensive.js
# Edit the CONFIG section:
#   - Set walletAddress
#   - Set privateKey (for private methods)
#   - Set test_private_methods = true (to enable private tests)
#   - Set test_order_placement = true (to test orders - USES REAL FUNDS!)

# 3. Run tests
node test-asterdex-comprehensive.js
```

### Python Setup

```bash
# 1. Install Python dependencies
cd /path/to/ccxt
pip3 install -e .
# OR if that fails:
pip3 install ccxt

# 2. Configure credentials
nano test_asterdex_comprehensive.py
# Edit the CONFIG dict:
#   - Set 'wallet_address'
#   - Set 'private_key' (for private methods)
#   - Set 'test_private_methods' = True (to enable private tests)
#   - Set 'test_order_placement' = True (to test orders - USES REAL FUNDS!)

# 3. Run tests
python3 test_asterdex_comprehensive.py
```

## Configuration

Both scripts have a `CONFIG` section at the top that you must configure:

### Required for All Tests
```javascript
// JavaScript
walletAddress: '0xYOUR_WALLET_ADDRESS_HERE'

# Python
'wallet_address': '0xYOUR_WALLET_ADDRESS_HERE'
```

### Required for Private Method Tests
```javascript
// JavaScript
privateKey: 'YOUR_PRIVATE_KEY_HERE',  // Without 0x prefix
testPrivateMethods: true,

# Python
'private_key': 'YOUR_PRIVATE_KEY_HERE',  # Without 0x prefix
'test_private_methods': True,
```

### Required for Order Placement Tests
```javascript
// JavaScript
testOrderPlacement: true,
testSymbol: 'BTC/USDT',
testAmount: 0.001,  // Small amount!
testPrice: 20000,   // Set safely away from market price

# Python
'test_order_placement': True,
'test_symbol': 'BTC/USDT',
'test_amount': 0.001,  # Small amount!
'test_price': 20000,   # Set safely away from market price
```

## Security Warnings ⚠️

1. **NEVER commit your private key to version control**
2. **Use environment variables in production:**
   ```javascript
   // JavaScript
   privateKey: process.env.PRIVATE_KEY

   # Python
   'private_key': os.getenv('PRIVATE_KEY')
   ```

3. **Test on testnets first** before using real funds
4. **Set safe test parameters:**
   - Use small amounts
   - Set limit prices far from market to avoid fills
   - Cancel test orders immediately after creation

5. **Order placement tests use REAL funds!**
   - Only enable when explicitly needed
   - Double-check test parameters
   - Monitor your account during tests

## Usage Examples

### Test Public Methods Only
```bash
# No configuration needed except wallet address
# Leave testPrivateMethods = false (default)

node test-asterdex-comprehensive.js
# or
python3 test_asterdex_comprehensive.py
```

### Test Public + Private Methods
```bash
# Configure: walletAddress, privateKey, testPrivateMethods = true

node test-asterdex-comprehensive.js
# or
python3 test_asterdex_comprehensive.py
```

### Test Everything Including Orders (⚠️ DANGEROUS)
```bash
# Configure: all credentials + testOrderPlacement = true
# ⚠️  WARNING: This WILL place real orders with real funds!

node test-asterdex-comprehensive.js
# or
python3 test_asterdex_comprehensive.py
```

## Output Example

```
╔═══════════════════════════════════════════════════════════════╗
║     AsterDEX Comprehensive Test Suite - JavaScript           ║
╚═══════════════════════════════════════════════════════════════╝

🔐 Authentication: ENABLED
   Wallet: 0x06964466831ac13f351bD84fc2669572A59E0F24

📥 Loading markets...
✅ Markets loaded successfully

═══════════════════════════════════════════════════════════════
PUBLIC API TESTS (No Authentication Required)
═══════════════════════════════════════════════════════════════

[1] Public → fetchTime()
    ✅ PASSED (234ms)
    Result: 1700000000000

[2] Public → fetchMarkets()
    ✅ PASSED (456ms)
    Result: Array(125)

...

═══════════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════════

Total Tests:   25
✅ Passed:     22
❌ Failed:     1
⏭️  Skipped:    2

Success Rate: 95.7% (excluding skipped)
```

## Troubleshooting

### "asterdex GET ... fetch failed"
The AsterDEX API may be offline or unreachable. Check:
- Network connectivity
- API endpoint URLs in `js/src/asterdex.js`
- Exchange operational status

### "ECDSA signature invalid" / Authentication errors
Check:
- Private key is correct (without 0x prefix)
- Wallet address matches the private key
- Credentials are properly set in CONFIG

### "ModuleNotFoundError: No module named 'ccxt'"
For Python:
```bash
pip3 install ccxt
# or for development:
cd /path/to/ccxt
pip3 install -e .
```

### "Cannot find module './js/ccxt.js'"
For JavaScript:
```bash
cd /path/to/ccxt
npm install
```

## Test Script Structure

Both scripts follow the same structure:

1. **Configuration Section** - Set credentials and test parameters
2. **Test Suite Class** - Main test orchestration
3. **Public Method Tests** - No authentication needed
4. **Private Method Tests** - Require wallet signature
5. **Order Management Tests** - Create/cancel orders (dangerous!)
6. **Margin & Leverage Tests** - Modify account settings
7. **Summary & Reporting** - Test results and statistics

## Advanced Usage

### Running Specific Test Categories

Edit the `run()` method in either script to comment out test categories:

```javascript
// JavaScript
async run() {
    await this.init();
    await this.testPublicMethods();
    // await this.testPrivateMethods();  // Skip private tests
    // await this.testOrderManagement();  // Skip order tests
    // await this.testMarginAndLeverage(); // Skip margin tests
    this.printSummary();
}
```

```python
# Python
def run(self):
    self.init()
    self.test_public_methods()
    # self.test_private_methods()  # Skip private tests
    # self.test_order_management()  # Skip order tests
    # self.test_margin_and_leverage()  # Skip margin tests
    self.print_summary()
```

### Adding Custom Tests

Add new tests using the `runTest()` / `run_test()` helper:

```javascript
// JavaScript
await this.runTest(
    'myCustomTest()',
    async () => await this.exchange.someMethod(),
    false,  // requiresAuth
    'Custom'  // category
);
```

```python
# Python
self.run_test(
    'my_custom_test()',
    lambda: self.exchange.some_method(),
    False,  # requires_auth
    'Custom'  # category
)
```

## Files

- `test-asterdex-comprehensive.js` - JavaScript test suite (~450 lines)
- `test_asterdex_comprehensive.py` - Python test suite (~450 lines)
- `TEST-SCRIPTS-README.md` - This file
- `WALLET-TESTS-SUMMARY.md` - Summary of what works without private key
- `test-wallet-no-key.js` - Simple public-only test script

## Related Documentation

- [CCXT Manual](https://docs.ccxt.com/)
- [AsterDEX API Documentation](https://docs.asterdex.com/)
- [CCXT AsterDEX Implementation](js/src/asterdex.js)

## Support

For issues with:
- **CCXT Library**: https://github.com/ccxt/ccxt/issues
- **AsterDEX Exchange**: https://docs.asterdex.com/support
- **These Test Scripts**: Review the code and modify as needed

## License

These test scripts are provided as-is for testing purposes. Use at your own risk.
