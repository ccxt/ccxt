// ----------------------------------------------------------------------------
// Usage:
//
//      npm run export-exchanges
// ----------------------------------------------------------------------------

"use strict";

const log = require ('ololog').unlimited
    , ansi = require ('ansicolor').nice
    , ccxt = require ('ccxt')
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

    const ids = getIncludedExchangeIds ()
    const ccxtIds = ccxt.exchanges.filter (id => !ids.includes (id))

    const replacements = [
        {
            file: './ccxt.pro.js',
            regex:  /(?:const|var)\s+exchanges\s+\=\s+\{[^\}]+\}/,
            replacement: "const exchanges = {\n" + ids.map (id => ("    '" + id + "':").padEnd (30) + " require ('./js/" + id + ".js'),").join ("\n") + "    \n}",
        },
        {
            file: './python/ccxtpro/__init__.py',
            regex: /(?:from ccxtpro\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => ('from ccxtpro.' + id + ' import ' + id).padEnd (74) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        },
        {
            file: './python/ccxtpro/__init__.py',
            regex: /(?:from ccxt\.async_support\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]\# CCXT Pro exchanges/,
            replacement: ccxtIds.map (id => ('from ccxt.async_support.' + id + ' import ' + id).padEnd (74) + '# noqa: F401').join ("\n") + "\n\n# CCXT Pro exchanges",
        },
        {
            file: './python/ccxtpro/__init__.py',
            regex: /exchanges_by_ids \= \{[^\}]+\}/,
            replacement: "exchanges_by_ids = {\n" + ids.map (id => ("    '" + id + "': " + id + ',').padEnd (74) + '# noqa: F401').join ("\n") + "\n}",
        },
        // {
        //     file: './python/ccxtpro/__init__.py',
        //     regex: /exchanges \= \[[^\]]+\]/,
        //     replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        // },
        {
            file: './php/base/Exchange.php',
            regex: /public static \$exchanges \= array\s*\([^\)]+\)/,
            replacement: "public static $exchanges = array(\n        '" + ids.join ("',\n        '") + "',\n    )",
        },
    ]

    exportExchanges (replacements)

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
