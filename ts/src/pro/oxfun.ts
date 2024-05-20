
//  ---------------------------------------------------------------------------

import oxfunRest from '../oxfun.js';
import { ArgumentsRequired } from '../base/errors.js';
import type { Dictionary, Int, Market, OHLCV, OrderBook, Trade } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class oxfun extends oxfunRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': true,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.ox.fun/v2/websocket',
                    'test': 'wss://stgapi.ox.fun/v2/websocket',
                },
            },
            'options': {
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
                'watchOrderBook': {
                    'channel': 'depth', // depth, depthL5, depthL10, depthL25
                },
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async subscribeMultiple (messageHashes, argsArray, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': argsArray,
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
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
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name oxfun#watchTradesForSymbols
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.ox.fun/?json#trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const args = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'trades' + ':' + symbol;
            messageHashes.push (messageHash);
            const marketId = this.marketId (symbol);
            const arg = 'trade:' + marketId;
            args.push (arg);
        }
        const trades = await this.subscribeMultiple (messageHashes, args, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0, {});
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
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
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const interval = this.safeString (timeframes, timeframe, timeframe);
        const args = 'candles' + interval + ':' + market['id'];
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [ args ],
        };
        const ohlcvs = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcvs.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcvs, since, limit, 0, true);
    }

    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Dictionary<Dictionary<OHLCV[]>>> {
        /**
         * @method
         * @name oxfun#watchOHLCVForSymbols
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.ox.fun/?json#candles
         * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT:OX', '1m'], ['OX/USDT', '5m']]");
        }
        await this.loadMarkets ();
        const args = [];
        const messageHashes = [];
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const sym = symbolAndTimeframe[0];
            const tf = symbolAndTimeframe[1];
            const marketId = this.marketId (sym);
            const interval = this.safeString (timeframes, tf, tf);
            const arg = 'candles' + interval + ':' + marketId;
            args.push (arg);
            const messageHash = 'multi:ohlcv:' + sym + ':' + tf;
            messageHashes.push (messageHash);
        }
        const [ symbol, timeframe, candles ] = await this.subscribeMultiple (messageHashes, args, params);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
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
        //         ]
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
        // for multiOHLCV we need special object, as opposed to other "multi"
        // methods, because OHLCV response item does not contain symbol
        // or timeframe, thus otherwise it would be unrecognizable
        const messageHashForMulti = 'multi:' + messageHash;
        client.resolve ([ symbol, timeframe, stored ], messageHashForMulti);
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

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name oxfun#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.ox.fun/?json#fixed-size-order-book
         * @see https://docs.ox.fun/?json#full-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name oxfun#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.ox.fun/?json#fixed-size-order-book
         * @see https://docs.ox.fun/?json#full-order-book
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let channel = 'depth';
        const options = this.safeDict (this.options, 'watchOrderBook', {});
        const defaultChannel = this.safeString (options, 'channel');
        if (defaultChannel !== undefined) {
            channel = defaultChannel;
        } else if (limit !== undefined) {
            if (limit <= 5) {
                channel = 'depthL5';
            } else if (limit <= 10) {
                channel = 'depthL10';
            } else if (limit <= 25) {
                channel = 'depthL25';
            }
        }
        const args = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'orderbook:' + symbol;
            messageHashes.push (messageHash);
            const marketId = this.marketId (symbol);
            const arg = channel + ':' + marketId;
            args.push (arg);
        }
        const orderbook = await this.subscribeMultiple (messageHashes, args, params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "table": "depth",
        //         "data": {
        //             "seqNum": "100170478917895032",
        //             "asks": [
        //                 [ 0.01, 100500 ],
        //                 ...
        //             ],
        //             "bids": [
        //                 [ 69.69696, 69 ],
        //                 ...
        //             ],
        //             "checksum": 261021645,
        //             "marketCode": "OX-USDT",
        //             "timestamp": 1716204786184
        //         },
        //         "action": "partial"
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'marketCode');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (data, 'timestamp');
        const messageHash = 'orderbook:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'asks', 'bids');
        orderbook.reset (snapshot);
        orderbook['nonce'] = this.safeInteger (data, 'seqNum'); // todo
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client: Client, message) {
        const table = this.safeString (message, 'table');
        const data = this.safeList (message, 'data', []);
        if ((table !== undefined) && (data !== undefined)) {
            if (table === 'trade') {
                this.handleTrades (client, message);
            }
            if (table.includes ('candles')) {
                this.handleOHLCV (client, message);
            }
            if (table.includes ('depth')) {
                this.handleOrderBook (client, message);
            }
        }
    }
}
