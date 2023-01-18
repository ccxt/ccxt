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

const version = '2.6.36'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'alpaca':                  require ('./js/alpaca.js'),
    'ascendex':                require ('./js/ascendex.js'),
    'bequant':                 require ('./js/bequant.js'),
    'bigone':                  require ('./js/bigone.js'),
    'binance':                 require ('./js/binance.js'),
    'binancecoinm':            require ('./js/binancecoinm.js'),
    'binanceus':               require ('./js/binanceus.js'),
    'binanceusdm':             require ('./js/binanceusdm.js'),
    'bit2c':                   require ('./js/bit2c.js'),
    'bitbank':                 require ('./js/bitbank.js'),
    'bitbay':                  require ('./js/bitbay.js'),
    'bitbns':                  require ('./js/bitbns.js'),
    'bitcoincom':              require ('./js/bitcoincom.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'bitfinex2':               require ('./js/bitfinex2.js'),
    'bitflyer':                require ('./js/bitflyer.js'),
    'bitforex':                require ('./js/bitforex.js'),
    'bitget':                  require ('./js/bitget.js'),
    'bithumb':                 require ('./js/bithumb.js'),
    'bitmart':                 require ('./js/bitmart.js'),
    'bitmex':                  require ('./js/bitmex.js'),
    'bitopro':                 require ('./js/bitopro.js'),
    'bitpanda':                require ('./js/bitpanda.js'),
    'bitrue':                  require ('./js/bitrue.js'),
    'bitso':                   require ('./js/bitso.js'),
    'bitstamp':                require ('./js/bitstamp.js'),
    'bitstamp1':               require ('./js/bitstamp1.js'),
    'bittrex':                 require ('./js/bittrex.js'),
    'bitvavo':                 require ('./js/bitvavo.js'),
    'bkex':                    require ('./js/bkex.js'),
    'bl3p':                    require ('./js/bl3p.js'),
    'blockchaincom':           require ('./js/blockchaincom.js'),
    'btcalpha':                require ('./js/btcalpha.js'),
    'btcbox':                  require ('./js/btcbox.js'),
    'btcex':                   require ('./js/btcex.js'),
    'btcmarkets':              require ('./js/btcmarkets.js'),
    'btctradeua':              require ('./js/btctradeua.js'),
    'btcturk':                 require ('./js/btcturk.js'),
    'buda':                    require ('./js/buda.js'),
    'bybit':                   require ('./js/bybit.js'),
    'cex':                     require ('./js/cex.js'),
    'coinbase':                require ('./js/coinbase.js'),
    'coinbaseprime':           require ('./js/coinbaseprime.js'),
    'coinbasepro':             require ('./js/coinbasepro.js'),
    'coincheck':               require ('./js/coincheck.js'),
    'coinex':                  require ('./js/coinex.js'),
    'coinfalcon':              require ('./js/coinfalcon.js'),
    'coinmate':                require ('./js/coinmate.js'),
    'coinone':                 require ('./js/coinone.js'),
    'coinspot':                require ('./js/coinspot.js'),
    'cryptocom':               require ('./js/cryptocom.js'),
    'currencycom':             require ('./js/currencycom.js'),
    'delta':                   require ('./js/delta.js'),
    'deribit':                 require ('./js/deribit.js'),
    'digifinex':               require ('./js/digifinex.js'),
    'exmo':                    require ('./js/exmo.js'),
    'flowbtc':                 require ('./js/flowbtc.js'),
    'fmfwio':                  require ('./js/fmfwio.js'),
    'gate':                    require ('./js/gate.js'),
    'gateio':                  require ('./js/gateio.js'),
    'gemini':                  require ('./js/gemini.js'),
    'hitbtc':                  require ('./js/hitbtc.js'),
    'hitbtc3':                 require ('./js/hitbtc3.js'),
    'hollaex':                 require ('./js/hollaex.js'),
    'huobi':                   require ('./js/huobi.js'),
    'huobijp':                 require ('./js/huobijp.js'),
    'huobipro':                require ('./js/huobipro.js'),
    'idex':                    require ('./js/idex.js'),
    'independentreserve':      require ('./js/independentreserve.js'),
    'indodax':                 require ('./js/indodax.js'),
    'itbit':                   require ('./js/itbit.js'),
    'kraken':                  require ('./js/kraken.js'),
    'kucoin':                  require ('./js/kucoin.js'),
    'kucoinfutures':           require ('./js/kucoinfutures.js'),
    'kuna':                    require ('./js/kuna.js'),
    'latoken':                 require ('./js/latoken.js'),
    'lbank':                   require ('./js/lbank.js'),
    'lbank2':                  require ('./js/lbank2.js'),
    'luno':                    require ('./js/luno.js'),
    'lykke':                   require ('./js/lykke.js'),
    'mercado':                 require ('./js/mercado.js'),
    'mexc':                    require ('./js/mexc.js'),
    'mexc3':                   require ('./js/mexc3.js'),
    'ndax':                    require ('./js/ndax.js'),
    'novadax':                 require ('./js/novadax.js'),
    'oceanex':                 require ('./js/oceanex.js'),
    'okcoin':                  require ('./js/okcoin.js'),
    'okex':                    require ('./js/okex.js'),
    'okex5':                   require ('./js/okex5.js'),
    'okx':                     require ('./js/okx.js'),
    'paymium':                 require ('./js/paymium.js'),
    'phemex':                  require ('./js/phemex.js'),
    'poloniex':                require ('./js/poloniex.js'),
    'poloniexfutures':         require ('./js/poloniexfutures.js'),
    'probit':                  require ('./js/probit.js'),
    'ripio':                   require ('./js/ripio.js'),
    'stex':                    require ('./js/stex.js'),
    'therock':                 require ('./js/therock.js'),
    'tidex':                   require ('./js/tidex.js'),
    'timex':                   require ('./js/timex.js'),
    'tokocrypto':              require ('./js/tokocrypto.js'),
    'upbit':                   require ('./js/upbit.js'),
    'wavesexchange':           require ('./js/wavesexchange.js'),
    'wazirx':                  require ('./js/wazirx.js'),
    'whitebit':                require ('./js/whitebit.js'),
    'woo':                     require ('./js/woo.js'),
    'yobit':                   require ('./js/yobit.js'),
    'zaif':                    require ('./js/zaif.js'),
    'zb':                      require ('./js/zb.js'),
    'zipmex':                  require ('./js/zipmex.js'),
    'zonda':                   require ('./js/zonda.js'),
}

