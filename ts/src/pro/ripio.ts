
//  ---------------------------------------------------------------------------

import { ArgumentsRequired } from '../base/errors.js';
import { Balances, Int, Order, OrderBook, Ticker, Trade } from '../base/types.js';
import { ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
import ripioRest from '../ripio.js';

//  ---------------------------------------------------------------------------

export default class ripio extends ripioRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.ripiotrade.co/',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'uuid': this.uuid (),
            },
        });
    }

    async watchTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name ripio#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const marketId = this.marketId (symbol);
        const name = 'trade@' + marketId;
        const trades = await this.subscribe (name, { 'methodToCall': 'handleTrade' }, symbol);
        //
        //     {
        //         "topic": "trade@ETH_BRL",
        //         "timestamp": 1672856503549,
        //         "body": {
        //             "amount": 0.2404764,
        //             "date": "2019-01-03T02:27:33.947Z",
        //             "id": "2B222F22-5235-45FA-97FC-E9DBFA2575EE",
        //             "maker_order_id": "F49F5BD8-3F5B-4364-BCEE-F36F62DB966A",
        //             "maker_side": "buy",
        //             "maker_type": "limit",
        //             "pair": "ETH_BRL",
        //             "price": 15160,
        //             "taker_order_id": "FEAB5CEC-7F9E-4F95-B67D-9E8D5C739BE3",
        //             "taker_side": "sell",
        //             "taker_type": "market",
        //             "timestamp": 1675780847920,
        //             "total_value": 3638.4
        //         }
        //     }
        //
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchTicker (symbol: string = undefined, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name ripio#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params not used by ripio watchTicker
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const marketId = this.marketId (symbol);
        const name = 'ticker@' + marketId;
        const ticker = await this.subscribe (name, { 'methodToCall': 'handleTicker' }, symbol);
        //
        //     {
        //         "topic": "ticker@ETH_BRL",
        //         "timestamp": 1672856683447,
        //         "body": {
        //             "ask": 4.01,
        //             "base_code": "ETH",
        //             "base_id": "13A4B83B-E74F-425C-BC0A-03A9C0F29FAD",
        //             "bid": 5,
        //             "date": "2022-09-28T19:13:40.887Z",
        //             "high": 20,
        //             "last": 20,
        //             "low": 20,
        //             "pair": "ETH_BRL",
        //             "price_change_percent_24h": "-16.66",
        //             "quote_id": "48898138-8623-4555-9468-B1A1505A9352",
        //             "quote_code": "BRL",
        //             "quote_volume": 600,
        //             "trades_quantity": 10,
        //             "volume": 124
        //         }
        //     }
        //
        return ticker;
    }

    async watchOrderBook (symbol: string = undefined, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name ripio#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit not used by ripio watchOrderBook
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @param {string|undefined} params.level orderbook level to be used, level_2 or level_3 (if a valid level is not sent, the level_2 will be used by default)
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const marketId = this.marketId (symbol);
        let level = this.safeString (params, 'level');
        if (level !== 'level_2' && level !== 'level_3') {
            level = 'level_2';
        }
        const name = 'orderbook/' + level + '@' + marketId;
        const orderbook = await this.subscribe (name, { 'methodToCall': 'handleOrderBook' }, symbol);
        //
        //     {
        //         "topic": "orderbook/level_2@ETH_BRL",
        //         "timestamp": 1672856653428,
        //         "body": {
        //             "asks": [
        //                 {
        //                     "amount": 10,
        //                     "price": 25
        //                 }
        //             ],
        //             "bids": [
        //                 {
        //                     "amount": 20,
        //                     "price": 4
        //                 }
        //             ],
        //             "pair": "ETH_BRL"
        //         }
        //     }
        //
        return orderbook;
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name ripio#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params not used by ripio watchBalance
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const name = 'balance';
        const ticket = await this.fetchWebSocketTicket ();
        const balance = await this.subscribe (name, { 'methodToCall': 'handleBalance', 'ticket': ticket });
        //
        //     {
        //         "topic": "balance",
        //         "timestamp": 1672856833684,
        //         "body": {
        //             "user_id": "299E7131-CE8C-422F-A1CF-497BFA116F89",
        //             "balances": [
        //                 {
        //                     "available_amount": 3,
        //                     "currency_code": "ETH",
        //                     "locked_amount": 1
        //                 }
        //             ]
        //         }
        //     }
        //
        return balance;
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name ripio#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified symbol of the market
         * @param {int|undefined} since not used by ripio watchMyTrades
         * @param {int|undefined} limit not used by ripio watchMyTrades
         * @param {object} params not used by ripio watchMyTrades
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        const name = 'user_trades';
        const ticket = await this.fetchWebSocketTicket ();
        const trades = await this.subscribe (name, { 'methodToCall': 'handleTrade', 'ticket': ticket }, symbol);
        //
        //     {
        //         "topic": "user_trades",
        //         "timestamp": 1673271591764,
        //         "body": {
        //             "trade": {
        //                 "amount": 1,
        //                 "date": "2023-01-09T13:39:24.057Z",
        //                 "fee": 0,
        //                 "fee_currency": "BCH",
        //                 "id": "08799ECC-F6B1-498E-B89C-2A05E6A181B9",
        //                 "pair_code": "BCH_BRL",
        //                 "price": 49,
        //                 "side": "buy",
        //                 "taker_or_maker": "taker",
        //                 "timestamp": 1675780847920,
        //                 "total_value": 49,
        //                 "type": "limit"
        //             },
        //             "user_id": "30B8CDBB-BDBD-4B60-A90F-860AB46B76F7"
        //         }
        //     }
        //
        return trades;
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name ripio#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified symbol of the market
         * @param {int|undefined} since not used by ripio watchOrders
         * @param {int|undefined} limit not used by ripio watchOrders
         * @param {object} params not used by ripio watchOrders
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const name = 'order_status';
        const ticket = await this.fetchWebSocketTicket ();
        const order = await this.subscribe (name, { 'methodToCall': 'parseOrder', 'ticket': ticket }, symbol);
        //
        //     {
        //         "topic": "order_status",
        //         "timestamp": 1672856713677,
        //         "body": {
        //             "amount": 4,
        //             "average_execution_price": 6,
        //             "id": "F55E4E01-C39B-4AA7-848B-1C6A362C386E",
        //             "created_at": "2023-01-24T17:28:32.247Z",
        //             "executed_amount": 4,
        //             "external_id": null,
        //             "pair": "ETH_BRL",
        //             "price": 6,
        //             "remaining_amount": 0,
        //             "side": "buy",
        //             "status": "executed_completely",
        //             "type": "limit",
        //             "updated_at": "2023-01-24T17:28:33.993Z",
        //             "user_id": "30B8CDBB-BDBD-4B60-A90F-860AB46B76F7"
        //         }
        //     }
        //
        return order;
    }

    handleTrade (client: Client, message, subscription) {
        //
        // watchTrades (public)
        //
        //      {
        //          "amount": 0.2404764,
        //          "date": "2019-01-03T02:27:33.947Z",
        //          "id": "2B222F22-5235-45FA-97FC-E9DBFA2575EE",
        //          "maker_order_id": "F49F5BD8-3F5B-4364-BCEE-F36F62DB966A",
        //          "maker_side": "buy",
        //          "maker_type": "limit",
        //          "pair": "ETH_BRL",
        //          "price": 15160,
        //          "taker_order_id": "FEAB5CEC-7F9E-4F95-B67D-9E8D5C739BE3",
        //          "taker_side": "sell",
        //          "taker_type": "market",
        //          "timestamp": 1675780847920,
        //          "total_value": 3638.4
        //      }
        //
        // watchMyTrades (private)
        //
        //      {
        //          "amount": 1,
        //          "date": "2023-01-09T13:39:24.057Z",
        //          "fee": 0,
        //          "fee_currency": "BCH",
        //          "id": "08799ECC-F6B1-498E-B89C-2A05E6A181B9",
        //          "pair_code": "BCH_BRL",
        //          "price": 49,
        //          "side": "buy",
        //          "taker_or_maker": "taker",
        //          "timestamp": 1675780847920,
        //          "total_value": 49,
        //          "type": "limit"
        //      }
        //
        const payload = this.safeValue (message, 'body');
        if (payload === undefined) {
            return;
        }
        let symbol = this.safeString (subscription, 'symbol');
        symbol = this.symbol (symbol);
        const messageHash = this.safeString (subscription, 'messageHash');
        const market = this.market (symbol);
        const trade = this.parseTrade (payload, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    handleTicker (client: Client, message, subscription) {
        //
        // watchTicker (public)
        //
        //      {
        //          "ask": 4.01,
        //          "base_code": "ETH",
        //          "base_id": "13A4B83B-E74F-425C-BC0A-03A9C0F29FAD",
        //          "bid": 5,
        //          "date": "2022-09-28T19:13:40.887Z",
        //          "high": 20,
        //          "last": 20,
        //          "low": 20,
        //          "pair": "ETH_BRL",
        //          "price_change_percent_24h": "-16.66",
        //          "quote_id": "48898138-8623-4555-9468-B1A1505A9352",
        //          "quote_code": "BRL",
        //          "quote_volume": 600,
        //          "trades_quantity": 10,
        //          "volume": 124
        //      }
        //
        const payload = this.safeValue (message, 'body');
        if (payload === undefined) {
            return message;
        }
        const ticker = this.parseTicker (payload);
        let symbol = this.safeString (subscription, 'symbol');
        symbol = this.symbol (symbol);
        this.tickers[symbol] = ticker;
        const messageHash = this.safeString (subscription, 'messageHash');
        if (messageHash !== undefined) {
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleOrderBook (client: Client, message, subscription) {
        //
        // watchOrderBook (public)
        //
        //      {
        //          "asks": [
        //              {
        //                  "amount": 10,
        //                  "price": 25
        //              }
        //          ],
        //          "bids": [
        //              {
        //                  "amount": 20,
        //                  "price": 4
        //              }
        //          ],
        //          "pair": "ETH_BRL"
        //      }
        //
        const payload = this.safeValue (message, 'body');
        if (payload === undefined) {
            return message;
        }
        let symbol = this.safeString (subscription, 'symbol');
        symbol = this.symbol (symbol);
        const timestamp = this.safeInteger (message, 'timestamp');
        const orderbook = this.parseOrderBook (payload, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
        const messageHash = this.safeString (subscription, 'messageHash');
        client.resolve (orderbook, messageHash);
        return orderbook;
    }

    handleBalance (client: Client, message, subscription) {
        //
        // watchBalance (private)
        //
        //      {
        //          "user_id": "299E7131-CE8C-422F-A1CF-497BFA116F89",
        //          "balances": [
        //              {
        //                  "available_amount": 3,
        //                  "currency_code": "ETH",
        //                  "locked_amount": 1
        //              }
        //          ]
        //      }
        //
        const payload = this.safeValue (message, 'body');
        if (payload === undefined) {
            return message;
        }
        const messageHash = this.safeString (subscription, 'messageHash');
        const balances = this.safeValue (payload, 'balances');
        const result = { };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available_amount');
            account['used'] = this.safeString (balance, 'locked_amount');
            account['total'] = (this.safeNumber (balance, 'available_amount') + this.safeNumber (balance, 'locked_amount')).toString ();
            result[code] = account;
        }
        const safeBalance = this.safeBalance (result);
        if (messageHash !== undefined) {
            client.resolve (safeBalance, messageHash);
        }
        return safeBalance;
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'amount');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleMessage (client: Client, message) {
        const keys = Object.keys (client.subscriptions);
        const firstKey = this.safeString (keys, 0);
        const subscription = this.safeValue (client.subscriptions, firstKey, {});
        const methodName = this.safeValue (subscription, 'methodToCall');
        const methods = {
            'handleTrade': this.handleTrade,
            'handleTicker': this.handleTicker,
            'handleOrderBook': this.handleOrderBook,
            'handleBalance': this.handleBalance,
            'parseOrder': this.parseOrder,
        };
        const methodToCall = this.safeValue (methods, methodName);
        if (methodToCall !== undefined) {
            methodToCall.call (this, client, message, subscription);
        }
    }

    async subscribe (topic, params = {}, symbol = undefined) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const request = {
            'topics': [ topic ],
            'method': 'subscribe',
            'messageHash': topic,
        };
        const subscription = this.deepExtend (request, params);
        if (symbol !== undefined) {
            subscription['symbol'] = symbol;
        }
        return await this.watch (url, topic, subscription, topic, subscription);
    }
}
