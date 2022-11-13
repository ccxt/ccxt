'use strict';

//  ---------------------------------------------------------------------------

const bitrueRest = require ('../bitrue');
const { ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bitrue extends bitrueRest {
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
                'watchOrderBook': false,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'open': 'https://open.bitrue.com',
                    'ws': 'wss://wsapi.bitrue.com',
                },
            },
            'api': {
                'open': {
                    'private': {
                        'post': {
                            'poseidon/api/v1/listenKey': 1,
                        },
                        'put': {
                            'poseidon/api/v1/listenKey/{listenKey}': 1,
                        },
                        'delete': {
                            'poseidon/api/v1/listenKey/{listenKey}': 1,
                        },
                    },
                },
            },
            'options': {
            },
            'listenKey': {
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name bitrue#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#balance-update
         * @param {dict} params extra parameters specific to the bitrue api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.authenticate ();
        const messageHash = 'balances';
        const subscribe = {
            'event': 'sub',
            'params': {
                'channel': 'user_balance_update',
            },
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (this.options['authenticatedURL'], messageHash, request, messageHash);
    }

    handleBalance (client, message) {
        //
        //     {
        //         e: 'BALANCE',
        //         x: 'OutboundAccountPositionTradeEvent',
        //         E: 1657799510175,
        //         I: '302274978401288200',
        //         i: 1657799510175,
        //         B: [{
        //                 a: 'btc',
        //                 F: '0.0006000000000000',
        //                 T: 1657799510000,
        //                 f: '0.0006000000000000',
        //                 t: 0
        //             },
        //             {
        //                 a: 'usdt',
        //                 T: 0,
        //                 L: '0.0000000000000000',
        //                 l: '-11.8705317318000000',
        //                 t: 1657799510000
        //             }
        //         ],
        //         u: 1814396
        //     }
        //
        const balances = this.safeValue (message, 'B', []);
        const timestamp = this.safeNumber (message, 'E');
        this.parseWSBalances (balances);
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        const messageHash = 'balances';
        client.resolve (this.balance, messageHash);
    }

    parseWSBalances (balances) {
        //
        //    [{
        //         a: 'btc',
        //         F: '0.0006000000000000',
        //         T: 1657799510000,
        //         f: '0.0006000000000000',
        //         t: 0
        //     },
        //     {
        //         a: 'usdt',
        //         T: 0,
        //         L: '0.0000000000000000',
        //         l: '-11.8705317318000000',
        //         t: 1657799510000
        //     }]
        //
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'a');
            const currency = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (balance, 'F', 0);
            account['used'] = this.safeNumber (balance, 'L', 0);
            this.balance[currency] = account;
        }
        this.balance = this.safeBalance (this.balance);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#watchOrders
         * @description watches information on user orders
         * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#order-update
         * @param {Array} symbols unified symbols of the market to watch the orders for
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the maximum amount of orders to return
         * @param {dict} params extra parameters specific to the bitrue api endpoint
         * @returns {dict} A dictionary of [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        await this.authenticate ();
        const messageHash = 'orders';
        const message = { 'event': 'sub', 'params': { 'channel': 'user_order_update' }};
        const request = this.deepExtend (message, params);
        const orders = await this.watch (this.options['authenticatedURL'], messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        //    {
        //        e: 'ORDER',
        //        i: 16122802798,
        //        E: 1657882521876,
        //        I: '302623154710888464',
        //        u: 1814396,
        //        s: 'btcusdt',
        //        S: 2,
        //        o: 1,
        //        q: '0.0005',
        //        p: '60000',
        //        X: 0,
        //        x: 1,
        //        z: '0',
        //        n: '0',
        //        N: 'usdt',
        //        O: 1657882521876,
        //        L: '0',
        //        l: '0',
        //        Y: '0'
        //    }
        //
        const parsed = this.parseWSOrder (message);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        const messageHash = 'orders';
        client.resolve (this.orders, messageHash);
    }

    parseWSOrder (order, market = undefined) {
        //
        //    {
        //        e: 'ORDER',
        //        i: 16122802798,
        //        E: 1657882521876,
        //        I: '302623154710888464',
        //        u: 1814396,
        //        s: 'btcusdt',
        //        S: 2,
        //        o: 1,
        //        q: '0.0005',
        //        p: '60000',
        //        X: 0,
        //        x: 1,
        //        z: '0',
        //        n: '0',
        //        N: 'usdt',
        //        O: 1657882521876,
        //        L: '0',
        //        l: '0',
        //        Y: '0'
        //    }
        //
        const timestamp = this.safeInteger (order, 'E');
        const marketId = this.safeStringUpper (order, 's');
        const typeId = this.safeString (order, 'o');
        const sideId = this.safeString (order, 'S');
        const statusId = this.safeString (order, 'X');
        const feeCurrencyId = this.safeString (order, 'N');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'i'),
            'clientOrderId': this.safeString (order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeNumber (order, 'T'),
            'symbol': this.safeSymbol (marketId, market),
            'type': this.parseWSOrderType (typeId),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.parseWSOrderSide (sideId),
            'price': this.safeNumber (order, 'p'),
            'stopPrice': undefined,
            'amount': this.safeNumber (order, 'q'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeNumber (order, 'z'),
            'remaining': undefined,
            'status': this.parseWSOrderStatus (statusId),
            'fee': {
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'cost': this.safeNumber (order, 'n'),
                'rate': undefined,
            },
            'trades': [order],
        }, market);
    }

    parseWSTrade (trade, market = undefined) {
        //
        //    {
        //        e: 'ORDER',
        //        i: 16122802798,
        //        E: 1657882521876,
        //        I: '302623154710888464',
        //        u: 1814396,
        //        s: 'btcusdt',
        //        S: 2,
        //        o: 1,
        //        q: '0.0005',
        //        p: '60000',
        //        X: 0,
        //        x: 1,
        //        z: '0',
        //        n: '0',
        //        N: 'usdt',
        //        O: 1657882521876,
        //        L: '0',
        //        l: '0',
        //        Y: '0'
        //    }
        //
        const tradeId = this.safeString (trade, 't');
        if (tradeId === '-1') {
            return undefined;
        }
        const timestamp = this.safeString (trade, 'I');
        const marketId = this.safeStringUpper (trade, 's');
        const typeId = this.safeString (trade, 'o');
        const sideId = this.safeString (trade, 'S');
        return this.safeTrade ({
            'id': tradeId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, market),
            'order': this.safeString (trade, 'i'),
            'type': this.parseWSOrderType (typeId),
            'side': this.parseWSOrderSide (sideId),
            'takerOrMaker': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    parseWSOrderType (typeId) {
        const types = {
            '1': 'limit',
            '2': 'market',
            '3': 'stopLimit',
        };
        return this.safeString (types, typeId, typeId);
    }

    parseWSOrderSide (sideId) {
        const sides = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (sides, sideId, sideId);
    }

    parseWSOrderStatus (status) {
        const statuses = {
            '0': 'open', // The order has not been accepted by the engine.
            '1': 'open', // The order has been accepted by the engine.
            '2': 'closed', // The order has been completed.
            '3': 'open', // A part of the order has been filled.
            '4': 'canceled', // The order has been canceled.
            '7': 'open', // Stop order placed.
        };
        return this.safeString (statuses, status, status);
    }

    handleMessage (client, message) {
        const event = this.safeString (message, 'e');
        const handlers = {
            'BALANCE': this.handleBalance,
            'ORDER': this.handleOrder,
        };
        const handler = this.safeValue (handlers, event);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
    }

    async authenticate (params = {}) {
        const now = this.milliseconds ();
        const listenKey = this.safeValue (this.options, 'listenKey', {});
        const createdAt = this.safeValue (listenKey, 'createdAt', 0);
        if (now - createdAt > 1000 * 60 * 30) {
            const res = await this.openPrivatePostPoseidonApiV1ListenKey ();
            //
            //     {
            //         "msg": "succ",
            //         "code": 200,
            //         "data": {
            //             "listenKey": "7d1ec51340f499d85bb33b00a96ef680bda28869d5c3374a444c5ca4847d1bf0"
            //         }
            //     }
            //
            const data = this.safeValue (res, 'data', {});
            const key = this.safeString (data, 'listenKey');
            this.options['listenKey'] = {
                'key': key,
                'createdAt': now,
            };
            this.options['authenticatedURL'] = this.urls['api']['ws'] + '/stream?listenKey=' + key;
        }
    }
};
