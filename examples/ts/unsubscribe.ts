import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const binance = new ccxt.pro.binance ({});
    binance.verbose = false;
    // --- WATCH TICKER ---
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
    console.log ('--- finished testing watchTicker --- ');

    // --- WATCH Multiple ---
    // Example 1: Unsubscribe after response
    const methodHash = 'watchTradesForSymbols::BTC/USDT,ETH/USDT';
    let trades = await binance.watchTradesForSymbols ([ 'BTC/USDT', 'ETH/USDT' ]);
    console.log ('trades received: ', trades);
    await binance.unsubscribe (methodHash);
    console.log ('unsubscribed');
    // Example 2: Unsubscribe while awaiting watch
    unsubscribed = false;
    setTimeout (async () => {
        await binance.unsubscribe (methodHash);
        unsubscribed = true;
        console.log ('Completed unsubscribe');
    }, 2000);
    while (unsubscribed === false) {
        trades = await binance.watchTradesForSymbols ([ 'BTC/USDT', 'ETH/USDT' ]);
        if (trades) console.log ('tickers received: ', trades);
        else console.log ('unsubscribed watchTickers');
    }
    console.log ('--- finished testing watchTickers --- ');

    // TODO: Test with partial unsubscribe
    // TODO: Test with no unsubscribe message sent
}

await example ();
