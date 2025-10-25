import ccxt from '../../ts/ccxt.ts';

/**
 * Test SBE implementation for Binance trades endpoint
 * Compares SBE-encoded response with JSON response to verify they match
 */

async function testBinanceSbeTrades () {
    const symbol = 'BTC/USDT';
    const limit = 10;

    console.log ('========================================');
    console.log ('Testing Binance SBE Trades Implementation');
    console.log ('========================================\n');

    // Create two instances - one with SBE, one without
    const exchangeWithSbe = new ccxt.binance ({
        'options': {
            'useSbe': true,
            'sbeSchemaId': 3,
            'sbeSchemaVersion': 1,
            'verbose': true,
        },
    });

    const exchangeWithoutSbe = new ccxt.binance ({
        'options': {
            'useSbe': false,
        },
    });

    try {
        // Pre-load SBE schema for the SBE-enabled exchange
        console.log ('Initializing SBE schema...');
        try {
            exchangeWithSbe.getSbeDecoder ();
            console.log ('✓ SBE schema loaded successfully\n');
        } catch (e: unknown) {
            const error = e as Error;
            console.error ('✗ Failed to load SBE schema:', error.message);
            console.log ('Make sure sbe/binance/spot_3_1.xml exists\n');
            return;
        }

        console.log (`Fetching ${limit} trades for ${symbol}...\n`);

        // Fetch trades with SBE
        console.log ('1. Fetching with SBE enabled...');
        const startSbe = Date.now ();
        const tradesWithSbe = await exchangeWithSbe.fetchTrades (symbol, undefined, limit, {
            'fetchTradesMethod': 'publicGetTrades',
        });
        const timeSbe = Date.now () - startSbe;
        console.log (`   ✓ Received ${tradesWithSbe.length} trades (${timeSbe}ms)`);

        // Fetch trades without SBE (regular JSON)
        console.log ('2. Fetching with SBE disabled (JSON)...');
        const startJson = Date.now ();
        const tradesWithoutSbe = await exchangeWithoutSbe.fetchTrades (symbol, undefined, limit, {
            'fetchTradesMethod': 'publicGetTrades',
        });
        const timeJson = Date.now () - startJson;
        console.log (`   ✓ Received ${tradesWithoutSbe.length} trades (${timeJson}ms)`);

        // Compare results
        console.log ('\n3. Comparing results...');
        console.log (`   SBE trades count: ${tradesWithSbe.length}`);
        console.log (`   JSON trades count: ${tradesWithoutSbe.length}`);

        if (tradesWithSbe.length !== tradesWithoutSbe.length) {
            console.error ('   ✗ Trade counts do not match!');
            return;
        }

        // Compare each trade
        let allMatch = true;
        const differences = [];

        for (let i = 0; i < tradesWithSbe.length; i++) {
            const sbeTrade = tradesWithSbe[i];
            const jsonTrade = tradesWithoutSbe[i];

            // Compare key fields
            const fieldsToCompare = [ 'id', 'timestamp', 'symbol', 'price', 'amount', 'side', 'takerOrMaker' ];

            for (let j = 0; j < fieldsToCompare.length; j++) {
                const field = fieldsToCompare[j];
                if (sbeTrade[field] !== jsonTrade[field]) {
                    allMatch = false;
                    differences.push ({
                        'tradeIndex': i,
                        'field': field,
                        'sbeValue': sbeTrade[field],
                        'jsonValue': jsonTrade[field],
                    });
                }
            }
        }

        if (allMatch) {
            console.log ('   ✓ All trades match!\n');
        } else {
            console.log ('   ✗ Found differences:\n');
            differences.forEach ((diff) => {
                console.log (`     Trade #${diff.tradeIndex}, field "${diff.field}":`);
                console.log (`       SBE:  ${diff.sbeValue}`);
                console.log (`       JSON: ${diff.jsonValue}`);
            });
        }

        // Display sample trade data
        console.log ('4. Sample trade data:\n');
        console.log ('   SBE Trade:');
        console.log ('   ', JSON.stringify (tradesWithSbe[0], null, 2).replace (/\n/g, '\n    '));
        console.log ('');
        console.log ('   JSON Trade:');
        console.log ('   ', JSON.stringify (tradesWithoutSbe[0], null, 2).replace (/\n/g, '\n    '));

        // Performance comparison
        console.log (`\n5. Performance comparison:`);
        console.log (`   SBE:  ${timeSbe}ms`);
        console.log (`   JSON: ${timeJson}ms`);
        console.log (`   Difference: ${Math.abs (timeSbe - timeJson)}ms (${timeSbe < timeJson ? 'SBE faster' : 'JSON faster'})`);

        console.log ('');
        console.log ('========================================');
        console.log (allMatch ? '✓ TEST PASSED' : '✗ TEST FAILED');
        console.log ('========================================');
        console.log ('');
    } catch (error: unknown) {
        const err = error as Error;
        console.error ('Error during test:');
        console.error (err);

        if (err.message && err.message.includes ('SBE')) {
            console.log ('');
            console.log ('Note: Make sure the SBE schema file exists at: sbe/binance/spot_3_1.xml');
        }
    }
}

testBinanceSbeTrades ();
