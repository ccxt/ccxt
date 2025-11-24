- [Okx Poll Fetch My Trades](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js'

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.okx ({

        // edit for your credentials
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET',
        'password': 'YOUR_API_PASSWORD',
    })

    await exchange.loadMarkets ()

    // if this script fails with a rate limiter error
    // uncomment the following line for debugging purposes

    // exchange.verbose = true

    while (true) {

        try {

            const trades = await exchange.fetchMyTrades ()
            console.log (new Date(), 'fetched', trades.length, 'trades')

        } catch (e) {

            console.log (e.constructor.name, e.message)
            break;
        }
    }
}

main () 
```