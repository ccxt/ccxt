'use strict';

const Exchange = require ('./base/Exchange');
// const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable, OnMaintenance, BadResponse, RequestTimeout, OrderNotFillable, MarginModeAlreadySet } = require ('./base/errors');
const { ArgumentsRequired, InsufficientFunds, OrderNotFound } = require ('./base/errors');
const { DECIMAL_PLACES } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

module.exports = class coinsph extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsph',
            'name': 'Coinsph',
            'countries': [ 'PH' ], // Philippines
            'version': 'v1',
            'rateLimit': 50, // 1200 per minute
            'certified': false,
            'pro': false,
            'has': {
                // 'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                // 'cancelAllOrders': true,
                // 'cancelOrder': true,
                // 'cancelOrders': undefined,
                // 'createDepositAddress': false,
                // 'createOrder': true,
                // 'createPostOnlyOrder': true,
                // 'createReduceOnlyOrder': true,
                // 'createStopLimitOrder': true,
                // 'createStopMarketOrder': false,
                // 'createStopOrder': true,
                // 'editOrder': true,
                // 'fetchAccounts': undefined,
                'fetchBalance': true,
                // 'fetchBidsAsks': true,
                // 'fetchBorrowInterest': true,
                // 'fetchBorrowRate': true,
                // 'fetchBorrowRateHistories': false,
                // 'fetchBorrowRateHistory': true,
                // 'fetchBorrowRates': false,
                // 'fetchBorrowRatesPerSymbol': false,
                // 'fetchCanceledOrders': false,
                // 'fetchClosedOrder': false,
                // 'fetchClosedOrders': 'emulated',
                'fetchCurrencies': false,
                // 'fetchDeposit': false,
                // 'fetchDepositAddress': true,
                // 'fetchDepositAddresses': false,
                // 'fetchDepositAddressesByNetwork': false,
                // 'fetchDeposits': true,
                // 'fetchDepositWithdrawFee': 'emulated',
                // 'fetchDepositWithdrawFees': true,
                // 'fetchFundingHistory': true,
                // 'fetchFundingRate': true,
                // 'fetchFundingRateHistory': true,
                // 'fetchFundingRates': true,
                // 'fetchIndexOHLCV': true,
                // 'fetchL3OrderBook': false,
                // 'fetchLedger': undefined,
                // 'fetchLeverage': false,
                // 'fetchLeverageTiers': true,
                // 'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                // 'fetchMarkOHLCV': true,
                // 'fetchMyTrades': true,
                'fetchOHLCV': true,
                // 'fetchOpenInterestHistory': true,
                // 'fetchOpenOrder': false,
                // 'fetchOpenOrders': true,
                // 'fetchOrder': true,
                'fetchOrderBook': true,
                // 'fetchOrderBooks': false,
                // 'fetchOrders': true,
                // 'fetchOrderTrades': true,
                // 'fetchPosition': undefined,
                // 'fetchPositions': true,
                // 'fetchPositionsRisk': true,
                // 'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                // 'fetchTradingLimits': undefined,
                // 'fetchTransactionFee': undefined,
                // 'fetchTransactionFees': true,
                // 'fetchTransactions': false,
                // 'fetchTransfers': true,
                // 'fetchWithdrawal': false,
                // 'fetchWithdrawals': true,
                // 'fetchWithdrawalWhitelist': false,
                // 'reduceMargin': true,
                // 'repayMargin': true,
                // 'setLeverage': true,
                // 'setMargin': false,
                // 'setMarginMode': true,
                // 'setPositionMode': true,
                // 'signIn': false,
                // 'transfer': true,
                // 'withdraw': true,
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
                'logo': '', // to do
                'api': {
                    'public': 'https://api.pro.coins.ph',
                    'private': 'https://api.pro.coins.ph',
                },
                'www': 'https://coins.ph/',
                'referral': {
                    // to do
                },
                'doc': [
                    'https://coins-docs.github.io/rest-api',
                ],
                'fees': 'https://support.coins.ph/hc/en-us/sections/4407198694681-Limits-Fees',
            },
            'api': {
                'public': {
                    'get': {
                        // done =================================
                        'openapi/v1/ping': 1,
                        'openapi/v1/time': 1,
                        // in progress ==========================
                        'openapi/v1/exchangeInfo': 10,
                        // cost 1 if 'symbol' param defined (one market symbol) or if 'symbols' param is a list of 1-20 market symbols
                        // cost 20 if 'symbols' param is a list of 21-100 market symbols
                        // cost 40 if 'symbols' param is a list of 101 or more market symbols or if both 'symbol' and 'symbols' params are omited
                        'openapi/quote/v1/ticker/24hr': { 'cost': 1, 'noSymbolAndNoSymbols': 40, 'bySymbolsAmount': [ [ 101, 40 ], [ 21, 20 ], [ 0, 1 ] ] },
                        // cost 1 if limit <= 100; 5 if limit > 100.
                        'openapi/quote/v1/depth': { 'cost': 1, 'byLimit': [ [ 101, 5 ], [ 0, 1 ] ] },
                        'openapi/quote/v1/klines': 1, // default limit 500; max 1000.
                        'openapi/quote/v1/trades': 1, // default limit 500; max 1000. if limit <=0 or > 1000 then return 1000
                        // ======================================
                        'openapi/v1/pairs': 1, // to do: find method
                        'openapi/quote/v1/avgPrice': 1, // to do: find method
                        // cost 1 if 'symbol' param defined (one market symbol)
                        // cost 2 if 'symbols' param is a list of 1 or more market symbols or if both 'symbol' and 'symbols' params are omited
                        'openapi/quote/v1/ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        // cost 1 if 'symbol' param defined (one market symbol)
                        // cost 2 if 'symbols' param is a list of 1 or more market symbols or if both 'symbol' and 'symbols' params are omited
                        'openapi/quote/v1/ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                    },
                },
                'private': {
                    'get': {
                        // in progress ==========================
                        'openapi/v1/account': 10,
                        // cost 3 for a single symbol; 40 when the symbol parameter is omitted
                        'openapi/v1/openOrders': { 'cost': 3, 'noSymbol': 40 },
                        'openapi/v1/asset/tradeFee': 1,
                        // ======================================
                        'openapi/v1/order': 2,
                        // cost 10 with symbol, 40 when the symbol parameter is omitted;
                        'openapi/v1/historyOrders': { 'cost': 10, 'noSymbol': 40 },
                        'openapi/v1/myTrades': 10,
                        'openapi/v1/capital/deposit/history': 1,
                        'openapi/v1/capital/withdraw/history': 1,
                    },
                    'post': {
                        'openapi/v1/order/test': 1,
                        'openapi/v1/order': 1,
                        'openapi/v1/capital/withdraw/apply': 1,
                        'openapi/v1/capital/deposit/apply': 1,
                    },
                    'delete': {
                        'openapi/v1/order': 1,
                        'openapi/v1/openOrders': 1,
                    },
                },
            },
            'fees': {
                // to do: check bitfinex
            },
            'precisionMode': DECIMAL_PLACES, // to do: change to TICK_SIZE in fetchMarkets (see precisionFromString)
            // exchange-specific options
            'options': {
                // to do: check fetchTickersMethod
            },
            // https://coins-docs.github.io/errors/
            'exceptions': {
                'exact': {
                    // to do
                    '-1004': ArgumentsRequired, // {"code":-1004,"msg":"Missing required parameter \u0027symbol\u0027"}
                    '-1105': ArgumentsRequired, // {"code":-1105,"msg":"Parameter \u0027orderId and origClientOrderId\u0027 is empty."}
                    '-1140': InsufficientFunds, // {"code":-1140,"msg":"Transaction amount lower than the minimum."}
                    '-2013': OrderNotFound, // {"code":-2013,"msg":"Order does not exist."} to do: is it right exception?
                },
                'broad': {
                    // to do
                },
            },
        });
    }

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        if (('noSymbol' in config) && !('symbol' in params)) {
            return config['noSymbol'];
        } else if (('noSymbolAndNoSymbols' in config) && !('symbol' in params) && !('symbols' in params)) {
            return config['noSymbolAndNoSymbols'];
        } else if (('bySymbolsAmount' in config) && ('symbols' in params)) {
            const symbols = params['symbols'];
            const symbolsAmount = symbols.length;
            const bySymbolsAmount = config['bySymbolsAmount'];
            for (let i = 0; i < bySymbolsAmount.length; i++) {
                const entry = bySymbolsAmount[i];
                if (symbolsAmount >= entry[0]) {
                    return entry[1];
                }
            }
        } else if (('byLimit' in config) && ('limit' in params)) {
            const limit = params['limit'];
            const byLimit = config['byLimit'];
            for (let i = 0; i < byLimit.length; i++) {
                const entry = byLimit[i];
                if (limit >= entry[0]) {
                    return entry[1];
                }
            }
        }
        return this.safeValue (config, 'cost', 1);
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name coinsph#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const response = await this.publicGetOpenapiV1Ping (params);
        return {
            'status': 'ok', // if there's no Errors, status = 'ok'
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name coinsph#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetOpenapiV1Time (params);
        //
        //     {"serverTime":1677705408268}
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name coinsph#fetchMarkets
         * @description retrieves data on all markets for coinsph
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetOpenapiV1ExchangeInfo (params);
        //
        //     {
        //         timezone: 'UTC',
        //         serverTime: '1677449496897',
        //         exchangeFilters: [],
        //         symbols: [
        //             {
        //                 symbol: 'XRPPHP',
        //                 status: 'TRADING',
        //                 baseAsset: 'XRP',
        //                 baseAssetPrecision: '2',
        //                 quoteAsset: 'PHP',
        //                 quoteAssetPrecision: '4',
        //                 orderTypes: [
        //                     'LIMIT',
        //                     'MARKET',
        //                     'LIMIT_MAKER',
        //                     'STOP_LOSS_LIMIT',
        //                     'STOP_LOSS',
        //                     'TAKE_PROFIT_LIMIT',
        //                     'TAKE_PROFIT'
        //                 ],
        //                 filters: [
        //                     {
        //                         minPrice: '0.01',
        //                         maxPrice: '99999999.00000000',
        //                         tickSize: '0.01', // to do: use it for precision['price']
        //                         filterType: 'PRICE_FILTER'
        //                     },
        //                     {
        //                         minQty: '0.01',
        //                         maxQty: '99999999999.00000000',
        //                         stepSize: '0.01', // to do: use it for precision['amount']
        //                         filterType: 'LOT_SIZE'
        //                     },
        //                     { minNotional: '50', filterType: 'NOTIONAL' },
        //                     { minNotional: '50', filterType: 'MIN_NOTIONAL' },
        //                     {
        //                         priceUp: '99999999',
        //                         priceDown: '0.01',
        //                         filterType: 'STATIC_PRICE_RANGE'
        //                     },
        //                     {
        //                         multiplierUp: '1.1',
        //                         multiplierDown: '0.9',
        //                         filterType: 'PERCENT_PRICE_INDEX'
        //                     },
        //                     {
        //                         multiplierUp: '1.1',
        //                         multiplierDown: '0.9',
        //                         filterType: 'PERCENT_PRICE_ORDER_SIZE'
        //                     },
        //                     { maxNumOrders: '200', filterType: 'MAX_NUM_ORDERS' },
        //                     { maxNumAlgoOrders: '5', filterType: 'MAX_NUM_ALGO_ORDERS' }
        //                 ]
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'symbols');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const isActive = this.safeString (market, 'status') === 'TRADING';
            const limits = this.indexBy (this.safeValue (market, 'filters'), 'filterType');
            const amountLimits = this.safeValue (limits, 'LOT_SIZE', {}); // to do: all safeValue methods should have a default value {} or []
            const priceLimits = this.safeValue (limits, 'PRICE_FILTER', {});
            const costLimits = this.safeValue (limits, 'NOTIONAL', {});
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
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': isActive,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': undefined,
                'maker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.safeString (market, 'baseAssetPrecision')),
                    'price': this.parseNumber (this.safeString (market, 'quoteAssetPrecision')),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.parseNumber (this.safeString (amountLimits, 'minQty')),
                        'max': this.parseNumber (this.safeString (amountLimits, 'maxQty')),
                    },
                    'price': {
                        'min': this.parseNumber (this.safeString (priceLimits, 'minPrice')),
                        'max': this.parseNumber (this.safeString (priceLimits, 'maxPrice')),
                    },
                    'cost': {
                        'min': this.parseNumber (this.safeString (costLimits, 'minNotional')),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        this.setMarkets (result);
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                const id = market['id'];
                ids.push (id);
            }
            request['symbols'] = ids;
        }
        const tickers = await this.publicGetOpenapiQuoteV1Ticker24hr (this.extend (request, params));
        return this.parseTickers (tickers, symbols, params);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name coinsph#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetOpenapiQuoteV1Ticker24hr (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         symbol: 'ETHUSDT',
        //         priceChange: '41.440000000000000000',
        //         priceChangePercent: '0.0259',
        //         weightedAvgPrice: '1631.169825783972125436',
        //         prevClosePrice: '1601.520000000000000000',
        //         lastPrice: '1642.96',
        //         lastQty: '0.000001000000000000',
        //         bidPrice: '1638.790000000000000000',
        //         bidQty: '0.280075000000000000',
        //         askPrice: '1647.340000000000000000',
        //         askQty: '0.165183000000000000',
        //         openPrice: '1601.52',
        //         highPrice: '1648.28',
        //         lowPrice: '1601.52',
        //         volume: '0.000287',
        //         quoteVolume: '0.46814574',
        //         openTime: '1677417000000',
        //         closeTime: '1677503415200',
        //         firstId: '1364680572697591809',
        //         lastId: '1365389809203560449',
        //         count: '100'
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const bid = this.safeString (ticker, 'bidPrice');
        const ask = this.safeString (ticker, 'askPrice');
        let bidVolume = this.safeString (ticker, 'bidQty');
        let askVolume = this.safeString (ticker, 'askQty');
        // to do: check all tickers for 0 bid or ask volume
        if (Precise.stringEq (bidVolume, '0')) {
            bidVolume = undefined;
        }
        if (Precise.stringEq (askVolume, '0')) {
            askVolume = undefined;
        }
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const open = this.safeString (ticker, 'openPrice');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const prevClose = this.safeString (ticker, 'prevClosePrice');
        const vwap = this.safeString (ticker, 'weightedAvgPrice');
        const changeValue = this.safeString (ticker, 'priceChange');
        let changePcnt = this.safeString (ticker, 'priceChangePercent');
        changePcnt = Precise.stringMul (changePcnt, '100');
        return this.safeTicker ({
            'symbol': market['symbol'], // to do: should I use this.safeSymbol?
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'open': open,
            'high': high,
            'low': low,
            'close': this.safeString (ticker, 'lastPrice'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': vwap,
            'previousClose': prevClose,
            'change': changeValue,
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return (default 100, max 200)
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOpenapiQuoteV1Depth (this.extend (request, params));
        //
        //     {
        //         "lastUpdateId": "1667022157000699400",
        //         "bids": [
        //             [ '1651.810000000000000000', '0.214556000000000000' ],
        //             [ '1651.730000000000000000', '0.257343000000000000' ],
        //         ],
        //         "asks": [
        //             [ '1660.510000000000000000', '0.299092000000000000' ],
        //             [ '1660.600000000000000000', '0.253667000000000000' ],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch (default 500, max 1000)
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe);
        const request = {
            'symbol': market['id'],
            'interval': interval,
        };
        if (since !== undefined) {
            request['startTime'] = since;
            request['limit'] = 1000;
            // since work properly only when it is "younger" than last 'liimit' candle
            // looks like the exchange first filters last 'limit' of orders and only then filters 'startTime' and 'endTime'
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe) * 1000;
                request['endTime'] = this.sum (since, duration * (limit - 1));
            } else {
                request['endTime'] = this.milliseconds ();
            }
        } else {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        }
        const response = await this.publicGetOpenapiQuoteV1Klines (this.extend (request, params));
        //
        //     [
        //         [
        //             1499040000000,      // Open time
        //             "0.01634790",       // Open
        //             "0.80000000",       // High
        //             "0.01575800",       // Low
        //             "0.01577100",       // Close
        //             "148976.11427815",  // Volume
        //             1499644799999,      // Close time
        //             "2434.19055334",    // Quote asset volume
        //             308,                // Number of trades
        //             "1756.87402397",    // Taker buy base asset volume
        //             "28.46694368"       // Taker buy quote asset volume
        //         ]
        //     ]
        //
        // to do: delete after check
        // const first = response[0];
        // const last = response[response.length - 1];
        // console.log (first[0], '------------', this.iso8601 (first[0]));
        // console.log (last[0], '------------', this.iso8601 (last[0]));
        // console.log ('total', response.length, 'candles');
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch (default 500, max 1000)
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['limit'] = 1000;
        } else {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        }
        const response = await this.publicGetOpenapiQuoteV1Trades (this.extend (request, params));
        //
        //     [
        //         {
        //             price: '89685.8',
        //             id: '1365561108437680129',
        //             qty: '0.000004',
        //             quoteQty: '0.000004000000000000',
        //             time: '1677523569575',
        //             isBuyerMaker: false,
        //             isBestMatch: true
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve (default 500, max 1000)
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        // to do: write this method properly
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['limit'] = 1000;
        } else {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        }
        const response = await this.privateGetOpenapiV1MyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //         price: '89685.8',
        //         id: '1365561108437680129',
        //         qty: '0.000004',
        //         quoteQty: '0.000004000000000000', // to do: same as qty
        //         time: '1677523569575',
        //         isBuyerMaker: false, // to do: solve this riddle!
        //         isBestMatch: true
        //     },
        //
        // fetchMyTrades
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 1194460299787317856,
        //         "orderId": 1194453774196830977,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "quoteQty": "48.000012",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol']; // to do: should I use this.safeSymbol?
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeString (trade, 'time');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const fee = undefined; // to do
        const type = undefined; // to do
        const side = undefined; // to do
        const takerOrMaker = undefined; // to do
        const costString = undefined; // to do
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name coinsph#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetOpenapiV1Account (params);
        //
        //     {
        //         accountType: 'SPOT',
        //         balances: [
        //             {
        //                 "asset": "BTC",
        //                 "free": "4723846.89208129",
        //                 "locked": "0.00000000"
        //             },
        //             {
        //                 "asset": "LTC",
        //                 "free": "4763368.68006011",
        //                 "locked": "0.00000000"
        //             }
        //         ],
        //         canDeposit: true,
        //         canTrade: true,
        //         canWithdraw: true,
        //         updateTime: '1677430932528'
        //     }
        //
        return this.parseBalance (response);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'balances', []);
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = (side === 'buy') ? 'BUY' : 'SELL';
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'type': 'LIMIT',
            'price': price,
            'quantity': amount,
            'timeInForce': 'GTC',
        };
        const response = await this.privatePostOpenapiV1Order (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchOrder
         * @description fetches information on an order made by the user
         * @param {int|string} id order id
         * @param {string} symbol not used by coinsph fetchOrder ()
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // to do: write this method
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOpenapiV1Order (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = this.privateGetOpenapiV1OpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // to do: write this mithod
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = this.privateGetOpenapiV1HistoryOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by coinsph fetchOrder ()
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // to do: write this method
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteOpenapiV1Order (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#cancelAllOrders
         * @description cancel open orders of market
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // to do: write this mithod
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'], // to do: check if 'symbol' param is mandatory
        };
        const response = this.privateGetOpenapiV1OpenOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    parseOrder (order, market = undefined) {
        // to do: this is in progress
        //
        // createOrder POST /openapi/v1/order
        //     {
        //         "symbol": "BCHUSDT",
        //         "orderId": 1202289462787244800,
        //         "clientOrderId": "165806007267756",
        //         "transactTime": 1656900365976, // to do: check - is it time of creating or last trade
        //         "price": "1",
        //         "origQty": "101",
        //         "executedQty": "101",
        //         "cummulativeQuoteQty": "101",
        //         "status": "FILLED",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "SELL",
        //         "stopPrice": "0",
        //         "origQuoteOrderQty": "0"
        //         "fills": [
        //             {
        //                 "price": "2",
        //                 "qty": "100",
        //                 "commission": "0.01",
        //                 "commissionAsset": "USDT",
        //                 "tradeId": "1205027741844507648"
        //             },
        //             {
        //                 "price": "1",
        //                 "qty": "1",
        //                 "commission": "0.005",
        //                 "commissionAsset": "USDT",
        //                 "tradeId": "1205027331347975169"
        //             }
        //         ]
        //     }
        //
        // fetchOrder GET /openapi/v1/order
        // fetchOpenOrders GET /openapi/v1/openOrders
        // fetchClosedOrders GET /openapi/v1/historyOrders
        // cancelAllOrders DELETE /openapi/v1/openOrders
        //     {
        //         "symbol": "LTCBTC",
        //         "orderId": 1202289462787244800,
        //         "clientOrderId": "165806007267756",
        //         "price": "0.1",
        //         "origQty": "1",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0",
        //         "time": 1499827319559,
        //         "updateTime": 1499827319559,
        //         "isWorking": true,
        //         "origQuoteOrderQty": "0"
        //     }
        //
        // cancelOrder DELETE /openapi/v1/order
        //     {
        //         "symbol": "BCHBUSD",
        //         "orderId": 1205324142243592448,
        //         "clientOrderId": "165830718862761",
        //         "price": "2",
        //         "origQty": "10",
        //         "executedQty": "8",
        //         "cummulativeQuoteQty": "16",
        //         "status": "CANCELED",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "SELL",
        //         "stopPrice": "0",
        //         "origQuoteOrderQty": "0"
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'time', 'transactTime'); // to do: check
        return this.safeOrder ({
            'id': id,
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined, // to do: is it updateTime and transactTime
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': market['symbol'], // to do: should I use this.safeSymbol?
            'type': this.parseOrderType (this.safeString (order, 'type')),
            'timeInForce': this.parseOrderTimeInForce (this.safeString (order, 'timeInForce')),
            'side': this.parseOrderSide (this.safeString (order, 'side')),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': this.safeNumber2 (order, 'stopPrice', 'triggerPrice'), // to do: check stop limit
            'triggerPrice': this.safeNumber2 (order, 'stopPrice', 'triggerPrice'), // to do: check stop limit
            'average': undefined, // to do: check
            'amount': this.safeNumber (order, 'origQty'),
            'cost': this.safeNumber (order, 'cummulativeQuoteQty'), // to do: check
            'filled': this.safeNumber (order, 'executedQty'),
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderSide (status) {
        const statuses = {
            'BUY': 'buy',
            'SELL': 'sell',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        // to do: check if it is right
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
            'STOP_LOSS': 'market',
            'STOP_LOSS_LIMIT': 'limit',
            'TAKE_PROFIT': 'market',
            'TAKE_PROFIT_LIMIT': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PARTIALLY_FILLED': 'open',
            'PARTIALLY_CANCELED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTimeInForce (status) {
        const statuses = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name coinsph#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetOpenapiV1AssetTradeFee (this.extend (request, params));
        //
        //     [
        //       {
        //         "symbol": "ETHUSDT",
        //         "makerCommission": "0.0025",
        //         "takerCommission": "0.003"
        //       }
        //     ]
        //
        const tradingFee = this.safeValue (response, 0, {});
        return this.parseTradingFee (tradingFee, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name coinsph#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetOpenapiV1AssetTradeFee (params);
        //
        //     [
        //         {
        //             symbol: 'ETHPHP',
        //             makerCommission: '0.0025',
        //             takerCommission: '0.003'
        //         },
        //         {
        //             symbol: 'UNIPHP',
        //             makerCommission: '0.0025',
        //             takerCommission: '0.003'
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const fee = this.parseTradingFee (response[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    parseTradingFee (fee, market = undefined) {
        //
        //     {
        //     "symbol": "ETHUSDT",
        //     "makerCommission": "0.0025",
        //     "takerCommission": "0.003"
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol']; // to do: should I use this.safeSymbol?
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'makerCommission'),
            'taker': this.safeNumber (fee, 'takerCommission'),
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        // to do: write this method
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currencies[code]; // to do: make it right
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetOpenapiV1CapitalDepositHistory (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinsph#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the coinsph api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        // to do: write this method
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currencies[code]; // to do: make it right
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetOpenapiV1CapitalWithdrawHistory (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction () {
        // fetchDeposits
        //     {
        //         "coin": "PHP",
        //         "address": "Internal Transfer",
        //         "addressTag": "Internal Transfer",
        //         "amount": "0.02",
        //         "id": "31312321312312312312322",
        //         "network": "Internal",
        //         "transferType": "0",
        //         "status": 3,
        //         "confirmTimes": "",
        //         "unlockConfirm": "",
        //         "txId": "Internal Transfer",
        //         "insertTime": 1657623798000,
        //         "depositOrderId": "the deposit id which created by client"
        //     }
        //
        // fetchWithdrawals
        //     {
        //         "coin": "BTC",
        //         "address": "Internal Transfer",
        //         "amount": "0.1",
        //         "id": "1201515362324421632",
        //         "withdrawOrderId": null,
        //         "network": "Internal",
        //         "transferType": "0",
        //         "status": 0,
        //         "transactionFee": "0",
        //         "confirmNo": 0,
        //         "info": "{}",
        //         "txId": "Internal Transfer",
        //         "applyTime": 1657967792000
        //     }

    }

    urlEncodeQuery (query = {}) {
        // to do: check if it is good and make it transpilable
        let encodedArrayParams = '';
        const keys = Object.keys (query);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.isArray (query[key])) {
                if (i !== 0) {
                    encodedArrayParams += '&';
                }
                const array = query[key];
                query = this.omit (query, key);
                const encodedArrayParam = this.parseArrayParam (array, key);
                encodedArrayParams += encodedArrayParam;
            }
        }
        const encodedQuery = this.urlencode (query);
        if (encodedQuery.length !== 0) {
            return encodedQuery + '&' + encodedArrayParams;
        } else {
            return encodedArrayParams;
        }
    }

    parseArrayParam (array, key) {
        let stringifiedArray = this.json (array);
        stringifiedArray = stringifiedArray.replace ('[', '%5B');
        stringifiedArray = stringifiedArray.replace (']', '%5D');
        const urlEncodedParam = key + '=' + stringifiedArray;
        return urlEncodedParam;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        const endpoint = this.implodeParams (path, params);
        url = url + '/' + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            query = this.extend ({
                'timestamp': this.milliseconds (),
            }, query);
            query = this.urlEncodeQuery (query);
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            url = url + '?' + query + '&signature=' + signature;
            headers = {
                'X-COINS-APIKEY': this.apiKey,
            };
        } else {
            query = this.urlEncodeQuery (query);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
