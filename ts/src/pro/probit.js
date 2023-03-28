'use strict';

//  ---------------------------------------------------------------------------

const probitRest = require ('../probit');
const { NotSupported, ExchangeError } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class probit extends probitRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.probit.com/api/exchange/v1/ws',
                },
                'test': {
                    'ws': 'wss://demo-api.probit.com/api/exchange/v1/ws',
                },
            },
            'options': {
                'watchOrderBook': {
                    'level': 'order_books',
                },
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name probit#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs-en.probit.com/reference/balance-1
         * @param {object} params extra parameters specific to the probit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.authenticate (params);
        const messageHash = 'balance';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'subscribe',
            'channel': 'balance',
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleBalance (client, message) {
        //
        //     {
        //         channel: 'balance',
        //         reset: false,
        //         data: {
        //             USDT: {
        //                 available: '15',
        //                 total: '15'
        //             }
        //         }
        //     }
        //
        const messageHash = 'balance';
        this.parseWSBalance (message);
        client.resolve (this.balance, messageHash);
    }

    parseWSBalance (message) {
        //
        //     {
        //         channel: 'balance',
        //         reset: false,
        //         data: {
        //             USDT: {
        //                 available: '15',
        //                 total: '15'
        //             }
        //         }
        //     }
        //
        const reset = this.safeValue (message, 'reset', false);
        const data = this.safeValue (message, 'data', {});
        const currencyIds = Object.keys (data);
        if (reset) {
            this.balance = {};
        }
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (data[currencyId], 'available');
            account['total'] = this.safeNumber (data[currencyId], 'total');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name probit#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs-en.probit.com/reference/marketdata
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the probit api endpoint
         * @param {int|undefined} params.interval Unit time to synchronize market information (ms). Available units: 100, 500
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeNumber (params, 'interval', 100);
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + symbol;
        const subscriptionHash = 'marketdata:' + symbol;
        const message = {
            'type': 'subscribe',
            'channel': 'marketdata',
            'market_id': market['id'],
            'interval': interval,
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, subscriptionHash, request);
    }

    handleTicker (client, message) {
        //
        //     {
        //         channel: 'marketdata',
        //         market_id: 'BTC-USDT',
        //         status: 'ok',
        //         lag: 0,
        //         ticker: {
        //             time: '2022-07-21T14:18:04.000Z',
        //             last: '22591.3',
        //             low: '22500.1',
        //             high: '39790.7',
        //             change: '-1224',
        //             base_volume: '1002.32005445',
        //             quote_volume: '23304489.385351021'
        //         },
        //         reset: true
        //     }
        //
        const marketId = this.safeString (message, 'market_id');
        const symbol = this.safeSymbol (marketId);
        const ticker = this.safeValue (message, 'ticker', {});
        const market = this.safeMarket (marketId);
        const parsedTicker = this.parseTicker (ticker, market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name probit#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs-en.probit.com/reference/trade_history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the probit api endpoint
         * @param {int|undefined} params.interval Unit time to synchronize market information (ms). Available units: 100, 500
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'trades:' + symbol;
        const interval = this.safeNumber (params, 'interval', 100);
        const subscriptionHash = 'marketdata:' + symbol;
        const message = {
            'channel': 'marketdata',
            'interval': interval,
            'market_id': market['id'],
            'type': 'subscribe',
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, subscriptionHash, request);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         channel: 'marketdata',
        //         market_id: 'BTC-USDT',
        //         status: 'ok',
        //         lag: 0,
        //         recent_trades: [
        //             {
        //                 id: 'BTC-USDT:8010233',
        //                 price: '22701.4',
        //                 quantity: '0.011011',
        //                 time: '2022-07-21T13:40:40.983Z',
        //                 side: 'buy',
        //                 tick_direction: 'up'
        //             }
        //             ...
        //         ]
        //         reset: true
        //     }
        //
        const marketId = this.safeString (message, 'market_id');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const trades = this.safeValue (message, 'recent_trades', []);
        const reset = this.safeValue (message, 'reset', false);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined || reset) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseTrade (trade, market);
            stored.append (parsed);
        }
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name probit#watchMyTrades
         * @description get the list of trades associated with the user
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the probit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const url = this.urls['api']['ws'];
        const messageHash = 'myTrades';
        const message = {
            'type': 'subscribe',
            'channel': 'trade_history',
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client, message) {
        //
        //     {
        //         channel: 'trade_history',
        //         reset: false,
        //         data: [{
        //             id: 'BTC-USDT:8010722',
        //             order_id: '4124999207',
        //             side: 'buy',
        //             fee_amount: '0.0134999868096',
        //             fee_currency_id: 'USDT',
        //             status: 'settled',
        //             price: '23136.7',
        //             quantity: '0.00032416',
        //             cost: '7.499992672',
        //             time: '2022-07-21T17:09:33.056Z',
        //             market_id: 'BTC-USDT'
        //         }]
        //     }
        //
        const rawTrades = this.safeValue (message, 'data', []);
        const reset = this.safeValue (message, 'reset', false);
        const messageHash = 'myTrades';
        if (this.myTrades === undefined || reset) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.myTrades;
        const trades = this.parseTrades (rawTrades);
        for (let j = 0; j < trades.length; j++) {
            const trade = trades[j];
            stored.append (trade);
        }
        client.resolve (this.myTrades, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name probit#watchOrders
         * @description watches information on an order made by the user
         * @see https://docs-en.probit.com/reference/open_order
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {int|undefined} since timestamp in ms of the earliest order to watch
         * @param {int|undefined} limit the maximum amount of orders to watch
         * @param {object} params extra parameters specific to the aax api endpoint
         * @param {string|undefined} params.channel choose what channel to use. Can open_order or order_history.
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const channel = this.safeString (params, 'channel', 'open_order');
        const subscribe = {
            'type': 'subscribe',
            'channel': channel,
        };
        const request = this.deepExtend (subscribe, params);
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //     {
        //         channel: 'order_history',
        //         reset: true,
        //         data: [{
        //                 id: '4124999207',
        //                 user_id: '633dc56a-621b-4680-8a4e-85a823499b6d',
        //                 market_id: 'BTC-USDT',
        //                 type: 'market',
        //                 side: 'buy',
        //                 limit_price: '0',
        //                 time_in_force: 'ioc',
        //                 filled_cost: '7.499992672',
        //                 filled_quantity: '0.00032416',
        //                 open_quantity: '0',
        //                 status: 'filled',
        //                 time: '2022-07-21T17:09:33.056Z',
        //                 client_order_id: '',
        //                 cost: '7.5'
        //             },
        //             ...
        //         ]
        //     }
        //
        const messageHash = 'orders';
        const rawOrders = this.safeValue (message, 'data', []);
        const reset = this.safeValue (message, 'reset', false);
        if (this.orders === undefined || reset) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        for (let i = 0; i < rawOrders.length; i++) {
            const rawOrder = rawOrders[i];
            const order = this.parseOrder (rawOrder);
            stored.append (order);
        }
        client.resolve (this.orders, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name probit#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs-en.probit.com/reference/marketdata
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the probit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + symbol;
        const interval = this.safeNumber (params, 'interval', 100);
        const subscriptionHash = 'marketdata:' + symbol;
        const message = {
            'channel': 'marketdata',
            'interval': interval,
            'market_id': market['id'],
            'type': 'subscribe',
        };
        const request = this.deepExtend (message, params);
        const orderbook = await this.watch (url, messageHash, request, subscriptionHash, request);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         channel: 'marketdata',
        //         market_id: 'BTC-USDT',
        //         status: 'ok',
        //         lag: 0,
        //         order_books: [
        //           { side: 'buy', price: '1420.7', quantity: '0.057' },
        //           ...
        //         ],
        //         reset: true
        //     }
        //
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const level = this.safeString (options, 'level', 'order_books');
        const orderBook = this.safeValue (message, level, []);
        const marketId = this.safeString (message, 'market_id');
        const symbol = this.safeSymbol (marketId);
        const dataBySide = this.groupBy (orderBook, 'side');
        const messageHash = 'orderbook:' + symbol;
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.orderBook ({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        const reset = this.safeValue (message, 'reset', false);
        if (reset) {
            const snapshot = this.parseOrderBook (dataBySide, symbol, undefined, 'buy', 'sell', 'price', 'quantity');
            storedOrderBook.reset (snapshot);
        } else {
            const asks = this.safeValue (dataBySide, 'sell', []);
            const bids = this.safeValue (dataBySide, 'buy', []);
            this.handleDeltas (storedOrderBook['asks'], asks);
            this.handleDeltas (storedOrderBook['bids'], bids);
        }
        client.resolve (storedOrderBook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'price', 'quantity');
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleErrorMessage (client, message) {
        //
        //     {
        //         errorCode: 'INVALID_ARGUMENT',
        //         message: '',
        //         details: {
        //             interval: 'invalid'
        //         }
        //     }
        //
        const code = this.safeString (message, 'errorCode');
        const errMessage = this.safeString (message, 'message', '');
        const details = this.safeValue (message, 'details');
        throw new ExchangeError (this.id + ' ' + code + ' ' + errMessage + ' ' + this.json (details));
    }

    handleAuthenticate (client, message) {
        //
        //     { type: 'authorization', result: 'ok' }
        //
        const future = client.futures['authenticated'];
        future.resolve (1);
        return message;
    }

    handleMarketData (client, message) {
        const ticker = this.safeValue (message, 'ticker');
        if (ticker !== undefined) {
            this.handleTicker (client, message);
        }
        const trades = this.safeValue (message, 'recent_trades');
        if (trades !== undefined) {
            this.handleTrades (client, message);
        }
        const orderBook = this.safeValueN (message, [ 'order_books', 'order_books_l1', 'order_books_l2', 'order_books_l3', 'order_books_l4' ], []);
        if (orderBook !== undefined) {
            this.handleOrderBook (client, message);
        }
    }

    handleMessage (client, message) {
        //
        //     {
        //         errorCode: 'INVALID_ARGUMENT',
        //         message: '',
        //         details: {
        //             interval: 'invalid'
        //         }
        //     }
        //
        const errorCode = this.safeString (message, 'errorCode');
        if (errorCode !== undefined) {
            return this.handleErrorMessage (client, message);
        }
        const type = this.safeString (message, 'type');
        if (type === 'authorization') {
            return this.handleAuthenticate (client, message);
        }
        const handlers = {
            'marketdata': this.handleMarketData,
            'balance': this.handleBalance,
            'trade_history': this.handleMyTrades,
            'open_order': this.handleOrders,
            'order_history': this.handleOrders,
        };
        const channel = this.safeString (message, 'channel');
        const handler = this.safeValue (handlers, channel);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        throw new NotSupported (this.id + ' handleMessage: unknown message: ' + this.json (message));
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        const expires = this.safeNumber (this.options, 'expires', 0);
        if (authenticated === undefined || this.milliseconds () > expires) {
            const response = await this.signIn ();
            //
            //     {
            //         access_token: '0ttDv/2hTTn3bLi8GP1gKaneiEQ6+0hOBenPrxNQt2s=',
            //         token_type: 'bearer',
            //         expires_in: 900
            //     }
            //
            const accessToken = this.safeString (response, 'access_token');
            const request = {
                'type': 'authorization',
                'token': accessToken,
            };
            this.spawn (this.watch, url, messageHash, this.extend (request, params), messageHash);
        }
        return await future;
    }
};
