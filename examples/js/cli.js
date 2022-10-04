import fs from 'fs'
import path from 'path'
import ansi from 'ansicolor'
import asTable from 'as-table'
import log from 'ololog'
import util from 'util'
import { execSync } from 'child_process'
import { ccxt } from '../../ccxt.js'
import { Agent } from 'https'

ansi.nice
const log2 = log.configure ({ locate: false }).unlimited
const { ExchangeError , NetworkError} = ccxt
//-----------------------------------------------------------------------------

let [processPath, , exchangeId, methodName, ... params] = process.argv.filter (x => !x.startsWith ('--'))
    , verbose = process.argv.includes ('--verbose')
    , debug = process.argv.includes ('--debug')
    , poll = process.argv.includes ('--poll')
    , no_send = process.argv.includes ('--no-send')
    , no_load_markets = process.argv.includes ('--no-load-markets')
    , details = process.argv.includes ('--details')
    , no_table = process.argv.includes ('--no-table')
    , table = process.argv.includes ('--table')
    , iso8601 = process.argv.includes ('--iso8601')
    , cors = process.argv.includes ('--cors')
    , cache_markets = process.argv.includes ('--cache-markets')
    , testnet =
        process.argv.includes ('--test') ||
        process.argv.includes ('--testnet') ||
        process.argv.includes ('--sandbox')
    , signIn = process.argv.includes ('--sign-in') || process.argv.includes ('--signIn')
    , isSpot = process.argv.includes ('--spot')
    , isSwap = process.argv.includes ('--swap')
    , isFuture = process.argv.includes ('--future')

//-----------------------------------------------------------------------------

console.log (new Date ())
console.log ('Node.js:', process.version)
console.log ('CCXT v' + ccxt.version)

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log2.bright.red.error (e); log2.red.error (e.message); process.exit (1) })
process.on ('unhandledRejection', e => { log2.bright.red.error (e); log2.red.error (e.message); process.exit (1) })

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')

let globalKeysFile = fs.existsSync (keysGlobal) ? keysGlobal : false
let localKeysFile = fs.existsSync (keysLocal) ? keysLocal : globalKeysFile
let settings = localKeysFile ? (require (localKeysFile)[exchangeId] || {}) : {}

//-----------------------------------------------------------------------------

const timeout = 30000
let exchange = undefined



const httpsAgent = new Agent ({
    ecdhCurve: 'auto',
    keepAlive: true,
})

try {
    if (ccxt.pro.exchanges.includes(exchangeId)) {
        exchange = new (ccxt.pro)[exchangeId] ({ timeout, httpsAgent, ... settings })
    } else {
        exchange = new (ccxt)[exchangeId] ({ timeout, httpsAgent, ... settings })
    }

    if (isSpot) {
        exchange.options['defaultType'] = 'spot';
    } else if (isSwap) {
        exchange.options['defaultType'] = 'swap';
    } else if (isFuture) {
        exchange.options['defaultType'] = 'future';
    }

    // check auth keys in env var
    const requiredCredentials = exchange.requiredCredentials;
    for (const [credential, isRequired] of Object.entries (requiredCredentials)) {
        if (isRequired && exchange[credential] === undefined) {
            const credentialEnvName = (exchangeId + '_' + credential).toUpperCase () // example: KRAKEN_APIKEY
            const credentialValue = process.env[credentialEnvName]
            if (credentialValue) {
                exchange[credential] = credentialValue
            }
        }
    }

    if (testnet) {
        exchange.setSandboxMode (true)
    }

} catch (e) {

    log2.red (e)
    printUsage ()
    process.exit ()
}

//-----------------------------------------------------------------------------

