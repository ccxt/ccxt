
//  ---------------------------------------------------------------------------

import tradeogreRest from '../tradeogre.js';
import type { Dict, Int, OrderBook, Trade } from '../base/types.js';
import { ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class tradeogre extends tradeogreRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchBalance': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://tradeogre.com:8443',
                },
            },
            'options': {
            },
            'streaming': {
            },
        });
    }

    /**
     * @method
     * @name tradeogre#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://tradeogre.com/help/api
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (not used by the exchange)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook' + ':' + market['symbol'];
        const request: Dict = {
            'a': 'subscribe',
            'e': 'book',
            't': market['id'],
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "e": "book",
        //         "t": "ETH-USDT",
        //         "s": "10752324",
        //         "d": {
        //             "bids": { "1787.02497915": "0" },
        //             "asks": {}
        //         }
        //     }
        //
        const marketId = this.safeString (message, 't');
        const symbol = this.safeSymbol (marketId);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        const deltaNonce = this.safeInteger (message, 's');
        const messageHash = 'orderbook:' + symbol;
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 6);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol, null, {});
            }
            storedOrderBook.cache.push (message);
            return;
        } else if (nonce >= deltaNonce) {
            return;
        }
        this.handleDelta (storedOrderBook, message);
        client.resolve (storedOrderBook, messageHash);
    }

    handleDelta (orderbook, delta) {
        // const timestamp = this.milliseconds (); // todo check if this is correct
        // orderbook['timestamp'] = timestamp;
        // orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = this.safeInteger (delta, 's');
        const data = this.safeDict (delta, 'd', {});
        const bids = this.safeDict (data, 'bids', {});
        const asks = this.safeDict (data, 'asks', {});
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks (storedBids, bids);
        this.handleBidAsks (storedAsks, asks);
    }

    handleBidAsks (bookSide, bidAsks) {
        const keys = Object.keys (bidAsks);
        for (let i = 0; i < keys.length; i++) {
            const price = this.safeString (keys, i);
            const amount = this.safeNumber (bidAsks, price);
            const bidAsk = [ this.parseNumber (price), amount ];
            bookSide.storeArray (bidAsk);
        // for (let i = 0; i < bidAsks.length; i++) {
        //     const bidAsk = this.parseBidAsk (bidAsks[i]);
        //     bookSide.storeArray (bidAsk);
        // }
        }
    }

    getCacheIndex (orderbook, deltas) {
        const firstElement = deltas[0];
        const firstElementNonce = this.safeInteger (firstElement, 's');
        const nonce = this.safeInteger (orderbook, 'nonce');
        if (nonce < firstElementNonce) {
            return -1;
        }
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            const deltaNonce = this.safeInteger (delta, 's');
            if (deltaNonce === nonce) {
                return i + 1;
            }
        }
        return deltas.length;
    }

    /**
     * @method
     * @name tradeogre#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://tradeogre.com/help/api
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name tradeogre#watchTradesForSymbols
     * @see https://tradeogre.com/help/api
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for (empty array means all markets)
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const messageHashes = [];
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        if (symbolsLength > 0) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const messageHash = 'trades:' + symbol;
                messageHashes.push (messageHash);
            }
        } else {
            const messageHash = 'trades';
            messageHashes.push (messageHash);
        }
        const request: Dict = {
            'a': 'subscribe',
            'e': 'trade',
            't': '*',
        };
        const url = this.urls['api']['ws'];
        const trades = await this.watchMultiple (url, messageHashes, this.extend (request, params), [ 'trades' ]);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "e": "trade",
        //         "t": "LTC-USDT",
        //         "d": {
        //             "t": 0,
        //             "p": "84.50000000",
        //             "q": "1.28471270",
        //             "d": "1745392002"
        //         }
        //     }
        //
        const marketId = this.safeString (message, 't');
        const market = this.safeMarket (marketId);
        const data = this.safeDict (message, 'd', {});
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const cache = this.trades[symbol];
        const trade = this.parseWsTrade (data, market);
        cache.append (trade);
        const messageHash = 'trades:' + symbol;
        client.resolve (cache, messageHash);
        client.resolve (cache, 'trades');
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "t": 0,
        //         "p": "84.50000000",
        //         "q": "1.28471270",
        //         "d": "1745392002"
        //     }
        //
        const timestamp = this.safeIntegerProduct (trade, 'd', 1000);
        const sideEnum = this.safeString (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': undefined,
            'type': undefined,
            'side': this.parseWsTradeSide (sideEnum),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
        }, market);
    }

    parseWsTradeSide (side) {
        const sides = {
            '0': 'buy',
            '1': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    handleMessage (client: Client, message) {
        const methods: Dict = {
            'book': this.handleOrderBook,
            'trade': this.handleTrade,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
