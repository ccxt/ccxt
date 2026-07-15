#!/usr/bin/env node
import ansi from 'ansicolor';
import { Command, Option } from 'commander';
import ololog from 'ololog';
import clipboard from 'clipboardy';
import { parseMethodArgs, printHumanReadable, printSavedCommand, printUsage, loadSettingsAndCreateExchange, collectKeyValue, handleDebug, handleStaticTests, askForArgv, printMethodUsage, printExchangeMethods, cacheEvents } from './helpers.js';
import { changeConfigPath, checkCache, getCachePathForHelp, saveCommand } from './cache.js';
import { plotOHLCVChart } from './charts/ohlcv.js';
import { plotOrderBook } from './charts/orderbook.js';
import { plotTicker } from './charts/ticker.js';

ansi.nice;
const log = ololog.configure ({ 'locate': false }).unlimited;
let ccxt;
let local = false;
try {
    // @ts-ignore
    ccxt = await import ('ccxt');
} catch (e) {
    try {
        // @ts-ignore
        // we import like this to trick tsc and avoid the crawling on the
        // local ccxt project, if any
        ccxt = await (Function ('return import("../../ts/ccxt")') ());
        local = true;
    } catch (ee) {
        log.error (ee);
        log.error ('Neither a local installation nor a global CCXT installation was detected, make `npm i` first, Also make sure your local ccxt version does not contain any syntax errors.');
        process.exit (1);
    }
}

const { ExchangeError, NetworkError } = ccxt;

//-----------------------------------------------------------------------------

process.on ('uncaughtException', (e) => {
    log.bright.red.error (e); log.red.error (e.message); process.exit (1);
});
process.on ('unhandledRejection', (e) => {
    log.bright.red.error (e); log.red.error ((e as any).message); process.exit (1);
});

//-----------------------------------------------------------------------------

const version = 'v0.0.1';

interface CLIOptions {
    verbose?: boolean;
    debug?: boolean;
    poll?: boolean;
    send?: boolean;
    loadMarkets?: boolean;
    details?: boolean;
    noTable?: boolean;
    table?: boolean;
    iso8601?: boolean;
    cors?: boolean;
    refreshMarkets?: boolean;
    testnet?: boolean;
    sandbox?: boolean;
    demo?: boolean;
    signIn?: boolean;
    spot?: boolean;
    swap?: boolean;
    future?: boolean;
    option?: boolean;
    prediction?: boolean;
    request?: boolean;
    response?: boolean;
    static?: boolean;
    raw?: boolean;
    noKeys?: boolean;
    i?: boolean;
    name?: string;
    param?: any;
    config?: any;
    clipboard?: boolean;
    history?: boolean;
}

const predictionExchanges = ((ccxt as any).prediction !== undefined) ? ((ccxt as any).prediction.exchanges as string[]) : [];
const exchanges = (Object.keys (ccxt.exchanges) as string[]).concat (predictionExchanges.filter ((id) => !(id in ccxt.exchanges)));
const commandToShow = local ? 'node ./cli' : 'ccxt';
const program = new Command ();

if (typeof program.addHelpText !== 'function') {
    log.warn ('You might need to run `npm i` at first');
    process.exit (1);
}

program.addHelpText ('after', `
Examples:
  $ ccxt binance fetchTrades "BTC/USDT"
  $ ccxt explain createOrder
  $ ccxt bybit fetchOHLCV "BTC/USDT" 15m 1722161166529 20 --param until=1722161166530
  $ ccxt okx fetchTrades "BTC/USDT" --sandbox
  $ ccxt binance fetchBalance --swap
  $ BINANCE_APIKEY=abc123 BINANCE_SECRET=def456 ccxt binance createOrder BTC/USDT market buy 0.01
  $ ccxt history

Notes:
    - Provide apiKeys by setting them as environment variables eg: BINANCE_APIKEY="XXX"
    - Provide apikeys and other settings by adding them to ${getCachePathForHelp ()}/config.json
    - Arguments must follow the correct order. Use undefined to skip optional values, eg:
        $ccxt binance fetchTrades BTC/USDT undefined 5 ## since is undefined but we provided limit=5
    `);

