# -*- coding: utf-8 -*-

from ccxt.btcturk import btcturk


class btcexchange (btcturk):

    def describe(self):
        return self.deep_extend(super(btcexchange, self).describe(), {
            'id': 'btcexchange',
            'name': 'BTCExchange',
            'countries': 'PH',  # Philippines
            'rateLimit': 1500,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
                'api': 'https://www.btcexchange.ph/api',
                'www': 'https://www.btcexchange.ph',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'markets': {
                'BTC/PHP': {'id': 'BTC/PHP', 'symbol': 'BTC/PHP', 'base': 'BTC', 'quote': 'PHP'},
            },
        })
