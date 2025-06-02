'use strict';

var coinbase$1 = require('../coinbase.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class coinbase extends coinbase$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': false,
                'cancelOrdersWs': false,
                'cancelOrderWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'fetchTradesWs': false,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://advanced-trade-ws.coinbase.com',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
                'sides': {
                    'bid': 'bids',
                    'offer': 'asks',
                },
            },
        });
    }
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-overview#subscribe
     * @param {string} name the name of the channel
     * @param {boolean} isPrivate whether the channel is private or not
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    async subscribe(name, isPrivate, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let messageHash = name;
        let productIds = [];
        if (Array.isArray(symbol)) {
            const symbols = this.marketSymbols(symbol);
            const marketIds = this.marketIds(symbols);
            productIds = marketIds;
            messageHash = messageHash + '::' + symbol.join(',');
        }
        else if (symbol !== undefined) {
            market = this.market(symbol);
            messageHash = name + '::' + symbol;
            productIds = [market['id']];
        }
        const url = this.urls['api']['ws'];
        let subscribe = {
            'type': 'subscribe',
            'product_ids': productIds,
            'channel': name,
            // 'api_key': this.apiKey,
            // 'timestamp': timestamp,
            // 'signature': this.hmac (this.encode (auth), this.encode (this.secret), sha256),
        };
        if (isPrivate) {
            subscribe = this.extend(subscribe, this.createWSAuth(name, productIds));
        }
        return await this.watch(url, messageHash, subscribe, messageHash);
    }
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-overview#subscribe
     * @param {string} name the name of the channel
     * @param {boolean} isPrivate whether the channel is private or not
     * @param {string[]} [symbols] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    async subscribeMultiple(name, isPrivate, symbols = undefined, params = {}) {
        await this.loadMarkets();
        const productIds = [];
        const messageHashes = [];
        symbols = this.marketSymbols(symbols, undefined, false);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const marketId = market['id'];
            productIds.push(marketId);
            messageHashes.push(name + '::' + symbol);
        }
        const url = this.urls['api']['ws'];
        let subscribe = {
            'type': 'subscribe',
            'product_ids': productIds,
            'channel': name,
        };
        if (isPrivate) {
            subscribe = this.extend(subscribe, this.createWSAuth(name, productIds));
        }
        return await this.watchMultiple(url, messageHashes, subscribe, messageHashes);
    }
    createWSAuth(name, productIds) {
        const subscribe = {};
        const timestamp = this.numberToString(this.seconds());
        this.checkRequiredCredentials();
        const isCloudAPiKey = (this.apiKey.indexOf('organizations/') >= 0) || (this.secret.startsWith('-----BEGIN'));
        const auth = timestamp + name + productIds.join(',');
        if (!isCloudAPiKey) {
            subscribe['api_key'] = this.apiKey;
            subscribe['timestamp'] = timestamp;
            subscribe['signature'] = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        }
        else {
            if (this.apiKey.startsWith('-----BEGIN')) {
                throw new errors.ArgumentsRequired(this.id + ' apiKey should contain the name (eg: organizations/3b910e93....) and not the public key');
            }
            const currentToken = this.safeString(this.options, 'wsToken');
            const tokenTimestamp = this.safeInteger(this.options, 'wsTokenTimestamp', 0);
            const seconds = this.seconds();
            if (currentToken === undefined || tokenTimestamp + 120 < seconds) {
                // we should generate new token
                const token = this.createAuthToken(seconds);
                this.options['wsToken'] = token;
                this.options['wsTokenTimestamp'] = seconds;
            }
            subscribe['jwt'] = this.safeString(this.options, 'wsToken');
        }
        return subscribe;
    }
    /**
     * @method
     * @name coinbase#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#ticker-channel
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        const name = 'ticker';
        return await this.subscribe(name, false, symbol, params);
    }
    /**
     * @method
     * @name coinbase#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#ticker-batch-channel
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const name = 'ticker_batch';
        const ticker = await this.subscribeMultiple(name, false, symbols, params);
        if (this.newUpdates) {
            const tickers = {};
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
            return tickers;
        }
        return this.tickers;
    }
    handleTickers(client, message) {
        //
        //    {
        //        "channel": "ticker",
        //        "client_id": "",
        //        "timestamp": "2023-02-09T20:30:37.167359596Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "tickers": [
        //                    {
        //                        "type": "ticker",
        //                        "product_id": "BTC-USD",
        //                        "price": "21932.98",
        //                        "volume_24_h": "16038.28770938",
        //                        "low_24_h": "21835.29",
        //                        "high_24_h": "23011.18",
        //                        "low_52_w": "15460",
        //                        "high_52_w": "48240",
        //                        "price_percent_chg_24_h": "-4.15775596190603"
        // new as of 2024-04-12
        //                        "best_bid":"21835.29",
        //                        "best_bid_quantity": "0.02000000",
        //                        "best_ask":"23011.18",
        //                        "best_ask_quantity": "0.01500000"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        //    {
        //        "channel": "ticker_batch",
        //        "client_id": "",
        //        "timestamp": "2023-03-01T12:15:18.382173051Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "tickers": [
        //                    {
        //                        "type": "ticker",
        //                        "product_id": "DOGE-USD",
        //                        "price": "0.08212",
        //                        "volume_24_h": "242556423.3",
        //                        "low_24_h": "0.07989",
        //                        "high_24_h": "0.08308",
        //                        "low_52_w": "0.04908",
        //                        "high_52_w": "0.1801",
        //                        "price_percent_chg_24_h": "0.50177456859626"
        // new as of 2024-04-12
        //                        "best_bid":"0.07989",
        //                        "best_bid_quantity": "500.0",
        //                        "best_ask":"0.08308",
        //                        "best_ask_quantity": "300.0"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        // note! seems coinbase might also send empty data like:
        //
        //    {
        //        "channel": "ticker_batch",
        //        "client_id": "",
        //        "timestamp": "2024-05-24T18:22:24.546809523Z",
        //        "sequence_num": 1,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "tickers": [
        //                    {
        //                        "type": "ticker",
        //                        "product_id": "",
        //                        "price": "",
        //                        "volume_24_h": "",
        //                        "low_24_h": "",
        //                        "high_24_h": "",
        //                        "low_52_w": "",
        //                        "high_52_w": "",
        //                        "price_percent_chg_24_h": ""
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        //
        const channel = this.safeString(message, 'channel');
        const events = this.safeList(message, 'events', []);
        const datetime = this.safeString(message, 'timestamp');
        const timestamp = this.parse8601(datetime);
        for (let i = 0; i < events.length; i++) {
            const tickersObj = events[i];
            const tickers = this.safeList(tickersObj, 'tickers', []);
            for (let j = 0; j < tickers.length; j++) {
                const ticker = tickers[j];
                const wsMarketId = this.safeString(ticker, 'product_id');
                if (wsMarketId === undefined) {
                    continue;
                }
                const result = this.parseWsTicker(ticker);
                result['timestamp'] = timestamp;
                result['datetime'] = datetime;
                const symbol = result['symbol'];
                this.tickers[symbol] = result;
                const messageHash = channel + '::' + symbol;
                client.resolve(result, messageHash);
                this.tryResolveUsdc(client, messageHash, result);
            }
        }
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //         "type": "ticker",
        //         "product_id": "DOGE-USD",
        //         "price": "0.08212",
        //         "volume_24_h": "242556423.3",
        //         "low_24_h": "0.07989",
        //         "high_24_h": "0.08308",
        //         "low_52_w": "0.04908",
        //         "high_52_w": "0.1801",
        //         "price_percent_chg_24_h": "0.50177456859626"
        // new as of 2024-04-12
        //         "best_bid":"0.07989",
        //         "best_bid_quantity": "500.0",
        //         "best_ask":"0.08308",
        //         "best_ask_quantity": "300.0"
        //     }
        //
        const marketId = this.safeString(ticker, 'product_id');
        const timestamp = undefined;
        const last = this.safeNumber(ticker, 'price');
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market, '-'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high_24_h'),
            'low': this.safeString(ticker, 'low_24_h'),
            'bid': this.safeString(ticker, 'best_bid'),
            'bidVolume': this.safeString(ticker, 'best_bid_quantity'),
            'ask': this.safeString(ticker, 'best_ask'),
            'askVolume': this.safeString(ticker, 'best_ask_quantity'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString(ticker, 'price_percent_chg_24_h'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume_24_h'),
            'quoteVolume': undefined,
        });
    }
    /**
     * @method
     * @name coinbase#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#market-trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const name = 'market_trades';
        const trades = await this.subscribe(name, false, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name coinbase#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#market-trades-channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'market_trades';
        const trades = await this.subscribeMultiple(name, false, symbols, params);
        if (this.newUpdates) {
            const first = this.safeDict(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name coinbase#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#user-channel
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'user';
        const orders = await this.subscribe(name, true, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name coinbase#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#level2-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'level2';
        const market = this.market(symbol);
        symbol = market['symbol'];
        const orderbook = await this.subscribe(name, false, symbol, params);
        return orderbook.limit();
    }
    /**
     * @method
     * @name coinbase#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#level2-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'level2';
        const orderbook = await this.subscribeMultiple(name, false, symbols, params);
        return orderbook.limit();
    }
    handleTrade(client, message) {
        //
        //    {
        //        "channel": "market_trades",
        //        "client_id": "",
        //        "timestamp": "2023-02-09T20:19:35.39625135Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "trades": [
        //                    {
        //                        "trade_id": "000000000",
        //                        "product_id": "ETH-USD",
        //                        "price": "1260.01",
        //                        "size": "0.3",
        //                        "side": "BUY",
        //                        "time": "2019-08-14T20:42:27.265Z",
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        const events = this.safeList(message, 'events');
        const event = this.safeValue(events, 0);
        const trades = this.safeList(event, 'trades');
        const trade = this.safeDict(trades, 0);
        const marketId = this.safeString(trade, 'product_id');
        const symbol = this.safeSymbol(marketId);
        const messageHash = 'market_trades::' + symbol;
        let tradesArray = this.safeValue(this.trades, symbol);
        if (tradesArray === undefined) {
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesArray = new Cache.ArrayCacheBySymbolById(tradesLimit);
            this.trades[symbol] = tradesArray;
        }
        for (let i = 0; i < events.length; i++) {
            const currentEvent = events[i];
            const currentTrades = this.safeList(currentEvent, 'trades');
            for (let j = 0; j < currentTrades.length; j++) {
                const item = currentTrades[i];
                tradesArray.append(this.parseTrade(item));
            }
        }
        client.resolve(tradesArray, messageHash);
        this.tryResolveUsdc(client, messageHash, tradesArray);
    }
    handleOrder(client, message) {
        //
        //    {
        //        "channel": "user",
        //        "client_id": "",
        //        "timestamp": "2023-02-09T20:33:57.609931463Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "orders": [
        //                    {
        //                        "order_id": "XXX",
        //                        "client_order_id": "YYY",
        //                        "cumulative_quantity": "0",
        //                        "leaves_quantity": "0.000994",
        //                        "avg_price": "0",
        //                        "total_fees": "0",
        //                        "status": "OPEN",
        //                        "product_id": "BTC-USD",
        //                        "creation_time": "2022-12-07T19:42:18.719312Z",
        //                        "order_side": "BUY",
        //                        "order_type": "Limit"
        //                    },
        //                ]
        //            }
        //        ]
        //    }
        //
        const events = this.safeList(message, 'events');
        const marketIds = [];
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const responseOrders = this.safeList(event, 'orders');
            for (let j = 0; j < responseOrders.length; j++) {
                const responseOrder = responseOrders[j];
                const parsed = this.parseWsOrder(responseOrder);
                const cachedOrders = this.orders;
                const marketId = this.safeString(responseOrder, 'product_id');
                if (!(marketId in marketIds)) {
                    marketIds.push(marketId);
                }
                cachedOrders.append(parsed);
            }
        }
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const symbol = this.safeSymbol(marketId);
            const messageHash = 'user::' + symbol;
            client.resolve(this.orders, messageHash);
            this.tryResolveUsdc(client, messageHash, this.orders);
        }
        client.resolve(this.orders, 'user');
    }
    parseWsOrder(order, market = undefined) {
        //
        //    {
        //        "order_id": "XXX",
        //        "client_order_id": "YYY",
        //        "cumulative_quantity": "0",
        //        "leaves_quantity": "0.000994",
        //        "avg_price": "0",
        //        "total_fees": "0",
        //        "status": "OPEN",
        //        "product_id": "BTC-USD",
        //        "creation_time": "2022-12-07T19:42:18.719312Z",
        //        "order_side": "BUY",
        //        "order_type": "Limit"
        //    }
        //
        const id = this.safeString(order, 'order_id');
        const clientOrderId = this.safeString(order, 'client_order_id');
        const marketId = this.safeString(order, 'product_id');
        const datetime = this.safeString(order, 'time');
        market = this.safeMarket(marketId, market);
        return this.safeOrder({
            'info': order,
            'symbol': this.safeString(market, 'symbol'),
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'type': this.safeString(order, 'order_type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString(order, 'side'),
            'price': undefined,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': this.safeString(order, 'avg_price'),
            'filled': this.safeString(order, 'cumulative_quantity'),
            'remaining': this.safeString(order, 'leaves_quantity'),
            'status': this.safeStringLower(order, 'status'),
            'fee': {
                'amount': this.safeString(order, 'total_fees'),
                'currency': this.safeString(market, 'quote'),
            },
            'trades': undefined,
        });
    }
    handleOrderBookHelper(orderbook, updates) {
        for (let i = 0; i < updates.length; i++) {
            const trade = updates[i];
            const sideId = this.safeString(trade, 'side');
            const side = this.safeString(this.options['sides'], sideId);
            const price = this.safeNumber(trade, 'price_level');
            const amount = this.safeNumber(trade, 'new_quantity');
            const orderbookSide = orderbook[side];
            orderbookSide.store(price, amount);
        }
    }
    handleOrderBook(client, message) {
        //
        //    {
        //        "channel": "l2_data",
        //        "client_id": "",
        //        "timestamp": "2023-02-09T20:32:50.714964855Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "product_id": "BTC-USD",
        //                "updates": [
        //                    {
        //                        "side": "bid",
        //                        "event_time": "1970-01-01T00:00:00Z",
        //                        "price_level": "21921.74",
        //                        "new_quantity": "0.06317902"
        //                    },
        //                    {
        //                        "side": "bid",
        //                        "event_time": "1970-01-01T00:00:00Z",
        //                        "price_level": "21921.3",
        //                        "new_quantity": "0.02"
        //                    },
        //                ]
        //            }
        //        ]
        //    }
        //
        const events = this.safeList(message, 'events');
        const datetime = this.safeString(message, 'timestamp');
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const updates = this.safeList(event, 'updates', []);
            const marketId = this.safeString(event, 'product_id');
            // sometimes we subscribe to BTC/USDC and coinbase returns BTC/USD, as they are aliases
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const messageHash = 'level2::' + symbol;
            const subscription = this.safeValue(client.subscriptions, messageHash, {});
            const limit = this.safeInteger(subscription, 'limit');
            const type = this.safeString(event, 'type');
            if (type === 'snapshot') {
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            // unknown bug, can't reproduce, but sometimes orderbook is undefined
            if (!(symbol in this.orderbooks) && this.orderbooks[symbol] === undefined) {
                continue;
            }
            const orderbook = this.orderbooks[symbol];
            this.handleOrderBookHelper(orderbook, updates);
            orderbook['timestamp'] = this.parse8601(datetime);
            orderbook['datetime'] = datetime;
            orderbook['symbol'] = symbol;
            client.resolve(orderbook, messageHash);
            this.tryResolveUsdc(client, messageHash, orderbook);
        }
    }
    tryResolveUsdc(client, messageHash, result) {
        if (messageHash.endsWith('/USD') || messageHash.endsWith('-USD')) {
            client.resolve(result, messageHash + 'C'); // when subscribing to BTC/USDC and coinbase returns BTC/USD, so resolve USDC too
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "type": "subscriptions",
        //         "channels": [
        //             {
        //                 "name": "level2",
        //                 "product_ids": [ "ETH-BTC" ]
        //             }
        //         ]
        //     }
        //
        return message;
    }
    handleHeartbeats(client, message) {
        // although the subscription takes a product_ids parameter (i.e. symbol),
        // there is no (clear) way of mapping the message back to the symbol.
        //
        //     {
        //         "channel": "heartbeats",
        //         "client_id": "",
        //         "timestamp": "2023-06-23T20:31:26.122969572Z",
        //         "sequence_num": 0,
        //         "events": [
        //           {
        //               "current_time": "2023-06-23 20:31:56.121961769 +0000 UTC m=+91717.525857105",
        //               "heartbeat_counter": "3049"
        //           }
        //         ]
        //     }
        //
        return message;
    }
    handleMessage(client, message) {
        const channel = this.safeString(message, 'channel');
        const methods = {
            'subscriptions': this.handleSubscriptionStatus,
            'ticker': this.handleTickers,
            'ticker_batch': this.handleTickers,
            'market_trades': this.handleTrade,
            'user': this.handleOrder,
            'l2_data': this.handleOrderBook,
            'heartbeats': this.handleHeartbeats,
        };
        const type = this.safeString(message, 'type');
        if (type === 'error') {
            const errorMessage = this.safeString(message, 'message');
            throw new errors.ExchangeError(errorMessage);
        }
        const method = this.safeValue(methods, channel);
        if (method) {
            method.call(this, client, message);
        }
    }
}

module.exports = coinbase;
