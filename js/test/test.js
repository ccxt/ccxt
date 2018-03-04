'use strict'

/*  ------------------------------------------------------------------------ */

const [processPath, , exchangeId = null, exchangeSymbol = null] = process.argv.filter (x => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose') || false
const debug = process.argv.includes ('--debug') || false

/*  ------------------------------------------------------------------------ */

const asTable   = require ('as-table')
    , util      = require ('util')
    , log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , fs        = require ('fs')
    , ccxt      = require ('../../ccxt.js')
    , countries = require ('../../countries.js')
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

    , testFetchTicker      = require ('./test.fetchTicker.js')
    , testFetchTickers     = require ('./test.fetchTickers.js')
    , testFetchTrades      = require ('./test.fetchTrades.js')
    , testFetchOHLCV       = require ('./test.fetchOHLCV.js')
    , testFetchBalance     = require ('./test.fetchBalance.js')
    , testFetchL2OrderBook = require ('./test.fetchL2OrderBook.js')
    , testFetchOrderBook   = require ('./test.fetchOrderBook.js')
    , testFetchOrderBooks  = require ('./test.fetchOrderBooks.js')
    , testFetchCurrencies  = require ('./test.fetchCurrencies.js')

/*  ------------------------------------------------------------------------ */

const warn = log.bright.yellow.error // .error → stderr

/*  ------------------------------------------------------------------------ */

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

/*  ------------------------------------------------------------------------ */

log.bright ('\nTESTING', { exchange: exchangeId, symbol: exchangeSymbol || 'all' }, '\n')

/*  ------------------------------------------------------------------------ */

let proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
    // 'https://crossorigin.me/',
]

/*  ------------------------------------------------------------------------ */

const enableRateLimit = true

const exchange = new (ccxt)[exchangeId] ({
    verbose,
    enableRateLimit,
    debug,
    timeout: 20000,
})

//-----------------------------------------------------------------------------

const keysGlobal = 'keys.json'
const keysLocal = 'keys.local.json'

let keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal
// eslint-disable-next-line import/no-dynamic-require
let settings = require ('../../' + keysFile)[exchangeId]

Object.assign (exchange, settings)

if (settings && settings.skip) {
    log.error.bright ('[Skipped]', { exchange: exchangeId, symbol: exchangeSymbol || 'all' })
    process.exit ()
}

const verboseList = []
if (verboseList.indexOf (exchange.id) >= 0) {
    exchange.verbose = true
}

//-----------------------------------------------------------------------------

let countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

//-----------------------------------------------------------------------------

let testSymbol = async (exchange, symbol) => {

    await testFetchTicker  (exchange, symbol)
    await testFetchTickers (exchange, symbol)
    await testFetchOHLCV   (exchange, symbol)
    await testFetchTrades  (exchange, symbol)

    if (exchange.id === 'coinmarketcap') {

        log (await exchange.fetchTickers ())
        log (await exchange.fetchGlobal  ())

    } else {

        await testFetchOrderBook   (exchange, symbol)
        await testFetchL2OrderBook (exchange, symbol)
        await testFetchOrderBooks  (exchange)
    }
}

//-----------------------------------------------------------------------------

let testOrderProps = (order, symbol, now) => {
    assert.isOk (order)
    assert (typeof order.id === 'string')
    assert (typeof order.timestamp === 'number')
    assert (order.timestamp > 1230940800000) // 03 Jan 2009 - first block
    assert (order.timestamp < now)
    assert (order.datetime === exchange.iso8601 (order.timestamp))
    assert (order.status === 'open' || order.status === 'closed' || order.status === 'canceled')
    assert (order.symbol === symbol)
    assert (typeof order.type === 'string')
    assert (order.side === 'buy' || order.side === 'sell')
    assert (typeof order.price === 'number')
    assert (order.price > 0)
    assert (typeof order.amount === 'number')
    assert (order.amount >= 0)
    if (order.filled) {
        assert (typeof order.filled === 'number')
        assert (order.filled >= 0 && order.filled <= order.amount)
    }
    if (order.remaining) {
        assert (typeof order.remaining === 'number')
        assert (order.remaining >= 0 && order.remaining <= order.amount)
    }
    if (order.trades) {
        assert (order.trades instanceof Array)
    }
    if (order.fee) {
        assert (typeof order.fee.cost === 'number')
        if (order.fee.cost !== 0)
            assert (typeof order.fee.currency === 'string')
    }
    assert.isOk (order.info)
}

