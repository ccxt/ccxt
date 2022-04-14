// ----------------------------------------------------------------------------
// Usage:
//
//      npm run export-exchanges
// ----------------------------------------------------------------------------

import fs from 'fs'
import log       from 'ololog'
import ansi      from 'ansicolor'
import { pathToFileURL } from 'url'

import {
    getIncludedExchangeIds,
    exportExchanges,
    createExchanges,
    exportSupportedAndCertifiedExchanges,
    exportExchangeIdsToExchangesJson,
    exportKeywordsToPackageJson,
    createMarkdownListOfExchanges,
    createMarkdownExchange,
    getFirstWebsiteUrl,
    getReferralUrlOrWebsiteUrl,
    getVersionBadge,
    createMarkdownListOfCertifiedExchanges,
    getFirstDocUrl,
    getVersion,
    getVersionLink,
    createMarkdownListOfExchangesByCountries,
    cloneGitHubWiki,
    exportWikiToGitHub

} from './export-helper.js'

const unlimitedLog = log.unlimited;

ansi.nice

// ----------------------------------------------------------------------------

function flatten (nested, result = []) {
    for (const key in nested) {
        result.push (key)
        if (Object.keys (nested[key]).length)
            flatten (nested[key], result)
    }
    return result
}

// ----------------------------------------------------------------------------

async function exportEverything () {
    const ids = getIncludedExchangeIds ()
    let errorHierarchy = await import ('../js/base/errorHierarchy.js')
    errorHierarchy = errorHierarchy['errorHierarchy']
    const flat = flatten (errorHierarchy)
    flat.push ('error_hierarchy')

    const staticExports = ['version', 'Exchange', 'exchanges', 'Precise', 'functions', 'errors'] // missing  'exportExchanges' 

    const fullExports  = staticExports.concat(ids)

    const replacements = [
        {   
            // we have an arbitrary number of imports
            // example: import x from x \n import y from y ...
            // and we want to make sure we remove all except one that can be replaced
            // by the new stringified list, avoiding adding the new list per existent import
            file: './ccxt.js',
            regex:  /(import)\s+(\w+)\s+from\s+'.\/js\/(\2).js'\n(?=import\s\w+\s+from\s+)/g,
            replacement: ''
        },
        {
            file: './ccxt.js',
            regex:  /(import)\s+(\w+)\s+from\s+'.\/js\/(\2).js'/g,
            replacement: ids.map (id => "import " + id + ' from ' + " './js/" + id + ".js'").join("\n")
        },
        {
            file: './ccxt.js',
            regex:  /(?:const|var)\s+exchanges\s+\=\s+\{[^\}]+\}/,
            replacement: "const exchanges = {\n" + ids.map (id => ("    '" + id + "':").padEnd (30) + id + ',').join ("\n") + "    \n}",
        },
        {
            file: './ccxt.js',
            regex:  /export\s+{\n[^\}]+\}/,
            replacement: "export {\n" + fullExports.map (id => "    " +id + ',').join ("\n") + "    \n}",
        },
        {
            file: './python/ccxt/__init__.py',
            regex: /exchanges \= \[[^\]]+\]/,
            replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        },
        {
            file: './python/ccxt/__init__.py',
            regex: /(?:from ccxt\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => ('from ccxt.' + id + ' import ' + id).padEnd (60) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        },
        {
            file: './python/ccxt/__init__.py',
            regex: /(?:from ccxt\.base\.errors import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]/,
            replacement: flat.map (error => ('from ccxt.base.errors' + ' import ' + error).padEnd (60) + '# noqa: F401').join ("\n") + "\n\n",
        },
        {
            file: './python/ccxt/async_support/__init__.py',
            regex: /(?:from ccxt\.base\.errors import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]/,
            replacement: flat.map (error => ('from ccxt.base.errors' + ' import ' + error).padEnd (60) + '# noqa: F401').join ("\n") + "\n\n",
        },
        {
            file: './python/ccxt/async_support/__init__.py',
            regex: /(?:from ccxt\.async_support\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => ('from ccxt.async_support.' + id + ' import ' + id).padEnd (74) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        },
        {
            file: './python/ccxt/async_support/__init__.py',
            regex: /exchanges \= \[[^\]]+\]/,
            replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        },
        {
            file: './php/Exchange.php',
            regex: /public static \$exchanges \= array\s*\([^\)]+\)/,
            replacement: "public static $exchanges = array(\n        '" + ids.join ("',\n        '") + "',\n    )",
        },
    ]

    exportExchanges (replacements, unlimitedLog)

    // strategically placed exactly here (we can require it AFTER the export)
    const module = await import('../ccxt.js')
    const ccxt = module.default
    const exchanges = await createExchanges (ids, ccxt)

    const wikiPath = 'wiki'
        , gitWikiPath = 'build/ccxt.wiki'

    cloneGitHubWiki (gitWikiPath, unlimitedLog)

    exportSupportedAndCertifiedExchanges (exchanges, {
        allExchangesPaths: [
            'README.md',
            wikiPath + '/Manual.md',
            wikiPath + '/Exchange-Markets.md'
        ],
        certifiedExchangesPaths: [
            'README.md',
        ],
        exchangesByCountriesPaths: [
            wikiPath + '/Exchange-Markets-By-Country.md'
        ],
        proExchangesPaths: [
            wikiPath + '/ccxt.pro.manual.md',
        ],
    }, unlimitedLog)

    exportExchangeIdsToExchangesJson (exchanges, unlimitedLog)
    exportWikiToGitHub (wikiPath, gitWikiPath, unlimitedLog)
    exportKeywordsToPackageJson (exchanges, unlimitedLog)

    unlimitedLog.bright.green ('Exported successfully.')
}

// ============================================================================
// main entry point
let metaUrl = import.meta.url
metaUrl = metaUrl.substring(0, metaUrl.lastIndexOf(".")) // remove extension
const url = pathToFileURL(process.argv[1]);
const href = (url.href.indexOf('.') !== -1) ? url.href.substring(0, url.href.lastIndexOf(".")) : url.href;
if (metaUrl === href) {

    // if called directly like `node module`
    try {
        await exportEverything ()
    } catch (e) {
        console.log(e);
    }

    console.log('finished')

} else {

    // do nothing if required as a module
}

// ============================================================================

export {
    exportEverything
}
