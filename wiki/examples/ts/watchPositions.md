- [Watchpositions](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.pro.binanceusdm ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET'
    });
    while (true) {
        const trades = await exchange.watchPositions ();
        console.log (trades);
    }
}
await example ();
 
```