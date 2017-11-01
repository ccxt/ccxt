"use strict";

/*

MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

"use strict";

//-----------------------------------------------------------------------------

const Exchange  = require ('./js/base/Exchange')
const functions = require ('./js/base/functions')
const errors    = require ('./js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.9.306'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {

    '_1broker':            require ('./js/_1broker'),
    '_1btcxe':             require ('./js/_1btcxe'),
    'acx':                 require ('./js/acx'),
    'allcoin':             require ('./js/allcoin'),
    'anxpro':              require ('./js/anxpro'),
    'binance':             require ('./js/binance'),
    'bit2c':               require ('./js/bit2c'),
    'bitbay':              require ('./js/bitbay'),
    'bitcoincoid':         require ('./js/bitcoincoid'),
    'bitfinex':            require ('./js/bitfinex'),
    'bitfinex2':           require ('./js/bitfinex2'),
    'bitflyer':            require ('./js/bitflyer'),
    'bithumb':             require ('./js/bithumb'),
    'bitlish':             require ('./js/bitlish'),
    'bitmarket':           require ('./js/bitmarket'),
    'bitmex':              require ('./js/bitmex'),
    'bitso':               require ('./js/bitso'),
    'bitstamp1':           require ('./js/bitstamp1'),
    'bitstamp':            require ('./js/bitstamp'),
    'bittrex':             require ('./js/bittrex'),
    'bl3p':                require ('./js/bl3p'),
    'bleutrade':           require ('./js/bleutrade'),
    'btcbox':              require ('./js/btcbox'),
    'btcchina':            require ('./js/btcchina'),
    'btcmarkets':          require ('./js/btcmarkets'),
    'btctradeua':          require ('./js/btctradeua'),
    'btcturk':             require ('./js/btcturk'),
    'btcx':                require ('./js/btcx'),
    'bter':                require ('./js/bter'),
    'bxinth':              require ('./js/bxinth'),
    'ccex':                require ('./js/ccex'),
    'cex':                 require ('./js/cex'),
    'chbtc':               require ('./js/chbtc'),
    'chilebit':            require ('./js/chilebit'),
    'coincheck':           require ('./js/coincheck'),
    'coinfloor':           require ('./js/coinfloor'),
    'coingi':              require ('./js/coingi'),
    'coinmarketcap':       require ('./js/coinmarketcap'),
    'coinmate':            require ('./js/coinmate'),
    'coinsecure':          require ('./js/coinsecure'),
    'coinspot':            require ('./js/coinspot'),
    'cryptopia':           require ('./js/cryptopia'),
    'dsx':                 require ('./js/dsx'),
    'exmo':                require ('./js/exmo'),
    'flowbtc':             require ('./js/flowbtc'),
    'foxbit':              require ('./js/foxbit'),
    'fybse':               require ('./js/fybse'),
    'fybsg':               require ('./js/fybsg'),
    'gatecoin':            require ('./js/gatecoin'),
    'gateio':              require ('./js/gateio'),
    'gdax':                require ('./js/gdax'),
    'gemini':              require ('./js/gemini'),
    'hitbtc':              require ('./js/hitbtc'),
    'hitbtc2':             require ('./js/hitbtc2'),
    'huobi':               require ('./js/huobi'),
    'huobicny':            require ('./js/huobicny'),
    'huobipro':            require ('./js/huobipro'),
    'independentreserve':  require ('./js/independentreserve'),
    'itbit':               require ('./js/itbit'),
    'jubi':                require ('./js/jubi'),
    'kraken':              require ('./js/kraken'),
    'kuna':                require ('./js/kuna'),
    'lakebtc':             require ('./js/lakebtc'),
    'livecoin':            require ('./js/livecoin'),
    'liqui':               require ('./js/liqui'),
    'luno':                require ('./js/luno'),
    'mercado':             require ('./js/mercado'),
    'mixcoins':            require ('./js/mixcoins'),
    'nova':                require ('./js/nova'),
    'okcoincny':           require ('./js/okcoincny'),
    'okcoinusd':           require ('./js/okcoinusd'),
    'okex':                require ('./js/okex'),
    'paymium':             require ('./js/paymium'),
    'poloniex':            require ('./js/poloniex'),
    'quadrigacx':          require ('./js/quadrigacx'),
    'qryptos':             require ('./js/qryptos'),
    'quoine':              require ('./js/quoine'),
    'southxchange':        require ('./js/southxchange'),
    'surbitcoin':          require ('./js/surbitcoin'),
    'tidex':               require ('./js/tidex'),
    'therock':             require ('./js/therock'),
    'urdubit':             require ('./js/urdubit'),
    'vaultoro':            require ('./js/vaultoro'),
    'vbtc':                require ('./js/vbtc'),
    'virwox':              require ('./js/virwox'),
    'wex':                 require ('./js/wex'),
    'xbtce':               require ('./js/xbtce'),
    'yobit':               require ('./js/yobit'),
    'yunbi':               require ('./js/yunbi'),
    'zaif':                require ('./js/zaif'),
}

//-----------------------------------------------------------------------------

module.exports = Object.assign ({ version, Exchange, exchanges: Object.keys (exchanges) }, exchanges, functions, errors)

//-----------------------------------------------------------------------------
