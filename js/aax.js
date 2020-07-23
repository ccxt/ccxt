'use strict';

const Exchange = require ('./base/Exchange');

module.exports = class aax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aax',
            'name': 'aax',
            'rateLimit': 500,
            'has': {
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '8h': 480,
                '1d': 1440,
            },
            'urls': {
                'api': 'https://api.aax.com',
                'www': 'https://www.aax.com/',
            },
            'api': {
                'public': {
                    'get': [
                        'v2/instruments',
                        'v2/market/orderbook',
                        'marketdata/v1/getHistMarketData',
                        'v2/market/trades',
                    ],
                },
            },
            'errorMessages': {
                '400': 'There is something wrong with your request',
                '401': 'Your API key is wrong',
                '403': 'Your API key does not have enough privileges to access this resource',
                '429': 'You have exceeded your API key rate limits',
                '500': 'Internal Server Error',
                '503': 'Service is down for maintenance',
                '504': 'Request timeout expired',
                '550': 'You requested data that are not available at this moment',
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        url += '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetV2Instruments ();
        // Exchange Response
        // {
        //     "code":1,
        //     "data":[
        //        {
        //           "tickSize":"0.1",
        //           "lotSize":"0.0001",
        //           "base":"BTC",
        //           "quote":"USDT",
        //           "minQuantity":"0.0010000000",
        //           "maxQuantity":"999900.0000000000",
        //           "minPrice":"0.1000000000",
        //           "maxPrice":"10000000.0000000000",
        //           "status":"enable",
        //           "symbol":"BTCUSDT",
        //           "code":null,
        //           "takerFee":"0.00000",
        //           "makerFee":"0.00000",
        //           "multiplier":"1.000000000000",
        //           "mmRate":"0.02500",
        //           "imRate":"0.05000",
        //           "type":"spot"
        //        },
        //        ...
        //     ],
        //     "message":"success",
        //     "ts":1573561743499
        //  }
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const code = this.safeString (market, 'code');
            if ((code && code.toUpperCase () === 'FP')) {
                continue;
            }
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = baseId + '/' + quoteId;
            const status = this.safeString (market, 'status');
            let active = undefined;
            if (status !== undefined) {
                active = (status.toUpperCase () === 'ENABLE' || status.toUpperCase () === 'READONLY');
            }
            const precision = {
                'price': this.precisionFromString (market['tickSize']),
                'amount': this.precisionFromString (market['lotSize']),
            };
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'type': this.safeString (market, 'type'),
                'taker': this.safeFloat (market, 'takerFee'),
                'maker': this.safeFloat (market, 'makerFee'),
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minQuantity'),
                        'max': this.safeFloat (market, 'maxQuantity'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'minPrice'),
                        'max': this.safeFloat (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchOHLCV (symbol = 'BTC/USDT', timeframe = '1m', since = undefined, limit = 30, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'date_scale': this.timeframes[timeframe],
            'base': market['base'],
            'quote': market['quote'],
            'limit': limit,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if ('to' in params) {
            request['to'] = params['to'];
        }
        const response = await this.publicGetMarketdataV1GetHistMarketData (this.extend (request, params));
        const result = [];
        if ('s' in response && response['s'] === 'ok') {
            const timeArr = response['t'];
            const openArr = response['o'];
            const highArr = response['h'];
            const lowArr = response['l'];
            const closeArr = response['c'];
            const volumeArr = response['v'];
            for (let i = 0; i < timeArr.length; i++) {
                const ohlcvArr = [];
                ohlcvArr.push (parseInt (timeArr[i]) * 1000);
                ohlcvArr.push (openArr[i]);
                ohlcvArr.push (highArr[i]);
                ohlcvArr.push (lowArr[i]);
                ohlcvArr.push (closeArr[i]);
                ohlcvArr.push (volumeArr[i]);
                result.push (ohlcvArr);
            }
        }
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol = 'BTC/USDT', limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'level': limit,
        };
        const response = await this.publicGetV2MarketOrderbook (this.extend (request, params));
        // Response Format
        // {
        //     "asks":[
        //        [
        //           "10823.00000000", #price
        //           "0.004000"  #size
        //        ],
        //        [
        //           "10823.10000000",
        //           "0.100000"
        //        ],
        //        [
        //           "10823.20000000",
        //           "0.010000"
        //        ]
        //     ],
        //     "bids":[
        //        [
        //           "10821.20000000",
        //           "0.002000"
        //        ],
        //        [
        //           "10821.10000000",
        //           "0.005000"
        //        ],
        //        [
        //           "10820.40000000",
        //           "0.013000"
        //        ]
        //     ],
        //     "e":"BTCUSDT@book_50",
        //     "t":1561543614756
        //  }
        const timestamp = this.safeInteger (response, 't').toString ();
        return this.parseOrderBook (response, timestamp);
    }

    parseTrade (trade, market = undefined) {
        // From FetchTrades
        //   {
        //     "e":"BTCUSDFP@trades",
        //     "trades":
        //         [ { "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563996718
        //          },
        //         {  "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563993577
        //         }]
        //   }
        const timestamp = this.safeInteger (trade, 't').toString ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        let price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        let side = 'BUY';
        let cost = undefined;
        if (price !== undefined) {
            if (price < 0) {
                side = 'SELL';
            }
            price = Math.abs (price);
            if (amount !== undefined) {
                if (symbol !== undefined) {
                    cost = parseFloat (this.costToPrecision (symbol, price * amount));
                }
            }
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 2000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'limit': limit,
        };
        const response = await this.publicGetV2MarketTrades (this.extend (request, params));
        // Response Received
        // {
        //     "e":"BTCUSDFP@trades",
        //     "trades":
        //         [ { "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563996718
        //          },
        //         {  "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563993577
        //         }]
        //   }
        return this.parseTrades (this.safeValue (response, 'trades'), market, since, limit);
    }
};
