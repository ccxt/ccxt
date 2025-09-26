import ololog from 'ololog';
import ansi from 'ansicolor';
import fs from 'fs';
import path from 'path';
import asTable from 'as-table';
import { Agent } from 'https';
import readline from 'readline';
import { getCacheDirectory, getExchangeSettings, loadConfigFile } from './cache.js';

ansi.nice;
const log = ololog.configure ({ 'locate': false }).unlimited;
let add_static_result;

try {
    add_static_result = (await import ('../../utils/update-static-tests-data.js')).add_static_result;
} catch (e) {
    // noop
}
let ccxt;
try {
    // @ts-ignore
    ccxt = await import ('ccxt');
} catch (e) {
    try {
        // @ts-ignore
        // we import like this to trick tsc and avoid the crawling on the
        // local ccxt project
        ccxt = await (Function ('return import("../../ts/ccxt")') ());
    } catch (ee) {
        log.error (ee);
        log.error ('Neither a local installation nor a global CCXT installation was detected, make `npm i` first, Also make sure your local ccxt version does not contain any syntax errors.');
        process.exit (1);
    }
}

const fsPromises = fs.promises;

const httpsAgent = new Agent ({
    'ecdhCurve': 'auto',
    'keepAlive': true,
});

//-----------------------------------------------------------------------------

/**
 *
 * @param obj
 * @param indent
 */
function jsonStringify (obj: any, indent = undefined) {
    return JSON.stringify (obj, (k, v) => (v === undefined ? null : v), indent);
}

/**
 *
 * @param fn
 */
