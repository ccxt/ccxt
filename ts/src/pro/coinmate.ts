import coinmateRest from '../coinmate.js';
import { ArgumentsRequired, BadRequest, AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, Str, Trade, OrderBook, Order, Ticker, Balances, Dict } from '../base/types.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import Client from '../base/ws/Client.js';

export default class coinmate extends coinmateRest {
    describe (): any {
        const superDescribe = super.describe ();
        return this.deepExtend (superDescribe, {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false, // Coinmate doesn't support watching all tickers at once
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false, // Not supported by Coinmate WebSocket
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://coinmate.io/api/websocket',
                        'private': 'wss://coinmate.io/api/websocket',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'watchOrderBook': {
                    'snapshotDelay': 6,
                },
            },
            'streaming': {
                'keepAlive': 30000,
            },
        });
    }

    /**
     * @method
     * @name coinmate#watchTrades
     * @description watches information on multiple trades made in a market
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'trades:' + market['symbol'];
        const channel = 'trades-' + market['id'];
        const subscribe = {
            'event': 'subscribe',
            'data': {
                'channel': channel,
            },
        };
        const trades = await this.watch (url, messageHash, subscribe, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     "event": "data",
        //     "channel": "trades-BTC_EUR",
        //     "payload": [
        //         {
        //             "date": 1234567890123,
        //             "price": 30000,
        //             "amount": 0.5,
        //             "type": "BUY",
        //             "buyOrderId": 123456,
        //             "sellOrderId": 123457
        //         }
        //     ]
        // }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId, undefined, '_'); // Specify underscore delimiter
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const payload = this.safeList (message, 'payload', []);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        for (let i = 0; i < payload.length; i++) {
            const trade = this.parseWsTrade (payload[i], market);
            tradesArray.append (trade);
        }
        client.resolve (tradesArray, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // {
        //     "date": 1234567890123,
        //     "price": 30000,
        //     "amount": 0.5,
        //     "type": "BUY",
        //     "buyOrderId": 123456,
        //     "sellOrderId": 123457
        // }
        //
        const timestamp = this.safeInteger (trade, 'date');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const side = this.safeStringLower (trade, 'type');
        const symbol = this.safeSymbol (undefined, market);
        const id = this.safeString2 (trade, 'buyOrderId', 'sellOrderId');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name coinmate#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'orderbook:' + market['symbol'];
        const channel = 'order_book-' + market['id'];
        const subscribe = {
            'event': 'subscribe',
            'data': {
                'channel': channel,
            },
        };
        const orderbook = await this.watch (url, messageHash, subscribe, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     "event": "data",
        //     "channel": "order_book-BTC_EUR",
        //     "payload": {
        //         "bids": [
        //             {"price": 30000, "amount": 1.5},
        //             {"price": 29999, "amount": 2.0}
        //         ],
        //         "asks": [
        //             {"price": 30001, "amount": 1.2},
        //             {"price": 30002, "amount": 1.8}
        //         ]
        //     }
        // }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const payload = this.safeDict (message, 'payload');
        const timestamp = this.milliseconds ();
        const orderbook = this.orderBook ({}, 1000);
        // FIXED: Use lowercase keys to match actual API response
        const bids = this.safeList (payload, 'bids', []);
        const asks = this.safeList (payload, 'asks', []);
        for (let i = 0; i < bids.length; i++) {
            const bid = bids[i];
            // FIXED: Use lowercase keys for price and amount
            const price = this.safeFloat (bid, 'price');
            const amount = this.safeFloat (bid, 'amount');
            orderbook['bids'].store (price, amount);
        }
        for (let i = 0; i < asks.length; i++) {
            const ask = asks[i];
            // FIXED: Use lowercase keys for price and amount
            const price = this.safeFloat (ask, 'price');
            const amount = this.safeFloat (ask, 'amount');
            orderbook['asks'].store (price, amount);
        }
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['symbol'] = symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name coinmate#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ticker:' + market['symbol'];
        const channel = 'statistics-' + market['id'];
        const subscribe = {
            'event': 'subscribe',
            'data': {
                'channel': channel,
            },
        };
        return await this.watch (url, messageHash, subscribe, messageHash);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //     "event": "data",
        //     "channel": "statistics-BTC_EUR",
        //     "payload": {
        //         "lastRealizedTrade": 30000,
        //         "todaysOpen": 29500,
        //         "dailyChange": 1.69,
        //         "volume24Hours": 100.5,
        //         "high24hours": 30500,
        //         "low24hours": 29000
        //     }
        // }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'ticker:' + symbol;
        const payload = this.safeDict (message, 'payload');
        const ticker = this.parseWsTicker (payload, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // {
        //     "lastRealizedTrade": 30000,
        //     "todaysOpen": 29500,
        //     "dailyChange": 1.69,
        //     "volume24Hours": 100.5,
        //     "high24hours": 30500,
        //     "low24hours": 29000
        // }
        //
        const timestamp = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'lastRealizedTrade');
        const open = this.safeString (ticker, 'todaysOpen');
        const percentage = this.safeString (ticker, 'dailyChange');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24hours'),
            'low': this.safeString (ticker, 'low24hours'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume24Hours'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name coinmate#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'balance';
        const clientId = this.uid;
        if (clientId === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBalance() requires uid (clientId) to be set');
        }
        const channel = 'private-user_balances-' + clientId;
        const nonce = this.nonce ();
        const auth = await this.authenticate (channel, nonce);
        const subscribe = {
            'event': 'subscribe',
            'data': this.extend ({
                'channel': channel,
            }, auth),
        };
        return await this.watch (url, messageHash, subscribe, messageHash);
    }

    async authenticate (channel: string, nonce: Int) {
        const clientId = this.uid;
        const publicKey = this.apiKey;
        const privateKey = this.secret;
        if (clientId === undefined) {
            throw new AuthenticationError (this.id + ' requires uid (clientId)');
        }
        if (publicKey === undefined || privateKey === undefined) {
            throw new AuthenticationError (this.id + ' requires apiKey and secret');
        }
        const message = nonce.toString () + clientId + publicKey;
        const signature = this.hmac (this.encode (message), this.encode (privateKey), sha256, 'hex');
        return {
            'clientId': parseInt (clientId),
            'publicKey': publicKey,
            'nonce': parseInt (nonce.toString ()),
            'signature': signature.toUpperCase (),
        };
    }

    handleBalance (client: Client, message) {
        //
        // {
        //     "event": "data",
        //     "channel": "private-user_balances-123",
        //     "payload": {
        //         "EUR": {
        //             "balance": 1000.50,
        //             "reserved": 100.25
        //         },
        //         "BTC": {
        //             "balance": 0.5,
        //             "reserved": 0.1
        //         }
        //     }
        // }
        //
        const payload = this.safeDict (message, 'payload');
        const currencyIds = Object.keys (payload);
        this.balance['info'] = payload;
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const balanceInfo = this.safeDict (payload, currencyId);
            const total = this.safeString (balanceInfo, 'balance');
            const used = this.safeString (balanceInfo, 'reserved');
            account['total'] = total;
            account['used'] = used;
            this.balance[code] = account;
        }
        const timestamp = this.milliseconds ();
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name coinmate#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['private'];
        const clientId = this.uid;
        if (clientId === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders() requires uid (clientId) to be set');
        }
        let messageHash = 'orders';
        let channel = 'private-open_orders-' + clientId;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            messageHash = 'orders:' + market['symbol'];
            channel = 'private-open_orders-' + clientId + '-' + market['id'];
        }
        const nonce = this.nonce ();
        const auth = await this.authenticate (channel, nonce);
        const subscribe = {
            'event': 'subscribe',
            'data': this.extend ({
                'channel': channel,
            }, auth),
        };
        const orders = await this.watch (url, messageHash, subscribe, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message) {
        //
        // Snapshot (first message) - array of orders
        // {
        //     "event": "data",
        //     "channel": "private-open_orders-123-BTC_EUR",
        //     "payload": [
        //         {
        //             "amount": 0.5,
        //             "date": 1234567890123,
        //             "hidden": false,
        //             "id": 123456,
        //             "clientOrderId": null,
        //             "original": 1.0,
        //             "price": 30000,
        //             "type": "BUY",
        //             "stopPrice": null,
        //             "trailing": false,
        //             "currencyPair": "BTC_EUR",
        //             "orderChangePushEvent": "SNAPSHOT"
        //         }
        //     ]
        // }
        //
        // Update (subsequent messages) - single order
        // {
        //     "event": "data",
        //     "channel": "private-open_orders-123-BTC_EUR",
        //     "payload": {
        //         "amount": 0.5,
        //         "date": 1234567890123,
        //         "hidden": false,
        //         "id": 123456,
        //         "clientOrderId": null,
        //         "original": 1.0,
        //         "price": 30000,
        //         "type": "BUY",
        //         "stopPrice": null,
        //         "trailing": false,
        //         "currencyPair": "BTC_EUR",
        //         "orderChangePushEvent": "CREATION"
        //     }
        // }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const marketId = this.safeString (parts, 3);
        let symbol = undefined;
        let market = undefined;
        if (marketId !== undefined) {
            market = this.safeMarket (marketId, undefined, '_'); // Specify underscore delimiter
            symbol = market['symbol'];
        }
        let messageHash = 'orders';
        if (symbol !== undefined) {
            messageHash = 'orders:' + symbol;
        }
        const payload = this.safeValue (message, 'payload');
        // Handle both array (snapshot) and single object (update)
        let orders = undefined;
        if (!Array.isArray (payload)) {
            orders = [ payload ];
        } else {
            orders = payload;
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const cachedOrders = this.orders;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const order = this.parseWsOrder (rawOrder, market);
            cachedOrders.append (order);
        }
        client.resolve (cachedOrders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        // {
        //     "amount": 0.5,
        //     "date": 1234567890123,
        //     "hidden": false,
        //     "id": 123456,
        //     "clientOrderId": null,
        //     "original": 1.0,
        //     "price": 30000,
        //     "type": "BUY",
        //     "stopPrice": null,
        //     "trailing": false,
        //     "currencyPair": "BTC_EUR",
        //     "orderChangePushEvent": "CREATION"
        // }
        //
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timestamp = this.safeInteger (order, 'date');
        const marketId = this.safeString (order, 'currencyPair');
        const symbol = this.safeSymbol (marketId, market, '_'); // Specify underscore delimiter
        const type = 'limit';
        const side = this.safeStringLower (order, 'type');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'original');
        const remaining = this.safeString (order, 'amount');
        const stopPrice = this.safeString (order, 'stopPrice');
        const event = this.safeString (order, 'orderChangePushEvent');
        let status = undefined;
        if (event === 'REMOVAL') {
            status = 'closed';
        } else if (event === 'SNAPSHOT' || event === 'CREATION' || event === 'UPDATE') {
            status = 'open';
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name coinmate#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['private'];
        const clientId = this.uid;
        if (clientId === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades() requires uid (clientId) to be set');
        }
        let messageHash = 'myTrades';
        let channel = 'private-user-trades-' + clientId;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            messageHash = 'myTrades:' + market['symbol'];
            channel = 'private-user-trades-' + clientId + '-' + market['id'];
        }
        const nonce = this.nonce ();
        const auth = await this.authenticate (channel, nonce);
        const subscribe = {
            'event': 'subscribe',
            'data': this.extend ({
                'channel': channel,
            }, auth),
        };
        const trades = await this.watch (url, messageHash, subscribe, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message) {
        //
        // {
        //     "event": "data",
        //     "channel": "private-user-trades-123-BTC_EUR",
        //     "payload": [
        //         {
        //             "transactionId": 123456,
        //             "date": 1234567890123,
        //             "amount": 0.5,
        //             "price": 30000,
        //             "buyOrderId": 123456,
        //             "sellOrderId": 123457,
        //             "orderType": "BUY",
        //             "type": "BUY",
        //             "fee": 15,
        //             "tradeFeeType": "MAKER",
        //             "currencyPair": "BTC_EUR",
        //             "clientOrderId": null
        //         }
        //     ]
        // }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const marketId = this.safeString (parts, 4);
        let symbol = undefined;
        let market = undefined;
        if (marketId !== undefined) {
            market = this.safeMarket (marketId, undefined, '_'); // Specify underscore delimiter
            symbol = market['symbol'];
        }
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            messageHash = 'myTrades:' + symbol;
        }
        const payload = this.safeValue (message, 'payload');
        // Handle both array and single object (if applicable)
        let trades = undefined;
        if (!Array.isArray (payload)) {
            trades = [ payload ];
        } else {
            trades = payload;
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const myTrades = this.myTrades;
        for (let i = 0; i < trades.length; i++) {
            const rawTrade = trades[i];
            const trade = this.parseWsMyTrade (rawTrade, market);
            myTrades.append (trade);
        }
        client.resolve (myTrades, messageHash);
    }

    parseWsMyTrade (trade, market = undefined) {
        //
        // {
        //     "transactionId": 123456,
        //     "date": 1234567890123,
        //     "amount": 0.5,
        //     "price": 30000,
        //     "buyOrderId": 123456,
        //     "sellOrderId": 123457,
        //     "orderType": "BUY",
        //     "type": "BUY",
        //     "fee": 15,
        //     "tradeFeeType": "MAKER",
        //     "currencyPair": "BTC_EUR",
        //     "clientOrderId": null
        // }
        //
        const id = this.safeString (trade, 'transactionId');
        const timestamp = this.safeInteger (trade, 'date');
        const marketId = this.safeString (trade, 'currencyPair');
        const symbol = this.safeSymbol (marketId, market, '_'); // Specify underscore delimiter
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const side = this.safeStringLower (trade, 'orderType');
        const orderId = this.safeString2 (trade, 'buyOrderId', 'sellOrderId');
        const feeCost = this.safeString (trade, 'fee');
        const takerOrMaker = this.safeStringLower (trade, 'tradeFeeType');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = (market !== undefined) ? market['quote'] : undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    handleMessage (client: Client, message) {
        const event = this.safeString (message, 'event');
        const handlers: Dict = {
            'data': this.handleData,
            'subscribe_success': this.handleSubscribeSuccess,
            'unsubscribe_success': this.handleUnsubscribeSuccess,
            'error': this.handleError,
            'ping': this.handlePing,
            'pong': this.handlePong,
        };
        const handler = this.safeValue (handlers, event);
        if (handler !== undefined) {
            handler.call (this, client, message);
        }
    }

    handleData (client: Client, message) {
        const channel = this.safeString (message, 'channel');
        if (channel !== undefined) {
            const parts = channel.split ('-');
            const channelType = this.safeString (parts, 0);
            const handlers: Dict = {
                'trades': this.handleTrades,
                'order_book': this.handleOrderBook,
                'statistics': this.handleTicker,
                'private': this.handlePrivateChannel,
            };
            const handler = this.safeValue (handlers, channelType);
            if (handler !== undefined) {
                handler.call (this, client, message);
            }
        }
    }

    handlePrivateChannel (client: Client, message) {
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const channelType = this.safeString (parts, 1);
        const handlers: Dict = {
            'user_balances': this.handleBalance,
            'open_orders': this.handleOrders,
            'user': this.handleUserChannel,
        };
        const handler = this.safeValue (handlers, channelType);
        if (handler !== undefined) {
            handler.call (this, client, message);
        }
    }

    handleUserChannel (client: Client, message) {
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('-');
        const channelType = this.safeString (parts, 2);
        if (channelType === 'trades') {
            this.handleMyTrades (client, message);
        }
    }

    handleSubscribeSuccess (client: Client, message) {
        return message;
    }

    handleUnsubscribeSuccess (client: Client, message) {
        return message;
    }

    handleError (client: Client, message) {
        //
        // {
        //     "event": "error",
        //     "message": "Authentication failed",
        //     "channel": "private-user_balances-123"
        // }
        //
        const errorMessage = this.safeString (message, 'message', '');
        const channel = this.safeString (message, 'channel');
        const feedback = this.id + ' ' + errorMessage + ' ' + JSON.stringify (message);
        try {
            // Check if it's an authentication error
            const lowerError = errorMessage.toLowerCase ();
            if (lowerError.includes ('auth') || lowerError.includes ('signature') || lowerError.includes ('invalid')) {
                throw new AuthenticationError (feedback);
            } else {
                throw new BadRequest (feedback);
            }
        } catch (error) {
            if (error instanceof AuthenticationError) {
                // Reject all pending subscriptions for private channels
                if (channel && channel.startsWith ('private')) {
                    client.reject (error, channel);
                }
                // Also reject the authenticated messageHash
                client.reject (error, 'authenticated');
            } else {
                // Reject the specific channel subscription
                if (channel) {
                    client.reject (error, channel);
                } else {
                    client.reject (error);
                }
            }
        }
    }

    ping (client: Client) {
        // Send a JSON ping message to keep connection alive
        // The server expects both client and server to send pings
        return { 'event': 'ping' };
    }

    handlePing (client: Client, message) {
        // Server sent us a ping, which means connection is alive
        // Update lastPong to prevent timeout
        client.lastPong = this.milliseconds ();
        client.send ({ 'event': 'pong' });
    }

    handlePong (client: Client, message) {
        // Server responded to our ping with pong
        // Update lastPong to show connection is alive
        client.lastPong = this.milliseconds ();
        return message;
    }
}
