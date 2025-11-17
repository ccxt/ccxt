#!/usr/bin/env node
/**
 * Comprehensive AsterDEX Test Suite - JavaScript
 *
 * Tests all public and private methods for AsterDEX exchange
 * Safe for testing - uses small amounts and includes dry-run options
 */

import ccxt from './js/ccxt.js';

// ============================================================================
// CONFIGURATION - SET YOUR CREDENTIALS HERE
// ============================================================================

const CONFIG = {
    // Required: Your wallet address
    walletAddress: '0x06964466831ac13f351bD84fc2669572A59E0F24',

    // Required for private methods: Your private key (without 0x prefix)
    // ⚠️  WARNING: NEVER commit this file with your real private key!
    // ⚠️  Use environment variables in production: process.env.PRIVATE_KEY
    privateKey: 'YOUR_PRIVATE_KEY_HERE',

    // Test configuration
    testPrivateMethods: false,  // Set to true when you add your private key
    testOrderPlacement: false,  // Set to true to test order creation (uses real funds!)

    // Trading parameters for order tests (if enabled)
    testSymbol: 'BTC/USDT',     // Symbol to use for order tests
    testAmount: 0.001,          // Small amount for testing
    testPrice: 20000,           // Limit price (set safely below/above market)

    // API options
    enableRateLimit: true,
    timeout: 30000,
};

// ============================================================================
// TEST SUITE
// ============================================================================

