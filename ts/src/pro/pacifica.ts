//  ---------------------------------------------------------------------------

import pacificaRest from '../pacifica.js';
import { ArgumentsRequired, NotSupported } from '../base/errors.js';
import Client from '../base/ws/Client.js';
import { Int, Str, Market, OrderBook, Trade, OHLCV, Order, Dict, Strings, Ticker, Tickers, type Num, OrderType, OrderSide, Bool } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class pacifica extends pacificaRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'cancelAllOrdersWs': true,
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
                        'public': 'wss://ws.pacifica.fi/ws',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://test-ws.pacifica.fi/ws',
                    },
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {},
                    },
                },
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

    setupApiKey (key: string = undefined) {  // Implemented in watchTickers; use it to set up or change a rate-limited API key.
        const headers = {};
        if (key !== undefined) {
            headers['PF-API-KEY'] = key;
        } else {
            if (this.apiKey !== undefined) {
                headers['PF-API-KEY'] = this.apiKey;
            }
        }
        this.options['ws']['options']['headers'] = headers;
    }

    /**
     * @method
     * @name pacifica#createOrderWs
     * @description create a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/create-market-order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/create-limit-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float|undefined} [params.stopLossPrice] the price that a stop loss order is triggered at (optional provide stopLossCloid)
     * @param {float|undefined} [params.takeProfitPrice] the price that a take profit order is triggered at (optional provide takeProfitCloid)
     * @param {string|undefined} [params.timeInForce] "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book)
     * @param {bool|undefined} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string|undefined} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use.
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @param {string|undefined} [params.builderCode] only if builder approved.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const [ request, operationType ] = this.createOrderRequest (symbol, type, side, amount, price, params);
        params = this.omit (params, [
            'reduceOnly', 'reduce_only', 'clientOrderId', 'stopLimitPrice', 'timeInForce', 'tif', 'stopPrice', 'triggerPrice', 'stopLossCloid', 'builderCode',
            'stopLossPrice', 'stopLossLimitPrice', 'takeProfitCloid', 'takeProfitPrice', 'takeProfitLimitPrice', 'expiryWindow', 'expiry_window', 'agentAddress', 'originAddress',
        ]);
        const isTestnet = this.handleOption ('createOrderWs', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const wsRequest = this.wrapAsPostAction (operationType, request);
        const requestId = this.safeString (wsRequest, 'id');
        if (operationType === 'create_stop_order') {
            throw new NotSupported (this.id + ' createOrderWs() do not support stop order type of order. Check provided arguments correctly!');
        } else if (operationType === 'set_position_tpsl') {
            throw new NotSupported (this.id + ' createOrderWs() do not support set position tpsl type of order. Check provided arguments correctly!');
        }
        const response = await this.watch (url, requestId, wsRequest, requestId);
        //
        // market order
        // {
        //   "code": 200,
        //   "data": {
        //     "I": "79f948fd-7556-4066-a128-083f3ea49322",
        //     "i": 645953,
        //     "s": "BTC"
        //   },
        //   "id": "660065de-8f32-46ad-ba1e-83c93d3e3966",
        //   "t": 1749223025962,
        //   "type": "create_market_order"
        // }
        //
        // limit order
        // {
        //   "code": 200,
        //   "data": {
        //     "I": "79f948fd-7556-4066-a128-083f3ea49322",
        //     "i": 645953,
        //     "s": "BTC"
        //   },
        //   "id": "660065de-8f32-46ad-ba1e-83c93d3e3966",
        //   "t": 1749223025962,
        //   "type": "create_order"
        // }
        //
        const error = this.safeString (response, 'error', undefined);
        const code = this.safeInteger (response, 'code');
        let success = false;
        if (code === 200) {
            success = true;
        }
        let status = undefined;
        if ((error !== undefined) || (!success)) {
            status = 'rejected';
        } else {
            status = 'open';
        }
        const order = this.safeDict (response, 'data', {});
        const orderId = this.safeString (order, 'i');
        const clientOrderId = this.safeString (order, 'I');
        return this.safeOrder ({ 'id': orderId, 'clientOrderId': clientOrderId, 'status': status, 'info': response, 'symbol': symbol });
    }

    /**
     * @method
     * @name pacifica#editOrderWs
     * @description edit a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/edit-order
     * @param {string} id edit order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrderWs (id: string, symbol: string, type: string, side: string, amount: Num = undefined, price: Num = undefined, params = {}) {
        const batchOperationType = 'edit_order';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.editOrderRequest (id, symbol, type, side, amount, price, market, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window' ]);
        const isTestnet = this.handleOption ('editOrderWs', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const wsRequest = this.wrapAsPostAction (batchOperationType, request);
        const requestId = this.safeString (wsRequest, 'id');
        const response = await this.watch (url, requestId, wsRequest, requestId);
        // {
        //   "code": 200,
        //   "data": {
        //     "I": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        //     "i": 645954,
        //     "s": "BTC"
        //   },
        //   "id": "660065de-8f32-46ad-ba1e-83c93d3e3966",
        //   "t": 1749223026150,
        //   "type": "edit_order"
        // }
        const error = this.safeString (response, 'error', undefined);
        const code = this.safeInteger (response, 'code');
        let success = false;
        if (code === 200) {
            success = true;
        }
        let status = undefined;
        if ((error !== undefined) || (!success)) {
            status = 'rejected';
        } else {
            status = 'open';
        }
        const order = this.safeDict (response, 'data', {});
        const orderId = this.safeString (order, 'i');
        const clientOrderId = this.safeString (order, 'I');
        return this.safeOrder ({ 'id': orderId, 'clientOrderId': clientOrderId, 'status': status, 'info': response, 'symbol': symbol });
    }

    /**
     * @method
     * @name pacifica#cancelOrdersWs
     * @description cancel multiple orders
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/batch-order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-order
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|string[]} [params.clientOrderId] client order ids, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}) {
        const batchOperationType = 'batch_orders';
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'cancelOrders() requires a "symbol" argument!');
        }
        const request = this.cancelOrdersRequest (ids, symbol, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window', 'clientOrderId' ]);
        const isTestnet = this.handleOption ('cancelOrdersWs', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const wsRequest = this.wrapAsPostAction (batchOperationType, request);
        const requestId = this.safeString (wsRequest, 'id');
        const response = await this.watch (url, requestId, wsRequest, requestId);
        // {
        //   "code": 200,
        //   "data": {
        //     "results": [
        //       {
        //         "success": true,
        //         "order_id": 645953,
        //         "client_order_id": "57a5efb1-bb96-49a5-8bfd-f25d5f22bc7e",
        //         "symbol": "BTC"
        //       },
        //       {
        //         "success": true,
        //         "order_id": 645954,
        //         "symbol": "ETH"
        //       }
        //     ]
        //   },
        //   "id": "660065de-8f32-46ad-ba1e-83c93d3e3966",
        //   "t": 1749223025962,
        //   "type": "batch_orders"
        // }
        const data = this.safeDict (response, 'data', {});
        const results = this.safeList (data, 'results', []);
        const ordersToReturn = [];
        for (let i = 0; i < results.length; i++) {
            const order = results[i];
            const error = this.safeString (order, 'error', undefined);
            const success = this.safeBool (order, 'success', false);
            const symbolExc = this.safeString (order, 'symbol');
            const symbolLocal = this.symbolExcToLocal (symbolExc);
            const orderId = this.safeString (order, 'i');
            const clientOrderId = this.safeString (order, 'I');
            let status = undefined;
            if ((error !== undefined) || (!success)) {
                status = 'closed';
            } else {
                status = 'canceled';
            }
            ordersToReturn.push (this.safeOrder ({ 'id': orderId, 'clientOrderId': clientOrderId, 'status': status, 'info': response, 'symbol': symbolLocal }));
        }
        return ordersToReturn as Order[];
    }

    /**
     * @method
     * @name pacifica#cancelOrderWs
     * @description cancels an open order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}) {
        const operationType = 'cancel_order';
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrderWs() requires a symbol argument');
        }
        const request = this.cancelOrderRequest (id, symbol, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window', 'clientOrderId' ]);
        const isTestnet = this.handleOption ('cancelOrderWs', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const wsRequest = this.wrapAsPostAction (operationType, request);
        const requestId = this.safeString (wsRequest, 'id');
        const response = await this.watch (url, requestId, wsRequest, requestId);
        //
        //  {
        //   "code": 200,
        //   "data": {
        //     "I": "79f948fd-7556-4066-a128-083f3ea49322",
        //     "i": null,
        //     "s": "BTC"
        //   },
        //   "id": "1bb2b72f-f545-4938-8a38-c5cda8823675",
        //   "t": 1749223343610,
        //   "type": "cancel_order"
        // }
        //
        const error = this.safeString (response, 'error', undefined);
        const code = this.safeInteger (response, 'code');
        let success = false;
        if (code === 200) {
            success = true;
        }
        let status = undefined;
        if ((error !== undefined) || (!success)) {
            status = 'rejected';
        } else {
            status = 'open';
        }
        const order = this.safeDict (response, 'data', {});
        const orderId = this.safeString (order, 'i');
        const clientOrderId = this.safeString (order, 'I');
        return this.safeOrder ({ 'id': orderId, 'clientOrderId': clientOrderId, 'status': status, 'info': response, 'symbol': symbol });
    }

    /**
     * @method
     * @name pacifica#cancelAllOrdersWs
     * @description cancel all open orders in a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-all-orders
     * @param {string} symbol (optional) unified market symbol of the market to cancel orders in.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.excludeReduceOnly] whether to exclude reduce-only orders
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrdersWs (symbol: Str = undefined, params = {}) {
        const operationType = 'cancel_all_orders';
        const request = this.cancelAllOrdersRequest (symbol, params);
        params = this.omit (params, [ 'excludeReduceOnly', 'exclude_reduce_only', 'agentAddress', 'originAddress', 'expiryWindow', 'expiry_window' ]);
        const isTestnet = this.handleOption ('cancelAllOrdersWs', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const wsRequest = this.wrapAsPostAction (operationType, request);
        const requestId = this.safeString (wsRequest, 'id');
        const response = await this.watch (url, requestId, wsRequest, requestId);
        //  {
        //   "code": 200,
        //   "data": {
        //     "cancelled_count": 10
        //   },
        //   "id": "b86b4f45-49da-4191-84e2-93e141acdeab",
        //   "t": 1749221787291,
        //   "type": "cancel_all_orders"
        // }
        //
        return [
            this.safeOrder ({
                'info': response,
            }),
        ] as Order[];
    }

    /**
     * @method
     * @name pacifica#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.aggLevel] aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        this.setupApiKey ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        let aggLevel = undefined;
        [ aggLevel, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'aggLevel', 1);
        const messageHash = 'orderbook:' + symbol;
        const isTestnet = this.handleOption ('watchOrderBook', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'source': 'book',
                'symbol': market['id'],
                'agg_level': aggLevel,
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name pacifica#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.aggLevel] aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let aggLevel = undefined;
        [ aggLevel, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'aggLevel', 1);
        const subMessageHash = 'orderbook:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const isTestnet = this.handleOption ('unWatchOrderBook', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'source': 'book',
                'symbol': market['id'],
                'agg_level': aggLevel,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleOrderBook (client, message) {
        //
        // {
        //   "channel": "book",
        //   "data": {
        //     "l": [
        //       [
        //         {
        //           "a": "37.86",
        //           "n": 4,
        //           "p": "157.47"
        //         },
        //         // ... other aggegated bid levels
        //       ],
        //       [
        //         {
        //           "a": "12.7",
        //           "n": 2,
        //           "p": "157.49"
        //         },
        //         {
        //           "a": "44.45",
        //           "n": 3,
        //           "p": "157.5"
        //         },
        //         // ... other aggregated ask levels
        //       ]
        //     ],
        //     "s": "SOL",
        //     "t": 1749051881187,
        //     "li": 1559885104 // sequence id - last order id
        //   }
        // }
        //
        const entry = this.safeDict (message, 'data', {});
        const symbolExc = this.safeString (entry, 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const levels = this.safeList (entry, 'l', []);
        const result: Dict = {
            'bids': this.safeList (levels, 0, []),
            'asks': this.safeList (levels, 1, []),
        };
        const timestamp = this.safeInteger (entry, 't');
        const snapshot = this.parseOrderBook (result, symbolLocal, timestamp, 'bids', 'asks', 'p', 'a');
        const nonce = this.safeInteger (entry, 'li');
        if (nonce) {
            snapshot['nonce'] = nonce;
        }
        if (!(symbolLocal in this.orderbooks)) {
            const ob = this.orderBook (snapshot);
            this.orderbooks[symbolLocal] = ob;
        }
        const orderbook = this.orderbooks[symbolLocal];
        orderbook.reset (snapshot);
        const messageHash = 'orderbook:' + symbolLocal;
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name pacifica#watchTicker
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name pacifica#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        this.setupApiKey ();
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const messageHash = 'tickers';
        const isTestnet = this.handleOption ('watchTickers', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'source': 'prices',
            },
        };
        const tickers = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            return this.filterByArrayTickers (tickers, 'symbol', symbols);
        }
        return this.tickers;
    }

    /**
     * @method
     * @name pacifica#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const subMessageHash = 'tickers';
        const messageHash = 'unsubscribe:' + subMessageHash;
        const isTestnet = this.handleOption ('unWatchTickers', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'source': 'prices',
            },
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    /**
     * @method
     * @name pacifica#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-trades
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('watchMyTrades', params);
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const isTestnet = this.handleOption ('watchMyTrades', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'source': 'account_trades',
                'account': userAddress,
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
     * @name pacifica#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-trades
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' unWatchMyTrades does not support a symbol argument, unWatch from all markets only');
        }
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('unWatchMyTrades', params);
        const messageHash = 'unsubscribe:myTrades';
        const isTestnet = this.handleOption ('unWatchMyTrades', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'source': 'account_trades',
                'account': userAddress,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleWsTickers (client: Client, message) {
        //
        // {
        //     "channel": "prices",
        //     "data": [
        //         {
        //             "funding": "0.0000125",
        //             "mark": "105473",
        //             "mid": "105476",
        //             "next_funding": "0.0000125",
        //             "open_interest": "0.00524",
        //             "oracle": "105473",
        //             "symbol": "BTC",
        //             "timestamp": 1749051612681,
        //             "volume_24h": "63265.87522",
        //             "yesterday_price": "955476"
        //         }
        //         // ... other symbol prices
        //     ],
        // }
        //
        const parsedTickers = [];
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const info = data[i];
            const symbolExc = this.safeString (info, 'symbol');
            const symbolLocal = this.symbolExcToLocal (symbolExc);
            const market = this.safeMarket (symbolLocal);
            const ticker = this.parseWsTicker (info, market);
            this.tickers[symbolLocal] = ticker;
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
        // {
        //   "channel": "account_trades",
        //   "data": [
        //     {
        //       "h": 80063441, // history id
        //       "i": 1559912767, // oid
        //       "I": null, // cloid
        //       "u": "BrZp5bidJ3WUvceSq7X78bhjTfZXeezzGvGEV4hAYKTa", // account address
        //       "s": "BTC",  // symbol
        //       "p": "89477", // price
        //       "o": "89505", // entry price
        //       "a": "0.00036", // amount
        //       "te": "fulfill_taker",
        //       "ts": "close_long",
        //       "tc": "normal", // trade type
        //       "f": "0.012885", // fee
        //       "n": "-0.022965", // pnl
        //       "t": 1765018588190,
        //       "li": 1559912767
        //     }
        //   ]
        // }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const symbols: Dict = {};
        const data = this.safeList (message, 'data', []);
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
     * @name pacifica#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/trades
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
        const isTestnet = this.handleOption ('watchTrades', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'source': 'trades',
                'symbol': market['id'],
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
     * @name pacifica#unWatchTrades
     * @description unWatches information on multiple trades made in a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/trades
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
        const isTestnet = this.handleOption ('unWatchTrades', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'source': 'trades',
                'symbol': market['id'],
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //   "channel": "trades",
        //   "data": [
        //     {
        //       "h": 80062522,
        //       "s": "BTC",
        //       "a": "0.00001",
        //       "p": "89471",
        //       "d": "close_short",
        //       "tc": "normal",
        //       "t": 1765018379085,
        //       "li": 1559885104
        //     }
        //   ]
        // }
        //
        const entry = this.safeList (message, 'data', []);
        const first = this.safeDict (entry, 0, {});
        const symbolExc = this.safeString (first, 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        if (!(symbolLocal in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbolLocal] = stored;
        }
        const trades = this.trades[symbolLocal];
        for (let i = 0; i < entry.length; i++) {
            const data = this.safeDict (entry, i);
            const trade = this.parseWsTrade (data);
            trades.append (trade);
        }
        const messageHash = 'trade:' + symbolLocal;
        client.resolve (trades, messageHash);
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchMyTrades
        //
        //    {
        //       "h": 80063441, // history id
        //       "i": 1559912767, // oid
        //       "I": null, // cloid
        //       "u": "BrZp5bidJ3WUvceSq7X78bhjTfZXeezzGvGEV4hAYKTa", // account address
        //       "s": "BTC",  // symbol
        //       "p": "89477", // price
        //       "o": "89505", // entry price
        //       "a": "0.00036", // amount
        //       "te": "fulfill_taker",
        //       "ts": "close_long",
        //       "tc": "normal", // trade type
        //       "f": "0.012885", // fee
        //       "n": "-0.022965", // pnl
        //       "t": 1765018588190,
        //       "li": 1559912767
        //     }
        //
        // fetchTrades
        //
        //     {
        //       "h": 80062522,
        //       "s": "BTC",
        //       "a": "0.00001",
        //       "p": "89471",
        //       "d": "close_short",
        //       "tc": "normal",
        //       "t": 1765018379085,
        //       "li": 1559885104
        //     }
        //
        const timestamp = this.safeInteger (trade, 't');
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'a');
        const symbolExc = this.safeString (trade, 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        market = this.safeMarket (symbolLocal, undefined);
        const id = this.safeString (trade, 'h');
        const fee = this.safeString (trade, 'f');
        let side = this.safeString2 (trade, 'ts', 'd');
        if (side === 'open_long') {
            side = 'buy';
        } else if (side === 'close_long') {
            side = 'sell';
        } else if (side === 'open_short') {
            side = 'sell';
        } else if (side === 'close_short') {
            side = 'buy';
        }
        const eventType = this.safeString (trade, 'te');
        let takerOrMaker = undefined;
        if (eventType !== undefined) {
            takerOrMaker = (eventType === 'fulfill_maker') ? 'maker' : 'taker';
        }
        const orderId = this.safeString (trade, 'i');
        // public trades have no orderId
        if (orderId === undefined) {
            takerOrMaker = undefined;
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbolLocal,
            'id': id,
            'order': this.safeString (trade, 'i'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': { 'cost': fee, 'currency': 'USDC' },
        }, market);
    }

    /**
     * @method
     * @name pacifica#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/candle
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
        const isTestnet = this.handleOption ('watchOHLCV', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'source': 'candle',
                'symbol': market['id'],
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
     * @name pacifica#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/candle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const isTestnet = this.handleOption ('unWatchOHLCV', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'source': 'candle',
                'symbol': market['id'],
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
        // {
        //   "channel": "candle",
        //   "data": {
        //     "t": 1749052260000,
        //     "T": 1749052320000,
        //     "s": "SOL",
        //     "i": "1m",
        //     "o": "157.3",
        //     "c": "157.32",
        //     "h": "157.32",
        //     "l": "157.3",
        //     "v": "1.22",
        //     "n": 8
        //   }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const symbolExc = this.safeString (data, 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const timeframe = this.safeString (data, 'i');
        if (!(symbolLocal in this.ohlcvs)) {
            this.ohlcvs[symbolLocal] = {};
        }
        if (!(timeframe in this.ohlcvs[symbolLocal])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbolLocal][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbolLocal][timeframe];
        const parsed = this.parseOHLCV (data);
        ohlcv.append (parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbolLocal;
        client.resolve (ohlcv, messageHash);
    }

    /**
     * @method
     * @name pacifica#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-order-updates
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        // only order updates are supported; Pacifica has an order state subscription (not implemented here)
        await this.loadMarkets ();
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('watchOrders', params);
        let market = undefined;
        let messageHash = 'order';
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const isTestnet = this.handleOption ('watchOrders', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'source': 'account_order_updates',
                'account': userAddress,
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
     * @name pacifica#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-order-updates
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' unWatchOrders() does not support a symbol argument, unWatch from all markets only');
        }
        const messageHash = 'unsubscribe:order';
        const isTestnet = this.handleOption ('unWatchOrders', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const url = this.urls[urlKey]['ws']['public'];
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('unWatchOrders', params);
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'source': 'account_order_updates',
                'account': userAddress,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleOrder (client: Client, message) {
        // not snapshot, only updates
        // {
        //   "channel": "account_order_updates",
        //   "data": [
        //     {
        //       "i": 1559665358,
        //       "I": null,
        //       "u": "BrZp5bidJ3WUvceSq7X78bhjTfZXeezzGvGEV4hAYKTa",
        //       "s": "BTC",
        //       "d": "bid",
        //       "p": "89501",
        //       "ip": "89501",
        //       "lp": "89501",
        //       "a": "0.00012",
        //       "f": "0.00012",
        //       "oe": "fulfill_limit",
        //       "os": "filled",
        //       "ot": "limit",
        //       "sp": null,
        //       "si": null,
        //       "r": false,
        //       "ct": 1765017049008,
        //       "ut": 1765017219639,
        //       "li": 1559696133
        //     }
        //   ]
        // }
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
        // 'rl' key is present only when a rate-limited API key is used
        // {"id":"64107e37-a999-4b90-a3cf-b4322ae110d9","type":"cancel_order","code":420,"err":"Failed to cancel order","t":1769474703073,"rl":{"r":1245,"q":1250,"t":56}}
        //
        const error = this.safeString (message, 'err', '');
        const postType = this.safeString (message, 'type', '');
        const data = this.safeDict (message, 'data', {});
        let id = this.safeString (message, 'id');
        if (id === undefined) {
            id = this.safeString (data, 'id');
        }
        try {
            this.handleErrors (0, error, '', postType, this.options['ws']['options']['headers'], this.json (data), message, {}, {});
        } catch (e) {
            client.reject (e, id);
            return true;
        }
        return false;
    }

    handleOrderBookUnsubscription (client: Client, subscription: Dict) {
        const symbolExc = this.safeString2 (subscription, 'symbol', 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const subMessageHash = 'orderbook:' + symbolLocal;
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        if (symbolLocal in this.orderbooks) {
            delete this.orderbooks[symbolLocal];
        }
    }

    handleTradesUnsubscription (client: Client, subscription: Dict) {
        const symbolExc = this.safeString2 (subscription, 'symbol', 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const subMessageHash = 'trade:' + symbolLocal;
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        if (symbolLocal in this.trades) {
            delete this.trades[symbolLocal];
        }
    }

    handleTickersUnsubscription (client: Client, subscription: Dict) {
        const subMessageHash = 'tickers';
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        const symbols = Object.keys (this.tickers);
        for (let i = 0; i < symbols.length; i++) {
            delete this.tickers[symbols[i]];
        }
    }

    handleOHLCVUnsubscription (client: Client, subscription: Dict) {
        const symbolExc = this.safeString2 (subscription, 'symbol', 's');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const interval = this.safeString (subscription, 'interval');
        const timeframe = this.findTimeframe (interval);
        const subMessageHash = 'candles:' + timeframe + ':' + symbolLocal;
        const messageHash = 'unsubscribe:' + subMessageHash;
        this.cleanUnsubscription (client, subMessageHash, messageHash);
        if (symbolLocal in this.ohlcvs) {
            if (timeframe in this.ohlcvs[symbolLocal]) {
                delete this.ohlcvs[symbolLocal][timeframe];
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
        //  {
        //      "channel": "subscribe",
        //      "data": {
        //          "source": "book",
        //          "symbol": "SOL",
        //          "agg_level": 1
        //      }
        //  }
        //
        //  {
        //      "channel": "unsubscribe",
        //      "data": {
        //          "source": "book",
        //          "symbol": "SOL",
        //          "agg_level": 1
        //      }
        //  }
        //
        const data = this.safeDict (message, 'data', {});
        const method = this.safeString (message, 'channel');
        if (method === 'unsubscribe') {
            const subscription = this.safeDict (data, 'data', {});
            const type = this.safeString (subscription, 'source');
            if (type === 'book') {
                this.handleOrderBookUnsubscription (client, subscription);
            } else if (type === 'trades') {
                this.handleTradesUnsubscription (client, subscription);
            } else if (type === 'prices') {
                this.handleTickersUnsubscription (client, subscription);
            } else if (type === 'candle') {
                this.handleOHLCVUnsubscription (client, subscription);
            } else if (type === 'account_order_updates') {
                this.handleOrderUnsubscription (client, subscription);
            } else if (type === 'account_trades') {
                this.handleMyTradesUnsubscription (client, subscription);
            }
        }
    }

    handleMessage (client: Client, message) {
        //
        // {
        //     "channel":"subscribe",
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
        const postType = this.safeString (message, 'type', undefined);
        const topic = this.safeString (message, 'channel', '');
        const methods: Dict = {
            'pong': this.handlePong,
            'trades': this.handleTrades,
            'book': this.handleOrderBook,
            'candle': this.handleOHLCV,
            'account_order_updates': this.handleOrder,
            'account_trades': this.handleMyTrades,
            'prices': this.handleWsTickers,
            'subscribe': this.handleSubscriptionResponse,
            'unsubscribe': this.handleSubscriptionResponse,
        };
        const exacMethod = this.safeValue (methods, topic);
        if (exacMethod !== undefined) {
            exacMethod.call (this, client, message);
            return;
        }
        if (postType !== undefined) {
            this.handleWsPost (client, message);
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

    requestId (): string {
        return this.uuid (); // uuid v4
    }

    wrapAsPostAction (operationType: string, request: Dict): Dict {
        if (operationType === undefined) {
            throw new ArgumentsRequired (this.id + 'postAction() requires a "operationType" argument!');
        }
        const requestId = this.requestId ();
        const payload = {
            'id': requestId,
            'params': {},
        };
        payload['params'][operationType] = request;
        return payload;
    }

    handleWsPost (client: Client, message: Dict) {
        //
        // market order
        // {
        //   "code": 200,
        //   "data": {
        //     "I": "79f948fd-7556-4066-a128-083f3ea49322",
        //     "i": 645953,
        //     "s": "BTC"
        //   },
        //   "id": "660065de-8f32-46ad-ba1e-83c93d3e3966",
        //   "t": 1749223025962,
        //   "type": "create_market_order"
        // }
        //
        // limit order
        // {
        //   "code": 200,
        //   "data": {
        //     "I": "79f948fd-7556-4066-a128-083f3ea49322",
        //     "i": 645953,
        //     "s": "BTC"
        //   },
        //   "id": "660065de-8f32-46ad-ba1e-83c93d3e3966",
        //   "t": 1749223025962,
        //   "type": "create_order"
        // }
        //
        const id = this.safeString (message, 'id');
        client.resolve (message, id);
    }
}
