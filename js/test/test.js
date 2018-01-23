"use strict";

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
let settings = require ('../../' + keysFile)[exchangeId]

Object.assign (exchange, settings)

if (settings && settings.skip) {
    log.bright ('[Skipped]', { exchange: exchangeId, symbol: exchangeSymbol || 'all' })
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

let human_value = function (price) {
    return typeof price === 'undefined' ? 'N/A' : price
}

//-----------------------------------------------------------------------------

let testTicker = async (exchange, symbol) => {

    if (exchange.has.fetchTicker) {

        // log (symbol.green, 'fetching ticker...')

        let ticker = await exchange.fetchTicker (symbol)
        const keys = [ 'datetime', 'timestamp', 'high', 'low', 'bid', 'ask', 'baseVolume', 'quoteVolume', 'vwap' ]

        // log (ticker)

        keys.forEach (key => assert (key in ticker))

        const { high, low, vwap, baseVolume, quoteVolume } = ticker

        // this assert breaks QuadrigaCX sometimes... still investigating
        // if (vwap)
        //     assert (vwap >= low && vwap <= high)

        /*
        if (baseVolume && quoteVolume && high && low) {
            assert (quoteVolume >= baseVolume * low) // this assertion breaks therock
            assert (quoteVolume <= baseVolume * high)
        }
        */

        if (baseVolume && vwap)
            assert (quoteVolume)

        if (quoteVolume && vwap)
            assert (baseVolume)

        log (symbol.green, 'ticker',
            ticker['datetime'],
            ... (keys.map (key =>
                key + ': ' + human_value (ticker[key]))))

        if ((exchange.id !== 'coinmarketcap') && (exchange.id !== 'xbtce'))
            if (ticker['bid'] && ticker['ask'])
                assert (ticker['bid'] <= ticker['ask'])

    } else {

        log (symbol.green, 'fetchTicker () not supported')
    }
}

//-----------------------------------------------------------------------------

let testOrderBookProperties = (symbol, orderbook) => {

    const format = {
        'bids': [],
        'asks': [],
        'timestamp': 1234567890,
        'datetime': '2017-09-01T00:00:00',
    }

    expect (orderbook).to.have.all.keys (format)

    const bids = orderbook.bids
    const asks = orderbook.asks

    log (symbol.green,
        orderbook['datetime'],
        'bid: '       + ((bids.length > 0) ? human_value (bids[0][0]) : 'N/A'),
        'bidVolume: ' + ((bids.length > 0) ? human_value (bids[0][1]) : 'N/A'),
        'ask: '       + ((asks.length > 0) ? human_value (asks[0][0]) : 'N/A'),
        'askVolume: ' + ((asks.length > 0) ? human_value (asks[0][1]) : 'N/A'))


    for (let i = 1; i < bids.length; i++) {
        // debugger;
        assert (bids[i][0] <= bids[i - 1][0])
    }

    for (let i = 1; i < asks.length; i++) {
        assert (asks[i][0] >= asks[i - 1][0])
    }

    if (exchange.id !== 'xbtce')
        if (bids.length && asks.length)
            assert (bids[0][0] <= asks[0][0])

}

//-----------------------------------------------------------------------------

let testOrderBook = async (exchange, symbol) => {

    // log (symbol.green, 'fetching order book...')

    let orderbook = await exchange.fetchOrderBook (symbol)

    testOrderBookProperties (symbol, orderbook)

    return orderbook
}

//-----------------------------------------------------------------------------

let testL2OrderBook = async (exchange, symbol) => {

    // log (symbol.green, 'fetching order book...')

    let orderbook = await exchange.fetchL2OrderBook (symbol)

    testOrderBookProperties (symbol, orderbook)

    return orderbook
}

//-----------------------------------------------------------------------------

let testTradeProps = (trade, symbol, now) => {
    assert.isOk (trade)
    assert (typeof trade.id === 'undefined' || typeof trade.id === 'string')
    assert (typeof trade.timestamp === 'number')
    assert (trade.timestamp > 1230940800000) // 03 Jan 2009 - first block

    //------------------------------------------------------------------
    // console.log (exchange.iso8601 (trade.timestamp), exchange.iso8601 (now))

    // The next assertion line breaks Kraken. They report trades that are
    // approximately 500ms ahead of `now`. Tried synching system clock against
    // different servers. Apparently, Kraken's own clock drifts by up to 10 (!) seconds.

    const isExchangeTimeDrifting = [
        'bitfinex',
        'kraken', // override for kraken and possibly other exchanges as well
    ].includes (exchange.id)

    const adjustedNow = now + (isExchangeTimeDrifting ? 10000 : 0)

    assert (trade.timestamp < adjustedNow, 'trade.timestamp is greater than or equal to current time: trade: ' + exchange.iso8601 (trade.timestamp) + ' now: ' + exchange.iso8601 (now))
    //------------------------------------------------------------------

    assert (trade.datetime === exchange.iso8601 (trade.timestamp))

    const isExchangeLackingFilteringTradesBySymbol = [
        'kraken', // override for kraken and possibly other exchanges as well, can't return private trades per symbol at all
    ].includes (exchange.id)

    if (!isExchangeLackingFilteringTradesBySymbol)
        assert (trade.symbol === symbol, 'trade symbol is not equal to requested symbol: trade: ' + trade.symbol + ' reqeusted: ' + symbol)

    assert (typeof trade.type === 'undefined'  || typeof trade.type === 'string')
    assert (typeof trade.side === 'undefined'  || trade.side === 'buy' || trade.side === 'sell')
    assert (typeof trade.order === 'undefined' || typeof trade.order === 'string')
    assert (typeof trade.price === 'number', 'trade.price is not a number')
    assert (trade.price > 0)
    assert (typeof trade.amount === 'number', 'trade.amount is not a number')
    assert (trade.amount >= 0)
    assert.isOk (trade.info)
}

//-----------------------------------------------------------------------------

let testTrades = async (exchange, symbol) => {

    if (exchange.has.fetchTrades) {

        // log (symbol.green, 'fetching trades...')

        let trades = await exchange.fetchTrades (symbol)
        assert (trades instanceof Array)
        log (symbol.green, 'fetched', Object.values (trades).length.toString ().green, 'trades')
        let now = Date.now ()
        for (let i = 0; i < trades.length; i++) {
            testTradeProps (trades[i], symbol, now)
            if (i > 0)
                assert (trades[i].timestamp <= trades[i-1].timestamp)
        }
        // log (asTable (trades))

    } else {

        log (symbol.green, 'fetchTrades () not supported'.yellow)
    }
}

//-----------------------------------------------------------------------------

let testTickers = async (exchange, symbol) => {

    const skippedExchanges = [
        'binance',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetch all tickers...')
        return
    }

    if (exchange.has.fetchTickers) {

        // log ('fetching all tickers at once...')

        let tickers = undefined

        try {

            tickers = await exchange.fetchTickers ()
            log ('fetched all', Object.keys (tickers).length.toString ().green, 'tickers')

        } catch (e) {

            log ('failed to fetch all tickers, fetching multiple tickers at once...')
            tickers = await exchange.fetchTickers ([ symbol ])
            log ('fetched', Object.keys (tickers).length.toString ().green, 'tickers')
        }

    } else {

        log ('fetching all tickers at once not supported')
    }
}

//-----------------------------------------------------------------------------

let testOHLCV = async (exchange, symbol) => {

    if (exchange.has.fetchOHLCV) {

        // log (symbol.green, 'fetching OHLCV...')
        let ohlcv = await exchange.fetchOHLCV (symbol)
        log (symbol.green, 'fetched', Object.keys (ohlcv).length.toString ().green, 'OHLCVs')

    } else {

        log ('fetching OHLCV not supported')
    }
}

//-----------------------------------------------------------------------------

let testSymbol = async (exchange, symbol) => {

    await testTicker  (exchange, symbol)
    await testTickers (exchange, symbol)
    await testOHLCV   (exchange, symbol)
    await testTrades  (exchange, symbol)

    if (exchange.id === 'coinmarketcap') {

        log (await exchange.fetchTickers ())
        log (await exchange.fetchGlobal  ())

    } else {

        await testOrderBook   (exchange, symbol)
        await testL2OrderBook (exchange, symbol)
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
        assert (order.filled >=0 && order.filled <= order.amount)
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
                assert (trades[i].timestamp <= trades[i-1].timestamp)
        }
        // trades.forEach (trade => log.dim ('-'.repeat (80), "\n", trade))
        // log (asTable (trades))

    } else {
        log ('fetching my trades not supported')
    }
}

