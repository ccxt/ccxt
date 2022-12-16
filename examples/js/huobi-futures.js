const ccxt = require ('../../ccxt');

const exchange = new ccxt.huobi ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'future',
    },
})

;(async () => {
    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // creating and canceling a linear future (limit) order
    let symbol = 'ETH/USDT:USDT-220121' // the last segment is the date of expiration (can be next week, next quarter, ...) adjust it accordingly
    let type = 'limit'
    let side = 'buy'
    let offset= 'open'
    let leverage = 1
    let amount = 1
    let price = 1
    let params = {
        'offset': offset,
        'lever_rate': leverage,
    }

    try {
        // fetching current balance
        const balance = await exchange.fetchBalance()
        // console.log(balance)

        // placing an order
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
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

    // creating and canceling a inverse future (limit) order
    symbol = 'ADA/USD:ADA-220121' // the last segment is the date of expiration (can be next week, next quarter, ...) adjust it accordingly
    type = 'limit'
    side = 'buy'
    offset= 'open'
    leverage = 1
    amount = 1
    price = 1 // 1 contract = 10 ADA = 10 usd in this case
    params = {
        'offset': offset,
        'lever_rate': leverage,
    }

    try {
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)
        const cancel = await exchange.cancelOrder (order['id'], symbol)
        console.log (cancel)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

}) ()
