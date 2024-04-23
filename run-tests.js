/*  ---------------------------------------------------------------------------

A tests launcher. Runs tests for all languages and all exchanges, in
parallel, with a humanized error reporting.

Usage: node run-tests [--php] [--js] [--python] [--python-async] [exchange] [method|symbol]

--------------------------------------------------------------------------- */

import fs from 'fs'
import ansi from 'ansicolor'
import log from 'ololog'
import ps from 'child_process'
ansi.nice
/*  --------------------------------------------------------------------------- */

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

/*  --------------------------------------------------------------------------- */

const [,, ...args] = process.argv

const langKeys = {
    '--ts': false,      // run TypeScript tests only
    '--js': false,      // run JavaScript tests only
    '--php': false,     // run PHP tests only
    '--python': false,  // run Python 3 tests only
    '--python-async': false, // run Python 3 async tests only
    '--csharp': false,  // run C# tests only
    '--php-async': false,    // run php async tests only,
}

const debugKeys = {
    '--warnings': false,
    '--info': false,
}

const exchangeSpecificFlags = {
    '--ws': false,
    '--sandbox': false,
    '--useProxy': false,
    '--verbose': false,
    '--private': false,
    '--privateOnly': false,
}

let exchanges = []
let symbol = 'all'
let method = undefined
let maxConcurrency = 5 // Number.MAX_VALUE // no limit

for (const arg of args) {
    if (arg in exchangeSpecificFlags)        { exchangeSpecificFlags[arg] = true }
    else if (arg.startsWith ('--'))          {
        if (arg in langKeys) {
            langKeys[arg] = true
        } else if (arg in debugKeys) {
            debugKeys[arg] = true
        } else {
            log.bright.red ('\nUnknown option', arg.white, '\n');
        }
    }
    else if (arg.includes ('()'))            { method = arg }
    else if (arg.includes ('/'))             { symbol = arg }
    else if (Number.isFinite (Number (arg))) { maxConcurrency = Number (arg) }
    else                                     { exchanges.push (arg) }
}

const wsFlag = exchangeSpecificFlags['--ws'] ? 'WS': '';

// for REST exchange test, we might need to wait for 200+ seconds for some exchanges
// for WS, watchOHLCV might need 60 seconds for update (so, spot & swap ~ 120sec)
const timeoutSeconds = wsFlag ? 120 : 250;


/*  --------------------------------------------------------------------------- */

const exchangeOptions = []
for (const key of Object.keys (exchangeSpecificFlags)) {
    if (exchangeSpecificFlags[key]) {
        exchangeOptions.push (key)
    }
}
/*  --------------------------------------------------------------------------- */

const content = fs.readFileSync ('./skip-tests.json', 'utf8');
const skipSettings = JSON.parse (content);

if (!exchanges.length) {

    if (!fs.existsSync ('./exchanges.json')) {

        log.bright.red ('\n\tNo', 'exchanges.json'.white, 'found, please run', 'npm run build'.white, 'to generate it!\n')
        process.exit (1)
    }
    let exchangesFile =  fs.readFileSync('./exchanges.json');
    exchangesFile = JSON.parse(exchangesFile)
    exchanges = wsFlag ? exchangesFile.ws : exchangesFile.ids
}

/*  --------------------------------------------------------------------------- */

const sleep = s => new Promise (resolve => setTimeout (resolve, s*1000))
const timeout = (s, promise) => Promise.race ([ promise, sleep (s).then (() => {
    throw new Error ('RUNTEST_TIMED_OUT');
}) ])

/*  --------------------------------------------------------------------------- */

