
//  ---------------------------------------------------------------------------

import ascendexRest from '../ascendex.js';
import { AuthenticationError, NetworkError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class ascendex extends ascendexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': false,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ascendex.com:443/api/pro/v2/stream',
                        'private': 'wss://ascendex.com:443/{accountGroup}/api/pro/v2/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api-test.ascendex-sandbox.com:443/api/pro/v2/stream',
                        'private': 'wss://api-test.ascendex-sandbox.com:443/{accountGroup}/api/pro/v2/stream',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'categoriesAccount': {
                    'cash': 'spot',
                    'futures': 'swap',
                    'margin': 'margin',
                },
            },
        });
    }

    async watchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce ();
        const request = {
            'id': id.toString (),
            'op': 'sub',
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPrivate (channel, messageHash, params = {}) {
        await this.loadAccounts ();
        const accountGroup = this.safeString (this.options, 'account-group');
        let url = this.urls['api']['ws']['private'];
        url = this.implodeParams (url, { 'accountGroup': accountGroup });
        const id = this.nonce ();
        const request = {
            'id': id.toString (),
            'op': 'sub',
            'ch': channel,
        };
        const message = this.extend (request, params);
        await this.authenticate (url, params);
        return await this.watch (url, messageHash, message, channel);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        if ((limit === undefined) || (limit > 1440)) {
            limit = 100;
        }
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const channel = 'bar' + ':' + interval + ':' + market['id'];
        params = {
            'ch': channel,
        };
        const ohlcv = await this.watchPublic (channel, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //     "m": "bar",
        //     "s": "ASD/USDT",
        //     "data": {
        //         "i":  "1",
        //         "ts": 1575398940000,
        //         "o":  "0.04993",
        //         "c":  "0.04970",
        //         "h":  "0.04993",
        //         "l":  "0.04970",
        //         "v":  "8052"
        //     }
        // }
        //
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const channel = this.safeString (message, 'm');
        const data = this.safeValue (message, 'data', {});
        const interval = this.safeString (data, 'i');
        const messageHash = channel + ':' + interval + ':' + marketId;
        const timeframe = this.findTimeframe (interval);
        const market = this.market (symbol);
        const parsed = this.parseOHLCV (message, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
        return message;
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'trades' + ':' + market['id'];
        params = this.extend (params, {
            'ch': channel,
        });
        const trades = await this.watchPublic (channel, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     m: 'trades',
        //     symbol: 'BTC/USDT',
        //     data: [
        //       {
        //         p: '40744.28',
        //         q: '0.00150',
        //         ts: 1647514330758,
        //         bm: true,
        //         seqnum: 72057633465800320
        //       }
        //     ]
        // }
        //
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const channel = this.safeString (message, 'm');
        const messageHash = channel + ':' + marketId;
        const market = this.market (symbol);
        let rawData = this.safeValue (message, 'data');
        if (rawData === undefined) {
            rawData = [];
        }
        const trades = this.parseTrades (rawData, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        for (let i = 0; i < trades.length; i++) {
            tradesArray.append (trades[i]);
        }
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const channel = 'depth-realtime' + ':' + market['id'];
        params = this.extend (params, {
            'ch': channel,
        });
        const orderbook = await this.watchPublic (channel, params);
        return orderbook.limit ();
    }

    async watchOrderBookSnapshot (symbol: string, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const action = 'depth-snapshot-realtime';
        const channel = action + ':' + market['id'];
        params = this.extend (params, {
            'action': action,
            'args': {
                'symbol': market['id'],
            },
            'op': 'req',
        });
        const orderbook = await this.watchPublic (channel, params);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message) {
        //
        // {
        //     m: 'depth',
        //     symbol: 'BTC/USDT',
        //     data: {
        //       ts: 1647520500149,
        //       seqnum: 28590487626,
        //       asks: [
        //         [Array], [Array], [Array],
        //         [Array], [Array], [Array],
        //       ],
        //       bids: [
        //         [Array], [Array], [Array],
        //         [Array], [Array], [Array],
        //       ]
        //     }
        //   }
        //
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const channel = this.safeString (message, 'm');
        const messageHash = channel + ':' + symbol;
        const orderbook = this.orderbooks[symbol];
        const data = this.safeValue (message, 'data');
        const snapshot = this.parseOrderBook (data, symbol);
        snapshot['nonce'] = this.safeInteger (data, 'seqnum');
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBook (client: Client, message) {
        //
        //   {
        //       m: 'depth',
        //       symbol: 'BTC/USDT',
        //       data: {
        //         ts: 1647515136144,
        //         seqnum: 28590470736,
        //         asks: [ [Array], [Array] ],
        //         bids: [ [Array], [Array], [Array], [Array], [Array], [Array] ]
        //       }
        //   }
        //
        const channel = this.safeString (message, 'm');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const messageHash = channel + ':' + marketId;
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
        }
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    handleDelta (bookside, delta) {
        //
        // ["40990.47","0.01619"],
        //
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        //
        // {
        //     "m":"depth",
        //     "symbol":"BTC/USDT",
        //     "data":{
        //        "ts":1647527417715,
        //        "seqnum":28590257013,
        //        "asks":[
        //           ["40990.47","0.01619"],
        //           ["41021.21","0"],
        //           ["41031.59","0.06096"]
        //        ],
        //        "bids":[
        //           ["40990.46","0.76114"],
        //           ["40985.18","0"]
        //        ]
        //     }
        //  }
        //
        const data = this.safeValue (message, 'data', {});
        const seqNum = this.safeInteger (data, 'seqnum');
        if (seqNum > orderbook['nonce']) {
            const asks = this.safeValue (data, 'asks', []);
            const bids = this.safeValue (data, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['nonce'] = seqNum;
            const timestamp = this.safeInteger (data, 'ts');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name ascendex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ type, query ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        let channel = undefined;
        let messageHash = undefined;
        if ((type === 'spot') || (type === 'margin')) {
            const accountCategories = this.safeValue (this.options, 'accountCategories', {});
            let accountCategory = this.safeString (accountCategories, type, 'cash'); // cash, margin,
            accountCategory = accountCategory.toUpperCase ();
            channel = 'order:' + accountCategory; // order and balance share the same channel
            messageHash = 'balance:' + type;
        } else {
            channel = 'futures-account-update';
            messageHash = 'balance:swap';
        }
        return await this.watchPrivate (channel, messageHash, query);
    }

    handleBalance (client: Client, message) {
        //
        // cash account
        //
        // {
        //     "m": "balance",
        //     "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //     "ac": "CASH",
        //     "data": {
        //         "a" : "USDT",
        //         "sn": 8159798,
        //         "tb": "600",
        //         "ab": "600"
        //     }
        // }
        //
        // margin account
        //
        // {
        //     "m": "balance",
        //     "accountId": "marOxpKJV83dxTRx0Eyxpa0gxc4Txt0P",
        //     "ac": "MARGIN",
        //     "data": {
        //         "a"  : "USDT",
        //         "sn" : 8159802,
        //         "tb" : "400", // total Balance
        //         "ab" : "400", // available balance
        //         "brw": "0", // borrowws
        //         "int": "0" // interest
        //     }
        // }
        //
        // futures
        // {
        //     "m"     : "futures-account-update",            // message
        //     "e"     : "ExecutionReport",                   // event type
        //     "t"     : 1612508562129,                       // time
        //     "acc"   : "futures-account-id",         // account ID
        //     "at"    : "FUTURES",                           // account type
        //     "sn"    : 23128,                               // sequence number,
        //     "id"    : "r177710001cbU3813942147C5kbFGOan",
        //     "col": [
        //       {
        //         "a": "USDT",               // asset code
        //         "b": "1000000",            // balance
        //         "f": "1"                   // discount factor
        //       }
        //     ],
        //     (...)
        //
        const channel = this.safeString (message, 'm');
        let result = undefined;
        let type = undefined;
        if ((channel === 'order') || (channel === 'futures-order')) {
            const data = this.safeValue (message, 'data');
            const marketId = this.safeString (data, 's');
            const market = this.safeMarket (marketId);
            const baseAccount = this.account ();
            baseAccount['free'] = this.safeString (data, 'bab');
            baseAccount['total'] = this.safeString (data, 'btb');
            const quoteAccount = this.account ();
            quoteAccount['free'] = this.safeString (data, 'qab');
            quoteAccount['total'] = this.safeString (data, 'qtb');
            if (market['contract']) {
                type = 'swap';
                result = this.safeValue (this.balance, type, {});
            } else {
                type = market['type'];
                result = this.safeValue (this.balance, type, {});
            }
            result[market['base']] = baseAccount;
            result[market['quote']] = quoteAccount;
        } else {
            const accountType = this.safeStringLower2 (message, 'ac', 'at');
            const categoriesAccounts = this.safeValue (this.options, 'categoriesAccount');
            type = this.safeString (categoriesAccounts, accountType, 'spot');
            result = this.safeValue (this.balance, type, {});
            const data = this.safeValue (message, 'data');
            let balances = undefined;
            if (data === undefined) {
                balances = this.safeValue (message, 'col');
            } else {
                balances = [ data ];
            }
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const code = this.safeCurrencyCode (this.safeString (balance, 'a'));
                const account = this.account ();
                account['free'] = this.safeString (balance, 'ab');
                account['total'] = this.safeString2 (balance, 'tb', 'b');
                result[code] = account;
            }
        }
        const messageHash = 'balance' + ':' + type;
        client.resolve (this.safeBalance (result), messageHash);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#watchOrders
         * @see https://ascendex.github.io/ascendex-pro-api/#channel-order-and-balance
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        let messageHash = undefined;
        let channel = undefined;
        if (type !== 'spot' && type !== 'margin') {
            channel = 'futures-order';
            messageHash = 'order:FUTURES';
        } else {
            const accountCategories = this.safeValue (this.options, 'accountCategories', {});
            let accountCategory = this.safeString (accountCategories, type, 'cash'); // cash, margin
            accountCategory = accountCategory.toUpperCase ();
            messageHash = 'order' + ':' + accountCategory;
            channel = messageHash;
        }
        if (symbol !== undefined) {
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.watchPrivate (channel, messageHash, query);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    handleOrder (client: Client, message) {
        //
        // spot order
        // {
        //   m: 'order',
        //   accountId: 'cshF5SlR9ukAXoDOuXbND4dVpBMw9gzH',
        //   ac: 'CASH',
        //   data: {
        //     sn: 19399016185,
        //     orderId: 'r17f9d7983faU7223046196CMlrj3bfC',
        //     s: 'LTC/USDT',
        //     ot: 'Limit',
        //     t: 1647614461160,
        //     p: '50',
        //     q: '0.1',
        //     sd: 'Buy',
        //     st: 'New',
        //     ap: '0',
        //     cfq: '0',
        //     sp: '',
        //     err: '',
        //     btb: '0',
        //     bab: '0',
        //     qtb: '8',
        //     qab: '2.995',
        //     cf: '0',
        //     fa: 'USDT',
        //     ei: 'NULL_VAL'
        //   }
        // }
        //
        //  futures order
        // {
        //     m: 'futures-order',
        //     sn: 19399927636,
        //     e: 'ExecutionReport',
        //     a: 'futF5SlR9ukAXoDOuXbND4dVpBMw9gzH', // account id
        //     ac: 'FUTURES',
        //     t: 1647622515434, // last execution time
        //      (...)
        // }
        //
        const accountType = this.safeString (message, 'ac');
        const messageHash = 'order:' + accountType;
        const data = this.safeValue (message, 'data', message);
        const order = this.parseWsOrder (data);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        const symbolMessageHash = messageHash + ':' + order['symbol'];
        client.resolve (orders, symbolMessageHash);
        client.resolve (orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        // spot order
        //    {
        //          sn: 19399016185, //sequence number
        //          orderId: 'r17f9d7983faU7223046196CMlrj3bfC',
        //          s: 'LTC/USDT',
        //          ot: 'Limit', // order type
        //          t: 1647614461160, // last execution timestamp
        //          p: '50', // price
        //          q: '0.1', // quantity
        //          sd: 'Buy', // side
        //          st: 'New', // status
        //          ap: '0', // average fill price
        //          cfq: '0', // cumulated fill quantity
        //          sp: '', // stop price
        //          err: '',
        //          btb: '0', // base asset total balance
        //          bab: '0', // base asset available balance
        //          qtb: '8', // quote asset total balance
        //          qab: '2.995', // quote asset available balance
        //          cf: '0', // cumulated commission
        //          fa: 'USDT', // fee asset
        //          ei: 'NULL_VAL'
        //        }
        //
        //  futures order
        // {
        //     m: 'futures-order',
        //     sn: 19399927636,
        //     e: 'ExecutionReport',
        //     a: 'futF5SlR9ukAXoDOuXbND4dVpBMw9gzH', // account id
        //     ac: 'FUTURES',
        //     t: 1647622515434, // last execution time
        //     ct: 1647622515413, // order creation time
        //     orderId: 'r17f9df469b1U7223046196Okf5Kbmd',
        //     sd: 'Buy', // side
        //     ot: 'Limit', // order type
        //     ei: 'NULL_VAL',
        //     q: '1', // quantity
        //     p: '50', //price
        //     sp: '0', // stopPrice
        //     spb: '',  // stopTrigger
        //     s: 'LTC-PERP', // symbol
        //     st: 'New', // state
        //     err: '',
        //     lp: '0', // last filled price
        //     lq: '0', // last filled quantity (base asset)
        //     ap: '0',  // average filled price
        //     cfq: '0', // cummulative filled quantity (base asset)
        //     f: '0', // commission fee of the current execution
        //     cf: '0', // cumulative commission fee
        //     fa: 'USDT', // fee asset
        //     psl: '0',
        //     pslt: 'market',
        //     ptp: '0',
        //     ptpt: 'market'
        //   }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'st'));
        const marketId = this.safeString (order, 's');
        const timestamp = this.safeInteger (order, 't');
        const symbol = this.safeSymbol (marketId, market, '/');
        const lastTradeTimestamp = this.safeInteger (order, 't');
        const price = this.safeString (order, 'p');
        const amount = this.safeString (order, 'q');
        const average = this.safeString (order, 'ap');
        const filled = this.safeString (order, 'cfq');
        const id = this.safeString (order, 'orderId');
        const type = this.safeStringLower (order, 'ot');
        const side = this.safeStringLower (order, 'sd');
        const feeCost = this.safeNumber (order, 'cf');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'fa');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const stopPrice = this.parseNumber (this.omitZero (this.safeString (order, 'sp')));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    handleErrorMessage (client: Client, message) {
        //
        // {
        //     m: 'disconnected',
        //     code: 100005,
        //     reason: 'INVALID_WS_REQUEST_DATA',
        //     info: 'Session is disconnected due to missing pong message from the client'
        //   }
        //
        const errorCode = this.safeInteger (message, 'code');
        try {
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue (message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
            return false;
        } catch (e) {
            if (e instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (e);
            }
            return true;
        }
    }

    handleAuthenticate (client: Client, message) {
        //
        //     { m: 'auth', id: '1647605234', code: 0 }
        //
        const messageHash = 'authenticated';
        client.resolve (message, messageHash);
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        //
        //     { m: 'ping', hp: 3 }
        //
        //     { m: 'sub', ch: 'bar:BTC/USDT', code: 0 }
        //
        //     { m: 'sub', id: '1647515701', ch: 'depth:BTC/USDT', code: 0 }
        //
        //     { m: 'connected', type: 'unauth' }
        //
        //     { m: 'auth', id: '1647605234', code: 0 }
        //
        // order or balance sub
        // {
        //     m: 'sub',
        //     id: '1647605952',
        //     ch: 'order:cshF5SlR9ukAXoDOuXbND4dVpBMw9gzH', or futures-order
        //     code: 0
        //   }
        //
        // ohlcv
        //  {
        //     m: 'bar',
        //     s: 'BTC/USDT',
        //     data: {
        //       i: '1',
        //       ts: 1647510060000,
        //       o: '40813.93',
        //       c: '40804.57',
        //       h: '40814.21',
        //       l: '40804.56',
        //       v: '0.01537'
        //     }
        //   }
        //
        // trades
        //
        //    {
        //        m: 'trades',
        //        symbol: 'BTC/USDT',
        //        data: [
        //          {
        //            p: '40762.26',
        //            q: '0.01500',
        //            ts: 1647514306759,
        //            bm: true,
        //            seqnum: 72057633465795180
        //          }
        //        ]
        //    }
        //
        // orderbook deltas
        //
        // {
        //     "m":"depth",
        //     "symbol":"BTC/USDT",
        //     "data":{
        //        "ts":1647527417715,
        //        "seqnum":28590257013,
        //        "asks":[
        //           ["40990.47","0.01619"],
        //           ["41021.21","0"],
        //           ["41031.59","0.06096"]
        //        ],
        //        "bids":[
        //           ["40990.46","0.76114"],
        //           ["40985.18","0"]
        //        ]
        //     }
        //  }
        //
        // orderbook snapshot
        //  {
        //     m: 'depth-snapshot',
        //     symbol: 'BTC/USDT',
        //     data: {
        //       ts: 1647525938513,
        //       seqnum: 28590504772,
        //       asks: [
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //          (...)
        //       ]
        //  }
        //
        // spot order update
        //  {
        //      "m": "order",
        //      "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //      "ac": "CASH",
        //      "data": {
        //          "s":       "BTC/USDT",
        //          "sn":       8159711,
        //          "sd":      "Buy",
        //          "ap":      "0",
        //          "bab":     "2006.5974027",
        //          "btb":     "2006.5974027",
        //          "cf":      "0",
        //          "cfq":     "0",
        //          (...)
        //      }
        //  }
        // future order update
        // {
        //     m: 'futures-order',
        //     sn: 19404258063,
        //     e: 'ExecutionReport',
        //     a: 'futF5SlR9ukAXoDOuXbND4dVpBMw9gzH',
        //     ac: 'FUTURES',
        //     t: 1647681792543,
        //     ct: 1647622515413,
        //     orderId: 'r17f9df469b1U7223046196Okf5KbmdL',
        //         (...)
        //     ptpt: 'None'
        //   }
        //
        // balance update cash
        // {
        //     "m": "balance",
        //     "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //     "ac": "CASH",
        //     "data": {
        //         "a" : "USDT",
        //         "sn": 8159798,
        //         "tb": "600",
        //         "ab": "600"
        //     }
        // }
        //
        // balance update margin
        // {
        //     "m": "balance",
        //     "accountId": "marOxpKJV83dxTRx0Eyxpa0gxc4Txt0P",
        //     "ac": "MARGIN",
        //     "data": {
        //         "a"  : "USDT",
        //         "sn" : 8159802,
        //         "tb" : "400",
        //         "ab" : "400",
        //         "brw": "0",
        //         "int": "0"
        //     }
        // }
        //
        const subject = this.safeString (message, 'm');
        const methods = {
            'ping': this.handlePing,
            'auth': this.handleAuthenticate,
            'sub': this.handleSubscriptionStatus,
            'depth-realtime': this.handleOrderBook,
            'depth-snapshot-realtime': this.handleOrderBookSnapshot,
            'trades': this.handleTrades,
            'bar': this.handleOHLCV,
            'balance': this.handleBalance,
            'futures-account-update': this.handleBalance,
        };
        const method = this.safeValue (methods, subject);
        if (method !== undefined) {
            method.call (this, client, message);
        }
        if ((subject === 'order') || (subject === 'futures-order')) {
            // this.handleOrder (client, message);
            // balance updates may be in the order structure
            // they may also be standalone balance updates related to account transfers
            this.handleOrder (client, message);
            if (subject === 'order') {
                this.handleBalance (client, message);
            }
        }
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     { m: 'sub', ch: 'bar:BTC/USDT', code: 0 }
        //
        //     { m: 'sub', id: '1647515701', ch: 'depth:BTC/USDT', code: 0 }
        //
        const channel = this.safeString (message, 'ch', '');
        if (channel.indexOf ('depth-realtime') > -1) {
            this.handleOrderBookSubscription (client, message);
        }
        return message;
    }

    handleOrderBookSubscription (client: Client, message) {
        const channel = this.safeString (message, 'ch');
        const parts = channel.split (':');
        const marketId = parts[1];
        const symbol = this.safeSymbol (marketId);
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({});
        this.spawn (this.watchOrderBookSnapshot, symbol);
    }

    async pong (client, message) {
        //
        //     { m: 'ping', hp: 3 }
        //
        try {
            await client.send ({ 'op': 'pong', 'hp': this.safeInteger (message, 'hp') });
        } catch (e) {
            const error = new NetworkError (this.id + ' handlePing failed with error ' + this.json (e));
            client.reset (error);
        }
    }

    handlePing (client: Client, message) {
        this.spawn (this.pong, client, message);
    }

    authenticate (url, params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const timestamp = this.milliseconds ().toString ();
            const urlParts = url.split ('/');
            const partsLength = urlParts.length;
            const path = this.safeString (urlParts, partsLength - 1);
            const version = this.safeString (urlParts, partsLength - 2);
            const auth = timestamp + '+' + version + '/' + path;
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (auth), secret, sha256, 'base64');
            const request = {
                'op': 'auth',
                'id': this.nonce ().toString (),
                't': timestamp,
                'key': this.apiKey,
                'sig': signature,
            };
            future = this.watch (url, messageHash, this.extend (request, params));
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
}