//-----------------------------------------------------------------------------

let testOrders = async (exchange, symbol) => {

    if (exchange.has.fetchOrders) {

        // log ('fetching orders...')
        let orders = await exchange.fetchOrders (symbol)
        log ('fetched', orders.length.toString ().green, 'orders, asserting each...')
        assert (orders instanceof Array)
        let now = Date.now ()
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i]
            testOrderProps (order, symbol, now)
        }
        // log (asTable (orders))

    } else {

        log ('fetching orders not supported')
    }
}

//-----------------------------------------------------------------------------

let testClosedOrders = async (exchange, symbol) => {

    if (exchange.has.fetchClosedOrders) {

        // log ('fetching closed orders...')
        let orders = await exchange.fetchClosedOrders (symbol)
        log ('fetched', orders.length.toString ().green, 'closed orders, testing each')
        assert (orders instanceof Array)
        let now = Date.now ()
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i]
            testOrderProps (order, symbol, now)
            assert (order.status === 'closed')
        }
        // log (asTable (orders))

    } else {

        log ('fetching closed orders not supported')
    }
}

//-----------------------------------------------------------------------------

let testOpenOrders = async (exchange, symbol) => {

    if (exchange.has.fetchOpenOrders) {

        // log ('fetching open orders...')
        let orders = await exchange.fetchOpenOrders (symbol)
        assert (orders instanceof Array)
        log ('fetched', orders.length.toString ().green, 'open orders')
        let now = Date.now ()
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i]
            testOrderProps (order, symbol, now)
            assert (order.status === 'open')
        }

        // log (asTable (orders))

    } else {

        log ('fetching open orders not supported')
    }
}

//-----------------------------------------------------------------------------

let testMyTrades = async (exchange, symbol) => {

    if (exchange.has.fetchMyTrades) {

        // log ('fetching my trades...')
        let trades = await exchange.fetchMyTrades (symbol, 0)
        assert (trades instanceof Array)
        log ('fetched', trades.length.toString ().green, 'trades')
        let now = Date.now ()
        for (let i = 0; i < trades.length; i++) {
            testTradeProps (trades[i], symbol, now)
            if (i > 0)
                assert (trades[i].timestamp <= trades[i - 1].timestamp)
        }
        // trades.forEach (trade => log.dim ('-'.repeat (80), "\n", trade))
        // log (asTable (trades))

    } else {
        log ('fetching my trades not supported')
    }
}

//-----------------------------------------------------------------------------

let testInvalidOrder = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        log ('createOrder not supported')
        return
    }

    try {
        await exchange.createLimitBuyOrder (symbol, 0, 0)
        assert.fail ()
    } catch (e) {
        if (e instanceof ccxt.InvalidOrder) {
            log ('InvalidOrder thrown as expected')
            return
        } else {
            log ('InvalidOrder failed, exception follows:')
            throw e
        }
    }
}

//-----------------------------------------------------------------------------

// will try to place a buy order at the minimum price level on minimum amount possible
// will skip if balance is positive or market limits are not set
let testInsufficientFunds = async (exchange, symbol, balance) => {

    if (!exchange.has.createOrder) {
        log ('createOrder not supported')
        return
    }

    const markets = await exchange.loadMarkets ()
    const market = markets[symbol]
    if (market.limits === undefined) {
        log ('market.limits property is not set, will not test order creation')
        return
    }

    const { price, amount, cost } = market.limits

    if (price === undefined || amount === undefined || cost === undefined) {
        log ('market.limits.[price|amount|cost] property is not set, will not test order creation')
        return
    }

    let minPrice = price.min
    let minAmount = amount.min // will be adjusted co cover minCost if needed
    const minCost = cost.min

    if (minPrice === undefined || minAmount === undefined || minCost === undefined) {
        log ('min limits are not set, will not test order creation')
        return
    }

    if (minCost > minPrice * minAmount) {
        minAmount = minCost / minPrice
    }

    minPrice = exchange.priceToPrecision (symbol, minPrice)
    minAmount = exchange.amountToPrecision (symbol, minAmount)

    if (balance === undefined) {
        log ('balance is not set, cannot ensure safety, will not test order creation')
        return
    }

    const { base, quote } = market
    if (balance[quote].total > 0) {
        log ('balance is not empty, will not test order creation')
        return
    }

    try {
        log ('creating limit buy order...', symbol, minAmount, minPrice)
        let order = await exchange.createLimitBuyOrder (symbol, minAmount, minPrice)
        log ('order created although it should not had to - cleaning up')
        log (order)
        await exchange.cancelOrder (order.id, symbol)
        assert.fail ()
    } catch (e) {
        if (e instanceof ccxt.InsufficientFunds) {
            log ('InsufficientFunds thrown as expected')
        } else {
            log ('InsufficientFunds failed, exception follows:')
            throw e
        }
    }
}

