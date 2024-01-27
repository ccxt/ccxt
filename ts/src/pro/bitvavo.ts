
//  ---------------------------------------------------------------------------

import bitvavoRest from '../bitvavo.js';
import { AuthenticationError, ArgumentsRequired, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int, Str, OrderSide, OrderType, OrderBook, Ticker, Trade, Order, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bitvavo extends bitvavoRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelOrdersWs': false,
                'fetchTradesWs': false,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
                'watchOHLCV': true,
                'watchOrders': true,
                'watchMyTrades': true,
                'cancelAllOrdersWs': true,
                'cancelOrderWs': true,
                'createOrderWs': true,
                'createStopLimitOrderWs': true,
                'createStopMarketOrderWs': true,
                'createStopOrderWs': true,
                'editOrderWs': true,
                'fetchBalanceWs': true,
                'fetchCurrenciesWS': true,
                'fetchDepositAddressWs': true,
                'fetchDepositsWs': true,
                'fetchDepositWithdrawFeesWs': true,
                'fetchMyTradesWs': true,
                'fetchOHLCVWs': true,
                'fetchOpenOrdersWs': true,
                'fetchOrderWs': true,
                'fetchOrderBookWs': true,
                'fetchOrdersWs': true,
                'fetchTickerWs': true,
                'fetchTickersWs': true,
                'fetchTimeWs': true,
                'fetchTradingFeesWs': true,
                'fetchWithdrawalsWs': true,
                'withdrawWs': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bitvavo.com/v2',
                },
            },
            'options': {
                'supressMultipleWsRequestsError': false, // if true, will not throw an error when using the same messageHash for more than one request. By making false you may receive responses from different requests on the same action
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchPublic (name, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = name + '@' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [
                        market['id'],
                    ],
                },
            ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitvavo#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        return await this.watchPublic ('ticker24h', symbol, params);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "event": "ticker24h",
        //         "data": [
        //             {
        //                 "market": "ETH-EUR",
        //                 "open": "193.5",
        //                 "high": "202.72",
        //                 "low": "192.46",
        //                 "last": "199.01",
        //                 "volume": "3587.05020246",
        //                 "volumeQuote": "708030.17",
        //                 "bid": "199.56",
        //                 "bidSize": "4.14730803",
        //                 "ask": "199.57",
        //                 "askSize": "6.13642074",
        //                 "timestamp": 1590770885217
        //             }
        //         ]
        //     }
        //
        const event = this.safeString (message, 'event');
        const tickers = this.safeValue (message, 'data', []);
        for (let i = 0; i < tickers.length; i++) {
            const data = tickers[i];
            const marketId = this.safeString (data, 'market');
            const market = this.safeMarket (marketId, undefined, '-');
            const messageHash = event + '@' + marketId;
            const ticker = this.parseTicker (data, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitvavo#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const trades = await this.watchPublic ('trades', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "event": "trade",
        //         "timestamp": 1590779594547,
        //         "market": "ETH-EUR",
        //         "id": "450c3298-f082-4461-9e2c-a0262cc7cc2e",
        //         "amount": "0.05026233",
        //         "price": "198.46",
        //         "side": "buy"
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'trades';
        const messageHash = name + '@' + marketId;
        const trade = this.parseTrade (message, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, messageHash);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitvavo#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'candles';
        const marketId = market['id'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = name + '@' + marketId + '_' + interval;
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': 'candles',
                    'interval': [ interval ],
                    'markets': [ marketId ],
                },
            ],
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleFetchOHLCV (client: Client, message) {
        //
        //    {
        //        action: 'getCandles',
        //        response: [
        //            [1690325820000, '26453', '26453', '26436', '26447', '0.01626246'],
        //            [1690325760000, '26454', '26454', '26453', '26453', '0.00037707']
        //        ]
        //    }
        //
        const action = this.safeString (message, 'action');
        const response = this.safeValue (message, 'response');
        const ohlcv = this.parseOHLCVs (response, undefined, undefined, undefined);
        const messageHash = this.buildMessageHash (action);
        client.resolve (ohlcv, messageHash);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "event": "candle",
        //         "market": "BTC-EUR",
        //         "interval": "1m",
        //         "candle": [
        //             [
        //                 1590797160000,
        //                 "8480.9",
        //                 "8480.9",
        //                 "8480.9",
        //                 "8480.9",
        //                 "0.01038628"
        //             ]
        //         ]
        //     }
        //
        const name = 'candles';
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'interval');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const messageHash = name + '@' + marketId + '_' + interval;
        const candles = this.safeValue (message, 'candle');
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitvavo#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'book';
        const messageHash = name + '@' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [
                        market['id'],
                    ],
                },
            ],
        };
        const subscription = {
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'marketId': market['id'],
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit ();
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        //
        //     {
        //         "event": "book",
        //         "market": "BTC-EUR",
        //         "nonce": 36947383,
        //         "bids": [
        //             [ "8477.8", "0" ]
        //         ],
        //         "asks": [
        //             [ "8550.9", "0" ]
        //         ]
        //     }
        //
        const nonce = this.safeInteger (message, 'nonce');
        if (nonce > orderbook['nonce']) {
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
            orderbook['nonce'] = nonce;
        }
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "event": "book",
        //         "market": "BTC-EUR",
        //         "nonce": 36729561,
        //         "bids": [
        //             [ "8513.3", "0" ],
        //             [ '8518.8', "0.64236203" ],
        //             [ '8513.6', "0.32435481" ],
        //         ],
        //         "asks": []
        //     }
        //
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = event + '@' + market['id'];
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return;
        }
        if (orderbook['nonce'] === undefined) {
            const subscription = this.safeValue (client.subscriptions, messageHash, {});
            const watchingOrderBookSnapshot = this.safeValue (subscription, 'watchingOrderBookSnapshot');
            if (watchingOrderBookSnapshot === undefined) {
                subscription['watchingOrderBookSnapshot'] = true;
                client.subscriptions[messageHash] = subscription;
                const options = this.safeValue (this.options, 'watchOrderBookSnapshot', {});
                const delay = this.safeInteger (options, 'delay', this.rateLimit);
                // fetch the snapshot in a separate async call after a warmup delay
                this.delay (delay, this.watchOrderBookSnapshot, client, message, subscription);
            }
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    async watchOrderBookSnapshot (client, message, subscription) {
        const params = this.safeValue (subscription, 'params');
        const marketId = this.safeString (subscription, 'marketId');
        const name = 'getBook';
        const messageHash = name + '@' + marketId;
        const url = this.urls['api']['ws'];
        const request = {
            'action': name,
            'market': marketId,
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message) {
        //
        //     {
        //         "action": "getBook",
        //         "response": {
        //             "market": "BTC-EUR",
        //             "nonce": 36946120,
        //             "bids": [
        //                 [ '8494.9', "0.24399521" ],
        //                 [ '8494.8', "0.34884085" ],
        //                 [ '8493.9', "0.14535128" ],
        //             ],
        //             "asks": [
        //                 [ "8495", "0.46982463" ],
        //                 [ '8495.1', "0.12178267" ],
        //                 [ '8496.2', "0.21924143" ],
        //             ]
        //         }
        //     }
        //
        const response = this.safeValue (message, 'response');
        if (response === undefined) {
            return message;
        }
        const marketId = this.safeString (response, 'market');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const name = 'book';
        const messageHash = name + '@' + marketId;
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (response, symbol);
        snapshot['nonce'] = this.safeInteger (response, 'nonce');
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const messageItem = messages[i];
            this.handleOrderBookMessage (client, messageItem, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
    }

    handleOrderBookSubscriptions (client: Client, message, marketIds) {
        const name = 'book';
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = this.safeString (marketIds, i);
            const symbol = this.safeSymbol (marketId, undefined, '-');
            const messageHash = name + '@' + marketId;
            if (!(symbol in this.orderbooks)) {
                const subscription = this.safeValue (client.subscriptions, messageHash);
                const method = this.safeValue (subscription, 'method');
                if (method !== undefined) {
                    method.call (this, client, message, subscription);
                }
            }
        }
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitvavo#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const messageHash = 'order:' + symbol;
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitvavo#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=ortradeder-structure
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const messageHash = 'myTrades:' + symbol;
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name bitvavo#createOrderWs
         * @description create a trade order
         * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/post
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
         * @param {float} [params.stopPrice] The price at which a trigger order is triggered at
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {bool} [params.postOnly] If true, the order will only be posted to the order book and not executed immediately
         * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
         * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
         * @param {string} [params.triggerType] "price"
         * @param {string} [params.triggerReference] "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order
         * @param {string} [params.selfTradePrevention] "decrementAndCancel", "cancelOldest", "cancelNewest", "cancelBoth"
         * @param {bool} [params.disableMarketProtection] don't cancel if the next fill price is 10% worse than the best fill price
         * @param {bool} [params.responseRequired] Set this to 'false' when only an acknowledgement of success or failure is required, this is faster.
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        return await this.watchRequest ('privateCreateOrder', request);
    }

    async editOrderWs (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name bitvavo#editOrderWs
         * @description edit a trade order
         * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/put
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} [amount] how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.editOrderRequest (id, symbol, type, side, amount, price, params);
        return await this.watchRequest ('privateUpdateOrder', request);
    }

    async cancelOrderWs (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#cancelOrderWs
         * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/delete
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.cancelOrderRequest (id, symbol, params);
        return await this.watchRequest ('privateCancelOrder', request);
    }

    async cancelAllOrdersWs (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#cancelAllOrdersWs
         * @see https://docs.bitvavo.com/#tag/Orders/paths/~1orders/delete
         * @description cancel all open orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        return await this.watchRequest ('privateCancelOrders', this.extend (request, params));
    }

    handleMultipleOrders (client: Client, message) {
        //
        //    {
        //        action: 'privateCancelOrders',
        //        response: [{
        //            orderId: 'd71df826-1130-478a-8741-d219128675b0'
        //        }]
        //    }
        //
        const action = this.safeString (message, 'action');
        const response = this.safeValue (message, 'response');
        const firstRawOrder = this.safeValue (response, 0, {});
        const marketId = this.safeString (firstRawOrder, 'market');
        const orders = this.parseOrders (response);
        let messageHash = this.buildMessageHash (action, { 'market': marketId });
        client.resolve (orders, messageHash);
        messageHash = this.buildMessageHash (action, message);
        client.resolve (orders, messageHash);
    }

    async fetchOrderWs (id: string, symbol: string = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name bitvavo#fetchOrderWs
         * @see https://docs.bitvavo.com/#tag/General/paths/~1assets/get
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        return await this.watchRequest ('privateGetOrder', this.extend (request, params));
    }

    async fetchOrdersWs (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitvavo#fetchOrdersWs
         * @see https://docs.bitvavo.com/#tag/Orders/paths/~1orders/get
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersWs() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.fetchOrdersRequest (symbol, since, limit, params);
        const orders = await this.watchRequest ('privateGetOrders', request);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async watchRequest (action, request) {
        request['action'] = action;
        const messageHash = this.buildMessageHash (action, request);
        this.checkMessageHashDoesNotExist (messageHash);
        const url = this.urls['api']['ws'];
        return await this.watch (url, messageHash, request, messageHash);
    }

    async fetchOpenOrdersWs (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitvavo#fetchOpenOrdersWs
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = {
            // 'market': market['id'], // rate limit 25 without a market, 1 with market specified
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const orders = await this.watchRequest ('privateGetOrdersOpen', this.extend (request, params));
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async fetchMyTradesWs (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitvavo#fetchMyTradesWs
         * @see https://docs.bitvavo.com/#tag/Trades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTradesWs() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.fetchMyTradesRequest (symbol, since, limit, params);
        const myTrades = await this.watchRequest ('privateGetTrades', request);
        return this.filterBySymbolSinceLimit (myTrades, symbol, since, limit);
    }

    handleMyTrades (client: Client, message) {
        //
        //    {
        //        action: 'privateGetTrades',
        //        response: [
        //            {
        //                "id": "108c3633-0276-4480-a902-17a01829deae",
        //                "orderId": "1d671998-3d44-4df4-965f-0d48bd129a1b",
        //                "timestamp": 1542967486256,
        //                "market": "BTC-EUR",
        //                "side": "buy",
        //                "amount": "0.005",
        //                "price": "5000.1",
        //                "taker": true,
        //                "fee": "0.03",
        //                "feeCurrency": "EUR",
        //                "settled": true
        //            }
        //        ]
        //    }
        //
        //
        const action = this.safeString (message, 'action');
        const response = this.safeValue (message, 'response');
        const firstRawTrade = this.safeValue (response, 0, {});
        const marketId = this.safeString (firstRawTrade, 'market');
        const trades = this.parseTrades (response, undefined, undefined, undefined);
        const messageHash = this.buildMessageHash (action, { 'market': marketId });
        client.resolve (trades, messageHash);
    }

    async withdrawWs (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#withdrawWs
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.withdrawRequest (code, amount, address, tag, params);
        return await this.watchRequest ('privateWithdrawAssets', request);
    }

    handleWithdraw (client: Client, message) {
        //
        //    {
        //        action: 'privateWithdrawAssets',
        //        response: {
        //         "success": true,
        //         "symbol": "BTC",
        //         "amount": "1.5"
        //        }
        //    }
        //
        const action = this.safeString (message, 'action');
        const messageHash = this.buildMessageHash (action, message);
        const response = this.safeValue (message, 'response');
        const withdraw = this.parseTransaction (response);
        client.resolve (withdraw, messageHash);
    }

    async fetchWithdrawalsWs (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchWithdrawalsWs
         * @see https://docs.bitvavo.com/#tag/Account/paths/~1withdrawalHistory/get
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.fetchWithdrawalsRequest (code, since, limit, params);
        const withdraws = await this.watchRequest ('privateGetWithdrawalHistory', request);
        return this.filterByCurrencySinceLimit (withdraws, code, since, limit);
    }

    handleWithdraws (client: Client, message) {
        //
        //    {
        //        action: 'privateGetWithdrawalHistory',
        //        response: [{
        //                timestamp: 1689792085000,
        //                symbol: 'BTC',
        //                amount: '0.0009',
        //                fee: '0',
        //                status: 'completed',
        //                txId: '7dbadc658d7d59c129de1332c55ee8e08d0ab74432faae03b417b9809c819d1f'
        //            },
        //            ...
        //        ]
        //    }
        //
        const action = this.safeString (message, 'action');
        const messageHash = this.buildMessageHash (action, message);
        const response = this.safeValue (message, 'response');
        const withdrawals = this.parseTransactions (response, undefined, undefined, undefined, { 'type': 'withdrawal' });
        client.resolve (withdrawals, messageHash);
    }

    async fetchOHLCVWs (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitvavo#fetchOHLCVWs
         * @see https://docs.bitvavo.com/#tag/Market-Data/paths/~1{market}~1candles/get
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const request = this.fetchOHLCVRequest (symbol, timeframe, since, limit, params);
        const action = 'getCandles';
        const ohlcv = await this.watchRequest (action, request);
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async fetchDepositsWs (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchDepositsWs
         * @see https://docs.bitvavo.com/#tag/Account/paths/~1depositHistory/get
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const request = this.fetchDepositsRequest (code, since, limit, params);
        const deposits = await this.watchRequest ('privateGetDepositHistory', request);
        return this.filterByCurrencySinceLimit (deposits, code, since, limit);
    }

    handleDeposits (client: Client, message) {
        //
        //    {
        //        action: 'privateGetDepositHistory',
        //        response: [{
        //                timestamp: 1689792085000,
        //                symbol: 'BTC',
        //                amount: '0.0009',
        //                fee: '0',
        //                status: 'completed',
        //                txId: '7dbadc658d7d59c129de1332c55ee8e08d0ab74432faae03b417b9809c819d1f'
        //            },
        //            ...
        //        ]
        //    }
        //
        const action = this.safeString (message, 'action');
        const messageHash = this.buildMessageHash (action, message);
        const response = this.safeValue (message, 'response');
        const deposits = this.parseTransactions (response, undefined, undefined, undefined, { 'type': 'deposit' });
        client.resolve (deposits, messageHash);
    }

    async fetchTradingFeesWs (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchTradingFeesWs
         * @see https://docs.bitvavo.com/#tag/Account/paths/~1account/get
         * @description fetch the trading fees for multiple markets
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        await this.authenticate ();
        return await this.watchRequest ('privateGetAccount', params);
    }

    async fetchMarketsWs (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchMarketsWs
         * @see https://docs.bitvavo.com/#tag/General/paths/~1markets/get
         * @description retrieves data on all markets for bitvavo
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        return await this.watchRequest ('getMarkets', params);
    }

    async fetchCurrenciesWs (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchCurrenciesWs
         * @see https://docs.bitvavo.com/#tag/General/paths/~1assets/get
         * @description fetches all available currencies on an exchange
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        await this.loadMarkets ();
        return await this.watchRequest ('getAssets', params);
    }

    handleFetchCurrencies (client: Client, message) {
        //
        //    {
        //        action: 'getAssets',
        //        response: [{
        //                symbol: '1INCH',
        //                name: '1inch',
        //                decimals: 8,
        //                depositFee: '0',
        //                depositConfirmations: 64,
        //                depositStatus: 'OK',
        //                withdrawalFee: '13',
        //                withdrawalMinAmount: '13',
        //                withdrawalStatus: 'OK',
        //                networks: [Array],
        //                message: ''
        //            },
        //            ...
        //        ]
        //    }
        //
        const action = this.safeString (message, 'action');
        const messageHash = this.buildMessageHash (action, message);
        const response = this.safeValue (message, 'response');
        const currencies = this.parseCurrencies (response);
        client.resolve (currencies, messageHash);
    }

    handleTradingFees (client, message) {
        //
        //    {
        //        action: 'privateGetAccount',
        //        response: {
        //            fees: {
        //                taker: '0.0025',
        //                maker: '0.0015',
        //                volume: '1693.74'
        //            }
        //        }
        //    }
        //
        const action = this.safeString (message, 'action');
        const messageHash = this.buildMessageHash (action, message);
        const response = this.safeValue (message, 'response');
        const fees = this.parseTradingFees (response);
        client.resolve (fees, messageHash);
    }

    async fetchBalanceWs (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bitvavo#fetchBalanceWs
         * @see https://docs.bitvavo.com/#tag/Account/paths/~1balance/get
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        return await this.watchRequest ('privateGetBalance', params);
    }

    handleFetchBalance (client: Client, message) {
        //
        //    {
        //        action: 'privateGetBalance',
        //        response: [{
        //                symbol: 'ADA',
        //                available: '0',
        //                inOrder: '0'
        //            },
        //            ...
        //        ]
        //    }
        //
        const action = this.safeString (message, 'action', 'privateGetBalance');
        const messageHash = this.buildMessageHash (action, message);
        const response = this.safeValue (message, 'response', []);
        const balance = this.parseBalance (response);
        client.resolve (balance, messageHash);
    }

    handleSingleOrder (client: Client, message) {
        //
        //    {
        //        action: 'privateCreateOrder',
        //        response: {
        //            orderId: 'd71df826-1130-478a-8741-d219128675b0',
        //            market: 'BTC-EUR',
        //            created: 1689792749748,
        //            updated: 1689792749748,
        //            status: 'new',
        //            side: 'sell',
        //            orderType: 'limit',
        //            amount: '0.0002',
        //            amountRemaining: '0.0002',
        //            price: '37000',
        //            onHold: '0.0002',
        //            onHoldCurrency: 'BTC',
        //            filledAmount: '0',
        //            filledAmountQuote: '0',
        //            feePaid: '0',
        //            feeCurrency: 'EUR',
        //            fills: [],
        //            selfTradePrevention: 'decrementAndCancel',
        //            visible: true,
        //            timeInForce: 'GTC',
        //            postOnly: false
        //        }
        //    }
        //
        const action = this.safeString (message, 'action');
        const response = this.safeValue (message, 'response', {});
        const order = this.parseOrder (response);
        const messageHash = this.buildMessageHash (action, response);
        client.resolve (order, messageHash);
    }

    handleMarkets (client: Client, message) {
        //
        //    {
        //        action: 'getMarkets',
        //        response: [{
        //                market: '1INCH-EUR',
        //                status: 'trading',
        //                base: '1INCH',
        //                quote: 'EUR',
        //                pricePrecision: 5,
        //                minOrderInBaseAsset: '2',
        //                minOrderInQuoteAsset: '5',
        //                maxOrderInBaseAsset: '1000000000',
        //                maxOrderInQuoteAsset: '1000000000',
        //                orderTypes: [Array]
        //            },
        //            ...
        //        ]
        //    }
        //
        const action = this.safeString (message, 'action');
        const response = this.safeValue (message, 'response', {});
        const markets = this.parseMarkets (response);
        const messageHash = this.buildMessageHash (action, response);
        client.resolve (markets, messageHash);
    }

    buildMessageHash (action, params = {}) {
        const methods = {
            'privateCreateOrder': this.actionAndMarketMessageHash,
            'privateUpdateOrder': this.actionAndOrderIdMessageHash,
            'privateCancelOrder': this.actionAndOrderIdMessageHash,
            'privateGetOrder': this.actionAndOrderIdMessageHash,
            'privateGetTrades': this.actionAndMarketMessageHash,
        };
        const method = this.safeValue (methods, action);
        let messageHash = action;
        if (method !== undefined) {
            messageHash = method.call (this, action, params);
        }
        return messageHash;
    }

    checkMessageHashDoesNotExist (messageHash) {
        const supressMultipleWsRequestsError = this.safeValue (this.options, 'supressMultipleWsRequestsError', false);
        if (!supressMultipleWsRequestsError) {
            const client = this.safeValue (this.clients, this.urls['api']['ws']);
            if (client !== undefined) {
                const future = this.safeValue (client.futures, messageHash);
                if (future !== undefined) {
                    throw new ExchangeError (this.id + ' a similar request with messageHash ' + messageHash + ' is already pending, you must wait for a response, or turn off this error by setting supressMultipleWsRequestsError in the options to true');
                }
            }
        }
    }

    actionAndMarketMessageHash (action, params = {}) {
        const symbol = this.safeString (params, 'market', '');
        return action + symbol;
    }

    actionAndOrderIdMessageHash (action, params = {}) {
        const orderId = this.safeString (params, 'orderId');
        if (orderId === undefined) {
            throw new ExchangeError (this.id + ' privateUpdateOrderMessageHash requires a orderId parameter');
        }
        return action + orderId;
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         "event": "order",
        //         "orderId": "f0e5180f-9497-4d05-9dc2-7056e8a2de9b",
        //         "market": "ETH-EUR",
        //         "created": 1590948500319,
        //         "updated": 1590948500319,
        //         "status": "new",
        //         "side": "sell",
        //         "orderType": "limit",
        //         "amount": "0.1",
        //         "amountRemaining": "0.1",
        //         "price": "300",
        //         "onHold": "0.1",
        //         "onHoldCurrency": "ETH",
        //         "selfTradePrevention": "decrementAndCancel",
        //         "visible": true,
        //         "timeInForce": "GTC",
        //         "postOnly": false
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = 'order:' + symbol;
        const order = this.parseOrder (message, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        client.resolve (this.orders, messageHash);
    }

    handleMyTrade (client: Client, message) {
        //
        //     {
        //         "event": "fill",
        //         "timestamp": 1590964470132,
        //         "market": "ETH-EUR",
        //         "orderId": "85d082e1-eda4-4209-9580-248281a29a9a",
        //         "fillId": "861d2da5-aa93-475c-8d9a-dce431bd4211",
        //         "side": "sell",
        //         "amount": "0.1",
        //         "price": "211.46",
        //         "taker": true,
        //         "fee": "0.056",
        //         "feeCurrency": "EUR"
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = 'myTrades:' + symbol;
        const trade = this.parseTrade (message, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const tradesArray = this.myTrades;
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "event": "subscribed",
        //         "subscriptions": {
        //             "book": [ "BTC-EUR" ]
        //         }
        //     }
        //
        const subscriptions = this.safeValue (message, 'subscriptions', {});
        const methods = {
            'book': this.handleOrderBookSubscriptions,
        };
        const names = Object.keys (subscriptions);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                const subscription = this.safeValue (subscriptions, name);
                method.call (this, client, message, subscription);
            }
        }
        return message;
    }

    authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const timestamp = this.milliseconds ();
            const stringTimestamp = timestamp.toString ();
            const auth = stringTimestamp + 'GET/' + this.version + '/websocket';
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            const action = 'authenticate';
            const request = {
                'action': action,
                'key': this.apiKey,
                'signature': signature,
                'timestamp': timestamp,
            };
            const message = this.extend (request, params);
            future = this.watch (url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //     {
        //         "event": "authenticate",
        //         "authenticated": true
        //     }
        //
        const messageHash = 'authenticated';
        const authenticated = this.safeValue (message, 'authenticated', false);
        if (authenticated) {
            // we resolve the future here permanently so authentication only happens once
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }

    handleErrorMessage (client: Client, message) {
        //
        //    {
        //        action: 'privateCreateOrder',
        //        market: 'BTC-EUR',
        //        errorCode: 217,
        //        error: 'Minimum order size in quote currency is 5 EUR or 0.001 BTC.'
        //    }
        //
        const error = this.safeString (message, 'error');
        const code = this.safeInteger (error, 'errorCode');
        const action = this.safeString (message, 'action');
        const messageHash = this.buildMessageHash (action, message);
        let rejected = false;
        try {
            this.handleErrors (code, error, client.url, undefined, undefined, error, message, undefined, undefined);
        } catch (e) {
            rejected = true;
            client.reject (e, messageHash);
        }
        if (!rejected) {
            client.reject (message, messageHash);
        }
    }

    handleMessage (client: Client, message) {
        //
        //     {
        //         "event": "subscribed",
        //         "subscriptions": {
        //             "book": [ "BTC-EUR" ]
        //         }
        //     }
        //
        //     {
        //         "event": "book",
        //         "market": "BTC-EUR",
        //         "nonce": 36729561,
        //         "bids": [
        //             [ "8513.3", "0" ],
        //             [ '8518.8', "0.64236203" ],
        //             [ '8513.6', "0.32435481" ],
        //         ],
        //         "asks": []
        //     }
        //
        //     {
        //         "action": "getBook",
        //         "response": {
        //             "market": "BTC-EUR",
        //             "nonce": 36946120,
        //             "bids": [
        //                 [ '8494.9', "0.24399521" ],
        //                 [ '8494.8', "0.34884085" ],
        //                 [ '8493.9', "0.14535128" ],
        //             ],
        //             "asks": [
        //                 [ "8495", "0.46982463" ],
        //                 [ '8495.1', "0.12178267" ],
        //                 [ '8496.2', "0.21924143" ],
        //             ]
        //         }
        //     }
        //
        //     {
        //         "event": "authenticate",
        //         "authenticated": true
        //     }
        //
        const error = this.safeString (message, 'error');
        if (error !== undefined) {
            this.handleErrorMessage (client, message);
        }
        const methods = {
            'subscribed': this.handleSubscriptionStatus,
            'book': this.handleOrderBook,
            'getBook': this.handleOrderBookSnapshot,
            'trade': this.handleTrade,
            'candle': this.handleOHLCV,
            'ticker24h': this.handleTicker,
            'authenticate': this.handleAuthenticationMessage,
            'order': this.handleOrder,
            'fill': this.handleMyTrade,
            'privateCreateOrder': this.handleSingleOrder,
            'privateUpdateOrder': this.handleSingleOrder,
            'privateGetBalance': this.handleFetchBalance,
            'privateCancelOrders': this.handleMultipleOrders,
            'privateGetOrders': this.handleMultipleOrders,
            'privateGetOrder': this.handleSingleOrder,
            'privateCancelOrder': this.handleSingleOrder,
            'privateGetOrdersOpen': this.handleMultipleOrders,
            'privateGetAccount': this.handleTradingFees,
            'privateGetDepositHistory': this.handleDeposits,
            'privateGetWithdrawalHistory': this.handleWithdraws,
            'privateWithdrawAssets': this.handleWithdraw,
            'privateGetTrades': this.handleMyTrades,
            'getAssets': this.handleFetchCurrencies,
            'getCandles': this.handleFetchOHLCV,
            'getMarkets': this.handleMarkets,
        };
        const event = this.safeString2 (message, 'event', 'action');
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
