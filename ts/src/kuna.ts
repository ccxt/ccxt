
// ---------------------------------------------------------------------------

import Exchange from './abstract/kuna.js';
import { ArgumentsRequired, InsufficientFunds, OrderNotFound, NotSupported } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Currency, Int, OrderSide, OrderType } from './base/types.js';
import { sha384 } from './static_dependencies/noble-hashes/sha512.js';
import { Precise } from '../ccxt.js';

// ---------------------------------------------------------------------------

/**
 * @class kuna
 * @extends Exchange
 * @description Use the public-key as your apiKey
 */
export default class kuna extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': [ 'UA' ],
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
                'borrowMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
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
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
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
                    'public': 'https://kuna.io', // v2
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
                            'me': 1,
                            'getBalance': 1,
                            'active': 1,
                            'order/history': 1,
                            'order/private/{id}/trades': 1,
                            'order/details/{id}?withTrades={withTrades}': 1,
                            'trade/history': 1,
                            'transaction/{hash}': 1,
                            'deposit/preRequest': 1,
                            'deposit/crypto/address': 1,
                            'deposit/crypto/getMerchantAddress': 1,
                            'deposit/history': 1,
                            'deposit/details/{depositId}': 1,
                            'withdraw/preRequest': 1,
                            'withdraw/history': 1,
                            'withdraw/details/{withdrawId}': 1,
                            'kuna-code/{id}': 1,
                            'kuna-code/{code}/check': 1,
                            'kuna-code/issued-by-me': 1,
                            'kuna-code/redeemed-by-me': 1,
                        },
                        'post': {
                            'order/create': 1,
                            'order/cancel': 1,
                            'order/cancel/multi': 1,
                            'deposit/crypto/generateAddress': 1,
                            'deposit/crypto/generateMerchantAddress': 1,
                            'withdraw/create': 1,
                            'kuna-code': 1,
                        },
                        'put': {
                            'kuna-code/redeem': 1,
                        },
                    },
                    'public': {
                        'get': {
                            'timestamp': 1,
                            'fees': 1,
                            'currencies?type={type}': 1,
                            'currencies': 1,
                            'markets/getAll': 1,
                            'markets/tickers?pairs={pairs}': 1,
                            'order/book/{pairs}': 1,
                            'trade/book/{pairs}': 1,
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
                        'depth', // Get depth or specified market Both asks and bids are sorted from highest price to lowest.
                        'k_with_pending_trades', // Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator
                        'k', // Get OHLC(k line) of specific market
                        'markets', // Get all available markets
                        'order_book', // Get the order book of specified market
                        'order_book/{market}',
                        'tickers', // Get ticker of all markets
                        'tickers/{market}', // Get ticker of specific market
                        'timestamp', // Get server current time, in seconds since Unix epoch
                        'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                        'trades/{market}',
                    ],
                },
                'private': {
                    'get': [
                        'members/me', // Get your profile and accounts info
                        'deposits', // Get your deposits history
                        'deposit', // Get details of specific deposit
                        'deposit_address', // Where to deposit The address field could be empty when a new address is generating (e.g. for bitcoin), you should try again later in that case.
                        'orders', // Get your orders, results is paginated
                        'order', // Get information of specified order
                        'trades/my', // Get your executed trades Trades are sorted in reverse creation order.
                        'withdraws', // Get your cryptocurrency withdraws
                        'withdraw', // Get your cryptocurrency withdraw
                    ],
                    'post': [
                        'orders', // Create a Sell/Buy order
                        'orders/multi', // Create multiple sell/buy orders
                        'orders/clear', // Cancel all my orders
                        'order/delete', // Cancel an order
                        'withdraw', // Create a withdraw
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0025'),
                    'maker': this.parseNumber ('0.0025'),
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
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
            'options': {
                // 'account': 'pro'      // Only for pro accounts
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name kuna#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v4PublicGetTimestamp (params);
        //
        //    {
        //        "timestamp": 1686740531,
        //        "timestamp_miliseconds": 1686740531725
        //    }
        //
        return this.safeInteger (response, 'timestamp_miliseconds');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name kuna#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.v4PublicGetCurrencies (params);
        //
        //    [
        //        {
        //            "code": "BTC",
        //            "name": "Bitcoin",
        //            "payload": {
        //                "chart": "https://kuna-pro.kuna.io/bitcoin-chart",
        //                "icons": {
        //                    "svg": "https://kuna-pro.kuna.io/icon-btc-svg",
        //                    "png2x": "https://kuna-pro.kuna.io/icon-btc-png2x",
        //                    "png3x": "https://kuna-pro.kuna.io/icon-btc-png3x",
        //                    "svgXL": "https://kuna-pro.kuna.io/icon-btc-svg"
        //                },
        //                "pngChart": "https://kuna-pro.kuna.io/png-bitcoin-chart"
        //            },
        //            "position": 1,
        //            "precision": 8,
        //            "tradePrecision": 6,
        //            "type": "Crypto"
        //        }
        //    ]
        //
        return this.parseCurrencies (response);
    }

    parseCurrencies (currencies, params = {}) {
        currencies = this.toArray (currencies);
        const result = [];
        for (let i = 0; i < currencies.length; i++) {
            const currency = this.parseCurrency (currencies[i]);
            result.push (currency);
        }
        return result as Currency[];
    }

    parseCurrency (currency) {
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
        const currencyId = this.safeString (currency, 'code');
        const precision = this.safeString (currency, 'precision');
        const tradePrecision = this.safeString (currency, 'tradePrecision');
        return {
            'info': currency,
            'id': currencyId,
            'code': this.safeCurrencyCode (currencyId),
            'type': undefined,
            'margin': undefined,
            'name': this.safeString (currency, 'name'),
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': Precise.stringMin (precision, tradePrecision),
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

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name kuna#fetchMarkets
         * @description retrieves data on all markets for kuna
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.v4PublicGetMarketsGetAll (params);
        //
        //    [
        //        {
        //            "pair": "BTC_USDT",               // Traded pair of assets
        //            "baseAsset": {                    // The base asset of the traded pair, the one to sell or buy as a result of the trade
        //                 "code": "BTC",
        //                 "precision": 6               // Maximum amount of digits for the decimal part of a number
        //            },
        //            "quoteAsset": {                   // The quoted asset of the traded pair, the one to use to sell or buy the base asset
        //                "code": "USDT",
        //                "precision": 2                // Maximum amount of digits for the decimal part of a number
        //            },
        //            "tickerPriceChange": "-0.07"      // Relative change compared with the last tick
        //        }
        //    ]
        //
        const markets = [];
        for (let i = 0; i < response.length; i++) {
            const marketId = this.safeString (response, 'pair');
            const baseAsset = this.safeValue (response, 'baseAsset');
            const quoteAsset = this.safeValue (response, 'quoteAsset');
            const baseId = this.safeString (baseAsset, 'code');
            const quoteId = this.safeString (quoteAsset, 'code');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const basePrecision = this.safeString (baseAsset, 'precision');
            const quotePrecision = this.safeString (quoteAsset, 'precision');
            markets.push ({
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
                    'amount': this.parseNumber (this.parsePrecision (basePrecision)),
                    'price': this.parseNumber (this.parsePrecision (quotePrecision)),
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
                'info': undefined,
            });
        }
        return markets;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] 5, 10, 20, 50, 100, 500, or 1000 (default)
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairs': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const orderbook = await this.v4PublicGetOrderBookPairs (this.extend (request, params));
        //
        //    {
        //        "asks": [               // An array of sell orders
        //            [
        //                "16950",        // Sell price, level 1
        //                "0.001"         // Sell quantity, level 1
        //            ],
        //            [
        //                "17000",        // Sell price, level 2
        //                "0.01"          // Sell quantity, level 2
        //            ]
        //        ],
        //        "bids": [               // An array of buy orders
        //            [
        //                "16700",        // Sell price, level 1
        //                "0.01"          // Sell quantity, level 1
        //            ],
        //            [
        //                "16000",        // Sell price, level 2
        //                "0.001"         // Sell quantity, level 2
        //            ]
        //        ]
        //    }
        //
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'bids', 'asks', 0, 1);
    }

    parseTicker (ticker, market = undefined) {
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
        const marketId = this.safeString (ticker, 'pair');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bestBidPrice'),
            'ask': this.safeString (ticker, 'bestAskPrice'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'percentagePriceChange'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
        }, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market. The average is not returned in the response, but the median can be accessed via response['info']['price']
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const marketIds = this.marketIds (symbols);
        const request = {
            'pairs': marketIds.join (','),
        };
        const response = await this.v4PublicGetMarketsTickersPairsPairs (this.extend (request, params));
        //
        //    [
        //        {
        //            "pair": "BTC_USDT",                                   // Traded pair
        //            "percentagePriceChange": "-0.03490931899641581",      // Relative price change, in percent
        //            "price": "27900",                                     // Current median price
        //            "equivalentPrice": "",                                // TBD
        //            "high": "29059.69",                                   // Highest price
        //            "low": "27900",                                       // Lowest price
        //            "baseVolume": "2.9008499999999993",                   // Traded volume as base
        //            "quoteVolume": "82251.41477976",                      // Traded volume as quote
        //            "bestBidPrice": "27926.91",                           // The best bid price now
        //            "bestAskPrice": "27970.02",                           // The best ask price now
        //            "priceChange": "-973.9700000000012"                   // Absolute price change
        //        }
        //        ...
        //    ]
        //
        return this.parseTickers (response, symbols, params);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name kuna#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairs': market['id'],
        };
        const response = await this.v4PublicGetMarketsTickersPairsPairs (this.extend (request, params));
        //
        //    [
        //        {
        //            "pair": "BTC_USDT",                                   // Traded pair
        //            "percentagePriceChange": "-0.03490931899641581",      // Relative price change, in percent
        //            "price": "27900",                                     // Current median price
        //            "equivalentPrice": "",                                // TBD
        //            "high": "29059.69",                                   // Highest price
        //            "low": "27900",                                       // Lowest price
        //            "baseVolume": "2.9008499999999993",                   // Traded volume as base
        //            "quoteVolume": "82251.41477976",                      // Traded volume as quote
        //            "bestBidPrice": "27926.91",                           // The best bid price now
        //            "bestAskPrice": "27970.02",                           // The best ask price now
        //            "priceChange": "-973.9700000000012"                   // Absolute price change
        //        }
        //        ...
        //    ]
        //
        const ticker = this.safeString (response, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchL3OrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * TODO: double check
         * @method
         * @name kuna#fetchL3OrderBook
         * @description fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified market symbol
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} an [order book structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure}
         */
        return await this.fetchOrderBook (symbol, limit, params);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] between 1 and 100, 25 by default
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v4PublicGetTradeBookPairs (this.extend (request, params));
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
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
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
        const datetime = this.safeString (trade, 'createdAt');
        const marketId = this.safeString (trade, 'pair');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol (marketId, market),
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'order': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'matchPrice'),
            'amount': this.safeString (trade, 'matchQuantity'),
            'cost': this.safeString (trade, 'quoteQuantity'),
            'fee': undefined,
        }, market);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'accounts', []);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name kuna#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} a [balance structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (params);
        return this.parseBalance (response);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name kuna#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            request['price'] = price.toString ();
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name kuna#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol not used by kuna cancelOrder ()
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderDelete (this.extend (request, params));
        const order = this.parseOrder (response);
        const status = order['status'];
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    parseOrderStatus (status) {
        const statuses = {
            'done': 'closed',
            'wait': 'open',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const id = this.safeString (order, 'id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'volume'),
            'filled': this.safeString (order, 'executed_volume'),
            'remaining': this.safeString (order, 'remaining_volume'),
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'cost': undefined,
            'average': undefined,
        }, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol not used by kuna fetchOrder
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {object} An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (response, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name kuna#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the kuna api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetTradesMy (this.extend (request, params));
        //
        //      [
        //          {
        //              "id":11353719,
        //              "price":"0.13566",
        //              "volume":"99.0",
        //              "funds":"13.43034",
        //              "market":"dogeusdt",
        //              "created_at":"2022-04-12T18:58:44Z",
        //              "side":"ask",
        //              "order_id":1665670371,
        //              "trend":"buy"
        //          },
        //      ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        if ('orders' in params) {
            const orders = params['orders'];
            let query = this.urlencode (this.keysort (this.omit (params, 'orders')));
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const keys = Object.keys (order);
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k];
                    const value = order[key];
                    query += '&orders%5B%5D%5B' + key + '%5D=' + value.toString ();
                }
            }
            return query;
        }
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (Array.isArray (api)) {
            const [ version, access ] = api;
            if (version === 'v3') {
                url = this.urls['api'][version] + '/' + version + '/' + this.implodeParams (path, params);
                if (access === 'public') {
                    if (method === 'GET') {
                        if (Object.keys (params).length) {
                            url += '?' + this.urlencode (params);
                        }
                    } else if ((method === 'POST') || (method === 'PUT')) {
                        headers = { 'Content-Type': 'application/json' };
                        body = this.json (params);
                    }
                } else if (access === 'private') {
                    throw new NotSupported (this.id + ' private v3 API is not supported yet');
                }
            } else if (version === 'v4') {
                const splitPath = path.split ('/');
                const splitPathLength = splitPath.length;
                let urlPath = '';
                if ((splitPathLength > 1) && (splitPath[0] !== 'kuna-code')) {
                    let pathTail = '';
                    for (let i = 1; i < splitPathLength; i++) {
                        pathTail += splitPath[i];
                    }
                    urlPath = '/' + version + '/' + splitPath[0] + '/' + access + '/' + this.implodeParams (pathTail, params);
                } else {
                    urlPath = '/' + version + '/' + access + '/' + this.implodeParams (path, params);
                }
                url = this.urls['api'][version] + urlPath;
                if (access === 'private') {
                    const nonce = this.nonce ();
                    const auth = urlPath + nonce + this.json (params);
                    headers = {
                        'content-type': 'application/json',
                        'accept': 'application/json',
                        'nonce': nonce,
                        'public-key': this.apiKey,
                        'signature': this.hmac (this.encode (auth), this.encode (this.secret), sha384, 'hex'),
                    };
                    const account = this.safeString (this.options, 'account');
                    if (account === 'pro') {
                        headers['account'] = 'pro';
                    }
                }
            }
        } else {
            let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            if ('extension' in this.urls) {
                request += this.urls['extension'];
            }
            const query = this.omit (params, this.extractParams (path));
            url = this.urls['api'][api] + request;
            if (api === 'public') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                this.checkRequiredCredentials ();
                const nonce = this.nonce ().toString ();
                const queryInner = this.encodeParams (this.extend ({
                    'access_key': this.apiKey,
                    'tonce': nonce,
                }, params));
                const auth = method + '|' + request + '|' + queryInner;
                const signed = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
                const suffix = query + '&signature=' + signed;
                if (method === 'GET') {
                    url += '?' + suffix;
                } else {
                    body = suffix;
                    headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
        return undefined;
    }
}
