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

import { Exchange }  from './js/base/Exchange.js'
import { Precise }   from './js/base/Precise.js'
import * as functions from './js/base/functions.js'
import * as errors   from './js/base/errors.js'

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.77.36'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

const exchanges = {
    'aax':                     await import ('./js/aax.js'),
    'ascendex':                await import ('./js/ascendex.js'),
    'bequant':                 await import ('./js/bequant.js'),
    'bibox':                   await import ('./js/bibox.js'),
    'bigone':                  await import ('./js/bigone.js'),
    'binance':                 await import ('./js/binance.js'),
    'binancecoinm':            await import ('./js/binancecoinm.js'),
    'binanceus':               await import ('./js/binanceus.js'),
    'binanceusdm':             await import ('./js/binanceusdm.js'),
    'bit2c':                   await import ('./js/bit2c.js'),
    'bitbank':                 await import ('./js/bitbank.js'),
    'bitbay':                  await import ('./js/bitbay.js'),
    'bitbns':                  await import ('./js/bitbns.js'),
    'bitcoincom':              await import ('./js/bitcoincom.js'),
    'bitfinex':                await import ('./js/bitfinex.js'),
    'bitfinex2':               await import ('./js/bitfinex2.js'),
    'bitflyer':                await import ('./js/bitflyer.js'),
    'bitforex':                await import ('./js/bitforex.js'),
    'bitget':                  await import ('./js/bitget.js'),
    'bithumb':                 await import ('./js/bithumb.js'),
    'bitmart':                 await import ('./js/bitmart.js'),
    'bitmex':                  await import ('./js/bitmex.js'),
    'bitopro':                 await import ('./js/bitopro.js'),
    'bitpanda':                await import ('./js/bitpanda.js'),
    'bitrue':                  await import ('./js/bitrue.js'),
    'bitso':                   await import ('./js/bitso.js'),
    'bitstamp':                await import ('./js/bitstamp.js'),
    'bitstamp1':               await import ('./js/bitstamp1.js'),
    'bittrex':                 await import ('./js/bittrex.js'),
    'bitvavo':                 await import ('./js/bitvavo.js'),
    'bkex':                    await import ('./js/bkex.js'),
    'bl3p':                    await import ('./js/bl3p.js'),
    'blockchaincom':           await import ('./js/blockchaincom.js'),
    'btcalpha':                await import ('./js/btcalpha.js'),
    'btcbox':                  await import ('./js/btcbox.js'),
    'btcmarkets':              await import ('./js/btcmarkets.js'),
    'btctradeua':              await import ('./js/btctradeua.js'),
    'btcturk':                 await import ('./js/btcturk.js'),
    'buda':                    await import ('./js/buda.js'),
    'bw':                      await import ('./js/bw.js'),
    'bybit':                   await import ('./js/bybit.js'),
    'bytetrade':               await import ('./js/bytetrade.js'),
    'cdax':                    await import ('./js/cdax.js'),
    'cex':                     await import ('./js/cex.js'),
    'coinbase':                await import ('./js/coinbase.js'),
    'coinbaseprime':           await import ('./js/coinbaseprime.js'),
    'coinbasepro':             await import ('./js/coinbasepro.js'),
    'coincheck':               await import ('./js/coincheck.js'),
    'coinex':                  await import ('./js/coinex.js'),
    'coinfalcon':              await import ('./js/coinfalcon.js'),
    'coinmate':                await import ('./js/coinmate.js'),
    'coinone':                 await import ('./js/coinone.js'),
    'coinspot':                await import ('./js/coinspot.js'),
    'crex24':                  await import ('./js/crex24.js'),
    'cryptocom':               await import ('./js/cryptocom.js'),
    'currencycom':             await import ('./js/currencycom.js'),
    'delta':                   await import ('./js/delta.js'),
    'deribit':                 await import ('./js/deribit.js'),
    'digifinex':               await import ('./js/digifinex.js'),
    'eqonex':                  await import ('./js/eqonex.js'),
    'exmo':                    await import ('./js/exmo.js'),
    'flowbtc':                 await import ('./js/flowbtc.js'),
    'fmfwio':                  await import ('./js/fmfwio.js'),
    'ftx':                     await import ('./js/ftx.js'),
    'ftxus':                   await import ('./js/ftxus.js'),
    'gateio':                  await import ('./js/gateio.js'),
    'gemini':                  await import ('./js/gemini.js'),
    'hitbtc':                  await import ('./js/hitbtc.js'),
    'hitbtc3':                 await import ('./js/hitbtc3.js'),
    'hollaex':                 await import ('./js/hollaex.js'),
    'huobi':                   await import ('./js/huobi.js'),
    'huobijp':                 await import ('./js/huobijp.js'),
    'huobipro':                await import ('./js/huobipro.js'),
    'idex':                    await import ('./js/idex.js'),
    'independentreserve':      await import ('./js/independentreserve.js'),
    'indodax':                 await import ('./js/indodax.js'),
    'itbit':                   await import ('./js/itbit.js'),
    'kraken':                  await import ('./js/kraken.js'),
    'kucoin':                  await import ('./js/kucoin.js'),
    'kucoinfutures':           await import ('./js/kucoinfutures.js'),
    'kuna':                    await import ('./js/kuna.js'),
    'latoken':                 await import ('./js/latoken.js'),
    'lbank':                   await import ('./js/lbank.js'),
    'liquid':                  await import ('./js/liquid.js'),
    'luno':                    await import ('./js/luno.js'),
    'lykke':                   await import ('./js/lykke.js'),
    'mercado':                 await import ('./js/mercado.js'),
    'mexc':                    await import ('./js/mexc.js'),
    'ndax':                    await import ('./js/ndax.js'),
    'novadax':                 await import ('./js/novadax.js'),
    'oceanex':                 await import ('./js/oceanex.js'),
    'okcoin':                  await import ('./js/okcoin.js'),
    'okex':                    await import ('./js/okex.js'),
    'okex5':                   await import ('./js/okex5.js'),
    'okx':                     await import ('./js/okx.js'),
    'paymium':                 await import ('./js/paymium.js'),
    'phemex':                  await import ('./js/phemex.js'),
    'poloniex':                await import ('./js/poloniex.js'),
    'probit':                  await import ('./js/probit.js'),
    'qtrade':                  await import ('./js/qtrade.js'),
    'ripio':                   await import ('./js/ripio.js'),
    'stex':                    await import ('./js/stex.js'),
    'therock':                 await import ('./js/therock.js'),
    'tidebit':                 await import ('./js/tidebit.js'),
    'tidex':                   await import ('./js/tidex.js'),
    'timex':                   await import ('./js/timex.js'),
    'upbit':                   await import ('./js/upbit.js'),
    'vcc':                     await import ('./js/vcc.js'),
    'wavesexchange':           await import ('./js/wavesexchange.js'),
    'wazirx':                  await import ('./js/wazirx.js'),
    'whitebit':                await import ('./js/whitebit.js'),
    'woo':                     await import ('./js/woo.js'),
    'xena':                    await import ('./js/xena.js'),
    'yobit':                   await import ('./js/yobit.js'),
    'zaif':                    await import ('./js/zaif.js'),
    'zb':                      await import ('./js/zb.js'),
    'zipmex':                  await import ('./js/zipmex.js'),
    'zonda':                   await import ('./js/zonda.js'),    
}

//-----------------------------------------------------------------------------

export default Object.assign ({ version, Exchange, Precise, 'exchanges': Object.keys (exchanges) }, exchanges, functions, errors)

//-----------------------------------------------------------------------------
