const ccxt = require ('../../ccxt');

const exchange = new ccxt.huobi ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
    'options': {
        'defaultType': 'swap',
    },
})

;(async () => {
    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // creating and canceling a linear swap (limit) order
    let symbol = 'ADA/USDT:USDT'
    let type = 'limit'
    let side = 'buy'
    let offset= 'open'
    let leverage = 1
    let amount = 1
    let price = 1 // 1 contract = 10 ADA = 10 usd in this case
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

    // creating and canceling an inverse swap (limit) order
    symbol = 'ADA/USD:ADA'
    type = 'limit'
    side = 'buy'
    offset = 'open'
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