//-----------------------------------------------------------------------------

program
    .version (version)
    .name ('ccxt')
    .usage ('exchangeId methodName arg1 arg2 argN [options]')
    .description ('CCXT CLI tool');

program
    .option ('--verbose', 'enables the verbose mode')
    .option ('--sandbox', 'enables the sandbox mode')
    .option ('--demo', 'enables the demo mode')
    .option ('--no-keys', 'does not set any apiKeys even if detected')
    .option ('--param <keyValue>', 'Pass key=value pair', collectKeyValue, {})
    .option ('--raw', 'keeps the output pristine without extra logs or formatting')
    .option ('--clipboard', 'Copies the result to clipboard automatically.')
    .option ('--signIn', 'calls the signIn() method if available')
    .option ('--cache-markets', 'forces markets caching')
    .option ('--no-load-markets', 'skips markets loading')
    .option ('--no-table', 'does not prettify the results')
    .option ('--spot', 'sets defaultType as spot')
    .option ('--swap', 'sets defaultType as swap')
    .option ('--future', 'sets defaultType as future')
    .option ('--option', 'sets defaultType as option')
    .option ('-p, --prediction', 'forces the prediction-markets namespace (ccxt.prediction) — use this to pick the prediction variant when an id exists in both crypto and prediction')
    .option ('--poll', 'will repeat the call continously')
    .option ('--i', 'iteractive mode, keeps the session opened')
    .option ('--iso8601')
    .option ('--refresh-markets', 'forces markets refresh')
    .option ('--cors');

// dev related options, docs not needed
program.addOption (new Option ('--debug').hideHelp ());
program.addOption (new Option ('--testnet').hideHelp ());
// program.addOption (new Option ('--demo').hideHelp ());
program.addOption (new Option ('--no-send').hideHelp ());
program.addOption (new Option ('--request').hideHelp ());
program.addOption (new Option ('--table').hideHelp ());
program.addOption (new Option ('--details').hideHelp ());
program.addOption (new Option ('--static').hideHelp ());
program.addOption (new Option ('--response').hideHelp ());
program.addOption (new Option ('--name <description>', 'Description of static test').hideHelp ());

program
    .command ('<exchangeId> <methodName> [args...]') // this command is only for the docs
    .description ('Executes a ccxt call, eg: binance createOrder "BTC/USDT" market buy 0.1');

exchanges.forEach ((exchange) => {
    program
        .command (exchange + ' <methodName> [args...]', { 'hidden': true });
});

program
    .command ('explain <methodName>')
    .description ('Explain how a method is used, eg: "explain createOrder"')
    .action ((method) => {
        printMethodUsage (method);
        process.exit (0);
    });

program
    .command ('methods <exchangeName>')
    .description ('Shows the available methods in an exchange, eg: "methods binance"')
    .action ((exchangeName) => {
        printExchangeMethods (exchangeName);
        process.exit (0);
    });

program
    .command ('ohlcv <exchangeName> <symbol> <timeframe> [args...]')
    .description ('Plots a OHLCV chart using the provided exchange, symbol and timeframe')
    .action (async (exchangeName, symbol, timeframe, args) => {
        try {
            await plotOHLCVChart (exchangeName, symbol, timeframe, args);
        } catch (e) {
            log.error ('Error executing ohlcv command: ', e);
        }
        process.exit (0);
    });

program
    .command ('orderbook <exchangeName1,exchangeName2> <symbol> [args...]')
    .description ('Render a live orderbook for one or more exchanges for the provided symbol (ws)')
    .action (async (exchangeNames, symbol, args) => {
        await plotOrderBook (exchangeNames, symbol, args, program.opts ());
        process.exit (0);
    });

