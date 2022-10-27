'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, ExchangeError, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class btcturk extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': [ 'TR' ], // Turkey
            'rateLimit': 100,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
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
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'timeframes': {
                '1m': 1,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '4h': 240,
                '1d': '1 day',
                '1w': '1 week',
                '1y': '1 year',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153926-efbef500-c2c0-11ea-9842-05b63612c4b9.jpg',
                'api': {
                    'public': 'https://api.btcturk.com/api/v2',
                    'private': 'https://api.btcturk.com/api/v1',
                    'graph': 'https://graph-api.btcturk.com/v1',
                },
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'api': {
                'public': {
                    'get': {
                        'orderbook': 1,
                        'ticker': 0.1,
                        'trades': 1,   // ?last=COUNT (max 50)
                        'server/exchangeinfo': 1,
                    },
                },
                'private': {
                    'get': {
                        'users/balances': 1,
                        'openOrders': 1,
                        'allOrders': 1,
                        'users/transactions/trade': 1,
                    },
                    'post': {
                        'order': 1,
                        'cancelOrder': 1,
                    },
                    'delete': {
                        'order': 1,
                    },
                },
                'graph': {
                    'get': {
                        'ohlcs': 1,
                        'klines/history': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0005'),
                    'taker': this.parseNumber ('0.0009'),
                },
            },
            'exceptions': {
                'exact': {
                    'FAILED_ORDER_WITH_OPEN_ORDERS': InsufficientFunds,
                    'FAILED_LIMIT_ORDER': InvalidOrder,
                    'FAILED_MARKET_ORDER': InvalidOrder,
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name btcturk#fetchMarkets
         * @description retrieves data on all markets for btcturk
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetServerExchangeinfo (params);
        //
        //    {
        //        "data": {
        //            "timeZone": "UTC",
        //            "serverTime": "1618826678404",
        //            "symbols": [
        //                {
        //                    "id": "1",
        //                    "name": "BTCTRY",
        //                    "nameNormalized": "BTC_TRY",
        //                    "status": "TRADING",
        //                    "numerator": "BTC",
        //                    "denominator": "TRY",
        //                    "numeratorScale": "8",
        //                    "denominatorScale": "2",
        //                    "hasFraction": false,
        //                    "filters": [
        //                        {
        //                            "filterType": "PRICE_FILTER",
        //                            "minPrice": "0.0000000000001",
        //                            "maxPrice": "10000000",
        //                            "tickSize": "10",
        //                            "minExchangeValue": "99.91",
        //                            "minAmount": null,
        //                            "maxAmount": null
        //                        }
        //                    ],
        //                    "orderMethods": [
        //                        "MARKET",
        //                        "LIMIT",
        //                        "STOP_MARKET",
        //                        "STOP_LIMIT"
        //                    ],
        //                    "displayFormat": "#,###",
        //                    "commissionFromNumerator": false,
        //                    "order": "1000",
        //                    "priceRounding": false
        //                },
        //                ...
        //            },
        //        ],
        //    }
        //
        const data = this.safeValue (response, 'data');
        const markets = this.safeValue (data, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const id = this.safeString (entry, 'name');
            const baseId = this.safeString (entry, 'numerator');
            const quoteId = this.safeString (entry, 'denominator');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const filters = this.safeValue (entry, 'filters', []);
            let minPrice = undefined;
            let maxPrice = undefined;
            let minAmount = undefined;
            let maxAmount = undefined;
            let minCost = undefined;
            for (let j = 0; j < filters.length; j++) {
                const filter = filters[j];
                const filterType = this.safeString (filter, 'filterType');
                if (filterType === 'PRICE_FILTER') {
                    minPrice = this.safeNumber (filter, 'minPrice');
                    maxPrice = this.safeNumber (filter, 'maxPrice');
                    minAmount = this.safeNumber (filter, 'minAmount');
                    maxAmount = this.safeNumber (filter, 'maxAmount');
                    minCost = this.safeNumber (filter, 'minExchangeValue');
                }
            }
            const status = this.safeString (entry, 'status');
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
                'active': (status === 'TRADING'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (entry, 'numeratorScale'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (entry, 'denominatorScale'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'price': {
                        'min': minPrice,
                        'max': maxPrice,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': entry,
            });
        }
        return result;
    }

    parseBalance (response) {
        const data = this.safeValue (response, 'data', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (entry, 'balance');
            account['free'] = this.safeString (entry, 'free');
            account['used'] = this.safeString (entry, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name btcturk#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetUsersBalances (params);
        //
        //     {
        //       "data": [
        //         {
        //           "asset": "TRY",
        //           "assetname": "Türk Lirası",
        //           "balance": "0",
        //           "locked": "0",
        //           "free": "0",
        //           "orderFund": "0",
        //           "requestFund": "0",
        //           "precision": 2
        //         }
        //       ]
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairSymbol': market['id'],
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //     {
        //       "data": {
        //         "timestamp": 1618827901241,
        //         "bids": [
        //           [
        //             "460263.00",
        //             "0.04244000"
        //           ]
        //         ]
        //       }
        //     }
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
    }

    parseTicker (ticker, market = undefined) {
        //
        //   {
        //     "pair": "BTCTRY",
        //     "pairNormalized": "BTC_TRY",
        //     "timestamp": 1618826361234,
        //     "last": 462485,
        //     "high": 473976,
        //     "low": 444201,
        //     "bid": 461928,
        //     "ask": 462485,
        //     "open": 456915,
        //     "volume": 917.41368645,
        //     "average": 462868.29574589,
        //     "daily": 5570,
        //     "dailyPercent": 1.22,
        //     "denominatorSymbol": "TRY",
        //     "numeratorSymbol": "BTC",
        //     "order": 1000
        //   }
        //
        const marketId = this.safeString (ticker, 'pair');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'daily'),
            'percentage': this.safeString (ticker, 'dailyPercent'),
            'average': this.safeString (ticker, 'average'),
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const tickers = this.safeValue (response, 'data');
        return this.parseTickers (tickers, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name btcturk#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const tickers = await this.fetchTickers ([ symbol ], params);
        return this.safeValue (tickers, symbol);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //       "pair": "BTCUSDT",
        //       "pairNormalized": "BTC_USDT",
        //       "numerator": "BTC",
        //       "denominator": "USDT",
        //       "date": "1618916879083",
        //       "tid": "637545136790672520",
        //       "price": "55774",
        //       "amount": "0.27917100",
        //       "side": "buy"
        //     }
        //
        // fetchMyTrades
        //     {
        //       "price": "56000",
        //       "numeratorSymbol": "BTC",
        //       "denominatorSymbol": "USDT",
        //       "orderType": "buy",
        //       "orderId": "2606935102",
        //       "id": "320874372",
        //       "timestamp": "1618916479593",
        //       "amount": "0.00020000",
        //       "fee": "0",
        //       "tax": "0"
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'date', 'timestamp');
        const id = this.safeString2 (trade, 'tid', 'id');
        const order = this.safeString (trade, 'orderId');
        const priceString = this.safeString (trade, 'price');
        const amountString = Precise.stringAbs (this.safeString (trade, 'amount'));
        const marketId = this.safeString (trade, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeString2 (trade, 'side', 'orderType');
        let fee = undefined;
        const feeAmountString = this.safeString (trade, 'fee');
        if (feeAmountString !== undefined) {
            const feeCurrency = this.safeString (trade, 'denominatorSymbol');
            fee = {
                'cost': Precise.stringAbs (feeAmountString),
                'currency': this.safeCurrencyCode (feeCurrency),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // let maxCount = 50;
        const request = {
            'pairSymbol': market['id'],
        };
        if (limit !== undefined) {
            request['last'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //       "data": [
        //         {
        //           "pair": "BTCTRY",
        //           "pairNormalized": "BTC_TRY",
        //           "numerator": "BTC",
        //           "denominator": "TRY",
        //           "date": 1618828421497,
        //           "tid": "637544252214980918",
        //           "price": "462585.00",
        //           "amount": "0.01618411",
        //           "side": "sell"
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        'timestamp': 1661990400,
        //        'high': 368388.0,
        //        'open': 368388.0,
        //        'low': 368388.0,
        //        'close': 368388.0,
        //        'volume': 0.00035208,
        //    }
        //
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.btcturk.com/public-endpoints/get-kline-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.safeValue (this.timeframes, timeframe, timeframe), // allows the user to pass custom timeframes if needed
        };
        const until = this.safeInteger (params, 'until', this.milliseconds ());
        request['to'] = parseInt (until / 1000);
        if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
        } else if (limit === undefined) { // since will also be undefined
            limit = 100; // default value
        }
        if (limit !== undefined) {
            if (timeframe === '1y') { // difficult with leap years
                throw new BadRequest (this.id + ' fetchOHLCV () does not accept a limit parameter when timeframe == "1y"');
            }
            const seconds = this.parseTimeframe (timeframe);
            const limitSeconds = seconds * (limit - 1);
            if (since !== undefined) {
                const to = parseInt (since / 1000) + limitSeconds;
                request['to'] = Math.min (request['to'], to);
            } else {
                request['from'] = parseInt (until / 1000) - limitSeconds;
            }
        }
        const response = await this.graphGetKlinesHistory (this.extend (request, params));
        //
        //    {
        //        "s": "ok",
        //        "t": [
        //          1661990400,
        //          1661990520,
        //          ...
        //        ],
        //        "h": [
        //          368388.0,
        //          369090.0,
        //          ...
        //        ],
        //        "o": [
        //          368388.0,
        //          368467.0,
        //          ...
        //        ],
        //        "l": [
        //          368388.0,
        //          368467.0,
        //          ...
        //        ],
        //        "c": [
        //          368388.0,
        //          369090.0,
        //          ...
        //        ],
        //        "v": [
        //          0.00035208,
        //          0.2972395,
        //          ...
        //        ]
        //    }
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const results = [];
        const timestamp = this.safeValue (ohlcvs, 't');
        const high = this.safeValue (ohlcvs, 'h');
        const open = this.safeValue (ohlcvs, 'o');
        const low = this.safeValue (ohlcvs, 'l');
        const close = this.safeValue (ohlcvs, 'c');
        const volume = this.safeValue (ohlcvs, 'v');
        for (let i = 0; i < timestamp.length; i++) {
            const ohlcv = {
                'timestamp': this.safeValue (timestamp, i),
                'high': this.safeValue (high, i),
                'open': this.safeValue (open, i),
                'low': this.safeValue (low, i),
                'close': this.safeValue (close, i),
                'volume': this.safeValue (volume, i),
            };
            results.push (this.parseOHLCV (ohlcv, market));
        }
        const sorted = this.sortBy (results, 0);
        const tail = (since === undefined);
        return this.filterBySinceLimit (sorted, since, limit, 0, tail);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderType': side,
            'orderMethod': type,
            'pairSymbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type !== 'market') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if ('clientOrderId' in params) {
            request['newClientOrderId'] = params['clientOrderId'];
        } else if (!('newClientOrderId' in params)) {
            request['newClientOrderId'] = this.uuid ();
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by btcturk cancelOrder ()
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrder (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pairSymbol'] = market['id'];
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const bids = this.safeValue (data, 'bids', []);
        const asks = this.safeValue (data, 'asks', []);
        return this.parseOrders (this.arrayConcat (bids, asks), market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairSymbol': market['id'],
        };
        if (limit !== undefined) {
            // default 100 max 1000
            request['last'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = Math.floor (since / 1000);
        }
        const response = await this.privateGetAllOrders (this.extend (request, params));
        // {
        //   "data": [
        //     {
        //       "id": "2606012912",
        //       "price": "55000",
        //       "amount": "0.0003",
        //       "quantity": "0.0003",
        //       "stopPrice": "0",
        //       "pairSymbol": "BTCUSDT",
        //       "pairSymbolNormalized": "BTC_USDT",
        //       "type": "buy",
        //       "method": "limit",
        //       "orderClientId": "2ed187bd-59a8-4875-a212-1b793963b85c",
        //       "time": "1618913189253",
        //       "updateTime": "1618913189253",
        //       "status": "Untouched",
        //       "leftAmount": "0.0003000000000000"
        //     }
        //   ]
        // }
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Untouched': 'open',
            'Partial': 'open',
            'Canceled': 'canceled',
            'Closed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market) {
        //
        // fetchOrders / fetchOpenOrders
        //     {
        //       "id": 2605984008,
        //       "price": "55000",
        //       "amount": "0.00050000",
        //       "quantity": "0.00050000",
        //       "stopPrice": "0",
        //       "pairSymbol": "BTCUSDT",
        //       "pairSymbolNormalized": "BTC_USDT",
        //       "type": "buy",
        //       "method": "limit",
        //       "orderClientId": "f479bdb6-0965-4f03-95b5-daeb7aa5a3a5",
        //       "time": 0,
        //       "updateTime": 1618913083543,
        //       "status": "Untouched",
        //       "leftAmount": "0.00050000"
        //     }
        //
        // createOrder
        //     {
        //       "id": "2606935102",
        //       "quantity": "0.0002",
        //       "price": "56000",
        //       "stopPrice": null,
        //       "newOrderClientId": "98e5c491-7ed9-462b-9666-93553180fb28",
        //       "type": "buy",
        //       "method": "limit",
        //       "pairSymbol": "BTCUSDT",
        //       "pairSymbolNormalized": "BTC_USDT",
        //       "datetime": "1618916479523"
        //     }
        //
        const id = this.safeString (order, 'id');
        const price = this.safeString (order, 'price');
        const amountString = this.safeString2 (order, 'amount', 'quantity');
        const amount = Precise.stringAbs (amountString);
        const remaining = this.safeString (order, 'leftAmount');
        const marketId = this.safeString (order, 'pairSymbol');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeString (order, 'type');
        const type = this.safeString (order, 'method');
        const clientOrderId = this.safeString (order, 'orderClientId');
        const timestamp = this.safeInteger2 (order, 'updateTime', 'datetime');
        const rawStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (rawStatus);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'price': price,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'cost': undefined,
            'average': undefined,
            'status': status,
            'side': side,
            'type': type,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'fee': undefined,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcturk#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the btcturk api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetUsersTransactionsTrade ();
        //
        //     {
        //       "data": [
        //         {
        //           "price": "56000",
        //           "numeratorSymbol": "BTC",
        //           "denominatorSymbol": "USDT",
        //           "orderType": "buy",
        //           "orderId": "2606935102",
        //           "id": "320874372",
        //           "timestamp": "1618916479593",
        //           "amount": "0.00020000",
        //           "fee": "0",
        //           "tax": "0"
        //         }
        //       ],
        //       "success": true,
        //       "message": "SUCCESS",
        //       "code": "0"
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id === 'btctrader') {
            throw new ExchangeError (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        }
        let url = this.urls['api'][api] + '/' + path;
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.base64ToBinary (this.secret);
            const auth = this.apiKey + nonce;
            headers = {
                'X-PCK': this.apiKey,
                'X-Stamp': nonce,
                'X-Signature': this.hmac (this.encode (auth), secret, 'sha256', 'base64'),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code', '0');
        const message = this.safeString (response, 'message');
        const output = (message === undefined) ? body : message;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + output);
        if ((errorCode !== '0') && (errorCode !== 'SUCCESS')) {
            throw new ExchangeError (this.id + ' ' + output);
        }
    }
};
