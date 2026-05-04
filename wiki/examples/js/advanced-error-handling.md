- [Advanced Error Handling](./examples/js/)


 ```javascript
 "use strict";

const ccxt      = require ('../../ccxt.js');

// instantiate the exchange
let exchange = new ccxt.coinbasepro  ({
    'apiKey': 'XXXXXXXXXXXXXX',
    'secret': 'YYYYYYYYYYYYYY',
});

async function checkOrders(){
    try {
        // fetch orders
        let orders = await exchange.fetchOrders ('BTC/USDT');
        // output the result
        console.log (exchange.id, 'fetched orders', orders);
    } catch (e) {
        if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
            console.log ('[DDoS Protection] ' + e.message);
        } else if (e instanceof ccxt.RequestTimeout) {
            console.log ('[Request Timeout] ' + e.message);
        } else if (e instanceof ccxt.AuthenticationError) {
            console.log ('[Authentication Error] ' + e.message);
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            console.log ('[Exchange Not Available Error] ' + e.message);
        } else if (e instanceof ccxt.ExchangeError) {
            console.log ('[Exchange Error] ' + e.message);
        } else if (e instanceof ccxt.NetworkError) {
            console.log ('[Network Error] ' + e.message);
        } else {
            // you can throw it if you want to stop the execution
            // console.log ('[Exception ' + e.constructor.name + '] ' + e.message);
            throw e;
        }
    }
}

//  for demonstrational purposes, we use 1000 ms interval
setInterval(checkOrders, 1000); 
 
```