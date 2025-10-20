
//  ---------------------------------------------------------------------------

import deepcoinRest from '../deepcoin.js';
import { BadRequest } from '../base/errors.js';
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
                'unWatchTicker': true,
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
                'lastRequestId': undefined,
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000, // todo find real value
            },
        });
    }

    ping (client: Client) {
        return 'ping';
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    requestId () {
        const previousValue = this.safeInteger (this.options, 'lastRequestId', 0);
        const newValue = this.sum (previousValue, 1);
        this.options['lastRequestId'] = newValue;
        return newValue;
    }

    createPublicRequest (market: Market, requestId: number, topicID: string, suffix: string = '', unWatch: boolean = false) {
        let marketId = market['symbol']; // spot markets use symbol with slash
        if (market['type'] === 'swap') {
            marketId = market['baseId'] + market['quoteId']; // swap markets use symbol without slash
        }
        let action = '1'; // subscribe
        if (unWatch) {
            action = '0'; // unsubscribe
        }
        const request = {
            'sendTopicAction': {
                'Action': action,
                'FilterValue': 'DeepCoin_' + marketId + suffix,
                'LocalNo': requestId,
                'ResumeNo': -1, // -1 from the end, 0 from the beginning
                'TopicID': topicID,
            },
        };
        return request;
    }

    async watchPublic (market: Market, messageHash: string, topicID: string, params: Dict = {}, suffix: string = ''): Promise<any> {
        const url = this.urls['api']['ws']['public'][market['type']];
        const requestId = this.requestId ();
        const request = this.createPublicRequest (market, requestId, topicID, suffix);
        const subscription = {
            'subHash': messageHash,
            'id': requestId,
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash, subscription);
    }

    async unWatchPublic (market: Market, messageHash: string, topicID: string, params: Dict = {}, subscription: Dict = {}, suffix: string = ''): Promise<any> {
        const url = this.urls['api']['ws']['public'][market['type']];
        const requestId = this.requestId ();
        const client = this.client (url);
        const existingSubscription = this.safeDict (client.subscriptions, messageHash);
        if (existingSubscription === undefined) {
            throw new BadRequest (this.id + ' no subscription for ' + messageHash);
        }
        const subId = this.safeInteger (existingSubscription, 'id');
        const request = this.createPublicRequest (market, subId, topicID, suffix, true); // unsubscribe message uses the same id as the original subscribe message
        const unsubHash = 'unsubscribe::' + messageHash;
        subscription = this.extend (subscription, {
            'subHash': messageHash,
            'unsubHash': unsubHash,
            'symbols': [ market['symbol'] ],
            'id': requestId,
        });
        return await this.watch (url, unsubHash, this.deepExtend (request, params), unsubHash, subscription);
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
        const messageHash = 'ticker' + '::' + market['symbol'];
        return await this.watchPublic (market, messageHash, '7', params);
    }

    /**
     * @method
     * @name deepcoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker' + '::' + market['symbol'];
        const subscription = {
            'topic': 'ticker',
        };
        return await this.unWatchPublic (market, messageHash, '7', params, subscription);
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
        if (message === 'pong') {
            this.handlePong (client, message);
        } else {
            const m = this.safeString (message, 'm');
            if (m !== 'Success') {
                this.handleErrorMessage (client, message);
            }
            const action = this.safeString (message, 'a');
            if (action === 'RecvTopicAction') {
                this.handleSubscriptionStatus (client, message);
            } else if (action === 'PO') {
                this.handleTicker (client, message);
            }
        }
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "a": "RecvTopicAction",
        //         "m": "Success",
        //         "r": [
        //             {
        //                 "d": {
        //                     "A": "0",
        //                     "L": 1,
        //                     "T": "7",
        //                     "F": "DeepCoin_BTC/USDT",
        //                     "R": -1
        //                 }
        //             }
        //         ]
        //     }
        //
        const response = this.safeList (message, 'r', []);
        const first = this.safeDict (response, 0, {});
        const data = this.safeDict (first, 'd', {});
        const action = this.safeString (data, 'A'); // 1 = subscribe, 0 = unsubscribe
        if (action === '0') {
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subId = this.safeInteger (data, 'L');
            const subscription = this.safeDict (subscriptionsById, subId, {}); // original subscription
            const subHash = this.safeString (subscription, 'subHash');
            const unsubHash = 'unsubscribe::' + subHash;
            const unsubsciption = this.safeDict (client.subscriptions, unsubHash, {});
            this.handleUnSubscription (client, unsubsciption);
        }
    }

    handleUnSubscription (client: Client, subscription: Dict) {
        const subHash = this.safeString (subscription, 'subHash');
        const unsubHash = this.safeString (subscription, 'unsubHash');
        this.cleanUnsubscription (client, subHash, unsubHash);
        this.cleanCache (subscription);
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
        //     RecvTopicAction
        //     unsupportedAction
        //     [ { d: { A: '2', L: 1, T: '7', F: 'DeepCoin_BTCUSD', R: -1 } } ]
        //
        //     RecvTopicAction
        //     localIDNotExist
        //     [ { d: { A: '0', L: 2, T: '7', F: 'DeepCoin_BTC/USDT', R: -1 } } ]
        //
        return message; // todo add error handling
    }
}
