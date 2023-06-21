

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.kraken ({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_SECRET",
    })

    console.log ('-----------------------------------------------------------')

    console.log ('Loading markets...')
    const markets = await exchange.loadMarkets ()
    console.log ('Markets loaded')

    // exchange.verbose = true // uncomment for debugging purposes

    try {

        const symbol = 'ETH/USDT'
            , market = exchange.market (symbol)
            , { base, quote } = market
            , type = 'market'
            , amount = market['limits']['amount']['min']
            , price = undefined
            , params = {
                'leverage': 2,
            }

        console.log ('-----------------------------------------------------------')

        // https://www.kraken.com/en-us/features/api#add-standard-order

        console.log ('Placing order...')
        let order = await exchange.createOrder (symbol, type, 'buy', amount, price, params)
        console.log ('Order placed:')
        console.log (order)

        console.log ('-----------------------------------------------------------')

        // https://www.kraken.com/en-us/features/api#get-open-positions

        console.log ('Fetching open positions...')
        const positionsParams = { 'docalcs': true }
        let openPositions = await exchange.fetchPositions (positionsParams)
        console.log ('Current positions:')
        console.log (openPositions)

        console.log ('-----------------------------------------------------------')

        console.log ('Fetching balance...')
        let balance = await exchange.fetchTotalBalance ()
        console.log ('Fetched balance:')
        console.log (base, balance[base], '(base)')
        console.log (quote, balance[quote], '(quote)')

        console.log ('-----------------------------------------------------------')

        console.log ('Closing the position...')
        order = await exchange.createOrder (symbol, type, 'sell', amount, price, params)
        console.log ('Got a response:')
        console.log (order)

        console.log ('-----------------------------------------------------------')

        console.log ('Fetching open positions again...')
        openPositions = await exchange.fetchPositions (positionsParams)
        console.log ('Current positions:')
        console.log (openPositions)

        console.log ('-----------------------------------------------------------')

        console.log ('Fetching balance...')
        balance = await exchange.fetchTotalBalance ()
        console.log ('Fetched balance:')
        console.log (base, balance[base], '(base)')
        console.log (quote, balance[quote], '(quote)')

    } catch (e) {

        console.log (e.constructor.name, e.message)
    }
}

main ()