'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class idex2 extends ccxt.idex2 {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchOHLCV': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchOrders': true,
                'watchBalance': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://websocket-sandbox.idex.io/v1',
                },
                'api': {},
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchOrderBookLimit': 1000, // default limit
            },
        });
    }

    async subscribe (subscribeObject, messageHash) {
        const url = this.urls['test']['ws'];
        const request = {
            'method': 'subscribe',
            'subscriptions': [
                subscribeObject,
            ],
        };
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'tickers';
        const subscribeObject = {
            'name': name,
            'markets': [ market['id'] ],
        };
        const messageHash = name + ':' + market['id'];
        return await this.subscribe (this.extend (subscribeObject, params), messageHash);
    }

    handleTicker (client, message) {
        // { type: 'tickers',
        //   data:
        //    { m: 'DIL-ETH',
        //      t: 1599213946045,
        //      o: '0.09699020',
        //      h: '0.10301548',
        //      l: '0.09577222',
        //      c: '0.09907311',
        //      Q: '1.32723120',
        //      v: '297.80667468',
        //      q: '29.52142669',
        //      P: '2.14',
        //      n: 197,
        //      a: '0.09912245',
        //      b: '0.09686980',
        //      u: 5870 } }
        const type = this.safeString (message, 'type');
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'm');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            symbol = this.markets_by_id[marketId]['symbol'];
        }
        const messageHash = type + ':' + marketId;
        const timestamp = this.safeInteger (data, 't');
        const close = this.safeFloat (data, 'c');
        const percentage = this.safeFloat (data, 'P');
        let change = undefined;
        if ((percentage !== undefined) && (close !== undefined)) {
            change = close * percentage;
        }
        const ticker = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (data, 'h'),
            'low': this.safeFloat (data, 'l'),
            'bid': this.safeFloat (data, 'b'),
            'bidVolume': undefined,
            'ask': this.safeFloat (data, 'a'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (data, 'o'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (data, 'v'),
            'quoteVolume': this.safeFloat (data, 'q'),
            'info': message,
        };
        client.resolve (ticker, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trades';
        const subscribeObject = {
            'name': name,
            'markets': [ market['id'] ],
        };
        const messageHash = name + ':' + market['id'];
        return await this.subscribe (subscribeObject, messageHash);
    }

    handleTrade (client, message) {
        // { type: 'trades',
        //   data:
        //    { m: 'DIL-ETH',
        //      i: '1e46b334-2b74-369d-805a-1fc533bc3136',
        //      p: '0.09904172',
        //      q: '0.10000000',
        //      Q: '0.00990417',
        //      t: 1599216797946,
        //      s: 'sell',
        //      u: 5879 } }
        const type = this.safeString (message, 'type');
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'm');
        const messageHash = type + ':' + marketId;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement signMessage
        return message;
    }

    handleErrorMessage (client, message) {
    }

    handleMessage (client, message) {
        const type = this.safeString (message, 'type');
        const methods = {
            'tickers': this.handleTicker,
            'trades': this.handleTrade,
        };
        if (type in methods) {
            const method = methods[type];
            method.call (this, client, message);
        } else {
            this.handleErrorMessage (client, message);
        }

    }
};
