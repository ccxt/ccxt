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
import type { Int, int, Str, Strings, Num, Bool, IndexType, OrderSide, OrderType, MarketType, SubType, Dict, NullableDict, List, NullableList, Fee, OHLCV, OHLCVC, implicitReturnType, Market, Currency, Dictionary, MinMax, FeeInterface, TradingFeeInterface, MarketInterface, Trade, Order, OrderBook, Ticker, Transaction, Tickers, CurrencyInterface, Balance, BalanceAccount, Account, PartialBalances, Balances, DepositAddress, WithdrawalResponse, FundingRate, FundingRates, Position, BorrowInterest, LeverageTier, LedgerEntry, DepositWithdrawFeeNetwork, DepositWithdrawFee, TransferEntry, CrossBorrowRate, IsolatedBorrowRate, FundingRateHistory, OpenInterest, Liquidation, OrderRequest, CancellationRequest, FundingHistory, MarketMarginModes, MarginMode, Greeks, Conversion, Option, LastPrice, Leverage, MarginModification, Leverages, LastPrices, Currencies, TradingFees, MarginModes, OptionChain, IsolatedBorrowRates, CrossBorrowRates, LeverageTiers, LongShortRatio, OrderBooks, OpenInterests, ConstructorArgs } from './src/base/types.js'
import {BaseError, ExchangeError, AuthenticationError, PermissionDenied, AccountNotEnabled, AccountSuspended, ArgumentsRequired, BadRequest, BadSymbol, OperationRejected, NoChange, MarginModeAlreadySet, MarketClosed, ManualInteractionNeeded, RestrictedLocation, InsufficientFunds, InvalidAddress, AddressPending, InvalidOrder, OrderNotFound, OrderNotCached, OrderImmediatelyFillable, OrderNotFillable, DuplicateOrderId, ContractUnavailable, NotSupported, InvalidProxySettings, ExchangeClosedByUser, OperationFailed, NetworkError, DDoSProtection, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance, InvalidNonce, ChecksumError, RequestTimeout, BadResponse, NullResponse, CancelPending, UnsubscribeError}  from './src/base/errors.js'


//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '4.5.6';

(Exchange as any).ccxtVersion = version

//-----------------------------------------------------------------------------

