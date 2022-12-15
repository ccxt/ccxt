'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, AuthenticationError, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lbank extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lbank',
            'name': 'LBank',
            'countries': [ 'CN' ],
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': undefined, // status 0 API doesn't work
                'fetchOrder': true,
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
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'minute1',
                '5m': 'minute5',
                '15m': 'minute15',
                '30m': 'minute30',
                '1h': 'hour1',
                '2h': 'hour2',
                '4h': 'hour4',
                '6h': 'hour6',
                '8h': 'hour8',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg',
                'api': {
                    'rest': 'https://api.lbank.info',
                },
                'www': 'https://www.lbank.info',
                'doc': 'https://github.com/LBank-exchange/lbank-official-api-docs',
                'fees': 'https://www.lbank.info/fees.html',
                'referral': 'https://www.lbank.info/invitevip?icode=7QCY',
            },
            'api': {
                'public': {
                    'get': [
                        'currencyPairs',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                        'accuracy',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'create_order',
                        'cancel_order',
                        'orders_info',
                        'orders_info_history',
                        'withdraw',
                        'withdrawCancel',
                        'withdraws',
                        'withdrawConfigs',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'GMT': 'GMT Token',
                'PNT': 'Penta',
                'SHINJA': 'SHINJA(1M)',
                'VET_ERC20': 'VEN',
            },
            'options': {
                'cacheSecretAsPem': true,
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name lbank#fetchMarkets
         * @description retrieves data on all markets for lbank
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetAccuracy (params);
        //
        //    [
        //        {
        //            "symbol": "btc_usdt",
        //            "quantityAccuracy": "4",
        //            "minTranQua": "0.0001",
        //            "priceAccuracy": "2"
        //        },
        //        ...
        //    ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = market['symbol'];
            const parts = id.split ('_');
            let baseId = undefined;
            let quoteId = undefined;
            const numParts = parts.length;
            // lbank will return symbols like "vet_erc20_usdt"
            if (numParts > 2) {
                baseId = parts[0] + '_' + parts[1];
                quoteId = parts[2];
            } else {
                baseId = parts[0];
                quoteId = parts[1];
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
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
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityAccuracy'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'priceAccuracy'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeFloat (market, 'minTranQua'),
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
                'info': id,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"btc_usdt",
        //         "ticker":{
        //             "high":43416.06,
        //             "vol":7031.7427,
        //             "low":41804.26,
        //             "change":1.33,
        //             "turnover":300302447.81,
        //             "latest":43220.4
        //         },
        //         "timestamp":1642201617747
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const info = ticker;
        ticker = info['ticker'];
        const last = this.safeString (ticker, 'latest');
        const percentage = this.safeString (ticker, 'change');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'turnover'),
            'info': info,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name lbank#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        // {
        //     "symbol":"btc_usdt",
        //     "ticker":{
        //         "high":43416.06,
        //         "vol":7031.7427,
        //         "low":41804.26,
        //         "change":1.33,
        //         "turnover":300302447.81,
        //         "latest":43220.4
        //         },
        //     "timestamp":1642201617747
        // }
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name lbank#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {
            'symbol': 'all',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = 60, params = {}) {
        /**
         * @method
         * @name lbank#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let size = 60;
        if (limit !== undefined) {
            size = Math.min (limit, size);
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'size': size,
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol']);
    }

    parseTrade (trade, market = undefined) {
        market = this.safeMarket (undefined, market);
        const timestamp = this.safeInteger (trade, 'date_ms');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const id = this.safeString (trade, 'tid');
        const type = undefined;
        let side = this.safeString (trade, 'type');
        // remove type additions from i.e. buy_maker, sell_maker, buy_ioc, sell_ioc, buy_fok, sell_fok
        const splited = side.split ('_');
        side = splited[0];
        return {
            'id': id,
            'info': this.safeValue (trade, 'info', trade),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'size': 100,
        };
        if (since !== undefined) {
            request['time'] = parseInt (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1590969600,
        //         0.02451657,
        //         0.02452675,
        //         0.02443701,
        //         0.02447814,
        //         238.38210000
        //     ]
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        /**
         * @method
         * @name lbank#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100; // as it's defined in lbank2
        }
        if (since === undefined) {
            const duration = this.parseTimeframe (timeframe);
            since = this.milliseconds () - duration * 1000 * limit;
        }
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'size': limit,
            'time': parseInt (since / 1000),
        };
        const response = await this.publicGetKline (this.extend (request, params));
        //
        //     [
        //         [1590969600,0.02451657,0.02452675,0.02443701,0.02447814,238.38210000],
        //         [1590969660,0.02447814,0.02449883,0.02443209,0.02445973,212.40270000],
        //         [1590969720,0.02445973,0.02452067,0.02445909,0.02446151,266.16920000],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const info = this.safeValue (response, 'info', {});
        const free = this.safeValue (info, 'free', {});
        const freeze = this.safeValue (info, 'freeze', {});
        const asset = this.safeValue (info, 'asset', {});
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (free, currencyId);
            account['used'] = this.safeString (freeze, currencyId);
            account['total'] = this.safeString (asset, currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name lbank#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostUserInfo (params);
        //
        //     {
        //         "result":"true",
        //         "info":{
        //             "freeze":{
        //                 "iog":"0.00000000",
        //                 "ssc":"0.00000000",
        //                 "eon":"0.00000000",
        //             },
        //             "asset":{
        //                 "iog":"0.00000000",
        //                 "ssc":"0.00000000",
        //                 "eon":"0.00000000",
        //             },
        //             "free":{
        //                 "iog":"0.00000000",
        //                 "ssc":"0.00000000",
        //                 "eon":"0.00000000",
        //             },
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'cancelled', // cancelled
            '0': 'open', // not traded
            '1': 'open', // partial deal
            '2': 'closed', // complete deal
            '4': 'closed', // disposal processing
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "symbol"："eth_btc",
        //         "amount"：10.000000,
        //         "create_time"：1484289832081,
        //         "price"：5000.000000,
        //         "avg_price"：5277.301200,
        //         "type"："sell",
        //         "order_id"："ab704110-af0d-48fd-a083-c218f19a4a55",
        //         "deal_amount"：10.000000,
        //         "status"：2
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeInteger (order, 'create_time');
        // Limit Order Request Returns: Order Price
        // Market Order Returns: cny amount of market order
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'deal_amount');
        const average = this.safeString (order, 'avg_price');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'order_id');
        const type = this.safeString (order, 'order_type');
        const side = this.safeString (order, 'type');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': this.safeValue (order, 'info', order),
            'average': average,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name lbank#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'type': side,
            'amount': amount,
        };
        if (type === 'market') {
            order['type'] += '_market';
        } else {
            order['price'] = price;
        }
        const response = await this.privatePostCreateOrder (this.extend (order, params));
        order = this.omit (order, 'type');
        order['order_id'] = response['order_id'];
        order['type'] = side;
        order['order_type'] = type;
        order['create_time'] = this.milliseconds ();
        order['info'] = response;
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name lbank#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name lbank#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        // Id can be a list of ids delimited by a comma
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostOrdersInfo (this.extend (request, params));
        const data = this.safeValue (response, 'orders', []);
        const orders = this.parseOrders (data, market);
        const numOrders = orders.length;
        if (numOrders === 1) {
            return orders[0];
        } else {
            return orders;
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
        };
        const response = await this.privatePostOrdersInfoHistory (this.extend (request, params));
        const data = this.safeValue (response, 'orders', []);
        return this.parseOrders (data, undefined, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const closed = this.filterBy (orders, 'status', 'closed');
        const canceled = this.filterBy (orders, 'status', 'cancelled'); // cancelled orders may be partially filled
        const allOrders = this.arrayConcat (closed, canceled);
        return this.filterBySymbolSinceLimit (allOrders, symbol, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name lbank#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        // mark and fee are optional params, mark is a note and must be less than 255 characters
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'assetCode': currency['id'],
            'amount': amount,
            'account': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         'result': 'true',
        //         'withdrawId': 90082,
        //         'fee':0.001
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         'result': 'true',
        //         'withdrawId': 90082,
        //         'fee':0.001
        //     }
        //
        currency = this.safeCurrency (undefined, currency);
        return {
            'id': this.safeString2 (transaction, 'id', 'withdrawId'),
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }

    convertSecretToPem (secret) {
        const lineLength = 64;
        const secretLength = secret.length - 0;
        let numLines = parseInt (secretLength / lineLength);
        numLines = this.sum (numLines, 1);
        let pem = "-----BEGIN PRIVATE KEY-----\n"; // eslint-disable-line
        for (let i = 0; i < numLines; i++) {
            const start = i * lineLength;
            const end = this.sum (start, lineLength);
            pem += this.secret.slice (start, end) + "\n"; // eslint-disable-line
        }
        return pem + '-----END PRIVATE KEY-----';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + this.implodeParams (path, params);
        // Every endpoint ends with ".do"
        url += '.do';
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            const queryString = this.rawencode (query);
            const message = this.hash (this.encode (queryString)).toUpperCase ();
            const cacheSecretAsPem = this.safeValue (this.options, 'cacheSecretAsPem', true);
            let pem = undefined;
            if (cacheSecretAsPem) {
                pem = this.safeValue (this.options, 'pem');
                if (pem === undefined) {
                    pem = this.convertSecretToPem (this.secret);
                    this.options['pem'] = pem;
                }
            } else {
                pem = this.convertSecretToPem (this.secret);
            }
            const sign = this.binaryToBase64 (this.rsa (message, this.encode (pem), 'RS256'));
            query['sign'] = sign;
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const success = this.safeString (response, 'result');
        if (success === 'false') {
            const errorCode = this.safeString (response, 'error_code');
            const message = this.safeString ({
                '10000': 'Internal error',
                '10001': 'The required parameters can not be empty',
                '10002': 'verification failed',
                '10003': 'Illegal parameters',
                '10004': 'User requests are too frequent',
                '10005': 'Key does not exist',
                '10006': 'user does not exist',
                '10007': 'Invalid signature',
                '10008': 'This currency pair is not supported',
                '10009': 'Limit orders can not be missing orders and the number of orders',
                '10010': 'Order price or order quantity must be greater than 0',
                '10011': 'Market orders can not be missing the amount of the order',
                '10012': 'market sell orders can not be missing orders',
                '10013': 'is less than the minimum trading position 0.001',
                '10014': 'Account number is not enough',
                '10015': 'The order type is wrong',
                '10016': 'Account balance is not enough',
                '10017': 'Abnormal server',
                '10018': 'order inquiry can not be more than 50 less than one',
                '10019': 'withdrawal orders can not be more than 3 less than one',
                '10020': 'less than the minimum amount of the transaction limit of 0.001',
                '10022': 'Insufficient key authority',
            }, errorCode, this.json (response));
            const ErrorClass = this.safeValue ({
                '10002': AuthenticationError,
                '10004': DDoSProtection,
                '10005': AuthenticationError,
                '10006': AuthenticationError,
                '10007': AuthenticationError,
                '10009': InvalidOrder,
                '10010': InvalidOrder,
                '10011': InvalidOrder,
                '10012': InvalidOrder,
                '10013': InvalidOrder,
                '10014': InvalidOrder,
                '10015': InvalidOrder,
                '10016': InvalidOrder,
                '10022': AuthenticationError,
            }, errorCode, ExchangeError);
            throw new ErrorClass (message);
        }
    }
};
