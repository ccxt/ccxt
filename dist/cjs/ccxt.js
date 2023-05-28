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
var bit2c = require('./src/bit2c.js');
var bitbank = require('./src/bitbank.js');
var bitbay = require('./src/bitbay.js');
var bitbns = require('./src/bitbns.js');
var bitcoincom = require('./src/bitcoincom.js');
var bitfinex = require('./src/bitfinex.js');
var bitfinex2 = require('./src/bitfinex2.js');
var bitflyer = require('./src/bitflyer.js');
var bitforex = require('./src/bitforex.js');
var bitget = require('./src/bitget.js');
var bithumb = require('./src/bithumb.js');
var bitmart = require('./src/bitmart.js');
var bitmex = require('./src/bitmex.js');
var bitopro = require('./src/bitopro.js');
var bitpanda = require('./src/bitpanda.js');
var bitrue = require('./src/bitrue.js');
var bitso = require('./src/bitso.js');
var bitstamp = require('./src/bitstamp.js');
var bitstamp1 = require('./src/bitstamp1.js');
var bittrex = require('./src/bittrex.js');
var bitvavo = require('./src/bitvavo.js');
var bkex = require('./src/bkex.js');
var bl3p = require('./src/bl3p.js');
var blockchaincom = require('./src/blockchaincom.js');
var btcalpha = require('./src/btcalpha.js');
var btcbox = require('./src/btcbox.js');
var btcex = require('./src/btcex.js');
var btcmarkets = require('./src/btcmarkets.js');
var btctradeua = require('./src/btctradeua.js');
var btcturk = require('./src/btcturk.js');
var bybit = require('./src/bybit.js');
var cex = require('./src/cex.js');
var coinbase = require('./src/coinbase.js');
var coinbaseprime = require('./src/coinbaseprime.js');
var coinbasepro = require('./src/coinbasepro.js');
var coincheck = require('./src/coincheck.js');
var coinex = require('./src/coinex.js');
var coinfalcon = require('./src/coinfalcon.js');
var coinmate = require('./src/coinmate.js');
var coinone = require('./src/coinone.js');
var coinsph = require('./src/coinsph.js');
var coinspot = require('./src/coinspot.js');
var cryptocom = require('./src/cryptocom.js');
var currencycom = require('./src/currencycom.js');
var delta = require('./src/delta.js');
var deribit = require('./src/deribit.js');
var digifinex = require('./src/digifinex.js');
var exmo = require('./src/exmo.js');
var fmfwio = require('./src/fmfwio.js');
var gate = require('./src/gate.js');
var gateio = require('./src/gateio.js');
var gemini = require('./src/gemini.js');
var hitbtc = require('./src/hitbtc.js');
var hitbtc3 = require('./src/hitbtc3.js');
var hollaex = require('./src/hollaex.js');
var huobi = require('./src/huobi.js');
var huobijp = require('./src/huobijp.js');
var huobipro = require('./src/huobipro.js');
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
var lbank2 = require('./src/lbank2.js');
var luno = require('./src/luno.js');
var lykke = require('./src/lykke.js');
var mercado = require('./src/mercado.js');
var mexc = require('./src/mexc.js');
var mexc3 = require('./src/mexc3.js');
var ndax = require('./src/ndax.js');
var novadax = require('./src/novadax.js');
var oceanex = require('./src/oceanex.js');
var okcoin = require('./src/okcoin.js');
var okex = require('./src/okex.js');
var okex5 = require('./src/okex5.js');
var okx = require('./src/okx.js');
var paymium = require('./src/paymium.js');
var phemex = require('./src/phemex.js');
var poloniex = require('./src/poloniex.js');
var poloniexfutures = require('./src/poloniexfutures.js');
var probit = require('./src/probit.js');
var stex = require('./src/stex.js');
var tidex = require('./src/tidex.js');
var timex = require('./src/timex.js');
var tokocrypto = require('./src/tokocrypto.js');
var upbit = require('./src/upbit.js');
var wavesexchange = require('./src/wavesexchange.js');
var wazirx = require('./src/wazirx.js');
var whitebit = require('./src/whitebit.js');
var woo = require('./src/woo.js');
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
var bitcoincom$1 = require('./src/pro/bitcoincom.js');
var bitfinex$1 = require('./src/pro/bitfinex.js');
var bitfinex2$1 = require('./src/pro/bitfinex2.js');
var bitget$1 = require('./src/pro/bitget.js');
var bitmart$1 = require('./src/pro/bitmart.js');
var bitmex$1 = require('./src/pro/bitmex.js');
var bitopro$1 = require('./src/pro/bitopro.js');
var bitpanda$1 = require('./src/pro/bitpanda.js');
var bitrue$1 = require('./src/pro/bitrue.js');
var bitstamp$1 = require('./src/pro/bitstamp.js');
var bittrex$1 = require('./src/pro/bittrex.js');
var bitvavo$1 = require('./src/pro/bitvavo.js');
var blockchaincom$1 = require('./src/pro/blockchaincom.js');
var btcex$1 = require('./src/pro/btcex.js');
var bybit$1 = require('./src/pro/bybit.js');
var cex$1 = require('./src/pro/cex.js');
var coinbaseprime$1 = require('./src/pro/coinbaseprime.js');
var coinbasepro$1 = require('./src/pro/coinbasepro.js');
var coinex$1 = require('./src/pro/coinex.js');
var cryptocom$1 = require('./src/pro/cryptocom.js');
var currencycom$1 = require('./src/pro/currencycom.js');
var deribit$1 = require('./src/pro/deribit.js');
var exmo$1 = require('./src/pro/exmo.js');
var gate$1 = require('./src/pro/gate.js');
var gateio$1 = require('./src/pro/gateio.js');
var gemini$1 = require('./src/pro/gemini.js');
var hitbtc$1 = require('./src/pro/hitbtc.js');
var hollaex$1 = require('./src/pro/hollaex.js');
var huobi$1 = require('./src/pro/huobi.js');
var huobijp$1 = require('./src/pro/huobijp.js');
var huobipro$1 = require('./src/pro/huobipro.js');
var idex$1 = require('./src/pro/idex.js');
var independentreserve$1 = require('./src/pro/independentreserve.js');
var kraken$1 = require('./src/pro/kraken.js');
var krakenfutures$1 = require('./src/pro/krakenfutures.js');
var kucoin$1 = require('./src/pro/kucoin.js');
var kucoinfutures$1 = require('./src/pro/kucoinfutures.js');
var luno$1 = require('./src/pro/luno.js');
var mexc$1 = require('./src/pro/mexc.js');
var mexc3$1 = require('./src/pro/mexc3.js');
var ndax$1 = require('./src/pro/ndax.js');
var okcoin$1 = require('./src/pro/okcoin.js');
var okex$1 = require('./src/pro/okex.js');
var okx$1 = require('./src/pro/okx.js');
var phemex$1 = require('./src/pro/phemex.js');
var poloniexfutures$1 = require('./src/pro/poloniexfutures.js');
var probit$1 = require('./src/pro/probit.js');
var upbit$1 = require('./src/pro/upbit.js');
var wazirx$1 = require('./src/pro/wazirx.js');
var whitebit$1 = require('./src/pro/whitebit.js');
var woo$1 = require('./src/pro/woo.js');

