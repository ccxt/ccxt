const ccxt = require ('../../ccxt');

const exchange = new ccxt.gateio ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
    'options': {
        'defaultType': 'swap',
    },
})

;(async () => {
    // exchange.setSandboxMode (true)

    const markets = await exchange.loadMarkets ()

    exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example 1: Creating and canceling a linear swap (limit) order
    try {
        const symbol = 'LTC/USDT:USDT'
        const type = 'limit'
        const side = 'buy'
        const amount = 1
        const price = 55

        // placing an order
        const order = await exchange.createOrder (symbol, type, side, amount, price)
        console.log (order)

        // fetching open orders
        const openOrders = await exchange.fetchOpenOrders(symbol)
        console.log(openOrders)

        // canceling an order
        const cancel = await exchange.cancelOrder (order['id'], symbol)
        console.log (cancel)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

    // Example 2: Creating and canceling a linear swap (stop-limit) order with leverage
    try {
        const symbol = 'LTC/USDT:USDT'
        const type = 'limit'
        const side = 'buy'
        const amount = 1
        const price = 55

        const stopPrice = 130
        const params = {
            'stopPrice': stopPrice,
        }
        //set leverage
        const leverage = await exchange.setLeverage(3, symbol);
        console.log(leverage)

        // placing an order
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)

        // canceling an order
        const cancelParams = {
            isStop: true,
        };
        const cancel = await exchange.cancelOrder (order['id'], symbol, cancelParams)
        console.log (cancel)

        //reset leverage
        exchange.setLeverage(1, symbol);
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

}) ()
