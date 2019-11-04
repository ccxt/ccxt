"use strict";

//-----------------------------------------------------------------------------

const ccxt = require ('ccxt')
    , { deepExtend } = ccxt
    , Exchange  = require ('./js/base/Exchange')
    // , functions = require ('ccxt/js/base/functions')
    // , errors    = require ('ccxt/js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.0.0'

// Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'binance':                 require ('./js/binance.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'poloniex':                require ('./js/poloniex.js'),
}

// ----------------------------------------------------------------------------

function monkeyPatchExchange (exchange, Exchange, keys) {
    for (let j = 0; j < keys.length; j++) {
        const key = keys[j]
        exchange.prototype[key] = Exchange.prototype[key]
    }
    return exchange
}

// ----------------------------------------------------------------------------

function getChildKeysWithConstructor (parentClass, childClass) {
    const parentKeys = Reflect.ownKeys (parentClass.prototype)
    const childKeys = Reflect.ownKeys (childClass.prototype)
    return childKeys.reduce ((previous, current, i) => {
        if (!parentKeys.includes (current)) {
            previous.push (current)
        }
        return previous
    }, [])

}

// ----------------------------------------------------------------------------

function monkeyPatchAllExchanges (exchanges, Exchange, ccxt) {
    const diffKeys = getChildKeysWithConstructor (ccxt.Exchange, Exchange)
    const ids = Object.keys (exchanges)
    const result = {}
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        const exchange = exchanges[id]
        result[id] = monkeyPatchExchange (exchange, Exchange, diffKeys)
    }
    return result
}

// ----------------------------------------------------------------------------

// module.exports = patchedExchanges

module.exports = deepExtend (ccxt, {
    version,
    Exchange,
    exchanges: ccxt.exchanges.concat (Object.keys (exchanges)),
}, monkeyPatchAllExchanges (exchanges, Exchange, ccxt))
