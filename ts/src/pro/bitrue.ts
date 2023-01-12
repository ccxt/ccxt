'use strict';

//  ---------------------------------------------------------------------------

const bitrueRest = require ('../bitrue');
const { ArrayCacheBySymbolById } = require ('./base/Cache');
const { ArgumentsRequired } = require ('../base/errors');

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
                    'ws': {
                        'public': 'wss://ws.bitrue.com/market/ws',
                        'private': 'wss://wsapi.bitrue.com',
                    },
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
                'listenKeyRefreshRate': 1800000, // 30 mins
                'ws': {
                    'gunzip': true,
                },
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
        const url = await this.authenticate ();
        const messageHash = 'balance';
        const message = {
            'event': 'sub',
            'params': {
                'channel': 'user_balance_update',
            },
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash);
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
        //     {
        //      e: 'BALANCE',
        //      x: 'OutboundAccountPositionOrderEvent',
        //      E: 1670051332478,
        //      I: '353662845694083072',
        //      i: 1670051332478,
        //      B: [
        //        {
        //          a: 'eth',
        //          F: '0.0400000000000000',
        //          T: 1670051332000,
        //          f: '-0.0100000000000000',
        //          L: '0.0100000000000000',
        //          l: '0.0100000000000000',
        //          t: 1670051332000
        //        }
        //      ],
        //      u: 2285311
        //    }
        //
        const balances = this.safeValue (message, 'B', []);
        this.parseWSBalances (balances);
        const messageHash = 'balance';
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
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free = this.safeString (balance, 'F');
            const used = this.safeString (balance, 'L');
            const balanceUpdateTime = this.safeInteger (balance, 'T', 0);
            const lockBalanceUpdateTime = this.safeInteger (balance, 't', 0);
            const updateFree = balanceUpdateTime !== 0;
            const updateUsed = lockBalanceUpdateTime !== 0;
            if (updateFree || updateUsed) {
                if (updateFree) {
                    account['free'] = free;
                }
                if (updateUsed) {
                    account['used'] = used;
                }
                this.balance[code] = account;
            }
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
        const url = await this.authenticate ();
        const messageHash = 'orders';
        const message = {
            'event': 'sub',
            'params': {
                'channel': 'user_order_update',
            },
        };
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash);
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
        const sideId = this.safeInteger (order, 'S');
        // 1: buy
        // 2: sell
        const side = (sideId === 1) ? 'buy' : 'sell';
        const statusId = this.safeString (order, 'X');
        const feeCurrencyId = this.safeString (order, 'N');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'i'),
            'clientOrderId': this.safeString (order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'T'),
            'symbol': this.safeSymbol (marketId, market),
            'type': this.parseWSOrderType (typeId),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'p'),
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'q'),
            'cost': this.safeString (order, 'Y'),
            'average': undefined,
            'filled': this.safeString (order, 'z'),
            'remaining': undefined,
            'status': this.parseWSOrderStatus (statusId),
            'fee': {
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'cost': this.safeNumber (order, 'n'),
            },
        }, market);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const marketIdLowercase = market['id'].toLowerCase ();
        const channel = 'market_' + marketIdLowercase + '_simple_depth_step0';
        const url = this.urls['api']['ws']['public'];
        const message = {
            'event': 'sub',
            'params': {
                'cb_id': marketIdLowercase,
                'channel': channel,
            },
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "channel": "market_ethbtc_simple_depth_step0",
        //         "ts": 1670056708670,
        //         "tick": {
        //             "buys": [
        //                 [
        //                     "0.075170",
        //                     "67.153"
        //                 ],
        //                 [
        //                     "0.075169",
        //                     "17.195"
        //                 ],
        //                 [
        //                     "0.075166",
        //                     "29.788"
        //                 ],
        //             ]
        //              "asks": [
        //                 [
        //                     "0.075171",
        //                     "0.256"
        //                 ],
        //                 [
        //                     "0.075172",
        //                     "0.160"
        //                 ],
        //             ]
        //         }
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('_');
        const marketId = this.safeStringUpper (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'ts');
        const tick = this.safeValue (message, 'tick', {});
        const orderbook = this.parseOrderBook (tick, symbol, timestamp, 'buys', 'asks');
        this.orderbooks[symbol] = orderbook;
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    parseWSOrderType (typeId) {
        const types = {
            '1': 'limit',
            '2': 'market',
            '3': 'limit',
        };
        return this.safeString (types, typeId, typeId);
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

    handlePing (client, message) {
        this.spawn (this.pong, client, message);
    }

    async pong (client, message) {
        //
        //     {
        //         "ping": 1670057540627
        //     }
        //
        const time = this.safeInteger (message, 'ping');
        const pong = {
            'pong': time,
        };
        await client.send (pong);
    }

    handleMessage (client, message) {
        if ('channel' in message) {
            this.handleOrderBook (client, message);
        } else if ('ping' in message) {
            this.handlePing (client, message);
        } else {
            const event = this.safeString (message, 'e');
            const handlers = {
                'BALANCE': this.handleBalance,
                'ORDER': this.handleOrder,
            };
            const handler = this.safeValue (handlers, event);
            if (handler !== undefined) {
                handler.call (this, client, message);
            }
        }
    }

    async authenticate (params = {}) {
        const listenKey = this.safeValue (this.options, 'listenKey');
        if (listenKey === undefined) {
            let response = undefined;
            try {
                response = await this.openPrivatePostPoseidonApiV1ListenKey (params);
            } catch (error) {
                this.options['listenKey'] = undefined;
                this.options['listenKeyUrl'] = undefined;
                return;
            }
            //
            //     {
            //         "msg": "succ",
            //         "code": 200,
            //         "data": {
            //             "listenKey": "7d1ec51340f499d85bb33b00a96ef680bda28869d5c3374a444c5ca4847d1bf0"
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            const key = this.safeString (data, 'listenKey');
            this.options['listenKey'] = key;
            this.options['listenKeyUrl'] = this.urls['api']['ws']['private'] + '/stream?listenKey=' + key;
            const refreshTimeout = this.safeInteger (this.options, 'listenKeyRefreshRate', 1800000);
            this.delay (refreshTimeout, this.keepAliveListenKey);
        }
        return this.options['listenKeyUrl'];
    }

    async keepAliveListenKey (params = {}) {
        const listenKey = this.safeString (this.options, 'listenKey');
        const request = {
            'listenKey': listenKey,
        };
        try {
            await this.openPrivatePutPoseidonApiV1ListenKeyListenKey (this.extend (request, params));
            //
            // ಠ_ಠ
            //     {
            //         "msg": "succ",
            //         "code": "200"
            //     }
            //
        } catch (error) {
            this.options['listenKey'] = undefined;
            this.options['listenKeyUrl'] = undefined;
            return;
        }
        const refreshTimeout = this.safeInteger (this.options, 'listenKeyRefreshRate', 1800000);
        this.delay (refreshTimeout, this.keepAliveListenKey);
    }
};
