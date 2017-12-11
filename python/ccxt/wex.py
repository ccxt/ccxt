# -*- coding: utf-8 -*-

from ccxt.liqui import liqui
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import OrderNotFound
from ccxt.base.errors import DDoSProtection


class wex (liqui):

    def describe(self):
        return self.deep_extend(super(wex, self).describe(), {
            'id': 'wex',
            'name': 'WEX',
            'countries': 'NZ',  # New Zealand
            'version': '3',
            'hasFetchTickers': True,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg',
                'api': {
                    'public': 'https://wex.nz/api',
                    'private': 'https://wex.nz/tapi',
                },
                'www': 'https://wex.nz',
                'doc': [
                    'https://wex.nz/api/3/docs',
                    'https://wex.nz/tapi/docs',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
        })

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['updated'] * 1000
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'sell'),
            'ask': self.safe_float(ticker, 'buy'),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'last'),
            'change': None,
            'percentage': None,
            'average': self.safe_float(ticker, 'avg'),
            'baseVolume': self.safe_float(ticker, 'vol_cur'),
            'quoteVolume': self.safe_float(ticker, 'vol'),
            'info': ticker,
        }

    def handle_errors(self, code, reason, url, method, headers, body):
        if code == 200:
            if body[0] != '{':
                # response is not JSON
                raise ExchangeError(self.id + ' returned a non-JSON reply: ' + body)
            response = json.loads(body)
            if 'success' in response:
                if not response['success']:
                    error = self.safe_value(response, 'error')
                    if not error:
                        raise ExchangeError(self.id + ' returned a malformed error: ' + body)
                    elif error == 'bad status':
                        raise OrderNotFound(self.id + ' ' + error)
                    elif error.find('It is not enough') >= 0:
                        raise InsufficientFunds(self.id + ' ' + error)
                    elif error == 'Requests too often':
                        raise DDoSProtection(self.id + ' ' + error)
                    elif error == 'not available':
                        raise DDoSProtection(self.id + ' ' + error)
                    elif error == 'external service unavailable':
                        raise DDoSProtection(self.id + ' ' + error)
                    # that's what fetchOpenOrders return if no open orders(fix for  #489)
                    elif error != 'no orders':
                        raise ExchangeError(self.id + ' ' + error)

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        return self.fetch2(path, api, method, params, headers, body)
