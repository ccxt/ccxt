//  ---------------------------------------------------------------------------

import coincatchRest from '../coincatch.js';
import type { Dict, Int, Market, OHLCV, OrderBook, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class coincatch extends coincatchRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.coincatch.com/public/v1/stream',
                        'private': 'wss://ws.coincatch.com/private/v1/stream',
                    },
                },
            },
            'options': {
                'timeframesForWs': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1H',
                    '4h': '4H',
                    '12h': '12H',
                    '1d': '1D',
                    '1w': '1W',
                },
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coincatch#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://coincatch.github.io/github.io/en/spot/#tickers-channel
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] the type of the instrument to fetch the ticker for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        const channel = 'ticker';
        const instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [
                {
                    'instType': instType,
                    'channel': channel,
                    'instId': instId,
                },
            ],
        };
        const messageHash = channel + ':' + symbol;
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    handleTicker (client: Client, message) {
        //
        //     action: 'snapshot',
        //     arg: { instType: 'sp', channel: 'ticker', instId: 'ETHUSDT' },
        //     data: [
        //         {
        //             instId: 'ETHUSDT',
        //             last: '2421.06',
        //             open24h: '2416.93',
        //             high24h: '2441.47',
        //             low24h: '2352.99',
        //             bestBid: '2421.03',
        //             bestAsk: '2421.06',
        //             baseVolume: '9445.2043',
        //             quoteVolume: '22807159.1148',
        //             ts: 1728131730687,
        //             labeId: 0,
        //             openUtc: '2414.50',
        //             chgUTC: '0.00272',
        //             bidSz: '3.866',
        //             askSz: '0.124'
        //         }
        //     ],
        //     ts: 1728131730688
        //
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const market = this.safeMarket (symbol);
        const data = this.safeList (message, 'data', []);
        const ticker = this.parseWsTicker (this.safeDict (data, 0, {}), market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         instId: 'ETHUSDT',
        //         last: '2421.06',
        //         open24h: '2416.93',
        //         high24h: '2441.47',
        //         low24h: '2352.99',
        //         bestBid: '2421.03',
        //         bestAsk: '2421.06',
        //         baseVolume: '9445.2043',
        //         quoteVolume: '22807159.1148',
        //         ts: 1728131730687,
        //         labeId: 0,
        //         openUtc: '2414.50',
        //         chgUTC: '0.00272',
        //         bidSz: '3.866',
        //         askSz: '0.124'
        //     }
        //
        const marketId = this.safeString (ticker, 'instId');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': this.safeInteger (ticker, 'ts'),
            'datetime': this.iso8601 (this.safeInteger (ticker, 'ts')),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'open24h'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'chgUTC'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coincatch#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://coincatch.github.io/github.io/en/spot/#candlesticks-channel
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch (not including)
         * @param {int} [limit] the maximum amount of candles to fetch (not including)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.instType] the type of the instrument to fetch the OHLCV data for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        const timeframes = this.options['timeframesForWs'];
        const channel = 'candle' + this.safeString (timeframes, timeframe);
        const instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [
                {
                    'instType': instType,
                    'channel': channel,
                    'instId': instId,
                },
            ],
        };
        const messageHash = channel + ':' + symbol;
        const ohlcv = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'candle1D', instId: 'ETHUSDT' },
        //         data: [
        //             [
        //                 '1728316800000',
        //                 '2474.5',
        //                 '2478.21',
        //                 '2459.8',
        //                 '2463.51',
        //                 '86.0551'
        //             ]
        //         ],
        //         ts: 1728317607657
        //     }
        //
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const market = this.safeMarket (symbol);
        const data = this.safeList (message, 'data', []);
        const channel = this.safeString (arg, 'channel');
        const klineType = channel.slice (6);
        const timeframe = this.findTimeframe (klineType);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeList (data, i, []);
            const parsed = this.parseWsOHLCV (candle, market);
            stored.append (parsed);
        }
        const messageHash = channel + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         '1728316800000',
        //         '2474.5',
        //         '2478.21',
        //         '2459.8',
        //         '2463.51',
        //         '86.0551'
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coincatch#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (only 5 or 15 in exchange).
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        let channel = 'books';
        if (limit === 5 || limit === 15) {
            channel += limit.toString ();
        }
        const instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [
                {
                    'instType': instType,
                    'channel': channel,
                    'instId': instId,
                },
            ],
        };
        const messageHash = channel + ':' + symbol;
        const orderbook = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'books', instId: 'ETHUSDT' },
        //         data: [
        //             {
        //                 asks: [ [ 2507.07, 0.4248 ] ],
        //                 bids: [ [ 2507.05, 0.1198 ] ],
        //                 checksum: -1400923312,
        //                 ts: '1728339446908'
        //             }
        //         ],
        //         ts: 1728339446908
        //     }
        //
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const channel = this.safeString (arg, 'channel');
        const messageHash = channel + ':' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const data = this.safeList (message, 'data', []);
        const dataEntry = this.safeDict (data, 0);
        const timestamp = this.safeInteger (dataEntry, 'ts');
        const snapshot = this.parseOrderBook (dataEntry, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hashkey#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.binary] true or false - default false
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        const channel = 'trade';
        const instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [
                {
                    'instType': instType,
                    'channel': channel,
                    'instId': instId,
                },
            ],
        };
        const messageHash = 'trade:' + symbol;
        const trades = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'trade', instId: 'ETHUSDT' },
        //         data: [ [ '1728341807469', '2421.41', '0.478', 'sell' ] ],
        //         ts: 1728341807482
        //     }
        //
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const market = this.safeMarket (symbol);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        let data = this.safeList (message, 'data', []);
        data[symbol] = symbol;
        if (data !== undefined) {
            data = this.sortBy (data, 0);
            for (let i = 0; i < data.length; i++) {
                const trade = this.safeList (data, i);
                const parsed = this.parseWsTrade (trade, market);
                stored.append (parsed);
            }
        }
        const messageHash = 'trade:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined): Trade {
        //
        //     [
        //         '1728341807469',
        //         '2421.41',
        //         '0.478',
        //         'sell'
        //     ]
        //
        const marketId = market['id'];
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 0);
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'side': this.safeStringLower (trade, 3),
            'price': this.safeString (trade, 1),
            'amount': this.safeString (trade, 2),
            'cost': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'order': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    handleMessage (client: Client, message) {
        const data = this.safeDict (message, 'arg', {});
        const channel = this.safeString (data, 'channel');
        const timeframe = channel.slice (6);
        const limitForOrderBook = channel.slice (5);
        if (channel === 'ticker') {
            this.handleTicker (client, message);
        }
        if (channel === 'candle' + timeframe) {
            this.handleOHLCV (client, message);
        }
        if (channel === 'books' + limitForOrderBook) {
            this.handleOrderBook (client, message);
        }
        if (channel === 'trade') {
            this.handleTrades (client, message);
        }
    }
}
