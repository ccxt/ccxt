# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import math
from ccxt.base.errors import ExchangeError


class coinmarketcap (Exchange):

    def describe(self):
        return self.deep_extend(super(coinmarketcap, self).describe(), {
            'id': 'coinmarketcap',
            'name': 'CoinMarketCap',
            'rateLimit': 10000,
            'version': 'v1',
            'countries': 'US',
            'hasCORS': True,
            'hasPrivateAPI': False,
            'hasCreateOrder': False,
            'hasCancelOrder': False,
            'hasFetchBalance': False,
            'hasFetchOrderBook': False,
            'hasFetchTrades': False,
            'hasFetchTickers': True,
            'hasFetchCurrencies': True,
            'has': {
                'fetchCurrencies': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api': 'https://api.coinmarketcap.com',
                'www': 'https://coinmarketcap.com',
                'doc': 'https://coinmarketcap.com/api',
            },
            'requiredCredentials': {
                'apiKey': False,
                'secret': False,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/',
                        'ticker/{id}/',
                        'global/',
                    ],
                },
            },
            'currencyCodes': [
                'AUD',
                'BRL',
                'CAD',
                'CHF',
                'CNY',
                'EUR',
                'GBP',
                'HKD',
                'IDR',
                'INR',
                'JPY',
                'KRW',
                'MXN',
                'RUB',
                'USD',
            ],
        })

    def fetch_order_book(self, symbol, params={}):
        raise ExchangeError('Fetching order books is not supported by the API of ' + self.id)

    def fetch_markets(self):
        markets = self.publicGetTicker({
            'limit': 0,
        })
        result = []
        for p in range(0, len(markets)):
            market = markets[p]
            currencies = self.currencyCodes
            for i in range(0, len(currencies)):
                quote = currencies[i]
                quoteId = quote.lower()
                base = market['symbol']
                baseId = market['id']
                symbol = base + '/' + quote
                id = baseId + '/' + quote
                result.append({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                })
        return result

    def fetch_global(self, currency='USD'):
        self.load_markets()
        request = {}
        if currency:
            request['convert'] = currency
        return self.publicGetGlobal(request)

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        if 'last_updated' in ticker:
            if ticker['last_updated']:
                timestamp = int(ticker['last_updated']) * 1000
        change = None
        if 'percent_change_24h' in ticker:
            if ticker['percent_change_24h']:
                change = self.safe_float(ticker, 'percent_change_24h')
        last = None
        symbol = None
        volume = None
        if market:
            priceKey = 'price_' + market['quoteId']
            if priceKey in ticker:
                if ticker[priceKey]:
                    last = self.safe_float(ticker, priceKey)
            symbol = market['symbol']
            volumeKey = '24h_volume_' + market['quoteId']
            if volumeKey in ticker:
                if ticker[volumeKey]:
                    volume = self.safe_float(ticker, volumeKey)
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': None,
            'low': None,
            'bid': None,
            'ask': None,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': last,
            'change': change,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': volume,
            'info': ticker,
        }

    def fetch_tickers(self, currency='USD', params={}):
        self.load_markets()
        request = {
            'limit': 10000,
        }
        if currency:
            request['convert'] = currency
        response = self.publicGetTicker(self.extend(request, params))
        tickers = {}
        for t in range(0, len(response)):
            ticker = response[t]
            id = ticker['id'] + '/' + currency
            symbol = id
            market = None
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
            tickers[symbol] = self.parse_ticker(ticker, market)
        return tickers

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = self.extend({
            'convert': market['quote'],
            'id': market['baseId'],
        }, params)
        response = self.publicGetTickerId(request)
        ticker = response[0]
        return self.parse_ticker(ticker, market)

    def fetch_currencies(self, params={}):
        currencies = self.publicGetTicker(self.extend({
            'limit': 0
        }, params))
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['symbol']
            # todo: will need to rethink the fees
            # to add support for multiple withdrawal/deposit methods and
            # differentiated fees for each particular method
            precision = 8  # default precision, todo: fix "magic constants"
            code = self.common_currency_code(id)
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': True,
                'status': 'ok',
                'fee': None,  # todo: redesign
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
                        'min': None,
                        'max': None,
                    },
                },
            }
        return result

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if query:
            url += '?' + self.urlencode(query)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            if response['error']:
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
