- [Watch Ohlcv](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const binance = new ccxt.pro.binance({});
    const symbol = 'BTC/USDT';
    const timeframe = '1m';
    while (true) {
        const ohlcv = await binance.watchOHLCV(symbol, timeframe);
        console.log(ohlcv);
    }
}
await example();
 
```