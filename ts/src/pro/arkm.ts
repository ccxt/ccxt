
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
                // 'watchTrades': true,
                // 'watchTradesForSymbols': false,
                // 'watchOrderBook': true,
                // 'watchOrderBookForSymbols': true,
                // 'watchOHLCV': true,
                // 'watchOHLCVForSymbols': true,
                // 'watchOrders': true,
                // 'watchMyTrades': true,
                // 'watchTicker': true,
                // 'watchTickers': true,
                // 'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://arkm.com/ws',
                        'linear': 'wss://arkm.com/ws',
                        'inverse': 'wss://arkm.com/ws',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3540000, // 1 hour (59 mins so we have 1 min to renew the token)
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
                'keepAlive': 1800000, // 30 minutes
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

    async watchSingle (messageHash: Str, request: Dict, subscriptionHash: Str): Promise<any> {
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
        const market = this.market (symbol);
        const messageHash = this.getMessageHash ('ticker', market['symbol']);
        const subscriptionHash = messageHash;
        const request: Dict = {
            'args': {
                'channel': 'ticker',
                'params': {
                    'snapshot': false,
                    'symbol': market['id'],
                },
            },
            'confirmationId': this.uuid (),
            'method': 'subscribe',
        };
        return await this.watchSingle (messageHash, this.extend (request, params), subscriptionHash);
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
        const messageHash = this.getMessageHash ('ohlcv', market['symbol'], timeframe);
        const subscriptionHash = messageHash;
        const request: Dict = {
            'args': {
                'channel': 'candles',
                'params': {
                    'duration': rawTimeframe,
                    'symbol': market['id'],
                },
            },
            'confirmationId': this.uuid (),
            'method': 'subscribe',
        };
        const result = await this.watchSingle (messageHash, this.extend (request, params), subscriptionHash);
        const ohlcv = result;
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
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
        const parsed = this.parseWsOHLCV (data, market);
        const duration = this.safeInteger (data, 'duration');
        const timeframe = this.findTimeframeByDuration (duration);
        const messageHash = this.getMessageHash ('ohlcv', symbol, timeframe);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.handleOption ('watchOHLCV', 'limit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
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
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = this.getMessageHash ('orderBook', market['symbol']);
        const subscriptionHash = messageHash;
        const request: Dict = {
            'args': {
                'channel': 'l2_updates',
                'params': {
                    'snapshot': true,
                    'symbol': market['id'],
                },
            },
            'confirmationId': this.uuid (),
            'method': 'subscribe',
        };
        const orderBook = await this.watchSingle (messageHash, this.extend (request, params), subscriptionHash);
        return orderBook;
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
        const timestamp = this.safeInteger (data, 'lastTime');
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook ({});
            ob['symbol'] = symbol;
            this.orderbooks[symbol] = ob;
        }
        const storedOrderBook = this.orderbooks[symbol];
        if (type === 'snapshot') {
            const parsedOrderBook = this.parseOrderBook (data, symbol, timestamp);
            storedOrderBook.reset (parsedOrderBook);
        } else if (type === 'update') {
            // storedOrderBook = this.safeValue (this.orderbooks, symbol);
            const asks = this.safeList (data, 'asks', []);
            const bids = this.safeList (data, 'bids', []);
            this.handleDeltas (storedOrderBook['asks'], asks);
            this.handleDeltas (storedOrderBook['bids'], bids);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        }
        this.orderbooks[symbol] = storedOrderBook;
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        // we store the string representations in the orderbook for checksum calculation
        // this simplifies the code for generating checksums as we do not need to do any complex number transformations
        bidAsk.push (delta);
        bookside.storeArray (bidAsk);
    }
}
