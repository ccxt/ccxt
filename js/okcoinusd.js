"use strict"

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class okcoinusd extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoinusd',
            'name': 'OKCoin USD',
            'countries': [ 'CN', 'US' ],
            'hasCORS': false,
            'version': 'v1',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'hasFetchOHLCV': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'extension': '.do', // appended to endpoint URL
            'hasFutureMarkets': false,
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'api': {
                'web': {
                    'get': [
                        'markets/currencies',
                        'markets/products',
                    ],
                },
                'public': {
                    'get': [
                        'depth',
                        'exchange_rate',
                        'future_depth',
                        'future_estimated_price',
                        'future_hold_amount',
                        'future_index',
                        'future_kline',
                        'future_price_limit',
                        'future_ticker',
                        'future_trades',
                        'kline',
                        'otcs',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'account_records',
                        'batch_trade',
                        'borrow_money',
                        'borrow_order_info',
                        'borrows_info',
                        'cancel_borrow',
                        'cancel_order',
                        'cancel_otc_order',
                        'cancel_withdraw',
                        'future_batch_trade',
                        'future_cancel',
                        'future_devolve',
                        'future_explosive',
                        'future_order_info',
                        'future_orders_info',
                        'future_position',
                        'future_position_4fix',
                        'future_trade',
                        'future_trades_history',
                        'future_userinfo',
                        'future_userinfo_4fix',
                        'lend_depth',
                        'order_fee',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'otc_order_history',
                        'otc_order_info',
                        'repayment',
                        'submit_otc_order',
                        'trade',
                        'trade_history',
                        'trade_otc_order',
                        'withdraw',
                        'withdraw_info',
                        'unrepayments_info',
                        'userinfo',
                    ],
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': {
                    'web': 'https://www.okcoin.com/v2',
                    'public': 'https://www.okcoin.com/api',
                    'private': 'https://www.okcoin.com/api',
                },
                'www': 'https://www.okcoin.com',
                'doc': [
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ],
            },
        });
    }

    async fetchMarkets () {
        let response = await this.webGetMarketsProducts ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let id = markets[i]['symbol'];
            let uppercase = id.toUpperCase ();
            let [ base, quote ] = uppercase.split ('_');
            let symbol = base + '/' + quote;
            let precision = {
                'amount': markets[i]['maxSizeDigit'],
                'price': markets[i]['maxPriceDigit'],
            };
            let lot = Math.pow (10, -precision['amount']);
            let market = this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': markets[i],
                'type': 'spot',
                'spot': true,
                'future': false,
                'lot': lot,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': markets[i]['minTradeSize'],
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
            result.push (market);
            if ((this.hasFutureMarkets) && (market['quote'] == 'USDT')) {
                result.push (this.extend (market, {
                    'quote': 'USD',
                    'symbol': market['base'] + '/USD',
                    'id': market['id'].replace ('usdt', 'usd'),
                    'type': 'future',
                    'spot': false,
                    'future': true,
                }));
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Depth';
        let orderbook = await this[method] (this.extend (request, params));
        let timestamp = this.milliseconds ();
        return {
            'bids': orderbook['bids'],
            'asks': this.sortBy (orderbook['asks'], 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Ticker';
        let response = await this[method] (this.extend (request, params));
        let timestamp = parseInt (response['date']) * 1000;
        let ticker = this.extend (response['ticker'], { 'timestamp': timestamp });
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'info': trade,
            'timestamp': trade['date_ms'],
            'datetime': this.iso8601 (trade['date_ms']),
            'symbol': symbol,
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Trades';
        let response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1440, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Kline';
        if (limit)
            request['size'] = parseInt (limit);
        if (since) {
            request['since'] = since;
        } else {
            request['since'] = this.milliseconds () - 86400000; // last 24 hours
        }
        let response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserinfo ();
        let balances = response['info']['funds'];
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            account['free'] = this.safeFloat (balances['free'], lowercase, 0.0);
            account['used'] = this.safeFloat (balances['freezed'], lowercase, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let order = {
            'symbol': market['id'],
            'type': side,
        };
        if (market['future']) {
            method += 'Future';
            order = this.extend (order, {
                'contract_type': 'this_week', // next_week, quarter
                'match_price': 0, // match best counter party price? 0 or 1, ignores price if 1
                'lever_rate': 10, // leverage rate value: 10 or 20 (10 by default)
                'price': price,
                'amount': amount,
            });
        } else {
            if (type == 'limit') {
                order['price'] = price;
                order['amount'] = amount;
            } else {
                order['type'] += '_market';
                if (side == 'buy') {
                    order['price'] = this.safeFloat (params, 'cost');
                    if (!order['price'])
                        throw new ExchangeError (this.id + ' market buy orders require an additional cost parameter, cost = price * amount');
                } else {
                    order['amount'] = amount;
                }
            }
        }
        params = this.omit (params, 'cost');
        method += 'Trade';
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder() requires a symbol argument');
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'order_id': id,
        };
        let method = 'privatePost';
        if (market['future']) {
            method += 'FutureCancel';
            request['contract_type'] = 'this_week'; // next_week, quarter
        } else {
            method += 'CancelOrder';
        }
        let response = await this[method] (this.extend (request, params));
        return response;
    }

    parseOrderStatus (status) {
        if (status == -1)
            return 'canceled';
        if (status == 0)
            return 'open';
        if (status == 1)
            return 'partial';
        if (status == 2)
            return 'closed';
        if (status == 4)
            return 'canceled';
        return status;
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        let type = undefined;
        if ('type' in order) {
            if ((order['type'] == 'buy') || (order['type'] == 'sell')) {
                side = order['type'];
                type = 'limit';
            } else {
                side = (order['type'] == 'buy_market') ? 'buy' : 'sell';
                type = 'market';
            }
        }
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (!market) {
            if ('symbol' in order)
                if (order['symbol'] in this.markets_by_id)
                    market = this.markets_by_id[order['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        if ('create_date' in order)
            timestamp = order['create_date'];
        let amount = order['amount'];
        let filled = order['deal_amount'];
        let remaining = amount - filled;
        let average = order['avg_price'];
        let cost = average * filled;
        let result = {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': order['price'],
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + 'fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'order_id': id,
            'symbol': market['id'],
            // 'status': 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page': 1, // current page number
            // 'page_length': 200, // number of orders returned per page, maximum 200
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'OrderInfo';
        let response = await this[method] (this.extend (request, params));
        return this.parseOrder (response['orders'][0]);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + 'fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'symbol': market['id'],
        };
        let order_id_in_params = ('order_id' in params);
        if (market['future']) {
            method += 'FutureOrdersInfo';
            request['contract_type'] = 'this_week'; // next_week, quarter
            if (!order_id_in_params)
                throw new ExchangeError (this.id + ' fetchOrders() requires order_id param for futures market ' + symbol + ' (a string of one or more order ids, comma-separated)');
        } else {
            let status = undefined;
            if ('type' in params) {
                status = params['type'];
            } else if ('status' in params) {
                status = params['status'];
            } else {
                throw new ExchangeError (this.id + ' fetchOrders() requires type param or status param for spot market ' + symbol + ' (0 or "open" for unfilled orders, 1 or "closed" for filled orders)');
            }
            if (status == 'open')
                status = 0;
            if (status == 'closed')
                status = 1;
            if (order_id_in_params) {
                method += 'OrdersInfo';
                request = this.extend (request, {
                    'type': status,
                });
            } else {
                method += 'OrderHistory';
                request = this.extend (request, {
                    'status': status,
                    'current_page': 1, // current page number
                    'page_length': 200, // number of orders returned per page, maximum 200
                });
            }
            params = this.omit (params, [ 'type', 'status' ]);
        }
        let response = await this[method] (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let open = 0; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, undefined, undefined, this.extend ({
            'status': open,
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let closed = 1; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, undefined, undefined, this.extend ({
            'status': closed,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api != 'web')
            url += this.version + '/';
        url += path + this.extension;
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            // secret key must be at the end of query
            let queryString = this.rawencode (query) + '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString)).toUpperCase ();
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response)
            if (!response['result'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        if ('error_code' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
