//  ---------------------------------------------------------------------------

import lunoRest from '../luno.js';
import { ExchangeError } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, Trade, OrderBook, IndexType, Dict, Market, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
import type { OrderBook as Ob } from '../base/ws/OrderBook.js';

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
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        this.checkRequiredCredentials ();
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const symbolValue: string = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const subscription: Dict = { 'symbol': symbolValue };
        const wsUrl = this.safeString (this.urls['api'], 'ws');
        if (wsUrl === undefined) {
            throw new ExchangeError (this.id + ' watchTrades() has no websocket url');
        }
        const url = wsUrl + subscriptionHash;
        const messageHash = 'trades:' + symbolValue;
        const subscribe: Dict = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend (subscribe, params);
        const trades: ArrayCache = await this.watch (url, messageHash, request, subscriptionHash, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (symbolValue, limit);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    handleTrades (client: Client, message: Dict, subscription: Dict) {
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
        const rawTrades: Dict[] = this.safeList (message, 'trade_updates', []);
        const length = rawTrades.length;
        if (length === 0) {
            return;
        }
        const symbol: string = subscription['symbol'];
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

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
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
        let symbol: Str = undefined;
        if (market === undefined) {
            symbol = undefined;
        } else {
            symbol = market['symbol'];
        }
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
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        this.checkRequiredCredentials ();
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const symbolValue: string = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const subscription: Dict = { 'symbol': symbolValue };
        const wsUrl = this.safeString (this.urls['api'], 'ws');
        if (wsUrl === undefined) {
            throw new ExchangeError (this.id + ' watchOrderBook() has no websocket url');
        }
        const url = wsUrl + subscriptionHash;
        const messageHash = 'orderbook:' + symbolValue;
        const subscribe: Dict = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook: Ob = await this.watch (url, messageHash, request, subscriptionHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict, subscription: Dict) {
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
        const symbol: string = subscription['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (message, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.indexedOrderBook ({});
        }
        const asks = this.safeList (message, 'asks');
        if (asks !== undefined) {
            const snapshot = this.customParseOrderBook (message, symbol, timestamp, 'bids', 'asks', 'price', 'volume', 'id');
            this.orderbooks[symbol] = this.indexedOrderBook (snapshot);
        } else {
            const ob = this.orderbooks[symbol];
            this.handleBookDelta (ob, message);
            ob['timestamp'] = timestamp;
            ob['datetime'] = this.iso8601 (timestamp);
        }
        const orderbook = this.orderbooks[symbol];
        const nonce = this.safeInteger (message, 'sequence');
        orderbook['nonce'] = nonce;
        client.resolve (orderbook, messageHash);
    }

    customParseOrderBook (orderbook: Dict, symbol: Str, timestamp: Int = undefined, bidsKey: Str = 'bids', asksKey: IndexType = 'asks', priceKey: IndexType = 'price', amountKey: IndexType = 'volume', countOrIdKey: IndexType = 2) {
        const bids = this.parseOrderBookBidsAsks (this.safeList (orderbook, bidsKey, []), priceKey, amountKey, countOrIdKey);
        const asks = this.parseOrderBookBidsAsks (this.safeList (orderbook, asksKey, []), priceKey, amountKey, countOrIdKey);
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
        const bidasksValue: any = this.toArray (bidasks);
        const result: any[] = [];
        for (let i = 0; i < bidasksValue.length; i++) {
            result.push (this.customParseBidAsk (bidasksValue[i], priceKey, amountKey, thirdKey));
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

    override handleBookDelta (orderbook: Ob, message: any) {
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
        const createUpdate = this.safeDict (message, 'create_update');
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        if (createUpdate !== undefined) {
            const bidAskArray = this.customParseBidAsk (createUpdate, 'price', 'volume', 'order_id');
            const type = this.safeString (createUpdate, 'type');
            if (type === 'ASK') {
                asksOrderSide.storeArray (bidAskArray);
            } else if (type === 'BID') {
                bidsOrderSide.storeArray (bidAskArray);
            }
        }
        const deleteUpdate = this.safeDict (message, 'delete_update');
        if (deleteUpdate !== undefined) {
            const orderId = this.safeString (deleteUpdate, 'order_id');
            asksOrderSide.storeArray ([ 0, 0, orderId ]);
            bidsOrderSide.storeArray ([ 0, 0, orderId ]);
        }
    }

    override handleMessage (client: Client, message: any) {
        if (message === '') {
            return;
        }
        const subscriptions = Object.values (client.subscriptions);
        const handlers = [ this.handleOrderBook, this.handleTrades ];
        for (let j = 0; j < handlers.length; j++) {
            const handler = handlers[j];
            handler.call (this, client, message, subscriptions[0]);
        }
    }
}
