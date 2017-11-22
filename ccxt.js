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

const version = '1.10.187'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    '_1broker':                require ('./js/_1broker.js'),
    '_1btcxe':                 require ('./js/_1btcxe.js'),
    'acx':                     require ('./js/acx.js'),
    'allcoin':                 require ('./js/allcoin.js'),
    'anxpro':                  require ('./js/anxpro.js'),
    'binance':                 require ('./js/binance.js'),
    'bit2c':                   require ('./js/bit2c.js'),
    'bitbay':                  require ('./js/bitbay.js'),
    'bitcoincoid':             require ('./js/bitcoincoid.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'bitfinex2':               require ('./js/bitfinex2.js'),
    'bitflyer':                require ('./js/bitflyer.js'),
    'bithumb':                 require ('./js/bithumb.js'),
    'bitlish':                 require ('./js/bitlish.js'),
    'bitmarket':               require ('./js/bitmarket.js'),
    'bitmex':                  require ('./js/bitmex.js'),
    'bitso':                   require ('./js/bitso.js'),
    'bitstamp':                require ('./js/bitstamp.js'),
    'bitstamp1':               require ('./js/bitstamp1.js'),
    'bittrex':                 require ('./js/bittrex.js'),
    'bl3p':                    require ('./js/bl3p.js'),
    'bleutrade':               require ('./js/bleutrade.js'),
    'btcbox':                  require ('./js/btcbox.js'),
    'btcchina':                require ('./js/btcchina.js'),
    'btcexchange':             require ('./js/btcexchange.js'),
    'btcmarkets':              require ('./js/btcmarkets.js'),
    'btctradeua':              require ('./js/btctradeua.js'),
    'btcturk':                 require ('./js/btcturk.js'),
    'btcx':                    require ('./js/btcx.js'),
    'bter':                    require ('./js/bter.js'),
    'bxinth':                  require ('./js/bxinth.js'),
    'ccex':                    require ('./js/ccex.js'),
    'cex':                     require ('./js/cex.js'),
    'chbtc':                   require ('./js/chbtc.js'),
    'chilebit':                require ('./js/chilebit.js'),
    'coincheck':               require ('./js/coincheck.js'),
    'coinfloor':               require ('./js/coinfloor.js'),
    'coingi':                  require ('./js/coingi.js'),
    'coinmarketcap':           require ('./js/coinmarketcap.js'),
    'coinmate':                require ('./js/coinmate.js'),
    'coinsecure':              require ('./js/coinsecure.js'),
    'coinspot':                require ('./js/coinspot.js'),
    'cryptopia':               require ('./js/cryptopia.js'),
    'dsx':                     require ('./js/dsx.js'),
    'exmo':                    require ('./js/exmo.js'),
    'flowbtc':                 require ('./js/flowbtc.js'),
    'foxbit':                  require ('./js/foxbit.js'),
    'fybse':                   require ('./js/fybse.js'),
    'fybsg':                   require ('./js/fybsg.js'),
    'gatecoin':                require ('./js/gatecoin.js'),
    'gateio':                  require ('./js/gateio.js'),
    'gdax':                    require ('./js/gdax.js'),
    'gemini':                  require ('./js/gemini.js'),
    'hitbtc':                  require ('./js/hitbtc.js'),
    'hitbtc2':                 require ('./js/hitbtc2.js'),
    'huobi':                   require ('./js/huobi.js'),
    'huobicny':                require ('./js/huobicny.js'),
    'huobipro':                require ('./js/huobipro.js'),
    'independentreserve':      require ('./js/independentreserve.js'),
    'itbit':                   require ('./js/itbit.js'),
    'jubi':                    require ('./js/jubi.js'),
    'kraken':                  require ('./js/kraken.js'),
    'kuna':                    require ('./js/kuna.js'),
    'lakebtc':                 require ('./js/lakebtc.js'),
    'liqui':                   require ('./js/liqui.js'),
    'livecoin':                require ('./js/livecoin.js'),
    'luno':                    require ('./js/luno.js'),
    'mercado':                 require ('./js/mercado.js'),
    'mixcoins':                require ('./js/mixcoins.js'),
    'nova':                    require ('./js/nova.js'),
    'okcoincny':               require ('./js/okcoincny.js'),
    'okcoinusd':               require ('./js/okcoinusd.js'),
    'okex':                    require ('./js/okex.js'),
    'paymium':                 require ('./js/paymium.js'),
    'poloniex':                require ('./js/poloniex.js'),
    'qryptos':                 require ('./js/qryptos.js'),
    'quadrigacx':              require ('./js/quadrigacx.js'),
    'quoine':                  require ('./js/quoine.js'),
    'southxchange':            require ('./js/southxchange.js'),
    'surbitcoin':              require ('./js/surbitcoin.js'),
    'therock':                 require ('./js/therock.js'),
    'tidex':                   require ('./js/tidex.js'),
    'urdubit':                 require ('./js/urdubit.js'),
    'vaultoro':                require ('./js/vaultoro.js'),
    'vbtc':                    require ('./js/vbtc.js'),
    'virwox':                  require ('./js/virwox.js'),
    'wex':                     require ('./js/wex.js'),
    'xbtce':                   require ('./js/xbtce.js'),
    'yobit':                   require ('./js/yobit.js'),
    'yunbi':                   require ('./js/yunbi.js'),
    'zaif':                    require ('./js/zaif.js'),
    'zb':                      require ('./js/zb.js'),    
}

//-----------------------------------------------------------------------------

module.exports = Object.assign ({ version, Exchange, exchanges: Object.keys (exchanges) }, exchanges, functions, errors)

//-----------------------------------------------------------------------------
