//  ---------------------------------------------------------------------------

import coincatchRest from '../coincatch.js';
import type { Dict, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { time } from 'console';

//  ---------------------------------------------------------------------------

export default class hashkey extends coincatchRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchOrderBook': false,
                'watchOHLCV': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': false,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.coincatch.com/public/v1/stream',
                        'private': 'wss://ws.coincatch.com/private/v1/stream',
                    },
                },
            },
            'options': {
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coincatch#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://coincatch.github.io/github.io/en/spot/#tickers-channel
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const symbolFromMarket = market['symbol'];
        const parts = symbolFromMarket.split ('/');
        const instId = parts[0] + parts[1];
        const channel = 'ticker';
        const instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [
                {
                    'instType': instType,
                    'channel': channel,
                    'instId': instId,
                },
            ],
        };
        const messageHash = channel + '.' + symbol;
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    handleTicker (client: Client, message) {
        //
        //     action: 'snapshot',
        //     arg: { instType: 'sp', channel: 'ticker', instId: 'ETHUSDT' },
        //     data: [
        //         {
        //             instId: 'ETHUSDT',
        //             last: '2421.06',
        //             open24h: '2416.93',
        //             high24h: '2441.47',
        //             low24h: '2352.99',
        //             bestBid: '2421.03',
        //             bestAsk: '2421.06',
        //             baseVolume: '9445.2043',
        //             quoteVolume: '22807159.1148',
        //             ts: 1728131730687,
        //             labeId: 0,
        //             openUtc: '2414.50',
        //             chgUTC: '0.00272',
        //             bidSz: '3.866',
        //             askSz: '0.124'
        //         }
        //     ],
        //     ts: 1728131730688
        //
        const ticker = this.safeList (message, 'data', []);
        const marketId = this.safeString (ticker, 'instId');
        const symbol = this.safeSymbol (marketId);
        this.tickers[symbol] = this.parseWSTicker (ticker);
        client.resolve (this.tickers[symbol], 'ticker.' + symbol);
        client.resolve (this.tickers, 'tickers');
    }

    parseWSTicker (ticker, market = undefined) {
        //
        //     {
        //         instId: 'ETHUSDT',
        //         last: '2421.06',
        //         open24h: '2416.93',
        //         high24h: '2441.47',
        //         low24h: '2352.99',
        //         bestBid: '2421.03',
        //         bestAsk: '2421.06',
        //         baseVolume: '9445.2043',
        //         quoteVolume: '22807159.1148',
        //         ts: 1728131730687,
        //         labeId: 0,
        //         openUtc: '2414.50',
        //         chgUTC: '0.00272',
        //         bidSz: '3.866',
        //         askSz: '0.124'
        //     }
        //
        const marketId = this.safeString (ticker, 'instId');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': this.safeInteger (ticker, 'ts'),
            'datetime': this.iso8601 (this.safeInteger (ticker, 'ts')),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'open24h'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'chgUTC'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    handleMessage (client: Client, message) {
        const data = this.safeDict (message, 'params');
        if (data !== undefined) {
            const channel = this.safeString (data, 'channel');
            const parts = channel.split ('.');
            const name = this.safeString (parts, 0);
            const methods: Dict = {
                'ticker': this.handleTicker,
            };
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
