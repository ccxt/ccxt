'use strict';
const ccxt = require ('../../ccxt.js');

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt['binance']({});
    const ohlcv = await exchange.fetchOHLCV ('BTC/USDT', '1h');
    const length = ohlcv.length;
    if (length > 0) {
        const lastPrice = ohlcv[length - 1][4];
        console.log ("Fetched " + length + " candles for " + exchange.id + ":  latest price " + lastPrice);
    } else {
        console.log ("No candles have been fetched");
    }
}

example();
