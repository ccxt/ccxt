"use strict";

const fs        = require ('fs')
const ccxt      = require ('./ccxt')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')
const execSync  = require ('child_process').execSync

let markets
let verbose = false

let wikiPath = 'ccxt.wiki'

if (!fs.existsSync (wikiPath)) {

    console.log ('Checking out ccxt.wiki...')
    execSync ('git clone https://github.com/kroitor/ccxt.wiki.git')
}

try {

    markets = require ('./config')

} catch (e) {

    let ccxtjs = fs.readFileSync ('./ccxt.js', 'utf8')
    let marketsMatches = /var markets \= \{([^\}]+)\}/g.exec (ccxtjs)
    let idRegex = /\'([^\'\n\s]+)\'/g
    let ids = []
    let idMatch 
    while (idMatch = idRegex.exec (marketsMatches[1])) {
        ids.push (idMatch[1])
    }
    let idString = "    '" + ids.join ("',\n    '") + "',"

    let ccxtpyFilename = './ccxt/__init__.py'
    let ccxtpy = fs.readFileSync (ccxtpyFilename, 'utf8')
    let ccxtpyParts = ccxtpy.split (/markets \= \[[^\]]+\]/)
    let ccxtpyNewContent = ccxtpyParts[0] + "markets = [\n" + idString + "\n]" + ccxtpyParts[1]
    fs.truncateSync (ccxtpyFilename)
    fs.writeFileSync (ccxtpyFilename, ccxtpyNewContent)

    idString = "        '" + ids.join ("',\n        '") + "',"
    let ccxtphpFilename = './ccxt.php'
    let ccxtphp = fs.readFileSync (ccxtphpFilename, 'utf8')
    let ccxtphpParts = ccxtphp.split (/public static \$markets \= array \([^\)]+\)/)
    let ccxtphpNewContent = ccxtphpParts[0] + "public static $markets = array (\n" + idString + "\n    )" + ccxtphpParts[1]
    fs.truncateSync (ccxtphpFilename)
    fs.writeFileSync (ccxtphpFilename, ccxtphpNewContent)

    markets = {}
    ids.forEach (id => {
        markets[id] = { 'verbose': verbose, 'apiKey': '', 'secret': '' }
    })
}

for (let id in markets) {
    markets[id] = new (ccxt)[id] (markets[id])
    markets[id].verbose = verbose
}

// console.log (Object.values (ccxt).length)

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

let sleep = async ms => await new Promise (resolve => setTimeout (resolve, ms))

//-------------------------------------------------------------------------
// list all supported exchanges

let values = Object.values (markets).map (market => {
    let logo = market.urls['logo']
    let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www
    let countries = Array.isArray (market.countries) ? market.countries.map (countryName).join (', ') : countryName (market.countries)
    let doc = Array.isArray (market.urls.doc) ? market.urls.doc[0] : market.urls.doc
    let version = market.version ? market.version : '\*'
    let matches = version.match (/[^0-9]*([0-9].*)/)
    if (matches)
        version = matches[1];
    return {
        '': '![' + market.id + '](' + logo + ')',
        'id': market.id,
        'name': '[' + market.name + '](' + website + ')',
        'ver': version,
        'doc': '[API](' + doc + ')',
        'countries': countries, 
    }        
})

let numMarkets = Object.keys (markets).length
let exchanges = asTable.configure ({ delimiter: ' | ' }) (values)

let lines = exchanges.split ("\n")
lines[1] = lines[0].replace (/[^\|]/g, '-')
let headerLine = lines[1].split ('|')
headerLine[3] = ':' + headerLine[3].slice (1, headerLine[3].length - 1) + ':'
headerLine[4] = ':' + headerLine[4].slice (1, headerLine[4].length - 1) + ':'
lines[1] = headerLine.join ('|')

lines = lines.map (line => '|' + line + '|').join ("\n")

let changeInFile = (filename) => {
    console.log (filename)
    let oldContent = fs.readFileSync (filename, 'utf8')
    let beginning = "The ccxt library currently supports the following "
    let ending = " cryptocurrency exchange markets and trading APIs:\n\n"
    let regex = new RegExp ("[^\n]+[\n][\n]\\|[^#]+\\|([\n][\n]|[\n]$|$)", 'm')    
    let totalString = beginning + numMarkets + ending
    let replacement = totalString + lines + "$1"
    let newContent = oldContent.replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContent)
}

changeInFile ('README.md')
changeInFile (wikiPath + '/Exchange-Markets.md')
changeInFile (wikiPath + '/Manual.md')

// console.log (typeof countries)
// console.log (countries)

let marketsByCountries = []
Object.keys (countries).forEach (code => { 
    let country = countries[code]
    let result = []
    Object.keys (markets).forEach (id => {
        let market = markets[id]
        let logo = market.urls['logo']
        let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www
        let doc = Array.isArray (market.urls.doc) ? market.urls.doc[0] : market.urls.doc
        let version = market.version ? market.version : '\*'
        let matches = version.match (/[^0-9]*([0-9].*)/)
        if (matches)
            version = matches[1];
        let shouldInclude = false
        if (Array.isArray (market.countries)) {
            if (market.countries.indexOf (code) > -1)
                shouldInclude = true
        } else {
            if (code == market.countries)
                shouldInclude = true
        }
        if (shouldInclude) {
            result.push ({
                'country / region': country, 
                'logo': ' ![' + market.id + '](' + logo + ') ',
                'id': market.id,
                'name': '[' + market.name + '](' + website + ')',
                'ver': version,
                'doc': ' [API](' + doc + ') ',
            })
        }
    })
    marketsByCountries = marketsByCountries.concat (result)
});

marketsByCountries = marketsByCountries.sort ((a, b) => {
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
    let exchanges = asTable.configure ({ delimiter: ' | ' }) (marketsByCountries)
    let lines = exchanges.split ("\n")
    lines[1] = lines[0].replace (/[^\|]/g, '-')
    let headerLine = lines[1].split ('|')
    headerLine[4] = ':' + headerLine[4].slice (1, headerLine[4].length - 1) + ':'
    headerLine[5] = ':' + headerLine[5].slice (1, headerLine[5].length - 1) + ':'
    lines[1] = headerLine.join ('|')
    lines = lines.map (line => '|' + line + '|').join ("\n")
    let result = "The ccxt library currently supports the following cryptocurrency exchange markets and trading APIs:\n\n" + lines + "\n\n"
    let filename = wikiPath + '/Exchange-Markets-By-Country.md'
    fs.truncateSync (filename)
    fs.writeFileSync (filename, result)
    // console.log (result)
}) ();

// console.log (marketsByCountries)
// console.log (asTable.configure ({ delimiter: ' | ' }) (marketsByCountries))

console.log ('Markets exported successfully.')
