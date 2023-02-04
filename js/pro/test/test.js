'use strict'

const fs = require ('fs')
    , log = require ('ololog').handleNodeErrors ()
    // eslint-disable-next-line import/no-dynamic-require, no-path-concat
    , ccxt = require (__dirname + '/../../../ccxt.js')

const [processPath, , exchangeId, exchangeSymbol] = process.argv.filter ((x) => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose') || false
const HttpsProxyAgent = require ('https-proxy-agent')

// ----------------------------------------------------------------------------

if (!exchangeId) {
    console.log ('Exchange id not specified')
    process.exit ()
}

const exchangeSymbols = require ('./pro-tests.json')
const symbol = exchangeSymbol || exchangeSymbols[exchangeId] || 'BTC/USDT'
log.bright ('\nTESTING', { exchangeId, symbol }, '\n')

// ----------------------------------------------------------------------------

const enableRateLimit = true

const { Agent } = require ('https')

const ecdhCurve = 'auto'
const agent = new Agent ({ ecdhCurve })

const timeout = 20000
const print = function printToFile (... args) {
    args = args.map ((x) => {
        if (typeof x === 'string') {
            return x
        } else if (x instanceof Date) {
            return x.toISOString ()
        } else {
            return JSON.stringify (x)
        }
    })
    fs.appendFileSync ('js.' + exchangeId + '.log', args.join (' ') + "\n")
}

const exchangeOptions = {
    agent,
    // verbose,
    enableRateLimit,
    timeout,
    // print,
}

const exchange = new (ccxt.pro)[exchangeId] (exchangeOptions)

// exchange.urls.api = exchange.urls.test

// ----------------------------------------------------------------------------

const tests = {}

// eslint-disable-next-line no-path-concat
const pathToExchangeTests = __dirname + '/Exchange/'
fs.readdirSync (pathToExchangeTests)
    .filter ((file) => file.match (/test.[a-zA-Z0-9_-]+.js$/))
    .forEach ((file) => {
        const key = file.slice (5, -3)
        // eslint-disable-next-line global-require, import/no-dynamic-require
        tests[key] = require (pathToExchangeTests + file)
    })

//-----------------------------------------------------------------------------

const keysGlobal = 'keys.json'
    , keysLocal = 'keys.local.json'
    , keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal
    // eslint-disable-next-line import/no-dynamic-require, no-path-concat
    , settings = require (__dirname + '/../../../' + keysFile)[exchangeId]

if (settings) {
    for (const key in settings) {
        if (settings[key]) {
            settings[key] = ccxt.deepExtend (exchange[key] || {}, settings[key])
        }
    }
}

Object.assign (exchange, settings)

if (settings && (settings.skip || settings.skipWs)) {
    log.error.bright ('[Skipped]', { exchangeId, symbol })
    process.exit ()
}

//-----------------------------------------------------------------------------

if (settings && settings.httpProxy) {
    const agent = new HttpsProxyAgent (settings.httpProxy)
    exchange.agent = agent;
}

//-----------------------------------------------------------------------------

async function testPublic (exchange, symbol) {
    await tests['watchOrderBook']   (exchange, symbol)
    await tests['watchTicker']      (exchange, symbol)
    await tests['watchTrades']      (exchange, symbol)
    await tests['watchOHLCV']       (exchange, symbol)
    // await tests['watchStatus']      (exchange)
    // await tests['watchHeartbeat']   (exchange)
    // await tests['watchL2OrderBook'] (exchange, symbol)
    // await tests['watchOrderBooks']  (exchange, symbol)
    // await tests['watchTickers']     (exchange, [ symbol ])
}

async function testPrivate (exchange, symbol, code) {
    if (exchange.checkRequiredCredentials (false)) {
        await tests['watchBalance']      (exchange)
        // await tests['watchOrders']       (exchange, symbol)
        // await tests['watchOpenOrders']   (exchange, symbol)
        // await tests['watchClosedOrders'] (exchange, symbol)
        await tests['watchMyTrades']     (exchange, symbol)
        // const code = exchange.markets[symbol]['quote']
        // await tests['watchLedger']       (exchange, code)
        // await tests['watchTransactions'] (exchange, code)
        // await tests['watchDeposits']     (exchange, code)
        // await tests['watchWithdrawals']  (exchange, code)
    }
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
            break
        }
    }

    log.green ('CODE:', code)
    log.green ('SYMBOL:', symbol)

    if ((symbol.indexOf ('.d') < 0)) {
        await testPublic  (exchange, symbol)
        await testPrivate (exchange, symbol, code)
    }
}

//-----------------------------------------------------------------------------

async function test () {
    if (exchange.alias) {
        console.log ('Skipped alias')
        process.exit ()
    }
    await exchange.loadMarkets ()
    exchange.verbose = verbose
    await testExchange (exchange, exchangeSymbol)
    console.log (new Date (), 'Done.')
    process.exit ()
}

test ()
