'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotImplemented } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends ccxt.binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'fetchWsOrderBook': true,
                'fetchWsOHLCV': true,
                'fetchWsTrades': true,
            },
            'urls': {
                'api': {
                    // 'ws': 'wss://stream.binance.com:9443/ws',
                    // 'ws': 'wss://echo.websocket.org/',
                    'ws': 'ws://127.0.0.1:8080',
                },
            },
            'options': {
                'marketsByLowerCaseId': {},
            },
        });
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByLowercaseId = this.safeValue (this.options, 'marketsByLowercaseId');
        if ((marketsByLowercaseId === undefined) || reload) {
            marketsByLowercaseId = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const lowercaseId = this.markets[symbol]['id'].toLowerCase ();
                this.markets[symbol]['lowercaseId'] = lowercaseId;
                marketsByLowercaseId[lowercaseId] = this.markets[symbol];
            }
            this.options['marketsByLowercaseId'] = marketsByLowercaseId;
        }
        return markets;
    }

    async fetchWsTrades (symbol) {
        //     await this.loadMarkets ();
        //     const market = this.market (symbol);
        //     const url = this.urls['api']['ws'] + market['id'].toLowerCase () + '@trade';
        //     return await this.WsTradesMessage (url, url);
        throw new NotImplemented (this.id + ' fetchWsTrades not implemented yet');
    }

    handleWsTrades (response) {
        //     const parsed = this.parseTrade (response);
        //     parsed['symbol'] = this.parseSymbol (response);
        //     return parsed;
        throw new NotImplemented (this.id + ' handleWsTrades not implemented yet');
    }

    async fetchWsOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        //     await this.loadMarkets ();
        //     const interval = this.timeframes[timeframe];
        //     const market = this.market (symbol);
        //     const url = this.urls['api']['ws'] + market['id'].toLowerCase () + '@kline_' + interval;
        //     return await this.WsOHLCVMessage (url, url);
        throw new NotImplemented (this.id + ' fetchWsOHLCV not implemented yet');
    }

    handleWsOHLCV (ohlcv) {
        //     const data = ohlcv['k'];
        //     const timestamp = this.safeInteger (data, 'T');
        //     const open = this.safeFloat (data, 'o');
        //     const high = this.safeFloat (data, 'h');
        //     const close = this.safeFloat (data, 'l');
        //     const low = this.safeFloat (data, 'c');
        //     const volume = this.safeFloat (data, 'v');
        //     return [timestamp, open, high, close, low, volume];
        throw new NotImplemented (this.id + ' handleWsOHLCV not implemented yet ' + this.json (ohlcv));
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // this should be executed much later
        // const orderbook = await this.fetchOrderBook (symbol, limit, params);
        // const request = {};
        const name = 'depth';
        const stream = market['lowercaseId'] + '@' + name;
        const url = this.urls['api']['ws']; // + '/' + stream;
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                stream,
            ],
            'id': requestId,
        };
        const messageHash = stream;
        const future = this.sendWsMessage (url, messageHash, this.extend (request, params), messageHash);
        const client = this.clients[url];
        client['futures'][requestId] = future;
        return future;
    }

    handleWsOrderBook (client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "e": "depthUpdate", // Event type
        //         "E": 123456789, // Event time
        //         "s": "BNBBTC", // Symbol
        //         "U": 157, // First update ID in event
        //         "u": 160, // Final update ID in event
        //         "b": [ // bids
        //             [ "0.0024", "10" ], // price, size
        //         ],
        //         "a": [ // asks
        //             [ "0.0026", "100" ], // price, size
        //         ]
        //     }
        //
        const deltas = [];
        const nonce = message['u'];
        for (let i = 0; i < message['b'].length; i++) {
            const bid = message['b'][i];
            deltas.push ([nonce, 'absolute', 'bids', parseFloat (bid[0]), parseFloat (bid[1])]);
        }
        for (let i = 0; i < message['a'].length; i++) {
            const asks = message['a'][i];
            deltas.push ([nonce, 'absolute', 'asks', parseFloat (asks[0]), parseFloat (asks[1])]);
        }
        const symbol = this.parseSymbol (message);
        const incrementalBook = this.orderbooks[symbol];
        incrementalBook.update (deltas);
        const timestamp = this.safeInteger (message, 'E');
        incrementalBook.message['timestamp'] = timestamp;
        incrementalBook.message['datetime'] = this.iso8601 (timestamp);
        incrementalBook.message['nonce'] = message['u'];
        return incrementalBook.orderBook;
    }

    signWsMessage (client, messageHash, message, params = {}) {
        // todo: binance signWsMessage not implemented yet
        return message;
    }

    handleWsSubscriptionStatus (client, message) {
        //
        // todo: answer the question whether handleWsSubscriptionStatus should be renamed
        // and unified as handleWsResponse for any usage pattern that
        // involves an identified request/response sequence
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const channelId = this.safeString (message, 'channelID');
        this.options['subscriptionStatusByChannelId'][channelId] = message;
        const requestId = this.safeString (message, 'reqid');
        if (client.futures[requestId]) {
            delete client.futures[requestId];
        }
    }

    handleWsMessage (client, message) {
        console.log (message);
        //
        // const keys = Object.keys (client.futures);
        // for (let i = 0; i < keys.length; i++) {
        //     const key = keys[i];
        //     this.rejectWsFuture ()
        // }
        //
        // --------------------------------------------------------------------
        //
        // console.log (new Date (), JSON.stringify (message, null, 4));
        // console.log ('---------------------------------------------------------');
        // if (Array.isArray (message)) {
        //     const channelId = message[0].toString ();
        //     const subscriptionStatus = this.safeValue (this.options['subscriptionStatusByChannelId'], channelId, {});
        //     const subscription = this.safeValue (subscriptionStatus, 'subscription', {});
        //     const name = this.safeString (subscription, 'name');
        //     const methods = {
        //         'book': 'handleWsOrderBook',
        //         'ohlc': 'handleWsOHLCV',
        //         'ticker': 'handleWsTicker',
        //         'trade': 'handleWsTrades',
        //     };
        //     const method = this.safeString (methods, name);
        //     if (method === undefined) {
        //         return message;
        //     } else {
        //         return this[method] (client, message);
        //     }
        // } else {
        //     if (this.handleWsErrors (client, message)) {
        //         const event = this.safeString (message, 'event');
        //         const methods = {
        //             'heartbeat': 'handleWsHeartbeat',
        //             'systemStatus': 'handleWsSystemStatus',
        //             'subscriptionStatus': 'handleWsSubscriptionStatus',
        //         };
        //         const method = this.safeString (methods, event);
        //         if (method === undefined) {
        //             return message;
        //         } else {
        //             return this[method] (client, message);
        //         }
        //     }
        // }
    }
};