const exec = (bin, ...args) => { 

/*  A custom version of child_process.exec that captures both stdout and
    stderr,  not separating them into distinct buffers — so that we can show
    the same output as if it were running in a terminal.                        */

    let output = ''
    let stderr = ''

    const generateResultFromOutput = (output, stderr, code) => {
            // keep this commented code for a while (just in case), as the below avoids vscode false positive warnings from output: https://github.com/nodejs/node/issues/34799 during debugging
            // const removeDebuger = (str) => str.replace ('Debugger attached.\r\n','').replace('Waiting for the debugger to disconnect...\r\n', '').replace(/\(node:\d+\) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time\n\(Use `node --trace-warnings ...` to show where the warning was created\)\n/, '');
            // stderr = removeDebuger(stderr);
            // output = removeDebuger(output);

            output = ansi.strip (output.trim ())

            // detect error
            const hasFailed = (
                // exception caught in "test -> testMethod"
                output.indexOf('[TEST_FAILURE]') > -1 ||
                // 1) thrown from JS assert module
                output.indexOf('AssertionError:') > -1 ||
                // 2) thrown from PYTHON (i.e. [AssertionError], [KeyError], [ValueError], etc)
                output.match(/\[\w+Error\]/) ||
                // 3) thrown from PHP assert hook
                output.indexOf('[ASSERT_ERROR]') > -1 ||
                // 4) thrown from PHP async library
                output.indexOf('Fatal error:') > -1
            );

            // ### Infos ###
            const infos = []
            // check output for pattern like `[INFO:TESTING] xyz message`
            if (output.length) {
                const infoRegex = /\[INFO(|:([\w_-]+))\].+$(?!\n)*/gm
                let matchInfo;
                while ((matchInfo = infoRegex.exec (output))) {
                    infos.push (matchInfo[0])
                }
            }

            // ### Warnings ###
            const warnings = []
            // check output for pattern like `[TEST_WARNING] whatever`
            if (output.length) {
                const warningRegex = /\[TEST_WARNING\].+$(?!\n)*/gmi
                let matchWarnings; 
                while (matchWarnings = warningRegex.exec (stderr)) {
                    warnings.push (matchWarnings[0])
                }
            }
            // check stderr
            if (stderr.length > 0) {
                warnings.push (stderr)
            }

            return {
                failed: hasFailed || code !== 0,
                output,
                warnings,
                infos,
            }
    }

    return timeout (timeoutSeconds, new Promise (return_ => {

        const psSpawn = ps.spawn (bin, args)

        psSpawn.stdout.on ('data', data => { output += data.toString () })
        psSpawn.stderr.on ('data', data => { output += data.toString (); stderr += data.toString ().trim (); })

        psSpawn.on ('exit', code => return_ (generateResultFromOutput (output, stderr, code)) )

    })).catch (e => {
        const isTimeout = e.message === 'RUNTEST_TIMED_OUT';
        if (isTimeout) {
            stderr += '\n' + 'RUNTEST_TIMED_OUT: ';
            return generateResultFromOutput (output, stderr, 0);
        }
        return {
            failed: true,
            output: e.message,
            warnings: [],
            infos: [],
        }
    } );
};

/*  ------------------------------------------------------------------------ */

// const execWithRetry = () => {

//     // Sometimes execution (on a remote CI server) is just fails with no
//     // apparent reason, leaving an empty stdout/stderr behind. I suspect
//     // it's related to out-of-memory errors. So in that case we will re-try
//     // until it eventually finalizes.
// }

/*  ------------------------------------------------------------------------ */

let numExchangesTested = 0

/*  Tests of different languages for the same exchange should be run
    sequentially to prevent the interleaving nonces problem.
    ------------------------------------------------------------------------ */

const sequentialMap = async (input, fn) => {

    const result = []
    for (const item of input) { result.push (await fn (item)) }
    return result
}

/*  ------------------------------------------------------------------------ */

