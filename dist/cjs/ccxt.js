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
var alpaca = require('./src/alpaca.js');
var apex = require('./src/apex.js');
var ascendex = require('./src/ascendex.js');
var backpack = require('./src/backpack.js');
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
var bitfinex = require('./src/bitfinex.js');
var bitflyer = require('./src/bitflyer.js');
var bitget = require('./src/bitget.js');
var bithumb = require('./src/bithumb.js');
var bitmart = require('./src/bitmart.js');
var bitmex = require('./src/bitmex.js');
var bitopro = require('./src/bitopro.js');
var bitrue = require('./src/bitrue.js');
var bitso = require('./src/bitso.js');
var bitstamp = require('./src/bitstamp.js');
var bitteam = require('./src/bitteam.js');
var bittrade = require('./src/bittrade.js');
var bitvavo = require('./src/bitvavo.js');
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
var coinmate = require('./src/coinmate.js');
var coinmetro = require('./src/coinmetro.js');
var coinone = require('./src/coinone.js');
var coinsph = require('./src/coinsph.js');
var coinspot = require('./src/coinspot.js');
var cryptocom = require('./src/cryptocom.js');
var cryptomus = require('./src/cryptomus.js');
var defx = require('./src/defx.js');
var delta = require('./src/delta.js');
var deribit = require('./src/deribit.js');
var derive = require('./src/derive.js');
var digifinex = require('./src/digifinex.js');
var exmo = require('./src/exmo.js');
var fmfwio = require('./src/fmfwio.js');
var foxbit = require('./src/foxbit.js');
var gate = require('./src/gate.js');
var gateio = require('./src/gateio.js');
var gemini = require('./src/gemini.js');
var hashkey = require('./src/hashkey.js');
var hibachi = require('./src/hibachi.js');
var hitbtc = require('./src/hitbtc.js');
var hollaex = require('./src/hollaex.js');
var htx = require('./src/htx.js');
var huobi = require('./src/huobi.js');
var hyperliquid = require('./src/hyperliquid.js');
var independentreserve = require('./src/independentreserve.js');
var indodax = require('./src/indodax.js');
var kraken = require('./src/kraken.js');
var krakenfutures = require('./src/krakenfutures.js');
var kucoin = require('./src/kucoin.js');
var kucoinfutures = require('./src/kucoinfutures.js');
var latoken = require('./src/latoken.js');
var lbank = require('./src/lbank.js');
var luno = require('./src/luno.js');
var mercado = require('./src/mercado.js');
var mexc = require('./src/mexc.js');
var modetrade = require('./src/modetrade.js');
var myokx = require('./src/myokx.js');
var ndax = require('./src/ndax.js');
var novadax = require('./src/novadax.js');
var oceanex = require('./src/oceanex.js');
var okcoin = require('./src/okcoin.js');
var okx = require('./src/okx.js');
var okxus = require('./src/okxus.js');
var onetrading = require('./src/onetrading.js');
var oxfun = require('./src/oxfun.js');
var p2b = require('./src/p2b.js');
var paradex = require('./src/paradex.js');
var paymium = require('./src/paymium.js');
var phemex = require('./src/phemex.js');
var poloniex = require('./src/poloniex.js');
var probit = require('./src/probit.js');
var timex = require('./src/timex.js');
var tokocrypto = require('./src/tokocrypto.js');
var toobit = require('./src/toobit.js');
var upbit = require('./src/upbit.js');
var wavesexchange = require('./src/wavesexchange.js');
var whitebit = require('./src/whitebit.js');
var woo = require('./src/woo.js');
var woofipro = require('./src/woofipro.js');
var xt = require('./src/xt.js');
var yobit = require('./src/yobit.js');
var zaif = require('./src/zaif.js');
var zonda = require('./src/zonda.js');
var alpaca$1 = require('./src/pro/alpaca.js');
var apex$1 = require('./src/pro/apex.js');
var ascendex$1 = require('./src/pro/ascendex.js');
var backpack$1 = require('./src/pro/backpack.js');
var bequant$1 = require('./src/pro/bequant.js');
var binance$1 = require('./src/pro/binance.js');
var binancecoinm$1 = require('./src/pro/binancecoinm.js');
var binanceus$1 = require('./src/pro/binanceus.js');
var binanceusdm$1 = require('./src/pro/binanceusdm.js');
var bingx$1 = require('./src/pro/bingx.js');
var bitfinex$1 = require('./src/pro/bitfinex.js');
var bitget$1 = require('./src/pro/bitget.js');
var bithumb$1 = require('./src/pro/bithumb.js');
var bitmart$1 = require('./src/pro/bitmart.js');
var bitmex$1 = require('./src/pro/bitmex.js');
var bitopro$1 = require('./src/pro/bitopro.js');
var bitrue$1 = require('./src/pro/bitrue.js');
var bitstamp$1 = require('./src/pro/bitstamp.js');
var bittrade$1 = require('./src/pro/bittrade.js');
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
var defx$1 = require('./src/pro/defx.js');
var deribit$1 = require('./src/pro/deribit.js');
var derive$1 = require('./src/pro/derive.js');
var exmo$1 = require('./src/pro/exmo.js');
var gate$1 = require('./src/pro/gate.js');
var gateio$1 = require('./src/pro/gateio.js');
var gemini$1 = require('./src/pro/gemini.js');
var hashkey$1 = require('./src/pro/hashkey.js');
var hitbtc$1 = require('./src/pro/hitbtc.js');
var hollaex$1 = require('./src/pro/hollaex.js');
var htx$1 = require('./src/pro/htx.js');
var huobi$1 = require('./src/pro/huobi.js');
var hyperliquid$1 = require('./src/pro/hyperliquid.js');
var independentreserve$1 = require('./src/pro/independentreserve.js');
var kraken$1 = require('./src/pro/kraken.js');
var krakenfutures$1 = require('./src/pro/krakenfutures.js');
var kucoin$1 = require('./src/pro/kucoin.js');
var kucoinfutures$1 = require('./src/pro/kucoinfutures.js');
var lbank$1 = require('./src/pro/lbank.js');
var luno$1 = require('./src/pro/luno.js');
var mexc$1 = require('./src/pro/mexc.js');
var modetrade$1 = require('./src/pro/modetrade.js');
var myokx$1 = require('./src/pro/myokx.js');
var ndax$1 = require('./src/pro/ndax.js');
var okcoin$1 = require('./src/pro/okcoin.js');
var okx$1 = require('./src/pro/okx.js');
var okxus$1 = require('./src/pro/okxus.js');
var onetrading$1 = require('./src/pro/onetrading.js');
var oxfun$1 = require('./src/pro/oxfun.js');
var p2b$1 = require('./src/pro/p2b.js');
var paradex$1 = require('./src/pro/paradex.js');
var phemex$1 = require('./src/pro/phemex.js');
var poloniex$1 = require('./src/pro/poloniex.js');
var probit$1 = require('./src/pro/probit.js');
var toobit$1 = require('./src/pro/toobit.js');
var upbit$1 = require('./src/pro/upbit.js');
var whitebit$1 = require('./src/pro/whitebit.js');
var woo$1 = require('./src/pro/woo.js');
var woofipro$1 = require('./src/pro/woofipro.js');
var xt$1 = require('./src/pro/xt.js');

