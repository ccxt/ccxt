//  ---------------------------------------------------------------------------

import hyperliquidRest from '../hyperliquid.js';
import { NotSupported } from '../base/errors.js';
import Client from '../base/ws/Client.js';
import { Int, Str, Market, OrderBook, Trade, OHLCV, Order, Dict, Strings, Ticker, Tickers, type Num, OrderType, OrderSide, type OrderRequest, Bool } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class hyperliquid extends hyperliquidRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'createOrderWs': true,
                'createOrdersWs': true,
                'editOrderWs': true,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPosition': false,
                'unWatchOrderBook': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchOHLCV': true,
                'unWatchMyTrades': true,
                'unWatchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.hyperliquid.xyz/ws',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.hyperliquid-testnet.xyz/ws',
                    },
                },
            },
            'options': {
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name hyperliquid#createOrdersWs
     * @description create a list of trade orders using WebSocket post request
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrdersWs (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const ordersRequest = this.createOrdersRequest (orders, params);
        const wrapped = this.wrapAsPostAction (ordersRequest);
        const request = this.safeDict (wrapped, 'request', {});
        const requestId = this.safeString (wrapped, 'requestId');
        const response = await this.watch (url, requestId, request, requestId);
        const responseOjb = this.safeDict (response, 'response', {});
        const data = this.safeDict (responseOjb, 'data', {});
        const statuses = this.safeList (data, 'statuses', []);
        return this.parseOrders (statuses, undefined);
    }

    /**
     * @method
     * @name hyperliquid#createOrderWs
     * @description create a trade order using WebSocket post request
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'Gtc', 'Ioc', 'Alo'
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.slippage] the slippage for market order
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const [ order, globalParams ] = this.parseCreateEditOrderArgs (undefined, symbol, type, side, amount, price, params);
        const orders = await this.createOrdersWs ([ order as any ], globalParams);
        const ordersLength = orders.length;
        if (ordersLength === 0) {
            // not sure why but it is happening sometimes
            return this.safeOrder ({});
        }
        const parsedOrder = orders[0];
        return parsedOrder;
    }

    /**
     * @method
     * @name hyperliquid#editOrderWs
     * @description edit a trade order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'Gtc', 'Ioc', 'Alo'
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrderWs (id: string, symbol: string, type: string, side: string, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws']['public'];
        const [ order, globalParams ] = this.parseCreateEditOrderArgs (id, symbol, type, side, amount, price, params);
        const postRequest = this.editOrdersRequest ([ order as any ], globalParams);
        const wrapped = this.wrapAsPostAction (postRequest);
        const request = this.safeDict (wrapped, 'request', {});
        const requestId = this.safeString (wrapped, 'requestId');
        const response = await this.watch (url, requestId, request, requestId);
        // response is the same as in this.editOrder
        const responseObject = this.safeDict (response, 'response', {});
        const dataObject = this.safeDict (responseObject, 'data', {});
        const statuses = this.safeList (dataObject, 'statuses', []);
        const first = this.safeDict (statuses, 0, {});
        const parsedOrder = this.parseOrder (first, market);
        return parsedOrder;
    }

    /**
     * @method
     * @name hyperliquid#cancelOrdersWs
     * @description cancel multiple orders using WebSocket post request
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
     * @param {string[]} ids list of order ids to cancel
     * @param {string} symbol unified symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderId] list of client order ids to cancel instead of order ids
     * @param {string} [params.vaultAddress] the vault address for order cancellation
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request = this.cancelOrdersRequest (ids, symbol, params);
        const url = this.urls['api']['ws']['public'];
        const wrapped = this.wrapAsPostAction (request);
        const wsRequest = this.safeDict (wrapped, 'request', {});
        const requestId = this.safeString (wrapped, 'requestId');
        const response = await this.watch (url, requestId, wsRequest, requestId);
        const responseObj = this.safeDict (response, 'response', {});
        const data = this.safeDict (responseObj, 'data', {});
        const statuses = this.safeList (data, 'statuses', []);
        const orders = [];
        for (let i = 0; i < statuses.length; i++) {
            const status = statuses[i];
            orders.push (this.safeOrder ({
                'info': status,
                'status': status,
            }));
        }
        return orders as Order[];
    }

    /**
     * @method
     * @name hyperliquid#cancelOrderWs
     * @description cancel a single order using WebSocket post request
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
     * @param {string} id order id to cancel
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id to cancel instead of order id
     * @param {string} [params.vaultAddress] the vault address for order cancellation
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}) {
        const orders = await this.cancelOrdersWs ([ id ], symbol, params);
        return this.safeDict (orders, 0) as Order;
    }

    /**
     * @method
     * @name hyperliquid#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'subscription': {
                'type': 'l2Book',
                'coin': market['swap'] ? market['baseName'] : market['id'],
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name hyperliquid#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subMessageHash = 'orderbook:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce ().toString ();
        const request: Dict = {
            'id': id,
            'method': 'unsubscribe',
            'subscription': {
                'type': 'l2Book',
                'coin': market['swap'] ? market['baseName'] : market['id'],
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "channel": "l2Book",
        //         "data": {
        //             "coin": "BTC",
        //             "time": 1710131872708,
        //             "levels": [
        //                 [
        //                     {
        //                         "px": "68674.0",
        //                         "sz": "0.97139",
        //                         "n": 4
        //                     }
        //                 ],
        //                 [
        //                     {
        //                         "px": "68675.0",
        //                         "sz": "0.04396",
        //                         "n": 1
        //                     }
        //                 ]
        //             ]
        //         }
        //     }
        //
        const entry = this.safeDict (message, 'data', {});
        const coin = this.safeString (entry, 'coin');
        const marketId = this.coinToMarketId (coin);
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const rawData = this.safeList (entry, 'levels', []);
        const data: Dict = {
            'bids': this.safeList (rawData, 0, []),
            'asks': this.safeList (rawData, 1, []),
        };
        const timestamp = this.safeInteger (entry, 'time');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'px', 'sz');
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook (snapshot);
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name hyperliquid#watchTicker
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] 'webData2' or 'allMids', default is 'webData2'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        const market = this.market (symbol);
        symbol = market['symbol'];
        // try to infer dex from market
        const dexName = this.safeString (this.safeDict (market, 'info', {}), 'dex');
        if (dexName) {
            params = this.extend (params, { 'dex': dexName });
        }
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name hyperliquid#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] 'webData2' or 'allMids', default is 'webData2'
     * @param {string} [params.dex] for for hip3 tokens subscription, eg: 'xyz' or 'flx`, if symbols are provided we will infer it from the first symbol's market
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        let messageHash = 'tickers';
        const url = this.urls['api']['ws']['public'];
        let channel = 'webData2';
        [ channel, params ] = this.handleOptionAndParams (params, 'watchTickers', 'channel', channel);
        const request: Dict = {
            'method': 'subscribe',
            'subscription': {
                'type': channel, // webData2 or allMids
                'user': '0x0000000000000000000000000000000000000000',
            },
        };
        let defaultDex = this.safeString (params, 'dex');
        const firstSymbol = this.safeString (symbols, 0);
        if (firstSymbol !== undefined) {
            const market = this.market (firstSymbol);
            const dexName = this.safeString (this.safeDict (market, 'info', {}), 'dex');
            if (dexName !== undefined) {
                defaultDex = dexName;
            }
        }
        if (defaultDex !== undefined) {
            params = this.omit (params, 'dex');
            messageHash = 'tickers:' + defaultDex;
            request['subscription']['type'] = 'allMids';
            request['subscription']['dex'] = defaultDex;
        }
        const tickers = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            return this.filterByArrayTickers (tickers, 'symbol', symbols);
        }
        return this.tickers;
    }

    /**
     * @method
     * @name hyperliquid#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] 'webData2' or 'allMids', default is 'webData2'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const subMessageHash = 'tickers';
        let channel = 'webData2';
        [ channel, params ] = this.handleOptionAndParams (params, 'unWatchTickers', 'channel', channel);
        const messageHash = 'unsubscribe:' + subMessageHash;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'subscription': {
                'type': channel, // allMids
                'user': '0x0000000000000000000000000000000000000000',
            },
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    /**
     * @method
     * @name hyperliquid#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        let userAddress = undefined;
        [ userAddress, params ] = this.handlePublicAddress ('watchMyTrades', params);
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'subscription': {
                'type': 'userFills',
                'user': userAddress,
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name hyperliquid#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' unWatchMyTrades does not support a symbol argument, unWatch from all markets only');
        }
        let userAddress = undefined;
        [ userAddress, params ] = this.handlePublicAddress ('unWatchMyTrades', params);
        const messageHash = 'unsubscribe:myTrades';
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'subscription': {
                'type': 'userFills',
                'user': userAddress,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleWsTickers (client: Client, message) {
        // hip3 mids
        // {
        //     channel: 'allMids',
        //     data: {
        //         dex: 'flx',
        //         mids: {
        //         'flx:COIN': '270.075',
        //         'flx:CRCL': '78.8175',
        //         'flx:NVDA': '180.64',
        //         'flx:TSLA': '436.075'
        //         }
        //     }
        // }
        //
        //     {
        //         "channel": "webData2",
        //         "data": {
        //             "meta": {
        //                 "universe": [
        //                     {
        //                         "szDecimals": 5,
        //                         "name": "BTC",
        //                         "maxLeverage": 50,
        //                         "onlyIsolated": false
        //                     },
        //                     ...
        //                 ],
        //             },
        //             "assetCtxs": [
        //                 {
        //                     "funding": "0.00003005",
        //                     "openInterest": "2311.50778",
        //                     "prevDayPx": "63475.0",
        //                     "dayNtlVlm": "468043329.64289033",
        //                     "premium": "0.00094264",
        //                     "oraclePx": "64712.0",
        //                     "markPx": "64774.0",
        //                     "midPx": "64773.5",
        //                     "impactPxs": [
        //                         "64773.0",
        //                         "64774.0"
        //                     ]
        //                 },
        //                 ...
        //             ],
        //             "spotAssetCtxs": [
        //                 {
        //                     "prevDayPx": "0.20937",
        //                     "dayNtlVlm": "11188888.61984999",
        //                     "markPx": "0.19722",
        //                     "midPx": "0.197145",
        //                     "circulatingSupply": "598760557.12072003",
        //                     "coin": "PURR/USDC"
        //                 },
        //                 ...
        //             ],
        //         }
        //     }
        //
        // handle hip3 mids
        const channel = this.safeString (message, 'channel');
        if (channel === 'allMids') {
            const data = this.safeDict (message, 'data', {});
            const mids = this.safeDict (data, 'mids', {});
            if (mids !== undefined) {
                const keys = Object.keys (mids);
                for (let i = 0; i < keys.length; i++) {
                    const name = keys[i];
                    const marketId = this.coinToMarketId (name);
                    const market = this.safeMarket (marketId, undefined, undefined, 'swap');
                    const symbol = market['symbol'];
                    const ticker = this.parseWsTicker ({
                        'price': this.safeNumber (mids, name),
                    }, market);
                    this.tickers[symbol] = ticker;
                }
                let messageHash = 'tickers';
                const dexMessage = this.safeString (data, 'dex');
                if (dexMessage !== undefined) {
                    messageHash += ':' + dexMessage;
                }
                client.resolve (this.tickers, messageHash);
                return true;
            }
        }
        // spot
        const rawData = this.safeDict (message, 'data', {});
        const spotAssets = this.safeList (rawData, 'spotAssetCtxs', []);
        const parsedTickers = [];
        for (let i = 0; i < spotAssets.length; i++) {
            const assetObject = spotAssets[i];
            const coin = this.safeString (assetObject, 'coin');
            const marketId = this.coinToMarketId (coin);
            const market = this.safeMarket (marketId, undefined, undefined, 'spot');
            const symbol = market['symbol'];
            const ticker = this.parseWsTicker (assetObject, market);
            parsedTickers.push (ticker);
            this.tickers[symbol] = ticker;
        }
        // perpetuals
        const meta = this.safeDict (rawData, 'meta', {});
        const universe = this.safeList (meta, 'universe', []);
        const assetCtxs = this.safeList (rawData, 'assetCtxs', []);
        for (let i = 0; i < universe.length; i++) {
            const data = this.extend (
                this.safeDict (universe, i, {}),
                this.safeDict (assetCtxs, i, {})
            );
            const coin = this.safeString (data, 'name');
            const marketId = this.coinToMarketId (coin);
            const market = this.safeMarket (marketId, undefined, undefined, 'swap');
            const symbol = market['symbol'];
            const ticker = this.parseWsTicker (data, market);
            this.tickers[symbol] = ticker;
            parsedTickers.push (ticker);
        }
        const tickers = this.indexBy (parsedTickers, 'symbol');
        client.resolve (tickers, 'tickers');
        return true;
    }

    parseWsTicker (rawTicker, market: Market = undefined): Ticker {
        return this.parseTicker (rawTicker, market);
    }

    handleMyTrades (client: Client, message) {
        //
        //     {
        //         "channel": "userFills",
        //         "data": {
        //             "isSnapshot": true,
        //             "user": "0x15f43d1f2dee81424afd891943262aa90f22cc2a",
        //             "fills": [
        //                 {
        //                     "coin": "BTC",
        //                     "px": "72528.0",
        //                     "sz": "0.11693",
        //                     "side": "A",
        //                     "time": 1710208712815,
        //                     "startPosition": "0.11693",
        //                     "dir": "Close Long",
        //                     "closedPnl": "-0.81851",
        //                     "hash": "0xc5adaf35f8402750c218040b0a7bc301130051521273b6f398b3caad3e1f3f5f",
        //                     "oid": 7484888874,
        //                     "crossed": true,
        //                     "fee": "2.968244",
        //                     "liquidationMarkPx": null,
        //                     "tid": 567547935839686,
        //                     "cloid": null
        //                 }
        //             ]
        //         }
        //     }
        //
        const entry = this.safeDict (message, 'data', {});
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const symbols: Dict = {};
        const data = this.safeList (entry, 'fills', []);
        const dataLength = data.length;
        if (dataLength === 0) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            const parsed = this.parseWsTrade (rawTrade);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            trades.append (parsed);
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            const currentMessageHash = 'myTrades:' + keys[i];
            client.resolve (trades, currentMessageHash);
        }
        // non-symbol specific
        const messageHash = 'myTrades';
        client.resolve (trades, messageHash);
    }

    /**
     * @method
     * @name hyperliquid#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'subscription': {
                'type': 'trades',
                'coin': market['swap'] ? market['baseName'] : market['id'],
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name hyperliquid#unWatchTrades
     * @description unWatches information on multiple trades made in a market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subMessageHash = 'trade:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'subscription': {
                'type': 'trades',
                'coin': market['swap'] ? market['baseName'] : market['id'],
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "channel": "trades",
        //         "data": [
        //             {
        //                 "coin": "BTC",
        //                 "side": "A",
        //                 "px": "68517.0",
        //                 "sz": "0.005",
        //                 "time": 1710125266669,
        //                 "hash": "0xc872699f116e012186620407fc08a802015e0097c5cce74710697f7272e6e959",
        //                 "tid": 981894269203506
        //             }
        //         ]
        //     }
        //
        const entry = this.safeList (message, 'data', []);
        const first = this.safeDict (entry, 0, {});
        const coin = this.safeString (first, 'coin');
        const marketId = this.coinToMarketId (coin);
        const market = this.market (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        for (let i = 0; i < entry.length; i++) {
            const data = this.safeDict (entry, i);
            const trade = this.parseWsTrade (data);
            trades.append (trade);
        }
        const messageHash = 'trade:' + symbol;
        client.resolve (trades, messageHash);
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchMyTrades
        //
        //     {
        //         "coin": "BTC",
        //         "px": "72528.0",
        //         "sz": "0.11693",
        //         "side": "A",
        //         "time": 1710208712815,
        //         "startPosition": "0.11693",
        //         "dir": "Close Long",
        //         "closedPnl": "-0.81851",
        //         "hash": "0xc5adaf35f8402750c218040b0a7bc301130051521273b6f398b3caad3e1f3f5f",
        //         "oid": 7484888874,
        //         "crossed": true,
        //         "fee": "2.968244",
        //         "liquidationMarkPx": null,
        //         "tid": 567547935839686,
        //         "cloid": null
        //     }
        //
        // fetchTrades
        //
        //     {
        //         "coin": "BTC",
        //         "side": "A",
        //         "px": "68517.0",
        //         "sz": "0.005",
        //         "time": 1710125266669,
        //         "hash": "0xc872699f116e012186620407fc08a802015e0097c5cce74710697f7272e6e959",
        //         "tid": 981894269203506
        //     }
        //
        const timestamp = this.safeInteger (trade, 'time');
        const price = this.safeString (trade, 'px');
        const amount = this.safeString (trade, 'sz');
        const coin = this.safeString (trade, 'coin');
        const marketId = this.coinToMarketId (coin);
        market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'tid');
        let side = this.safeString (trade, 'side');
        if (side !== undefined) {
            side = (side === 'A') ? 'sell' : 'buy';
        }
        const fee = this.safeString (trade, 'fee');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': this.safeString (trade, 'oid'),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': { 'cost': fee, 'currency': 'USDC' },
        }, market);
    }

    /**
     * @method
     * @name hyperliquid#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'subscription': {
                'type': 'candle',
                'coin': market['swap'] ? market['baseName'] : market['id'],
                'interval': timeframe,
            },
        };
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name hyperliquid#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'subscription': {
                'type': 'candle',
                'coin': market['swap'] ? market['baseName'] : market['id'],
                'interval': timeframe,
            },
        };
        const subMessageHash = 'candles:' + timeframe + ':' + symbol;
        const messagehash = 'unsubscribe:' + subMessageHash;
        const message = this.extend (request, params);
        return await this.watch (url, messagehash, message, messagehash);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         channel: 'candle',
        //         data: {
        //             t: 1710146280000,
        //             T: 1710146339999,
        //             s: 'BTC',
        //             i: '1m',
        //             o: '71400.0',
        //             c: '71411.0',
        //             h: '71422.0',
        //             l: '71389.0',
        //             v: '1.20407',
        //             n: 20
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const base = this.safeString (data, 's');
        const marketId = this.coinToMarketId (base);
        const symbol = this.safeSymbol (marketId);
        const timeframe = this.safeString (data, 'i');
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseOHLCV (data);
        ohlcv.append (parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve (ohlcv, messageHash);
    }

    handleWsPost (client: Client, message: Dict) {
        //    {
        //         channel: "post",
        //         data: {
        //             id: <number>,
        //             response: {
        //                  type: "info" | "action" | "error",
        //                  payload: { ... }
        //         }
        //    }
        const data = this.safeDict (message, 'data');
        const id = this.safeString (data, 'id');
        const response = this.safeDict (data, 'response');
        const payload = this.safeDict (response, 'payload');
        client.resolve (payload, id);
    }

    /**
     * @method
     * @name hyperliquid#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let userAddress = undefined;
        [ userAddress, params ] = this.handlePublicAddress ('watchOrders', params);
        let market = undefined;
        let messageHash = 'order';
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'subscription': {
                'type': 'orderUpdates',
                'user': userAddress,
            },
        };
        const message = this.extend (request, params);
        const orders = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name hyperliquid#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' unWatchOrders() does not support a symbol argument, unWatch from all markets only');
        }
        const messageHash = 'unsubscribe:order';
        const url = this.urls['api']['ws']['public'];
        let userAddress = undefined;
        [ userAddress, params ] = this.handlePublicAddress ('unWatchOrders', params);
        const request: Dict = {
            'method': 'unsubscribe',
            'subscription': {
                'type': 'orderUpdates',
                'user': userAddress,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         channel: 'orderUpdates',
        //         data: [
        //             {
        //                 order: {
        //                     coin: 'BTC',
        //                     side: 'B',
        //                     limitPx: '30000.0',
        //                     sz: '0.001',
        //                     oid: 7456484275,
        //                     timestamp: 1710163596492,
        //                     origSz: '0.001'
        //                 },
        //                 status: 'open',
        //                 statusTimestamp: 1710163596492
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const dataLength = data.length;
        if (dataLength === 0) {
            return;
        }
        const stored = this.orders;
        const messageHash = 'order';
        const marketSymbols: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const rawOrder = data[i];
            const order = this.parseOrder (rawOrder);
            stored.append (order);
            const symbol = this.safeString (order, 'symbol');
            marketSymbols[symbol] = true;
        }
        const keys = Object.keys (marketSymbols);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            const innerMessageHash = messageHash + ':' + symbol;
            client.resolve (stored, innerMessageHash);
        }
        client.resolve (stored, messageHash);
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //    {
        //      "channel": "post",
        //      "data": {
        //        "id": 1,
        //        "response": {
        //          "type": "action",
        //          "payload": {
        //            "status": "ok",
        //            "response": {
        //              "type": "order",
        //              "data": {
        //                "statuses": [
        //                  {
        //                    "error": "Order price cannot be more than 80% away from the reference price"
        //                  }
        //                ]
        //              }
        //            }
        //          }
        //        }
        //      }
        //    }
        //
        //    {
        //         "channel": "error",
        //         "data": "Error parsing JSON into valid websocket request: { \"type\": \"allMids\" }"
        //     }
        //
        const channel = this.safeString (message, 'channel', '');
        if (channel === 'error') {
            const ret_msg = this.safeString (message, 'data', '');
            const errorMsg = this.id + ' ' + ret_msg;
            client.reject (errorMsg);
            return true;
        }
        const data = this.safeDict (message, 'data', {});
        let id = this.safeString (message, 'id');
        if (id === undefined) {
            id = this.safeString (data, 'id');
        }
        const response = this.safeDict (data, 'response', {});
        const payload = this.safeDict (response, 'payload', {});
        const status = this.safeString (payload, 'status');
        if (status !== undefined && status !== 'ok') {
            const errorMsg = this.id + ' ' + this.json (payload);
            client.reject (errorMsg, id);
            return true;
        }
        const type = this.safeString (payload, 'type');
        if (type === 'error') {
            const error = this.id + ' ' + this.json (payload);
            client.reject (error, id);
            return true;
        }
        try {
            this.handleErrors (0, '', '', '', {}, this.json (payload), payload, {}, {});
        } catch (e) {
            client.reject (e, id);
            return true;
        }
        return false;
    }

    handleOrderBookUnsubscription (client: Client, subscription: Dict) {
        //
        //        "subscription":{
        //           "type":"l2Book",
        //           "coin":"BTC",
        //           "nSigFigs":5,
        //           "mantissa":null
        //        }
        //
        const coin = this.safeString (subscription, 'coin');
        const marketId = this.coinToMarketId (coin);
        const symbol = this.safeSymbol (marketId);
        const subMessageHash = 'orderbook:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
    }

    handleTradesUnsubscription (client: Client, subscription: Dict) {
        //
        const coin = this.safeString (subscription, 'coin');
        const marketId = this.coinToMarketId (coin);
        const symbol = this.safeSymbol (marketId);
        const subMessageHash = 'trade:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        if (symbol in this.trades) {
            delete this.trades[symbol];
        }
    }

    handleTickersUnsubscription (client: Client, subscription: Dict) {
        //
        const subMessageHash = 'tickers';
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        const symbols = Object.keys (this.tickers);
        for (let i = 0; i < symbols.length; i++) {
            delete this.tickers[symbols[i]];
        }
    }

    handleOHLCVUnsubscription (client: Client, subscription: Dict) {
        const coin = this.safeString (subscription, 'coin');
        const marketId = this.coinToMarketId (coin);
        const symbol = this.safeSymbol (marketId);
        const interval = this.safeString (subscription, 'interval');
        const timeframe = this.findTimeframe (interval);
        const subMessageHash = 'candles:' + timeframe + ':' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        if (symbol in this.ohlcvs) {
            if (timeframe in this.ohlcvs[symbol]) {
                delete this.ohlcvs[symbol][timeframe];
            }
        }
    }

    handleOrderUnsubscription (client: Client, subscription: Dict) {
        const subHash = 'order';
        const unSubHash = 'unsubscribe:' + subHash;
        this.cleanUnsubscription (client, subHash, unSubHash, true);
        const topicStructure = {
            'topic': 'orders',
        };
        this.cleanCache (topicStructure);
    }

    handleMyTradesUnsubscription (client: Client, subscription: Dict) {
        const subHash = 'myTrades';
        const unSubHash = 'unsubscribe:' + subHash;
        this.cleanUnsubscription (client, subHash, unSubHash, true);
        const topicStructure = {
            'topic': 'myTrades',
        };
        this.cleanCache (topicStructure);
    }

    handleSubscriptionResponse (client: Client, message) {
        // {
        //     "channel":"subscriptionResponse",
        //     "data":{
        //        "method":"unsubscribe",
        //        "subscription":{
        //           "type":"l2Book",
        //           "coin":"BTC",
        //           "nSigFigs":5,
        //           "mantissa":null
        //        }
        //     }
        // }
        //
        //  {
        //      "channel":"subscriptionResponse",
        //      "data":{
        //         "method":"unsubscribe",
        //         "subscription":{
        //            "type":"trades",
        //            "coin":"PURR/USDC"
        //         }
        //      }
        //  }
        //
        const data = this.safeDict (message, 'data', {});
        const method = this.safeString (data, 'method');
        if (method === 'unsubscribe') {
            const subscription = this.safeDict (data, 'subscription', {});
            const type = this.safeString (subscription, 'type');
            if (type === 'l2Book') {
                this.handleOrderBookUnsubscription (client, subscription);
            } else if (type === 'trades') {
                this.handleTradesUnsubscription (client, subscription);
            } else if (type === 'webData2') {
                this.handleTickersUnsubscription (client, subscription);
            } else if (type === 'candle') {
                this.handleOHLCVUnsubscription (client, subscription);
            } else if (type === 'orderUpdates') {
                this.handleOrderUnsubscription (client, subscription);
            } else if (type === 'userFills') {
                this.handleMyTradesUnsubscription (client, subscription);
            }
        }
    }

    handleMessage (client: Client, message) {
        //
        // {
        //     "channel":"subscriptionResponse",
        //     "data":{
        //        "method":"unsubscribe",
        //        "subscription":{
        //           "type":"l2Book",
        //           "coin":"BTC",
        //           "nSigFigs":5,
        //           "mantissa":null
        //        }
        //     }
        // }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const topic = this.safeString (message, 'channel', '');
        const methods: Dict = {
            'pong': this.handlePong,
            'trades': this.handleTrades,
            'l2Book': this.handleOrderBook,
            'candle': this.handleOHLCV,
            'orderUpdates': this.handleOrder,
            'userFills': this.handleMyTrades,
            'webData2': this.handleWsTickers,
            'allMids': this.handleWsTickers,
            'post': this.handleWsPost,
            'subscriptionResponse': this.handleSubscriptionResponse,
        };
        const exacMethod = this.safeValue (methods, topic);
        if (exacMethod !== undefined) {
            exacMethod.call (this, client, message);
            return;
        }
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (topic.indexOf (keys[i]) >= 0) {
                const method = methods[key];
                method.call (this, client, message);
                return;
            }
        }
    }

    ping (client: Client) {
        return {
            'method': 'ping',
        };
    }

    handlePong (client: Client, message) {
        //
        //   {
        //       "channel": "pong"
        //   }
        //
        client.lastPong = this.safeInteger (message, 'pong', this.milliseconds ());
        return message;
    }

    requestId (): number {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    wrapAsPostAction (request: Dict): Dict {
        const requestId = this.requestId ();
        return {
            'requestId': requestId,
            'request': {
                'method': 'post',
                'id': requestId,
                'request': {
                    'type': 'action',
                    'payload': request,
                },
            },
        };
    }
}
