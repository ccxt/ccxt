
//  ---------------------------------------------------------------------------

import weexRest from '../weex.js';
import { ExchangeError } from '../base/errors.js';
// import { Precise } from '../base/Precise.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Dict, Int, Market, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
// import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class weex extends weexRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'unWatchOHLCV': false,
                'unWatchOHLCVForSymbols': false,
                'unWatchOrderBook': false,
                'unWatchOrderBookForSymbols': false,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://ws-spot.weex.com/v3/ws',
                        'contract': 'wss://ws-contract.weex.com/v3/ws',
                    },
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {
                            'User-Agent': 'b-WEEX111125', // todo check
                        },
                    },
                },
            },
            'streaming': {},
        });
    }

    requestId () {
        this.lockId ();
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.unlockId ();
        return this.numberToString (requestId);
    }

    async subscribePublic (messageHashes, channels, isContract = false, params = {}, subscription = {}) {
        const id = this.requestId ();
        let method = 'SUBSCRIBE';
        const unsubscribe = this.safeBool (subscription, 'unsubscribe', false);
        if (unsubscribe) {
            method = 'UNSUBSCRIBE';
        }
        const message: Dict = {
            'id': id,
            'method': method,
            'params': channels,
        };
        subscription = this.extend (subscription, { 'id': id });
        const type = isContract ? 'contract' : 'spot';
        const url = this.urls['api']['ws'][type] + '/public';
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    /**
     * @method
     * @name weex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] stream to use can be ticker or miniTicker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name weex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'ticker';
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            messageHashes.push (messageHash);
            channels.push (channelName);
        }
        const newTickers = await this.subscribePublic (messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name weex#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name weex#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'ticker';
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push (messageHash);
            channels.push (channelName);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': topic,
        };
        return await this.subscribePublic (unSubHashes, channels, isContract, params, subscription);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "e": "ticker",
        //         "E": 1776081628845,
        //         "s": "ETHUSDT",
        //         "d": [
        //             {
        //                 "p": "-18.93",
        //                 "P": "-0.008592",
        //                 "w": "2192.40298388",
        //                 "c": "2184.20",
        //                 "o": "2203.13",
        //                 "h": "2217.34",
        //                 "l": "2173.32",
        //                 "v": "359395.800",
        //                 "q": "787940424.31399",
        //                 "O": 1775995200000,
        //                 "C": 1776081600000,
        //                 "n": 485169,
        //                 "m": "2184.28",
        //                 "i": "2185.2025"
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage (client, message);
        const tickers = this.safeList (message, 'd', []);
        const data = this.safeDict (tickers, 0, {});
        const ticker = this.parseWsTicker (data, market);
        const symbol = ticker['symbol'];
        const messageHash = 'ticker::' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers, messageHash);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "p": "-18.93",
        //         "P": "-0.008592",
        //         "w": "2192.40298388",
        //         "c": "2184.20",
        //         "o": "2203.13",
        //         "h": "2217.34",
        //         "l": "2173.32",
        //         "v": "359395.800",
        //         "q": "787940424.31399",
        //         "O": 1775995200000,
        //         "C": 1776081600000,
        //         "n": 485169,
        //         "m": "2184.28",
        //         "i": "2185.2025"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'C');
        const close = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': this.safeString (ticker, 'w'),
            'open': this.safeString (ticker, 'o'),
            'close': close,
            'last': close,
            'previousClose': this.safeString (ticker, 'x'),
            'change': this.safeString (ticker, 'p'),
            'percentage': this.safeString (ticker, 'P'),
            'average': this.safeString (ticker, 'w'),
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
            'markPrice': this.safeString (ticker, 'm'),
            'indexPrice': this.safeString (ticker, 'i'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name weex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name weex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'trade';
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            messageHashes.push (messageHash);
            channels.push (channelName);
        }
        const trades = await this.subscribePublic (messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name weex#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name weex#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'trade';
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push (messageHash);
            channels.push (channelName);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'trades',
        };
        return await this.subscribePublic (unSubHashes, channels, isContract, params, subscription);
    }

    handleTrade (client: Client, message) {
        const market = this.getMarketFromClientAndMessage (client, message);
        const symbol = market['symbol'];
        const messageHash = 'trade::' + symbol;
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const tradesArray = this.trades[symbol];
        const data = this.safeList (message, 'd', []);
        for (let i = 0; i < data.length; i++) {
            const rawTrade = this.safeDict (data, i, {});
            const trade = this.parseWsTrade (rawTrade, market);
            tradesArray.append (trade);
        }
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "T": 1776089287762,
        //         "t": "df4d1af1-71e8-400d-9571-f2cee2e6bea8",
        //         "p": "2203.73",
        //         "q": "7.214",
        //         "v": "15897.70822",
        //         "m": false
        //     }
        //
        const timestamp = this.safeInteger (trade, 'T');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 't'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': this.safeString (trade, 'v'),
            'fee': undefined,
        }, market);
    }

    getMarketFromClientAndMessage (client, message) {
        const url = client.url;
        let marketType = 'spot';
        if (url.indexOf ('contract') >= 0) {
            marketType = 'swap';
        }
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        return market;
    }

    async pong (client, message) {
        //
        //     { "event": "ping", "time": "1776078750000" }
        //
        const response: Dict = {
            'id': this.requestId (),
            'method': 'PONG',
        };
        await client.send (response);
    }

    handlePing (client: Client, message) {
        this.spawn (this.pong, client, message);
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     { "result": true, "id": 2 }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeDict (subscriptionsById, id, {});
        const unsubscribe = this.safeBool (subscription, 'unsubscribe', false);
        if (unsubscribe) {
            const messageHashes = this.safeList (subscription, 'messageHashes', []);
            const subHashes = this.safeList (subscription, 'subMessageHashes', []);
            for (let i = 0; i < messageHashes.length; i++) {
                const unSubHash = this.safeString (messageHashes, i);
                const subHash = this.safeString (subHashes, i);
                this.cleanUnsubscription (client, subHash, unSubHash);
            }
            this.cleanCache (subscription);
        }
        return message;
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "result": false,
        //         "id": 1,
        //         "msg": "INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"
        //     }
        //
        const result = this.safeBool (message, 'result', true);
        if (!result) {
            const msg = this.safeString (message, 'msg', '');
            const feedback = this.id + ' ' + this.json (message);
            try {
                this.throwExactlyMatchedException (this.exceptions['exact'], msg, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
                throw new ExchangeError (feedback);
            } catch (error) {
                client.reject (error);
                return true;
            }
        }
        return false;
    }

    handleMessage (client: Client, message) {
        //
        //     { "id": "5", "method": "PONG" }
        //
        //     { "result": true, "id": 2 }
        //
        //     {
        //         "result": false,
        //         "id": 1,
        //         "msg": "INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"
        //     }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const id = this.safeString (message, 'id');
        if (id !== undefined) {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const event = this.safeString2 (message, 'e', 'event');
        if (event === 'ping') {
            this.handlePing (client, message);
        } else if (event === 'ticker') {
            this.handleTicker (client, message);
        } else if ((event === 'trade') || (event === 'tradeSnapshot')) {
            this.handleTrade (client, message);
        }
    }
}
