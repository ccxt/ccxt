'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gateio extends ccxt.gateio {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.gate.io/v3',
                },
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'].toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        if (!limit) {
            limit = 30;
        } else if (limit !== 1 && limit !== 5 && limit !== 10 && limit !== 20 && limit !== 30) {
            throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 1, 5, 10, 20, or 30');
        }
        const interval = this.safeString (params, 'interval', '0.1');
        const precision = -1 * Math.log10 (interval);
        if (precision < 0 || precision > 8 || precision % 1 !== 0) {
            throw new ExchangeError (this.id + ' invalid interval');
        }
        const messageHash = precision.toString () + ':' + marketId;
        const subscribeMessage = {
            'id': requestId,
            'method': 'depth.subscribe',
            'params': [marketId, limit, interval],
        };
        console.log (messageHash);
        const future = this.watch (url, messageHash, subscribeMessage);
        return future;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement gateio signMessage
        return message;
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        const params = message['params'];
        const clean = params[0];
        const book = params[1];
        const marketId = params[2];
        let orderBook = undefined;
        if (marketId in this.orderbooks) {
            orderBook = this.orderbooks[marketId];
        } else {
            orderBook = this.orderBook ({});
        }
        const parsed = {};
        let price = undefined;
        let side = undefined;
        if ('asks' in book) {
            parsed['asks'] = this.parseOrderBookSide (book['asks']);
            side = book['asks'];
        } else {
            parsed['asks'] = [];
        }
        if ('bids' in book) {
            parsed['bids'] = this.parseOrderBookSide (book['bids']);
            side = book['bids'];
        } else {
            parsed['bids'] = [];
        }
        for (let i = 0; i < side.length; i++) {
            const order = side[i];
            if (order[0].indexOf ('.') > -1) {
                price = order[0];
                break;
            }
        }
        const afterDecimal = price.split ('.')[1];
        const precision = afterDecimal.length;
        const messageHash = precision.toString () + ':' + marketId;
        if (clean) {
            orderBook.reset (parsed);
        } else {
            orderBook.update (parsed);
        }
        client.resolve (messageHash, orderBook);
    }

    parseOrderBookSide (bookSide) {
        const result = [];
        for (let i = 0; i < bookSide.length; i++) {
            const order = bookSide[i];
            result.push ([parseFloat (order[0]), parseFloat (order[1])]);
        }
        return result;
    }

    handleMessage (client, message) {
        console.log (message);
        const methods = {
            'depth.update': this.handleOrderBook.bind (this),
        };
        const methodType = this.safeString (message, 'method');
        const method = this.safeValue (methods, methodType);
        if (method) {
            method (client, message);
        }
    }
};
