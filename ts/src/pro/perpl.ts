//  ---------------------------------------------------------------------------

import perplRest from '../perpl.js';
import { ExchangeError } from '../base/errors.js';
import Precise from '../base/Precise.js';
import Client from '../base/ws/Client.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Dict, FundingRate, FundingRates, Int, Market, OHLCV, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';

//  ---------------------------------------------------------------------------

export default class perpl extends perplRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'unWatchOHLCV': true,
                'unWatchTrades': true,
                'watchBalance': false,
                'watchFundingRate': true,
                'watchFundingRates': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://app.perpl.xyz/ws/v1/market-data',
                        'private': 'wss://app.perpl.xyz/ws/v1/trading',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://testnet.perpl.xyz/ws/v1/market-data',
                        'private': 'wss://testnet.perpl.xyz/ws/v1/trading',
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name perpl#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#available-streams
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#candle-messages
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of [OHLCV structures]{@link https://docs.ccxt.com/#/?id=ohlcv-structure}
     */
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const stream = 'candles@' + market['id'] + '*' + resolution;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'mt': 5,
            'subs': [
                {
                    'stream': stream,
                    'subscribe': true,
                },
            ],
        };
        const subscription: Dict = {
            'stream': stream,
            'symbol': symbol,
            'timeframe': timeframe,
            'messageHash': messageHash,
            'type': 'ohlcv',
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name perpl#unWatchOHLCV
     * @description unWatches historical candlestick data for a market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#subscribing
     * @param {string} symbol unified symbol of the market to stop watching OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} an unsubscription confirmation
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const subMessageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const stream = 'candles@' + market['id'] + '*' + resolution;
        const url = this.urls['api']['ws']['public'];
        const client = this.client (url);
        const activeSubscription = this.safeDict (client.subscriptions, subMessageHash, {});
        const request: Dict = {
            'mt': 5,
            'subs': [
                {
                    'stream': stream,
                    'subscribe': false,
                },
            ],
        };
        const subscription: Dict = {
            'stream': stream,
            'symbol': symbol,
            'timeframe': timeframe,
            'messageHash': messageHash,
            'subMessageHash': subMessageHash,
            'unsubscribe': true,
            'sid': this.safeString (activeSubscription, 'sid'),
            'type': 'ohlcv',
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    /**
     * @method
     * @name perpl#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#market-state-update-mt-9
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name perpl#watchTickers
     * @description watches price tickers for all markets or a specific list of markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#market-state-update-mt-9
     * @param {string[]} [symbols] unified symbols of the markets to fetch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const messageHashes: string[] = [];
        if (symbols === undefined) {
            messageHashes.push ('tickers');
        } else {
            const symbolsLength = symbols.length;
            if (symbolsLength === 0) {
                messageHashes.push ('tickers');
            } else {
                for (let i = 0; i < symbols.length; i++) {
                    messageHashes.push ('ticker:' + symbols[i]);
                }
            }
        }
        let chainIdKey = 'chainId';
        if (this.isSandboxModeEnabled) {
            chainIdKey = 'sandboxChainId';
        }
        const chainId = this.safeString (this.options, chainIdKey);
        const stream = 'market-state@' + chainId;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'mt': 5,
            'subs': [
                {
                    'stream': stream,
                    'subscribe': true,
                },
            ],
        };
        const subscription: Dict = {
            'stream': stream,
            'messageHash': 'tickers',
            'messageHashes': messageHashes,
            'type': 'ticker',
        };
        const tickers = await this.watchMultiple (url, messageHashes, this.extend (request, params), [ 'tickers' ], subscription);
        if (this.newUpdates) {
            if (messageHashes[0] === 'tickers') {
                return this.filterByArrayTickers (tickers, 'symbol', symbols);
            }
            const result: Tickers = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArrayTickers (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name perpl#watchFundingRate
     * @description watches the current funding rate for a symbol
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#available-streams
     * @see https://github.com/PerplFoundation/api-docs/blob/main/types.md#fundingevent
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const fundingRates = await this.watchFundingRates ([ symbol ], params);
        return fundingRates[symbol];
    }

    /**
     * @method
     * @name perpl#watchFundingRates
     * @description watches the current funding rates for all markets or a specific list of markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#available-streams
     * @see https://github.com/PerplFoundation/api-docs/blob/main/types.md#fundingevent
     * @param {string[]} [symbols] unified symbols of the markets to fetch funding rates for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async watchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const messageHashes: string[] = [];
        if (symbols === undefined) {
            messageHashes.push ('fundingRates');
        } else {
            const symbolsLength = symbols.length;
            if (symbolsLength === 0) {
                messageHashes.push ('fundingRates');
            } else {
                for (let i = 0; i < symbols.length; i++) {
                    messageHashes.push ('fundingRate:' + symbols[i]);
                }
            }
        }
        let chainIdKey = 'chainId';
        if (this.isSandboxModeEnabled) {
            chainIdKey = 'sandboxChainId';
        }
        const chainId = this.safeString (this.options, chainIdKey);
        const stream = 'funding@' + chainId;
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'mt': 5,
            'subs': [
                {
                    'stream': stream,
                    'subscribe': true,
                },
            ],
        };
        const subscription: Dict = {
            'stream': stream,
            'messageHash': 'fundingRates',
            'messageHashes': messageHashes,
            'type': 'fundingRate',
        };
        const fundingRates = await this.watchMultiple (url, messageHashes, this.extend (request, params), [ 'fundingRates' ], subscription);
        if (this.newUpdates) {
            if (messageHashes[0] === 'fundingRates') {
                return this.filterByArray (fundingRates, 'symbol', symbols);
            }
            const result: FundingRates = {};
            result[fundingRates['symbol']] = fundingRates;
            return result;
        }
        return this.filterByArray (this.fundingRates, 'symbol', symbols);
    }

    /**
     * @method
     * @name perpl#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#available-streams
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#trade-messages
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const stream = 'trades@' + market['id'];
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'mt': 5,
            'subs': [
                {
                    'stream': stream,
                    'subscribe': true,
                },
            ],
        };
        const subscription: Dict = {
            'stream': stream,
            'symbol': symbol,
            'messageHash': messageHash,
            'type': 'trades',
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name perpl#unWatchTrades
     * @description unWatches information on multiple trades made in a market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/websocket.md#subscribing
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} an unsubscription confirmation
     */
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subMessageHash = 'trade:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const stream = 'trades@' + market['id'];
        const url = this.urls['api']['ws']['public'];
        const client = this.client (url);
        const activeSubscription = this.safeDict (client.subscriptions, subMessageHash, {});
        const request: Dict = {
            'mt': 5,
            'subs': [
                {
                    'stream': stream,
                    'subscribe': false,
                },
            ],
        };
        const subscription: Dict = {
            'stream': stream,
            'symbol': symbol,
            'messageHash': messageHash,
            'subMessageHash': subMessageHash,
            'unsubscribe': true,
            'sid': this.safeString (activeSubscription, 'sid'),
            'type': 'trades',
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    handleSubscriptionResponse (client: Client, message: Dict) {
        //
        //     {
        //         "mt": 6,
        //         "subs": [
        //             {
        //                 "stream": "trades@1",
        //                 "sid": 7,
        //                 "status": { "code": 0 }
        //             }
        //         ]
        //     }
        //
        const subscriptions = this.safeList (message, 'subs', []);
        const clientSubscriptionKeys = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptions.length; i++) {
            const response = this.safeDict (subscriptions, i, {});
            const stream = this.safeString (response, 'stream');
            let subscription: Dict | undefined = undefined;
            for (let j = 0; j < clientSubscriptionKeys.length; j++) {
                const subscriptionKey = clientSubscriptionKeys[j];
                const currentSubscription = this.safeDict (client.subscriptions, subscriptionKey);
                if ((currentSubscription !== undefined) && (this.safeString (currentSubscription, 'stream') === stream)) {
                    const currentIsUnsubscription = this.safeBool (currentSubscription, 'unsubscribe', false);
                    if (currentIsUnsubscription || (subscription === undefined)) {
                        subscription = currentSubscription;
                    }
                }
            }
            if (subscription === undefined) {
                continue;
            }
            const messageHash = this.safeString (subscription, 'messageHash');
            if (messageHash === undefined) {
                continue;
            }
            const status = this.safeDict (response, 'status', {});
            const code = this.safeInteger (status, 'code', 0);
            if (code !== 0) {
                const error = new ExchangeError (this.id + ' ' + this.json (response));
                client.reject (error, messageHash);
                const messageHashes = this.safeList (subscription, 'messageHashes', []);
                for (let j = 0; j < messageHashes.length; j++) {
                    client.reject (error, this.safeString (messageHashes, j));
                }
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
                continue;
            }
            const isUnsubscription = this.safeBool (subscription, 'unsubscribe', false);
            if (isUnsubscription) {
                const subMessageHash = this.safeString (subscription, 'subMessageHash');
                const sid = this.safeString (subscription, 'sid');
                this.cleanUnsubscription (client, subMessageHash, messageHash);
                if ((sid !== undefined) && (sid in client.subscriptions)) {
                    delete client.subscriptions[sid];
                }
                const symbol = this.safeString (subscription, 'symbol');
                const subscriptionType = this.safeString (subscription, 'type');
                if ((subscriptionType === 'trades') && (symbol !== undefined) && (symbol in this.trades)) {
                    delete this.trades[symbol];
                } else if ((subscriptionType === 'ohlcv') && (symbol !== undefined) && (symbol in this.ohlcvs)) {
                    const timeframe = this.safeString (subscription, 'timeframe');
                    if ((timeframe !== undefined) && (timeframe in this.ohlcvs[symbol])) {
                        delete this.ohlcvs[symbol][timeframe];
                    }
                }
            } else {
                const sid = this.safeString (response, 'sid');
                if (sid === undefined) {
                    const error = new ExchangeError (this.id + ' subscription response is missing sid ' + this.json (response));
                    client.reject (error, messageHash);
                    const messageHashes = this.safeList (subscription, 'messageHashes', []);
                    for (let j = 0; j < messageHashes.length; j++) {
                        client.reject (error, this.safeString (messageHashes, j));
                    }
                    if (messageHash in client.subscriptions) {
                        delete client.subscriptions[messageHash];
                    }
                    continue;
                }
                subscription['sid'] = sid;
                client.subscriptions[sid] = subscription;
            }
        }
    }

    handleOHLCV (client: Client, message: Dict) {
        //
        //     {
        //         "mt": 12,
        //         "sid": 8,
        //         "at": { "b": 97001533, "t": 1787037901000 },
        //         "r": 60,
        //         "d": [
        //             { "t": 1787037900000, "o": 642821, "c": 642900, "h": 642900, "l": 642800, "v": "125000000", "n": 4 }
        //         ]
        //     }
        //
        const sid = this.safeString (message, 'sid');
        const subscription = this.safeDict (client.subscriptions, sid, {});
        const symbol = this.safeString (subscription, 'symbol');
        const timeframe = this.safeString (subscription, 'timeframe');
        if ((symbol === undefined) || (timeframe === undefined)) {
            return;
        }
        const market = this.market (symbol);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const data = this.safeList (message, 'd', []);
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeDict (data, i, {});
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        const messageHash = this.safeString (subscription, 'messageHash');
        client.resolve (stored, messageHash);
    }

    handleTickers (client: Client, message: Dict) {
        //
        //     {
        //         "mt": 9,
        //         "d": {
        //             "1": {
        //                 "at": { "b": 97001267, "t": 1787037820000 },
        //                 "orl": 642508,
        //                 "mrk": 642693,
        //                 "lst": 642517,
        //                 "mid": 642516,
        //                 "bid": 642516,
        //                 "ask": 642517,
        //                 "prv": 634970,
        //                 "dv": 127119980,
        //                 "dva": "81324722336080",
        //                 "oi": 4056609,
        //                 "tvl": "933252571361"
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (message, 'd', {});
        const marketIds = Object.keys (data);
        const updatedTickers: Tickers = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = this.safeString (marketIds, i);
            if (marketId === undefined) {
                continue;
            }
            const state = this.safeDict (data, marketId);
            if (state === undefined) {
                continue;
            }
            const market = this.safeMarket (marketId);
            const rawTicker: Dict = {
                'id': marketId,
                'state': state,
            };
            const ticker = this.parseTicker (rawTicker, market);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol === undefined) {
                continue;
            }
            this.tickers[symbol] = ticker;
            updatedTickers[symbol] = ticker;
            client.resolve (ticker, 'ticker:' + symbol);
        }
        client.resolve (updatedTickers, 'tickers');
    }

    handleFundingRates (client: Client, message: Dict) {
        //
        //     {
        //         "mt": 10,
        //         "d": {
        //             "1": {
        //                 "at": { "b": 97001410, "t": 1787037900000 },
        //                 "feb": 97001410,
        //                 "rate": 125,
        //                 "idx": 642508,
        //                 "ppl": 42,
        //                 "sum": 123456,
        //                 "div": 1000000
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (message, 'd', {});
        const marketIds = Object.keys (data);
        const updatedFundingRates: FundingRates = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = this.safeString (marketIds, i);
            if (marketId === undefined) {
                continue;
            }
            const funding = this.safeDict (data, marketId);
            if (funding === undefined) {
                continue;
            }
            const market = this.safeMarket (marketId);
            const marketInfo = this.safeDict (market, 'info', {});
            const at = this.safeDict (funding, 'at', {});
            const rawFundingRate: Dict = {
                'id': marketId,
                'funding_interval_sec': this.safeInteger (marketInfo, 'funding_interval_sec'),
                'state': {
                    'at': at,
                    'orl': this.safeInteger (funding, 'idx'),
                },
                'funding': funding,
            };
            const fundingRate = this.parseFundingRate (rawFundingRate, market);
            const symbol = this.safeString (fundingRate, 'symbol');
            if (symbol === undefined) {
                continue;
            }
            this.fundingRates[symbol] = fundingRate;
            updatedFundingRates[symbol] = fundingRate;
            client.resolve (fundingRate, 'fundingRate:' + symbol);
        }
        client.resolve (updatedFundingRates, 'fundingRates');
    }

    handleTrades (client: Client, message: Dict) {
        //
        //     {
        //         "mt": 18,
        //         "sid": 7,
        //         "d": [
        //             {
        //                 "at": { "b": 97001267, "t": 1787037820000, "tx": 3, "txid": "0x1234", "l": 7 },
        //                 "p": 642517,
        //                 "s": 40566,
        //                 "sd": 1
        //             }
        //         ]
        //     }
        //
        const sid = this.safeString (message, 'sid');
        const subscription = this.safeDict (client.subscriptions, sid, {});
        const symbol = this.safeString (subscription, 'symbol');
        if (symbol === undefined) {
            return;
        }
        const market = this.market (symbol);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        const data = this.safeList (message, 'd', []);
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict (data, i, {});
            stored.append (this.parseWsTrade (trade, market));
        }
        const messageHash = this.safeString (subscription, 'messageHash');
        client.resolve (stored, messageHash);
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "at": { "b": 97001267, "t": 1787037820000, "tx": 3, "txid": "0x1234", "l": 7 },
        //         "p": 642517,
        //         "s": 40566,
        //         "sd": 1
        //     }
        //
        market = this.safeMarket (undefined, market);
        const at = this.safeDict (trade, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const transactionId = this.safeString (at, 'txid');
        const logIndex = this.safeString (at, 'l');
        let id = transactionId;
        if ((id !== undefined) && (logIndex !== undefined)) {
            id = id + ':' + logIndex;
        }
        const rawSide = this.safeInteger (trade, 'sd');
        let side: Str = undefined;
        if (rawSide === 1) {
            side = 'buy';
        } else if (rawSide === 2) {
            side = 'sell';
        }
        const pricePrecision = this.numberToString (market['precision']['price']);
        const amountPrecision = this.numberToString (market['precision']['amount']);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.parseNumber (Precise.stringMul (this.safeString (trade, 'p'), pricePrecision)),
            'amount': this.parseNumber (Precise.stringMul (this.safeString (trade, 's'), amountPrecision)),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    override handleMessage (client: Client, message: Dict) {
        const messageType = this.safeInteger (message, 'mt');
        if (messageType === 6) {
            this.handleSubscriptionResponse (client, message);
        } else if (messageType === 9) {
            this.handleTickers (client, message);
        } else if (messageType === 10) {
            this.handleFundingRates (client, message);
        } else if ((messageType === 11) || (messageType === 12)) {
            this.handleOHLCV (client, message);
        } else if ((messageType === 17) || (messageType === 18)) {
            this.handleTrades (client, message);
        }
    }
}
