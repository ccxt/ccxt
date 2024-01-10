'use strict';

//  ---------------------------------------------------------------------------

const { ExchangeError } = require ('../base/errors');
const lbankRest = require ('../lbank.js');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class lbank extends lbankRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://www.lbkex.net/ws/V2/',
                },
            },
            'options': {
                'watchOHLCV': {
                    'timeframes': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '1hr',
                        '4h': '4hr',
                        '1d': 'day',
                        '1w': 'week',
                        '1M': 'month',
                        '1y': 'year',
                    },
                },
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const watchOHLCVOptions = this.safeValue (this.options, 'watchOHLCV', {});
        const timeframes = this.safeValue (watchOHLCVOptions, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'];
        const subscribe = {
            'action': 'subscribe',
            'subscribe': 'kbar',
            'kbar': timeframeId,
            'pair': market['id'],
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //      {
        //          SERVER: 'V2',
        //          kbar: {
        //              a: 26415.891476,
        //              c: 19315.51,
        //              t: '2022-10-02T12:44:00.000',
        //              v: 1.3676,
        //              h: 19316.66,
        //              slot: '1min',
        //              l: 19315.51,
        //              n: 1,
        //              o: 19316.66
        //          },
        //          type: 'kbar',
        //          pair: 'btc_usdt',
        //          TS: '2022-10-02T12:44:15.864'
        //      }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        const kbar = this.safeValue (message, 'kbar', {});
        const timeframeId = this.safeString (kbar, 'slot');
        const datetime = this.safeString (kbar, 't');
        const parsed = [
            this.parse8601 (datetime),
            this.safeNumber (kbar, 'o'),
            this.safeNumber (kbar, 'h'),
            this.safeNumber (kbar, 'l'),
            this.safeNumber (kbar, 'c'),
            this.safeNumber (kbar, 'v'),
        ];
        const watchOHLCVOptions = this.safeValue (this.options, 'watchOHLCV', {});
        const timeframes = this.safeValue (watchOHLCVOptions, 'timeframes', {});
        const timeframe = this.findTimeframe (timeframeId, timeframes);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
        client.resolve (stored, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name lbank#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + symbol;
        const message = {
            'action': 'subscribe',
            'subscribe': 'tick',
            'pair': market['id'],
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleTicker (client, message) {
        //
        //     {
        //         "tick":{
        //             "to_cny":76643.5,
        //             "high":0.02719761,
        //             "vol":497529.7686,
        //             "low":0.02603071,
        //             "change":2.54,
        //             "usd":299.12,
        //             "to_usd":11083.66,
        //             "dir":"sell",
        //             "turnover":13224.0186,
        //             "latest":0.02698749,
        //             "cny":2068.41
        //         },
        //         "type":"tick",
        //         "pair":"eth_btc",
        //         "SERVER":"V2",
        //         "TS":"2019-07-01T11:33:55.188"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const parsedTicker = this.parseWsTicker (message, market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         "tick":{
        //             "to_cny":76643.5,
        //             "high":0.02719761,
        //             "vol":497529.7686,
        //             "low":0.02603071,
        //             "change":2.54,
        //             "usd":299.12,
        //             "to_usd":11083.66,
        //             "dir":"sell",
        //             "turnover":13224.0186,
        //             "latest":0.02698749,
        //             "cny":2068.41
        //         },
        //         "type":"tick",
        //         "pair":"eth_btc",
        //         "SERVER":"V2",
        //         "TS":"2019-07-01T11:33:55.188"
        //     }
        //
        const marketId = this.safeString (ticker, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const datetime = this.safeString (ticker, 'TS');
        const tickerData = this.safeValue (ticker, 'tick');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'high': this.safeString (tickerData, 'high'),
            'low': this.safeString (tickerData, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (tickerData, 'latest'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (tickerData, 'change'),
            'average': undefined,
            'baseVolume': this.safeString (tickerData, 'vol'),
            'quoteVolume': this.safeString (tickerData, 'turnover'),
            'info': ticker,
        }, market);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'trades:' + symbol;
        const message = {
            'action': 'subscribe',
            'subscribe': 'trade',
            'pair': market['id'],
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         "trade":{
        //             "volume":6.3607,
        //             "amount":77148.9303,
        //             "price":12129,
        //             "direction":"sell",
        //             "TS":"2019-06-28T19:55:49.460"
        //         },
        //         "type":"trade",
        //         "pair":"btc_usdt",
        //         "SERVER":"V2",
        //         "TS":"2019-06-28T19:55:49.466"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trade = this.safeValue (message, 'trade');
        const parsed = this.parseWsTrade (trade, market);
        parsed['symbol'] = symbol;
        stored.append (parsed);
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "volume":6.3607,
        //         "amount":77148.9303,
        //         "price":12129,
        //         "direction":"sell",
        //         "TS":"2019-06-28T19:55:49.460"
        //     }
        //
        const datetime = this.safeString (trade, 'TS');
        return this.safeTrade ({
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': undefined,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeString (trade, 'direction'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank#watchTrades
         * @url https://github.com/LBank-exchange/lbank-official-api-docs/blob/master/API-For-Spot-EN/WebSocket%20API(Asset%20%26%20Order).md#websocketsubscribeunsubscribe
         * @description get the list of trades associated with the user
         * @param {string|undefined} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const key = await this.authenticate (params);
        const url = this.urls['api']['ws'];
        let messageHash = undefined;
        let pair = 'all';
        if (symbol === undefined) {
            messageHash = 'orders:all';
        } else {
            const market = this.market (symbol);
            symbol = this.symbol (symbol);
            messageHash = 'orders:' + market['symbol'];
            pair = market['id'];
        }
        const message = {
            'action': 'subscribe',
            'subscribe': 'orderUpdate',
            'subscribeKey': key,
            'pair': pair,
        };
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //     {
        //         "orderUpdate":{
        //             "amount":"0.003",
        //             "orderStatus":2,
        //             "price":"0.02455211",
        //             "role":"maker",
        //             "updateTime":1561704577786,
        //             "uuid":"d0db191d-xxxxx-4418-xxxxx-fbb1xxxx2ea9",
        //             "txUuid":"da88f354d5xxxxxxa12128aa5bdcb3",
        //             "volumePrice":"0.00007365633"
        //         },
        //         "pair":"eth_btc",
        //         "type":"orderUpdate",
        //         "SERVER":"V2",
        //         "TS":"2019-06-28T14:49:37.816"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let myOrders = undefined;
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            myOrders = new ArrayCacheBySymbolById (limit);
        } else {
            myOrders = this.orders;
        }
        const order = this.parseWsOrder (message);
        myOrders.append (order);
        this.orders = myOrders;
        client.resolve (myOrders, 'orders');
        const messageHash = 'orders:' + symbol;
        client.resolve (myOrders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         "orderUpdate":{
        //             "amount":"0.003",
        //             "orderStatus":2,
        //             "price":"0.02455211",
        //             "role":"maker",
        //             "updateTime":1561704577786,
        //             "uuid":"d0db191d-xxxxx-4418-xxxxx-fbb1xxxx2ea9",
        //             "txUuid":"da88f354d5xxxxxxa12128aa5bdcb3",
        //             "volumePrice":"0.00007365633"
        //         },
        //         "pair":"eth_btc",
        //         "type":"orderUpdate",
        //         "SERVER":"V2",
        //         "TS":"2019-06-28T14:49:37.816"
        //     }
        //
        const orderUpdate = this.safeValue (order, 'orderUpdate', {});
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeInteger (orderUpdate, 'updateTime');
        const status = this.safeString (orderUpdate, 'orderStatus');
        const tradeId = this.safeString (orderUpdate, 'txUuid');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (orderUpdate, 'uuid'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': this.safeString (orderUpdate, 'price'),
            'stopPrice': undefined,
            'average': undefined,
            'amount': this.safeString (orderUpdate, 'amount'),
            'remaining': undefined,
            'filled': undefined,
            'status': this.parseWsOrderStatus (status),
            'fee': undefined,
            'cost': undefined,
            'trades': [ tradeId ],
        }, market);
    }

    parseWsOrderStatus (status) {
        const statuses = {
            '-1': 'canceled',  // Withdrawn
            '0': 'open',   // Unsettled
            '1': 'open',   // Partial sale
            '2': 'closed', // Completed
            '4': 'closed',  // Withrawing
        };
        return this.safeString (statuses, status, status);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + symbol;
        params = this.omit (params, 'aggregation');
        if (limit === undefined) {
            limit = 100;
        }
        const subscribe = {
            'action': 'subscribe',
            'subscribe': 'depth',
            'depth': limit,
            'pair': market['id'],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "depth": {
        //             "asks": [
        //                 [
        //                     0.0252,
        //                     0.5833
        //                 ],
        //                 [
        //                     0.025215,
        //                     4.377
        //                 ],
        //                 ...
        //             ],
        //             "bids": [
        //                 [
        //                     0.025135,
        //                     3.962
        //                 ],
        //                 [
        //                     0.025134,
        //                     3.46
        //                 ],
        //                 ...
        //             ]
        //         },
        //         "count": 100,
        //         "type": "depth",
        //         "pair": "eth_btc",
        //         "SERVER": "V2",
        //         "TS": "2019-06-28T17:49:22.722"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const orderBook = this.safeValue (message, 'depth', {});
        const datetime = this.safeString (message, 'TS');
        const timestamp = this.parse8601 (datetime);
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.orderBook ({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        const snapshot = this.parseOrderBook (orderBook, symbol, timestamp, 'bids', 'asks');
        storedOrderBook.reset (snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve (storedOrderBook, messageHash);
    }

    handleMessage (client, message) {
        const type = this.safeString (message, 'type');
        const handlers = {
            'kbar': this.handleOHLCV,
            'depth': this.handleOrderBook,
            'trade': this.handleTrades,
            'tick': this.handleTicker,
            'orderUpdate': this.handleOrders,
        };
        const handler = this.safeValue (handlers, type);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        return message;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const now = this.milliseconds ();
        const messageHash = 'authenticated';
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials ();
            const response = await this.privatePostSubscribeGetKey (params);
            //
            //     {
            //         "result":"true",
            //         "subscribeKey":"24d87a4xxxxxd04b78713f42643xxxxf4b6f6378xxxxx35836260"
            //     }
            //
            const result = this.safeString (response, 'result');
            if (result !== 'true') {
                throw new ExchangeError (this.id + ' failed to get subscribe key');
            }
            client.subscriptions['authenticated'] = {
                'key': this.safeString (response, 'subscribeKey'),
                'expires': this.sum (now, 3300000), // SubscribeKey lasts one hour, refresh it every 55 minutes
            };
        } else {
            const expires = this.safeInteger (authenticated, 'expires', 0);
            if (expires < now) {
                const request = {
                    'subscribeKey': authenticated['key'],
                };
                const response = await this.privatePostSubscribeRefreshKey (this.extend (request, params));
                //
                //    {"result": "true"}
                //
                const result = this.safeString (response, 'result');
                if (result !== 'true') {
                    throw new ExchangeError (this.id + ' failed to refresh the SubscribeKey');
                }
                client['subscriptions']['authenticated']['expires'] = this.sum (now, 3300000); // SubscribeKey lasts one hour, refresh it 5 minutes before it expires
            }
        }
        return client['authenticated']['key'];
    }
};
