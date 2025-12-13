import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const myex = new ccxt.okx ({
        'rollingWindowSize': 10000, // switching to rolling window algorithm with 10 seconds window
    });

    const trades = await myex.fetchOHLCV ('BTC/USDT');
    console.log (trades);
}
await example ();
