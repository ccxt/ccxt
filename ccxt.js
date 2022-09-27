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

const version = '1.93.101'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'aax':                     require ('./js/rest/aax.js'),
    'alpaca':                  require ('./js/rest/alpaca.js'),
    'ascendex':                require ('./js/rest/ascendex.js'),
    'bequant':                 require ('./js/rest/bequant.js'),
    'bibox':                   require ('./js/rest/bibox.js'),
    'bigone':                  require ('./js/rest/bigone.js'),
    'binance':                 require ('./js/rest/binance.js'),
    'binancecoinm':            require ('./js/rest/binancecoinm.js'),
    'binanceus':               require ('./js/rest/binanceus.js'),
    'binanceusdm':             require ('./js/rest/binanceusdm.js'),
    'bit2c':                   require ('./js/rest/bit2c.js'),
    'bitbank':                 require ('./js/rest/bitbank.js'),
    'bitbay':                  require ('./js/rest/bitbay.js'),
    'bitbns':                  require ('./js/rest/bitbns.js'),
    'bitcoincom':              require ('./js/rest/bitcoincom.js'),
    'bitfinex':                require ('./js/rest/bitfinex.js'),
    'bitfinex2':               require ('./js/rest/bitfinex2.js'),
    'bitflyer':                require ('./js/rest/bitflyer.js'),
    'bitforex':                require ('./js/rest/bitforex.js'),
    'bitget':                  require ('./js/rest/bitget.js'),
    'bithumb':                 require ('./js/rest/bithumb.js'),
    'bitmart':                 require ('./js/rest/bitmart.js'),
    'bitmex':                  require ('./js/rest/bitmex.js'),
    'bitopro':                 require ('./js/rest/bitopro.js'),
    'bitpanda':                require ('./js/rest/bitpanda.js'),
    'bitrue':                  require ('./js/rest/bitrue.js'),
    'bitso':                   require ('./js/rest/bitso.js'),
    'bitstamp':                require ('./js/rest/bitstamp.js'),
    'bitstamp1':               require ('./js/rest/bitstamp1.js'),
    'bittrex':                 require ('./js/rest/bittrex.js'),
    'bitvavo':                 require ('./js/rest/bitvavo.js'),
    'bkex':                    require ('./js/rest/bkex.js'),
    'bl3p':                    require ('./js/rest/bl3p.js'),
    'blockchaincom':           require ('./js/rest/blockchaincom.js'),
    'btcalpha':                require ('./js/rest/btcalpha.js'),
    'btcbox':                  require ('./js/rest/btcbox.js'),
    'btcex':                   require ('./js/rest/btcex.js'),
    'btcmarkets':              require ('./js/rest/btcmarkets.js'),
    'btctradeua':              require ('./js/rest/btctradeua.js'),
    'btcturk':                 require ('./js/rest/btcturk.js'),
    'buda':                    require ('./js/rest/buda.js'),
    'bw':                      require ('./js/rest/bw.js'),
    'bybit':                   require ('./js/rest/bybit.js'),
    'bytetrade':               require ('./js/rest/bytetrade.js'),
    'cex':                     require ('./js/rest/cex.js'),
    'coinbase':                require ('./js/rest/coinbase.js'),
    'coinbaseprime':           require ('./js/rest/coinbaseprime.js'),
    'coinbasepro':             require ('./js/rest/coinbasepro.js'),
    'coincheck':               require ('./js/rest/coincheck.js'),
    'coinex':                  require ('./js/rest/coinex.js'),
    'coinfalcon':              require ('./js/rest/coinfalcon.js'),
    'coinmate':                require ('./js/rest/coinmate.js'),
    'coinone':                 require ('./js/rest/coinone.js'),
    'coinspot':                require ('./js/rest/coinspot.js'),
    'crex24':                  require ('./js/rest/crex24.js'),
    'cryptocom':               require ('./js/rest/cryptocom.js'),
    'currencycom':             require ('./js/rest/currencycom.js'),
    'delta':                   require ('./js/rest/delta.js'),
    'deribit':                 require ('./js/rest/deribit.js'),
    'digifinex':               require ('./js/rest/digifinex.js'),
    'eqonex':                  require ('./js/rest/eqonex.js'),
    'exmo':                    require ('./js/rest/exmo.js'),
    'flowbtc':                 require ('./js/rest/flowbtc.js'),
    'fmfwio':                  require ('./js/rest/fmfwio.js'),
    'ftx':                     require ('./js/rest/ftx.js'),
    'ftxus':                   require ('./js/rest/ftxus.js'),
    'gate':                    require ('./js/rest/gate.js'),
    'gateio':                  require ('./js/rest/gateio.js'),
    'gemini':                  require ('./js/rest/gemini.js'),
    'hitbtc':                  require ('./js/rest/hitbtc.js'),
    'hitbtc3':                 require ('./js/rest/hitbtc3.js'),
    'hollaex':                 require ('./js/rest/hollaex.js'),
    'huobi':                   require ('./js/rest/huobi.js'),
    'huobijp':                 require ('./js/rest/huobijp.js'),
    'huobipro':                require ('./js/rest/huobipro.js'),
    'idex':                    require ('./js/rest/idex.js'),
    'independentreserve':      require ('./js/rest/independentreserve.js'),
    'indodax':                 require ('./js/rest/indodax.js'),
    'itbit':                   require ('./js/rest/itbit.js'),
    'kraken':                  require ('./js/rest/kraken.js'),
    'kucoin':                  require ('./js/rest/kucoin.js'),
    'kucoinfutures':           require ('./js/rest/kucoinfutures.js'),
    'kuna':                    require ('./js/rest/kuna.js'),
    'latoken':                 require ('./js/rest/latoken.js'),
    'lbank':                   require ('./js/rest/lbank.js'),
    'lbank2':                  require ('./js/rest/lbank2.js'),
    'liquid':                  require ('./js/rest/liquid.js'),
    'luno':                    require ('./js/rest/luno.js'),
    'lykke':                   require ('./js/rest/lykke.js'),
    'mercado':                 require ('./js/rest/mercado.js'),
    'mexc':                    require ('./js/rest/mexc.js'),
    'mexc3':                   require ('./js/rest/mexc3.js'),
    'ndax':                    require ('./js/rest/ndax.js'),
    'novadax':                 require ('./js/rest/novadax.js'),
    'oceanex':                 require ('./js/rest/oceanex.js'),
    'okcoin':                  require ('./js/rest/okcoin.js'),
    'okex':                    require ('./js/rest/okex.js'),
    'okex5':                   require ('./js/rest/okex5.js'),
    'okx':                     require ('./js/rest/okx.js'),
    'paymium':                 require ('./js/rest/paymium.js'),
    'phemex':                  require ('./js/rest/phemex.js'),
    'poloniex':                require ('./js/rest/poloniex.js'),
    'probit':                  require ('./js/rest/probit.js'),
    'qtrade':                  require ('./js/rest/qtrade.js'),
    'ripio':                   require ('./js/rest/ripio.js'),
    'stex':                    require ('./js/rest/stex.js'),
    'therock':                 require ('./js/rest/therock.js'),
    'tidebit':                 require ('./js/rest/tidebit.js'),
    'tidex':                   require ('./js/rest/tidex.js'),
    'timex':                   require ('./js/rest/timex.js'),
    'tokocrypto':              require ('./js/rest/tokocrypto.js'),
    'upbit':                   require ('./js/rest/upbit.js'),
    'wavesexchange':           require ('./js/rest/wavesexchange.js'),
    'wazirx':                  require ('./js/rest/wazirx.js'),
    'whitebit':                require ('./js/rest/whitebit.js'),
    'woo':                     require ('./js/rest/woo.js'),
    'yobit':                   require ('./js/rest/yobit.js'),
    'zaif':                    require ('./js/rest/zaif.js'),
    'zb':                      require ('./js/rest/zb.js'),
    'zipmex':                  require ('./js/rest/zipmex.js'),
    'zonda':                   require ('./js/rest/zonda.js'),
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
