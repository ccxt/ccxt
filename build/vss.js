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

//-----------------------------------------------------------------------------

function incrementVersionPatchNumber (version) {

    let [ major, minor, patch ] = version.split ('.')

    // we don't increment it here anymore, because
    // npm version patch will be explicitly called before

    // patch = (parseInt (patch) + 1).toString ()

    version = [ major, minor, patch ].join ('.')

    return version
}

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

    log.bright ('Old version: '.dim, version)
    version = incrementVersionPatchNumber (version)
    log.bright ('New version: '.cyan, version)

    vss ('./ccxt.js',                                    "const version = '{version}'", version)
    vss ('./php/base/Exchange.php',                      "$version = '{version}'",      version)
    vss ('./php/base/Exchange.php',                      "VERSION = '{version}'",       version)
    vss ('./python/ccxt/__init__.py',                    "__version__ = '{version}'",   version)
    vss ('./python/ccxt/base/exchange.py',               "__version__ = '{version}'",   version)
    vss ('./python/ccxt/async_support/__init__.py',      "__version__ = '{version}'",   version)
    vss ('./python/ccxt/async_support/base/exchange.py', "__version__ = '{version}'",   version)

    vss ('./README.md',       "ccxt@{version}", version)
    vss ('./wiki/Install.md', "ccxt@{version}", version)

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
