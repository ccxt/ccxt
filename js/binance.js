'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const IncrementalOrderBook = require ('./base/IncrementalOrderBook');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'fetchWsOrderBook': true,
                'fetchWsOHLCV': true,
                'fetchWsTrades': true,
            },
            'urls': {
                'api': {
                    'wss': 'wss://stream.binance.com:9443/ws/',
                },
            },
        });
    }

    getWsMessageHash (client, response) {
        return client.url;
    }

    async fetchWsTrades (symbol) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['websocket']['public'] + market['id'].toLowerCase () + '@trade';
        return await this.WsTradesMessage (url, url);
    }

    handleWsTrades (response) {
        const parsed = this.parseTrade (response);
        parsed['symbol'] = this.parseSymbol (response);
        return parsed;
    }

    async fetchWsOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const interval = this.timeframes[timeframe];
        const market = this.market (symbol);
        const url = this.urls['api']['websocket']['public'] + market['id'].toLowerCase () + '@kline_' + interval;
        return await this.WsOHLCVMessage (url, url);
    }

    handleWsOHLCV (ohlcv) {
        const data = ohlcv['k'];
        const timestamp = this.safeInteger (data, 'T');
        const open = this.safeFloat (data, 'o');
        const high = this.safeFloat (data, 'h');
        const close = this.safeFloat (data, 'l');
        const low = this.safeFloat (data, 'c');
        const volume = this.safeFloat (data, 'v');
        return [timestamp, open, high, close, low, volume];
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['websocket']['public'] + market['id'].toLowerCase () + '@depth';
        if (!(symbol in this.orderbooks)) {
            const snapshot = await this.fetchOrderBook (symbol, limit, params);
            this.orderbooks[symbol] = new IncrementalOrderBook (snapshot);
        }
        return await this.WsOrderBookMessage (url, url);
    }

    handleWsOrderBook (orderBook) {
        const deltas = [];
        const nonce = orderBook['u'];
        for (let i = 0; i < orderBook['b'].length; i++) {
            const bid = orderBook['b'][i];
            deltas.push ([nonce, 'absolute', 'bids', parseFloat (bid[0]), parseFloat (bid[1])]);
        }
        for (let i = 0; i < orderBook['a'].length; i++) {
            const asks = orderBook['a'][i];
            deltas.push ([nonce, 'absolute', 'asks', parseFloat (asks[0]), parseFloat (asks[1])]);
        }
        const symbol = this.parseSymbol (orderBook);
        const incrementalBook = this.orderbooks[symbol];
        incrementalBook.update (deltas);
        const timestamp = this.safeInteger (orderBook, 'E');
        incrementalBook.orderBook['timestamp'] = timestamp;
        incrementalBook.orderBook['datetime'] = this.iso8601 (timestamp);
        incrementalBook.orderBook['nonce'] = orderBook['u'];
        return incrementalBook.orderBook;
    }

    parseSymbol (message) {
        return this.marketsById[message['s']]['symbol'];
    }

    handleWsDropped (client, response, messageHash) {
        const orderBookHash = 'wss://stream.binance.com:9443/ws/ethbtc@depth';
        if (messageHash !== undefined && messageHash.startsWith (orderBookHash)) {
            this.handleWsOrderBook (response);
        }
    }
};