const testExchange = async (exchange) => {

    const percentsDone = () => ((numExchangesTested / exchanges.length) * 100).toFixed (0) + '%';

    // no need to test alias classes
    if (exchange.alias) {
        numExchangesTested++;
        log.bright (('[' + percentsDone() + ']').dim, 'Tested', exchange.cyan, wsFlag, '[Skipped alias]'.yellow)
        return [];
    }

    if (
        skipSettings[exchange] && 
        (
            (skipSettings[exchange].skip && !wsFlag)
                ||
            (skipSettings[exchange].skipWs && wsFlag)
        ) 
    ) {
        if (!('until' in skipSettings[exchange])) {
            // if until not specified, skip forever
            numExchangesTested++;
            log.bright (('[' + percentsDone() + ']').dim, 'Tested', exchange.cyan, wsFlag, '[Skipped]'.yellow)
            return [];
        }
        if (new Date(skipSettings[exchange].until) > new Date()) {
            numExchangesTested++;
            // if untilDate has not been yet reached, skip test for exchange
            log.bright (('[' + percentsDone() + ']').dim, 'Tested', exchange.cyan, wsFlag, '[Skipped till ' + skipSettings[exchange].until + ']'.yellow)
            return [];
        }
    }

/*  Run tests for all/selected languages (in parallel)     */
    let args = [exchange];
    if (symbol !== undefined && symbol !== 'all') {
        args.push(symbol);
    }
    if (method !== undefined) {
        args.push(method);
    }
    args = args.concat(exchangeOptions)
    // pass it to the test(ts/py/php) script too
    if (debugKeys['--info']) {
        args.push ('--info')
    }
    let allTests = [
        { key: '--js',           language: 'JavaScript',   exec: ['node',      'js/src/test/test.js',                     ...args] },
        { key: '--python-async', language: 'Python Async', exec: ['python3',   'python/ccxt/test/test_async.py',          ...args] },
        { key: '--php-async',    language: 'PHP Async',    exec: ['php', '-f', 'php/test/test_async.php',                 ...args] },
        { key: '--csharp',       language: 'C#',           exec: ['dotnet', 'run', '--project', 'cs/tests/tests.csproj',  ...args] },
        { key: '--ts',           language: 'TypeScript',   exec: ['node',  '--import', 'tsx', 'ts/src/test/test.ts',      ...args] },
        { key: '--python',       language: 'Python',       exec: ['python3',   'python/ccxt/test/test_sync.py',           ...args] },
        { key: '--php',          language: 'PHP',          exec: ['php', '-f', 'php/test/test_sync.php',                  ...args] },
    ];

    // select tests based on cli arguments
    let selectedTests = [];
    const langsAreProvided = (Object.values (langKeys).filter (x => x===true)).length > 0;
    if (langsAreProvided) {
        selectedTests = allTests.filter (t => langKeys[t.key]);
    } else {
        selectedTests = allTests.filter (t => t.key !== '--ts'); // exclude TypeScript when running all tests without specific languages
    }

    // remove skipped tests
    if (skipSettings[exchange]) {
        if (skipSettings[exchange].skipCSharp)   selectedTests = selectedTests.filter (t => t.key !== '--csharp'); 
        if (skipSettings[exchange].skipPhpAsync) selectedTests = selectedTests.filter (t => t.key !== '--php-async');
    }
    // if it's WS tests, then remove sync versions (php & python) from queue
    if (wsFlag) {
        selectedTests = selectedTests.filter (t => t.key !== '--python' && t.key !== '--php');
    }

        const completeTests  = await sequentialMap (selectedTests, async test => Object.assign (test, await  exec (...test.exec)))
        , failed         = completeTests.find (test => test.failed)
        , hasWarnings    = completeTests.find (test => test.warnings.length)
        , warnings       = completeTests.reduce (
            (total, { warnings }) => {
                return total.concat(['\n\n']).concat (warnings)
            }, []
        )
        , infos       = completeTests.reduce (
            (total, { infos }) => {
                return total.concat(['\n\n']).concat (infos)
            }, []
        )

/*  Print interactive log output    */

    let logMessage = '';

    if (failed) {
        logMessage = 'FAIL'.red;
    } else if (hasWarnings) {
        logMessage = ('WARN: ' + (warnings.length ? warnings.join (' ') : '')).yellow;
    } else {
        logMessage = 'OK'.green;
    }

    numExchangesTested++;
    log.bright (('[' + percentsDone() + ']').dim, 'Tested', exchange.cyan, wsFlag, logMessage)

    // independenly of the success result, show infos
    // ( these infos will be shown as soon as each exchange test is finished, and will not wait 100% of all tests to be finished )
    const displayInfos = true; // temporarily disable from run-tests, because they are still outputed in console from individual langs
    if (displayInfos) {
        if (debugKeys['--info'] && infos.length) {
            // show info if enabled
            log.indent (1).bright ((
                '\n|-------------- INFO --------------|\n' +
                infos.join('\n') +
                '\n|--------------------------------------------|\n'
            ).blue);
        }
    }
/*  Return collected data to main loop     */

    return {

        exchange,
        failed,
        hasWarnings,
        explain () {
            for (let { language, failed, output, warnings, infos } of completeTests) {
                const fullSkip = output.indexOf('[SKIPPED]') >= 0;
                if (fullSkip)
                    continue;
                // if failed, then show full output (includes warnings)
                if (failed) {
                    log.bright ('\nFAILED'.bgBrightRed.white, exchange.red,    '(' + language + ' ' + wsFlag + '):\n')
                    log.indent (1) ('\n', output)
                }
                // if not failed, but there are warnings, then show them
                else if (warnings.length) {
                    log.bright ('\nWARN'.yellow.inverse,     exchange.yellow, '(' + language + ' ' + wsFlag + '):\n')
                    log.indent (1) ('\n', warnings.join ('\n'))
                }
            }
        }
    }
}

