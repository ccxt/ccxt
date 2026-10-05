//  ---------------------------------------------------------------------------

import coinbaseinternationalRest from '../coinbaseinternational.js';
import { ExchangeError, NotSupported, ArgumentsRequired } from '../base/errors.js';
import { Ticker, Int, Str, Trade, OrderBook, Market, Dict, Strings, FundingRate, FundingRates, Tickers, OHLCV, Bool, Balances, Order, Position, OrderType, OrderSide, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class coinbaseinternational extends coinbaseinternationalRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchTicker': true,
                'watchBidsAsks': true,
                'watchBalance': true,
                'watchFundingRate': true,
                'watchFundingRates': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': true,
                'watchOrdersForSymbols': true,
                'watchPositions': true,
                'watchTickers': true,
                'watchMarkPrice': true,
                'watchMarkPrices': true,
                'unWatchMarkPrice': true,
                'unWatchMarkPrices': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
                'unWatchOHLCV': true,
                'unWatchOHLCVForSymbols': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'unWatchPositions': true,
                'unWatchTickers': true,
                'unWatchBidsAsks': true,
                'unWatchFundingRate': true,
                'unWatchFundingRates': true,
                'unWatchMyTrades': true,
                'unWatchTicker': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': true,
                'fetchOrderWs': true,
                'fetchOpenOrdersWs': true,
                'fetchOrdersWs': true,
                'fetchBalanceWs': true,
                'fetchMyTradesWs': true,
                'fetchPositionsWs': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://streams.drb.coinbase.com/ws/api/v2',
                    'wsPrivate': 'wss://drb.coinbase.com/ws/api/v2',
                },
            },
            'streaming': {
                'keepAlive': 15000, // idle sockets are closed (1011) after ~30s without client messages, see ping()
            },
            'options': {
                'wsAuthRefreshRatio': 0.8, // re-authenticate the private socket after 80% of the session lifetime
                'ws': {
                    'timeframes': {
                        '1m': '1',
                        '5m': '5',
                        '15m': '15',
                        '30m': '30',
                        '1h': '60',
                        '2h': '120',
                        '6h': '360',
                        '1d': '1D',
                    },
                    'watchTradesForSymbols': {
                        'interval': '100ms',
                    },
                    'watchOrderBookForSymbols': {
                        'interval': '100ms',
                        'useDepthEndpoint': false,
                        'depth': '20',
                        'group': 'none',
                    },
                },
                'currencies': [ 'BTC', 'ETH', 'SOL', 'USDC', 'USDT' ],
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    getWsUrl (isPrivate = false): string {
        if (this.isNativeDeribitCredentials ()) {
            return 'wss://www.deribit.com/ws/api/v2';
        }
        if (isPrivate) {
            return this.urls['api']['wsPrivate'];
        }
        return this.urls['api']['ws'];
    }

    override ping (client: Client): Dict | Str {
        const refreshAt = this.safeInteger (this.options, 'wsAuthRefreshAt');
        const isPrivateClient = (client.url === this.getWsUrl (true));
        if (isPrivateClient && (refreshAt !== undefined) && (this.milliseconds () >= refreshAt)) {
            // re-authenticate in-band before the session expires, also while no watch call is pending
            // retry in 60s if this attempt fails; a successful reply reschedules via handleAuthenticationMessage
            this.options['wsAuthRefreshAt'] = this.sum (this.milliseconds (), 60000);
            const requestId = this.requestId ();
            this.options['wsAuthRequestId'] = requestId;
            let params: Dict = {
                'grant_type': 'client_credentials',
                'client_id': this.apiKey,
                'client_secret': this.secret,
            };
            if (!this.isNativeDeribitCredentials ()) {
                params = {
                    'grant_type': 'coinbase_cdp',
                    'token': this.createAuthToken (this.seconds (), undefined, undefined, this.isEddsaSecret ()),
                };
            }
            return {
                'jsonrpc': '2.0',
                'id': requestId,
                'method': 'public/auth',
                'params': params,
            };
        }
        // the gateway closes a socket after ~30s without client messages; protocol-level pings do not count
        return {
            'jsonrpc': '2.0',
            'id': this.requestId (),
            'method': 'public/test',
            'params': {},
        };
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#subscribe
     * @description subscribes to websocket channels
     * @see https://docs.deribit.com/api-reference/subscription-management/public-subscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-subscribe
     * @param {string[]} channels exchange channel names
     * @param {string[]} messageHashes message hashes to resolve
     * @param {boolean} [isPrivate] whether to authenticate and subscribe privately
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the subscription result
     */
    async subscribe (channels: string[], messageHashes: string[], isPrivate = false, params = {}) {
        const paramsResolved = this.handleRouteAndParams ('subscribe', params);
        let url = this.getWsUrl (false);
        let method = 'public/subscribe';
        if (isPrivate) {
            url = this.getWsUrl (true);
            method = 'private/subscribe';
            await this.authenticate ();
        }
        if (url === undefined) {
            throw new NotSupported (this.id + ' websocket is not supported');
        }
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': method,
            'params': {
                'channels': channels,
            },
            'id': this.requestId (),
        };
        const extendedRequest = this.deepExtend (request, paramsResolved);
        const channelsLength = channels.length;
        if (channelsLength === 1) {
            return await this.watch (url, messageHashes[0], extendedRequest, channels[0], extendedRequest);
        }
        return await this.watchMultiple (url, messageHashes, extendedRequest, channels, extendedRequest);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#unSubscribe
     * @description unsubscribes from websocket channels
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string[]} channels exchange channel names
     * @param {boolean} [isPrivate] whether to authenticate and unsubscribe privately
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {boolean} true when unsubscription has been requested
     */
    async unSubscribe (channels: string[], isPrivate = false, params = {}) {
        const paramsResolved = this.handleRouteAndParams ('unSubscribe', params);
        let url = this.getWsUrl (false);
        let method = 'public/unsubscribe';
        if (isPrivate) {
            url = this.getWsUrl (true);
            method = 'private/unsubscribe';
            await this.authenticate ();
        }
        const unWatchMessageHashes: string[] = [];
        const channelsLength = channels.length;
        for (let i = 0; i < channelsLength; i++) {
            unWatchMessageHashes.push ('unsubscribe:' + channels[i]);
        }
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': method,
            'params': {
                'channels': channels,
            },
            'id': this.requestId (),
        };
        const client = this.client (url);
        this.watchMultiple (url, unWatchMessageHashes, this.deepExtend (request, paramsResolved), unWatchMessageHashes);
        for (let i = 0; i < channelsLength; i++) {
            this.cleanUnsubscription (client, channels[i], unWatchMessageHashes[i]);
        }
        return true;
    }

    /**
     * @method
     * @name coinbaseinternational#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userportfoliocurrency
     * @see https://docs.deribit.com/subscriptions/user/userportfoliocurrency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.currency] currency code to watch, default is any
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async watchBalance (params = {}): Promise<Balances> {
        const paramsResolved = this.handleRouteAndParams ('watchBalance', params);
        const [ currency, paramsCurrency ] = this.handleOptionAndParams (paramsResolved, 'watchBalance', 'currency', 'any');
        const channel = 'user.portfolio.' + currency;
        return await this.subscribe ([ channel ], [ 'balance' ], true, paramsCurrency);
    }

    handleBalance (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const parsed = this.parseBalance (data);
        this.balance = this.deepExtend (this.balance, parsed);
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name coinbaseinternational#watchMyTrades
     * @description watches trades associated with the user
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/usertradesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const paramsResolved = this.handleRouteAndParams ('watchMyTrades', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchMyTrades', 'interval', 'raw');
        let channel = 'user.trades.any.any.' + interval;
        let symbolResolved: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbolResolved = market['symbol'];
            channel = 'user.trades.' + market['id'] + '.' + interval;
        }
        const trades = await this.subscribe ([ channel ], [ channel ], true, paramsInterval);
        return this.filterBySymbolSinceLimit (trades, symbolResolved, since, limit, true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchMyTrades
     * @description stops watching user trades
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchMyTrades', params);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchMyTrades', 'interval', 'raw');
        let channel = 'user.trades.any.any.' + interval;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            channel = 'user.trades.' + this.marketId (symbol) + '.' + interval;
        }
        return await this.unSubscribe ([ channel ], true, paramsInterval);
    }

    handleMyTrades (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const channel = this.safeString (params, 'channel');
        const data = this.safeList (params, 'data', []);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'myTradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.parseTrades (data);
        const tradesLength = trades.length;
        for (let i = 0; i < tradesLength; i++) {
            this.myTrades.append (trades[i]);
        }
        client.resolve (this.myTrades, channel);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrders
     * @description watches information on orders made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/user/userordersinstrument_nameinterval
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const paramsResolved = this.handleRouteAndParams ('watchOrders', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchOrders', 'interval', 'raw');
        let channel = 'user.orders.any.any.' + interval;
        let symbolResolved: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbolResolved = market['symbol'];
            channel = 'user.orders.' + market['id'] + '.' + interval;
        }
        const orders = await this.subscribe ([ channel ], [ channel ], true, paramsInterval);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbolResolved, since, limitResolved, true);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrdersForSymbols
     * @description watches information on orders made by the user for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/user/userordersinstrument_nameinterval
     * @param {string[]} symbols unified market symbols
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrdersForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const paramsResolved = this.handleRouteAndParams ('watchOrdersForSymbols', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchOrders', 'interval', 'raw');
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            channels.push ('user.orders.' + this.marketId (symbolsResolved[i]) + '.' + interval);
        }
        const orders = await this.subscribe (channels, channels, true, paramsInterval);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (undefined, limit);
        }
        const ordersForSymbols = this.filterByArray (orders, 'symbol', symbolsResolved, false);
        return this.filterBySinceLimit (ordersForSymbols, since, limitResolved, 'timestamp', true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOrders
     * @description stops watching user orders
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchOrders', params);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchOrders', 'interval', 'raw');
        let channel = 'user.orders.any.any.' + interval;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            channel = 'user.orders.' + this.marketId (symbol) + '.' + interval;
        }
        return await this.unSubscribe ([ channel ], true, paramsInterval);
    }

    handleOrders (client: Client, message: any) {
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const params = this.safeDict (message, 'params', {});
        const channel = this.safeString (params, 'channel');
        const data = this.safeValue (params, 'data', {});
        let orders: Order[] = [];
        if (Array.isArray (data)) {
            orders = this.parseOrders (data) as Order[];
        } else {
            orders = [ this.parseOrder (data) ];
        }
        const ordersLength = orders.length;
        for (let i = 0; i < ordersLength; i++) {
            this.orders.append (orders[i]);
        }
        client.resolve (this.orders, channel);
    }

    /**
     * @method
     * @name coinbaseinternational#watchPositions
     * @description watches all open positions
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userchangesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/user/userchangesinstrument_nameinterval
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        const paramsResolved = this.handleRouteAndParams ('watchPositions', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchPositions', 'interval', 'raw');
        const channels: string[] = [];
        let symbolsLength = 0;
        if (symbolsResolved !== undefined) {
            symbolsLength = symbolsResolved.length;
        }
        if ((symbolsResolved !== undefined) && (symbolsLength > 0)) {
            for (let i = 0; i < symbolsLength; i++) {
                channels.push ('user.changes.' + this.marketId (symbolsResolved[i]) + '.' + interval);
            }
        } else {
            channels.push ('user.changes.any.any.' + interval);
        }
        const positions = await this.subscribe (channels, channels, true, paramsInterval);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbolsResolved, since, limit, true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchPositions
     * @description stops watching open positions
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchPositions', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchPositions', 'interval', 'raw');
        const channels: string[] = [];
        let symbolsLength = 0;
        if (symbolsResolved !== undefined) {
            symbolsLength = symbolsResolved.length;
        }
        if ((symbolsResolved !== undefined) && (symbolsLength > 0)) {
            for (let i = 0; i < symbolsLength; i++) {
                channels.push ('user.changes.' + this.marketId (symbolsResolved[i]) + '.' + interval);
            }
        } else {
            channels.push ('user.changes.any.any.' + interval);
        }
        return await this.unSubscribe (channels, true, paramsInterval);
    }

    handlePositions (client: Client, message: any) {
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const params = this.safeDict (message, 'params', {});
        const channel = this.safeString (params, 'channel');
        const data = this.safeDict (params, 'data', {});
        const rawPositions = this.safeList (data, 'positions', []);
        const positions = this.parsePositions (rawPositions);
        const positionsLength = positions.length;
        for (let i = 0; i < positionsLength; i++) {
            this.positions.append (positions[i]);
        }
        client.resolve (this.positions, channel);
    }

    /**
     * @method
     * @name coinbaseinternational#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        const paramsResolved = this.handleRouteAndParams ('watchFundingRate', params);
        const ticker = await this.watchTicker (symbol, paramsResolved);
        return this.parseFundingRate (ticker['info'], this.market (symbol));
    }

    /**
     * @method
     * @name coinbaseinternational#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string[]} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    override async watchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        const paramsResolved = this.handleRouteAndParams ('watchFundingRates', params);
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchFundingRates() requires an array of symbols');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const tickers = await this.watchTickers (symbols, paramsResolved);
        const result: Dict = {};
        const tickerSymbols = Object.keys (tickers);
        const tickerSymbolsLength = tickerSymbols.length;
        for (let i = 0; i < tickerSymbolsLength; i++) {
            const symbol = tickerSymbols[i];
            const ticker = tickers[symbol];
            result[symbol] = this.parseFundingRate (ticker['info'], this.market (symbol));
        }
        return result;
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchFundingRate
     * @description stops watching the funding rate for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchFundingRate (symbol: string, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchFundingRate', params);
        return await this.unWatchTicker (symbol, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchFundingRates
     * @description stops watching funding rates for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchFundingRates (symbols: Strings = undefined, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchFundingRates', params);
        return await this.unWatchTickers (symbols, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        const paramsResolved = this.handleRouteAndParams ('watchTicker', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchTicker', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const channel = 'ticker.' + market['id'] + '.' + interval;
        return await this.subscribe ([ channel ], [ channel ], isPrivate, paramsInterval);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTicker
     * @description stops watching a ticker
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchTicker (symbol: string, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchTicker', params);
        return await this.unWatchTickers ([ symbol ], paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        const paramsResolved = this.handleRouteAndParams ('watchTickers', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchTickers', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            const market = this.market (symbolsResolved[i]);
            channels.push ('ticker.' + market['id'] + '.' + interval);
        }
        const ticker = await this.subscribe (channels, channels, isPrivate, paramsInterval);
        if (this.newUpdates) {
            const result: Dict = {};
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (tickerSymbol !== undefined) {
                result[tickerSymbol] = ticker;
            }
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbolsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTickers
     * @description stops watching tickers
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchTickers', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchTickers', 'interval', '100ms');
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            channels.push ('ticker.' + this.marketId (symbolsResolved[i]) + '.' + interval);
        }
        return await this.unSubscribe (channels, interval === 'raw', paramsInterval);
    }

    /**
     * @method
     * @name coinbaseinternational#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchMarkPrice (symbol: string, params: Dict = {}): Promise<Ticker> {
        const paramsResolved = this.handleRouteAndParams ('watchMarkPrice', params);
        return await this.watchTicker (symbol, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchMarkPrices
     * @description watches the mark price for multiple markets
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string[]} symbols unified symbols of the markets to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchMarkPrices (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        const paramsResolved = this.handleRouteAndParams ('watchMarkPrices', params);
        return await this.watchTickers (symbols, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchMarkPrice
     * @description stops watching the mark price for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchMarkPrice (symbol: string, params: Dict = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchMarkPrice', params);
        return await this.unWatchTicker (symbol, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchMarkPrices
     * @description stops watching mark prices for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchMarkPrices (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchMarkPrices', params);
        return await this.unWatchTickers (symbols, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/quoteinstrument_name
     * @see https://docs.deribit.com/subscriptions/market-data/quoteinstrument_name
     * @param {string[]} [symbols] unified symbols of the markets to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const paramsResolved = this.handleRouteAndParams ('watchBidsAsks', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            const market = this.market (symbolsResolved[i]);
            channels.push ('quote.' + market['id']);
        }
        const ticker = await this.subscribe (channels, channels, false, paramsResolved);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbolsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchBidsAsks
     * @description stops watching best bid & ask for symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchBidsAsks', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            channels.push ('quote.' + this.marketId (symbolsResolved[i]));
        }
        return await this.unSubscribe (channels, false, paramsResolved);
    }

    handleTicker (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const ticker = this.parseTicker (data);
        const channel = this.safeString (params, 'channel');
        const symbol = ticker['symbol'];
        this.tickers[symbol as string] = ticker;
        client.resolve (ticker, channel);
    }

    handleBidAsk (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const ticker = this.parseWsBidAsk (data);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol as string] = ticker;
        const channel = this.safeString (params, 'channel');
        client.resolve (ticker, channel);
    }

    parseWsBidAsk (ticker: any, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'instrument_name');
        const marketResolved = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'info': ticker,
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': this.safeString (ticker, 'best_bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_amount'),
            'ask': this.safeString (ticker, 'best_ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_amount'),
        }, marketResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
     * @see https://docs.deribit.com/subscriptions/market-data/charttradesinstrument_nameresolution
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        const paramsResolved = this.handleRouteAndParams ('watchOHLCV', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolResolved = this.symbol (symbol);
        const ohlcvs = await this.watchOHLCVForSymbols ([ [ symbolResolved, timeframe ] ], since, limit, paramsResolved);
        return ohlcvs[symbolResolved][timeframe];
    }

    /**
     * @method
     * @name coinbaseinternational#watchOHLCVForSymbols
     * @description watches historical candlestick data for multiple markets and timeframes
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
     * @see https://docs.deribit.com/subscriptions/market-data/charttradesinstrument_nameresolution
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of OHLCV arrays indexed by symbol and timeframe
     */
    override async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        const paramsResolved = this.handleRouteAndParams ('watchOHLCVForSymbols', params);
        const symbolsAndTimeframesLength = symbolsAndTimeframes.length;
        if (symbolsAndTimeframesLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires an array of symbols and timeframes, like [['BTC/USDC', '1m']]");
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const channels: string[] = [];
        for (let i = 0; i < symbolsAndTimeframesLength; i++) {
            const current = symbolsAndTimeframes[i];
            const market = this.market (current[0]);
            const currentTimeframe = current[1];
            const resolution = this.safeString (this.timeframes, currentTimeframe, currentTimeframe);
            channels.push ('chart.trades.' + market['id'] + '.' + resolution);
        }
        const resolved = await this.subscribe (channels, channels, false, paramsResolved);
        const symbol = this.safeString (resolved, 0);
        const timeframe = this.safeString (resolved, 1);
        const ohlcv = this.safeValue (resolved, 2);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = ohlcv.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (ohlcv, since, limitResolved, 0, true);
        return this.createOHLCVObject (symbol as string, timeframe as string, filtered);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOHLCV
     * @description stops watching OHLCV data for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchOHLCV', params);
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOHLCVForSymbols
     * @description stops watching OHLCV data for multiple symbols and timeframes
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchOHLCVForSymbols', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const channels: string[] = [];
        const symbolsAndTimeframesLength = symbolsAndTimeframes.length;
        for (let i = 0; i < symbolsAndTimeframesLength; i++) {
            const current = symbolsAndTimeframes[i];
            const market = this.market (current[0]);
            const timeframe = current[1];
            const resolution = this.safeString (this.timeframes, timeframe, timeframe);
            channels.push ('chart.trades.' + market['id'] + '.' + resolution);
        }
        return await this.unSubscribe (channels, false, paramsResolved);
    }

    handleOHLCV (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const messageHash = this.safeString (params, 'channel', '');
        const parts = messageHash.split ('.');
        const marketId = this.safeString (parts, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const resolution = this.safeString (parts, 3);
        const wsOptions = this.safeDict (this.options, 'ws', {});
        const timeframes = this.safeDict (wsOptions, 'timeframes', {});
        const timeframe = this.findTimeframe (resolution, timeframes);
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        if (this.safeValue (this.ohlcvs[symbol], timeframe) === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][(timeframe as string)] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][(timeframe as string)];
        const data = this.safeDict (params, 'data', {});
        const parsed = this.parseWsOHLCV (data, market);
        stored.append (parsed);
        const resolved = [ symbol, timeframe, stored ];
        client.resolve (resolved, messageHash);
    }

    override parseWsOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'tick'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name coinbaseinternational#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        const paramsResolved = this.handleRouteAndParams ('watchTrades', params);
        return await this.watchTradesForSymbols ([ symbol ], since, limit, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        const paramsResolved = this.handleRouteAndParams ('watchTradesForSymbols', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchTradesForSymbols', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            const market = this.market (symbolsResolved[i]);
            channels.push ('trades.' + market['id'] + '.' + interval);
        }
        const trades = await this.subscribe (channels, channels, isPrivate, paramsInterval);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limitResolved = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTrades
     * @description stops watching trades for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchTrades', params);
        return await this.unWatchTradesForSymbols ([ symbol ], paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTradesForSymbols
     * @description stops watching trades for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchTradesForSymbols', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchTradesForSymbols', 'interval', '100ms');
        const channels: string[] = [];
        const symbolsLength = symbolsResolved.length;
        for (let i = 0; i < symbolsLength; i++) {
            channels.push ('trades.' + this.marketId (symbolsResolved[i]) + '.' + interval);
        }
        return await this.unSubscribe (channels, interval === 'raw', paramsInterval);
    }

    handleTrades (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const channel = this.safeString (params, 'channel', '');
        const data = this.safeList (params, 'data', []);
        const parts = channel.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!((symbol as string) in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const tradesArrayCache = new ArrayCache (limit);
            this.trades[(symbol as string)] = tradesArrayCache;
        }
        const tradesArray = this.trades[(symbol as string)];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const trade = this.parseTrade (data[i], market);
            tradesArray.append (trade);
        }
        this.trades[(symbol as string)] = tradesArray;
        client.resolve (tradesArray, channel);
        return message;
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_namegroupdepthinterval
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        const paramsResolved = this.handleRouteAndParams ('watchOrderBook', params);
        return await this.watchOrderBookForSymbols ([ symbol ], limit, paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_namegroupdepthinterval
     * @param {string[]} symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        const paramsResolved = this.handleRouteAndParams ('watchOrderBookForSymbols', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchOrderBookForSymbols', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const [ useDepthEndpoint, paramsDepthEndpoint ] = this.handleOptionAndParams (paramsInterval, 'watchOrderBookForSymbols', 'useDepthEndpoint', false);
        let paramsChannel: Dict = paramsDepthEndpoint;
        let descriptor = interval as string;
        if (useDepthEndpoint) {
            const [ depth, paramsDepth ] = this.handleOptionAndParams (paramsDepthEndpoint, 'watchOrderBookForSymbols', 'depth', '20');
            const [ group, paramsGroup ] = this.handleOptionAndParams (paramsDepth, 'watchOrderBookForSymbols', 'group', 'none');
            paramsChannel = paramsGroup;
            descriptor = group + '.' + depth + '.' + interval;
        }
        const channels: string[] = [];
        const symbolsLength = symbols.length;
        for (let i = 0; i < symbolsLength; i++) {
            const market = this.market (symbols[i]);
            channels.push ('book.' + market['id'] + '.' + descriptor);
        }
        const orderbook = await this.subscribe (channels, channels, isPrivate, paramsChannel);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOrderBook
     * @description stops watching an order book
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchOrderBook', params);
        return await this.unWatchOrderBookForSymbols ([ symbol ], paramsResolved);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOrderBookForSymbols
     * @description stops watching order books for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    override async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        const paramsResolved = this.handleRouteAndParams ('unWatchOrderBookForSymbols', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ interval, paramsInterval ] = this.handleOptionAndParams (paramsResolved, 'watchOrderBookForSymbols', 'interval', '100ms');
        const [ useDepthEndpoint, paramsDepthEndpoint ] = this.handleOptionAndParams (paramsInterval, 'watchOrderBookForSymbols', 'useDepthEndpoint', false);
        let paramsChannel: Dict = paramsDepthEndpoint;
        let descriptor = interval as string;
        if (useDepthEndpoint) {
            const [ depth, paramsDepth ] = this.handleOptionAndParams (paramsDepthEndpoint, 'watchOrderBookForSymbols', 'depth', '20');
            const [ group, paramsGroup ] = this.handleOptionAndParams (paramsDepth, 'watchOrderBookForSymbols', 'group', 'none');
            paramsChannel = paramsGroup;
            descriptor = group + '.' + depth + '.' + interval;
        }
        const channels: string[] = [];
        const symbolsLength = symbols.length;
        for (let i = 0; i < symbolsLength; i++) {
            channels.push ('book.' + this.marketId (symbols[i]) + '.' + descriptor);
        }
        return await this.unSubscribe (channels, interval === 'raw', paramsChannel);
    }

    handleOrderBook (client: any, message: any) {
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const type = this.safeString (data, 'type', 'snapshot');
        const marketId = this.safeString (data, 'instrument_name');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (data, 'timestamp');
        const channel = this.safeString (params, 'channel');
        const channelParts = (channel as string).split ('.');
        const channelPartsLength = channelParts.length;
        const isGrouped = channelPartsLength === 5;
        if (!(symbol in this.orderbooks)) {
            const limit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            this.orderbooks[symbol] = isGrouped ? this.orderBook ({}, limit) : this.countedOrderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if (!isGrouped && (type !== 'snapshot') && (orderbook['nonce'] === undefined)) {
            return;
        }
        if (isGrouped) {
            const parsedSnapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
            orderbook.reset (parsedSnapshot);
        } else {
            const previousChangeId = this.safeInteger (data, 'prev_change_id');
            if ((type !== 'snapshot') && (orderbook['nonce'] !== undefined) && (previousChangeId !== orderbook['nonce'])) {
                // drop the stale book and reject only this channels future
                delete this.orderbooks[symbol];
                if ((channel as string) in client.subscriptions) {
                    delete client.subscriptions[(channel as string)];
                }
                client.reject (new ExchangeError (this.id + ' order book update has a nonce mismatch'), channel);
                this.spawn (this.resubscribeOrderBook, channel);
                return;
            }
            this.handleDeltas (orderbook['asks'], this.safeList (data, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeList (data, 'bids', []));
        }
        orderbook['symbol'] = symbol;
        orderbook['nonce'] = this.safeInteger (data, 'change_id');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        this.orderbooks[symbol] = orderbook;
        if (channel !== undefined) {
            client.resolve (orderbook, channel);
        }
    }

    async resubscribeOrderBook (channel: string) {
        const channelParts = channel.split ('.');
        const channelPartsLength = channelParts.length;
        const isPrivate = this.safeString (channelParts, channelPartsLength - 1) === 'raw';
        const url = this.getWsUrl (isPrivate);
        if (isPrivate) {
            await this.authenticate ();
        }
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': isPrivate ? 'private/unsubscribe' : 'public/unsubscribe',
            'params': {
                'channels': [ channel ],
            },
            'id': this.requestId (),
        };
        const client = this.client (url);
        await client.send (request);
        if (channel in client.subscriptions) {
            delete client.subscriptions[channel];
        }
        await this.subscribe ([ channel ], [ channel ], isPrivate, {});
    }

    override handleDelta (bookside: any, delta: any) {
        const action = this.safeString (delta, 0);
        const price = this.safeNumber (delta, 1);
        const amount = this.safeNumber (delta, 2);
        if ((action === 'new') || (action === 'change')) {
            bookside.storeArray ([ price, amount, 1 ]);
        } else if (action === 'delete') {
            bookside.storeArray ([ price, amount, 0 ]);
        }
    }

    override handleDeltas (bookside: any, deltas: any) {
        const deltasLength = deltas.length;
        for (let i = 0; i < deltasLength; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleErrorMessage (client: Client, message: any): Bool {
        const error = this.safeDict (message, 'error');
        if (error === undefined) {
            return false;
        }
        const errorCode = this.safeString (error, 'code');
        const errorMessage = this.safeString (error, 'message');
        const feedback = this.id + ' ' + this.json (message);
        try {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback);
        } catch (e) {
            const requestId = this.safeString (message, 'id');
            const authRequestId = this.safeString (this.options, 'wsAuthRequestId');
            const messageHash = (requestId === authRequestId) ? 'authenticated' : requestId;
            if ((messageHash === 'authenticated') && (messageHash in client.subscriptions)) {
                // allow the next authenticate () call to retry
                delete client.subscriptions[messageHash];
            }
            client.reject (e, messageHash);
        }
        return true;
    }

    async handleHeartbeat (client: Client, message: any) {
        const params = this.safeDict (message, 'params', {});
        const data = this.safeString (params, 'data');
        if (data === 'test_request') {
            await client.send ({
                'jsonrpc': '2.0',
                'id': this.requestId (),
                'method': 'public/test',
                'params': {},
            });
        }
    }

    override handleMessage (client: Client, message: any) {
        if (this.handleErrorMessage (client, message) === true) {
            return;
        }
        const method = this.safeString (message, 'method');
        if (method === 'heartbeat') {
            this.spawn (this.handleHeartbeat, client, message);
            return;
        }
        const params = this.safeDict (message, 'params');
        const channel = this.safeString (params, 'channel');
        if (channel !== undefined) {
            const parts = channel.split ('.');
            const channelId = this.safeString (parts, 0);
            const userChannel = this.safeString (parts, 1);
            const userHandlers: Dict = {
                'portfolio': this.handleBalance,
                'trades': this.handleMyTrades,
                'orders': this.handleOrders,
                'changes': this.handlePositions,
            };
            const handlers: Dict = {
                'ticker': this.handleTicker,
                'incremental_ticker': this.handleTicker,
                'quote': this.handleBidAsk,
                'book': this.handleOrderBook,
                'trades': this.handleTrades,
                'chart': this.handleOHLCV,
                'user': this.safeValue (userHandlers, userChannel),
            };
            const handler = this.safeValue (handlers, channelId);
            if (handler === undefined) {
                throw new NotSupported (this.id + ' no handler found for websocket channel ' + channel);
            }
            handler.call (this, client, message);
            return;
        }
        const requestId = this.safeString (message, 'id');
        if (requestId !== undefined) {
            const result = this.safeDict (message, 'result');
            if (this.safeString (result, 'version') !== undefined) {
                client.lastPong = this.milliseconds ();
            }
            const authRequestId = this.safeString (this.options, 'wsAuthRequestId');
            if (requestId === authRequestId) {
                this.handleAuthenticationMessage (client, message);
                return;
            }
            client.resolve (this.safeValue (message, 'result', message), requestId);
        }
    }

    handleAuthenticationMessage (client: Client, message: any) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": {
        //             "expires_in": 3000,
        //             "scope": "...",
        //             "sid": "...",
        //             "token_type": "bearer"
        //         }
        //     }
        //
        const result = this.safeDict (message, 'result', {});
        const expiresIn = this.safeInteger (result, 'expires_in', 900);
        const ratio = this.safeNumber (this.options, 'wsAuthRefreshRatio');
        const refreshRatio = (ratio === undefined) ? 0.8 : ratio;
        const now = this.milliseconds ();
        this.options['wsAuthRefreshAt'] = this.sum (now, this.parseToInt (expiresIn * 1000 * refreshRatio));
        client.lastPong = now;
        client.resolve (result, 'authenticated');
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#authenticate
     * @description authenticates the private websocket session
     * @see https://docs.cdp.coinbase.com/api-reference/authentication/public-auth
     * @see https://docs.deribit.com/api-reference/authentication/public-auth
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the authentication response
     */
    async authenticate (params = {}) {
        const paramsResolved = this.handleRouteAndParams ('authenticate', params);
        const url = this.getWsUrl (true);
        const client = this.client (url);
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future !== undefined) {
            const refreshAt = this.safeInteger (this.options, 'wsAuthRefreshAt');
            if ((refreshAt !== undefined) && (this.milliseconds () >= refreshAt) && !(messageHash in client.futures)) {
                delete client.subscriptions[messageHash];
                future = undefined;
            }
        }
        if (future === undefined) {
            this.checkRequiredCredentials ();
            const requestId = this.requestId ();
            this.options['wsAuthRequestId'] = requestId;
            let paramsAuth: Dict = {
                'grant_type': 'client_credentials',
                'client_id': this.apiKey,
                'client_secret': this.secret,
            };
            if (!this.isNativeDeribitCredentials ()) {
                paramsAuth = {
                    'grant_type': 'coinbase_cdp',
                    'token': this.createAuthToken (this.seconds (), undefined, undefined, this.isEddsaSecret ()),
                };
            }
            const request: Dict = {
                'jsonrpc': '2.0',
                'id': requestId,
                'method': 'public/auth',
                'params': paramsAuth,
            };
            future = client.reusableFuture (messageHash);
            this.watch (url, messageHash, this.extend (request, paramsResolved), messageHash);
            client.subscriptions[messageHash] = future;
        }
        return await future;
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#requestWs
     * @description sends a websocket JSON-RPC request
     * @param {string} method exchange JSON-RPC method name
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {boolean} [isPrivate] whether to authenticate before sending the request
     * @returns {object} the exchange response
     */
    async requestWs (method: string, params = {}, isPrivate = false) {
        const paramsResolved = this.handleRouteAndParams ('requestWs', params);
        const url = this.getWsUrl (true);
        if (isPrivate) {
            await this.authenticate ();
        }
        const requestId = this.requestId ();
        const messageHash = requestId.toString ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'id': requestId,
            'method': method,
            'params': paramsResolved,
        };
        return await this.watch (url, messageHash, request, messageHash);
    }

    /**
     * @method
     * @name coinbaseinternational#createOrderWs
     * @description create a trade order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-buy
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-sell
     * @see https://docs.deribit.com/api-reference/trading/private-buy
     * @see https://docs.deribit.com/api-reference/trading/private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot)
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        const paramsResolved = this.handleRouteAndParams ('createOrderWs', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
            'amount': this.parseNumber (this.getOrderAmount (market, amount)),
            'type': type,
        };
        const triggerPrice = this.safeNumberN (paramsResolved, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        if (triggerPrice !== undefined) {
            request['type'] = (type === 'limit') ? 'stop_limit' : 'stop_market';
            request['trigger_price'] = triggerPrice;
        }
        if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrderWs() requires a price argument for limit orders');
            }
            request['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        const postOnly = this.safeBool2 (paramsResolved, 'postOnly', 'post_only');
        if (this.isNativeDeribitCredentials ()) {
            const reduceOnly = this.safeBool2 (paramsResolved, 'reduceOnly', 'reduce_only');
            if (reduceOnly !== undefined) {
                request['reduce_only'] = reduceOnly;
            }
        }
        if (postOnly !== undefined) {
            request['post_only'] = postOnly;
            request['reject_post_only'] = postOnly;
        }
        const timeInForce = this.safeString2 (paramsResolved, 'timeInForce', 'tif');
        if (timeInForce !== undefined) {
            const timeInForces: Dict = {
                'GTC': 'good_til_cancelled',
                'IOC': 'immediate_or_cancel',
                'FOK': 'fill_or_kill',
                'GTD': 'good_til_day',
            };
            request['time_in_force'] = this.safeString (timeInForces, timeInForce, timeInForce);
        }
        const clientOrderId = this.safeString2 (paramsResolved, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        } else {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['label'] = brokerId + '-' + this.uuid22 ();
            }
        }
        let paramsRequest = this.omit (paramsResolved, [ 'clientOrderId', 'client_order_id', 'postOnly', 'post_only', 'timeInForce', 'tif', 'triggerPrice', 'stopPrice', 'stop_price' ]);
        if (this.isNativeDeribitCredentials ()) {
            paramsRequest = this.omit (paramsRequest, [ 'reduceOnly', 'reduce_only' ]);
        }
        const result = await this.requestWs ('private/' + side, this.extend (request, paramsRequest), true);
        const order = this.safeDict (result, 'order', {});
        order['trades'] = this.safeList (result, 'trades', []);
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#editOrderWs
     * @description edit a trade order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-edit
     * @see https://docs.deribit.com/api-reference/trading/private-edit
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {string} type not used by coinbaseinternational editOrderWs
     * @param {string} side not used by coinbaseinternational editOrderWs
     * @param {float} [amount] new order amount, in contracts for native Deribit derivatives
     * @param {float} [price] new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        const paramsResolved = this.handleRouteAndParams ('editOrderWs', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = { 'order_id': id };
        if (amount !== undefined) {
            request['amount'] = this.parseNumber (this.getOrderAmount (market, amount));
        }
        if (price !== undefined) {
            request['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        const triggerPrice = this.safeNumberN (paramsResolved, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        if (triggerPrice !== undefined) {
            request['trigger_price'] = triggerPrice;
        }
        const paramsRequest = this.omit (paramsResolved, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        const result = await this.requestWs ('private/edit', this.extend (request, paramsRequest), true);
        const order = this.safeDict (result, 'order', {});
        order['trades'] = this.safeList (result, 'trades', []);
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#cancelOrderWs
     * @description cancels an open order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
     * @see https://docs.deribit.com/api-reference/trading/private-cancel
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const paramsResolved = this.handleRouteAndParams ('cancelOrderWs', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const result = await this.requestWs ('private/cancel', this.extend ({ 'order_id': id }, paramsResolved), true);
        return this.parseOrder (result, market);
    }

    /**
     * @method
     * @name coinbaseinternational#cancelAllOrdersWs
     * @description cancels all open orders over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-cancel_all
     * @see https://docs.deribit.com/api-reference/trading/private-cancel_all_by_instrument
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelAllOrdersWs (symbol: Str = undefined, params = {}): Promise<Order[]> {
        const paramsResolved = this.handleRouteAndParams ('cancelAllOrdersWs', params);
        let method = 'private/cancel_all';
        let paramsRequest: Dict = paramsResolved;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            const market = this.market (symbol);
            paramsRequest = this.extend ({ 'instrument_name': market['id'] }, paramsResolved);
            method = 'private/cancel_all_by_instrument';
        }
        const result = await this.requestWs (method, paramsRequest, true);
        return [ this.safeOrder ({ 'info': result }) ];
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOrderWs
     * @description fetches an order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
     * @see https://docs.deribit.com/api-reference/trading/private-get_order_state
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const paramsResolved = this.handleRouteAndParams ('fetchOrderWs', params);
        let market: Market = undefined;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            market = this.market (symbol);
        }
        const result = await this.requestWs ('private/get_order_state', this.extend ({ 'order_id': id }, paramsResolved), true);
        return this.parseOrder (result, market);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOpenOrdersWs
     * @description fetches open orders over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const paramsResolved = this.handleRouteAndParams ('fetchOpenOrdersWs', params);
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrdersWs() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = { 'instrument_name': market['id'] };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const result = await this.requestWs ('private/get_open_orders_by_instrument', this.extend (request, paramsResolved), true);
        return this.parseOrders (result, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOrdersWs
     * @description fetches order history over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_history_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_order_history_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const paramsResolved = this.handleRouteAndParams ('fetchOrdersWs', params);
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersWs() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = { 'instrument_name': market['id'] };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const result = await this.requestWs ('private/get_order_history_by_instrument', this.extend (request, paramsResolved), true);
        const orders = this.safeList (result, 'orders', result);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchBalanceWs
     * @description fetches the balance over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
     * @see https://docs.deribit.com/api-reference/account-management/private-get_account_summaries
     * @see https://docs.deribit.com/api-reference/account-management/private-get_account_summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalanceWs (params = {}): Promise<Balances> {
        const paramsResolved = this.handleRouteAndParams ('fetchBalanceWs', params);
        const result = await this.requestWs ('private/get_account_summaries', paramsResolved, true);
        const summaries = this.safeList (result, 'summaries', []);
        let balance: Balances = { 'info': result } as Balances;
        const summariesLength = summaries.length;
        for (let i = 0; i < summariesLength; i++) {
            balance = this.deepExtend (balance, this.parseBalance (summaries[i]));
        }
        return this.safeBalance (balance);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchMyTradesWs
     * @description fetches user trades over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument_and_time
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTradesWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const paramsResolved = this.handleRouteAndParams ('fetchMyTradesWs', params);
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTradesWs() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = { 'instrument_name': market['id'], 'include_old': true };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const result = await this.requestWs ('private/get_user_trades_by_instrument', this.extend (request, paramsResolved), true);
        const trades = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchPositionsWs
     * @description fetches open positions over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
     * @see https://docs.deribit.com/api-reference/account-management/private-get_positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositionsWs (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        const paramsResolved = this.handleRouteAndParams ('fetchPositionsWs', params);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols);
        const result = await this.requestWs ('private/get_positions', paramsResolved, true);
        const positions = this.parsePositions (result);
        return this.filterByArrayPositions (positions, 'symbol', symbolsResolved);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#setHeartbeat
     * @description enables heartbeat messages for the private websocket connection
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/public-set_heartbeat
     * @see https://docs.deribit.com/api-reference/session-management/public-set_heartbeat
     * @param {int} [interval] heartbeat interval in seconds, minimum 10
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    async setHeartbeat (interval: Int = 30, params = {}) {
        const paramsResolved = this.handleRouteAndParams ('setHeartbeat', params);
        const request = this.extend ({ 'interval': interval }, paramsResolved);
        return await this.requestWs ('public/set_heartbeat', request);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#disableHeartbeat
     * @description disables heartbeat messages for the private websocket connection
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/public-disable_heartbeat
     * @see https://docs.deribit.com/api-reference/session-management/public-disable_heartbeat
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    async disableHeartbeat (params = {}) {
        const paramsResolved = this.handleRouteAndParams ('disableHeartbeat', params);
        return await this.requestWs ('public/disable_heartbeat', paramsResolved);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#setCancelOnDisconnect
     * @description enables or disables cancel on disconnect
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-enable_cancel_on_disconnect
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-disable_cancel_on_disconnect
     * @see https://docs.deribit.com/api-reference/session-management/private-enable_cancel_on_disconnect
     * @see https://docs.deribit.com/api-reference/session-management/private-disable_cancel_on_disconnect
     * @param {bool} enabled whether cancel on disconnect should be enabled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.scope] connection or account, default connection
     * @returns {object} the exchange response
     */
    async setCancelOnDisconnect (enabled: Bool, params = {}) {
        const paramsResolved = this.handleRouteAndParams ('setCancelOnDisconnect', params);
        const method = (enabled === true) ? 'private/enable_cancel_on_disconnect' : 'private/disable_cancel_on_disconnect';
        return await this.requestWs (method, paramsResolved, true);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#getCancelOnDisconnect
     * @description gets the cancel on disconnect configuration
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-get_cancel_on_disconnect
     * @see https://docs.deribit.com/api-reference/session-management/private-get_cancel_on_disconnect
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.scope] connection or account, default connection
     * @returns {object} the exchange response
     */
    async getCancelOnDisconnect (params = {}) {
        const paramsResolved = this.handleRouteAndParams ('getCancelOnDisconnect', params);
        return await this.requestWs ('private/get_cancel_on_disconnect', paramsResolved, true);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#unsubscribeAllWs
     * @description unsubscribes from all websocket channels
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe_all
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe_all
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe_all
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe_all
     * @param {bool} [isPrivate] whether to unsubscribe from private channels
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    async unsubscribeAllWs (isPrivate = false, params = {}) {
        const paramsResolved = this.handleRouteAndParams ('unsubscribeAllWs', params);
        const method = isPrivate ? 'private/unsubscribe_all' : 'public/unsubscribe_all';
        return await this.requestWs (method, paramsResolved, isPrivate);
    }

    /**
     * @ignore
     * @method
     * @name coinbaseinternational#logoutWs
     * @description gracefully logs out of the private websocket session
     * @see https://docs.cdp.coinbase.com/api-reference/authentication/private-logout
     * @see https://docs.deribit.com/api-reference/authentication/private-logout
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {bool} [params.invalidate_token] whether to invalidate session tokens, default true
     * @returns {object} the exchange response
     */
    async logoutWs (params = {}) {
        const paramsResolved = this.handleRouteAndParams ('logoutWs', params);
        await this.authenticate ();
        const url = this.getWsUrl (true);
        const client = this.client (url);
        const request: Dict = {
            'jsonrpc': '2.0',
            'id': this.requestId (),
            'method': 'private/logout',
            'params': paramsResolved,
        };
        await client.send (request);
        return undefined;
    }
}
