'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, BadSymbol, RateLimitExceeded } = require ('./base/errors');

module.exports = class btse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': [ 'EE' ], // Estonia
            'version': 'v1',
            'rateLimit': 300,
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': false,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrders': false,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://cdn.redot.com/static/icons/500px_transparent_background/Icon_0-3.png',
                'api': {
                    'spot': 'https://api.btse.com/spot/v3.2',
                    'future': 'https://api.redot.com/v1/private',
                },
                'www': 'https://redot.com/',
                'doc': 'https://redot.com/docs/#rest-api',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'market_summary': 1,
                            'ohlcv': 1,
                            'price': 1,
                            'orderbook': 1,
                            'trades': 1,
                            'time': 1,
                            'get-stats': 1,
                        },
                    },
                    'private': {
                        'post': {
                        },
                    },
                },
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '12h': '43200',
            },
            'exceptions': {
                'exact': {
                    '10002': RateLimitExceeded, // {"error":{"code":10002,"message":"Too many requests."}}
                    '10501': BadRequest, // {"error":{"code":10501,"message":"Request parameters have incorrect format."}}
                    '14500': BadRequest, // {"error":{"code":14500,"message":"Depth is invalid."}}
                    '13500': BadSymbol, // {"error":{"code":13500,"message":"Instrument id is invalid."}}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        // [
        //   {
        //      "symbol":"1INCH-AED",
        //      "last":0.0,
        //      "lowestAsk":0.0,
        //      "highestBid":0.0,
        //      "percentageChange":0.887761573,
        //      "volume":6679180.080848128,
        //      "high24Hr":6.038055,
        //      "low24Hr":5.417631,
        //      "base":"1INCH",
        //      "quote":"AED",
        //      "active":true,
        //      "size":1150813.46023945,
        //      "minValidPrice":0.001,
        //      "minPriceIncrement":0.001,
        //      "minOrderSize":0.1,
        //      "maxOrderSize":300000.0,
        //      "minSizeIncrement":0.1,
        //      "openInterest":0.0,
        //      "openInterestUSD":0.0,
        //      "contractStart":0,
        //      "contractEnd":0,
        //      "timeBasedContract":false,
        //      "openTime":0,
        //      "closeTime":0,
        //      "startMatching":0,
        //      "inactiveTime":0,
        //      "fundingRate":0.0,
        //      "contractSize":0.0,
        //      "maxPosition":0,
        //      "minRiskLimit":0,
        //      "maxRiskLimit":0,
        //      "availableSettlement":null,
        //      "futures":false
        //   },
        // ]
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuantity = this.safeInteger (market, 'minOrderSize');
            const maxQuantity = this.safeNumber (market, 'maxOrderSize');
            const makerFee = this.safeNumber (market, 'makerFee');
            const takerFee = this.safeNumber (market, 'takerFee');
            const type = this.safeString (market, 'type');
            const precision = {
                'amount': this.safeInteger (market, 'minQty'),
                'price': minQuantity,
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': makerFee,
                'taker': takerFee,
                'linear': undefined,
                'inverse': undefined,
                'settle': undefined,
                'settleId': undefined,
                'type': type,
                'spot': (type === 'spot'),
                'margin': undefined,
                'future': false,
                'swap': false,
                'option': false,
                'optionType': undefined,
                'strike': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'contract': false,
                'contractSize': undefined,
                'active': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        //
        // {
        //     "result":{
        //     "bids":[
        //         [
        //             0.068377,
        //             1.3247,
        //         ],
        //     ],
        //     "asks":[
        //         [
        //             0.068531,
        //             0.2693,
        //         ]
        //     ],
        //     "time":1642973720071624
        //     }
        // }
        //
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeIntegerProduct (result, 'time', 0.001);
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        const response = await this.publicGetGetTicker (this.extend (request, params));
        //
        // {
        //     "result":
        //     {
        //     "lastTradeId":7219332,
        //     "price":0.068708,
        //     "qty":0.0046,
        //     "bidPrice":0.068663,
        //     "askPrice":0.068678,
        //     "bidQty":0.4254,
        //     "askQty":0.0506,
        //     "volumeUsd":315646.03,
        //     "volume":130.5272,
        //     "time":1642974178845710
        //     }
        // }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetGetLastTrades (this.extend (request, params));
        // {
        //     "result":{
        //     "data":[
        //         {
        //             "id":744918,
        //             "time":1594800000857010,
        //             "price":0.02594000,
        //             "qty":0.05800000,
        //             "side":"buy"
        //         }
        //     ],
        //     "next":false
        //     }
        // }
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //         {
        //             "id":744918,
        //             "time":1594800000857010,
        //             "price":0.02594000,
        //             "qty":0.05800000,
        //             "side":"buy"
        //         }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeIntegerProduct (trade, 'time', 0.001);
        const datetime = this.iso8601 (timestamp);
        const symbol = this.safeSymbol (undefined, market);
        const side = this.safeString (trade, 'side');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'qty');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': id,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        });
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "lastTradeId":7219332,
        //     "price":0.068708,
        //     "qty":0.0046,
        //     "bidPrice":0.068663,
        //     "askPrice":0.068678,
        //     "bidQty":0.4254,
        //     "askQty":0.0506,
        //     "volumeUsd":315646.03,
        //     "volume":130.5272,
        //     "time":1642974178845710
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'price');
        const open = this.safeString (ticker, 'openPrice');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const baseVolume = this.safeString (ticker, 'volume');
        const bid = this.safeString (ticker, 'bidPrice');
        const ask = this.safeString (ticker, 'askPrice');
        const timestamp = this.safeIntegerProduct (ticker, 'time', 0.001);
        return this.safeTicker ({
            'symbol': symbol,
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
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //  {
        //       "time":1642973286229265,
        //       "low":0.068584,
        //       "high":0.068584,
        //       "open":0.068584,
        //       "close":0.068584,
        //       "volume":0.0338
        //  },
        //
        return [
            this.safeIntegerProduct (ohlcv, 'time', 0.001),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
            'size': this.timeframes[timeframe],
        };
        const response = await this.publicGetGetCandles (this.extend (request, params));
        // {
        //     "result":{
        //     "data":[
        //         {
        //             "time":1642973286229265,
        //             "low":0.068584,
        //             "high":0.068584,
        //             "open":0.068584,
        //             "close":0.068584,
        //             "volume":0.0338
        //         },
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // {"error":{"code":10501,"message":"Request parameters have incorrect format."}}
        //
        if (response === undefined) {
            return;
        }
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
