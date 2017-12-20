# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound


class qryptos (Exchange):

    def describe(self):
        return self.deep_extend(super(qryptos, self).describe(), {
            'id': 'qryptos',
            'name': 'QRYPTOS',
            'countries': ['CN', 'TW'],
            'version': '2',
            'rateLimit': 1000,
            'hasFetchTickers': True,
            'hasCORS': False,
            'has': {
                'fetchOrder': True,
                'fetchOrders': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg',
                'api': 'https://api.qryptos.com',
                'www': 'https://www.qryptos.com',
                'doc': 'https://developers.quoine.com',
            },
            'api': {
                'public': {
                    'get': [
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                    ],
                    'post': [
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                    ],
                    'put': [
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}',
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                    ],
                },
            },
        })

    def fetch_markets(self):
        markets = self.publicGetProducts()
        result = []
        for p in range(0, len(markets)):
            market = markets[p]
            id = market['id']
            base = market['base_currency']
            quote = market['quoted_currency']
            symbol = base + '/' + quote
            maker = float(market['maker_fee'])
            taker = float(market['taker_fee'])
            active = not market['disabled']
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'maker': maker,
                'taker': taker,
                'active': active,
                'info': market,
            })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        balances = self.privateGetAccountsBalance()
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = balance['currency']
            total = float(balance['balance'])
            account = {
                'free': total,
                'used': 0.0,
                'total': total,
            }
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        orderbook = self.publicGetProductsIdPriceLevels(self.extend({
            'id': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook, None, 'buy_price_levels', 'sell_price_levels')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        last = None
        if 'last_traded_price' in ticker:
            if ticker['last_traded_price']:
                length = len(ticker['last_traded_price'])
                if length > 0:
                    last = float(ticker['last_traded_price'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high_market_ask']),
            'low': float(ticker['low_market_bid']),
            'bid': float(ticker['market_bid']),
            'ask': float(ticker['market_ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': last,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['volume_24h']),
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        tickers = self.publicGetProducts(params)
        result = {}
        for t in range(0, len(tickers)):
            ticker = tickers[t]
            base = ticker['base_currency']
            quote = ticker['quoted_currency']
            symbol = base + '/' + quote
            market = self.markets[symbol]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        ticker = self.publicGetProductsId(self.extend({
            'id': market['id'],
        }, params))
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market):
        timestamp = trade['created_at'] * 1000
        return {
            'info': trade,
            'id': str(trade['id']),
            'order': None,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['taker_side'],
            'price': float(trade['price']),
            'amount': float(trade['quantity']),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'product_id': market['id'],
        }
        if limit:
            request['limit'] = limit
        response = self.publicGetExecutions(self.extend(request, params))
        return self.parse_trades(response['models'], market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        order = {
            'order_type': type,
            'product_id': self.market_id(symbol),
            'side': side,
            'quantity': amount,
        }
        if type == 'limit':
            order['price'] = price
        response = self.privatePostOrders(self.extend({
            'order': order,
        }, params))
        return self.parse_order(response)

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        result = self.privatePutOrdersIdCancel(self.extend({
            'id': id,
        }, params))
        order = self.parse_order(result)
        if order['status'] == 'closed':
            raise OrderNotFound(self.id + ' ' + self.json(order))
        return order

    def parse_order(self, order):
        timestamp = order['created_at'] * 1000
        marketId = order['product_id']
        market = self.marketsById[marketId]
        status = None
        if 'status' in order:
            if order['status'] == 'live':
                status = 'open'
            elif order['status'] == 'filled':
                status = 'closed'
            elif order['status'] == 'cancelled':  # 'll' intended
                status = 'canceled'
        amount = float(order['quantity'])
        filled = float(order['filled_quantity'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'type': order['order_type'],
            'status': status,
            'symbol': symbol,
            'side': order['side'],
            'price': order['price'],
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'trades': None,
            'fee': {
                'currency': None,
                'cost': float(order['order_fee']),
            },
            'info': order,
        }

    def fetch_order(self, id, symbol=None, params={}):
        self.load_markets()
        order = self.privateGetOrdersId(self.extend({
            'id': id,
        }, params))
        return self.parse_order(order)

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = None
        request = {}
        if symbol:
            market = self.market(symbol)
            request['product_id'] = market['id']
        status = params['status']
        if status == 'open':
            request['status'] = 'live'
        elif status == 'closed':
            request['status'] = 'filled'
        elif status == 'canceled':
            request['status'] = 'cancelled'
        result = self.privateGetOrders(request)
        orders = result['models']
        return self.parse_orders(orders, market, since, limit)

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        return self.fetch_orders(symbol, since, limit, self.extend({'status': 'open'}, params))

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        return self.fetch_orders(symbol, since, limit, self.extend({'status': 'closed'}, params))

    def handle_errors(self, code, reason, url, method, headers, body):
        response = None
        if code == 200 or code == 404 or code == 422:
            if (body[0] == '{') or (body[0] == '['):
                response = json.loads(body)
            else:
                # if not a JSON response
                raise ExchangeError(self.id + ' returned a non-JSON reply: ' + body)
        if code == 404:
            if 'message' in response:
                if response['message'] == 'Order not found':
                    raise OrderNotFound(self.id + ' ' + body)
        elif code == 422:
            if 'errors' in response:
                errors = response['errors']
                if 'user' in errors:
                    messages = errors['user']
                    if messages.find('not_enough_free_balance') >= 0:
                        raise InsufficientFunds(self.id + ' ' + body)
                elif 'quantity' in errors:
                    messages = errors['quantity']
                    if messages.find('less_than_order_size') >= 0:
                        raise InvalidOrder(self.id + ' ' + body)

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        headers = {
            'X-Quoine-API-Version': self.version,
            'Content-Type': 'application/json',
        }
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            if method == 'GET':
                if query:
                    url += '?' + self.urlencode(query)
            elif query:
                body = self.json(query)
            nonce = self.nonce()
            request = {
                'path': url,
                'nonce': nonce,
                'token_id': self.apiKey,
                'iat': int(math.floor(nonce / 1000)),  # issued at
            }
            headers['X-Quoine-Auth'] = self.jwt(request, self.secret)
        url = self.urls['api'] + url
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
