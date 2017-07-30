"use strict";

/*  ---------------------------------------------------------------------------

    A tests launcher. Runs tests for all languages and all markets, in
    parallel, with a humanized error reporting.

    Usage: node run-tests [--php] [--js] [--python] [--es6] [market] [symbol]

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
    '--python': false,  // run Python tests only
    '--es6': false,     // run JS tests against ccxt.js instead of ccxt.es5.js (no need to `npm run build` before)
}

let markets = []
let symbol = 'all'

for (const arg of args) {
    if (arg.startsWith ('--'))   { keys[arg] = true }
    else if (arg.includes ('/')) { symbol = arg }
    else                         { markets.push (arg) }
}

/*  --------------------------------------------------------------------------- */

if (!markets.length) {

    if (!fs.existsSync ('markets.json')) {

        log.bright.red ('\n\tNo', 'markets.json'.white, 'found, please run', 'npm run build'.white, 'to generate it!\n')
        process.exit (1)
    }

    markets = JSON.parse (fs.readFileSync ('markets.json')).ids
}

/*  --------------------------------------------------------------------------- */

const sleep = ms => new Promise (resolve => setTimeout (resolve, ms))
const timeout = (ms, promise) => Promise.race ([ promise, sleep (ms).then (() => { throw new Error ('timed out') }) ])

/*  --------------------------------------------------------------------------- */

const exec = (bin, ...args) =>

/*  A custom version of child_process.exec that captures both stdout and
    stderr,  not separating them into distinct buffers — so that we can show
    the same output as if it were running in a terminal.                        */

    new Promise (return_ => {

        const ps = require ('child_process').spawn (bin, args)

        let output = ''
        let stderr = ''
        let hasWarnings = false

        ps.stdout.on ('data', data => { output += data.toString () })
        ps.stderr.on ('data', data => { output += data.toString (); stderr += data.toString (); hasWarnings = true })

        ps.on ('exit', code => {
            return_ ({
                failed: code !== 0,
                output,
                hasWarnings,
                warnings: ansi.strip (stderr).match (/\[[^\]]+Error\]/g) || []
            })
        })
    })

/*  ------------------------------------------------------------------------ */

let numMarketsTested = 0

/*  ------------------------------------------------------------------------ */

const sequentialMap = async (input, fn) => {

    const result = []
    for (const item of input) { result.push (await fn (item)) }
    return result
}

/*  ------------------------------------------------------------------------ */

const testMarket = async (market) => {

    const nonce = Date.now ()

/*  Run tests for all/selected languages (in parallel)     */

    const args = [market, ...symbol === 'all' ? [] : symbol]
        , allTests = [

            { language: 'JavaScript', key: '--js',      exec: ['node',      'test.js',  ...args, ...keys['--es6'] ? ['--es6'] : []] },
            { language: 'Python',     key: '--python',  exec: ['python',    'test.py',  ...args]                                    },
            { language: 'PHP',        key: '--php',     exec: ['php', '-f', 'test.php', ...args]                                    }
        ]
        , selectedTests  = allTests.filter (t => keys[t.key])
        , scheduledTests = selectedTests.length ? selectedTests : allTests
        , completeTests  = await sequentialMap (scheduledTests, async test => Object.assign (test, await exec (...test.exec)))
        , failed      = completeTests.find (test => test.failed)
        , hasWarnings = completeTests.find (test => test.hasWarnings)
        , warnings    = completeTests.reduce ((total, { warnings }) => total.concat (warnings), [])

/*  Print interactive log output    */

    numMarketsTested++

    const percentsDone = ((numMarketsTested / markets.length) * 100).toFixed (0) + '%'

    log.bright (('[' + percentsDone + ']').dim, 'Testing', market.cyan, (failed      ? 'FAIL'.red :
                                                                        (hasWarnings ? (warnings.length ? warnings.join (' ') : 'WARN').yellow
                                                                                     : 'OK'.green)))

/*  Return collected data to main loop     */

    return {

        market,
        failed,
        hasWarnings,
        explain () {
            for (const { language, failed, output, hasWarnings } of completeTests) {
                if (failed || hasWarnings) {

                    if (failed) { log.bright ('\nFAILED'.bgBrightRed.white, market.red,    '(' + language + '):\n') }
                    else        { log.bright ('\nWARN'.yellow.inverse,      market.yellow, '(' + language + '):\n') }

                    log.indent (1) (output)
                }
            }
        }
    }
}

/*  ------------------------------------------------------------------------ */

(async function () {

    log.bright.magenta.noPretty ('Testing'.white, { markets, symbol, keys })

    const tested   = await Promise.all (markets.map (testMarket))
        , warnings = tested.filter  (t => !t.failed && t.hasWarnings)
        , failed   = tested.filter  (t =>  t.failed)
        , succeeded = tested.filter (t => !t.failed && !t.hasWarnings)

    log.newline ()

    warnings.forEach (t => t.explain ())
    failed.forEach (t => t.explain ())

    log.newline ()

    if (failed.length)   { log.noPretty.bright.red    ('FAIL'.bgBrightRed.white,    failed  .map (t => t.market)) }
    if (warnings.length) { log.noPretty.bright.yellow ('WARN'.inverse, warnings.map (t => t.market)) }
    
    log.newline ()

    log.bright ('All done,', [failed.length    && (failed.length    + ' failed')   .red,
                              succeeded.length && (succeeded.length + ' succeeded').green,
                              warnings.length  && (warnings.length  + ' warnings') .yellow].filter (s => s).join (', '))

    if (failed.length) {

        await sleep (2000)
        process.exit (1)
    }

}) ();

/*  ------------------------------------------------------------------------ */