"use strict";

//-----------------------------------------------------------------------------

const ccxt = require ('ccxt')
    , { deepExtend } = ccxt
    , Exchange  = require ('./js/base/Exchange')
    , { unique } = require ('ccxt/js/base/functions')
    // , errors    = require ('ccxt/js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '0.1.26'

// Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'binance':                 require ('./js/binance.js'),
    'binanceje':               require ('./js/binanceje.js'),
    'binanceus':               require ('./js/binanceus.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'bitmex':                  require ('./js/bitmex.js'),
    'bitstamp':                require ('./js/bitstamp.js'),
    'bittrex':                 require ('./js/bittrex.js'),
    'coinbaseprime':           require ('./js/coinbaseprime.js'),
    'coinbasepro':             require ('./js/coinbasepro.js'),
    'gateio':                  require ('./js/gateio.js'),
    'huobipro':                require ('./js/huobipro.js'),
    'huobiru':                 require ('./js/huobiru.js'),
    'kraken':                  require ('./js/kraken.js'),
    'kucoin':                  require ('./js/kucoin.js'),
    'okcoin':                  require ('./js/okcoin.js'),
    'okex':                    require ('./js/okex.js'),
    'poloniex':                require ('./js/poloniex.js'),
    'upbit':                   require ('./js/upbit.js'),
}

// ----------------------------------------------------------------------------

for (const exchange of Object.values (exchanges)) {
    const baseExchange = Object.getPrototypeOf (exchange)
    // clone the constructor function
    const cloned = eval ('['+Exchange.toString ()+']')[0]
    Object.setPrototypeOf (exchange, cloned)
    Object.setPrototypeOf (exchange.prototype, cloned.prototype)
    Object.setPrototypeOf (cloned, baseExchange)
    Object.setPrototypeOf (cloned.prototype, baseExchange.prototype)
}


module.exports = deepExtend (ccxt, {
    version,
    Exchange,
    exchanges: unique (ccxt.exchanges.concat (Object.keys (exchanges))).sort (),
}, exchanges)
