"use strict";

const fs = require('fs');
const ccxt = require('./ccxt');
const log = require('ololog');
const ansi = require('ansicolor').nice;

([
    './doc/README.rst',
    './doc/manual.rst',
    './doc/install.rst',
    './doc/exchanges.rst',
    './doc/exchanges-by-country.rst',

]).forEach(file => {
    const rst = fs.readFileSync(file, 'utf8');
    const rstNew = rst.replace(/\|\\(\_[^\s]+)\|\s+image/g, '|$1| image')
        .replace(/\|\\(\_[^\s]+)\|/g, '|$1| ')
        .replace(/\\(\_1broker|\_1btcxe)/g, '$1 ');
    fs.truncateSync(file);
    fs.writeFileSync(file, rstNew)
});


function updateExchangeCount(fileName) {
    log.bright.cyan('Updating exchange count →', fileName.yellow);

    const oldContent = fs.readFileSync(fileName, 'utf8');
    const newContent = oldContent
        .replace(/shields\.io\/badge\/exchanges\-[0-9a-z]+\-blue/g, 'shields.io/badge/exchanges-' + ccxt.exchanges.length + '-blue');

    fs.truncateSync(fileName);
    fs.writeFileSync(fileName, newContent);

}

updateExchangeCount('./README.md');

log.bright.green('Badges updated successfully.');

//-----------------------------------------------------------------------------