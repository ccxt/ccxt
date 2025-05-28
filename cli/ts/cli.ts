import ansi from 'ansicolor';
import { Command } from 'commander';
import ololog from 'ololog';
import { parseMethodArgs, printHumanReadable, printSavedCommand, printUsage, loadSettingsAndCreateExchange, collectKeyValue, handleDebug, handleStaticTests, askForArgv } from './helpers.js';
import { checkCache } from './cache.js';

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
    cacheMarkets?: boolean;
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
}
const commandToShow = local ? 'node ./cli' : 'ccxt';
const program = new Command ();

program.addHelpText ('after', `
    Examples:
      $ ccxt binance fetchTrades "BTC/USDT"
      $ ccxt bybit fetchOHLCV "BTC/USDT" 15m 1722161166529 20 --param until=1722161166530
      $ ccxt okx fetchTrades "BTC/USDT" --sandbox
      $ ccxt binance fetchBalance --swap
      $ BINANCE_APIKEY=abc123 BINANCE_SECRET=def456 ccxt binance createOrder BTC/USDT market buy 0.01
      $ ccxt history

    Notes:
        - Provide apiKeys by setting them as environment variables eg: BINANCE_APIKEY="XXX"
        - Provide apikeys and other settings by adding them to ~/.ccxt/config.json
    `);

//-----------------------------------------------------------------------------

program
    .version (version)
    .usage ('exchangeId methodName arg1 argN [options]')
    .description ('CCXT CLI tool');

program
    .option ('--verbose', 'enables the verbose mode')
    .option ('--debug')
    .option ('--poll', 'will repeat the call continously')
    .option ('--no-send')
    .option ('--no-load-markets', 'skips markets loading')
    .option ('--details')
    .option ('--no-table', 'does not prettify the results')
    .option ('--table')
    .option ('--iso8601')
    .option ('--cors')
    .option ('--cache-markets', 'forces markets caching')
    .option ('--testnet', 'enables the sandbox mode')
    .option ('--sandbox', 'enables the sandbox mode')
    .option ('--signIn', 'calls the signIn() method if available')
    .option ('--spot', 'sets defaultType as spot')
    .option ('--swap', 'sets defaultType as swap')
    .option ('--future', 'sets defaultType as future')
    .option ('--option', 'sets defaultType as option')
    .option ('--request')
    .option ('--response')
    .option ('--static')
    .option ('--raw', 'keeps the output pristine without extra logs or formatting')
    .option ('--no-keys', 'does not set any apiKeys even if detected')
    .option ('--i', 'iteractive mode, keeps the session opened')
    .option ('--history', 'prints the history of executed commands')
    .option ('--name <description>', 'Description of static test')
    .option ('--param <keyValue>', 'Pass key=value pair', collectKeyValue, {})
    .argument ('<inputs...>', 'exchangeId methodName arg1 arg2 argN');

let inputArgs = process.argv;

program.parse (inputArgs);

let cliOptions = program.opts () as CLIOptions;

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
        if (cliOptions.history) {
            printSavedCommand (cliOptions);
        }

        if (!exchangeId) {
            printUsage (commandToShow);
        }

        const exchange = await loadSettingsAndCreateExchange (exchangeId, cliOptions);

        if (!methodName) {
            log (exchange);
            process.exit (0);
        }

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

async function executeCCXTCommand (exchange, params, methodName, cliOptions, i) {
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

