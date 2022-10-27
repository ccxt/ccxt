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
    , wsExchange = require ('./js/pro/base/Exchange')
    , Precise   = require ('./js/base/Precise')
    , functions = require ('./js/base/functions')
    , errors    = require ('./js/base/errors')

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '2.0.72'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'aax':                     require ('./js/pro/aax.js'),
    'alpaca':                  require ('./pro/rest/alpaca.js'),
    'ascendex':                require ('./js/pro/ascendex.js'),
    'bequant':                 require ('./js/pro/bequant.js'),
    'bibox':                   require ('./pro/rest/bibox.js'),
    'bigone':                  require ('./pro/rest/bigone.js'),
    'binance':                 require ('./js/pro/binance.js'),
    'binancecoinm':            require ('./js/pro/binancecoinm.js'),
    'binanceus':               require ('./js/pro/binanceus.js'),
    'binanceusdm':             require ('./js/pro/binanceusdm.js'),
    'bit2c':                   require ('./pro/rest/bit2c.js'),
    'bitbank':                 require ('./pro/rest/bitbank.js'),
    'bitbay':                  require ('./pro/rest/bitbay.js'),
    'bitbns':                  require ('./pro/rest/bitbns.js'),
    'bitcoincom':              require ('./js/pro/bitcoincom.js'),
    'bitfinex':                require ('./js/pro/bitfinex.js'),
    'bitfinex2':               require ('./js/pro/bitfinex2.js'),
    'bitflyer':                require ('./pro/rest/bitflyer.js'),
    'bitforex':                require ('./pro/rest/bitforex.js'),
    'bitget':                  require ('./pro/rest/bitget.js'),
    'bithumb':                 require ('./pro/rest/bithumb.js'),
    'bitmart':                 require ('./js/pro/bitmart.js'),
    'bitmex':                  require ('./js/pro/bitmex.js'),
    'bitopro':                 require ('./js/pro/bitopro.js'),
    'bitpanda':                require ('./pro/rest/bitpanda.js'),
    'bitrue':                  require ('./pro/rest/bitrue.js'),
    'bitso':                   require ('./pro/rest/bitso.js'),
    'bitstamp':                require ('./js/pro/bitstamp.js'),
    'bitstamp1':               require ('./pro/rest/bitstamp1.js'),
    'bittrex':                 require ('./js/pro/bittrex.js'),
    'bitvavo':                 require ('./js/pro/bitvavo.js'),
    'bkex':                    require ('./pro/rest/bkex.js'),
    'bl3p':                    require ('./pro/rest/bl3p.js'),
    'blockchaincom':           require ('./pro/rest/blockchaincom.js'),
    'btcalpha':                require ('./pro/rest/btcalpha.js'),
    'btcbox':                  require ('./pro/rest/btcbox.js'),
    'btcex':                   require ('./pro/rest/btcex.js'),
    'btcmarkets':              require ('./pro/rest/btcmarkets.js'),
    'btctradeua':              require ('./pro/rest/btctradeua.js'),
    'btcturk':                 require ('./pro/rest/btcturk.js'),
    'buda':                    require ('./pro/rest/buda.js'),
    'bw':                      require ('./pro/rest/bw.js'),
    'bybit':                   require ('./js/pro/bybit.js'),
    'bytetrade':               require ('./pro/rest/bytetrade.js'),
    'cex':                     require ('./pro/rest/cex.js'),
    'coinbase':                require ('./pro/rest/coinbase.js'),
    'coinbaseprime':           require ('./js/pro/coinbaseprime.js'),
    'coinbasepro':             require ('./js/pro/coinbasepro.js'),
    'coincheck':               require ('./pro/rest/coincheck.js'),
    'coinex':                  require ('./js/pro/coinex.js'),
    'coinfalcon':              require ('./pro/rest/coinfalcon.js'),
    'coinmate':                require ('./pro/rest/coinmate.js'),
    'coinone':                 require ('./pro/rest/coinone.js'),
    'coinspot':                require ('./pro/rest/coinspot.js'),
    'crex24':                  require ('./pro/rest/crex24.js'),
    'cryptocom':               require ('./js/pro/cryptocom.js'),
    'currencycom':             require ('./js/pro/currencycom.js'),
    'delta':                   require ('./pro/rest/delta.js'),
    'deribit':                 require ('./js/pro/deribit.js'),
    'digifinex':               require ('./pro/rest/digifinex.js'),
    'exmo':                    require ('./js/pro/exmo.js'),
    'flowbtc':                 require ('./pro/rest/flowbtc.js'),
    'fmfwio':                  require ('./pro/rest/fmfwio.js'),
    'ftx':                     require ('./js/pro/ftx.js'),
    'ftxus':                   require ('./js/pro/ftxus.js'),
    'gate':                    require ('./js/pro/gate.js'),
    'gateio':                  require ('./js/pro/gateio.js'),
    'gemini':                  require ('./pro/rest/gemini.js'),
    'hitbtc':                  require ('./js/pro/hitbtc.js'),
    'hitbtc3':                 require ('./pro/rest/hitbtc3.js'),
    'hollaex':                 require ('./js/pro/hollaex.js'),
    'huobi':                   require ('./js/pro/huobi.js'),
    'huobijp':                 require ('./js/pro/huobijp.js'),
    'huobipro':                require ('./js/pro/huobipro.js'),
    'idex':                    require ('./js/pro/idex.js'),
    'independentreserve':      require ('./pro/rest/independentreserve.js'),
    'indodax':                 require ('./pro/rest/indodax.js'),
    'itbit':                   require ('./pro/rest/itbit.js'),
    'kraken':                  require ('./js/pro/kraken.js'),
    'kucoin':                  require ('./js/pro/kucoin.js'),
    'kucoinfutures':           require ('./pro/rest/kucoinfutures.js'),
    'kuna':                    require ('./pro/rest/kuna.js'),
    'latoken':                 require ('./pro/rest/latoken.js'),
    'lbank':                   require ('./pro/rest/lbank.js'),
    'lbank2':                  require ('./pro/rest/lbank2.js'),
    'liquid':                  require ('./pro/rest/liquid.js'),
    'luno':                    require ('./pro/rest/luno.js'),
    'lykke':                   require ('./pro/rest/lykke.js'),
    'mercado':                 require ('./pro/rest/mercado.js'),
    'mexc':                    require ('./js/pro/mexc.js'),
    'mexc3':                   require ('./pro/rest/mexc3.js'),
    'ndax':                    require ('./js/pro/ndax.js'),
    'novadax':                 require ('./pro/rest/novadax.js'),
    'oceanex':                 require ('./pro/rest/oceanex.js'),
    'okcoin':                  require ('./js/pro/okcoin.js'),
    'okex':                    require ('./js/pro/okex.js'),
    'okex5':                   require ('./pro/rest/okex5.js'),
    'okx':                     require ('./js/pro/okx.js'),
    'paymium':                 require ('./pro/rest/paymium.js'),
    'phemex':                  require ('./js/pro/phemex.js'),
    'poloniex':                require ('./pro/rest/poloniex.js'),
    'probit':                  require ('./pro/rest/probit.js'),
    'qtrade':                  require ('./pro/rest/qtrade.js'),
    'ripio':                   require ('./js/pro/ripio.js'),
    'stex':                    require ('./pro/rest/stex.js'),
    'therock':                 require ('./pro/rest/therock.js'),
    'tidebit':                 require ('./pro/rest/tidebit.js'),
    'tidex':                   require ('./pro/rest/tidex.js'),
    'timex':                   require ('./pro/rest/timex.js'),
    'tokocrypto':              require ('./pro/rest/tokocrypto.js'),
    'upbit':                   require ('./js/pro/upbit.js'),
    'wavesexchange':           require ('./pro/rest/wavesexchange.js'),
    'wazirx':                  require ('./pro/rest/wazirx.js'),
    'whitebit':                require ('./js/pro/whitebit.js'),
    'woo':                     require ('./pro/rest/woo.js'),
    'yobit':                   require ('./pro/rest/yobit.js'),
    'zaif':                    require ('./pro/rest/zaif.js'),
    'zb':                      require ('./js/pro/zb.js'),
    'zipmex':                  require ('./js/pro/zipmex.js'),
    'zonda':                   require ('./pro/rest/zonda.js'),    
}