/*  ------------------------------------------------------------------------ */

function TaskPool (maxConcurrency) {

    const pending = []
        , queue   = []

    let numActive = 0

    return {

        pending,

        run (task) {

            if (numActive >= maxConcurrency) { // queue task

                return new Promise (resolve => queue.push (() => this.run (task).then (resolve)))

            } else { // execute task

                let p = task ().then (x => {
                    numActive--
                    return (queue.length && (numActive < maxConcurrency))
                                ? queue.shift () ().then (() => x)
                                : x
                })
                numActive++
                pending.push (p)
                return p
            }
        }
    }
}

/*  ------------------------------------------------------------------------ */

async function testAllExchanges () {

    const taskPool = TaskPool (maxConcurrency)
    const results = []

    for (const exchange of exchanges) {
        taskPool.run (() => testExchange (exchange).then (x => results.push (x)))
    }

    await Promise.all (taskPool.pending)

    return results
}

/*  ------------------------------------------------------------------------ */

(async function () {

    // show output like `Testing { exchanges: ["binance"], symbol: "all", debugKeys: { '--warnings': false, '--info': true }, langKeys: { '--ts': false, '--js': false, '--php': false, '--python': false, '--python-async': false, '--php-async': false }, exchangeSpecificFlags: { '--ws': true, '--sandbox': false, '--verbose': false, '--private': false, '--privateOnly': false }, maxConcurrency: 100 }`
    log.bright.magenta.noPretty (
        'Testing'.white, 
        Object.assign ({ exchanges, method, symbol, debugKeys, langKeys, exchangeSpecificFlags }, maxConcurrency >= Number.MAX_VALUE ? {} : { maxConcurrency })
    )

    const tested    = await testAllExchanges ()
        , warnings  = tested.filter (t => !t.failed && t.hasWarnings)
        , failed    = tested.filter (t =>  t.failed)
        , succeeded = tested.filter (t => !t.failed && !t.hasWarnings)

    log.newline ()

    warnings.forEach (t => t.explain ())
    failed.forEach (t => t.explain ())

    log.newline ()

    if (failed.length)   { log.noPretty.bright.red    ('FAIL'.bgBrightRed.white, failed.map (t => t.exchange)) }
    if (warnings.length) { log.noPretty.bright.yellow ('WARN'.inverse,           warnings.map (t => t.exchange)) }

    log.newline ()

    log.bright ('All done,', [failed.length   && (failed.length    + ' failed')   .red,
                             succeeded.length && (succeeded.length + ' succeeded').green,
                             warnings.length  && (warnings.length  + ' warnings') .yellow].filter (s => s).join (', '))

    if (failed.length) {

        await sleep (10) // to fight TravisCI log truncation issue, see https://github.com/travis-ci/travis-ci/issues/8189
        process.exit (1)

    } else {
        process.exit (0)
    }

}) ();

/*  ------------------------------------------------------------------------ */
