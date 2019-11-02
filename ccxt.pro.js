"use strict";

//-----------------------------------------------------------------------------

// TODO rework this

const ccxt = require ('ccxt')
    , { deepExtend } = ccxt
    // , Exchange  = require ('ccxt/js/base/Exchange')
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

//-----------------------------------------------------------------------------

// TODO monkey-patch

module.exports = deepExtend (ccxt, {
    version,
    // Exchange,
    exchanges: ccxt.exchanges.concat (Object.keys (exchanges)),
}, exchanges)

//-----------------------------------------------------------------------------