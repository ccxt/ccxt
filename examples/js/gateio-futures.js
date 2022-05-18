const ccxt = require ('../../ccxt');


const exchange = new ccxt.gateio ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
    'options': {
        'defaultType': 'future',
    },
})

;(async () => {
    // exchange.setSandboxMode (true)

    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example 1: Creating a future (market) order
    try {

        // find a future
        const futures = []
        for (const [key, market] of Object.entries(markets)) {
            if (market['future']) {
                futures.push(market);
            }
        }
        if (futures.length > 0) {
            const market = futures[0];
            const symbol = market['symbol'] // example: BTC/USDT:USDT-220318
            const type = 'market'
            const side = 'buy'
            const amount = 1

            // placing an order
            const order = await exchange.createOrder (symbol, type, side, amount)
            console.log (order)

            // fetching open orders
            const openOrders = await exchange.fetchOpenOrders(symbol)
            console.log(openOrders)
        }

    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

}) ()
