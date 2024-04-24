
//  ---------------------------------------------------------------------------

import bitflexRest from '../bitflex.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Market, OHLCV, OrderBook, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------
export default class bitflex extends bitflexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wsapi.bitflex.com/openapi/quote/ws/v2',
                        'private': 'wss://wsapi.bitflex.com/openapi/ws',
                    },
                },
            },
            'exceptions': {
                'exact': {
                    // { code: '-100003', desc: 'Symbol required!' }
                    // { code: '-10001', desc: 'Invalid JSON!' }
                },
                'broad': {
                },
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitflex#watchOrderBook
         * @see https://docs.bitflex.com/websocket-v2
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        // todo should we use limit?
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'depth';
        const messageHash = 'book:' + symbol;
        const request = {
            'topic': subscriptionHash,
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         topic: 'depth',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             s: 'ETHUSDT',
        //             t: 1713864203648,
        //             v: '32619510_2',
        //             b: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ],
        //             a: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (data, 't');
        const messageHash = 'book:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
        orderbook.reset (snapshot);
        const nonceString = this.safeString (data, 'v');
        const parts = nonceString.split ('_');
        orderbook['nonce'] = this.parseToInt (parts[0]); // todo check
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitflex#watchTicker
         * @see https://docs.bitflex.com/websocket-v2
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'realtimes';
        const messageHash = 'ticker:' + symbol;
        const request = {
            'topic': subscriptionHash,
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const ticker = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return ticker;
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         topic: 'realtimes',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             t: 1713868819783,
        //             s: 'ETHUSDT',
        //             o: '3214.33',
        //             h: '3223.86',
        //             l: '3153.03',
        //             c: '3184.97',
        //             v: '1707.2222',
        //             qv: '5447142.127877',
        //             m: '-0.0091'
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const symbol = this.safeSymbol (marketId);
        this.tickers[symbol] = this.parseWsTicker (data);
        client.resolve (this.tickers[symbol], 'ticker:' + symbol);
        client.resolve (this.tickers, 'tickers');
    }

    parseWsTicker (message, market: Market = undefined) {
        //
        //     {
        //         t: 1713868819783,
        //         s: 'ETHUSDT',
        //         o: '3214.33',
        //         h: '3223.86',
        //         l: '3153.03',
        //         c: '3184.97',
        //         v: '1707.2222',
        //         qv: '5447142.127877',
        //         m: '-0.0091'
        //     }
        //
        const timestamp = this.safeInteger (message, 't');
        const marketId = this.safeString (message, 's');
        market = this.safeMarket (marketId, market);
        const close = this.safeString (message, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (message, 'h'),
            'low': this.safeString (message, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (message, 'o'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeIntegerProduct (message, 'm', 100),
            'average': undefined,
            'baseVolume': this.safeString (message, 'v'),
            'quoteVolume': this.safeString (message, 'qv'),
            'info': message,
        }, market);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitflex#watchTrades
         * @see https://docs.bitflex.com/websocket-v2
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'trade';
        const messageHash = 'trades:' + symbol;
        const request = {
            'topic': subscriptionHash,
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
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
        //         topic: 'trade',
        //         params: {
        //             symbol: 'ETH-SWAP-USDT',
        //             binary: 'false',
        //             symbolName: 'ETH-SWAP-USDT'
        //         },
        //         data: {
        //             v: '1670465027720953857',
        //             t: 1713870949174,
        //             p: '3178.59',
        //             q: '0.58',
        //             m: false
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (tradesLimit);
        }
        const stored = this.trades[symbol];
        const messageHash = 'trades:' + symbol;
        const data = this.safeDict (message, 'data', {});
        const trade = this.parseWsTrade (data, market);
        stored.append (trade);
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market: Market = undefined) {
        //
        //     data: {
        //         v: '1670465027720953857',
        //         t: 1713870949174,
        //         p: '3178.59',
        //         q: '0.58',
        //         m: false
        //     }
        //
        const timestamp = this.safeInteger (trade, 't');
        const isMaker = this.safeBool (trade, 'm');
        return this.safeTrade ({
            'info': trade,
            'amount': this.safeString (trade, 'q'),
            'datetime': this.iso8601 (timestamp),
            'id': undefined,
            'order': undefined,
            'price': this.safeString (trade, 'p'),
            'timestamp': timestamp,
            'type': undefined,
            'side': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'takerOrMaker': isMaker ? 'maker' : 'taker',
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitflex#fetchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.bitflex.exchange/#candlesticks
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
            'topic': 'kline',
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
                'klineType': timeframeId,
            },
        };
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframe;
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         topic: 'kline',
        //         params: {
        //             symbol: 'ETHUSDT',
        //             binary: 'false',
        //             klineType: '6h',
        //             symbolName: 'ETHUSDT'
        //         },
        //         data: {
        //             t: 1713873600000,
        //             s: 'ETHUSDT',
        //             sn: 'ETHUSDT',
        //             c: '3188.19',
        //             h: '3188.21',
        //             l: '3177.46',
        //             o: '3179.17',
        //             v: '8.5997'
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const timeframeId = this.safeString (params, 'klineType');
        const marketId = this.safeString (params, 'symbol', '');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const timeframe = this.findTimeframe (timeframeId);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const data = this.safeDict (message, 'data', {});
        const parsed = this.parseWsOHLCV (data, market);
        const stored = this.ohlcvs[symbol][timeframe];
        // todo the excchange returns multiple candles with same timeframe
        stored.push (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         t: 1713873600000,
        //         s: 'ETHUSDT',
        //         sn: 'ETHUSDT',
        //         c: '3188.19',
        //         h: '3188.21',
        //         l: '3177.46',
        //         o: '3179.17',
        //         v: '8.5997'
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
        //
        //     {
        //         topic: 'depth',
        //         event: 'sub',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         code: '0',
        //         msg: 'Success'
        //     }
        //
        //     {
        //         topic: 'depth',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             s: 'ETHUSDT',
        //             t: 1713864203648,
        //             v: '32619510_2',
        //             b: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ],
        //             a: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ]
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const data = this.safeDict (message, 'data');
        if (data !== undefined) {
            if (topic === 'depth') {
                this.handleOrderBook (client, message);
            }
            if (topic === 'realtimes') {
                this.handleTicker (client, message);
            }
            if (topic === 'trade') {
                this.handleTrades (client, message);
            }
            if (topic === 'kline') {
                this.handleOHLCV (client, message);
            }
        }
    }
}