function printSupportedExchanges () {
    log2 ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

//-----------------------------------------------------------------------------

function printUsage () {
    log2 ('This is an example of a basic command-line interface to all exchanges')
    log2 ('Usage: node', process.argv[1], 'id'.green, 'method'.yellow, '"param1" param2 "param3" param4 ...'.blue)
    log2 ('Examples:')
    log2 ('node', process.argv[1], 'okcoin fetchOHLCV BTC/USD 15m')
    log2 ('node', process.argv[1], 'bitfinex fetchBalance')
    log2 ('node', process.argv[1], 'kraken fetchOrderBook ETH/BTC')
    printSupportedExchanges ()
    log2 ('Supported options:')
    log2 ('--verbose         Print verbose output')
    log2 ('--debug           Print debugging output')
    log2 ('--poll            Repeat continuously in rate-limited mode')
    log2 ('--no-send         Print the request but do not actually send it to the exchange (sets verbose and load-markets)')
    log2 ('--no-load-markets Do not pre-load markets (for debugging)')
    log2 ('--details         Print detailed fetch responses')
    log2 ('--no-table        Do not print the fetch response as a table')
    log2 ('--table           Print the fetch response as a table')
    log2 ('--iso8601         Print timestamps as ISO8601 datetimes')
    log2 ('--cors            use CORS proxy for debugging')
    log2 ('--sign-in         Call signIn() if any')
    log2 ('--sandbox         Use the exchange sandbox if available, same as --testnet')
    log2 ('--testnet         Use the exchange testnet if available, same as --sandbox')
    log2 ('--test            Use the exchange testnet if available, same as --sandbox')
    log2 ('--cache-markets   Cache the loaded markets in the .cache folder in the current directory')
}

//-----------------------------------------------------------------------------

const printHumanReadable = (exchange, result) => {
    if (!no_table && Array.isArray (result) || table) {
        result = Object.values (result)
        let arrayOfObjects = (typeof result[0] === 'object')

        if (details)
            result.forEach (object => {
                if (arrayOfObjects)
                    log2 ('-------------------------------------------')
                log2 (object)
            })

        if (arrayOfObjects || table && Array.isArray (result)) {
            const configuredAsTable = asTable.configure ({
                delimiter: ' | '.lightGray.dim,
                right: true,
                title: x => String (x).lightGray,
                dash: '-'.lightGray.dim,
                print: x => {
                    if (typeof x === 'object') {
                        const j = JSON.stringify (x).trim ()
                        if (j.length < 100) return j
                    }
                    return String (x)
                }
            })
            log2 (result.length > 0 ? configuredAsTable (result.map (element => {
                let keys = Object.keys (element)
                delete element['info']
                keys.forEach (key => {
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
                })
                return element
            })) : result)
            log2 (result.length, 'objects');
        } else {
            console.dir (result, { depth: null })
            log2 (result.length, 'objects');
        }
    } else {
        console.dir (result, { depth: null, maxArrayLength: null })
    }
}

//-----------------------------------------------------------------------------

async function run () {

    if (!exchangeId) {

        printUsage ()

    } else {

        let args = params
            .map (s => s.match (/^[0-9]{4}[-]?[0-9]{2}[-]?[0-9]{2}[T\s]?[0-9]{2}[:]?[0-9]{2}[:]?[0-9]{2}/g) ? exchange.parse8601 (s) : s)
            .map (s => (() => { try { return eval ('(() => (' + s + ')) ()') } catch (e) { return s } }) ())

        const www = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www

        if (cors) {
            exchange.proxy = 'https://cors-anywhere.herokuapp.com/';
            exchange.origin = exchange.uuid ()
        }

        no_load_markets = no_send ? true : no_load_markets

        if (debug) {
            exchange.verbose = verbose
        }

        const path = '.cache/' + exchangeId + '-markets.json'

        if (!no_load_markets) {
            try {
                await fsPromises.access (path, fs.constants.R_OK)
                exchange.markets = JSON.parse (await fsPromises.readFile (path))
            } catch {
                await exchange.loadMarkets ()
                if (cache_markets) {
                    await fsPromises.writeFile (path, JSON.stringify (exchange.markets))
                }
            }
        }

        if (signIn && exchange.has.signIn) {
            await exchange.signIn ()
        }

        exchange.verbose = verbose

        if (no_send) {

            exchange.verbose = no_send
            exchange.fetch = function fetch (url, method = 'GET', headers = undefined, body = undefined) {
                log2.dim.noLocate ('-------------------------------------------')
                log2.dim.noLocate (exchange.iso8601 (exchange.milliseconds ()))
                log2.green.unlimited ({
                    url,
                    method,
                    headers,
                    body,
                })
                process.exit ()
            }
        }

        if (methodName) {

            if (typeof exchange[methodName] === 'function') {

                log2 (exchange.id + '.' + methodName, '(' + args.join (', ') + ')')

                let start = exchange.milliseconds ()
                let end = exchange.milliseconds ()

                let i = 0;

                let isWsMethod = false
                if (methodName.startsWith("watch")) { // handle WS methods
                    isWsMethod = true;
                }

                while (true) {
                    try {
                        const result = await exchange[methodName] (... args)
                        end = exchange.milliseconds ()
                        if (!isWsMethod) {
                            console.log (exchange.iso8601 (end), 'iteration', i++, 'passed in', end - start, 'ms\n')
                        }
                        printHumanReadable (exchange, result)
                        if (!isWsMethod) {
                            console.log (exchange.iso8601 (end), 'iteration', i, 'passed in', end - start, 'ms\n')
                        }
                        start = end
                    } catch (e) {
                        if (e instanceof ExchangeError) {
                            log2.red (e.constructor.name, e.message)
                        } else if (e instanceof NetworkError) {
                            log2.yellow (e.constructor.name, e.message)
                        }

                        log2.dim ('---------------------------------------------------')

                        // rethrow for call-stack // other errors
                        throw e

                    }

                    if (debug) {
                        const keys = Object.keys (httpsAgent.freeSockets)
                        const firstKey = keys[0]
                        console.log (firstKey, httpsAgent.freeSockets[firstKey].length)
                    }

                    if (!poll && !isWsMethod){
                        break
                    }
                }

            } else if (exchange[methodName] === undefined) {
                log2.red (exchange.id + '.' + methodName + ': no such property')
            } else {
                printHumanReadable (exchange, exchange[methodName])
            }
        } else {
            console.log (exchange)
        }
    }

}

//-----------------------------------------------------------------------------

run ()

export  {
}
