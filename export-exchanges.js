"use strict";

const fs        = require ('fs')
const countries = require ('./countries')
const asTable   = require ('as-table')
const execSync  = require ('child_process').execSync
const log       = require ('ololog').unlimited
const ansi      = require ('ansicolor').nice
const { keys, values } = Object

// ---------------------------------------------------------------------------

let exchanges
let verbose = false

// ---------------------------------------------------------------------------

let wikiPath = 'wiki'
let gitWikiPath = 'ccxt.wiki'
let ccxtCertifiedBadge = '[![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification)'
let spacing = '&nbsp;'.repeat (7)
let logoHeading = spacing + 'logo' + spacing
let tableHeadings = [ logoHeading, 'id', 'name', 'ver', 'doc', 'certified', ]
let exchangesByCountryHeading = [ 'country / region', ... tableHeadings ]

if (!fs.existsSync (gitWikiPath)) {
    log.bright.cyan ('Checking out ccxt.wiki...')
    execSync ('git clone https://github.com/ccxt/ccxt.wiki.git')
}

// ---------------------------------------------------------------------------

function replaceInFile (filename, regex, replacement) {
    log.bright.cyan ('Exporting exchanges →', filename.yellow)
    let contents = fs.readFileSync (filename, 'utf8')
    const newContents = contents.replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}

// ---------------------------------------------------------------------------

const includedIds = fs.readFileSync ('exchanges.cfg')
    .toString () // Buffer → String
    .split ('\n') // String → Array
    .map (line => line.split ('#')[0].trim ()) // trim comments
    .filter (exchange => exchange); // filter empty lines

const isIncluded = (id) => ((includedIds.length === 0) || includedIds.includes (id))
try {

    exchanges = require ('./config').ids.filter (isIncluded)

} catch (e) {

    log.bright.cyan ('Exporting exchanges...'.yellow)

    const ids = fs.readdirSync ('./js/')
        .filter (file => file.includes ('.js'))
        .map (file => file.slice (0, -3))
        .filter (isIncluded);

    const pad = function (string, n) {
        return (string + ' '.repeat (n)).slice (0, n)
    };

    [
        {
            file: './ccxt.js',
            regex:  /(?:const|var)\s+exchanges\s+\=\s+\{[^\}]+\}/,
            replacement: "const exchanges = {\n" + ids.map (id => pad ("    '" + id + "':", 30) + " require ('./js/" + id + ".js'),").join ("\n") + "    \n}",
        },
        {
            file: './python/ccxt/__init__.py',
            regex: /exchanges \= \[[^\]]+\]/,
            replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        },
        {
            file: './python/ccxt/__init__.py',
            regex: /(?:from ccxt\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => pad ('from ccxt.' + id + ' import ' + id, 60) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        },
        {
            file: './python/ccxt/async_support/__init__.py',
            regex: /(?:from ccxt\.async_support\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => pad ('from ccxt.async_support.' + id + ' import ' + id, 74) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        },
        {
            file: './python/ccxt/async_support/__init__.py',
            regex: /exchanges \= \[[^\]]+\]/,
            replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        },
        {
            file: './php/Exchange.php',
            regex: /public static \$exchanges \= array \([^\)]+\)/,
            replacement: "public static $exchanges = array (\n        '" + ids.join ("',\n        '") + "',\n    )",
        },

    ].forEach (({ file, regex, replacement }) => {
        replaceInFile (file, regex, replacement)
    })

    exchanges = {}
    ids.forEach (id => {
        exchanges[id] = { 'verbose': verbose, 'apiKey': '', 'secret': '' }
    })

    log.bright.green ('Base sources updated successfully.')
}

// ----------------------------------------------------------------------------
// strategically placed exactly here

const ccxt = require ('./ccxt.js')

// ----------------------------------------------------------------------------

for (let id in exchanges) {
    ccxt[id].prototype.checkRequiredDependencies = () => {}
    exchanges[id] = new (ccxt)[id] (exchanges[id])
    exchanges[id].verbose = verbose
}

var countryName = function (code) {
    return ((countries[code] !== undefined) ? countries[code] : code)
}

// ---------------------------------------------------------------------------
// list all supported exchanges

let tableData = values (exchanges).map (exchange => {
    let logo = exchange.urls['logo']
    let website = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www
    let url = exchange.urls.referral || website
    let countries = Array.isArray (exchange.countries) ? exchange.countries.map (countryName).join (', ') : countryName (exchange.countries)
    let doc = Array.isArray (exchange.urls.doc) ? exchange.urls.doc[0] : exchange.urls.doc
    let version = exchange.version ? exchange.version : '\*'
    let matches = version.match (/[^0-9]*([0-9].*)/)
    if (matches)
        version = matches[1];
    return [
        '[![' + exchange.id + '](' + logo + ')](' + url + ')',
        exchange.id,
        '[' + exchange.name + '](' + url + ')',
        version,
        '[API](' + doc + ')',
        exchange.certified ? ccxtCertifiedBadge : '',
        countries,
    ]
})

tableData.splice (0, 0, tableHeadings)

