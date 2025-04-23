
//  ---------------------------------------------------------------------------

import tradeogreRest from '../tradeogre.js';
import { Precise } from '../base/Precise.js';
import type { Dict, Int, OrderBook, Trade } from '../base/types.js';
import { ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class tradeogre extends tradeogreRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchBalance': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://tradeogre.com:8443',
                },
            },
            'options': {
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 50000,
            },
        });
    }

    /**
     * @method
     * @name tradeogre#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const name = 'book';
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = market['id'] + '@' + name;
        const request: Dict = {
            'a': 'subscribe',
            'e': name,
            't': market['id'],
        };
        const orderbook = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'topic');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    /**
     * @method
     * @name tradeogre#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'trade';
        const url = this.urls['api']['ws'];
        const messageHash = market['id'] + '@trade';
        const request: Dict = {
            'a': 'subscribe',
            'e': name,
            't': '*',
        };
        const trades = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "topic":"PERP_ADA_USDC@trade",
        //     "ts":1618820361552,
        //     "data":{
        //         "symbol":"PERP_ADA_USDC",
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //     }
        // }
        //
        const topic = this.safeString (message, 'topic');
        const timestamp = this.safeInteger (message, 'ts');
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (this.extend (data, { 'timestamp': timestamp }), market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append (trade);
        this.trades[symbol] = trades;
        client.resolve (trades, topic);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "symbol":"PERP_ADA_USDC",
        //         "timestamp":1618820361552,
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //     }
        // private stream
        //     {
        //         symbol: 'PERP_XRP_USDC',
        //         clientOrderId: '',
        //         orderId: 1167632251,
        //         type: 'MARKET',
        //         side: 'BUY',
        //         quantity: 20,
        //         price: 0,
        //         tradeId: '1715179456664012',
        //         executedPrice: 0.5276,
        //         executedQuantity: 20,
        //         fee: 0.006332,
        //         feeAsset: 'USDC',
        //         totalExecutedQuantity: 20,
        //         avgPrice: 0.5276,
        //         averageExecutedPrice: 0.5276,
        //         status: 'FILLED',
        //         reason: '',
        //         totalFee: 0.006332,
        //         visible: 0,
        //         visibleQuantity: 0,
        //         timestamp: 1715179456660,
        //         orderTag: 'CCXT',
        //         createdTime: 1715179456656,
        //         maker: false
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2 (trade, 'executedPrice', 'price');
        const amount = this.safeString2 (trade, 'executedQuantity', 'size');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        const timestamp = this.safeInteger (trade, 'timestamp');
        let takerOrMaker = undefined;
        const maker = this.safeBool (trade, 'maker');
        if (maker !== undefined) {
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeValue = this.safeString (trade, 'fee');
        if (feeValue !== undefined) {
            fee = {
                'cost': feeValue,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeAsset')),
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': this.safeString (trade, 'orderId'),
            'takerOrMaker': takerOrMaker,
            'type': this.safeStringLower (trade, 'type'),
            'fee': fee,
            'info': trade,
        }, market);
    }

    handleMessage (client: Client, message) {
        const methods: Dict = {
            'orderbook': this.handleOrderBook,
            'trade': this.handleTrade,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
