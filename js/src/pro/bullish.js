//  ---------------------------------------------------------------------------
import bullishRest from '../bullish.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { ExchangeError } from '../base/errors.js';
//  ---------------------------------------------------------------------------
export default class bullish extends bullishRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchPositions': true,
                'watchMyTrades': true,
                'watchBalance': true,
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
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 99000, // disconnect after 100 seconds of inactivity
            },
        });
    }
    requestId() {
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }
    ping(client) {
        // bullish does not support built-in ws protocol-level ping-pong
        // https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--keep-websocket-open
        const id = this.requestId().toString();
        return {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'keepalivePing',
            'params': {},
            'id': id,
        };
    }
    handlePong(client, message) {
        //
        //     {
        //         "id": "7",
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "responseCodeName": "OK",
        //             "responseCode": "200",
        //             "message": "Keep alive pong"
        //         }
        //     }
        //
        client.lastPong = this.milliseconds();
        return message; // current line is for transpilation compatibility
    }
    async watchPublic(url, messageHash, request = {}, params = {}) {
        const id = this.requestId().toString();
        const message = {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'subscribe',
            'params': request,
            'id': id,
        };
        const fullUrl = this.urls['api']['ws']['public'] + url;
        return await this.watch(fullUrl, messageHash, this.deepExtend(message, params), messageHash);
    }
    async watchPrivate(messageHash, subscribeHash, request = {}, params = {}) {
        const url = this.urls['api']['ws']['private'];
        const token = await this.handleToken();
        const cookies = {
            'JWT_COOKIE': token,
        };
        this.options['ws']['cookies'] = cookies;
        const id = this.requestId().toString();
        const message = {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'subscribe',
            'params': request,
            'id': id,
        };
        const result = await this.watch(url, messageHash, this.deepExtend(message, params), subscribeHash);
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
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'trades::' + market['symbol'];
        const url = '/trading-api/v1/market-data/trades';
        const request = {
            'topic': 'anonymousTrades',
            'symbol': market['id'],
        };
        const trades = await this.watchPublic(url, messageHash, request, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
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
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const symbol = this.safeSymbol(marketId);
        const market = this.market(symbol);
        const rawTrades = this.safeList(data, 'trades', []);
        const trades = this.parseTrades(rawTrades, market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const tradesArrayCache = new ArrayCache(limit);
            this.trades[symbol] = tradesArrayCache;
        }
        const tradesArray = this.trades[symbol];
        for (let i = 0; i < trades.length; i++) {
            tradesArray.append(trades[i]);
        }
        this.trades[symbol] = tradesArray;
        const messageHash = 'trades::' + market['symbol'];
        client.resolve(tradesArray, messageHash);
    }
    /**
     * @method
     * @name bullish#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--anonymous-market-data-price-tick-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'] + '/trading-api/v1/market-data/tick/' + market['id'];
        const messageHash = 'ticker::' + symbol;
        return await this.watch(url, messageHash, params, messageHash); // no need to send a subscribe message, the server sends a ticker update on connect
    }
    handleTicker(client, message) {
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
        const updateType = this.safeString(message, 'type', '');
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let parsed = undefined;
        if ((updateType === 'snapshot')) {
            parsed = this.parseTicker(data, market);
        }
        else if (updateType === 'update') {
            const ticker = this.safeDict(this.tickers, symbol, {});
            const rawTicker = this.safeDict(ticker, 'info', {});
            const merged = this.extend(rawTicker, data);
            parsed = this.parseTicker(merged, market);
        }
        this.tickers[symbol] = parsed;
        const messageHash = 'ticker::' + symbol;
        client.resolve(this.tickers[symbol], messageHash);
    }
    /**
     * @method
     * @name bullish#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--multi-orderbook-websocket-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const url = '/trading-api/v1/market-data/orderbook';
        const messageHash = 'orderbook::' + market['symbol'];
        const request = {
            'topic': 'l2Orderbook',
            'symbol': market['id'],
        };
        const orderbook = await this.watchPublic(url, messageHash, request, params);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
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
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const symbol = this.safeSymbol(marketId);
        const messageHash = 'orderbook::' + symbol;
        const timestamp = this.safeInteger(data, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const bids = this.separateBidsOrAsks(this.safeList(data, 'bids', []));
        const asks = this.separateBidsOrAsks(this.safeList(data, 'asks', []));
        const snapshot = {
            'bids': bids,
            'asks': asks,
        };
        const parsed = this.parseOrderBook(snapshot, symbol, timestamp);
        const sequenceNumberRange = this.safeList(data, 'sequenceNumberRange', []);
        if (sequenceNumberRange.length > 0) {
            const lastIndex = sequenceNumberRange.length - 1;
            parsed['nonce'] = this.safeInteger(sequenceNumberRange, lastIndex);
        }
        orderbook.reset(parsed);
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    separateBidsOrAsks(entry) {
        const result = [];
        // 300 = '54885.0000000'
        // 301 = '0.06141566'
        // 302 ='53714.0000000'
        for (let i = 0; i < entry.length; i++) {
            if (i % 2 !== 0) {
                continue;
            }
            const price = this.safeString(entry, i);
            const amount = this.safeString(entry, i + 1);
            result.push([price, amount]);
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
     * @param {string} [params.tradingAccountId] the trading account id to fetch entries for
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const subscribeHash = 'orders';
        let messageHash = subscribeHash;
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash = messageHash + '::' + symbol;
        }
        const request = {
            'topic': 'orders',
        };
        const tradingAccountId = this.safeString(params, 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            request['tradingAccountId'] = tradingAccountId;
            params = this.omit(params, 'tradingAccountId');
        }
        const orders = await this.watchPrivate(messageHash, subscribeHash, request, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrders(client, message) {
        // snapshot
        //     {
        //         "type": "snapshot",
        //         "tradingAccountId": "111309424211255",
        //         "dataType": "V1TAOrder",
        //         "data": [ ... ] // could be an empty list or a list of orders
        //     }
        //
        // update
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
        const type = this.safeString(message, 'type');
        let rawOrders = [];
        if (type === 'update') {
            const data = this.safeDict(message, 'data', {});
            rawOrders.push(data); // update is a single order
        }
        else {
            rawOrders = this.safeList(message, 'data', []); // snapshot is a list of orders
        }
        if (rawOrders.length > 0) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById(limit);
            }
            const orders = this.orders;
            const symbols = {};
            for (let i = 0; i < rawOrders.length; i++) {
                const rawOrder = rawOrders[i];
                const parsedOrder = this.parseOrder(rawOrder);
                orders.append(parsedOrder);
                const symbol = this.safeString(parsedOrder, 'symbol');
                symbols[symbol] = true;
            }
            const messageHash = 'orders';
            client.resolve(orders, messageHash);
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const hashSymbol = keys[i];
                const symbolMessageHash = messageHash + '::' + hashSymbol;
                client.resolve(this.orders, symbolMessageHash);
            }
        }
    }
    /**
     * @method
     * @name bullish#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id to fetch entries for
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const subscribeHash = 'myTrades';
        let messageHash = subscribeHash;
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += '::' + symbol;
        }
        const request = {
            'topic': 'trades',
        };
        const tradingAccountId = this.safeString(params, 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            request['tradingAccountId'] = tradingAccountId;
            params = this.omit(params, 'tradingAccountId');
        }
        const trades = await this.watchPrivate(messageHash, subscribeHash, request, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleMyTrades(client, message) {
        //
        // snapshot
        //     {
        //         "type": "snapshot",
        //         "tradingAccountId": "111309424211255",
        //         "dataType": "V1TATrade",
        //         "data": [ ... ] // could be an empty list or a list of trades
        //     }
        //
        // update
        //     {
        //         "type": "update",
        //         "tradingAccountId": "111309424211255",
        //         "dataType": "V1TATrade",
        //         "data": {
        //             "clientOtcTradeId": null,
        //             "tradeId": "100203000003940164",
        //             "baseFee": "0.00000000",
        //             "isTaker": true,
        //             "quoteAmount": "253.6012195",
        //             "price": "2536.0121950",
        //             "createdAtTimestamp": "1751914859840",
        //             "quoteFee": "0.0000000",
        //             "tradeRebateAmount": null,
        //             "tradeRebateAssetSymbol": null,
        //             "handle": null,
        //             "otcTradeId": null,
        //             "otcMatchId": null,
        //             "orderId": "862407873644725249",
        //             "quantity": "0.10000000",
        //             "publishedAtTimestamp": "1751914859843",
        //             "side": "SELL",
        //             "createdAtDatetime": "2025-07-07T19:00:59.840Z",
        //             "symbol": "ETHUSDT"
        //         }
        //     }
        //
        const type = this.safeString(message, 'type');
        let rawTrades = [];
        if (type === 'update') {
            const data = this.safeDict(message, 'data', {});
            rawTrades.push(data); // update is a single trade
        }
        else {
            rawTrades = this.safeList(message, 'data', []); // snapshot is a list of trades
        }
        if (rawTrades.length > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCacheBySymbolById(limit);
            }
            const trades = this.myTrades;
            const symbols = {};
            for (let i = 0; i < rawTrades.length; i++) {
                const rawTrade = rawTrades[i];
                const parsedTrade = this.parseTrade(rawTrade);
                trades.append(parsedTrade);
                const symbol = this.safeString(parsedTrade, 'symbol');
                symbols[symbol] = true;
            }
            const messageHash = 'myTrades';
            client.resolve(trades, messageHash);
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const hashSymbol = keys[i];
                const symbolMessageHash = messageHash + '::' + hashSymbol;
                client.resolve(this.myTrades, symbolMessageHash);
            }
        }
    }
    /**
     * @method
     * @name bullish#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id to fetch entries for
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        const request = {
            'topic': 'assetAccounts',
        };
        let messageHash = 'balance';
        const tradingAccountId = this.safeString(params, 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            params = this.omit(params, 'tradingAccountId');
            request['tradingAccountId'] = tradingAccountId;
            messageHash += '::' + tradingAccountId;
        }
        return await this.watchPrivate(messageHash, messageHash, request, params);
    }
    handleBalance(client, message) {
        //
        // snapshot
        //     {
        //         "type": "snapshot",
        //         "tradingAccountId": "111309424211255",
        //         "dataType": "V1TAAssetAccount",
        //         "data": [
        //             {
        //                 "updatedAtTimestamp": "1751989627509",
        //                 "borrowedQuantity": "0.0000",
        //                 "tradingAccountId": "111309424211255",
        //                 "loanedQuantity": "0.0000",
        //                 "lockedQuantity": "0.0000",
        //                 "assetId": "5",
        //                 "assetSymbol": "USDC",
        //                 "publishedAtTimestamp": "1751989627512",
        //                 "availableQuantity": "999672939.8767",
        //                 "updatedAtDatetime": "2025-07-08T15:47:07.509Z"
        //             }
        //         ]
        //     }
        //
        // update
        //     {
        //         "type": "update",
        //         "tradingAccountId": "111309424211255",
        //         "dataType": "V1TAAssetAccount",
        //         "data": {
        //             "updatedAtTimestamp": "1751989627509",
        //             "borrowedQuantity": "0.0000",
        //             "tradingAccountId": "111309424211255",
        //             "loanedQuantity": "0.0000",
        //             "lockedQuantity": "0.0000",
        //             "assetId": "5",
        //             "assetSymbol": "USDC",
        //             "publishedAtTimestamp": "1751989627512",
        //             "availableQuantity": "999672939.8767",
        //             "updatedAtDatetime": "2025-07-08T15:47:07.509Z"
        //         }
        //     }
        //
        const tradingAccountId = this.safeString(message, 'tradingAccountId');
        if (!(tradingAccountId in this.balance)) {
            this.balance[tradingAccountId] = {};
        }
        const messageType = this.safeString(message, 'type');
        if (messageType === 'snapshot') {
            const data = this.safeList(message, 'data', []);
            this.balance[tradingAccountId] = this.parseBalance(data);
        }
        else {
            const data = this.safeDict(message, 'data', {});
            const assetId = this.safeString(data, 'assetSymbol');
            const account = this.account();
            account['total'] = this.safeString(data, 'availableQuantity');
            account['used'] = this.safeString(data, 'lockedQuantity');
            const code = this.safeCurrencyCode(assetId);
            this.balance[tradingAccountId][code] = account;
            this.balance[tradingAccountId]['info'] = message;
            this.balance[tradingAccountId] = this.safeBalance(this.balance[tradingAccountId]);
        }
        const messageHash = 'balance';
        const tradingAccountIdHash = '::' + tradingAccountId;
        client.resolve(this.balance[tradingAccountId], messageHash);
        client.resolve(this.balance[tradingAccountId], messageHash + tradingAccountIdHash);
    }
    /**
     * @method
     * @name bullish#watchPositions
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const subscribeHash = 'positions';
        let messageHash = subscribeHash;
        if (!this.isEmpty(symbols)) {
            symbols = this.marketSymbols(symbols);
            messageHash += '::' + symbols.join(',');
        }
        const request = {
            'topic': 'derivativesPositionsV2',
        };
        const positions = await this.watchPrivate(messageHash, subscribeHash, request, params);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit(positions, symbols, since, limit, true);
    }
    handlePositions(client, message) {
        // exchange does not return messages for sandbox mode
        // current method is implemented blindly
        // todo: check if this works with not-sandbox mode
        const messageType = this.safeString(message, 'type');
        let rawPositions = [];
        if (messageType === 'update') {
            const data = this.safeDict(message, 'data', {});
            rawPositions.push(data);
        }
        else {
            rawPositions = this.safeList(message, 'data', []);
        }
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide();
        }
        const positions = this.positions;
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parsePosition(rawPosition);
            positions.append(position);
            newPositions.push(position);
        }
        const messageHashes = this.findMessageHashes(client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const symbolPositions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(symbolPositions)) {
                client.resolve(symbolPositions, messageHash);
            }
        }
        client.resolve(positions, 'positions');
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "data": {
        //             "errorCode": 401,
        //             "errorCodeName": "UNAUTHORIZED",
        //             "message": "Unable to authenticate; JWT is missing/invalid or unauthorised to access account"
        //         },
        //         "dataType": "V1TAErrorResponse",
        //         "type": "error"
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const feedback = this.id + ' ' + this.json(data);
        try {
            const errorCode = this.safeString(data, 'errorCode');
            const errorCodeName = this.safeString(data, 'errorCodeName');
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], errorCodeName, feedback);
            throw new ExchangeError(feedback); // unknown message
        }
        catch (e) {
            client.reject(e);
        }
    }
    handleMessage(client, message) {
        const dataType = this.safeString(message, 'dataType');
        const result = this.safeDict(message, 'result');
        if (result !== undefined) {
            const response = this.safeString(result, 'message');
            if (response === 'Keep alive pong') {
                this.handlePong(client, message);
            }
        }
        else if (dataType !== undefined) {
            if (dataType === 'V1TAAnonymousTradeUpdate') {
                this.handleTrades(client, message);
            }
            if (dataType === 'V1TATickerResponse') {
                this.handleTicker(client, message);
            }
            if (dataType === 'V1TALevel2') {
                this.handleOrderBook(client, message);
            }
            if (dataType === 'V1TAOrder') {
                this.handleOrders(client, message);
            }
            if (dataType === 'V1TATrade') {
                this.handleMyTrades(client, message);
            }
            if (dataType === 'V1TAAssetAccount') {
                this.handleBalance(client, message);
            }
            if (dataType === 'V1TAErrorResponse') {
                this.handleErrorMessage(client, message);
            }
        }
    }
}
