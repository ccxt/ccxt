"use strict";

/*  ---------------------------------------------------------------------------

    A tests launcher. Runs tests for all languages and all exchanges, in
    parallel, with a humanized error reporting.

    Usage: node run-tests [--php] [--js] [--python] [--python-async] [exchange] [symbol]

    --------------------------------------------------------------------------- */

const fs = require ('fs')
const log = require ('ololog')//.configure ({ indent: { pattern: '  ' }})
const ansi = require ('ansicolor').nice

/*  --------------------------------------------------------------------------- */

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

/*  --------------------------------------------------------------------------- */

const [,, ...args] = process.argv

const keys = {

    '--js': false,      // run JavaScript tests only
    '--php': false,     // run PHP tests only
    '--python': false,  // run Python 3 tests only
    '--python-async': false, // run Python 3 async tests only
    '--php-async': false,    // run php async tests only
}

let exchanges = []
let symbol = 'all'
let maxConcurrency = 5 // Number.MAX_VALUE // no limit

for (const arg of args) {
    if (arg.startsWith ('--'))               { keys[arg] = true }
    else if (arg.includes ('/'))             { symbol = arg }
    else if (Number.isFinite (Number (arg))) { maxConcurrency = Number (arg) }
    else                                     { exchanges.push (arg) }
}

/*  --------------------------------------------------------------------------- */

if (!exchanges.length) {

    if (!fs.existsSync ('./exchanges.json')) {

        log.bright.red ('\n\tNo', 'exchanges.json'.white, 'found, please run', 'npm run build'.white, 'to generate it!\n')
        process.exit (1)
    }

    exchanges = require ('./exchanges.json').ids
}

/*  --------------------------------------------------------------------------- */

const sleep = s => new Promise (resolve => setTimeout (resolve, s*1000))
const timeout = (s, promise) => Promise.race ([ promise, sleep (s).then (() => { throw new Error ('timed out') }) ])

/*  --------------------------------------------------------------------------- */

const exec = (bin, ...args) =>

/*  A custom version of child_process.exec that captures both stdout and
    stderr,  not separating them into distinct buffers — so that we can show
    the same output as if it were running in a terminal.                        */

    timeout (120, new Promise (return_ => {

        const ps = require ('child_process').spawn (bin, args)

        let output = ''
        let stderr = ''
        let hasWarnings = false

        ps.stdout.on ('data', data => { output += data.toString () })
        ps.stderr.on ('data', data => { output += data.toString (); stderr += data.toString (); hasWarnings = true })

        ps.on ('exit', code => {

            output = ansi.strip (output.trim ())
            stderr = ansi.strip (stderr)

            const regex = /\[[a-z]+?\]/gmi

            let match = undefined
            const warnings = []

            match = regex.exec (output)

            if (match) {
                warnings.push (match[0])
                do {
                    if (match = regex.exec (output)) {
                        warnings.push (match[0])
                    }
                } while (match);
            }

            return_ ({
                failed: code !== 0,
                output,
                hasOutput: output.length > 0,
                hasWarnings: hasWarnings || warnings.length > 0,
                warnings: warnings,
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

/*  Run tests for all/selected languages (in parallel)     */

    const args = [exchange, ...symbol === 'all' ? [] : symbol]
        , allTests = [

            { language: 'JavaScript',     key: '--js',           exec: ['node',      'js/test/test.js',           ...args] },
            { language: 'Python 3',       key: '--python',       exec: ['python3',   'python/ccxt/test/test_sync.py',  ...args] },
            { language: 'Python 3 Async', key: '--python-async', exec: ['python3',   'python/ccxt/test/test_async.py', ...args] },
            { language: 'PHP',            key: '--php',          exec: ['php', '-f', 'php/test/test_sync.php',         ...args] },
            { language: 'PHP Async',      key: '--php-async',    exec: ['php', '-f', 'php/test/test_async.php',   ...args] },
        ]
        , selectedTests  = allTests.filter (t => keys[t.key])
        , scheduledTests = selectedTests.length ? selectedTests : allTests
        , completeTests  = await sequentialMap (scheduledTests, async test => Object.assign (test, await exec (...test.exec)))
        , failed         = completeTests.find (test => test.failed)
        , hasWarnings    = completeTests.find (test => test.hasWarnings)
        , warnings       = completeTests.reduce ((total, { warnings }) => total.concat (warnings), [])

/*  Print interactive log output    */

    numExchangesTested++

    const percentsDone = ((numExchangesTested / exchanges.length) * 100).toFixed (0) + '%'

    log.bright (('[' + percentsDone + ']').dim, 'Testing', exchange.cyan, (failed      ? 'FAIL'.red :
                                                                          (hasWarnings ? (warnings.length ? warnings.join (' ') : 'WARN').yellow
                                                                                       : 'OK'.green)))

/*  Return collected data to main loop     */

    return {

        exchange,
        failed,
        hasWarnings,
        explain () {
            for (const { language, failed, output, hasWarnings } of completeTests) {
                if (failed || hasWarnings) {

                    if (!failed && output.indexOf('[Skipped]') >= 0)
                        continue;

                    if (failed) { log.bright ('\nFAILED'.bgBrightRed.white, exchange.red,    '(' + language + '):\n') }
                    else        { log.bright ('\nWARN'.yellow.inverse,      exchange.yellow, '(' + language + '):\n') }

                    log.indent (1) (output)
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

    log.bright.magenta.noPretty ('Testing'.white, Object.assign (
                                                            { exchanges, symbol, keys },
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
