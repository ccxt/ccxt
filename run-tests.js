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
//  --------------------------------------------------------------------------- //

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

//  --------------------------------------------------------------------------- //

const [,, ...args] = process.argv

const langKeys = {
    '--ts': false,      // run TypeScript tests only
    '--js': false,      // run JavaScript tests only
    '--php': false,     // run PHP tests only
    '--python': false,  // run Python 3 tests only
    '--python-async': false, // run Python 3 async tests only
    '--csharp': false,  // run C# tests only
    '--php-async': false,    // run php async tests only,
    '--go': false,      // run GO tests only
    '--java': false,    // run Java tests only
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
    '--request': false,
    '--response': false,
    // force the prediction-markets namespace for ids present in both ccxt and ccxt.prediction
    // (e.g. hyperliquid), and opt into the funded order-placement prediction test
    '--prediction': false,
    '--fundedTests': false,
}

let exchanges = []
let symbol = 'all'
let method = undefined
let maxConcurrency = undefined // a bare numeric CLI arg always wins; otherwise computed per-language after the args are parsed

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

if (maxConcurrency === undefined) {
    const lightLangKeys = [ '--js', '--ts', '--python', '--python-async', '--php', '--php-async' ]
    const selectedLangs = Object.keys (langKeys).filter (key => langKeys[key])
    const onlyLightLangs = (selectedLangs.length > 0) && selectedLangs.every (key => lightLangKeys.includes (key))
    maxConcurrency = langKeys['--java'] ? 3 : (onlyLightLangs ? 20 : 5)
}

const wsFlag = exchangeSpecificFlags['--ws'] ? 'WS': '';

const timeoutSeconds = wsFlag ? (langKeys['--java'] ? 180 : 120) : 250;


//  --------------------------------------------------------------------------- //

const exchangeOptions = []
for (const key of Object.keys (exchangeSpecificFlags)) {
    if (exchangeSpecificFlags[key]) {
        exchangeOptions.push (key)
    }
}
//  --------------------------------------------------------------------------- //

const content = fs.readFileSync ('./skip-tests.json', 'utf8');
const skipSettings = JSON.parse (content);

if (!exchanges.length) {

    if (!fs.existsSync ('./exchanges.json')) {

        log.bright.red ('\n\tNo', 'exchanges.json'.white, 'found, please run', 'npm run build'.white, 'to generate it!\n')
        process.exit (1)
    }
    let exchangesFile =  fs.readFileSync('./exchanges.json');
    exchangesFile = JSON.parse(exchangesFile)
    // include the prediction-market exchanges (separate `prediction` / `predictionWs`
    // arrays) in the default run so CI live-tests them alongside the crypto exchanges
    const cryptoExchanges = wsFlag ? exchangesFile.ws : exchangesFile.ids
    const predictionExchanges = (wsFlag ? exchangesFile.predictionWs : exchangesFile.prediction) || []
    exchanges = cryptoExchanges.concat (predictionExchanges)
}

//  --------------------------------------------------------------------------- //

const sleep = s => new Promise (resolve => setTimeout (resolve, s*1000))
const timeout = (s, promise) => Promise.race ([ promise, sleep (s).then (() => {
    throw new Error ('RUNTEST_TIMED_OUT');
}) ])

/*  tests.ts unconditionally dumps "[INFO] TESTING  <exchange> <method>" when a method
    test starts and a matching "TESTING DONE" / "TESTING FAILED" line when it finishes.
    On a timeout, the started-but-never-finished markers identify the hung method(s) —
    there can be several at once, because tests.ts runs each batch through Promise.all.
    Counts (not a set) are used because testSafe retries re-emit the same markers.       */
const unfinishedMethods = (output) => {
    const counts = {}
    const bump = (regex, delta) => {
        let match
        while ((match = regex.exec (output))) {
            const key = match[1] + '.' + match[2]
            counts[key] = (counts[key] || 0) + delta
        }
    }
    bump (/\[INFO\] TESTING(?!\s+(?:DONE|FAILED)\b)\s+(\S+)\s+([A-Za-z]\w*)/g, 1)
    bump (/\[INFO\] TESTING (?:DONE|FAILED)\s+(\S+)\s+([A-Za-z]\w*)/g, -1)
    return Object.keys (counts).filter (key => counts[key] > 0)
}

//  --------------------------------------------------------------------------- //

