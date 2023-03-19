'use strict';

//  ---------------------------------------------------------------------------

import coinbaseRest from '../coinbase.js';
import { BadSymbol } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class coinbase extends coinbaseRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchBalance': false,
                'watchStatus': true,
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://advanced-trade-ws.coinbase.com',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
            },
        });
    }

    timestampAndSign (message, channel, products = []) {
        this.checkRequiredCredentials ();
        // const signature = this.hmac (this.encode (payload), this.base64ToBinary (this.secret), 'sha256', 'base64');
        const timestamp = Math.floor (Date.now () / 1000).toString ();
        const auth = `${timestamp}${channel}${products.join (',')}`;
        const sig = this.hmac (this.encode (auth), this.encode (this.secret));
        return {
            'message': message,
            'signature': sig,
            'timestamp': timestamp,
            'api_key': this.apiKey,
        };
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials ();
            const nonce = this.seconds ().toString ();
            const auth = nonce + this.apiKey;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            const request = {
                'e': 'auth',
                'auth': {
                    'key': this.apiKey,
                    'signature': signature.toUpperCase (),
                    'timestamp': nonce,
                },
            };
            await this.watch (url, messageHash, this.extend (request, params), messageHash);
        }
        return await future;
    }

    async subscribe (name, symbol, messageHashStart, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = undefined;
        let productIds = [];
        if (Array.isArray (symbol)) {
            const symbols = this.marketSymbols (symbol);
            const marketIds = this.marketIds (symbols);
            messageHash = messageHashStart + ':';
            productIds = marketIds;
        } else {
            market = this.market (symbol);
            messageHash = messageHashStart + ':' + market['id'];
            productIds = [ market['id'] ];
        }
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'subscribe',
            'product_ids': productIds,
            'channel': name,
        };
        const authentication = this.timestampAndSign ('subscribe', name, productIds);
        const authedParams = this.extend (authentication, params);
        const request = this.extend (subscribe, authedParams);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name coinbasepro#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#ticker-channel
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the coinbasepro api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'ticker';
        return await this.subscribe (name, symbol, name, params);
    }

    async watchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name coinbasepro#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#ticker-batch-channel
         * @param {[string]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the coinbasepro api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'ticker_batch';
        const tickers = await this.subscribe (name, symbols, name, params);
        return tickers;
        // todo: like binance
        // const result = {};
        // for (let i = 0; i < tickers.length; i++) {
        //     const ticker = tickers[i];
        //     const tickerSymbol = ticker['symbol'];
        //     if (symbols === undefined || this.inArray (tickerSymbol, symbols)) {
        //         result[tickerSymbol] = ticker;
        //     }
        // }
        // const resultKeys = Object.keys (result);
        // const resultKeysLength = resultKeys.length;
        // if (resultKeysLength > 0) {
        //     if (this.newUpdates) {
        //         return result;
        //     }
        //     return this.filterByArray (this.tickers, 'symbol', symbols);
        // }
        // return await this.watchTickers (symbols, oriParams);
    }

    handleTicker (client, message) {
        //
        //    {
        //        "channel": "ticker",
        //        "client_id": "",
        //        "timestamp": "2023-03-01T12:16:31.714675066Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "tickers": [
        //                    {
        //                        "type": "ticker",
        //                        "product_id": "DOGE-USD",
        //                        "price": "0.08211",
        //                        "volume_24_h": "242625971.7",
        //                        "low_24_h": "0.07989",
        //                        "high_24_h": "0.08308",
        //                        "low_52_w": "0.04908",
        //                        "high_52_w": "0.1801",
        //                        "price_percent_chg_24_h": "0.47723935389134"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        const channel = this.safeString (message, 'channel');
        this.parseRawTickersHelper (client, message, channel);
    }

    handleTickers (client, message) {
        //
        //    {
        //        "channel": "ticker_batch",
        //        "client_id": "",
        //        "timestamp": "2023-03-01T12:15:18.382173051Z",
        //        "sequence_num": 0,
        //        "events": [
        //            {
        //                "type": "snapshot",
        //                "tickers": [
        //                    {
        //                        "type": "ticker",
        //                        "product_id": "DOGE-USD",
        //                        "price": "0.08212",
        //                        "volume_24_h": "242556423.3",
        //                        "low_24_h": "0.07989",
        //                        "high_24_h": "0.08308",
        //                        "low_52_w": "0.04908",
        //                        "high_52_w": "0.1801",
        //                        "price_percent_chg_24_h": "0.50177456859626"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        const channel = this.safeString (message, 'channel');
        this.parseRawTickersHelper (client, message, channel);
        client.resolve (Object.values (this.tickers), channel + ':');
    }

    parseRawTickersHelper (client, message, channel) {
        const events = this.safeValue (message, 'events', []);
        for (let i = 0; i < events.length; i++) {
            const tickersObj = events[i];
            const tickers = this.safeValue (tickersObj, 'tickers', []);
            for (let j = 0; j < tickers.length; j++) {
                const ticker = tickers[j];
                const result = this.parseWsTicker (ticker);
                const symbol = result['symbol'];
                this.tickers[symbol] = result;
                const wsMarketId = this.safeString (ticker, 'product_id');
                const messageHash = channel + ':' + wsMarketId;
                client.resolve (result, messageHash);
            }
        }
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         "type": "ticker",
        //         "product_id": "DOGE-USD",
        //         "price": "0.08212",
        //         "volume_24_h": "242556423.3",
        //         "low_24_h": "0.07989",
        //         "high_24_h": "0.08308",
        //         "low_52_w": "0.04908",
        //         "high_52_w": "0.1801",
        //         "price_percent_chg_24_h": "0.50177456859626"
        //     }
        //
        const type = this.safeString (ticker, 'type');
        if (type === undefined) {
            return super.parseTicker (ticker, market);
        }
        const marketId = this.safeString (ticker, 'product_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = undefined;
        const last = this.safeNumber (ticker, 'price');
        return {
            'info': ticker,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high_24_h'),
            'low': this.safeNumber (ticker, 'low_24_h'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume_24_h'),
            'quoteVolume': undefined,
        };
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinbasepro#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#market-trades-channel
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the coinbasepro api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const name = 'market_trades';
        const trades = await this.subscribe (name, symbol, name, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinbasepro#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#user-channel
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the coinbasepro api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
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

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinbasepro#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#level2-channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the coinbasepro api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
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
        const orderbook = await this.watch (url, messageHash, request, messageHash, subscription);
        return orderbook.limit ();
    }

    handleTrade (client, message) {
        //
        //     {
        //         type: 'match',
        //         trade_id: 82047307,
        //         maker_order_id: '0f358725-2134-435e-be11-753912a326e0',
        //         taker_order_id: '252b7002-87a3-425c-ac73-f5b9e23f3caf',
        //         side: 'sell',
        //         size: '0.00513192',
        //         price: '9314.78',
        //         product_id: 'BTC-USD',
        //         sequence: 12038915443,
        //         time: '2020-01-31T20:03:41.158814Z'
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

    handleMyTrade (client, message) {
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

    parseWsTrade (trade) {
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
        if ('maker_fee_rate' in trade) {
            parsed['takerOrMaker'] = 'maker';
            feeRate = this.safeNumber (trade, 'maker_fee_rate');
        } else {
            parsed['takerOrMaker'] = 'taker';
            feeRate = this.safeNumber (trade, 'taker_fee_rate');
        }
        const market = this.market (parsed['symbol']);
        const feeCurrency = market['quote'];
        let feeCost = undefined;
        if ((parsed['cost'] !== undefined) && (feeRate !== undefined)) {
            feeCost = parsed['cost'] * feeRate;
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

    handleOrder (client, message) {
        //
        // Order is created
        //
        //     {
        //         type: 'received',
        //         side: 'sell',
        //         product_id: 'BTC-USDC',
        //         time: '2021-03-05T16:42:21.878177Z',
        //         sequence: 5641953814,
        //         profile_id: '774ee0ce-fdda-405f-aa8d-47189a14ba0a',
        //         user_id: '54fc141576dcf32596000133',
        //         order_id: '11838707-bf9c-4d65-8cec-b57c9a7cab42',
        //         order_type: 'limit',
        //         size: '0.0001',
        //         price: '50000',
        //         client_oid: 'a317abb9-2b30-4370-ebfe-0deecb300180'
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
        //         type: 'open',
        //         side: 'sell',
        //         product_id: 'BTC-USDC',
        //         time: '2021-03-05T16:42:21.878177Z',
        //         sequence: 5641953815,
        //         profile_id: '774ee0ce-fdda-405f-aa8d-47189a14ba0a',
        //         user_id: '54fc141576dcf32596000133',
        //         price: '50000',
        //         order_id: '11838707-bf9c-4d65-8cec-b57c9a7cab42',
        //         remaining_size: '0.0001'
        //     }
        //
        // Order is partially or completely filled
        //
        //     {
        //         type: 'match',
        //         side: 'sell',
        //         product_id: 'BTC-USDC',
        //         time: '2021-03-05T16:37:13.396107Z',
        //         sequence: 5641897876,
        //         profile_id: '774ee0ce-fdda-405f-aa8d-47189a14ba0a',
        //         user_id: '54fc141576dcf32596000133',
        //         trade_id: 5455505,
        //         maker_order_id: 'e5f5754d-70a3-4346-95a6-209bcb503629',
        //         taker_order_id: '88bf7086-7b15-40ff-8b19-ab4e08516d69',
        //         size: '0.00021019',
        //         price: '47338.46',
        //         taker_profile_id: '774ee0ce-fdda-405f-aa8d-47189a14ba0a',
        //         taker_user_id: '54fc141576dcf32596000133',
        //         taker_fee_rate: '0.005'
        //     }
        //
        // Order is canceled / closed
        //
        //     {
        //         type: 'done',
        //         side: 'buy',
        //         product_id: 'BTC-USDC',
        //         time: '2021-03-05T16:37:13.396107Z',
        //         sequence: 5641897877,
        //         profile_id: '774ee0ce-fdda-405f-aa8d-47189a14ba0a',
        //         user_id: '54fc141576dcf32596000133',
        //         order_id: '88bf7086-7b15-40ff-8b19-ab4e08516d69',
        //         reason: 'filled'
        //     }
        //
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
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
                            const trade = trades[i];
                            totalCost = this.sum (totalCost, trade['cost']);
                            totalAmount = this.sum (totalAmount, trade['amount']);
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

    parseWsOrder (order) {
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
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        return {
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
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
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

    handleOrderBook (client, message) {
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

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         type: 'subscriptions',
        //         channels: [
        //             {
        //                 name: 'level2',
        //                 product_ids: [ 'ETH-BTC' ]
        //             }
        //         ]
        //     }
        //
        return message;
    }

    handleMessage (client, message) {
        const channel = this.safeString (message, 'channel');
        const methods = {
            // 'snapshot': this.handleOrderBook,
            // 'l2update': this.handleOrderBook,
            'subscriptions': this.handleSubscriptionStatus,
            'ticker': this.handleTicker,
            'ticker_batch': this.handleTickers,
        };
        const method = this.safeValue (methods, channel);
        return method.call (this, client, message);
    }
}
