'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotSupported, ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends ccxt.binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.binance.com:9443/ws',
                    // 'ws': 'wss://echo.websocket.org/',
                    // 'ws': 'ws://127.0.0.1:8080',
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

    async watchTrades (symbol) {
        //     await this.loadMarkets ();
        //     const market = this.market (symbol);
        //     const url = this.urls['api']['ws'] + market['id'].toLowerCase () + '@trade';
        //     return await this.WsTradesMessage (url, url);
        throw new NotSupported (this.id + ' watchTrades not implemented yet');
    }

    handleTrades (response) {
        //     const parsed = this.parseTrade (response);
        //     parsed['symbol'] = this.parseSymbol (response);
        //     return parsed;
        throw new NotSupported (this.id + ' handleTrades not implemented yet');
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        //     await this.loadMarkets ();
        //     const interval = this.timeframes[timeframe];
        //     const market = this.market (symbol);
        //     const url = this.urls['api']['ws'] + market['id'].toLowerCase () + '@kline_' + interval;
        //     return await this.WsOHLCVMessage (url, url);
        throw new NotSupported (this.id + ' watchOHLCV not implemented yet');
    }

    handleOHLCV (ohlcv) {
        //     const data = ohlcv['k'];
        //     const timestamp = this.safeInteger (data, 'T');
        //     const open = this.safeFloat (data, 'o');
        //     const high = this.safeFloat (data, 'h');
        //     const close = this.safeFloat (data, 'l');
        //     const low = this.safeFloat (data, 'c');
        //     const volume = this.safeFloat (data, 'v');
        //     return [timestamp, open, high, close, low, volume];
        throw new NotSupported (this.id + ' handleOHLCV not implemented yet ' + this.json (ohlcv));
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        // for 1000ms: <symbol>@depth<levels>
        // OR
        // for 100ms: <symbol>@depth<levels>@100ms
        // valid <levels> are 5, 10, or 20
        if (limit !== undefined) {
            if ((limit !== 25) && (limit !== 100)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10 or 20');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // this should be executed much later
        // const orderbook = await this.fetchOrderBook (symbol, limit, params);
        // const request = {};
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const url = this.urls['api']['ws']; // + '/' + messageHash;
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash,
            ],
            'id': requestId,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
        // this.onetwo = future;
        // const client = this.clients[url];
        // client['futures'][requestId] = future;
        // return await future; // this.watch (url, messageHash, this.extend (request, params), messageHash);
        // throw new NotSupported (this.id + ' watchOrderBook not implemented yet');
        // return future;
    }

    async fetchOrderBookSnapshot (symbol) {
        // todo: this is sync in php - make it async
        const snapshot = await this.fetchOrderBook (symbol);
        const orderbook = this.orderbooks[symbol];
        orderbook.update (snapshot);
        // const asks = orderbook['asks'];
        // for (let i = 0; i < snapshot['asks'].length; i++) {
        //     asks.storeArray (snapshot['asks'][i]);
        // }
        // const bids = orderbook['bids'];
        // for (let i = 0; i < snapshot['bids'].length; i++) {
        //     bids.storeArray (snapshot['bids'][i]);
        // }
    }

    handleOrderBook (client, message) {
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
        const marketId = this.safeString (message, 's');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //
        const fetching = false;
        if (!fetching) {
            // fetch the snapshot in a separate async call
            // this.spawn (this.fetchOrderBookSnapshot, ...)
            throw new NotSupported (this.id + ' snapshot fetching is wip');
        }
        if (symbol in this.orderbooks) {
            const orderbook = this.orderbooks[symbol];
            // resolve
            client.resolve (orderbook, messageHash);
        } else {
            // accumulate deltas
            this.options['cache'][symbol] = [];
            this.options['cache'][messageHash].push (message);
        }
        // const orderbook = this.order
        // const deltas = [];
        // const nonce = message['u'];
        // for (let i = 0; i < message['b'].length; i++) {
        //     const bid = message['b'][i];
        //     deltas.push ([nonce, 'absolute', 'bids', parseFloat (bid[0]), parseFloat (bid[1])]);
        // }
        // for (let i = 0; i < message['a'].length; i++) {
        //     const asks = message['a'][i];
        //     deltas.push ([nonce, 'absolute', 'asks', parseFloat (asks[0]), parseFloat (asks[1])]);
        // }
        // const symbol = this.parseSymbol (message);
        // const incrementalBook = this.orderbooks[symbol];
        // incrementalBook.update (deltas);
        // const timestamp = this.safeInteger (message, 'E');
        // incrementalBook.message['timestamp'] = timestamp;
        // incrementalBook.message['datetime'] = this.iso8601 (timestamp);
        // incrementalBook.message['nonce'] = message['u'];
        // return incrementalBook.orderBook;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: binance signMessage not implemented yet
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        return message;
    }

    handleMessage (client, message) {
        // const requestId = this.safeString (
        const methods = {
            'depthUpdate': this.handleOrderBook,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeString (methods, event);
        if (method === undefined) {
            const requestId = this.safeString (message, 'id');
            if (requestId !== undefined) {
                return this.handleSubscriptionStatus (client, message);
            }
            return message;
        } else {
            return this.call (method, client, message);
        }
        // console.log (message);
        // process.exit ();
        //
        // const keys = Object.keys (client.futures);
        // for (let i = 0; i < keys.length; i++) {
        //     const key = keys[i];
        //     client.reject ()
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
        //         'book': 'handleOrderBook',
        //         'ohlc': 'handleOHLCV',
        //         'ticker': 'handleTicker',
        //         'trade': 'handleTrades',
        //     };
        //     const method = this.safeString (methods, name);
        //     if (method === undefined) {
        //         return message;
        //     } else {
        //         return this[method] (client, message);
        //     }
        // } else {
        //     if (this.handleErrorMessage (client, message)) {
        //         const event = this.safeString (message, 'event');
        //         const methods = {
        //             'heartbeat': 'handleHeartbeat',
        //             'systemStatus': 'handleSystemStatus',
        //             'subscriptionStatus': 'handleSubscriptionStatus',
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

