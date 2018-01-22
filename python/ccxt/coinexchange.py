# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import math
from ccxt.base.errors import ExchangeError


class coinexchange (Exchange):

    def describe(self):
        return self.deep_extend(super(coinexchange, self).describe(), {
            'id': 'coinexchange',
            'name': 'CoinExchange',
            'countries': ['IN', 'JP', 'KR', 'VN', 'US'],
            'rateLimit': 1000,
            # new metainfo interface
            'has': {
                'privateAPI': False,
                'fetchTrades': False,
                'fetchCurrencies': True,
                'fetchTickers': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34842303-29c99fca-f71c-11e7-83c1-09d900cb2334.jpg',
                'api': 'https://www.coinexchange.io/api/v1',
                'www': 'https://www.coinexchange.io',
                'doc': 'https://coinexchangeio.github.io/slate/',
                'fees': 'https://www.coinexchange.io/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'getcurrency',
                        'getcurrencies',
                        'getmarkets',
                        'getmarketsummaries',
                        'getmarketsummary',
                        'getorderbook',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0015,
                    'taker': 0.0015,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        })

    def common_currency_code(self, currency):
        return currency

    def fetch_currencies(self, params={}):
        currencies = self.publicGetCurrencies(params)
        precision = self.precision['amount']
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['CurrencyID']
            code = self.common_currency_code(currency['TickerCode'])
            active = currency['WalletStatus'] == 'online'
            status = 'ok'
            if not active:
                status = 'disabled'
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['Name'],
                'active': active,
                'status': status,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': None,
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
                        'max': math.pow(10, precision),
                    },
                },
                'info': currency,
            }
        return result

    def fetch_markets(self):
        markets = self.publicGetMarkets()
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['MarketID']
            base = self.common_currency_code(market['MarketAssetCode'])
            quote = self.common_currency_code(market['BaseCurrencyCode'])
            symbol = base + '/' + quote
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': True,
                'lot': None,
                'info': market,
            })
        return result

    def parse_ticker(self, ticker, market=None):
        if not market:
            marketId = ticker['MarketID']
            market = self.marketsById[marketId]
        symbol = None
        if market:
            symbol = market['symbol']
        timestamp = self.milliseconds()
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['HighPrice']),
            'low': float(ticker['LowPrice']),
            'bid': float(ticker['BidPrice']),
            'ask': float(ticker['AskPrice']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['LastPrice']),
            'change': float(ticker['Change']),
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float(ticker['Volume']),
            'info': ticker,
        }

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        ticker = self.publicGetMarketsummary(self.extend({
            'market_id': market['id'],
        }, params))
        return self.parse_ticker(ticker, market)

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        tickers = self.publicGetMarketsummaries(params)
        result = {}
        for i in range(0, len(tickers)):
            ticker = self.parse_ticker(tickers[i])
            symbol = ticker['symbol']
            result[symbol] = ticker
        return result

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        orderbook = self.publicGetOrderbook(self.extend({
            'market_id': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook, None, 'BuyOrders', 'SellOrders', 'Price', 'Quantity')

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + path
        if api == 'public':
            params = self.urlencode(params)
            if len(params):
                url += '?' + params
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        success = self.safe_integer(response, 'success')
        if success != 1:
            raise ExchangeError(response['message'])
        return response['result']
