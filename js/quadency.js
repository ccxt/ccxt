'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, PermissionDenied, BadRequest, AuthenticationError } = require ('./base/errors');

module.exports = class quadency extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'quadency',
            'name': 'quadency',
            'countries': [],
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchTrades': true,
                'fetchTicker': true,
            },
            'timeframes': {
                '1m': '1', // default
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
                'api': {
                    'public': 'https://b2t-api-b2bx.flexprotect.org',
                    'private': 'https://b2t-api-b2bx.flexprotect.org',
                    'publicbase2': 'https://b2t-api-cmc-b2bx.flexprotect.org/marketdata/cmc/v1',
                },
                'www': 'https://b2t-api-b2bx.flexprotect.org',
            },
            'api': {
                'public': {
                    'get': [
                        'frontoffice/api/info',
                        'marketdata/instruments/{id}/depth',
                        'marketdata/instruments/{id}/history',
                    ],
                },
                'publicbase2': {
                    'get': [
                        'trades/{id}',
                        'summary',
                    ],
                },
            },
            'exceptions': {
                '400': BadRequest,
                '401': AuthenticationError,
                '403': AuthenticationError,
                '429': PermissionDenied,
            },
            'errorMessages': {
                '400': 'Incorrect parameters',
                '401': 'Incorrect keys or ts value differs from the current time by more than 5 seconds',
                '404': 'Not Found',
                '429': 'Too Many Requests: API Rate Limits violated',
                '500': 'Internal Server Error',
                '503': 'System is currently overloaded.',
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            if (api === 'public') {
                url += '?';
                const keys = Object.keys (query);
                for (let i = 0; i < keys.length; i++) {
                    url += keys[i];
                    url += '=';
                    url += query[keys[i]];
                    if (i < keys.length - 1) {
                        url += '&';
                    }
                }
            } else {
                url += '?' + this.urlencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetFrontofficeApiInfo ();
        // Response
        // {
        //     "serverTime": 636880696809972288,
        //     "pairs": {
        //         "btc_usdt": {
        //             "baseAsset": "btc",
        //             "quoteAsset": "usdt",
        //             "status": "Open",
        //             "hidden": 0,
        //             "makerFee": 0,
        //             "makerFeeLimit": 0,
        //             "takerFee": 0.001,
        //             "takerFeeLimit": 0,
        //             "priceScale": 6,
        //             "amountScale": 6,
        //             "createdAt": "2019-11-14T16:18:49.253354",
        //             "updatedAt": "2019-11-14T16:18:49.253354"
        //         },
        //     }
        // }
        const markets = this.safeValue (response, 'pairs');
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const isFrozen = this.safeString (market, 'hidden');
            const active = (isFrozen !== '1');
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': {
                    'amount': this.safeValue (market, 'amountScale'),
                    'price': this.safeValue (market, 'priceScale'),
                },
                'taker': this.safeFloat (market, 'takerFee'),
                'maker': this.safeFloat (market, 'makerFee'),
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -this.safeFloat (market, 'amountScale')),
                    },
                    'price': {
                        'min': Math.pow (10, -this.safeFloat (market, 'priceScale')),
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

    async fetchOrderBook (symbol = 'BTC/USDT', limit = 50, params = {}) {
        // Respoonse
        // {
        //     "instrument": "eth_btc",
        //     "bids": [
        //         {
        //             "amount": 0.3092258,
        //             "price": 0.01734264
        //         },
        //         {
        //             "amount": 51.61494099,
        //             "price": 0.01734363
        //         }
        //     ],
        //     "asks": [
        //         {
        //             "amount": 133.52370356,
        //             "price": 0.01739337
        //         },
        //         {
        //             "amount": 9.16854518,
        //             "price": 0.01739838
        //         }
        //     ],
        //     "version": 1891724,
        //     "askTotalAmount": 1849.11363582,
        //     "bidTotalAmount": 809.23878372,
        //     "snapshot": true
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetMarketdataInstrumentsIdDepth (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // {
        //     instrument: 'btc_usdt',
        //     start: '2022-01-03T12:00:00Z',
        //     end: '2022-01-03T13:00:00Z',
        //     low: 47288.9442022,
        //     high: 47426.3285076,
        //     volume: 0.21555747,
        //     quoteVolume: 10211.36844364,
        //     open: 47426.3285076,
        //     close: 47288.9442022
        //   }
        return [
            this.parse8601 (this.safeValue (ohlcv, 'start')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = 1000, params = {}) {
        // Response
        // {
        //     "success": true,
        //     "instrument": "btc_usdt",
        //     "data": [
        //         {
        //             "instrument": "btc_usdt",
        //             "start": "2019-03-13T09:00:00Z",
        //             "end": "2019-03-13T10:00:00Z",
        //             "low": 3842.855,
        //             "high": 3855.445,
        //             "volume": 4,
        //             "quoteVolume": 0,
        //             "open": 3855.105,
        //             "close": 3842.855
        //         },
        //         {
        //             "instrument": "btc_usdt",
        //             "start": "2019-03-13T10:00:00Z",
        //             "end": "2019-03-13T11:00:00Z",
        //             "low": 3834.355,
        //             "high": 3848.855,
        //             "volume": 26,
        //             "quoteVolume": 0,
        //             "open": 3842.865,
        //             "close": 3835.655
        //         }
        //     ],
        //     "startDateTime": "2019-03-13T09:00:00Z",
        //     "endDateTime": "2019-03-13T11:00:00Z"
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
            'id': marketId,
        };
        const duration = this.parseTimeframe (timeframe);
        if (since === undefined) {
            since = this.milliseconds () - limit * duration * 1000;
        }
        const enddate = since + limit * duration * 100;
        params = this.extend (params, { 'type': timeframe, 'startDate': this.ymdhms (since, 'T'), 'endDate': this.ymdhms (enddate, 'T') });
        const response = await this.publicGetMarketdataInstrumentsIdHistory (this.extend (request, params));
        const responseData = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (responseData);
    }

    async fetchTrades (symbol = 'BTC/USDT', since = undefined, limit = undefined, params = {}) {
        // Response
        // [
        //     {
        //         "tradeID": "1247307",
        //         "price": "10093.92246491",
        //         "base_volume": "0.0259",
        //         "quote_volume": "261.432591841169",
        //         "trade_timestamp": "1599577070",
        //         "type": "buy"
        //     },
        //     {
        //         "tradeID": "1247309",
        //         "price": "10091.69185435",
        //         "base_volume": "0.0754",
        //         "quote_volume": "760.913565817990",
        //         "trade_timestamp": "1599577128",
        //         "type": "sell"
        //     }
        // ]
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicbase2GetTradesId (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeString (trade, 'trade_timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'base_volume');
        let symbol = undefined;
        if (market === undefined) {
            market = this.safeValue (trade, 'market');
        }
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                if (symbol !== undefined) {
                    cost = parseFloat (this.costToPrecision (symbol, price * amount));
                }
            }
        }
        const transactionId = this.safeString (trade, 'tradeID');
        const side = this.safeString (trade, 'type');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': transactionId,
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

    parseTicker (symbol, ticker, market = undefined, time = undefined) {
        symbol = symbol.replace ('/', '_');
        if (ticker[symbol]) {
            const timestamp = time;
            const last = this.safeFloat (ticker[symbol], 'last');
            const percentage = this.safeFloat (ticker[symbol], 'percentChange');
            return {
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': this.safeFloat (ticker[symbol], 'high24hr'),
                'low': this.safeFloat (ticker[symbol], 'low24hr'),
                'bid': this.safeFloat (ticker[symbol], 'highestBid'),
                'bidVolume': undefined,
                'ask': this.safeFloat (ticker[symbol], 'lowestAsk'),
                'askVolume': undefined,
                'vwap': undefined,
                'open': undefined,
                'close': last,
                'last': last,
                'previousClose': undefined,
                'change': undefined,
                'percentage': percentage,
                'average': undefined,
                'baseVolume': this.safeFloat (ticker[symbol], 'baseVolume'),
                'quoteVolume': this.safeFloat (ticker[symbol], 'quoteVolume'),
                'info': ticker[symbol],
            };
        }
        return null;
    }

    async fetchTicker (symbol, params = {}) {
        // Response
        // {
        //     "BTC_USDT": {
        //         "id": "btc_usdt",
        //         "last": "10978.93578",
        //         "lowestAsk": "10979.0",
        //         "highestBid": "10978.71",
        //         "percentChange": "0.0813730364297798727996051454",
        //         "baseVolume": "6.47119743",
        //         "quoteVolume": "70829.9781692126756",
        //         "isFrozen": "0",
        //         "high24hr": "10985.0049",
        //         "low24hr": "10857.95376"
        //     },
        //     "BTC_USD": {
        //         "id": "btc_usd",
        //         "last": "0",
        //         "lowestAsk": "0",
        //         "highestBid": "0",
        //         "percentChange": "0",
        //         "baseVolume": "0",
        //         "quoteVolume": "0",
        //         "isFrozen": "0",
        //         "high24hr": "0",
        //         "low24hr": "0"
        //     }
        // }
        await this.loadMarkets ();
        const response = await this.publicbase2GetSummary (params);
        return this.parseTicker (symbol, response);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const error = this.safeString (response, 'errors');
        if (error === undefined) {
            // success
            return;
        }
        const errorMessages = this.errorMessages;
        let message = undefined;
        message = this.safeString (error[0], 'message');
        if (message === undefined) {
            message = this.safeString (errorMessages, code, 'Unknown Error');
        }
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions, code, feedback);
        throw new ExchangeError (feedback);
    }
};
