- [Watch Orderbook For Symbols](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const binance = new ccxt.pro.binance ({});
    const symbols = [ 'BTC/USDT', 'ETH/USDT', 'DOGE/USDT' ];
    while (true) {
        const orderbook = await binance.watchOrderBookForSymbols (symbols);
        console.log (orderbook['symbol'], orderbook['asks'][0], orderbook['bids'][0]);
    }
}
await example ();
 
```