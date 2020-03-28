const fs = require ('fs');

// use at your own risk

const tradeKeys = [ 'info',
    'timestamp',
    'datetime',
    'symbol',
    'id',
    'order',
    'type',
    'takerOrMaker',
    'side',
    'price',
    'amount',
    'cost',
    'fee'
]

const marketKeys = [ 'id',
    'symbol',
    'base',
    'quote',
    'baseId',
    'quoteId',
    'active',
    'precision',
    'limits',
    'info'
]

const currencyKeys = [ 'id',
    'code',
    'name',
    'active',
    'fee',
    'precision',
    'limits',
    'info'
]

const tickerKeys = [
    'symbol',
    'info',
    'timestamp',
    'datetime',
    'high',
    'low',
    'bid',
    'bidVolume',
    'ask',
    'askVolume',
    'vwap',
    'open',
    'close',
    'last',
    'previousClose',
    'change',
    'percentage',
    'average',
    'baseVolume',
    'quoteVolume'
]

const orderKeys = [
    'info',
    'id',
    'clientOrderId',
    'timestamp',
    'datetime',
    'lastTradeTimestamp',
    'symbol',
    'type',
    'side',
    'price',
    'amount',
    'cost',
    'average',
    'filled',
    'remaining',
    'status',
    'trades'
]

const things = [ tradeKeys, marketKeys, currencyKeys, tickerKeys, orderKeys ]

// we generate the unique keys from the above objects
const uniqueKeys = {}
for (let i = 0; i < things.length; i++) {
    const thing = things[i];
    let everythingElse = new Set ();
    for (let j = 0; j < things.length; j++) {
        if (j === i) {
            continue
        }
        everythingElse = new Set ([...everythingElse, ...things[j]]) // set union
    }
    const difference = new Set (thing.filter (x => !everythingElse.has (x)))
    for (const item of difference) {
        uniqueKeys[item] = thing
    }
}

// these keys can be found in some places that are not where we want to inject
delete uniqueKeys['base']
delete uniqueKeys['quote']
delete uniqueKeys['name']
delete uniqueKeys['percentage']
delete uniqueKeys['open']
delete uniqueKeys['code']
delete uniqueKeys['status']
delete uniqueKeys['order']
delete uniqueKeys['filled']
delete uniqueKeys['clientOrderId']
delete uniqueKeys['remaining']
delete uniqueKeys['trades']
delete uniqueKeys['bid']
delete uniqueKeys['ask']
const unique = Object.keys (uniqueKeys)
console.log (unique)

function runAllExchanges () {
    const classNames = fs.readdirSync ('./js')
        .filter (file => file.includes ('.js')).map (className => './js/' + className)
    for (const className of classNames) {
        searchFor (className)
    }
}

function searchFor (filename) {
    const lines = fs.readFileSync (filename).toString ().split ('\n')
    for (const key of unique) {
        const regex = new RegExp ('^\\s+\'' + key + '\':')
        const toInject = []
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const found = line.match (regex)
            let injected = undefined
            if (found) {
                const { top, bottom } = extractObject (lines, i)
                const sectionLines = lines.slice (top, bottom)
                const begin = sectionLines[0]
                sectionLines[0] = begin.match (/{.*/)[0]
                const end = sectionLines[sectionLines.length - 1]
                sectionLines[sectionLines.length - 1] = '}'
                const section = sectionLines.join ('\n').replace (/\/\/.*$/mg, '').replace (/':\s.*,/g, '\': undefined,')
                eval (`injected = ${section}`)
                const toAdd = []
                for (const allFields of uniqueKeys[key]) {
                    if (!(allFields in injected)) {
                        toAdd.push (allFields)
                    }
                }
                sectionLines[0] = begin
                sectionLines.length = sectionLines.length - 1
                const indent = sectionLines[sectionLines.length - 1].match (/^\s+/)[0].length
                for (const missingKey of toAdd) {
                    sectionLines.push (' '.repeat (indent) + '\'' + missingKey + '\': ' + (missingKey === 'precision' || missingKey === 'limits' ? '{}' : 'undefined') + ',')
                }
                sectionLines.push (end)
                toInject.push ({top, bottom, sectionLines})
            }
        }
        // iterate through toInject backwards injeceting the stuff using splice
        for (let i = toInject.length - 1; i >= 0; i--) {
            const injector = toInject[i]
            const { top, bottom, sectionLines } = injector
            lines.splice (top, bottom - top, ...sectionLines)
        }
    }
    const output = lines.join ('\n')
    fs.writeFileSync (filename, output)
}

function extractObject (lines, i) {
    let depth = 1
    let top = i
    while (depth > 0) {
        top -= 1
        const line = lines[top]
        depth += (line.match (/}/g) || []).length
        depth -= (line.match (/{/g) || []).length
    }
    depth = 1
    let bottom = i
    while (depth > 0) {
        bottom += 1
        const line = lines[bottom]
        depth += (line.match (/{/g) || []).length
        depth -= (line.match (/}/g) || []).length

    }
    bottom += 1

    return { top, bottom }
}

runAllExchanges ()
