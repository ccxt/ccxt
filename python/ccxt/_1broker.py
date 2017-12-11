# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError


class _1broker (Exchange):

    def describe(self):
        return self.deep_extend(super(_1broker, self).describe(), {
            'id': '_1broker',
            'name': '1Broker',
            'countries': 'US',
            'rateLimit': 1500,
            'version': 'v2',
            'hasPublicAPI': False,
            'hasCORS': True,
            'hasFetchTrades': False,
            'hasFetchOHLCV': True,
            'timeframes': {
                '1m': '60',
                '15m': '900',
                '1h': '3600',
                '1d': '86400',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg',
                'api': 'https://1broker.com/api',
                'www': 'https://1broker.com',
                'doc': 'https://1broker.com/?c=en/content/api-documentation',
            },
            'requiredCredentials': {
                'apiKey': True,
                'secret': False,
            },
            'api': {
                'private': {
                    'get': [
                        'market/bars',
                        'market/categories',
                        'market/details',
                        'market/list',
                        'market/quotes',
                        'market/ticks',
                        'order/cancel',
                        'order/create',
                        'order/open',
                        'position/close',
                        'position/close_cancel',
                        'position/edit',
                        'position/history',
                        'position/open',
                        'position/shared/get',
                        'social/profile_statistics',
                        'social/profile_trades',
                        'user/bitcoin_deposit_address',
                        'user/details',
                        'user/overview',
                        'user/quota_status',
                        'user/transaction_log',
                    ],
                },
            },
        })

    def fetch_categories(self):
        response = self.privateGetMarketCategories()
        # they return an empty string among their categories, wtf?
        categories = response['response']
        result = []
        for i in range(0, len(categories)):
            if categories[i]:
                result.append(categories[i])
        return result

    def fetch_markets(self):
        self_ = self  # workaround for Babel bug(not passing `self` to _recursive() call)
        categories = self.fetch_categories()
        result = []
        for c in range(0, len(categories)):
            category = categories[c]
            markets = self_.privateGetMarketList({
                'category': category.lower(),
            })
            for p in range(0, len(markets['response'])):
                market = markets['response'][p]
                id = market['symbol']
                symbol = None
                base = None
                quote = None
                if (category == 'FOREX') or (category == 'CRYPTO'):
                    symbol = market['name']
                    parts = symbol.split('/')
                    base = parts[0]
                    quote = parts[1]
                else:
                    base = id
                    quote = 'USD'
                    symbol = base + '/' + quote
                base = self_.common_currency_code(base)
                quote = self_.common_currency_code(quote)
                result.append({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        balance = self.privateGetUserOverview()
        response = balance['response']
        result = {
            'info': response,
        }
        currencies = list(self.currencies.keys())
        for c in range(0, len(currencies)):
            currency = currencies[c]
            result[currency] = self.account()
        total = float(response['balance'])
        result['BTC']['free'] = total
        result['BTC']['total'] = total
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        response = self.privateGetMarketQuotes(self.extend({
            'symbols': self.market_id(symbol),
        }, params))
        orderbook = response['response'][0]
        timestamp = self.parse8601(orderbook['updated'])
        bidPrice = float(orderbook['bid'])
        askPrice = float(orderbook['ask'])
        bid = [bidPrice, None]
        ask = [askPrice, None]
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'bids': [bid],
            'asks': [ask],
        }

    def fetch_trades(self, symbol):
        raise ExchangeError(self.id + ' fetchTrades() method not implemented yet')

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        result = self.privateGetMarketBars(self.extend({
            'symbol': self.market_id(symbol),
            'resolution': 60,
            'limit': 1,
        }, params))
        orderbook = self.fetch_order_book(symbol)
        ticker = result['response'][0]
        timestamp = self.parse8601(ticker['date'])
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['h']),
            'low': float(ticker['l']),
            'bid': orderbook['bids'][0][0],
            'ask': orderbook['asks'][0][0],
            'vwap': None,
            'open': float(ticker['o']),
            'close': float(ticker['c']),
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': None,
            'info': ticker,
        }

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            self.parse8601(ohlcv['date']),
            float(ohlcv['o']),
            float(ohlcv['h']),
            float(ohlcv['l']),
            float(ohlcv['c']),
            None,
        ]

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'resolution': self.timeframes[timeframe],
        }
        if since:
            request['date_start'] = self.iso8601(since)  # they also support date_end
        if limit:
            request['limit'] = limit
        result = self.privateGetMarketBars(self.extend(request, params))
        return self.parse_ohlcvs(result['response'], market, timeframe, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        order = {
            'symbol': self.market_id(symbol),
            'margin': amount,
            'direction': 'short' if (side == 'sell') else 'long',
            'leverage': 1,
            'type': side,
        }
        if type == 'limit':
            order['price'] = price
        else:
            order['type'] += '_market'
        result = self.privateGetOrderCreate(self.extend(order, params))
        return {
            'info': result,
            'id': result['response']['order_id'],
        }

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        return self.privatePostOrderCancel({'order_id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        self.check_required_credentials()
        url = self.urls['api'] + '/' + self.version + '/' + path + '.php'
        query = self.extend({'token': self.apiKey}, params)
        url += '?' + self.urlencode(query)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'warning' in response:
            if response['warning']:
                raise ExchangeError(self.id + ' ' + self.json(response))
        if 'error' in response:
            if response['error']:
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
