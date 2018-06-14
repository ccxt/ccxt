"use strict";

const fs        = require ('fs')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')
const execSync  = require ('child_process').execSync
const log       = require ('ololog')
const ansi      = require ('ansicolor').nice

// ---------------------------------------------------------------------------

let exchanges
let verbose = false

// ---------------------------------------------------------------------------

let wikiPath = 'wiki'
let gitWikiPath = 'ccxt.wiki'

if (!fs.existsSync (gitWikiPath)) {

    log.bright.cyan ('Checking out ccxt.wiki...')
    execSync ('git clone https://github.com/ccxt/ccxt.wiki.git')
}

// ---------------------------------------------------------------------------

function replaceInFile (filename, regex, replacement) {
    let contents = fs.readFileSync (filename, 'utf8')
    const parts = contents.split (regex)
    const newContents = parts[0] + replacement + parts[1]
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}

// ---------------------------------------------------------------------------

try {

    exchanges = require ('./config')

} catch (e) {

    log.bright.cyan ('Exporting exchanges...'.yellow)

    const ids = fs.readdirSync ('./js/')
                  .filter (file => file.includes ('.js'))
                  .map (file => file.slice (0, -3))

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
            file: './python/ccxt/async/__init__.py',
            regex: /(?:from ccxt\.async\.[^\.]+ import [^\s]+\s+\# noqa\: F401[\r]?[\n])+[\r]?[\n]exchanges/,
            replacement: ids.map (id => pad ('from ccxt.async.' + id + ' import ' + id, 64) + '# noqa: F401').join ("\n") + "\n\nexchanges",
        },
        {
            file: './python/ccxt/async/__init__.py',
            regex: /exchanges \= \[[^\]]+\]/,
            replacement: "exchanges = [\n" + "    '" + ids.join ("',\n    '") + "'," + "\n]",
        },
        {
            file: './php/Exchange.php',
            regex: /public static \$exchanges \= array \([^\)]+\)/,
            replacement: "public static $exchanges = array (\n        '" + ids.join ("',\n        '") + "',\n    )",
        },

    ].forEach (({ file, regex, replacement }) => {

        log.bright.cyan ('Exporting exchanges →', file.yellow)
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
    exchanges[id] = new (ccxt)[id] (exchanges[id])
    exchanges[id].verbose = verbose
}

// console.log (Object.values (ccxt).length)

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

let sleep = async ms => await new Promise (resolve => setTimeout (resolve, ms))

// ---------------------------------------------------------------------------
// list all supported exchanges

let values = Object.values (exchanges).map (exchange => {
    let logo = exchange.urls['logo']
    let website = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www
    let url = exchange.urls.referral || website
    let countries = Array.isArray (exchange.countries) ? exchange.countries.map (countryName).join (', ') : countryName (exchange.countries)
    let doc = Array.isArray (exchange.urls.doc) ? exchange.urls.doc[0] : exchange.urls.doc
    let version = exchange.version ? exchange.version : '\*'
    let matches = version.match (/[^0-9]*([0-9].*)/)
    if (matches)
        version = matches[1];
    return {
        '': '![' + exchange.id + '](' + logo + ')',
        'id': exchange.id,
        'name': '[' + exchange.name + '](' + url + ')',
        'ver': version,
        'doc': '[API](' + doc + ')',
        'countries': countries,
    }
})

let numExchanges = Object.keys (exchanges).length
let table = asTable.configure ({ delimiter: ' | ' }) (values)

let lines = table.split ("\n")
lines[1] = lines[0].replace (/[^\|]/g, '-')

let headerLine = lines[1].split ('|')

headerLine[3] = ':' + headerLine[3].slice (1, headerLine[3].length - 1) + ':'
headerLine[4] = ':' + headerLine[4].slice (1, headerLine[4].length - 1) + ':'
lines[1] = headerLine.join ('|')

lines = lines.map (line => '|' + line + '|').join ("\n")

let changeInFile = (filename, prefix = '') => {
    log.bright ('Exporting exchanges to'.cyan, filename.yellow, '...')
    let oldContent = fs.readFileSync (filename, 'utf8')
    let beginning = prefix + "The ccxt library currently supports the following "
    let ending = " cryptocurrency exchange markets and trading APIs:\n\n"
    let regex = new RegExp ("[^\n]+[\n][\n]\\|[^#]+\\|([\n][\n]|[\n]$|$)", 'm')
    let totalString = beginning + numExchanges + ending
    let replacement = totalString + lines + "$1"
    let newContent = oldContent.replace(/[\r]/, '').replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContent)
}

changeInFile ('README.md')
changeInFile (wikiPath + '/Manual.md')
changeInFile (wikiPath + '/Exchange-Markets.md')//, "# Supported Exchanges\n\n")

// console.log (typeof countries)
// console.log (countries)

let exchangesByCountries = []
Object.keys (countries).forEach (code => {
    let country = countries[code]
    let result = []
    Object.keys (exchanges).forEach (id => {
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
            result.push ({
                'country / region': country,
                'logo': ' ![' + exchange.id + '](' + logo + ') ',
                'id': exchange.id,
                'name': '[' + exchange.name + '](' + url + ')',
                'ver': version,
                'doc': ' [API](' + doc + ') ',
            })
        }
    })
    exchangesByCountries = exchangesByCountries.concat (result)
});

exchangesByCountries = exchangesByCountries.sort ((a, b) => {
    let countryA = a['country / region'].toLowerCase ()
    let countryB = b['country / region'].toLowerCase ()
    let idA = a['id']
    let idB = b['id']
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
    return 0;
})

;(() => {
    let table = asTable.configure ({ delimiter: ' | ' }) (exchangesByCountries)
    let lines = table.split ("\n")
    lines[1] = lines[0].replace (/[^\|]/g, '-')
    let headerLine = lines[1].split ('|')
    headerLine[4] = ':' + headerLine[4].slice (1, headerLine[4].length - 1) + ':'
    headerLine[5] = ':' + headerLine[5].slice (1, headerLine[5].length - 1) + ':'
    lines[1] = headerLine.join ('|')
    lines = lines.map (line => '|' + line + '|').join ("\n")
    let result = "# Exchanges By Country\n\nThe ccxt library currently supports the following cryptocurrency exchange markets and trading APIs:\n\n" + lines + "\n\n"
    let filename = wikiPath + '/Exchange-Markets-By-Country.md'
    fs.truncateSync (filename)
    fs.writeFileSync (filename, result)
}) ();

log.bright ('Exporting exchange ids to'.cyan, 'exchanges.json'.yellow)
fs.writeFileSync ('exchanges.json', JSON.stringify ({ ids: Object.keys (exchanges) }, null, 4))

// ----------------------------------------------------------------------------

const ccxtWikiFileMapping = {
    'README.md': 'Home.md',
    'Install.md': 'Install.md',
    'Manual.md': 'Manual.md',
    'Exchange-Markets.md': 'Exchange-Markets.md',
    'Exchange-Markets-By-Country.md': 'Exchange-Markets-By-Country.md',
}

Object.keys (ccxtWikiFileMapping)
      .forEach (file =>
            fs.writeFileSync (gitWikiPath + '/' + ccxtWikiFileMapping[file], fs.readFileSync (wikiPath + '/' + file)))

// ----------------------------------------------------------------------------

log.bright.green ('Exchanges exported successfully.')
