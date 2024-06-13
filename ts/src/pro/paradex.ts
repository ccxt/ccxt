
//  ---------------------------------------------------------------------------

import paradexRest from '../paradex.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, Trade, Dict, OrderBook } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class paradex extends paradexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTrades': true,
                'watchBalance': false,
                'watchOHLCV': false,
            },
            'urls': {
                'logo': 'https://x.com/tradeparadex/photo',
                'api': {
                    'ws': 'wss://ws.api.prod.paradex.trade/v1',
                },
                'test': {
                    'ws': 'wss://ws.api.testnet.paradex.trade/v1',
                },
                'www': 'https://www.paradex.trade/',
                'doc': 'https://docs.api.testnet.paradex.trade/',
                'fees': 'https://docs.paradex.trade/getting-started/trading-fees',
                'referral': '',
            },
            'options': {},
            'streaming': {},
        });
    }

    async subscribe (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': messageHash,
            },
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name paradex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.api.testnet.paradex.trade/#sub-trades-market_symbol-operation
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades.' + market['id'];
        const trades = await this.subscribe (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.ALL",
        //             "data": {
        //                 "id": "1718179273230201709233240002",
        //                 "market": "kBONK-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "34028",
        //                 "price": "0.028776",
        //                 "created_at": 1718179273230,
        //                 "trade_type": "FILL"
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const parsedTrade = this.parseTrade (data);
        const symbol = parsedTrade['symbol'];
        const messageHash = this.safeString (params, 'channel');
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            stored = new ArrayCache (this.safeInteger (this.options, 'tradesLimit', 1000));
            this.trades[symbol] = stored;
        }
        stored.append (parsedTrade);
        client.resolve (stored, messageHash);
        return message;
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name paradex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.api.testnet.paradex.trade/#sub-order_book-market_symbol-snapshot-15-refresh_rate-operation
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const market = this.market (symbol);
        const messageHash = 'order_book.' + market['id'] + '.snapshot@15@100ms';
        const orderbook = await this.subscribe (messageHash, params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "order_book.BTC-USD-PERP.snapshot@15@50ms",
        //             "data": {
        //                 "seq_no": 14127815,
        //                 "market": "BTC-USD-PERP",
        //                 "last_updated_at": 1718267837265,
        //                 "update_type": "s",
        //                 "inserts": [
        //                     {
        //                         "side": "BUY",
        //                         "price": "67629.7",
        //                         "size": "0.992"
        //                     },
        //                     {
        //                         "side": "SELL",
        //                         "price": "69378.6",
        //                         "size": "3.137"
        //                     }
        //                 ],
        //                 "updates": [],
        //                 "deletes": []
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId);
        const timestamp = this.safeInteger (data, 'last_updated_at');
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbookData = {
            'bids': [],
            'asks': [],
        };
        const inserts = this.safeList (data, 'inserts');
        for (let i = 0; i < inserts.length; i++) {
            const insert = this.safeDict (inserts, i);
            const side = this.safeString (insert, 'side');
            const price = this.safeString (insert, 'price');
            const size = this.safeString (insert, 'size');
            if (side === 'BUY') {
                orderbookData['bids'].push ([ price, size ]);
            } else {
                orderbookData['asks'].push ([ price, size ]);
            }
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (orderbookData, symbol, timestamp, 'bids', 'asks');
        snapshot['nonce'] = this.safeNumber (data, 'seq_no');
        orderbook.reset (snapshot);
        const messageHash = this.safeString (params, 'channel');
        client.resolve (orderbook, messageHash);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 0,
        //         "error": {
        //             "code": -32600,
        //             "message": "invalid subscribe request",
        //             "data": "invalid channel"
        //         },
        //         "usIn": 1718179125962419,
        //         "usDiff": 76,
        //         "usOut": 1718179125962495
        //     }
        //
        const error = this.safeDict (message, 'error');
        if (error === undefined) {
            return true;
        } else {
            const errorCode = this.safeString (error, 'code');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (error);
                this.throwExactlyMatchedException (this.exceptions['exact'], '-32600', feedback);
                const messageString = this.safeValue (error, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
            return false;
        }
    }

    handleMessage (client: Client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.ALL",
        //             "data": {
        //                 "id": "1718179273230201709233240002",
        //                 "market": "kBONK-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "34028",
        //                 "price": "0.028776",
        //                 "created_at": 1718179273230,
        //                 "trade_type": "FILL"
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (message, 'params');
        if (data !== undefined) {
            const channel = this.safeString (data, 'channel');
            const parts = channel.split ('.');
            const name = this.safeString (parts, 0);
            const methods: Dict = {
                'trades': this.handleTrade,
                'order_book': this.handleOrderBook,
                // ...
            };
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
