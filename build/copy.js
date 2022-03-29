// ----------------------------------------------------------------------------
// Usage:
//
//      node copy from to
// ----------------------------------------------------------------------------

import ansi from 'ansicolor'
import log from 'ololog'
import { copyFile } from './fsLocal.js'

ansi.nice
const log2 = log.unlimited
// ----------------------------------------------------------------------------

if (!(process.argv[2] && process.argv[3])) {
    log2.red ('Failed to copy file from', process.argv[2], 'to', process.argv[3])
    process.exit ()
}

copyFile (process.argv[2], process.argv[3])
log2.green ('Copied', process.argv[2].yellow, '→', process.argv[3].yellow)