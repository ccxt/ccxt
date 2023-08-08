
//  ---------------------------------------------------------------------------

import cryptocomRest from '../cryptocom.js';
import { AuthenticationError, NetworkError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class cryptocom extends cryptocomRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchMyTrades': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchOHLCV': true,
                'createOrderWs': true,
                'cancelOrderWs': true,
                'cancelAllOrders': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.crypto.com/exchange/v1/market',
                        'private': 'wss://stream.crypto.com/exchange/v1/user',
                    },
                },
                'test': {
                    'public': 'wss://uat-stream.3ona.co/exchange/v1/market',
                    'private': 'wss://uat-stream.3ona.co/exchange/v1/user',
                },
            },
            'options': {
            },
            'streaming': {
            },
        });
    }

    async pong (client, message) {
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        try {
            await client.send ({ 'id': this.safeInteger (message, 'id'), 'method': 'public/respond-heartbeat' });
        } catch (e) {
            const error = new NetworkError (this.id + ' pong failed with error ' + this.json (e));
            client.reset (error);
        }
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'book' + '.' + market['id'];
        const orderbook = await this.watchPublic (messageHash, params);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message) {
        // full snapshot
        //
        // {
        //     "instrument_name":"LTC_USDT",
        //     "subscription":"book.LTC_USDT.150",
        //     "channel":"book",
        //     "depth":150,
        //     "data": [
        //          {
        //              'bids': [
        //                  [122.21, 0.74041, 4]
        //              ],
        //              'asks': [
        //                  [122.29, 0.00002, 1]
        //              ]
        //              't': 1648123943803,
        //              's':754560122
        //          }
        //      ]
        // }
        //
        const messageHash = this.safeString (message, 'subscription');
        const marketId = this.safeString (message, 'instrument_name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let data = this.safeValue (message, 'data');
        data = this.safeValue (data, 0);
        const timestamp = this.safeInteger (data, 't');
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        snapshot['nonce'] = this.safeInteger (data, 's');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            const limit = this.safeInteger (message, 'depth');
            orderbook = this.orderBook ({}, limit);
        }
        orderbook.reset (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade' + '.' + market['id'];
        const trades = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     code: 0,
        //     method: 'subscribe',
        //     result: {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'trade.BTC_USDT',
        //       channel: 'trade',
        //       data: [
        //             {
        //                 "dataTime":1648122434405,
        //                 "d":"2358394540212355488",
        //                 "s":"SELL",
        //                 "p":42980.85,
        //                 "q":0.002325,
        //                 "t":1648122434404,
        //                 "i":"BTC_USDT"
        //              }
        //              (...)
        //       ]
        // }
        //
        const channel = this.safeString (message, 'channel');
        const marketId = this.safeString (message, 'instrument_name');
        const symbolSpecificMessageHash = this.safeString (message, 'subscription');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue (message, 'data', []);
        const dataLength = data.length;
        if (dataLength === 0) {
            return;
        }
        const parsedTrades = this.parseTrades (data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append (parsedTrades[j]);
        }
        const channelReplaced = channel.replace ('.' + marketId, '');
        client.resolve (stored, symbolSpecificMessageHash);
        client.resolve (stored, channelReplaced);
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-trade-instrument_name
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let messageHash = 'user.trade';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const trades = await this.watchPrivateSubscribe (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name cryptocom#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker' + '.' + market['id'];
        return await this.watchPublic (messageHash, params);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //     "info":{
        //        "instrument_name":"BTC_USDT",
        //        "subscription":"ticker.BTC_USDT",
        //        "channel":"ticker",
        //        "data":[
        //           {
        //              "i":"BTC_USDT",
        //              "b":43063.19,
        //              "k":43063.2,
        //              "a":43063.19,
        //              "t":1648121165658,
        //              "v":43573.912409,
        //              "h":43498.51,
        //              "l":41876.58,
        //              "c":1087.43
        //           }
        //        ]
        //     }
        //  }
        //
        const messageHash = this.safeString (message, 'subscription');
        const marketId = this.safeString (message, 'instrument_name');
        const market = this.safeMarket (marketId);
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const parsed = this.parseTicker (ticker, market);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            client.resolve (parsed, messageHash);
        }
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'candlestick' + '.' + interval + '.' + market['id'];
        const ohlcv = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //  {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'candlestick.1m.BTC_USDT',
        //       channel: 'candlestick',
        //       depth: 300,
        //       interval: '1m',
        //       data: [ [Object] ]
        //   }
        //
        const messageHash = this.safeString (message, 'subscription');
        const marketId = this.safeString (message, 'instrument_name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'interval');
        const timeframe = this.findTimeframe (interval);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const data = this.safeValue (message, 'data');
        for (let i = 0; i < data.length; i++) {
            const tick = data[i];
            const parsed = this.parseOHLCV (tick, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-order-instrument_name
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let messageHash = 'user.order';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const orders = await this.watchPrivateSubscribe (messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message, subscription = undefined) {
        //
        //    {
        //        "method": "subscribe",
        //        "result": {
        //          "instrument_name": "ETH_CRO",
        //          "subscription": "user.order.ETH_CRO",
        //          "channel": "user.order",
        //          "data": [
        //            {
        //              "status": "ACTIVE",
        //              "side": "BUY",
        //              "price": 1,
        //              "quantity": 1,
        //              "order_id": "366455245775097673",
        //              "client_oid": "my_order_0002",
        //              "create_time": 1588758017375,
        //              "update_time": 1588758017411,
        //              "type": "LIMIT",
        //              "instrument_name": "ETH_CRO",
        //              "cumulative_quantity": 0,
        //              "cumulative_value": 0,
        //              "avg_price": 0,
        //              "fee_currency": "CRO",
        //              "time_in_force":"GOOD_TILL_CANCEL"
        //            }
        //          ],
        //          "channel": "user.order.ETH_CRO"
        //        }
        //    }
        //
        const channel = this.safeString (message, 'channel');
        const symbolSpecificMessageHash = this.safeString (message, 'subscription');
        const orders = this.safeValue (message, 'data', []);
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            const parsed = this.parseOrders (orders);
            for (let i = 0; i < parsed.length; i++) {
                stored.append (parsed[i]);
            }
            client.resolve (stored, symbolSpecificMessageHash);
            // non-symbol specific
            client.resolve (stored, channel);
        }
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name cryptocom#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-balance
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const messageHash = 'user.balance';
        return await this.watchPrivateSubscribe (messageHash, params);
    }

    handleBalance (client: Client, message) {
        //
        //     {
        //         "id": 1,
        //         "method": "subscribe",
        //         "code": 0,
        //         "result": {
        //             "subscription": "user.balance",
        //             "channel": "user.balance",
        //             "data": [
        //                 {
        //                     "total_available_balance": "5.84684368",
        //                     "total_margin_balance": "5.84684368",
        //                     "total_initial_margin": "0",
        //                     "total_maintenance_margin": "0",
        //                     "total_position_cost": "0",
        //                     "total_cash_balance": "6.44412101",
        //                     "total_collateral_value": "5.846843685",
        //                     "total_session_unrealized_pnl": "0",
        //                     "instrument_name": "USD",
        //                     "total_session_realized_pnl": "0",
        //                     "position_balances": [
        //                         {
        //                             "quantity": "0.0002119875",
        //                             "reserved_qty": "0",
        //                             "collateral_weight": "0.9",
        //                             "collateral_amount": "5.37549592",
        //                             "market_value": "5.97277325",
        //                             "max_withdrawal_balance": "0.00021198",
        //                             "instrument_name": "BTC",
        //                             "hourly_interest_rate": "0"
        //                         },
        //                     ],
        //                     "total_effective_leverage": "0",
        //                     "position_limit": "3000000",
        //                     "used_position_limit": "0",
        //                     "total_borrow": "0",
        //                     "margin_score": "0",
        //                     "is_liquidating": false,
        //                     "has_risk": false,
        //                     "terminatable": true
        //                 }
        //             ]
        //         }
        //     }
        //
        const messageHash = this.safeString (message, 'subscription');
        const data = this.safeValue (message, 'data', []);
        const positionBalances = this.safeValue (data[0], 'position_balances', []);
        this.balance['info'] = data;
        for (let i = 0; i < positionBalances.length; i++) {
            const balance = positionBalances[i];
            const currencyId = this.safeString (balance, 'instrument_name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'quantity');
            account['used'] = this.safeString (balance, 'reserved_qty');
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
        client.resolve (this.balance, messageHash);
        const messageHashRequest = this.safeString (message, 'id');
        client.resolve (this.balance, messageHashRequest);
    }

    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#createOrderWs
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        params = this.createOrderRequest (symbol, type, side, amount, price, params);
        const request = {
            'method': 'private/create-order',
            'params': params,
        };
        const messageHash = this.nonce ();
        return await this.watchPrivateRequest (messageHash, request);
    }

    handleOrder (client: Client, message) {
        //
        //    {
        //        "id": 1,
        //        "method": "private/create-order",
        //        "code": 0,
        //        "result": {
        //            "client_oid": "c5f682ed-7108-4f1c-b755-972fcdca0f02",
        //            "order_id": "18342311"
        //        }
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        const rawOrder = this.safeValue (message, 'result', {});
        const order = this.parseOrder (rawOrder);
        client.resolve (order, messageHash);
    }

    async cancelOrderWs (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#cancelOrder
         * @description cancels an open order
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order
         * @param {string} id the order id of the order to cancel
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        params = this.extend ({
            'order_id': id,
        }, params);
        const request = {
            'method': 'private/cancel-order',
            'params': params,
        };
        const messageHash = this.nonce ();
        return await this.watchPrivateRequest (messageHash, request);
    }

    async cancelAllOrdersWs (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#cancelAllOrdersWs
         * @description cancel all open orders
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders
         * @param {string} symbol unified market symbol of the orders to cancel
         * @param {object} [params] extra parameters specific to the cryptocom api endpoint
         * @returns {object} Returns exchange raw message {@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'method': 'private/cancel-all-orders',
            'params': this.extend ({}, params),
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['params']['instrument_name'] = market['id'];
        }
        const messageHash = this.nonce ();
        return await this.watchPrivateRequest (messageHash, request);
    }

    handleCancelAllOrders (client: Client, message) {
        //
        //    {
        //        "id": 1688914586647,
        //        "method": "private/cancel-all-orders",
        //        "code": 0
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        client.resolve (message, messageHash);
    }

    async watchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce ();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [ messageHash ],
            },
            'nonce': id,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPrivateRequest (nonce, params = {}) {
        await this.authenticate ();
        const url = this.urls['api']['ws']['private'];
        const request = {
            'id': nonce,
            'nonce': nonce,
        };
        const message = this.extend (request, params);
        return await this.watch (url, nonce.toString (), message, true);
    }

    async watchPrivateSubscribe (messageHash, params = {}) {
        await this.authenticate ();
        const url = this.urls['api']['ws']['private'];
        const id = this.nonce ();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [ messageHash ],
            },
            'nonce': id,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleErrorMessage (client: Client, message) {
        //
        //    {
        //        id: 0,
        //        code: 10004,
        //        method: 'subscribe',
        //        message: 'invalid channel {"channels":["trade.BTCUSD-PERP"]}'
        //    }
        //
        const errorCode = this.safeString (message, 'code');
        try {
            if (errorCode && errorCode !== '0') {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue (message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
            return false;
        } catch (e) {
            if (e instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (e);
            }
            return true;
        }
    }

    handleSubscribe (client: Client, message) {
        const methods = {
            'candlestick': this.handleOHLCV,
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'book': this.handleOrderBookSnapshot,
            'user.order': this.handleOrders,
            'user.trade': this.handleTrades,
            'user.balance': this.handleBalance,
        };
        const result = this.safeValue2 (message, 'result', 'info');
        const channel = this.safeString (result, 'channel');
        if ((channel !== undefined) && channel.indexOf ('user.trade') > -1) {
            // channel might be user.trade.BTC_USDT
            this.handleTrades (client, result);
        }
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, result);
        }
    }

    handleMessage (client: Client, message) {
        //
        // ping
        //    {
        //        "id": 1587523073344,
        //        "method": "public/heartbeat",
        //        "code": 0
        //    }
        // auth
        //     { id: 1648132625434, method: 'public/auth', code: 0 }
        // ohlcv
        //    {
        //        code: 0,
        //        method: 'subscribe',
        //        result: {
        //          instrument_name: 'BTC_USDT',
        //          subscription: 'candlestick.1m.BTC_USDT',
        //          channel: 'candlestick',
        //          depth: 300,
        //          interval: '1m',
        //          data: [ [Object] ]
        //        }
        //      }
        // ticker
        //    {
        //        "info":{
        //           "instrument_name":"BTC_USDT",
        //           "subscription":"ticker.BTC_USDT",
        //           "channel":"ticker",
        //           "data":[ { } ]
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const method = this.safeString (message, 'method');
        const methods = {
            '': this.handlePing,
            'public/heartbeat': this.handlePing,
            'public/auth': this.handleAuthenticate,
            'private/create-order': this.handleOrder,
            'private/cancel-order': this.handleOrder,
            'private/cancel-all-orders': this.handleCancelAllOrders,
            'private/close-position': this.handleOrder,
            'subscribe': this.handleSubscribe,
        };
        const callMethod = this.safeValue (methods, method);
        if (callMethod !== undefined) {
            callMethod.call (this, client, message);
        }
    }

    authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const method = 'public/auth';
            const nonce = this.nonce ().toString ();
            const auth = method + nonce + this.apiKey + nonce;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            const request = {
                'id': nonce,
                'nonce': nonce,
                'method': method,
                'api_key': this.apiKey,
                'sig': signature,
            };
            const message = this.extend (request, params);
            future = this.watch (url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    handlePing (client: Client, message) {
        this.spawn (this.pong, client, message);
    }

    handleAuthenticate (client: Client, message) {
        //
        //  { id: 1648132625434, method: 'public/auth', code: 0 }
        //
        client.resolve (message, 'authenticated');
    }
}
