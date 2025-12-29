
//  ---------------------------------------------------------------------------

import bydfiRest from '../bydfi.js';
import type { Int, Dict, OrderBook, Ticker, Strings, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError } from '../base/errors.js';
import { OHLCV } from '../base/types.js';

//  ---------------------------------------------------------------------------

export default class bydfi extends bydfiRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
                'watchMyTrades': true,
                'watchBalance': false,
                'watchOHLCV': true,
                'watchRealTicker': true,
            },
            'urls': {
                'logo': '',
                'api': {
                    'ws': {
                        'public': 'wss://stream.bydfi.com/v1/public/swap',
                    },
                },
                'www': 'https://bydfi.com/',
                'doc': 'https://developers.bydfi.com/',
            },
            'options': {},
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
        });
    }

    /**
     * @method
     * @name bydfi#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/websocket-market#incremental-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name bydfi#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/websocket-market#incremental-depth
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws']['public'];
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            let topic = market['id'] + '@depth';
            if (limit) {
                topic = topic + limit;
            }
            let interval = this.safeString (params, 'interval');
            if (interval === '1000ms') {
                interval = '';
            }
            if (interval) {
                topic = topic + '@' + interval;
            }
            topics.push (topic);
            const messageHash = 'orderbook';
            messageHashes.push (messageHash);
        }
        const orderbook = await this.watchTopics (url, messageHashes, topics, params);
        return orderbook;
    }

    async watchTopics (url, messageHashes, topics, params = {}) {
        const request: Dict = {
            'id': 1,
            'method': 'SUBSCRIBE',
            'params': topics,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async watchAccount () {
        const url = this.urls['api']['ws']['public'];
        const timestamp = this.milliseconds ().toString ();
        const request: Dict = {
            'id': 1,
            'method': 'LOGIN',
            'params': {
                'apiKey': this.apiKey,
                'timestamp': timestamp,
                'sign': this.hmac (this.apiKey + timestamp, this.secret, sha256),
            },
        };
        const messageHashes = [ 'account' ];
        return await this.watchMultiple (url, messageHashes, request, messageHashes);
    }

    /**
     * @method
     * @name bydfi#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (!symbol) {
            throw new ArgumentsRequired (this.id + ' watchTicker() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ticker';
        const topic = market['id'] + '@ticker';
        const topics = [ topic ];
        return await this.watchTopics (url, [ messageHash ], topics, params);
    }

    /**
     * @method
     * @name bydfi#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const url = this.urls['api']['ws']['public'];
        const topics = [ ];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const topic = market['id'] + '@ticker';
            topics.push (topic);
            const messageHash = 'ticker';
            messageHashes.push (messageHash);
        }
        const ticker = await this.watchTopics (url, messageHashes, topics, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    async watchAllTickers () {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const topic = '!ticker@arr';
        const topics = [ topic ];
        const messageHash = 'ticker';
        return await this.watchTopics (url, [ messageHash ], topics);
    }

    /**
     * @method
     * @name bydfi#watchRealTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.bydfi.com/en/swap/websocket-market#latest-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [real ticker structure]
     */
    async watchRealTicker (symbol: string, params = {}) {
        if (!symbol) {
            throw new ArgumentsRequired (this.id + ' watchRealTicker() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'realTicker';
        let topic = market['id'] + '@realTicker';
        let interval = this.safeString (params, 'interval', '');
        if (interval) {
            if (interval === '3000ms') {
                interval = '';
            }
            topic += '@' + interval;
        }
        const topics = [ topic ];
        return await this.watchTopics (url, [ messageHash ], topics, params);
    }

    handleTicker (client: Client, message) {
        const symbol = this.safeString (message, 's', '');
        const timestamp = this.safeIntegerProduct (message, 'E', 0.001);
        const parsed: any = {
            'timestamp': timestamp * 1000,
            'datetime': this.iso8601 (timestamp * 1000),
            'symbol': symbol,
            'info': message,
            'high': this.safeNumber (message, 'h', 0),
            'low': this.safeNumber (message, 'l', 0),
            'open': this.safeNumber (message, 'o', 0),
            'close': this.safeNumber (message, 'c', 0),
            'last': this.safeNumber (message, 'c', 0),
            'volume': this.safeNumber (message, 'v', 0),
        };
        this.tickers[symbol] = parsed;
        client.resolve (this.tickers[symbol], 'ticker');
    }

    handleRealTicker (client: Client, message) {
        const symbol = this.safeString (message, 's', '');
        const timestamp = this.safeIntegerProduct (message, 'E', 0.001);
        const parsed: any = {
            'timestamp': timestamp * 1000,
            'datetime': this.iso8601 (timestamp * 1000),
            'symbol': symbol,
            'info': message,
            'p': this.safeNumber (message, 'p', 0),
            'm': this.safeNumber (message, 'm', 0),
            'i': this.safeNumber (message, 'i', 0),
        };
        client.resolve (parsed, 'realTicker');
    }

    handleOrderBook (client: Client, message) {
        const symbol = this.safeString (message, 's', '');
        const timestamp = this.safeIntegerProduct (message, 'E', 0.001);
        const parsed: any = {
            'timestamp': timestamp * 1000,
            'datetime': this.iso8601 (timestamp * 1000),
            'symbol': symbol,
            'info': message,
            'bids': this.safeValue (message, 'b', []),
            'asks': this.safeValue (message, 'a', []),
        };
        client.resolve (parsed, 'orderbook');
    }

    handleOHLCV (client: Client, message) {
        const symbol = this.safeString (message, 's', '');
        const timestamp = this.milliseconds ().toString ();
        const timeframe = this.safeString (message, 'i');
        const parsed: any = {
            'symbol': symbol,
            'timeframe': timeframe,
            'stored': [ timestamp, this.safeNumber (message, 'o', 0), this.safeNumber (message, 'h', 0), this.safeNumber (message, 'l', 0), this.safeNumber (message, 'c', 0), this.safeNumber (message, 'v', 0) ],
        };
        client.resolve (parsed, 'ohlcv');
    }

    /**
     * @method
     * @name bydfi#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/websocket-market#candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        const market = this.market (symbol);
        const sym = market['id'];
        return result[sym][timeframe];
    }

    /**
     * @method
     * @name bydfi#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/websocket-market#candlestick-data
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const topics = [ ];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            let symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            const unfiedTimeframe = this.safeString (data, 1);
            symbolString = market['id'] + '@kline_' + unfiedTimeframe;
            topics.push (symbolString);
            messageHashes.push ('ohlcv');
        }
        const result = await this.watchTopics (url, messageHashes, topics);
        return this.createOHLCVObject (result.symbol, result.timeframe, result.stored);
    }

    handleErrorMessage (client: Client, message) {
        //
        //   {
        //       "success": false,
        //       "ret_msg": "error:invalid op",
        //       "conn_id": "5e079fdd-9c7f-404d-9dbf-969d650838b5",
        //       "request": { op: '', args: null }
        //   }
        //
        // auth error
        //
        //   {
        //       "success": false,
        //       "ret_msg": "error:USVC1111",
        //       "conn_id": "e73770fb-a0dc-45bd-8028-140e20958090",
        //       "request": {
        //         "op": "auth",
        //         "args": [
        //           "9rFT6uR4uz9Imkw4Wx",
        //           "1653405853543",
        //           "542e71bd85597b4db0290f0ce2d13ed1fd4bb5df3188716c1e9cc69a879f7889"
        //         ]
        //   }
        //
        //   { code: '-10009', desc: "Invalid period!" }
        //
        //   {
        //       "reqId":"1",
        //       "retCode":170131,
        //       "retMsg":"Insufficient balance.",
        //       "op":"order.create",
        //       "data":{
        //
        //       },
        //       "header":{
        //           "X-Bapi-Limit":"20",
        //           "X-Bapi-Limit-Status":"19",
        //           "X-Bapi-Limit-Reset-Timestamp":"1714236608944",
        //           "Traceid":"3d7168a137bf32a947b7e5e6a575ac7f",
        //           "Timenow":"1714236608946"
        //       },
        //       "connId":"cojifin88smerbj9t560-406"
        //   }
        //
        const code = this.safeStringN (message, [ 'code', 'ret_code', 'retCode' ]);
        try {
            if (code !== undefined && code !== '0') {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                const msg = this.safeString2 (message, 'retMsg', 'ret_msg');
                this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
                throw new ExchangeError (feedback);
            }
            const success = this.safeValue (message, 'success');
            if (success !== undefined && !success) {
                const ret_msg = this.safeString (message, 'ret_msg');
                const request = this.safeValue (message, 'request', {});
                const op = this.safeString (request, 'op');
                if (op === 'auth') {
                    throw new AuthenticationError ('Authentication failed: ' + ret_msg);
                } else {
                    throw new ExchangeError (this.id + ' ' + ret_msg);
                }
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
                const messageHash = this.safeString (message, 'reqId');
                client.reject (error, messageHash);
            }
            return true;
        }
    }

    handleAccountUpdate (client: Client, message) {
        const timestamp = this.safeIntegerProduct (message, 'E', 0.001);
        const data = this.safeValue (message, 'a', {});
        const parsed: any = {
            'timestamp': timestamp,
            'data': data,
        };
        client.resolve (parsed, 'account');
    }

    handleOrderTradeUpdate (client: Client, message) {
        const timestamp = this.safeIntegerProduct (message, 'E', 0.001);
        const data = this.safeValue (message, 'o', {});
        const parsed: any = {
            'timestamp': timestamp,
            'data': data,
        };
        client.resolve (parsed, 'account');
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const result = this.safeString (message, 'result', '');
        if (result === 'pong') {
            client.lastPong = this.safeInteger (message, 'id');
        }
        // 添加调试信息
        const topic = this.safeString2 (message, 'e', 'topic', '');
        const methods: Dict = {
            '24hrTicker': this.handleTicker,
            'depthUpdate': this.handleOrderBook,
            'kline': this.handleOHLCV,
            'realTicker': this.handleRealTicker,
            'ACCOUNT_UPDATE': this.handleAccountUpdate,
            'ORDER_TRADE_UPDATE': this.handleOrderTradeUpdate,
        };
        const exacMethod = this.safeValue (methods, topic);
        if (exacMethod !== undefined) {
            exacMethod.call (this, client, message);
        }
    }

    ping (client: Client) {
        const timeStamp = this.milliseconds ().toString ();
        return {
            'id': timeStamp,
            'method': 'ping',
        };
    }

    handleAuthenticate (client: Client, message) {
        //
        //    {
        //        "success": true,
        //        "ret_msg": '',
        //        "op": "auth",
        //        "conn_id": "ce3dpomvha7dha97tvp0-2xh"
        //    }
        //
        const success = this.safeValue (message, 'success');
        const code = this.safeInteger (message, 'retCode');
        const messageHash = 'authenticated';
        if (success || code === 0) {
            const future = this.safeValue (client.futures, messageHash);
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //    {
        //        "topic": "kline",
        //        "event": "sub",
        //        "params": {
        //          "symbol": "LTCUSDT",
        //          "binary": "false",
        //          "klineType": "1m",
        //          "symbolName": "LTCUSDT"
        //        },
        //        "code": "0",
        //        "msg": "Success"
        //    }
        //
        return message;
    }
}
