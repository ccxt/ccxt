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

//-----------------------------------------------------------------------------

const Exchange  = require ('./js/base/Exchange')
    , functions = require ('./js/base/functions')
    , errors    = require ('./js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.37.42'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'acx':                     require ('./js/acx.js'),
    'aofex':                   require ('./js/aofex.js'),
    'bcex':                    require ('./js/bcex.js'),
    'bequant':                 require ('./js/bequant.js'),
    'bibox':                   require ('./js/bibox.js'),
    'bigone':                  require ('./js/bigone.js'),
    'binance':                 require ('./js/binance.js'),
    'binanceje':               require ('./js/binanceje.js'),
    'binanceus':               require ('./js/binanceus.js'),
    'bit2c':                   require ('./js/bit2c.js'),
    'bitbank':                 require ('./js/bitbank.js'),
    'bitbay':                  require ('./js/bitbay.js'),
    'bitcoincom':              require ('./js/bitcoincom.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'bitfinex2':               require ('./js/bitfinex2.js'),
    'bitflyer':                require ('./js/bitflyer.js'),
    'bitforex':                require ('./js/bitforex.js'),
    'bitget':                  require ('./js/bitget.js'),
    'bithumb':                 require ('./js/bithumb.js'),
    'bitkk':                   require ('./js/bitkk.js'),
    'bitmart':                 require ('./js/bitmart.js'),
    'bitmax':                  require ('./js/bitmax.js'),
    'bitmex':                  require ('./js/bitmex.js'),
    'bitpanda':                require ('./js/bitpanda.js'),
    'bitso':                   require ('./js/bitso.js'),
    'bitstamp':                require ('./js/bitstamp.js'),
    'bitstamp1':               require ('./js/bitstamp1.js'),
    'bittrex':                 require ('./js/bittrex.js'),
    'bitvavo':                 require ('./js/bitvavo.js'),
    'bitz':                    require ('./js/bitz.js'),
    'bl3p':                    require ('./js/bl3p.js'),
    'bleutrade':               require ('./js/bleutrade.js'),
    'braziliex':               require ('./js/braziliex.js'),
    'btcalpha':                require ('./js/btcalpha.js'),
    'btcbox':                  require ('./js/btcbox.js'),
    'btcmarkets':              require ('./js/btcmarkets.js'),
    'btctradeua':              require ('./js/btctradeua.js'),
    'btcturk':                 require ('./js/btcturk.js'),
    'buda':                    require ('./js/buda.js'),
    'bw':                      require ('./js/bw.js'),
    'bybit':                   require ('./js/bybit.js'),
    'bytetrade':               require ('./js/bytetrade.js'),
    'cex':                     require ('./js/cex.js'),
    'chilebit':                require ('./js/chilebit.js'),
    'coinbase':                require ('./js/coinbase.js'),
    'coinbaseprime':           require ('./js/coinbaseprime.js'),
    'coinbasepro':             require ('./js/coinbasepro.js'),
    'coincheck':               require ('./js/coincheck.js'),
    'coinegg':                 require ('./js/coinegg.js'),
    'coinex':                  require ('./js/coinex.js'),
    'coinfalcon':              require ('./js/coinfalcon.js'),
    'coinfloor':               require ('./js/coinfloor.js'),
    'coingi':                  require ('./js/coingi.js'),
    'coinmarketcap':           require ('./js/coinmarketcap.js'),
    'coinmate':                require ('./js/coinmate.js'),
    'coinone':                 require ('./js/coinone.js'),
    'coinspot':                require ('./js/coinspot.js'),
    'coss':                    require ('./js/coss.js'),
    'crex24':                  require ('./js/crex24.js'),
    'currencycom':             require ('./js/currencycom.js'),
    'deribit':                 require ('./js/deribit.js'),
    'digifinex':               require ('./js/digifinex.js'),
    'dsx':                     require ('./js/dsx.js'),
    'eterbase':                require ('./js/eterbase.js'),
    'exmo':                    require ('./js/exmo.js'),
    'exx':                     require ('./js/exx.js'),
    'fcoin':                   require ('./js/fcoin.js'),
    'fcoinjp':                 require ('./js/fcoinjp.js'),
    'flowbtc':                 require ('./js/flowbtc.js'),
    'foxbit':                  require ('./js/foxbit.js'),
    'ftx':                     require ('./js/ftx.js'),
    'gateio':                  require ('./js/gateio.js'),
    'gemini':                  require ('./js/gemini.js'),
    'hbtc':                    require ('./js/hbtc.js'),
    'hitbtc':                  require ('./js/hitbtc.js'),
    'hollaex':                 require ('./js/hollaex.js'),
    'huobijp':                 require ('./js/huobijp.js'),
    'huobipro':                require ('./js/huobipro.js'),
    'huobiru':                 require ('./js/huobiru.js'),
    'ice3x':                   require ('./js/ice3x.js'),
    'idex':                    require ('./js/idex.js'),
    'independentreserve':      require ('./js/independentreserve.js'),
    'indodax':                 require ('./js/indodax.js'),
    'itbit':                   require ('./js/itbit.js'),
    'kraken':                  require ('./js/kraken.js'),
    'kucoin':                  require ('./js/kucoin.js'),
    'kuna':                    require ('./js/kuna.js'),
    'lakebtc':                 require ('./js/lakebtc.js'),
    'latoken':                 require ('./js/latoken.js'),
    'lbank':                   require ('./js/lbank.js'),
    'liquid':                  require ('./js/liquid.js'),
    'livecoin':                require ('./js/livecoin.js'),
    'luno':                    require ('./js/luno.js'),
    'lykke':                   require ('./js/lykke.js'),
    'mercado':                 require ('./js/mercado.js'),
    'mixcoins':                require ('./js/mixcoins.js'),
    'novadax':                 require ('./js/novadax.js'),
    'oceanex':                 require ('./js/oceanex.js'),
    'okcoin':                  require ('./js/okcoin.js'),
    'okex':                    require ('./js/okex.js'),
    'paymium':                 require ('./js/paymium.js'),
    'phemex':                  require ('./js/phemex.js'),
    'poloniex':                require ('./js/poloniex.js'),
    'probit':                  require ('./js/probit.js'),
    'qtrade':                  require ('./js/qtrade.js'),
    'rightbtc':                require ('./js/rightbtc.js'),
    'ripio':                   require ('./js/ripio.js'),
    'southxchange':            require ('./js/southxchange.js'),
    'stex':                    require ('./js/stex.js'),
    'stronghold':              require ('./js/stronghold.js'),
    'surbitcoin':              require ('./js/surbitcoin.js'),
    'therock':                 require ('./js/therock.js'),
    'tidebit':                 require ('./js/tidebit.js'),
    'tidex':                   require ('./js/tidex.js'),
    'timex':                   require ('./js/timex.js'),
    'upbit':                   require ('./js/upbit.js'),
    'vaultoro':                require ('./js/vaultoro.js'),
    'vbtc':                    require ('./js/vbtc.js'),
    'wavesexchange':           require ('./js/wavesexchange.js'),
    'whitebit':                require ('./js/whitebit.js'),
    'xbtce':                   require ('./js/xbtce.js'),
    'xena':                    require ('./js/xena.js'),
    'yobit':                   require ('./js/yobit.js'),
    'zaif':                    require ('./js/zaif.js'),
    'zb':                      require ('./js/zb.js'),    
}

//-----------------------------------------------------------------------------

module.exports = Object.assign ({ version, Exchange, 'exchanges': Object.keys (exchanges) }, exchanges, functions, errors)

//-----------------------------------------------------------------------------