const pro = {
    'aax':                     require ('./js/pro/aax.js'),
    'ascendex':                require ('./js/pro/ascendex.js'),
    'bequant':                 require ('./js/pro/bequant.js'),
    'binance':                 require ('./js/pro/binance.js'),
    'binancecoinm':            require ('./js/pro/binancecoinm.js'),
    'binanceus':               require ('./js/pro/binanceus.js'),
    'binanceusdm':             require ('./js/pro/binanceusdm.js'),
    'bitcoincom':              require ('./js/pro/bitcoincom.js'),
    'bitfinex':                require ('./js/pro/bitfinex.js'),
    'bitfinex2':               require ('./js/pro/bitfinex2.js'),
    'bitmart':                 require ('./js/pro/bitmart.js'),
    'bitmex':                  require ('./js/pro/bitmex.js'),
    'bitopro':                 require ('./js/pro/bitopro.js'),
    'bitstamp':                require ('./js/pro/bitstamp.js'),
    'bittrex':                 require ('./js/pro/bittrex.js'),
    'bitvavo':                 require ('./js/pro/bitvavo.js'),
    'bybit':                   require ('./js/pro/bybit.js'),
    'coinbaseprime':           require ('./js/pro/coinbaseprime.js'),
    'coinbasepro':             require ('./js/pro/coinbasepro.js'),
    'coinex':                  require ('./js/pro/coinex.js'),
    'cryptocom':               require ('./js/pro/cryptocom.js'),
    'currencycom':             require ('./js/pro/currencycom.js'),
    'deribit':                 require ('./js/pro/deribit.js'),
    'exmo':                    require ('./js/pro/exmo.js'),
    'ftx':                     require ('./js/pro/ftx.js'),
    'ftxus':                   require ('./js/pro/ftxus.js'),
    'gate':                    require ('./js/pro/gate.js'),
    'gateio':                  require ('./js/pro/gateio.js'),
    'hitbtc':                  require ('./js/pro/hitbtc.js'),
    'hollaex':                 require ('./js/pro/hollaex.js'),
    'huobi':                   require ('./js/pro/huobi.js'),
    'huobijp':                 require ('./js/pro/huobijp.js'),
    'huobipro':                require ('./js/pro/huobipro.js'),
    'idex':                    require ('./js/pro/idex.js'),
    'kraken':                  require ('./js/pro/kraken.js'),
    'kucoin':                  require ('./js/pro/kucoin.js'),
    'mexc':                    require ('./js/pro/mexc.js'),
    'ndax':                    require ('./js/pro/ndax.js'),
    'okcoin':                  require ('./js/pro/okcoin.js'),
    'okex':                    require ('./js/pro/okex.js'),
    'okx':                     require ('./js/pro/okx.js'),
    'phemex':                  require ('./js/pro/phemex.js'),
    'ripio':                   require ('./js/pro/ripio.js'),
    'upbit':                   require ('./js/pro/upbit.js'),
    'whitebit':                require ('./js/pro/whitebit.js'),
    'zb':                      require ('./js/pro/zb.js'),
    'zipmex':                  require ('./js/pro/zipmex.js'),
}

for (const exchange in pro) {
    const ccxtExchange = exchanges[exchange]
    const baseExchange = Object.getPrototypeOf (ccxtExchange)
    if (baseExchange.name === 'Exchange') {
        Object.setPrototypeOf (ccxtExchange, wsExchange)
        Object.setPrototypeOf (ccxtExchange.prototype, wsExchange.prototype)
    }
}

pro.exchanges = Object.keys (pro)

//-----------------------------------------------------------------------------

module.exports = Object.assign ({ version, Exchange, Precise, 'exchanges': Object.keys (exchanges), pro }, exchanges, functions, errors)

//-----------------------------------------------------------------------------
