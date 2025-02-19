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
import type { Int, int, Str, Strings, Num, Bool, IndexType, OrderSide, OrderType, MarketType, SubType, Dict, NullableDict, List, NullableList, Fee, OHLCV, OHLCVC, implicitReturnType, Market, Currency, Dictionary, MinMax, FeeInterface, TradingFeeInterface, MarketInterface, Trade, Order, OrderBook, Ticker, Transaction, Tickers, CurrencyInterface, Balance, BalanceAccount, Account, PartialBalances, Balances, DepositAddress, WithdrawalResponse, DepositAddressResponse, FundingRate, FundingRates, Position, BorrowInterest, LeverageTier, LedgerEntry, DepositWithdrawFeeNetwork, DepositWithdrawFee, TransferEntry, CrossBorrowRate, IsolatedBorrowRate, FundingRateHistory, OpenInterest, Liquidation, OrderRequest, CancellationRequest, FundingHistory, MarketMarginModes, MarginMode, Greeks, Conversion, Option, LastPrice, Leverage, MarginModification, Leverages, LastPrices, Currencies, TradingFees, MarginModes, OptionChain, IsolatedBorrowRates, CrossBorrowRates, LeverageTiers, LongShortRatio, OrderBooks, OpenInterests } from './src/base/types.js'
import {BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, ManualInteractionNeeded, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, InvalidProxySettings, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, ChecksumError, RequestTimeout, BadResponse, NullResponse, CancelPending, UnsubscribeError}  from './src/base/errors.js'


//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '4.4.61';

(Exchange as any).ccxtVersion = version

//-----------------------------------------------------------------------------

import ace from  './src/ace.js'
import alpaca from  './src/alpaca.js'
import ascendex from  './src/ascendex.js'
import bequant from  './src/bequant.js'
import bigone from  './src/bigone.js'
import binance from  './src/binance.js'
import binancecoinm from  './src/binancecoinm.js'
import binanceus from  './src/binanceus.js'
import binanceusdm from  './src/binanceusdm.js'
import bingx from  './src/bingx.js'
import bit2c from  './src/bit2c.js'
import bitbank from  './src/bitbank.js'
import bitbns from  './src/bitbns.js'
import bitcoincom from  './src/bitcoincom.js'
import bitfinex from  './src/bitfinex.js'
import bitfinex1 from  './src/bitfinex1.js'
import bitflyer from  './src/bitflyer.js'
import bitget from  './src/bitget.js'
import bithumb from  './src/bithumb.js'
import bitmart from  './src/bitmart.js'
import bitmex from  './src/bitmex.js'
import bitopro from  './src/bitopro.js'
import bitpanda from  './src/bitpanda.js'
import bitrue from  './src/bitrue.js'
import bitso from  './src/bitso.js'
import bitstamp from  './src/bitstamp.js'
import bitteam from  './src/bitteam.js'
import bitvavo from  './src/bitvavo.js'
import bl3p from  './src/bl3p.js'
import blockchaincom from  './src/blockchaincom.js'
import blofin from  './src/blofin.js'
import btcalpha from  './src/btcalpha.js'
import btcbox from  './src/btcbox.js'
import btcmarkets from  './src/btcmarkets.js'
import btcturk from  './src/btcturk.js'
import bybit from  './src/bybit.js'
import cex from  './src/cex.js'
import coinbase from  './src/coinbase.js'
import coinbaseadvanced from  './src/coinbaseadvanced.js'
import coinbaseexchange from  './src/coinbaseexchange.js'
import coinbaseinternational from  './src/coinbaseinternational.js'
import coincatch from  './src/coincatch.js'
import coincheck from  './src/coincheck.js'
import coinex from  './src/coinex.js'
import coinlist from  './src/coinlist.js'
import coinmate from  './src/coinmate.js'
import coinmetro from  './src/coinmetro.js'
import coinone from  './src/coinone.js'
import coinsph from  './src/coinsph.js'
import coinspot from  './src/coinspot.js'
import cryptocom from  './src/cryptocom.js'
import currencycom from  './src/currencycom.js'
import defx from  './src/defx.js'
import delta from  './src/delta.js'
import deribit from  './src/deribit.js'
import digifinex from  './src/digifinex.js'
import ellipx from  './src/ellipx.js'
import exmo from  './src/exmo.js'
import fmfwio from  './src/fmfwio.js'
import gate from  './src/gate.js'
import gateio from  './src/gateio.js'
import gemini from  './src/gemini.js'
import hashkey from  './src/hashkey.js'
import hitbtc from  './src/hitbtc.js'
import hollaex from  './src/hollaex.js'
import htx from  './src/htx.js'
import huobi from  './src/huobi.js'
import huobijp from  './src/huobijp.js'
import hyperliquid from  './src/hyperliquid.js'
import idex from  './src/idex.js'
import independentreserve from  './src/independentreserve.js'
import indodax from  './src/indodax.js'
import kraken from  './src/kraken.js'
import krakenfutures from  './src/krakenfutures.js'
import kucoin from  './src/kucoin.js'
import kucoinfutures from  './src/kucoinfutures.js'
import kuna from  './src/kuna.js'
import latoken from  './src/latoken.js'
import lbank from  './src/lbank.js'
import luno from  './src/luno.js'
import mercado from  './src/mercado.js'
import mexc from  './src/mexc.js'
import myokx from  './src/myokx.js'
import ndax from  './src/ndax.js'
import novadax from  './src/novadax.js'
import oceanex from  './src/oceanex.js'
import okcoin from  './src/okcoin.js'
import okx from  './src/okx.js'
import onetrading from  './src/onetrading.js'
import oxfun from  './src/oxfun.js'
import p2b from  './src/p2b.js'
import paradex from  './src/paradex.js'
import paymium from  './src/paymium.js'
import phemex from  './src/phemex.js'
import poloniex from  './src/poloniex.js'
import poloniexfutures from  './src/poloniexfutures.js'
import probit from  './src/probit.js'
import timex from  './src/timex.js'
import tokocrypto from  './src/tokocrypto.js'
import tradeogre from  './src/tradeogre.js'
import upbit from  './src/upbit.js'
import vertex from  './src/vertex.js'
import wavesexchange from  './src/wavesexchange.js'
import whitebit from  './src/whitebit.js'
import woo from  './src/woo.js'
import woofipro from  './src/woofipro.js'
import xt from  './src/xt.js'
import yobit from  './src/yobit.js'
import zaif from  './src/zaif.js'
import zonda from  './src/zonda.js'


