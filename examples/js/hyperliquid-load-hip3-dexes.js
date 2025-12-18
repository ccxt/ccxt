import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const exchange = new ccxt.hyperliquid({
        'options': {
            'fetchMarkets': {
                'hip3': {
                    'dexes': ['flx', 'xyz'],
                    'limit': 10, // otherwise limit how many dexes to load, won't be used if dexes are specified
                },
            },
        },
    });
    await exchange.loadMarkets();
    Object.values(exchange.markets).filter((p) => p['info']['hip3']).forEach((market) => {
        console.log(market['symbol'], 'from DEX');
    });
}
await example();
