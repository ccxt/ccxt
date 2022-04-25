"use strict";

const ccxt = require ('../../ccxt.js');

async function main () {
    
    const exchange = new ccxt.binanceusdm ();
    const markets = await exchange.loadMarkets ();
    const timeframe = '1h';
    
    const allSwapSymbols = exchange.symbols.filter (symbol => exchange.market (symbol)['swap'] );
    const ohlcvs = await Promise.all (allSwapSymbols.map (async (symbol) => {
        const ohlcv = await exchange.fetchOHLCV (symbol, timeframe, undefined, 1);
        ohlcv[0].push (symbol);
        return ohlcv[0];
    }));

    const priceChanges = ohlcvs.map (ohlcv => {
        const open = ohlcv[1];
        const close = ohlcv[4];
        const symbol = ohlcv[6];
        const priceIncrease = close - open;
        const increaseAsRatio = priceIncrease / open;
        return [increaseAsRatio, symbol]
    });
    const sorted = priceChanges.sort ();
    console.dir(sorted, {'maxArrayLength': null})
}

main ()