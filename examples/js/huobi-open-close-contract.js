const ccxt = require ('../../ccxt');

const exchange = new ccxt.huobi ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'swap',
        'marginMode': 'cross'
    },
})

;(async () => {
    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example: creating and closing a contract
    let symbol = 'ADA/USDT:USDT' // market positions for contracts not available
    let type = 'limit'
    let side = 'buy'
    let offset= 'open'
    let leverage = 1
    let amount = 1
    let price = 1
    let clientOrderId = 6;
    let params = {
        'offset': offset,
        'lever_rate': leverage,
        'client_order_id': clientOrderId
    }

    try {
        // fetching current balance
        const balance = await exchange.fetchBalance()
        console.log(balance)

        // placing an order
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)

        // fetching position
        const position = await exchange.fetchPosition(symbol)
        console.log(position)


        // closing it by issuing an oposite contract 
        // warning: since we can only place limit orders
        // it might take a while (depending on the price we choose and market fluctuations) 
        // to the order be fulfilled
        // and therefore close our previous position
        side = 'sell'
        type = 'limit'
        offset = 'close'
        reduce_only = 1 // 1 : yes, 0: no
        clientOrderId = 9
        price = 1.147 // adjust this accordingly
        params = {'offset': offset, 'reduce_only': reduce_only, 'client_order_id': clientOrderId}
        const opositeOrder = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (opositeOrder)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}) ()
