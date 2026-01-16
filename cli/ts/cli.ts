#!/usr/bin/env node
import ansi from 'ansicolor';
import { Command, Option } from 'commander';
import ololog from 'ololog';
import clipboard from 'clipboardy';
import { parseMethodArgs, printHumanReadable, printSavedCommand, printUsage, loadSettingsAndCreateExchange, collectKeyValue, handleDebug, handleStaticTests, askForArgv, printMethodUsage, printExchangeMethods } from './helpers.js';
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
    noSend?: boolean;
    noLoadMarkets?: boolean;
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
}

const exchanges = Object.keys (ccxt.exchanges) as string[];
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
    const pref = local ? '[local]' : '';
    // log ((new Date ()).toISOString ());
    // log ('Node.js:', process.version);
    log.bgBlue (pref + 'CCXT v' + ccxt.version);
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

        const exchange = await loadSettingsAndCreateExchange (exchangeId, cliOptions, params.length === 0);

        if (exchange[methodName] === undefined) {
            log.red (exchange.id + '.' + methodName + ': no such property');
            process.exit (0);
        }

        if (typeof exchange[methodName] !== 'function') {
            printHumanReadable (exchange, exchange[methodName], cliOptions);
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

    printHumanReadable (exchange, result, cliOptions);
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