program
    .command ('ticker <exchangeName1,exchangeName2> <symbol> [args...]')
    .description ('Render a live ticker for one or more exchanges for the provided symbol (ws)')
    .action (async (exchangeNames, symbol, args) => {
        await plotTicker (exchangeNames, symbol, args);
        process.exit (0);
    });

program
    .command ('config <path>')
    .description ('Sets a different path for the config file, eg: "config ./some/path/config.json"')
    .action ((configPath) => {
        changeConfigPath (configPath);
        process.exit (0);
    });

program
    .command ('history')
    .description ('Display a list of the previously executed commands')
    .action (() => {
        printSavedCommand ({});
        process.exit (0);
    });

let inputArgs = process.argv;

program.showHelpAfterError ();

try {
    await program.parseAsync (inputArgs);
} catch (e) {
    log.error ('❌ error parseAsync:', e);
    process.exit (1);
}

saveCommand (process.argv);

let cliOptions = program.opts () as CLIOptions;

let [ exchangeId, methodName, ...params ] = program.args;

//-----------------------------------------------------------------------------

if (!cliOptions.raw) {
    // const pref = local ? '[local]' : '';
    // log ((new Date ()).toISOString ());
    // log ('Node.js:', process.version);
    log.bgBlue ('CCXT v' + ccxt.version + (local ? ' (local)' : ''));
}

if (!exchangeId && !cliOptions.history) {
    log (('Error, No exchange id specified!' as any).red);
    printUsage (commandToShow);
    process.exit ();
}
//-----------------------------------------------------------------------------

/**
 *
 */
