- [Basic Orderbook Polling](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

const id = 'huobipro', exchange = new ccxt[id] ({ enableRateLimit: true }), symbol = 'ETH/BTC';(async function main () {

    await exchange.loadMarkets ()

    for (let i = 0; i < 2000; i++) {

        const orderbook = await exchange.fetchOrderBook (symbol)
        console.log (new Date (), i, symbol, orderbook.asks[0], orderbook.bids[0])
    }

}) () 
```