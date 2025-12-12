'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bithumb$1 = require('../bithumb.js');
var Cache = require('../base/ws/Cache.js');
var errors = require('../base/errors.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var rsa = require('../base/functions/rsa.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bithumb extends bithumb$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://pubwss.bithumb.com/pub/ws',
                        'publicV2': 'wss://ws-api.bithumb.com/websocket/v1',
                        'privateV2': 'wss://ws-api.bithumb.com/websocket/v1/private', // v2.1.5
                    },
                },
            },
            'options': {},
            'streaming': {},
            'exceptions': {},
        });
    }
    /**
     * @method
     * @name bithumb#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        const url = this.urls['api']['ws']['public'];
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const request = {
            'type': 'ticker',
            'symbols': [market['base'] + '_' + market['quote']],
            'tickTypes': [this.safeString(params, 'tickTypes', '24H')],
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    /**
     * @method
     * @name bithumb#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['public'];
        const marketIds = [];
        const messageHashes = [];
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            marketIds.push(market['base'] + '_' + market['quote']);
            messageHashes.push('ticker:' + market['symbol']);
        }
        const request = {
            'type': 'ticker',
            'symbols': marketIds,
            'tickTypes': [this.safeString(params, 'tickTypes', '24H')],
        };
        const message = this.extend(request, params);
        const newTicker = await this.watchMultiple(url, messageHashes, message, messageHashes);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //    {
        //        "type" : "ticker",
        //        "content" : {
        //            "symbol" : "BTC_KRW",           // 통화코드
        //            "tickType" : "24H",                 // 변동 기준시간- 30M, 1H, 12H, 24H, MID
        //            "date" : "20200129",                // 일자
        //            "time" : "121844",                  // 시간
        //            "openPrice" : "2302",               // 시가
        //            "closePrice" : "2317",              // 종가
        //            "lowPrice" : "2272",                // 저가
        //            "highPrice" : "2344",               // 고가
        //            "value" : "2831915078.07065789",    // 누적거래금액
        //            "volume" : "1222314.51355788",  // 누적거래량
        //            "sellVolume" : "760129.34079004",   // 매도누적거래량
        //            "buyVolume" : "462185.17276784",    // 매수누적거래량
        //            "prevClosePrice" : "2326",          // 전일종가
        //            "chgRate" : "0.65",                 // 변동률
        //            "chgAmt" : "15",                    // 변동금액
        //            "volumePower" : "60.80"         // 체결강도
        //        }
        //    }
        //
        const content = this.safeDict(message, 'content', {});
        const marketId = this.safeString(content, 'symbol');
        const symbol = this.safeSymbol(marketId, undefined, '_');
        const ticker = this.parseWsTicker(content);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve(this.tickers[symbol], messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //    {
        //        "symbol" : "BTC_KRW",           // 통화코드
        //        "tickType" : "24H",                 // 변동 기준시간- 30M, 1H, 12H, 24H, MID
        //        "date" : "20200129",                // 일자
        //        "time" : "121844",                  // 시간
        //        "openPrice" : "2302",               // 시가
        //        "closePrice" : "2317",              // 종가
        //        "lowPrice" : "2272",                // 저가
        //        "highPrice" : "2344",               // 고가
        //        "value" : "2831915078.07065789",    // 누적거래금액
        //        "volume" : "1222314.51355788",  // 누적거래량
        //        "sellVolume" : "760129.34079004",   // 매도누적거래량
        //        "buyVolume" : "462185.17276784",    // 매수누적거래량
        //        "prevClosePrice" : "2326",          // 전일종가
        //        "chgRate" : "0.65",                 // 변동률
        //        "chgAmt" : "15",                    // 변동금액
        //        "volumePower" : "60.80"         // 체결강도
        //    }
        //
        const date = this.safeString(ticker, 'date', '');
        const time = this.safeString(ticker, 'time', '');
        const datetime = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8) + 'T' + time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4, 6);
        const marketId = this.safeString(ticker, 'symbol');
        return this.safeTicker({
            'symbol': this.safeSymbol(marketId, market, '_'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'high': this.safeString(ticker, 'highPrice'),
            'low': this.safeString(ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': this.safeString(ticker, 'buyVolume'),
            'ask': undefined,
            'askVolume': this.safeString(ticker, 'sellVolume'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'openPrice'),
            'close': this.safeString(ticker, 'closePrice'),
            'last': undefined,
            'previousClose': this.safeString(ticker, 'prevClosePrice'),
            'change': this.safeString(ticker, 'chgAmt'),
            'percentage': this.safeString(ticker, 'chgRate'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': this.safeString(ticker, 'value'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name bithumb#watchOrderBook
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['public'];
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook' + ':' + symbol;
        const request = {
            'type': 'orderbookdepth',
            'symbols': [market['base'] + '_' + market['quote']],
        };
        const orderbook = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //    {
        //        "type" : "orderbookdepth",
        //            "content" : {
        //            "list" : [
        //                {
        //                    "symbol" : "BTC_KRW",
        //                    "orderType" : "ask",        // 주문타입 – bid / ask
        //                    "price" : "10593000",       // 호가
        //                    "quantity" : "1.11223318",  // 잔량
        //                    "total" : "3"               // 건수
        //                },
        //                {"symbol" : "BTC_KRW", "orderType" : "ask", "price" : "10596000", "quantity" : "0.5495", "total" : "8"},
        //                {"symbol" : "BTC_KRW", "orderType" : "ask", "price" : "10598000", "quantity" : "18.2085", "total" : "10"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10532000", "quantity" : "0", "total" : "0"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10572000", "quantity" : "2.3324", "total" : "4"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10571000", "quantity" : "1.469", "total" : "3"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10569000", "quantity" : "0.5152", "total" : "2"}
        //            ],
        //            "datetime":1580268255864325     // 일시
        //        }
        //    }
        //
        const content = this.safeDict(message, 'content', {});
        const list = this.safeList(content, 'list', []);
        const first = this.safeDict(list, 0, {});
        const marketId = this.safeString(first, 'symbol');
        const symbol = this.safeSymbol(marketId, undefined, '_');
        const timestampStr = this.safeString(content, 'datetime');
        const timestamp = this.parseToInt(timestampStr.slice(0, 13));
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook();
            ob['symbol'] = symbol;
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        this.handleDeltas(orderbook, list);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        const messageHash = 'orderbook' + ':' + symbol;
        client.resolve(orderbook, messageHash);
    }
    handleDelta(orderbook, delta) {
        //
        //    {
        //        symbol: "ETH_BTC",
        //        orderType: "bid",
        //        price: "0.07349517",
        //        quantity: "0",
        //        total: "0",
        //    }
        //
        const sideId = this.safeString(delta, 'orderType');
        const side = (sideId === 'bid') ? 'bids' : 'asks';
        const bidAsk = this.parseBidAsk(delta, 'price', 'quantity');
        const orderbookSide = orderbook[side];
        orderbookSide.storeArray(bidAsk);
    }
    handleDeltas(orderbook, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(orderbook, deltas[i]);
        }
    }
    /**
     * @method
     * @name bithumb#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['public'];
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const request = {
            'type': 'transaction',
            'symbols': [market['base'] + '_' + market['quote']],
        };
        const trades = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //    {
        //        "type" : "transaction",
        //        "content" : {
        //            "list" : [
        //                {
        //                    "symbol" : "BTC_KRW",
        //                    "buySellGb" : "1",
        //                    "contPrice" : "10579000",
        //                    "contQty" : "0.01",
        //                    "contAmt" : "105790.00",
        //                    "contDtm" : "2020-01-29 12:24:18.830039",
        //                    "updn" : "dn"
        //                }
        //            ]
        //        }
        //    }
        //
        const content = this.safeDict(message, 'content', {});
        const rawTrades = this.safeList(content, 'list', []);
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const marketId = this.safeString(rawTrade, 'symbol');
            const symbol = this.safeSymbol(marketId, undefined, '_');
            if (!(symbol in this.trades)) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                const stored = new Cache.ArrayCache(limit);
                this.trades[symbol] = stored;
            }
            const trades = this.trades[symbol];
            const parsed = this.parseWsTrade(rawTrade);
            trades.append(parsed);
            const messageHash = 'trade' + ':' + symbol;
            client.resolve(trades, messageHash);
        }
    }
    parseWsTrade(trade, market = undefined) {
        //
        //    {
        //        "symbol" : "BTC_KRW",
        //        "buySellGb" : "1",
        //        "contPrice" : "10579000",
        //        "contQty" : "0.01",
        //        "contAmt" : "105790.00",
        //        "contDtm" : "2020-01-29 12:24:18.830038",
        //        "updn" : "dn"
        //    }
        //
        const marketId = this.safeString(trade, 'symbol');
        const datetime = this.safeString(trade, 'contDtm');
        // that date is not UTC iso8601, but exchange's local time, -9hr difference
        const timestamp = this.parse8601(datetime) - 32400000;
        const sideId = this.safeString(trade, 'buySellGb');
        return this.safeTrade({
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(marketId, market, '_'),
            'order': undefined,
            'type': undefined,
            'side': (sideId === '1') ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'contPrice'),
            'amount': this.safeString(trade, 'contQty'),
            'cost': this.safeString(trade, 'contAmt'),
            'fee': undefined,
        }, market);
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        "status" : "5100",
        //        "resmsg" : "Invalid Filter Syntax"
        //    }
        //
        if (!('status' in message)) {
            return true;
        }
        const errorCode = this.safeString(message, 'status');
        try {
            if (errorCode !== '0000') {
                const msg = this.safeString(message, 'resmsg');
                throw new errors.ExchangeError(this.id + ' ' + msg);
            }
            return true;
        }
        catch (e) {
            client.reject(e);
        }
        return true;
    }
    /**
     * @method
     * @name bithumb#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%9E%90%EC%82%B0-myasset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws']['privateV2'];
        const messageHash = 'myAsset';
        const request = [
            { 'ticket': 'ccxt' },
            { 'type': messageHash },
        ];
        const balance = await this.watch(url, messageHash, request, messageHash);
        return balance;
    }
    handleBalance(client, message) {
        //
        //    {
        //        "type": "myAsset",
        //        "assets": [
        //            {
        //                "currency": "KRW",
        //                "balance": "2061832.35",
        //                "locked": "3824127.3"
        //            }
        //        ],
        //        "asset_timestamp": 1727052537592,
        //        "timestamp": 1727052537687,
        //        "stream_type": "REALTIME"
        //    }
        //
        const messageHash = 'myAsset';
        const assets = this.safeList(message, 'assets', []);
        if (this.balance === undefined) {
            this.balance = {};
        }
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const currencyId = this.safeString(asset, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(asset, 'balance');
            account['used'] = this.safeString(asset, 'locked');
            this.balance[code] = account;
        }
        this.balance['info'] = message;
        const timestamp = this.safeInteger(message, 'timestamp');
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601(timestamp);
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, messageHash);
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const wsOptions = this.safeDict(this.options, 'ws', {});
        const authenticated = this.safeString(wsOptions, 'token');
        if (authenticated === undefined) {
            const payload = {
                'access_key': this.apiKey,
                'nonce': this.uuid(),
                'timestamp': this.milliseconds(),
            };
            const jwtToken = rsa.jwt(payload, this.encode(this.secret), sha256.sha256);
            wsOptions['token'] = jwtToken;
            wsOptions['options'] = {
                'headers': {
                    'authorization': 'Bearer ' + jwtToken,
                },
            };
            this.options['ws'] = wsOptions;
        }
        const url = this.urls['api']['ws']['privateV2'];
        const client = this.client(url);
        return client;
    }
    /**
     * @method
     * @name bithumb#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%A3%BC%EB%AC%B8-%EB%B0%8F-%EC%B2%B4%EA%B2%B0-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.codes] market codes to filter orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws']['privateV2'];
        let messageHash = 'myOrder';
        const codes = this.safeList(params, 'codes', []);
        const request = [
            { 'ticket': 'ccxt' },
            { 'type': messageHash, 'codes': codes },
        ];
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrders(client, message) {
        //
        //    {
        //        "type": "myOrder",
        //        "code": "KRW-BTC",
        //        "uuid": "C0101000000001818113",
        //        "ask_bid": "BID",
        //        "order_type": "limit",
        //        "state": "trade",
        //        "trade_uuid": "C0101000000001744207",
        //        "price": 1927000,
        //        "volume": 0.4697,
        //        "remaining_volume": 0.0803,
        //        "executed_volume": 0.4697,
        //        "trades_count": 1,
        //        "reserved_fee": 0,
        //        "remaining_fee": 0,
        //        "paid_fee": 0,
        //        "executed_funds": 905111.9000,
        //        "trade_timestamp": 1727052318148,
        //        "order_timestamp": 1727052318074,
        //        "timestamp": 1727052318369,
        //        "stream_type": "REALTIME"
        //    }
        //
        const messageHash = 'myOrder';
        const parsed = this.parseWsOrder(message);
        const symbol = this.safeString(parsed, 'symbol');
        // const orderId = this.safeString (parsed, 'id');
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const cachedOrders = this.orders;
        cachedOrders.append(parsed);
        client.resolve(cachedOrders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(cachedOrders, symbolSpecificMessageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        //    {
        //        "type": "myOrder",
        //        "code": "KRW-BTC",
        //        "uuid": "C0101000000001818113",
        //        "ask_bid": "BID",
        //        "order_type": "limit",
        //        "state": "trade",
        //        "trade_uuid": "C0101000000001744207",
        //        "price": 1927000,
        //        "volume": 0.4697,
        //        "remaining_volume": 0.0803,
        //        "executed_volume": 0.4697,
        //        "trades_count": 1,
        //        "reserved_fee": 0,
        //        "remaining_fee": 0,
        //        "paid_fee": 0,
        //        "executed_funds": 905111.9000,
        //        "trade_timestamp": 1727052318148,
        //        "order_timestamp": 1727052318074,
        //        "timestamp": 1727052318369,
        //        "stream_type": "REALTIME"
        //    }
        //
        const marketId = this.safeString(order, 'code');
        const symbol = this.safeSymbol(marketId, market, '-');
        const timestamp = this.safeInteger(order, 'order_timestamp');
        const sideId = this.safeString(order, 'ask_bid');
        const side = (sideId === 'BID') ? ('buy') : ('sell');
        const typeId = this.safeString(order, 'order_type');
        let type = undefined;
        if (typeId === 'limit') {
            type = 'limit';
        }
        else if (typeId === 'price') {
            type = 'market';
        }
        else if (typeId === 'market') {
            type = 'market';
        }
        const stateId = this.safeString(order, 'state');
        let status = undefined;
        if (stateId === 'wait') {
            status = 'open';
        }
        else if (stateId === 'trade') {
            status = 'open';
        }
        else if (stateId === 'done') {
            status = 'closed';
        }
        else if (stateId === 'cancel') {
            status = 'canceled';
        }
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'volume');
        const remaining = this.safeString(order, 'remaining_volume');
        const filled = this.safeString(order, 'executed_volume');
        const cost = this.safeString(order, 'executed_funds');
        const feeCost = this.safeString(order, 'paid_fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const marketForFee = this.safeMarket(marketId, market);
            const feeCurrency = this.safeString(marketForFee, 'quote');
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'uuid'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'trade_timestamp'),
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    handleMessage(client, message) {
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        const topic = this.safeString(message, 'type');
        if (topic !== undefined) {
            const methods = {
                'ticker': this.handleTicker,
                'orderbookdepth': this.handleOrderBook,
                'transaction': this.handleTrades,
                'myAsset': this.handleBalance,
                'myOrder': this.handleOrders,
            };
            const method = this.safeValue(methods, topic);
            if (method !== undefined) {
                method.call(this, client, message);
            }
        }
    }
}

exports["default"] = bithumb;
