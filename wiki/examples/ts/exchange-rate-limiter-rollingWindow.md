- [Exchange Rate Limiter Rollingwindow](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const myex = new ccxt.okx ({
        'rateLimiterAlgorithm': 'rollingWindow', // switching to rolling window algorithm
        'rollingWindowSize': 10000, // setting the rolling window size to 10 seconds
    });

    const trades = await myex.fetchOHLCV ('BTC/USDT');
    console.log (trades);
}
await example ();
 
```