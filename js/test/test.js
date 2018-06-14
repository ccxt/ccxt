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

const tests = {}
const properties = Object.keys (exchange.has)
properties
    .filter (property => fs.existsSync (__dirname + '/Exchange/test.' + property + '.js'))
    .forEach (property => {
        // eslint-disable-next-line import/no-dynamic-require
        tests[property] = require (__dirname + '/Exchange/test.' + property + '.js')
    })

const errors = require ('../base/errors.js')

Object.keys (errors)
    .filter (error => fs.existsSync (__dirname + '/errors/test.' + error + '.js'))
    .forEach (error => {
        // eslint-disable-next-line import/no-dynamic-require
        tests[error] = require (__dirname + '/errors/test.' + error + '.js')
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

//-----------------------------------------------------------------------------

let countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

//-----------------------------------------------------------------------------

let testSymbol = async (exchange, symbol) => {

    if (exchange.id !== 'coinmarketcap') {
        await tests['fetchMarkets']    (exchange)
        await tests['fetchCurrencies'] (exchange)
    }

    await tests['fetchTicker']  (exchange, symbol)
    await tests['fetchTickers'] (exchange, symbol)
    await tests['fetchOHLCV']   (exchange, symbol)
    await tests['fetchTrades']  (exchange, symbol)

    if (exchange.id === 'coinmarketcap') {

        log (await exchange.fetchTickers ())
        log (await exchange.fetchGlobal  ())

    } else if (exchange.id === 'coinbase') {

        // do nothing for now

    } else {

        await tests['fetchOrderBook']   (exchange, symbol)
        await tests['fetchL2OrderBook'] (exchange, symbol)
        await tests['fetchOrderBooks']  (exchange)
    }
}

//-----------------------------------------------------------------------------

let loadExchange = async exchange => {

    let markets = await exchange.loadMarkets ()

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

    exchange.checkRequiredCredentials ()

    // move to testnet/sandbox if possible before accessing the balance if possible
    if (exchange.urls['test'])
        exchange.urls['api'] = exchange.urls['test']

    let balance = await tests['fetchBalance'] (exchange)

    await tests['fetchFundingFees']  (exchange)
    await tests['fetchTradingFees']  (exchange)

    await tests['fetchOrders']       (exchange, symbol)
    await tests['fetchOpenOrders']   (exchange, symbol)
    await tests['fetchClosedOrders'] (exchange, symbol)
    await tests['fetchMyTrades']     (exchange, symbol)

    if (exchange.extendedTest) {

        await tests['InvalidNonce']      (exchange, symbol)
        await tests['OrderNotFound']     (exchange, symbol)
        await tests['InvalidOrder']      (exchange, symbol)
        await tests['InsufficientFunds'] (exchange, symbol, balance) // danger zone - won't execute with non-empty balance
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

            // add random origin for proxies
            if (exchange.proxy.length > 0)
                exchange.origin = exchange.uuid ()

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
        await testSymbol (exchange, exchangeSymbol)

    } else {

        await tryAllProxies (exchange, proxies)
    }

}) ()
