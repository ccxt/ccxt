// ---------------------------------------------------------------------------
// Usage: npm run transpile
// ---------------------------------------------------------------------------

"use strict";

const log  = require ('ololog')
    , { createFolderRecursively } = require ('./common.js')
    , {
        transpileDerivedExchangeFiles,
        transpilePythonAsyncToSync,
        exportTypeScriptDeclarations,
        transpileErrorHierarchy,
        transpilePrecisionTests,
        transpileDateTimeTests,
        transpileCryptoTests,
    } = require ('./transpiler.js')
    , python2Folder = './python/ccxt/'
    , python3Folder = './python/ccxt/async_support/'
    , phpFolder     = './php/'
    , options = { python2Folder, python3Folder, phpFolder }

    // default pattern is '.js'
    , [ /* node */, /* script */, pattern ] = process.argv

createFolderRecursively (python2Folder)
createFolderRecursively (python3Folder)
createFolderRecursively (phpFolder)

const classes = transpileDerivedExchangeFiles ('./js/', options, pattern)

if (classes === null) {
    log.bright.yellow ('0 files transpiled.')
    return;
}

// HINT: if we're going to support specific class definitions
// this process won't work anymore as it will override the definitions
exportTypeScriptDeclarations (classes)

transpileErrorHierarchy ()

transpilePrecisionTests ()
transpileDateTimeTests ()
transpileCryptoTests ()

transpilePythonAsyncToSync ('./python/test/test_async.py', './python/test/test.py')

//-----------------------------------------------------------------------------

log.bright.green ('Transpiled successfully.')