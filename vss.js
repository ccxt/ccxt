"use strict";

const fs        = require ('fs')
const ccxt      = require ('./ccxt')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog')
const ansi      = require ('ansicolor').nice

//-----------------------------------------------------------------------------

let packageJSON = fs.readFileSync ('./package.json', 'utf8')
let config = JSON.parse (packageJSON);
let version = config.version

//-----------------------------------------------------------------------------

log.bright ('Old version: '.dim, version)
let [ major, minor, patch ] = version.split ('.')

// we don't increment it here anymore, because
// npm version patch will be explicitly called before

// patch = (parseInt (patch) + 1).toString ()

version = [ major, minor, patch ].join ('.')
log.bright ('New version: '.cyan, version)

function vss (filename, regex, replacement) {
    log.bright.cyan ('Single-sourcing version', version, './package.json → ' + filename.yellow)
    let oldContent = fs.readFileSync (filename, 'utf8')
    let parts = oldContent.split (regex)
    let newContent = parts[0] + replacement + version + "'" + parts[1]
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContent)
}

//-----------------------------------------------------------------------------

vss ('./ccxt.php',                           /\$version \= \'[^\']+\'/, "$version = '")
vss ('./ccxt.js',                            /const version \= \'[^\']+\'/, "const version = '")
vss ('./python/ccxt/__init__.py',            /\_\_version\_\_ \= \'[^\']+\'/, "__version__ = '")
vss ('./python/ccxt/async/__init__.py',      /\_\_version\_\_ \= \'[^\']+\'/, "__version__ = '")
vss ('./python/ccxt/base/exchange.py',       /\_\_version\_\_ \= \'[^\']+\'/, "__version__ = '")
vss ('./python/ccxt/async/base/exchange.py', /\_\_version\_\_ \= \'[^\']+\'/, "__version__ = '")

//-----------------------------------------------------------------------------

log.bright.green ('Version single-sourced successfully.')