//-----------------------------------------------------------------------------
// this is updated by vss.js when building
const version = '3.1.12';
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
    'bit2c': bit2c,
    'bitbank': bitbank,
    'bitbay': bitbay,
    'bitbns': bitbns,
    'bitcoincom': bitcoincom,
    'bitfinex': bitfinex,
    'bitfinex2': bitfinex2,
    'bitflyer': bitflyer,
    'bitforex': bitforex,
    'bitget': bitget,
    'bithumb': bithumb,
    'bitmart': bitmart,
    'bitmex': bitmex,
    'bitopro': bitopro,
    'bitpanda': bitpanda,
    'bitrue': bitrue,
    'bitso': bitso,
    'bitstamp': bitstamp,
    'bitstamp1': bitstamp1,
    'bittrex': bittrex,
    'bitvavo': bitvavo,
    'bkex': bkex,
    'bl3p': bl3p,
    'blockchaincom': blockchaincom,
    'btcalpha': btcalpha,
    'btcbox': btcbox,
    'btcex': btcex,
    'btcmarkets': btcmarkets,
    'btctradeua': btctradeua,
    'btcturk': btcturk,
    'bybit': bybit,
    'cex': cex,
    'coinbase': coinbase,
    'coinbaseprime': coinbaseprime,
    'coinbasepro': coinbasepro,
    'coincheck': coincheck,
    'coinex': coinex,
    'coinfalcon': coinfalcon,
    'coinmate': coinmate,
    'coinone': coinone,
    'coinsph': coinsph,
    'coinspot': coinspot,
    'cryptocom': cryptocom,
    'currencycom': currencycom,
    'delta': delta,
    'deribit': deribit,
    'digifinex': digifinex,
    'exmo': exmo,
    'fmfwio': fmfwio,
    'gate': gate,
    'gateio': gateio,
    'gemini': gemini,
    'hitbtc': hitbtc,
    'hitbtc3': hitbtc3,
    'hollaex': hollaex,
    'huobi': huobi,
    'huobijp': huobijp,
    'huobipro': huobipro,
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
    'lbank2': lbank2,
    'luno': luno,
    'lykke': lykke,
    'mercado': mercado,
    'mexc': mexc,
    'mexc3': mexc3,
    'ndax': ndax,
    'novadax': novadax,
    'oceanex': oceanex,
    'okcoin': okcoin,
    'okex': okex,
    'okex5': okex5,
    'okx': okx,
    'paymium': paymium,
    'phemex': phemex,
    'poloniex': poloniex,
    'poloniexfutures': poloniexfutures,
    'probit': probit,
    'stex': stex,
    'tidex': tidex,
    'timex': timex,
    'tokocrypto': tokocrypto,
    'upbit': upbit,
    'wavesexchange': wavesexchange,
    'wazirx': wazirx,
    'whitebit': whitebit,
    'woo': woo,
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
    'bitcoincom': bitcoincom$1,
    'bitfinex': bitfinex$1,
    'bitfinex2': bitfinex2$1,
    'bitget': bitget$1,
    'bitmart': bitmart$1,
    'bitmex': bitmex$1,
    'bitopro': bitopro$1,
    'bitpanda': bitpanda$1,
    'bitrue': bitrue$1,
    'bitstamp': bitstamp$1,
    'bittrex': bittrex$1,
    'bitvavo': bitvavo$1,
    'blockchaincom': blockchaincom$1,
    'btcex': btcex$1,
    'bybit': bybit$1,
    'cex': cex$1,
    'coinbaseprime': coinbaseprime$1,
    'coinbasepro': coinbasepro$1,
    'coinex': coinex$1,
    'cryptocom': cryptocom$1,
    'currencycom': currencycom$1,
    'deribit': deribit$1,
    'exmo': exmo$1,
    'gate': gate$1,
    'gateio': gateio$1,
    'gemini': gemini$1,
    'hitbtc': hitbtc$1,
    'hollaex': hollaex$1,
    'huobi': huobi$1,
    'huobijp': huobijp$1,
    'huobipro': huobipro$1,
    'idex': idex$1,
    'independentreserve': independentreserve$1,
    'kraken': kraken$1,
    'krakenfutures': krakenfutures$1,
    'kucoin': kucoin$1,
    'kucoinfutures': kucoinfutures$1,
    'luno': luno$1,
    'mexc': mexc$1,
    'mexc3': mexc3$1,
    'ndax': ndax$1,
    'okcoin': okcoin$1,
    'okex': okex$1,
    'okx': okx$1,
    'phemex': phemex$1,
    'poloniexfutures': poloniexfutures$1,
    'probit': probit$1,
    'upbit': upbit$1,
    'wazirx': wazirx$1,
    'whitebit': whitebit$1,
    'woo': woo$1,
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
exports.DDoSProtection = errors.DDoSProtection;
exports.DuplicateOrderId = errors.DuplicateOrderId;
exports.ExchangeError = errors.ExchangeError;
exports.ExchangeNotAvailable = errors.ExchangeNotAvailable;
exports.InsufficientFunds = errors.InsufficientFunds;
exports.InvalidAddress = errors.InvalidAddress;
exports.InvalidNonce = errors.InvalidNonce;
exports.InvalidOrder = errors.InvalidOrder;
exports.MarginModeAlreadySet = errors.MarginModeAlreadySet;
exports.NetworkError = errors.NetworkError;
exports.NotSupported = errors.NotSupported;
exports.NullResponse = errors.NullResponse;
exports.OnMaintenance = errors.OnMaintenance;
exports.OrderImmediatelyFillable = errors.OrderImmediatelyFillable;
exports.OrderNotCached = errors.OrderNotCached;
exports.OrderNotFillable = errors.OrderNotFillable;
exports.OrderNotFound = errors.OrderNotFound;
exports.PermissionDenied = errors.PermissionDenied;
exports.RateLimitExceeded = errors.RateLimitExceeded;
exports.RequestTimeout = errors.RequestTimeout;
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
exports.bit2c = bit2c;
exports.bitbank = bitbank;
exports.bitbay = bitbay;
exports.bitbns = bitbns;
exports.bitcoincom = bitcoincom;
exports.bitfinex = bitfinex;
exports.bitfinex2 = bitfinex2;
exports.bitflyer = bitflyer;
exports.bitforex = bitforex;
exports.bitget = bitget;
exports.bithumb = bithumb;
exports.bitmart = bitmart;
exports.bitmex = bitmex;
exports.bitopro = bitopro;
exports.bitpanda = bitpanda;
exports.bitrue = bitrue;
exports.bitso = bitso;
exports.bitstamp = bitstamp;
exports.bitstamp1 = bitstamp1;
exports.bittrex = bittrex;
exports.bitvavo = bitvavo;
exports.bkex = bkex;
exports.bl3p = bl3p;
exports.blockchaincom = blockchaincom;
exports.btcalpha = btcalpha;
exports.btcbox = btcbox;
exports.btcex = btcex;
exports.btcmarkets = btcmarkets;
exports.btctradeua = btctradeua;
exports.btcturk = btcturk;
exports.bybit = bybit;
exports.cex = cex;
exports.coinbase = coinbase;
exports.coinbaseprime = coinbaseprime;
exports.coinbasepro = coinbasepro;
exports.coincheck = coincheck;
exports.coinex = coinex;
exports.coinfalcon = coinfalcon;
exports.coinmate = coinmate;
exports.coinone = coinone;
exports.coinsph = coinsph;
exports.coinspot = coinspot;
exports.cryptocom = cryptocom;
exports.currencycom = currencycom;
exports.delta = delta;
exports.deribit = deribit;
exports.digifinex = digifinex;
exports.exmo = exmo;
exports.fmfwio = fmfwio;
exports.gate = gate;
exports.gateio = gateio;
exports.gemini = gemini;
exports.hitbtc = hitbtc;
exports.hitbtc3 = hitbtc3;
exports.hollaex = hollaex;
exports.huobi = huobi;
exports.huobijp = huobijp;
exports.huobipro = huobipro;
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
exports.lbank2 = lbank2;
exports.luno = luno;
exports.lykke = lykke;
exports.mercado = mercado;
exports.mexc = mexc;
exports.mexc3 = mexc3;
exports.ndax = ndax;
exports.novadax = novadax;
exports.oceanex = oceanex;
exports.okcoin = okcoin;
exports.okex = okex;
exports.okex5 = okex5;
exports.okx = okx;
exports.paymium = paymium;
exports.phemex = phemex;
exports.poloniex = poloniex;
exports.poloniexfutures = poloniexfutures;
exports.probit = probit;
exports.stex = stex;
exports.tidex = tidex;
exports.timex = timex;
exports.tokocrypto = tokocrypto;
exports.upbit = upbit;
exports.wavesexchange = wavesexchange;
exports.wazirx = wazirx;
exports.whitebit = whitebit;
exports.woo = woo;
exports.xt = xt;
exports.yobit = yobit;
exports.zaif = zaif;
exports.zonda = zonda;
exports["default"] = ccxt;
exports.exchanges = exchanges;
exports.pro = pro;
exports.version = version;
