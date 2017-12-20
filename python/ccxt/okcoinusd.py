# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import math
from ccxt.base.errors import ExchangeError


class okcoinusd (Exchange):

    def describe(self):
        return self.deep_extend(super(okcoinusd, self).describe(), {
            'id': 'okcoinusd',
            'name': 'OKCoin USD',
            'countries': ['CN', 'US'],
            'hasCORS': False,
            'version': 'v1',
            'rateLimit': 1000,  # up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            # obsolete metainfo interface
            'hasFetchOHLCV': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasWithdraw': True,
            # new metainfo interface
            'has': {
                'fetchOHLCV': True,
                'fetchOrder': True,
                'fetchOrders': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'withdraw': True,
            },
            'extension': '.do',  # appended to endpoint URL
            'hasFutureMarkets': False,
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
        })

    def fetch_markets(self):
        response = self.webGetMarketsProducts()
        markets = response['data']
        result = []
        for i in range(0, len(markets)):
            id = markets[i]['symbol']
            uppercase = id.upper()
            base, quote = uppercase.split('_')
            symbol = base + '/' + quote
            precision = {
                'amount': markets[i]['maxSizeDigit'],
                'price': markets[i]['maxPriceDigit'],
            }
            lot = math.pow(10, -precision['amount'])
            market = self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': markets[i],
                'type': 'spot',
                'spot': True,
                'future': False,
                'lot': lot,
                'active': True,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': markets[i]['minTradeSize'],
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                },
            })
            result.append(market)
            if (self.hasFutureMarkets) and(market['quote'] == 'USDT'):
                result.append(self.extend(market, {
                    'quote': 'USD',
                    'symbol': market['base'] + '/USD',
                    'id': market['id'].replace('usdt', 'usd'),
                    'type': 'future',
                    'spot': False,
                    'future': True,
                }))
        return result

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        method = 'publicGet'
        request = {
            'symbol': market['id'],
        }
        if market['future']:
            method += 'Future'
            request['contract_type'] = 'this_week'  # next_week, quarter
        method += 'Depth'
        orderbook = getattr(self, method)(self.extend(request, params))
        timestamp = self.milliseconds()
        return {
            'bids': orderbook['bids'],
            'asks': self.sort_by(orderbook['asks'], 0),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
        }

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['timestamp']
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['buy']),
            'ask': float(ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['vol']),
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        method = 'publicGet'
        request = {
            'symbol': market['id'],
        }
        if market['future']:
            method += 'Future'
            request['contract_type'] = 'this_week'  # next_week, quarter
        method += 'Ticker'
        response = getattr(self, method)(self.extend(request, params))
        timestamp = int(response['date']) * 1000
        ticker = self.extend(response['ticker'], {'timestamp': timestamp})
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'info': trade,
            'timestamp': trade['date_ms'],
            'datetime': self.iso8601(trade['date_ms']),
            'symbol': symbol,
            'id': str(trade['tid']),
            'order': None,
            'type': None,
            'side': trade['type'],
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        method = 'publicGet'
        request = {
            'symbol': market['id'],
        }
        if market['future']:
            method += 'Future'
            request['contract_type'] = 'this_week'  # next_week, quarter
        method += 'Trades'
        response = getattr(self, method)(self.extend(request, params))
        return self.parse_trades(response, market, since, limit)

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=1440, params={}):
        self.load_markets()
        market = self.market(symbol)
        method = 'publicGet'
        request = {
            'symbol': market['id'],
            'type': self.timeframes[timeframe],
        }
        if market['future']:
            method += 'Future'
            request['contract_type'] = 'this_week'  # next_week, quarter
        method += 'Kline'
        if limit:
            request['size'] = int(limit)
        if since:
            request['since'] = since
        else:
            request['since'] = self.milliseconds() - 86400000  # last 24 hours
        response = getattr(self, method)(self.extend(request, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privatePostUserinfo()
        balances = response['info']['funds']
        result = {'info': response}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            lowercase = currency.lower()
            account = self.account()
            account['free'] = self.safe_float(balances['free'], lowercase, 0.0)
            account['used'] = self.safe_float(balances['freezed'], lowercase, 0.0)
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        method = 'privatePost'
        order = {
            'symbol': market['id'],
            'type': side,
        }
        if market['future']:
            method += 'Future'
            order = self.extend(order, {
                'contract_type': 'this_week',  # next_week, quarter
                'match_price': 0,  # match best counter party price? 0 or 1, ignores price if 1
                'lever_rate': 10,  # leverage rate value: 10 or 20(10 by default)
                'price': price,
                'amount': amount,
            })
        else:
            if type == 'limit':
                order['price'] = price
                order['amount'] = amount
            else:
                order['type'] += '_market'
                if side == 'buy':
                    order['price'] = self.safe_float(params, 'cost')
                    if not order['price']:
                        raise ExchangeError(self.id + ' market buy orders require an additional cost parameter, cost = price * amount')
                else:
                    order['amount'] = amount
        params = self.omit(params, 'cost')
        method += 'Trade'
        response = getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['order_id']),
        }

    def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder() requires a symbol argument')
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'order_id': id,
        }
        method = 'privatePost'
        if market['future']:
            method += 'FutureCancel'
            request['contract_type'] = 'this_week'  # next_week, quarter
        else:
            method += 'CancelOrder'
        response = getattr(self, method)(self.extend(request, params))
        return response

    def parse_order_status(self, status):
        if status == -1:
            return 'canceled'
        if status == 0:
            return 'open'
        if status == 1:
            return 'partial'
        if status == 2:
            return 'closed'
        if status == 4:
            return 'canceled'
        return status

    def parse_order(self, order, market=None):
        side = None
        type = None
        if 'type' in order:
            if (order['type'] == 'buy') or (order['type'] == 'sell'):
                side = order['type']
                type = 'limit'
            else:
                side = 'buy' if (order['type'] == 'buy_market') else 'sell'
                type = 'market'
        status = self.parse_order_status(order['status'])
        symbol = None
        if not market:
            if 'symbol' in order:
                if order['symbol'] in self.markets_by_id:
                    market = self.markets_by_id[order['symbol']]
        if market:
            symbol = market['symbol']
        timestamp = None
        createDateField = self.get_create_date_field()
        if createDateField in order:
            timestamp = order[createDateField]
        amount = order['amount']
        filled = order['deal_amount']
        remaining = amount - filled
        average = order['avg_price']
        cost = average * filled
        result = {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
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
            'fee': None,
        }
        return result

    def get_create_date_field(self):
        # needed for derived exchanges
        # allcoin typo create_data instead of create_date
        return 'create_date'

    def get_orders_field(self):
        # needed for derived exchanges
        # allcoin typo order instead of orders(expected based on their API docs)
        return 'orders'

    def fetch_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + 'fetchOrders requires a symbol parameter')
        self.load_markets()
        market = self.market(symbol)
        method = 'privatePost'
        request = {
            'order_id': id,
            'symbol': market['id'],
            # 'status': 0,  # 0 for unfilled orders, 1 for filled orders
            # 'current_page': 1,  # current page number
            # 'page_length': 200,  # number of orders returned per page, maximum 200
        }
        if market['future']:
            method += 'Future'
            request['contract_type'] = 'this_week'  # next_week, quarter
        method += 'OrderInfo'
        response = getattr(self, method)(self.extend(request, params))
        ordersField = self.get_orders_field()
        return self.parse_order(response[ordersField][0])

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + 'fetchOrders requires a symbol parameter')
        self.load_markets()
        market = self.market(symbol)
        method = 'privatePost'
        request = {
            'symbol': market['id'],
        }
        order_id_in_params = ('order_id' in list(params.keys()))
        if market['future']:
            method += 'FutureOrdersInfo'
            request['contract_type'] = 'this_week'  # next_week, quarter
            if not order_id_in_params:
                raise ExchangeError(self.id + ' fetchOrders() requires order_id param for futures market ' + symbol + '(a string of one or more order ids, comma-separated)')
        else:
            status = None
            if 'type' in params:
                status = params['type']
            elif 'status' in params:
                status = params['status']
            else:
                raise ExchangeError(self.id + ' fetchOrders() requires type param or status param for spot market ' + symbol + '(0 or "open" for unfilled orders, 1 or "closed" for filled orders)')
            if status == 'open':
                status = 0
            if status == 'closed':
                status = 1
            if order_id_in_params:
                method += 'OrdersInfo'
                request = self.extend(request, {
                    'type': status,
                })
            else:
                method += 'OrderHistory'
                request = self.extend(request, {
                    'status': status,
                    'current_page': 1,  # current page number
                    'page_length': 200,  # number of orders returned per page, maximum 200
                })
            params = self.omit(params, ['type', 'status'])
        response = getattr(self, method)(self.extend(request, params))
        ordersField = self.get_orders_field()
        return self.parse_orders(response[ordersField], market, since, limit)

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        open = 0  # 0 for unfilled orders, 1 for filled orders
        return self.fetch_orders(symbol, None, None, self.extend({
            'status': open,
        }, params))

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        closed = 1  # 0 for unfilled orders, 1 for filled orders
        return self.fetch_orders(symbol, None, None, self.extend({
            'status': closed,
        }, params))

    def withdraw(self, currency, amount, address, params={}):
        self.load_markets()
        lowercase = currency.lower() + '_usd'
        # if amount < 0.01:
        #     raise ExchangeError(self.id + ' withdraw() requires amount > 0.01')
        request = {
            'symbol': lowercase,
            'withdraw_address': address,
            'withdraw_amount': amount,
            'target': 'address',  # or okcn, okcom, okex
        }
        query = params
        if 'chargefee' in query:
            request['chargefee'] = query['chargefee']
            query = self.omit(query, 'chargefee')
        else:
            raise ExchangeError(self.id + ' withdraw() requires a `chargefee` parameter')
        password = None
        if self.password:
            request['trade_pwd'] = self.password
            password = self.password
        elif 'password' in query:
            request['trade_pwd'] = query['password']
            query = self.omit(query, 'password')
        elif 'trade_pwd' in query:
            request['trade_pwd'] = query['trade_pwd']
            query = self.omit(query, 'trade_pwd')
        if not password:
            raise ExchangeError(self.id + ' withdraw() requires self.password set on the exchange instance or a password / trade_pwd parameter')
        response = self.privatePostWithdraw(self.extend(request, query))
        return {
            'info': response,
            'id': self.safe_string(response, 'withdraw_id'),
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/'
        if api != 'web':
            url += self.version + '/'
        url += path + self.extension
        if api == 'private':
            self.check_required_credentials()
            query = self.keysort(self.extend({
                'api_key': self.apiKey,
            }, params))
            # secret key must be at the end of query
            queryString = self.rawencode(query) + '&secret_key=' + self.secret
            query['sign'] = self.hash(self.encode(queryString)).upper()
            body = self.urlencode(query)
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        else:
            if params:
                url += '?' + self.urlencode(params)
        url = self.urls['api'][api] + url
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'result' in response:
            if not response['result']:
                raise ExchangeError(self.id + ' ' + self.json(response))
        if 'error_code' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
