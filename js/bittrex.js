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
        let future = this.safeValue (this.options, 'negotiated');
        if (future === undefined) {
            const client = this.client (this.urls['api']['ws']);
            const messageHash = 'negotiate';
            future = client.future (messageHash);
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
            this.options['negotiate'] = response;
            client.resolve (response, messageHash);
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
            const requestId = this.milliseconds ();
            const request = {
                'H': hub,
                'M': method, // request method
                'A': [
                    this.apiKey,
                ], // arguments
                'I': requestId, // invocation request id
            };
            const subscription = {
                'id': requestId,
            };
            this.spawn (this.watch, url, requestId, request, method, subscription);
        }
        return await future;
    }

    async subscribeToOrderBook (negotiation, symbol, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const connectionToken = this.safeString (negotiation, 'ConnectionToken');
        const query = this.createSignalRQuery ({
            'transport': 'webSockets',
            'connectionToken': connectionToken,
            // 'tid': this.milliseconds () % 10,
        });
        // wss://socket.bittrex.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=jm2IAcLJJHlW%2Bs%2FCJ8fGrs6ovAvWLczCyznWTnamXI5d2M73KcBuYXE9onggFPH5aPfK7Uh0lx115eVKZpNEng%2FCTJa3eMVp3HGzN9vKaYV86viH&connectionData=%5B%7B%22name%22%3A%22c2%22%7D%5D&tid=8
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const requestId = this.milliseconds ();
        const method = 'SubscribeToExchangeDeltas';
        const messageHash = 'orderbook' + ':' + symbol;
        const subscribeHash = method + ':' + symbol;
        const request = {
            'H': 'c2', // hub
            'M': method,
            'A': [
                market['id'],
            ],
            'I': requestId, // invocation request id
        };
        // const subscribeMessage = {
        //     'id': requestId,
        //     'method': 'balance.subscribe',
        //     'params': [],
        // };
        return await this.watch (url, messageHash, request, subscribeHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.subscribeToOrderBook, symbol, limit, params);
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

    handleOrderBook (client, message) {
        //
        // first message (snapshot)
        //
        //     {
        //         "type": "snapshot",
        //         "product_id": "BTC-USD",
        //         "bids": [
        //             ["10101.10", "0.45054140"]
        //         ],
        //         "asks": [
        //             ["10102.55", "0.57753524"]
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         "type": "l2update",
        //         "product_id": "BTC-USD",
        //         "time": "2019-08-14T20:42:27.265Z",
        //         "changes": [
        //             [ "buy", "10101.80000000", "0.162567" ]
        //         ]
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

    handleSubscriptionStatus (client, message) {
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

    handleMessage (client, message) {
        const M = this.safeValue (message, 'M', []);
        const M0 = this.safeValue (M, 0, {});
        const A = this.safeValue (M0, 'A', []);
        const A0 = this.safeString (A, 0);
        if (A0 !== undefined) {
            console.log (A);
            console.log (zlib.inflateRawSync (Buffer.from (A0, 'base64')).toString ());
            // inflateRaw (Buffer.from (A0, 'base64'), (error, buffer) => {
            //     console.log (buffer.toString ())
            // })
            // console.log (.toString ())
            // console.log (this.base64ToBinary (A0));
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
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api === 'signalr') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        } else {
            return super.sign (path, api, method, params, headers, body);
        }
    }
};

