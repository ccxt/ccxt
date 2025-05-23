import fs from 'fs';
import path from 'path';
import ansi from 'ansicolor';
import asTable from 'as-table';
import ololog from 'ololog';
import { Agent } from 'https';
// import { pathToFileURL } from 'url';
// import ccxt from '../ccxt.js';
import { createRequestTemplate, createResponseTemplate, countAllParams, jsonStringify } from './helpers.js';
import { getCacheDirectory, checkCache, saveCommand } from './cache.js';

let ccxt;

try {
    ccxt = await import ('ccxt');
    console.log ('CCXT version:', ccxt.version);
} catch (e) {
    ccxt = await import ('../../js/ccxt.js');
    console.log ('[local] CCXT version:', ccxt.version);
}

const fsPromises = fs.promises;
ansi.nice;
const log = ololog.configure ({ 'locate': false }).unlimited;
const { ExchangeError, NetworkError } = ccxt;

//-----------------------------------------------------------------------------

process.on ('uncaughtException', (e) => {
    log.bright.red.error (e); log.red.error (e.message); process.exit (1);
});
process.on ('unhandledRejection', (e) => {
    log.bright.red.error (e); log.red.error ((e as any).message); process.exit (1);
});

//-----------------------------------------------------------------------------
let [ processPath, , exchangeId, methodName, ...params ] = process.argv.filter ((x) => !x.startsWith ('--'));
const verbose = process.argv.includes ('--verbose');
const debug = process.argv.includes ('--debug');
const poll = process.argv.includes ('--poll');
const no_send = process.argv.includes ('--no-send');
let no_load_markets = process.argv.includes ('--no-load-markets');
const details = process.argv.includes ('--details');
const no_table = process.argv.includes ('--no-table');
const table = process.argv.includes ('--table');
const iso8601 = process.argv.includes ('--iso8601');
const cors = process.argv.includes ('--cors');
const cache_markets = process.argv.includes ('--cache-markets');
const testnet = process.argv.includes ('--test')
        || process.argv.includes ('--testnet')
        || process.argv.includes ('--sandbox');
const signIn = process.argv.includes ('--sign-in') || process.argv.includes ('--signIn');
const isSpot = process.argv.includes ('--spot');
const isSwap = process.argv.includes ('--swap');
const isFuture = process.argv.includes ('--future');
const isOption = process.argv.includes ('--option');
const shouldCreateRequestReport = process.argv.includes ('--report') || process.argv.includes ('--request');
const shouldCreateResponseReport = process.argv.includes ('--response');
const shouldCreateBoth = process.argv.includes ('--static');
const raw = process.argv.includes ('--raw');
const noKeys = process.argv.includes ('--no-keys');
const interactive = process.argv.includes ('--i');
const showHistory = process.argv.includes ('--history');
let foundDescription = undefined;
const nameIndex = process.argv.indexOf ('--name');
if (nameIndex >= 0) {
    foundDescription = process.argv[nameIndex + 1];
    // search that string in `params` and remove it
    const index = params.indexOf (foundDescription);
    if (index >= 0) {
        params.splice (index, 1);
    }
}

let lastParamObject;
let symbol;
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--param') {
        const nextParam = process.argv[i + 1];
        if (nextParam) {
            const paramIndex = params.indexOf (nextParam);
            if (paramIndex >= 0) {
                if (nextParam.indexOf ('=') >= 0) {
                    const parsed = nextParam.split ('=');
                    if (parsed.length === 2) {
                        if (!lastParamObject) {
                            lastParamObject = {};
                        }
                        const key = parsed[0];
                        const value = parsed[1];
                        if (key === 'symbol') {
                            symbol = value;
                        }
                        lastParamObject[key] = value;
                        params.splice (paramIndex, 1);
                    } else {
                        throw new Error ('Invalid usage of --param. Please provide a key=value pair after --param.');
                    }
                } else {
                    if (!lastParamObject) {
                        lastParamObject = {};
                    }
                    lastParamObject[nextParam] = true;
                }
            } else {
                throw new Error (`Unexpected error by parsing parameters: ${nextParam} is not found in params array.`);
            }
        } else {
            throw new Error ('Invalid usage of --param. Please provide a value after --param.');
        }
    }
}