function countAllParams (fn) {
    const fnStr = fn
        .toString ()
        .replace (/\/\/.*$/gm, '')
        .replace (/\/\*[\s\S]*?\*\//gm, '')
        .replace (/\s+/g, '');

    const match = fnStr.match (/^[^(]*\(([^)]*)\)/);
    if (!match) return 0;

    const params = match[1].split (',').filter ((p) => p);
    return params.length;
}

/**
 *
 * @param fn
 * @param args
 */
function injectMissingUndefined (fn, args) {
    const fnParams = countAllParams (fn);
    const argsContainsParams = args.find (
        (arg) => arg
      && typeof arg === 'object'
      && !Array.isArray (arg)
      && Object.keys (arg).length > 0
    );
    if (argsContainsParams && fnParams !== args.length) {
    // populate the missing params with undefined
        const missingParams = fnParams - args.length;
        const paramsObj = args[args.length - 1];
        args.pop ();
        const newArgsArray = args;
        const isPartialFunction = fn.toString ().indexOf ('(params = {}, context = {})');
        for (let j = 0; j < missingParams; j++) {
            newArgsArray.push (undefined);
        }
        newArgsArray.push (paramsObj);
        if (isPartialFunction) {
            newArgsArray.reverse ();
        }
        args = newArgsArray;
    }
    console.log (args);
    return args;
}

/**
 *
 * @param path
 * @param content
 */
async function writeFile (filePath, content) {
    try {
        await fsPromises.writeFile (filePath, content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fsPromises.mkdir (path.dirname (filePath), { 'recursive': true });
            await fsPromises.writeFile (filePath, content);
        }
    }
}

/**
 *
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
function createRequestTemplate (cliOptions, exchange, methodName, args, result) {
    const final = {
        'description': 'Fill this with a description of the method call',
        'method': methodName,
        'url': exchange.last_request_url ?? '',
        'input': args,
        'output': exchange.last_request_body ?? undefined,
    };
    log (
        'Report: (paste inside static/request/'
      + exchange.id
      + '.json ->'
      + methodName
      + ')'
    );
    log.green ('-------------------------------------------');
    log (JSON.stringify (final, null, 2));
    log.green ('-------------------------------------------');
    if (cliOptions.name) {
        final.description = cliOptions.name;
        log.green ('auto-saving static result');
        add_static_result ('request', exchange.id, methodName, final);
    }
}

//-----------------------------------------------------------------------------

/**
 *
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
function createResponseTemplate (cliOptions, exchange, methodName, args, result) {
    const final = {
        'description': 'Fill this with a description of the method call',
        'method': methodName,
        'input': args,
        'httpResponse': exchange.parseJson (exchange.last_http_response),
        'parsedResponse': result,
    };
    log (
        'Report: (paste inside static/response/'
      + exchange.id
      + '.json ->'
      + methodName
      + ')'
    );
    log.green ('-------------------------------------------');
    log (jsonStringify (final, 2));
    log.green ('-------------------------------------------');
    if (cliOptions.name) {
        final.description = cliOptions.name;
        log.green ('auto-saving static result');
        add_static_result ('response', exchange.id, methodName, final);
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
 * @param commandToShow
 */
function printUsage (commandToShow) {
    log ('This is an example of a basic command-line interface to all exchanges');
    log (
        'Usage:',
        commandToShow,
        ('id' as any).green,
        ('method' as any).yellow,
        ('"param1" param2 "param3" param4 ...' as any).blue
    );
    log ('Examples:');
    log (commandToShow, 'okcoin fetchOHLCV BTC/USD 15m');
    log (commandToShow, 'bitfinex fetchBalance');
    log (commandToShow, 'kraken fetchOrderBook ETH/BTC');
    log (
        'node',
        process.argv[1],
        'binance fetchTrades BTC/USDC undefined undefined --param until=1746988377067'
    );
    printSupportedExchanges ();
    log ('Supported options:');
    log ('--verbose         Print verbose output');
    log ('--debug           Print debugging output');
    log ('--i               Enables an interactive mode (keeps CLI open)');
    log ('--poll            Repeat continuously in rate-limited mode');
    log (
        '--no-send         Print the request but do not actually send it to the exchange (sets verbose and load-markets)'
    );
    log ('--no-load-markets Do not pre-load markets (for debugging)');
    log ('--details         Print detailed fetch responses');
    log ('--no-table        Do not print the fetch response as a table');
    log ('--table           Print the fetch response as a table');
    log ('--iso8601         Print timestamps as ISO8601 datetimes');
    log (
        "--param key=value Set a custom key=value pair for the last method's argument. Can be repeated multiple times"
    );
    log (
        '                  NOTE: don\'t forget to fill up missed arguments with "undefined" before last options parameter'
    );
    log ('--cors            use CORS proxy for debugging');
    log ('--sign-in         Call signIn() if any');
    log (
        '--sandbox         Use the exchange sandbox if available, same as --testnet'
    );
    log (
        '--testnet         Use the exchange testnet if available, same as --sandbox'
    );
    log (
        '--test            Use the exchange testnet if available, same as --sandbox'
    );
    log (
        '--cache-markets   Cache the loaded markets in the .cache folder in the current directory'
    );
}

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

/**
 *
 * @param cliOptions
 */
function printSavedCommand (cliOptions) {
    const cachePath = getCacheDirectory ();
    const historyPath = path.join (cachePath, 'history');
    const historyFile = path.join (historyPath, 'commands.json');
    const list = JSON.parse (fs.readFileSync (historyFile).toString ()) || [];
    const listWithIds = [];
    for (let i = 0; i < list.length; i++) {
        listWithIds.push ({ 'index': i + 1, 'command': list[i] });
    }
    printHumanReadable ('', listWithIds, cliOptions, true);
}

//-----------------------------------------------------------------------------

const printHumanReadable = (exchange, result, cliOptions, useTable = false) => {
    if (cliOptions.raw) {
        return log (jsonStringify (result));
    }
    if (cliOptions.table && Array.isArray (result) || useTable) {
        result = Object.values (result);
        const arrayOfObjects = typeof result[0] === 'object';
        if (cliOptions.details) {
            result.forEach ((object) => {
                if (arrayOfObjects) log ('-------------------------------------------');
                log (object);
            });
        }
        if (arrayOfObjects || (cliOptions.table && Array.isArray (result))) {
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
            log (
                result.length > 0
                    ? configuredAsTable (
                        result.map ((rawElement) => {
                            const element = { ...rawElement };
                            const keys = Object.keys (element);
                            delete element['info'];
                            keys.forEach ((key) => {
                                if (!cliOptions.iso8601) return element[key];
                                try {
                                    const iso8601 = exchange.iso8601 (element[key]);
                                    if (iso8601.match (/^20[0-9]{2}[-]?/)) element[key] = iso8601;
                                    else throw new Error ('wrong date');
                                } catch (e) {
                                    return element[key];
                                }
                            });
                            return element;
                        })
                    )
                    : result
            );
            log (result.length, 'objects');
        } else {
            console.dir (result, { 'depth': null });
            log (result.length, 'objects');
        }
    } else {
        console.dir (result, { 'depth': null, 'maxArrayLength': null });
    }
};

/**
 *
 * @param exchange
 * @param forceCache
 */
async function handleMarketsLoading (
    exchange: any,
    forceRefresh = false
) {
    const cachePath = getCacheDirectory ();
    const cacheConfig = loadConfigFile ();
    const marketsPath = path.join (cachePath, 'markets', exchange.id + '.json');
    const currenciesPath = path.join (cachePath, 'currencies', exchange.id + '.json');
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
            if (diff > cacheConfig.refreshMarketsTimeout || forceRefresh) {
                await exchange.loadMarkets ();
                await writeFile (marketsPath, jsonStringify (exchange.markets));
                await writeFile (currenciesPath, jsonStringify (exchange.currencies));
            } else {
                exchange.currencies = JSON.parse (fs.readFileSync (currenciesPath).toString ());
                const markets = JSON.parse (fs.readFileSync (marketsPath).toString ());
                exchange.setMarkets (markets);
            }
        } else {
            // create file and save markets
            await exchange.loadMarkets ();
            await writeFile (marketsPath, jsonStringify (exchange.markets));
            await writeFile (currenciesPath, jsonStringify (exchange.currencies));
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
 */
function setNoSend (exchange: any) {
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

/**
 *
 * @param exchange
 * @param params
 * @param methodName
 * @param cliOptions
 */
function parseMethodArgs (exchange, params, methodName, cliOptions, inject = true): any[] {
    let args = params
        .map ((s) => (s.match (
            /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}[T\s]?[0-9]{2}[:][0-9]{2}[:][0-9]{2}/g
        )
            ? exchange.parse8601 (s)
            : s))
        .map ((s) => (() => {
            if (s.match (/^\d+$/g)) return s < Number.MAX_SAFE_INTEGER ? Number (s) : s;
            try {
                return eval ('(() => (' + s + ')) ()');
            } catch (e) {
                return s;
            }
        }) ());
    if (cliOptions.param && Object.keys (cliOptions.param).length > 0) {
    // params were provided like --param a=b
        args.push (cliOptions.param);
    }
    if (inject) {
        args = injectMissingUndefined (exchange[methodName], args);
    }
    return args;
}

/**
 *
 * @param exchangeId
 * @param cliOptions
 */
async function loadSettingsAndCreateExchange (
    exchangeId,
    cliOptions,
    printUsageOnly = false
) {
    let exchange;
    let allSettings = {};

    // set up keys and settings, if any
    const keysGlobal = path.resolve ('keys.json');
    const keysLocal = path.resolve ('keys.local.json');

    if (fs.existsSync (keysGlobal)) {
        allSettings = JSON.parse (fs.readFileSync (keysGlobal).toString ());
    }
    if (fs.existsSync (keysLocal)) {
        const localSettings = JSON.parse (fs.readFileSync (keysLocal).toString ());
        allSettings = { ...allSettings, ...localSettings };
    }
    // log ((`( Note, CCXT CLI is being loaded without api keys, because ${keysLocal} does not exist.  You can see the sample at https://github.com/ccxt/ccxt/blob/master/keys.json )` as any).yellow);

    const exchangeSettings = getExchangeSettings (exchangeId);

    const settings = allSettings[exchangeId] ? allSettings[exchangeId] : {};

    const finalSettings = { ...exchangeSettings, ...settings };

    const timeout = 30000;

    try {
        if ((ccxt.pro as any).exchanges.includes (exchangeId)) {
            exchange = new ccxt.pro[exchangeId] ({ timeout, httpsAgent, ...finalSettings });
        } else {
            exchange = new ccxt[exchangeId] ({ timeout, httpsAgent, ...finalSettings });
        }
        if (exchange === undefined) {
            process.exit ();
        }
        if (cliOptions.spot) {
            exchange.options['defaultType'] = 'spot';
        } else if (cliOptions.swap) {
            exchange.options['defaultType'] = 'swap';
        } else if (cliOptions.future) {
            exchange.options['defaultType'] = 'future';
        } else if (cliOptions.option) {
            exchange.options['defaultType'] = 'option';
        }
        if (cliOptions.keys) {
            // check auth keys in env var
            const requiredCredentials = exchange.requiredCredentials;
            for (const [ credential, isRequired ] of Object.entries (
                requiredCredentials
            )) {
                if (isRequired && exchange[credential] === undefined) {
                    const credentialEnvName = (
                        exchangeId
            + '_'
            + credential
                    ).toUpperCase (); // example: KRAKEN_APIKEY
                    let credentialValue = process.env[credentialEnvName];
                    if (credentialValue) {
                        if (credentialValue.indexOf ('---BEGIN') > -1) {
                            credentialValue = (credentialValue as any).replaceAll (
                                '\\n',
                                '\n'
                            );
                        }
                        exchange[credential] = credentialValue;
                    }
                }
            }
        }
        if (cliOptions.sandbox || cliOptions.testnet) {
            exchange.setSandboxMode (true);
        } else if (cliOptions.demo) {
            exchange.enableDemoTrading (true);
        }
    } catch (e) {
        log.red (e);
        // printUsage ('');
        process.exit ();
    }

    if (cliOptions.cors) {
        exchange.proxy = 'https://cors-anywhere.herokuapp.com/';
        exchange.origin = exchange.uuid ();
    }

    if (cliOptions.debug) {
        exchange.verbose = true;
    }

    const no_load_markets = cliOptions.noSend ? true : cliOptions.noLoadMarkets;
    if (!no_load_markets && !printUsageOnly) {
        await handleMarketsLoading (exchange, cliOptions.refreshMarkets);
    }

    if (cliOptions.signIn && exchange.has.signIn) {
        await exchange.signIn ();
    }

    exchange.verbose = cliOptions.verbose;

    if (cliOptions.noSend) {
        exchange = setNoSend (exchange);
    }
    return exchange;
}

/**
 *
 * @param cliOptions
 */
function handleDebug (cliOptions) {
    if (cliOptions.debug) {
        if (httpsAgent.freeSockets) {
            const keys = Object.keys (httpsAgent.freeSockets);
            if (keys.length) {
                const firstKey = keys[0];
                const httpAgent = httpsAgent.freeSockets[firstKey];
                log (firstKey, (httpAgent as any).length);
            }
        }
    }
}

/**
 *
 * @param cliOptions
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
function handleStaticTests (cliOptions, exchange, methodName, args, result) {
    if (cliOptions.request || cliOptions.static) {
        createRequestTemplate (cliOptions, exchange, methodName, args, result);
    }
    if (cliOptions.response || cliOptions.static) {
        createResponseTemplate (cliOptions, exchange, methodName, args, result);
    }
}

/**
 *
 * @param value
 * @param previous
 */
function collectKeyValue (value: string, previous: Record<string, string>) {
    const [ key, val ] = value.split ('=');
    if (!key || val === undefined) {
        throw new Error (
            `Invalid --param value: '${value}'. Must be in key=value format.`
        );
    }
    return { ...previous, [key]: parseValue (val) };
}

/**
 *
 * @param prompt
 */
function askForArgv (prompt: string): Promise<string[]> {
    const rl = readline.createInterface ({
        'input': process.stdin,
        'output': process.stdout,
    });

    return new Promise ((resolve) => {
        rl.question (prompt, (input) => {
            rl.close ();

            const regex = /[^\s"]+|"([^"]*)"/g;
            const args: string[] = [ 'node', 'script' ];
            let match;

            while ((match = regex.exec (input)) !== null) {
                args.push (match[1] ? match[1] : match[0]);
            }

            resolve (args);
        });
    });
}

function createCCXTExchange (exchangeId: string) {
    let exchange = undefined;
    try {
        if ((ccxt.pro as any).exchanges.includes (exchangeId)) {
            exchange = new ccxt.pro[exchangeId] ();
        } else {
            exchange = new ccxt[exchangeId] ();
        }
    } catch (e) {
        log.error ('Error creating exchange:', e);
        process.exit (1);
    }
    return exchange;
}

function printExchangeMethods (exchangeId: string) {
    const exchange = createCCXTExchange (exchangeId);
    const methods = Object.keys (exchange.has).filter ((methodName) => exchange.has[methodName]);
    log (methods);
}

function printMethodUsage (methodName: string) {
    const exchange = new ccxt.Exchange ();
    const method = exchange[methodName];

    if (typeof method !== 'function') {
        log.red (`\n❌ Method "${methodName}" not found.`);
        return;
    }

    const { requiredArgs, optionalArgs, error } = getArgsWithOptionality (method);

    if (error) {
        log.warn (
            `\n⚠️ Unable to introspect parameters for "${methodName}" (possibly native or transpiled).`
        );
        return;
    }

    log (`\nMethod: ${methodName}`);

    const usage = requiredArgs
        .map ((a) => `<${a}>`)
        .concat (optionalArgs.map ((a) => `[${a}]`))
        .join (' ');
    log (`Usage:\n  binance ${methodName} ${usage}\n`);

    log ('Arguments:');
    const printArg = (arg, required) => {
        const tag = required ? 'required' : 'optional';
        const info = paramInfoMap[arg] || {};
        const desc = info.description || '(no description available)';
        const ex = info.example ? `e.g., ${info.example}` : '';
        log (`  - ${arg.padEnd (12)} (${tag}) — ${desc} ${ex}`);
    };

    requiredArgs.forEach ((arg) => printArg (arg, true));
    optionalArgs.forEach ((arg) => printArg (arg, false));
}

function getArgsWithOptionality (func) {
    const funcStr = func.toString ();

    if (funcStr.includes ('[native code]') || funcStr.length < 20) {
        return { 'requiredArgs': [], 'optionalArgs': [], 'error': true };
    }

    // Strip comments
    const cleaned = funcStr.replace (/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    const argsMatch = cleaned.match (/^[\s\S]*?\(([^)]*)\)/);
    if (!argsMatch) return { 'requiredArgs': [], 'optionalArgs': [], 'error': true };

    const rawArgs = argsMatch[1]
        .split (',')
        .map ((a) => a.trim ())
        .filter (Boolean);

    const requiredArgs = [];
    const optionalArgs = [];

    rawArgs.forEach ((arg, index) => {
        const isOptional = arg.includes ('=') || index >= func.length;
        const name = arg.split ('=')[0].trim ();
        if (isOptional) {
            optionalArgs.push (name);
        } else {
            requiredArgs.push (name);
        }
    });

    return { requiredArgs, optionalArgs, 'error': false };
}

const paramInfoMap = {
    'symbol': {
        'description': 'Market symbol',
        'example': 'BTC/USDT',
    },
    'since': {
        'description': 'Unix timestamp (ms) to fetch data from',
        'example': '1672531200000',
    },
    'limit': {
        'description': 'Number of results to return',
        'example': '100',
    },
    'timeframe': {
        'description': 'Candlestick interval',
        'example': '1h',
    },
    'params': {
        'description': 'Extra parameters for the exchange',
        'example': '{ "recvWindow": 5000 }',
    },
    'id': {
        'description': 'The ID of the order to fetch or cancel',
        'example': '1234567890',
    },
    'orderIds': {
        'description': 'Array of order IDs',
        'example': '[ "12345", "67890" ]',
    },
    'price': {
        'description': 'Price per unit of asset',
        'example': '26000.50',
    },
    'side': {
        'description': 'order side',
        'example': 'buy or sell',
    },
};

function parseValue (value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (!Number.isNaN (Number (value))) return Number (value);
    return value;
}

export {
    createRequestTemplate,
    createResponseTemplate,
    countAllParams,
    jsonStringify,
    printSavedCommand,
    printHumanReadable,
    handleMarketsLoading,
    setNoSend,
    parseMethodArgs,
    printUsage,
    loadSettingsAndCreateExchange,
    collectKeyValue,
    injectMissingUndefined,
    handleDebug,
    handleStaticTests,
    askForArgv,
    printMethodUsage,
    parseValue,
    printExchangeMethods,
};
