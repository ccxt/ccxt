
//  ---------------------------------------------------------------------------

import deepcoinRest from '../deepcoin.js';
import { BadRequest } from '../base/errors.js';
import type { Dict, Int, OHLCV, Market, Ticker, Trade } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class deepcoin extends deepcoinRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchMarkPrice': false,
                'watchMarkPrices': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchOrderBook': false,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'watchOrderBookForSymbols': false,
                'watchBalance': false,
                'watchLiquidations': false,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': false,
                'watchMyLiquidationsForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchPositions': false,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'unWatchTicker': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.deepcoin.com/streamlet/trade/public/spot?platform=api',
                            'swap': 'wss://stream.deepcoin.com/streamlet/trade/public/swap?platform=api',
                        },
                        'private': 'wss://stream.deepcoin.com/v1/private',
                    },
                },
            },
            'options': {
                'lastRequestId': undefined,
                'timeframes': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '4h': '4h',
                    '12h': '12h',
                    '1d': '1d',
                    '1w': '1w',
                    '1M': '1o',
                    '1y': '1y',
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000, // todo find real value
            },
        });
    }

    ping (client: Client) {
        return 'ping';
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    requestId () {
        const previousValue = this.safeInteger (this.options, 'lastRequestId', 0);
        const newValue = this.sum (previousValue, 1);
        this.options['lastRequestId'] = newValue;
        return newValue;
    }

    createPublicRequest (market: Market, requestId: number, topicID: string, suffix: string = '', unWatch: boolean = false) {
        let marketId = market['symbol']; // spot markets use symbol with slash
        if (market['type'] === 'swap') {
            marketId = market['baseId'] + market['quoteId']; // swap markets use symbol without slash
        }
        let action = '1'; // subscribe
        if (unWatch) {
            action = '0'; // unsubscribe
        }
        const request = {
            'sendTopicAction': {
                'Action': action,
                'FilterValue': 'DeepCoin_' + marketId + suffix,
                'LocalNo': requestId,
                'ResumeNo': -1, // -1 from the end, 0 from the beginning
                'TopicID': topicID,
            },
        };
        return request;
    }

    async watchPublic (market: Market, messageHash: string, topicID: string, params: Dict = {}, suffix: string = ''): Promise<any> {
        const url = this.urls['api']['ws']['public'][market['type']];
        const requestId = this.requestId ();
        const request = this.createPublicRequest (market, requestId, topicID, suffix);
        const subscription = {
            'subHash': messageHash,
            'id': requestId,
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash, subscription);
    }

    async unWatchPublic (market: Market, messageHash: string, topicID: string, params: Dict = {}, subscription: Dict = {}, suffix: string = ''): Promise<any> {
        const url = this.urls['api']['ws']['public'][market['type']];
        const requestId = this.requestId ();
        const client = this.client (url);
        const existingSubscription = this.safeDict (client.subscriptions, messageHash);
        if (existingSubscription === undefined) {
            throw new BadRequest (this.id + ' no subscription for ' + messageHash);
        }
        const subId = this.safeInteger (existingSubscription, 'id');
        const request = this.createPublicRequest (market, subId, topicID, suffix, true); // unsubscribe message uses the same id as the original subscribe message
        const unsubHash = 'unsubscribe::' + messageHash;
        subscription = this.extend (subscription, {
            'subHash': messageHash,
            'unsubHash': unsubHash,
            'symbols': [ market['symbol'] ],
            'id': requestId,
        });
        return await this.watch (url, unsubHash, this.deepExtend (request, params), unsubHash, subscription);
    }

    /**
     * @method
     * @name deepcoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker' + '::' + market['symbol'];
        return await this.watchPublic (market, messageHash, '7', params);
    }

    /**
     * @method
     * @name deepcoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker' + '::' + market['symbol'];
        const subscription = {
            'topic': 'ticker',
        };
        return await this.unWatchPublic (market, messageHash, '7', params, subscription);
    }

    handleTicker (client: Client, message) {
        //
        //     a: 'PO',
        //     m: 'Success',
        //     tt: 1760913034780,
        //     mt: 1760913034780,
        //     r: [
        //         {
        //             d: {
        //                 I: 'BTC/USDT',
        //                 U: 1760913034742,
        //                 PF: 0,
        //                 E: 0,
        //                 O: 108479.9,
        //                 H: 109449.9,
        //                 L: 108238,
        //                 V: 789.3424915,
        //                 T: 43003872.3705223,
        //                 N: 109345,
        //                 M: 87294.7,
        //                 D: 0,
        //                 V2: 3086.4496105,
        //                 T2: 332811624.339836,
        //                 F: 0,
        //                 C: 0,
        //                 BP1: 109344.9,
        //                 AP1: 109345.2
        //             }
        //         }
        //     ]
        //
        const response = this.safeList (message, 'r', []);
        const first = this.safeDict (response, 0, {});
        const data = this.safeDict (first, 'd', {});
        let marketId = this.safeString (data, 'I');
        marketId = marketId.replace ('/', '-'); // replace slash with dash for spot markets
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const parsedTicker = this.parseWsTicker (data, market);
        const messageHash = 'ticker' + '::' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         I: 'BTC/USDT',
        //         U: 1760913034742,
        //         PF: 0,
        //         E: 0,
        //         O: 108479.9,
        //         H: 109449.9,
        //         L: 108238,
        //         V: 789.3424915,
        //         T: 43003872.3705223,
        //         N: 109345,
        //         M: 87294.7,
        //         D: 0,
        //         V2: 3086.4496105,
        //         T2: 332811624.339836,
        //         F: 0,
        //         C: 0,
        //         BP1: 109344.9,
        //         AP1: 109345.2
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'U');
        const high = this.safeNumber (ticker, 'H');
        const low = this.safeNumber (ticker, 'L');
        const open = this.safeNumber (ticker, 'O');
        const last = this.safeNumber (ticker, 'N');
        const bid = this.safeNumber (ticker, 'BP1');
        const ask = this.safeNumber (ticker, 'AP1');
        let baseVolume = this.safeNumber (ticker, 'V');
        let quoteVolume = this.safeNumber (ticker, 'T');
        if (market['inverse']) {
            const temp = baseVolume;
            baseVolume = quoteVolume;
            quoteVolume = temp;
        }
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name deepcoin#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.deepcoin.com/docs/publicWS/lastTransactions
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades' + '::' + market['symbol'];
        const trades = await this.watchPublic (market, messageHash, '2', params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name deepcoin#unWatchTrades
     * @description unWatches the list of most recent trades for a particular symbol
     * @see https://www.deepcoin.com/docs/publicWS/lastTransactions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades' + '::' + market['symbol'];
        const subscription = {
            'topic': 'trades',
        };
        return await this.unWatchPublic (market, messageHash, '2', params, subscription);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "a": "PMT",
        //         "b": 0,
        //         "tt": 1760968672380,
        //         "mt": 1760968672380,
        //         "r": [
        //             {
        //                 "d": {
        //                     "TradeID": "1001056452325378",
        //                     "I": "BTC/USDT",
        //                     "D": "1",
        //                     "P": 111061,
        //                     "V": 0.00137,
        //                     "T": 1760968672
        //                 }
        //             }
        //         ]
        //     }
        //
        const response = this.safeList (message, 'r', []);
        const first = this.safeDict (response, 0, {});
        const data = this.safeDict (first, 'd', {});
        let marketId = this.safeString (data, 'I');
        marketId = marketId.replace ('/', '-'); // replace slash with dash for spot markets
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const strored = this.trades[symbol];
        if (data !== undefined) {
            const trade = this.parseWsTrade (data, market);
            strored.append (trade);
        }
        const messageHash = 'trades' + '::' + symbol;
        client.resolve (strored, messageHash);
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "TradeID": "1001056452325378",
        //         "I": "BTC/USDT",
        //         "D": "1",
        //         "P": 111061,
        //         "V": 0.00137,
        //         "T": 1760968672
        //     }
        //
        const direction = this.safeString (trade, 'D');
        const timestamp = this.safeTimestamp2 (trade, 'TT', 'T');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'TradeID'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.parseTradeSide (direction),
            'price': this.safeString (trade, 'P'),
            'amount': this.safeString (trade, 'V'),
            'cost': undefined, // todo check cost for inverse markets
            'fee': undefined,
        }, market);
    }

    parseTradeSide (direction: string): string {
        const sides = {
            '0': 'buy',
            '1': 'sell', // todo check
        };
        return this.safeString (sides, direction, direction);
    }

    /**
     * @method
     * @name deepcoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.deepcoin.com/docs/publicWS/KLines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const interval = this.safeString (timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv' + '::' + symbol + '::' + timeframe;
        const suffix = '_' + interval;
        const ohlcv = await this.watchPublic (market, messageHash, '11', params, suffix);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name deepcoin#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const interval = this.safeString (timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv' + '::' + symbol + '::' + timeframe;
        const suffix = '_' + interval;
        const subscription = {
            'topic': 'ohlcv',
            'symbolsAndTimeframes': [ [ symbol, timeframe ] ],
        };
        return await this.unWatchPublic (market, messageHash, '11', params, subscription, suffix);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "a": "PK",
        //         "tt": 1760972831580,
        //         "mt": 1760972831580,
        //         "r": [
        //             {
        //                 "d": {
        //                     "I": "BTC/USDT",
        //                     "P": "1m",
        //                     "B": 1760972820,
        //                     "O": 111373,
        //                     "C": 111382.9,
        //                     "H": 111382.9,
        //                     "L": 111373,
        //                     "V": 0.2414172,
        //                     "M": 26888.19693324
        //                 },
        //                 "t": "LK"
        //             }
        //         ]
        //     }
        //
        const response = this.safeList (message, 'r', []);
        const first = this.safeDict (response, 0, {});
        const data = this.safeDict (first, 'd', {});
        let marketId = this.safeString (data, 'I');
        marketId = marketId.replace ('/', '-'); // replace slash with dash for spot markets
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const interval = this.safeString (data, 'P');
        const timeframe = this.findTimeframe (interval);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        if (data !== undefined) {
            const ohlcv = this.parseWsOHLCV (data, market);
            stored.append (ohlcv);
        }
        const messageHash = 'ohlcv' + '::' + symbol + '::' + timeframe;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "I": "BTC/USDT",
        //         "P": "1m",
        //         "B": 1760972820,
        //         "O": 111373,
        //         "C": 111382.9,
        //         "H": 111382.9,
        //         "L": 111373,
        //         "V": 0.2414172,
        //         "M": 26888.19693324
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'B'),
            this.safeNumber (ohlcv, 'O'),
            this.safeNumber (ohlcv, 'H'),
            this.safeNumber (ohlcv, 'L'),
            this.safeNumber (ohlcv, 'C'),
            this.safeNumber (ohlcv, 'V'),
        ];
    }

    handleMessage (client: Client, message) {
        if (message === 'pong') {
            this.handlePong (client, message);
        } else {
            const m = this.safeString (message, 'm');
            if ((m !== undefined) && (m !== 'Success')) {
                this.handleErrorMessage (client, message);
            }
            const action = this.safeString (message, 'a');
            if (action === 'RecvTopicAction') {
                this.handleSubscriptionStatus (client, message);
            } else if (action === 'PO') {
                this.handleTicker (client, message);
            } else if (action === 'PMT') {
                this.handleTrades (client, message);
            } else if (action === 'PK') {
                this.handleOHLCV (client, message);
            }
        }
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "a": "RecvTopicAction",
        //         "m": "Success",
        //         "r": [
        //             {
        //                 "d": {
        //                     "A": "0",
        //                     "L": 1,
        //                     "T": "7",
        //                     "F": "DeepCoin_BTC/USDT",
        //                     "R": -1
        //                 }
        //             }
        //         ]
        //     }
        //
        const response = this.safeList (message, 'r', []);
        const first = this.safeDict (response, 0, {});
        const data = this.safeDict (first, 'd', {});
        const action = this.safeString (data, 'A'); // 1 = subscribe, 0 = unsubscribe
        if (action === '0') {
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subId = this.safeInteger (data, 'L');
            const subscription = this.safeDict (subscriptionsById, subId, {}); // original subscription
            const subHash = this.safeString (subscription, 'subHash');
            const unsubHash = 'unsubscribe::' + subHash;
            const unsubsciption = this.safeDict (client.subscriptions, unsubHash, {}); // unWatch subscription
            this.handleUnSubscription (client, unsubsciption);
        }
    }

    handleUnSubscription (client: Client, subscription: Dict) {
        const subHash = this.safeString (subscription, 'subHash');
        const unsubHash = this.safeString (subscription, 'unsubHash');
        this.cleanUnsubscription (client, subHash, unsubHash);
        this.cleanCache (subscription);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "a": "RecvTopicAction",
        //         "m": "subscription cluster does not "exist": BTC/USD",
        //         "r": [
        //             {
        //                 "d": {
        //                     "A": "1",
        //                     "L": 1,
        //                     "T": "7",
        //                     "F": "DeepCoin_BTC/USD",
        //                     "R": -1
        //                 }
        //             }
        //         ]
        //     }
        //
        //     RecvTopicAction
        //     unsupportedAction
        //     [ { d: { A: '2', L: 1, T: '7', F: 'DeepCoin_BTCUSD', R: -1 } } ]
        //
        //     RecvTopicAction
        //     localIDNotExist
        //     [ { d: { A: '0', L: 2, T: '7', F: 'DeepCoin_BTC/USDT', R: -1 } } ]
        //
        return message; // todo add error handling
    }
}
