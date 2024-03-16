//  ---------------------------------------------------------------------------

import deltaRest from '../delta.js';
import { NotSupported } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------
export default class delta extends deltaRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': true,
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

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name delta#watchTrades
         * @see https://docs.delta.exchange/#all_trades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const subscriptionHash = 'all_trades';
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': subscriptionHash,
                        'symbols': [
                            market['id'],
                        ],
                    },
                ],
            },
        };
        const messageHash = 'trades:' + symbol;
        const url = this.urls['api']['ws'];
        let trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (trades !== undefined) {
            trades = this.sortBy (trades, 'timestamp');
        }
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0, {});
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // all_trades_snapshot
        //     {
        //         "symbol": "ETH_USDT",
        //         "trades": [
        //             {
        //                 "buyer_role": "taker",
        //                 "price": "2909.60",
        //                 "seller_role": "maker",
        //                 "size": "0.09200",
        //                 "timestamp": 1708508574949128
        //             },
        //             ...
        //         ],
        //         "type": "all_trades_snapshot"
        //     }
        //
        // all_trades (update)
        //     {
        //         "buyer_role": "maker",
        //         "price": "2911.20",
        //         "product_id": 8411,
        //         "seller_role": "taker",
        //         "size": "0.05800",
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1708508731638004",
        //         "type": "all_trades"
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        let trades = this.safeList (message, 'trades', []);
        const type = this.safeString (message, 'type');
        if (type === 'all_trades') {
            trades = [ message ];
        }
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        for (let i = 0; i < trades.length; i++) {
            const trade = this.parseTrade (trades[i], market);
            if (!(symbol in this.trades)) {
                this.trades[symbol] = new ArrayCache (tradesLimit);
            }
            const stored = this.trades[symbol];
            stored.append (trade);
            client.resolve (stored, messageHash);
        }
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name delta#watchTicker
         * @see https://docs.delta.exchange/#v2-ticker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const tickers = await this.watchTickers ([ symbol ], params);
        return this.safeValue (tickers, symbol);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name delta#watchTickers
         * @see https://docs.delta.exchange/#v2-ticker
         * @description watches price tickers, a statistical calculation with the information for all markets or those specified.
         * @param {string} symbols unified symbols of the markets to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an array of [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const marketIds = this.marketIds (symbols);
        const subscriptionHash = 'v2/ticker';
        const messageHash = 'tickers';
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': subscriptionHash,
                        'symbols': marketIds,
                    },
                ],
            },
        };
        const tickers = await this.watchMany (messageHash, request, subscriptionHash, symbols, params);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "close: 2669.25,
        //         "contract_type": "spot",
        //         "greeks": null,
        //         "high": 2685.65,
        //         "low": 2484.25,
        //         "mark_change_24h": "0.0000",
        //         "mark_price": "3200",
        //         "oi": "0.0000",
        //         "oi_change_usd_6h": "0.0000",
        //         "oi_contracts": "0",
        //         "oi_value": "0.0000",
        //         "oi_value_symbol": "ETH",
        //         "oi_value_usd": "0.0000",
        //         "open": 2486.3,
        //         "price_band": null,
        //         "product_id": 8411,
        //         "quotes": {},
        //         "size": 67.1244100000001,
        //         "spot_price": "2668.12",
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1707830745453077",
        //         "turnover": 67.1244100000001,
        //         "turnover_symbol": "ETH",
        //         "turnover_usd": 174972.02068899997,
        //         "type": "v2/ticker",
        //         "volume": 67.1244100000001
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        this.tickers[symbol] = this.parseTicker (message);
        client.resolve (this.tickers[symbol], 'ticker.' + symbol);
        client.resolve (this.tickers, 'tickers');
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name delta#watchOrderBook
         * @see https://docs.delta.exchange/#l2_updates
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'book:' + symbol;
        const subscriptionHash = 'l2_updates';
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': subscriptionHash,
                        'symbols': [
                            market['id'],
                        ],
                    },
                ],
            },
        };
        const url = this.urls['api']['ws'];
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //  snapshot
        //     {
        //         "action": "snapshot",
        //         "asks": [
        //             [ "2914.60", "0.1733" ],
        //             ...
        //         ],
        //         "bids": [
        //             [ "2913.40", "0.6131" ],
        //             ...
        //         ],
        //         "cs": 1905080047,
        //         "sequence_no": 937625,
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1708514696898474",
        //         "type": "l2_updates"
        //     }
        //
        //  update
        //     {
        //         "action": "update",
        //         "asks": [
        //         [ "2914.60", "0" ],
        //         ...
        //         ],
        //         "bids": [
        //         [ "2913.60", "0.6131" ],
        //         ...
        //         ],
        //         "cs": 1145868018,
        //         "sequence_no": 937626,
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1708514697899524",
        //         "type": "l2_updates"
        //     }
        //
        const action = this.safeString (message, 'action');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeIntegerProduct (message, 'timestamp', 0.001);
        const messageHash = 'book:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        if (action === 'snapshot') {
            const snapshot = this.parseOrderBook (message, symbol, timestamp);
            orderbook.reset (snapshot);
        } else if (action === 'update') {
            this.handleDeltas (orderbook['asks'], this.safeList (message, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeList (message, 'bids', []));
        } else {
            throw new NotSupported (this.id + ' watchOrderBook() did not recognize message action ' + action);
        }
        const sequence_no = this.safeInteger (message, 'sequence_no');
        orderbook['nonce'] = sequence_no; // todo: check
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, sideDelta) {
        const price = this.safeFloat (sideDelta, 0);
        const amount = this.safeFloat (sideDelta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
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
        const subscriptionHash = 'candlestick_' + timeframeId;
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': subscriptionHash,
                        'symbols': [
                            market['id'],
                        ],
                    },
                ],
            },
        };
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'];
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
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
        const ohlcvsBySymbol = this.safeDict (this.ohlcvs, symbol);
        if (ohlcvsBySymbol === undefined) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeList (this.ohlcvs[symbol], timeframe);
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
        result[0] = this.safeIntegerProduct (ohlcv, 'candle_start_time', 0.001);
        return result;
    }

    async watchMany (messageHash, request, subscriptionHash, symbols: Strings = [], params = {}) {
        let marketIds = [];
        const numSymbols = symbols.length;
        if (numSymbols === 0) {
            marketIds = Object.keys (this.markets_by_id);
        } else {
            marketIds = this.marketIds (symbols);
        }
        const url = this.urls['api']['ws'];
        const client = this.safeDict (this.clients, url);
        let subscription = {};
        if (client !== undefined) {
            subscription = this.safeDict (client.subscriptions, subscriptionHash);
            if (subscription !== undefined) {
                for (let i = 0; i < marketIds.length; i++) {
                    const marketId = marketIds[i];
                    const marketSubscribed = this.safeBool (subscription, marketId, false);
                    if (!marketSubscribed) {
                        client.subscriptions[subscriptionHash] = undefined;
                    }
                }
            } else {
                subscription = {};
            }
        }
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            subscription[marketId] = true;
        }
        request['type'] = 'subscribe';
        request['payload']['channels'][0]['symbols'] = Object.keys (subscription);
        return await this.watch (url, messageHash, this.deepExtend (request, params), subscriptionHash, subscription);
    }

    handleMessage (client: Client, message) {
        const type = this.safeString (message, 'type', '');
        if (type.indexOf ('candlestick') > -1) {
            this.handleOHLCV (client, message);
        }
        if (type.indexOf ('all_trades') > -1) {
            this.handleTrades (client, message);
        }
        if (type === 'v2/ticker') {
            this.handleTicker (client, message);
        }
        if (type === 'l2_updates') {
            this.handleOrderBook (client, message);
        }
    }
}
