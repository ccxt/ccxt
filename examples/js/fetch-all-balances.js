import { PAD_WITH_ZERO } from '../../js/src/base/functions/number.js';

//-----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';

import fs from 'fs';
import path from 'path';
import ansicolor from 'ansicolor';
import asTable from 'as-table';
import ololog from 'ololog';

ansicolor.nice
//-----------------------------------------------------------------------------

const table = asTable.configure ({
        delimiter: '|'.lightGray.dim,
        right: true,
        title: x => String (x).lightGray,
        print: x => {
            if (typeof x === 'object') {
                const j = JSON.stringify (x).trim ()
                if (j.length < 100) return j
            }
            return String (x)
        }
    }),
    { ROUND, DECIMAL_PLACES, decimalToPrecision, omit, unique, flatten, extend } = ccxt,
    log = ololog.handleNodeErrors ().noLocate.unlimited;

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')

const keysGlobalExists = fs.existsSync (keysGlobal)
const keysLocalExists = fs.existsSync (keysLocal)

if (!(keysGlobalExists || keysLocalExists)) {
    const lines = [
        'This script requires a keys.json or a keys.local.json file containing the API keys in JSON format',
        '{',
        '    "binance": {',
        '        "apiKey": "YOUR_API_KEY",',
        '        "secret": "YOUR_SECRET"',
        '    }',
        '    "bitfinex": {',
        '        "apiKey": "YOUR_API_KEY",',
        '        "secret": "YOUR_SECRET"',
        '    }',
        '}'
    ]
    const errorMessage = lines.join ("\n")
    log.red.bright (errorMessage)
    process.exit ()
}

let globalKeysFile = keysGlobalExists ? keysGlobal : false
let localKeysFile = keysLocalExists ? keysLocal : globalKeysFile
const dynamicLocalKeysFile = JSON.parse (fs.readFileSync (localKeysFile));
let settings = localKeysFile ? (dynamicLocalKeysFile || {}) : {}

//-----------------------------------------------------------------------------

const timeout = 30000

const coins = [
    'BTC',
    'ETH',
    'BNB',
    'EUR',
    'LTC',
    'USD',
    'USDC',
    'USDT',
    'BUSD',
    'XRP',
    'DOGE',
    'YFI',
    'LINK',
    'XLM',
    'ADA',
    'SOL',
]

function initializeAllExchanges () {
    let numErrors = 0
    const ignore = [
        'bcex',
        'bitsane',
        'chbtc',
        'coinbasepro',
        'jubi',
        'hitbtc',
        'bitstamp1',
        'bitfinex2',
        'upbit',
        'huobipro',
    ]
    const result = []
    ccxt.exchanges.filter (exchangeId => (!ignore.includes (exchangeId))).forEach (exchangeId => {
        try {
            const verbose = false
            const exchange = new ccxt[exchangeId] ({
                timeout,
                verbose,
                ... (settings[exchangeId] || {})
            })
            exchange.checkRequiredCredentials ()
            result.push (exchange)
        } catch (e) {
            numErrors++
            log.red (exchangeId, 'initialization failed', e.constructor.name, e.message.slice (0, 100));
        }
    })
    log ('Initialized', ccxt.exchanges.length - numErrors, 'of', ccxt.exchanges.length, 'exchanges,',
        numErrors, 'error' + (((numErrors < 1) || (numErrors > 1)) ? 's' : '') + ',',
        ignore.length, 'skipped')
    return result
}

(async () => {

    const exchanges = initializeAllExchanges ()
    console.log (exchanges.map (exchange => exchange.id))
    let results = []
    const priceOracle = new ccxt.gate ()
    const tickers = await priceOracle.fetchTickers ()
    await Promise.all (exchanges.map ((exchange) => (async function () {

        try {

            if (exchange.has['signIn']) {
                await exchange.signIn ()
            }

            const balance = await exchange.fetchTotalBalance ()
            if (!balance) {
                throw new Error (exchange.id + ' erroneous balance')
            }
            const keys = Object.keys (balance).sort ()
            const nonzeroBalance = {}
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                if (coins.includes (key)) {
                    const value = balance[key]
                    const valueToPrecision = decimalToPrecision (value, ROUND, 8, DECIMAL_PLACES)
                    if (valueToPrecision !== '0') {
                        nonzeroBalance[key] = valueToPrecision
                    }
                }
            }
            const numNonzeroKeys = Object.keys (nonzeroBalance).length
            if (numNonzeroKeys < 1) {
                log.yellow (exchange.id + ' empty balance')
            } else {
                log.green (exchange.id, numNonzeroKeys, 'currencies')
                results.push ({ exchange: exchange.id, ... nonzeroBalance })
            }

        } catch (e) {
            log.red (exchange.id, e.constructor.name, e.message.split ("\n")[0].slice (0, 100))
        }

    }) ()))

    results = ccxt.sortBy (results, 'exchange')

    const currencies = unique (flatten (results.map (result => Object.keys (omit (result, 'exchange')))))
    currencies.sort ()

    const total = {}
    for (let i = 0; i < currencies.length; i++) {
        const currency = currencies[i]
        let sum = 0
        results.forEach (result => {
            if (currency in result) {
                sum += parseFloat (result[currency])
            }
        })
        total[currency] = decimalToPrecision (sum, ROUND, 8, DECIMAL_PLACES)
    }

    results.push (extend ({ 'exchange': 'total' }, total))

    results = results.map (result => {
        let value = 0;
        const convertTo = 'USD'
        currencies.forEach (currency => {
            if (currency === convertTo) {
                if (currency in result) {
                    value += parseFloat (result[currency])
                }
            } else {
                const symbol = currency + '/' + convertTo
                if (symbol in tickers) {
                    if (currency in result) {
                        const ticker = tickers[symbol]
                        value += parseFloat (result[currency]) * ticker['last']
                    }
                }
            }
        })
        return extend ({
            'exchange': result.exchange,
            '$': decimalToPrecision (value, ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO),
        }, result);
    })

    const table = table (results)

    console.log (table)

    log (table)

    log.green ('Currencies:', currencies)

    console.log (new Date ())

}) ()
