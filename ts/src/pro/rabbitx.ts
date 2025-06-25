
import rabbitxRest from '../rabbitx.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Balances, Dict, Int, Order, Position, OrderBook, Str, Strings, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArgumentsRequired, BaseError, ExchangeError } from '../base/errors.js';

export default class rabbitx extends rabbitxRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'private': 'wss://api.prod.rabbitx.io/ws',
                    },
                },
                'test': {
                    'ws': {
                        'private': 'wss://api.testnet.rabbitx.io/ws',
                    },
                },
            },
            'options': {
                'requestId': 1,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'websocketChannels': {},
                'subscribedToAccountChannel': false,
                'watchFlags': {
                    'balance': false,
                    'orders': false,
                    'trades': false,
                    'positions': false,
                },
            },
            'requiredCredentials': {
                'jwtToken': true,
                'uid': true,
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000, // 30 seconds
            },
        });
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const jwtToken = this.jwtToken;
            const request: Dict = {
                'connect': {
                    'token': jwtToken,
                    'name': 'js',
                },
                'id': this.requestId (),
            };
            const message = this.extend (request, params);
            this.watch (url, messageHash, message, messageHash, message);
        }
        return await future;
    }

    /**
     * @method
     * @name rabbitx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.rabbitx.com/api-documentation/websocket/trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.authenticate ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const messageHash = 'trade:' + marketId;
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId ();
        const request = {
            'subscribe': {
                'channel': messageHash,
                'name': 'js',
            },
            'id': requestId,
        };
        this.setWebsocketChannel (requestId, messageHash);
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name rabbitx#watchOrderBook
     * @see https://docs.rabbitx.com/api-documentation/websocket/orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either (default) 'orderbook' or 'orderbookupdate', default is 'orderbook'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.authenticate ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const messageHash = 'orderbook:' + marketId;
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId ();
        const request = {
            'subscribe': {
                'channel': messageHash,
                'name': 'js',
            },
            'id': requestId,
        };
        this.setWebsocketChannel (requestId, messageHash);
        const subscription = {
            'id': request['id'].toString (),
            'symbol': symbol,
            'marketId': marketId,
            'limit': limit,
            'params': params,
            'method': this.handleOrderBookSubscription,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name rabbitx#watchTicker
     * @see https://docs.rabbitx.com/api-documentation/websocket/market-info
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.authenticate ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const messageHash = 'market:' + marketId;
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId ();
        const request = {
            'subscribe': {
                'channel': messageHash,
                'name': 'js',
            },
            'id': requestId,
        };
        this.setWebsocketChannel (requestId, messageHash);
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchAccount (params = {}): Promise<any> {
        await this.authenticate ();
        await this.loadMarkets ();
        const channel = 'account@' + this.uid;
        const url = this.urls['api']['ws']['private'];
        if (!this.subscribedToAccountChannel ()) {
            const requestId = this.requestId ();
            const request = {
                'subscribe': {
                    'channel': channel,
                    'name': 'js',
                },
                'id': requestId,
            };
            this.setWebsocketChannel (requestId, channel);
            const message = this.extend (request, params);
            this.setSubscribedToAccountChannel (true);
            await this.watch (url, channel, message, channel);
        }
        return await this.watch (url, channel, undefined, channel);
    }

    /**
     * @method
     * @name rabbitx#watchBalance
     * @see https://docs.rabbitx.com/api-documentation/websocket/account
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        this.setWatchFlag ('balance', true);
        await this.watchAccount (params);
        const channel = 'account@' + this.uid;
        return await this.watch (this.urls['api']['ws']['private'], channel, undefined, channel);
    }

    /**
     * @method
     * @name rabbitx#watchOrders
     * @see https://docs.rabbitx.com/api-documentation/websocket/account
     * @description watch information on multiple orders made by the user
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        this.setWatchFlag ('orders', true);
        await this.watchAccount (params);
        const channel = 'account@' + this.uid;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const orders = await this.watch (this.urls['api']['ws']['private'], channel, undefined, channel);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true) as Order[];
    }

    /**
     * @method
     * @name rabbitx#watchMyTrades
     * @see https://docs.rabbitx.com/api-documentation/websocket/account
     * @description watch the list of trades the user has made
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        this.setWatchFlag ('trades', true);
        await this.watchAccount (params);
        const channel = 'account@' + this.uid;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const trades = await this.watch (this.urls['api']['ws']['private'], channel, undefined, channel);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true) as Trade[];
    }

    /**
     * @method
     * @name rabbitx#watchPositions
     * @see https://docs.rabbitx.com/api-documentation/websocket/account
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        this.setWatchFlag ('positions', true);
        await this.watchAccount (params);
        const channel = 'account@' + this.uid;
        const positions = await this.watch (this.urls['api']['ws']['private'], channel, undefined, channel);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    requestId (): number {
        const currentId = this.safeInteger (this.options, 'requestId', 1);
        this.options['requestId'] = currentId + 1;
        return currentId;
    }

    jwtToken (): Str {
        const jwtToken = this.safeString (this.options, 'jwtToken');
        if (jwtToken === undefined) {
            throw new BaseError ('rabbitx requires a jwtToken to be set in the options');
        }
        return jwtToken;
    }

    websocketChannels () {
        return this.safeValue (this.options, 'websocketChannels', {});
    }

    getWebsocketChannel (requestId: Int): Str {
        const websocketChannels = this.websocketChannels ();
        const channel = this.safeString (websocketChannels, requestId);
        if (channel === undefined) {
            throw new BaseError (this.id + ' Invalid requestId: ' + requestId);
        }
        return channel;
    }

    setWebsocketChannel (requestId: Int, channel: Str) {
        const websocketChannels = this.websocketChannels ();
        if (websocketChannels[requestId] !== undefined) {
            throw new BaseError (this.id + ' requestId already exists: ' + requestId);
        }
        websocketChannels[requestId] = channel;
        this.options['websocketChannels'] = websocketChannels;
        return channel;
    }

    subscribedToAccountChannel (): boolean {
        return this.safeBool (this.options, 'subscribedToAccountChannel', false);
    }

    setSubscribedToAccountChannel (value: boolean) {
        this.options['subscribedToAccountChannel'] = value;
    }

    getWatchFlag (flag: Str): boolean {
        const watchFlags = this.safeValue (this.options, 'watchFlags', {});
        const flagValue = this.safeValue (watchFlags, flag);
        if (flagValue === undefined) {
            throw new BaseError (this.id + ' Invalid watch flag: ' + flag);
        }
        return flagValue;
    }

    setWatchFlag (flag: Str, value: boolean) {
        const watchFlags = this.safeValue (this.options, 'watchFlags', {});
        const flagValue = this.safeValue (watchFlags, flag);
        if (flagValue === undefined) {
            throw new ArgumentsRequired (this.id + ' Invalid watch flag: ' + flag);
        }
        this.options['watchFlags'][flag] = value;
        return value;
    }

    handleMessage (client: Client, message: any) {
        if (typeof message === 'string') {
            const lines = message.split ('\n');
            const filteredLines = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim ()) {
                    filteredLines.push (line);
                }
            }
            for (let i = 0; i < filteredLines.length; i++) {
                const line = filteredLines[i];
                try {
                    const parsed = JSON.parse (line);
                    this.handleParsedMessage (client, parsed);
                } catch (e) {
                    client.reject (e, 'Error parsing message: ' + line);
                }
            }
        } else {
            this.handleParsedMessage (client, message);
        }
    }

    handleParsedMessage (client: Client, message: any) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        // Handle ping (empty message)
        if (Object.keys (message).length === 0) {
            // Respond with empty frame as per RabbitX docs
            client.send ({});
            return;
        }
        const connect = this.safeValue (message, 'connect');
        if (connect !== undefined) {
            this.handleAuthResponse (client, message);
            return;
        }
        const subscribe = this.safeValue (message, 'subscribe');
        if (subscribe !== undefined) {
            const subscribeData = this.safeValue (subscribe, 'data');
            if (subscribeData !== undefined) {
                this.handleSubscriptionSnapshot (client, message);
                return;
            }
        }
        const push = this.safeValue (message, 'push');
        if (push !== undefined) {
            const pub = this.safeValue (push, 'pub');
            if (pub !== undefined) {
                const pubData = this.safeValue (pub, 'data');
                if (pubData !== undefined) {
                    this.handlePushUpdate (client, message);
                }
            }
        }
    }

    handleErrorMessage (client: Client, message: any): boolean {
        // { id: 1, error: { code: 109, message: 'token expired' }
        const errorMessage = this.safeString (message, 'error');
        if (errorMessage !== undefined) {
            const error = this.safeValue (message, 'error', {});
            const code = this.safeString (error, 'code');
            const messageText = this.safeString (error, 'message', 'Unknown error');
            const newErrorMessage = 'RabbitX error ' + code + ' : ' + messageText;
            const exchangeError = new ExchangeError (newErrorMessage);
            client.reject (exchangeError);
            return true;
        }
        return false;
    }

    handleAuthResponse (client: Client, message: any) {
        const messageHash = 'authenticated';
        const connectMessage = this.safeValue (message, 'connect', false);
        if (connectMessage) {
            const future = this.safeValue (client.futures, messageHash);
            if (future !== undefined) {
                future.resolve (true);
            }
            client.resolve (message, messageHash);
        } else {
            const error = new BaseError ('Authentication failed: ' + this.json (message));
            client.reject (error, messageHash);
        }
    }

    handleSubscriptionSnapshot (client: Client, message: any) {
        const requestId = this.safeInteger (message, 'id');
        const channel = this.getWebsocketChannel (requestId);
        const subscribe = this.safeValue (message, 'subscribe', {});
        const data = this.safeValue (subscribe, 'data', []);
        if (channel === undefined) {
            return;
        }
        if (channel.indexOf ('trade:') === 0) {
            const marketId = channel.replace ('trade:', '');
            this.handleTradesData (client, data, marketId, channel);
        } else if (channel.indexOf ('orderbook:') === 0) {
            const marketId = channel.replace ('orderbook:', '');
            this.handleOrderBookData (client, data, marketId, channel, true);
        } else if (channel.indexOf ('market:') === 0) {
            const marketId = channel.replace ('market:', '');
            this.handleTicker (client, data, marketId, channel, true);
        } else if (channel.indexOf ('account@') === 0) {
            this.handleAccountData (client, data, channel, true);
        }
    }

    handlePushUpdate (client: Client, message: any) {
        const push = this.safeValue (message, 'push', {});
        const pub = this.safeValue (push, 'pub', {});
        const channel = this.safeString (push, 'channel', '');
        const data = this.safeValue (pub, 'data', []);
        if (channel.indexOf ('trade:') === 0) {
            const marketId = channel.replace ('trade:', '');
            this.handleTradesData (client, data, marketId, channel);
        } else if (channel.indexOf ('orderbook:') === 0) {
            const marketId = channel.replace ('orderbook:', '');
            this.handleOrderBookData (client, data, marketId, channel);
        } else if (channel.indexOf ('market:') === 0) {
            const marketId = channel.replace ('market:', '');
            this.handleTicker (client, data, marketId, channel);
        } else if (channel.indexOf ('account@') === 0) {
            this.handleAccountData (client, data, channel, false);
        }
    }

    handleAccountData (client: Client, data: any, channel: string, isSnapshot: boolean) {
        if (this.getWatchFlag ('balance')) {
            const balance = this.safeValue (data, 'balance');
            const accountEquity = this.safeValue (data, 'account_equity');
            const withdrawableBalance = this.safeValue (data, 'withdrawable_balance');
            const hasBalanceData = balance !== undefined || accountEquity !== undefined || withdrawableBalance !== undefined;
            if (hasBalanceData || isSnapshot) {
                this.handleBalance (client, data);
            }
        }
        if (this.getWatchFlag ('orders')) {
            const rawOrders = this.safeValue (data, 'orders', []);
            if (rawOrders.length > 0 || isSnapshot) {
                if (this.orders === undefined || isSnapshot) {
                    const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                    this.orders = new ArrayCacheBySymbolById (limit);
                }
                for (let i = 0; i < rawOrders.length; i++) {
                    const parsed = this.parseOrder (rawOrders[i]);
                    this.orders.append (parsed);
                }
                client.resolve (this.orders, channel);
            }
        }
        if (this.getWatchFlag ('trades')) {
            const rawFills = this.safeValue (data, 'fills', []);
            if (rawFills.length > 0 || isSnapshot) {
                if (this.myTrades === undefined || isSnapshot) {
                    const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                    this.myTrades = new ArrayCacheBySymbolById (limit);
                }
                const trades = this.parseTrades (rawFills);
                for (let i = 0; i < trades.length; i++) {
                    this.myTrades.append (trades[i]);
                }
                client.resolve (this.myTrades, channel);
            }
        }
        if (this.getWatchFlag ('positions')) {
            const rawPositions = this.safeValue (data, 'positions', []);
            if (rawPositions.length > 0 || isSnapshot) {
                const positions = this.parsePositions (rawPositions);
                if (isSnapshot) {
                    this.positions = {};
                }
                for (let i = 0; i < positions.length; i++) {
                    const position = positions[i];
                    const symbol = position['symbol'];
                    this.positions[symbol] = position;
                }
                client.resolve (this.positions, channel);
            }
        }
    }

    handleBalance (client: Client, data: any) {
        // {
        //     id: 87116,
        //     profile_type: 'trader',
        //     status: 'active',
        //     wallet: '0x07527f6837e9f97fedd64f707a412053a768a810',
        //     last_update: '1749816971875211',
        //     balance: '998.93664',
        //     account_equity: '999.97364',
        //     total_position_margin: '22.23895',
        //     total_order_margin: '2',
        //     total_notional: '1072.523',
        //     account_margin: '0.9323563597237542',
        //     withdrawable_balance: '974.69769',
        //     cum_unrealized_pnl: '1.037',
        //     health: '0.9323563597237542',
        //     account_leverage: '1.0725512724515418',
        //     cum_trading_volume: '1283.119',
        //     leverage: [Object],
        //     last_liq_check: 0,
        //     mmf_total: '11.119475',
        //     acmf_total: '5.5597375',
        //     positions: [Array],
        //     orders: [Array]
        //   }
        if (!this.balance) {
            this.balance = this.account ();
        }
        const hasBalanceData = this.safeValue (data, 'balance') !== undefined || this.safeValue (data, 'account_equity') !== undefined || this.safeValue (data, 'withdrawable_balance') !== undefined;
        if (!hasBalanceData) {
            return;
        }
        const timestamp = this.safeIntegerProduct (data, 'last_update', 0.001);
        if (timestamp) {
            this.balance['timestamp'] = timestamp;
            this.balance['datetime'] = this.iso8601 (timestamp);
        }
        this.balance['info'] = this.extend (this.balance['info'], data);
        const accountBalance = this.safeString (data, 'balance');
        const withdrawableBalance = this.safeString (data, 'withdrawable_balance');
        const accountEquity = this.safeString (data, 'account_equity');
        const totalPositionMargin = this.safeString (data, 'total_position_margin');
        const totalOrderMargin = this.safeString (data, 'total_order_margin');
        if (accountBalance !== undefined) {
            const positionMargin = this.parseNumber (totalPositionMargin) || 0;
            const orderMargin = this.parseNumber (totalOrderMargin) || 0;
            const usedBalance = positionMargin + orderMargin;
            this.balance['USD'] = {
                'total': this.parseNumber (accountBalance),
                'free': this.parseNumber (withdrawableBalance) || this.parseNumber (accountBalance),
                'used': usedBalance,
            };
            if (accountEquity !== undefined) {
                this.balance['USD']['total'] = this.parseNumber (accountEquity);
            }
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    handleTradesData (client: Client, tradesData: any[], marketId: string, channel: string) {
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const parsedTrades = [];
        for (let i = 0; i < tradesData.length; i++) {
            const trade = tradesData[i];
            const parsedTrade = this.parseWsTrade (trade, market);
            parsedTrades.push (parsedTrade);
        }
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        for (let i = 0; i < parsedTrades.length; i++) {
            const trade = parsedTrades[i];
            tradesArray.append (trade);
        }
        client.resolve (tradesArray, channel);
    }

    handleOrderBookData (client: Client, orderBookData: any, marketId: string, channel: string, isSnapshot: boolean = false) {
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (isSnapshot) {
            if (!this.orderbooks[symbol]) {
                const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
                const subscription = this.safeValue (client.subscriptions, channel);
                const limit = this.safeInteger (subscription, 'limit', defaultLimit);
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeIntegerProduct (orderBookData, 'timestamp', 0.001);
            const snapshot = this.parseOrderBook (orderBookData, symbol, timestamp, 'bids', 'asks');
            orderbook.reset (snapshot);
            client.resolve (orderbook, channel);
        } else {
            this.handleOrderBookUpdate (client, orderBookData, marketId, channel);
        }
    }

    handleOrderBookUpdate (client: Client, updateData: any, marketId: string, channel: string) {
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return;
        }
        const sequence = this.safeInteger (updateData, 'sequence');
        const timestamp = this.safeIntegerProduct (updateData, 'timestamp', 0.001);
        if (orderbook['sequence'] !== undefined && sequence !== orderbook['sequence'] + 1) {
            delete this.orderbooks[symbol];
            delete client.subscriptions[channel];
            const error = new BaseError ('Orderbook sequence gap detected for ' + symbol + '. Resubscription required.');
            client.reject (error, channel);
            return;
        }
        try {
            const bids = this.safeValue (updateData, 'bids', []);
            const asks = this.safeValue (updateData, 'asks', []);
            this.handleDeltas (orderbook['bids'], bids);
            this.handleDeltas (orderbook['asks'], asks);
            orderbook['sequence'] = sequence;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, channel);
        } catch (e) {
            delete this.orderbooks[symbol];
            delete client.subscriptions[channel];
            client.reject (e, channel);
        }
    }

    handleOrderBookSubscription (client: Client, message: any, subscription: any) {
        const symbol = this.safeString (subscription, 'symbol');
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleDelta (bookside, delta) {
        // [price, size]
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    parseWsTicker (ticker, market = undefined) {
        let timestamp = this.safeIntegerProduct (ticker, 'last_update_time', 0.001);
        if (timestamp === undefined) {
            timestamp = this.milliseconds ();
        }
        const date = this.iso8601 (timestamp);
        const marketPrice = this.safeNumber (ticker, 'market_price');
        const baseVolume = this.safeNumber (ticker, 'average_daily_volume_q');
        const quoteVolume = (baseVolume !== undefined && marketPrice !== undefined) ? baseVolume * marketPrice : undefined;
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': date,
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeNumber (ticker, 'last_trade_price'),
            'last': this.safeNumber (ticker, 'last_trade_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
            'indexPrice': this.safeNumber (ticker, 'index_price'),
            'fairPrice': this.safeNumber (ticker, 'fair_price'),
            'fundingRate': this.safeNumber (ticker, 'instant_funding_rate'),
        }, market);
    }

    handleTicker (client: Client, message: any, marketId: string, channel: string, isSnapshot = false) {
        // {
        // id: 'ETH-USD',
        // status: 'active',
        // min_tick: '0.1',
        // min_order: '0.001',
        // best_bid: '2756.1',
        // best_ask: '2756.8',
        // market_price: '2756.45',
        // index_price: '2757.3',
        // last_trade_price: '2757.6',
        // fair_price: '2757.2',
        // instant_funding_rate: '0.00000853886691808073062591585254333584',
        // last_funding_rate_basis: '0.0000132423008647000449961690332970418',
        // last_update_time: '1749557487218428',
        // last_update_sequence: 1659090401,
        // average_daily_volume_q: '601.46',
        // last_funding_update_time: '1749556800634532',
        // icon_url: 'https://d3jcs7jdw2xltq.cloudfront.net/currencies/eth.svg',
        // market_title: 'Ethereum'
        // }
        const market = this.safeMarket (marketId);
        let parsed = undefined;
        const symbol = market['symbol'];
        if (isSnapshot) {
            parsed = this.parseWsTicker (message, market);
        } else {
            const ticker = this.safeDict (this.tickers, symbol, {});
            const rawTicker = this.safeDict (ticker, 'info', {});
            const merged = this.extend (rawTicker, message);
            parsed = this.parseWsTicker (merged, market);
        }
        this.tickers[symbol] = parsed;
        client.resolve (this.tickers[symbol], channel);
        return message;
    }

    parseWsTrade (trade: any, market = undefined): Trade {
        const marketId = this.safeString (trade, 'market_id');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        // {
        //     timestamp: '1749551371934818',
        //     price: '2690.1',
        //     size: '0.001',
        //     id: 'ETH-USD-64386336',
        //     liquidation: false,
        //     market_id: 'ETH-USD',
        //     taker_side: 'short'
        //   }
        const timestamp = this.safeIntegerProduct (trade, 'timestamp', 0.001);
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber (trade, 'size'),
            'side': this.safeString (trade, 'taker_side'),
            'type': undefined,
            'takerOrMaker': undefined,
            'cost': this.safeNumber (trade, 'price') * this.safeNumber (trade, 'size'),
            'fee': undefined,
            'info': trade,
        }, market);
    }

    ping (client: Client) {
        // RabbitX expects empty JSON object for ping
        return '{}';
    }
}
