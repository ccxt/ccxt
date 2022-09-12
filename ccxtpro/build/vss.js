// ---------------------------------------------------------------------------
// Usage:
//
//      npm run vss
// ---------------------------------------------------------------------------

"use strict";

const fs           = require ('fs')
const log          = require ('ololog')
const ansi         = require ('ansicolor').nice
const { copyFile } = require ('ccxt/build/fs.js')
const { vss } = require ('ccxt/build/vss.js')

// ----------------------------------------------------------------------------

function vssEverything () {

    let { version } = require ('../package.json')

    log.bright ('New version: '.cyan, version)

    vss ('./ccxt.pro.js',                     "const version = '{version}'", version)
    vss ('./php/Exchange.php',                "$version = '{version}'",      version)
    vss ('./php/Exchange.php',                "VERSION = '{version}'",       version)
    vss ('./python/ccxtpro/__init__.py',      "__version__ = '{version}'",   version)
    vss ('./python/ccxtpro/base/exchange.py', "__version__ = '{version}'",   version)

    vss ('./README.md',       "ccxt@{version}")
    // vss ('./wiki/Install.md', "ccxt@{version}")

    const pythonFiles = [
        'package.json',
        'LICENSE.txt',
        'keys.json',
    ]

    pythonFiles.forEach ((fileName) => copyFile ('./' + fileName, './python/' + fileName))

    log.bright.green ('Version single-sourced successfully.')
}

// ============================================================================
// main entry point

if (require.main === module) {

    // if called directly like `node module`

    vssEverything ()

} else {

    // do nothing if required as a module
}

// ============================================================================

module.exports = {
    vss,
    vssEverything,
}
