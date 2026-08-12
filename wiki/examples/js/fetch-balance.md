```javascript
// @NO_AUTO_TRANSPILE
"use strict";
import ccxt from '../../js/ccxt.js';
// instantiate the exchange
let exchange = new ccxt.coinbaseexchange({
    'apiKey': 'XXXXXXXXXXXXXX',
    'secret': 'YYYYYYYYYYYYYY',
    'password': 'ZZZZZZ', // if exchange requires password
});
async function checkMyBalance() {
    try {
        // fetch account balance from the exchange
        let myBalance = await exchange.fetchBalance();
        // output the result
        console.log(exchange.id, 'fetched balance', myBalance);
    }
    catch (e) {
        // fpr advanced error-handling, see the "advanced-error-handling.js" example file
        console.log('[' + e.constructor.name + '] ' + e.message);
        throw e;
    }
}
checkMyBalance();

```
