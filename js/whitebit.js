'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, ExchangeError, DDoSProtection, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': 'v2',
            'countries': [ 'EE' ],
            'rateLimit': 500,
            'has': {
                'cancelOrder': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'privateAPI': false,
                'publicAPI': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg',
                'api': {
                    'web': 'https://whitebit.com/',
                    'publicV2': 'https://whitebit.com/api/v2/public',
                    'publicV1': 'https://whitebit.com/api/v1/public',
                },
                'www': 'https://www.whitebit.com',
                'doc': 'https://documenter.getpostman.com/view/7473075/Szzj8dgv?version=latest',
                'fees': 'https://whitebit.com/fee-schedule',
                'referral': 'https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963',
            },
            'api': {
                'web': {
                    'get': [
                        'v1/healthcheck',
                    ],
                },
                'publicV1': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'symbols',
                        'depth/result',
                        'history',
                        'kline',
                    ],
                },
                'publicV2': {
                    'get': [
                        'markets',
                        'ticker',
                        'assets',
                        'fee',
                        'depth/{market}',
                        'trades/{market}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'options': {
                'fetchTradesMethod': 'fetchTradesV1',
            },
            'exceptions': {
                'exact': {
                    '503': ExchangeNotAvailable, // {"response":null,"status":503,"errors":{"message":[""]},"notification":null,"warning":null,"_token":null}
                },
                'broad': {
                    'Market is not available': BadSymbol, // {"success":false,"message":{"market":["Market is not available"]},"result":[]}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicV2GetMarkets (params);
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             {
        //                 "name":"BTC_USD",
        //                 "moneyPrec":"2",
        //                 "stock":"BTC",
        //                 "money":"USD",
        //                 "stockPrec":"6",
        //                 "feePrec":"4",
        //                 "minAmount":"0.001",
        //                 "tradesEnabled":true,
        //                 "minTotal":"0.001"
        //             }
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'result');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'tradesEnabled');
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
                    'amount': this.safeInteger (market, 'stockPrec'),
                    'price': this.safeInteger (market, 'moneyPrec'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minTotal'),
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicV2GetAssets (params);
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "BTC":{
        //                 "id":"4f37bc79-f612-4a63-9a81-d37f7f9ff622",
        //                 "lastUpdateTimestamp":"2019-10-12T04:40:05.000Z",
        //                 "name":"Bitcoin",
        //                 "canWithdraw":true,
        //                 "canDeposit":true,
        //                 "minWithdrawal":"0.001",
        //                 "maxWithdrawal":"0",
        //                 "makerFee":"0.1",
        //                 "takerFee":"0.1"
        //             }
        //         }
        //     }
        //
        const currencies = this.safeValue (response, 'result');
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            // breaks down in Python due to utf8 encoding issues on the exchange side
            // const name = this.safeString (currency, 'name');
            const canDeposit = this.safeValue (currency, 'canDeposit', true);
            const canWithdraw = this.safeValue (currency, 'canWithdraw', true);
            const active = canDeposit && canWithdraw;
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'name': undefined, // see the comment above
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawal'),
                        'max': this.safeFloat (currency, 'maxWithdrawal'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        const response = await this.publicV2GetFee (params);
        const fees = this.safeValue (response, 'result');
        return {
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicV1GetTicker (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result": {
        //             "bid":"0.021979",
        //             "ask":"0.021996",
        //             "open":"0.02182",
        //             "high":"0.022039",
        //             "low":"0.02161",
        //             "last":"0.021987",
        //             "volume":"2810.267",
        //             "deal":"61.383565474",
        //             "change":"0.76",
        //         },
        //     }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "bid":"0.021979",
        //         "ask":"0.021996",
        //         "open":"0.02182",
        //         "high":"0.022039",
        //         "low":"0.02161",
        //         "last":"0.021987",
        //         "volume":"2810.267",
        //         "deal":"61.383565474",
        //         "change":"0.76",
        //     }
        //
        // fetchTickers v1
        //
        //     {
        //         "at":1571022144,
        //         "ticker": {
        //             "bid":"0.022024",
        //             "ask":"0.022042",
        //             "low":"0.02161",
        //             "high":"0.022062",
        //             "last":"0.022036",
        //             "vol":"2813.503",
        //             "deal":"61.457279261",
        //             "change":"0.95"
        //         }
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'at', this.milliseconds ());
        ticker = this.safeValue (ticker, 'ticker', ticker);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'change');
        let change = undefined;
        if (percentage !== undefined) {
            change = this.numberToString (percentage * 0.01);
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'deal'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicV1GetTickers (params);
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result": {
        //             "ETH_BTC": {
        //                 "at":1571022144,
        //                 "ticker": {
        //                     "bid":"0.022024",
        //                     "ask":"0.022042",
        //                     "low":"0.02161",
        //                     "high":"0.022062",
        //                     "last":"0.022036",
        //                     "vol":"2813.503",
        //                     "deal":"61.457279261",
        //                     "change":"0.95"
        //                 }
        //             },
        //         },
        //     }
        //
        const data = this.safeValue (response, 'result');
        const marketIds = Object.keys (data);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (data[marketId], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 100
        }
        const response = await this.publicV2GetDepthMarket (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "lastUpdateTimestamp":"2019-10-14T03:15:47.000Z",
        //             "asks":[
        //                 ["0.02204","2.03"],
        //                 ["0.022041","2.492"],
        //                 ["0.022042","2.254"],
        //             ],
        //             "bids":[
        //                 ["0.022018","2.327"],
        //                 ["0.022017","1.336"],
        //                 ["0.022015","2.089"],
        //             ],
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.parse8601 (this.safeString (result, 'lastUpdateTimestamp'));
        return this.parseOrderBook (result, timestamp);
    }

    async fetchTradesV1 (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'lastId': 1, // todo add since
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 10000
        }
        const response = await this.publicV1GetHistory (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             {
        //                 "id":11887426,
        //                 "type":"buy",
        //                 "time":1571023057.413769,
        //                 "amount":"0.171",
        //                 "price":"0.022052"
        //             }
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTradesV2 (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 10000
        }
        const response = await this.publicV2GetTradesMarket (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result": [
        //             {
        //                 "tradeId":11903347,
        //                 "price":"0.022044",
        //                 "volume":"0.029",
        //                 "time":"2019-10-14T06:30:57.000Z",
        //                 "isBuyerMaker":false
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const method = this.safeString (this.options, 'fetchTradesMethod', 'fetchTradesV2');
        return await this[method] (symbol, since, limit, params);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTradesV1
        //
        //     {
        //         "id":11887426,
        //         "type":"buy",
        //         "time":1571023057.413769,
        //         "amount":"0.171",
        //         "price":"0.022052"
        //     }
        //
        // fetchTradesV2
        //
        //     {
        //         "tradeId":11903347,
        //         "price":"0.022044",
        //         "volume":"0.029",
        //         "time":"2019-10-14T06:30:57.000Z",
        //         "isBuyerMaker":false
        //     }
        //
        let timestamp = this.safeValue (trade, 'time');
        if (typeof timestamp === 'string') {
            timestamp = this.parse8601 (timestamp);
        } else {
            timestamp = parseInt (timestamp * 1000);
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'amount', 'volume');
        const id = this.safeString2 (trade, 'id', 'tradeId');
        let side = this.safeString (trade, 'type');
        if (side === undefined) {
            const isBuyerMaker = this.safeValue (trade, 'isBuyerMaker');
            side = isBuyerMaker ? 'buy' : 'sell';
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (amount !== undefined && price !== undefined) {
            cost = amount * price;
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            const maxLimit = 1440;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min (limit, maxLimit);
            const start = parseInt (since / 1000);
            const duration = this.parseTimeframe (timeframe);
            const end = this.sum (start, duration * limit);
            request['start'] = start;
            request['end'] = end;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 1440
        }
        const response = await this.publicV1GetKline (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             [1591488000,"0.025025","0.025025","0.025029","0.025023","6.181","0.154686629"],
        //             [1591488060,"0.025028","0.025033","0.025035","0.025026","8.067","0.201921167"],
        //             [1591488120,"0.025034","0.02505","0.02505","0.025034","20.089","0.503114696"],
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591488000,
        //         "0.025025",
        //         "0.025025",
        //         "0.025029",
        //         "0.025023",
        //         "6.181",
        //         "0.154686629"
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0), // timestamp
            this.safeFloat (ohlcv, 1), // open
            this.safeFloat (ohlcv, 3), // high
            this.safeFloat (ohlcv, 4), // low
            this.safeFloat (ohlcv, 2), // close
            this.safeFloat (ohlcv, 5), // volume
        ];
    }

    async fetchStatus (params = {}) {
        const response = await this.webGetV1Healthcheck (params);
        const status = this.safeInteger (response, 'status');
        let formattedStatus = 'ok';
        if (status === 503) {
            formattedStatus = 'maintenance';
        }
        this.status = this.extend (this.status, {
            'status': formattedStatus,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    sign (path, api = 'publicV1', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 404) {
            throw new ExchangeError (this.id + ' ' + code.toString () + ' endpoint not found');
        }
        if (response !== undefined) {
            const success = this.safeValue (response, 'success');
            if (!success) {
                const feedback = this.id + ' ' + body;
                const status = this.safeString (response, 'status');
                if (typeof status === 'string') {
                    this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
                }
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
