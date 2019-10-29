'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const IncrementalOrderBook = require ('./base/IncrementalOrderBook');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'fetchWsTicker': true,
                'fetchWsOrderBook': true,
            },
            'urls': {
                'api': {
                    'wss': 'wss://api2.poloniex.com/',
                },
            },
        });
    }

    getWsMessageHash (client, response) {
        const channelId = response[0].toString ();
        const length = response.length;
        if (length <= 2) {
            return;
        }
        if (channelId === '1002') {
            return channelId + response[2][0].toString ();
        } else {
            return channelId;
        }
    }

    handleWsTicker (response) {
        const data = response[2];
        const market = this.safeValue (this.options['marketsByNumericId'], data[0].toString ());
        const symbol = this.safeString (market, 'symbol');
        return {
            'info': response,
            'symbol': symbol,
            'last': parseFloat (data[1]),
            'ask': parseFloat (data[2]),
            'bid': parseFloat (data[3]),
            'change': parseFloat (data[4]),
            'baseVolume': parseFloat (data[5]),
            'quoteVolume': parseFloat (data[6]),
            'active': data[7] ? false : true,
            'high': parseFloat (data[8]),
            'low': parseFloat (data[9]),
        };
    }

    async fetchWsTicker (symbol) {
        await this.loadMarkets ();
        this.marketsByNumericId ();
        const market = this.market (symbol);
        const numericId = market['info']['id'].toString ();
        const url = this.urls['api']['websocket']['public'];
        return await this.WsTickerMessage (url, '1002' + numericId, {
            'command': 'subscribe',
            'channel': 1002,
        });
    }

    marketsByNumericId () {
        if (this.options['marketsByNumericId'] === undefined) {
            const keys = Object.keys (this.markets);
            this.options['marketsByNumericId'] = {};
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const market = this.markets[key];
                const numericId = market['info']['id'].toString ();
                this.options['marketsByNumericId'][numericId] = market;
            }
        }
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        this.marketsByNumericId ();
        const market = this.market (symbol);
        const numericId = market['info']['id'].toString ();
        const url = this.urls['api']['websocket']['public'];
        return await this.WsOrderBookMessage (url, numericId, {
            'command': 'subscribe',
            'channel': numericId,
        });
    }

    handleWsOrderBook (orderBook) {
        // TODO: handle incremental trades too
        const data = orderBook[2];
        const deltas = [];
        for (let i = 0; i < data.length; i++) {
            let delta = data[i];
            if (delta[0] === 'i') {
                const rawBook = delta[1]['orderBook'];
                const bids = rawBook[1];
                const asks = rawBook[0];
                delta = {
                    'bids': this.parseBidAsk (bids),
                    'asks': this.parseBidAsk (asks),
                    'nonce': undefined,
                    'timestamp': undefined,
                    'datetime': undefined,
                };
                deltas.push (delta);
            } else if (delta[0] === 'o') {
                const price = parseFloat (delta[2]);
                const amount = parseFloat (delta[3]);
                const operation = amount === 0 ? 'delete' : 'add';
                const side = delta[1] ? 'bids' : 'asks';
                delta = [undefined, operation, side, price, amount];
                deltas.push (delta);
            }
        }
        const market = this.safeValue (this.options['marketsByNumericId'], orderBook[0].toString ());
        const symbol = this.safeString (market, 'symbol');
        if (!(symbol in this.orderBooks)) {
            this.orderBooks[symbol] = new IncrementalOrderBook (deltas.shift ());
        }
        const incrementalBook = this.orderBooks[symbol];
        incrementalBook.update (deltas);
        incrementalBook.orderBook['nonce'] = orderBook[1];
        return incrementalBook.orderBook;
    }

    parseBidAsk (bidasks) {
        const prices = Object.keys (bidasks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            const amount = bidasks[price];
            result.push ([parseFloat (price), parseFloat (amount)]);
        }
        return result;
    }

    handleWsDropped (client, response, messageHash) {
        if (messageHash !== undefined && parseInt (messageHash) < 1000) {
            this.handleWsOrderBook (response);
        }
    }
};
