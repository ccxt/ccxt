//  ---------------------------------------------------------------------------

import lunoRest from '../luno.js';
import { ArrayCache } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { InvalidNonce } from '../base/errors.js';
import type { Int, Trade, OrderBook, IndexType, Dict , Market } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class luno extends lunoRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchMyTrades': false,
                'watchOrders': undefined, // is in beta
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.luno.com/api/1',
                },
            },
            'options': {
                'sequenceNumbers': {},
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    /**
     * @method
     * @name luno#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.luno.com/en/developers/api#tag/Streaming-API
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of    trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        this.checkRequiredCredentials ();
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const subscription: Dict = { 'symbol': symbol };
        const url = this.urls['api']['ws'] + subscriptionHash;
        const messageHash = 'trades:' + symbol;
        const subscribe: Dict = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, subscriptionHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message: any, subscription: any) {
        //
        //     {
        //         "sequence": "110980825",
        //         "trade_updates": [],
        //         "create_update": {
        //             "order_id": "BXHSYXAUMH8C2RW",
        //             "type": "ASK",
        //             "price": "24081.09000000",
        //             "volume": "0.07780000"
        //         },
        //         "delete_update": null,
        //         "status_update": null,
        //         "timestamp": 1660598775360
        //     }
        //
        const rawTrades = this.safeList (message, 'trade_updates', []);
        const length = rawTrades.length;
        if (length === 0) {
            return;
        }
        const symbol = subscription['symbol'];
        const market = this.market (symbol);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const trade = this.parseTrade (rawTrade, market);
            stored.append (trade);
        }
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    override parseTrade (trade: any, market: Market = undefined): Trade {
        //
        // watchTrades (public)
        //
        //     {
        //       "base": "69.00000000",
        //       "counter": "113.6499000000000000",
        //       "maker_order_id": "BXEEU4S2BWF5WRB",
        //       "taker_order_id": "BXKNCSF7JDHXY3H",
        //       "order_id": "BXEEU4S2BWF5WRB"
        //     }
        //
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            // takerOrMaker has no meaning for public trades
            'takerOrMaker': undefined,
            'price': undefined,
            'amount': this.safeString (trade, 'base'),
            'cost': this.safeString (trade, 'counter'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name luno#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.luno.com/en/developers/api#tag/Streaming-API
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {objectConstructor} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] accepts l2 or l3 for level 2 or level 3 order book
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        this.checkRequiredCredentials ();
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const subscription: Dict = { 'symbol': symbol };
        const url = this.urls['api']['ws'] + subscriptionHash;
        const messageHash = 'orderbook:' + symbol;
        const subscribe: Dict = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, subscriptionHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: any, subscription: any) {
        //
        //     {
        //         "sequence": "24352",
        //         "asks": [{
        //             "id": "BXMC2CJ7HNB88U4",
        //             "price": "1234.00",
        //             "volume": "0.93"
        //         }],
        //         "bids": [{
        //             "id": "BXMC2CJ7HNB88U5",
        //             "price": "1201.00",
        //             "volume": "1.22"
        //         }],
        //         "status": "ACTIVE",
        //         "timestamp": 1528884331021
        //     }
        //
        //  update
        //     {
        //         "sequence": "110980825",
        //         "trade_updates": [],
        //         "create_update": {
        //             "order_id": "BXHSYXAUMH8C2RW",
        //             "type": "ASK",
        //             "price": "24081.09000000",
        //             "volume": "0.07780000"
        //         },
        //         "delete_update": null,
        //         "status_update": null,
        //         "timestamp": 1660598775360
        //     }
        //
        const symbol = subscription['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (message, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.indexedOrderBook ({});
        }
        const asks = this.safeValue (message, 'asks');
        if (asks !== undefined) {
            const snapshot = this.customParseOrderBook (message, symbol, timestamp, 'bids', 'asks', 'price', 'volume', 'id');
            this.orderbooks[symbol] = this.indexedOrderBook (snapshot);
        } else {
            const ob = this.orderbooks[symbol];
            const messageSequence = this.safeInteger (message, 'sequence');
            const storedNonce = this.safeInteger (ob, 'nonce');
            if (storedNonce === undefined) {
                // no snapshot was received yet, deltas cannot be applied to an
                // empty book: luno sends the snapshot as the first frame after
                // the handshake, so discard the delta
                return;
            }
            if (messageSequence !== undefined) {
                if (messageSequence <= storedNonce) {
                    // an old or replayed frame, discard it
                    return;
                }
                const expectedSequence = storedNonce + 1;
                if (messageSequence !== expectedSequence) {
                    // a gap in the sequence means a lost message and the book is
                    // unrecoverable on a live connection, because luno only sends
                    // a snapshot as the first frame after a fresh handshake:
                    // reject every pending future on this connection and drop
                    // both the client and the cached book, so that the next
                    // watch call dials a new connection and rebuilds from a
                    // fresh snapshot
                    const error = new InvalidNonce (this.id + ' watchOrderBook() received an out-of-sequence update for ' + symbol + ', expected ' + expectedSequence.toString () + ' but got ' + messageSequence.toString ());
                    delete this.orderbooks[symbol];
                    client.reject (error);
                    delete this.clients[client.url];
                    return;
                }
            }
            this.handleDelta (ob, message);
            ob['timestamp'] = timestamp;
            ob['datetime'] = this.iso8601 (timestamp);
        }
        const orderbook = this.orderbooks[symbol];
        const nonce = this.safeInteger (message, 'sequence');
        orderbook['nonce'] = nonce;
        client.resolve (orderbook, messageHash);
    }

    customParseOrderBook (orderbook: any, symbol: any, timestamp: Int = undefined, bidsKey = 'bids', asksKey: IndexType = 'asks', priceKey: IndexType = 'price', amountKey: IndexType = 'volume', countOrIdKey: IndexType = 2) {
        const bids = this.parseOrderBookBidsAsks (this.safeValue (orderbook, bidsKey, []), priceKey, amountKey, countOrIdKey);
        const asks = this.parseOrderBookBidsAsks (this.safeValue (orderbook, asksKey, []), priceKey, amountKey, countOrIdKey);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    override parseOrderBookBidsAsks (bidasks: any, priceKey: IndexType = 'price', amountKey: IndexType = 'volume', thirdKey: IndexType = 2) {
        bidasks = this.toArray (bidasks);
        const result: any[] = [];
        for (let i = 0; i < bidasks.length; i++) {
            result.push (this.customParseBidAsk (bidasks[i], priceKey, amountKey, thirdKey));
        }
        return result;
    }

    customParseBidAsk (bidask: any, priceKey: IndexType = 'price', amountKey: IndexType = 'volume', thirdKey: IndexType = 2) {
        const price = this.safeNumber (bidask, priceKey);
        const amount = this.safeNumber (bidask, amountKey);
        const result = [ price, amount ];
        if (thirdKey !== undefined) {
            const thirdValue = this.safeString (bidask, thirdKey) as any;
            result.push (thirdValue);
        }
        return result;
    }

    override handleDelta (orderbook: any, message: any) {
        //
        //  create
        //     {
        //         "sequence": "110980825",
        //         "trade_updates": [],
        //         "create_update": {
        //             "order_id": "BXHSYXAUMH8C2RW",
        //             "type": "ASK",
        //             "price": "24081.09000000",
        //             "volume": "0.07780000"
        //         },
        //         "delete_update": null,
        //         "status_update": null,
        //         "timestamp": 1660598775360
        //     }
        //  delete
        //     {
        //         "sequence": "110980825",
        //         "trade_updates": [],
        //         "create_update": null,
        //         "delete_update": {
        //             "order_id": "BXMC2CJ7HNB88U4"
        //         },
        //         "status_update": null,
        //         "timestamp": 1660598775360
        //     }
        //  trade
        //     {
        //         "sequence": "110980825",
        //         "trade_updates": [
        //             {
        //                 "base": "0.1",
        //                 "counter": "5232.00",
        //                 "maker_order_id": "BXMC2CJ7HNB88U4",
        //                 "taker_order_id": "BXMC2CJ7HNB88U5"
        //             }
        //         ],
        //         "create_update": null,
        //         "delete_update": null,
        //         "status_update": null,
        //         "timestamp": 1660598775360
        //     }
        //
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        // trade updates are applied first, matching the ordering of the
        // reference luno streaming client
        const tradeUpdates = this.safeList (message, 'trade_updates', []);
        for (let i = 0; i < tradeUpdates.length; i++) {
            const tradeUpdate = tradeUpdates[i];
            const makerOrderId = this.safeString (tradeUpdate, 'maker_order_id');
            const tradedAmount = this.safeString (tradeUpdate, 'base');
            if ((makerOrderId !== undefined) && (tradedAmount !== undefined)) {
                // the message does not carry the side of the maker order and
                // order ids are unique across the book, so try the bids first
                // and fall back to the asks only on a miss
                const reduced = this.reduceOrderVolume (bidsOrderSide, makerOrderId, tradedAmount);
                if (!reduced) {
                    this.reduceOrderVolume (asksOrderSide, makerOrderId, tradedAmount);
                }
            }
        }
        const createUpdate = this.safeValue (message, 'create_update');
        if (createUpdate !== undefined) {
            const bidAskArray = this.customParseBidAsk (createUpdate, 'price', 'volume', 'order_id');
            const type = this.safeString (createUpdate, 'type');
            if (type === 'ASK') {
                asksOrderSide.storeArray (bidAskArray);
            } else if (type === 'BID') {
                bidsOrderSide.storeArray (bidAskArray);
            }
        }
        const deleteUpdate = this.safeValue (message, 'delete_update');
        if (deleteUpdate !== undefined) {
            const orderId = this.safeString (deleteUpdate, 'order_id');
            asksOrderSide.storeArray ([ 0, 0, orderId ]);
            bidsOrderSide.storeArray ([ 0, 0, orderId ]);
        }
    }

    /**
     * @ignore
     * @method
     * @name luno#reduceOrderVolume
     * @description reduces the outstanding volume of the order with the given id inside one side of a level-3 orderbook after a trade, deleting the order when it is fully filled
     * @param {object} orderSide the bids or asks side of an indexed orderbook
     * @param {string} orderId the exchange-specific id of the maker order that traded
     * @param {string} tradedAmount the traded amount in base currency, as a string
     * @returns {boolean} true if the order was found in this side, false otherwise
     */
    reduceOrderVolume (orderSide: any, orderId: string, tradedAmount: string): boolean {
        const sideLength = orderSide.length;
        for (let i = 0; i < sideLength; i++) {
            const order = orderSide[i];
            const entryId = this.safeString (order, 2);
            if (entryId === orderId) {
                const price = this.safeNumber (order, 0);
                const currentAmount = this.safeString (order, 1);
                const remainingAmount = Precise.stringSub (currentAmount, tradedAmount);
                if (Precise.stringLe (remainingAmount, '0')) {
                    // fully filled, storing a zero amount deletes the order
                    orderSide.storeArray ([ price, 0, orderId ]);
                } else {
                    orderSide.storeArray ([ price, this.parseNumber (remainingAmount), orderId ]);
                }
                return true;
            }
        }
        return false;
    }

    override handleMessage (client: Client, message: any) {
        if (message === '') {
            return;
        }
        const subscriptions = Object.values (client.subscriptions);
        const subscriptionsLength = subscriptions.length;
        if (subscriptionsLength === 0) {
            // the subscription was dropped after a sequence gap, ignore the
            // frames still arriving until the client resubscribes
            return;
        }
        const handlers = [ this.handleOrderBook, this.handleTrades ];
        for (let j = 0; j < handlers.length; j++) {
            const handler = handlers[j];
            handler.call (this, client, message, subscriptions[0]);
        }
    }
}
