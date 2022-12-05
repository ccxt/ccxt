'use strict';

//  ---------------------------------------------------------------------------

const bittrexRest = require ('../bittrex.js');
const { InvalidNonce, BadRequest } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends bittrexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchHeartbeat': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://socket-v3.bittrex.com/signalr/connect',
                    'signalr': 'https://socket-v3.bittrex.com/signalr',
                },
            },
            'api': {
                'signalr': {
                    'get': [
                        'negotiate',
                        'start',
                    ],
                },
            },
            'options': {
                'tradesLimit': 1000,
                'hub': 'c3',
                'I': this.milliseconds (),
            },
        });
    }

    getSignalRUrl (negotiation) {
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
            // 'tid': this.milliseconds () % 10,
        });
        return this.urls['api']['ws'] + '?' + this.urlencode (query);
    }

    makeRequest (requestId, method, args) {
        const hub = this.safeString (this.options, 'hub', 'c3');
        return {
            'H': hub,
            'M': method,
            'A': args, // arguments
            'I': requestId, // invocation request id
        };
    }

    makeRequestToSubscribe (requestId, args) {
        const method = 'Subscribe';
        return this.makeRequest (requestId, method, args);
    }

    makeRequestToAuthenticate (requestId) {
        const timestamp = this.milliseconds ();
        const uuid = this.uuid ();
        const auth = timestamp.toString () + uuid;
        const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
        const args = [ this.apiKey, timestamp, uuid, signature ];
        const method = 'Authenticate';
        return this.makeRequest (requestId, method, args);
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'I', 0), 1);
        this.options['I'] = reqid;
        return reqid;
    }

    async sendRequestToSubscribe (negotiation, messageHash, subscription, params = {}) {
        const args = [ messageHash ];
        const requestId = this.requestId ().toString ();
        const request = this.makeRequestToSubscribe (requestId, [ args ]);
        subscription = this.extend ({
            'id': requestId,
            'negotiation': negotiation,
        }, subscription);
        const url = this.getSignalRUrl (negotiation);
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async authenticate (params = {}) {
        await this.loadMarkets ();
        const request = await this.negotiate ();
        return await this.sendRequestToAuthenticate (request, false, params);
    }

    async sendRequestToAuthenticate (negotiation, expired = false, params = {}) {
        const url = this.getSignalRUrl (negotiation);
        const client = this.client (url);
        const messageHash = 'authenticate';
        let future = this.safeValue (client.subscriptions, messageHash);
        if ((future === undefined) || expired) {
            future = client.future (messageHash);
            client.subscriptions[messageHash] = future;
            const requestId = this.requestId ().toString ();
            const request = this.makeRequestToAuthenticate (requestId);
            const subscription = {
                'id': requestId,
                'params': params,
                'negotiation': negotiation,
                'method': this.handleAuthenticate,
            };
            this.spawn (this.watch, url, messageHash, request, requestId, subscription);
        }
        return await future;
    }

    async sendAuthenticatedRequestToSubscribe (authentication, messageHash, params = {}) {
        const negotiation = this.safeValue (authentication, 'negotiation');
        const subscription = { 'params': params };
        return await this.sendRequestToSubscribe (negotiation, messageHash, subscription, params);
    }

    handleAuthenticate (client, message, subscription) {
        const requestId = this.safeString (subscription, 'id');
        if (requestId in client.subscriptions) {
            delete client.subscriptions[requestId];
        }
        client.resolve (subscription, 'authenticate');
    }

    async handleAuthenticationExpiringHelper () {
        const negotiation = await this.negotiate ();
        return await this.sendRequestToAuthenticate (negotiation, true);
    }

    handleAuthenticationExpiring (client, message) {
        //
        //     {
        //         C: 'd-B1733F58-B,0|vT7,1|vT8,2|vBR,3',
        //         M: [ { H: 'C3', M: 'authenticationExpiring', A: [] } ]
        //     }
        //
        // resend the authentication request and refresh the subscription
        //
        this.spawn (this.handleAuthenticationExpiringHelper);
    }

    createSignalRQuery (params = {}) {
        const hub = this.safeString (this.options, 'hub', 'c3');
        const hubs = [
            { 'name': hub },
        ];
        const ms = this.milliseconds ();
        return this.extend ({
            'transport': 'webSockets',
            'connectionData': this.json (hubs),
            'clientProtocol': 1.5,
            '_': ms, // no cache
            'tid': this.sum (ms % 10, 1), // random
        }, params);
    }

    async negotiate (params = {}) {
        const client = this.client (this.urls['api']['ws']);
        const messageHash = 'negotiate';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            client.subscriptions[messageHash] = future;
            const request = this.createSignalRQuery (params);
            const response = await this.signalrGetNegotiate (this.extend (request, params));
            //
            //     {
            //         Url: '/signalr/v1.1/signalr',
            //         ConnectionToken: 'lT/sa19+FcrEb4W53On2v+Pcc3d4lVCHV5/WJtmQw1RQNQMpm7K78w/WnvfTN2EgwQopTUiFX1dioHN7Bd1p8jAbfdxrqf5xHAMntJfOrw1tON0O',
            //         ConnectionId: 'a2afb0f7-346f-4f32-b7c7-01e04584b86a',
            //         KeepAliveTimeout: 20,
            //         DisconnectTimeout: 30,
            //         ConnectionTimeout: 110,
            //         TryWebSockets: true,
            //         ProtocolVersion: '1.5',
            //         TransportConnectTimeout: 5,
            //         LongPollDelay: 0
            //     }
            //
            const result = {
                'request': request,
                'response': response,
            };
            client.resolve (result, messageHash);
        }
        return await future;
    }

    async start (negotiation, params = {}) {
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const request = this.createSignalRQuery (this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        }));
        return await this.signalrGetStart (request);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
        }
        const authentication = await this.authenticate ();
        const orders = await this.subscribeToOrders (authentication, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    async subscribeToOrders (authentication, params = {}) {
        const messageHash = 'order';
        return await this.sendAuthenticatedRequestToSubscribe (authentication, messageHash, params);
    }

    handleOrder (client, message) {
        //
        //     {
        //         accountId: '2832c5c6-ac7a-493e-bc16-ebca06c73670',
        //         sequence: 41,
        //         delta: {
        //             id: 'b91eff76-10eb-4382-834a-b753b770283e',
        //             marketSymbol: 'BTC-USDT',
        //             direction: 'BUY',
        //             type: 'LIMIT',
        //             quantity: '0.01000000',
        //             limit: '3000.00000000',
        //             timeInForce: 'GOOD_TIL_CANCELLED',
        //             fillQuantity: '0.00000000',
        //             commission: '0.00000000',
        //             proceeds: '0.00000000',
        //             status: 'OPEN',
        //             createdAt: '2020-10-07T12:51:43.16Z',
        //             updatedAt: '2020-10-07T12:51:43.16Z'
        //         }
        //     }
        //
        const delta = this.safeValue (message, 'delta', {});
        const parsed = this.parseOrder (delta);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        const messageHash = 'order';
        client.resolve (this.orders, messageHash);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name bittrex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const authentication = await this.authenticate ();
        return await this.subscribeToBalance (authentication, params);
    }

    async subscribeToBalance (authentication, params = {}) {
        const messageHash = 'balance';
        return await this.sendAuthenticatedRequestToSubscribe (authentication, messageHash, params);
    }

    handleBalance (client, message) {
        //
        //     {
        //         accountId: '2832c5c6-ac7a-493e-bc16-ebca06c73670',
        //         sequence: 9,
        //         delta: {
        //             currencySymbol: 'USDT',
        //             total: '32.88918476',
        //             available: '2.82918476',
        //             updatedAt: '2020-10-06T13:49:20.29Z'
        //         }
        //     }
        //
        const delta = this.safeValue (message, 'delta', {});
        const currencyId = this.safeString (delta, 'currencySymbol');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (delta, 'available');
        account['total'] = this.safeString (delta, 'total');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        return await this.subscribeToHeartbeat (negotiation, params);
    }

    async subscribeToHeartbeat (negotiation, params = {}) {
        await this.loadMarkets ();
        const url = this.getSignalRUrl (negotiation);
        const requestId = this.milliseconds ().toString ();
        const messageHash = 'heartbeat';
        const args = [ messageHash ];
        const request = this.makeRequestToSubscribe (requestId, [ args ]);
        const subscription = {
            'id': requestId,
            'params': params,
            'negotiation': negotiation,
        };
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    handleHeartbeat (client, message) {
        //
        // every 20 seconds (approx) if no other updates are sent
        //
        //     {}
        //
        client.resolve (message, 'heartbeat');
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bittrex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        return await this.subscribeToTicker (negotiation, symbol, params);
    }

    async subscribeToTicker (negotiation, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'ticker';
        const messageHash = name + '_' + market['id'];
        const subscription = {
            'marketId': market['id'],
            'symbol': symbol,
            'params': params,
        };
        return await this.sendRequestToSubscribe (negotiation, messageHash, subscription);
    }

    handleTicker (client, message) {
        //
        // summary subscription update
        //
        //     ...
        //
        // ticker subscription update
        //
        //     {
        //         symbol: 'BTC-USDT',
        //         lastTradeRate: '10701.02140008',
        //         bidRate: '10701.02140007',
        //         askRate: '10705.71049998'
        //     }
        //
        const ticker = this.parseTicker (message);
        const symbol = ticker['symbol'];
        const market = this.market (symbol);
        this.tickers[symbol] = ticker;
        const name = 'ticker';
        const messageHash = name + '_' + market['id'];
        client.resolve (ticker, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const negotiation = await this.negotiate ();
        const ohlcv = await this.subscribeToOHLCV (negotiation, symbol, timeframe, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async subscribeToOHLCV (negotiation, symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const name = 'candle';
        const messageHash = name + '_' + market['id'] + '_' + interval;
        const subscription = {
            'symbol': symbol,
            'timeframe': timeframe,
            'messageHash': messageHash,
            'params': params,
        };
        return await this.sendRequestToSubscribe (negotiation, messageHash, subscription);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         sequence: 28286,
        //         marketSymbol: 'BTC-USD',
        //         interval: 'MINUTE_1',
        //         delta: {
        //             startsAt: '2020-10-05T18:52:00Z',
        //             open: '10706.62600000',
        //             high: '10706.62600000',
        //             low: '10703.25900000',
        //             close: '10703.26000000',
        //             volume: '0.86822264',
        //             quoteVolume: '9292.84594774'
        //         }
        //     }
        //
        const name = 'candle';
        const marketId = this.safeString (message, 'marketSymbol');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const interval = this.safeString (message, 'interval');
        const messageHash = name + '_' + marketId + '_' + interval;
        const timeframe = this.findTimeframe (interval);
        const delta = this.safeValue (message, 'delta', {});
        const parsed = this.parseOHLCV (delta);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const negotiation = await this.negotiate ();
        const trades = await this.subscribeToTrades (negotiation, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async subscribeToTrades (negotiation, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trade';
        const messageHash = name + '_' + market['id'];
        const subscription = {
            'symbol': symbol,
            'messageHash': messageHash,
            'params': params,
        };
        return await this.sendRequestToSubscribe (negotiation, messageHash, subscription);
    }

    handleTrades (client, message) {
        //
        //     {
        //         deltas: [
        //             {
        //                 id: '5bf67885-a0a8-4c62-b73d-534e480e3332',
        //                 executedAt: '2020-10-05T23:02:17.49Z',
        //                 quantity: '0.00166790',
        //                 rate: '10763.97000000',
        //                 takerSide: 'BUY'
        //             }
        //         ],
        //         sequence: 24391,
        //         marketSymbol: 'BTC-USD'
        //     }
        //
        const deltas = this.safeValue (message, 'deltas', []);
        const marketId = this.safeString (message, 'marketSymbol');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const market = this.market (symbol);
        const name = 'trade';
        const messageHash = name + '_' + marketId;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
        }
        const trades = this.parseTrades (deltas, market);
        for (let i = 0; i < trades.length; i++) {
            stored.append (trades[i]);
        }
        this.trades[symbol] = stored;
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const authentication = await this.authenticate ();
        const trades = await this.subscribeToMyTrades (authentication, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async subscribeToMyTrades (authentication, params = {}) {
        const messageHash = 'execution';
        return await this.sendAuthenticatedRequestToSubscribe (authentication, messageHash, params);
    }

    handleMyTrades (client, message) {
        //
        //     {
        //         accountId: '2832c5c6-ac7a-493e-bc16-ebca06c73670',
        //         sequence: 42,
        //         deltas: [
        //             {
        //                 id: '5bf67885-a0a8-4c62-b73d-534e480e3332',
        //                 marketSymbol: 'BTC-USDT',
        //                 executedAt: '2020-10-05T23:02:17.49Z',
        //                 quantity: '0.00166790',
        //                 rate: '10763.97000000',
        //                 orderId: "string (uuid)",
        //                 commission: '0.00000000',
        //                 isTaker: False
        //             }
        //         ]
        //     }
        //
        const deltas = this.safeValue (message, 'deltas', {});
        const trades = this.parseTrades (deltas);
        let stored = this.myTrades;
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCacheBySymbolById (limit);
            this.myTrades = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            stored.append (trades[i]);
        }
        const messageHash = 'execution';
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        limit = (limit === undefined) ? 25 : limit; // 25 by default
        if ((limit !== 1) && (limit !== 25) && (limit !== 500)) {
            throw new BadRequest (this.id + ' watchOrderBook() limit argument must be undefined, 1, 25 or 500, default is 25');
        }
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const negotiation = await this.negotiate ();
        //
        //     1. Subscribe to the relevant socket streams
        //     2. Begin to queue up messages without processing them
        //     3. Call the equivalent v3 REST API and record both the results and the value of the returned Sequence header. Refer to the descriptions of individual streams to find the corresponding REST API. Note that you must call the REST API with the same parameters as you used to subscribed to the stream to get the right snapshot. For example, orderbook snapshots of different depths will have different sequence numbers.
        //     4. If the Sequence header is less than the sequence number of the first queued socket message received (unlikely), discard the results of step 3 and then repeat step 3 until this check passes.
        //     5. Discard all socket messages where the sequence number is less than or equal to the Sequence header retrieved from the REST call
        //     6. Apply the remaining socket messages in order on top of the results of the REST call. The objects received in the socket deltas have the same schemas as the objects returned by the REST API. Each socket delta is a snapshot of an object. The identity of the object is defined by a unique key made up of one or more fields in the message (see documentation of individual streams for details). To apply socket deltas to a local cache of data, simply replace the objects in the cache with those coming from the socket where the keys match.
        //     7. Continue to apply messages as they are received from the socket as long as sequence number on the stream is always increasing by 1 each message (Note: for private streams, the sequence number is scoped to a single account or subaccount).
        //     8. If a message is received that is not the next in order, return to step 2 in this process
        //
        const orderbook = await this.subscribeToOrderBook (negotiation, symbol, limit, params);
        return orderbook.limit ();
    }

    async subscribeToOrderBook (negotiation, symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'orderbook';
        const messageHash = name + '_' + market['id'] + '_' + limit.toString ();
        const subscription = {
            'symbol': symbol,
            'messageHash': messageHash,
            'method': this.handleSubscribeToOrderBook,
            'limit': limit,
            'params': params,
        };
        return await this.sendRequestToSubscribe (negotiation, messageHash, subscription);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            // 2. Initiate a REST request to get the snapshot data of Level 2 order book.
            // todo: this is a synch blocking call in ccxt.php - make it async
            const snapshot = await this.fetchOrderBook (symbol, limit);
            const orderbook = this.orderbooks[symbol];
            const messages = orderbook.cache;
            // make sure we have at least one delta before fetching the snapshot
            // otherwise we cannot synchronize the feed with the snapshot
            // and that will lead to a bidask cross as reported here
            // https://github.com/ccxt/ccxt/issues/6762
            const firstMessage = this.safeValue (messages, 0, {});
            const sequence = this.safeInteger (firstMessage, 'sequence');
            const nonce = this.safeInteger (snapshot, 'nonce');
            // if the received snapshot is earlier than the first cached delta
            // then we cannot align it with the cached deltas and we need to
            // retry synchronizing in maxAttempts
            if ((sequence !== undefined) && (nonce < sequence)) {
                const options = this.safeValue (this.options, 'fetchOrderBookSnapshot', {});
                const maxAttempts = this.safeInteger (options, 'maxAttempts', 3);
                let numAttempts = this.safeInteger (subscription, 'numAttempts', 0);
                // retry to syncrhonize if we haven't reached maxAttempts yet
                if (numAttempts < maxAttempts) {
                    // safety guard
                    if (messageHash in client.subscriptions) {
                        numAttempts = this.sum (numAttempts, 1);
                        subscription['numAttempts'] = numAttempts;
                        client.subscriptions[messageHash] = subscription;
                        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
                    }
                } else {
                    // throw upon failing to synchronize in maxAttempts
                    throw new InvalidNonce (this.id + ' failed to synchronize WebSocket feed with the snapshot for symbol ' + symbol + ' in ' + maxAttempts.toString () + ' attempts');
                }
            } else {
                orderbook.reset (snapshot);
                // unroll the accumulated deltas
                // 3. Playback the cached Level 2 data flow.
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    this.handleOrderBookMessage (client, message, orderbook);
                }
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
            }
        } catch (e) {
            client.reject (e, messageHash);
        }
    }

    handleSubscribeToOrderBook (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    handleDelta (bookside, delta) {
        //
        //     {
        //         quantity: '0.05100000',
        //         rate: '10694.86410031'
        //     }
        //
        const price = this.safeFloat (delta, 'rate');
        const amount = this.safeFloat (delta, 'quantity');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        //
        //     [
        //         { quantity: '0.05100000', rate: '10694.86410031' },
        //         { quantity: '0', rate: '10665.72578226' }
        //     ]
        //
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         marketSymbol: 'BTC-USDT',
        //         depth: 25,
        //         sequence: 3009387,
        //         bidDeltas: [
        //             { quantity: '0.05100000', rate: '10694.86410031' },
        //             { quantity: '0', rate: '10665.72578226' }
        //         ],
        //         askDeltas: []
        //     }
        //
        const marketId = this.safeString (message, 'marketSymbol');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const limit = this.safeInteger (message, 'depth');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({}, limit);
        }
        if (orderbook['nonce'] !== undefined) {
            this.handleOrderBookMessage (client, message, orderbook);
        } else {
            orderbook.cache.push (message);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         marketSymbol: 'BTC-USDT',
        //         depth: 25,
        //         sequence: 3009387,
        //         bidDeltas: [
        //             { quantity: '0.05100000', rate: '10694.86410031' },
        //             { quantity: '0', rate: '10665.72578226' }
        //         ],
        //         askDeltas: []
        //     }
        //
        const marketId = this.safeString (message, 'marketSymbol');
        const depth = this.safeString (message, 'depth');
        const name = 'orderbook';
        const messageHash = name + '_' + marketId + '_' + depth;
        const nonce = this.safeInteger (message, 'sequence');
        if (nonce > orderbook['nonce']) {
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'askDeltas', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bidDeltas', []));
            orderbook['nonce'] = nonce;
            client.resolve (orderbook, messageHash);
        }
        return orderbook;
    }

    async handleSystemStatusHelper () {
        const negotiation = await this.negotiate ();
        await this.start (negotiation);
    }

    handleSystemStatus (client, message) {
        // send signalR protocol start() call
        this.spawn (this.handleSystemStatusHelper);
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        // success
        //
        //     { R: [ { Success: true, ErrorCode: null } ], I: '1601891513224' }
        //
        // failure
        // todo add error handling and future rejections
        //
        //     {
        //         I: '1601942374563',
        //         E: "There was an error invoking Hub method 'c3.Authenticate'."
        //     }
        //
        const I = this.safeString (message, 'I'); // noqa: E741
        let subscription = this.safeValue (client.subscriptions, I);
        if (subscription === undefined) {
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            subscription = this.safeValue (subscriptionsById, I, {});
        } else {
            // clear if subscriptionHash === requestId (one-time request)
            delete client.subscriptions[I];
        }
        const method = this.safeValue (subscription, 'method');
        if (method === undefined) {
            client.resolve (message, I);
        } else {
            method.call (this, client, message, subscription);
        }
        return message;
    }

    handleMessage (client, message) {
        //
        // subscription confirmation
        //
        //     {
        //         R: [
        //             { Success: true, ErrorCode: null }
        //         ],
        //         I: '1601899375696'
        //     }
        //
        // heartbeat subscription update
        //
        //     {
        //         C: 'd-6010FB90-B,0|o_b,0|o_c,2|8,1F4E',
        //         M: [
        //             { H: 'C3', M: 'heartbeat', A: [] }
        //         ]
        //     }
        //
        // heartbeat empty message
        //
        //     {}
        //
        // subscription update
        //
        //     {
        //         C: 'd-ED78B69D-E,0|rq4,0|rq5,2|puI,60C',
        //         M: [
        //             {
        //                 H: 'C3',
        //                 M: 'ticker', // orderBook, trade, candle, balance, order
        //                 A: [
        //                     'q1YqrsxNys9RslJyCnHWDQ12CVHSUcpJLC4JKUpMSQ1KLEkFShkamBsa6VkYm5paGJuZAhUkZaYgpAws9QwszAwsDY1MgFKJxdlIuiz0jM3MLIHATKkWAA=='
        //                 ]
        //             }
        //         ]
        //     }
        //
        // authentication expiry notification
        //
        //     {
        //         C: 'd-B1733F58-B,0|vT7,1|vT8,2|vBR,3',
        //         M: [ { H: 'C3', M: 'authenticationExpiring', A: [] } ]
        //     }
        //
        const methods = {
            'authenticationExpiring': this.handleAuthenticationExpiring,
            'order': this.handleOrder,
            'balance': this.handleBalance,
            'trade': this.handleTrades,
            'candle': this.handleOHLCV,
            'orderBook': this.handleOrderBook,
            'heartbeat': this.handleHeartbeat,
            'ticker': this.handleTicker,
            'execution': this.handleMyTrades,
        };
        const M = this.safeValue (message, 'M', []);
        for (let i = 0; i < M.length; i++) {
            const methodType = this.safeValue (M[i], 'M');
            const method = this.safeValue (methods, methodType);
            if (method !== undefined) {
                if (methodType === 'heartbeat') {
                    method.call (this, client, message);
                } else if (methodType === 'authenticationExpiring') {
                    method.call (this, client, message);
                } else {
                    const A = this.safeValue (M[i], 'A', []);
                    for (let k = 0; k < A.length; k++) {
                        const inflated = this.inflate64 (A[k]);
                        const update = JSON.parse (inflated);
                        method.call (this, client, update);
                    }
                }
            }
        }
        // resolve invocations by request id
        if ('I' in message) {
            this.handleSubscriptionStatus (client, message);
        }
        if ('S' in message) {
            this.handleSystemStatus (client, message);
        }
        const keys = Object.keys (message);
        const numKeys = keys.length;
        if (numKeys < 1) {
            this.handleHeartbeat (client, message);
        }
    }
};
