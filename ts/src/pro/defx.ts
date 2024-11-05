//  ---------------------------------------------------------------------------

import defxRest from '../defx.js';
import { ExchangeError } from '../base/errors.js';
import { ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, OHLCV, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class defx extends defxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
            },
            'urls': {
                'test': {
                    'ws': {
                        'public': 'wss://stream.testnet.defx.com/pricefeed',
                        'private': 'wss://ws.testnet.defx.com/user',
                    },
                },
                'api': {
                    'ws': {
                        'public': 'wss://stream.testnet.defx.com/pricefeed', // ??
                        'private': 'wss://ws.testnet.defx.com/user', // ??
                    },
                },
            },
            'options': {
                'ws': {
                    'timeframes': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                },
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchPublic (topics, messageHashes, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'topics': topics,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name defx#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'symbol:' + market['id'] + ':ohlc:' + timeframe;
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        const ohlcv = await this.watchPublic ([ topic ], [ messageHash ], params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //     "topic": "symbol:BTC_USDC:ohlc:3m",
        //     "event": "ohlc",
        //     "timestamp": 1730794277104,
        //     "data": {
        //         "symbol": "BTC_USDC",
        //         "window": "3m",
        //         "open": "57486.90000000",
        //         "high": "57486.90000000",
        //         "low": "57486.90000000",
        //         "close": "57486.90000000",
        //         "volume": "0.000",
        //         "quoteAssetVolume": "0.00000000",
        //         "takerBuyAssetVolume": "0.000",
        //         "takerBuyQuoteAssetVolume": "0.00000000",
        //         "numberOfTrades": 0,
        //         "start": 1730794140000,
        //         "end": 1730794320000,
        //         "isClosed": false
        //     }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const timeframe = this.safeString (data, 'window');
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseOHLCV (data);
        ohlcv.append (parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve (ohlcv, messageHash);
    }

    handleMessage (client: Client, message) {
        const error = this.safeString (message, 'code');
        if (error !== undefined) {
            const errorMsg = this.safeString (message, 'msg');
            throw new ExchangeError (this.id + ' ' + errorMsg);
        }
        const topic = this.safeString (message, 'topic');
        if (topic !== undefined) {
            const parts = topic.split (':');
            const topicId = this.safeString (parts, 2);
            const methods: Dict = {
                'ohlc': this.handleOHLCV,
            };
            const exacMethod = this.safeValue (methods, topicId);
            if (exacMethod !== undefined) {
                exacMethod.call (this, client, message);
                return;
            }
            const keys = Object.keys (methods);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (topic.indexOf (keys[i]) >= 0) {
                    const method = methods[key];
                    method.call (this, client, message);
                    return;
                }
            }
        }
    }
}
