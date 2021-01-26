'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    ExchangeError,
    InsufficientFunds,
    OrderNotFound,
    ExchangeNotAvailable,
    BadRequest,
    OnMaintenance,
    AccountSuspended,
    PermissionDenied,
    ArgumentsRequired,
} = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coineal extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coineal',
            'name': 'Coineal',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                // public
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '24h': '1440',
            },
            'urls': {
                'logo': 'https://www.coineal.com/assets/images/svg/logo.svg',
                'api': {
                    'public': 'https://exchange-open-api.coineal.com/open/api',
                    'private': 'https://exchange-open-api.coineal.com/open/api',
                },
                'www': 'https://www.coineal.com',
                'doc': [
                    'https://www.coineal.com/static-page/api/en_US/api.html',
                ],
                'fees': 'https://www.coineal.com/static-page/about/en_US/?rates#en_US',
            },
            'api': {
                'public': {
                    'get': [
                        'get_ticker',
                        'get_records',
                        'market_dept',
                        'get_trades',
                        'common/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'user/account',
                        'order_info',
                        'all_trade',
                    ],
                    'post': [
                        'cancel_order',
                        'create_order',
                    ],
                },
            },
            'exceptions': {
                '5': BadRequest, // Order failed
                '6': BadRequest, // Exceeded the minimum volume requirement
                '7': BadRequest, // Exceeded the maximum volume requirement
                '8': BadRequest, // Order cancellation failed
                '9': BadRequest, // The transaction is frozen
                '13': ExchangeNotAvailable, // Sorry, the program has a system error, please contact the webmaster
                '19': InsufficientFunds, // Insufficient balance available
                '22': OrderNotFound, // Order does not exist
                '23': BadRequest, // Missing transaction quantity parameter
                '24': BadRequest, // Missing transaction price parameter
                '100001': ExchangeError, // System error
                '100002': OnMaintenance, // System upgrade
                '100004': BadRequest, // Illegal parameter
                '100005': BadRequest, // Parameter signature error
                '100007': BadRequest, // Unauthorized ip
                '110002': BadRequest, // Unknown currency code
                '110003': BadRequest, // Withdrawal password error
                '110004': BadRequest, // Withdrawal is frozen
                '110005': InsufficientFunds, // Insufficient balance
                '110020': BadRequest, // Username does not exist
                '110023': BadRequest, // This phone is already registered
                '110024': BadRequest, // This email is already registered
                '110025': AccountSuspended, // Account locked
                '110032': PermissionDenied, // User not authorized to do this
                '110033': BadRequest, // Deposit failed
                '110034': BadRequest, // Withdrawal failed
            },
        });
    }

    async fetchMarkets (params = {}) {
        // {
        //     "symbol": "btcusdt",
        //     "count_coin": "usdt",
        //     "amount_precision": 5,
        //     "base_coin": "btc",
        //     "price_precision": 2
        // },
        const response = await this.publicGetCommonSymbols (params);
        const result = [];
        for (let i = 0; i < response['data'].length; i++) {
            const market = response['data'][i];
            const baseId = this.safeString (market, 'base_coin');
            const quoteId = this.safeString (market, 'count_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const id = base + '/' + quote;
            const symbol = base + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            result.push ({
                'id': id,
                'symbol': symbol.toLowerCase (),
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const timestamp = this.milliseconds ();
        const market = this.safeMarket (symbol);
        const request = this.extend ({
            'symbol': market['symbol'],
        }, params);
        const response = await this.publicGetGetTicker (request);
        const ticker = this.safeValue (response, 'data');
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const bid = this.safeFloat (ticker, 'buy');
        const ask = this.safeFloat (ticker, 'sell');
        const last = this.safeFloat (ticker, 'last');
        const vol = this.safeFloat (ticker, 'vol');
        return {
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
            'previousClose': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'percentage': undefined,
            'change': undefined,
            'average': undefined,
            'baseVolume': vol,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'symbol': market['symbol'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = 'publicGetGetRecords';
        const response = await this[method] (this.extend (request, params));
        // 'code': '0',
        // 'msg': 'suc',
        // 'data': [
        //             [
        //                 1529387760,  //Time Stamp
        //                 7585.41,  //Opening Price
        //                 7585.41,  //Highest Price
        //                 7585.41,  //Lowest Price
        //                 7585.41,  //Closing Price
        //                 0.0       //Transaction Volume
        //             ]
        //         ]
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'symbol': market['symbol'],
            'type': 'step0',
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const method = 'publicGetMarketDept';
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data['tick'], data['tick']['time'], 'bids', 'asks');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const method = 'publicGetGetTrades';
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        //     [
        //         {
        //             "id": 28457,
        //             "price": "4.00000100",
        //             "amount": "12.00000000",
        //             "trade_time": 1499865549590,
        //             "type": "sell'
        //         }
        //     ]
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'trade_time');
        const price = this.safeFloat2 (trade, 'price');
        const amount = this.safeFloat2 (trade, 'amount');
        const id = this.safeString2 (trade, 'id');
        const orderId = this.safeString (trade, 'id');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': trade['type'],
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserAccount (params);
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances['coin_list'].length; i++) {
            const wallet = balances['coin_list'][i];
            const currencyId = wallet['coin'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (wallet, 'normal') - this.safeFloat (wallet, 'locked');
            account['total'] = this.safeFloat (wallet, 'normal');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'side': (side === 'buy') ? 'BUY' : 'SELL',
            'price': price,
            'volume': amount,
            'type': type,
            'symbol': market['symbol'],
        };
        const response = await this.privatePostCreateOrder (this.extend (request, params));
        return this.parseOrder (this.extend ({
            'status': 'open',
            'type': side,
            'initialAmount': amount,
        }, response), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol argument');
        }
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'order_id': id,
            'symbol': market['symbol'],
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'symbol': market['symbol'],
            'orderId': id,
        };
        const response = await this.privateGetOrderInfo (this.extend (request, params));
        const order = this.parseOrder (response['data'], market);
        return order;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const response = await this.privateGetAllTrade (this.extend (request, params));
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {
        //     "count": 22,
        //         "resultList": [
        //         {
        //             "volume": "1.000",
        //             "side": "BUY",
        //             "price": "0.10000000",
        //             "fee": "0.16431104",
        //             "ctime": 1510996571195,
        //             "deal_price": "0.10000000",
        //             "id": 306,
        //             "type": "买入"
        //         }
        //     ]
        // }
        // }
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data['resultList'], undefined, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            query['time'] = timestamp;
            query['api_key'] = this.apiKey;
            const query2 = this.urlencode (query);
            const queryArray = query2.split ('&');
            const sortedQuery = queryArray.sort ();
            const joinedQuery = sortedQuery.join ('');
            const authArr = joinedQuery.split ('=');
            const auth = authArr.join ('');
            const hashBefore = auth + this.secret;
            const hash = this.hash (this.encode (hashBefore), 'md5');
            if (method === 'GET') {
                query['sign'] = hash;
                const query3 = this.urlencode (query);
                const queryArray = query3.split ('&');
                const sortedQuery = this.sortBy (queryArray, 0).join ('&');
                url += '?' + sortedQuery;
            } else {
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                query['sign'] = hash;
                body = this.urlencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const httpCode = this.safeInteger (response, 'code', 200);
        if (response === undefined) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const feedback = this.safeString (response, 'msg');
        if (errorCode !== '0') {
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            throw new ExchangeError (feedback);
        }
        if (httpCode >= 400) {
            const message = this.safeValue (response, 'msg', '');
            throw new ExchangeError (this.id + ' HTTP Error ' + httpCode + ' message: ' + message);
        }
    }
};