async function run () {
    checkCache ();

    const iMode = cliOptions.i;

    while (true) { // main loop, used for the interactive mode
        if (!methodName) {
            process.exit (0);
        }

        const exchange = await loadSettingsAndCreateExchange (exchangeId, cliOptions);

        // single-entity lookups from the cached events: `<exchange> event|market|outcome <key> -p`
        if (cliOptions.prediction && (methodName === 'event' || methodName === 'market' || methodName === 'outcome')) {
            printPredictionEntity (exchange, methodName, params[0]);
            if (!iMode) {
                exchange.close ();
                break;
            }
            inputArgs = await askForArgv ('[command]: ');
            program.parse (inputArgs);
            cliOptions = program.opts () as CLIOptions;
            [ exchangeId, methodName, ...params ] = program.args;
            continue;
        }

        if (exchange[methodName] === undefined) {
            log.red (exchange.id + '.' + methodName + ': no such property');
            process.exit (0);
        }

        if (typeof exchange[methodName] !== 'function') {
            printHumanReadable (exchange, exchange[methodName], cliOptions, cliOptions.table);
            return;
        }

        let i = 0;
        const isWsMethod = methodName.startsWith ('watch');
        try {
            while (true) { // inner loop used for watchX calls and --poll
                await executeCCXTCommand (exchange, params, methodName, cliOptions, i);
                i++;

                if (!isWsMethod && !cliOptions.poll) {
                    break;
                }
            }
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

        if (!iMode) {
            exchange.close ();
            break;
        }

        inputArgs = await askForArgv ('[command]: ');

        // reparse args using the user input
        program.parse (inputArgs);

        cliOptions = program.opts () as CLIOptions;

        [ exchangeId, methodName, ...params ] = program.args;
    }
}
// ----------------------------------------------------------------------------

function eventFieldValue (obj: any, keys: string[]): string {
    for (const key of keys) {
        const value = (obj === undefined || obj === null) ? undefined : obj[key];
        if (value !== undefined && value !== null && value !== '') {
            return String (value);
        }
    }
    return '-';
}

function printPredictionOutcomeNode (outcome: any, indent: string) {
    const label = eventFieldValue (outcome, [ 'label' ]);
    log (
        indent + ansi.magenta ('outcome ') + eventFieldValue (outcome, [ 'outcome' ])
        + ansi.darkGray (' (id: ' + eventFieldValue (outcome, [ 'outcomeId', 'id' ]) + ')')
        + ((label !== '-') ? ansi.darkGray ('  [' + label + ']') : '')
    );
}

function printPredictionMarketNode (market: any, indent: string) {
    log (
        indent + ansi.yellow ('market  ') + eventFieldValue (market, [ 'market', 'symbol' ])
        + ansi.darkGray (' (id: ' + eventFieldValue (market, [ 'id' ]) + ')')
    );
    const outcomes = (market && market['outcomes']) ? market['outcomes'] : [];
    for (const outcome of outcomes) {
        printPredictionOutcomeNode (outcome, indent + '  ');
    }
}

// pretty-prints fetchEvents results as an event -> markets -> outcomes tree, showing only the
// handle + id at each level (the full structures are large and mostly noise when scanning)
function printPredictionEvents (events: any[]) {
    log (ansi.cyan (String (events.length) + ' event(s)'));
    for (const event of events) {
        const title = eventFieldValue (event, [ 'title' ]);
        log (
            ansi.green ('event   ') + eventFieldValue (event, [ 'event', 'slug' ])
            + ansi.darkGray (' (id: ' + eventFieldValue (event, [ 'id' ]) + ')')
            + ((title !== '-') ? ansi.darkGray ('  ' + title) : '')
        );
        const markets = (event && event['markets']) ? event['markets'] : [];
        for (const market of markets) {
            printPredictionMarketNode (market, '  ');
        }
    }
}

// the cached events (this.events, loaded from prediction/<id>.json) are the source of truth for
// the `event` / `market` / `outcome` single-lookup commands
function predictionEventList (exchange: any): any[] {
    const events = (exchange.events !== undefined && exchange.events !== null) ? exchange.events : {};
    return Object.keys (events).map ((key) => events[key]);
}

function findPredictionEvent (exchange: any, key: string): any {
    for (const event of predictionEventList (exchange)) {
        if (event['event'] === key || event['id'] === key || event['slug'] === key) {
            return event;
        }
    }
    return undefined;
}

function findPredictionMarket (exchange: any, key: string): any {
    for (const event of predictionEventList (exchange)) {
        const markets = (event && event['markets']) ? event['markets'] : [];
        for (const market of markets) {
            if (market['market'] === key || market['symbol'] === key || market['id'] === key) {
                return market;
            }
        }
    }
    return undefined;
}

function findPredictionOutcome (exchange: any, key: string): any {
    for (const event of predictionEventList (exchange)) {
        const markets = (event && event['markets']) ? event['markets'] : [];
        for (const market of markets) {
            const outcomes = (market && market['outcomes']) ? market['outcomes'] : [];
            for (const outcome of outcomes) {
                if (outcome['outcome'] === key || outcome['outcomeId'] === key || outcome['id'] === key) {
                    return outcome;
                }
            }
        }
    }
    return undefined;
}

// prints the scalar (and small/array) fields of a single entity, one per line; skips the nested
// children (printed as a tree) and the raw `info` blob
function printEntityDetails (obj: any, indent: string) {
    const skip = [ 'info', 'markets', 'outcomes' ];
    const keys = Object.keys (obj);
    let pad = 0;
    for (const key of keys) {
        if (key.length > pad) {
            pad = key.length;
        }
    }
    for (const key of keys) {
        if (skip.indexOf (key) !== -1) {
            continue;
        }
        let value = obj[key];
        if (value === undefined || value === null || value === '') {
            continue;
        }
        if (Array.isArray (value)) {
            const primitives = [];
            for (const item of value) {
                if (typeof item !== 'object') {
                    primitives.push (String (item));
                }
            }
            if (primitives.length === 0) {
                continue; // array of objects (handled as a tree)
            }
            value = primitives.join (', ');
        } else if (typeof value === 'object') {
            value = JSON.stringify (value); // small objects (precision / limits / fees)
        }
        log (indent + ansi.darkGray (key.padEnd (pad) + '  ') + String (value));
    }
}

// handles `<exchange> event|market|outcome <key> -p`: a single-entity lookup resolved from the
// cached events (run fetchEvents first to populate the prediction/ cache). Unlike the events tree,
// the single-entity view also dumps the entity's own fields
function printPredictionEntity (exchange: any, kind: string, key: string) {
    if (key === undefined) {
        log.red (kind + ' requires a key, e.g. "' + exchange.id + ' ' + kind + ' <handle> -p"');
        return;
    }
    if (predictionEventList (exchange).length === 0) {
        log.red ('no cached events for ' + exchange.id + ' — run "' + exchange.id + ' fetchEvents <query> -p" first');
        return;
    }
    if (kind === 'event') {
        const event = findPredictionEvent (exchange, key);
        if (event === undefined) {
            log.red ('event not found in cache: ' + key);
            return;
        }
        const title = eventFieldValue (event, [ 'title' ]);
        log (ansi.green ('event   ') + eventFieldValue (event, [ 'event', 'slug' ]) + ansi.darkGray (' (id: ' + eventFieldValue (event, [ 'id' ]) + ')') + ((title !== '-') ? ansi.darkGray ('  ' + title) : ''));
        printEntityDetails (event, '  ');
        const markets = (event['markets']) ? event['markets'] : [];
        for (const market of markets) {
            printPredictionMarketNode (market, '  ');
        }
    } else if (kind === 'market') {
        const market = findPredictionMarket (exchange, key);
        if (market === undefined) {
            log.red ('market not found in cache: ' + key);
            return;
        }
        log (ansi.yellow ('market  ') + eventFieldValue (market, [ 'market', 'symbol' ]) + ansi.darkGray (' (id: ' + eventFieldValue (market, [ 'id' ]) + ')'));
        printEntityDetails (market, '  ');
        const outcomes = (market['outcomes']) ? market['outcomes'] : [];
        for (const outcome of outcomes) {
            printPredictionOutcomeNode (outcome, '  ');
        }
    } else {
        const outcome = findPredictionOutcome (exchange, key);
        if (outcome === undefined) {
            log.red ('outcome not found in cache: ' + key);
            return;
        }
        const label = eventFieldValue (outcome, [ 'label' ]);
        log (ansi.magenta ('outcome ') + eventFieldValue (outcome, [ 'outcome' ]) + ansi.darkGray (' (id: ' + eventFieldValue (outcome, [ 'outcomeId', 'id' ]) + ')') + ((label !== '-') ? ansi.darkGray ('  [' + label + ']') : ''));
        printEntityDetails (outcome, '  ');
    }
}

async function executeCCXTCommand (exchange, params:any, methodName: string, cliOptions: any, i: number) {
    const isWsMethod = methodName.startsWith ('watch');
    let start = exchange.milliseconds ();
    let end = exchange.milliseconds ();
    const args = parseMethodArgs (exchange, params, methodName, cliOptions);

    if (!cliOptions.raw || cliOptions.details) {
        const methodArgsPrint = JSON.stringify (args);
        log (exchange.id + '.' + methodName, '(' + methodArgsPrint.substring (1, methodArgsPrint.length - 1) + ')');
    }

    const result = await exchange[methodName] (...args);
    if (cliOptions.clipboard) {
        clipboard.writeSync (JSON.stringify (result, undefined, 2));
    }
    end = exchange.milliseconds ();

    const isEventsResult = (methodName === 'fetchEvents') && Array.isArray (result);
    if (isEventsResult) {
        await cacheEvents (exchange, result);
    }
    if (isEventsResult && !cliOptions.raw) {
        printPredictionEvents (result);
    } else {
        printHumanReadable (exchange, result, cliOptions);
    }
    if (!isWsMethod && !cliOptions.raw) {
        log (
            exchange.iso8601 (end),
            'iteration',
            i + 1,
            'passed in',
            end - start,
            'ms\n'
        );
    }
    start = end;

    handleStaticTests (cliOptions, exchange, methodName, args, result);

    handleDebug (cliOptions);
}

//-----------------------------------------------------------------------------
run ();

export {
};

