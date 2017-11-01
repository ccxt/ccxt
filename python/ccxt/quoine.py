# -*- coding: utf-8 -*-

from ccxt.qryptos import qryptos


class quoine (qryptos):

    def describe(self):
        return self.deep_extend(super(quoine, self).describe(), {
            'id': 'quoine',
            'name': 'QUOINE',
            'countries': ['JP', 'SG', 'VN'],
            'version': '2',
            'rateLimit': 1000,
            'hasFetchTickers': True,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
                'api': 'https://api.quoine.com',
                'www': 'https://www.quoine.com',
                'doc': 'https://developers.quoine.com',
            },
        })
