
//  ---------------------------------------------------------------------------

import bitpandaRest from '../bitpanda.js';
import { NotSupported, ExchangeError } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bitpanda extends bitpandaRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://test.bitpanda.com/ws/api/v2',
                },
                'api': {
                    'ws': 'wss://streams.exchange.bitpanda.com',
                },
            },
            'options': {
                'bp_remaining_quota': 200,
                'timeframes': {
                    '1m': {
                        'unit': 'MINUTES',
                        'period': 1,
                    },
                    '5m': {
                        'unit': 'MINUTES',
                        'period': 5,
                    },
                    '15m': {
                        'unit': 'MINUTES',
                        'period': 15,
                    },
                    '30m': {
                        'unit': 'MINUTES',
                        'period': 30,
                    },
                    '1h': {
                        'unit': 'HOURS',
                        'period': 1,
                    },
                    '4h': {
                        'unit': 'HOURS',
                        'period': 4,
                    },
                    '1d': {
                        'unit': 'DAYS',
                        'period': 1,
                    },
                    '1w': {
                        'unit': 'WEEKS',
                        'period': 1,
                    },
                    '1M': {
                        'unit': 'MONTHS',
                        'period': 1,
                    },
                },
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
         * @name bitpanda#watchBalance
         * @see https://developers.bitpanda.com/exchange/#account-history-channel
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const messageHash = 'balance';
        const subscribeHash = 'ACCOUNT_HISTORY';
        const bpRemainingQuota = this.safeInteger (this.options, 'bp_remaining_quota', 200);
        const subscribe = {
            'type': 'SUBSCRIBE',
            'bp_remaining_quota': bpRemainingQuota,
            'channels': [
                {
                    'name': 'ACCOUNT_HISTORY',
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, subscribeHash, request);
    }

    handleBalanceSnapshot (client, message) {
        //
        // snapshot
        //     {
        //         "account_id": "b355abb8-aaae-4fae-903c-c60ff74723c6",
        //         "type": "BALANCES_SNAPSHOT",
        //         "channel_name": "ACCOUNT_HISTORY",
        //         "time": "2019-04-01T13:39:17.155Z",
        //         "balances": [{
        //                 "account_id": "b355abb8-aaae-4fae-903c-c60ff74723c6",
        //                 "currency_code": "BTC",
        //                 "change": "0.5",
        //                 "available": "10.0",
        //                 "locked": "1.1234567",
        //                 "sequence": 1,
        //                 "time": "2019-04-01T13:39:17.155Z"
        //             },
        //             {
        //                 "account_id": "b355abb8-aaae-4fae-903c-c60ff74723c6",
        //                 "currency_code": "ETH",
        //                 "change": "0.5",
        //                 "available": "10.0",
        //                 "locked": "1.1234567",
        //                 "sequence": 2,
        //                 "time": "2019-04-01T13:39:17.155Z"
        //             }
        //         ]
        //     }
        //
        this.balance = this.parseBalance (message);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bitpanda#watchTicker
         * @see https://developers.bitpanda.com/exchange/#market-ticker-channel
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'MARKET_TICKER';
        const messageHash = 'ticker.' + symbol;
        const request = {
            'type': 'SUBSCRIBE',
            'channels': [
                {
                    'name': 'MARKET_TICKER',
                    'price_points_mode': 'INLINE',
                },
            ],
        };
        return await this.watchMultiple (messageHash, request, subscriptionHash, [ symbol ], params);
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#watchTickers
         * @see https://developers.bitpanda.com/exchange/#market-ticker-channel
         * @description watches price tickers, a statistical calculation with the information for all markets or those specified.
         * @param {string} symbols unified symbols of the markets to fetch the ticker for
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an array of [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            symbols = [];
        }
        const subscriptionHash = 'MARKET_TICKER';
        const messageHash = 'tickers';
        const request = {
            'type': 'SUBSCRIBE',
            'channels': [
                {
                    'name': 'MARKET_TICKER',
                    'price_points_mode': 'INLINE',
                },
            ],
        };
        const tickers = await this.watchMultiple (messageHash, request, subscriptionHash, symbols, params);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         ticker_updates: [{
        //             instrument: 'ETH_BTC',
        //             last_price: '0.053752',
        //             price_change: '0.000623',
        //             price_change_percentage: '1.17',
        //             high: '0.055',
        //             low: '0.052662',
        //             volume: '6.3821593247'
        //         }],
        //         channel_name: 'MARKET_TICKER',
        //         type: 'MARKET_TICKER_UPDATES',
        //         time: '2022-06-23T16:41:00.004162Z'
        //     }
        //
        const tickers = this.safeValue (message, 'ticker_updates', []);
        const datetime = this.safeString (message, 'time');
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 'instrument');
            const symbol = this.safeSymbol (marketId);
            this.tickers[symbol] = this.parseWSTicker (ticker);
            const timestamp = this.parse8601 (datetime);
            this.tickers[symbol]['timestamp'] = timestamp;
            this.tickers[symbol]['datetime'] = this.iso8601 (timestamp);
            client.resolve (this.tickers[symbol], 'ticker.' + symbol);
        }
        client.resolve (this.tickers, 'tickers');
    }

    parseWSTicker (ticker, market = undefined) {
        //
        //     {
        //         instrument: 'ETH_BTC',
        //         last_price: '0.053752',
        //         price_change: '-0.000623',
        //         price_change_percentage: '-1.17',
        //         high: '0.055',
        //         low: '0.052662',
        //         volume: '6.3821593247'
        //     }
        //
        const marketId = this.safeString (ticker, 'instrument');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'price_change'),
            'percentage': this.safeString (ticker, 'price_change_percentage'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#watchMyTrades
         * @see https://developers.bitpanda.com/exchange/#account-history-channel
         * @description get the list of trades associated with the user
         * @param {string} symbol unified symbol of the market to fetch trades for. Use 'any' to watch all trades
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const subscribeHash = 'ACCOUNT_HISTORY';
        const bpRemainingQuota = this.safeInteger (this.options, 'bp_remaining_quota', 200);
        const subscribe = {
            'type': 'SUBSCRIBE',
            'bp_remaining_quota': bpRemainingQuota,
            'channels': [
                {
                    'name': 'ACCOUNT_HISTORY',
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        let trades = await this.watch (url, messageHash, request, subscribeHash, request);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        trades = this.filterBySymbolSinceLimit (trades, symbol, since, limit);
        const numTrades = trades.length;
        if (numTrades === 0) {
            return await this.watchMyTrades (symbol, since, limit, params);
        }
        return trades;
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#watchOrderBook
         * @see https://developers.bitpanda.com/exchange/#market-ticker-channel
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'book:' + symbol;
        const subscriptionHash = 'ORDER_BOOK';
        let depth = 0;
        if (limit !== undefined) {
            depth = limit;
        }
        const request = {
            'type': 'SUBSCRIBE',
            'channels': [
                {
                    'name': 'ORDER_BOOK',
                    'depth': depth,
                },
            ],
        };
        const orderbook = await this.watchMultiple (messageHash, request, subscriptionHash, [ symbol ], params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //  snapshot
        //     {
        //         instrument_code: 'ETH_BTC',
        //         bids: [
        //             ['0.053595', '4.5352'],
        //             ...
        //         ],
        //         asks: [
        //             ['0.055455', '0.2821'],
        //             ...
        //         ],
        //         channel_name: 'ORDER_BOOK',
        //         type: 'ORDER_BOOK_SNAPSHOT',
        //         time: '2022-06-23T15:38:02.196282Z'
        //     }
        //
        //  update
        //     {
        //         instrument_code: 'ETH_BTC',
        //         changes: [
        //             ['BUY', '0.053593', '8.0587']
        //         ],
        //         channel_name: 'ORDER_BOOK',
        //         type: 'ORDER_BOOK_UPDATE',
        //         time: '2022-06-23T15:38:02.751301Z'
        //     }
        //
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'instrument_code');
        const symbol = this.safeSymbol (marketId);
        const dateTime = this.safeString (message, 'time');
        const timestamp = this.parse8601 (dateTime);
        const channel = 'book:' + symbol;
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.orderBook ({});
        }
        if (type === 'ORDER_BOOK_SNAPSHOT') {
            const snapshot = this.parseOrderBook (message, symbol, timestamp, 'bids', 'asks');
            storedOrderBook.reset (snapshot);
        } else if (type === 'ORDER_BOOK_UPDATE') {
            const changes = this.safeValue (message, 'changes', []);
            this.handleDeltas (storedOrderBook, changes);
        } else {
            throw new NotSupported (this.id + ' watchOrderBook() did not recognize message type ' + type);
        }
        storedOrderBook['nonce'] = timestamp;
        storedOrderBook['timestamp'] = timestamp;
        storedOrderBook['datetime'] = this.iso8601 (timestamp);
        this.orderbooks[symbol] = storedOrderBook;
        client.resolve (storedOrderBook, channel);
    }

    handleDelta (orderbook, delta) {
        //
        //   [ 'BUY', '0.053595', '0' ]
        //
        const bidAsk = this.parseBidAsk (delta, 1, 2);
        const type = this.safeString (delta, 0);
        if (type === 'BUY') {
            const bids = orderbook['bids'];
            bids.storeArray (bidAsk);
        } else if (type === 'SELL') {
            const asks = orderbook['asks'];
            asks.storeArray (bidAsk);
        } else {
            throw new NotSupported (this.id + ' watchOrderBook () received unknown change type ' + this.json (delta));
        }
    }

    handleDeltas (orderbook, deltas) {
        //
        //    [
        //       [ 'BUY', '0.053593', '0' ],
        //       [ 'SELL', '0.053698', '0' ]
        //    ]
        //
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (orderbook, deltas[i]);
        }
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#watchOrders
         * @see https://developers.bitpanda.com/exchange/#account-history-channel
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @param {string} params.channel can listen to orders using ACCOUNT_HISTORY or TRADING
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const subscribeHash = this.safeString (params, 'channel', 'ACCOUNT_HISTORY');
        const bpRemainingQuota = this.safeInteger (this.options, 'bp_remaining_quota', 200);
        const subscribe = {
            'type': 'SUBSCRIBE',
            'bp_remaining_quota': bpRemainingQuota,
            'channels': [
                {
                    'name': subscribeHash,
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        let orders = await this.watch (url, messageHash, request, subscribeHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        orders = this.filterBySymbolSinceLimit (orders, symbol, since, limit);
        const numOrders = orders.length;
        if (numOrders === 0) {
            return await this.watchOrders (symbol, since, limit, params);
        }
        return orders;
    }

    handleTrading (client: Client, message) {
        //
        //     {
        //         order_book_sequence: 892925263,
        //         side: 'BUY',
        //         amount: '0.00046',
        //         trade_id: 'd67b9b69-ab76-480f-9ba3-b33582202836',
        //         matched_as: 'TAKER',
        //         matched_amount: '0.00046',
        //         matched_price: '22231.08',
        //         instrument_code: 'BTC_EUR',
        //         order_id: '7b39f316-0a71-4bfd-adda-3062e6f0bd37',
        //         remaining: '0.0',
        //         channel_name: 'TRADING',
        //         type: 'FILL',
        //         time: '2022-07-21T12:41:22.883341Z'
        //     }
        //
        //     {
        //         status: 'CANCELLED',
        //         order_book_sequence: 892928424,
        //         amount: '0.0003',
        //         side: 'SELL',
        //         price: '50338.65',
        //         instrument_code: 'BTC_EUR',
        //         order_id: 'b3994a08-a9e8-4a79-a08b-33e3480382df',
        //         remaining: '0.0003',
        //         channel_name: 'TRADING',
        //         type: 'DONE',
        //         time: '2022-07-21T12:44:24.267000Z'
        //     }
        //
        //     {
        //         order_book_sequence: 892934476,
        //         side: 'SELL',
        //         amount: '0.00051',
        //         price: '22349.02',
        //         instrument_code: 'BTC_EUR',
        //         order_id: '1c6c585c-ec3d-4b94-9292-6c3d04a31dc8',
        //         remaining: '0.00051',
        //         channel_name: 'TRADING',
        //         type: 'BOOKED',
        //         time: '2022-07-21T12:50:10.093000Z'
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const order = this.parseTradingOrder (message);
        this.orders.append (order);
        client.resolve (this.orders, 'orders:' + order['symbol']);
        client.resolve (this.orders, 'orders');
    }

    parseTradingOrder (order, market = undefined) {
        //
        //     {
        //         order_book_sequence: 892925263,
        //         side: 'BUY',
        //         amount: '0.00046',
        //         trade_id: 'd67b9b69-ab76-480f-9ba3-b33582202836',
        //         matched_as: 'TAKER',
        //         matched_amount: '0.00046',
        //         matched_price: '22231.08',
        //         instrument_code: 'BTC_EUR',
        //         order_id: '7b39f316-0a71-4bfd-adda-3062e6f0bd37',
        //         remaining: '0.0',
        //         channel_name: 'TRADING',
        //         type: 'FILL',
        //         time: '2022-07-21T12:41:22.883341Z'
        //     }
        //
        //     {
        //         status: 'CANCELLED',
        //         order_book_sequence: 892928424,
        //         amount: '0.0003',
        //         side: 'SELL',
        //         price: '50338.65',
        //         instrument_code: 'BTC_EUR',
        //         order_id: 'b3994a08-a9e8-4a79-a08b-33e3480382df',
        //         remaining: '0.0003',
        //         channel_name: 'TRADING',
        //         type: 'DONE',
        //         time: '2022-07-21T12:44:24.267000Z'
        //     }
        //
        //     {
        //         order_book_sequence: 892934476,
        //         side: 'SELL',
        //         amount: '0.00051',
        //         price: '22349.02',
        //         instrument_code: 'BTC_EUR',
        //         order_id: '1c6c585c-ec3d-4b94-9292-6c3d04a31dc8',
        //         remaining: '0.00051',
        //         channel_name: 'TRADING',
        //         type: 'BOOKED',
        //         time: '2022-07-21T12:50:10.093000Z'
        //     }
        //
        //     {
        //         "type":"UPDATE",
        //         "channel_name": "TRADING",
        //         "instrument_code": "BTC_EUR",
        //         "order_id": "1e842f13-762a-4745-9f3b-07f1b43e7058",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "time": "2020-01-11T01:01:01.999Z",
        //         "remaining": "1.23456",
        //         "order_book_sequence": 42,
        //         "status": "APPLIED",
        //         "amount": "1.35756",
        //         "amount_delta": "0.123",
        //         "modification_id": "cc0eed67-aecc-4fb4-a625-ff3890ceb4cc"
        //     }
        //  tracked
        //     {
        //         "type": "STOP_TRACKED",
        //         "channel_name": "TRADING",
        //         "instrument_code": "BTC_EUR",
        //         "order_id": "1e842f13-762a-4745-9f3b-07f1b43e7058",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "time": "2020-01-11T01:01:01.999Z",
        //         "remaining": "1.23456",
        //         "order_book_sequence": 42,
        //         "trigger_price": "12345.67",
        //         "current_price": "11111.11"
        //     }
        //
        //     {
        //         "type": "STOP_TRIGGERED",
        //         "channel_name": "TRADING",
        //         "instrument_code": "BTC_EUR",
        //         "order_id": "1e842f13-762a-4745-9f3b-07f1b43e7058",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "time": "2020-01-11T01:01:01.999Z",
        //         "remaining": "1.23456",
        //         "order_book_sequence": 42,
        //         "price": "13333.33"
        //     }
        //
        const datetime = this.safeString (order, 'time');
        const marketId = this.safeString (order, 'instrument_code');
        const symbol = this.safeSymbol (marketId, market, '_');
        return this.safeOrder ({
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.safeString (order, 'client_id'),
            'info': order,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeNumber2 (order, 'price', 'matched_price'),
            'stopPrice': this.safeNumber (order, 'trigger_price'),
            'amount': this.safeNumber (order, 'amount'),
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': this.safeString (order, 'remaining'),
            'status': this.parseTradingOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    parseTradingOrderStatus (status) {
        const statuses = {
            'CANCELLED': 'canceled',
            'SELF_TRADE': 'rejected',
            'FILLED_FULLY': 'closed',
            'INSUFFICIENT_FUNDS': 'rejected',
            'INSUFFICIENT_LIQUIDITY': 'rejected',
            'TIME_TO_MARKET_EXCEEDED': 'rejected',
            'LAST_PRICE_UNKNOWN': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    handleOrders (client: Client, message) {
        //
        //  snapshot
        //     {
        //         "account_id": "4920221a-48dc-423e-b336-bb65baccc7bd",
        //         "orders": [{
        //             "order": {
        //                 "order_id": "30e2de8f-9a34-472f-bcf8-3af4b7757626",
        //                 "account_holder": "49202c1a-48dc-423e-b336-bb65baccc7bd",
        //                 "account_id": "49202c1a-48dc-423e-b336-bb65baccc7bd",
        //                 "instrument_code": "BTC_EUR",
        //                 "time": "2022-06-28T06:10:02.587345Z",
        //                 "side": "SELL",
        //                 "price": "19645.48",
        //                 "amount": "0.00052",
        //                 "filled_amount": "0.00052",
        //                 "type": "MARKET",
        //                 "sequence": 7633339971,
        //                 "status": "FILLED_FULLY",
        //                 "average_price": "19645.48",
        //                 "is_post_only": false,
        //                 "order_book_sequence": 866885897,
        //                 "time_last_updated": "2022-06-28T06:10:02.766983Z",
        //                 "update_modification_sequence": 866885897
        //             },
        //             "trades": [{
        //                 "fee": {
        //                     "fee_amount": "0.01532347",
        //                     "fee_currency": "EUR",
        //                     "fee_percentage": "0.15",
        //                     "fee_group_id": "default",
        //                     "fee_type": "TAKER",
        //                     "running_trading_volume": "0.0",
        //                     "collection_type": "STANDARD"
        //                 },
        //                 "trade": {
        //                     "trade_id": "d83e302e-0b3a-4269-aa7d-ecf007cbe577",
        //                     "order_id": "30e2de8f-9a34-472f-bcf8-3af4b7757626",
        //                     "account_holder": "49203c1a-48dc-423e-b336-bb65baccc7bd",
        //                     "account_id": "4920221a-48dc-423e-b336-bb65baccc7bd",
        //                     "amount": "0.00052",
        //                     "side": "SELL",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "19645.48",
        //                     "time": "2022-06-28T06:10:02.693246Z",
        //                     "price_tick_sequence": 0,
        //                     "sequence": 7633339971
        //                 }
        //             }]
        //         }],
        //         "channel_name": "ACCOUNT_HISTORY",
        //         "type": "INACTIVE_ORDERS_SNAPSHOT",
        //         "time": "2022-06-28T06:11:52.469242Z"
        //     }
        //
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const rawOrders = this.safeValue (message, 'orders', []);
        const rawOrdersLength = rawOrders.length;
        if (rawOrdersLength === 0) {
            return;
        }
        for (let i = 0; i < rawOrders.length; i++) {
            const order = this.parseOrder (rawOrders[i]);
            let symbol = this.safeString (order, 'symbol', '');
            this.orders.append (order);
            client.resolve (this.orders, 'orders:' + symbol);
            const rawTrades = this.safeValue (rawOrders[i], 'trades', []);
            for (let ii = 0; ii < rawTrades.length; ii++) {
                const trade = this.parseTrade (rawTrades[ii]);
                symbol = this.safeString (trade, 'symbol', symbol);
                this.myTrades.append (trade);
                client.resolve (this.myTrades, 'myTrades:' + symbol);
            }
        }
        client.resolve (this.orders, 'orders');
        client.resolve (this.myTrades, 'myTrades');
    }

    handleAccountUpdate (client: Client, message) {
        //
        // order created
        //     {
        //         account_id: '49302c1a-48dc-423e-b336-bb65baccc7bd',
        //         sequence: 7658332018,
        //         update: {
        //             type: 'ORDER_CREATED',
        //             activity: 'TRADING',
        //             account_holder: '43202c1a-48dc-423e-b336-bb65baccc7bd',
        //             account_id: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //             order_id: '8893fd69-5ebd-496b-aaa4-269b4c18aa77',
        //             time: '2022-06-29T04:33:29.661257Z',
        //             order: {
        //                 time_in_force: 'GOOD_TILL_CANCELLED',
        //                 is_post_only: false,
        //                 order_id: '8892fd69-5ebd-496b-aaa4-269b4c18aa77',
        //                 account_holder: '43202c1a-48dc-423e-b336-bb65baccc7bd',
        //                 account_id: '49302c1a-48dc-423e-b336-bb65baccc7bd',
        //                 instrument_code: 'BTC_EUR',
        //                 time: '2022-06-29T04:33:29.656896Z',
        //                 side: 'SELL',
        //                 price: '50338.65',
        //                 amount: '0.00021',
        //                 filled_amount: '0.0',
        //                 type: 'LIMIT'
        //             },
        //             locked: {
        //                 currency_code: 'BTC',
        //                 amount: '0.00021',
        //                 new_available: '0.00017',
        //                 new_locked: '0.00021'
        //             },
        //             id: '26e9c36a-b231-4bb0-a686-aa915a2fc9e6',
        //             sequence: 7658332018
        //         },
        //         channel_name: 'ACCOUNT_HISTORY',
        //         type: 'ACCOUNT_UPDATE',
        //         time: '2022-06-29T04:33:29.684517Z'
        //     }
        //
        //  order rejected
        //     {
        //         account_id: '49302c1a-48dc-423e-b336-bb65baccc7bd',
        //         sequence: 7658332018,
        //         update: {
        //             "id": "d3fe6025-5b27-4df6-a957-98b8d131cb9d",
        //             "type": "ORDER_REJECTED",
        //             "activity": "TRADING",
        //             "account_id": "b355abb8-aaae-4fae-903c-c60ff74723c6",
        //             "sequence": 0,
        //             "timestamp": "2018-08-01T13:39:15.590Z",
        //             "reason": "INSUFFICIENT_FUNDS",
        //             "order_id": "6f991342-da2c-45c6-8830-8bf519cfc8cc",
        //             "client_id": "fb497387-8223-4111-87dc-66a86f98a7cf",
        //             "unlocked": {
        //                 "currency_code": "BTC",
        //                 "amount": "1.5",
        //                 "new_locked": "2.0",
        //                 "new_available": "1.5"
        //             }
        //         }
        //     }
        //
        //  order closed
        //     {
        //         account_id: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //         sequence: 7658471216,
        //         update: {
        //             type: 'ORDER_CLOSED',
        //             activity: 'TRADING',
        //             account_holder: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //             account_id: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //             time: '2022-06-29T04:43:57.169616Z',
        //             order_id: '8892fd69-5ebd-496b-aaa4-269b4c18aa77',
        //             unlocked: {
        //                 currency_code: 'BTC',
        //                 amount: '0.00021',
        //                 new_available: '0.00038',
        //                 new_locked: '0.0'
        //             },
        //             order_book_sequence: 867964191,
        //             id: '26c5e1d7-65ba-4a11-a661-14c0130ff484',
        //             sequence: 7658471216
        //         },
        //         channel_name: 'ACCOUNT_HISTORY',
        //         type: 'ACCOUNT_UPDATE',
        //         time: '2022-06-29T04:43:57.182153Z'
        //     }
        //
        //  trade settled
        //     {
        //         account_id: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //         sequence: 7658502878,
        //         update: {
        //             type: 'TRADE_SETTLED',
        //             activity: 'TRADING',
        //             account_holder: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //             account_id: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //             time: '2022-06-29T04:46:12.933091Z',
        //             order_id: 'ad19951a-b616-401d-a062-8d0609f038a4',
        //             order_book_sequence: 867965579,
        //             filled_amount: '0.00052',
        //             order: {
        //                 amount: '0.00052',
        //                 filled_amount: '0.00052'
        //             },
        //             trade: {
        //                 trade_id: '21039eb9-2df0-4227-be2d-0ea9b691ac66',
        //                 order_id: 'ad19951a-b616-401d-a062-8d0609f038a4',
        //                 account_holder: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //                 account_id: '49202c1a-48dc-423e-b336-bb65baccc7bd',
        //                 amount: '0.00052',
        //                 side: 'BUY',
        //                 instrument_code: 'BTC_EUR',
        //                 price: '19309.29',
        //                 time: '2022-06-29T04:46:12.870581Z',
        //                 price_tick_sequence: 0
        //             },
        //             fee: {
        //                 fee_amount: '0.00000078',
        //                 fee_currency: 'BTC',
        //                 fee_percentage: '0.15',
        //                 fee_group_id: 'default',
        //                 fee_type: 'TAKER',
        //                 running_trading_volume: '0.00052',
        //                 collection_type: 'STANDARD'
        //             },
        //             spent: {
        //                 currency_code: 'EUR',
        //                 amount: '10.0408308',
        //                 new_available: '0.0',
        //                 new_locked: '0.15949533'
        //             },
        //             credited: {
        //                 currency_code: 'BTC',
        //                 amount: '0.00051922',
        //                 new_available: '0.00089922',
        //                 new_locked: '0.0'
        //             },
        //             unlocked: {
        //                 currency_code: 'EUR',
        //                 amount: '0.0',
        //                 new_available: '0.0',
        //                 new_locked: '0.15949533'
        //             },
        //             id: '22b40199-2508-4176-8a14-d4785c933444',
        //             sequence: 7658502878
        //         },
        //         channel_name: 'ACCOUNT_HISTORY',
        //         type: 'ACCOUNT_UPDATE',
        //         time: '2022-06-29T04:46:12.941837Z'
        //     }
        //
        //  Trade Settled with BEST fee collection enabled
        //     {
        //         account_id: '49302c1a-48dc-423e-b336-bb65baccc7bd',
        //         sequence: 7658951984,
        //         update: {
        //             "id": "70e00504-d892-456f-9aae-4da7acb36aac",
        //             "sequence": 361792,
        //             "order_book_sequence": 123456,
        //             "type": "TRADE_SETTLED",
        //             "activity": "TRADING",
        //             "account_id": "379a12c0-4560-11e9-82fe-2b25c6f7d123",
        //             "time": "2019-10-22T12:09:55.731Z",
        //             "order_id": "9fcdd91c-7f6e-45f4-9956-61cddba55de5",
        //             "client_id": "fb497387-8223-4111-87dc-66a86f98a7cf",
        //             "order": {
        //                 "amount": "0.5",
        //                 "filled_amount": "0.5"
        //             },
        //             "trade": {
        //                 "trade_id": "a828b63e-b2cb-48f0-8d99-8fc22cf98e08",
        //                 "order_id": "9fcdd91c-7f6e-45f4-9956-61cddba55de5",
        //                 "account_id": "379a12c0-4560-11e9-82fe-2b25c6f7d123",
        //                 "amount": "0.5",
        //                 "side": "BUY",
        //                 "instrument_code": "BTC_EUR",
        //                 "price": "7451.6",
        //                 "time": "2019-10-22T12:09:55.667Z"
        //             },
        //             "fee": {
        //                 "fee_amount": "23.28625",
        //                 "fee_currency": "BEST",
        //                 "fee_percentage": "0.075",
        //                 "fee_group_id": "default",
        //                 "fee_type": "TAKER",
        //                 "running_trading_volume": "0.10058",
        //                 "collection_type": "BEST",
        //                 "applied_best_eur_rate": "1.04402"
        //             },
        //             "spent": {
        //                 "currency_code": "EUR",
        //                 "amount": "3725.8",
        //                 "new_available": "14517885.0675703028781",
        //                 "new_locked": "2354.882"
        //             },
        //             "spent_on_fees": {
        //                 "currency_code": "BEST",
        //                 "amount": "23.28625",
        //                 "new_available": "9157.31375",
        //                 "new_locked": "0.0"
        //             },
        //             "credited": {
        //                 "currency_code": "BTC",
        //                 "amount": "0.5",
        //                 "new_available": "5839.89633700481",
        //                 "new_locked": "0.0"
        //             },
        //             "unlocked": {
        //                 "currency_code": "EUR",
        //                 "amount": "0.15",
        //                 "new_available": "14517885.0675703028781",
        //                 "new_locked": "2354.882"
        //             }
        //         }
        //         channel_name: 'ACCOUNT_HISTORY',
        //         type: 'ACCOUNT_UPDATE',
        //         time: '2022-06-29T05:18:51.760338Z'
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        let symbol = undefined;
        const update = this.safeValue (message, 'update', {});
        const updateType = this.safeString (update, 'type');
        if (updateType === 'ORDER_REJECTED' || updateType === 'ORDER_CLOSED' || updateType === 'STOP_ORDER_TRIGGERED') {
            const orderId = this.safeString (update, 'order_id');
            const datetime = this.safeString2 (update, 'time', 'timestamp');
            const previousOrderArray = this.filterByArray (this.orders, 'id', orderId, false);
            const previousOrder = this.safeValue (previousOrderArray, 0, {});
            symbol = previousOrder['symbol'];
            const filled = this.safeNumber (update, 'filled_amount');
            let status = this.parseWSOrderStatus (updateType);
            if (updateType === 'ORDER_CLOSED' && filled === 0) {
                status = 'canceled';
            }
            this.orders.append ({
                'id': orderId,
                'symbol': symbol,
                'status': status,
                'timestamp': this.parse8601 (datetime),
                'datetime': datetime,
            });
        } else {
            const parsed = this.parseOrder (update);
            symbol = this.safeString (parsed, 'symbol', '');
            this.orders.append (parsed);
        }
        client.resolve (this.orders, 'orders:' + symbol);
        client.resolve (this.orders, 'orders');
        // update balance
        const balanceKeys = [ 'locked', 'unlocked', 'spent', 'spent_on_fees', 'credited', 'deducted' ];
        for (let i = 0; i < balanceKeys.length; i++) {
            const newBalance = this.safeValue (update, balanceKeys[i]);
            if (newBalance !== undefined) {
                this.updateBalance (newBalance);
            }
        }
        client.resolve (this.balance, 'balance');
        // update trades
        if (updateType === 'TRADE_SETTLED') {
            const parsed = this.parseTrade (update);
            symbol = this.safeString (parsed, 'symbol', '');
            this.myTrades.append (parsed);
            client.resolve (this.myTrades, 'myTrades:' + symbol);
            client.resolve (this.myTrades, 'myTrades');
        }
    }

    parseWSOrderStatus (status) {
        const statuses = {
            'ORDER_REJECTED': 'rejected',
            'ORDER_CLOSED': 'closed',
            'STOP_ORDER_TRIGGERED': 'triggered',
        };
        return this.safeString (statuses, status, status);
    }

    updateBalance (balance) {
        //
        //     {
        //         currency_code: 'EUR',
        //         amount: '0.0',
        //         new_available: '0.0',
        //         new_locked: '0.15949533'
        //     }
        //
        const currencyId = this.safeString (balance, 'currency_code');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (balance, 'new_available');
        account['used'] = this.safeString (balance, 'new_locked');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#watchOHLCV
         * @see https://developers.bitpanda.com/exchange/#candlesticks-channel
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframeId = this.safeValue (timeframes, timeframe);
        if (timeframeId === undefined) {
            throw new NotSupported (this.id + ' this interval is not supported, please provide one of the supported timeframes');
        }
        const messageHash = 'ohlcv.' + symbol + '.' + timeframe;
        const subscriptionHash = 'CANDLESTICKS';
        const client = this.safeValue (this.clients, url);
        let type = 'SUBSCRIBE';
        let subscription = {};
        if (client !== undefined) {
            subscription = this.safeValue (client.subscriptions, subscriptionHash);
            if (subscription !== undefined) {
                const ohlcvMarket = this.safeValue (subscription, marketId, {});
                const marketSubscribed = this.safeValue (ohlcvMarket, timeframe, false);
                if (!marketSubscribed) {
                    type = 'UPDATE_SUBSCRIPTION';
                    client.subscriptions[subscriptionHash] = undefined;
                }
            } else {
                subscription = {};
            }
        }
        const subscriptionMarketId = this.safeValue (subscription, marketId);
        if (subscriptionMarketId === undefined) {
            subscription[marketId] = {};
        }
        subscription[marketId][timeframe] = true;
        const properties = [];
        const marketIds = Object.keys (subscription);
        for (let i = 0; i < marketIds.length; i++) {
            const marketIdtimeframes = Object.keys (subscription[marketIds[i]]);
            for (let ii = 0; ii < marketIdtimeframes.length; ii++) {
                const marketTimeframeId = this.safeValue (timeframes, timeframe);
                const property = {
                    'instrument_code': marketIds[i],
                    'time_granularity': marketTimeframeId,
                };
                properties.push (property);
            }
        }
        const request = {
            'type': type,
            'channels': [
                {
                    'name': 'CANDLESTICKS',
                    'properties': properties,
                },
            ],
        };
        const ohlcv = await this.watch (url, messageHash, this.deepExtend (request, params), subscriptionHash, subscription);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleOHLCV (client: Client, message) {
        //
        //  snapshot
        //     {
        //         instrument_code: 'BTC_EUR',
        //         granularity: { unit: 'MONTHS', period: 1 },
        //         high: '29750.81',
        //         low: '16764.59',
        //         open: '29556.02',
        //         close: '20164.55',
        //         volume: '107518944.610659',
        //         last_sequence: 2275507,
        //         channel_name: 'CANDLESTICKS',
        //         type: 'CANDLESTICK_SNAPSHOT',
        //         time: '2022-06-30T23:59:59.999000Z'
        //     }
        //
        //  update
        //     {
        //         "instrument_code": "BTC_EUR",
        //         "granularity": {
        //             "unit": "MINUTES",
        //             "period": 1
        //         },
        //         "high": "20164.16",
        //         "low": "20164.16",
        //         "open": "20164.16",
        //         "close": "20164.16",
        //         "volume": "3645.2768448",
        //         "last_sequence": 2275511,
        //         "channel_name": "CANDLESTICKS",
        //         "type": "CANDLESTICK",
        //         "time": "2022-06-24T21:20:59.999000Z"
        //     }
        //
        const marketId = this.safeString (message, 'instrument_code');
        const symbol = this.safeSymbol (marketId);
        const dateTime = this.safeString (message, 'time');
        const timeframeId = this.safeValue (message, 'granularity');
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframe = this.findTimeframe (timeframeId, timeframes);
        const channel = 'ohlcv.' + symbol + '.' + timeframe;
        const parsed = [
            this.parse8601 (dateTime),
            this.safeNumber (message, 'open'),
            this.safeNumber (message, 'high'),
            this.safeNumber (message, 'low'),
            this.safeNumber (message, 'close'),
            this.safeNumber (message, 'volume'),
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
        }
        stored.append (parsed);
        this.ohlcvs[symbol][timeframe] = stored;
        client.resolve (stored, channel);
    }

    findTimeframe (timeframe, timeframes = undefined) {
        timeframes = timeframes || this.timeframes;
        const keys = Object.keys (timeframes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (timeframes[key]['unit'] === timeframe['unit'] && timeframes[key]['period'] === timeframe['period']) {
                return key;
            }
        }
        return undefined;
    }

    handleSubscriptions (client: Client, message) {
        //
        //     {
        //         channels: [{
        //             instrument_codes: [Array],
        //             depth: 0,
        //             name: 'ORDER_BOOK'
        //         }],
        //         type: 'SUBSCRIPTIONS',
        //         time: '2022-06-23T15:36:26.948282Z'
        //     }
        //
        return message;
    }

    handleHeartbeat (client: Client, message) {
        //
        //     {
        //         subscription: 'SYSTEM',
        //         channel_name: 'SYSTEM',
        //         type: 'HEARTBEAT',
        //         time: '2022-06-23T16:31:49.170224Z'
        //     }
        //
        return message;
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         error: 'MALFORMED_JSON',
        //         channel_name: 'SYSTEM',
        //         type: 'ERROR',
        //         time: '2022-06-23T15:38:25.470391Z'
        //     }
        //
        throw new ExchangeError (this.id + ' ' + this.json (message));
    }

    handleMessage (client: Client, message) {
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            return this.handleErrorMessage (client, message);
        }
        const type = this.safeValue (message, 'type');
        const handlers = {
            'ORDER_BOOK_UPDATE': this.handleOrderBook,
            'ORDER_BOOK_SNAPSHOT': this.handleOrderBook,
            'ACTIVE_ORDERS_SNAPSHOT': this.handleOrders,
            'INACTIVE_ORDERS_SNAPSHOT': this.handleOrders,
            'ACCOUNT_UPDATE': this.handleAccountUpdate,
            'BALANCES_SNAPSHOT': this.handleBalanceSnapshot,
            'SUBSCRIPTIONS': this.handleSubscriptions,
            'SUBSCRIPTION_UPDATED': this.handleSubscriptions,
            'PRICE_TICK': this.handleTicker,
            'PRICE_TICK_HISTORY': this.handleSubscriptions,
            'HEARTBEAT': this.handleHeartbeat,
            'MARKET_TICKER_UPDATES': this.handleTicker,
            'PRICE_POINT_UPDATES': this.handlePricePointUpdates,
            'CANDLESTICK_SNAPSHOT': this.handleOHLCV,
            'CANDLESTICK': this.handleOHLCV,
            'AUTHENTICATED': this.handleAuthenticationMessage,
            'FILL': this.handleTrading,
            'DONE': this.handleTrading,
            'BOOKED': this.handleTrading,
            'UPDATE': this.handleTrading,
            'TRACKED': this.handleTrading,
            'TRIGGERED': this.handleTrading,
            'STOP_TRACKED': this.handleTrading,
            'STOP_TRIGGERED': this.handleTrading,
        };
        const handler = this.safeValue (handlers, type);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        throw new NotSupported (this.id + ' no handler found for this message ' + this.json (message));
    }

    handlePricePointUpdates (client: Client, message) {
        //
        //     {
        //         "channel_name": "MARKET_TICKER",
        //         "type": "PRICE_POINT_UPDATES",
        //         "time": "2019-03-01T10:59:59.999Z",
        //         "price_updates": [{
        //                 "instrument": "BTC_EUR",
        //                 "prices": [{
        //                         "time": "2019-03-01T08:59:59.999Z",
        //                         "close_price": "3580.6"
        //                     },
        //                     ...
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        return message;
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //    {
        //        channel_name: 'SYSTEM',
        //        type: 'AUTHENTICATED',
        //        time: '2022-06-24T20:45:25.447488Z'
        //    }
        //
        const future = this.safeValue (client.futures, 'authenticated');
        if (future !== undefined) {
            future.resolve (true);
        }
        return message;
    }

    async watchMultiple (messageHash, request, subscriptionHash, symbols: string[] = [], params = {}) {
        let marketIds = [];
        const numSymbols = symbols.length;
        if (numSymbols === 0) {
            marketIds = Object.keys (this.markets_by_id);
        } else {
            marketIds = this.marketIds (symbols);
        }
        const url = this.urls['api']['ws'];
        const client = this.safeValue (this.clients, url);
        let type = 'SUBSCRIBE';
        let subscription = {};
        if (client !== undefined) {
            subscription = this.safeValue (client.subscriptions, subscriptionHash);
            if (subscription !== undefined) {
                for (let i = 0; i < marketIds.length; i++) {
                    const marketId = marketIds[i];
                    const marketSubscribed = this.safeValue (subscription, marketId, false);
                    if (!marketSubscribed) {
                        type = 'UPDATE_SUBSCRIPTION';
                        client.subscriptions[subscriptionHash] = undefined;
                    }
                }
            } else {
                subscription = {};
            }
        }
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            subscription[marketId] = true;
        }
        request['type'] = type;
        request['channels'][0]['instrument_codes'] = Object.keys (subscription);
        return await this.watch (url, messageHash, this.deepExtend (request, params), subscriptionHash, subscription);
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials ();
            const request = {
                'type': 'AUTHENTICATE',
                'api_token': this.apiKey,
            };
            this.watch (url, messageHash, this.extend (request, params), messageHash);
        }
        return future;
    }
}
