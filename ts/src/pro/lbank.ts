
import lbankRest from '../lbank.js';
import { ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Balances, Int, Str, Trade, OrderBook, Order, OHLCV, Ticker, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class lbank extends lbankRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'fetchOHLCVWs': true,
                'fetchOrderBookWs': true,
                'fetchTickerWs': true,
                'fetchTradesWs': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://www.lbkex.net/ws/V2/',
                },
            },
            'options': {
                'watchOHLCV': {
                    'timeframes': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '1hr',
                        '4h': '4hr',
                        '1d': 'day',
                        '1w': 'week',
                        '1M': 'month',
                        '1y': 'year',
                    },
                },
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    requestId () {
        this.lockId ();
        const previousValue = this.safeInteger (this.options, 'requestId', 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'] = newValue;
        this.unlockId ();
        return newValue;
    }

    /**
     * @method
     * @name lbank#fetchOHLCVWs
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCVWs (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const watchOHLCVOptions = this.safeValue (this.options, 'watchOHLCV', {});
        const timeframes = this.safeValue (watchOHLCVOptions, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe, timeframe);
        const messageHash = 'fetchOHLCV:' + market['symbol'] + ':' + timeframeId;
        const message: Dict = {
            'action': 'request',
            'request': 'kbar',
            'kbar': timeframeId,
            'pair': market['id'],
        };
        if (since !== undefined) {
            message['start'] = this.parseToInt (Math.floor (since / 1000));
        }
        if (limit !== undefined) {
            message['size'] = limit;
        }
        const request = this.deepExtend (message, params);
        const requestId = this.requestId ();
        return await this.watch (url, messageHash, request, requestId, request);
    }

    /**
     * @method
     * @name lbank#watchOHLCV
     * @see https://www.lbank.com/en-US/docs/index.html#subscription-of-k-line-data
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const watchOHLCVOptions = this.safeValue (this.options, 'watchOHLCV', {});
        const timeframes = this.safeValue (watchOHLCVOptions, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'];
        const subscribe: Dict = {
            'action': 'subscribe',
            'subscribe': 'kbar',
            'kbar': timeframeId,
            'pair': market['id'],
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // request
        //    {
        //        "records":[
        //           [
        //              1705364400,
        //              42614,
        //              42624.57,
        //              42532.15,
        //              42537.43,
        //              13.2615,
        //              564568.931565,
        //              433
        //           ]
        //        ],
        //        "columns":[
        //           "timestamp",
        //           "open",
        //           "high",
        //           "low",
        //           "close",
        //           "volume",
        //           "turnover",
        //           "count"
        //        ],
        //        "SERVER":"V2",
        //        "count":1,
        //        "kbar":"5min",
        //        "type":"kbar",
        //        "pair":"btc_usdt",
        //        "TS":"2024-01-16T08:29:41.718"
        //    }
        // subscribe
        //      {
        //          SERVER: 'V2',
        //          kbar: {
        //              a: 26415.891476,
        //              c: 19315.51,
        //              t: '2022-10-02T12:44:00.000',
        //              v: 1.3676,
        //              h: 19316.66,
        //              slot: '1min',
        //              l: 19315.51,
        //              n: 1,
        //              o: 19316.66
        //          },
        //          type: 'kbar',
        //          pair: 'btc_usdt',
        //          TS: '2022-10-02T12:44:15.865'
        //      }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        const watchOHLCVOptions = this.safeValue (this.options, 'watchOHLCV', {});
        const timeframes = this.safeValue (watchOHLCVOptions, 'timeframes', {});
        const records = this.safeValue (message, 'records');
        if (records !== undefined) {  // from request
            const rawOHLCV = this.safeValue (records, 0, []);
            const parsed = [
                this.safeInteger (rawOHLCV, 0),
                this.safeNumber (rawOHLCV, 1),
                this.safeNumber (rawOHLCV, 2),
                this.safeNumber (rawOHLCV, 3),
                this.safeNumber (rawOHLCV, 4),
                this.safeNumber (rawOHLCV, 5),
            ];
            const timeframeId = this.safeString (message, 'kbar');
            const timeframe = this.findTimeframe (timeframeId, timeframes);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            const messageHash = 'fetchOHLCV:' + symbol + ':' + timeframeId;
            client.resolve (stored, messageHash);
        } else {  // from subscription
            const rawOHLCV = this.safeValue (message, 'kbar', {});
            const timeframeId = this.safeString (rawOHLCV, 'slot');
            const datetime = this.safeString (rawOHLCV, 't');
            const parsed = [
                this.parse8601 (datetime),
                this.safeNumber (rawOHLCV, 'o'),
                this.safeNumber (rawOHLCV, 'h'),
                this.safeNumber (rawOHLCV, 'l'),
                this.safeNumber (rawOHLCV, 'c'),
                this.safeNumber (rawOHLCV, 'v'),
            ];
            const timeframe = this.findTimeframe (timeframeId, timeframes);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
            client.resolve (stored, messageHash);
        }
    }

    /**
     * @method
     * @name lbank#fetchTickerWs
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickerWs (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'fetchTicker:' + market['symbol'];
        const message: Dict = {
            'action': 'request',
            'request': 'tick',
            'pair': market['id'],
        };
        const request = this.deepExtend (message, params);
        const requestId = this.requestId ();
        return await this.watch (url, messageHash, request, requestId, request);
    }

    /**
     * @method
     * @name lbank#watchTicker
     * @see https://www.lbank.com/en-US/docs/index.html#market
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + market['symbol'];
        const message: Dict = {
            'action': 'subscribe',
            'subscribe': 'tick',
            'pair': market['id'],
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleTicker (client, message) {
        //
        //     {
        //         "tick":{
        //             "to_cny":76643.5,
        //             "high":0.02719761,
        //             "vol":497529.7686,
        //             "low":0.02603071,
        //             "change":2.54,
        //             "usd":299.12,
        //             "to_usd":11083.66,
        //             "dir":"sell",
        //             "turnover":13224.0186,
        //             "latest":0.02698749,
        //             "cny":2068.41
        //         },
        //         "type":"tick",
        //         "pair":"eth_btc",
        //         "SERVER":"V2",
        //         "TS":"2019-07-01T11:33:55.188"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const parsedTicker = this.parseWsTicker (message, market);
        this.tickers[symbol] = parsedTicker;
        let messageHash = 'ticker:' + symbol;
        client.resolve (parsedTicker, messageHash);
        messageHash = 'fetchTicker:' + symbol;
        client.resolve (parsedTicker, messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         "tick":{
        //             "to_cny":76643.5,
        //             "high":0.02719761,
        //             "vol":497529.7686,
        //             "low":0.02603071,
        //             "change":2.54,
        //             "usd":299.12,
        //             "to_usd":11083.66,
        //             "dir":"sell",
        //             "turnover":13224.0186,
        //             "latest":0.02698749,
        //             "cny":2068.41
        //         },
        //         "type":"tick",
        //         "pair":"eth_btc",
        //         "SERVER":"V2",
        //         "TS":"2019-07-01T11:33:55.188"
        //     }
        //
        const marketId = this.safeString (ticker, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const datetime = this.safeString (ticker, 'TS');
        const tickerData = this.safeValue (ticker, 'tick');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'high': this.safeString (tickerData, 'high'),
            'low': this.safeString (tickerData, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (tickerData, 'latest'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (tickerData, 'change'),
            'average': undefined,
            'baseVolume': this.safeString (tickerData, 'vol'),
            'quoteVolume': this.safeString (tickerData, 'turnover'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name lbank#fetchTradesWs
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTradesWs (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'fetchTrades:' + market['symbol'];
        if (limit === undefined) {
            limit = 10;
        }
        const message: Dict = {
            'action': 'request',
            'request': 'trade',
            'pair': market['id'],
            'size': limit,
        };
        const request = this.deepExtend (message, params);
        const requestId = this.requestId ();
        return await this.watch (url, messageHash, request, requestId, request);
    }

    /**
     * @method
     * @name lbank#watchTrades
     * @see https://www.lbank.com/en-US/docs/index.html#trade-record
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'trades:' + market['symbol'];
        const message: Dict = {
            'action': 'subscribe',
            'subscribe': 'trade',
            'pair': market['id'],
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        const result = this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
        return this.sortBy (result, 'timestamp') as Trade[]; // needed bcz of https://github.com/ccxt/ccxt/actions/runs/21364685870/job/61493905690?pr=27750#step:11:1067
    }

    handleTrades (client, message) {
        //
        // request
        //     {
        //         columns: [ 'timestamp', 'price', 'volume', 'direction' ],
        //         SERVER: 'V2',
        //         count: 100,
        //         trades: [],
        //         type: 'trade',
        //         pair: 'btc_usdt',
        //         TS: '2024-01-16T08:48:24.470'
        //     }
        // subscribe
        //     {
        //         "trade":{
        //             "volume":6.3607,
        //             "amount":77148.9303,
        //             "price":12129,
        //             "direction":"sell", // buy, sell, buy_market, sell_market, buy_maker, sell_maker, buy_ioc, sell_ioc, buy_fok, sell_fok
        //             "TS":"2019-06-28T19:55:49.460"
        //         },
        //         "type":"trade",
        //         "pair":"btc_usdt",
        //         "SERVER":"V2",
        //         "TS":"2019-06-28T19:55:49.466"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const rawTrade = this.safeValue (message, 'trade');
        const rawTrades = this.safeValue (message, 'trades', [ rawTrade ]);
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = this.parseWsTrade (rawTrades[i], market);
            trade['symbol'] = symbol;
            stored.append (trade);
        }
        this.trades[symbol] = stored;
        let messageHash = 'trades:' + symbol;
        client.resolve (this.trades[symbol], messageHash);
        messageHash = 'fetchTrades:' + symbol;
        client.resolve (this.trades[symbol], messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // request
        //    [ 'timestamp', 'price', 'volume', 'direction' ]
        // subscribe
        //    {
        //        "volume":6.3607,
        //        "amount":77148.9303,
        //        "price":12129,
        //        "direction":"sell", // buy, sell, buy_market, sell_market, buy_maker, sell_maker, buy_ioc, sell_ioc, buy_fok, sell_fok
        //        "TS":"2019-06-28T19:55:49.460"
        //    }
        //
        let timestamp = this.safeInteger (trade, 0);
        const datetime = (timestamp !== undefined) ? (this.iso8601 (timestamp)) : (this.safeString (trade, 'TS'));
        if (timestamp === undefined) {
            timestamp = this.parse8601 (datetime);
        }
        const rawSide = this.safeString2 (trade, 'direction', 3);
        const parts = rawSide.split ('_');
        const firstPart = this.safeString (parts, 0);
        const secondPart = this.safeString (parts, 1);
        let side = firstPart;
        // reverse if it was 'maker'
        if (secondPart !== undefined && secondPart === 'maker') {
            side = (side === 'buy') ? 'sell' : 'buy';
        }
        return this.safeTrade ({
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': undefined,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': this.safeString2 (trade, 'price', 1),
            'amount': this.safeString2 (trade, 'volume', 2),
            'cost': this.safeString (trade, 'amount'),
            'fee': undefined,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name lbank#watchOrders
     * @see https://www.lbank.com/en-US/docs/index.html#update-subscribed-orders
     * @description get the list of trades associated with the user
     * @param {string} [symbol] unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const key = await this.authenticate (params);
        const url = this.urls['api']['ws'];
        let messageHash = undefined;
        let pair = 'all';
        if (symbol === undefined) {
            messageHash = 'orders:all';
        } else {
            const market = this.market (symbol);
            symbol = this.symbol (symbol);
            messageHash = 'orders:' + market['symbol'];
            pair = market['id'];
        }
        const message: Dict = {
            'action': 'subscribe',
            'subscribe': 'orderUpdate',
            'subscribeKey': key,
            'pair': pair,
        };
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //     {
        //         "orderUpdate":{
        //             "amount":"0.003",
        //             "orderStatus":2,
        //             "price":"0.02455211",
        //             "role":"maker",
        //             "updateTime":1561704577786,
        //             "uuid":"d0db191d-xxxxx-4418-xxxxx-fbb1xxxx2ea9",
        //             "txUuid":"da88f354d5xxxxxxa12128aa5bdcb3",
        //             "volumePrice":"0.00007365633"
        //         },
        //         "pair":"eth_btc",
        //         "type":"orderUpdate",
        //         "SERVER":"V2",
        //         "TS":"2019-06-28T14:49:37.816"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let myOrders = undefined;
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            myOrders = new ArrayCacheBySymbolById (limit);
        } else {
            myOrders = this.orders;
        }
        const order = this.parseWsOrder (message);
        myOrders.append (order);
        this.orders = myOrders;
        client.resolve (myOrders, 'orders');
        const messageHash = 'orders:' + symbol;
        client.resolve (myOrders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         "orderUpdate":{
        //             "amount":"0.003",
        //             "orderStatus":2,
        //             "price":"0.02455211",
        //             "role":"maker",
        //             "updateTime":1561704577786,
        //             "uuid":"d0db191d-xxxxx-4418-xxxxx-fbb1xxxx2ea9",
        //             "txUuid":"da88f354d5xxxxxxa12128aa5bdcb3",
        //             "volumePrice":"0.00007365633"
        //         },
        //         "pair":"eth_btc",
        //         "type":"orderUpdate",
        //         "SERVER":"V2",
        //         "TS":"2019-06-28T14:49:37.816"
        //     }
        //     {
        //         "SERVER": "V2",
        //         "orderUpdate": {
        //            "accAmt": "0",
        //            "amount": "0",
        //            "avgPrice": "0",
        //            "customerID": "",
        //            "orderAmt": "5",
        //            "orderPrice": "0.009834",
        //            "orderStatus": 0,
        //            "price": "0.009834",
        //            "remainAmt": "5",
        //            "role": "taker",
        //            "symbol": "lbk_usdt",
        //            "type": "buy_market",
        //            "updateTime": 1705676718532,
        //            "uuid": "9b94ab2d-a510-4abe-a784-44a9d9c38ec7",
        //            "volumePrice": "0"
        //         },
        //         "type": "orderUpdate",
        //         "pair": "lbk_usdt",
        //         "TS": "2024-01-19T23:05:18.548"
        //     }
        //
        const orderUpdate = this.safeValue (order, 'orderUpdate', {});
        const rawType = this.safeString (orderUpdate, 'type', '');
        const typeParts = rawType.split ('_');
        const side = this.safeString (typeParts, 0);
        const exchangeType = this.safeString (typeParts, 1);
        let type = undefined;
        if (rawType !== 'buy' && rawType !== 'sell') {
            type = (exchangeType === 'market') ? 'market' : 'limit';
        }
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeInteger (orderUpdate, 'updateTime');
        const status = this.safeString (orderUpdate, 'orderStatus');
        const orderAmount = this.safeString (orderUpdate, 'orderAmt');
        let cost = undefined;
        if ((type === 'market') && (side === 'buy')) {
            cost = orderAmount;
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (orderUpdate, 'uuid'),
            'clientOrderId': this.safeString (orderUpdate, 'customerID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (orderUpdate, 'updateTime'),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': this.safeString2 (orderUpdate, 'price', 'orderPrice'),
            'stopPrice': undefined,
            'average': this.safeString (orderUpdate, 'avgPrice'),
            'amount': this.safeString2 (orderUpdate, 'amount', 'orderAmt'),
            'remaining': this.safeString (orderUpdate, 'remainAmt'),
            'filled': this.safeString (orderUpdate, 'accAmt'),
            'status': this.parseWsOrderStatus (status),
            'fee': undefined,
            'cost': cost,
            'trades': undefined,
        }, market);
    }

    parseWsOrderStatus (status) {
        const statuses: Dict = {
            '-1': 'canceled',  // Withdrawn
            '0': 'open',   // Unsettled
            '1': 'open',   // Partial sale
            '2': 'closed', // Completed
            '4': 'closed',  // Withrawing
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name lbank#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.lbank.com/docs/index.html#update-subscribed-asset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const key = await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const messageHash = 'balance';
        const message: Dict = {
            'action': 'subscribe',
            'subscribe': 'assetUpdate',
            'subscribeKey': key,
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleBalance (client: Client, message) {
        //
        //     {
        //         "data": {
        //             "asset": "114548.31881315",
        //             "assetCode": "usdt",
        //             "free": "97430.6739041",
        //             "freeze": "17117.64490905",
        //             "time": 1627300043270,
        //             "type": "ORDER_CREATE"
        //         },
        //         "SERVER": "V2",
        //         "type": "assetUpdate",
        //         "TS": "2021-07-26T19:48:03.548"
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const timestamp = this.parse8601 (this.safeString (message, 'TS'));
        const datetime = this.iso8601 (timestamp);
        this.balance['info'] = data;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = datetime;
        const currencyId = this.safeString (data, 'assetCode');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'free');
        account['used'] = this.safeString (data, 'freeze');
        account['total'] = this.safeString (data, 'asset');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name lbank#fetchOrderBookWs
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int|undefined} limit the maximum amount of order book entries to return
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
     */
    async fetchOrderBookWs (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'fetchOrderbook:' + market['symbol'];
        if (limit === undefined) {
            limit = 100;
        }
        const subscribe: Dict = {
            'action': 'request',
            'request': 'depth',
            'depth': limit,
            'pair': market['id'],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name lbank#watchOrderBook
     * @see https://www.lbank.com/en-US/docs/index.html#market-depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int|undefined} limit the maximum amount of order book entries to return
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + market['symbol'];
        params = this.omit (params, 'aggregation');
        if (limit === undefined) {
            limit = 100;
        }
        const subscribe: Dict = {
            'action': 'subscribe',
            'subscribe': 'depth',
            'depth': limit,
            'pair': market['id'],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        // request
        //    {
        //        "SERVER":"V2",
        //        "asks":[
        //           [
        //              42585.84,
        //              1.4422
        //           ],
        //           ...
        //        ],
        //        "bids":[
        //           [
        //              42585.83,
        //              1.8054
        //           ],
        //          ,,,
        //        ],
        //        "count":100,
        //        "type":"depth",
        //        "pair":"btc_usdt",
        //        "TS":"2024-01-16T08:26:00.413"
        //    }
        // subscribe
        //     {
        //         "depth": {
        //             "asks": [
        //                 [
        //                     0.0252,
        //                     0.5833
        //                 ],
        //                 [
        //                     0.025215,
        //                     4.377
        //                 ],
        //                 ...
        //             ],
        //             "bids": [
        //                 [
        //                     0.025135,
        //                     3.962
        //                 ],
        //                 [
        //                     0.025134,
        //                     3.46
        //                 ],
        //                 ...
        //             ]
        //         },
        //         "count": 100,
        //         "type": "depth",
        //         "pair": "eth_btc",
        //         "SERVER": "V2",
        //         "TS": "2019-06-28T17:49:22.722"
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const orderBook = this.safeValue (message, 'depth', message);
        const datetime = this.safeString (message, 'TS');
        const timestamp = this.parse8601 (datetime);
        // let orderbook = this.safeValue (this.orderbooks, symbol);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (orderBook, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        let messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
        messageHash = 'fetchOrderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    handleErrorMessage (client, message) {
        //
        //    {
        //        SERVER: 'V2',
        //        message: "Missing parameter ['kbar']",
        //        status: 'error',
        //        TS: '2024-01-16T08:09:43.314'
        //    }
        //
        const errMsg = this.safeString (message, 'message', '');
        const error = new ExchangeError (this.id + ' ' + errMsg);
        client.reject (error);
    }

    async handlePing (client: Client, message) {
        //
        //  { ping: 'a13a939c-5f25-4e06-9981-93cb3b890707', action: 'ping' }
        //
        const pingId = this.safeString (message, 'ping');
        try {
            await client.send ({
                'action': 'pong',
                'pong': pingId,
            });
        } catch (e) {
            this.onError (client, e);
        }
    }

    handleMessage (client, message) {
        const status = this.safeString (message, 'status');
        if (status === 'error') {
            this.handleErrorMessage (client, message);
            return;
        }
        const type = this.safeString2 (message, 'type', 'action');
        if (type === 'ping') {
            this.spawn (this.handlePing, client, message);
            return;
        }
        const handlers: Dict = {
            'kbar': this.handleOHLCV,
            'depth': this.handleOrderBook,
            'trade': this.handleTrades,
            'tick': this.handleTicker,
            'orderUpdate': this.handleOrders,
            'assetUpdate': this.handleBalance,
        };
        const handler = this.safeValue (handlers, type);
        if (handler !== undefined) {
            handler.call (this, client, message);
        }
    }

    async authenticate (params = {}) {
        // when we implement more private streams, we need to refactor the authentication
        // to be concurent-safe and respect the same authentication token
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const now = this.milliseconds ();
        const messageHash = 'authenticated';
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials ();
            const response = await this.spotPrivatePostSubscribeGetKey (params);
            //
            // {"result":true,"data":"4e9958623e6006bd7b13ff9f36c03b36132f0f8da37f70b14ff2c4eab1fe0c97","error_code":0,"ts":1705602277198}
            //
            const result = this.safeValue (response, 'result');
            if (result !== true) {
                throw new ExchangeError (this.id + ' failed to get subscribe key');
            }
            client.subscriptions['authenticated'] = {
                'key': this.safeString (response, 'data'),
                'expires': this.sum (now, 3300000), // SubscribeKey lasts one hour, refresh it every 55 minutes
            };
        } else {
            const expires = this.safeInteger (authenticated, 'expires', 0);
            if (expires < now) {
                const request: Dict = {
                    'subscribeKey': authenticated['key'],
                };
                const response = await this.spotPrivatePostSubscribeRefreshKey (this.extend (request, params));
                //
                //    {"result": "true"}
                //
                const result = this.safeString (response, 'result');
                if (result !== 'true') {
                    throw new ExchangeError (this.id + ' failed to refresh the SubscribeKey');
                }
                client['subscriptions']['authenticated']['expires'] = this.sum (now, 3300000); // SubscribeKey lasts one hour, refresh it 5 minutes before it expires
            }
        }
        return client.subscriptions['authenticated']['key'];
    }
}
