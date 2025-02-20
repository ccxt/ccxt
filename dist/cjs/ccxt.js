'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./_virtual/_commonjsHelpers.js');
require('./_virtual/formats.cjs.js');
require('./_virtual/index.cjs.js');
require('./_virtual/parse.cjs.js');
require('./_virtual/stringify.cjs.js');
require('./_virtual/utils.cjs.js');
var Exchange = require('./src/base/Exchange.js');
var Precise = require('./src/base/Precise.js');
var functions = require('./src/base/functions.js');
var errors = require('./src/base/errors.js');
var ace = require('./src/ace.js');
var alpaca = require('./src/alpaca.js');
var ascendex = require('./src/ascendex.js');
var bequant = require('./src/bequant.js');
var bigone = require('./src/bigone.js');
var binance = require('./src/binance.js');
var binancecoinm = require('./src/binancecoinm.js');
var binanceus = require('./src/binanceus.js');
var binanceusdm = require('./src/binanceusdm.js');
var bingx = require('./src/bingx.js');
var bit2c = require('./src/bit2c.js');
var bitbank = require('./src/bitbank.js');
var bitbns = require('./src/bitbns.js');
var bitcoincom = require('./src/bitcoincom.js');
var bitfinex = require('./src/bitfinex.js');
var bitfinex1 = require('./src/bitfinex1.js');
var bitflyer = require('./src/bitflyer.js');
var bitget = require('./src/bitget.js');
var bithumb = require('./src/bithumb.js');
var bitmart = require('./src/bitmart.js');
var bitmex = require('./src/bitmex.js');
var bitopro = require('./src/bitopro.js');
var bitpanda = require('./src/bitpanda.js');
var bitrue = require('./src/bitrue.js');
var bitso = require('./src/bitso.js');
var bitstamp = require('./src/bitstamp.js');
var bitteam = require('./src/bitteam.js');
var bitvavo = require('./src/bitvavo.js');
var bl3p = require('./src/bl3p.js');
var blockchaincom = require('./src/blockchaincom.js');
var blofin = require('./src/blofin.js');
var btcalpha = require('./src/btcalpha.js');
var btcbox = require('./src/btcbox.js');
var btcmarkets = require('./src/btcmarkets.js');
var btcturk = require('./src/btcturk.js');
var bybit = require('./src/bybit.js');
var cex = require('./src/cex.js');
var coinbase = require('./src/coinbase.js');
var coinbaseadvanced = require('./src/coinbaseadvanced.js');
var coinbaseexchange = require('./src/coinbaseexchange.js');
var coinbaseinternational = require('./src/coinbaseinternational.js');
var coincatch = require('./src/coincatch.js');
var coincheck = require('./src/coincheck.js');
var coinex = require('./src/coinex.js');
var coinlist = require('./src/coinlist.js');
var coinmate = require('./src/coinmate.js');
var coinmetro = require('./src/coinmetro.js');
var coinone = require('./src/coinone.js');
var coinsph = require('./src/coinsph.js');
var coinspot = require('./src/coinspot.js');
var cryptocom = require('./src/cryptocom.js');
var currencycom = require('./src/currencycom.js');
var defx = require('./src/defx.js');
var delta = require('./src/delta.js');
var deribit = require('./src/deribit.js');
var digifinex = require('./src/digifinex.js');
var ellipx = require('./src/ellipx.js');
var exmo = require('./src/exmo.js');
var fmfwio = require('./src/fmfwio.js');
var gate = require('./src/gate.js');
var gateio = require('./src/gateio.js');
var gemini = require('./src/gemini.js');
var hashkey = require('./src/hashkey.js');
var hitbtc = require('./src/hitbtc.js');
var hollaex = require('./src/hollaex.js');
var htx = require('./src/htx.js');
var huobi = require('./src/huobi.js');
var huobijp = require('./src/huobijp.js');
var hyperliquid = require('./src/hyperliquid.js');
var idex = require('./src/idex.js');
var independentreserve = require('./src/independentreserve.js');
var indodax = require('./src/indodax.js');
var kraken = require('./src/kraken.js');
var krakenfutures = require('./src/krakenfutures.js');
var kucoin = require('./src/kucoin.js');
var kucoinfutures = require('./src/kucoinfutures.js');
var kuna = require('./src/kuna.js');
var latoken = require('./src/latoken.js');
var lbank = require('./src/lbank.js');
var luno = require('./src/luno.js');
var mercado = require('./src/mercado.js');
var mexc = require('./src/mexc.js');
var myokx = require('./src/myokx.js');
var ndax = require('./src/ndax.js');
var novadax = require('./src/novadax.js');
var oceanex = require('./src/oceanex.js');
var okcoin = require('./src/okcoin.js');
var okx = require('./src/okx.js');
var onetrading = require('./src/onetrading.js');
var oxfun = require('./src/oxfun.js');
var p2b = require('./src/p2b.js');
var paradex = require('./src/paradex.js');
var paymium = require('./src/paymium.js');
var phemex = require('./src/phemex.js');
var poloniex = require('./src/poloniex.js');
var poloniexfutures = require('./src/poloniexfutures.js');
var probit = require('./src/probit.js');
var timex = require('./src/timex.js');
var tokocrypto = require('./src/tokocrypto.js');
var tradeogre = require('./src/tradeogre.js');
var upbit = require('./src/upbit.js');
var vertex = require('./src/vertex.js');
var wavesexchange = require('./src/wavesexchange.js');
var whitebit = require('./src/whitebit.js');
var woo = require('./src/woo.js');
var woofipro = require('./src/woofipro.js');
var xt = require('./src/xt.js');
var yobit = require('./src/yobit.js');
var zaif = require('./src/zaif.js');
var zonda = require('./src/zonda.js');
var alpaca$1 = require('./src/pro/alpaca.js');
var ascendex$1 = require('./src/pro/ascendex.js');
var bequant$1 = require('./src/pro/bequant.js');
var binance$1 = require('./src/pro/binance.js');
var binancecoinm$1 = require('./src/pro/binancecoinm.js');
var binanceus$1 = require('./src/pro/binanceus.js');
var binanceusdm$1 = require('./src/pro/binanceusdm.js');
var bingx$1 = require('./src/pro/bingx.js');
var bitcoincom$1 = require('./src/pro/bitcoincom.js');
var bitfinex$1 = require('./src/pro/bitfinex.js');
var bitfinex1$1 = require('./src/pro/bitfinex1.js');
var bitget$1 = require('./src/pro/bitget.js');
var bithumb$1 = require('./src/pro/bithumb.js');
var bitmart$1 = require('./src/pro/bitmart.js');
var bitmex$1 = require('./src/pro/bitmex.js');
var bitopro$1 = require('./src/pro/bitopro.js');
var bitpanda$1 = require('./src/pro/bitpanda.js');
var bitrue$1 = require('./src/pro/bitrue.js');
var bitstamp$1 = require('./src/pro/bitstamp.js');
var bitvavo$1 = require('./src/pro/bitvavo.js');
var blockchaincom$1 = require('./src/pro/blockchaincom.js');
var blofin$1 = require('./src/pro/blofin.js');
var bybit$1 = require('./src/pro/bybit.js');
var cex$1 = require('./src/pro/cex.js');
var coinbase$1 = require('./src/pro/coinbase.js');
var coinbaseadvanced$1 = require('./src/pro/coinbaseadvanced.js');
var coinbaseexchange$1 = require('./src/pro/coinbaseexchange.js');
var coinbaseinternational$1 = require('./src/pro/coinbaseinternational.js');
var coincatch$1 = require('./src/pro/coincatch.js');
var coincheck$1 = require('./src/pro/coincheck.js');
var coinex$1 = require('./src/pro/coinex.js');
var coinone$1 = require('./src/pro/coinone.js');
var cryptocom$1 = require('./src/pro/cryptocom.js');
var currencycom$1 = require('./src/pro/currencycom.js');
var defx$1 = require('./src/pro/defx.js');
var deribit$1 = require('./src/pro/deribit.js');
var exmo$1 = require('./src/pro/exmo.js');
var gate$1 = require('./src/pro/gate.js');
var gateio$1 = require('./src/pro/gateio.js');
var gemini$1 = require('./src/pro/gemini.js');
var hashkey$1 = require('./src/pro/hashkey.js');
var hitbtc$1 = require('./src/pro/hitbtc.js');
var hollaex$1 = require('./src/pro/hollaex.js');
var htx$1 = require('./src/pro/htx.js');
var huobi$1 = require('./src/pro/huobi.js');
var huobijp$1 = require('./src/pro/huobijp.js');
var hyperliquid$1 = require('./src/pro/hyperliquid.js');
var idex$1 = require('./src/pro/idex.js');
var independentreserve$1 = require('./src/pro/independentreserve.js');
var kraken$1 = require('./src/pro/kraken.js');
var krakenfutures$1 = require('./src/pro/krakenfutures.js');
var kucoin$1 = require('./src/pro/kucoin.js');
var kucoinfutures$1 = require('./src/pro/kucoinfutures.js');
var lbank$1 = require('./src/pro/lbank.js');
var luno$1 = require('./src/pro/luno.js');
var mexc$1 = require('./src/pro/mexc.js');
var myokx$1 = require('./src/pro/myokx.js');
var ndax$1 = require('./src/pro/ndax.js');
var okcoin$1 = require('./src/pro/okcoin.js');
var okx$1 = require('./src/pro/okx.js');
var onetrading$1 = require('./src/pro/onetrading.js');
var oxfun$1 = require('./src/pro/oxfun.js');
var p2b$1 = require('./src/pro/p2b.js');
var paradex$1 = require('./src/pro/paradex.js');
var phemex$1 = require('./src/pro/phemex.js');
var poloniex$1 = require('./src/pro/poloniex.js');
var poloniexfutures$1 = require('./src/pro/poloniexfutures.js');
var probit$1 = require('./src/pro/probit.js');
var upbit$1 = require('./src/pro/upbit.js');
var vertex$1 = require('./src/pro/vertex.js');
var whitebit$1 = require('./src/pro/whitebit.js');
var woo$1 = require('./src/pro/woo.js');
var woofipro$1 = require('./src/pro/woofipro.js');
var xt$1 = require('./src/pro/xt.js');