function makeTable (jsonArray) {
    let table = asTable.configure ({ 'delimiter': ' | ' }) (jsonArray)
    let lines = table.split ("\n")
    lines.splice (1,0, lines[0].replace (/[^\|]/g, '-'))
    let headerLine = lines[1].split ('|')
    headerLine[3] = ':' + headerLine[3].slice (1, headerLine[3].length - 1) + ':'
    headerLine[4] = ':' + headerLine[4].slice (1, headerLine[4].length - 1) + ':'
    lines[1] = headerLine.join ('|')
    return lines.map (line => '|' + line + '|').join ("\n")
}

let exchangesTable = makeTable (tableData)
let numExchanges = keys (exchanges).length
let beginning = "The ccxt library currently supports the following "
let ending = " cryptocurrency exchange markets and trading APIs:\n\n"
let totalString = beginning + numExchanges + ending
let howMany = totalString + exchangesTable + "$1"
let allExchangesRegex = new RegExp ("[^\n]+[\n]{2}\\|[^#]+\\|([\n][\n]|[\n]$|$)", 'm')
replaceInFile ('README.md', allExchangesRegex, howMany)
replaceInFile (wikiPath + '/Manual.md', allExchangesRegex, howMany)
replaceInFile (wikiPath + '/Exchange-Markets.md', allExchangesRegex, howMany)

let certifiedFieldIndex = tableHeadings.indexOf ('certified')
let certified = tableData.filter ((x) => x[certifiedFieldIndex] !== '' )
let allCertifiedRegex = new RegExp ("^(## Certified Cryptocurrency Exchanges\n{3})(?:\\|.+\\|$\n)+", 'm')
let certifiedTable = makeTable (certified)
let certifiedTableReplacement = '$1' + certifiedTable + "\n"
replaceInFile ('README.md', allCertifiedRegex, certifiedTableReplacement)


let exchangesByCountries = []
keys (countries).forEach (code => {
    let country = countries[code]
    let result = []
    keys (exchanges).forEach (id => {
        let exchange = exchanges[id]
        let logo = exchange.urls['logo']
        let website = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www
        let url = exchange.urls.referral || website
        let doc = Array.isArray (exchange.urls.doc) ? exchange.urls.doc[0] : exchange.urls.doc
        let version = exchange.version ? exchange.version : '\*'
        let matches = version.match (/[^0-9]*([0-9].*)/)
        if (matches)
            version = matches[1];
        let shouldInclude = false
        if (Array.isArray (exchange.countries)) {
            if (exchange.countries.indexOf (code) > -1)
                shouldInclude = true
        } else {
            if (code == exchange.countries)
                shouldInclude = true
        }
        if (shouldInclude) {
            let entry = [
                country,
                '[![' + exchange.id + '](' + logo + ')](' + url + ')',
                exchange.id,
                '[' + exchange.name + '](' + url + ')',
                version,
                '[API](' + doc + ')',
                // doesn't fit in width
                // exchange.certified ? ccxtCertifiedBadge : '',
            ]
            result.push (entry)
        }
    })
    exchangesByCountries = exchangesByCountries.concat (result)
});

let countryKeyIndex = exchangesByCountryHeading.indexOf ('country / region')
exchangesByCountries = exchangesByCountries.sort ((a, b) => {
    let countryA = a[countryKeyIndex].toLowerCase ()
    let countryB = b[countryKeyIndex].toLowerCase ()
    if (countryA > countryB) {
        return 1
    } else if (countryA < countryB) {
        return -1;
    } else {
        if (a['id'] > b['id'])
            return 1;
        else if (a['id'] < b['id'])
            return -1;
        else
            return 0;
    }
})

exchangesByCountries.splice (0, 0, exchangesByCountryHeading)
let lines = makeTable (exchangesByCountries)
let result = "# Exchanges By Country\n\nThe ccxt library currently supports the following cryptocurrency exchange markets and trading APIs:\n\n" + lines + "\n\n"
let filename = wikiPath + '/Exchange-Markets-By-Country.md'
fs.truncateSync (filename)
fs.writeFileSync (filename, result)

log.bright ('Exporting exchange ids to'.cyan, 'exchanges.json'.yellow)
fs.writeFileSync ('exchanges.json', JSON.stringify ({ ids: keys (exchanges) }, null, 4))

// ----------------------------------------------------------------------------

const ccxtWikiFileMapping = {
    'README.md': 'Home.md',
    'Install.md': 'Install.md',
    'Manual.md': 'Manual.md',
    'Exchange-Markets.md': 'Exchange-Markets.md',
    'Exchange-Markets-By-Country.md': 'Exchange-Markets-By-Country.md',
}

keys (ccxtWikiFileMapping)
    .forEach (file =>
        fs.writeFileSync (gitWikiPath + '/' + ccxtWikiFileMapping[file], fs.readFileSync (wikiPath + '/' + file)))

// ----------------------------------------------------------------------------

log.bright ('Exporting exchange keywords to'.cyan, 'package.json'.yellow)

const packageJSON = require ('./package.json')
const keywords = new Set (packageJSON.keywords)

for (const ex of values (exchanges)) {
    for (const url of Array.isArray (ex.urls.www) ? ex.urls.www : [ex.urls.www]) {
        keywords.add (url.replace (/(http|https):\/\/(www\.)?/, '').replace (/\/.*/, ''))
    }
    keywords.add (ex.name)
}

packageJSON.keywords = [...keywords]
fs.writeFileSync ('./package.json', JSON.stringify (packageJSON, null, 2))

// ----------------------------------------------------------------------------

log.bright.green ('Exchanges exported successfully.')
