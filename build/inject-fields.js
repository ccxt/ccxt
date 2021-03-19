const fs = require ('fs');
const ccxt = require ('../ccxt.js')

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
    'trades',
    'fee'
]

const things = [ tradeKeys, marketKeys, currencyKeys, tickerKeys, orderKeys ]

// instead of counting by unique keys we could also count by number of shared keys
function runAllExchanges () {
    const classNames = fs.readdirSync ('./js')
        .filter (file => file.includes ('.js')).map (className => './js/' + className)
    for (const className of classNames) {
        searchFor (className)
    }
}

function searchFor (filename) {
    const lines = fs.readFileSync (filename).toString ().split ('\n')
    const toInject = []
    const flatten = ccxt.flatten (things)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let found = null
        for (const key of flatten) {
            found = line.match (new RegExp ('^\\s+\'' + key + '\':'))
            if (found) {
                break
            }
        }
        let injected = undefined
        if (found) {
            const { top, bottom } = extractObject (lines, i)
            i = bottom
            const sectionLines = lines.slice (top, bottom)
            const begin = sectionLines[0]
            sectionLines[0] = begin.match (/{.*/)[0]
            const end = sectionLines[sectionLines.length - 1]
            sectionLines[sectionLines.length - 1] = '}'
            const section = sectionLines.join ('\n')
                .replace (/\/\/.*$/mg, '')
                .replace (/':\s.*,/g, '\': undefined,')
            //console.log (section)
            try {
                eval (`injected = ${section}`)
            } catch (e) {
                continue
            }
            let maxCount = 0,
                maxThing = []
            const injectedKeys = Object.keys (injected)
            for (const thing of things) {
                let count = 0
                for (const key of injectedKeys) {
                    if (thing.includes (key)) {
                        count += 1
                    } else {
                        count = 0
                        break
                    }
                }
                if (count > maxCount) {
                    maxCount = count
                    maxThing = thing
                }
            }
            if (maxCount > maxThing.length / 2) {
                sectionLines[0] = begin
                sectionLines.length = sectionLines.length - 1
                const indent = sectionLines[sectionLines.length - 1].match (/^\s+/)[0].length
                for (const missingKey of maxThing.filter (k => !injectedKeys.includes (k))) {
                    sectionLines.push (' '.repeat (indent) + '\'' + missingKey + '\': ' + (missingKey === 'precision' || missingKey === 'limits' ? ('this.' + missingKey) : 'undefined') + ',')
                }
                sectionLines.push (end)
                toInject.push ({top, bottom, sectionLines})
            }
        }
    }
    // iterate through toInject backwards injeceting the stuff using splice
    for (let i = toInject.length - 1; i >= 0; i--) {
        const injector = toInject[i]
        const { top, bottom, sectionLines } = injector
        lines.splice (top, bottom - top, ...sectionLines)
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
