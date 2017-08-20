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

//-----------------------------------------------------------------------------

log.bright.cyan ('Single-sourcing version', version, './package.json → ./ccxt.js'.yellow)
let ccxtjsFilename = './ccxt.js'
let ccxtjs = fs.readFileSync (ccxtjsFilename, 'utf8')
let ccxtjsParts = ccxtjs.split (/const version \= \'[^\']+\'/)
let ccxtjsNewContent = ccxtjsParts[0] + "const version = '" + version + "'" + ccxtjsParts[1]
fs.truncateSync (ccxtjsFilename)
fs.writeFileSync (ccxtjsFilename, ccxtjsNewContent)

//-----------------------------------------------------------------------------

log.bright.cyan ('Single-sourcing version', version, './package.json → ./ccxt/version.py'.yellow)
let ccxtpyFilename = './ccxt/version.py'
let ccxtpy = fs.readFileSync (ccxtpyFilename, 'utf8')
let ccxtpyParts = ccxtpy.split (/\_\_version\_\_ \= \'[^\']+\'/)
let ccxtpyNewContent = ccxtpyParts[0] + "__version__ = '" + version + "'" + ccxtpyParts[1]
fs.truncateSync (ccxtpyFilename)
fs.writeFileSync (ccxtpyFilename, ccxtpyNewContent)

//-----------------------------------------------------------------------------

log.bright.cyan ('Single-sourcing version', version, './package.json → ./ccxt.php'.yellow)
let ccxtphpFilename = './ccxt.php'
let ccxtphp = fs.readFileSync (ccxtphpFilename, 'utf8')
let ccxtphpParts = ccxtphp.split (/\$version \= \'[^\']+\'/)
let ccxtphpNewContent = ccxtphpParts[0] + '$version' + " = '" + version + "'" + ccxtphpParts[1]
fs.truncateSync (ccxtphpFilename)
fs.writeFileSync (ccxtphpFilename, ccxtphpNewContent)

//-----------------------------------------------------------------------------

log.bright.green ('Version single-sourced successfully.')