"use strict";

const fs        = require ('fs')
const ccxt      = require ('./ccxt')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')

console.log ('Single-sourcing version: package.json → ./ccxt/__init__.py')

let packageJSON = fs.readFileSync ('./package.json', 'utf8')
let config = JSON.parse (packageJSON);
console.log (config)
let ccxtpyFilename = './ccxt/__init__.py'
let ccxtpy = fs.readFileSync (ccxtpyFilename, 'utf8')
let ccxtpyParts = ccxtpy.split (/\_\_version\_\_ \= \'[^\']+\'/)
let ccxtpyNewContent = ccxtpyParts[0] + "__version__ = '" + config.version + "'" + ccxtpyParts[1]
// console.log (ccxtpyNewContent)
fs.truncateSync (ccxtpyFilename)
fs.writeFileSync (ccxtpyFilename, ccxtpyNewContent)

console.log ('Version single-sourced successfully.')