import alpaca from  './src/alpaca.js'
import apex from  './src/apex.js'
import ascendex from  './src/ascendex.js'
import backpack from  './src/backpack.js'
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
import bitfinex from  './src/bitfinex.js'
import bitflyer from  './src/bitflyer.js'
import bitget from  './src/bitget.js'
import bithumb from  './src/bithumb.js'
import bitmart from  './src/bitmart.js'
import bitmex from  './src/bitmex.js'
import bitopro from  './src/bitopro.js'
import bitrue from  './src/bitrue.js'
import bitso from  './src/bitso.js'
import bitstamp from  './src/bitstamp.js'
import bitteam from  './src/bitteam.js'
import bittrade from  './src/bittrade.js'
import bitvavo from  './src/bitvavo.js'
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
import coinmate from  './src/coinmate.js'
import coinmetro from  './src/coinmetro.js'
import coinone from  './src/coinone.js'
import coinsph from  './src/coinsph.js'
import coinspot from  './src/coinspot.js'
import cryptocom from  './src/cryptocom.js'
import cryptomus from  './src/cryptomus.js'
import defx from  './src/defx.js'
import delta from  './src/delta.js'
import deribit from  './src/deribit.js'
import derive from  './src/derive.js'
import digifinex from  './src/digifinex.js'
import exmo from  './src/exmo.js'
import fmfwio from  './src/fmfwio.js'
import foxbit from  './src/foxbit.js'
import gate from  './src/gate.js'
import gateio from  './src/gateio.js'
import gemini from  './src/gemini.js'
import hashkey from  './src/hashkey.js'
import hibachi from  './src/hibachi.js'
import hitbtc from  './src/hitbtc.js'
import hollaex from  './src/hollaex.js'
import htx from  './src/htx.js'
import huobi from  './src/huobi.js'
import hyperliquid from  './src/hyperliquid.js'
import independentreserve from  './src/independentreserve.js'
import indodax from  './src/indodax.js'
import kraken from  './src/kraken.js'
import krakenfutures from  './src/krakenfutures.js'
import kucoin from  './src/kucoin.js'
import kucoinfutures from  './src/kucoinfutures.js'
import latoken from  './src/latoken.js'
import lbank from  './src/lbank.js'
import luno from  './src/luno.js'
import mercado from  './src/mercado.js'
import mexc from  './src/mexc.js'
import modetrade from  './src/modetrade.js'
import myokx from  './src/myokx.js'
import ndax from  './src/ndax.js'
import novadax from  './src/novadax.js'
import oceanex from  './src/oceanex.js'
import okcoin from  './src/okcoin.js'
import okx from  './src/okx.js'
import okxus from  './src/okxus.js'
import onetrading from  './src/onetrading.js'
import oxfun from  './src/oxfun.js'
import p2b from  './src/p2b.js'
import paradex from  './src/paradex.js'
import paymium from  './src/paymium.js'
import phemex from  './src/phemex.js'
import poloniex from  './src/poloniex.js'
import probit from  './src/probit.js'
import timex from  './src/timex.js'
import tokocrypto from  './src/tokocrypto.js'
import toobit from  './src/toobit.js'
import upbit from  './src/upbit.js'
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
import apexPro from  './src/pro/apex.js'
import ascendexPro from  './src/pro/ascendex.js'
import backpackPro from  './src/pro/backpack.js'
import bequantPro from  './src/pro/bequant.js'
import binancePro from  './src/pro/binance.js'
import binancecoinmPro from  './src/pro/binancecoinm.js'
import binanceusPro from  './src/pro/binanceus.js'
import binanceusdmPro from  './src/pro/binanceusdm.js'
import bingxPro from  './src/pro/bingx.js'
import bitfinexPro from  './src/pro/bitfinex.js'
import bitgetPro from  './src/pro/bitget.js'
import bithumbPro from  './src/pro/bithumb.js'
import bitmartPro from  './src/pro/bitmart.js'
import bitmexPro from  './src/pro/bitmex.js'
import bitoproPro from  './src/pro/bitopro.js'
import bitruePro from  './src/pro/bitrue.js'
import bitstampPro from  './src/pro/bitstamp.js'
import bittradePro from  './src/pro/bittrade.js'
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
import defxPro from  './src/pro/defx.js'
import deribitPro from  './src/pro/deribit.js'
import derivePro from  './src/pro/derive.js'
import exmoPro from  './src/pro/exmo.js'
import gatePro from  './src/pro/gate.js'
import gateioPro from  './src/pro/gateio.js'
import geminiPro from  './src/pro/gemini.js'
import hashkeyPro from  './src/pro/hashkey.js'
import hitbtcPro from  './src/pro/hitbtc.js'
import hollaexPro from  './src/pro/hollaex.js'
import htxPro from  './src/pro/htx.js'
import huobiPro from  './src/pro/huobi.js'
import hyperliquidPro from  './src/pro/hyperliquid.js'
import independentreservePro from  './src/pro/independentreserve.js'
import krakenPro from  './src/pro/kraken.js'
import krakenfuturesPro from  './src/pro/krakenfutures.js'
import kucoinPro from  './src/pro/kucoin.js'
import kucoinfuturesPro from  './src/pro/kucoinfutures.js'
import lbankPro from  './src/pro/lbank.js'
import lunoPro from  './src/pro/luno.js'
import mexcPro from  './src/pro/mexc.js'
import modetradePro from  './src/pro/modetrade.js'
import myokxPro from  './src/pro/myokx.js'
import ndaxPro from  './src/pro/ndax.js'
import okcoinPro from  './src/pro/okcoin.js'
import okxPro from  './src/pro/okx.js'
import okxusPro from  './src/pro/okxus.js'
import onetradingPro from  './src/pro/onetrading.js'
import oxfunPro from  './src/pro/oxfun.js'
import p2bPro from  './src/pro/p2b.js'
import paradexPro from  './src/pro/paradex.js'
import phemexPro from  './src/pro/phemex.js'
import poloniexPro from  './src/pro/poloniex.js'
import probitPro from  './src/pro/probit.js'
import toobitPro from  './src/pro/toobit.js'
import upbitPro from  './src/pro/upbit.js'
import whitebitPro from  './src/pro/whitebit.js'
import wooPro from  './src/pro/woo.js'
import woofiproPro from  './src/pro/woofipro.js'
import xtPro from  './src/pro/xt.js'

