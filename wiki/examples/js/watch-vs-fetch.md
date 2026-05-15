- [Watch Vs Fetch](./examples/js/)


 ```javascript
 // see this issue for details
// https://github.com/ccxt/ccxt/issues/6659
'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
const exchange = new ccxt.pro.kraken(); // eslint-disable-line import/no-named-as-default-member
function yellow(s) {
    return '\x1b[33m' + s + '\x1b[0m';
}
async function runWs() {
    while (true) { // eslint-disable-line no-constant-condition
        const book = await exchange.watchOrderBook('ETH/BTC');
        console.log(new Date(), 'WS  ', book['datetime'], book['bids'][0][0], book['asks'][0][0]);
    }
}
async function runRest() {
    while (true) { // eslint-disable-line no-constant-condition
        const book = await exchange.fetchOrderBook('ETH/BTC');
        const timestamp = new Date(exchange.last_response_headers['Date']).getTime();
        const datetime = exchange.iso8601(timestamp);
        console.log(new Date(), 'REST', yellow(datetime), book['bids'][0][0], book['asks'][0][0]);
    }
}
runWs();
runRest();
 
```