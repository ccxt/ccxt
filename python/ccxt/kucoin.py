# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import base64
import hashlib
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import InvalidNonce


class kucoin (Exchange):

    def describe(self):
        return self.deep_extend(super(kucoin, self).describe(), {
            'id': 'kucoin',
            'name': 'Kucoin',
            'countries': 'HK',  # Hong Kong
            'version': 'v1',
            'rateLimit': 2000,
            'hasCORS': False,
            'userAgent': self.userAgents['chrome'],
            # obsolete metainfo interface
            'hasFetchTickers': True,
            'hasFetchOHLCV': False,  # see the method implementation below
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchMyTrades': False,
            'hasFetchCurrencies': True,
            'hasWithdraw': True,
            # new metainfo interface
            'has': {
                'fetchTickers': True,
                'fetchOHLCV': True,  # see the method implementation below
                'fetchOrder': True,
                'fetchOrders': True,
                'fetchClosedOrders': True,
                'fetchOpenOrders': True,
                'fetchMyTrades': False,
                'fetchCurrencies': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '8h': '480',
                '1d': 'D',
                '1w': 'W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg',
                'api': 'https://api.kucoin.com',
                'www': 'https://kucoin.com',
                'doc': 'https://kucoinapidocs.docs.apiary.io',
                'fees': 'https://news.kucoin.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'open/chart/config',
                        'open/chart/history',
                        'open/chart/symbol',
                        'open/currencies',
                        'open/deal-orders',
                        'open/kline',
                        'open/lang-list',
                        'open/orders',
                        'open/orders-buy',
                        'open/orders-sell',
                        'open/tick',
                        'market/open/coin-info',
                        'market/open/coins',
                        'market/open/coins-trending',
                        'market/open/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{coin}/wallet/address',
                        'account/{coin}/wallet/records',
                        'account/{coin}/balance',
                        'account/promotion/info',
                        'account/promotion/sum',
                        'deal-orders',
                        'order/active',
                        'order/active-map',
                        'order/dealt',
                        'referrer/descendant/count',
                        'user/info',
                    ],
                    'post': [
                        'account/{coin}/withdraw/apply',
                        'account/{coin}/withdraw/cancel',
                        'cancel-order',
                        'order',
                        'user/change-lang',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0010,
                    'taker': 0.0010,
                },
            },
        })

    def fetch_markets(self):
        response = self.publicGetMarketOpenSymbols()
        markets = response['data']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['symbol']
            base = market['coinType']
            quote = market['coinTypePair']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            active = market['trading']
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
                'lot': math.pow(10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': math.pow(10, -precision['amount']),
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                },
            }))
        return result

    def fetch_currencies(self, params={}):
        response = self.publicGetMarketOpenCoins(params)
        currencies = response['data']
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['coin']
            # todo: will need to rethink the fees
            # to add support for multiple withdrawal/deposit methods and
            # differentiated fees for each particular method
            code = self.common_currency_code(id)
            precision = currency['tradePrecision']
            deposit = currency['enableDeposit']
            withdraw = currency['enableWithdraw']
            active = (deposit and withdraw)
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': currency['withdrawFeeRate'],  # todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': math.pow(10, -precision),
                        'max': math.pow(10, precision),
                    },
                    'price': {
                        'min': math.pow(10, -precision),
                        'max': math.pow(10, precision),
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmount'],
                        'max': math.pow(10, precision),
                    },
                },
            }
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privateGetAccountBalance(self.extend({
            'limit': 20,  # default 12, max 20
            'page': 1,
        }, params))
        balances = response['data']
        result = {'info': balances}
        indexed = self.index_by(balances, 'coinType')
        keys = list(indexed.keys())
        for i in range(0, len(keys)):
            id = keys[i]
            currency = self.common_currency_code(id)
            account = self.account()
            balance = indexed[id]
            total = float(balance['balance'])
            used = float(balance['freezeBalance'])
            free = total - used
            account['free'] = free
            account['used'] = used
            account['total'] = total
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetOpenOrders(self.extend({
            'symbol': market['id'],
        }, params))
        orderbook = response['data']
        return self.parse_order_book(orderbook, None, 'BUY', 'SELL')

    def parse_order(self, order, market=None):
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            symbol = order['coinType'] + '/' + order['coinTypePair']
        timestamp = order['createdAt']
        price = self.safe_float(order, 'price')
        amount = self.safe_float(order, 'amount')
        filled = self.safe_float(order, 'dealAmount')
        remaining = self.safe_float(order, 'pendingAmount')
        side = order['type'].lower()
        result = {
            'info': order,
            'id': self.safe_string(order, 'oid'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * filled,
            'filled': filled,
            'remaining': remaining,
            'status': None,
            'fee': self.safe_float(order, 'fee'),
        }
        return result

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol param')
        self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
        }
        response = self.privateGetOrderActiveMap(self.extend(request, params))
        orders = self.array_concat(response['data']['SELL'], response['data']['BUY'])
        return self.parse_orders(orders, market, since, limit)

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        request = {}
        self.load_markets()
        market = self.market(symbol)
        if symbol:
            request['symbol'] = market['id']
        if since:
            request['since'] = since
        if limit:
            request['limit'] = limit
        response = self.privateGetOrderDealt(self.extend(request, params))
        return self.parse_orders(response['data']['datas'], market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type != 'limit':
            raise ExchangeError(self.id + ' allows limit orders only')
        self.load_markets()
        market = self.market(symbol)
        order = {
            'symbol': market['id'],
            'type': side.upper(),
            'price': self.price_to_precision(symbol, price),
            'amount': self.amount_to_precision(symbol, amount),
        }
        response = self.privatePostOrder(self.extend(order, params))
        return {
            'info': response,
            'id': self.safe_string(response['data'], 'orderOid'),
        }

    def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder requires symbol argument')
        self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'orderOid': id,
        }
        if 'type' in params:
            request['type'] = params['type'].upper()
        else:
            raise ExchangeError(self.id + ' cancelOrder requires type(BUY or SELL) param')
        response = self.privatePostCancelOrder(self.extend(request, params))
        return response

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['datetime']
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            symbol = ticker['coinType'] + '/' + ticker['coinTypePair']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'buy'),
            'ask': self.safe_float(ticker, 'sell'),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'lastDealPrice'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'vol'),
            'quoteVolume': self.safe_float(ticker, 'volValue'),
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        response = self.publicGetMarketOpenSymbols(params)
        tickers = response['data']
        result = {}
        for t in range(0, len(tickers)):
            ticker = self.parse_ticker(tickers[t])
            symbol = ticker['symbol']
            result[symbol] = ticker
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetOpenTick(self.extend({
            'symbol': market['id'],
        }, params))
        ticker = response['data']
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = trade[0]
        side = None
        if trade[1] == 'BUY':
            side = 'buy'
        elif trade[1] == 'SELL':
            side = 'sell'
        return {
            'id': None,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': trade[2],
            'amount': trade[3],
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetOpenDealOrders(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response['data'], market, since, limit)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1d', since=None, limit=None):
        timestamp = self.parse8601(ohlcv['T'])
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ]

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        to = self.seconds()
        request = {
            'symbol': market['id'],
            'type': self.timeframes[timeframe],
            'from': to - 86400,
            'to': to,
        }
        if since:
            request['from'] = int(since / 1000)
        # limit is not documented in api call, and not respected
        if limit:
            request['limit'] = limit
        response = self.publicGetOpenChartHistory(self.extend(request, params))
        # we need buildOHLCV
        return self.parse_ohlcvs(response['data'], market, timeframe, since, limit)

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        endpoint = '/' + self.version + '/' + self.implode_params(path, params)
        url = self.urls['api'] + endpoint
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            # their nonce is always a calibrated synched milliseconds-timestamp
            nonce = self.milliseconds()
            queryString = ''
            nonce = str(nonce)
            if query:
                queryString = self.rawencode(self.keysort(query))
                if method == 'GET':
                    url += '?' + queryString
                else:
                    body = queryString
            auth = endpoint + '/' + nonce + '/' + queryString
            payload = base64.b64encode(self.encode(auth))
            # payload should be "encoded" as returned from stringToBase64
            signature = self.hmac(payload, self.encode(self.secret), hashlib.sha256)
            headers = {
                'KC-API-KEY': self.apiKey,
                'KC-API-NONCE': nonce,
                'KC-API-SIGNATURE': signature,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body):
        if code >= 400:
            if body and(body[0] == "{"):
                response = json.loads(body)
                if 'success' in response:
                    if not response['success']:
                        if 'code' in response:
                            if response['code'] == 'UNAUTH':
                                message = self.safe_string(response, 'msg')
                                if message == 'Invalid nonce':
                                    raise InvalidNonce(self.id + ' ' + message)
                                raise AuthenticationError(self.id + ' ' + self.json(response))
                        raise ExchangeError(self.id + ' ' + self.json(response))
            else:
                raise ExchangeError(self.id + ' ' + str(code) + ' ' + reason)

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        return response
