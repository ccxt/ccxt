import fs from 'fs'
import path from 'path'
import ansi from 'ansicolor'
import asTable from 'as-table'
import ololog from 'ololog'
import ccxt from '../../ts/ccxt.js'
import { Agent } from 'https'
import { add_static_result } from '../../utils/update-static-tests-data.js'

const fsPromises = fs.promises;
ansi.nice
const log = ololog.configure ({ locate: false }).unlimited
const { ExchangeError , NetworkError} = ccxt

function jsonStringify (obj: any, indent = undefined) {
    return JSON.stringify (obj, function(k, v) { return v === undefined ? null : v; }, indent);
}
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
    , isOption = process.argv.includes ('--option')
    , shouldCreateRequestReport = process.argv.includes ('--report') || process.argv.includes ('--request')
    , shouldCreateResponseReport = process.argv.includes ('--response')
    , shouldCreateBoth = process.argv.includes ('--static')
    , raw = process.argv.includes ('--raw')
    , noKeys = process.argv.includes ('--no-keys')

let foundDescription = undefined;
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--name') {
        foundDescription = process.argv[i + 1];
        // search that string in `params` and remove it
        for (let j = 0; j < params.length; j++) {
            if (params[j] === foundDescription) {
                params.splice(j, 1);
                break;
            }
        }
        break;
    }
}

//-----------------------------------------------------------------------------
if (!raw) {
    log ((new Date ()).toISOString())
    log ('Node.js:', process.version)
    log ('CCXT v' + ccxt.version)
}

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log.bright.red.error (e); log.red.error (e.message); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); log.red.error ((e as any).message); process.exit (1) })

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')

const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal
const settingsFile  = fs.readFileSync(keysFile);
// eslint-disable-next-line import/no-dynamic-require, no-path-concat
let settings = JSON.parse(settingsFile.toString())
settings = settings[exchangeId] || {}


//-----------------------------------------------------------------------------

const timeout = 30000
let exchange = undefined as any



const httpsAgent = new Agent ({
    ecdhCurve: 'auto',
    keepAlive: true,
})


// check here if we have a arg like this: binance.fetchOrders()
const callRegex = /\s*(\w+)\s*\.\s*(\w+)\s*\(([^()]*)\)/
if (callRegex.test (exchangeId)) {
    const res = callRegex.exec (exchangeId) as any;
    exchangeId = res[1];
    methodName = res[2];
    params = res[3].split(",").map(x => x.trim());
}

try {
    if ((ccxt.pro as any).exchanges.includes(exchangeId)) {
        exchange = new (ccxt.pro)[exchangeId] ({ timeout, httpsAgent, ... settings })
    } else {
        exchange = new (ccxt)[exchangeId] ({ timeout, httpsAgent, ... settings })
    }

    if (exchange === undefined) {
        process.exit ()
    }

    if (isSpot) {
        exchange.options['defaultType'] = 'spot';
    } else if (isSwap) {
        exchange.options['defaultType'] = 'swap';
    } else if (isFuture) {
        exchange.options['defaultType'] = 'future';
    } else if (isOption) {
        exchange.options['defaultType'] = 'option';
    }

    if (!noKeys) {
        // check auth keys in env var
        const requiredCredentials = exchange.requiredCredentials;
        for (const [credential, isRequired] of Object.entries (requiredCredentials)) {
            if (isRequired && exchange[credential] === undefined) {
                const credentialEnvName = (exchangeId + '_' + credential).toUpperCase () // example: KRAKEN_APIKEY
                let credentialValue = process.env[credentialEnvName]
                if (credentialValue) {
                    if (credentialValue.indexOf('---BEGIN') > -1) {
                        credentialValue = (credentialValue as any).replaceAll('\\n', '\n');
                    }
                    exchange[credential] = credentialValue
                }
            }
        }
    }

    if (testnet) {
        exchange.setSandboxMode (true)
    }

} catch (e) {

    log.red (e)
    printUsage ()
    process.exit ()
}

//-----------------------------------------------------------------------------

function createRequestTemplate(exchange, methodName, args, result) {
    const final = {
        'description': 'Fill this with a description of the method call',
        'method': methodName,
        'url': exchange.last_request_url ?? '',
        'input': args,
        'output': exchange.last_request_body ?? undefined
    }
    log('Report: (paste inside static/request/' + exchange.id + '.json ->' + methodName + ')')
    log.green('-------------------------------------------')
    log (JSON.stringify (final, null, 2))
    log.green('-------------------------------------------')
    if (foundDescription !== undefined) {
        final.description = foundDescription;
        log.green('auto-saving static result');
        add_static_result('request', exchange.id, methodName, final);
    }
}

//-----------------------------------------------------------------------------

function createResponseTemplate(exchange, methodName, args, result) {
    const final = {
        'description': 'Fill this with a description of the method call',
        'method': methodName,
        'input': args,
        'httpResponse': JSON.parse (exchange.last_http_response),
        'parsedResponse': result
    }
    log('Report: (paste inside static/response/' + exchange.id + '.json ->' + methodName + ')')
    log.green('-------------------------------------------')
    log (jsonStringify (final, 2))
    log.green('-------------------------------------------')
    if (foundDescription !== undefined) {
        final.description = foundDescription;
        log.green('auto-saving static result');
        add_static_result('response', exchange.id, methodName, final);
    }
}

//-----------------------------------------------------------------------------

