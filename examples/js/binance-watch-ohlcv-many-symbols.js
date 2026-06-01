'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
function handle(exchange, symbol, timeframe, candles) {
    const lastCandle = candles[candles.length - 1];
    const lastClosingPrice = lastCandle[4];
    console.log(new Date(), exchange.id, timeframe, symbol, '\t', lastClosingPrice);
}
async function loop(exchange, symbol, timeframe) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const candles = await exchange.watchOHLCV(symbol, timeframe);
            handle(exchange, symbol, timeframe, candles);
        }
        catch (e) {
            console.log(e);
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}
async function main() {
    const exchange = new ccxt.pro.binance(); // eslint-disable-line import/no-named-as-default-member
    //
    // WARNING: when using all the markets mind subscription limits!
    // don't attempt to subscribe to all of them
    // the exchanges will not allow that in general
    // instead, specify a shorter list of symbols to subscribe to
    //
    if (exchange.has['watchOHLCV']) {
        await exchange.loadMarkets();
        const timeframe = '15m';
        // many symbols
        await Promise.all(exchange.symbols.map((symbol) => loop(exchange, symbol, timeframe)));
        //
        // or
        //
        // const symbols = [ 'BTC/USDT', 'ETH/USDT' ] // specific symbols
        // await Promise.all (symbols.map (symbol => loop (exchange, symbol, timeframe)))
        //
        // or
        //
        // await loop (exchange, 'BTC/USDT', timeframe) // one symbol
    }
    else {
        console.log(exchange.id, 'does not support watchOHLCV yet');
    }
}
main();
