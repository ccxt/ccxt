// ---------------------------------------------------------------------------
// Usage:
//
//      npm run update-badges
// ---------------------------------------------------------------------------

"use strict";

const fs = require ('fs')
const ccxt = require ('../ccxt')
const log  = require ('ololog')
const ansi = require ('ansicolor').nice

//-----------------------------------------------------------------------------

function updateExchangeCount (fileName) {

    log.bright.cyan ('Updating exchange count →', fileName.yellow)

    let oldContent = fs.readFileSync (fileName, 'utf8')
    let newContent =
        oldContent.replace (/shields\.io\/badge\/exchanges\-[0-9a-z]+\-blue/g, 'shields.io/badge/exchanges-' + ccxt.exchanges.length + '-blue')


    fs.truncateSync (fileName)
    fs.writeFileSync (fileName, newContent)

}

updateExchangeCount ('./README.md')
updateExchangeCount ('./python/README.md')

log.bright.green ('Badges updated successfully.')

//-----------------------------------------------------------------------------