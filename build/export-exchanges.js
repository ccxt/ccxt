// ----------------------------------------------------------------------------
// Usage:
//
//      npm run export-exchanges
// ----------------------------------------------------------------------------

"use strict";

const log = require ('ololog').unlimited
    , ansi = require ('ansicolor').nice
    , {
        // cloneGitHubWiki,
        exportExchanges,
        createExchanges,
        // exportSupportedAndCertifiedExchanges,
        exportExchangeIdsToExchangesJson,
        // exportWikiToGitHub,
        exportKeywordsToPackageJson,
    } = require ('ccxt/build/export-exchanges')

// ----------------------------------------------------------------------------

function exportEverything () {

    // const wikiPath = 'wiki'
    //     , gitWikiPath = 'build/ccxt.wiki'

    // cloneGitHubWiki (gitWikiPath)

    // const ids = exportExchanges ({
    //     // python2Folder: './python/ccxtpro',
    //     python3Folder: './python/ccxtpro',
    //     phpFolder: './php'
    // })

    const ids = exportExchanges ({
        js:      { folder: '.', file: '/ccxt.pro.js' },
        python2: { folder: './python/ccxtpro', file: '/__init__.py' },
        // python3: { folder: './python/ccxtpro', file: '/__init__.py' },
        php:     { folder: './php', file: '/base/Exchange.php' },
    })


    // strategically placed exactly here (we can require it AFTER the export)
    const exchanges = createExchanges (ids)

    // exportSupportedAndCertifiedExchanges (exchanges, wikiPath)
    exportExchangeIdsToExchangesJson (exchanges)
    // exportWikiToGitHub (wikiPath, gitWikiPath)
    exportKeywordsToPackageJson (exchanges)

    log.bright.green ('Exported successfully.')
}

// ============================================================================
// main entry point

if (require.main === module) {

    // if called directly like `node module`

    exportEverything ()

} else {

    // do nothing if required as a module
}

// ============================================================================

module.exports = {
}
