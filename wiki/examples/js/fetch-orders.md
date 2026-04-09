- [Fetch Orders](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import log from 'ololog';
import ansicolor from 'ansicolor';


ansicolor.nice

const exchange = new ccxt.bittrex ({
    apiKey: "YOUR_API_KEY",
    secret: "YOUR_SECRET",
})

async function test () {

    const orders = await exchange.fetchOrders ()

    log (asTable (orders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))

    const order = await exchange.fetchOrder (orders[0]['id'])

    log (order)
}

test () 
```