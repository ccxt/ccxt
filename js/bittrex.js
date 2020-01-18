'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends ccxt.bittrex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://socket.bittrex.com/signalr/connect',
                    'signalr': 'https://socket.bittrex.com/signalr',
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
                'hub': 'c2',
            },
        });
    }

    createSignalRQuery (params = {}) {
        const hub = this.safeString (this.options, 'hub', 'c2');
        const hubs = [
            { 'name': hub },
        ];
        return this.extend ({
            'connectionData': this.json (hubs),
            'clientProtocol': 1.5,
            '_': this.milliseconds (), // no cache
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
        return future;
    }

    async authenticate () {
        const negotiateRequest = {};
        const negotiateResponse = {};
        const connectionToken = this.safeString (negotiateResponse, 'ConnectionToken');
        const startRequest = this.extend (negotiateRequest, {
            'transport': 'webSockets',
            'connectionToken': connectionToken,
        });
        const connectQuery = this.extend (startRequest, {
            // 'tid': this.milliseconds () % 10,
        });
        // wss://socket.bittrex.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=jm2IAcLJJHlW%2Bs%2FCJ8fGrs6ovAvWLczCyznWTnamXI5d2M73KcBuYXE9onggFPH5aPfK7Uh0lx115eVKZpNEng%2FCTJa3eMVp3HGzN9vKaYV86viH&connectionData=%5B%7B%22name%22%3A%22c2%22%7D%5D&tid=8
        const url = this.urls['api']['ws'] + '?' + this.urlencode (connectQuery);
        const method = 'GetAuthContext';
        // const url = this.urls['api']['ws'];
        const client = this.client (url);
        const future = client.future ('authenticated');
        const authenticate = this.safeValue (client.subscriptions, method);
        if (authenticate === undefined) {
            const requestId = this.milliseconds ().toString ();
            const request = {
                // 'H': hub,
                'M': method, // request method
                'A': [ this.apiKey ], // arguments
                'I': requestId, // invocation request id
            };
            const subscription = {
                'id': requestId,
            };
            this.spawn (this.watch, url, requestId, request, method, subscription);
        }
        return await future;
    }

    async subscribeToExchangeDeltas (negotiation, symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'transport': 'webSockets',
            'connectionToken': connectionToken,
            // 'tid': this.milliseconds () % 10,
        });
        // wss://socket.bittrex.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=jm2IAcLJJHlW%2Bs%2FCJ8fGrs6ovAvWLczCyznWTnamXI5d2M73KcBuYXE9onggFPH5aPfK7Uh0lx115eVKZpNEng%2FCTJa3eMVp3HGzN9vKaYV86viH&connectionData=%5B%7B%22name%22%3A%22c2%22%7D%5D&tid=8
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const requestId = this.milliseconds ().toString ();
        const method = 'SubscribeToExchangeDeltas';
        const messageHash = 'orderbook' + ':' + symbol;
        const subscribeHash = method + ':' + symbol;
        const marketId = market['id'];
        const hub = this.safeString (this.options, 'hub', 'c2');
        const request = {
            'H': hub,
            'M': method,
            'A': [ marketId ], // arguments
            'I': requestId, // invocation request id
        };
        const subscription = {
            'id': requestId,
            'symbol': symbol,
            'limit': limit,
            'params': params,
            'method': this.handleSubscribeToExchangeDeltas,
            'negotiation': negotiation,
        };
        const future = this.watch (url, messageHash, request, subscribeHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.subscribeToExchangeDeltas, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
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

    handleExchangeDelta (client, message) {
        console.log (new Date (), 'handleExchangeDelta');
        return message;
        //
        // subsequent updates
        //
        //     {
        //         M: 'BTC-ETH',
        //         N: 2322248,
        //         Z: [],
        //         S: [
        //             { TY: 0, R: 0.01938852, Q: 29.32758526 },
        //             { TY: 1, R: 0.02322822, Q: 0 }
        //         ],
        //         f: []
        //     }
        //
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            let symbol = undefined;
            let market = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const name = 'level2';
            const messageHash = name + ':' + marketId;
            if (type === 'snapshot') {
                const depth = 50; // default depth is 50
                this.orderbooks[symbol] = this.orderBook ({}, depth);
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
                    const price = this.safeFloat (change, 1);
                    const amount = this.safeFloat (change, 2);
                    const bookside = orderbook[side];
                    bookside.store (price, amount);
                }
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                client.resolve (orderbook, messageHash);
            }
        }
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement coinbasepro signMessage() via parent sign()
        return message;
    }

    async fetchExchangeState (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.queryExchangeState, symbol, limit, params);
    }

    async queryExchangeState (negotiation, symbol, limit = undefined, params = {}) {
        // process.exit ();
        await this.loadMarkets ();
        // const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        // const negotiation = this.safeValue (subscription, 'negotiation');
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'transport': 'webSockets',
            'connectionToken': connectionToken,
            // 'tid': this.milliseconds () % 10,
        });
        // wss://socket.bittrex.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=jm2IAcLJJHlW%2Bs%2FCJ8fGrs6ovAvWLczCyznWTnamXI5d2M73KcBuYXE9onggFPH5aPfK7Uh0lx115eVKZpNEng%2FCTJa3eMVp3HGzN9vKaYV86viH&connectionData=%5B%7B%22name%22%3A%22c2%22%7D%5D&tid=8
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const method = 'QueryExchangeState';
        const requestId = this.milliseconds ().toString ();
        const marketId = market['id'];
        const hub = this.safeString (this.options, 'hub', 'c2');
        const request = {
            'H': hub,
            'M': method,
            'A': [ marketId ], // arguments
            'I': requestId, // invocation request id
        };
        const subscription = {
            'id': requestId,
            'method': this.handleExchangeState,
        };
        const future = this.watch (url, requestId, request, requestId, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);

        // // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
        // // todo: this is a synch blocking call in ccxt.php - make it async
        // const snapshot = await this.fetchOrderBook (symbol);
        // const orderbook = this.orderbooks[symbol];
        // orderbook.reset (snapshot);
        // // unroll the accumulated deltas
        // const messages = orderbook.cache;
        // for (let i = 0; i < messages.length; i++) {
        //     const message = messages[i];
        //     this.handleOrderBookMessage (client, message, orderbook);
        // }
        // this.orderbooks[symbol] = orderbook;
        // client.resolve (orderbook, messageHash);
    }

    handleExchangeState (client, message, subscription) {
        const R = JSON.parse (this.inflate (this.safeValue (message, 'R')));
        console.log ('--------------------------------------------------------');
        console.log (message);
        console.log ('--------------------------------------------------------');
        console.log (R);
        console.log ('--------------------------------------------------------');
        console.log (subscription);
        console.log ('--------------------------------------------------------');
        process.exit ();
    }

    handleSubscribeToExchangeDeltas (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeString (subscription, 'limit');
        const params = this.safeString (subscription, 'params');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        // fetch the snapshot in a separate async call
        this.spawn (this.fetchExchangeState, symbol, limit, params);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     { R: true, I: '1579299273251' }
        //
        const I = this.safeString (message, 'I');
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

    handleSystemStatus (client, message) {
        // send signalR protocol start() call
        console.log (message);
        return message;
    }

    handleMessage (client, message) {
        const methods = {
            'uE': this.handleExchangeDelta,
        };
        const M = this.safeValue (message, 'M', []);
        for (let i = 0; i < M.length; i++) {
            const methodType = this.safeValue (M[i], 'M');
            const method = this.safeValue (methods, methodType);
            if (method !== undefined) {
                const A = this.safeValue (M[i], 'A', []);
                for (let k = 0; k < A.length; k++) {
                    const message = JSON.parse (this.inflate (A[k]));
                    method.call (this, client, message);
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
        // const type = this.safeString (message, 'type');
        // const methods = {
        //     'snapshot': this.handleOrderBook,
        //     'l2update': this.handleOrderBook,
        //     'subscribe': this.handleSubscriptionStatus,
        // };
        // const method = this.safeValue (methods, type);
        // if (method === undefined) {
        //     return message;
        // } else {
        //     return method.call (this, client, message);
        // }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (api === 'signalr') {
            let url = this.implodeParams (this.urls['api'][api], {
                'hostname': this.hostname,
            }) + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        } else {
            return super.sign (path, api, method, params, headers, body);
        }
    }
};

