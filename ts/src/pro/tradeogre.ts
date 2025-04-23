
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
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const name = 'book';
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = market['id'] + '@' + name;
        const request: Dict = {
            'a': 'subscribe',
            'e': name,
            't': market['id'],
        };
        const orderbook = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'topic');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
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
        const channelName = 'trade';
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'a': 'subscribe',
            'e': channelName,
            't': market['id'],
        };
        const messageHash = channelName + ':' + symbol;
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name tradeogre#watchTradesForSymbols
     * @see https://tradeogre.com/help/api
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        if ((symbols === undefined) || (symbols.length < 1)) {
            symbols = this.symbols;
        }
        const request: Dict = {
            'a': 'subscribe',
            'e': 'trade',
            't': '*',
        };
        const massageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'trade' + ':' + symbol;
            massageHashes.push (messageHash);
        }
        const url = this.urls['api']['ws'];
        const trades = await this.watchMultiple (url, massageHashes, this.extend (request, params), 'trades');
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        const filteredTrades = this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
        return this.filterByArray (filteredTrades, 'symbol', symbols, false);
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
        const trade = this.parseWsTrade (data, market);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append (trade);
        this.trades[symbol] = trades;
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (trades, messageHash);
        client.resolve (trades, 'trades');
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
            'orderbook': this.handleOrderBook,
            'trade': this.handleTrade,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
