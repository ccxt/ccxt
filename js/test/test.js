'use strict'

// ----------------------------------------------------------------------------

const [processPath, , exchangeId = null, exchangeSymbol = null] = process.argv.filter ((x) => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose') || false
const debug = process.argv.includes ('--debug') || false

// ----------------------------------------------------------------------------

const fs = require ('fs')
    , assert = require ('assert')
    , { Agent } = require ('https')
    , ccxt = require ('../../ccxt.js') // eslint-disable-line import/order

// ----------------------------------------------------------------------------

process.on ('uncaughtException',  (e) => { console.log (e, e.stack); process.exit (1) })
process.on ('unhandledRejection', (e) => { console.log (e, e.stack); process.exit (1) })

// ----------------------------------------------------------------------------

console.log ('\nTESTING', { 'exchange': exchangeId, 'symbol': exchangeSymbol || 'all' }, '\n')

// ----------------------------------------------------------------------------

const proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/'
]

//-----------------------------------------------------------------------------

const enableRateLimit = true

const httpsAgent = new Agent ({
    'ecdhCurve': 'auto',
})

const timeout = 20000

const exchange = new (ccxt)[exchangeId] ({
    httpsAgent,
    verbose,
    enableRateLimit,
    debug,
    timeout,
})

//-----------------------------------------------------------------------------

const tests = {}
const properties = Object.keys (exchange.has)
properties
    // eslint-disable-next-line no-path-concat
    .filter ((property) => fs.existsSync (__dirname + '/Exchange/test.' + property + '.js'))
    .forEach ((property) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
        tests[property] = require (__dirname + '/Exchange/test.' + property + '.js')
    })

const errors = require ('../base/errors.js')

Object.keys (errors)
    // eslint-disable-next-line no-path-concat
    .filter ((error) => fs.existsSync (__dirname + '/errors/test.' + error + '.js'))
    .forEach ((error) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
        tests[error] = require (__dirname + '/errors/test.' + error + '.js')
    })

//-----------------------------------------------------------------------------

const keysGlobal = 'keys.json'
const keysLocal = 'keys.local.json'

const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal
// eslint-disable-next-line import/no-dynamic-require, no-path-concat
const settings = require (__dirname + '/../../' + keysFile)[exchangeId]

if (settings) {
    const keys = Object.keys (settings)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (settings[key]) {
            settings[key] = ccxt.deepExtend (exchange[key] || {}, settings[key])
        }
    }
}

Object.assign (exchange, settings)

if (settings && settings.skip) {
    console.log ('[Skipped]', { 'exchange': exchangeId, 'symbol': exchangeSymbol || 'all' })
    process.exit ()
}

//-----------------------------------------------------------------------------

async function testSymbol (exchange, symbol) {

    if (exchange.id !== 'coinmarketcap') {
        await tests['loadMarkets'] (exchange)
        await tests['fetchCurrencies'] (exchange)
    }

    await tests['fetchTicker']  (exchange, symbol)
    await tests['fetchTickers'] (exchange, symbol)
    await tests['fetchOHLCV']   (exchange, symbol)
    await tests['fetchTrades']  (exchange, symbol)

    if (exchange.id === 'coinmarketcap') {

        console.log (await exchange.fetchTickers ())
        console.log (await exchange.fetchGlobal  ())

    } else if (exchange.id === 'coinbase') {

        // nothing for now

    } else {

        await tests['fetchOrderBook']   (exchange, symbol)
        await tests['fetchL2OrderBook'] (exchange, symbol)
        await tests['fetchOrderBooks']  (exchange)
    }
}

//-----------------------------------------------------------------------------

