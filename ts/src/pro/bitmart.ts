
//  ---------------------------------------------------------------------------

import bitmartRest from '../bitmart.js';
import { AuthenticationError, ExchangeError, NotSupported, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Market, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Position, Balances, Dict, Bool, FundingRate, FundingRates } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Asks, Bids } from '../base/ws/OrderBookSide.js';

//  ---------------------------------------------------------------------------

export default class bitmart extends bitmartRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'ws': true,
                'watchBalance': true,
                'watchFundingRate': true,
                'watchFundingRates': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOHLCV': true,
                'watchPosition': 'emulated',
                'watchPositions': true,
                'unWatchBidsAsks': false, // the same channel as watchTickers
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'unWatchOrders': true,
                'unWatchPositions': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': {
                            'public': 'wss://ws-manager-compress.{hostname}/api?protocol=1.1',
                            'private': 'wss://ws-manager-compress.{hostname}/user?protocol=1.1',
                        },
                        'swap': {
                            'public': 'wss://openapi-ws-v2.{hostname}/api?protocol=1.1',
                            'private': 'wss://openapi-ws-v2.{hostname}/user?protocol=1.1',
                        },
                    },
                },
            },
            'options': {
                'defaultType': 'spot',
                'watchBalance': {
                    'fetchBalanceSnapshot': true, // or false
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                //
                // orderbook channels can have:
                //  -  'depth5', 'depth20', 'depth50' // these endpoints emit full Orderbooks once in every 500ms
                //  -  'depth/increase100' // this endpoint is preferred, because it emits once in 100ms. however, when this value is chosen, it only affects spot-market, but contracts markets automatically `depth50` will be being used
                'watchOrderBook': {
                    'depth': 'depth/increase100',
                },
                'watchOrderBookForSymbols': {
                    'depth': 'depth/increase100',
                },
                'watchTrades': {
                    'ignoreDuplicates': true,
                },
                'ws': {
                    'inflate': true,
                },
                'timeframes': {
                    '1m': '1m',
                    '3m': '3m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '45m': '45m',
                    '1h': '1H',
                    '2h': '2H',
                    '3h': '3H',
                    '4h': '4H',
                    '1d': '1D',
                    '1w': '1W',
                    '1M': '1M',
                },
            },
            'streaming': {
                'keepAlive': 15000,
            },
        });
    }

    async subscribe (channel, symbol, type, params = {}) {
        const market = this.market (symbol);
        const url = this.implodeHostname (this.urls['api']['ws'][type]['public']);
        let request = {};
        let messageHash = undefined;
        const unsubscribe = this.safeBool (params, 'unsubscribe', false);
        let prefix = '';
        let requestOp = 'subscribe';
        if (unsubscribe) {
            params = this.omit (params, 'unsubscribe');
            prefix = 'unsubscribe::';
            requestOp = 'unsubscribe';
        }
        if (type === 'spot') {
            messageHash = 'spot/' + channel + ':' + market['id'];
            request = {
                'op': requestOp,
                'args': [ messageHash ],
            };
        } else {
            messageHash = 'futures/' + channel + ':' + market['id'];
            const speed = this.safeString (params, 'speed');
            if (speed !== undefined) {
                params = this.omit (params, 'speed');
                messageHash += ':' + speed;
            }
            request = {
                'action': requestOp,
                'args': [ messageHash ],
            };
        }
        messageHash = prefix + messageHash;
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async subscribeMultiple (channel: string, type: string, symbols: Strings = undefined, params = {}) {
        symbols = this.marketSymbols (symbols, type, false, true);
        const url = this.implodeHostname (this.urls['api']['ws'][type]['public']);
        const channelType = (type === 'spot') ? 'spot' : 'futures';
        const actionType = (type === 'spot') ? 'op' : 'action';
        const rawSubscriptions = [];
        const messageHashes = [];
        const subHashes = [];
        const unsubscribe = this.safeBool (params, 'unsubscribe', false);
        let prefix = '';
        let requestOp = 'subscribe';
        if (unsubscribe) {
            params = this.omit (params, 'unsubscribe');
            prefix = 'unsubscribe::';
            requestOp = 'unsubscribe';
        }
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            const message = channelType + '/' + channel + ':' + market['id'];
            const subHash = prefix + message;
            const messageHash = prefix + channel + ':' + market['symbol'];
            rawSubscriptions.push (message);
            subHashes.push (subHash);
            messageHashes.push (messageHash);
        }
        // as an exclusion, futures "tickers" need one generic request for all symbols
        // if ((type !== 'spot') && (channel === 'ticker')) {
        //     rawSubscriptions = [ channelType + '/' + channel ];
        // }
        // Exchange update from 2025-02-11 supports subscription by trading pair for swap
        const request: Dict = {
            'args': rawSubscriptions,
        };
        request[actionType] = requestOp;
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), subHashes);
    }

    /**
     * @method
     * @name bitmart#watchBalance
     * @see https://developer-pro.bitmart.com/en/spot/#private-balance-change
     * @see https://developer-pro.bitmart.com/en/futuresv2/#private-assets-channel
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        await this.authenticate (type, params);
        let request = {};
        if (type === 'spot') {
            request = {
                'op': 'subscribe',
                'args': [ 'spot/user/balance:BALANCE_UPDATE' ],
            };
        } else {
            request = {
                'action': 'subscribe',
                'args': [ 'futures/asset:USDT', 'futures/asset:BTC', 'futures/asset:ETH' ],
            };
        }
        const messageHash = 'balance:' + type;
        const url = this.implodeHostname (this.urls['api']['ws'][type]['private']);
        const client = this.client (url);
        this.setBalanceCache (client, type, messageHash);
        let fetchBalanceSnapshot = undefined;
        let awaitBalanceSnapshot = undefined;
        [ fetchBalanceSnapshot, params ] = this.handleOptionAndParams (params, 'watchBalance', 'fetchBalanceSnapshot', true);
        [ awaitBalanceSnapshot, params ] = this.handleOptionAndParams (params, 'watchBalance', 'awaitBalanceSnapshot', false);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future (type + ':fetchBalanceSnapshot');
        }
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    setBalanceCache (client: Client, type, subscribeHash) {
        if (subscribeHash in client.subscriptions) {
            return;
        }
        const options = this.safeDict (this.options, 'watchBalance');
        const snapshot = this.safeBool (options, 'fetchBalanceSnapshot', true);
        if (snapshot) {
            const messageHash = type + ':' + 'fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadBalanceSnapshot, client, messageHash, type);
            }
        }
        this.balance[type] = {};
        // without this comment, transpilation breaks for some reason...
    }

    async loadBalanceSnapshot (client, messageHash, type) {
        const response = await this.fetchBalance ({ 'type': type });
        this.balance[type] = this.extend (response, this.safeValue (this.balance, type, {}));
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve ();
            client.resolve (this.balance[type], 'balance:' + type);
        }
    }

    handleBalance (client: Client, message) {
        //
        // spot
        //    {
        //        "data":[
        //           {
        //              "balance_details":[
        //                 {
        //                    "av_bal":"0.206000000000000000000000000000",
        //                    "ccy":"LTC",
        //                    "fz_bal":"0.100000000000000000000000000000"
        //                 }
        //              ],
        //              "event_time":"1701632345416",
        //              "event_type":"TRANSACTION_COMPLETED"
        //           }
        //        ],
        //        "table":"spot/user/balance"
        //    }
        // swap
        //    {
        //        group: 'futures/asset:USDT',
        //        data: {
        //            currency: 'USDT',
        //            available_balance: '37.19688649135',
        //            position_deposit: '0.788687546',
        //            frozen_balance: '0'
        //        }
        //    }
        //
        const channel = this.safeString2 (message, 'table', 'group');
        const data = this.safeValue (message, 'data');
        if (data === undefined) {
            return;
        }
        const isSpot = (channel.indexOf ('spot') >= 0);
        const type = isSpot ? 'spot' : 'swap';
        this.balance[type]['info'] = message;
        if (isSpot) {
            if (!Array.isArray (data)) {
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const timestamp = this.safeInteger (message, 'event_time');
                this.balance[type]['timestamp'] = timestamp;
                this.balance[type]['datetime'] = this.iso8601 (timestamp);
                const balanceDetails = this.safeList (data[i], 'balance_details', []);
                for (let ii = 0; ii < balanceDetails.length; ii++) {
                    const rawBalance = balanceDetails[i];
                    const account = this.account ();
                    const currencyId = this.safeString (rawBalance, 'ccy');
                    const code = this.safeCurrencyCode (currencyId);
                    account['free'] = this.safeString (rawBalance, 'av_bal');
                    account['used'] = this.safeString (rawBalance, 'fz_bal');
                    this.balance[type][code] = account;
                }
            }
        } else {
            const currencyId = this.safeString (data, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (data, 'available_balance');
            account['used'] = this.safeString (data, 'frozen_balance');
            this.balance[type][code] = account;
        }
        this.balance[type] = this.safeBalance (this.balance[type]);
        const messageHash = 'balance:' + type;
        client.resolve (this.balance[type], messageHash);
    }

    /**
     * @method
     * @name bitmart#watchTrades
     * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-trade-channel
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name bitmart#watchTradesForSymbols
     * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-trade-channel
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let marketType = undefined;
        [ symbols, marketType, params ] = this.getParamsForMultipleSub ('watchTradesForSymbols', symbols, limit, params);
        const channelName = 'trade';
        const trades = await this.subscribeMultiple (channelName, marketType, symbols, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        const result = this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
        if (this.handleOption ('watchTrades', 'ignoreDuplicates', true)) {
            let filtered = this.removeRepeatedTradesFromArray (result);
            filtered = this.sortBy (filtered, 'timestamp');
            return filtered as Trade[];
        }
        return result as Trade[];
    }

    /**
     * @method
     * @name bitmart#unWatchTrades
     * @description unWatches from the stream channel
     * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-trade-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name bitmart#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel
     * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-trade-channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        let marketType = undefined;
        [ symbols, marketType, params ] = this.getParamsForMultipleSub ('unWatchTradesForSymbols', symbols, undefined, params);
        const channelName = 'trade';
        params = this.extend (params, { 'unsubscribe': true });
        return await this.subscribeMultiple (channelName, marketType, symbols, params);
    }

    getParamsForMultipleSub (methodName: string, symbols: string[], limit: Int = undefined, params = {}) {
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const length = symbols.length;
        if (length > 20) {
            throw new NotSupported (this.id + ' ' + methodName + '() accepts a maximum of 20 symbols in one request');
        }
        const market = this.market (symbols[0]);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params);
        return [ symbols, marketType, params ];
    }

    /**
     * @method
     * @name bitmart#watchTicker
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name bitmart#watchTickers
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchTickers', market, params);
        const ticker = await this.subscribeMultiple ('ticker', marketType, symbols, params);
        if (this.newUpdates) {
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name bitmart#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name bitmart#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchTickers', market, params);
        params = this.extend (params, { 'unsubscribe': true });
        return await this.subscribeMultiple ('ticker', marketType, symbols, params);
    }

    /**
     * @method
     * @name bitmart#watchBidsAsks
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const firstMarket = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchBidsAsks', firstMarket, params);
        const url = this.implodeHostname (this.urls['api']['ws'][marketType]['public']);
        const channelType = (marketType === 'spot') ? 'spot' : 'futures';
        const actionType = (marketType === 'spot') ? 'op' : 'action';
        let rawSubscriptions = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            rawSubscriptions.push (channelType + '/ticker:' + market['id']);
            messageHashes.push ('bidask:' + symbols[i]);
        }
        if (marketType !== 'spot') {
            rawSubscriptions = [ channelType + '/ticker' ];
        }
        const request: Dict = {
            'args': rawSubscriptions,
        };
        request[actionType] = 'subscribe';
        const newTickers = await this.watchMultiple (url, messageHashes, request, rawSubscriptions);
        if (this.newUpdates) {
            const tickers: Dict = {};
            tickers[newTickers['symbol']] = newTickers;
            return tickers;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message) {
        const table = this.safeString (message, 'table');
        const isSpot = (table !== undefined);
        let rawTickers = [];
        if (isSpot) {
            rawTickers = this.safeList (message, 'data', []);
        } else {
            rawTickers = [ this.safeDict (message, 'data', {}) ];
        }
        if (!rawTickers.length) {
            return;
        }
        for (let i = 0; i < rawTickers.length; i++) {
            const ticker = this.parseWsBidAsk (rawTickers[i]);
            const symbol = ticker['symbol'];
            this.bidsasks[symbol] = ticker;
            const messageHash = 'bidask:' + symbol;
            client.resolve (ticker, messageHash);
        }
    }

    parseWsBidAsk (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (ticker, 'ms_t');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString2 (ticker, 'ask_px', 'ask_price'),
            'askVolume': this.safeString2 (ticker, 'ask_sz', 'ask_vol'),
            'bid': this.safeString2 (ticker, 'bid_px', 'bid_price'),
            'bidVolume': this.safeString2 (ticker, 'bid_sz', 'bid_vol'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bitmart#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://developer-pro.bitmart.com/en/spot/#private-order-progress
     * @see https://developer-pro.bitmart.com/en/futuresv2/#private-order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            market = this.market (symbol);
            messageHash = 'orders::' + symbol;
        }
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        await this.authenticate (type, params);
        let request = undefined;
        if (type === 'spot') {
            let argsRequest = 'spot/user/order:';
            if (symbol !== undefined) {
                argsRequest += market['id'];
            } else {
                argsRequest = 'spot/user/orders:ALL_SYMBOLS';
            }
            request = {
                'op': 'subscribe',
                'args': [ argsRequest ],
            };
        } else {
            request = {
                'action': 'subscribe',
                'args': [ 'futures/order' ],
            };
        }
        const url = this.implodeHostname (this.urls['api']['ws'][type]['private']);
        const newOrders = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        if (this.newUpdates) {
            return newOrders;
        }
        return this.filterBySymbolSinceLimit (this.orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name bitmart#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://developer-pro.bitmart.com/en/spot/#private-order-progress
     * @see https://developer-pro.bitmart.com/en/futuresv2/#private-order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = 'unsubscribe::orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            market = this.market (symbol);
            if (market['swap']) {
                throw new NotSupported (this.id + ' unWatchOrders() does not support a symbol for swap markets, unWatch from all markets only');
            }
            messageHash += '::' + symbol;
        }
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        await this.authenticate (type, params);
        let request = undefined;
        if (type === 'spot') {
            let argsRequest = 'spot/user/order:';
            if (symbol !== undefined) {
                argsRequest += market['id'];
            } else {
                argsRequest = 'spot/user/orders:ALL_SYMBOLS';
            }
            request = {
                'op': 'unsubscribe',
                'args': [ argsRequest ],
            };
        } else {
            request = {
                'action': 'unsubscribe',
                'args': [ 'futures/order' ],
            };
        }
        const url = this.implodeHostname (this.urls['api']['ws'][type]['private']);
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    handleOrders (client: Client, message) {
        //
        // spot
        //    {
        //        "data":[
        //            {
        //                "symbol": "LTC_USDT",
        //                "notional": '',
        //                "side": "buy",
        //                "last_fill_time": "0",
        //                "ms_t": "1646216634000",
        //                "type": "limit",
        //                "filled_notional": "0.000000000000000000000000000000",
        //                "last_fill_price": "0",
        //                "size": "0.500000000000000000000000000000",
        //                "price": "50.000000000000000000000000000000",
        //                "last_fill_count": "0",
        //                "filled_size": "0.000000000000000000000000000000",
        //                "margin_trading": "0",
        //                "state": "8",
        //                "order_id": "24807076628",
        //                "order_type": "0"
        //              }
        //        ],
        //        "table":"spot/user/order"
        //    }
        // swap
        //    {
        //        "group":"futures/order",
        //        "data":[
        //           {
        //              "action":2,
        //              "order":{
        //                 "order_id":"2312045036986775",
        //                 "client_order_id":"",
        //                 "price":"71.61707928",
        //                 "size":"1",
        //                 "symbol":"LTCUSDT",
        //                 "state":1,
        //                 "side":4,
        //                 "type":"market",
        //                 "leverage":"1",
        //                 "open_type":"cross",
        //                 "deal_avg_price":"0",
        //                 "deal_size":"0",
        //                 "create_time":1701625324646,
        //                 "update_time":1701625324640,
        //                 "plan_order_id":"",
        //                 "last_trade":null
        //              }
        //           }
        //        ]
        //    }
        //
        const orders = this.safeList (message, 'data');
        if (orders === undefined) {
            return;
        }
        const ordersLength = orders.length;
        const newOrders = [];
        const symbols: Dict = {};
        if (ordersLength > 0) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            for (let i = 0; i < orders.length; i++) {
                const order = this.parseWsOrder (orders[i]);
                stored.append (order);
                newOrders.push (order);
                const symbol = order['symbol'];
                symbols[symbol] = true;
            }
        }
        const messageHash = 'orders';
        const symbolKeys = Object.keys (symbols);
        for (let i = 0; i < symbolKeys.length; i++) {
            const symbol = symbolKeys[i];
            const symbolSpecificMessageHash = messageHash + '::' + symbol;
            client.resolve (newOrders, symbolSpecificMessageHash);
        }
        client.resolve (newOrders, messageHash);
    }

    parseWsOrder (order: Dict, market: Market = undefined) {
        //
        // spot
        //    {
        //        "symbol": "LTC_USDT",
        //        "notional": '',
        //        "side": "buy",
        //        "last_fill_time": "0",
        //        "ms_t": "1646216634000",
        //        "type": "limit",
        //        "filled_notional": "0.000000000000000000000000000000",
        //        "last_fill_price": "0",
        //        "size": "0.500000000000000000000000000000",
        //        "price": "50.000000000000000000000000000000",
        //        "last_fill_count": "0",
        //        "filled_size": "0.000000000000000000000000000000",
        //        "margin_trading": "0",
        //        "state": "8",
        //        "order_id": "24807076628",
        //        "order_type": "0"
        //    }
        // swap
        //    {
        //       "action":2,
        //       "order":{
        //          "order_id":"2312045036986775",
        //          "client_order_id":"",
        //          "price":"71.61707928",
        //          "size":"1",
        //          "symbol":"LTCUSDT",
        //          "state":1,
        //          "side":4,
        //          "type":"market",
        //          "leverage":"1",
        //          "open_type":"cross",
        //          "deal_avg_price":"0",
        //          "deal_size":"0",
        //          "create_time":1701625324646,
        //          "update_time":1701625324640,
        //          "plan_order_id":"",
        //          "last_trade":null
        //       }
        //    }
        //
        const action = this.safeNumber (order, 'action');
        const isSpot = (action === undefined);
        if (isSpot) {
            const marketId = this.safeString (order, 'symbol');
            market = this.safeMarket (marketId, market, '_', 'spot');
            const id = this.safeString (order, 'order_id');
            const clientOrderId = this.safeString (order, 'clientOid');
            const price = this.safeString (order, 'price');
            const filled = this.safeString (order, 'filled_size');
            const amount = this.safeString (order, 'size');
            const type = this.safeString (order, 'type');
            const rawState = this.safeString (order, 'state');
            const status = this.parseOrderStatusByType (market['type'], rawState);
            const timestamp = this.safeInteger (order, 'ms_t');
            const symbol = market['symbol'];
            const side = this.safeStringLower (order, 'side');
            return this.safeOrder ({
                'info': order,
                'symbol': symbol,
                'id': id,
                'clientOrderId': clientOrderId,
                'timestamp': undefined,
                'datetime': undefined,
                'lastTradeTimestamp': timestamp,
                'type': type,
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': side,
                'price': price,
                'stopPrice': undefined,
                'triggerPrice': undefined,
                'amount': amount,
                'cost': undefined,
                'average': undefined,
                'filled': filled,
                'remaining': undefined,
                'status': status,
                'fee': undefined,
                'trades': undefined,
            }, market);
        } else {
            const orderInfo = this.safeDict (order, 'order');
            const marketId = this.safeString (orderInfo, 'symbol');
            const symbol = this.safeSymbol (marketId, market, '', 'swap');
            const orderId = this.safeString (orderInfo, 'order_id');
            const timestamp = this.safeInteger (orderInfo, 'create_time');
            const updatedTimestamp = this.safeInteger (orderInfo, 'update_time');
            const lastTrade = this.safeDict (orderInfo, 'last_trade');
            const cachedOrders = this.orders;
            const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
            const cachedOrder = this.safeValue (orders, orderId);
            let trades = undefined;
            if (cachedOrder !== undefined) {
                trades = this.safeValue (order, 'trades');
            }
            if (lastTrade !== undefined) {
                if (trades === undefined) {
                    trades = [];
                }
                trades.push (lastTrade);
            }
            return this.safeOrder ({
                'info': order,
                'symbol': symbol,
                'id': orderId,
                'clientOrderId': this.safeString (orderInfo, 'client_order_id'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastTradeTimestamp': updatedTimestamp,
                'type': this.safeString (orderInfo, 'type'),
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': this.parseWsOrderSide (this.safeString (orderInfo, 'side')),
                'price': this.safeString (orderInfo, 'price'),
                'stopPrice': undefined,
                'triggerPrice': undefined,
                'amount': this.safeString (orderInfo, 'size'),
                'cost': undefined,
                'average': this.safeString (orderInfo, 'deal_avg_price'),
                'filled': this.safeString (orderInfo, 'deal_size'),
                'remaining': undefined,
                'status': this.parseWsOrderStatus (this.safeString (order, 'action')),
                'fee': undefined,
                'trades': trades,
            }, market);
        }
    }

    parseWsOrderStatus (statusId) {
        const statuses: Dict = {
            '1': 'closed', // match deal
            '2': 'open', // submit order
            '3': 'canceled', // cancel order
            '4': 'closed', // liquidate cancel order
            '5': 'canceled', // adl cancel order
            '6': 'open', // part liquidate
            '7': 'open', // bankrupty order
            '8': 'closed', // passive adl match deal
            '9': 'closed', // active adl match deal
        };
        return this.safeString (statuses, statusId, statusId);
    }

    parseWsOrderSide (sideId) {
        const sides: Dict = {
            '1': 'buy', // buy_open_long
            '2': 'buy', // buy_close_short
            '3': 'sell', // sell_close_long
            '4': 'sell', // sell_open_short
        };
        return this.safeString (sides, sideId, sideId);
    }

    /**
     * @method
     * @name bitmart#watchPositions
     * @see https://developer-pro.bitmart.com/en/futures/#private-position-channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const type = 'swap';
        await this.authenticate (type, params);
        symbols = this.marketSymbols (symbols, 'swap', true, true, false);
        let messageHash = 'positions';
        if (symbols !== undefined) {
            messageHash += '::' + symbols.join (',');
        }
        const subscriptionHash = 'futures/position';
        const request: Dict = {
            'action': 'subscribe',
            'args': [ 'futures/position' ],
        };
        const url = this.implodeHostname (this.urls['api']['ws'][type]['private']);
        const newPositions = await this.watch (url, messageHash, this.deepExtend (request, params), subscriptionHash);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit);
    }

    /**
     * @method
     * @name bitmart#unWatchPositions
     * @description unWatches all open positions
     * @see https://developer-pro.bitmart.com/en/futures/#private-position-channel
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    async unWatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length > 0) {
                throw new NotSupported (this.id + ' unWatchPositions() does not support a list of symbols, unWatch from all markets only');
            }
        }
        await this.loadMarkets ();
        const request: Dict = {
            'action': 'unsubscribe',
            'args': [ 'futures/position' ],
        };
        const messageHash = 'unsubscribe::positions';
        const url = this.implodeHostname (this.urls['api']['ws']['swap']['private']);
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    handlePositions (client: Client, message) {
        //
        //    {
        //        "group":"futures/position",
        //        "data":[
        //           {
        //              "symbol":"LTCUSDT",
        //              "hold_volume":"5",
        //              "position_type":2,
        //              "open_type":2,
        //              "frozen_volume":"0",
        //              "close_volume":"0",
        //              "hold_avg_price":"71.582",
        //              "close_avg_price":"0",
        //              "open_avg_price":"71.582",
        //              "liquidate_price":"0",
        //              "create_time":1701623327513,
        //              "update_time":1701627620439
        //           },
        //           {
        //              "symbol":"LTCUSDT",
        //              "hold_volume":"6",
        //              "position_type":1,
        //              "open_type":2,
        //              "frozen_volume":"0",
        //              "close_volume":"0",
        //              "hold_avg_price":"71.681666666666666667",
        //              "close_avg_price":"0",
        //              "open_avg_price":"71.681666666666666667",
        //              "liquidate_price":"0",
        //              "create_time":1701621167225,
        //              "update_time":1701628152614
        //           }
        //        ]
        //    }
        //
        const data = this.safeList (message, 'data', []);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < data.length; i++) {
            const rawPosition = data[i];
            const position = this.parseWsPosition (rawPosition);
            newPositions.push (position);
            cache.append (position);
        }
        const messageHashes = this.findMessageHashes (client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const positions = this.filterByArray (newPositions, 'symbol', symbols, false);
            if (!this.isEmpty (positions)) {
                client.resolve (positions, messageHash);
            }
        }
        client.resolve (newPositions, 'positions');
    }

    parseWsPosition (position, market: Market = undefined) {
        //
        //    {
        //       "symbol":"LTCUSDT",
        //       "hold_volume":"6",
        //       "position_type":1,
        //       "open_type":2,
        //       "frozen_volume":"0",
        //       "close_volume":"0",
        //       "hold_avg_price":"71.681666666666666667",
        //       "close_avg_price":"0",
        //       "open_avg_price":"71.681666666666666667",
        //       "liquidate_price":"0",
        //       "create_time":1701621167225,
        //       "update_time":1701628152614
        //    }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'swap');
        const symbol = market['symbol'];
        const openTimestamp = this.safeInteger (position, 'create_time');
        const timestamp = this.safeInteger (position, 'update_time');
        const side = this.safeInteger (position, 'position_type');
        const marginModeId = this.safeInteger (position, 'open_type');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': openTimestamp,
            'datetime': this.iso8601 (openTimestamp),
            'lastUpdateTimestamp': timestamp,
            'hedged': undefined,
            'side': (side === 1) ? 'long' : 'short',
            'contracts': this.safeNumber (position, 'hold_volume'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'entryPrice': this.safeNumber (position, 'open_avg_price'),
            'markPrice': this.safeNumber (position, 'hold_avg_price'),
            'lastPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'realizedPnl': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidate_price'),
            'marginMode': (marginModeId === 1) ? 'isolated' : 'cross',
            'percentage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    handleTrade (client: Client, message) {
        //
        // spot
        //    {
        //        "table": "spot/trade",
        //        "data": [
        //            {
        //                "price": "52700.50",
        //                "s_t": 1630982050,
        //                "side": "buy",
        //                "size": "0.00112",
        //                "symbol": "BTC_USDT"
        //            },
        //        ]
        //    }
        //
        // swap
        //    {
        //        "group":"futures/trade:BTCUSDT",
        //        "data":[
        //           {
        //              "trade_id":6798697637,
        //              "symbol":"BTCUSDT",
        //              "deal_price":"39735.8",
        //              "deal_vol":"2",
        //              "way":1,
        //              "created_at":"2023-12-03T15:48:23.517518538Z",
        //              "m": true,
        //           }
        //        ]
        //    }
        //
        const data = this.safeList (message, 'data');
        if (data === undefined) {
            return;
        }
        let symbol = undefined;
        const length = data.length;
        const isSwap = ('group' in message);
        if (isSwap) {
            // in swap, chronologically decreasing: 1709536849322, 1709536848954,
            for (let i = 0; i < length; i++) {
                const index = length - i - 1;
                symbol = this.handleTradeLoop (data[index]);
            }
        } else {
            // in spot, chronologically increasing: 1709536771200, 1709536771226,
            for (let i = 0; i < length; i++) {
                symbol = this.handleTradeLoop (data[i]);
            }
        }
        client.resolve (this.trades[symbol], 'trade:' + symbol);
    }

    handleTradeLoop (entry) {
        const trade = this.parseWsTrade (entry);
        const symbol = trade['symbol'];
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        if (this.safeValue (this.trades, symbol) === undefined) {
            this.trades[symbol] = new ArrayCache (tradesLimit);
        }
        const stored = this.trades[symbol];
        stored.append (trade);
        return symbol;
    }

    parseWsTrade (trade: Dict, market: Market = undefined) {
        //
        // spot
        //     {
        //         "ms_t": 1740320841473,
        //         "price": "2806.54",
        //         "s_t": 1740320841,
        //         "side": "sell",
        //         "size": "0.77598",
        //         "symbol": "ETH_USDT"
        //     }
        //
        // swap
        //     {
        //         "trade_id": "3000000245258661",
        //         "symbol": "ETHUSDT",
        //         "deal_price": "2811.1",
        //         "deal_vol": "1858",
        //         "way": 2,
        //         "m": true,
        //         "created_at": "2025-02-23T13:59:59.646490751Z"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        let timestamp = this.safeInteger (trade, 'ms_t');
        let datetime: Str = undefined;
        if (timestamp === undefined) {
            datetime = this.safeString (trade, 'created_at');
            timestamp = this.parse8601 (datetime);
        } else {
            datetime = this.iso8601 (timestamp);
        }
        let takerOrMaker = undefined; // true for public trades
        let side = this.safeString (trade, 'side');
        const buyerMaker = this.safeBool (trade, 'm');
        if (buyerMaker !== undefined) {
            if (side === undefined) {
                if (buyerMaker) {
                    side = 'sell';
                } else {
                    side = 'buy';
                }
            }
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': this.safeString2 (trade, 'price', 'deal_price'),
            'amount': this.safeString2 (trade, 'size', 'deal_vol'),
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': undefined,
        }, market);
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        "data": [
        //            {
        //                "base_volume_24h": "78615593.81",
        //                "high_24h": "52756.97",
        //                "last_price": "52638.31",
        //                "low_24h": "50991.35",
        //                "open_24h": "51692.03",
        //                "s_t": 1630981727,
        //                "symbol": "BTC_USDT"
        //            }
        //        ],
        //        "table": "spot/ticker"
        //    }
        //
        //     {
        //         "data": {
        //             "symbol": "ETHUSDT",
        //             "last_price": "2807.73",
        //             "volume_24": "2227011952",
        //             "range": "0.0273398194664491",
        //             "mark_price": "2807.5",
        //             "index_price": "2808.71047619",
        //             "ask_price": "2808.04",
        //             "ask_vol": "7371",
        //             "bid_price": "2807.28",
        //             "bid_vol": "3561"
        //         },
        //         "group": "futures/ticker:ETHUSDT@100ms"
        //     }
        //
        this.handleBidAsk (client, message);
        const table = this.safeString (message, 'table');
        const isSpot = (table !== undefined);
        let rawTickers = [];
        if (isSpot) {
            rawTickers = this.safeList (message, 'data', []);
        } else {
            rawTickers = [ this.safeDict (message, 'data', {}) ];
        }
        if (!rawTickers.length) {
            return;
        }
        for (let i = 0; i < rawTickers.length; i++) {
            const ticker = isSpot ? this.parseTicker (rawTickers[i]) : this.parseWsSwapTicker (rawTickers[i]);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = 'ticker:' + symbol;
            client.resolve (ticker, messageHash);
        }
    }

    parseWsSwapTicker (ticker, market: Market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "last_price": "2807.73",
        //         "volume_24": "2227011952",
        //         "range": "0.0273398194664491",
        //         "mark_price": "2807.5",
        //         "index_price": "2808.71047619",
        //         "ask_price": "2808.04",
        //         "ask_vol": "7371",
        //         "bid_price": "2807.28",
        //         "bid_vol": "3561"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, '', 'swap'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid_price'),
            'bidVolume': this.safeString (ticker, 'bid_vol'),
            'ask': this.safeString (ticker, 'ask_price'),
            'askVolume': this.safeString (ticker, 'ask_vol'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume_24'),
            'info': ticker,
            'markPrice': this.safeString (ticker, 'mark_price'),
            'indexPrice': this.safeString (ticker, 'index_price'),
        }, market);
    }

    /**
     * @method
     * @name bitmart#watchOHLCV
     * @see https://developer-pro.bitmart.com/en/spot/#public-kline-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-klinebin-channel
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const market = this.market (symbol);
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('watchOHLCV', market, params);
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const interval = this.safeString (timeframes, timeframe);
        let name = undefined;
        if (type === 'spot') {
            name = 'kline' + interval;
        } else {
            name = 'klineBin' + interval;
        }
        const ohlcv = await this.subscribe (name, symbol, type, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name bitmart#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developer-pro.bitmart.com/en/spot/#public-kline-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-klinebin-channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const market = this.market (symbol);
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('unWatchOHLCV', market, params);
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const interval = this.safeString (timeframes, timeframe);
        let name = undefined;
        if (type === 'spot') {
            name = 'kline' + interval;
        } else {
            name = 'klineBin' + interval;
        }
        params = this.extend (params, { 'unsubscribe': true });
        return await this.subscribe (name, symbol, type, params);
    }

    handleOHLCV (client: Client, message) {
        //
        //    {
        //        "data": [
        //            {
        //                "candle": [
        //                    1631056350,
        //                    "46532.83",
        //                    "46555.71",
        //                    "46511.41",
        //                    "46555.71",
        //                    "0.25"
        //                ],
        //                "symbol": "BTC_USDT"
        //            }
        //        ],
        //        "table": "spot/kline1m"
        //    }
        // swap
        //    {
        //        "group":"futures/klineBin1m:BTCUSDT",
        //        "data":{
        //           "symbol":"BTCUSDT",
        //           "items":[
        //              {
        //                 "o":"39635.8",
        //                 "h":"39636",
        //                 "l":"39614.4",
        //                 "c":"39629.7",
        //                 "v":"31852",
        //                 "ts":1701617761
        //              }
        //           ]
        //        }
        //    }
        //
        const channel = this.safeString2 (message, 'table', 'group');
        const isSpot = (channel.indexOf ('spot') >= 0);
        const data = this.safeValue (message, 'data');
        if (data === undefined) {
            return;
        }
        const parts = channel.split ('/');
        const part1 = this.safeString (parts, 1, '');
        let interval = part1.replace ('kline', '');
        interval = interval.replace ('Bin', '');
        const intervalParts = interval.split (':');
        interval = this.safeString (intervalParts, 0);
        // use a reverse lookup in a static map instead
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const timeframe = this.findTimeframe (interval, timeframes);
        const duration = this.parseTimeframe (timeframe);
        const durationInMs = duration * 1000;
        if (isSpot) {
            for (let i = 0; i < data.length; i++) {
                const marketId = this.safeString (data[i], 'symbol');
                const market = this.safeMarket (marketId);
                const symbol = market['symbol'];
                const rawOHLCV = this.safeList (data[i], 'candle');
                const parsed = this.parseOHLCV (rawOHLCV, market);
                parsed[0] = this.parseToInt (parsed[0] / durationInMs) * durationInMs;
                this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
                let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
                if (stored === undefined) {
                    const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                    stored = new ArrayCacheByTimestamp (limit);
                    this.ohlcvs[symbol][timeframe] = stored;
                }
                stored.append (parsed);
                const messageHash = channel + ':' + marketId;
                client.resolve (stored, messageHash);
            }
        } else {
            const marketId = this.safeString (data, 'symbol');
            const market = this.safeMarket (marketId, undefined, undefined, 'swap');
            const symbol = market['symbol'];
            const items = this.safeList (data, 'items', []);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            for (let i = 0; i < items.length; i++) {
                const candle = items[i];
                const parsed = this.parseOHLCV (candle, market);
                stored.append (parsed);
            }
            client.resolve (stored, channel);
        }
    }

    /**
     * @method
     * @name bitmart#watchOrderBook
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-all-channel
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-depth-channel
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.speed] *futures only* '100ms' or '200ms'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const options = this.safeDict (this.options, 'watchOrderBook', {});
        let depth = this.safeString (options, 'depth', 'depth/increase100');
        symbol = this.symbol (symbol);
        const market = this.market (symbol);
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrderBook', market, params);
        if (type === 'swap' && depth === 'depth/increase100') {
            depth = 'depth50';
        }
        const orderbook = await this.subscribe (depth, symbol, type, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name bitmart#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-all-channel
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-depth-channel
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const options = this.safeDict (this.options, 'watchOrderBook', {});
        let depth = this.safeString (options, 'depth', 'depth/increase100');
        symbol = this.symbol (symbol);
        const market = this.market (symbol);
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('unWatchOrderBook', market, params);
        if (type === 'swap' && depth === 'depth/increase100') {
            depth = 'depth50';
        }
        params = this.extend (params, { 'unsubscribe': true });
        return await this.subscribe (depth, symbol, type, params);
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

    handleOrderBookMessage (client: Client, message, orderbook) {
        //
        //     {
        //         "asks": [
        //             [ '46828.38', "0.21847" ],
        //             [ '46830.68', "0.08232" ],
        //             [ '46832.08', "0.09285" ],
        //             [ '46837.82', "0.02028" ],
        //             [ '46839.43', "0.15068" ]
        //         ],
        //         "bids": [
        //             [ '46820.78', "0.00444" ],
        //             [ '46814.33', "0.00234" ],
        //             [ '46813.50', "0.05021" ],
        //             [ '46808.14', "0.00217" ],
        //             [ '46808.04', "0.00013" ]
        //         ],
        //         "ms_t": 1631044962431,
        //         "symbol": "BTC_USDT"
        //     }
        //
        const asks = this.safeList (message, 'asks', []);
        const bids = this.safeList (message, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.safeInteger (message, 'ms_t');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
        //
        // spot depth-all
        //
        //    {
        //        "data": [
        //            {
        //                "asks": [
        //                    [ '46828.38', "0.21847" ],
        //                    [ '46830.68', "0.08232" ],
        //                    ...
        //                ],
        //                "bids": [
        //                    [ '46820.78', "0.00444" ],
        //                    [ '46814.33', "0.00234" ],
        //                    ...
        //                ],
        //                "ms_t": 1631044962431,
        //                "symbol": "BTC_USDT"
        //            }
        //        ],
        //        "table": "spot/depth5"
        //    }
        //
        // spot increse depth snapshot
        //
        //    {
        //        "data":[
        //           {
        //               "asks":[
        //                   [ "43652.52", "0.02039" ],
        //                   ...
        //                ],
        //                "bids":[
        //                   [ "43652.51", "0.00500" ],
        //                   ...
        //                ],
        //                "ms_t":1703376836487,
        //                "symbol":"BTC_USDT",
        //                "type":"snapshot", // or update
        //                "version":2141731
        //           }
        //        ],
        //        "table":"spot/depth/increase100"
        //    }
        //
        // swap
        //
        //    {
        //        "group":"futures/depth50:BTCUSDT",
        //        "data":{
        //           "symbol":"BTCUSDT",
        //           "way":1,
        //           "depths":[
        //              {
        //                 "price":"39509.8",
        //                 "vol":"2379"
        //              },
        //              {
        //                 "price":"39509.6",
        //                 "vol":"6815"
        //              },
        //              ...
        //           ],
        //           "ms_t":1701566021194
        //        }
        //    }
        //
        const isSpot = ('table' in message);
        let datas = [];
        if (isSpot) {
            datas = this.safeList (message, 'data', datas);
        } else {
            const orderBookEntry = this.safeDict (message, 'data');
            if (orderBookEntry !== undefined) {
                datas.push (orderBookEntry);
            }
        }
        const length = datas.length;
        if (length <= 0) {
            return;
        }
        const channelName = this.safeString2 (message, 'table', 'group');
        // find limit subscribed to
        const limitsToCheck = [ '100', '50', '20', '10', '5' ];
        let limit = 0;
        for (let i = 0; i < limitsToCheck.length; i++) {
            const limitString = limitsToCheck[i];
            if (channelName.indexOf (limitString) >= 0) {
                limit = this.parseToInt (limitString);
                break;
            }
        }
        if (isSpot) {
            const channel = channelName.replace ('spot/', '');
            for (let i = 0; i < datas.length; i++) {
                const update = datas[i];
                const marketId = this.safeString (update, 'symbol');
                const symbol = this.safeSymbol (marketId);
                if (!(symbol in this.orderbooks)) {
                    const ob = this.orderBook ({}, limit);
                    ob['symbol'] = symbol;
                    this.orderbooks[symbol] = ob;
                }
                const orderbook = this.orderbooks[symbol];
                const type = this.safeString (update, 'type');
                if ((type === 'snapshot') || (!(channelName.indexOf ('increase') >= 0))) {
                    orderbook.reset ({});
                }
                this.handleOrderBookMessage (client, update, orderbook);
                const timestamp = this.safeInteger (update, 'ms_t');
                if (orderbook['timestamp'] === undefined) {
                    orderbook['timestamp'] = timestamp;
                    orderbook['datetime'] = this.iso8601 (timestamp);
                }
                const messageHash = channelName + ':' + marketId;
                client.resolve (orderbook, messageHash);
                // resolve ForSymbols
                const messageHashForMulti = channel + ':' + symbol;
                client.resolve (orderbook, messageHashForMulti);
            }
        } else {
            const tableParts = channelName.split (':');
            const channel = tableParts[0].replace ('futures/', '');
            const data = datas[0]; // contract markets always contain only one member
            const depths = data['depths'];
            const marketId = this.safeString (data, 'symbol');
            const symbol = this.safeSymbol (marketId);
            if (!(symbol in this.orderbooks)) {
                const ob = this.orderBook ({}, limit);
                ob['symbol'] = symbol;
                this.orderbooks[symbol] = ob;
            }
            const orderbook = this.orderbooks[symbol];
            const way = this.safeInteger (data, 'way');
            const side = (way === 1) ? 'bids' : 'asks';
            if (way === 1) {
                orderbook[side] = new Bids ([], limit);
            } else {
                orderbook[side] = new Asks ([], limit);
            }
            for (let i = 0; i < depths.length; i++) {
                const depth = depths[i];
                const price = this.safeNumber (depth, 'price');
                const amount = this.safeNumber (depth, 'vol');
                const orderbookSide = this.safeValue (orderbook, side);
                orderbookSide.store (price, amount);
            }
            const bidsLength = orderbook['bids'].length;
            const asksLength = orderbook['asks'].length;
            if ((bidsLength === 0) || (asksLength === 0)) {
                return;
            }
            const timestamp = this.safeInteger (data, 'ms_t');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            const messageHash = channelName;
            client.resolve (orderbook, messageHash);
            // resolve ForSymbols
            const messageHashForMulti = channel + ':' + symbol;
            client.resolve (orderbook, messageHashForMulti);
        }
    }

    /**
     * @method
     * @name bitmart#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] the type of order book to subscribe to, default is 'depth/increase100', also accepts 'depth5' or 'depth20' or depth50
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        let type = undefined;
        [ symbols, type, params ] = this.getParamsForMultipleSub ('watchOrderBookForSymbols', symbols, limit, params);
        let channel = undefined;
        [ channel, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'depth', 'depth/increase100');
        if (type === 'swap' && channel === 'depth/increase100') {
            channel = 'depth50';
        }
        const orderbook = await this.subscribeMultiple (channel, type, symbols, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name bitmart#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] the type of order book to subscribe to, default is 'depth/increase100', also accepts 'depth5' or 'depth20' or depth50
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        let type = undefined;
        [ symbols, type, params ] = this.getParamsForMultipleSub ('unWatchOrderBookForSymbols', symbols, undefined, params);
        let channel = undefined;
        [ channel, params ] = this.handleOptionAndParams (params, 'unWatchOrderBookForSymbols', 'depth', 'depth/increase100');
        if (type === 'swap' && channel === 'depth/increase100') {
            channel = 'depth50';
        }
        params = this.extend (params, { 'unsubscribe': true });
        return await this.subscribeMultiple (channel, type, symbols, params);
    }

    /**
     * @method
     * @name bitmart#watchFundingRate
     * @description watch the current funding rate
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-funding-rate-channel
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const fundingRate = await this.watchFundingRates ([ symbol ], params);
        return fundingRate[symbol];
    }

    /**
     * @method
     * @name bitmart#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-funding-rate-channel
     * @param {string[]} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}, indexed by market symbols
     */
    async watchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchFundingRates() requires an array of symbols');
        }
        await this.loadMarkets ();
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchFundingRates', market, params);
        const fundingRate = await this.subscribeMultiple ('fundingRate', marketType, symbols, params);
        if (this.newUpdates) {
            const fundingRates: Dict = {};
            fundingRates[fundingRate['symbol']] = fundingRate;
            return fundingRates;
        }
        return this.filterByArray (this.fundingRates, 'symbol', symbols);
    }

    handleFundingRate (client: Client, message) {
        //
        //     {
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "fundingRate": "0.0000561",
        //             "fundingTime": 1770978448000,
        //             "nextFundingRate": "-0.0000195",
        //             "nextFundingTime": 1770998400000,
        //             "funding_upper_limit": "0.0375",
        //             "funding_lower_limit": "-0.0375",
        //             "ts": 1770978448970
        //         },
        //         "group": "futures/fundingRate:BTCUSDT"
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const fundingRate = this.parseFundingRate (data);
        const symbol = fundingRate['symbol'];
        this.fundingRates[symbol] = fundingRate;
        const messageHash = 'fundingRate:' + symbol;
        client.resolve (fundingRate, messageHash);
    }

    async authenticate (type, params = {}) {
        this.checkRequiredCredentials ();
        const url = this.implodeHostname (this.urls['api']['ws'][type]['private']);
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds ().toString ();
            const memo = this.uid;
            const path = 'bitmart.WebSocket';
            const auth = timestamp + '#' + memo + '#' + path;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            let request = undefined;
            if (type === 'spot') {
                request = {
                    'op': 'login',
                    'args': [
                        this.apiKey,
                        timestamp,
                        signature,
                    ],
                };
            } else {
                request = {
                    'action': 'access',
                    'args': [
                        this.apiKey,
                        timestamp,
                        signature,
                        'web',
                    ],
                };
            }
            const message = this.extend (request, params);
            this.watch (url, messageHash, message, messageHash);
        }
        return await future;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //    {"event":"subscribe","channel":"spot/depth:BTC-USDT"}
        //
        return message;
    }

    handleAuthenticate (client: Client, message) {
        //
        // spot
        //    { event: "login" }
        // swap
        //    { action: 'access', success: true }
        //
        const messageHash = 'authenticated';
        const future = this.safeValue (client.futures, messageHash);
        future.resolve (true);
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //    { event: "error", message: "Invalid sign", errorCode: 30013 }
        //    {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
        //    {
        //        action: '',
        //        group: 'futures/trade:BTCUSDT',
        //        success: false,
        //        request: { action: '', args: [ 'futures/trade:BTCUSDT' ] },
        //        error: 'Invalid action [] for group [futures/trade:BTCUSDT]'
        //    }
        //
        const errorCode = this.safeString (message, 'errorCode');
        const error = this.safeString (message, 'error');
        try {
            if (errorCode !== undefined || error !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue (message, 'message', error);
                this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                const action = this.safeString (message, 'action');
                if (action === 'access') {
                    throw new AuthenticationError (feedback);
                }
                throw new ExchangeError (feedback);
            }
            return false;
        } catch (e) {
            if ((e instanceof AuthenticationError)) {
                const messageHash = 'authenticated';
                client.reject (e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            client.reject (e);
            return true;
        }
    }

    handleUnSubscription (client: Client, message) {
        //
        // spot
        //     {
        //         "topic": "spot/ticker:ETH_USDT",
        //         "event": "unsubscribe"
        //     }
        //
        // swap
        //     {
        //         "action": "unsubscribe",
        //         "group": "futures/ticker:ETHUSDT",
        //         "success": true,
        //         "request": {
        //             "action": "unsubscribe",
        //             "args": [
        //                 "futures/ticker:ETHUSDT"
        //             ]
        //         }
        //     }
        //
        const messageTopic = this.safeString2 (message, 'topic', 'group');
        const unSubMessageTopic = 'unsubscribe::' + messageTopic;
        // one message includes info about one unsubscription only even if we requested multiple
        // so we can not just create subscription object in unWatch method and use it here
        // we need to reconstruct subscription params from the messageTopic
        const subscription = this.getUnSubParams (messageTopic);
        const subHash = this.safeString (subscription, 'subHash');
        const unsubHash = 'unsubscribe::' + subHash;
        const subHashIsPrefix = this.safeBool (subscription, 'subHashIsPrefix', false);
        // clean up both ways of storing subscription and unsubscription
        this.cleanUnsubscription (client, subHash, unsubHash, subHashIsPrefix);
        this.cleanUnsubscription (client, messageTopic, unSubMessageTopic, subHashIsPrefix);
        this.cleanCache (subscription);
    }

    getUnSubParams (messageTopic) {
        const parts = messageTopic.split (':');
        const channel = this.safeString (parts, 0);
        const marketTypeAndTopic = channel.split ('/');
        const rawMarketType = this.safeStringLower (marketTypeAndTopic, 0);
        const marketType = this.parseMarketType (rawMarketType);
        let topic = this.safeString (marketTypeAndTopic, 1);
        const thirdPart = this.safeString (marketTypeAndTopic, 2);
        if (thirdPart !== undefined) {
            topic += '/' + thirdPart;
        }
        const marketId = this.safeString (parts, 1);
        const symbols = [];
        let symbol = undefined;
        let subHash = topic;
        let hashDelimiter = ':';
        let subHashIsPrefix = false;
        const parsedTopic = this.parseTopic (topic);
        if ((parsedTopic === 'orders') || (parsedTopic === 'positions')) {
            subHash = parsedTopic;
            hashDelimiter = '::';
        }
        if ((marketId !== undefined) && (marketId !== 'ALL_SYMBOLS')) {
            // if marketId is defined, we have a single symbol subscription
            const delimiter = (marketType === 'spot') ? '_' : '';
            const market = this.safeMarket (marketId, undefined, delimiter, marketType);
            symbol = market['symbol'];
            subHash += hashDelimiter + symbol;
            symbols.push (symbol);
        } else {
            subHashIsPrefix = true; // need to clean all subHashes with this prefix
        }
        const symbolsAndTimeframes = [];
        if (topic.startsWith ('kline')) {
            let interval = topic.replace ('kline', '');
            if (interval.startsWith ('Bin')) {
                // swap market
                interval = interval.replace ('Bin', '');
            }
            const timeframes = this.safeDict (this.options, 'timeframes', {});
            const timeframe = this.findTimeframe (interval, timeframes);
            const symbolAndTimeframe = [ symbol, timeframe ];
            symbolsAndTimeframes.push (symbolAndTimeframe);
        }
        const result = {
            'topic': parsedTopic,
            'symbols': symbols,
            'subHash': subHash,
            'symbolsAndTimeframes': symbolsAndTimeframes,
            'subHashIsPrefix': subHashIsPrefix,
        };
        return result;
    }

    parseTopic (topic) {
        if (topic.startsWith ('depth')) {
            return 'orderbook';
        }
        if (topic.startsWith ('kline')) {
            return 'ohlcv';
        }
        const topics = {
            'ticker': 'ticker',
            'trade': 'trades',
            'user/order': 'orders',
            'user/orders': 'orders',
            'order': 'orders',
            'position': 'positions',
        };
        return this.safeString (topics, topic, topic);
    }

    parseMarketType (marketType: string) {
        const types = {
            'spot': 'spot',
            'futures': 'swap',
        };
        return this.safeString (types, marketType, marketType);
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        //
        //     {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
        //
        // subscribe events on spot:
        //
        //     {"event":"subscribe", "topic":"spot/kline1m:BTC_USDT" }
        //
        // subscribe on contracts:
        //
        //     {"action":"subscribe", "group":"futures/klineBin1m:BTCUSDT", "success":true, "request":{"action":"subscribe", "args":[ "futures/klineBin1m:BTCUSDT" ] } }
        //
        // regular updates - spot
        //
        //     {
        //         "table": "spot/depth",
        //         "action": "partial",
        //         "data": [
        //             {
        //                 "instrument_id":   "BTC-USDT",
        //                 "asks": [
        //                     ["5301.8", "0.03763319", "1"],
        //                     ["5302.4", "0.00305", "2"],
        //                 ],
        //                 "bids": [
        //                     ["5301.7", "0.58911427", "6"],
        //                     ["5301.6", "0.01222922", "4"],
        //                 ],
        //                 "timestamp": "2020-03-16T03:25:00.440Z",
        //                 "checksum": -2088736623
        //             }
        //         ]
        //     }
        //
        // regular updates - contracts
        //
        //     {
        //         group: "futures/klineBin1m:BTCUSDT",
        //         data: {
        //           symbol: "BTCUSDT",
        //           items: [ { o: "67944.7", "h": .... } ],
        //         },
        //       }
        //
        //     { data: '', table: "spot/user/order" }
        //
        // the only realiable way (for both spot & swap) is to check 'data' key
        const isDataUpdate = ('data' in message);
        if (!isDataUpdate) {
            const event = this.safeString2 (message, 'event', 'action');
            if (event !== undefined) {
                const methods: Dict = {
                    // 'info': this.handleSystemStatus,
                    'login': this.handleAuthenticate,
                    'access': this.handleAuthenticate,
                    'subscribe': this.handleSubscriptionStatus,
                    'unsubscribe': this.handleUnSubscription,
                };
                const method = this.safeValue (methods, event);
                if (method !== undefined) {
                    method.call (this, client, message);
                }
            }
        } else {
            const channel = this.safeString2 (message, 'table', 'group');
            const methods: Dict = {
                'depth': this.handleOrderBook,
                'ticker': this.handleTicker,
                'trade': this.handleTrade,
                'kline': this.handleOHLCV,
                'order': this.handleOrders,
                'position': this.handlePositions,
                'balance': this.handleBalance,
                'asset': this.handleBalance,
            };
            if (channel.indexOf ('fundingRate') >= 0) {
                this.handleFundingRate (client, message);
            }
            const keys = Object.keys (methods);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (channel.indexOf (key) >= 0) {
                    const method = this.safeValue (methods, key);
                    method.call (this, client, message);
                }
            }
        }
    }
}

