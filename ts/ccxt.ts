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


/* eslint-disable */

import { Exchange }  from './src/base/Exchange.js'
import { Precise }   from './src/base/Precise.js'
import * as functions from './src/base/functions.js'
import * as errors   from './src/base/errors.js'
import wsExchange from './src/pro/base/Exchange.js'

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '2.0.27';

(Exchange as any).ccxtVersion = version

//-----------------------------------------------------------------------------

import aax from  './src/aax.js'
import alpaca from  './src/alpaca.js'
import ascendex from  './src/ascendex.js'
import bequant from  './src/bequant.js'
import bibox from  './src/bibox.js'
import bigone from  './src/bigone.js'
import binance from  './src/binance.js'
import binancecoinm from  './src/binancecoinm.js'
import binanceus from  './src/binanceus.js'
import binanceusdm from  './src/binanceusdm.js'
import bit2c from  './src/bit2c.js'
import bitbank from  './src/bitbank.js'
import bitbay from  './src/bitbay.js'
import bitbns from  './src/bitbns.js'
import bitcoincom from  './src/bitcoincom.js'
import bitfinex from  './src/bitfinex.js'
import bitfinex2 from  './src/bitfinex2.js'
import bitflyer from  './src/bitflyer.js'
import bitforex from  './src/bitforex.js'
import bitget from  './src/bitget.js'
import bithumb from  './src/bithumb.js'
import bitmart from  './src/bitmart.js'
import bitmex from  './src/bitmex.js'
import bitopro from  './src/bitopro.js'
import bitpanda from  './src/bitpanda.js'
import bitrue from  './src/bitrue.js'
import bitso from  './src/bitso.js'
import bitstamp from  './src/bitstamp.js'
import bitstamp1 from  './src/bitstamp1.js'
import bittrex from  './src/bittrex.js'
import bitvavo from  './src/bitvavo.js'
import bkex from  './src/bkex.js'
import bl3p from  './src/bl3p.js'
import blockchaincom from  './src/blockchaincom.js'
import btcalpha from  './src/btcalpha.js'
import btcbox from  './src/btcbox.js'
import btcex from  './src/btcex.js'
import btcmarkets from  './src/btcmarkets.js'
import btctradeua from  './src/btctradeua.js'
import btcturk from  './src/btcturk.js'
import buda from  './src/buda.js'
import bw from  './src/bw.js'
import bybit from  './src/bybit.js'
import bytetrade from  './src/bytetrade.js'
import cex from  './src/cex.js'
import coinbase from  './src/coinbase.js'
import coinbaseprime from  './src/coinbaseprime.js'
import coinbasepro from  './src/coinbasepro.js'
import coincheck from  './src/coincheck.js'
import coinex from  './src/coinex.js'
import coinfalcon from  './src/coinfalcon.js'
import coinmate from  './src/coinmate.js'
import coinone from  './src/coinone.js'
import coinspot from  './src/coinspot.js'
import crex24 from  './src/crex24.js'
import cryptocom from  './src/cryptocom.js'
import currencycom from  './src/currencycom.js'
import delta from  './src/delta.js'
import deribit from  './src/deribit.js'
import digifinex from  './src/digifinex.js'
import eqonex from  './src/eqonex.js'
import exmo from  './src/exmo.js'
import flowbtc from  './src/flowbtc.js'
import fmfwio from  './src/fmfwio.js'
import ftx from  './src/ftx.js'
import ftxus from  './src/ftxus.js'
import gate from  './src/gate.js'
import gateio from  './src/gateio.js'
import gemini from  './src/gemini.js'
import hitbtc from  './src/hitbtc.js'
import hitbtc3 from  './src/hitbtc3.js'
import hollaex from  './src/hollaex.js'
import huobi from  './src/huobi.js'
import huobijp from  './src/huobijp.js'
import huobipro from  './src/huobipro.js'
import idex from  './src/idex.js'
import independentreserve from  './src/independentreserve.js'
import indodax from  './src/indodax.js'
import itbit from  './src/itbit.js'
import kraken from  './src/kraken.js'
import kucoin from  './src/kucoin.js'
import kucoinfutures from  './src/kucoinfutures.js'
import kuna from  './src/kuna.js'
import latoken from  './src/latoken.js'
import lbank from  './src/lbank.js'
import lbank2 from  './src/lbank2.js'
import liquid from  './src/liquid.js'
import luno from  './src/luno.js'
import lykke from  './src/lykke.js'
import mercado from  './src/mercado.js'
import mexc from  './src/mexc.js'
import mexc3 from  './src/mexc3.js'
import ndax from  './src/ndax.js'
import novadax from  './src/novadax.js'
import oceanex from  './src/oceanex.js'
import okcoin from  './src/okcoin.js'
import okex from  './src/okex.js'
import okex5 from  './src/okex5.js'
import okx from  './src/okx.js'
import paymium from  './src/paymium.js'
import phemex from  './src/phemex.js'
import poloniex from  './src/poloniex.js'
import probit from  './src/probit.js'
import qtrade from  './src/qtrade.js'
import ripio from  './src/ripio.js'
import stex from  './src/stex.js'
import therock from  './src/therock.js'
import tidebit from  './src/tidebit.js'
import tidex from  './src/tidex.js'
import timex from  './src/timex.js'
import tokocrypto from  './src/tokocrypto.js'
import upbit from  './src/upbit.js'
import wavesexchange from  './src/wavesexchange.js'
import wazirx from  './src/wazirx.js'
import whitebit from  './src/whitebit.js'
import woo from  './src/woo.js'
import yobit from  './src/yobit.js'
import zaif from  './src/zaif.js'
import zb from  './src/zb.js'
import zipmex from  './src/zipmex.js'
import zonda from  './src/zonda.js'


