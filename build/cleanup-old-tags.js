// ----------------------------------------------------------------------------
// Usage:
//
//      node build cleanup-old-tags
// ----------------------------------------------------------------------------

"use strict";

const log = require ('ololog').unlimited
    , ansi = require ('ansicolor').nice
    , ccxt = require ('ccxt')
    , {
        cleanupOldTags,
    } = require ('ccxt/build/cleanup-old-tags')

// ============================================================================
// main entry point

if (require.main === module) {

    // if called directly like `node module`

    cleanupOldTags ()

} else {

    // do nothing if required as a module
}

// ============================================================================

module.exports = {
}