'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var aster$1 = require('./abstract/aster.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var crypto = require('./base/functions/crypto.js');
var sha3 = require('./static_dependencies/noble-hashes/sha3.js');
var secp256k1 = require('./static_dependencies/noble-curves/secp256k1.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------xs
/**
 * @class aster
 * @augments Exchange
 */
class aster extends aster$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'aster',
            'name': 'Aster',
            'countries': ['US'],
            // 3 req/s for free
            // 150 req/s for subscribers: https://aster.markets/data
            // for brokers: https://aster.markets/docs/api-references/broker-api/#authentication-and-rate-limit
            'rateLimit': 333,
            'hostname': 'aster.markets',
            'certified': false,
            'pro': true,
            'dex': true,
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/4982201b-73cd-4d7a-8907-e69e239e9609',
                'www': 'https://www.asterdex.com/en',
                'api': {
                    'fapiPublic': 'https://fapi.asterdex.com/fapi',
                    'fapiPrivate': 'https://fapi.asterdex.com/fapi',
                    'sapiPublic': 'https://sapi.asterdex.com/api',
                    'sapiPrivate': 'https://sapi.asterdex.com/api',
                },
                'doc': 'https://github.com/asterdex/api-docs',
                'fees': 'https://docs.asterdex.com/product/asterex-simple/fees-and-slippage',
                'referral': {
                    'url': 'https://www.asterdex.com/en/referral/aA1c2B',
                    'discount': 0.1,
                },
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'editOrders': false,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': 'emulated',
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingInterval': 'emulated',
                'fetchFundingIntervals': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': 'emulated',
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': 'emulated',
                'fetchLeverages': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': true,
                'fetchMarginMode': 'emulated',
                'fetchMarginModes': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': 'emulated',
                'fetchTransactionFee': 'emulated',
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'api': {
                'fapiPublic': {
                    'get': [
                        'v1/ping',
                        'v1/time',
                        'v1/exchangeInfo',
                        'v1/depth',
                        'v1/trades',
                        'v1/historicalTrades',
                        'v1/aggTrades',
                        'v1/klines',
                        'v1/indexPriceKlines',
                        'v1/markPriceKlines',
                        'v1/premiumIndex',
                        'v1/fundingRate',
                        'v1/fundingInfo',
                        'v1/ticker/24hr',
                        'v1/ticker/price',
                        'v1/ticker/bookTicker',
                        'v1/adlQuantile',
                        'v1/forceOrders',
                    ],
                    'post': [
                        'v1/listenKey',
                    ],
                    'put': [
                        'v1/listenKey',
                    ],
                    'delete': [
                        'v1/listenKey',
                    ],
                },
                'fapiPrivate': {
                    'get': [
                        'v1/positionSide/dual',
                        'v1/multiAssetsMargin',
                        'v1/order',
                        'v1/openOrder',
                        'v1/openOrders',
                        'v1/allOrders',
                        'v2/balance',
                        'v3/balance',
                        'v3/account',
                        'v4/account',
                        'v1/positionMargin/history',
                        'v2/positionRisk',
                        'v3/positionRisk',
                        'v1/userTrades',
                        'v1/income',
                        'v1/leverageBracket',
                        'v1/commissionRate',
                    ],
                    'post': [
                        'v1/positionSide/dual',
                        'v1/multiAssetsMargin',
                        'v1/order',
                        'v1/order/test',
                        'v1/batchOrders',
                        'v1/asset/wallet/transfer',
                        'v1/countdownCancelAll',
                        'v1/leverage',
                        'v1/marginType',
                        'v1/positionMargin',
                    ],
                    'delete': [
                        'v1/order',
                        'v1/allOpenOrders',
                        'v1/batchOrders',
                    ],
                },
                'sapiPublic': {
                    'get': [
                        'v1/ping',
                        'v1/time',
                        'v1/exchangeInfo',
                        'v1/depth',
                        'v1/trades',
                        'v1/historicalTrades',
                        'v1/aggTrades',
                        'v1/klines',
                        'v1/ticker/24hr',
                        'v1/ticker/price',
                        'v1/ticker/bookTicker',
                        'v1/aster/withdraw/estimateFee',
                    ],
                    'post': [
                        'v1/getNonce',
                        'v1/createApiKey',
                        'v1/listenKey',
                    ],
                    'put': [
                        'v1/listenKey',
                    ],
                    'delete': [
                        'v1/listenKey',
                    ],
                },
                'sapiPrivate': {
                    'get': [
                        'v1/commissionRate',
                        'v1/order',
                        'v1/openOrders',
                        'v1/allOrders',
                        'v1/transactionHistory',
                        'v1/account',
                        'v1/userTrades',
                    ],
                    'post': [
                        'v1/order',
                        'v1/asset/wallet/transfer',
                        'v1/asset/sendToAddress',
                        'v1/aster/user-withdraw',
                    ],
                    'delete': [
                        'v1/order',
                        'v1/allOpenOrders',
                    ],
                },
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'precisionMode': number.TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.0001'),
                    'taker': this.parseNumber('0.00035'),
                },
            },
            'options': {
                'recvWindow': 10 * 1000,
                'defaultTimeInForce': 'GTC',
                'zeroAddress': '0x0000000000000000000000000000000000000000',
                'quoteOrderQty': true,
                'accountsByType': {
                    'spot': 'SPOT',
                    'future': 'FUTURE',
                    'linear': 'FUTURE',
                    'swap': 'FUTURE',
                },
                'networks': {
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                    'ARB': 'Arbitrum',
                },
                'networksToChainId': {
                    'ETH': 1,
                    'BSC': 56,
                    'Arbitrum': 42161,
                },
            },
            'exceptions': {
                'exact': {
                    // 10xx - General Server or Network issues
                    '-1000': errors.OperationFailed,
                    '-1001': errors.NetworkError,
                    '-1002': errors.AuthenticationError,
                    '-1003': errors.RateLimitExceeded,
                    '-1004': errors.DuplicateOrderId,
                    '-1005': errors.BadRequest,
                    '-1006': errors.BadResponse,
                    '-1007': errors.RequestTimeout,
                    '-1010': errors.OperationFailed,
                    '-1011': errors.PermissionDenied,
                    '-1013': errors.BadRequest,
                    '-1014': errors.OrderNotFillable,
                    '-1015': errors.RateLimitExceeded,
                    '-1016': errors.ExchangeClosedByUser,
                    '-1020': errors.NotSupported,
                    '-1021': errors.InvalidNonce,
                    '-1022': errors.AuthenticationError,
                    '-1023': errors.BadRequest,
                    // 11xx - Request issues
                    '-1100': errors.BadRequest,
                    '-1101': errors.BadRequest,
                    '-1102': errors.ArgumentsRequired,
                    '-1103': errors.BadRequest,
                    '-1104': errors.BadRequest,
                    '-1105': errors.ArgumentsRequired,
                    '-1106': errors.BadRequest,
                    '-1108': errors.BadRequest,
                    '-1109': errors.BadRequest,
                    '-1110': errors.BadSymbol,
                    '-1111': errors.BadRequest,
                    '-1112': errors.BadRequest,
                    '-1113': errors.BadRequest,
                    '-1114': errors.BadRequest,
                    '-1115': errors.InvalidOrder,
                    '-1116': errors.InvalidOrder,
                    '-1117': errors.InvalidOrder,
                    '-1118': errors.InvalidOrder,
                    '-1119': errors.InvalidOrder,
                    '-1120': errors.BadRequest,
                    '-1121': errors.BadSymbol,
                    '-1125': errors.AuthenticationError,
                    '-1127': errors.BadRequest,
                    '-1128': errors.BadRequest,
                    '-1130': errors.BadRequest,
                    '-1136': errors.InvalidOrder,
                    // 20xx - Processing Issues
                    '-2010': errors.InvalidOrder,
                    '-2011': errors.OrderNotFound,
                    '-2013': errors.OrderNotFound,
                    '-2014': errors.AuthenticationError,
                    '-2015': errors.AuthenticationError,
                    '-2016': errors.MarketClosed,
                    '-2018': errors.InsufficientFunds,
                    '-2019': errors.InsufficientFunds,
                    '-2020': errors.OrderNotFillable,
                    '-2021': errors.OrderImmediatelyFillable,
                    '-2022': errors.OperationRejected,
                    '-2023': errors.AccountSuspended,
                    '-2024': errors.InsufficientFunds,
                    '-2025': errors.RateLimitExceeded,
                    '-2026': errors.NotSupported,
                    '-2027': errors.BadRequest,
                    '-2028': errors.BadRequest,
                    // 40xx - Filters and other Issues
                    '-4000': errors.InvalidOrder,
                    '-4001': errors.InvalidOrder,
                    '-4002': errors.InvalidOrder,
                    '-4003': errors.InvalidOrder,
                    '-4004': errors.InvalidOrder,
                    '-4005': errors.InvalidOrder,
                    '-4006': errors.InvalidOrder,
                    '-4007': errors.InvalidOrder,
                    '-4008': errors.InvalidOrder,
                    '-4009': errors.InvalidOrder,
                    '-4010': errors.InvalidOrder,
                    '-4011': errors.InvalidOrder,
                    '-4012': errors.RateLimitExceeded,
                    '-4013': errors.InvalidOrder,
                    '-4014': errors.InvalidOrder,
                    '-4015': errors.InvalidOrder,
                    '-4016': errors.InvalidOrder,
                    '-4017': errors.InvalidOrder,
                    '-4018': errors.InvalidOrder,
                    '-4019': errors.BadRequest,
                    '-4020': errors.BadRequest,
                    '-4021': errors.BadRequest,
                    '-4022': errors.MarketClosed,
                    '-4023': errors.InvalidOrder,
                    '-4024': errors.InvalidOrder,
                    '-4025': errors.BadRequest,
                    '-4026': errors.BadRequest,
                    '-4027': errors.BadRequest,
                    '-4028': errors.BadRequest,
                    '-4029': errors.BadRequest,
                    '-4030': errors.BadRequest,
                    '-4031': errors.BadRequest,
                    '-4032': errors.RateLimitExceeded,
                    '-4033': errors.AccountNotEnabled,
                    '-4044': errors.BadRequest,
                    '-4045': errors.RateLimitExceeded,
                    '-4046': errors.NoChange,
                    '-4047': errors.OperationRejected,
                    '-4048': errors.OperationRejected,
                    '-4049': errors.OperationRejected,
                    '-4050': errors.InsufficientFunds,
                    '-4051': errors.InsufficientFunds,
                    '-4052': errors.NoChange,
                    '-4053': errors.OperationRejected,
                    '-4054': errors.OperationRejected,
                    '-4055': errors.ArgumentsRequired,
                    '-4056': errors.AuthenticationError,
                    '-4057': errors.AuthenticationError,
                    '-4058': errors.InvalidOrder,
                    '-4059': errors.NoChange,
                    '-4060': errors.InvalidOrder,
                    '-4061': errors.InvalidOrder,
                    '-4062': errors.OperationRejected,
                    '-4063': errors.BadRequest,
                    '-4064': errors.BadRequest,
                    '-4065': errors.BadRequest,
                    '-4066': errors.BadRequest,
                    '-4067': errors.OperationRejected,
                    '-4068': errors.OperationRejected,
                    '-4069': errors.BadRequest,
                    '-4070': errors.InvalidOrder,
                    '-4071': errors.InvalidOrder,
                    '-4072': errors.NoChange,
                    '-4073': errors.BadRequest,
                    '-4074': errors.InvalidOrder,
                    '-4075': errors.OperationRejected,
                    '-4076': errors.OperationRejected,
                    '-4077': errors.RateLimitExceeded,
                    '-4078': errors.BadRequest,
                    '-4079': errors.BadRequest,
                    '-4080': errors.BadRequest,
                    '-4081': errors.BadRequest,
                    '-4082': errors.RateLimitExceeded,
                    '-4083': errors.OperationFailed,
                    '-4084': errors.NotSupported,
                    '-4085': errors.BadRequest,
                    '-4086': errors.BadRequest,
                    '-4087': errors.PermissionDenied,
                    '-4088': errors.PermissionDenied,
                    '-4104': errors.BadSymbol,
                    '-4114': errors.InvalidOrder,
                    '-4115': errors.DuplicateOrderId,
                    '-4118': errors.InsufficientFunds,
                    '-4131': errors.InvalidOrder,
                    '-4135': errors.InvalidOrder,
                    '-4137': errors.InvalidOrder,
                    '-4138': errors.OperationRejected,
                    '-4139': errors.InvalidOrder,
                    '-4140': errors.OperationRejected,
                    '-4141': errors.MarketClosed,
                    '-4142': errors.InvalidOrder,
                    '-4144': errors.BadSymbol,
                    '-4161': errors.OperationRejected,
                    '-4164': errors.InvalidOrder,
                    '-4165': errors.BadRequest,
                    '-4183': errors.InvalidOrder,
                    '-4184': errors.InvalidOrder,
                    '-5060': errors.OperationRejected,
                    '-5076': errors.OperationRejected, // {"code":-5076,"msg":"Total order value should be more than 5 USDT"}
                },
                'broad': {},
            },
        });
    }
    isInverse(type, subType = undefined) {
        if (subType === undefined) {
            return (type === 'delivery');
        }
        else {
            return subType === 'inverse';
        }
    }
    isLinear(type, subType = undefined) {
        if (subType === undefined) {
            return (type === 'future') || (type === 'swap');
        }
        else {
            return subType === 'linear';
        }
    }
    /**
     * @method
     * @name aster#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#trading-specification-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const promises = [
            this.sapiPublicGetV1ExchangeInfo(params),
            this.fapiPublicGetV1ExchangeInfo(params),
        ];
        const results = await Promise.all(promises);
        const sapiResult = this.safeDict(results, 0, {});
        const sapiRows = this.safeList(sapiResult, 'assets', []);
        const fapiResult = this.safeDict(results, 1, {});
        const fapiRows = this.safeList(fapiResult, 'assets', []);
        const rows = this.arrayConcat(sapiRows, fapiRows);
        //
        //     [
        //         {
        //             "asset": "USDT",
        //             "marginAvailable": true,
        //             "autoAssetExchange": "-10000"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString(currency, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            result[code] = this.safeCurrencyStructure({
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': code,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': undefined,
                'type': 'crypto', // atm exchange api provides only cryptos
            });
        }
        return result;
    }
    /**
     * @method
     * @name aster#fetchMarkets
     * @description retrieves data on all markets for bigone
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#trading-specification-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const promises = [
            this.sapiPublicGetV1ExchangeInfo(params),
            this.fapiPublicGetV1ExchangeInfo(params),
        ];
        const results = await Promise.all(promises);
        const sapiResult = this.safeDict(results, 0, {});
        const sapiRows = this.safeList(sapiResult, 'symbols', []);
        const fapiResult = this.safeDict(results, 1, {});
        const fapiRows = this.safeList(fapiResult, 'symbols', []);
        const rows = this.arrayConcat(sapiRows, fapiRows);
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "pair": "BTCUSDT",
        //             "contractType": "PERPETUAL",
        //             "deliveryDate": 4133404800000,
        //             "onboardDate": 1627628400000,
        //             "status": "TRADING",
        //             "maintMarginPercent": "2.5000",
        //             "requiredMarginPercent": "5.0000",
        //             "baseAsset": "BTC",
        //             "quoteAsset": "USDT",
        //             "marginAsset": "USDT",
        //             "pricePrecision": 1,
        //             "quantityPrecision": 3,
        //             "baseAssetPrecision": 8,
        //             "quotePrecision": 8,
        //             "underlyingType": "COIN",
        //             "underlyingSubType": [],
        //             "settlePlan": 0,
        //             "triggerProtect": "0.0200",
        //             "liquidationFee": "0.025000",
        //             "marketTakeBound": "0.02",
        //             "filters": [
        //                 {
        //                     "minPrice": "1",
        //                     "maxPrice": "1000000",
        //                     "filterType": "PRICE_FILTER",
        //                     "tickSize": "0.1"
        //                 },
        //                 {
        //                     "stepSize": "0.001",
        //                     "filterType": "LOT_SIZE",
        //                     "maxQty": "100",
        //                     "minQty": "0.001"
        //                 },
        //                 {
        //                     "stepSize": "0.001",
        //                     "filterType": "MARKET_LOT_SIZE",
        //                     "maxQty": "10",
        //                     "minQty": "0.001"
        //                 },
        //                 {
        //                     "limit": 200,
        //                     "filterType": "MAX_NUM_ORDERS"
        //                 },
        //                 {
        //                     "limit": 10,
        //                     "filterType": "MAX_NUM_ALGO_ORDERS"
        //                 },
        //                 {
        //                     "notional": "5",
        //                     "filterType": "MIN_NOTIONAL"
        //                 },
        //                 {
        //                     "multiplierDown": "0.9800",
        //                     "multiplierUp": "1.0200",
        //                     "multiplierDecimal": "4",
        //                     "filterType": "PERCENT_PRICE"
        //                 }
        //             ],
        //             "orderTypes": [
        //                 "LIMIT",
        //                 "MARKET",
        //                 "STOP",
        //                 "STOP_MARKET",
        //                 "TAKE_PROFIT",
        //                 "TAKE_PROFIT_MARKET",
        //                 "TRAILING_STOP_MARKET"
        //             ],
        //             "timeInForce": [
        //                 "GTC",
        //                 "IOC",
        //                 "FOK",
        //                 "GTX",
        //                 "RPI"
        //             ]
        //         }
        //     ]
        //
        const fees = this.fees;
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            let swap = false;
            const market = rows[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseAsset');
            const quoteId = this.safeString(market, 'quoteAsset');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const contractType = this.safeString(market, 'contractType');
            const contract = contractType !== undefined;
            let spot = true;
            if (contractType === 'PERPETUAL') {
                swap = true;
                spot = false;
            }
            let contractSize = undefined;
            let linear = undefined;
            let inverse = undefined;
            let symbol = base + '/' + quote;
            let settle = undefined;
            let settleId = undefined;
            if (contract) {
                settleId = this.safeString(market, 'marginAsset');
                settle = this.safeCurrencyCode(settleId);
                if (swap) {
                    symbol = symbol + ':' + settle;
                }
                linear = settle === quote;
                inverse = settle === base;
                contractSize = this.safeNumber2(market, 'contractSize', 'unit', this.parseNumber('1'));
            }
            let unifiedType = undefined;
            if (spot) {
                unifiedType = 'spot';
            }
            else if (swap) {
                unifiedType = 'swap';
            }
            const status = this.safeString(market, 'status');
            const active = status === 'TRADING';
            const filters = this.safeList(market, 'filters', []);
            const filtersByType = this.indexBy(filters, 'filterType');
            const entry = this.safeMarketStructure({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': unifiedType,
                'spot': spot,
                'margin': false,
                'swap': swap,
                'future': false,
                'option': false,
                'active': active,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': fees['trading']['taker'],
                'maker': fees['trading']['maker'],
                'contractSize': contractSize,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'quantityPrecision'))),
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'pricePrecision'))),
                    'base': this.parseNumber(this.parsePrecision(this.safeString(market, 'baseAssetPrecision'))),
                    'quote': this.parseNumber(this.parsePrecision(this.safeString(market, 'quotePrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': this.safeInteger(market, 'onboardDate'),
                'info': market,
            });
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeDict(filtersByType, 'PRICE_FILTER', {});
                entry['limits']['price'] = {
                    'min': this.safeNumber(filter, 'minPrice'),
                    'max': this.safeNumber(filter, 'maxPrice'),
                };
                entry['precision']['price'] = this.safeNumber(filter, 'tickSize');
            }
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeDict(filtersByType, 'LOT_SIZE', {});
                entry['precision']['amount'] = this.safeNumber(filter, 'stepSize');
                entry['limits']['amount'] = {
                    'min': this.safeNumber(filter, 'minQty'),
                    'max': this.safeNumber(filter, 'maxQty'),
                };
            }
            if ('MARKET_LOT_SIZE' in filtersByType) {
                const filter = this.safeDict(filtersByType, 'MARKET_LOT_SIZE', {});
                entry['limits']['market'] = {
                    'min': this.safeNumber(filter, 'minQty'),
                    'max': this.safeNumber(filter, 'maxQty'),
                };
            }
            if (('MIN_NOTIONAL' in filtersByType) || ('NOTIONAL' in filtersByType)) {
                const filter = this.safeDict2(filtersByType, 'MIN_NOTIONAL', 'NOTIONAL', {});
                entry['limits']['cost']['min'] = this.safeNumber(filter, 'notional');
            }
            result.push(entry);
        }
        return result;
    }
    /**
     * @method
     * @name aster#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.fapiPublicGetV1Time(params);
        //
        //     {
        //         "serverTime": 1499827319559
        //     }
        //
        return this.safeInteger(response, 'serverTime');
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         1631158560000,
        //         "208.1850",
        //         "208.1850",
        //         "208.1850",
        //         "208.1850",
        //         "11.84",
        //         1631158619999,
        //         "2464.910400",
        //         1,
        //         "11.84",
        //         "2464.910400",
        //         "0"
        //     ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name aster#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOHLCV() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1500) {
                limit = 1500; // Default 500; max 1500.
            }
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        request['interval'] = this.safeString(this.timeframes, timeframe, timeframe);
        const price = this.safeString(params, 'price');
        const isMark = (price === 'mark');
        const isIndex = (price === 'index');
        params = this.omit(params, 'price');
        let response = undefined;
        if (isMark) {
            request['symbol'] = market['id'];
            response = await this.fapiPublicGetV1MarkPriceKlines(this.extend(request, params));
        }
        else if (isIndex) {
            request['pair'] = market['id'];
            response = await this.fapiPublicGetV1IndexPriceKlines(this.extend(request, params));
        }
        else {
            request['symbol'] = market['id'];
            if (market['linear']) {
                response = await this.fapiPublicGetV1Klines(this.extend(request, params));
            }
            else {
                response = await this.sapiPublicGetV1Klines(this.extend(request, params));
            }
        }
        //
        //     [
        //         [
        //             1631158560000,
        //             "208.1850",
        //             "208.1850",
        //             "208.1850",
        //             "208.1850",
        //             "11.84",
        //             1631158619999,
        //             "2464.910400",
        //             1,
        //             "11.84",
        //             "2464.910400",
        //             "0"
        //         ]
        //     ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //
        //     {
        //         "id": 3913206,
        //         "price": "644.100",
        //         "qty": "0.08",
        //         "quoteQty": "51.528",
        //         "time": 1749784506633,
        //         "isBuyerMaker": true
        //     }
        //
        //     {
        //         "id": 657,
        //         "price": "1.01000000",
        //         "qty": "5.00000000",
        //         "baseQty": "4.95049505",
        //         "time": 1755156533943,
        //         "isBuyerMaker": false
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "buyer": false,
        //         "commission": "-0.07819010",
        //         "commissionAsset": "USDT",
        //         "id": 698759,
        //         "maker": false,
        //         "orderId": 25851813,
        //         "price": "7819.01",
        //         "qty": "0.002",
        //         "quoteQty": "15.63802",
        //         "realizedPnl": "-0.91539999",
        //         "side": "SELL",
        //         "positionSide": "SHORT",
        //         "symbol": "BTCUSDT",
        //         "time": 1569514978020
        //     }
        //
        const id = this.safeString(trade, 'id');
        const symbol = market['symbol'];
        const currencyId = this.safeString(trade, 'commissionAsset');
        const currencyCode = this.safeCurrencyCode(currencyId);
        const amountString = this.safeString(trade, 'qty');
        const priceString = this.safeString(trade, 'price');
        const costString = this.safeString2(trade, 'quoteQty', 'baseQty');
        const timestamp = this.safeInteger(trade, 'time');
        let side = this.safeStringLower(trade, 'side');
        const isMaker = this.safeBool(trade, 'maker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        const isBuyerMaker = this.safeBool(trade, 'isBuyerMaker');
        if (isBuyerMaker !== undefined) {
            side = isBuyerMaker ? 'sell' : 'buy';
        }
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': this.safeString(trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': {
                'cost': this.parseNumber(Precise["default"].stringAbs(this.safeString(trade, 'commission'))),
                'currency': currencyCode,
            },
        }, market);
    }
    /**
     * @method
     * @name aster#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#recent-trades-list
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPublicGetV1Trades(this.extend(request, params));
            //
            //     [
            //         {
            //             "id": 3913206,
            //             "price": "644.100",
            //             "qty": "0.08",
            //             "quoteQty": "51.528",
            //             "time": 1749784506633,
            //             "isBuyerMaker": true
            //         }
            //     ]
            //
        }
        else {
            response = await this.sapiPublicGetV1Trades(this.extend(request, params));
            //     [
            //         {
            //             "id": 657,
            //             "price": "1.01000000",
            //             "qty": "5.00000000",
            //             "baseQty": "4.95049505",
            //             "time": 1755156533943,
            //             "isBuyerMaker": false
            //         }
            //     ]
        }
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name aster#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#account-trade-history-user_data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#account-trade-list-user_data
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is undefined
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPrivateGetV1UserTrades(this.extend(request, params));
        }
        else {
            response = await this.sapiPrivateGetV1UserTrades(this.extend(request, params));
        }
        //
        //     [
        //         {
        //             "buyer": false,
        //             "commission": "-0.07819010",
        //             "commissionAsset": "USDT",
        //             "id": 698759,
        //             "maker": false,
        //             "orderId": 25851813,
        //             "price": "7819.01",
        //             "qty": "0.002",
        //             "quoteQty": "15.63802",
        //             "realizedPnl": "-0.91539999",
        //             "side": "SELL",
        //             "positionSide": "SHORT",
        //             "symbol": "BTCUSDT",
        //             "time": 1569514978020
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit, params);
    }
    /**
     * @method
     * @name aster#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#depth-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            // limit: [5, 10, 20, 50, 100, 500, 1000]. Default: 500
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPublicGetV1Depth(this.extend(request, params));
        }
        else {
            response = await this.sapiPublicGetV1Depth(this.extend(request, params));
        }
        //
        //     {
        //         "lastUpdateId": 1027024,
        //         "E": 1589436922972, //     Message output time
        //         "T": 1589436922959, //     Transaction time
        //         "bids": [
        //             [
        //                 "4.00000000", //     PRICE
        //                 "431.00000000" //     QTY
        //             ]
        //         ],
        //         "asks": [
        //             [
        //                 "4.00000200",
        //                 "12.00000000"
        //             ]
        //         ]
        //     }
        //
        const timestamp = this.safeInteger(response, 'T');
        return this.parseOrderBook(response, symbol, timestamp, 'bids', 'asks');
    }
    /**
     * @method
     * @name aster#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 100; max 1000
            }
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.fapiPublicGetV1FundingRate(this.extend(request, params));
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "fundingTime": 1747209600000,
        //             "fundingRate": "0.00010000"
        //         }
        //     ]
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger(entry, 'fundingTime');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(this.safeString(entry, 'symbol'), undefined, undefined, 'swap'),
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "-2274.38",
        //         "priceChangePercent": "-2.049",
        //         "weightedAvgPrice": "109524.37084136",
        //         "lastPrice": "108738.78",
        //         "lastQty": "0.00034",
        //         "openPrice": "111013.16",
        //         "highPrice": "111975.81",
        //         "lowPrice": "107459.25",
        //         "volume": "28.67876",
        //         "quoteVolume": "3141023.14551030",
        //         "openTime": "1760578800000",
        //         "closeTime": "1760665024749",
        //         "firstId": "37447",
        //         "lastId": "39698",
        //         "count": "2252",
        //         "baseAsset": "BTC",
        //         "quoteAsset": "USDT",
        //         "bidPrice": "108705.11",
        //         "bidQty": "0.03351",
        //         "askPrice": "108725.99",
        //         "askQty": "0.08724"
        //     }
        // swap
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "1845.7",
        //         "priceChangePercent": "1.755",
        //         "weightedAvgPrice": "105515.5",
        //         "lastPrice": "107037.7",
        //         "lastQty": "0.004",
        //         "openPrice": "105192.0",
        //         "highPrice": "107223.5",
        //         "lowPrice": "104431.6",
        //         "volume": "8753.286",
        //         "quoteVolume": "923607368.61",
        //         "openTime": 1749976620000,
        //         "closeTime": 1750063053754,
        //         "firstId": 24195078,
        //         "lastId": 24375783,
        //         "count": 180706
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'closeTime');
        let marketType = undefined;
        if ('bidQty' in ticker) {
            marketType = 'spot';
        }
        else {
            marketType = 'contract';
        }
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'lastPrice');
        const open = this.safeString(ticker, 'openPrice');
        let percentage = this.safeString(ticker, 'priceChangePercent');
        percentage = Precise["default"].stringMul(percentage, '100');
        const quoteVolume = this.safeString(ticker, 'quoteVolume');
        const baseVolume = this.safeString(ticker, 'volume');
        const high = this.safeString(ticker, 'highPrice');
        const low = this.safeString(ticker, 'lowPrice');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': this.safeString(ticker, 'bidQty'),
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': this.safeString(ticker, 'askQty'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name aster#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#24h-price-change
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#24hr-ticker-price-change-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPublicGetV1Ticker24hr(this.extend(request, params));
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "priceChange": "1845.7",
            //         "priceChangePercent": "1.755",
            //         "weightedAvgPrice": "105515.5",
            //         "lastPrice": "107037.7",
            //         "lastQty": "0.004",
            //         "openPrice": "105192.0",
            //         "highPrice": "107223.5",
            //         "lowPrice": "104431.6",
            //         "volume": "8753.286",
            //         "quoteVolume": "923607368.61",
            //         "openTime": 1749976620000,
            //         "closeTime": 1750063053754,
            //         "firstId": 24195078,
            //         "lastId": 24375783,
            //         "count": 180706
            //     }
            //
        }
        else {
            response = await this.sapiPublicGetV1Ticker24hr(this.extend(request, params));
            //     {
            //         "symbol": "BTCUSDT",
            //         "priceChange": "-2274.38",
            //         "priceChangePercent": "-2.049",
            //         "weightedAvgPrice": "109524.37084136",
            //         "lastPrice": "108738.78",
            //         "lastQty": "0.00034",
            //         "openPrice": "111013.16",
            //         "highPrice": "111975.81",
            //         "lowPrice": "107459.25",
            //         "volume": "28.67876",
            //         "quoteVolume": "3141023.14551030",
            //         "openTime": "1760578800000",
            //         "closeTime": "1760665024749",
            //         "firstId": "37447",
            //         "lastId": "39698",
            //         "count": "2252",
            //         "baseAsset": "BTC",
            //         "quoteAsset": "USDT",
            //         "bidPrice": "108705.11",
            //         "bidQty": "0.03351",
            //         "askPrice": "108725.99",
            //         "askQty": "0.08724"
            //     }
        }
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name aster#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#24h-price-change
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#24hr-ticker-price-change-statistics
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {string} [params.type] 'spot', 'option', use params["subType"] for swap and future markets
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTickers', market, params);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetV1Ticker24hr(params);
        }
        else if (type === 'spot') {
            response = await this.sapiPublicGetV1Ticker24hr(params);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTickers() does not support ' + type + ' markets yet');
        }
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "priceChange": "1845.7",
        //             "priceChangePercent": "1.755",
        //             "weightedAvgPrice": "105515.5",
        //             "lastPrice": "107037.7",
        //             "lastQty": "0.004",
        //             "openPrice": "105192.0",
        //             "highPrice": "107223.5",
        //             "lowPrice": "104431.6",
        //             "volume": "8753.286",
        //             "quoteVolume": "923607368.61",
        //             "openTime": 1749976620000,
        //             "closeTime": 1750063053754,
        //             "firstId": 24195078,
        //             "lastId": 24375783,
        //             "count": 180706
        //         }
        //     ]
        //
        return this.parseTickers(response, symbols);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "106729.84047826",
        //         "indexPrice": "106775.72673913",
        //         "estimatedSettlePrice": "106708.84997006",
        //         "lastFundingRate": "0.00010000",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": 1750147200000,
        //         "time": 1750146970000
        //     }
        //     {
        //         "symbol": "INJUSDT",
        //         "interestRate": "0.00010000",
        //         "time": 1756197479000,
        //         "fundingIntervalHours": 8,
        //         "fundingFeeCap": 0.03,
        //         "fundingFeeFloor": -0.03
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const nextFundingTimestamp = this.safeInteger(contract, 'nextFundingTime');
        const timestamp = this.safeInteger(contract, 'time');
        const interval = this.safeString(contract, 'fundingIntervalHours');
        let intervalString = undefined;
        if (interval !== undefined) {
            intervalString = interval + 'h';
        }
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'markPrice': this.safeNumber(contract, 'markPrice'),
            'indexPrice': this.safeNumber(contract, 'indexPrice'),
            'interestRate': this.safeNumber(contract, 'interestRate'),
            'estimatedSettlePrice': this.safeNumber(contract, 'estimatedSettlePrice'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': this.safeNumber(contract, 'lastFundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601(nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': intervalString,
        };
    }
    /**
     * @method
     * @name aster#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRate() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.fapiPublicGetV1PremiumIndex(this.extend(request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "106729.84047826",
        //         "indexPrice": "106775.72673913",
        //         "estimatedSettlePrice": "106708.84997006",
        //         "lastFundingRate": "0.00010000",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": 1750147200000,
        //         "time": 1750146970000
        //     }
        //
        return this.parseFundingRate(response, market);
    }
    /**
     * @method
     * @name aster#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#24hr-ticker-price-change-statistics
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.fapiPublicGetV1PremiumIndex(this.extend(params));
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "markPrice": "106729.84047826",
        //             "indexPrice": "106775.72673913",
        //             "estimatedSettlePrice": "106708.84997006",
        //             "lastFundingRate": "0.00010000",
        //             "interestRate": "0.00010000",
        //             "nextFundingTime": 1750147200000,
        //             "time": 1750146970000
        //         }
        //     ]
        //
        return this.parseFundingRates(response, symbols);
    }
    /**
     * @method
     * @name aster#fetchFundingIntervals
     * @description fetch the funding rate interval for multiple markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-funding-rate-config
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingIntervals(symbols = undefined, params = {}) {
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.fapiPublicGetV1FundingInfo(params);
        //
        //     [
        //         {
        //             "symbol": "INJUSDT",
        //             "interestRate": "0.00010000",
        //             "time": 1756197479000,
        //             "fundingIntervalHours": 8,
        //             "fundingFeeCap": 0.03,
        //             "fundingFeeFloor": -0.03
        //         }
        //     ]
        //
        return this.parseFundingRates(response, symbols);
    }
    parseBalance(response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString(balance, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString2(balance, 'free', 'maxWithdrawAmount');
            account['used'] = this.safeString(balance, 'locked');
            account['total'] = this.safeString(balance, 'walletBalance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name aster#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#account-information-v4-user_data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#account-information-user_data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {string} [params.type] 'spot', 'option', use params["subType"] for swap and future markets
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
        let response = undefined;
        let data = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPrivateGetV4Account(params);
            data = this.safeList(response, 'assets', []);
            //
            //     [
            //         {
            //             "asset": "USDT", // asset name
            //             "walletBalance": "23.72469206", // wallet balance
            //             "unrealizedProfit": "0.00000000", // unrealized profit
            //             "marginBalance": "23.72469206", // margin balance
            //             "maintMargin": "0.00000000", // maintenance margin required
            //             "initialMargin": "0.00000000", // total initial margin required with current mark price
            //             "positionInitialMargin": "0.00000000", //initial margin required for positions with current mark price
            //             "openOrderInitialMargin": "0.00000000", // initial margin required for open orders with current mark price
            //             "crossWalletBalance": "23.72469206", // crossed wallet balance
            //             "crossUnPnl": "0.00000000", // unrealized profit of crossed positions
            //             "availableBalance": "23.72469206", // available balance
            //             "maxWithdrawAmount": "23.72469206", // maximum amount for transfer out
            //             "marginAvailable": true, // whether the asset can be used as margin in Multi-Assets mode
            //             "updateTime": 1625474304765 // last update time
            //         }
            //     ]
            //
        }
        else if (type === 'spot') {
            response = await this.sapiPrivateGetV1Account(params);
            data = this.safeList(response, 'balances', []);
            //
            //     [
            //         {
            //             "asset": "BTC",
            //             "free": "4723846.89208129",
            //             "locked": "0.00000000"
            //         }
            //     ]
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchBalance() does not support ' + type + ' markets yet');
        }
        return this.parseBalance(data);
    }
    /**
     * @method
     * @name aster#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#change-margin-type-trade
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toUpperCase();
        if (marginMode === 'CROSS') {
            marginMode = 'CROSSED';
        }
        if ((marginMode !== 'ISOLATED') && (marginMode !== 'CROSSED')) {
            throw new errors.BadRequest(this.id + ' marginMode must be either isolated or cross');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        const response = await this.fapiPrivatePostV1MarginType(this.extend(request, params));
        //
        //     {
        //         "amount": 100.0,
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "type": 1
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name aster#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for aster is set identically for all linear markets or all inverse markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-current-position-modeuser_data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode(symbol = undefined, params = {}) {
        const response = await this.fapiPrivateGetV1PositionSideDual(params);
        //
        //     {
        //         "dualSidePosition": true // "true": Hedge Mode; "false": One-way Mode
        //     }
        //
        const dualSidePosition = this.safeBool(response, 'dualSidePosition');
        return {
            'info': response,
            'hedged': (dualSidePosition === true),
        };
    }
    /**
     * @method
     * @name aster#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#change-position-modetrade
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by bingx setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        const request = {
            'dualSidePosition': hedged,
        };
        //
        //     {
        //         "code": 200,
        //         "msg": "success"
        //     }
        //
        return await this.fapiPrivatePostV1PositionSideDual(this.extend(request, params));
    }
    parseTradingFee(fee, market = undefined) {
        const marketId = this.safeString(fee, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber(fee, 'makerCommissionRate'),
            'taker': this.safeNumber(fee, 'takerCommissionRate'),
            'percentage': false,
            'tierBased': false,
        };
    }
    /**
     * @method
     * @name aster#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#get-symbol-fees
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#user-commission-rate-user_data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPrivateGetV1CommissionRate(this.extend(request, params));
        }
        else {
            response = await this.sapiPrivateGetV1CommissionRate(this.extend(request, params));
        }
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "makerCommissionRate": "0.0002",
        //         "takerCommissionRate": "0.0004"
        //     }
        //
        return this.parseTradingFee(response, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'canceled',
            'EXPIRED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(type) {
        const types = {
            'LIMIT': 'limit',
            'MARKET': 'market',
            'STOP': 'limit',
            'STOP_MARKET': 'market',
            'TAKE_PROFIT': 'limit',
            'TAKE_PROFIT_MARKET': 'market',
            'TRAILING_STOP_MARKET': 'market',
        };
        return this.safeString(types, type, type);
    }
    parseOrder(order, market = undefined) {
        //
        // swap
        //     {
        //         "avgPrice": "0.00000",
        //         "clientOrderId": "abc",
        //         "cumQuote": "0",
        //         "executedQty": "0",
        //         "orderId": 1917641,
        //         "origQty": "0.40",
        //         "origType": "TRAILING_STOP_MARKET",
        //         "price": "0",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "SHORT",
        //         "status": "NEW",
        //         "stopPrice": "9300",
        //         "closePosition": false,
        //         "symbol": "BTCUSDT",
        //         "time": 1579276756075,
        //         "timeInForce": "GTC",
        //         "type": "TRAILING_STOP_MARKET",
        //         "activatePrice": "9020",
        //         "priceRate": "0.3",
        //         "updateTime": 1579276756075,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        // spot
        //     {
        //         "orderId": 38,
        //         "symbol": "ADA25SLP25",
        //         "status": "FILLED",
        //         "clientOrderId": "afMd4GBQyHkHpGWdiy34Li",
        //         "price": "20",
        //         "avgPrice": "12.0000000000000000",
        //         "origQty": "10",
        //         "executedQty": "10",
        //         "cumQuote": "120",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0",
        //         "origType": "LIMIT",
        //         "time": 1649913186270,
        //         "updateTime": 1649913186297
        //     }
        //
        const info = order;
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const side = this.safeStringLower(order, 'side');
        const timestamp = this.safeInteger(order, 'time');
        const lastTradeTimestamp = this.safeInteger(order, 'updateTime');
        const statusId = this.safeStringUpper(order, 'status');
        const rawType = this.safeStringUpper(order, 'type');
        const stopPriceString = this.safeString(order, 'stopPrice');
        const triggerPrice = this.parseNumber(this.omitZero(stopPriceString));
        return this.safeOrder({
            'info': info,
            'id': this.safeString(order, 'orderId'),
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': this.safeInteger(order, 'updateTime'),
            'type': this.parseOrderType(rawType),
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'price'),
            'triggerPrice': triggerPrice,
            'average': this.safeString(order, 'avgPrice'),
            'cost': this.safeString(order, 'cumQuote'),
            'amount': this.safeString(order, 'origQty'),
            'filled': this.safeString(order, 'executedQty'),
            'remaining': undefined,
            'status': this.parseOrderStatus(statusId),
            'fee': undefined,
            'trades': undefined,
            'reduceOnly': this.safeBool2(order, 'reduceOnly', 'ro'),
        }, market);
    }
    /**
     * @method
     * @name aster#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#query-order-user_data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#query-order-user_data
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clientOid');
        params = this.omit(params, ['clientOrderId', 'clientOid']);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        else {
            request['orderId'] = id;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPrivateGetV1Order(this.extend(request, params));
        }
        else {
            response = await this.sapiPrivateGetV1Order(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name aster#fetchOpenOrder
     * @description fetch an open order by the id
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#query-current-open-order-user_data
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clientOid');
        params = this.omit(params, ['clientOrderId', 'clientOid']);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        else {
            request['orderId'] = id;
        }
        const response = await this.fapiPrivateGetV1OpenOrder(this.extend(request, params));
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name aster#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#query-all-orders-user_data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#all-orders-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000
            }
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPrivateGetV1AllOrders(this.extend(request, params));
        }
        else {
            response = await this.sapiPrivateGetV1AllOrders(this.extend(request, params));
        }
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name aster#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#current-open-orders-user_data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#current-all-open-orders-user_data
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {string} [params.type] 'spot', 'option', use params["subType"] for swap and future markets
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let type = undefined;
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchOpenOrders', market, params);
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        [type, params] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPrivateGetV1OpenOrders(this.extend(request, params));
        }
        else if (type === 'spot') {
            response = await this.sapiPrivateGetV1OpenOrders(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchOpenOrders() does not support ' + type + ' markets yet');
        }
        //
        //     [
        //         {
        //             "avgPrice": "0.00000",
        //             "clientOrderId": "abc",
        //             "cumQuote": "0",
        //             "executedQty": "0",
        //             "orderId": 1917641,
        //             "origQty": "0.40",
        //             "origType": "TRAILING_STOP_MARKET",
        //             "price": "0",
        //             "reduceOnly": false,
        //             "side": "BUY",
        //             "positionSide": "SHORT",
        //             "status": "NEW",
        //             "stopPrice": "9300",
        //             "closePosition": false,
        //             "symbol": "BTCUSDT",
        //             "time": 1579276756075,
        //             "timeInForce": "GTC",
        //             "type": "TRAILING_STOP_MARKET",
        //             "activatePrice": "9020",
        //             "priceRate": "0.3",
        //             "updateTime": 1579276756075,
        //             "workingType": "CONTRACT_PRICE",
        //             "priceProtect": false
        //         }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name aster#createOrder
     * @description create a trade order
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#place-order-trade
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#new-order--trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP' or 'STOP_MARKET' or 'TAKE_PROFIT' or 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.reduceOnly] for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
     * @param {boolean} [params.test] whether to use the test endpoint or not, default is false
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {float} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @param {string} [params.positionSide] "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const test = this.safeBool(params, 'test', false);
        params = this.omit(params, 'test');
        const request = this.createOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['swap']) {
            if (test) {
                response = await this.fapiPrivatePostV1OrderTest(request);
            }
            else {
                response = await this.fapiPrivatePostV1Order(request);
            }
        }
        else {
            response = await this.sapiPrivatePostV1Order(request);
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name aster#createOrders
     * @description create a list of trade orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#place-multiple-orders--trade
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let orderSymbols = [];
        if (orders.length > 5) {
            throw new errors.InvalidOrder(this.id + ' createOrders() order list max 5 orders');
        }
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        orderSymbols = this.marketSymbols(orderSymbols, undefined, false, true, true);
        const market = this.market(orderSymbols[0]);
        if (market['spot']) {
            throw new errors.NotSupported(this.id + ' createOrders() does not support ' + market['type'] + ' orders');
        }
        const request = {
            'batchOrders': ordersRequests,
        };
        const response = await this.fapiPrivatePostV1BatchOrders(this.extend(request, params));
        return this.parseOrders(response);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name aster#createOrderRequest
         * @description helper function to build the request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market(symbol);
        const initialUppercaseType = type.toUpperCase();
        const isMarketOrder = initialUppercaseType === 'MARKET';
        const isLimitOrder = initialUppercaseType === 'LIMIT';
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
        };
        const clientOrderId = this.safeString2(params, 'newClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
        }
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeString(params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const trailingDelta = this.safeString(params, 'trailingDelta');
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activationPrice');
        const trailingPercent = this.safeStringN(params, ['trailingPercent', 'callbackRate', 'trailingDelta']);
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isStopLoss = stopLossPrice !== undefined || trailingDelta !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        let uppercaseType = initialUppercaseType;
        let stopPrice = undefined;
        if (isTrailingPercentOrder) {
            if (market['swap']) {
                uppercaseType = 'TRAILING_STOP_MARKET';
                request['callbackRate'] = trailingPercent;
                if (trailingTriggerPrice !== undefined) {
                    request['activationPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
                }
            }
        }
        else if (isStopLoss) {
            stopPrice = stopLossPrice;
            if (isMarketOrder) {
                uppercaseType = 'STOP_MARKET';
            }
            else if (isLimitOrder) {
                uppercaseType = 'STOP';
            }
        }
        else if (isTakeProfit) {
            stopPrice = takeProfitPrice;
            if (isMarketOrder) {
                uppercaseType = 'TAKE_PROFIT_MARKET';
            }
            else if (isLimitOrder) {
                uppercaseType = 'TAKE_PROFIT';
            }
        }
        const postOnly = this.isPostOnly(isMarketOrder, undefined, params);
        if (postOnly) {
            request['timeInForce'] = 'GTX';
        }
        //
        // spot
        // LIMIT timeInForce, quantity, price
        // MARKET quantity or quoteOrderQty
        // STOP and TAKE_PROFIT quantity, price, stopPrice
        // STOP_MARKET and TAKE_PROFIT_MARKET quantity, stopPrice
        // future
        // LIMIT timeInForce, quantity, price
        // MARKET quantity
        // STOP/TAKE_PROFIT quantity, price, stopPrice
        // STOP_MARKET/TAKE_PROFIT_MARKET stopPrice
        // TRAILING_STOP_MARKET callbackRate
        //
        // additional required fields depending on the order type
        const closePosition = this.safeBool(params, 'closePosition', false);
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        let quantityIsRequired = false;
        request['type'] = uppercaseType;
        if (uppercaseType === 'MARKET') {
            if (market['spot']) {
                const quoteOrderQty = this.safeBool(this.options, 'quoteOrderQty', true);
                if (quoteOrderQty) {
                    const quoteOrderQtyNew = this.safeString2(params, 'quoteOrderQty', 'cost');
                    const precision = market['precision']['price'];
                    if (quoteOrderQtyNew !== undefined) {
                        request['quoteOrderQty'] = this.decimalToPrecision(quoteOrderQtyNew, number.TRUNCATE, precision, this.precisionMode);
                    }
                    else if (price !== undefined) {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const quoteOrderQuantity = Precise["default"].stringMul(amountString, priceString);
                        request['quoteOrderQty'] = this.decimalToPrecision(quoteOrderQuantity, number.TRUNCATE, precision, this.precisionMode);
                    }
                    else {
                        quantityIsRequired = true;
                    }
                }
                else {
                    quantityIsRequired = true;
                }
            }
            else {
                quantityIsRequired = true;
            }
        }
        else if (uppercaseType === 'LIMIT') {
            timeInForceIsRequired = true;
            quantityIsRequired = true;
            priceIsRequired = true;
        }
        else if ((uppercaseType === 'STOP') || (uppercaseType === 'TAKE_PROFIT')) {
            quantityIsRequired = true;
            priceIsRequired = true;
            triggerPriceIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
            if (!closePosition) {
                quantityIsRequired = true;
            }
            triggerPriceIsRequired = true;
        }
        else if (uppercaseType === 'TRAILING_STOP_MARKET') {
            request['callbackRate'] = trailingPercent;
            if (trailingTriggerPrice !== undefined) {
                request['activationPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
            }
        }
        if (quantityIsRequired) {
            const marketAmountPrecision = this.safeString(market['precision'], 'amount');
            const isPrecisionAvailable = (marketAmountPrecision !== undefined);
            if (isPrecisionAvailable) {
                request['quantity'] = this.amountToPrecision(symbol, amount);
            }
            else {
                request['quantity'] = this.parseToNumeric(amount);
            }
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            const pricePrecision = this.safeString(market['precision'], 'price');
            const isPricePrecisionAvailable = (pricePrecision !== undefined);
            if (isPricePrecisionAvailable) {
                request['price'] = this.priceToPrecision(symbol, price);
            }
            else {
                request['price'] = this.parseToNumeric(price);
            }
        }
        if (triggerPriceIsRequired) {
            if (stopPrice === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
            }
            if (stopPrice !== undefined) {
                request['stopPrice'] = this.priceToPrecision(symbol, stopPrice);
            }
        }
        if (timeInForceIsRequired && (this.safeString(params, 'timeInForce') === undefined) && (this.safeString(request, 'timeInForce') === undefined)) {
            request['timeInForce'] = this.safeString(this.options, 'defaultTimeInForce'); // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        const requestParams = this.omit(params, ['newClientOrderId', 'clientOrderId', 'stopPrice', 'triggerPrice', 'trailingTriggerPrice', 'trailingPercent', 'trailingDelta', 'stopPrice', 'stopLossPrice', 'takeProfitPrice']);
        return this.extend(request, requestParams);
    }
    /**
     * @method
     * @name aster#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#cancel-all-open-orders-trade
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#cancel-all-open-orders-trade
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPrivateDeleteV1AllOpenOrders(this.extend(request, params));
        }
        else {
            response = await this.sapiPrivateDeleteV1AllOpenOrders(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200",
        //         "msg": "The operation of cancel all open order is done."
        //     }
        //
        return [
            this.safeOrder({
                'info': response,
            }),
        ];
    }
    /**
     * @method
     * @name aster#cancelOrder
     * @description cancels an open order
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#cancel-order-trade
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeStringN(params, ['origClientOrderId', 'clientOrderId', 'newClientStrategyId']);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        else {
            request['orderId'] = id;
        }
        params = this.omit(params, ['origClientOrderId', 'clientOrderId', 'newClientStrategyId']);
        let response = undefined;
        if (market['swap']) {
            response = await this.fapiPrivateDeleteV1Order(this.extend(request, params));
        }
        else {
            response = await this.sapiPrivateDeleteV1Order(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name aster#cancelOrders
     * @description cancel multiple orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#cancel-multiple-orders-trade
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string[]} [params.origClientOrderIdList] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @param {int[]} [params.recvWindow]
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.NotSupported(this.id + ' cancelOrders() does not support ' + market['type'] + ' orders');
        }
        const request = {
            'symbol': market['id'],
        };
        const clientOrderIdList = this.safeList(params, 'origClientOrderIdList');
        if (clientOrderIdList !== undefined) {
            request['origClientOrderIdList'] = clientOrderIdList;
        }
        else {
            request['orderIdList'] = ids;
        }
        const response = await this.fapiPrivateDeleteV1BatchOrders(this.extend(request, params));
        //
        //    [
        //        {
        //            "clientOrderId": "myOrder1",
        //            "cumQty": "0",
        //            "cumQuote": "0",
        //            "executedQty": "0",
        //            "orderId": 283194212,
        //            "origQty": "11",
        //            "origType": "TRAILING_STOP_MARKET",
        //            "price": "0",
        //            "reduceOnly": false,
        //            "side": "BUY",
        //            "positionSide": "SHORT",
        //            "status": "CANCELED",
        //            "stopPrice": "9300",                  // please ignore when order type is TRAILING_STOP_MARKET
        //            "closePosition": false,               // if Close-All
        //            "symbol": "BTCUSDT",
        //            "timeInForce": "GTC",
        //            "type": "TRAILING_STOP_MARKET",
        //            "activatePrice": "9020",              // activation price, only return with TRAILING_STOP_MARKET order
        //            "priceRate": "0.3",                   // callback rate, only return with TRAILING_STOP_MARKET order
        //            "updateTime": 1571110484038,
        //            "workingType": "CONTRACT_PRICE",
        //            "priceProtect": false,                // if conditional order trigger is protected
        //        },
        //        {
        //            "code": -2011,
        //            "msg": "Unknown order sent."
        //        }
        //    ]
        //
        return this.parseOrders(response, market);
    }
    /**
     * @method
     * @name aster#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#change-initial-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 125)) {
            throw new errors.BadRequest(this.id + ' leverage should be between 1 and 125');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        const response = await this.fapiPrivatePostV1Leverage(this.extend(request, params));
        //
        //     {
        //         "leverage": 21,
        //         "maxNotionalValue": "1000000",
        //         "symbol": "BTCUSDT"
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name aster#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.fapiPrivateGetV2PositionRisk(params);
        //
        //     [
        //         {
        //             "symbol": "INJUSDT",
        //             "positionAmt": "0.0",
        //             "entryPrice": "0.0",
        //             "markPrice": "0.00000000",
        //             "unRealizedProfit": "0.00000000",
        //             "liquidationPrice": "0",
        //             "leverage": "20",
        //             "maxNotionalValue": "25000",
        //             "marginType": "cross",
        //             "isolatedMargin": "0.00000000",
        //             "isAutoAddMargin": "false",
        //             "positionSide": "BOTH",
        //             "notional": "0",
        //             "isolatedWallet": "0",
        //             "updateTime": 0
        //         }
        //     ]
        //
        return this.parseLeverages(response, symbols, 'symbol');
    }
    parseLeverage(leverage, market = undefined) {
        //
        //     {
        //         "symbol": "INJUSDT",
        //         "positionAmt": "0.0",
        //         "entryPrice": "0.0",
        //         "markPrice": "0.00000000",
        //         "unRealizedProfit": "0.00000000",
        //         "liquidationPrice": "0",
        //         "leverage": "20",
        //         "maxNotionalValue": "25000",
        //         "marginType": "cross",
        //         "isolatedMargin": "0.00000000",
        //         "isAutoAddMargin": "false",
        //         "positionSide": "BOTH",
        //         "notional": "0",
        //         "isolatedWallet": "0",
        //         "updateTime": 0
        //     }
        //
        const marketId = this.safeString(leverage, 'symbol');
        const marginMode = this.safeStringLower(leverage, 'marginType');
        const side = this.safeStringLower(leverage, 'positionSide');
        let longLeverage = undefined;
        let shortLeverage = undefined;
        const leverageValue = this.safeInteger(leverage, 'leverage');
        if ((side === undefined) || (side === 'both')) {
            longLeverage = leverageValue;
            shortLeverage = leverageValue;
        }
        else if (side === 'long') {
            longLeverage = leverageValue;
        }
        else if (side === 'short') {
            shortLeverage = leverageValue;
        }
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        };
    }
    /**
     * @method
     * @name aster#fetchMarginModes
     * @description fetches margin mode of the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginModes(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.fapiPrivateGetV2PositionRisk(params);
        //
        //
        //     [
        //         {
        //             "symbol": "INJUSDT",
        //             "positionAmt": "0.0",
        //             "entryPrice": "0.0",
        //             "markPrice": "0.00000000",
        //             "unRealizedProfit": "0.00000000",
        //             "liquidationPrice": "0",
        //             "leverage": "20",
        //             "maxNotionalValue": "25000",
        //             "marginType": "cross",
        //             "isolatedMargin": "0.00000000",
        //             "isAutoAddMargin": "false",
        //             "positionSide": "BOTH",
        //             "notional": "0",
        //             "isolatedWallet": "0",
        //             "updateTime": 0
        //         }
        //     ]
        //
        //
        return this.parseMarginModes(response, symbols, 'symbol', 'swap');
    }
    parseMarginMode(marginMode, market = undefined) {
        //
        //     {
        //         "symbol": "INJUSDT",
        //         "positionAmt": "0.0",
        //         "entryPrice": "0.0",
        //         "markPrice": "0.00000000",
        //         "unRealizedProfit": "0.00000000",
        //         "liquidationPrice": "0",
        //         "leverage": "20",
        //         "maxNotionalValue": "25000",
        //         "marginType": "cross",
        //         "isolatedMargin": "0.00000000",
        //         "isAutoAddMargin": "false",
        //         "positionSide": "BOTH",
        //         "notional": "0",
        //         "isolatedWallet": "0",
        //         "updateTime": 0
        //     }
        //
        const marketId = this.safeString(marginMode, 'symbol');
        market = this.safeMarket(marketId, market);
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': this.safeStringLower(marginMode, 'marginType'),
        };
    }
    /**
     * @method
     * @name aster#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-position-margin-change-history-trade
     * @param {string} symbol unified market symbol
     * @param {string} [type] "add" or "reduce"
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum amount of changes to fetch
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest change to fetch
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async fetchMarginAdjustmentHistory(symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMarginAdjustmentHistory () requires a symbol argument');
        }
        const market = this.market(symbol);
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        const request = {
            'symbol': market['id'],
        };
        if (type !== undefined) {
            request['type'] = (type === 'add') ? 1 : 2;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.fapiPrivateGetV1PositionMarginHistory(this.extend(request, params));
        //
        //     [
        //         {
        //             "amount": "23.36332311",
        //             "asset": "USDT",
        //             "symbol": "BTCUSDT",
        //             "time": 1578047897183,
        //             "type": 1,
        //             "positionSide": "BOTH"
        //         }
        //     ]
        //
        const modifications = this.parseMarginModifications(response);
        return this.filterBySymbolSinceLimit(modifications, symbol, since, limit);
    }
    parseMarginModification(data, market = undefined) {
        //
        //     {
        //         "amount": "100",
        //         "asset": "USDT",
        //         "symbol": "BTCUSDT",
        //         "time": 1578047900425,
        //         "type": 1,
        //         "positionSide": "LONG"
        //     }
        //
        //     {
        //         "amount": 100.0,
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "type": 1
        //     }
        //
        const rawType = this.safeInteger(data, 'type');
        const errorCode = this.safeString(data, 'code');
        const marketId = this.safeString(data, 'symbol');
        const timestamp = this.safeInteger(data, 'time');
        market = this.safeMarket(marketId, market, undefined, 'swap');
        const noErrorCode = errorCode === undefined;
        const success = errorCode === '200';
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': (rawType === 1) ? 'add' : 'reduce',
            'marginMode': 'isolated',
            'amount': this.safeNumber(data, 'amount'),
            'code': this.safeString(data, 'asset'),
            'total': undefined,
            'status': (success || noErrorCode) ? 'ok' : 'failed',
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    async modifyMarginHelper(symbol, amount, addOrReduce, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        amount = this.amountToPrecision(symbol, amount);
        const request = {
            'type': addOrReduce,
            'symbol': market['id'],
            'amount': amount,
        };
        const code = market['quote'];
        const response = await this.fapiPrivatePostV1PositionMargin(this.extend(request, params));
        //
        //     {
        //         "amount": 100.0,
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "type": 1
        //     }
        //
        return this.extend(this.parseMarginModification(response, market), {
            'code': code,
        });
    }
    /**
     * @method
     * @name aster#reduceMargin
     * @description remove margin from a position
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#modify-isolated-position-margin-trade
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 2, params);
    }
    /**
     * @method
     * @name aster#addMargin
     * @description add margin
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#modify-isolated-position-margin-trade
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 1, params);
    }
    parseIncome(income, market = undefined) {
        //
        //     {
        //       "symbol": "ETHUSDT",
        //       "incomeType": "FUNDING_FEE",
        //       "income": "0.00134317",
        //       "asset": "USDT",
        //       "time": "1621584000000",
        //       "info": "FUNDING_FEE",
        //       "tranId": "4480321991774044580",
        //       "tradeId": ""
        //     }
        //
        const marketId = this.safeString(income, 'symbol');
        const currencyId = this.safeString(income, 'asset');
        const timestamp = this.safeInteger(income, 'time');
        return {
            'info': income,
            'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
            'code': this.safeCurrencyCode(currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(income, 'tranId'),
            'amount': this.safeNumber(income, 'income'),
        };
    }
    /**
     * @method
     * @name aster#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-income-historyuser_data
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding history entry
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the funding history for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let request = {
            'incomeType': 'FUNDING_FEE', // "TRANSFER"，"WELCOME_BONUS", "REALIZED_PNL"，"FUNDING_FEE", "COMMISSION", "INSURANCE_CLEAR", and "MARKET_MERCHANT_RETURN_REWARD"
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000); // max 1000
        }
        const response = await this.fapiPrivateGetV1Income(this.extend(request, params));
        return this.parseIncomes(response, market, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "symbol": "",
        //         "incomeType": "TRANSFER",
        //         "income": "10.00000000",
        //         "asset": "USDT",
        //         "time": 1677645250000,
        //         "info": "TRANSFER",
        //         "tranId": 131001573082,
        //         "tradeId": ""
        //     }
        //
        let amount = this.safeString(item, 'income');
        let direction = undefined;
        if (Precise["default"].stringLe(amount, '0')) {
            direction = 'out';
            amount = Precise["default"].stringMul('-1', amount);
        }
        else {
            direction = 'in';
        }
        const currencyId = this.safeString(item, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const timestamp = this.safeInteger(item, 'time');
        const type = this.safeString(item, 'incomeType');
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'tranId'),
            'direction': direction,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'tradeId'),
            'type': this.parseLedgerEntryType(type),
            'currency': code,
            'amount': this.parseNumber(amount),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const ledgerType = {
            'TRANSFER': 'transfer',
            'WELCOME_BONUS': 'cashback',
            'REALIZED_PNL': 'trade',
            'FUNDING_FEE': 'fee',
            'COMMISSION': 'commission',
            'INSURANCE_CLEAR': 'settlement',
            'MARKET_MERCHANT_RETURN_REWARD': 'cashback',
        };
        return this.safeString(ledgerType, type, type);
    }
    /**
     * @method
     * @name aster#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-income-historyuser_data
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000); // max 1000
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['endTime'] = until;
        }
        const response = await this.fapiPrivateGetV1Income(this.extend(request, params));
        //
        //     [
        //         {
        //             "symbol": "",
        //             "incomeType": "TRANSFER",
        //             "income": "10.00000000",
        //             "asset": "USDT",
        //             "time": 1677645250000,
        //             "info": "TRANSFER",
        //             "tranId": 131001573082,
        //             "tradeId": ""
        //         }
        //     ]
        //
        return this.parseLedger(response, currency, since, limit);
    }
    parsePositionRisk(position, market = undefined) {
        //
        //     {
        //         "entryPrice": "6563.66500",
        //         "marginType": "isolated",
        //         "isAutoAddMargin": "false",
        //         "isolatedMargin": "15517.54150468",
        //         "leverage": "10",
        //         "liquidationPrice": "5930.78",
        //         "markPrice": "6679.50671178",
        //         "maxNotionalValue": "20000000",
        //         "positionSide": "LONG",
        //         "positionAmt": "20.000",
        //         "symbol": "BTCUSDT",
        //         "unRealizedProfit": "2316.83423560",
        //         "updateTime": 1625474304765
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeString(market, 'symbol');
        const isolatedMarginString = this.safeString(position, 'isolatedMargin');
        const leverageBrackets = this.safeDict(this.options, 'leverageBrackets', {});
        const leverageBracket = this.safeList(leverageBrackets, symbol, []);
        const notionalString = this.safeString2(position, 'notional', 'notionalValue');
        const notionalStringAbs = Precise["default"].stringAbs(notionalString);
        let maintenanceMarginPercentageString = undefined;
        for (let i = 0; i < leverageBracket.length; i++) {
            const bracket = leverageBracket[i];
            if (Precise["default"].stringLt(notionalStringAbs, bracket[0])) {
                break;
            }
            maintenanceMarginPercentageString = bracket[1];
        }
        const notional = this.parseNumber(notionalStringAbs);
        const contractsAbs = Precise["default"].stringAbs(this.safeString(position, 'positionAmt'));
        const contracts = this.parseNumber(contractsAbs);
        const unrealizedPnlString = this.safeString(position, 'unRealizedProfit');
        const unrealizedPnl = this.parseNumber(unrealizedPnlString);
        const liquidationPriceString = this.omitZero(this.safeString(position, 'liquidationPrice'));
        const liquidationPrice = this.parseNumber(liquidationPriceString);
        let collateralString = undefined;
        let marginMode = this.safeString(position, 'marginType');
        if (marginMode === undefined && isolatedMarginString !== undefined) {
            marginMode = Precise["default"].stringEq(isolatedMarginString, '0') ? 'cross' : 'isolated';
        }
        let side = undefined;
        if (Precise["default"].stringGt(notionalString, '0')) {
            side = 'long';
        }
        else if (Precise["default"].stringLt(notionalString, '0')) {
            side = 'short';
        }
        const entryPriceString = this.safeString(position, 'entryPrice');
        const entryPrice = this.parseNumber(entryPriceString);
        const contractSize = this.safeValue(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        // as oppose to notionalValue
        const linear = ('notional' in position);
        if (marginMode === 'cross') {
            // calculate collateral
            const precision = this.safeDict(market, 'precision', {});
            const basePrecisionValue = this.safeString(precision, 'base');
            const quotePrecisionValue = this.safeString2(precision, 'quote', 'price');
            const precisionIsUndefined = (basePrecisionValue === undefined) && (quotePrecisionValue === undefined);
            if (!precisionIsUndefined) {
                if (linear) {
                    // walletBalance = (liquidationPrice * (±1 + mmp) ± entryPrice) * contracts
                    let onePlusMaintenanceMarginPercentageString = undefined;
                    let entryPriceSignString = entryPriceString;
                    if (side === 'short') {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('1', maintenanceMarginPercentageString);
                        entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                    }
                    else {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('-1', maintenanceMarginPercentageString);
                    }
                    const inner = Precise["default"].stringMul(liquidationPriceString, onePlusMaintenanceMarginPercentageString);
                    const leftSide = Precise["default"].stringAdd(inner, entryPriceSignString);
                    const quotePrecision = this.precisionFromString(this.safeString2(precision, 'quote', 'price'));
                    if (quotePrecision !== undefined) {
                        collateralString = Precise["default"].stringDiv(Precise["default"].stringMul(leftSide, contractsAbs), '1', quotePrecision);
                    }
                }
                else {
                    // walletBalance = (contracts * contractSize) * (±1/entryPrice - (±1 - mmp) / liquidationPrice)
                    let onePlusMaintenanceMarginPercentageString = undefined;
                    let entryPriceSignString = entryPriceString;
                    if (side === 'short') {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('1', maintenanceMarginPercentageString);
                    }
                    else {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('-1', maintenanceMarginPercentageString);
                        entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                    }
                    const leftSide = Precise["default"].stringMul(contractsAbs, contractSizeString);
                    const rightSide = Precise["default"].stringSub(Precise["default"].stringDiv('1', entryPriceSignString), Precise["default"].stringDiv(onePlusMaintenanceMarginPercentageString, liquidationPriceString));
                    const basePrecision = this.precisionFromString(this.safeString(precision, 'base'));
                    if (basePrecision !== undefined) {
                        collateralString = Precise["default"].stringDiv(Precise["default"].stringMul(leftSide, rightSide), '1', basePrecision);
                    }
                }
            }
        }
        else {
            collateralString = this.safeString(position, 'isolatedMargin');
        }
        collateralString = (collateralString === undefined) ? '0' : collateralString;
        const collateral = this.parseNumber(collateralString);
        const markPrice = this.parseNumber(this.omitZero(this.safeString(position, 'markPrice')));
        let timestamp = this.safeInteger(position, 'updateTime');
        if (timestamp === 0) {
            timestamp = undefined;
        }
        const maintenanceMarginPercentage = this.parseNumber(maintenanceMarginPercentageString);
        let maintenanceMarginString = Precise["default"].stringMul(maintenanceMarginPercentageString, notionalStringAbs);
        if (maintenanceMarginString === undefined) {
            // for a while, this new value was a backup to the existing calculations, but in future we might prioritize this
            maintenanceMarginString = this.safeString(position, 'maintMargin');
        }
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        let initialMarginString = undefined;
        let initialMarginPercentageString = undefined;
        const leverageString = this.safeString(position, 'leverage');
        if (leverageString !== undefined) {
            const leverage = parseInt(leverageString);
            const rational = this.isRoundNumber(1000 % leverage);
            initialMarginPercentageString = Precise["default"].stringDiv('1', leverageString, 8);
            if (!rational) {
                initialMarginPercentageString = Precise["default"].stringAdd(initialMarginPercentageString, '1e-8');
            }
            const unrounded = Precise["default"].stringMul(notionalStringAbs, initialMarginPercentageString);
            initialMarginString = Precise["default"].stringDiv(unrounded, '1', 8);
        }
        else {
            initialMarginString = this.safeString(position, 'initialMargin');
            const unrounded = Precise["default"].stringMul(initialMarginString, '1');
            initialMarginPercentageString = Precise["default"].stringDiv(unrounded, notionalStringAbs, 8);
        }
        let marginRatio = undefined;
        let percentage = undefined;
        if (!Precise["default"].stringEquals(collateralString, '0')) {
            marginRatio = this.parseNumber(Precise["default"].stringDiv(Precise["default"].stringAdd(Precise["default"].stringDiv(maintenanceMarginString, collateralString), '5e-5'), '1', 4));
            percentage = this.parseNumber(Precise["default"].stringMul(Precise["default"].stringDiv(unrealizedPnlString, initialMarginString, 4), '100'));
        }
        const positionSide = this.safeString(position, 'positionSide');
        const hedged = positionSide !== 'BOTH';
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': contracts,
            'contractSize': contractSize,
            'unrealizedPnl': unrealizedPnl,
            'leverage': this.parseNumber(leverageString),
            'liquidationPrice': liquidationPrice,
            'collateral': collateral,
            'notional': notional,
            'markPrice': markPrice,
            'entryPrice': entryPrice,
            'timestamp': timestamp,
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentageString),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'marginRatio': marginRatio,
            'datetime': this.iso8601(timestamp),
            'marginMode': marginMode,
            'side': side,
            'hedged': hedged,
            'percentage': percentage,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name aster#fetchPositionsRisk
     * @description fetch positions risk
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} data on the positions risk
     */
    async fetchPositionsRisk(symbols = undefined, params = {}) {
        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositionsRisk() requires an array argument for symbols');
            }
        }
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        const request = {};
        const response = await this.fapiPrivateGetV2PositionRisk(this.extend(request, params));
        //
        //     [
        //         {
        //             "entryPrice": "6563.66500",
        //             "marginType": "isolated",
        //             "isAutoAddMargin": "false",
        //             "isolatedMargin": "15517.54150468",
        //             "leverage": "10",
        //             "liquidationPrice": "5930.78",
        //             "markPrice": "6679.50671178",
        //             "maxNotionalValue": "20000000",
        //             "positionSide": "LONG",
        //             "positionAmt": "20.000", // negative value for 'SHORT'
        //             "symbol": "BTCUSDT",
        //             "unRealizedProfit": "2316.83423560",
        //             "updateTime": 1625474304765
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const rawPosition = response[i];
            const entryPriceString = this.safeString(rawPosition, 'entryPrice');
            if (Precise["default"].stringGt(entryPriceString, '0')) {
                result.push(this.parsePositionRisk(response[i]));
            }
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    /**
     * @method
     * @name aster#fetchPositions
     * @description fetch all open positions
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] method name to call, "positionRisk", "account" or "option", default is "positionRisk"
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        let defaultMethod = undefined;
        [defaultMethod, params] = this.handleOptionAndParams(params, 'fetchPositions', 'method');
        if (defaultMethod === undefined) {
            const options = this.safeDict(this.options, 'fetchPositions');
            if (options === undefined) {
                defaultMethod = this.safeString(this.options, 'fetchPositions', 'positionRisk');
            }
            else {
                defaultMethod = 'positionRisk';
            }
        }
        if (defaultMethod === 'positionRisk') {
            return await this.fetchPositionsRisk(symbols, params);
        }
        else if (defaultMethod === 'account') {
            return await this.fetchAccountPositions(symbols, params);
        }
        else {
            throw new errors.NotSupported(this.id + '.options["fetchPositions"]["method"] or params["method"] = "' + defaultMethod + '" is invalid, please choose between "account" and "positionRisk"');
        }
    }
    parseAccountPositions(account, filterClosed = false) {
        const positions = this.safeList(account, 'positions');
        const assets = this.safeList(account, 'assets', []);
        const balances = {};
        for (let i = 0; i < assets.length; i++) {
            const entry = assets[i];
            const currencyId = this.safeString(entry, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const crossWalletBalance = this.safeString(entry, 'crossWalletBalance');
            const crossUnPnl = this.safeString(entry, 'crossUnPnl');
            balances[code] = {
                'crossMargin': Precise["default"].stringAdd(crossWalletBalance, crossUnPnl),
                'crossWalletBalance': crossWalletBalance,
            };
        }
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const marketId = this.safeString(position, 'symbol');
            const market = this.safeMarket(marketId, undefined, undefined, 'contract');
            const code = market['linear'] ? market['quote'] : market['base'];
            const maintenanceMargin = this.safeString(position, 'maintMargin');
            // check for maintenance margin so empty positions are not returned
            const isPositionOpen = (maintenanceMargin !== '0') && (maintenanceMargin !== '0.00000000');
            if (!filterClosed || isPositionOpen) {
                // sometimes not all the codes are correctly returned...
                if (code in balances) {
                    const parsed = this.parseAccountPosition(this.extend(position, {
                        'crossMargin': balances[code]['crossMargin'],
                        'crossWalletBalance': balances[code]['crossWalletBalance'],
                    }), market);
                    result.push(parsed);
                }
            }
        }
        return result;
    }
    parseAccountPosition(position, market = undefined) {
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeString(market, 'symbol');
        const leverageString = this.safeString(position, 'leverage');
        const leverage = (leverageString !== undefined) ? parseInt(leverageString) : undefined;
        const initialMarginString = this.safeString(position, 'initialMargin');
        const initialMargin = this.parseNumber(initialMarginString);
        let initialMarginPercentageString = undefined;
        if (leverageString !== undefined) {
            initialMarginPercentageString = Precise["default"].stringDiv('1', leverageString, 8);
            const rational = this.isRoundNumber(1000 % leverage);
            if (!rational) {
                initialMarginPercentageString = Precise["default"].stringDiv(Precise["default"].stringAdd(initialMarginPercentageString, '1e-8'), '1', 8);
            }
        }
        // as oppose to notionalValue
        const usdm = ('notional' in position);
        const maintenanceMarginString = this.safeString(position, 'maintMargin');
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        const entryPriceString = this.safeString(position, 'entryPrice');
        let entryPrice = this.parseNumber(entryPriceString);
        const notionalString = this.safeString2(position, 'notional', 'notionalValue');
        const notionalStringAbs = Precise["default"].stringAbs(notionalString);
        const notional = this.parseNumber(notionalStringAbs);
        let contractsString = this.safeString(position, 'positionAmt');
        let contractsStringAbs = Precise["default"].stringAbs(contractsString);
        if (contractsString === undefined) {
            const entryNotional = Precise["default"].stringMul(Precise["default"].stringMul(leverageString, initialMarginString), entryPriceString);
            const contractSizeNew = this.safeString(market, 'contractSize');
            contractsString = Precise["default"].stringDiv(entryNotional, contractSizeNew);
            contractsStringAbs = Precise["default"].stringDiv(Precise["default"].stringAdd(contractsString, '0.5'), '1', 0);
        }
        const contracts = this.parseNumber(contractsStringAbs);
        const leverageBrackets = this.safeDict(this.options, 'leverageBrackets', {});
        const leverageBracket = this.safeList(leverageBrackets, symbol, []);
        let maintenanceMarginPercentageString = undefined;
        for (let i = 0; i < leverageBracket.length; i++) {
            const bracket = leverageBracket[i];
            if (Precise["default"].stringLt(notionalStringAbs, bracket[0])) {
                break;
            }
            maintenanceMarginPercentageString = bracket[1];
        }
        const maintenanceMarginPercentage = this.parseNumber(maintenanceMarginPercentageString);
        const unrealizedPnlString = this.safeString(position, 'unrealizedProfit');
        const unrealizedPnl = this.parseNumber(unrealizedPnlString);
        let timestamp = this.safeInteger(position, 'updateTime');
        if (timestamp === 0) {
            timestamp = undefined;
        }
        let isolated = this.safeBool(position, 'isolated');
        if (isolated === undefined) {
            const isolatedMarginRaw = this.safeString(position, 'isolatedMargin');
            isolated = !Precise["default"].stringEq(isolatedMarginRaw, '0');
        }
        let marginMode = undefined;
        let collateralString = undefined;
        let walletBalance = undefined;
        if (isolated) {
            marginMode = 'isolated';
            walletBalance = this.safeString(position, 'isolatedWallet');
            collateralString = Precise["default"].stringAdd(walletBalance, unrealizedPnlString);
        }
        else {
            marginMode = 'cross';
            walletBalance = this.safeString(position, 'crossWalletBalance');
            collateralString = this.safeString(position, 'crossMargin');
        }
        const collateral = this.parseNumber(collateralString);
        let marginRatio = undefined;
        let side = undefined;
        let percentage = undefined;
        let liquidationPriceStringRaw = undefined;
        let liquidationPrice = undefined;
        const contractSize = this.safeValue(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        if (Precise["default"].stringEquals(notionalString, '0')) {
            entryPrice = undefined;
        }
        else {
            side = Precise["default"].stringLt(notionalString, '0') ? 'short' : 'long';
            marginRatio = this.parseNumber(Precise["default"].stringDiv(Precise["default"].stringAdd(Precise["default"].stringDiv(maintenanceMarginString, collateralString), '5e-5'), '1', 4));
            percentage = this.parseNumber(Precise["default"].stringMul(Precise["default"].stringDiv(unrealizedPnlString, initialMarginString, 4), '100'));
            if (usdm) {
                // calculate liquidation price
                //
                // liquidationPrice = (walletBalance / (contracts * (±1 + mmp))) + (±entryPrice / (±1 + mmp))
                //
                // mmp = maintenanceMarginPercentage
                // where ± is negative for long and positive for short
                // TODO: calculate liquidation price for coinm contracts
                let onePlusMaintenanceMarginPercentageString = undefined;
                let entryPriceSignString = entryPriceString;
                if (side === 'short') {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('1', maintenanceMarginPercentageString);
                }
                else {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('-1', maintenanceMarginPercentageString);
                    entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                }
                const leftSide = Precise["default"].stringDiv(walletBalance, Precise["default"].stringMul(contractsStringAbs, onePlusMaintenanceMarginPercentageString));
                const rightSide = Precise["default"].stringDiv(entryPriceSignString, onePlusMaintenanceMarginPercentageString);
                liquidationPriceStringRaw = Precise["default"].stringAdd(leftSide, rightSide);
            }
            else {
                // calculate liquidation price
                //
                // liquidationPrice = (contracts * contractSize(±1 - mmp)) / (±1/entryPrice * contracts * contractSize - walletBalance)
                //
                let onePlusMaintenanceMarginPercentageString = undefined;
                let entryPriceSignString = entryPriceString;
                if (side === 'short') {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('1', maintenanceMarginPercentageString);
                }
                else {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('-1', maintenanceMarginPercentageString);
                    entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                }
                const size = Precise["default"].stringMul(contractsStringAbs, contractSizeString);
                const leftSide = Precise["default"].stringMul(size, onePlusMaintenanceMarginPercentageString);
                const rightSide = Precise["default"].stringSub(Precise["default"].stringMul(Precise["default"].stringDiv('1', entryPriceSignString), size), walletBalance);
                liquidationPriceStringRaw = Precise["default"].stringDiv(leftSide, rightSide);
            }
            const pricePrecision = this.precisionFromString(this.safeString(market['precision'], 'price'));
            const pricePrecisionPlusOne = pricePrecision + 1;
            const pricePrecisionPlusOneString = pricePrecisionPlusOne.toString();
            // round half up
            const rounder = new Precise["default"]('5e-' + pricePrecisionPlusOneString);
            const rounderString = rounder.toString();
            const liquidationPriceRoundedString = Precise["default"].stringAdd(rounderString, liquidationPriceStringRaw);
            let truncatedLiquidationPrice = Precise["default"].stringDiv(liquidationPriceRoundedString, '1', pricePrecision);
            if (truncatedLiquidationPrice[0] === '-') {
                // user cannot be liquidated
                // since he has more collateral than the size of the position
                truncatedLiquidationPrice = undefined;
            }
            liquidationPrice = this.parseNumber(truncatedLiquidationPrice);
        }
        const positionSide = this.safeString(position, 'positionSide');
        const hedged = positionSide !== 'BOTH';
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'initialMargin': initialMargin,
            'initialMarginPercentage': this.parseNumber(initialMarginPercentageString),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'entryPrice': entryPrice,
            'notional': notional,
            'leverage': this.parseNumber(leverageString),
            'unrealizedPnl': unrealizedPnl,
            'contracts': contracts,
            'contractSize': contractSize,
            'marginRatio': marginRatio,
            'liquidationPrice': liquidationPrice,
            'markPrice': undefined,
            'collateral': collateral,
            'marginMode': marginMode,
            'side': side,
            'hedged': hedged,
            'percentage': percentage,
        };
    }
    /**
     * @method
     * @name aster#fetchAccountPositions
     * @ignore
     * @description fetch account positions
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} data on account positions
     */
    async fetchAccountPositions(symbols = undefined, params = {}) {
        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositions() requires an array argument for symbols');
            }
        }
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        const response = await this.fapiPrivateGetV4Account(params);
        let filterClosed = undefined;
        [filterClosed, params] = this.handleOptionAndParams(params, 'fetchAccountPositions', 'filterClosed', false);
        const result = this.parseAccountPositions(response, filterClosed);
        symbols = this.marketSymbols(symbols);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    async loadLeverageBrackets(reload = false, params = {}) {
        await this.loadMarkets();
        // by default cache the leverage bracket
        // it contains useful stuff like the maintenance margin and initial margin for positions
        const leverageBrackets = this.safeDict(this.options, 'leverageBrackets');
        if ((leverageBrackets === undefined) || (reload)) {
            const response = await this.fapiPrivateGetV1LeverageBracket(params);
            this.options['leverageBrackets'] = this.createSafeDictionary();
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const marketId = this.safeString(entry, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, undefined, 'contract');
                const brackets = this.safeList(entry, 'brackets', []);
                const result = [];
                for (let j = 0; j < brackets.length; j++) {
                    const bracket = brackets[j];
                    const floorValue = this.safeString(bracket, 'notionalFloor');
                    const maintenanceMarginPercentage = this.safeString(bracket, 'maintMarginRatio');
                    result.push([floorValue, maintenanceMarginPercentage]);
                }
                this.options['leverageBrackets'][symbol] = result;
            }
        }
        return this.options['leverageBrackets'];
    }
    keccakMessage(message) {
        return '0x' + this.hash(message, sha3.keccak_256, 'hex');
    }
    signMessage(message, privateKey) {
        return this.signHash(this.keccakMessage(message), privateKey.slice(-64));
    }
    signWithdrawPayload(withdrawPayload, network) {
        const zeroAddress = this.safeString(this.options, 'zeroAddress');
        const chainId = this.safeInteger(withdrawPayload, 'chainId');
        const domain = {
            'chainId': chainId,
            'name': 'Aster',
            'verifyingContract': zeroAddress,
            'version': '1',
        };
        const messageTypes = {
            'Action': [
                { 'name': 'type', 'type': 'string' },
                { 'name': 'destination', 'type': 'address' },
                { 'name': 'destination Chain', 'type': 'string' },
                { 'name': 'token', 'type': 'string' },
                { 'name': 'amount', 'type': 'string' },
                { 'name': 'fee', 'type': 'string' },
                { 'name': 'nonce', 'type': 'uint256' },
                { 'name': 'aster chain', 'type': 'string' },
            ],
        };
        const withdraw = {
            'type': 'Withdraw',
            'destination': this.safeString(withdrawPayload, 'receiver'),
            'destination Chain': network,
            'token': this.safeString(withdrawPayload, 'asset'),
            'amount': this.safeString(withdrawPayload, 'amount'),
            'fee': this.safeString(withdrawPayload, 'fee'),
            'nonce': this.safeInteger(withdrawPayload, 'nonce'),
            'aster chain': 'Mainnet',
        };
        const msg = this.ethEncodeStructuredData(domain, messageTypes, withdraw);
        const signature = this.signMessage(msg, this.privateKey);
        return signature;
    }
    /**
     * @method
     * @name aster#withdraw
     * @description make a withdrawal
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#withdraw-user_data
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'receiver': address,
            'nonce': this.milliseconds() * 1000,
        };
        let chainId = this.safeInteger(params, 'chainId');
        // TODO: check how ARBI signature would work
        const networks = this.safeDict(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network');
        network = this.safeString(networks, network, network);
        if ((chainId === undefined) && (network !== undefined)) {
            const chainIds = this.safeDict(this.options, 'networksToChainId', {});
            chainId = this.safeInteger(chainIds, network);
        }
        if (chainId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw require chainId or network parameter');
        }
        request['chainId'] = chainId;
        const fee = this.safeString(params, 'fee');
        if (fee === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw require fee parameter');
        }
        request['fee'] = fee;
        params = this.omit(params, ['chainId', 'network', 'fee']);
        request['amount'] = this.currencyToPrecision(code, amount, network);
        request['userSignature'] = this.signWithdrawPayload(request, network);
        const response = await this.sapiPrivatePostV1AsterUserWithdraw(this.extend(request, params));
        return {
            'info': response,
            'id': this.safeString(response, 'withdrawId'),
            'txid': this.safeString(response, 'hash'),
            'timestamp': undefined,
            'datetime': undefined,
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': undefined,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name aster#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#transfer-asset-to-other-address-trade
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#transfer-between-futures-and-spot-user_data
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        let type = undefined;
        let fromId = undefined;
        if (fromAccount !== undefined) {
            fromId = this.convertTypeToAccount(fromAccount).toUpperCase();
        }
        let toId = undefined;
        if (toAccount !== undefined) {
            toId = this.convertTypeToAccount(toAccount).toUpperCase();
        }
        if (fromId === 'SPOT' && toId === 'FUTURE') {
            type = 'SPOT_FUTURE';
        }
        else if (fromId === 'FUTURE' && toId === 'SPOT') {
            type = 'FUTURE_SPOT';
        }
        let response = undefined;
        if (type !== undefined) {
            const defaultClientTranId = this.numberToString(this.milliseconds());
            const clientTranId = this.safeString(params, 'clientTranId', defaultClientTranId);
            request['kindType'] = type;
            request['clientTranId'] = clientTranId;
            response = await this.fapiPrivatePostV1AssetWalletTransfer(this.extend(request, params));
        }
        else {
            // transfer asset to other address
            request['toAddress'] = toAccount;
            response = await this.sapiPrivatePostV1AssetSendToAddress(this.extend(request, params));
        }
        //
        //     {
        //         "tranId":13526853623,
        //         "status": "SUCCESS"
        //     }
        //
        return {
            'info': response,
            'id': this.safeString(response, 'tranId'),
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'address': undefined,
            'addressTo': fromAccount,
            'addressFrom': toAccount,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': 'transfer',
            'amount': amount,
            'currency': code,
            'status': undefined,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    hashMessage(binaryMessage) {
        // const binaryMessage = this.encode (message);
        const binaryMessageLength = this.binaryLength(binaryMessage);
        const x19 = this.base16ToBinary('19');
        const newline = this.base16ToBinary('0a');
        const prefix = this.binaryConcat(x19, this.encode('Ethereum Signed Message:'), newline, this.encode(this.numberToString(binaryMessageLength)));
        return '0x' + this.hash(this.binaryConcat(prefix, binaryMessage), sha3.keccak_256, 'hex');
    }
    signHash(hash, privateKey) {
        this.checkRequiredCredentials();
        const signature = crypto.ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1.secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16(this.sum(27, signature['v']));
        return '0x' + r.padStart(64, '0') + s.padStart(64, '0') + v;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname(this.urls['api'][api]) + '/' + path;
        if (api === 'fapiPublic' || api === 'sapiPublic') {
            if (Object.keys(params).length) {
                url += '?' + this.rawencode(params);
            }
        }
        else if (api === 'fapiPrivate' || api === 'sapiPrivate') {
            this.checkRequiredCredentials();
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            const nonce = this.milliseconds();
            const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
            let extendedParams = this.extend({
                'timestamp': nonce,
            }, params);
            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger(params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }
            let query = undefined;
            if ((method === 'DELETE') && (path === 'v1/batchOrders')) {
                const orderidlist = this.safeList(extendedParams, 'orderIdList', []);
                const origclientorderidlist = this.safeList(extendedParams, 'origClientOrderIdList', []);
                extendedParams = this.omit(extendedParams, ['orderIdList', 'origClientOrderIdList']);
                query = this.rawencode(extendedParams);
                const orderidlistLength = orderidlist.length;
                const origclientorderidlistLength = origclientorderidlist.length;
                if (orderidlistLength > 0) {
                    query = query + '&' + 'orderidlist=%5B' + orderidlist.join('%2C') + '%5D';
                }
                if (origclientorderidlistLength > 0) {
                    query = query + '&' + 'origclientorderidlist=%5B' + origclientorderidlist.join('%2C') + '%5D';
                }
            }
            else {
                query = this.rawencode(extendedParams);
            }
            let signature = '';
            if (path.indexOf('v3') >= 0) {
                const signerAddress = this.options['signerAddress'];
                if (signerAddress === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' requires signerAddress in options when use v3 api');
                }
                // the keys order matter
                const keys = Object.keys(extendedParams);
                const sortedKeys = this.sort(keys);
                const signingPayload = {};
                for (let i = 0; i < sortedKeys.length; i++) {
                    const key = sortedKeys[i];
                    signingPayload[key] = extendedParams[key].toString();
                }
                const signingHash = this.hashMessage(this.hash(this.ethAbiEncode([
                    'string', 'address', 'address', 'uint256',
                ], [this.json(signingPayload), this.walletAddress, signerAddress, nonce]), sha3.keccak_256, 'binary'));
                signature = this.signHash(signingHash, this.privateKey);
                extendedParams['user'] = this.walletAddress;
                extendedParams['signer'] = signerAddress;
                extendedParams['nonce'] = nonce;
                query = this.rawencode(extendedParams);
            }
            else {
                signature = this.hmac(this.encode(query), this.encode(this.secret), sha256.sha256);
            }
            query += '&' + 'signature=' + signature;
            if (method === 'GET') {
                url += '?' + query;
            }
            else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //    {
        //        "code": -1121,
        //        "msg": "Invalid symbol.",
        //    }
        //
        const code = this.safeString(response, 'code');
        const message = this.safeString(response, 'msg');
        if (code !== undefined && code !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

exports["default"] = aster;
