"use strict";

//-----------------------------------------------------------------------------

const ccxt = require ('ccxt')
    , { deepExtend } = ccxt
    , Exchange  = require ('./js/base/Exchange')
    , { unique } = require ('ccxt/js/base/functions')
    // , errors    = require ('ccxt/js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.2.23'

// Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'aax':                     require ('./js/aax.js'),
    'ascendex':                require ('./js/ascendex.js'),
    'bequant':                 require ('./js/bequant.js'),
    'binance':                 require ('./js/binance.js'),
    'binancecoinm':            require ('./js/binancecoinm.js'),
    'binanceus':               require ('./js/binanceus.js'),
    'binanceusdm':             require ('./js/binanceusdm.js'),
    'bitcoincom':              require ('./js/bitcoincom.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'bitfinex2':               require ('./js/bitfinex2.js'),
    'bitmart':                 require ('./js/bitmart.js'),
    'bitmex':                  require ('./js/bitmex.js'),
    'bitopro':                 require ('./js/bitopro.js'),
    'bitstamp':                require ('./js/bitstamp.js'),
    'bittrex':                 require ('./js/bittrex.js'),
    'bitvavo':                 require ('./js/bitvavo.js'),
    'bybit':                   require ('./js/bybit.js'),
    'cdax':                    require ('./js/cdax.js'),
    'coinbaseprime':           require ('./js/coinbaseprime.js'),
    'coinbasepro':             require ('./js/coinbasepro.js'),
    'coinex':                  require ('./js/coinex.js'),
    'cryptocom':               require ('./js/cryptocom.js'),
    'currencycom':             require ('./js/currencycom.js'),
    'exmo':                    require ('./js/exmo.js'),
    'ftx':                     require ('./js/ftx.js'),
    'ftxus':                   require ('./js/ftxus.js'),
    'gate':                    require ('./js/gate.js'),
    'gateio':                  require ('./js/gateio.js'),
    'hitbtc':                  require ('./js/hitbtc.js'),
    'hollaex':                 require ('./js/hollaex.js'),
    'huobi':                   require ('./js/huobi.js'),
    'huobijp':                 require ('./js/huobijp.js'),
    'huobipro':                require ('./js/huobipro.js'),
    'idex':                    require ('./js/idex.js'),
    'kraken':                  require ('./js/kraken.js'),
    'kucoin':                  require ('./js/kucoin.js'),
    'mexc':                    require ('./js/mexc.js'),
    'ndax':                    require ('./js/ndax.js'),
    'okcoin':                  require ('./js/okcoin.js'),
    'okex':                    require ('./js/okex.js'),
    'okx':                     require ('./js/okx.js'),
    'phemex':                  require ('./js/phemex.js'),
    'ripio':                   require ('./js/ripio.js'),
    'upbit':                   require ('./js/upbit.js'),
    'whitebit':                require ('./js/whitebit.js'),
    'zb':                      require ('./js/zb.js'),
    'zipmex':                  require ('./js/zipmex.js'),    
}

// ----------------------------------------------------------------------------

for (const exchange in exchanges) {
    const ccxtExchange = ccxt[exchange]
    const baseExchange = Object.getPrototypeOf (ccxtExchange)
    if (baseExchange === ccxt.Exchange) {
        Object.setPrototypeOf (ccxtExchange, Exchange)
        Object.setPrototypeOf (ccxtExchange.prototype, Exchange.prototype)
    }
}

module.exports = deepExtend (ccxt, {
    version,
    Exchange,
    exchanges: unique (ccxt.exchanges.concat (Object.keys (exchanges))).sort (),
}, exchanges)