//-----------------------------------------------------------------------------
// this is updated by vss.js when building
const version = '4.4.61';
Exchange["default"].ccxtVersion = version;
const exchanges = {
    'ace': ace,
    'alpaca': alpaca,
    'ascendex': ascendex,
    'bequant': bequant,
    'bigone': bigone,
    'binance': binance,
    'binancecoinm': binancecoinm,
    'binanceus': binanceus,
    'binanceusdm': binanceusdm,
    'bingx': bingx,
    'bit2c': bit2c,
    'bitbank': bitbank,
    'bitbns': bitbns,
    'bitcoincom': bitcoincom,
    'bitfinex': bitfinex,
    'bitfinex1': bitfinex1,
    'bitflyer': bitflyer,
    'bitget': bitget,
    'bithumb': bithumb,
    'bitmart': bitmart,
    'bitmex': bitmex,
    'bitopro': bitopro,
    'bitpanda': bitpanda,
    'bitrue': bitrue,
    'bitso': bitso,
    'bitstamp': bitstamp,
    'bitteam': bitteam,
    'bitvavo': bitvavo,
    'bl3p': bl3p,
    'blockchaincom': blockchaincom,
    'blofin': blofin,
    'btcalpha': btcalpha,
    'btcbox': btcbox,
    'btcmarkets': btcmarkets,
    'btcturk': btcturk,
    'bybit': bybit,
    'cex': cex,
    'coinbase': coinbase,
    'coinbaseadvanced': coinbaseadvanced,
    'coinbaseexchange': coinbaseexchange,
    'coinbaseinternational': coinbaseinternational,
    'coincatch': coincatch,
    'coincheck': coincheck,
    'coinex': coinex,
    'coinlist': coinlist,
    'coinmate': coinmate,
    'coinmetro': coinmetro,
    'coinone': coinone,
    'coinsph': coinsph,
    'coinspot': coinspot,
    'cryptocom': cryptocom,
    'currencycom': currencycom,
    'defx': defx,
    'delta': delta,
    'deribit': deribit,
    'digifinex': digifinex,
    'ellipx': ellipx,
    'exmo': exmo,
    'fmfwio': fmfwio,
    'gate': gate,
    'gateio': gateio,
    'gemini': gemini,
    'hashkey': hashkey,
    'hitbtc': hitbtc,
    'hollaex': hollaex,
    'htx': htx,
    'huobi': huobi,
    'huobijp': huobijp,
    'hyperliquid': hyperliquid,
    'idex': idex,
    'independentreserve': independentreserve,
    'indodax': indodax,
    'kraken': kraken,
    'krakenfutures': krakenfutures,
    'kucoin': kucoin,
    'kucoinfutures': kucoinfutures,
    'kuna': kuna,
    'latoken': latoken,
    'lbank': lbank,
    'luno': luno,
    'mercado': mercado,
    'mexc': mexc,
    'myokx': myokx,
    'ndax': ndax,
    'novadax': novadax,
    'oceanex': oceanex,
    'okcoin': okcoin,
    'okx': okx,
    'onetrading': onetrading,
    'oxfun': oxfun,
    'p2b': p2b,
    'paradex': paradex,
    'paymium': paymium,
    'phemex': phemex,
    'poloniex': poloniex,
    'poloniexfutures': poloniexfutures,
    'probit': probit,
    'timex': timex,
    'tokocrypto': tokocrypto,
    'tradeogre': tradeogre,
    'upbit': upbit,
    'vertex': vertex,
    'wavesexchange': wavesexchange,
    'whitebit': whitebit,
    'woo': woo,
    'woofipro': woofipro,
    'xt': xt,
    'yobit': yobit,
    'zaif': zaif,
    'zonda': zonda,
};
const pro = {
    'alpaca': alpaca$1,
    'ascendex': ascendex$1,
    'bequant': bequant$1,
    'binance': binance$1,
    'binancecoinm': binancecoinm$1,
    'binanceus': binanceus$1,
    'binanceusdm': binanceusdm$1,
    'bingx': bingx$1,
    'bitcoincom': bitcoincom$1,
    'bitfinex': bitfinex$1,
    'bitfinex1': bitfinex1$1,
    'bitget': bitget$1,
    'bithumb': bithumb$1,
    'bitmart': bitmart$1,
    'bitmex': bitmex$1,
    'bitopro': bitopro$1,
    'bitpanda': bitpanda$1,
    'bitrue': bitrue$1,
    'bitstamp': bitstamp$1,
    'bitvavo': bitvavo$1,
    'blockchaincom': blockchaincom$1,
    'blofin': blofin$1,
    'bybit': bybit$1,
    'cex': cex$1,
    'coinbase': coinbase$1,
    'coinbaseadvanced': coinbaseadvanced$1,
    'coinbaseexchange': coinbaseexchange$1,
    'coinbaseinternational': coinbaseinternational$1,
    'coincatch': coincatch$1,
    'coincheck': coincheck$1,
    'coinex': coinex$1,
    'coinone': coinone$1,
    'cryptocom': cryptocom$1,
    'currencycom': currencycom$1,
    'defx': defx$1,
    'deribit': deribit$1,
    'exmo': exmo$1,
    'gate': gate$1,
    'gateio': gateio$1,
    'gemini': gemini$1,
    'hashkey': hashkey$1,
    'hitbtc': hitbtc$1,
    'hollaex': hollaex$1,
    'htx': htx$1,
    'huobi': huobi$1,
    'huobijp': huobijp$1,
    'hyperliquid': hyperliquid$1,
    'idex': idex$1,
    'independentreserve': independentreserve$1,
    'kraken': kraken$1,
    'krakenfutures': krakenfutures$1,
    'kucoin': kucoin$1,
    'kucoinfutures': kucoinfutures$1,
    'lbank': lbank$1,
    'luno': luno$1,
    'mexc': mexc$1,
    'myokx': myokx$1,
    'ndax': ndax$1,
    'okcoin': okcoin$1,
    'okx': okx$1,
    'onetrading': onetrading$1,
    'oxfun': oxfun$1,
    'p2b': p2b$1,
    'paradex': paradex$1,
    'phemex': phemex$1,
    'poloniex': poloniex$1,
    'poloniexfutures': poloniexfutures$1,
    'probit': probit$1,
    'upbit': upbit$1,
    'vertex': vertex$1,
    'whitebit': whitebit$1,
    'woo': woo$1,
    'woofipro': woofipro$1,
    'xt': xt$1,
};
pro.exchanges = Object.keys(pro);
pro['Exchange'] = Exchange["default"]; // now the same for rest and ts
//-----------------------------------------------------------------------------
const ccxt = Object.assign({ version, Exchange: Exchange["default"], Precise: Precise["default"], 'exchanges': Object.keys(exchanges), 'pro': pro }, exchanges, functions, errors);
//-----------------------------------------------------------------------------

