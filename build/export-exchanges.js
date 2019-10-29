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

    const ids = exportExchanges ({
        // python2Folder: './python/ccxtpro',
        python3Folder: './python/ccxtpro',
        phpFolder: './php'
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
