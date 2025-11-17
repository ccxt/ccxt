import ccxt from '../../js/ccxt.js';

/**
 * Simple example of using Binance with SBE encoding
 */

async function main () {
    // Create exchange instance with SBE enabled
    const exchange = new ccxt.binance ({
        'options': {
            'useSbe': true,          // Enable SBE
            'sbeSchemaId': 3,        // Binance SBE schema ID
            'sbeSchemaVersion': 1,   // Binance SBE schema version
        },
    });

    try {
        // Pre-load the SBE schema before making any API calls
        console.log ('Initializing SBE schema...');
        exchange.getSbeDecoder ();
        console.log ('✓ SBE schema loaded successfully\n');

        const symbol = 'BTC/USDT';
        const limit = 5;

        console.log (`Fetching ${limit} recent trades for ${symbol} using SBE...`);

        // Fetch trades using SBE (must specify publicGetTrades method)
        const trades = await exchange.fetchTrades (symbol, undefined, limit, {
            'fetchTradesMethod': 'publicGetTrades',  // Use /api/v3/trades endpoint
        });

        console.log (`\nReceived ${trades.length} trades:\n`);

        trades.forEach ((trade, index) => {
            console.log (`Trade ${index + 1}:`);
            console.log (`  ID:        ${trade.id}`);
            console.log (`  Price:     ${trade.price}`);
            console.log (`  Amount:    ${trade.amount}`);
            console.log (`  Side:      ${trade.side}`);
            console.log (`  Timestamp: ${trade.datetime}`);
            console.log ('');
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error ('Error:', err.message);

        if (err.message && err.message.includes ('SBE')) {
            console.log ('');
            console.log ('Troubleshooting:');
            console.log ('1. Make sure the SBE schema file exists at: sbe/binance/spot_3_1.xml');
            console.log ('2. Check that the schema file is valid XML');
            console.log ('3. Verify the schema ID and version match the file');
        }
    }
}

main ();
