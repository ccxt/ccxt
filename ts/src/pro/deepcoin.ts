
//  ---------------------------------------------------------------------------

import deepcoinRest from '../deepcoin.js';
import { } from '../base/errors.js';
import { } from '../base/ws/Cache.js';
import type { Dict, Market, Ticker } from '../base/types.js';
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
                'requestId': this.createSafeDictionary (),
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 18000, // todo find real value
            },
        });
    }

    ping (client: Client) {
        return 'ping';
    }

    requestId (url) {
        const options = this.safeDict (this.options, 'requestId', this.createSafeDictionary ());
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (market: Market, messageHash: string, topicID: string, params = {}, suffix: string = ''): Promise<any> {
        const url = this.urls['api']['ws']['public'][market['type']];
        let marketId = market['symbol'];
        if (market['type'] === 'swap') {
            marketId = market['baseId'] + market['quoteId'];
        }
        const request = {
            'sendTopicAction': {
                'Action': '1', // subscribe
                'FilterValue': 'DeepCoin_' + marketId + suffix,
                'LocalNo': this.requestId (url),
                'ResumeNo': -1, // -1 from the end, 0 from the beginning
                'TopicID': topicID,
            },
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
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
        const messageHash = 'ticker::' + market['symbol'];
        const TopicID = '7';
        return await this.watchPublic (market, messageHash, TopicID, params);
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
        const marketId = this.safeString (data, 'I');
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

    handleMessage (client: Client, message) {
        const action = this.safeString (message, 'a');
        if (action === 'PO') {
            this.handleTicker (client, message);
        }
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
        return message; // todo add error handling
    }
}
