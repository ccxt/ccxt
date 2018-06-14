"use strict";

const fs        = require ('fs');
const countries = require ('./countries');
const log       = require ('ololog');
const ansi      = require ('ansicolor').nice;

//-----------------------------------------------------------------------------

let packageJSON = fs.readFileSync ('./package.json', 'utf8');
let config = JSON.parse(packageJSON);
let version = config.version;

//-----------------------------------------------------------------------------

log.bright ('Old version: ', version);
let [ major, minor, patch ] = version.split ('.');

version = [ major, minor, patch ].join ('.');
log.bright ('New version: ', version);

function vss (filename, regex, replacement) {
    log.bright.cyan ('Single-sourcing version', version, './package.json → ' + filename.yellow);
    let oldContent = fs.readFileSync(filename, 'utf8');
    let parts = oldContent.split(regex);
    let newContent = parts[0] + replacement + version + "'" + parts[1];
    fs.truncateSync (filename);
    fs.writeFileSync (filename, newContent)
}

vss('./ccxt.js', /const version \= \'[^\']+\'/, "const version = '");

//-----------------------------------------------------------------------------

log.bright.green ('Version single-sourced successfully.');
