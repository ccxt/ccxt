
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

    async watchPublic (topics, messageHashes, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': topics,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async unWatchPublic (topics, messageHashes, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'UNSUBSCRIBE',
            'params': topics,
        };
        const message = this.extend (request, params);
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
        symbol = market['symbol'];
        const topic = 'ticker' + '.' + market['id'];
        const messageHash = 'ticker' + ':' + symbol;
        return await this.watchPublic ([ topic ], [ messageHash ], params);
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
        return await this.unWatchTickers ([ symbol ], params);
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
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            messageHashes.push ('ticker:' + symbol);
            topics.push ('ticker.' + marketId);
        }
        await this.watchPublic (topics, messageHashes, params);
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
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('ticker.' + marketId);
            messageHashes.push ('ticker:' + symbol);
        }
        return await this.unWatchPublic (topics, messageHashes, params);
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
        const messageHash = 'ticker' + ':' + symbol;
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

    /**
     * @method
     * @name backpack#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Book-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('bookTicker.' + marketId);
            messageHashes.push ('bidask:' + symbol);
        }
        await this.watchPublic (topics, messageHashes, params);
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message) {
        //
        //     {
        //         data: {
        //             A: '0.4087',
        //             B: '0.0020',
        //             E: '1754517402450016',
        //             T: '1754517402449064',
        //             a: '3667.50',
        //             b: '3667.49',
        //             e: 'bookTicker',
        //             s: 'ETH_USDC',
        //             u: 1328288557
        //         },
        //         stream: 'bookTicker.ETH_USDC'
        //     }
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const parsedBidAsk = this.parseWsBidAsk (data, market);
        const messageHash = 'bidask' + ':' + symbol;
        this.bidsasks[symbol] = parsedBidAsk;
        client.resolve (parsedBidAsk, messageHash);
    }

    parseWsBidAsk (ticker, market = undefined) {
        //
        //     {
        //         A: '0.4087',
        //         B: '0.0020',
        //         E: '1754517402450016',
        //         T: '1754517402449064',
        //         a: '3667.50',
        //         b: '3667.49',
        //         e: 'bookTicker',
        //         s: 'ETH_USDC',
        //         u: 1328288557
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const microseconds = this.safeInteger (ticker, 'E');
        const timestamp = this.parseToInt (microseconds / 1000);
        const ask = this.safeString (ticker, 'a');
        const askVolume = this.safeString (ticker, 'A');
        const bid = this.safeString (ticker, 'b');
        const bidVolume = this.safeString (ticker, 'B');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': ask,
            'askVolume': askVolume,
            'bid': bid,
            'bidVolume': bidVolume,
            'info': ticker,
        }, market);
    }

    async test () {
        const symbols = [ 'ETH/USDC' ];
        const tickers = await this.watchBidsAsks (symbols);
        const ticker = this.safeValue (tickers, 'ETH/USDC');
        console.log (ticker);
    }

    handleMessage (client: Client, message) {
        const data = this.safeValue (message, 'data');
        const event = this.safeString (data, 'e');
        const methods: Dict = {
            'ticker': this.handleTicker,
            'bookTicker': this.handleBidAsk,
        };
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
