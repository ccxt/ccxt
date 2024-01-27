
//  ---------------------------------------------------------------------------

import coinbaseproRest from '../coinbasepro.js';
import { AuthenticationError, ExchangeError, BadSymbol, BadRequest, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Tickers, Int, Ticker, Str, Strings, OrderBook, Trade, Order } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coinbasepro extends coinbaseproRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false, // missing on the exchange side
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTradesForSymbols': true,
                'watchBalance': false,
                'watchStatus': false, // for now
                'watchOrders': true,
                'watchOrdersForSymbols': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws-feed.pro.coinbase.com',
                },
                'test': {
                    'ws': 'wss://ws-feed-public.sandbox.exchange.coinbase.com',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
            },
        });
    }

    authenticate () {
        this.checkRequiredCredentials ();
        const path = '/users/self/verify';
        const nonce = this.nonce ();
        const payload = nonce.toString () + 'GET' + path;
        const signature = this.hmac (this.encode (payload), this.base64ToBinary (this.secret), sha256, 'base64');
        return {
            'timestamp': nonce,
            'key': this.apiKey,
            'signature': signature,
            'passphrase': this.password,
        };
    }

    async subscribe (name, symbol = undefined, messageHashStart = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = messageHashStart;
        const productIds = [];
        if (symbol !== undefined) {
            market = this.market (symbol);
            messageHash += ':' + market['id'];
            productIds.push (market['id']);
        }
        let url = this.urls['api']['ws'];
        if ('signature' in params) {
            // need to distinguish between public trades and user trades
            url = url + '?';
        }
        const subscribe = {
            'type': 'subscribe',
            'product_ids': productIds,
            'channels': [
                name,
            ],
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async subscribeMultiple (name, symbols = [], messageHashStart = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        symbols = this.marketSymbols (symbols);
        const messageHashes = [];
        const productIds = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            market = this.market (symbol);
            productIds.push (market['id']);
            messageHashes.push (messageHashStart + ':' + market['symbol']);
        }
        let url = this.urls['api']['ws'];
        if ('signature' in params) {
            // need to distinguish between public trades and user trades
            url = url + '?';
        }
        const subscribe = {
            'type': 'subscribe',
            'product_ids': productIds,
            'channels': [
                name,
            ],
        };
        const request = this.extend (subscribe, params);
        return await this.watchMultiple (url, messageHashes, request, messageHashes);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coinbasepro#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const name = 'ticker';
        return await this.subscribe (name, symbol, name, params);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coinbasepro#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new BadSymbol (this.id + ' watchTickers requires a non-empty symbols array');
        }
        const channel = 'ticker';
        const messageHash = 'ticker';
        const ticker = await this.subscribeMultiple (channel, symbols, messageHash, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinbasepro#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const name = 'matches';
        const trades = await this.subscribe (name, symbol, name, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinbase#watchTradesForSymbols
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new BadRequest (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const name = 'matches';
        const trades = await this.subscribeMultiple (name, symbols, name, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinbasepro#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const name = 'user';
        const messageHash = 'myTrades';
        const authentication = this.authenticate ();
        const trades = await this.subscribe (name, symbol, messageHash, this.extend (params, authentication));
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchMyTradesForSymbols (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinbasepro#watchMyTradesForSymbols
         * @description watches information on multiple trades made by the user
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        symbols = this.marketSymbols (symbols, undefined, false);
        await this.loadMarkets ();
        const name = 'user';
        const messageHash = 'myTrades';
        const authentication = this.authenticate ();
        const trades = await this.subscribeMultiple (name, symbols, messageHash, this.extend (params, authentication));
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrdersForSymbols (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinbasepro#watchOrdersForSymbols
         * @description watches information on multiple orders made by the user
         * @param {string[]} symbols unified symbol of the market to fetch orders for
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const name = 'user';
        const messageHash = 'orders';
        const authentication = this.authenticate ();
        const orders = await this.subscribeMultiple (name, symbols, messageHash, this.extend (params, authentication));
        if (this.newUpdates) {
            const first = this.safeValue (orders, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = orders.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinbasepro#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new BadSymbol (this.id + ' watchMyTrades requires a symbol');
        }
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const name = 'user';
        const messageHash = 'orders';
        const authentication = this.authenticate ();
        const orders = await this.subscribe (name, symbol, messageHash, this.extend (params, authentication));
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinbasepro#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new BadRequest (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        const name = 'level2';
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const marketIds = this.marketIds (symbols);
        const messageHashes = [];
        for (let i = 0; i < symbolsLength; i++) {
            const marketId = marketIds[i];
            messageHashes.push (name + ':' + marketId);
        }
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'subscribe',
            'product_ids': marketIds,
            'channels': [
                name,
            ],
        };
        const request = this.extend (subscribe, params);
        const subscription = {
            'messageHash': name,
            'symbols': symbols,
            'marketIds': marketIds,
            'limit': limit,
        };
        const authentication = this.authenticate ();
        const orderbook = await this.watchMultiple (url, messageHashes, this.extend (request, authentication), messageHashes, subscription);
        return orderbook.limit ();
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinbasepro#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const name = 'level2';
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'subscribe',
            'product_ids': [
                market['id'],
            ],
            'channels': [
                name,
            ],
        };
        const request = this.extend (subscribe, params);
        const subscription = {
            'messageHash': messageHash,
            'symbol': symbol,
            'marketId': market['id'],
            'limit': limit,
        };
        const authentication = this.authenticate ();
        const orderbook = await this.watch (url, messageHash, this.extend (request, authentication), messageHash, subscription);
        return orderbook.limit ();
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "type": "match",
        //         "trade_id": 82047307,
        //         "maker_order_id": "0f358725-2134-435e-be11-753912a326e0",
        //         "taker_order_id": "252b7002-87a3-425c-ac73-f5b9e23f3caf",
        //         "side": "sell",
        //         "size": "0.00513192",
        //         "price": "9314.78",
        //         "product_id": "BTC-USD",
        //         "sequence": 12038915443,
        //         "time": "2020-01-31T20:03:41.158814Z"
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const trade = this.parseWsTrade (message);
            const symbol = trade['symbol'];
            // the exchange sends type = 'match'
            // but requires 'matches' upon subscribing
            // therefore we resolve 'matches' here instead of 'match'
            const type = 'matches';
            const messageHash = type + ':' + marketId;
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (tradesLimit);
                this.trades[symbol] = tradesArray;
            }
            tradesArray.append (trade);
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    handleMyTrade (client: Client, message) {
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const trade = this.parseWsTrade (message);
            const type = 'myTrades';
            const messageHash = type + ':' + marketId;
            let tradesArray = this.myTrades;
            if (tradesArray === undefined) {
                const limit = this.safeInteger (this.options, 'myTradesLimit', 1000);
                tradesArray = new ArrayCacheBySymbolById (limit);
                this.myTrades = tradesArray;
            }
            tradesArray.append (trade);
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    parseWsTrade (trade, market = undefined) {
        //
        // private trades
        // {
        //     "type": "match",
        //     "trade_id": 10,
        //     "sequence": 50,
        //     "maker_order_id": "ac928c66-ca53-498f-9c13-a110027a60e8",
        //     "taker_order_id": "132fb6ae-456b-4654-b4e0-d681ac05cea1",
        //     "time": "2014-11-07T08:19:27.028459Z",
        //     "product_id": "BTC-USD",
        //     "size": "5.23512",
        //     "price": "400.23",
        //     "side": "sell",
        //     "taker_user_id: "5844eceecf7e803e259d0365",
        //     "user_id": "5844eceecf7e803e259d0365",
        //     "taker_profile_id": "765d1549-9660-4be2-97d4-fa2d65fa3352",
        //     "profile_id": "765d1549-9660-4be2-97d4-fa2d65fa3352",
        //     "taker_fee_rate": "0.005"
        // }
        //
        // {
        //     "type": "match",
        //     "trade_id": 10,
        //     "sequence": 50,
        //     "maker_order_id": "ac928c66-ca53-498f-9c13-a110027a60e8",
        //     "taker_order_id": "132fb6ae-456b-4654-b4e0-d681ac05cea1",
        //     "time": "2014-11-07T08:19:27.028459Z",
        //     "product_id": "BTC-USD",
        //     "size": "5.23512",
        //     "price": "400.23",
        //     "side": "sell",
        //     "maker_user_id: "5844eceecf7e803e259d0365",
        //     "maker_id": "5844eceecf7e803e259d0365",
        //     "maker_profile_id": "765d1549-9660-4be2-97d4-fa2d65fa3352",
        //     "profile_id": "765d1549-9660-4be2-97d4-fa2d65fa3352",
        //     "maker_fee_rate": "0.001"
        // }
        //
        // public trades
        // {
        //     "type": "received",
        //     "time": "2014-11-07T08:19:27.028459Z",
        //     "product_id": "BTC-USD",
        //     "sequence": 10,
        //     "order_id": "d50ec984-77a8-460a-b958-66f114b0de9b",
        //     "size": "1.34",
        //     "price": "502.1",
        //     "side": "buy",
        //     "order_type": "limit"
        // }
        const parsed = super.parseTrade (trade);
        let feeRate = undefined;
        let isMaker = false;
        if ('maker_fee_rate' in trade) {
            isMaker = true;
            parsed['takerOrMaker'] = 'maker';
            feeRate = this.safeNumber (trade, 'maker_fee_rate');
        } else {
            parsed['takerOrMaker'] = 'taker';
            feeRate = this.safeNumber (trade, 'taker_fee_rate');
            // side always represents the maker side of the trade
            // so if we're taker, we invert it
            const currentSide = parsed['side'];
            parsed['side'] = this.safeString ({
                'buy': 'sell',
                'sell': 'buy',
            }, currentSide, currentSide);
        }
        const idKey = isMaker ? 'maker_order_id' : 'taker_order_id';
        parsed['order'] = this.safeString (trade, idKey);
        market = this.market (parsed['symbol']);
        const feeCurrency = market['quote'];
        let feeCost = undefined;
        if ((parsed['cost'] !== undefined) && (feeRate !== undefined)) {
            const cost = this.safeNumber (parsed, 'cost');
            feeCost = cost * feeRate;
        }
        parsed['fee'] = {
            'rate': feeRate,
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return parsed;
    }

    parseWsOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, 'open');
    }

    handleOrder (client: Client, message) {
        //
        // Order is created
        //
        //     {
        //         "type": "received",
        //         "side": "sell",
        //         "product_id": "BTC-USDC",
        //         "time": "2021-03-05T16:42:21.878177Z",
        //         "sequence": 5641953814,
        //         "profile_id": "774ee0ce-fdda-405f-aa8d-47189a14ba0a",
        //         "user_id": "54fc141576dcf32596000133",
        //         "order_id": "11838707-bf9c-4d65-8cec-b57c9a7cab42",
        //         "order_type": "limit",
        //         "size": "0.0001",
        //         "price": "50000",
        //         "client_oid": "a317abb9-2b30-4370-ebfe-0deecb300180"
        //     }
        //
        //     {
        //         "type": "received",
        //         "time": "2014-11-09T08:19:27.028459Z",
        //         "product_id": "BTC-USD",
        //         "sequence": 12,
        //         "order_id": "dddec984-77a8-460a-b958-66f114b0de9b",
        //         "funds": "3000.234",
        //         "side": "buy",
        //         "order_type": "market"
        //     }
        //
        // Order is on the order book
        //
        //     {
        //         "type": "open",
        //         "side": "sell",
        //         "product_id": "BTC-USDC",
        //         "time": "2021-03-05T16:42:21.878177Z",
        //         "sequence": 5641953815,
        //         "profile_id": "774ee0ce-fdda-405f-aa8d-47189a14ba0a",
        //         "user_id": "54fc141576dcf32596000133",
        //         "price": "50000",
        //         "order_id": "11838707-bf9c-4d65-8cec-b57c9a7cab42",
        //         "remaining_size": "0.0001"
        //     }
        //
        // Order is partially or completely filled
        //
        //     {
        //         "type": "match",
        //         "side": "sell",
        //         "product_id": "BTC-USDC",
        //         "time": "2021-03-05T16:37:13.396107Z",
        //         "sequence": 5641897876,
        //         "profile_id": "774ee0ce-fdda-405f-aa8d-47189a14ba0a",
        //         "user_id": "54fc141576dcf32596000133",
        //         "trade_id": 5455505,
        //         "maker_order_id": "e5f5754d-70a3-4346-95a6-209bcb503629",
        //         "taker_order_id": "88bf7086-7b15-40ff-8b19-ab4e08516d69",
        //         "size": "0.00021019",
        //         "price": "47338.46",
        //         "taker_profile_id": "774ee0ce-fdda-405f-aa8d-47189a14ba0a",
        //         "taker_user_id": "54fc141576dcf32596000133",
        //         "taker_fee_rate": "0.005"
        //     }
        //
        // Order is canceled / closed
        //
        //     {
        //         "type": "done",
        //         "side": "buy",
        //         "product_id": "BTC-USDC",
        //         "time": "2021-03-05T16:37:13.396107Z",
        //         "sequence": 5641897877,
        //         "profile_id": "774ee0ce-fdda-405f-aa8d-47189a14ba0a",
        //         "user_id": "54fc141576dcf32596000133",
        //         "order_id": "88bf7086-7b15-40ff-8b19-ab4e08516d69",
        //         "reason": "filled"
        //     }
        //
        let currentOrders = this.orders;
        if (currentOrders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            currentOrders = new ArrayCacheBySymbolById (limit);
            this.orders = currentOrders;
        }
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const messageHash = 'orders:' + marketId;
            const symbol = this.safeSymbol (marketId);
            const orderId = this.safeString (message, 'order_id');
            const makerOrderId = this.safeString (message, 'maker_order_id');
            const takerOrderId = this.safeString (message, 'taker_order_id');
            const orders = this.orders;
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            let previousOrder = this.safeValue (previousOrders, orderId);
            if (previousOrder === undefined) {
                previousOrder = this.safeValue2 (previousOrders, makerOrderId, takerOrderId);
            }
            if (previousOrder === undefined) {
                const parsed = this.parseWsOrder (message);
                orders.append (parsed);
                client.resolve (orders, messageHash);
            } else {
                const sequence = this.safeInteger (message, 'sequence');
                const previousInfo = this.safeValue (previousOrder, 'info', {});
                const previousSequence = this.safeInteger (previousInfo, 'sequence');
                if ((previousSequence === undefined) || (sequence > previousSequence)) {
                    if (type === 'match') {
                        const trade = this.parseWsTrade (message);
                        if (previousOrder['trades'] === undefined) {
                            previousOrder['trades'] = [];
                        }
                        previousOrder['trades'].push (trade);
                        previousOrder['lastTradeTimestamp'] = trade['timestamp'];
                        let totalCost = 0;
                        let totalAmount = 0;
                        const trades = previousOrder['trades'];
                        for (let i = 0; i < trades.length; i++) {
                            const tradeEntry = trades[i];
                            totalCost = this.sum (totalCost, tradeEntry['cost']);
                            totalAmount = this.sum (totalAmount, tradeEntry['amount']);
                        }
                        if (totalAmount > 0) {
                            previousOrder['average'] = totalCost / totalAmount;
                        }
                        previousOrder['cost'] = totalCost;
                        if (previousOrder['filled'] !== undefined) {
                            previousOrder['filled'] += trade['amount'];
                            if (previousOrder['amount'] !== undefined) {
                                previousOrder['remaining'] = previousOrder['amount'] - previousOrder['filled'];
                            }
                        }
                        if (previousOrder['fee'] === undefined) {
                            previousOrder['fee'] = {
                                'cost': 0,
                                'currency': trade['fee']['currency'],
                            };
                        }
                        if ((previousOrder['fee']['cost'] !== undefined) && (trade['fee']['cost'] !== undefined)) {
                            previousOrder['fee']['cost'] = this.sum (previousOrder['fee']['cost'], trade['fee']['cost']);
                        }
                        // update the newUpdates count
                        orders.append (previousOrder);
                        client.resolve (orders, messageHash);
                    } else if ((type === 'received') || (type === 'done')) {
                        const info = this.extend (previousOrder['info'], message);
                        const order = this.parseWsOrder (info);
                        const keys = Object.keys (order);
                        // update the reference
                        for (let i = 0; i < keys.length; i++) {
                            const key = keys[i];
                            if (order[key] !== undefined) {
                                previousOrder[key] = order[key];
                            }
                        }
                        // update the newUpdates count
                        orders.append (previousOrder);
                        client.resolve (orders, messageHash);
                    }
                }
            }
        }
    }

    parseWsOrder (order, market = undefined) {
        const id = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_oid');
        const marketId = this.safeString (order, 'product_id');
        const symbol = this.safeSymbol (marketId);
        const side = this.safeString (order, 'side');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber2 (order, 'size', 'funds');
        const time = this.safeString (order, 'time');
        const timestamp = this.parse8601 (time);
        const reason = this.safeString (order, 'reason');
        const status = this.parseWsOrderStatus (reason);
        const orderType = this.safeString (order, 'order_type');
        let remaining = this.safeNumber (order, 'remaining_size');
        const type = this.safeString (order, 'type');
        let filled = undefined;
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = amount - remaining;
        } else if (type === 'received') {
            filled = 0;
            if (amount !== undefined) {
                remaining = amount - filled;
            }
        }
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        });
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "type": "ticker",
        //         "sequence": 12042642428,
        //         "product_id": "BTC-USD",
        //         "price": "9380.55",
        //         "open_24h": "9450.81000000",
        //         "volume_24h": "9611.79166047",
        //         "low_24h": "9195.49000000",
        //         "high_24h": "9475.19000000",
        //         "volume_30d": "327812.00311873",
        //         "best_bid": "9380.54",
        //         "best_ask": "9380.55",
        //         "side": "buy",
        //         "time": "2020-02-01T01:40:16.253563Z",
        //         "trade_id": 82062566,
        //         "last_size": "0.41969131"
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const ticker = this.parseTicker (message);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = 'ticker:' + symbol;
            const idMessageHash = 'ticker:' + marketId;
            client.resolve (ticker, messageHash);
            client.resolve (ticker, idMessageHash);
        }
        return message;
    }

    parseTicker (ticker, market = undefined): Ticker {
        //
        //     {
        //         "type": "ticker",
        //         "sequence": 7388547310,
        //         "product_id": "BTC-USDT",
        //         "price": "22345.67",
        //         "open_24h": "22308.13",
        //         "volume_24h": "470.21123644",
        //         "low_24h": "22150",
        //         "high_24h": "22495.15",
        //         "volume_30d": "25713.98401605",
        //         "best_bid": "22345.67",
        //         "best_bid_size": "0.10647825",
        //         "best_ask": "22349.68",
        //         "best_ask_size": "0.03131702",
        //         "side": "sell",
        //         "time": "2023-03-04T03:37:20.799258Z",
        //         "trade_id": 11586478,
        //         "last_size": "0.00352175"
        //     }
        //
        const type = this.safeString (ticker, 'type');
        if (type === undefined) {
            return super.parseTicker (ticker, market);
        }
        const marketId = this.safeString (ticker, 'product_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const last = this.safeString (ticker, 'price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high_24h'),
            'low': this.safeString (ticker, 'low_24h'),
            'bid': this.safeString (ticker, 'best_bid'),
            'bidVolume': this.safeString (ticker, 'best_bid_size'),
            'ask': this.safeString (ticker, 'best_ask'),
            'askVolume': this.safeString (ticker, 'best_ask_size'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open_24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        });
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

    handleOrderBook (client: Client, message) {
        //
        // first message (snapshot)
        //
        //     {
        //         "type": "snapshot",
        //         "product_id": "BTC-USD",
        //         "bids": [
        //             ["10101.10", "0.45054140"]
        //         ],
        //         "asks": [
        //             ["10102.55", "0.57753524"]
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         "type": "l2update",
        //         "product_id": "BTC-USD",
        //         "time": "2019-08-14T20:42:27.265Z",
        //         "changes": [
        //             [ "buy", "10101.80000000", "0.162567" ]
        //         ]
        //     }
        //
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'level2';
        const messageHash = name + ':' + marketId;
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        if (type === 'snapshot') {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            const orderbook = this.orderbooks[symbol];
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
            orderbook['timestamp'] = undefined;
            orderbook['datetime'] = undefined;
            orderbook['symbol'] = symbol;
            client.resolve (orderbook, messageHash);
        } else if (type === 'l2update') {
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.parse8601 (this.safeString (message, 'time'));
            const changes = this.safeValue (message, 'changes', []);
            const sides = {
                'sell': 'asks',
                'buy': 'bids',
            };
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                const key = this.safeString (change, 0);
                const side = this.safeString (sides, key);
                const price = this.safeNumber (change, 1);
                const amount = this.safeNumber (change, 2);
                const bookside = orderbook[side];
                bookside.store (price, amount);
            }
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, messageHash);
        }
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "type": "subscriptions",
        //         "channels": [
        //             {
        //                 "name": "level2",
        //                 "product_ids": [ "ETH-BTC" ]
        //             }
        //         ]
        //     }
        //
        return message;
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "type": "error",
        //         "message": "error message",
        //         /* ... */
        //     }
        //
        // auth error
        //
        //     {
        //         "type": "error",
        //         "message": "Authentication Failed",
        //         "reason": "{"message":"Invalid API Key"}"
        //     }
        //
        const errMsg = this.safeString (message, 'message');
        const reason = this.safeString (message, 'reason');
        try {
            if (errMsg === 'Authentication Failed') {
                throw new AuthenticationError ('Authentication failed: ' + reason);
            } else {
                throw new ExchangeError (this.id + ' ' + reason);
            }
        } catch (error) {
            client.reject (error);
            return true;
        }
    }

    handleMessage (client: Client, message) {
        const type = this.safeString (message, 'type');
        const methods = {
            'snapshot': this.handleOrderBook,
            'l2update': this.handleOrderBook,
            'subscribe': this.handleSubscriptionStatus,
            'ticker': this.handleTicker,
            'received': this.handleOrder,
            'open': this.handleOrder,
            'change': this.handleOrder,
            'done': this.handleOrder,
            'error': this.handleErrorMessage,
        };
        const length = client.url.length - 0;
        const authenticated = client.url[length - 1] === '?';
        const method = this.safeValue (methods, type);
        if (method === undefined) {
            if (type === 'match') {
                if (authenticated) {
                    this.handleMyTrade (client, message);
                    this.handleOrder (client, message);
                } else {
                    this.handleTrade (client, message);
                }
            }
        } else {
            return method.call (this, client, message);
        }
    }
}