const pro = {
    'alpaca':                  require ('./js/pro/alpaca.js'),
    'ascendex':                require ('./js/pro/ascendex.js'),
    'bequant':                 require ('./js/pro/bequant.js'),
    'binance':                 require ('./js/pro/binance.js'),
    'binancecoinm':            require ('./js/pro/binancecoinm.js'),
    'binanceus':               require ('./js/pro/binanceus.js'),
    'binanceusdm':             require ('./js/pro/binanceusdm.js'),
    'bitcoincom':              require ('./js/pro/bitcoincom.js'),
    'bitfinex':                require ('./js/pro/bitfinex.js'),
    'bitfinex2':               require ('./js/pro/bitfinex2.js'),
    'bitget':                  require ('./js/pro/bitget.js'),
    'bitmart':                 require ('./js/pro/bitmart.js'),
    'bitmex':                  require ('./js/pro/bitmex.js'),
    'bitopro':                 require ('./js/pro/bitopro.js'),
    'bitrue':                  require ('./js/pro/bitrue.js'),
    'bitstamp':                require ('./js/pro/bitstamp.js'),
    'bittrex':                 require ('./js/pro/bittrex.js'),
    'bitvavo':                 require ('./js/pro/bitvavo.js'),
    'btcex':                   require ('./js/pro/btcex.js'),
    'bybit':                   require ('./js/pro/bybit.js'),
    'cex':                     require ('./js/pro/cex.js'),
    'coinbaseprime':           require ('./js/pro/coinbaseprime.js'),
    'coinbasepro':             require ('./js/pro/coinbasepro.js'),
    'coinex':                  require ('./js/pro/coinex.js'),
    'cryptocom':               require ('./js/pro/cryptocom.js'),
    'currencycom':             require ('./js/pro/currencycom.js'),
    'deribit':                 require ('./js/pro/deribit.js'),
    'exmo':                    require ('./js/pro/exmo.js'),
    'gate':                    require ('./js/pro/gate.js'),
    'gateio':                  require ('./js/pro/gateio.js'),
    'gemini':                  require ('./js/pro/gemini.js'),
    'hitbtc':                  require ('./js/pro/hitbtc.js'),
    'hollaex':                 require ('./js/pro/hollaex.js'),
    'huobi':                   require ('./js/pro/huobi.js'),
    'huobijp':                 require ('./js/pro/huobijp.js'),
    'huobipro':                require ('./js/pro/huobipro.js'),
    'idex':                    require ('./js/pro/idex.js'),
    'kraken':                  require ('./js/pro/kraken.js'),
    'kucoin':                  require ('./js/pro/kucoin.js'),
    'kucoinfutures':           require ('./js/pro/kucoinfutures.js'),
    'luno':                    require ('./js/pro/luno.js'),
    'mexc':                    require ('./js/pro/mexc.js'),
    'ndax':                    require ('./js/pro/ndax.js'),
    'okcoin':                  require ('./js/pro/okcoin.js'),
    'okex':                    require ('./js/pro/okex.js'),
    'okx':                     require ('./js/pro/okx.js'),
    'phemex':                  require ('./js/pro/phemex.js'),
    'ripio':                   require ('./js/pro/ripio.js'),
    'upbit':                   require ('./js/pro/upbit.js'),
    'wazirx':                  require ('./js/pro/wazirx.js'),
    'whitebit':                require ('./js/pro/whitebit.js'),
    'woo':                     require ('./js/pro/woo.js'),
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

pro.version = version;
pro.exchanges = Object.keys (pro)
pro['Exchange'] = wsExchange

//-----------------------------------------------------------------------------

module.exports = Object.assign ({ version, Exchange, Precise, 'exchanges': Object.keys (exchanges), pro }, exchanges, functions, errors)

//-----------------------------------------------------------------------------
