'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    ArgumentsRequired,
    ExchangeError,
    OrderNotFound,
    BadRequest,
    InsufficientFunds,
    AccountSuspended,
    PermissionDenied,
    InvalidOrder,
    BadSymbol,
    RateLimitExceeded,
} = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class wbf extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'wbf',
            'name': 'Wbf',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': true,
                'createMarketOrder': false,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
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
                '1d': '1440',
                '1w': '10080',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'urls': {
                'logo': 'https://www.wbfex.com/static/img/1/fb0a0d2f1e6fdae83d3f3a7d8990621d.png',
                'api': {
                    'public': 'https://openapi.wbf.live/open/api',
                    'private': 'https://openapi.wbf.live/open/api',
                },
                'www': 'https://www.wbf.live',
                'doc': [
                    'https://wbfex.github.io/wbfapi/en/#introduction',
                ],
                'fees': '',
            },
            'api': {
                'public': {
                    'get': [
                        'common/symbols',
                        'get_ticker',
                        'market_dept',
                        'get_allticker',
                        'get_records',
                        'get_trades',
                    ],
                },
                'private': {
                    'get': [
                        'user/account',
                        'all_trade',
                        'v2/all_order',
                        'order_info',
                    ],
                    'post': [
                        'cancel_order',
                        'cancel_order_all',
                        'v2/create_order',
                    ],
                },
            },
            // exchange specific options
            'options': {
                'newOrderTypes': {
                    'limit': '1',
                    'market': '2',
                },
            },
            'exceptions': {
                '1': ExchangeError, // system internal error
                '2': BadRequest, // invalid parameter
                '3': PermissionDenied, // user need login
                '4': InsufficientFunds, // insufficient funds
                '5': ExchangeError, // place order failed
                '6': ExchangeError, // volume below the minimum limitation
                '7': ExchangeError, // volume above the maximum limitation
                '8': InvalidOrder, // order cancellation failure
                '9': BadRequest, // trading not allowed
                '11': BadRequest, // sms code invalid or expired
                '12': BadSymbol, // unknown symbol
                '14': BadRequest, // invalid verification code
                '19': InsufficientFunds, // insufficient balance
                '21': BadRequest, // google verification code invalid or expired
                '22': OrderNotFound, // order dont exist
                '25': InvalidOrder, // price or volume excedes limitation
                '26': BadRequest, // user not exist
                '28': BadRequest, // email verification code invalid or expired
                '31': BadRequest, // price or amount below the minimum limitation
                '32': BadRequest, // price above limit up-price
                '33': BadRequest, // volume above the maximum limitation
                '34': RateLimitExceeded, // exceed placing order frequency limitation
                '10069': BadRequest, // market order not allowed
                '100100': BadRequest, // invalid user or password
                '100004': BadRequest, // request parameter illegal
                '100005': BadRequest, // request sign invalid
                '100101': AccountSuspended, // user locked for 2 hours
                '100102': AccountSuspended, // user account locked
                '101115': BadRequest, // user total trade volume exceeds the maximum volume limitation per day
                '101117': BadRequest, // market order not allowed
                '101999': BadRequest, // symbol is not open
                '110002': BadSymbol, // unknown coin symbol
            },
            'fees': {
                'trading': {
                    'maker': 0.09,
                    'taker': 0.12,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        // {
        //     "symbol": "ethbtc",
        //     "count_coin": "btc",
        //     "amount_precision": 3,
        //     "base_coin": "eth",
        //     "price_precision": 8
        //     },
        const method = 'publicGetCommonSymbols';
        const response = await this[method] (params);
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const baseId = this.safeString (market, 'base_coin');
            const quoteId = this.safeString (market, 'count_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const id = base + quote;
            const symbol = base + '/' + quote;
            result.push ({
                'id': id.toLowerCase (),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': {
                    'amount': this.safeInteger (market, 'amount_precision'),
                    'price': this.safeInteger (market, 'price_precision'),
                },
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
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        // {
        //     "symbol": "btcusdt",
        //     "count_coin": "USDT",
        //     "amount_precision": 6,
        //     "base_coin": "BTC",
        //     "price_precision": 4
        // },
        const response = await this.publicGetCommonSymbols (params);
        const data = this.safeValue (response, 'data', {});
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const name = this.safeString (entry, 'base_coin');
            const currencyId = this.safeString (entry, 'base_coin');
            const precision = this.safeInteger (entry, 'price_precision');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': entry,
                'type': undefined,
                'name': name,
                'active': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privateGetAllTrade';
        const request = {
            'symbol': market['symbol'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const query = this.omit (params, 'type');
        const response = await this[method] (this.extend (request, query));
        const data = this.safeValue (response, 'data');
        const results = this.safeValue (data, 'resultList');
        // {
        //     "count":22,
        //   "resultList":[
        //     {
        //         "volume":"1.000",
        //         "side":"BUY",
        //         "feeCoin":"YLB",
        //         "price":"0.10000000",
        //         "fee":"0.16431104",
        //         "ctime":1510996571195,
        //         "deal_price":"0.10000000",
        //         "id":306,
        //         "type":"buy",
        //         "bid_id":1001,
        //         "ask_id":1002,
        //         "bid_user_id":10001,
        //         "ask_user_id":10001
        //     },
        //     ...
        // ]
        // }
        return this.parseOrders (results, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetGetRecords (request);
        return this.parseOHLCVs (response.data, undefined, timeframe, since, limit);
    }

    async fetchTicker (symbol, params = {}) {
        // {
        //     "high": 1,//Maximum value
        //     "vol": 10232.26315789,//Trading volume
        //     "last": 173.60263169,//Latest Transaction Price
        //     "low": 0.01,//Minimum value
        //     "buy": "0.01000000",//Buy one price
        //     "sell": "1.12345680",//Selling price
        //     "rose": -0.44564773,//Ups and downs
        //     "time": 1514448473626
        // }
        await this.loadMarkets ();
        const timestamp = this.milliseconds ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': market['id'],
        }, params);
        const response = await this.publicGetGetTicker (request);
        const ticker = this.safeValue (response, 'data');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'percentage': undefined,
            'change': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetGetAllticker (params);
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'ticker', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const market = this.safeMarket (ticker['symbol']);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': this.safeString (ticker, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.safeString (market, 'id'),
            'type': 'step0',
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetMarketDept (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data.tick, undefined, 'bids', 'asks');
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.options['newOrderTypes'][type];
        const request = {
            'side': side, // BUY or SELL
            'type': orderType,
            // limit: indicates the buying and selling quantity
            // market: indicates the total price (BUY) and the total quantity (SELL)
            'volume': this.amountToPrecision (symbol, amount) + '',
            'price': price ? this.priceToPrecision (symbol, price) + '' : undefined, // Optional if type is market
            'symbol': this.safeString (market, 'symbol'),
        };
        const response = await this.privatePostV2CreateOrder (this.extend (request, params));
        return {
            'id': this.safeValue (response, 'data'),
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'order_id': id,
            'symbol': market['id'],
        });
        const response = await this.privatePostCancelOrder (request);
        return this.safeValue (response, 'data');
    }

    async cancelAllOrders (symbol = undefined) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const response = await this.privatePostCancelOrderAll (request);
        return this.safeString (response, 'data');
    }

    async fetchTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.safeString (market, 'id'),
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = since;
        }
        const response = await this.privateGetV2AllOrder (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        const orderList = this.safeValue (result, 'orderList') || [];
        return this.parseOrders (orderList, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined || id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument and id argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'symbol': market['symbol'],
        };
        const response = await this.privateGetOrderInfo (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        if (!data) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (data);
    }

    parseOrder (order, market = undefined) {
        // Get all orders
        // {
        //     "side":"BUY",
        //   "total_price":"0.10000000",
        //   "created_at":1510993841000,
        //   "avg_price":"0.10000000",
        //   "countCoin":"btc",
        //   "source":1,
        //   "type":1,
        //   "side_msg":"buy",
        //   "volume":"1.000",
        //   "price":"0.10000000",
        //   "source_msg":"WEB",
        //   "status_msg":"fully filled",
        //   "deal_volume":"1.00000000",
        //   "id":424,
        //   "remain_volume":"0.00000000",
        //   "baseCoin":"eth",
        //   "status":2
        // }
        // Get all trading records
        // {
        //     "volume":"1.000",
        //     "side":"BUY",
        //     "feeCoin":"YLB",
        //     "price":"0.10000000",
        //     "fee":"0.16431104",
        //     "ctime":1510996571195,
        //     "deal_price":"0.10000000",
        //     "id":306,
        //     "type":"buy",
        //     "bid_id":1001,
        //     "ask_id":1002,
        //     "bid_user_id":10001,
        //     "ask_user_id":10001
        // }
        const timestamp1 = this.safeString (order, 'ctime');
        const timestamp2 = this.safeString (order, 'created_at');
        const timestamp = timestamp1 || timestamp2;
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.safeString (order, 'status_msg'),
            'symbol': market['symbol'],
            'side': this.safeValue (order, 'side'),
            'type': this.safeString (order, 'type'),
            'price': this.safeFloat (order, 'price'),
            'cost': undefined,
            'amount': this.safeFloat (order, 'volume'),
            'filled': this.safeValue (order, 'deal_volume'),
            'remaining': this.safeValue (order, 'remain_volume'),
            'fee': this.safeValue (order, 'fee'),
            'info': order,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const url2 = '/open/api/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce () + '';
            query['time'] = timestamp;
            query['api_key'] = this.apiKey;
            query = this.urlencode (query);
            const apiKey = this.encode (this.apiKey);
            const queryArray = query.split ('&');
            const sortedQuery = this.sortBy (queryArray, 0).join ('&');
            const auth = method + '\n' + 'openapi.wbf.live' + '\n' + url2 + '\n' + sortedQuery;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            if (method === 'POST') {
                url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
                body = query;
                body['api_key'] = apiKey;
                body['time'] = timestamp;
                body['sign'] = signature;
            } else {
                query = this.urlencode ({
                    'api_key': apiKey,
                    'time': timestamp,
                    'sign': signature,
                });
                if (Object.keys (params).length) {
                    url += '&' + query;
                } else {
                    url += '?' + query;
                }
            }
            headers = {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded',
                'ACCESS-KEY': apiKey,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-SIGN': signature,
            };
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code >= 400) {
            throw new ExchangeError (this.id + ' ' + message + errorCode);
        }
    }
};
