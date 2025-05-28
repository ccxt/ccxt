import ansi from 'ansicolor';
import { Command } from 'commander';
import ololog from 'ololog';
import readline from 'readline';
import { parseMethodArgs, printHumanReadable, printSavedCommand, printUsage, loadSettingsAndCreateExchange, collectKeyValue, handleDebug, handleStaticTests, askForArgv } from './helpers.js';
import { checkCache, saveCommand } from './cache.js';

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

//-----------------------------------------------------------------------------
//  [ processPath, , exchangeId, methodName, ...params ] = process.argv.filter ((x) => !x.startsWith ('--'));

program
    .option ('--verbose')
    .option ('--debug')
    .option ('--poll')
    .option ('--no-send')
    .option ('--no-load-markets')
    .option ('--details')
    .option ('--no-table')
    .option ('--table')
    .option ('--iso8601')
    .option ('--cors')
    .option ('--cache-markets')
    .option ('--testnet')
    .option ('--sandbox')
    .option ('--signIn')
    .option ('--spot')
    .option ('--swap')
    .option ('--future')
    .option ('--option')
    .option ('--request')
    .option ('--response')
    .option ('--static')
    .option ('--raw')
    .option ('--no-keys')
    .option ('--i')
    .option ('--history')
    .option ('--name <description>', 'Description of static test')
    .option ('--param <keyValue>', 'Pass key=value pair', collectKeyValue, {})
    .argument ('<inputs...>', 'exchangeId method args');

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

    while (true) {
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

        const isWsMethod = methodName.startsWith ('watch');
        let start = exchange.milliseconds ();
        let end = exchange.milliseconds ();
        let i = 0;
        try {
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

        handleDebug (cliOptions);

        if (!cliOptions.poll && !isWsMethod && !iMode) {
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
//-----------------------------------------------------------------------------
run ();

export {
};