//-----------------------------------------------------------------------------

let testNonExistentOrderNotFound = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        log ('createOrder not supported -> test skipped')
        return
    }

    let id = 1

    try {

        await exchange.cancelOrder (id, symbol)
        log ('test failed')
        assert.fail ()
    } catch (e) {
        if (e instanceof ccxt.OrderNotFound) {
            log ('OrderNotFound thrown as expected')
        } else {
            log ('OrderNotFound test failed')
            throw e
        }
    }
}

//-----------------------------------------------------------------------------

let testBadNonce = async (exchange, symbol) => {

    log.green ('AuthenticationError (bad nonce) test...')

    const hasFetchBalance  = exchange.has.fetchBalance
    const hasFetchMyTrades = exchange.has.fetchMyTrades
    const hasFetchOrders   = exchange.has.fetchOrders

    if (hasFetchBalance || hasFetchMyTrades || hasFetchOrders) {

        // save the nonce temporarily and replace it with a fake one
        const nonce = exchange.nonce
        exchange.nonce = () => 1

        try {

            // check if handleErrors() throws AuthenticationError if an exchange
            // responds with an error on a bad nonce
            // (still, some exchanges that require nonce silently eat bad nonce w/o an error)

            if (hasFetchBalance)
                await exchange.fetchBalance ()
            else if (hasFetchMyTrades)
                await exchange.fetchMyTrades (symbol, 0)
            else
                await exchange.fetchOrders (symbol)

            // restore the nonce so the caller may proceed in case bad nonce was accepted by an exchange
            exchange.nonce = nonce
            log.warn (exchange.id + ': AuthenticationError: bad nonce swallowed')

        } catch (e) {

            // restore the nonce so the caller may proceed in case the test failed
            exchange.nonce = nonce
            if (e instanceof ccxt.AuthenticationError || e instanceof ccxt.InvalidNonce) {

                // it has thrown the exception as expected
                log.green ('AuthenticationError test passed')

            } else {

                // rethrow an unexpected error if any
                throw e
            }
        }

    } else {

        log (exchange.id + ' has no means of testing for bad nonce')

    }

}

//-----------------------------------------------------------------------------

let loadExchange = async exchange => {

    let markets  = await exchange.loadMarkets ()

    assert (typeof exchange.markets === 'object', '.markets is not an object')
    assert (Array.isArray (exchange.symbols), '.symbols is not an array')
    assert (exchange.symbols.length > 0, '.symbols.length <= 0 (less than or equal to zero)')
    assert (Object.keys (exchange.markets).length > 0, 'Object.keys (.markets).length <= 0 (less than or equal to zero)')
    assert (exchange.symbols.length === Object.keys (exchange.markets).length, 'number of .symbols is not equal to the number of .markets')

    let symbols = [
        'BTC/CNY',
        'BTC/USD',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'ETH/EUR',
        'ETH/JPY',
        'ETH/CNY',
        'LTC/CNY',
        'DASH/BTC',
        'DOGE/BTC',
        'BTC/AUD',
        'BTC/PLN',
        'USD/SLL',
        'BTC/RUB',
        'BTC/UAH',
        'LTC/BTC',
    ]

    let result = exchange.symbols.filter (symbol => symbols.indexOf (symbol) >= 0)

    if (result.length > 0)
        if (exchange.symbols.length > result.length)
            result = result.join (', ') + ' + more...'
        else
            result = result.join (', ')

    log (exchange.symbols.length.toString ().bright.green, 'symbols', result)
}

//-----------------------------------------------------------------------------

