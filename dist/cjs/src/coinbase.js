'use strict';

var coinbase$1 = require('./abstract/coinbase.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var rsa = require('./base/functions/rsa.js');

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
/**
 * @class coinbase
 * @augments Exchange
 */
class coinbase extends coinbase$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinbase',
            'name': 'Coinbase Advanced',
            'countries': ['US'],
            'pro': true,
            'certified': false,
            // rate-limits:
            // ADVANCED API: https://docs.cloud.coinbase.com/advanced-trade/docs/rest-api-rate-limits
            // - max 30 req/second for private data, 10 req/s for public data
            // DATA API    : https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/rate-limiting
            // - max 10000 req/hour (to prevent userland mistakes we apply ~3 req/second RL per call
            'rateLimit': 34,
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'headers': {
                'CB-VERSION': '2018-05-30',
            },
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
                'fetchDepositMethodId': true,
                'fetchDepositMethodIds': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'api': {
                    'rest': 'https://api.coinbase.com',
                },
                'www': 'https://www.coinbase.com',
                'doc': [
                    'https://developers.coinbase.com/api/v2',
                    'https://docs.cloud.coinbase.com/advanced-trade/docs/welcome',
                ],
                'fees': [
                    'https://support.coinbase.com/customer/portal/articles/2109597-buy-sell-bank-transfer-fees',
                    'https://www.coinbase.com/advanced-fees',
                ],
                'referral': 'https://www.coinbase.com/join/58cbe25a355148797479dbd2',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'v2': {
                    'public': {
                        'get': {
                            'currencies': 10.6,
                            'currencies/crypto': 10.6,
                            'time': 10.6,
                            'exchange-rates': 10.6,
                            'users/{user_id}': 10.6,
                            'prices/{symbol}/buy': 10.6,
                            'prices/{symbol}/sell': 10.6,
                            'prices/{symbol}/spot': 10.6,
                        },
                    },
                    'private': {
                        'get': {
                            'accounts': 10.6,
                            'accounts/{account_id}': 10.6,
                            'accounts/{account_id}/addresses': 10.6,
                            'accounts/{account_id}/addresses/{address_id}': 10.6,
                            'accounts/{account_id}/addresses/{address_id}/transactions': 10.6,
                            'accounts/{account_id}/transactions': 10.6,
                            'accounts/{account_id}/transactions/{transaction_id}': 10.6,
                            'accounts/{account_id}/buys': 10.6,
                            'accounts/{account_id}/buys/{buy_id}': 10.6,
                            'accounts/{account_id}/sells': 10.6,
                            'accounts/{account_id}/sells/{sell_id}': 10.6,
                            'accounts/{account_id}/deposits': 10.6,
                            'accounts/{account_id}/deposits/{deposit_id}': 10.6,
                            'accounts/{account_id}/withdrawals': 10.6,
                            'accounts/{account_id}/withdrawals/{withdrawal_id}': 10.6,
                            'payment-methods': 10.6,
                            'payment-methods/{payment_method_id}': 10.6,
                            'user': 10.6,
                            'user/auth': 10.6,
                        },
                        'post': {
                            'accounts': 10.6,
                            'accounts/{account_id}/primary': 10.6,
                            'accounts/{account_id}/addresses': 10.6,
                            'accounts/{account_id}/transactions': 10.6,
                            'accounts/{account_id}/transactions/{transaction_id}/complete': 10.6,
                            'accounts/{account_id}/transactions/{transaction_id}/resend': 10.6,
                            'accounts/{account_id}/buys': 10.6,
                            'accounts/{account_id}/buys/{buy_id}/commit': 10.6,
                            'accounts/{account_id}/sells': 10.6,
                            'accounts/{account_id}/sells/{sell_id}/commit': 10.6,
                            'accounts/{account_id}/deposits': 10.6,
                            'accounts/{account_id}/deposits/{deposit_id}/commit': 10.6,
                            'accounts/{account_id}/withdrawals': 10.6,
                            'accounts/{account_id}/withdrawals/{withdrawal_id}/commit': 10.6,
                        },
                        'put': {
                            'accounts/{account_id}': 10.6,
                            'user': 10.6,
                        },
                        'delete': {
                            'accounts/{id}': 10.6,
                            'accounts/{account_id}/transactions/{transaction_id}': 10.6,
                        },
                    },
                },
                'v3': {
                    'public': {
                        'get': {
                            'brokerage/time': 3,
                            'brokerage/market/product_book': 3,
                            'brokerage/market/products': 3,
                            'brokerage/market/products/{product_id}': 3,
                            'brokerage/market/products/{product_id}/candles': 3,
                            'brokerage/market/products/{product_id}/ticker': 3,
                        },
                    },
                    'private': {
                        'get': {
                            'brokerage/accounts': 1,
                            'brokerage/accounts/{account_uuid}': 1,
                            'brokerage/orders/historical/batch': 1,
                            'brokerage/orders/historical/fills': 1,
                            'brokerage/orders/historical/{order_id}': 1,
                            'brokerage/products': 3,
                            'brokerage/products/{product_id}': 3,
                            'brokerage/products/{product_id}/candles': 3,
                            'brokerage/products/{product_id}/ticker': 3,
                            'brokerage/best_bid_ask': 3,
                            'brokerage/product_book': 3,
                            'brokerage/transaction_summary': 3,
                            'brokerage/portfolios': 1,
                            'brokerage/portfolios/{portfolio_uuid}': 1,
                            'brokerage/convert/trade/{trade_id}': 1,
                            'brokerage/cfm/balance_summary': 1,
                            'brokerage/cfm/positions': 1,
                            'brokerage/cfm/positions/{product_id}': 1,
                            'brokerage/cfm/sweeps': 1,
                            'brokerage/intx/portfolio/{portfolio_uuid}': 1,
                            'brokerage/intx/positions/{portfolio_uuid}': 1,
                            'brokerage/intx/positions/{portfolio_uuid}/{symbol}': 1,
                            'brokerage/payment_methods': 1,
                            'brokerage/payment_methods/{payment_method_id}': 1,
                        },
                        'post': {
                            'brokerage/orders': 1,
                            'brokerage/orders/batch_cancel': 1,
                            'brokerage/orders/edit': 1,
                            'brokerage/orders/edit_preview': 1,
                            'brokerage/orders/preview': 1,
                            'brokerage/portfolios': 1,
                            'brokerage/portfolios/move_funds': 1,
                            'brokerage/convert/quote': 1,
                            'brokerage/convert/trade/{trade_id}': 1,
                            'brokerage/cfm/sweeps/schedule': 1,
                            'brokerage/intx/allocate': 1,
                            // futures
                            'brokerage/orders/close_position': 1,
                        },
                        'put': {
                            'brokerage/portfolios/{portfolio_uuid}': 1,
                        },
                        'delete': {
                            'brokerage/portfolios/{portfolio_uuid}': 1,
                            'brokerage/cfm/sweeps': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber('0.012'),
                    'maker': this.parseNumber('0.006'),
                    'tierBased': true,
                    'percentage': true,
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.006')],
                            [this.parseNumber('10000'), this.parseNumber('0.004')],
                            [this.parseNumber('50000'), this.parseNumber('0.0025')],
                            [this.parseNumber('100000'), this.parseNumber('0.002')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0018')],
                            [this.parseNumber('15000000'), this.parseNumber('0.0016')],
                            [this.parseNumber('75000000'), this.parseNumber('0.0012')],
                            [this.parseNumber('250000000'), this.parseNumber('0.0008')],
                            [this.parseNumber('400000000'), this.parseNumber('0.0005')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.004')],
                            [this.parseNumber('10000'), this.parseNumber('0.0025')],
                            [this.parseNumber('50000'), this.parseNumber('0.0015')],
                            [this.parseNumber('100000'), this.parseNumber('0.001')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0008')],
                            [this.parseNumber('15000000'), this.parseNumber('0.0006')],
                            [this.parseNumber('75000000'), this.parseNumber('0.0003')],
                            [this.parseNumber('250000000'), this.parseNumber('0.0')],
                            [this.parseNumber('400000000'), this.parseNumber('0.0')],
                        ],
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    'two_factor_required': errors.AuthenticationError,
                    'param_required': errors.ExchangeError,
                    'validation_error': errors.ExchangeError,
                    'invalid_request': errors.ExchangeError,
                    'personal_details_required': errors.AuthenticationError,
                    'identity_verification_required': errors.AuthenticationError,
                    'jumio_verification_required': errors.AuthenticationError,
                    'jumio_face_match_verification_required': errors.AuthenticationError,
                    'unverified_email': errors.AuthenticationError,
                    'authentication_error': errors.AuthenticationError,
                    'invalid_authentication_method': errors.AuthenticationError,
                    'invalid_token': errors.AuthenticationError,
                    'revoked_token': errors.AuthenticationError,
                    'expired_token': errors.AuthenticationError,
                    'invalid_scope': errors.AuthenticationError,
                    'not_found': errors.ExchangeError,
                    'rate_limit_exceeded': errors.RateLimitExceeded,
                    'internal_server_error': errors.ExchangeError,
                    'UNSUPPORTED_ORDER_CONFIGURATION': errors.BadRequest,
                    'INSUFFICIENT_FUND': errors.BadRequest,
                    'PERMISSION_DENIED': errors.PermissionDenied,
                    'INVALID_ARGUMENT': errors.BadRequest,
                },
                'broad': {
                    'request timestamp expired': errors.InvalidNonce,
                    'order with this orderID was not found': errors.OrderNotFound, // {"error":"unknown","error_details":"order with this orderID was not found","message":"order with this orderID was not found"}
                },
            },
            'timeframes': {
                '1m': 'ONE_MINUTE',
                '5m': 'FIVE_MINUTE',
                '15m': 'FIFTEEN_MINUTE',
                '30m': 'THIRTY_MINUTE',
                '1h': 'ONE_HOUR',
                '2h': 'TWO_HOUR',
                '6h': 'SIX_HOUR',
                '1d': 'ONE_DAY',
            },
            'commonCurrencies': {
                'CGLD': 'CELO',
            },
            'options': {
                'usePrivate': false,
                'brokerId': 'ccxt',
                'stablePairs': ['BUSD-USD', 'CBETH-ETH', 'DAI-USD', 'GUSD-USD', 'GYEN-USD', 'PAX-USD', 'PAX-USDT', 'USDC-EUR', 'USDC-GBP', 'USDT-EUR', 'USDT-GBP', 'USDT-USD', 'USDT-USDC', 'WBTC-BTC'],
                'fetchCurrencies': {
                    'expires': 5000,
                },
                'accounts': [
                    'wallet',
                    'fiat',
                    // 'vault',
                ],
                'v3Accounts': [
                    'ACCOUNT_TYPE_CRYPTO',
                    'ACCOUNT_TYPE_FIAT',
                ],
                'networks': {
                    'ERC20': 'ethereum',
                    'XLM': 'stellar',
                },
                'createMarketBuyOrderRequiresPrice': true,
                'advanced': true,
                'fetchMarkets': 'fetchMarketsV3',
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'fetchTicker': 'fetchTickerV3',
                'fetchTickers': 'fetchTickersV3',
                'fetchAccounts': 'fetchAccountsV3',
                'fetchBalance': 'v2PrivateGetAccounts',
                'fetchTime': 'v2PublicGetTime',
                'user_native_currency': 'USD', // needed to get fees for v3
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': true,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 3000,
                        'daysBack': undefined,
                        'untilDays': 10000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': 10000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 10000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
        });
    }
    /**
     * @method
     * @name coinbase#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-time#http-request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'v2PublicGetTime' or 'v3PublicGetBrokerageTime' default is 'v2PublicGetTime'
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const defaultMethod = this.safeString(this.options, 'fetchTime', 'v2PublicGetTime');
        const method = this.safeString(params, 'method', defaultMethod);
        params = this.omit(params, 'method');
        let response = undefined;
        if (method === 'v2PublicGetTime') {
            response = await this.v2PublicGetTime(params);
            //
            //     {
            //         "data": {
            //             "epoch": 1589295679,
            //             "iso": "2020-05-12T15:01:19Z"
            //         }
            //     }
            //
            response = this.safeDict(response, 'data', {});
        }
        else {
            response = await this.v3PublicGetBrokerageTime(params);
            //
            //     {
            //         "iso": "2024-02-27T03:37:14Z",
            //         "epochSeconds": "1709005034",
            //         "epochMillis": "1709005034333"
            //     }
            //
        }
        return this.safeTimestamp2(response, 'epoch', 'epochSeconds');
    }
    /**
     * @method
     * @name coinbase#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getaccounts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-accounts#list-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        const method = this.safeString(this.options, 'fetchAccounts', 'fetchAccountsV3');
        if (method === 'fetchAccountsV3') {
            return await this.fetchAccountsV3(params);
        }
        return await this.fetchAccountsV2(params);
    }
    async fetchAccountsV2(params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchAccounts', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchAccounts', undefined, undefined, undefined, params, 'next_starting_after', 'starting_after', undefined, 100);
        }
        const request = {
            'limit': 100,
        };
        const response = await this.v2PrivateGetAccounts(this.extend(request, params));
        //
        //     {
        //         "pagination": {
        //             "ending_before": null,
        //             "starting_after": null,
        //             "previous_ending_before": null,
        //             "next_starting_after": null,
        //             "limit": 244,
        //             "order": "desc",
        //             "previous_uri": null,
        //             "next_uri": null
        //         },
        //         "data": [
        //             {
        //                 "id": "XLM",
        //                 "name": "XLM Wallet",
        //                 "primary": false,
        //                 "type": "wallet",
        //                 "currency": {
        //                     "code": "XLM",
        //                     "name": "Stellar Lumens",
        //                     "color": "#000000",
        //                     "sort_index": 127,
        //                     "exponent": 7,
        //                     "type": "crypto",
        //                     "address_regex": "^G[A-Z2-7]{55}$",
        //                     "asset_id": "13b83335-5ede-595b-821e-5bcdfa80560f",
        //                     "destination_tag_name": "XLM Memo ID",
        //                     "destination_tag_regex": "^[ -~]{1,28}$"
        //                 },
        //                 "balance": {
        //                     "amount": "0.0000000",
        //                     "currency": "XLM"
        //                 },
        //                 "created_at": null,
        //                 "updated_at": null,
        //                 "resource": "account",
        //                 "resource_path": "/v2/accounts/XLM",
        //                 "allow_deposits": true,
        //                 "allow_withdrawals": true
        //             },
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'next_starting_after');
        const accounts = this.safeList(response, 'data', []);
        const length = accounts.length;
        const lastIndex = length - 1;
        const last = this.safeDict(accounts, lastIndex);
        if ((cursor !== undefined) && (cursor !== '')) {
            last['next_starting_after'] = cursor;
            accounts[lastIndex] = last;
        }
        return this.parseAccounts(data, params);
    }
    async fetchAccountsV3(params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchAccounts', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchAccounts', undefined, undefined, undefined, params, 'cursor', 'cursor', undefined, 250);
        }
        const request = {
            'limit': 250,
        };
        const response = await this.v3PrivateGetBrokerageAccounts(this.extend(request, params));
        //
        //     {
        //         "accounts": [
        //             {
        //                 "uuid": "11111111-1111-1111-1111-111111111111",
        //                 "name": "USDC Wallet",
        //                 "currency": "USDC",
        //                 "available_balance": {
        //                     "value": "0.0000000000000000",
        //                     "currency": "USDC"
        //                 },
        //                 "default": true,
        //                 "active": true,
        //                 "created_at": "2023-01-04T06:20:06.456Z",
        //                 "updated_at": "2023-01-04T06:20:07.181Z",
        //                 "deleted_at": null,
        //                 "type": "ACCOUNT_TYPE_CRYPTO",
        //                 "ready": false,
        //                 "hold": {
        //                     "value": "0.0000000000000000",
        //                     "currency": "USDC"
        //                 }
        //             },
        //             ...
        //         ],
        //         "has_next": false,
        //         "cursor": "",
        //         "size": 9
        //     }
        //
        const accounts = this.safeList(response, 'accounts', []);
        const length = accounts.length;
        const lastIndex = length - 1;
        const last = this.safeDict(accounts, lastIndex);
        const cursor = this.safeString(response, 'cursor');
        if ((cursor !== undefined) && (cursor !== '')) {
            last['cursor'] = cursor;
            accounts[lastIndex] = last;
        }
        return this.parseAccounts(accounts, params);
    }
    /**
     * @method
     * @name coinbase#fetchPortfolios
     * @description fetch all the portfolios
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfolios
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchPortfolios(params = {}) {
        const response = await this.v3PrivateGetBrokeragePortfolios(params);
        const portfolios = this.safeList(response, 'portfolios', []);
        const result = [];
        for (let i = 0; i < portfolios.length; i++) {
            const portfolio = portfolios[i];
            result.push({
                'id': this.safeString(portfolio, 'uuid'),
                'type': this.safeString(portfolio, 'type'),
                'code': undefined,
                'info': portfolio,
            });
        }
        return result;
    }
    parseAccount(account) {
        //
        // fetchAccountsV2
        //
        //     {
        //         "id": "XLM",
        //         "name": "XLM Wallet",
        //         "primary": false,
        //         "type": "wallet",
        //         "currency": {
        //             "code": "XLM",
        //             "name": "Stellar Lumens",
        //             "color": "#000000",
        //             "sort_index": 127,
        //             "exponent": 7,
        //             "type": "crypto",
        //             "address_regex": "^G[A-Z2-7]{55}$",
        //             "asset_id": "13b83335-5ede-595b-821e-5bcdfa80560f",
        //             "destination_tag_name": "XLM Memo ID",
        //             "destination_tag_regex": "^[ -~]{1,28}$"
        //         },
        //         "balance": {
        //             "amount": "0.0000000",
        //             "currency": "XLM"
        //         },
        //         "created_at": null,
        //         "updated_at": null,
        //         "resource": "account",
        //         "resource_path": "/v2/accounts/XLM",
        //         "allow_deposits": true,
        //         "allow_withdrawals": true
        //     }
        //
        // fetchAccountsV3
        //
        //     {
        //         "uuid": "11111111-1111-1111-1111-111111111111",
        //         "name": "USDC Wallet",
        //         "currency": "USDC",
        //         "available_balance": {
        //             "value": "0.0000000000000000",
        //             "currency": "USDC"
        //         },
        //         "default": true,
        //         "active": true,
        //         "created_at": "2023-01-04T06:20:06.456Z",
        //         "updated_at": "2023-01-04T06:20:07.181Z",
        //         "deleted_at": null,
        //         "type": "ACCOUNT_TYPE_CRYPTO",
        //         "ready": false,
        //         "hold": {
        //             "value": "0.0000000000000000",
        //             "currency": "USDC"
        //         }
        //     }
        //
        const active = this.safeBool(account, 'active');
        const currencyIdV3 = this.safeString(account, 'currency');
        const currency = this.safeDict(account, 'currency', {});
        const currencyId = this.safeString(currency, 'code', currencyIdV3);
        const typeV3 = this.safeString(account, 'name');
        const typeV2 = this.safeString(account, 'type');
        const parts = typeV3.split(' ');
        return {
            'id': this.safeString2(account, 'id', 'uuid'),
            'type': (active !== undefined) ? this.safeStringLower(parts, 1) : typeV2,
            'code': this.safeCurrencyCode(currencyId),
            'info': account,
        };
    }
    /**
     * @method
     * @name coinbase#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-addresses#create-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        let accountId = this.safeString(params, 'account_id');
        params = this.omit(params, 'account_id');
        if (accountId === undefined) {
            await this.loadAccounts();
            for (let i = 0; i < this.accounts.length; i++) {
                const account = this.accounts[i];
                if (account['code'] === code && account['type'] === 'wallet') {
                    accountId = account['id'];
                    break;
                }
            }
        }
        if (accountId === undefined) {
            throw new errors.ExchangeError(this.id + ' createDepositAddress() could not find the account with matching currency code ' + code + ', specify an `account_id` extra param to target specific wallet');
        }
        const request = {
            'account_id': accountId,
        };
        const response = await this.v2PrivatePostAccountsAccountIdAddresses(this.extend(request, params));
        //
        //     {
        //         "data": {
        //             "id": "05b1ebbf-9438-5dd4-b297-2ddedc98d0e4",
        //             "address": "coinbasebase",
        //             "address_info": {
        //                 "address": "coinbasebase",
        //                 "destination_tag": "287594668"
        //             },
        //             "name": null,
        //             "created_at": "2019-07-01T14:39:29Z",
        //             "updated_at": "2019-07-01T14:39:29Z",
        //             "network": "eosio",
        //             "uri_scheme": "eosio",
        //             "resource": "address",
        //             "resource_path": "/v2/accounts/14cfc769-e852-52f3-b831-711c104d194c/addresses/05b1ebbf-9438-5dd4-b297-2ddedc98d0e4",
        //             "warnings": [
        //                 {
        //                     "title": "Only send EOS (EOS) to this address",
        //                     "details": "Sending any other cryptocurrency will result in permanent loss.",
        //                     "image_url": "https://dynamic-assets.coinbase.com/deaca3d47b10ed4a91a872e9618706eec34081127762d88f2476ac8e99ada4b48525a9565cf2206d18c04053f278f693434af4d4629ca084a9d01b7a286a7e26/asset_icons/1f8489bb280fb0a0fd643c1161312ba49655040e9aaaced5f9ad3eeaf868eadc.png"
        //                 },
        //                 {
        //                     "title": "Both an address and EOS memo are required to receive EOS",
        //                     "details": "If you send funds without an EOS memo or with an incorrect EOS memo, your funds cannot be credited to your account.",
        //                     "image_url": "https://www.coinbase.com/assets/receive-warning-2f3269d83547a7748fb39d6e0c1c393aee26669bfea6b9f12718094a1abff155.png"
        //                 }
        //             ],
        //             "warning_title": "Only send EOS (EOS) to this address",
        //             "warning_details": "Sending any other cryptocurrency will result in permanent loss.",
        //             "destination_tag": "287594668",
        //             "deposit_uri": "eosio:coinbasebase?dt=287594668",
        //             "callback_url": null
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const tag = this.safeString(data, 'destination_tag');
        const address = this.safeString(data, 'address');
        return {
            'currency': code,
            'tag': tag,
            'address': address,
            'info': response,
        };
    }
    /**
     * @method
     * @name coinbase#fetchMySells
     * @ignore
     * @description fetch sells
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-sells#list-sells
     * @param {string} symbol not used by coinbase fetchMySells ()
     * @param {int} [since] timestamp in ms of the earliest sell, default is undefined
     * @param {int} [limit] max number of sells to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [list of order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchMySells(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // v2 did't have an endpoint for all historical trades
        const request = this.prepareAccountRequest(limit, params);
        await this.loadMarkets();
        const query = this.omit(params, ['account_id', 'accountId']);
        const sells = await this.v2PrivateGetAccountsAccountIdSells(this.extend(request, query));
        return this.parseTrades(sells['data'], undefined, since, limit);
    }
    /**
     * @method
     * @name coinbase#fetchMyBuys
     * @ignore
     * @description fetch buys
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-buys#list-buys
     * @param {string} symbol not used by coinbase fetchMyBuys ()
     * @param {int} [since] timestamp in ms of the earliest buy, default is undefined
     * @param {int} [limit] max number of buys to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of  [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchMyBuys(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // v2 did't have an endpoint for all historical trades
        const request = this.prepareAccountRequest(limit, params);
        await this.loadMarkets();
        const query = this.omit(params, ['account_id', 'accountId']);
        const buys = await this.v2PrivateGetAccountsAccountIdBuys(this.extend(request, query));
        return this.parseTrades(buys['data'], undefined, since, limit);
    }
    async fetchTransactionsWithMethod(method, code = undefined, since = undefined, limit = undefined, params = {}) {
        let request = undefined;
        [request, params] = await this.prepareAccountRequestWithCurrencyCode(code, limit, params);
        await this.loadMarkets();
        const response = await this[method](this.extend(request, params));
        return this.parseTransactions(response['data'], undefined, since, limit);
    }
    /**
     * @method
     * @name coinbase#fetchWithdrawals
     * @description Fetch all withdrawals made from an account. Won't return crypto withdrawals. Use fetchLedger for those.
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-withdrawals#list-withdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currencyType] "fiat" or "crypto"
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        let currencyType = undefined;
        [currencyType, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'currencyType');
        if (currencyType === 'crypto') {
            const results = await this.fetchTransactionsWithMethod('v2PrivateGetAccountsAccountIdTransactions', code, since, limit, params);
            return this.filterByArray(results, 'type', 'withdrawal', false);
        }
        return await this.fetchTransactionsWithMethod('v2PrivateGetAccountsAccountIdWithdrawals', code, since, limit, params);
    }
    /**
     * @method
     * @name coinbase#fetchDeposits
     * @description Fetch all fiat deposits made to an account. Won't return crypto deposits or staking rewards. Use fetchLedger for those.
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-deposits#list-deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currencyType] "fiat" or "crypto"
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        let currencyType = undefined;
        [currencyType, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'currencyType');
        if (currencyType === 'crypto') {
            const results = await this.fetchTransactionsWithMethod('v2PrivateGetAccountsAccountIdTransactions', code, since, limit, params);
            return this.filterByArray(results, 'type', 'deposit', false);
        }
        return await this.fetchTransactionsWithMethod('v2PrivateGetAccountsAccountIdDeposits', code, since, limit, params);
    }
    /**
     * @method
     * @name coinbase#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-transactions
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const results = await this.fetchTransactionsWithMethod('v2PrivateGetAccountsAccountIdTransactions', code, since, limit, params);
        return this.filterByArray(results, 'type', ['deposit', 'withdrawal'], false);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'created': 'pending',
            'completed': 'ok',
            'canceled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fiat deposit
        //
        //     {
        //         "id": "f34c19f3-b730-5e3d-9f72",
        //         "status": "completed",
        //         "payment_method": {
        //             "id": "a022b31d-f9c7-5043-98f2",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/a022b31d-f9c7-5043-98f2"
        //         },
        //         "transaction": {
        //             "id": "04ed4113-3732-5b0c-af86-b1d2146977d0",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/04ed4113-3732-5b0c-af86"
        //         },
        //         "user_reference": "2VTYTH",
        //         "created_at": "2017-02-09T07:01:18Z",
        //         "updated_at": "2017-02-09T07:01:26Z",
        //         "resource": "deposit",
        //         "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/deposits/f34c19f3-b730-5e3d-9f72",
        //         "committed": true,
        //         "payout_at": "2017-02-12T07:01:17Z",
        //         "instant": false,
        //         "fee": { "amount": "0.00", "currency": "EUR" },
        //         "amount": { "amount": "114.02", "currency": "EUR" },
        //         "subtotal": { "amount": "114.02", "currency": "EUR" },
        //         "hold_until": null,
        //         "hold_days": 0,
        //         "hold_business_days": 0,
        //         "next_step": null
        //     }
        //
        // fiat_withdrawal
        //
        //     {
        //         "id": "cfcc3b4a-eeb6-5e8c-8058",
        //         "status": "completed",
        //         "payment_method": {
        //             "id": "8b94cfa4-f7fd-5a12-a76a",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/8b94cfa4-f7fd-5a12-a76a"
        //         },
        //         "transaction": {
        //             "id": "fcc2550b-5104-5f83-a444",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/fcc2550b-5104-5f83-a444"
        //         },
        //         "user_reference": "MEUGK",
        //         "created_at": "2018-07-26T08:55:12Z",
        //         "updated_at": "2018-07-26T08:58:18Z",
        //         "resource": "withdrawal",
        //         "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/withdrawals/cfcc3b4a-eeb6-5e8c-8058",
        //         "committed": true,
        //         "payout_at": "2018-07-31T08:55:12Z",
        //         "instant": false,
        //         "fee": { "amount": "0.15", "currency": "EUR" },
        //         "amount": { "amount": "13130.69", "currency": "EUR" },
        //         "subtotal": { "amount": "13130.84", "currency": "EUR" },
        //         "idem": "e549dee5-63ed-4e79-8a96",
        //         "next_step": null
        //     }
        //
        // withdraw
        //
        //     {
        //         "id": "a1794ecf-5693-55fa-70cf-ef731748ed82",
        //         "type": "send",
        //         "status": "pending",
        //         "amount": {
        //             "amount": "-14.008308",
        //             "currency": "USDC"
        //         },
        //         "native_amount": {
        //             "amount": "-18.74",
        //             "currency": "CAD"
        //         },
        //         "description": null,
        //         "created_at": "2024-01-12T01:27:31Z",
        //         "updated_at": "2024-01-12T01:27:31Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/a34bgfad-ed67-538b-bffc-730c98c10da0/transactions/a1794ecf-5693-55fa-70cf-ef731748ed82",
        //         "instant_exchange": false,
        //         "network": {
        //             "status": "pending",
        //             "status_description": "Pending (est. less than 10 minutes)",
        //             "transaction_fee": {
        //                 "amount": "4.008308",
        //                 "currency": "USDC"
        //             },
        //             "transaction_amount": {
        //                 "amount": "10.000000",
        //                 "currency": "USDC"
        //             },
        //             "confirmations": 0
        //         },
        //         "to": {
        //             "resource": "ethereum_address",
        //             "address": "0x9...",
        //             "currency": "USDC",
        //             "address_info": {
        //                 "address": "0x9..."
        //             }
        //         },
        //         "idem": "748d8591-dg9a-7831-a45b-crd61dg78762",
        //         "details": {
        //             "title": "Sent USDC",
        //             "subtitle": "To USDC address on Ethereum network",
        //             "header": "Sent 14.008308 USDC ($18.74)",
        //             "health": "warning"
        //         },
        //         "hide_native_amount": false
        //     }
        //
        //
        // crypto deposit & withdrawal (using `/transactions` endpoint)
        //    {
        //        "amount": {
        //            "amount": "0.00014200", (negative for withdrawal)
        //            "currency": "BTC"
        //        },
        //        "created_at": "2024-03-29T15:48:30Z",
        //        "id": "0031a605-241d-514d-a97b-d4b99f3225d3",
        //        "idem": "092a979b-017e-4403-940a-2ca57811f442", // field present only in case of withdrawal
        //        "native_amount": {
        //            "amount": "9.85", (negative for withdrawal)
        //            "currency": "USD"
        //        },
        //        "network": {
        //            "status": "pending", // if status is `off_blockchain` then no more other fields are present in this object
        //            "hash": "5jYuvrNsvX2DZoMnzGYzVpYxJLfYu4GSK3xetG1H5LHrSovsuFCFYdFMwNRoiht3s6fBk92MM8QLLnz65xuEFTrE",
        //            "network_name": "solana",
        //            "transaction_fee": {
        //                "amount": "0.000100000",
        //                "currency": "SOL"
        //            }
        //        },
        //        "resource": "transaction",
        //        "resource_path": "/v2/accounts/dc504b1c-248e-5b68-a3b0-b991f7fa84e6/transactions/0031a605-241d-514d-a97b-d4b99f3225d3",
        //        "status": "completed",
        //        "type": "send",
        //        "from": { // in some cases, field might be present for deposit
        //            "id": "7fd10cd7-b091-5cee-ba41-c29e49a7cccf",
        //            "name": "Coinbase",
        //            "resource": "user"
        //        },
        //        "to": { // field only present for withdrawal
        //            "address": "5HA12BNthAvBwNYARYf9y5MqqCpB4qhCNFCs1Qw48ACE",
        //            "resource": "address"
        //        },
        //        "description": "C3 - One Time BTC Credit . Reference Case # 123.", //  in some cases, field might be present for deposit
        //    }
        //
        const transactionType = this.safeString(transaction, 'type');
        let amountAndCurrencyObject = undefined;
        let feeObject = undefined;
        const network = this.safeDict(transaction, 'network', {});
        if (transactionType === 'send') {
            amountAndCurrencyObject = this.safeDict(network, 'transaction_amount');
            feeObject = this.safeDict(network, 'transaction_fee', {});
        }
        else {
            amountAndCurrencyObject = this.safeDict(transaction, 'subtotal');
            feeObject = this.safeDict(transaction, 'fee', {});
        }
        if (amountAndCurrencyObject === undefined) {
            amountAndCurrencyObject = this.safeDict(transaction, 'amount');
        }
        const amountString = this.safeString(amountAndCurrencyObject, 'amount');
        const amountStringAbs = Precise["default"].stringAbs(amountString);
        let status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        if (status === undefined) {
            const committed = this.safeBool(transaction, 'committed');
            status = committed ? 'ok' : 'pending';
        }
        const id = this.safeString(transaction, 'id');
        const currencyId = this.safeString(amountAndCurrencyObject, 'currency');
        const feeCurrencyId = this.safeString(feeObject, 'currency');
        const datetime = this.safeString(transaction, 'created_at');
        const resource = this.safeString(transaction, 'resource');
        let type = resource;
        if (!this.inArray(type, ['deposit', 'withdrawal'])) {
            if (Precise["default"].stringGt(amountString, '0')) {
                type = 'deposit';
            }
            else if (Precise["default"].stringLt(amountString, '0')) {
                type = 'withdrawal';
            }
        }
        const toObject = this.safeDict(transaction, 'to');
        const addressTo = this.safeString(toObject, 'address');
        const networkId = this.safeString(network, 'network_name');
        return {
            'info': transaction,
            'id': id,
            'txid': this.safeString(network, 'hash', id),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'network': this.networkIdToCode(networkId),
            'address': addressTo,
            'addressTo': addressTo,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.parseNumber(amountStringAbs),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'status': status,
            'updated': this.parse8601(this.safeString(transaction, 'updated_at')),
            'fee': {
                'cost': this.safeNumber(feeObject, 'amount'),
                'currency': this.safeCurrencyCode(feeCurrencyId),
            },
        };
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchMyBuys, fetchMySells
        //
        //     {
        //         "id": "67e0eaec-07d7-54c4-a72c-2e92826897df",
        //         "status": "completed",
        //         "payment_method": {
        //             "id": "83562370-3e5c-51db-87da-752af5ab9559",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/83562370-3e5c-51db-87da-752af5ab9559"
        //         },
        //         "transaction": {
        //             "id": "441b9494-b3f0-5b98-b9b0-4d82c21c252a",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/transactions/441b9494-b3f0-5b98-b9b0-4d82c21c252a"
        //         },
        //         "amount": { "amount": "1.00000000", "currency": "BTC" },
        //         "total": { "amount": "10.25", "currency": "USD" },
        //         "subtotal": { "amount": "10.10", "currency": "USD" },
        //         "created_at": "2015-01-31T20:49:02Z",
        //         "updated_at": "2015-02-11T16:54:02-08:00",
        //         "resource": "buy",
        //         "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/buys/67e0eaec-07d7-54c4-a72c-2e92826897df",
        //         "committed": true,
        //         "instant": false,
        //         "fee": { "amount": "0.15", "currency": "USD" },
        //         "payout_at": "2015-02-18T16:54:00-08:00"
        //     }
        //
        // fetchTrades
        //
        //     {
        //         "trade_id": "10092327",
        //         "product_id": "BTC-USDT",
        //         "price": "17488.12",
        //         "size": "0.0000623",
        //         "time": "2023-01-11T00:52:37.557001Z",
        //         "side": "BUY",
        //         "bid": "",
        //         "ask": ""
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "entry_id": "b88b82cc89e326a2778874795102cbafd08dd979a2a7a3c69603fc4c23c2e010",
        //         "trade_id": "cdc39e45-bbd3-44ec-bf02-61742dfb16a1",
        //         "order_id": "813a53c5-3e39-47bb-863d-2faf685d22d8",
        //         "trade_time": "2023-01-18T01:37:38.091377090Z",
        //         "trade_type": "FILL",
        //         "price": "21220.64",
        //         "size": "0.0046830664333996",
        //         "commission": "0.0000280983986004",
        //         "product_id": "BTC-USDT",
        //         "sequence_timestamp": "2023-01-18T01:37:38.092520Z",
        //         "liquidity_indicator": "UNKNOWN_LIQUIDITY_INDICATOR",
        //         "size_in_quote": true,
        //         "user_id": "1111111-1111-1111-1111-111111111111",
        //         "side": "BUY"
        //     }
        //
        let symbol = undefined;
        const totalObject = this.safeDict(trade, 'total', {});
        const amountObject = this.safeDict(trade, 'amount', {});
        const subtotalObject = this.safeDict(trade, 'subtotal', {});
        const feeObject = this.safeDict(trade, 'fee', {});
        const marketId = this.safeString(trade, 'product_id');
        market = this.safeMarket(marketId, market, '-');
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        else {
            const baseId = this.safeString(amountObject, 'currency');
            const quoteId = this.safeString(totalObject, 'currency');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                const base = this.safeCurrencyCode(baseId);
                const quote = this.safeCurrencyCode(quoteId);
                symbol = base + '/' + quote;
            }
        }
        const sizeInQuote = this.safeBool(trade, 'size_in_quote');
        const v3Price = this.safeString(trade, 'price');
        let v3Cost = undefined;
        let v3Amount = this.safeString(trade, 'size');
        if (sizeInQuote) {
            // calculate base size
            v3Cost = v3Amount;
            v3Amount = Precise["default"].stringDiv(v3Amount, v3Price);
        }
        const v3FeeCost = this.safeString(trade, 'commission');
        const amountString = this.safeString(amountObject, 'amount', v3Amount);
        const costString = this.safeString(subtotalObject, 'amount', v3Cost);
        let priceString = undefined;
        let cost = undefined;
        if ((costString !== undefined) && (amountString !== undefined)) {
            priceString = Precise["default"].stringDiv(costString, amountString);
        }
        else {
            priceString = v3Price;
        }
        if ((priceString !== undefined) && (amountString !== undefined)) {
            cost = Precise["default"].stringMul(priceString, amountString);
        }
        else {
            cost = costString;
        }
        let feeCurrencyId = this.safeString(feeObject, 'currency');
        const feeCost = this.safeNumber(feeObject, 'amount', this.parseNumber(v3FeeCost));
        if ((feeCurrencyId === undefined) && (market !== undefined) && (feeCost !== undefined)) {
            feeCurrencyId = market['quote'];
        }
        const datetime = this.safeStringN(trade, ['created_at', 'trade_time', 'time']);
        const side = this.safeStringLower2(trade, 'resource', 'side');
        const takerOrMaker = this.safeStringLower(trade, 'liquidity_indicator');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString2(trade, 'id', 'trade_id'),
            'order': this.safeString(trade, 'order_id'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'symbol': symbol,
            'type': undefined,
            'side': (side === 'unknown_order_side') ? undefined : side,
            'takerOrMaker': (takerOrMaker === 'unknown_liquidity_indicator') ? undefined : takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': cost,
            'fee': {
                'cost': feeCost,
                'currency': this.safeCurrencyCode(feeCurrencyId),
            },
        });
    }
    /**
     * @method
     * @name coinbase#fetchMarkets
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicproducts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-currencies#get-fiat-currencies
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates
     * @description retrieves data on all markets for coinbase
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] use private endpoint for fetching markets
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const method = this.safeString(this.options, 'fetchMarkets', 'fetchMarketsV3');
        if (method === 'fetchMarketsV3') {
            return await this.fetchMarketsV3(params);
        }
        return await this.fetchMarketsV2(params);
    }
    async fetchMarketsV2(params = {}) {
        const response = await this.fetchCurrenciesFromCache(params);
        const currencies = this.safeDict(response, 'currencies', {});
        const exchangeRates = this.safeDict(response, 'exchangeRates', {});
        const data = this.safeList(currencies, 'data', []);
        const dataById = this.indexBy(data, 'id');
        const rates = this.safeDict(this.safeDict(exchangeRates, 'data', {}), 'rates', {});
        const baseIds = Object.keys(rates);
        const result = [];
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const base = this.safeCurrencyCode(baseId);
            const type = (baseId in dataById) ? 'fiat' : 'crypto';
            // https://github.com/ccxt/ccxt/issues/6066
            if (type === 'crypto') {
                for (let j = 0; j < data.length; j++) {
                    const quoteCurrency = data[j];
                    const quoteId = this.safeString(quoteCurrency, 'id');
                    const quote = this.safeCurrencyCode(quoteId);
                    result.push(this.safeMarketStructure({
                        'id': baseId + '-' + quoteId,
                        'symbol': base + '/' + quote,
                        'base': base,
                        'quote': quote,
                        'settle': undefined,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'settleId': undefined,
                        'type': 'spot',
                        'spot': true,
                        'margin': false,
                        'swap': false,
                        'future': false,
                        'option': false,
                        'active': undefined,
                        'contract': false,
                        'linear': undefined,
                        'inverse': undefined,
                        'contractSize': undefined,
                        'expiry': undefined,
                        'expiryDatetime': undefined,
                        'strike': undefined,
                        'optionType': undefined,
                        'precision': {
                            'amount': undefined,
                            'price': undefined,
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
                                'min': this.safeNumber(quoteCurrency, 'min_size'),
                                'max': undefined,
                            },
                        },
                        'info': quoteCurrency,
                    }));
                }
            }
        }
        return result;
    }
    async fetchMarketsV3(params = {}) {
        let usePrivate = false;
        [usePrivate, params] = this.handleOptionAndParams(params, 'fetchMarkets', 'usePrivate', false);
        const spotUnresolvedPromises = [];
        if (usePrivate) {
            spotUnresolvedPromises.push(this.v3PrivateGetBrokerageProducts(params));
        }
        else {
            spotUnresolvedPromises.push(this.v3PublicGetBrokerageMarketProducts(params));
        }
        //
        //    {
        //        products: [
        //            {
        //                product_id: 'BTC-USD',
        //                price: '67060',
        //                price_percentage_change_24h: '3.30054960636883',
        //                volume_24h: '10967.87426597',
        //                volume_percentage_change_24h: '141.73048325503036',
        //                base_increment: '0.00000001',
        //                quote_increment: '0.01',
        //                quote_min_size: '1',
        //                quote_max_size: '150000000',
        //                base_min_size: '0.00000001',
        //                base_max_size: '3400',
        //                base_name: 'Bitcoin',
        //                quote_name: 'US Dollar',
        //                watched: false,
        //                is_disabled: false,
        //                new: false,
        //                status: 'online',
        //                cancel_only: false,
        //                limit_only: false,
        //                post_only: false,
        //                trading_disabled: false,
        //                auction_mode: false,
        //                product_type: 'SPOT',
        //                quote_currency_id: 'USD',
        //                base_currency_id: 'BTC',
        //                fcm_trading_session_details: null,
        //                mid_market_price: '',
        //                alias: '',
        //                alias_to: [ 'BTC-USDC' ],
        //                base_display_symbol: 'BTC',
        //                quote_display_symbol: 'USD',
        //                view_only: false,
        //                price_increment: '0.01',
        //                display_name: 'BTC-USD',
        //                product_venue: 'CBE'
        //            },
        //            ...
        //        ],
        //        num_products: '646'
        //    }
        //
        if (this.checkRequiredCredentials(false)) {
            spotUnresolvedPromises.push(this.v3PrivateGetBrokerageTransactionSummary(params));
        }
        //
        //    {
        //        total_volume: '9.995989116664404',
        //        total_fees: '0.07996791093331522',
        //        fee_tier: {
        //            pricing_tier: 'Advanced 1',
        //            usd_from: '0',
        //            usd_to: '1000',
        //            taker_fee_rate: '0.008',
        //            maker_fee_rate: '0.006',
        //            aop_from: '',
        //            aop_to: ''
        //        },
        //        margin_rate: null,
        //        goods_and_services_tax: null,
        //        advanced_trade_only_volume: '9.995989116664404',
        //        advanced_trade_only_fees: '0.07996791093331522',
        //        coinbase_pro_volume: '0',
        //        coinbase_pro_fees: '0',
        //        total_balance: '',
        //        has_promo_fee: false
        //    }
        //
        let unresolvedContractPromises = [];
        try {
            unresolvedContractPromises = [
                this.v3PublicGetBrokerageMarketProducts(this.extend(params, { 'product_type': 'FUTURE' })),
                this.v3PublicGetBrokerageMarketProducts(this.extend(params, { 'product_type': 'FUTURE', 'contract_expiry_type': 'PERPETUAL' })),
            ];
            if (this.checkRequiredCredentials(false)) {
                unresolvedContractPromises.push(this.extend(params, { 'product_type': 'FUTURE' }));
                unresolvedContractPromises.push(this.extend(params, { 'product_type': 'FUTURE', 'contract_expiry_type': 'PERPETUAL' }));
            }
        }
        catch (e) {
            unresolvedContractPromises = []; // the sync version of ccxt won't have the promise.all line so the request is made here. Some users can't access perpetual products
        }
        const promises = await Promise.all(spotUnresolvedPromises);
        let contractPromises = undefined;
        try {
            contractPromises = await Promise.all(unresolvedContractPromises); // some users don't have access to contracts
        }
        catch (e) {
            contractPromises = [];
        }
        const spot = this.safeDict(promises, 0, {});
        const fees = this.safeDict(promises, 1, {});
        const expiringFutures = this.safeDict(contractPromises, 0, {});
        const perpetualFutures = this.safeDict(contractPromises, 1, {});
        const expiringFees = this.safeDict(contractPromises, 2, {});
        const perpetualFees = this.safeDict(contractPromises, 3, {});
        //
        //     {
        //         "total_volume": 0,
        //         "total_fees": 0,
        //         "fee_tier": {
        //             "pricing_tier": "",
        //             "usd_from": "0",
        //             "usd_to": "10000",
        //             "taker_fee_rate": "0.006",
        //             "maker_fee_rate": "0.004"
        //         },
        //         "margin_rate": null,
        //         "goods_and_services_tax": null,
        //         "advanced_trade_only_volume": 0,
        //         "advanced_trade_only_fees": 0,
        //         "coinbase_pro_volume": 0,
        //         "coinbase_pro_fees": 0
        //     }
        //
        const feeTier = this.safeDict(fees, 'fee_tier', {});
        const expiringFeeTier = this.safeDict(expiringFees, 'fee_tier', {}); // fee tier null?
        const perpetualFeeTier = this.safeDict(perpetualFees, 'fee_tier', {}); // fee tier null?
        const data = this.safeList(spot, 'products', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push(this.parseSpotMarket(data[i], feeTier));
        }
        const futureData = this.safeList(expiringFutures, 'products', []);
        for (let i = 0; i < futureData.length; i++) {
            result.push(this.parseContractMarket(futureData[i], expiringFeeTier));
        }
        const perpetualData = this.safeList(perpetualFutures, 'products', []);
        for (let i = 0; i < perpetualData.length; i++) {
            result.push(this.parseContractMarket(perpetualData[i], perpetualFeeTier));
        }
        return result;
    }
    parseSpotMarket(market, feeTier) {
        //
        //         {
        //             "product_id": "TONE-USD",
        //             "price": "0.01523",
        //             "price_percentage_change_24h": "1.94109772423025",
        //             "volume_24h": "19773129",
        //             "volume_percentage_change_24h": "437.0170530929949",
        //             "base_increment": "1",
        //             "quote_increment": "0.00001",
        //             "quote_min_size": "1",
        //             "quote_max_size": "10000000",
        //             "base_min_size": "26.7187147229469674",
        //             "base_max_size": "267187147.2294696735908216",
        //             "base_name": "TE-FOOD",
        //             "quote_name": "US Dollar",
        //             "watched": false,
        //             "is_disabled": false,
        //             "new": false,
        //             "status": "online",
        //             "cancel_only": false,
        //             "limit_only": false,
        //             "post_only": false,
        //             "trading_disabled": false,
        //             "auction_mode": false,
        //             "product_type": "SPOT",
        //             "quote_currency_id": "USD",
        //             "base_currency_id": "TONE",
        //             "fcm_trading_session_details": null,
        //             "mid_market_price": ""
        //         }
        //
        const id = this.safeString(market, 'product_id');
        const baseId = this.safeString(market, 'base_currency_id');
        const quoteId = this.safeString(market, 'quote_currency_id');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const marketType = this.safeStringLower(market, 'product_type');
        const tradingDisabled = this.safeBool(market, 'trading_disabled');
        const stablePairs = this.safeList(this.options, 'stablePairs', []);
        const defaultTakerFee = this.safeNumber(this.fees['trading'], 'taker');
        const defaultMakerFee = this.safeNumber(this.fees['trading'], 'maker');
        const takerFee = this.inArray(id, stablePairs) ? 0.00001 : this.safeNumber(feeTier, 'taker_fee_rate', defaultTakerFee);
        const makerFee = this.inArray(id, stablePairs) ? 0.0 : this.safeNumber(feeTier, 'maker_fee_rate', defaultMakerFee);
        return this.safeMarketStructure({
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': marketType,
            'spot': (marketType === 'spot'),
            'margin': undefined,
            'swap': false,
            'future': false,
            'option': false,
            'active': !tradingDisabled,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': takerFee,
            'maker': makerFee,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'base_increment'),
                'price': this.safeNumber2(market, 'price_increment', 'quote_increment'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'base_min_size'),
                    'max': this.safeNumber(market, 'base_max_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'quote_min_size'),
                    'max': this.safeNumber(market, 'quote_max_size'),
                },
            },
            'created': undefined,
            'info': market,
        });
    }
    parseContractMarket(market, feeTier) {
        // expiring
        //
        //        {
        //           "product_id":"BIT-26APR24-CDE",
        //           "price":"71145",
        //           "price_percentage_change_24h":"-2.36722931247427",
        //           "volume_24h":"108549",
        //           "volume_percentage_change_24h":"155.78255337197794",
        //           "base_increment":"1",
        //           "quote_increment":"0.01",
        //           "quote_min_size":"0",
        //           "quote_max_size":"100000000",
        //           "base_min_size":"1",
        //           "base_max_size":"100000000",
        //           "base_name":"",
        //           "quote_name":"US Dollar",
        //           "watched":false,
        //           "is_disabled":false,
        //           "new":false,
        //           "status":"",
        //           "cancel_only":false,
        //           "limit_only":false,
        //           "post_only":false,
        //           "trading_disabled":false,
        //           "auction_mode":false,
        //           "product_type":"FUTURE",
        //           "quote_currency_id":"USD",
        //           "base_currency_id":"",
        //           "fcm_trading_session_details":{
        //              "is_session_open":true,
        //              "open_time":"2024-04-08T22:00:00Z",
        //              "close_time":"2024-04-09T21:00:00Z"
        //           },
        //           "mid_market_price":"71105",
        //           "alias":"",
        //           "alias_to":[
        //           ],
        //           "base_display_symbol":"",
        //           "quote_display_symbol":"USD",
        //           "view_only":false,
        //           "price_increment":"5",
        //           "display_name":"BTC 26 APR 24",
        //           "product_venue":"FCM",
        //           "future_product_details":{
        //              "venue":"cde",
        //              "contract_code":"BIT",
        //              "contract_expiry":"2024-04-26T15:00:00Z",
        //              "contract_size":"0.01",
        //              "contract_root_unit":"BTC",
        //              "group_description":"Nano Bitcoin Futures",
        //              "contract_expiry_timezone":"Europe/London",
        //              "group_short_description":"Nano BTC",
        //              "risk_managed_by":"MANAGED_BY_FCM",
        //              "contract_expiry_type":"EXPIRING",
        //              "contract_display_name":"BTC 26 APR 24"
        //           }
        //        }
        //
        // perpetual
        //
        //        {
        //           "product_id":"ETH-PERP-INTX",
        //           "price":"3630.98",
        //           "price_percentage_change_24h":"0.65142426292038",
        //           "volume_24h":"114020.1501",
        //           "volume_percentage_change_24h":"63.33650787154869",
        //           "base_increment":"0.0001",
        //           "quote_increment":"0.01",
        //           "quote_min_size":"10",
        //           "quote_max_size":"50000000",
        //           "base_min_size":"0.0001",
        //           "base_max_size":"50000",
        //           "base_name":"",
        //           "quote_name":"USDC",
        //           "watched":false,
        //           "is_disabled":false,
        //           "new":false,
        //           "status":"",
        //           "cancel_only":false,
        //           "limit_only":false,
        //           "post_only":false,
        //           "trading_disabled":false,
        //           "auction_mode":false,
        //           "product_type":"FUTURE",
        //           "quote_currency_id":"USDC",
        //           "base_currency_id":"",
        //           "fcm_trading_session_details":null,
        //           "mid_market_price":"3630.975",
        //           "alias":"",
        //           "alias_to":[],
        //           "base_display_symbol":"",
        //           "quote_display_symbol":"USDC",
        //           "view_only":false,
        //           "price_increment":"0.01",
        //           "display_name":"ETH PERP",
        //           "product_venue":"INTX",
        //           "future_product_details":{
        //              "venue":"",
        //              "contract_code":"ETH",
        //              "contract_expiry":null,
        //              "contract_size":"1",
        //              "contract_root_unit":"ETH",
        //              "group_description":"",
        //              "contract_expiry_timezone":"",
        //              "group_short_description":"",
        //              "risk_managed_by":"MANAGED_BY_VENUE",
        //              "contract_expiry_type":"PERPETUAL",
        //              "perpetual_details":{
        //                 "open_interest":"0",
        //                 "funding_rate":"0.000016",
        //                 "funding_time":"2024-04-09T09:00:00.000008Z",
        //                 "max_leverage":"10"
        //              },
        //              "contract_display_name":"ETH PERPETUAL"
        //           }
        //        }
        //
        const id = this.safeString(market, 'product_id');
        const futureProductDetails = this.safeDict(market, 'future_product_details', {});
        const contractExpiryType = this.safeString(futureProductDetails, 'contract_expiry_type');
        const contractSize = this.safeNumber(futureProductDetails, 'contract_size');
        const contractExpire = this.safeString(futureProductDetails, 'contract_expiry');
        const expireTimestamp = this.parse8601(contractExpire);
        const expireDateTime = this.iso8601(expireTimestamp);
        const isSwap = (contractExpiryType === 'PERPETUAL');
        const baseId = this.safeString(futureProductDetails, 'contract_root_unit');
        const quoteId = this.safeString(market, 'quote_currency_id');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const tradingDisabled = this.safeBool(market, 'is_disabled');
        let symbol = base + '/' + quote;
        let type = undefined;
        if (isSwap) {
            type = 'swap';
            symbol = symbol + ':' + quote;
        }
        else {
            type = 'future';
            symbol = symbol + ':' + quote + '-' + this.yymmdd(expireTimestamp);
        }
        const takerFeeRate = this.safeNumber(feeTier, 'taker_fee_rate');
        const makerFeeRate = this.safeNumber(feeTier, 'maker_fee_rate');
        const taker = takerFeeRate ? takerFeeRate : this.parseNumber('0.06');
        const maker = makerFeeRate ? makerFeeRate : this.parseNumber('0.04');
        return this.safeMarketStructure({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'type': type,
            'spot': false,
            'margin': false,
            'swap': isSwap,
            'future': !isSwap,
            'option': false,
            'active': !tradingDisabled,
            'contract': true,
            'linear': true,
            'inverse': false,
            'taker': taker,
            'maker': maker,
            'contractSize': contractSize,
            'expiry': expireTimestamp,
            'expiryDatetime': expireDateTime,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'base_increment'),
                'price': this.safeNumber2(market, 'price_increment', 'quote_increment'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'base_min_size'),
                    'max': this.safeNumber(market, 'base_max_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'quote_min_size'),
                    'max': this.safeNumber(market, 'quote_max_size'),
                },
            },
            'created': undefined,
            'info': market,
        });
    }
    async fetchCurrenciesFromCache(params = {}) {
        const options = this.safeDict(this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger(options, 'timestamp');
        const expires = this.safeInteger(options, 'expires', 1000);
        const now = this.milliseconds();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const promises = [
                this.v2PublicGetCurrencies(params),
                this.v2PublicGetCurrenciesCrypto(params),
            ];
            const promisesResult = await Promise.all(promises);
            const fiatResponse = this.safeDict(promisesResult, 0, {});
            //
            //    [
            //        "data": {
            //            id: 'IMP',
            //            name: 'Isle of Man Pound',
            //            min_size: '0.01'
            //        },
            //        ...
            //    ]
            //
            const cryptoResponse = this.safeDict(promisesResult, 1, {});
            //
            //    {
            //        asset_id: '9476e3be-b731-47fa-82be-347fabc573d9',
            //        code: 'AERO',
            //        name: 'Aerodrome Finance',
            //        color: '#0433FF',
            //        sort_index: '340',
            //        exponent: '8',
            //        type: 'crypto',
            //        address_regex: '^(?:0x)?[0-9a-fA-F]{40}$'
            //    }
            //
            const fiatData = this.safeList(fiatResponse, 'data', []);
            const cryptoData = this.safeList(cryptoResponse, 'data', []);
            const exchangeRates = await this.v2PublicGetExchangeRates(params);
            this.options['fetchCurrencies'] = this.extend(options, {
                'currencies': this.arrayConcat(fiatData, cryptoData),
                'exchangeRates': exchangeRates,
                'timestamp': now,
            });
        }
        return this.safeDict(this.options, 'fetchCurrencies', {});
    }
    /**
     * @method
     * @name coinbase#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-currencies#get-fiat-currencies
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.fetchCurrenciesFromCache(params);
        const currencies = this.safeList(response, 'currencies', []);
        //
        // fiat
        //
        //    {
        //        id: 'IMP',
        //        name: 'Isle of Man Pound',
        //        min_size: '0.01'
        //    },
        //
        // crypto
        //
        //    {
        //        asset_id: '9476e3be-b731-47fa-82be-347fabc573d9',
        //        code: 'AERO',
        //        name: 'Aerodrome Finance',
        //        color: '#0433FF',
        //        sort_index: '340',
        //        exponent: '8',
        //        type: 'crypto',
        //        address_regex: '^(?:0x)?[0-9a-fA-F]{40}$'
        //    }
        //
        //
        //     {
        //         "data":{
        //             "currency":"USD",
        //             "rates":{
        //                 "AED":"3.67",
        //                 "AFN":"78.21",
        //                 "ALL":"110.42",
        //                 "AMD":"474.18",
        //                 "ANG":"1.75",
        //                 ...
        //             },
        //         }
        //     }
        //
        const result = {};
        const networks = {};
        const networksById = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const assetId = this.safeString(currency, 'asset_id');
            const id = this.safeString2(currency, 'id', 'code');
            const code = this.safeCurrencyCode(id);
            const name = this.safeString(currency, 'name');
            this.options['networks'][code] = name.toLowerCase();
            this.options['networksById'][code] = name.toLowerCase();
            result[code] = {
                'info': currency,
                'id': id,
                'code': code,
                'type': (assetId !== undefined) ? 'crypto' : 'fiat',
                'name': this.safeString(currency, 'name'),
                'active': true,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber(currency, 'min_size'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            if (assetId !== undefined) {
                const lowerCaseName = name.toLowerCase();
                networks[code] = lowerCaseName;
                networksById[lowerCaseName] = code;
            }
        }
        this.options['networks'] = this.extend(networks, this.options['networks']);
        this.options['networksById'] = this.extend(networksById, this.options['networksById']);
        return result;
    }
    /**
     * @method
     * @name coinbase#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getproducts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] use private endpoint for fetching tickers
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        const method = this.safeString(this.options, 'fetchTickers', 'fetchTickersV3');
        if (method === 'fetchTickersV3') {
            return await this.fetchTickersV3(symbols, params);
        }
        return await this.fetchTickersV2(symbols, params);
    }
    async fetchTickersV2(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {
        // 'currency': 'USD',
        };
        const response = await this.v2PublicGetExchangeRates(this.extend(request, params));
        //
        //     {
        //         "data":{
        //             "currency":"USD",
        //             "rates":{
        //                 "AED":"3.6731",
        //                 "AFN":"103.163942",
        //                 "ALL":"106.973038",
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rates = this.safeDict(data, 'rates', {});
        const quoteId = this.safeString(data, 'currency');
        const result = {};
        const baseIds = Object.keys(rates);
        const delimiter = '-';
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const marketId = baseId + delimiter + quoteId;
            const market = this.safeMarket(marketId, undefined, delimiter);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker(rates[baseId], market);
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTickersV3(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            request['product_ids'] = this.marketIds(symbols);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchTickers', this.getMarketFromSymbols(symbols), params, 'default');
        if (marketType !== undefined && marketType !== 'default') {
            request['product_type'] = (marketType === 'swap') ? 'FUTURE' : 'SPOT';
        }
        let response = undefined;
        let usePrivate = false;
        [usePrivate, params] = this.handleOptionAndParams(params, 'fetchTickers', 'usePrivate', false);
        if (usePrivate) {
            response = await this.v3PrivateGetBrokerageProducts(this.extend(request, params));
        }
        else {
            response = await this.v3PublicGetBrokerageMarketProducts(this.extend(request, params));
        }
        //
        //     {
        //         "products": [
        //             {
        //                 "product_id": "TONE-USD",
        //                 "price": "0.01523",
        //                 "price_percentage_change_24h": "1.94109772423025",
        //                 "volume_24h": "19773129",
        //                 "volume_percentage_change_24h": "437.0170530929949",
        //                 "base_increment": "1",
        //                 "quote_increment": "0.00001",
        //                 "quote_min_size": "1",
        //                 "quote_max_size": "10000000",
        //                 "base_min_size": "26.7187147229469674",
        //                 "base_max_size": "267187147.2294696735908216",
        //                 "base_name": "TE-FOOD",
        //                 "quote_name": "US Dollar",
        //                 "watched": false,
        //                 "is_disabled": false,
        //                 "new": false,
        //                 "status": "online",
        //                 "cancel_only": false,
        //                 "limit_only": false,
        //                 "post_only": false,
        //                 "trading_disabled": false,
        //                 "auction_mode": false,
        //                 "product_type": "SPOT",
        //                 "quote_currency_id": "USD",
        //                 "base_currency_id": "TONE",
        //                 "fcm_trading_session_details": null,
        //                 "mid_market_price": ""
        //             },
        //             ...
        //         ],
        //         "num_products": 549
        //     }
        //
        const data = this.safeList(response, 'products', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString(entry, 'product_id');
            const market = this.safeMarket(marketId, undefined, '-');
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker(entry, market);
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    /**
     * @method
     * @name coinbase#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getmarkettrades
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-spot-price
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-buy-price
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-sell-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] whether to use the private endpoint for fetching the ticker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        const method = this.safeString(this.options, 'fetchTicker', 'fetchTickerV3');
        if (method === 'fetchTickerV3') {
            return await this.fetchTickerV3(symbol, params);
        }
        return await this.fetchTickerV2(symbol, params);
    }
    async fetchTickerV2(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = this.extend({
            'symbol': market['id'],
        }, params);
        const spot = await this.v2PublicGetPricesSymbolSpot(request);
        //
        //     {"data":{"base":"BTC","currency":"USD","amount":"48691.23"}}
        //
        const ask = await this.v2PublicGetPricesSymbolBuy(request);
        //
        //     {"data":{"base":"BTC","currency":"USD","amount":"48691.23"}}
        //
        const bid = await this.v2PublicGetPricesSymbolSell(request);
        //
        //     {"data":{"base":"BTC","currency":"USD","amount":"48691.23"}}
        //
        const spotData = this.safeDict(spot, 'data', {});
        const askData = this.safeDict(ask, 'data', {});
        const bidData = this.safeDict(bid, 'data', {});
        const bidAskLast = {
            'bid': this.safeNumber(bidData, 'amount'),
            'ask': this.safeNumber(askData, 'amount'),
            'price': this.safeNumber(spotData, 'amount'),
        };
        return this.parseTicker(bidAskLast, market);
    }
    async fetchTickerV3(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['id'],
            'limit': 1,
        };
        let usePrivate = false;
        [usePrivate, params] = this.handleOptionAndParams(params, 'fetchTicker', 'usePrivate', false);
        let response = undefined;
        if (usePrivate) {
            response = await this.v3PrivateGetBrokerageProductsProductIdTicker(this.extend(request, params));
        }
        else {
            response = await this.v3PublicGetBrokerageMarketProductsProductIdTicker(this.extend(request, params));
        }
        //
        //     {
        //         "trades": [
        //             {
        //                 "trade_id": "518078013",
        //                 "product_id": "BTC-USD",
        //                 "price": "28208.1",
        //                 "size": "0.00659179",
        //                 "time": "2023-04-04T23:05:34.492746Z",
        //                 "side": "BUY",
        //                 "bid": "",
        //                 "ask": ""
        //             }
        //         ],
        //         "best_bid": "28208.61",
        //         "best_ask": "28208.62"
        //     }
        //
        const data = this.safeList(response, 'trades', []);
        const ticker = this.parseTicker(data[0], market);
        ticker['bid'] = this.safeNumber(response, 'best_bid');
        ticker['ask'] = this.safeNumber(response, 'best_ask');
        return ticker;
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTickerV2
        //
        //     {
        //         "bid": 20713.37,
        //         "ask": 20924.65,
        //         "price": 20809.83
        //     }
        //
        // fetchTickerV3
        //
        //     {
        //         "trade_id": "10209805",
        //         "product_id": "BTC-USDT",
        //         "price": "19381.27",
        //         "size": "0.1",
        //         "time": "2023-01-13T20:35:41.865970Z",
        //         "side": "BUY",
        //         "bid": "",
        //         "ask": ""
        //     }
        //
        // fetchTickersV2
        //
        //     "48691.23"
        //
        // fetchTickersV3
        //
        //     [
        //         {
        //             "product_id": "TONE-USD",
        //             "price": "0.01523",
        //             "price_percentage_change_24h": "1.94109772423025",
        //             "volume_24h": "19773129",
        //             "volume_percentage_change_24h": "437.0170530929949",
        //             "base_increment": "1",
        //             "quote_increment": "0.00001",
        //             "quote_min_size": "1",
        //             "quote_max_size": "10000000",
        //             "base_min_size": "26.7187147229469674",
        //             "base_max_size": "267187147.2294696735908216",
        //             "base_name": "TE-FOOD",
        //             "quote_name": "US Dollar",
        //             "watched": false,
        //             "is_disabled": false,
        //             "new": false,
        //             "status": "online",
        //             "cancel_only": false,
        //             "limit_only": false,
        //             "post_only": false,
        //             "trading_disabled": false,
        //             "auction_mode": false,
        //             "product_type": "SPOT",
        //             "quote_currency_id": "USD",
        //             "base_currency_id": "TONE",
        //             "fcm_trading_session_details": null,
        //             "mid_market_price": ""
        //         },
        //         ...
        //     ]
        //
        // fetchBidsAsks
        //
        //     {
        //         "product_id": "TRAC-EUR",
        //         "bids": [
        //             {
        //                 "price": "0.2384",
        //                 "size": "386.1"
        //             }
        //         ],
        //         "asks": [
        //             {
        //                 "price": "0.2406",
        //                 "size": "672"
        //             }
        //         ],
        //         "time": "2023-06-30T07:15:24.656044Z"
        //     }
        //
        let bid = this.safeNumber(ticker, 'bid');
        let ask = this.safeNumber(ticker, 'ask');
        let bidVolume = undefined;
        let askVolume = undefined;
        if (('bids' in ticker)) {
            const bids = this.safeList(ticker, 'bids', []);
            const asks = this.safeList(ticker, 'asks', []);
            bid = this.safeNumber(bids[0], 'price');
            bidVolume = this.safeNumber(bids[0], 'size');
            ask = this.safeNumber(asks[0], 'price');
            askVolume = this.safeNumber(asks[0], 'size');
        }
        const marketId = this.safeString(ticker, 'product_id');
        const last = this.safeNumber(ticker, 'price');
        const datetime = this.safeString(ticker, 'time');
        return this.safeTicker({
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': undefined,
            'low': undefined,
            'bidVolume': bidVolume,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeNumber(ticker, 'price_percentage_change_24h'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    parseCustomBalance(response, params = {}) {
        const balances = this.safeList2(response, 'data', 'accounts', []);
        const accounts = this.safeList(params, 'type', this.options['accounts']);
        const v3Accounts = this.safeList(params, 'type', this.options['v3Accounts']);
        const result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            const balance = balances[b];
            const type = this.safeString(balance, 'type');
            if (this.inArray(type, accounts)) {
                const value = this.safeDict(balance, 'balance');
                if (value !== undefined) {
                    const currencyId = this.safeString(value, 'currency');
                    const code = this.safeCurrencyCode(currencyId);
                    const total = this.safeString(value, 'amount');
                    const free = total;
                    let account = this.safeDict(result, code);
                    if (account === undefined) {
                        account = this.account();
                        account['free'] = free;
                        account['total'] = total;
                    }
                    else {
                        account['free'] = Precise["default"].stringAdd(account['free'], total);
                        account['total'] = Precise["default"].stringAdd(account['total'], total);
                    }
                    result[code] = account;
                }
            }
            else if (this.inArray(type, v3Accounts)) {
                const available = this.safeDict(balance, 'available_balance');
                const hold = this.safeDict(balance, 'hold');
                if (available !== undefined && hold !== undefined) {
                    const currencyId = this.safeString(available, 'currency');
                    const code = this.safeCurrencyCode(currencyId);
                    const used = this.safeString(hold, 'value');
                    const free = this.safeString(available, 'value');
                    const total = Precise["default"].stringAdd(used, free);
                    let account = this.safeDict(result, code);
                    if (account === undefined) {
                        account = this.account();
                        account['free'] = free;
                        account['used'] = used;
                        account['total'] = total;
                    }
                    else {
                        account['free'] = Precise["default"].stringAdd(account['free'], free);
                        account['used'] = Precise["default"].stringAdd(account['used'], used);
                        account['total'] = Precise["default"].stringAdd(account['total'], total);
                    }
                    result[code] = account;
                }
            }
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name coinbase#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getaccounts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-accounts#list-accounts
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmbalancesummary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.v3] default false, set true to use v3 api endpoint
     * @param {string} [params.type] "spot" (default) or "swap" or "future"
     * @param {int} [params.limit] default 250, maximum number of accounts to return
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const request = {};
        let response = undefined;
        const isV3 = this.safeBool(params, 'v3', false);
        params = this.omit(params, ['v3']);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const method = this.safeString(this.options, 'fetchBalance', 'v3PrivateGetBrokerageAccounts');
        if (marketType === 'future') {
            response = await this.v3PrivateGetBrokerageCfmBalanceSummary(this.extend(request, params));
        }
        else if ((isV3) || (method === 'v3PrivateGetBrokerageAccounts')) {
            request['limit'] = 250;
            response = await this.v3PrivateGetBrokerageAccounts(this.extend(request, params));
        }
        else {
            request['limit'] = 250;
            response = await this.v2PrivateGetAccounts(this.extend(request, params));
        }
        //
        // v2PrivateGetAccounts
        //     {
        //         "pagination":{
        //             "ending_before":null,
        //             "starting_after":null,
        //             "previous_ending_before":null,
        //             "next_starting_after":"6b17acd6-2e68-5eb0-9f45-72d67cef578b",
        //             "limit":100,
        //             "order":"desc",
        //             "previous_uri":null,
        //             "next_uri":"/v2/accounts?limit=100\u0026starting_after=6b17acd6-2e68-5eb0-9f45-72d67cef578b"
        //         },
        //         "data":[
        //             {
        //                 "id":"94ad58bc-0f15-5309-b35a-a4c86d7bad60",
        //                 "name":"MINA Wallet",
        //                 "primary":false,
        //                 "type":"wallet",
        //                 "currency":{
        //                     "code":"MINA",
        //                     "name":"Mina",
        //                     "color":"#EA6B48",
        //                     "sort_index":397,
        //                     "exponent":9,
        //                     "type":"crypto",
        //                     "address_regex":"^(B62)[A-Za-z0-9]{52}$",
        //                     "asset_id":"a4ffc575-942c-5e26-b70c-cb3befdd4229",
        //                     "slug":"mina"
        //                 },
        //                 "balance":{"amount":"0.000000000","currency":"MINA"},
        //                 "created_at":"2022-03-25T00:36:16Z",
        //                 "updated_at":"2022-03-25T00:36:16Z",
        //                 "resource":"account",
        //                 "resource_path":"/v2/accounts/94ad58bc-0f15-5309-b35a-a4c86d7bad60",
        //                 "allow_deposits":true,
        //                 "allow_withdrawals":true
        //             },
        //         ]
        //     }
        //
        // v3PrivateGetBrokerageAccounts
        //     {
        //         "accounts": [
        //             {
        //                 "uuid": "11111111-1111-1111-1111-111111111111",
        //                 "name": "USDC Wallet",
        //                 "currency": "USDC",
        //                 "available_balance": {
        //                     "value": "0.0000000000000000",
        //                     "currency": "USDC"
        //                 },
        //                 "default": true,
        //                 "active": true,
        //                 "created_at": "2023-01-04T06:20:06.456Z",
        //                 "updated_at": "2023-01-04T06:20:07.181Z",
        //                 "deleted_at": null,
        //                 "type": "ACCOUNT_TYPE_CRYPTO",
        //                 "ready": false,
        //                 "hold": {
        //                     "value": "0.0000000000000000",
        //                     "currency": "USDC"
        //                 }
        //             },
        //             ...
        //         ],
        //         "has_next": false,
        //         "cursor": "",
        //         "size": 9
        //     }
        //
        params['type'] = marketType;
        return this.parseCustomBalance(response, params);
    }
    /**
     * @method
     * @name coinbase#fetchLedger
     * @description Fetch the history of changes, i.e. actions done by the user or operations that altered the balance. Will return staking rewards, and crypto deposits or withdrawals.
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-transactions#list-transactions
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchLedger', code, since, limit, params, 'next_starting_after', 'starting_after', undefined, 100);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        let request = undefined;
        [request, params] = await this.prepareAccountRequestWithCurrencyCode(code, limit, params);
        // for pagination use parameter 'starting_after'
        // the value for the next page can be obtained from the result of the previous call in the 'pagination' field
        // eg: instance.last_http_response -> pagination.next_starting_after
        const response = await this.v2PrivateGetAccountsAccountIdTransactions(this.extend(request, params));
        const ledger = this.parseLedger(response['data'], currency, since, limit);
        const length = ledger.length;
        if (length === 0) {
            return ledger;
        }
        const lastIndex = length - 1;
        const last = this.safeDict(ledger, lastIndex);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'next_starting_after');
        if ((cursor !== undefined) && (cursor !== '')) {
            last['info']['next_starting_after'] = cursor;
            ledger[lastIndex] = last;
        }
        return ledger;
    }
    parseLedgerEntryStatus(status) {
        const types = {
            'completed': 'ok',
        };
        return this.safeString(types, status, status);
    }
    parseLedgerEntryType(type) {
        const types = {
            'buy': 'trade',
            'sell': 'trade',
            'fiat_deposit': 'transaction',
            'fiat_withdrawal': 'transaction',
            'exchange_deposit': 'transaction',
            'exchange_withdrawal': 'transaction',
            'send': 'transaction',
            'pro_deposit': 'transaction',
            'pro_withdrawal': 'transaction', // crypto deposit (to coinbase from coinbasepro)
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        // crypto deposit transaction
        //
        //     {
        //         "id": "34e4816b-4c8c-5323-a01c-35a9fa26e490",
        //         "type": "send",
        //         "status": "completed",
        //         "amount": { amount: "28.31976528", currency: "BCH" },
        //         "native_amount": { amount: "2799.65", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2019-02-28T12:35:20Z",
        //         "updated_at": "2019-02-28T12:43:24Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c01d7364-edd7-5f3a-bd1d-de53d4cbb25e/transactions/34e4816b-4c8c-5323-a01c-35a9fa26e490",
        //         "instant_exchange": false,
        //         "network": {
        //             "status": "confirmed",
        //             "hash": "56222d865dae83774fccb2efbd9829cf08c75c94ce135bfe4276f3fb46d49701",
        //             "transaction_url": "https://bch.btc.com/56222d865dae83774fccb2efbd9829cf08c75c94ce135bfe4276f3fb46d49701"
        //         },
        //         "from": { resource: "bitcoin_cash_network", currency: "BCH" },
        //         "details": { title: 'Received Bitcoin Cash', subtitle: "From Bitcoin Cash address" }
        //     }
        //
        // crypto withdrawal transaction
        //
        //     {
        //         "id": "459aad99-2c41-5698-ac71-b6b81a05196c",
        //         "type": "send",
        //         "status": "completed",
        //         "amount": { amount: "-0.36775642", currency: "BTC" },
        //         "native_amount": { amount: "-1111.65", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2019-03-20T08:37:07Z",
        //         "updated_at": "2019-03-20T08:49:33Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/459aad99-2c41-5698-ac71-b6b81a05196c",
        //         "instant_exchange": false,
        //         "network": {
        //             "status": "confirmed",
        //             "hash": "2732bbcf35c69217c47b36dce64933d103895277fe25738ffb9284092701e05b",
        //             "transaction_url": "https://blockchain.info/tx/2732bbcf35c69217c47b36dce64933d103895277fe25738ffb9284092701e05b",
        //             "transaction_fee": { amount: "0.00000000", currency: "BTC" },
        //             "transaction_amount": { amount: "0.36775642", currency: "BTC" },
        //             "confirmations": 15682
        //         },
        //         "to": {
        //             "resource": "bitcoin_address",
        //             "address": "1AHnhqbvbYx3rnZx8uC7NbFZaTe4tafFHX",
        //             "currency": "BTC",
        //             "address_info": { address: "1AHnhqbvbYx3rnZx8uC7NbFZaTe4tafFHX" }
        //         },
        //         "idem": "da0a2f14-a2af-4c5a-a37e-d4484caf582bsend",
        //         "application": {
        //             "id": "5756ab6e-836b-553b-8950-5e389451225d",
        //             "resource": "application",
        //             "resource_path": "/v2/applications/5756ab6e-836b-553b-8950-5e389451225d"
        //         },
        //         "details": { title: 'Sent Bitcoin', subtitle: "To Bitcoin address" }
        //     }
        //
        // withdrawal transaction from coinbase to coinbasepro
        //
        //     {
        //         "id": "5b1b9fb8-5007-5393-b923-02903b973fdc",
        //         "type": "pro_deposit",
        //         "status": "completed",
        //         "amount": { amount: "-0.00001111", currency: "BCH" },
        //         "native_amount": { amount: "0.00", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2019-02-28T13:31:58Z",
        //         "updated_at": "2019-02-28T13:31:58Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c01d7364-edd7-5f3a-bd1d-de53d4cbb25e/transactions/5b1b9fb8-5007-5393-b923-02903b973fdc",
        //         "instant_exchange": false,
        //         "application": {
        //             "id": "5756ab6e-836b-553b-8950-5e389451225d",
        //             "resource": "application",
        //             "resource_path": "/v2/applications/5756ab6e-836b-553b-8950-5e389451225d"
        //         },
        //         "details": { title: 'Transferred Bitcoin Cash', subtitle: "To Coinbase Pro" }
        //     }
        //
        // withdrawal transaction from coinbase to gdax
        //
        //     {
        //         "id": "badb7313-a9d3-5c07-abd0-00f8b44199b1",
        //         "type": "exchange_deposit",
        //         "status": "completed",
        //         "amount": { amount: "-0.43704149", currency: "BCH" },
        //         "native_amount": { amount: "-51.90", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2019-03-19T10:30:40Z",
        //         "updated_at": "2019-03-19T10:30:40Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c01d7364-edd7-5f3a-bd1d-de53d4cbb25e/transactions/badb7313-a9d3-5c07-abd0-00f8b44199b1",
        //         "instant_exchange": false,
        //         "details": { title: 'Transferred Bitcoin Cash', subtitle: "To GDAX" }
        //     }
        //
        // deposit transaction from gdax to coinbase
        //
        //     {
        //         "id": "9c4b642c-8688-58bf-8962-13cef64097de",
        //         "type": "exchange_withdrawal",
        //         "status": "completed",
        //         "amount": { amount: "0.57729420", currency: "BTC" },
        //         "native_amount": { amount: "4418.72", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2018-02-17T11:33:33Z",
        //         "updated_at": "2018-02-17T11:33:33Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/9c4b642c-8688-58bf-8962-13cef64097de",
        //         "instant_exchange": false,
        //         "details": { title: 'Transferred Bitcoin', subtitle: "From GDAX" }
        //     }
        //
        // deposit transaction from coinbasepro to coinbase
        //
        //     {
        //         "id": "8d6dd0b9-3416-568a-889d-8f112fae9e81",
        //         "type": "pro_withdrawal",
        //         "status": "completed",
        //         "amount": { amount: "0.40555386", currency: "BTC" },
        //         "native_amount": { amount: "1140.27", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2019-03-04T19:41:58Z",
        //         "updated_at": "2019-03-04T19:41:58Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/8d6dd0b9-3416-568a-889d-8f112fae9e81",
        //         "instant_exchange": false,
        //         "application": {
        //             "id": "5756ab6e-836b-553b-8950-5e389451225d",
        //             "resource": "application",
        //             "resource_path": "/v2/applications/5756ab6e-836b-553b-8950-5e389451225d"
        //         },
        //         "details": { title: 'Transferred Bitcoin', subtitle: "From Coinbase Pro" }
        //     }
        //
        // sell trade
        //
        //     {
        //         "id": "a9409207-df64-585b-97ab-a50780d2149e",
        //         "type": "sell",
        //         "status": "completed",
        //         "amount": { amount: "-9.09922880", currency: "BTC" },
        //         "native_amount": { amount: "-7285.73", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2017-03-27T15:38:34Z",
        //         "updated_at": "2017-03-27T15:38:34Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/a9409207-df64-585b-97ab-a50780d2149e",
        //         "instant_exchange": false,
        //         "sell": {
        //             "id": "e3550b4d-8ae6-5de3-95fe-1fb01ba83051",
        //             "resource": "sell",
        //             "resource_path": "/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/sells/e3550b4d-8ae6-5de3-95fe-1fb01ba83051"
        //         },
        //         "details": {
        //             "title": "Sold Bitcoin",
        //             "subtitle": "Using EUR Wallet",
        //             "payment_method_name": "EUR Wallet"
        //         }
        //     }
        //
        // buy trade
        //
        //     {
        //         "id": "63eeed67-9396-5912-86e9-73c4f10fe147",
        //         "type": "buy",
        //         "status": "completed",
        //         "amount": { amount: "2.39605772", currency: "ETH" },
        //         "native_amount": { amount: "98.31", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2017-03-27T09:07:56Z",
        //         "updated_at": "2017-03-27T09:07:57Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/8902f85d-4a69-5d74-82fe-8e390201bda7/transactions/63eeed67-9396-5912-86e9-73c4f10fe147",
        //         "instant_exchange": false,
        //         "buy": {
        //             "id": "20b25b36-76c6-5353-aa57-b06a29a39d82",
        //             "resource": "buy",
        //             "resource_path": "/v2/accounts/8902f85d-4a69-5d74-82fe-8e390201bda7/buys/20b25b36-76c6-5353-aa57-b06a29a39d82"
        //         },
        //         "details": {
        //             "title": "Bought Ethereum",
        //             "subtitle": "Using EUR Wallet",
        //             "payment_method_name": "EUR Wallet"
        //         }
        //     }
        //
        // fiat deposit transaction
        //
        //     {
        //         "id": "04ed4113-3732-5b0c-af86-b1d2146977d0",
        //         "type": "fiat_deposit",
        //         "status": "completed",
        //         "amount": { amount: "114.02", currency: "EUR" },
        //         "native_amount": { amount: "97.23", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2017-02-09T07:01:21Z",
        //         "updated_at": "2017-02-09T07:01:22Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/04ed4113-3732-5b0c-af86-b1d2146977d0",
        //         "instant_exchange": false,
        //         "fiat_deposit": {
        //             "id": "f34c19f3-b730-5e3d-9f72-96520448677a",
        //             "resource": "fiat_deposit",
        //             "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/deposits/f34c19f3-b730-5e3d-9f72-96520448677a"
        //         },
        //         "details": {
        //             "title": "Deposited funds",
        //             "subtitle": "From SEPA Transfer (GB47 BARC 20..., reference CBADVI)",
        //             "payment_method_name": "SEPA Transfer (GB47 BARC 20..., reference CBADVI)"
        //         }
        //     }
        //
        // fiat withdrawal transaction
        //
        //     {
        //         "id": "957d98e2-f80e-5e2f-a28e-02945aa93079",
        //         "type": "fiat_withdrawal",
        //         "status": "completed",
        //         "amount": { amount: "-11000.00", currency: "EUR" },
        //         "native_amount": { amount: "-9698.22", currency: "GBP" },
        //         "description": null,
        //         "created_at": "2017-12-06T13:19:19Z",
        //         "updated_at": "2017-12-06T13:19:19Z",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/957d98e2-f80e-5e2f-a28e-02945aa93079",
        //         "instant_exchange": false,
        //         "fiat_withdrawal": {
        //             "id": "f4bf1fd9-ab3b-5de7-906d-ed3e23f7a4e7",
        //             "resource": "fiat_withdrawal",
        //             "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/withdrawals/f4bf1fd9-ab3b-5de7-906d-ed3e23f7a4e7"
        //         },
        //         "details": {
        //             "title": "Withdrew funds",
        //             "subtitle": "To HSBC BANK PLC (GB74 MIDL...)",
        //             "payment_method_name": "HSBC BANK PLC (GB74 MIDL...)"
        //         }
        //     }
        //
        const amountInfo = this.safeDict(item, 'amount', {});
        let amount = this.safeString(amountInfo, 'amount');
        let direction = undefined;
        if (Precise["default"].stringLt(amount, '0')) {
            direction = 'out';
            amount = Precise["default"].stringNeg(amount);
        }
        else {
            direction = 'in';
        }
        const currencyId = this.safeString(amountInfo, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        //
        // the address and txid do not belong to the unified ledger structure
        //
        //     let address = undefined;
        //     if (item['to']) {
        //         address = this.safeString (item['to'], 'address');
        //     }
        //     let txid = undefined;
        //
        let fee = undefined;
        const networkInfo = this.safeDict(item, 'network', {});
        // txid = network['hash']; // txid does not belong to the unified ledger structure
        const feeInfo = this.safeDict(networkInfo, 'transaction_fee');
        if (feeInfo !== undefined) {
            const feeCurrencyId = this.safeString(feeInfo, 'currency');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId, currency);
            const feeAmount = this.safeNumber(feeInfo, 'amount');
            fee = {
                'cost': feeAmount,
                'currency': feeCurrencyCode,
            };
        }
        const timestamp = this.parse8601(this.safeString(item, 'created_at'));
        const id = this.safeString(item, 'id');
        const type = this.parseLedgerEntryType(this.safeString(item, 'type'));
        const status = this.parseLedgerEntryStatus(this.safeString(item, 'status'));
        const path = this.safeString(item, 'resource_path');
        let accountId = undefined;
        if (path !== undefined) {
            const parts = path.split('/');
            const numParts = parts.length;
            if (numParts > 3) {
                accountId = parts[3];
            }
        }
        return this.safeLedgerEntry({
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': accountId,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': this.parseNumber(amount),
            'before': undefined,
            'after': undefined,
            'status': status,
            'fee': fee,
        }, currency);
    }
    async findAccountId(code, params = {}) {
        await this.loadMarkets();
        await this.loadAccounts(false, params);
        for (let i = 0; i < this.accounts.length; i++) {
            const account = this.accounts[i];
            if (account['code'] === code) {
                return account['id'];
            }
        }
        return undefined;
    }
    prepareAccountRequest(limit = undefined, params = {}) {
        const accountId = this.safeString2(params, 'account_id', 'accountId');
        if (accountId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' prepareAccountRequest() method requires an account_id (or accountId) parameter');
        }
        const request = {
            'account_id': accountId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        return request;
    }
    async prepareAccountRequestWithCurrencyCode(code = undefined, limit = undefined, params = {}) {
        let accountId = this.safeString2(params, 'account_id', 'accountId');
        params = this.omit(params, ['account_id', 'accountId']);
        if (accountId === undefined) {
            if (code === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' prepareAccountRequestWithCurrencyCode() method requires an account_id (or accountId) parameter OR a currency code argument');
            }
            accountId = await this.findAccountId(code, params);
            if (accountId === undefined) {
                throw new errors.ExchangeError(this.id + ' prepareAccountRequestWithCurrencyCode() could not find account id for ' + code);
            }
        }
        const request = {
            'account_id': accountId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        return [request, params];
    }
    /**
     * @method
     * @name coinbase#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder(symbol, 'market', 'buy', cost, undefined, params);
    }
    /**
     * @method
     * @name coinbase#createOrder
     * @description create a trade order
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] price to trigger stop orders
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'GTD' or 'PO', 'FOK'
     * @param {string} [params.stop_direction] 'UNKNOWN_STOP_DIRECTION', 'STOP_DIRECTION_STOP_UP', 'STOP_DIRECTION_STOP_DOWN' the direction the stopPrice is triggered from
     * @param {string} [params.end_time] '2023-05-25T17:01:05.092Z' for 'GTD' orders
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {boolean} [params.preview] default to false, wether to use the test/preview endpoint or not
     * @param {float} [params.leverage] default to 1, the leverage to use for the order
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.retail_portfolio_id] portfolio uid
     * @param {boolean} [params.is_max] Used in conjunction with tradable_balance to indicate the user wants to use their entire tradable balance
     * @param {string} [params.tradable_balance] amount of tradable balance
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const id = this.safeString(this.options, 'brokerId', 'ccxt');
        let request = {
            'client_order_id': id + '-' + this.uuid(),
            'product_id': market['id'],
            'side': side.toUpperCase(),
        };
        const triggerPrice = this.safeNumberN(params, ['stopPrice', 'stop_price', 'triggerPrice']);
        const stopLossPrice = this.safeNumber(params, 'stopLossPrice');
        const takeProfitPrice = this.safeNumber(params, 'takeProfitPrice');
        const isStop = triggerPrice !== undefined;
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const timeInForce = this.safeString(params, 'timeInForce');
        const postOnly = (timeInForce === 'PO') ? true : this.safeBool2(params, 'postOnly', 'post_only', false);
        const endTime = this.safeString(params, 'end_time');
        let stopDirection = this.safeString(params, 'stop_direction');
        if (type === 'limit') {
            if (isStop) {
                if (stopDirection === undefined) {
                    stopDirection = (side === 'buy') ? 'STOP_DIRECTION_STOP_DOWN' : 'STOP_DIRECTION_STOP_UP';
                }
                if ((timeInForce === 'GTD') || (endTime !== undefined)) {
                    if (endTime === undefined) {
                        throw new errors.ExchangeError(this.id + ' createOrder() requires an end_time parameter for a GTD order');
                    }
                    request['order_configuration'] = {
                        'stop_limit_stop_limit_gtd': {
                            'base_size': this.amountToPrecision(symbol, amount),
                            'limit_price': this.priceToPrecision(symbol, price),
                            'stop_price': this.priceToPrecision(symbol, triggerPrice),
                            'stop_direction': stopDirection,
                            'end_time': endTime,
                        },
                    };
                }
                else {
                    request['order_configuration'] = {
                        'stop_limit_stop_limit_gtc': {
                            'base_size': this.amountToPrecision(symbol, amount),
                            'limit_price': this.priceToPrecision(symbol, price),
                            'stop_price': this.priceToPrecision(symbol, triggerPrice),
                            'stop_direction': stopDirection,
                        },
                    };
                }
            }
            else if (isStopLoss || isTakeProfit) {
                let tpslPrice = undefined;
                if (isStopLoss) {
                    if (stopDirection === undefined) {
                        stopDirection = (side === 'buy') ? 'STOP_DIRECTION_STOP_UP' : 'STOP_DIRECTION_STOP_DOWN';
                    }
                    tpslPrice = this.priceToPrecision(symbol, stopLossPrice);
                }
                else {
                    if (stopDirection === undefined) {
                        stopDirection = (side === 'buy') ? 'STOP_DIRECTION_STOP_DOWN' : 'STOP_DIRECTION_STOP_UP';
                    }
                    tpslPrice = this.priceToPrecision(symbol, takeProfitPrice);
                }
                request['order_configuration'] = {
                    'stop_limit_stop_limit_gtc': {
                        'base_size': this.amountToPrecision(symbol, amount),
                        'limit_price': this.priceToPrecision(symbol, price),
                        'stop_price': tpslPrice,
                        'stop_direction': stopDirection,
                    },
                };
            }
            else {
                if ((timeInForce === 'GTD') || (endTime !== undefined)) {
                    if (endTime === undefined) {
                        throw new errors.ExchangeError(this.id + ' createOrder() requires an end_time parameter for a GTD order');
                    }
                    request['order_configuration'] = {
                        'limit_limit_gtd': {
                            'base_size': this.amountToPrecision(symbol, amount),
                            'limit_price': this.priceToPrecision(symbol, price),
                            'end_time': endTime,
                            'post_only': postOnly,
                        },
                    };
                }
                else if (timeInForce === 'IOC') {
                    request['order_configuration'] = {
                        'sor_limit_ioc': {
                            'base_size': this.amountToPrecision(symbol, amount),
                            'limit_price': this.priceToPrecision(symbol, price),
                        },
                    };
                }
                else if (timeInForce === 'FOK') {
                    request['order_configuration'] = {
                        'limit_limit_fok': {
                            'base_size': this.amountToPrecision(symbol, amount),
                            'limit_price': this.priceToPrecision(symbol, price),
                        },
                    };
                }
                else {
                    request['order_configuration'] = {
                        'limit_limit_gtc': {
                            'base_size': this.amountToPrecision(symbol, amount),
                            'limit_price': this.priceToPrecision(symbol, price),
                            'post_only': postOnly,
                        },
                    };
                }
            }
        }
        else {
            if (isStop || isStopLoss || isTakeProfit) {
                throw new errors.NotSupported(this.id + ' createOrder() only stop limit orders are supported');
            }
            if (market['spot'] && (side === 'buy')) {
                let total = undefined;
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber(params, 'cost');
                params = this.omit(params, 'cost');
                if (cost !== undefined) {
                    total = this.costToPrecision(symbol, cost);
                }
                else if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const costRequest = Precise["default"].stringMul(amountString, priceString);
                        total = this.costToPrecision(symbol, costRequest);
                    }
                }
                else {
                    total = this.costToPrecision(symbol, amount);
                }
                request['order_configuration'] = {
                    'market_market_ioc': {
                        'quote_size': total,
                    },
                };
            }
            else {
                request['order_configuration'] = {
                    'market_market_ioc': {
                        'base_size': this.amountToPrecision(symbol, amount),
                    },
                };
            }
        }
        const marginMode = this.safeString(params, 'marginMode');
        if (marginMode !== undefined) {
            if (marginMode === 'isolated') {
                request['margin_type'] = 'ISOLATED';
            }
            else if (marginMode === 'cross') {
                request['margin_type'] = 'CROSS';
            }
        }
        params = this.omit(params, ['timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'stopPrice', 'stop_price', 'stopDirection', 'stop_direction', 'clientOrderId', 'postOnly', 'post_only', 'end_time', 'marginMode']);
        const preview = this.safeBool2(params, 'preview', 'test', false);
        let response = undefined;
        if (preview) {
            params = this.omit(params, ['preview', 'test']);
            request = this.omit(request, 'client_order_id');
            response = await this.v3PrivatePostBrokerageOrdersPreview(this.extend(request, params));
        }
        else {
            response = await this.v3PrivatePostBrokerageOrders(this.extend(request, params));
        }
        //
        // successful order
        //
        //     {
        //         "success": true,
        //         "failure_reason": "UNKNOWN_FAILURE_REASON",
        //         "order_id": "52cfe5e2-0b29-4c19-a245-a6a773de5030",
        //         "success_response": {
        //             "order_id": "52cfe5e2-0b29-4c19-a245-a6a773de5030",
        //             "product_id": "LTC-BTC",
        //             "side": "SELL",
        //             "client_order_id": "4d760580-6fca-4094-a70b-ebcca8626288"
        //         },
        //         "order_configuration": null
        //     }
        //
        // failed order
        //
        //     {
        //         "success": false,
        //         "failure_reason": "UNKNOWN_FAILURE_REASON",
        //         "order_id": "",
        //         "error_response": {
        //             "error": "UNSUPPORTED_ORDER_CONFIGURATION",
        //             "message": "source is not enabled for trading",
        //             "error_details": "",
        //             "new_order_failure_reason": "UNSUPPORTED_ORDER_CONFIGURATION"
        //         },
        //         "order_configuration": {
        //             "limit_limit_gtc": {
        //                 "base_size": "100",
        //                 "limit_price": "40000",
        //                 "post_only": false
        //             }
        //         }
        //     }
        //
        const success = this.safeBool(response, 'success');
        if (success !== true) {
            const errorResponse = this.safeDict(response, 'error_response');
            const errorTitle = this.safeString(errorResponse, 'error');
            const errorMessage = this.safeString(errorResponse, 'message');
            if (errorResponse !== undefined) {
                this.throwExactlyMatchedException(this.exceptions['exact'], errorTitle, errorMessage);
                this.throwBroadlyMatchedException(this.exceptions['broad'], errorTitle, errorMessage);
                throw new errors.ExchangeError(errorMessage);
            }
        }
        const data = this.safeDict(response, 'success_response', {});
        return this.parseOrder(data, market);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "order_id": "52cfe5e2-0b29-4c19-a245-a6a773de5030",
        //         "product_id": "LTC-BTC",
        //         "side": "SELL",
        //         "client_order_id": "4d760580-6fca-4094-a70b-ebcca8626288"
        //     }
        //
        // cancelOrder, cancelOrders
        //
        //     {
        //         "success": true,
        //         "failure_reason": "UNKNOWN_CANCEL_FAILURE_REASON",
        //         "order_id": "bb8851a3-4fda-4a2c-aa06-9048db0e0f0d"
        //     }
        //
        // fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //         "order_id": "9bc1eb3b-5b46-4b71-9628-ae2ed0cca75b",
        //         "product_id": "LTC-BTC",
        //         "user_id": "1111111-1111-1111-1111-111111111111",
        //         "order_configuration": {
        //             "limit_limit_gtc": {
        //                 "base_size": "0.2",
        //                 "limit_price": "0.006",
        //                 "post_only": false
        //             },
        //             "stop_limit_stop_limit_gtc": {
        //                 "base_size": "48.54",
        //                 "limit_price": "6.998",
        //                 "stop_price": "7.0687",
        //                 "stop_direction": "STOP_DIRECTION_STOP_DOWN"
        //             }
        //         },
        //         "side": "SELL",
        //         "client_order_id": "e5fe8482-05bb-428f-ad4d-dbc8ce39239c",
        //         "status": "OPEN",
        //         "time_in_force": "GOOD_UNTIL_CANCELLED",
        //         "created_time": "2023-01-16T23:37:23.947030Z",
        //         "completion_percentage": "0",
        //         "filled_size": "0",
        //         "average_filled_price": "0",
        //         "fee": "",
        //         "number_of_fills": "0",
        //         "filled_value": "0",
        //         "pending_cancel": false,
        //         "size_in_quote": false,
        //         "total_fees": "0",
        //         "size_inclusive_of_fees": false,
        //         "total_value_after_fees": "0",
        //         "trigger_status": "INVALID_ORDER_TYPE",
        //         "order_type": "LIMIT",
        //         "reject_reason": "REJECT_REASON_UNSPECIFIED",
        //         "settled": false,
        //         "product_type": "SPOT",
        //         "reject_message": "",
        //         "cancel_message": ""
        //     }
        //
        const marketId = this.safeString(order, 'product_id');
        const symbol = this.safeSymbol(marketId, market, '-');
        if (symbol !== undefined) {
            market = this.safeMarket(symbol, market);
        }
        const orderConfiguration = this.safeDict(order, 'order_configuration', {});
        const limitGTC = this.safeDict(orderConfiguration, 'limit_limit_gtc');
        const limitGTD = this.safeDict(orderConfiguration, 'limit_limit_gtd');
        const limitIOC = this.safeDict(orderConfiguration, 'sor_limit_ioc');
        const stopLimitGTC = this.safeDict(orderConfiguration, 'stop_limit_stop_limit_gtc');
        const stopLimitGTD = this.safeDict(orderConfiguration, 'stop_limit_stop_limit_gtd');
        const marketIOC = this.safeDict(orderConfiguration, 'market_market_ioc');
        const isLimit = ((limitGTC !== undefined) || (limitGTD !== undefined) || (limitIOC !== undefined));
        const isStop = ((stopLimitGTC !== undefined) || (stopLimitGTD !== undefined));
        let price = undefined;
        let amount = undefined;
        let postOnly = undefined;
        let triggerPrice = undefined;
        if (isLimit) {
            let target = undefined;
            if (limitGTC !== undefined) {
                target = limitGTC;
            }
            else if (limitGTD !== undefined) {
                target = limitGTD;
            }
            else {
                target = limitIOC;
            }
            price = this.safeString(target, 'limit_price');
            amount = this.safeString(target, 'base_size');
            postOnly = this.safeBool(target, 'post_only');
        }
        else if (isStop) {
            const stopTarget = (stopLimitGTC !== undefined) ? stopLimitGTC : stopLimitGTD;
            price = this.safeString(stopTarget, 'limit_price');
            amount = this.safeString(stopTarget, 'base_size');
            postOnly = this.safeBool(stopTarget, 'post_only');
            triggerPrice = this.safeString(stopTarget, 'stop_price');
        }
        else {
            amount = this.safeString(marketIOC, 'base_size');
        }
        const datetime = this.safeString(order, 'created_time');
        const totalFees = this.safeString(order, 'total_fees');
        let currencyFee = undefined;
        if ((totalFees !== undefined) && (market !== undefined)) {
            currencyFee = market['quote'];
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'order_id'),
            'clientOrderId': this.safeString(order, 'client_order_id'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.parseOrderType(this.safeString(order, 'order_type')),
            'timeInForce': this.parseTimeInForce(this.safeString(order, 'time_in_force')),
            'postOnly': postOnly,
            'side': this.safeStringLower(order, 'side'),
            'price': price,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'filled': this.safeString(order, 'filled_size'),
            'remaining': undefined,
            'cost': undefined,
            'average': this.safeString(order, 'average_filled_price'),
            'status': this.parseOrderStatus(this.safeString(order, 'status')),
            'fee': {
                'cost': this.safeString(order, 'total_fees'),
                'currency': currencyFee,
            },
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'OPEN': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'EXPIRED': 'canceled',
            'FAILED': 'canceled',
            'UNKNOWN_ORDER_STATUS': undefined,
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(type) {
        if (type === 'UNKNOWN_ORDER_TYPE') {
            return undefined;
        }
        const types = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'STOP': 'limit',
            'STOP_LIMIT': 'limit',
        };
        return this.safeString(types, type, type);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'GOOD_UNTIL_CANCELLED': 'GTC',
            'GOOD_UNTIL_DATE_TIME': 'GTD',
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
            'UNKNOWN_TIME_IN_FORCE': undefined,
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    /**
     * @method
     * @name coinbase#cancelOrder
     * @description cancels an open order
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders
     * @param {string} id order id
     * @param {string} symbol not used by coinbase cancelOrder()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const orders = await this.cancelOrders([id], symbol, params);
        return this.safeDict(orders, 0, {});
    }
    /**
     * @method
     * @name coinbase#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders
     * @param {string[]} ids order ids
     * @param {string} symbol not used by coinbase cancelOrders()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'order_ids': ids,
        };
        const response = await this.v3PrivatePostBrokerageOrdersBatchCancel(this.extend(request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "success": true,
        //                 "failure_reason": "UNKNOWN_CANCEL_FAILURE_REASON",
        //                 "order_id": "bb8851a3-4fda-4a2c-aa06-9048db0e0f0d"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList(response, 'results', []);
        for (let i = 0; i < orders.length; i++) {
            const success = this.safeBool(orders[i], 'success');
            if (success !== true) {
                throw new errors.BadRequest(this.id + ' cancelOrders() has failed, check your arguments and parameters');
            }
        }
        return this.parseOrders(orders, market);
    }
    /**
     * @method
     * @name coinbase#editOrder
     * @description edit a trade order
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_editorder
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.preview] default to false, wether to use the test/preview endpoint or not
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'order_id': id,
        };
        if (amount !== undefined) {
            request['size'] = this.amountToPrecision(symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const preview = this.safeBool2(params, 'preview', 'test', false);
        let response = undefined;
        if (preview) {
            params = this.omit(params, ['preview', 'test']);
            response = await this.v3PrivatePostBrokerageOrdersEditPreview(this.extend(request, params));
        }
        else {
            response = await this.v3PrivatePostBrokerageOrdersEdit(this.extend(request, params));
        }
        //
        //     {
        //         "success": true,
        //         "errors": {
        //           "edit_failure_reason": "UNKNOWN_EDIT_ORDER_FAILURE_REASON",
        //           "preview_failure_reason": "UNKNOWN_PREVIEW_FAILURE_REASON"
        //         }
        //     }
        //
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name coinbase#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorder
     * @param {string} id the order id
     * @param {string} symbol unified market symbol that the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'order_id': id,
        };
        const response = await this.v3PrivateGetBrokerageOrdersHistoricalOrderId(this.extend(request, params));
        //
        //     {
        //         "order": {
        //             "order_id": "9bc1eb3b-5b46-4b71-9628-ae2ed0cca75b",
        //             "product_id": "LTC-BTC",
        //             "user_id": "1111111-1111-1111-1111-111111111111",
        //             "order_configuration": {
        //                 "limit_limit_gtc": {
        //                     "base_size": "0.2",
        //                     "limit_price": "0.006",
        //                     "post_only": false
        //                 }
        //             },
        //             "side": "SELL",
        //             "client_order_id": "e5fe8482-05bb-428f-ad4d-dbc8ce39239c",
        //             "status": "OPEN",
        //             "time_in_force": "GOOD_UNTIL_CANCELLED",
        //             "created_time": "2023-01-16T23:37:23.947030Z",
        //             "completion_percentage": "0",
        //             "filled_size": "0",
        //             "average_filled_price": "0",
        //             "fee": "",
        //             "number_of_fills": "0",
        //             "filled_value": "0",
        //             "pending_cancel": false,
        //             "size_in_quote": false,
        //             "total_fees": "0",
        //             "size_inclusive_of_fees": false,
        //             "total_value_after_fees": "0",
        //             "trigger_status": "INVALID_ORDER_TYPE",
        //             "order_type": "LIMIT",
        //             "reject_reason": "REJECT_REASON_UNSPECIFIED",
        //             "settled": false,
        //             "product_type": "SPOT",
        //             "reject_message": "",
        //             "cancel_message": ""
        //         }
        //     }
        //
        const order = this.safeDict(response, 'order', {});
        return this.parseOrder(order, market);
    }
    /**
     * @method
     * @name coinbase#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol that the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchOrders', symbol, since, limit, params, 'cursor', 'cursor', undefined, 1000);
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        if (market !== undefined) {
            request['product_id'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601(since);
        }
        const until = this.safeIntegerN(params, ['until']);
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_date'] = this.iso8601(until);
        }
        const response = await this.v3PrivateGetBrokerageOrdersHistoricalBatch(this.extend(request, params));
        //
        //     {
        //         "orders": [
        //             {
        //                 "order_id": "813a53c5-3e39-47bb-863d-2faf685d22d8",
        //                 "product_id": "BTC-USDT",
        //                 "user_id": "1111111-1111-1111-1111-111111111111",
        //                 "order_configuration": {
        //                     "market_market_ioc": {
        //                         "quote_size": "6.36"
        //                     }
        //                 },
        //                 "side": "BUY",
        //                 "client_order_id": "18eb9947-db49-4874-8e7b-39b8fe5f4317",
        //                 "status": "FILLED",
        //                 "time_in_force": "IMMEDIATE_OR_CANCEL",
        //                 "created_time": "2023-01-18T01:37:37.975552Z",
        //                 "completion_percentage": "100",
        //                 "filled_size": "0.000297920684505",
        //                 "average_filled_price": "21220.6399999973697697",
        //                 "fee": "",
        //                 "number_of_fills": "2",
        //                 "filled_value": "6.3220675944333996",
        //                 "pending_cancel": false,
        //                 "size_in_quote": true,
        //                 "total_fees": "0.0379324055666004",
        //                 "size_inclusive_of_fees": true,
        //                 "total_value_after_fees": "6.36",
        //                 "trigger_status": "INVALID_ORDER_TYPE",
        //                 "order_type": "MARKET",
        //                 "reject_reason": "REJECT_REASON_UNSPECIFIED",
        //                 "settled": true,
        //                 "product_type": "SPOT",
        //                 "reject_message": "",
        //                 "cancel_message": "Internal error"
        //             },
        //         ],
        //         "sequence": "0",
        //         "has_next": false,
        //         "cursor": ""
        //     }
        //
        const orders = this.safeList(response, 'orders', []);
        const first = this.safeDict(orders, 0);
        const cursor = this.safeString(response, 'cursor');
        if ((cursor !== undefined) && (cursor !== '')) {
            first['cursor'] = cursor;
            orders[0] = first;
        }
        return this.parseOrders(orders, market, since, limit);
    }
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'order_status': status,
        };
        if (market !== undefined) {
            request['product_id'] = market['id'];
        }
        if (limit === undefined) {
            limit = 100;
        }
        request['limit'] = limit;
        if (since !== undefined) {
            request['start_date'] = this.iso8601(since);
        }
        const until = this.safeIntegerN(params, ['until']);
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_date'] = this.iso8601(until);
        }
        const response = await this.v3PrivateGetBrokerageOrdersHistoricalBatch(this.extend(request, params));
        //
        //     {
        //         "orders": [
        //             {
        //                 "order_id": "813a53c5-3e39-47bb-863d-2faf685d22d8",
        //                 "product_id": "BTC-USDT",
        //                 "user_id": "1111111-1111-1111-1111-111111111111",
        //                 "order_configuration": {
        //                     "market_market_ioc": {
        //                         "quote_size": "6.36"
        //                     }
        //                 },
        //                 "side": "BUY",
        //                 "client_order_id": "18eb9947-db49-4874-8e7b-39b8fe5f4317",
        //                 "status": "FILLED",
        //                 "time_in_force": "IMMEDIATE_OR_CANCEL",
        //                 "created_time": "2023-01-18T01:37:37.975552Z",
        //                 "completion_percentage": "100",
        //                 "filled_size": "0.000297920684505",
        //                 "average_filled_price": "21220.6399999973697697",
        //                 "fee": "",
        //                 "number_of_fills": "2",
        //                 "filled_value": "6.3220675944333996",
        //                 "pending_cancel": false,
        //                 "size_in_quote": true,
        //                 "total_fees": "0.0379324055666004",
        //                 "size_inclusive_of_fees": true,
        //                 "total_value_after_fees": "6.36",
        //                 "trigger_status": "INVALID_ORDER_TYPE",
        //                 "order_type": "MARKET",
        //                 "reject_reason": "REJECT_REASON_UNSPECIFIED",
        //                 "settled": true,
        //                 "product_type": "SPOT",
        //                 "reject_message": "",
        //                 "cancel_message": "Internal error"
        //             },
        //         ],
        //         "sequence": "0",
        //         "has_next": false,
        //         "cursor": ""
        //     }
        //
        const orders = this.safeList(response, 'orders', []);
        const first = this.safeDict(orders, 0);
        const cursor = this.safeString(response, 'cursor');
        if ((cursor !== undefined) && (cursor !== '')) {
            first['cursor'] = cursor;
            orders[0] = first;
        }
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name coinbase#fetchOpenOrders
     * @description fetches information on all currently open orders
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchOpenOrders', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100);
        }
        return await this.fetchOrdersByStatus('OPEN', symbol, since, limit, params);
    }
    /**
     * @method
     * @name coinbase#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of closed order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchClosedOrders', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100);
        }
        return await this.fetchOrdersByStatus('FILLED', symbol, since, limit, params);
    }
    /**
     * @method
     * @name coinbase#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of canceled order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus('CANCELLED', symbol, since, limit, params);
    }
    /**
     * @method
     * @name coinbase#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpubliccandles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, not used by coinbase
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.usePrivate] default false, when true will use the private endpoint to fetch the candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const maxLimit = 300;
        limit = (limit === undefined) ? maxLimit : Math.min(limit, maxLimit);
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit - 1);
        }
        const market = this.market(symbol);
        const request = {
            'product_id': market['id'],
            'granularity': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const until = this.safeIntegerN(params, ['until', 'end']);
        params = this.omit(params, ['until']);
        const duration = this.parseTimeframe(timeframe);
        const requestedDuration = limit * duration;
        let sinceString = undefined;
        if (since !== undefined) {
            sinceString = this.numberToString(this.parseToInt(since / 1000));
        }
        else {
            const now = this.seconds().toString();
            sinceString = Precise["default"].stringSub(now, requestedDuration.toString());
        }
        request['start'] = sinceString;
        if (until !== undefined) {
            request['end'] = this.numberToString(this.parseToInt(until / 1000));
        }
        else {
            // 300 candles max
            request['end'] = Precise["default"].stringAdd(sinceString, requestedDuration.toString());
        }
        let response = undefined;
        let usePrivate = false;
        [usePrivate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'usePrivate', false);
        if (usePrivate) {
            response = await this.v3PrivateGetBrokerageProductsProductIdCandles(this.extend(request, params));
        }
        else {
            response = await this.v3PublicGetBrokerageMarketProductsProductIdCandles(this.extend(request, params));
        }
        //
        //     {
        //         "candles": [
        //             {
        //                 "start": "1673391780",
        //                 "low": "17414.36",
        //                 "high": "17417.99",
        //                 "open": "17417.74",
        //                 "close": "17417.38",
        //                 "volume": "1.87780853"
        //             },
        //         ]
        //     }
        //
        const candles = this.safeList(response, 'candles', []);
        return this.parseOHLCVs(candles, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         {
        //             "start": "1673391780",
        //             "low": "17414.36",
        //             "high": "17417.99",
        //             "open": "17417.74",
        //             "close": "17417.38",
        //             "volume": "1.87780853"
        //         },
        //     ]
        //
        return [
            this.safeTimestamp(ohlcv, 'start'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    /**
     * @method
     * @name coinbase#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicmarkettrades
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] not used by coinbase fetchTrades
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] default false, when true will use the private endpoint to fetch the trades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['id'],
        };
        if (since !== undefined) {
            request['start'] = this.numberToString(this.parseToInt(since / 1000));
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        let until = undefined;
        [until, params] = this.handleOptionAndParams(params, 'fetchTrades', 'until');
        if (until !== undefined) {
            request['end'] = this.numberToString(this.parseToInt(until / 1000));
        }
        else if (since !== undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTrades() requires a `until` parameter when you use `since` argument');
        }
        let response = undefined;
        let usePrivate = false;
        [usePrivate, params] = this.handleOptionAndParams(params, 'fetchTrades', 'usePrivate', false);
        if (usePrivate) {
            response = await this.v3PrivateGetBrokerageProductsProductIdTicker(this.extend(request, params));
        }
        else {
            response = await this.v3PublicGetBrokerageMarketProductsProductIdTicker(this.extend(request, params));
        }
        //
        //     {
        //         "trades": [
        //             {
        //                 "trade_id": "10092327",
        //                 "product_id": "BTC-USDT",
        //                 "price": "17488.12",
        //                 "size": "0.0000623",
        //                 "time": "2023-01-11T00:52:37.557001Z",
        //                 "side": "BUY",
        //                 "bid": "",
        //                 "ask": ""
        //             },
        //         ]
        //     }
        //
        const trades = this.safeList(response, 'trades', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name coinbase#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfills
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchMyTrades', symbol, since, limit, params, 'cursor', 'cursor', undefined, 250);
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        if (market !== undefined) {
            request['product_id'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_sequence_timestamp'] = this.iso8601(since);
        }
        const until = this.safeIntegerN(params, ['until']);
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_sequence_timestamp'] = this.iso8601(until);
        }
        const response = await this.v3PrivateGetBrokerageOrdersHistoricalFills(this.extend(request, params));
        //
        //     {
        //         "fills": [
        //             {
        //                 "entry_id": "b88b82cc89e326a2778874795102cbafd08dd979a2a7a3c69603fc4c23c2e010",
        //                 "trade_id": "cdc39e45-bbd3-44ec-bf02-61742dfb16a1",
        //                 "order_id": "813a53c5-3e39-47bb-863d-2faf685d22d8",
        //                 "trade_time": "2023-01-18T01:37:38.091377090Z",
        //                 "trade_type": "FILL",
        //                 "price": "21220.64",
        //                 "size": "0.0046830664333996",
        //                 "commission": "0.0000280983986004",
        //                 "product_id": "BTC-USDT",
        //                 "sequence_timestamp": "2023-01-18T01:37:38.092520Z",
        //                 "liquidity_indicator": "UNKNOWN_LIQUIDITY_INDICATOR",
        //                 "size_in_quote": true,
        //                 "user_id": "1111111-1111-1111-1111-111111111111",
        //                 "side": "BUY"
        //             },
        //         ],
        //         "cursor": ""
        //     }
        //
        const trades = this.safeList(response, 'fills', []);
        const first = this.safeDict(trades, 0);
        const cursor = this.safeString(response, 'cursor');
        if ((cursor !== undefined) && (cursor !== '')) {
            first['cursor'] = cursor;
            trades[0] = first;
        }
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name coinbase#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicproductbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] default false, when true will use the private endpoint to fetch the order book
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let usePrivate = false;
        [usePrivate, params] = this.handleOptionAndParams(params, 'fetchOrderBook', 'usePrivate', false);
        if (usePrivate) {
            response = await this.v3PrivateGetBrokerageProductBook(this.extend(request, params));
        }
        else {
            response = await this.v3PublicGetBrokerageMarketProductBook(this.extend(request, params));
        }
        //
        //     {
        //         "pricebook": {
        //             "product_id": "BTC-USDT",
        //             "bids": [
        //                 {
        //                     "price": "30757.85",
        //                     "size": "0.115"
        //                 },
        //             ],
        //             "asks": [
        //                 {
        //                     "price": "30759.07",
        //                     "size": "0.04877659"
        //                 },
        //             ],
        //             "time": "2023-06-30T04:02:40.533606Z"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'pricebook', {});
        const time = this.safeString(data, 'time');
        const timestamp = this.parse8601(time);
        return this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
    }
    /**
     * @method
     * @name coinbase#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getbestbidask
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            request['product_ids'] = this.marketIds(symbols);
        }
        const response = await this.v3PrivateGetBrokerageBestBidAsk(this.extend(request, params));
        //
        //     {
        //         "pricebooks": [
        //             {
        //                 "product_id": "TRAC-EUR",
        //                 "bids": [
        //                     {
        //                         "price": "0.2384",
        //                         "size": "386.1"
        //                     }
        //                 ],
        //                 "asks": [
        //                     {
        //                         "price": "0.2406",
        //                         "size": "672"
        //                     }
        //                 ],
        //                 "time": "2023-06-30T07:15:24.656044Z"
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeList(response, 'pricebooks', []);
        return this.parseTickers(tickers, symbols);
    }
    /**
     * @method
     * @name coinbase#withdraw
     * @description make a withdrawal
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-transactions#send-money
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] an optional tag for the withdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        let accountId = this.safeString2(params, 'account_id', 'accountId');
        params = this.omit(params, ['account_id', 'accountId']);
        if (accountId === undefined) {
            if (code === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' withdraw() requires an account_id (or accountId) parameter OR a currency code argument');
            }
            accountId = await this.findAccountId(code, params);
            if (accountId === undefined) {
                throw new errors.ExchangeError(this.id + ' withdraw() could not find account id for ' + code);
            }
        }
        const request = {
            'account_id': accountId,
            'type': 'send',
            'to': address,
            'amount': amount,
            'currency': currency['id'],
        };
        if (tag !== undefined) {
            request['destination_tag'] = tag;
        }
        const response = await this.v2PrivatePostAccountsAccountIdTransactions(this.extend(request, params));
        //
        //     {
        //         "data": {
        //             "id": "a1794ecf-5693-55fa-70cf-ef731748ed82",
        //             "type": "send",
        //             "status": "pending",
        //             "amount": {
        //                 "amount": "-14.008308",
        //                 "currency": "USDC"
        //             },
        //             "native_amount": {
        //                 "amount": "-18.74",
        //                 "currency": "CAD"
        //             },
        //             "description": null,
        //             "created_at": "2024-01-12T01:27:31Z",
        //             "updated_at": "2024-01-12T01:27:31Z",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/a34bgfad-ed67-538b-bffc-730c98c10da0/transactions/a1794ecf-5693-55fa-70cf-ef731748ed82",
        //             "instant_exchange": false,
        //             "network": {
        //                 "status": "pending",
        //                 "status_description": "Pending (est. less than 10 minutes)",
        //                 "transaction_fee": {
        //                     "amount": "4.008308",
        //                     "currency": "USDC"
        //                 },
        //                 "transaction_amount": {
        //                     "amount": "10.000000",
        //                     "currency": "USDC"
        //                 },
        //                 "confirmations": 0
        //             },
        //             "to": {
        //                 "resource": "ethereum_address",
        //                 "address": "0x9...",
        //                 "currency": "USDC",
        //                 "address_info": {
        //                     "address": "0x9..."
        //                 }
        //             },
        //             "idem": "748d8591-dg9a-7831-a45b-crd61dg78762",
        //             "details": {
        //                 "title": "Sent USDC",
        //                 "subtitle": "To USDC address on Ethereum network",
        //                 "header": "Sent 14.008308 USDC ($18.74)",
        //                 "health": "warning"
        //             },
        //             "hide_native_amount": false
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    /**
     * @method
     * @name coinbase#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postcoinbaseaccountaddresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddressesByNetwork(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        let request = undefined;
        [request, params] = await this.prepareAccountRequestWithCurrencyCode(currency['code'], undefined, params);
        const response = await this.v2PrivateGetAccountsAccountIdAddresses(this.extend(request, params));
        //
        //    {
        //        pagination: {
        //            ending_before: null,
        //            starting_after: null,
        //            previous_ending_before: null,
        //            next_starting_after: null,
        //            limit: '25',
        //            order: 'desc',
        //            previous_uri: null,
        //            next_uri: null
        //        },
        //        data: [
        //            {
        //                id: '64ceb5f1-5fa2-5310-a4ff-9fd46271003d',
        //                address: '5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk',
        //                address_info: { address: '5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk' },
        //                name: null,
        //                created_at: '2023-05-29T21:12:12Z',
        //                updated_at: '2023-05-29T21:12:12Z',
        //                network: 'solana',
        //                uri_scheme: 'solana',
        //                resource: 'address',
        //                resource_path: '/v2/accounts/a7b3d387-bfb8-5ce7-b8da-1f507e81cf25/addresses/64ceb5f1-5fa2-5310-a4ff-9fd46271003d',
        //                warnings: [
        //                    {
        //                    type: 'correct_address_warning',
        //                    title: 'This is an ERC20 USDC address.',
        //                    details: 'Only send ERC20 USD Coin (USDC) to this address.',
        //                    image_url: 'https://www.coinbase.com/assets/addresses/global-receive-warning-a3d91807e61c717e5a38d270965003dcc025ca8a3cea40ec3d7835b7c86087fa.png',
        //                    options: [ { text: 'I understand', style: 'primary', id: 'dismiss' } ]
        //                    }
        //                ],
        //                qr_code_image_url: 'https://static-assets.coinbase.com/p2p/l2/asset_network_combinations/v5/usdc-solana.png',
        //                address_label: 'USDC address (Solana)',
        //                default_receive: true,
        //                deposit_uri: 'solana:5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk?spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        //                callback_url: null,
        //                share_address_copy: {
        //                    line1: '5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk',
        //                    line2: 'This address can only receive USDC-SPL from Solana network. Don’t send USDC from other networks, other SPL tokens or NFTs, or it may result in a loss of funds.'
        //                },
        //                receive_subtitle: 'ERC-20',
        //                inline_warning: {
        //                    text: 'This address can only receive USDC-SPL from Solana network. Don’t send USDC from other networks, other SPL tokens or NFTs, or it may result in a loss of funds.',
        //                    tooltip: {
        //                    title: 'USDC (Solana)',
        //                    subtitle: 'This address can only receive USDC-SPL from Solana network.'
        //                    }
        //                }
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const addressStructures = this.parseDepositAddresses(data, undefined, false);
        return this.indexBy(addressStructures, 'network');
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        id: '64ceb5f1-5fa2-5310-a4ff-9fd46271003d',
        //        address: '5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk',
        //        address_info: {
        //            address: 'GCF74576I7AQ56SLMKBQAP255EGUOWCRVII3S44KEXVNJEOIFVBDMXVL',
        //            destination_tag: '3722061866'
        //        },
        //        name: null,
        //        created_at: '2023-05-29T21:12:12Z',
        //        updated_at: '2023-05-29T21:12:12Z',
        //        network: 'solana',
        //        uri_scheme: 'solana',
        //        resource: 'address',
        //        resource_path: '/v2/accounts/a7b3d387-bfb8-5ce7-b8da-1f507e81cf25/addresses/64ceb5f1-5fa2-5310-a4ff-9fd46271003d',
        //        warnings: [
        //            {
        //            type: 'correct_address_warning',
        //            title: 'This is an ERC20 USDC address.',
        //            details: 'Only send ERC20 USD Coin (USDC) to this address.',
        //            image_url: 'https://www.coinbase.com/assets/addresses/global-receive-warning-a3d91807e61c717e5a38d270965003dcc025ca8a3cea40ec3d7835b7c86087fa.png',
        //            options: [ { text: 'I understand', style: 'primary', id: 'dismiss' } ]
        //            }
        //        ],
        //        qr_code_image_url: 'https://static-assets.coinbase.com/p2p/l2/asset_network_combinations/v5/usdc-solana.png',
        //        address_label: 'USDC address (Solana)',
        //        default_receive: true,
        //        deposit_uri: 'solana:5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk?spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        //        callback_url: null,
        //        share_address_copy: {
        //            line1: '5xjPKeAXpnhA2kHyinvdVeui6RXVdEa3B2J3SCAwiKnk',
        //            line2: 'This address can only receive USDC-SPL from Solana network. Don’t send USDC from other networks, other SPL tokens or NFTs, or it may result in a loss of funds.'
        //        },
        //        receive_subtitle: 'ERC-20',
        //        inline_warning: {
        //            text: 'This address can only receive USDC-SPL from Solana network. Don’t send USDC from other networks, other SPL tokens or NFTs, or it may result in a loss of funds.',
        //            tooltip: {
        //            title: 'USDC (Solana)',
        //            subtitle: 'This address can only receive USDC-SPL from Solana network.'
        //            }
        //        }
        //    }
        //
        const address = this.safeString(depositAddress, 'address');
        this.checkAddress(address);
        const networkId = this.safeString(depositAddress, 'network');
        const code = this.safeCurrencyCode(undefined, currency);
        const addressLabel = this.safeString(depositAddress, 'address_label');
        let currencyId = undefined;
        if (addressLabel !== undefined) {
            const splitAddressLabel = addressLabel.split(' ');
            currencyId = this.safeString(splitAddressLabel, 0);
        }
        const addressInfo = this.safeDict(depositAddress, 'address_info');
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode(currencyId, currency),
            'network': this.networkIdToCode(networkId, code),
            'address': address,
            'tag': this.safeString(addressInfo, 'destination_tag'),
        };
    }
    /**
     * @method
     * @name coinbase#deposit
     * @description make a deposit
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-deposits#deposit-funds
     * @param {string} code unified currency code
     * @param {float} amount the amount to deposit
     * @param {string} id the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the id of the account to deposit into
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async deposit(code, amount, id, params = {}) {
        await this.loadMarkets();
        let accountId = this.safeString2(params, 'account_id', 'accountId');
        params = this.omit(params, ['account_id', 'accountId']);
        if (accountId === undefined) {
            if (code === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' deposit() requires an account_id (or accountId) parameter OR a currency code argument');
            }
            accountId = await this.findAccountId(code, params);
            if (accountId === undefined) {
                throw new errors.ExchangeError(this.id + ' deposit() could not find account id for ' + code);
            }
        }
        const request = {
            'account_id': accountId,
            'amount': this.numberToString(amount),
            'currency': code.toUpperCase(),
            'payment_method': id,
        };
        const response = await this.v2PrivatePostAccountsAccountIdDeposits(this.extend(request, params));
        //
        //     {
        //         "data": {
        //             "id": "67e0eaec-07d7-54c4-a72c-2e92826897df",
        //             "status": "created",
        //             "payment_method": {
        //                 "id": "83562370-3e5c-51db-87da-752af5ab9559",
        //                 "resource": "payment_method",
        //                 "resource_path": "/v2/payment-methods/83562370-3e5c-51db-87da-752af5ab9559"
        //             },
        //             "transaction": {
        //                 "id": "441b9494-b3f0-5b98-b9b0-4d82c21c252a",
        //                 "resource": "transaction",
        //                 "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/transactions/441b9494-b3f0-5b98-b9b0-4d82c21c252a"
        //             },
        //             "amount": {
        //                 "amount": "10.00",
        //                 "currency": "USD"
        //             },
        //             "subtotal": {
        //                 "amount": "10.00",
        //                 "currency": "USD"
        //             },
        //             "created_at": "2015-01-31T20:49:02Z",
        //             "updated_at": "2015-02-11T16:54:02-08:00",
        //             "resource": "deposit",
        //             "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/deposits/67e0eaec-07d7-54c4-a72c-2e92826897df",
        //             "committed": true,
        //             "fee": {
        //                 "amount": "0.00",
        //                 "currency": "USD"
        //             },
        //             "payout_at": "2015-02-18T16:54:00-08:00"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data);
    }
    /**
     * @method
     * @name coinbase#fetchDeposit
     * @description fetch information on a deposit, fiat only, for crypto transactions use fetchLedger
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-deposits#show-deposit
     * @param {string} id deposit id
     * @param {string} [code] unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the id of the account that the funds were deposited into
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposit(id, code = undefined, params = {}) {
        await this.loadMarkets();
        let accountId = this.safeString2(params, 'account_id', 'accountId');
        params = this.omit(params, ['account_id', 'accountId']);
        if (accountId === undefined) {
            if (code === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchDeposit() requires an account_id (or accountId) parameter OR a currency code argument');
            }
            accountId = await this.findAccountId(code, params);
            if (accountId === undefined) {
                throw new errors.ExchangeError(this.id + ' fetchDeposit() could not find account id for ' + code);
            }
        }
        const request = {
            'account_id': accountId,
            'deposit_id': id,
        };
        const response = await this.v2PrivateGetAccountsAccountIdDepositsDepositId(this.extend(request, params));
        //
        //     {
        //         "data": {
        //             "id": "67e0eaec-07d7-54c4-a72c-2e92826897df",
        //             "status": "completed",
        //             "payment_method": {
        //                 "id": "83562370-3e5c-51db-87da-752af5ab9559",
        //                 "resource": "payment_method",
        //                 "resource_path": "/v2/payment-methods/83562370-3e5c-51db-87da-752af5ab9559"
        //             },
        //             "transaction": {
        //                 "id": "441b9494-b3f0-5b98-b9b0-4d82c21c252a",
        //                 "resource": "transaction",
        //                 "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/transactions/441b9494-b3f0-5b98-b9b0-4d82c21c252a"
        //             },
        //             "amount": {
        //                 "amount": "10.00",
        //                 "currency": "USD"
        //             },
        //             "subtotal": {
        //                 "amount": "10.00",
        //                 "currency": "USD"
        //             },
        //             "created_at": "2015-01-31T20:49:02Z",
        //             "updated_at": "2015-02-11T16:54:02-08:00",
        //             "resource": "deposit",
        //             "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/deposits/67e0eaec-07d7-54c4-a72c-2e92826897df",
        //             "committed": true,
        //             "fee": {
        //                 "amount": "0.00",
        //                 "currency": "USD"
        //             },
        //             "payout_at": "2015-02-18T16:54:00-08:00"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data);
    }
    /**
     * @method
     * @name coinbase#fetchDepositMethodIds
     * @description fetch the deposit id for a fiat currency associated with this account
     * @see https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethods
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [deposit id structures]{@link https://docs.ccxt.com/#/?id=deposit-id-structure}
     */
    async fetchDepositMethodIds(params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetBrokeragePaymentMethods(params);
        //
        //     {
        //         "payment_methods": [
        //             {
        //                 "id": "21b39a5d-f7b46876fb2e",
        //                 "type": "COINBASE_FIAT_ACCOUNT",
        //                 "name": "CAD Wallet",
        //                 "currency": "CAD",
        //                 "verified": true,
        //                 "allow_buy": false,
        //                 "allow_sell": true,
        //                 "allow_deposit": false,
        //                 "allow_withdraw": false,
        //                 "created_at": "2023-06-29T19:58:46Z",
        //                 "updated_at": "2023-10-30T20:25:01Z"
        //             }
        //         ]
        //     }
        //
        const result = this.safeList(response, 'payment_methods', []);
        return this.parseDepositMethodIds(result);
    }
    /**
     * @method
     * @name coinbase#fetchDepositMethodId
     * @description fetch the deposit id for a fiat currency associated with this account
     * @see https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethod
     * @param {string} id the deposit payment method id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [deposit id structure]{@link https://docs.ccxt.com/#/?id=deposit-id-structure}
     */
    async fetchDepositMethodId(id, params = {}) {
        await this.loadMarkets();
        const request = {
            'payment_method_id': id,
        };
        const response = await this.v3PrivateGetBrokeragePaymentMethodsPaymentMethodId(this.extend(request, params));
        //
        //     {
        //         "payment_method": {
        //             "id": "21b39a5d-f7b46876fb2e",
        //             "type": "COINBASE_FIAT_ACCOUNT",
        //             "name": "CAD Wallet",
        //             "currency": "CAD",
        //             "verified": true,
        //             "allow_buy": false,
        //             "allow_sell": true,
        //             "allow_deposit": false,
        //             "allow_withdraw": false,
        //             "created_at": "2023-06-29T19:58:46Z",
        //             "updated_at": "2023-10-30T20:25:01Z"
        //         }
        //     }
        //
        const result = this.safeDict(response, 'payment_method', {});
        return this.parseDepositMethodId(result);
    }
    parseDepositMethodIds(ids, params = {}) {
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = this.extend(this.parseDepositMethodId(ids[i]), params);
            result.push(id);
        }
        return result;
    }
    parseDepositMethodId(depositId) {
        return {
            'info': depositId,
            'id': this.safeString(depositId, 'id'),
            'currency': this.safeString(depositId, 'currency'),
            'verified': this.safeBool(depositId, 'verified'),
            'tag': this.safeString(depositId, 'name'),
        };
    }
    /**
     * @method
     * @name coinbase#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_createconvertquote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.trade_incentive_metadata] an object to fill in user incentive data
     * @param {string} [params.trade_incentive_metadata.user_incentive_id] the id of the incentive
     * @param {string} [params.trade_incentive_metadata.code_val] the code value of the incentive
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertQuote(fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'from_account': fromCode,
            'to_account': toCode,
            'amount': this.numberToString(amount),
        };
        const response = await this.v3PrivatePostBrokerageConvertQuote(this.extend(request, params));
        const data = this.safeDict(response, 'trade', {});
        return this.parseConversion(data);
    }
    /**
     * @method
     * @name coinbase#createConvertTrade
     * @description convert from one currency to another
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_commitconverttrade
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async createConvertTrade(id, fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'trade_id': id,
            'from_account': fromCode,
            'to_account': toCode,
        };
        const response = await this.v3PrivatePostBrokerageConvertTradeTradeId(this.extend(request, params));
        const data = this.safeDict(response, 'trade', {});
        return this.parseConversion(data);
    }
    /**
     * @method
     * @name coinbase#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getconverttrade
     * @param {string} id the id of the trade that you want to commit
     * @param {string} code the unified currency code that was converted from
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {strng} params.toCode the unified currency code that was converted into
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTrade(id, code = undefined, params = {}) {
        await this.loadMarkets();
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchConvertTrade() requires a code argument');
        }
        const toCode = this.safeString(params, 'toCode');
        if (toCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchConvertTrade() requires a toCode parameter');
        }
        params = this.omit(params, 'toCode');
        const request = {
            'trade_id': id,
            'from_account': code,
            'to_account': toCode,
        };
        const response = await this.v3PrivateGetBrokerageConvertTradeTradeId(this.extend(request, params));
        const data = this.safeDict(response, 'trade', {});
        return this.parseConversion(data);
    }
    parseConversion(conversion, fromCurrency = undefined, toCurrency = undefined) {
        const fromCoin = this.safeString(conversion, 'source_currency');
        const fromCode = this.safeCurrencyCode(fromCoin, fromCurrency);
        const to = this.safeString(conversion, 'target_currency');
        const toCode = this.safeCurrencyCode(to, toCurrency);
        const fromAmountStructure = this.safeDict(conversion, 'user_entered_amount');
        const feeStructure = this.safeDict(conversion, 'total_fee');
        const feeAmountStructure = this.safeDict(feeStructure, 'amount');
        return {
            'info': conversion,
            'timestamp': undefined,
            'datetime': undefined,
            'id': this.safeString(conversion, 'id'),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber(fromAmountStructure, 'value'),
            'toCurrency': toCode,
            'toAmount': undefined,
            'price': undefined,
            'fee': this.safeNumber(feeAmountStructure, 'value'),
        };
    }
    /**
     * @method
     * @name coinbase#closePosition
     * @description *futures only* closes open positions for a market
     * @see https://coinbase-api.github.io/docs/#/en-us/swapV2/trade-api.html#One-Click%20Close%20All%20Positions
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by coinbase
     * @param {object} [params] extra parameters specific to the coinbase api endpoint
     * @param {string}  params.clientOrderId *mandatory* the client order id of the position to close
     * @param {float} [params.size] the size of the position to close, optional
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition(symbol, side = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['future']) {
            throw new errors.NotSupported(this.id + ' closePosition() only supported for futures markets');
        }
        const clientOrderId = this.safeString2(params, 'client_order_id', 'clientOrderId');
        params = this.omit(params, 'clientOrderId');
        const request = {
            'product_id': market['id'],
        };
        if (clientOrderId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' closePosition() requires a clientOrderId parameter');
        }
        request['client_order_id'] = clientOrderId;
        const response = await this.v3PrivatePostBrokerageOrdersClosePosition(this.extend(request, params));
        const order = this.safeDict(response, 'success_response', {});
        return this.parseOrder(order);
    }
    /**
     * @method
     * @name coinbase#fetchPositions
     * @description fetch all open positions
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmpositions
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxpositions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.portfolio] the portfolio UUID to fetch positions for
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let market = undefined;
        if (symbols !== undefined) {
            market = this.market(symbols[0]);
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchPositions', market, params);
        let response = undefined;
        if (type === 'future') {
            response = await this.v3PrivateGetBrokerageCfmPositions(params);
        }
        else {
            let portfolio = undefined;
            [portfolio, params] = this.handleOptionAndParams(params, 'fetchPositions', 'portfolio');
            if (portfolio === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositions() requires a "portfolio" value in params (eg: dbcb91e7-2bc9-515), or set as exchange.options["portfolio"]. You can get a list of portfolios with fetchPortfolios()');
            }
            const request = {
                'portfolio_uuid': portfolio,
            };
            response = await this.v3PrivateGetBrokerageIntxPositionsPortfolioUuid(this.extend(request, params));
        }
        const positions = this.safeList(response, 'positions', []);
        return this.parsePositions(positions, symbols);
    }
    /**
     * @method
     * @name coinbase#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxposition
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmposition
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.product_id] *futures only* the product id of the position to fetch, required for futures markets only
     * @param {string} [params.portfolio] *perpetual/swaps only* the portfolio UUID to fetch the position for, required for perpetual/swaps markets only
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let response = undefined;
        if (market['future']) {
            const productId = this.safeString(market, 'product_id');
            if (productId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPosition() requires a "product_id" in params');
            }
            const futureRequest = {
                'product_id': productId,
            };
            response = await this.v3PrivateGetBrokerageCfmPositionsProductId(this.extend(futureRequest, params));
        }
        else {
            let portfolio = undefined;
            [portfolio, params] = this.handleOptionAndParams(params, 'fetchPositions', 'portfolio');
            if (portfolio === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPosition() requires a "portfolio" value in params (eg: dbcb91e7-2bc9-515), or set as exchange.options["portfolio"]. You can get a list of portfolios with fetchPortfolios()');
            }
            const request = {
                'symbol': market['id'],
                'portfolio_uuid': portfolio,
            };
            response = await this.v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol(this.extend(request, params));
        }
        const position = this.safeDict(response, 'position', {});
        return this.parsePosition(position, market);
    }
    parsePosition(position, market = undefined) {
        //
        // {
        //     "product_id": "1r4njf84-0-0",
        //     "product_uuid": "cd34c18b-3665-4ed8-9305-3db277c49fc5",
        //     "symbol": "ADA-PERP-INTX",
        //     "vwap": {
        //        "value": "0.6171",
        //        "currency": "USDC"
        //     },
        //     "position_side": "POSITION_SIDE_LONG",
        //     "net_size": "20",
        //     "buy_order_size": "0",
        //     "sell_order_size": "0",
        //     "im_contribution": "0.1",
        //     "unrealized_pnl": {
        //        "value": "0.074",
        //        "currency": "USDC"
        //     },
        //     "mark_price": {
        //        "value": "0.6208",
        //        "currency": "USDC"
        //     },
        //     "liquidation_price": {
        //        "value": "0",
        //        "currency": "USDC"
        //     },
        //     "leverage": "1",
        //     "im_notional": {
        //        "value": "12.342",
        //        "currency": "USDC"
        //     },
        //     "mm_notional": {
        //        "value": "0.814572",
        //        "currency": "USDC"
        //     },
        //     "position_notional": {
        //        "value": "12.342",
        //        "currency": "USDC"
        //     },
        //     "margin_type": "MARGIN_TYPE_CROSS",
        //     "liquidation_buffer": "19.677828",
        //     "liquidation_percentage": "4689.3506",
        //     "portfolio_summary": {
        //        "portfolio_uuid": "018ebd63-1f6d-7c8e-ada9-0761c5a2235f",
        //        "collateral": "20.4184",
        //        "position_notional": "12.342",
        //        "open_position_notional": "12.342",
        //        "pending_fees": "0",
        //        "borrow": "0",
        //        "accrued_interest": "0",
        //        "rolling_debt": "0",
        //        "portfolio_initial_margin": "0.1",
        //        "portfolio_im_notional": {
        //           "value": "12.342",
        //           "currency": "USDC"
        //        },
        //        "portfolio_maintenance_margin": "0.066",
        //        "portfolio_mm_notional": {
        //           "value": "0.814572",
        //           "currency": "USDC"
        //        },
        //        "liquidation_percentage": "4689.3506",
        //        "liquidation_buffer": "19.677828",
        //        "margin_type": "MARGIN_TYPE_CROSS",
        //        "margin_flags": "PORTFOLIO_MARGIN_FLAGS_UNSPECIFIED",
        //        "liquidation_status": "PORTFOLIO_LIQUIDATION_STATUS_NOT_LIQUIDATING",
        //        "unrealized_pnl": {
        //           "value": "0.074",
        //           "currency": "USDC"
        //        },
        //        "buying_power": {
        //           "value": "8.1504",
        //           "currency": "USDC"
        //        },
        //        "total_balance": {
        //           "value": "20.4924",
        //           "currency": "USDC"
        //        },
        //        "max_withdrawal": {
        //           "value": "8.0764",
        //           "currency": "USDC"
        //        }
        //     },
        //     "entry_vwap": {
        //        "value": "0.6091",
        //        "currency": "USDC"
        //     }
        // }
        //
        const marketId = this.safeString(position, 'symbol', '');
        market = this.safeMarket(marketId, market);
        const rawMargin = this.safeString(position, 'margin_type');
        let marginMode = undefined;
        if (rawMargin !== undefined) {
            marginMode = (rawMargin === 'MARGIN_TYPE_CROSS') ? 'cross' : 'isolated';
        }
        const notionalObject = this.safeDict(position, 'position_notional', {});
        const positionSide = this.safeString(position, 'position_side');
        const side = (positionSide === 'POSITION_SIDE_LONG') ? 'long' : 'short';
        const unrealizedPNLObject = this.safeDict(position, 'unrealized_pnl', {});
        const liquidationPriceObject = this.safeDict(position, 'liquidation_price', {});
        const liquidationPrice = this.safeNumber(liquidationPriceObject, 'value');
        const vwapObject = this.safeDict(position, 'vwap', {});
        const summaryObject = this.safeDict(position, 'portfolio_summary', {});
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'product_id'),
            'symbol': this.safeSymbol(marketId, market),
            'notional': this.safeNumber(notionalObject, 'value'),
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.safeNumber(vwapObject, 'value'),
            'unrealizedPnl': this.safeNumber(unrealizedPNLObject, 'value'),
            'realizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.safeNumber(position, 'net_size'),
            'contractSize': market['contractSize'],
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': this.safeNumber(summaryObject, 'collateral'),
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber(position, 'leverage'),
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name coinbase#fetchTradingFees
     * @see https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_gettransactionsummary/
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap'
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTradingFees', undefined, params);
        const isSpot = (type === 'spot');
        const productType = isSpot ? 'SPOT' : 'FUTURE';
        const request = {
            'product_type': productType,
        };
        const response = await this.v3PrivateGetBrokerageTransactionSummary(this.extend(request, params));
        //
        // {
        //     total_volume: '0',
        //     total_fees: '0',
        //     fee_tier: {
        //       pricing_tier: 'Advanced 1',
        //       usd_from: '0',
        //       usd_to: '1000',
        //       taker_fee_rate: '0.008',
        //       maker_fee_rate: '0.006',
        //       aop_from: '',
        //       aop_to: ''
        //     },
        //     margin_rate: null,
        //     goods_and_services_tax: null,
        //     advanced_trade_only_volume: '0',
        //     advanced_trade_only_fees: '0',
        //     coinbase_pro_volume: '0',
        //     coinbase_pro_fees: '0',
        //     total_balance: '',
        //     has_promo_fee: false
        // }
        //
        const data = this.safeDict(response, 'fee_tier', {});
        const taker_fee = this.safeNumber(data, 'taker_fee_rate');
        const marker_fee = this.safeNumber(data, 'maker_fee_rate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market(symbol);
            if ((isSpot && market['spot']) || (!isSpot && !market['spot'])) {
                result[symbol] = {
                    'info': response,
                    'symbol': symbol,
                    'maker': taker_fee,
                    'taker': marker_fee,
                    'percentage': true,
                };
            }
        }
        return result;
    }
    createAuthToken(seconds, method = undefined, url = undefined) {
        // it may not work for v2
        let uri = undefined;
        if (url !== undefined) {
            uri = method + ' ' + url.replace('https://', '');
            const quesPos = uri.indexOf('?');
            // Due to we use mb_strpos, quesPos could be false in php. In that case, the quesPos >= 0 is true
            // Also it's not possible that the question mark is first character, only check > 0 here.
            if (quesPos > 0) {
                uri = uri.slice(0, quesPos);
            }
        }
        const nonce = this.randomBytes(16);
        const request = {
            'aud': ['retail_rest_api_proxy'],
            'iss': 'coinbase-cloud',
            'nbf': seconds,
            'exp': seconds + 120,
            'sub': this.apiKey,
            'iat': seconds,
        };
        if (uri !== undefined) {
            request['uri'] = uri;
        }
        const token = rsa.jwt(request, this.encode(this.secret), sha256.sha256, false, { 'kid': this.apiKey, 'nonce': nonce, 'alg': 'ES256' });
        return token;
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    sign(path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        const signed = api[1] === 'private';
        const isV3 = version === 'v3';
        const pathPart = (isV3) ? 'api/v3' : 'v2';
        let fullPath = '/' + pathPart + '/' + this.implodeParams(path, params);
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
                const seconds = this.seconds();
                let payload = '';
                if (method !== 'GET') {
                    if (Object.keys(query).length) {
                        body = this.json(query);
                        payload = body;
                    }
                }
                else {
                    if (!isV3) {
                        if (Object.keys(query).length) {
                            payload += '?' + this.urlencode(query);
                        }
                    }
                }
                // v3: 'GET' doesn't need payload in the signature. inside url is enough
                // https://docs.cloud.coinbase.com/advanced-trade/docs/auth#example-request
                // v2: 'GET' require payload in the signature
                // https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-key-authentication
                const isCloudAPiKey = (this.apiKey.indexOf('organizations/') >= 0) || (this.secret.startsWith('-----BEGIN'));
                if (isCloudAPiKey) {
                    if (this.apiKey.startsWith('-----BEGIN')) {
                        throw new errors.ArgumentsRequired(this.id + ' apiKey should contain the name (eg: organizations/3b910e93....) and not the public key');
                    }
                    // // it may not work for v2
                    // let uri = method + ' ' + url.replace ('https://', '');
                    // const quesPos = uri.indexOf ('?');
                    // // Due to we use mb_strpos, quesPos could be false in php. In that case, the quesPos >= 0 is true
                    // // Also it's not possible that the question mark is first character, only check > 0 here.
                    // if (quesPos > 0) {
                    //     uri = uri.slice (0, quesPos);
                    // }
                    // const nonce = this.randomBytes (16);
                    // const request: Dict = {
                    //     'aud': [ 'retail_rest_api_proxy' ],
                    //     'iss': 'coinbase-cloud',
                    //     'nbf': seconds,
                    //     'exp': seconds + 120,
                    //     'sub': this.apiKey,
                    //     'uri': uri,
                    //     'iat': seconds,
                    // };
                    const token = this.createAuthToken(seconds, method, url);
                    // const token = jwt (request, this.encode (this.secret), sha256, false, { 'kid': this.apiKey, 'nonce': nonce, 'alg': 'ES256' });
                    authorizationString = 'Bearer ' + token;
                }
                else {
                    const nonce = this.nonce();
                    const timestamp = this.parseToInt(nonce / 1000);
                    const timestampString = timestamp.toString();
                    const auth = timestampString + method + savedPath + payload;
                    const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
                    headers = {
                        'CB-ACCESS-KEY': this.apiKey,
                        'CB-ACCESS-SIGN': signature,
                        'CB-ACCESS-TIMESTAMP': timestampString,
                        'Content-Type': 'application/json',
                    };
                }
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
        //    {"error": "invalid_request", "error_description": "The request is missing a required parameter, includes an unsupported parameter value, or is otherwise malformed."}
        //
        // or
        //
        //    {
        //      "errors": [
        //        {
        //          "id": "not_found",
        //          "message": "Not found"
        //        }
        //      ]
        //    }
        // or
        //   {
        //       "error": "UNKNOWN_FAILURE_REASON",
        //       "message": "",
        //       "error_details": "",
        //       "preview_failure_reason": "PREVIEW_STOP_PRICE_BELOW_LAST_TRADE_PRICE"
        //   }
        //
        let errorCode = this.safeString(response, 'error');
        if (errorCode !== undefined) {
            const errorMessage = this.safeString2(response, 'error_description', 'preview_failure_reason');
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], errorMessage, feedback);
            throw new errors.ExchangeError(feedback);
        }
        const errors$1 = this.safeList(response, 'errors');
        if (errors$1 !== undefined) {
            if (Array.isArray(errors$1)) {
                const numErrors = errors$1.length;
                if (numErrors > 0) {
                    errorCode = this.safeString(errors$1[0], 'id');
                    const errorMessage = this.safeString(errors$1[0], 'message');
                    if (errorCode !== undefined) {
                        this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                        this.throwBroadlyMatchedException(this.exceptions['broad'], errorMessage, feedback);
                        throw new errors.ExchangeError(feedback);
                    }
                }
            }
        }
        const advancedTrade = this.options['advanced'];
        if (!('data' in response) && (!advancedTrade)) {
            throw new errors.ExchangeError(this.id + ' failed due to a malformed response ' + this.json(response));
        }
        return undefined;
    }
}

module.exports = coinbase;
