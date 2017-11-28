# -*- coding: utf-8 -*-

from ccxt.async.liqui import liqui
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
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

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if not response['success']:
                if response['error'] == 'no orders':
                    return response  # a refix for  #489
                elif response['error'].find('Not enougth') >= 0:  # not enougTh is a typo inside Liqui's own API...
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                elif response['error'] == 'Requests too often':
                    raise DDoSProtection(self.id + ' ' + self.json(response))
                elif (response['error'] == 'not available') or (response['error'] == 'external service unavailable'):
                    raise DDoSProtection(self.id + ' ' + self.json(response))
                else:
                    raise ExchangeError(self.id + ' ' + self.json(response))
        return response
