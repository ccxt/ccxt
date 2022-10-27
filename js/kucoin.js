'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, ArgumentsRequired, AccountSuspended, InvalidNonce, NotSupported, BadRequest, AuthenticationError, BadSymbol, RateLimitExceeded, PermissionDenied, InvalidAddress } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class kucoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin',
            'name': 'KuCoin',
            'countries': [ 'SC' ],
            // note "only some endpoints are rate-limited"
            // so I set the 'ratelimit' on those which supposedly 'arent ratelimited'
            // to the limit of the cheapest endpoint
            // 60 requests in 3 seconds = 20 requests per second => ( 1000ms / 20 ) = 50 ms between requests on average
            'rateLimit': 50,
            'version': 'v2',
            'certified': false,
            'pro': true,
            'comment': 'Platform 2.0',
            'quoteJsonNumbers': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': undefined,
                'borrowMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': true,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL3OrderBook': true,
                'fetchLedger': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrdersByStatus': true,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactionFee': true,
                'fetchWithdrawals': true,
                'repayMargin': true,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg',
                'referral': 'https://www.kucoin.com/ucenter/signup?rcode=E5wkqe',
                'api': {
                    'public': 'https://api.kucoin.com',
                    'private': 'https://api.kucoin.com',
                    'futuresPrivate': 'https://api-futures.kucoin.com',
                    'futuresPublic': 'https://api-futures.kucoin.com',
                },
                'test': {
                    'public': 'https://openapi-sandbox.kucoin.com',
                    'private': 'https://openapi-sandbox.kucoin.com',
                    'futuresPrivate': 'https://api-sandbox-futures.kucoin.com',
                    'futuresPublic': 'https://api-sandbox-futures.kucoin.com',
                },
                'www': 'https://www.kucoin.com',
                'doc': [
                    'https://docs.kucoin.com',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': {
                        'timestamp': 1,
                        'status': 1,
                        'symbols': 1,
                        'markets': 1,
                        'market/allTickers': 1,
                        'market/orderbook/level{level}_{limit}': 1,
                        'market/orderbook/level2_20': 1,
                        'market/orderbook/level2_100': 1,
                        'market/histories': 1,
                        'market/candles': 1,
                        'market/stats': 1,
                        'currencies': 1,
                        'currencies/{currency}': 1,
                        'prices': 1,
                        'mark-price/{symbol}/current': 1,
                        'margin/config': 1,
                        'margin/trade/last': 1,
                    },
                    'post': {
                        'bullet-public': 1,
                    },
                },
                'private': {
                    'get': {
                        'market/orderbook/level{level}': 1,
                        'market/orderbook/level2': { 'v3': 2 }, // 30/3s = 10/s => cost = 20 / 10 = 2
                        'market/orderbook/level3': 1,
                        'accounts': 1,
                        'accounts/{accountId}': 1,
                        // 'accounts/{accountId}/ledgers': 1, Deprecated endpoint
                        'accounts/ledgers': 3.333, // 18/3s = 6/s => cost = 20 / 6 = 3.333
                        'accounts/{accountId}/holds': 1,
                        'accounts/transferable': 1,
                        'base-fee': 1,
                        'sub/user': 1,
                        'user-info': 1,
                        'sub/api-key': 1,
                        'sub-accounts': 1,
                        'sub-accounts/{subUserId}': 1,
                        'deposit-addresses': 1,
                        'deposits': 10, // 6/3s = 2/s => cost = 20 / 2 = 10
                        'hist-deposits': 10, // 6/3 = 2/s => cost = 20 / 2 = 10
                        // 'hist-orders': 1, Deprecated endpoint
                        'hist-withdrawals': 10, // 6/3 = 2/s => cost = 20 / 2 = 10
                        'withdrawals': 10, // 6/3 = 2/s => cost = 20 / 2 = 10
                        'withdrawals/quotas': 1,
                        'orders': 2, // 30/3s =  10/s => cost  = 20 / 10 = 2
                        'order/client-order/{clientOid}': 1,
                        'orders/{orderId}': 1,
                        'limit/orders': 1,
                        'fills': 6.66667, // 9/3s = 3/s => cost  = 20 / 3 = 6.666667
                        'limit/fills': 1,
                        'isolated/accounts': 2, // 30/3s = 10/s => cost = 20 / 10 = 2
                        'isolated/account/{symbol}': 2,
                        'isolated/borrow/outstanding': 2,
                        'isolated/borrow/repaid': 2,
                        'isolated/symbols': 2,
                        'margin/account': 1,
                        'margin/borrow': 1,
                        'margin/borrow/outstanding': 1,
                        'margin/borrow/repaid': 1,
                        'margin/lend/active': 1,
                        'margin/lend/done': 1,
                        'margin/lend/trade/unsettled': 1,
                        'margin/lend/trade/settled': 1,
                        'margin/lend/assets': 1,
                        'margin/market': 1,
                        'stop-order/{orderId}': 1,
                        'stop-order': 1,
                        'stop-order/queryOrderByClientOid': 1,
                        'trade-fees': 1.3333, // 45/3s = 15/s => cost = 20 / 15 = 1.333
                    },
                    'post': {
                        'accounts': 1,
                        'accounts/inner-transfer': { 'v2': 1 },
                        'accounts/sub-transfer': { 'v2': 25 }, // bad docs
                        'deposit-addresses': 1,
                        'withdrawals': 1,
                        'orders': 4, // 45/3s = 15/s => cost = 20 / 15 = 1.333333
                        'orders/multi': 20, // 3/3s = 1/s => cost = 20 / 1 = 20
                        'isolated/borrow': 2, // 30 requests per 3 seconds = 10 requests per second => cost = 20/10 = 2
                        'isolated/repay/all': 2,
                        'isolated/repay/single': 2,
                        'margin/borrow': 1,
                        'margin/order': 1,
                        'margin/repay/all': 1,
                        'margin/repay/single': 1,
                        'margin/lend': 1,
                        'margin/toggle-auto-lend': 1,
                        'bullet-private': 1,
                        'stop-order': 1,
                        'sub/user': 1,
                        'sub/api-key': 1,
                        'sub/api-key/update': 1,
                    },
                    'delete': {
                        'withdrawals/{withdrawalId}': 1,
                        'orders': 20, // 3/3s = 1/s => cost = 20/1
                        'order/client-order/{clientOid}': 1,
                        'orders/{orderId}': 1, // rateLimit: 60/3s = 20/s => cost = 1
                        'margin/lend/{orderId}': 1,
                        'stop-order/cancelOrderByClientOid': 1,
                        'stop-order/{orderId}': 1,
                        'stop-order/cancel': 1,
                        'sub/api-key': 1,
                    },
                },
                'futuresPublic': {
                    // cheapest futures 'limited' endpoint is 40  requests per 3 seconds = 14.333 per second => cost = 20/14.333 = 1.3953
                    'get': {
                        'contracts/active': 1.3953,
                        'contracts/{symbol}': 1.3953,
                        'ticker': 1.3953,
                        'level2/snapshot': 2, // 30 requests per 3 seconds = 10 requests per second => cost = 20/10 = 2
                        'level2/depth20': 1.3953,
                        'level2/depth100': 1.3953,
                        'level2/message/query': 1.3953,
                        'level3/message/query': 1.3953, // deprecated，level3/snapshot is suggested
                        'level3/snapshot': 1.3953, // v2
                        'trade/history': 1.3953,
                        'interest/query': 1.3953,
                        'index/query': 1.3953,
                        'mark-price/{symbol}/current': 1.3953,
                        'premium/query': 1.3953,
                        'funding-rate/{symbol}/current': 1.3953,
                        'timestamp': 1.3953,
                        'status': 1.3953,
                        'kline/query': 1.3953,
                    },
                    'post': {
                        'bullet-public': 1.3953,
                    },
                },
                'futuresPrivate': {
                    'get': {
                        'account-overview': 2, // 30 requests per 3 seconds = 10 per second => cost = 20/10 = 2
                        'transaction-history': 6.666, // 9 requests per 3 seconds = 3 per second => cost = 20/3 = 6.666
                        'deposit-address': 1.3953,
                        'deposit-list': 1.3953,
                        'withdrawals/quotas': 1.3953,
                        'withdrawal-list': 1.3953,
                        'transfer-list': 1.3953,
                        'orders': 1.3953,
                        'stopOrders': 1.3953,
                        'recentDoneOrders': 1.3953,
                        'orders/{orderId}': 1.3953, // ?clientOid={client-orderId} // get order by orderId
                        'orders/byClientOid': 1.3953, // ?clientOid=eresc138b21023a909e5ad59 // get order by clientOid
                        'fills': 6.666, // 9 requests per 3 seconds = 3 per second => cost = 20/3 = 6.666
                        'recentFills': 6.666, // 9 requests per 3 seconds = 3 per second => cost = 20/3 = 6.666
                        'openOrderStatistics': 1.3953,
                        'position': 1.3953,
                        'positions': 6.666, // 9 requests per 3 seconds = 3 per second => cost = 20/3 = 6.666
                        'funding-history': 6.666, // 9 requests per 3 seconds = 3 per second => cost = 20/3 = 6.666
                    },
                    'post': {
                        'withdrawals': 1.3953,
                        'transfer-out': 1.3953, // v2
                        'orders': 1.3953,
                        'position/margin/auto-deposit-status': 1.3953,
                        'position/margin/deposit-margin': 1.3953,
                        'bullet-private': 1.3953,
                    },
                    'delete': {
                        'withdrawals/{withdrawalId}': 1.3953,
                        'cancel/transfer-out': 1.3953,
                        'orders/{orderId}': 1.3953, // 40 requests per 3 seconds = 14.333 per second => cost = 20/14.333 = 1.395
                        'orders': 6.666, // 9 requests per 3 seconds = 3 per second => cost = 20/3 = 6.666
                        'stopOrders': 1.3953,
                    },
                },
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '8h': '8hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'order not exist': OrderNotFound,
                    'order not exist.': OrderNotFound, // duplicated error temporarily
                    'order_not_exist': OrderNotFound, // {"code":"order_not_exist","msg":"order_not_exist"} ¯\_(ツ)_/¯
                    'order_not_exist_or_not_allow_to_cancel': InvalidOrder, // {"code":"400100","msg":"order_not_exist_or_not_allow_to_cancel"}
                    'Order size below the minimum requirement.': InvalidOrder, // {"code":"400100","msg":"Order size below the minimum requirement."}
                    'The withdrawal amount is below the minimum requirement.': ExchangeError, // {"code":"400100","msg":"The withdrawal amount is below the minimum requirement."}
                    'Unsuccessful! Exceeded the max. funds out-transfer limit': InsufficientFunds, // {"code":"200000","msg":"Unsuccessful! Exceeded the max. funds out-transfer limit"}
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': NotSupported,
                    '404': NotSupported,
                    '405': NotSupported,
                    '429': RateLimitExceeded,
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable,
                    '101030': PermissionDenied, // {"code":"101030","msg":"You haven't yet enabled the margin trading"}
                    '103000': InvalidOrder, // {"code":"103000","msg":"Exceed the borrowing limit, the remaining borrowable amount is: 0USDT"}
                    '200004': InsufficientFunds,
                    '210014': InvalidOrder, // {"code":"210014","msg":"Exceeds the max. borrowing amount, the remaining amount you can borrow: 0USDT"}
                    '210021': InsufficientFunds, // {"code":"210021","msg":"Balance not enough"}
                    '230003': InsufficientFunds, // {"code":"230003","msg":"Balance insufficient!"}
                    '260100': InsufficientFunds, // {"code":"260100","msg":"account.noBalance"}
                    '300000': InvalidOrder,
                    '400000': BadSymbol,
                    '400001': AuthenticationError,
                    '400002': InvalidNonce,
                    '400003': AuthenticationError,
                    '400004': AuthenticationError,
                    '400005': AuthenticationError,
                    '400006': AuthenticationError,
                    '400007': AuthenticationError,
                    '400008': NotSupported,
                    '400100': BadRequest,
                    '400200': InvalidOrder, // {"code":"400200","msg":"Forbidden to place an order"}
                    '400350': InvalidOrder, // {"code":"400350","msg":"Upper limit for holding: 10,000USDT, you can still buy 10,000USDT worth of coin."}
                    '400370': InvalidOrder, // {"code":"400370","msg":"Max. price: 0.02500000000000000000"}
                    '400500': InvalidOrder, // {"code":"400500","msg":"Your located country/region is currently not supported for the trading of this token"}
                    '400600': BadSymbol, // {"code":"400600","msg":"validation.createOrder.symbolNotAvailable"}
                    '400760': InvalidOrder, // {"code":"400760","msg":"order price should be more than XX"}
                    '401000': BadRequest, // {"code":"401000","msg":"The interface has been deprecated"}
                    '411100': AccountSuspended,
                    '415000': BadRequest, // {"code":"415000","msg":"Unsupported Media Type"}
                    '500000': ExchangeNotAvailable, // {"code":"500000","msg":"Internal Server Error"}
                    '260220': InvalidAddress, // { "code": "260220", "msg": "deposit.address.not.exists" }
                    '900014': BadRequest, // {"code":"900014","msg":"Invalid chainId"}
                },
                'broad': {
                    'Exceeded the access frequency': RateLimitExceeded,
                    'require more permission': PermissionDenied,
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('50'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('2000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('4000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('8000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('15000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00035') ],
                            [ this.parseNumber ('60000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('80000'), this.parseNumber ('0.00025') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('50'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('2000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('4000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('8000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('15000'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('60000'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('80000'), this.parseNumber ('-0.00005') ],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'HOT': 'HOTNOW',
                'EDGE': 'DADI', // https://github.com/ccxt/ccxt/issues/5756
                'WAX': 'WAXP',
                'TRY': 'Trias',
                'VAI': 'VAIOT',
            },
            'options': {
                'version': 'v1',
                'symbolSeparator': '-',
                'fetchMyTradesMethod': 'private_get_fills',
                'fetchBalance': 'trade',
                'fetchMarkets': {
                    'fetchTickersFees': true,
                },
                // endpoint versions
                'versions': {
                    'public': {
                        'GET': {
                            'currencies/{currency}': 'v2',
                            'status': 'v1',
                            'market/orderbook/level2_20': 'v1',
                            'market/orderbook/level2_100': 'v1',
                            'market/orderbook/level{level}_{limit}': 'v1',
                        },
                    },
                    'private': {
                        'GET': {
                            'market/orderbook/level2': 'v3',
                            'market/orderbook/level3': 'v3',
                            'market/orderbook/level{level}': 'v3',
                        },
                        'POST': {
                            'accounts/inner-transfer': 'v2',
                            'accounts/sub-transfer': 'v2',
                        },
                    },
                    'futuresPrivate': {
                        'GET': {
                            'account-overview': 'v1',
                            'positions': 'v1',
                        },
                        'POST': {
                            'transfer-out': 'v2',
                        },
                    },
                    'futuresPublic': {
                        'GET': {
                            'level3/snapshot': 'v2',
                        },
                    },
                },
                'partner': {
                    // the support for spot and future exchanges as separate settings
                    'spot': {
                        'id': 'ccxt',
                        'key': '9e58cc35-5b5e-4133-92ec-166e3f077cb8',
                    },
                    'future': {
                        'id': 'ccxtfutures',
                        'key': '1b327198-f30c-4f14-a0ac-918871282f15',
                    },
                    // exchange-wide settings are also supported
                    // 'id': 'ccxt'
                    // 'key': '9e58cc35-5b5e-4133-92ec-166e3f077cb8',
                },
                'accountsByType': {
                    'spot': 'trade',
                    'margin': 'margin',
                    'cross': 'margin',
                    'isolated': 'isolated',
                    'main': 'main',
                    'funding': 'main',
                    'future': 'contract',
                    'mining': 'pool',
                },
                'networks': {
                    'ETH': 'eth',
                    'ERC20': 'eth',
                    'TRX': 'trx',
                    'TRC20': 'trx',
                    'KCC': 'kcc',
                    'TERRA': 'luna',
                    'LTC': 'ltc',
                },
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name kucoin#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTimestamp (params);
        //
        //     {
        //         "code":"200000",
        //         "msg":"success",
        //         "data":1546837113087
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name kucoin#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const response = await this.publicGetStatus (params);
        //
        //     {
        //         "code":"200000",
        //         "data":{
        //             "status":"open", //open, close, cancelonly
        //             "msg":"upgrade match engine" //remark for operation
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const status = this.safeString (data, 'status');
        return {
            'status': (status === 'open') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name kucoin#fetchMarkets
         * @description retrieves data on all markets for kucoin
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetSymbols (params);
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "symbol": "XLM-USDT",
        //                 "name": "XLM-USDT",
        //                 "baseCurrency": "XLM",
        //                 "quoteCurrency": "USDT",
        //                 "feeCurrency": "USDT",
        //                 "market": "USDS",
        //                 "baseMinSize": "0.1",
        //                 "quoteMinSize": "0.01",
        //                 "baseMaxSize": "10000000000",
        //                 "quoteMaxSize": "99999999",
        //                 "baseIncrement": "0.0001",
        //                 "quoteIncrement": "0.000001",
        //                 "priceIncrement": "0.000001",
        //                 "priceLimitRate": "0.1",
        //                 "isMarginEnabled": true,
        //                 "enableTrading": true
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const fetchTickersFees = this.safeValue (options, 'fetchTickersFees', true);
        let tickersResponse = {};
        if (fetchTickersFees) {
            tickersResponse = await this.publicGetMarketAllTickers (params);
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "time":1602832092060,
        //             "ticker":[
        //                 {
        //                     "symbol": "BTC-USDT",   // symbol
        //                     "symbolName":"BTC-USDT", // Name of trading pairs, it would change after renaming
        //                     "buy": "11328.9",   // bestAsk
        //                     "sell": "11329",    // bestBid
        //                     "changeRate": "-0.0055",    // 24h change rate
        //                     "changePrice": "-63.6", // 24h change price
        //                     "high": "11610",    // 24h highest price
        //                     "low": "11200", // 24h lowest price
        //                     "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
        //                     "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
        //                     "last": "11328.9",  // last price
        //                     "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
        //                     "takerFeeRate": "0.001",    // Basic Taker Fee
        //                     "makerFeeRate": "0.001",    // Basic Maker Fee
        //                     "takerCoefficient": "1",    // Taker Fee Coefficient
        //                     "makerCoefficient": "1" // Maker Fee Coefficient
        //                 }
        //             ]
        //         }
        //     }
        //
        const tickersData = this.safeValue (tickersResponse, 'data', {});
        const tickers = this.safeValue (tickersData, 'ticker', []);
        const tickersByMarketId = this.indexBy (tickers, 'symbol');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            // const quoteIncrement = this.safeNumber (market, 'quoteIncrement');
            const ticker = this.safeValue (tickersByMarketId, id, {});
            const makerFeeRate = this.safeString (ticker, 'makerFeeRate');
            const takerFeeRate = this.safeString (ticker, 'makerFeeRate');
            const makerCoefficient = this.safeString (ticker, 'makerCoefficient');
            const takerCoefficient = this.safeString (ticker, 'takerCoefficient');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': this.safeValue (market, 'isMarginEnabled'),
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeValue (market, 'enableTrading'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.parseNumber (Precise.stringMul (takerFeeRate, takerCoefficient)),
                'maker': this.parseNumber (Precise.stringMul (makerFeeRate, makerCoefficient)),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'baseIncrement'),
                    'price': this.safeNumber (market, 'priceIncrement'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'baseMinSize'),
                        'max': this.safeNumber (market, 'baseMaxSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'quoteMinSize'),
                        'max': this.safeNumber (market, 'quoteMaxSize'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name kucoin#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "currency": "OMG",
        //         "name": "OMG",
        //         "fullName": "OmiseGO",
        //         "precision": 8,
        //         "confirms": 12,
        //         "withdrawalMinSize": "4",
        //         "withdrawalMinFee": "1.25",
        //         "isWithdrawEnabled": false,
        //         "isDepositEnabled": false,
        //         "isMarginEnabled": false,
        //         "isDebitEnabled": false
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'currency');
            const name = this.safeString (entry, 'fullName');
            const code = this.safeCurrencyCode (id);
            const isWithdrawEnabled = this.safeValue (entry, 'isWithdrawEnabled', false);
            const isDepositEnabled = this.safeValue (entry, 'isDepositEnabled', false);
            const fee = this.safeNumber (entry, 'withdrawalMinFee');
            const active = (isWithdrawEnabled && isDepositEnabled);
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': this.parseNumber (this.parsePrecision (this.safeString (entry, 'precision'))),
                'info': entry,
                'active': active,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'fee': fee,
                'limits': this.limits,
            };
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name kucoin#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        const response = await this.privateGetAccounts (params);
        //
        //     {
        //         code: "200000",
        //         data: [
        //             {
        //                 balance: "0.00009788",
        //                 available: "0.00009788",
        //                 holds: "0",
        //                 currency: "BTC",
        //                 id: "5c6a4fd399a1d81c4f9cc4d0",
        //                 type: "trade"
        //             },
        //             {
        //                 balance: "0.00000001",
        //                 available: "0.00000001",
        //                 holds: "0",
        //                 currency: "ETH",
        //                 id: "5c6a49ec99a1d819392e8e9f",
        //                 type: "trade"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString (account, 'id');
            const currencyId = this.safeString (account, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const type = this.safeString (account, 'type');  // main or trade
            result.push ({
                'id': accountId,
                'type': type,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchTransactionFee (code, params = {}) {
        /**
         * @method
         * @name kucoin#fetchTransactionFee
         * @description fetch the fee for a transaction
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network');
        network = this.safeStringLower (networks, network, network);
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privateGetWithdrawalsQuotas (this.extend (request, params));
        const data = response['data'];
        const withdrawFees = {};
        withdrawFees[code] = this.safeNumber (data, 'withdrawMinFee');
        return {
            'info': response,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    isFuturesMethod (methodName, params) {
        //
        // Helper
        // @methodName (string): The name of the method
        // @params (dict): The parameters passed into {methodName}
        // @return: true if the method used is meant for futures trading, false otherwise
        //
        const defaultType = this.safeString2 (this.options, methodName, 'defaultType', 'trade');
        const requestedType = this.safeString (params, 'type', defaultType);
        const accountsByType = this.safeValue (this.options, 'accountsByType');
        const type = this.safeString (accountsByType, requestedType);
        if (type === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' isFuturesMethod() type must be one of ' + keys.join (', '));
        }
        params = this.omit (params, 'type');
        return (type === 'contract') || (type === 'future') || (type === 'futures'); // * (type === 'futures') deprecated, use (type === 'future')
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-USDT",   // symbol
        //         "symbolName":"BTC-USDT", // Name of trading pairs, it would change after renaming
        //         "buy": "11328.9",   // bestAsk
        //         "sell": "11329",    // bestBid
        //         "changeRate": "-0.0055",    // 24h change rate
        //         "changePrice": "-63.6", // 24h change price
        //         "high": "11610",    // 24h highest price
        //         "low": "11200", // 24h lowest price
        //         "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
        //         "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
        //         "last": "11328.9",  // last price
        //         "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
        //         "takerFeeRate": "0.001",    // Basic Taker Fee
        //         "makerFeeRate": "0.001",    // Basic Maker Fee
        //         "takerCoefficient": "1",    // Taker Fee Coefficient
        //         "makerCoefficient": "1" // Maker Fee Coefficient
        //     }
        //
        //     {
        //         "trading": true,
        //         "symbol": "KCS-BTC",
        //         "buy": 0.00011,
        //         "sell": 0.00012,
        //         "sort": 100,
        //         "volValue": 3.13851792584,   //total
        //         "baseCurrency": "KCS",
        //         "market": "BTC",
        //         "quoteCurrency": "BTC",
        //         "symbolCode": "KCS-BTC",
        //         "datetime": 1548388122031,
        //         "high": 0.00013,
        //         "vol": 27514.34842,
        //         "low": 0.0001,
        //         "changePrice": -1.0e-5,
        //         "changeRate": -0.0769,
        //         "lastTradedPrice": 0.00012,
        //         "board": 0,
        //         "mark": 0
        //     }
        //
        // market/ticker ws subscription
        //
        //     {
        //         bestAsk: '62258.9',
        //         bestAskSize: '0.38579986',
        //         bestBid: '62258.8',
        //         bestBidSize: '0.0078381',
        //         price: '62260.7',
        //         sequence: '1621383297064',
        //         size: '0.00002841',
        //         time: 1634641777363
        //     }
        //
        let percentage = this.safeString (ticker, 'changeRate');
        if (percentage !== undefined) {
            percentage = Precise.stringMul (percentage, '100');
        }
        let last = this.safeString2 (ticker, 'last', 'lastTradedPrice');
        last = this.safeString (ticker, 'price', last);
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const baseVolume = this.safeString (ticker, 'vol');
        const quoteVolume = this.safeString (ticker, 'volValue');
        const timestamp = this.safeInteger2 (ticker, 'time', 'datetime');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString2 (ticker, 'buy', 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bestBidSize'),
            'ask': this.safeString2 (ticker, 'sell', 'bestAsk'),
            'askVolume': this.safeString (ticker, 'bestAskSize'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'changePrice'),
            'percentage': percentage,
            'average': this.safeString (ticker, 'averagePrice'),
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketAllTickers (params);
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "time":1602832092060,
        //             "ticker":[
        //                 {
        //                     "symbol": "BTC-USDT",   // symbol
        //                     "symbolName":"BTC-USDT", // Name of trading pairs, it would change after renaming
        //                     "buy": "11328.9",   // bestAsk
        //                     "sell": "11329",    // bestBid
        //                     "changeRate": "-0.0055",    // 24h change rate
        //                     "changePrice": "-63.6", // 24h change price
        //                     "high": "11610",    // 24h highest price
        //                     "low": "11200", // 24h lowest price
        //                     "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
        //                     "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
        //                     "last": "11328.9",  // last price
        //                     "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
        //                     "takerFeeRate": "0.001",    // Basic Taker Fee
        //                     "makerFeeRate": "0.001",    // Basic Maker Fee
        //                     "takerCoefficient": "1",    // Taker Fee Coefficient
        //                     "makerCoefficient": "1" // Maker Fee Coefficient
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'ticker', []);
        const time = this.safeInteger (data, 'time');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            tickers[i]['time'] = time;
            const ticker = this.parseTicker (tickers[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name kucoin#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketStats (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "time": 1602832092060,  // time
        //             "symbol": "BTC-USDT",   // symbol
        //             "buy": "11328.9",   // bestAsk
        //             "sell": "11329",    // bestBid
        //             "changeRate": "-0.0055",    // 24h change rate
        //             "changePrice": "-63.6", // 24h change price
        //             "high": "11610",    // 24h highest price
        //             "low": "11200", // 24h lowest price
        //             "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
        //             "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
        //             "last": "11328.9",  // last price
        //             "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
        //             "takerFeeRate": "0.001",    // Basic Taker Fee
        //             "makerFeeRate": "0.001",    // Basic Maker Fee
        //             "takerCoefficient": "1",    // Taker Fee Coefficient
        //             "makerCoefficient": "1" // Maker Fee Coefficient
        //         }
        //     }
        //
        return this.parseTicker (response['data'], market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         "1545904980",             // Start time of the candle cycle
        //         "0.058",                  // opening price
        //         "0.049",                  // closing price
        //         "0.058",                  // highest price
        //         "0.049",                  // lowest price
        //         "0.018",                  // base volume
        //         "0.000945",               // quote volume
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
            'symbol': marketId,
            'type': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe) * 1000;
        let endAt = this.milliseconds (); // required param
        if (since !== undefined) {
            request['startAt'] = parseInt (Math.floor (since / 1000));
            if (limit === undefined) {
                // https://docs.kucoin.com/#get-klines
                // https://docs.kucoin.com/#details
                // For each query, the system would return at most 1500 pieces of data.
                // To obtain more data, please page the data by time.
                limit = this.safeInteger (this.options, 'fetchOHLCVLimit', 1500);
            }
            endAt = this.sum (since, limit * duration);
        } else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['startAt'] = parseInt (Math.floor (since / 1000));
        }
        request['endAt'] = parseInt (Math.floor (endAt / 1000));
        const response = await this.publicGetMarketCandles (this.extend (request, params));
        //
        //     {
        //         "code":"200000",
        //         "data":[
        //             ["1591517700","0.025078","0.025069","0.025084","0.025064","18.9883256","0.4761861079404"],
        //             ["1591516800","0.025089","0.025079","0.025089","0.02506","99.4716622","2.494143499081"],
        //             ["1591515900","0.025079","0.02509","0.025091","0.025068","59.83701271","1.50060885172798"],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name kucoin#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = { 'currency': currency['id'] };
        const response = await this.privatePostDepositAddresses (this.extend (request, params));
        // BCH {"code":"200000","data":{"address":"bitcoincash:qza3m4nj9rx7l9r0cdadfqxts6f92shvhvr5ls4q7z","memo":""}}
        // BTC {"code":"200000","data":{"address":"36SjucKqQpQSvsak9A7h6qzFjrVXpRNZhE","memo":""}}
        const data = this.safeValue (response, 'data', {});
        let address = this.safeString (data, 'address');
        // BCH/BSV is returned with a "bitcoincash:" prefix, which we cut off here and only keep the address
        if (address !== undefined) {
            address = address.replace ('bitcoincash:', '');
        }
        const tag = this.safeString (data, 'memo');
        if (code !== 'NIM') {
            // contains spaces
            this.checkAddress (address);
        }
        return {
            'info': response,
            'currency': code,
            'network': this.safeString (data, 'chain'),
            'address': address,
            'tag': tag,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name kucoin#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            // for USDT - OMNI, ERC20, TRC20, default is ERC20
            // for BTC - Native, Segwit, TRC20, the parameters are bech32, btc, trx, default is Native
            // 'chain': 'ERC20', // optional
        };
        // same as for withdraw
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            network = network.toLowerCase ();
            request['chain'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privateGetDepositAddresses (this.extend (request, params));
        // BCH {"code":"200000","data":{"address":"bitcoincash:qza3m4nj9rx7l9r0cdadfqxts6f92shvhvr5ls4q7z","memo":""}}
        // BTC {"code":"200000","data":{"address":"36SjucKqQpQSvsak9A7h6qzFjrVXpRNZhE","memo":""}}
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        const address = this.safeString (depositAddress, 'address');
        const code = currency['id'];
        if (code !== 'NIM') {
            // contains spaces
            this.checkAddress (address);
        }
        return {
            'info': depositAddress,
            'currency': code,
            'address': address,
            'tag': this.safeString (depositAddress, 'memo'),
            'network': this.safeString (depositAddress, 'chain'),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const level = this.safeInteger (params, 'level', 2);
        const request = { 'symbol': market['id'] };
        let method = 'publicGetMarketOrderbookLevelLevelLimit';
        const isAuthenticated = this.checkRequiredCredentials (false);
        let response = undefined;
        if (!isAuthenticated || limit !== undefined) {
            if (level === 2) {
                request['level'] = level;
                if (limit !== undefined) {
                    if ((limit === 20) || (limit === 100)) {
                        request['limit'] = limit;
                    } else {
                        throw new ExchangeError (this.id + ' fetchOrderBook() limit argument must be 20 or 100');
                    }
                }
                request['limit'] = limit ? limit : 100;
            }
        } else {
            method = 'privateGetMarketOrderbookLevel2'; // recommended (v3)
        }
        response = await this[method] (this.extend (request, params));
        //
        // public (v1) market/orderbook/level2_20 and market/orderbook/level2_100
        //
        //     {
        //         "sequence": "3262786978",
        //         "time": 1550653727731,
        //         "bids": [
        //             ["6500.12", "0.45054140"],
        //             ["6500.11", "0.45054140"],
        //         ],
        //         "asks": [
        //             ["6500.16", "0.57753524"],
        //             ["6500.15", "0.57753524"],
        //         ]
        //     }
        //
        // private (v3) market/orderbook/level2
        //
        //     {
        //         "sequence": "3262786978",
        //         "time": 1550653727731,
        //         "bids": [
        //             ["6500.12", "0.45054140"],
        //             ["6500.11", "0.45054140"],
        //         ],
        //         "asks": [
        //             ["6500.16", "0.57753524"],
        //             ["6500.15", "0.57753524"],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'time');
        const orderbook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', level - 2, level - 1);
        orderbook['nonce'] = this.safeInteger (data, 'sequence');
        return orderbook;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#createOrder
         * @description Create an order on the exchange
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} type 'limit' or 'market'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount the amount of currency to trade
         * @param {float} price *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency
         * @param {object} params  Extra parameters specific to the exchange API endpoint
         * @param {string} params.clientOid client order id, defaults to uuid if not passed
         * @param {string} params.remark remark for the order, length cannot exceed 100 utf8 characters
         * @param {string} params.tradeType 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders
         * limit orders ---------------------------------------------------
         * @param {string} params.timeInForce GTC, GTT, IOC, or FOK, default is GTC, limit orders only
         * @param {float} params.cancelAfter long, // cancel after n seconds, requires timeInForce to be GTT
         * @param {string} params.postOnly Post only flag, invalid when timeInForce is IOC or FOK
         * @param {bool} params.hidden false, // Order will not be displayed in the order book
         * @param {bool} params.iceberg false, // Only a portion of the order is displayed in the order book
         * @param {string} params.visibleSize this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order
         * market orders --------------------------------------------------
         * @param {string} params.funds // Amount of quote currency to use
         * stop orders ----------------------------------------------------
         * @param {string} params.stop  Either loss or entry, the default is loss. Requires stopPrice to be defined
         * @param {float} params.stopPrice The price at which a trigger order is triggered at
         * margin orders --------------------------------------------------
         * @param {float} params.leverage Leverage size of the order
         * @param {string} params.stp '', // self trade prevention, CN, CO, CB or DC
         * @param {string} params.marginMode 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned
         * @param {bool} params.autoBorrow false, // The system will first borrow you funds at the optimal interest rate and then place an order for you
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        // required param, cannot be used twice
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId', this.uuid ());
        params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        const request = {
            'clientOid': clientOrderId,
            'side': side,
            'symbol': marketId,
            'type': type, // limit or market
        };
        const quoteAmount = this.safeNumber2 (params, 'cost', 'funds');
        let amountString = undefined;
        let costString = undefined;
        if (type === 'market') {
            if (quoteAmount !== undefined) {
                params = this.omit (params, [ 'cost', 'funds' ]);
                // kucoin uses base precision even for quote values
                costString = this.amountToPrecision (symbol, quoteAmount);
                request['funds'] = costString;
            } else {
                amountString = this.amountToPrecision (symbol, amount);
                request['size'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            amountString = this.amountToPrecision (symbol, amount);
            request['size'] = amountString;
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        // default is take profit
        const takeProfitPrice = this.safeValue2 (params, 'takeProfitPrice', 'stopPrice');
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        if (isStopLoss && isTakeProfit) {
            throw new ExchangeError (this.id + ' createOrder() stopLossPrice and takeProfitPrice cannot both be defined');
        }
        const tradeType = this.safeString (params, 'tradeType');
        params = this.omit (params, [ 'stopLossPrice', 'takeProfitPrice', 'stopPrice' ]);
        let method = 'privatePostOrders';
        if (isStopLoss || isTakeProfit) {
            request['stop'] = isStopLoss ? 'entry' : 'loss';
            const triggerPrice = isStopLoss ? stopLossPrice : takeProfitPrice;
            request['stopPrice'] = this.priceToPrecision (symbol, triggerPrice);
            method = 'privatePostStopOrder';
        } else if (tradeType === 'MARGIN_TRADE') {
            method = 'privatePostMarginOrder';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             "orderId": "5bd6e9286d99522a52e458de"
        //         }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.milliseconds ();
        const id = this.safeString (data, 'orderId');
        const order = {
            'id': id,
            'clientOrderId': clientOrderId,
            'info': data,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': this.parseNumber (amountString),
            'cost': this.parseNumber (costString),
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        };
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @param {bool} params.stop True if cancelling a stop order
         * @returns Response from the exchange
         */
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        const stop = this.safeValue (params, 'stop');
        let method = 'privateDeleteOrdersOrderId';
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            if (stop) {
                method = 'privateDeleteStopOrderCancelOrderByClientOid';
            } else {
                method = 'privateDeleteOrderClientOrderClientOid';
            }
        } else {
            if (stop) {
                method = 'privateDeleteStopOrderOrderId';
            }
            request['orderId'] = id;
        }
        params = this.omit (params, [ 'clientOid', 'clientOrderId', 'stop' ]);
        return await this[method] (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @param {bool} params.stop true if cancelling all stop orders
         * @param {string} params.tradeType The type of trading, "TRADE" for Spot Trading, "MARGIN_TRADE" for Margin Trading
         * @param {string} params.orderIds *stop orders only* Comma seperated order IDs
         * @returns Response from the exchange
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let method = 'privateDeleteOrders';
        const stop = this.safeValue (params, 'stop');
        if (stop) {
            method = 'privateDeleteStopOrderCancel';
        }
        return await this[method] (this.extend (request, params));
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchOrdersByStatus
         * @description fetch a list of orders
         * @param {string} status *not used for stop orders* 'open' or 'closed'
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit max number of orders to return
         * @param {object} params exchange specific params
         * @param {int|undefined} params.until end time in ms
         * @param {bool|undefined} params.stop true if fetching stop orders
         * @param {string|undefined} params.side buy or sell
         * @param {string|undefined} params.type limit, market, limit_stop or market_stop
         * @param {string|undefined} params.tradeType TRADE for spot trading, MARGIN_TRADE for Margin Trading
         * @param {int|undefined} params.currentPage *stop orders only* current page
         * @param {string|undefined} params.orderIds *stop orders only* comma seperated order ID list
         * @returns An [array of order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let lowercaseStatus = status.toLowerCase ();
        if (lowercaseStatus === 'open') {
            lowercaseStatus = 'active';
        } else if (lowercaseStatus === 'closed') {
            lowercaseStatus = 'done';
        }
        const request = {
            'status': lowercaseStatus,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        if (until) {
            request['endAt'] = until;
        }
        const stop = this.safeValue (params, 'stop');
        params = this.omit (params, [ 'stop', 'till', 'until' ]);
        let method = 'privateGetOrders';
        if (stop) {
            method = 'privateGetStopOrder';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             "currentPage": 1,
        //             "pageSize": 1,
        //             "totalNum": 153408,
        //             "totalPage": 153408,
        //             "items": [
        //                 {
        //                     "id": "5c35c02703aa673ceec2a168",   //orderid
        //                     "symbol": "BTC-USDT",   //symbol
        //                     "opType": "DEAL",      // operation type,deal is pending order,cancel is cancel order
        //                     "type": "limit",       // order type,e.g. limit,markrt,stop_limit.
        //                     "side": "buy",         // transaction direction,include buy and sell
        //                     "price": "10",         // order price
        //                     "size": "2",           // order quantity
        //                     "funds": "0",          // order funds
        //                     "dealFunds": "0.166",  // deal funds
        //                     "dealSize": "2",       // deal quantity
        //                     "fee": "0",            // fee
        //                     "feeCurrency": "USDT", // charge fee currency
        //                     "stp": "",             // self trade prevention,include CN,CO,DC,CB
        //                     "stop": "",            // stop type
        //                     "stopTriggered": false,  // stop order is triggered
        //                     "stopPrice": "0",      // stop price
        //                     "timeInForce": "GTC",  // time InForce,include GTC,GTT,IOC,FOK
        //                     "postOnly": false,     // postOnly
        //                     "hidden": false,       // hidden order
        //                     "iceberg": false,      // iceberg order
        //                     "visibleSize": "0",    // display quantity for iceberg order
        //                     "cancelAfter": 0,      // cancel orders time，requires timeInForce to be GTT
        //                     "channel": "IOS",      // order source
        //                     "clientOid": "",       // user-entered order unique mark
        //                     "remark": "",          // remark
        //                     "tags": "",            // tag order source
        //                     "isActive": false,     // status before unfilled or uncancelled
        //                     "cancelExist": false,   // order cancellation transaction record
        //                     "createdAt": 1547026471000  // time
        //                 },
        //             ]
        //         }
        //    }
        const responseData = this.safeValue (response, 'data', {});
        const orders = this.safeValue (responseData, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @param {int|undefined} params.till end time in ms
         * @param {string|undefined} params.side buy or sell
         * @param {string|undefined} params.type limit, market, limit_stop or market_stop
         * @param {string|undefined} params.tradeType TRADE for spot trading, MARGIN_TRADE for Margin Trading
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('done', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @param {int} params.till end time in ms
         * @param {bool} params.stop true if fetching stop orders
         * @param {string} params.side buy or sell
         * @param {string} params.type limit, market, limit_stop or market_stop
         * @param {string} params.tradeType TRADE for spot trading, MARGIN_TRADE for Margin Trading
         * @param {int} params.currentPage *stop orders only* current page
         * @param {string} params.orderIds *stop orders only* comma seperated order ID list
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('active', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchOrder
         * @description fetch an order
         * @param {string} id Order id
         * @param {string} symbol not sent to exchange except for stop orders with clientOid, but used internally by CCXT to filter
         * @param {object} params exchange specific parameters
         * @param {bool} params.stop true if fetching a stop order
         * @param {bool} params.clientOid unique order id created by users to identify their orders
         * @returns An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        const stop = this.safeValue (params, 'stop');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        params = this.omit (params, 'stop');
        let method = 'privateGetOrdersOrderId';
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            if (stop) {
                method = 'privateGetStopOrderQueryOrderByClientOid';
                if (symbol !== undefined) {
                    request['symbol'] = market['id'];
                }
            } else {
                method = 'privateGetOrderClientOrderClientOid';
            }
        } else {
            // a special case for undefined ids
            // otherwise a wrong endpoint for all orders will be triggered
            // https://github.com/ccxt/ccxt/issues/7234
            if (id === undefined) {
                throw new InvalidOrder (this.id + ' fetchOrder() requires an order id');
            }
            if (stop) {
                method = 'privateGetStopOrderOrderId';
            }
            request['orderId'] = id;
        }
        params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, params));
        let responseData = this.safeValue (response, 'data');
        if (method === 'privateGetStopOrderQueryOrderByClientOid') {
            responseData = this.safeValue (responseData, 0);
        }
        return this.parseOrder (responseData, market);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "id": "5c35c02703aa673ceec2a168",   //orderid
        //         "symbol": "BTC-USDT",   //symbol
        //         "opType": "DEAL",      // operation type,deal is pending order,cancel is cancel order
        //         "type": "limit",       // order type,e.g. limit,markrt,stop_limit.
        //         "side": "buy",         // transaction direction,include buy and sell
        //         "price": "10",         // order price
        //         "size": "2",           // order quantity
        //         "funds": "0",          // order funds
        //         "dealFunds": "0.166",  // deal funds
        //         "dealSize": "2",       // deal quantity
        //         "fee": "0",            // fee
        //         "feeCurrency": "USDT", // charge fee currency
        //         "stp": "",             // self trade prevention,include CN,CO,DC,CB
        //         "stop": "",            // stop type
        //         "stopTriggered": false,  // stop order is triggered
        //         "stopPrice": "0",      // stop price
        //         "timeInForce": "GTC",  // time InForce,include GTC,GTT,IOC,FOK
        //         "postOnly": false,     // postOnly
        //         "hidden": false,       // hidden order
        //         "iceberg": false,      // iceberg order
        //         "visibleSize": "0",    // display quantity for iceberg order
        //         "cancelAfter": 0,      // cancel orders time，requires timeInForce to be GTT
        //         "channel": "IOS",      // order source
        //         "clientOid": "",       // user-entered order unique mark
        //         "remark": "",          // remark
        //         "tags": "",            // tag order source
        //         "isActive": false,     // status before unfilled or uncancelled
        //         "cancelExist": false,   // order cancellation transaction record
        //         "createdAt": 1547026471000  // time
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        const orderId = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const timestamp = this.safeInteger (order, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeString (order, 'price');
        // price is zero for market order
        // omitZero is called in safeOrder2
        const side = this.safeString (order, 'side');
        const feeCurrencyId = this.safeString (order, 'feeCurrency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const feeCost = this.safeNumber (order, 'fee');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'dealSize');
        const cost = this.safeString (order, 'dealFunds');
        // bool
        const isActive = this.safeValue (order, 'isActive', false);
        const cancelExist = this.safeValue (order, 'cancelExist', false);
        const stop = this.safeString (order, 'stop');
        const stopTriggered = this.safeValue (order, 'stopTriggered', false);
        let status = isActive ? 'open' : 'closed';
        const cancelExistWithStop = cancelExist || (!isActive && stop && !stopTriggered);
        status = cancelExistWithStop ? 'canceled' : status;
        const fee = {
            'currency': feeCurrency,
            'cost': feeCost,
        };
        const clientOrderId = this.safeString (order, 'clientOid');
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'amount': amount,
            'price': price,
            'stopPrice': stopPrice,
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fee,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const method = this.options['fetchMyTradesMethod'];
        let parseResponseData = false;
        if (method === 'private_get_fills') {
            // does not return trades earlier than 2019-02-18T00:00:00Z
            if (since !== undefined) {
                // only returns trades up to one week after the since param
                request['startAt'] = since;
            }
        } else if (method === 'private_get_limit_fills') {
            // does not return trades earlier than 2019-02-18T00:00:00Z
            // takes no params
            // only returns first 1000 trades (not only "in the last 24 hours" as stated in the docs)
            parseResponseData = true;
        } else if (method === 'private_get_hist_orders') {
            // despite that this endpoint is called `HistOrders`
            // it returns historical trades instead of orders
            // returns trades earlier than 2019-02-18T00:00:00Z only
            if (since !== undefined) {
                request['startAt'] = parseInt (since / 1000);
            }
        } else {
            throw new ExchangeError (this.id + ' fetchMyTradesMethod() invalid method');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "currentPage": 1,
        //         "pageSize": 50,
        //         "totalNum": 1,
        //         "totalPage": 1,
        //         "items": [
        //             {
        //                 "symbol":"BTC-USDT",       // symbol
        //                 "tradeId":"5c35c02709e4f67d5266954e",        // trade id
        //                 "orderId":"5c35c02703aa673ceec2a168",        // order id
        //                 "counterOrderId":"5c1ab46003aa676e487fa8e3", // counter order id
        //                 "side":"buy",              // transaction direction,include buy and sell
        //                 "liquidity":"taker",       // include taker and maker
        //                 "forceTaker":true,         // forced to become taker
        //                 "price":"0.083",           // order price
        //                 "size":"0.8424304",        // order quantity
        //                 "funds":"0.0699217232",    // order funds
        //                 "fee":"0",                 // fee
        //                 "feeRate":"0",             // fee rate
        //                 "feeCurrency":"USDT",      // charge fee currency
        //                 "stop":"",                 // stop type
        //                 "type":"limit",            // order type, e.g. limit, market, stop_limit.
        //                 "createdAt":1547026472000  // time
        //             },
        //             //------------------------------------------------------
        //             // v1 (historical) trade response structure
        //             {
        //                 "symbol": "SNOV-ETH",
        //                 "dealPrice": "0.0000246",
        //                 "dealValue": "0.018942",
        //                 "amount": "770",
        //                 "fee": "0.00001137",
        //                 "side": "sell",
        //                 "createdAt": 1540080199
        //                 "id":"5c4d389e4c8c60413f78e2e5",
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        let trades = undefined;
        if (parseResponseData) {
            trades = data;
        } else {
            trades = this.safeValue (data, 'items', []);
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        // pagination is not supported on the exchange side anymore
        // if (since !== undefined) {
        //     request['startAt'] = Math.floor (since / 1000);
        // }
        // if (limit !== undefined) {
        //     request['pageSize'] = limit;
        // }
        const response = await this.publicGetMarketHistories (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "sequence": "1548764654235",
        //                 "side": "sell",
        //                 "size":"0.6841354",
        //                 "price":"0.03202",
        //                 "time":1548848575203567174
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": "1548764654235",
        //         "side": "sell",
        //         "size":"0.6841354",
        //         "price":"0.03202",
        //         "time":1548848575203567174
        //     }
        //
        //     {
        //         sequence: '1568787654360',
        //         symbol: 'BTC-USDT',
        //         side: 'buy',
        //         size: '0.00536577',
        //         price: '9345',
        //         takerOrderId: '5e356c4a9f1a790008f8d921',
        //         time: '1580559434436443257',
        //         type: 'match',
        //         makerOrderId: '5e356bffedf0010008fa5d7f',
        //         tradeId: '5e356c4aeefabd62c62a1ece'
        //     }
        //
        // fetchMyTrades (private) v2
        //
        //     {
        //         "symbol":"BTC-USDT",
        //         "tradeId":"5c35c02709e4f67d5266954e",
        //         "orderId":"5c35c02703aa673ceec2a168",
        //         "counterOrderId":"5c1ab46003aa676e487fa8e3",
        //         "side":"buy",
        //         "liquidity":"taker",
        //         "forceTaker":true,
        //         "price":"0.083",
        //         "size":"0.8424304",
        //         "funds":"0.0699217232",
        //         "fee":"0",
        //         "feeRate":"0",
        //         "feeCurrency":"USDT",
        //         "stop":"",
        //         "type":"limit",
        //         "createdAt":1547026472000
        //     }
        //
        // fetchMyTrades v2 alternative format since 2019-05-21 https://github.com/ccxt/ccxt/pull/5162
        //
        //     {
        //         symbol: "OPEN-BTC",
        //         forceTaker:  false,
        //         orderId: "5ce36420054b4663b1fff2c9",
        //         fee: "0",
        //         feeCurrency: "",
        //         type: "",
        //         feeRate: "0",
        //         createdAt: 1558417615000,
        //         size: "12.8206",
        //         stop: "",
        //         price: "0",
        //         funds: "0",
        //         tradeId: "5ce390cf6e0db23b861c6e80"
        //     }
        //
        // fetchMyTrades (private) v1 (historical)
        //
        //     {
        //         "symbol": "SNOV-ETH",
        //         "dealPrice": "0.0000246",
        //         "dealValue": "0.018942",
        //         "amount": "770",
        //         "fee": "0.00001137",
        //         "side": "sell",
        //         "createdAt": 1540080199
        //         "id":"5c4d389e4c8c60413f78e2e5",
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const id = this.safeString2 (trade, 'tradeId', 'id');
        const orderId = this.safeString (trade, 'orderId');
        const takerOrMaker = this.safeString (trade, 'liquidity');
        let timestamp = this.safeInteger (trade, 'time');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1000000);
        } else {
            timestamp = this.safeInteger (trade, 'createdAt');
            // if it's a historical v1 trade, the exchange returns timestamp in seconds
            if (('dealValue' in trade) && (timestamp !== undefined)) {
                timestamp = timestamp * 1000;
            }
        }
        const priceString = this.safeString2 (trade, 'price', 'dealPrice');
        const amountString = this.safeString2 (trade, 'size', 'amount');
        const side = this.safeString (trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            let feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            if (feeCurrency === undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
                'rate': this.safeString (trade, 'feeRate'),
            };
        }
        let type = this.safeString (trade, 'type');
        if (type === 'match') {
            type = undefined;
        }
        const costString = this.safeString2 (trade, 'funds', 'dealValue');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name kucoin#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': market['id'],
        };
        const response = await this.privateGetTradeFees (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: [
        //           {
        //             symbol: 'BTC-USDT',
        //             takerFeeRate: '0.001',
        //             makerFeeRate: '0.001'
        //           }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        const marketId = this.safeString (first, 'symbol');
        return {
            'info': response,
            'symbol': this.safeSymbol (marketId, market),
            'maker': this.safeNumber (first, 'makerFeeRate'),
            'taker': this.safeNumber (first, 'takerFeeRate'),
            'percentage': true,
            'tierBased': true,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
            // 'memo': tag,
            // 'isInner': false, // internal transfer or external withdrawal
            // 'remark': 'optional',
            // 'chain': 'OMNI', // 'ERC20', 'TRC20', default is ERC20, This only apply for multi-chain currency, and there is no need for single chain currency.
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        //
        // https://github.com/ccxt/ccxt/issues/5558
        //
        //     {
        //         "code":  200000,
        //         "data": {
        //             "withdrawalId":  "5bffb63303aa675e8bbe18f9"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'SUCCESS': 'ok',
            'PROCESSING': 'ok',
            'FAILURE': 'failed',
        };
        return this.safeString (statuses, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //         "memo": "5c247c8a03aa677cea2a251d",
        //         "amount": 1,
        //         "fee": 0.0001,
        //         "currency": "KCS",
        //         "isInner": false,
        //         "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //         "status": "SUCCESS",
        //         "createdAt": 1544178843000,
        //         "updatedAt": 1544178891000
        //         "remark":"foobar"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": "5c2dc64e03aa675aa263f1ac",
        //         "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //         "memo": "",
        //         "currency": "ETH",
        //         "amount": 1.0000000,
        //         "fee": 0.0100000,
        //         "walletTxId": "3e2414d82acce78d38be7fe9",
        //         "isInner": false,
        //         "status": "FAILURE",
        //         "createdAt": 1546503758000,
        //         "updatedAt": 1546504603000
        //         "remark":"foobar"
        //     }
        //
        // withdraw
        //
        //     {
        //         "withdrawalId":  "5bffb63303aa675e8bbe18f9"
        //     }
        //
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let address = this.safeString (transaction, 'address');
        const amount = this.safeString (transaction, 'amount');
        let txid = this.safeString (transaction, 'walletTxId');
        if (txid !== undefined) {
            const txidParts = txid.split ('@');
            const numTxidParts = txidParts.length;
            if (numTxidParts > 1) {
                if (address === undefined) {
                    if (txidParts[1].length > 1) {
                        address = txidParts[1];
                    }
                }
            }
            txid = txidParts[0];
        }
        let type = (txid === undefined) ? 'withdrawal' : 'deposit';
        const rawStatus = this.safeString (transaction, 'status');
        let fee = undefined;
        const feeCost = this.safeString (transaction, 'fee');
        if (feeCost !== undefined) {
            let rate = undefined;
            if (amount !== undefined) {
                rate = Precise.stringDiv (feeCost, amount);
            }
            fee = {
                'cost': this.parseNumber (feeCost),
                'rate': this.parseNumber (rate),
                'currency': code,
            };
        }
        let timestamp = this.safeInteger2 (transaction, 'createdAt', 'createAt');
        let updated = this.safeInteger (transaction, 'updatedAt');
        const isV1 = !('createdAt' in transaction);
        // if it's a v1 structure
        if (isV1) {
            type = ('address' in transaction) ? 'withdrawal' : 'deposit';
            if (timestamp !== undefined) {
                timestamp = timestamp * 1000;
            }
            if (updated !== undefined) {
                updated = updated * 1000;
            }
        }
        const tag = this.safeString (transaction, 'memo');
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'id', 'withdrawalId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'currency': code,
            'amount': this.parseNumber (amount),
            'txid': txid,
            'type': type,
            'status': this.parseTransactionStatus (rawStatus),
            'comment': this.safeString (transaction, 'remark'),
            'fee': fee,
            'updated': updated,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let method = 'privateGetDeposits';
        if (since !== undefined) {
            // if since is earlier than 2019-02-18T00:00:00Z
            if (since < 1550448000000) {
                request['startAt'] = parseInt (since / 1000);
                method = 'privateGetHistDeposits';
            } else {
                request['startAt'] = since;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 //--------------------------------------------------
        //                 // version 2 deposit response structure
        //                 {
        //                     "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //                     "memo": "5c247c8a03aa677cea2a251d",
        //                     "amount": 1,
        //                     "fee": 0.0001,
        //                     "currency": "KCS",
        //                     "isInner": false,
        //                     "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //                     "status": "SUCCESS",
        //                     "createdAt": 1544178843000,
        //                     "updatedAt": 1544178891000
        //                     "remark":"foobar"
        //                 },
        //                 //--------------------------------------------------
        //                 // version 1 (historical) deposit response structure
        //                 {
        //                     "currency": "BTC",
        //                     "createAt": 1528536998,
        //                     "amount": "0.03266638",
        //                     "walletTxId": "55c643bc2c68d6f17266383ac1be9e454038864b929ae7cee0bc408cc5c869e8@12ffGWmMMD1zA1WbFm7Ho3JZ1w6NYXjpFk@234",
        //                     "isInner": false,
        //                     "status": "SUCCESS",
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions (responseData, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let method = 'privateGetWithdrawals';
        if (since !== undefined) {
            // if since is earlier than 2019-02-18T00:00:00Z
            if (since < 1550448000000) {
                request['startAt'] = parseInt (since / 1000);
                method = 'privateGetHistWithdrawals';
            } else {
                request['startAt'] = since;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 //--------------------------------------------------
        //                 // version 2 withdrawal response structure
        //                 {
        //                     "id": "5c2dc64e03aa675aa263f1ac",
        //                     "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //                     "memo": "",
        //                     "currency": "ETH",
        //                     "amount": 1.0000000,
        //                     "fee": 0.0100000,
        //                     "walletTxId": "3e2414d82acce78d38be7fe9",
        //                     "isInner": false,
        //                     "status": "FAILURE",
        //                     "createdAt": 1546503758000,
        //                     "updatedAt": 1546504603000
        //                 },
        //                 //--------------------------------------------------
        //                 // version 1 (historical) withdrawal response structure
        //                 {
        //                     "currency": "BTC",
        //                     "createAt": 1526723468,
        //                     "amount": "0.534",
        //                     "address": "33xW37ZSW4tQvg443Pc7NLCAs167Yc2XUV",
        //                     "walletTxId": "aeacea864c020acf58e51606169240e96774838dcd4f7ce48acf38e3651323f4",
        //                     "isInner": false,
        //                     "status": "SUCCESS"
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions (responseData, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name kucoin#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const requestedType = this.safeString (params, 'type', defaultType);
        const accountsByType = this.safeValue (this.options, 'accountsByType');
        const type = this.safeString (accountsByType, requestedType, requestedType);
        params = this.omit (params, 'type');
        const request = {
            'type': type,
        };
        const response = await this.privateGetAccounts (this.extend (request, params));
        //
        //     {
        //         "code":"200000",
        //         "data":[
        //             {"balance":"0.00009788","available":"0.00009788","holds":"0","currency":"BTC","id":"5c6a4fd399a1d81c4f9cc4d0","type":"trade"},
        //             {"balance":"3.41060034","available":"3.41060034","holds":"0","currency":"SOUL","id":"5c6a4d5d99a1d8182d37046d","type":"trade"},
        //             {"balance":"0.01562641","available":"0.01562641","holds":"0","currency":"NEO","id":"5c6a4f1199a1d8165a99edb1","type":"trade"},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const balanceType = this.safeString (balance, 'type');
            if (balanceType === type) {
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['total'] = this.safeString (balance, 'balance');
                account['free'] = this.safeString (balance, 'available');
                account['used'] = this.safeString (balance, 'holds');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name kucoin#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://docs.kucoin.com/#inner-transfer
         * @see https://docs.kucoin.com/futures/#transfer-funds-to-kucoin-main-account-2
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const requestedAmount = this.currencyToPrecision (code, amount);
        let fromId = this.convertTypeToAccount (fromAccount);
        let toId = this.convertTypeToAccount (toAccount);
        const fromIsolated = this.inArray (fromId, this.ids);
        const toIsolated = this.inArray (toId, this.ids);
        if (fromId === 'contract') {
            if (toId !== 'main') {
                throw new ExchangeError (this.id + ' transfer() only supports transferring from futures account to main account');
            }
            const request = {
                'currency': currency['id'],
                'amount': requestedAmount,
            };
            if (!('bizNo' in params)) {
                // it doesn't like more than 24 characters
                request['bizNo'] = this.uuid22 ();
            }
            const response = await this.futuresPrivatePostTransferOut (this.extend (request, params));
            //
            //     {
            //         'code': '200000',
            //         'data': {
            //             'applyId': '605a87217dff1500063d485d',
            //             'bizNo': 'bcd6e5e1291f4905af84dc',
            //             'payAccountType': 'CONTRACT',
            //             'payTag': 'DEFAULT',
            //             'remark': '',
            //             'recAccountType': 'MAIN',
            //             'recTag': 'DEFAULT',
            //             'recRemark': '',
            //             'recSystem': 'KUCOIN',
            //             'status': 'PROCESSING',
            //             'currency': 'XBT',
            //             'amount': '0.00001',
            //             'fee': '0',
            //             'sn': '573688685663948',
            //             'reason': '',
            //             'createdAt': 1616545569000,
            //             'updatedAt': 1616545569000
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data');
            return this.parseTransfer (data, currency);
        } else {
            const request = {
                'currency': currency['id'],
                'amount': requestedAmount,
            };
            if (fromIsolated || toIsolated) {
                if (this.inArray (fromId, this.ids)) {
                    request['fromTag'] = fromId;
                    fromId = 'isolated';
                }
                if (this.inArray (toId, this.ids)) {
                    request['toTag'] = toId;
                    toId = 'isolated';
                }
            }
            request['from'] = fromId;
            request['to'] = toId;
            if (!('clientOid' in params)) {
                request['clientOid'] = this.uuid ();
            }
            const response = await this.privatePostAccountsInnerTransfer (this.extend (request, params));
            //
            //     {
            //         'code': '200000',
            //         'data': {
            //              'orderId': '605a6211e657f00006ad0ad6'
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data');
            const transfer = this.parseTransfer (data, currency);
            return this.extend (transfer, {
                'amount': requestedAmount,
                'fromAccount': fromId,
                'toAccount': toId,
            });
        }
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer (spot)
        //
        //     {
        //         'orderId': '605a6211e657f00006ad0ad6'
        //     }
        //
        //
        // transfer (futures)
        //
        //     {
        //         'applyId': '605a87217dff1500063d485d',
        //         'bizNo': 'bcd6e5e1291f4905af84dc',
        //         'payAccountType': 'CONTRACT',
        //         'payTag': 'DEFAULT',
        //         'remark': '',
        //         'recAccountType': 'MAIN',
        //         'recTag': 'DEFAULT',
        //         'recRemark': '',
        //         'recSystem': 'KUCOIN',
        //         'status': 'PROCESSING',
        //         'currency': 'XBT',
        //         'amount': '0.00001',
        //         'fee': '0',
        //         'sn': '573688685663948',
        //         'reason': '',
        //         'createdAt': 1616545569000,
        //         'updatedAt': 1616545569000
        //     }
        //
        const timestamp = this.safeInteger (transfer, 'createdAt');
        const currencyId = this.safeString (transfer, 'currency');
        const rawStatus = this.safeString (transfer, 'status');
        const accountFromRaw = this.safeStringLower (transfer, 'payAccountType');
        const accountToRaw = this.safeStringLower (transfer, 'recAccountType');
        const accountsByType = this.safeValue (this.options, 'accountsByType');
        const accountFrom = this.safeString (accountsByType, accountFromRaw, accountFromRaw);
        const accountTo = this.safeString (accountsByType, accountToRaw, accountToRaw);
        return {
            'id': this.safeString2 (transfer, 'applyId', 'orderId'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': accountFrom,
            'toAccount': accountTo,
            'status': this.parseTransferStatus (rawStatus),
            'info': transfer,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'PROCESSING': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseLedgerEntryType (type) {
        const types = {
            'Assets Transferred in After Upgrading': 'transfer', // Assets Transferred in After V1 to V2 Upgrading
            'Deposit': 'transaction', // Deposit
            'Withdrawal': 'transaction', // Withdrawal
            'Transfer': 'transfer', // Transfer
            'Trade_Exchange': 'trade', // Trade
            // 'Vote for Coin': 'Vote for Coin', // Vote for Coin
            'KuCoin Bonus': 'bonus', // KuCoin Bonus
            'Referral Bonus': 'referral', // Referral Bonus
            'Rewards': 'bonus', // Activities Rewards
            // 'Distribution': 'Distribution', // Distribution, such as get GAS by holding NEO
            'Airdrop/Fork': 'airdrop', // Airdrop/Fork
            'Other rewards': 'bonus', // Other rewards, except Vote, Airdrop, Fork
            'Fee Rebate': 'rebate', // Fee Rebate
            'Buy Crypto': 'trade', // Use credit card to buy crypto
            'Sell Crypto': 'sell', // Use credit card to sell crypto
            'Public Offering Purchase': 'trade', // Public Offering Purchase for Spotlight
            // 'Send red envelope': 'Send red envelope', // Send red envelope
            // 'Open red envelope': 'Open red envelope', // Open red envelope
            // 'Staking': 'Staking', // Staking
            // 'LockDrop Vesting': 'LockDrop Vesting', // LockDrop Vesting
            // 'Staking Profits': 'Staking Profits', // Staking Profits
            // 'Redemption': 'Redemption', // Redemption
            'Refunded Fees': 'fee', // Refunded Fees
            'KCS Pay Fees': 'fee', // KCS Pay Fees
            'Margin Trade': 'trade', // Margin Trade
            'Loans': 'Loans', // Loans
            // 'Borrowings': 'Borrowings', // Borrowings
            // 'Debt Repayment': 'Debt Repayment', // Debt Repayment
            // 'Loans Repaid': 'Loans Repaid', // Loans Repaid
            // 'Lendings': 'Lendings', // Lendings
            // 'Pool transactions': 'Pool transactions', // Pool-X transactions
            'Instant Exchange': 'trade', // Instant Exchange
            'Sub-account transfer': 'transfer', // Sub-account transfer
            'Liquidation Fees': 'fee', // Liquidation Fees
            // 'Soft Staking Profits': 'Soft Staking Profits', // Soft Staking Profits
            // 'Voting Earnings': 'Voting Earnings', // Voting Earnings on Pool-X
            // 'Redemption of Voting': 'Redemption of Voting', // Redemption of Voting on Pool-X
            // 'Voting': 'Voting', // Voting on Pool-X
            // 'Convert to KCS': 'Convert to KCS', // Convert to KCS
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "id": "611a1e7c6a053300067a88d9", //unique key for each ledger entry
        //         "currency": "USDT", //Currency
        //         "amount": "10.00059547", //The total amount of assets (fees included) involved in assets changes such as transaction, withdrawal and bonus distribution.
        //         "fee": "0", //Deposit or withdrawal fee
        //         "balance": "0", //Total assets of a currency remaining funds after transaction
        //         "accountType": "MAIN", //Account Type
        //         "bizType": "Loans Repaid", //business type
        //         "direction": "in", //side, in or out
        //         "createdAt": 1629101692950, //Creation time
        //         "context": "{\"borrowerUserId\":\"601ad03e50dc810006d242ea\",\"loanRepayDetailNo\":\"611a1e7cc913d000066cf7ec\"}" //Business core parameters
        //     }
        //
        const id = this.safeString (item, 'id');
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (item, 'amount');
        const balanceAfter = undefined;
        // const balanceAfter = this.safeNumber (item, 'balance'); only returns zero string
        const bizType = this.safeString (item, 'bizType');
        const type = this.parseLedgerEntryType (bizType);
        const direction = this.safeString (item, 'direction');
        const timestamp = this.safeInteger (item, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const account = this.safeString (item, 'accountType'); // MAIN, TRADE, MARGIN, or CONTRACT
        const context = this.safeString (item, 'context'); // contains other information about the ledger entry
        //
        // withdrawal transaction
        //
        //     "{\"orderId\":\"617bb2d09e7b3b000196dac8\",\"txId\":\"0x79bb9855f86b351a45cab4dc69d78ca09586a94c45dde49475722b98f401b054\"}"
        //
        // deposit to MAIN, trade via MAIN
        //
        //     "{\"orderId\":\"617ab9949e7b3b0001948081\",\"txId\":\"0x7a06b16bbd6b03dbc3d96df5683b15229fc35e7184fd7179a5f3a310bd67d1fa@default@0\"}"
        //
        // sell trade
        //
        //     "{\"symbol\":\"ETH-USDT\",\"orderId\":\"617adcd1eb3fa20001dd29a1\",\"tradeId\":\"617adcd12e113d2b91222ff9\"}"
        //
        let referenceId = undefined;
        if (context !== undefined && context !== '') {
            try {
                const parsed = JSON.parse (context);
                const orderId = this.safeString (parsed, 'orderId');
                const tradeId = this.safeString (parsed, 'tradeId');
                // transactions only have an orderId but for trades we wish to use tradeId
                if (tradeId !== undefined) {
                    referenceId = tradeId;
                } else {
                    referenceId = orderId;
                }
            } catch (exc) {
                referenceId = context;
            }
        }
        let fee = undefined;
        const feeCost = this.safeNumber (item, 'fee');
        let feeCurrency = undefined;
        if (feeCost !== 0) {
            feeCurrency = code;
            fee = { 'cost': feeCost, 'currency': feeCurrency };
        }
        return {
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': account,
            'type': type,
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': datetime,
            'before': undefined,
            'after': balanceAfter, // undefined
            'status': undefined,
            'fee': fee,
            'info': item,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const request = {
            // 'currency': currency['id'], // can choose up to 10, if not provided returns for all currencies by default
            // 'direction': 'in', // 'out'
            // 'bizType': 'DEPOSIT', // DEPOSIT, WITHDRAW, TRANSFER, SUB_TRANSFER,TRADE_EXCHANGE, MARGIN_EXCHANGE, KUCOIN_BONUS (optional)
            // 'startAt': since,
            // 'endAt': exchange.milliseconds (),
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        // atm only single currency retrieval is supported
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetAccountsLedgers (this.extend (request, params));
        //
        //     {
        //         "code":"200000",
        //         "data":{
        //             "currentPage":1,
        //             "pageSize":50,
        //             "totalNum":1,
        //             "totalPage":1,
        //             "items":[
        //                 {
        //                     "id":"617cc528729f5f0001c03ceb",
        //                     "currency":"GAS",
        //                     "amount":"0.00000339",
        //                     "fee":"0",
        //                     "balance":"0",
        //                     "accountType":"MAIN",
        //                     "bizType":"Distribution",
        //                     "direction":"in",
        //                     "createdAt":1635566888183,
        //                     "context":"{\"orderId\":\"617cc47a1c47ed0001ce3606\",\"description\":\"Holding NEO,distribute GAS(2021/10/30)\"}"
        //                 }
        //                 {
        //                     "id": "611a1e7c6a053300067a88d9",//unique key
        //                     "currency": "USDT", //Currency
        //                     "amount": "10.00059547", //Change amount of the funds
        //                     "fee": "0", //Deposit or withdrawal fee
        //                     "balance": "0", //Total assets of a currency
        //                     "accountType": "MAIN", //Account Type
        //                     "bizType": "Loans Repaid", //business type
        //                     "direction": "in", //side, in or out
        //                     "createdAt": 1629101692950, //Creation time
        //                     "context": "{\"borrowerUserId\":\"601ad03e50dc810006d242ea\",\"loanRepayDetailNo\":\"611a1e7cc913d000066cf7ec\"}"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const items = this.safeValue (data, 'items');
        return this.parseLedger (items, currency, since, limit);
    }

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        const versions = this.safeValue (this.options, 'versions', {});
        const apiVersions = this.safeValue (versions, api, {});
        const methodVersions = this.safeValue (apiVersions, method, {});
        const defaultVersion = this.safeString (methodVersions, path, this.options['version']);
        const version = this.safeString (params, 'version', defaultVersion);
        if (version === 'v3' && ('v3' in config)) {
            return config['v3'];
        } else if (version === 'v2' && ('v2' in config)) {
            return config['v2'];
        } else if (version === 'v1' && ('v1' in config)) {
            return config['v1'];
        }
        return this.safeValue (config, 'cost', 1);
    }

    async fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchBorrowRateHistory
         * @description retrieves a history of a currencies borrow interest rate at specific time slots
         * @see https://docs.kucoin.com/#margin-trade-data
         * @param {string} code unified currency code
         * @param {int|undefined} since timestamp for the earliest borrow rate
         * @param {int|undefined} limit the maximum number of [borrow rate structures]
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} an array of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetMarginTradeLast (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "tradeId": "62db2dcaff219600012b56cd",
        //                 "currency": "USDT",
        //                 "size": "10",
        //                 "dailyIntRate": "0.00003",
        //                 "term": 7,
        //                 "timestamp": 1658531274508488480
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseBorrowRateHistory (data, code);
    }

    parseBorrowRateHistory (response, code, since, limit) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const borrowRate = this.parseBorrowRate (item);
            result.push (borrowRate);
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterByCurrencySinceLimit (sorted, code, since, limit);
    }

    parseBorrowRate (info, currency = undefined) {
        //
        //     {
        //         "tradeId": "62db2dcaff219600012b56cd",
        //         "currency": "USDT",
        //         "size": "10",
        //         "dailyIntRate": "0.00003",
        //         "term": 7,
        //         "timestamp": 1658531274508488480
        //     },
        //
        const timestampId = this.safeString (info, 'timestamp');
        const timestamp = Precise.stringMul (timestampId, '0.000001');
        const currencyId = this.safeString (info, 'currency');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': this.safeNumber (info, 'dailyIntRate'),
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @see https://docs.kucoin.com/#get-repay-record
         * @see https://docs.kucoin.com/#query-isolated-margin-account-info
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol, required for isolated margin
         * @param {int|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {int|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' default is 'cross'
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-interest-structure}
         */
        await this.loadMarkets ();
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBorrowInterest', params);
        if (marginMode === undefined) {
            marginMode = 'cross'; // cross as default marginMode
        }
        const request = {};
        let method = 'privateGetMarginBorrowOutstanding';
        if (marginMode === 'isolated') {
            if (code !== undefined) {
                const currency = this.currency (code);
                request['balanceCurrency'] = currency['id'];
            }
            method = 'privateGetIsolatedAccounts';
        } else {
            if (code !== undefined) {
                const currency = this.currency (code);
                request['currency'] = currency['id'];
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Cross
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 10,
        //             "totalNum": 1,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "tradeId": "62e1e320ff219600013b44e2",
        //                     "currency": "USDT",
        //                     "principal": "100",
        //                     "accruedInterest": "0.00016667",
        //                     "liability": "100.00016667",
        //                     "repaidSize": "0",
        //                     "dailyIntRate": "0.00004",
        //                     "term": 7,
        //                     "createdAt": 1658970912000,
        //                     "maturityTime": 1659575713000
        //                 }
        //             ]
        //         }
        //     }
        //
        // Isolated
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "totalConversionBalance": "0.02138647",
        //             "liabilityConversionBalance": "0.01480001",
        //             "assets": [
        //                 {
        //                     "symbol": "NKN-USDT",
        //                     "status": "CLEAR",
        //                     "debtRatio": "0",
        //                     "baseAsset": {
        //                         "currency": "NKN",
        //                         "totalBalance": "0",
        //                         "holdBalance": "0",
        //                         "availableBalance": "0",
        //                         "liability": "0",
        //                         "interest": "0",
        //                         "borrowableAmount": "0"
        //                     },
        //                     "quoteAsset": {
        //                         "currency": "USDT",
        //                         "totalBalance": "0",
        //                         "holdBalance": "0",
        //                         "availableBalance": "0",
        //                         "liability": "0",
        //                         "interest": "0",
        //                         "borrowableAmount": "0"
        //                     }
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const assets = (marginMode === 'isolated') ? this.safeValue (data, 'assets', []) : this.safeValue (data, 'items', []);
        return this.parseBorrowInterests (assets, undefined);
    }

    parseBorrowInterest (info, market = undefined) {
        //
        // Cross
        //
        //     {
        //         "tradeId": "62e1e320ff219600013b44e2",
        //         "currency": "USDT",
        //         "principal": "100",
        //         "accruedInterest": "0.00016667",
        //         "liability": "100.00016667",
        //         "repaidSize": "0",
        //         "dailyIntRate": "0.00004",
        //         "term": 7,
        //         "createdAt": 1658970912000,
        //         "maturityTime": 1659575713000
        //     },
        //
        // Isolated
        //
        //     {
        //         "symbol": "BTC-USDT",
        //         "status": "CLEAR",
        //         "debtRatio": "0",
        //         "baseAsset": {
        //             "currency": "BTC",
        //             "totalBalance": "0",
        //             "holdBalance": "0",
        //             "availableBalance": "0",
        //             "liability": "0",
        //             "interest": "0",
        //             "borrowableAmount": "0.0592"
        //         },
        //         "quoteAsset": {
        //             "currency": "USDT",
        //             "totalBalance": "149.99991731",
        //             "holdBalance": "0",
        //             "availableBalance": "149.99991731",
        //             "liability": "0",
        //             "interest": "0",
        //             "borrowableAmount": "1349"
        //         }
        //     },
        //
        const marketId = this.safeString (info, 'symbol');
        const marginMode = (marketId === undefined) ? 'cross' : 'isolated';
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (info, 'createdAt');
        const isolatedBase = this.safeValue (info, 'baseAsset', {});
        let amountBorrowed = undefined;
        let interest = undefined;
        let currencyId = undefined;
        if (marginMode === 'isolated') {
            amountBorrowed = this.safeNumber (isolatedBase, 'liability');
            interest = this.safeNumber (isolatedBase, 'interest');
            currencyId = this.safeString (isolatedBase, 'currency');
        } else {
            amountBorrowed = this.safeNumber (info, 'principal');
            interest = this.safeNumber (info, 'accruedInterest');
            currencyId = this.safeString (info, 'currency');
        }
        return {
            'symbol': symbol,
            'marginMode': marginMode,
            'currency': this.safeCurrencyCode (currencyId),
            'interest': interest,
            'interestRate': this.safeNumber (info, 'dailyIntRate'),
            'amountBorrowed': amountBorrowed,
            'timestamp': timestamp,  // create time
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async borrowMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#borrowMargin
         * @description create a loan to borrow margin
         * @see https://docs.kucoin.com/#post-borrow-order
         * @see https://docs.kucoin.com/#isolated-margin-borrowing
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol unified market symbol, required for isolated margin
         * @param {object} params extra parameters specific to the kucoin api endpoints
         * @param {string} params.timeInForce either IOC or FOK
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' default is 'cross'
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'size': this.currencyToPrecision (code, amount),
        };
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('borrowMargin', params);
        if (marginMode === undefined) {
            marginMode = 'cross'; // cross as default marginMode
        }
        let method = 'privatePostMarginBorrow';
        const timeInForce = this.safeStringN (params, [ 'timeInForce', 'type', 'borrowStrategy' ], 'IOC');
        let timeInForceRequest = 'type';
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' borrowMargin() requires a symbol argument for isolated margin');
            }
            const market = this.market (symbol);
            request['symbol'] = market['id'];
            timeInForceRequest = 'borrowStrategy';
            method = 'privatePostIsolatedBorrow';
        }
        request[timeInForceRequest] = timeInForce;
        params = this.omit (params, [ 'timeInForce', 'type', 'borrowStrategy' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // Cross
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "orderId": "62df422ccde938000115290a",
        //             "currency": "USDT"
        //         }
        //     }
        //
        // Isolated
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "orderId": "62df44a1c65f300001bc32a8",
        //             "currency": "USDT",
        //             "actualSize": "100"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transaction = this.parseMarginLoan (data, currency);
        if (marginMode === 'cross') {
            return this.extend (transaction, { 'amount': amount });
        } else {
            return this.extend (transaction, { 'symbol': symbol });
        }
    }

    async repayMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kucoin#repayMargin
         * @description repay borrowed margin and interest
         * @see https://docs.kucoin.com/#one-click-repayment
         * @see https://docs.kucoin.com/#quick-repayment
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the kucoin api endpoints
         * @param {string|undefined} params.sequence cross margin repay sequence, either 'RECENTLY_EXPIRE_FIRST' or 'HIGHEST_RATE_FIRST' default is 'RECENTLY_EXPIRE_FIRST'
         * @param {string|undefined} params.seqStrategy isolated margin repay sequence, either 'RECENTLY_EXPIRE_FIRST' or 'HIGHEST_RATE_FIRST' default is 'RECENTLY_EXPIRE_FIRST'
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' default is 'cross'
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'size': this.currencyToPrecision (code, amount),
            // 'sequence': 'RECENTLY_EXPIRE_FIRST',  // Cross: 'RECENTLY_EXPIRE_FIRST' or 'HIGHEST_RATE_FIRST'
            // 'seqStrategy': 'RECENTLY_EXPIRE_FIRST',  // Isolated: 'RECENTLY_EXPIRE_FIRST' or 'HIGHEST_RATE_FIRST'
        };
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('repayMargin', params);
        if (marginMode === undefined) {
            marginMode = 'cross'; // cross as default marginMode
        }
        let method = 'privatePostMarginRepayAll';
        const sequence = this.safeString2 (params, 'sequence', 'seqStrategy', 'RECENTLY_EXPIRE_FIRST');
        let sequenceRequest = 'sequence';
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' repayMargin() requires a symbol argument for isolated margin');
            }
            const market = this.market (symbol);
            request['symbol'] = market['id'];
            sequenceRequest = 'seqStrategy';
            method = 'privatePostIsolatedRepayAll';
        }
        request[sequenceRequest] = sequence;
        params = this.omit (params, [ 'sequence', 'seqStrategy' ]);
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": null
        //     }
        //
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    parseMarginLoan (info, currency = undefined) {
        //
        // borrowMargin cross
        //
        //     {
        //         "orderId": "62df422ccde938000115290a",
        //         "currency": "USDT"
        //     }
        //
        // borrowMargin isolated
        //
        //     {
        //         "orderId": "62df44a1c65f300001bc32a8",
        //         "currency": "USDT",
        //         "actualSize": "100"
        //     }
        //
        // repayMargin
        //
        //     {
        //         "code": "200000",
        //         "data": null
        //     }
        //
        const timestamp = this.milliseconds ();
        const currencyId = this.safeString (info, 'currency');
        return {
            'id': this.safeString (info, 'orderId'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (info, 'actualSize'),
            'symbol': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        //
        // the v2 URL is https://openapi-v2.kucoin.com/api/v1/endpoint
        //                                ↑                 ↑
        //                                ↑                 ↑
        //
        const versions = this.safeValue (this.options, 'versions', {});
        const apiVersions = this.safeValue (versions, api, {});
        const methodVersions = this.safeValue (apiVersions, method, {});
        const defaultVersion = this.safeString (methodVersions, path, this.options['version']);
        const version = this.safeString (params, 'version', defaultVersion);
        params = this.omit (params, 'version');
        let endpoint = '/api/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let endpart = '';
        headers = (headers !== undefined) ? headers : {};
        if (Object.keys (query).length) {
            if ((method === 'GET') || (method === 'DELETE')) {
                endpoint += '?' + this.rawencode (query);
            } else {
                body = this.json (query);
                endpart = body;
                headers['Content-Type'] = 'application/json';
            }
        }
        const url = this.urls['api'][api] + endpoint;
        const isFuturePrivate = (api === 'futuresPrivate');
        const isPrivate = (api === 'private');
        if (isPrivate || isFuturePrivate) {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            headers = this.extend ({
                'KC-API-KEY-VERSION': '2',
                'KC-API-KEY': this.apiKey,
                'KC-API-TIMESTAMP': timestamp,
            }, headers);
            const apiKeyVersion = this.safeString (headers, 'KC-API-KEY-VERSION');
            if (apiKeyVersion === '2') {
                const passphrase = this.hmac (this.encode (this.password), this.encode (this.secret), 'sha256', 'base64');
                headers['KC-API-PASSPHRASE'] = passphrase;
            } else {
                headers['KC-API-PASSPHRASE'] = this.password;
            }
            const payload = timestamp + method + endpoint + endpart;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            headers['KC-API-SIGN'] = signature;
            let partner = this.safeValue (this.options, 'partner', {});
            partner = isFuturePrivate ? this.safeValue (partner, 'future', partner) : this.safeValue (partner, 'spot', partner);
            const partnerId = this.safeString (partner, 'id');
            const partnerSecret = this.safeString2 (partner, 'secret', 'key');
            if ((partnerId !== undefined) && (partnerSecret !== undefined)) {
                const partnerPayload = timestamp + partnerId + this.apiKey;
                const partnerSignature = this.hmac (this.encode (partnerPayload), this.encode (partnerSecret), 'sha256', 'base64');
                headers['KC-API-PARTNER-SIGN'] = partnerSignature;
                headers['KC-API-PARTNER'] = partnerId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, body);
            return;
        }
        //
        // bad
        //     { "code": "400100", "msg": "validation.createOrder.clientOidIsRequired" }
        // good
        //     { code: '200000', data: { ... }}
        //
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg', '');
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
    }
};
