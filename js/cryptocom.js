'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class cryptocom extends ccxt.cryptocom {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.crypto.com/v2/market',
                        'private': 'wss://stream.crypto.com/v2/user',
                    },
                },
                'test': {
                    'public': 'wss://uat-stream.3ona.co/v2/market',
                    'private': 'wss://uat-stream.3ona.co/v2/user',
                },
            },
            'options': {
            },
            'streaming': {
            },
        });
    }

    async pong (client, message) {
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        await client.send ({ 'id': this.safeInteger (message, 'id'), 'method': 'public/response-heartbeat' });
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = 'candlestick' + '.' + interval + '.' + market['id'];
        const ohlcv = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //  {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'candlestick.1m.BTC_USDT',
        //       channel: 'candlestick',
        //       depth: 300,
        //       interval: '1m',
        //       data: [ [Object] ]
        //   }
        //
        const messageHash = this.safeString (message, 'subscription');
        const marketId = this.safeString (message, 'instrument_name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'interval');
        const timeframe = this.findTimeframe (interval);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const data = this.safeValue (message, 'data');
        for (let i = 0; i < data.length; i++) {
            const tick = data[i];
            const parsed = this.parseOHLCV (tick, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce ();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [messageHash],
            },
            'nonce': id,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleErrorMessage (client, message) {
        return true;
    }

    handleMessage (client, message) {
        // ping
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        // ohlcv
        // {
        //     code: 0,
        //     method: 'subscribe',
        //     result: {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'candlestick.1m.BTC_USDT',
        //       channel: 'candlestick',
        //       depth: 300,
        //       interval: '1m',
        //       data: [ [Object] ]
        //     }
        //   }
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const subject = this.safeString (message, 'method');
        if (subject === 'public/heartbeat') {
            this.pong (client, message);
            return;
        }
        const methods = {
            'candlestick': this.handleOHLCV,
        };
        const result = this.safeValue (message, 'result', {});
        const channel = this.safeString (result, 'channel');
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, result);
        }
    }
};
