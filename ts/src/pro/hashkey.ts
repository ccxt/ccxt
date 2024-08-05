
//  ---------------------------------------------------------------------------

import hashkeyRest from '../hashkey.js';
import type { Dict, Int, Market, OHLCV } from '../base/types.js';
import { ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class hashkey extends hashkeyRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTrades': false,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream-glb.hashkey.com/quote/ws/v1',
                        'private': 'wss://stream-glb.hashkey.com/api/v1/ws/{listenKey}',
                    },
                    'test': {
                        'ws': {
                            'public': 'wss://stream-glb.sim.hashkeydev.com/quote/ws/v1',
                            'private': 'wss://stream-glb.sim.hashkeydev.com/api/v1/ws/{listenKey}',
                        },
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'listenKey': undefined,
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async wathPublic (market: Market, topic: string, messageHash: string, params = {}) {
        const request: Dict = {
            'symbol': market['id'],
            'topic': topic,
            'event': 'sub',
        };
        const url = this.urls['api']['ws']['public'];
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name ascendex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.binary]
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const topic = 'kline_' + interval;
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const ohlcv = await this.wathPublic (market, topic, messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "symbol": "DOGEUSDT",
        //         "symbolName": "DOGEUSDT",
        //         "topic": "kline",
        //         "params": {
        //             "realtimeInterval": "24h",
        //             "klineType": "1m"
        //         },
        //         "data": [
        //             {
        //                 "t": 1722861660000,
        //                 "s": "DOGEUSDT",
        //                 "sn": "DOGEUSDT",
        //                 "c": "0.08389",
        //                 "h": "0.08389",
        //                 "l": "0.08389",
        //                 "o": "0.08389",
        //                 "v": "0"
        //             }
        //         ],
        //         "f": true,
        //         "sendTime": 1722861664258,
        //         "shared": false
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const params = this.safeDict (message, 'params');
        const klineType = this.safeString (params, 'klineType');
        const timeframe = this.findTimeframe (klineType);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const data = this.safeList (message, 'data', []);
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeDict (data, i, {});
            const parsed = this.parseWsOHLCV (candle, market);
            stored.append (parsed);
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "t": 1722861660000,
        //         "s": "DOGEUSDT",
        //         "sn": "DOGEUSDT",
        //         "c": "0.08389",
        //         "h": "0.08389",
        //         "l": "0.08389",
        //         "o": "0.08389",
        //         "v": "0"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    handleMessage (client: Client, message) {
        const topic = this.safeString (message, 'topic');
        if (topic === 'kline') {
            this.handleOHLCV (client, message);
        }
    }
}