let lastParam = params[params.length - 1];
// exclude parasitic single quotes. Can happen on some shell processors
if (lastParam?.includes ('{') && lastParam?.includes ('}')) {
    if (lastParam.startsWith ('\'{') && lastParam.endsWith ('}\'')) {
        lastParam = params[params.length - 1] = lastParam.substring (1, lastParam.length - 1);
    }
}
//-----------------------------------------------------------------------------
if (!raw) {
    log ((new Date ()).toISOString ());
    log ('Node.js:', process.version);
    log ('CCXT v' + ccxt.version);
}

const currentFilePath = process.argv[1];
// if it's global installation, then show `ccxt` command, otherwise `node ./cli.js`

const commandToShow = currentFilePath.match (/npm(\\|\/)node_modules/) ? 'ccxt-cli' : 'node ' + currentFilePath;

if (!exchangeId && !showHistory) {
    log (('Error, No exchange id specified!' as any).red);
    printUsage ();
    process.exit ();
}
//-----------------------------------------------------------------------------

let allSettings = {};
let exchange = undefined as any;

/**
 *
 */
function loadSettingsAndCreateExchange () {
    if (showHistory) {
        return;
    }
    // set up keys and settings, if any
    const keysGlobal = path.resolve ('keys.json');
    const keysLocal = path.resolve ('keys.local.json');

    if (fs.existsSync (keysGlobal)) {
        allSettings = JSON.parse (fs.readFileSync (keysGlobal).toString ());
    } else if (fs.existsSync (keysLocal)) {
        allSettings = JSON.parse (fs.readFileSync (keysLocal).toString ());
    } else {
    // log ((`( Note, CCXT CLI is being loaded without api keys, because ${keysLocal} does not exist.  You can see the sample at https://github.com/ccxt/ccxt/blob/master/keys.json )` as any).yellow);
    }

    const settings = allSettings[exchangeId] ? allSettings[exchangeId] : {};

    const timeout = 30000;
    const httpsAgent = new Agent ({
        'ecdhCurve': 'auto',
        'keepAlive': true,
    });
    // check here if we have a arg like this: binance.fetchOrders()
    const callRegex = /\s*(\w+)\s*\.\s*(\w+)\s*\(([^()]*)\)/;
    if (callRegex.test (exchangeId)) {
        const res = callRegex.exec (exchangeId) as any;
        exchangeId = res[1];
        methodName = res[2];
        params = res[3].split (',').map ((x) => x.trim ());
    }
    try {
        if ((ccxt.pro as any).exchanges.includes (exchangeId)) {
            exchange = new (ccxt.pro)[exchangeId] ({ timeout, httpsAgent, ...settings });
        } else {
            exchange = new (ccxt)[exchangeId] ({ timeout, httpsAgent, ...settings });
        }
        if (exchange === undefined) {
            process.exit ();
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
            for (const [ credential, isRequired ] of Object.entries (requiredCredentials)) {
                if (isRequired && exchange[credential] === undefined) {
                    const credentialEnvName = (exchangeId + '_' + credential).toUpperCase (); // example: KRAKEN_APIKEY
                    let credentialValue = process.env[credentialEnvName];
                    if (credentialValue) {
                        if (credentialValue.indexOf ('---BEGIN') > -1) {
                            credentialValue = (credentialValue as any).replaceAll ('\\n', '\n');
                        }
                        exchange[credential] = credentialValue;
                    }
                }
            }
        }
        if (testnet) {
            exchange.setSandboxMode (true);
        }
    } catch (e) {
        log.red (e);
        printUsage ();
        process.exit ();
    }
}

//-----------------------------------------------------------------------------

/**
 *
 */
