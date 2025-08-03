
//  ---------------------------------------------------------------------------

import backpackRest from '../backpack.js';
import { } from '../base/errors.js';
import type { Dict, Market, Strings, Ticker, Tickers } from '../base/types.js';
import { } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class backpack extends backpackRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': true, // todo why is not working well?
                'watchBidsAsks': false,
                'watchBalance': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.backpack.exchange',
                        'private': 'wss://ws.backpack.exchange',
                    },
                },
            },
            'options': {
                'timeframes': {
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 50000,
            },
        });
    }

    async watchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async unWatchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'UNSUBSCRIBE',
            'params': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPublicMultiple (messageHashes, topics, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': topics,
        };
        const message = this.deepExtend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async unWatchPublicMultiple (messageHashes, topics, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'UNSUBSCRIBE',
            'params': topics,
        };
        const message = this.deepExtend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    /**
     * @method
     * @name crybackpackptocom#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker' + '.' + market['id'];
        return await this.watchPublic (messageHash, params);
    }

    /**
     * @method
     * @name backpack#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker' + '.' + market['id'];
        return await this.unWatchPublic (messageHash, params);
    }

    /**
     * @method
     * @name backpack#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new Error (this.id + ' watchTickers() requires a symbols argument');
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const marketIds = this.marketIds (symbols);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            messageHashes.push ('ticker.' + marketId);
        }
        const tickers = await this.watchPublicMultiple (messageHashes, messageHashes, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name backpack#unWatchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new Error (this.id + ' unWatchTickers() requires a symbols argument');
        }
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const marketIds = this.marketIds (symbols);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            messageHashes.push ('ticker.' + marketId);
        }
        const tickers = await this.watchPublicMultiple (messageHashes, messageHashes, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         data: {
        //             E: '1754176123312507',
        //             V: '19419526.742584',
        //             c: '3398.57',
        //             e: 'ticker',
        //             h: '3536.65',
        //             l: '3371.8',
        //             n: 17152,
        //             o: '3475.45',
        //             s: 'ETH_USDC',
        //             v: '5573.5827'
        //         },
        //         stream: 'bookTicker.ETH_USDC'
        //     }
        //
        const ticker = this.safeDict (message, 'data', {});
        const marketId = this.safeString (ticker, 's');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const parsedTicker = this.parseWsTicker (ticker, market);
        const messageHash = 'ticker' + '.' + marketId;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         E: '1754178406415232',
        //         V: '19303818.6923',
        //         c: '3407.54',
        //         e: 'ticker',
        //         h: '3536.65',
        //         l: '3369.18',
        //         n: 17272,
        //         o: '3481.71',
        //         s: 'ETH_USDC',
        //         v: '5542.3911'
        //     }
        //
        const microseconds = this.safeInteger (ticker, 'E');
        const timestamp = this.parseToInt (microseconds / 1000);
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'c');
        const open = this.safeString (ticker, 'o');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'h'),
            'low': this.safeNumber (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'V'),
            'info': ticker,
        }, market);
    }

    handleMessage (client: Client, message) {
        const data = this.safeValue (message, 'data');
        const event = this.safeString (data, 'e');
        const methods: Dict = {
            'ticker': this.handleTicker,
        };
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
