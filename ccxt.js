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

const version = '1.91.57'

Exchange.ccxtVersion = version

//-----------------------------------------------------------------------------

import aax from  './js/aax.js'
import ascendex from  './js/ascendex.js'
import bequant from  './js/bequant.js'
import bibox from  './js/bibox.js'
import bigone from  './js/bigone.js'
import binance from  './js/binance.js'
import binancecoinm from  './js/binancecoinm.js'
import binanceus from  './js/binanceus.js'
import binanceusdm from  './js/binanceusdm.js'
import bit2c from  './js/bit2c.js'
import bitbank from  './js/bitbank.js'
import bitbay from  './js/bitbay.js'
import bitbns from  './js/bitbns.js'
import bitcoincom from  './js/bitcoincom.js'
import bitfinex from  './js/bitfinex.js'
import bitfinex2 from  './js/bitfinex2.js'
import bitflyer from  './js/bitflyer.js'
import bitforex from  './js/bitforex.js'
import bitget from  './js/bitget.js'
import bithumb from  './js/bithumb.js'
import bitmart from  './js/bitmart.js'
import bitmex from  './js/bitmex.js'
import bitopro from  './js/bitopro.js'
import bitpanda from  './js/bitpanda.js'
import bitrue from  './js/bitrue.js'
import bitso from  './js/bitso.js'
import bitstamp from  './js/bitstamp.js'
import bitstamp1 from  './js/bitstamp1.js'
import bittrex from  './js/bittrex.js'
import bitvavo from  './js/bitvavo.js'
import bkex from  './js/bkex.js'
import bl3p from  './js/bl3p.js'
import blockchaincom from  './js/blockchaincom.js'
import btcalpha from  './js/btcalpha.js'
import btcbox from  './js/btcbox.js'
import btcex from  './js/btcex.js'
import btcmarkets from  './js/btcmarkets.js'
import btctradeua from  './js/btctradeua.js'
import btcturk from  './js/btcturk.js'
import buda from  './js/buda.js'
import bw from  './js/bw.js'
import bybit from  './js/bybit.js'
import bytetrade from  './js/bytetrade.js'
import cdax from  './js/cdax.js'
import cex from  './js/cex.js'
import coinbase from  './js/coinbase.js'
import coinbaseprime from  './js/coinbaseprime.js'
import coinbasepro from  './js/coinbasepro.js'
import coincheck from  './js/coincheck.js'
import coinex from  './js/coinex.js'
import coinfalcon from  './js/coinfalcon.js'
import coinmate from  './js/coinmate.js'
import coinone from  './js/coinone.js'
import coinspot from  './js/coinspot.js'
import crex24 from  './js/crex24.js'
import cryptocom from  './js/cryptocom.js'
import currencycom from  './js/currencycom.js'
import delta from  './js/delta.js'
import deribit from  './js/deribit.js'
import digifinex from  './js/digifinex.js'
import eqonex from  './js/eqonex.js'
import exmo from  './js/exmo.js'
import flowbtc from  './js/flowbtc.js'
import fmfwio from  './js/fmfwio.js'
import ftx from  './js/ftx.js'
import ftxus from  './js/ftxus.js'
import gate from  './js/gate.js'
import gateio from  './js/gateio.js'
import gemini from  './js/gemini.js'
import hitbtc from  './js/hitbtc.js'
import hitbtc3 from  './js/hitbtc3.js'
import hollaex from  './js/hollaex.js'
import huobi from  './js/huobi.js'
import huobijp from  './js/huobijp.js'
import huobipro from  './js/huobipro.js'
import idex from  './js/idex.js'
import independentreserve from  './js/independentreserve.js'
import indodax from  './js/indodax.js'
import itbit from  './js/itbit.js'
import kraken from  './js/kraken.js'
import kucoin from  './js/kucoin.js'
import kucoinfutures from  './js/kucoinfutures.js'
import kuna from  './js/kuna.js'
import latoken from  './js/latoken.js'
import lbank from  './js/lbank.js'
import lbank2 from  './js/lbank2.js'
import liquid from  './js/liquid.js'
import luno from  './js/luno.js'
import lykke from  './js/lykke.js'
import mercado from  './js/mercado.js'
import mexc from  './js/mexc.js'
import mexc3 from  './js/mexc3.js'
import ndax from  './js/ndax.js'
import novadax from  './js/novadax.js'
import oceanex from  './js/oceanex.js'
import okcoin from  './js/okcoin.js'
import okex from  './js/okex.js'
import okex5 from  './js/okex5.js'
import okx from  './js/okx.js'
import paymium from  './js/paymium.js'
import phemex from  './js/phemex.js'
import poloniex from  './js/poloniex.js'
import probit from  './js/probit.js'
import qtrade from  './js/qtrade.js'
import ripio from  './js/ripio.js'
import stex from  './js/stex.js'
import therock from  './js/therock.js'
import tidebit from  './js/tidebit.js'
import tidex from  './js/tidex.js'
import timex from  './js/timex.js'
import upbit from  './js/upbit.js'
import vcc from  './js/vcc.js'
import wavesexchange from  './js/wavesexchange.js'
import wazirx from  './js/wazirx.js'
import whitebit from  './js/whitebit.js'
import woo from  './js/woo.js'
import xena from  './js/xena.js'
import yobit from  './js/yobit.js'
import zaif from  './js/zaif.js'
import zb from  './js/zb.js'
import zipmex from  './js/zipmex.js'
import zonda from  './js/zonda.js'

const exchanges = {
    'aax':                    aax,
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
    'cdax':                   cdax,
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
    'upbit':                  upbit,
    'vcc':                    vcc,
    'wavesexchange':          wavesexchange,
    'wazirx':                 wazirx,
    'whitebit':               whitebit,
    'woo':                    woo,
    'xena':                   xena,
    'yobit':                  yobit,
    'zaif':                   zaif,
    'zb':                     zb,
    'zipmex':                 zipmex,
    'zonda':                  zonda,    
}

//-----------------------------------------------------------------------------

const ccxt = Object.assign ({ version, Exchange, Precise, 'exchanges': Object.keys (exchanges)}, exchanges, functions, errors)

export {
    version,
    Exchange,
    exchanges,
    Precise,
    functions,
    errors,
    aax,
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
    cdax,
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
    upbit,
    vcc,
    wavesexchange,
    wazirx,
    whitebit,
    woo,
    xena,
    yobit,
    zaif,
    zb,
    zipmex,
    zonda,    
}

export default ccxt;

//-----------------------------------------------------------------------------
