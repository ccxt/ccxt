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

let { version } = require ('../package.json')

//-----------------------------------------------------------------------------

log.bright ('Old version: '.dim, version)
let [ major, minor, patch ] = version.split ('.')

// we don't increment it here anymore, because
// npm version patch will be explicitly called before

// patch = (parseInt (patch) + 1).toString ()

version = [ major, minor, patch ].join ('.')
log.bright ('New version: '.cyan, version)

function vss (filename, template) {
    log.bright.cyan ('Single-sourcing version', version, './package.json → ' + filename.yellow)
    const content = fs.readFileSync (filename, 'utf8')
    const regexp  = new RegExp (template.replace (/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // escape string for use in regexp
                                        .replace ('\\{version\\}', '\\d+\\.\\d+\\.\\d+'), 'g')
    fs.truncateSync  (filename)
    fs.writeFileSync (filename, content.replace (regexp, template.replace ('{version}', version)))
}

//-----------------------------------------------------------------------------

vss ('./php/Exchange.php',                           "$version = '{version}'")
vss ('./php/Exchange.php',                           "VERSION = '{version}'")
vss ('./ccxt.js',                                    "const version = '{version}'")
vss ('./python/ccxt/__init__.py',                    "__version__ = '{version}'")
vss ('./python/ccxt/async_support/__init__.py',      "__version__ = '{version}'")
vss ('./python/ccxt/base/exchange.py',               "__version__ = '{version}'")
vss ('./python/ccxt/async_support/base/exchange.py', "__version__ = '{version}'")

vss ('./README.md',       "ccxt@{version}")
vss ('./wiki/Install.md', "ccxt@{version}")

//-----------------------------------------------------------------------------

execSync ('cp ./package.json ./LICENSE.txt ./keys.json ./python/')

//-----------------------------------------------------------------------------

log.bright.green ('Version single-sourced successfully.')
