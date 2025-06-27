'use strict';

var bitopro$1 = require('../bitopro.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha512 = require('../static_dependencies/noble-hashes/sha512.js');

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
class bitopro extends bitopro$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
            },
            'urls': {
                'ws': {
                    'public': 'wss://stream.bitopro.com:443/ws/v1/pub',
                    'private': 'wss://stream.bitopro.com:443/ws/v1/pub/auth',
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'login': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'ws': {
                    'options': {
                        // headers is required for the authentication
                        'headers': {},
                    },
                },
            },
        });
    }
    async watchPublic(path, messageHash, marketId) {
        const url = this.urls['ws']['public'] + '/' + path + '/' + marketId;
        return await this.watch(url, messageHash, undefined, messageHash);
    }
    /**
     * @method
     * @name bitopro#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/public/order_book_stream.md
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500) && (limit !== 1000)) {
                throw new errors.ExchangeError(this.id + ' watchOrderBook limit argument must be undefined, 5, 10, 20, 50, 100, 500 or 1000');
            }
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'ORDER_BOOK' + ':' + symbol;
        let endPart = undefined;
        if (limit === undefined) {
            endPart = market['id'];
        }
        else {
            endPart = market['id'] + ':' + this.numberToString(limit);
        }
        const orderbook = await this.watchPublic('order-books', messageHash, endPart);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "event": "ORDER_BOOK",
        //         "timestamp": 1650121915308,
        //         "datetime": "2022-04-16T15:11:55.308Z",
        //         "pair": "BTC_TWD",
        //         "limit": 5,
        //         "scale": 0,
        //         "bids": [
        //             { price: "1188178", amount: '0.0425', count: 1, total: "0.0425" },
        //         ],
        //         "asks": [
        //             {
        //                 "price": "1190740",
        //                 "amount": "0.40943964",
        //                 "count": 1,
        //                 "total": "0.40943964"
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString(message, 'pair');
        const market = this.safeMarket(marketId, undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString(message, 'event');
        const messageHash = event + ':' + symbol;
        let orderbook = this.safeValue(this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook({});
        }
        const timestamp = this.safeInteger(message, 'timestamp');
        const snapshot = this.parseOrderBook(message, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
        orderbook.reset(snapshot);
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name bitopro#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/public/trade_stream.md
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'TRADE' + ':' + symbol;
        const trades = await this.watchPublic('trades', messageHash, market['id']);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrade(client, message) {
        //
        //     {
        //         "event": "TRADE",
        //         "timestamp": 1650116346665,
        //         "datetime": "2022-04-16T13:39:06.665Z",
        //         "pair": "BTC_TWD",
        //         "data": [
        //             {
        //                 "event": '',
        //                 "datetime": '',
        //                 "pair": '',
        //                 "timestamp": 1650116227,
        //                 "price": "1189429",
        //                 "amount": "0.0153127",
        //                 "isBuyer": true
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString(message, 'pair');
        const market = this.safeMarket(marketId, undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString(message, 'event');
        const messageHash = event + ':' + symbol;
        const rawData = this.safeValue(message, 'data', []);
        const trades = this.parseTrades(rawData, market);
        let tradesCache = this.safeValue(this.trades, symbol);
        if (tradesCache === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesCache = new Cache.ArrayCache(limit);
        }
        for (let i = 0; i < trades.length; i++) {
            tradesCache.append(trades[i]);
        }
        this.trades[symbol] = tradesCache;
        client.resolve(tradesCache, messageHash);
    }
    /**
     * @method
     * @name bitopro#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/private/matches_stream.md
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        this.checkRequiredCredentials();
        await this.loadMarkets();
        let messageHash = 'USER_TRADE';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash = messageHash + ':' + market['symbol'];
        }
        const url = this.urls['ws']['private'] + '/' + 'user-trades';
        this.authenticate(url);
        const trades = await this.watch(url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleMyTrade(client, message) {
        //
        //     {
        //         "event": "USER_TRADE",
        //         "timestamp": 1694667358782,
        //         "datetime": "2023-09-14T12:55:58.782Z",
        //         "data": {
        //             "base": "usdt",
        //             "quote": "twd",
        //             "side": "ask",
        //             "price": "32.039",
        //             "volume": "1",
        //             "fee": "6407800",
        //             "feeCurrency": "twd",
        //             "transactionTimestamp": 1694667358,
        //             "eventTimestamp": 1694667358,
        //             "orderID": 390733918,
        //             "orderType": "LIMIT",
        //             "matchID": "bd07673a-94b1-419e-b5ee-d7b723261a5d",
        //             "isMarket": false,
        //             "isMaker": false
        //         }
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const baseId = this.safeString(data, 'base');
        const quoteId = this.safeString(data, 'quote');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = this.symbol(base + '/' + quote);
        const messageHash = this.safeString(message, 'event');
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const trades = this.myTrades;
        const parsed = this.parseWsTrade(data);
        trades.append(parsed);
        client.resolve(trades, messageHash);
        client.resolve(trades, messageHash + ':' + symbol);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "base": "usdt",
        //         "quote": "twd",
        //         "side": "ask",
        //         "price": "32.039",
        //         "volume": "1",
        //         "fee": "6407800",
        //         "feeCurrency": "twd",
        //         "transactionTimestamp": 1694667358,
        //         "eventTimestamp": 1694667358,
        //         "orderID": 390733918,
        //         "orderType": "LIMIT",
        //         "matchID": "bd07673a-94b1-419e-b5ee-d7b723261a5d",
        //         "isMarket": false,
        //         "isMaker": false
        //     }
        //
        const id = this.safeString(trade, 'matchID');
        const orderId = this.safeString(trade, 'orderID');
        const timestamp = this.safeTimestamp(trade, 'transactionTimestamp');
        const baseId = this.safeString(trade, 'base');
        const quoteId = this.safeString(trade, 'quote');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = this.symbol(base + '/' + quote);
        market = this.safeMarket(symbol, market);
        const price = this.safeString(trade, 'price');
        const type = this.safeStringLower(trade, 'orderType');
        let side = this.safeString(trade, 'side');
        if (side !== undefined) {
            if (side === 'ask') {
                side = 'sell';
            }
            else if (side === 'bid') {
                side = 'buy';
            }
        }
        const amount = this.safeString(trade, 'volume');
        let fee = undefined;
        const feeAmount = this.safeString(trade, 'fee');
        const feeSymbol = this.safeCurrencyCode(this.safeString(trade, 'feeCurrency'));
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': feeSymbol,
                'rate': undefined,
            };
        }
        const isMaker = this.safeValue(trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            if (isMaker) {
                takerOrMaker = 'maker';
            }
            else {
                takerOrMaker = 'taker';
            }
        }
        return this.safeTrade({
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'takerOrMaker': takerOrMaker,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name bitopro#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/public/ticker_stream.md
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'TICKER' + ':' + symbol;
        return await this.watchPublic('tickers', messageHash, market['id']);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "event": "TICKER",
        //         "timestamp": 1650119165710,
        //         "datetime": "2022-04-16T14:26:05.710Z",
        //         "pair": "BTC_TWD",
        //         "lastPrice": "1189110",
        //         "lastPriceUSD": "40919.1328",
        //         "lastPriceTWD": "1189110",
        //         "isBuyer": true,
        //         "priceChange24hr": "1.23",
        //         "volume24hr": "7.2090",
        //         "volume24hrUSD": "294985.5375",
        //         "volume24hrTWD": "8572279",
        //         "high24hr": "1193656",
        //         "low24hr": "1179321"
        //     }
        //
        const marketId = this.safeString(message, 'pair');
        // market-ids are lowercase in REST API and uppercase in WS API
        const market = this.safeMarket(marketId.toLowerCase(), undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString(message, 'event');
        const messageHash = event + ':' + symbol;
        const result = this.parseTicker(message, market);
        result['symbol'] = this.safeString(market, 'symbol'); // symbol returned from REST's parseTicker is distorted for WS, so re-set it from market object
        const timestamp = this.safeInteger(message, 'timestamp');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp); // we shouldn't set "datetime" string provided by server, as those values are obviously wrong offset from UTC
        this.tickers[symbol] = result;
        client.resolve(result, messageHash);
    }
    authenticate(url) {
        if ((this.clients !== undefined) && (url in this.clients)) {
            return;
        }
        this.checkRequiredCredentials();
        const nonce = this.milliseconds();
        const rawData = this.json({
            'nonce': nonce,
            'identity': this.login,
        });
        const payload = this.stringToBase64(rawData);
        const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha512.sha384);
        const defaultOptions = {
            'ws': {
                'options': {
                    'headers': {},
                },
            },
        };
        // this.options = this.extend (defaultOptions, this.options);
        this.extendExchangeOptions(defaultOptions);
        const originalHeaders = this.options['ws']['options']['headers'];
        const headers = {
            'X-BITOPRO-API': 'ccxt',
            'X-BITOPRO-APIKEY': this.apiKey,
            'X-BITOPRO-PAYLOAD': payload,
            'X-BITOPRO-SIGNATURE': signature,
        };
        this.options['ws']['options']['headers'] = headers;
        // instantiate client
        this.client(url);
        this.options['ws']['options']['headers'] = originalHeaders;
    }
    /**
     * @method
     * @name bitopro#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/private/user_balance_stream.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const messageHash = 'ACCOUNT_BALANCE';
        const url = this.urls['ws']['private'] + '/' + 'account-balance';
        this.authenticate(url);
        return await this.watch(url, messageHash, undefined, messageHash);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "event": "ACCOUNT_BALANCE",
        //         "timestamp": 1650450505715,
        //         "datetime": "2022-04-20T10:28:25.715Z",
        //         "data": {
        //           "ADA": {
        //             "currency": "ADA",
        //             "amount": "0",
        //             "available": "0",
        //             "stake": "0",
        //             "tradable": true
        //           },
        //         }
        //     }
        //
        const event = this.safeString(message, 'event');
        const data = this.safeValue(message, 'data');
        const timestamp = this.safeInteger(message, 'timestamp');
        const datetime = this.safeString(message, 'datetime');
        const currencies = Object.keys(data);
        const result = {
            'info': data,
            'timestamp': timestamp,
            'datetime': datetime,
        };
        for (let i = 0; i < currencies.length; i++) {
            const currency = this.safeString(currencies, i);
            const balance = this.safeValue(data, currency);
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'available');
            account['total'] = this.safeString(balance, 'amount');
            result[code] = account;
        }
        this.balance = this.safeBalance(result);
        client.resolve(this.balance, event);
    }
    handleMessage(client, message) {
        const methods = {
            'TRADE': this.handleTrade,
            'TICKER': this.handleTicker,
            'ORDER_BOOK': this.handleOrderBook,
            'ACCOUNT_BALANCE': this.handleBalance,
            'USER_TRADE': this.handleMyTrade,
        };
        const event = this.safeString(message, 'event');
        const method = this.safeValue(methods, event);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
}

module.exports = bitopro;
