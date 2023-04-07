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
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'ws': {
                    'public': 'wss://stream.bitopro.com:9443/ws/v1/pub',
                    'private': 'wss://stream.bitopro.com:9443/ws/v1/pub/auth',
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
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
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
            endPart = market['id'] + ':' + limit;
        }
        const orderbook = await this.watchPublic('order-books', messageHash, endPart);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         event: 'ORDER_BOOK',
        //         timestamp: 1650121915308,
        //         datetime: '2022-04-16T15:11:55.308Z',
        //         pair: 'BTC_TWD',
        //         limit: 5,
        //         scale: 0,
        //         bids: [
        //             { price: '1188178', amount: '0.0425', count: 1, total: '0.0425' },
        //         ],
        //         asks: [
        //             {
        //                 price: '1190740',
        //                 amount: '0.40943964',
        //                 count: 1,
        //                 total: '0.40943964'
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
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
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
        //         event: 'TRADE',
        //         timestamp: 1650116346665,
        //         datetime: '2022-04-16T13:39:06.665Z',
        //         pair: 'BTC_TWD',
        //         data: [
        //             {
        //                 event: '',
        //                 datetime: '',
        //                 pair: '',
        //                 timestamp: 1650116227,
        //                 price: '1189429',
        //                 amount: '0.0153127',
        //                 isBuyer: true
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
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitopro#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'TICKER' + ':' + symbol;
        return await this.watchPublic('tickers', messageHash, market['id']);
    }
    handleTicker(client, message) {
        //
        //     {
        //         event: 'TICKER',
        //         timestamp: 1650119165710,
        //         datetime: '2022-04-16T14:26:05.710Z',
        //         pair: 'BTC_TWD',
        //         lastPrice: '1189110',
        //         lastPriceUSD: '40919.1328',
        //         lastPriceTWD: '1189110',
        //         isBuyer: true,
        //         priceChange24hr: '1.23',
        //         volume24hr: '7.2090',
        //         volume24hrUSD: '294985.5375',
        //         volume24hrTWD: '8572279',
        //         high24hr: '1193656',
        //         low24hr: '1179321'
        //     }
        //
        const marketId = this.safeString(message, 'pair');
        const market = this.safeMarket(marketId, undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString(message, 'event');
        const messageHash = event + ':' + symbol;
        const result = this.parseTicker(message);
        const timestamp = this.safeInteger(message, 'timestamp');
        const datetime = this.safeString(message, 'datetime');
        result['timestamp'] = timestamp;
        result['datetime'] = datetime;
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
        const signature = this.hmac(payload, this.encode(this.secret), sha512.sha384);
        const defaultOptions = {
            'ws': {
                'options': {
                    'headers': {},
                },
            },
        };
        this.options = this.extend(defaultOptions, this.options);
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
    async watchBalance(params = {}) {
        /**
         * @method
         * @name bitopro#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
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
        //         event: 'ACCOUNT_BALANCE',
        //         timestamp: 1650450505715,
        //         datetime: '2022-04-20T10:28:25.715Z',
        //         data: {
        //           ADA: {
        //             currency: 'ADA',
        //             amount: '0',
        //             available: '0',
        //             stake: '0',
        //             tradable: true
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
        };
        const event = this.safeString(message, 'event');
        const method = this.safeValue(methods, event);
        if (method === undefined) {
            return message;
        }
        else {
            return method.call(this, client, message);
        }
    }
}

module.exports = bitopro;
