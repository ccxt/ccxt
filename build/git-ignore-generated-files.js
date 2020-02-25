/*
    Usage:

        npm run git-ignore-generated-files
        npm run git-unignore-generated-files


    Preambule:

        1.  Our build scripts generate a lot of files (e.g. Python and PHP code for exchanges)
        2.  We want them to be ignored from the manual commits.
        3.  But at the same time, we want them to be persisting in the repo (committed by the CI tool)

    The standard `.gitignore` does not allow to do that, because it is only for untracked files.
    Once a file has been added to the repository, it cannot be ignored, all further changes will
    be tracked by Git.

    There is an another mechanism that suppresses the tracking of the file locally:

        git update-index --assume-unchanged <file>

    But this thing is not a server-side setting, it is a local client-side thing, and has to be
    executed on each client individually. Luckily, we can easily do it, hence that script.

*/


"use strict"

const { execSync } = require ('child_process')
const log          = require ('ololog')

let files = [

    'dist/ccxt.browser.js',

    'python/test/test_decimal_to_precision.py',
    'php/test/decimal_to_precision.php',

    'python/test/test_exchange_datetime_functions.py',
    'php/test/test_exchange_datetime_functions.php',

    'python/test/test.py',

    'wiki/Exchange-Markets-By-Country.md',
    'wiki/Exchange-Markets.md',

    'doc/FAQ.rst',
    'doc/README.rst',
    'doc/exchanges-by-country.rst',
    'doc/exchanges.rst',
    'doc/install.rst',
    'doc/manual.rst',
    'python/README.rst',

    // NB: Add more generated files here
]

for (const id of require ('../exchanges.json').ids) {

    files.push (`python/ccxt/${id}.py`)
    files.push (`python/ccxt/async_support/${id}.py`)
    files.push (`php/${id}.php`)
}

// Filter untracked files (otherwise "git update-index" would fail)
try {
    const untrackedFiles = new Set (execSync ('git ls-files --others --exclude-standard').toString ().split ('\n').filter (s => s.length))
    files = files.filter (f => !untrackedFiles.has (f))

} catch (e) {

    // There is a legit case when we're not in a git repo (happens on AppVeyor)
    if (!e.message.toLowerCase ().includes ('not a git repository')) {
        log.bright.red (e)
    }
}

if (process.argv.includes ('--unignore')) {

    log.bright.green (`Re-enabling the git changes tracking for ${files.length} generated files...`)
    gitUpdateIndex ('no-assume-unchanged', files)

} else {

    log.bright.cyan (`Disabling the git changes tracking for ${files.length} generated files...`)
    gitUpdateIndex ('assume-unchanged', files)
}

function gitUpdateIndex (command, allFiles) {

    try {

        // On Windows it cannot take more than 8191 characters per command, so we have to split...
        const batchSize = process.platform === 'win32' ? 250 : Infinity

        for (const files of slice (allFiles, batchSize)) {
            execSync (`git update-index --${command} ` + files.join (' '))
        }

    } catch (e) {

        // There is a legit case when we're not in a git repo (happens on AppVeyor)
        if (!e.message.toLowerCase ().includes ('not a git repository')) {

            // do not fail here, as it is not a critical step in the build process (better to let it complete the build)...
            log.red (e.message)
            log.bright.yellow.warn (e)
        }
    }
}

function* slice (array, size) {

    while (array.length) yield array.splice (0, size)
}


