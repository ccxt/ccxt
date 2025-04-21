'use strict';

var kraken$1 = require('../kraken.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var Precise = require('../base/Precise.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class kraken extends kraken$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'cancelAllOrdersWs': true,
                // 'watchHeartbeat': true,
                // 'watchStatus': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.kraken.com',
                        'private': 'wss://ws-auth.kraken.com',
                        'privateV2': 'wss://ws-auth.kraken.com/v2',
                        'beta': 'wss://beta-ws.kraken.com',
                        'beta-private': 'wss://beta-ws-auth.kraken.com',
                    },
                },
            },
            // 'versions': {
            //     'ws': '0.2.0',
            // },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'ordersLimit': 1000,
                'symbolsByOrderId': {},
                'watchOrderBook': {
                    'checksum': true,
                },
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Event(s) not found': errors.BadRequest,
                    },
                    'broad': {
                        'Already subscribed': errors.BadRequest,
                        'Currency pair not in ISO 4217-A3 format': errors.BadSymbol,
                        'Malformed request': errors.BadRequest,
                        'Pair field must be an array': errors.BadRequest,
                        'Pair field unsupported for this subscription type': errors.BadRequest,
                        'Pair(s) not found': errors.BadSymbol,
                        'Subscription book depth must be an integer': errors.BadRequest,
                        'Subscription depth not supported': errors.BadRequest,
                        'Subscription field must be an object': errors.BadRequest,
                        'Subscription name invalid': errors.BadRequest,
                        'Subscription object unsupported field': errors.BadRequest,
                        'Subscription ohlc interval must be an integer': errors.BadRequest,
                        'Subscription ohlc interval not supported': errors.BadRequest,
                        'Subscription ohlc requires interval': errors.BadRequest,
                        'EAccount:Invalid permissions': errors.PermissionDenied,
                        'EAuth:Account temporary disabled': errors.AccountSuspended,
                        'EAuth:Account unconfirmed': errors.AuthenticationError,
                        'EAuth:Rate limit exceeded': errors.RateLimitExceeded,
                        'EAuth:Too many requests': errors.RateLimitExceeded,
                        'EDatabase: Internal error (to be deprecated)': errors.ExchangeError,
                        'EGeneral:Internal error[:<code>]': errors.ExchangeError,
                        'EGeneral:Invalid arguments': errors.BadRequest,
                        'EOrder:Cannot open opposing position': errors.InvalidOrder,
                        'EOrder:Cannot open position': errors.InvalidOrder,
                        'EOrder:Insufficient funds (insufficient user funds)': errors.InsufficientFunds,
                        'EOrder:Insufficient margin (exchange does not have sufficient funds to allow margin trading)': errors.InsufficientFunds,
                        'EOrder:Invalid price': errors.InvalidOrder,
                        'EOrder:Margin allowance exceeded': errors.InvalidOrder,
                        'EOrder:Margin level too low': errors.InvalidOrder,
                        'EOrder:Margin position size exceeded (client would exceed the maximum position size for this pair)': errors.InvalidOrder,
                        'EOrder:Order minimum not met (volume too low)': errors.InvalidOrder,
                        'EOrder:Orders limit exceeded': errors.InvalidOrder,
                        'EOrder:Positions limit exceeded': errors.InvalidOrder,
                        'EOrder:Rate limit exceeded': errors.RateLimitExceeded,
                        'EOrder:Scheduled orders limit exceeded': errors.InvalidOrder,
                        'EOrder:Unknown position': errors.OrderNotFound,
                        'EOrder:Unknown order': errors.OrderNotFound,
                        'EOrder:Invalid order': errors.InvalidOrder,
                        'EService:Deadline elapsed': errors.ExchangeNotAvailable,
                        'EService:Market in cancel_only mode': errors.NotSupported,
                        'EService:Market in limit_only mode': errors.NotSupported,
                        'EService:Market in post_only mode': errors.NotSupported,
                        'EService:Unavailable': errors.ExchangeNotAvailable,
                        'ETrade:Invalid request': errors.BadRequest,
                    },
                },
            },
        });
    }
    /**
     * @method
     * @name kraken#createOrderWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/addorder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const token = await this.authenticate();
        const market = this.market(symbol);
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId();
        const messageHash = requestId;
        let request = {
            'event': 'addOrder',
            'token': token,
            'reqid': requestId,
            'ordertype': type,
            'type': side,
            'pair': market['wsId'],
            'volume': this.amountToPrecision(symbol, amount),
        };
        [request, params] = this.orderRequest('createOrderWs', symbol, type, request, amount, price, params);
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    handleCreateEditOrder(client, message) {
        //
        //  createOrder
        //    {
        //        "descr": "sell 0.00010000 XBTUSDT @ market",
        //        "event": "addOrderStatus",
        //        "reqid": 1,
        //        "status": "ok",
        //        "txid": "OAVXZH-XIE54-JCYYDG"
        //    }
        //  editOrder
        //    {
        //        "descr": "order edited price = 9000.00000000",
        //        "event": "editOrderStatus",
        //        "originaltxid": "O65KZW-J4AW3-VFS74A",
        //        "reqid": 3,
        //        "status": "ok",
        //        "txid": "OTI672-HJFAO-XOIPPK"
        //    }
        //
        const order = this.parseOrder(message);
        const messageHash = this.safeValue(message, 'reqid');
        client.resolve(order, messageHash);
    }
    /**
     * @method
     * @name kraken#editOrderWs
     * @description edit a trade order
     * @see https://docs.kraken.com/api/docs/websocket-v1/editorder
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrderWs(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const token = await this.authenticate();
        const market = this.market(symbol);
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId();
        const messageHash = requestId;
        let request = {
            'event': 'editOrder',
            'token': token,
            'reqid': requestId,
            'orderid': id,
            'pair': market['wsId'],
        };
        if (amount !== undefined) {
            request['volume'] = this.amountToPrecision(symbol, amount);
        }
        [request, params] = this.orderRequest('editOrderWs', symbol, type, request, amount, price, params);
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    /**
     * @method
     * @name kraken#cancelOrdersWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/cancelorder
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrdersWs(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const token = await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId();
        const messageHash = requestId;
        const request = {
            'event': 'cancelOrder',
            'token': token,
            'reqid': requestId,
            'txid': ids,
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    /**
     * @method
     * @name kraken#cancelOrderWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/cancelorder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const token = await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId();
        const messageHash = requestId;
        const clientOrderId = this.safeValue2(params, 'userref', 'clientOrderId', id);
        params = this.omit(params, ['userref', 'clientOrderId']);
        const request = {
            'event': 'cancelOrder',
            'token': token,
            'reqid': requestId,
            'txid': [clientOrderId],
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    handleCancelOrder(client, message) {
        //
        //  success
        //    {
        //        "event": "cancelOrderStatus",
        //        "status": "ok"
        //        "reqid": 1,
        //    }
        //
        const reqId = this.safeValue(message, 'reqid');
        client.resolve(message, reqId);
    }
    /**
     * @method
     * @name kraken#cancelAllOrdersWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/cancelall
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrdersWs(symbol = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new errors.NotSupported(this.id + ' cancelAllOrdersWs () does not support cancelling orders in a specific market.');
        }
        await this.loadMarkets();
        const token = await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId();
        const messageHash = requestId;
        const request = {
            'event': 'cancelAll',
            'token': token,
            'reqid': requestId,
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    handleCancelAllOrders(client, message) {
        //
        //    {
        //        "count": 2,
        //        "event": "cancelAllStatus",
        //        "status": "ok",
        //        "reqId": 1
        //    }
        //
        const reqId = this.safeValue(message, 'reqid');
        client.resolve(message, reqId);
    }
    handleTicker(client, message, subscription) {
        //
        //     [
        //         0, // channelID
        //         {
        //             "a": [ "5525.40000", 1, "1.000" ], // ask, wholeAskVolume, askVolume
        //             "b": [ "5525.10000", 1, "1.000" ], // bid, wholeBidVolume, bidVolume
        //             "c": [ "5525.10000", "0.00398963" ], // closing price, volume
        //             "h": [ "5783.00000", "5783.00000" ], // high price today, high price 24h ago
        //             "l": [ "5505.00000", "5505.00000" ], // low price today, low price 24h ago
        //             "o": [ "5760.70000", "5763.40000" ], // open price today, open price 24h ago
        //             "p": [ "5631.44067", "5653.78939" ], // vwap today, vwap 24h ago
        //             "t": [ 11493, 16267 ], // number of trades today, 24 hours ago
        //             "v": [ "2634.11501494", "3591.17907851" ], // volume today, volume 24 hours ago
        //         },
        //         "ticker",
        //         "XBT/USD"
        //     ]
        //
        const wsName = message[3];
        const market = this.safeValue(this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        const messageHash = this.getMessageHash('ticker', undefined, symbol);
        const ticker = message[1];
        const vwap = this.safeString(ticker['p'], 0);
        let quoteVolume = undefined;
        const baseVolume = this.safeString(ticker['v'], 0);
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = Precise["default"].stringMul(baseVolume, vwap);
        }
        const last = this.safeString(ticker['c'], 0);
        const result = this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker['h'], 0),
            'low': this.safeString(ticker['l'], 0),
            'bid': this.safeString(ticker['b'], 0),
            'bidVolume': this.safeString(ticker['b'], 2),
            'ask': this.safeString(ticker['a'], 0),
            'askVolume': this.safeString(ticker['a'], 2),
            'vwap': vwap,
            'open': this.safeString(ticker['o'], 0),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        });
        this.tickers[symbol] = result;
        client.resolve(result, messageHash);
    }
    handleTrades(client, message, subscription) {
        //
        //     [
        //         0, // channelID
        //         [ //     price        volume         time             side type misc
        //             [ "5541.20000", "0.15850568", "1534614057.321596", "s", "l", "" ],
        //             [ "6060.00000", "0.02455000", "1534614057.324998", "b", "l", "" ],
        //         ],
        //         "trade",
        //         "XBT/USD"
        //     ]
        //
        const wsName = this.safeString(message, 3);
        const name = this.safeString(message, 2);
        const market = this.safeValue(this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        const messageHash = this.getMessageHash(name, undefined, symbol);
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const trades = this.safeValue(message, 1, []);
        const parsed = this.parseTrades(trades, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append(parsed[i]);
        }
        client.resolve(stored, messageHash);
    }
    handleOHLCV(client, message, subscription) {
        //
        //     [
        //         216, // channelID
        //         [
        //             "1574454214.962096", // Time, seconds since epoch
        //             "1574454240.000000", // End timestamp of the interval
        //             "0.020970", // Open price at midnight UTC
        //             "0.020970", // Intraday high price
        //             "0.020970", // Intraday low price
        //             "0.020970", // Closing price at midnight UTC
        //             "0.020970", // Volume weighted average price
        //             "0.08636138", // Accumulated volume today
        //             1, // Number of trades today
        //         ],
        //         "ohlc-1", // Channel Name of subscription
        //         "ETH/XBT", // Asset pair
        //     ]
        //
        const info = this.safeValue(subscription, 'subscription', {});
        const interval = this.safeInteger(info, 'interval');
        const name = this.safeString(info, 'name');
        const wsName = this.safeString(message, 3);
        const market = this.safeValue(this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe(interval);
        const duration = this.parseTimeframe(timeframe);
        if (timeframe !== undefined) {
            const candle = this.safeValue(message, 1);
            const messageHash = name + ':' + timeframe + ':' + wsName;
            let timestamp = this.safeFloat(candle, 1);
            timestamp -= duration;
            const ts = this.parseToInt(timestamp * 1000);
            const result = [
                ts,
                this.safeFloat(candle, 2),
                this.safeFloat(candle, 3),
                this.safeFloat(candle, 4),
                this.safeFloat(candle, 5),
                this.safeFloat(candle, 7),
            ];
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append(result);
            client.resolve(stored, messageHash);
        }
    }
    requestId() {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum(this.safeInteger(this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }
    async watchPublic(name, symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const wsName = this.safeValue(market['info'], 'wsname');
        const messageHash = name + ':' + wsName;
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId();
        const subscribe = {
            'event': 'subscribe',
            'reqid': requestId,
            'pair': [
                wsName,
            ],
            'subscription': {
                'name': name,
            },
        };
        const request = this.deepExtend(subscribe, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    /**
     * @method
     * @name kraken#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/api/docs/websocket-v1/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const tickers = await this.watchTickers([symbol], params);
        return tickers[symbol];
    }
    /**
     * @method
     * @name kraken#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/api/docs/websocket-v1/ticker
     * @param {string[]} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const ticker = await this.watchMultiHelper('ticker', 'ticker', symbols, undefined, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name kraken#watchBidsAsks
     * @see https://docs.kraken.com/api/docs/websocket-v1/spread
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const ticker = await this.watchMultiHelper('bidask', 'spread', symbols, undefined, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message, subscription) {
        //
        //     [
        //         7208974, // channelID
        //         [
        //             "63758.60000", // bid
        //             "63759.10000", // ask
        //             "1726814731.089778", // timestamp
        //             "0.00057917", // bid_volume
        //             "0.15681688" // ask_volume
        //         ],
        //         "spread",
        //         "XBT/USDT"
        //     ]
        //
        const parsedTicker = this.parseWsBidAsk(message);
        const symbol = parsedTicker['symbol'];
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = this.getMessageHash('bidask', undefined, symbol);
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const data = this.safeList(ticker, 1, []);
        const marketId = this.safeString(ticker, 3);
        market = this.safeValue(this.options['marketsByWsName'], marketId);
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.parseToInt(this.safeInteger(data, 2)) * 1000;
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(data, 1),
            'askVolume': this.safeString(data, 4),
            'bid': this.safeString(data, 0),
            'bidVolume': this.safeString(data, 3),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name kraken#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kraken.com/api/docs/websocket-v1/trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name kraken#watchTradesForSymbols
     * @see https://docs.kraken.com/api/docs/websocket-v1/trade
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        const trades = await this.watchMultiHelper('trade', 'trade', symbols, undefined, params);
        if (this.newUpdates) {
            const first = this.safeList(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name kraken#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/api/docs/websocket-v1/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name kraken#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/api/docs/websocket-v1/book
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        const request = {};
        if (limit !== undefined) {
            if (this.inArray(limit, [10, 25, 100, 500, 1000])) {
                request['subscription'] = {
                    'depth': limit, // default 10, valid options 10, 25, 100, 500, 1000
                };
            }
            else {
                throw new errors.NotSupported(this.id + ' watchOrderBook accepts limit values of 10, 25, 100, 500 and 1000 only');
            }
        }
        const orderbook = await this.watchMultiHelper('orderbook', 'book', symbols, { 'limit': limit }, this.extend(request, params));
        return orderbook.limit();
    }
    /**
     * @method
     * @name kraken#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.kraken.com/api/docs/websocket-v1/ohlc
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'ohlc';
        const market = this.market(symbol);
        symbol = market['symbol'];
        const wsName = this.safeValue(market['info'], 'wsname');
        const messageHash = name + ':' + timeframe + ':' + wsName;
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId();
        const subscribe = {
            'event': 'subscribe',
            'reqid': requestId,
            'pair': [
                wsName,
            ],
            'subscription': {
                'name': name,
                'interval': this.safeValue(this.timeframes, timeframe, timeframe),
            },
        };
        const request = this.deepExtend(subscribe, params);
        const ohlcv = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    async loadMarkets(reload = false, params = {}) {
        const markets = await super.loadMarkets(reload, params);
        let marketsByWsName = this.safeValue(this.options, 'marketsByWsName');
        if ((marketsByWsName === undefined) || reload) {
            marketsByWsName = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                if (market['darkpool']) {
                    const info = this.safeValue(market, 'info', {});
                    const altname = this.safeString(info, 'altname');
                    const wsName = altname.slice(0, 3) + '/' + altname.slice(3);
                    marketsByWsName[wsName] = market;
                }
                else {
                    const info = this.safeValue(market, 'info', {});
                    const wsName = this.safeString(info, 'wsname');
                    marketsByWsName[wsName] = market;
                }
            }
            this.options['marketsByWsName'] = marketsByWsName;
        }
        return markets;
    }
    async watchHeartbeat(params = {}) {
        await this.loadMarkets();
        const event = 'heartbeat';
        const url = this.urls['api']['ws']['public'];
        return await this.watch(url, event);
    }
    handleHeartbeat(client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "event": "heartbeat" }
        //
        const event = this.safeString(message, 'event');
        client.resolve(message, event);
    }
    handleOrderBook(client, message, subscription) {
        //
        // first message (snapshot)
        //
        //     [
        //         1234, // channelID
        //         {
        //             "as": [
        //                 [ "5541.30000", "2.50700000", "1534614248.123678" ],
        //                 [ "5541.80000", "0.33000000", "1534614098.345543" ],
        //                 [ "5542.70000", "0.64700000", "1534614244.654432" ]
        //             ],
        //             "bs": [
        //                 [ "5541.20000", "1.52900000", "1534614248.765567" ],
        //                 [ "5539.90000", "0.30000000", "1534614241.769870" ],
        //                 [ "5539.50000", "5.00000000", "1534613831.243486" ]
        //             ]
        //         },
        //         "book-10",
        //         "XBT/USD"
        //     ]
        //
        // subsequent updates
        //
        //     [
        //         1234,
        //         { // optional
        //             "a": [
        //                 [ "5541.30000", "2.50700000", "1534614248.456738" ],
        //                 [ "5542.50000", "0.40100000", "1534614248.456738" ]
        //             ]
        //         },
        //         { // optional
        //             "b": [
        //                 [ "5541.30000", "0.00000000", "1534614335.345903" ]
        //             ]
        //         },
        //         "book-10",
        //         "XBT/USD"
        //     ]
        //
        const messageLength = message.length;
        const wsName = message[messageLength - 1];
        const bookDepthString = message[messageLength - 2];
        const parts = bookDepthString.split('-');
        const depth = this.safeInteger(parts, 1, 10);
        const market = this.safeValue(this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        let timestamp = undefined;
        const messageHash = this.getMessageHash('orderbook', undefined, symbol);
        // if this is a snapshot
        if ('as' in message[1]) {
            // todo get depth from marketsByWsName
            this.orderbooks[symbol] = this.orderBook({}, depth);
            const orderbook = this.orderbooks[symbol];
            const sides = {
                'as': 'asks',
                'bs': 'bids',
            };
            const keys = Object.keys(sides);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const side = sides[key];
                const bookside = orderbook[side];
                const deltas = this.safeValue(message[1], key, []);
                timestamp = this.customHandleDeltas(bookside, deltas, timestamp);
            }
            orderbook['symbol'] = symbol;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
            client.resolve(orderbook, messageHash);
        }
        else {
            const orderbook = this.orderbooks[symbol];
            // else, if this is an orderbook update
            let a = undefined;
            let b = undefined;
            let c = undefined;
            if (messageLength === 5) {
                a = this.safeValue(message[1], 'a', []);
                b = this.safeValue(message[2], 'b', []);
                c = this.safeInteger(message[1], 'c');
                c = this.safeInteger(message[2], 'c', c);
            }
            else {
                c = this.safeInteger(message[1], 'c');
                if ('a' in message[1]) {
                    a = this.safeValue(message[1], 'a', []);
                }
                else {
                    b = this.safeValue(message[1], 'b', []);
                }
            }
            const storedAsks = orderbook['asks'];
            const storedBids = orderbook['bids'];
            let example = undefined;
            if (a !== undefined) {
                timestamp = this.customHandleDeltas(storedAsks, a, timestamp);
                example = this.safeValue(a, 0);
            }
            if (b !== undefined) {
                timestamp = this.customHandleDeltas(storedBids, b, timestamp);
                example = this.safeValue(b, 0);
            }
            // don't remove this line or I will poop on your face
            orderbook.limit();
            const checksum = this.handleOption('watchOrderBook', 'checksum', true);
            if (checksum) {
                const priceString = this.safeString(example, 0);
                const amountString = this.safeString(example, 1);
                const priceParts = priceString.split('.');
                const amountParts = amountString.split('.');
                const priceLength = priceParts[1].length - 0;
                const amountLength = amountParts[1].length - 0;
                const payloadArray = [];
                if (c !== undefined) {
                    for (let i = 0; i < 10; i++) {
                        const formatted = this.formatNumber(storedAsks[i][0], priceLength) + this.formatNumber(storedAsks[i][1], amountLength);
                        payloadArray.push(formatted);
                    }
                    for (let i = 0; i < 10; i++) {
                        const formatted = this.formatNumber(storedBids[i][0], priceLength) + this.formatNumber(storedBids[i][1], amountLength);
                        payloadArray.push(formatted);
                    }
                }
                const payload = payloadArray.join('');
                const localChecksum = this.crc32(payload, false);
                if (localChecksum !== c) {
                    const error = new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
                    delete client.subscriptions[messageHash];
                    delete this.orderbooks[symbol];
                    client.reject(error, messageHash);
                    return;
                }
            }
            orderbook['symbol'] = symbol;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
            client.resolve(orderbook, messageHash);
        }
    }
    formatNumber(n, length) {
        const stringNumber = this.numberToString(n);
        const parts = stringNumber.split('.');
        const integer = this.safeString(parts, 0);
        const decimals = this.safeString(parts, 1, '');
        const paddedDecimals = decimals.padEnd(length, '0');
        const joined = integer + paddedDecimals;
        let i = 0;
        while (joined[i] === '0') {
            i += 1;
        }
        if (i > 0) {
            return joined.slice(i);
        }
        else {
            return joined;
        }
    }
    customHandleDeltas(bookside, deltas, timestamp = undefined) {
        for (let j = 0; j < deltas.length; j++) {
            const delta = deltas[j];
            const price = this.parseNumber(delta[0]);
            const amount = this.parseNumber(delta[1]);
            const oldTimestamp = timestamp ? timestamp : 0;
            timestamp = Math.max(oldTimestamp, this.parseToInt(parseFloat(delta[2]) * 1000));
            bookside.store(price, amount);
        }
        return timestamp;
    }
    handleSystemStatus(client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         "connectionID": 15527282728335292000,
        //         "event": "systemStatus",
        //         "status": "online", // online|maintenance|(custom status tbd)
        //         "version": "0.2.0"
        //     }
        //
        return message;
    }
    async authenticate(params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        const authenticated = 'authenticated';
        let subscription = this.safeValue(client.subscriptions, authenticated);
        if (subscription === undefined) {
            const response = await this.privatePostGetWebSocketsToken(params);
            //
            //     {
            //         "error":[],
            //         "result":{
            //             "token":"xeAQ\/RCChBYNVh53sTv1yZ5H4wIbwDF20PiHtTF+4UI",
            //             "expires":900
            //         }
            //     }
            //
            subscription = this.safeValue(response, 'result');
            client.subscriptions[authenticated] = subscription;
        }
        return this.safeString(subscription, 'token');
    }
    async watchPrivate(name, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const token = await this.authenticate();
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId();
        const subscribe = {
            'event': 'subscribe',
            'reqid': requestId,
            'subscription': {
                'name': name,
                'token': token,
            },
        };
        const request = this.deepExtend(subscribe, params);
        const result = await this.watch(url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = result.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(result, symbol, since, limit);
    }
    /**
     * @method
     * @name kraken#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.kraken.com/api/docs/websocket-v1/owntrades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.watchPrivate('ownTrades', symbol, since, limit, params);
    }
    handleMyTrades(client, message, subscription = undefined) {
        //
        //     [
        //         [
        //             {
        //                 "TT5UC3-GOIRW-6AZZ6R": {
        //                     "cost": "1493.90107",
        //                     "fee": "3.88415",
        //                     "margin": "0.00000",
        //                     "ordertxid": "OTLAS3-RRHUF-NDWH5A",
        //                     "ordertype": "market",
        //                     "pair": "XBT/USDT",
        //                     "postxid": "TKH2SE-M7IF5-CFI7LT",
        //                     "price": "6851.50005",
        //                     "time": "1586822919.335498",
        //                     "type": "sell",
        //                     "vol": "0.21804000"
        //                 }
        //             },
        //             {
        //                 "TIY6G4-LKLAI-Y3GD4A": {
        //                     "cost": "22.17134",
        //                     "fee": "0.05765",
        //                     "margin": "0.00000",
        //                     "ordertxid": "ODQXS7-MOLK6-ICXKAA",
        //                     "ordertype": "market",
        //                     "pair": "ETH/USD",
        //                     "postxid": "TKH2SE-M7IF5-CFI7LT",
        //                     "price": "169.97999",
        //                     "time": "1586340530.895739",
        //                     "type": "buy",
        //                     "vol": "0.13043500"
        //                 }
        //             },
        //         ],
        //         "ownTrades",
        //         { sequence: 1 }
        //     ]
        //
        const allTrades = this.safeValue(message, 0, []);
        const allTradesLength = allTrades.length;
        if (allTradesLength > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.myTrades = new Cache.ArrayCache(limit);
            }
            const stored = this.myTrades;
            const symbols = {};
            for (let i = 0; i < allTrades.length; i++) {
                const trades = this.safeValue(allTrades, i, {});
                const ids = Object.keys(trades);
                for (let j = 0; j < ids.length; j++) {
                    const id = ids[j];
                    const trade = trades[id];
                    const parsed = this.parseWsTrade(this.extend({ 'id': id }, trade));
                    stored.append(parsed);
                    const symbol = parsed['symbol'];
                    symbols[symbol] = true;
                }
            }
            const name = 'ownTrades';
            client.resolve(this.myTrades, name);
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = name + ':' + keys[i];
                client.resolve(this.myTrades, messageHash);
            }
        }
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "id": "TIMIRG-WUNNE-RRJ6GT", // injected from outside
        //         "ordertxid": "OQRPN2-LRHFY-HIFA7D",
        //         "postxid": "TKH2SE-M7IF5-CFI7LT",
        //         "pair": "USDCUSDT",
        //         "time": 1586340086.457,
        //         "type": "sell",
        //         "ordertype": "market",
        //         "price": "0.99860000",
        //         "cost": "22.16892001",
        //         "fee": "0.04433784",
        //         "vol": "22.20000000",
        //         "margin": "0.00000000",
        //         "misc": ''
        //     }
        //
        //     {
        //         "id": "TIY6G4-LKLAI-Y3GD4A",
        //         "cost": "22.17134",
        //         "fee": "0.05765",
        //         "margin": "0.00000",
        //         "ordertxid": "ODQXS7-MOLK6-ICXKAA",
        //         "ordertype": "market",
        //         "pair": "ETH/USD",
        //         "postxid": "TKH2SE-M7IF5-CFI7LT",
        //         "price": "169.97999",
        //         "time": "1586340530.895739",
        //         "type": "buy",
        //         "vol": "0.13043500"
        //     }
        //
        const wsName = this.safeString(trade, 'pair');
        market = this.safeValue(this.options['marketsByWsName'], wsName, market);
        let symbol = undefined;
        const orderId = this.safeString(trade, 'ordertxid');
        const id = this.safeString2(trade, 'id', 'postxid');
        const timestamp = this.safeTimestamp(trade, 'time');
        const side = this.safeString(trade, 'type');
        const type = this.safeString(trade, 'ordertype');
        const price = this.safeFloat(trade, 'price');
        const amount = this.safeFloat(trade, 'vol');
        let cost = undefined;
        let fee = undefined;
        if ('fee' in trade) {
            let currency = undefined;
            if (market !== undefined) {
                currency = market['quote'];
            }
            fee = {
                'cost': this.safeFloat(trade, 'fee'),
                'currency': currency,
            };
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }
    /**
     * @method
     * @name kraken#watchOrders
     * @see https://docs.kraken.com/api/docs/websocket-v1/openorders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve
     * @param {object} [params] maximum number of orderic to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.watchPrivate('openOrders', symbol, since, limit, params);
    }
    handleOrders(client, message, subscription = undefined) {
        //
        //     [
        //         [
        //             {
        //                 "OGTT3Y-C6I3P-XRI6HX": {
        //                     "cost": "0.00000",
        //                     "descr": {
        //                         "close": "",
        //                         "leverage": "0:1",
        //                         "order": "sell 10.00345345 XBT/EUR @ limit 34.50000 with 0:1 leverage",
        //                         "ordertype": "limit",
        //                         "pair": "XBT/EUR",
        //                         "price": "34.50000",
        //                         "price2": "0.00000",
        //                         "type": "sell"
        //                     },
        //                     "expiretm": "0.000000",
        //                     "fee": "0.00000",
        //                     "limitprice": "34.50000",
        //                     "misc": "",
        //                     "oflags": "fcib",
        //                     "opentm": "0.000000",
        //                     "price": "34.50000",
        //                     "refid": "OKIVMP-5GVZN-Z2D2UA",
        //                     "starttm": "0.000000",
        //                     "status": "open",
        //                     "stopprice": "0.000000",
        //                     "userref": 0,
        //                     "vol": "10.00345345",
        //                     "vol_exec": "0.00000000"
        //                 }
        //             },
        //             {
        //                 "OGTT3Y-C6I3P-XRI6HX": {
        //                     "cost": "0.00000",
        //                     "descr": {
        //                         "close": "",
        //                         "leverage": "0:1",
        //                         "order": "sell 0.00000010 XBT/EUR @ limit 5334.60000 with 0:1 leverage",
        //                         "ordertype": "limit",
        //                         "pair": "XBT/EUR",
        //                         "price": "5334.60000",
        //                         "price2": "0.00000",
        //                         "type": "sell"
        //                     },
        //                     "expiretm": "0.000000",
        //                     "fee": "0.00000",
        //                     "limitprice": "5334.60000",
        //                     "misc": "",
        //                     "oflags": "fcib",
        //                     "opentm": "0.000000",
        //                     "price": "5334.60000",
        //                     "refid": "OKIVMP-5GVZN-Z2D2UA",
        //                     "starttm": "0.000000",
        //                     "status": "open",
        //                     "stopprice": "0.000000",
        //                     "userref": 0,
        //                     "vol": "0.00000010",
        //                     "vol_exec": "0.00000000"
        //                 }
        //             },
        //         ],
        //         "openOrders",
        //         { "sequence": 234 }
        //     ]
        //
        // status-change
        //
        //     [
        //         [
        //             { "OGTT3Y-C6I3P-XRI6HX": { "status": "closed" }},
        //             { "OGTT3Y-C6I3P-XRI6HX": { "status": "closed" }},
        //         ],
        //         "openOrders",
        //         { "sequence": 59342 }
        //     ]
        //
        const allOrders = this.safeValue(message, 0, []);
        const allOrdersLength = allOrders.length;
        if (allOrdersLength > 0) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            const symbols = {};
            for (let i = 0; i < allOrders.length; i++) {
                const orders = this.safeValue(allOrders, i, {});
                const ids = Object.keys(orders);
                for (let j = 0; j < ids.length; j++) {
                    const id = ids[j];
                    const order = orders[id];
                    const parsed = this.parseWsOrder(order);
                    parsed['id'] = id;
                    let symbol = undefined;
                    const symbolsByOrderId = this.safeValue(this.options, 'symbolsByOrderId', {});
                    if (parsed['symbol'] !== undefined) {
                        symbol = parsed['symbol'];
                        symbolsByOrderId[id] = symbol;
                        this.options['symbolsByOrderId'] = symbolsByOrderId;
                    }
                    else {
                        symbol = this.safeString(symbolsByOrderId, id);
                    }
                    const previousOrders = this.safeValue(stored.hashmap, symbol);
                    const previousOrder = this.safeValue(previousOrders, id);
                    let newOrder = parsed;
                    if (previousOrder !== undefined) {
                        const newRawOrder = this.extend(previousOrder['info'], newOrder['info']);
                        newOrder = this.parseWsOrder(newRawOrder);
                        newOrder['id'] = id;
                    }
                    const length = stored.length;
                    if (length === limit && (previousOrder === undefined)) {
                        const first = stored[0];
                        if (first['id'] in symbolsByOrderId) {
                            delete symbolsByOrderId[first['id']];
                        }
                    }
                    stored.append(newOrder);
                    symbols[symbol] = true;
                }
            }
            const name = 'openOrders';
            client.resolve(this.orders, name);
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = name + ':' + keys[i];
                client.resolve(this.orders, messageHash);
            }
        }
    }
    parseWsOrder(order, market = undefined) {
        //
        // createOrder
        //    {
        //        "avg_price": "0.00000",
        //        "cost": "0.00000",
        //        "descr": {
        //            "close": null,
        //            "leverage": null,
        //            "order": "sell 0.01000000 ETH/USDT @ limit 1900.00000",
        //            "ordertype": "limit",
        //            "pair": "ETH/USDT",
        //            "price": "1900.00000",
        //            "price2": "0.00000",
        //            "type": "sell"
        //        },
        //        "expiretm": null,
        //        "fee": "0.00000",
        //        "limitprice": "0.00000",
        //        "misc": '',
        //        "oflags": "fciq",
        //        "opentm": "1667522705.757622",
        //        "refid": null,
        //        "starttm": null,
        //        "status": "open",
        //        "stopprice": "0.00000",
        //        "timeinforce": "GTC",
        //        "userref": 0,
        //        "vol": "0.01000000",
        //        "vol_exec": "0.00000000"
        //    }
        //
        const description = this.safeValue(order, 'descr', {});
        const orderDescription = this.safeString(description, 'order');
        let side = undefined;
        let type = undefined;
        let wsName = undefined;
        let price = undefined;
        let amount = undefined;
        if (orderDescription !== undefined) {
            const parts = orderDescription.split(' ');
            side = this.safeString(parts, 0);
            amount = this.safeString(parts, 1);
            wsName = this.safeString(parts, 2);
            type = this.safeString(parts, 4);
            price = this.safeString(parts, 5);
        }
        side = this.safeString(description, 'type', side);
        type = this.safeString(description, 'ordertype', type);
        wsName = this.safeString(description, 'pair', wsName);
        market = this.safeValue(this.options['marketsByWsName'], wsName, market);
        let symbol = undefined;
        const timestamp = this.safeTimestamp(order, 'opentm');
        amount = this.safeString(order, 'vol', amount);
        const filled = this.safeString(order, 'vol_exec');
        let fee = undefined;
        const cost = this.safeString(order, 'cost');
        price = this.safeString(description, 'price', price);
        if ((price === undefined) || (Precise["default"].stringEq(price, '0.0'))) {
            price = this.safeString(description, 'price2');
        }
        if ((price === undefined) || (Precise["default"].stringEq(price, '0.0'))) {
            price = this.safeString(order, 'price', price);
        }
        const average = this.safeString2(order, 'avg_price', 'price');
        if (market !== undefined) {
            symbol = market['symbol'];
            if ('fee' in order) {
                const flags = order['oflags'];
                const feeCost = this.safeString(order, 'fee');
                fee = {
                    'cost': feeCost,
                    'rate': undefined,
                };
                if (flags.indexOf('fciq') >= 0) {
                    fee['currency'] = market['quote'];
                }
                else if (flags.indexOf('fcib') >= 0) {
                    fee['currency'] = market['base'];
                }
            }
        }
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        let id = this.safeString(order, 'id');
        if (id === undefined) {
            const txid = this.safeValue(order, 'txid');
            id = this.safeString(txid, 0);
        }
        const clientOrderId = this.safeString(order, 'userref');
        const rawTrades = this.safeValue(order, 'trades');
        let trades = undefined;
        if (rawTrades !== undefined) {
            trades = this.parseTrades(rawTrades, market, undefined, undefined, { 'order': id });
        }
        const stopPrice = this.safeNumber(order, 'stopprice');
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': undefined,
            'fee': fee,
            'trades': trades,
        });
    }
    async watchMultiHelper(unifiedName, channelName, symbols = undefined, subscriptionArgs = undefined, params = {}) {
        await this.loadMarkets();
        // symbols are required
        symbols = this.marketSymbols(symbols, undefined, false, true, false);
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            messageHashes.push(this.getMessageHash(unifiedName, undefined, this.symbol(symbols[i])));
        }
        // for WS subscriptions, we can't use .marketIds (symbols), instead a custom is field needed
        const markets = this.marketsForSymbols(symbols);
        const wsMarketIds = [];
        for (let i = 0; i < markets.length; i++) {
            const wsMarketId = this.safeString(markets[i]['info'], 'wsname');
            wsMarketIds.push(wsMarketId);
        }
        const request = {
            'event': 'subscribe',
            'reqid': this.requestId(),
            'pair': wsMarketIds,
            'subscription': {
                'name': channelName,
            },
        };
        const url = this.urls['api']['ws']['public'];
        return await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), messageHashes, subscriptionArgs);
    }
    /**
     * @method
     * @name kraken#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kraken.com/api/docs/websocket-v2/balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        const token = await this.authenticate();
        const messageHash = 'balances';
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId();
        const subscribe = {
            'method': 'subscribe',
            'req_id': requestId,
            'params': {
                'channel': 'balances',
                'token': token,
            },
        };
        const request = this.deepExtend(subscribe, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "channel": "balances",
        //         "data": [
        //             {
        //                 "asset": "BTC",
        //                 "asset_class": "currency",
        //                 "balance": 1.2,
        //                 "wallets": [
        //                     {
        //                         "type": "spot",
        //                         "id": "main",
        //                         "balance": 1.2
        //                     }
        //                 ]
        //             }
        //         ],
        //         "type": "snapshot",
        //         "sequence": 1
        //     }
        //
        const data = this.safeList(message, 'data', []);
        const result = { 'info': message };
        for (let i = 0; i < data.length; i++) {
            const currencyId = this.safeString(data[i], 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const eq = this.safeString(data[i], 'balance');
            account['total'] = eq;
            result[code] = account;
        }
        const type = 'spot';
        const balance = this.safeBalance(result);
        const oldBalance = this.safeValue(this.balance, type, {});
        const newBalance = this.deepExtend(oldBalance, balance);
        this.balance[type] = this.safeBalance(newBalance);
        const channel = this.safeString(message, 'channel');
        client.resolve(this.balance[type], channel);
    }
    getMessageHash(unifiedElementName, subChannelName = undefined, symbol = undefined) {
        // unifiedElementName can be : orderbook, trade, ticker, bidask ...
        // subChannelName only applies to channel that needs specific variation (i.e. depth_50, depth_100..) to be selected
        const withSymbol = symbol !== undefined;
        let messageHash = unifiedElementName;
        if (!withSymbol) {
            messageHash += 's';
        }
        else {
            messageHash += '@' + symbol;
        }
        if (subChannelName !== undefined) {
            messageHash += '#' + subChannelName;
        }
        return messageHash;
    }
    handleSubscriptionStatus(client, message) {
        //
        // public
        //
        //     {
        //         "channelID": 210,
        //         "channelName": "book-10",
        //         "event": "subscriptionStatus",
        //         "reqid": 1574146735269,
        //         "pair": "ETH/XBT",
        //         "status": "subscribed",
        //         "subscription": { depth: 10, name: "book" }
        //     }
        //
        // private
        //
        //     {
        //         "channelName": "openOrders",
        //         "event": "subscriptionStatus",
        //         "reqid": 1,
        //         "status": "subscribed",
        //         "subscription": { maxratecount: 125, name: "openOrders" }
        //     }
        //
        const channelId = this.safeString(message, 'channelID');
        if (channelId !== undefined) {
            client.subscriptions[channelId] = message;
        }
        // const requestId = this.safeString (message, "reqid");
        // if (requestId in client.futures) {
        //     delete client.futures[requestId];
        // }
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "errorMessage": "Currency pair not in ISO 4217-A3 format foobar",
        //         "event": "subscriptionStatus",
        //         "pair": "foobar",
        //         "reqid": 1574146735269,
        //         "status": "error",
        //         "subscription": { name: "ticker" }
        //     }
        //
        const errorMessage = this.safeString(message, 'errorMessage');
        if (errorMessage !== undefined) {
            const requestId = this.safeValue(message, 'reqid');
            if (requestId !== undefined) {
                const broad = this.exceptions['ws']['broad'];
                const broadKey = this.findBroadlyMatchedKey(broad, errorMessage);
                let exception = undefined;
                if (broadKey === undefined) {
                    exception = new errors.ExchangeError(errorMessage); // c# requirement to convert the errorMessage to string
                }
                else {
                    exception = new broad[broadKey](errorMessage);
                }
                client.reject(exception, requestId);
                return false;
            }
        }
        return true;
    }
    handleMessage(client, message) {
        if (Array.isArray(message)) {
            const channelId = this.safeString(message, 0);
            const subscription = this.safeValue(client.subscriptions, channelId, {});
            const info = this.safeValue(subscription, 'subscription', {});
            const messageLength = message.length;
            const channelName = this.safeString(message, messageLength - 2);
            const name = this.safeString(info, 'name');
            const methods = {
                // public
                'book': this.handleOrderBook,
                'ohlc': this.handleOHLCV,
                'ticker': this.handleTicker,
                'spread': this.handleBidAsk,
                'trade': this.handleTrades,
                // private
                'openOrders': this.handleOrders,
                'ownTrades': this.handleMyTrades,
            };
            const method = this.safeValue2(methods, name, channelName);
            if (method !== undefined) {
                method.call(this, client, message, subscription);
            }
        }
        else {
            const channel = this.safeString(message, 'channel');
            if (channel !== undefined) {
                const methods = {
                    'balances': this.handleBalance,
                };
                const method = this.safeValue(methods, channel);
                if (method !== undefined) {
                    method.call(this, client, message);
                }
            }
            if (this.handleErrorMessage(client, message)) {
                const event = this.safeString(message, 'event');
                const methods = {
                    'heartbeat': this.handleHeartbeat,
                    'systemStatus': this.handleSystemStatus,
                    'subscriptionStatus': this.handleSubscriptionStatus,
                    'addOrderStatus': this.handleCreateEditOrder,
                    'editOrderStatus': this.handleCreateEditOrder,
                    'cancelOrderStatus': this.handleCancelOrder,
                    'cancelAllStatus': this.handleCancelAllOrders,
                };
                const method = this.safeValue(methods, event);
                if (method !== undefined) {
                    method.call(this, client, message);
                }
            }
        }
    }
}

module.exports = kraken;