function printSupportedExchanges () {
    log ('Supported exchanges:', (ccxt.exchanges.join (', ') as any).green);
}

//-----------------------------------------------------------------------------

/**
 *
 */
function printUsage () {
    log ('This is an example of a basic command-line interface to all exchanges');
    log ('Usage:', commandToShow, ('id' as any).green, ('method' as any).yellow, ('"param1" param2 "param3" param4 ...' as any).blue);
    log ('Examples:');
    log (commandToShow, 'okcoin fetchOHLCV BTC/USD 15m');
    log (commandToShow, 'bitfinex fetchBalance');
    log (commandToShow, 'kraken fetchOrderBook ETH/BTC');
    log ('node', process.argv[1], 'binance fetchTrades BTC/USDC undefined undefined --param until=1746988377067');
    printSupportedExchanges ();
    log ('Supported options:');
    log ('--verbose         Print verbose output');
    log ('--debug           Print debugging output');
    log ('--i               Enables an interactive mode (keeps CLI open)');
    log ('--poll            Repeat continuously in rate-limited mode');
    log ('--no-send         Print the request but do not actually send it to the exchange (sets verbose and load-markets)');
    log ('--no-load-markets Do not pre-load markets (for debugging)');
    log ('--details         Print detailed fetch responses');
    log ('--no-table        Do not print the fetch response as a table');
    log ('--table           Print the fetch response as a table');
    log ('--iso8601         Print timestamps as ISO8601 datetimes');
    log ('--param key=value Set a custom key=value pair for the last method\'s argument. Can be repeated multiple times');
    log ('                  NOTE: don\'t forget to fill up missed arguments with "undefined" before last options parameter');
    log ('--cors            use CORS proxy for debugging');
    log ('--sign-in         Call signIn() if any');
    log ('--sandbox         Use the exchange sandbox if available, same as --testnet');
    log ('--testnet         Use the exchange testnet if available, same as --sandbox');
    log ('--test            Use the exchange testnet if available, same as --sandbox');
    log ('--cache-markets   Cache the loaded markets in the .cache folder in the current directory');
}

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

/**
 *
 */
function printSavedCommand () {
    const cachePath = getCacheDirectory ();
    const historyPath = path.join (cachePath, 'history');
    const historyFile = path.join (historyPath, 'commands.json');
    const list = JSON.parse (fs.readFileSync (historyFile).toString ()) || [];
    printHumanReadable ('', list);
}

//-----------------------------------------------------------------------------
const printHumanReadable = (exchange, result) => {
    if (raw) {
        return log (jsonStringify (result));
    }
    if (!no_table && Array.isArray (result) || table) {
        result = Object.values (result);
        const arrayOfObjects = (typeof result[0] === 'object');
        if (details) {
            result.forEach ((object) => {
                if (arrayOfObjects) log ('-------------------------------------------');
                log (object);
            });
        }
        if (arrayOfObjects || table && Array.isArray (result)) {
            const configuredAsTable = (asTable as any).configure ({
                'delimiter': (' | ' as any).lightGray.dim,
                'right': true,
                'title': (x) => (String (x) as any).lightGray,
                'dash': ('-' as any).lightGray.dim,
                'print': (x) => {
                    if (typeof x === 'object') {
                        const j = jsonStringify (x).trim ();
                        if (j.length < 100) return j;
                    }
                    return String (x);
                },
            });
            log (result.length > 0 ? configuredAsTable (result.map ((rawElement) => {
                const element = { ...rawElement };
                const keys = Object.keys (element);
                delete element['info'];
                keys.forEach ((key) => {
                    if (!iso8601) return element[key];
                    try {
                        const iso8601 = exchange.iso8601 (element[key]);
                        if (iso8601.match (/^20[0-9]{2}[-]?/)) element[key] = iso8601;
                        else throw new Error ('wrong date');
                    } catch (e) {
                        return element[key];
                    }
                });
                return element;
            })) : result);
            log (result.length, 'objects');
        } else {
            console.dir (result, { 'depth': null });
            log (result.length, 'objects');
        }
    } else {
        console.dir (result, { 'depth': null, 'maxArrayLength': null });
    }
};

