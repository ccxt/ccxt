'use strict';

//  ---------------------------------------------------------------------------

const poloniexRest = require ('../poloniex.js');
const { BadRequest } = require ('../base/errors');
const { AuthenticationError } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');
const Precise = require ('../base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends poloniexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchBalance': true,
                'watchStatus': false,
                'watchOrders': true,
                'watchMyTrades': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.poloniex.com/ws/public',
                        'private': 'wss://ws.poloniex.com/ws/private',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchOrderBookMethod': 'book_lv2', // can also be 'book'
                'connectionsLimit': 2000, // 2000 public, 2000 private, 4000 total, only for subscribe events, unsubscribe not restricted
                'requestsLimit': 500, // per second, only for subscribe events, unsubscribe not restricted
                'channelToTimeframe': {
                    'candles_minute_1': '1m',
                    'candles_minute_5': '5m',
                    'candles_minute_10': '10m',
                    'candles_minute_15': '15m',
                    'candles_minute_30': '30m',
                    'candles_hour_1': '1h',
                    'candles_hour_2': '2h',
                    'candles_hour_4': '4h',
                    'candles_hour_6': '6h',
                    'candles_hour_12': '12h',
                    'candles_day_1': '1d',
                    'candles_day_3': '3d',
                    'candles_week_1': '1w',
                    'candles_month_1': '1m',
                },
                'ohlcvChannels': {
                    '1m': 'candles_minute_1',
                    '5m': 'candles_minute_5',
                    '10m': 'candles_minute_10',
                    '15m': 'candles_minute_15',
                    '30m': 'candles_minute_30',
                    '1h': 'candles_hour_1',
                    '2h': 'candles_hour_2',
                    '4h': 'candles_hour_4',
                    '6h': 'candles_hour_6',
                    '12h': 'candles_hour_12',
                    '1d': 'candles_day_1',
                    '3d': 'candles_day_3',
                    '1w': 'candles_week_1',
                    '1M': 'candles_month_1',
                },
            },
        });
    }

    async authenticate (params = {}) {
        /**
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @see https://docs.poloniex.com/#authenticated-channels-market-data-authentication
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        const timestamp = this.milliseconds ();
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'authenticated';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const accessPath = '/ws';
            const requestString = 'GET\n' + accessPath + '\nsignTimestamp=' + timestamp;
            // let expires = this.milliseconds () + 10000;
            // expires = expires.toString ();
            const signature = this.hmac (this.encode (requestString), this.encode (this.secret), 'sha256', 'base64');
            const request = {
                'event': 'subscribe',
                'channel': [ 'auth' ],
                'params': {
                    'key': this.apiKey,
                    'signTimestamp': timestamp,
                    'signature': signature,
                    'signatureMethod': 'HmacSHA256',  // optional
                    'signatureVersion': '2',          // optional
                },
            };
            const message = this.extend (request, params);
            future = await this.watch (url, messageHash, message);
            //
            //    {
            //        "data": {
            //            "success": true,
            //            "ts": 1645597033915
            //        },
            //        "channel": "auth"
            //    }
            //
            //    # Failure to return results
            //
            //    {
            //        "data": {
            //            "success": false,
            //            "message": "Authentication failed!",
            //            "ts": 1646276295075
            //        },
            //        "channel": "auth"
            //    }
            //
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    async subscribe (name, isPrivate, symbols = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {String} name name of the channel
         * @param {Bool} isPrivate true for the authenticated url, false for the public url
         * @param {[String]|undefined} symbols CCXT market symbols
         * @param {Object} params extra parameters specific to the poloniex api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        const publicOrPrivate = isPrivate ? 'private' : 'public';
        const url = this.urls['api']['ws'][publicOrPrivate];
        const subscribe = {
            'event': 'subscribe',
            'channel': [
                name,
            ],
        };
        const marketIds = [ ];
        let messageHash = name;
        if (symbols !== undefined) {
            if (symbols.length === 1) {
                const symbol = symbols[0];
                const marketId = this.marketId (symbol);
                marketIds.push (marketId);
                messageHash = messageHash + ':' + marketId;
            }
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                marketIds.push (this.marketId (symbol));
            }
        } else {
            marketIds.push ('all');
        }
        if (name !== 'balances') {
            subscribe['symbols'] = marketIds;
        }
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.poloniex.com/#public-channels-market-data-candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns [[int]] A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const channels = this.options['ohlcvChannels'];
        const channel = this.safeString (channels, timeframe);
        if (channel === undefined) {
            throw new BadRequest (this.id + ' watchOHLCV cannot take a timeframe of ' + timeframe);
        }
        const ohlcv = await this.subscribe (channel, false, [ symbol ], params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name poloniex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.poloniex.com/#public-channels-market-data-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'ticker';
        return await this.subscribe (name, false, [ symbol ], params);
    }

    async watchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.poloniex.com/#public-channels-market-data-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'ticker';
        return await this.subscribe (name, false, symbols, params);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.poloniex.com/#public-channels-market-data-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const name = 'trades';
        const trades = await this.subscribe (name, false, [ symbol ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.poloniex.com/#public-channels-market-data-book-level-2
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit not used by poloniex watchOrderBook
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        let name = this.safeString (this.options, 'watchOrderBookMethod', 'book_lv2');
        [ name, params ] = this.handleOptionAndParams (params, 'watchOrderBookMethod', 'name', name);
        const orderbook = await this.subscribe (name, false, [ symbol ], params);
        return orderbook.limit ();
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.poloniex.com/#authenticated-channels-market-data-orders
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since not used by poloniex watchOrders
         * @param {int|undefined} limit not used by poloniex watchOrders
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = 'orders';
        await this.authenticate ();
        const orders = await this.subscribe (name, true, [ symbol ], params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchBalance (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.poloniex.com/#authenticated-channels-market-data-balances
         * @param {string|undefined} symbol not used by poloniex watchBalance
         * @param {int|undefined} since not used by poloniex watchBalance
         * @param {int|undefined} limit not used by poloniex watchBalance
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = 'balances';
        await this.authenticate ();
        return await this.subscribe (name, true, undefined, params);
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        symbol: 'BTC_USDT',
        //        amount: '840.7240416',
        //        high: '24832.35',
        //        quantity: '0.033856',
        //        tradeCount: 1,
        //        low: '24832.35',
        //        closeTime: 1676942519999,
        //        startTime: 1676942460000,
        //        close: '24832.35',
        //        open: '24832.35',
        //        ts: 1676942492072
        //    }
        //
        return [
            this.safeInteger (ohlcv, 'startTime'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'amount'),
        ];
    }

    handleOHLCV (client, message) {
        //
        //    {
        //        channel: 'candles_minute_1',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                amount: '840.7240416',
        //                high: '24832.35',
        //                quantity: '0.033856',
        //                tradeCount: 1,
        //                low: '24832.35',
        //                closeTime: 1676942519999,
        //                startTime: 1676942460000,
        //                close: '24832.35',
        //                open: '24832.35',
        //                ts: 1676942492072
        //            }
        //        ]
        //    }
        //
        let data = this.safeValue (message, 'data');
        data = this.safeValue (data, 0);
        const channel = this.safeString (message, 'channel');
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (symbol);
        const timeframe = this.options['channelToTimeframe'][channel];
        const messageHash = channel + ':' + marketId;
        const parsed = this.parseWsOHLCV (data, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (symbol !== undefined) {
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit');
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            client.resolve (stored, messageHash);
        }
        return message;
    }

    handleTrade (client, message) {
        //
        //    {
        //        channel: 'trades',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                amount: '13.41634893',
        //                quantity: '0.000537',
        //                takerSide: 'buy',
        //                createTime: 1676950548834,
        //                price: '24983.89',
        //                id: '62486976',
        //                ts: 1676950548839
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const marketId = this.safeString (item, 'symbol');
            if (marketId !== undefined) {
                const trade = this.parseWsTrade (item);
                const symbol = trade['symbol'];
                const type = 'trades';
                const messageHash = type + ':' + marketId;
                let tradesArray = this.safeValue (this.trades, symbol);
                if (tradesArray === undefined) {
                    const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                    tradesArray = new ArrayCache (tradesLimit);
                    this.trades[symbol] = tradesArray;
                }
                tradesArray.append (trade);
                client.resolve (tradesArray, messageHash);
            }
        }
        return message;
    }

    parseWsTrade (trade, market = undefined) {
        //
        // handleTrade
        //
        //    {
        //        symbol: 'BTC_USDT',
        //        amount: '13.41634893',
        //        quantity: '0.000537',
        //        takerSide: 'buy',
        //        createTime: 1676950548834,
        //        price: '24983.89',
        //        id: '62486976',
        //        ts: 1676950548839
        //    }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'type': this.safeStringLower (trade, 'type'),
            'side': this.safeString (trade, 'takerSide'),
            'takerOrMaker': 'taker',
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': this.safeString (trade, 'amount'),
            'fee': {
                'rate': undefined,
                'cost': undefined,
                'currency': undefined,
            },
        }, market);
    }

    parseWsOrderTrade (trade, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "type": "LIMIT",
        //        "quantity": "1",
        //        "orderId": "32471407854219264",
        //        "tradeFee": "0",
        //        "clientOrderId": "",
        //        "accountType": "SPOT",
        //        "feeCurrency": "",
        //        "eventType": "place",
        //        "source": "API",
        //        "side": "BUY",
        //        "filledQuantity": "0",
        //        "filledAmount": "0",
        //        "matchRole": "MAKER",
        //        "state": "NEW",
        //        "tradeTime": 0,
        //        "tradeAmount": "0",
        //        "orderAmount": "0",
        //        "createTime": 1648708186922,
        //        "price": "47112.1",
        //        "tradeQty": "0",
        //        "tradePrice": "0",
        //        "tradeId": "0",
        //        "ts": 1648708187469
        //    }
        //
        const timestamp = this.safeInteger (trade, 'tradeTime');
        const marketId = this.safeString (trade, 'symbol');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString (trade, 'orderId'),
            'type': this.safeStringLower (trade, 'type'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'matchRole'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'tradeAmount'), // ? tradeQty?
            'cost': undefined,
            'fee': {
                'rate': undefined,
                'cost': this.safeString (trade, 'tradeFee'),
                'currency': this.safeString (trade, 'feeCurrency'),
            },
        }, market);
    }

    handleOrder (client, message) {
        //
        // Order is created
        //
        //    {
        //        channel: 'orders',
        //        data: [
        //            {
        //                "symbol": "BTC_USDT",
        //                "type": "LIMIT",
        //                "quantity": "1",
        //                "orderId": "32471407854219264",
        //                "tradeFee": "0",
        //                "clientOrderId": "",
        //                "accountType": "SPOT",
        //                "feeCurrency": "",
        //                "eventType": "place",
        //                "source": "API",
        //                "side": "BUY",
        //                "filledQuantity": "0",
        //                "filledAmount": "0",
        //                "matchRole": "MAKER",
        //                "state": "NEW",
        //                "tradeTime": 0,
        //                "tradeAmount": "0",
        //                "orderAmount": "0",
        //                "createTime": 1648708186922,
        //                "price": "47112.1",
        //                "tradeQty": "0",
        //                "tradePrice": "0",
        //                "tradeId": "0",
        //                "ts": 1648708187469
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data');
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const order = this.safeValue (data, 0);
        const marketId = this.safeString (order, 'symbol');
        if (marketId !== undefined) {
            const messageHash = 'orders:' + marketId;
            const symbol = this.safeSymbol (marketId);
            const orderId = this.safeString (order, 'orderId');
            const clientOrderId = this.safeString (order, 'clientOrderId');
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            const previousOrder = this.safeValue2 (previousOrders, orderId, clientOrderId);
            if (previousOrder === undefined) {
                const parsed = this.parseWsOrder (order);
                orders.append (parsed);
                client.resolve (orders, messageHash);
            } else {
                const trade = this.parseWsTrade (order);
                if (previousOrder['trades'] === undefined) {
                    previousOrder['trades'] = [];
                }
                previousOrder['trades'].push (trade);
                previousOrder['lastTradeTimestamp'] = trade['timestamp'];
                let totalCost = 0;
                let totalAmount = 0;
                const trades = previousOrder['trades'];
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    totalCost = this.sum (totalCost, trade['cost']);
                    totalAmount = this.sum (totalAmount, trade['amount']);
                }
                if (totalAmount > 0) {
                    previousOrder['average'] = totalCost / totalAmount;
                }
                previousOrder['cost'] = totalCost;
                if (previousOrder['filled'] !== undefined) { // ? previousOrder['filled'] = 0
                    previousOrder['filled'] += trade['amount'];
                    if (previousOrder['amount'] !== undefined) {
                        previousOrder['remaining'] = previousOrder['amount'] - previousOrder['filled'];
                    }
                }
                if (previousOrder['fee'] === undefined) {
                    previousOrder['fee'] = {
                        'rate': undefined,
                        'cost': 0,
                        'currency': trade['fee']['currency'],
                    };
                }
                if ((previousOrder['fee']['cost'] !== undefined) && (trade['fee']['cost'] !== undefined)) {
                    const stringOrderCost = this.numberToString (previousOrder['fee']['cost']);
                    const stringTradeCost = this.numberToString (trade['fee']['cost']);
                    previousOrder['fee']['cost'] = Precise.stringAdd (stringOrderCost, stringTradeCost);
                }
                // update the newUpdates count
                orders.append (previousOrder);
                client.resolve (orders, messageHash);
                // } else if ((type === 'received') || (type === 'done')) { // TODO?: delete
                //     const info = this.extend (previousOrder['info'], data);
                //     const order = this.parseWsOrder (info);
                //     const keys = Object.keys (order);
                //     // update the reference
                //     for (let i = 0; i < keys.length; i++) {
                //         const key = keys[i];
                //         if (order[key] !== undefined) {
                //             previousOrder[key] = order[key];
                //         }
                //     }
                //     // update the newUpdates count
                //     orders.append (previousOrder);
                //     client.resolve (orders, messageHash);
                // }
            }
        }
        return message;
    }

    parseWsOrder (order, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "type": "LIMIT",
        //        "quantity": "1",
        //        "orderId": "32471407854219264",
        //        "tradeFee": "0",
        //        "clientOrderId": "",
        //        "accountType": "SPOT",
        //        "feeCurrency": "",
        //        "eventType": "place",
        //        "source": "API",
        //        "side": "BUY",
        //        "filledQuantity": "0",
        //        "filledAmount": "0",
        //        "matchRole": "MAKER",
        //        "state": "NEW",
        //        "tradeTime": 0,
        //        "tradeAmount": "0",
        //        "orderAmount": "0",
        //        "createTime": 1648708186922,
        //        "price": "47112.1",
        //        "tradeQty": "0",
        //        "tradePrice": "0",
        //        "tradeId": "0",
        //        "ts": 1648708187469
        //    }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const marketId = this.safeString (order, 'symbol');
        const timestamp = this.safeString (order, 'ts');
        const filledAmount = this.safeString (order, 'filledAmount'); // TODO? filledQuantity
        let trades = undefined;
        if (!Precise.stringEq (filledAmount, '0')) {
            trades = [];
            const trade = this.parseWsOrderTrade (order);
            trades.push (trade);
        }
        return this.safeOrder ({
            'info': order,
            'symbol': this.safeSymbol (marketId, market),
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': this.safeString (order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'orderAmount'),
            'cost': undefined,
            'average': undefined,
            'filled': filledAmount,
            'remaining': this.safeString (order, 'remaining_size'),
            'status': undefined, // TODO?: eventType, state
            'fee': {
                'rate': undefined,
                'cost': this.safeString (order, 'tradeFee'),
                'currency': this.safeString (order, 'feeCurrency'),
            },
            'trades': trades,
        });
    }

    handleTicker (client, message) {
        //
        //    {
        //        channel: 'ticker',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                startTime: 1677280800000,
        //                open: '23154.32',
        //                high: '23212.21',
        //                low: '22761.01',
        //                close: '23148.86',
        //                quantity: '105.179566',
        //                amount: '2423161.17436702',
        //                tradeCount: 17582,
        //                dailyChange: '-0.0002',
        //                markPrice: '23151.09',
        //                closeTime: 1677367197924,
        //                ts: 1677367251090
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data');
        if (data !== undefined) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const marketId = this.safeString (item, 'symbol');
                if (marketId !== undefined) {
                    const ticker = this.parseTicker (item);
                    const symbol = ticker['symbol'];
                    this.tickers[symbol] = ticker;
                    const messageHash = 'ticker:' + marketId;
                    client.resolve (ticker, messageHash);
                }
            }
            client.resolve (this.tickers, 'ticker');
            return message;
        }
    }

    handleOrderBook (client, message) {
        //
        // snapshot
        //
        //    {
        //        channel: 'book_lv2',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                createTime: 1677368876253,
        //                "asks": [
        //                    ["5.65", "0.02"],
        //                    ...
        //                ],
        //                "bids": [
        //                    ["6.16", "0.6"],
        //                    ...
        //                ],
        //                lastId: 164148724,
        //                id: 164148725,
        //                ts: 1677368876316
        //            }
        //        ],
        //        action: 'snapshot'
        //    }
        //
        // update
        //
        //    {
        //        channel: 'book_lv2',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                createTime: 1677368876882,
        //                "asks": [
        //                    ["6.35", "3"]
        //                ],
        //                "bids": [
        //                    ["5.65", "0.02"]
        //                ],
        //                lastId: 164148725,
        //                id: 164148726,
        //                ts: 1677368876890
        //            }
        //        ],
        //        action: 'update'
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const item = this.safeValue (data, 0, {});
        const type = this.safeString (message, 'action');
        const marketId = this.safeString (item, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const name = 'book_lv2';
        const messageHash = name + ':' + marketId;
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        const timestamp = this.safeInteger (item, 'ts');
        const asks = this.safeValue (item, 'asks');
        const bids = this.safeValue (item, 'bids');
        const snapshot = type === 'snapshot';
        const update = type === 'update';
        if (snapshot || update) {
            if (snapshot) {
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            if (bids !== undefined) {
                for (let i = 0; i < bids.length; i++) {
                    const bid = this.safeValue (bids, i);
                    const price = this.safeNumber (bid, 0);
                    const amount = this.safeNumber (bid, 1);
                    orderbook['bids'].store (price, amount);
                }
            }
            if (asks !== undefined) {
                for (let i = 0; i < asks.length; i++) {
                    const ask = this.safeValue (asks, i);
                    const price = this.safeNumber (ask, 0);
                    const amount = this.safeNumber (ask, 1);
                    orderbook['asks'].store (price, amount);
                }
            }
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, messageHash);
        }
    }

    handleBalance (client, message) {
        //
        //    {
        //       "channel": "balances",
        //       "data": [
        //            {
        //                "changeTime": 1657312008411,
        //                "accountId": "1234",
        //                "accountType": "SPOT",
        //                "eventType": "place_order",
        //                "available": "9999999983.668",
        //                "currency": "BTC",
        //                "id": 60018450912695040,
        //                "userId": 12345,
        //                "hold": "16.332",
        //                "ts": 1657312008443
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = 'balances:all';
        this.balance = this.parseWsBalance (data);
        client.resolve (this.balance, messageHash);
    }

    parseWsBalance (response) {
        //
        //    [
        //        {
        //            "changeTime": 1657312008411,
        //            "accountId": "1234",
        //            "accountType": "SPOT",
        //            "eventType": "place_order",
        //            "available": "9999999983.668",
        //            "currency": "BTC",
        //            "id": 60018450912695040,
        //            "userId": 12345,
        //            "hold": "16.332",
        //            "ts": 1657312008443
        //        }
        //    ]
        //
        const firstBalance = this.safeValue (response, 0, {});
        const timestamp = this.safeInteger (firstBalance, 'ts');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeValue (response, i);
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const newAccount = this.account ();
            newAccount['free'] = this.safeString (balance, 'available');
            newAccount['used'] = this.safeString (balance, 'hold');
            result[code] = newAccount;
        }
        return this.safeBalance (result);
    }

    handleMessage (client, message) {
        const type = this.safeString (message, 'channel');
        const event = this.safeString (message, 'event');
        if (event === 'pong') {
            return this.handlePong (client, message);
        }
        const methods = {
            'candles_minute_1': this.handleOHLCV,
            'candles_minute_5': this.handleOHLCV,
            'candles_minute_10': this.handleOHLCV,
            'candles_minute_15': this.handleOHLCV,
            'candles_minute_30': this.handleOHLCV,
            'candles_hour_1': this.handleOHLCV,
            'candles_hour_2': this.handleOHLCV,
            'candles_hour_4': this.handleOHLCV,
            'candles_hour_6': this.handleOHLCV,
            'candles_hour_12': this.handleOHLCV,
            'candles_day_1': this.handleOHLCV,
            'candles_day_3': this.handleOHLCV,
            'candles_week_1': this.handleOHLCV,
            'candles_month_1': this.handleOHLCV,
            'book': this.handleOrderBook,
            'book_lv2': this.handleOrderBook,
            'ticker': this.handleTicker,
            'trades': this.handleTrade,
            'orders': this.handleOrder,
            'balances': this.handleBalance,
        };
        const method = this.safeValue (methods, type);
        if (type === 'auth') {
            this.handleAuthenticate (client, message);
        } else {
            return method.call (this, client, message);
        }
    }

    handleAuthenticate (client, message) {
        //
        //    {
        //        success: true,
        //        ret_msg: '',
        //        op: 'auth',
        //        conn_id: 'ce3dpomvha7dha97tvp0-2xh'
        //    }
        //
        const data = this.safeValue (message, 'data');
        const success = this.safeValue (data, 'success');
        const messageHash = 'authenticated';
        if (success) {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }

    ping (client) {
        return {
            'event': 'ping',
        };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
};