// pro exchanges
import alpacaPro from  './src/pro/alpaca.js'
import ascendexPro from  './src/pro/ascendex.js'
import bequantPro from  './src/pro/bequant.js'
import binancePro from  './src/pro/binance.js'
import binancecoinmPro from  './src/pro/binancecoinm.js'
import binanceusPro from  './src/pro/binanceus.js'
import binanceusdmPro from  './src/pro/binanceusdm.js'
import bingxPro from  './src/pro/bingx.js'
import bitcoincomPro from  './src/pro/bitcoincom.js'
import bitfinexPro from  './src/pro/bitfinex.js'
import bitfinex1Pro from  './src/pro/bitfinex1.js'
import bitgetPro from  './src/pro/bitget.js'
import bithumbPro from  './src/pro/bithumb.js'
import bitmartPro from  './src/pro/bitmart.js'
import bitmexPro from  './src/pro/bitmex.js'
import bitoproPro from  './src/pro/bitopro.js'
import bitpandaPro from  './src/pro/bitpanda.js'
import bitruePro from  './src/pro/bitrue.js'
import bitstampPro from  './src/pro/bitstamp.js'
import bitvavoPro from  './src/pro/bitvavo.js'
import blockchaincomPro from  './src/pro/blockchaincom.js'
import blofinPro from  './src/pro/blofin.js'
import bybitPro from  './src/pro/bybit.js'
import cexPro from  './src/pro/cex.js'
import coinbasePro from  './src/pro/coinbase.js'
import coinbaseadvancedPro from  './src/pro/coinbaseadvanced.js'
import coinbaseexchangePro from  './src/pro/coinbaseexchange.js'
import coinbaseinternationalPro from  './src/pro/coinbaseinternational.js'
import coincatchPro from  './src/pro/coincatch.js'
import coincheckPro from  './src/pro/coincheck.js'
import coinexPro from  './src/pro/coinex.js'
import coinonePro from  './src/pro/coinone.js'
import cryptocomPro from  './src/pro/cryptocom.js'
import currencycomPro from  './src/pro/currencycom.js'
import defxPro from  './src/pro/defx.js'
import deribitPro from  './src/pro/deribit.js'
import exmoPro from  './src/pro/exmo.js'
import gatePro from  './src/pro/gate.js'
import gateioPro from  './src/pro/gateio.js'
import geminiPro from  './src/pro/gemini.js'
import hashkeyPro from  './src/pro/hashkey.js'
import hitbtcPro from  './src/pro/hitbtc.js'
import hollaexPro from  './src/pro/hollaex.js'
import htxPro from  './src/pro/htx.js'
import huobiPro from  './src/pro/huobi.js'
import huobijpPro from  './src/pro/huobijp.js'
import hyperliquidPro from  './src/pro/hyperliquid.js'
import idexPro from  './src/pro/idex.js'
import independentreservePro from  './src/pro/independentreserve.js'
import krakenPro from  './src/pro/kraken.js'
import krakenfuturesPro from  './src/pro/krakenfutures.js'
import kucoinPro from  './src/pro/kucoin.js'
import kucoinfuturesPro from  './src/pro/kucoinfutures.js'
import lbankPro from  './src/pro/lbank.js'
import lunoPro from  './src/pro/luno.js'
import mexcPro from  './src/pro/mexc.js'
import myokxPro from  './src/pro/myokx.js'
import ndaxPro from  './src/pro/ndax.js'
import okcoinPro from  './src/pro/okcoin.js'
import okxPro from  './src/pro/okx.js'
import onetradingPro from  './src/pro/onetrading.js'
import oxfunPro from  './src/pro/oxfun.js'
import p2bPro from  './src/pro/p2b.js'
import paradexPro from  './src/pro/paradex.js'
import phemexPro from  './src/pro/phemex.js'
import poloniexPro from  './src/pro/poloniex.js'
import poloniexfuturesPro from  './src/pro/poloniexfutures.js'
import probitPro from  './src/pro/probit.js'
import upbitPro from  './src/pro/upbit.js'
import vertexPro from  './src/pro/vertex.js'
import whitebitPro from  './src/pro/whitebit.js'
import wooPro from  './src/pro/woo.js'
import woofiproPro from  './src/pro/woofipro.js'
import xtPro from  './src/pro/xt.js'

