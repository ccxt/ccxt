// Test wallet operations without private key
// Wallet address: 0x06964466831ac13f351bD84fc2669572A59E0F24

import ccxt from './js/ccxt.js';

const walletAddress = '0x06964466831ac13f351bD84fc2669572A59E0F24';

console.log('='.repeat(70));
console.log('AsterDEX Public API Tests (No Private Key Required)');
console.log('Wallet Address:', walletAddress);
console.log('='.repeat(70));
console.log('');

// Initialize exchange (public endpoints only)
const exchange = new ccxt.asterdex({
    'enableRateLimit': true,
    // Note: walletAddress and privateKey are NOT set
    // This means we can only use public endpoints
});

async function runPublicTests() {
    try {
        // Test 1: Fetch Server Time
        console.log('📍 Test 1: Fetching server time...');
        const serverTime = await exchange.fetchTime();
        console.log('✅ Server time:', new Date(serverTime).toISOString());
        console.log('');

        // Test 2: Fetch Markets
        console.log('📍 Test 2: Fetching markets...');
        const markets = await exchange.fetchMarkets();
        console.log(`✅ Found ${markets.length} markets`);
        console.log('Sample markets:');
        markets.slice(0, 5).forEach(m => {
            console.log(`  - ${m.symbol} (${m.type})`);
        });
        console.log('');

        // Test 3: Fetch Ticker (requires a trading pair)
        if (markets.length > 0) {
            const symbol = markets[0].symbol;
            console.log(`📍 Test 3: Fetching ticker for ${symbol}...`);
            const ticker = await exchange.fetchTicker(symbol);
            console.log('✅ Ticker data:');
            console.log(`  Last Price: ${ticker.last}`);
            console.log(`  24h High: ${ticker.high}`);
            console.log(`  24h Low: ${ticker.low}`);
            console.log(`  24h Volume: ${ticker.baseVolume}`);
            console.log('');

            // Test 4: Fetch Order Book
            console.log(`📍 Test 4: Fetching order book for ${symbol}...`);
            const orderbook = await exchange.fetchOrderBook(symbol, 5);
            console.log('✅ Order book:');
            console.log(`  Bids: ${orderbook.bids.length} orders`);
            console.log(`  Asks: ${orderbook.asks.length} orders`);
            if (orderbook.bids.length > 0) {
                console.log(`  Best Bid: ${orderbook.bids[0][0]} (${orderbook.bids[0][1]})`);
            }
            if (orderbook.asks.length > 0) {
                console.log(`  Best Ask: ${orderbook.asks[0][0]} (${orderbook.asks[0][1]})`);
            }
            console.log('');

            // Test 5: Fetch Recent Trades
            console.log(`📍 Test 5: Fetching recent trades for ${symbol}...`);
            try {
                const trades = await exchange.fetchTrades(symbol, undefined, 5);
                console.log(`✅ Found ${trades.length} recent trades`);
                if (trades.length > 0) {
                    const trade = trades[0];
                    console.log('  Latest trade:');
                    console.log(`    Price: ${trade.price}`);
                    console.log(`    Amount: ${trade.amount}`);
                    console.log(`    Side: ${trade.side}`);
                    console.log(`    Time: ${trade.datetime}`);
                }
            } catch (e) {
                console.log('⚠️  fetchTrades not fully implemented:', e.message);
            }
            console.log('');

            // Test 6: Fetch OHLCV (Candlestick Data)
            console.log(`📍 Test 6: Fetching OHLCV data for ${symbol}...`);
            try {
                const ohlcv = await exchange.fetchOHLCV(symbol, '1h', undefined, 5);
                console.log(`✅ Found ${ohlcv.length} candles`);
                if (ohlcv.length > 0) {
                    const candle = ohlcv[ohlcv.length - 1];
                    console.log('  Latest candle:');
                    console.log(`    Open: ${candle[1]}`);
                    console.log(`    High: ${candle[2]}`);
                    console.log(`    Low: ${candle[3]}`);
                    console.log(`    Close: ${candle[4]}`);
                    console.log(`    Volume: ${candle[5]}`);
                }
            } catch (e) {
                console.log('⚠️  fetchOHLCV error:', e.message);
            }
            console.log('');
        }

        console.log('='.repeat(70));
        console.log('✅ All public tests completed successfully!');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

async function demonstratePrivateEndpointRequirements() {
    console.log('');
    console.log('='.repeat(70));
    console.log('Private API Operations (Require Private Key)');
    console.log('='.repeat(70));
    console.log('');
    console.log('The following operations CANNOT be tested without a private key:');
    console.log('');
    console.log('❌ fetchBalance()');
    console.log('   Reason: Requires ECDSA signature with private key');
    console.log('   Use case: Check account balances');
    console.log('');
    console.log('❌ fetchPositions()');
    console.log('   Reason: Requires ECDSA signature with private key');
    console.log('   Use case: Check open positions in futures markets');
    console.log('');
    console.log('❌ fetchOrders()');
    console.log('   Reason: Requires ECDSA signature with private key');
    console.log('   Use case: Check order history and open orders');
    console.log('');
    console.log('❌ fetchMyTrades()');
    console.log('   Reason: Requires ECDSA signature with private key');
    console.log('   Use case: Check personal trade history');
    console.log('');
    console.log('❌ createOrder()');
    console.log('   Reason: Requires ECDSA signature with private key');
    console.log('   Use case: Place trades');
    console.log('');
    console.log('Note: fetchDeposits() and fetchWithdrawals() are not supported');
    console.log('      by AsterDEX (see asterdex.js lines 59, 98)');
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log('To test private operations, you need to initialize with:');
    console.log('');
    console.log('const exchange = new ccxt.asterdex({');
    console.log('    walletAddress: "0x06964466831ac13f351bD84fc2669572A59E0F24",');
    console.log('    privateKey: "YOUR_PRIVATE_KEY_HERE",');
    console.log('});');
    console.log('');
    console.log('⚠️  SECURITY WARNING: Never commit private keys to version control!');
    console.log('='.repeat(70));
}

// Run tests
runPublicTests()
    .then(() => demonstratePrivateEndpointRequirements())
    .then(() => {
        console.log('');
        console.log('Test suite completed.');
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
