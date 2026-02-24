- [How To Import One Exchange Esm](./examples/ts/)


 ```javascript
 import { binance } from '../../js/ccxt.js';

async function example () {
    const exchange = new binance ({});
    const ob = await exchange.fetchOrderBook ('BTC/USDT', 3);
    const asks = ob['asks'];
    const bids = ob['bids'];
    console.log (asks);
    console.log (bids);
}
example ();
 
```