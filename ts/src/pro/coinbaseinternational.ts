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
            'options': {
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

    async subscribe (channels: string[], messageHashes: string[], isPrivate = false, params = {}) {
        let url = this.urls['api']['ws'];
        let method = 'public/subscribe';
        if (isPrivate) {
            url = this.urls['api']['wsPrivate'];
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
        const extendedRequest = this.deepExtend (request, params);
        if (channels.length === 1) {
            return await this.watch (url, messageHashes[0], extendedRequest, channels[0], extendedRequest);
        }
        return await this.watchMultiple (url, messageHashes, extendedRequest, channels, extendedRequest);
    }

    async unSubscribe (channels: string[], isPrivate = false, params = {}) {
        let url = this.urls['api']['ws'];
        let method = 'public/unsubscribe';
        if (isPrivate) {
            url = this.urls['api']['wsPrivate'];
            method = 'private/unsubscribe';
            await this.authenticate ();
        }
        const unWatchMessageHashes: string[] = [];
        for (let i = 0; i < channels.length; i++) {
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
        this.watchMultiple (url, unWatchMessageHashes, this.deepExtend (request, params), unWatchMessageHashes);
        for (let i = 0; i < channels.length; i++) {
            this.cleanUnsubscription (client, channels[i], unWatchMessageHashes[i]);
        }
        return true;
    }

    /**
     * @method
     * @name coinbaseinternational#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userportfoliocurrency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currency] currency code to watch, default is any
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async watchBalance (params = {}): Promise<Balances> {
        let currency: Str = undefined;
        [ currency, params ] = this.handleOptionAndParams (params, 'watchBalance', 'currency', 'any');
        const channel = 'user.portfolio.' + currency;
        return await this.subscribe ([ channel ], [ 'balance' ], true, params);
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
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchMyTrades', 'interval', 'raw');
        let channel = 'user.trades.any.any.' + interval;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            channel = 'user.trades.' + market['id'] + '.' + interval;
        }
        const trades = await this.subscribe ([ channel ], [ channel ], true, params);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchMyTrades
     * @description stops watching user trades
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchMyTrades', 'interval', 'raw');
        let channel = 'user.trades.any.any.' + interval;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            channel = 'user.trades.' + this.marketId (symbol) + '.' + interval;
        }
        return await this.unSubscribe ([ channel ], true, params);
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
        for (let i = 0; i < trades.length; i++) {
            this.myTrades.append (trades[i]);
        }
        client.resolve (this.myTrades, channel);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrders
     * @description watches information on orders made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrders', 'interval', 'raw');
        let channel = 'user.orders.any.any.' + interval;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            channel = 'user.orders.' + market['id'] + '.' + interval;
        }
        const orders = await this.subscribe ([ channel ], [ channel ], true, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrdersForSymbols
     * @description watches information on orders made by the user for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
     * @param {string[]} symbols unified market symbols
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrdersForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrders', 'interval', 'raw');
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            channels.push ('user.orders.' + this.marketId (symbols[i]) + '.' + interval);
        }
        const orders = await this.subscribe (channels, channels, true, params);
        if (this.newUpdates) {
            limit = orders.getLimit (undefined, limit);
        }
        return this.filterBySymbolsSinceLimit (orders, symbols, since, limit, true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOrders
     * @description stops watching user orders
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrders', 'interval', 'raw');
        let channel = 'user.orders.any.any.' + interval;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            channel = 'user.orders.' + this.marketId (symbol) + '.' + interval;
        }
        return await this.unSubscribe ([ channel ], true, params);
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
        for (let i = 0; i < orders.length; i++) {
            this.orders.append (orders[i]);
        }
        client.resolve (this.orders, channel);
    }

    /**
     * @method
     * @name coinbaseinternational#watchPositions
     * @description watches all open positions
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userchangesinstrument_nameinterval
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchPositions', 'interval', 'raw');
        const channels: string[] = [];
        if ((symbols !== undefined) && (symbols.length > 0)) {
            for (let i = 0; i < symbols.length; i++) {
                channels.push ('user.changes.' + this.marketId (symbols[i]) + '.' + interval);
            }
        } else {
            channels.push ('user.changes.any.any.' + interval);
        }
        const positions = await this.subscribe (channels, channels, true, params);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchPositions
     * @description stops watching open positions
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchPositions', 'interval', 'raw');
        const channels: string[] = [];
        if ((symbols !== undefined) && (symbols.length > 0)) {
            for (let i = 0; i < symbols.length; i++) {
                channels.push ('user.changes.' + this.marketId (symbols[i]) + '.' + interval);
            }
        } else {
            channels.push ('user.changes.any.any.' + interval);
        }
        return await this.unSubscribe (channels, true, params);
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
        for (let i = 0; i < positions.length; i++) {
            this.positions.append (positions[i]);
        }
        client.resolve (this.positions, channel);
    }

    /**
     * @method
     * @name coinbaseinternational#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        const ticker = await this.watchTicker (symbol, params);
        return this.parseFundingRate (ticker['info'], this.market (symbol));
    }

    /**
     * @method
     * @name coinbaseinternational#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @param {string[]} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    override async watchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchFundingRates() requires an array of symbols');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const tickers = await this.watchTickers (symbols, params);
        const result: Dict = {};
        const tickerSymbols = Object.keys (tickers);
        for (let i = 0; i < tickerSymbols.length; i++) {
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
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchFundingRate (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTicker (symbol, params);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchFundingRates
     * @description stops watching funding rates for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchFundingRates (symbols: Strings = undefined, params = {}): Promise<any> {
        return await this.unWatchTickers (symbols, params);
    }

    /**
     * @method
     * @name coinbaseinternational#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchTicker', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const channel = 'ticker.' + market['id'] + '.' + interval;
        return await this.subscribe ([ channel ], [ channel ], isPrivate, params);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTicker
     * @description stops watching a ticker
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchTicker (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name coinbaseinternational#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchTickers', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            channels.push ('ticker.' + market['id'] + '.' + interval);
        }
        const ticker = await this.subscribe (channels, channels, isPrivate, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTickers
     * @description stops watching tickers
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchTickers', 'interval', '100ms');
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            channels.push ('ticker.' + this.marketId (symbols[i]) + '.' + interval);
        }
        return await this.unSubscribe (channels, interval === 'raw', params);
    }

    /**
     * @method
     * @name coinbaseinternational#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/quoteinstrument_name
     * @param {string[]} [symbols] unified symbols of the markets to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            channels.push ('quote.' + market['id']);
        }
        const ticker = await this.subscribe (channels, channels, false, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchBidsAsks
     * @description stops watching best bid & ask for symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            channels.push ('quote.' + this.marketId (symbols[i]));
        }
        return await this.unSubscribe (channels, false, params);
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
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'info': ticker,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': this.safeString (ticker, 'best_bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_amount'),
            'ask': this.safeString (ticker, 'best_ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_amount'),
        }, market);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbol = this.symbol (symbol);
        const ohlcvs = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return ohlcvs[symbol][timeframe];
    }

    /**
     * @method
     * @name coinbaseinternational#watchOHLCVForSymbols
     * @description watches historical candlestick data for multiple markets and timeframes
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of OHLCV arrays indexed by symbol and timeframe
     */
    override async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbolsAndTimeframes.length === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires an array of symbols and timeframes, like [['BTC/USDC', '1m']]");
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const channels: string[] = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const current = symbolsAndTimeframes[i];
            const market = this.market (current[0]);
            const currentTimeframe = current[1];
            const resolution = this.safeString (this.timeframes, currentTimeframe, currentTimeframe);
            channels.push ('chart.trades.' + market['id'] + '.' + resolution);
        }
        const resolved = await this.subscribe (channels, channels, false, params);
        const symbol = this.safeString (resolved, 0);
        const timeframe = this.safeString (resolved, 1);
        const ohlcv = this.safeValue (resolved, 2);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (ohlcv, since, limit, 0, true);
        return this.createOHLCVObject (symbol as string, timeframe as string, filtered);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOHLCV
     * @description stops watching OHLCV data for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOHLCVForSymbols
     * @description stops watching OHLCV data for multiple symbols and timeframes
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const channels: string[] = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const current = symbolsAndTimeframes[i];
            const market = this.market (current[0]);
            const timeframe = current[1];
            const resolution = this.safeString (this.timeframes, timeframe, timeframe);
            channels.push ('chart.trades.' + market['id'] + '.' + resolution);
        }
        return await this.unSubscribe (channels, false, params);
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
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name coinbaseinternational#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchTradesForSymbols', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            channels.push ('trades.' + market['id'] + '.' + interval);
        }
        const trades = await this.subscribe (channels, channels, isPrivate, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTrades
     * @description stops watching trades for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchTradesForSymbols
     * @description stops watching trades for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchTradesForSymbols', 'interval', '100ms');
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            channels.push ('trades.' + this.marketId (symbols[i]) + '.' + interval);
        }
        return await this.unSubscribe (channels, interval === 'raw', params);
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
        for (let i = 0; i < data.length; i++) {
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
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name coinbaseinternational#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
     * @param {string[]} symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'interval', '100ms');
        const isPrivate = interval === 'raw';
        let useDepthEndpoint: Bool = undefined;
        [ useDepthEndpoint, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'useDepthEndpoint', false);
        let descriptor = interval as string;
        if (useDepthEndpoint) {
            let depth: Str = undefined;
            [ depth, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'depth', '20');
            let group: Str = undefined;
            [ group, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'group', 'none');
            descriptor = group + '.' + depth + '.' + interval;
        }
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            channels.push ('book.' + market['id'] + '.' + descriptor);
        }
        const orderbook = await this.subscribe (channels, channels, isPrivate, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOrderBook
     * @description stops watching an order book
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name coinbaseinternational#unWatchOrderBookForSymbols
     * @description stops watching order books for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    override async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'interval', '100ms');
        let useDepthEndpoint: Bool = undefined;
        [ useDepthEndpoint, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'useDepthEndpoint', false);
        let descriptor = interval as string;
        if (useDepthEndpoint) {
            let depth: Str = undefined;
            [ depth, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'depth', '20');
            let group: Str = undefined;
            [ group, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'group', 'none');
            descriptor = group + '.' + depth + '.' + interval;
        }
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            channels.push ('book.' + this.marketId (symbols[i]) + '.' + descriptor);
        }
        return await this.unSubscribe (channels, interval === 'raw', params);
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
        const isGrouped = channelParts.length === 5;
        if (!(symbol in this.orderbooks)) {
            const limit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            this.orderbooks[symbol] = isGrouped ? this.orderBook ({}, limit) : this.countedOrderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if (isGrouped) {
            const parsedSnapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
            orderbook.reset (parsedSnapshot);
        } else {
            const previousChangeId = this.safeInteger (data, 'prev_change_id');
            if ((type !== 'snapshot') && (orderbook['nonce'] !== undefined) && (previousChangeId !== orderbook['nonce'])) {
                // drop the stale book and reject only this channel's future instead of throwing
                // through handleMessage, which would kill every other subscription on the connection
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
        client.resolve (orderbook, channel);
    }

    async resubscribeOrderBook (channel: string) {
        // the channel un-grouped book stream re-sends a fresh snapshot on (re)subscribe
        await this.subscribe ([ channel ], [ channel ], false, {});
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
        for (let i = 0; i < deltas.length; i++) {
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
            const authRequestId = this.safeString (this.options, 'wsAuthRequestId');
            const messageHash = (requestId === authRequestId) ? 'authenticated' : requestId;
            client.resolve (this.safeValue (message, 'result', message), messageHash);
        }
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['wsPrivate'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            this.checkRequiredCredentials ();
            const secretIsPem = this.secret.startsWith ('-----BEGIN');
            const secretEndsWithEquals = this.secret.endsWith ('=');
            const useV2CloudApiKey = this.safeBool (this.options, 'v2CloudAPiKey', false);
            const useEddsa = !secretIsPem && ((this.secret.length === 88) || useV2CloudApiKey || secretEndsWithEquals);
            const requestId = this.requestId ();
            this.options['wsAuthRequestId'] = requestId;
            const token = this.createAuthToken (this.seconds (), undefined, undefined, useEddsa);
            const request: Dict = {
                'jsonrpc': '2.0',
                'id': requestId,
                'method': 'public/auth',
                'params': {
                    'grant_type': 'coinbase_cdp',
                    'token': token,
                },
            };
            // assign the in-flight (unawaited) future before awaiting it, so a concurrent
            // caller sees it immediately and joins this authentication instead of sending
            // its own public/auth on the same connection
            future = this.watch (url, messageHash, this.extend (request, params), messageHash);
            client.subscriptions[messageHash] = future;
        }
        return await future;
    }

    async requestWs (method: string, params = {}, isPrivate = false) {
        const url = this.urls['api']['wsPrivate'];
        if (isPrivate) {
            await this.authenticate ();
        }
        const requestId = this.requestId ();
        const messageHash = requestId.toString ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'id': requestId,
            'method': method,
            'params': params,
        };
        return await this.watch (url, messageHash, request, messageHash);
    }

    /**
     * @method
     * @name coinbaseinternational#createOrderWs
     * @description create a trade order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-buy
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
            'amount': this.parseNumber (this.amountToPrecision (symbol, amount)),
            'type': type,
        };
        const triggerPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
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
        const postOnly = this.safeBool2 (params, 'postOnly', 'post_only');
        if (postOnly !== undefined) {
            request['post_only'] = postOnly;
            request['reject_post_only'] = postOnly;
        }
        const timeInForce = this.safeString2 (params, 'timeInForce', 'tif');
        if (timeInForce !== undefined) {
            const timeInForces: Dict = {
                'GTC': 'good_til_cancelled',
                'IOC': 'immediate_or_cancel',
                'FOK': 'fill_or_kill',
                'GTD': 'good_til_day',
            };
            request['time_in_force'] = this.safeString (timeInForces, timeInForce, timeInForce);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        } else {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['label'] = brokerId + '-' + this.uuid22 ();
            }
        }
        params = this.omit (params, [ 'clientOrderId', 'client_order_id', 'postOnly', 'post_only', 'timeInForce', 'tif', 'triggerPrice', 'stopPrice', 'stop_price' ]);
        const result = await this.requestWs ('private/' + side, this.extend (request, params), true);
        const order = this.safeDict (result, 'order', {});
        order['trades'] = this.safeList (result, 'trades', []);
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#editOrderWs
     * @description edit a trade order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-edit
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {string} type not used by coinbaseinternational editOrderWs
     * @param {string} side not used by coinbaseinternational editOrderWs
     * @param {float} [amount] new order amount
     * @param {float} [price] new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = { 'order_id': id };
        if (amount !== undefined) {
            request['amount'] = this.parseNumber (this.amountToPrecision (symbol, amount));
        }
        if (price !== undefined) {
            request['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        const triggerPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        if (triggerPrice !== undefined) {
            request['trigger_price'] = triggerPrice;
        }
        params = this.omit (params, [ 'triggerPrice', 'stopPrice', 'stop_price' ]);
        const result = await this.requestWs ('private/edit', this.extend (request, params), true);
        const order = this.safeDict (result, 'order', {});
        order['trades'] = this.safeList (result, 'trades', []);
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name coinbaseinternational#cancelOrderWs
     * @description cancels an open order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const result = await this.requestWs ('private/cancel', this.extend ({ 'order_id': id }, params), true);
        return this.parseOrder (result, market);
    }

    /**
     * @method
     * @name coinbaseinternational#cancelAllOrdersWs
     * @description cancels all open orders over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelAllOrdersWs (symbol: Str = undefined, params = {}): Promise<Order[]> {
        let method = 'private/cancel_all';
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            const market = this.market (symbol);
            params = this.extend ({ 'instrument_name': market['id'] }, params);
            method = 'private/cancel_all_by_instrument';
        }
        const result = await this.requestWs (method, params, true);
        return [ this.safeOrder ({ 'info': result }) ];
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOrderWs
     * @description fetches an order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        let market: Market = undefined;
        if (symbol !== undefined) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            market = this.market (symbol);
        }
        const result = await this.requestWs ('private/get_order_state', this.extend ({ 'order_id': id }, params), true);
        return this.parseOrder (result, market);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOpenOrdersWs
     * @description fetches open orders over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
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
        const result = await this.requestWs ('private/get_open_orders_by_instrument', this.extend (request, params), true);
        return this.parseOrders (result, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchOrdersWs
     * @description fetches order history over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_history_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
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
        const result = await this.requestWs ('private/get_order_history_by_instrument', this.extend (request, params), true);
        const orders = this.safeList (result, 'orders', result);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchBalanceWs
     * @description fetches the balance over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalanceWs (params = {}): Promise<Balances> {
        const result = await this.requestWs ('private/get_account_summaries', params, true);
        const summaries = this.safeList (result, 'summaries', []);
        let balance: Balances = { 'info': result } as Balances;
        for (let i = 0; i < summaries.length; i++) {
            balance = this.deepExtend (balance, this.parseBalance (summaries[i]));
        }
        return this.safeBalance (balance);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchMyTradesWs
     * @description fetches user trades over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTradesWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
        const result = await this.requestWs ('private/get_user_trades_by_instrument', this.extend (request, params), true);
        const trades = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name coinbaseinternational#fetchPositionsWs
     * @description fetches open positions over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositionsWs (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        const result = await this.requestWs ('private/get_positions', params, true);
        const positions = this.parsePositions (result);
        return this.filterByArrayPositions (positions, 'symbol', symbols, false);
    }

    /**
     * @ignore
     * @method
     * @description enables heartbeat messages for the private websocket connection
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/public-set_heartbeat
     * @param {int} [interval] heartbeat interval in seconds, minimum 10
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async setHeartbeat (interval: Int = 30, params = {}) {
        const request = this.extend ({ 'interval': interval }, params);
        return await this.requestWs ('public/set_heartbeat', request);
    }

    /**
     * @ignore
     * @method
     * @description disables heartbeat messages for the private websocket connection
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/public-disable_heartbeat
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async disableHeartbeat (params = {}) {
        return await this.requestWs ('public/disable_heartbeat', params);
    }

    /**
     * @ignore
     * @method
     * @description enables or disables cancel on disconnect
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-enable_cancel_on_disconnect
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-disable_cancel_on_disconnect
     * @param {bool} enabled whether cancel on disconnect should be enabled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.scope] connection or account, default connection
     * @returns {object} the exchange response
     */
    async setCancelOnDisconnect (enabled: Bool, params = {}) {
        const method = (enabled === true) ? 'private/enable_cancel_on_disconnect' : 'private/disable_cancel_on_disconnect';
        return await this.requestWs (method, params, true);
    }

    /**
     * @ignore
     * @method
     * @description gets the cancel on disconnect configuration
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-get_cancel_on_disconnect
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.scope] connection or account, default connection
     * @returns {object} the exchange response
     */
    async getCancelOnDisconnect (params = {}) {
        return await this.requestWs ('private/get_cancel_on_disconnect', params, true);
    }

    /**
     * @ignore
     * @method
     * @description unsubscribes from all websocket channels
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe_all
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe_all
     * @param {bool} [isPrivate] whether to unsubscribe from private channels
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unsubscribeAllWs (isPrivate = false, params = {}) {
        const method = isPrivate ? 'private/unsubscribe_all' : 'public/unsubscribe_all';
        return await this.requestWs (method, params, isPrivate);
    }

    /**
     * @ignore
     * @method
     * @description gracefully logs out of the private websocket session
     * @see https://docs.cdp.coinbase.com/api-reference/authentication/private-logout
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.invalidate_token] whether to invalidate session tokens, default true
     * @returns {object} the exchange response
     */
    async logoutWs (params = {}) {
        await this.authenticate ();
        const url = this.urls['api']['wsPrivate'];
        const client = this.client (url);
        const request: Dict = {
            'jsonrpc': '2.0',
            'id': this.requestId (),
            'method': 'private/logout',
            'params': params,
        };
        await client.send (request);
        return undefined;
    }
}
