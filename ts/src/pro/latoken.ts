//  ---------------------------------------------------------------------------

import latokenRest from '../latoken.js';
import { AuthenticationError, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
// import { Precise } from '../base/Precise.js';
// import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
//  ---------------------------------------------------------------------------

export default class latoken extends latokenRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchBalance': true,
                'watchStatus': false,
                'watchOrders': true,
                'watchMyTrades': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.latoken.com/stomp',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchBalance': {
                    'method': 'account', // can also be 'account/total'
                },
            },
        });
    }

    async getUserId () {
        let userId = this.safeString (this.options, 'userId');
        if (userId === undefined) {
            const response = await this.privateGetAuthUser ();
            //
            //    {
            //        id: 'a8c85783-59fc-4619-9c28-546f9b661e84',
            //        status: 'ACTIVE',
            //        role: 'INVESTOR',
            //        email: 'sam.germain@usask.ca',
            //        phone: '',
            //        authorities: [
            //          'VIEW_QUOTAS',
            //          'VIEW_TRANSFERS',
            //          'VIEW_ACCOUNT',
            //          'PLACE_ORDER',
            //          'VIEW_TRANSACTIONS',
            //          'CANCEL_ORDER',
            //          'VIEW_MARKET_DATA'
            //        ],
            //        forceChangePassword: null,
            //        authType: 'API_KEY',
            //        socials: []
            //    }
            //
            userId = this.safeString (response, 'id');
            this.options['userId'] = userId;
        }
        return userId;
    }

    async authenticate (params = {}) {
        /**
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        // const timestamp = this.numberToString (this.milliseconds ());
        // const url = this.urls['api']['ws']['private'];
        // const messageHash = 'authenticated';
        // const client = this.client (url);
        // let future = this.safeValue (client.subscriptions, messageHash);
        // if (future === undefined) {
        //     const accessPath = '/ws';
        //     const requestString = 'GET\n' + accessPath + '\nsignTimestamp=' + timestamp;
        //     const signature = this.hmac (this.encode (requestString), this.encode (this.secret), sha256, 'base64');
        //     const request = {
        //         'event': 'subscribe',
        //         'channel': [ 'auth' ],
        //         'params': {
        //             'key': this.apiKey,
        //             'signTimestamp': timestamp,
        //             'signature': signature,
        //             'signatureMethod': 'HmacSHA256',  // optional
        //             'signatureVersion': '2',          // optional
        //         },
        //     };
        //     const message = this.extend (request, params);
        //     future = await this.watch (url, messageHash, message);
        //     //
        //     //    {
        //     //        "data": {
        //     //            "success": true,
        //     //            "ts": 1645597033915
        //     //        },
        //     //        "channel": "auth"
        //     //    }
        //     //
        //     //    # Failure to return results
        //     //
        //     //    {
        //     //        "data": {
        //     //            "success": false,
        //     //            "message": "Authentication failed!",
        //     //            "ts": 1646276295075
        //     //        },
        //     //        "channel": "auth"
        //     //    }
        //     //
        //     client.subscriptions[messageHash] = future;
        // }
        // return future;
    }

    async subscribePublic (name: string, symbols: string[] = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {string} name name of the channel
         * @param {string[]} [symbols] CCXT market symbols
         * @param {object} [params] extra parameters specific to the latoken api
         * @returns {object} data from the websocket stream
         */
        await this.loadMarkets ();
        let channel = '/v1/' + name;
        if (symbols.length === 1) {
            const market = this.market (symbols[0]);
            channel = channel + '/' + market['base'] + '/' + market['quote'];
        }
        return await this.subscribe (name, channel, symbols, params);
    }

    async subscribePrivate (name: string, symbols: string[] = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @see https://api.latoken.com/doc/ws/#section/Authorization-Using-API-Key-Signature
         * @param {string} name name of the channel
         * @param {boolean} isPrivate true for the authenticated url, false for the public url
         * @param {[string]|undefined} symbols CCXT market symbols
         * @param {object} [params] extra parameters specific to the latoken api
         * @returns {object} data from the websocket stream
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const userId = await this.getUserId ();
        const channel = '/user/' + userId + '/v1/' + name;
        return await this.subscribe (name, channel, symbols, params);
    }

    async subscribe (name: string, channel: string, symbols: string[] = undefined, params = {}) {
        const messageHash = name + '::' + symbols.join (',');
        const subscribe = {
            'X-LA-DIGEST': 'HMAC-SHA512',
            'X-LA-SIGDATA': this.milliseconds (),
        };
        const request = this.extend (subscribe, params);
        const url = this.urls['api']['ws'];
        return await this.watch (url + channel, messageHash, request, name);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name latoken#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.latoken.com/doc/ws/#section/Tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the latoken api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        return await this.subscribePublic ('ticker', [ symbol ], params);
    }

    async watchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name latoken#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.latoken.com/doc/ws/#section/Tickers
         * @param {string[]} symbols not used by latoken fetchTickers
         * @param {object} [params] extra parameters specific to the latoken api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        symbols = this.marketSymbols (symbols);
        const newTickers = await this.subscribePublic ('ticker', symbols, params);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://api.latoken.com/doc/ws/#section/Trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        symbol = this.symbol (symbol);
        const trades = await this.subscribePublic ('trade', [ symbol ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api.latoken.com/doc/ws/#section/Books
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] not used by latoken watchOrderBook
         * @param {object} [params] extra parameters specific to the latoken api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const orderbook = await this.subscribePublic ('book', [ symbol ], params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://api.latoken.com/doc/ws/#section/Orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] not used by latoken watchOrders
         * @param {int} [limit] not used by latoken watchOrders
         * @param {object} [params] extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
        }
        const orders = await this.subscribePrivate ('order', [ symbol ], params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name latoken#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://api.latoken.com/doc/ws/#section/Accounts
         * @param {object} [params] extra parameters specific to the latoken api endpoint
         * @param {string} [params.method] 'account' (default) or 'account/total'
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const watchBalanceOptions = this.safeValue (this.options, 'watchBalance');
        let method = this.safeString (watchBalanceOptions, 'method', 'account');
        [ method, params ] = this.handleOptionAndParams (params, 'watchBalance', 'method', params);
        return await this.subscribePrivate (method, undefined, params);
    }

    handleTrade (client: Client, message) {
        //
        //    {
        //        "id": "3594a477-3633-4c35-8552-436ddb2dcff9",
        //        "timestamp": 1633705493102,
        //        "baseCurrency": "92151d82-df98-4d88-9a4d-284fa9eca49f",
        //        "quoteCurrency": "0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //        "direction": null,
        //        "price": "54540.41",
        //        "quantity": "0.05601",
        //        "cost": "3054.808364100000000000",
        //        "order": null,
        //        "makerBuyer": false
        //    }
        //
        const baseId = this.safeString (message, 'baseCurrency');
        if (baseId !== undefined) {
            const trade = this.parseTrade (message);
            const symbol = trade['symbol'];
            const messageHash = 'trade::' + symbol;
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (tradesLimit);
                this.trades[symbol] = tradesArray;
            }
            tradesArray.append (trade);
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    parseStatus (status) {
        // TODO
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'PENDING_CANCEL': 'open',
            'PARTIALLY_CANCELED': 'open',
            'CANCELED': 'canceled',
            // FAILED
        };
        return this.safeString (statuses, status, status);
    }

    handleOrder (client: Client, message) {
        //
        //    {
        //        "id": "9357f2bd-15fb-4e0a-a8fb-109a73881f04",
        //        "user": "cd272f3f-585d-46fb-9ae6-487f66738073",
        //        "changeType": "ORDER_CHANGE_TYPE_UNCHANGED",
        //        "status": "ORDER_STATUS_CLOSED",
        //        "side": "ORDER_SIDE_SELL",
        //        "condition": "ORDER_CONDITION_GOOD_TILL_CANCELLED",
        //        "type": "ORDER_TYPE_LIMIT",
        //        "baseCurrency": "620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //        "quoteCurrency": "0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //        "clientOrderId": "mobile-Android_1.82.00",
        //        "price": "2258.58",
        //        "quantity": "0.5",
        //        "cost": "1129.290000000000000000",
        //        "filled": "0.500000000000000000",
        //        "deltaFilled": "0",
        //        "timestamp": 1624223076593,
        //        "rejectError": null,
        //        "rejectComment": null,
        //        "creator": "",
        //        "creatorId": ""
        //    }
        //
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const baseCurrency = this.safeString (message, 'baseCurrency');
        if (baseCurrency !== undefined) {
            const parsed = this.parseOrder (message);
            const symbol = parsed['symbol'];
            orders.append (parsed);
            client.resolve (orders, 'order::');
            client.resolve (orders, 'order::' + symbol);
        }
        return message;
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        "baseCurrency": "6ae140a9-8e75-4413-b157-8dd95c711b23",
        //        "quoteCurrency": "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //        "volume24h": "0.000",
        //        "volume7d": "40000.000",
        //        "change24h": "0.0000",
        //        "change7d": "0.0000",
        //        "lastPrice": "10000.00"
        //    }
        //
        const baseCurrency = this.safeString (message, 'baseCurrency');
        let ticker = undefined;
        if (baseCurrency !== undefined) {
            ticker = this.parseTicker (message);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
        }
        const messageHashes = this.findMessageHashes (client, 'ticker::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (this.inArray (symbols, tickerSymbol)) {
                client.resolve (ticker, messageHash);
            }
        }
        client.resolve (ticker, 'ticker::');
        return message;
    }

    handleOrderBook (client: Client, message) {
        // TODO: how would this be done? no symbol returned
        //
        //    {
        //        "ask": [],
        //        "bid": [
        //            {
        //                "price": "54464.69",
        //                "quantityChange": "-0.07972",
        //                "costChange": "-4341.9250868",
        //                "quantity": "0.00000",
        //                "cost": "0.00"
        //            },
        //            {
        //                "price": "54442.80",
        //                "quantityChange": "0.08927",
        //                "costChange": "4860.108756",
        //                "quantity": "0.08927",
        //                "cost": "4860.108756"
        //            }
        //        ]
        //    }
        //
        // const marketId = this.safeString (item, 'symbol');
        // const market = this.safeMarket (marketId);
        // const symbol = market['symbol'];
        // const name = 'book_lv2';
        // const messageHash = name + '::' + symbol;
        // const subscription = this.safeValue (client.subscriptions, messageHash, {});
        // const limit = this.safeInteger (subscription, 'limit');
        // const timestamp = this.safeInteger (item, 'ts');
        // const asks = this.safeValue (item, 'asks');
        // const bids = this.safeValue (item, 'bids');
        // if (snapshot || update) {
        //     if (snapshot) {
        //         this.orderbooks[symbol] = this.orderBook ({}, limit);
        //     }
        //     const orderbook = this.orderbooks[symbol];
        //     if (bids !== undefined) {
        //         for (let i = 0; i < bids.length; i++) {
        //             const bid = this.safeValue (bids, i);
        //             const price = this.safeNumber (bid, 0);
        //             const amount = this.safeNumber (bid, 1);
        //             orderbook['bids'].store (price, amount);
        //         }
        //     }
        //     if (asks !== undefined) {
        //         for (let i = 0; i < asks.length; i++) {
        //             const ask = this.safeValue (asks, i);
        //             const price = this.safeNumber (ask, 0);
        //             const amount = this.safeNumber (ask, 1);
        //             orderbook['asks'].store (price, amount);
        //         }
        //     }
        //     orderbook['symbol'] = symbol;
        //     orderbook['timestamp'] = timestamp;
        //     orderbook['datetime'] = this.iso8601 (timestamp);
        //     client.resolve (orderbook, messageHash);
        // }
        return message;
    }

    handleBalance (client: Client, message) {
        //
        //    {
        //        "id": "78981848-7212-4ea7-8962-def1d9622b1a",
        //        "status": "ACCOUNT_STATUS_ACTIVE",
        //        "type": "ACCOUNT_TYPE_WALLET",
        //        "timestamp": 1567440985920,
        //        "currency": "3c8e239a-3dae-4a7b-8a2f-92ff1a4b59de",
        //        "available": "1051.706210340207461900",
        //        "blocked": "0.000000000000000000",
        //        "user": "dc274e1d-393e-9333-faef66738073"
        //    }
        //
        const type = this.safeString (message, 'type');
        this.balance = this.parseBalance (message, type);  // TODO: parse type
        client.resolve (this.balance, 'account::');
        client.resolve (this.balance, 'account/total::');
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const buy = this.safeValue (message, 'buy');
        const volume24h = this.safeString (message, 'volume24h');
        const makerBuyer = this.safeValue (message, 'makerBuyer');
        const condition = this.safeString (message, 'condition');
        const available = this.safeString (message, 'available');
        if (buy !== undefined) {
            return this.handleOrderBook (client, message);
        }
        if (volume24h !== undefined) {
            return this.handleTicker (client, message);
        }
        if (makerBuyer !== undefined) {
            return this.handleTrade (client, message);
        }
        if (condition !== undefined) {
            return this.handleOrder (client, message);
        }
        if (available !== undefined) {
            return this.handleBalance (client, message);
        }
        // if (type === 'auth') {
        //     this.handleAuthenticate (client, message);
        // }
    }

    handleErrorMessage (client: Client, message) {
        // TODO
        //
        // { message: 'Invalid channel value ["ordersss"]', event: 'error' }
        const event = this.safeString (message, 'event');
        if (event === 'error') {
            const error = this.safeString (message, 'message');
            throw new ExchangeError (this.id + ' error: ' + this.json (error));
        }
        return false;
    }

    handleAuthenticate (client: Client, message) {
        // TODO
        //
        //    {
        //        success: true,
        //        ret_msg: '',
        //        op: 'auth',
        //        conn_id: 'ce3dpomvha7dha97tvp0-2xh'
        //    }
        //
        const data = this.safeValue (message, 'data');
        const success = this.safeValue (data, 'success');
        const messageHash = 'authenticated';
        if (success) {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }
}

