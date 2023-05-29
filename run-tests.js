/*  ---------------------------------------------------------------------------

A tests launcher. Runs tests for all languages and all exchanges, in
parallel, with a humanized error reporting.

Usage: node run-tests [--php] [--js] [--python] [--python-async] [exchange] [symbol]

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
    '--php-async': false,    // run php async tests only,
}

const optionKeys = {
    '--warnings': false,
    '--info': false,
}

const exchangeSpecificFlags = {
    '--sandbox': false,
    '--verbose': false,
    '--private': false,
    '--privateOnly': false,
    '--info': false,
}

const content = fs.readFileSync ('skip-tests.json', 'utf8');
const skipSettings = JSON.parse (content);

let exchanges = []
let symbol = 'all'
let maxConcurrency = 5 // Number.MAX_VALUE // no limit

for (const arg of args) {
    if (arg in exchangeSpecificFlags)        { exchangeSpecificFlags[arg] = true }
    else if (arg.startsWith ('--'))          {
        if (arg in langKeys) {
            langKeys[arg] = true
        } else if (arg in optionKeys) {
            optionKeys[arg] = true
        } else {
            log.bright.red ('\nUnknown option', arg.white, '\n');
        }
    }
    else if (arg.includes ('/'))             { symbol = arg }
    else if (Number.isFinite (Number (arg))) { maxConcurrency = Number (arg) }
    else                                     { exchanges.push (arg) }
}

/*  --------------------------------------------------------------------------- */

const exchangeOptions = []
for (const key of Object.keys (exchangeSpecificFlags)) {
    if (exchangeSpecificFlags[key]) {
        exchangeOptions.push (key)
    }
}
/*  --------------------------------------------------------------------------- */

if (!exchanges.length) {

    if (!fs.existsSync ('./exchanges.json')) {

        log.bright.red ('\n\tNo', 'exchanges.json'.white, 'found, please run', 'npm run build'.white, 'to generate it!\n')
        process.exit (1)
    }
    let exchangesFile =  fs.readFileSync('./exchanges.json');
    exchangesFile = JSON.parse(exchangesFile)
    exchanges = exchangesFile.ids
}

/*  --------------------------------------------------------------------------- */

const sleep = s => new Promise (resolve => setTimeout (resolve, s*1000))
const timeout = (s, promise) => Promise.race ([ promise, sleep (s).then (() => { throw new Error ('timed out') }) ])

/*  --------------------------------------------------------------------------- */

const exec = (bin, ...args) =>

/*  A custom version of child_process.exec that captures both stdout and
    stderr,  not separating them into distinct buffers — so that we can show
    the same output as if it were running in a terminal.                        */

    timeout (250, new Promise (return_ => {

        const psSpawn = ps.spawn (bin, args)

        let output = ''
        let stderr = ''
        let hasWarnings = false

        psSpawn.stdout.on ('data', data => { output += data.toString () })
        psSpawn.stderr.on ('data', data => { output += data.toString (); stderr += data.toString (); hasWarnings = true })

        psSpawn.on ('exit', code => {
            // keep this commented code for a while (just in case), as the below avoids vscode false positive warnings from output: https://github.com/nodejs/node/issues/34799 during debugging
            // const removeDebuger = (str) => str.replace ('Debugger attached.\r\n','').replace('Waiting for the debugger to disconnect...\r\n', '').replace(/\(node:\d+\) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time\n\(Use `node --trace-warnings ...` to show where the warning was created\)\n/, '');
            // stderr = removeDebuger(stderr);
            // output = removeDebuger(output);
            // if (stderr === '') { hasWarnings = false; }

            output = ansi.strip (output.trim ())
            stderr = ansi.strip (stderr)

            const infoRegex = /\[INFO:([\w_-]+)].+$\n*/gmi
            const regex = /\[[a-z]+?\]/gmi

            let match = undefined
            const warnings = []
            const info = []

            let outputInfo = '';

            match = regex.exec (output)
            let matchInfo = infoRegex.exec (output)

            // detect error
            let hasFailed = false;
            if (
                // exception caught in "test -> testMethod"
                output.indexOf('[TEST_FAILURE]') > -1 ||
                // 1) thrown from JS assert module
                output.indexOf('AssertionError:') > -1 ||
                // 2) thrown from PYTHON (i.e. [AssertionError], [KeyError], [ValueError], etc)
                output.indexOf('Error]') > -1 ||
                // 3) thrown from PHP assert hook
                output.indexOf('[ASSERT_ERROR]') > -1 ||
                // 4) thrown from PHP async library
                output.indexOf('Fatal error:') > -1
            ) {
                hasFailed = true;
            }

            if (match) {
                warnings.push (match[0])
                do {
                    if (match = regex.exec (output)) {
                        warnings.push (match[0])
                    }
                } while (match);
            }
            if (matchInfo) {
                info.push ('[' + matchInfo[1] + ']')
                outputInfo += matchInfo[0]
                do {
                    if (matchInfo = infoRegex.exec (output)) {
                        info.push ('[' + matchInfo[1] + ']')
                        outputInfo += matchInfo[0]
                    }
                } while (matchInfo);
                output = output.replace (infoRegex, '')
            }
            return_ ({
                failed: hasFailed || code !== 0,
                output,
                outputInfo,
                hasOutput: output.length > 0,
                hasWarnings: hasWarnings || warnings.length > 0,
                warnings: warnings,
                infos: info,
                hasInfo: info.length > 0,
            })
        })

    })).catch (e => ({

        failed: true,
        output: e.message

    })).then (x => Object.assign (x, { hasOutput: x.output.length > 0 }))

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

    numExchangesTested++
    const percentsDone = ((numExchangesTested / exchanges.length) * 100).toFixed (0) + '%'

    if (skipSettings[exchange] && skipSettings[exchange].skip) {
        log.bright (('[' + percentsDone + ']').dim, 'Tested', exchange.cyan, '[Skipped]'.yellow)
        return [];
    }

