# -*- coding: utf-8 -*-

from ccxt.async.ws.base.exchange import Exchange

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import InsufficientFunds


class bitfinex (Exchange):

    def describe(self):
        return self.deep_extend(super(bitfinex, self).describe(), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': 'US',
            'version': 'v1',
            'rateLimit': 1500,
            'hasCORS': False,
            # old metainfo interface
            'hasFetchOrder': True,
            'hasFetchTickers': True,
            'hasDeposit': True,
            'hasWithdraw': True,
            'hasFetchOHLCV': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            # new metainfo interface
            'has': {
                'fetchOHLCV': True,
                'fetchTickers': True,
                'fetchOrder': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'withdraw': True,
                'deposit': True,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': 'https://bitfinex.readme.io/v1/docs',
                'ws': 'wss://api.bitfinex.com/ws',
            },
            'api': {
                'public': {
                    'order_book': {
                        'event': 'subscribe',
                        'channel': 'book',
                        'pair': 'pair',
                        'prec': 'P0',
                        'freq': 'F0',
                    },
                    'raw_oder_book': {
                        'event': 'subscribe',
                        'channel': 'book',
                        'pair': 'pair',
                        'prec': 'R0',
                    },
                    'trades': {
                        'event': 'subscribe',
                        'channel': 'trades',
                        'pair': 'pair',
                    },
                    'ticker': {
                        'event': 'subscribe',
                        'channel': 'ticker',
                        'pair': 'pair',
                    },
                },
            },
            'markets': {
                'BTC/USD': {'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'LTC/USD': {'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD'},
                'LTC/BTC': {'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'ETH/USD': {'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD'},
                'ETH/BTC': {'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                'ETC/USD': {'id': 'ETCUSD', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD'},
                'ETC/BTC': {'id': 'ETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC'},
                'BFX/USD': {'id': 'BFXUSD', 'symbol': 'BFX/USD', 'base': 'BFX', 'quote': 'USD'},
                'BFX/BTC': {'id': 'BFXBTC', 'symbol': 'BFX/BTC', 'base': 'BFX', 'quote': 'BTC'},
                'RRT/USD': {'id': 'RRTUSD', 'symbol': 'RRT/USD', 'base': 'RRT', 'quote': 'USD'},
                'RRT/BTC': {'id': 'RRTBTC', 'symbol': 'RRT/BTC', 'base': 'RRT', 'quote': 'BTC'},
                'ZEC/USD': {'id': 'ZECUSD', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USD'},
                'ZEC/BTC': {'id': 'ZECBTC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC'}
            },
        })
