- [Hyperliquid Load Hip3 Dexes](./examples/ts/)


 ```javascript
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
    Object.values (exchange.markets).filter ((p) => p['info']['hip3']).forEach ((market) => {
        console.log (market['symbol'], 'from DEX');
    });
}
await example ();
 
```