exports.Exchange = Exchange["default"];
exports.Precise = Precise["default"];
exports.functions = functions;
exports.AccountNotEnabled = errors.AccountNotEnabled;
exports.AccountSuspended = errors.AccountSuspended;
exports.AddressPending = errors.AddressPending;
exports.ArgumentsRequired = errors.ArgumentsRequired;
exports.AuthenticationError = errors.AuthenticationError;
exports.BadRequest = errors.BadRequest;
exports.BadResponse = errors.BadResponse;
exports.BadSymbol = errors.BadSymbol;
exports.BaseError = errors.BaseError;
exports.CancelPending = errors.CancelPending;
exports.ChecksumError = errors.ChecksumError;
exports.ContractUnavailable = errors.ContractUnavailable;
exports.DDoSProtection = errors.DDoSProtection;
exports.DuplicateOrderId = errors.DuplicateOrderId;
exports.ExchangeClosedByUser = errors.ExchangeClosedByUser;
exports.ExchangeError = errors.ExchangeError;
exports.ExchangeNotAvailable = errors.ExchangeNotAvailable;
exports.InsufficientFunds = errors.InsufficientFunds;
exports.InvalidAddress = errors.InvalidAddress;
exports.InvalidNonce = errors.InvalidNonce;
exports.InvalidOrder = errors.InvalidOrder;
exports.InvalidProxySettings = errors.InvalidProxySettings;
exports.ManualInteractionNeeded = errors.ManualInteractionNeeded;
exports.MarginModeAlreadySet = errors.MarginModeAlreadySet;
exports.MarketClosed = errors.MarketClosed;
exports.NetworkError = errors.NetworkError;
exports.NoChange = errors.NoChange;
exports.NotSupported = errors.NotSupported;
exports.NullResponse = errors.NullResponse;
exports.OnMaintenance = errors.OnMaintenance;
exports.OperationFailed = errors.OperationFailed;
exports.OperationRejected = errors.OperationRejected;
exports.OrderImmediatelyFillable = errors.OrderImmediatelyFillable;
exports.OrderNotCached = errors.OrderNotCached;
exports.OrderNotFillable = errors.OrderNotFillable;
exports.OrderNotFound = errors.OrderNotFound;
exports.PermissionDenied = errors.PermissionDenied;
exports.RateLimitExceeded = errors.RateLimitExceeded;
exports.RequestTimeout = errors.RequestTimeout;
exports.UnsubscribeError = errors.UnsubscribeError;
exports.errors = errors;
exports.ace = ace;
exports.alpaca = alpaca;
exports.ascendex = ascendex;
exports.bequant = bequant;
exports.bigone = bigone;
exports.binance = binance;
exports.binancecoinm = binancecoinm;
exports.binanceus = binanceus;
exports.binanceusdm = binanceusdm;
exports.bingx = bingx;
exports.bit2c = bit2c;
exports.bitbank = bitbank;
exports.bitbns = bitbns;
exports.bitcoincom = bitcoincom;
exports.bitfinex = bitfinex;
exports.bitfinex1 = bitfinex1;
exports.bitflyer = bitflyer;
exports.bitget = bitget;
exports.bithumb = bithumb;
exports.bitmart = bitmart;
exports.bitmex = bitmex;
exports.bitopro = bitopro;
exports.bitpanda = bitpanda;
exports.bitrue = bitrue;
exports.bitso = bitso;
exports.bitstamp = bitstamp;
exports.bitteam = bitteam;
exports.bitvavo = bitvavo;
exports.bl3p = bl3p;
exports.blockchaincom = blockchaincom;
exports.blofin = blofin;
exports.btcalpha = btcalpha;
exports.btcbox = btcbox;
exports.btcmarkets = btcmarkets;
exports.btcturk = btcturk;
exports.bybit = bybit;
exports.cex = cex;
exports.coinbase = coinbase;
exports.coinbaseadvanced = coinbaseadvanced;
exports.coinbaseexchange = coinbaseexchange;
exports.coinbaseinternational = coinbaseinternational;
exports.coincatch = coincatch;
exports.coincheck = coincheck;
exports.coinex = coinex;
exports.coinlist = coinlist;
exports.coinmate = coinmate;
exports.coinmetro = coinmetro;
exports.coinone = coinone;
exports.coinsph = coinsph;
exports.coinspot = coinspot;
exports.cryptocom = cryptocom;
exports.currencycom = currencycom;
exports.defx = defx;
exports.delta = delta;
exports.deribit = deribit;
exports.digifinex = digifinex;
exports.ellipx = ellipx;
exports.exmo = exmo;
exports.fmfwio = fmfwio;
exports.gate = gate;
exports.gateio = gateio;
exports.gemini = gemini;
exports.hashkey = hashkey;
exports.hitbtc = hitbtc;
exports.hollaex = hollaex;
exports.htx = htx;
exports.huobi = huobi;
exports.huobijp = huobijp;
exports.hyperliquid = hyperliquid;
exports.idex = idex;
exports.independentreserve = independentreserve;
exports.indodax = indodax;
exports.kraken = kraken;
exports.krakenfutures = krakenfutures;
exports.kucoin = kucoin;
exports.kucoinfutures = kucoinfutures;
exports.kuna = kuna;
exports.latoken = latoken;
exports.lbank = lbank;
exports.luno = luno;
exports.mercado = mercado;
exports.mexc = mexc;
exports.myokx = myokx;
exports.ndax = ndax;
exports.novadax = novadax;
exports.oceanex = oceanex;
exports.okcoin = okcoin;
exports.okx = okx;
exports.onetrading = onetrading;
exports.oxfun = oxfun;
exports.p2b = p2b;
exports.paradex = paradex;
exports.paymium = paymium;
exports.phemex = phemex;
exports.poloniex = poloniex;
exports.poloniexfutures = poloniexfutures;
exports.probit = probit;
exports.timex = timex;
exports.tokocrypto = tokocrypto;
exports.tradeogre = tradeogre;
exports.upbit = upbit;
exports.vertex = vertex;
exports.wavesexchange = wavesexchange;
exports.whitebit = whitebit;
exports.woo = woo;
exports.woofipro = woofipro;
exports.xt = xt;
exports.yobit = yobit;
exports.zaif = zaif;
exports.zonda = zonda;
exports["default"] = ccxt;
exports.exchanges = exchanges;
exports.pro = pro;
exports.version = version;