async function loadExchange (exchange) {

    const markets = await exchange.loadMarkets ()

    assert (typeof exchange.markets === 'object', '.markets is not an object')
    assert (Array.isArray (exchange.symbols), '.symbols is not an array')
    assert (exchange.symbols.length > 0, '.symbols.length <= 0 (less than or equal to zero)')
    assert (Object.keys (exchange.markets).length > 0, 'Object.keys (.markets).length <= 0 (less than or equal to zero)')
    assert (exchange.symbols.length === Object.keys (exchange.markets).length, 'number of .symbols is not equal to the number of .markets')

    const symbols = [
        'BTC/CNY',
        'BTC/USD',
        'BTC/USDT',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'ETH/EUR',
        'ETH/JPY',
        'ETH/CNY',
        'ETH/USD',
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

    let result = exchange.symbols.filter ((symbol) => symbols.indexOf (symbol) >= 0)

    if (result.length > 0) {
        if (exchange.symbols.length > result.length) {
            result = result.join (', ') + ' + more...'
        } else {
            result = result.join (', ')
        }
    }

    console.log (exchange.symbols.length, 'symbols', result)
}

//-----------------------------------------------------------------------------

async function testExchange (exchange) {

    const codes = [
        'BTC',
        'ETH',
        'XRP',
        'LTC',
        'BCH',
        'EOS',
        'BNB',
        'BSV',
        'USDT',
        'ATOM',
        'BAT',
        'BTG',
        'DASH',
        'DOGE',
        'ETC',
        'IOTA',
        'LSK',
        'MKR',
        'NEO',
        'PAX',
        'QTUM',
        'TRX',
        'TUSD',
        'USD',
        'USDC',
        'WAVES',
        'XEM',
        'XMR',
        'ZEC',
        'ZRX',
    ]

    let code = codes[0]
    for (let i = 0; i < codes.length; i++) {
        if (codes[i] in exchange.currencies) {
            code = codes[i]
        }
    }

    await loadExchange (exchange)

    let symbol = exchange.symbols[0]
    const symbols = [
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'ETH/USD',
        'ETH/USDT',
        'BTC/JPY',
        'LTC/BTC',
        'ZRX/WETH',
    ]

    for (let i = 0; i < symbols.length; i++) {
        const s = symbols[i]
        if (exchange.symbols.includes (s)) {
            if ('active' in exchange.markets[s]) {
                if (exchange.markets[s]['active'] === undefined) {
                    symbol = s
                } else if (exchange.markets[s]['active']) {
                    symbol = s
                }
            } else {
                symbol = s
            }
            break
        }
    }

    if (exchange.id === 'okex') {
        // okex has different order creation params for spot and futures markets
        // this forces okex to use a spot market until there is a way to test
        // several markets per exchange
        symbol = 'BTC/USDT'
    }

    console.log ('SYMBOL:', symbol)
    if ((symbol.indexOf ('.d') < 0)) {
        await testSymbol (exchange, symbol)
    }

    if (!exchange.privateKey && (!exchange.apiKey || (exchange.apiKey.length < 1))) {
        return true
    }

    exchange.checkRequiredCredentials ()

    if (exchange['has']['signIn']) {
        await exchange.signIn ()
    }

    // move to testnet/sandbox if possible before accessing the balance
    // if (exchange.urls['test'])
    //    exchange.urls['api'] = exchange.urls['test']

    const balance = await tests['fetchBalance'] (exchange)

    await tests['fetchFundingFees']  (exchange)
    await tests['fetchTradingFees']  (exchange)
    await tests['fetchStatus'] (exchange)

    await tests['fetchOrders']       (exchange, symbol)
    await tests['fetchOpenOrders']   (exchange, symbol)
    await tests['fetchClosedOrders'] (exchange, symbol)
    await tests['fetchMyTrades']     (exchange, symbol)

    if ('fetchLedger' in tests) {
        await tests['fetchLedger'] (exchange, code)
    }

    await tests['fetchTransactions'] (exchange, code)
    await tests['fetchDeposits']     (exchange, code)
    await tests['fetchWithdrawals']  (exchange, code)
    await tests['fetchBorrowRate']   (exchange, code)
    await tests['fetchBorrowRates']  (exchange)

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
    //
    // try {
    //     let marketBuyOrder = await exchange.createMarketBuyOrder (exchange.symbols[0], 1)
    //     console.log (exchange.id, 'ok', marketBuyOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'market buy', e)
    // }
    //
    // try {
    //     let limitSellOrder = await exchange.createLimitSellOrder (exchange.symbols[0], 1, 3000)
    //     console.log (exchange.id, 'ok', limitSellOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'limit sell', e)
    // }
    //
    // try {
    //     let limitBuyOrder = await exchange.createLimitBuyOrder (exchange.symbols[0], 1, 3000)
    //     console.log (exchange.id, 'ok', limitBuyOrder)
    // } catch (e) {
    //     console.log (exchange.id, 'error', 'limit buy', e)
    // }
}

//-----------------------------------------------------------------------------

async function tryAllProxies (exchange, proxies) {

    const index = proxies.indexOf (exchange.proxy)
    let currentProxy = (index >= 0) ? index : 0
    const maxRetries = proxies.length

    if (settings && ('proxy' in settings)) {
        currentProxy = proxies.indexOf (settings.proxy)
    }

    for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

        try {

            exchange.proxy = proxies[currentProxy]

            // add random origin for proxies
            if (exchange.proxy.length > 0) {
                exchange.origin = exchange.uuid ()
            }

            await testExchange (exchange)

            break

        } catch (e) {

            currentProxy = ++currentProxy % proxies.length
            console.log ('[' + e.constructor.name + '] ' + e.message.slice (0, 200))
            if (e instanceof ccxt.DDoSProtection) {
                continue
            } else if (e instanceof ccxt.RequestTimeout) {
                continue
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                continue
            } else if (e instanceof ccxt.AuthenticationError) {
                return
            } else if (e instanceof ccxt.AuthenticationError) {
                return
            } else if (e instanceof ccxt.InvalidNonce) {
                return
            } else {
                throw e
            }
        }
    }
}

//-----------------------------------------------------------------------------

async function test () {

    if (exchangeSymbol) {

        await loadExchange (exchange)
        await testSymbol (exchange, exchangeSymbol)

    } else {

        await tryAllProxies (exchange, proxies)
    }

}

test ()
