#!/usr/bin/env node
import ansi from 'ansicolor';
import { Command } from 'commander';
import ololog from 'ololog';
import { parseMethodArgs, printHumanReadable, printSavedCommand, printUsage, loadSettingsAndCreateExchange, collectKeyValue, handleDebug, handleStaticTests, askForArgv, printMethodUsage } from './helpers.js';
import { changeConfigPath, checkCache, getCacheDirectory, saveCommand } from './cache.js';

let ccxt;
let local = false;
try {
    ccxt = await import ('ccxt');
} catch (e) {
    ccxt = await import ('../../ts/ccxt.js');
    local = true;
}

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
    history?: boolean;
    name?: string;
    param?: any;
    config?: any;
}

const exchanges = Object.keys (ccxt.exchanges) as string[];
const commandToShow = local ? 'node ./cli' : 'ccxt';
const program = new Command ();

if (typeof program.addHelpText !== 'function') {
    console.warn ('You might need to run `npm i` at first');
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
    - Provide apikeys and other settings by adding them to ${getCacheDirectory ()}/config.json
    `);

//-----------------------------------------------------------------------------

program
    .version (version)
    .name ('ccxt')
    .usage ('exchangeId methodName arg1 arg2 argN [options]')
    .description ('CCXT CLI tool');

program
    .option ('--verbose', 'enables the verbose mode')
    .option ('--raw', 'keeps the output pristine without extra logs or formatting')
    .option ('--testnet', 'enables the sandbox mode')
    // .option ('--config2 <path>', 'Provide a different path for the config file')
    .option ('--param <keyValue>', 'Pass key=value pair', collectKeyValue, {})
    .option ('--no-load-markets', 'skips markets loading')
    .option ('--details')
    .option ('--no-table', 'does not prettify the results')
    .option ('--table')
    .option ('--iso8601')
    .option ('--cors')
    .option ('--cache-markets', 'forces markets caching')
    .option ('--no-send')
    .option ('--sandbox', 'enables the sandbox mode')
    .option ('--signIn', 'calls the signIn() method if available')
    .option ('--spot', 'sets defaultType as spot')
    .option ('--swap', 'sets defaultType as swap')
    .option ('--future', 'sets defaultType as future')
    .option ('--option', 'sets defaultType as option')
    .option ('--request')
    .option ('--poll', 'will repeat the call continously')
    .option ('--response')
    .option ('--static')
    .option ('--no-keys', 'does not set any apiKeys even if detected')
    .option ('--i', 'iteractive mode, keeps the session opened')
    .option ('--history', 'prints the history of executed commands')
    .option ('--name <description>', 'Description of static test')
    .option ('--debug');

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

program.parse (inputArgs);

saveCommand (process.argv);

let cliOptions = program.opts () as CLIOptions;

// console.log (cliOptions);

let [ exchangeId, methodName, ...params ] = program.args;

//-----------------------------------------------------------------------------

if (!cliOptions.raw) {
    const pref = local ? '[local]' : '';
    log ((new Date ()).toISOString ());
    log ('Node.js:', process.version);
    log.blue (pref + ' CCXT v' + ccxt.version);
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
    end = exchange.milliseconds ();
    if (!isWsMethod && !cliOptions.raw) {
        log (
            exchange.iso8601 (end),
            'iteration',
            i++,
            'passed in',
            end - start,
            'ms\n'
        );
    }
    printHumanReadable (exchange, result, cliOptions);
    if (!isWsMethod && !cliOptions.raw) {
        log (
            exchange.iso8601 (end),
            'iteration',
            i,
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

