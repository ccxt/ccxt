'use strict';
const ccxt      = require ('../../ccxt.js');
const initExchange = function (exchangeName) {
    return new ccxt[exchangeName]();
}

// AUTO-TRANSPILE //

async function myfunc () {
    const exchange = initExchange ('binance');
    const ohlcv = await exchange.fetchOHLCV ('BTC/USDT', '1h');
    const length = ohlcv.length;
    if (length > 0) {
        const lastPrice = ohlcv[length - 1][4];
        const lastTime = ohlcv[length - 1][0];
        console.log ("Fetched " + length + " candles for " + exchange.id + ":  last price " + lastPrice + " at " + exchange.iso8601 (lastTime));
    } else {
        console.log ("No candles have been fetched");
    }
}

myfunc();