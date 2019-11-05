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
        getIncludedExchangeIds,
        exportExchanges,
        createExchanges,
        // exportSupportedAndCertifiedExchanges,
        exportExchangeIdsToExchangesJson,
        // exportWikiToGitHub,
        exportKeywordsToPackageJson,
    } = require ('ccxt/build/export-exchanges')

// ----------------------------------------------------------------------------

function exportEverything () {

    const js      = { folder: '.', file: '/ccxt.js' }
        , python3 = { folder: './python/ccxtpro', file: '/__init__.py' }
        , php     = { folder: './php', file: '/base/Exchange.php' }

    const ids = getIncludedExchangeIds ()

    const replacements = [
        Object.assign ({}, js, {
            regex:  /(?:const|var)\s+exchanges\s+\=\s+\{[^\}]+\}/,
            replacement: "const exchanges = {\n" + ids.map (id => ("    '" + id + "':").padEnd (30) + " require ('./js/" + id + ".js'),").join ("\n") + "    \n}",
        }),
        Object.assign ({}, python3, {
            regex: /(?:from ccxtpro\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => ('from ccxtpro.' + id + ' import ' + id).padEnd (74) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        }),
        Object.assign ({}, python3, {
            regex: /exchanges \= \[[^\]]+\]/,
            replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        }),
        Object.assign ({}, php, {
            regex: /public static \$exchanges \= array\s*\([^\)]+\)/,
            replacement: "public static $exchanges = array(\n        '" + ids.join ("',\n        '") + "',\n    )",
        }),
    ]

    exportExchanges (replacements)




    // const wikiPath = 'wiki'
    //     , gitWikiPath = 'build/ccxt.wiki'

    // cloneGitHubWiki (gitWikiPath)

    // const ids = exportExchanges ({
    //     // python2Folder: './python/ccxtpro',
    //     python3Folder: './python/ccxtpro',
    //     phpFolder: './php'
    // })

    // const ids = exportExchanges ({
    //     js:      { folder: '.', file: '/ccxt.pro.js' },
    //     python2: { folder: './python/ccxtpro', file: '/__init__.py' },
    //     // python3: { folder: './python/ccxtpro', file: '/__init__.py' },
    //     php:     { folder: './php', file: '/base/Exchange.php' },
    // })


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
