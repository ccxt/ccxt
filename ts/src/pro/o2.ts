
//  ---------------------------------------------------------------------------

import o2Rest from '../o2.js';
import type { Dict, Int, Market, OrderBook, Str, Trade, Order, Balances } from '../base/types.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class o2 extends o2Rest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.o2.app/v1/ws',
                        'private': 'wss://api.o2.app/v1/ws',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.testnet.o2.app/v1/ws',
                        'private': 'wss://api.testnet.o2.app/v1/ws',
                    },
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000,
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name o2#watchOrderBook
         * @description watches information on open orders with bid and ask prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of order book structures indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + symbol;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'action': 'subscribe_depth',
            'market_id': market['id'],
        };
        if (limit !== undefined) {
            request['precision'] = limit;
        }
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name o2#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of trade structures
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades:' + symbol;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'action': 'subscribe_trades',
            'market_id': market['id'],
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name o2#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of order structures
         */
        await this.loadMarkets ();
        await this.ensureSession ();
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        const messageHash = 'orders';
        const url = this.urls['api']['ws']['private'];
        const request: Dict = {
            'action': 'subscribe_orders',
            'contract_id': tradeAccountId,
        };
        const message = this.extend (request, params);
        const orders = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name o2#watchBalance
         * @description query for balance and get the amount of funds available for trading
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a balance structure
         */
        await this.loadMarkets ();
        await this.ensureSession ();
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        const messageHash = 'balance';
        const url = this.urls['api']['ws']['private'];
        const request: Dict = {
            'action': 'subscribe_balances',
            'identities': [
                { 'ContractId': tradeAccountId },
            ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleMessage (client: Client, message: any): void {
        const action = this.safeString (message, 'action');
        if (action === undefined) {
            return;
        }
        if ((action === 'subscribe_depth') || (action === 'subscribe_depth_update')) {
            this.handleOrderBook (client, message);
        } else if (action === 'subscribe_trades') {
            this.handleTrades (client, message);
        } else if (action === 'subscribe_orders') {
            this.handleOrders (client, message);
        } else if (action === 'subscribe_balances') {
            this.handleBalance (client, message);
        }
    }

    scaleWsPrice (rawPrice: Str, market: Market): Str {
        // WS sends chain integers for prices — scale using Precise (transpile-safe)
        if (rawPrice === undefined) {
            return undefined;
        }
        const info = this.safeDict (market, 'info', {});
        const quoteInfo = this.safeDict (info, 'quote', {});
        const quoteDecimals = this.safeInteger (quoteInfo, 'decimals', 9);
        return this.scaleChainToHuman (rawPrice, quoteDecimals);
    }

    scaleWsQuantity (rawQty: Str, market: Market): Str {
        // WS sends chain integers for quantities — scale using Precise (transpile-safe)
        if (rawQty === undefined) {
            return undefined;
        }
        const info = this.safeDict (market, 'info', {});
        const baseInfo = this.safeDict (info, 'base', {});
        const baseDecimals = this.safeInteger (baseInfo, 'decimals', 9);
        return this.scaleChainToHuman (rawQty, baseDecimals);
    }

    handleOrderBook (client: Client, message: any): void {
        const marketId = this.safeString (message, 'market_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const action = this.safeString (message, 'action');
        if (action === 'subscribe_depth') {
            const view = this.safeDict (message, 'view', {});
            const buys = this.safeList (view, 'buys', []);
            const sells = this.safeList (view, 'sells', []);
            const timestamp = this.safeInteger (message, 'seen_timestamp');
            const orderbook = this.orderBook ({});
            this.orderbooks[symbol] = orderbook;
            const asks = [];
            const bids = [];
            for (let i = 0; i < sells.length; i++) {
                const level = sells[i];
                const price = this.parseNumber (this.scaleWsPrice (this.safeString (level, 'price'), market));
                const qty = this.parseNumber (this.scaleWsQuantity (this.safeString (level, 'quantity'), market));
                asks.push ([ price, qty ]);
            }
            for (let i = 0; i < buys.length; i++) {
                const level = buys[i];
                const price = this.parseNumber (this.scaleWsPrice (this.safeString (level, 'price'), market));
                const qty = this.parseNumber (this.scaleWsQuantity (this.safeString (level, 'quantity'), market));
                bids.push ([ price, qty ]);
            }
            orderbook.reset ({ 'asks': asks, 'bids': bids, 'timestamp': timestamp });
            client.resolve (orderbook, messageHash);
        } else if (action === 'subscribe_depth_update') {
            const changes = this.safeDict (message, 'changes', {});
            const buys = this.safeList (changes, 'buys', []);
            const sells = this.safeList (changes, 'sells', []);
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook === undefined) {
                return;
            }
            for (let i = 0; i < buys.length; i++) {
                const level = buys[i];
                const price = this.parseNumber (this.scaleWsPrice (this.safeString (level, 'price'), market));
                const qty = this.parseNumber (this.scaleWsQuantity (this.safeString (level, 'quantity'), market));
                const side = orderbook['bids'];
                side.store (price, qty);
            }
            for (let i = 0; i < sells.length; i++) {
                const level = sells[i];
                const price = this.parseNumber (this.scaleWsPrice (this.safeString (level, 'price'), market));
                const qty = this.parseNumber (this.scaleWsQuantity (this.safeString (level, 'quantity'), market));
                const side = orderbook['asks'];
                side.store (price, qty);
            }
            client.resolve (orderbook, messageHash);
        }
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        // WS trades have chain integers — scale to human-readable using Precise
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side');
        let priceString = this.safeString (trade, 'price');
        let amountString = this.safeString (trade, 'quantity');
        let costString = this.safeString (trade, 'total');
        if (market !== undefined) {
            const decimals = this.getMarketDecimals (market);
            priceString = this.scaleChainToHuman (priceString, decimals['quoteDecimals']);
            amountString = this.scaleChainToHuman (amountString, decimals['baseDecimals']);
            costString = this.scaleChainToHuman (costString, decimals['quoteDecimals']);
        }
        const id = this.safeString (trade, 'trade_id');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
        }, market);
    }

    handleTrades (client: Client, message: any): void {
        const marketId = this.safeString (message, 'market_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const trades = this.safeList (message, 'trades', []);
        let stored = this.safeValue (this.trades, symbol) as ArrayCache;
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            const parsedTrade = this.parseWsTrade (trades[i], market);
            stored.append (parsedTrade);
        }
        client.resolve (stored, messageHash);
    }

    parseWsOrder (order: Dict, market: Market = undefined): Order {
        // WS orders have chain integers — scale to human-readable
        const id = this.safeString (order, 'order_id');
        const side = this.safeStringLower (order, 'side');
        const timestamp = this.safeInteger (order, 'timestamp');
        const isClosed = this.safeBool (order, 'close', false);
        const isCancelled = this.safeBool (order, 'cancel', false);
        let status = 'open';
        if (isCancelled) {
            status = 'canceled';
        } else if (isClosed) {
            status = 'closed';
        }
        const rawType = this.safeString (order, 'order_type');
        let type = 'limit';
        if (rawType === 'Market') {
            type = 'market';
        }
        let price = this.safeString (order, 'price');
        let amount = this.safeString (order, 'quantity');
        let filled = this.safeString (order, 'quantity_fill');
        let average = this.safeString (order, 'price_fill');
        if (market !== undefined) {
            const decimals = this.getMarketDecimals (market);
            price = this.scaleChainToHuman (price, decimals['quoteDecimals']);
            amount = this.scaleChainToHuman (amount, decimals['baseDecimals']);
            filled = this.scaleChainToHuman (filled, decimals['baseDecimals']);
            average = this.scaleChainToHuman (average, decimals['quoteDecimals']);
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeSymbol (undefined, market),
            'type': type,
            'timeInForce': undefined,
            'postOnly': (rawType === 'PostOnly'),
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleOrders (client: Client, message: any): void {
        const messageHash = 'orders';
        const contractId = this.safeString (message, 'contract_id');
        const orders = this.safeList (message, 'orders', []);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        // try to find market from contract_id for scaling
        let market = undefined;
        const marketsInfo = this.safeList (this.options, 'marketsInfo', []);
        for (let i = 0; i < marketsInfo.length; i++) {
            if (this.safeString (marketsInfo[i], 'contract_id') === contractId) {
                const baseSymbol = this.safeString (this.safeDict (marketsInfo[i], 'base', {}), 'symbol');
                const quoteSymbol = this.safeString (this.safeDict (marketsInfo[i], 'quote', {}), 'symbol');
                const unified = baseSymbol + '/' + quoteSymbol;
                if (unified in this.markets) {
                    market = this.market (unified);
                }
                break;
            }
        }
        for (let i = 0; i < orders.length; i++) {
            const parsedOrder = this.parseWsOrder (orders[i], market);
            this.orders.append (parsedOrder);
        }
        client.resolve (this.orders, messageHash);
    }

    handleBalance (client: Client, message: any): void {
        const messageHash = 'balance';
        const balances = this.safeList (message, 'balance', []);
        const result: Dict = {
            'info': message,
            'timestamp': undefined,
            'datetime': undefined,
        };
        // build asset_id → currency code lookup from marketsInfo
        const marketsInfo = this.safeList (this.options, 'marketsInfo', []);
        const assetCodeMap: Dict = {};
        for (let i = 0; i < marketsInfo.length; i++) {
            const baseInfo = this.safeDict (marketsInfo[i], 'base', {});
            const quoteInfo = this.safeDict (marketsInfo[i], 'quote', {});
            const baseAsset = this.safeString (baseInfo, 'asset');
            const quoteAsset = this.safeString (quoteInfo, 'asset');
            if ((baseAsset !== undefined) && (assetCodeMap[baseAsset] === undefined)) {
                assetCodeMap[baseAsset] = this.safeCurrencyCode (this.safeString (baseInfo, 'symbol'));
            }
            if ((quoteAsset !== undefined) && (assetCodeMap[quoteAsset] === undefined)) {
                assetCodeMap[quoteAsset] = this.safeCurrencyCode (this.safeString (quoteInfo, 'symbol'));
            }
        }
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const assetId = this.safeString (entry, 'asset_id');
            const code = this.safeString (assetCodeMap, assetId);
            if (code === undefined) {
                continue;
            }
            const totalUnlocked = this.safeString (entry, 'total_unlocked', '0');
            const totalLocked = this.safeString (entry, 'total_locked', '0');
            const account = this.account ();
            account['free'] = totalUnlocked;
            account['used'] = totalLocked;
            result[code] = account;
        }
        this.balance = this.safeBalance (result);
        client.resolve (this.balance, messageHash);
    }

    ping (client: Client): Dict {
        return { 'action': 'ping' };
    }
}
