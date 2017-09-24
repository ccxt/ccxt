"use strict";

/*  ------------------------------------------------------------------------ */

const [processPath, , exchangeId = null, exchangeSymbol = null] = process.argv.filter (x => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose') || false

/*  ------------------------------------------------------------------------ */

const asTable   = require ('as-table')
    , util      = require ('util')
    , log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , fs        = require ('fs')
    , assert    = require ('assert')
    , ccxt      = require ('../ccxt')
    , countries = require ('../countries')

/*  ------------------------------------------------------------------------ */

const warn = log.bright.yellow.error // .error goes to stderr

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
    // 'http://cors-proxy.htmldriven.com/?url=', // we don't want this for now
]

/*  ------------------------------------------------------------------------ */

const exchange = new (ccxt)[exchangeId] ({ verbose: verbose, enabledRateLimit: true })

//-----------------------------------------------------------------------------

let apiKeys = JSON.parse (fs.readFileSync ('./keys.json', 'utf8'))[exchangeId]

Object.assign (exchange, apiKeys)

if (exchange.urls['test'])
    exchange.urls['api'] = exchange.urls['test']; // move to testnet/sandbox if possible

const verboseList = [ ];
if (verboseList.indexOf (exchange.id) >= 0) {
    exchange.verbose = true
}

//-----------------------------------------------------------------------------

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

//-----------------------------------------------------------------------------

let human_value = function (price) {
    return typeof price == 'undefined' ? 'N/A' : price
}

//-----------------------------------------------------------------------------

let testTicker = async (exchange, symbol) => {
    log (symbol.green, 'fetching ticker...')
    let ticker = await exchange.fetchTicker (symbol)
    log (symbol.green, 'ticker',
        ticker['datetime'],
        'high: '    + human_value (ticker['high']),
        'low: '     + human_value (ticker['low']),
        'bid: '     + human_value (ticker['bid']),
        'ask: '     + human_value (ticker['ask']),
        'volume: '  + human_value (ticker['quoteVolume']))

    if (('bid' in ticker && 'ask' in ticker) && (ticker['bid'] && ticker['ask']))
        assert (ticker['bid'] <= ticker['ask'])

    return ticker;
}

let testOrderBook = async (exchange, symbol) => {
    log (symbol.green, 'fetching order book...')
    let orderbook = await exchange.fetchOrderBook (symbol)
    log (symbol.green,
        orderbook['datetime'],
        'bid: '       + ((orderbook.bids.length > 0) ? human_value (orderbook.bids[0][0]) : 'N/A'),
        'bidVolume: ' + ((orderbook.bids.length > 0) ? human_value (orderbook.bids[0][1]) : 'N/A'),
        'ask: '       + ((orderbook.asks.length > 0) ? human_value (orderbook.asks[0][0]) : 'N/A'),
        'askVolume: ' + ((orderbook.asks.length > 0) ? human_value (orderbook.asks[0][1]) : 'N/A'))

    let bids = orderbook.bids
    let asks = orderbook.asks

    if (bids.length > 1)
        assert (bids[0][0] >= bids[bids.length - 1][0])

    if (asks.length > 1)
        assert (asks[0][0] <= asks[asks.length - 1][0])

    if (bids.length && asks.length)
        assert (bids[0][0] <= asks[0][0])

    return orderbook
}

//-----------------------------------------------------------------------------

let testTrades = async (exchange, symbol) => {
    log (symbol.green, 'fetching trades...')
    let trades = await exchange.fetchTrades (symbol)
    log (symbol.green, 'fetched', Object.values (trades).length.toString ().green, 'trades')
    return trades
}

//-----------------------------------------------------------------------------

let testSymbol = async (exchange, symbol) => {

    await testTicker (exchange, symbol)

    if (exchange.hasFetchTickers) {

        log ('fetching all tickers at once...')
        let tickers = await exchange.fetchTickers ()
        log ('fetched', Object.keys (tickers).length.toString ().green, 'tickers')

    } else {

        log ('fetching all tickers at once not supported')
    }

    if (exchange.hasFetchOHLCV) {

        try {

            log (symbol.green, 'fetching OHLCV...')
            let ohlcv = await exchange.fetchOHLCV (symbol)
            log (symbol.green, 'fetched', Object.keys (ohlcv).length.toString ().green, 'OHLCVs')

        } catch (e) {

            if (e instanceof ccxt.ExchangeError) {
                warn ('[Exchange Error] ' + e.message)
            } else if (e instanceof ccxt.NotSupported) {
                warn ('[Not Supported] ' + e.message)
            } else {
                throw e;
            }
        }

    } else {

        log ('fetching OHLCV not supported')
    }

    if (exchange.id == 'coinmarketcap') {

        log (await exchange.fetchTickers ());
        log (await exchange.fetchGlobal ());

    } else {

        await testOrderBook (exchange, symbol)

        try {

            await testTrades (exchange, symbol)

        } catch (e) {

            if (e instanceof ccxt.ExchangeError) {
                warn ('[Exchange Error] ' + e.message)
            } else if (e instanceof ccxt.NotSupported) {
                warn ('[Not Supported] ' + e.message)
            } else {
                throw e;
            }
        }
    }
}

//-----------------------------------------------------------------------------

let testFetchOrders = async (exchange) => {

    try {

        log ('fetching orders...')
        let orders = await exchange.fetchOrders ()
        log ('fetched', orders.length.toString ().green, 'orders')

    } catch (e) {

        if (e instanceof ccxt.ExchangeError) {
            warn ('[Exchange Error] ' + e.message)
        } else if (e instanceof ccxt.NotSupported) {
            warn ('[Not Supported] ' + e.message)
        } else {
            throw e;
        }
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

    await testBalance (exchange)

    if (exchange.hasFetchOrders) {

            await testFetchOrders (exchange);

    } else {

        log ('fetching orders not supported')
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

    // a special case for ccex
    if (exchange.id == 'ccex')
        currentProxy = 1

    for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

        try {

            exchange.proxy = proxies[currentProxy]
            await testExchange (exchange)
            break

        } catch (e) {

            currentProxy = ++currentProxy % proxies.length
            if (e instanceof ccxt.DDoSProtection) {
                warn ('[DDoS Protection] ' + e.message)
            } else if (e instanceof ccxt.RequestTimeout) {
                warn ('[Request Timeout] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                warn ('[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                warn ('[Exchange Not Available] ' + e.message)
            } else if (e instanceof ccxt.NotSupported) {
                warn ('[Not Supported] ' + e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                warn ('[Exchange Error] ' + e.message)
            } else {
                throw e;
            }
        }
    }
}

//-----------------------------------------------------------------------------

;(async function test () {

    // printExchangesTable ()

    if (exchangeSymbol) {

        await loadExchange (exchange)
        await (exchangeSymbol == 'balance') ?
            testBalance (exchange) :
            testSymbol (exchange, exchangeSymbol)

    } else {

        await tryAllProxies (exchange, proxies)
    }

    process.exit ()

}) ()

