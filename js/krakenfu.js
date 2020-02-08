'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class krakenfu extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'krakenfu',
            'name': 'Kraken Futures',
            'countries': [ 'US' ],
            'version': 'v3',
            'userAgent': undefined,
            'rateLimit': 600,
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'withdraw': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
                'createDepositAddress': false,
                'fetchDepositAddress': false,
                'fetchClosedOrders': false,
                'fetchTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrderTrades': false,
                'fetchOrders': false,
                'fetchOrder': false,
                'fetchMyTrades': false,
            },
            'timeframes': {},
            'urls': {
                'test': {
                    'public': undefined,
                    'private': undefined,
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api': {
                    'public': 'https://futures.kraken.com/derivatives/api',
                    'private': 'https://futures.kraken.com/derivatives/api',
                },
                'www': 'https://futures.kraken.com/',
                'doc': [
                    'https://support.kraken.com/hc/en-us/categories/360001806372-Futures-API',
                ],
                'fees': 'https://support.kraken.com/hc/en-us/articles/360022835771-Transaction-fees-and-rebates-for-Kraken-Futures',
                'referral': undefined,
            },
            'api': {
                'public': {
                    'get': [
                        'instruments',
                        'orderbook',
                        'tickers',
                        'history',
                    ],
                },
                'private': {
                    'get': [
                        'openpositions',
                        'notifications',
                        'accounts',
                        'openorders',
                        'recentorders',
                        'historicorders',
                        'transfers',
                    ],
                    'post': [
                        'sendorder',
                        'editorder',
                        'cancelorder',
                        'fills',
                        'transfer',
                        'batchorder',
                        'cancelallorders',
                        'cancelallordersafter',
                        'withdrawal',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': -0.0002,
                    'taker': 0.00075,
                },
            },
            'exceptions': {
                'exact': {
                    'apiLimitExceeded': DDoSProtection,
                    // 'marketUnavailable': 
                    // 'requiredArgumentMissing':
                    // 'invalidArgument':
                    // 'unavailable':
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'symbol': {
                    'quoteIds': ['USD','XBT'],
                    'reversed': false,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstruments (params);
        // {
        //   "result":"success",
        //   "instruments":[
        //     {
        //       "symbol":"fi_ethusd_180928",
        //       "type":"futures_inverse",
        //       "underlying":"rr_ethusd",
        //       "lastTradingTime":"2018-09-28T15:00:00.000Z",
        //       "tickSize":0.1,
        //       "contractSize":1,
        //       "tradeable":true,
        //       "marginLevels":[
        //          {
        //           "contracts":0,
        //           "initialMargin":0.02,
        //           "maintenanceMargin":0.01
        //         },
        //         {
        //           "contracts":250000,
        //           "initialMargin":0.04,
        //           "maintenanceMargin":0.02
        //         },
        //         {
        //           "contracts":500000,
        //           "initialMargin":0.06,
        //           "maintenanceMargin":0.03
        //         }
        //       ]
        //     },
        // ...
        //     {
        //       "symbol":"in_xbtusd",
        //       "type":"spot index",
        //       "tradeable":false
        //     }
        //   ],
        //   "serverTime":"2018-07-19T11:32:39.433Z"
        // }
        const instruments = response['instruments'];
        const result = [];
        for (let i = 0; i < instruments.length; i++) {
            const market = instruments[i];
            const active = true;
            const id = market['symbol'];
            let type = undefined;
            let swap = false;
            let future = false;
            let prediction = false;
            let perpetual = undefined;
            if (market['type'].indexOf ('_inverse') >= 0) {
                swap = true;
                type = 'swap';
            } else if (market['type'].indexOf (' index') >= 0) {
                prediction = true;
                type = 'prediction';
            } else {
                future = true;
                type = 'future';
            }
            if (type !== 'prediction') {
                perpetual = (this.safeString (market, 'lastTradingTime') === undefined);
            }
            let symbol = id;
            const split = id.split ('_');
            const parsed = this.parseSymbolIdJoined (split[1]);
            const baseId = parsed['baseId'];
            const quoteId = parsed['quoteId'];
            const base = parsed['base'];
            const quote = parsed['quote'];
            if (perpetual) {
                symbol = base + '/' + quote;
            }
            const precision = {
                'amount': undefined,
                'price': undefined,
            };
            const contractSize = this.safeFloat (market, 'contractSize');
            const tickSize = this.safeFloat (market, 'tickSize');
            if (contractSize !== undefined) {
                precision['amount'] = contractSize;
            }
            if (tickSize !== undefined) {
                precision['price'] = tickSize;
            }
            const limits = {
                'amount': {
                    'min': contractSize,
                    'max': undefined,
                },
                'price': {
                    'min': tickSize,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'type': type,
                'spot': false,
                'swap': swap,
                'future': future,
                'prediction': prediction,
                'perpetual': perpetual,
                'info': market,
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
        const response = await this.publicGetOrderbook (this.extend (request, params));
        // {  
        //    "result":"success",
        //    "serverTime":"2016-02-25T09:45:53.818Z",
        //    "orderBook":{  
        //       "bids":[  
        //          [  
        //             4213,
        //             2000,
        //          ],
        //          [  
        //             4210,
        //             4000,
        //          ],
        //          ...,
        //       ],
        //       "asks":[  
        //          [  
        //             4218,
        //             4000,
        //          ],
        //          [  
        //             4220,
        //             5000,
        //          ],
        //          ...,
        //       ],
        //    },
        // }
        const timestamp = this.parse8601 (response['serverTime']);
        return this.parseOrderBook (response['orderBook'], timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = response['tickers'];
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // {  
        //    "tag":"quarter",
        //    "pair":"XRP:USD",
        //    "symbol":"fi_xrpusd_180615",
        //    "markPrice":0.8036,
        //    "bid":0.8154,
        //    "bidSize":15000,
        //    "ask":0.8166,
        //    "askSize":45000,
        //    "vol24h":5314577,
        //    "openInterest":3807948,
        //    "open24h":0.82890000,
        //    "last":0.814,
        //    "lastTime":"2018-05-10T17:14:29.301Z",
        //    "lastSize":1000,
        //    "suspended":false
        // }
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (ticker, 'lastTime'));
        const open = this.safeFloat (ticker, 'open24h');
        const last = this.safeFloat (ticker, 'last');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
                average = (open + last) / 2;
            }
        }
        const volume = this.safeFloat (ticker, 'vol24h');
        let baseVolume = undefined;
        let quoteVolume = undefined;
        if ((market !== undefined) && (!market['prediction'])) {
            if (market['swap']) {
                quoteVolume = volume;
            } else {
                baseVolume = volume;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bidSize'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'askSize'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['lastTime'] = this.iso8601 (since);
        }
        // Returns the last 100 trades from the specified lastTime value
        const response = await this.publicGetHistory (this.extend (request, params));
        return this.parseTrades (response['history'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //    {  
        //       "time":"2019-02-14T09:25:33.920Z",
        //       "trade_id":100,
        //       "price":3574,
        //       "size":100,
        //       "side":"buy",
        //       "type":"fill"
        //       "uid":"11c3d82c-9e70-4fe9-8115-f643f1b162d4"
        //    }
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        const id = this.safeString (trade, 'uid');
        //const order = this.safeString (trade, 'orderID');
        const side = this.safeString (trade, 'side');
        let order = undefined;
        let cost = undefined;
        let fee = undefined;
        let takerOrMaker = undefined;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        // The classification of the matched trade in an orderbook:
        //   "fill"         if it is a normal buyer and seller
        //   "liquidation"  if it is a result of a user being liquidated from their position
        //   "assignment"   if the fill is the result of a users position being assigned to a marketmaker
        //   "termination"  if it is a result of a user being terminated.
        const type = undefined;
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
            'info': trade,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (code >= 400) {
            const message = this.safeString (response, 'error');
            if (message === undefined) {
                return;
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            if (code === 400) {
                throw new BadRequest (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }

    parseSymbolIdJoined (symbolId) {
        // Convert by detecting and converting currencies in symbol
        const symbolIdLower = symbolId.toLowerCase ();
        const quoteIds = this.options['symbol']['quoteIds'];
        const reversed = this.options['symbol']['reversed'];
        const method = reversed ? 'startsWith' : 'endsWith';
        let quoteId = undefined;
        let baseId = undefined;
        for (let i = 0; i < quoteIds.length; i++) {
            if (this[method] (symbolIdLower, quoteIds[i].toLowerCase ())) {
                quoteId = quoteIds[i];
                break;
            }
        }
        if (quoteId === undefined) {
            throw new ExchangeError (symbolId);
        }
        const first = this.sliceString (symbolId, 0, symbolId.length - quoteId.length);
        const second = this.sliceString (symbolId, quoteId.length);
        if (!reversed) {
            baseId = first;
            quoteId = second;
        } else {
            quoteId = first;
            baseId = second;
        }
        return {
            'baseId': baseId,
            'quoteId': quoteId,
            'base': this.safeCurrencyCode (baseId),
            'quote': this.safeCurrencyCode (quoteId),
        };
    }

    startsWith (string, x) {
        return this.sliceString (string, 0, x.length) === x;
    }

    endsWith (string, x) {
        const start = Math.max (0, string.length - x.length);
        return this.sliceString (string, start) === x;
    }

    sliceString (string, start = undefined, end = undefined) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = string.length;
        }
        return string.slice (start, end);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + this.version + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                query += '?' + this.urlencode (params);
            }
        } else {
            const format = this.safeString (params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode ({ '_format': format });
                params = this.omit (params, '_format');
            }
        }
        const url = this.urls['api'][api] + query;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
