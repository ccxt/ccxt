'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadRequest, InvalidOrder, InsufficientFunds, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class oceanex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oceanex',
            'name': 'oceanex',
            'countries': [ 'US' ],
            'urls': {
                'api': 'https://api.oceanex.pro/v1/',
                'www': 'https://www.oceanex.pro.com',
                'doc': 'https://api.oceanex.pro/doc/v1/',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers/{pair}/',
                        'tickers_multi',
                        'order_book',
                        'order_book/multi',
                        'fees/trading',
                        'trades',
                        'timestamp',
                    ],
                },
                'private': {
                    'get': [
                        'key',
                        'members/me',
                        'orders',
                        'orders/filter',
                    ],
                    'post': [
                        'orders',
                        'orders/multi',
                        'order/delete',
                        'order/delete/multi',
                        'orders/clear',
                    ],
                },
            },
            'version': 'v1',
            'rateLimit': 3000,
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchTradingLimits': false,
                'fetchTradingFees': true,
                'fetchFundingFees': false,
                'fetchTime': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchBalance': true,
                'createMarketOrder': false,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'codes': {
                    '-2': BadRequest,
                    '1001': BadRequest,
                    '1006': AuthenticationError,
                    '1011': PermissionDenied,
                    '2002': InvalidOrder,
                    '2004': OrderNotFound,
                    '9003': PermissionDenied,
                },
                'exact': {
                    'market does not have a valid value': BadRequest,
                    'side does not have a valid value': BadRequest,
                    'Account::AccountError: Cannot lock funds': InsufficientFunds,
                    'The account does not exist': AuthenticationError,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (this.extend ({ 'show_details': true }));
        let result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let id = this.safeValue (market, 'id').toUpperCase ();
            let symbol = this.safeValue (market, 'name');
            let pair = symbol.split ('/');
            let base = this.commonCurrencyCode (pair[0]);
            let quote = this.commonCurrencyCode (pair[1]);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'active': true,
                'info': market,
                'precision': {
                    'amount': this.safeValue (market, 'amount_precision'),
                    'price': this.safeValue (market, 'price_precision'),
                    'base': this.safeValue (market, 'ask_precision'),
                    'quote': this.safeValue (market, 'bid_precision'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeValue (market, 'minimum_trading_amount'),
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
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const response = await this.publicGetTickersPair (this.extend ({ 'pair': market['id'].toLowerCase () }));
        const data = this.safeValue (response, 'data');
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols, params = {}) {
        await this.loadMarkets ();
        let markets = [];
        for (let i = 0; i < symbols.length; i++) {
            let marketId = this.marketId (symbols[i]);
            markets.push (marketId.toLowerCase ());
        }
        const response = await this.publicGetTickersMulti (this.extend ({ 'markets': markets }));
        const data = this.safeValue (response, 'data');
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let ticker = data[i];
            let marketId = this.safeValue (ticker, 'market');
            marketId = marketId.toUpperCase ();
            let market = this.markets_by_id[marketId];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    parseTicker (data, market = undefined) {
        let ticker = this.safeValue (data, 'ticker');
        let timestamp = this.safeInteger (data, 'at');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
            // Get milliseconds
        }
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'].toLowerCase (),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data');
        let timestamp = this.safeInteger (orderbook, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
            // Get milliseconds
        }
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchOrderBooks (symbols, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let markets = [];
        for (let i = 0; i < symbols.length; i++) {
            let marketId = this.marketId (symbols[i]);
            markets.push (marketId.toLowerCase ());
        }
        const response = await this.publicGetOrderBookMulti (this.extend ({
            'markets': markets,
            'limit': limit,
        }));
        const data = this.safeValue (response, 'data');
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let orderbook = data[i];
            let marketId = this.safeValue (orderbook, 'market');
            marketId = marketId.toUpperCase ();
            let market = this.markets_by_id[marketId];
            let symbol = market['symbol'];
            let timestamp = this.safeInteger (orderbook, 'timestamp');
            if (timestamp !== undefined) {
                timestamp = timestamp * 1000;
                // Get milliseconds
            }
            result[symbol] = this.parseOrderBook (orderbook, timestamp);
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'].toLowerCase (),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let side = this.safeValue (trade, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        }
        let symbol = undefined;
        let marketId = this.safeValue (trade, 'market');
        if (marketId !== undefined) {
            marketId = marketId.toUpperCase ();
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = marketId;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = this.safeInteger (trade, 'created_on');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        } else {
            timestamp = timestamp * 1000;
            // Get milliseconds
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp ();
        const data = this.safeValue (response, 'data');
        return data;
    }

    async fetchTradingFees (params = {}) {
        const response = await this.publicGetFeesTrading ();
        const data = this.safeValue (response, 'data');
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let group = data[i];
            let maker = this.safeValue (group, 'ask_fee');
            let taker = this.safeValue (group, 'bid_fee');
            result.push ({
                'info': group,
                'maker': this.safeFloat (maker, 'value'),
                'taker': this.safeFloat (taker, 'value'),
            });
        }
        return result;
    }

    async fetchKey (params = {}) {
        const response = await this.privateGetKey (this.extend (params));
        const data = this.safeValue (response, 'data');
        return data;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (this.extend (params));
        const balances = this.safeValue (this.safeValue (response, 'data'), 'accounts');
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let currency = this.commonCurrencyCode (this.safeValue (balance, 'currency'));
            let account = this.account ();
            let free = this.safeFloat (balance, 'balance');
            let used = this.safeFloat (balance, 'locked');
            let total = this.sum (free, used);
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' only support limit order!');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'].toLowerCase (),
            'side': side,
            'ord_type': type,
            'volume': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'ids': [id] };
        const response = await this.privateGetOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        if (data === undefined || data.length === 0) {
            throw new OrderNotFound (this.id + ' could not found matching order');
        }
        return this.parseOrder (data[0], market);
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeValue (order, 'state'));
        let marketId = this.safeValue (order, 'market');
        let symbol = undefined;
        if (marketId !== undefined) {
            marketId = marketId.toUpperCase ();
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = marketId;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['id'];
            }
        }
        let timestamp = this.safeInteger (order, 'created_on');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        } else {
            timestamp = timestamp * 1000;
            // Get milliseconds
        }
        let result = {
            'info': order,
            'id': this.safeValue (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeValue (order, 'ord_type'),
            'side': this.safeValue (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'volume'),
            'remaining': this.safeFloat (order, 'remaining_volume'),
            'filled': this.safeFloat (order, 'executed_volume'),
            'status': status,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
        return result;
    }

    parseOrderStatus (status) {
        let statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    async createOrders (params = {}) {
        const response = await this.privatePostOrdersMulti (this.extend (params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    async filterOrders (symbol, statuses = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'].toLowerCase (),
            'states': this.parseStatusToStates (statuses),
            'limit': limit,
        };
        const response = await this.privateGetOrdersFilter (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        //  [
        //     {
        //       "num_of_orders": 0,
        //       "state": "cancel",
        //       "orders": []
        //     },
        //     {
        //       "state": "done",
        //       "num_of_orders": 2,
        //       "orders": [
        //             {
        //               "created_at": "2018-09-28T12:40:51.000Z",
        //               "trades_count": 1,
        //               "remaining_volume": "0.0",
        //               "market_id": "veteth",
        //               "price": "1000",
        //               "created_on": "1538138451",
        //               "side": "buy",
        //               "volume": "0.5",
        //               "state": "done",
        //               "ord_type": "limit",
        //               "market_name": "VET/ETH",
        //               "avg_price": "11.0",
        //               "executed_volume": "0.5",
        //               "market_display_name": "VET/ETH",
        //               "id": 50
        //             },
        //         ]
        //     }
        //  ]
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let group = data[i];
            result.push ({
                'num_of_orders': this.safeValue (group, 'num_of_orders'),
                'state': this.parseOrderStatus (this.safeValue (group, 'state')),
                'orders': this.parseOrders (this.safeValue (group, 'orders')),
            });
        }
        return result;
    }

    parseStatusToStates (statuses) {
        if (statuses === undefined || statuses.length === 0) {
            return [];
        }
        let statusParser = {
            'open': 'wait',
            'closed': 'done',
            'canceled': 'cancel',
        };
        let result = [];
        for (let i = 0; i < statuses.length; i++) {
            let status = (statuses[i] in statusParser) ? statusParser[statuses[i]] : 'open';
            result.push (status);
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const response = await this.privatePostOrderDelete (this.extend ({ 'id': id }, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        const response = await this.privatePostOrderDeleteMulti (this.extend ({ 'ids': ids }, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const response = await this.privatePostOrdersClear (this.extend (params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (path === 'tickers_multi' || path === 'order_book/multi') {
                let request = '?';
                let markets = this.safeValue (params, 'markets');
                for (let i = 0; i < markets.length; i++) {
                    request += 'markets[]=' + markets[i] + '&';
                }
                let limit = this.safeValue (params, 'limit');
                if (limit !== undefined) {
                    request += 'limit=' + limit;
                }
                url += request;
            } else if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const request = {
                'uid': this.uid,
                'data': query,
            };
            const jwt_token = this.jwt (request, this.apiKey, 'RS256');
            // set apiKey: ocean.apiKey = fs.readFileSync('key.pem', 'utf8');
            url += '?user_jwt=' + jwt_token;
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        // API response structure
        // HTTP code : 200 (success to send request to API) / 201 (success to create order)
        // {"code": , (success return 0. other code indicate error)
        //  "message": "", (if error, contain error message report as string type)
        //  "data": []}
        if (response === undefined) {
            return;
        }
        if (code === 200 || code === 201) {
            const resCode = this.safeValue (response, 'code');
            if (resCode === undefined) {
                throw new ExchangeError (response);
            }
            const message = this.safeValue (response, 'message');
            if (resCode !== 0) {
                const error = JSON.parse (message);
                const errorCode = this.safeValue (error, 'code');
                const errorMsg = this.safeValue (error, 'message');
                const feedback = this.id + ' ' + this.json (response);
                const codes = this.exceptions['codes'];
                const exact = this.exceptions['exact'];
                if (resCode in codes) {
                    throw new codes[resCode] (feedback);
                }
                if (errorCode in codes) {
                    throw new codes[errorCode] (feedback);
                }
                if (errorMsg in exact) {
                    throw new exact[errorMsg] (feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
