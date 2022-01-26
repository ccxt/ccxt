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
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '6h': '360',
                '1d': '1440',
            },
            'urls': {
                'logo': '',
                'api': {
                    'spot': 'https://api.btse.com/spot/api/v3.2',
                    'future': 'https://api.btse.com/futures/api/v2.1',
                },
                'www': 'https://www.btse.com/en/home',
                'doc': 'https://btsecom.github.io/docs/',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'market_summary': 1,
                            'ohlcv': 1,
                            'price': 1,
                            'orderbook/{symbol}': 1,
                            'trades': 1,
                            'time': 1,
                            'get-stats': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'user/open_orders': 1,
                            'user/fees': 1,
                        },
                        'post': {
                            'order': 1,
                            'order/peg': 1,
                        },
                        'put': {
                            'order': 1,
                        },
                        'delete': {
                            'order/cancelAllAfter': 1,
                            'user/trade_history': 1,

                        },
                    },
                },
                'future': {
                    'public': {
                        'get': {
                            'market_summary': 1,
                            'ohlcv': 1,
                            'price': 1,
                            'orderbook/{symbol}': 1,
                            'trades': 1,
                            'time': 1,
                            'get-stats': 1,
                        },
                    },

                },
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
        const response = await this.SpotPublicGetGetInstruments (params);
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
            const minQuantity = this.safeNumber (market, 'minOrderSize');
            const maxQuantity = this.safeNumber (market, 'maxOrderSize');
            const minPriceIncrement = this.safeNumber (market, 'minPriceIncrement');
            const active = this.safeString (market, 'active');
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
                'maker': undefined,
                'taker': undefined,
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
                'active': (active === 'active'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': minPriceIncrement,
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
        const futuresResponse = await this.FuturePublicGetGetInstruments (params);
        // [
        // {
        //     "symbol":"XRPPFC",
        //     "last":0.6095,
        //     "lowestAsk":0.6095,
        //     "highestBid":0.6083,
        //     "openInterest":559988.0,
        //     "openInterestUSD":340930.27,
        //     "percentageChange":0.8271,
        //     "volume":995720.3549,
        //     "high24Hr":0.665,
        //     "low24Hr":0.5936,
        //     "base":"XRP",
        //     "quote":"USD",
        //     "contractStart":0,
        //     "contractEnd":0,
        //     "active":true,
        //     "timeBasedContract":false,
        //     "openTime":0,
        //     "closeTime":0,
        //     "startMatching":0,
        //     "inactiveTime":0,
        //     "fundingRate":1.2499999999999999E-5,
        //     "contractSize":1.0,
        //     "maxPosition":5000000,
        //     "minValidPrice":1.0E-4,
        //     "minPriceIncrement":1.0E-4,
        //     "minOrderSize":1,
        //     "maxOrderSize":100000,
        //     "minRiskLimit":50000,
        //     "maxRiskLimit":500000,
        //     "minSizeIncrement":1.0,
        //     "availableSettlement":[
        //        "USD",
        //        "LTC",
        //        "BTC",
        //        "USDT",
        //        "USDC",
        //        "USDP"
        //     ]
        //  },
        // ]
        for (let i = 0; i < futuresResponse.length; i++) {
            const market = futuresResponse[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuantity = this.safeNumber (market, 'minOrderSize');
            const maxQuantity = this.safeNumber (market, 'maxOrderSize');
            const minPriceIncrement = this.safeNumber (market, 'minPriceIncrement');
            const active = this.safeString (market, 'active');
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
                'maker': undefined,
                'taker': undefined,
                'linear': undefined,
                'inverse': undefined,
                'settle': undefined,
                'settleId': undefined,
                'type': undefined,
                'spot': false,
                'margin': undefined,
                'future': true,
                'swap': false,
                'option': false,
                'optionType': undefined,
                'strike': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'contract': false,
                'contractSize': undefined,
                'active': (active === 'active'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': minPriceIncrement,
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
            'symbol': market['id'],
        };
        if (limit) {
            request['depth'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetGetOrderBookL2',
            'future': 'futurePublicGetGetOrderBookL2',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // {
        //     "buyQuote":[
        //        {
        //           "price":"0.6050",
        //           "size":"9079"
        //        },
        //     ],
        //     "sellQuote":[
        //        {
        //           "price":"0.6105",
        //           "size":"20414"
        //        }
        //     ],
        //     "lastPrice":"0.6103",
        //     "timestamp":1643235771013,
        //     "gain":-1,
        //     "symbol":"XRPPFC"
        //  }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'buyQuote', 'sellQuote');
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
        // [
        //    1643155200,
        //    2460.6,
        //    2722.75,
        //    2402.25,
        //    2464.3,
        //    2.7827867792979002E7
        // ]
        //
        return [
            this.Integer (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOHLCV', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetPublicGetCandlestick',
            'future': 'derivativesPublicGetPublicGetCandlestick',
        });
        const response = await this[method] (this.extend (request, query));
        //
        //     [
        //         [
        //            1643155200,
        //            2460.6,
        //            2722.75,
        //            2402.25,
        //            2464.3,
        //            2.7827867792979002E7
        //         ],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTime (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetGetTime',
            'future': 'futurePublicGetGetTimes',
        });
        const response = await this[method] (query);
        // {
        //     "iso": "2021-06-29T18:14:30.886Z",
        //     "epoch": 1624990470
        // }
        return this.safeInteger (response, 'epoch');
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
