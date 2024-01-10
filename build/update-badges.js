// ---------------------------------------------------------------------------
// Usage:
//
//      npm run update-badges
// ---------------------------------------------------------------------------


import fs from 'fs';
import ccxt from '../js/ccxt.js';
import log from 'ololog';
import ansicolor from 'ansicolor';

ansicolor.nice
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