const exchanges = {
    'ace':                    ace,
    'alpaca':                 alpaca,
    'ascendex':               ascendex,
    'bequant':                bequant,
    'bigone':                 bigone,
    'binance':                binance,
    'binancecoinm':           binancecoinm,
    'binanceus':              binanceus,
    'binanceusdm':            binanceusdm,
    'bingx':                  bingx,
    'bit2c':                  bit2c,
    'bitbank':                bitbank,
    'bitbns':                 bitbns,
    'bitcoincom':             bitcoincom,
    'bitfinex':               bitfinex,
    'bitfinex1':              bitfinex1,
    'bitflyer':               bitflyer,
    'bitget':                 bitget,
    'bithumb':                bithumb,
    'bitmart':                bitmart,
    'bitmex':                 bitmex,
    'bitopro':                bitopro,
    'bitpanda':               bitpanda,
    'bitrue':                 bitrue,
    'bitso':                  bitso,
    'bitstamp':               bitstamp,
    'bitteam':                bitteam,
    'bitvavo':                bitvavo,
    'bl3p':                   bl3p,
    'blockchaincom':          blockchaincom,
    'blofin':                 blofin,
    'btcalpha':               btcalpha,
    'btcbox':                 btcbox,
    'btcmarkets':             btcmarkets,
    'btcturk':                btcturk,
    'bybit':                  bybit,
    'cex':                    cex,
    'coinbase':               coinbase,
    'coinbaseadvanced':       coinbaseadvanced,
    'coinbaseexchange':       coinbaseexchange,
    'coinbaseinternational':  coinbaseinternational,
    'coincatch':              coincatch,
    'coincheck':              coincheck,
    'coinex':                 coinex,
    'coinlist':               coinlist,
    'coinmate':               coinmate,
    'coinmetro':              coinmetro,
    'coinone':                coinone,
    'coinsph':                coinsph,
    'coinspot':               coinspot,
    'cryptocom':              cryptocom,
    'currencycom':            currencycom,
    'defx':                   defx,
    'delta':                  delta,
    'deribit':                deribit,
    'digifinex':              digifinex,
    'ellipx':                 ellipx,
    'exmo':                   exmo,
    'fmfwio':                 fmfwio,
    'gate':                   gate,
    'gateio':                 gateio,
    'gemini':                 gemini,
    'hashkey':                hashkey,
    'hitbtc':                 hitbtc,
    'hollaex':                hollaex,
    'htx':                    htx,
    'huobi':                  huobi,
    'huobijp':                huobijp,
    'hyperliquid':            hyperliquid,
    'idex':                   idex,
    'independentreserve':     independentreserve,
    'indodax':                indodax,
    'kraken':                 kraken,
    'krakenfutures':          krakenfutures,
    'kucoin':                 kucoin,
    'kucoinfutures':          kucoinfutures,
    'kuna':                   kuna,
    'latoken':                latoken,
    'lbank':                  lbank,
    'luno':                   luno,
    'mercado':                mercado,
    'mexc':                   mexc,
    'myokx':                  myokx,
    'ndax':                   ndax,
    'novadax':                novadax,
    'oceanex':                oceanex,
    'okcoin':                 okcoin,
    'okx':                    okx,
    'onetrading':             onetrading,
    'oxfun':                  oxfun,
    'p2b':                    p2b,
    'paradex':                paradex,
    'paymium':                paymium,
    'phemex':                 phemex,
    'poloniex':               poloniex,
    'poloniexfutures':        poloniexfutures,
    'probit':                 probit,
    'timex':                  timex,
    'tokocrypto':             tokocrypto,
    'tradeogre':              tradeogre,
    'upbit':                  upbit,
    'vertex':                 vertex,
    'wavesexchange':          wavesexchange,
    'whitebit':               whitebit,
    'woo':                    woo,
    'woofipro':               woofipro,
    'xt':                     xt,
    'yobit':                  yobit,
    'zaif':                   zaif,
    'zonda':                  zonda,
}

