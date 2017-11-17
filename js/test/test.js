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
    'https://crossorigin.me/',
]

/*  ------------------------------------------------------------------------ */

const enableRateLimit = true

const exchange = new (ccxt)[exchangeId] ({
    verbose,
    enableRateLimit,
    debug,
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

const verboseList = [ ];
if (verboseList.indexOf (exchange.id) >= 0) {
    exchange.verbose = true
}

//-----------------------------------------------------------------------------

let countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

//-----------------------------------------------------------------------------

let human_value = function (price) {
    return typeof price == 'undefined' ? 'N/A' : price
}

//-----------------------------------------------------------------------------

let testTicker = async (exchange, symbol) => {

    if (exchange.hasFetchTicker) {

        // log (symbol.green, 'fetching ticker...')

        let ticker = await exchange.fetchTicker (symbol)
        const keys = [ 'datetime', 'timestamp', 'high', 'low', 'bid', 'ask', 'quoteVolume' ]

        keys.forEach (key => assert (key in ticker))

        log (symbol.green, 'ticker',
            ticker['datetime'],
            ... (keys.map (key =>
                key + ': ' + human_value (ticker[key]))))

        if ((exchange.id != 'coinmarketcap') && (exchange.id != 'xbtce'))
            if (ticker['bid'] && ticker['ask'])
                assert (ticker['bid'] <= ticker['ask'])

    } else {

        log (symbol.green, 'fetchTicker () not supported')
    }
}

//-----------------------------------------------------------------------------

let testOrderBook = async (exchange, symbol) => {

    // log (symbol.green, 'fetching order book...')

    let orderbook = await exchange.fetchOrderBook (symbol)

    const format = {
        'bids': [],
        'asks': [],
        'timestamp': 1234567890,
        'datetime': '2017-09-01T00:00:00',
    };

    expect (orderbook).to.have.all.keys (format)

    const bids = orderbook.bids
    const asks = orderbook.asks

    log (symbol.green,
        orderbook['datetime'],
        'bid: '       + ((bids.length > 0) ? human_value (bids[0][0]) : 'N/A'),
        'bidVolume: ' + ((bids.length > 0) ? human_value (bids[0][1]) : 'N/A'),
        'ask: '       + ((asks.length > 0) ? human_value (asks[0][0]) : 'N/A'),
        'askVolume: ' + ((asks.length > 0) ? human_value (asks[0][1]) : 'N/A'))


    if (bids.length > 1)
        assert (bids[0][0] >= bids[bids.length - 1][0])

    if (asks.length > 1)
        assert (asks[0][0] <= asks[asks.length - 1][0])

    if (exchange.id != 'xbtce')
        if (bids.length && asks.length)
            assert (bids[0][0] <= asks[0][0])

    return orderbook
}

//-----------------------------------------------------------------------------

let testTrades = async (exchange, symbol) => {

    if (exchange.hasFetchTrades) {

        // log (symbol.green, 'fetching trades...')

        let trades = await exchange.fetchTrades (symbol)

        log (symbol.green, 'fetched', Object.values (trades).length.toString ().green, 'trades')
        // log (asTable (trades))

    } else {

        log (symbol.green, 'fetchTrades () not supported'.yellow);
    }
}

//-----------------------------------------------------------------------------

let testTickers = async (exchange, symbol) => {

    if (exchange.hasFetchTickers) {

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

    if (exchange.hasFetchOHLCV) {

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

    if (exchange.id == 'coinmarketcap') {

        log (await exchange.fetchTickers ())
        log (await exchange.fetchGlobal  ())

    } else {

        await testOrderBook (exchange, symbol)
    }
}

//-----------------------------------------------------------------------------

let testOrders = async (exchange, symbol) => {

    if (exchange.hasFetchOrders) {

        // log ('fetching orders...')
        let orders = await exchange.fetchOrders (symbol)
        log ('fetched', orders.length.toString ().green, 'orders')
        // log (asTable (orders))

    } else {

        log ('fetching orders not supported')
    }
}

//-----------------------------------------------------------------------------

let testClosedOrders = async (exchange, symbol) => {

    if (exchange.hasFetchClosedOrders) {

        // log ('fetching closed orders...')
        let orders = await exchange.fetchClosedOrders (symbol)
        log ('fetched', orders.length.toString ().green, 'closed orders')
        // log (asTable (orders))

    } else {

        log ('fetching closed orders not supported')
    }
}

//-----------------------------------------------------------------------------

let testOpenOrders = async (exchange, symbol) => {

    if (exchange.hasFetchOpenOrders) {

        // log ('fetching open orders...')
        let orders = await exchange.fetchOpenOrders (symbol)
        log ('fetched', orders.length.toString ().green, 'open orders')
        // log (asTable (orders))

    } else {

        log ('fetching open orders not supported')
    }
}

//-----------------------------------------------------------------------------

let testMyTrades = async (exchange, symbol) => {

    if (exchange.hasFetchMyTrades) {

        // log ('fetching my trades...')
        let trades = await exchange.fetchMyTrades (symbol)
        log ('fetched', trades.length.toString ().green, 'trades')
        // log (asTable (trades))

    } else {

        log ('fetching my trades not supported')
    }
}

//-----------------------------------------------------------------------------

let testFetchCurrencies = async (exchange, symbol) => {

    if (exchange.hasFetchCurrencies) {

        // log ('fetching currencies...')
        let currencies = await exchange.fetchCurrencies ()
        log ('fetched', currencies.length.toString ().green, 'currencies')
        // log (asTable (currencies))

    } else {

        log ('fetching currencies not supported')
    }
}

//-----------------------------------------------------------------------------

let testBalance = async (exchange, symbol) => {

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
                (typeof balance[currency]['total'] != 'undefined'))

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
        exchange.urls['api'] = exchange.urls['test'];

    await testOrders       (exchange, symbol)
    await testOpenOrders   (exchange, symbol)
    await testClosedOrders (exchange, symbol)
    await testMyTrades     (exchange, symbol)
    await testBalance      (exchange)

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
                throw e;
            }
        }
    }
}

//-----------------------------------------------------------------------------

;(async function test () {

    if (exchangeSymbol) {

        await loadExchange (exchange)
        await (exchangeSymbol == 'balance') ?
            testBalance (exchange) :
            testSymbol (exchange, exchangeSymbol)

    } else {

        await tryAllProxies (exchange, proxies)
    }

}) ()

