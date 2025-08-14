
//  ---------------------------------------------------------------------------

import arkmRest from '../arkm.js';
import { BadRequest, NetworkError, NotSupported, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Tickers, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class arkm extends arkmRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                // 'watchOrders': true,
                // 'watchMyTrades': true,
                'watchTicker': true,
                // 'watchTickers': true,
                // 'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://arkm.com/ws',
                        'swap': 'wss://arkm.com/ws',
                        'future': 'wss://arkm.com/ws',
                    },
                },
            },
            'options': {
                'ws': {
                    'gunzip': true,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true, // needed to be true to keep track of used and free balance
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                'watchOrderBook': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchOrderBookForSymbols': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchTrades': {
                    'ignoreDuplicates': true,
                },
            },
            'streaming': {
                'keepAlive': 300000, // 5 minutes
            },
        });
    }

    handleMessage (client: Client, message) {
        //
        // confirmation
        //
        //     {channel: 'confirmations', confirmationId: 'myCustomId-123'}
        //
        // if (!this.handleErrorMessage (client, message)) {
        //     return;
        // }
        const methods: Dict = {
            'ticker': this.handleTicker,
            'candles': this.handleOHLCV,
            'l2_updates': this.handleOrderBook,
            'trades': this.handleTrades,
            // 'confirmations': this.handleTicker,
        };
        const channel = this.safeString (message, 'channel');
        if (channel === 'confirmations') {
            return;
        }
        const type = this.safeString (message, 'type');
        if (type !== 'update' && type !== 'snapshot') {
            debugger;
        }
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    getMessageHash (unifiedChannel: string, symbol: Str = undefined, extra: Str = undefined) {
        let hash = unifiedChannel;
        if (symbol !== undefined) {
            hash += '::' + symbol;
        } else {
            hash += 's'; // tickers, orderbooks, ohlcvs ...
        }
        if (extra !== undefined) {
            hash += '::' + extra;
        }
        return hash;
    }

    async subscribe (symbol: string, unifiedChannel: string, rawChannel: string, params: Dict): Promise<any> {
        const market = this.market (symbol);
        const messageHash = this.getMessageHash (unifiedChannel, market['symbol']);
        const subscriptionHash = messageHash;
        const request: Dict = {
            'args': {
                'channel': rawChannel,
                'params': this.extend ({
                    'symbol': market['id'],
                }, params),
            },
            'confirmationId': this.uuid (),
            'method': 'subscribe',
        };
        return await this.watch (this.urls['api']['ws']['spot'], messageHash, request, subscriptionHash);
    }

    /**
     * @method
     * @name arkm#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://arkm.com/docs#stream/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        return await this.subscribe (symbol, 'ticker', 'ticker', params);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //   channel: 'ticker',
        //   type: 'update',
        //   data: {
        //     symbol: 'BTC_USDT',
        //     baseSymbol: 'BTC',
        //     quoteSymbol: 'USDT',
        //     price: '118962.74',
        //     price24hAgo: '118780.42',
        //     high24h: '120327.96',
        //     low24h: '118217.28',
        //     volume24h: '32.89729',
        //     quoteVolume24h: '3924438.7146048',
        //     markPrice: '0',
        //     indexPrice: '118963.080293501',
        //     fundingRate: '0',
        //     nextFundingRate: '0',
        //     nextFundingTime: 0,
        //     productType: 'spot',
        //     openInterest: '0',
        //     indexCurrency: 'USDT',
        //     usdVolume24h: '3924438.7146048',
        //     openInterestUSD: '0'
        //   }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, this.getMessageHash ('ticker', symbol));
        // if (this.safeString (message, 'dataType') === 'all@ticker') {
        //     client.resolve (ticker, this.getMessageHash ('ticker'));
        // }
    }

    parseWsTicker (message, market = undefined) {
        // same dict as REST api
        return this.parseTicker (message, market);
    }

    /**
     * @method
     * @name arkm#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://arkm.com/docs#stream/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const rawTimeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const result = await this.subscribe (market['symbol'], 'ohlcv', 'candles', this.extend ({ 'duration': rawTimeframe }, params));
        const ohlcv = result;
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //   channel: 'candles',
        //   type: 'update',
        //   data: {
        //     symbol: 'BTC_USDT',
        //     time: '1755076380000000',
        //     duration: 60000000,
        //     open: '120073.01',
        //     high: '120073.01',
        //     low: '120073.01',
        //     close: '120073.01',
        //     volume: '0',
        //     quoteVolume: '0'
        //   }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const duration = this.safeInteger (data, 'duration');
        const timeframe = this.findTimeframeByDuration (duration);
        const messageHash = this.getMessageHash ('ohlcv', symbol, timeframe);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.handleOption ('watchOHLCV', 'limit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV (data, market);
        stored.append (parsed);
        client.resolve (stored, messageHash);
        return message;
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        // same as REST api
        return this.parseOHLCV (ohlcv, market);
    }

    /**
     * @method
     * @name arkm#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://arkm.com/docs#stream/l2_updates
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const orderBook = await this.subscribe (symbol, 'orderBook', 'l2_updates', this.extend ({ 'snapshot': true }, params));
        return orderBook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // snapshot:
        //
        // {
        //     channel: 'l2_updates',
        //     type: 'snapshot',
        //     data: {
        //         symbol: 'BTC_USDT',
        //         group: '0.01',
        //         asks: [  [Object], [Object], ... ],
        //         bids: [  [Object], [Object], ... ],
        //         lastTime: 1755115180608299
        //     }
        // }
        //
        // update:
        //
        // {
        //   channel: "l2_updates",
        //   type: "update",
        //   data: {
        //     symbol: "BTC_USDT",
        //     group: "0.01",
        //     side: "sell",
        //     size: "0.05295",
        //     price: "122722.76",
        //     revisionId: 2455511217,
        //     time: 1755115736475207,
        //   }
        // }
        //
        const data = this.safeDict (message, 'data');
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = this.getMessageHash ('orderBook', symbol);
        const timestamp = this.safeIntegerProduct (data, 'lastTime', 0.000001);
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook ({});
            ob['symbol'] = symbol;
            this.orderbooks[symbol] = ob;
        }
        const storedOrderBook = this.orderbooks[symbol];
        if (type === 'snapshot') {
            const parsedOrderBook = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
            storedOrderBook.reset (parsedOrderBook);
        } else if (type === 'update') {
            const side = this.safeString (data, 'side');
            const bookside = (side === 'buy') ? storedOrderBook['bids'] : storedOrderBook['asks'];
            this.handleDelta (bookside, data);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        }
        this.orderbooks[symbol] = storedOrderBook;
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'price', 'size');
        bookside.storeArray (bidAsk);
    }

    /**
     * @method
     * @name arkm#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://arkm.com/docs#stream/trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trades = await this.subscribe (market['symbol'], 'trade', 'trades', params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     channel: 'trades',
        //     type: 'update',
        //     data: {
        //         symbol: 'BTC_USDT',
        //         revisionId: 2643896903,
        //         size: '0.00261',
        //         price: '118273.2',
        //         takerSide: 'buy',
        //         time: 1755200320146389
        //     }
        // }
        //
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const parsed = this.parseWsTrade (data);
        const stored = this.trades[symbol];
        stored.append (parsed);
        client.resolve (stored, this.getMessageHash ('trade', symbol));
    }

    parseWsTrade (trade, market = undefined) {
        // same as REST api
        return this.parseTrade (trade, market);
    }
}