let testExchange = async exchange => {

    await loadExchange (exchange)

    let delay = exchange.rateLimit
    let symbol = exchange.symbols[0]
    let symbols = [
        'BTC/USD',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    ]
    for (let s in symbols) {
        if (exchange.symbols.includes (symbols[s])) {
            symbol = symbols[s]
            break
        }
    }

    if (exchange.id === 'okex') {
        // okex has different order creation params for spot and futures markets
        // this will stick okex to spot market until there is a way to test
        // several markets per exchange
        symbol = 'BTC/USDT'
    }

    log.green ('SYMBOL:', symbol)
    if ((symbol.indexOf ('.d') < 0)) {
        await testSymbol (exchange, symbol)
    }

    if (!exchange.apiKey || (exchange.apiKey.length < 1))
        return true

    // move to testnet/sandbox if possible before accessing the balance if possible
    if (exchange.urls['test'])
        exchange.urls['api'] = exchange.urls['test']

    let balance = await testFetchBalance (exchange)

    await testOrders       (exchange, symbol)
    await testOpenOrders   (exchange, symbol)
    await testClosedOrders (exchange, symbol)
    await testMyTrades     (exchange, symbol)

    if (exchange.extendedTest) {
        await testBadNonce        (exchange, symbol)
        await testNonExistentOrderNotFound (exchange, symbol)
        await testInvalidOrder (exchange, symbol)

        // danger zone - won't execute with non-empty balance
        await testInsufficientFunds (exchange, symbol, balance)
    }

    // try {
    //     let marketSellOrder =
    //         await exchange.createMarketSellOrder (exchange.symbols[0], 1)
    //     console.log (exchange.id, 'ok', marketSellOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'market sell', e)
    // }

    // try {
    //     let marketBuyOrder = await exchange.createMarketBuyOrder (exchange.symbols[0], 1)
    //     console.log (exchange.id, 'ok', marketBuyOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'market buy', e)
    // }

    // try {
    //     let limitSellOrder = await exchange.createLimitSellOrder (exchange.symbols[0], 1, 3000)
    //     console.log (exchange.id, 'ok', limitSellOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'limit sell', e)
    // }

    // try {
    //     let limitBuyOrder = await exchange.createLimitBuyOrder (exchange.symbols[0], 1, 3000)
    //     console.log (exchange.id, 'ok', limitBuyOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'limit buy', e)
    // }
}

//-----------------------------------------------------------------------------

let printExchangesTable = function () {

    let astable = asTable.configure ({ delimiter: ' | ' })

    console.log (astable (Object.values (exchanges).map (exchange => {

        let website = Array.isArray (exchange.urls.www) ?
            exchange.urls.www[0] :
            exchange.urls.www

        let countries = Array.isArray (exchange.countries) ?
            exchange.countries.map (countryName).join (', ') :
            countryName (exchange.countries)

        let doc = Array.isArray (exchange.urls.doc) ?
            exchange.urls.doc[0] :
            exchange.urls.doc

        return {
            'id':        exchange.id,
            'name':      exchange.name,
            'countries': countries,
        }

    })))
}

//-----------------------------------------------------------------------------

let tryAllProxies = async function (exchange, proxies) {

    let currentProxy = 0
    let maxRetries   = proxies.length

    if (settings && ('proxy' in settings))
        currentProxy = proxies.indexOf (settings.proxy)

    for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

        try {

            exchange.proxy = proxies[currentProxy]
            await testExchange (exchange)
            break

        } catch (e) {

            currentProxy = ++currentProxy % proxies.length
            if (e instanceof ccxt.DDoSProtection) {
                warn ('[DDoS Protection]' + e.message.slice (0, 200))
            } else if (e instanceof ccxt.RequestTimeout) {
                warn ('[Request Timeout] ' + e.message.slice (0, 200))
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                warn ('[Exchange Not Available] ' + e.message.slice (0, 200))
            } else if (e instanceof ccxt.AuthenticationError) {
                warn ('[Authentication Error] ' + e.message.slice (0, 200))
                return
            } else if (e instanceof ccxt.InvalidNonce) {
                warn ('[Invalid Nonce] ' + e.message.slice (0, 200))
                return
            } else {
                throw e
            }
        }
    }
}

//-----------------------------------------------------------------------------

;(async function test () {

    if (exchangeSymbol) {

        await loadExchange (exchange)
        await (exchangeSymbol === 'balance') ?
            testFetchBalance (exchange) :
            testSymbol (exchange, exchangeSymbol)

    } else {

        await tryAllProxies (exchange, proxies)
    }

}) ()
