import ccxt from '../../ts/ccxt.js';

/**
 * Example: Fetching OKX orderbook using SBE (Simple Binary Encoding)
 *
 * OKX provides a high-performance orderbook endpoint using SBE binary encoding
 * which returns up to 400 levels of orderbook data with lower latency.
 *
 * Requirements:
 * - You need the instIdCode (instrument ID code) for your trading pair
 * - This endpoint is rate-limited to 10 requests per 10 seconds per IP + instIdCode
 * - Only users with certain trading fee tiers can access this endpoint
 *
 * How to get instIdCode:
 * You can get the instIdCode from OKX's public instruments endpoint:
 * GET /api/v5/public/instruments?instType=SPOT
 *
 * The response will include instIdCode for each instrument.
 */

async function main () {
    const exchange = new ccxt.okx ({
        'enableRateLimit': true,
        // 'verbose': true,
    });
    exchange.setSandboxMode (true);

    try {
        // Load markets first
        await exchange.loadMarkets ();

        // Example 1: Fetch SBE orderbook for BTC/USDT
        // Note: Replace 12345 with the actual instIdCode from OKX API
        console.log ('\n=== Example 1: Fetch SBE Orderbook ===');

        // Uncomment and replace instIdCode when you have the correct value:
        const orderbook = await exchange.fetchOrderBookSbe ('BTC/USDT');

        console.log ('Symbol:', orderbook.symbol);
        console.log ('Timestamp:', orderbook.timestamp);
        console.log ('Datetime:', orderbook.datetime);
        console.log ('Bids count:', orderbook.bids.length);
        console.log ('Asks count:', orderbook.asks.length);

        // Show top 5 bids and asks
        console.log ('\nTop 5 Bids:');
        for (let i = 0; i < Math.min (5, orderbook.bids.length); i++) {
            const [price, amount, ordCount] = orderbook.bids[i];
            console.log (`  ${price} | ${amount} | ${ordCount} orders`);
        }

        console.log ('\nTop 5 Asks:');
        for (let i = 0; i < Math.min (5, orderbook.asks.length); i++) {
            const [price, amount, ordCount] = orderbook.asks[i];
            console.log (`  ${price} | ${amount} | ${ordCount} orders`);
        }

        // Example 2: Fetch SBE orderbook with ELP source
        // ELP (Enhanced Liquidity Provider) source provides different liquidity
        console.log ('\n=== Example 2: Fetch SBE Orderbook with ELP Source ===');
        /*
        const orderbookElp = await exchange.fetchOrderBookSbe ('BTC/USDT', instIdCode, {
            'source': 1, // 1 for ELP, 0 for normal (default)
        });
        console.log ('ELP Orderbook fetched with', orderbookElp.bids.length, 'bids and', orderbookElp.asks.length, 'asks');
        */

        // Example 3: Compare with regular orderbook
        console.log ('\n=== Example 3: Compare with Regular Orderbook ===');
        const regularOrderbook = await exchange.fetchOrderBook ('BTC/USDT', 5);
        console.log ('Regular orderbook (JSON):');
        console.log ('  Bids count:', regularOrderbook.bids.length);
        console.log ('  Asks count:', regularOrderbook.asks.length);
        console.log ('  Top bid:', regularOrderbook.bids[0]);
        console.log ('  Top ask:', regularOrderbook.asks[0]);

        /*
        console.log ('\nSBE orderbook (binary):');
        console.log ('  Bids count:', orderbook.bids.length);
        console.log ('  Asks count:', orderbook.asks.length);
        console.log ('  Top bid:', orderbook.bids[0]);
        console.log ('  Top ask:', orderbook.asks[0]);

        console.log ('\nAdvantages of SBE:');
        console.log ('  - Binary encoding = smaller payload');
        console.log ('  - Lower latency');
        console.log ('  - Up to 400 levels (vs 400 max with regular)');
        console.log ('  - Buffered updates (~500ms)');
        */

        console.log ('\n=== How to Get instIdCode ===');
        console.log ('To get the instIdCode for a symbol, you can:');
        console.log ('1. Use OKX API: GET /api/v5/public/instruments?instType=SPOT');
        console.log ('2. Look for the "instIdCode" field in the response');
        console.log ('3. Example response:');
        console.log ('   {');
        console.log ('     "instId": "BTC-USDT",');
        console.log ('     "instIdCode": "12345",');
        console.log ('     ...other fields');
        console.log ('   }');

    } catch (error) {
        console.error ('Error:', error);
    }

    await exchange.close ();
}

main ();
