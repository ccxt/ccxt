#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import asTable from 'as-table'
import ccxt from '../ccxt.js'
import { Agent } from 'https'
import { add_static_result } from '../../utils/update-static-tests-data.js'

const fsPromises = fs.promises;


// ##########################################################
// ####### adopted from npmjs.com/package/yoctocolors #######
// ##########################################################

const colorString = () => {
    const _ = (open, close) => {
        const o = `\u001B[${open}m`, c = `\u001B[${close}m`;
        return str => { str = str + ''; return !str.includes(c) ? o + str + c : o + str.replaceAll(c, o) + c; };
    }
    return {
        reset: _(0, 0),
        bold: _(1, 22), dim: _(2, 22), italic: _(3, 23), underline: _(4, 24), overline: _(53, 55), inverse: _(7, 27), hidden: _(8, 28), strikethrough: _(9, 29),
        black: _(30, 39), red: _(31, 39), green: _(32, 39), yellow: _(33, 39), blue: _(34, 39), magenta: _(35, 39), cyan: _(36, 39), white: _(37, 39), gray: _(90, 39),
        bgBlack: _(40, 49), bgRed: _(41, 49), bgGreen: _(42, 49), bgYellow: _(43, 49), bgBlue: _(44, 49), bgMagenta: _(45, 49), bgCyan: _(46, 49), bgWhite: _(47, 49), bgGray: _(100, 49),
        redBright: _(91, 39), greenBright: _(92, 39), yellowBright: _(93, 39), blueBright: _(94, 39), magentaBright: _(95, 39), cyanBright: _(96, 39), whiteBright: _(97, 39),
        bgRedBright: _(101, 49), bgGreenBright: _(102, 49), bgYellowBright: _(103, 49), bgBlueBright: _(104, 49), bgMagentaBright: _(105, 49), bgCyanBright: _(106, 49), bgWhiteBright: _(107, 49)
    }
};
for (const [key,value] of Object.entries(colorString())) {
    // @ts-ignore
    String.prototype.__defineGetter__(key, function(){
        // @ts-ignore
        return value(this);
    });
}
// ##########################################################
// ##########################################################


function log (...args) {
    console.log (...args);
}

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

process.on ('uncaughtException',  (e: any)=> { log ((e.toString ()).red); log (e.message.red); process.exit (1); });
process.on ('unhandledRejection', (e: any)=> { log ((e.toString ()).red); log (e.message.red); process.exit (1); });

//-----------------------------------------------------------------------------
const currentFilePath = process.argv[1];
// if it's global installation, then show `ccxt` command, otherwise `node ./cli.js`
const commandToShow = currentFilePath.match (/npm(\\|\/)node_modules/) ? 'ccxt' : 'node ' + currentFilePath;

if (!exchangeId) {
    log (('Error, No exchange id specified!' as any).red);
    printUsage ();
    process.exit ();
}

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')


let allSettings = {}
if (fs.existsSync (keysGlobal)) {
    allSettings = JSON.parse(fs.readFileSync(keysGlobal).toString())
} else if (fs.existsSync (keysLocal)) {
    allSettings = JSON.parse(fs.readFileSync(keysLocal).toString())
} else {
    log ((`( Note, CCXT CLI is being loaded without api keys, because ${keysLocal} does not exist.  You can see the sample at https://github.com/ccxt/ccxt/blob/master/keys.json )` as any).yellow);
}

const settings = allSettings[exchangeId] ? allSettings[exchangeId] : {};


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

    log ((e.toString () as any).red)
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
    log(('-------------------------------------------' as any).green)
    log (JSON.stringify (final, null, 2))
    log(('-------------------------------------------' as any).green)
    if (foundDescription !== undefined) {
        final.description = foundDescription;
        log(('auto-saving static result' as any).green)
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
    log(('-------------------------------------------' as any).green)
    log (jsonStringify (final, 2))
    log(('-------------------------------------------' as any).green)
    if (foundDescription !== undefined) {
        final.description = foundDescription;
        log(('auto-saving static result' as any).green)
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
    log ('Usage:', commandToShow, ('exchangeid' as any).green, ('method' as any).yellow, ('"param1" param2 "param3" param4 ...' as any).blue)
    log ('Examples:')
    log (commandToShow, 'okcoin fetchOHLCV BTC/USD 15m')
    log (commandToShow, 'bitfinex fetchBalance')
    log (commandToShow, 'kraken fetchOrderBook ETH/BTC')
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
                log (('-------------------------------------------' as any).dim)
                log ((exchange.iso8601 (exchange.milliseconds ()) as any).dim)
                log ((JSON.stringify ({
                    url,
                    method,
                    headers,
                    body,
                }) as any).green)
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
                            log (((e.constructor.name + ' ' + e.message) as any).red)
                        } else if (e instanceof NetworkError) {
                            log (((e.constructor.name + ' ' + e.message) as any).yellow)
                        }

                        log (('---------------------------------------------------' as any).dim)

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
                log ((exchange.id + '.' + methodName + ': no such property' as any).red)
            } else {
                printHumanReadable (exchange, exchange[methodName])
            }
        } else {
            log (exchange)
        }
}

//-----------------------------------------------------------------------------

run ()

export  {
}
