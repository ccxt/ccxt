'use strict';

var coinone$1 = require('../coinone.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class coinone extends coinone$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTrades': true,
                'watchOHLCV': false,
                'watchTicker': true,
                'watchTickers': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.coinone.co.kr',
                },
            },
            'options': {
                'expiresIn': '',
                'userId': '',
                'wsSessionToken': '',
                'watchOrderBook': {
                    'snapshotDelay': 6,
                    'snapshotMaxRetries': 3,
                },
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'exact': {
                    '4009': errors.AuthenticationError,
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinone#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.coinone.co.kr/reference/public-websocket-orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'request_type': 'SUBSCRIBE',
            'channel': 'ORDERBOOK',
            'topic': {
                'quote_currency': market['quote'],
                'target_currency': market['base'],
            },
        };
        const message = this.extend(request, params);
        const orderbook = await this.watch(url, messageHash, message, messageHash);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "response_type": "DATA",
        //         "channel": "ORDERBOOK",
        //         "data": {
        //             "quote_currency": "KRW",
        //             "target_currency": "BTC",
        //             "timestamp": 1705288918649,
        //             "id": "1705288918649001",
        //             "asks": [
        //                 {
        //                     "price": "58412000",
        //                     "qty": "0.59919807"
        //                 }
        //             ],
        //             "bids": [
        //                 {
        //                     "price": "58292000",
        //                     "qty": "0.1045"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const baseId = this.safeStringUpper(data, 'target_currency');
        const quoteId = this.safeStringUpper(data, 'quote_currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = this.symbol(base + '/' + quote);
        const timestamp = this.safeInteger(data, 'timestamp');
        let orderbook = this.safeValue(this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook();
        }
        else {
            orderbook.reset();
        }
        orderbook['symbol'] = symbol;
        const asks = this.safeValue(data, 'asks', []);
        const bids = this.safeValue(data, 'bids', []);
        this.handleDeltas(orderbook['asks'], asks);
        this.handleDeltas(orderbook['bids'], bids);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        const messageHash = 'orderbook:' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta, 'price', 'qty');
        bookside.storeArray(bidAsk);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name coinone#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.coinone.co.kr/reference/public-websocket-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'request_type': 'SUBSCRIBE',
            'channel': 'TICKER',
            'topic': {
                'quote_currency': market['quote'],
                'target_currency': market['base'],
            },
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "response_type": "DATA",
        //         "channel": "TICKER",
        //         "data": {
        //             "quote_currency": "KRW",
        //             "target_currency": "BTC",
        //             "timestamp": 1705301117198,
        //             "quote_volume": "19521465345.504",
        //             "target_volume": "334.81445168",
        //             "high": "58710000",
        //             "low": "57276000",
        //             "first": "57293000",
        //             "last": "58532000",
        //             "volume_power": "100",
        //             "ask_best_price": "58537000",
        //             "ask_best_qty": "0.1961",
        //             "bid_best_price": "58532000",
        //             "bid_best_qty": "0.00009258",
        //             "id": "1705301117198001",
        //             "yesterday_high": "59140000",
        //             "yesterday_low": "57273000",
        //             "yesterday_first": "58897000",
        //             "yesterday_last": "57301000",
        //             "yesterday_quote_volume": "12967227517.4262",
        //             "yesterday_target_volume": "220.09232233"
        //         }
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const ticker = this.parseWsTicker(data);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve(this.tickers[symbol], messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "timestamp": 1705301117198,
        //         "quote_volume": "19521465345.504",
        //         "target_volume": "334.81445168",
        //         "high": "58710000",
        //         "low": "57276000",
        //         "first": "57293000",
        //         "last": "58532000",
        //         "volume_power": "100",
        //         "ask_best_price": "58537000",
        //         "ask_best_qty": "0.1961",
        //         "bid_best_price": "58532000",
        //         "bid_best_qty": "0.00009258",
        //         "id": "1705301117198001",
        //         "yesterday_high": "59140000",
        //         "yesterday_low": "57273000",
        //         "yesterday_first": "58897000",
        //         "yesterday_last": "57301000",
        //         "yesterday_quote_volume": "12967227517.4262",
        //         "yesterday_target_volume": "220.09232233"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'timestamp');
        const last = this.safeString(ticker, 'last');
        const baseId = this.safeString(ticker, 'target_currency');
        const quoteId = this.safeString(ticker, 'quote_currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = this.symbol(base + '/' + quote);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeNumber(ticker, 'bid_best_price'),
            'bidVolume': this.safeNumber(ticker, 'bid_best_qty'),
            'ask': this.safeNumber(ticker, 'ask_best_price'),
            'askVolume': this.safeNumber(ticker, 'ask_best_qty'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'target_volume'),
            'quoteVolume': this.safeString(ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinone#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.coinone.co.kr/reference/public-websocket-trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'trade:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'request_type': 'SUBSCRIBE',
            'channel': 'TRADE',
            'topic': {
                'quote_currency': market['quote'],
                'target_currency': market['base'],
            },
        };
        const message = this.extend(request, params);
        const trades = await this.watch(url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "response_type": "DATA",
        //         "channel": "TRADE",
        //         "data": {
        //             "quote_currency": "KRW",
        //             "target_currency": "BTC",
        //             "id": "1705303667916001",
        //             "timestamp": 1705303667916,
        //             "price": "58490000",
        //             "qty": "0.0008",
        //             "is_seller_maker": false
        //         }
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const trade = this.parseWsTrade(data);
        const symbol = trade['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        stored.append(trade);
        const messageHash = 'trade:' + symbol;
        client.resolve(stored, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "id": "1705303667916001",
        //         "timestamp": 1705303667916,
        //         "price": "58490000",
        //         "qty": "0.0008",
        //         "is_seller_maker": false
        //     }
        //
        const baseId = this.safeStringUpper(trade, 'target_currency');
        const quoteId = this.safeStringUpper(trade, 'quote_currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote;
        const timestamp = this.safeInteger(trade, 'timestamp');
        market = this.safeMarket(symbol, market);
        const isSellerMaker = this.safeValue(trade, 'is_seller_maker');
        let side = undefined;
        if (isSellerMaker !== undefined) {
            side = isSellerMaker ? 'sell' : 'buy';
        }
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'qty');
        return this.safeTrade({
            'id': this.safeString(trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'order': undefined,
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "response_type": "ERROR",
        //         "error_code": 160012,
        //         "message": "Invalid Topic"
        //     }
        //
        const type = this.safeString(message, 'response_type', '');
        if (type === 'ERROR') {
            return true;
        }
        return false;
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const type = this.safeString(message, 'response_type');
        if (type === 'PONG') {
            this.handlePong(client, message);
            return;
        }
        if (type === 'DATA') {
            const topic = this.safeString(message, 'channel', '');
            const methods = {
                'ORDERBOOK': this.handleOrderBook,
                'TICKER': this.handleTicker,
                'TRADE': this.handleTrades,
            };
            const exacMethod = this.safeValue(methods, topic);
            if (exacMethod !== undefined) {
                exacMethod.call(this, client, message);
                return;
            }
            const keys = Object.keys(methods);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (topic.indexOf(keys[i]) >= 0) {
                    const method = methods[key];
                    method.call(this, client, message);
                    return;
                }
            }
        }
    }
    ping(client) {
        return {
            'request_type': 'PING',
        };
    }
    handlePong(client, message) {
        //
        //     {
        //         "response_type":"PONG"
        //     }
        //
        client.lastPong = this.milliseconds();
        return message;
    }
}

module.exports = coinone;
