// ----------------------------------------------------------------------------

import vertexRest from '../vertex.js';
import { AuthenticationError, NotSupported } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { eddsa } from '../base/functions/crypto.js';
import { ed25519 } from '../static_dependencies/noble-curves/ed25519.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class vertex extends vertexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://gateway.prod.vertexprotocol.com/v1/subscribe',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://gateway.sepolia-test.vertexprotocol.com/v1/subscribe',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                // 'ping': this.ping,
                'keepAlive': 30000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }

    requestId (url) {
        const options = this.safeDict (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash, message) {
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId (url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name vertex#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trade';
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric (market['id']),
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "type": "trade",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "price": "1000", // price the trade happened at, multiplied by 1e18
        //     // both taker_qty and maker_qty have the same value;
        //     // set to filled amount (min amount of taker and maker) when matching against book
        //     // set to matched amm base amount when matching against amm
        //     "taker_qty": "1000",
        //     "maker_qty": "1000",
        //     "is_taker_buyer": true,
        //     "is_maker_amm": true // true when maker is amm
        // }
        //
        const topic = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        const trade = this.parseWsTrade (message);
        const symbol = trade['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append (trade);
        this.trades[symbol] = trades;
        client.resolve (trades, marketId + '@' + topic);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name vertex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'fill';
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric (market['id']),
                'subaccount': this.convertAddressToSender (this.walletAddress),
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message) {
        //
        // {
        //     "type": "fill",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     // the subaccount that placed this order
        //     "subaccount": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43746573743000000000000000",
        //     // hash of the order that uniquely identifies it
        //     "order_digest": "0xf4f7a8767faf0c7f72251a1f9e5da590f708fd9842bf8fcdeacbaa0237958fff",
        //     // the amount filled, multiplied by 1e18
        //     "filled_qty": "1000",
        //     // the amount outstanding unfilled, multiplied by 1e18
        //     "remaining_qty": "2000",
        //     // the original order amount, multiplied by 1e18
        //     "original_qty": "3000",
        //     // fill price
        //     "price": "24991000000000000000000",
        //     // true for `taker`, false for `maker`
        //     "is_taker": true,
        //     "is_bid": true,
        //     // true when matching against amm
        //     "is_against_amm": true,
        //     // an optional `order id` that can be provided when placing an order
        //     "id": 100
        // }
        //
        const topic = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const parsed = this.parseWsTrade (message);
        trades.append (parsed);
        client.resolve (trades, marketId + '@' + topic);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // watchTrades
        // {
        //     "type": "trade",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "price": "1000", // price the trade happened at, multiplied by 1e18
        //     // both taker_qty and maker_qty have the same value;
        //     // set to filled amount (min amount of taker and maker) when matching against book
        //     // set to matched amm base amount when matching against amm
        //     "taker_qty": "1000",
        //     "maker_qty": "1000",
        //     "is_taker_buyer": true,
        //     "is_maker_amm": true // true when maker is amm
        // }
        // watchMyTrades
        // {
        //     "type": "fill",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     // the subaccount that placed this order
        //     "subaccount": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43746573743000000000000000",
        //     // hash of the order that uniquely identifies it
        //     "order_digest": "0xf4f7a8767faf0c7f72251a1f9e5da590f708fd9842bf8fcdeacbaa0237958fff",
        //     // the amount filled, multiplied by 1e18
        //     "filled_qty": "1000",
        //     // the amount outstanding unfilled, multiplied by 1e18
        //     "remaining_qty": "2000",
        //     // the original order amount, multiplied by 1e18
        //     "original_qty": "3000",
        //     // fill price
        //     "price": "24991000000000000000000",
        //     // true for `taker`, false for `maker`
        //     "is_taker": true,
        //     "is_bid": true,
        //     // true when matching against amm
        //     "is_against_amm": true,
        //     // an optional `order id` that can be provided when placing an order
        //     "id": 100
        // }
        //
        const marketId = this.safeString (trade, 'product_id');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.convertFromX18 (this.safeString (trade, 'price'));
        const amount = this.convertFromX18 (this.safeString2 (trade, 'taker_qty', 'filled_qty'));
        const cost = Precise.stringMul (price, amount);
        const timestamp = Precise.stringDiv (this.safeString (trade, 'timestamp'), '1000000');
        let takerOrMaker = undefined;
        const isTaker = this.safeBool (trade, 'is_taker');
        if (isTaker !== undefined) {
            takerOrMaker = (isTaker) ? 'taker' : 'maker';
        }
        let side = undefined;
        const isBid = this.safeBool (trade, 'is_bid');
        if (isBid !== undefined) {
            side = (isBid) ? 'buy' : 'sell';
        }
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': this.safeString2 (trade, 'digest', 'id'),
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name vertex#watchTicker
         * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const name = 'best_bid_offer';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric (market['id']),
            },
        };
        const message = this.extend (request, params);
        return await this.watchPublic (topic, message);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // {
        //     "type": "best_bid_offer",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "bid_price": "1000", // the highest bid price, multiplied by 1e18
        //     "bid_qty": "1000", // quantity at the huighest bid, multiplied by 1e18. 
        //                        // i.e. if this is USDC with 6 decimals, one USDC 
        //                        // would be 1e12
        //     "ask_price": "1000", // lowest ask price
        //     "ask_qty": "1000" // quantity at the lowest ask
        // }
        //
        const timestamp = Precise.stringDiv (this.safeString (ticker, 'timestamp'), '1000000');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.convertFromX18 (this.safeString (ticker, 'bid_price')),
            'bidVolume': this.convertFromX18 (this.safeString (ticker, 'bid_qty')),
            'ask': this.convertFromX18 (this.safeString (ticker, 'ask_price')),
            'askVolume': this.convertFromX18 (this.safeString (ticker, 'ask_qty')),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //     "type": "best_bid_offer",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "bid_price": "1000", // the highest bid price, multiplied by 1e18
        //     "bid_qty": "1000", // quantity at the huighest bid, multiplied by 1e18. 
        //                        // i.e. if this is USDC with 6 decimals, one USDC 
        //                        // would be 1e12
        //     "ask_price": "1000", // lowest ask price
        //     "ask_qty": "1000" // quantity at the lowest ask
        // }
        //
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const ticker = this.parseWsTicker (message, market);
        ticker['symbol'] = market['symbol'];
        this.tickers[market['symbol']] = ticker;
        client.resolve (ticker, marketId + '@best_bid_offer');
        return message;
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name vertex#watchOrderBook
         * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const name = 'book_depth';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': name,
                'product_id': this.parseToNumeric (market['id']),
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchPublic (topic, message);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     "type":"book_depth",
        //     // book depth aggregates a number of events once every 50ms
        //     // these are the minimum and maximum timestamps from 
        //     // events that contributed to this response
        //     "min_timestamp": "1683805381879572835",
        //     "max_timestamp": "1683805381879572835",
        //     // the max_timestamp of the last book_depth event for this product
        //     "last_max_timestamp": "1683805381771464799",
        //     "product_id":1,
        //     // changes to the bid side of the book in the form of [[price, new_qty]]
        //     "bids":[["21594490000000000000000","51007390115411548"]],
        //     // changes to the ask side of the book in the form of [[price, new_qty]]
        //     "asks":[["21694490000000000000000","0"],["21695050000000000000000","0"]]
        // }
        //
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.parseToNumeric (Precise.stringDiv (this.safeString (message, 'last_max_timestamp'), '1000000'));
        // convert from X18
        const data = {
            'bids': [],
            'asks': [],
        }
        const bids = this.safeList (message, 'bids', []);
        for (let i = 0; i < bids.length; i++) {
            const bid = bids[i];
            data['bids'].push ([
                this.convertFromX18 (bid[0]),
                this.convertFromX18 (bid[1]),
            ]);
        }
        const asks = this.safeList (message, 'asks', []);
        for (let i = 0; i < asks.length; i++) {
            const ask = asks[i];
            data['asks'].push ([
                this.convertFromX18 (ask[0]),
                this.convertFromX18 (ask[1]),
            ]);
        }
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, marketId + '@book_depth');
    }

    handleErrorMessage (client: Client, message) {
        //
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool (message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString (message, 'errorMsg');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (error);
            }
            return true;
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods = {
            'trade': this.handleTrade,
            'best_bid_offer': this.handleTicker,
            'book_depth': this.handleOrderBook,
            'fill': this.handleMyTrades,
        };
        const event = this.safeString (message, 'type');
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
    }
}