// pro exchanges
import aaxPro from  './src/pro/aax.js'
import ascendexPro from  './src/pro/ascendex.js'
import bequantPro from  './src/pro/bequant.js'
import binancePro from  './src/pro/binance.js'
import binancecoinmPro from  './src/pro/binancecoinm.js'
import binanceusPro from  './src/pro/binanceus.js'
import binanceusdmPro from  './src/pro/binanceusdm.js'
import bitcoincomPro from  './src/pro/bitcoincom.js'
import bitfinexPro from  './src/pro/bitfinex.js'
import bitfinex2Pro from  './src/pro/bitfinex2.js'
import bitmartPro from  './src/pro/bitmart.js'
import bitmexPro from  './src/pro/bitmex.js'
import bitoproPro from  './src/pro/bitopro.js'
import bitstampPro from  './src/pro/bitstamp.js'
import bittrexPro from  './src/pro/bittrex.js'
import bitvavoPro from  './src/pro/bitvavo.js'
import bybitPro from  './src/pro/bybit.js'
import coinbaseprimePro from  './src/pro/coinbaseprime.js'
import coinbaseproPro from  './src/pro/coinbasepro.js'
import coinexPro from  './src/pro/coinex.js'
import cryptocomPro from  './src/pro/cryptocom.js'
import currencycomPro from  './src/pro/currencycom.js'
import exmoPro from  './src/pro/exmo.js'
import ftxPro from  './src/pro/ftx.js'
import ftxusPro from  './src/pro/ftxus.js'
import gatePro from  './src/pro/gate.js'
import gateioPro from  './src/pro/gateio.js'
import hitbtcPro from  './src/pro/hitbtc.js'
import hollaexPro from  './src/pro/hollaex.js'
import huobiPro from  './src/pro/huobi.js'
import huobijpPro from  './src/pro/huobijp.js'
import huobiproPro from  './src/pro/huobipro.js'
import idexPro from  './src/pro/idex.js'
import krakenPro from  './src/pro/kraken.js'
import kucoinPro from  './src/pro/kucoin.js'
import mexcPro from  './src/pro/mexc.js'
import ndaxPro from  './src/pro/ndax.js'
import okcoinPro from  './src/pro/okcoin.js'
import okexPro from  './src/pro/okex.js'
import okxPro from  './src/pro/okx.js'
import phemexPro from  './src/pro/phemex.js'
import ripioPro from  './src/pro/ripio.js'
import upbitPro from  './src/pro/upbit.js'
import whitebitPro from  './src/pro/whitebit.js'
import zbPro from  './src/pro/zb.js'
import zipmexPro from  './src/pro/zipmex.js'


