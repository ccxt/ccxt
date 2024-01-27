'use strict';

var kuna$1 = require('./abstract/kuna.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');
var Precise = require('./base/Precise.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class kuna
 * @augments Exchange
 * @description Use the public-key as your apiKey
 */
class kuna extends kuna$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': ['UA'],
            'rateLimit': 1000,
            'version': 'v4',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': true,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL3OrderBook': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrdersByStatus': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': undefined,
            'urls': {
                'extension': '.json',
                'referral': 'https://kuna.io?r=kunaid-gvfihe8az7o4',
                'logo': 'https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg',
                'api': {
                    'xreserve': 'https://api.xreserve.fund',
                    'v3': 'https://api.kuna.io',
                    'v4': 'https://api.kuna.io',
                    'public': 'https://kuna.io',
                    'private': 'https://kuna.io', // v2
                },
                'www': 'https://kuna.io',
                'doc': 'https://kuna.io/documents/api',
                'fees': 'https://kuna.io/documents/api',
            },
            'api': {
                'xreserve': {
                    'get': {
                        'nonce': 1,
                        'fee': 1,
                        'delegated-transactions': 1,
                    },
                    'post': {
                        'delegate-transfer': 1,
                    },
                },
                'v4': {
                    'private': {
                        'get': {
                            'private/me': 1,
                            'private/getBalance': 1,
                            'order/private/active': 1,
                            'order/private/history': 1,
                            'order/private/{id}/trades': 1,
                            'order/private/details/{id}': 1,
                            'trade/private/history': 1,
                            'transaction/private/{hash}': 1,
                            'deposit/private/preRequest': 1,
                            'deposit/private/crypto/address': 1,
                            'deposit/private/crypto/getMerchantAddress': 1,
                            'deposit/private/history': 1,
                            'deposit/private/details/{depositId}': 1,
                            'withdraw/private/preRequest': 1,
                            'withdraw/private/history': 1,
                            'withdraw/private/details/{withdrawId}': 1,
                            'kuna-code/{id}': 1,
                            'kuna-code/{code}/check': 1,
                            'kuna-code/issued-by-me': 1,
                            'kuna-code/redeemed-by-me': 1,
                        },
                        'post': {
                            'order/private/create': 1,
                            'order/private/cancel': 1,
                            'order/private/cancel/multi': 1,
                            'deposit/private/crypto/generateAddress': 1,
                            'deposit/private/crypto/generateMerchantAddress': 1,
                            'withdraw/private/create': 1,
                            'kuna-code': 1,
                        },
                        'put': {
                            'kuna-code/redeem': 1,
                        },
                    },
                    'public': {
                        'get': {
                            'public/timestamp': 1,
                            'public/fees': 1,
                            'public/currencies?type={type}': 1,
                            'public/currencies': 1,
                            'markets/public/getAll': 1,
                            'markets/public/tickers?pairs={pairs}': 1,
                            'order/public/book/{pairs}': 1,
                            'trade/public/book/{pairs}': 1,
                        },
                    },
                },
                'v3': {
                    'public': {
                        'get': {
                            'timestamp': 1,
                            'currencies': 1,
                            'markets': 1,
                            'tickers': 1,
                            'k': 1,
                            'trades_history': 1,
                            'fees': 1,
                            'exchange-rates': 1,
                            'exchange-rates/currency': 1,
                            'book/market': 1,
                            'kuna_codes/code/check': 1,
                            'landing_page_statistic': 1,
                            'translations/locale': 1,
                            'trades/market/hist': 1,
                        },
                        'post': {
                            'http_test': 1,
                            'deposit_channels': 1,
                            'withdraw_channels': 1,
                            'subscription_plans': 1,
                            'send_to': 1,
                            'confirm_token': 1,
                            'kunaid': 1,
                            'withdraw/prerequest': 1,
                            'deposit/prerequest': 1,
                            'deposit/exchange-rates': 1,
                        },
                    },
                    'sign': {
                        'get': {
                            'reset_password/token': 1,
                        },
                        'post': {
                            'signup/google': 1,
                            'signup/resend_confirmation': 1,
                            'signup': 1,
                            'signin': 1,
                            'signin/two_factor': 1,
                            'signin/resend_confirm_device': 1,
                            'signin/confirm_device': 1,
                            'reset_password': 1,
                            'cool-signin': 1,
                        },
                        'put': {
                            'reset_password/token': 1,
                            'signup/code/confirm': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'auth/w/order/submit': 1,
                            'auth/r/orders': 1,
                            'auth/r/orders/market': 1,
                            'auth/r/orders/markets': 1,
                            'auth/api_tokens/delete': 1,
                            'auth/api_tokens/create': 1,
                            'auth/api_tokens': 1,
                            'auth/signin_history/uniq': 1,
                            'auth/signin_history': 1,
                            'auth/disable_withdraw_confirmation': 1,
                            'auth/change_password': 1,
                            'auth/deposit_address': 1,
                            'auth/announcements/accept': 1,
                            'auth/announcements/unaccepted': 1,
                            'auth/otp/deactivate': 1,
                            'auth/otp/activate': 1,
                            'auth/otp/secret': 1,
                            'auth/r/order/market/:order_id/trades': 1,
                            'auth/r/orders/market/hist': 1,
                            'auth/r/orders/hist': 1,
                            'auth/r/orders/hist/markets': 1,
                            'auth/r/orders/details': 1,
                            'auth/assets-history': 1,
                            'auth/assets-history/withdraws': 1,
                            'auth/assets-history/deposits': 1,
                            'auth/r/wallets': 1,
                            'auth/markets/favorites': 1,
                            'auth/markets/favorites/list': 1,
                            'auth/me/update': 1,
                            'auth/me': 1,
                            'auth/fund_sources': 1,
                            'auth/fund_sources/list': 1,
                            'auth/withdraw/resend_confirmation': 1,
                            'auth/withdraw': 1,
                            'auth/withdraw/details': 1,
                            'auth/withdraw/info': 1,
                            'auth/payment_addresses': 1,
                            'auth/deposit/prerequest': 1,
                            'auth/deposit/exchange-rates': 1,
                            'auth/deposit': 1,
                            'auth/deposit/details': 1,
                            'auth/deposit/info': 1,
                            'auth/kuna_codes/count': 1,
                            'auth/kuna_codes/details': 1,
                            'auth/kuna_codes/edit': 1,
                            'auth/kuna_codes/send-pdf': 1,
                            'auth/kuna_codes': 1,
                            'auth/kuna_codes/redeemed-by-me': 1,
                            'auth/kuna_codes/issued-by-me': 1,
                            'auth/payment_requests/invoice': 1,
                            'auth/payment_requests/type': 1,
                            'auth/referral_program/weekly_earnings': 1,
                            'auth/referral_program/stats': 1,
                            'auth/merchant/payout_services': 1,
                            'auth/merchant/withdraw': 1,
                            'auth/merchant/payment_services': 1,
                            'auth/merchant/deposit': 1,
                            'auth/verification/auth_token': 1,
                            'auth/kunaid_purchase/create': 1,
                            'auth/devices/list': 1,
                            'auth/sessions/list': 1,
                            'auth/subscriptions/reactivate': 1,
                            'auth/subscriptions/cancel': 1,
                            'auth/subscriptions/prolong': 1,
                            'auth/subscriptions/create': 1,
                            'auth/subscriptions/list': 1,
                            'auth/kuna_ids/list': 1,
                            'order/cancel/multi': 1,
                            'order/cancel': 1,
                        },
                        'put': {
                            'auth/fund_sources/id': 1,
                            'auth/kuna_codes/redeem': 1,
                        },
                        'delete': {
                            'auth/markets/favorites': 1,
                            'auth/fund_sources': 1,
                            'auth/devices': 1,
                            'auth/devices/list': 1,
                            'auth/sessions/list': 1,
                            'auth/sessions': 1,
                        },
                    },
                },
                'public': {
                    'get': [
                        'depth',
                        'k_with_pending_trades',
                        'k',
                        'markets',
                        'order_book',
                        'order_book/{market}',
                        'tickers',
                        'tickers/{market}',
                        'timestamp',
                        'trades',
                        'trades/{market}',
                    ],
                },
                'private': {
                    'get': [
                        'members/me',
                        'deposits',
                        'deposit',
                        'deposit_address',
                        'orders',
                        'order',
                        'trades/my',
                        'withdraws',
                        'withdraw', // Get your cryptocurrency withdraw
                    ],
                    'post': [
                        'orders',
                        'orders/multi',
                        'orders/clear',
                        'order/delete',
                        'withdraw', // Create a withdraw
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.0025'),
                    'maker': this.parseNumber('0.0025'),
                },
                'funding': {
                    'withdraw': {
                        'UAH': '1%',
                        'BTC': 0.001,
                        'BCH': 0.001,
                        'ETH': 0.01,
                        'WAVES': 0.01,
                        'GOL': 0.0,
                        'GBG': 0.0,
                        // 'RMC': 0.001 BTC
                        // 'ARN': 0.01 ETH
                        // 'R': 0.01 ETH
                        // 'EVR': 0.01 ETH
                    },
                    'deposit': {
                    // 'UAH': (amount) => amount * 0.001 + 5
                    },
                },
            },
            'commonCurrencies': {
                'PLA': 'Plair',
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'ARGUMENT_VALIDATION_ERROR': errors.BadRequest,
                'PAYMENT_METHOD_NOT_SUPPORTED': errors.BadRequest,
                'NOT_FOUND': errors.OrderNotFound,
                'INVALID:ORDER_SIZE': errors.InvalidOrder,
                'WrongRequestException': errors.BadRequest,
                'INSUFFICIENT_FUNDS': errors.InsufficientFunds,
                '2002': errors.InsufficientFunds,
                '2003': errors.OrderNotFound,
            },
            'options': {
            // 'account': 'pro'      // Only for pro accounts
            },
        });
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name kuna#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.kuna.io/docs/get-time-on-the-server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v4PublicGetPublicTimestamp(params);
        //
        //    {
        //        "data": {
        //            "timestamp": 1686740531,
        //            "timestamp_miliseconds": 1686740531725,
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.safeInteger(data, 'timestamp_miliseconds');
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name kuna#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.kuna.io/docs/get-information-about-available-currencies
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.v4PublicGetPublicCurrencies(params);
        //
        //    {
        //        "data": [
        //            {
        //                "code": "BTC",
        //                "name": "Bitcoin",
        //                "payload": {
        //                    "chart": "https://kuna-pro.kuna.io/bitcoin-chart",
        //                    "icons": {
        //                        "svg": "https://kuna-pro.kuna.io/icon-btc-svg",
        //                        "png2x": "https://kuna-pro.kuna.io/icon-btc-png2x",
        //                        "png3x": "https://kuna-pro.kuna.io/icon-btc-png3x",
        //                        "svgXL": "https://kuna-pro.kuna.io/icon-btc-svg"
        //                    },
        //                    "pngChart": "https://kuna-pro.kuna.io/png-bitcoin-chart"
        //                },
        //                "position": 1,
        //                "precision": 8,
        //                "tradePrecision": 6,
        //                "type": "Crypto"
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseCurrencies(data);
    }
    parseCurrencies(currencies, params = {}) {
        currencies = this.toArray(currencies);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = this.parseCurrency(currencies[i]);
            result[currency['code']] = currency;
        }
        return result;
    }
    parseCurrency(currency) {
        //
        //    {
        //        "code": "BTC",
        //        "name": "Bitcoin",
        //        "payload": {
        //            "chart": "https://kuna-pro.kuna.io/bitcoin-chart",
        //            "icons": {
        //                "svg": "https://kuna-pro.kuna.io/icon-btc-svg",
        //                "png2x": "https://kuna-pro.kuna.io/icon-btc-png2x",
        //                "png3x": "https://kuna-pro.kuna.io/icon-btc-png3x",
        //                "svgXL": "https://kuna-pro.kuna.io/icon-btc-svg"
        //            },
        //            "pngChart": "https://kuna-pro.kuna.io/png-bitcoin-chart"
        //        },
        //        "position": 1,
        //        "precision": 8,
        //        "tradePrecision": 6,
        //        "type": "Crypto"
        //    }
        //
        const currencyId = this.safeString(currency, 'code');
        const precision = this.safeString(currency, 'precision');
        const tradePrecision = this.safeString(currency, 'tradePrecision');
        return {
            'info': currency,
            'id': currencyId,
            'code': this.safeCurrencyCode(currencyId),
            'type': undefined,
            'margin': undefined,
            'name': this.safeString(currency, 'name'),
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': Precise["default"].stringMin(precision, tradePrecision),
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'networks': {},
        };
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name kuna#fetchMarkets
         * @description retrieves data on all markets for kuna
         * @see https://docs.kuna.io/docs/get-all-traded-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.v4PublicGetMarketsPublicGetAll(params);
        //
        //    {
        //        "data": [
        //            {
        //                "pair": "BTC_USDT",               // Traded pair of assets
        //                "baseAsset": {                    // The base asset of the traded pair, the one to sell or buy as a result of the trade
        //                    "code": "BTC",
        //                    "precision": 6               // Maximum amount of digits for the decimal part of a number
        //                },
        //                "quoteAsset": {                   // The quoted asset of the traded pair, the one to use to sell or buy the base asset
        //                    "code": "USDT",
        //                    "precision": 2                // Maximum amount of digits for the decimal part of a number
        //                },
        //                "tickerPriceChange": "-0.07"      // Relative change compared with the last tick
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        const markets = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const marketId = this.safeString(item, 'pair');
            const baseAsset = this.safeValue(item, 'baseAsset');
            const quoteAsset = this.safeValue(item, 'quoteAsset');
            const baseId = this.safeString(baseAsset, 'code');
            const quoteId = this.safeString(quoteAsset, 'code');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const basePrecision = this.safeString(baseAsset, 'precision');
            const quotePrecision = this.safeString(quoteAsset, 'precision');
            markets.push({
                'id': marketId,
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
                    'amount': this.parseNumber(this.parsePrecision(basePrecision)),
                    'price': this.parseNumber(this.parsePrecision(quotePrecision)),
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
                'created': undefined,
                'info': item,
            });
        }
        return markets;
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.kuna.io/docs/get-public-orders-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] 5, 10, 20, 50, 100, 500, or 1000 (default)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pairs': market['id'],
        };
        if (limit !== undefined) {
            request['level'] = limit;
        }
        const response = await this.v4PublicGetOrderPublicBookPairs(this.extend(request, params));
        //
        //      {
        //          "data": {
        //              "asks": [               // An array of sell orders
        //                  [
        //                      "16950",        // Sell price, level 1
        //                      "0.001"         // Sell quantity, level 1
        //                  ],
        //                  [
        //                      "17000",        // Sell price, level 2
        //                      "0.01"          // Sell quantity, level 2
        //                  ]
        //              ],
        //              "bids": [               // An array of buy orders
        //                  [
        //                      "16700",        // Sell price, level 1
        //                      "0.01"          // Sell quantity, level 1
        //                  ],
        //                  [
        //                      "16000",        // Sell price, level 2
        //                      "0.001"         // Sell quantity, level 2
        //                  ]
        //              ]
        //          }
        //      }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseOrderBook(data, market['symbol'], undefined, 'bids', 'asks', 0, 1);
    }
    parseTicker(ticker, market = undefined) {
        //
        //    {
        //        "pair": "BTC_USDT",                                   // Traded pair
        //        "percentagePriceChange": "-0.03490931899641581",      // Relative price change, in percent
        //        "price": "27900",                                     // Current median price
        //        "equivalentPrice": "",                                // TBD
        //        "high": "29059.69",                                   // Highest price
        //        "low": "27900",                                       // Lowest price
        //        "baseVolume": "2.9008499999999993",                   // Traded volume as base
        //        "quoteVolume": "82251.41477976",                      // Traded volume as quote
        //        "bestBidPrice": "27926.91",                           // The best bid price now
        //        "bestAskPrice": "27970.02",                           // The best ask price now
        //        "priceChange": "-973.9700000000012"                   // Absolute price change
        //    }
        //
        const marketId = this.safeString(ticker, 'pair');
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeString(ticker, 'bestBidPrice'),
            'ask': this.safeString(ticker, 'bestAskPrice'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': this.safeString(ticker, 'priceChange'),
            'percentage': this.safeString(ticker, 'percentagePriceChange'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'baseVolume'),
            'quoteVolume': this.safeString(ticker, 'quoteVolume'),
        }, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market. The average is not returned in the response, but the median can be accessed via response['info']['price']
         * @see https://docs.kuna.io/docs/get-market-info-by-tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTickers () requires a symbols argument');
        }
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        const request = {
            'pairs': marketIds.join(','),
        };
        const response = await this.v4PublicGetMarketsPublicTickersPairsPairs(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "pair": "BTC_USDT",                                   // Traded pair
        //                "percentagePriceChange": "-0.03490931899641581",      // Relative price change, in percent
        //                "price": "27900",                                     // Current median price
        //                "equivalentPrice": "",                                // TBD
        //                "high": "29059.69",                                   // Highest price
        //                "low": "27900",                                       // Lowest price
        //                "baseVolume": "2.9008499999999993",                   // Traded volume as base
        //                "quoteVolume": "82251.41477976",                      // Traded volume as quote
        //                "bestBidPrice": "27926.91",                           // The best bid price now
        //                "bestAskPrice": "27970.02",                           // The best ask price now
        //                "priceChange": "-973.9700000000012"                   // Absolute price change
        //            }
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseTickers(data, symbols, params);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name kuna#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.kuna.io/docs/get-market-info-by-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pairs': market['id'],
        };
        const response = await this.v4PublicGetMarketsPublicTickersPairsPairs(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "pair": "BTC_USDT",                                   // Traded pair
        //                "percentagePriceChange": "-0.03490931899641581",      // Relative price change, in percent
        //                "price": "27900",                                     // Current median price
        //                "equivalentPrice": "",                                // TBD
        //                "high": "29059.69",                                   // Highest price
        //                "low": "27900",                                       // Lowest price
        //                "baseVolume": "2.9008499999999993",                   // Traded volume as base
        //                "quoteVolume": "82251.41477976",                      // Traded volume as quote
        //                "bestBidPrice": "27926.91",                           // The best bid price now
        //                "bestAskPrice": "27970.02",                           // The best ask price now
        //                "priceChange": "-973.9700000000012"                   // Absolute price change
        //            }
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        const ticker = this.safeValue(data, 0);
        return this.parseTicker(ticker, market);
    }
    async fetchL3OrderBook(symbol, limit = undefined, params = {}) {
        /**
         * TODO: double check
         * @method
         * @name kuna#fetchL3OrderBook
         * @description fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified market symbol
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
         */
        return await this.fetchOrderBook(symbol, limit, params);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.kuna.io/docs/get-public-trades-book
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] between 1 and 100, 25 by default
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v4PublicGetTradePublicBookPairs(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "3e5591ba-2778-4d85-8851-54284045ea44",       // Unique identifier of a trade
        //            "pair": "BTC_USDT",                                 // Market pair that is being traded
        //            "quoteQuantity": "11528.8118",                      // Qty of the quote asset, USDT in this example
        //            "matchPrice": "18649",                              // Exchange price at the moment of execution
        //            "matchQuantity": "0.6182",                          // Qty of the base asset, BTC in this example
        //            "createdAt": "2022-09-23T14:30:41.486Z",            // Date-time of trade execution, UTC
        //            "side": "Ask"                                       // Trade type: `Ask` or `Bid`. Bid for buying base asset, Ask for selling base asset (e.g. for BTC_USDT trading pair, BTC is the base asset).
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTrades(data, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //    {
        //        "id": "3e5591ba-2778-4d85-8851-54284045ea44",       // Unique identifier of a trade
        //        "pair": "BTC_USDT",                                 // Market pair that is being traded
        //        "quoteQuantity": "11528.8118",                      // Qty of the quote asset, USDT in this example
        //        "matchPrice": "18649",                              // Exchange price at the moment of execution
        //        "matchQuantity": "0.6182",                          // Qty of the base asset, BTC in this example
        //        "createdAt": "2022-09-23T14:30:41.486Z",            // Date-time of trade execution, UTC
        //        "side": "Ask"                                       // Trade type: `Ask` or `Bid`. Bid for buying base asset, Ask for selling base asset (e.g. for BTC_USDT trading pair, BTC is the base asset).
        //    }
        //
        // fetchMyTrades, fetchOrder (private)
        //
        //    {
        //        "id": "edb17459-c9bf-4148-9ae6-7367d7f55d71",        // Unique identifier of a trade
        //        "orderId": "a80bec3f-4ffa-45c1-9d78-f6301e9748fe",   // Unique identifier of an order associated with the trade
        //        "pair": "BTC_USDT",                                  // Traded pair, base asset first, followed by quoted asset
        //        "quantity": "1.5862",                                // Traded quantity of base asset
        //        "price": "19087",                                    // Price of the trade
        //        "isTaker": true,                                     // Various fees for Makers and Takers; "Market" orders are always `true`
        //        "fee": "0.0039655",                                  // Exchange commission fee
        //        "feeCurrency": "BTC",                                // Currency of the commission
        //        "isBuyer": true,                                     // Buy or sell the base asset
        //        "quoteQuantity": "30275.7994",                       // Quote asset quantity spent to fulfill the base amount
        //        "createdAt": "2022-09-29T13:43:53.824Z",             // Date-time of trade execution, UTC
        //    }
        //
        const datetime = this.safeString(trade, 'createdAt');
        const marketId = this.safeString(trade, 'pair');
        const isTaker = this.safeValue(trade, 'isMaker');
        let side = this.safeStringLower(trade, 'side');
        if (side === undefined) {
            const isBuyer = this.safeValue(trade, 'isBuyer');
            side = isBuyer ? 'buy' : 'sell';
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'id'),
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'type': undefined,
            'side': side,
            'order': this.safeString(trade, 'orderId'),
            'takerOrMaker': isTaker ? 'taker' : 'maker',
            'price': this.safeString2(trade, 'matchPrice', 'price'),
            'amount': this.safeString2(trade, 'matchQuantity', 'quantity'),
            'cost': this.safeString(trade, 'quoteQuantity'),
            'fee': {
                'cost': this.safeString(trade, 'fee'),
                'currency': this.safeCurrencyCode(this.safeString(trade, 'feeCurrency')),
                'rate': undefined,
            },
        }, market);
    }
    parseBalance(response) {
        //
        //    [
        //        {
        //            "currency": "UAH",
        //            "balance": "7134.6",
        //            "lockBalance": "100"
        //        }
        //        ...
        //    ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'balance');
            account['used'] = this.safeString(balance, 'lockBalance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name kuna#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const response = await this.v4PrivateGetPrivateGetBalance(params);
        //
        //    {
        //        "data": [{
        //            "currency": "UAH",                    // Wallet currency
        //            "balance": "7134.6",                  // Available balance, precision depends on the currency
        //            "lockBalance": "100"                  // Minimum amount locked on the balance
        //        }]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseBalance(data);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name kuna#createOrder
         * @description create a trade order
         * @see https://docs.kuna.io/docs/create-a-new-order-private
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.id] id must be a UUID format, if you do not specify id, it will be generated automatically.
         * @param {float} [params.quoteQuantity] the max quantity of the quote asset to use for selling/buying
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        params = this.omit(params, ['triggerPrice', 'stopPrice']);
        const capitalizedType = this.capitalize(type);
        const request = {
            'pair': market['id'],
            'orderSide': (side === 'buy') ? 'Bid' : 'Ask',
            'quantity': this.numberToString(amount),
            'type': capitalizedType,
        };
        if (capitalizedType === 'Limit') {
            request['price'] = this.priceToPrecision(market['symbol'], price);
        }
        if (triggerPrice !== undefined) {
            if (capitalizedType === 'Market') {
                throw new errors.BadRequest(this.id + ' createOrder () cannot place trigger market orders, or trigger limit');
            }
            request['stopPrice'] = this.priceToPrecision(market['symbol'], triggerPrice);
            if (capitalizedType !== 'TakeProfitLimit') {
                request['type'] = 'StopLossLimit';
            }
        }
        const response = await this.v4PrivatePostOrderPrivateCreate(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "b0fcb54c-2278-4f16-a300-02765faad8b0",     // ID  of your newly created order
        //            "type": "Limit",                                  // Type of an order
        //            "quantity": "0.06",                               // Original order quantity
        //            "executedQuantity": "0",                          // Traded quantity in stock (>0 if traded)
        //            "pair": "BTC_USDT",                               // Traded pair
        //            "price": "26440.46",                              // Price of the trade
        //            "status": "Open",                                 // The status of the order
        //            "createdAt": "2023-07-11T08:01:30.550Z",          // Date-time of order creation, UTC
        //            "updatedAt": "2023-07-11T08:01:30.550Z"           // Date-time of the last update of the order, UTC
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseOrder(data, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kuna#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
            'orderId': id,
        };
        const response = await this.v4PrivatePostOrderPrivateCancel(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "success": true
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const order = this.parseOrder(data, market);
        order['id'] = id;
        return order;
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kuna#cancelOrder
         * @description cancels an open order
         * @param {string} ids order ids
         * @param {string} symbol not used by kuna cancelOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
            'orderIds': ids,
        };
        const response = await this.v4PrivatePostOrderPrivateCancelMulti(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "c7fc5b2b-bd9d-48c1-a458-a83412669fe2",   // Unique identifier of a canceled order
        //                "success": true                                 // Status for this order
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseOrders(data);
    }
    parseOrderStatus(status) {
        const statuses = {
            'Canceled': 'canceled',
            'Closed': 'filled',
            'Pending': 'open',
            'Open': 'open',
            'done': 'closed',
            'wait': 'open',
            'cancel': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder, fetchOrder, fetchOpenOrders, fetchOrdersByStatus
        //
        //    {
        //        "id": "5992a049-8612-409d-8599-2c3d7298b106",     // Unique identifier of an order
        //        "type": "Limit",                                  // Type of an order
        //        "quantity": "5",                                  // Original order quantity
        //        "executedQuantity": "0",                          // Traded quantity in stock (>0 if traded)
        //        "cumulativeQuoteQty": "0",                        // *absent on createOrder* Traded quantity in money (>0 if traded)
        //        "cost": "0.05",                                   // Total amount
        //        "side": "Bid",                                    // *absent on createOrder* Bid for buying base asset, Ask for selling base asset. FYI: For BTC_USDT trading pair, BTC is the base asset
        //        "pair": "TRX_USDT",                               // Traded pair
        //        "price": "0.01",                                  // Price of the trade
        //        "status": "Open",                                 // The status of the order
        //        "createdAt": "2023-07-11T07:04:20.131Z",          // Date-time of order creation, UTC
        //        "updatedAt": "2023-07-11T07:04:20.131Z"           // Date-time of the last update of the order, UTC
        //        "closedAt": "2023-05-08T08:53:58.333Z"            // *absent on fetchOpenOrders/createOrder* Date-time of order finish time, UTC
        //        "trades": [                                       // * fetchOrder only *
        //            {
        //                "id": "15ff497c-8d25-4155-8184-bb1f905cce1e",              // Unique identifier of a trade
        //                "orderId": "4b9b9705-e85f-4180-bdec-219fbf025fa3",         // Unique identifier of an associated order
        //                "pair": "BTC_USDT",                                        // Traded pair
        //                "quantity": "0.00054",                                     // Traded quantity
        //                "price": "27770",                                          // Traded price
        //                "isTaker": false,                                          // Various fees for Makers and Takers; "Market" orders are always `true`
        //                "fee": "0.000001350",                                      // Exchange commission fee
        //                "feeCurrency": "BTC",                                      // Currency of the commission
        //                "isBuyer": true,                                           // Buy or sell the base asset
        //                "quoteQuantity": "14.9958",                                // Quote asset quantity
        //                "createdAt": "2023-05-08T08:53:58.332Z"                    // Date-time of trade execution, UTC
        //            }
        //        ]
        //    }
        //
        // cancelOrder, cancelOrders
        //
        //    {
        //        "id": "c7fc5b2b-bd9d-48c1-a458-a83412669fe2",   // Unique identifier of a canceled order *absent on cancelOrder*
        //        "success": true                                 // Status for this order
        //    }
        //
        const marketId = this.safeString(order, 'pair');
        const datetime = this.safeString(order, 'createdAt');
        const triggerPrice = this.safeString(order, 'stopPrice');
        let side = this.safeString(order, 'side');
        if (side === 'Bid') {
            side = 'buy';
        }
        else if (side === 'Ask') {
            side = 'sell';
        }
        const trades = this.safeValue(order, 'trades', []);
        return this.safeOrder({
            'info': order,
            'id': this.safeString2(order, 'id', 'orderId'),
            'clientOrderId': undefined,
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'lastTradeTimestamp': this.parse8601(this.safeString(order, 'updatedAt')),
            'status': this.parseOrderStatus(this.safeString(order, 'status')),
            'type': this.safeStringLower(order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'price'),
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'amount': this.safeString(order, 'quantity'),
            'filled': this.safeString(order, 'executedQuantity'),
            'remaining': undefined,
            'trades': this.parseTrades(trades),
            'cost': this.safeString(order, 'cost'),
            'average': undefined,
            'fee': undefined,
        }, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://docs.kuna.io/docs/get-order-details-by-id
         * @param {string} symbol not used by kuna fetchOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {boolean} [params.withTrades] default == true, specify if the response should include trades associated with the order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
            'id': id,
            'withTrades': true,
        };
        const response = await this.v4PrivateGetOrderPrivateDetailsId(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "4b9b9705-e85f-4180-bdec-219fbf025fa3",
        //            "type": "Limit",
        //            "quantity": "0.00054",
        //            "executedQuantity": "0.00054",
        //            "cumulativeQuoteQty": "14.99580",
        //            "cost": "14.9958",
        //            "side": "Bid",
        //            "pair": "BTC_USDT",
        //            "price": "27770",
        //            "status": "Closed",
        //            "createdAt": "2023-05-08T08:39:46.708Z",
        //            "updatedAt": "2023-05-08T08:53:58.332Z",
        //            "closedAt": "2023-05-08T08:53:58.333Z",
        //            "trades": [
        //                {
        //                    "id": "15ff497c-8d25-4155-8184-bb1f905cce1e",              // Unique identifier of a trade
        //                    "orderId": "4b9b9705-e85f-4180-bdec-219fbf025fa3",         // Unique identifier of an associated order
        //                    "pair": "BTC_USDT",                                        // Traded pair
        //                    "quantity": "0.00054",                                     // Traded quantity
        //                    "price": "27770",                                          // Traded price
        //                    "isTaker": false,                                          // Various fees for Makers and Takers; "Market" orders are always `true`
        //                    "fee": "0.000001350",                                      // Exchange commission fee
        //                    "feeCurrency": "BTC",                                      // Currency of the commission
        //                    "isBuyer": true,                                           // Buy or sell the base asset
        //                    "quoteQuantity": "14.9958",                                // Quote asset quantity
        //                    "createdAt": "2023-05-08T08:53:58.332Z"                    // Date-time of trade execution, UTC
        //                }
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseOrder(data);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.kuna.io/docs/get-active-client-orders-private
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] 1-100, the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest timestamp (ms) to fetch orders for
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['until']);
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['pairs'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['end'] = this.iso8601(until);
        }
        const response = await this.v4PrivateGetOrderPrivateActive(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "5992a049-8612-409d-8599-2c3d7298b106",            // Unique identifier of an order
        //                "type": "Limit",                                         // Type of an order
        //                "quantity": "5",                                         // Original order quantity
        //                "executedQuantity": "0",                                 // Traded quantity in stock (>0 if traded)
        //                "cumulativeQuoteQty": "0",                               // Traded quantity in money (>0 if traded)
        //                "cost": "0.05",                                          // Total amount
        //                "side": "Bid",                                           // Bid for buying base asset, Ask for selling base asset. FYI: For BTC_USDT trading pair, BTC is the base asset
        //                "pair": "TRX_USDT",                                      // Traded pair
        //                "price": "0.01",                                         // Price of the trade
        //                "status": "Open",                                        // The status of the order
        //                "createdAt": "2023-07-11T07:04:20.131Z",                 // Date-time of order creation, UTC
        //                "updatedAt": "2023-07-11T07:04:20.131Z"                  // Date-time of the last update of the order, UTC
        //            }
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://docs.kuna.io/docs/get-private-orders-history
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus('closed', symbol, since, limit, params);
    }
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOrdersByStatus
         * @description fetch a list of orders
         * @see https://docs.kuna.io/docs/get-private-orders-history
         * @param {string} status canceled, closed, expired, open, pending, rejected, or waitStop
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] 1-100, the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest timestamp (ms) to fetch orders for
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        if (status === 'open') {
            return this.fetchOpenOrders(symbol, since, limit, params);
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['until']);
        let market = undefined;
        const request = {
            'status': this.capitalize(status),
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['pairs'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['end'] = this.iso8601(until);
        }
        const response = await this.v4PrivateGetOrderPrivateHistory(request);
        //
        //    {
        //        "data": [
        //            {
        //                "id": "4b9b9705-e85f-4180-bdec-219fbf025fa3",           // Unique identifier of an order
        //                "type": "Limit",                                        // Type of an order
        //                "quantity": "0.00054",                                  // Original order quantity
        //                "executedQuantity": "0.00054",                          // Traded quantity in stock (>0 if traded)
        //                "cumulativeQuoteQty": "14.99580",                       // Traded quantity in money (>0 if traded)
        //                "cost": "14.9958",                                      // Total amount
        //                "side": "Bid",                                          // Bid for buying base asset, Ask for selling base asset. FYI: For BTC_USDT trading pair, BTC is the base asset
        //                "pair": "BTC_USDT",                                     // Traded pair
        //                "price": "27770",                                       // Price of the trade
        //                "status": "Closed",                                     // The status of the order
        //                "createdAt": "2023-05-08T08:39:46.708Z",                // Date-time of order creation, UTC
        //                "updatedAt": "2023-05-08T08:53:58.332Z",                // Date-time of the last update of the order, UTC
        //                "closedAt": "2023-05-08T08:53:58.333Z"                  // Date-time of order finish time, UTC
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.kuna.io/docs/get-private-trades-history
         * @param {string} symbol unified market symbol
         * @param {int} [since] not used by kuna fetchMyTrades
         * @param {int} [limit] not used by kuna fetchMyTrades
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.orderId] UUID of an order, to receive trades for this order only
         * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['pair'] = market['id'];
        }
        const response = await this.v4PrivateGetTradePrivateHistory(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "edb17459-c9bf-4148-9ae6-7367d7f55d71",        // Unique identifier of a trade
        //                "orderId": "a80bec3f-4ffa-45c1-9d78-f6301e9748fe",   // Unique identifier of an order associated with the trade
        //                "pair": "BTC_USDT",                                  // Traded pair, base asset first, followed by quoted asset
        //                "quantity": "1.5862",                                // Traded quantity of base asset
        //                "price": "19087",                                    // Price of the trade
        //                "isTaker": true,                                     // Various fees for Makers and Takers; "Market" orders are always `true`
        //                "fee": "0.0039655",                                  // Exchange commission fee
        //                "feeCurrency": "BTC",                                // Currency of the commission
        //                "isBuyer": true,                                     // Buy or sell the base asset
        //                "quoteQuantity": "30275.7994",                       // Quote asset quantity spent to fulfill the base amount
        //                "createdAt": "2022-09-29T13:43:53.824Z",             // Date-time of trade execution, UTC
        //            },
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data');
        return this.parseTrades(data, market, since, limit);
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name kuna#withdraw
         * @description make a withdrawal
         * @see https://docs.kuna.io/docs/create-a-withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.chain] the chain to withdraw to
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.id] id must be a uuid format, if you do not specify id, it will be generated automatically
         * @param {boolean} [params.withdrawAll] this field says that the amount should also include a fee
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        this.checkAddress(address);
        let chain = this.safeString2(params, 'chain', 'network');
        params = this.omit(params, ['chain', 'network']);
        await this.loadMarkets();
        const currency = this.currency(code);
        if (chain === undefined) {
            if (currency['code'].indexOf('USD') > 0) {
                throw new errors.ArgumentsRequired(this.id + ' withdraw () requires an extra parameter params["network"] to withdraw ' + currency['code']);
            }
            else {
                chain = currency['id'].toUpperCase();
            }
        }
        const networkId = this.networkCodeToId(chain);
        const request = {
            'currency': networkId,
            'amount': amount,
            'address': address,
            'paymentMethod': chain, // TODO: double check, Withdraw method for currency, should be taken from "Get info about withdrawal methods by currency name" endpoint (key field).
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const response = await this.v4PrivatePostWithdrawPrivateCreate(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "edb17459-c9bf-4148-9ae6-7367d7f55d71",     // unique identifier of a withdraw
        //            "status": "waitingForConfirmation"                // status of a withdraw, if you turn off withdrawal confirmation by email, it will return "processing" status, which means that the transaction is already being processed on our side
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchWithdrawals
         * @description fetch all withdrawals made to an account
         * @see https://docs.kuna.io/docs/get-withdraw-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch deposits for
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.status] Created, Canceled, PartiallyProcessed, Processing, Processed, WaitForConfirmation, Pending, AmlChecking
         * @param {string} [params.sortField] amount (sorting by time), createdAt (sorting by date)
         * @param {string} [params.sortOrder] asc (oldest-on-top), or desc (newest-on-top, default)
         * @param {int} [params.skip] 0 - ... Select the number of transactions to skip
         * @param {string} [params.address]
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        if (code !== undefined) {
            request['currency'] = code;
        }
        if (since !== undefined) {
            request['dateFrom'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['take'] = limit;
        }
        if (until !== undefined) {
            request['dateTo'] = this.iso8601(until);
        }
        const response = await this.v4PrivateGetWithdrawPrivateHistory(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "e9aa15b8-9c19-42eb-800a-026a7a153990",                                 // Unique identifier of withdrawal
        //                "amount": "10.75",                                                            // Amount deducted from your account
        //                "asset": "USDT",                                                              // Withdrawal currency
        //                "merchantId": "16214228-5c0c-5abc-be6a-c90259b21d4e",                         // Internal ID (not for use)
        //                "paymentCode": "TRX",                                                         // Blockchain name
        //                "status": "Processed",                                                        // Withdrawal status
        //                "type": "Withdraw",                                                           // Transaction type
        //                "reason": [],                                                                 // Reason for manual transaction processing
        //                "address": "TL3CWAwviQQYSnzHT4RotCWYnarnunQM46",                              // Withdrawal address
        //                "memo": "",                                                                   // Withdrawal memo
        //                "txId": "5ecc4e559b528c57be6723ac960a38211fbd3101ef4b59008452b3bd88c84621",   // Withdrawal transaction hash
        //                "fee": "0.75",                                                                // Withdrawal fee
        //                "processedAmount": "10",                                                      // Withdrawal amount
        //                "createdAt": "2023-06-09T11:33:02.383Z",                                      // Withdrawal creation date
        //                "updatedAt": "2023-06-09T11:34:25.317Z"                                       // Date of final withdrawal status
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseTransactions(data, currency);
    }
    async fetchWithdrawal(id, code = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @see https://docs.kuna.io/docs/get-withdraw-details-by-id
         * @param {string} id withdrawal id
         * @param {string} code not used by kuna.fetchWithdrawal
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const request = {
            'withdrawId': id,
        };
        const response = await this.v4PrivateGetWithdrawPrivateDetailsWithdrawId(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "e9aa15b8-9c19-42eb-800a-026a7a153990",                                 // Unique identifier of withdrawal
        //            "amount": "10.75",                                                            // Amount deducted from your account
        //            "asset": "USDT",                                                              // Withdrawal currency
        //            "merchantId": "16214228-5c0c-5abc-be6a-c90259b21d4e",                         // Internal ID (not for use)
        //            "paymentCode": "TRX",                                                         // Blockchain name
        //            "status": "Processed",                                                        // Withdrawal status
        //            "type": "Withdraw",                                                           // Transaction type
        //            "reason": [],                                                                 // Reason for manual transaction processing
        //            "address": "TL3CWAwviQQYSnzHT4RotCWYnarnunQM46",                              // Withdrawal address
        //            "memo": "",                                                                   // Withdrawal memo
        //            "txId": "5ecc4e559b528c57be6723ac960a38211fbd3101ef4b59008452b3bd88c84621",   // Withdrawal transaction hash
        //            "fee": "0.75",                                                                // Withdrawal fee
        //            "processedAmount": "10",                                                      // Withdrawal amount
        //            "createdAt": "2023-06-09T11:33:02.383Z",                                      // Withdrawal creation date
        //            "updatedAt": "2023-06-09T11:34:25.317Z"                                       // Date of final withdrawal status
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTransaction(data);
    }
    async createDepositAddress(code, params = {}) {
        /**
         * @method
         * @name kuna#createDepositAddress
         * @description create a currency deposit address
         * @see https://docs.kuna.io/docs/generate-a-constant-crypto-address-for-deposit
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'source': currency['id'],
        };
        const response = await this.v4PrivatePostDepositPrivateCryptoGenerateAddress(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "1300c2b6-ree4-4f1e-2a9d-e0f7ed0991a7",                // ID of your address
        //            "source": "BTC",                                             // Blockchain name for which you want to get the address to deposit into the account
        //            "address": "bc1qm6xfv0qsaaanx0egn6hca5vgsd4r7ak9ttha2a"      // Your deposit address
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name kuna#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://docs.kuna.io/docs/find-crypto-address-for-deposit
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'source': currency['id'].toUpperCase(),
        };
        const response = await this.v4PrivateGetDepositPrivateCryptoAddress(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "c52b6646-fb91-4760-b147-a4f952e8652c",             // ID of the address.
        //            "source": "BTC",                                          // Blockchain name for which you want to get the address to deposit into the account.
        //            "address": "bc1qm6xfv0qsaaanx0egn6hca5vgsd4r7ak9ttha2a"   // Your deposit address
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        "id": "c52b6646-fb91-4760-b147-a4f952e8652c",             // ID of the address.
        //        "source": "BTC",                                          // Blockchain name for which you want to get the address to deposit into the account.
        //        "address": "bc1qm6xfv0qsaaanx0egn6hca5vgsd4r7ak9ttha2a"   // Your deposit address
        //    }
        //
        const currencyId = this.safeString(depositAddress, 'source');
        return {
            'info': this.safeString(depositAddress, ''),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'network': undefined,
            'address': this.safeString(depositAddress, 'address'),
            'tag': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'Created': 'pending',
            'Canceled': 'canceled',
            'PartiallyProcessed': 'pending',
            'Processing': 'pending',
            'Processed': 'ok',
            'WaitForConfirmation': 'pending',
            'Pending': 'pending',
            'AmlChecking': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.kuna.io/docs/get-deposit-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch deposits for
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.status] Created, Canceled, PartiallyProcessed, Processing, Processed, WaitForConfirmation, Pending, AmlChecking
         * @param {string} [params.sortField] amount (sorting by time), createdAt (sorting by date)
         * @param {string} [params.sortOrder] asc (oldest-on-top), or desc (newest-on-top, default)
         * @param {int} [params.skip] 0 - ... Select the number of transactions to skip
         * @param {string} [params.address]
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        if (code !== undefined) {
            request['currency'] = code;
        }
        if (since !== undefined) {
            request['dateFrom'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['take'] = limit;
        }
        if (until !== undefined) {
            request['dateTo'] = this.iso8601(until);
        }
        const response = await this.v4PrivateGetDepositPrivateHistory(this.extend(request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "a201cb3c-5830-57ac-ad2c-f6a588dd55eb",                               // Unique ID of deposit
        //                "amount": "9.9",                                                            // Amount credited to your account
        //                "asset": "USDT",                                                            // Deposit currency
        //                "merchantId": "16214228-5c0c-5abc-be6a-c90259b21d4e",                       // Internal ID (not for use)
        //                "paymentCode": "TRX",                                                       // Blockchain name
        //                "status": "Processed",                                                      // Transactions status
        //                "type": "Deposit",                                                          // Transaction type
        //                "reason": [],                                                               // Reason for manual transaction processing
        //                "address": "TNeBQz8RyGGiAYAR7r8G6QGxtTWDkpH4dV",                            // Deposit address
        //                "memo": "",                                                                 // Deposit memo
        //                "txId": "8a0b0c5a2ac5679879b71b2fa63b0a5c39f90bc8ff6c41e708906b398ac3d4ef", // Deposit transaction hash
        //                "fee": "0.1",                                                               // Deposit fee
        //                "processedAmount": "10",                                                    // Amount of deposit
        //                "createdAt": "2023-06-13T12:55:01.256Z",                                    // Deposit receipt date
        //                "updatedAt": "2023-06-13T12:55:01.696Z"                                     // Deposit credit date
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseTransactions(data, currency);
    }
    async fetchDeposit(id, code = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchDeposit
         * @description fetch data on a currency deposit via the deposit id
         * @see https://docs.kuna.io/docs/get-deposit-details-by-id
         * @param {string} id deposit id
         * @param {string} code filter by currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {
            'depositId': id,
        };
        const response = await this.v4PrivateGetDepositPrivateDetailsDepositId(this.extend(request, params));
        //
        //    {
        //        "data": {
        //            "id": "a201cb3c-5830-57ac-ad2c-f6a588dd55eb",                               // Unique ID of deposit
        //            "amount": "9.9",                                                            // Amount credited to your account
        //            "asset": "USDT",                                                            // Deposit currency
        //            "merchantId": "16214228-5c0c-5abc-be6a-c90259b21d4e",                       // Internal ID (not for use)
        //            "paymentCode": "TRX",                                                       // Blockchain name
        //            "status": "Processed",                                                      // Transactions status
        //            "type": "Deposit",                                                          // Transaction type
        //            "reason": [],                                                               // Reason for manual transaction processing
        //            "address": "TNeBQz8RyGGiAYAR7r8G6QGxtTWDkpH4dV",                            // Deposit address
        //            "memo": "",                                                                 // Deposit memo
        //            "txId": "8a0b0c5a2ac5679879b71b2fa63b0a5c39f90bc8ff6c41e708906b398ac3d4ef", // Deposit transaction hash
        //            "fee": "0.1",                                                               // Deposit fee
        //            "processedAmount": "10",                                                    // Amount of deposit
        //            "createdAt": "2023-06-13T12:55:01.256Z",                                    // Deposit receipt date
        //            "updatedAt": "2023-06-13T12:55:01.696Z"                                     // Deposit credit date
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //    {
        //        "id": "a201cb3c-5830-57ac-ad2c-f6a588dd55eb",                               // Unique ID of deposit
        //        "amount": "9.9",                                                            // Amount credited to your account
        //        "asset": "USDT",                                                            // Deposit currency
        //        "merchantId": "16214228-5c0c-5abc-be6a-c90259b21d4e",                       // Internal ID (not for use)
        //        "paymentCode": "TRX",                                                       // Blockchain name
        //        "status": "Processed",                                                      // Transactions status
        //        "type": "Deposit",                                                          // Transaction type
        //        "reason": [],                                                               // Reason for manual transaction processing
        //        "address": "TNeBQz8RyGGiAYAR7r8G6QGxtTWDkpH4dV",                            // Deposit address
        //        "memo": "",                                                                 // Deposit memo
        //        "txId": "8a0b0c5a2ac5679879b71b2fa63b0a5c39f90bc8ff6c41e708906b398ac3d4ef", // Deposit transaction hash
        //        "fee": "0.1",                                                               // Deposit fee
        //        "processedAmount": "10",                                                    // Amount of deposit
        //        "createdAt": "2023-06-13T12:55:01.256Z",                                    // Deposit receipt date
        //        "updatedAt": "2023-06-13T12:55:01.696Z"                                     // Deposit credit date
        //    }
        //
        const datetime = this.safeString(transaction, 'createdAt');
        const currencyId = this.safeString(transaction, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        const networkId = this.safeString(transaction, 'paymentCode');
        const type = this.safeStringLower(transaction, 'type');
        const address = this.safeString(transaction, 'address');
        const isDeposit = (type === 'deposit');
        const parsedType = isDeposit ? type : 'withdrawal';
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'txId'),
            'currency': code,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'network': this.networkIdToCode(networkId),
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'amount': this.safeNumber(transaction, 'amount'),
            'type': parsedType,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'updated': this.parse8601(this.safeString(transaction, 'updatedAt')),
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': this.safeString(transaction, 'memo'),
            'internal': undefined,
            'fee': {
                'cost': this.safeNumber(transaction, 'fee'),
                'currency': code,
            },
        };
    }
    nonce() {
        return this.milliseconds();
    }
    encodeParams(params) {
        if ('orders' in params) {
            const orders = params['orders'];
            let query = this.urlencode(this.keysort(this.omit(params, 'orders')));
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const keys = Object.keys(order);
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k];
                    const value = order[key];
                    query += '&orders%5B%5D%5B' + key + '%5D=' + value.toString();
                }
            }
            return query;
        }
        return this.urlencode(this.keysort(params));
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (Array.isArray(api)) {
            const isGet = method === 'GET';
            const version = this.safeString(api, 0);
            const access = this.safeString(api, 1);
            if (version === 'v3') {
                url = this.urls['api'][version] + '/' + version + '/' + this.implodeParams(path, params);
                if (access === 'public') {
                    if (isGet) {
                        if (Object.keys(params).length) {
                            url += '?' + this.urlencode(params);
                        }
                    }
                    else if ((method === 'POST') || (method === 'PUT')) {
                        headers = { 'Content-Type': 'application/json' };
                        body = this.json(params);
                    }
                }
                else if (access === 'private') {
                    throw new errors.NotSupported(this.id + ' private v3 API is not supported yet');
                }
            }
            else if (version === 'v4') {
                const extractedParams = this.extractParams(path);
                let urlPath = '/' + version + '/' + this.implodeParams(path, params);
                params = this.omit(params, extractedParams);
                if (isGet) {
                    const paramsList = Object.keys(params);
                    const numParams = paramsList.length;
                    if (numParams > 0) {
                        urlPath += '?' + this.urlencode(params);
                    }
                }
                if (access === 'private') {
                    const nonce = this.nonce().toString();
                    let auth = urlPath + nonce;
                    if (isGet) {
                        auth = auth + this.json({});
                    }
                    else {
                        auth = auth + this.json(params);
                        body = params;
                    }
                    headers = {
                        'Content-Type': 'application/json',
                        'accept': 'application/json',
                        'nonce': nonce,
                        'public-key': this.apiKey,
                        'signature': this.hmac(this.encode(auth), this.encode(this.secret), sha512.sha384, 'hex'),
                    };
                    const account = this.safeString(this.options, 'account');
                    if (account === 'pro') {
                        headers['account'] = 'pro';
                    }
                }
                url = this.urls['api'][version] + urlPath;
            }
        }
        else {
            let request = '/api/' + this.version + '/' + this.implodeParams(path, params);
            if ('extension' in this.urls) {
                request += this.urls['extension'];
            }
            const query = this.omit(params, this.extractParams(path));
            url = this.urls['api'][api] + request;
            if (api === 'public') {
                if (Object.keys(query).length) {
                    url += '?' + this.urlencode(query);
                }
            }
            else {
                this.checkRequiredCredentials();
                const nonce = this.nonce().toString();
                const queryInner = this.encodeParams(this.extend({
                    'access_key': this.apiKey,
                    'tonce': nonce,
                }, params));
                const auth = method + '|' + request + '|' + queryInner;
                const signed = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
                const suffix = query + '&signature=' + signed;
                if (method === 'GET') {
                    url += '?' + suffix;
                }
                else {
                    body = suffix;
                    headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                }
            }
        }
        if (body !== undefined) {
            body = JSON.stringify(body);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        //    {
        //        "errors": [
        //            {
        //                "extensions": {
        //                    "code": "IP_NOT_IN_WHITE_LIST"
        //                },
        //                "code": "IP_NOT_IN_WHITE_LIST"
        //            }
        //        ]
        //    }
        //
        const errors$1 = this.safeValue(response, 'errors');
        if ((response === undefined) && (errors$1 === undefined)) {
            return undefined;
        }
        if ((errors$1 !== undefined) || (code === 400)) {
            let error = this.safeValue(errors$1, 0);
            if (error === undefined) {
                error = this.safeValue(response, 'error');
            }
            const errorCode = this.safeString(error, 'code');
            const feedback = this.id + ' ' + this.json(response);
            this.throwExactlyMatchedException(this.exceptions, errorCode, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

module.exports = kuna;
