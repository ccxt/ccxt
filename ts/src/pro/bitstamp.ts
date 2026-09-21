
//  ---------------------------------------------------------------------------

import bitstampRest from '../bitstamp.js';
import { ArgumentsRequired, AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, Str, OrderBook, Order, Trade, Dict, Market, Bool, FundingRate } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Precise } from '../base/Precise.js';

//  ---------------------------------------------------------------------------

export default class bitstamp extends bitstampRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchFundingRate': true,
                'watchFundingRates': false,
                'watchMyTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOHLCV': false,
                'watchTicker': false,
                'watchTickers': false,
                'unWatchMyTrades': true,
                'unWatchOrderBook': true,
                'unWatchOrders': true,
                'unWatchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bitstamp.net',
                },
            },
            'options': {
                'expiresIn': '',
                'userId': '',
                'wsSessionToken': '',
                'watchOrderBook': {
                    'snapshotDelay': 6,
                    'snapshotMaxRetries': 3,
                },
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'exact': {
                    '4009': AuthenticationError,
                },
            },
        });
    }

    /**
     * @method
     * @name bitstamp#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const channel = 'diff_order_book_' + market['id'];
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'event': 'bts:subscribe',
            'data': {
                'channel': channel,
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name bitstamp#unWatchOrderBook
     * @description unsubscribe from the order book channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified symbol of the market to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'diff_order_book_' + market['id'];
        const subHash = 'orderbook:' + symbol;
        return await this.unWatchChannel (channel, subHash, 'orderbook', [ symbol ], params);
    }

    /**
     * @ignore
     * @method
     * @description sends an unsubscribe request for a channel and cleans the related caches on confirmation
     * @param {string} channel the raw channel name to unsubscribe from
     * @param {string} subHash the subscription hash whose future and cache entry should be cleaned
     * @param {string} topic the cache topic, one of 'trades', 'orderbook', 'orders' or 'myTrades'
     * @param {string[]} symbols the symbols to clean from the cache
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchChannel (channel: string, subHash: string, topic: string, symbols: string[], params = {}): Promise<any> {
        const url = this.urls['api']['ws'];
        const unsubHash = 'unsubscribe:' + channel;
        const request: Dict = {
            'event': 'bts:unsubscribe',
            'data': {
                'channel': channel,
            },
        };
        const subscription: Dict = {
            'subHash': subHash,
            'topic': topic,
            'symbols': symbols,
        };
        return await this.watch (url, unsubHash, this.extend (request, params), unsubHash, subscription);
    }

    handleOrderBook (client: Client, message: any) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "data": {
        //             "timestamp": "1583656800",
        //             "microtimestamp": "1583656800237527",
        //             "bids": [
        //                 ["8732.02", "0.00002478", "1207590500704256"],
        //                 ["8729.62", "0.01600000", "1207590502350849"],
        //                 ["8727.22", "0.01800000", "1207590504296448"],
        //             ],
        //             "asks": [
        //                 ["8735.67", "2.00000000", "1207590693249024"],
        //                 ["8735.67", "0.01700000", "1207590693634048"],
        //                 ["8735.68", "1.53294500", "1207590692048896"],
        //             ],
        //         },
        //         "event": "data",
        //         "channel": "diff_order_book_btcusd"
        //     }
        //
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        const parts = channel.split ('_');
        const marketId = this.safeString (parts, 3);
        const symbol = this.safeSymbol (marketId);
        const storedOrderBook = this.safeValue (this.orderbooks, symbol);
        const nonce = this.safeValue (storedOrderBook, 'nonce');
        const delta = this.safeValue (message, 'data');
        const deltaNonce = this.safeInteger (delta, 'microtimestamp');
        if (deltaNonce === undefined) {
            return;
        }
        const messageHash = 'orderbook:' + symbol;
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            // the rest API is very delayed
            // usually it takes at least 4-5 deltas to resolve
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 6);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol, null, {});
            }
            storedOrderBook.cache.push (delta);
            return;
        } else if (nonce >= deltaNonce) {
            return;
        }
        this.handleDelta (storedOrderBook, delta);
        client.resolve (storedOrderBook, messageHash);
    }

    override handleDelta (orderbook: any, delta: any) {
        const timestamp = this.safeTimestamp (delta, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = this.safeInteger (delta, 'microtimestamp');
        const bids = this.safeValue (delta, 'bids', []);
        const asks = this.safeValue (delta, 'asks', []);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks (storedBids, bids);
        this.handleBidAsks (storedAsks, asks);
    }

    handleBidAsks (bookSide: any, bidAsks: any) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = this.parseOrderBookBidAsk (bidAsks[i]);
            bookSide.storeArray (bidAsk);
        }
    }

    override getCacheIndex (orderbook: any, deltas: any) {
        // we will consider it a fail
        const firstElement = deltas[0];
        const firstElementNonce = this.safeInteger (firstElement, 'microtimestamp');
        if (firstElementNonce === undefined) {
            return -1;
        }
        const nonce = this.safeInteger (orderbook, 'nonce');
        if ((nonce === undefined) || (nonce < firstElementNonce)) {
            return -1;
        }
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            const deltaNonce = this.safeInteger (delta, 'microtimestamp');
            if (deltaNonce === nonce) {
                return i + 1;
            }
        }
        return deltas.length;
    }

    /**
     * @method
     * @name bitstamp#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const url = this.urls['api']['ws'];
        const channel = 'live_trades_' + market['id'];
        const request: Dict = {
            'event': 'bts:subscribe',
            'data': {
                'channel': channel,
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name bitstamp#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'live_trades_' + market['id'];
        const subHash = 'trades:' + symbol;
        return await this.unWatchChannel (channel, subHash, 'trades', [ symbol ], params);
    }

    override parseWsTrade (trade: any, market: Market = undefined): Trade {
        //
        //     {
        //         "buy_order_id": 1211625836466176,
        //         "amount_str": "1.08000000",
        //         "timestamp": "1584642064",
        //         "microtimestamp": "1584642064685000",
        //         "id": 108637852,
        //         "amount": 1.08,
        //         "sell_order_id": 1211625840754689,
        //         "price_str": "6294.77",
        //         "type": 1,
        //         "price": 6294.77
        //     }
        //
        const microtimestamp = this.safeInteger (trade, 'microtimestamp', 0);
        const id = this.safeString (trade, 'id');
        const timestamp = this.parseToInt (microtimestamp / 1000);
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        if (market === undefined) {
            market = this.safeMarket (undefined, market);
        }
        const symbol = market['symbol'];
        const sideRaw = this.safeInteger (trade, 'type');
        const side = (sideRaw === 0) ? 'buy' : 'sell';
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleTrade (client: Client, message: any) {
        //
        //     {
        //         "data": {
        //             "buy_order_id": 1207733769326592,
        //             "amount_str": "0.14406384",
        //             "timestamp": "1583691851",
        //             "microtimestamp": "1583691851934000",
        //             "id": 106833903,
        //             "amount": 0.14406384,
        //             "sell_order_id": 1207733765476352,
        //             "price_str": "8302.92",
        //             "type": 0,
        //             "price": 8302.92
        //         },
        //         "event": "trade",
        //         "channel": "live_trades_btcusd"
        //     }
        //
        // the trade streams push raw trade information in real-time
        // each trade has a unique buyer and seller
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        const parts = channel.split ('_');
        const marketId = this.safeString (parts, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const data = this.safeValue (message, 'data');
        const trade = this.parseWsTrade (data, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    /**
     * @method
     * @name bitstamp#watchFundingRate
     * @description watch the current funding rate
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of a swap market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'fundingRate:' + symbol;
        const url = this.urls['api']['ws'];
        const channel = 'funding_rate_' + market['id'];
        const request: Dict = {
            'event': 'bts:subscribe',
            'data': {
                'channel': channel,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleFundingRate (client: Client, message: any) {
        //
        //     {
        //         "data": {
        //             "market": "btcusd-perp",
        //             "mark_price": "77291.94844771",
        //             "index_price": "77276.264",
        //             "funding_rate": "0.00013",
        //             "timestamp": "1789455924",
        //             "next_funding_time": "1789459200"
        //         },
        //         "channel": "funding_rate_btcusd-perp",
        //         "event": "funding_rate_saved"
        //     }
        //
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        const parts = channel.split ('_');
        const marketId = this.safeString (parts, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeDict (message, 'data', {});
        const fundingRate = this.parseFundingRate (data, market);
        this.fundingRates[symbol] = fundingRate;
        client.resolve (fundingRate, 'fundingRate:' + symbol);
    }

    /**
     * @method
     * @name bitstamp#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'private-my_orders';
        const messageHash = channel + '_' + market['id'];
        const subscription: Dict = {
            'symbol': symbol,
            'limit': limit,
            'type': channel,
            'params': params,
        };
        const orders = await this.subscribePrivate (subscription, messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name bitstamp#unWatchOrders
     * @description unsubscribe from the orders channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' unWatchOrders() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        await this.authenticate ();
        const channel = 'private-my_orders_' + market['id'] + '-' + this.options['userId'];
        return await this.unWatchChannel (channel, channel, 'orders', [ symbol ], params);
    }

    /**
     * @method
     * @name bitstamp#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'private-my_trades';
        const messageHash = channel + '_' + market['id'];
        const subscription: Dict = {
            'symbol': symbol,
            'limit': limit,
            'type': channel,
            'params': params,
        };
        const trades = await this.subscribePrivate (subscription, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name bitstamp#unWatchMyTrades
     * @description unsubscribe from the myTrades channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of the market the trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' unWatchMyTrades() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        await this.authenticate ();
        const channel = 'private-my_trades_' + market['id'] + '-' + this.options['userId'];
        return await this.unWatchChannel (channel, channel, 'myTrades', [ symbol ], params);
    }

    handleMyTrades (client: Client, message: any) {
        //
        //     {
        //         "data": {
        //             "id": 635698396,
        //             "amount": "0.005000",
        //             "price": "2468.04",
        //             "microtimestamp": "1789459694223000",
        //             "fee": "0.04936",
        //             "order_id": "2050558851342339",
        //             "trade_account_id": 0,
        //             "side": "buy"
        //         },
        //         "channel": "private-my_trades_ethusdt-4416057",
        //         "event": "trade",
        //         "trade_account_id": 0
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const data = this.safeDict (message, 'data', {});
        const subscription = (channel === undefined) ? undefined : this.safeDict (client.subscriptions, channel);
        const symbol = this.safeString (subscription, 'symbol');
        if (symbol === undefined) {
            // cleanUnsubscription deletes the subscription, so a trade frame
            // arriving after an unsubscribe has no subscription to resolve
            // the symbol from - drop the message instead of throwing
            return;
        }
        const market = this.market (symbol);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.myTrades;
        const trade = this.parseWsMyTrade (data, market);
        stored.append (trade);
        client.resolve (stored, channel);
    }

    parseWsMyTrade (trade: any, market: Market = undefined): Trade {
        //
        //     {
        //         "id": 635698396,
        //         "amount": "0.005000",
        //         "price": "2468.04",
        //         "microtimestamp": "1789459694223000",
        //         "fee": "0.04936",
        //         "order_id": "2050558851342339",
        //         "trade_account_id": 0,
        //         "side": "buy"
        //     }
        //
        // the api docs also document id_str, trade_uti, client_order_id,
        // position_id, is_liquidation and trade_type, which the live feed
        // omits for plain spot orderbook fills
        //
        const microtimestamp = this.safeInteger (trade, 'microtimestamp', 0);
        const timestamp = this.parseToInt (microtimestamp / 1000);
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        const feeCost = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'id_str', 'id'),
            'order': this.safeString (trade, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    handleOrders (client: Client, message: any) {
        //
        //     {
        //         "data": {
        //             "id": "2050558851342339",
        //             "id_str": "2050558851342339",
        //             "order_type": 0,
        //             "order_subtype": 2,
        //             "datetime": "1789459694",
        //             "microtimestamp": "1789459694223000",
        //             "amount": 0.005,
        //             "amount_str": "0.005000",
        //             "amount_traded": "0",
        //             "amount_at_create": "0.005000",
        //             "price": 999999999,
        //             "price_str": "999999999.00",
        //             "is_liquidation": false,
        //             "trade_account_id": 0
        //         },
        //         "channel": "private-my_orders_ethusdt-4416057",
        //         "event": "order_created", // order_created | order_changed | order_deleted | order_replaced | stop_active | stop_inactive
        //         "trade_account_id": 0,
        //         "event_id": "00065b81-0d69-fe98-0000-006902000020",
        //         "pre_event_id": "00065b81-0d68-6088-0000-006901000020",
        //         "order_source": "orderbook"
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const order = this.safeDict (message, 'data', {});
        const subscription = (channel === undefined) ? undefined : this.safeDict (client.subscriptions, channel);
        const symbol = this.safeString (subscription, 'symbol');
        if (symbol === undefined) {
            // cleanUnsubscription deletes the subscription, so an order frame
            // arriving after an unsubscribe has no subscription to resolve
            // the symbol from - drop the message instead of throwing
            return;
        }
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        if (this.orders === undefined) {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const market = this.market (symbol);
        order['event'] = this.safeString (message, 'event');
        const parsed = this.parseWsOrder (order, market);
        stored.append (parsed);
        client.resolve (this.orders, channel);
    }

    override parseWsOrder (order: any, market: Market = undefined) {
        //
        // order_deleted after a full fill - amount_str carries the amount
        // left to be executed, amount_at_create the original order amount
        //
        //    {
        //        "id": "2050558851342339",
        //        "id_str": "2050558851342339",
        //        "order_type": 0,
        //        "order_subtype": 2,
        //        "datetime": "1789459694",
        //        "microtimestamp": "1789459694223000",
        //        "amount": 0,
        //        "amount_str": "0",
        //        "amount_traded": "0.005000",
        //        "amount_at_create": "0.005000",
        //        "price": 2468.04,
        //        "price_str": "2468.04",
        //        "is_liquidation": false,
        //        "trade_account_id": 0
        //    }
        //
        const id = this.safeString (order, 'id_str');
        const orderTypeRaw = this.safeStringLower (order, 'order_type');
        const side = (orderTypeRaw === '1') ? 'sell' : 'buy';
        const orderSubTypeRaw = this.safeStringLower (order, 'order_subtype'); // https://www.bitstamp.net/websocket/v2/#:~:text=order_subtype
        let orderType: Str = undefined;
        let timeInForce: Str = undefined;
        if (orderSubTypeRaw === '0') {
            orderType = 'limit';
        } else if (orderSubTypeRaw === '2') {
            orderType = 'market';
        } else if (orderSubTypeRaw === '4') {
            orderType = 'limit';
            timeInForce = 'IOC';
        } else if (orderSubTypeRaw === '6') {
            orderType = 'limit';
            timeInForce = 'FOK';
        } else if (orderSubTypeRaw === '8') {
            orderType = 'limit';
            timeInForce = 'GTD';
        }
        const price = this.safeString (order, 'price_str');
        const amountLeft = this.safeString (order, 'amount_str');
        const amountAtCreate = this.safeString (order, 'amount_at_create');
        // amount_str carries the amount left to be executed, while
        // amount_at_create is the original order amount - older messages
        // do not carry amount_at_create, so fall back to the old behaviour
        let amount = amountLeft;
        let remaining: Str = undefined;
        if (amountAtCreate !== undefined) {
            amount = amountAtCreate;
            remaining = amountLeft;
        }
        const filled = this.safeString (order, 'amount_traded');
        const event = this.safeString (order, 'event');
        let status: Str = undefined;
        if (Precise.stringEq (filled, amount)) {
            status = 'closed';
        } else if (event === 'order_deleted') {
            status = 'canceled';
        }
        const triggerPrice = this.safeString (order, 'stop_price');
        const timestamp = this.safeTimestamp (order, 'datetime');
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleOrderBookSubscription (client: Client, message: any) {
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        const parts = channel.split ('_');
        const marketId = this.safeString (parts, 3);
        const symbol = this.safeSymbol (marketId);
        this.orderbooks[symbol] = this.orderBook ();
    }

    handleSubscriptionStatus (client: Client, message: any) {
        //
        //     {
        //         "event": "bts:subscription_succeeded",
        //         "channel": "detail_order_book_btcusd",
        //         "data": {},
        //     }
        //     {
        //         "event": "bts:subscription_succeeded",
        //         "channel": "private-my_orders_ltcusd-4848701",
        //         "data": {}
        //     }
        //
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        if (channel.indexOf ('order_book') > -1) {
            this.handleOrderBookSubscription (client, message);
        }
    }

    handleUnsubscriptionStatus (client: Client, message: any) {
        //
        //     {
        //         "event": "bts:unsubscription_succeeded",
        //         "channel": "live_trades_btcusd",
        //         "data": {}
        //     }
        //
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        const unsubHash = 'unsubscribe:' + channel;
        const subscription = this.safeDict (client.subscriptions, unsubHash);
        if (subscription === undefined) {
            return;
        }
        const subHash = this.safeString (subscription, 'subHash');
        const topic = this.safeString (subscription, 'topic');
        const symbols = this.safeList (subscription, 'symbols', []);
        // the base cleanCache only prunes trades/orderbooks per symbol and
        // would wipe the whole orders/myTrades cache - rebuild those without
        // the unsubscribed symbols instead, so the markets that are still
        // subscribed keep their cached history
        if ((topic === 'orders') && (this.orders !== undefined)) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            const freshOrdersCache = new ArrayCacheBySymbolById (limit);
            this.orders = this.pruneCachedBySymbols (freshOrdersCache, this.orders, symbols);
        } else if ((topic === 'myTrades') && (this.myTrades !== undefined)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const freshTradesCache = new ArrayCacheBySymbolById (limit);
            this.myTrades = this.pruneCachedBySymbols (freshTradesCache, this.myTrades, symbols);
        } else {
            this.cleanCache (subscription);
        }
        this.cleanUnsubscription (client, subHash, unsubHash);
    }

    /**
     * @ignore
     * @method
     * @description refills a fresh ArrayCacheBySymbolById with the entries of the old cache except the given symbols, so unsubscribing one market keeps the cached entries of the others
     * @param {object} newCache an empty ArrayCacheBySymbolById to fill
     * @param {object} cache the old ArrayCacheBySymbolById to prune
     * @param {string[]} symbols the symbols to remove from the cache
     * @returns {object} the new cache holding the remaining entries
     */
    pruneCachedBySymbols (newCache: any, cache: any, symbols: string[]) {
        const entries = this.toArray (cache);
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const entrySymbol = this.safeString (entry, 'symbol');
            if (!this.inArray (entrySymbol, symbols)) {
                newCache.append (entry);
            }
        }
        return newCache;
    }

    handleSubject (client: Client, message: any) {
        //
        //     {
        //         "data": {
        //             "timestamp": "1583656800",
        //             "microtimestamp": "1583656800237527",
        //             "bids": [
        //                 ["8732.02", "0.00002478", "1207590500704256"],
        //                 ["8729.62", "0.01600000", "1207590502350849"],
        //                 ["8727.22", "0.01800000", "1207590504296448"],
        //             ],
        //             "asks": [
        //                 ["8735.67", "2.00000000", "1207590693249024"],
        //                 ["8735.67", "0.01700000", "1207590693634048"],
        //                 ["8735.68", "1.53294500", "1207590692048896"],
        //             ],
        //         },
        //         "event": "data",
        //         "channel": "detail_order_book_btcusd"
        //     }
        //
        // private order
        //     {
        //         "data":{
        //         "id":"1463471322288128",
        //         "id_str":"1463471322288128",
        //         "order_type":1,
        //         "datetime":"1646127778",
        //         "microtimestamp":"1646127777950000",
        //         "amount":0.05,
        //         "amount_str":"0.05000000",
        //         "price":1000,
        //         "price_str":"1000.00"
        //         },
        //         "channel":"private-my_orders_ltcusd-4848701",
        //         "event": "order_deleted" // field only present for cancelOrder
        //     }
        //
        const channel = this.safeString (message, 'channel');
        if (channel === undefined) {
            return;
        }
        const methods: Dict = {
            'live_trades': this.handleTrade,
            'diff_order_book': this.handleOrderBook,
            'funding_rate': this.handleFundingRate,
            'private-my_orders': this.handleOrders,
            'private-my_trades': this.handleMyTrades,
        };
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (channel.indexOf (key) > -1) {
                const method = methods[key];
                method.call (this, client, message);
            }
        }
    }

    handleErrorMessage (client: Client, message: any): Bool {
        // {
        //     "event": "bts:error",
        //     "channel": '',
        //     "data": { code: 4009, message: "Connection is unauthorized." }
        // }
        const event = this.safeString (message, 'event');
        if (event === 'bts:error') {
            const feedback = this.id + ' ' + this.json (message);
            const data = this.safeValue (message, 'data', {});
            const code = this.safeNumber (data, 'code');
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
        }
        return true;
    }

    override handleMessage (client: Client, message: any) {
        if (this.handleErrorMessage (client, message) !== true) {
            return;
        }
        //
        //     {
        //         "event": "bts:subscription_succeeded",
        //         "channel": "detail_order_book_btcusd",
        //         "data": {},
        //     }
        //
        //     {
        //         "data": {
        //             "timestamp": "1583656800",
        //             "microtimestamp": "1583656800237527",
        //             "bids": [
        //                 ["8732.02", "0.00002478", "1207590500704256"],
        //                 ["8729.62", "0.01600000", "1207590502350849"],
        //                 ["8727.22", "0.01800000", "1207590504296448"],
        //             ],
        //             "asks": [
        //                 ["8735.67", "2.00000000", "1207590693249024"],
        //                 ["8735.67", "0.01700000", "1207590693634048"],
        //                 ["8735.68", "1.53294500", "1207590692048896"],
        //             ],
        //         },
        //         "event": "data",
        //         "channel": "detail_order_book_btcusd"
        //     }
        //
        //     {
        //         "event": "bts:subscription_succeeded",
        //         "channel": "private-my_orders_ltcusd-4848701",
        //         "data": {}
        //     }
        //
        const event = this.safeString (message, 'event');
        if (event === 'bts:subscription_succeeded') {
            this.handleSubscriptionStatus (client, message);
        } else if (event === 'bts:unsubscription_succeeded') {
            this.handleUnsubscriptionStatus (client, message);
        } else {
            this.handleSubject (client, message);
        }
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const time = this.milliseconds ();
        const expiresIn = this.safeInteger (this.options, 'expiresIn');
        if ((expiresIn === undefined) || (time > expiresIn)) {
            // single-flight leader election on a never-dialed client, see
            // https://github.com/ccxt/ccxt/issues/29393: the websocket token is
            // minted by a private REST call and cached in this.options, so N
            // concurrent subscribePrivate () calls on a cold instance all pass
            // the staleness check above and each mint their own token - the
            // tokens are short lived (valid_sec is 60), so this burns the
            // private endpoint and only the last write survives.
            // the flight is registered in client.futures and settled through
            // client.resolve / client.reject, so every mutation of that map
            // goes through the client's own accessors in the ported languages
            const messageHash = 'authenticateFlight';
            const client = this.client ('authenticationFlights');
            if (messageHash in client.futures) {
                // a flight is already in progress - wake when the leader
                // settles it: the token is then in this.options
                await client.future (messageHash);
                return;
            }
            const future = client.reusableFuture (messageHash);
            try {
                const response = await this.privatePostWebsocketsToken (params);
                //
                // {
                //     "valid_sec":60,
                //     "token":"siPaT4m6VGQCdsDCVbLBemiphHQs552e",
                //     "user_id":4848701
                // }
                //
                const sessionToken = this.safeString (response, 'token');
                if (sessionToken === undefined) {
                    // reject the flight BEFORE any cache write: a hollow 200
                    // used to be swallowed silently, leaving expiresIn stale
                    // and every caller subscribing with an empty auth field
                    // until the validity window reopened
                    throw new AuthenticationError (this.id + ' authenticate() received an empty token');
                }
                const userId = this.safeString (response, 'user_id');
                const validity = this.safeIntegerProduct (response, 'valid_sec', 1000);
                this.options['expiresIn'] = this.sum (time, validity);
                this.options['userId'] = userId;
                this.options['wsSessionToken'] = sessionToken;
                // settle the flight: client.resolve deletes the future from
                // client.futures and wakes every waiter parked on it
                client.resolve (sessionToken, messageHash);
            } catch (e) {
                // reject the flight - all waiters throw and the next caller
                // re-leads instead of deadlocking on a dead flight
                client.reject (e, messageHash);
            }
            // rethrows to the leader and marks the promise handled, so an
            // alone leader's rejection is never unhandled
            await future;
        }
    }

    async subscribePrivate (subscription: any, messageHash: any, params = {}) {
        const url = this.urls['api']['ws'];
        await this.authenticate ();
        messageHash += '-' + this.options['userId'];
        const request: Dict = {
            'event': 'bts:subscribe',
            'data': {
                'channel': messageHash,
                'auth': this.options['wsSessionToken'],
            },
        };
        subscription['messageHash'] = messageHash;
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }
}
