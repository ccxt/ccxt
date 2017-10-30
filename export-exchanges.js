"use strict";

const fs        = require ('fs')
const ccxt      = require ('./ccxt.js')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')
const execSync  = require ('child_process').execSync
const log       = require ('ololog')
const ansi      = require ('ansicolor').nice

let exchanges
let verbose = false

let wikiPath = 'ccxt.wiki'

if (!fs.existsSync (wikiPath)) {

    log.bright.cyan ('Checking out ccxt.wiki...')
    execSync ('git clone https://github.com/kroitor/ccxt.wiki.git')
}

try {

    exchanges = require ('./config')

} catch (e) {

    log.bright.cyan ('Exporting exchanges → ./ccxt.js'.yellow)

    let ccxtjs = fs.readFileSync ('./ccxt.js', 'utf8')
    let exchangesMatches = /(?:const|var)\s+exchanges\s+\=\s+\{([^\}]+)\}/g.exec (ccxtjs)

    let idRegex = /\'([^\'\n\s\.]+)\'/g
    let ids = []
    let idMatch
    while (idMatch = idRegex.exec (exchangesMatches[1])) {
        ids.push (idMatch[1])
    }
    let idString = "    '" + ids.join ("',\n    '") + "',"

    log.bright.cyan ('Exporting exchanges → ./python/ccxt/exchanges.py'.yellow)

    let ccxtpyFilename = './python/ccxt/exchanges.py'
    let ccxtpy = fs.readFileSync (ccxtpyFilename, 'utf8')
    let ccxtpyParts = ccxtpy.split (/exchanges \= \[[^\]]+\]/)
    let ccxtpyNewContent = ccxtpyParts[0] + "exchanges = [\n" + idString + "\n]" + ccxtpyParts[1]
    fs.truncateSync (ccxtpyFilename)
    fs.writeFileSync (ccxtpyFilename, ccxtpyNewContent)

    log.bright.cyan ('Exporting exchanges → ./ccxt.php'.yellow)

    idString = "        '" + ids.join ("',\n        '") + "',"
    let exchangephpFilename = './php/base/Exchange.php'
    let exchangephp = fs.readFileSync (exchangephpFilename, 'utf8')
    let exchangephpParts = exchangephp.split (/public static \$exchanges \= array \([^\)]+\)/)
    let exchangephpNewContent = exchangephpParts[0] + "public static $exchanges = array (\n" + idString + "\n    )" + exchangephpParts[1]
    fs.truncateSync (exchangephpFilename)
    fs.writeFileSync (exchangephpFilename, exchangephpNewContent)

    idString = "include_once ('" + ids.map (id => 'php/' + id).join (".php');\ninclude_once ('") + ".php');\n\n"
    let ccxtphpFilename = './ccxt.php'
    let ccxtphp = fs.readFileSync (ccxtphpFilename, 'utf8')
    let ccxtphpParts = ccxtphp.split (/include_once \(\'php\/[^\/]+\'.+?;[\n]{2}/)
    let ccxtphpNewContent = ccxtphpParts[0] + idString + ccxtphpParts[1]
    fs.truncateSync (ccxtphpFilename)
    fs.writeFileSync (ccxtphpFilename, ccxtphpNewContent)

    exchanges = {}
    ids.forEach (id => {
        exchanges[id] = { 'verbose': verbose, 'apiKey': '', 'secret': '' }
    })

    log.bright.green ('Base sources updated successfully.')
}

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
    let countries = Array.isArray (exchange.countries) ? exchange.countries.map (countryName).join (', ') : countryName (exchange.countries)
    let doc = Array.isArray (exchange.urls.doc) ? exchange.urls.doc[0] : exchange.urls.doc
    let version = exchange.version ? exchange.version : '\*'
    let matches = version.match (/[^0-9]*([0-9].*)/)
    if (matches)
        version = matches[1];
    return {
        '': '![' + exchange.id + '](' + logo + ')',
        'id': exchange.id,
        'name': '[' + exchange.name + '](' + website + ')',
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
    // console.log (regex, replacement)
    // process.exit ()
    let newContent = oldContent.replace (regex, replacement)
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
                'name': '[' + exchange.name + '](' + website + ')',
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
fs.writeFileSync ('exchanges.json', JSON.stringify ({ ids: Object.keys (exchanges).filter (x => x != 'btce') }, null, 4))

log.bright.green ('Exchanges exported successfully.')
