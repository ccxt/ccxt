
//  ---------------------------------------------------------------------------

import oxfunRest from '../oxfun.js';
import type { Int, Market, OHLCV, Trade } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class oxfun extends oxfunRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchOrderBook': false,
                'watchOHLCV': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.ox.fun/v2/websocket',
                        'private': 'wss://api.ox.fun/v2/websocket',
                    },
                    'test': {
                        'public': 'wss://stgapi.ox.fun/v2/websocket',
                        'private': 'wss://stgapi.ox.fun/v2/websocket',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'watchOrderBook': {
                    'snapshotDelay': 25,
                    'snapshotMaxRetries': 3,
                },
                'listenKey': undefined,
                'timeframes': {
                    '1m': '60s',
                    '3m': '180s',
                    '5m': '300s',
                    '15m': '900s',
                    '30m': '1800s',
                    '1h': '3600s',
                    '2h': '7200s',
                    '4h': '14400s',
                    '6h': '21600s',
                    '12h': '43200s',
                    '1d': '86400s',
                },
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name oxfun#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.ox.fun/?json#trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const subscribeHash = 'trade:' + market['id'];
        const messageHash = 'trades:' + symbol;
        const request = {
            'op': 'subscribe',
            'args': [ subscribeHash ],
        };
        const url = this.urls['api']['ws']['public'];
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         table: 'trade',
        //         data: [
        //             {
        //                 side: 'SELL',
        //                 quantity: '0.074',
        //                 matchType: 'TAKER',
        //                 price: '3079.5',
        //                 marketCode: 'ETH-USD-SWAP-LIN',
        //                 tradeId: '400017157974517783',
        //                 timestamp: '1716124156643'
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict (data, i, {});
            const parsedTrade = this.parseWsTrade (trade);
            const symbol = this.safeString (parsedTrade, 'symbol');
            const messageHash = 'trades:' + symbol;
            if (!(symbol in this.trades)) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.trades[symbol] = new ArrayCache (tradesLimit);
            }
            const stored = this.trades[symbol];
            stored.append (parsedTrade);
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade, market = undefined): Trade {
        //
        //     {
        //         side: 'SELL',
        //         quantity: '0.074',
        //         matchType: 'TAKER',
        //         price: '3079.5',
        //         marketCode: 'ETH-USD-SWAP-LIN',
        //         tradeId: '400017157974517783',
        //         timestamp: '1716124156643'
        //     }
        //
        const marketId = this.safeString (trade, 'marketCode');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': this.safeStringLower (trade, 'matchType'),
            'side': this.safeStringLower (trade, 'side'),
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber (trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
        });
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name oxfun#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.ox.fun/?json#candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const interval = this.safeString (timeframes, timeframe, timeframe);
        const subscribeHash = 'candles' + interval + ':' + market['id'];
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const request = {
            'op': 'subscribe',
            'args': [ subscribeHash ],
        };
        const url = this.urls['api']['ws']['public'];
        const ohlcvs = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcvs.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcvs, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "table": "candles60s",
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "candle": [
        //                     "1594313762698", //timestamp
        //                     "9633.1",        //open
        //                     "9693.9",        //high
        //                     "9238.1",        //low
        //                     "9630.2",        //close
        //                     "45247",         //volume in OX
        //                     "5.3"            //volume in Contracts
        //                 ]
        //             }
        //         ]```
        //     }
        //
        const table = this.safeString (message, 'table');
        const parts = table.split ('candles');
        const timeframeId = this.safeString (parts, 1, '');
        const timeframe = this.findTimeframe (timeframeId);
        const messageData = this.safeList (message, 'data', []);
        const data = this.safeDict (messageData, 0, {});
        const marketId = this.safeString (data, 'marketCode');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const candle = this.safeList (data, 'candle', []);
        const parsed = this.parseWsOHLCV (candle, market);
        const stored = this.ohlcvs[symbol][timeframe];
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         "1594313762698", //timestamp
        //         "9633.1",        //open
        //         "9693.9",        //high
        //         "9238.1",        //low
        //         "9630.2",        //close
        //         "45247",         //volume in OX
        //         "5.3"            //volume in Contracts
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 6),
        ];
    }

    handleMessage (client: Client, message) {
        const table = this.safeString (message, 'table');
        const data = this.safeList (message, 'data', []);
        if ((table !== undefined) && (data !== undefined)) { // for public methods
            if (table === 'trade') {
                this.handleTrades (client, message);
            }
            if (table.includes ('candles')) {
                this.handleOHLCV (client, message);
            }
        }
    }
}
