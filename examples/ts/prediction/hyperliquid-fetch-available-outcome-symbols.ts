import ccxt from '../../../js/ccxt.js';

async function example () {
    const exchange = new ccxt.prediction.hyperliquid ({
        'sandboxMode': true,
    });

    await exchange.loadMarkets ();
    const candidates = Object.keys (exchange.outcomes);
    console.log (candidates);
}
await example ();
