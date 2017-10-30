# -*- coding: utf-8 -*-

from ccxt import asia

class btcbox (asia):

    def describe(self):
        return self.deep_extend(super(btcbox, self).describe(), {
            'id': 'btcbox',
            'name': 'BtcBox',
            'countries': 'JP',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': False,
            'hasFetchOHLCV': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg',
                'api': 'https://www.btcbox.co.jp/api',
                'www': 'https://www.btcbox.co.jp/',
                'doc': 'https://www.btcbox.co.jp/help/asm',
            },
            'markets': {
                'BTC/JPY': {'id': 'BTC/JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY'},
            },
        })
