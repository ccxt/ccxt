//  ---------------------------------------------------------------------------

import deltaRest from '../delta.js';
import { ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Market, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------
export default class delta extends deltaRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': false,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://socket.delta.exchange',
                },
                'test': {
                    'ws': 'wss://testnet-socket.delta.exchange',
                },
            },
        });
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name delta#fetchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.delta.exchange/#candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframeId = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': 'candlestick_' + timeframeId,
                        'symbols': [
                            market['id'],
                        ],
                    },
                ],
            },
        };
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'];
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "candle_start_time": "1706548320000000",
        //         "close": 2301.65,
        //         "high": 2301.65,
        //         "last_updated": "1706548346156723",
        //         "low": 2301.65,
        //         "open": 2301.65,
        //         "resolution": "1m",
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1706548377948581",
        //         "type": "candlestick_1m",
        //         "volume": 0.187
        //     }
        //
        const type = this.safeString (message, 'type', '');
        const typeAndTimeframeId = type.split ('_');
        const timeframeId = typeAndTimeframeId[1];
        const marketId = this.safeString (message, 'symbol', '');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const timeframe = this.findTimeframe (timeframeId);
        const ohlcvsBySymbol = this.safeValue (this.ohlcvs, symbol);
        if (ohlcvsBySymbol === undefined) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const parsed = this.parseWsOHLCV (message, market);
        stored.push (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        const result = this.parseOHLCV (ohlcv, market);
        const candle_start_time = this.safeInteger (ohlcv, 'candle_start_time');
        result[0] = candle_start_time / 1000;
        return result;
    }

    handleMessage (client: Client, message) {
        return this.handleOHLCV (client, message);
    }
}
