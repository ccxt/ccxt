'use strict';

var phemex$1 = require('./abstract/phemex.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
class phemex extends phemex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'phemex',
            'name': 'Phemex',
            'countries': ['CN'],
            'rateLimit': 120.5,
            'version': 'v1',
            'certified': false,
            'pro': true,
            'hostname': 'api.phemex.com',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistories': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg',
                'test': {
                    'v1': 'https://testnet-api.phemex.com/v1',
                    'v2': 'https://testnet-api.phemex.com',
                    'public': 'https://testnet-api.phemex.com/exchange/public',
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'v1': 'https://{hostname}/v1',
                    'v2': 'https://{hostname}',
                    'public': 'https://{hostname}/exchange/public',
                    'private': 'https://{hostname}',
                },
                'www': 'https://phemex.com',
                'doc': 'https://github.com/phemex/phemex-api-docs',
                'fees': 'https://phemex.com/fees-conditions',
                'referral': {
                    'url': 'https://phemex.com/register?referralCode=EDNVJ',
                    'discount': 0.1,
                },
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '3h': '10800',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
                '1M': '2592000',
                '3M': '7776000',
                '1Y': '31104000',
            },
            'api': {
                'public': {
                    'get': {
                        'cfg/v2/products': 5,
                        'cfg/fundingRates': 5,
                        'products': 5,
                        'nomics/trades': 5,
                        'md/kline': 5,
                        'md/v2/kline/list': 5,
                        'md/v2/kline': 5,
                        'md/v2/kline/last': 5, // perpetual ?symbol=<symbol>&resolution=<resolution>&limit=<limit>
                    },
                },
                'v1': {
                    'get': {
                        'md/orderbook': 5,
                        'md/trade': 5,
                        'md/ticker/24hr': 5,
                        'md/ticker/24hr/all': 5,
                        'md/spot/ticker/24hr': 5,
                        'md/spot/ticker/24hr/all': 5,
                        'exchange/public/products': 5,
                        'api-data/public/data/funding-rate-history': 5,
                    },
                },
                'v2': {
                    'get': {
                        'md/v2/orderbook': 5,
                        'md/v2/trade': 5,
                        'md/v2/ticker/24hr': 5,
                        'md/v2/ticker/24hr/all': 5,
                        'api-data/public/data/funding-rate-history': 5,
                    },
                },
                'private': {
                    'get': {
                        // spot
                        'spot/orders/active': 1,
                        // 'spot/orders/active': 5, // ?symbol=<symbol>&clOrDID=<clOrdID>
                        'spot/orders': 1,
                        'spot/wallets': 5,
                        'exchange/spot/order': 5,
                        'exchange/spot/order/trades': 5,
                        'exchange/order/v2/orderList': 5,
                        'exchange/order/v2/tradingList': 5,
                        // swap
                        'accounts/accountPositions': 1,
                        'g-accounts/accountPositions': 1,
                        'accounts/positions': 25,
                        'api-data/futures/funding-fees': 5,
                        'api-data/g-futures/funding-fees': 5,
                        'api-data/futures/orders': 5,
                        'api-data/g-futures/orders': 5,
                        'api-data/futures/orders/by-order-id': 5,
                        'api-data/g-futures/orders/by-order-id': 5,
                        'api-data/futures/trades': 5,
                        'api-data/g-futures/trades': 5,
                        'api-data/futures/trading-fees': 5,
                        'api-data/g-futures/trading-fees': 5,
                        'g-orders/activeList': 1,
                        'orders/activeList': 1,
                        'exchange/order/list': 5,
                        'exchange/order': 5,
                        // 'exchange/order': 5, // ?symbol=<symbol>&clOrdID=<clOrdID5,clOrdID2>
                        'exchange/order/trade': 5,
                        'phemex-user/users/children': 5,
                        'phemex-user/wallets/v2/depositAddress': 5,
                        'phemex-user/wallets/tradeAccountDetail': 5,
                        'phemex-user/order/closedPositionList': 5,
                        'exchange/margins/transfer': 5,
                        'exchange/wallets/confirm/withdraw': 5,
                        'exchange/wallets/withdrawList': 5,
                        'exchange/wallets/depositList': 5,
                        'exchange/wallets/v2/depositAddress': 5,
                        'api-data/spots/funds': 5,
                        'assets/convert': 5,
                        // transfer
                        'assets/transfer': 5,
                        'assets/spots/sub-accounts/transfer': 5,
                        'assets/futures/sub-accounts/transfer': 5,
                        'assets/quote': 5, // ?fromCurrency=<currency>&toCurrency=<currency>&amountEv=<amount>
                    },
                    'post': {
                        // spot
                        'spot/orders': 1,
                        // swap
                        'orders': 1,
                        'g-orders': 1,
                        'positions/assign': 5,
                        'exchange/wallets/transferOut': 5,
                        'exchange/wallets/transferIn': 5,
                        'exchange/margins': 5,
                        'exchange/wallets/createWithdraw': 5,
                        'exchange/wallets/cancelWithdraw': 5,
                        'exchange/wallets/createWithdrawAddress': 5,
                        // transfer
                        'assets/transfer': 5,
                        'assets/spots/sub-accounts/transfer': 5,
                        'assets/futures/sub-accounts/transfer': 5,
                        'assets/universal-transfer': 5,
                        'assets/convert': 5,
                    },
                    'put': {
                        // spot
                        'spot/orders': 1,
                        // swap
                        'orders/replace': 1,
                        'g-orders/replace': 1,
                        'positions/leverage': 5,
                        'g-positions/leverage': 5,
                        'g-positions/switch-pos-mode-sync': 5,
                        'positions/riskLimit': 5, // ?symbol=<symbol>&riskLimit=<riskLimit>&riskLimitEv=<riskLimitEv>
                    },
                    'delete': {
                        // spot
                        'spot/orders': 2,
                        'spot/orders/all': 2,
                        // 'spot/orders': 5, // ?symbol=<symbol>&clOrdID=<clOrdID>
                        // swap
                        'orders/cancel': 1,
                        'orders': 1,
                        'orders/all': 3,
                        'g-orders/cancel': 1,
                        'g-orders': 1,
                        'g-orders/all': 3, // ?symbol=<symbol>&untriggered=<untriggered>&text=<text>
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0.001'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    // not documented
                    '412': errors.BadRequest,
                    '6001': errors.BadRequest,
                    // documented
                    '19999': errors.BadRequest,
                    '10001': errors.DuplicateOrderId,
                    '10002': errors.OrderNotFound,
                    '10003': errors.CancelPending,
                    '10004': errors.CancelPending,
                    '10005': errors.CancelPending,
                    '11001': errors.InsufficientFunds,
                    '11002': errors.InvalidOrder,
                    '11003': errors.InsufficientFunds,
                    '11004': errors.InvalidOrder,
                    '11005': errors.InsufficientFunds,
                    '11006': errors.ExchangeError,
                    '11007': errors.ExchangeError,
                    '11008': errors.ExchangeError,
                    '11009': errors.ExchangeError,
                    '11010': errors.InsufficientFunds,
                    '11011': errors.InvalidOrder,
                    '11012': errors.InvalidOrder,
                    '11013': errors.InvalidOrder,
                    '11014': errors.InvalidOrder,
                    '11015': errors.InvalidOrder,
                    '11016': errors.BadRequest,
                    '11017': errors.ExchangeError,
                    '11018': errors.ExchangeError,
                    '11019': errors.ExchangeError,
                    '11020': errors.ExchangeError,
                    '11021': errors.ExchangeError,
                    '11022': errors.AccountSuspended,
                    '11023': errors.ExchangeError,
                    '11024': errors.ExchangeError,
                    '11025': errors.BadRequest,
                    '11026': errors.ExchangeError,
                    '11027': errors.BadSymbol,
                    '11028': errors.BadSymbol,
                    '11029': errors.ExchangeError,
                    '11030': errors.ExchangeError,
                    '11031': errors.DDoSProtection,
                    '11032': errors.DDoSProtection,
                    '11033': errors.DuplicateOrderId,
                    '11034': errors.InvalidOrder,
                    '11035': errors.InvalidOrder,
                    '11036': errors.InvalidOrder,
                    '11037': errors.InvalidOrder,
                    '11038': errors.InvalidOrder,
                    '11039': errors.InvalidOrder,
                    '11040': errors.InvalidOrder,
                    '11041': errors.InvalidOrder,
                    '11042': errors.InvalidOrder,
                    '11043': errors.InvalidOrder,
                    '11044': errors.InvalidOrder,
                    '11045': errors.InvalidOrder,
                    '11046': errors.InvalidOrder,
                    '11047': errors.InvalidOrder,
                    '11048': errors.InvalidOrder,
                    '11049': errors.InvalidOrder,
                    '11050': errors.InvalidOrder,
                    '11051': errors.InvalidOrder,
                    '11052': errors.InvalidOrder,
                    '11053': errors.InvalidOrder,
                    '11054': errors.InvalidOrder,
                    '11055': errors.InvalidOrder,
                    '11056': errors.InvalidOrder,
                    '11057': errors.InvalidOrder,
                    '11058': errors.InvalidOrder,
                    '11059': errors.InvalidOrder,
                    '11060': errors.InvalidOrder,
                    '11061': errors.CancelPending,
                    '11062': errors.InvalidOrder,
                    '11063': errors.InvalidOrder,
                    '11064': errors.InvalidOrder,
                    '11065': errors.InvalidOrder,
                    '11066': errors.InvalidOrder,
                    '11067': errors.InvalidOrder,
                    '11068': errors.InvalidOrder,
                    '11069': errors.ExchangeError,
                    '11070': errors.BadSymbol,
                    '11071': errors.InvalidOrder,
                    '11072': errors.InvalidOrder,
                    '11073': errors.InvalidOrder,
                    '11074': errors.InvalidOrder,
                    '11075': errors.InvalidOrder,
                    '11076': errors.InvalidOrder,
                    '11077': errors.InvalidOrder,
                    '11078': errors.InvalidOrder,
                    '11079': errors.InvalidOrder,
                    '11080': errors.InvalidOrder,
                    '11081': errors.InvalidOrder,
                    '11082': errors.InsufficientFunds,
                    '11083': errors.InvalidOrder,
                    '11084': errors.InvalidOrder,
                    '11085': errors.DuplicateOrderId,
                    '11086': errors.InvalidOrder,
                    '11087': errors.InvalidOrder,
                    '11088': errors.InvalidOrder,
                    '11089': errors.InvalidOrder,
                    '11090': errors.InvalidOrder,
                    '11091': errors.InvalidOrder,
                    '11092': errors.InvalidOrder,
                    '11093': errors.InvalidOrder,
                    '11094': errors.InvalidOrder,
                    '11095': errors.InvalidOrder,
                    '11096': errors.InvalidOrder,
                    '11097': errors.BadRequest,
                    '11098': errors.BadRequest,
                    '11099': errors.ExchangeError,
                    '11100': errors.InsufficientFunds,
                    '11101': errors.InsufficientFunds,
                    '11102': errors.BadRequest,
                    '11103': errors.BadRequest,
                    '11104': errors.BadRequest,
                    '11105': errors.InsufficientFunds,
                    '11106': errors.InsufficientFunds,
                    '11107': errors.ExchangeError,
                    '11108': errors.InvalidOrder,
                    '11109': errors.InvalidOrder,
                    '11110': errors.InvalidOrder,
                    '11111': errors.InvalidOrder,
                    '11112': errors.InvalidOrder,
                    '11113': errors.BadRequest,
                    '11114': errors.InvalidOrder,
                    '11115': errors.InvalidOrder,
                    '11116': errors.InvalidOrder,
                    '11117': errors.InvalidOrder,
                    '11118': errors.InvalidOrder,
                    '11119': errors.InvalidOrder,
                    '11120': errors.InvalidOrder,
                    '11121': errors.InvalidOrder,
                    '11122': errors.InvalidOrder,
                    '11123': errors.InvalidOrder,
                    '11124': errors.InvalidOrder,
                    '11125': errors.InvalidOrder,
                    '11126': errors.InvalidOrder,
                    '11128': errors.InvalidOrder,
                    '11129': errors.InvalidOrder,
                    '11130': errors.InvalidOrder,
                    '11131': errors.InvalidOrder,
                    '11132': errors.InvalidOrder,
                    '11133': errors.InvalidOrder,
                    '11134': errors.InvalidOrder,
                    // not documented
                    '30000': errors.BadRequest,
                    '30018': errors.BadRequest,
                    '34003': errors.PermissionDenied,
                    '35104': errors.InsufficientFunds,
                    '39995': errors.RateLimitExceeded,
                    '39996': errors.PermissionDenied, // {"code": "39996","msg": "Access denied."}
                },
                'broad': {
                    '401 Insufficient privilege': errors.PermissionDenied,
                    '401 Request IP mismatch': errors.PermissionDenied,
                    'Failed to find api-key': errors.AuthenticationError,
                    'Missing required parameter': errors.BadRequest,
                    'API Signature verification failed': errors.AuthenticationError,
                    'Api key not found': errors.AuthenticationError, // {"msg":"Api key not found 698dc9e3-6faa-4910-9476-12857e79e198","code":"10500"}
                },
            },
            'options': {
                'brokerId': 'ccxt2022',
                'x-phemex-request-expiry': 60,
                'createOrderByQuoteRequiresPrice': true,
                'networks': {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                },
                'defaultNetworks': {
                    'USDT': 'ETH',
                },
                'defaultSubType': 'linear',
                'accountsByType': {
                    'spot': 'spot',
                    'swap': 'future',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
        });
    }
    parseSafeNumber(value = undefined) {
        if (value === undefined) {
            return value;
        }
        let parts = value.split(',');
        value = parts.join('');
        parts = value.split(' ');
        return this.safeNumber(parts, 0);
    }
    parseSwapMarket(market) {
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "displaySymbol":"BTC / USD",
        //         "indexSymbol":".BTC",
        //         "markSymbol":".MBTC",
        //         "fundingRateSymbol":".BTCFR",
        //         "fundingRate8hSymbol":".BTCFR8H",
        //         "contractUnderlyingAssets":"USD",
        //         "settleCurrency":"BTC",
        //         "quoteCurrency":"USD",
        //         "contractSize":"1 USD",
        //         "lotSize":1,
        //         "tickSize":0.5,
        //         "priceScale":4,
        //         "ratioScale":8,
        //         "pricePrecision":1,
        //         "minPriceEp":5000,
        //         "maxPriceEp":10000000000,
        //         "maxOrderQty":1000000,
        //         "type":"Perpetual",
        //         "status":"Listed",
        //         "tipOrderQty":1000000,
        //         "steps":"50",
        //         "riskLimits":[
        //             {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //             {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //             {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //         ],
        //         "underlyingSymbol":".BTC",
        //         "baseCurrency":"BTC",
        //         "settlementCurrency":"BTC",
        //         "valueScale":8,
        //         "defaultLeverage":0,
        //         "maxLeverage":100,
        //         "initMarginEr":"1000000",
        //         "maintMarginEr":"500000",
        //         "defaultRiskLimitEv":10000000000,
        //         "deleverage":true,
        //         "makerFeeRateEr":-250000,
        //         "takerFeeRateEr":750000,
        //         "fundingInterval":8,
        //         "marketUrl":"https://phemex.com/trade/BTCUSD",
        //         "description":"BTCUSD is a BTC/USD perpetual contract priced on the .BTC Index. Each contract is worth 1 USD of Bitcoin. Funding is paid and received every 8 hours. At UTC time: 00:00, 08:00, 16:00.",
        //     }
        //
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString2(market, 'baseCurrency', 'contractUnderlyingAssets');
        const quoteId = this.safeString(market, 'quoteCurrency');
        const settleId = this.safeString(market, 'settleCurrency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const settle = this.safeCurrencyCode(settleId);
        let inverse = false;
        if (settleId !== quoteId) {
            inverse = true;
        }
        const priceScale = this.safeInteger(market, 'priceScale');
        const ratioScale = this.safeInteger(market, 'ratioScale');
        const valueScale = this.safeInteger(market, 'valueScale');
        const minPriceEp = this.safeString(market, 'minPriceEp');
        const maxPriceEp = this.safeString(market, 'maxPriceEp');
        const makerFeeRateEr = this.safeString(market, 'makerFeeRateEr');
        const takerFeeRateEr = this.safeString(market, 'takerFeeRateEr');
        const status = this.safeString(market, 'status');
        const contractSizeString = this.safeString(market, 'contractSize', ' ');
        let contractSize = undefined;
        if (contractSizeString.indexOf(' ')) {
            // "1 USD"
            // "0.005 ETH"
            const parts = contractSizeString.split(' ');
            contractSize = this.parseNumber(parts[0]);
        }
        else {
            // "1.0"
            contractSize = this.parseNumber(contractSizeString);
        }
        return {
            'id': id,
            'symbol': base + '/' + quote + ':' + settle,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': status === 'Listed',
            'contract': true,
            'linear': !inverse,
            'inverse': inverse,
            'taker': this.parseNumber(this.fromEn(takerFeeRateEr, ratioScale)),
            'maker': this.parseNumber(this.fromEn(makerFeeRateEr, ratioScale)),
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'priceScale': priceScale,
            'valueScale': valueScale,
            'ratioScale': ratioScale,
            'precision': {
                'amount': this.safeNumber2(market, 'lotSize', 'qtyStepSize'),
                'price': this.safeNumber(market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber('1'),
                    'max': this.safeNumber(market, 'maxLeverage'),
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': this.parseNumber(this.fromEn(minPriceEp, priceScale)),
                    'max': this.parseNumber(this.fromEn(maxPriceEp, priceScale)),
                },
                'cost': {
                    'min': undefined,
                    'max': this.parseNumber(this.safeString(market, 'maxOrderQty')),
                },
            },
            'info': market,
        };
    }
    parseSpotMarket(market) {
        //
        //     {
        //         "symbol":"sBTCUSDT",
        //         "code":1001,
        //         "displaySymbol":"BTC / USDT",
        //         "quoteCurrency":"USDT",
        //         "priceScale":8,
        //         "ratioScale":8,
        //         "pricePrecision":2,
        //         "type":"Spot",
        //         "baseCurrency":"BTC",
        //         "baseTickSize":"0.000001 BTC",
        //         "baseTickSizeEv":100,
        //         "quoteTickSize":"0.01 USDT",
        //         "quoteTickSizeEv":1000000,
        //         "minOrderValue":"10 USDT",
        //         "minOrderValueEv":1000000000,
        //         "maxBaseOrderSize":"1000 BTC",
        //         "maxBaseOrderSizeEv":100000000000,
        //         "maxOrderValue":"5,000,000 USDT",
        //         "maxOrderValueEv":500000000000000,
        //         "defaultTakerFee":"0.001",
        //         "defaultTakerFeeEr":100000,
        //         "defaultMakerFee":"0.001",
        //         "defaultMakerFeeEr":100000,
        //         "baseQtyPrecision":6,
        //         "quoteQtyPrecision":2,
        //         "status":"Listed",
        //         "tipOrderQty":2,
        //         "description":"BTCUSDT is a BTC/USDT spot trading pair. Minimum order value is 1 USDT",
        //         "leverage":5
        //         "valueScale":8,
        //     },
        //
        const type = this.safeStringLower(market, 'type');
        const id = this.safeString(market, 'symbol');
        const quoteId = this.safeString(market, 'quoteCurrency');
        const baseId = this.safeString(market, 'baseCurrency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const status = this.safeString(market, 'status');
        const precisionAmount = this.parseSafeNumber(this.safeString(market, 'baseTickSize'));
        const precisionPrice = this.parseSafeNumber(this.safeString(market, 'quoteTickSize'));
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': type,
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': status === 'Listed',
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber(market, 'defaultTakerFee'),
            'maker': this.safeNumber(market, 'defaultMakerFee'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'priceScale': this.safeInteger(market, 'priceScale'),
            'valueScale': this.safeInteger(market, 'valueScale'),
            'ratioScale': this.safeInteger(market, 'ratioScale'),
            'precision': {
                'amount': precisionAmount,
                'price': precisionPrice,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': precisionAmount,
                    'max': this.parseSafeNumber(this.safeString(market, 'maxBaseOrderSize')),
                },
                'price': {
                    'min': precisionPrice,
                    'max': undefined,
                },
                'cost': {
                    'min': this.parseSafeNumber(this.safeString(market, 'minOrderValue')),
                    'max': this.parseSafeNumber(this.safeString(market, 'maxOrderValue')),
                },
            },
            'info': market,
        };
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name phemex#fetchMarkets
         * @description retrieves data on all markets for phemex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const v2Products = await this.publicGetCfgV2Products(params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "ratioScale":8,
        //             "currencies":[
        //                 {"code":1,"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"code":2,"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"code":3,"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             "products":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "displaySymbol":"BTC / USD",
        //                     "indexSymbol":".BTC",
        //                     "markSymbol":".MBTC",
        //                     "fundingRateSymbol":".BTCFR",
        //                     "fundingRate8hSymbol":".BTCFR8H",
        //                     "contractUnderlyingAssets":"USD",
        //                     "settleCurrency":"BTC",
        //                     "quoteCurrency":"USD",
        //                     "contractSize":1.0,
        //                     "lotSize":1,
        //                     "tickSize":0.5,
        //                     "priceScale":4,
        //                     "ratioScale":8,
        //                     "pricePrecision":1,
        //                     "minPriceEp":5000,
        //                     "maxPriceEp":10000000000,
        //                     "maxOrderQty":1000000,
        //                     "type":"Perpetual"
        //                 },
        //                 {
        //                     "symbol":"sBTCUSDT",
        //                     "code":1001,
        //                     "displaySymbol":"BTC / USDT",
        //                     "quoteCurrency":"USDT",
        //                     "priceScale":8,
        //                     "ratioScale":8,
        //                     "pricePrecision":2,
        //                     "type":"Spot",
        //                     "baseCurrency":"BTC",
        //                     "baseTickSize":"0.000001 BTC",
        //                     "baseTickSizeEv":100,
        //                     "quoteTickSize":"0.01 USDT",
        //                     "quoteTickSizeEv":1000000,
        //                     "minOrderValue":"10 USDT",
        //                     "minOrderValueEv":1000000000,
        //                     "maxBaseOrderSize":"1000 BTC",
        //                     "maxBaseOrderSizeEv":100000000000,
        //                     "maxOrderValue":"5,000,000 USDT",
        //                     "maxOrderValueEv":500000000000000,
        //                     "defaultTakerFee":"0.001",
        //                     "defaultTakerFeeEr":100000,
        //                     "defaultMakerFee":"0.001",
        //                     "defaultMakerFeeEr":100000,
        //                     "baseQtyPrecision":6,
        //                     "quoteQtyPrecision":2,
        //                     "status":"Listed",
        //                     "tipOrderQty":2,
        //                     "description":"BTCUSDT is a BTC/USDT spot trading pair. Minimum order value is 1 USDT",
        //                     "leverage":5
        //                 },
        //             ],
        //             "riskLimits":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "steps":"50",
        //                     "riskLimits":[
        //                         {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //                         {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //                         {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //                     ]
        //                 },
        //             ],
        //             "leverages":[
        //                 {"initialMargin":"1.0%","initialMarginEr":1000000,"options":[1,2,3,5,10,25,50,100]},
        //                 {"initialMargin":"1.5%","initialMarginEr":1500000,"options":[1,2,3,5,10,25,50,66]},
        //                 {"initialMargin":"2.0%","initialMarginEr":2000000,"options":[1,2,3,5,10,25,33,50]},
        //             ]
        //         }
        //     }
        //
        const v1Products = await this.v1GetExchangePublicProducts(params);
        const v1ProductsData = this.safeValue(v1Products, 'data', []);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "symbol":"BTCUSD",
        //                 "underlyingSymbol":".BTC",
        //                 "quoteCurrency":"USD",
        //                 "baseCurrency":"BTC",
        //                 "settlementCurrency":"BTC",
        //                 "maxOrderQty":1000000,
        //                 "maxPriceEp":100000000000000,
        //                 "lotSize":1,
        //                 "tickSize":"0.5",
        //                 "contractSize":"1 USD",
        //                 "priceScale":4,
        //                 "ratioScale":8,
        //                 "valueScale":8,
        //                 "defaultLeverage":0,
        //                 "maxLeverage":100,
        //                 "initMarginEr":"1000000",
        //                 "maintMarginEr":"500000",
        //                 "defaultRiskLimitEv":10000000000,
        //                 "deleverage":true,
        //                 "makerFeeRateEr":-250000,
        //                 "takerFeeRateEr":750000,
        //                 "fundingInterval":8,
        //                 "marketUrl":"https://phemex.com/trade/BTCUSD",
        //                 "description":"BTCUSD is a BTC/USD perpetual contract priced on the .BTC Index. Each contract is worth 1 USD of Bitcoin. Funding is paid and received every 8 hours. At UTC time: 00:00, 08:00, 16:00.",
        //                 "type":"Perpetual"
        //             },
        //         ]
        //     }
        //
        const v2ProductsData = this.safeValue(v2Products, 'data', {});
        const products = this.safeValue(v2ProductsData, 'products', []);
        const riskLimits = this.safeValue(v2ProductsData, 'riskLimits', []);
        const currencies = this.safeValue(v2ProductsData, 'currencies', []);
        const riskLimitsById = this.indexBy(riskLimits, 'symbol');
        const v1ProductsById = this.indexBy(v1ProductsData, 'symbol');
        const currenciesByCode = this.indexBy(currencies, 'currency');
        const result = [];
        for (let i = 0; i < products.length; i++) {
            let market = products[i];
            const type = this.safeStringLower(market, 'type');
            if ((type === 'perpetual') || (type === 'perpetualv2')) {
                const id = this.safeString(market, 'symbol');
                const riskLimitValues = this.safeValue(riskLimitsById, id, {});
                market = this.extend(market, riskLimitValues);
                const v1ProductsValues = this.safeValue(v1ProductsById, id, {});
                market = this.extend(market, v1ProductsValues);
                market = this.parseSwapMarket(market);
            }
            else {
                const baseCurrency = this.safeString(market, 'baseCurrency');
                const currencyValues = this.safeValue(currenciesByCode, baseCurrency, {});
                const valueScale = this.safeString(currencyValues, 'valueScale', '8');
                market = this.extend(market, { 'valueScale': valueScale });
                market = this.parseSpotMarket(market);
            }
            result.push(market);
        }
        return result;
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name phemex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCfgV2Products(params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             ...,
        //             "currencies":[
        //                 {"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             ...
        //         }
        //     }
        const data = this.safeValue(response, 'data', {});
        const currencies = this.safeValue(data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString(currency, 'currency');
            const name = this.safeString(currency, 'name');
            const code = this.safeCurrencyCode(id);
            const valueScaleString = this.safeString(currency, 'valueScale');
            const valueScale = parseInt(valueScaleString);
            const minValueEv = this.safeString(currency, 'minValueEv');
            const maxValueEv = this.safeString(currency, 'maxValueEv');
            let minAmount = undefined;
            let maxAmount = undefined;
            let precision = undefined;
            if (valueScale !== undefined) {
                const precisionString = this.parsePrecision(valueScaleString);
                precision = this.parseNumber(precisionString);
                minAmount = this.parseNumber(Precise["default"].stringMul(minValueEv, precisionString));
                maxAmount = this.parseNumber(Precise["default"].stringMul(maxValueEv, precisionString));
            }
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'valueScale': valueScale,
                'networks': {},
            };
        }
        return result;
    }
    customParseBidAsk(bidask, priceKey = 0, amountKey = 1, market = undefined) {
        if (market === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' customParseBidAsk() requires a market argument');
        }
        let amount = this.safeString(bidask, amountKey);
        if (market['spot']) {
            amount = this.fromEv(amount, market);
        }
        return [
            this.parseNumber(this.fromEp(this.safeString(bidask, priceKey), market)),
            this.parseNumber(amount),
        ];
    }
    customParseOrderBook(orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'nonce': undefined,
        };
        const sides = [bidsKey, asksKey];
        for (let i = 0; i < sides.length; i++) {
            const side = sides[i];
            const orders = [];
            const bidasks = this.safeValue(orderbook, side);
            for (let k = 0; k < bidasks.length; k++) {
                orders.push(this.customParseBidAsk(bidasks[k], priceKey, amountKey, market));
            }
            result[side] = orders;
        }
        result[bidsKey] = this.sortBy(result[bidsKey], 0, true);
        result[asksKey] = this.sortBy(result[asksKey], 0);
        return result;
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let method = 'v1GetMdOrderbook';
        if (market['linear'] && market['settle'] === 'USDT') {
            method = 'v2GetMdV2Orderbook';
        }
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "book": {
        //                 "asks": [
        //                     [ 23415000000, 105262000 ],
        //                     [ 23416000000, 147914000 ],
        //                     [ 23419000000, 160914000 ],
        //                 ],
        //                 "bids": [
        //                     [ 23360000000, 32995000 ],
        //                     [ 23359000000, 221887000 ],
        //                     [ 23356000000, 284599000 ],
        //                 ],
        //             },
        //             "depth": 30,
        //             "sequence": 1592059928,
        //             "symbol": "sETHUSDT",
        //             "timestamp": 1592387340020000955,
        //             "type": "snapshot"
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const book = this.safeValue2(result, 'book', 'orderbook_p', {});
        const timestamp = this.safeIntegerProduct(result, 'timestamp', 0.000001);
        const orderbook = this.customParseOrderBook(book, symbol, timestamp, 'bids', 'asks', 0, 1, market);
        orderbook['nonce'] = this.safeInteger(result, 'sequence');
        return orderbook;
    }
    toEn(n, scale) {
        const stringN = n.toString();
        const precise = new Precise["default"](stringN);
        precise.decimals = precise.decimals - scale;
        precise.reduce();
        const preciseString = precise.toString();
        return this.parseToInt(preciseString);
    }
    toEv(amount, market = undefined) {
        if ((amount === undefined) || (market === undefined)) {
            return amount;
        }
        return this.toEn(amount, market['valueScale']);
    }
    toEp(price, market = undefined) {
        if ((price === undefined) || (market === undefined)) {
            return price;
        }
        return this.toEn(price, market['priceScale']);
    }
    fromEn(en, scale) {
        if (en === undefined) {
            return undefined;
        }
        const precise = new Precise["default"](en);
        precise.decimals = this.sum(precise.decimals, scale);
        precise.reduce();
        return precise.toString();
    }
    fromEp(ep, market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn(ep, this.safeInteger(market, 'priceScale'));
    }
    fromEv(ev, market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        return this.fromEn(ev, this.safeInteger(market, 'valueScale'));
    }
    fromEr(er, market = undefined) {
        if ((er === undefined) || (market === undefined)) {
            return er;
        }
        return this.fromEn(er, this.safeInteger(market, 'ratioScale'));
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         1592467200, // timestamp
        //         300, // interval
        //         23376000000, // last
        //         23322000000, // open
        //         23381000000, // high
        //         23315000000, // low
        //         23367000000, // close
        //         208671000, // base volume
        //         48759063370, // quote volume
        //     ]
        //
        let baseVolume = undefined;
        if ((market !== undefined) && market['spot']) {
            baseVolume = this.parseNumber(this.fromEv(this.safeString(ohlcv, 7), market));
        }
        else {
            baseVolume = this.safeNumber(ohlcv, 7);
        }
        return [
            this.safeTimestamp(ohlcv, 0),
            this.parseNumber(this.fromEp(this.safeString(ohlcv, 3), market)),
            this.parseNumber(this.fromEp(this.safeString(ohlcv, 4), market)),
            this.parseNumber(this.fromEp(this.safeString(ohlcv, 5), market)),
            this.parseNumber(this.fromEp(this.safeString(ohlcv, 6), market)),
            baseVolume,
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querykline
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-kline
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since *emulated not supported by the exchange* timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const userLimit = limit;
        const request = {
            'symbol': market['id'],
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const possibleLimitValues = [5, 10, 50, 100, 500, 1000];
        const maxLimit = 1000;
        if (limit === undefined && since === undefined) {
            limit = possibleLimitValues[5];
        }
        if (since !== undefined) {
            // phemex also provides kline query with from/to, however, this interface is NOT recommended and does not work properly.
            // we do not send since param to the exchange, instead we calculate appropriate limit param
            const duration = this.parseTimeframe(timeframe) * 1000;
            const timeDelta = this.milliseconds() - since;
            limit = this.parseToInt(timeDelta / duration); // setting limit to the number of candles after since
        }
        if (limit > maxLimit) {
            limit = maxLimit;
        }
        else {
            for (let i = 0; i < possibleLimitValues.length; i++) {
                if (limit <= possibleLimitValues[i]) {
                    limit = possibleLimitValues[i];
                }
            }
        }
        request['limit'] = limit;
        let response = undefined;
        if (market['linear'] || market['settle'] === 'USDT') {
            response = await this.publicGetMdV2KlineLast(this.extend(request, params));
        }
        else {
            response = await this.publicGetMdV2Kline(this.extend(request, params));
        }
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "total":-1,
        //             "rows":[
        //                 [1592467200,300,23376000000,23322000000,23381000000,23315000000,23367000000,208671000,48759063370],
        //                 [1592467500,300,23367000000,23314000000,23390000000,23311000000,23331000000,234820000,54848948710],
        //                 [1592467800,300,23331000000,23385000000,23391000000,23326000000,23387000000,152931000,35747882250],
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const rows = this.safeValue(data, 'rows', []);
        return this.parseOHLCVs(rows, market, timeframe, since, userLimit);
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "askEp": 943836000000,
        //         "bidEp": 943601000000,
        //         "highEp": 955946000000,
        //         "lastEp": 943803000000,
        //         "lowEp": 924973000000,
        //         "openEp": 948693000000,
        //         "symbol": "sBTCUSDT",
        //         "timestamp": 1592471203505728630,
        //         "turnoverEv": 111822826123103,
        //         "volumeEv": 11880532281
        //     }
        //
        // swap
        //
        //     {
        //         "askEp": 2332500,
        //         "bidEp": 2331000,
        //         "fundingRateEr": 10000,
        //         "highEp": 2380000,
        //         "indexEp": 2329057,
        //         "lastEp": 2331500,
        //         "lowEp": 2274000,
        //         "markEp": 2329232,
        //         "openEp": 2337500,
        //         "openInterest": 1298050,
        //         "predFundingRateEr": 19921,
        //         "symbol": "ETHUSD",
        //         "timestamp": 1592474241582701416,
        //         "turnoverEv": 47228362330,
        //         "volume": 4053863
        //     }
        // linear swap v2
        //
        //     {
        //         "closeRp":"16820.5",
        //         "fundingRateRr":"0.0001",
        //         "highRp":"16962.1",
        //         "indexPriceRp":"16830.15651565",
        //         "lowRp":"16785",
        //         "markPriceRp":"16830.97534951",
        //         "openInterestRv":"1323.596",
        //         "openRp":"16851.7",
        //         "predFundingRateRr":"0.0001",
        //         "symbol":"BTCUSDT",
        //         "timestamp":"1672142789065593096",
        //         "turnoverRv":"124835296.0538",
        //         "volumeRq":"7406.95"
        //     }
        //
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct(ticker, 'timestamp', 0.000001);
        const last = this.fromEp(this.safeString2(ticker, 'lastEp', 'closeRp'), market);
        const quoteVolume = this.fromEv(this.safeString2(ticker, 'turnoverEv', 'turnoverRv'), market);
        let baseVolume = this.safeString(ticker, 'volume');
        if (baseVolume === undefined) {
            baseVolume = this.fromEv(this.safeString2(ticker, 'volumeEv', 'volumeRq'), market);
        }
        const open = this.fromEp(this.safeString(ticker, 'openEp'), market);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.fromEp(this.safeString2(ticker, 'highEp', 'highRp'), market),
            'low': this.fromEp(this.safeString2(ticker, 'lowEp', 'lowRp'), market),
            'bid': this.fromEp(this.safeString(ticker, 'bidEp'), market),
            'bidVolume': undefined,
            'ask': this.fromEp(this.safeString(ticker, 'askEp'), market),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name phemex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query24hrsticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let method = 'v1GetMdSpotTicker24hr';
        if (market['swap']) {
            if (market['inverse'] || market['settle'] === 'USD') {
                method = 'v1GetMdTicker24hr';
            }
            else {
                method = 'v2GetMdV2Ticker24hr';
            }
        }
        const response = await this[method](this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "askEp": 943836000000,
        //             "bidEp": 943601000000,
        //             "highEp": 955946000000,
        //             "lastEp": 943803000000,
        //             "lowEp": 924973000000,
        //             "openEp": 948693000000,
        //             "symbol": "sBTCUSDT",
        //             "timestamp": 1592471203505728630,
        //             "turnoverEv": 111822826123103,
        //             "volumeEv": 11880532281
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "askEp": 2332500,
        //             "bidEp": 2331000,
        //             "fundingRateEr": 10000,
        //             "highEp": 2380000,
        //             "indexEp": 2329057,
        //             "lastEp": 2331500,
        //             "lowEp": 2274000,
        //             "markEp": 2329232,
        //             "openEp": 2337500,
        //             "openInterest": 1298050,
        //             "predFundingRateEr": 19921,
        //             "symbol": "ETHUSD",
        //             "timestamp": 1592474241582701416,
        //             "turnoverEv": 47228362330,
        //             "volume": 4053863
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseTicker(result, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols-2     // spot
         * @see https://phemex-docs.github.io/#query-24-ticker-for-all-symbols             // linear
         * @see https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols       // inverse
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            const first = this.safeValue(symbols, 0);
            market = this.market(first);
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTickers', market, params);
        const query = this.omit(params, 'type');
        let defaultMethod = undefined;
        if (type === 'spot') {
            defaultMethod = 'v1GetMdSpotTicker24hrAll';
        }
        else if (subType === 'inverse') {
            defaultMethod = 'v1GetMdTicker24hrAll';
        }
        else {
            defaultMethod = 'v2GetMdV2Ticker24hrAll';
        }
        const method = this.safeString(this.options, 'fetchTickersMethod', defaultMethod);
        const response = await this[method](query);
        const result = this.safeValue(response, 'result', []);
        return this.parseTickers(result, symbols);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querytrades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let method = 'v1GetMdTrade';
        if (market['linear'] && market['settle'] === 'USDT') {
            method = 'v2GetMdV2Trade';
        }
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "sequence": 1315644947,
        //             "symbol": "BTCUSD",
        //             "trades": [
        //                 [ 1592541746712239749, 13156448570000, "Buy", 93070000, 40173 ],
        //                 [ 1592541740434625085, 13156447110000, "Sell", 93065000, 5000 ],
        //                 [ 1592541732958241616, 13156441390000, "Buy", 93070000, 3460 ],
        //             ],
        //             "type": "snapshot"
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const trades = this.safeValue2(result, 'trades', 'trades_p', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public) spot & contract
        //
        //     [
        //         1592541746712239749,
        //         13156448570000,
        //         "Buy",
        //         93070000,
        //         40173
        //     ]
        //
        // fetchTrades (public) perp
        //
        //     [
        //         1675690986063435800,
        //         "Sell",
        //         "22857.4",
        //         "0.269"
        //     ]
        //
        // fetchMyTrades (private)
        //
        // spot
        //
        //     {
        //         "qtyType": "ByQuote",
        //         "transactTimeNs": 1589450974800550100,
        //         "clOrdID": "8ba59d40-df25-d4b0-14cf-0703f44e9690",
        //         "orderID": "b2b7018d-f02f-4c59-b4cf-051b9c2d2e83",
        //         "symbol": "sBTCUSDT",
        //         "side": "Buy",
        //         "priceEP": 970056000000,
        //         "baseQtyEv": 0,
        //         "quoteQtyEv": 1000000000,
        //         "action": "New",
        //         "execStatus": "MakerFill",
        //         "ordStatus": "Filled",
        //         "ordType": "Limit",
        //         "execInst": "None",
        //         "timeInForce": "GoodTillCancel",
        //         "stopDirection": "UNSPECIFIED",
        //         "tradeType": "Trade",
        //         "stopPxEp": 0,
        //         "execId": "c6bd8979-07ba-5946-b07e-f8b65135dbb1",
        //         "execPriceEp": 970056000000,
        //         "execBaseQtyEv": 103000,
        //         "execQuoteQtyEv": 999157680,
        //         "leavesBaseQtyEv": 0,
        //         "leavesQuoteQtyEv": 0,
        //         "execFeeEv": 0,
        //         "feeRateEr": 0
        //     }
        //
        // swap
        //
        //     {
        //         "transactTimeNs": 1578026629824704800,
        //         "symbol": "BTCUSD",
        //         "currency": "BTC",
        //         "action": "Replace",
        //         "side": "Sell",
        //         "tradeType": "Trade",
        //         "execQty": 700,
        //         "execPriceEp": 71500000,
        //         "orderQty": 700,
        //         "priceEp": 71500000,
        //         "execValueEv": 9790209,
        //         "feeRateEr": -25000,
        //         "execFeeEv": -2447,
        //         "ordType": "Limit",
        //         "execID": "b01671a1-5ddc-5def-b80a-5311522fd4bf",
        //         "orderID": "b63bc982-be3a-45e0-8974-43d6375fb626",
        //         "clOrdID": "uuid-1577463487504",
        //         "execStatus": "MakerFill"
        //     }
        // perpetual
        //     {
        //         "accountID": 9328670003,
        //         "action": "New",
        //         "actionBy": "ByUser",
        //         "actionTimeNs": 1666858780876924611,
        //         "addedSeq": 77751555,
        //         "apRp": "0",
        //         "bonusChangedAmountRv": "0",
        //         "bpRp": "0",
        //         "clOrdID": "c0327a7d-9064-62a9-28f6-2db9aaaa04e0",
        //         "closedPnlRv": "0",
        //         "closedSize": "0",
        //         "code": 0,
        //         "cumFeeRv": "0",
        //         "cumQty": "0",
        //         "cumValueRv": "0",
        //         "curAccBalanceRv": "1508.489893982237",
        //         "curAssignedPosBalanceRv": "24.62786650928",
        //         "curBonusBalanceRv": "0",
        //         "curLeverageRr": "-10",
        //         "curPosSide": "Buy",
        //         "curPosSize": "0.043",
        //         "curPosTerm": 1,
        //         "curPosValueRv": "894.0689",
        //         "curRiskLimitRv": "1000000",
        //         "currency": "USDT",
        //         "cxlRejReason": 0,
        //         "displayQty": "0.003",
        //         "execFeeRv": "0",
        //         "execID": "00000000-0000-0000-0000-000000000000",
        //         "execPriceRp": "20723.7",
        //         "execQty": "0",
        //         "execSeq": 77751555,
        //         "execStatus": "New",
        //         "execValueRv": "0",
        //         "feeRateRr": "0",
        //         "leavesQty": "0.003",
        //         "leavesValueRv": "63.4503",
        //         "message": "No error",
        //         "ordStatus": "New",
        //         "ordType": "Market",
        //         "orderID": "fa64c6f2-47a4-4929-aab4-b7fa9bbc4323",
        //         "orderQty": "0.003",
        //         "pegOffsetValueRp": "0",
        //         "posSide": "Long",
        //         "priceRp": "21150.1",
        //         "relatedPosTerm": 1,
        //         "relatedReqNum": 11,
        //         "side": "Buy",
        //         "slTrigger": "ByMarkPrice",
        //         "stopLossRp": "0",
        //         "stopPxRp": "0",
        //         "symbol": "BTCUSDT",
        //         "takeProfitRp": "0",
        //         "timeInForce": "ImmediateOrCancel",
        //         "tpTrigger": "ByLastPrice",
        //         "tradeType": "Amend",
        //         "transactTimeNs": 1666858780881545305,
        //         "userID": 932867
        //     }
        //
        // swap - USDT
        //
        //     {
        //         "createdAt": 1666226932259,
        //         "symbol": "ETHUSDT",
        //         "currency": "USDT",
        //         "action": 1,
        //         "tradeType": 1,
        //         "execQtyRq": "0.01",
        //         "execPriceRp": "1271.9",
        //         "side": 1,
        //         "orderQtyRq": "0.78",
        //         "priceRp": "1271.9",
        //         "execValueRv": "12.719",
        //         "feeRateRr": "0.0001",
        //         "execFeeRv": "0.0012719",
        //         "ordType": 2,
        //         "execId": "8718cae",
        //         "execStatus": 6
        //     }
        //
        let priceString = undefined;
        let amountString = undefined;
        let timestamp = undefined;
        let id = undefined;
        let side = undefined;
        let costString = undefined;
        let type = undefined;
        let fee = undefined;
        let feeCostString = undefined;
        let feeRateString = undefined;
        let feeCurrencyCode = undefined;
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        let orderId = undefined;
        let takerOrMaker = undefined;
        if (Array.isArray(trade)) {
            const tradeLength = trade.length;
            timestamp = this.safeIntegerProduct(trade, 0, 0.000001);
            if (tradeLength > 4) {
                id = this.safeString(trade, tradeLength - 4);
            }
            side = this.safeStringLower(trade, tradeLength - 3);
            priceString = this.safeString(trade, tradeLength - 2);
            amountString = this.safeString(trade, tradeLength - 1);
            if (typeof trade[tradeLength - 2] === 'number') {
                priceString = this.fromEp(priceString, market);
                amountString = this.fromEv(amountString, market);
            }
        }
        else {
            timestamp = this.safeIntegerProduct(trade, 'transactTimeNs', 0.000001);
            if (timestamp === undefined) {
                timestamp = this.safeInteger(trade, 'createdAt');
            }
            id = this.safeString2(trade, 'execId', 'execID');
            orderId = this.safeString(trade, 'orderID');
            if (market['settle'] === 'USDT') {
                const sideId = this.safeString(trade, 'side');
                side = (sideId === '1') ? 'buy' : 'sell';
                const ordType = this.safeString(trade, 'ordType');
                if (ordType === '1') {
                    type = 'market';
                }
                else if (ordType === '2') {
                    type = 'limit';
                }
                priceString = this.safeString(trade, 'priceRp');
                amountString = this.safeString(trade, 'execQtyRq');
                costString = this.safeString(trade, 'execValueRv');
                feeCostString = this.safeString(trade, 'execFeeRv');
                feeRateString = this.safeString(trade, 'feeRateRr');
                const currencyId = this.safeString(trade, 'currency');
                feeCurrencyCode = this.safeCurrencyCode(currencyId);
            }
            else {
                side = this.safeStringLower(trade, 'side');
                type = this.parseOrderType(this.safeString(trade, 'ordType'));
                const execStatus = this.safeString(trade, 'execStatus');
                if (execStatus === 'MakerFill') {
                    takerOrMaker = 'maker';
                }
                priceString = this.fromEp(this.safeString(trade, 'execPriceEp'), market);
                amountString = this.fromEv(this.safeString(trade, 'execBaseQtyEv'), market);
                amountString = this.safeString(trade, 'execQty', amountString);
                costString = this.fromEv(this.safeString2(trade, 'execQuoteQtyEv', 'execValueEv'), market);
                feeCostString = this.fromEv(this.safeString(trade, 'execFeeEv'), market);
                if (feeCostString !== undefined) {
                    feeRateString = this.fromEr(this.safeString(trade, 'feeRateEr'), market);
                    if (market['spot']) {
                        feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
                    }
                    else {
                        const info = this.safeValue(market, 'info');
                        if (info !== undefined) {
                            const settlementCurrencyId = this.safeString(info, 'settlementCurrency');
                            feeCurrencyCode = this.safeCurrencyCode(settlementCurrencyId);
                        }
                    }
                }
            }
            fee = {
                'cost': feeCostString,
                'rate': feeRateString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    parseSpotBalance(response) {
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":[
        //             {
        //                 "currency":"USDT",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             },
        //             {
        //                 "currency":"ETH",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             }
        //         ]
        //     }
        //
        let timestamp = undefined;
        const result = { 'info': response };
        const data = this.safeValue(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const currency = this.safeValue(this.currencies, code, {});
            const scale = this.safeInteger(currency, 'valueScale', 8);
            const account = this.account();
            const balanceEv = this.safeString(balance, 'balanceEv');
            const lockedTradingBalanceEv = this.safeString(balance, 'lockedTradingBalanceEv');
            const lockedWithdrawEv = this.safeString(balance, 'lockedWithdrawEv');
            const total = this.fromEn(balanceEv, scale);
            const lockedTradingBalance = this.fromEn(lockedTradingBalanceEv, scale);
            const lockedWithdraw = this.fromEn(lockedWithdrawEv, scale);
            const used = Precise["default"].stringAdd(lockedTradingBalance, lockedWithdraw);
            const lastUpdateTimeNs = this.safeIntegerProduct(balance, 'lastUpdateTimeNs', 0.000001);
            timestamp = (timestamp === undefined) ? lastUpdateTimeNs : Math.max(timestamp, lastUpdateTimeNs);
            account['total'] = total;
            account['used'] = used;
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp);
        return this.safeBalance(result);
    }
    parseSwapBalance(response) {
        // usdt
        //   {
        //       info: {
        //         code: '0',
        //         msg: '',
        //         data: {
        //           account: {
        //             userID: '940666',
        //             accountId: '9406660003',
        //             currency: 'USDT',
        //             accountBalanceRv: '99.93143972',
        //             totalUsedBalanceRv: '0.40456',
        //             bonusBalanceRv: '0'
        //           },
        //   }
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "account":{
        //                 "accountId":6192120001,
        //                 "currency":"BTC",
        //                 "accountBalanceEv":1254744,
        //                 "totalUsedBalanceEv":0,
        //                 "bonusBalanceEv":1254744
        //             }
        //         }
        //     }
        //
        const result = { 'info': response };
        const data = this.safeValue(response, 'data', {});
        const balance = this.safeValue(data, 'account', {});
        const currencyId = this.safeString(balance, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const currency = this.currency(code);
        const valueScale = this.safeInteger(currency, 'valueScale', 8);
        const account = this.account();
        const accountBalanceEv = this.safeString2(balance, 'accountBalanceEv', 'accountBalanceRv');
        const totalUsedBalanceEv = this.safeString2(balance, 'totalUsedBalanceEv', 'totalUsedBalanceRv');
        const needsConversion = (code !== 'USDT');
        account['total'] = needsConversion ? this.fromEn(accountBalanceEv, valueScale) : accountBalanceEv;
        account['used'] = needsConversion ? this.fromEn(totalUsedBalanceEv, valueScale) : totalUsedBalanceEv;
        result[code] = account;
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name phemex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        let method = 'privateGetSpotWallets';
        const request = {};
        if (type === 'swap') {
            const code = this.safeString(params, 'code');
            let settle = undefined;
            [settle, params] = this.handleOptionAndParams(params, 'fetchBalance', 'settle');
            if (code !== undefined || settle !== undefined) {
                let coin = undefined;
                if (code !== undefined) {
                    coin = code;
                }
                else {
                    coin = settle;
                }
                const currency = this.currency(coin);
                request['currency'] = currency['id'];
                if (currency['id'] === 'USDT') {
                    method = 'privateGetGAccountsAccountPositions';
                }
                else {
                    method = 'privateGetAccountsAccountPositions';
                }
            }
            else {
                const currency = this.safeString(params, 'currency');
                if (currency === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' fetchBalance() requires a code parameter or a currency or settle parameter for ' + type + ' type');
                }
            }
        }
        params = this.omit(params, ['type', 'code']);
        const response = await this[method](this.extend(request, params));
        //
        // usdt
        //   {
        //       info: {
        //         code: '0',
        //         msg: '',
        //         data: {
        //           account: {
        //             userID: '940666',
        //             accountId: '9406660003',
        //             currency: 'USDT',
        //             accountBalanceRv: '99.93143972',
        //             totalUsedBalanceRv: '0.40456',
        //             bonusBalanceRv: '0'
        //           },
        //   }
        //
        // spot
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":[
        //             {
        //                 "currency":"USDT",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             },
        //             {
        //                 "currency":"ETH",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             }
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "account":{
        //                 "accountId":6192120001,
        //                 "currency":"BTC",
        //                 "accountBalanceEv":1254744,
        //                 "totalUsedBalanceEv":0,
        //                 "bonusBalanceEv":1254744
        //             },
        //             "positions":[
        //                 {
        //                     "accountID":6192120001,
        //                     "symbol":"BTCUSD",
        //                     "currency":"BTC",
        //                     "side":"None",
        //                     "positionStatus":"Normal",
        //                     "crossMargin":false,
        //                     "leverageEr":0,
        //                     "leverage":0E-8,
        //                     "initMarginReqEr":1000000,
        //                     "initMarginReq":0.01000000,
        //                     "maintMarginReqEr":500000,
        //                     "maintMarginReq":0.00500000,
        //                     "riskLimitEv":10000000000,
        //                     "riskLimit":100.00000000,
        //                     "size":0,
        //                     "value":0E-8,
        //                     "valueEv":0,
        //                     "avgEntryPriceEp":0,
        //                     "avgEntryPrice":0E-8,
        //                     "posCostEv":0,
        //                     "posCost":0E-8,
        //                     "assignedPosBalanceEv":0,
        //                     "assignedPosBalance":0E-8,
        //                     "bankruptCommEv":0,
        //                     "bankruptComm":0E-8,
        //                     "bankruptPriceEp":0,
        //                     "bankruptPrice":0E-8,
        //                     "positionMarginEv":0,
        //                     "positionMargin":0E-8,
        //                     "liquidationPriceEp":0,
        //                     "liquidationPrice":0E-8,
        //                     "deleveragePercentileEr":0,
        //                     "deleveragePercentile":0E-8,
        //                     "buyValueToCostEr":1150750,
        //                     "buyValueToCost":0.01150750,
        //                     "sellValueToCostEr":1149250,
        //                     "sellValueToCost":0.01149250,
        //                     "markPriceEp":96359083,
        //                     "markPrice":9635.90830000,
        //                     "markValueEv":0,
        //                     "markValue":null,
        //                     "unRealisedPosLossEv":0,
        //                     "unRealisedPosLoss":null,
        //                     "estimatedOrdLossEv":0,
        //                     "estimatedOrdLoss":0E-8,
        //                     "usedBalanceEv":0,
        //                     "usedBalance":0E-8,
        //                     "takeProfitEp":0,
        //                     "takeProfit":null,
        //                     "stopLossEp":0,
        //                     "stopLoss":null,
        //                     "realisedPnlEv":0,
        //                     "realisedPnl":null,
        //                     "cumRealisedPnlEv":0,
        //                     "cumRealisedPnl":null
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = (type === 'swap') ? this.parseSwapBalance(response) : this.parseSpotBalance(response);
        return result;
    }
    parseOrderStatus(status) {
        const statuses = {
            'Created': 'open',
            'Untriggered': 'open',
            'Deactivated': 'closed',
            'Triggered': 'open',
            'Rejected': 'rejected',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            '1': 'open',
            '5': 'open',
            '6': 'open',
            '7': 'closed',
            '8': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(type) {
        const types = {
            '1': 'market',
            '2': 'limit',
            '3': 'stop',
            '4': 'stopLimit',
            '5': 'market',
            '6': 'limit',
            '7': 'market',
            '8': 'market',
            '9': 'stopLimit',
            '10': 'market',
            'Limit': 'limit',
            'Market': 'market',
        };
        return this.safeString(types, type, type);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'GoodTillCancel': 'GTC',
            'PostOnly': 'PO',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    parseSpotOrder(order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "orderID": "d1d09454-cabc-4a23-89a7-59d43363f16d",
        //         "clOrdID": "309bcd5c-9f6e-4a68-b775-4494542eb5cb",
        //         "priceEp": 0,
        //         "action": "New",
        //         "trigger": "UNSPECIFIED",
        //         "pegPriceType": "UNSPECIFIED",
        //         "stopDirection": "UNSPECIFIED",
        //         "bizError": 0,
        //         "symbol": "sBTCUSDT",
        //         "side": "Buy",
        //         "baseQtyEv": 0,
        //         "ordType": "Limit",
        //         "timeInForce": "GoodTillCancel",
        //         "ordStatus": "Created",
        //         "cumFeeEv": 0,
        //         "cumBaseQtyEv": 0,
        //         "cumQuoteQtyEv": 0,
        //         "leavesBaseQtyEv": 0,
        //         "leavesQuoteQtyEv": 0,
        //         "avgPriceEp": 0,
        //         "cumBaseAmountEv": 0,
        //         "cumQuoteAmountEv": 0,
        //         "quoteQtyEv": 0,
        //         "qtyType": "ByBase",
        //         "stopPxEp": 0,
        //         "pegOffsetValueEp": 0
        //     }
        //
        //     {
        //         "orderID":"99232c3e-3d6a-455f-98cc-2061cdfe91bc",
        //         "stopPxEp":0,
        //         "avgPriceEp":0,
        //         "qtyType":"ByBase",
        //         "leavesBaseQtyEv":0,
        //         "leavesQuoteQtyEv":0,
        //         "baseQtyEv":"1000000000",
        //         "feeCurrency":"4",
        //         "stopDirection":"UNSPECIFIED",
        //         "symbol":"sETHUSDT",
        //         "side":"Buy",
        //         "quoteQtyEv":250000000000,
        //         "priceEp":25000000000,
        //         "ordType":"Limit",
        //         "timeInForce":"GoodTillCancel",
        //         "ordStatus":"Rejected",
        //         "execStatus":"NewRejected",
        //         "createTimeNs":1592675305266037130,
        //         "cumFeeEv":0,
        //         "cumBaseValueEv":0,
        //         "cumQuoteValueEv":0
        //     }
        //
        const id = this.safeString(order, 'orderID');
        let clientOrderId = this.safeString(order, 'clOrdID');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.fromEp(this.safeString(order, 'priceEp'), market);
        const amount = this.fromEv(this.safeString(order, 'baseQtyEv'), market);
        const remaining = this.omitZero(this.fromEv(this.safeString(order, 'leavesBaseQtyEv'), market));
        const filled = this.fromEv(this.safeString2(order, 'cumBaseQtyEv', 'cumBaseValueEv'), market);
        const cost = this.fromEr(this.safeString2(order, 'cumQuoteValueEv', 'quoteQtyEv'), market);
        const average = this.fromEp(this.safeString(order, 'avgPriceEp'), market);
        const status = this.parseOrderStatus(this.safeString(order, 'ordStatus'));
        const side = this.safeStringLower(order, 'side');
        const type = this.parseOrderType(this.safeString(order, 'ordType'));
        const timestamp = this.safeIntegerProduct2(order, 'actionTimeNs', 'createTimeNs', 0.000001);
        let fee = undefined;
        const feeCost = this.fromEv(this.safeString(order, 'cumFeeEv'), market);
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        const timeInForce = this.parseTimeInForce(this.safeString(order, 'timeInForce'));
        const stopPrice = this.parseNumber(this.omitZero(this.fromEp(this.safeString(order, 'stopPxEp', market))));
        const postOnly = (timeInForce === 'PO');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    parseOrderSide(side) {
        const sides = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString(sides, side, side);
    }
    parseSwapOrder(order, market = undefined) {
        //
        //     {
        //         "bizError":0,
        //         "orderID":"7a1ad384-44a3-4e54-a102-de4195a29e32",
        //         "clOrdID":"",
        //         "symbol":"ETHUSD",
        //         "side":"Buy",
        //         "actionTimeNs":1592668973945065381,
        //         "transactTimeNs":0,
        //         "orderType":"Market",
        //         "priceEp":2267500,
        //         "price":226.75000000,
        //         "orderQty":1,
        //         "displayQty":0,
        //         "timeInForce":"ImmediateOrCancel",
        //         "reduceOnly":false,
        //         "closedPnlEv":0,
        //         "closedPnl":0E-8,
        //         "closedSize":0,
        //         "cumQty":0,
        //         "cumValueEv":0,
        //         "cumValue":0E-8,
        //         "leavesQty":1,
        //         "leavesValueEv":11337,
        //         "leavesValue":1.13370000,
        //         "stopDirection":"UNSPECIFIED",
        //         "stopPxEp":0,
        //         "stopPx":0E-8,
        //         "trigger":"UNSPECIFIED",
        //         "pegOffsetValueEp":0,
        //         "execStatus":"PendingNew",
        //         "pegPriceType":"UNSPECIFIED",
        //         "ordStatus":"Created",
        //         "execInst": "ReduceOnly"
        //     }
        //
        // usdt
        // {
        //        "bizError":"0",
        //        "orderID":"bd720dff-5647-4596-aa4e-656bac87aaad",
        //        "clOrdID":"ccxt2022843dffac9477b497",
        //        "symbol":"LTCUSDT",
        //        "side":"Buy",
        //        "actionTimeNs":"1677667878751724052",
        //        "transactTimeNs":"1677667878754017434",
        //        "orderType":"Limit",
        //        "priceRp":"40",
        //        "orderQtyRq":"0.1",
        //        "displayQtyRq":"0.1",
        //        "timeInForce":"GoodTillCancel",
        //        "reduceOnly":false,
        //        "closedPnlRv":"0",
        //        "closedSizeRq":"0",
        //        "cumQtyRq":"0",
        //        "cumValueRv":"0",
        //        "leavesQtyRq":"0.1",
        //        "leavesValueRv":"4",
        //        "stopDirection":"UNSPECIFIED",
        //        "stopPxRp":"0",
        //        "trigger":"UNSPECIFIED",
        //        "pegOffsetValueRp":"0",
        //        "pegOffsetProportionRr":"0",
        //        "execStatus":"New",
        //        "pegPriceType":"UNSPECIFIED",
        //        "ordStatus":"New",
        //        "execInst":"None",
        //        "takeProfitRp":"0",
        //        "stopLossRp":"0"
        //     }
        //
        // v2 orderList
        //    {
        //        "createdAt":"1677686231301",
        //        "symbol":"LTCUSDT",
        //        "orderQtyRq":"0.2",
        //        "side":"1",
        //        "posSide":"3",
        //        "priceRp":"50",
        //        "execQtyRq":"0",
        //        "leavesQtyRq":"0.2",
        //        "execPriceRp":"0",
        //        "orderValueRv":"10",
        //        "leavesValueRv":"10",
        //        "cumValueRv":"0",
        //        "stopDirection":"0",
        //        "stopPxRp":"0",
        //        "trigger":"0",
        //        "actionBy":"1",
        //        "execFeeRv":"0",
        //        "ordType":"2",
        //        "ordStatus":"5",
        //        "clOrdId":"4b3b188",
        //        "orderId":"4b3b1884-87cf-4897-b596-6693b7ed84d1",
        //        "execStatus":"5",
        //        "bizError":"0",
        //        "totalPnlRv":null,
        //        "avgTransactPriceRp":null,
        //        "orderDetailsVos":null,
        //        "tradeType":"0"
        //    }
        //
        const id = this.safeString2(order, 'orderID', 'orderId');
        let clientOrderId = this.safeString2(order, 'clOrdID', 'clOrdId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString(order, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const status = this.parseOrderStatus(this.safeString(order, 'ordStatus'));
        const side = this.parseOrderSide(this.safeStringLower(order, 'side'));
        const type = this.parseOrderType(this.safeString(order, 'orderType'));
        let price = this.safeString(order, 'priceRp');
        if (price === undefined) {
            price = this.fromEp(this.safeString(order, 'priceEp'), market);
        }
        const amount = this.safeNumber2(order, 'orderQty', 'orderQtyRq');
        const filled = this.safeNumber2(order, 'cumQty', 'cumQtyRq');
        const remaining = this.safeNumber2(order, 'leavesQty', 'leavesQtyRq');
        let timestamp = this.safeIntegerProduct(order, 'actionTimeNs', 0.000001);
        if (timestamp === undefined) {
            timestamp = this.safeInteger(order, 'createdAt');
        }
        const cost = this.safeNumber2(order, 'cumValue', 'cumValueRv');
        let lastTradeTimestamp = this.safeIntegerProduct(order, 'transactTimeNs', 0.000001);
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        }
        const timeInForce = this.parseTimeInForce(this.safeString(order, 'timeInForce'));
        const stopPrice = this.safeNumber2(order, 'stopPx', 'stopPxRp');
        const postOnly = (timeInForce === 'PO');
        let reduceOnly = this.safeValue(order, 'reduceOnly');
        const execInst = this.safeString(order, 'execInst');
        if (execInst === 'ReduceOnly') {
            reduceOnly = true;
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        });
    }
    parseOrder(order, market = undefined) {
        const isSwap = this.safeValue(market, 'swap', false);
        const hasPnl = ('closedPnl' in order);
        if (isSwap || hasPnl) {
            return this.parseSwapOrder(order, market);
        }
        return this.parseSpotOrder(order, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name phemex#createOrder
         * @description create a trade order
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const requestSide = this.capitalize(side);
        type = this.capitalize(type);
        const reduceOnly = this.safeValue(params, 'reduceOnly');
        const request = {
            // common
            'symbol': market['id'],
            'side': requestSide,
            'ordType': type, // Market, Limit, Stop, StopLimit, MarketIfTouched, LimitIfTouched (additionally for contract-markets: MarketAsLimit, StopAsLimit, MarketIfTouchedAsLimit)
            // 'stopPxEp': this.toEp (stopPx, market), // for conditional orders
            // 'priceEp': this.toEp (price, market), // required for limit orders
            // 'timeInForce': 'GoodTillCancel', // GoodTillCancel, PostOnly, ImmediateOrCancel, FillOrKill
            // ----------------------------------------------------------------
            // spot
            // 'qtyType': 'ByBase', // ByBase, ByQuote
            // 'quoteQtyEv': this.toEp (cost, market),
            // 'baseQtyEv': this.toEv (amount, market),
            // 'trigger': 'ByLastPrice', // required for conditional orders
            // ----------------------------------------------------------------
            // swap
            // 'clOrdID': this.uuid (), // max length 40
            // 'orderQty': this.amountToPrecision (amount, symbol),
            // 'reduceOnly': false,
            // 'closeOnTrigger': false, // implicit reduceOnly and cancel other orders in the same direction
            // 'takeProfitEp': this.toEp (takeProfit, market),
            // 'stopLossEp': this.toEp (stopLossEp, market),
            // 'triggerType': 'ByMarkPrice', // ByMarkPrice, ByLastPrice
            // 'pegOffsetValueEp': integer, // Trailing offset from current price. Negative value when position is long, positive when position is short
            // 'pegPriceType': 'TrailingStopPeg', // TrailingTakeProfitPeg
            // 'text': 'comment',
            // 'posSide': Position direction - "Merged" for oneway mode , "Long" / "Short" for hedge mode
        };
        const clientOrderId = this.safeString2(params, 'clOrdID', 'clientOrderId');
        if (clientOrderId === undefined) {
            const brokerId = this.safeString(this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clOrdID'] = brokerId + this.uuid16();
            }
        }
        else {
            request['clOrdID'] = clientOrderId;
            params = this.omit(params, ['clOrdID', 'clientOrderId']);
        }
        const stopPrice = this.safeString2(params, 'stopPx', 'stopPrice');
        if (stopPrice !== undefined) {
            if (market['settle'] === 'USDT') {
                request['stopPxRp'] = this.priceToPrecision(symbol, stopPrice);
            }
            else {
                request['stopPxEp'] = this.toEp(stopPrice, market);
            }
        }
        params = this.omit(params, ['stopPx', 'stopPrice']);
        if (market['spot']) {
            let qtyType = this.safeValue(params, 'qtyType', 'ByBase');
            if ((type === 'Market') || (type === 'Stop') || (type === 'MarketIfTouched')) {
                if (price !== undefined) {
                    qtyType = 'ByQuote';
                }
            }
            request['qtyType'] = qtyType;
            if (qtyType === 'ByQuote') {
                let cost = this.safeNumber(params, 'cost');
                params = this.omit(params, 'cost');
                if (this.options['createOrderByQuoteRequiresPrice']) {
                    if (price !== undefined) {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const quoteAmount = Precise["default"].stringMul(amountString, priceString);
                        cost = this.parseNumber(quoteAmount);
                    }
                    else if (cost === undefined) {
                        throw new errors.ArgumentsRequired(this.id + ' createOrder() ' + qtyType + ' requires a price argument or a cost parameter');
                    }
                }
                cost = (cost === undefined) ? amount : cost;
                const costString = cost.toString();
                request['quoteQtyEv'] = this.toEv(costString, market);
            }
            else {
                const amountString = amount.toString();
                request['baseQtyEv'] = this.toEv(amountString, market);
            }
        }
        else if (market['swap']) {
            let posSide = this.safeStringLower(params, 'posSide');
            if (posSide === undefined) {
                posSide = 'Merged';
            }
            posSide = this.capitalize(posSide);
            request['posSide'] = posSide;
            if (reduceOnly !== undefined) {
                request['reduceOnly'] = reduceOnly;
            }
            if (market['settle'] === 'USDT') {
                request['orderQtyRq'] = amount;
            }
            else {
                request['orderQty'] = parseInt(amount);
            }
            if (stopPrice !== undefined) {
                const triggerType = this.safeString(params, 'triggerType', 'ByMarkPrice');
                request['triggerType'] = triggerType;
            }
        }
        if ((type === 'Limit') || (type === 'StopLimit') || (type === 'LimitIfTouched')) {
            if (market['settle'] === 'USDT') {
                request['priceRp'] = this.priceToPrecision(symbol, price);
            }
            else {
                const priceString = this.numberToString(price);
                request['priceEp'] = this.toEp(priceString, market);
            }
        }
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        if (takeProfitPrice !== undefined) {
            if (market['settle'] === 'USDT') {
                request['takeProfitRp'] = this.priceToPrecision(symbol, takeProfitPrice);
            }
            else {
                request['takeProfitEp'] = this.toEp(takeProfitPrice, market);
            }
            params = this.omit(params, 'takeProfitPrice');
        }
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        if (stopLossPrice !== undefined) {
            if (market['settle'] === 'USDT') {
                request['stopLossRp'] = this.priceToPrecision(symbol, stopLossPrice);
            }
            else {
                request['stopLossEp'] = this.toEp(stopLossPrice, market);
            }
            params = this.omit(params, 'stopLossPrice');
        }
        let method = 'privatePostSpotOrders';
        if (market['settle'] === 'USDT') {
            method = 'privatePostGOrders';
        }
        else if (market['contract']) {
            method = 'privatePostOrders';
        }
        params = this.omit(params, 'reduceOnly');
        const response = await this[method](this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": {
        //             "orderID": "d1d09454-cabc-4a23-89a7-59d43363f16d",
        //             "clOrdID": "309bcd5c-9f6e-4a68-b775-4494542eb5cb",
        //             "priceEp": 0,
        //             "action": "New",
        //             "trigger": "UNSPECIFIED",
        //             "pegPriceType": "UNSPECIFIED",
        //             "stopDirection": "UNSPECIFIED",
        //             "bizError": 0,
        //             "symbol": "sBTCUSDT",
        //             "side": "Buy",
        //             "baseQtyEv": 0,
        //             "ordType": "Limit",
        //             "timeInForce": "GoodTillCancel",
        //             "ordStatus": "Created",
        //             "cumFeeEv": 0,
        //             "cumBaseQtyEv": 0,
        //             "cumQuoteQtyEv": 0,
        //             "leavesBaseQtyEv": 0,
        //             "leavesQuoteQtyEv": 0,
        //             "avgPriceEp": 0,
        //             "cumBaseAmountEv": 0,
        //             "cumQuoteAmountEv": 0,
        //             "quoteQtyEv": 0,
        //             "qtyType": "ByBase",
        //             "stopPxEp": 0,
        //             "pegOffsetValueEp": 0
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "bizError":0,
        //             "orderID":"7a1ad384-44a3-4e54-a102-de4195a29e32",
        //             "clOrdID":"",
        //             "symbol":"ETHUSD",
        //             "side":"Buy",
        //             "actionTimeNs":1592668973945065381,
        //             "transactTimeNs":0,
        //             "orderType":"Market",
        //             "priceEp":2267500,
        //             "price":226.75000000,
        //             "orderQty":1,
        //             "displayQty":0,
        //             "timeInForce":"ImmediateOrCancel",
        //             "reduceOnly":false,
        //             "closedPnlEv":0,
        //             "closedPnl":0E-8,
        //             "closedSize":0,
        //             "cumQty":0,
        //             "cumValueEv":0,
        //             "cumValue":0E-8,
        //             "leavesQty":1,
        //             "leavesValueEv":11337,
        //             "leavesValue":1.13370000,
        //             "stopDirection":"UNSPECIFIED",
        //             "stopPxEp":0,
        //             "stopPx":0E-8,
        //             "trigger":"UNSPECIFIED",
        //             "pegOffsetValueEp":0,
        //             "execStatus":"PendingNew",
        //             "pegPriceType":"UNSPECIFIED",
        //             "ordStatus":"Created"
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseOrder(data, market);
    }
    async editOrder(id, symbol, type = undefined, side = undefined, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name phemex#editOrder
         * @description edit a trade order
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#amend-order-by-orderid
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @param {string|undefined} params.posSide either 'Merged' or 'Long' or 'Short'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clOrdID');
        params = this.omit(params, ['clientOrderId', 'clOrdID']);
        const isUSDTSettled = (market['settle'] === 'USDT');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        }
        else {
            request['orderID'] = id;
        }
        if (price !== undefined) {
            if (isUSDTSettled) {
                request['priceRp'] = this.priceToPrecision(market['symbol'], price);
            }
            else {
                request['priceEp'] = this.toEp(price, market);
            }
        }
        // Note the uppercase 'V' in 'baseQtyEV' request. that is exchange's requirement at this moment. However, to avoid mistakes from user side, let's support lowercased 'baseQtyEv' too
        const finalQty = this.safeString(params, 'baseQtyEv');
        params = this.omit(params, ['baseQtyEv']);
        if (finalQty !== undefined) {
            request['baseQtyEV'] = finalQty;
        }
        else if (amount !== undefined) {
            if (isUSDTSettled) {
                request['baseQtyEV'] = this.amountToPrecision(market['symbol'], amount);
            }
            else {
                request['baseQtyEV'] = this.toEv(amount, market);
            }
        }
        const stopPrice = this.safeString2(params, 'stopPx', 'stopPrice');
        if (stopPrice !== undefined) {
            if (isUSDTSettled) {
                request['stopPxRp'] = this.priceToPrecision(symbol, stopPrice);
            }
            else {
                request['stopPxEp'] = this.toEp(stopPrice, market);
            }
        }
        params = this.omit(params, ['stopPx', 'stopPrice']);
        let method = 'privatePutSpotOrders';
        if (isUSDTSettled) {
            method = 'privatePutGOrdersReplace';
            const posSide = this.safeString(params, 'posSide');
            if (posSide === undefined) {
                request['posSide'] = 'Merged';
            }
        }
        else if (market['swap']) {
            method = 'privatePutOrdersReplace';
        }
        const response = await this[method](this.extend(request, params));
        const data = this.safeValue(response, 'data', {});
        return this.parseOrder(data, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#cancelOrder
         * @description cancels an open order
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancel-single-order-by-orderid
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @param {string|undefined} params.posSide either 'Merged' or 'Long' or 'Short'
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clOrdID');
        params = this.omit(params, ['clientOrderId', 'clOrdID']);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        }
        else {
            request['orderID'] = id;
        }
        let method = 'privateDeleteSpotOrders';
        if (market['settle'] === 'USDT') {
            method = 'privateDeleteGOrdersCancel';
            const posSide = this.safeString(params, 'posSide');
            if (posSide === undefined) {
                request['posSide'] = 'Merged';
            }
        }
        else if (market['swap']) {
            method = 'privateDeleteOrdersCancel';
        }
        const response = await this[method](this.extend(request, params));
        const data = this.safeValue(response, 'data', {});
        return this.parseOrder(data, market);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#cancelAllOrders
         * @description cancel all open orders in a market
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancelall
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const request = {
        // 'symbol': market['id'],
        // 'untriggerred': false, // false to cancel non-conditional orders, true to cancel conditional orders
        // 'text': 'up to 40 characters max',
        };
        const market = this.market(symbol);
        let method = 'privateDeleteSpotOrdersAll';
        if (market['settle'] === 'USDT') {
            method = 'privateDeleteGOrdersAll';
        }
        else if (market['swap']) {
            method = 'privateDeleteOrdersAll';
        }
        request['symbol'] = market['id'];
        return await this[method](this.extend(request, params));
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['settle'] === 'USDT') {
            throw new errors.NotSupported(this.id + 'fetchOrder() is not supported yet for USDT settled swap markets'); // https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-user-order-by-orderid-or-query-user-order-by-client-order-id
        }
        const method = market['spot'] ? 'privateGetSpotOrdersActive' : 'privateGetExchangeOrder';
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clOrdID');
        params = this.omit(params, ['clientOrderId', 'clOrdID']);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        }
        else {
            request['orderID'] = id;
        }
        const response = await this[method](this.extend(request, params));
        const data = this.safeValue(response, 'data', {});
        let order = data;
        if (Array.isArray(data)) {
            const numOrders = data.length;
            if (numOrders < 1) {
                if (clientOrderId !== undefined) {
                    throw new errors.OrderNotFound(this.id + ' fetchOrder() ' + symbol + ' order with clientOrderId ' + clientOrderId + ' not found');
                }
                else {
                    throw new errors.OrderNotFound(this.id + ' fetchOrder() ' + symbol + ' order with id ' + id + ' not found');
                }
            }
            order = this.safeValue(data, 0, {});
        }
        return this.parseOrder(order, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = 'privateGetSpotOrders';
        if (market['settle'] === 'USDT') {
            request['currency'] = market['settle'];
            method = 'privateGetExchangeOrderV2OrderList';
        }
        else if (market['swap']) {
            method = 'privateGetExchangeOrderList';
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method](this.extend(request, params));
        const data = this.safeValue(response, 'data', {});
        const rows = this.safeValue(data, 'rows', data);
        return this.parseOrders(rows, market, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryopenorder
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let method = 'privateGetSpotOrders';
        if (market['settle'] === 'USDT') {
            method = 'privateGetGOrdersActiveList';
        }
        else if (market['swap']) {
            method = 'privateGetOrdersActiveList';
        }
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        try {
            response = await this[method](this.extend(request, params));
        }
        catch (e) {
            if (e instanceof errors.OrderNotFound) {
                return [];
            }
            throw e;
        }
        const data = this.safeValue(response, 'data', {});
        if (Array.isArray(data)) {
            return this.parseOrders(data, market, since, limit);
        }
        else {
            const rows = this.safeValue(data, 'rows', []);
            return this.parseOrders(rows, market, since, limit);
        }
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = 'privateGetExchangeSpotOrder';
        if (market['settle'] === 'USDT') {
            request['currency'] = market['settle'];
            method = 'privateGetExchangeOrderV2OrderList';
        }
        else if (market['swap']) {
            method = 'privateGetExchangeOrderList';
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method](this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "total":8,
        //             "rows":[
        //                 {
        //                     "orderID":"99232c3e-3d6a-455f-98cc-2061cdfe91bc",
        //                     "stopPxEp":0,
        //                     "avgPriceEp":0,
        //                     "qtyType":"ByBase",
        //                     "leavesBaseQtyEv":0,
        //                     "leavesQuoteQtyEv":0,
        //                     "baseQtyEv":"1000000000",
        //                     "feeCurrency":"4",
        //                     "stopDirection":"UNSPECIFIED",
        //                     "symbol":"sETHUSDT",
        //                     "side":"Buy",
        //                     "quoteQtyEv":250000000000,
        //                     "priceEp":25000000000,
        //                     "ordType":"Limit",
        //                     "timeInForce":"GoodTillCancel",
        //                     "ordStatus":"Rejected",
        //                     "execStatus":"NewRejected",
        //                     "createTimeNs":1592675305266037130,
        //                     "cumFeeEv":0,
        //                     "cumBaseValueEv":0,
        //                     "cumQuoteValueEv":0
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        if (Array.isArray(data)) {
            return this.parseOrders(data, market, since, limit);
        }
        else {
            const rows = this.safeValue(data, 'rows', []);
            return this.parseOrders(rows, market, since, limit);
        }
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-user-trade
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-user-trade
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let method = 'privateGetExchangeSpotOrderTrades';
        if (market['swap']) {
            method = 'privateGetExchangeOrderTrade';
            if (market['settle'] === 'USDT') {
                method = 'privateGetExchangeOrderV2TradingList';
            }
        }
        const request = {};
        if (limit !== undefined) {
            limit = Math.min(200, limit);
            request['limit'] = limit;
        }
        if (market['settle'] === 'USDT') {
            request['currency'] = 'USDT';
            request['offset'] = 0;
            if (limit === undefined) {
                request['limit'] = 200;
            }
        }
        else {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (market['swap'] && (limit !== undefined)) {
            request['limit'] = limit;
        }
        const response = await this[method](this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "total": 1,
        //             "rows": [
        //                 {
        //                     "qtyType": "ByQuote",
        //                     "transactTimeNs": 1589450974800550100,
        //                     "clOrdID": "8ba59d40-df25-d4b0-14cf-0703f44e9690",
        //                     "orderID": "b2b7018d-f02f-4c59-b4cf-051b9c2d2e83",
        //                     "symbol": "sBTCUSDT",
        //                     "side": "Buy",
        //                     "priceEP": 970056000000,
        //                     "baseQtyEv": 0,
        //                     "quoteQtyEv": 1000000000,
        //                     "action": "New",
        //                     "execStatus": "MakerFill",
        //                     "ordStatus": "Filled",
        //                     "ordType": "Limit",
        //                     "execInst": "None",
        //                     "timeInForce": "GoodTillCancel",
        //                     "stopDirection": "UNSPECIFIED",
        //                     "tradeType": "Trade",
        //                     "stopPxEp": 0,
        //                     "execId": "c6bd8979-07ba-5946-b07e-f8b65135dbb1",
        //                     "execPriceEp": 970056000000,
        //                     "execBaseQtyEv": 103000,
        //                     "execQuoteQtyEv": 999157680,
        //                     "leavesBaseQtyEv": 0,
        //                     "leavesQuoteQtyEv": 0,
        //                     "execFeeEv": 0,
        //                     "feeRateEr": 0
        //                 }
        //             ]
        //         }
        //     }
        //
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "total": 79,
        //             "rows": [
        //                 {
        //                     "transactTimeNs": 1606054879331565300,
        //                     "symbol": "BTCUSD",
        //                     "currency": "BTC",
        //                     "action": "New",
        //                     "side": "Buy",
        //                     "tradeType": "Trade",
        //                     "execQty": 5,
        //                     "execPriceEp": 182990000,
        //                     "orderQty": 5,
        //                     "priceEp": 183870000,
        //                     "execValueEv": 27323,
        //                     "feeRateEr": 75000,
        //                     "execFeeEv": 21,
        //                     "ordType": "Market",
        //                     "execID": "5eee56a4-04a9-5677-8eb0-c2fe22ae3645",
        //                     "orderID": "ee0acb82-f712-4543-a11d-d23efca73197",
        //                     "clOrdID": "",
        //                     "execStatus": "TakerFill"
        //                 },
        //             ]
        //         }
        //     }
        //
        // swap - usdt
        //
        // {
        //     "code": 0,
        //     "msg": "OK",
        //     "data": {
        //         "total": 4,
        //         "rows": [
        //             {
        //                 "createdAt": 1666226932259,
        //                 "symbol": "ETHUSDT",
        //                 "currency": "USDT",
        //                 "action": 1,
        //                 "tradeType": 1,
        //                 "execQtyRq": "0.01",
        //                 "execPriceRp": "1271.9",
        //                 "side": 1,
        //                 "orderQtyRq": "0.78",
        //                 "priceRp": "1271.9",
        //                 "execValueRv": "12.719",
        //                 "feeRateRr": "0.0001",
        //                 "execFeeRv": "0.0012719",
        //                 "ordType": 2,
        //                 "execId": "8718cae",
        //                 "execStatus": 6
        //             },
        //         ]
        //     }
        // }
        //
        const data = this.safeValue(response, 'data', {});
        if (method !== 'privateGetExchangeOrderV2TradingList') {
            const rows = this.safeValue(data, 'rows', []);
            return this.parseTrades(rows, market, since, limit);
        }
        return this.parseTrades(data, market, since, limit);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name phemex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const defaultNetworks = this.safeValue(this.options, 'defaultNetworks');
        const defaultNetwork = this.safeStringUpper(defaultNetworks, code);
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network', defaultNetwork);
        network = this.safeString(networks, network, network);
        if (network === undefined) {
            request['chainName'] = currency['id'];
        }
        else {
            request['chainName'] = network;
            params = this.omit(params, 'network');
        }
        const response = await this.privateGetPhemexUserWalletsV2DepositAddress(this.extend(request, params));
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "address":"0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //             "tag":null
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const address = this.safeString(data, 'address');
        const tag = this.safeString(data, 'tag');
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.privateGetExchangeWalletsDepositList(params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "id":29200,
        //                 "currency":"USDT",
        //                 "currencyCode":3,
        //                 "txHash":"0x0bdbdc47807769a03b158d5753f54dfc58b92993d2f5e818db21863e01238e5d",
        //                 "address":"0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //                 "amountEv":3000000000,
        //                 "confirmations":13,
        //                 "type":"Deposit",
        //                 "status":"Success",
        //                 "createdAt":1592722565000
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTransactions(data, currency, since, limit);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.privateGetExchangeWalletsWithdrawList(params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "address": "1Lxxxxxxxxxxx"
        //                 "amountEv": 200000
        //                 "currency": "BTC"
        //                 "currencyCode": 1
        //                 "expiredTime": 0
        //                 "feeEv": 50000
        //                 "rejectReason": null
        //                 "status": "Succeed"
        //                 "txHash": "44exxxxxxxxxxxxxxxxxxxxxx"
        //                 "withdrawStatus: ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTransactions(data, currency, since, limit);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'Success': 'ok',
            'Succeed': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // withdraw
        //
        //     ...
        //
        // fetchDeposits
        //
        //     {
        //         "id":29200,
        //         "currency":"USDT",
        //         "currencyCode":3,
        //         "txHash":"0x0bdbdc47807769a03b158d5753f54dfc58b92993d2f5e818db21863e01238e5d",
        //         "address":"0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //         "amountEv":3000000000,
        //         "confirmations":13,
        //         "type":"Deposit",
        //         "status":"Success",
        //         "createdAt":1592722565000
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "address": "1Lxxxxxxxxxxx"
        //         "amountEv": 200000
        //         "currency": "BTC"
        //         "currencyCode": 1
        //         "expiredTime": 0
        //         "feeEv": 50000
        //         "rejectReason": null
        //         "status": "Succeed"
        //         "txHash": "44exxxxxxxxxxxxxxxxxxxxxx"
        //         "withdrawStatus: ""
        //     }
        //
        const id = this.safeString(transaction, 'id');
        const address = this.safeString(transaction, 'address');
        const tag = undefined;
        const txid = this.safeString(transaction, 'txHash');
        const currencyId = this.safeString(transaction, 'currency');
        currency = this.safeCurrency(currencyId, currency);
        const code = currency['code'];
        const timestamp = this.safeInteger2(transaction, 'createdAt', 'submitedAt');
        let type = this.safeStringLower(transaction, 'type');
        const feeCost = this.parseNumber(this.fromEn(this.safeString(transaction, 'feeEv'), currency['valueScale']));
        let fee = undefined;
        if (feeCost !== undefined) {
            type = 'withdrawal';
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const amount = this.parseNumber(this.fromEn(this.safeString(transaction, 'amountEv'), currency['valueScale']));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchPositions
         * @description fetch all open positions
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-trading-account-and-positions
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let subType = undefined;
        let method = 'privateGetAccountsAccountPositions';
        let code = this.safeString(params, 'currency');
        let settle = undefined;
        let market = undefined;
        const firstSymbol = this.safeString(symbols, 0);
        if (firstSymbol !== undefined) {
            market = this.market(firstSymbol);
            settle = market['settle'];
            code = market['settle'];
        }
        else {
            [settle, params] = this.handleOptionAndParams(params, 'fetchPositions', 'settle', 'USD');
        }
        [subType, params] = this.handleSubTypeAndParams('fetchPositions', market, params);
        if (settle === 'USDT') {
            code = 'USDT';
            method = 'privateGetGAccountsAccountPositions';
        }
        else if (code === undefined) {
            code = (subType === 'linear') ? 'USD' : 'BTC';
        }
        else {
            params = this.omit(params, 'code');
        }
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "code":0,"msg":"",
        //         "data":{
        //             "account":{
        //                 "accountId":6192120001,
        //                 "currency":"BTC",
        //                 "accountBalanceEv":1254744,
        //                 "totalUsedBalanceEv":0,
        //                 "bonusBalanceEv":1254744
        //             },
        //             "positions":[
        //                 {
        //                     "accountID":6192120001,
        //                     "symbol":"BTCUSD",
        //                     "currency":"BTC",
        //                     "side":"None",
        //                     "positionStatus":"Normal",
        //                     "crossMargin":false,
        //                     "leverageEr":100000000,
        //                     "leverage":1.00000000,
        //                     "initMarginReqEr":100000000,
        //                     "initMarginReq":1.00000000,
        //                     "maintMarginReqEr":500000,
        //                     "maintMarginReq":0.00500000,
        //                     "riskLimitEv":10000000000,
        //                     "riskLimit":100.00000000,
        //                     "size":0,
        //                     "value":0E-8,
        //                     "valueEv":0,
        //                     "avgEntryPriceEp":0,
        //                     "avgEntryPrice":0E-8,
        //                     "posCostEv":0,
        //                     "posCost":0E-8,
        //                     "assignedPosBalanceEv":0,
        //                     "assignedPosBalance":0E-8,
        //                     "bankruptCommEv":0,
        //                     "bankruptComm":0E-8,
        //                     "bankruptPriceEp":0,
        //                     "bankruptPrice":0E-8,
        //                     "positionMarginEv":0,
        //                     "positionMargin":0E-8,
        //                     "liquidationPriceEp":0,
        //                     "liquidationPrice":0E-8,
        //                     "deleveragePercentileEr":0,
        //                     "deleveragePercentile":0E-8,
        //                     "buyValueToCostEr":100225000,
        //                     "buyValueToCost":1.00225000,
        //                     "sellValueToCostEr":100075000,
        //                     "sellValueToCost":1.00075000,
        //                     "markPriceEp":135736070,
        //                     "markPrice":13573.60700000,
        //                     "markValueEv":0,
        //                     "markValue":null,
        //                     "unRealisedPosLossEv":0,
        //                     "unRealisedPosLoss":null,
        //                     "estimatedOrdLossEv":0,
        //                     "estimatedOrdLoss":0E-8,
        //                     "usedBalanceEv":0,
        //                     "usedBalance":0E-8,
        //                     "takeProfitEp":0,
        //                     "takeProfit":null,
        //                     "stopLossEp":0,
        //                     "stopLoss":null,
        //                     "cumClosedPnlEv":0,
        //                     "cumFundingFeeEv":0,
        //                     "cumTransactFeeEv":0,
        //                     "realisedPnlEv":0,
        //                     "realisedPnl":null,
        //                     "cumRealisedPnlEv":0,
        //                     "cumRealisedPnl":null
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const positions = this.safeValue(data, 'positions', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            result.push(this.parsePosition(position));
        }
        return this.filterByArray(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //   {
        //     userID: '811370',
        //     accountID: '8113700002',
        //     symbol: 'ETHUSD',
        //     currency: 'USD',
        //     side: 'Buy',
        //     positionStatus: 'Normal',
        //     crossMargin: false,
        //     leverageEr: '200000000',
        //     leverage: '2.00000000',
        //     initMarginReqEr: '50000000',
        //     initMarginReq: '0.50000000',
        //     maintMarginReqEr: '1000000',
        //     maintMarginReq: '0.01000000',
        //     riskLimitEv: '5000000000',
        //     riskLimit: '500000.00000000',
        //     size: '1',
        //     value: '22.22370000',
        //     valueEv: '222237',
        //     avgEntryPriceEp: '44447400',
        //     avgEntryPrice: '4444.74000000',
        //     posCostEv: '111202',
        //     posCost: '11.12020000',
        //     assignedPosBalanceEv: '111202',
        //     assignedPosBalance: '11.12020000',
        //     bankruptCommEv: '84',
        //     bankruptComm: '0.00840000',
        //     bankruptPriceEp: '22224000',
        //     bankruptPrice: '2222.40000000',
        //     positionMarginEv: '111118',
        //     positionMargin: '11.11180000',
        //     liquidationPriceEp: '22669000',
        //     liquidationPrice: '2266.90000000',
        //     deleveragePercentileEr: '0',
        //     deleveragePercentile: '0E-8',
        //     buyValueToCostEr: '50112500',
        //     buyValueToCost: '0.50112500',
        //     sellValueToCostEr: '50187500',
        //     sellValueToCost: '0.50187500',
        //     markPriceEp: '31332499',
        //     markPrice: '3133.24990000',
        //     markValueEv: '0',
        //     markValue: null,
        //     unRealisedPosLossEv: '0',
        //     unRealisedPosLoss: null,
        //     estimatedOrdLossEv: '0',
        //     estimatedOrdLoss: '0E-8',
        //     usedBalanceEv: '111202',
        //     usedBalance: '11.12020000',
        //     takeProfitEp: '0',
        //     takeProfit: null,
        //     stopLossEp: '0',
        //     stopLoss: null,
        //     cumClosedPnlEv: '-1546',
        //     cumFundingFeeEv: '1605',
        //     cumTransactFeeEv: '8438',
        //     realisedPnlEv: '0',
        //     realisedPnl: null,
        //     cumRealisedPnlEv: '0',
        //     cumRealisedPnl: null,
        //     transactTimeNs: '1641571200001885324',
        //     takerFeeRateEr: '0',
        //     makerFeeRateEr: '0',
        //     term: '6',
        //     lastTermEndTimeNs: '1607711882505745356',
        //     lastFundingTimeNs: '1641571200000000000',
        //     curTermRealisedPnlEv: '-1567',
        //     execSeq: '12112761561'
        //   }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const collateral = this.safeString2(position, 'positionMargin', 'positionMarginRv');
        const notionalString = this.safeString2(position, 'value', 'valueRv');
        const maintenanceMarginPercentageString = this.safeString2(position, 'maintMarginReq', 'maintMarginReqRr');
        const maintenanceMarginString = Precise["default"].stringMul(notionalString, maintenanceMarginPercentageString);
        const initialMarginString = this.safeString2(position, 'assignedPosBalance', 'assignedPosBalanceRv');
        const initialMarginPercentageString = Precise["default"].stringDiv(initialMarginString, notionalString);
        const liquidationPrice = this.safeNumber2(position, 'liquidationPrice', 'liquidationPriceRp');
        const markPriceString = this.safeString2(position, 'markPrice', 'markPriceRp');
        const contracts = this.safeString(position, 'size');
        const contractSize = this.safeValue(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        const leverage = this.safeNumber2(position, 'leverage', 'leverageRr');
        const entryPriceString = this.safeString2(position, 'avgEntryPrice', 'avgEntryPriceRp');
        const rawSide = this.safeString(position, 'side');
        let side = undefined;
        if (rawSide !== undefined) {
            side = (rawSide === 'Buy') ? 'long' : 'short';
        }
        let priceDiff = undefined;
        const currency = this.safeString(position, 'currency');
        if (currency === 'USD') {
            if (side === 'long') {
                priceDiff = Precise["default"].stringSub(markPriceString, entryPriceString);
            }
            else {
                priceDiff = Precise["default"].stringSub(entryPriceString, markPriceString);
            }
        }
        else {
            // inverse
            if (side === 'long') {
                priceDiff = Precise["default"].stringSub(Precise["default"].stringDiv('1', entryPriceString), Precise["default"].stringDiv('1', markPriceString));
            }
            else {
                priceDiff = Precise["default"].stringSub(Precise["default"].stringDiv('1', markPriceString), Precise["default"].stringDiv('1', entryPriceString));
            }
        }
        const unrealizedPnl = Precise["default"].stringMul(Precise["default"].stringMul(priceDiff, contracts), contractSizeString);
        const marginRatio = Precise["default"].stringDiv(maintenanceMarginString, collateral);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': this.parseNumber(contracts),
            'contractSize': contractSize,
            'unrealizedPnl': this.parseNumber(unrealizedPnl),
            'leverage': leverage,
            'liquidationPrice': liquidationPrice,
            'collateral': this.parseNumber(collateral),
            'notional': this.parseNumber(notionalString),
            'markPrice': this.parseNumber(markPriceString),
            'lastPrice': undefined,
            'entryPrice': this.parseNumber(entryPriceString),
            'timestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentageString),
            'maintenanceMargin': this.parseNumber(maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber(maintenanceMarginPercentageString),
            'marginRatio': this.parseNumber(marginRatio),
            'datetime': undefined,
            'marginMode': undefined,
            'side': side,
            'hedged': false,
            'percentage': undefined,
        });
    }
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#futureDataFundingFeesHist
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'limit': 20, // Page size default 20, max 200
            // 'offset': 0, // Page start default 0
        };
        if (limit > 200) {
            throw new errors.BadRequest(this.id + ' fetchFundingHistory() limit argument cannot exceed 200');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let method = 'privateGetApiDataFuturesFundingFees';
        if (market['settle'] === 'USDT') {
            method = 'privateGetApiDataGFuturesFundingFees';
        }
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "BTCUSD",
        //                     "currency": "BTC",
        //                     "execQty": 18,
        //                     "side": "Buy",
        //                     "execPriceEp": 360086455,
        //                     "execValueEv": 49987,
        //                     "fundingRateEr": 10000,
        //                     "feeRateEr": 10000,
        //                     "execFeeEv": 5,
        //                     "createTime": 1651881600000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const rows = this.safeValue(data, 'rows', []);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const timestamp = this.safeInteger(entry, 'createTime');
            result.push({
                'info': entry,
                'symbol': this.safeString(entry, 'symbol'),
                'code': this.safeCurrencyCode(this.safeString(entry, 'currency')),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'id': undefined,
                'amount': this.fromEv(this.safeString(entry, 'execFeeEv'), market),
            });
        }
        return result;
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name phemex#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        let response = {};
        if (!market['linear']) {
            response = await this.v1GetMdTicker24hr(this.extend(request, params));
        }
        else {
            response = await this.v2GetMdV2Ticker24hr(this.extend(request, params));
        }
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "askEp": 2332500,
        //             "bidEp": 2331000,
        //             "fundingRateEr": 10000,
        //             "highEp": 2380000,
        //             "indexEp": 2329057,
        //             "lastEp": 2331500,
        //             "lowEp": 2274000,
        //             "markEp": 2329232,
        //             "openEp": 2337500,
        //             "openInterest": 1298050,
        //             "predFundingRateEr": 19921,
        //             "symbol": "ETHUSD",
        //             "timestamp": 1592474241582701416,
        //             "turnoverEv": 47228362330,
        //             "volume": 4053863
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseFundingRate(result, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "askEp": 2332500,
        //         "bidEp": 2331000,
        //         "fundingRateEr": 10000,
        //         "highEp": 2380000,
        //         "indexEp": 2329057,
        //         "lastEp": 2331500,
        //         "lowEp": 2274000,
        //         "markEp": 2329232,
        //         "openEp": 2337500,
        //         "openInterest": 1298050,
        //         "predFundingRateEr": 19921,
        //         "symbol": "ETHUSD",
        //         "timestamp": 1592474241582701416,
        //         "turnoverEv": 47228362330,
        //         "volume": 4053863
        //     }
        //
        // linear swap v2
        //
        //     {
        //         "closeRp":"16820.5",
        //         "fundingRateRr":"0.0001",
        //         "highRp":"16962.1",
        //         "indexPriceRp":"16830.15651565",
        //         "lowRp":"16785",
        //         "markPriceRp":"16830.97534951",
        //         "openInterestRv":"1323.596",
        //         "openRp":"16851.7",
        //         "predFundingRateRr":"0.0001",
        //         "symbol":"BTCUSDT",
        //         "timestamp":"1672142789065593096",
        //         "turnoverRv":"124835296.0538",
        //         "volumeRq":"7406.95"
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const timestamp = this.safeIntegerProduct(contract, 'timestamp', 0.000001);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.fromEp(this.safeString2(contract, 'markEp', 'markPriceRp'), market),
            'indexPrice': this.fromEp(this.safeString2(contract, 'indexEp', 'indexPriceRp'), market),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': this.fromEr(this.safeString(contract, 'fundingRateEr'), market),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': this.fromEr(this.safeString2(contract, 'predFundingRateEr', 'predFundingRateRr'), market),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async setMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name phemex#setMargin
         * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#assign-position-balance-in-isolated-marign-mode
         * @param {string} symbol unified market symbol of the market to set margin in
         * @param {float} amount the amount to set the margin to
         * @param {object} params parameters specific to the phemex api endpoint
         * @returns {object} A [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'posBalanceEv': this.toEv(amount, market),
        };
        const response = await this.privatePostPositionsAssign(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": "OK"
        //     }
        //
        return this.extend(this.parseMarginModification(response, market), {
            'amount': amount,
        });
    }
    parseMarginStatus(status) {
        const statuses = {
            '0': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseMarginModification(data, market = undefined) {
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": "OK"
        //     }
        //
        market = this.safeMarket(undefined, market);
        const inverse = this.safeValue(market, 'inverse');
        const codeCurrency = inverse ? 'base' : 'quote';
        return {
            'info': data,
            'type': 'set',
            'amount': undefined,
            'total': undefined,
            'code': market[codeCurrency],
            'symbol': this.safeSymbol(undefined, market),
            'status': this.parseMarginStatus(this.safeString(data, 'code')),
        };
    }
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} response from the exchange
         */
        this.checkRequiredSymbol('setMarginMode', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap'] || market['settle'] === 'USDT') {
            throw new errors.BadSymbol(this.id + ' setMarginMode() supports swap (non USDT based) contracts only');
        }
        marginMode = marginMode.toLowerCase();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new errors.BadRequest(this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        let leverage = this.safeInteger(params, 'leverage');
        if (marginMode === 'cross') {
            leverage = 0;
        }
        if (leverage === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a leverage parameter');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePutPositionsLeverage(this.extend(request, params));
    }
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#setPositionMode
         * @description set hedged to true or false for a market
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#switch-position-mode-synchronously
         * @param {bool} hedged set to true to use dualSidePosition
         * @param {string|undefined} symbol not used by binance setPositionMode ()
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         */
        this.checkRequiredArgument('setPositionMode', symbol, 'symbol');
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['settle'] !== 'USDT') {
            throw new errors.BadSymbol(this.id + ' setPositionMode() supports USDT settled markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        if (hedged) {
            request['targetPosMode'] = 'Hedged';
        }
        else {
            request['targetPosMode'] = 'OneWay';
        }
        return await this.privatePutGPositionsSwitchPosModeSync(this.extend(request, params));
    }
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets();
        const response = await this.publicGetCfgV2Products(params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "ratioScale":8,
        //             "currencies":[
        //                 {"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             "products":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "displaySymbol":"BTC / USD",
        //                     "indexSymbol":".BTC",
        //                     "markSymbol":".MBTC",
        //                     "fundingRateSymbol":".BTCFR",
        //                     "fundingRate8hSymbol":".BTCFR8H",
        //                     "contractUnderlyingAssets":"USD",
        //                     "settleCurrency":"BTC",
        //                     "quoteCurrency":"USD",
        //                     "contractSize":1.0,
        //                     "lotSize":1,
        //                     "tickSize":0.5,
        //                     "priceScale":4,
        //                     "ratioScale":8,
        //                     "pricePrecision":1,
        //                     "minPriceEp":5000,
        //                     "maxPriceEp":10000000000,
        //                     "maxOrderQty":1000000,
        //                     "type":"Perpetual"
        //                 },
        //                 {
        //                     "symbol":"sBTCUSDT",
        //                     "displaySymbol":"BTC / USDT",
        //                     "quoteCurrency":"USDT",
        //                     "pricePrecision":2,
        //                     "type":"Spot",
        //                     "baseCurrency":"BTC",
        //                     "baseTickSize":"0.000001 BTC",
        //                     "baseTickSizeEv":100,
        //                     "quoteTickSize":"0.01 USDT",
        //                     "quoteTickSizeEv":1000000,
        //                     "minOrderValue":"10 USDT",
        //                     "minOrderValueEv":1000000000,
        //                     "maxBaseOrderSize":"1000 BTC",
        //                     "maxBaseOrderSizeEv":100000000000,
        //                     "maxOrderValue":"5,000,000 USDT",
        //                     "maxOrderValueEv":500000000000000,
        //                     "defaultTakerFee":"0.001",
        //                     "defaultTakerFeeEr":100000,
        //                     "defaultMakerFee":"0.001",
        //                     "defaultMakerFeeEr":100000,
        //                     "baseQtyPrecision":6,
        //                     "quoteQtyPrecision":2
        //                 },
        //             ],
        //             "riskLimits":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "steps":"50",
        //                     "riskLimits":[
        //                         {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //                         {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //                         {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //                     ]
        //                 },
        //             ],
        //             "leverages":[
        //                 {"initialMargin":"1.0%","initialMarginEr":1000000,"options":[1,2,3,5,10,25,50,100]},
        //                 {"initialMargin":"1.5%","initialMarginEr":1500000,"options":[1,2,3,5,10,25,50,66]},
        //                 {"initialMargin":"2.0%","initialMarginEr":2000000,"options":[1,2,3,5,10,25,33,50]},
        //             ]
        //         }
        //     }
        //
        //
        const data = this.safeValue(response, 'data', {});
        const riskLimits = this.safeValue(data, 'riskLimits');
        return this.parseLeverageTiers(riskLimits, symbols, 'symbol');
    }
    parseMarketLeverageTiers(info, market = undefined) {
        /**
         * @param {object} info Exchange market response for 1 market
         * @param {object} market CCXT market
         */
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "steps":"50",
        //         "riskLimits":[
        //             {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //             {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //             {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //         ]
        //     },
        //
        market = this.safeMarket(undefined, market);
        const riskLimits = (market['info']['riskLimits']);
        const tiers = [];
        let minNotional = 0;
        for (let i = 0; i < riskLimits.length; i++) {
            const tier = riskLimits[i];
            const maxNotional = this.safeInteger(tier, 'limit');
            tiers.push({
                'tier': this.sum(i, 1),
                'currency': market['settle'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeString(tier, 'maintenanceMargin'),
                'maxLeverage': undefined,
                'info': tier,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        const requestPath = '/' + this.implodeParams(path, params);
        let url = requestPath;
        let queryString = '';
        if ((method === 'GET') || (method === 'DELETE') || (method === 'PUT') || (url === '/positions/assign')) {
            if (Object.keys(query).length) {
                queryString = this.urlencodeWithArrayRepeat(query);
                url += '?' + queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.seconds();
            const xPhemexRequestExpiry = this.safeInteger(this.options, 'x-phemex-request-expiry', 60);
            const expiry = this.sum(timestamp, xPhemexRequestExpiry);
            const expiryString = expiry.toString();
            headers = {
                'x-phemex-access-token': this.apiKey,
                'x-phemex-request-expiry': expiryString,
            };
            let payload = '';
            if (method === 'POST') {
                payload = this.json(params);
                body = payload;
                headers['Content-Type'] = 'application/json';
            }
            const auth = requestPath + queryString + expiryString + payload;
            headers['x-phemex-request-signature'] = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        }
        url = this.implodeHostname(this.urls['api'][api]) + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#setLeverage
         * @description set the level of leverage for a market
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#set-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @param {bool} params.hedged set to true if hedged position mode is enabled (by default long and short leverage are set to the same value)
         * @param {float} params.longLeverageRr *hedged mode only* set the leverage for long positions
         * @param {float} params.shortLeverageRr *hedged mode only* set the leverage for short positions
         * @returns {object} response from the exchange
         */
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 100)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between 1 and 100');
        }
        await this.loadMarkets();
        const isHedged = this.safeValue(params, 'hedged', false);
        const longLeverageRr = this.safeInteger(params, 'longLeverageRr');
        const shortLeverageRr = this.safeInteger(params, 'shortLeverageRr');
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['settle'] === 'USDT') {
            if (!isHedged && longLeverageRr === undefined && shortLeverageRr === undefined) {
                request['leverageRr'] = leverage;
            }
            else {
                const long = (longLeverageRr !== undefined) ? longLeverageRr : leverage;
                const short = (shortLeverageRr !== undefined) ? shortLeverageRr : leverage;
                request['longLeverageRr'] = long;
                request['shortLeverageRr'] = short;
            }
            response = await this.privatePutGPositionsLeverage(this.extend(request, params));
        }
        else {
            request['leverage'] = leverage;
            response = await this.privatePutPositionsLeverage(this.extend(request, params));
        }
        return response;
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name phemex#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @param {string|undefined} params.bizType for transferring between main and sub-acounts either 'SPOT' or 'PERPETUAL' default is 'SPOT'
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, toAccount);
        const scaledAmmount = this.toEv(amount, currency);
        let direction = undefined;
        let transfer = undefined;
        if (fromId === 'spot' && toId === 'future') {
            direction = 2;
        }
        else if (fromId === 'future' && toId === 'spot') {
            direction = 1;
        }
        if (direction !== undefined) {
            const request = {
                'currency': currency['id'],
                'moveOp': direction,
                'amountEv': scaledAmmount,
            };
            const response = await this.privatePostAssetsTransfer(this.extend(request, params));
            //
            //     {
            //         code: '0',
            //         msg: 'OK',
            //         data: {
            //             linkKey: '8564eba4-c9ec-49d6-9b8c-2ec5001a0fb9',
            //             userId: '4018340',
            //             currency: 'USD',
            //             amountEv: '10',
            //             side: '2',
            //             status: '10'
            //         }
            //     }
            //
            const data = this.safeValue(response, 'data', {});
            transfer = this.parseTransfer(data, currency);
        }
        else { // sub account transfer
            const request = {
                'fromUserId': fromId,
                'toUserId': toId,
                'amountEv': scaledAmmount,
                'currency': currency['id'],
                'bizType': this.safeString(params, 'bizType', 'SPOT'),
            };
            const response = await this.privatePostAssetsUniversalTransfer(this.extend(request, params));
            //
            //     {
            //         code: '0',
            //         msg: 'OK',
            //         data: 'API-923db826-aaaa-aaaa-aaaa-4d98c3a7c9fd'
            //     }
            //
            transfer = this.parseTransfer(response);
        }
        const transferOptions = this.safeValue(this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue(transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            if (transfer['fromAccount'] === undefined) {
                transfer['fromAccount'] = fromAccount;
            }
            if (transfer['toAccount'] === undefined) {
                transfer['toAccount'] = toAccount;
            }
            if (transfer['amount'] === undefined) {
                transfer['amount'] = amount;
            }
            if (transfer['currency'] === undefined) {
                transfer['currency'] = code;
            }
        }
        return transfer;
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTransfers() requires a code argument');
        }
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetsTransfer(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "rows": [
        //                 {
        //                     "linkKey": "87c071a3-8628-4ac2-aca1-6ce0d1fad66c",
        //                     "userId": 4148428,
        //                     "currency": "BTC",
        //                     "amountEv": 67932,
        //                     "side": 2,
        //                     "status": 10,
        //                     "createTime": 1652832467000,
        //                     "bizType": 10
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const transfers = this.safeValue(data, 'rows', []);
        return this.parseTransfers(transfers, currency, since, limit);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         linkKey: '8564eba4-c9ec-49d6-9b8c-2ec5001a0fb9',
        //         userId: '4018340',
        //         currency: 'USD',
        //         amountEv: '10',
        //         side: '2',
        //         status: '10'
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "linkKey": "87c071a3-8628-4ac2-aca1-6ce0d1fad66c",
        //         "userId": 4148428,
        //         "currency": "BTC",
        //         "amountEv": 67932,
        //         "side": 2,
        //         "status": 10,
        //         "createTime": 1652832467000,
        //         "bizType": 10
        //     }
        //
        const id = this.safeString(transfer, 'linkKey');
        const status = this.safeString(transfer, 'status');
        const amountEv = this.safeString(transfer, 'amountEv');
        const amountTransfered = this.fromEv(amountEv, currency);
        const currencyId = this.safeString(transfer, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const side = this.safeInteger(transfer, 'side');
        let fromId = undefined;
        let toId = undefined;
        if (side === 1) {
            fromId = 'swap';
            toId = 'spot';
        }
        else if (side === 2) {
            fromId = 'spot';
            toId = 'swap';
        }
        const timestamp = this.safeInteger(transfer, 'createTime');
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': amountTransfered,
            'fromAccount': fromId,
            'toAccount': toId,
            'status': this.parseTransferStatus(status),
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            '3': 'rejected',
            '6': 'canceled',
            '10': 'ok',
            '11': 'failed', // 'Failed',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        this.checkRequiredSymbol('fetchFundingRateHistory', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const isUsdtSettled = market['settle'] === 'USDT';
        if (!market['swap']) {
            throw new errors.BadRequest(this.id + ' fetchFundingRateHistory() supports swap contracts only');
        }
        let customSymbol = undefined;
        if (isUsdtSettled) {
            customSymbol = '.' + market['id'] + 'FR8H'; // phemex requires a custom symbol for funding rate history
        }
        else {
            customSymbol = '.' + market['baseId'] + 'FR8H';
        }
        const request = {
            'symbol': customSymbol,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (isUsdtSettled) {
            response = await this.v2GetApiDataPublicDataFundingRateHistory(this.extend(request, params));
        }
        else {
            response = await this.v1GetApiDataPublicDataFundingRateHistory(this.extend(request, params));
        }
        //
        //    {
        //        "code":"0",
        //        "msg":"OK",
        //        "data":{
        //           "rows":[
        //              {
        //                 "symbol":".BTCUSDTFR8H",
        //                 "fundingRate":"0.0001",
        //                 "fundingTime":"1682064000000",
        //                 "intervalSeconds":"28800"
        //              }
        //           ]
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        const rates = this.safeValue(data, 'rows');
        const result = [];
        for (let i = 0; i < rates.length; i++) {
            const item = rates[i];
            const timestamp = this.safeInteger(item, 'fundingTime');
            result.push({
                'info': item,
                'symbol': symbol,
                'fundingRate': this.safeNumber(item, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"code":30018,"msg":"phemex.data.size.uplimt","data":null}
        //     {"code":412,"msg":"Missing parameter - resolution","data":null}
        //     {"code":412,"msg":"Missing parameter - to","data":null}
        //     {"error":{"code":6001,"message":"invalid argument"},"id":null,"result":null}
        //
        const error = this.safeValue(response, 'error', response);
        const errorCode = this.safeString(error, 'code');
        const message = this.safeString(error, 'msg');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = phemex;
