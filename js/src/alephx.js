// ----------------------------------------------------------------------------
import Exchange from './abstract/alephx.js';
import { ExchangeError, BadRequest, OrderNotFound } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// ----------------------------------------------------------------------------
/**
 * @class alephx
 * @augments Exchange
 */
export default class alephx extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'alephx',
            'name': 'AlephX',
            'countries': ['CA'],
            'pro': true,
            'certified': false,
            // rate-limits: N/A
            'rateLimit': 1000,
            'version': 'v1',
            'userAgent': this.userAgents['chrome'],
            // 'headers': {
            //     'ZKX-VERSION': '2018-05-30',
            // },
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createConvertTrade': true,
                'createDepositAddress': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'deposit': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': 'emulated',
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL2OrderBook': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyBuys': true,
                'fetchMySells': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': 'emulated',
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'urls': {
                // 'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'api': {
                    'rest': 'https://api.alephx.xyz',
                },
                'www': 'https://demo.alephx.xyz',
                // 'doc': [
                //     'https://developers.alephx.com/api/v2',
                //     'https://docs.cloud.alephx.com/advanced-trade/docs/welcome',
                // ],
                // 'fees': [
                //     'https://support.alephx.com/customer/portal/articles/2109597-buy-sell-bank-transfer-fees',
                //     'https://www.alephx.com/advanced-fees',
                // ],
                // 'referral': 'https://www.alephx.com/join/58cbe25a355148797479dbd2',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'v1': {
                    // 'public': {
                    // },
                    'private': {
                        'get': {
                            'orders': 0,
                            'orders/{id}': 0,
                            'trades': 0,
                        },
                        'post': {
                            'orders': 0,
                        },
                        'patch': {
                            'orders/{id}/cancel': 0,
                        },
                    },
                },
            },
            // 'fees': {
            // },
            // 'precisionMode': TICK_SIZE,
            // 'exceptions': {
            //     'exact': {
            //         'two_factor_required': AuthenticationError, // 402 When sending money over 2fa limit
            //         'param_required': ExchangeError, // 400 Missing parameter
            //         'validation_error': ExchangeError, // 400 Unable to validate POST/PUT
            //         'invalid_request': ExchangeError, // 400 Invalid request
            //         'personal_details_required': AuthenticationError, // 400 User’s personal detail required to complete this request
            //         'identity_verification_required': AuthenticationError, // 400 Identity verification is required to complete this request
            //         'jumio_verification_required': AuthenticationError, // 400 Document verification is required to complete this request
            //         'jumio_face_match_verification_required': AuthenticationError, // 400 Document verification including face match is required to complete this request
            //         'unverified_email': AuthenticationError, // 400 User has not verified their email
            //         'authentication_error': AuthenticationError, // 401 Invalid auth (generic)
            //         'invalid_authentication_method': AuthenticationError, // 401 API access is blocked for deleted users.
            //         'invalid_token': AuthenticationError, // 401 Invalid Oauth token
            //         'revoked_token': AuthenticationError, // 401 Revoked Oauth token
            //         'expired_token': AuthenticationError, // 401 Expired Oauth token
            //         'invalid_scope': AuthenticationError, // 403 User hasn’t authenticated necessary scope
            //         'not_found': ExchangeError, // 404 Resource not found
            //         'rate_limit_exceeded': RateLimitExceeded, // 429 Rate limit exceeded
            //         'internal_server_error': ExchangeError, // 500 Internal server error
            //         'UNSUPPORTED_ORDER_CONFIGURATION': BadRequest,
            //         'INSUFFICIENT_FUND': BadRequest,
            //         'PERMISSION_DENIED': PermissionDenied,
            //         'INVALID_ARGUMENT': BadRequest,
            //     },
            //     'broad': {
            //         'request timestamp expired': InvalidNonce, // {"errors":[{"id":"authentication_error","message":"request timestamp expired"}]}
            //         'order with this orderID was not found': OrderNotFound, // {"error":"unknown","error_details":"order with this orderID was not found","message":"order with this orderID was not found"}
            //     },
            // },
            // 'timeframes': {
            //     '1m': 'ONE_MINUTE',
            //     '5m': 'FIVE_MINUTE',
            //     '15m': 'FIFTEEN_MINUTE',
            //     '30m': 'THIRTY_MINUTE',
            //     '1h': 'ONE_HOUR',
            //     '2h': 'TWO_HOUR',
            //     '6h': 'SIX_HOUR',
            //     '1d': 'ONE_DAY',
            // },
            // 'commonCurrencies': {
            //     'CGLD': 'CELO',
            // },
            // 'options': {
            //     'usePrivate': false,
            //     'brokerId': 'ccxt',
            //     'stablePairs': [ 'BUSD-USD', 'CBETH-ETH', 'DAI-USD', 'GUSD-USD', 'GYEN-USD', 'PAX-USD', 'PAX-USDT', 'USDC-EUR', 'USDC-GBP', 'USDT-EUR', 'USDT-GBP', 'USDT-USD', 'USDT-USDC', 'WBTC-BTC' ],
            //     'fetchCurrencies': {
            //         'expires': 5000,
            //     },
            //     'accounts': [
            //         'wallet',
            //         'fiat',
            //         // 'vault',
            //     ],
            //     'v3Accounts': [
            //         'ACCOUNT_TYPE_CRYPTO',
            //         'ACCOUNT_TYPE_FIAT',
            //     ],
            //     'networks': {
            //         'ERC20': 'ethereum',
            //         'XLM': 'stellar',
            //     },
            //     'createMarketBuyOrderRequiresPrice': true,
            //     'advanced': true, // set to true if using any v3 endpoints from the advanced trade API
            //     'fetchMarkets': 'fetchMarketsV3', // 'fetchMarketsV3' or 'fetchMarketsV2'
            //     'fetchTicker': 'fetchTickerV3', // 'fetchTickerV3' or 'fetchTickerV2'
            //     'fetchTickers': 'fetchTickersV3', // 'fetchTickersV3' or 'fetchTickersV2'
            //     'fetchAccounts': 'fetchAccountsV3', // 'fetchAccountsV3' or 'fetchAccountsV2'
            //     'fetchBalance': 'v2PrivateGetAccounts', // 'v2PrivateGetAccounts' or 'v3PrivateGetBrokerageAccounts'
            //     'fetchTime': 'v2PublicGetTime', // 'v2PublicGetTime' or 'v3PublicGetBrokerageTime'
            //     'user_native_currency': 'USD', // needed to get fees for v3
            // },
        });
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name alephx#createOrder
         * @description create an order
         * @see POST https://api.alephx.xyz/api/v1/orders
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.timeInForce] 'gtc'
         * @param {string} [params.idempotencyKey] uuid for idempotency key
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'pair': symbol,
            'type': side,
            'ordertype': type,
            'volume': amount,
        };
        const orderRequest = this.orderRequest('createOrder', symbol, type, request, amount, price, params);
        const response = await this.v1PrivatePostOrders(this.extend(orderRequest[0], orderRequest[1]));
        //
        // successful order
        //
        //
        // failed order
        //
        //
        const errorResponse = this.safeDict(response, 'error');
        if (errorResponse !== undefined) {
            const errorReason = this.safeString(errorResponse, 'reason');
            const errorMessage = this.safeString(errorResponse, 'message');
            throw new ExchangeError(errorReason + '' + errorMessage);
        }
        return this.parseOrder(response);
    }
    orderRequest(method, symbol, type, request, amount, price = undefined, params = {}) {
        const clientOrderId = this.safeString2(params, 'idempotencyKey', 'idempotencykey');
        if (clientOrderId !== undefined) {
            request['idempotencyKey'] = clientOrderId;
        }
        const isLimitOrder = type === 'limit';
        if (isLimitOrder) {
            request['price'] = price;
        }
        const timeInForce = this.safeString2(params, 'timeInForce', 'gtc');
        if (timeInForce !== undefined) {
            request['timeinforce'] = timeInForce;
        }
        params = this.omit(params, ['timeInForce', 'idempotencyKey']);
        return [request, params];
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "order_id": "52cfe5e2-0b29-4c19-a245-a6a773de5030",
        //         "status": "pending_new"
        //     }
        //
        // cancelOrder
        //
        //     {
        //     }
        //
        // fetchOrder, fetchOrders
        //
        //     {
        //     }
        //
        const createdDateTime = this.safeString(order, 'inserted_at');
        const filledDateTime = this.safeString(order, 'filled_at');
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'order_id') || this.safeString(order, 'id'),
            'clientOrderId': this.safeString(order, 'idempotency_key'),
            'timestamp': createdDateTime ? this.parse8601(createdDateTime) : undefined,
            'datetime': createdDateTime,
            'lastTradeTimestamp': filledDateTime ? this.parse8601(filledDateTime) : undefined,
            'symbol': this.safeString(order, 'symbol'),
            'type': this.safeString(order, 'type'),
            'timeInForce': this.safeString(order, 'time_in_force'),
            'postOnly': true,
            'side': this.safeStringLower(order, 'side'),
            'price': this.safeString(order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString(order, 'base_quantity'),
            'filled': this.safeString(order, 'filled_quantity'),
            'remaining': this.safeString(order, 'remained_quantity'),
            'cost': undefined,
            'average': this.safeString(order, 'average_filled_price'),
            'status': this.safeString(order, 'status'),
            'fee': {
                'cost': this.safeString(order, 'cumulative_fee'),
                'currency': this.safeString(order, 'fee_asset'),
            },
            'trades': undefined,
        }, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name alephx#cancelOrder
         * @description cancels an open order
         * @see PATCH https://api.alephx.xyz/api/v1/orders/{order_id}/cancel
         * @param {string} id order id
         * @param {string} symbol not used by alephx cancelOrder()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'id': id, // order id
        };
        const response = await this.v1PrivatePatchOrdersIdCancel(this.extend(request, params));
        const errorResponse = this.safeDict(response, 'error');
        if (errorResponse !== undefined) {
            const errorReason = this.safeString(errorResponse, 'reason');
            const errorMessage = this.safeString(errorResponse, 'message');
            if (errorReason === 'Not Found') {
                throw new OrderNotFound(this.id + ' cancelOrder() error ' + errorReason);
            }
            else if (errorReason === 'Bad Request') {
                throw new BadRequest(this.id + ' cancelOrder() error ' + errorReason + ' ' + errorMessage);
            }
            else {
                throw new ExchangeError(errorReason + '' + errorMessage);
            }
        }
        return this.parseOrder(response);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name alephx#fetchOrder
         * @description fetches information on an order made by the user
         * @see GET https://api.alephx.xyz/api/v1/orders/{order_id}
         * @param {string} id the order id
         * @param {string} symbol unified market symbol that the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'id': id, // order id
        };
        const response = await this.v1PrivateGetOrdersId(this.extend(request, params));
        const errorResponse = this.safeDict(response, 'error');
        if (errorResponse !== undefined) {
            const errorReason = this.safeString(errorResponse, 'reason');
            if (errorReason === 'Not Found') {
                throw new OrderNotFound(this.id + ' fetchOrder() error ' + errorReason);
            }
        }
        return this.parseOrder(response);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = 100, params = {}) {
        /**
         * @method
         * @name alephx#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see GET https://api.alephx.xyz/api/v1/orders/
         * @param {string} symbol unified market symbol that the orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {};
        const response = await this.v1PrivateGetOrders(this.extend(request, params));
        //
        //
        const market = undefined;
        return this.parseOrders(response, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name alephx#fetchMyTrades
         * @description fetch all trades made by the user
         * @see GET https://api.alephx.xyz/api/v1/trades
         * @param {string} symbol unified market symbol of the trades
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] the maximum number of trade structures to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const request = {};
        const response = await this.v1PrivateGetTrades(this.extend(request, params));
        //
        //
        const market = undefined;
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        // fetchTrades
        //
        //     {
        //     }
        //
        const createdDateTime = this.safeString(trade, 'inserted_at');
        const traderSide = this.safeString(trade, 'side');
        const traderOrderId = traderSide === 'buy' ? this.safeString(trade, 'buy_order_id') : this.safeString(trade, 'sell_order_id');
        return this.safeTrade({
            'id': this.safeString(trade, 'id'),
            'order': traderOrderId,
            'info': trade,
            'timestamp': this.parse8601(createdDateTime),
            'datetime': createdDateTime,
            'symbol': this.safeString(trade, 'symbol'),
            'type': undefined,
            'side': traderSide,
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'base_quantity'),
            'cost': this.safeString(trade, 'quote_quantity'),
            'fee': {
                'cost': this.safeString(trade, 'fee'),
                'currency': this.safeString(trade, 'fee_asset'),
            },
        }, market);
    }
    sign(path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        const signed = api[1] === 'private';
        let fullPath = '/api/' + version + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        const savedPath = fullPath;
        if (method === 'GET') {
            if (Object.keys(query).length) {
                fullPath += '?' + this.urlencodeWithArrayRepeat(query);
            }
        }
        const url = this.urls['api']['rest'] + fullPath;
        if (signed) {
            const authorization = this.safeString(this.headers, 'Authorization');
            let authorizationString = undefined;
            if (authorization !== undefined) {
                authorizationString = authorization;
            }
            else if (this.token && !this.checkRequiredCredentials(false)) {
                authorizationString = 'Bearer ' + this.token;
            }
            else {
                this.checkRequiredCredentials();
                // doesn't need payload in the signature. inside url is enough
                const timestampString = this.seconds().toString();
                const auth = timestampString + method + savedPath;
                const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256);
                headers = {
                    'ZKX-ACCESS-KEY': this.apiKey,
                    'ZKX-ACCESS-SIGN': signature,
                    'ZKX-ACCESS-TIMESTAMP': timestampString,
                    'Content-Type': 'application/json',
                };
            }
            if (authorizationString !== undefined) {
                headers = {
                    'Authorization': authorizationString,
                    'Content-Type': 'application/json',
                };
                if (method !== 'GET') {
                    if (Object.keys(query).length) {
                        body = this.json(query);
                    }
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const feedback = this.id + ' ' + body;
        //
        //
        //    {
        //      "error": {
        //        {
        //          "reason": "Bad Request",
        //          "message": "Order is not cancellable"
        //        }
        //      }
        //    }
        //
        const errorResponse = this.safeDict(response, 'error');
        const errorCode = this.safeString(errorResponse, 'reason');
        if (errorCode !== undefined) {
            const errorMessage = this.safeString(errorResponse, 'message');
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError(feedback);
        }
        // const errors = this.safeList(response, 'errors');
        // if (errors !== undefined) {
        //     if (Array.isArray(errors)) {
        //         const numErrors = errors.length;
        //         if (numErrors > 0) {
        //             errorCode = this.safeString (errors[0], 'id');
        //             const errorMessage = this.safeString (errors[0], 'message');
        //             if (errorCode !== undefined) {
        //                 this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
        //                 this.throwBroadlyMatchedException(this.exceptions['broad'], errorMessage, feedback);
        //                 throw new ExchangeError(feedback);
        //             }
        //         }
        //     }
        // }
        return undefined;
    }
}
