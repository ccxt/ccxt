import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const binance = new ccxt.pro.binance ({});
    binance.verbose = false;
    // Example 1: Unsubscribe after response
    let ticker = await binance.watchTicker ('BTC/USDT');
    console.log ('ticker received: ', ticker['last']);
    await binance.unsubscribe ('watchTicker::BTC/USDT');
    console.log ('unsubscribed');
    // Example 2: Unsubscribe while awaiting watch
    let unsubscribed = false;
    setTimeout (async () => {
        await binance.unsubscribe ('watchTicker::BTC/USDT');
        unsubscribed = true;
        console.log ('Completed unsubscribe');
    }, 2000);
    while (unsubscribed === false) {
        ticker = await binance.watchTicker ('BTC/USDT');
        if (ticker) console.log ('ticker received: ', ticker['last']);
        else console.log ('unsubscribed watchTicker');
    }
    console.log ('--- finished --- ');
}

await example ();
