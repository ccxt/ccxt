// ----------------------------------------------------------------------------
// Usage:
//
//      node copy from to
// ----------------------------------------------------------------------------

"use strict";

const ansi      = require ('ansicolor').nice
    , log       = require ('ololog').unlimited
    , { copyFile } = require ('./fs.js')

// ----------------------------------------------------------------------------

if (!(process.argv[2] && process.argv[3])) {
    log.red ('Failed to copy file from', process.argv[2], 'to', process.argv[3])
    process.exit ()
}

copyFile (process.argv[2], process.argv[3])
log.green ('Copied', process.argv[2].yellow, '→', process.argv[3].yellow)