//-----------------------------------------------------------------------------

/**
 *
 * @param exchange
 */
function setNoSend (exchange: ccxt.Exchange) {
    exchange.verbose = true;
    exchange.fetch = function fetch (
        url,
        method = 'GET',
        headers = undefined,
        body = undefined
    ) {
        log.dim.noLocate ('-------------------------------------------');
        log.dim.noLocate (exchange.iso8601 (exchange.milliseconds ()));
        log.green.unlimited ({
            url,
            method,
            headers,
            body,
        });
    };
    return exchange;
}

//-----------------------------------------------------------------------------

/**
 *
 * @param exchange
 */
async function handleMarketsLoading (exchange: ccxt.Exchange) {
    const cachePath = getCacheDirectory ();
    const marketsPath = path.join (cachePath, 'markets', exchangeId + '.json');
    // console.log (marketsPath);
    // try {
    //     await fsPromises.access (marketsPath, fs.constants.R_OK);
    //     exchange.markets = JSON.parse (
    //         (await fsPromises.readFile (marketsPath)).toString ()
    //     );
    // } catch {
    //     await exchange.loadMarkets ();
    //     if (cache_markets) {
    //         await fsPromises.writeFile (marketsPath, jsonStringify (exchange.markets));
    //     }
    // }
    try {
        if (fs.existsSync (marketsPath)) {
            const stats = fs.statSync (marketsPath);
            const now = new Date ().getTime ();
            const diff = now - stats.mtime.getTime ();
            if (diff > 3 * 24 * 60 * 60 * 1000) { // diff > 3 days
                await exchange.loadMarkets ();
                if (cache_markets) {
                    await fsPromises.writeFile (marketsPath, jsonStringify (exchange.markets));
                }
            } else {
                exchange.markets = JSON.parse (
                    fs.readFileSync (marketsPath).toString ()
                );
            }
        } else {
            // create file and save markets
            await exchange.loadMarkets ();
            await fsPromises.writeFile (marketsPath, jsonStringify (exchange.markets));
        }
    } catch (e) {
        log.red ('loadMarkets:', e);
        // error loading/cacheing markets
    }
}

//-----------------------------------------------------------------------------

/**
 *
 * @param exchange
 * @param params
 */
function parseMethodArgs (exchange, params) {
    const args = params
        .map ((s) => (s.match (/^[0-9]{4}[-][0-9]{2}[-][0-9]{2}[T\s]?[0-9]{2}[:][0-9]{2}[:][0-9]{2}/g) ? exchange.parse8601 (s) : s))
        .map ((s) => (() => {
            if (s.match (/^\d+$/g)) return s < Number.MAX_SAFE_INTEGER ? Number (s) : s;
            try {
                return eval ('(() => (' + s + ')) ()');
            } catch (e) {
                return s;
            }
        }) ());
    return args;
}

//-----------------------------------------------------------------------------

/**
 *
 */