const pro = {
    'alpaca':                 alpacaPro,
    'ascendex':               ascendexPro,
    'bequant':                bequantPro,
    'binance':                binancePro,
    'binancecoinm':           binancecoinmPro,
    'binanceus':              binanceusPro,
    'binanceusdm':            binanceusdmPro,
    'bingx':                  bingxPro,
    'bitcoincom':             bitcoincomPro,
    'bitfinex':               bitfinexPro,
    'bitfinex1':              bitfinex1Pro,
    'bitget':                 bitgetPro,
    'bithumb':                bithumbPro,
    'bitmart':                bitmartPro,
    'bitmex':                 bitmexPro,
    'bitopro':                bitoproPro,
    'bitpanda':               bitpandaPro,
    'bitrue':                 bitruePro,
    'bitstamp':               bitstampPro,
    'bitvavo':                bitvavoPro,
    'blockchaincom':          blockchaincomPro,
    'blofin':                 blofinPro,
    'bybit':                  bybitPro,
    'cex':                    cexPro,
    'coinbase':               coinbasePro,
    'coinbaseadvanced':       coinbaseadvancedPro,
    'coinbaseexchange':       coinbaseexchangePro,
    'coinbaseinternational':  coinbaseinternationalPro,
    'coincatch':              coincatchPro,
    'coincheck':              coincheckPro,
    'coinex':                 coinexPro,
    'coinone':                coinonePro,
    'cryptocom':              cryptocomPro,
    'currencycom':            currencycomPro,
    'defx':                   defxPro,
    'deribit':                deribitPro,
    'exmo':                   exmoPro,
    'gate':                   gatePro,
    'gateio':                 gateioPro,
    'gemini':                 geminiPro,
    'hashkey':                hashkeyPro,
    'hitbtc':                 hitbtcPro,
    'hollaex':                hollaexPro,
    'htx':                    htxPro,
    'huobi':                  huobiPro,
    'huobijp':                huobijpPro,
    'hyperliquid':            hyperliquidPro,
    'idex':                   idexPro,
    'independentreserve':     independentreservePro,
    'kraken':                 krakenPro,
    'krakenfutures':          krakenfuturesPro,
    'kucoin':                 kucoinPro,
    'kucoinfutures':          kucoinfuturesPro,
    'lbank':                  lbankPro,
    'luno':                   lunoPro,
    'mexc':                   mexcPro,
    'myokx':                  myokxPro,
    'ndax':                   ndaxPro,
    'okcoin':                 okcoinPro,
    'okx':                    okxPro,
    'onetrading':             onetradingPro,
    'oxfun':                  oxfunPro,
    'p2b':                    p2bPro,
    'paradex':                paradexPro,
    'phemex':                 phemexPro,
    'poloniex':               poloniexPro,
    'poloniexfutures':        poloniexfuturesPro,
    'probit':                 probitPro,
    'upbit':                  upbitPro,
    'vertex':                 vertexPro,
    'whitebit':               whitebitPro,
    'woo':                    wooPro,
    'woofipro':               woofiproPro,
    'xt':                     xtPro,
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
pro['Exchange'] = Exchange // now the same for rest and ts
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
    BaseError,
    ExchangeError,
    AuthenticationError,
    PermissionDenied,
    AccountNotEnabled,
    AccountSuspended,
    ArgumentsRequired,
    BadRequest,
    BadSymbol,
    OperationRejected,
    NoChange,
    MarginModeAlreadySet,
    MarketClosed,
    ManualInteractionNeeded,
    InsufficientFunds,
    InvalidAddress,
    AddressPending,
    InvalidOrder,
    OrderNotFound,
    OrderNotCached,
    OrderImmediatelyFillable,
    OrderNotFillable,
    DuplicateOrderId,
    ContractUnavailable,
    NotSupported,
    InvalidProxySettings,
    ExchangeClosedByUser,
    OperationFailed,
    NetworkError,
    DDoSProtection,
    RateLimitExceeded,
    ExchangeNotAvailable,
    OnMaintenance,
    InvalidNonce,
    ChecksumError,
    RequestTimeout,
    BadResponse,
    NullResponse,
    CancelPending,
    UnsubscribeError,
    Int,
    int,
    Str,
    Strings,
    Num,
    Bool,
    IndexType,
    OrderSide,
    OrderType,
    MarketType,
    SubType,
    Dict,
    NullableDict,
    List,
    NullableList,
    Fee,
    OHLCV,
    OHLCVC,
    implicitReturnType,
    Market,
    Currency,
    Dictionary,
    MinMax,
    FeeInterface,
    TradingFeeInterface,
    MarketMarginModes,
    MarketInterface,
    Trade,
    Order,
    OrderBook,
    OrderBooks,
    Ticker,
    Transaction,
    Tickers,
    CurrencyInterface,
    Balance,
    BalanceAccount,
    Account,
    PartialBalances,
    Balances,
    DepositAddress,
    WithdrawalResponse,
    DepositAddressResponse,
    FundingRate,
    FundingRates,
    Position,
    BorrowInterest,
    LeverageTier,
    LedgerEntry,
    DepositWithdrawFeeNetwork,
    DepositWithdrawFee,
    TransferEntry,
    CrossBorrowRate,
    IsolatedBorrowRate,
    FundingRateHistory,
    OpenInterest,
    OpenInterests,
    Liquidation,
    OrderRequest,
    CancellationRequest,
    FundingHistory,
    MarginMode,
    Greeks,
    Conversion,
    Option,
    LastPrice,
    Leverage,
    LongShortRatio,
    MarginModification,
    Leverages,
    LastPrices,
    Currencies,
    TradingFees,
    MarginModes,
    OptionChain,
    IsolatedBorrowRates,
    CrossBorrowRates,
    LeverageTiers,
    ace,
    alpaca,
    ascendex,
    bequant,
    bigone,
    binance,
    binancecoinm,
    binanceus,
    binanceusdm,
    bingx,
    bit2c,
    bitbank,
    bitbns,
    bitcoincom,
    bitfinex,
    bitfinex1,
    bitflyer,
    bitget,
    bithumb,
    bitmart,
    bitmex,
    bitopro,
    bitpanda,
    bitrue,
    bitso,
    bitstamp,
    bitteam,
    bitvavo,
    bl3p,
    blockchaincom,
    blofin,
    btcalpha,
    btcbox,
    btcmarkets,
    btcturk,
    bybit,
    cex,
    coinbase,
    coinbaseadvanced,
    coinbaseexchange,
    coinbaseinternational,
    coincatch,
    coincheck,
    coinex,
    coinlist,
    coinmate,
    coinmetro,
    coinone,
    coinsph,
    coinspot,
    cryptocom,
    currencycom,
    defx,
    delta,
    deribit,
    digifinex,
    ellipx,
    exmo,
    fmfwio,
    gate,
    gateio,
    gemini,
    hashkey,
    hitbtc,
    hollaex,
    htx,
    huobi,
    huobijp,
    hyperliquid,
    idex,
    independentreserve,
    indodax,
    kraken,
    krakenfutures,
    kucoin,
    kucoinfutures,
    kuna,
    latoken,
    lbank,
    luno,
    mercado,
    mexc,
    myokx,
    ndax,
    novadax,
    oceanex,
    okcoin,
    okx,
    onetrading,
    oxfun,
    p2b,
    paradex,
    paymium,
    phemex,
    poloniex,
    poloniexfutures,
    probit,
    timex,
    tokocrypto,
    tradeogre,
    upbit,
    vertex,
    wavesexchange,
    whitebit,
    woo,
    woofipro,
    xt,
    yobit,
    zaif,
    zonda,    
}

export default ccxt;

//-----------------------------------------------------------------------------
