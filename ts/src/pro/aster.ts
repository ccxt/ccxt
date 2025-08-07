
//  ---------------------------------------------------------------------------

import asterRest from '../aster.js';
import type { Strings, Tickers, Dict, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class aster extends asterRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchOrderBook': false,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://fstream.asterdex.com/stream',
                },
            },
            'options': {},
            'streaming': {},
            'exceptions': {},
        });
    }

    /**
     * @method
     * @name aster#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name aster#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        // let streams = undefined;
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@ticker');
            messageHashes.push ('ticker:' + market['symbol']);
        }
        const newTicker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "stream": "trumpusdt@ticker",
        //         "data": {
        //             "e": "24hrTicker",
        //             "E": 1754451187277,
        //             "s": "CAKEUSDT",
        //             "p": "-0.08800",
        //             "P": "-3.361",
        //             "w": "2.58095",
        //             "c": "2.53000",
        //             "Q": "5",
        //             "o": "2.61800",
        //             "h": "2.64700",
        //             "l": "2.52400",
        //             "v": "15775",
        //             "q": "40714.46000",
        //             "O": 1754364780000,
        //             "C": 1754451187274,
        //             "F": 6571389,
        //             "L": 6574507,
        //             "n": 3119
        //         }
        //     }
        //
        const ticker = this.safeDict (message, 'data');
        const parsed = this.parseWsTicker (ticker);
        const symbol = parsed['symbol'];
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = parsed;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (message) {
        const marketId = this.safeString (message, 's');
        const timestamp = this.safeInteger (message, 'E');
        const market = this.safeMarket (marketId);
        const last = this.safeString (message, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (message, 'h'),
            'low': this.safeString (message, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeString (message, 'w'),
            'open': this.safeString (message, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (message, 'p'),
            'percentage': this.safeString (message, 'P'),
            'average': undefined,
            'baseVolume': this.safeString (message, 'v'),
            'quoteVolume': this.safeString (message, 'q'),
            'info': message,
        }, market);
    }

    handleMessage (client: Client, message) {
        const stream = this.safeString (message, 'stream');
        if (stream !== undefined) {
            const part = stream.split ('@');
            const topic = this.safeString (part, 1);
            const methods: Dict = {
                'ticker': this.handleTicker,
            };
            const method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
