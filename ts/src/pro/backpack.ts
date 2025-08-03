
//  ---------------------------------------------------------------------------

import backpackRest from '../backpack.js';
import { } from '../base/errors.js';
import type { Dict, Market, Ticker } from '../base/types.js';
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
                'watchTickers': false,
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

    /**
     * @method
     * @name crybackpackptocom#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Book-ticker
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