//-----------------------------------------------------------------------------

let testFetchCurrencies = async (exchange, symbol) => {

    if (exchange.has.fetchCurrencies) {

        // log ('fetching currencies...')
        let currencies = await exchange.fetchCurrencies ()
        log ('fetched', currencies.length.toString ().green, 'currencies')
        // log (asTable (currencies))

    } else {

        log ('fetching currencies not supported')
    }
}

//-----------------------------------------------------------------------------

let testInvalidOrder = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        log ('order creation not supported');
        return;
    }

    try {
        await exchange.createLimitBuyOrder (symbol, 0, 0)
        assert.fail ()
    } catch (e) {
        if (e instanceof ccxt.InvalidOrder) {
            log ('InvalidOrder throwed as expected')
            return
        } else {
            log ('InvalidOrder failed, exception follows:')
            throw e
        }
    }
}

//-----------------------------------------------------------------------------

let testInsufficientFunds = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        log ('order creation not supported');
        return;
    }

    let markets = await exchange.loadMarkets ()
    let market = markets[symbol]
    if (market.limits === undefined) {
        log ('limits are not set, will not test order creation')
        return
    }

    let { price, amount, cost } = market.limits
    if (price === undefined || amount === undefined) {
        log ('price & amount limits are not set, will not test order creation')
        return
    }

    let minPrice = price.min
    let minAmount = amount.min
    if (minPrice === undefined || minAmount === undefined) {
        log ('min limits are not set, will not test order creation')
        return
    }
    let minCost = cost ? cost.min : (minPrice * minAmount)

    if (minCost > (minPrice * minAmount)) {
      [ minPrice, minAmount ] = [ minCost / minAmount, minCost / minPrice ]
    }

    minPrice = exchange.priceToPrecision (symbol, minPrice)
    minAmount = exchange.amountToPrecision (symbol, minAmount)

    try {
        // log ('creating limit buy order...', symbol, minAmount, minPrice)
        let id = await exchange.createLimitBuyOrder (symbol, minAmount, minPrice)
        log ('order created although it should not had to - cleaning up')
        await exchange.cancelOrder (id, symbol)
        assert.fail ()
        // log (asTable (currencies))
    } catch (e) {
        if (e instanceof ccxt.InsufficientFunds) {
            log ('InsufficientFunds throwed as expected')
        } else {
            log ('InsufficientFunds failed, exception follows:')
            throw e
        }
    }
}

