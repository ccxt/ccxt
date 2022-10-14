'use strict';

//  ---------------------------------------------------------------------------

const wavesexchangeRest = require ('../wavesexchange');
const { NotSupported, ExchangeError } = require ('../base/errors');
const Precise = require ('../base/Precise');
const { ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class wavesexchange extends wavesexchangeRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': false,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'test': {
                    'ws': ' wss://matcher-testnet.waves.exchange/ws/v0',
                },
                'api': {
                    'ws': 'wss://matcher.waves.exchange/ws/v0',
                },
            },
            'options': {
                'balanceLimit': 1000,
                'ordersLimit': 1000,
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async pong (client, message) {
        //
        //     {
        //         T: 'pp',
        //         _: 1655785850615
        //     }
        //
        await client.send (message);
    }

    handlePing (client, message) {
        this.spawn (this.pong, client, message);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name wavesexchange#watchBalance
         * @see https://docs.waves.exchange/en/waves-matcher/matcher-websocket-api-common-streams#incoming-data-2
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the wavesexchange api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        this.checkRequiredKeys ();
        await this.signIn ();
        const address = await this.getWavesAddress ();
        const messageHash = 'balance:' + address;
        const url = this.urls['api']['ws'];
        const accessToken = this.safeString (this.options, 'accessToken');
        const subscribe = {
            'T': 'aus',
            'S': address,
            't': 'jwt',
            'j': accessToken,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.waves.exchange/en/waves-matcher/matcher-websocket-api-common-streams#order-book-updates
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the wavesexchange api endpoint
         * @param {string} params.depth orderbook depth
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const depth = this.safeNumber (params, 'depth', 10);
        params = this.omit (params, 'depth');
        const subscriptionId = market['baseId'] + '-' + market['quoteId'];
        const subscribe = {
            'T': 'obs',
            'S': subscriptionId,
            'd': depth,
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, subscriptionId, request, subscriptionId);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        //  snapshot
        //     {
        //         T: 'ob',
        //         S: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS-34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',
        //         _: 1655781906447,
        //         U: 0,
        //         a: [
        //             ['20591.18', '0.2894092'],
        //             ...
        //         ],
        //         b: [
        //             ['20445.24', '0.28925466'],
        //             ...
        //         ],
        //         t: ['20569.56', '0.06205756', 'sell'],
        //         s: {
        //             m: {
        //                 t: '1.0E-6'
        //             }
        //         }
        //     }
        //
        //  update
        //     {
        //         T: 'ob',
        //         S: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS-34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',
        //         _: 1655781906967,
        //         U: 5,
        //         a: [
        //             ['20591.17', '0.28940934']
        //         ]
        //     }
        //
        const subscriptionId = this.safeString (message, 'S', '');
        const baseQuote = subscriptionId.split ('-');
        const marketId = this.safeString (baseQuote, 0) + '/' + this.safeString (baseQuote, 1);
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeNumber (message, '_');
        const snapshot = this.parseOrderBook (message, symbol, timestamp, 'b', 'a');
        let currentOrderBook = this.safeValue (this.orderbooks, symbol);
        if (currentOrderBook === undefined) {
            currentOrderBook = this.orderBook (snapshot);
            this.orderbooks[symbol] = currentOrderBook;
        } else {
            const asks = this.safeValue (message, 'a', []);
            const bids = this.safeValue (message, 'b', []);
            this.handleDeltas (currentOrderBook['asks'], asks);
            this.handleDeltas (currentOrderBook['bids'], bids);
        }
        currentOrderBook['nonce'] = timestamp;
        currentOrderBook['timestamp'] = timestamp;
        currentOrderBook['datetime'] = this.iso8601 (timestamp);
        this.orderbooks[symbol] = currentOrderBook;
        client.resolve (this.orderbooks[symbol], subscriptionId);
    }

    handleDelta (bookside, delta) {
        const price = this.safeNumber (delta, 0);
        const amount = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.waves.exchange/en/waves-matcher/matcher-websocket-api-common-streams#incoming-data
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the wavesexchange api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        this.checkRequiredKeys ();
        await this.signIn ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
        }
        const address = await this.getWavesAddress ();
        const messageHash = 'someorders:' + address;
        const url = this.urls['api']['ws'];
        const accessToken = this.safeString (this.options, 'accessToken');
        const subscribe = {
            'T': 'aus',
            'S': address,
            't': 'jwt',
            'j': accessToken,
        };
        const request = this.deepExtend (subscribe, params);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, params);
    }

    handleBalanceAndOrders (client, message) {
        //
        //  balance
        //     {
        //         T: 'au',
        //         _: 1655787408864,
        //         U: 1,
        //         S: '3PP8VrxfBGVsFNtmhm1vJJHbrT8ADz3rXMC',
        //         b: {
        //               '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS': [ '0.001', '0.0' ]
        //         }
        //     }
        //
        //     {
        //         "T": "au", // the type of the message
        //         "_": 1585148910776, // unix timestamp of update in milliseconds. This field is only for debugging
        //         "S": "3N93cuB7hDLhpg8n6QpyV7vbWaj5qwBXDF4", // subscription id
        //         "U": 1, // update id
        //         "b": { // balances
        //             "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p": [ // asset id
        //                     "716.356", // tradable
        //                     "56.85" // reserved
        //                 ]
        //                 ...
        //         },
        //         "o": [ // Orders
        //             {
        //                 "i": "89CyqyWeQmqG9QRdoXnYUGrV27eTNjy6HEDy3jBq8zDU", // order id
        //                 "t": 1579697243653, // order timestamp
        //                 "A": "WAVES", // amount asset
        //                 "P": "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p", // price asset
        //                 "S": "sell", // order side: BUY | SELL | buy | sell. Lowercase or uppercase is supported
        //                 "T": "limit", // order type: LIMIT | MARKET | limit | market. Lowercase or uppercase is supported
        //                 "p": "0.84", // order price
        //                 "a": "176.3002", // order amount
        //                 "f": "0.003", // order fee
        //                 "F": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS", // fee asset
        //                 "s": "PartiallyFilled", // order status: ACCEPTED | FILLED | PARTIALLY_FILLED | CANCELLED | Accepted | PartiallyFilled | Filled | Cancelled. Lowercase or uppercase is supported
        //                 "q": "15.01", // the current filled amount, including this and all previous matches
        //                 "Q": "0.001", // the current filled fee, including this and all previous matches
        //                 "r": "0.835", // average filled price among all trades with maximum priceDecimals digits after point
        //                 "E": "12.53335" // total executed price assets.
        //                 "m": [ // information about matching transactions
        //                     {
        //                         "i": "8Ktd2RvW2TiFU1Q8LNtu25uxj6t1r2itk4huG75H2DFD", // match transaction id
        //                         "t": 1579699001581, // transaction timestamp
        //                         "p": "0.8925", // execution price
        //                         "A": "46.044", // executed amount asset quantity
        //                         "P": "41.09427" // executed price asset quantity
        //                     },
        //                     ...
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const subscriptionId = this.safeString (message, 'S');
        const timestamp = this.safeNumber (message, '_');
        const balances = this.safeValue (message, 'b', {});
        if (balances !== undefined) {
            this.balance = {};
        }
        this.balance = this.parseWSBalances (balances);
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        client.resolve (this.balance, 'balance:' + subscriptionId);
        const orders = this.safeValue (message, 'o');
        if (orders !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            for (let i = 0; i < orders.length; i++) {
                const order = this.parseWSOrder (orders[i]);
                this.orders.append (order);
            }
            client.resolve (this.orders, 'someorders:' + subscriptionId);
        }
    }

    parseWSBalances (response) {
        //
        //     {
        //         "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p": [ // asset id
        //                 "716.356", // tradable
        //                 "56.85" // reserved
        //             ]
        //             ...
        //     }
        //
        if (this.balance['info'] === undefined) {
            this.balance['info'] = {};
        }
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = response[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            this.balance[code] = this.parseWSBalance (balance);
            this.balance['info'][code] = balance;
        }
        return this.safeBalance (this.balance);
    }

    parseWSBalance (balance) {
        //
        //     [
        //         "716.356", // tradable
        //         "56.85" // reserved
        //     ]
        //
        const account = this.account ();
        account['free'] = this.safeString (balance, 0);
        account['used'] = this.safeString (balance, 1);
        account['total'] = Precise.stringAdd (account['free'], account['used']);
        return account;
    }

    parseWSOrder (order) {
        //
        //     {
        //         "i": "89CyqyWeQmqG9QRdoXnYUGrV27eTNjy6HEDy3jBq8zDU", // order id
        //         "t": 1579697243653, // order timestamp
        //         "A": "WAVES", // amount asset
        //         "P": "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p", // price asset
        //         "S": "sell", // order side: BUY | SELL | buy | sell. Lowercase or uppercase is supported
        //         "T": "limit", // order type: LIMIT | MARKET | limit | market. Lowercase or uppercase is supported
        //         "p": "0.84", // order price
        //         "a": "176.3002", // order amount
        //         "f": "0.003", // order fee
        //         "F": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS", // fee asset
        //         "s": "PartiallyFilled", // order status: ACCEPTED | FILLED | PARTIALLY_FILLED | CANCELLED | Accepted | PartiallyFilled | Filled | Cancelled. Lowercase or uppercase is supported
        //         "q": "15.01", // the current filled amount, including this and all previous matches
        //         "Q": "0.001", // the current filled fee, including this and all previous matches
        //         "r": "0.835", // average filled price among all trades with maximum priceDecimals digits after point
        //         "E": "12.53335" // total executed price assets.
        //         "m": [ // information about matching transactions
        //             {
        //                 "i": "8Ktd2RvW2TiFU1Q8LNtu25uxj6t1r2itk4huG75H2DFD", // match transaction id
        //                 "t": 1579699001581, // transaction timestamp
        //                 "p": "0.8925", // execution price
        //                 "A": "46.044", // executed amount asset quantity
        //                 "P": "41.09427" // executed price asset quantity
        //             },
        //             ...
        //         ]
        //     }
        //
        const timestamp = this.safeNumber (order, 't');
        const status = this.safeStringLower (order, 's');
        const feeId = this.safeString (order, 'F');
        const feeCode = this.safeCurrencyCode (feeId);
        const quoteId = this.safeString (order, 'A');
        const baseId = this.safeString (order, 'P');
        const marketId = quoteId + '/' + baseId;
        const market = this.safeMarket (marketId, undefined, '/');
        return this.safeOrder ({
            'id': this.safeString (order, 'i'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.parseWSOrderStatus (status),
            'symbol': market['symbol'],
            'type': this.safeStringLower (order, 'T'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'S'),
            'price': this.safeNumber (order, 'p'),
            'stopPrice': undefined,
            'cost': undefined,
            'average': this.safeNumber (order, 'r'),
            'amount': this.safeNumber (order, 'a'),
            'filled': this.safeNumber (order, 'q'),
            'remaining': undefined,
            'trades': this.parseWSTrades (this.safeValue (order, 'm', [])),
            'fee': {
                'cost': this.safeNumber (order, 'f'),
                'currency': feeCode,
            },
            'info': order,
        }, market);
    }

    parseWSOrderStatus (status) {
        const statuses = {
            'accepted': 'pending',
            'partiallyFilled': 'pending',
            'filled': 'ok',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseWSTrades (trades, market = undefined) {
        //
        //    [
        //        {
        //            "i": "8Ktd2RvW2TiFU1Q8LNtu25uxj6t1r2itk4huG75H2DFD", // match transaction id
        //            "t": 1579699001581, // transaction timestamp
        //            "p": "0.8925", // execution price
        //            "A": "46.044", // executed amount asset quantity
        //            "P": "41.09427" // executed price asset quantity
        //        },
        //        ...
        //    ]
        //
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsedTrade = this.parseWSTrade (trade, market);
            result.push (parsedTrade);
        }
        return result;
    }

    parseWSTrade (trade, market = undefined) {
        //
        //    {
        //        "i": "8Ktd2RvW2TiFU1Q8LNtu25uxj6t1r2itk4huG75H2DFD", // match transaction id
        //        "t": 1579699001581, // transaction timestamp
        //        "p": "0.8925", // execution price
        //        "A": "46.044", // executed amount asset quantity
        //        "P": "41.09427" // executed price asset quantity
        //    }
        //
        const timestamp = this.safeNumber (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'id': this.safeString (trade, 'i'),
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': this.safeNumber (trade, 'p'),
            'amount': this.safeNumber (trade, 'A'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleError (client, message) {
        //
        //     {
        //         T: 'e',
        //         _: 1655786419252,
        //         c: 1048577,
        //         m: 'The provided JSON contains invalid fields: /_ ("error.path.missing"). Check the documentation'
        //     }
        //
        const error = this.safeString (message, 'm');
        throw new ExchangeError (this.id + ' ' + error);
    }

    handleInfo (client, message) {
        //
        //     {
        //         T: 'i',
        //         _: 1655815865090,
        //         i: 'c5a1bd81-f6dd-4159-ba5c-077081763132'
        //     }
        //
        return message;
    }

    handleMessage (client, message) {
        //
        //     {
        //         T: 'e',
        //         _: 1655786419252,
        //         c: 1048577,
        //         m: 'The provided JSON contains invalid fields: /_ ("error.path.missing"). Check the documentation'
        //     }
        //
        const messageType = this.safeString (message, 'T');
        if (messageType !== undefined) {
            const handlers = {
                'i': this.handleInfo,
                'e': this.handleError,
                'au': this.handleBalanceAndOrders,
                'ob': this.handleOrderBook,
                'pp': this.handlePing,
            };
            const handler = this.safeValue (handlers, messageType);
            if (handler !== undefined) {
                return handler.call (this, client, message);
            }
        }
        throw new NotSupported (this.id + ' no handler found for this message ' + this.json (message));
    }
};
