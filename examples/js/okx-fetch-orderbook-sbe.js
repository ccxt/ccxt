/**
 * Example: Fetch OKX orderbook using SBE (Simple Binary Encoding)
 *
 * This example demonstrates how to use OKX's high-performance SBE orderbook endpoint
 * which provides up to 400 levels of orderbook data with lower latency than JSON.
 */

import ccxt from '../../js/ccxt.js';

async function main () {
    console.log ('=== OKX fetchOrderBookSbe Example ===\n');

    const exchange = new ccxt.okx ({
        'enableRateLimit': true,
    });

    try {
        // Load markets
        console.log ('Loading markets...');
        await exchange.loadMarkets ();
        console.log ('Markets loaded.\n');

        // Step 1: Get the instIdCode for BTC/USDT
        // The instIdCode is required for the SBE endpoint
        console.log ('Step 1: Getting instIdCode for BTC/USDT');
        const symbol = 'BTC/USDT';
        const market = exchange.market (symbol);

        // For OKX, we need to call their public instruments endpoint to get instIdCode
        // This is exchange-specific metadata
        console.log ('Fetching instrument details...');
        const instruments = await exchange.publicGetPublicInstruments ({
            'instType': 'SPOT',
            'instId': market['id'], // BTC-USDT
        });

        if (!instruments['data'] || instruments['data'].length === 0) {
            throw new Error ('Could not fetch instrument data');
        }

        const instIdCode = parseInt (instruments['data'][0]['instIdCode']);
        console.log (`✓ Found instIdCode for ${symbol}: ${instIdCode}\n`);

        // Step 2: Fetch orderbook using SBE
        console.log (`Step 2: Fetching SBE orderbook for ${symbol}`);
        console.log ('This uses binary encoding for better performance...');

        const startTime = Date.now ();
        const orderbook = await exchange.fetchOrderBookSbe (symbol, instIdCode);
        const elapsed = Date.now () - startTime;

        console.log (`✓ Orderbook fetched in ${elapsed}ms\n`);

        // Step 3: Display results
        console.log ('=== Orderbook Data ===');
        console.log (`Symbol: ${orderbook['symbol']}`);
        console.log (`Timestamp: ${orderbook['timestamp']} (${new Date (orderbook['timestamp']).toISOString ()})`);
        console.log (`Datetime: ${orderbook['datetime']}`);
        console.log (`Bids: ${orderbook['bids'].length} levels`);
        console.log (`Asks: ${orderbook['asks'].length} levels`);

        // Display top 10 bids and asks
        console.log ('\n=== Top 10 Bids (Best Buyers) ===');
        console.log ('Price         | Amount        | Orders');
        console.log ('------------------------------------------------');
        for (let i = 0; i < Math.min (10, orderbook['bids'].length); i++) {
            const [price, amount, ordCount] = orderbook['bids'][i];
            console.log (`${price.toString ().padEnd (13)} | ${amount.toString ().padEnd (13)} | ${ordCount}`);
        }

        console.log ('\n=== Top 10 Asks (Best Sellers) ===');
        console.log ('Price         | Amount        | Orders');
        console.log ('------------------------------------------------');
        for (let i = 0; i < Math.min (10, orderbook['asks'].length); i++) {
            const [price, amount, ordCount] = orderbook['asks'][i];
            console.log (`${price.toString ().padEnd (13)} | ${amount.toString ().padEnd (13)} | ${ordCount}`);
        }

        // Step 4: Compare with regular JSON orderbook
        console.log ('\n=== Comparison with Regular JSON Orderbook ===');
        const startTimeJson = Date.now ();
        const regularOrderbook = await exchange.fetchOrderBook (symbol, 10);
        const elapsedJson = Date.now () - startTimeJson;

        console.log (`SBE Orderbook: ${elapsed}ms, ${orderbook['bids'].length + orderbook['asks'].length} levels`);
        console.log (`JSON Orderbook: ${elapsedJson}ms, ${regularOrderbook['bids'].length + regularOrderbook['asks'].length} levels`);

        console.log ('\nSBE Advantages:');
        console.log ('  ✓ Binary encoding = smaller payload');
        console.log ('  ✓ Up to 400 levels (JSON typically limited)');
        console.log ('  ✓ Lower latency');
        console.log ('  ✓ Order count information included');

        // Step 5: Try with ELP source (Enhanced Liquidity Provider)
        console.log ('\n=== Testing with ELP Source ===');
        console.log ('ELP provides additional liquidity from market makers...');
        const orderbookElp = await exchange.fetchOrderBookSbe (symbol, instIdCode, {
            'source': 1, // 1 = ELP, 0 = normal (default)
        });
        console.log (`✓ ELP Orderbook fetched: ${orderbookElp['bids'].length} bids, ${orderbookElp['asks'].length} asks`);

        console.log ('\n=== Example Complete ===');
        console.log ('The SBE adapter successfully decoded binary orderbook data!');

    } catch (error) {
        console.error ('Error:', error.constructor.name, error.message);

        if (error.message.includes ('fetchOrderBookSbe')) {
            console.log ('\nNote: Make sure you are using the latest version with SBE support.');
        }

        if (error.message.includes ('rate limit') || error.message.includes ('429')) {
            console.log ('\nNote: Rate limit reached. Try again in a few seconds.');
        }
    } finally {
        await exchange.close ();
    }
}

main ();
