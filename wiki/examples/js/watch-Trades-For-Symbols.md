- [Watch Trades For Symbols](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const binance = new ccxt.pro.binance({});
    const symbols = ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT'];
    while (true) {
        const trades = await binance.watchTradesForSymbols(symbols);
        console.log(trades);
    }
}
await example();
 
```