const exchanges = {
    'aax':                    aax,
    'alpaca':                 alpaca,
    'ascendex':               ascendex,
    'bequant':                bequant,
    'bibox':                  bibox,
    'bigone':                 bigone,
    'binance':                binance,
    'binancecoinm':           binancecoinm,
    'binanceus':              binanceus,
    'binanceusdm':            binanceusdm,
    'bit2c':                  bit2c,
    'bitbank':                bitbank,
    'bitbay':                 bitbay,
    'bitbns':                 bitbns,
    'bitcoincom':             bitcoincom,
    'bitfinex':               bitfinex,
    'bitfinex2':              bitfinex2,
    'bitflyer':               bitflyer,
    'bitforex':               bitforex,
    'bitget':                 bitget,
    'bithumb':                bithumb,
    'bitmart':                bitmart,
    'bitmex':                 bitmex,
    'bitopro':                bitopro,
    'bitpanda':               bitpanda,
    'bitrue':                 bitrue,
    'bitso':                  bitso,
    'bitstamp':               bitstamp,
    'bitstamp1':              bitstamp1,
    'bittrex':                bittrex,
    'bitvavo':                bitvavo,
    'bkex':                   bkex,
    'bl3p':                   bl3p,
    'blockchaincom':          blockchaincom,
    'btcalpha':               btcalpha,
    'btcbox':                 btcbox,
    'btcex':                  btcex,
    'btcmarkets':             btcmarkets,
    'btctradeua':             btctradeua,
    'btcturk':                btcturk,
    'buda':                   buda,
    'bw':                     bw,
    'bybit':                  bybit,
    'bytetrade':              bytetrade,
    'cex':                    cex,
    'coinbase':               coinbase,
    'coinbaseprime':          coinbaseprime,
    'coinbasepro':            coinbasepro,
    'coincheck':              coincheck,
    'coinex':                 coinex,
    'coinfalcon':             coinfalcon,
    'coinmate':               coinmate,
    'coinone':                coinone,
    'coinspot':               coinspot,
    'crex24':                 crex24,
    'cryptocom':              cryptocom,
    'currencycom':            currencycom,
    'delta':                  delta,
    'deribit':                deribit,
    'digifinex':              digifinex,
    'eqonex':                 eqonex,
    'exmo':                   exmo,
    'flowbtc':                flowbtc,
    'fmfwio':                 fmfwio,
    'ftx':                    ftx,
    'ftxus':                  ftxus,
    'gate':                   gate,
    'gateio':                 gateio,
    'gemini':                 gemini,
    'hitbtc':                 hitbtc,
    'hitbtc3':                hitbtc3,
    'hollaex':                hollaex,
    'huobi':                  huobi,
    'huobijp':                huobijp,
    'huobipro':               huobipro,
    'idex':                   idex,
    'independentreserve':     independentreserve,
    'indodax':                indodax,
    'itbit':                  itbit,
    'kraken':                 kraken,
    'kucoin':                 kucoin,
    'kucoinfutures':          kucoinfutures,
    'kuna':                   kuna,
    'latoken':                latoken,
    'lbank':                  lbank,
    'lbank2':                 lbank2,
    'liquid':                 liquid,
    'luno':                   luno,
    'lykke':                  lykke,
    'mercado':                mercado,
    'mexc':                   mexc,
    'mexc3':                  mexc3,
    'ndax':                   ndax,
    'novadax':                novadax,
    'oceanex':                oceanex,
    'okcoin':                 okcoin,
    'okex':                   okex,
    'okex5':                  okex5,
    'okx':                    okx,
    'paymium':                paymium,
    'phemex':                 phemex,
    'poloniex':               poloniex,
    'probit':                 probit,
    'qtrade':                 qtrade,
    'ripio':                  ripio,
    'stex':                   stex,
    'therock':                therock,
    'tidebit':                tidebit,
    'tidex':                  tidex,
    'timex':                  timex,
    'tokocrypto':             tokocrypto,
    'upbit':                  upbit,
    'wavesexchange':          wavesexchange,
    'wazirx':                 wazirx,
    'whitebit':               whitebit,
    'woo':                    woo,
    'yobit':                  yobit,
    'zaif':                   zaif,
    'zb':                     zb,
    'zipmex':                 zipmex,
    'zonda':                  zonda,
}