async function run () {
    loadSettingsAndCreateExchange ();
    checkCache ();

    if (showHistory) {
        printSavedCommand ();
        process.exit ();
    }

    if (!exchangeId) {
        printUsage ();
        process.exit ();
    }

    let args = parseMethodArgs (exchange, params);
    saveCommand (args.join (' '));

    if (cors) {
        exchange.proxy = 'https://cors-anywhere.herokuapp.com/';
        exchange.origin = exchange.uuid ();
    }

    if (debug) {
        exchange.verbose = verbose;
    }

    no_load_markets = no_send ? true : no_load_markets;
    if (!no_load_markets) {
        await handleMarketsLoading (exchange);
    }

    if (symbol && lastParamObject) {
        let marketId;
        try {
            marketId = exchange.marketId (symbol);
        } catch (e) {
            // noop possible loaded from cache
        }
        if (!marketId) {
            try {
                await exchange.loadMarkets ();
                marketId = exchange.marketId (symbol);
            } catch (e) {
                // noop
            }
        }
        if (marketId) {
            lastParamObject.symbol = marketId;
        }
    }

    if (typeof lastParamObject === 'object') {
        const lastArgument = args[args.length - 1];
        if (lastParam && typeof lastArgument === 'object') {
            args[args.length - 1] = Object.assign (lastArgument, lastParamObject);
        } else {
            args.push (lastParamObject);
        }
    }

    if (signIn && exchange.has.signIn) {
        await exchange.signIn ();
    }

    exchange.verbose = verbose;

    if (no_send) {
        exchange = setNoSend (exchange);
    }

    if (methodName) {
        if (typeof exchange[methodName] === 'function') {
            if (!raw || details) {
                const methodArgsPrint = JSON.stringify (args);
                log (exchange.id + '.' + methodName, '(' + methodArgsPrint.substring (1, methodArgsPrint.length - 1) + ')');
            }
            let start = exchange.milliseconds ();
            let end = exchange.milliseconds ();
            let i = 0;
            let isWsMethod = false;
            if (methodName.startsWith ('watch')) {
                // handle WS methods
                isWsMethod = true;
            }
            while (true) {
                try {
                    const fn = exchange[methodName];
                    const fnParams = countAllParams (fn);
                    const argsContainsParams = args.find ((arg) => arg && typeof arg === 'object' && !Array.isArray (arg) && Object.keys (arg).length > 0);
                    if (argsContainsParams && fnParams !== args.length) {
                        // populate the missing params with undefined
                        const missingParams = fnParams - args.length;
                        const paramsObj = args[args.length - 1];
                        args.pop ();
                        const newArgsArray = args;
                        for (let i = 0; i < missingParams; i++) {
                            newArgsArray.push (undefined);
                        }
                        newArgsArray.push (paramsObj);
                        args = newArgsArray;
                    }
                    const result = await exchange[methodName] (...args);
                    end = exchange.milliseconds ();
                    if (!isWsMethod && !raw) {
                        log (
                            exchange.iso8601 (end),
                            'iteration',
                            i++,
                            'passed in',
                            end - start,
                            'ms\n'
                        );
                    }
                    printHumanReadable (exchange, result);
                    if (!isWsMethod && !raw) {
                        log (
                            exchange.iso8601 (end),
                            'iteration',
                            i,
                            'passed in',
                            end - start,
                            'ms\n'
                        );
                    }
                    if (shouldCreateRequestReport || shouldCreateBoth) {
                        createRequestTemplate (exchange, methodName, args, result);
                    }
                    if (shouldCreateResponseReport || shouldCreateBoth) {
                        createResponseTemplate (exchange, methodName, args, result);
                    }
                    start = end;
                } catch (e) {
                    if (e instanceof ExchangeError) {
                        log.red (e.constructor.name, e.message);
                    } else if (e instanceof NetworkError) {
                        log.yellow (e.constructor.name, e.message);
                    }
                    log.dim ('---------------------------------------------------');
                    // rethrow for call-stack // other errors
                    throw e;
                }
                if (debug) {
                    if (httpsAgent.freeSockets) {
                        const keys = Object.keys (httpsAgent.freeSockets);
                        if (keys.length) {
                            const firstKey = keys[0];
                            const httpAgent = httpsAgent.freeSockets[firstKey];
                            log (firstKey, (httpAgent as any).length);
                        }
                    }
                }
                if (!poll && !isWsMethod && !interactive) {
                    break;
                }
            }
            exchange.close ();
        } else if (exchange[methodName] === undefined) {
            log.red (exchange.id + '.' + methodName + ': no such property');
        } else {
            printHumanReadable (exchange, exchange[methodName]);
        }
    } else {
        log (exchange);
    }
}
//-----------------------------------------------------------------------------
run ();

export {
};

