'use strict';

//  ---------------------------------------------------------------------------

const poloniexRest = require ('../poloniex.js');
const { BadRequest } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

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
                // 'tradesLimit': 1000,
                // 'ordersLimit': 1000,
                // 'myTradesLimit': 1000,
                'OHLCVLimit': 1000,
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
            },
        });
    }

    async authenticate () {
        /**
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @see https://docs.poloniex.com/#authenticated-channels-market-data-authentication
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        const timestamp = this.milliseconds ();
        const accessPath = '/ws/private';
        const requestString = 'GET\n' + accessPath + '\nsignTimestamp=' + timestamp;
        const url = this.urls['api']['ws']['private'];
        const signature = this.hmac (this.encode (requestString), this.base64ToBinary (this.secret), 'sha256', 'base64');
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
        return await this.watch (url, accessPath, request, accessPath);
    }

    async subscribe (name, publicOrPrivate, symbols = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {String} name name of the channel
         * @param {String} publicOrPrivate "public" or "private"
         * @param {[String]|undefined} symbols CCXT market symbols
         * @param {Object} params extra parameters specific to the poloniex api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'][publicOrPrivate];
        // if ('signature' in params) {
        //     // need to distinguish between public trades and user trades
        //     url = url + '?';
        // }
        const subscribe = {
            'event': 'subscribe',
            'channel': [
                name,
            ],
        };
        if (symbols !== undefined) {
            const marketIds = [ ];
            if (symbols !== [ 'all' ]) {
                for (let i = 0; i < symbols.length; i++) {
                    const symbol = symbols[i];
                    marketIds.push (this.marketId (symbol));
                }
            } else {
                marketIds.push ('all');
            }
            subscribe['symbols'] = marketIds;
        }
        // const messageHash = name + ':' + marketId;
        const request = this.extend (subscribe, params);
        return await this.watch (url, name, request, name);
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
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const channels = {
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
        };
        const channel = this.safeString (channels, timeframe);
        if (channel === undefined) {
            throw new BadRequest (this.id + ' watchOHLCV cannot take a timeframe of ' + timeframe);
        }
        const ohlcv = await this.subscribe (channel, 'public', [ symbol ], params);
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
        return await this.subscribe (name, 'public', [ symbol ], params);
    }

    async watchTickers (symbols, params = {}) {
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
        if (symbols === undefined) {
            symbols = [ 'all' ];
        }
        return await this.subscribe (name, 'public', symbols, params);
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
        const trades = await this.subscribe (name, 'public', [ symbol ], params);
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
        const name = 'book_lv2';
        const orderbook = await this.subscribe (name, 'public', [ symbol ], params);
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
        const authentication = this.authenticate ();
        const orders = await this.subscribe (name, 'private', [ symbol ], this.extend (params, authentication));
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
        const name = 'balances';
        const authentication = this.authenticate ();
        const orders = await this.subscribe (name, 'private', undefined, this.extend (params, authentication));
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
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
        const data = this.safeValue (message, 'data');
        const channel = this.safeString (message, 'channel');
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (symbol);
        const timeframe = this.options['channelToTimeframe'][channel];
        const messageHash = channel + ':' + timeframe + ':' + marketId;
        const parsed = this.parseWsOHLCV (data, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit');
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
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
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        if (marketId !== undefined) {
            const trade = this.parseWsTrade (message);
            const symbol = trade['symbol'];
            // the exchange sends type = 'match'
            // but requires 'matches' upon subscribing
            // therefore we resolve 'matches' here instead of 'match'
            const type = 'matches';
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
        return message;
    }

    parseWsTrade (trade, market = undefined) {
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

    parseWsOrderStatus (status) {
        // TODO
        const statuses = {
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, 'open');
    }

    handleOrder (client, message) {
        // TODO
        //
        // Order is created
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
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const messageHash = 'orders:' + marketId;
            const symbol = this.safeSymbol (marketId);
            const orderId = this.safeString (message, 'order_id');
            const makerOrderId = this.safeString (message, 'maker_order_id');
            const takerOrderId = this.safeString (message, 'taker_order_id');
            const orders = this.orders;
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            let previousOrder = this.safeValue (previousOrders, orderId);
            if (previousOrder === undefined) {
                previousOrder = this.safeValue2 (previousOrders, makerOrderId, takerOrderId);
            }
            if (previousOrder === undefined) {
                const parsed = this.parseWsOrder (message);
                orders.append (parsed);
                client.resolve (orders, messageHash);
            } else {
                const sequence = this.safeInteger (message, 'sequence');
                const previousInfo = this.safeValue (previousOrder, 'info', {});
                const previousSequence = this.safeInteger (previousInfo, 'sequence');
                if ((previousSequence === undefined) || (sequence > previousSequence)) {
                    if (type === 'match') {
                        const trade = this.parseWsTrade (message);
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
                        if (previousOrder['filled'] !== undefined) {
                            previousOrder['filled'] += trade['amount'];
                            if (previousOrder['amount'] !== undefined) {
                                previousOrder['remaining'] = previousOrder['amount'] - previousOrder['filled'];
                            }
                        }
                        if (previousOrder['fee'] === undefined) {
                            previousOrder['fee'] = {
                                'cost': 0,
                                'currency': trade['fee']['currency'],
                            };
                        }
                        if ((previousOrder['fee']['cost'] !== undefined) && (trade['fee']['cost'] !== undefined)) {
                            previousOrder['fee']['cost'] = this.sum (previousOrder['fee']['cost'], trade['fee']['cost']);
                        }
                        // update the newUpdates count
                        orders.append (previousOrder);
                        client.resolve (orders, messageHash);
                    } else if ((type === 'received') || (type === 'done')) {
                        const info = this.extend (previousOrder['info'], message);
                        const order = this.parseWsOrder (info);
                        const keys = Object.keys (order);
                        // update the reference
                        for (let i = 0; i < keys.length; i++) {
                            const key = keys[i];
                            if (order[key] !== undefined) {
                                previousOrder[key] = order[key];
                            }
                        }
                        // update the newUpdates count
                        orders.append (previousOrder);
                        client.resolve (orders, messageHash);
                    }
                }
            }
        }
    }

    parseWsOrder (order) {
        // TODO
        const id = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_oid');
        const marketId = this.safeString (order, 'product_id');
        const symbol = this.safeSymbol (marketId);
        const side = this.safeString (order, 'side');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber2 (order, 'size', 'funds');
        const time = this.safeString (order, 'time');
        const timestamp = this.parse8601 (time);
        const reason = this.safeString (order, 'reason');
        const status = this.parseWsOrderStatus (reason);
        const orderType = this.safeString (order, 'order_type');
        let remaining = this.safeNumber (order, 'remaining_size');
        const type = this.safeString (order, 'type');
        let filled = undefined;
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = amount - remaining;
        } else if (type === 'received') {
            filled = 0;
            if (amount !== undefined) {
                remaining = amount - filled;
            }
        }
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        return {
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    handleTicker (client, message) {
        // TODO
        //
        //    {
        //        "symbol": "ETH_USDT",
        //        "dailyChange": "0.9428",
        //        "high": "507",
        //        "amount": "20",
        //        "quantity": "3",
        //        "tradeCount": 11,
        //        "low": "16",
        //        "closeTime": 1634062351868,
        //        "startTime": 1633996800000,
        //        "close": "204",
        //        "open": "105",
        //        "ts": 1648052794867,
        //        "markPrice": "205",
        //    }
        //
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const ticker = this.parseTicker (message);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const type = this.safeString (message, 'type');
            const messageHash = type + ':' + marketId;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    parseTicker (ticker, market = undefined) {
        // TODO
        //
        //     {
        //         type: 'ticker',
        //         sequence: 12042642428,
        //         product_id: 'BTC-USD',
        //         price: '9380.55',
        //         open_24h: '9450.81000000',
        //         volume_24h: '9611.79166047',
        //         low_24h: '9195.49000000',
        //         high_24h: '9475.19000000',
        //         volume_30d: '327812.00311873',
        //         best_bid: '9380.54',
        //         best_ask: '9380.55',
        //         side: 'buy',
        //         time: '2020-02-01T01:40:16.253563Z',
        //         trade_id: 82062566,
        //         last_size: '0.41969131'
        //     }
        //
        const type = this.safeString (ticker, 'type');
        if (type === undefined) {
            return super.parseTicker (ticker, market);
        }
        const marketId = this.safeString (ticker, 'product_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const last = this.safeNumber (ticker, 'price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high_24h'),
            'low': this.safeNumber (ticker, 'low_24h'),
            'bid': this.safeNumber (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open_24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    handleDelta (bookside, delta) {
        // TODO?
        const price = this.safeNumber (delta, 0);
        const amount = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        // TODO?
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client, message) {
        // TODO
        //
        //    snapshot
        //
        //    {
        //        "channel": "book_lv2",
        //        "action": "snapshot",
        //        "data": [
        //            {
        //                "symbol": "BTC_USDT",
        //                "asks": [
        //                    ["6.16", "0.6"],
        //                    ["6.17", "1"],
        //                    ["6.18", "1"],
        //                    ...
        //                ],
        //                "bids": [
        //                    ["5.65", "0.02"],
        //                    ["5.61", "1.68"],
        //                    ["5.6", "25.38"],
        //                  ...
        //                ],
        //                "createTime": 1653029116343,
        //                "lastId": 10409,
        //                "id": 10410,
        //                "ts": 1652774727337
        //            }
        //        ]
        //    }
        //
        //    update
        //
        //    {
        //        "channel": "book_lv2",
        //        "action": "update",
        //        "data": [
        //            {
        //                "symbol": "BTC_USDT",
        //                "asks": [
        //                    ["6.35", "3"]
        //                ],
        //                "bids": [
        //                    ["5.65", "0.02"]
        //                ],
        //                "createTime": 1653029116345,
        //                "lastId": 10410,
        //                "id": 10421,
        //                "ts": 1653029116529
        //            }
        //        ]
        //    }
        //
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'level2';
        const messageHash = name + ':' + marketId;
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        if (type === 'snapshot') {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            const orderbook = this.orderbooks[symbol];
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
            orderbook['timestamp'] = undefined;
            orderbook['datetime'] = undefined;
            client.resolve (orderbook, messageHash);
        } else if (type === 'l2update') {
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.parse8601 (this.safeString (message, 'time'));
            const changes = this.safeValue (message, 'changes', []);
            const sides = {
                'sell': 'asks',
                'buy': 'bids',
            };
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                const key = this.safeString (change, 0);
                const side = this.safeString (sides, key);
                const price = this.safeNumber (change, 1);
                const amount = this.safeNumber (change, 2);
                const bookside = orderbook[side];
                bookside.store (price, amount);
            }
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, messageHash);
        }
    }

    handleSubscriptionStatus (client, message) {
        // TODO?
        //
        //     {
        //         type: 'subscriptions',
        //         channels: [
        //             {
        //                 name: 'level2',
        //                 product_ids: [ 'ETH-BTC' ]
        //             }
        //         ]
        //     }
        //
        return message;
    }

    handleBalance (client, message) {
        // TODO
        //
        //    {
        //        "changeTime": 1657312008411,
        //        "accountId": "1234",
        //        "accountType": "SPOT",
        //        "eventType": "place_order",
        //        "available": "9999999983.668",
        //        "currency": "BTC",
        //        "id": 60018450912695040,
        //        "userId": 12345,
        //        "hold": "16.332",
        //        "ts": 1657312008443
        //    }
        //
        const params = this.safeValue (message, 'params', {});
        const data = this.safeValue (params, 'data', {});
        const messageHash = 'balancess';
        this.balance = this.parseBalance (data);
        client.resolve (this.balance, messageHash);
    }

    handleMessage (client, message) {
        const type = this.safeString (message, 'channel');
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
            'book_lv2': this.handleOrderBook,
            'ticker': this.handleTicker,
            'trades': this.handleTrade,
            'orders': this.handleOrder,
            'balances': this.handleBalance,
        };
        const method = this.safeValue (methods, type);
        return method.call (this, client, message);
    }
};

