// @NO_AUTO_TRANSPILE
'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version);
async function loop(exchange, symbol, timeframe, i) {
    await exchange.throttle(1000 * i); // 1000ms delay between subscriptions
    while (true) {
        try {
            const candles = await exchange.watchOHLCV(symbol, timeframe);
            console.log('do something with candles...', candles.length);
        }
        catch (e) {
            console.log(e); // do nothing and retry on next loop iteration
            // throw e // break all loops in case of an error in any one of them
            // break // silently break only this one loop
        }
    }
}
async function example() {
    const exchange = new ccxt.pro.binance();
    //
    // WARNING: because of subscription limits, exchanges might not allow to subscribe
    // to all markets at once - better to specify a shorter list of symbols
    //
    if (exchange.has['watchOHLCV']) {
        await exchange.loadMarkets();
        const timeframe = '15m';
        const mySymbols = ['BTC/USDT', 'ETH/USDT']; // or use "exchange.symbols" for all symbols
        const allPromises = [];
        for (let i = 0; i < mySymbols.length; i++) {
            allPromises.push(loop(exchange, mySymbols[i], timeframe, i));
        }
        await Promise.all(allPromises);
    }
    else {
        console.log(exchange.id, 'does not support watchOHLCV yet');
    }
}
example();