//-----------------------------------------------------------------------------
// this is updated by vss.js when building
const version = '4.5.6';
Exchange["default"].ccxtVersion = version;
const exchanges = {
    'alpaca': alpaca["default"],
    'apex': apex["default"],
    'ascendex': ascendex["default"],
    'backpack': backpack["default"],
    'bequant': bequant["default"],
    'bigone': bigone["default"],
    'binance': binance["default"],
    'binancecoinm': binancecoinm["default"],
    'binanceus': binanceus["default"],
    'binanceusdm': binanceusdm["default"],
    'bingx': bingx["default"],
    'bit2c': bit2c["default"],
    'bitbank': bitbank["default"],
    'bitbns': bitbns["default"],
    'bitfinex': bitfinex["default"],
    'bitflyer': bitflyer["default"],
    'bitget': bitget["default"],
    'bithumb': bithumb["default"],
    'bitmart': bitmart["default"],
    'bitmex': bitmex["default"],
    'bitopro': bitopro["default"],
    'bitrue': bitrue["default"],
    'bitso': bitso["default"],
    'bitstamp': bitstamp["default"],
    'bitteam': bitteam["default"],
    'bittrade': bittrade["default"],
    'bitvavo': bitvavo["default"],
    'blockchaincom': blockchaincom["default"],
    'blofin': blofin["default"],
    'btcalpha': btcalpha["default"],
    'btcbox': btcbox["default"],
    'btcmarkets': btcmarkets["default"],
    'btcturk': btcturk["default"],
    'bybit': bybit["default"],
    'cex': cex["default"],
    'coinbase': coinbase["default"],
    'coinbaseadvanced': coinbaseadvanced["default"],
    'coinbaseexchange': coinbaseexchange["default"],
    'coinbaseinternational': coinbaseinternational["default"],
    'coincatch': coincatch["default"],
    'coincheck': coincheck["default"],
    'coinex': coinex["default"],
    'coinmate': coinmate["default"],
    'coinmetro': coinmetro["default"],
    'coinone': coinone["default"],
    'coinsph': coinsph["default"],
    'coinspot': coinspot["default"],
    'cryptocom': cryptocom["default"],
    'cryptomus': cryptomus["default"],
    'defx': defx["default"],
    'delta': delta["default"],
    'deribit': deribit["default"],
    'derive': derive["default"],
    'digifinex': digifinex["default"],
    'exmo': exmo["default"],
    'fmfwio': fmfwio["default"],
    'foxbit': foxbit["default"],
    'gate': gate["default"],
    'gateio': gateio["default"],
    'gemini': gemini["default"],
    'hashkey': hashkey["default"],
    'hibachi': hibachi["default"],
    'hitbtc': hitbtc["default"],
    'hollaex': hollaex["default"],
    'htx': htx["default"],
    'huobi': huobi["default"],
    'hyperliquid': hyperliquid["default"],
    'independentreserve': independentreserve["default"],
    'indodax': indodax["default"],
    'kraken': kraken["default"],
    'krakenfutures': krakenfutures["default"],
    'kucoin': kucoin["default"],
    'kucoinfutures': kucoinfutures["default"],
    'latoken': latoken["default"],
    'lbank': lbank["default"],
    'luno': luno["default"],
    'mercado': mercado["default"],
    'mexc': mexc["default"],
    'modetrade': modetrade["default"],
    'myokx': myokx["default"],
    'ndax': ndax["default"],
    'novadax': novadax["default"],
    'oceanex': oceanex["default"],
    'okcoin': okcoin["default"],
    'okx': okx["default"],
    'okxus': okxus["default"],
    'onetrading': onetrading["default"],
    'oxfun': oxfun["default"],
    'p2b': p2b["default"],
    'paradex': paradex["default"],
    'paymium': paymium["default"],
    'phemex': phemex["default"],
    'poloniex': poloniex["default"],
    'probit': probit["default"],
    'timex': timex["default"],
    'tokocrypto': tokocrypto["default"],
    'toobit': toobit["default"],
    'upbit': upbit["default"],
    'wavesexchange': wavesexchange["default"],
    'whitebit': whitebit["default"],
    'woo': woo["default"],
    'woofipro': woofipro["default"],
    'xt': xt["default"],
    'yobit': yobit["default"],
    'zaif': zaif["default"],
    'zonda': zonda["default"],
};
const pro = {
    'alpaca': alpaca$1["default"],
    'apex': apex$1["default"],
    'ascendex': ascendex$1["default"],
    'backpack': backpack$1["default"],
    'bequant': bequant$1["default"],
    'binance': binance$1["default"],
    'binancecoinm': binancecoinm$1["default"],
    'binanceus': binanceus$1["default"],
    'binanceusdm': binanceusdm$1["default"],
    'bingx': bingx$1["default"],
    'bitfinex': bitfinex$1["default"],
    'bitget': bitget$1["default"],
    'bithumb': bithumb$1["default"],
    'bitmart': bitmart$1["default"],
    'bitmex': bitmex$1["default"],
    'bitopro': bitopro$1["default"],
    'bitrue': bitrue$1["default"],
    'bitstamp': bitstamp$1["default"],
    'bittrade': bittrade$1["default"],
    'bitvavo': bitvavo$1["default"],
    'blockchaincom': blockchaincom$1["default"],
    'blofin': blofin$1["default"],
    'bybit': bybit$1["default"],
    'cex': cex$1["default"],
    'coinbase': coinbase$1["default"],
    'coinbaseadvanced': coinbaseadvanced$1["default"],
    'coinbaseexchange': coinbaseexchange$1["default"],
    'coinbaseinternational': coinbaseinternational$1["default"],
    'coincatch': coincatch$1["default"],
    'coincheck': coincheck$1["default"],
    'coinex': coinex$1["default"],
    'coinone': coinone$1["default"],
    'cryptocom': cryptocom$1["default"],
    'defx': defx$1["default"],
    'deribit': deribit$1["default"],
    'derive': derive$1["default"],
    'exmo': exmo$1["default"],
    'gate': gate$1["default"],
    'gateio': gateio$1["default"],
    'gemini': gemini$1["default"],
    'hashkey': hashkey$1["default"],
    'hitbtc': hitbtc$1["default"],
    'hollaex': hollaex$1["default"],
    'htx': htx$1["default"],
    'huobi': huobi$1["default"],
    'hyperliquid': hyperliquid$1["default"],
    'independentreserve': independentreserve$1["default"],
    'kraken': kraken$1["default"],
    'krakenfutures': krakenfutures$1["default"],
    'kucoin': kucoin$1["default"],
    'kucoinfutures': kucoinfutures$1["default"],
    'lbank': lbank$1["default"],
    'luno': luno$1["default"],
    'mexc': mexc$1["default"],
    'modetrade': modetrade$1["default"],
    'myokx': myokx$1["default"],
    'ndax': ndax$1["default"],
    'okcoin': okcoin$1["default"],
    'okx': okx$1["default"],
    'okxus': okxus$1["default"],
    'onetrading': onetrading$1["default"],
    'oxfun': oxfun$1["default"],
    'p2b': p2b$1["default"],
    'paradex': paradex$1["default"],
    'phemex': phemex$1["default"],
    'poloniex': poloniex$1["default"],
    'probit': probit$1["default"],
    'toobit': toobit$1["default"],
    'upbit': upbit$1["default"],
    'whitebit': whitebit$1["default"],
    'woo': woo$1["default"],
    'woofipro': woofipro$1["default"],
    'xt': xt$1["default"],
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
exports.RestrictedLocation = errors.RestrictedLocation;
exports.UnsubscribeError = errors.UnsubscribeError;
exports.errors = errors;
exports.alpaca = alpaca["default"];
exports.apex = apex["default"];
exports.ascendex = ascendex["default"];
exports.backpack = backpack["default"];
exports.bequant = bequant["default"];
exports.bigone = bigone["default"];
exports.binance = binance["default"];
exports.binancecoinm = binancecoinm["default"];
exports.binanceus = binanceus["default"];
exports.binanceusdm = binanceusdm["default"];
exports.bingx = bingx["default"];
exports.bit2c = bit2c["default"];
exports.bitbank = bitbank["default"];
exports.bitbns = bitbns["default"];
exports.bitfinex = bitfinex["default"];
exports.bitflyer = bitflyer["default"];
exports.bitget = bitget["default"];
exports.bithumb = bithumb["default"];
exports.bitmart = bitmart["default"];
exports.bitmex = bitmex["default"];
exports.bitopro = bitopro["default"];
exports.bitrue = bitrue["default"];
exports.bitso = bitso["default"];
exports.bitstamp = bitstamp["default"];
exports.bitteam = bitteam["default"];
exports.bittrade = bittrade["default"];
exports.bitvavo = bitvavo["default"];
exports.blockchaincom = blockchaincom["default"];
exports.blofin = blofin["default"];
exports.btcalpha = btcalpha["default"];
exports.btcbox = btcbox["default"];
exports.btcmarkets = btcmarkets["default"];
exports.btcturk = btcturk["default"];
exports.bybit = bybit["default"];
exports.cex = cex["default"];
exports.coinbase = coinbase["default"];
exports.coinbaseadvanced = coinbaseadvanced["default"];
exports.coinbaseexchange = coinbaseexchange["default"];
exports.coinbaseinternational = coinbaseinternational["default"];
exports.coincatch = coincatch["default"];
exports.coincheck = coincheck["default"];
exports.coinex = coinex["default"];
exports.coinmate = coinmate["default"];
exports.coinmetro = coinmetro["default"];
exports.coinone = coinone["default"];
exports.coinsph = coinsph["default"];
exports.coinspot = coinspot["default"];
exports.cryptocom = cryptocom["default"];
exports.cryptomus = cryptomus["default"];
exports.defx = defx["default"];
exports.delta = delta["default"];
exports.deribit = deribit["default"];
exports.derive = derive["default"];
exports.digifinex = digifinex["default"];
exports.exmo = exmo["default"];
exports.fmfwio = fmfwio["default"];
exports.foxbit = foxbit["default"];
exports.gate = gate["default"];
exports.gateio = gateio["default"];
exports.gemini = gemini["default"];
exports.hashkey = hashkey["default"];
exports.hibachi = hibachi["default"];
exports.hitbtc = hitbtc["default"];
exports.hollaex = hollaex["default"];
exports.htx = htx["default"];
exports.huobi = huobi["default"];
exports.hyperliquid = hyperliquid["default"];
exports.independentreserve = independentreserve["default"];
exports.indodax = indodax["default"];
exports.kraken = kraken["default"];
exports.krakenfutures = krakenfutures["default"];
exports.kucoin = kucoin["default"];
exports.kucoinfutures = kucoinfutures["default"];
exports.latoken = latoken["default"];
exports.lbank = lbank["default"];
exports.luno = luno["default"];
exports.mercado = mercado["default"];
exports.mexc = mexc["default"];
exports.modetrade = modetrade["default"];
exports.myokx = myokx["default"];
exports.ndax = ndax["default"];
exports.novadax = novadax["default"];
exports.oceanex = oceanex["default"];
exports.okcoin = okcoin["default"];
exports.okx = okx["default"];
exports.okxus = okxus["default"];
exports.onetrading = onetrading["default"];
exports.oxfun = oxfun["default"];
exports.p2b = p2b["default"];
exports.paradex = paradex["default"];
exports.paymium = paymium["default"];
exports.phemex = phemex["default"];
exports.poloniex = poloniex["default"];
exports.probit = probit["default"];
exports.timex = timex["default"];
exports.tokocrypto = tokocrypto["default"];
exports.toobit = toobit["default"];
exports.upbit = upbit["default"];
exports.wavesexchange = wavesexchange["default"];
exports.whitebit = whitebit["default"];
exports.woo = woo["default"];
exports.woofipro = woofipro["default"];
exports.xt = xt["default"];
exports.yobit = yobit["default"];
exports.zaif = zaif["default"];
exports.zonda = zonda["default"];
exports["default"] = ccxt;
exports.exchanges = exchanges;
exports.pro = pro;
exports.version = version;
