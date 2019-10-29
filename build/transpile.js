// ---------------------------------------------------------------------------
// Usage: npm run transpile
// ---------------------------------------------------------------------------

"use strict";

const fs = require ('fs')
    , log = require ('ololog')
    , ansi = require ('ansicolor').nice
    , {
        createFolderRecursively,
    } = require ('ccxt/build/fs.js')
    , {
        transpileDerivedExchangeFiles,
        // transpileErrorHierarchy, // ?
        transpilePythonAsyncToSync,
    } = require ('ccxt/build/transpile.js')

// ============================================================================

function transpileEverything () {

    // default pattern is '.js'
    const [ /* node */, /* script */, pattern ] = process.argv
        // , python2Folder = './python/ccxtpro/', // CCXT Pro does not support Python 2
        , python3Folder = './python/ccxtpro/'
        , phpFolder     = './php/'
        , options = { /* python2Folder, */ python3Folder, phpFolder }

    // createFolderRecursively (python2Folder)
    createFolderRecursively (python3Folder)
    createFolderRecursively (phpFolder)

    const classes = transpileDerivedExchangeFiles ('./js/', options, pattern)

    if (classes === null) {
        log.bright.yellow ('0 files transpiled.')
        return;
    }

    // HINT: if we're going to support specific class definitions
    // this process won't work anymore as it will override the definitions
    // exportTypeScriptDeclarations (classes)

    // transpileErrorHierarchy ()

    // transpilePrecisionTests ()
    // transpileDateTimeTests ()
    // transpileCryptoTests ()

    // transpilePythonAsyncToSync ('./python/test/test_async.py', './python/test/test.py')

    log.bright.green ('Transpiled successfully.')
}

// ============================================================================
// main entry point

if (require.main === module) {

    // if called directly like `node module`
    transpileEverything ()

} else {

    // do nothing if required as a module
}

// ============================================================================

module.exports = {}