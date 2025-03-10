
//  ---------------------------------------------------------------------------

import coindcxRest from '../coindcx.js';
import { AuthenticationError } from '../base/errors.js';
import type { Balances, Dict, Int, OHLCV, Order, OrderBook, Str, Trade } from '../base/types.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
// import { Precise } from '../base/Precise.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coindcx extends coindcxRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrders': true,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false, // todo if any endpoint supports it
                'watchBalance': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream-native.coindcx.com',
                },
            },
            'options': {
                'wsTimeframes': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '4h': '4h',
                    '8h': '8h',
                    '1d': '1d',
                    '3d': '3d',
                    '1w': '1w',
                    '1M': '1M',
                },
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'orderbook': {},
            },
            'streaming': {},
            'exceptions': {
                'exact': {
                    'unrecognised input': AuthenticationError,
                },
            },
        });
    }

    getChannelName (symbol: string, channel: string): string {
        const market = this.market (symbol);
        const marketType = market['type'];
        let marketId = market['id'];
        let suffix = '-futures';
        if (marketType === 'spot') {
            suffix = '';
            const base = market['base'];
            const quote = market['quote'];
            marketId = 'B-' + base + '_' + quote;
        }
        const channelName = marketId + '@' + channel + suffix;
        return channelName;
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coindcx#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.coindcx.com/#get-new-trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const url = this.urls['api']['ws'];
        const channelName = this.getChannelName (symbol, 'trades');
        const messageHash = 'new-trade:' + symbol;
        const request: Dict = {
            'type': 'subscribe',
            'channelName': channelName,
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     "event": 'new-trade',
        //     "data": {
        //         "T": 1739735609567,
        //         "m": 1,
        //         "p": '2683.63',
        //         "pr": 'spot',
        //         "q": '0.0084',
        //         "s": 'B-ETH_USDT'
        //     }
        //
        const data = this.safeDict (message, 'data');
        const event = this.safeString (message, 'event');
        let marketId = this.safeString (data, 's');
        const marketType = this.safeString (data, 'pr');
        if (marketType === 'spot') {
            marketId = marketId.replace ('B-', '');
            marketId = marketId.replace ('_', '/');
        }
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = event + ':' + symbol;
        const trade = this.parseWsTrade (data, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "T": 1739735609567,
        //         "m": 1,
        //         "p": '2683.63',
        //         "pr": 'spot',
        //         "q": '0.0084',
        //         "s": 'B-ETH_USDT'
        //     }
        //
        // watchMyTrades
        //     {
        //         T: 1739840633115.661,
        //         c: null,
        //         f: '1.46342355',
        //         m: true,
        //         o: '38780e28-ed94-11ef-b30e-f7f0224a5bdf',
        //         p: '248037.89',
        //         q: '0.001',
        //         s: 'ETHINR',
        //         t: '209292754',
        //         x: 'filled'
        //     }
        //
        market = this.safeMarket (undefined, market); // define market in handleTrade and handleMyTrades
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        const timestamp = this.safeInteger (trade, 'T');
        let takerOrMaker = 'taker';
        const x = this.safeString (trade, 'x');
        const isMyTrades = x !== undefined;
        if (isMyTrades) {
            const isMaker = this.safeBool (trade, 'm');
            if (isMaker) {
                takerOrMaker = 'maker';
            }
        } else {
            const isMaker = this.safeInteger (trade, 'm');
            if (isMaker === 1) {
                takerOrMaker = 'maker';
            }
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 't'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': undefined,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coindcx#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.coindcx.com/#get-candlestick-info
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const timeframes = this.safeDict (this.options, 'wsTimeframes', {});
        const interval = this.safeString (timeframes, timeframe, timeframe);
        const messageHash = 'candlestick:' + symbol + ':' + interval;
        const marketType = this.safeString (market, 'type');
        const swapId = this.marketId (symbol);
        let channelName = swapId + '_' + interval + '-' + 'futures';
        if (marketType === 'spot') {
            const base = this.safeString (market, 'base', '');
            const quote = this.safeString (market, 'quote', '');
            channelName = 'B-' + base + '_' + quote + '_' + interval;
        }
        const request: Dict = {
            'type': 'subscribe',
            'channelName': channelName,
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // spot
        //     event: 'candlestick',
        //     data: {
        //         B: '0',
        //         L: 2161896984,
        //         Q: '19756.34672800',
        //         T: 1739742599999,
        //         V: '7.35570000',
        //         c: '2686.18000000',
        //         channel: 'B-ETH_USDT_1m',
        //         ecode: 'B',
        //         f: 2161896848,
        //         h: '2686.18000000',
        //         i: '1m',
        //         l: '2685.80000000',
        //         n: 137,
        //         o: '2685.80000000',
        //         pr: 'spot',
        //         q: '21310.62066800',
        //         s: 'ETHUSDT',
        //         t: 1739742540000,
        //         v: '7.93440000',
        //         x: false
        //     }
        //
        // swap
        //     {
        //         event: 'candlestick',
        //         data: {
        //             Ets: 1740859806718,
        //             channel: 'B-ETH_USDT_1m-futures',
        //             data: [
        //                 {
        //                     close: '2097.18',
        //                     close_time: 1741089779.999,
        //                     duration: '1m',
        //                     high: '2097.56',
        //                     low: '2097.11',
        //                     open: '2097.11',
        //                     open_time: 1741089720,
        //                     pair: 'B-ETH_USDT',
        //                     quote_volume: '394154.77372',
        //                     symbol: 'ETHUSDT',
        //                     volume: '187.941'
        //                 }
        //             ],
        //             ecode: 'B',
        //             i: '1m',
        //             pr: 'futures',
        //             pts: 1740859806799
        //         }
        //     }
        //
        let data = this.safeDict (message, 'data');
        const marketType = this.safeString (data, 'pr');
        const timeframe = this.safeString (data, 'i');
        let marketId = this.safeString (data, 's');
        let parsed = [];
        if (marketType === 'futures') {
            const dataList = this.safeList (data, 'data', []);
            data = this.safeDict (dataList, 0, {});
            marketId = this.safeString (data, 'pair');
            parsed = this.parseOHLCV (data);
        } else {
            parsed = [
                this.safeInteger (data, 't'),
                this.safeFloat (data, 'o'),
                this.safeFloat (data, 'h'),
                this.safeFloat (data, 'l'),
                this.safeFloat (data, 'c'),
                this.safeFloat (data, 'v'),
            ];
        }
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'candlestick' + ':' + symbol + ':' + timeframe;
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coindcx#watchOrderBook
         * @see https://docs.coindcx.com/#get-depth-update-order-book
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (only 10, 20 or 50 are valid)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const url = this.urls['api']['ws'];
        let exchangeLimit = '50';
        if (limit) {
            if (limit <= 11) {
                exchangeLimit = '10';
            } else if (limit <= 21) {
                exchangeLimit = '20';
            }
        }
        const channel = 'orderbook' + '@' + exchangeLimit;
        const messageHash = 'orderbook' + ':' + symbol;
        const request: Dict = {
            'type': 'subscribe',
            'channelName': this.getChannelName (symbol, channel),
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message) {
        //
        //     data: {
        //         asks: {
        //             '2712.49': '58.6325',
        //             '2712.5': '2.305',
        //             '2712.51': '0.5361',
        //             '2712.52': '3.1691',
        //             '2712.53': '0.0038',
        //             '2712.56': '6.0051',
        //             '2712.57': '0.0037',
        //             '2712.58': '0.0019',
        //             '2712.6': '5.4436',
        //             '2712.64': '3.9163'
        //         },
        //         bids: {
        //             '2712.37': '0.6',
        //             '2712.4': '3.043',
        //             '2712.41': '13.922',
        //             '2712.42': '5.2907',
        //             '2712.43': '0.0059',
        //             '2712.44': '0.005',
        //             '2712.45': '0.0069',
        //             '2712.46': '0.005',
        //             '2712.47': '0.0588',
        //             '2712.48': '8.4747'
        //         },
        //         pr: 'spot',
        //         pts: 1739782732137,
        //         s: 'ETHUSDT',
        //         ts: 1739782732129,
        //         type: 'depth-snapshot'
        //         vs: 59180538
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        let marketId = this.safeString (data, 's');
        let market = this.safeMarket (marketId);
        const marketType = this.safeString (data, 'pr');
        if (marketType !== 'spot') {
            const base = market['base'];
            const quote = market['quote'];
            marketId = base + '/' + quote + ':' + quote; // todo check if it's correct
            market = this.safeMarket (marketId);
        }
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (data, 'ts');
        const increment = this.safeInteger (data, 'vs');
        const orderbook = this.orderBook ({});
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        snapshot['nonce'] = increment;
        orderbook.reset (snapshot);
        this.options['orderbook'][symbol] = {
            'incrementalId': increment,
        };
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBookUpdate (client: Client, message) {
        //
        //     data: {
        //         asks: {
        //             '2712.49': '58.6325',
        //             '2712.5': '2.305',
        //             '2712.51': '0.5361',
        //             '2712.52': '3.1691',
        //             '2712.53': '0.0038',
        //             '2712.56': '6.0051',
        //             '2712.57': '0.0037',
        //             '2712.58': '0.0019',
        //             '2712.6': '5.4436',
        //             '2712.64': '3.9163'
        //         },
        //         bids: {
        //             '2712.37': '0.6',
        //             '2712.4': '3.043',
        //             '2712.41': '13.922',
        //             '2712.42': '5.2907',
        //             '2712.43': '0.0059',
        //             '2712.44': '0.005',
        //             '2712.45': '0.0069',
        //             '2712.46': '0.005',
        //             '2712.47': '0.0588',
        //             '2712.48': '8.4747'
        //         },
        //         pr: 'spot',
        //         pts: 1739782732137,
        //         s: 'ETHUSDT',
        //         ts: 1739782732129,
        //         type: 'depth-update',
        //         vs: 59180538
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        let marketId = this.safeString (data, 's');
        let market = this.safeMarket (marketId);
        const marketType = this.safeString (data, 'pr');
        if (marketType !== 'spot') {
            const base = market['base'];
            const quote = market['quote'];
            marketId = base + '/' + quote + ':' + quote; // todo check if it's correct
            market = this.safeMarket (marketId);
        }
        const symbol = market['symbol'];
        const storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            this.handleOrderBookSnapshot (client, message); // sometimes the update comes before the snapshot
            return;
        }
        const increment = this.safeInteger (data, 'vs');
        const messageHash = 'orderbook:' + symbol;
        if (increment !== storedOrderBook['nonce'] + 1) {
            delete client.subscriptions[messageHash];
            client.reject (this.id + ' watchOrderBook() skipped a message', messageHash);
        }
        const timestamp = this.safeInteger (data, 'ts');
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (storedOrderBook['asks'], asks);
        this.handleDeltas (storedOrderBook['bids'], bids);
        storedOrderBook['timestamp'] = timestamp;
        storedOrderBook['datetime'] = this.iso8601 (timestamp);
        storedOrderBook['nonce'] = increment;
        client.resolve (storedOrderBook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coindcx#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.coindcx.com/#get-balance-update
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const subscribeHash = 'balance';
        return await this.watchPrivate (subscribeHash);
    }

    handleBalance (client: Client, message) {
        // todo: get the balance info from the message
        //     [
        //         {
        //             "id":"102a7916-a622-11ee-bd36-479d3cf6751b",
        //             "balance":"265.01745775027309",
        //             "locked_balance":"258.600771",
        //             "currency_id":"cfe01e2a-f1af-4e52-9696-9a19d9a8eb4f",
        //             "currency_short_name":"INR"
        //         }
        //     ]
        //
        const data = this.safeList (message, 'data', []);
        const result: Dict = {
            'info': data,
        };
        for (let i = 0; i < data.length; i++) {
            const balance = this.safeDict (data, i, {});
            const currencyId = this.safeString (balance, 'currency_short_name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked_balance');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (result);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coindcx#watchOrders
         * @description get the list of orders associated with the user. Note: In CEX.IO system, orders can be present in trade engine or in archive database. There can be time periods (~2 seconds or more), when order is done/canceled, but still not moved to archive database. That means, you cannot see it using calls: archived-orders/open-orders.
         * @see https://docs.coindcx.com/#get-order-update
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let messageHash = 'order-update';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += '::' + symbol;
        }
        const orders = await this.watchPrivate (messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        // spot
        //     event: 'order-update',
        //     data: [
        //         {
        //             avg_price: 0,
        //             base_currency_name: 'Indian Rupee',
        //             base_currency_precision: 2,
        //             base_currency_short_name: 'INR',
        //             client_order_id: null,
        //             created_at: 1739840633009,
        //             fee: 0.59,
        //             fee_amount: 0,
        //             id: '38780e28-ed94-11ef-b30e-f7f0224a5bdf',
        //             maker_fee: 0.59,
        //             market: 'ETHINR',
        //             order_type: 'market_order',
        //             price_per_unit: 0,
        //             remaining_quantity: 0.001,
        //             side: 'sell',
        //             source: 'web',
        //             status: 'open',
        //             stop_price: 0,
        //             taker_fee: 0.59,
        //             target_currency_name: 'Ethereum',
        //             target_currency_precision: 4,
        //             target_currency_short_name: 'ETH',
        //             time_in_force: 'good_till_cancel',
        //             total_quantity: 0.001,
        //             updated_at: 1739840633009
        //         }
        //     ]
        //
        // swap
        //     {
        //         event: 'df-order-update',
        //         data: [
        //             {
        //                 avg_price: 2102.51,
        //                 cancelled_quantity: 0,
        //                 created_at: 1741604982805,
        //                 display_message: 'ETH market buy order filled!',
        //                 fee_amount: 0.0186072135,
        //                 group_id: null,
        //                 group_status: null,
        //                 id: 'bf2f3834-e7ac-48c1-b0e5-1110bf4dee0e',
        //                 ideal_margin: 7.904636019,
        //                 leverage: 4,
        //                 liquidation_fee: null,
        //                 locked_margin: 0,
        //                 maker_fee: 0.0236,
        //                 margin_currency_short_name: 'USDT',
        //                 metatags: null,
        //                 notification: 'no_notification',
        //                 order_category: null,
        //                 order_type: 'market_order',
        //                 pair: 'B-ETH_USDT',
        //                 position_margin_type: 'isolated',
        //                 price: 2102.94,
        //                 remaining_quantity: 0,
        //                 settlement_currency_conversion_price: 1,
        //                 side: 'buy',
        //                 stage: 'default',
        //                 status: 'filled',
        //                 stop_loss_price: null,
        //                 stop_price: 0,
        //                 stop_trigger_instruction: 'last_price',
        //                 take_profit_price: null,
        //                 taker_fee: 0.059,
        //                 total_quantity: 0.015,
        //                 trades: [],
        //                 updated_at: 1741604983355
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList (message, 'data', []);
        if (orders === undefined) {
            return;
        }
        const ordersLength = orders.length;
        const newOrders = [];
        const symbols: Dict = {};
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        if (this.orders === undefined) {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        if (ordersLength > 0) {
            for (let i = 0; i < orders.length; i++) {
                const order = this.parseOrder (orders[i]);
                stored.append (order);
                newOrders.push (order);
                const symbol = order['symbol'];
                symbols[symbol] = true;
            }
        }
        const messageHash = 'order-update';
        const symbolKeys = Object.keys (symbols);
        for (let i = 0; i < symbolKeys.length; i++) {
            const symbol = symbolKeys[i];
            const symbolSpecificMessageHash = messageHash + '::' + symbol;
            client.resolve (stored, symbolSpecificMessageHash);
        }
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coindcx#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const name = 'trade-update';
        let subscribeHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            subscribeHash += '::' + symbol;
        }
        const trades = await this.watchPrivate (subscribeHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message) {
        //
        //     event: 'trade-update',
        //     data: [
        //         {
        //             T: 1739840633115.661,
        //             c: null,
        //             f: '1.46342355',
        //             m: true,
        //             o: '38780e28-ed94-11ef-b30e-f7f0224a5bdf',
        //             p: '248037.89',
        //             q: '0.001',
        //             s: 'ETHINR',
        //             t: '209292754',
        //             x: 'filled'
        //         }
        //     ]
        //
        const messageHash = this.safeString (message, 'event');
        const data = this.safeValue (message, 'data', []);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const newTrades = [];
        const stored = this.myTrades;
        const symbols: Dict = {};
        for (let j = 0; j < data.length; j++) {
            const rawTrade = this.safeValue (data, j);
            const marketId = this.safeString (rawTrade, 's');
            const market = this.safeMarket (marketId);
            const trade = this.parseWsTrade (rawTrade, market);
            stored.append (trade);
            newTrades.push (trade);
            const symbol = trade['symbol'];
            symbols[symbol] = trade;
        }
        const numTrades = newTrades.length;
        if (numTrades > 0) {
            client.resolve (stored, messageHash);
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            client.resolve (stored, messageHash + '::' + keys[i]);
        }
    }

    async watchPrivate (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const body = {
            'channel': 'coindcx',
        };
        const payload = this.json (body);
        const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
        const request: Dict = {
            'type': 'subscribe',
            'channelName': 'coindcx',
            'apiKey': this.apiKey,
            'authSignature': signature,
        };
        return await this.watch (url, messageHash, this.extend (request, params), 'privateChannels');
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString2 (message, 'event', 'type');
        const methods: Dict = {
            'new-trade': this.handleTrade,
            'candlestick': this.handleOHLCV,
            'depth-snapshot': this.handleOrderBookSnapshot,
            'depth-update': this.handleOrderBookUpdate,
            'balance-update': this.handleBalance,
            'order-update': this.handleOrder,
            'df-order-update': this.handleOrder,
            'trade-update': this.handleMyTrades,
        };
        if (event in methods) {
            const method = methods[event];
            method.call (this, client, message);
        }
    }

    handleErrorMessage (client: Client, message) {
        //
        //     { error: 'unrecognised input' }
        //
        const errorMessage = this.safeString (message, 'error');
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
}
