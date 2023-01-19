'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, RateLimitExceeded, BadSymbol, ArgumentsRequired, PermissionDenied, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

module.exports = class wazirx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'wazirx',
            'name': 'WazirX',
            'countries': [ 'IN' ],
            'version': 'v2',
            'rateLimit': 1000,
            'pro': true,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/148647666-c109c20b-f8ac-472f-91c3-5f658cb90f49.jpeg',
                'api': {
                    'rest': 'https://api.wazirx.com/sapi/v1',
                },
                'www': 'https://wazirx.com',
                'doc': 'https://docs.wazirx.com/#public-rest-api-for-wazirx',
                'fees': 'https://wazirx.com/fees',
                'referral': 'https://wazirx.com/invite/k7rrnks5',
            },
            'api': {
                'public': {
                    'get': {
                        'exchangeInfo': 1,
                        'depth': 1,
                        'ping': 1,
                        'systemStatus': 1,
                        'tickers/24hr': 1,
                        'ticker/24hr': 1,
                        'time': 1,
                        'trades': 1,
                        'klines': 1,
                    },
                },
                'private': {
                    'get': {
                        'account': 1,
                        'allOrders': 1,
                        'funds': 1,
                        'historicalTrades': 1,
                        'openOrders': 1,
                        'order': 1,
                        'myTrades': 1,
                    },
                    'post': {
                        'order': 1,
                        'order/test': 1,
                    },
                    'delete': {
                        'order': 1,
                        'openOrders': 1,
                    },
                },
            },
            'fees': {
                'WRX': { 'maker': this.parseNumber ('0.0'), 'taker': this.parseNumber ('0.0') },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '-1121': BadSymbol, // { "code": -1121, "message": "Invalid symbol." }
                    '1999': BadRequest, // {"code":1999,"message":"symbol is missing, symbol does not have a valid value"} message varies depending on the error
                    '2002': InsufficientFunds, // {"code":2002,"message":"Not enough USDT balance to execute this order"}
                    '2005': BadRequest, // {"code":2005,"message":"Signature is incorrect."}
                    '2078': PermissionDenied, // {"code":2078,"message":"Permission denied."}
                    '2098': BadRequest, // {"code":2098,"message":"Request out of receiving window."}
                    '2031': InvalidOrder, // {"code":2031,"message":"Minimum buy amount must be worth 2.0 USDT"}
                    '2113': BadRequest, // {"code":2113,"message":"RecvWindow must be in range 1..60000"}
                    '2115': BadRequest, // {"code":2115,"message":"Signature not found."}
                    '2136': RateLimitExceeded, // {"code":2136,"message":"Too many api request"}
                    '94001': InvalidOrder, // {"code":94001,"message":"Stop price not found."}
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'options': {
                // 'fetchTradesMethod': 'privateGetHistoricalTrades',
                'recvWindow': 10000,
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name wazirx#fetchMarkets
         * @description retrieves data on all markets for wazirx
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetExchangeInfo (params);
        //
        // {
        //     "timezone":"UTC",
        //     "serverTime":1641336850932,
        //     "symbols":[
        //     {
        //         "symbol":"btcinr",
        //         "status":"trading",
        //         "baseAsset":"btc",
        //         "quoteAsset":"inr",
        //         "baseAssetPrecision":5,
        //         "quoteAssetPrecision":0,
        //         "orderTypes":[
        //             "limit",
        //             "stop_limit"
        //         ],
        //         "isSpotTradingAllowed":true,
        //         "filters":[
        //             {
        //                 "filterType":"PRICE_FILTER",
        //                 "minPrice":"1",
        //                 "tickSize":"1"
        //             }
        //         ]
        //     },
        //
        const markets = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const isSpot = this.safeValue (market, 'isSpotTradingAllowed');
            const filters = this.safeValue (market, 'filters');
            let minPrice = undefined;
            for (let j = 0; j < filters.length; j++) {
                const filter = filters[j];
                const filterType = this.safeString (filter, 'filterType');
                if (filterType === 'PRICE_FILTER') {
                    minPrice = this.safeNumber (filter, 'minPrice');
                }
            }
            const fee = this.safeValue (this.fees, quote, {});
            let takerString = this.safeString (fee, 'taker', '0.2');
            takerString = Precise.stringDiv (takerString, '100');
            let makerString = this.safeString (fee, 'maker', '0.2');
            makerString = Precise.stringDiv (makerString, '100');
            const status = this.safeString (market, 'status');
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
                'spot': isSpot,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (status === 'trading'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.parseNumber (takerString),
                'maker': this.parseNumber (makerString),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'baseAssetPrecision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteAssetPrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': minPrice,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents. Available values [1m,5m,15m,30m,1h,2h,4h,6h,12h,1d,1w]
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @param {int|undefined} params.until timestamp in s of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'until' ]);
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000);
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        //
        //    [
        //        [1669014360,1402001,1402001,1402001,1402001,0],
        //        ...
        //    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    [1669014300,1402001,1402001,1402001,1402001,0],
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // [1, 5, 10, 20, 50, 100, 500, 1000]
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //          "timestamp":1559561187,
        //          "asks":[
        //                     ["8540.0","1.5"],
        //                     ["8541.0","0.0042"]
        //                 ],
        //          "bids":[
        //                     ["8530.0","0.8814"],
        //                     ["8524.0","1.4"]
        //                 ]
        //      }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name wazirx#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetTicker24hr (this.extend (request, params));
        //
        // {
        //     "symbol":"wrxinr",
        //     "baseAsset":"wrx",
        //     "quoteAsset":"inr",
        //     "openPrice":"94.77",
        //     "lowPrice":"92.7",
        //     "highPrice":"95.17",
        //     "lastPrice":"94.03",
        //     "volume":"1118700.0",
        //     "bidPrice":"94.02",
        //     "askPrice":"94.03",
        //     "at":1641382455000
        // }
        //
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers24hr ();
        //
        // [
        //     {
        //        "symbol":"btcinr",
        //        "baseAsset":"btc",
        //        "quoteAsset":"inr",
        //        "openPrice":"3698486",
        //        "lowPrice":"3641155.0",
        //        "highPrice":"3767999.0",
        //        "lastPrice":"3713212.0",
        //        "volume":"254.11582",
        //        "bidPrice":"3715021.0",
        //        "askPrice":"3715022.0",
        //     }
        //     ...
        // ]
        //
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const parsedTicker = this.parseTicker (ticker);
            const symbol = parsedTicker['symbol'];
            result[symbol] = parsedTicker;
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // Default 500; max 1000.
        }
        const method = this.safeString (this.options, 'fetchTradesMethod', 'publicGetTrades');
        const response = await this[method] (this.extend (request, params));
        // [
        //     {
        //         "id":322307791,
        //         "price":"93.7",
        //         "qty":"0.7",
        //         "quoteQty":"65.59",
        //         "time":1641386701000,
        //         "isBuyerMaker":false
        //     },
        // ]
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "id":322307791,
        //         "price":"93.7",
        //         "qty":"0.7",
        //         "quoteQty":"65.59",
        //         "time":1641386701000,
        //         "isBuyerMaker":false
        //     }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeInteger (trade, 'time');
        const datetime = this.iso8601 (timestamp);
        market = this.safeMarket (undefined, market);
        const isBuyerMaker = this.safeValue (trade, 'isBuyerMaker');
        const side = isBuyerMaker ? 'sell' : 'buy';
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'qty');
        const cost = this.safeNumber (trade, 'quoteQty');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': market['symbol'],
            'order': id,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name wazirx#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const response = await this.publicGetSystemStatus (params);
        //
        //     {
        //         "status":"normal", // normal, system maintenance
        //         "message":"System is running normally."
        //     }
        //
        const status = this.safeString (response, 'status');
        return {
            'status': (status === 'normal') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name wazirx#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "serverTime":1635467280514
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //        "symbol":"btcinr",
        //        "baseAsset":"btc",
        //        "quoteAsset":"inr",
        //        "openPrice":"3698486",
        //        "lowPrice":"3641155.0",
        //        "highPrice":"3767999.0",
        //        "lastPrice":"3713212.0",
        //        "volume":"254.11582", // base volume
        //        "bidPrice":"3715021.0",
        //        "askPrice":"3715022.0",
        //        "at":1641382455000 // only on fetchTicker
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'lastPrice');
        const open = this.safeString (ticker, 'openPrice');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const baseVolume = this.safeString (ticker, 'volume');
        const bid = this.safeString (ticker, 'bidPrice');
        const ask = this.safeString (ticker, 'askPrice');
        const timestamp = this.safeInteger (ticker, 'at');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
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
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    parseBalance (response) {
        const result = { };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const id = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name wazirx#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetFunds (params);
        //
        // [
        //       {
        //          "asset":"inr",
        //          "free":"0.0",
        //          "locked":"0.0"
        //       },
        // ]
        //
        return this.parseBalance (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAllOrders (this.extend (request, params));
        //
        //   [
        //       {
        //           "id": 28,
        //           "symbol": "wrxinr",
        //           "price": "9293.0",
        //           "origQty": "10.0",
        //           "executedQty": "8.2",
        //           "status": "cancel",
        //           "type": "limit",
        //           "side": "sell",
        //           "createdTime": 1499827319559,
        //           "updatedTime": 1499827319559
        //       },
        //       {
        //           "id": 30,
        //           "symbol": "wrxinr",
        //           "price": "9293.0",
        //           "stopPrice": "9200.0",
        //           "origQty": "10.0",
        //           "executedQty": "0.0",
        //           "status": "cancel",
        //           "type": "stop_limit",
        //           "side": "sell",
        //           "createdTime": 1499827319559,
        //           "updatedTime": 1507725176595
        //       }
        //   ]
        //
        let orders = this.parseOrders (response, market, since, limit);
        orders = this.filterBy (orders, 'symbol', symbol);
        return orders;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        // [
        //     {
        //         "id": 28,
        //         "symbol": "wrxinr",
        //         "price": "9293.0",
        //         "origQty": "10.0",
        //         "executedQty": "8.2",
        //         "status": "cancel",
        //         "type": "limit",
        //         "side": "sell",
        //         "createdTime": 1499827319559,
        //         "updatedTime": 1499827319559
        //     },
        //     {
        //         "id": 30,
        //         "symbol": "wrxinr",
        //         "price": "9293.0",
        //         "stopPrice": "9200.0",
        //         "origQty": "10.0",
        //         "executedQty": "0.0",
        //         "status": "cancel",
        //         "type": "stop_limit",
        //         "side": "sell",
        //         "createdTime": 1499827319559,
        //         "updatedTime": 1507725176595
        //     }
        // ]
        const orders = this.parseOrders (response, market, since, limit);
        return orders;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        return await this.privateDeleteOpenOrders (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        type = type.toLowerCase ();
        if ((type !== 'limit') && (type !== 'stop_limit')) {
            throw new ExchangeError (this.id + ' createOrder() supports limit and stop_limit orders only');
        }
        if (price === undefined) {
            throw new ExchangeError (this.id + ' createOrder() requires a price argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side,
            'quantity': amount,
            'type': 'limit',
        };
        request['price'] = this.priceToPrecision (symbol, price);
        const stopPrice = this.safeString (params, 'stopPrice');
        if (stopPrice !== undefined) {
            request['type'] = 'stop_limit';
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        // {
        //     "id": 28,
        //     "symbol": "wrxinr",
        //     "price": "9293.0",
        //     "origQty": "10.0",
        //     "executedQty": "8.2",
        //     "status": "wait",
        //     "type": "limit",
        //     "side": "sell",
        //     "createdTime": 1499827319559,
        //     "updatedTime": 1499827319559
        // }
        return this.parseOrder (response, market);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "id":1949417813,
        //     "symbol":"ltcusdt",
        //     "type":"limit",
        //     "side":"sell",
        //     "status":"done",
        //     "price":"146.2",
        //     "origQty":"0.05",
        //     "executedQty":"0.05",
        //     "createdTime":1641252564000,
        //     "updatedTime":1641252564000
        // },
        const created = this.safeInteger (order, 'createdTime');
        const updated = this.safeInteger (order, 'updatedTime');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeString (order, 'quantity');
        const filled = this.safeString (order, 'executedQty');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const price = this.safeString (order, 'price');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
            'average': undefined,
            'trades': [],
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            let data = this.extend ({ 'recvWindow': this.options['recvWindow'], 'timestamp': timestamp }, params);
            data = this.keysort (data);
            const signature = this.hmac (this.encode (this.urlencode (data)), this.encode (this.secret), 'sha256');
            url += '?' + this.urlencode (data);
            url += '&' + 'signature=' + signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Api-Key': this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // {"code":2098,"message":"Request out of receiving window."}
        //
        if (response === undefined) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