const exec = (bin, ...args) => { 

/*  A custom version of child_process.exec that captures both stdout and
    stderr,  not separating them into distinct buffers — so that we can show
    the same output as if it were running in a terminal.                        */

    let output = ''
    let stderr = ''

    const generateResultFromOutput = (output, stderr, code) => {
            // keep this commented code for a while (just in case), as the below avoids vscode false positive warnings from output: https://github.com/nodejs/node/issues/34799 during debugging
            // const removeDebuger = (str) => str.replace ('Debugger attached.','').replace('Waiting for the debugger to disconnect...', '').replace(/\(node:\d+\) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time\n\(Use `node --trace-warnings ...` to show where the warning was created\)\n/, '');
            // stderr = removeDebuger(stderr), output = removeDebuger(output);

            output = ansi.strip (output.trim ())

            // detect error
            const hasFailed = (
                // exception caught in "test -> testMethod"
                output.indexOf('[TEST_FAILURE]') > -1 ||
                // below checks are retained just for the sake of completeness & possible edge-cases, however it should not be needed anymore, because we always add `[TEST_FAILURE]` to the output in tests
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

    return timeout (timeoutSeconds, new Promise (resolver => {

        const psSpawn = ps.spawn (bin, args)

        psSpawn.stdout.on ('data', data => { output += data.toString () })
        psSpawn.stderr.on ('data', data => { output += data.toString (); stderr += data.toString ().trim (); })

        psSpawn.on ('exit', code => {
            const result = generateResultFromOutput (output, stderr, code)
            return resolver (result) ;
        })

        if (debugKeys['--info']) {
            psSpawn.on ('error', (err) => {
                console.log ('RUNTESTS err event:', err);
            });
            psSpawn.on ('message', (code, sendHandle) => {
                console.log ('RUNTESTS message event:', code, sendHandle);
            });
            psSpawn.on ('close', (code, signal) => {
                console.log ('RUNTESTS close event:', code, signal);
            });
        }
    })).catch (e => {
        const isTimeout = e.message === 'RUNTEST_TIMED_OUT';
        if (isTimeout) {
            // Timeouts are bucketed into WARN, not FAIL, so a hung exchange doesn't
            // fail the whole CI lane. They were FAIL for a while because WARN used to
            // hide them completely (a bare RUNTEST_TIMED_OUT with no context) — that's
            // mitigated now: the [TEST_WARNING] tag below carries the exact methods
            // that never finished (diffed from the TESTING / TESTING DONE markers that
            // tests.ts dumps), so hung exchanges stay visible in the WARN summary.
            // Exit code 0 keeps `failed` false unless the output already contains a
            // real [TEST_FAILURE] from before the hang.
            const hung = unfinishedMethods (ansi.strip (output));
            const hungMessage = hung.length ? ' (methods that never finished: ' + hung.join (', ') + ')' : '';
            // the [TEST_WARNING] tag goes into `output` only: generateResultFromOutput
            // both regex-matches the tag in stderr AND pushes the whole stderr, so
            // tagging the stderr copy too would print the message twice in the summary
            output += '\n[TEST_WARNING] RUNTEST_TIMED_OUT' + hungMessage;
            stderr += '\nRUNTEST_TIMED_OUT' + hungMessage;
            const result = generateResultFromOutput (output, stderr, 0);
            return result;
        }
        return {
            failed: true,
            output: e.message,
            warnings: [],
            infos: [],
        }
    } );
};

//  ------------------------------------------------------------------------ //

/*  Failures whose output points at connectivity rather than a code bug get one
    re-run — a transient network blip on the CI server shouldn't fail a lane.
    The bracketed class names come from exceptionMessage() in tests.helpers.ts
    ("[RequestTimeout] ..."), identical across all transpiled languages; the bare
    tokens cover process-level socket errors. RUNTEST_TIMED_OUT is deliberately
    not retried: it lands in WARN (failed=false), and re-running a hung exchange
    would double the lane's wall-clock for no benefit.                           */

const networkErrorRegex = /\[(?:NetworkError|OperationFailed|RequestTimeout|ExchangeNotAvailable|OnMaintenance|DDoSProtection|RateLimitExceeded|InvalidNonce)\]|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|socket hang up|getaddrinfo/

const execWithRetry = async (bin, ...args) => {
    const result = await exec (bin, ...args)
    if (result.failed && networkErrorRegex.test (result.output)) {
        log.bright.yellow ('Network error detected, retrying once:', [ bin, ...args ].join (' ').white)
        return exec (bin, ...args)
    }
    return result
}

//  ------------------------------------------------------------------------ //

let numExchangesTested = 0

//  Tests of different languages for the same exchange should be run sequentially to prevent the interleaving nonces problem. //

const sequentialMap = async (input, fn) => {

    const result = []
    for (const item of input) { result.push (await fn (item)) }
    return result
}

// const getJavaArgs = (args) => {
//     let res = "--args=\"";
//     for (const arg of args) {
//         res += `${arg.trim()} `;
//     }
//     res += `"`;
//     return [res];
// }

const getJavaArgs = (args) => {
    return `--args=${args.map(a => a.trim()).join(' ')}`;
};

//  ------------------------------------------------------------------------ //

const percentsDone = () => ((numExchangesTested / exchanges.length) * 100).toFixed (0) + '%';

const testExchange = async (exchange) => {

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
        if (!('until' in skipSettings[exchange]) || new Date(skipSettings[exchange].until) > new Date()) {
            numExchangesTested++;
            const reason = ('until' in skipSettings[exchange]) ? ' till ' + skipSettings[exchange].until : '';
            log.bright (('[' + percentsDone() + ']').dim, 'Tested', exchange.cyan, wsFlag, ('[Skipped]' + reason).yellow)
            return [];
        }
    }

    //  Run tests for all/selected languages (in parallel)     //
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
        { key: '--js',           language: 'JavaScript',   exec: ['node',      'js/src/test/tests.init.js',                     ...args] },
        { key: '--python-async', language: 'Python Async', exec: ['python3',   'python/ccxt/test/tests_init.py',          ...args] },
        { key: '--php-async',    language: 'PHP Async',    exec: ['php', '-f', 'php/test/tests_init.php',                 ...args] },
        { key: '--csharp',       language: 'C#',           exec: ['dotnet', 'run', '--project', 'cs/tests/tests.csproj',  ...args] },
        { key: '--ts',           language: 'TypeScript',   exec: ['node',  '--import', 'tsx', 'ts/src/test/tests.init.ts',      ...args] },
        { key: '--python',       language: 'Python',       exec: ['python3',   'python/ccxt/test/tests_init.py',  '--sync',  ...args] },
        { key: '--php',          language: 'PHP',          exec: ['php', '-f', 'php/test/tests_init.php', '--', '--sync',  ...args] },
        { key: '--go',           language: 'GO',           exec: [ 'go', 'run', '-C', 'go', './tests/main.go',          ...args] },
        { key: '--java',         language: 'Java',         exec: [ './java/gradlew', '-p', 'java', 'tests:run', getJavaArgs(args)] },
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
        if (skipSettings[exchange].skipPythonAsync) selectedTests = selectedTests.filter (t => t.key !== '--python-async');
        if (skipSettings[exchange].skipJava) selectedTests = selectedTests.filter (t => t.key !== '--java');
    }
    // if it's WS tests, then remove sync versions (php & python) from queue
    if (wsFlag) {
        selectedTests = selectedTests.filter (t => t.key !== '--python' && t.key !== '--php');
    }

    const completeTests  = await sequentialMap (selectedTests, async test => Object.assign (test, await execWithRetry (...test.exec)));
    const failed         = completeTests.find (test => test.failed);
    const hasWarnings    = completeTests.find (test => test.warnings.length);
    const warnings       = completeTests.reduce (
        (total, { warnings }) => {
            return warnings.length ? total.concat(['\n\n']).concat (warnings) : []
        }, []
    );
    const infos          = completeTests.reduce (
        (total, { infos }) => {
            return infos.length ? total.concat(['\n\n']).concat (infos) : []
        }, []
    );

    // Print interactive log output
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

    // Return collected data to main loop
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

//  ------------------------------------------------------------------------ //

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

//  ------------------------------------------------------------------------ //

async function testAllExchanges () {

    const taskPool = TaskPool (maxConcurrency)
    const results = []

    for (const exchange of exchanges) {
        taskPool.run (() => testExchange (exchange).then (x => results.push (x)))
    }

    await Promise.all (taskPool.pending)

    return results
}

//  ------------------------------------------------------------------------ //

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

//  ------------------------------------------------------------------------ //