class AsterDEXTestSuite {
    constructor(config) {
        this.config = config;
        this.exchange = null;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: []
        };
    }

    // Initialize exchange
    async init() {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║     AsterDEX Comprehensive Test Suite - JavaScript           ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('');

        const credentials = {
            enableRateLimit: this.config.enableRateLimit,
            timeout: this.config.timeout,
        };

        if (this.config.testPrivateMethods) {
            if (!this.config.privateKey || this.config.privateKey === 'YOUR_PRIVATE_KEY_HERE') {
                console.log('❌ ERROR: Private key not configured!');
                console.log('   Set CONFIG.privateKey to test private methods.');
                console.log('   Or set CONFIG.testPrivateMethods = false to skip.');
                process.exit(1);
            }
            credentials.walletAddress = this.config.walletAddress;
            credentials.privateKey = this.config.privateKey;
            console.log('🔐 Authentication: ENABLED');
            console.log('   Wallet:', this.config.walletAddress);
        } else {
            console.log('📖 Authentication: DISABLED (public methods only)');
            console.log('   Wallet:', this.config.walletAddress);
        }

        console.log('');
        this.exchange = new ccxt.asterdex(credentials);

        // Load markets first
        console.log('📥 Loading markets...');
        try {
            await this.exchange.loadMarkets();
            console.log('✅ Markets loaded successfully');
            console.log('');
        } catch (error) {
            console.log('❌ Failed to load markets:', error.message);
            console.log('   The exchange API may be offline or unreachable.');
            console.log('');
        }
    }

    // Test runner helper
    async runTest(name, fn, requiresAuth = false, category = 'General') {
        this.results.total++;
        const testNum = this.results.total;

        console.log(`[${ testNum}] ${category} → ${name}`);

        if (requiresAuth && !this.config.testPrivateMethods) {
            console.log('    ⏭️  SKIPPED (requires authentication)\n');
            this.results.skipped++;
            this.results.tests.push({ name, status: 'skipped', category });
            return null;
        }

        try {
            const startTime = Date.now();
            const result = await fn();
            const duration = Date.now() - startTime;

            console.log(`    ✅ PASSED (${duration}ms)`);
            this.displayResult(result);
            console.log('');

            this.results.passed++;
            this.results.tests.push({ name, status: 'passed', category, duration, result });
            return result;
        } catch (error) {
            console.log(`    ❌ FAILED: ${error.message}`);
            if (error.stack) {
                console.log(`    Stack: ${error.stack.split('\n')[1]?.trim()}`);
            }
            console.log('');

            this.results.failed++;
            this.results.tests.push({ name, status: 'failed', category, error: error.message });
            return null;
        }
    }

    // Display result helper
    displayResult(result) {
        if (result === null || result === undefined) {
            console.log('    Result: null');
            return;
        }

        if (typeof result === 'object') {
            if (Array.isArray(result)) {
                console.log(`    Result: Array(${result.length})`);
                if (result.length > 0 && result.length <= 3) {
                    result.forEach((item, idx) => {
                        console.log(`      [${idx}]:`, JSON.stringify(item, null, 2).split('\n').join('\n           '));
                    });
                } else if (result.length > 0) {
                    console.log(`      First item:`, JSON.stringify(result[0], null, 2).split('\n').join('\n           '));
                }
            } else {
                const keys = Object.keys(result);
                if (keys.length <= 5) {
                    console.log(`    Result:`, JSON.stringify(result, null, 2).split('\n').join('\n           '));
                } else {
                    console.log(`    Result: Object with ${keys.length} keys`);
                    console.log(`      Sample:`, JSON.stringify(Object.fromEntries(Object.entries(result).slice(0, 3)), null, 2).split('\n').join('\n           '));
                }
            }
        } else {
            console.log(`    Result: ${result}`);
        }
    }

    // ========================================================================
    // PUBLIC METHOD TESTS
    // ========================================================================

    async testPublicMethods() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('PUBLIC API TESTS (No Authentication Required)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Test fetchTime
        await this.runTest(
            'fetchTime()',
            async () => await this.exchange.fetchTime(),
            false,
            'Public'
        );

        // Test fetchStatus
        await this.runTest(
            'fetchStatus()',
            async () => await this.exchange.fetchStatus(),
            false,
            'Public'
        );

        // Test fetchMarkets
        const markets = await this.runTest(
            'fetchMarkets()',
            async () => await this.exchange.fetchMarkets(),
            false,
            'Public'
        );

        // Get a sample symbol for subsequent tests
        let sampleSymbol = this.config.testSymbol;
        if (markets && markets.length > 0) {
            sampleSymbol = markets[0].symbol;
            console.log(`    ℹ️  Using ${sampleSymbol} for subsequent tests\n`);
        }

        // Test fetchTicker
        await this.runTest(
            `fetchTicker('${sampleSymbol}')`,
            async () => await this.exchange.fetchTicker(sampleSymbol),
            false,
            'Public'
        );

        // Test fetchTickers
        await this.runTest(
            'fetchTickers()',
            async () => {
                const tickers = await this.exchange.fetchTickers();
                return Object.keys(tickers).length + ' tickers';
            },
            false,
            'Public'
        );

        // Test fetchOrderBook
        await this.runTest(
            `fetchOrderBook('${sampleSymbol}', 10)`,
            async () => await this.exchange.fetchOrderBook(sampleSymbol, 10),
            false,
            'Public'
        );

        // Test fetchTrades
        await this.runTest(
            `fetchTrades('${sampleSymbol}', limit=5)`,
            async () => await this.exchange.fetchTrades(sampleSymbol, undefined, 5),
            false,
            'Public'
        );

        // Test fetchOHLCV
        await this.runTest(
            `fetchOHLCV('${sampleSymbol}', '1h', limit=5)`,
            async () => await this.exchange.fetchOHLCV(sampleSymbol, '1h', undefined, 5),
            false,
            'Public'
        );

        // Test fetchFundingRate
        if (markets && markets.some(m => m.swap || m.future)) {
            const swapSymbol = markets.find(m => m.swap || m.future)?.symbol || sampleSymbol;
            await this.runTest(
                `fetchFundingRate('${swapSymbol}')`,
                async () => await this.exchange.fetchFundingRate(swapSymbol),
                false,
                'Public'
            );
        }

        // Test fetchFundingRates
        await this.runTest(
            'fetchFundingRates()',
            async () => await this.exchange.fetchFundingRates(),
            false,
            'Public'
        );

        // Test fetchFundingRateHistory
        await this.runTest(
            `fetchFundingRateHistory('${sampleSymbol}', limit=5)`,
            async () => await this.exchange.fetchFundingRateHistory(sampleSymbol, undefined, undefined, 5),
            false,
            'Public'
        );
    }

    // ========================================================================
    // PRIVATE METHOD TESTS (REQUIRE AUTHENTICATION)
    // ========================================================================

    async testPrivateMethods() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('PRIVATE API TESTS (Require Authentication)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        if (!this.config.testPrivateMethods) {
            console.log('⏭️  SKIPPED - Set CONFIG.testPrivateMethods = true to enable');
            console.log('');
            return;
        }

        // Test fetchBalance
        const balance = await this.runTest(
            'fetchBalance()',
            async () => await this.exchange.fetchBalance(),
            true,
            'Account'
        );

        // Test fetchAccounts (if supported)
        await this.runTest(
            'fetchAccounts()',
            async () => await this.exchange.fetchAccounts(),
            true,
            'Account'
        );

        // Get markets for trading tests
        const markets = this.exchange.markets;
        const sampleSymbol = Object.keys(markets)[0];

        // Test fetchOpenOrders
        await this.runTest(
            `fetchOpenOrders('${sampleSymbol}')`,
            async () => await this.exchange.fetchOpenOrders(sampleSymbol),
            true,
            'Orders'
        );

        // Test fetchOrders
        await this.runTest(
            `fetchOrders('${sampleSymbol}', limit=10)`,
            async () => await this.exchange.fetchOrders(sampleSymbol, undefined, 10),
            true,
            'Orders'
        );

        // Test fetchMyTrades
        await this.runTest(
            `fetchMyTrades('${sampleSymbol}', limit=10)`,
            async () => await this.exchange.fetchMyTrades(sampleSymbol, undefined, 10),
            true,
            'Trades'
        );

        // Test fetchPositions (for futures/swap)
        const swapMarkets = Object.values(markets).filter(m => m.swap || m.future);
        if (swapMarkets.length > 0) {
            await this.runTest(
                'fetchPositions()',
                async () => await this.exchange.fetchPositions(),
                true,
                'Positions'
            );

            const swapSymbol = swapMarkets[0].symbol;
            await this.runTest(
                `fetchPosition('${swapSymbol}')`,
                async () => await this.exchange.fetchPosition(swapSymbol),
                true,
                'Positions'
            );
        }

        // Test fetchPositionMode
        await this.runTest(
            'fetchPositionMode()',
            async () => await this.exchange.fetchPositionMode(),
            true,
            'Positions'
        );

        // Test fetchLeverage (if available)
        if (this.exchange.has['fetchLeverage']) {
            await this.runTest(
                `fetchLeverage('${sampleSymbol}')`,
                async () => await this.exchange.fetchLeverage(sampleSymbol),
                true,
                'Margin'
            );
        }

        // Test fetchLeverageTiers
        await this.runTest(
            'fetchLeverageTiers()',
            async () => await this.exchange.fetchLeverageTiers(),
            true,
            'Margin'
        );
    }

    // ========================================================================
    // ORDER MANAGEMENT TESTS (USE WITH CAUTION!)
    // ========================================================================

    async testOrderManagement() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('ORDER MANAGEMENT TESTS ⚠️  (Uses Real Funds!)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        if (!this.config.testOrderPlacement) {
            console.log('⏭️  SKIPPED - Set CONFIG.testOrderPlacement = true to enable');
            console.log('⚠️  WARNING: These tests place REAL orders with REAL funds!');
            console.log('');
            return;
        }

        if (!this.config.testPrivateMethods) {
            console.log('❌ Cannot test order management without authentication');
            console.log('');
            return;
        }

        console.log('⚠️  WARNING: The following tests will place REAL orders!');
        console.log('⚠️  Make sure you have set safe test parameters in CONFIG');
        console.log('');

        const symbol = this.config.testSymbol;
        const amount = this.config.testAmount;
        const price = this.config.testPrice;

        // Test createOrder (limit buy - far from market)
        const order = await this.runTest(
            `createOrder('${symbol}', 'limit', 'buy', ${amount}, ${price})`,
            async () => await this.exchange.createOrder(symbol, 'limit', 'buy', amount, price),
            true,
            'Trading'
        );

        if (order && order.id) {
            // Test fetchOrder
            await this.runTest(
                `fetchOrder('${order.id}', '${symbol}')`,
                async () => await this.exchange.fetchOrder(order.id, symbol),
                true,
                'Trading'
            );

            // Test cancelOrder
            await this.runTest(
                `cancelOrder('${order.id}', '${symbol}')`,
                async () => await this.exchange.cancelOrder(order.id, symbol),
                true,
                'Trading'
            );
        }

        // Test cancelAllOrders
        await this.runTest(
            `cancelAllOrders('${symbol}')`,
            async () => await this.exchange.cancelAllOrders(symbol),
            true,
            'Trading'
        );
    }

    // ========================================================================
    // MARGIN & LEVERAGE TESTS
    // ========================================================================

    async testMarginAndLeverage() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('MARGIN & LEVERAGE TESTS');
        console.log('═══════════════════════════════════════════════════════════════\n');

        if (!this.config.testPrivateMethods) {
            console.log('⏭️  SKIPPED - Requires authentication');
            console.log('');
            return;
        }

        const markets = this.exchange.markets;
        const swapMarkets = Object.values(markets).filter(m => m.swap || m.future);

        if (swapMarkets.length === 0) {
            console.log('⏭️  SKIPPED - No futures/swap markets available');
            console.log('');
            return;
        }

        const symbol = swapMarkets[0].symbol;

        // Note: Uncomment these if you want to actually change leverage/margin mode
        // These methods MODIFY your account settings!

        // await this.runTest(
        //     `setLeverage(10, '${symbol}')`,
        //     async () => await this.exchange.setLeverage(10, symbol),
        //     true,
        //     'Margin'
        // );

        // await this.runTest(
        //     `setMarginMode('isolated', '${symbol}')`,
        //     async () => await this.exchange.setMarginMode('isolated', symbol),
        //     true,
        //     'Margin'
        // );

        console.log('ℹ️  Leverage/Margin modification tests commented out for safety');
        console.log('   Uncomment in source if you want to test these methods');
        console.log('');
    }

    // ========================================================================
    // SUMMARY AND REPORTING
    // ========================================================================

    printSummary() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('TEST SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log(`Total Tests:   ${this.results.total}`);
        console.log(`✅ Passed:     ${this.results.passed}`);
        console.log(`❌ Failed:     ${this.results.failed}`);
        console.log(`⏭️  Skipped:    ${this.results.skipped}`);
        console.log('');

        if (this.results.failed > 0) {
            console.log('Failed Tests:');
            this.results.tests
                .filter(t => t.status === 'failed')
                .forEach(t => {
                    console.log(`  ❌ [${t.category}] ${t.name}`);
                    console.log(`     Error: ${t.error}`);
                });
            console.log('');
        }

        const successRate = this.results.total > 0
            ? ((this.results.passed / (this.results.total - this.results.skipped)) * 100).toFixed(1)
            : 0;

        console.log(`Success Rate: ${successRate}% (excluding skipped)`);
        console.log('');

        if (!this.config.testPrivateMethods) {
            console.log('💡 TIP: Set CONFIG.testPrivateMethods = true to test private methods');
            console.log('   (requires valid walletAddress and privateKey)');
            console.log('');
        }

        if (this.config.testPrivateMethods && !this.config.testOrderPlacement) {
            console.log('💡 TIP: Set CONFIG.testOrderPlacement = true to test order creation');
            console.log('   ⚠️  WARNING: This uses real funds! Set safe test parameters first.');
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════════════');
    }

    // Main test runner
    async run() {
        await this.init();
        await this.testPublicMethods();
        await this.testPrivateMethods();
        await this.testOrderManagement();
        await this.testMarginAndLeverage();
        this.printSummary();

        // Exit with error code if tests failed
        process.exit(this.results.failed > 0 ? 1 : 0);
    }
}

// ============================================================================
// RUN TESTS
// ============================================================================

const suite = new AsterDEXTestSuite(CONFIG);
suite.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
