- [Watchohlcvforsymbols](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const binance = new ccxt.pro.binance({});
    const subscriptions = [
        ['BTC/USDT', '5m'],
        ['ETH/USDT', '5m'],
        ['BTC/USDT', '1h'],
    ];
    while (true) {
        const ohlcv = await binance.watchOHLCVForSymbols(subscriptions);
        console.log(ohlcv);
    }
}
await example();
 
```