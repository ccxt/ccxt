// ----------------------------------------------------------------------------
import vertexRest from '../vertex.js';
import { AuthenticationError, NotSupported, ArgumentsRequired } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
// ----------------------------------------------------------------------------
export default class vertex extends vertexRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://gateway.prod.vertexprotocol.com/v1/subscribe',
                },
                'test': {
                    'ws': 'wss://gateway.sepolia-test.vertexprotocol.com/v1/subscribe',
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
                'ws': {
                    'inflate': true,
                    'options': {
                        'headers': {
                            'Sec-WebSocket-Extensions': 'permessage-deflate', // requires permessage-deflate extension, maybe we can set this in client implementation when inflate is true
                        },
                    },
                },
            },
            'streaming': {
                // 'ping': this.ping,
                'keepAlive': 30000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }
    requestId(url) {
        const options = this.safeDict(this.options, 'requestId', {});
        const previousValue = this.safeInteger(options, url, 0);
        const newValue = this.sum(previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }
    async watchPublic(messageHash, message) {
        const url = this.urls['api']['ws'];
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        const wsOptions = {
            'headers': {
                'Sec-WebSocket-Extensions': 'permessage-deflate',
            },
        };
        this.options['ws'] = {
            'options': wsOptions,
        };
        return await this.watch(url, messageHash, request, messageHash, subscribe);
    }
    /**
     * @method
     * @name vertex#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const name = 'trade';
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric(market['id']),
            },
        };
        const message = this.extend(request, params);
        const trades = await this.watchPublic(topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleTrade(client, message) {
        //
        // {
        //     "type": "trade",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "price": "1000", // price the trade happened at, multiplied by 1e18
        //     // both taker_qty and maker_qty have the same value;
        //     // set to filled amount (min amount of taker and maker) when matching against book
        //     // set to matched amm base amount when matching against amm
        //     "taker_qty": "1000",
        //     "maker_qty": "1000",
        //     "is_taker_buyer": true,
        //     "is_maker_amm": true // true when maker is amm
        // }
        //
        const topic = this.safeString(message, 'type');
        const marketId = this.safeString(message, 'product_id');
        const trade = this.parseWsTrade(message);
        const symbol = trade['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append(trade);
        this.trades[symbol] = trades;
        client.resolve(trades, marketId + '@' + topic);
    }
    /**
     * @method
     * @name vertex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' watchMyTrades requires a symbol.');
        }
        await this.loadMarkets();
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('watchMyTrades', params);
        const market = this.market(symbol);
        const name = 'fill';
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric(market['id']),
                'subaccount': this.convertAddressToSender(userAddress),
            },
        };
        const message = this.extend(request, params);
        const trades = await this.watchPublic(topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message) {
        //
        // {
        //     "type": "fill",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     // the subaccount that placed this order
        //     "subaccount": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43746573743000000000000000",
        //     // hash of the order that uniquely identifies it
        //     "order_digest": "0xf4f7a8767faf0c7f72251a1f9e5da590f708fd9842bf8fcdeacbaa0237958fff",
        //     // the amount filled, multiplied by 1e18
        //     "filled_qty": "1000",
        //     // the amount outstanding unfilled, multiplied by 1e18
        //     "remaining_qty": "2000",
        //     // the original order amount, multiplied by 1e18
        //     "original_qty": "3000",
        //     // fill price
        //     "price": "24991000000000000000000",
        //     // true for `taker`, false for `maker`
        //     "is_taker": true,
        //     "is_bid": true,
        //     // true when matching against amm
        //     "is_against_amm": true,
        //     // an optional `order id` that can be provided when placing an order
        //     "id": 100
        // }
        //
        const topic = this.safeString(message, 'type');
        const marketId = this.safeString(message, 'product_id');
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById(limit);
        }
        const trades = this.myTrades;
        const parsed = this.parseWsTrade(message);
        trades.append(parsed);
        client.resolve(trades, marketId + '@' + topic);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // watchTrades
        // {
        //     "type": "trade",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "price": "1000", // price the trade happened at, multiplied by 1e18
        //     // both taker_qty and maker_qty have the same value;
        //     // set to filled amount (min amount of taker and maker) when matching against book
        //     // set to matched amm base amount when matching against amm
        //     "taker_qty": "1000",
        //     "maker_qty": "1000",
        //     "is_taker_buyer": true,
        //     "is_maker_amm": true // true when maker is amm
        // }
        // watchMyTrades
        // {
        //     "type": "fill",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     // the subaccount that placed this order
        //     "subaccount": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43746573743000000000000000",
        //     // hash of the order that uniquely identifies it
        //     "order_digest": "0xf4f7a8767faf0c7f72251a1f9e5da590f708fd9842bf8fcdeacbaa0237958fff",
        //     // the amount filled, multiplied by 1e18
        //     "filled_qty": "1000",
        //     // the amount outstanding unfilled, multiplied by 1e18
        //     "remaining_qty": "2000",
        //     // the original order amount, multiplied by 1e18
        //     "original_qty": "3000",
        //     // fill price
        //     "price": "24991000000000000000000",
        //     // true for `taker`, false for `maker`
        //     "is_taker": true,
        //     "is_bid": true,
        //     // true when matching against amm
        //     "is_against_amm": true,
        //     // an optional `order id` that can be provided when placing an order
        //     "id": 100
        // }
        //
        const marketId = this.safeString(trade, 'product_id');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.convertFromX18(this.safeString(trade, 'price'));
        const amount = this.convertFromX18(this.safeString2(trade, 'taker_qty', 'filled_qty'));
        const cost = Precise.stringMul(price, amount);
        const timestamp = this.safeIntegerProduct(trade, 'timestamp', 0.000001);
        let takerOrMaker = undefined;
        const isTaker = this.safeBool(trade, 'is_taker');
        if (isTaker !== undefined) {
            takerOrMaker = (isTaker) ? 'taker' : 'maker';
        }
        let side = undefined;
        const isBid = this.safeBool(trade, 'is_bid');
        if (isBid !== undefined) {
            side = (isBid) ? 'buy' : 'sell';
        }
        return this.safeTrade({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': this.safeString2(trade, 'digest', 'id'),
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name vertex#watchTicker
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const name = 'best_bid_offer';
        const market = this.market(symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric(market['id']),
            },
        };
        const message = this.extend(request, params);
        return await this.watchPublic(topic, message);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        // {
        //     "type": "best_bid_offer",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "bid_price": "1000", // the highest bid price, multiplied by 1e18
        //     "bid_qty": "1000", // quantity at the huighest bid, multiplied by 1e18.
        //                        // i.e. if this is USDC with 6 decimals, one USDC
        //                        // would be 1e12
        //     "ask_price": "1000", // lowest ask price
        //     "ask_qty": "1000" // quantity at the lowest ask
        // }
        //
        const timestamp = this.safeIntegerProduct(ticker, 'timestamp', 0.000001);
        return this.safeTicker({
            'symbol': this.safeSymbol(undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.convertFromX18(this.safeString(ticker, 'bid_price')),
            'bidVolume': this.convertFromX18(this.safeString(ticker, 'bid_qty')),
            'ask': this.convertFromX18(this.safeString(ticker, 'ask_price')),
            'askVolume': this.convertFromX18(this.safeString(ticker, 'ask_qty')),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    handleTicker(client, message) {
        //
        // {
        //     "type": "best_bid_offer",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "bid_price": "1000", // the highest bid price, multiplied by 1e18
        //     "bid_qty": "1000", // quantity at the huighest bid, multiplied by 1e18.
        //                        // i.e. if this is USDC with 6 decimals, one USDC
        //                        // would be 1e12
        //     "ask_price": "1000", // lowest ask price
        //     "ask_qty": "1000" // quantity at the lowest ask
        // }
        //
        const marketId = this.safeString(message, 'product_id');
        const market = this.safeMarket(marketId);
        const ticker = this.parseWsTicker(message, market);
        ticker['symbol'] = market['symbol'];
        this.tickers[market['symbol']] = ticker;
        client.resolve(ticker, marketId + '@best_bid_offer');
        return message;
    }
    /**
     * @method
     * @name vertex#watchOrderBook
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'book_depth';
        const market = this.market(symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws'];
        const requestId = this.requestId(url);
        const request = {
            'id': requestId,
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric(market['id']),
            },
        };
        const subscription = {
            'id': requestId.toString(),
            'name': name,
            'symbol': symbol,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend(request, params);
        const orderbook = await this.watch(url, messageHash, message, messageHash, subscription);
        return orderbook.limit();
    }
    handleOrderBookSubscription(client, message, subscription) {
        const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
        const limit = this.safeInteger(subscription, 'limit', defaultLimit);
        const symbol = this.safeString(subscription, 'symbol'); // watchOrderBook
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook({}, limit);
        this.spawn(this.fetchOrderBookSnapshot, client, message, subscription);
    }
    async fetchOrderBookSnapshot(client, message, subscription) {
        const symbol = this.safeString(subscription, 'symbol');
        const market = this.market(symbol);
        const messageHash = market['id'] + '@book_depth';
        try {
            const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
            const limit = this.safeInteger(subscription, 'limit', defaultLimit);
            const params = this.safeValue(subscription, 'params');
            const snapshot = await this.fetchRestOrderBookSafe(symbol, limit, params);
            if (this.safeValue(this.orderbooks, symbol) === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            const orderbook = this.orderbooks[symbol];
            orderbook.reset(snapshot);
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const lastTimestamp = this.parseToInt(Precise.stringDiv(this.safeString(messageItem, 'last_max_timestamp'), '1000000'));
                if (lastTimestamp < orderbook['timestamp']) {
                    continue;
                }
                else {
                    this.handleOrderBookMessage(client, messageItem, orderbook);
                }
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve(orderbook, messageHash);
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            client.reject(e, messageHash);
        }
    }
    handleOrderBook(client, message) {
        //
        //
        // the feed does not include a snapshot, just the deltas
        //
        // {
        //     "type":"book_depth",
        //     // book depth aggregates a number of events once every 50ms
        //     // these are the minimum and maximum timestamps from
        //     // events that contributed to this response
        //     "min_timestamp": "1683805381879572835",
        //     "max_timestamp": "1683805381879572835",
        //     // the max_timestamp of the last book_depth event for this product
        //     "last_max_timestamp": "1683805381771464799",
        //     "product_id":1,
        //     // changes to the bid side of the book in the form of [[price, new_qty]]
        //     "bids":[["21594490000000000000000","51007390115411548"]],
        //     // changes to the ask side of the book in the form of [[price, new_qty]]
        //     "asks":[["21694490000000000000000","0"],["21695050000000000000000","0"]]
        // }
        //
        const marketId = this.safeString(message, 'product_id');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger(orderbook, 'timestamp');
        if (timestamp === undefined) {
            // Buffer the events you receive from the stream.
            orderbook.cache.push(message);
        }
        else {
            const lastTimestamp = this.parseToInt(Precise.stringDiv(this.safeString(message, 'last_max_timestamp'), '1000000'));
            if (lastTimestamp > timestamp) {
                this.handleOrderBookMessage(client, message, orderbook);
                client.resolve(orderbook, marketId + '@book_depth');
            }
        }
    }
    handleOrderBookMessage(client, message, orderbook) {
        const timestamp = this.parseToInt(Precise.stringDiv(this.safeString(message, 'last_max_timestamp'), '1000000'));
        // convert from X18
        const data = {
            'bids': [],
            'asks': [],
        };
        const bids = this.safeList(message, 'bids', []);
        for (let i = 0; i < bids.length; i++) {
            const bid = bids[i];
            data['bids'].push([
                this.convertFromX18(bid[0]),
                this.convertFromX18(bid[1]),
            ]);
        }
        const asks = this.safeList(message, 'asks', []);
        for (let i = 0; i < asks.length; i++) {
            const ask = asks[i];
            data['asks'].push([
                this.convertFromX18(ask[0]),
                this.convertFromX18(ask[1]),
            ]);
        }
        this.handleDeltas(orderbook['asks'], this.safeList(data, 'asks', []));
        this.handleDeltas(orderbook['bids'], this.safeList(data, 'bids', []));
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const id = this.safeString(message, 'id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeValue(subscriptionsById, id, {});
        const method = this.safeValue(subscription, 'method');
        if (method !== undefined) {
            method.call(this, client, message, subscription);
        }
        return message;
    }
    /**
     * @method
     * @name vertex#watchPositions
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        if (!this.isEmpty(symbols)) {
            if (symbols.length > 1) {
                throw new NotSupported(this.id + ' watchPositions require only one symbol.');
            }
        }
        else {
            throw new ArgumentsRequired(this.id + ' watchPositions require one symbol.');
        }
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('watchPositions', params);
        const url = this.urls['api']['ws'];
        const client = this.client(url);
        this.setPositionsCache(client, symbols, params);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const name = 'position_change';
        const market = this.market(symbols[0]);
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric(market['id']),
                'subaccount': this.convertAddressToSender(userAddress),
            },
        };
        const message = this.extend(request, params);
        const newPositions = await this.watchPublic(topic, message);
        if (this.newUpdates) {
            limit = newPositions.getLimit(symbols[0], limit);
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    setPositionsCache(client, symbols = undefined, params = {}) {
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash, symbols, params);
            }
        }
        else {
            this.positions = new ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash, symbols, params) {
        const positions = await this.fetchPositions(symbols, params);
        this.positions = new ArrayCacheBySymbolBySide();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            cache.append(position);
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, 'positions');
    }
    handlePositions(client, message) {
        //
        // {
        //     "type":"position_change",
        //     "timestamp": "1676151190656903000", // timestamp of event in nanoseconds
        //     "product_id":1,
        //      // whether this is a position change for the LP token for this product
        //     "is_lp":false,
        //     // subaccount who's position changed
        //     "subaccount":"0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43706d00000000000000000000",
        //     // new amount for this product
        //     "amount":"51007390115411548",
        //     // new quote balance for this product; zero for everything except non lp perps
        //     // the negative of the entry cost of the perp
        //     "v_quote_amount":"0"
        // }
        //
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const topic = this.safeString(message, 'type');
        const marketId = this.safeString(message, 'product_id');
        const market = this.safeMarket(marketId);
        const position = this.parseWsPosition(message, market);
        cache.append(position);
        client.resolve(position, marketId + '@' + topic);
    }
    parseWsPosition(position, market = undefined) {
        //
        // {
        //     "type":"position_change",
        //     "timestamp": "1676151190656903000", // timestamp of event in nanoseconds
        //     "product_id":1,
        //      // whether this is a position change for the LP token for this product
        //     "is_lp":false,
        //     // subaccount who's position changed
        //     "subaccount":"0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43706d00000000000000000000",
        //     // new amount for this product
        //     "amount":"51007390115411548",
        //     // new quote balance for this product; zero for everything except non lp perps
        //     // the negative of the entry cost of the perp
        //     "v_quote_amount":"0"
        // }
        //
        const marketId = this.safeString(position, 'product_id');
        market = this.safeMarket(marketId);
        const contractSize = this.convertFromX18(this.safeString(position, 'amount'));
        let side = 'buy';
        if (Precise.stringLt(contractSize, '1')) {
            side = 'sell';
        }
        const timestamp = this.parseToInt(Precise.stringDiv(this.safeString(position, 'timestamp'), '1000000'));
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'unrealizedPnl': undefined,
            'contracts': undefined,
            'contractSize': this.parseNumber(contractSize),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': 'cross',
            'marginType': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    handleAuth(client, message) {
        //
        // { result: null, id: 1 }
        //
        const messageHash = 'authenticated';
        const error = this.safeString(message, 'error');
        if (error === undefined) {
            // client.resolve (message, messageHash);
            const future = this.safeValue(client.futures, 'authenticated');
            future.resolve(true);
        }
        else {
            const authError = new AuthenticationError(this.json(message));
            client.reject(authError, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
    buildWsAuthenticationSig(message, chainId, verifyingContractAddress) {
        const messageTypes = {
            'StreamAuthentication': [
                { 'name': 'sender', 'type': 'bytes32' },
                { 'name': 'expiration', 'type': 'uint64' },
            ],
        };
        return this.buildSig(chainId, messageTypes, message, verifyingContractAddress);
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const requestId = this.requestId(url);
            const contracts = await this.queryContracts();
            const chainId = this.safeString(contracts, 'chain_id');
            const verifyingContractAddress = this.safeString(contracts, 'endpoint_addr');
            const now = this.nonce();
            const nonce = now + 90000;
            const authentication = {
                'sender': this.convertAddressToSender(this.walletAddress),
                'expiration': nonce,
            };
            const request = {
                'id': requestId,
                'method': 'authenticate',
                'tx': {
                    'sender': authentication['sender'],
                    'expiration': this.numberToString(authentication['expiration']),
                },
                'signature': this.buildWsAuthenticationSig(authentication, chainId, verifyingContractAddress),
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    async watchPrivate(messageHash, message, params = {}) {
        await this.authenticate(params);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watch(url, messageHash, request, messageHash, subscribe);
    }
    /**
     * @method
     * @name vertex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' watchOrders requires a symbol.');
        }
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const name = 'order_update';
        const market = this.market(symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'subaccount': this.convertAddressToSender(this.walletAddress),
                'product_id': this.parseToNumeric(market['id']),
            },
        };
        const message = this.extend(request, params);
        const orders = await this.watchPrivate(topic, message);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    parseWsOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'filled': 'open',
                'placed': 'open',
                'cancelled': 'canceled',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    parseWsOrder(order, market = undefined) {
        //
        // {
        //     "type": "order_update",
        //     // timestamp of the event in nanoseconds
        //     "timestamp": "1695081920633151000",
        //     "product_id": 1,
        //     // order digest
        //     "digest": "0xf7712b63ccf70358db8f201e9bf33977423e7a63f6a16f6dab180bdd580f7c6c",
        //     // remaining amount to be filled.
        //     // will be `0` if the order is either fully filled or cancelled.
        //     "amount": "82000000000000000",
        //     // any of: "filled", "cancelled", "placed"
        //     "reason": "filled"
        //     // an optional `order id` that can be provided when placing an order
        //     "id": 100
        // }
        //
        const marketId = this.safeString(order, 'product_id');
        const timestamp = this.parseToInt(Precise.stringDiv(this.safeString(order, 'timestamp'), '1000000'));
        const remainingString = this.convertFromX18(this.safeString(order, 'amount'));
        const remaining = this.parseToNumeric(remainingString);
        let status = this.parseWsOrderStatus(this.safeString(order, 'reason'));
        if (Precise.stringEq(remainingString, '0') && status === 'open') {
            status = 'closed';
        }
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        return this.safeOrder({
            'info': order,
            'id': this.safeString2(order, 'digest', 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': undefined,
            'price': undefined,
            'triggerPrice': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    handleOrderUpdate(client, message) {
        //
        // {
        //     "type": "order_update",
        //     // timestamp of the event in nanoseconds
        //     "timestamp": "1695081920633151000",
        //     "product_id": 1,
        //     // order digest
        //     "digest": "0xf7712b63ccf70358db8f201e9bf33977423e7a63f6a16f6dab180bdd580f7c6c",
        //     // remaining amount to be filled.
        //     // will be `0` if the order is either fully filled or cancelled.
        //     "amount": "82000000000000000",
        //     // any of: "filled", "cancelled", "placed"
        //     "reason": "filled"
        //     // an optional `order id` that can be provided when placing an order
        //     "id": 100
        // }
        //
        const topic = this.safeString(message, 'type');
        const marketId = this.safeString(message, 'product_id');
        const parsed = this.parseWsOrder(message);
        const symbol = this.safeString(parsed, 'symbol');
        const orderId = this.safeString(parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById(limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeDict(cachedOrders.hashmap, symbol, {});
            const order = this.safeDict(orders, orderId);
            if (order !== undefined) {
                parsed['timestamp'] = this.safeInteger(order, 'timestamp');
                parsed['datetime'] = this.safeString(order, 'datetime');
            }
            cachedOrders.append(parsed);
            client.resolve(this.orders, marketId + '@' + topic);
        }
    }
    handleErrorMessage(client, message) {
        //
        // {
        //     result: null,
        //     error: 'error parsing request: missing field `expiration`',
        //     id: 0
        // }
        //
        const errorMessage = this.safeString(message, 'error');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
        }
        catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                client.reject(error);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const methods = {
            'trade': this.handleTrade,
            'best_bid_offer': this.handleTicker,
            'book_depth': this.handleOrderBook,
            'fill': this.handleMyTrades,
            'position_change': this.handlePositions,
            'order_update': this.handleOrderUpdate,
        };
        const event = this.safeString(message, 'type');
        const method = this.safeValue(methods, event);
        if (method !== undefined) {
            method.call(this, client, message);
            return;
        }
        const requestId = this.safeString(message, 'id');
        if (requestId !== undefined) {
            this.handleSubscriptionStatus(client, message);
            return;
        }
        // check whether it's authentication
        const auth = this.safeValue(client.futures, 'authenticated');
        if (auth !== undefined) {
            this.handleAuth(client, message);
        }
    }
}
