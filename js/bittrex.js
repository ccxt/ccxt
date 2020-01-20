'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends ccxt.bittrex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchBalance': true,
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
        const ms = this.milliseconds ();
        return this.extend ({
            'transport': 'webSockets',
            'connectionData': this.json (hubs),
            'clientProtocol': 1.5,
            '_': ms, // no cache
            'tid': ms % 10,
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

    async start (negotiation, params = {}) {
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const request = this.createSignalRQuery (this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        }));
        const response = await this.signalrGetStart (request);
        return response;
    }

    async authenticate (params = {}) {
        const future = this.negotiate ();
        return await this.afterAsync (future, this.getAuthContext, params);
    }

    async getAuthContext (negotiation, params = {}) {
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        });
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const method = 'GetAuthContext';
        // const url = this.urls['api']['ws'];
        const client = this.client (url);
        const authenticate = this.safeValue (client.subscriptions, method, {});
        let future = this.safeValue (authenticate, 'future');
        // const future = client.future ('authenticated');
        if (future === undefined) {
            future = client.future ('authenticated');
            const requestId = this.milliseconds ().toString ();
            const hub = this.safeString (this.options, 'hub', 'c2');
            const request = {
                'H': hub,
                'M': method, // request method
                'A': [ this.apiKey ], // arguments
                'I': requestId, // invocation request id
            };
            const subscription = {
                'id': requestId,
                'method': this.handleGetAuthContext,
                'negotiation': negotiation,
                'future': future,
            };
            this.spawn (this.watch, url, requestId, request, method, subscription);
        }
        return await future;
    }

    handleGetAuthContext (client, message, subscription) {
        //
        //     {
        //         'R': '7d10e6b583484659918821072c83a5b6ce488e03cb744d86a2cc820bad466f1f',
        //         'I': '1579474528471'
        //     }
        //
        const negotiation = this.safeValue (subscription, 'negotiation', {});
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        });
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const challenge = this.safeString (message, 'R');
        const signature = this.hmac (this.encode (challenge), this.encode (this.secret), 'sha512');
        const requestId = this.milliseconds ().toString ();
        const hub = this.safeString (this.options, 'hub', 'c2');
        const method = 'Authenticate';
        const request = {
            'H': hub,
            'M': method, // request method
            'A': [ this.apiKey, signature ], // arguments
            'I': requestId, // invocation request id
        };
        const authenticateSubscription = {
            'id': requestId,
            'method': this.handleAuthenticate,
            'negotiation': negotiation,
        };
        this.spawn (this.watch, url, requestId, request, requestId, authenticateSubscription);
        return message;
    }

    handleAuthenticate (client, message, subscription) {
        //
        //     { 'R': true, 'I': '1579474528821' }
        //
        const R = this.safeValue (message, 'R');
        if (R) {
            client.resolve (subscription['negotiation'], 'authenticated');
        } else {
            const error = new AuthenticationError ('Authentication failed');
            client.reject (error, 'authenticated');
            const authSubscriptionHash = 'GetAuthContext';
            if (authSubscriptionHash in client.subscriptions) {
                delete client.subscriptions[authSubscriptionHash];
            }
        }
        return message;
    }

    async subscribeToUserDeltas (negotiation, params = {}) {
        await this.loadMarkets ();
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        });
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const requestId = this.milliseconds ().toString ();
        const method = 'SubscribeToUserDeltas';
        const messageHash = 'balance';
        const subscribeHash = method;
        const hub = this.safeString (this.options, 'hub', 'c2');
        const request = {
            'H': hub,
            'M': method,
            'A': [], // arguments
            'I': requestId, // invocation request id
        };
        const subscription = {
            'id': requestId,
            'params': params,
            'method': this.handleSubscribeToUserDeltas,
            'negotiation': negotiation,
        };
        return await this.watch (url, messageHash, request, subscribeHash, subscription);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        const future = this.authenticate ();
        return await this.afterAsync (future, this.subscribeToUserDeltas, params);
    }

    async subscribeToExchangeDeltas (negotiation, symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
            // 'tid': this.milliseconds () % 10,
        });
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
        const price = this.safeFloat (delta, 'R');
        const amount = this.safeFloat (delta, 'Q');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleExchangeDelta (client, message) {
        //
        //     {
        //         'M': 'BTC-ETH',
        //         'N': 2322248,
        //         'Z': [],
        //         'S': [
        //             { 'TY': 0, 'R': 0.01938852, 'Q': 29.32758526 },
        //             { 'TY': 1, 'R': 0.02322822, 'Q': 0 }
        //         ],
        //         'f': []
        //     }
        //
        const marketId = this.safeString (message, 'M');
        let market = undefined;
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        //
        // https://bittrex.github.io/api/v1-1#socket-connections
        //
        //     1 Drop existing websocket connections and flush accumulated data and state (e.g. market nonces).
        //     2 Re-establish websocket connection.
        //     3 Subscribe to BTC-ETH market deltas, cache received data keyed by nonce.
        //     4 Query BTC-ETH market state.
        //     5 Apply cached deltas sequentially, starting with nonces greater than that received in step 4.
        //
        if ((symbol !== undefined) && (symbol in this.orderbooks)) {
            const orderbook = this.orderbooks[symbol];
            if (orderbook['nonce'] !== undefined) {
                this.handleOrderBookMessage (client, message, orderbook);
                const name = 'orderbook';
                const messageHash = name + ':' + symbol;
                client.resolve (orderbook, messageHash);
            } else {
                orderbook.cache.push (message);
            }
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         'M': 'BTC-ETH',
        //         'N': 2322248,
        //         'Z': [],
        //         'S': [
        //             { 'TY': 0, 'R': 0.01938852, 'Q': 29.32758526 },
        //             { 'TY': 1, 'R': 0.02322822, 'Q': 0 }
        //         ],
        //         'f': []
        //     }
        //
        const nonce = this.safeInteger (message, 'N');
        // console.log (new Date (), 'handleOrderBookMessage', nonce, orderbook['nonce']);
        if (nonce > orderbook['nonce']) {
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'S', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'Z', []));
            orderbook['nonce'] = nonce;
        }
        return orderbook;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement coinbasepro signMessage() via parent sign()
        return message;
    }

    async fetchBalanceState (params = {}) {
        // console.log (new Date (), 'fetchBalanceState');
        await this.loadMarkets ();
        const future = this.authenticate ();
        return await this.afterAsync (future, this.queryBalanceState, params);
    }

    async queryBalanceState (negotiation, params = {}) {
        //
        // This method does not work as expected.
        //
        // In general Bittrex API docs do not mention how to get the current
        // state or a snapshot of balances of all coins over WS. The docs only
        // specify how to 'Authenticate' (that works fine) which subscribes
        // the user being authenticated to balance and order deltas by default.
        //
        // Investigating the WS message log in the browser on the
        // balance page on Bittrex's website shows a request to
        // QueryBalanceState over WS sent in the very beginning.
        // However, in case of WS in the browser on the Bittrex website
        // there is no 'Authenticate' message, therefore the Bittrex website
        // uses a different authentication mechanism (presumably, involving
        // HTTP headers and Cookies upon the SignalR negotiation handshake).
        //
        // An attempt to replicate the same request to QueryBalanceState
        // over WS here has failed – the WS server responds to that request
        // with an empty message containing just the request id, without
        // the actual snapshot result (no field called R in the SignalR message).
        //
        // The issue experienced is 100% identical to
        //
        //     https://github.com/Bittrex/bittrex.github.io/issues/23
        //
        //     2020-01-20T16:20:52.133Z connecting to wss://socket.bittrex.com/signalr/connect?transport=webSockets&connectionData=%5B%7B%22name%22%3A%22c2%22%7D%5D&clientProtocol=1.5&_=1579537250704&tid=4&connectionToken=ycjp5vmHhq3%2BZ5yyAgSejQyUOQR%2Bj3aWrwoqBH3Tu4MWk0y84QjuCo4tp6PHPwrVqQf96jE7QRIZ3SwTcpMf5pdS40Vkxr3e4AjUdrRfFuoaidSh
        //     2020-01-20T16:20:52.469Z onUpgrade
        //     2020-01-20T16:20:52.471Z onOpen
        //     2020-01-20T16:20:52.471Z sending {
        //         H: 'c2',
        //         M: 'GetAuthContext',
        //         A: [ '247febd8422c4b1dbdcd8a4ca9a6d15b' ],
        //         I: '1579537252133'
        //     }
        //     2020-01-20T16:20:52.584Z handleSystemStatus { C: 'd-4F618038-L,0|LC0f,0|LC0g,1', S: 1, M: [] }
        //     2020-01-20T16:20:52.938Z onMessage {
        //         R: '99d0f9052ee442eba5736169517ef9a67ecf08c83a364295a647c989c32737f4',
        //         I: '1579537252133'
        //     }
        //     2020-01-20T16:20:52.943Z sending {
        //         H: 'c2',
        //         M: 'Authenticate',
        //         A: [
        //             '247febd8422c4b1dbdcd8a4ca9a6d15b',
        //             '7935676d6c995f0435ec1cab48a8d02e3b4d1f786f941abba8aedbe2e088db0f023c15cee132dc6db50dd674e4ebf5a417de9ed59645b5668314846bbea8ec57'
        //         ],
        //         I: '1579537252943'
        //     }
        //     2020-01-20T16:20:56.216Z onMessage { R: true, I: '1579537252943' }
        //     2020-01-20T16:20:56.217Z sending { H: 'c2', M: 'SubscribeToUserDeltas', A: [], I: '1579537256217' }
        //     2020-01-20T16:20:57.035Z onMessage { R: true, I: '1579537256217' }
        //     2020-01-20T16:20:57.037Z sending { H: 'c2', M: 'QueryBalanceState', A: [], I: '1579537257037' }
        //     2020-01-20T16:20:57.772Z onMessage { I: '1579537257037' }
        //
        // The last message in the sequence above has no resulting 'R' field
        // which is present in the WebInspector and should contain the snapshot.
        //
        // console.log (new Date (), 'queryBalanceState');
        await this.loadMarkets ();
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        });
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const method = 'QueryBalanceState';
        const requestId = this.milliseconds ().toString ();
        const hub = this.safeString (this.options, 'hub', 'c2');
        const request = {
            'H': hub,
            'M': method,
            'A': [], // arguments
            'I': requestId, // invocation request id
        };
        const subscription = {
            'id': requestId,
            'method': this.handleBalanceState,
        };
        const future = this.watch (url, requestId, request, requestId, subscription);
        return await this.after (future, this.limitOrderBook, params);
    }

    handleBalanceState (client, message, subscription) {
        // console.log (new Date (), 'handleBalanceState');
        const R = this.safeString (message, 'R');
        // if (R !== undefined) {
        //     //
        //     //     {
        //     //         N: 2,
        //     //         y: {
        //     //             USDT: {
        //     //                 U: '2832c5c6-ac7a-493e-bc16-ebca06c73670',
        //     //                 W: 334126,
        //     //                 c: 'USDT',
        //     //                 b: 0.00002077,
        //     //                 a: 0.00002077,
        //     //                 z: 0,
        //     //                 p: null,
        //     //                 r: false,
        //     //                 u: 978307200000,
        //     //                 h: null
        //     //             },
        //     //             BTC: {
        //     //                 U: '2832c5c6-ac7a-493e-bc16-ebca06c73670',
        //     //                 W: 334126,
        //     //                 c: 'BTC',
        //     //                 b: 0.00000736,
        //     //                 a: 0.00000736,
        //     //                 z: 0,
        //     //                 p: '1cL5M4HjjoGWMA4jgHC5v6GqcjfxeeNMy',
        //     //                 r: false,
        //     //                 u: 978307200000,
        //     //                 h: null
        //     //             },
        //     //         }
        //     //     }
        //     //
        //     const response = JSON.parse (this.inflate (R));
        // }
        return R;
    }

    async fetchExchangeState (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.queryExchangeState, symbol, limit, params);
    }

    async queryExchangeState (negotiation, symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        });
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
    }

    handleExchangeState (client, message, subscription) {
        const R = JSON.parse (this.inflate (this.safeValue (message, 'R')));
        //
        //     {
        //         'M': 'BTC-ETH',
        //         'N': 2571953,
        //         'Z': [ // bids
        //             { 'Q': 2.38619729, 'R': 0.01964739 },
        //             { 'Q': 6, 'R': 0.01964738 },
        //             { 'Q': 0.0257, 'R': 0.01964736 },
        //         ],
        //         'S': [ // asks
        //             { 'Q': 1.84253634, 'R': 0.01965675 },
        //             { 'Q': 3.61380271, 'R': 0.01965677 },
        //             { 'Q': 5.6518, 'R': 0.01965678 },
        //         ],
        //         'f': [ // last fills
        //             {
        //                 'I': 49355896,
        //                 'T': 1579380036860,
        //                 'Q': 0.06966562,
        //                 'P': 0.01964993,
        //                 't': 0.0013689245564066,
        //                 'F': 'FILL',
        //                 'OT': 'SELL',
        //                 'U': '421c649f-82fa-437b-b8f2-2a6a55bbecbc'
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString (R, 'M');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook !== undefined) {
                const snapshot = this.parseOrderBook (R, undefined, 'Z', 'S', 'R', 'Q');
                snapshot['nonce'] = this.safeInteger (R, 'N');
                orderbook.reset (snapshot);
                // unroll the accumulated deltas
                const messages = orderbook.cache;
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    this.handleOrderBookMessage (client, message, orderbook);
                }
                this.orderbooks[symbol] = orderbook;
                const messageHash = 'orderbook:' + symbol;
                client.resolve (orderbook, messageHash);
                const requestId = this.safeString (subscription, 'id');
                client.resolve (orderbook, requestId);
            }
        }
    }

    handleSubscribeToUserDeltas (client, message, subscription) {
        // console.log (new Date (), 'handleSubscribeToUserDeltas');
        const params = this.safeValue (subscription, 'params');
        // fetch the snapshot in a separate async call
        this.spawn (this.fetchBalanceState, params);
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
        //     { 'R': true, I: '1579299273251' }
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

    handleSystemStatus (client, message) {
        // send signalR protocol start() call
        const future = this.negotiate ();
        this.spawn (this.afterAsync, future, this.start);
        // console.log (new Date (), 'handleSystemStatus', message);
        return message;
    }

    handleHeartbeat (client, message) {
        //
        // every 20 seconds (approx) if no other updates are sent
        //
        //     {}
        //
        client.resolve (message, 'heartbeat');
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
                    method.call (this, client, JSON.parse (this.inflate (A[k])));
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

