'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable } = require ('./base/errors');
const { ROUND, TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': [ 'JP', 'MT' ], // Japan, Malta
            'rateLimit': 500,
            'certified': true,
            'pro': true,
            // new metainfo interface
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': 'emulated',
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'withdraw': true,
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
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'test': {
                    'dapiPublic': 'https://testnet.binancefuture.com/dapi/v1',
                    'dapiPrivate': 'https://testnet.binancefuture.com/dapi/v1',
                    'fapiPublic': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPrivate': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPrivateV2': 'https://testnet.binancefuture.com/fapi/v2',
                    'public': 'https://testnet.binance.vision/api/v3',
                    'private': 'https://testnet.binance.vision/api/v3',
                    'v3': 'https://testnet.binance.vision/api/v3',
                    'v1': 'https://testnet.binance.vision/api/v1',
                },
                'api': {
                    'wapi': 'https://api.binance.com/wapi/v3',
                    'sapi': 'https://api.binance.com/sapi/v1',
                    'dapiPublic': 'https://dapi.binance.com/dapi/v1',
                    'dapiPrivate': 'https://dapi.binance.com/dapi/v1',
                    'dapiData': 'https://dapi.binance.com/futures/data',
                    'fapiPublic': 'https://fapi.binance.com/fapi/v1',
                    'fapiPrivate': 'https://fapi.binance.com/fapi/v1',
                    'fapiData': 'https://fapi.binance.com/futures/data',
                    'fapiPrivateV2': 'https://fapi.binance.com/fapi/v2',
                    'public': 'https://api.binance.com/api/v3',
                    'private': 'https://api.binance.com/api/v3',
                    'v3': 'https://api.binance.com/api/v3',
                    'v1': 'https://api.binance.com/api/v1',
                },
                'www': 'https://www.binance.com',
                'referral': 'https://www.binance.com/?ref=10205187',
                'doc': [
                    'https://binance-docs.github.io/apidocs/spot/en',
                ],
                'api_management': 'https://www.binance.com/en/usercenter/settings/api-management',
                'fees': 'https://www.binance.com/en/fee/schedule',
            },
            'api': {
                // the API structure below will need 3-layer apidefs
                'sapi': {
                    'get': [
                        'accountSnapshot',
                        // these endpoints require this.apiKey
                        'margin/asset',
                        'margin/pair',
                        'margin/allAssets',
                        'margin/allPairs',
                        'margin/priceIndex',
                        // these endpoints require this.apiKey + this.secret
                        'asset/assetDividend',
                        'asset/transfer',
                        'margin/loan',
                        'margin/repay',
                        'margin/account',
                        'margin/transfer',
                        'margin/interestHistory',
                        'margin/forceLiquidationRec',
                        'margin/order',
                        'margin/openOrders',
                        'margin/allOrders',
                        'margin/myTrades',
                        'margin/maxBorrowable',
                        'margin/maxTransferable',
                        'margin/isolated/transfer',
                        'margin/isolated/account',
                        'margin/isolated/pair',
                        'margin/isolated/allPairs',
                        'futures/transfer',
                        'futures/loan/borrow/history',
                        'futures/loan/repay/history',
                        'futures/loan/wallet',
                        'futures/loan/configs',
                        'futures/loan/calcAdjustLevel',
                        'futures/loan/calcMaxAdjustAmount',
                        'futures/loan/adjustCollateral/history',
                        'futures/loan/liquidationHistory',
                        // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
                        'capital/config/getall', // get networks for withdrawing USDT ERC20 vs USDT Omni
                        'capital/deposit/address',
                        'capital/deposit/hisrec',
                        'capital/deposit/subAddress',
                        'capital/deposit/subHisrec',
                        'capital/withdraw/history',
                        'sub-account/futures/account',
                        'sub-account/futures/accountSummary',
                        'sub-account/futures/positionRisk',
                        'sub-account/futures/internalTransfer',
                        'sub-account/margin/account',
                        'sub-account/margin/accountSummary',
                        'sub-account/spotSummary',
                        'sub-account/status',
                        'sub-account/transfer/subUserHistory',
                        'sub-account/universalTransfer',
                        // lending endpoints
                        'lending/daily/product/list',
                        'lending/daily/userLeftQuota',
                        'lending/daily/userRedemptionQuota',
                        'lending/daily/token/position',
                        'lending/union/account',
                        'lending/union/purchaseRecord',
                        'lending/union/redemptionRecord',
                        'lending/union/interestHistory',
                        'lending/project/list',
                        'lending/project/position/list',
                        // mining endpoints
                        'mining/pub/algoList',
                        'mining/pub/coinList',
                        'mining/worker/detail',
                        'mining/worker/list',
                        'mining/payment/list',
                        'mining/statistics/user/status',
                        'mining/statistics/user/list',
                        // liquid swap endpoints
                        'bswap/pools',
                        'bswap/liquidity',
                        'bswap/liquidityOps',
                        'bswap/quote',
                        'bswap/swap',
                        // leveraged token endpoints
                        'blvt/tokenInfo',
                        'blvt/subscribe/record',
                        'blvt/redeem/record',
                        'blvt/userLimit',
                        // broker api
                        'apiReferral/ifNewUser',
                        'apiReferral/customization',
                        'apiReferral/userCustomization',
                        'apiReferral/rebate/recentRecord',
                        'apiReferral/rebate/historicalRecord',
                        'apiReferral/kickback/recentRecord',
                        'apiReferral/kickback/historicalRecord',
                    ],
                    'post': [
                        'asset/dust',
                        'asset/transfer',
                        'account/disableFastWithdrawSwitch',
                        'account/enableFastWithdrawSwitch',
                        'capital/withdraw/apply',
                        'margin/transfer',
                        'margin/loan',
                        'margin/repay',
                        'margin/order',
                        'margin/isolated/create',
                        'margin/isolated/transfer',
                        'sub-account/margin/transfer',
                        'sub-account/margin/enable',
                        'sub-account/margin/enable',
                        'sub-account/futures/enable',
                        'sub-account/futures/transfer',
                        'sub-account/futures/internalTransfer',
                        'sub-account/transfer/subToSub',
                        'sub-account/transfer/subToMaster',
                        'sub-account/universalTransfer',
                        'userDataStream',
                        'userDataStream/isolated',
                        'futures/transfer',
                        'futures/loan/borrow',
                        'futures/loan/repay',
                        'futures/loan/adjustCollateral',
                        // lending
                        'lending/customizedFixed/purchase',
                        'lending/daily/purchase',
                        'lending/daily/redeem',
                        // liquid swap endpoints
                        'bswap/liquidityAdd',
                        'bswap/liquidityRemove',
                        'bswap/swap',
                        // leveraged token endpoints
                        'blvt/subscribe',
                        'blvt/redeem',
                        // broker api
                        'apiReferral/customization',
                        'apiReferral/userCustomization',
                        'apiReferral/rebate/historicalRecord',
                        'apiReferral/kickback/historicalRecord',
                    ],
                    'put': [
                        'userDataStream',
                        'userDataStream/isolated',
                    ],
                    'delete': [
                        'margin/openOrders',
                        'margin/order',
                        'userDataStream',
                        'userDataStream/isolated',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'sub-account/transfer',
                    ],
                    'get': [
                        'depositHistory',
                        'withdrawHistory',
                        'depositAddress',
                        'accountStatus',
                        'systemStatus',
                        'apiTradingStatus',
                        'userAssetDribbletLog',
                        'tradeFee',
                        'assetDetail',
                        'sub-account/list',
                        'sub-account/transfer/history',
                        'sub-account/assets',
                    ],
                },
                'dapiPublic': {
                    'get': [
                        'ping',
                        'time',
                        'exchangeInfo',
                        'depth',
                        'trades',
                        'historicalTrades',
                        'aggTrades',
                        'premiumIndex',
                        'fundingRate',
                        'klines',
                        'continuousKlines',
                        'indexPriceKlines',
                        'markPriceKlines',
                        'ticker/24hr',
                        'ticker/price',
                        'ticker/bookTicker',
                        'allForceOrders',
                        'openInterest',
                    ],
                },
                'dapiData': {
                    'get': [
                        'openInterestHist',
                        'topLongShortAccountRatio',
                        'topLongShortPositionRatio',
                        'globalLongShortAccountRatio',
                        'takerBuySellVol',
                        'basis',
                    ],
                },
                'dapiPrivate': {
                    'get': [
                        'positionSide/dual',
                        'order',
                        'openOrder',
                        'openOrders',
                        'allOrders',
                        'balance',
                        'account',
                        'positionMargin/history',
                        'positionRisk',
                        'userTrades',
                        'income',
                        'leverageBracket',
                        'forceOrders',
                        'adlQuantile',
                    ],
                    'post': [
                        'positionSide/dual',
                        'order',
                        'batchOrders',
                        'countdownCancelAll',
                        'leverage',
                        'marginType',
                        'positionMargin',
                        'listenKey',
                    ],
                    'put': [
                        'listenKey',
                    ],
                    'delete': [
                        'order',
                        'allOpenOrders',
                        'batchOrders',
                        'listenKey',
                    ],
                },
                'fapiPublic': {
                    'get': [
                        'ping',
                        'time',
                        'exchangeInfo',
                        'depth',
                        'trades',
                        'historicalTrades',
                        'aggTrades',
                        'klines',
                        'fundingRate',
                        'premiumIndex',
                        'ticker/24hr',
                        'ticker/price',
                        'ticker/bookTicker',
                        'allForceOrders',
                        'openInterest',
                        'indexInfo',
                    ],
                },
                'fapiData': {
                    'get': [
                        'openInterestHist',
                        'topLongShortAccountRatio',
                        'topLongShortPositionRatio',
                        'globalLongShortAccountRatio',
                        'takerlongshortRatio',
                    ],
                },
                'fapiPrivate': {
                    'get': [
                        'allForceOrders',
                        'allOrders',
                        'openOrder',
                        'openOrders',
                        'order',
                        'account',
                        'balance',
                        'leverageBracket',
                        'positionMargin/history',
                        'positionRisk',
                        'positionSide/dual',
                        'userTrades',
                        'income',
                        // broker endpoints
                        'apiReferral/ifNewUser',
                        'apiReferral/customization',
                        'apiReferral/userCustomization',
                        'apiReferral/traderNum',
                        'apiReferral/overview',
                        'apiReferral/tradeVol',
                        'apiReferral/rebateVol',
                        'apiReferral/traderSummary',
                    ],
                    'post': [
                        'batchOrders',
                        'positionSide/dual',
                        'positionMargin',
                        'marginType',
                        'order',
                        'leverage',
                        'listenKey',
                        'countdownCancelAll',
                        // broker endpoints
                        'apiReferral/customization',
                        'apiReferral/userCustomization',
                    ],
                    'put': [
                        'listenKey',
                    ],
                    'delete': [
                        'batchOrders',
                        'order',
                        'allOpenOrders',
                        'listenKey',
                    ],
                },
                'fapiPrivateV2': {
                    'get': [
                        'account',
                        'balance',
                        'positionRisk',
                    ],
                },
                'v3': {
                    'get': [
                        'ticker/price',
                        'ticker/bookTicker',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'trades',
                        'aggTrades',
                        'historicalTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/price',
                        'ticker/bookTicker',
                        'exchangeInfo',
                    ],
                    'put': [ 'userDataStream' ],
                    'post': [ 'userDataStream' ],
                    'delete': [ 'userDataStream' ],
                },
                'private': {
                    'get': [
                        'allOrderList', // oco
                        'openOrderList', // oco
                        'orderList', // oco
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order/oco',
                        'order',
                        'order/test',
                    ],
                    'delete': [
                        'openOrders', // added on 2020-04-25 for canceling all open orders per symbol
                        'orderList', // oco
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'commonCurrencies': {
                'BCC': 'BCC', // kept for backward-compatibility https://github.com/ccxt/ccxt/issues/4848
                'YOYO': 'YOYOW',
            },
            // exchange-specific options
            'options': {
                // 'fetchTradesMethod': 'publicGetAggTrades', // publicGetTrades, publicGetHistoricalTrades
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultType': 'spot', // 'spot', 'future', 'margin', 'delivery'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'RESULT', // we change it from 'ACK' by default to 'RESULT'
                },
                'quoteOrderQty': true, // whether market orders support amounts in quote currency
                'broker': {
                    'spot': 'x-R4BD3S82',
                    'margin': 'x-R4BD3S82',
                    'future': 'x-xcKtGhcu',
                    'delivery': 'x-xcKtGhcu',
                },
            },
            // https://binance-docs.github.io/apidocs/spot/en/#error-codes-2
            'exceptions': {
                'System abnormality': ExchangeError, // {"code":-1000,"msg":"System abnormality"}
                'You are not authorized to execute this request.': PermissionDenied, // {"msg":"You are not authorized to execute this request."}
                'API key does not exist': AuthenticationError,
                'Order would trigger immediately.': OrderImmediatelyFillable,
                'Stop price would trigger immediately.': OrderImmediatelyFillable, // {"code":-2010,"msg":"Stop price would trigger immediately."}
                'Order would immediately match and take.': OrderImmediatelyFillable, // {"code":-2010,"msg":"Order would immediately match and take."}
                'Account has insufficient balance for requested action.': InsufficientFunds,
                'Rest API trading is not enabled.': ExchangeNotAvailable,
                "You don't have permission.": PermissionDenied, // {"msg":"You don't have permission.","success":false}
                'Market is closed.': ExchangeNotAvailable, // {"code":-1013,"msg":"Market is closed."}
                'Too many requests.': DDoSProtection, // {"msg":"Too many requests. Please try again later.","success":false}
                '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '-1001': ExchangeNotAvailable, // 'Internal error; unable to process your request. Please try again.'
                '-1002': AuthenticationError, // 'You are not authorized to execute this request.'
                '-1003': RateLimitExceeded, // {"code":-1003,"msg":"Too much request weight used, current limit is 1200 request weight per 1 MINUTE. Please use the websocket for live updates to avoid polling the API."}
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1015': RateLimitExceeded, // 'Too many new orders; current limit is %s orders per %s.'
                '-1016': ExchangeNotAvailable, // 'This service is no longer available.',
                '-1020': BadRequest, // 'This operation is not supported.'
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                '-1100': BadRequest, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-1101': BadRequest, // Too many parameters; expected %s and received %s.
                '-1102': BadRequest, // Param %s or %s must be sent, but both were empty
                '-1103': BadRequest, // An unknown parameter was sent.
                '-1104': BadRequest, // Not all sent parameters were read, read 8 parameters but was sent 9
                '-1105': BadRequest, // Parameter %s was empty.
                '-1106': BadRequest, // Parameter %s sent when not required.
                '-1111': BadRequest, // Precision is over the maximum defined for this asset.
                '-1112': InvalidOrder, // No orders on book for symbol.
                '-1114': BadRequest, // TimeInForce parameter sent when not required.
                '-1115': BadRequest, // Invalid timeInForce.
                '-1116': BadRequest, // Invalid orderType.
                '-1117': BadRequest, // Invalid side.
                '-1118': BadRequest, // New client order ID was empty.
                '-1119': BadRequest, // Original client order ID was empty.
                '-1120': BadRequest, // Invalid interval.
                '-1121': BadSymbol, // Invalid symbol.
                '-1125': AuthenticationError, // This listenKey does not exist.
                '-1127': BadRequest, // More than %s hours between startTime and endTime.
                '-1128': BadRequest, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                '-1130': BadRequest, // Data sent for paramter %s is not valid.
                '-1131': BadRequest, // recvWindow must be less than 60000
                '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
                '-2019': InsufficientFunds, // {"code":-2019,"msg":"Margin is insufficient."}
                '-3005': InsufficientFunds, // {"code":-3005,"msg":"Transferring out not allowed. Transfer out amount exceeds max amount."}
                '-3008': InsufficientFunds, // {"code":-3008,"msg":"Borrow not allowed. Your borrow amount has exceed maximum borrow amount."}
                '-3010': ExchangeError, // {"code":-3010,"msg":"Repay not allowed. Repay amount exceeds borrow amount."}
                '-3022': AccountSuspended, // You account's trading is banned.
                '-4028': BadRequest, // {"code":-4028,"msg":"Leverage 100 is not valid"}
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        const type = this.safeString2 (this.options, 'fetchTime', 'defaultType', 'spot');
        let method = 'publicGetTime';
        if (type === 'future') {
            method = 'fapiPublicGetTime';
        } else if (type === 'delivery') {
            method = 'dapiPublicGetTime';
        }
        const response = await this[method] (params);
        return this.safeInteger (response, 'serverTime');
    }

    async loadTimeDifference (params = {}) {
        const serverTime = await this.fetchTime (params);
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        if ((type !== 'spot') && (type !== 'future') && (type !== 'margin') && (type !== 'delivery')) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to 'spot', 'margin', 'delivery' or 'future'"); // eslint-disable-line quotes
        }
        let method = 'publicGetExchangeInfo';
        if (type === 'future') {
            method = 'fapiPublicGetExchangeInfo';
        } else if (type === 'delivery') {
            method = 'dapiPublicGetExchangeInfo';
        }
        const response = await this[method] (query);
        //
        // spot / margin
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575416692969,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"SECOND","intervalNum":10,"limit":100},
        //             {"rateLimitType":"ORDERS","interval":"DAY","intervalNum":1,"limit":200000}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"ETHBTC",
        //                 "status":"TRADING",
        //                 "baseAsset":"ETH",
        //                 "baseAssetPrecision":8,
        //                 "quoteAsset":"BTC",
        //                 "quotePrecision":8,
        //                 "baseCommissionPrecision":8,
        //                 "quoteCommissionPrecision":8,
        //                 "orderTypes":["LIMIT","LIMIT_MAKER","MARKET","STOP_LOSS_LIMIT","TAKE_PROFIT_LIMIT"],
        //                 "icebergAllowed":true,
        //                 "ocoAllowed":true,
        //                 "quoteOrderQtyMarketAllowed":true,
        //                 "isSpotTradingAllowed":true,
        //                 "isMarginTradingAllowed":true,
        //                 "filters":[
        //                     {"filterType":"PRICE_FILTER","minPrice":"0.00000100","maxPrice":"100000.00000000","tickSize":"0.00000100"},
        //                     {"filterType":"PERCENT_PRICE","multiplierUp":"5","multiplierDown":"0.2","avgPriceMins":5},
        //                     {"filterType":"LOT_SIZE","minQty":"0.00100000","maxQty":"100000.00000000","stepSize":"0.00100000"},
        //                     {"filterType":"MIN_NOTIONAL","minNotional":"0.00010000","applyToMarket":true,"avgPriceMins":5},
        //                     {"filterType":"ICEBERG_PARTS","limit":10},
        //                     {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"63100.00000000","stepSize":"0.00000000"},
        //                     {"filterType":"MAX_NUM_ALGO_ORDERS","maxNumAlgoOrders":5}
        //                 ]
        //             },
        //         ],
        //     }
        //
        // futures/usdt-margined (fapi)
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575417244353,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":1200}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "status":"TRADING",
        //                 "maintMarginPercent":"2.5000",
        //                 "requiredMarginPercent":"5.0000",
        //                 "baseAsset":"BTC",
        //                 "quoteAsset":"USDT",
        //                 "pricePrecision":2,
        //                 "quantityPrecision":3,
        //                 "baseAssetPrecision":8,
        //                 "quotePrecision":8,
        //                 "filters":[
        //                     {"minPrice":"0.01","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.01"},
        //                     {"stepSize":"0.001","filterType":"LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"stepSize":"0.001","filterType":"MARKET_LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes":["LIMIT","MARKET","STOP"],
        //                 "timeInForce":["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        //
        // delivery/coin-margined (dapi)
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": 1597667052958,
        //         "rateLimits": [
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":6000},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":6000}
        //         ],
        //         "exchangeFilters": [],
        //         "symbols": [
        //             {
        //                 "symbol": "BTCUSD_200925",
        //                 "pair": "BTCUSD",
        //                 "contractType": "CURRENT_QUARTER",
        //                 "deliveryDate": 1601020800000,
        //                 "onboardDate": 1590739200000,
        //                 "contractStatus": "TRADING",
        //                 "contractSize": 100,
        //                 "marginAsset": "BTC",
        //                 "maintMarginPercent": "2.5000",
        //                 "requiredMarginPercent": "5.0000",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USD",
        //                 "pricePrecision": 1,
        //                 "quantityPrecision": 0,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "equalQtyPrecision": 4,
        //                 "filters": [
        //                     {"minPrice":"0.1","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.1"},
        //                     {"stepSize":"1","filterType":"LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"stepSize":"0","filterType":"MARKET_LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.9500","multiplierUp":"1.0500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes": ["LIMIT","MARKET","STOP","STOP_MARKET","TAKE_PROFIT","TAKE_PROFIT_MARKET","TRAILING_STOP_MARKET"],
        //                 "timeInForce": ["GTC","IOC","FOK","GTX"]
        //             },
        //             {
        //                 "symbol": "BTCUSD_PERP",
        //                 "pair": "BTCUSD",
        //                 "contractType": "PERPETUAL",
        //                 "deliveryDate": 4133404800000,
        //                 "onboardDate": 1596006000000,
        //                 "contractStatus": "TRADING",
        //                 "contractSize": 100,
        //                 "marginAsset": "BTC",
        //                 "maintMarginPercent": "2.5000",
        //                 "requiredMarginPercent": "5.0000",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USD",
        //                 "pricePrecision": 1,
        //                 "quantityPrecision": 0,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "equalQtyPrecision": 4,
        //                 "filters": [
        //                     {"minPrice":"0.1","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.1"},
        //                     {"stepSize":"1","filterType":"LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"stepSize":"1","filterType":"MARKET_LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes": ["LIMIT","MARKET","STOP","STOP_MARKET","TAKE_PROFIT","TAKE_PROFIT_MARKET","TRAILING_STOP_MARKET"],
        //                 "timeInForce": ["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        //
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const markets = this.safeValue (response, 'symbols');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const spot = (type === 'spot');
            const future = (type === 'future');
            const delivery = (type === 'delivery');
            const id = this.safeString (market, 'symbol');
            const lowercaseId = this.safeStringLower (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const contractType = this.safeString (market, 'contractType');
            const idSymbol = (future || delivery) && (contractType !== 'PERPETUAL');
            const symbol = idSymbol ? id : (base + '/' + quote);
            const filters = this.safeValue (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            const precision = {
                'base': this.safeInteger (market, 'baseAssetPrecision'),
                'quote': this.safeInteger (market, 'quotePrecision'),
                'amount': this.safeInteger (market, 'baseAssetPrecision'),
                'price': this.safeInteger (market, 'quotePrecision'),
            };
            const status = this.safeString2 (market, 'status', 'contractStatus');
            const active = (status === 'TRADING');
            const margin = this.safeValue (market, 'isMarginTradingAllowed', future || delivery);
            const entry = {
                'id': id,
                'lowercaseId': lowercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': type,
                'spot': spot,
                'margin': margin,
                'future': future,
                'delivery': delivery,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
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
            };
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'PRICE_FILTER', {});
                // PRICE_FILTER reports zero values for maxPrice
                // since they updated filter types in November 2018
                // https://github.com/ccxt/ccxt/issues/4286
                // therefore limits['price']['max'] doesn't have any meaningful value except undefined
                entry['limits']['price'] = {
                    'min': this.safeFloat (filter, 'minPrice'),
                    'max': undefined,
                };
                const maxPrice = this.safeFloat (filter, 'maxPrice');
                if ((maxPrice !== undefined) && (maxPrice > 0)) {
                    entry['limits']['price']['max'] = maxPrice;
                }
                entry['precision']['price'] = this.precisionFromString (filter['tickSize']);
            }
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'LOT_SIZE', {});
                const stepSize = this.safeString (filter, 'stepSize');
                entry['precision']['amount'] = this.precisionFromString (stepSize);
                entry['limits']['amount'] = {
                    'min': this.safeFloat (filter, 'minQty'),
                    'max': this.safeFloat (filter, 'maxQty'),
                };
            }
            if ('MARKET_LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'MARKET_LOT_SIZE', {});
                entry['limits']['market'] = {
                    'min': this.safeFloat (filter, 'minQty'),
                    'max': this.safeFloat (filter, 'maxQty'),
                };
            }
            if ('MIN_NOTIONAL' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'MIN_NOTIONAL', {});
                entry['limits']['cost']['min'] = this.safeFloat2 (filter, 'minNotional', 'notional');
            }
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        let method = 'privateGetAccount';
        if (type === 'future') {
            const options = this.safeValue (this.options, 'future', {});
            const fetchBalanceOptions = this.safeValue (options, 'fetchBalance', {});
            method = this.safeString (fetchBalanceOptions, 'method', 'fapiPrivateV2GetAccount');
        } else if (type === 'delivery') {
            const options = this.safeValue (this.options, 'delivery', {});
            const fetchBalanceOptions = this.safeValue (options, 'fetchBalance', {});
            method = this.safeString (fetchBalanceOptions, 'method', 'dapiPrivateGetAccount');
        } else if (type === 'margin') {
            method = 'sapiGetMarginAccount';
        }
        const query = this.omit (params, 'type');
        const response = await this[method] (query);
        //
        // spot
        //
        //     {
        //         makerCommission: 10,
        //         takerCommission: 10,
        //         buyerCommission: 0,
        //         sellerCommission: 0,
        //         canTrade: true,
        //         canWithdraw: true,
        //         canDeposit: true,
        //         updateTime: 1575357359602,
        //         accountType: "MARGIN",
        //         balances: [
        //             { asset: "BTC", free: "0.00219821", locked: "0.00000000"  },
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         "borrowEnabled":true,
        //         "marginLevel":"999.00000000",
        //         "totalAssetOfBtc":"0.00000000",
        //         "totalLiabilityOfBtc":"0.00000000",
        //         "totalNetAssetOfBtc":"0.00000000",
        //         "tradeEnabled":true,
        //         "transferEnabled":true,
        //         "userAssets":[
        //             {"asset":"MATIC","borrowed":"0.00000000","free":"0.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"0.00000000"},
        //             {"asset":"VET","borrowed":"0.00000000","free":"0.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"0.00000000"},
        //             {"asset":"USDT","borrowed":"0.00000000","free":"0.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"0.00000000"}
        //         ],
        //     }
        //
        // futures (fapi)
        //
        //     fapiPrivateGetAccount
        //
        //     {
        //         "feeTier":0,
        //         "canTrade":true,
        //         "canDeposit":true,
        //         "canWithdraw":true,
        //         "updateTime":0,
        //         "totalInitialMargin":"0.00000000",
        //         "totalMaintMargin":"0.00000000",
        //         "totalWalletBalance":"4.54000000",
        //         "totalUnrealizedProfit":"0.00000000",
        //         "totalMarginBalance":"4.54000000",
        //         "totalPositionInitialMargin":"0.00000000",
        //         "totalOpenOrderInitialMargin":"0.00000000",
        //         "maxWithdrawAmount":"4.54000000",
        //         "assets":[
        //             {
        //                 "asset":"USDT",
        //                 "walletBalance":"4.54000000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "marginBalance":"4.54000000",
        //                 "maintMargin":"0.00000000",
        //                 "initialMargin":"0.00000000",
        //                 "positionInitialMargin":"0.00000000",
        //                 "openOrderInitialMargin":"0.00000000",
        //                 "maxWithdrawAmount":"4.54000000"
        //             }
        //         ],
        //         "positions":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "initialMargin":"0.00000",
        //                 "maintMargin":"0.00000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "positionInitialMargin":"0.00000",
        //                 "openOrderInitialMargin":"0.00000"
        //             }
        //         ]
        //     }
        //
        //     fapiPrivateV2GetAccount
        //
        //     {
        //         "feeTier":0,
        //         "canTrade":true,
        //         "canDeposit":true,
        //         "canWithdraw":true,
        //         "updateTime":0,
        //         "totalInitialMargin":"0.00000000",
        //         "totalMaintMargin":"0.00000000",
        //         "totalWalletBalance":"0.00000000",
        //         "totalUnrealizedProfit":"0.00000000",
        //         "totalMarginBalance":"0.00000000",
        //         "totalPositionInitialMargin":"0.00000000",
        //         "totalOpenOrderInitialMargin":"0.00000000",
        //         "totalCrossWalletBalance":"0.00000000",
        //         "totalCrossUnPnl":"0.00000000",
        //         "availableBalance":"0.00000000",
        //         "maxWithdrawAmount":"0.00000000",
        //         "assets":[
        //             {
        //                 "asset":"BNB",
        //                 "walletBalance":"0.01000000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "marginBalance":"0.01000000",
        //                 "maintMargin":"0.00000000",
        //                 "initialMargin":"0.00000000",
        //                 "positionInitialMargin":"0.00000000",
        //                 "openOrderInitialMargin":"0.00000000",
        //                 "maxWithdrawAmount":"0.01000000",
        //                 "crossWalletBalance":"0.01000000",
        //                 "crossUnPnl":"0.00000000",
        //                 "availableBalance":"0.01000000"
        //             }
        //         ],
        //         "positions":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "initialMargin":"0",
        //                 "maintMargin":"0",
        //                 "unrealizedProfit":"0.00000000",
        //                 "positionInitialMargin":"0",
        //                 "openOrderInitialMargin":"0",
        //                 "leverage":"20",
        //                 "isolated":false,
        //                 "entryPrice":"0.00000",
        //                 "maxNotional":"5000000",
        //                 "positionSide":"BOTH"
        //             },
        //         ]
        //     }
        //
        //     fapiPrivateV2GetBalance
        //
        //     [
        //         {
        //             "accountAlias":"FzFzXquXXqoC",
        //             "asset":"BNB",
        //             "balance":"0.01000000",
        //             "crossWalletBalance":"0.01000000",
        //             "crossUnPnl":"0.00000000",
        //             "availableBalance":"0.01000000",
        //             "maxWithdrawAmount":"0.01000000"
        //         }
        //     ]
        //
        const result = { 'info': response };
        if ((type === 'spot') || (type === 'margin')) {
            const balances = this.safeValue2 (response, 'balances', 'userAssets', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeFloat (balance, 'free');
                account['used'] = this.safeFloat (balance, 'locked');
                result[code] = account;
            }
        } else {
            let balances = response;
            if (!Array.isArray (response)) {
                balances = this.safeValue (response, 'assets', []);
            }
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeFloat (balance, 'availableBalance');
                account['used'] = this.safeFloat (balance, 'initialMargin');
                account['total'] = this.safeFloat2 (balance, 'marginBalance', 'balance');
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#order-book
        }
        let method = 'publicGetDepth';
        if (market['future']) {
            method = 'fapiPublicGetDepth';
        } else if (market['delivery']) {
            method = 'dapiPublicGetDepth';
        }
        const response = await this[method] (this.extend (request, params));
        const orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         symbol: 'ETHBTC',
        //         priceChange: '0.00068700',
        //         priceChangePercent: '2.075',
        //         weightedAvgPrice: '0.03342681',
        //         prevClosePrice: '0.03310300',
        //         lastPrice: '0.03378900',
        //         lastQty: '0.07700000',
        //         bidPrice: '0.03378900',
        //         bidQty: '7.16800000',
        //         askPrice: '0.03379000',
        //         askQty: '24.00000000',
        //         openPrice: '0.03310200',
        //         highPrice: '0.03388900',
        //         lowPrice: '0.03306900',
        //         volume: '205478.41000000',
        //         quoteVolume: '6868.48826294',
        //         openTime: 1601469986932,
        //         closeTime: 1601556386932,
        //         firstId: 196098772,
        //         lastId: 196186315,
        //         count: 87544
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQty'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQty'),
            'vwap': this.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchStatus (params = {}) {
        const response = await this.wapiGetSystemStatus (params);
        let status = this.safeValue (response, 'status');
        if (status !== undefined) {
            status = (status === 0) ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicGetTicker24hr';
        if (market['future']) {
            method = 'fapiPublicGetTicker24hr';
        } else if (market['delivery']) {
            method = 'dapiPublicGetTicker24hr';
        }
        const response = await this[method] (this.extend (request, params));
        if (Array.isArray (response)) {
            const firstTicker = this.safeValue (response, 0, {});
            return this.parseTicker (firstTicker, market);
        }
        return this.parseTicker (response, market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBidsAsks', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = undefined;
        if (type === 'future') {
            method = 'fapiPublicGetTickerBookTicker';
        } else if (type === 'delivery') {
            method = 'dapiPublicGetTickerBookTicker';
        } else {
            method = 'publicGetTickerBookTicker';
        }
        const response = await this[method] (query);
        return this.parseTickers (response, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let defaultMethod = undefined;
        if (type === 'future') {
            defaultMethod = 'fapiPublicGetTicker24hr';
        } else if (type === 'delivery') {
            defaultMethod = 'dapiPublicGetTicker24hr';
        } else {
            defaultMethod = 'publicGetTicker24hr';
        }
        const method = this.safeString (this.options, 'fetchTickersMethod', defaultMethod);
        const response = await this[method] (query);
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591478520000,
        //         "0.02501300",
        //         "0.02501800",
        //         "0.02500000",
        //         "0.02500000",
        //         "22.19000000",
        //         1591478579999,
        //         "0.55490906",
        //         40,
        //         "10.92900000",
        //         "0.27336462",
        //         "0"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // binance docs say that the default limit 500, max 1500 for futures, max 1000 for spot markets
        // the reality is that the time range wider than 500 candles won't work right
        const defaultLimit = 500;
        const maxLimit = 1500;
        limit = (limit === undefined) ? defaultLimit : Math.min (limit, maxLimit);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
            'limit': limit,
        };
        const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['startTime'] = since;
            if (since > 0) {
                const endTime = this.sum (since, limit * duration * 1000 - 1);
                const now = this.milliseconds ();
                request['endTime'] = Math.min (now, endTime);
            }
        }
        let method = 'publicGetKlines';
        if (market['future']) {
            method = 'fapiPublicGetKlines';
        } else if (market['delivery']) {
            method = 'dapiPublicGetKlines';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         [1591478520000,"0.02501300","0.02501800","0.02500000","0.02500000","22.19000000",1591478579999,"0.55490906",40,"10.92900000","0.27336462","0"],
        //         [1591478580000,"0.02499600","0.02500900","0.02499400","0.02500300","21.34700000",1591478639999,"0.53370468",24,"7.53800000","0.18850725","0"],
        //         [1591478640000,"0.02500800","0.02501100","0.02500300","0.02500800","154.14200000",1591478699999,"3.85405839",97,"5.32300000","0.13312641","0"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        if ('isDustTrade' in trade) {
            return this.parseDustTrade (trade, market);
        }
        //
        // aggregate trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // futures trades
        // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
        //
        //     {
        //       "accountId": 20,
        //       "buyer": False,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "counterPartyId": 653,
        //       "id": 698759,
        //       "maker": False,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "0.01563",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const price = this.safeFloat2 (trade, 'p', 'price');
        const amount = this.safeFloat2 (trade, 'q', 'qty');
        const id = this.safeString2 (trade, 'a', 'id');
        let side = undefined;
        const orderId = this.safeString (trade, 'orderId');
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else if ('isBuyerMaker' in trade) {
            side = trade['isBuyerMaker'] ? 'sell' : 'buy';
        } else if ('side' in trade) {
            side = this.safeStringLower (trade, 'side');
        } else {
            if ('isBuyer' in trade) {
                side = trade['isBuyer'] ? 'buy' : 'sell'; // this is a true side
            }
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAsset')),
            };
        }
        let takerOrMaker = undefined;
        if ('isMaker' in trade) {
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            // 'limit': 500,     // default = 500, maximum = 1000
        };
        const defaultType = this.safeString2 (this.options, 'fetchTrades', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let defaultMethod = undefined;
        if (type === 'future') {
            defaultMethod = 'fapiPublicGetAggTrades';
        } else if (type === 'delivery') {
            defaultMethod = 'dapiPublicGetAggTrades';
        } else {
            defaultMethod = 'publicGetAggTrades';
        }
        let method = this.safeString (this.options, 'fetchTradesMethod', defaultMethod);
        if (method === 'publicGetAggTrades') {
            if (since !== undefined) {
                request['startTime'] = since;
                // https://github.com/ccxt/ccxt/issues/6400
                // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
                request['endTime'] = this.sum (since, 3600000);
            }
            if (type === 'future') {
                method = 'fapiPublicGetAggTrades';
            } else if (type === 'delivery') {
                method = 'dapiPublicGetAggTrades';
            }
        } else if (method === 'publicGetHistoricalTrades') {
            if (type === 'future') {
                method = 'fapiPublicGetHistoricalTrades';
            } else if (type === 'delivery') {
                method = 'dapiPublicGetHistoricalTrades';
            }
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - 'tradeId' accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        const response = await this[method] (this.extend (request, query));
        //
        // aggregate trades
        //
        //     [
        //         {
        //             "a": 26129,         // Aggregate tradeId
        //             "p": "0.01633102",  // Price
        //             "q": "4.70443515",  // Quantity
        //             "f": 27781,         // First tradeId
        //             "l": 27781,         // Last tradeId
        //             "T": 1498793709153, // Timestamp
        //             "m": true,          // Was the buyer the maker?
        //             "M": true           // Was the trade the best price match?
        //         }
        //     ]
        //
        // recent public trades and historical public trades
        //
        //     [
        //         {
        //             "id": 28457,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "time": 1499865549590,
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling', // currently unused
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //  spot
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "orderId": 1,
        //         "clientOrderId": "myOrder1",
        //         "price": "0.1",
        //         "origQty": "1.0",
        //         "executedQty": "0.0",
        //         "cummulativeQuoteQty": "0.0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "icebergQty": "0.0",
        //         "time": 1499827319559,
        //         "updateTime": 1499827319559,
        //         "isWorking": true
        //     }
        //
        //  futures
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": 1,
        //         "clientOrderId": "myOrder1",
        //         "price": "0.1",
        //         "origQty": "1.0",
        //         "executedQty": "1.0",
        //         "cumQuote": "10.0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "updateTime": 1499827319559
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let timestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger (order, 'time');
        } else if ('transactTime' in order) {
            timestamp = this.safeInteger (order, 'transactTime');
        }
        let price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'origQty');
        const filled = this.safeFloat (order, 'executedQty');
        let remaining = undefined;
        // - Spot/Margin market: cummulativeQuoteQty
        // - Futures market: cumQuote.
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        let cost = this.safeFloat2 (order, 'cummulativeQuoteQty', 'cumQuote');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.safeString (order, 'orderId');
        let type = this.safeStringLower (order, 'type');
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                        if (this.options['parseOrderToPrecision']) {
                            price = parseFloat (this.priceToPrecision (symbol, price));
                        }
                    }
                }
            }
        } else if (type === 'limit_maker') {
            type = 'limit';
        }
        const side = this.safeStringLower (order, 'side');
        let fee = undefined;
        let trades = undefined;
        const fills = this.safeValue (order, 'fills');
        if (fills !== undefined) {
            trades = this.parseTrades (fills, market);
            const numTrades = trades.length;
            if (numTrades > 0) {
                cost = trades[0]['cost'];
                fee = {
                    'cost': trades[0]['fee']['cost'],
                    'currency': trades[0]['fee']['currency'],
                };
                for (let i = 1; i < trades.length; i++) {
                    cost = this.sum (cost, trades[i]['cost']);
                    fee['cost'] = this.sum (fee['cost'], trades[i]['fee']['cost']);
                }
            }
        }
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
                if (this.options['parseOrderToPrecision']) {
                    average = parseFloat (this.priceToPrecision (symbol, average));
                }
            }
            if (this.options['parseOrderToPrecision']) {
                cost = parseFloat (this.costToPrecision (symbol, cost));
            }
        }
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timeInForce = this.safeString (order, 'timeInForce');
        const postOnly = (type === 'limit_maker') || (timeInForce === 'GTX');
        const stopPrice = this.safeFloat (order, 'stopPrice');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'createOrder', 'defaultType', market['type']);
        const orderType = this.safeString (params, 'type', defaultType);
        const clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        params = this.omit (params, [ 'type', 'newClientOrderId', 'clientOrderId' ]);
        let method = 'privatePostOrder';
        if (orderType === 'future') {
            method = 'fapiPrivatePostOrder';
        } else if (orderType === 'delivery') {
            method = 'dapiPrivatePostOrder';
        } else if (orderType === 'margin') {
            method = 'sapiPostMarginOrder';
        }
        // the next 5 lines are added to support for testing orders
        if (market['spot']) {
            const test = this.safeValue (params, 'test', false);
            if (test) {
                method += 'Test';
            }
            params = this.omit (params, 'test');
        }
        const uppercaseType = type.toUpperCase ();
        const validOrderTypes = this.safeValue (market['info'], 'orderTypes');
        if (!this.inArray (uppercaseType, validOrderTypes)) {
            throw new InvalidOrder (this.id + ' ' + type + ' is not a valid order type in ' + market['type'] + ' market ' + symbol);
        }
        const request = {
            'symbol': market['id'],
            'type': uppercaseType,
            'side': side.toUpperCase (),
        };
        if (clientOrderId === undefined) {
            const broker = this.safeValue (this.options, 'broker');
            if (broker) {
                const brokerId = this.safeString (broker, orderType);
                if (brokerId !== undefined) {
                    request['newClientOrderId'] = brokerId + this.uuid22 ();
                }
            }
        } else {
            request['newClientOrderId'] = clientOrderId;
        }
        if (market['spot']) {
            request['newOrderRespType'] = this.safeValue (this.options['newOrderRespType'], type, 'RESULT'); // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        }
        // additional required fields depending on the order type
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        let quantityIsRequired = false;
        //
        // spot/margin
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity or quoteOrderQty
        //     STOP_LOSS            quantity, stopPrice
        //     STOP_LOSS_LIMIT      timeInForce, quantity, price, stopPrice
        //     TAKE_PROFIT          quantity, stopPrice
        //     TAKE_PROFIT_LIMIT    timeInForce, quantity, price, stopPrice
        //     LIMIT_MAKER          quantity, price
        //
        // futures
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity
        //     STOP/TAKE_PROFIT     quantity, price, stopPrice
        //     STOP_MARKET          stopPrice
        //     TAKE_PROFIT_MARKET   stopPrice
        //     TRAILING_STOP_MARKET callbackRate
        //
        if (uppercaseType === 'MARKET') {
            const quoteOrderQty = this.safeValue (this.options, 'quoteOrderQty', false);
            if (quoteOrderQty) {
                const quoteOrderQty = this.safeFloat (params, 'quoteOrderQty');
                const precision = market['precision']['price'];
                if (quoteOrderQty !== undefined) {
                    request['quoteOrderQty'] = this.decimalToPrecision (quoteOrderQty, TRUNCATE, precision, this.precisionMode);
                    params = this.omit (params, 'quoteOrderQty');
                } else if (price !== undefined) {
                    request['quoteOrderQty'] = this.decimalToPrecision (amount * price, TRUNCATE, precision, this.precisionMode);
                } else {
                    quantityIsRequired = true;
                }
            } else {
                quantityIsRequired = true;
            }
        } else if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
            quantityIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            stopPriceIsRequired = true;
            quantityIsRequired = true;
            if (market['future']) {
                priceIsRequired = true;
            }
        } else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            quantityIsRequired = true;
            stopPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
            quantityIsRequired = true;
        } else if (uppercaseType === 'STOP') {
            quantityIsRequired = true;
            stopPriceIsRequired = true;
            priceIsRequired = true;
        } else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
            const closePosition = this.safeValue (params, 'closePosition');
            if (closePosition === undefined) {
                quantityIsRequired = true;
            }
            stopPriceIsRequired = true;
        } else if (uppercaseType === 'TRAILING_STOP_MARKET') {
            quantityIsRequired = true;
            const callbackRate = this.safeFloat (params, 'callbackRate');
            if (callbackRate === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a callbackRate extra param for a ' + type + ' order');
            }
        }
        if (quantityIsRequired) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForceIsRequired) {
            request['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (stopPriceIsRequired) {
            const stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
            } else {
                params = this.omit (params, 'stopPrice');
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        let method = 'privateGetOrder';
        if (type === 'future') {
            method = 'fapiPrivateGetOrder';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetOrder';
        } else if (type === 'margin') {
            method = 'sapiGetMarginOrder';
        }
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const query = this.omit (params, [ 'type', 'clientOrderId', 'origClientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrders', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        let method = 'privateGetAllOrders';
        if (type === 'future') {
            method = 'fapiPrivateGetAllOrders';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetAllOrders';
        } else if (type === 'margin') {
            method = 'sapiGetMarginAllOrders';
        }
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const query = this.omit (params, 'type');
        const response = await this[method] (this.extend (request, query));
        //
        //  spot
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        //  futures
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "1.0",
        //             "cumQuote": "10.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "updateTime": 1499827319559
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let query = undefined;
        let type = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', market['type']);
            type = this.safeString (params, 'type', defaultType);
            query = this.omit (params, 'type');
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            const symbols = this.symbols;
            const numSymbols = symbols.length;
            const fetchOpenOrdersRateLimit = parseInt (numSymbols / 2);
            throw new ExchangeError (this.id + ' fetchOpenOrders WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString () + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        } else {
            const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            type = this.safeString (params, 'type', defaultType);
            query = this.omit (params, 'type');
        }
        let method = 'privateGetOpenOrders';
        if (type === 'future') {
            method = 'fapiPrivateGetOpenOrders';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetOpenOrders';
        } else if (type === 'margin') {
            method = 'sapiGetMarginOpenOrders';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        // https://github.com/ccxt/ccxt/issues/6507
        const origClientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        const request = {
            'symbol': market['id'],
            // 'orderId': id,
            // 'origClientOrderId': id,
        };
        if (origClientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['origClientOrderId'] = origClientOrderId;
        }
        let method = 'privateDeleteOrder';
        if (type === 'future') {
            method = 'fapiPrivateDeleteOrder';
        } else if (type === 'delivery') {
            method = 'dapiPrivateDeleteOrder';
        } else if (type === 'margin') {
            method = 'sapiDeleteMarginOrder';
        }
        const query = this.omit (params, [ 'type', 'origClientOrderId', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const defaultType = this.safeString2 (this.options, 'cancelAllOrders', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = 'privateDeleteOpenOrders';
        if (type === 'margin') {
            method = 'sapiDeleteMarginOpenOrders';
        } else if (type === 'future') {
            method = 'fapiPrivateDeleteAllOpenOrders';
        } else if (type === 'delivery') {
            method = 'dapiPrivateDeleteAllOpenOrders';
        }
        const response = await this[method] (this.extend (request, query));
        if (Array.isArray (response)) {
            return this.parseOrders (response, market);
        } else {
            return response;
        }
    }

    async fetchPositions (symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchBalance (params);
        const info = this.safeValue (response, 'info', {});
        //
        // futures, delivery
        //
        //     {
        //         "feeTier":0,
        //         "canTrade":true,
        //         "canDeposit":true,
        //         "canWithdraw":true,
        //         "updateTime":0,
        //         "assets":[
        //             {
        //                 "asset":"ETH",
        //                 "walletBalance":"0.09886711",
        //                 "unrealizedProfit":"0.00000000",
        //                 "marginBalance":"0.09886711",
        //                 "maintMargin":"0.00000000",
        //                 "initialMargin":"0.00000000",
        //                 "positionInitialMargin":"0.00000000",
        //                 "openOrderInitialMargin":"0.00000000",
        //                 "maxWithdrawAmount":"0.09886711",
        //                 "crossWalletBalance":"0.09886711",
        //                 "crossUnPnl":"0.00000000",
        //                 "availableBalance":"0.09886711"
        //             }
        //         ],
        //         "positions":[
        //             {
        //                 "symbol":"BTCUSD_201225",
        //                 "initialMargin":"0",
        //                 "maintMargin":"0",
        //                 "unrealizedProfit":"0.00000000",
        //                 "positionInitialMargin":"0",
        //                 "openOrderInitialMargin":"0",
        //                 "leverage":"20",
        //                 "isolated":false,
        //                 "positionSide":"BOTH",
        //                 "entryPrice":"0.00000000",
        //                 "maxQty":"250", // "maxNotional" on futures
        //             },
        //         ]
        //     }
        //
        const positions = this.safeValue2 (info, 'positions', 'userAssets', []);
        // todo unify parsePosition/parsePositions
        return positions;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchMyTrades', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        let method = undefined;
        if (type === 'spot') {
            method = 'privateGetMyTrades';
        } else if (type === 'margin') {
            method = 'sapiGetMarginMyTrades';
        } else if (type === 'future') {
            method = 'fapiPrivateGetUserTrades';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetUserTrades';
        }
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot trade
        //
        //     [
        //         {
        //             "symbol": "BNBBTC",
        //             "id": 28457,
        //             "orderId": 100234,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "commission": "10.10000000",
        //             "commissionAsset": "BNB",
        //             "time": 1499865549590,
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true,
        //         }
        //     ]
        //
        // futures trade
        //
        //     [
        //         {
        //             "accountId": 20,
        //             "buyer": False,
        //             "commission": "-0.07819010",
        //             "commissionAsset": "USDT",
        //             "counterPartyId": 653,
        //             "id": 698759,
        //             "maker": False,
        //             "orderId": 25851813,
        //             "price": "7819.01",
        //             "qty": "0.002",
        //             "quoteQty": "0.01563",
        //             "realizedPnl": "-0.91539999",
        //             "side": "SELL",
        //             "symbol": "BTCUSDT",
        //             "time": 1569514978020
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyDustTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Binance provides an opportunity to trade insignificant (i.e. non-tradable and non-withdrawable)
        // token leftovers (of any asset) into `BNB` coin which in turn can be used to pay trading fees with it.
        // The corresponding trades history is called the `Dust Log` and can be requested via the following end-point:
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/wapi-api.md#dustlog-user_data
        //
        await this.loadMarkets ();
        const response = await this.wapiGetUserAssetDribbletLog (params);
        // { success:    true,
        //   results: { total:    1,
        //               rows: [ {     transfered_total: "1.06468458",
        //                         service_charge_total: "0.02172826",
        //                                      tran_id: 2701371634,
        //                                         logs: [ {              tranId:  2701371634,
        //                                                   serviceChargeAmount: "0.00012819",
        //                                                                   uid: "35103861",
        //                                                                amount: "0.8012",
        //                                                           operateTime: "2018-10-07 17:56:07",
        //                                                      transferedAmount: "0.00628141",
        //                                                             fromAsset: "ADA"                  } ],
        //                                 operate_time: "2018-10-07 17:56:06"                                } ] } }
        const results = this.safeValue (response, 'results', {});
        const rows = this.safeValue (results, 'rows', []);
        const data = [];
        for (let i = 0; i < rows.length; i++) {
            const logs = rows[i]['logs'];
            for (let j = 0; j < logs.length; j++) {
                logs[j]['isDustTrade'] = true;
                data.push (logs[j]);
            }
        }
        const trades = this.parseTrades (data, undefined, since, limit);
        return this.filterBySinceLimit (trades, since, limit);
    }

    parseDustTrade (trade, market = undefined) {
        // {              tranId:  2701371634,
        //   serviceChargeAmount: "0.00012819",
        //                   uid: "35103861",
        //                amount: "0.8012",
        //           operateTime: "2018-10-07 17:56:07",
        //      transferedAmount: "0.00628141",
        //             fromAsset: "ADA"                  },
        const orderId = this.safeString (trade, 'tranId');
        const timestamp = this.parse8601 (this.safeString (trade, 'operateTime'));
        const tradedCurrency = this.safeCurrencyCode (this.safeString (trade, 'fromAsset'));
        const earnedCurrency = this.currency ('BNB')['code'];
        const applicantSymbol = earnedCurrency + '/' + tradedCurrency;
        let tradedCurrencyIsQuote = false;
        if (applicantSymbol in this.markets) {
            tradedCurrencyIsQuote = true;
        }
        //
        // Warning
        // Binance dust trade `fee` is already excluded from the `BNB` earning reported in the `Dust Log`.
        // So the parser should either set the `fee.cost` to `0` or add it on top of the earned
        // BNB `amount` (or `cost` depending on the trade `side`). The second of the above options
        // is much more illustrative and therefore preferable.
        //
        const fee = {
            'currency': earnedCurrency,
            'cost': this.safeFloat (trade, 'serviceChargeAmount'),
        };
        let symbol = undefined;
        let amount = undefined;
        let cost = undefined;
        let side = undefined;
        if (tradedCurrencyIsQuote) {
            symbol = applicantSymbol;
            amount = this.sum (this.safeFloat (trade, 'transferedAmount'), fee['cost']);
            cost = this.safeFloat (trade, 'amount');
            side = 'buy';
        } else {
            symbol = tradedCurrency + '/' + earnedCurrency;
            amount = this.safeFloat (trade, 'amount');
            cost = this.sum (this.safeFloat (trade, 'transferedAmount'), fee['cost']);
            side = 'sell';
        }
        let price = undefined;
        if (cost !== undefined) {
            if (amount) {
                price = cost / amount;
            }
        }
        const id = undefined;
        const type = undefined;
        const takerOrMaker = undefined;
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'amount': amount,
            'price': price,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            request['endTime'] = this.sum (since, 7776000000);
        }
        const response = await this.wapiGetDepositHistory (this.extend (request, params));
        //
        //     {     success:    true,
        //       depositList: [ { insertTime:  1517425007000,
        //                            amount:  0.3,
        //                           address: "0x0123456789abcdef",
        //                        addressTag: "",
        //                              txId: "0x0123456789abcdef",
        //                             asset: "ETH",
        //                            status:  1                                                                    } ] }
        //
        return this.parseTransactions (response['depositList'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            request['endTime'] = this.sum (since, 7776000000);
        }
        const response = await this.wapiGetWithdrawHistory (this.extend (request, params));
        //
        //     { withdrawList: [ {      amount:  14,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1514489710000,
        //                      transactionFee:  0.01,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ETH",
        //                           applyTime:  1514488724000,
        //                              status:  6                       },
        //                       {      amount:  7600,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1515323226000,
        //                      transactionFee:  0.01,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ICN",
        //                           applyTime:  1515322539000,
        //                              status:  6                       }  ],
        //            success:    true                                         }
        //
        return this.parseTransactions (response['withdrawList'], currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statusesByType = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         insertTime:  1517425007000,
        //         amount:  0.3,
        //         address: "0x0123456789abcdef",
        //         addressTag: "",
        //         txId: "0x0123456789abcdef",
        //         asset: "ETH",
        //         status:  1
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         amount:  14,
        //         address: "0x0123456789abcdef...",
        //         successTime:  1514489710000,
        //         transactionFee:  0.01,
        //         addressTag: "",
        //         txId: "0x0123456789abcdef...",
        //         id: "0123456789abcdef...",
        //         asset: "ETH",
        //         applyTime:  1514488724000,
        //         status:  6
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeString (transaction, 'txId');
        if ((txid !== undefined) && (txid.indexOf ('Internal transfer ') >= 0)) {
            txid = txid.slice (18);
        }
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        let timestamp = undefined;
        const insertTime = this.safeInteger (transaction, 'insertTime');
        const applyTime = this.safeInteger (transaction, 'applyTime');
        let type = this.safeString (transaction, 'type');
        if (type === undefined) {
            if ((insertTime !== undefined) && (applyTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            } else if ((insertTime === undefined) && (applyTime !== undefined)) {
                type = 'withdrawal';
                timestamp = applyTime;
            }
        }
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeFloat (transaction, 'amount');
        const feeCost = this.safeFloat (transaction, 'transactionFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const updated = this.safeInteger (transaction, 'successTime');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'updated': updated,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            // 'network': 'ETH', // 'BSC', 'XMR', you can get network and isDefault in networkList in the response of sapiGetCapitalConfigDetail
        };
        // has support for the 'network' parameter
        // https://binance-docs.github.io/apidocs/spot/en/#deposit-address-supporting-network-user_data
        const response = await this.sapiGetCapitalDepositAddress (this.extend (request, params));
        //
        //     {
        //         currency: 'XRP',
        //         address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
        //         tag: '108618262',
        //         info: {
        //             coin: 'XRP',
        //             address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
        //             tag: '108618262',
        //             url: 'https://bithomp.com/explorer/rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh'
        //         }
        //     }
        //
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        const response = await this.wapiGetAssetDetail (params);
        //
        //     {
        //         "success": true,
        //         "assetDetail": {
        //             "CTR": {
        //                 "minWithdrawAmount": "70.00000000", //min withdraw amount
        //                 "depositStatus": false,//deposit status
        //                 "withdrawFee": 35, // withdraw fee
        //                 "withdrawStatus": true, //withdraw status
        //                 "depositTip": "Delisted, Deposit Suspended" //reason
        //             },
        //             "SKY": {
        //                 "minWithdrawAmount": "0.02000000",
        //                 "depositStatus": true,
        //                 "withdrawFee": 0.01,
        //                 "withdrawStatus": true
        //             }
        //         }
        //     }
        //
        const detail = this.safeValue (response, 'assetDetail', {});
        const ids = Object.keys (detail);
        const withdrawFees = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            withdrawFees[code] = this.safeFloat (detail[id], 'withdrawFee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // name is optional, can be overrided via params
        const name = address.slice (0, 20);
        const request = {
            'asset': currency['id'],
            'address': address,
            'amount': parseFloat (amount),
            'name': name, // name is optional, can be overrided via params
            // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
            // issue sapiGetCapitalConfigGetall () to get networks for withdrawing USDT ERC20 vs USDT Omni
            // 'network': 'ETH', // 'BTC', 'TRX', etc, optional
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const response = await this.wapiPostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    parseTradingFee (fee, market = undefined) {
        //
        //     {
        //         "symbol": "ADABNB",
        //         "maker": 0.9000,
        //         "taker": 1.0000
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        const symbol = this.safeSymbol (marketId);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeFloat (fee, 'maker'),
            'taker': this.safeFloat (fee, 'taker'),
        };
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.wapiGetTradeFee (this.extend (request, params));
        //
        //     {
        //         "tradeFee": [
        //             {
        //                 "symbol": "ADABNB",
        //                 "maker": 0.9000,
        //                 "taker": 1.0000
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const tradeFee = this.safeValue (response, 'tradeFee', []);
        const first = this.safeValue (tradeFee, 0, {});
        return this.parseTradingFee (first);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.wapiGetTradeFee (params);
        //
        //     {
        //         "tradeFee": [
        //             {
        //                 "symbol": "ADABNB",
        //                 "maker": 0.9000,
        //                 "taker": 1.0000
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const tradeFee = this.safeValue (response, 'tradeFee', []);
        const result = {};
        for (let i = 0; i < tradeFee.length; i++) {
            const fee = this.parseTradingFee (tradeFee[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!(api in this.urls['api'])) {
            throw new NotSupported (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
        const userDataStream = (path === 'userDataStream') || (path === 'listenKey');
        if (path === 'historicalTrades') {
            if (this.apiKey) {
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                };
            } else {
                throw new AuthenticationError (this.id + ' historicalTrades endpoint requires `apiKey` credential');
            }
        } else if (userDataStream) {
            if (this.apiKey) {
                // v1 special case for userDataStream
                body = this.urlencode (params);
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            } else {
                throw new AuthenticationError (this.id + ' userDataStream endpoint requires `apiKey` credential');
            }
        }
        if ((api === 'private') || (api === 'sapi') || (api === 'wapi' && path !== 'systemStatus') || (api === 'dapiPrivate') || (api === 'fapiPrivate') || (api === 'fapiPrivateV2')) {
            this.checkRequiredCredentials ();
            let query = undefined;
            const recvWindow = this.safeInteger (this.options, 'recvWindow', 5000);
            if ((api === 'sapi') && (path === 'asset/dust')) {
                query = this.urlencodeWithArrayRepeat (this.extend ({
                    'timestamp': this.nonce (),
                    'recvWindow': recvWindow,
                }, params));
            } else if ((path === 'batchOrders') || (path.indexOf ('sub-account') >= 0)) {
                query = this.rawencode (this.extend ({
                    'timestamp': this.nonce (),
                    'recvWindow': recvWindow,
                }, params));
            } else {
                query = this.urlencode (this.extend ({
                    'timestamp': this.nonce (),
                    'recvWindow': recvWindow,
                }, params));
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            // userDataStream endpoints are public, but POST, PUT, DELETE
            // therefore they don't accept URL query arguments
            // https://github.com/ccxt/ccxt/issues/5224
            if (!userDataStream) {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        // check success value for wapi endpoints
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            const message = this.safeString (response, 'msg');
            let parsedMessage = undefined;
            if (message !== undefined) {
                try {
                    parsedMessage = JSON.parse (message);
                } catch (e) {
                    // do nothing
                    parsedMessage = undefined;
                }
                if (parsedMessage !== undefined) {
                    response = parsedMessage;
                }
            }
        }
        const message = this.safeString (response, 'msg');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions, message, this.id + ' ' + message);
        }
        // checks against error codes
        const error = this.safeString (response, 'code');
        if (error !== undefined) {
            // https://github.com/ccxt/ccxt/issues/6501
            // https://github.com/ccxt/ccxt/issues/7742
            if ((error === '200') || (error === '0')) {
                return;
            }
            // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
            // despite that their message is very confusing, it is raised by Binance
            // on a temporary ban, the API key is valid, but disabled for a while
            if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                throw new DDoSProtection (this.id + ' temporary banned: ' + body);
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, error, feedback);
            throw new ExchangeError (feedback);
        }
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if ((api === 'private') || (api === 'wapi')) {
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        }
        return response;
    }
};
