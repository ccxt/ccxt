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
        let hasErrorOutput = false

        ps.stdout.on ('data', data => { output += data.toString () })
        ps.stderr.on ('data', data => { output += data.toString (); hasErrorOutput = true })

        ps.on ('exit', code => { return_ ({ failed: code !== 0, output, hasErrorOutput }) })
    })

/*  ------------------------------------------------------------------------ */

const testMarket = async (market) => {

/*  Run tests for all/selected languages (in parallel)     */

    const args = [market, ...symbol === 'all' ? [] : symbol]
        , allTests = [

            { language: 'JavaScript', key: '--js',      exec: ['node',      'test.js',  ...args, ...keys['--es6'] ? ['--es6'] : []] },
            { language: 'Python',     key: '--python',  exec: ['python',    'test.py',  ...args]                                    },
            { language: 'PHP',        key: '--php',     exec: ['php', '-f', 'test.php', ...args]                                    }
        ]
        , selectedTests  = allTests.filter (t => keys[t.key])
        , scheduledTests = selectedTests.length ? selectedTests : allTests
        , completeTests  = await Promise.all (scheduledTests.map (test => exec (...test.exec)
                                                                         .then (result => Object.assign (test, result))))
        , anyFailed = completeTests.find (test => test.failed)

/*  Print log output    */

    log.bright ('Testing', market.cyan, anyFailed ? 'FAILED'.bgBrightRed : 'OK'.green)

    for (const { language, failed, output, hasErrorOutput } of completeTests) {

        if (failed || hasErrorOutput) {

            log.indent (1) ('\n', failed ? language.bright.bgBrightRed : language.bright.yellow, '\n')
            log.indent (2) (output)
        }
    }

    return { market, failed: anyFailed }
}

/*  ------------------------------------------------------------------------ */

(async function () {

    log.bright.magenta.noPretty ('Testing'.white, { markets, symbol, keys })

    const failed = (await Promise.all (markets.map (testMarket))).filter (t => t.failed)
                                                                 .map (t => t.market)

    if (failed.length) {

        log.bright.red ('\nFAILED:'.bgBrightRed.white, failed, '\n')
        process.exit (1)

    } else {

        log.bright.bgGreen ('\nALL OK')
        process.exit (0)
    }

}) ();

/*  ------------------------------------------------------------------------ */