- [Build Ohlcv Many Symbols](./examples/js/)


 ```javascript
 'use strict';
import asTable from 'as-table';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version);
asTable.configure({ 'delimiter': ' | ' });
async function loop(exchange, symbol, timeframe, completeCandlesOnly = false) {
    const durationInSeconds = exchange.parseTimeframe(timeframe);
    const durationInMs = durationInSeconds * 1000;
    while (true) {
        try {
            const trades = await exchange.watchTrades(symbol);
            if (trades.length > 0) {
                const currentMinute = Math.floor(exchange.milliseconds() / durationInMs);
                let ohlcvc = exchange.buildOHLCVC(trades, timeframe);
                if (completeCandlesOnly) {
                    ohlcvc = ohlcvc.filter((candle) => Math.floor(candle[0] / durationInMs) < currentMinute);
                }
                if (ohlcvc.length > 0) {
                    console.log('Symbol:', symbol, 'timeframe:', timeframe);
                    console.log('-----------------------------------------------------------');
                    console.log(asTable(ohlcvc));
                    console.log('-----------------------------------------------------------');
                }
            }
        }
        catch (e) {
            console.log(symbol, e);
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}
async function main() {
    // select the exchange
    const exchange = new ccxt.pro.okx();
    if (exchange.has['watchTrades']) {
        await exchange.loadMarkets();
        // Change this value accordingly
        const timeframe = '1m';
        // arbitrary n symbols
        const selectedSymbols = ['BTC/USDT', 'LTC/USDT']; // or random 3 pairs: exchange.symbols.slice(0, 3);
        console.log(selectedSymbols);
        // Use this variable to choose if only complete candles ;
        // should be considered
        const completeCandlesOnly = true;
        await Promise.all(selectedSymbols.map((symbol) => loop(exchange, symbol, timeframe, completeCandlesOnly)));
    }
    else {
        console.log(exchange.id, 'does not support watchTrades yet');
    }
}
main();
 
```