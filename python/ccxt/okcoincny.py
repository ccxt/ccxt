# -*- coding: utf-8 -*-

from ccxt.okcoinusd import okcoinusd


class okcoincny (okcoinusd):

    def describe(self):
        return self.deep_extend(super(okcoincny, self).describe(), {
            'id': 'okcoincny',
            'name': 'OKCoin CNY',
            'countries': 'CN',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
                'api': {
                    'web': 'https://www.okcoin.cn',
                    'public': 'https://www.okcoin.cn/pai',
                    'private': 'https://www.okcoin.cn/api',
                },
                'www': 'https://www.okcoin.cn',
                'doc': 'https://www.okcoin.cn/rest_getStarted.html',
            },
            'markets': {
                'BTC/CNY': {'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'spot', 'spot': True, 'future': False},
                'LTC/CNY': {'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'spot', 'spot': True, 'future': False},
                'ETH/CNY': {'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', 'type': 'spot', 'spot': True, 'future': False},
                'ETC/CNY': {'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY', 'type': 'spot', 'spot': True, 'future': False},
                'BCH/CNY': {'id': 'bcc_cny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY', 'type': 'spot', 'spot': True, 'future': False},
            },
        })
