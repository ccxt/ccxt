"use strict";

//-----------------------------------------------------------------------------

const [processPath, , exchangeId, methodName, ... params] = process.argv.filter (x => !x.startsWith ('--'))
    , verbose = process.argv.includes ('--verbose')
    , cloudscrape = process.argv.includes ('--cloudscrape')
    , cfscrape = process.argv.includes ('--cfscrape')
    , poll = process.argv.includes ('--poll')
    , loadMarkets = process.argv.includes ('--load-markets')
    , no_details = process.argv.includes ('--no-details')
    , no_table = process.argv.includes ('--no-table')
    , iso8601 = process.argv.includes ('--iso8601')
    , no_info = process.argv.includes ('--no-info')

//-----------------------------------------------------------------------------

const ccxt         = require ('../../ccxt.js')
    , fs           = require ('fs')
    , path         = require ('path')
    , asTable      = require ('as-table')
    , util         = require ('util')
    , { execSync } = require ('child_process')
    , log          = require ('ololog').configure ({ locate: false })
    , { ExchangeError, NetworkError } = ccxt


//-----------------------------------------------------------------------------

require ('ansicolor').nice

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

//-----------------------------------------------------------------------------
// cloudscraper helper

const scrapeCloudflareHttpHeaderCookie = (url) =>

	(new Promise ((resolve, reject) => {

        const cloudscraper = require ('cloudscraper')
		return cloudscraper.get (url, function (error, response, body) {

			if (error) {

                log.red ('Cloudscraper error')
				reject (error)

			} else {

				resolve (response.request.headers)
			}
        })
    }))

const cfscrapeCookies = (url) => {

    const command = [
        `python -c "`,
        `import cfscrape; `,
        `import json; `,
        `tokens, user_agent = cfscrape.get_tokens('${url}'); `,
        `print(json.dumps({`,
            `'Cookie': '; '.join([key + '=' + tokens[key] for key in tokens]), `,
            `'User-Agent': user_agent`,
        `}));" 2> /dev/null`
    ].join ('')

    const output = execSync (command)
    return JSON.parse (output.toString ('utf8'))
}

//-----------------------------------------------------------------------------

const timeout = 30000
let exchange = undefined
try {

    exchange = new (ccxt)[exchangeId] ({ verbose, timeout })

} catch (e) {

    log.red (e)
    printUsage ()
    process.exit ()
}

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')

let globalKeysFile = fs.existsSync (keysGlobal) ? keysGlobal : false
let localKeysFile = fs.existsSync (keysLocal) ? keysLocal : globalKeysFile
let settings = localKeysFile ? (require (localKeysFile)[exchangeId] || {}) : {}

Object.assign (exchange, settings)

//-----------------------------------------------------------------------------

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

//-----------------------------------------------------------------------------

 function printUsage () {
    log ('This is an example of a basic command-line interface to all exchanges')
    log ('Usage: node', process.argv[1], 'id'.green, 'method'.yellow, '"param1" param2 "param3" param4 ...'.blue)
    log ('Examples:')
    log ('node', process.argv[1], 'okcoinusd fetchOHLCV BTC/USD 15m')
    log ('node', process.argv[1], 'bitfinex fetchBalance')
    log ('node', process.argv[1], 'kraken fetchOrderBook ETH/BTC')
    printSupportedExchanges ()
    log ('Supported options:')
    log ('--verbose         Print verbose output')
    log ('--cloudscrape     Use https://github.com/codemanki/cloudscraper to bypass Cloudflare')
    log ('--cfscrape        Use https://github.com/Anorov/cloudflare-scrape to bypass Cloudflare (requires python and cfscrape)')
    log ('--poll            Repeat continuously in rate-limited mode')
    log ('--load-markets    Pre-load markets (for debugging)')
    log ('--no-details      Do not print detailed fetch responses')
    log ('--no-table        Do not print tabulated fetch responses')
    log ('--iso8601         Print timestamps as ISO8601 datetimes')
}

//-----------------------------------------------------------------------------

const printHumanReadable = (exchange, result) => {

    if (Array.isArray (result)) {

        let arrayOfObjects = (typeof result[0] === 'object')

        if (!no_details)
            result.forEach (object => {
                if (arrayOfObjects)
                    log ('-------------------------------------------')
                log (object)
            })

        if (!no_table)
            if (arrayOfObjects) {
                log (result.length > 0 ? asTable (result.map (element => {
                    let keys = Object.keys (element)
                    if (no_info) {
                        delete element['info']
                    }
                    keys.forEach (key => {
                        if (typeof element[key] === 'number') {
                            if (!iso8601)
                                return element[key]
                            try {
                                const iso8601 = exchange.iso8601 (element[key])
                                if (iso8601.match (/^20[0-9]{2}[-]?/))
                                    element[key] = iso8601
                                else
                                    throw new Error ('wrong date')
                            } catch (e) {
                                return element[key]
                            }
                        }
                    })
                    return element
                })) : result)
            }

    } else {

        log.maxDepth (10).maxArrayLength (1000) (result)
    }
}

//-----------------------------------------------------------------------------


async function main () {

    const requirements = exchangeId && methodName
    if (!requirements) {

        printUsage ()

    } else {

        let args = params.map (param => {
            if (param === 'undefined')
                return undefined
            if (param[0] === '{' || param[0] === '[')
                return JSON.parse (param)
            if (param.match (/[0-9]{4}[-]?[0-9]{2}[-]?[0-9]{2}[T\s]?[0-9]{2}[:]?[0-9]{2}[:]?[0-9]{2}/g))
                return exchange.parse8601 (param)
            if (param.match (/[a-zA-Z-]/g))
                return param
            if (param.match (/^[+0-9\.-]+$/))
                return parseFloat (param)
            return param
        })

        const www = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www

        if (cloudscrape)
            exchange.headers = await scrapeCloudflareHttpHeaderCookie (www)

        if (cfscrape)
            exchange.headers = cfscrapeCookies (www)

        if (loadMarkets)
            await exchange.loadMarkets ()

        if (typeof exchange[methodName] === 'function') {

            log (exchange.id + '.' + methodName, '(' + args.join (', ') + ')')

            while (true) {

                try {

                    const result = await exchange[methodName] (... args)
                    printHumanReadable (exchange, result)

                } catch (e) {

                    if (e instanceof ExchangeError) {

                        log.red (e.constructor.name, e.message)

                    } else if (e instanceof NetworkError) {

                        log.yellow (e.constructor.name, e.message)

                    }

                    log.dim ('---------------------------------------------------')

                    // rethrow for call-stack // other errors
                    throw e

                }

                if (!poll)
                    break;
            }

        } else if (typeof exchange[methodName] === 'undefined') {

            log.red (exchange.id + '.' + methodName + ': no such property')

        } else {

            printHumanReadable (exchange, exchange[methodName])
        }
    }
}

//-----------------------------------------------------------------------------

main ()
