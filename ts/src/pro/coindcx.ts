
//  ---------------------------------------------------------------------------

import coindcxRest from '../coindcx.js';
import { ExchangeError } from '../base/errors.js';
import type { Balances, Dict, Int, OHLCV, OrderBook, Trade } from '../base/types.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
// import { Precise } from '../base/Precise.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coindcx extends coindcxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
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
                'timeframes': {
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
                'OHLCVLimit': 1000,
                'orderbook': {},
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 50000,
            },
        });
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
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const marketId = market['id'];
        const suffix = '@trades';
        const channelName = marketId + suffix;
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
        const timestamp = this.safeInteger (data, 'T');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = event + ':' + symbol;
        const trade = this.parseWsTrade (this.extend (data, { 'timestamp': timestamp }), market);
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
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const makerOrTakerIndex = this.safeString (trade, 'm');
        let takerOrMaker = 'taker';
        if (makerOrTakerIndex === '1') {
            takerOrMaker = 'maker';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
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
        if ((timeframe !== '1m') && (timeframe !== '5m') && (timeframe !== '15m') && (timeframe !== '30m') && (timeframe !== '1h') && (timeframe !== '4h') && (timeframe !== '8h') && (timeframe !== '1d') && (timeframe !== '3d') && (timeframe !== '1w') && (timeframe !== '1M')) {
            throw new ExchangeError (this.id + ' watchOHLCV timeframe argument must be 1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M');
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const channelName = marketId + '_' + interval;
        const messageHash = 'candlestick:' + symbol;
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
        const data = this.safeDict (message, 'data');
        const event = this.safeString (message, 'event');
        const channel = this.safeString (data, 'channel');
        const parts = channel.split ('_');
        const marketId = parts[0] + '_' + parts[1];
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timeframe = this.safeString (data, 'i');
        const messageHash = event + ':' + symbol;
        const parsed = [
            this.safeInteger (data, 't'),
            this.safeFloat (data, 'o'),
            this.safeFloat (data, 'h'),
            this.safeFloat (data, 'l'),
            this.safeFloat (data, 'c'),
            this.safeFloat (data, 'v'),
        ];
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
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        if ((limit !== 10) && (limit !== 20) && (limit !== 50)) {
            throw new ExchangeError (this.id + ' watchOrderBook limit argument must be 10, 20, or 50');
        }
        const channelName = marketId + '@' + 'orderbook' + '@' + limit;
        const messageHash = 'orderbook' + ':' + symbol;
        const request: Dict = {
            'type': 'subscribe',
            'channelName': channelName,
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
        const pair = this.safeString (data, 's');
        const product = this.safeString (data, 'pr');
        const market = this.safeMarket (pair);
        let symbol = market['symbol'];
        if (product === 'spot') {
            symbol = market['symbol'] + ':' + market['quote']; // todo is it right?
        }
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
        const pair = this.safeString (data, 's');
        const product = this.safeString (data, 'pr');
        const market = this.safeMarket (pair);
        let symbol = market['symbol'];
        if (product === 'spot') {
            symbol = market['symbol'] + ':' + market['quote'];
        }
        const increment = this.safeInteger (data, 'vs');
        const storedOrderBook = this.safeValue (this.orderbooks, symbol);
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
        await this.authenticate (params);
        const messageHash = 'balance';
        const url = this.urls['api']['ws'];
        const subscribe: Dict = {
            'type': 'subscribe',
            'channelName': 'coindcx',
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleBalance (client: Client, message) {
        // todo: get the balance info from the message
        //
        const data = this.safeList (message, 'data', []);
        const freeBalance = this.safeValue (data, 'balance', {});
        const usedBalance = this.safeValue (data, 'obalance', {});
        const result: Dict = {
            'info': data,
        };
        const currencyIds = Object.keys (freeBalance);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const account = this.account ();
            account['free'] = this.safeString (freeBalance, currencyId);
            account['used'] = this.safeString (usedBalance, currencyId);
            const code = this.safeCurrencyCode (currencyId);
            result[code] = account;
        }
        this.balance = this.safeBalance (result);
        const messageHash = this.safeString (message, 'oid');
        client.resolve (this.balance, messageHash);
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future (messageHash);
        const isAuthenticated = this.safeValue (client.subscriptions, messageHash);
        if (isAuthenticated === undefined) {
            const body = {
                'channel': 'coindcx',
            };
            const payload = this.json (body).toString ();
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            const request: Dict = {
                'type': 'subscribe',
                'channelName': 'coindcx',
                'apiKey': this.apiKey,
                'authSignature': signature,
            };
            return this.watch (url, messageHash, this.extend (request, params), messageHash);
        }
        return await future;
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
        };
        if (event in methods) {
            const method = methods[event];
            method.call (this, client, message);
        }
    }

    handleErrorMessage (client: Client, message) {
        if (!('error' in message)) {
            return false;
        }
    }
}
