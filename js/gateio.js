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
        const marketId = market['id'];
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const subscribeMessage = {
            'id': requestId,
            'method': 'depth.subscribe',
            'params': ['EOS_USDT', 5, '0.0001'],
        };
        const future = this.watch (url, requestId, subscribeMessage);
        return future;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement gateio signMessage
        return message;
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    handleOrderBookMessage (client, message, orderbook) {
    }

    handleMessage (client, message) {
        console.log (message)
        const messageHash = message['id'];
        const result = message['result'];
        const methods = {
            'depth.update': this.,
        }
        //if ('bids' in result) {
            //this.handleOrderBookMessage (client, message, )
        //}
        client.resolve (message, messageHash);
    }
};
