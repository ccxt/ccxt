// ----------------------------------------------------------------------------

import extendedRest from '../extended.js';
import { ExchangeError, InvalidNonce } from '../base/errors.js';
import type { Bool, Dict, FundingRate, Int, OHLCV, Order, OrderBook, Str, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';

// ----------------------------------------------------------------------------

export default class extended extends extendedRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchFundingRate': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchIndexPrice': true,
                'watchMarkPrice': true,
                'watchTrades': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.starknet.extended.exchange/stream.extended.exchange/v1',
                },
                'test': {
                    'ws': 'wss://api.starknet.sepolia.extended.exchange/stream.extended.exchange/v1',
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {
                            'User-Agent': this.userAgents['chrome'],
                        },
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name extended#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.docs.extended.exchange/#order-book-stream
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] set to '1' to receive best bid and ask snapshots only
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const query = this.urlencode (params);
        let url = this.urls['api']['ws'] + '/orderbooks/' + market['id'];
        if (query.length > 0) {
            url += '?' + query;
        }
        const orderbook = await this.watch (url, messageHash, undefined, messageHash, {
            'symbol': symbol,
            'limit': limit,
        });
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "ts": 1701563440000,
        //         "type": "SNAPSHOT",
        //         "data": {
        //             "m": "BTC-USD",
        //             "b": [
        //                 { "p": "25670", "q": "0.1" }
        //             ],
        //             "a": [
        //                 { "p": "25770", "q": "0.1" }
        //             ]
        //         },
        //         "seq": 1
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'm');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (message, 'ts');
        const nonce = this.safeInteger (message, 'seq');
        const type = this.safeString (message, 'type', this.safeString (data, 't'));
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = this.safeDict (client.subscriptions, messageHash, {});
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if (type === 'SNAPSHOT') {
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a', 'p', 'q');
            snapshot['nonce'] = nonce;
            orderbook.reset (snapshot);
            client.resolve (orderbook, messageHash);
            return;
        }
        const previousNonce = this.safeInteger (orderbook, 'nonce');
        if ((previousNonce !== undefined) && (nonce !== previousNonce + 1)) {
            delete client.subscriptions[messageHash];
            delete this.orderbooks[symbol];
            const error = new InvalidNonce (this.id + ' watchOrderBook received invalid nonce');
            client.reject (error, messageHash);
            return;
        }
        this.handleDeltas (orderbook['bids'], this.safeList (data, 'b', []));
        this.handleDeltas (orderbook['asks'], this.safeList (data, 'a', []));
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = nonce;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'p');
        const amount = this.safeFloat2 (delta, 'c', 'q');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    watchPrivate (messageHash: string, subscription = undefined) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'] + '/account';
        if ((this.clients === undefined) || !(url in this.clients)) {
            const defaultOptions = {
                'ws': {
                    'options': {
                        'headers': {},
                    },
                },
            };
            this.extendExchangeOptions (defaultOptions);
            const originalHeaders = this.options['ws']['options']['headers'];
            this.options['ws']['options']['headers'] = this.extend ({
                'User-Agent': this.userAgents['chrome'],
            }, originalHeaders, {
                'X-Api-Key': this.apiKey,
            });
            this.client (url);
            this.options['ws']['options']['headers'] = originalHeaders;
        }
        return this.watch (url, messageHash, undefined, messageHash, subscription);
    }

    /**
     * @method
     * @name extended#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api.docs.extended.exchange/#account-updates-stream
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const orders = await this.watchPrivate (messageHash, {
            'symbol': symbol,
            'limit': limit,
        });
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message) {
        //
        //     {
        //         "type": "ORDER",
        //         "data": {
        //             "orders": [
        //                 {
        //                     "id": 1791181340771614723,
        //                     "accountId": 1791181340771614721,
        //                     "externalId": "-1771812132822291885",
        //                     "market": "BTC-USD",
        //                     "type": "LIMIT",
        //                     "side": "BUY",
        //                     "status": "NEW",
        //                     "price": "12400.000000",
        //                     "averagePrice": "13140.000000",
        //                     "qty": "10.000000",
        //                     "filledQty": "3.513000",
        //                     "payedFee": "0.513000",
        //                     "reduceOnly": true,
        //                     "postOnly": false,
        //                     "createdTime": 1715885888571,
        //                     "updatedTime": 1715885888571,
        //                     "expireTime": 1715885888571
        //                 }
        //             ]
        //         },
        //         "ts": 1715885884837,
        //         "seq": 1
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const data = this.safeDict (message, 'data', {});
        const rawOrders = this.safeList (data, 'orders', []);
        const symbols: Dict = {};
        for (let i = 0; i < rawOrders.length; i++) {
            const order = this.parseOrder (rawOrders[i]);
            const symbol = this.safeString (order, 'symbol');
            symbols[symbol] = true;
            orders.append (order);
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = 'orders:' + keys[i];
            client.resolve (orders, messageHash);
        }
        client.resolve (orders, 'orders');
        if (rawOrders.length === 0) {
            const subscriptions = Object.keys (client.subscriptions);
            for (let i = 0; i < subscriptions.length; i++) {
                const messageHash = subscriptions[i];
                if (messageHash.indexOf ('orders:') === 0) {
                    client.resolve (orders, messageHash);
                }
            }
        }
    }

    /**
     * @method
     * @name extended#watchFundingRate
     * @description watch the current funding rate
     * @see https://api.docs.extended.exchange/#funding-rates-stream
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'fundingRate:' + symbol;
        const query = this.urlencode (params);
        let url = this.urls['api']['ws'] + '/funding/' + market['id'];
        if (query.length > 0) {
            url += '?' + query;
        }
        return await this.watch (url, messageHash, undefined, messageHash, {
            'symbol': symbol,
            'messageHash': messageHash,
        });
    }

    handleFundingRate (client: Client, message) {
        //
        //     {
        //         "ts": 1701563440000,
        //         "data": {
        //             "m": "BTC-USD",
        //             "T": 1701563440000,
        //             "f": "0.001"
        //         },
        //         "seq": 2
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const fundingRate = this.parseWsFundingRate (data, undefined, message);
        const symbol = this.safeString (fundingRate, 'symbol');
        this.fundingRates[symbol] = fundingRate;
        const messageHash = 'fundingRate:' + symbol;
        client.resolve (fundingRate, messageHash);
    }

    parseWsFundingRate (fundingRate, market = undefined, message = undefined): FundingRate {
        const marketId = this.safeString (fundingRate, 'm');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (message, 'ts');
        const fundingTimestamp = this.safeInteger (fundingRate, 'T');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (fundingRate, 'f'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name extended#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://api.docs.extended.exchange/#mark-price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'markPrice:' + symbol;
        const query = this.urlencode (params);
        let url = this.urls['api']['ws'] + '/prices/mark/' + market['id'];
        if (query.length > 0) {
            url += '?' + query;
        }
        return await this.watch (url, messageHash, undefined, messageHash, {
            'name': 'markPrice',
            'symbol': symbol,
            'messageHash': messageHash,
        });
    }

    handleMarkPrice (client: Client, message) {
        //
        //     {
        //         "type": "MP",
        //         "data": {
        //             "m": "BTC-USD",
        //             "p": "80988.400408625006",
        //             "ts": 0
        //         },
        //         "ts": 1778641421485,
        //         "seq": 1
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'm');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let timestamp = this.safeInteger (data, 'ts');
        if ((timestamp === undefined) || (timestamp === 0)) {
            timestamp = this.safeInteger (message, 'ts');
        }
        const ticker = this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'markPrice': this.safeString (data, 'p'),
            'info': message,
        }, market);
        this.tickers[symbol] = ticker;
        const messageHash = 'markPrice:' + symbol;
        client.resolve (ticker, messageHash);
    }

    /**
     * @method
     * @name extended#watchIndexPrice
     * @description watches an index price for a specific market
     * @see https://api.docs.extended.exchange/#index-price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchIndexPrice (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'indexPrice:' + symbol;
        const query = this.urlencode (params);
        let url = this.urls['api']['ws'] + '/prices/index/' + market['id'];
        if (query.length > 0) {
            url += '?' + query;
        }
        return await this.watch (url, messageHash, undefined, messageHash, {
            'name': 'indexPrice',
            'symbol': symbol,
            'messageHash': messageHash,
        });
    }

    handleIndexPrice (client: Client, message) {
        //
        //     {
        //         "type": "IP",
        //         "data": {
        //             "m": "BTC-USD",
        //             "p": "81061.372849012506",
        //             "ts": 1778641858000
        //         },
        //         "ts": 1778641858588,
        //         "seq": 1
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'm');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let timestamp = this.safeInteger (data, 'ts');
        if ((timestamp === undefined) || (timestamp === 0)) {
            timestamp = this.safeInteger (message, 'ts');
        }
        const ticker = this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'indexPrice': this.safeString (data, 'p'),
            'info': message,
        }, market);
        this.tickers[symbol] = ticker;
        const messageHash = 'indexPrice:' + symbol;
        client.resolve (ticker, messageHash);
    }

    /**
     * @method
     * @name extended#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.docs.extended.exchange/#trades-stream
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const query = this.urlencode (params);
        let url = this.urls['api']['ws'] + '/publicTrades/' + market['id'];
        if (query.length > 0) {
            url += '?' + query;
        }
        const trades = await this.watch (url, messageHash, undefined, messageHash, {
            'symbol': symbol,
            'limit': limit,
        });
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "ts": 1701563440000,
        //         "data": [
        //             {
        //                 "m": "BTC-USD",
        //                 "S": "BUY",
        //                 "tT": "TRADE",
        //                 "T": 1701563440000,
        //                 "p": "25670",
        //                 "q": "0.1",
        //                 "i": 25124
        //             }
        //         ],
        //         "seq": 2
        //     }
        //
        const data = this.safeList (message, 'data', []);
        if (data.length === 0) {
            return;
        }
        const first = this.safeDict (data, 0, {});
        const marketId = this.safeString (first, 'm');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const subscription = this.safeDict (client.subscriptions, messageHash, {});
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const defaultLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const previousNonce = this.safeInteger (subscription, 'nonce');
        const nonce = this.safeInteger (message, 'seq');
        if ((previousNonce !== undefined) && (nonce !== undefined) && (nonce <= previousNonce)) {
            return;
        }
        subscription['nonce'] = nonce;
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade (data[i], market);
            stored.append (trade);
        }
        client.resolve (stored, messageHash);
    }

    /**
     * @method
     * @name extended#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.docs.extended.exchange/#candles-stream
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.candleType] candle type: 'trades' (default), 'mark-prices', or 'index-prices'
     * @param {string} [params.price] *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const price = this.safeString (params, 'price');
        let candleType = this.safeString (params, 'candleType');
        if (candleType === undefined) {
            if (price === 'mark') {
                candleType = 'mark-prices';
            } else if (price === 'index') {
                candleType = 'index-prices';
            } else {
                candleType = 'trades';
            }
        }
        params = this.omit (params, [ 'candleType', 'price' ]);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe + ':' + candleType;
        const query = this.urlencode (this.extend ({ 'interval': interval }, params));
        const url = this.urls['api']['ws'] + '/candles/' + market['id'] + '/' + candleType + '?' + query;
        const ohlcv = await this.watch (url, messageHash, undefined, messageHash, {
            'name': 'ohlcv',
            'symbol': symbol,
            'timeframe': timeframe,
            'candleType': candleType,
            'limit': limit,
            'messageHash': messageHash,
        });
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "ts": 1695738675123,
        //         "data": [
        //             {
        //                 "T": 1695738674000,
        //                 "o": "1000.0000",
        //                 "l": "800.0000",
        //                 "h": "2400.0000",
        //                 "c": "2100.0000",
        //                 "v": "10.0000"
        //             }
        //         ],
        //         "seq": 1
        //     }
        //
        const subscription = this.findSubscription (client, 'ohlcv');
        if (subscription === undefined) {
            return;
        }
        const symbol = this.safeString (subscription, 'symbol');
        const timeframe = this.safeString (subscription, 'timeframe');
        const candleType = this.safeString (subscription, 'candleType');
        const cacheKey = (candleType === 'trades') ? timeframe : timeframe + ':' + candleType;
        const messageHash = this.safeString (subscription, 'messageHash');
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], cacheKey);
        if (stored === undefined) {
            const defaultLimit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][cacheKey] = stored;
        }
        const previousNonce = this.safeInteger (subscription, 'nonce');
        const nonce = this.safeInteger (message, 'seq');
        if ((previousNonce !== undefined) && (nonce !== undefined) && (nonce <= previousNonce)) {
            return;
        }
        subscription['nonce'] = nonce;
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseOHLCV (data[i]);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    findSubscription (client: Client, name: string) {
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const subscription = this.safeDict (client.subscriptions, key);
            const subscriptionName = this.safeString (subscription, 'name');
            if (subscriptionName === name) {
                return subscription;
            }
        }
        return undefined;
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //     { "status": "ERROR", "error": { "code": 1001, "message": "Market not found." } }
        //
        const error = this.safeValue (message, 'error');
        if (error === undefined) {
            return false;
        }
        const feedback = this.id + ' ' + this.json (message);
        const errorCode = this.safeString (error, 'code');
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        const errorMessage = this.safeString (error, 'message');
        this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
        throw new ExchangeError (feedback);
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const type = this.safeString (message, 'type');
        if (type === 'ORDER') {
            this.handleOrders (client, message);
            return;
        }
        const data = this.safeValue (message, 'data');
        if (Array.isArray (data)) {
            const first = this.safeDict (data, 0, {});
            const side = this.safeString (first, 'S');
            if (side !== undefined) {
                this.handleTrades (client, message);
            } else {
                this.handleOHLCV (client, message);
            }
        } else if (data !== undefined) {
            if (type === 'MP') {
                this.handleMarkPrice (client, message);
            } else if (type === 'IP') {
                this.handleIndexPrice (client, message);
            } else if ('f' in data) {
                this.handleFundingRate (client, message);
            } else {
                this.handleOrderBook (client, message);
            }
        }
    }
}