const pro = {
    'aax':                    aaxPro,
    'ascendex':               ascendexPro,
    'bequant':                bequantPro,
    'binance':                binancePro,
    'binancecoinm':           binancecoinmPro,
    'binanceus':              binanceusPro,
    'binanceusdm':            binanceusdmPro,
    'bitcoincom':             bitcoincomPro,
    'bitfinex':               bitfinexPro,
    'bitfinex2':              bitfinex2Pro,
    'bitmart':                bitmartPro,
    'bitmex':                 bitmexPro,
    'bitopro':                bitoproPro,
    'bitstamp':               bitstampPro,
    'bittrex':                bittrexPro,
    'bitvavo':                bitvavoPro,
    'bybit':                  bybitPro,
    'coinbaseprime':          coinbaseprimePro,
    'coinbasepro':            coinbaseproPro,
    'coinex':                 coinexPro,
    'cryptocom':              cryptocomPro,
    'currencycom':            currencycomPro,
    'exmo':                   exmoPro,
    'ftx':                    ftxPro,
    'ftxus':                  ftxusPro,
    'gate':                   gatePro,
    'gateio':                 gateioPro,
    'hitbtc':                 hitbtcPro,
    'hollaex':                hollaexPro,
    'huobi':                  huobiPro,
    'huobijp':                huobijpPro,
    'huobipro':               huobiproPro,
    'idex':                   idexPro,
    'kraken':                 krakenPro,
    'kucoin':                 kucoinPro,
    'mexc':                   mexcPro,
    'ndax':                   ndaxPro,
    'okcoin':                 okcoinPro,
    'okex':                   okexPro,
    'okx':                    okxPro,
    'phemex':                 phemexPro,
    'ripio':                  ripioPro,
    'upbit':                  upbitPro,
    'whitebit':               whitebitPro,
    'zb':                     zbPro,
    'zipmex':                 zipmexPro,
}

for (const exchange in pro) {
    // const ccxtExchange = exchanges[exchange]
    // const baseExchange = Object.getPrototypeOf (ccxtExchange)
    // if (baseExchange.name === 'Exchange') {
    //     Object.setPrototypeOf (ccxtExchange, wsExchange)
    //     Object.setPrototypeOf (ccxtExchange.prototype, wsExchange.prototype)
    // }
}

(pro as any).exchanges = Object.keys (pro)

//-----------------------------------------------------------------------------

const ccxt = Object.assign ({ version, Exchange, Precise, 'exchanges': Object.keys (exchanges), 'pro': pro}, exchanges, functions, errors)

export {
    version,
    Exchange,
    exchanges,
    pro,
    Precise,
    functions,
    errors,
    aax,
    alpaca,
    ascendex,
    bequant,
    bibox,
    bigone,
    binance,
    binancecoinm,
    binanceus,
    binanceusdm,
    bit2c,
    bitbank,
    bitbay,
    bitbns,
    bitcoincom,
    bitfinex,
    bitfinex2,
    bitflyer,
    bitforex,
    bitget,
    bithumb,
    bitmart,
    bitmex,
    bitopro,
    bitpanda,
    bitrue,
    bitso,
    bitstamp,
    bitstamp1,
    bittrex,
    bitvavo,
    bkex,
    bl3p,
    blockchaincom,
    btcalpha,
    btcbox,
    btcex,
    btcmarkets,
    btctradeua,
    btcturk,
    buda,
    bw,
    bybit,
    bytetrade,
    cex,
    coinbase,
    coinbaseprime,
    coinbasepro,
    coincheck,
    coinex,
    coinfalcon,
    coinmate,
    coinone,
    coinspot,
    crex24,
    cryptocom,
    currencycom,
    delta,
    deribit,
    digifinex,
    eqonex,
    exmo,
    flowbtc,
    fmfwio,
    ftx,
    ftxus,
    gate,
    gateio,
    gemini,
    hitbtc,
    hitbtc3,
    hollaex,
    huobi,
    huobijp,
    huobipro,
    idex,
    independentreserve,
    indodax,
    itbit,
    kraken,
    kucoin,
    kucoinfutures,
    kuna,
    latoken,
    lbank,
    lbank2,
    liquid,
    luno,
    lykke,
    mercado,
    mexc,
    mexc3,
    ndax,
    novadax,
    oceanex,
    okcoin,
    okex,
    okex5,
    okx,
    paymium,
    phemex,
    poloniex,
    probit,
    qtrade,
    ripio,
    stex,
    therock,
    tidebit,
    tidex,
    timex,
    tokocrypto,
    upbit,
    wavesexchange,
    wazirx,
    whitebit,
    woo,
    yobit,
    zaif,
    zb,
    zipmex,
    zonda,    
}

export default ccxt;

//-----------------------------------------------------------------------------
