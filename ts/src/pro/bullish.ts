
//  ---------------------------------------------------------------------------

import bullishRest from '../bullish.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Dict, Int, Order, OrderBook, Str, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bullish extends bullishRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTrades': true,
                'watchPositions': false,
                'watchMyTrades': false,
                'watchBalance': false,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.exchange.bullish.com',
                        'private': 'wss://api.exchange.bullish.com/trading-api/v1/private-data',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.simnext.bullish-test.com',
                        'private': 'wss://api.simnext.bullish-test.com/trading-api/v1/private-data',
                    },
                },
            },
            'options': {
                'ws': {
                    'cookies': {},
                    'headers': {},
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 99000,
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    ping (client: Client) {
        // bullish does not support built-in ws protocol-level ping-pong
        // https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--keep-websocket-open
        const id = this.requestId ().toString ();
        return {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'keepalivePing',
            'params': {},
            'id': id,
        };
    }

    async watchPublic (url: string, messageHash: string, request = {}, params = {}): Promise<any> {
        const id = this.requestId ().toString ();
        const message = {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'subscribe',
            'params': request,
            'id': id,
        };
        const fullUrl = this.urls['api']['ws']['public'] + url;
        return await this.watch (fullUrl, messageHash, this.deepExtend (message, params), messageHash);
    }

    async watchPrivate (messageHash: string, subscribeHash: string, request = {}, params = {}): Promise<any> {
        const url = this.urls['api']['ws']['private'];
        let token = this.token;
        const now = this.milliseconds ();
        const tokenExpires = this.safeInteger (this.options, 'tokenExpires');
        if ((token !== undefined) || (tokenExpires === undefined) || (now > tokenExpires)) {
            await this.signIn ();
            token = this.token;
        }
        const cookies = {
            'JWT_COOKIE': token,
        };
        this.options['ws']['cookies'] = cookies;
        const id = this.requestId ().toString ();
        const message = {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'subscribe',
            'params': request,
            'id': id,
        };
        const result = await this.watch (url, messageHash, this.deepExtend (message, params), subscribeHash);
        return result;
    }

    /**
     * @method
     * @name bullish#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--unified-anonymous-trades-websocket-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades::' + market['symbol'];
        const url = '/trading-api/v1/market-data/trades';
        const request: any = {
            'topic': 'anonymousTrades',
            'symbol': market['id'],
        };
        const trades = await this.watchPublic (url, messageHash, request, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "type": "snapshot",
        //         "dataType": "V1TAAnonymousTradeUpdate",
        //         "data": {
        //             "trades": [
        //                 {
        //                     "tradeId": "100086000000609304",
        //                     "isTaker": true,
        //                     "price": "104889.2063",
        //                     "createdAtTimestamp": "1749124509118",
        //                     "quantity": "0.01000000",
        //                     "publishedAtTimestamp": "1749124531466",
        //                     "side": "BUY",
        //                     "createdAtDatetime": "2025-06-05T11:55:09.118Z",
        //                     "symbol": "BTCUSDC"
        //                 }
        //             ],
        //             "createdAtTimestamp": "1749124509118",
        //             "publishedAtTimestamp": "1749124531466",
        //             "symbol": "BTCUSDC"
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const market = this.market (symbol);
        const rawTrades = this.safeList (data, 'trades', []);
        const trades = this.parseTrades (rawTrades, market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const tradesArrayCache = new ArrayCache (limit);
            this.trades[symbol] = tradesArrayCache;
        }
        const tradesArray = this.trades[symbol];
        for (let i = 0; i < trades.length; i++) {
            tradesArray.append (trades[i]);
        }
        this.trades[symbol] = tradesArray;
        const messageHash = 'trades::' + market['symbol'];
        client.resolve (tradesArray, messageHash);
    }

    /**
     * @method
     * @name bullish#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--anonymous-market-data-price-tick-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'] + '/trading-api/v1/market-data/tick/' + market['id'];
        const messageHash = 'ticker::' + symbol;
        return await this.watch (url, messageHash, params, messageHash); // no need to send a subscribe message, the server sends a ticker update on connect
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "type": "update",
        //         "dataType": "V1TATickerResponse",
        //         "data": {
        //             "askVolume": "0.00100822",
        //             "average": "104423.1806",
        //             "baseVolume": "472.83799258",
        //             "bestAsk": "104324.6000",
        //             "bestBid": "104324.5000",
        //             "bidVolume": "0.00020146",
        //             "change": "-198.4864",
        //             "close": "104323.9374",
        //             "createdAtTimestamp": "1749132838951",
        //             "publishedAtTimestamp": "1749132838955",
        //             "high": "105966.6577",
        //             "last": "104323.9374",
        //             "lastTradeDatetime": "2025-06-05T14:13:56.111Z",
        //             "lastTradeSize": "0.02396100",
        //             "low": "104246.6662",
        //             "open": "104522.4238",
        //             "percentage": "-0.19",
        //             "quoteVolume": "49662592.6712",
        //             "symbol": "BTC-USDC-PERP",
        //             "type": "ticker",
        //             "vwap": "105030.6996",
        //             "currentPrice": "104324.7747",
        //             "ammData": [
        //                 {
        //                     "feeTierId": "1",
        //                     "currentPrice": "104324.7747",
        //                     "baseReservesQuantity": "8.27911366",
        //                     "quoteReservesQuantity": "1067283.0234",
        //                     "bidSpreadFee": "0.00000000",
        //                     "askSpreadFee": "0.00000000"
        //                 }
        //             ],
        //             "createdAtDatetime": "2025-06-05T14:13:58.951Z",
        //             "markPrice": "104289.6884",
        //             "fundingRate": "-0.000192",
        //             "openInterest": "92.24146651"
        //         }
        //     }
        //
        const updateType = this.safeString (message, 'type', '');
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let parsed = undefined;
        if ((updateType === 'snapshot')) {
            parsed = this.parseTicker (data, market);
        } else if (updateType === 'update') {
            const ticker = this.safeDict (this.tickers, symbol, {});
            const rawTicker = this.safeDict (ticker, 'info', {});
            const merged = this.extend (rawTicker, data);
            parsed = this.parseTicker (merged, market);
        }
        this.tickers[symbol] = parsed;
        const messageHash = 'ticker::' + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    /**
     * @method
     * @name bullish#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--multi-orderbook-websocket-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = '/trading-api/v1/market-data/orderbook';
        const messageHash = 'orderbook::' + market['symbol'];
        const request: Dict = {
            'topic': 'l2Orderbook', // 'l2Orderbook' returns only snapshots while 'l1Orderbook' returns only updates
            'symbol': market['id'],
        };
        const orderbook = await this.watchPublic (url, messageHash, request, params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "type": "snapshot",
        //         "dataType": "V1TALevel2",
        //         "data": {
        //             "timestamp": "1749372632028",
        //             "bids": [
        //                 "105523.3000",
        //                 "0.00046045",
        //             ],
        //             "asks": [
        //                 "105523.4000",
        //                 "0.00117112",
        //             ],
        //             "publishedAtTimestamp": "1749372632073",
        //             "datetime": "2025-06-08T08:50:32.028Z",
        //             "sequenceNumberRange": [ 1967862061, 1967862062 ],
        //             "symbol": "BTCUSDC"
        //         }
        //     }
        //
        // current channel is 'l2Orderbook' which returns only snapshots
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'orderbook::' + symbol;
        const timestamp = this.safeInteger (data, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const bids = this.separateBidsOrAsks (this.safeList (data, 'bids', []));
        const asks = this.separateBidsOrAsks (this.safeList (data, 'asks', []));
        const snapshot = {
            'bids': bids,
            'asks': asks,
        };
        const parsed = this.parseOrderBook (snapshot, symbol, timestamp);
        const sequenceNumberRange = this.safeList (data, 'sequenceNumberRange', []);
        if (sequenceNumberRange.length > 0) {
            const lastIndex = sequenceNumberRange.length - 1;
            parsed['nonce'] = this.safeInteger (sequenceNumberRange, lastIndex);
        }
        orderbook.reset (parsed);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    separateBidsOrAsks (entry) {
        const result = [];
        const lastIndex = entry.length - 1;
        for (let i = 0; i < lastIndex; i += 2) {
            const price = this.safeString (entry, i);
            const amount = this.safeString (entry, i + 1);
            result.push ([ price, amount ]);
        }
        return result;
    }

    /**
     * @method
     * @name bullish#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const subscribeHash = 'orders';
        let messageHash = subscribeHash;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + '::' + symbol;
        }
        const request: Dict = {
            'topic': 'orders',
        };
        const orders = await this.watchPrivate (messageHash, subscribeHash, request, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         "type": "update",
        //         "tradingAccountId": "111309424211255",
        //         "dataType": "V1TAOrder",
        //         "data": {
        //             "status": "OPEN",
        //             "createdAtTimestamp": "1751893427971",
        //             "quoteFee": "0.000000",
        //             "stopPrice": null,
        //             "quantityFilled": "0.00000000",
        //             "handle": null,
        //             "clientOrderId": null,
        //             "quantity": "0.10000000",
        //             "margin": false,
        //             "side": "BUY",
        //             "createdAtDatetime": "2025-07-07T13:03:47.971Z",
        //             "isLiquidation": false,
        //             "borrowedQuoteQuantity": null,
        //             "borrowedBaseQuantity": null,
        //             "timeInForce": "GTC",
        //             "borrowedQuantity": null,
        //             "baseFee": "0.000000",
        //             "quoteAmount": "0.0000000",
        //             "price": "0.0000000",
        //             "statusReason": "Order accepted",
        //             "type": "MKT",
        //             "statusReasonCode": 6014,
        //             "allowBorrow": false,
        //             "orderId": "862317981870850049",
        //             "publishedAtTimestamp": "1751893427975",
        //             "symbol": "ETHUSDT",
        //             "averageFillPrice": null
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data'); // could be an empty list
        const parsed = this.parseOrder (data);
        const symbol = this.safeString (parsed, 'symbol');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const orders = this.orders;
            orders.append (parsed);
            const messageHash = 'orders';
            const symbolMessageHash = messageHash + '::' + symbol;
            client.resolve (orders, symbolMessageHash);
            client.resolve (orders, messageHash);
        }
    }

    handleMessage (client: Client, message) {
        const dataType = this.safeString (message, 'dataType');
        if (dataType !== undefined) {
            if (dataType === 'V1TAAnonymousTradeUpdate') {
                this.handleTrades (client, message);
            }
            if (dataType === 'V1TATickerResponse') {
                this.handleTicker (client, message);
            }
            if (dataType === 'V1TALevel2') {
                this.handleOrderBook (client, message);
            }
            if (dataType === 'V1TAOrder') {
                this.handleOrder (client, message);
            }
        }
    }
}
