import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.hyperliquid ({
        'options': {
            'fetchMarkets': {
                'hip3': {
                    'dexes': [ 'flx', 'xyz' ], // optionally specify dexes to load here
                },
            },
        },
    });

    await exchange.loadMarkets ();
    Object.values (exchange.markets).filter ((p) => p['info']['hip3']).forEach ((market) => {
        console.log (market['symbol'], 'from DEX', market['info']['hip3']['dex']);
    });
}
await example ();