function printSupportedExchanges () {
    log ('Supported exchanges:', (ccxt.exchanges.join (', ') as any).green)
}

//-----------------------------------------------------------------------------

function printUsage () {
    log ('This is an example of a basic command-line interface to all exchanges')
    log ('Usage: node', process.argv[1], ('id' as any).green, ('method' as any).yellow, ('"param1" param2 "param3" param4 ...' as any).blue)
    log ('Examples:')
    log ('node', process.argv[1], 'okcoin fetchOHLCV BTC/USD 15m')
    log ('node', process.argv[1], 'bitfinex fetchBalance')
    log ('node', process.argv[1], 'kraken fetchOrderBook ETH/BTC')
    printSupportedExchanges ()
    log ('Supported options:')
    log ('--verbose         Print verbose output')
    log ('--debug           Print debugging output')
    log ('--poll            Repeat continuously in rate-limited mode')
    log ('--no-send         Print the request but do not actually send it to the exchange (sets verbose and load-markets)')
    log ('--no-load-markets Do not pre-load markets (for debugging)')
    log ('--details         Print detailed fetch responses')
    log ('--no-table        Do not print the fetch response as a table')
    log ('--table           Print the fetch response as a table')
    log ('--iso8601         Print timestamps as ISO8601 datetimes')
    log ('--cors            use CORS proxy for debugging')
    log ('--sign-in         Call signIn() if any')
    log ('--sandbox         Use the exchange sandbox if available, same as --testnet')
    log ('--testnet         Use the exchange testnet if available, same as --sandbox')
    log ('--test            Use the exchange testnet if available, same as --sandbox')
    log ('--cache-markets   Cache the loaded markets in the .cache folder in the current directory')
}

//-----------------------------------------------------------------------------

const printHumanReadable = (exchange, result) => {
    if (raw) {
        return log (jsonStringify (result))
    }
    if (!no_table && Array.isArray (result) || table) {
        result = Object.values (result)
        let arrayOfObjects = (typeof result[0] === 'object')

        if (details)
            result.forEach (object => {
                if (arrayOfObjects)
                    log ('-------------------------------------------')
                log (object)
            })

        if (arrayOfObjects || table && Array.isArray (result)) {
            const configuredAsTable = (asTable as any).configure ({
                delimiter: (' | ' as any).lightGray.dim,
                right: true,
                title: x => (String (x) as any).lightGray,
                dash: ('-' as any).lightGray.dim,
                print: x => {
                    if (typeof x === 'object') {
                        const j = jsonStringify (x).trim ()
                        if (j.length < 100) return j
                    }
                    return String (x)
                }
            })
            log (result.length > 0 ? configuredAsTable (result.map (rawElement => {
                const element = Object.assign ({}, rawElement)
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
            log (result.length, 'objects');
        } else {
            console.dir (result, { depth: null })
            log (result.length, 'objects');
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
            .map (s => s.match (/^[0-9]{4}[-][0-9]{2}[-][0-9]{2}[T\s]?[0-9]{2}[:][0-9]{2}[:][0-9]{2}/g) ? exchange.parse8601 (s) : s)
            .map (s => (() => { 
                if (s.match ( /^\d+$/g)) return s < Number.MAX_SAFE_INTEGER ? Number (s) : s
                try {return eval ('(() => (' + s + ')) ()') } catch (e) { return s }
            }) ())

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
                exchange.markets = JSON.parse ((await fsPromises.readFile (path)).toString())
            } catch {
                await exchange.loadMarkets ()
                if (cache_markets) {
                    await fsPromises.writeFile (path, jsonStringify (exchange.markets))
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
                log.dim.noLocate ('-------------------------------------------')
                log.dim.noLocate (exchange.iso8601 (exchange.milliseconds ()))
                log.green.unlimited ({
                    url,
                    method,
                    headers,
                    body,
                })
            }
        }

        if (methodName) {

            if (typeof exchange[methodName] === 'function') {

                if (!raw) log (exchange.id + '.' + methodName, '(' + args.join (', ') + ')')

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
                        if (!isWsMethod && !raw) {
                            log (exchange.iso8601 (end), 'iteration', i++, 'passed in', end - start, 'ms\n')
                        }
                        printHumanReadable (exchange, result)
                        if (!isWsMethod && !raw) {
                            log (exchange.iso8601 (end), 'iteration', i, 'passed in', end - start, 'ms\n')
                        }
                        if (shouldCreateRequestReport || shouldCreateBoth) {
                            createRequestTemplate(exchange, methodName, args, result)
                        }
                        if (shouldCreateResponseReport || shouldCreateBoth) {
                            createResponseTemplate(exchange, methodName, args, result)
                        }
                        start = end
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

                    if (debug) {
                        if (httpsAgent.freeSockets) {
                            const keys = Object.keys (httpsAgent.freeSockets)
                            if (keys.length) {
                                const firstKey = keys[0]
                                let httpAgent = httpsAgent.freeSockets[firstKey];
                                log (firstKey, (httpAgent as any).length)
                            }
                        }
                    }

                    if (!poll && !isWsMethod){
                        break
                    }
                }

                exchange.close()

            } else if (exchange[methodName] === undefined) {
                log.red (exchange.id + '.' + methodName + ': no such property')
            } else {
                printHumanReadable (exchange, exchange[methodName])
            }
        } else {
            log (exchange)
        }
    }

}

//-----------------------------------------------------------------------------

run ()

export  {
}
