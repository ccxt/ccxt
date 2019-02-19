/*  Preambule:

        1.  Our build scripts generate a lot of files (e.g. Python and PHP code for exchanges)
        2.  We want them to be ignored from the manual commits.
        3.  But at the same time, we want them to be persisting in the repo (committed by the CI tool)

    The standard `.gitignore` does not allow to do that, because it is only for untracked files.
    Once a file has been added to the repository, it cannot be ignored, all further changes will
    be tracked by Git.

    There is an another mechanism that supresses the tracking of the file locally:

        git update-index --assume-unchanged <file>

    But this thing is not a server-side setting, it is a local client-side thing, and has to be
    executed on each client individually. Luckily, we can easily do it, hence that script.

*/

"use strict";

const { execSync } = require ('child_process')
const log          = require ('ololog')

const files = [

    'build/ccxt.browser.js'

    // NB: Add more transpiled files here
]

for (const id of require ('./exchanges.json').ids) {

    files.push (`python/ccxt/${id}.py`)
    files.push (`python/ccxt/async_support/${id}.py`)
    files.push (`php/${id}.php`)
}

log.bright.cyan (`Disabling the git changes tracking for ${files.length} generated files...`)
execSync (`git update-index --assume-unchanged ` + files.join (' '))

