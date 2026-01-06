import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.hyperliquid ({
        'options': {
            'fetchMarkets': {
                'hip3': {
                    'dexes': [ 'flx', 'xyz' ], // optionally specify dexes to load here,
                    'limit': 10, // otherwise limit how many dexes to load, won't be used if dexes are specified
                },
            },
        },
    });

    await exchange.loadMarkets ();
    const markets = Object.values (exchange.markets);
    for (let i = 0; i < markets.length; i++) {
        const market = markets[i];
        if (market['info']['hip3']) {
            console.log (market['symbol'], 'from DEX');
        }
    }
}
await example ();
