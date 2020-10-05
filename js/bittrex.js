'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends ccxt.bittrex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchBalance': true,
                'watchTrades': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchOHLCV': false, // missing on the exchange side
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
            },
        });
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.subscribeToHeartbeat, params);
    }

    async subscribeToHeartbeat (negotiation, params = {}) {
        await this.loadMarkets ();
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
            // 'tid': this.milliseconds () % 10,
        });
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        const requestId = this.milliseconds ().toString ();
        const name = 'heartbeat';
        const messageHash = name;
        const method = 'Subscribe';
        const subscribeHash = method;
        const hub = this.safeString (this.options, 'hub', 'c3');
        const subscriptions = [ name ];
        const request = {
            'H': hub,
            'M': method,
            'A': [ subscriptions ], // arguments
            'I': requestId, // invocation request id
        };
        const subscription = {
            'id': requestId,
            'params': params,
            'negotiation': negotiation,
            'method': this.handleSubscribeToHeartbeat,
        };
        return await this.watch (url, messageHash, request, subscribeHash, subscription);
    }

    // async subscribeToTicker (negotiation, symbol, params = {}) {
    //     await this.loadMarkets ();
    //     const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
    //     const query = this.extend (negotiation['request'], {
    //         'connectionToken': connectionToken,
    //         // 'tid': this.milliseconds () % 10,
    //     });
    //     const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
    //     const requestId = this.milliseconds ().toString ();
    //     const name = 'ticker';
    //     const messageHash = name + ':' + symbol;
    //     const method = 'SubscribeToSummaryDeltas';
    //     const subscribeHash = method;
    //     const hub = this.safeString (this.options, 'hub', 'c3');
    //     const request = {
    //         'H': hub,
    //         'M': method,
    //         'A': [], // arguments
    //         'I': requestId, // invocation request id
    //     };
    //     const subscription = {
    //         'id': requestId,
    //         'symbol': symbol,
    //         'params': params,
    //         'negotiation': negotiation,
    //         'method': this.handleSubscribeToSummaryDeltas,
    //     };
    //     return await this.watch (url, messageHash, request, subscribeHash, subscription);
    // }

    handleMessage (client, message) {
        console.dir (message, { depth: null });
        process.exit ();
        const methods = {
            'uE': this.handleExchangeDelta,
            'uO': this.handleOrderDelta,
            'uB': this.handleBalanceDelta,
            'uS': this.handleSummaryDelta,
        };
        const M = this.safeValue (message, 'M', []);
        for (let i = 0; i < M.length; i++) {
            const methodType = this.safeValue (M[i], 'M');
            const method = this.safeValue (methods, methodType);
            if (method !== undefined) {
                const A = this.safeValue (M[i], 'A', []);
                for (let k = 0; k < A.length; k++) {
                    const inflated = this.inflate64 (A[k]);
                    const update = JSON.parse (inflated);
                    method.call (this, client, update);
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
