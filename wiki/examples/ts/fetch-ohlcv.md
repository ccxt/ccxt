- [Fetch Ohlcv](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const myex = new ccxt.okx ({});
    const fromTimestamp = myex.milliseconds () - 86400 * 1000;// last 24 hrs
    const ohlcv = await myex.fetchOHLCV ('BTC/USDT', '1m', fromTimestamp, 3, { 'whatever': 123 });
    const length = ohlcv.length;
    if (length > 0) {
        const lastPrice = ohlcv[length - 1][4];
        console.log ('Fetched ', length, ' candles for ', myex.id, ':  last close ', lastPrice);
    } else {
        console.log ('No candles have been fetched');
    }
}
await example ();
 
```