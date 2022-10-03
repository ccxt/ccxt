// ---------------------------------------------------------------------------
// Usage:
//
//      npm run vss
// ---------------------------------------------------------------------------

"use strict";

const fs           = require ('fs')
    , log          = require ('ololog')
    , ansi         = require ('ansicolor').nice
    , { execSync } = require ('child_process')
    , { copyFile } = require ('./fs.js')

//-----------------------------------------------------------------------------

function vss (filename, template, version) {
    log.bright.cyan ('Single-sourcing version', version, './package.json → ' + filename.yellow)
    const content = fs.readFileSync (filename, 'utf8')
    const regexp  = new RegExp (template.replace (/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // escape string for use in regexp
                                        .replace ('\\{version\\}', '\\d+\\.\\d+\\.\\d+'), 'g')
    fs.truncateSync  (filename)
    fs.writeFileSync (filename, content.replace (regexp, template.replace ('{version}', version)))
}

// ----------------------------------------------------------------------------

function vssEverything () {

    let { version } = require ('../package.json')

    log.bright ('New version: '.cyan, version)

    vss ('./ccxt.js',                                    "const version = '{version}'", version)
    vss ('./php/Exchange.php',                           "$version = '{version}'",      version)
    vss ('./php/async/Exchange.php',                     "VERSION = '{version}'",       version)
    vss ('./php/async/Exchange.php',                     "$version = '{version}'",      version)
    vss ('./php/Exchange.php',                           "VERSION = '{version}'",       version)
    vss ('./python/ccxt/__init__.py',                    "__version__ = '{version}'",   version)
    vss ('./python/ccxt/base/exchange.py',               "__version__ = '{version}'",   version)
    vss ('./python/ccxt/async_support/__init__.py',      "__version__ = '{version}'",   version)
    vss ('./python/ccxt/async_support/base/exchange.py', "__version__ = '{version}'",   version)

    vss ('./README.md',       "ccxt@{version}", version)
    vss ('./wiki/Install.md', "ccxt@{version}", version)

    const pythonFiles = [
        'package.json',
        'LICENSE.txt',
        'keys.json',
        'README.md',
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