const exchanges = {
    'alpaca':                 alpaca,
    'apex':                   apex,
    'ascendex':               ascendex,
    'backpack':               backpack,
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
    'bitfinex':               bitfinex,
    'bitflyer':               bitflyer,
    'bitget':                 bitget,
    'bithumb':                bithumb,
    'bitmart':                bitmart,
    'bitmex':                 bitmex,
    'bitopro':                bitopro,
    'bitrue':                 bitrue,
    'bitso':                  bitso,
    'bitstamp':               bitstamp,
    'bitteam':                bitteam,
    'bittrade':               bittrade,
    'bitvavo':                bitvavo,
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
    'coinmate':               coinmate,
    'coinmetro':              coinmetro,
    'coinone':                coinone,
    'coinsph':                coinsph,
    'coinspot':               coinspot,
    'cryptocom':              cryptocom,
    'cryptomus':              cryptomus,
    'defx':                   defx,
    'delta':                  delta,
    'deribit':                deribit,
    'derive':                 derive,
    'digifinex':              digifinex,
    'exmo':                   exmo,
    'fmfwio':                 fmfwio,
    'foxbit':                 foxbit,
    'gate':                   gate,
    'gateio':                 gateio,
    'gemini':                 gemini,
    'hashkey':                hashkey,
    'hibachi':                hibachi,
    'hitbtc':                 hitbtc,
    'hollaex':                hollaex,
    'htx':                    htx,
    'huobi':                  huobi,
    'hyperliquid':            hyperliquid,
    'independentreserve':     independentreserve,
    'indodax':                indodax,
    'kraken':                 kraken,
    'krakenfutures':          krakenfutures,
    'kucoin':                 kucoin,
    'kucoinfutures':          kucoinfutures,
    'latoken':                latoken,
    'lbank':                  lbank,
    'luno':                   luno,
    'mercado':                mercado,
    'mexc':                   mexc,
    'modetrade':              modetrade,
    'myokx':                  myokx,
    'ndax':                   ndax,
    'novadax':                novadax,
    'oceanex':                oceanex,
    'okcoin':                 okcoin,
    'okx':                    okx,
    'okxus':                  okxus,
    'onetrading':             onetrading,
    'oxfun':                  oxfun,
    'p2b':                    p2b,
    'paradex':                paradex,
    'paymium':                paymium,
    'phemex':                 phemex,
    'poloniex':               poloniex,
    'probit':                 probit,
    'timex':                  timex,
    'tokocrypto':             tokocrypto,
    'toobit':                 toobit,
    'upbit':                  upbit,
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
    'apex':                   apexPro,
    'ascendex':               ascendexPro,
    'backpack':               backpackPro,
    'bequant':                bequantPro,
    'binance':                binancePro,
    'binancecoinm':           binancecoinmPro,
    'binanceus':              binanceusPro,
    'binanceusdm':            binanceusdmPro,
    'bingx':                  bingxPro,
    'bitfinex':               bitfinexPro,
    'bitget':                 bitgetPro,
    'bithumb':                bithumbPro,
    'bitmart':                bitmartPro,
    'bitmex':                 bitmexPro,
    'bitopro':                bitoproPro,
    'bitrue':                 bitruePro,
    'bitstamp':               bitstampPro,
    'bittrade':               bittradePro,
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
    'defx':                   defxPro,
    'deribit':                deribitPro,
    'derive':                 derivePro,
    'exmo':                   exmoPro,
    'gate':                   gatePro,
    'gateio':                 gateioPro,
    'gemini':                 geminiPro,
    'hashkey':                hashkeyPro,
    'hitbtc':                 hitbtcPro,
    'hollaex':                hollaexPro,
    'htx':                    htxPro,
    'huobi':                  huobiPro,
    'hyperliquid':            hyperliquidPro,
    'independentreserve':     independentreservePro,
    'kraken':                 krakenPro,
    'krakenfutures':          krakenfuturesPro,
    'kucoin':                 kucoinPro,
    'kucoinfutures':          kucoinfuturesPro,
    'lbank':                  lbankPro,
    'luno':                   lunoPro,
    'mexc':                   mexcPro,
    'modetrade':              modetradePro,
    'myokx':                  myokxPro,
    'ndax':                   ndaxPro,
    'okcoin':                 okcoinPro,
    'okx':                    okxPro,
    'okxus':                  okxusPro,
    'onetrading':             onetradingPro,
    'oxfun':                  oxfunPro,
    'p2b':                    p2bPro,
    'paradex':                paradexPro,
    'phemex':                 phemexPro,
    'poloniex':               poloniexPro,
    'probit':                 probitPro,
    'toobit':                 toobitPro,
    'upbit':                  upbitPro,
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
    RestrictedLocation,
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
    ConstructorArgs,
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
    alpaca,
    apex,
    ascendex,
    backpack,
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
    bitfinex,
    bitflyer,
    bitget,
    bithumb,
    bitmart,
    bitmex,
    bitopro,
    bitrue,
    bitso,
    bitstamp,
    bitteam,
    bittrade,
    bitvavo,
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
    coinmate,
    coinmetro,
    coinone,
    coinsph,
    coinspot,
    cryptocom,
    cryptomus,
    defx,
    delta,
    deribit,
    derive,
    digifinex,
    exmo,
    fmfwio,
    foxbit,
    gate,
    gateio,
    gemini,
    hashkey,
    hibachi,
    hitbtc,
    hollaex,
    htx,
    huobi,
    hyperliquid,
    independentreserve,
    indodax,
    kraken,
    krakenfutures,
    kucoin,
    kucoinfutures,
    latoken,
    lbank,
    luno,
    mercado,
    mexc,
    modetrade,
    myokx,
    ndax,
    novadax,
    oceanex,
    okcoin,
    okx,
    okxus,
    onetrading,
    oxfun,
    p2b,
    paradex,
    paymium,
    phemex,
    poloniex,
    probit,
    timex,
    tokocrypto,
    toobit,
    upbit,
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
