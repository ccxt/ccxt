# CoW Protocol CCXT Integration Test Scripts

This folder contains comprehensive test scripts for all CoW Protocol CCXT functions.

## Setup

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials** in `.env`:
   - `WALLET_ADDRESS`: Your Ethereum wallet address
   - `PRIVATE_KEY`: Your private key (with 0x prefix)
   - `NETWORK`: Network to test on (sepolia recommended for testing)
   - `ENV`: Environment (barn for testnet, prod for mainnet)
   - `TEST_SYMBOL`: Trading pair to use (e.g., WETH/USDC)
   - `TEST_AMOUNT`: Small amount for test orders
   - `TEST_PRICE`: Price for limit order tests

3. **Install dependencies** (if not already installed):
   ```bash
   # From project root
   npm install
   ```

## Running Tests

### Comprehensive Test Suite (`test-all.ts`)

The `test-all.ts` script runs all CoW Protocol CCXT functions in a single comprehensive test suite. This is the recommended way to test all functionality at once.

**Run the comprehensive test suite:**
```bash
# From scripts folder
tsx test-all.ts
```

**What it tests:**

The script systematically tests all 13 implemented CoW Protocol CCXT functions:

1. **`fetchMarkets()`** - Fetches all available trading markets and displays the count and a sample market symbol.

2. **`fetchBalance()`** - Retrieves wallet balance for all currencies, showing how many currencies have a non-zero balance.

3. **`createOrder()`** - Creates a limit order using the configured test symbol, amount, and price. The order includes options like `validFor` (3600 seconds) and `partiallyFillable: true`. If rate limits are encountered, the test notes this is a network issue, not a code issue.

4. **`fetchOrder()`** - Fetches a single order by ID. If no test order ID is available, it attempts to fetch the most recent order from your order history.

5. **`fetchOrders()`** - Retrieves all orders (up to 5 for testing), showing the total count fetched.

6. **`fetchOpenOrders()`** - Fetches only orders that are currently open, displaying the count of open orders.

7. **`fetchClosedOrders()`** - Retrieves closed orders (up to 5 for testing), showing how many closed orders exist.

8. **`fetchCanceledOrders()`** - Fetches canceled orders (up to 5 for testing), displaying the count of canceled orders.

9. **`fetchMyTrades()`** - Retrieves your trade history (up to 5 trades for testing), showing the number of trades fetched.

10. **`cancelOrder()`** - Cancels a single order. The script first checks for existing open orders. If none exist, it creates a test order specifically for cancellation. Only attempts cancellation if the order status is 'open'.

11. **`cancelAllOrders()`** - Cancels all open orders in a batch operation. If no open orders exist, the test is marked as passed (since the function would work if orders existed).

12. **`waitForOrder()`** - Polls an order until it reaches a terminal state (filled, canceled, or expired). Uses a 10-second timeout with 1-second polling intervals for testing purposes.

13. **`compareQuoteWithOtherExchanges()`** - Compares CoW Protocol quotes with other exchanges (like Uniswap). Uses a minimum amount of 10 units to ensure fees are covered. Requires other exchanges to be available for comparison.

**Test Execution Flow:**

1. The script loads environment variables from `.env` file automatically
2. Initializes the exchange with your configured wallet address, private key, network, and environment
3. Runs each test function sequentially
4. Displays real-time results for each test with ✅ for passed and ❌ for failed
5. Provides a comprehensive summary at the end showing:
   - Total passed/failed count
   - Individual test results
   - Detailed error messages for any failures

**Output Example:**
```
========================================
CoW Protocol CCXT Integration Tests
========================================
Network: sepolia
Environment: barn
Symbol: USDC/DAI
========================================

✅ Exchange initialized (sepolia, barn)

=== Testing fetchMarkets() ===
✅ Found 150 markets
   Sample: WETH/USDC

=== Testing fetchBalance() ===
✅ Balance fetched: 3 currencies with balance

...

========================================
Test Summary
========================================
Passed: 12/13

Results:
  ✅ fetchMarkets
  ✅ fetchBalance
  ✅ createOrder
  ✅ fetchOrder
  ...
========================================
```

**Detailed Behavior:**

- **Automatic Order Management**: The script maintains a `testOrderId` variable that gets populated when orders are created or fetched, allowing subsequent tests (like `fetchOrder` and `waitForOrder`) to use the same order.

- **Graceful Error Handling**: 
  - Rate limit errors (429) are recognized as network issues, not code failures
  - Missing prerequisites (like no orders to cancel) result in skipped tests rather than failures
  - The script provides clear messages explaining why tests were skipped

- **Smart Test Dependencies**: 
  - `fetchOrder()` will fetch a recent order if no test order ID exists
  - `cancelOrder()` will create a test order if no open orders are available
  - `waitForOrder()` requires an order ID, so it's skipped if none is available

- **Configuration**: All test parameters come from your `.env` file:
  - Uses `TEST_SYMBOL` for trading pairs (defaults to 'USDC/DAI')
  - Uses `TEST_AMOUNT` for order amounts (defaults to 0.001)
  - Uses `TEST_PRICE` for limit order prices (defaults to 2000)
  - Uses `NETWORK` and `ENV` for exchange initialization

- **Quote Comparison**: The `compareQuoteWithOtherExchanges()` test automatically uses a larger amount (minimum 10 units) to ensure fees are properly covered, even if your `TEST_AMOUNT` is smaller.

## Important Notes

⚠️ **Security Warning**:
- Never commit your `.env` file to version control
- Use testnet (sepolia + barn) for testing
- Use small amounts for test orders
- Never use mainnet private keys for testing

⚠️ **Testnet Usage**:
- Recommended: Use `NETWORK=sepolia` and `ENV=barn` for testing
- Get test tokens from faucets before running order tests
- Test orders may take time to settle on testnet

