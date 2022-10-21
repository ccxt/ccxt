'use strict';

//  ---------------------------------------------------------------------------

const ftxRest = require ('../ftx.js');
const { ExchangeError, AuthenticationError, ExchangeNotAvailable, InvalidNonce } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class ftx extends ftxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchOHLCV': false, // missing on the exchange side
                'watchBalance': false, // missing on the exchange side
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://{hostname}/ws',
                },
            },
            'options': {
                'ordersLimit': 1000,
                'tradesLimit': 1000,
            },
            'streaming': {
                // ftx does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping': this.ping,
                'keepAlive': 15000,
            },
            'exceptions': {
                'exact': {
                    'Internal server error': ExchangeNotAvailable,
                    'Invalid login credentials': AuthenticationError,
                    'Not logged in': AuthenticationError,
                },
            },
        });
    }

    async watchPublic (symbol, channel, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.implodeParams (this.urls['api']['ws'], { 'hostname': this.hostname });
        const request = {
            'op': 'subscribe',
            'channel': channel,
            'market': marketId,
        };
        const messageHash = channel + ':' + marketId;
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchPrivate (channel, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let messageHash = channel;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            messageHash = messageHash + ':' + market['id'];
        }
        await this.authenticate ();
        const url = this.implodeParams (this.urls['api']['ws'], { 'hostname': this.hostname });
        const request = {
            'op': 'subscribe',
            'channel': channel,
        };
        return await this.watch (url, messageHash, request, channel);
    }

    authenticate (params = {}) {
        const url = this.implodeParams (this.urls['api']['ws'], { 'hostname': this.hostname });
        const client = this.client (url);
        const authenticate = 'authenticate';
        const method = 'login';
        if (!(authenticate in client.subscriptions)) {
            this.checkRequiredCredentials ();
            client.subscriptions[authenticate] = true;
            const time = this.milliseconds ();
            const payload = time.toString () + 'websocket_login';
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'hex');
            const messageArgs = {
                'key': this.apiKey,
                'time': time,
                'sign': signature,
            };
            const options = this.safeValue (this.options, 'sign', {});
            const headerPrefix = this.safeString (options, this.hostname, 'FTX');
            const subaccount = this.safeString (this.headers, headerPrefix + '-SUBACCOUNT');
            if (subaccount !== undefined) {
                messageArgs['subaccount'] = subaccount;
            }
            const message = {
                'args': messageArgs,
                'op': method,
            };
            // ftx does not reply to this message
            const future = this.watch (url, method, message);
            future.resolve (true);
        }
        return client.future (method);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ftx#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        return await this.watchPublic (symbol, 'ticker');
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trades = await this.watchPublic (market['symbol'], 'trades');
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const orderbook = await this.watchPublic (symbol, 'orderbook');
        return orderbook.limit (limit);
    }

    handlePartial (client, message) {
        const methods = {
            'orderbook': this.handleOrderBookSnapshot,
        };
        const methodName = this.safeString (message, 'channel');
        const method = this.safeValue (methods, methodName);
        if (method) {
            method.call (this, client, message);
        }
    }

    handleUpdate (client, message) {
        const methods = {
            'trades': this.handleTrade,
            'ticker': this.handleTicker,
            'orderbook': this.handleOrderBookUpdate,
            'orders': this.handleOrder,
            'fills': this.handleMyTrade,
        };
        const methodName = this.safeString (message, 'channel');
        const method = this.safeValue (methods, methodName);
        if (method) {
            method.call (this, client, message);
        }
    }

    handleMessage (client, message) {
        const methods = {
            // ftx API docs say that all tickers and trades will be "partial"
            // however, in fact those are "update"
            // therefore we don't need to parse the "partial" update
            // since it is only used for orderbooks...
            // uncomment to fix if this is wrong
            // 'partial': this.handlePartial,
            'partial': this.handleOrderBookSnapshot,
            'update': this.handleUpdate,
            'subscribed': this.handleSubscriptionStatus,
            'unsubscribed': this.handleUnsubscriptionStatus,
            'info': this.handleInfo,
            'error': this.handleError,
            'pong': this.handlePong,
        };
        const methodName = this.safeString (message, 'type');
        const method = this.safeValue (methods, methodName);
        if (method) {
            method.call (this, client, message);
        }
    }

    getMessageHash (message) {
        const channel = this.safeString (message, 'channel');
        const marketId = this.safeString (message, 'market');
        return channel + ':' + marketId;
    }

    handleTicker (client, message) {
        //
        //     {
        //         channel: 'ticker',
        //         market: 'BTC/USD',
        //         type: 'update',
        //         data: {
        //             bid: 6652,
        //             ask: 6653,
        //             bidSize: 17.6608,
        //             askSize: 18.1869,
        //             last: 6655,
        //             time: 1585787827.3118029
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (message, 'market');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const ticker = this.parseTicker (data, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = this.getMessageHash (message);
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleOrderBookSnapshot (client, message) {
        //
        //     {
        //         channel: "orderbook",
        //         market: "BTC/USD",
        //         type: "partial",
        //         data: {
        //             time: 1585812237.6300597,
        //             checksum: 2028058404,
        //             bids: [
        //                 [6655.5, 21.23],
        //                 [6655, 41.0165],
        //                 [6652.5, 15.1985],
        //             ],
        //             asks: [
        //                 [6658, 48.8094],
        //                 [6659.5, 15.6184],
        //                 [6660, 16.7178],
        //             ],
        //             action: "partial"
        //         }
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const symbol = this.safeSymbol (marketId);
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            this.orderbooks[symbol] = this.orderBook ({}, 100);
        } else {
            orderbook.reset ({});
        }
        this.handleOrderBookUpdate (client, message);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookUpdate (client, message) {
        //
        //     {
        //         channel: "orderbook",
        //         market: "BTC/USD",
        //         type: "update",
        //         data: {
        //             time: 1585812417.4673214,
        //             checksum: 2215307596,
        //             bids: [[6668, 21.4066], [6669, 25.8738], [4498, 0]],
        //             asks: [],
        //             action: "update"
        //         }
        //     }
        //
        const messageHash = this.getMessageHash (message);
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const orderbook = this.orderbooks[symbol];
        const storedAsks = orderbook['asks'];
        const storedBids = orderbook['bids'];
        this.handleDeltas (storedAsks, this.safeValue (data, 'asks', []));
        this.handleDeltas (storedBids, this.safeValue (data, 'bids', []));
        const asksLength = storedAsks.length;
        const bidsLength = storedBids.length;
        const checksum = this.safeValue (this.options, 'checksum', true);
        if (checksum) {
            const payloadArray = [];
            for (let i = 0; i < 100; i++) {
                if (i < bidsLength) {
                    payloadArray.push (this.formatNumber (storedBids[i][0]));
                    payloadArray.push (this.formatNumber (storedBids[i][1]));
                }
                if (i < asksLength) {
                    payloadArray.push (this.formatNumber (storedAsks[i][0]));
                    payloadArray.push (this.formatNumber (storedAsks[i][1]));
                }
            }
            const payload = payloadArray.join (':');
            const responseChecksum = this.safeInteger (data, 'checksum');
            const localChecksum = this.crc32 (payload, false);
            if (responseChecksum !== localChecksum) {
                const error = new InvalidNonce (this.id + ' invalid checksum');
                client.reject (error, messageHash);
            }
        }
        // orderbook['nonce'] = u;
        const timestamp = this.safeTimestamp (data, 'time');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    formatNumber (n) {
        if (n >= 1e-4) {
            if (n % 1 === 0) {
                return n.toFixed (1);
            }
            return n.toString ();
        } else {
            return this.formatScientificNotationFTX (n);
        }
    }

    handleTrade (client, message) {
        //
        //     {
        //         channel:   "trades",
        //         market:   "BTC-PERP",
        //         type:   "update",
        //         data: [
        //             {
        //                 id:  33517246,
        //                 price:  6661.5,
        //                 size:  2.3137,
        //                 side: "sell",
        //                 liquidation:  false,
        //                 time: "2020-04-02T07:45:12.011352+00:00"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (message, 'market');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const messageHash = this.getMessageHash (message);
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            if (Array.isArray (data)) {
                const trades = this.parseTrades (data, market);
                for (let i = 0; i < trades.length; i++) {
                    stored.append (trades[i]);
                }
            } else {
                const trade = this.parseTrade (message, market);
                stored.append (trade);
            }
            client.resolve (stored, messageHash);
        }
        return message;
    }

    handleSubscriptionStatus (client, message) {
        // todo: handle unsubscription status
        // {'type': 'subscribed', 'channel': 'trades', 'market': 'BTC-PERP'}
        return message;
    }

    handleUnsubscriptionStatus (client, message) {
        // todo: handle unsubscription status
        // {'type': 'unsubscribed', 'channel': 'trades', 'market': 'BTC-PERP'}
        return message;
    }

    handleInfo (client, message) {
        // todo: handle info messages
        // Used to convey information to the user. Is accompanied by a code and msg field.
        // When our servers restart, you may see an info message with code 20001. If you do, please reconnect.
        return message;
    }

    handleError (client, message) {
        const errorMessage = this.safeString (message, 'msg');
        const Exception = this.safeValue (this.exceptions['exact'], errorMessage);
        if (Exception === undefined) {
            const error = new ExchangeError (errorMessage);
            client.reject (error);
        } else {
            if (Exception instanceof AuthenticationError) {
                const method = 'authenticate';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
            }
            const error = new Exception (errorMessage);
            // just reject the private api futures
            client.reject (error, 'fills');
            client.reject (error, 'orders');
        }
        return message;
    }

    ping (client) {
        // ftx does not support built-in ws protocol-level ping-pong
        // instead it requires a custom json-based text ping-pong
        // https://docs.ftx.com/#websocket-api
        return {
            'op': 'ping',
        };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const orders = await this.watchPrivate ('orders', symbol);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        // futures
        //
        //     {
        //         channel: 'orders',
        //         type: 'update',
        //         data: {
        //             id: 8047498974,
        //             clientId: null,
        //             market: 'ETH-PERP',
        //             type: 'limit',
        //             side: 'buy',
        //             price: 300,
        //             size: 0.1,
        //             status: 'closed',
        //             filledSize: 0,
        //             remainingSize: 0,
        //             reduceOnly: false,
        //             liquidation: false,
        //             avgFillPrice: null,
        //             postOnly: false,
        //             ioc: false,
        //             createdAt: '2020-08-22T14:35:07.861545+00:00'
        //         }
        //     }
        //
        // spot
        //
        //     {
        //         channel: 'orders',
        //         type: 'update',
        //         data: {
        //             id: 8048834542,
        //             clientId: null,
        //             market: 'ETH/USD',
        //             type: 'limit',
        //             side: 'buy',
        //             price: 300,
        //             size: 0.1,
        //             status: 'new',
        //             filledSize: 0,
        //             remainingSize: 0.1,
        //             reduceOnly: false,
        //             liquidation: false,
        //             avgFillPrice: null,
        //             postOnly: false,
        //             ioc: false,
        //             createdAt: '2020-08-22T15:17:32.184123+00:00'
        //         }
        //     }
        //
        const messageHash = this.safeString (message, 'channel');
        const data = this.safeValue (message, 'data');
        const order = this.parseOrder (data);
        const market = this.market (order['symbol']);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        client.resolve (orders, messageHash);
        const symbolMessageHash = messageHash + ':' + market['id'];
        client.resolve (orders, symbolMessageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ftx#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ftx api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const trades = await this.watchPrivate ('fills', symbol);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client, message) {
        //
        // future
        //
        //     {
        //         "channel": "fills",
        //         "type": "update"
        //         "data": {
        //             "fee": 78.05799225,
        //             "feeRate": 0.0014,
        //             "future": "BTC-PERP",
        //             "id": 7828307,
        //             "liquidity": "taker",
        //             "market": "BTC-PERP",
        //             "orderId": 38065410,
        //             "price": 3723.75,
        //             "side": "buy",
        //             "size": 14.973,
        //             "time": "2019-05-07T16:40:58.358438+00:00",
        //             "tradeId": 19129310,
        //             "type": "order"
        //         },
        //     }
        //
        // spot
        //
        //     {
        //         channel: 'fills',
        //         type: 'update',
        //         data: {
        //             baseCurrency: 'ETH',
        //             quoteCurrency: 'USD',
        //             feeCurrency: 'USD',
        //             fee: 0.0023439654,
        //             feeRate: 0.000665,
        //             future: null,
        //             id: 182349460,
        //             liquidity: 'taker'
        //             market: 'ETH/USD',
        //             orderId: 8049570214,
        //             price: 391.64,
        //             side: 'sell',
        //             size: 0.009,
        //             time: '2020-08-22T15:42:42.646980+00:00',
        //             tradeId: 90614141,
        //             type: 'order',
        //         }
        //     }
        //
        const messageHash = this.safeString (message, 'channel');
        const data = this.safeValue (message, 'data', {});
        const trade = this.parseTrade (data);
        const market = this.market (trade['symbol']);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const tradesCache = this.myTrades;
        tradesCache.append (trade);
        client.resolve (tradesCache, messageHash);
        const symbolMessageHash = messageHash + ':' + market['id'];
        client.resolve (tradesCache, symbolMessageHash);
    }
};
