- [Watch Tickers](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const binance = new ccxt.pro.binance({});
    const symbols = ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT'];
    while (true) {
        const tickers = await binance.watchTickers(symbols);
        console.log(tickers['BTC/USDT'], tickers['ETH/USDT'], tickers['DOGE/USDT']);
    }
}
await example();
 
```