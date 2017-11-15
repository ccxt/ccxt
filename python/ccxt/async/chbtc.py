# -*- coding: utf-8 -*-

from ccxt.async.zb import zb


class chbtc (zb):

    def describe(self):
        return self.deep_extend(super(chbtc, self).describe(), {
            'id': 'chbtc',
            'name': 'CHBTC',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': False,
            'hasFetchOrder': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api': {
                    'public': 'http://api.chbtc.com/data',  # no https for public API
                    'private': 'https://trade.chbtc.com/api',
                },
                'www': 'https://trade.chbtc.com/api',
                'doc': 'https://www.chbtc.com/i/developer',
            },
            'markets': {
                'BTC/CNY': {'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY'},
                'LTC/CNY': {'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY'},
                'ETH/CNY': {'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY'},
                'ETC/CNY': {'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY'},
                'BTS/CNY': {'id': 'bts_cny', 'symbol': 'BTS/CNY', 'base': 'BTS', 'quote': 'CNY'},
                # 'EOS/CNY': {'id': 'eos_cny', 'symbol': 'EOS/CNY', 'base': 'EOS', 'quote': 'CNY'},
                'BCH/CNY': {'id': 'bcc_cny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY'},
                'HSR/CNY': {'id': 'hsr_cny', 'symbol': 'HSR/CNY', 'base': 'HSR', 'quote': 'CNY'},
                'QTUM/CNY': {'id': 'qtum_cny', 'symbol': 'QTUM/CNY', 'base': 'QTUM', 'quote': 'CNY'},
            },
        })
