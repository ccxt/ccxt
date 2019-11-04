'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
// const IncrementalOrderBook = require ('./base/IncrementalOrderBook');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends ccxt.bitfinex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'fetchWsTicker': true,
                'fetchWsOrderBook': true,
            },
            'urls': {
                'api': {
                    'wss': 'wss://api-pub.bitfinex.com/ws/2',
                },
            },
        });
    }

    getWsMessageHash (client, response) {
        if (Array.isArray (response) && Array.isArray (response[1])) {
            return this.options['channels'][response[0]];
        }
    }

    async fetchWsTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['websocket']['public'];
        return await this.WsTickerMessage (url, 'ticker/' + marketId, {
            'event': 'subscribe',
            'channel': 'ticker',
            'symbol': marketId,
        });
    }

    handleWsTicker (ticker) {
        const data = ticker[1];
        const symbol = this.parseSymbol (ticker);
        return {
            'symbol': symbol,
            'bid': parseFloat (data[1]),
            'ask': parseFloat (data[2]),
            'change': parseFloat (data[4]),
            'percent': parseFloat (data[5]),
            'last': parseFloat (data[6]),
            'volume': parseFloat (data[7]),
            'high': parseFloat (data[8]),
            'low': parseFloat (data[9]),
            'info': data,
        };
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['websocket']['public'];
        return await this.WsOrderBookMessage (url, 'book/' + marketId, {
            'event': 'subscribe',
            'channel': 'book',
            'symbol': marketId,
        });
    }

    handleWsOrderBook (orderBook) {
        const data = orderBook[1];
        const deltas = Array.isArray (data[0]) ? data : [ data ];
        const bids = [];
        const asks = [];
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            const price = parseFloat (delta[0]);
            let amount = parseFloat (delta[2]);
            const count = parseInt (delta[1]);
            if (amount < 0) {
                amount = -amount;
                asks.push ([ price, amount, count ]);
            } else {
                bids.push ([ price, amount, count ]);
            }
        }
        const symbol = this.parseSymbol (orderBook);
        // if (!(symbol in this.orderBooks)) {
        //     this.orderBooks[symbol] = new IncrementalOrderBook ();
        // }
        const nonce = undefined;
        const timestamp = undefined;
        return this.orderBooks[symbol].update (nonce, timestamp, bids, asks);
    }

    parseDelta (delta) {
        const price = parseFloat (delta[0]);
        let amount = parseFloat (delta[2]);
        const count = parseInt (delta[1]);
        let side = undefined;
        if (amount < 0) {
            side = 'asks';
            amount = -amount;
        } else {
            side = 'bids';
        }
        let operation = 'add';
        if (count === 0) {
            operation = 'delete';
        }
        return [undefined, operation, side, price, amount];
    }

    handleWsDropped (client, response, messageHash) {
        if (this.safeString (response, 'event') === 'subscribed') {
            const channel = response['channel'];
            const marketId = response['pair'];
            const channelId = response['chanId'];
            this.options['channels'][channelId] = channel + '/' + marketId;
            return;
        }
        if (messageHash !== undefined && messageHash.startsWith ('book')) {
            this.handleWsOrderBook (response);
        }
    }

    parseSymbol (response) {
        const channelId = response[0];
        const marketId = this.options['channels'][channelId].split ('/')[1];
        return this.marketsById[marketId]['symbol'];
    }
};
