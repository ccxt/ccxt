'use strict';
const ccxt      = require ('../../ccxt.js');
const initExchange = function (exchangeName) {
    return new ccxt[exchangeName]();
}

// AUTO-TRANSPILE //

async function myfunc () {
    const symbol = 'BTC/USDT';
    const timeframe = '1h';
    const exchange = initExchange ('binance');
    const ohlcv = await exchange.fetchOHLCV (symbol, timeframe);
    const length = ohlcv.length;
    if (length > 0) {
        const firstPrice = ohlcv[0][4];
        const lastPrice = ohlcv[length - 1][4];
        const firstTime = ohlcv[0][0];
        const lastTime = ohlcv[length - 1][0];
        console.log ("Fetched " + length + " candles for " + exchange.id + ": first price " + firstPrice + " at " + exchange.iso8601 (firstTime) + ";  last price " + lastPrice + " at " + exchange.iso8601 (lastTime));
    } else {
        console.log ("Fetched no candles for " + exchange.id);
    }
}

myfunc();