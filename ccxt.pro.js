"use strict";

//-----------------------------------------------------------------------------

// TODO rework this

const Exchange  = require ('ccxt/js/base/Exchange')
    , functions = require ('ccxt/js/base/functions')
    , errors    = require ('ccxt/js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.18.1351'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'binance':                 require ('./js/binance.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'poloniex':                require ('./js/poloniex.js'),
}

//-----------------------------------------------------------------------------

// TODO monkey-patch

module.exports = Object.assign ({
    version,
    Exchange,
    exchanges: Object.keys (exchanges)
}, exchanges, functions, errors)

//-----------------------------------------------------------------------------