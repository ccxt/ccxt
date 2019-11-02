// ---------------------------------------------------------------------------
// Usage:
//
//      npm run vss
// ---------------------------------------------------------------------------

"use strict";

const fs           = require ('fs')
const log          = require ('ololog')
const ansi         = require ('ansicolor').nice
const { execSync } = require ('child_process')
const { incrementVersionPatchNumber, vss } = require ('ccxt/build/vss.js')

// ----------------------------------------------------------------------------

function vssEverything () {

    let { version } = require ('../package.json')

    log.bright ('Old version: '.dim, version)
    version = incrementVersionPatchNumber (version)
    log.bright ('New version: '.cyan, version)

    vss ('./ccxt.pro.js',                     "const version = '{version}'", version)
    vss ('./php/base/Exchange.php',           "$version = '{version}'",      version)
    vss ('./php/base/Exchange.php',           "VERSION = '{version}'",       version)
    vss ('./python/ccxtpro/__init__.py',      "__version__ = '{version}'",   version)
    vss ('./python/ccxtpro/base/exchange.py', "__version__ = '{version}'",   version)

    vss ('./README.md',       "ccxt@{version}")
    // vss ('./wiki/Install.md', "ccxt@{version}")

    execSync ('cp ./package.json ./LICENSE.txt ./keys.json ./python/')

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
    incrementVersionPatchNumber,
    vss,
    vssEverything,
}
