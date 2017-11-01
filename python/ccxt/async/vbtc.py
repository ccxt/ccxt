# -*- coding: utf-8 -*-

from ccxt.async.foxbit import foxbit


class vbtc (foxbit):

    def describe(self):
        return self.deep_extend(super(vbtc, self).describe(), {
            'id': 'vbtc',
            'name': 'VBTC',
            'countries': 'VN',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://vbtc.exchange',
                'doc': 'https://blinktrade.com/docs',
            },
        })
