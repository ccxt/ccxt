'use strict';

//  ---------------------------------------------------------------------------

const whitebitRest = require ('../whitebit.js');
const Precise = require ('../base/Precise');
const { AuthenticationError, BadRequest, ArgumentsRequired } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class whitebit extends whitebitRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.whitebit.com/ws',
                },
            },
            'options': {
                'timeframes': {
                    '1m': '60',
                    '5m': '300',
                    '15m': '900',
                    '30m': '1800',
                    '1h': '3600',
                    '4h': '14400',
                    '8h': '28800',
                    '1d': '86400',
                    '1w': '604800',
                },
                'watchOrderBook': {
                    'priceInterval': 0, // "0" - no interval, available values - "0.00000001", "0.0000001", "0.000001", "0.00001", "0.0001", "0.001", "0.01", "0.1"
                },
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        '1': BadRequest, // { error: { code: 1, message: 'invalid argument' }, result: null, id: 1656404342 }
                        '2': BadRequest, // { error: { code: 2, message: 'internal error' }, result: null, id: 1656404075 }
                        '4': BadRequest, // { error: { code: 4, message: 'method not found' }, result: null, id: 1656404250 }
                        '6': AuthenticationError, // { error: { code: 6, message: 'require authentication' }, result: null, id: 1656404076 }
                    },
                },
            },
        });
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const interval = this.safeInteger (timeframes, timeframe);
        const marketId = market['id'];
        // currently there is no way of knowing
        // the interval upon getting an update
        // so that can't be part of the message hash, and the user can only subscribe
        // to one timeframe per symbol
        const messageHash = 'candles:' + symbol;
        const reqParams = [ marketId, interval ];
        const method = 'candles_subscribe';
        const ohlcv = await this.watchPublic (messageHash, method, reqParams, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // {
        //     method: 'candles_update',
        //     params: [
        //       [
        //         1655204760,
        //         '22374.15',
        //         '22351.34',
        //         '22374.27',
        //         '22342.52',
        //         '30.213426',
        //         '675499.29718947',
        //         'BTC_USDT'
        //       ]
        //     ],
        //     id: null
        // }
        //
        const params = this.safeValue (message, 'params', []);
        for (let i = 0; i < params.length; i++) {
            const data = params[i];
            const marketId = this.safeString (data, 7);
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const messageHash = 'candles' + ':' + symbol;
            const parsed = this.parseOHLCV (data, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol);
            let stored = this.ohlcvs[symbol];
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol] = stored;
            }
            stored.append (parsed);
            client.resolve (stored, messageHash);
        }
        return message;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 10; // max 100
        }
        const messageHash = 'orderbook' + ':' + market['symbol'];
        const method = 'depth_subscribe';
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const defaultPriceInterval = this.safeString (options, 'priceInterval', '0');
        const priceInterval = this.safeString (params, 'priceInterval', defaultPriceInterval);
        params = this.omit (params, 'priceInterval');
        const reqParams = [
            market['id'],
            limit,
            priceInterval,
            true, // true for allowing multiple subscriptions
        ];
        const orderbook = await this.watchPublic (messageHash, method, reqParams, params);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        // {
        //     "method":"depth_update",
        //     "params":[
        //        true,
        //        {
        //           "asks":[
        //              [ "21252.45","0.01957"],
        //              ["21252.55","0.126205"],
        //              ["21252.66","0.222689"],
        //              ["21252.76","0.185358"],
        //              ["21252.87","0.210077"],
        //              ["21252.98","0.303991"],
        //              ["21253.08","0.327909"],
        //              ["21253.19","0.399007"],
        //              ["21253.3","0.427695"],
        //              ["21253.4","0.492901"]
        //           ],
        //           "bids":[
        //              ["21248.82","0.22"],
        //              ["21248.73","0.000467"],
        //              ["21248.62","0.100864"],
        //              ["21248.51","0.061436"],
        //              ["21248.42","0.091"],
        //              ["21248.41","0.126839"],
        //              ["21248.3","0.063511"],
        //              ["21248.2","0.110547"],
        //              ["21248","0.25257"],
        //              ["21247.7","1.71813"]
        //           ]
        //        },
        //        "BTC_USDT"
        //     ],
        //     "id":null
        //  }
        //
        const params = this.safeValue (message, 'params', []);
        const isSnapshot = this.safeValue (params, 0);
        const marketId = this.safeString (params, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (params, 1);
        let orderbook = undefined;
        if (symbol in this.orderbooks) {
            orderbook = this.orderbooks[symbol];
        } else {
            orderbook = this.orderBook ();
            this.orderbooks[symbol] = orderbook;
        }
        if (isSnapshot) {
            const snapshot = this.parseOrderBook (data, symbol);
            orderbook.reset (snapshot);
        } else {
            const asks = this.safeValue (data, 'asks', []);
            const bids = this.safeValue (data, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
        }
        const messageHash = 'orderbook' + ':' + symbol;
        client.resolve (orderbook, messageHash);
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

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name whitebit#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const method = 'market_subscribe';
        const messageHash = 'ticker:' + symbol;
        // every time we want to subscribe to another market we have to 're-subscribe' sending it all again
        return await this.watchMultipleSubscription (messageHash, method, symbol, false, params);
    }

    handleTicker (client, message) {
        //
        //   {
        //       method: 'market_update',
        //       params: [
        //         'BTC_USDT',
        //         {
        //           close: '22293.86',
        //           deal: '1986990019.96552952',
        //           high: '24360.7',
        //           last: '22293.86',
        //           low: '20851.44',
        //           open: '24076.12',
        //           period: 86400,
        //           volume: '87016.995668'
        //         }
        //       ],
        //       id: null
        //   }
        //
        const tickers = this.safeValue (message, 'params', []);
        const marketId = this.safeString (tickers, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const rawTicker = this.safeValue (tickers, 1, {});
        const messageHash = 'ticker' + ':' + symbol;
        const ticker = this.parseTicker (rawTicker, market);
        this.tickers[symbol] = ticker;
        // watchTicker
        client.resolve (ticker, messageHash);
        // watchTickers
        const messageHashes = Object.keys (client.futures);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            if (messageHash.indexOf ('tickers') >= 0 && messageHash.indexOf (symbol) >= 0) {
                // Example: user calls watchTickers with ['LTC/USDT', 'ETH/USDT']
                // the associated messagehash will be: 'tickers:LTC/USDT:ETH/USDT'
                // since we only have access to a single symbol at a time
                // we have to do a reverse lookup into the tickers hashes
                // and check if the current symbol is a part of one or more
                // tickers hashes and resolve them
                // user might have multiple watchTickers promises
                // watchTickers ( ['LTC/USDT', 'ETH/USDT'] ), watchTickers ( ['ETC/USDT', 'DOGE/USDT'] )
                // and we want to make sure we resolve only the correct ones
                client.resolve (ticker, messageHash);
            }
        }
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades' + ':' + symbol;
        const method = 'trades_subscribe';
        // every time we want to subscribe to another market we have to 're-subscribe' sending it all again
        const trades = await this.watchMultipleSubscription (messageHash, method, symbol, false, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //    {
        //        "method":"trades_update",
        //        "params":[
        //           "BTC_USDT",
        //           [
        //              {
        //                 "id":1900632398,
        //                 "time":1656320231.404343,
        //                 "price":"21443.04",
        //                 "amount":"0.072844",
        //                 "type":"buy"
        //              },
        //              {
        //                 "id":1900632397,
        //                 "time":1656320231.400001,
        //                 "price":"21443.15",
        //                 "amount":"0.060757",
        //                 "type":"buy"
        //              }
        //           ]
        //        ]
        //    }
        //
        const params = this.safeValue (message, 'params', []);
        const marketId = this.safeString (params, 0);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue (params, 1, []);
        const parsedTrades = this.parseTrades (data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append (parsedTrades[j]);
        }
        const messageHash = 'trades:' + market['symbol'];
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#watchMyTrades
         * @description watches trades made by the user
         * @param {str|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'myTrades:' + symbol;
        const method = 'deals_subscribe';
        const trades = await this.watchMultipleSubscription (messageHash, method, symbol, true, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client, message, subscription = undefined) {
        //
        //   {
        //       method: 'deals_update',
        //       params: [
        //         1894994106,
        //         1656151427.729706,
        //         'LTC_USDT',
        //         96624037337,
        //         '56.78',
        //         '0.16717',
        //         '0.0094919126',
        //         ''
        //       ],
        //       id: null
        //   }
        //
        const trade = this.safeValue (message, 'params');
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const stored = this.myTrades;
        const parsed = this.parseWsTrade (trade);
        stored.append (parsed);
        const symbol = parsed['symbol'];
        const messageHash = 'myTrades:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //   [
        //         1894994106, // id
        //         1656151427.729706, // deal time
        //         'LTC_USDT', // symbol
        //         96624037337, // order id
        //         '56.78', // price
        //         '0.16717', // amount
        //         '0.0094919126', // fee
        //         '' // client order id
        //    ]
        //
        const orderId = this.safeString (trade, 3);
        const timestamp = this.safeTimestamp (trade, 1);
        const id = this.safeString (trade, 0);
        const price = this.safeString (trade, 4);
        const amount = this.safeString (trade, 5);
        const marketId = this.safeString (trade, 2);
        market = this.safeMarket (marketId, market);
        let fee = undefined;
        const feeCost = this.safeString (trade, 6);
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orders:' + symbol;
        const method = 'ordersPending_subscribe';
        const trades = await this.watchMultipleSubscription (messageHash, method, symbol, false, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        // {
        //     method: 'ordersPending_update',
        //     params: [
        //       1, // 1 = new, 2 = update 3 = cancel or execute
        //       {
        //         id: 96433622651,
        //         market: 'LTC_USDT',
        //         type: 1,
        //         side: 2,
        //         ctime: 1656092215.39375,
        //         mtime: 1656092215.39375,
        //         price: '25',
        //         amount: '0.202',
        //         taker_fee: '0.001',
        //         maker_fee: '0.001',
        //         left: '0.202',
        //         deal_stock: '0',
        //         deal_money: '0',
        //         deal_fee: '0',
        //         client_order_id: ''
        //       }
        //     ]
        //     id: null
        // }
        //
        const params = this.safeValue (message, 'params', []);
        const data = this.safeValue (params, 1);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const status = this.safeInteger (params, 0);
        const parsed = this.parseWsOrder (data, status);
        stored.append (parsed);
        const symbol = parsed['symbol'];
        const messageHash = 'orders:' + symbol;
        client.resolve (this.orders, messageHash);
    }

    parseWsOrder (order, status, market = undefined) {
        //
        //   {
        //         id: 96433622651,
        //         market: 'LTC_USDT',
        //         type: 1,
        //         side: 2, //1- sell 2-buy
        //         ctime: 1656092215.39375,
        //         mtime: 1656092215.39375,
        //         price: '25',
        //         amount: '0.202',
        //         taker_fee: '0.001',
        //         maker_fee: '0.001',
        //         left: '0.202',
        //         deal_stock: '0',
        //         deal_money: '0',
        //         deal_fee: '0',
        //         activation_price: '40',
        //         activation_condition: 'lte',
        //         client_order_id: ''
        //    }
        //
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        const id = this.safeString (order, 'id');
        const clientOrderId = this.omitZero (this.safeString (order, 'client_order_id'));
        const price = this.safeString (order, 'price');
        const filled = this.safeString (order, 'deal_stock');
        const cost = this.safeString (order, 'deal_money');
        const stopPrice = this.safeString (order, 'activation_price');
        const rawType = this.safeString (order, 'type');
        const type = this.parseWsOrderType (rawType);
        let amount = undefined;
        let remaining = undefined;
        if (type === 'market') {
            amount = this.safeString (order, 'deal_stock');
            remaining = '0';
        } else {
            remaining = this.safeString (order, 'left');
            amount = this.safeString (order, 'amount');
        }
        const timestamp = this.safeTimestamp (order, 'ctime');
        const lastTradeTimestamp = this.safeTimestamp (order, 'mtime');
        const symbol = market['symbol'];
        const rawSide = this.safeInteger (order, 'side');
        const side = (rawSide === 1) ? 'sell' : 'buy';
        const dealFee = this.safeString (order, 'deal_fee');
        let fee = undefined;
        if (dealFee !== undefined) {
            fee = {
                'cost': this.parseNumber (dealFee),
                'currency': market['quote'],
            };
        }
        if ((status === 1) || (status === 2)) {
            status = 'open';
        } else {
            if (Precise.stringEquals (remaining, '0')) {
                status = 'closed';
            } else {
                status = 'canceled';
            }
        }
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
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

    parseWsOrderType (status) {
        const statuses = {
            '1': 'limit',
            '2': 'market',
            '202': 'market',
            '3': 'limit',
            '4': 'market',
            '5': 'limit',
            '6': 'market',
            '8': 'limit',
            '10': 'market',
        };
        return this.safeString (statuses, status, status);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name whitebit#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @param {str|undefined} params.type spot or contract if not provided this.options['defaultType'] is used
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        let messageHash = 'wallet:';
        let method = undefined;
        if (type === 'spot') {
            method = 'balanceSpot_subscribe';
            messageHash += 'spot';
        } else {
            method = 'balanceMargin_subscribe';
            messageHash += 'margin';
        }
        const currencies = Object.keys (this.currencies);
        return await this.watchPrivate (messageHash, method, currencies, params);
    }

    handleBalance (client, message) {
        //
        //   {
        //       "method":"balanceSpot_update",
        //       "params":[
        //          {
        //             "LTC":{
        //                "available":"0.16587",
        //                "freeze":"0"
        //             }
        //          }
        //       ],
        //       "id":null
        //   }
        //
        const method = this.safeString (message, 'method');
        const data = this.safeValue (message, 'params');
        const balanceDict = this.safeValue (data, 0);
        const keys = Object.keys (balanceDict);
        const currencyId = this.safeValue (keys, 0);
        const rawBalance = this.safeValue (balanceDict, currencyId);
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (rawBalance, 'available');
        account['used'] = this.safeString (rawBalance, 'freeze');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        let messageHash = 'wallet:';
        if (method.indexOf ('Spot') >= 0) {
            messageHash += 'spot';
        } else {
            messageHash += 'margin';
        }
        client.resolve (this.balance, messageHash);
    }

    async watchPublic (messageHash, method, reqParams = [], params = {}) {
        const url = this.urls['api']['ws'];
        const id = this.nonce ();
        const request = {
            'id': id,
            'method': method,
            'params': reqParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchMultipleSubscription (messageHash, method, symbol, isNested = false, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const id = this.nonce ();
        const client = this.safeValue (this.clients, url);
        let request = undefined;
        if (client === undefined) {
            const subscription = {};
            const market = this.market (symbol);
            const marketId = market['id'];
            subscription[marketId] = true;
            let marketIds = [ marketId ];
            if (isNested) {
                marketIds = [ marketIds ];
            }
            request = {
                'id': id,
                'method': method,
                'params': marketIds,
            };
            const message = this.extend (request, params);
            return await this.watch (url, messageHash, message, method, subscription);
        } else {
            const subscription = this.safeValue (client.subscriptions, method, {});
            let hasSymbolSubscription = true;
            const market = this.market (symbol);
            const marketId = market['id'];
            const isSubscribed = this.safeValue (subscription, marketId, false);
            if (!isSubscribed) {
                subscription[marketId] = true;
                hasSymbolSubscription = false;
            }
            if (hasSymbolSubscription) {
                // already subscribed to this market(s)
                return await this.watch (url, messageHash, request, method, subscription);
            } else {
                // resubscribe
                let marketIds = Object.keys (subscription);
                if (isNested) {
                    marketIds = [ marketIds ];
                }
                const resubRequest = {
                    'id': id,
                    'method': method,
                    'params': marketIds,
                };
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
                return await this.watch (url, messageHash, resubRequest, method, subscription);
            }
        }
    }

    async watchPrivate (messageHash, method, reqParams = [], params = {}) {
        this.checkRequiredCredentials ();
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const id = this.nonce ();
        const request = {
            'id': id,
            'method': method,
            'params': reqParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const messageHash = 'login';
        const client = this.client (url);
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const authToken = await this.v4PrivatePostProfileWebsocketToken ();
            //
            //   {
            //       websocket_token: '$2y$10$lxCvTXig/XrcTBFY1bdFseCKQmFTDtCpEzHNVnXowGplExFxPJp9y'
            //   }
            //
            const token = this.safeString (authToken, 'websocket_token');
            const id = this.nonce ();
            const request = {
                'id': id,
                'method': 'authorize',
                'params': [
                    token,
                    'public',
                ],
            };
            const subscription = {
                'id': id,
                'method': this.handleAuthenticate,
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, subscription);
        }
        return await future;
    }

    handleAuthenticate (client, message) {
        //
        //     { error: null, result: { status: 'success' }, id: 1656084550 }
        //
        const future = client.futures['authenticated'];
        future.resolve (1);
        return message;
    }

    handleErrorMessage (client, message) {
        //
        //     {
        //         error: { code: 1, message: 'invalid argument' },
        //         result: null,
        //         id: 1656090882
        //     }
        //
        const error = this.safeValue (message, 'error');
        try {
            if (error !== undefined) {
                const code = this.safeString (message, 'code');
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['ws']['exact'], code, feedback);
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                if ('login' in client.subscriptions) {
                    delete client.subscriptions['login'];
                }
                return false;
            }
        }
        return message;
    }

    handleMessage (client, message) {
        //
        // auth
        //    { error: null, result: { status: 'success' }, id: 1656084550 }
        //
        // pong
        //    { error: null, result: 'pong', id: 0 }
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const result = this.safeValue (message, 'result', {});
        if (result !== undefined) {
            if (result === 'pong') {
                this.handlePong (client, message);
                return;
            }
        }
        const id = this.safeInteger (message, 'id');
        if (id !== undefined) {
            this.handleSubscriptionStatus (client, message, id);
            return;
        }
        const methods = {
            'market_update': this.handleTicker,
            'trades_update': this.handleTrades,
            'depth_update': this.handleOrderBook,
            'candles_update': this.handleOHLCV,
            'ordersPending_update': this.handleOrder,
            'ordersExecuted_update': this.handleOrder,
            'balanceSpot_update': this.handleBalance,
            'balanceMargin_update': this.handleBalance,
            'deals_update': this.handleMyTrades,
        };
        const topic = this.safeValue (message, 'method');
        const method = this.safeValue (methods, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleSubscriptionStatus (client, message, id) {
        // not every method stores its subscription
        // as an object so we can't do indeById here
        const subs = client.subscriptions;
        const values = Object.values (subs);
        for (let i = 0; i < values.length; i++) {
            const subscription = values[i];
            if (subscription !== true) {
                const subId = this.safeInteger (subscription, 'id');
                if ((subId !== undefined) && (subId === id)) {
                    const method = this.safeValue (subscription, 'method');
                    if (method !== undefined) {
                        method.call (this, client, message);
                        return;
                    }
                }
            }
        }
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    ping (client) {
        return {
            'id': 0,
            'method': 'ping',
            'params': [],
        };
    }
};
