
//  ---------------------------------------------------------------------------

import paradexRest from '../paradex.js';
import Precise from '../base/Precise.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, int, Str, Trade, Order, Dict, NullableDict, OrderBook, Ticker, Strings, Tickers, Bool, Market, FundingRate, FundingRates, Position, Balances, Liquidation } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

//  ---------------------------------------------------------------------------

export default class paradex extends paradexRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBidsAsks': true,
                'watchFundingRate': true,
                'watchFundingRates': true,
                'watchLiquidations': true,
                'watchMarkPrice': true,
                'watchMarkPrices': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchBalance': true,
                'watchOHLCV': false,
            },
            'urls': {
                'logo': 'https://x.com/tradeparadex/photo',
                'api': {
                    'ws': 'wss://ws.api.prod.paradex.trade/v1',
                },
                'test': {
                    'ws': 'wss://ws.api.testnet.paradex.trade/v1',
                },
                'www': 'https://www.paradex.trade/',
                'doc': 'https://docs.api.testnet.paradex.trade/',
                'fees': 'https://docs.paradex.trade/getting-started/trading-fees',
                'referral': '',
            },
            'options': {
                // SBE (Simple Binary Encoding) frames on the data channels, see parseSbeMessage. the
                // servers answer a connect without it with a 400, false keeps the JSON feed for any
                // environment that still serves it
                'sbe': true,
                // the schema version asked for at connect. the decoder reads 1:0 to 1:3 (it takes the
                // block length from each frame header), a server answers a version above its cap with a 400
                'sbeSchemaVersion': '3',
                // SBE frames must reach handleMessage as raw bytes, the JSON feed only sends text frames
                'decompressBinary': false,
                'watchOrderBook': {
                    // true subscribes to the full-depth deltas feed, a limit above 15 does too, otherwise
                    // the book is the 15-level snapshot sent every 100ms
                    'deltas': false,
                },
                'ws': {
                    // paces the requests sent on a connection: a subscribe per market adds up when
                    // many symbols are watched at once
                    'cost': 2,
                },
            },
            'streaming': {},
        });
    }

    getWsUrl (): string {
        const url = this.urls['api']['ws'];
        if (!this.safeBool (this.options, 'sbe', true)) {
            return url;
        }
        const schemaVersion = this.safeString (this.options, 'sbeSchemaVersion', '3');
        return url + '?sbeSchemaId=1&sbeSchemaVersion=' + schemaVersion;
    }

    getOrderBookChannel (marketId: Str, deltas: boolean = false): string {
        if (deltas) {
            return 'order_book.' + marketId + '.deltas';
        }
        return 'order_book.' + marketId + '.snapshot@15@100ms';
    }

    requestId (): number {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    /**
     * @ignore
     * @method
     * @name paradex#subscribeRequest
     * @description builds a json-rpc subscribe request, its id is kept in the subscription passed to watch, so an error reply reaches only the watchers of that request
     * @param {string} channel the channel to subscribe to
     * @returns {object} the subscribe request
     */
    subscribeRequest (channel: string): Dict {
        return {
            'jsonrpc': '2.0',
            'id': this.requestId (),
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
    }

    /**
     * @ignore
     * @method
     * @name paradex#unsubscribeRequest
     * @description builds a json-rpc unsubscribe request
     * @param {string} channel the channel to unsubscribe from
     * @returns {object} the unsubscribe request
     */
    unsubscribeRequest (channel: string): Dict {
        return {
            'jsonrpc': '2.0',
            'id': this.requestId (),
            'method': 'unsubscribe',
            'params': {
                'channel': channel,
            },
        };
    }

    /**
     * @ignore
     * @method
     * @name paradex#sendRequest
     * @description sends a json-rpc request and waits for its reply, the reply or an error with its id settles it
     * @param {string} url the websocket url
     * @param {object} request the json-rpc request
     * @param {string} [subscribeHash] the subscription the request opens, the request id when undefined
     * @returns {object} the reply
     */
    async sendRequest (url: string, request: Dict, subscribeHash: Str = undefined): Promise<any> {
        const requestHash = 'request:' + this.safeString (request, 'id');
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': [ requestHash ],
        };
        const hash = (subscribeHash === undefined) ? requestHash : subscribeHash;
        return await this.watch (url, requestHash, request, hash, subscription);
    }

    /**
     * @ignore
     * @method
     * @name paradex#subscribeChannels
     * @description subscribes to the channels not subscribed yet on the connection, one request per channel as the server takes one channel per request, and waits for an update on any of the message hashes
     * @param {string} url the websocket url
     * @param {string[]} messageHashes the message hashes to wait on
     * @param {string[]} channels the channels to subscribe to
     * @param {object} [params] extra parameters merged into each subscribe request
     * @returns {object} the first update
     */
    async subscribeChannels (url: string, messageHashes: string[], channels: string[], params: Dict = {}): Promise<any> {
        // messageHashes[i] is the hash the updates of channels[i] resolve. The channels still to subscribe are
        // looked up again after each await: another watch may have subscribed one meanwhile, and a reconnect
        // starts a client without any. Each but the last is sent once the previous one is acknowledged
        const channelsLength = channels.length;
        for (let attempt = 0; attempt < channelsLength; attempt++) {
            const pending = this.unsubscribedChannels (url, channels);
            const pendingLength = pending.length;
            if (pendingLength < 2) {
                break;
            }
            const channel = channels[pending[0]];
            const pendingRequest = this.subscribeRequest (channel);
            await this.sendRequest (url, this.deepExtend (pendingRequest, params), channel);
        }
        // the last one goes with the watch, so that an update sent right after it is not missed
        const missing = this.unsubscribedChannels (url, channels);
        const missingLength = missing.length;
        if (missingLength === 0) {
            return await this.watchMultiple (url, messageHashes, undefined, channels);
        }
        const index = missing[0];
        const request = this.subscribeRequest (channels[index]);
        // a failed subscribe rejects the watchers of its own channel only
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': [ messageHashes[index] ],
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), [ channels[index] ], subscription);
    }

    unsubscribedChannels (url: string, channels: string[]): number[] {
        const client = this.client (url);
        const result: number[] = [];
        for (let i = 0; i < channels.length; i++) {
            if (!(channels[i] in client.subscriptions)) {
                result.push (i);
            }
        }
        return result;
    }

    async authenticate (params: Dict = {}) {
        const url = this.getWsUrl ();
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.reusableFuture ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const token = await this.authenticateRest ();
            const requestId = this.requestId ();
            const request: Dict = {
                'jsonrpc': '2.0',
                'id': requestId,
                'method': 'auth',
                'params': {
                    'bearer': token,
                },
            };
            const subscription: Dict = {
                'id': requestId,
            };
            this.watch (url, messageHash, this.deepExtend (request, params), messageHash, subscription);
        }
        return await future;
    }

    handleAuthenticationMessage (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": { "node_id": "73cf456f7cb78d59" }
        //     }
        //
        // the future stays resolved, so later private watches on this connection skip the auth request
        const future = this.safeValue (client.futures, 'authenticated');
        if (future !== undefined) {
            future.resolve (true);
        }
    }

    handleRequestReply (client: Client, message: Dict) {
        //
        // auth
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": { "node_id": "73cf456f7cb78d59" }
        //     }
        //
        // subscribe
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 2,
        //         "result": { "channel": "orders.ALL" }
        //     }
        //
        // only the reply to the auth request resolves the auth, a subscribe ack carries a channel instead of a node id
        const requestId = this.safeString (message, 'id');
        const authSubscription = this.safeDict (client.subscriptions, 'authenticated');
        const authRequestId = this.safeString (authSubscription, 'id');
        const result = this.safeDict (message, 'result');
        const isAuth = ((requestId !== undefined) && (requestId === authRequestId)) || (this.safeString (result, 'node_id') !== undefined);
        if (isAuth) {
            this.handleAuthenticationMessage (client, message);
        }
        if (requestId !== undefined) {
            // sendRequest waits on the request id, a request without a subscription of its own is kept under it
            const requestHash = 'request:' + requestId;
            if (requestHash in client.subscriptions) {
                delete client.subscriptions[requestHash];
            }
            client.resolve (message, requestHash);
        }
    }

    /**
     * @method
     * @name paradex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let messageHash = 'trades.';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            messageHash += market['id'];
        } else {
            messageHash += 'ALL';
        }
        const url = this.getWsUrl ();
        const request: Dict = this.subscribeRequest (messageHash);
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': [ messageHash ],
        };
        const trades: ArrayCache = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    /**
     * @method
     * @name paradex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: string[] = this.marketSymbols (symbols, undefined, false);
        const symbolsLength = symbolsNormalized.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        const channels: string[] = [];
        for (let i = 0; i < symbolsLength; i++) {
            const market = this.market (symbolsNormalized[i]);
            channels.push ('trades.' + market['id']);
        }
        const url = this.getWsUrl ();
        // handleTrade resolves the channel of each market
        const trades = await this.subscribeChannels (url, channels, channels, params);
        const first = this.safeDict (trades, 0);
        const tradeSymbol = this.safeString (first, 'symbol');
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    /**
     * @method
     * @name paradex#watchLiquidations
     * @description watch the public liquidations of a trading pair, from the liquidation trades of the trades channel
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
     */
    override async watchLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Liquidation[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const channel = 'trades.' + market['id'];
        const messageHash = 'liquidations:' + market['symbol'];
        const url = this.getWsUrl ();
        const liquidations = await this.subscribeChannels (url, [ messageHash ], [ channel ], params);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = liquidations.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (liquidations, since, limitResolved, 'timestamp', true);
    }

    parseWsLiquidation (liquidation: Dict, market: Market = undefined): Liquidation {
        //
        //     {
        //         "id": "1718179273230201709233240002",
        //         "market": "XRP-USD-PERP",
        //         "side": "SELL",
        //         "size": "120",
        //         "price": "1.2854",
        //         "created_at": 1718179273230,
        //         "trade_type": "LIQUIDATION"
        //     }
        //
        const marketId = this.safeString (liquidation, 'market');
        const marketResolved = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (liquidation, 'created_at');
        const contracts = this.safeString (liquidation, 'size');
        const price = this.safeString (liquidation, 'price');
        return this.safeLiquidation ({
            'info': liquidation,
            'symbol': marketResolved['symbol'],
            'contracts': this.parseNumber (contracts),
            'contractSize': undefined,
            'price': this.parseNumber (price),
            // the side of the taker, the liquidated order
            'side': this.safeStringLower (liquidation, 'side'),
            'baseValue': this.parseNumber (contracts),
            'quoteValue': this.parseNumber (Precise.stringMul (contracts, price)),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        }, marketResolved);
    }

    handleTrade (client: Client, message: Dict): Dict {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.ALL",
        //             "data": {
        //                 "id": "1718179273230201709233240002",
        //                 "market": "kBONK-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "34028",
        //                 "price": "0.028776",
        //                 "created_at": 1718179273230,
        //                 "trade_type": "FILL"
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const parsedTrade = this.parseTrade (data);
        const symbol = parsedTrade['symbol'];
        const messageHash = this.safeString (params, 'channel');
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            stored = new ArrayCache (this.safeInteger (this.options, 'tradesLimit', 1000));
            this.trades[(symbol as string)] = stored;
        }
        stored.append (parsedTrade);
        client.resolve (stored, messageHash);
        if (this.safeString (data, 'trade_type') === 'LIQUIDATION') {
            // one cache per market, kept in the options next to the request id counter: this.liquidations
            // is typed as a single cache in some languages and initialized as a map in others
            const liquidation = this.parseWsLiquidation (data);
            const caches = this.safeDict (this.options, 'liquidationsBySymbol', {});
            let liquidations = this.safeValue (caches, symbol);
            if (liquidations === undefined) {
                liquidations = new ArrayCache (this.safeInteger (this.options, 'liquidationsLimit', 1000));
                caches[(symbol as string)] = liquidations;
                this.options['liquidationsBySymbol'] = caches;
            }
            liquidations.append (liquidation);
            client.resolve (liquidations, 'liquidations:' + symbol);
        }
        // an SBE frame names its market but not the subscription it was sent for,
        // so the trades.ALL subscription is resolved from the per-market channel too
        const isSbe = this.safeBool (message, 'sbe', false);
        if (isSbe && (messageHash !== 'trades.ALL')) {
            client.resolve (stored, 'trades.ALL');
        }
        return message;
    }

    /**
     * @method
     * @name paradex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] above 15 the full-depth deltas feed is used and the whole book is returned, otherwise the 15-level snapshots
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.deltas] true for the full-depth deltas feed, default false (the 15-level snapshots)
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name paradex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] above 15 the full-depth deltas feed is used and the whole book is returned, otherwise the 15-level snapshots
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.deltas] true for the full-depth deltas feed, default false (the 15-level snapshots)
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: string[] = this.marketSymbols (symbols, undefined, false);
        const symbolsLength = symbolsNormalized.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        const [ deltasOption, paramsDeltas ] = this.handleOptionAndParams (params, 'watchOrderBook', 'deltas', false);
        const deltas = (deltasOption === true) || ((limit !== undefined) && (limit > 15));
        const url = this.getWsUrl ();
        const client = this.client (url);
        const channels: string[] = [];
        const messageHashes: string[] = [];
        for (let i = 0; i < symbolsLength; i++) {
            const market = this.market (symbolsNormalized[i]);
            const deltasChannel = this.getOrderBookChannel (market['id'], true);
            const snapshotChannel = this.getOrderBookChannel (market['id'], false);
            // one feed per market on a connection: both send BookEvent frames, which do not name their channel,
            // and the 15-level snapshots would cut a full-depth book down. The deltas feed is a superset, it stays
            // the market stays on the deltas feed from the first call that asks for it, a call made while the
            // snapshot feed is being unsubscribed included
            const deltasHash = deltasChannel + ':requested';
            const isDeltas = deltas || (deltasHash in client.subscriptions);
            if (isDeltas) {
                client.subscriptions[deltasHash] = true;
            }
            if (isDeltas && (snapshotChannel in client.subscriptions)) {
                // the snapshot feed is unsubscribed before the deltas one is subscribed, no snapshot of it
                // arrives once the reply is in
                const unsubscribe = this.unsubscribeRequest (snapshotChannel);
                delete client.subscriptions[snapshotChannel];
                await this.sendRequest (url, unsubscribe);
            }
            const channel = (isDeltas) ? deltasChannel : snapshotChannel;
            channels.push (channel);
            messageHashes.push ('orderbook:' + market['symbol']);
        }
        const orderbook: WsOrderBook = await this.subscribeChannels (url, messageHashes, channels, paramsDeltas);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict) {
        //
        // a snapshot, the 15-level feed sends one every 100ms, the deltas feed sends a full-depth one on
        // subscribe and on a resync
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "order_book.BTC-USD-PERP.snapshot@15@50ms",
        //             "data": {
        //                 "seq_no": 14127815,
        //                 "market": "BTC-USD-PERP",
        //                 "last_updated_at": 1718267837265,
        //                 "update_type": "s",
        //                 "inserts": [
        //                     {
        //                         "side": "BUY",
        //                         "price": "67629.7",
        //                         "size": "0.992"
        //                     },
        //                     {
        //                         "side": "SELL",
        //                         "price": "69378.6",
        //                         "size": "3.137"
        //                     }
        //                 ],
        //                 "updates": [],
        //                 "deletes": []
        //             }
        //         }
        //     }
        //
        // a delta, the levels added or changed, and the levels removed
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "order_book.XRP-USD-PERP.deltas",
        //             "data": {
        //                 "seq_no": 1669897428,
        //                 "market": "XRP-USD-PERP",
        //                 "last_updated_at": 1792183966700,
        //                 "update_type": "d",
        //                 "inserts": [],
        //                 "updates": [ { "side": "SELL", "price": "1.3908", "size": "6600" } ],
        //                 "deletes": [ { "side": "SELL", "price": "1.4737", "size": "0" } ]
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (data, 'last_updated_at');
        const nonce = this.safeInteger (data, 'seq_no');
        const messageHash = 'orderbook:' + symbol;
        // levels go into local arrays first: pushing into orderbookData['bids'] appends to a copy in go
        const bids = [];
        const asks = [];
        // a level of the deletes is removed whatever size it carries, an SBE delta removes one by a size of 0
        const levelKeys = [ 'inserts', 'updates', 'deletes' ];
        for (let k = 0; k < levelKeys.length; k++) {
            const isDelete = (levelKeys[k] === 'deletes');
            const levels = this.safeList (data, levelKeys[k], []);
            for (let i = 0; i < levels.length; i++) {
                const level = this.safeDict (levels, i);
                const price = this.safeString (level, 'price');
                const size = (isDelete) ? '0' : this.safeString (level, 'size');
                if (this.safeString (level, 'side') === 'BUY') {
                    bids.push ([ price, size ]);
                } else {
                    asks.push ([ price, size ]);
                }
            }
        }
        if (this.safeString (data, 'update_type') === 'd') {
            const deltasChannel = this.getOrderBookChannel (marketId, true);
            const stored = this.safeValue (this.orderbooks, symbol);
            // a delta applies only to the book of the deltas feed
            if ((stored === undefined) || !(deltasChannel in client.subscriptions)) {
                return;
            }
            const storedNonce = stored['nonce'];
            // no book to apply it to: before the first snapshot, and between a resync and its snapshot
            if ((storedNonce === undefined) || (nonce === undefined) || (nonce <= storedNonce)) {
                return;
            }
            if (nonce !== this.sum (storedNonce, 1)) {
                // a skipped delta leaves the book wrong, the feed is subscribed again for a fresh snapshot
                stored['nonce'] = undefined;
                this.spawn (this.resubscribeOrderBook, client, deltasChannel, messageHash);
                return;
            }
            const storedBids = stored['bids'];
            const storedAsks = stored['asks'];
            this.handleBookSideDeltas (storedBids, bids);
            this.handleBookSideDeltas (storedAsks, asks);
            stored['nonce'] = nonce;
            stored['timestamp'] = timestamp;
            stored['datetime'] = this.iso8601 (timestamp);
            client.resolve (stored, messageHash);
            return;
        }
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbookData: Dict = {
            'bids': bids,
            'asks': asks,
        };
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (orderbookData, symbol, timestamp, 'bids', 'asks');
        snapshot['nonce'] = nonce;
        orderbook.reset (snapshot);
        // a channel override in params still resolves, frames are routed by market and package type
        client.resolve (orderbook, messageHash);
    }

    handleBookSideDeltas (bookside: any, deltas: any[]) {
        // a size of 0 removes the price level
        for (let i = 0; i < deltas.length; i++) {
            const bidAsk = this.parseOrderBookBidAsk (deltas[i], 0, 1);
            bookside.storeArray (bidAsk);
        }
    }

    /**
     * @ignore
     * @method
     * @name paradex#resubscribeOrderBook
     * @description subscribes to an order book deltas feed again, the server sends a fresh full-depth snapshot on subscribe
     * @param {object} client the websocket client
     * @param {string} channel the deltas channel
     * @param {string} messageHash the message hash the book watchers wait on
     * @returns {boolean} true once both requests are sent
     */
    async resubscribeOrderBook (client: Client, channel: string, messageHash: string): Promise<boolean> {
        // a subscribe alone is acknowledged without a snapshot, the feed is unsubscribed first. Both requests
        // keep their ids in the subscriptions, so that an error reply reaches neither an unrelated watcher nor
        // the whole connection
        const unsubscribe = this.unsubscribeRequest (channel);
        const subscribe = this.subscribeRequest (channel);
        const unsubscribeHash = 'request:' + this.safeString (unsubscribe, 'id');
        client.subscriptions[unsubscribeHash] = {
            'id': unsubscribe['id'],
            'messageHashes': [],
        };
        client.subscriptions[channel] = {
            'id': subscribe['id'],
            'messageHashes': [ messageHash ],
        };
        await client.send (unsubscribe);
        await client.send (subscribe);
        return true;
    }

    /**
     * @method
     * @name paradex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const messageHash = 'markets_summary.' + market['symbol'];
        return await this.subscribeMarketsSummary ([ market['symbol'] ], [ messageHash ], params);
    }

    /**
     * @method
     * @name paradex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets to fetch the tickers for, all markets when undefined, which is thousands of updates a second
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const symbolsLength = (symbolsNormalized === undefined) ? 0 : symbolsNormalized.length;
        const channel = 'markets_summary';
        const messageHashes: string[] = [];
        let newTicker: any = undefined;
        if (symbolsLength > 0) {
            for (let i = 0; i < symbolsLength; i++) {
                messageHashes.push (channel + '.' + (symbolsNormalized as string[])[i]);
            }
            newTicker = await this.subscribeMarketsSummary (symbolsNormalized as string[], messageHashes, params);
        } else {
            // every listed market, options included
            const url = this.getWsUrl ();
            const client = this.client (url);
            const scopedHash = channel + ':scoped';
            if (scopedHash in client.subscriptions) {
                // a scoped subscription keeps its filter through a plain subscribe, it is unsubscribed first
                const subscribeHashes = Object.keys (client.subscriptions);
                for (let i = 0; i < subscribeHashes.length; i++) {
                    if ((subscribeHashes[i] === scopedHash) || (subscribeHashes[i].indexOf (channel + '.') === 0)) {
                        delete client.subscriptions[subscribeHashes[i]];
                    }
                }
                const unsubscribe = this.unsubscribeRequest (channel);
                await this.sendRequest (url, unsubscribe);
            }
            const request: Dict = this.subscribeRequest (channel);
            const subscription: Dict = {
                'id': request['id'],
                'messageHashes': [ channel ],
            };
            newTicker = await this.watch (url, channel, this.deepExtend (request, params), channel, subscription);
        }
        if (this.newUpdates) {
            const result: Dict = {};
            const newTickerSymbol = this.safeString (newTicker, 'symbol');
            if (newTickerSymbol !== undefined) {
                result[newTickerSymbol] = newTicker;
            }
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbolsNormalized);
    }

    /**
     * @ignore
     * @method
     * @name paradex#subscribeMarketsSummary
     * @description watches the market summaries of a list of markets over one scoped subscription, the markets not in it yet are added in place
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} symbols unified symbols of the markets
     * @param {string[]} messageHashes the message hashes to wait on
     * @param {object} [params] extra parameters merged into the request
     * @returns {object} the first [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure} updated
     */
    async subscribeMarketsSummary (symbols: string[], messageHashes: string[], params: Dict = {}): Promise<any> {
        const url = this.getWsUrl ();
        const client = this.client (url);
        const channel = 'markets_summary';
        if (channel in client.subscriptions) {
            // the all-markets subscription carries these markets already
            return await this.watchMultiple (url, messageHashes, undefined, [ channel ]);
        }
        // one subscription with a market filter: a subscription per market is a request per market, and
        // the all-markets one is thousands of frames a second, mostly options, decoded to be dropped
        const scopedHash = channel + ':scoped';
        const subscribeHashes: string[] = [];
        const missing: string[] = [];
        const missingHashes: string[] = [];
        // messageHashes[i] is the hash the summaries of symbols[i] resolve
        for (let i = 0; i < symbols.length; i++) {
            const marketId = this.market (symbols[i])['id'] as string;
            const subscribeHash = channel + '.' + marketId;
            subscribeHashes.push (subscribeHash);
            if (!(subscribeHash in client.subscriptions)) {
                missing.push (marketId);
                missingHashes.push (messageHashes[i]);
            }
        }
        const missingLength = missing.length;
        if (missingLength === 0) {
            return await this.watchMultiple (url, messageHashes, undefined, subscribeHashes);
        }
        let request: any = undefined;
        if (scopedHash in client.subscriptions) {
            request = {
                'jsonrpc': '2.0',
                'id': this.requestId (),
                'method': 'modify_subscription',
                'params': {
                    'channel': channel,
                    'add': missing,
                },
            };
        } else {
            request = this.subscribeRequest (channel);
            request['params']['markets'] = missing;
            subscribeHashes.push (scopedHash);
        }
        // a failed request is forgotten with every market it carried, the next watch sends them again, and
        // it rejects the watchers of those markets only
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': missingHashes,
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), subscribeHashes, subscription);
    }

    /**
     * @method
     * @name paradex#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchMarkPrice (symbol: string, params: Dict = {}): Promise<Ticker> {
        return await this.watchTicker (symbol, params);
    }

    /**
     * @method
     * @name paradex#watchMarkPrices
     * @description watches the mark prices for all markets of a list
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets to fetch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchMarkPrices (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        return await this.watchTickers (symbols, params);
    }

    /**
     * @method
     * @name paradex#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.paradex.trade/ws/web-socket-channels/bbo-market-symbol/bbo-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets to fetch the best bid and ask for, all markets when undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const symbolsLength = (symbolsNormalized === undefined) ? 0 : symbolsNormalized.length;
        const url = this.getWsUrl ();
        const channels: string[] = [];
        const messageHashes: string[] = [];
        if (symbolsLength > 0) {
            for (let i = 0; i < symbolsLength; i++) {
                const market = this.market ((symbolsNormalized as string[])[i]);
                channels.push ('bbo.' + market['id']);
                messageHashes.push ('bidask:' + market['symbol']);
            }
        } else {
            channels.push ('bbo.ALL');
            messageHashes.push ('bidask');
        }
        const newBidAsk = await this.subscribeChannels (url, messageHashes, channels, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newBidAsk['symbol']] = newBidAsk;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbolsNormalized);
    }

    handleBidAsk (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "bbo.XRP-USD-PERP",
        //             "data": {
        //                 "market": "XRP-USD-PERP",
        //                 "seq_no": 1669897465,
        //                 "bid": "1.2782",
        //                 "bid_size": "267.7",
        //                 "ask": "1.318",
        //                 "ask_size": "259.6",
        //                 "last_updated_at": 1792183969812
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const bidAsk = this.parseWsBidAsk (data);
        const symbol = bidAsk['symbol'];
        this.bidsasks[(symbol as string)] = bidAsk;
        client.resolve (bidAsk, 'bidask:' + symbol);
        // an SBE frame does not tell bbo.ALL from the per-market channel
        client.resolve (bidAsk, 'bidask');
    }

    parseWsBidAsk (data: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (data, 'market');
        const marketResolved = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (data, 'last_updated_at');
        return this.safeTicker ({
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString (data, 'ask'),
            'askVolume': this.safeString (data, 'ask_size'),
            'bid': this.safeString (data, 'bid'),
            'bidVolume': this.safeString (data, 'bid_size'),
            'info': data,
        }, marketResolved);
    }

    /**
     * @method
     * @name paradex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.paradex.trade/ws/web-socket-channels/orders-market-symbol/orders-market-symbol
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticate ();
        let messageHash = 'orders';
        let channel = 'orders.';
        const symbolResolved: Str = (symbol !== undefined) ? this.symbol (symbol) : symbol;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            channel += market['id'];
            messageHash += ':' + symbolResolved;
        } else {
            channel += 'ALL';
        }
        const url = this.getWsUrl ();
        const request: Dict = this.subscribeRequest (channel);
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': [ messageHash ],
        };
        const orders: ArrayCache = await this.watch (url, messageHash, this.deepExtend (request, params), channel, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbolResolved, since, limitResolved, true);
    }

    handleOrder (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "orders.ALL",
        //             "data": {
        //                 "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512x",
        //                 "avg_fill_price": "26000",
        //                 "client_id": "x1234",
        //                 "cancel_reason": "",
        //                 "created_at": 1681493746016,
        //                 "flags": ["REDUCE_ONLY"],
        //                 "id": "123456",
        //                 "instruction": "GTC",
        //                 "last_updated_at": 1681493746016,
        //                 "market": "BTC-USD-PERP",
        //                 "price": "26000",
        //                 "remaining_size": "0",
        //                 "side": "BUY",
        //                 "size": "0.05",
        //                 "status": "NEW",
        //                 "type": "LIMIT"
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const parsed = this.parseOrder (data);
        const symbol = this.safeString (parsed, 'symbol');
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        this.orders.append (parsed);
        const messageHash = 'orders';
        client.resolve (this.orders, messageHash);
        if (symbol !== undefined) {
            const symbolMessageHash = messageHash + ':' + symbol;
            client.resolve (this.orders, symbolMessageHash);
        }
    }

    /**
     * @method
     * @name paradex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.paradex.trade/ws/web-socket-channels/fills-market-symbol/fills-market-symbol
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticate ();
        let messageHash = 'myTrades';
        let channel = 'fills.';
        const symbolResolved: Str = (symbol !== undefined) ? this.symbol (symbol) : symbol;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            channel += market['id'];
            messageHash += ':' + symbolResolved;
        } else {
            channel += 'ALL';
        }
        const url = this.getWsUrl ();
        const request: Dict = this.subscribeRequest (channel);
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': [ messageHash ],
        };
        const trades: ArrayCache = await this.watch (url, messageHash, this.deepExtend (request, params), channel, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbolResolved, since, limitResolved, true);
    }

    handleMyTrade (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "fills.ALL",
        //             "data": {
        //                 "id": "1718947571560201703986670001",
        //                 "side": "BUY",
        //                 "liquidity": "TAKER",
        //                 "market": "BTC-USD-PERP",
        //                 "order_id": "1718947571540201703992340000",
        //                 "price": "64852.9",
        //                 "size": "0.01",
        //                 "fee": "0.1945587",
        //                 "fee_currency": "USDC",
        //                 "created_at": 1718947571569,
        //                 "remaining_size": "0",
        //                 "client_id": "",
        //                 "fill_type": "FILL"
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const trade = this.parseTrade (data);
        const symbol = this.safeString (trade, 'symbol');
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        trades.append (trade);
        const messageHash = 'myTrades';
        client.resolve (trades, messageHash);
        if (symbol !== undefined) {
            client.resolve (trades, messageHash + ':' + symbol);
        }
    }

    /**
     * @method
     * @name paradex#watchPositions
     * @description watch all open positions
     * @see https://docs.paradex.trade/ws/web-socket-channels/positions/positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticate ();
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        // one channel carries every market
        const channel = 'positions';
        const url = this.getWsUrl ();
        const messageHashes: string[] = [];
        let symbolsLength = 0;
        if (symbolsNormalized !== undefined) {
            symbolsLength = symbolsNormalized.length;
        }
        if (symbolsLength === 0) {
            messageHashes.push (channel);
        } else {
            for (let i = 0; i < symbolsLength; i++) {
                messageHashes.push (channel + ':' + (symbolsNormalized as string[])[i]);
            }
        }
        const request: Dict = this.subscribeRequest (channel);
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': messageHashes,
        };
        const newPositions = await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), [ channel ], subscription);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbolsNormalized, since, limit, true);
    }

    handlePositions (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "positions",
        //             "data": {
        //                 "id": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3-BTC-USD-PERP",
        //                 "market": "BTC-USD-PERP",
        //                 "status": "OPEN",
        //                 "side": "LONG",
        //                 "size": "0.01",
        //                 "average_entry_price": "64839.96053748",
        //                 "unrealized_pnl": "-2.39677214",
        //                 "leverage": "5",
        //                 "cost_usd": "648.529",
        //                 "created_at": 1718947571560,
        //                 "last_updated_at": 1718950074249,
        //                 "liquidation_price": ""
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache: ArrayCacheBySymbolBySide = this.positions;
        const position = this.parsePosition (data);
        const symbol = position['symbol'];
        const newPositions = [];
        // one position per market, so a fill through zero flips its side: the cache keys by
        // symbol and side, and the opposite side it still holds is flattened here
        const side = this.safeString (position, 'side');
        const cached = this.filterBySymbolSinceLimit (cache, symbol, undefined, undefined, true);
        for (let i = 0; i < cached.length; i++) {
            const previous = cached[i];
            const previousSide = this.safeString (previous, 'side');
            const previousContracts = this.safeString (previous, 'contracts');
            const isOpposite = (side !== undefined) && (previousSide !== undefined) && (previousSide !== side);
            if (isOpposite && (previousContracts !== undefined) && !Precise.stringEq (previousContracts, '0')) {
                const flattened = this.extend (previous, {
                    'contracts': this.parseNumber ('0'),
                    'lastUpdateTimestamp': this.safeInteger (position, 'lastUpdateTimestamp'),
                });
                cache.append (flattened as Position);
                newPositions.push (flattened);
            }
        }
        cache.append (position);
        newPositions.push (position);
        client.resolve (newPositions, 'positions');
        client.resolve (newPositions, 'positions:' + symbol);
    }

    /**
     * @method
     * @name paradex#watchBalance
     * @description watch the margin balance of the account in its settlement asset: total is the account
     * value, free the free collateral and used the initial margin requirement
     * @see https://docs.paradex.trade/ws/web-socket-channels/account/account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticate ();
        const channel = 'account';
        const url = this.getWsUrl ();
        const messageHash = 'balance';
        const request: Dict = this.subscribeRequest (channel);
        const subscription: Dict = {
            'id': request['id'],
            'messageHashes': [ messageHash ],
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), channel, subscription);
    }

    handleBalance (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "account",
        //             "data": {
        //                 "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512b",
        //                 "account_value": "1000.5",
        //                 "free_collateral": "900.5",
        //                 "initial_margin_requirement": "100",
        //                 "maintenance_margin_requirement": "50",
        //                 "margin_cushion": "950.5",
        //                 "seq_no": 20,
        //                 "settlement_asset": "USDC",
        //                 "status": "ACTIVE",
        //                 "total_collateral": "1000",
        //                 "updated_at": 1718950074249
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        // merge the parsed update into the existing balance object instead of
        // replacing it: a consumer awakened by an earlier message holds a
        // reference to this.balance, and Client.resolve is a no-op while
        // nobody is awaiting, so a replaced object would make updates landing
        // in that window invisible to the consumer forever (same class as
        // issue #26773); the free/used/total aggregates are rebuilt from the
        // merged currencies by safeBalance
        const balance = this.parseWsBalance (data);
        if (this.balance === undefined) {
            this.balance = {};
        }
        const reserved = [ 'free', 'used', 'total' ];
        const keys = Object.keys (balance);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.inArray (key, reserved)) {
                continue;
            }
            this.balance[key] = balance[key];
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    parseWsBalance (data: Dict): Balances {
        // the account channel carries margin, not token holdings: the account value (collateral with
        // unrealized pnl) is the total, the free collateral what can still back a new position, and the
        // initial margin the part the open positions hold, free + used = total as the venue computes them
        const timestamp = this.safeInteger (data, 'updated_at');
        const result: Dict = {
            'info': data,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const code = this.safeCurrencyCode (this.safeString (data, 'settlement_asset'));
        const account = this.account ();
        account['total'] = this.safeString (data, 'account_value');
        account['free'] = this.safeString (data, 'free_collateral');
        account['used'] = this.safeString (data, 'initial_margin_requirement');
        if (code !== undefined) {
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    handleTicker (client: Client, message: Dict): Dict {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "markets_summary",
        //             "data": {
        //                 "symbol": "ORDI-USD-PERP",
        //                 "oracle_price": "49.80885481",
        //                 "mark_price": "49.80885481",
        //                 "last_traded_price": "62.038",
        //                 "bid": "49.822",
        //                 "ask": "58.167",
        //                 "volume_24h": "0",
        //                 "total_volume": "54542628.66054200416",
        //                 "created_at": 1718334307698,
        //                 "underlying_price": "47.93",
        //                 "open_interest": "6999.5",
        //                 "funding_rate": "0.03919997509811",
        //                 "price_change_rate_24h": ""
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const channel = this.safeString (params, 'channel');
        const ticker = this.parseTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, channel);
        // watchTicker waits on the symbol whichever channel, per-market or all, carried it
        const messageHash = 'markets_summary.' + symbol;
        client.resolve (ticker, messageHash);
        return message;
    }

    /**
     * @method
     * @name paradex#watchFundingRate
     * @description watch the current funding rate for a symbol
     * @see https://docs.paradex.trade/ws/web-socket-channels/funding-data-market-symbol/funding-data-market-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        // the per-market channel, the all-markets one sends every perpetual's funding
        const channel = 'funding_data.' + market['id'];
        const url = this.getWsUrl ();
        const messageHash = 'funding_data.' + market['symbol'];
        return await this.subscribeChannels (url, [ messageHash ], [ channel ], params);
    }

    /**
     * @method
     * @name paradex#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const channel = 'funding_data';
        const url = this.getWsUrl ();
        const messageHashes: string[] = [];
        if (symbolsNormalized !== undefined) {
            const symbolsLength = symbolsNormalized.length;
            if (symbolsLength > 0) {
                for (let i = 0; i < symbolsNormalized.length; i++) {
                    const messageHash = channel + '.' + symbolsNormalized[i];
                    messageHashes.push (messageHash);
                }
            } else {
                messageHashes.push (channel); // if an empty array is passed, subscribe to all funding rates
            }
        } else {
            messageHashes.push (channel);
        }
        const request: Dict = this.subscribeRequest (channel);
        const subscription: Dict = {
            'id': request['id'],
        };
        const newFundingRates = await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), messageHashes, subscription);
        if (this.newUpdates) {
            const result: Dict = {};
            const newFundingRatesSymbol = this.safeString (newFundingRates, 'symbol');
            if (newFundingRatesSymbol !== undefined) {
                result[newFundingRatesSymbol] = newFundingRates;
            }
            return result;
        }
        return this.filterByArray (this.fundingRates, 'symbol', symbolsNormalized);
    }

    handleFundingRate (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "funding_data",
        //             "data": {
        //                 "market": "TRUMP-USD-PERP",
        //                 "funding_index": "-0.551694014226244835",
        //                 "funding_premium": "-0.000509914923994872836",
        //                 "funding_rate": "-0.00014969570582",
        //                 "funding_rate_8h": "-0.00014969",
        //                 "funding_period_hours": 8,
        //                 "created_at": 1771506636154
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const fundingRate = this.parseFundingRateWs (data);
        const symbol = fundingRate['symbol'];
        this.fundingRates[(symbol as string)] = fundingRate;
        // watchFundingRates without symbols waits on the bare channel, the per-market and all-markets
        // channels carry the same frame
        client.resolve (fundingRate, 'funding_data');
        client.resolve (fundingRate, 'funding_data.' + symbol);
    }

    parseFundingRateWs (contract: Dict, market: Market = undefined): FundingRate {
        //
        //     {
        //         "market": "TRUMP-USD-PERP",
        //         "funding_index": "-0.551694014226244835",
        //         "funding_premium": "-0.000509914923994872836",
        //         "funding_rate": "-0.00014969570582",
        //         "funding_rate_8h": "-0.00014969",
        //         "funding_period_hours": 8,
        //         "created_at": 1771506636154
        //     }
        //
        const marketId = this.safeString (contract, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (contract, 'created_at');
        const fundingPeriod = this.safeString (contract, 'funding_period_hours');
        let interval: Str = undefined;
        if (fundingPeriod !== undefined) {
            interval = fundingPeriod + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    parseSbeMessage (client: Client, message: any): any {
        //
        // Paradex SBE schema 1:3 (https://docs.paradex.trade), little-endian. Every frame is an 8-byte
        // header (blockLength, templateId, schemaId, version as uint16) followed by a fixed block of
        // blockLength bytes, then repeating groups and length-prefixed strings. The frame is rebuilt in
        // the shape of the matching JSON subscription message, so the JSON handlers parse both.
        // Requests, subscribe acks and errors stay JSON text frames.
        //
        // Returns undefined for frames that carry nothing to route: heartbeats, binary acks, template
        // ids this decoder does not know (the schema says to skip them), and malformed frames.
        //
        const frameHex = this.binaryToBase16 (message);
        const frameLength = this.parseToInt (frameHex.length / 2);
        if (frameLength < 8) {
            return undefined;
        }
        const blockLength = this.parseToInt (this.sbeReadUint (frameHex, 0, 2));
        const templateId = this.parseToInt (this.sbeReadUint (frameHex, 2, 2));
        const schemaId = this.parseToInt (this.sbeReadUint (frameHex, 4, 2));
        if ((schemaId !== 1) || (frameLength < this.sum (blockLength, 8))) {
            return undefined;
        }
        let channel: Str = undefined;
        let data: any = undefined;
        if (templateId === 1) {
            data = this.parseSbeTrade (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'trades.' + data['market'];
            }
        } else if (templateId === 2) {
            data = this.parseSbeBbo (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'bbo.' + data['market'];
            }
        } else if (templateId === 3) {
            // the snapshot and deltas feeds send the same frame, handleOrderBook tells them apart by package type
            data = this.parseSbeOrderBook (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'order_book.' + data['market'];
            }
        } else if (templateId === 4) {
            data = this.parseSbeMarketSummary (client, frameHex, blockLength, frameLength);
            channel = 'markets_summary';
        } else if (templateId === 5) {
            data = this.parseSbeFundingData (frameHex, blockLength, frameLength);
            channel = 'funding_data';
        } else if (templateId === 20) {
            data = this.parseSbeOrder (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'orders.' + data['market'];
            }
        } else if (templateId === 21) {
            data = this.parseSbeFill (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'fills.' + data['market'];
            }
        } else if (templateId === 22) {
            data = this.parseSbePosition (frameHex, blockLength, frameLength);
            channel = 'positions';
        } else if (templateId === 23) {
            data = this.parseSbeAccount (frameHex, blockLength, frameLength);
            channel = 'account';
        }
        if (data === undefined) {
            return undefined;
        }
        return {
            'sbe': true,
            'params': {
                'channel': channel,
                'data': data,
            },
        };
    }

    sbeReadUint (frameHex: string, offset: number, length: number): int {
        // a little-endian unsigned integer of at most 4 bytes, so that it stays exact in every language
        const digits = '0123456789abcdef';
        let result: int = 0;
        let factor: int = 1;
        const count = this.parseToInt (length);
        const start = this.parseToInt (offset);
        let position: int = start * 2;
        for (let i = 0; i < count; i++) {
            // plain variables as slice bounds, php gets end - start unparenthesized
            const middle = position + 1;
            const next = position + 2;
            const high = digits.indexOf (frameHex.slice (position, middle));
            const low = digits.indexOf (frameHex.slice (middle, next));
            result = this.parseToInt (this.sum (result, high * 16 * factor, low * factor));
            factor = this.parseToInt (factor * 256);
            position = this.parseToInt (next);
        }
        // an exact integer below 2^32, parseToInt keeps it and types the return as an integer
        return this.parseToInt (result);
    }

    sbeReadInt64 (frameHex: string, offset: number): Str {
        // a signed int64 as a decimal string, undefined for INT64_MIN which the schema uses as null
        const low = this.parseToInt (this.sbeReadUint (frameHex, offset, 4));
        const high = this.parseToInt (this.sbeReadUint (frameHex, this.sum (offset, 4), 4));
        if ((high === 2147483648) && (low === 0)) {
            return undefined;
        }
        if (high === 0) {
            return this.numberToString (low);
        }
        let result = Precise.stringAdd (Precise.stringMul (this.numberToString (high), '4294967296'), this.numberToString (low));
        if (high >= 2147483648) {
            result = Precise.stringSub (result, '18446744073709551616');
        }
        return result;
    }

    sbeReadDecimal (frameHex: string, offset: number): Str {
        // prices, sizes and rates are int64 mantissas with a fixed exponent of -8
        const mantissa = this.sbeReadInt64 (frameHex, offset);
        if (mantissa === undefined) {
            return undefined;
        }
        return Precise.stringDiv (mantissa, '100000000', 8);
    }

    sbeReadTimestamp (frameHex: string, offset: number): Int {
        // timestamps are microseconds, truncated to milliseconds with Precise: a float
        // quotient like 1791906071000.999 is rounded up when php converts it to an int
        const microseconds = this.sbeReadInt64 (frameHex, offset);
        if (microseconds === undefined) {
            return undefined;
        }
        return this.parseToInt (Precise.stringDiv (microseconds, '1000', 0));
    }

    sbeReadEnum (frameHex: string, offset: number, values: Dict): Str {
        const value = this.parseToInt (this.sbeReadUint (frameHex, offset, 1));
        return this.safeString (values, this.numberToString (value));
    }

    sbeReadString (frameHex: string, offset: number, length: number): string {
        const first = this.parseToInt (offset);
        const size = this.parseToInt (length);
        const start = first * 2;
        const end = this.sum (start, size * 2);
        return this.binaryToString (this.base16ToBinary (frameHex.slice (start, end)));
    }

    sbeReadAddress (frameHex: string, offset: number): string {
        // a 32-byte big-endian account address, printed without leading zeros like the JSON feed
        const first = this.parseToInt (offset);
        const rawStart = first * 2;
        const rawEnd = rawStart + 64;
        const raw = frameHex.slice (rawStart, rawEnd);
        let start = 63;
        for (let i = 0; i < 63; i++) {
            const next = i + 1;
            if (raw.slice (i, next) !== '0') {
                start = i;
                break;
            }
        }
        return '0x' + raw.slice (start, 64);
    }

    sbeReadVarStrings (frameHex: string, offset: number, count: number, frameLength: number): any {
        // the var-data section: count strings, each prefixed with a uint8 length. Returns undefined
        // when the frame ends before all of them, and only the strings present when a trailing one is
        // absent, which is how a field appended to var-data reads on a frame from before it
        const result: string[] = [];
        const end = this.parseToInt (frameLength);
        const total = this.parseToInt (count);
        let position = this.parseToInt (offset);
        for (let i = 0; i < total; i++) {
            if (position >= end) {
                return result;
            }
            const length = this.parseToInt (this.sbeReadUint (frameHex, position, 1));
            const next = this.parseToInt (this.sum (position, 1, length));
            if (next > end) {
                return undefined;
            }
            result.push (this.sbeReadString (frameHex, position + 1, length));
            position = next;
        }
        return result;
    }

    parseSbeTrade (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // TradeEvent (templateId 1), 50-byte block
        //
        //     ts int64, seq int64, tradeId int64 (deprecated, truncated), side uint8, price int64,
        //     size int64, createdAt int64, tradeType uint8, then market and tradeIdStr strings
        //
        if (blockSize < 50) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 2, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        const sides: Dict = { '1': 'BUY', '2': 'SELL' };
        const tradeTypes: Dict = { '1': 'FILL', '2': 'LIQUIDATION', '3': 'UNWIND_TRANSFER', '4': 'SETTLE_MARKET', '5': 'RPI', '6': 'BLOCK_TRADE' };
        return {
            // the full trade id, absent only on frames that predate it, the int64 tradeId cannot hold it
            'id': this.safeString (strings, 1),
            'market': strings[0],
            'side': this.sbeReadEnum (frameHex, 32, sides),
            'size': this.sbeReadDecimal (frameHex, 41),
            'price': this.sbeReadDecimal (frameHex, 33),
            'created_at': this.sbeReadTimestamp (frameHex, 49),
            'trade_type': this.sbeReadEnum (frameHex, 57, tradeTypes),
        };
    }

    parseSbeBbo (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // BboEvent (templateId 2), 48-byte block
        //
        //     ts int64, seq int64, bidPrice int64, bidSize int64, askPrice int64, askSize int64 (each price
        //     and size null on an empty side), then the market string
        //
        if (blockSize < 48) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        return {
            'market': strings[0],
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'bid': this.sbeReadDecimal (frameHex, 24),
            'bid_size': this.sbeReadDecimal (frameHex, 32),
            'ask': this.sbeReadDecimal (frameHex, 40),
            'ask_size': this.sbeReadDecimal (frameHex, 48),
            'last_updated_at': this.sbeReadTimestamp (frameHex, 8),
        };
    }

    parseSbeOrderBook (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // BookEvent (templateId 3), 89-byte block
        //
        //     ts int64, seq int64, pkgType uint8 (0 snapshot, 1 delta), nine best bid/ask int64 fields, then
        //     the bids and asks groups of (price int64, size int64) entries and the market string. A delta
        //     carries the changed levels, a size of 0 removes the level
        //
        if (blockSize < 17) {
            return undefined;
        }
        const pkgType = this.parseToInt (this.sbeReadUint (frameHex, 24, 1));
        if ((pkgType !== 0) && (pkgType !== 1)) {
            return undefined;
        }
        const levels: Dict[] = [];
        const sides = [ 'BUY', 'SELL' ];
        const frameEnd = this.parseToInt (frameLength);
        let position = this.parseToInt (this.sum (blockLength, 8));
        for (let i = 0; i < sides.length; i++) {
            if (position + 4 > frameEnd) {
                return undefined;
            }
            const entryLength = this.parseToInt (this.sbeReadUint (frameHex, position, 2));
            const numInGroup = this.parseToInt (this.sbeReadUint (frameHex, position + 2, 2));
            position = this.parseToInt (position + 4);
            if ((entryLength < 16) || (this.parseToInt (this.sum (position, numInGroup * entryLength)) > frameEnd)) {
                return undefined;
            }
            for (let j = 0; j < numInGroup; j++) {
                levels.push ({
                    'side': sides[i],
                    'price': this.sbeReadDecimal (frameHex, position),
                    'size': this.sbeReadDecimal (frameHex, position + 8),
                });
                position = this.parseToInt (this.sum (position, entryLength));
            }
        }
        const strings = this.sbeReadVarStrings (frameHex, position, 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        const isSnapshot = (pkgType === 0);
        return {
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'market': strings[0],
            'last_updated_at': this.sbeReadTimestamp (frameHex, 8),
            'update_type': (isSnapshot) ? 's' : 'd',
            'inserts': (isSnapshot) ? levels : [],
            // a delta does not tell an insert from an update, a removal is a size of 0 among them
            'updates': (isSnapshot) ? [] : levels,
            'deletes': [],
        };
    }

    parseSbeMarketSummary (client: Client, frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // MarketSummaryEvent (templateId 4), 248-byte block (240 before 1:3), of which the first
        // 12 int64 fields and settlementTwapEstimate are read
        //
        //     ts, seq, markPrice, indexPrice, lastPrice, volumeUsd24h, openInterest, fundingRate, bid,
        //     ask, totalVolume, priceChangeRate24h, ..., settlementTwapEstimate (1:3, at 240), then the
        //     market string
        //
        if (blockSize < 96) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        // the market is read first, so that a frame for a market nobody subscribed to is dropped before its
        // decimals are decoded, like one still in flight after its market left the scoped filter
        const subscribeHash = 'markets_summary.' + strings[0];
        if (!('markets_summary' in client.subscriptions) && !(subscribeHash in client.subscriptions)) {
            return undefined;
        }
        // appended in 1:3: null outside the pre-expiry settlement window and for undated markets
        let settlementTwapEstimate: Str = undefined;
        if (blockSize >= 248) {
            settlementTwapEstimate = this.sbeReadDecimal (frameHex, 248);
        }
        return {
            'symbol': strings[0],
            'mark_price': this.sbeReadDecimal (frameHex, 24),
            'last_traded_price': this.sbeReadDecimal (frameHex, 40),
            'bid': this.sbeReadDecimal (frameHex, 72),
            'ask': this.sbeReadDecimal (frameHex, 80),
            'volume_24h': this.sbeReadDecimal (frameHex, 48),
            // saturates at the int64 maximum, 92233720368.54775807 once scaled
            'total_volume': this.sbeReadDecimal (frameHex, 88),
            'created_at': this.sbeReadTimestamp (frameHex, 8),
            'open_interest': this.sbeReadDecimal (frameHex, 56),
            'funding_rate': this.sbeReadDecimal (frameHex, 64),
            'price_change_rate_24h': this.sbeReadDecimal (frameHex, 96),
            'settlement_twap_estimate': settlementTwapEstimate,
        };
    }

    parseSbeFundingData (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // FundingDataEvent (templateId 5), 66-byte block
        //
        //     ts int64, seq int64, fundingRate int64, fundingIndex int64, createdAt int64,
        //     fundingPremium int64, fundingRate8h int64, fundingPeriodHours int16, ... then the market
        //
        if (blockSize < 58) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        return {
            'market': strings[0],
            'funding_index': this.sbeReadDecimal (frameHex, 32),
            'funding_premium': this.sbeReadDecimal (frameHex, 48),
            'funding_rate': this.sbeReadDecimal (frameHex, 24),
            'funding_rate_8h': this.sbeReadDecimal (frameHex, 56),
            'funding_period_hours': this.sbeReadUint (frameHex, 64, 2),
            'created_at': this.sbeReadTimestamp (frameHex, 40),
        };
    }

    parseSbeOrder (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // OrderEvent (templateId 20), 128-byte block (126 before the 1:2 request fields)
        //
        //     ts int64, seq int64, status uint8, side uint8, orderType uint8, timeInForce uint8,
        //     price int64, triggerPrice int64, size int64, sizeOpen int64, avgFillPrice int64,
        //     createdAt int64, updatedAt int64, account [32]byte, receivedAt int64, publishedAt int64,
        //     stp uint8, flags uint8, ... then the orderId, clientOrderId, market and cancelReason strings
        //
        if (blockSize < 126) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 4, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 4) {
            return undefined;
        }
        const statuses: Dict = { '1': 'NEW', '2': 'UNTRIGGERED', '3': 'OPEN', '4': 'CLOSED' };
        const sides: Dict = { '1': 'BUY', '2': 'SELL' };
        const orderTypes: Dict = { '1': 'LIMIT', '2': 'MARKET', '3': 'STOP_LIMIT', '4': 'STOP_MARKET', '5': 'TAKE_PROFIT_LIMIT', '6': 'TAKE_PROFIT_MARKET', '7': 'STOP_LOSS_LIMIT', '8': 'STOP_LOSS_MARKET' };
        const timeInForces: Dict = { '1': 'GTC', '2': 'IOC', '3': 'POST_ONLY', '4': 'RPI' };
        const stpModes: Dict = { '0': 'NONE', '1': 'EXPIRE_MAKER', '2': 'EXPIRE_TAKER', '3': 'EXPIRE_BOTH' };
        const flags = this.sbeReadFlags (frameHex, 133, [ 'REDUCE_ONLY', 'STOP_CONDITION_BELOW_TRIGGER', 'STOP_CONDITION_ABOVE_TRIGGER', 'INTERACTIVE', 'TARGET_STRATEGY_VWAP', 'MMP' ]);
        const order: Dict = {
            'account': this.sbeReadAddress (frameHex, 84),
            'avg_fill_price': this.sbeReadDecimal (frameHex, 60),
            'client_id': strings[1],
            'created_at': this.sbeReadTimestamp (frameHex, 68),
            'flags': flags,
            'id': strings[0],
            'instruction': this.sbeReadEnum (frameHex, 27, timeInForces),
            'last_updated_at': this.sbeReadTimestamp (frameHex, 76),
            'market': strings[2],
            'price': this.sbeReadDecimal (frameHex, 28),
            'published_at': this.sbeReadTimestamp (frameHex, 124),
            'received_at': this.sbeReadTimestamp (frameHex, 116),
            'remaining_size': this.sbeReadDecimal (frameHex, 52),
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'side': this.sbeReadEnum (frameHex, 25, sides),
            'size': this.sbeReadDecimal (frameHex, 44),
            'status': this.sbeReadEnum (frameHex, 24, statuses),
            'stp': this.sbeReadEnum (frameHex, 132, stpModes),
            'timestamp': this.sbeReadTimestamp (frameHex, 8),
            'trigger_price': this.sbeReadDecimal (frameHex, 36),
            'type': this.sbeReadEnum (frameHex, 26, orderTypes),
        };
        // an empty cancel reason is sent for every live order, parseOrder reads any reason as canceled
        if (strings[3] !== '') {
            order['cancel_reason'] = strings[3];
        }
        return order;
    }

    sbeReadFlags (frameHex: string, offset: number, names: string[]): string[] {
        // a uint8 bitset, names[bit] for each set bit, an empty name for a bit the schema leaves unused
        const flags: string[] = [];
        let bits = this.parseToInt (this.sbeReadUint (frameHex, offset, 1));
        for (let i = 0; i < names.length; i++) {
            const bit = this.parseToInt (bits % 2);
            if ((bit === 1) && (names[i] !== '')) {
                flags.push (names[i]);
            }
            bits = this.parseToInt (bits / 2);
        }
        return flags;
    }

    parseSbeFill (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // FillEvent (templateId 21), 116-byte block (107 before the 1:2 flags and orderbookSeqNo)
        //
        //     ts int64, seq int64 (nullable), fillType uint8, side uint8, liquidity uint8, price int64,
        //     size int64, fee int64, realizedPnl int64 (nullable), createdAt int64, account [32]byte,
        //     underlyingPrice int64, realizedFunding int64, flags uint8, orderbookSeqNo uint64, then the
        //     fillId, orderId, clientOrderId, tradeId, market and feeCurrency (1:2) strings
        //
        if (blockSize < 107) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 6, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 5) {
            return undefined;
        }
        const fillTypes: Dict = { '1': 'FILL', '2': 'LIQUIDATION', '3': 'UNWIND_TRANSFER', '4': 'SETTLE_MARKET', '5': 'RPI', '6': 'BLOCK_TRADE' };
        const sides: Dict = { '1': 'BUY', '2': 'SELL' };
        const liquidities: Dict = { '1': 'MAKER', '2': 'TAKER' };
        const fill: Dict = {
            'account': this.sbeReadAddress (frameHex, 67),
            'client_id': strings[2],
            'created_at': this.sbeReadTimestamp (frameHex, 59),
            'fee': this.sbeReadDecimal (frameHex, 43),
            'fee_currency': this.safeString (strings, 5),
            'fill_type': this.sbeReadEnum (frameHex, 24, fillTypes),
            'id': strings[0],
            'liquidity': this.sbeReadEnum (frameHex, 26, liquidities),
            'market': strings[4],
            'order_id': strings[1],
            'price': this.sbeReadDecimal (frameHex, 27),
            'realized_funding': this.sbeReadDecimal (frameHex, 107),
            'realized_pnl': this.sbeReadDecimal (frameHex, 51),
            'side': this.sbeReadEnum (frameHex, 25, sides),
            'size': this.sbeReadDecimal (frameHex, 35),
            'underlying_price': this.sbeReadDecimal (frameHex, 99),
        };
        if (blockSize >= 116) {
            // lowercase, as the JSON feed spells fill flags
            fill['flags'] = this.sbeReadFlags (frameHex, 115, [ 'interactive', 'rpi', 'fastfill', '', '', '', '', 'unknown' ]);
            fill['orderbook_seq_no'] = this.sbeReadInt64 (frameHex, 116);
        }
        return fill;
    }

    parseSbePosition (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // PositionEvent (templateId 22), 154-byte block
        //
        //     ts int64, seq int64, side uint8, size int64 (absolute), avgEntryPrice int64,
        //     unrealizedPnl int64, realizedPnl int64, markPrice int64 (always null), liquidationPrice
        //     int64 (nullable), leverage int64, updatedAt int64, account [32]byte, avgEntryPriceUsd
        //     int64, cost int64, costUsd int64, cachedFundingIndex int64, unrealizedFundingPnl int64,
        //     status uint8, then the market and lastFillId strings
        //
        if (blockSize < 154) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 2, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        const sides: Dict = { '1': 'LONG', '2': 'SHORT' };
        const statuses: Dict = { '1': 'OPEN', '2': 'CLOSED' };
        const side = this.sbeReadEnum (frameHex, 24, sides);
        const account = this.sbeReadAddress (frameHex, 89);
        // the frame carries the size unsigned, the JSON channel signs it negative for a short
        let size = this.sbeReadDecimal (frameHex, 25);
        if ((side === 'SHORT') && (size !== '0')) {
            size = Precise.stringNeg (size);
        }
        return {
            'account': account,
            'average_entry_price': this.sbeReadDecimal (frameHex, 33),
            'average_entry_price_usd': this.sbeReadDecimal (frameHex, 121),
            'cached_funding_index': this.sbeReadDecimal (frameHex, 145),
            'cost': this.sbeReadDecimal (frameHex, 129),
            'cost_usd': this.sbeReadDecimal (frameHex, 137),
            // the JSON channel's id, one position per account and market
            'id': account + '-' + strings[0],
            'last_fill_id': this.safeString (strings, 1),
            'last_updated_at': this.sbeReadTimestamp (frameHex, 81),
            'leverage': this.sbeReadDecimal (frameHex, 73),
            'liquidation_price': this.sbeReadDecimal (frameHex, 65),
            'market': strings[0],
            'realized_positional_pnl': this.sbeReadDecimal (frameHex, 49),
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'side': side,
            'size': size,
            'status': this.sbeReadEnum (frameHex, 161, statuses),
            'unrealized_funding_pnl': this.sbeReadDecimal (frameHex, 153),
            'unrealized_pnl': this.sbeReadDecimal (frameHex, 41),
        };
    }

    parseSbeAccount (frameHex: string, blockLength: number, frameLength: number): NullableDict {
        const blockSize = this.parseToInt (blockLength);
        //
        // AccountEvent (templateId 23), 121-byte block (113 before the 1:2 lastSeenNotification)
        //
        //     ts int64, seq int64, totalCollateral int64, freeCollateral int64, initialMarginReq int64,
        //     maintenanceMarginReq int64, accountValue int64, unrealizedPnl int64 (nullable), updatedAt
        //     int64, account [32]byte, marginCushion int64, status uint8, lastSeenNotification int64,
        //     then the settlementAsset string
        //
        if (blockSize < 113) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        const statuses: Dict = { '1': 'ACTIVE', '2': 'LIQUIDATION' };
        const account: Dict = {
            'account': this.sbeReadAddress (frameHex, 80),
            'account_value': this.sbeReadDecimal (frameHex, 56),
            'free_collateral': this.sbeReadDecimal (frameHex, 32),
            'initial_margin_requirement': this.sbeReadDecimal (frameHex, 40),
            'maintenance_margin_requirement': this.sbeReadDecimal (frameHex, 48),
            'margin_cushion': this.sbeReadDecimal (frameHex, 112),
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'settlement_asset': strings[0],
            'status': this.sbeReadEnum (frameHex, 120, statuses),
            'total_collateral': this.sbeReadDecimal (frameHex, 24),
            'updated_at': this.sbeReadTimestamp (frameHex, 72),
        };
        if (blockSize >= 121) {
            account['last_seen_notification'] = this.sbeReadTimestamp (frameHex, 121);
        }
        return account;
    }

    handleErrorMessage (client: Client, message: Dict): Bool {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 0,
        //         "error": {
        //             "code": -32600,
        //             "message": "invalid subscribe request",
        //             "data": "invalid channel"
        //         },
        //         "usIn": 1718179125962419,
        //         "usDiff": 76,
        //         "usOut": 1718179125962495
        //     }
        //
        const error = this.safeDict (message, 'error');
        if (error === undefined) {
            return true;
        }
        try {
            const feedback = this.id + ' ' + this.json (error);
            const errorCode = this.safeString (error, 'code');
            if (errorCode !== undefined) {
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            }
            const messageString = this.safeString (error, 'message');
            if (messageString !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
            }
            throw new ExchangeError (feedback);
        } catch (e) {
            // the subscription of every request sent keeps its id, so the request this error answers is found
            // by it. A failed subscribe or auth is forgotten, so that the next watch sends it again
            const requestId = this.safeString (message, 'id');
            let handled = false;
            if (requestId !== undefined) {
                const subscribeHashes = Object.keys (client.subscriptions);
                for (let i = 0; i < subscribeHashes.length; i++) {
                    const subscribeHash = subscribeHashes[i];
                    const subscription = this.safeDict (client.subscriptions, subscribeHash);
                    if (this.safeString (subscription, 'id') === requestId) {
                        handled = true;
                        delete client.subscriptions[subscribeHash];
                        // watchMultiple subscribes per message hash, so the subscribe hash is what its watcher waits on
                        const messageHashes = this.safeList (subscription, 'messageHashes', [ subscribeHash ]);
                        for (let j = 0; j < messageHashes.length; j++) {
                            client.reject (e, messageHashes[j]);
                        }
                    }
                }
            }
            if (!handled) {
                // not a reply to a known request, every watcher on the connection gets the error,
                // and the next private watch authenticates again instead of waiting on a rejected future
                if ('authenticated' in client.subscriptions) {
                    delete client.subscriptions['authenticated'];
                }
                client.reject (e);
            }
        }
        return false;
    }

    override handleMessage (client: Client, message: any) {
        let parsedMessage: Dict = message;
        if (this.isBinaryMessage (message)) {
            parsedMessage = this.parseSbeMessage (client, message);
            if (parsedMessage === undefined) {
                return;
            }
        }
        if (this.handleErrorMessage (client, parsedMessage) !== true) {
            return;
        }
        //
        // auth response
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": { "node_id": "73cf456f7cb78d59" }
        //     }
        //
        // subscription message
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.ALL",
        //             "data": {
        //                 "id": "1718179273230201709233240002",
        //                 "market": "kBONK-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "34028",
        //                 "price": "0.028776",
        //                 "created_at": 1718179273230,
        //                 "trade_type": "FILL"
        //             }
        //         }
        //     }
        //
        const result = this.safeDict (parsedMessage, 'result');
        if (result !== undefined) {
            this.handleRequestReply (client, parsedMessage);
            return;
        }
        const data = this.safeDict (parsedMessage, 'params');
        if (data !== undefined) {
            const channel = this.safeString (data, 'channel');
            const parts = (channel as string).split ('.');
            const name = this.safeString (parts, 0);
            const methods: Dict = {
                'trades': this.handleTrade,
                'order_book': this.handleOrderBook,
                'bbo': this.handleBidAsk,
                'markets_summary': this.handleTicker,
                'orders': this.handleOrder,
                'funding_data': this.handleFundingRate,
                'fills': this.handleMyTrade,
                'positions': this.handlePositions,
                'account': this.handleBalance,
            };
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                method.call (this, client, parsedMessage);
            }
        }
    }
}