//-----------------------------------------------------------------------------

let testBalance = async (exchange, symbol) => {

    if (!(exchange.hasFetchBalance || exchange.has.fetchBalance)) {
        log (exchange.id.green, ' does not have fetchBalance')
        return
    }

    log ('fetching balance...')

    let balance = await exchange.fetchBalance ()

    let currencies = [
        'USD',
        'CNY',
        'EUR',
        'BTC',
        'ETH',
        'JPY',
        'LTC',
        'DASH',
        'DOGE',
        'UAH',
        'RUB',
    ]

    // log.yellow (balance)

    if ('info' in balance) {

        let result = currencies
            .filter (currency => (currency in balance) &&
                (typeof balance[currency]['total'] !== 'undefined'))

        if (result.length > 0) {
            result = result.map (currency => currency + ': ' + human_value (balance[currency]['total']))
            if (exchange.currencies.length > result.length)
                result = result.join (', ') + ' + more...'
            else
                result = result.join (', ')

        } else {

            result = 'zero balance'
        }

        log (result)

    } else {

        log (exchange.omit (balance, 'info'))
    }
}

//-----------------------------------------------------------------------------

let testBadNonce = async (exchange, symbol) => {

    log.green ('AuthenticationError (bad nonce) test...')

    const hasFetchBalance  = exchange.hasFetchBalance  || exchange.has.fetchBalance
    const hasFetchMyTrades = exchange.hasFetchMyTrades || exchange.has.fetchMyTrades
    const hasFetchOrders   = exchange.hasFetchOrders   || exchange.has.fetchOrders

    if (hasFetchBalance || hasFetchMyTrades || hasFetchOrders) {

        // save the nonce temporarily and replace it with a fake one
        const nonce = exchange.nonce
        exchange.nonce = () => 1

        try {

            // check if a method throws an AuthenticationError
            // (it should, due to bad nonce)

            if (hasFetchBalance)
                await exchange.fetchBalance ()
            else if (hasFetchMyTrades)
                await exchange.fetchMyTrades (symbol, 0)
            else
                await exchange.fetchOrders (symbol)

        } catch (e) {

            // restore the nonce
            exchange.nonce = nonce

            if (e instanceof ccxt.AuthenticationError) {

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

    log.green ('SYMBOL:', symbol)
    if ((symbol.indexOf ('.d') < 0)) {
        await testSymbol (exchange, symbol)
    }

    if (!exchange.apiKey || (exchange.apiKey.length < 1))
        return true

    // move to testnet/sandbox if possible before accessing the balance if possible
    if (exchange.urls['test'])
        exchange.urls['api'] = exchange.urls['test']

    await testBalance      (exchange)
    await testOrders       (exchange, symbol)
    await testOpenOrders   (exchange, symbol)
    await testClosedOrders (exchange, symbol)
    await testMyTrades     (exchange, symbol)
    // await testBadNonce        (exchange, symbol)
    // await testInsufficientFunds (exchange, symbol)
    // await testInvalidOrder (exchange, symbol)

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
            } else if (e instanceof ccxt.AuthenticationError) {
                warn ('[Authentication Error] ' + e.message.slice (0, 200))
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                warn ('[Exchange Not Available] ' + e.message.slice (0, 200))
            } else if (e instanceof ccxt.NotSupported) {
                warn ('[Not Supported] ' + e.message.slice (0, 200))
            } else if (e instanceof ccxt.ExchangeError) {
                warn ('[Exchange Error] ' + e.message.slice (0, 200))
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
            testBalance (exchange) :
            testSymbol (exchange, exchangeSymbol)

    } else {

        await tryAllProxies (exchange, proxies)
    }

}) ()
