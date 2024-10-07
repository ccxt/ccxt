//  ---------------------------------------------------------------------------

import coincatchRest from '../coincatch.js';
import type { Dict, Int, Market, OHLCV, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArrayCacheByTimestamp } from '../base/ws/Cache.js';


//  ---------------------------------------------------------------------------

export default class coincatch extends coincatchRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchOrderBook': false,
                'watchOHLCV': true,
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
                'timeframesForWs': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1H',
                    '4h': '4H',
                    '12h': '12H',
                    '1d': '1D',
                    '1w': '1W',
                },
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
         * @param {string} [params.instType] the type of the instrument to fetch the ticker for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
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
        const messageHash = channel + ':' + symbol;
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
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const market = this.safeMarket (symbol);
        const data = this.safeList (message, 'data', []);
        const ticker = this.parseWsTicker (this.safeDict (data, 0, {}), market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
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
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
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

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coincatch#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://coincatch.github.io/github.io/en/spot/#candlesticks-channel
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch (not including)
         * @param {int} [limit] the maximum amount of candles to fetch (not including)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.instType] the type of the instrument to fetch the OHLCV data for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        const timeframes = this.options['timeframesForWs'];
        const channel = 'candle' + this.safeString (timeframes, timeframe);
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
        const messageHash = channel + ':' + symbol;
        const ohlcv = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'candle1D', instId: 'ETHUSDT' },
        //         data: [
        //             [
        //                 '1728316800000',
        //                 '2474.5',
        //                 '2478.21',
        //                 '2459.8',
        //                 '2463.51',
        //                 '86.0551'
        //             ]
        //         ],
        //         ts: 1728317607657
        //     }
        //
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const market = this.safeMarket (symbol);
        const data = this.safeList (message, 'data', []);
        const channel = this.safeString (arg, 'channel');
        const klineType = channel.slice (6);
        const timeframe = this.findTimeframe (klineType);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeList (data, i, []);
            const parsed = this.parseWsOHLCV (candle, market);
            stored.append (parsed);
        }
        const messageHash = 'candle' + klineType + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         '1728316800000',
        //         '2474.5',
        //         '2478.21',
        //         '2459.8',
        //         '2463.51',
        //         '86.0551'
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    handleMessage (client: Client, message) {
        const data = this.safeDict (message, 'arg', {});
        const channel = this.safeString (data, 'channel');
        if (channel === 'ticker') {
            this.handleTicker (client, message);
        }
        if (channel === 'candle1m' || channel === 'candle5m' || channel === 'candle15m' || channel === 'candle30m' || channel === 'candle1H' || channel === 'candle4H' || channel === 'candle12H' || channel === 'candle1D' || channel === 'candle1W') {
            this.handleOHLCV (client, message);
        }
    }
}
