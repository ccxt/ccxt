//  ---------------------------------------------------------------------------

import paribuRest from '../paribu.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InvalidNonce, OperationRejected, RateLimitExceeded } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import type { Balances, Dict, Int, Market, NullableDict, Order, OrderBook, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

/**
 * @class paribu
 * @augments Exchange
 */
export default class paribu extends paribuRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': false, // no candle channel exists
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOrders': true,
                'watchOrdersForSymbols': false,
                'watchPosition': false,
                'watchPositions': false,
                'watchStatus': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.paribu.com/v1/wapi/stream',
                        'private': 'wss://api.paribu.com/v1/wapi/user',
                        // the 24 hour ticker is the one channel the newer stream
                        // generation does not carry, so it is taken from the older one
                        'ticker': 'wss://api.paribu.com/stream',
                    },
                },
            },
            'options': {
                'requestId': 0,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
                // a fill and the commission charged on it arrive on two different
                // channels, in either order, and are tied together by a shared
                // transaction id. each side is parked here until the other one lands
                'commissions': {},
                'fills': {},
                'correlationLimit': 1000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        // the newer stream generation, numeric and stable — the
                        // accompanying message is human readable and may change
                        '2001': BadRequest, // unknown channel
                        '2002': BadRequest, // malformed channel string
                        '2003': BadSymbol, // unknown market, permanent
                        '2004': BadRequest, // channel not available on this endpoint
                        '2005': OperationRejected, // subscription limit exceeded
                        '3001': BadRequest, // invalid JSON
                        '3002': BadRequest, // missing method
                        '3003': BadRequest, // invalid method
                        '3004': BadRequest, // channels list empty
                        '3005': BadRequest, // id too long
                        '3006': BadRequest, // channels list too long
                        '3007': RateLimitExceeded, // subscribe rate-limited
                        '5002': ExchangeNotAvailable, // backpressure, events were dropped
                        '5003': ExchangeNotAvailable, // server shutting down
                        '5004': ExchangeNotAvailable, // stream unavailable, transient
                        // the older generation, used for the 24 hour ticker only
                        '200': BadRequest, // invalid payload
                        '201': BadRequest, // subscription error
                    },
                },
            },
        });
    }

    requestId (): Int {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    rememberCorrelation (bucket: string, key: string, value: any) {
        // a fill and the commission charged on it arrive on two different channels
        // and are tied together by a shared id, so whichever lands first waits here
        // for the other. a fill the exchange never charges for, or a commission whose
        // fill is never consumed, would sit here forever, so the store is emptied
        // once it grows past the cap. dropping only the oldest entry would need an
        // order, and map iteration order is not stable across the languages this
        // class is translated into
        const limit = this.safeInteger (this.options, 'correlationLimit', 1000);
        if (Object.keys (this.options[bucket]).length >= limit) {
            this.options[bucket] = {};
        }
        // the write goes through the full path on purpose: a php array is a value, so
        // assigning into a local copy of this.options[...] would be thrown away and
        // the fee would never reach the trade in that language
        this.options[bucket][key] = value;
    }

    async subscribe (url: string, channels: string[], messageHashes: string[], params = {}, subscription: NullableDict = undefined) {
        // the counter is read into a local first rather than nested inside the
        // conversion: rust borrows self mutably to bump it and immutably for the
        // call around it, and rejects the two in one expression
        const nextRequestId = this.requestId ();
        const correlationId = this.numberToString (nextRequestId);
        const message: Dict = {
            'method': 'subscribe',
            'channels': channels,
            'id': correlationId,
        };
        const client = this.client (url);
        // a failed subscription is answered with an in-band error frame and nothing
        // else — no close, no timeout — so the futures waiting on this request are
        // remembered under the id the frame echoes back, to be rejected when it comes.
        // only a request that actually goes out can be answered, and watchMultiple
        // sends nothing when every channel is already subscribed, so registering
        // unconditionally would leave one dead entry behind per watch call
        let sending = false;
        for (let i = 0; i < channels.length; i++) {
            if (!(channels[i] in client.subscriptions)) {
                sending = true;
            }
        }
        if (sending) {
            client.subscriptions['pending:' + correlationId] = {
                'channels': channels,
                'messageHashes': messageHashes,
            };
        }
        return await this.watchMultiple (url, messageHashes, this.extend (message, params), channels, subscription);
    }

    authenticate (url: string) {
        this.checkRequiredCredentials ();
        if ((this.clients !== undefined) && (url in this.clients)) {
            return;
        }
        // the credentials ride on the upgrade request as http headers rather than in
        // a frame. for an upgrade the query string and the body are both empty, so
        // the signed payload reduces to the timestamp on its own, and a rejected
        // handshake is an http 401 before any frame is exchanged
        const timestamp = this.numberToString (this.milliseconds ());
        const signature = this.hmac (this.encode (timestamp), this.encode (this.secret), sha256, 'base64');
        // extendExchangeOptions merges one level deep only, so handing it a nested
        // default would replace whatever the caller configured under 'ws' wholesale.
        // the existing subtree is carried through by hand and put back once the
        // client has been built with the signed headers
        const wsOptions = this.safeDict (this.options, 'ws', {});
        const transport = this.safeDict (wsOptions, 'options', {});
        const originalHeaders = this.safeDict (transport, 'headers', {});
        const signedHeaders = this.extend (originalHeaders, {
            'Authorization': this.apiKey, // raw, no Bearer prefix
            'X-Timestamp': timestamp,
            'X-Signature': signature,
        });
        this.extendExchangeOptions ({
            'ws': this.extend (wsOptions, { 'options': this.extend (transport, { 'headers': signedHeaders }) }),
        });
        this.client (url);
        this.extendExchangeOptions ({
            'ws': this.extend (wsOptions, { 'options': this.extend (transport, { 'headers': originalHeaders }) }),
        });
    }

    /**
     * @method
     * @name paribu#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paribu.com/api/streams-v2/public-streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const channel = 'orderbook:' + market['id'];
        const messageHash = 'orderbook:' + symbol;
        const orderbook = await this.subscribe (url, [ channel ], [ messageHash ], params, {
            'symbol': symbol,
            'limit': limit,
        });
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: any) {
        //
        //     {
        //         "e": "orderbook",
        //         "E": 1789662457464,
        //         "s": "btc_tl",
        //         "r": {
        //             "t": "snapshot",
        //             "sq": 44428595,
        //             "b": [ [ "3725639", "0.006523" ] ],
        //             "a": [ [ "3727293", "0.006522" ] ]
        //         }
        //     }
        //
        const payload = this.safeDict (message, 'r', {});
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (message, 'E');
        const sequence = this.safeInteger (payload, 'sq');
        const subType = this.safeString (payload, 't');
        if (!(symbol in this.orderbooks)) {
            if (subType !== 'snapshot') {
                // a diff or a heartbeat before the snapshot has nothing to apply to
                return;
            }
            const subscription = this.safeDict (client.subscriptions, 'orderbook:' + marketId, {});
            const limit = this.safeInteger (subscription, 'limit');
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        // the local has to be spelled exactly this way: the go transpiler recognises
        // the name to cast the cached book back to its order book interface
        const orderbook = this.orderbooks[symbol];
        if (subType === 'snapshot') {
            const snapshot = this.parseOrderBook (payload, symbol, timestamp, 'b', 'a');
            snapshot['nonce'] = sequence;
            orderbook.reset (snapshot);
            client.resolve (orderbook, messageHash);
            return;
        }
        const previousSequence = this.safeInteger (orderbook, 'nonce');
        if (subType === 'heartbeat') {
            // a heartbeat restates the sequence without advancing it: an equal value
            // means the book is current, anything else means a diff was missed
            if ((previousSequence !== undefined) && (sequence !== previousSequence)) {
                this.resetOrderBook (client, symbol, messageHash);
            }
            return;
        }
        if ((previousSequence !== undefined) && (sequence !== undefined) && (sequence <= previousSequence)) {
            // an overlap or a redelivery carries nothing the book does not have
            return;
        }
        if ((previousSequence !== undefined) && (sequence !== undefined) && (sequence !== this.sum (previousSequence, 1))) {
            this.resetOrderBook (client, symbol, messageHash);
            return;
        }
        this.handleDeltas (orderbook['bids'], this.safeList (payload, 'b', []));
        this.handleDeltas (orderbook['asks'], this.safeList (payload, 'a', []));
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = sequence;
        client.resolve (orderbook, messageHash);
    }

    resetOrderBook (client: Client, symbol: string, messageHash: string) {
        // the server itself closes an order book subscription with 4003 when it sees
        // a gap, but it can also be seen from this side first. either way the local
        // book is unusable and only a fresh snapshot repairs it, so the subscription
        // is dropped and the caller is told rather than being served a wrong book
        const market = this.market (symbol);
        const subscribeHash = 'orderbook:' + market['id'];
        delete client.subscriptions[subscribeHash];
        delete this.orderbooks[symbol];
        const error = new InvalidNonce (this.id + ' watchOrderBook() detected a gap in the order book sequence for ' + symbol);
        client.reject (error, messageHash);
    }

    override handleDelta (bookside: any, delta: any) {
        // a level is a [ price, quantity ] pair of decimal strings, and a quantity of
        // zero removes the level rather than storing an empty one
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    override handleDeltas (bookside: any, deltas: any) {
        // spelled out rather than left to the inherited loop: the Rust base's
        // handleDeltas default calls handleDelta on itself rather than on the
        // derived override, so a class that only overrides handleDelta panics
        // there with "not supported yet" the moment a static fixture exercises
        // it. binance carries the identical override for the same reason
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name paribu#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.paribu.com/api/streams-v2/public-streams
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        // the exchange publishes no channel covering every market at once, so each
        // one is its own subscription and at least one has to be named
        symbols = this.marketSymbols (symbols, undefined, false);
        const url = this.urls['api']['ws']['public'];
        const channels = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            channels.push ('book-ticker:' + market['id']);
            messageHashes.push ('bidsasks:' + market['symbol']);
        }
        // the local must not be named after a word that appears inside a string
        // literal in this same method: the php transpiler rewrites the occurrence
        // inside 'book-ticker:' too and the subscription goes out malformed
        const topOfBook = await this.subscribe (url, channels, messageHashes, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[topOfBook['symbol']] = topOfBook;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message: any) {
        //
        //     {
        //         "e": "orderbook",
        //         "E": 1789662457463,
        //         "s": "btc_tl",
        //         "r": {
        //             "t": "book-ticker",
        //             "b": "3725639",
        //             "bq": "0.006523",
        //             "a": "3727293",
        //             "aq": "0.006522",
        //             "u": 254302853
        //         }
        //     }
        //
        const payload = this.safeDict (message, 'r', {});
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const stateId = this.safeInteger (payload, 'u');
        const previous = this.safeDict (this.bidsasks, symbol);
        if (previous !== undefined) {
            // the top of book is re-sent on a timer while nothing changes, which is
            // how an idle market reports that the feed is alive. such a frame carries
            // no state the last one did not, so it is not passed on as an update
            const previousInfo = this.safeDict (previous, 'info', {});
            const previousStateId = this.safeInteger (previousInfo, 'u');
            if ((previousStateId !== undefined) && (stateId !== undefined) && (stateId <= previousStateId)) {
                return;
            }
        }
        const ticker = this.parseWsBidAsk (message, market);
        this.bidsasks[symbol] = ticker;
        client.resolve (ticker, 'bidsasks:' + symbol);
    }

    parseWsBidAsk (ticker: Dict, market: Market = undefined): Ticker {
        const payload = this.safeDict (ticker, 'r', {});
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'E');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            // an empty side is published as an empty string, which safeString reads
            // as an absence already
            'bid': this.safeString (payload, 'b'),
            'bidVolume': this.safeString (payload, 'bq'),
            'ask': this.safeString (payload, 'a'),
            'askVolume': this.safeString (payload, 'aq'),
            'info': payload,
        }, market);
    }

    /**
     * @method
     * @name paribu#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.paribu.com/api/streams-v2/public-streams
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const channel = 'matches:' + market['id'];
        const messageHash = 'trades:' + symbol;
        const trades = await this.subscribe (url, [ channel ], [ messageHash ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message: any) {
        //
        //     {
        //         "e": "order",
        //         "E": 1789662463581,
        //         "s": "btc_tl",
        //         "r": {
        //             "t": "match",
        //             "i": "bb953f692654edeb5711f3c0bf70a42e",
        //             "p": "3726455",
        //             "q": "0.113685",
        //             "S": "SELL",
        //             "T": 1789662463581
        //         }
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        stored.append (this.parseWsTrade (message, market));
        client.resolve (stored, 'trades:' + symbol);
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        const payload = this.safeDict (trade, 'r', {});
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (payload, 'T');
        return this.safeTrade ({
            'id': this.safeString (payload, 'i'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            // the channel publishes the side the taker took, and nothing about the
            // counterparties
            'side': this.safeStringLower (payload, 'S'),
            'takerOrMaker': undefined,
            'price': this.safeString (payload, 'p'),
            'amount': this.safeString (payload, 'q'),
            'cost': undefined,
            'fee': undefined,
            'info': payload,
        }, market);
    }

    /**
     * @method
     * @name paribu#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.paribu.com/api/streams/streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['ticker'];
        const channel = 'ticker24h:' + market['id'];
        const messageHash = 'ticker:' + symbol;
        return await this.subscribe (url, [ channel ], [ messageHash ], params);
    }

    /**
     * @method
     * @name paribu#watchTickers
     * @description watches price tickers, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.paribu.com/api/streams/streams
     * @param {string[]} symbols unified symbols of the markets to fetch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        // the exchange publishes no channel covering every market at once, so each
        // one is its own subscription and at least one has to be named
        symbols = this.marketSymbols (symbols, undefined, false);
        const url = this.urls['api']['ws']['ticker'];
        const channels = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            channels.push ('ticker24h:' + market['id']);
            messageHashes.push ('ticker:' + market['symbol']);
        }
        const ticker = await this.subscribe (url, channels, messageHashes, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message: any) {
        //
        //     {
        //         "e": "ticker24h",
        //         "E": 1789662584625,
        //         "s": "btc_tl",
        //         "r": {
        //             "l": "3651754",
        //             "h": "3748788",
        //             "o": "3682765",
        //             "c": "3726455",
        //             "v": "39.089995",
        //             "q": "145011245",
        //             "p": "43690",
        //             "P": "1.18",
        //             "w": "3709676"
        //         }
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (message, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker:' + symbol);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        const payload = this.safeDict (ticker, 'r', {});
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'E');
        const last = this.safeString (payload, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (payload, 'h'),
            'low': this.safeString (payload, 'l'),
            // the channel carries the 24 hour statistics only, never the top of book
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeString (payload, 'w'),
            'open': this.safeString (payload, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (payload, 'p'),
            'percentage': this.safeString (payload, 'P'),
            'average': undefined,
            'baseVolume': this.safeString (payload, 'v'),
            'quoteVolume': this.safeString (payload, 'q'),
            'info': payload,
        }, market);
    }

    /**
     * @method
     * @name paribu#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.paribu.com/api/streams-v2/private-streams
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders:' + symbol;
        }
        const url = this.urls['api']['ws']['private'];
        this.authenticate (url);
        const orders = await this.subscribe (url, [ 'orders' ], [ messageHash ], params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client: Client, message: any) {
        //
        //     {
        //         "e": "order",
        //         "E": 1789662457464,
        //         "r": {
        //             "t": "placed",
        //             "i": "01a03d32-eeaa-7cc9-b289-1668cd05d477",
        //             "s": "btc_tl",
        //             "p": "3352302",
        //             "q": "0.000044",
        //             "S": "BUY",
        //             "rq": "0.000044",
        //             "tp": "0",
        //             "rtp": "0",
        //             "ot": "LIMIT",
        //             "tif": "GTC",
        //             "aa": 1789662457000,
        //             "T": 1789662457400
        //         }
        //     }
        //
        const payload = this.safeDict (message, 'r', {});
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const parsed = this.parseWsOrder (payload);
        orders.append (parsed);
        const symbol = parsed['symbol'];
        client.resolve (orders, 'orders');
        if (symbol !== undefined) {
            client.resolve (orders, 'orders:' + symbol);
        }
        const subType = this.safeString (payload, 't');
        if (subType === 'match') {
            this.handleMyTrade (client, payload);
        }
    }

    override parseWsOrder (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeString (order, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'aa');
        const rawType = this.safeStringLower (order, 'ot');
        // post-only is an order type of its own rather than a flag, the same way the
        // order endpoints publish it
        let isPostOnly = undefined;
        let orderType = rawType;
        if (rawType === 'limit_maker') {
            isPostOnly = true;
            orderType = 'limit';
        } else if (rawType !== undefined) {
            isPostOnly = false;
        }
        const remaining = this.safeString (order, 'rq');
        const subType = this.safeString (order, 't');
        let status = this.parseWsOrderStatus (subType);
        if ((status === undefined) && (remaining !== undefined)) {
            // a fill event says nothing about the order being finished, so what
            // separates a partial fill from the last one is the remaining quantity.
            // an event that carries no remaining quantity at all leaves the status
            // unknown rather than claiming the order is done
            if (Precise.stringGt (remaining, '0')) {
                status = 'open';
            } else {
                status = 'closed';
            }
        }
        // a market order carries a zero limit price and a market buy a zero quantity,
        // both of which are an absence rather than a value
        let price = this.safeString (order, 'p');
        if ((price !== undefined) && Precise.stringEq (price, '0')) {
            price = undefined;
        }
        let amount = this.safeString (order, 'q');
        if ((amount !== undefined) && Precise.stringEq (amount, '0')) {
            amount = undefined;
        }
        let lastTradeTimestamp = undefined;
        let trades = undefined;
        if (subType === 'match') {
            lastTradeTimestamp = this.safeInteger (order, 'T');
            trades = [ this.parseWsOrderTrade (order, market) ];
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'i'),
            // the newer stream generation shortens the tag, the older one spells it out
            'clientOrderId': this.safeString2 (order, 'coi', 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': this.safeStringUpper (order, 'tif'),
            'postOnly': isPostOnly,
            'side': this.safeStringLower (order, 'S'),
            'price': price,
            'triggerPrice': this.safeString (order, 'cp'),
            'amount': amount,
            // the filled quantity and the quote amount behind it are cumulative over
            // the order's lifetime and are absent until the order has a fill
            'filled': this.safeString (order, 'fq'),
            'cost': this.safeString (order, 'ftp'),
            'average': this.safeString (order, 'ap'),
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': trades,
            'info': order,
        }, market);
    }

    parseWsOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'placed': 'open',
            'updated': 'open',
            'cancelled': 'canceled',
            'completed': 'closed',
        };
        // a fill event is deliberately absent from the map: it is not a status of its
        // own and is resolved from the remaining quantity instead
        return this.safeString (statuses, status);
    }

    /**
     * @method
     * @name paribu#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.paribu.com/api/streams-v2/private-streams
     * @param {string} [symbol] unified market symbol of the market the trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'myTrades:' + symbol;
        }
        const url = this.urls['api']['ws']['private'];
        this.authenticate (url);
        // the fill itself arrives on the order channel, which carries no commission.
        // the wallet channel carries the commission and correlates to the fill by a
        // shared transaction id, so both are needed to report a fee
        const trades = await this.subscribe (url, [ 'orders', 'ledger' ], [ messageHash ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client: Client, order: Dict) {
        //
        // the fill fields of an "e": "order", "r": { "t": "match" } frame
        //
        //     {
        //         "t": "match",
        //         "i": "01a03d32-eeaa-7cc9-b289-1668cd05d477",
        //         "s": "btc_tl",
        //         "S": "BUY",
        //         "mp": "3700000",
        //         "mq": "0.004",
        //         "mi": "27255ffa5af9bd4c066c81c6f83390d5",
        //         "mr": "TAKER",
        //         "T": 1789662457400
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'myTradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const myTrades = this.myTrades;
        const parsed = this.parseWsOrderTrade (order);
        const matchId = this.safeString (order, 'mi');
        // a fill is parked only when its commission has not landed yet and only when
        // the wallet channel is subscribed at all: watchOrders reaches this handler
        // too, and on that subscription no commission is ever coming
        if ((matchId !== undefined) && !(matchId in this.options['commissions']) && ('ledger' in client.subscriptions)) {
            this.rememberCorrelation ('fills', matchId, order);
        }
        myTrades.append (parsed);
        const symbol = parsed['symbol'];
        client.resolve (myTrades, 'myTrades');
        if (symbol !== undefined) {
            client.resolve (myTrades, 'myTrades:' + symbol);
        }
    }

    override parseWsOrderTrade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'T');
        const matchId = this.safeString (trade, 'mi');
        let fee = undefined;
        // the order channel never carries a commission. it is published on the wallet
        // channel instead, under the same transaction id, and is attached here from
        // whichever of the two frames arrived first
        let charge = this.safeDict (trade, 'commission');
        if (charge === undefined) {
            const charges = this.safeDict (this.options, 'commissions', {});
            charge = this.safeDict (charges, matchId);
        }
        if (charge !== undefined) {
            fee = {
                'cost': this.safeString (charge, 'amt'),
                'currency': this.safeCurrencyCode (this.safeString (charge, 'c')),
                'rate': this.safeNumber (charge, 'rate'),
            };
        }
        return this.safeTrade ({
            // the match id is the only identifier a fill carries, and it is the same
            // value on the public channel and on the wallet channel's commission entry
            'id': matchId,
            'order': this.safeString (trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': this.safeStringLower (trade, 'S'),
            'takerOrMaker': this.safeStringLower (trade, 'mr'),
            'price': this.safeString (trade, 'mp'),
            'amount': this.safeString (trade, 'mq'),
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name paribu#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.paribu.com/api/streams-v2/private-streams
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async watchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const url = this.urls['api']['ws']['private'];
        this.authenticate (url);
        const client = this.client (url);
        // the flag is the seed's own, not the channel's: watchMyTrades subscribes to
        // the wallet channel too, and keying off that subscription would skip the
        // snapshot and leave every asset that has not moved out of the balance
        if (!('balance:seeded' in client.subscriptions)) {
            // the wallet channel publishes one asset per frame and never the whole
            // account, so the opening state is read once over rest and the frames
            // amend it from there. the flag is claimed before the fetch so that a
            // second caller arriving during the await does not seed in parallel, and
            // released again if the fetch throws — the client outlives a rest failure
            // the way it does not outlive a socket one, and a flag left behind would
            // make every later call skip the snapshot for good
            client.subscriptions['balance:seeded'] = true;
            try {
                this.balance = await this.fetchBalance ();
            } catch (e) {
                delete client.subscriptions['balance:seeded'];
                throw e;
            }
        }
        return await this.subscribe (url, [ 'ledger' ], [ 'balance' ], params);
    }

    handleLedger (client: Client, message: any) {
        //
        //     {
        //         "e": "ledger",
        //         "E": 1789662457464,
        //         "r": {
        //             "t": "order-placed",
        //             "tx": "01a03d32-eeaa-7cc9-b289-1668cd05d477",
        //             "c": "tl",
        //             "bal": { "av": "1190", "lk": "0", "bl": "150", "ca": "0", "cl": "0", "tb": "1340" },
        //             "tr": { "av": "-150", "lk": "0", "bl": "150", "ca": "0", "cl": "0", "tb": "0" },
        //             "st": { "ok": true }
        //         }
        //     }
        //
        const payload = this.safeDict (message, 'r', {});
        const commission = this.safeString (payload, 'amt');
        if (commission !== undefined) {
            this.handleCommission (client, payload);
            return;
        }
        const wallet = this.safeDict (payload, 'bal');
        if (wallet === undefined) {
            return;
        }
        const currencyId = this.safeString (payload, 'c');
        const code = this.safeCurrencyCode (currencyId);
        if (code === undefined) {
            return;
        }
        const timestamp = this.safeInteger (message, 'E');
        this.balance['info'] = payload;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        const account = this.account ();
        // the withheld part of a balance is spread over several fields of which the
        // locked amount is only one, while the published total covers every one of
        // them, so the used part is derived rather than read from any single field
        account['free'] = this.safeString (wallet, 'av');
        account['total'] = this.safeString (wallet, 'tb');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    handleCommission (client: Client, payload: Dict) {
        //
        //     {
        //         "t": "execute-trade-taker-commission",
        //         "tx": "27255ffa5af9bd4c066c81c6f83390d5",
        //         "c": "tl",
        //         "amt": "0.18",
        //         "rate": "0.0012"
        //     }
        //
        const matchId = this.safeString (payload, 'tx');
        // the commission is kept even after it has been spent, so that a redelivered
        // fill parses to the same trade instead of overwriting the cached one with a
        // fee-less copy. it is parked only when the order channel is subscribed: on a
        // wallet-only subscription no fill is ever coming
        if ((matchId === undefined) || !('orders' in client.subscriptions)) {
            return;
        }
        this.rememberCorrelation ('commissions', matchId, payload);
        const fill = this.safeDict (this.options['fills'], matchId);
        if ((fill === undefined) || (this.myTrades === undefined)) {
            // the fill has not arrived yet, it will pick the commission up itself
            return;
        }
        delete this.options['fills'][matchId];
        // the fill was served without a fee, so it is rebuilt from the frame it came
        // from — the cache keys a trade by its id and merges the richer structure in
        const myTrades = this.myTrades;
        const parsed = this.parseWsOrderTrade (this.extend (fill, { 'commission': payload }));
        myTrades.append (parsed);
        const symbol = parsed['symbol'];
        client.resolve (myTrades, 'myTrades');
        if (symbol !== undefined) {
            client.resolve (myTrades, 'myTrades:' + symbol);
        }
    }

    handleStatus (client: Client, message: any) {
        //
        //     {"e": "status", "E": 1789662457462, "r": {"t": "subscribed", "id": "1", "channels": ["orderbook:btc_tl"]}}
        //     {"e": "status", "E": 1789662493130, "r": {"t": "error", "id": "1", "code": 2003, "msg": "unknown market: orderbook:agix_tl"}}
        //
        const payload = this.safeDict (message, 'r', {});
        const subType = this.safeString (payload, 't');
        const correlationId = this.safeString (payload, 'id');
        if (correlationId === undefined) {
            return;
        }
        const pendingKey = 'pending:' + correlationId;
        // a dropped event is reported as "backpressure" and a routine restart as
        // "shutdown", neither of which needs an answer here: a missed order book diff
        // is caught by the sequence check in handleOrderBook and a closed connection
        // is reopened by the next watch call.
        // an acknowledgement deliberately does not clear the pending entry either: a
        // request whose channels partly failed is answered with both an ack and an
        // error frame, the server may split the ack over several frames, and clearing
        // on the first one would drop the rejection and leave the caller waiting
        // forever. one small entry per subscribe request that actually went out is
        // the cheaper side of that trade
        if (subType !== 'error') {
            return;
        }
        const pending = this.safeDict (client.subscriptions, pendingKey);
        if (pending === undefined) {
            return;
        }
        delete client.subscriptions[pendingKey];
        // watchMultiple marks a channel subscribed before the request is even sent,
        // so a refused channel would stay marked and the next watch call would send
        // nothing and wait forever. every channel of the failed request is dropped,
        // including any that succeeded: re-subscribing an active channel is
        // documented as idempotent and costs one redundant frame, while leaving a
        // refused one behind costs the caller the whole subscription
        const channels = this.safeList (pending, 'channels', []);
        for (let i = 0; i < channels.length; i++) {
            delete client.subscriptions[channels[i]];
        }
        const messageHashes = this.safeList (pending, 'messageHashes', []);
        const error = this.wsError (message, this.safeString (payload, 'code'));
        for (let i = 0; i < messageHashes.length; i++) {
            client.reject (error, messageHashes[i]);
        }
    }

    handleLegacyStatus (client: Client, message: any) {
        //
        // the older stream generation answers a subscription with its own control
        // frame, which carries no event type and echoes no request id
        //
        //     {"channel": "ticker24h", "method": "subscribe", "id": "", "status": "success", "code": 100}
        //     {"error": "subscription error", "status": "error", "code": 201}
        //
        const state = this.safeString (message, 'status');
        if (state !== 'error') {
            return;
        }
        // with nothing to correlate on, every future waiting on this connection is
        // failed — it carries the 24 hour ticker and nothing else
        client.reject (this.wsError (message, this.safeString (message, 'code')));
    }

    wsError (message: any, code: Str) {
        const feedback = this.id + ' ' + this.json (message);
        let error = undefined;
        try {
            this.throwExactlyMatchedException (this.exceptions['ws']['exact'], code, feedback);
            throw new ExchangeError (feedback);
        } catch (e) {
            error = e;
        }
        return error;
    }

    override handleMessage (client: Client, message: any) {
        const event = this.safeString (message, 'e');
        if (event === undefined) {
            this.handleLegacyStatus (client, message);
            return;
        }
        if (event === 'status') {
            this.handleStatus (client, message);
            return;
        }
        if (event === 'ticker24h') {
            this.handleTicker (client, message);
            return;
        }
        if (event === 'ledger') {
            this.handleLedger (client, message);
            return;
        }
        const payload = this.safeDict (message, 'r', {});
        const subType = this.safeString (payload, 't');
        if (event === 'orderbook') {
            if (subType === 'book-ticker') {
                this.handleBidAsk (client, message);
            } else {
                this.handleOrderBook (client, message);
            }
            return;
        }
        if (event === 'order') {
            // the public match channel and the private order channel share the coarse
            // event type, and only a public frame names the market at the envelope
            // level — a private one places it inside the payload instead
            const marketId = this.safeString (message, 's');
            if (marketId !== undefined) {
                this.handleTrade (client, message);
            } else {
                this.handleOrder (client, message);
            }
        }
    }
}
