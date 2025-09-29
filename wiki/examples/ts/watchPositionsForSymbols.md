- [Watchpositionsforsymbols](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.pro.binanceusdm ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'Your_API_SECRET'
    });
    const symbols = [ 'BTC/USDT:USDT', 'ETH/USDT:USDT', 'DOGE/USDT:USDT' ];
    while (true) {
        const trades = await exchange.watchPositions (symbols);
        console.log (trades);
    }
}
await example ();
 
```