/*  Run tests for all/selected languages (in parallel)     */
    let args = [exchange];
    if (symbol !== undefined && symbol !== 'all') {
        args.push(symbol);
    }
    args = args.concat(exchangeOptions)
    const allTestsWithoutTs = [
            { language: 'JavaScript',     key: '--js',           exec: ['node',      'js/src/test/test.js',           ...args] },
            { language: 'Python 3',       key: '--python',       exec: ['python3',   'python/ccxt/test/test_sync.py',  ...args] },
            { language: 'Python 3 Async', key: '--python-async', exec: ['python3',   'python/ccxt/test/test_async.py', ...args] },
            { language: 'PHP',            key: '--php',          exec: ['php', '-f', 'php/test/test_sync.php',         ...args] },
            { language: 'PHP Async', key: '--php-async',    exec: ['php', '-f', 'php/test/test_async.php',   ...args] }
        ]

        const allTests = allTestsWithoutTs.concat([
            { language: 'TypeScript',     key: '--ts',           exec: ['node',  '--loader', 'ts-node/esm',  'ts/src/test/test.ts',           ...args] },
        ]);

        const selectedTests  = allTests.filter (t => langKeys[t.key]);
        let scheduledTests = selectedTests.length ? selectedTests : allTestsWithoutTs
        // when bulk tests are run, we skip php-async, however, if your specifically run php-async (as a single language from run-tests), lets allow it
        const specificLangSet = (Object.values (langKeys).filter (x => x)).length === 1;
        if (skipSettings[exchange] && skipSettings[exchange].skipPhpAsync && !specificLangSet) {
            // some exchanges are failing in php async tests with this error:
            // An error occured on the underlying stream while buffering: Unexpected end of response body after 212743/262800 bytes
            scheduledTests = scheduledTests.filter (x => x.key !== '--php-async');
        }
        const completeTests  = await sequentialMap (scheduledTests, async test => Object.assign (test, await exec (...test.exec)))
        , failed         = completeTests.find (test => test.failed)
        , hasWarnings    = completeTests.find (test => test.hasWarnings)
        , hasInfo        = completeTests.find (test => test.hasInfo)
        , warnings       = completeTests.reduce (
            (total, { warnings }) => {
                return total.concat (warnings)
            }, []
        )
        , infos       = completeTests.reduce (
            (total, { infos }) => {
                return total.concat (infos)
            }, []
        )

/*  Print interactive log output    */

    let logMessage = '';

    if (failed) {
        logMessage+= 'FAIL'.red;
    } else if (hasWarnings) {
        logMessage = (warnings.length ? warnings.join (' ') : 'WARN').yellow;
    } else {
        logMessage = 'OK'.green;
    }

    // info messages
    if (hasInfo) {
        if (exchangeSpecificFlags['--info']) {
            logMessage += ' ' + 'INFO'.blue + ' ';
            const infoMessages = infos.join(' ');
            logMessage += infoMessages.blue;
        }
    }
    log.bright (('[' + percentsDone + ']').dim, 'Tested', exchange.cyan, logMessage)

/*  Return collected data to main loop     */

    return {

        exchange,
        failed,
        hasWarnings,
        hasInfo: hasInfo && exchangeSpecificFlags['--info'],
        explain () {
            for (let { language, failed, output, hasWarnings, hasInfo, outputInfo } of completeTests) {
                if (failed || hasWarnings) {
                    const fullSkip = output.indexOf('[SKIPPED]') >= 0;
                    if (!failed && fullSkip)
                        continue;

                    if (failed) { log.bright ('\nFAILED'.bgBrightRed.white, exchange.red,    '(' + language + '):\n') }
                    else        { log.bright ('\nWARN'.yellow.inverse,      exchange.yellow, '(' + language + '):\n') }

                    log.indent (1) (output)
                }
                if (hasInfo) {
                    log.bright ('\nINFO'.blue.inverse,':\n')
                    log.indent (1) (outputInfo)
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

    const allKeys = Object.assign (optionKeys, langKeys)
    log.bright.magenta.noPretty ('Testing'.white, Object.assign (
                                                            { exchanges, symbol, allKeys, exchangeSpecificFlags },
                                                            maxConcurrency >= Number.MAX_VALUE ? {} : { maxConcurrency }))

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

    log.bright ('All done,', [failed.length    && (failed.length    + ' failed')   .red,
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
    
